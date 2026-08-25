/* Open every lesson in jsdom and tap all the way through it.

   Proves: all 55 skills have a lesson; every screen renders with real content
   and a way forward; the worked example reveals every step and ends on the
   answer; finishing marks the skill taught and closing early does not. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '../..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://crislyntony.com/half-yearly.html'
});
const w = dom.window, d = w.document;

w.speechSynthesis = { speak(){}, cancel(){}, getVoices(){ return []; }, set onvoiceschanged(v){} };
w.SpeechSynthesisUtterance = function(){};
w.State = { addStars(){}, addSticker(){} };
w.alert = m => { throw new Error('alert: ' + m); };
w.confirm = () => true;
w.scrollTo = () => {};
w.HTMLElement.prototype.scrollIntoView = function(){};
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
}});

const errors = [];
w.addEventListener('error', e => errors.push('window error: ' + e.message));

['data/hy-skills.js','js/hy-engine.js','data/hy-maths.js','data/hy-english.js','data/hy-hindi.js',
 'data/hy-lessons.js','data/hy-lessons-maths.js','data/hy-lessons-english.js','data/hy-lessons-hindi.js',
 'js/hy-ui.js','js/hy-learn.js']
  .forEach(f => w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));

const HY = w.HY, SK = w.HY_SKILLS, LS = w.HY_LESSONS, Learn = w.HYLearn;
const all = s => Array.from(d.querySelectorAll(s));
const bad = m => errors.push(m);
const text = () => (d.querySelector('.hy-learn .hy-body') || {}).textContent || '';

const skills = SK.list.filter(s => HY.hasContent(s.id));

/* ---- 1. every skill has a hand-written lesson, not just the fallback ---- */
const noLesson = skills.filter(s => !LS.has(s.id));
if (noLesson.length) bad(noLesson.length + ' skills fall back to their "Show me" card: ' + noLesson.map(s => s.id).join(' '));

/* ---- 2. tap through every one of them ---------------------------------- */
let screens = 0, workedSteps = 0, traps = 0, hindi = 0;

skills.forEach(sk => {
  const lesson = LS.get(sk.id);
  let done = false;
  Learn.open(sk.id, { onDone: () => { done = true; } });

  const root = d.querySelector('.hy-learn');
  if (!root || root.style.display !== 'flex') { bad(sk.id + ': lesson did not open'); return; }
  if (lesson.lang === 'hi') {
    if (!d.querySelector('.hy-learn .hy-card.hy-hi')) bad(sk.id + ': हिंदी lesson is not using the Devanagari card');
    hindi++;
  }

  let guard = 0, sawWorked = false, sawTrap = false, sawAnswer = false;
  while (root.style.display === 'flex') {
    if (guard++ > 80) { bad(sk.id + ': lesson never finished (80 taps)'); break; }
    screens++;

    const body = d.querySelector('.hy-learn .hy-body');
    if (!body || body.textContent.trim().length < 8) bad(sk.id + ': a lesson screen is empty');
    if (/undefined|\[object/.test(body.textContent)) bad(sk.id + ': lesson screen has an unresolved value');

    if (d.querySelector('.hy-learn .hy-work')) {
      sawWorked = true;
      workedSteps = Math.max(workedSteps, all('.hy-learn .hy-work-step').length);
      if (d.querySelector('.hy-learn .hy-work-answer')) sawAnswer = true;
    }
    if (d.querySelector('.hy-learn .hy-watch-big')) sawTrap = true;

    const btns = all('.hy-learn .hy-foot .hy-btn');
    if (!btns.length) { bad(sk.id + ': a lesson screen has no way forward'); break; }
    // "Not just now" closes without launching the drill
    const later = btns.find(b => /Not just now|अभी नहीं/.test(b.textContent));
    (later || btns[btns.length - 1]).click();
  }

  if (lesson.worked && !sawWorked) bad(sk.id + ': the worked example never appeared');
  if (lesson.worked && !sawAnswer) bad(sk.id + ': the worked example never reached its answer');
  if (lesson.trap) { if (!sawTrap) bad(sk.id + ': the trap card never appeared'); else traps++; }
  if (!HY.isTaught(sk.id)) bad(sk.id + ': finishing the lesson did not mark it taught');
  if (!done) bad(sk.id + ': onDone was never called');
});

console.log('lessons opened: ' + skills.length + ' (' + hindi + ' in हिंदी)');
console.log('screens tapped through: ' + screens + ' · trap cards shown: ' + traps +
  ' · longest worked example: ' + workedSteps + ' steps');

/* ---- 3. every worked step is revealed one at a time -------------------- */
HY.reset();
Learn.open('M8', { onDone(){} });
let counts = [];
let g = 0;
while (d.querySelector('.hy-learn').style.display === 'flex' && g++ < 80) {
  if (d.querySelector('.hy-learn .hy-work')) counts.push(all('.hy-learn .hy-work-step').length);
  const btns = all('.hy-learn .hy-foot .hy-btn');
  const later = btns.find(b => /Not just now/.test(b.textContent));
  (later || btns[btns.length - 1]).click();
}
const expected = LS.get('M8').worked.steps.length;
if (counts.join(',') !== Array.from({ length: expected }, (_, i) => i + 1).join(','))
  bad('M8 worked example did not reveal one step at a time: saw [' + counts.join(',') + '], expected 1..' + expected);
else console.log('worked example reveals one step per tap: ' + counts.join(' → '));

/* ---- 4. closing early must NOT count as taught ------------------------- */
HY.reset();
let closed = false;
Learn.open('M5', { onDone(){}, onClose: () => { closed = true; } });
d.querySelector('.hy-learn .hy-x').click();
if (HY.isTaught('M5')) bad('closing a lesson early still marked it taught');
if (!closed) bad('closing a lesson early did not call onClose');
console.log('closing early leaves the skill untaught ✓');

/* ---- 5. and the drill then still teaches it ---------------------------- */
if (!w.HYStage.needsLesson('M5')) bad('the drill would have quizzed M5 without teaching it');

/* ---- 6. no session mode may smuggle in an untaught skill ---------------- */
/* The gate can only teach a handful per sitting, so the SCHEDULER must not
   hand it more than that: reviews, warm top-ups, weak spots and the padding
   pass all have to stay inside what she has already been taught. */
HY.reset();
const seeded = ['M1', 'M2', 'M3', 'E1', 'E2', 'H3'];
seeded.forEach(id => { HY.markTaught(id); HY.record(id, true); });

[['daily', 25], ['daily', 40], ['weak', 18], ['subject', 20]].forEach(([mode, target]) => {
  const opts = { mode: mode, target: target, seed: 'gate-' + mode + target };
  if (mode === 'subject') opts.subject = 'maths';
  const q = HY.buildSession(opts);
  const untaught = [...new Set(q.map(i => i.skill))].filter(id => !HY.isTaught(id));
  const budget = mode === 'weak' ? 0 : HY.newCountToday(target, HY.newSkills().length);
  if (untaught.length > budget)
    bad(mode + '/' + target + ': ' + untaught.length + ' untaught skills in the queue but only ' +
      budget + ' lessons are budgeted (' + untaught.slice(0, 8).join(' ') + ')');
  if (untaught.length > 8)
    bad(mode + '/' + target + ': more untaught skills than the drill can teach in one sitting');
});
console.log('every mode stays inside its lesson budget ✓');

if (errors.length) {
  console.log('\n✗ ' + errors.length + ' problems:');
  [...new Set(errors)].slice(0, 25).forEach(e => console.log('   ' + e));
  process.exit(1);
}
console.log('\n✓ every skill has a lesson, and every lesson teaches all the way through');

/* Drive the real drill stage in jsdom, auto-solving every item type.
   Asserts a full session completes with no errors and that a deliberately
   wrong answer triggers the re-injection path. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '../..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://crislyntony.com/half-yearly.html'
});
const w = dom.window, d = w.document;

// stubs the stage expects
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

let errors = [];
w.addEventListener('error', e => errors.push('window error: ' + e.message));

['data/hy-skills.js','js/hy-engine.js','data/hy-maths.js','data/hy-english.js','data/hy-hindi.js',
 'data/hy-lessons.js','data/hy-lessons-maths.js','data/hy-lessons-english.js','data/hy-lessons-hindi.js',
 'js/hy-ui.js','js/hy-learn.js']
  .forEach(f => w.eval(fs.readFileSync(path.join(ROOT,f),'utf8')));

const HY = w.HY, Stage = w.HYStage;
const $ = s => d.querySelector(s);
const all = s => Array.from(d.querySelectorAll(s));
const click = n => { if (!n) throw new Error('click on missing node'); n.click(); };

/* -------- auto-solvers: return true if we deliberately answered wrong ----- */
function solve(item, forceWrong) {
  const t = item.type;
  if (t === 'mcq') {
    const opts = all('.hy-opt');
    const idx = forceWrong ? (item.answer + 1) % opts.length : item.answer;
    click(opts[idx]);
  } else if (t === 'tf') {
    const opts = all('.hy-opt');
    const want = item.answer ? 0 : 1;
    click(opts[forceWrong ? 1 - want : want]);
  } else if (t === 'fill') {
    $('.hy-input').value = forceWrong ? '@@nope@@' : String(item.answer);
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'steps') {
    all('.hy-input').forEach((inp,i) => { inp.value = forceWrong ? '@@' : String(item.steps[i].answer); });
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'order' || t === 'build') {
    const tiles = all('.hy-tiles .hy-tile');
    const order = forceWrong ? item.answer.slice().reverse() : item.answer;
    order.forEach(v => {
      const b = tiles.find(x => x.textContent === v && !x.disabled);
      if (!b) throw new Error('order: no tile for "' + v + '" in [' + tiles.map(x=>x.textContent) + ']');
      click(b);
    });
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'match') {
    const L = all('.hy-match-col:first-child .hy-match-item');
    const Rr = all('.hy-match-right');
    item.pairs.forEach((p, i) => {
      click(L.find(x => x.dataset.v === p[0]));
      const wantRight = forceWrong ? item.pairs[(i+1) % item.pairs.length][1] : p[1];
      click(Rr.find(x => x.dataset.v === wantRight && !x.disabled) || Rr.find(x => !x.disabled));
    });
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'sort') {
    const home = {};
    item.buckets.forEach(b => b.items.forEach(i => { home[i] = b.name; }));
    const names = item.buckets.map(b => b.name);
    let guard = 0;
    while (all('.hy-tiles .hy-tile').length && guard++ < 60) {
      const tile = all('.hy-tiles .hy-tile')[0];
      const v = tile.textContent;
      click(tile);
      const want = forceWrong ? names.find(n => n !== home[v]) || home[v] : home[v];
      click(all('.hy-bucket-head').find(h => h.textContent === want));
    }
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'passage') {
    const q = item.questions[item._qi || 0];
    $('.hy-passage-q .hy-input').value = forceWrong ? '@@' : String(q.answer);
    click(all('.hy-stage .hy-foot .hy-btn').pop());
  } else if (t === 'write') {
    click(all('.hy-stage .hy-foot .hy-btn').pop());              // reveal model
    const btns = all('.hy-stage .hy-foot .hy-btn');
    click(forceWrong ? btns[1] : btns[0]);
  } else {
    throw new Error('no solver for type ' + t);
  }
}

/* --- the drill teaches an untaught skill before asking about it: click through --- */
let lessonsSeen = 0;
function clearLesson() {
  let guard = 0;
  while (d.querySelector('.hy-learn') && d.querySelector('.hy-learn').style.display === 'flex') {
    if (guard++ > 80) { errors.push('lesson did not finish after 80 taps'); break; }
    const b = all('.hy-learn .hy-foot .hy-btn').pop();
    if (!b) { errors.push('lesson screen with no button'); break; }
    if (guard === 1) lessonsSeen++;
    click(b);
  }
}

/* ------------------------------- run sessions ---------------------------- */
const seenTypes = {};
function runSession(opts, wrongEvery) {
  Stage.start(opts);
  click(all('.hy-stage .hy-foot .hy-btn').pop());     // Start →
  clearLesson();
  let guard = 0;
  while (guard++ < 900) {
    clearLesson();
    if (Stage.idx >= Stage.queue.length) break;
    const item = Stage.queue[Stage.idx];
    seenTypes[item.type] = (seenTypes[item.type] || 0) + 1;
    const wrong = wrongEvery && (guard % wrongEvery === 0);
    const before = Stage.queue.length;
    try { solve(item, wrong); }
    catch (e) { errors.push(`[${item.skill}/${item.type}] ${e.message}`); break; }
    if (wrong && item.type !== 'passage' && Stage.queue.length !== before + 1)
      errors.push(`[${item.skill}/${item.type}] wrong answer did not re-inject`);
    // advance: click Next / Continue in the footer
    const next = all('.hy-stage .hy-foot .hy-btn').pop();
    if (!next) { errors.push('no next button after ' + item.type); break; }
    if (/Done for now|One more round/.test(next.textContent)) break;
    click(next);
    if (d.querySelector('.hy-stats')) break;            // reached the summary
  }
  const done = !!d.querySelector('.hy-stats');
  return { done, guard };
}

console.log('— session 1: all correct, daily mix —');
let r = runSession({ mode: 'daily', target: 30 }, 0);
console.log('  finished summary: ' + r.done + ' (steps ' + r.guard + ')');

console.log('— session 2: every 3rd answer wrong (tests re-injection) —');
Stage.close();
r = runSession({ mode: 'daily', target: 24, seed: 'wrongs' }, 3);
console.log('  finished summary: ' + r.done + ' (steps ' + r.guard + ')');

console.log('— session 3: every skill drilled solo (10 each) —');
Stage.close();
const skills = w.HY_SKILLS.list.filter(s => HY.hasContent(s.id));
skills.forEach(s => {
  Stage.close();
  const res = runSession({ mode: 'skill', skillId: s.id, target: 6 }, 2);
  if (!res.done) errors.push('skill ' + s.id + ' did not reach summary');
});
console.log('  drilled ' + skills.length + ' skills');
console.log('  lessons taught along the way: ' + lessonsSeen);
if (!lessonsSeen) errors.push('no lesson was ever shown before a new skill');
const untaught = w.HY_SKILLS.list.filter(s => HY.hasContent(s.id) && !HY.isTaught(s.id));
if (untaught.length) errors.push(untaught.length + ' skills were drilled without ever being taught: ' +
  untaught.slice(0, 6).map(s => s.id).join(' '));

console.log('\ntypes exercised: ' + JSON.stringify(seenTypes));
if (errors.length) {
  console.log('\n✗ ' + errors.length + ' problems:');
  [...new Set(errors)].slice(0, 25).forEach(e => console.log('   ' + e));
  process.exit(1);
}
console.log('\n✓ UI drove every item type to completion with no errors');

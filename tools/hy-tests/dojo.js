/* Drive the Tables Dojo in jsdom.

   Proves the engine's maths (66 facts, the ladder, every derivation, the
   fold-in ratio, speed-gated fluency) and then plays the real stage with a
   virtual finger: builds arrays, counts in steps, derives facts on the
   keypad, gets one wrong on purpose, and runs a real timed check.

   The stage animates with setTimeout, so the driver is async and waits on
   actual conditions rather than assuming anything lands synchronously. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '../..');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://crislyntony.com/tables-dojo.html'
});
const w = dom.window, d = w.document;
w.speechSynthesis = { speak(){}, cancel(){}, getVoices(){ return []; }, set onvoiceschanged(v){} };
w.SpeechSynthesisUtterance = function(){};
w.State = { addStars(){}, addSticker(){} };
w.Confetti = { launch(){}, burst(){} };
w.alert = m => { throw new Error('alert: ' + m); };
w.confirm = () => true;
w.HTMLElement.prototype.scrollIntoView = function(){};
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
}});

const errors = [];
const bad = m => errors.push(m);
w.addEventListener('error', e => bad('window error: ' + e.message));

['js/tables-dojo.js', 'js/tables-dojo-ui.js']
  .forEach(f => w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));

const T = w.TDojo, S = w.TDojoStage;
const all = s => Array.from(d.querySelectorAll(s));
const $ = s => d.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, label, ms) {
  const limit = ms || 3000;
  const t0 = Date.now();
  while (Date.now() - t0 < limit) {
    if (fn()) return true;
    await sleep(15);
  }
  bad('timed out waiting for ' + label);
  return false;
}
T.init();

/* ---- 1. the fact set and the ladder ------------------------------------ */
if (T.ALL.length !== 66) bad('expected 66 unique facts, got ' + T.ALL.length);
const rungSizes = T.RUNGS.map(r => r.facts.length);
if (rungSizes.join(',') !== '1,2,3,4,5,6,7,8,9,10,11')
  bad('rungs should grow 1..11, got ' + rungSizes.join(','));
const seenFact = {};
T.RUNGS.forEach(r => r.facts.forEach(k => {
  if (seenFact[k]) bad('fact ' + k + ' appears on two rungs');
  seenFact[k] = 1;
  const p = T.parseKey(k);
  const later = Math.max(T.LADDER.indexOf(p.a), T.LADDER.indexOf(p.b));
  if (later !== r.index) bad(k + ' is on rung ' + r.index + ' but needs rung ' + later);
}));
if (Object.keys(seenFact).length !== 66) bad('rungs do not cover every fact');
console.log('facts: ' + T.ALL.length + ' · rungs grow ' + rungSizes.join(','));

/* ---- 2. every derivation reaches the right answer, the easy way -------- */
/* The rule being checked: a fact is always derived with the STRATEGY of
   whichever factor she met earlier. 6 × 7 must be taught as "7 × 5, add one
   more 7" (the sixes method), never as a sevens fact. */
const VIA = {
  2: () => 'doubling',
  10: () => 'a zero on the end',
  5: () => 'half of ten lots',
  4: () => 'double, double',
  3: () => 'double, then one more lot',
  9: () => 'ten lots take one away',
  11: o => (o <= 9 ? 'the twin digits' : 'ten lots and one more'),
  6: () => 'five lots and one more',
  8: () => 'double, double, double',
  7: () => 'five lots and two more',
  12: () => 'ten lots and two lots'
};
let derivSteps = 0;
T.ALL.forEach(k => {
  const p = T.parseKey(k);
  const dv = S.derive(k);
  if (!dv || !dv.steps || !dv.steps.length) { bad(k + ': no derivation'); return; }
  derivSteps += dv.steps.length;
  const last = dv.steps[dv.steps.length - 1].ans;
  if (last !== p.a * p.b) bad(k + ': derivation ends at ' + last + ', should be ' + (p.a * p.b));
  dv.steps.forEach(st => {
    if (typeof st.ans !== 'number' || st.ans <= 0) bad(k + ': bad step answer ' + st.ans);
    if (!st.ask) bad(k + ': step with no question');
  });
  const ia = T.LADDER.indexOf(p.a), ib = T.LADDER.indexOf(p.b);
  if (ia === ib) {
    if (!/× \d+, then one more/.test(dv.via)) bad(k + ': square should lean on one lot less, got "' + dv.via + '"');
  } else {
    const easier = ia < ib ? p.a : p.b;
    const other = ia < ib ? p.b : p.a;
    const want = VIA[easier](other);
    if (dv.via !== want)
      bad(k + ': taught via "' + dv.via + '" but the easier factor is ' + easier + ' → "' + want + '"');
  }
});
console.log('derivations: all 66 land on the right answer via the easier factor · ' +
  derivSteps + ' steps');

/* ---- 3. the fold-in really is mostly-known ------------------------------ */
T.reset();
['2x2','2x10','10x10','2x5','5x10'].forEach(k => { for (let i=0;i<3;i++) T.record(k, undefined, true, 1200); });
if (T.knownFacts().length < 5) bad('seeding did not produce known facts');
const seq = T.foldIn('5x5', { depth: 5, rng: () => 0.5 });
if (seq[0] !== '5x5') bad('the fold-in must open on the new fact');
if (seq.filter(x => x === '5x5').length !== 6)
  bad('expected the new fact 6 times in a depth-5 ladder, got ' + seq.filter(x => x === '5x5').length);
const gaps = []; let prev = -1;
seq.forEach((x, i) => { if (x === '5x5') { if (prev >= 0) gaps.push(i - prev - 1); prev = i; } });
if (gaps.join(',') !== '0,1,2,3,4') bad('fold-in run should grow 0,1,2,3,4 — got ' + gaps.join(','));
const unknownShare = seq.filter(x => x === '5x5').length / seq.length;
if (unknownShare > 0.35) bad('fold-in is ' + Math.round(unknownShare*100) + '% new — too hard');
console.log('fold-in: ' + seq.length + ' cards, gaps ' + gaps.join('/') +
  ', ' + Math.round(unknownShare * 100) + '% new');

/* ---- 4. fluency needs SPEED, not just correctness ---------------------- */
T.reset();
for (let i = 0; i < 8; i++) T.record('7x8', undefined, true, 6000);
if (T.status('7x8') === 3) bad('slow answers should never count as fluent');
if (T.status('7x8') !== 2) bad('correct-but-slow should read as known, got ' + T.status('7x8'));
T.reset();
for (let i = 0; i < 4; i++) T.record('7x8', undefined, true, 900);
if (T.status('7x8') === 3) bad('fluency should need more than one day');
console.log('fluency needs speed AND a second day ✓');

/* ---- 5. play the stage for real ---------------------------------------- */
async function keypad(value) {
  const digits = String(value).split('');
  for (const dg of digits) {
    const key = all('.td-key').find(k => k.textContent === dg);
    if (!key) { bad('keypad has no key "' + dg + '"'); return; }
    key.click();
    await sleep(5);
  }
  await sleep(220);          // the pad checks itself, then hands back
}

async function play(startOpts, keepState) {
  if (!keepState) T.reset();
  let guard = 0, screens = 0, arrays = 0, derived = 0, drilled = 0, missedOnce = false;

  S.start(startOpts || { mode: 'daily' });
  if (!$('.td-stage') || $('.td-stage').style.display !== 'flex') { bad('stage did not open'); return {}; }

  while (guard++ < 300) {
    const stage = $('.td-stage');
    if (!stage || stage.style.display !== 'flex') break;

    /* the timed check is the last thing before the summary — enter it, then
       let a short real run happen below rather than sitting out 60 seconds */
    if ($('.td-clock')) break;
    if ($('.td-hero') && /speed check/i.test(($('.td-card') || {}).textContent || '')) break;

    if ($('.td-array-row')) {                                    // build the array
      arrays++; screens++;
      const rows = all('.td-array-row');
      for (const r of rows) { r.click(); await sleep(5); }
      if (!$('.td-eq.is-on')) bad('array did not complete after every row was tapped');
      const go = all('.td-foot .td-btn').pop();
      if (!go) { bad('array finished with no way forward'); break; }
      go.click(); await sleep(20);
      continue;
    }

    if ($('.td-choices .td-choice')) {                           // skip counting
      screens++;
      let inner = 0;
      while ($('.td-choices .td-choice') && inner++ < 40) {
        const after = Number(($('.td-prompt').textContent.match(/after\s+(\d+)/) || [])[1]);
        const factor = Number(($('.td-sub').textContent.match(/(\d+)s/) || [])[1]);
        const want = after + factor;
        const hit = all('.td-choice').filter(b => !b.disabled)
          .find(b => Number(b.textContent) === want);
        if (!hit) { bad('skip ladder had no correct choice for ' + after + ' + ' + factor); break; }
        hit.click(); await sleep(10);
      }
      if (all('.td-rung-cell.is-got').length === 0) bad('skip ladder filled nothing in');
      const go = all('.td-foot .td-btn').pop();
      if (!go) { bad('skip ladder had no way forward'); break; }
      go.click(); await sleep(20);
      continue;
    }

    if ($('.td-steps') && $('.td-pad')) {                        // derive it
      derived++; screens++;
      const m = $('.td-h').textContent.match(/(\d+) × (\d+)/);
      const dv = S.derive(T.key(Number(m[1]), Number(m[2])));
      for (let si = 0; si < dv.steps.length; si++) {
        if (!$('.td-pad')) { bad('derive screen lost its keypad at step ' + si); break; }
        await keypad(dv.steps[si].ans);
      }
      if (!await until(() => !!$('.td-final'), 'the derived answer')) break;
      const go = all('.td-foot .td-btn').pop();
      if (!go) { bad('derive screen had no way forward'); break; }
      go.click(); await sleep(20);
      continue;
    }

    if ($('.td-bigq') && $('.td-pad')) {                         // the fold-in drill
      const m = $('.td-bigq').textContent.match(/(\d+)\s*×\s*(\d+)/);
      if (!m) { bad('drill question unreadable'); break; }
      const ans = Number(m[1]) * Number(m[2]);
      drilled++;
      if (drilled === 3 && !missedOnce) {                        // miss one on purpose
        missedOnce = true;
        await keypad(ans === 9 ? 8 : String(ans).length === 1 ? 9 : (ans + 1));
        if (!await until(() => /=/.test(($('.td-fb') || {}).textContent || ''),
          'the correction after a wrong answer')) break;
        await keypad(ans);                                       // copy it back
        await sleep(340);
      } else {
        await keypad(ans);
        await sleep(460);
      }
      continue;
    }

    const go = all('.td-foot .td-btn').pop();
    if (!go) { bad('a dojo screen had no way forward'); break; }
    screens++;
    go.click(); await sleep(20);
  }

  return { screens, arrays, derived, drilled, missedOnce };
}

/* ---- 6. and a genuinely timed speed check ------------------------------ */
async function playSpeed() {
  const rightBefore = T.ALL.reduce((n, k) => n + T.fact(k).right, 0);
  S.start({ mode: 'speed', secs: 2 });
  const go = all('.td-foot .td-btn').pop();
  if (!go || !/Go/.test(go.textContent)) { bad('speed check did not offer a start'); return 0; }
  go.click();
  if (!await until(() => !!$('.td-clock'), 'the clock')) return 0;

  let answered = 0, guard = 0;
  while ($('.td-clock') && guard++ < 40) {
    const m = ($('.td-bigq').textContent || '').match(/(\d+)\s*×\s*(\d+)/);
    if (!m) break;
    await keypad(Number(m[1]) * Number(m[2]));
    answered++;
    if (!$('.td-pad')) break;
  }
  if (!await until(() => !!$('.td-bigscore'), 'the speed result', 4000)) return answered;
  const scored = Number($('.td-bigscore').textContent);
  /* One answer may be in flight when the buzzer goes; that one is discarded
     by design, so the score is allowed to trail the driver by exactly one. */
  if (scored !== answered && scored !== answered - 1)
    bad('speed check scored ' + scored + ' but ' + answered + ' were answered');
  if (T.getBest('speed2') === undefined) bad('speed check did not record a best');
  /* A speed check is a CHECK: it must only ask facts she has already met, so
     it should never mark new ground — but it must write results back. */
  const rightAfter = T.ALL.reduce((n, k) => n + T.fact(k).right, 0);
  if (answered > 0 && rightAfter <= rightBefore)
    bad('speed answers were not written back to the facts');
  if (T.report().untouched !== 56)
    bad('the speed check introduced facts she has never been taught');
  return answered;
}

(async () => {
  /* (a) the very first session ever: rung ×2 has exactly one fact and there is
     nothing yet to fold it into. It still has to work. */
  const cold = await play();
  console.log('cold start: ' + cold.screens + ' screens · ' + cold.arrays + ' array · ' +
    cold.derived + ' derived · ' + cold.drilled + ' drill answers');
  if (!cold.arrays) bad('cold start never reached an array-building screen');
  if (!cold.derived) bad('cold start never reached a derivation screen');
  if (T.report().untouched === 66) bad('the first session recorded nothing at all');

  /* (b) a realistic mid-game rung, where the fold-in has knowns to lean on */
  T.reset();
  ['2x2','2x10','10x10','2x4','4x10','2x3','3x10'].forEach(k => {
    for (let i = 0; i < 3; i++) T.record(k, undefined, true, 1100);
  });
  const r = await play({ mode: 'rung', rungId: 'r5' }, true);
  console.log('×5 belt: ' + r.screens + ' screens · ' + r.arrays + ' arrays built · ' +
    r.derived + ' facts derived · ' + r.drilled + ' drill answers' +
    (r.missedOnce ? ' (one missed on purpose)' : ''));
  if (r.arrays < 3) bad('the ×5 belt should build an array for each of its 3 new facts, got ' + r.arrays);
  if (r.derived < 3) bad('the ×5 belt should derive each of its 3 new facts, got ' + r.derived);
  if (r.drilled < 8) bad('the fold-in drill barely ran (' + r.drilled + ' answers)');
  if (!r.missedOnce) bad('never exercised the wrong-answer path');

  const rep = T.report();
  console.log('after the belt: ' + rep.fluent + ' fast · ' + rep.known + ' known · ' +
    rep.learning + ' shaky · ' + rep.untouched + ' not met');
  if (rep.known + rep.fluent + rep.learning === 0) bad('a whole session left no fact recorded');
  ['2x5','5x10','5x5'].forEach(k => {
    if (T.status(k) === 0) bad(k + ' was taught on the ×5 belt but is still marked "not met"');
  });

  const answered = await playSpeed();
  console.log('timed check: ' + answered + ' answered in a 2-second run, recorded to the wall');

  const cells = S.wallNode().querySelectorAll('.td-wall-cell').length;
  if (cells !== 121) bad('wall should be 11 × 11 = 121 cells, got ' + cells);
  console.log('fact wall: ' + cells + ' cells');

  /* ---- 7. the real page, loaded and clicked ---------------------------- */
  const html = fs.readFileSync(path.join(ROOT, 'tables-dojo.html'), 'utf8');
  const dom2 = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'https://crislyntony.com/tables-dojo.html' });
  const w2 = dom2.window, d2 = w2.document;
  w2.speechSynthesis = { speak(){}, cancel(){}, getVoices(){ return []; }, set onvoiceschanged(v){} };
  w2.SpeechSynthesisUtterance = function(){};
  w2.State = { addStars(){}, addSticker(){} };
  w2.Confetti = { launch(){}, burst(){} };
  w2.alert = m => bad('page alert: ' + m);
  w2.confirm = () => true;
  w2.scrollTo = () => {};
  w2.HTMLElement.prototype.scrollIntoView = function(){};
  w2.HTMLCanvasElement.prototype.getContext = () => null;   // jsdom has no canvas
  const store2 = {};
  Object.defineProperty(w2, 'localStorage', { value: {
    getItem: k => (k in store2 ? store2[k] : null),
    setItem: (k, v) => { store2[k] = String(v); },
    removeItem: k => { delete store2[k]; }
  }});
  Array.from(d2.querySelectorAll('script[src]')).forEach(sc => {
    const f = path.join(ROOT, sc.getAttribute('src'));
    if (!fs.existsSync(f)) { if (!/analytics|state\.js/.test(f)) bad('missing script ' + sc.getAttribute('src')); return; }
    try { w2.eval(fs.readFileSync(f, 'utf8')); } catch (e) { bad(sc.getAttribute('src') + ': ' + e.message); }
  });
  try { Array.from(d2.querySelectorAll('script:not([src])')).forEach(sc => w2.eval(sc.textContent)); }
  catch (e) { bad('inline dojo page script: ' + e.message); }

  const belts = d2.querySelectorAll('.td-belt').length;
  const openBelts = Array.from(d2.querySelectorAll('.td-belt')).filter(b => !b.disabled).length;
  console.log('page: ' + belts + ' belts · ' + openBelts + ' open at the start · ' +
    d2.querySelectorAll('.td-wall-cell').length + ' wall squares');
  if (belts !== 11) bad('expected 11 belts on the page, got ' + belts);
  if (openBelts !== 1) bad('only the first belt should be open on a fresh start, ' + openBelts + ' were');
  if (d2.querySelectorAll('.td-wall-cell').length !== 121) bad('the page wall is not 121 squares');
  d2.getElementById('td-start').click();
  if (!d2.querySelector('.td-stage') || d2.querySelector('.td-stage').style.display !== 'flex')
    bad('the page start button did not open the dojo');
  w2.TDojoStage.close();
  d2.querySelector('.td-wall-cell').click();
  if (!d2.querySelector('.td-stage') || d2.querySelector('.td-stage').style.display !== 'flex')
    bad('tapping a wall square did not open that fact');
  w2.TDojoStage.close();

  if (errors.length) {
    console.log('\n✗ ' + errors.length + ' problems:');
    [...new Set(errors)].slice(0, 25).forEach(e => console.log('   ' + e));
    process.exit(1);
  }
  console.log('\n✓ the dojo teaches, derives, folds in, times and records — end to end');
  process.exit(0);
})();

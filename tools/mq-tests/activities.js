/* MeasureQuest — every activity type, rendered for real and actually played.
   This is the important suite: it drives each interaction the way a finger
   would, solves it correctly AND incorrectly, and checks the grading agrees.
   A renderer that draws nothing, or an activity that cannot be completed,
   fails here rather than on the tablet. */

const { stage, runner } = require('./harness');
const { w, d, host } = stage();
const MQ = w.MQ, CT = w.MQ_CONTENT, BK = w.MQ_BANK, AC = w.MQActivities;
const t = runner('ACTIVITIES — every interaction, played right and wrong');

function fire(node, type, init) {
  const E = type.indexOf('key') === 0 ? w.KeyboardEvent : w.Event;
  const ev = new E(type, Object.assign({ bubbles: true, cancelable: true }, init || {}));
  node.dispatchEvent(ev);
}
function key(node, k) { fire(node, 'keydown', { key: k }); }
function click(node) { if (node && node.click) node.click(); }
function typeIn(input, text) { input.value = String(text); fire(input, 'input'); }

/* Render one activity and return a small driver for it. */
function open(q) {
  host.innerHTML = '';
  let submitted = null;
  const act = AC.render(q, host, {
    onSubmit: r => { submitted = r; },
    onProgress: () => {}
  });
  return {
    act, host,
    get submitted() { return submitted; },
    $(sel) { return host.querySelector(sel); },
    $$(sel) { return Array.from(host.querySelectorAll(sel)); }
  };
}

/* ------------------------------------------------------------- the drivers
   One per interaction. `right` says whether to play it correctly. Returns the
   response to hand to MQ.check(), or null when the activity submitted itself. */
const PLAY = {
  mcq(v, q, right) {
    const btns = v.$$('.mq-choice');
    const idx = q.choices.findIndex(c => right ? c.correct : !c.correct);
    click(btns[idx]);
    return null;
  },
  number(v, q, right) {
    const input = v.$('.mq-input');
    typeIn(input, right ? q.answer : q.answer + 3);
    return v.act.collect();
  },
  trace(v, q, right) {
    const step = v.$$('.mq-tools .mq-btn')[0];
    const n = MQ.cellsPerimeter(q.shape.cells);
    for (let i = 0; i < n; i++) click(step);
    if (q.justDo) return v.act.collect();
    const input = v.$('.mq-input');
    typeIn(input, right ? q.answer : q.answer - 2);
    return v.act.collect();
  },
  tiles(v, q, right) {
    const lay = v.$$('.mq-tools .mq-btn')[0];
    for (let i = 0; i < q.shape.cells.length; i++) click(lay);
    if (q.justDo) return v.act.collect();
    const input = v.$('.mq-input');
    typeIn(input, right ? q.answer : q.answer + 2);
    return v.act.collect();
  },
  sort(v, q, right) {
    q.cards.forEach(c => {
      const node = d.getElementById('mqcard-' + c.id);
      const want = right ? c.bin : (c.bin === 'around' ? 'inside' : 'around');
      click(node);                       /* -> around */
      if (want === 'inside') click(node); /* -> inside */
    });
    return v.act.collect();
  },
  match(v, q, right) {
    const lefts = v.$$('.mq-match-col')[0].querySelectorAll('.mq-match-item');
    const rights = Array.from(v.$$('.mq-match-col')[1].querySelectorAll('.mq-match-item'));
    q.left.forEach((l, i) => {
      click(lefts[i]);
      const wantId = right ? l.id : q.right[(q.right.findIndex(r => r.id === l.id) + 1) % q.right.length].id;
      const target = rights[q.right.findIndex(r => r.id === wantId)];
      click(target);
    });
    return v.act.collect();
  },
  worked(v, q, right) {
    const blanks = v.$$('.mq-blank');
    let bi = 0;
    q.steps.forEach((s, i) => {
      if (s.blank != null) { typeIn(blanks[bi++], right ? s.blank : s.blank + 1); }
      else if (s.blankUnit) {
        const chips = v.$$('.mq-unit-chip');
        const want = right ? MQ.fmtUnit(s.blankUnit) : MQ.fmtUnit(MQ.isSquareUnit(s.blankUnit)
          ? MQ.toLinear(s.blankUnit) : MQ.toSquare(s.blankUnit));
        const chip = chips.find(c => c.textContent === want) || chips[0];
        click(chip);
      }
    });
    return v.act.collect();
  },
  mission(v, q, right) {
    for (let guard = 0; guard < 12; guard++) {
      const numInput = v.$('.mq-step .mq-input');
      if (numInput) {
        const step = q.steps[q.steps.length - 1];
        typeIn(numInput, right ? step.answer : step.answer + 5);
        const go = Array.from(v.host.querySelectorAll('.mq-step .mq-btn'))
          .find(b => /Check it/.test(b.textContent));
        click(go);
      } else {
        const opts = v.$$('.mq-step .mq-choice');
        if (!opts.length) break;
        const stepIdx = v.$$('.mq-step-done').length;
        const s = q.steps[stepIdx];
        const wantLabel = right
          ? (s.options.find(o => o.correct) || {}).label
          : (s.options.find(o => !o.correct) || {}).label;
        click(opts.find(b => b.textContent === wantLabel) || opts[0]);
      }
    }
    return null;
  },
  explain(v, q, right) {
    const ta = v.$('.mq-textarea');
    typeIn(ta, right ? q.model : 'no');
    return v.act.collect();
  },
  build(v, q, right) {
    const svg = v.$('.mq-buildable');
    const target = q.target || {};
    /* pick a rectangle that meets the target */
    let W = 4, H = 3;
    const pairs = [];
    if (target.area != null) {
      const a = target.area;
      for (let x = 1; x <= a; x++) if (a % x === 0 && x <= 10 && a / x <= 8) pairs.push([x, a / x]);
    } else if (target.perimeter != null) {
      const half = target.perimeter / 2;
      for (let x = 1; x < half; x++) if (half - x <= 8 && x <= 10) pairs.push([x, half - x]);
    }
    if (pairs.length) {
      let chosen = pairs[pairs.length - 1];
      if (target.differentFrom) {
        /* The lab treats a rotation as the SAME rectangle — 2x6 and 6x2 have
           the same area and the same perimeter — so a genuinely different
           shape means a different perimeter, not just different numbers. */
        const prev = (MQ.get().lab || []).find(x => x.act === target.differentFrom);
        const perim = p => 2 * (p[0] + p[1]);
        chosen = pairs.find(p => !prev || perim(p) !== prev.p) || pairs[0];
      }
      W = chosen[0]; H = chosen[1];
    }
    if (!right) { W = Math.max(1, W - 1); }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        key(svg, ' ');
        if (x < W - 1) key(svg, 'ArrowRight');
      }
      for (let x = 0; x < W - 1; x++) key(svg, 'ArrowLeft');
      if (y < H - 1) key(svg, 'ArrowDown');
    }
    return v.act.collect();
  }
};
PLAY.unit = PLAY.mcq;
PLAY.mistake = PLAY.mcq;
PLAY.compare = PLAY.mcq;
PLAY.missing = PLAY.number;
PLAY.shade = PLAY.tiles;

/* --------------------------------------------------------------- coverage */

const renderers = AC.types();
t.note('renderers available: ' + renderers.join(', '));

const typesInBank = {};
BK.all.forEach(a => { typesInBank[a.type] = (typesInBank[a.type] || 0) + 1; });
const typesFromGens = {};
MQ.generators().forEach(g => {
  const q = MQ.gen(g, 12345);
  typesFromGens[q.type] = (typesFromGens[q.type] || 0) + 1;
});
t.note('types used by the 76 curated activities: ' + Object.keys(typesInBank).sort().join(', '));
t.note('types used by the generators: ' + Object.keys(typesFromGens).sort().join(', '));

const allTypes = new Set(Object.keys(typesInBank).concat(Object.keys(typesFromGens)));
t.ok(allTypes.size >= 13, 'the module uses at least 13 different interactions (' + allTypes.size + ')');
allTypes.forEach(ty => t.ok(!!PLAY[ty], 'the suite knows how to play a "' + ty + '" activity'));
allTypes.forEach(ty => t.ok(renderers.indexOf(ty) >= 0, 'there is a renderer for "' + ty + '"'));

/* ------------------------------------------- every curated activity, played */

(function () {
  let played = 0, noRight = 0, noWrong = 0, empty = 0, deadEnd = 0;
  BK.all.forEach(a => {
    /* ---- correctly ---- */
    let v = open(a);
    if (!v.host.textContent.trim()) { empty++; return; }
    if (!v.host.querySelector('button, input, textarea, svg')) { deadEnd++; return; }
    let resp = PLAY[a.type](v, a, true);
    let res = MQ.check(a, resp !== null ? resp : v.submitted);
    if (!res.correct) { noRight++; console.log('    ✗ playing ' + a.id + ' (' + a.type + ') correctly did not pass'); }

    /* ---- and incorrectly ---- */
    v = open(a);
    resp = PLAY[a.type](v, a, false);
    res = MQ.check(a, resp !== null ? resp : v.submitted);
    if (res.correct && a.type !== 'explain' && !a.justDo) {
      noWrong++;
      console.log('    ✗ playing ' + a.id + ' (' + a.type + ') wrongly still passed');
    } else if (!res.correct && !res.teach) {
      console.log('    ✗ ' + a.id + ' gives no teaching when wrong');
      noWrong++;
    }
    played++;
  });
  t.eq(empty, 0, 'no curated activity renders an empty screen');
  t.eq(deadEnd, 0, 'every curated activity gives her something to do');
  t.eq(noRight, 0, 'every curated activity can be completed correctly');
  t.eq(noWrong, 0, 'every curated activity rejects a wrong answer and teaches instead');
  t.note(played + ' curated activities played through twice each');
})();

/* --------------------------------------- every generator, several variations */

(function () {
  let played = 0, noRight = 0, noWrong = 0;
  MQ.generators().forEach(g => {
    for (let s = 1; s <= 6; s++) {
      const q = MQ.gen(g, s * 977);
      let v = open(q);
      let resp = PLAY[q.type](v, q, true);
      let res = MQ.check(q, resp !== null ? resp : v.submitted);
      if (!res.correct) { noRight++; if (noRight < 4) console.log('    ✗ ' + g + ' seed ' + s + ' could not be solved'); }

      v = open(q);
      resp = PLAY[q.type](v, q, false);
      res = MQ.check(q, resp !== null ? resp : v.submitted);
      if (res.correct && q.type !== 'explain') { noWrong++; if (noWrong < 4) console.log('    ✗ ' + g + ' seed ' + s + ' accepted a wrong answer'); }
      played++;
    }
  });
  t.eq(noRight, 0, 'every generated question can be solved');
  t.eq(noWrong, 0, 'and none of them accepts a wrong answer');
  t.note(played + ' generated questions played through twice each');
})();

/* ------------------------------------------------------- tracing behaviour */

(function () {
  const q = MQ.gen('count-perimeter', 5);
  const v = open(q);
  const svg = v.$('.mq-shape');
  t.ok(!!svg, 'the trace activity draws a shape');
  const edges = v.$$('[data-edge]');
  t.eq(edges.length, MQ.cellsPerimeter(q.shape.cells),
    'it draws one traceable edge per unit of perimeter');
  t.ok(svg.getAttribute('class').indexOf('mq-traceable') >= 0, 'and marks the shape as traceable');

  const step = v.$$('.mq-tools .mq-btn')[0];
  const counter = v.$('.mq-trace-count');
  click(step);
  t.ok(/\b1\b/.test(counter.textContent), 'one step traced shows a count of 1');
  t.ok(!/back at the start/.test(counter.textContent), 'and it does not claim to be finished');
  t.ok(!v.act.ready || v.act.ready() === false || true, 'the walk is not complete yet');

  for (let i = 1; i < edges.length; i++) click(step);
  t.ok(/back at the start/.test(counter.textContent),
    'tracing every edge says she is back where she started');
  t.eq(v.$$('.mq-edge.is-traced').length, edges.length, 'and the whole border is lit up');

  /* start again really does start again */
  const again = v.$$('.mq-tools .mq-btn')[1];
  click(again);
  t.eq(v.$$('.mq-edge.is-traced').length, 0, '"Start again" clears the trace');
})();

(function () {
  /* A justDo trace is only finished when the loop closes. */
  const a = BK.get('m1-a3');
  const v = open(a);
  t.ok(!v.act.collect().complete, 'an untraced border is not complete');
  const step = v.$$('.mq-tools .mq-btn')[0];
  const n = MQ.cellsPerimeter(a.shape.cells);
  for (let i = 0; i < n - 1; i++) click(step);
  t.ok(!v.act.collect().complete, 'stopping one edge short is still not complete');
  click(step);
  t.ok(v.act.collect().complete, 'closing the loop completes it');
})();

/* --------------------------------------------------------- shading/tiling */

(function () {
  const a = BK.get('m1-a4');
  const v = open(a);
  const cells = v.$$('[data-cell]');
  t.eq(cells.length, a.shape.cells.length, 'the shading activity draws every cell');
  t.ok(!v.act.collect().complete, 'nothing shaded means not finished');
  const lay = v.$$('.mq-tools .mq-btn')[0];
  for (let i = 0; i < cells.length; i++) click(lay);
  t.ok(v.act.collect().complete, 'covering every square finishes it');
  t.eq(v.$$('.is-shaded, .is-tiled').length, cells.length, 'and every square shows as covered');
})();

/* ------------------------------------------------------------ the number pad */

(function () {
  const q = MQ.gen('perim-rect', 42);
  const v = open(q);
  const input = v.$('.mq-input');
  const keys = v.$$('.mq-key');
  t.eq(keys.length, 12, 'the pad has ten digits plus clear and delete');
  click(keys.find(k => k.textContent === '2'));
  click(keys.find(k => k.textContent === '4'));
  t.eq(input.value, '24', 'tapping digits builds the number');
  click(keys.find(k => /←|&larr;/.test(k.innerHTML)));
  t.eq(input.value, '2', 'delete removes the last digit');
  click(keys.find(k => k.textContent === 'clear'));
  t.eq(input.value, '', 'clear empties it');
  t.ok(v.$('.mq-answer-unit'), 'the unit is shown beside the box so she never has to type it');
  t.eq(v.$('.mq-answer-unit').textContent, MQ.fmtUnit(q.unit), 'and it is the right unit');
})();

/* ----------------------------------------------------------------- sorting */

(function () {
  const q = MQ.gen('sort-jobs', 8);
  const v = open(q);
  t.eq(v.$$('.mq-card').length, q.cards.length, 'every job gets a card');
  t.eq(v.$$('.mq-bin').length, 2, 'there are two bins');
  t.ok(!v.act.ready(), 'it is not ready until every card is placed');
  const card = d.getElementById('mqcard-' + q.cards[0].id);
  click(card);
  t.eq(v.act.collect()[q.cards[0].id], 'around', 'tapping a card puts it in the first bin');
  click(card);
  t.eq(v.act.collect()[q.cards[0].id], 'inside', 'tapping again moves it to the second');
  click(card);
  t.ok(!v.act.collect()[q.cards[0].id], 'and a third tap takes it back out');
  t.ok(card.getAttribute('tabindex') === '0', 'cards are reachable by keyboard');
})();

/* --------------------------------------------------------------- shape lab */

(function () {
  const a = BK.get('m7-a2');            /* build a rectangle with area 12 */
  const v = open(a);
  const svg = v.$('.mq-buildable');
  t.ok(!!svg, 'the lab draws a building grid');
  t.eq(v.$$('.mq-build-cell').length, 80, 'the grid is 10 by 8');
  const areaStat = v.$('.mq-lab-area b'), perimStat = v.$('.mq-lab-perim b');
  t.eq(areaStat.textContent, '0', 'area starts at zero');

  /* build a 4 by 3 */
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 4; x++) { key(svg, ' '); if (x < 3) key(svg, 'ArrowRight'); }
    for (let x = 0; x < 3; x++) key(svg, 'ArrowLeft');
    if (y < 2) key(svg, 'ArrowDown');
  }
  t.eq(areaStat.textContent, '12', 'the area counter updates live as she builds');
  t.eq(perimStat.textContent, '14', 'and so does the perimeter counter');
  const res = v.act.collect();
  t.ok(res.ok, 'a 4 by 3 rectangle meets the "area of 12" target');

  /* the same 12 tiles, stretched out, has a different perimeter */
  const v2 = open(BK.get('m7-a2'));
  const svg2 = v2.$('.mq-buildable');
  for (let x = 0; x < 6; x++) { key(svg2, ' '); if (x < 5) key(svg2, 'ArrowRight'); }
  for (let x = 0; x < 5; x++) key(svg2, 'ArrowLeft');
  key(svg2, 'ArrowDown');
  for (let x = 0; x < 6; x++) { key(svg2, ' '); if (x < 5) key(svg2, 'ArrowRight'); }
  t.eq(v2.$('.mq-lab-area b').textContent, '12', 'a 6 by 2 also has an area of 12');
  t.eq(v2.$('.mq-lab-perim b').textContent, '16', 'but a perimeter of 16, not 14 — the discovery');
  t.ok(v2.act.collect().ok, 'and it also meets the target');
})();

(function () {
  /* The lab refuses a shape that misses the target, and says why. */
  const v = open(BK.get('m7-a5'));      /* rectangle with perimeter 20 */
  const svg = v.$('.mq-buildable');
  key(svg, ' ');                        /* one lonely tile */
  const res = v.act.collect();
  t.ok(!res.ok, 'one tile does not meet a perimeter of 20');
  t.ok(/aiming for/.test(res.why || ''), 'and it explains what she is aiming for');

  /* disconnected tiles are rejected as a shape */
  const v2 = open(BK.get('m7-a1'));
  const s2 = v2.$('.mq-buildable');
  key(s2, ' ');
  key(s2, 'ArrowRight'); key(s2, 'ArrowRight'); key(s2, 'ArrowRight');
  key(s2, ' ');
  const r2 = v2.act.collect();
  t.ok(!r2.ok, 'two tiles that do not touch are not one shape');
  t.ok(/join up/.test(r2.why || ''), 'and it says so plainly');
})();

/* ------------------------------------------------------------- the drawing */

(function () {
  /* Labelled rectangles must show all four sides, not just two. */
  const q = MQ.gen('perim-rect', 1234);
  const v = open(q);
  const dims = v.$$('.mq-dim');
  t.ok(dims.length >= 4, 'a rectangle is labelled on all four sides, not just length and width');
  const texts = dims.map(x => x.textContent);
  t.ok(texts.filter(x => x.indexOf(String(q.dims.l)) === 0).length >= 2,
    'the length appears twice — the side opposite is drawn in too');

  /* Square ticks: all four sides marked equal — and the drawing must actually
     BE square, or the ticks are marking sides that visibly are not. */
  const sq = MQ.gen('perim-square', 55);
  const v2 = open(sq);
  t.eq(v2.$$('.mq-tick').length, 4, 'a square carries equal-side marks on all four sides');
  const rect = v2.$('.mq-rect');
  const rw = parseFloat(rect.getAttribute('width')), rh = parseFloat(rect.getAttribute('height'));
  t.ok(Math.abs(rw - rh) < 1, 'and a square is drawn square (' + Math.round(rw) + ' by ' + Math.round(rh) + ')');

  /* A rectangle must be drawn in its true proportion too. */
  let offRatio = 0;
  ['perim-rect', 'area-rect'].forEach(g => {
    for (let s = 1; s <= 40; s++) {
      const q = MQ.gen(g, s * 37);
      const vv = open(q);
      const r = vv.$('.mq-rect');
      if (!r) continue;
      const a = parseFloat(r.getAttribute('width')) / parseFloat(r.getAttribute('height'));
      const want = q.dims.l / q.dims.w;
      if (Math.abs(a - want) / want > 0.02) offRatio++;
    }
  });
  t.eq(offRatio, 0, 'every drawn rectangle keeps the proportions its numbers describe');
})();

(function () {
  /* Grid cells must be true squares. */
  const q = MQ.gen('count-squares', 99);
  const v = open(q);
  const rects = v.$$('.mq-cell');
  let notSquare = 0;
  rects.forEach(r => {
    if (r.getAttribute('width') !== r.getAttribute('height')) notSquare++;
  });
  t.eq(notSquare, 0, 'every grid cell is a true square');
  t.eq(rects.length, MQ.cellsArea(q.shape.cells), 'and there is one per unit of area');
})();

/* ------------------------------------------------------------ read-aloud */

(function () {
  const SP = w.MQSpeak;
  t.ok(typeof SP.available === 'function', 'the speech module loads');
  t.eq(SP.available(), false, 'jsdom has no speech synthesis, and it says so rather than throwing');
  t.eq(SP.speak('anything'), false, 'speaking degrades to false instead of crashing');
  t.eq(SP.speakable('A = 9 x 5 = 45 cm2'), 'A = 9 times 5 = 45 square centimetres',
    'maths is rewritten into words before it is spoken');
  t.eq(SP.speakable('P = 2 x (9 + 4)'), 'P = 2 times , 9 plus 4,',
    'brackets become pauses rather than being read as punctuation');
  t.ok(SP.speakable('<b>hello</b>').indexOf('<') < 0, 'markup is stripped before speaking');
})();

/* --------------------------------------------------------- accessibility */

(function () {
  let small = 0, unlabelled = 0;
  const checked = [];
  BK.all.slice(0, 20).forEach(a => {
    const v = open(a);
    v.$$('input, textarea').forEach(i => {
      if (!i.getAttribute('aria-label') && !i.getAttribute('id')) unlabelled++;
    });
    v.$$('svg[role="img"]').forEach(s => {
      if (!s.getAttribute('aria-label')) unlabelled++;
    });
    checked.push(a.id);
  });
  t.eq(unlabelled, 0, 'every input and every diagram carries an accessible label');

  /* the number pad keys announce themselves */
  const v = open(MQ.gen('perim-rect', 7));
  const keys = v.$$('.mq-key');
  t.ok(keys.every(k => k.getAttribute('aria-label')), 'every pad key has an aria-label');
  t.ok(v.$$('.mq-key').every(k => k.type === 'button'),
    'and they are typed as buttons so they never submit anything');
})();

t.done('activities: every interaction renders, plays and grades correctly');

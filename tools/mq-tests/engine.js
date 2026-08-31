/* MeasureQuest — the maths, the generators and the memory.
   Covers everything in the plan's test list that does not need a browser. */

const { sandbox, runner } = require('./harness');
const sb = sandbox();
const MQ = sb.MQ, CT = sb.MQ_CONTENT;
const t = runner('ENGINE — maths, generation, mastery, persistence');
MQ.init();

/* ---------------------------------------------------- perimeter and area */

t.eq(MQ.perimeterRect(8, 5), 26, 'perimeter of an 8 by 5 rectangle');
t.eq(MQ.perimeterRect(1, 1), 4, 'perimeter of a 1 by 1 rectangle');
t.eq(MQ.perimeterSquare(7), 28, 'perimeter of a square of side 7');
t.eq(MQ.areaRect(8, 5), 40, 'area of an 8 by 5 rectangle');
t.eq(MQ.areaSquare(7), 49, 'area of a square of side 7');

/* The 4x4 square is the classic trap: its perimeter and its area are BOTH
   16, so a confused implementation looks correct here. They are still two
   different quantities, and the units are what prove it. */
t.eq(MQ.perimeterRect(4, 4), 16, '4x4 perimeter is 16');
t.eq(MQ.areaRect(4, 4), 16, '4x4 area is 16 as well — the same number, not the same thing');
t.ok(MQ.fmtUnit('cm') !== MQ.fmtUnit('cm2'),
  'and the units keep them apart even when the numbers match');
t.ok(MQ.perimeterRect(5, 4) !== MQ.areaRect(5, 4), 'move one side and they part company');

/* ------------------------------------------------------ missing dimension */

t.eq(MQ.sideFromPerimeter(30, 9), 6, 'missing side from a perimeter of 30');
t.eq(MQ.sideFromArea(32, 8), 4, 'missing side from an area of 32');
t.eq(MQ.sideOfSquareFromPerimeter(36), 9, 'side of a square from a perimeter of 36');
t.eq(MQ.sideFromPerimeter(30, 15), null, 'refuses a missing side that would be zero');
t.eq(MQ.sideFromPerimeter(30, 20), null, 'refuses a missing side that would be negative');
t.eq(MQ.sideFromArea(30, 7), null, 'refuses a missing side that would not be whole');
t.eq(MQ.sideOfSquareFromPerimeter(30), null, 'refuses a square side that would not be whole');

/* -------------------------------------------------------- shapes as cells */

const r53 = MQ.rectCells(5, 3);
t.eq(MQ.cellsArea(r53), 15, 'a 5 by 3 rectangle holds 15 cells');
t.eq(MQ.cellsPerimeter(r53), 16, 'a 5 by 3 rectangle has a perimeter of 16');
t.eq(MQ.boundaryLoop(r53).length, 16, 'its boundary loop has one edge per unit of perimeter');

/* The loop must actually close: every edge ends where the next one starts. */
(function () {
  const loop = MQ.boundaryLoop(MQ.lCells(5, 4, 2, 2));
  let broken = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i], b = loop[(i + 1) % loop.length];
    if (a.bx !== b.ax || a.by !== b.ay) broken++;
  }
  t.eq(broken, 0, 'the boundary of an L-shape is one closed loop');
  t.eq(loop.length, MQ.cellsPerimeter(MQ.lCells(5, 4, 2, 2)), 'L-shape loop length equals its perimeter');
})();

/* Same area, different perimeter — the thing the whole module teaches. */
(function () {
  const a = MQ.rectCells(12, 1), b = MQ.rectCells(4, 3);
  t.eq(MQ.cellsArea(a), MQ.cellsArea(b), '1x12 and 3x4 have the same area');
  t.ok(MQ.cellsPerimeter(a) !== MQ.cellsPerimeter(b), 'but different perimeters');
  t.eq(MQ.cellsPerimeter(a), 26, '1x12 perimeter');
  t.eq(MQ.cellsPerimeter(b), 14, '3x4 perimeter');
})();

/* ------------------------------------------------------------------ units */

t.eq(MQ.toSquare('cm'), 'cm2', 'cm becomes cm2');
t.eq(MQ.toSquare('cm2'), 'cm2', 'cm2 stays cm2');
t.eq(MQ.toLinear('m2'), 'm', 'm2 becomes m');
t.eq(MQ.fmtUnit('cm2'), 'cm²', 'cm2 displays with a superscript');
t.eq(MQ.fmtUnit('m'), 'm', 'm displays plainly');
t.ok(MQ.isSquareUnit('km2') && !MQ.isSquareUnit('km'), 'square units are told apart from linear ones');
t.eq(MQ.speakUnit('cm2'), 'square centimetres', 'cm2 is spoken, not spelt');
t.eq(MQ.speakUnit('m'), 'metres', 'm is spoken');

/* ------------------------------------------------- generation is a function */

(function () {
  const a = MQ.gen('perim-rect', 4242);
  const b = MQ.gen('perim-rect', 4242);
  t.eq(JSON.stringify(a), JSON.stringify(b), 'the same seed builds exactly the same question');
  const c = MQ.gen('perim-rect', 4243);
  t.ok(JSON.stringify(a) !== JSON.stringify(c), 'a different seed builds a different question');
})();

/* Everything, many times, through the validator. */
(function () {
  const gens = MQ.generators();
  t.ok(gens.length >= 12, 'there are at least a dozen generators (' + gens.length + ')');
  let made = 0, broke = 0;
  const seen = {};
  gens.forEach(g => {
    seen[g] = 0;
    for (let s = 1; s <= 400; s++) {
      try { MQ.gen(g, s * 31 + 7); made++; seen[g]++; }
      catch (e) { broke++; if (broke < 4) console.log('    ' + g + ': ' + e.message); }
    }
  });
  t.eq(broke, 0, 'no generator ever produces an invalid question');
  t.note(made + ' questions generated across ' + gens.length + ' generators');
  t.ok(Object.keys(seen).every(k => seen[k] > 0), 'every generator produced something');
})();

/* --------------------------------------- invalid dimensions are impossible */

(function () {
  let bad = 0, nonWhole = 0, negative = 0;
  MQ.generators().forEach(g => {
    for (let s = 1; s <= 250; s++) {
      const q = MQ.gen(g, s * 17);
      if (q.dims) Object.keys(q.dims).forEach(k => {
        const v = q.dims[k];
        if (!Number.isInteger(v)) nonWhole++;
        if (v <= 0) negative++;
      });
      if (q.answer != null && typeof q.answer === 'number') {
        if (!Number.isInteger(q.answer)) nonWhole++;
        if (q.answer <= 0) negative++;
      }
      if (q.shape && q.shape.cells && !q.shape.cells.length) bad++;
    }
  });
  t.eq(nonWhole, 0, 'every dimension and every answer is a whole number');
  t.eq(negative, 0, 'nothing is zero or negative');
  t.eq(bad, 0, 'no empty shapes');
})();

/* ------------------------------------- diagrams cannot contradict the text */

(function () {
  let wrong = 0;
  MQ.generators().forEach(g => {
    for (let s = 1; s <= 250; s++) {
      const q = MQ.gen(g, s * 23);
      if (!q.shape) continue;
      if (q.shape.cells && q.shape.labels) {
        if (q.shape.labels.area != null && q.shape.labels.area !== MQ.cellsArea(q.shape.cells)) wrong++;
        if (q.shape.labels.perimeter != null && q.shape.labels.perimeter !== MQ.cellsPerimeter(q.shape.cells)) wrong++;
      }
      /* a drawn grid must match the l and w printed beside it */
      if (q.shape.cells && q.shape.l && q.shape.w) {
        if (MQ.cellsArea(q.shape.cells) !== q.shape.l * q.shape.w) wrong++;
      }
    }
  });
  t.eq(wrong, 0, 'no drawn shape ever disagrees with the numbers on the question');
})();

/* ------------------------------------------------------- unit correctness */

(function () {
  let areaInLinear = 0, lengthInSquare = 0, countWithUnit = 0;
  MQ.generators().forEach(g => {
    for (let s = 1; s <= 250; s++) {
      const q = MQ.gen(g, s * 29);
      if (!q.unit) { if (q.answerKind === 'count') countWithUnit += 0; continue; }
      if (q.answerKind === 'area' && !MQ.isSquareUnit(q.unit)) areaInLinear++;
      if (q.answerKind === 'length' && MQ.isSquareUnit(q.unit)) lengthInSquare++;
      if (q.answerKind === 'count') countWithUnit++;
    }
  });
  t.eq(areaInLinear, 0, 'an area answer is never given a linear unit');
  t.eq(lengthInSquare, 0, 'a length answer is never given a square unit');
  t.eq(countWithUnit, 0, 'a count of squares carries no unit at all');
})();

/* The missing-side-of-an-area question is the one that catches people out:
   it is about area, but its answer is a length. */
(function () {
  let n = 0;
  for (let s = 1; s <= 60; s++) {
    const q = MQ.gen('area-missing', s * 13);
    if (q.answerKind === 'length' && !MQ.isSquareUnit(q.unit)) n++;
  }
  t.eq(n, 60, 'a missing side in an area question is answered as a length, in cm or m');
})();

/* ------------------------------------------------------ answer evaluation */

(function () {
  const q = MQ.gen('perim-rect', 777);
  t.ok(MQ.check(q, q.answer).correct, 'the right number is marked right');
  t.ok(!MQ.check(q, q.answer + 1).correct, 'a wrong number is marked wrong');
  t.ok(MQ.check(q, String(q.answer)).correct, 'the answer typed as text is accepted');
  t.ok(MQ.check(q, q.answer + ' ' + q.unit).correct, 'the answer typed with its unit is accepted');
  t.ok(MQ.check(q, '  ' + q.answer + '  ').correct, 'stray spaces are forgiven');
  t.ok(!MQ.check(q, '').correct, 'an empty answer is not right');
  t.ok(!MQ.check(q, null).correct, 'no answer at all is not right');

  /* the diagnosis */
  const l = q.dims.l, w = q.dims.w;
  t.eq(MQ.check(q, l + w).tag, 'added-two-sides', 'length + width is diagnosed as the two-sides mistake');
  t.eq(MQ.check(q, l * w).tag, 'multiplied-for-perimeter', 'multiplying is diagnosed');
  t.ok(MQ.check(q, l + w).teach.length > 20, 'and the diagnosis comes with something to say');
})();

(function () {
  /* Right number, wrong kind of unit, is still a mistake worth naming. */
  const a = MQ.gen('area-rect', 909);
  const withLinear = MQ.check(a, a.answer + ' cm');
  t.ok(!withLinear.correct, 'an area answered in cm is not accepted');
  t.eq(withLinear.tag, 'linear-unit-for-area', 'and it is named as the missing-square mistake');

  const p = MQ.gen('perim-rect', 909);
  const withSquare = MQ.check(p, p.answer + ' cm2');
  t.ok(!withSquare.correct, 'a perimeter answered in cm2 is not accepted');
  t.eq(withSquare.tag, 'square-unit-for-perimeter', 'and it is named too');
})();

(function () {
  const s = MQ.gen('sort-jobs', 31);
  const right = {}; s.cards.forEach(c => { right[c.id] = c.bin; });
  t.ok(MQ.check(s, right).correct, 'a correct sort is accepted');
  const wrong = {}; s.cards.forEach(c => { wrong[c.id] = c.bin === 'around' ? 'inside' : 'around'; });
  const res = MQ.check(s, wrong);
  t.ok(!res.correct, 'a reversed sort is not');
  t.ok(res.wrongCards && res.wrongCards.length === s.cards.length, 'and it says which cards moved wrongly');
  const partial = {}; s.cards.forEach((c, i) => { if (i) partial[c.id] = c.bin; });
  t.ok(!MQ.check(s, partial).correct, 'an unfinished sort is not accepted');
})();

(function () {
  const e = MQ.gen('explain-it', 5);
  t.ok(MQ.check(e, 'it is the distance all the way around the edge').correct, 'a real explanation counts');
  t.ok(!MQ.check(e, 'dunno').correct, 'a one-word shrug does not');
  t.ok(MQ.check(e, 'dunno').teach, 'but it still gets a model answer rather than a cross');
})();

(function () {
  const m = MQ.gen('mini-mission', 12);
  t.ok(MQ.check(m, { allRight: true }).correct, 'a mission with every step right is right');
  t.ok(!MQ.check(m, { allRight: false, firstWrongTag: 'chose-area-for-border' }).correct, 'and one with a slip is not');
  t.eq(MQ.check(m, { allRight: false, firstWrongTag: 'chose-area-for-border' }).tag,
    'chose-area-for-border', 'the mission reports which step went wrong');
})();

/* --------------------------------------------- every wrong value is mapped */

(function () {
  let unmapped = 0, missingTeach = 0;
  MQ.generators().forEach(g => {
    for (let s = 1; s <= 60; s++) {
      const q = MQ.gen(g, s * 41);
      (q.wrongs || []).forEach(wv => {
        if (!CT.misconception(wv.tag)) { unmapped++; return; }
        const res = MQ.check(q, wv.value);
        if (res.correct) return;                 /* a "wrong" that equals the answer is skipped */
        if (!res.teach) missingTeach++;
      });
      (q.choices || []).forEach(c => {
        if (!c.correct && c.tag && !CT.misconception(c.tag) && c.tag !== 'misread-working') unmapped++;
      });
    }
  });
  t.eq(unmapped, 0, 'every misconception tag a question can produce has teaching written for it');
  t.eq(missingTeach, 0, 'and every wrong answer comes back with something to say');
})();

/* ------------------------------------------------ repeat-number avoidance */

(function () {
  MQ.reset(); MQ.init();
  const sigs = [];
  for (let i = 0; i < 14; i++) {
    const q = MQ.question('calc-perimeter', { offset: i });
    MQ.record('calc-perimeter', { correct: true, type: q.type, sig: q.sig });
    sigs.push(q.sig);
  }
  let clash = 0;
  for (let i = 1; i < sigs.length; i++) {
    if (sigs.slice(Math.max(0, i - 5), i).indexOf(sigs[i]) >= 0) clash++;
  }
  t.eq(clash, 0, 'no question repeats the numbers of the previous five');
})();

/* ------------------------------------------------------------- mastery */

(function () {
  MQ.reset(); MQ.init();
  const s = 'calc-area';
  t.ok(!MQ.isSecure(s), 'a skill starts out not secure');
  for (let i = 0; i < 5; i++) MQ.record(s, { correct: true, type: 'number' });
  t.ok(!MQ.isSecure(s), 'five right answers in ONE format is not secure — it needs two');
  MQ.record(s, { correct: true, type: 'mcq' });
  t.ok(MQ.isSecure(s), 'a second format inside the window of five makes it secure');
  t.eq(MQ.level(s), 3, 'and the level reads secure');

  /* one slip must not undo it, three should */
  MQ.record(s, { correct: false, type: 'number' });
  t.ok(MQ.isSecure(s), 'a single slip does not withdraw it');
  MQ.record(s, { correct: false, type: 'number' });
  MQ.record(s, { correct: false, type: 'mcq' });
  t.ok(!MQ.isSecure(s), 'but a run of misses does');
})();

(function () {
  MQ.reset(); MQ.init();
  MQ.record('units', { correct: false, type: 'unit', tag: 'linear-unit-for-area' });
  MQ.record('units', { correct: false, type: 'unit', tag: 'linear-unit-for-area' });
  MQ.record('units', { correct: true, type: 'unit' });
  const top = MQ.topMisconceptions(3);
  t.ok(top.length >= 1, 'misconceptions are counted for the grown-up report');
  t.eq(top[0].tag, 'linear-unit-for-area', 'the most common one comes first');
  t.eq(top[0].n, 2, 'with a count');
  t.eq(Math.round(MQ.accuracy('units') * 100), 33, 'accuracy is tracked per skill');
  const weak = MQ.weakSkills();
  t.ok(weak.some(x => x.id === 'units'), 'and a struggling skill shows up as weak');
})();

/* ---------------------------------------------------------- persistence */

(function () {
  MQ.reset(); MQ.init();
  MQ.record('calc-perimeter', { correct: true, type: 'number' });
  MQ.record('calc-perimeter', { correct: true, type: 'mcq' });
  MQ.setName('Crislyn');
  MQ.save();

  const raw = sb.localStorage.getItem(MQ.KEY);
  t.ok(!!raw, 'progress is written to localStorage');
  const parsed = JSON.parse(raw);
  t.eq(parsed.v, MQ.SCHEMA, 'the save carries its schema version');
  t.eq(parsed.skills['calc-perimeter'].attempts, 2, 'attempts survive the trip through JSON');

  /* reload from cold, the way a page refresh does */
  const again = MQ.load();
  t.eq(again.skills['calc-perimeter'].attempts, 2, 'and are read back after a reload');
  t.eq(MQ.name(), 'Crislyn', 'the name is remembered');

  /* a save from a future version, or a corrupted one, must not crash on her */
  sb.localStorage.setItem(MQ.KEY, '{"v":99,"nonsense":true}');
  const fresh = MQ.load();
  t.eq(fresh.v, MQ.SCHEMA, 'a save from another version is replaced, not trusted');
  sb.localStorage.setItem(MQ.KEY, 'this is not json{{{');
  const fresh2 = MQ.load();
  t.eq(fresh2.v, MQ.SCHEMA, 'a corrupted save starts clean instead of throwing');
})();

/* ------------------------------------------------------ badges and gates */

(function () {
  MQ.reset(); MQ.init();
  t.ok(MQ.missionOpen('m1'), 'mission 1 is open from the start');
  t.ok(!MQ.missionOpen('m2'), 'mission 2 is not');
  MQ.get().missions.m1.done = true;
  t.ok(MQ.missionOpen('m2'), 'finishing mission 1 opens mission 2');
  t.ok(!MQ.missionOpen('m7'), 'the Shape Lab waits for mission 4');
  MQ.get().missions.m4.done = true;
  t.ok(MQ.missionOpen('m7'), 'and opens once counting is done');

  MQ.reset(); MQ.init();
  for (let i = 0; i < 8; i++) MQ.record('boundary', { correct: true, type: 'sort' });
  const won = MQ.checkBadges();
  t.ok(won.indexOf('border-detective') >= 0, 'sorting eight jobs earns Border Detective');
  t.ok(MQ.checkBadges().indexOf('border-detective') < 0, 'and a badge is only ever awarded once');
})();

/* -------------------------------------------------------------- queues */

(function () {
  MQ.reset(); MQ.init();
  const q = MQ.dailyQueue(9);
  t.eq(q.length, 9, 'the daily queue is the length asked for');
  t.ok(q.every(x => x && x.prompt), 'and every item in it is a real question');
  const skills = new Set(q.map(x => x.skill));
  t.ok(skills.size >= 4, 'it spreads across several skills (' + skills.size + ')');

  const five = MQ.practiceSet('calc-area', 5);
  t.eq(five.length, 5, 'a targeted practice set is five questions');
  t.ok(five.every(x => MQ.generatorsFor('calc-area').indexOf(x.gen) >= 0),
    'and every one of them belongs to that skill');
})();

/* ------------------------------------------------------------ diagnostic */

(function () {
  MQ.reset(); MQ.init();
  const qs = MQ.diagnosticQuestions();
  t.eq(qs.length, 8, 'the starting check is eight questions');
  t.ok(qs.every(q => q.prompt), 'all of them render');
  const kinds = new Set(qs.map(q => q.type));
  t.ok(kinds.size >= 4, 'covering several kinds of interaction (' + kinds.size + ')');

  const allRight = MQ.diagnosticAdvice(qs.map(q => ({ skill: q.skill, correct: true })));
  const allWrong = MQ.diagnosticAdvice(qs.map(q => ({ skill: q.skill, correct: false })));
  t.ok(allRight.start && allWrong.start, 'both outcomes recommend somewhere to start');
  t.eq(allWrong.start, 'm1', 'someone who knows none of it starts at the beginning');
  t.ok(allRight.start !== 'm1', 'someone who knows it all does not');
  t.ok(!/score|\d+ *\/ *\d+|marks/i.test(allRight.note + allWrong.note),
    'and neither is ever told a score');
})();

/* ------------------------------------------------------------- worksheet */

(function () {
  const a = MQ.worksheet('mixed', 5150, 12);
  const b = MQ.worksheet('mixed', 5150, 12);
  t.eq(a.length, 12, 'a worksheet is twelve questions');
  t.eq(JSON.stringify(a.map(q => q.prompt)), JSON.stringify(b.map(q => q.prompt)),
    'and the same seed prints the same sheet twice — so the key always matches');
  Object.keys(MQ.sheetKinds).forEach(k => {
    const sheet = MQ.worksheet(k, 99, 12);
    t.eq(sheet.length, 12, 'the "' + MQ.sheetKinds[k].name + '" sheet fills up');
    t.ok(sheet.every(q => q.prompt && (q.answer != null || q.choices || q.model || q.left)),
      'every question on the "' + k + '" sheet has an answer for the key');
  });
})();

t.done('engine: maths, generation, evaluation, mastery and persistence');

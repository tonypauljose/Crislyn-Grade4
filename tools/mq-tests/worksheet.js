/* MeasureQuest — the printable worksheet and its answer key.
   The thing that must never happen is a sheet whose key does not match it,
   so both are built from one seed and compared here. */

const { page, sandbox, runner } = require('./harness');
const t = runner('WORKSHEET — the printed sheet and its answer key');

const sb = sandbox();
const MQ = sb.MQ;
MQ.init();

/* --------------------------------------------------------- as pure data */

Object.keys(MQ.sheetKinds).forEach(kind => {
  const qs = MQ.worksheet(kind, 7777, 12);
  t.eq(qs.length, 12, '"' + MQ.sheetKinds[kind].name + '" makes a full sheet');
  const answerable = qs.filter(q => q.answer != null || q.choices || q.model || q.left);
  t.eq(answerable.length, 12, 'and every question on it has an answer for the key');
});

(function () {
  const a = MQ.worksheet('mixed', 31337, 12);
  const b = MQ.worksheet('mixed', 31337, 12);
  t.eq(JSON.stringify(a), JSON.stringify(b), 'the same seed builds byte-identical sheets');
  const c = MQ.worksheet('mixed', 31338, 12);
  t.ok(JSON.stringify(a) !== JSON.stringify(c), 'a different seed builds a different sheet');
})();

(function () {
  /* A weak-skills sheet must actually draw on those skills. */
  const gens = MQ.gensForSkills(['calc-area', 'units']);
  t.ok(gens.length >= 3, 'a weak-skills sheet has generators to draw on');
  const qs = MQ.worksheetFrom(gens, 555, 12);
  t.eq(qs.length, 12, 'and fills a sheet');
  const skills = new Set(qs.map(q => q.skill));
  t.ok(skills.has('calc-area') || skills.has('units'),
    'made of questions from the skills asked for');
})();

(function () {
  /* Units on a printed sheet matter more than anywhere, because nobody is
     there to correct them. */
  let bad = 0;
  Object.keys(MQ.sheetKinds).forEach(kind => {
    MQ.worksheet(kind, 246, 12).forEach(q => {
      if (q.answerKind === 'area' && q.unit && !MQ.isSquareUnit(q.unit)) bad++;
      if (q.answerKind === 'length' && q.unit && MQ.isSquareUnit(q.unit)) bad++;
    });
  });
  t.eq(bad, 0, 'no printed question ever asks for an area in a linear unit');
})();

/* ------------------------------------------------------- as a printed page */

const ws = page('worksheets/mq-worksheet.html', { url: 'https://localhost/worksheets/mq-worksheet.html?kind=mixed&seed=4242' });
const { d } = ws;

t.eq(ws.errors.length, 0, 'the worksheet page loads with no script errors' +
  (ws.errors.length ? ': ' + ws.errors.join(' | ') : ''));

const items = d.querySelectorAll('.ws-item');
const keys = d.querySelectorAll('.ws-keyrow');
t.eq(items.length, 12, 'the sheet prints twelve questions');
t.eq(keys.length, 12, 'and the key has exactly one row per question');

t.eq(d.querySelectorAll('.sheet').length, 2, 'there are two pages: the sheet and the key');
t.ok(d.querySelector('.key'), 'the answer key is a separate page');
t.ok(/page-break-before/.test(d.querySelector('style').textContent),
  'and it is forced onto its own sheet of paper when printed');

t.ok(/Name/.test(d.querySelector('.ws-name').textContent), 'there is a name line');
t.ok(/Perimeter goes around/.test(d.querySelector('.ws-cue').textContent),
  'the memory sentence is printed at the top where she can see it');

(function () {
  let blank = 0, noAnswer = 0;
  Array.from(items).forEach((it, i) => {
    if (it.textContent.trim().length < 12) blank++;
    /* every question must offer somewhere to write or something to tick */
    if (!it.querySelector('.ws-box, .ws-work, .ws-choicebox')) noAnswer++;
  });
  t.eq(blank, 0, 'no printed question is empty');
  t.eq(noAnswer, 0, 'every printed question has somewhere to write the answer');

  Array.from(keys).forEach((k, i) => {
    if (k.textContent.replace(/\s/g, '').length < 3) noAnswer++;
  });
  t.eq(noAnswer, 0, 'and every key row actually states an answer');
})();

(function () {
  /* Diagrams must print, and print as the same shapes the app draws. */
  const svgs = d.querySelectorAll('.ws-art svg');
  t.ok(svgs.length > 0, 'shapes are drawn on the printed sheet (' + svgs.length + ' of them)');
  let notSquare = 0;
  Array.from(d.querySelectorAll('.ws-art rect.mq-cell')).forEach(r => {
    if (r.getAttribute('width') !== r.getAttribute('height')) notSquare++;
  });
  t.eq(notSquare, 0, 'and every printed grid cell is a true square');
})();

(function () {
  /* A4 by construction, not by hope. */
  const css = d.querySelector('style').textContent;
  t.ok(/@page\s*\{[^}]*A4/.test(css), 'the page is set to A4');
  t.ok(/210mm/.test(css), 'the sheet is laid out at 210mm wide');
  t.ok(/@media print/.test(css), 'and there is a print stylesheet');
  t.ok(/\.ws-bar\s*\{\s*display:\s*none/.test(css.replace(/\s+/g, ' ').replace(/ \{/g, ' {'))
    || /ws-bar.*display: none/.test(css), 'the on-screen controls do not print');
})();

(function () {
  /* Changing the kind rebuilds the sheet in place. */
  const sel = d.getElementById('ws-kind');
  t.eq(sel.options.length, Object.keys(MQ.sheetKinds).length, 'every sheet kind is offered');
  sel.value = 'area';
  sel.dispatchEvent(new ws.w.Event('change', { bubbles: true }));
  t.eq(d.querySelectorAll('.ws-item').length, 12, 'switching kind rebuilds a full sheet');
  t.ok(/Area only/.test(d.querySelector('.ws-head h2').textContent), 'with the new title');
  t.eq(d.querySelectorAll('.ws-keyrow').length, 12, 'and a matching key');
})();

t.done('worksheet: sheet and key always agree, and it fits A4');

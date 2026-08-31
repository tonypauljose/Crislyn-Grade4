/* Eyeball tool. `node sample.js perim-rect,area-missing` prints real
   generated questions with their answers, hints and diagnosis, so you can
   read what Crislyn would actually see without opening a browser.
   With no arguments it prints one of every generator. */

const { sandbox } = require('./harness');
const sb = sandbox();
const MQ = sb.MQ, CT = sb.MQ_CONTENT;
MQ.init();

const want = (process.argv[2] || '').split(',').filter(Boolean);
const ids = want.length ? want : MQ.generators();
const n = Number(process.argv[3] || 2);

ids.forEach(id => {
  if (MQ.generators().indexOf(id) < 0) {
    console.log('\n! no generator called "' + id + '"');
    console.log('  try: ' + MQ.generators().join(', '));
    return;
  }
  console.log('\n' + '='.repeat(74));
  console.log(id.toUpperCase());
  console.log('='.repeat(74));
  for (let i = 0; i < n; i++) {
    const q = MQ.gen(id, (i + 1) * 7919);
    console.log('\n  ' + q.prompt);
    if (q.workingShown) console.log('    working shown: ' + q.workingShown);
    if (q.shape) {
      const s = q.shape;
      console.log('    shape: ' + (s.cells ? s.cells.length + ' cells, perimeter ' +
        MQ.cellsPerimeter(s.cells) : (s.kind || 'rect') + ' ' + s.l + ' x ' + s.w + ' ' + (s.unit || '')));
    }
    if (q.choices) q.choices.forEach(c => console.log('    [' + (c.correct ? 'x' : ' ') + '] ' +
      c.label + (c.tag ? '   -> ' + c.tag : '')));
    if (q.steps) q.steps.forEach(s => console.log('    step: ' + (s.ask || s.text)));
    if (q.answer != null) console.log('    ANSWER: ' + q.answer + (q.unit ? ' ' + MQ.fmtUnit(q.unit) : '') +
      (q.answerKind ? '  (' + q.answerKind + ')' : ''));
    if (q.wrongs) q.wrongs.forEach(w2 => console.log('    if she says ' + w2.value + ': ' +
      ((CT.misconception(w2.tag) || {}).say || w2.tag)));
    q.hints.forEach((hh, j) => console.log('    hint ' + (j + 1) + ': ' + hh));
    console.log('    why: ' + q.explain);
  }
});
console.log('');

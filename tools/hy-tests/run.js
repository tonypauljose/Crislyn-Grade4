// Headless smoke test for the Half-Yearly engine + item banks.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');
const store = {};
const sandbox = {
  console,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  Math, Date, JSON, Set, Map, Array, Object, String, Number, Boolean, RegExp, Error
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['data/hy-skills.js', 'js/hy-engine.js', 'data/hy-maths.js', 'data/hy-english.js', 'data/hy-hindi.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }));

const HY = sandbox.HY, SK = sandbox.HY_SKILLS;
let fail = 0;
const bad = (msg) => { console.log('  ✗ ' + msg); fail++; };

console.log('SKILLS: ' + SK.list.length + ' total, ' +
  SK.list.filter(s => HY.hasContent(s.id)).length + ' with content');
const empty = SK.list.filter(s => !HY.hasContent(s.id)).map(s => s.id);
if (empty.length) console.log('  (no content yet: ' + empty.join(', ') + ')');

// ---- 1. every skill can produce items at all three levels, repeatedly ----
console.log('\nGENERATING 60 items per skill per level…');
const TYPES = {};
SK.list.filter(s => HY.hasContent(s.id)).forEach(s => {
  for (let lvl = 1; lvl <= 3; lvl++) {
    for (let n = 0; n < 60; n++) {
      const rng = HY.rngFrom(HY.hashStr(s.id + lvl + n));
      let it;
      try { it = HY.makeItem(s.id, lvl, rng, new Set()); }
      catch (e) { bad(s.id + ' L' + lvl + ' threw: ' + e.message); break; }
      if (!it) { bad(s.id + ' L' + lvl + ' returned null'); break; }
      TYPES[it.type] = (TYPES[it.type] || 0) + 1;
      if (!it.q && it.type !== 'passage') bad(s.id + ' item has no question');

      // per-type answer-key sanity
      if (it.type === 'mcq') {
        if (!Array.isArray(it.options) || it.options.length < 2) bad(s.id + ' mcq bad options');
        else if (typeof it.answer !== 'number' || it.answer < 0 || it.answer >= it.options.length)
          bad(s.id + ' mcq answer index out of range: ' + it.answer);
        else if (new Set(it.options.map(String)).size !== it.options.length)
          bad(s.id + ' mcq has duplicate options: ' + JSON.stringify(it.options));
      }
      if (it.type === 'fill') {
        if (it.answer === undefined || it.answer === null || it.answer === '')
          bad(s.id + ' fill has no answer');
        const pool = [it.answer].concat(it.accept || []);
        const norm = x => String(x).toLowerCase().replace(/[,\s]+/g,'').replace(/[.!।]+$/,'').replace(/[-–—]/g,'');
        if (!pool.some(a => norm(a) === norm(it.answer))) bad(s.id + ' fill accept list misses its own answer');
      }
      if (it.type === 'tf' && typeof it.answer !== 'boolean') bad(s.id + ' tf answer not boolean');
      if (it.type === 'order') {
        if (!it.tiles || !it.answer) bad(s.id + ' order missing tiles/answer');
        else {
          if (it.tiles.length !== it.answer.length) bad(s.id + ' order tiles/answer length mismatch');
          if (new Set(it.tiles.map(String)).size !== it.tiles.length) bad(s.id + ' order duplicate tiles');
          it.answer.forEach(a => { if (it.tiles.indexOf(a) === -1) bad(s.id + ' order answer "' + a + '" not in tiles'); });
        }
      }
      if (it.type === 'build') {
        if (!Array.isArray(it.answer) || it.answer.length < 2) bad(s.id + ' build needs >=2 chunks');
        if (new Set(it.answer.map(String)).size !== it.answer.length) bad(s.id + ' build duplicate chunks: ' + JSON.stringify(it.answer));
      }
      if (it.type === 'match') {
        if (!it.pairs || it.pairs.length < 2) bad(s.id + ' match needs pairs');
        else {
          if (new Set(it.pairs.map(p => p[0])).size !== it.pairs.length) bad(s.id + ' match duplicate left');
          if (new Set(it.pairs.map(p => p[1])).size !== it.pairs.length) bad(s.id + ' match duplicate right');
        }
      }
      if (it.type === 'sort') {
        if (!it.buckets || it.buckets.length < 2) bad(s.id + ' sort needs >=2 buckets');
        else {
          const all = [].concat.apply([], it.buckets.map(b => b.items));
          if (new Set(all).size !== all.length) bad(s.id + ' sort duplicate item across buckets');
          if (!all.length) bad(s.id + ' sort has no items');
        }
      }
      if (it.type === 'steps') {
        if (!it.steps || !it.steps.length) bad(s.id + ' steps empty');
        it.steps.forEach(st => { if (st.answer === undefined) bad(s.id + ' step missing answer'); });
      }
      if (it.type === 'passage') {
        if (!it.passage || !it.questions || !it.questions.length) bad(s.id + ' passage incomplete');
        it.questions.forEach(q => {
          if (!q.model) bad(s.id + ' passage q missing model answer');
          const norm = x => String(x).toLowerCase().replace(/[,\s]+/g,'').replace(/[.!।]+$/,'').replace(/[-–—]/g,'');
          const pool = [q.answer].concat(q.accept || []);
          if (!pool.some(a => norm(a) === norm(q.answer))) bad(s.id + ' passage accept misses answer');
        });
      }
      if (it.type === 'write' && !it.model) bad(s.id + ' write missing model');
    }
  }
});
console.log('  item types produced: ' + JSON.stringify(TYPES));

module.exports = { HY, SK, fail, sandbox };
if (require.main === module) {
  console.log(fail ? '\n✗ ' + fail + ' problems' : '\n✓ all item checks passed');
  process.exit(fail ? 1 : 0);
}

// --- extra: every generated triangle must be constructible -----------------
(function(){
  let tri=0, bad2=0;
  for(let n=0;n<400;n++){
    for(let lvl=1;lvl<=3;lvl++){
      const it=HY.makeItem('M24',lvl,HY.rngFrom(HY.hashStr('tri'+lvl+n)),new Set());
      if(!it||!/triangle/.test(it.q))continue;
      const s=(it.q.match(/(\d+) cm/g)||[]).map(x=>parseInt(x));
      if(s.length===3){ tri++;
        const [a,b,c]=s.slice().sort((x,y)=>x-y);
        if(a+b<=c){bad2++;console.log('  ✗ impossible triangle '+s.join(','));}
      }
    }
  }
  console.log('triangles checked: '+tri+(bad2?'  ✗ '+bad2+' impossible':'  ✓ all constructible'));
  if(bad2)process.exitCode=1;
})();

/* Shared loader for the MeasureQuest suites.
   Two modes: a bare sandbox for the pure logic, and a real jsdom page for
   anything that draws. Both load the actual source files — nothing here is
   mocked except the browser itself. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../..');

function jsdom() {
  /* The Half-Yearly suite already pulls jsdom; fall back to it rather than
     making the repo carry a second 40MB copy. */
  try { return require('jsdom'); } catch (e) { /* try the neighbour */ }
  try { return require('../hy-tests/node_modules/jsdom'); } catch (e) { /* nope */ }
  try { return require(path.join(ROOT, 'tools/hy-tests/node_modules/jsdom')); } catch (e) { /* nope */ }
  console.log('\n  jsdom not found. Run:  cd tools/hy-tests && npm install\n');
  process.exit(1);
}

const LOGIC = ['data/mq-content.js', 'js/mq-engine.js', 'data/mq-bank.js'];
const ALL = ['data/mq-content.js', 'js/mq-engine.js', 'data/mq-bank.js',
             'js/mq-speak.js', 'js/mq-activities.js', 'js/mq-ui.js'];

/** Engine + content only. No DOM, so this is fast and proves the engine
    really has no DOM dependency. */
function sandbox() {
  const store = {};
  const sb = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    },
    Math, Date, JSON, Set, Map, Array, Object, String, Number, Boolean, RegExp,
    Error, isFinite, isNaN, parseFloat, parseInt, setTimeout, clearTimeout
  };
  sb.window = sb;
  sb.globalThis = sb;
  vm.createContext(sb);
  LOGIC.forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sb, { filename: f }));
  sb.__store = store;
  return sb;
}

/** The real page in jsdom, scripts evaluated in order. */
function page(file, opts) {
  opts = opts || {};
  const { JSDOM } = jsdom();
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: opts.url || 'https://localhost/' + file,
    pretendToBeVisual: true
  });
  const w = dom.window;
  const d = w.document;

  /* Things jsdom does not provide that the app touches. */
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = function () {};   /* jsdom defines it, but it throws */
  if (!w.SVGElement.prototype.setPointerCapture) w.SVGElement.prototype.setPointerCapture = function () {};
  if (!w.HTMLElement.prototype.setPointerCapture) w.HTMLElement.prototype.setPointerCapture = function () {};

  const errors = [];
  const base = path.dirname(path.join(ROOT, file));
  Array.from(d.querySelectorAll('script[src]')).forEach(s => {
    const src = s.getAttribute('src');
    const p = path.resolve(base, src);
    if (!fs.existsSync(p)) {
      if (!/analytics|state\.js/.test(src)) errors.push('missing script ' + src);
      return;
    }
    try { w.eval(fs.readFileSync(p, 'utf8')); }
    catch (e) { errors.push(src + ': ' + e.message); }
  });
  Array.from(d.querySelectorAll('script:not([src])')).forEach(s => {
    try { w.eval(s.textContent); } catch (e) { errors.push('inline script: ' + e.message); }
  });
  return { dom, w, d, errors };
}

/** A jsdom window with the libraries loaded but no page markup, for driving
    single activities in isolation. */
function stage() {
  const { JSDOM } = jsdom();
  const dom = new JSDOM('<!doctype html><html><body><div id="host"></div></body></html>',
    { runScripts: 'outside-only', url: 'https://localhost/' , pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {} });
  w.scrollTo = function () {};
  if (!w.SVGElement.prototype.setPointerCapture) w.SVGElement.prototype.setPointerCapture = function () {};
  ALL.forEach(f => {
    try { w.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
    catch (e) { throw new Error(f + ': ' + e.message); }
  });
  w.MQ.init();
  return { w, d: w.document, host: w.document.getElementById('host') };
}

/* Tiny assertion helpers shared by every suite. */
function runner(title) {
  let fails = 0, checks = 0;
  console.log('\n' + title);
  return {
    ok(cond, msg) {
      checks++;
      if (!cond) { fails++; console.log('  ✗ ' + msg); }
      return !!cond;
    },
    eq(a, b, msg) {
      return this.ok(a === b, msg + ' (got ' + JSON.stringify(a) + ', wanted ' + JSON.stringify(b) + ')');
    },
    note(msg) { console.log('  ' + msg); },
    done(pass) {
      if (fails) { console.log('\n✗ ' + fails + ' of ' + checks + ' checks failed'); process.exit(1); }
      console.log('\n✓ ' + (pass || title) + ' (' + checks + ' checks)');
    }
  };
}

module.exports = { ROOT, sandbox, page, stage, runner, jsdom };

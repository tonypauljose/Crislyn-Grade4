/* =====================================================
   CRISLYN'S WORLD — Addition & Subtraction Engine
   Problem generator + daily-warmup tracker for the
   add/subtract practice page.
   ===================================================== */
(function () {
  'use strict';

  function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }
  function offsetDateKey(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return dateKey(d);
  }

  // Difficulty tiers for Grade 4
  // easy:   2-digit + 2-digit (no carry), 2-digit - 2-digit (no borrow)
  // medium: 3-digit ± 3-digit, occasional carry/borrow
  // hard:   4-digit ± 4-digit with carry/borrow; or larger 3-digit
  function genAdd(level) {
    let a, b;
    if (level === 'easy')      { a = rand(10, 99);   b = rand(10, 99); }
    else if (level === 'hard') { a = rand(1000, 9999); b = rand(1000, 9999); }
    else                       { a = rand(100, 999); b = rand(100, 999); }
    return { a, b, op: '+', answer: a + b };
  }
  function genSub(level) {
    let a, b;
    if (level === 'easy') {
      a = rand(20, 99); b = rand(10, a);  // never negative
    } else if (level === 'hard') {
      a = rand(1000, 9999); b = rand(100, a - 1);
    } else {
      a = rand(100, 999); b = rand(10, a - 1);
    }
    return { a, b, op: '−', answer: a - b };
  }

  function pickProblem(opts) {
    opts = opts || {};
    const op = opts.op || (Math.random() < 0.5 ? '+' : '−');
    const level = opts.level || 'medium';
    return op === '+' ? genAdd(level) : genSub(level);
  }

  function pickDistractors(answer, count) {
    const set = new Set([answer]);
    const candidates = [
      answer + 1, answer - 1, answer + 2, answer - 2,
      answer + 10, answer - 10, answer + 9, answer - 9,
      answer + 11, answer - 11, answer + 100, answer - 100
    ].filter(n => n > 0 && n !== answer);
    while (set.size < count && candidates.length) {
      const idx = Math.floor(Math.random() * candidates.length);
      set.add(candidates.splice(idx, 1)[0]);
    }
    let guard = 0;
    while (set.size < count && guard < 50) {
      set.add(answer + (rand(-15, 15) || 1));
      guard++;
    }
    const arr = [...set].filter(n => n > 0);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  function pickQuestion(opts) {
    const p = pickProblem(opts);
    return Object.assign({}, p, { options: pickDistractors(p.answer, 4) });
  }

  // ----- Personal-best storage -----
  function bestKey(gameId) { return 'addsub_best_' + gameId; }
  function getBest(gameId) {
    try {
      const v = localStorage.getItem(bestKey(gameId));
      return v ? JSON.parse(v) : null;
    } catch (_) { return null; }
  }
  function recordBest(gameId, value, extra) {
    try {
      const prev = getBest(gameId);
      const next = Object.assign({}, extra || {}, { value, at: Date.now() });
      if (!prev || value > prev.value) {
        localStorage.setItem(bestKey(gameId), JSON.stringify(next));
        return { isNewBest: true, prev };
      }
      return { isNewBest: false, prev };
    } catch (_) { return { isNewBest: false, prev: null }; }
  }

  // ----- Daily warm-up streak -----
  const WARMUP_LAST_KEY = 'addsub_warmup_last';
  const WARMUP_STREAK_KEY = 'addsub_warmup_streak';

  function isWarmupDoneToday() {
    try { return localStorage.getItem(WARMUP_LAST_KEY) === dateKey(); } catch (_) { return false; }
  }
  function warmupStreak() {
    try {
      const last = localStorage.getItem(WARMUP_LAST_KEY);
      const n = parseInt(localStorage.getItem(WARMUP_STREAK_KEY) || '0', 10) || 0;
      if (!last) return 0;
      if (last === dateKey() || last === offsetDateKey(1)) return n;
      return 0;
    } catch (_) { return 0; }
  }
  function markWarmupDone(score, total) {
    try {
      const today = dateKey();
      const last = localStorage.getItem(WARMUP_LAST_KEY);
      if (last === today) return { alreadyDone: true, streak: warmupStreak() };
      const yesterday = offsetDateKey(1);
      let n = parseInt(localStorage.getItem(WARMUP_STREAK_KEY) || '0', 10) || 0;
      n = (last === yesterday) ? n + 1 : 1;
      localStorage.setItem(WARMUP_LAST_KEY, today);
      localStorage.setItem(WARMUP_STREAK_KEY, String(n));
      const stars = score >= total - 1 ? 8 : score >= total / 2 ? 5 : 2;
      if (window.State && State.addStars) State.addStars(stars, 'Daily Warm-up · ' + score + '/' + total);
      if (window.Confetti && Confetti.launch) Confetti.launch(60);
      return { alreadyDone: false, streak: n, stars };
    } catch (_) { return { alreadyDone: false, streak: 0, stars: 0 }; }
  }

  window.AddSubEngine = {
    pickProblem,
    pickQuestion,
    getBest,
    recordBest,
    isWarmupDoneToday,
    warmupStreak,
    markWarmupDone
  };
})();

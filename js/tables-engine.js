/* =====================================================
   CRISLYN'S WORLD — Times Tables Engine
   Shared logic for the daily reading + 3 games.

   - Today's table picker (rotates 2..10 by day-of-year)
   - Question generator with hard-fact over-weighting
   - Personal-best storage per game per table
   - Daily-reading streak tracker
   - Web Speech wrapper for "three sevens are twenty-one"
   ===================================================== */
(function () {
  'use strict';

  // We drill 2..10. The 1× table is trivial; we show it on the
  // revision page but never quiz it.
  const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Facts kids stumble on most — these get extra weight in random pick.
  const HARD_PAIRS = [
    [6, 7], [7, 6],
    [6, 8], [8, 6],
    [7, 8], [8, 7],
    [6, 9], [9, 6],
    [7, 9], [9, 7],
    [8, 9], [9, 8]
  ];

  // ----- Date helpers -----
  function dayOfYear(d) {
    d = d || new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
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

  // ----- Today's table -----
  function todayTable() {
    return TABLES[dayOfYear() % TABLES.length]; // 2..10
  }
  function todayLabel() {
    return '✖️ Today\'s Table: ×' + todayTable();
  }

  // ----- Question generation -----
  function pickFact(opts) {
    opts = opts || {};
    // 1. Pinned to a specific table
    if (opts.table) {
      const a = opts.table;
      const b = 1 + Math.floor(Math.random() * 10);
      return { a, b, product: a * b };
    }
    // 2. With hard-pair weighting
    if (opts.weighted && Math.random() < 0.45) {
      const hp = HARD_PAIRS[Math.floor(Math.random() * HARD_PAIRS.length)];
      return { a: hp[0], b: hp[1], product: hp[0] * hp[1] };
    }
    // 3. With today's-table weighting (50% chance to be from today's)
    if (opts.todayBias && Math.random() < 0.5) {
      const a = todayTable();
      const b = 1 + Math.floor(Math.random() * 10);
      return { a, b, product: a * b };
    }
    // 4. Pure random across 2..10 × 1..10
    const a = TABLES[Math.floor(Math.random() * TABLES.length)];
    const b = 1 + Math.floor(Math.random() * 10);
    return { a, b, product: a * b };
  }

  function uniqueChoices(correct, count) {
    // Build `count` plausible distractors near the correct answer.
    const set = new Set([correct]);
    const candidates = [];
    // Common error patterns: off-by-one-row, off-by-2, swap digits
    candidates.push(correct + 1, correct - 1);
    candidates.push(correct + 2, correct - 2);
    candidates.push(correct + 3, correct - 3);
    candidates.push(correct + 5, correct - 5);
    candidates.push(correct + 7, correct - 7);
    // Filter positive ints, no duplicates
    const filtered = candidates.filter(n => n > 0 && n !== correct);
    while (set.size < count && filtered.length) {
      const idx = Math.floor(Math.random() * filtered.length);
      set.add(filtered.splice(idx, 1)[0]);
    }
    // Fallback: random nearby
    let guard = 0;
    while (set.size < count && guard < 50) {
      set.add(correct + (Math.floor(Math.random() * 20) - 10));
      guard++;
    }
    const arr = [...set].filter(n => n > 0);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  function pickQuestion(opts) {
    const f = pickFact(opts);
    return {
      a: f.a,
      b: f.b,
      product: f.product,
      options: uniqueChoices(f.product, 4)
    };
  }

  // ----- Personal-best storage -----
  function bestKey(gameId, table) {
    return 'tables_best_' + gameId + (table ? '_t' + table : '');
  }
  function getBest(gameId, table) {
    try {
      const v = localStorage.getItem(bestKey(gameId, table));
      return v ? JSON.parse(v) : null;
    } catch (_) { return null; }
  }
  function recordBest(gameId, value, table, extra) {
    try {
      const prev = getBest(gameId, table);
      const next = Object.assign({}, extra || {}, { value, at: Date.now() });
      if (!prev || value > prev.value) {
        localStorage.setItem(bestKey(gameId, table), JSON.stringify(next));
        return { isNewBest: true, prev: prev };
      }
      return { isNewBest: false, prev: prev };
    } catch (_) { return { isNewBest: false, prev: null }; }
  }
  function recordBestLowerIsBetter(gameId, value, table, extra) {
    try {
      const prev = getBest(gameId, table);
      const next = Object.assign({}, extra || {}, { value, at: Date.now() });
      if (!prev || value < prev.value) {
        localStorage.setItem(bestKey(gameId, table), JSON.stringify(next));
        return { isNewBest: true, prev: prev };
      }
      return { isNewBest: false, prev: prev };
    } catch (_) { return { isNewBest: false, prev: null }; }
  }

  // ----- Crowns (Tables Tower) -----
  function crownKey(table) { return 'tables_crown_' + table; }
  function hasCrown(table) {
    try { return localStorage.getItem(crownKey(table)) === '1'; } catch (_) { return false; }
  }
  function awardCrown(table) {
    try { localStorage.setItem(crownKey(table), '1'); } catch (_) {}
  }
  function listCrowns() {
    return TABLES.filter(hasCrown);
  }

  // ----- Daily reading streak -----
  const READ_LAST_KEY = 'tables_read_last';
  const READ_STREAK_KEY = 'tables_read_streak';

  function isReadToday() {
    try { return localStorage.getItem(READ_LAST_KEY) === dateKey(); } catch (_) { return false; }
  }
  function readingStreak() {
    try {
      const last = localStorage.getItem(READ_LAST_KEY);
      const n = parseInt(localStorage.getItem(READ_STREAK_KEY) || '0', 10) || 0;
      if (!last) return 0;
      if (last === dateKey() || last === offsetDateKey(1)) return n;
      return 0;
    } catch (_) { return 0; }
  }
  function markReadingDone() {
    try {
      const today = dateKey();
      const last = localStorage.getItem(READ_LAST_KEY);
      if (last === today) return { alreadyDone: true, streak: readingStreak() };
      const yesterday = offsetDateKey(1);
      let n = parseInt(localStorage.getItem(READ_STREAK_KEY) || '0', 10) || 0;
      n = (last === yesterday) ? n + 1 : 1;
      localStorage.setItem(READ_LAST_KEY, today);
      localStorage.setItem(READ_STREAK_KEY, String(n));
      if (window.State && State.addStars) State.addStars(5, 'Read tables today');
      if (window.Confetti && Confetti.launch) Confetti.launch(60);
      if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('levelup');
      return { alreadyDone: false, streak: n };
    } catch (_) { return { alreadyDone: false, streak: 0 }; }
  }

  // ----- Web Speech wrapper (kid-friendly voice) -----
  let _cachedVoice = null;
  function _pickKidVoice() {
    if (_cachedVoice) return _cachedVoice;
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    if (!voices.length) return null;
    // Priority — first match wins. Kid/young voices first, then friendly female,
    // then any English voice. Only en-* voices considered for tables (English).
    const en = voices.filter(v => /^en[-_]/i.test(v.lang || ''));
    const candidates = en.length ? en : voices;
    const patterns = [
      /child|kid|junior/i,
      /samantha/i, /karen/i, /tessa/i,           // macOS / iOS friendly female
      /aria/i, /jenny/i, /zira/i,                // Windows / Edge friendly female
      /allison/i, /ava|salli|ivy|kimberly|joanna/i, // Polly-ish names
      /google.*us.*english/i,
      /female/i
    ];
    for (const p of patterns) {
      const v = candidates.find(x => p.test(x.name || ''));
      if (v) { _cachedVoice = v; return v; }
    }
    _cachedVoice = candidates[0];
    return _cachedVoice;
  }
  function speak(text, opts) {
    if (!('speechSynthesis' in window)) return;
    opts = opts || {};
    window.speechSynthesis.cancel();
    const fire = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate  = opts.rate  || 0.85;   // a touch slower — easier for a 9-year-old to follow
      u.pitch = opts.pitch || 1.45;   // higher pitch reads younger / less robotic
      const v = _pickKidVoice();
      if (v) u.voice = v;
      if (opts.onend) u.onend = opts.onend;
      window.speechSynthesis.speak(u);
    };
    // Voices load async on first page paint — wait if needed.
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.addEventListener('voiceschanged', fire, { once: true });
      // safety net — if voiceschanged never fires, still try after 500ms
      setTimeout(() => { if (!_cachedVoice) fire(); }, 500);
    } else {
      fire();
    }
  }

  function tableRowSpeech(a, b) {
    // "three sevens are twenty-one" — kid-friendly readback
    return [a, 'times', b, 'is', a * b].join(' ');
  }

  // ----- Public API -----
  window.TablesEngine = {
    TABLES: TABLES,
    HARD_PAIRS: HARD_PAIRS,
    todayTable: todayTable,
    todayLabel: todayLabel,
    pickFact: pickFact,
    pickQuestion: pickQuestion,
    getBest: getBest,
    recordBest: recordBest,
    recordBestLowerIsBetter: recordBestLowerIsBetter,
    hasCrown: hasCrown,
    awardCrown: awardCrown,
    listCrowns: listCrowns,
    isReadToday: isReadToday,
    readingStreak: readingStreak,
    markReadingDone: markReadingDone,
    speak: speak,
    tableRowSpeech: tableRowSpeech
  };
})();

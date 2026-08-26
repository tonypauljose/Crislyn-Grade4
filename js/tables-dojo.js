/* ==========================================================================
   TABLES DOJO — the engine
   --------------------------------------------------------------------------
   Crislyn can play the tables games and still not know her tables, because
   the games pick facts at RANDOM and remember nothing. This engine fixes the
   two things that were actually missing.

   1. IT REMEMBERS EVERY FACT SEPARATELY.
      66 facts (2..12 × 2..12, with a×b and b×a treated as one fact because
      they are one fact). Each carries its own history and its own fastest
      time, so practice can go where the gaps really are instead of spraying
      random questions.

   2. IT TEACHES BEFORE IT DRILLS, IN AN ORDER THAT BUILDS.
      The ladder is ×2 · ×10 · ×5 · ×4 · ×3 · ×9 · ×11 · ×6 · ×8 · ×7 · ×12.
      Every rung introduces only the facts whose BOTH factors she has already
      met, so rung 1 adds one fact and the last adds eleven — the load grows
      as she gets stronger, and 7s and 12s arrive when almost everything they
      touch is already known.

   The drill itself is INCREMENTAL REHEARSAL: a new fact is folded into a
   growing run of facts she already knows (roughly one unknown to nine known).
   That ratio beats straight drill on retention, and it keeps her mostly
   succeeding instead of mostly failing.

   A fact answered slower than 3 seconds is not counted as fluent — that is
   the line between "can work it out" and "knows it".

   No DOM in this file.
   ========================================================================== */

(function () {
  'use strict';

  const KEY = 'crislyn_tables_dojo_v1';
  const SCHEMA = 1;

  const FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  /* The teaching order. Each factor is a rung; a fact belongs to the rung of
     whichever of its two factors comes LAST here, because that is the moment
     both halves of it are finally known. */
  const LADDER = [2, 10, 5, 4, 3, 9, 11, 6, 8, 7, 12];

  const FLUENT_MS = 3000;   // slower than this is "worked out", not "known"
  const FLUENT_RUN = 3;     // fast + correct this many times in a row
  const FLUENT_DAYS = 2;    // on at least this many different days
  const KNOWN_RUN = 2;      // correct twice running = known, even if slow

  /* ------------------------------------------------------------------ maths */

  function key(a, b) {
    return Math.min(a, b) + 'x' + Math.max(a, b);
  }

  function parseKey(k) {
    const p = k.split('x').map(Number);
    return { a: p[0], b: p[1] };
  }

  /** Every fact, in ladder order. */
  function allFacts() {
    const seen = {}, out = [];
    LADDER.forEach(f => {
      LADDER.slice(0, LADDER.indexOf(f) + 1).forEach(g => {
        const k = key(f, g);
        if (!seen[k]) { seen[k] = true; out.push(k); }
      });
    });
    return out;
  }

  const ALL = allFacts();

  /** Which rung introduces this fact. */
  function rungOf(k) {
    const f = parseKey(k);
    return Math.max(LADDER.indexOf(f.a), LADDER.indexOf(f.b));
  }

  /* ------------------------------------------------------- the ladder rungs */

  const STRATEGY = {
    2:  { name: 'Doubles', line: 'Two of something is just it <b>doubled</b>.',
          how: '7 × 2 → double 7 → <b>14</b>' },
    10: { name: 'Add a zero', line: 'Ten of something is the number with a <b>0</b> on the end.',
          how: '7 × 10 → 7 then a zero → <b>70</b>' },
    5:  { name: 'Half of ten', line: 'Five is <b>half of ten</b>. Do the ten, then halve it.',
          how: '8 × 5 → 8 × 10 = 80 → half of 80 → <b>40</b>' },
    4:  { name: 'Double, double', line: 'Four is <b>two twos</b>. Double it, then double again.',
          how: '7 × 4 → double 7 = 14 → double 14 → <b>28</b>' },
    3:  { name: 'Double and one more', line: 'Three lots = <b>two lots plus one more lot</b>.',
          how: '7 × 3 → double 7 = 14 → add one more 7 → <b>21</b>' },
    9:  { name: 'Ten take one', line: 'Nine lots = <b>ten lots take one lot away</b>.',
          how: '7 × 9 → 7 × 10 = 70 → take away 7 → <b>63</b>' },
    11: { name: 'The twin digits', line: 'Up to nine, eleven just <b>repeats the digit</b>.',
          how: '7 × 11 → <b>77</b> · 8 × 11 → <b>88</b>' },
    6:  { name: 'Five and one more', line: 'Six lots = <b>five lots plus one more lot</b>.',
          how: '7 × 6 → 7 × 5 = 35 → add one more 7 → <b>42</b>' },
    8:  { name: 'Double, double, double', line: 'Eight is <b>two, twice, twice</b>. Double three times.',
          how: '7 × 8 → 14 → 28 → <b>56</b>' },
    7:  { name: 'The last ones standing', line: 'You already know most sevens backwards. Only a few are new.',
          how: '7 × 7 = <b>49</b> · 7 × 8 = <b>56</b> — say "five, six, seven, eight".' },
    12: { name: 'Ten and two more', line: 'Twelve lots = <b>ten lots plus two lots</b>.',
          how: '7 × 12 → 70 + 14 → <b>84</b>' }
  };

  const RUNGS = LADDER.map((f, i) => ({
    id: 'r' + f,
    factor: f,
    index: i,
    title: 'The ' + f + ' times table',
    strategy: STRATEGY[f],
    facts: ALL.filter(k => rungOf(k) === i)
  }));

  /* ------------------------------------------------------------- the state */

  const blank = () => ({
    right: 0, wrong: 0,
    run: 0,        // current correct streak
    fast: 0,       // current streak of correct AND under FLUENT_MS
    best: null,    // fastest correct answer, ms
    last: null,    // last answer time, ms
    days: [],      // day-keys with a correct answer
    seen: false    // has been taught on its rung
  });

  function todayKey(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') +
      '-' + String(t.getDate()).padStart(2, '0');
  }

  const TDojo = {
    key: KEY,
    state: null,
    FACTORS, LADDER, RUNGS, ALL, FLUENT_MS,

    init() {
      if (this.state) return this.state;
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
      if (!raw || raw.schema !== SCHEMA) {
        raw = { schema: SCHEMA, facts: {}, log: [], best: {}, created: todayKey() };
      }
      raw.facts = raw.facts || {};
      raw.log = raw.log || [];
      raw.best = raw.best || {};
      this.state = raw;
      return raw;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { /* quota */ }
    },

    reset() {
      this.state = { schema: SCHEMA, facts: {}, log: [], best: {}, created: todayKey() };
      this.save();
    },

    fact(a, b) {
      this.init();
      const k = typeof b === 'undefined' ? a : key(a, b);
      if (!this.state.facts[k]) this.state.facts[k] = blank();
      return this.state.facts[k];
    },

    /**
     * 0 not met · 1 learning · 2 known (right, but slow) · 3 fluent (under 3s)
     */
    status(a, b) {
      const f = this.fact(a, b);
      if (!f.right && !f.wrong) return 0;
      if (f.fast >= FLUENT_RUN && f.days.length >= FLUENT_DAYS) return 3;
      if (f.run >= KNOWN_RUN) return 2;
      return 1;
    },

    isKnown(k) { return this.status(k) >= 2; },
    isFluent(k) { return this.status(k) === 3; },

    /**
     * Record one answer. Time matters as much as correctness here — knowing a
     * fact means producing it, not reconstructing it.
     */
    record(a, b, correct, ms) {
      this.init();
      const k = typeof b === 'number' ? key(a, b) : a;
      const f = this.fact(k);
      const today = todayKey();
      const before = this.status(k);

      f.last = ms || null;
      if (correct) {
        f.right++;
        f.run++;
        if (f.days.indexOf(today) === -1) f.days.push(today);
        if (ms && (f.best === null || ms < f.best)) f.best = ms;
        if (ms && ms <= FLUENT_MS) f.fast++; else f.fast = 0;
      } else {
        f.wrong++;
        f.run = 0;
        f.fast = 0;
      }
      f.seen = true;
      this.save();

      const after = this.status(k);
      return { before, after, justFluent: after === 3 && before !== 3, fact: k };
    },

    markSeen(k) {
      this.init();
      this.fact(k).seen = true;
      this.save();
    },

    /* ------------------------------------------------------------- the rungs */

    rung(id) { return RUNGS.filter(r => r.id === id)[0] || null; },

    rungReport(r) {
      const known = r.facts.filter(k => this.isKnown(k)).length;
      const fluent = r.facts.filter(k => this.isFluent(k)).length;
      return {
        id: r.id, factor: r.factor, title: r.title, total: r.facts.length,
        known, fluent,
        taught: r.facts.every(k => this.fact(k).seen),
        /* A rung is passed when every fact it introduced is fluent. */
        done: fluent === r.facts.length,
        pct: r.facts.length ? Math.round((fluent / r.facts.length) * 100) : 0
      };
    },

    /** Rungs open in order; the next one unlocks when the one before is known. */
    isUnlocked(r) {
      if (r.index === 0) return true;
      const prev = RUNGS[r.index - 1];
      const rep = this.rungReport(prev);
      return rep.known === prev.total;   // known is enough to move on; fluency keeps building
    },

    currentRung() {
      this.init();
      for (let i = 0; i < RUNGS.length; i++) {
        const rep = this.rungReport(RUNGS[i]);
        if (!rep.done && this.isUnlocked(RUNGS[i])) return RUNGS[i];
      }
      return RUNGS[RUNGS.length - 1];
    },

    /** Facts on this rung she has not got to "known" yet — what to teach today. */
    targetsIn(r) {
      return r.facts.filter(k => this.status(k) < 2);
    },

    knownFacts() {
      this.init();
      return ALL.filter(k => this.isKnown(k));
    },

    /* ------------------------------------------------- incremental rehearsal */

    /**
     * The fold-in. One unknown fact is rehearsed against a growing run of
     * known ones:
     *     NEW
     *     NEW · k1
     *     NEW · k1 · k2
     *     NEW · k1 · k2 · k3   …
     * so she meets the new fact often, always surrounded by wins. Nine knowns
     * is the full ladder; with fewer knowns available it uses what there is.
     */
    foldIn(newFact, opts) {
      opts = opts || {};
      const depth = Math.max(1, Math.min(opts.depth || 6, 9));
      const pool = (opts.knowns || this.knownFacts()).filter(k => k !== newFact);
      const rng = opts.rng || Math.random;

      /* Prefer knowns that are due a refresh — least fluent first. */
      const ordered = pool.slice().sort((x, y) => {
        const fx = this.fact(x), fy = this.fact(y);
        return (fx.fast - fy.fast) || ((fy.best || 9e9) - (fx.best || 9e9));
      });
      const shuffled = ordered.slice(0, Math.max(depth, 3));
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
      }

      const seq = [];
      const n = Math.min(depth, shuffled.length);
      for (let i = 0; i <= n; i++) {
        seq.push(newFact);
        for (let j = 0; j < i; j++) seq.push(shuffled[j]);
      }
      return seq;
    },

    /* --------------------------------------------------------- the speed set */

    /**
     * A timed set, weighted towards what is shaky. Never asks something she
     * has not met — a speed round is a check, not a lesson.
     */
    speedSet(n, opts) {
      this.init();
      opts = opts || {};
      const rng = opts.rng || Math.random;
      const met = ALL.filter(k => this.fact(k).seen || this.status(k) > 0);
      const pool = met.length ? met : RUNGS[0].facts.slice();

      const weight = k => {
        const s = this.status(k);
        if (s === 0) return 1;
        if (s === 1) return 6;   // shaky — ask it most
        if (s === 2) return 3;   // known but slow
        return 1;                // fluent — keep it ticking over
      };

      const bag = [];
      pool.forEach(k => { for (let i = 0; i < weight(k); i++) bag.push(k); });

      /* Avoid asking the same fact twice running — unless there is nothing
         else met yet, which is exactly where she starts on day one. A speed
         check that runs out of questions after four seconds is worse than a
         repeat. */
      const spread = pool.length > 2;
      const out = [];
      let guard = 0;
      while (out.length < n && guard++ < n * 40) {
        const k = bag[Math.floor(rng() * bag.length)];
        if (spread && out.length && out[out.length - 1] === k) continue;
        out.push(k);
      }
      return out;
    },

    /* -------------------------------------------------------------- the wall */

    /** 11 × 11 grid of every fact and how solid it is. */
    wall() {
      return FACTORS.map(a => FACTORS.map(b => ({
        a, b, k: key(a, b), product: a * b,
        status: this.status(a, b),
        best: this.fact(a, b).best
      })));
    },

    report() {
      this.init();
      const counts = [0, 0, 0, 0];
      ALL.forEach(k => { counts[this.status(k)]++; });
      return {
        total: ALL.length,
        untouched: counts[0], learning: counts[1], known: counts[2], fluent: counts[3],
        pct: Math.round((counts[3] / ALL.length) * 100),
        knownPct: Math.round(((counts[2] + counts[3]) / ALL.length) * 100)
      };
    },

    /** The handful she is getting wrong most — what a grown-up should sit with. */
    trouble(limit) {
      this.init();
      return ALL
        .map(k => {
          const f = this.fact(k);
          const p = parseKey(k);
          return { k, a: p.a, b: p.b, product: p.a * p.b, wrong: f.wrong, right: f.right,
            status: this.status(k), best: f.best };
        })
        .filter(r => r.wrong > 0 && r.status < 3)
        .sort((x, y) => (y.wrong - x.wrong) || (x.right - y.right))
        .slice(0, limit || 8);
    },

    /* ------------------------------------------------------------- sessions */

    finishSession(summary) {
      this.init();
      this.state.log.push({
        date: todayKey(), kind: summary.kind || 'practice',
        n: summary.n || 0, right: summary.right || 0, secs: summary.secs || 0
      });
      if (this.state.log.length > 300) this.state.log = this.state.log.slice(-300);
      this.save();
    },

    doneToday() {
      this.init();
      const t = todayKey();
      return this.state.log.filter(l => l.date === t).reduce((n, l) => n + l.n, 0);
    },

    streakDays() {
      this.init();
      const days = {};
      this.state.log.forEach(l => { days[l.date] = true; });
      let n = 0;
      const d = new Date();
      if (!days[todayKey()]) d.setDate(d.getDate() - 1);
      for (;;) {
        if (!days[todayKey(d)]) break;
        n++; d.setDate(d.getDate() - 1);
        if (n > 400) break;
      }
      return n;
    },

    /** Best score on the timed check. */
    recordBest(kind, value) {
      this.init();
      const cur = this.state.best[kind];
      if (cur === undefined || value > cur) {
        this.state.best[kind] = value;
        this.save();
        return true;
      }
      return false;
    },
    getBest(kind) { this.init(); return this.state.best[kind]; },

    key, parseKey, rungOf, todayKey
  };

  window.TDojo = TDojo;
})();

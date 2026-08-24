/* ==========================================================================
   HALF-YEARLY 2026 — MASTERY ENGINE
   --------------------------------------------------------------------------
   Pure logic. No DOM. Decides WHAT Crislyn practises next and WHEN a skill
   counts as learnt.

   The rules are built on four findings that hold up well in real classrooms:

   1. RETRIEVAL PRACTICE — every turn is a recall attempt, never a re-read.
   2. SPACED REPETITION  — a Leitner box moves a skill further into the future
                           each time she gets it right; a mistake sends it back
                           to box 1. Intervals are squeezed to fit the ~3 weeks
                           before the exam.
   3. MASTERY LEARNING   — a skill is only "done" after SIX correct recalls
                           spread over at least THREE different days, with a
                           current run of three in a row. Not after one lucky go.
   4. DESIRABLE DIFFICULTY — aim for roughly 70–80% correct. Too easy teaches
                           nothing, so the item level rises when she is fluent
                           and drops the moment she struggles.

   Everything persists to localStorage under HY_KEY.
   ========================================================================== */

(function () {
  'use strict';

  const HY_KEY = 'crislyn_half_yearly_v1';
  const SCHEMA = 1;

  /* Leitner intervals in DAYS, index = box. Box 0 = brand new / just failed. */
  const INTERVALS = [0, 1, 2, 4, 7, 12];
  const MAX_BOX = INTERVALS.length - 1;

  /* Mastery bar */
  const MASTER_RIGHT = 6;   // total correct recalls needed
  const MASTER_DAYS = 3;    // spread over at least this many distinct days
  const MASTER_STREAK = 3;  // and currently on a run of this many
  const MASTER_BOX = 3;     // and has survived at least this box

  /* Session shape */
  const DEFAULT_TARGET = 24;   // items in a daily mission (~20-25 min)
  const NEW_PER_DAY = 3;       // floor for new skills introduced per day
  const NEW_REPS = 3;          // goes at a brand-new skill on the day it appears

  /* ---------------------------------------------------------------- utils */

  function todayKey(d) {
    const t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') +
      '-' + String(t.getDate()).padStart(2, '0');
  }

  function dayNumber(dateStr) {
    // whole days since epoch, so comparisons ignore the time of day
    const p = (dateStr || todayKey()).split('-').map(Number);
    return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
  }

  /** Small deterministic PRNG (mulberry32) so a day's mission is stable. */
  function rngFrom(seed) {
    let a = seed >>> 0;
    const fn = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    fn.int = (min, max) => min + Math.floor(fn() * (max - min + 1));
    fn.pick = arr => arr[Math.floor(fn() * arr.length)];
    fn.shuffle = function (arr) {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(fn() * (i + 1));
        const tmp = a2[i]; a2[i] = a2[j]; a2[j] = tmp;
      }
      return a2;
    };
    return fn;
  }

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ------------------------------------------------------------- item pool */
  /* Subject data files register here. Two shapes are supported:
       HY.register(skillId, fn)      fn(level, rng) -> item      (generated)
       HY.registerBank(skillId, [])  fixed items, each with .level (1|2|3)
     Both may be present for the same skill; generated items top up the bank. */

  const GENERATORS = {};
  const BANKS = {};

  function register(skillId, fn) { GENERATORS[skillId] = fn; }

  function registerBank(skillId, items) {
    BANKS[skillId] = (BANKS[skillId] || []).concat(
      items.map((it, i) => Object.assign({ level: 1 }, it, {
        id: it.id || (skillId + '-b' + i), skill: skillId
      }))
    );
  }

  function hasContent(skillId) {
    return !!GENERATORS[skillId] || (BANKS[skillId] && BANKS[skillId].length > 0);
  }

  /**
   * Produce one item for a skill at the requested level.
   * Prefers unseen bank items at that level, then the generator, then any
   * bank item at all. `avoid` is a Set of item ids already used this session.
   */
  function makeItem(skillId, level, rng, avoid) {
    const skill = window.HY_SKILLS.get(skillId);
    const bank = BANKS[skillId] || [];
    const seen = avoid || new Set();

    let pool = bank.filter(it => it.level === level && !seen.has(it.id));
    if (!pool.length) pool = bank.filter(it => Math.abs(it.level - level) <= 1 && !seen.has(it.id));

    const useBank = pool.length && (!GENERATORS[skillId] || rng() < 0.65);
    let item = null;

    if (useBank) {
      item = Object.assign({}, rng.pick(pool));
    } else if (GENERATORS[skillId]) {
      item = GENERATORS[skillId](level, rng);
      if (item) {
        item.skill = skillId;
        item.id = item.id || (skillId + '-g' + Math.floor(rng() * 1e9).toString(36));
      }
    } else if (bank.length) {
      item = Object.assign({}, rng.pick(bank));
    }

    if (!item) return null;
    item.level = item.level || level;
    item.skillName = skill ? skill.name : skillId;
    item.subject = skill ? skill.subject : 'maths';
    if (skill && skill.lang) item.lang = item.lang || skill.lang;
    return item;
  }

  /* ------------------------------------------------------------- the state */

  const blankSkill = () => ({
    box: 0,        // Leitner box, 0..MAX_BOX
    streak: 0,     // current run of correct answers
    best: 0,       // longest run ever
    right: 0,      // total correct
    wrong: 0,      // total incorrect
    level: 1,      // current item difficulty 1..3
    days: [],      // distinct day-keys on which she answered correctly
    due: null,     // day-number when this is next due
    first: null,   // day-key first attempted
    last: null     // day-key last attempted
  });

  const HY = {
    key: HY_KEY,
    state: null,

    /* ------------------------------------------------------------- storage */

    init() {
      if (this.state) return this.state;
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(HY_KEY) || 'null'); } catch (e) { raw = null; }
      if (!raw || raw.schema !== SCHEMA) {
        raw = { schema: SCHEMA, skills: {}, log: [], sessions: 0, totalItems: 0, created: todayKey() };
      }
      raw.skills = raw.skills || {};
      raw.log = raw.log || [];
      this.state = raw;
      return raw;
    },

    save() {
      try { localStorage.setItem(HY_KEY, JSON.stringify(this.state)); } catch (e) { /* quota */ }
    },

    reset() {
      this.state = { schema: SCHEMA, skills: {}, log: [], sessions: 0, totalItems: 0, created: todayKey() };
      this.save();
    },

    /* -------------------------------------------------------- skill status */

    skill(id) {
      this.init();
      if (!this.state.skills[id]) this.state.skills[id] = blankSkill();
      return this.state.skills[id];
    },

    /**
     * 0 untouched · 1 just met · 2 getting it · 3 solid · 4 mastered
     */
    level(id) {
      const s = this.skill(id);
      if (!s.right && !s.wrong) return 0;
      if (this.isMastered(id)) return 4;
      if (s.box >= MASTER_BOX && s.streak >= 2) return 3;
      if (s.streak >= 2 || s.box >= 1) return 2;
      return 1;
    },

    /**
     * Mastery is STICKY. Once earned it stays on the board even though the
     * current streak will keep rising and falling — a badge that flickers off
     * after one slip is demoralising and tells the parent nothing. It is only
     * withdrawn if the skill genuinely decays (box falls below 2).
     */
    isMastered(id) {
      const s = this.skill(id);
      return s.mastered === true;
    },

    meetsMasteryBar(id) {
      const s = this.skill(id);
      return s.right >= MASTER_RIGHT &&
        s.days.length >= MASTER_DAYS &&
        s.streak >= MASTER_STREAK &&
        s.box >= MASTER_BOX;
    },

    /** How close this skill is to mastery, 0..1 — drives the ring fill. */
    progress(id) {
      const s = this.skill(id);
      if (!s.right && !s.wrong) return 0;
      if (s.mastered) return 1;
      const byRight = Math.min(1, s.right / MASTER_RIGHT);
      const byDays = Math.min(1, s.days.length / MASTER_DAYS);
      const byBox = Math.min(1, s.box / MASTER_BOX);
      const byStreak = Math.min(1, s.streak / MASTER_STREAK);
      return Math.round((byRight * 0.35 + byBox * 0.3 + byDays * 0.2 + byStreak * 0.15) * 100) / 100;
    },

    accuracy(id) {
      const s = this.skill(id);
      const n = s.right + s.wrong;
      return n ? Math.round((s.right / n) * 100) : null;
    },

    /* ------------------------------------------------------------ recording */

    /**
     * Record one attempt. This is the ONLY place mastery state changes.
     * @returns {{levelBefore:number, levelAfter:number, justMastered:boolean, nextDue:number}}
     */
    record(skillId, correct) {
      this.init();
      const s = this.skill(skillId);
      const today = todayKey();
      const dnum = dayNumber(today);
      const before = this.level(skillId);

      if (!s.first) s.first = today;
      s.last = today;

      if (correct) {
        s.right++;
        s.streak++;
        if (s.streak > s.best) s.best = s.streak;
        if (s.days.indexOf(today) === -1) s.days.push(today);
        // Move up a box, but only once per day per skill — otherwise a single
        // sitting would "prove" long-term retention it hasn't earned.
        if (s.due === null || s.due <= dnum) s.box = Math.min(MAX_BOX, s.box + 1);
        // Fluent? make it harder.
        if (s.streak >= 3 && s.level < 3) { s.level++; s.streak = Math.max(s.streak, MASTER_STREAK); }
      } else {
        s.wrong++;
        s.streak = 0;
        s.box = Math.max(0, s.box - 1);   // one step back, not two — two days of
        if (s.level > 1) s.level--;        // progress should not vanish for one slip
      }

      if (this.meetsMasteryBar(skillId)) s.mastered = true;
      else if (s.mastered && s.box < 2) s.mastered = false;   // genuine decay only

      s.due = dnum + INTERVALS[s.box];
      this.state.totalItems++;
      this.save();

      const after = this.level(skillId);
      return {
        levelBefore: before,
        levelAfter: after,
        justMastered: after === 4 && before !== 4,
        nextDue: s.due
      };
    },

    /* ------------------------------------------------------------- planning */

    daysToExam() {
      const exam = dayNumber(window.HY_SKILLS.examDate);
      return exam - dayNumber(todayKey());
    },

    /** Skills whose spaced review has come around. Weakest box first. */
    dueSkills() {
      this.init();
      const dnum = dayNumber(todayKey());
      return window.HY_SKILLS.list
        .filter(sk => hasContent(sk.id))
        .filter(sk => {
          const s = this.state.skills[sk.id];
          return s && s.due !== null && s.due <= dnum;
        })
        .sort((a, b) => {
          const sa = this.state.skills[a.id], sb = this.state.skills[b.id];
          if (sa.box !== sb.box) return sa.box - sb.box;      // shakiest first
          return (b.weight || 1) - (a.weight || 1);           // then heaviest
        });
    },

    /**
     * Skills never attempted. Round-robins the three subjects so English and
     * हिंदी start on day one instead of queueing behind the whole of Maths —
     * within a subject the syllabus order is kept.
     */
    newSkills() {
      this.init();
      const bySub = { maths: [], english: [], hindi: [] };
      window.HY_SKILLS.list.forEach(sk => {
        if (!hasContent(sk.id)) return;
        const s = this.state.skills[sk.id];
        if (!s || (!s.right && !s.wrong)) (bySub[sk.subject] || bySub.maths).push(sk);
      });
      const order = ['maths', 'english', 'hindi'];
      const total = order.reduce((n, k) => n + bySub[k].length, 0);
      const out = [];
      let i = 0;
      while (out.length < total && i < total * 4 + 12) {
        const sub = order[i % order.length];
        if (bySub[sub].length) out.push(bySub[sub].shift());
        i++;
      }
      return out;
    },

    /**
     * How many questions a day it actually takes to finish the portion before
     * the exam. Shown to the parent so the target is honest rather than a
     * round number that quietly runs out of road.
     */
    recommendedTarget() {
      this.init();
      const skills = window.HY_SKILLS.list.filter(sk => hasContent(sk.id));
      let attempts = 0, visits = 0;
      skills.forEach(sk => {
        const s = this.skill(sk.id);
        attempts += Math.max(0, MASTER_RIGHT - s.right) / 0.72;  // ~72% right
        visits += Math.max(0, MASTER_BOX - s.box) + (s.days.length < MASTER_DAYS ? 1 : 0);
      });
      const days = Math.max(1, this.daysToExam());
      // Two constraints: enough total attempts, AND enough separate appearances
      // (a skill climbs one Leitner box per day, no matter how often it is asked).
      return Math.max(12, Math.min(40, Math.round(Math.max(
        attempts * 1.15 / days,
        visits * 1.6 / days
      ))));
    },

    /** Attempted, not mastered, not due yet — good filler. */
    warmSkills() {
      this.init();
      const dnum = dayNumber(todayKey());
      return window.HY_SKILLS.list
        .filter(sk => hasContent(sk.id))
        .filter(sk => {
          const s = this.state.skills[sk.id];
          return s && (s.right || s.wrong) && !this.isMastered(sk.id) && s.due > dnum;
        })
        .sort((a, b) => this.progress(a.id) - this.progress(b.id));
    },

    /**
     * Build today's mission.
     *
     * @param {object} opts
     *   target   how many items (default 24)
     *   subject  'maths'|'english'|'hindi'|null for the interleaved mix
     *   mode     'daily' | 'subject' | 'weak' | 'skill'
     *   skillId  when mode === 'skill'
     *   seed     override the daily seed (used by "one more round")
     */
    buildSession(opts) {
      this.init();
      opts = opts || {};
      const target = opts.target || DEFAULT_TARGET;
      const mode = opts.mode || 'daily';
      const seedStr = (opts.seed || todayKey()) + '|' + mode + '|' + (opts.subject || 'all') +
        '|' + (opts.skillId || '') + '|' + (this.state.sessions || 0);
      const rng = rngFrom(hashStr(seedStr));

      let plan = [];   // list of skill ids, one per item slot

      if (mode === 'skill' && opts.skillId) {
        for (let i = 0; i < target; i++) plan.push(opts.skillId);

      } else {
        const inSubject = sk => !opts.subject || sk.subject === opts.subject;

        let due = this.dueSkills().filter(inSubject);
        let fresh = this.newSkills().filter(inSubject);
        let warm = this.warmSkills().filter(inSubject);

        if (mode === 'weak') {
          // Everything that is not mastered, shakiest first, ignore the schedule.
          const weak = window.HY_SKILLS.list
            .filter(sk => hasContent(sk.id) && inSubject(sk) && !this.isMastered(sk.id))
            .sort((a, b) => this.progress(a.id) - this.progress(b.id));
          due = weak; fresh = []; warm = [];
        }

        /* --- budget the session --------------------------------------
           New material must be RESERVED, not left over. Otherwise the review
           pile grows until nothing new is ever introduced, and whole subjects
           are never met before the exam.

           The introduction rate is paced against the calendar: enough new
           skills per day to have met the entire portion with ~5 days spare
           for consolidation. Reviews then get whatever is left, which is
           never less than 45% of the session.                              */

        let newCount = 0;
        if (mode !== 'weak' && fresh.length) {
          const runway = Math.max(1, this.daysToExam() - 5);
          const paced = Math.ceil(fresh.length / runway);
          newCount = Math.max(NEW_PER_DAY, paced);
          newCount = Math.min(newCount, fresh.length,
            Math.floor((target * 0.55) / NEW_REPS));   // never crowd out review
        }
        const newSlots = newCount * NEW_REPS;
        const reviewBudget = Math.max(0, target - newSlots);

        /* Breadth before depth. A skill only climbs a Leitner box once per
           day, so what it needs most is to APPEAR on many separate days.
           When more skills are due than the session can hold, give every one
           of them a single question rather than giving a lucky few three. */
        const roomy = due.length * 2 <= reviewBudget;
        const review = [];
        due.forEach(sk => {
          const s = this.skill(sk.id);
          const reps = roomy ? (s.box <= 2 ? 2 : 1) : 1;
          for (let i = 0; i < reps; i++) review.push(sk.id);
        });
        plan = plan.concat(review.slice(0, reviewBudget));

        // Brand-new skills, three goes each so the first meeting sticks.
        for (let i = 0; i < newCount; i++) {
          for (let r = 0; r < NEW_REPS; r++) plan.push(fresh[i].id);
        }

        // Any review that did not fit, if there is still room.
        if (plan.length < target && review.length > reviewBudget) {
          plan = plan.concat(review.slice(reviewBudget, reviewBudget + (target - plan.length)));
        }

        // Top up from warm skills if we are still short.
        let wi = 0;
        while (plan.length < target && warm.length) {
          plan.push(warm[wi % warm.length].id);
          wi++;
          if (wi > target * 3) break;
        }

        // Still short (e.g. everything mastered)? Recycle by weight.
        if (plan.length < target) {
          const pool = window.HY_SKILLS.list.filter(sk => hasContent(sk.id) && inSubject(sk));
          let gi = 0;
          while (plan.length < target && pool.length) {
            plan.push(pool[gi % pool.length].id); gi++;
            if (gi > target * 4) break;
          }
        }

        plan = plan.slice(0, target);
        plan = interleave(rng.shuffle(plan));
      }

      // Turn the plan into real items.
      const used = new Set();
      const items = [];
      plan.forEach(skillId => {
        const lvl = mode === 'weak' ? 1 : this.skill(skillId).level;
        const it = makeItem(skillId, lvl, rng, used);
        if (it) { used.add(it.id); items.push(it); }
      });

      return items;
    },

    /* -------------------------------------------------------- session close */

    finishSession(summary) {
      this.init();
      this.state.sessions = (this.state.sessions || 0) + 1;
      this.state.log.push({
        date: todayKey(),
        n: summary.total,
        right: summary.right,
        mode: summary.mode || 'daily',
        subject: summary.subject || 'mix',
        secs: summary.secs || 0
      });
      if (this.state.log.length > 200) this.state.log = this.state.log.slice(-200);
      this.save();
    },

    doneToday() {
      this.init();
      const t = todayKey();
      return this.state.log.filter(l => l.date === t)
        .reduce((n, l) => n + l.n, 0);
    },

    /** Consecutive days with at least one session, counting back from today. */
    streakDays() {
      this.init();
      const days = {};
      this.state.log.forEach(l => { days[l.date] = true; });
      let n = 0;
      const d = new Date();
      // today does not break the streak if she hasn't started yet
      if (!days[todayKey()]) d.setDate(d.getDate() - 1);
      for (; ;) {
        if (!days[todayKey(d)]) break;
        n++;
        d.setDate(d.getDate() - 1);
        if (n > 400) break;
      }
      return n;
    },

    /* ------------------------------------------------------------ reporting */

    subjectReport(sub) {
      this.init();
      const skills = window.HY_SKILLS.forSubject(sub).filter(sk => hasContent(sk.id));
      const counts = [0, 0, 0, 0, 0];
      let progSum = 0;
      skills.forEach(sk => { counts[this.level(sk.id)]++; progSum += this.progress(sk.id); });
      return {
        subject: sub,
        total: skills.length,
        untouched: counts[0],
        met: counts[1],
        getting: counts[2],
        solid: counts[3],
        mastered: counts[4],
        pct: skills.length ? Math.round((progSum / skills.length) * 100) : 0
      };
    },

    overallPct() {
      const subs = ['maths', 'english', 'hindi'];
      const rs = subs.map(s => this.subjectReport(s));
      const tot = rs.reduce((n, r) => n + r.total, 0);
      if (!tot) return 0;
      return Math.round(rs.reduce((n, r) => n + r.pct * r.total, 0) / tot);
    },

    /** The list a parent should actually sit down with, worst first. */
    troubleSpots(limit) {
      this.init();
      return window.HY_SKILLS.list
        .filter(sk => hasContent(sk.id))
        .map(sk => ({
          id: sk.id, name: sk.name, subject: sk.subject, topic: sk.topic,
          flag: sk.flag, watch: sk.watch,
          acc: this.accuracy(sk.id),
          lvl: this.level(sk.id),
          prog: this.progress(sk.id),
          wrong: this.skill(sk.id).wrong
        }))
        .filter(r => r.lvl > 0 && r.lvl < 3 && r.wrong > 0)
        .sort((a, b) => (a.acc === null ? 101 : a.acc) - (b.acc === null ? 101 : b.acc))
        .slice(0, limit || 6);
    },

    /* --------------------------------------------------------------- expose */
    hasContent,
    makeItem,
    register,
    registerBank,
    rngFrom,
    hashStr,
    todayKey,
    dayNumber,
    INTERVALS,
    MASTER_RIGHT,
    DEFAULT_TARGET
  };

  /**
   * Spread the plan so the same skill rarely appears twice in a row.
   * (Interleaving beats blocking for transfer — she must choose the method,
   * not just repeat it.)
   */
  function interleave(plan) {
    const out = [];
    const rest = plan.slice();
    let guard = 0;
    while (rest.length && guard++ < 5000) {
      let idx = 0;
      const last = out[out.length - 1];
      const prev = out[out.length - 2];
      while (idx < rest.length && (rest[idx] === last || rest[idx] === prev)) idx++;
      if (idx >= rest.length) idx = 0;
      out.push(rest.splice(idx, 1)[0]);
    }
    return out;
  }

  window.HY = HY;
})();

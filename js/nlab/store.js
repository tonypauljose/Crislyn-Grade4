/* ============================================================
   NUMBERS LAB — store + shared utilities
   Creates the window.NLAB namespace. Owns its own localStorage
   key (default nlab_progress_v1) and NEVER touches the host
   site's keys. Bridges XP one-way into the host if present.
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var CFG = window.NLAB_CONFIG || {};

  /* ---------------- utilities ---------------- */
  var U = NLAB.util = {
    esc: function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    el: function (tag, attrs, html) {
      var e = document.createElement(tag);
      if (attrs) for (var k in attrs) {
        if (k === 'class') e.className = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'text') e.textContent = attrs[k];
        else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
      }
      if (html != null) e.innerHTML = html;
      return e;
    },
    randInt: function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    clamp: function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); },
    /* "Read to me" — Web Speech API, gracefully no-op if unsupported */
    speak: function (text) {
      try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' '));
        u.rate = 0.95; u.pitch = 1.05;
        window.speechSynthesis.speak(u);
      } catch (_) {}
    },
    stopSpeak: function () { try { window.speechSynthesis.cancel(); } catch (_) {} }
  };

  /* ---------------- self-contained sound ---------------- */
  var SOUND_KEY = 'nlab_sound';
  var SFX = NLAB.sfx = {
    on: (function () { try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch (_) { return true; } })(),
    ctx: null,
    setOn: function (v) { this.on = !!v; try { localStorage.setItem(SOUND_KEY, v ? 'on' : 'off'); } catch (_) {} },
    _ctx: function () {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    _tone: function (freq, dur, type, gain, at) {
      if (!this.on) return;
      var ctx = this._ctx(); if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(gain || 0.14, ctx.currentTime + (at || 0) + 0.01);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + (at || 0) + dur);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + (at || 0));
      o.stop(ctx.currentTime + (at || 0) + dur + 0.04);
    },
    tap: function () { this._tone(660, 0.05, 'square', 0.08); },
    ok: function () { this._tone(659, 0.11, 'sine', 0.14); this._tone(784, 0.14, 'sine', 0.14, 0.09); this._tone(988, 0.18, 'sine', 0.14, 0.18); },
    no: function () { this._tone(220, 0.12, 'sawtooth', 0.1); this._tone(165, 0.2, 'sawtooth', 0.1, 0.1); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { SFX._tone(f, 0.2, 'sine', 0.16, i * 0.11); }); },
    badge: function () { this._tone(1319, 0.1, 'sine', 0.14); this._tone(1760, 0.14, 'sine', 0.14, 0.08); }
  };

  /* ---------------- confetti (self-contained) ---------------- */
  NLAB.confetti = function (count) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    count = count || 70;
    var colors = [CFG.accent || '#7C3AED', CFG.accent2 || '#14B8A6', '#FBBF24', '#F472B6', '#34D399'];
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'nl-confetti';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 4200); })(p);
    }
    // also fire the host's confetti if it exists (purely additive)
    try { if (window.App && typeof App.launchConfetti === 'function') App.launchConfetti(count); } catch (_) {}
  };

  /* ---------------- progress store ---------------- */
  var KEY = CFG.storageKey || 'nlab_progress_v1';
  var THEME_KEY = 'nlab_theme';

  function blank() {
    return { v: 1, lastVisited: null, daysVisited: [], modules: {}, badges: [], practice: { runs: 0, bestStreak: 0 } };
  }
  function todayKey() {
    try { return new Intl.DateTimeFormat('en-CA').format(new Date()); }
    catch (_) { return '' + new Date().getFullYear(); }
  }

  var Store = NLAB.store = {
    data: blank(),
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) { var d = JSON.parse(raw); if (d && d.v) this.data = Object.assign(blank(), d); }
      } catch (_) { this.data = blank(); }
      return this.data;
    },
    save: function () { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (_) {} },
    all: function () { return this.data; },

    mod: function (id) {
      if (!this.data.modules[id]) this.data.modules[id] = { stages: {}, done: false, bestQuiz: 0, lastStageIdx: 0 };
      return this.data.modules[id];
    },
    markStage: function (id, idx) { this.mod(id).stages[idx] = true; this.save(); },
    isStageDone: function (id, idx) { return !!this.mod(id).stages[idx]; },
    setLastStage: function (id, idx) { this.mod(id).lastStageIdx = idx; this.save(); },
    moduleProgress: function (id, total) {
      var m = this.mod(id), done = 0;
      for (var k in m.stages) if (m.stages[k]) done++;
      return { done: done, total: total, complete: m.done, pct: total ? Math.round(done / total * 100) : 0 };
    },
    setModuleDone: function (id) { this.mod(id).done = true; this.save(); },
    isModuleDone: function (id) { return !!this.mod(id).done; },
    doneCount: function () { var n = 0, m = this.data.modules; for (var k in m) if (m[k].done) n++; return n; },
    recordQuiz: function (id, pct) { var m = this.mod(id); if (pct > m.bestQuiz) m.bestQuiz = pct; this.save(); },
    bestQuiz: function (id) { return this.mod(id).bestQuiz || 0; },

    addBadge: function (id) { if (this.data.badges.indexOf(id) < 0) { this.data.badges.push(id); this.save(); return true; } return false; },
    hasBadge: function (id) { return this.data.badges.indexOf(id) >= 0; },
    badges: function () { return this.data.badges.slice(); },

    recordPractice: function (streak) {
      this.data.practice.runs++;
      if (streak > this.data.practice.bestStreak) this.data.practice.bestStreak = streak;
      this.save();
    },

    markVisit: function () {
      var t = todayKey();
      this.data.lastVisited = t;
      if (this.data.daysVisited.indexOf(t) < 0) this.data.daysVisited.push(t);
      this.save();
    },

    reset: function () { this.data = blank(); this.save(); },

    /* theme persisted separately so it survives a progress reset */
    getTheme: function () { try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (_) { return 'light'; } },
    setTheme: function (t) { try { localStorage.setItem(THEME_KEY, t); } catch (_) {} },

    /* ONE-WAY bridge: award XP/stars into the host site if present.
       Never reads host state, never overwrites it. Silent no-op when absent. */
    bridgeXP: function (amount, reason) {
      try {
        var t = CFG.hostXP;
        if (t === 'Progress' && window.Progress && typeof window.Progress.addXP === 'function') {
          window.Progress.addXP(amount, reason || 'Numbers Lab');
        } else if (t === 'State' && window.State && typeof window.State.addStars === 'function') {
          window.State.addStars(Math.max(1, Math.round(amount / 5)), reason || 'Numbers Lab');
        }
      } catch (_) {}
      // simple analytics, only if the host already provides it (Crislyn)
      try {
        if (window.Analytics && typeof window.Analytics.track === 'function') window.Analytics.track('nlab_xp', { amount: amount, reason: reason });
        else if (window.analytics && typeof window.analytics.track === 'function') window.analytics.track('nlab_xp', { amount: amount, reason: reason });
      } catch (_) {}
    }
  };

  Store.load();
})();

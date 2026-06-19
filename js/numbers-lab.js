/* ============================================================
   NUMBERS LAB — app shell
   Hash-routed single-page "journey": map → mission → stages.
   Exposes only window.NumbersLab. Reads window.NLAB_* globals.
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var CFG = window.NLAB_CONFIG || {};
  var MODS = window.NLAB_MODULES || [];
  var QUIZ = window.NLAB_QUIZ || {};
  var Store = NLAB.store, Widgets = NLAB.widgets, Guide = NLAB.guide, U = NLAB.util, SFX = NLAB.sfx;

  var host, root, view, current = { destroy: function () {} };
  var LEVEL = CFG.defaultLevel || 'adventurer';

  function byId(id) { for (var i = 0; i < MODS.length; i++) if (MODS[i].id === id) return MODS[i]; return null; }
  function modIndex(id) { for (var i = 0; i < MODS.length; i++) if (MODS[i].id === id) return i; return -1; }

  /* ---------------- chrome ---------------- */
  function buildChrome() {
    root = U.el('div', { class: 'nlab' });
    root.style.setProperty('--nl-accent', CFG.accent || '#7C3AED');
    root.style.setProperty('--nl-accent-2', CFG.accent2 || '#14B8A6');
    if (Store.getTheme() === 'dark') root.classList.add('nlab--dark');

    root.innerHTML =
      '<header class="nl-top">' +
        '<a class="nl-top__brand" href="#/"><span class="nl-top__logo">🔬</span><span>Numbers Lab</span></a>' +
        '<span class="nl-top__spacer"></span>' +
        '<span class="nl-top__pill" id="nl-pill"></span>' +
        '<button class="nl-iconbtn" id="nl-sound" title="Sound on/off" aria-label="Sound on or off"></button>' +
        '<button class="nl-iconbtn" id="nl-theme" title="Light / Dark mode" aria-label="Switch light or dark"></button>' +
        '<a class="nl-iconbtn" id="nl-exit" href="' + (CFG.homeHref || 'index.html') + '" title="Exit to site" aria-label="Exit Numbers Lab">✕</a>' +
      '</header>' +
      '<div class="nl-main"><div class="nl-wrap" id="nl-view"></div></div>';
    host.appendChild(root);
    view = root.querySelector('#nl-view');

    var sBtn = root.querySelector('#nl-sound'), tBtn = root.querySelector('#nl-theme');
    function paintSound() { sBtn.textContent = SFX.on ? '🔊' : '🔇'; }
    function paintTheme() { tBtn.textContent = root.classList.contains('nlab--dark') ? '☀️' : '🌙'; }
    sBtn.addEventListener('click', function () { SFX.setOn(!SFX.on); paintSound(); if (SFX.on) SFX.tap(); });
    tBtn.addEventListener('click', function () {
      var dark = root.classList.toggle('nlab--dark');
      Store.setTheme(dark ? 'dark' : 'light'); paintTheme(); SFX.tap();
    });
    paintSound(); paintTheme();
  }

  function setPill(txt) { var p = root.querySelector('#nl-pill'); if (p) p.textContent = txt; }
  function cleanup() { try { current.destroy(); } catch (_) {} current = { destroy: function () {} }; U.stopSpeak(); }
  function scrollTop() { var m = root.querySelector('.nl-main'); if (m) m.scrollTop = 0; }

  /* ---------------- routing ---------------- */
  function parseHash() {
    var raw = (location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/').filter(Boolean);
    if (parts[0] === 'm' && parts[1]) return { view: 'mission', id: parts[1], idx: Math.max(0, parseInt(parts[2] || '0', 10) || 0) };
    if (parts[0] === 'progress') return { view: 'progress' };
    return { view: 'map' };
  }
  function route() {
    cleanup();
    var r = parseHash();
    if (r.view === 'mission') renderMission(r.id, r.idx);
    else if (r.view === 'progress') renderProgress();
    else renderMap();
    scrollTop();
  }

  /* ---------------- progress ring ---------------- */
  function ring(pct) {
    var C = 2 * Math.PI * 14, off = C * (1 - pct / 100);
    return '<svg class="nl-ring" viewBox="0 0 36 36">' +
      '<circle class="nl-ring__bg" cx="18" cy="18" r="14" fill="none" stroke-width="4"/>' +
      '<circle class="nl-ring__fg" cx="18" cy="18" r="14" fill="none" stroke-width="4" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 18 18)"/>' +
      '<text class="nl-ring__txt" x="18" y="22" text-anchor="middle">' + pct + '%</text></svg>';
  }

  /* ---------------- MAP ---------------- */
  function renderMap() {
    setPill(Store.doneCount() + '/' + MODS.filter(function (m) { return !m.comingSoon; }).length + ' done');
    var head = '<div class="nl-maphead">' +
      '<span class="nl-eyebrow">' + U.esc(CFG.name || 'Your') + '’s journey</span>' +
      '<h1 class="nl-h1">🔬 Numbers Lab</h1>' +
      '<p class="nl-lead">Pick a mission. Learn it, play it, master it.</p>' +
      Guide.html(U.esc(CFG.welcome || 'Welcome! Let’s explore numbers together.')) +
      '<div class="nl-chiprow" style="justify-content:center;margin-top:4px">' +
        '<a class="nl-btn nl-btn--sm" href="#/progress">🏅 My progress</a>' +
        '<a class="nl-btn nl-btn--sm" href="worksheets/numbers-lab-worksheet.html">🖨️ Printable worksheet</a>' +
      '</div></div>';

    var grid = '<div class="nl-modgrid">';
    MODS.forEach(function (m) {
      if (m.comingSoon) {
        grid += '<div class="nl-modcard is-locked"><span class="nl-modcard__num">#' + m.num + '</span>' +
          '<span class="nl-modcard__emoji">' + m.emoji + '</span>' +
          '<h2 class="nl-modcard__title">' + U.esc(m.title) + '</h2>' +
          '<p class="nl-modcard__tag">' + U.esc(m.tagline || '') + '</p>' +
          '<div class="nl-modcard__foot"><span class="nl-modcard__status">🔒 Coming soon</span></div></div>';
        return;
      }
      var prog = Store.moduleProgress(m.id, m.stages.length);
      var done = Store.isModuleDone(m.id);
      grid += '<button class="nl-modcard' + (done ? ' is-done' : '') + '" data-id="' + m.id + '" type="button">' +
        '<span class="nl-modcard__num">#' + m.num + '</span>' +
        '<span class="nl-modcard__emoji">' + m.emoji + '</span>' +
        '<h2 class="nl-modcard__title">' + U.esc(m.title) + '</h2>' +
        '<p class="nl-modcard__tag">' + U.esc(m.tagline || '') + '</p>' +
        '<div class="nl-modcard__foot">' + ring(prog.pct) +
          '<span class="nl-modcard__status">' + (done ? '✓ Mastered' : prog.done ? 'Continue' : 'Start') + '</span></div></button>';
    });
    grid += '</div>';
    view.innerHTML = head + grid;
    view.querySelectorAll('.nl-modcard[data-id]').forEach(function (c) {
      c.addEventListener('click', function () {
        var m = byId(c.dataset.id);
        var start = (Store.isModuleDone(m.id)) ? 0 : (Store.mod(m.id).lastStageIdx || 0);
        SFX.tap(); location.hash = '#/m/' + m.id + '/' + Math.min(start, m.stages.length - 1);
      });
    });
  }

  /* ---------------- MISSION ---------------- */
  function renderMission(id, idx) {
    var m = byId(id);
    if (!m || m.comingSoon) { if (location.hash !== '#/') location.hash = '#/'; renderMap(); return; }
    idx = U.clamp(idx, 0, m.stages.length - 1);
    Store.setLastStage(id, idx);
    var stage = m.stages[idx];
    setPill(m.emoji + ' ' + (idx + 1) + '/' + m.stages.length);

    var dots = '<div class="nl-progdots">';
    for (var i = 0; i < m.stages.length; i++) dots += '<span class="nl-progdot' + (Store.isStageDone(id, i) ? ' is-done' : (i === idx ? ' is-active' : '')) + '"></span>';
    dots += '</div>';

    view.innerHTML =
      '<span class="nl-eyebrow">' + m.emoji + ' ' + U.esc(m.title) + '</span>' + dots +
      '<div id="nl-stage" class="nl-stage"></div>' +
      '<div class="nl-missionnav">' +
        '<button class="nl-btn nl-btn--ghost" id="nl-prev" type="button">← Back</button>' +
        '<button class="nl-btn nl-btn--primary" id="nl-next" type="button" disabled>' + (idx === m.stages.length - 1 ? 'Finish ✓' : 'Next →') + '</button>' +
      '</div>';

    var stageEl = view.querySelector('#nl-stage');
    var nextBtn = view.querySelector('#nl-next');
    var prevBtn = view.querySelector('#nl-prev');

    function complete(xp) {
      nextBtn.disabled = false;
      if (!Store.isStageDone(id, idx)) { Store.markStage(id, idx); Store.bridgeXP(xp || 10, 'Numbers Lab: ' + m.title); }
    }
    // already-done stages: unlock immediately so navigation is free
    if (Store.isStageDone(id, idx)) nextBtn.disabled = false;

    prevBtn.addEventListener('click', function () { SFX.tap(); if (idx === 0) location.hash = '#/'; else location.hash = '#/m/' + id + '/' + (idx - 1); });
    nextBtn.addEventListener('click', function () {
      SFX.tap();
      if (idx === m.stages.length - 1) finishModule(m);
      else location.hash = '#/m/' + id + '/' + (idx + 1);
    });

    renderStage(stage, stageEl, m, idx, complete);
  }

  function renderStage(stage, el, m, idx, complete) {
    var ctx = { level: LEVEL, mascot: CFG.mascot, accent: CFG.accent };
    if (stage.kind === 'teach') return renderTeach(stage, el, complete);
    if (stage.kind === 'milestone') return renderMilestone(stage, el, m, idx, complete);
    if (stage.kind === 'quiz') {
      var bank = ((QUIZ[stage.bankKey] || {})[LEVEL]) || (QUIZ[stage.bankKey] || {}).adventurer || [];
      el.innerHTML = '<h2 class="nl-h2">' + U.esc(stage.title || 'Quick check') + '</h2>';
      var q = U.el('div'); el.appendChild(q);
      current = Widgets.mount('quiz', q, Object.assign({ bank: bank }, ctx, {
        onComplete: function (r) { if (r && r.pct != null) Store.recordQuiz(m.id, r.pct); complete(20); }
      }));
      return;
    }
    // widget stage
    el.innerHTML = '<h2 class="nl-h2">' + U.esc(stage.title || '') + '</h2>' + (stage.intro ? '<p class="nl-lead">' + stage.intro + '</p>' : '');
    var w = U.el('div'); el.appendChild(w);
    current = Widgets.mount(stage.widget, w, Object.assign({}, stage.opts || {}, ctx, { onComplete: function () { complete(15); } }));
  }

  function renderTeach(stage, el, complete) {
    var html = '<h2 class="nl-h2">' + (stage.emoji ? stage.emoji + ' ' : '') + U.esc(stage.title || '') + '</h2>';
    if (stage.why) html += '<div class="nl-why"><span class="nl-why__icon">💡</span><div><span class="nl-why__label">Why it matters</span>' + stage.why + '</div></div>';
    html += '<div class="nl-teach">' + (stage.body || '') + '</div>';
    if (stage.guide) html += Guide.html(stage.guide);
    html += '<button class="nl-btn nl-btn--sm" id="nl-read" type="button" style="margin-top:6px">🔊 Read this to me</button>';
    el.innerHTML = html;

    if (stage.widget) {
      var w = U.el('div'); w.style.marginTop = '18px'; el.appendChild(w);
      current = Widgets.mount(stage.widget, w, Object.assign({ level: LEVEL, mascot: CFG.mascot }, stage.widgetOpts || {}, { onComplete: function () {} }));
    }
    el.querySelector('#nl-read').addEventListener('click', function () {
      var txt = (stage.title || '') + '. ' + (stage.why ? stage.why : '') + ' ' + (stage.body || '');
      U.speak(txt.replace(/<[^>]+>/g, ' '));
    });
    complete(8); // teaching slides unlock immediately
  }

  function renderMilestone(stage, el, m, idx, complete) {
    var newBadge = false;
    if (!Store.isModuleDone(m.id)) { Store.setModuleDone(m.id); }
    if (m.badge && Store.addBadge(m.id)) newBadge = true;
    Store.bridgeXP(40, 'Numbers Lab: mastered ' + m.title);
    SFX.win(); NLAB.confetti(80);
    Guide.cheer('Amazing work, ' + (CFG.name || 'champ') + '! You mastered ' + m.title + '!');

    el.innerHTML = '<div class="nl-milestone">' +
      '<div class="nl-badge">' + ((m.badge && m.badge.emoji) || '🏅') + '</div>' +
      '<h2 class="nl-h2">' + U.esc(stage.title || 'Mission complete!') + '</h2>' +
      '<p class="nl-lead">' + (stage.message || ('You earned the <strong>' + U.esc((m.badge && m.badge.name) || 'badge') + '</strong>!')) + '</p>' +
      Guide.html('You mastered <strong>' + U.esc(m.title) + '</strong>. ' + (newBadge ? 'New badge unlocked! 🎉' : 'Great to see you back!')) +
      '</div>';
    complete(0);
    var nb = view.querySelector('#nl-next'); if (nb) nb.textContent = 'Back to the map 🗺️';
  }

  function finishModule(m) {
    if (!Store.isModuleDone(m.id)) Store.setModuleDone(m.id);
    location.hash = '#/';
  }

  /* ---------------- PROGRESS / PARENT VIEW ---------------- */
  function renderProgress() {
    setPill('Progress');
    var built = MODS.filter(function (m) { return !m.comingSoon; });
    var done = Store.doneCount();
    var badges = Store.badges();
    var data = Store.all();

    var stats = '<div class="nl-stats">' +
      stat(done + '/' + built.length, 'Missions mastered') +
      stat(badges.length, 'Badges earned') +
      stat((data.daysVisited || []).length, 'Days in the Lab') +
      stat((data.practice && data.practice.bestStreak) || 0, 'Best streak') +
      '</div>';

    var wall = '<h2 class="nl-h2">🏅 Badges</h2><div class="nl-badgewall">';
    built.forEach(function (m) {
      var has = Store.hasBadge(m.id);
      wall += '<div class="nl-badgewall__item' + (has ? '' : ' locked') + '" title="' + U.esc(m.title) + '">' + ((m.badge && m.badge.emoji) || '🏅') + '</div>';
    });
    wall += '</div>';

    var list = '<h2 class="nl-h2" style="margin-top:24px">Mission scores</h2><div class="nl-stats">';
    built.forEach(function (m) {
      var p = Store.moduleProgress(m.id, m.stages.length);
      list += '<div class="nl-stat"><div class="nl-stat__num" style="font-size:1.2rem">' + (Store.isModuleDone(m.id) ? '✓' : p.pct + '%') + '</div>' +
        '<div class="nl-stat__lbl">' + m.emoji + ' ' + U.esc(m.title) + (Store.bestQuiz(m.id) ? ' · best quiz ' + Store.bestQuiz(m.id) + '%' : '') + '</div></div>';
    });
    list += '</div>';

    view.innerHTML = '<span class="nl-eyebrow">For ' + U.esc(CFG.name || 'you') + ' & grown-ups</span>' +
      '<h1 class="nl-h1">🏅 My Progress</h1>' + stats + wall + list +
      '<div class="nl-chiprow" style="margin-top:24px">' +
        '<a class="nl-btn nl-btn--primary" href="#/">← Back to the map</a>' +
        '<button class="nl-btn nl-btn--ghost" id="nl-reset" type="button">↺ Reset my progress</button>' +
      '</div>' +
      '<p class="nl-widget__hint" style="margin-top:10px">Progress is saved only on this device — no account, no data collected.</p>';

    view.querySelector('#nl-reset').addEventListener('click', function () {
      if (window.confirm('Reset all Numbers Lab progress on this device? This cannot be undone.')) { Store.reset(); SFX.tap(); location.hash = '#/'; }
    });
    function stat(n, l) { return '<div class="nl-stat"><div class="nl-stat__num">' + n + '</div><div class="nl-stat__lbl">' + l + '</div></div>'; }
  }

  /* ---------------- boot ---------------- */
  function start(hostEl) {
    host = hostEl || document.getElementById('nl-host') || document.body;
    if (!MODS.length) { host.innerHTML = '<p style="padding:40px;text-align:center">Numbers Lab data did not load.</p>'; return; }
    buildChrome();
    Store.markVisit();
    window.addEventListener('hashchange', route);
    if (!location.hash) location.hash = '#/';
    route();
  }

  window.NumbersLab = { start: start };
})();

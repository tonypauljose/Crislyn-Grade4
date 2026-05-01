/* =====================================================
   CRISLYN'S WORLD — Friends Greeting
   Personalized surprise for visiting friends.

   How it works:
   - Crislyn shares a link like  crislyntony.com/?visitor=eshana
   - On that visit, the friend sees a big lavender surprise
     modal with confetti and a note from Pixie.
   - localStorage remembers them so future plain visits
     (without the ?visitor= param) get a small "welcome back"
     toast with a "Not me?" link to clear it.
   - The friend's favourite theme is applied visually for
     that browser, without overwriting Crislyn's saved theme.
   ===================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'crislyn_visitor_v1';

  // Friend profiles — add new friends here.
  const FRIENDS = {
    eshana: {
      id: 'eshana',
      name: 'Eshana',
      age: 9,
      grade: 4,
      hometown: 'Nilambur',
      favColour: 'lavender',
      favFood: 'pizza',
      foodEmoji: '🍕',
      heartEmoji: '💜',
      theme: 'lavender'
    }
  };

  function loadVisitor() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }
  function saveVisitor(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  }
  function clearVisitor() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  // Apply theme visually only — don't overwrite Crislyn's saved theme in State.
  function applyVisitorTheme(themeName) {
    try { document.documentElement.setAttribute('data-theme', themeName); } catch (_) {}
  }

  function fireConfetti(count) {
    if (window.Confetti && Confetti.launch) Confetti.launch(count);
  }

  function showSurpriseModal(friend) {
    applyVisitorTheme(friend.theme);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay friend-modal-overlay';
    overlay.innerHTML = `
      <div class="modal friend-modal" role="dialog" aria-labelledby="friend-modal-title">
        <div class="friend-modal__floats" aria-hidden="true">
          <span>${friend.foodEmoji}</span><span>${friend.heartEmoji}</span><span>${friend.foodEmoji}</span>
          <span>${friend.heartEmoji}</span><span>${friend.foodEmoji}</span><span>${friend.heartEmoji}</span>
          <span>✨</span><span>🌟</span>
        </div>
        <div class="friend-modal__content">
          <div class="friend-modal__eyebrow">${friend.heartEmoji} A surprise from Crislyn ${friend.heartEmoji}</div>
          <h2 class="friend-modal__title" id="friend-modal-title">Hi ${friend.name}! 🎉</h2>
          <p class="friend-modal__intro">
            Crislyn made this <strong>just for you</strong>, her new friend!
          </p>

          <div class="friend-modal__facts">
            <div class="friend-fact">
              <span class="friend-fact__icon">⭐</span>
              <span class="friend-fact__text">You and Crislyn are <strong>both ${friend.age}</strong> — and <strong>both in Grade ${friend.grade}!</strong></span>
            </div>
            <div class="friend-fact">
              <span class="friend-fact__icon">🌴</span>
              <span class="friend-fact__text">You're from <strong>${friend.hometown}</strong> — Crislyn says hi all the way from Bahrain!</span>
            </div>
            <div class="friend-fact">
              <span class="friend-fact__icon">${friend.heartEmoji}</span>
              <span class="friend-fact__text">Your favourite colour is <strong>${friend.favColour}</strong> — so I switched the whole site to lavender for you.</span>
            </div>
            <div class="friend-fact">
              <span class="friend-fact__icon">${friend.foodEmoji}</span>
              <span class="friend-fact__text">And Crislyn knows you <strong>LOVE ${friend.favFood}</strong>!</span>
            </div>
          </div>

          <div class="friend-modal__sign">
            Take a look around, ${friend.name} — play any of Crislyn's games,
            see her art, take an exam, or just have fun exploring.<br><br>
            We're so happy you're here. ${friend.heartEmoji}
            <div class="friend-modal__signoff">
              <em>— Pixie</em><br>
              <small>(Crislyn's little fox friend who lives in this website)</small>
            </div>
          </div>

          <button class="btn btn-primary btn-lg friend-modal__cta" id="friend-modal-cta" type="button">
            ${friend.heartEmoji} Let's explore!
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    // Confetti bursts (timed for emphasis)
    setTimeout(() => fireConfetti(120), 250);
    setTimeout(() => fireConfetti(80),  900);

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 320);
    }
    overlay.querySelector('#friend-modal-cta').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
    });
  }

  function showWelcomeBackBanner(friend) {
    // Small, dismissible banner with a "Not me?" escape hatch.
    const bar = document.createElement('div');
    bar.className = 'friend-welcome-bar';
    bar.innerHTML = `
      <span class="fwb__emoji">${friend.heartEmoji}</span>
      <span class="fwb__text">Welcome back, <strong>${friend.name}</strong>! Crislyn is happy you came back.</span>
      <button class="fwb__notme" type="button" title="Click if you're not ${friend.name}">Not me</button>
      <button class="fwb__close" type="button" aria-label="Close">×</button>
    `;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('show'));

    function dismiss() {
      bar.classList.remove('show');
      setTimeout(() => bar.remove(), 300);
    }
    bar.querySelector('.fwb__close').addEventListener('click', dismiss);
    bar.querySelector('.fwb__notme').addEventListener('click', () => {
      clearVisitor();
      dismiss();
      // Reload to drop the lavender theme override and restore Crislyn's saved theme.
      setTimeout(() => location.reload(), 300);
    });
    setTimeout(dismiss, 8000);
  }

  function init() {
    const params = new URLSearchParams(location.search);
    const visitorParam = (params.get('visitor') || '').toLowerCase().trim();
    const data = loadVisitor();

    // 1. URL-driven greeting — always shows the full surprise.
    if (visitorParam && FRIENDS[visitorParam]) {
      const friend = FRIENDS[visitorParam];
      showSurpriseModal(friend);
      saveVisitor({ id: friend.id, firstSeen: data.firstSeen || Date.now(), lastSeen: Date.now() });
      return;
    }

    // 2. Returning friend — small, dismissible welcome-back.
    if (data.id && FRIENDS[data.id]) {
      const friend = FRIENDS[data.id];
      applyVisitorTheme(friend.theme);
      saveVisitor(Object.assign({}, data, { lastSeen: Date.now() }));
      setTimeout(() => showWelcomeBackBanner(friend), 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* =====================================================
   CRISLYN'S WORLD — Quick-Draw (multiplication speed game)
   60-second flashcard sprint with combo meter and personal best.
   Cowboy theme: dusty oranges, "DRAW!" cards, twangy chimes.

   Mounts inside #game-stage. Call QuickDraw.start({ host, onExit }).
   ===================================================== */
(function () {
  'use strict';

  const DURATION = 60;          // seconds
  const COMBO_2X = 3;           // 3 in a row → 2× points
  const COMBO_3X = 5;           // 5 in a row → 3×
  const COMBO_FIRE = 10;        // 10 in a row → 4× and "ON FIRE!"

  function start(opts) {
    const host = opts.host;
    const onExit = opts.onExit || function () {};

    let score = 0;
    let combo = 0;
    let answered = 0;
    let correctCount = 0;
    let q = null;
    let endTime = Date.now() + DURATION * 1000;
    let tickHandle = null;
    let finished = false;

    host.innerHTML = `
      <div class="qd-shell">
        <div class="qd-topbar">
          <button class="qd-back" id="qd-back" type="button">← Pick another game</button>
          <div class="qd-stat qd-score"><span class="qd-stat-label">Score</span><strong id="qd-score">0</strong></div>
          <div class="qd-stat qd-combo" id="qd-combo-wrap"><span class="qd-stat-label">Combo</span><strong id="qd-combo">×1</strong></div>
          <div class="qd-stat qd-time"><span class="qd-stat-label">Time</span><strong id="qd-time">${DURATION}</strong></div>
        </div>

        <div class="qd-stage">
          <div class="qd-card" id="qd-card">
            <div class="qd-eyebrow">DRAW!</div>
            <div class="qd-question" id="qd-question">— × — = ?</div>
          </div>
          <div class="qd-options" id="qd-options"></div>
          <div class="qd-feedback" id="qd-feedback"></div>
        </div>

        <div class="qd-fire" id="qd-fire" aria-hidden="true"></div>
      </div>
    `;

    document.getElementById('qd-back').addEventListener('click', () => {
      cleanup();
      onExit();
    });

    function newQuestion() {
      q = TablesEngine.pickQuestion({ weighted: true, todayBias: true });
      document.getElementById('qd-question').textContent = q.a + ' × ' + q.b + ' = ?';
      const opts = document.getElementById('qd-options');
      opts.innerHTML = q.options.map(n => `<button class="qd-option" data-n="${n}" type="button">${n}</button>`).join('');
      opts.querySelectorAll('.qd-option').forEach(btn => {
        btn.addEventListener('click', () => onAnswer(parseInt(btn.dataset.n, 10), btn));
      });
    }

    function onAnswer(picked, btn) {
      if (finished) return;
      answered++;
      const correct = picked === q.product;
      const fb = document.getElementById('qd-feedback');
      if (correct) {
        correctCount++;
        combo++;
        let mult = 1, label = '×1';
        if (combo >= COMBO_FIRE) { mult = 4; label = '×4 🔥 ON FIRE!'; }
        else if (combo >= COMBO_3X) { mult = 3; label = '×3 ⚡'; }
        else if (combo >= COMBO_2X) { mult = 2; label = '×2 🔥'; }
        score += mult;
        document.getElementById('qd-score').textContent = score;
        document.getElementById('qd-combo').textContent = label;
        document.getElementById('qd-combo-wrap').classList.toggle('is-hot', combo >= COMBO_2X);
        document.getElementById('qd-combo-wrap').classList.toggle('is-fire', combo >= COMBO_FIRE);
        btn.classList.add('is-correct');
        flash(fb, '✓ Yee-haw! +' + mult, 'ok');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone(combo >= COMBO_2X ? 'levelup' : 'correct');
        if (combo === COMBO_FIRE) burstFire();
      } else {
        combo = 0;
        document.getElementById('qd-combo').textContent = '×1';
        document.getElementById('qd-combo-wrap').classList.remove('is-hot', 'is-fire');
        btn.classList.add('is-wrong');
        // Highlight the right one for learning
        document.querySelectorAll('.qd-option').forEach(o => {
          if (parseInt(o.dataset.n, 10) === q.product) o.classList.add('is-correct');
        });
        flash(fb, '✗ ' + q.a + ' × ' + q.b + ' = ' + q.product, 'bad');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('wrong');
      }
      // Lock options briefly, then advance
      document.querySelectorAll('.qd-option').forEach(o => o.style.pointerEvents = 'none');
      setTimeout(() => {
        if (!finished) newQuestion();
      }, correct ? 280 : 700);
    }

    function flash(el, text, kind) {
      el.textContent = text;
      el.className = 'qd-feedback show ' + kind;
      setTimeout(() => el.classList.remove('show'), 600);
    }

    function burstFire() {
      const el = document.getElementById('qd-fire');
      el.classList.add('blast');
      if (window.Confetti && Confetti.launch) Confetti.launch(60);
      setTimeout(() => el.classList.remove('blast'), 1200);
    }

    function tick() {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      const t = document.getElementById('qd-time');
      if (t) t.textContent = remaining;
      if (remaining <= 10) t && t.classList.add('is-warn');
      if (remaining <= 0) { finish(); return; }
      tickHandle = setTimeout(tick, 250);
    }

    function finish() {
      if (finished) return;
      finished = true;
      cleanup();
      const accuracy = answered ? Math.round((correctCount / answered) * 100) : 0;
      const result = TablesEngine.recordBest('quickdraw', score, null, { correctCount, answered, accuracy });
      const stars = score >= 25 ? 12 : score >= 15 ? 8 : score >= 8 ? 5 : 2;
      if (window.State && State.addStars) State.addStars(stars, 'Quick-Draw · ' + score);

      const prevBest = result.prev ? result.prev.value : null;
      host.innerHTML = `
        <div class="qd-result">
          <div class="qd-result-eyebrow">⏱ Time's up, partner!</div>
          <h2 class="qd-result-title">${result.isNewBest ? '🏆 NEW RECORD!' : 'Round\'s done'}</h2>
          <div class="qd-result-score">${score}<span class="qd-result-of"> points</span></div>
          <div class="qd-result-stats">
            <div><strong>${correctCount}</strong> correct</div>
            <div><strong>${answered - correctCount}</strong> missed</div>
            <div><strong>${accuracy}%</strong> accuracy</div>
            <div><strong>+${stars}</strong> ⭐</div>
          </div>
          ${prevBest !== null ? `<div class="qd-prev-best">Previous best: <strong>${prevBest}</strong></div>` : ''}
          <div class="qd-result-actions">
            <button class="act-btn act-btn-primary" id="qd-again" type="button">🔄 Play again</button>
            <button class="act-btn act-btn-secondary" id="qd-exit" type="button">← Pick another game</button>
          </div>
        </div>
      `;
      if (result.isNewBest && window.Confetti && Confetti.launch) Confetti.launch(160);
      document.getElementById('qd-again').addEventListener('click', () => start({ host, onExit }));
      document.getElementById('qd-exit').addEventListener('click', onExit);
    }

    function cleanup() {
      if (tickHandle) clearTimeout(tickHandle);
      tickHandle = null;
    }

    newQuestion();
    tick();
  }

  window.QuickDraw = { start: start };
})();

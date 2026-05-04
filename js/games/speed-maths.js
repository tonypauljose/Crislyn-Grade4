/* =====================================================
   CRISLYN'S WORLD — Speed Maths
   60-second add/subtract speed flashcard. Same shape as
   Quick-Draw but pulls from AddSubEngine.
   ===================================================== */
(function () {
  'use strict';

  const DURATION = 60;
  const COMBO_2X = 3;
  const COMBO_3X = 5;
  const COMBO_FIRE = 10;

  function start(opts) {
    const host = opts.host;
    const onExit = opts.onExit || function () {};
    const mode = opts.mode || 'mixed';     // 'add' | 'sub' | 'mixed'
    const level = opts.level || 'medium';

    let score = 0, combo = 0, answered = 0, correctCount = 0;
    let q = null;
    let endTime = Date.now() + DURATION * 1000;
    let tickHandle = null;
    let finished = false;

    const titleByMode = { add: '➕ Speed Adding', sub: '➖ Speed Subtracting', mixed: '🧮 Speed Maths' };
    const themeByMode = { add: 'sm-add', sub: 'sm-sub', mixed: 'sm-mixed' };

    host.innerHTML = `
      <div class="qd-shell ${themeByMode[mode]}">
        <div class="qd-topbar">
          <button class="qd-back" id="sm-back" type="button">← Pick another mode</button>
          <div class="qd-stat qd-score"><span class="qd-stat-label">Score</span><strong id="sm-score">0</strong></div>
          <div class="qd-stat qd-combo" id="sm-combo-wrap"><span class="qd-stat-label">Combo</span><strong id="sm-combo">×1</strong></div>
          <div class="qd-stat qd-time"><span class="qd-stat-label">Time</span><strong id="sm-time">${DURATION}</strong></div>
        </div>

        <div class="qd-stage">
          <div class="qd-card">
            <div class="qd-eyebrow">${titleByMode[mode]}</div>
            <div class="qd-question" id="sm-question">— = ?</div>
          </div>
          <div class="qd-options" id="sm-options"></div>
          <div class="qd-feedback" id="sm-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById('sm-back').addEventListener('click', () => {
      cleanup();
      onExit();
    });

    function newQuestion() {
      const op = mode === 'mixed' ? null : (mode === 'add' ? '+' : '−');
      q = AddSubEngine.pickQuestion({ op, level });
      document.getElementById('sm-question').textContent = q.a + ' ' + q.op + ' ' + q.b + ' = ?';
      const optsEl = document.getElementById('sm-options');
      optsEl.innerHTML = q.options.map(n => `<button class="qd-option" data-n="${n}" type="button">${n}</button>`).join('');
      optsEl.querySelectorAll('.qd-option').forEach(btn => {
        btn.addEventListener('click', () => onAnswer(parseInt(btn.dataset.n, 10), btn));
      });
    }

    function onAnswer(picked, btn) {
      if (finished) return;
      answered++;
      const correct = picked === q.answer;
      const fb = document.getElementById('sm-feedback');
      if (correct) {
        correctCount++;
        combo++;
        let mult = 1, label = '×1';
        if (combo >= COMBO_FIRE) { mult = 4; label = '×4 🔥 ON FIRE!'; }
        else if (combo >= COMBO_3X) { mult = 3; label = '×3 ⚡'; }
        else if (combo >= COMBO_2X) { mult = 2; label = '×2 🔥'; }
        score += mult;
        document.getElementById('sm-score').textContent = score;
        document.getElementById('sm-combo').textContent = label;
        document.getElementById('sm-combo-wrap').classList.toggle('is-hot', combo >= COMBO_2X);
        document.getElementById('sm-combo-wrap').classList.toggle('is-fire', combo >= COMBO_FIRE);
        btn.classList.add('is-correct');
        flash(fb, '✓ Brilliant! +' + mult, 'ok');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone(combo >= COMBO_2X ? 'levelup' : 'correct');
        if (combo === COMBO_FIRE && window.Confetti && Confetti.launch) Confetti.launch(50);
      } else {
        combo = 0;
        document.getElementById('sm-combo').textContent = '×1';
        document.getElementById('sm-combo-wrap').classList.remove('is-hot', 'is-fire');
        btn.classList.add('is-wrong');
        document.querySelectorAll('.qd-option').forEach(o => {
          if (parseInt(o.dataset.n, 10) === q.answer) o.classList.add('is-correct');
        });
        flash(fb, '✗ ' + q.a + ' ' + q.op + ' ' + q.b + ' = ' + q.answer, 'bad');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('wrong');
      }
      document.querySelectorAll('.qd-option').forEach(o => o.style.pointerEvents = 'none');
      setTimeout(() => { if (!finished) newQuestion(); }, correct ? 280 : 800);
    }

    function flash(el, text, kind) {
      el.textContent = text;
      el.className = 'qd-feedback show ' + kind;
      setTimeout(() => el.classList.remove('show'), 600);
    }

    function tick() {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      const t = document.getElementById('sm-time');
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
      const result = AddSubEngine.recordBest('speedmaths_' + mode, score, { correctCount, answered, accuracy });
      const stars = score >= 25 ? 12 : score >= 15 ? 8 : score >= 8 ? 5 : 2;
      if (window.State && State.addStars) State.addStars(stars, 'Speed Maths · ' + score);
      const prevBest = result.prev ? result.prev.value : null;

      host.innerHTML = `
        <div class="qd-result">
          <div class="qd-result-eyebrow">⏱ Time's up!</div>
          <h2 class="qd-result-title">${result.isNewBest ? '🏆 NEW RECORD!' : 'Round complete'}</h2>
          <div class="qd-result-score">${score}<span class="qd-result-of"> points</span></div>
          <div class="qd-result-stats">
            <div><strong>${correctCount}</strong> correct</div>
            <div><strong>${answered - correctCount}</strong> missed</div>
            <div><strong>${accuracy}%</strong> accuracy</div>
            <div><strong>+${stars}</strong> ⭐</div>
          </div>
          ${prevBest !== null ? `<div class="qd-prev-best">Previous best: <strong>${prevBest}</strong></div>` : ''}
          <div class="qd-result-actions">
            <button class="act-btn act-btn-primary" id="sm-again" type="button">🔄 Play again</button>
            <button class="act-btn act-btn-secondary" id="sm-exit" type="button">← Pick another mode</button>
          </div>
        </div>
      `;
      if (result.isNewBest && window.Confetti && Confetti.launch) Confetti.launch(160);
      document.getElementById('sm-again').addEventListener('click', () => start({ host, onExit, mode, level }));
      document.getElementById('sm-exit').addEventListener('click', onExit);
    }

    function cleanup() {
      if (tickHandle) clearTimeout(tickHandle);
      tickHandle = null;
    }

    newQuestion();
    tick();
  }

  window.SpeedMaths = { start: start };
})();

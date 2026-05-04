/* =====================================================
   CRISLYN'S WORLD — Tables Tower (climb 10 floors)
   Pick a table (×2..×10). Climb 10 floors by answering
   correctly. 3 lives. Reach the top → earn that table's
   crown. Each table can be crowned once.
   ===================================================== */
(function () {
  'use strict';

  const FLOORS = 10;
  const LIVES_MAX = 3;

  function start(opts) {
    const host = opts.host;
    const onExit = opts.onExit || function () {};

    let chosenTable = null;
    let floor = 0;          // current floor 0..10 (0 = ground, 10 = crown room)
    let lives = LIVES_MAX;
    let q = null;
    let finished = false;
    let started = Date.now();

    renderTablePicker();

    function renderTablePicker() {
      const today = TablesEngine.todayTable();
      const crowns = TablesEngine.listCrowns();
      const cards = TablesEngine.TABLES.map(t => {
        const isToday = t === today;
        const owned = crowns.indexOf(t) >= 0;
        return `
          <button class="tw-pick" data-t="${t}" type="button">
            <div class="tw-pick-num">×${t}</div>
            ${isToday ? '<div class="tw-pick-today">today</div>' : ''}
            ${owned ? '<div class="tw-pick-crown">👑</div>' : ''}
          </button>
        `;
      }).join('');

      host.innerHTML = `
        <div class="tw-shell">
          <button class="qd-back" id="tw-back" type="button">← Pick another game</button>
          <div class="tw-pick-stage">
            <h2 class="tw-pick-title">Pick a table to climb</h2>
            <p class="tw-pick-sub">Right answers climb you up the tower. 3 lives. Reach floor 10 to earn the crown!</p>
            <div class="tw-pick-grid">${cards}</div>
            ${crowns.length ? `<div class="tw-crown-row">Crowns earned: ${crowns.map(c => `<span class="tw-mini-crown">×${c}</span>`).join(' ')}</div>` : ''}
          </div>
        </div>
      `;
      document.getElementById('tw-back').addEventListener('click', onExit);
      host.querySelectorAll('.tw-pick').forEach(btn => {
        btn.addEventListener('click', () => {
          chosenTable = parseInt(btn.dataset.t, 10);
          floor = 0; lives = LIVES_MAX; finished = false; started = Date.now();
          renderTower();
          newQuestion();
        });
      });
    }

    function renderTower() {
      // Build the tower visually — floor 10 at top, floor 1 at bottom.
      const floorEls = [];
      for (let i = FLOORS; i >= 1; i--) {
        const isHere = i === floor;
        const isReached = i <= floor;
        const isCrown = i === FLOORS;
        floorEls.push(`
          <div class="tw-floor ${isHere ? 'is-here' : ''} ${isReached ? 'is-reached' : ''} ${isCrown ? 'is-crown' : ''}">
            <div class="tw-floor-num">${isCrown ? '👑' : i}</div>
            ${isHere ? '<div class="tw-pixie">🦊</div>' : ''}
          </div>
        `);
      }

      host.innerHTML = `
        <div class="tw-shell">
          <div class="tw-topbar">
            <button class="qd-back" id="tw-back" type="button">← Quit climb</button>
            <div class="qd-stat"><span class="qd-stat-label">Tower</span><strong>×${chosenTable}</strong></div>
            <div class="qd-stat"><span class="qd-stat-label">Floor</span><strong id="tw-floor">${floor}</strong> / ${FLOORS}</div>
            <div class="qd-stat tw-lives"><span class="qd-stat-label">Lives</span><strong id="tw-lives">${'❤️'.repeat(lives)}</strong></div>
          </div>

          <div class="tw-stage">
            <div class="tw-tower">
              ${floorEls.join('')}
            </div>

            <div class="tw-question-area">
              <div class="tw-question" id="tw-question">— × — = ?</div>
              <div class="tw-options" id="tw-options"></div>
              <div class="tw-feedback" id="tw-feedback"></div>
            </div>
          </div>
        </div>
      `;
      document.getElementById('tw-back').addEventListener('click', () => {
        finished = true;
        renderTablePicker();
      });
    }

    function newQuestion() {
      q = TablesEngine.pickQuestion({ table: chosenTable });
      // Difficulty ramp by floor: floors 1-3 use small b's (1..5), 4-7 mixed, 8-10 weighted toward hard b's (6..10)
      if (floor < 3) {
        q.b = 1 + Math.floor(Math.random() * 5);
      } else if (floor >= 7) {
        q.b = 6 + Math.floor(Math.random() * 5);
      }
      q.product = q.a * q.b;
      q.options = [q.product];
      const seen = new Set([q.product]);
      while (q.options.length < 4) {
        const off = (Math.floor(Math.random() * 14) - 7) || 1;
        const candidate = q.product + off;
        if (candidate > 0 && !seen.has(candidate)) {
          seen.add(candidate);
          q.options.push(candidate);
        }
      }
      // Shuffle
      for (let i = q.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
      }

      document.getElementById('tw-question').innerHTML =
        `<span class="tw-q-num">${q.a}</span> <span class="tw-q-op">×</span> <span class="tw-q-num">${q.b}</span> <span class="tw-q-op">=</span> <span class="tw-q-q">?</span>`;
      const optsEl = document.getElementById('tw-options');
      optsEl.innerHTML = q.options.map(n => `<button class="tw-option" data-n="${n}" type="button">${n}</button>`).join('');
      optsEl.querySelectorAll('.tw-option').forEach(btn => {
        btn.addEventListener('click', () => onAnswer(parseInt(btn.dataset.n, 10), btn));
      });
    }

    function onAnswer(picked, btn) {
      if (finished) return;
      const correct = picked === q.product;
      const fb = document.getElementById('tw-feedback');
      document.querySelectorAll('.tw-option').forEach(o => o.style.pointerEvents = 'none');
      if (correct) {
        btn.classList.add('is-correct');
        floor++;
        document.getElementById('tw-floor').textContent = floor;
        flash(fb, '✓ Up you go!', 'ok');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('correct');
        if (floor >= FLOORS) {
          setTimeout(crownReached, 600);
        } else {
          // Re-render tower so Pixie hops up; keep question area focused.
          setTimeout(() => { renderTower(); newQuestion(); }, 480);
        }
      } else {
        btn.classList.add('is-wrong');
        document.querySelectorAll('.tw-option').forEach(o => {
          if (parseInt(o.dataset.n, 10) === q.product) o.classList.add('is-correct');
        });
        lives--;
        document.getElementById('tw-lives').textContent = lives > 0 ? '❤️'.repeat(lives) : '💔';
        flash(fb, '✗ ' + q.a + ' × ' + q.b + ' = ' + q.product, 'bad');
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('wrong');
        if (lives <= 0) {
          setTimeout(towerLost, 800);
        } else {
          setTimeout(newQuestion, 1100);
        }
      }
    }

    function flash(el, text, kind) {
      el.textContent = text;
      el.className = 'tw-feedback show ' + kind;
      setTimeout(() => el.classList.remove('show'), 700);
    }

    function crownReached() {
      finished = true;
      const seconds = Math.floor((Date.now() - started) / 1000);
      const wasNew = !TablesEngine.hasCrown(chosenTable);
      TablesEngine.awardCrown(chosenTable);
      const stars = wasNew ? 20 : 8;
      if (window.State && State.addStars) State.addStars(stars, 'Tower ×' + chosenTable + ' crowned');
      if (window.Confetti && Confetti.launch) Confetti.launch(180);
      if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('levelup');

      host.innerHTML = `
        <div class="tw-summit">
          <div class="tw-summit-crown">👑</div>
          <h2 class="tw-summit-title">${wasNew ? 'Tower of ×' + chosenTable + ' — CROWNED!' : '×' + chosenTable + ' Tower complete again!'}</h2>
          <p class="tw-summit-sub">${wasNew ? 'Your first crown for this table — and it\'s yours forever.' : 'You already had this crown — but well climbed!'}</p>
          <div class="qd-result-stats">
            <div><strong>Floor 10</strong></div>
            <div><strong>${LIVES_MAX - lives}</strong> lives lost</div>
            <div><strong>${seconds}s</strong></div>
            <div><strong>+${stars}</strong> ⭐</div>
          </div>
          <div class="qd-result-actions">
            <button class="act-btn act-btn-primary" id="tw-next" type="button">⛰️ Climb another</button>
            <button class="act-btn act-btn-secondary" id="tw-exit" type="button">← Pick another game</button>
          </div>
        </div>
      `;
      document.getElementById('tw-next').addEventListener('click', renderTablePicker);
      document.getElementById('tw-exit').addEventListener('click', onExit);
    }

    function towerLost() {
      finished = true;
      const stars = Math.max(2, floor);
      if (window.State && State.addStars) State.addStars(stars, 'Tower ×' + chosenTable + ' floor ' + floor);
      host.innerHTML = `
        <div class="tw-summit tw-summit--lost">
          <div class="tw-summit-crown">💪</div>
          <h2 class="tw-summit-title">So close! You reached floor ${floor}.</h2>
          <p class="tw-summit-sub">Lives ran out — but every climb teaches the table better. Try again!</p>
          <div class="qd-result-stats">
            <div><strong>Floor ${floor}</strong> / ${FLOORS}</div>
            <div><strong>+${stars}</strong> ⭐</div>
          </div>
          <div class="qd-result-actions">
            <button class="act-btn act-btn-primary" id="tw-retry" type="button">🔁 Try again</button>
            <button class="act-btn act-btn-secondary" id="tw-other" type="button">⛰️ Climb a different table</button>
            <button class="act-btn act-btn-secondary" id="tw-exit" type="button">← Pick another game</button>
          </div>
        </div>
      `;
      document.getElementById('tw-retry').addEventListener('click', () => {
        floor = 0; lives = LIVES_MAX; finished = false; started = Date.now();
        renderTower(); newQuestion();
      });
      document.getElementById('tw-other').addEventListener('click', renderTablePicker);
      document.getElementById('tw-exit').addEventListener('click', onExit);
    }
  }

  window.TablesTower = { start: start };
})();

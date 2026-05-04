/* =====================================================
   CRISLYN'S WORLD — Memory Match (multiplication pairs)
   24 cards: 12 equation cards (e.g., "6 × 4") and 12 answer
   cards (e.g., "24"). Flip pairs to match. Time-based score.
   Treasure-chest theme: warm sand, palm decorations.
   ===================================================== */
(function () {
  'use strict';

  function start(opts) {
    const host = opts.host;
    const onExit = opts.onExit || function () {};

    let board = [];           // [{id, kind: 'eq'|'ans', text, product, matched}]
    let firstPick = null;
    let lockBoard = false;
    let matched = 0;
    let attempts = 0;
    let startedAt = Date.now();
    let tickHandle = null;
    let finished = false;

    // Build 12 unique facts, weighted toward today's table + hard pairs.
    function buildBoard() {
      const facts = [];
      const seen = new Set();
      let guard = 0;
      while (facts.length < 12 && guard < 200) {
        const f = TablesEngine.pickFact({ weighted: true, todayBias: true });
        const key = f.a + '×' + f.b;
        // Only one orientation per pair (3×4 and 4×3 would collide on answer 12)
        const altKey = f.b + '×' + f.a;
        if (!seen.has(key) && !seen.has(altKey)) {
          seen.add(key);
          facts.push(f);
        }
        guard++;
      }
      // Build 24 cards (eq + ans) and shuffle
      const cards = [];
      facts.forEach((f, i) => {
        cards.push({ id: 'eq-' + i, kind: 'eq', pair: i, text: f.a + ' × ' + f.b, product: f.product });
        cards.push({ id: 'ans-' + i, kind: 'ans', pair: i, text: String(f.product), product: f.product });
      });
      // Fisher-Yates
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      return cards;
    }

    function render() {
      host.innerHTML = `
        <div class="mm-shell">
          <div class="mm-topbar">
            <button class="qd-back" id="mm-back" type="button">← Pick another game</button>
            <div class="qd-stat"><span class="qd-stat-label">Pairs</span><strong id="mm-matched">0</strong> / 12</div>
            <div class="qd-stat"><span class="qd-stat-label">Attempts</span><strong id="mm-attempts">0</strong></div>
            <div class="qd-stat"><span class="qd-stat-label">Time</span><strong id="mm-time">0:00</strong></div>
          </div>
          <div class="mm-board" id="mm-board"></div>
          <div class="mm-hint">Tap two cards. Match an equation with its answer to keep them open.</div>
        </div>
      `;
      document.getElementById('mm-back').addEventListener('click', () => {
        cleanup();
        onExit();
      });
      const boardEl = document.getElementById('mm-board');
      board.forEach((c, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'mm-card kind-' + c.kind;
        cardEl.dataset.idx = idx;
        cardEl.innerHTML = `
          <div class="mm-face mm-face-back">🐚</div>
          <div class="mm-face mm-face-front">${c.text}</div>
        `;
        cardEl.addEventListener('click', () => onPick(idx, cardEl));
        boardEl.appendChild(cardEl);
      });
    }

    function onPick(idx, el) {
      if (lockBoard || finished) return;
      const card = board[idx];
      if (card.matched || el.classList.contains('is-flipped')) return;
      el.classList.add('is-flipped');
      if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('click');
      if (!firstPick) {
        firstPick = { idx, el, card };
        return;
      }
      // Second pick
      attempts++;
      document.getElementById('mm-attempts').textContent = attempts;
      const a = firstPick.card;
      const b = card;
      // Match: same pair index AND different kinds (one eq + one ans)
      if (a.pair === b.pair && a.kind !== b.kind) {
        a.matched = true;
        b.matched = true;
        firstPick.el.classList.add('is-matched');
        el.classList.add('is-matched');
        matched++;
        document.getElementById('mm-matched').textContent = matched;
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('correct');
        firstPick = null;
        if (matched === 12) {
          setTimeout(finish, 400);
        }
      } else {
        lockBoard = true;
        if (window.AudioManager && AudioManager.playTone) AudioManager.playTone('wrong');
        const fp = firstPick;
        setTimeout(() => {
          fp.el.classList.remove('is-flipped');
          el.classList.remove('is-flipped');
          firstPick = null;
          lockBoard = false;
        }, 900);
      }
    }

    function tick() {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      const t = document.getElementById('mm-time');
      if (t) t.textContent = m + ':' + String(s).padStart(2, '0');
      tickHandle = setTimeout(tick, 500);
    }

    function finish() {
      if (finished) return;
      finished = true;
      cleanup();
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      // Lower seconds = better; "score" for storage is seconds
      const result = TablesEngine.recordBestLowerIsBetter('memorymatch', seconds, null, { attempts });
      const stars = seconds <= 60 ? 12 : seconds <= 90 ? 8 : seconds <= 120 ? 5 : 2;
      if (window.State && State.addStars) State.addStars(stars, 'Memory Match · ' + seconds + 's');
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      const timeStr = m + ':' + String(s).padStart(2, '0');
      const prev = result.prev;
      const prevStr = prev ? `${Math.floor(prev.value/60)}:${String(prev.value%60).padStart(2,'0')}` : null;

      host.innerHTML = `
        <div class="qd-result">
          <div class="qd-result-eyebrow">🐚 All 12 pairs found!</div>
          <h2 class="qd-result-title">${result.isNewBest ? '🏆 NEW BEST TIME!' : 'Beautifully done!'}</h2>
          <div class="qd-result-score">${timeStr}</div>
          <div class="qd-result-stats">
            <div><strong>12 / 12</strong> matched</div>
            <div><strong>${attempts}</strong> tries</div>
            <div><strong>+${stars}</strong> ⭐</div>
          </div>
          ${prevStr ? `<div class="qd-prev-best">Previous best: <strong>${prevStr}</strong></div>` : ''}
          <div class="qd-result-actions">
            <button class="act-btn act-btn-primary" id="mm-again" type="button">🔄 Play again</button>
            <button class="act-btn act-btn-secondary" id="mm-exit" type="button">← Pick another game</button>
          </div>
        </div>
      `;
      if (result.isNewBest && window.Confetti && Confetti.launch) Confetti.launch(160);
      document.getElementById('mm-again').addEventListener('click', () => start({ host, onExit }));
      document.getElementById('mm-exit').addEventListener('click', onExit);
    }

    function cleanup() {
      if (tickHandle) clearTimeout(tickHandle);
      tickHandle = null;
    }

    board = buildBoard();
    render();
    tick();
  }

  window.MemoryMatch = { start: start };
})();

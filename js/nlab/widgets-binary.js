/* ============================================================
   NUMBERS LAB — binary & number-system widgets
   binary-switchboard · binary-cards · base-converter
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var U = NLAB.util, SFX = NLAB.sfx, W = NLAB.widgets;
  var HEXD = '0123456789ABCDEF';

  function powers(bits) { var a = []; for (var i = bits - 1; i >= 0; i--) a.push(Math.pow(2, i)); return a; } // [16,8,4,2,1]

  /* ============================================================
     BINARY SWITCHBOARD — opts: { bits:5, target }
     Light switches = bits. Flip them to make a number.
     ============================================================ */
  W.register('binary-switchboard', function (el, opts) {
    var bits = opts.bits || 5;
    var vals = powers(bits);
    var state = vals.map(function () { return 0; });
    var explore = (opts.target == null);
    var target = explore ? null : opts.target;
    var solved = false;

    var hint = U.el('p', { class: 'nl-widget__hint' });
    hint.innerHTML = explore
      ? 'Flip the lights on and off. Each light is worth twice the one on its right. Watch the number change!'
      : 'Flip the lights to make <strong>' + target + '</strong>.';
    el.appendChild(hint);

    var board = U.el('div', { class: 'nl-switchboard' });
    vals.forEach(function (v, i) {
      var wrap = U.el('div', { class: 'nl-switch' });
      var btn = U.el('button', { class: 'nl-switch__btn', type: 'button', 'aria-label': 'Light worth ' + v });
      btn.innerHTML = '<span class="nl-switch__bulb">💡</span>';
      var bit = U.el('div', { class: 'nl-switch__bit', text: '0' });
      var val = U.el('div', { class: 'nl-switch__val', text: v });
      btn.addEventListener('click', function () {
        state[i] ^= 1;
        btn.classList.toggle('on', !!state[i]);
        bit.textContent = state[i];
        SFX.tap(); update();
      });
      wrap.appendChild(btn); wrap.appendChild(bit); wrap.appendChild(val);
      board.appendChild(wrap);
    });
    el.appendChild(board);

    var readout = U.el('div', { class: 'nl-binreadout' });
    el.appendChild(readout);

    function update() {
      var bin = state.join('');
      var dec = state.reduce(function (s, b, i) { return s + b * vals[i]; }, 0);
      var sumParts = vals.filter(function (v, i) { return state[i]; });
      readout.innerHTML = '<span class="nl-binbits">' + bin + '</span><span>=</span><span class="nl-binreadout__big">' + dec + '</span>';
      if (sumParts.length) readout.innerHTML += '<span class="nl-hexbreak">(' + sumParts.join(' + ') + ')</span>';
      if (!explore && !solved && dec === target) {
        solved = true; SFX.ok(); NLAB.confetti(40);
        NLAB.feedback(el, true, 'You built ' + target + ' in binary: ' + bin + '!', 'That is exactly how a computer stores ' + target + ' — a row of on/off switches.');
        if (opts.onComplete) opts.onComplete({ ok: true });
      }
    }
    update();
    if (explore && opts.onComplete) opts.onComplete({ explore: true });
    return { destroy: function () {} };
  });

  /* ============================================================
     BINARY CARDS — opts: { rounds:3, bits:5 }
     CS-Unplugged "count the dots": flip cards to match the target.
     ============================================================ */
  W.register('binary-cards', function (el, opts) {
    var bits = opts.bits || 5, rounds = opts.rounds || 3;
    var vals = powers(bits);
    var state = vals.map(function () { return 0; });
    var round = 0, target = 0;

    var hint = U.el('p', { class: 'nl-widget__hint' });
    var score = U.el('p', { class: 'nl-eyebrow' });
    el.appendChild(score); el.appendChild(hint);

    var row = U.el('div', { class: 'nl-switchboard' });
    var cards = [];
    vals.forEach(function (v, i) {
      var card = U.el('button', { class: 'nl-bitcard off', type: 'button', 'aria-label': v + ' dots' });
      var dots = U.el('div', { class: 'nl-bitdots' });
      var cols = v >= 8 ? 4 : v >= 4 ? 2 : 1;
      dots.style.gridTemplateColumns = 'repeat(' + Math.min(cols, 4) + ', 1fr)';
      for (var k = 0; k < v; k++) dots.appendChild(U.el('span', { class: 'nl-bitdot' }));
      card.appendChild(dots);
      card.appendChild(U.el('div', { class: 'nl-bitcard__num', text: v }));
      card.addEventListener('click', function () { state[i] ^= 1; card.classList.toggle('off', !state[i]); SFX.tap(); check(); });
      cards.push(card); row.appendChild(card);
    });
    el.appendChild(row);
    var readout = U.el('div', { class: 'nl-binreadout' });
    el.appendChild(readout);

    function newRound() {
      target = U.randInt(1, (1 << bits) - 1);
      state = vals.map(function () { return 0; });
      cards.forEach(function (c) { c.classList.add('off'); });
      hint.innerHTML = 'Flip cards so the <strong>showing dots add up to ' + target + '</strong>.';
      score.textContent = 'Round ' + (round + 1) + ' of ' + rounds;
      paint();
    }
    function sum() { return state.reduce(function (s, b, i) { return s + b * vals[i]; }, 0); }
    function paint() {
      var s = sum();
      readout.innerHTML = '<span class="nl-binreadout__big" style="color:' + (s === target ? 'var(--nl-ok)' : 'var(--nl-accent)') + '">' + s + '</span><span class="nl-hexbreak">target: ' + target + '</span>';
    }
    function check() {
      paint();
      if (sum() === target) {
        SFX.ok(); round++;
        if (round >= rounds) {
          NLAB.confetti(60);
          NLAB.feedback(el, true, 'You matched all ' + rounds + ' numbers!', 'You can now count in binary like a computer. Each card is a power of two: 16, 8, 4, 2, 1.');
          row.querySelectorAll('.nl-bitcard').forEach(function (c) { c.disabled = true; });
          if (opts.onComplete) opts.onComplete({ ok: true });
        } else { NLAB.feedback(el, true, 'Got it! Next number…', ''); setTimeout(newRound, 900); }
      }
    }
    newRound();
    return { destroy: function () {} };
  });

  /* ============================================================
     BASE CONVERTER — opts: { value }
     Type a number; see binary, octal and hex with the steps.
     ============================================================ */
  W.register('base-converter', function (el, opts) {
    var start = opts.value != null ? opts.value : 13;
    var revealed = false;

    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'Type a number (0–255). See it in <strong>binary</strong>, <strong>octal</strong> and <strong>hex</strong> — and how it is worked out.' }));

    var row = U.el('div', { class: 'nl-chiprow' });
    var input = U.el('input', { type: 'number', min: '0', max: '255', value: start, 'aria-label': 'Decimal number' });
    input.className = 'nl-chip'; input.style.width = '120px'; input.style.fontSize = '1.3rem';
    var stepsBtn = U.el('button', { class: 'nl-btn nl-btn--primary nl-btn--sm', type: 'button', text: 'Show the steps' });
    row.appendChild(input); row.appendChild(stepsBtn);
    el.appendChild(row);

    var out = U.el('div', { class: 'nl-binreadout' });
    var steps = U.el('div', { class: 'nl-steps' }); steps.style.display = 'none';
    el.appendChild(out); el.appendChild(steps);

    function clampVal() { var n = parseInt(input.value, 10); if (isNaN(n)) n = 0; n = U.clamp(n, 0, 255); return n; }
    function render() {
      var n = clampVal();
      out.innerHTML = '<span class="nl-hexbreak">binary</span><span class="nl-binbits">' + (n.toString(2)) + '</span>' +
        '<span class="nl-hexbreak">octal</span><span class="nl-binreadout__big" style="font-size:1.6rem">' + n.toString(8) + '</span>' +
        '<span class="nl-hexbreak">hex</span><span class="nl-binreadout__big" style="font-size:1.6rem">' + n.toString(16).toUpperCase() + '</span>';
      if (steps.style.display !== 'none') renderSteps(n);
    }
    function renderSteps(n) {
      var s = [], rem = n, i = 1;
      [128, 64, 32, 16, 8, 4, 2, 1].forEach(function (p) {
        var fits = rem >= p;
        s.push('<div class="nl-step"><span class="nl-step__no">' + (i++) + '</span><span>Does <strong>' + p + '</strong> fit in <strong>' + rem + '</strong>? ' + (fits ? '✓ yes → bit <strong>1</strong>, ' + rem + ' − ' + p + ' = ' + (rem - p) : '✗ no → bit <strong>0</strong>') + '</span></div>');
        if (fits) rem -= p;
      });
      var hex = n.toString(16).toUpperCase();
      s.push('<div class="nl-step"><span class="nl-step__no">★</span><span>Binary = <strong>' + n.toString(2) + '</strong>. Group into 4s from the right → each group is one hex digit → <strong>' + hex + '</strong>.</span></div>');
      steps.innerHTML = s.join('');
    }
    input.addEventListener('input', render);
    stepsBtn.addEventListener('click', function () {
      steps.style.display = 'grid'; renderSteps(clampVal()); SFX.tap();
      if (!revealed) { revealed = true; if (opts.onComplete) opts.onComplete({ ok: true }); }
    });
    render();
    return { destroy: function () {} };
  });
})();

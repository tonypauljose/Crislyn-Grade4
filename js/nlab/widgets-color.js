/* ============================================================
   NUMBERS LAB — hex colour mixer
   The classic hook: #RRGGBB. Drag R/G/B and watch the hex change.
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var U = NLAB.util, SFX = NLAB.sfx, W = NLAB.widgets;
  var HEXD = '0123456789ABCDEF';

  function hx(n) { return (n < 16 ? '0' : '') + n.toString(16).toUpperCase(); }

  W.register('hex-mixer', function (el, opts) {
    var rgb = { r: 124, g: 58, b: 237 };     // start on the brand purple
    // little challenge sequence so the activity has a goal
    var challenges = opts.challenges || [
      { name: 'pure red', hex: 'FF0000' },
      { name: 'pure green', hex: '00FF00' },
      { name: 'bright yellow (red + green)', hex: 'FFFF00' }
    ];
    var ci = 0, doneAll = false;

    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'A colour is just three numbers: how much <strong>Red</strong>, <strong>Green</strong> and <strong>Blue</strong>. Each goes 0–255, written as a 2-digit hex pair.' }));

    var goal = U.el('div', { class: 'nl-eyebrow' });
    el.appendChild(goal);

    var mixer = U.el('div', { class: 'nl-hexmixer' });
    var swatch = U.el('div', { class: 'nl-swatch' });
    var code = U.el('div', { class: 'nl-swatch__code' });
    swatch.appendChild(code);

    var sliders = U.el('div', { class: 'nl-sliders' });
    ['r', 'g', 'b'].forEach(function (ch) {
      var name = { r: 'Red', g: 'Green', b: 'Blue' }[ch];
      var wrap = U.el('div', { class: 'nl-slider nl-slider--' + ch });
      var lab = U.el('label', { html: '<span>' + name + '</span><span class="hexpart">' + rgb[ch] + ' = <strong>' + hx(rgb[ch]) + '</strong></span>' });
      var input = U.el('input', { type: 'range', min: '0', max: '255', value: rgb[ch], 'aria-label': name });
      input.addEventListener('input', function () {
        rgb[ch] = +input.value;
        lab.innerHTML = '<span>' + name + '</span><span class="hexpart">' + rgb[ch] + ' = <strong>' + hx(rgb[ch]) + '</strong></span>';
        SFX.tap(); paint();
      });
      wrap.appendChild(lab); wrap.appendChild(input);
      sliders.appendChild(wrap);
      wrap._input = input; wrap._lab = lab;
    });
    mixer.appendChild(swatch); mixer.appendChild(sliders);
    el.appendChild(mixer);

    var brk = U.el('p', { class: 'nl-hexbreak' });
    el.appendChild(brk);

    function curHex() { return hx(rgb.r) + hx(rgb.g) + hx(rgb.b); }
    function paint() {
      var h = curHex();
      swatch.style.background = '#' + h;
      var light = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 150;
      code.style.color = light ? '#15182B' : '#fff';
      code.style.background = light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.18)';
      code.textContent = '#' + h;
      brk.innerHTML = '#<strong>' + hx(rgb.r) + '</strong><strong>' + hx(rgb.g) + '</strong><strong>' + hx(rgb.b) + '</strong> &nbsp;→&nbsp; Red ' + rgb.r + ', Green ' + rgb.g + ', Blue ' + rgb.b + '. (FF = 255 = full, 00 = none.)';
      checkChallenge(h);
    }
    function showGoal() {
      if (ci < challenges.length) goal.innerHTML = '🎯 Challenge ' + (ci + 1) + '/' + challenges.length + ': make <strong>' + challenges[ci].name + '</strong> (#' + challenges[ci].hex + ')';
      else goal.textContent = '✓ All challenges done — keep mixing for fun!';
    }
    function checkChallenge(h) {
      if (doneAll || ci >= challenges.length) return;
      if (h === challenges[ci].hex) {
        SFX.ok(); ci++;
        if (ci >= challenges.length) {
          doneAll = true; NLAB.confetti(50);
          NLAB.feedback(el, true, 'Colour master! You mixed every challenge.', 'Web pages, games and emoji all pick colours exactly this way — with hex.');
          if (opts.onComplete) opts.onComplete({ ok: true });
        } else { NLAB.feedback(el, true, 'Nailed it! Next colour…', ''); }
        showGoal();
      }
    }
    showGoal(); paint();
    return { destroy: function () {} };
  });
})();

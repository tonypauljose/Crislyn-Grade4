/* ============================================================
   NUMBERS LAB — number-sense widgets
   place-value-grid · expanded-form-builder · align-demo · right-align
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var U = NLAB.util, SFX = NLAB.sfx, W = NLAB.widgets;

  var SHORT = ['O', 'T', 'H', 'Th', 'T-Th', 'L', 'T-L', 'Cr'];
  var FULL = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands', 'Lakhs', 'Ten Lakhs', 'Crores'];
  var FACTOR = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];

  function digitsRTL(n) { return String(Math.abs(Math.floor(n))).split('').reverse().map(Number); } // [ones,tens,...]
  function fmtIndian(n) { try { return (window.App && App.formatIndian) ? App.formatIndian(n) : n.toLocaleString(); } catch (_) { return '' + n; } }

  /* ---------- build a place-value column grid for a number ---------- */
  function buildGrid(number, opts) {
    opts = opts || {};
    var d = digitsRTL(number);           // index 0 = ones
    var grid = U.el('div', { class: 'nl-pvgrid' });
    grid.style.gridAutoFlow = 'column';
    for (var p = d.length - 1; p >= 0; p--) {
      var col = U.el('div', { class: 'nl-pvcol' });
      col.appendChild(U.el('div', { class: 'nl-pvhead', html: SHORT[p] + '<small>' + FULL[p] + '</small>' }));
      var cell = U.el('div', { class: 'nl-pvcell', text: d[p] });
      cell.dataset.place = p;
      cell.dataset.digit = d[p];
      col.appendChild(cell);
      grid.appendChild(col);
    }
    var scroll = U.el('div', { class: 'nl-scrollx' });
    scroll.appendChild(grid);
    return scroll;
  }

  /* ============================================================
     PLACE-VALUE GRID  — opts: { number, task:'identify' }
     ============================================================ */
  W.register('place-value-grid', function (el, opts) {
    var number = opts.number || 4582;
    var d = digitsRTL(number);
    var places = []; for (var p = 0; p < d.length; p++) places.push(p);
    var target = places[U.randInt(0, places.length - 1)];

    var hint = U.el('p', { class: 'nl-widget__hint' });
    var grid = buildGrid(number);
    var readBtn = U.el('button', { class: 'nl-btn nl-btn--sm', type: 'button', text: '🔊 Read the number' });
    el.appendChild(U.el('div', { html: '<div class="nl-bignum" style="text-align:center;margin-bottom:6px">' + fmtIndian(number) + '</div>' }));
    el.appendChild(readBtn);
    el.appendChild(hint);
    el.appendChild(grid);

    readBtn.addEventListener('click', function () { try { U.speak((window.App && App.numberInWords) ? App.numberInWords(number) : number); } catch (_) {} });

    if (opts.task === 'show') {
      el.appendChild(U.el('div', { class: 'nl-pvexpand', html: 'Expanded form: <strong>' + (window.App && App.expandedForm ? App.expandedForm(number) : '') + '</strong>' }));
      if (opts.onComplete) opts.onComplete({ shown: true });
      return { destroy: function () {} };
    }

    hint.innerHTML = 'Tap the digit in the <strong>' + FULL[target] + '</strong> place.';
    var done = false;
    grid.querySelectorAll('.nl-pvcell').forEach(function (cell) {
      cell.setAttribute('tabindex', '0'); cell.setAttribute('role', 'button');
      function pick() {
        if (done) return;
        var p = +cell.dataset.place;
        if (p === target) {
          done = true;
          cell.classList.add('is-filled'); SFX.ok();
          var val = (+cell.dataset.digit) * FACTOR[p];
          NLAB.feedback(el, true, 'That digit is ' + cell.dataset.digit + ' in the ' + FULL[target] + ' place.',
            'It is worth ' + cell.dataset.digit + ' × ' + fmtIndian(FACTOR[p]) + ' = <strong>' + fmtIndian(val) + '</strong>. Expanded form: ' + (window.App && App.expandedForm ? App.expandedForm(number) : ''));
          if (opts.onComplete) opts.onComplete({ ok: true });
        } else {
          SFX.no();
          NLAB.feedback(el, false, 'That is the ' + FULL[p] + ' place.', 'Remember: places grow ten times bigger each step left — Ones, Tens, Hundreds…');
        }
      }
      cell.addEventListener('click', pick);
      cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    return { destroy: function () { U.stopSpeak(); } };
  });

  /* ============================================================
     EXPANDED-FORM BUILDER — opts: { number }
     Tap the place-value pieces to build the expanded form.
     ============================================================ */
  W.register('expanded-form-builder', function (el, opts) {
    var number = opts.number || 3527;
    var d = digitsRTL(number);
    var pieces = [];
    for (var p = 0; p < d.length; p++) if (d[p] !== 0) pieces.push(d[p] * FACTOR[p]);
    pieces.sort(function (a, b) { return b - a; });

    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'Build the <strong>expanded form</strong> of <strong>' + fmtIndian(number) + '</strong> — tap the pieces (biggest first).' }));
    var expr = U.el('div', { class: 'nl-pvexpand', html: '<span style="color:var(--nl-ink-muted)">tap a piece below…</span>' });
    var tray = U.el('div', { class: 'nl-chiprow' });
    el.appendChild(expr); el.appendChild(tray);

    var built = [];
    U.shuffle(pieces).forEach(function (val) {
      var chip = U.el('button', { class: 'nl-chip', type: 'button', text: fmtIndian(val) });
      chip.style.fontSize = '1.05rem';
      chip.addEventListener('click', function () {
        if (chip.classList.contains('is-placed')) return;
        chip.classList.add('is-placed'); built.push(val); SFX.tap();
        render();
      });
      tray.appendChild(chip);
    });

    function render() {
      expr.innerHTML = built.map(fmtIndian).join('  <span style="color:var(--nl-accent)">+</span>  ');
      if (built.length === pieces.length) {
        var sum = built.reduce(function (a, b) { return a + b; }, 0);
        var ok = sum === Math.abs(Math.floor(number));
        expr.innerHTML += '  <span style="color:var(--nl-accent)">=</span>  <strong>' + fmtIndian(sum) + '</strong>';
        if (ok) { SFX.ok(); NLAB.feedback(el, true, 'Perfect expanded form!', 'Each piece shows what a digit is really worth in its place.'); if (opts.onComplete) opts.onComplete({ ok: true }); }
        else { SFX.no(); NLAB.feedback(el, false, 'The pieces add to ' + fmtIndian(sum) + ', not ' + fmtIndian(number) + '.', ''); }
      }
    }
    return { destroy: function () {} };
  });

  /* ============================================================
     ALIGN-DEMO — opts: { a, b }  (wrong vs right, side by side)
     ============================================================ */
  W.register('align-demo', function (el, opts) {
    var a = opts.a || 342, b = opts.b || 57;
    var da = digitsRTL(a), db = digitsRTL(b);
    var maxLen = Math.max(da.length, db.length);

    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'Same two numbers, stacked two ways. Press <strong>Add them up</strong> and watch what happens.' }));
    var wrap = U.el('div', { class: 'nl-align' });
    wrap.style.gridTemplateColumns = '1fr 1fr';

    // WRONG = left aligned: digit j (from left) of each number shares a column
    var alStr = String(a), blStr = String(b);
    var wrongCols = [];
    for (var j = 0; j < Math.max(alStr.length, blStr.length); j++) {
      wrongCols.push((+(alStr[j] || 0)) + (+(blStr[j] || 0)));
    }
    var wrongTotal = +wrongCols.join('');

    var paneBad = U.el('div', { class: 'nl-align__pane bad' });
    paneBad.innerHTML = '<div class="nl-align__title">❌ Lined up on the LEFT</div>' + stack(alStr, blStr, 'left');
    var paneGood = U.el('div', { class: 'nl-align__pane good' });
    paneGood.innerHTML = '<div class="nl-align__title">✅ Lined up on the RIGHT</div>' + stack(alStr, blStr, 'right');
    wrap.appendChild(paneBad); wrap.appendChild(paneGood);
    el.appendChild(wrap);

    var btn = U.el('button', { class: 'nl-btn nl-btn--primary', type: 'button', text: '➕ Add them up' });
    btn.style.marginTop = '14px';
    el.appendChild(btn);
    var revealed = false;
    btn.addEventListener('click', function () {
      if (revealed) return; revealed = true;
      paneBad.innerHTML += '<div class="nl-sum"><span class="nl-sum__rule"></span><span style="color:var(--nl-bad)">' + wrongTotal + '</span></div><p class="nl-widget__hint">Columns mixed ones with tens — wrong answer!</p>';
      paneGood.innerHTML += '<div class="nl-sum"><span class="nl-sum__rule"></span><span style="color:var(--nl-ok)">' + (a + b) + '</span></div><p class="nl-widget__hint">Ones under ones, tens under tens — correct!</p>';
      SFX.ok();
      NLAB.feedback(el, true, 'See the difference?', 'Numbers must line up on the RIGHT so each place value sits in its own column.');
      if (opts.onComplete) opts.onComplete({ ok: true });
    });

    function stack(s1, s2, align) {
      var pad = align === 'right' ? '&nbsp;'.repeat(0) : '';
      function row(s, op) {
        var cells = s.split('').map(function (c) { return '<span class="digit">' + c + '</span>'; }).join('');
        return '<div>' + (op ? '<span class="nl-sum__op">' + op + '</span>' : '&nbsp;') + cells + '</div>';
      }
      var dir = align === 'right' ? 'text-align:right' : 'text-align:left';
      return '<div class="nl-sum" style="' + dir + ';display:block">' + row(s1, '') + row(s2, '+') + '</div>';
    }
    return { destroy: function () {} };
  });

  /* ============================================================
     RIGHT-ALIGN — opts: { a, b, op }
     A is fixed (correctly placed). Drag OR tap B's digits into the
     correct place columns. Works with mouse, touch and keyboard.
     ============================================================ */
  W.register('right-align', function (el, opts) {
    var a = opts.a || 426, b = opts.b || 38, op = opts.op || '+';
    var da = digitsRTL(a), db = digitsRTL(b);
    var maxLen = Math.max(da.length, db.length);
    var selected = null;          // tap-to-place selection
    var placed = 0;

    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'Put <strong>' + b + '</strong> under <strong>' + a + '</strong>. Drag each digit into its place column — or tap a digit, then tap a column. Line up the <strong>ones</strong> first!' }));

    // grid: header row + row A (fixed) + row B (drop targets)
    var scroll = U.el('div', { class: 'nl-scrollx' });
    var grid = U.el('div'); grid.style.display = 'inline-grid'; grid.style.gap = '6px';
    grid.style.gridTemplateColumns = 'repeat(' + maxLen + ', 1fr)';
    // headers
    for (var p = maxLen - 1; p >= 0; p--) grid.appendChild(U.el('div', { class: 'nl-pvhead', html: SHORT[p] + '<small>' + FULL[p] + '</small>' }));
    // row A
    for (var p2 = maxLen - 1; p2 >= 0; p2--) {
      var v = (p2 < da.length) ? da[p2] : '';
      grid.appendChild(U.el('div', { class: 'nl-pvcell' + (v === '' ? '' : ' is-filled'), text: v }));
    }
    // row B (drop cells)
    var dropCells = {};
    for (var p3 = maxLen - 1; p3 >= 0; p3--) {
      var cell = U.el('div', { class: 'nl-pvcell is-drop', 'aria-label': FULL[p3] + ' place' });
      cell.dataset.place = p3; cell.setAttribute('role', 'button'); cell.setAttribute('tabindex', '0');
      dropCells[p3] = cell;
      grid.appendChild(cell);
    }
    scroll.appendChild(grid); el.appendChild(scroll);

    // tray of B digits (each chip knows the digit value; placement is by column)
    var tray = U.el('div', { class: 'nl-chiprow' });
    el.appendChild(U.el('p', { class: 'nl-widget__hint', html: 'Digits of ' + b + ':' }));
    el.appendChild(tray);
    var chips = [];
    // present B's digits left-to-right as the child sees them written
    String(b).split('').forEach(function (ch) {
      var chip = U.el('button', { class: 'nl-chip', type: 'button', text: ch });
      chip.dataset.digit = ch;
      chips.push(chip); tray.appendChild(chip);
      chip.addEventListener('click', function () { selectChip(chip); });
    });

    var bar = U.el('div', { class: 'nl-chiprow' }); bar.style.marginTop = '6px';
    var resetBtn = U.el('button', { class: 'nl-btn nl-btn--sm', type: 'button', text: '↺ Reset' });
    bar.appendChild(resetBtn); el.appendChild(bar);
    resetBtn.addEventListener('click', reset);

    function selectChip(chip) {
      if (chip.classList.contains('is-placed')) return;
      if (selected === chip) { chip.style.outline = ''; selected = null; return; }
      chips.forEach(function (c) { c.style.outline = ''; });
      selected = chip; chip.style.outline = '3px solid var(--nl-accent)'; SFX.tap();
    }
    function placeInto(cell, chip) {
      if (cell.dataset.filledBy) return;
      cell.textContent = chip.dataset.digit; cell.classList.add('is-filled');
      cell.dataset.filledBy = chips.indexOf(chip);
      chip.classList.add('is-placed'); chip.style.outline = '';
      selected = null; placed++; SFX.tap();
      evaluate();
    }
    function clearCell(cell) {
      if (!cell.dataset.filledBy) return;
      var chip = chips[+cell.dataset.filledBy];
      chip.classList.remove('is-placed');
      cell.textContent = ''; cell.classList.remove('is-filled', 'is-over'); cell.style.borderColor = '';
      delete cell.dataset.filledBy; placed--;
    }
    function reset() { for (var p in dropCells) clearCell(dropCells[p]); var f = el.querySelector('.nl-feedback'); if (f) f.classList.remove('show'); }

    // click a drop cell: place selected chip, or pick a placed digit back up
    Object.keys(dropCells).forEach(function (p) {
      var cell = dropCells[p];
      function act() {
        if (cell.dataset.filledBy) { clearCell(cell); return; }
        if (selected) placeInto(cell, selected);
      }
      cell.addEventListener('click', act);
      cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });

    // pointer drag enhancement
    var ghost = null, dragChip = null;
    function onDown(e) {
      var chip = e.target.closest('.nl-chip');
      if (!chip || chip.classList.contains('is-placed')) return;
      dragChip = chip;
      var startX = e.clientX, startY = e.clientY, moved = false;
      function move(ev) {
        if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        moved = true;
        if (!ghost) { ghost = chip.cloneNode(true); ghost.style.position = 'fixed'; ghost.style.pointerEvents = 'none'; ghost.style.zIndex = 9999; ghost.style.opacity = '.9'; document.body.appendChild(ghost); chip.classList.add('is-dragging'); }
        ghost.style.left = (ev.clientX - 26) + 'px'; ghost.style.top = (ev.clientY - 28) + 'px';
        var over = document.elementFromPoint(ev.clientX, ev.clientY);
        Object.keys(dropCells).forEach(function (p) { dropCells[p].classList.remove('is-over'); });
        var cell = over && over.closest ? over.closest('.nl-pvcell.is-drop') : null;
        if (cell && !cell.dataset.filledBy) cell.classList.add('is-over');
      }
      function up(ev) {
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
        chip.classList.remove('is-dragging');
        if (ghost) { ghost.remove(); ghost = null; }
        Object.keys(dropCells).forEach(function (p) { dropCells[p].classList.remove('is-over'); });
        if (!moved) { selectChip(chip); return; }   // it was a tap
        var over = document.elementFromPoint(ev.clientX, ev.clientY);
        var cell = over && over.closest ? over.closest('.nl-pvcell.is-drop') : null;
        if (cell && !cell.dataset.filledBy) placeInto(cell, chip);
        dragChip = null;
      }
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    }
    tray.addEventListener('pointerdown', onDown);

    function evaluate() {
      if (placed < chips.length) return;
      // expected digit at each place from B (null = should be empty)
      var ok = true;
      for (var p = 0; p < maxLen; p++) {
        var expected = (p < db.length) ? db[p] : null;
        var cell = dropCells[p];
        var got = cell.dataset.filledBy != null ? +cell.textContent : null;
        var good = (expected === null) ? (got === null) : (got === expected);
        if (cell.dataset.filledBy != null) cell.style.borderColor = good ? 'var(--nl-ok)' : 'var(--nl-bad)';
        if (!good) ok = false;
      }
      if (ok) {
        SFX.ok(); NLAB.confetti(40);
        NLAB.feedback(el, true, 'Lined up perfectly — ones under ones!',
          'Now they add the easy way: <strong>' + a + ' ' + op + ' ' + b + ' = ' + (op === '+' ? a + b : a - b) + '</strong>.');
        if (opts.onComplete) opts.onComplete({ ok: true });
      } else {
        SFX.no();
        NLAB.feedback(el, false, 'Almost — the columns don\'t match the places yet.', 'Start from the right: put the ONES digit of ' + b + ' under the ones of ' + a + '. Tap a filled column to take a digit back.');
      }
    }
    return { destroy: function () { if (ghost) ghost.remove(); } };
  });
})();

/* ============================================================
   NUMBERS LAB — widget registry + shared widgets
   Every widget is a mount function: mount(el, opts) -> { destroy() }
   opts always carries: { level, onComplete(result), onProgress(p) }
   ============================================================ */
(function () {
  'use strict';
  var NLAB = window.NLAB = window.NLAB || {};
  var U = NLAB.util, SFX = NLAB.sfx;

  var REG = {};
  var Widgets = NLAB.widgets = {
    register: function (name, fn) { REG[name] = fn; },
    has: function (name) { return !!REG[name]; },
    mount: function (name, el, opts) {
      opts = opts || {};
      el.classList.add('nl-widget');
      el.innerHTML = '';
      var fn = REG[name];
      if (!fn) { el.innerHTML = '<p class="nl-watch">⚠️ This activity is coming soon.</p>'; if (opts.onComplete) opts.onComplete({ skipped: true }); return { destroy: function () {} }; }
      try { return fn(el, opts) || { destroy: function () {} }; }
      catch (e) { console.error('[nlab] widget "' + name + '" failed', e); el.innerHTML = '<p class="nl-watch">⚠️ Something went wrong loading this activity.</p>'; return { destroy: function () {} }; }
    }
  };

  /* small feedback helper shared by widgets */
  NLAB.feedback = function (el, ok, msg, how) {
    var f = el.querySelector('.nl-feedback') || el.appendChild(U.el('div', { class: 'nl-feedback' }));
    f.className = 'nl-feedback show ' + (ok ? 'ok' : 'bad');
    f.innerHTML = (ok ? '✓ ' : '✗ ') + U.esc(msg) + (how ? '<div class="nl-feedback__how">' + how + '</div>' : '');
    return f;
  };

  /* ============================================================
     QUIZ  — opts: { bank:[{q,options,answer,explain}], onComplete }
     ============================================================ */
  Widgets.register('quiz', function (el, opts) {
    var bank = (opts.bank || []).slice();
    if (!bank.length) { el.innerHTML = '<p>No questions yet.</p>'; if (opts.onComplete) opts.onComplete({ pct: 100 }); return { destroy: function () {} }; }
    var i = 0, correct = 0, locked = false;

    var bar = U.el('div', { class: 'nl-quiz__bar' }, '<i style="width:0%"></i>');
    var body = U.el('div', { class: 'nl-quiz__body' });
    el.appendChild(bar); el.appendChild(body);

    function paint() {
      locked = false;
      bar.firstChild.style.width = Math.round(i / bank.length * 100) + '%';
      var q = bank[i];
      body.innerHTML = '<p class="nl-widget__hint">Question ' + (i + 1) + ' of ' + bank.length + '</p>' +
        '<p class="nl-quiz__q">' + U.esc(q.q) + '</p>';
      var opts2 = U.el('div', { class: 'nl-qopts' });
      U.shuffle(q.options.map(function (o, idx) { return { o: o, idx: idx }; })).forEach(function (pair) {
        var b = U.el('button', { class: 'nl-qopt', type: 'button', text: pair.o });
        b.addEventListener('click', function () { choose(b, pair.idx, q, opts2); });
        opts2.appendChild(b);
      });
      body.appendChild(opts2);
    }

    function choose(btn, idx, q, wrap) {
      if (locked) return; locked = true;
      var right = idx === q.answer;
      if (right) { correct++; btn.classList.add('correct'); SFX.ok(); }
      else {
        btn.classList.add('wrong'); SFX.no();
        // reveal the correct option
        Array.prototype.forEach.call(wrap.children, function (c) {
          if (c.textContent === q.options[q.answer]) c.classList.add('correct');
        });
      }
      Array.prototype.forEach.call(wrap.children, function (c) { c.classList.add('lock'); });
      NLAB.feedback(body, right, right ? 'Correct!' : 'Not quite.', q.explain || '');
      var next = U.el('button', { class: 'nl-btn nl-btn--primary', type: 'button', text: (i + 1 < bank.length ? 'Next question →' : 'See my score') });
      next.style.marginTop = '14px';
      next.addEventListener('click', function () { i++; (i < bank.length) ? paint() : finish(); });
      body.appendChild(next);
    }

    function finish() {
      var pct = Math.round(correct / bank.length * 100);
      bar.firstChild.style.width = '100%';
      var stars = pct >= 90 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : '⭐';
      body.innerHTML = '<div class="nl-milestone"><div class="nl-bignum">' + correct + ' / ' + bank.length + '</div>' +
        '<p style="font-size:1.6rem">' + stars + '</p>' +
        '<p class="nl-lead">' + (pct >= 90 ? 'Brilliant!' : pct >= 60 ? 'Nice work!' : 'Good try — review and go again!') + '</p></div>';
      if (pct >= 60) NLAB.confetti(50);
      if (opts.onComplete) opts.onComplete({ pct: pct, correct: correct, total: bank.length });
    }

    paint();
    return { destroy: function () {} };
  });

  /* ============================================================
     FLASHCARDS — opts: { cards:[{front, back}], onComplete }
     A "Number Talk" style deck: read the front, flip for the trick.
     ============================================================ */
  Widgets.register('flashcards', function (el, opts) {
    var cards = (opts.cards || []).slice();
    if (!cards.length) { el.innerHTML = '<p>No cards.</p>'; if (opts.onComplete) opts.onComplete({}); return { destroy: function () {} }; }
    var i = 0, seen = {};

    var deck = U.el('div', { class: 'nl-flash' });
    var inner = U.el('div', { class: 'nl-flash__card' });
    deck.appendChild(inner);
    var counter = U.el('p', { class: 'nl-widget__hint', html: '' });
    var nav = U.el('div', { class: 'nl-chiprow', html: '' });
    nav.style.justifyContent = 'space-between';
    nav.style.marginTop = '16px';
    var prev = U.el('button', { class: 'nl-btn nl-btn--sm', type: 'button', text: '← Back' });
    var flipBtn = U.el('button', { class: 'nl-btn nl-btn--sm', type: 'button', text: '🔊 Read' });
    var next = U.el('button', { class: 'nl-btn nl-btn--primary nl-btn--sm', type: 'button', text: 'Next →' });
    nav.appendChild(prev); nav.appendChild(flipBtn); nav.appendChild(next);

    el.appendChild(counter); el.appendChild(deck); el.appendChild(nav);

    function paint() {
      inner.classList.remove('flip');
      var c = cards[i]; seen[i] = true;
      counter.textContent = 'Card ' + (i + 1) + ' of ' + cards.length + ' · tap the card to flip';
      inner.innerHTML =
        '<div class="nl-flash__face front"><div><p class="nl-flash__big">' + c.front + '</p><p class="nl-widget__hint" style="margin-top:8px">tap to reveal the trick</p></div></div>' +
        '<div class="nl-flash__face back"><div>' + c.back + '</div></div>';
      prev.disabled = i === 0;
      next.textContent = (Object.keys(seen).length >= cards.length && i === cards.length - 1) ? 'Done ✓' : 'Next →';
    }
    inner.addEventListener('click', function () { inner.classList.toggle('flip'); SFX.tap(); });
    flipBtn.addEventListener('click', function () { var c = cards[i]; U.speak((inner.classList.contains('flip') ? c.back : c.front).replace(/<[^>]+>/g, ' ')); });
    prev.addEventListener('click', function () { if (i > 0) { i--; paint(); } });
    next.addEventListener('click', function () {
      if (i < cards.length - 1) { i++; paint(); }
      else if (Object.keys(seen).length >= cards.length) { SFX.ok(); if (opts.onComplete) opts.onComplete({ seen: cards.length }); next.disabled = true; next.textContent = 'All done ✓'; }
    });
    paint();
    return { destroy: function () { U.stopSpeak(); } };
  });

  /* ============================================================
     COMPARE — opts: { pairs?:[[a,b]...], rounds, onComplete }
     Tap >, < or = . A quick number-sense check.
     ============================================================ */
  Widgets.register('compare', function (el, opts) {
    var rounds = opts.rounds || 4, done = 0, locked = false;
    var pairs = opts.pairs && opts.pairs.length ? opts.pairs.slice() : null;

    var head = U.el('p', { class: 'nl-widget__hint' });
    var stage = U.el('div', { class: 'nl-card', html: '' });
    stage.style.textAlign = 'center';
    el.appendChild(head); el.appendChild(stage);

    function nextRound() {
      locked = false;
      var a, b;
      if (pairs) { var p = pairs[done % pairs.length]; a = p[0]; b = p[1]; }
      else {
        var mag = opts.level === 'champion' ? 1000000 : opts.level === 'explorer' ? 1000 : 100000;
        a = U.randInt(10, mag); b = (Math.random() < 0.18) ? a : U.randInt(10, mag);
      }
      head.textContent = 'Which sign is true?  (' + (done + 1) + ' of ' + rounds + ')';
      stage.innerHTML = '<div class="nl-bignum" style="margin-bottom:14px">' +
        '<span style="color:var(--nl-accent)">' + fmt(a) + '</span> <span id="nl-cmp-sign" style="opacity:.4">?</span> <span style="color:var(--nl-accent-2)">' + fmt(b) + '</span></div>';
      var row = U.el('div', { class: 'nl-chiprow', html: '' }); row.style.justifyContent = 'center';
      ['>', '=', '<'].forEach(function (sign) {
        var btn = U.el('button', { class: 'nl-btn nl-btn--lg', type: 'button', text: sign });
        btn.addEventListener('click', function () { answer(sign, a, b); });
        row.appendChild(btn);
      });
      stage.appendChild(row);
    }
    function fmt(n) { try { return (window.App && App.formatIndian) ? App.formatIndian(n) : n.toLocaleString(); } catch (_) { return '' + n; } }
    function truth(a, b) { return a > b ? '>' : a < b ? '<' : '='; }
    function answer(sign, a, b) {
      if (locked) return; locked = true;
      var ok = sign === truth(a, b);
      document.getElementById('nl-cmp-sign').textContent = truth(a, b);
      document.getElementById('nl-cmp-sign').style.opacity = '1';
      if (ok) SFX.ok(); else SFX.no();
      NLAB.feedback(stage, ok, ok ? 'Yes!' : ('The true sign is ' + truth(a, b)), 'Compare the leftmost digits first; if they match, move right one place.');
      done++;
      setTimeout(function () {
        if (done >= rounds) { if (opts.onComplete) opts.onComplete({ rounds: rounds }); }
        else nextRound();
      }, 950);
    }
    nextRound();
    return { destroy: function () {} };
  });
})();

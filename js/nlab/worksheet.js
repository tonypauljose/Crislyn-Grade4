/* ============================================================
   NUMBERS LAB — printable worksheet generator (self-contained)
   window.NLAB_WS.build(hostEl, {name}) renders a randomised A4
   worksheet + answer key. No dependency on the host site, so it
   behaves identically on both children's sites.
   ============================================================ */
window.NLAB_WS = (function () {
  'use strict';
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(a) { return a[ri(0, a.length - 1)]; }
  var SHORT = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'lakhs'];
  var FACT = [1, 10, 100, 1000, 10000, 100000];

  function expanded(n) {
    var s = String(n), out = [];
    for (var i = 0; i < s.length; i++) { var d = +s[i]; if (d) out.push(d * Math.pow(10, s.length - 1 - i)); }
    return out.join(' + ');
  }

  /* ---- question generators: each returns { q, a } ---- */
  var GEN = {
    placeValue: function () {
      var n = ri(1000, 99999), s = String(n);
      var pos = ri(0, s.length - 1);                 // index from left
      var place = s.length - 1 - pos;                // 0 = ones
      var bold = s.split(''); bold[pos] = '<strong>' + bold[pos] + '</strong>';
      return { q: 'In ' + bold.join('') + ', the place value of the bold digit is ____', a: (+s[pos]) * FACT[place] + ' (' + SHORT[place] + ')' };
    },
    expanded: function () { var n = ri(1205, 98760); return { q: 'Write ' + n + ' in expanded form: ____', a: expanded(n) }; },
    align: function () { var a = ri(120, 9000), b = ri(8, 900); return { q: 'Line up on the right and add:  ' + a + '  +  ' + b, a: (a + b) + '', grid: true }; },
    compare: function () { var a = ri(100, 99999), b = (Math.random() < 0.2) ? a : ri(100, 99999); return { q: a + '  ____  ' + b + '   (put <, > or =)', a: a > b ? '>' : a < b ? '<' : '=' }; },
    bin2dec: function () { var n = ri(1, 31); return { q: 'Binary ' + n.toString(2) + ' = ____', a: n + '' }; },
    dec2bin: function () { var n = ri(1, 31); return { q: n + ' in binary = ____', a: n.toString(2) }; },
    hex2dec: function () { var n = ri(10, 255); return { q: 'Hex ' + n.toString(16).toUpperCase() + ' = ____ (decimal)', a: n + '' }; },
    colour: function () { var c = pick([['#FF0000', 'red'], ['#00FF00', 'green'], ['#0000FF', 'blue'], ['#FFFF00', 'yellow'], ['#000000', 'black'], ['#FFFFFF', 'white']]); return { q: 'What colour is ' + c[0] + ' ?  ____', a: c[1] }; }
  };

  var SECTIONS = [
    { title: '1 · Place value', gen: 'placeValue', n: 6 },
    { title: '2 · Expanded form', gen: 'expanded', n: 5 },
    { title: '3 · Right-align & add', gen: 'align', n: 4 },
    { title: '4 · Compare (<, > or =)', gen: 'compare', n: 5 },
    { title: '5 · Binary → number', gen: 'bin2dec', n: 4 },
    { title: '6 · Number → binary', gen: 'dec2bin', n: 4 },
    { title: '7 · Hex → number', gen: 'hex2dec', n: 3 },
    { title: '8 · Hex colours', gen: 'colour', n: 3 }
  ];

  function build(hostEl, opts) {
    opts = opts || {};
    var qHtml = '', aHtml = '';
    SECTIONS.forEach(function (sec) {
      qHtml += '<section class="nlws-sec"><h3>' + sec.title + '</h3><ol>';
      aHtml += '<section class="nlws-sec"><h3>' + sec.title + '</h3><ol>';
      for (var i = 0; i < sec.n; i++) {
        var item = GEN[sec.gen]();
        qHtml += '<li>' + item.q + (item.grid ? '<div class="nlws-grid"></div>' : '') + '</li>';
        aHtml += '<li>' + item.q.replace(/____/g, '<u>&nbsp;' + item.a + '&nbsp;</u>') + '</li>';
      }
      qHtml += '</ol></section>';
      aHtml += '</ol></section>';
    });

    hostEl.innerHTML =
      '<div class="nlws-paper" id="nlws-q">' +
        '<header class="nlws-head"><h1>🔬 Numbers Lab — Practice Sheet</h1>' +
        '<p>Name: ' + (opts.name ? '<strong>' + opts.name + '</strong>' : '____________') + ' &nbsp;&nbsp; Date: ____________ &nbsp;&nbsp; Score: ____ / 34</p></header>' +
        qHtml +
      '</div>' +
      '<div class="nlws-paper nlws-ans" id="nlws-a">' +
        '<header class="nlws-head"><h1>🗝️ Answer Key</h1></header>' + aHtml +
      '</div>';
  }

  function printOnly(which) {
    var b = document.body;
    b.classList.remove('nlws-print-q', 'nlws-print-a');
    b.classList.add(which === 'a' ? 'nlws-print-a' : 'nlws-print-q');
    window.print();
    setTimeout(function () { b.classList.remove('nlws-print-q', 'nlws-print-a'); }, 400);
  }

  return {
    build: build,
    printQuestions: function () { printOnly('q'); },
    printAnswers: function () { printOnly('a'); }
  };
})();

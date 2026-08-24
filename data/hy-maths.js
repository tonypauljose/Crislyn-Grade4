/* ==========================================================================
   HALF-YEARLY 2026 — MATHS ITEM BANK
   --------------------------------------------------------------------------
   Almost everything here is GENERATED, not typed by hand: the generator works
   out the answer from the numbers it just made up, so an item can never carry
   a wrong answer key. Levels 1→3 raise the difficulty as she gets fluent.

   Indian place-value system throughout (lakh, not million) — that is what her
   textbook and workbook use.
   ========================================================================== */

(function () {
  'use strict';
  const R = window.HY.register;
  const B = window.HY.registerBank;

  /* ------------------------------------------------------------- number kit */

  const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function two(n) {
    if (n < 20) return ONES[n];
    return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  }
  function three(n) {
    if (n < 100) return two(n);
    return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + two(n % 100) : '');
  }
  /** Indian number name: ... crore, lakh, thousand, hundred */
  function numName(n) {
    if (n === 0) return 'zero';
    const parts = [];
    const cr = Math.floor(n / 10000000); n %= 10000000;
    const la = Math.floor(n / 100000); n %= 100000;
    const th = Math.floor(n / 1000); n %= 1000;
    if (cr) parts.push(two(cr) + ' crore');
    if (la) parts.push(two(la) + ' lakh');
    if (th) parts.push(two(th) + ' thousand');
    if (n) parts.push(three(n));
    return parts.join(' ');
  }
  /** Indian comma grouping: 5,21,885 */
  function inr(n) {
    const s = String(n);
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const g = [];
    while (rest.length > 2) { g.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
    if (rest) g.unshift(rest);
    return g.join(',') + ',' + last3;
  }

  const RMAP = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
  [5, 'V'], [4, 'IV'], [1, 'I']];
  function roman(n) {
    let out = '', v = n;
    RMAP.forEach(p => { while (v >= p[0]) { out += p[1]; v -= p[0]; } });
    return out;
  }

  const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands',
    'lakhs', 'ten lakhs'];

  /** digits of n, right to left */
  function digitsOf(n) { return String(n).split('').reverse().map(Number); }

  /** random n-digit number with a non-zero leading digit */
  function nDigit(rng, d) {
    let n = rng.int(1, 9);
    for (let i = 1; i < d; i++) n = n * 10 + rng.int(0, 9);
    return n;
  }

  /** build 4 mcq options around a correct value */
  function optsAround(rng, correct, makeWrong) {
    const set = [correct];
    let guard = 0;
    while (set.length < 4 && guard++ < 60) {
      const w = makeWrong();
      if (w !== null && w !== undefined && set.indexOf(w) === -1) set.push(w);
    }
    const shuffled = rng.shuffle(set);
    return { options: shuffled, answer: shuffled.indexOf(correct) };
  }

  /* ====================================================== M1 names→figures */
  R('M1', (lvl, rng) => {
    const d = lvl === 1 ? 5 : (lvl === 2 ? 6 : 7);
    let n = nDigit(rng, d);
    if (lvl >= 2 && rng() < 0.45) {            // sprinkle in tricky zero periods
      const s = String(n).split('');
      s[rng.int(1, s.length - 2)] = '0';
      if (rng() < 0.5) s[s.length - 2] = '0';
      n = Number(s.join(''));
    }
    return {
      type: 'fill',
      q: `Write in figures:<br><span class="hy-words">${numName(n)}</span>`,
      answer: inr(n),
      accept: [String(n), inr(n)],
      numeric: true,
      hint: 'Say it in periods — lakh, thousand, hundred — and give every empty period a 0.',
      explain: `${numName(n)} = <b>${inr(n)}</b>`
    };
  });

  /* ====================================================== M2 figures→names */
  R('M2', (lvl, rng) => {
    const d = lvl === 1 ? 5 : (lvl === 2 ? 6 : 7);
    let n = nDigit(rng, d);
    if (lvl >= 2 && rng() < 0.5) {
      const s = String(n).split('');
      s[rng.int(1, s.length - 2)] = '0';
      n = Number(s.join(''));
    }
    const correct = numName(n);
    if (lvl === 3) {
      return {
        type: 'fill',
        q: `Write the number name of <span class="hy-num">${inr(n)}</span>`,
        answer: correct, accept: [correct],
        words: true,
        hint: 'Read it period by period: lakh … thousand … hundred … then the tens and ones.',
        explain: `${inr(n)} = <b>${correct}</b>`
      };
    }
    const digits = String(n).split('');
    const o = optsAround(rng, correct, () => {
      const s = digits.slice();
      const i = rng.int(0, s.length - 1);
      s[i] = String((Number(s[i]) + rng.int(1, 8)) % 10);
      if (s[0] === '0') s[0] = '1';
      const alt = numName(Number(s.join('')));
      return alt === correct ? null : alt;
    });
    return {
      type: 'mcq',
      q: `What is the number name of <span class="hy-num">${inr(n)}</span>?`,
      options: o.options, answer: o.answer,
      hint: 'Check each period separately — the lakhs, then the thousands, then the rest.',
      explain: `${inr(n)} = <b>${correct}</b>`
    };
  });

  /* ======================================================== M3 place value */
  R('M3', (lvl, rng) => {
    const d = lvl === 1 ? 5 : (lvl === 2 ? 6 : 7);
    let n = nDigit(rng, d);
    const ds = digitsOf(n);
    let pos = rng.int(lvl === 1 ? 1 : 2, ds.length - 1);
    let guard = 0;
    while (ds[pos] === 0 && guard++ < 12) pos = rng.int(1, ds.length - 1);
    const digit = ds[pos];
    const pv = digit * Math.pow(10, pos);
    const askFace = lvl >= 2 && rng() < 0.35;

    if (askFace) {
      return {
        type: 'fill',
        q: `In <span class="hy-num">${inr(n)}</span>, what is the <b>face value</b> of the digit ${digit}?`,
        answer: String(digit), accept: [String(digit)], numeric: true,
        hint: 'Face value is a trick question — it is just the digit itself.',
        explain: `Face value never changes with position. It is <b>${digit}</b>.`
      };
    }
    const o = optsAround(rng, inr(pv), () => {
      const p2 = rng.int(0, ds.length - 1);
      const alt = digit * Math.pow(10, p2);
      return alt === pv ? null : inr(alt);
    });
    return {
      type: 'mcq',
      q: `In <span class="hy-num">${inr(n)}</span>, what is the <b>place value</b> of ${digit}?`,
      options: o.options, answer: o.answer,
      hint: `Count the places from the right: ones, tens, hundreds, thousands…`,
      explain: `${digit} sits in the <b>${PLACE_NAMES[pos]}</b> place, so its place value is ${digit} × ${inr(Math.pow(10, pos))} = <b>${inr(pv)}</b>.`
    };
  });

  /* ===================================================== M4 expanded form */
  R('M4', (lvl, rng) => {
    const d = lvl === 1 ? 4 : (lvl === 2 ? 5 : 6);
    const n = nDigit(rng, d);
    const ds = digitsOf(n);
    const parts = [];
    for (let i = ds.length - 1; i >= 0; i--) {
      if (ds[i]) parts.push(inr(ds[i] * Math.pow(10, i)));
    }
    const expanded = parts.join(' + ');

    if (rng() < 0.5) {
      return {
        type: 'fill',
        q: `Write in <b>standard form</b>:<br><span class="hy-words">${expanded}</span>`,
        answer: inr(n), accept: [String(n), inr(n)], numeric: true,
        hint: 'Just add all the parts together.',
        explain: `${expanded} = <b>${inr(n)}</b>`
      };
    }
    const o = optsAround(rng, expanded, () => {
      const alt = ds.slice();
      const i = rng.int(0, alt.length - 1);
      alt[i] = (alt[i] + rng.int(1, 8)) % 10;
      const p2 = [];
      for (let k = alt.length - 1; k >= 0; k--) if (alt[k]) p2.push(inr(alt[k] * Math.pow(10, k)));
      const s = p2.join(' + ');
      return s === expanded ? null : s;
    });
    return {
      type: 'mcq',
      q: `Which is the <b>expanded form</b> of <span class="hy-num">${inr(n)}</span>?`,
      options: o.options, answer: o.answer,
      hint: 'Break the number up place by place. Skip any place that holds a 0.',
      explain: `${inr(n)} = <b>${expanded}</b>`
    };
  });

  /* ================================================= M5 compare and order */
  R('M5', (lvl, rng) => {
    const d = lvl === 1 ? 5 : 6;

    if (lvl === 1 || rng() < 0.4) {
      // < > = between two close numbers
      let a = nDigit(rng, d);
      let b;
      const kind = rng();
      if (kind < 0.25) b = a;
      else if (kind < 0.7) {                        // differ only near the end
        const s = String(a).split('');
        const i = s.length - rng.int(1, 2);
        s[i] = String((Number(s[i]) + rng.int(1, 9)) % 10);
        b = Number(s.join(''));
      } else b = nDigit(rng, d);
      const correct = a > b ? '>' : (a < b ? '<' : '=');
      return {
        type: 'mcq',
        q: `Put the right sign:<br><span class="hy-num">${inr(a)} <span class="hy-blank">?</span> ${inr(b)}</span>`,
        options: ['<', '>', '='], answer: ['<', '>', '='].indexOf(correct),
        hint: 'Same number of digits? Then compare from the LEFT until two digits differ.',
        explain: `${inr(a)} <b>${correct}</b> ${inr(b)}`
      };
    }

    // ascending / descending ordering
    const asc = rng() < 0.5;
    const base = nDigit(rng, d);
    const set = new Set([base]);
    while (set.size < 4) {
      const s = String(base).split('');
      const i = rng.int(0, s.length - 1);
      s[i] = String(rng.int(0, 9));
      if (s[0] === '0') s[0] = String(rng.int(1, 9));
      set.add(Number(s.join('')));
    }
    const nums = Array.from(set);
    const sorted = nums.slice().sort((x, y) => asc ? x - y : y - x);
    return {
      type: 'order',
      q: `Arrange in <b>${asc ? 'ascending' : 'descending'}</b> order<br>
          <span class="hy-sub">${asc ? 'smallest first ⬆' : 'biggest first ⬇'}</span>`,
      tiles: rng.shuffle(nums).map(inr),
      answer: sorted.map(inr),
      hint: asc ? 'Find the smallest one first, then the next smallest.'
        : 'Find the biggest one first, then the next biggest.',
      explain: `<b>${sorted.map(inr).join(' , ')}</b>`
    };
  });

  /* ============================================ M6 successor / predecessor */
  R('M6', (lvl, rng) => {
    const d = lvl === 1 ? 5 : (lvl === 2 ? 6 : 7);
    let n = nDigit(rng, d);
    if (lvl >= 2 && rng() < 0.45) n = Math.floor(n / 10) * 10 + (rng() < 0.5 ? 0 : 9); // 9s / 0s edge
    const succ = rng() < 0.5;
    const ans = succ ? n + 1 : n - 1;
    return {
      type: 'fill',
      q: `Write the <b>${succ ? 'successor' : 'predecessor'}</b> of <span class="hy-num">${inr(n)}</span>`,
      answer: inr(ans), accept: [String(ans), inr(ans)], numeric: true,
      hint: succ ? 'Successor comes just AFTER — add 1.' : 'Predecessor comes just BEFORE — subtract 1.',
      explain: `${inr(n)} ${succ ? '+' : '−'} 1 = <b>${inr(ans)}</b>`
    };
  });

  /* ============================================ M7 greatest / smallest num */
  R('M7', (lvl, rng) => {
    const count = lvl === 1 ? 4 : (lvl === 2 ? 5 : 6);
    const digits = [];
    const withZero = lvl >= 2 && rng() < 0.6;
    while (digits.length < count) {
      const dg = digits.length === 0 && !withZero ? rng.int(1, 9) : rng.int(0, 9);
      if (digits.indexOf(dg) === -1) digits.push(dg);
    }
    if (withZero && digits.indexOf(0) === -1) digits[rng.int(0, count - 1)] = 0;

    const greatest = Number(digits.slice().sort((a, b) => b - a).join(''));
    const asc = digits.slice().sort((a, b) => a - b);
    if (asc[0] === 0) {                       // 0 may not lead
      const swapWith = asc.findIndex(x => x !== 0);
      asc[0] = asc[swapWith]; asc[swapWith] = 0;
    }
    const smallest = Number(asc.join(''));
    const wantG = rng() < 0.5;
    const ans = wantG ? greatest : smallest;
    return {
      type: 'fill',
      q: `Using the digits <span class="hy-num">${digits.join(', ')}</span> once each,<br>
          make the <b>${wantG ? 'greatest' : 'smallest'}</b> number.`,
      answer: inr(ans), accept: [String(ans), inr(ans)], numeric: true,
      hint: wantG ? 'Biggest digit first, then the next biggest.'
        : (digits.indexOf(0) > -1
          ? 'Smallest first — but 0 cannot start a number. Put the next smallest first, then the 0.'
          : 'Smallest digit first, then the next smallest.'),
      explain: `Greatest = ${inr(greatest)} · Smallest = ${inr(smallest)}. Answer: <b>${inr(ans)}</b>`
    };
  });

  /* ========================================================= M8 Roman ✱weak */
  R('M8', (lvl, rng) => {
    const max = lvl === 1 ? 20 : (lvl === 2 ? 39 : 50);
    const min = lvl === 1 ? 1 : (lvl === 2 ? 11 : 20);
    const n = rng.int(min, max);
    const r = roman(n);
    const flavour = rng();

    if (flavour < 0.4) {
      return {
        type: 'fill',
        q: `Write <span class="hy-num">${n}</span> in Roman numerals`,
        answer: r, accept: [r, r.toLowerCase()],
        upper: true,
        hint: 'Break it up: tens first (X, XX, XXX, XL, L), then the ones (I…IX).',
        explain: `${n} = <b>${r}</b>`
      };
    }
    if (flavour < 0.75) {
      return {
        type: 'fill',
        q: `What number is <span class="hy-num">${r}</span>?`,
        answer: String(n), accept: [String(n)], numeric: true,
        hint: 'Add the symbols left to right — but if a small one comes BEFORE a bigger one, subtract it.',
        explain: `<b>${r} = ${n}</b>`
      };
    }
    // rule-spotting: which Roman numeral is written wrongly?
    const bad = rng.pick(['VX', 'IL', 'VV', 'IIII', 'XXXX', 'LL', 'VL', 'IC']);
    const goods = [roman(rng.int(1, 20)), roman(rng.int(21, 39)), roman(rng.int(40, 50))];
    const all = rng.shuffle([bad].concat(goods.filter(g => g !== bad).slice(0, 3)));
    return {
      type: 'mcq',
      q: 'Which one is <b>NOT</b> a correct Roman numeral?',
      options: all, answer: all.indexOf(bad),
      hint: 'V and L are never repeated and never subtracted. No symbol repeats more than 3 times.',
      explain: `<b>${bad}</b> breaks the rules. V and L can never be repeated or subtracted, and I, X, C may repeat at most three times.`
    };
  });

  /* ================================================== M9 addition (carry) */
  R('M9', (lvl, rng) => {
    const d = lvl === 1 ? 4 : (lvl === 2 ? 5 : 6);
    const three = lvl === 3 && rng() < 0.5;
    const a = nDigit(rng, d), b = nDigit(rng, d), c = three ? nDigit(rng, d - 1) : 0;
    const sum = a + b + c;
    const q = three
      ? `${inr(a)} + ${inr(b)} + ${inr(c)}`
      : `${inr(a)} + ${inr(b)}`;
    return {
      type: 'fill',
      q: `Add:<br><span class="hy-num">${q}</span>`,
      answer: inr(sum), accept: [String(sum), inr(sum)], numeric: true,
      hint: 'Line the ones under the ones. Work right to left and carry over.',
      explain: `${q} = <b>${inr(sum)}</b>`
    };
  });

  /* =============================================== M10 subtraction (borrow) */
  R('M10', (lvl, rng) => {
    const d = lvl === 1 ? 4 : (lvl === 2 ? 5 : 6);
    let a = nDigit(rng, d);
    if (lvl >= 2 && rng() < 0.45) {                 // force borrowing across zeros
      const s = String(a).split('');
      for (let i = 1; i < s.length - 1; i++) if (rng() < 0.6) s[i] = '0';
      a = Number(s.join(''));
    }
    let b = rng.int(Math.floor(a / 4), a - 1);
    const diff = a - b;
    return {
      type: 'fill',
      q: `Subtract:<br><span class="hy-num">${inr(a)} − ${inr(b)}</span>`,
      answer: inr(diff), accept: [String(diff), inr(diff)], numeric: true,
      hint: 'Borrowing past a 0? Keep going left until you find a digit to borrow from — every 0 you pass becomes 9.',
      explain: `${inr(a)} − ${inr(b)} = <b>${inr(diff)}</b><br>
        Check: ${inr(diff)} + ${inr(b)} = ${inr(a)} ✓`
    };
  });

  /* ================================================== M11 properties +/− */
  R('M11', (lvl, rng) => {
    const a = nDigit(rng, lvl === 1 ? 3 : 5);
    const b = nDigit(rng, lvl === 1 ? 3 : 4);
    const c = nDigit(rng, 3);
    const kinds = [
      () => ({ q: `${inr(a)} + 0 = <span class="hy-blank">?</span>`, ans: a, why: 'Adding zero changes nothing.' }),
      () => ({ q: `${inr(a)} − 0 = <span class="hy-blank">?</span>`, ans: a, why: 'Taking away nothing leaves the number as it was.' }),
      () => ({ q: `${inr(a)} − ${inr(a)} = <span class="hy-blank">?</span>`, ans: 0, why: 'A number minus itself is always 0.' }),
      () => ({ q: `${inr(a)} + ${inr(b)} = ${inr(b)} + <span class="hy-blank">?</span>`, ans: a, why: 'Order does not matter when you add.' }),
      () => ({ q: `(${inr(a)} + ${inr(b)}) + ${inr(c)} = ${inr(a)} + (${inr(b)} + <span class="hy-blank">?</span>)`, ans: c, why: 'Grouping does not change the sum.' }),
      () => ({ q: `${inr(a)} + 1000 = <span class="hy-blank">?</span>`, ans: a + 1000, why: 'Only the thousands digit moves up by one.' }),
      () => ({ q: `${inr(a)} − 100 = <span class="hy-blank">?</span>`, ans: a - 100, why: 'Only the hundreds digit moves down by one.' })
    ];
    const k = rng.pick(kinds)();
    return {
      type: 'fill',
      q: `Fill in the blank:<br><span class="hy-num">${k.q}</span>`,
      answer: inr(k.ans), accept: [String(k.ans), inr(k.ans)], numeric: true,
      hint: 'You should not need to work this out on paper — think about the rule.',
      explain: `<b>${inr(k.ans)}</b> — ${k.why}`
    };
  });

  /* =============================================== M12 missing number sums */
  R('M12', (lvl, rng) => {
    const d = lvl === 1 ? 3 : (lvl === 2 ? 4 : 5);
    const a = nDigit(rng, d);
    const res = a + nDigit(rng, d);
    const kind = rng.int(0, 2);
    let q, ans, why;
    if (kind === 0) {
      q = `What should be added to <span class="hy-num">${inr(a)}</span> to get <span class="hy-num">${inr(res)}</span>?`;
      ans = res - a; why = `${inr(res)} − ${inr(a)} = ${inr(ans)}`;
    } else if (kind === 1) {
      q = `The sum of two numbers is <span class="hy-num">${inr(res)}</span>.<br>One of them is <span class="hy-num">${inr(a)}</span>. Find the other.`;
      ans = res - a; why = `${inr(res)} − ${inr(a)} = ${inr(ans)}`;
    } else {
      const diff = res - a;
      q = `The difference of two numbers is <span class="hy-num">${inr(diff)}</span>.<br>The bigger number is <span class="hy-num">${inr(res)}</span>. Find the smaller one.`;
      ans = res - diff; why = `${inr(res)} − ${inr(diff)} = ${inr(ans)}`;
    }
    return {
      type: 'fill', q, answer: inr(ans), accept: [String(ans), inr(ans)], numeric: true,
      hint: 'Every one of these is a subtraction — take the part you know away from the whole.',
      explain: `<b>${inr(ans)}</b> &nbsp; (${why})`
    };
  });

  /* ============================================ M13 check by adding back */
  R('M13', (lvl, rng) => {
    const d = lvl === 1 ? 4 : 5;
    const a = nDigit(rng, d);
    const b = rng.int(Math.floor(a / 3), a - 1);
    const diff = a - b;
    const which = rng.int(0, 2);
    const names = ['minuend', 'subtrahend', 'difference'];
    const vals = [a, b, diff];
    return {
      type: 'fill',
      q: `In <span class="hy-num">${inr(a)} − ${inr(b)} = ${inr(diff)}</span>,<br>
          what is the <b>${names[which]}</b>?`,
      answer: inr(vals[which]), accept: [String(vals[which]), inr(vals[which])], numeric: true,
      hint: 'Minuend − Subtrahend = Difference. The minuend is the one you start with.',
      explain: `Minuend ${inr(a)} − Subtrahend ${inr(b)} = Difference ${inr(diff)}.<br>
        Check by adding: ${inr(diff)} + ${inr(b)} = ${inr(a)} ✓`
    };
  });

  /* ============================================ M14 +/− word problems */
  R('M14', (lvl, rng) => {
    const big = () => nDigit(rng, lvl === 1 ? 4 : 5);
    const stories = [
      () => { const a = big(), b = big(); return { q: `A factory made <b>${inr(a)}</b> pencils in June and <b>${inr(b)}</b> pencils in July. How many pencils did it make altogether?`, ans: a + b, u: 'pencils', why: `${inr(a)} + ${inr(b)}` }; },
      () => { const a = big(), b = rng.int(100, Math.max(200, Math.floor(a / 2))); return { q: `A library has <b>${inr(a)}</b> books. <b>${inr(b)}</b> books were given out. How many books are left?`, ans: a - b, u: 'books', why: `${inr(a)} − ${inr(b)}` }; },
      () => { const a = big(), b = big(); const hi = Math.max(a, b), lo = Math.min(a, b); return { q: `In a stadium there were <b>${inr(a)}</b> people on Saturday and <b>${inr(b)}</b> on Sunday. How many more people came on the busier day?`, ans: hi - lo, u: 'people', why: `${inr(hi)} − ${inr(lo)}` }; },
      () => { const a = big(), b = rng.int(500, 5000), c = rng.int(500, 5000); return { q: `A shop had <b>${inr(a)}</b> riyals. It earned <b>${inr(b)}</b> riyals more, then spent <b>${inr(c)}</b> riyals. How much money does the shop have now?`, ans: a + b - c, u: 'riyals', why: `${inr(a)} + ${inr(b)} − ${inr(c)}` }; },
      () => { const a = big(), b = rng.int(1000, 9000); return { q: `A school collected <b>${inr(a)}</b> bottle caps. It needs <b>${inr(a + b)}</b> in all. How many more are needed?`, ans: b, u: 'caps', why: `${inr(a + b)} − ${inr(a)}` }; }
    ];
    const s = rng.pick(stories)();
    return {
      type: 'fill',
      q: s.q,
      answer: inr(s.ans), accept: [String(s.ans), inr(s.ans), inr(s.ans) + ' ' + s.u], numeric: true,
      unit: s.u,
      hint: 'Are things being joined together, or taken away / compared? Two-step problems need the middle answer first.',
      explain: `${s.why} = <b>${inr(s.ans)} ${s.u}</b>`
    };
  });

  /* ============================================== M15 tables 2–12 (speed) */
  R('M15', (lvl, rng) => {
    const hard = [[7, 8], [6, 7], [8, 9], [7, 9], [6, 8], [12, 7], [11, 12], [12, 8], [9, 6], [12, 12]];
    let a, b;
    if (lvl >= 2 && rng() < 0.5) { const p = rng.pick(hard); a = p[0]; b = p[1]; }
    else { a = rng.int(2, 12); b = rng.int(2, 12); }
    if (rng() < 0.5) { const t = a; a = b; b = t; }
    const p = a * b;
    if (lvl === 3 && rng() < 0.35) {
      return {
        type: 'fill',
        q: `<span class="hy-num">${a} × <span class="hy-blank">?</span> = ${p}</span>`,
        answer: String(b), accept: [String(b)], numeric: true, fast: true,
        hint: `Count up in ${a}s until you reach ${p}.`,
        explain: `${a} × <b>${b}</b> = ${p}`
      };
    }
    return {
      type: 'fill',
      q: `<span class="hy-num hy-big">${a} × ${b}</span>`,
      answer: String(p), accept: [String(p)], numeric: true, fast: true,
      hint: `Think of the ${a} times table.`,
      explain: `${a} × ${b} = <b>${p}</b>`
    };
  });

  /* ============================================ M16 × 10 / 100 / 1000 */
  R('M16', (lvl, rng) => {
    const zeros = rng.int(1, 3);
    const mult = Math.pow(10, zeros) * (lvl === 1 ? 1 : rng.int(1, 9));
    const a = lvl === 1 ? rng.int(2, 99) : nDigit(rng, rng.int(2, 3));
    const p = a * mult;
    return {
      type: 'fill',
      q: `<span class="hy-num">${a} × ${inr(mult)}</span>`,
      answer: inr(p), accept: [String(p), inr(p)], numeric: true,
      hint: 'Multiply the front numbers, then write ALL the zeros on the end.',
      explain: `${a} × ${mult / Math.pow(10, zeros)} = ${a * (mult / Math.pow(10, zeros))}, then add ${zeros} zero${zeros > 1 ? 's' : ''} → <b>${inr(p)}</b>`
    };
  });

  /* ============================================ M17 × properties */
  R('M17', (lvl, rng) => {
    const a = rng.int(11, 999), b = rng.int(2, 12), c = rng.int(2, 9);
    const kinds = [
      () => ({ q: `${inr(a)} × 0 = <span class="hy-blank">?</span>`, ans: 0, why: 'Anything multiplied by 0 is 0.' }),
      () => ({ q: `${inr(a)} × 1 = <span class="hy-blank">?</span>`, ans: a, why: 'Multiplying by 1 leaves the number unchanged.' }),
      () => ({ q: `${b} × ${c} = ${c} × <span class="hy-blank">?</span>`, ans: b, why: 'Order does not matter when you multiply.' }),
      () => ({ q: `(${b} × ${c}) × 2 = ${b} × (${c} × <span class="hy-blank">?</span>)`, ans: 2, why: 'Grouping does not change the product.' }),
      () => ({ q: `${b} × (${c} + 10) = (${b} × ${c}) + (${b} × <span class="hy-blank">?</span>)`, ans: 10, why: 'The multiplier is shared out over both parts.' })
    ];
    const k = rng.pick(kinds)();
    return {
      type: 'fill',
      q: `Fill in the blank:<br><span class="hy-num">${k.q}</span>`,
      answer: inr(k.ans), accept: [String(k.ans), inr(k.ans)], numeric: true,
      hint: 'This is a rule, not a sum. Which property fits?',
      explain: `<b>${inr(k.ans)}</b> — ${k.why}`
    };
  });

  /* ============================================ M18 × by a 1-digit number */
  R('M18', (lvl, rng) => {
    const d = lvl === 1 ? 2 : (lvl === 2 ? 3 : 4);
    const a = nDigit(rng, d);
    const b = rng.int(2, 9);
    const p = a * b;
    return {
      type: 'fill',
      q: `Find the product:<br><span class="hy-num">${inr(a)} × ${b}</span>`,
      answer: inr(p), accept: [String(p), inr(p)], numeric: true,
      hint: 'Multiply each digit from the right. Carry, then ADD the carry to the next product.',
      explain: `${inr(a)} × ${b} = <b>${inr(p)}</b>`
    };
  });

  /* ============================================ M19 × word problems */
  R('M19', (lvl, rng) => {
    const stories = [
      () => { const a = nDigit(rng, lvl === 1 ? 2 : 3), b = rng.int(3, 9); return { q: `One carton holds <b>${a}</b> pens. How many pens are in <b>${b}</b> cartons?`, ans: a * b, u: 'pens', why: `${a} × ${b}` }; },
      () => { const a = nDigit(rng, 3), b = rng.int(4, 9); return { q: `A shop sells <b>${a}</b> ice creams every day. How many does it sell in <b>${b}</b> days?`, ans: a * b, u: 'ice creams', why: `${a} × ${b}` }; },
      () => { const a = rng.int(12, 60), b = rng.int(6, 9); return { q: `There are <b>${a}</b> chairs in one row. How many chairs are there in <b>${b}</b> equal rows?`, ans: a * b, u: 'chairs', why: `${a} × ${b}` }; },
      () => { const a = nDigit(rng, 3), b = rng.int(3, 8); return { q: `A bus can carry <b>${a}</b> people. How many people can <b>${b}</b> such buses carry?`, ans: a * b, u: 'people', why: `${a} × ${b}` }; }
    ];
    const s = rng.pick(stories)();
    return {
      type: 'fill', q: s.q,
      answer: inr(s.ans), accept: [String(s.ans), inr(s.ans)], numeric: true, unit: s.u,
      hint: 'Words like "each", "every" and "one … how many in many" mean multiply.',
      explain: `${s.why} = <b>${inr(s.ans)} ${s.u}</b>`
    };
  });

  /* ====================================== M24 perimeter of a polygon */
  R('M24', (lvl, rng) => {
    const sides = lvl === 1 ? 3 : rng.int(4, 6);
    const top = lvl === 3 ? 45 : 20;
    const L = [];
    if (sides === 3) {
      // Respect the triangle inequality — a "triangle" of 12, 3 and 19 cm
      // cannot be drawn, and a maths teacher would rightly object.
      const a = rng.int(4, top), b = rng.int(4, top);
      const lo = Math.abs(a - b) + 1, hiRaw = a + b - 1;
      L.push(a, b, rng.int(lo, Math.max(lo, Math.min(top, hiRaw))));
    } else {
      for (let i = 0; i < sides; i++) L.push(rng.int(2, top));
    }
    const P = L.reduce((a, b) => a + b, 0);
    const names = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon' };
    return {
      type: 'steps',
      q: `Find the perimeter of a <b>${names[sides]}</b> whose sides are<br>
          <span class="hy-num">${L.join(' cm , ')} cm</span>`,
      steps: [
        {
          ask: 'Perimeter of the polygon = sum of the lengths of the sides. Add them up:',
          answer: String(P), accept: [String(P), P + ' cm'], numeric: true, suffix: 'cm'
        }
      ],
      hint: 'Perimeter just means "add every side once".',
      explain: `Perimeter of the polygon<br>= sum of the lengths of the sides<br>
        = ${L.join(' + ')} cm<br>= <b>${P} cm</b>`
    };
  });

  /* ====================================== M25 perimeter of a rectangle */
  R('M25', (lvl, rng) => {
    const l = rng.int(4, lvl === 3 ? 60 : 25);
    const b = rng.int(2, l - 1);
    const P = 2 * (l + b);

    if (lvl === 3 && rng() < 0.35) {                 // work backwards
      return {
        type: 'fill',
        q: `The perimeter of a rectangle is <b>${P} cm</b> and its breadth is <b>${b} cm</b>.<br>Find its length.`,
        answer: String(l), accept: [String(l), l + ' cm'], numeric: true, suffix: 'cm',
        hint: 'Halve the perimeter to get (length + breadth), then take away the breadth.',
        explain: `${P} ÷ 2 = ${P / 2}, then ${P / 2} − ${b} = <b>${l} cm</b>`
      };
    }
    return {
      type: 'steps',
      q: `A rectangle has length <b>${l} cm</b> and breadth <b>${b} cm</b>.<br>Find its perimeter.`,
      steps: [
        { ask: 'Step 1 — add the length and the breadth:', answer: String(l + b), accept: [String(l + b)], numeric: true },
        { ask: 'Step 2 — multiply that by 2. Perimeter =', answer: String(P), accept: [String(P), P + ' cm'], numeric: true, suffix: 'cm' }
      ],
      hint: 'Perimeter of a rectangle = 2 × (length + breadth).',
      explain: `Perimeter of the rectangle<br>= 2 × (l + b)<br>= 2 × (${l} + ${b})<br>= 2 × ${l + b}<br>= <b>${P} cm</b>`
    };
  });

  /* ====================================== M26 perimeter of a square */
  R('M26', (lvl, rng) => {
    const s = rng.int(3, lvl === 3 ? 75 : 25);
    const P = 4 * s;
    if (lvl >= 2 && rng() < 0.4) {
      return {
        type: 'fill',
        q: `The perimeter of a square is <b>${P} cm</b>.<br>Find the length of one side.`,
        answer: String(s), accept: [String(s), s + ' cm'], numeric: true, suffix: 'cm',
        hint: 'A square has 4 equal sides — so divide by 4.',
        explain: `Side = ${P} ÷ 4 = <b>${s} cm</b>`
      };
    }
    return {
      type: 'fill',
      q: `Find the perimeter of a square of side <b>${s} cm</b>.`,
      answer: String(P), accept: [String(P), P + ' cm'], numeric: true, suffix: 'cm',
      hint: 'Perimeter of a square = 4 × side.',
      explain: `Perimeter of the square<br>= 4 × side<br>= 4 × ${s}<br>= <b>${P} cm</b>`
    };
  });

  /* ====================================== M27 area */
  R('M27', (lvl, rng) => {
    const square = rng() < 0.4;
    if (square) {
      const s = rng.int(3, lvl === 3 ? 30 : 15);
      return {
        type: 'fill',
        q: `Find the area of a square of side <b>${s} cm</b>.`,
        answer: String(s * s), accept: [String(s * s), s * s + ' cm2', s * s + ' sq cm'], numeric: true, suffix: 'cm²',
        hint: 'Area of a square = side × side.',
        explain: `Area = ${s} × ${s} = <b>${s * s} cm²</b>`
      };
    }
    const l = rng.int(4, lvl === 3 ? 40 : 18), b = rng.int(2, l - 1);
    if (lvl === 3 && rng() < 0.3) {
      return {
        type: 'fill',
        q: `A rectangle has an area of <b>${l * b} cm²</b> and a breadth of <b>${b} cm</b>.<br>Find its length.`,
        answer: String(l), accept: [String(l), l + ' cm'], numeric: true, suffix: 'cm',
        hint: 'Area = length × breadth, so length = area ÷ breadth.',
        explain: `${l * b} ÷ ${b} = <b>${l} cm</b>`
      };
    }
    return {
      type: 'fill',
      q: `Find the area of a rectangle with length <b>${l} cm</b> and breadth <b>${b} cm</b>.`,
      answer: String(l * b), accept: [String(l * b), l * b + ' cm2', l * b + ' sq cm'], numeric: true, suffix: 'cm²',
      hint: 'Area of a rectangle = length × breadth.',
      explain: `Area = ${l} × ${b} = <b>${l * b} cm²</b>`
    };
  });

  /* ====================================== M28 perimeter / area problems */
  R('M28', (lvl, rng) => {
    const l = rng.int(6, 40), b = rng.int(3, l - 1), s = rng.int(4, 25);
    const stories = [
      { q: `A garden is <b>${l} m</b> long and <b>${b} m</b> wide. How much fencing is needed to go all the way around it?`, ans: 2 * (l + b), u: 'm', why: `Fencing goes around → perimeter = 2 × (${l} + ${b}) = ${2 * (l + b)} m` },
      { q: `A rectangular floor is <b>${l} m</b> long and <b>${b} m</b> wide. How much carpet is needed to cover it?`, ans: l * b, u: 'm²', why: `Covering a surface → area = ${l} × ${b} = ${l * b} m²` },
      { q: `A square photo frame has a side of <b>${s} cm</b>. What length of ribbon will go around its edge?`, ans: 4 * s, u: 'cm', why: `Around the edge → perimeter = 4 × ${s} = ${4 * s} cm` },
      { q: `A square handkerchief has a side of <b>${s} cm</b>. What is the area of the cloth?`, ans: s * s, u: 'cm²', why: `Amount of cloth → area = ${s} × ${s} = ${s * s} cm²` }
    ];
    const st = rng.pick(stories);
    return {
      type: 'fill', q: st.q,
      answer: String(st.ans), accept: [String(st.ans), st.ans + ' ' + st.u], numeric: true, suffix: st.u,
      hint: 'Going AROUND the edge → perimeter. COVERING the inside → area.',
      explain: `<b>${st.ans} ${st.u}</b> — ${st.why}`
    };
  });

  /* ======================================================================
     Fixed banks — geometry vocabulary. These are definitions, so they are
     written out rather than generated, straight from her notebook.
     ====================================================================== */

  B('M20', [
    { type: 'mcq', level: 1, q: 'Which one has <b>two</b> end points and a definite length?', options: ['A ray', 'A line segment', 'A line', 'A point'], answer: 1, explain: 'A <b>line segment</b> is a part of a line with two end points, so we can measure it.' },
    { type: 'mcq', level: 1, q: 'Which one goes on endlessly in <b>both</b> directions?', options: ['A line', 'A ray', 'A line segment', 'A curve'], answer: 0, explain: 'A <b>line</b> has no end points — it never stops in either direction.' },
    { type: 'mcq', level: 1, q: 'A <b>ray</b> has …', options: ['no end points', 'one end point', 'two end points', 'three end points'], answer: 1, explain: 'A ray starts at one end point and goes on endlessly in one direction.' },
    { type: 'mcq', level: 1, q: 'An exact location, shown by a dot and named with a capital letter, is a …', options: ['line', 'point', 'ray', 'vertex'], answer: 1, explain: 'A <b>point</b> marks an exact location.' },
    { type: 'fill', level: 2, q: 'A line segment has <span class="hy-blank">?</span> end points.', answer: '2', accept: ['2', 'two'], explain: 'Two end points — that is why it can be measured.' },
    { type: 'mcq', level: 2, q: 'A curve that starts and ends at the <b>same</b> point is called …', options: ['an open curve', 'a closed curve', 'a straight line', 'a ray'], answer: 1, explain: 'A <b>closed curve</b> joins back to where it began. An open curve does not.' },
    { type: 'sort', level: 2, q: 'Sort these by how many end points they have.', buckets: [{ name: 'No end point', items: ['Line'] }, { name: 'One end point', items: ['Ray'] }, { name: 'Two end points', items: ['Line segment'] }], explain: 'Line = none · Ray = one · Line segment = two.' },
    { type: 'tf', level: 2, q: 'A line segment can be measured with a ruler.', answer: true, explain: 'True — it has two end points, so it has a definite length.' },
    { type: 'tf', level: 3, q: 'A ray can be measured with a ruler.', answer: false, explain: 'False — a ray never ends in one direction, so it has no definite length.' },
    { type: 'mcq', level: 3, q: 'Which of these is an <b>open</b> curve?', options: ['A circle', 'The letter S', 'A triangle', 'A square'], answer: 1, explain: 'The letter S does not join back to its starting point, so it is an open curve.' }
  ]);

  B('M21', [
    { type: 'mcq', level: 1, q: 'An angle that is exactly <b>90°</b> is called …', options: ['acute', 'right', 'obtuse', 'straight'], answer: 1, explain: 'Exactly 90° is a <b>right angle</b>.' },
    { type: 'mcq', level: 1, q: 'An angle <b>less than 90°</b> is …', options: ['obtuse', 'right', 'acute', 'reflex'], answer: 2, explain: 'Less than 90° is <b>acute</b> — a small, sharp angle.' },
    { type: 'mcq', level: 1, q: 'An angle of exactly <b>180°</b> is …', options: ['a straight angle', 'a complete angle', 'a reflex angle', 'a right angle'], answer: 0, explain: '180° makes a straight line — a <b>straight angle</b>.' },
    { type: 'mcq', level: 2, q: 'An angle <b>more than 90°</b> but <b>less than 180°</b> is …', options: ['acute', 'reflex', 'obtuse', 'complete'], answer: 2, explain: 'Between 90° and 180° is <b>obtuse</b>.' },
    { type: 'mcq', level: 2, q: 'An angle of exactly <b>360°</b> is …', options: ['reflex', 'straight', 'obtuse', 'complete'], answer: 3, explain: 'A full turn, 360°, is a <b>complete angle</b>.' },
    { type: 'mcq', level: 2, q: 'The two rays that form an angle are called its …', options: ['vertices', 'arms', 'chords', 'sides'], answer: 1, explain: 'The rays are the <b>arms</b>; the point where they meet is the <b>vertex</b>.' },
    { type: 'fill', level: 2, q: 'The common end point where two rays meet to form an angle is called the <span class="hy-blank">?</span>', answer: 'vertex', accept: ['vertex'], explain: 'The <b>vertex</b> is the corner point of the angle.' },
    { type: 'mcq', level: 3, q: 'An angle of <b>245°</b> is …', options: ['obtuse', 'reflex', 'straight', 'complete'], answer: 1, explain: 'More than 180° but less than 360° → <b>reflex</b>.' },
    { type: 'mcq', level: 3, q: 'An angle of <b>89°</b> is …', options: ['acute', 'right', 'obtuse', 'reflex'], answer: 0, explain: '89° is just under 90°, so it is <b>acute</b>. Read the number carefully!' },
    { type: 'order', level: 3, q: 'Put these angles in order, <b>smallest to biggest</b>.', tiles: ['Straight (180°)', 'Right (90°)', 'Complete (360°)', 'Acute (45°)'], answer: ['Acute (45°)', 'Right (90°)', 'Straight (180°)', 'Complete (360°)'], explain: 'Acute 45° → Right 90° → Straight 180° → Complete 360°.' },
    { type: 'sort', level: 3, q: 'Sort these angle sizes.', buckets: [{ name: 'Acute', items: ['30°', '75°'] }, { name: 'Obtuse', items: ['110°', '160°'] }, { name: 'Reflex', items: ['200°', '300°'] }], explain: 'Acute < 90° · Obtuse is between 90° and 180° · Reflex is between 180° and 360°.' }
  ]);

  B('M22', [
    { type: 'fill', level: 1, q: 'How many sides does a <b>pentagon</b> have?', answer: '5', accept: ['5', 'five'], numeric: true, explain: 'A pentagon has <b>5</b> sides and 5 vertices.' },
    { type: 'fill', level: 1, q: 'How many sides does a <b>hexagon</b> have?', answer: '6', accept: ['6', 'six'], numeric: true, explain: 'A hexagon has <b>6</b> sides and 6 vertices.' },
    { type: 'fill', level: 1, q: 'How many vertices does a <b>quadrilateral</b> have?', answer: '4', accept: ['4', 'four'], numeric: true, explain: 'In every polygon, sides = vertices. A quadrilateral has <b>4</b> of each.' },
    { type: 'mcq', level: 1, q: 'A closed figure made only of <b>line segments</b> is called a …', options: ['circle', 'curve', 'polygon', 'ray'], answer: 2, explain: 'A <b>polygon</b> is closed and made only of straight line segments.' },
    { type: 'mcq', level: 2, q: 'Which of these is <b>NOT</b> a polygon?', options: ['Triangle', 'Circle', 'Pentagon', 'Hexagon'], answer: 1, explain: 'A circle is made of a curve, not line segments — so it is not a polygon.' },
    { type: 'match', level: 2, q: 'Match each polygon to its number of sides.', pairs: [['Triangle', '3'], ['Quadrilateral', '4'], ['Pentagon', '5'], ['Hexagon', '6'], ['Octagon', '8']], explain: 'Triangle 3 · Quadrilateral 4 · Pentagon 5 · Hexagon 6 · Octagon 8.' },
    { type: 'mcq', level: 2, q: 'A polygon with <b>7</b> sides is called a …', options: ['hexagon', 'heptagon', 'octagon', 'pentagon'], answer: 1, explain: 'Seven sides → <b>heptagon</b>.' },
    { type: 'tf', level: 3, q: 'A regular polygon has all its sides equal and all its angles equal.', answer: true, explain: 'True — that is exactly what "regular" means.' },
    { type: 'fill', level: 3, q: 'A polygon has <b>8</b> vertices. How many sides does it have?', answer: '8', accept: ['8', 'eight'], numeric: true, explain: 'Sides always equal vertices, so <b>8</b>. It is an octagon.' }
  ]);

  B('M23', [
    { type: 'mcq', level: 1, q: 'A line segment from the <b>centre</b> to any point on the circle is the …', options: ['diameter', 'chord', 'radius', 'arc'], answer: 2, explain: 'Centre → edge is the <b>radius</b>.' },
    { type: 'mcq', level: 1, q: 'A chord that passes through the <b>centre</b> is the …', options: ['radius', 'diameter', 'arc', 'circumference'], answer: 1, explain: 'The <b>diameter</b> is the longest chord — it goes right through the centre.' },
    { type: 'mcq', level: 1, q: 'The distance all the way <b>around</b> a circle is its …', options: ['perimeter', 'circumference', 'diameter', 'area'], answer: 1, explain: 'For a circle, the distance around is called the <b>circumference</b>.' },
    { type: 'fill', level: 2, q: 'The radius of a circle is <b>7 cm</b>. What is its diameter?', answer: '14', accept: ['14', '14 cm'], numeric: true, suffix: 'cm', explain: 'Diameter = 2 × radius = 2 × 7 = <b>14 cm</b>.' },
    { type: 'fill', level: 2, q: 'The diameter of a circle is <b>18 cm</b>. What is its radius?', answer: '9', accept: ['9', '9 cm'], numeric: true, suffix: 'cm', explain: 'Radius = diameter ÷ 2 = 18 ÷ 2 = <b>9 cm</b>.' },
    { type: 'mcq', level: 2, q: 'Any part of the circumference of a circle is called an …', options: ['arc', 'axis', 'angle', 'arm'], answer: 0, explain: 'A part of the circumference is an <b>arc</b>.' },
    { type: 'fill', level: 3, q: 'The radius of a circle is <b>12.5 cm</b>. Find the diameter.', answer: '25', accept: ['25', '25 cm'], numeric: true, suffix: 'cm', explain: '2 × 12.5 = <b>25 cm</b>.' },
    { type: 'tf', level: 3, q: 'Every chord of a circle passes through the centre.', answer: false, explain: 'False — a chord joins any two points on the circle. Only the <b>diameter</b> passes through the centre.' },
    { type: 'match', level: 3, q: 'Match each part of a circle to its meaning.', pairs: [['Radius', 'Centre to the edge'], ['Diameter', 'Right across, through the centre'], ['Chord', 'Joins two points on the circle'], ['Circumference', 'The distance all around'], ['Arc', 'A part of the circumference']], explain: 'Radius = centre to edge · Diameter = 2 × radius · Chord joins two points · Circumference is the whole way round · Arc is a piece of it.' }
  ]);
})();

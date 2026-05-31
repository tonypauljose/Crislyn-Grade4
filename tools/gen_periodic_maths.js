/* ============================================================
   Periodic Test 1 — Maths (Grade 4) question-bank generator
   Syllabus (from workbook screenshots):
     Ch 1 — Numbers beyond 10,000
     Ch 2 — Addition & Subtraction
   Difficulty: MEDIUM + HARD only.

   Why a generator? 300 hand-typed questions would inevitably carry
   arithmetic slips. Here every answer is computed, so the bank is
   correct by construction. Output -> data/pt-maths1.js as
   window.PT_MATHS1_BANK (the shape js/exam-engine.js consumes).

   Run:  node tools/gen_periodic_maths.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

// ---- Seeded RNG so the generated file is reproducible -------------------
let _seed = 20260531;
function rng() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }
function rint(min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---- Number helpers (Indian system) -------------------------------------
function fmt(num) {                       // 123456 -> "1,23,456"
  const neg = num < 0; num = Math.abs(num);
  let s = String(num);
  if (s.length <= 3) return (neg ? '-' : '') + s;
  let last3 = s.slice(-3), rest = s.slice(0, -3), out = last3;
  while (rest.length > 2) { out = rest.slice(-2) + ',' + out; rest = rest.slice(0, -2); }
  if (rest.length) out = rest + ',' + out;
  return (neg ? '-' : '') + out;
}
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function two(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); }
function three(n) { return n < 100 ? two(n) : ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + two(n % 100) : ''); }
function name(num) {                      // Indian number name, no "and"
  if (num === 0) return 'zero';
  let r = '';
  if (num >= 10000000) { r += two(Math.floor(num / 10000000)) + ' crore '; num %= 10000000; }
  if (num >= 100000) { r += two(Math.floor(num / 100000)) + ' lakh '; num %= 100000; }
  if (num >= 1000) { r += two(Math.floor(num / 1000)) + ' thousand '; num %= 1000; }
  if (num >= 100) { r += ONES[Math.floor(num / 100)] + ' hundred '; num %= 100; }
  if (num > 0) r += two(num);
  return r.trim().replace(/\s+/g, ' ');
}
function expanded(num) {                   // 40089 -> "40,000 + 80 + 9"
  const d = String(num).split('').reverse();
  const pv = [1, 10, 100, 1000, 10000, 100000, 1000000];
  const parts = [];
  for (let i = d.length - 1; i >= 0; i--) { const v = +d[i]; if (v) parts.push(fmt(v * pv[i])); }
  return parts.join(' + ');
}
function toRoman(n) {
  const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let r = ''; for (let i = 0; i < v.length; i++) while (n >= v[i]) { r += s[i]; n -= v[i]; } return r;
}
const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'lakhs', 'ten lakhs'];
function placeValueOf(num, posFromRight) { return (+String(num)[String(num).length - 1 - posFromRight]) * Math.pow(10, posFromRight); }

// ---- Bank assembly ------------------------------------------------------
const BANK = [];
const seen = new Set();
function add(o) {
  // de-dup by question text so reloads of the picker never repeat
  const key = o.q.replace(/\s+/g, ' ').trim();
  if (seen.has(key)) return false;
  seen.add(key); BANK.push(o); return true;
}
// Build an MCQ from a correct value + distractor generator. Guarantees 4
// unique options and records the shuffled index of the correct one.
function mcq(q, correct, distractorFn, explain, topic, diff) {
  const cstr = String(correct);
  const opts = new Set([cstr]);
  let guard = 0;
  while (opts.size < 4 && guard++ < 200) { const d = String(distractorFn()); if (d !== cstr) opts.add(d); }
  while (opts.size < 4) opts.add(cstr + ' ' + opts.size); // last-ditch (never hit in practice)
  const arr = shuffle([...opts]);
  add({ type: 'mcq', q, options: arr, answer: arr.indexOf(cstr), explain, topic, diff });
}
function fill(q, accepted, explain, topic, diff) {
  add({ type: 'fill', q, answer: Array.isArray(accepted) ? accepted : [accepted], explain, topic, diff });
}
function numAccept(n) { return [String(n), fmt(n)]; }       // matcher strips commas anyway
function nearby(n, steps) { return () => { const s = pick(steps); return n + s; }; }

// distinct random number with d digits
function dnum(d) {
  const lo = Math.pow(10, d - 1), hi = Math.pow(10, d) - 1;
  return rint(lo, hi);
}

/* ============================================================
   CHAPTER 1 — NUMBERS BEYOND 10,000
   ============================================================ */

// ---- Place value (6–7 digit) -------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = i < 10 ? dnum(6) : dnum(7);
  const s = String(num);
  let pos = rint(1, s.length - 1), guard = 0;            // skip ones place (trivial) + skip zero digits
  while (+s[s.length - 1 - pos] === 0 && guard++ < 30) pos = rint(1, s.length - 1);
  const digit = +s[s.length - 1 - pos];
  const pv = digit * Math.pow(10, pos);
  // classic distractors: the same digit placed at other place values
  mcq(`What is the <strong>place value</strong> of <strong>${digit}</strong> in ${fmt(num)}?`,
    fmt(pv), () => fmt(digit * Math.pow(10, rint(0, s.length - 1))),
    `${digit} is in the ${PLACE[pos]} place, so its place value is ${digit} × ${fmt(Math.pow(10, pos))} = ${fmt(pv)}.`, 'place-value', 'medium');
}
// Face value
for (let i = 0; i < 8; i++) {
  const num = dnum(rint(6, 7));
  const s = String(num);
  let pos = rint(0, s.length - 1);
  const digit = +s[s.length - 1 - pos];
  fill(`In ${fmt(num)}, what is the <strong>face value</strong> of the digit ${digit}${countDigit(s, digit) > 1 ? ` in the ${PLACE[pos]} place` : ''}?`,
    numAccept(digit), `Face value is just the digit itself → ${digit}.`, 'face-value', 'medium');
}
function countDigit(s, d) { return s.split('').filter(c => +c === d).length; }
// Place vs face combined (hard conceptual)
for (let i = 0; i < 6; i++) {
  const num = dnum(rint(6, 7));
  const s = String(num);
  let pos = rint(1, s.length - 1);
  while (+s[s.length - 1 - pos] === 0) pos = rint(1, s.length - 1);
  const digit = +s[s.length - 1 - pos];
  const pv = digit * Math.pow(10, pos), diff = pv - digit;
  mcq(`In ${fmt(num)}, find <strong>(place value − face value)</strong> of ${digit} in the ${PLACE[pos]} place.`,
    fmt(diff), () => fmt(pick([pv + digit, pv, digit, Math.max(1, pv - digit * 2)])),
    `Place value = ${fmt(pv)}, face value = ${digit}. ${fmt(pv)} − ${digit} = ${fmt(diff)}.`, 'place-value', 'hard');
}

// ---- Number name  ->  figures (FILL, numeric match) --------------------
for (let i = 0; i < 16; i++) {
  const num = i < 8 ? dnum(rint(5, 6)) : dnum(7);
  fill(`Write in figures: <strong>${capitalize(name(num))}</strong>.`,
    numAccept(num), `${name(num)} = ${fmt(num)}.`, 'number-name', i < 8 ? 'medium' : 'hard');
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- Figures -> number name (MCQ, choose words) ------------------------
for (let i = 0; i < 14; i++) {
  const num = i < 7 ? dnum(rint(5, 6)) : dnum(7);
  const correct = capitalize(name(num));
  // distractors: tweak one digit / swap a period
  mcq(`How do you write <strong>${fmt(num)}</strong> in words?`, correct, () => {
    const t = tweak(num);
    return capitalize(name(t));
  }, `${fmt(num)} = ${correct}.`, 'number-name', i < 7 ? 'medium' : 'hard');
}
function tweak(num) {
  const s = String(num).split('');
  const i = rint(0, s.length - 1);
  let d = (+s[i] + rint(1, 8)) % 10;
  s[i] = String(d);
  let t = +s.join('');
  if (t === num || String(t).length !== s.length) t = num + pick([10, 100, 1000, -10, -100, 11000]);
  return Math.max(10000, t);
}

// ---- Standard form (expanded -> number) --------------------------------
for (let i = 0; i < 14; i++) {
  const num = i < 7 ? dnum(rint(5, 6)) : dnum(7);
  const exp = expanded(num);
  if (i % 2 === 0) {
    fill(`Write the <strong>standard form</strong>: ${exp} = ?`, numAccept(num),
      `Add the parts by place value → ${fmt(num)}.`, 'standard-form', i < 7 ? 'medium' : 'hard');
  } else {
    mcq(`Which number is <strong>${exp}</strong>?`, fmt(num), () => fmt(tweak(num)),
      `Adding the parts gives ${fmt(num)}.`, 'standard-form', i < 7 ? 'medium' : 'hard');
  }
}

// ---- Expanded form (number -> expanded) MCQ ----------------------------
for (let i = 0; i < 12; i++) {
  const num = i < 6 ? dnum(rint(5, 6)) : dnum(7);
  const correct = expanded(num);
  mcq(`Which is the <strong>expanded form</strong> of ${fmt(num)}?`, correct, () => {
    const t = Math.max(10000, tweak(num));
    return expanded(t);
  }, `Split each non-zero digit by its place value: ${correct}.`, 'expanded-form', i < 6 ? 'medium' : 'hard');
}

// ---- Compare with <, >, = ----------------------------------------------
for (let i = 0; i < 20; i++) {
  const a = dnum(rint(5, 7));
  const b = (i % 6 === 0) ? a : (rng() < 0.5 ? a + pick([1, 9, 90, 900, 9000]) * pick([1, -1]) : dnum(rint(5, 7)));
  const bb = Math.max(10000, b);
  const sym = a < bb ? '<' : a > bb ? '>' : '=';
  const cOpts = shuffle(['<', '>', '=']);
  add({
    type: 'mcq', q: `Which symbol makes this true?  ${fmt(a)} ___ ${fmt(bb)}`,
    options: cOpts, answer: cOpts.indexOf(sym),
    explain: a === bb ? 'Both numbers are equal, so use =.' : `${fmt(a)} is ${sym === '>' ? 'greater than' : 'less than'} ${fmt(bb)}, so use ${sym}.`,
    topic: 'compare', diff: 'medium'
  });
}

// ---- Ascending / descending ordering -----------------------------------
for (let i = 0; i < 18; i++) {
  const asc = i % 2 === 0;
  const base = dnum(rint(5, 6));
  const nums = uniqList(4, () => base + rint(-4000, 4000) * pick([1, 1, 10]) || dnum(5)).map(n => Math.max(10000, n));
  const u = [...new Set(nums)];
  while (u.length < 4) u.push(dnum(rint(5, 6)));
  const correct = [...u].sort((x, y) => asc ? x - y : y - x).map(fmt).join(', ');
  mcq(`Arrange in <strong>${asc ? 'ascending' : 'descending'}</strong> order: ${u.map(fmt).join(' · ')}`,
    correct, () => shuffle(u).map(fmt).join(', '),
    `${asc ? 'Smallest' : 'Largest'} first: ${correct}.`, 'ordering', 'hard');
}
function uniqList(n, fn) { const a = []; let g = 0; while (a.length < n && g++ < 100) { const v = fn(); if (!a.includes(v)) a.push(v); } return a; }

// ---- Predecessor / successor (incl. tricky 9s rollover) ----------------
const rollover = [100000, 999999, 1000000, 9999999, 700000, 345000, 500000, 290000];
for (let i = 0; i < 16; i++) {
  const num = i < rollover.length ? rollover[i] : dnum(rint(5, 7));
  if (i % 2 === 0) {
    fill(`Write the <strong>successor</strong> of ${fmt(num)}.`, numAccept(num + 1),
      `Successor = number + 1 = ${fmt(num + 1)}.`, 'pred-succ', 'medium');
  } else {
    fill(`Write the <strong>predecessor</strong> of ${fmt(num)}.`, numAccept(num - 1),
      `Predecessor = number − 1 = ${fmt(num - 1)}.`, 'pred-succ', 'medium');
  }
}

// ---- Greatest / smallest from given digits -----------------------------
for (let i = 0; i < 14; i++) {
  const k = i < 7 ? 6 : 7;
  const digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k);
  const greatest = +[...digits].sort((a, b) => b - a).join('');
  const ss = [...digits].sort((a, b) => a - b);
  if (ss[0] === 0) { const idx = ss.findIndex(d => d > 0); [ss[0], ss[idx]] = [ss[idx], ss[0]]; }
  const smallest = +ss.join('');
  const wantGreatest = i % 2 === 0;
  fill(`Form the <strong>${wantGreatest ? 'greatest' : 'smallest'}</strong> ${k}-digit number using the digits ${digits.join(', ')} (use each once).`,
    numAccept(wantGreatest ? greatest : smallest),
    wantGreatest ? `Largest digits first → ${fmt(greatest)}.`
      : `Smallest digits first (a 0 can't lead, so swap it with the next smallest) → ${fmt(smallest)}.`,
    'greatest-smallest', 'hard');
}

// ---- Roman numerals -----------------------------------------------------
const romanVals = [4, 9, 14, 19, 24, 29, 39, 40, 44, 46, 49, 50, 54, 60, 67, 74, 83, 90, 94, 99];
for (let i = 0; i < 10; i++) {
  const n = romanVals[i * 2 % romanVals.length] + (i < 5 ? 0 : rint(0, 3));
  const r = toRoman(n);
  if (i % 2 === 0) {
    mcq(`What is the Roman numeral for <strong>${n}</strong>?`, r, () => toRoman(Math.max(1, n + pick([1, -1, 5, -5, 10, -10]))),
      `${n} = ${r}.`, 'roman', 'medium');
  } else {
    fill(`Write ${n} as a Roman numeral.`, [r], `${n} = ${r}.`, 'roman', 'medium');
  }
}
const romanStrs = [['XLIV', 44], ['XCIX', 99], ['XLII', 42], ['LXXVIII', 78], ['XXIX', 29], ['XCIV', 94], ['LXVI', 66], ['XLVII', 47], ['LXXXIV', 84], ['XXXVII', 37]];
for (let i = 0; i < 10; i++) {
  const [r, n] = romanStrs[i];
  if (i % 2 === 0) {
    mcq(`What is <strong>${r}</strong> in Hindu-Arabic numerals?`, n, () => Math.max(1, n + pick([1, -1, 5, -5, 9, 10])),
      `${r} = ${n}.`, 'roman', 'hard');
  } else {
    fill(`Convert ${r} to Hindu-Arabic numerals.`, numAccept(n), `${r} = ${n}.`, 'roman', 'hard');
  }
}
// Roman concept questions (from worksheet: meaningless numeral, smallest two-digit, days)
add({ type: 'mcq', q: 'Which of these is <strong>meaningless</strong> in Roman numerals?', options: ['XIX', 'VX', 'XXX', 'XL'], answer: 1, explain: 'A smaller symbol (V) cannot be placed before a larger one (X) like that — VX is invalid.', topic: 'roman', diff: 'hard' });
add({ type: 'mcq', q: 'How many days are there in the month of December, in Roman numerals?', options: ['XXVIII', 'XXX', 'XXXI', 'XXIX'], answer: 2, explain: 'December has 31 days, and 31 = XXXI.', topic: 'roman', diff: 'medium' });

/* ============================================================
   CHAPTER 2 — ADDITION & SUBTRACTION
   ============================================================ */

// ---- Addition: two 5–6 digit addends (with carries) --------------------
for (let i = 0; i < 22; i++) {
  const a = i < 11 ? dnum(5) : dnum(6);
  const b = i < 11 ? dnum(5) : dnum(6);
  const sum = a + b;
  mcq(`<strong>${fmt(a)} + ${fmt(b)}</strong> = ?`, fmt(sum),
    () => fmt(sum + pick([10, -10, 100, -100, 1000, -1000, 9, -9, 1, -1])),
    `Add column by column, carrying over: ${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`, 'addition', i < 8 ? 'medium' : 'hard');
}
// ---- Addition: three addends (hard) ------------------------------------
for (let i = 0; i < 8; i++) {
  const a = dnum(rint(5, 6)), b = dnum(rint(5, 6)), c = dnum(rint(5, 6));
  const sum = a + b + c;
  mcq(`<strong>${fmt(a)} + ${fmt(b)} + ${fmt(c)}</strong> = ?`, fmt(sum),
    () => fmt(sum + pick([100, -100, 1000, -1000, 10, -10, 1, -1])),
    `Add all three: ${fmt(a)} + ${fmt(b)} + ${fmt(c)} = ${fmt(sum)}.`, 'addition', 'hard');
}

// ---- Subtraction: 6-digit minus 5–6 digit (borrowing) ------------------
for (let i = 0; i < 22; i++) {
  const a = dnum(6);
  const b = i < 11 ? rint(10000, a - 1) : rint(100000, a - 1);
  const diff = a - b;
  mcq(`<strong>${fmt(a)} − ${fmt(b)}</strong> = ?`, fmt(diff),
    () => fmt(Math.max(0, diff + pick([10, -10, 100, -100, 1000, -1000, 9, -9, 1, -1]))),
    `Subtract column by column, borrowing where needed: ${fmt(a)} − ${fmt(b)} = ${fmt(diff)}.`, 'subtraction', i < 8 ? 'medium' : 'hard');
}
// ---- Subtraction across zeros (the hard workbook case) -----------------
const zeroMinuends = [800000, 600000, 700000, 500000, 900000, 400000, 1000000, 300000];
for (let i = 0; i < 8; i++) {
  const a = zeroMinuends[i];
  const b = rint(Math.floor(a / 2), a - 11);
  const diff = a - b;
  mcq(`<strong>${fmt(a)} − ${fmt(b)}</strong> = ?`, fmt(diff),
    () => fmt(Math.max(0, diff + pick([1, -1, 10, -10, 100, -100, 1000]))),
    `Borrowing across the zeros: ${fmt(a)} − ${fmt(b)} = ${fmt(diff)}.`, 'subtraction', 'hard');
}

// ---- Properties of addition --------------------------------------------
for (let i = 0; i < 6; i++) {
  const a = dnum(rint(4, 5));
  fill(`Fill in the blank: ${fmt(a)} + 0 = ____`, numAccept(a),
    `Adding 0 changes nothing (identity property) → ${fmt(a)}.`, 'add-property', 'medium');
}
for (let i = 0; i < 6; i++) {
  const a = dnum(5), b = dnum(5);
  fill(`Fill in the blank: ${fmt(a)} + ${fmt(b)} = ${fmt(b)} + ____`, numAccept(a),
    `Order doesn't change the sum (commutative property) → ${fmt(a)}.`, 'add-property', 'medium');
}
add({ type: 'mcq', q: 'Which property says <strong>(47,006 + 6,12,340) + 38,722 = 47,006 + (6,12,340 + 38,722)</strong>?', options: ['Order (commutative) property', 'Grouping (associative) property', 'Identity property', 'Borrowing property'], answer: 1, explain: 'Re-grouping the brackets without changing the order is the associative (grouping) property.', topic: 'add-property', diff: 'hard' });
add({ type: 'mcq', q: 'The answer we get on <strong>adding</strong> numbers is called the:', options: ['Difference', 'Sum', 'Product', 'Minuend'], answer: 1, explain: 'Addition gives a sum.', topic: 'add-property', diff: 'medium' });

// ---- Properties of subtraction -----------------------------------------
for (let i = 0; i < 4; i++) {
  const a = dnum(rint(5, 6));
  fill(`Fill in the blank: ${fmt(a)} − 0 = ____`, numAccept(a),
    `Subtracting 0 changes nothing → ${fmt(a)}.`, 'sub-property', 'medium');
}
for (let i = 0; i < 4; i++) {
  const a = dnum(rint(5, 6));
  fill(`Fill in the blank: ${fmt(a)} − ${fmt(a)} = ____`, numAccept(0),
    `Any number minus itself is 0.`, 'sub-property', 'medium');
}
const subBlanks = [[5, 100], [5, 1000], [6, 10], [6, 100]];
for (let i = 0; i < 4; i++) {
  const a = dnum(subBlanks[i][0]); const k = subBlanks[i][1];
  fill(`Fill in the blank: ${fmt(a)} − ${fmt(k)} = ${fmt(a - k)}.  The missing number subtracted is ____`, numAccept(k),
    `Since ${fmt(a)} − ${fmt(a - k)} = ${fmt(k)}, the number subtracted is ${fmt(k)}.`, 'sub-property', 'hard');
}
add({ type: 'mcq', q: 'In a subtraction, the number <strong>from which</strong> another number is subtracted is called the:', options: ['Subtrahend', 'Minuend', 'Difference', 'Sum'], answer: 1, explain: 'Minuend − subtrahend = difference. The minuend is the number you subtract from.', topic: 'sub-property', diff: 'medium' });
add({ type: 'mcq', q: 'In <strong>65,229 − 15,836 = 49,393</strong>, the number 15,836 is called the:', options: ['Minuend', 'Subtrahend', 'Difference', 'Sum'], answer: 1, explain: 'The number being subtracted is the subtrahend.', topic: 'sub-property', diff: 'medium' });

// ---- Check by addition (difference + subtrahend = minuend) -------------
for (let i = 0; i < 6; i++) {
  const a = dnum(rint(5, 6)); const b = rint(1000, a - 1); const d = a - b;
  add({ type: 'mcq', q: `To check ${fmt(a)} − ${fmt(b)} = ${fmt(d)}, we add ${fmt(d)} + ${fmt(b)}. The answer should be:`, options: [fmt(a), fmt(a + 1), fmt(a - 1), fmt(d)], answer: 0, explain: `Difference + subtrahend = minuend. ${fmt(d)} + ${fmt(b)} = ${fmt(a)}.`, topic: 'check-addition', diff: 'hard' });
}

// ---- Missing-number sentences ------------------------------------------
for (let i = 0; i < 6; i++) {
  const a = dnum(rint(4, 5)), b = dnum(rint(4, 5)); const s = a + b;
  fill(`Find the missing number: ${fmt(a)} + ____ = ${fmt(s)}`, numAccept(b),
    `${fmt(s)} − ${fmt(a)} = ${fmt(b)}.`, 'missing-number', 'medium');
}
for (let i = 0; i < 6; i++) {
  const a = dnum(rint(5, 6)); const b = rint(1000, a - 1); const d = a - b;
  fill(`Find the missing number: ____ − ${fmt(b)} = ${fmt(d)}`, numAccept(a),
    `${fmt(d)} + ${fmt(b)} = ${fmt(a)}.`, 'missing-number', 'hard');
}

// ---- Mixed add & subtract chains ---------------------------------------
for (let i = 0; i < 10; i++) {
  const a = dnum(rint(5, 6)), b = dnum(rint(4, 5)), c = dnum(rint(4, 5));
  const plusFirst = i % 2 === 0;
  let res, q;
  if (plusFirst) { res = a + b - c; q = `${fmt(a)} + ${fmt(b)} − ${fmt(c)}`; }
  else { res = a - b + c; if (a < b) { const t = a; /* ensure positive */ } res = a - b + c; q = `${fmt(a)} − ${fmt(b)} + ${fmt(c)}`; }
  if (res < 0) continue;
  mcq(`Solve: <strong>${q}</strong> = ?`, fmt(res), () => fmt(Math.max(0, res + pick([10, -10, 100, -100, 1000, -1000, 1, -1]))),
    `Work left to right: ${q} = ${fmt(res)}.`, 'mixed', 'hard');
}

// ---- Word problems ------------------------------------------------------
const WP = [];
function wp(q, answer, explain, diff) { WP.push({ q, answer, explain, diff }); }
{
  const m = rint(15000, 30000), p = rint(15000, 30000), m2 = rint(8000, 15000);
  wp(`A farmer planted ${fmt(m)} mango trees and ${fmt(p)} papaya trees in 2013. In 2014 he planted ${fmt(m2)} more mango trees. How many trees did he plant <strong>altogether</strong>?`,
    m + p + m2, `${fmt(m)} + ${fmt(p)} + ${fmt(m2)} = ${fmt(m + p + m2)}.`, 'hard');
}
{
  const a = rint(200000, 400000), b = rint(50000, 99000);
  wp(`${fmt(a)} people live in Indore and ${fmt(b)} live in Gwalior. How many <strong>more</strong> people live in Indore?`,
    a - b, `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`, 'hard');
}
{
  const a = rint(12000, 18000), b = rint(16000, 22000);
  wp(`A seller sold ${fmt(a)} fruits in 2017 and ${fmt(b)} fruits in 2018. How many <strong>more</strong> fruits did he sell in 2018?`,
    b - a, `${fmt(b)} − ${fmt(a)} = ${fmt(b - a)}.`, 'medium');
}
{
  const lib = rint(60000, 80000), iss = rint(8000, 15000);
  wp(`A library has ${fmt(lib)} books. During the month ${fmt(iss)} books were issued. How many books <strong>remained</strong>?`,
    lib - iss, `${fmt(lib)} − ${fmt(iss)} = ${fmt(lib - iss)}.`, 'medium');
}
{
  const sum = rint(70000, 90000), one = rint(30000, 45000);
  wp(`The sum of two numbers is ${fmt(sum)}. If one of them is ${fmt(one)}, find the <strong>other</strong> number.`,
    sum - one, `${fmt(sum)} − ${fmt(one)} = ${fmt(sum - one)}.`, 'medium');
}
{
  const target = 9999, have = rint(4000, 6000);
  wp(`What should be added to ${fmt(have)} to make it 9,999?`, target - have,
    `9,999 − ${fmt(have)} = ${fmt(target - have)}.`, 'medium');
}
{
  const a = rint(120000, 250000), b = rint(80000, 119000), c = rint(40000, 79000);
  wp(`A factory made ${fmt(a)} pens in April, ${fmt(b)} in May and ${fmt(c)} in June. How many pens in all <strong>three</strong> months?`,
    a + b + c, `${fmt(a)} + ${fmt(b)} + ${fmt(c)} = ${fmt(a + b + c)}.`, 'hard');
}
{
  const total = rint(500000, 800000), spent = rint(200000, 450000);
  wp(`A school collected ₹${fmt(total)} and spent ₹${fmt(spent)} on books. How much money is <strong>left</strong>?`,
    total - spent, `${fmt(total)} − ${fmt(spent)} = ${fmt(total - spent)}.`, 'medium');
}
{
  const a = rint(300000, 500000), more = rint(50000, 150000);
  wp(`A city had ${fmt(a)} voters. After new registrations there were ${fmt(more)} more. How many voters are there <strong>now</strong>?`,
    a + more, `${fmt(a)} + ${fmt(more)} = ${fmt(a + more)}.`, 'medium');
}
{
  const big = rint(700000, 950000), small = rint(100000, 300000);
  wp(`Two numbers are ${fmt(big)} and ${fmt(small)}. What is the <strong>difference</strong> between them?`,
    big - small, `${fmt(big)} − ${fmt(small)} = ${fmt(big - small)}.`, 'medium');
}
// turn word problems into a mix of mcq + fill
WP.forEach((p, i) => {
  if (i % 2 === 0) {
    mcq(p.q, fmt(p.answer), () => fmt(Math.max(0, p.answer + pick([100, -100, 1000, -1000, 10, -10, 1, -1]))),
      p.explain, 'word-problem', p.diff);
  } else {
    fill(p.q, numAccept(p.answer), p.explain, 'word-problem', p.diff);
  }
});

/* ============================================================
   WRITE OUT
   ============================================================ */
// sanity: every mcq must have exactly its correct answer present once
let bad = 0;
for (const q of BANK) {
  if (q.type === 'mcq') {
    if (!Array.isArray(q.options) || q.options.length < 3) { bad++; console.error('BAD options', q.q); }
    if (q.answer < 0 || q.answer >= q.options.length) { bad++; console.error('BAD answer idx', q.q); }
    const set = new Set(q.options);
    if (set.size !== q.options.length) { bad++; console.error('DUP options', q.q, q.options); }
  } else if (q.type === 'fill') {
    if (!q.answer || !q.answer.length) { bad++; console.error('BAD fill', q.q); }
  }
}

const byTopic = {};
for (const q of BANK) byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;

const header = `/* ============================================================
   Crislyn's World — PERIODIC TEST 1 (Maths, Grade 4)
   Syllabus: Ch 1 Numbers beyond 10,000  +  Ch 2 Addition & Subtraction
   Difficulty: MEDIUM + HARD.  ${BANK.length} questions.

   AUTO-GENERATED by tools/gen_periodic_maths.js — do not hand-edit.
   Re-run that script to regenerate. Consumed by js/exam-engine.js
   and the printable paper / hub as window.PT_MATHS1_BANK.
   ============================================================ */

window.PT_MATHS1_BANK = ${JSON.stringify(BANK, null, 2)};
`;

const outPath = path.join(__dirname, '..', 'data', 'pt-maths1.js');
fs.writeFileSync(outPath, header, 'utf8');

console.log(`Wrote ${BANK.length} questions -> ${outPath}`);
console.log(`Validation errors: ${bad}`);
console.log('By topic:', byTopic);

/* ============================================================
   Crislyn's World — Maths Chapter 1: Numbers (Grade 4)
   Place value up to lakhs, expanded form, number names,
   comparing, predecessor/successor, rounding, Roman numerals.
   ============================================================ */

window.CH01_BANK = [
  // ---------- Place value ----------
  { type: 'mcq', q: 'In the number <strong>4,567</strong>, which digit is in the hundreds place?', options: ['4', '5', '6', '7'], answer: 1, explain: '5 sits in the hundreds place.' },
  { type: 'mcq', q: 'What is the place value of <strong>7</strong> in 7,284?', options: ['7', '70', '700', '7,000'], answer: 3, explain: '7 is in the thousands place, so its value is 7,000.' },
  { type: 'mcq', q: 'In <strong>3,056</strong>, which digit is in the ones place?', options: ['3', '0', '5', '6'], answer: 3, explain: '6 is the last digit on the right — the ones place.' },
  { type: 'mcq', q: 'Which digit is in the tens place in <strong>8,129</strong>?', options: ['8', '1', '2', '9'], answer: 2, explain: '2 is in the tens place.' },
  { type: 'mcq', q: 'What is the place value of <strong>0</strong> in 4,083?', options: ['0', '8', '80', '800'], answer: 0, explain: 'Zero anywhere always has a value of 0, but it holds the place — here, the hundreds place.' },
  { type: 'mcq', q: 'In <strong>5,32,178</strong>, which digit is in the lakhs place?', options: ['5', '3', '2', '1'], answer: 0, explain: 'The leftmost digit of a 6-digit number is in the lakhs place — that\'s 5.' },
  { type: 'mcq', q: 'In <strong>78,90,123</strong>, what place is the leftmost 7 in?', options: ['Lakhs', 'Ten Thousands', 'Ten Lakhs', 'Thousands'], answer: 2, explain: 'A 7-digit number begins at the ten lakhs place.' },
  { type: 'mcq', q: 'Place value of 4 in <strong>4,32,567</strong>?', options: ['4', '40,000', '4,00,000', '4,000'], answer: 2, explain: '4 is in the lakhs place → 4,00,000.' },

  // ---------- Expanded form ----------
  { type: 'mcq', q: 'Which is the expanded form of <strong>3,405</strong>?', options: ['3,000 + 400 + 5', '3,000 + 40 + 5', '300 + 400 + 5', '3,000 + 400 + 50'], answer: 0, explain: 'There are no tens (0 in the tens place), so skip them: 3,000 + 400 + 5.' },
  { type: 'mcq', q: 'What number is <strong>5,000 + 200 + 30 + 4</strong>?', options: ['5,234', '5,243', '5,324', '5,432'], answer: 0, explain: 'Add them up place by place: 5,234.' },
  { type: 'fill', q: 'Expanded form of <strong>3,728</strong>. (Write like 3000 + 700 + 20 + 8)', answer: ['3000 + 700 + 20 + 8', '3,000 + 700 + 20 + 8'], explain: 'Just split each digit by its place value.' },
  { type: 'fill', q: 'Expanded form of <strong>9,050</strong>.', answer: ['9000 + 50', '9,000 + 50'], explain: 'Skip the zero hundreds and zero ones.' },
  { type: 'fill', q: 'What number is 50,000 + 6,000 + 700 + 20 + 1?', answer: ['56721', '56,721'], explain: 'Add them up — fifty-six thousand seven hundred twenty-one.' },

  // ---------- Number names ----------
  { type: 'mcq', q: 'How do you write <strong>6,209</strong> in words?', options: ['Six thousand two hundred nine', 'Six thousand two hundred ninety', 'Six hundred two thousand nine', 'Sixty-two hundred nine'], answer: 0, explain: '6 thousand 2 hundred 0 tens 9 ones → Six thousand two hundred nine.' },
  { type: 'mcq', q: 'Which number is <strong>"Four thousand six hundred"</strong>?', options: ['4,060', '4,006', '4,600', '46,000'], answer: 2, explain: '4 thousand 6 hundred = 4,600.' },
  { type: 'fill', q: 'Write <strong>"three thousand four hundred eight"</strong> in numerals.', answer: ['3408', '3,408'], explain: '3 thousand 4 hundred 0 tens 8 ones.' },
  { type: 'fill', q: 'Write <strong>"five thousand five"</strong> in numerals.', answer: ['5005', '5,005'], explain: '5 thousand + 0 + 0 + 5.' },

  // ---------- Comparing & ordering ----------
  { type: 'mcq', q: 'Which number is the <strong>greatest</strong>?', options: ['4,567', '4,765', '4,657', '4,756'], answer: 1, explain: 'Compare hundreds: 4,765 has 7 hundreds — biggest.' },
  { type: 'mcq', q: 'Which number is the <strong>smallest</strong>?', options: ['2,345', '2,435', '2,354', '2,453'], answer: 0, explain: '2,345 has the smallest hundreds digit.' },
  { type: 'mcq', q: 'Which symbol makes this true?  6,432 ___ 6,342', options: ['<', '>', '=', 'None'], answer: 1, explain: 'Hundreds: 4 > 3, so 6,432 > 6,342.' },
  { type: 'mcq', q: 'Arrange in ascending order: 5,432 · 4,532 · 5,234 · 4,235', options: ['4,235, 4,532, 5,234, 5,432', '4,532, 4,235, 5,234, 5,432', '5,432, 5,234, 4,532, 4,235', '4,235, 5,234, 4,532, 5,432'], answer: 0, explain: 'Smallest first: 4,235 < 4,532 < 5,234 < 5,432.' },

  // ---------- Predecessor / successor ----------
  { type: 'mcq', q: 'What is the <strong>successor</strong> of 3,999?', options: ['3,998', '4,000', '3,900', '4,099'], answer: 1, explain: 'Successor means +1: 3,999 + 1 = 4,000.' },
  { type: 'mcq', q: 'What is the <strong>predecessor</strong> of 5,000?', options: ['4,999', '5,001', '4,900', '4,099'], answer: 0, explain: 'Predecessor means −1: 5,000 − 1 = 4,999.' },
  { type: 'fill', q: 'The successor of 7,349 is ____ ?', answer: ['7350', '7,350'], explain: '7,349 + 1 = 7,350.' },
  { type: 'fill', q: 'The predecessor of 1,00,000 is ____ ?', answer: ['99999', '99,999'], explain: '1,00,000 − 1 = 99,999.' },

  // ---------- Rounding ----------
  { type: 'mcq', q: 'Round <strong>3,467</strong> to the nearest 10.', options: ['3,460', '3,470', '3,500', '3,400'], answer: 1, explain: 'Ones digit 7 ≥ 5, so round up to 3,470.' },
  { type: 'mcq', q: 'Round <strong>5,231</strong> to the nearest 100.', options: ['5,200', '5,300', '5,000', '5,230'], answer: 0, explain: 'Tens digit 3 < 5, so round down to 5,200.' },
  { type: 'mcq', q: 'Round <strong>4,650</strong> to the nearest 1,000.', options: ['4,000', '5,000', '4,500', '5,500'], answer: 1, explain: 'Hundreds digit 6 ≥ 5, so round up to 5,000.' },
  { type: 'fill', q: 'Round 6,439 to the nearest 100.', answer: ['6400', '6,400'], explain: 'Tens digit 3 < 5, round down.' },

  // ---------- Roman numerals ----------
  { type: 'mcq', q: 'What is the Roman numeral for <strong>9</strong>?', options: ['VIIII', 'IX', 'XI', 'VIII'], answer: 1, explain: '9 is written as IX — one less than ten.' },
  { type: 'mcq', q: 'What is <strong>XL</strong> in Hindu-Arabic?', options: ['40', '60', '15', '90'], answer: 0, explain: 'X=10, L=50. X before L means 50 − 10 = 40.' },
  { type: 'mcq', q: 'What is the Roman numeral for <strong>14</strong>?', options: ['XIV', 'VIX', 'XIIII', 'IXV'], answer: 0, explain: 'X (10) + IV (4) = XIV.' },
  { type: 'mcq', q: 'What is <strong>LXX</strong> in Hindu-Arabic?', options: ['50', '60', '70', '90'], answer: 2, explain: 'L (50) + X (10) + X (10) = 70.' },
  { type: 'fill', q: 'Write 19 as a Roman numeral.', answer: ['XIX'], explain: 'X + IX = 19.' },
  { type: 'fill', q: 'Convert XXVII to Hindu-Arabic.', answer: ['27'], explain: '10 + 10 + 5 + 1 + 1 = 27.' },

  // ---------- True / False ----------
  { type: 'tf', q: '99,999 is the largest 5-digit number.', answer: 0, explain: 'True — add 1 and you get 1,00,000 which is a 6-digit number.' },
  { type: 'tf', q: '1,000 is the smallest 4-digit number.', answer: 0, explain: 'True — 999 is still 3 digits.' },
  { type: 'tf', q: 'The Roman numeral for 4 is IIII.', answer: 1, explain: 'False — 4 is IV (one less than five).' },
  { type: 'tf', q: 'The successor of any number is that number plus 1.', answer: 0, explain: 'True — successor always means +1.' },
  { type: 'tf', q: 'Zero has no place value — it just holds a spot.', answer: 0, explain: 'True — zero keeps the place but its value is always 0.' },
  { type: 'tf', q: 'Rounding 4,500 to the nearest 1,000 gives 4,000.', answer: 1, explain: 'False — with 5 or more, we round up, so 4,500 rounds to 5,000.' },
  { type: 'tf', q: 'L stands for 100 in Roman numerals.', answer: 1, explain: 'False — L is 50. C is 100.' },
  { type: 'tf', q: 'In the Indian system, 1,00,000 is called one lakh.', answer: 0, explain: 'True — six zeros after a 1 with the lakh comma is one lakh.' },

  // ---------- Greatest / smallest from digits ----------
  { type: 'mcq', q: 'Use digits 3, 7, 1, 9 once each. What is the <strong>greatest</strong> 4-digit number?', options: ['9,731', '9,713', '7,931', '9,317'], answer: 0, explain: 'Arrange digits from biggest to smallest: 9, 7, 3, 1 → 9,731.' },
  { type: 'mcq', q: 'Use digits 0, 5, 2, 8 once each. What is the <strong>smallest</strong> 4-digit number?', options: ['0,258', '2,058', '2,085', '2,580'], answer: 1, explain: 'Smallest: ascending = 0,2,5,8 — but we can\'t start with 0, so swap → 2,058.' },
  { type: 'mcq', q: 'How many tens are there in <strong>1,250</strong>?', options: ['25', '125', '12', '250'], answer: 1, explain: '1,250 ÷ 10 = 125 tens.' },
  { type: 'mcq', q: 'What is 100 more than 6,850?', options: ['6,860', '7,000', '6,950', '7,850'], answer: 2, explain: '6,850 + 100 = 6,950.' }
];

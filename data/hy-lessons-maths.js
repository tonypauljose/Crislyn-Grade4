/* ==========================================================================
   HALF-YEARLY 2026 — MATHS LESSONS
   --------------------------------------------------------------------------
   One lesson per Maths skill. The method wording follows her class notebook so
   that what she is taught here matches what her teacher marks.
   Every worked example is arithmetic that has been checked.
   ========================================================================== */

(function () {
  'use strict';
  const L = (id, lesson) => window.HY_LESSONS.add(id, lesson);

  /* ============================================================== NUMBERS */

  L('M1', {
    goal: 'Hear a number in words and write it in figures, with the commas in the right places.',
    cards: [
      { t: 'Numbers come in periods', h:
        `<p>In the Indian system the digits are grouped into <b>periods</b>, and every
         period has its own name.</p>
         <div class="hy-pv">
           <span>L</span><span>TTh</span><span>Th</span><span>H</span><span>T</span><span>O</span>
           <i>Lakhs</i><i>Ten thousands</i><i>Thousands</i><i>Hundreds</i><i>Tens</i><i>Ones</i>
         </div>
         <p>When you hear a number name, you are being told what to put in each box.</p>` },
      { t: 'The method', h:
        `<ol class="hy-l-steps">
           <li>Draw the boxes first — <b>L · TTh · Th · H · T · O</b>.</li>
           <li>Fill in each part you hear.</li>
           <li>Any box you did <b>not</b> hear about gets a <b>0</b>. Never leave a gap.</li>
           <li>Put the commas in: the first after <b>3</b> digits from the right, then every <b>2</b>.</li>
         </ol>` },
      { t: 'Where the commas go', h:
        `<p class="hy-eg">5 21 885 → 5,21,885<br>9 42 003 → 9,42,003</p>
         <p>Count from the <b>right</b>, never from the left. Three digits, comma, then two, comma.</p>` }
    ],
    worked: {
      q: 'Write in figures: <b>Five lakh twenty-one thousand eight hundred eighty-five</b>',
      steps: [
        { t: 'Draw the six boxes', h: '<p class="hy-eg">L &nbsp; TTh &nbsp; Th &nbsp; H &nbsp; T &nbsp; O<br>__ &nbsp;&nbsp; __ &nbsp;&nbsp; __ &nbsp; __ &nbsp; __ &nbsp; __</p>' },
        { t: '"Five lakh" → the lakhs box', h: '<p class="hy-eg">5 &nbsp;&nbsp; __ &nbsp;&nbsp; __ &nbsp; __ &nbsp; __ &nbsp; __</p>' },
        { t: '"twenty-one thousand" → 21 in the two thousands boxes', h: '<p class="hy-eg">5 &nbsp;&nbsp; 2 &nbsp;&nbsp; 1 &nbsp; __ &nbsp; __ &nbsp; __</p>' },
        { t: '"eight hundred eighty-five" → 885', h: '<p class="hy-eg">5 &nbsp;&nbsp; 2 &nbsp;&nbsp; 1 &nbsp; 8 &nbsp; 8 &nbsp; 5</p>' },
        { t: 'Now the commas — 3 from the right, then 2', h: '<p class="hy-eg">521885 → <b>5,21,885</b></p>' }
      ],
      ans: '5,21,885'
    },
    recall: 'A period you did not hear is a zero, not a gap.'
  });

  L('M2', {
    goal: 'Read a number in figures and write its name correctly — spelling included.',
    cards: [
      { t: 'Read it in periods, not digit by digit', h:
        `<p>Split at the commas and say each piece with its period name.</p>
         <p class="hy-eg">9,42,003<br>9 → <b>nine lakh</b><br>42 → <b>forty-two thousand</b><br>003 → <b>three</b></p>` },
      { t: 'Zeros are silent — but only sometimes', h:
        `<p>A period made only of zeros is not read at all. A zero <i>inside</i> a period
         still changes what you say.</p>
         <p class="hy-eg">003 = <b>three</b> &nbsp;&nbsp; 030 = <b>thirty</b> &nbsp;&nbsp; 300 = <b>three hundred</b></p>` },
      { t: 'Spellings that lose marks', h:
        `<p><b>forty</b> — not "fourty"<br>
            <b>ninety</b> — not "ninty"<br>
            <b>seventy</b> · <b>eighty</b> · <b>fifty</b></p>
         <p>Hyphens go in the twenties to the nineties: twenty-<b>one</b>, forty-<b>two</b>.</p>` }
    ],
    worked: {
      q: 'Write the number name: <b>9,42,003</b>',
      steps: [
        { t: 'Split at the commas', h: '<p class="hy-eg">9 | 42 | 003</p>' },
        { t: 'First piece', h: '<p>9 sits in the lakhs period → <b>Nine lakh</b></p>' },
        { t: 'Second piece', h: '<p>42 sits in the thousands period → <b>forty-two thousand</b></p>' },
        { t: 'Last piece — careful here', h: '<p>003 is <b>three</b>. There is nothing in the hundreds place, so you do not say "hundred" at all.</p>' },
        { t: 'Join them up', h: '<p class="hy-eg">Nine lakh forty-two thousand three</p>' }
      ],
      ans: 'Nine lakh forty-two thousand three'
    },
    recall: 'Say the periods, then check every forty and every ninety.'
  });

  L('M3', {
    goal: 'Tell the place value and the face value of a digit apart.',
    cards: [
      { t: 'Two different questions', h:
        `<div class="hy-vs">
           <div><b>Face value</b><p>The digit as it is written. It never changes, wherever it sits.</p></div>
           <div><b>Place value</b><p>The digit × what its place is worth. It changes with the place.</p></div>
         </div>` },
      { t: 'What each place is worth', h:
        `<p class="hy-eg">O = 1 &nbsp;·&nbsp; T = 10 &nbsp;·&nbsp; H = 100<br>
         Th = 1,000 &nbsp;·&nbsp; TTh = 10,000 &nbsp;·&nbsp; L = 1,00,000</p>
         <p>So the same digit 5 can be worth 5, or 50, or 50,000 — it depends entirely on where it is standing.</p>` }
    ],
    worked: {
      q: 'In <b>4,58,201</b>, give the place value and the face value of <b>5</b>.',
      steps: [
        { t: 'Label the places from the right', h: '<p class="hy-eg">4&nbsp;&nbsp;5&nbsp;&nbsp;8&nbsp;&nbsp;2&nbsp;&nbsp;0&nbsp;&nbsp;1<br>L&nbsp;TTh&nbsp;&nbsp;Th&nbsp;&nbsp;H&nbsp;&nbsp;T&nbsp;&nbsp;O</p>' },
        { t: 'Face value first — the easy one', h: '<p>The digit is written as 5, so the face value is <b>5</b>.</p>' },
        { t: 'Now find its place', h: '<p>5 is sitting in the <b>ten thousands</b> place, which is worth 10,000.</p>' },
        { t: 'Multiply', h: '<p class="hy-eg">5 × 10,000 = <b>50,000</b></p>' }
      ],
      ans: 'Face value 5 · Place value 50,000'
    },
    recall: 'Face value is what you see. Place value is what it is worth.'
  });

  L('M4', {
    goal: 'Break a number into expanded form and put it back into standard form.',
    cards: [
      { t: 'Expanded form', h:
        `<p>Write what each digit is worth, joined with <b>+</b>.</p>
         <p class="hy-eg">6,03,542<br>= 6,00,000 + 0 + 3,000 + 500 + 40 + 2</p>
         <p>A zero digit is worth <b>0</b> — write it in, do not skip it.</p>` },
      { t: 'Standard form', h:
        `<p>The same thing backwards: add the parts up and write one number.</p>
         <p class="hy-eg">50,000 + 4,000 + 0 + 60 + 7 = <b>54,067</b></p>
         <p>Line the parts up by size and the digits drop into place.</p>` }
    ],
    worked: {
      q: 'Write <b>6,03,542</b> in expanded form.',
      steps: [
        { t: 'Label the places', h: '<p class="hy-eg">6&nbsp;&nbsp;0&nbsp;&nbsp;3&nbsp;&nbsp;5&nbsp;&nbsp;4&nbsp;&nbsp;2<br>L&nbsp;TTh&nbsp;&nbsp;Th&nbsp;&nbsp;H&nbsp;&nbsp;T&nbsp;&nbsp;O</p>' },
        { t: 'Take each digit with its place', h: '<p>6 lakhs → 6,00,000<br>0 ten thousands → 0<br>3 thousands → 3,000</p>' },
        { t: 'Carry on to the end', h: '<p>5 hundreds → 500<br>4 tens → 40<br>2 ones → 2</p>' },
        { t: 'Join them with plus signs', h: '<p class="hy-eg">6,00,000 + 0 + 3,000 + 500 + 40 + 2</p>' }
      ],
      ans: '6,00,000 + 0 + 3,000 + 500 + 40 + 2'
    },
    recall: 'Expanded form has one part for every digit — zeros included.'
  });

  L('M5', {
    goal: 'Compare two numbers and put a list in ascending or descending order.',
    cards: [
      { t: 'Rule 1 — count the digits', h:
        `<p>More digits always means a bigger number.</p>
         <p class="hy-eg">1,00,000 &gt; 99,999 — six digits beats five, every time.</p>` },
      { t: 'Rule 2 — same digits? walk from the left', h:
        `<p>Compare the first digits. Equal? Step one place to the right. Keep going
         until they differ — the first difference decides it.</p>
         <p class="hy-eg">2,45,6<b>2</b>1 &nbsp; vs &nbsp; 2,45,6<b>1</b>2<br>
         2=2 · 4=4 · 5=5 · 6=6 · then <b>2 &gt; 1</b><br>
         → 2,45,621 is bigger</p>` },
      { t: 'Which way round?', h:
        `<div class="hy-vs">
           <div><b>Ascending ⬆</b><p>Smallest first. Climbing up.</p></div>
           <div><b>Descending ⬇</b><p>Biggest first. Coming down.</p></div>
         </div>
         <p>Read that word twice before you start writing.</p>` }
    ],
    worked: {
      q: 'Arrange in <b>descending</b> order: 2,45,612 · 2,54,612 · 2,45,621',
      steps: [
        { t: 'All three have six digits', h: '<p>So counting digits does not help. Walk from the left.</p>' },
        { t: 'The second digit settles one of them', h: '<p>2,<b>5</b>4,612 has 5 where the others have 4 → it is the biggest of the three.</p>' },
        { t: 'Now the other two', h: '<p>2,45,6<b>2</b>1 and 2,45,6<b>1</b>2 agree until the tens: <b>2 &gt; 1</b>, so 2,45,621 is bigger.</p>' },
        { t: 'Descending means biggest first', h: '<p class="hy-eg">2,54,612 &nbsp;&gt;&nbsp; 2,45,621 &nbsp;&gt;&nbsp; 2,45,612</p>' }
      ],
      ans: '2,54,612 · 2,45,621 · 2,45,612'
    },
    recall: 'When everything matches, keep going right — the last digits decide it.'
  });

  L('M6', {
    goal: 'Find the number just before and just after any number, even across nines.',
    cards: [
      { t: 'The two words', h:
        `<div class="hy-vs">
           <div><b>Successor</b><p>Comes just <b>after</b> → add 1.</p></div>
           <div><b>Predecessor</b><p>Comes just <b>before</b> → subtract 1.</p></div>
         </div>` },
      { t: 'The nines', h:
        `<p>When a number ends in 9s, adding 1 turns them all into zeros and pushes one
         up into the next place.</p>
         <p class="hy-eg">4,59,999 + 1 = <b>4,60,000</b></p>` }
    ],
    worked: {
      q: 'Write the successor and the predecessor of <b>4,59,999</b>.',
      steps: [
        { t: 'Successor — add 1', h: '<p>The ones digit is 9, so 9 + 1 = 10: write 0 and carry 1. The same thing happens all the way along the nines.</p>' },
        { t: 'The carry lands on the 5', h: '<p class="hy-eg">4,59,999 + 1 = <b>4,60,000</b></p>' },
        { t: 'Predecessor — subtract 1', h: '<p>Nothing tricky here: 9 − 1 = 8 in the ones place.</p>' },
        { t: 'Write it', h: '<p class="hy-eg">4,59,999 − 1 = <b>4,59,998</b></p>' }
      ],
      ans: 'Successor 4,60,000 · Predecessor 4,59,998'
    },
    recall: 'Successor adds one, predecessor takes one — and nines roll over.'
  });

  L('M7', {
    goal: 'Build the greatest and the smallest number from a set of digits.',
    cards: [
      { t: 'Greatest — big digits first', h:
        `<p>Sort the digits from biggest to smallest and write them in that order.</p>
         <p class="hy-eg">4, 0, 7, 2 → 7, 4, 2, 0 → <b>7420</b></p>` },
      { t: 'Smallest — and the zero trap', h:
        `<p>Sort from smallest to biggest — but a number cannot <b>start</b> with 0.</p>
         <p>If 0 is your smallest digit, put the <b>next</b> smallest first, then the 0.</p>
         <p class="hy-eg">4, 0, 7, 2 → 0,2,4,7 → 0 cannot lead → <b>2047</b></p>` }
    ],
    worked: {
      q: 'Using 4, 0, 7 and 2 once each, write the greatest and the smallest number.',
      steps: [
        { t: 'Greatest: order them downwards', h: '<p class="hy-eg">7 &gt; 4 &gt; 2 &gt; 0 → <b>7420</b></p>' },
        { t: 'Smallest: order them upwards', h: '<p class="hy-eg">0 &lt; 2 &lt; 4 &lt; 7 → 0247</p>' },
        { t: 'Check the front', h: '<p>0247 is really only 247 — a four-digit number cannot begin with 0.</p>' },
        { t: 'Swap the first two digits', h: '<p class="hy-eg">→ <b>2047</b></p>' }
      ],
      ans: 'Greatest 7420 · Smallest 2047'
    },
    recall: 'Zero can go anywhere except the front.'
  });

  L('M8', {
    goal: 'Read and write Roman numerals without falling into the subtraction traps.',
    cards: [
      { t: 'The symbols you need', h:
        `<p class="hy-eg"><b>I</b> = 1 &nbsp;&nbsp; <b>V</b> = 5 &nbsp;&nbsp; <b>X</b> = 10 &nbsp;&nbsp; <b>L</b> = 50</p>
         <p>That is the whole alphabet for Grade 4. Everything else is built out of these four.</p>` },
      { t: 'The four rules', h:
        `<ol class="hy-l-steps">
           <li>Repeat a symbol to add — up to <b>three</b> times: XXX = 30.</li>
           <li>A smaller symbol <b>after</b> a bigger one is <b>added</b>: XI = 11.</li>
           <li>A smaller symbol <b>before</b> a bigger one is <b>subtracted</b>: IX = 9, XL = 40.</li>
           <li><b>V and L are never repeated and never subtracted.</b> VX and LC do not exist.</li>
         </ol>` },
      { t: 'Split before you write', h:
        `<p>Break the number into tens and ones, turn each part into Roman, then join them.</p>
         <p class="hy-eg">26 = 20 + 6 = XX + VI = <b>XXVI</b><br>
         38 = 30 + 8 = XXX + VIII = <b>XXXVIII</b></p>` }
    ],
    worked: {
      q: 'Write <b>49</b> in Roman numerals.',
      steps: [
        { t: 'Split into tens and ones', h: '<p class="hy-eg">49 = 40 + 9</p>' },
        { t: '40 first', h: '<p>You cannot write XXXX — four repeats are not allowed. 40 is ten before fifty → <b>XL</b>.</p>' },
        { t: 'Now 9', h: '<p>Nine is one before ten → <b>IX</b>.</p>' },
        { t: 'Join the two parts', h: '<p class="hy-eg">XL + IX = <b>XLIX</b></p>' },
        { t: 'So why not IL?', h: '<p>Because I may only be taken away from V and X — never from L. That is rule 4 doing its job.</p>' }
      ],
      ans: 'XLIX'
    },
    trap: 'The take-away pairs are only <b>IV = 4</b>, <b>IX = 9</b> and <b>XL = 40</b>. ' +
      'IL, VL and IC do not exist — I may only be taken from V and X. And never write four ' +
      'of the same symbol in a row: 4 is IV, not IIII; 40 is XL, not XXXX.',
    recall: 'Split into tens and ones, and never repeat a symbol four times.'
  });

  /* ==================================================== ADD AND SUBTRACT */

  L('M9', {
    goal: 'Add large numbers in columns and carry correctly.',
    cards: [
      { t: 'Lining up is most of the job', h:
        `<p>Ones under ones, tens under tens. If the columns are straight, the adding
         looks after itself.</p>
         <p class="hy-eg">&nbsp;&nbsp;4,55,783<br>+&nbsp;&nbsp;&nbsp;&nbsp;75,723<span class="hy-rule"></span></p>
         <p>Notice that the shorter number is pushed to the <b>right</b>, not the left.</p>` },
      { t: 'Carrying', h:
        `<p>Add right to left. When a column makes 10 or more, write the ones digit down
         and carry the ten to the top of the next column.</p>
         <p>Write the little carry digit above the column — do not try to hold it in your head.</p>` }
    ],
    worked: {
      q: 'Add: <b>4,55,783 + 75,723</b>',
      steps: [
        { t: 'Ones', h: '<p>3 + 3 = <b>6</b></p>' },
        { t: 'Tens', h: '<p>8 + 2 = 10 → write <b>0</b>, carry 1</p>' },
        { t: 'Hundreds', h: '<p>7 + 7 + 1 = 15 → write <b>5</b>, carry 1</p>' },
        { t: 'Thousands', h: '<p>5 + 5 + 1 = 11 → write <b>1</b>, carry 1</p>' },
        { t: 'Ten thousands', h: '<p>5 + 7 + 1 = 13 → write <b>3</b>, carry 1</p>' },
        { t: 'Lakhs', h: '<p>4 + 1 = <b>5</b></p><p class="hy-eg">= <b>5,31,506</b></p>' }
      ],
      ans: '5,31,506'
    },
    recall: 'Straight columns first, then add right to left.'
  });

  L('M10', {
    goal: 'Subtract with borrowing, including borrowing across zeros.',
    cards: [
      { t: 'When the top digit is too small', h:
        `<p>Borrow 1 from the column on its left. That 1 is worth <b>ten</b> where it lands.</p>
         <p class="hy-eg">&nbsp;&nbsp;5 12<br>&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;2<br>−&nbsp;&nbsp;&nbsp;&nbsp;8<span class="hy-rule"></span>&nbsp;&nbsp;&nbsp;5&nbsp;&nbsp;4</p>` },
      { t: 'Borrowing across a 0', h:
        `<p>A 0 has nothing to lend. Keep moving left until you find a digit that does —
         and <b>every 0 you pass turns into 9</b>.</p>
         <p class="hy-eg">7,00,000 → 6 &nbsp;9 &nbsp;9 &nbsp;9 &nbsp;9 &nbsp;10</p>` }
    ],
    worked: {
      q: 'Subtract: <b>7,00,000 − 2,45,318</b>',
      steps: [
        { t: 'Look at the ones', h: '<p>0 − 8 will not go, and every column to its left is a 0 as well.</p>' },
        { t: 'Go left until a digit can lend', h: '<p>The 7 in the lakhs place is the first one that can. It becomes <b>6</b>.</p>' },
        { t: 'Every zero you passed becomes 9', h: '<p class="hy-eg">6 &nbsp; 9 &nbsp; 9 &nbsp; 9 &nbsp; 9 &nbsp; 10</p>' },
        { t: 'Now subtract straight across', h: '<p>10−8=2 · 9−1=8 · 9−3=6 · 9−5=4 · 9−4=5 · 6−2=4</p>' },
        { t: 'Read it back', h: '<p class="hy-eg">= <b>4,54,682</b></p>' }
      ],
      ans: '4,54,682'
    },
    recall: 'Every zero you borrow past becomes a nine.'
  });

  L('M11', {
    goal: 'Use the properties of addition and subtraction to answer instantly.',
    cards: [
      { t: 'The four you must know', h:
        `<p><b>Zero:</b> a + 0 = a &nbsp;·&nbsp; a − 0 = a</p>
         <p><b>Same number:</b> a − a = 0</p>
         <p><b>Order (commutative):</b> a + b = b + a</p>
         <p><b>Grouping (associative):</b> (a + b) + c = a + (b + c)</p>` },
      { t: 'Subtraction is the odd one out', h:
        `<p>Order and grouping work for adding but <b>not</b> for subtracting.</p>
         <p class="hy-eg">9 − 4 = 5 &nbsp; but &nbsp; 4 − 9 is not 5</p>` },
      { t: 'Why they are useful', h:
        `<p>Order and grouping let you rearrange a sum so the friendly pairs go together.</p>
         <p class="hy-eg">25 + 47 + 75 → (25 + 75) + 47</p>` }
    ],
    worked: {
      q: 'Add quickly using the properties: <b>25 + 47 + 75</b>',
      steps: [
        { t: 'Look for a friendly pair', h: '<p>25 and 75 make a round 100.</p>' },
        { t: 'Use the order property to move them together', h: '<p class="hy-eg">25 + 47 + 75 = 25 + 75 + 47</p>' },
        { t: 'Use grouping to add that pair first', h: '<p class="hy-eg">(25 + 75) + 47 = 100 + 47</p>' },
        { t: 'Finish', h: '<p class="hy-eg">= <b>147</b></p>' }
      ],
      ans: '147'
    },
    recall: 'Addition lets you rearrange. Subtraction does not.'
  });

  L('M12', {
    goal: 'Turn a "missing number" sentence into a sum you can actually do.',
    cards: [
      { t: 'Three sentences, three sums', h:
        `<p>"What must be <b>added to a</b> to make <b>b</b>?" → <b>b − a</b></p>
         <p>"The <b>sum</b> of two numbers is s, one is a. Find the other." → <b>s − a</b></p>
         <p>"The <b>difference</b> is d, the bigger number is b." → <b>b − d</b></p>` },
      { t: 'The pattern behind all three', h:
        `<p>Every one of them is a <b>subtraction</b>. You know the whole and you know one
         part, so you take the part away from the whole.</p>
         <p class="hy-key">whole − part you have = part you need</p>` }
    ],
    worked: {
      q: 'What must be added to <b>3,456</b> to get <b>9,000</b>?',
      steps: [
        { t: 'Name the whole and the part', h: '<p>The whole is 9,000. The part you already have is 3,456.</p>' },
        { t: 'Whole − part', h: '<p class="hy-eg">9,000 − 3,456</p>' },
        { t: 'Borrow across the zeros', h: '<p class="hy-eg">9,000 → 8 &nbsp; 9 &nbsp; 9 &nbsp; 10</p>' },
        { t: 'Subtract', h: '<p class="hy-eg">= <b>5,544</b></p>' },
        { t: 'Check it', h: '<p class="hy-eg">3,456 + 5,544 = 9,000 ✓</p>' }
      ],
      ans: '5,544'
    },
    recall: 'Whole minus the part you already have.'
  });

  L('M13', {
    goal: 'Check a subtraction by adding — and use the proper names for the parts.',
    cards: [
      { t: 'The names', h:
        `<p class="hy-eg">Minuend − Subtrahend = <b>Difference</b></p>
         <p>The <b>minuend</b> is the one on top, the <b>subtrahend</b> is the one being
         taken away, and what is left is the <b>difference</b>.</p>` },
      { t: 'The check', h:
        `<p class="hy-key">Difference + Subtrahend = Minuend</p>
         <p>If it comes back to the number you started with, your answer is right. This
         takes ten seconds and saves whole marks.</p>` }
    ],
    worked: {
      q: 'Work out <b>8,412 − 3,187</b> and check your answer.',
      steps: [
        { t: 'Subtract', h: '<p class="hy-eg">8,412 − 3,187 = <b>5,225</b></p>' },
        { t: 'Name the parts', h: '<p>Minuend 8,412 · Subtrahend 3,187 · Difference 5,225</p>' },
        { t: 'Add the difference back to the subtrahend', h: '<p class="hy-eg">5,225 + 3,187</p>' },
        { t: 'Did it come home?', h: '<p class="hy-eg">= 8,412 ✓ — the same as the minuend, so the answer is right.</p>' }
      ],
      ans: '5,225 · checked: 5,225 + 3,187 = 8,412'
    },
    recall: 'Add your answer to what you took away — you should land back on the top number.'
  });

  L('M14', {
    goal: 'Read a word problem and decide, safely, whether to add or to subtract.',
    cards: [
      { t: 'Five steps, every time', h:
        `<ol class="hy-l-steps">
           <li>Read the problem <b>twice</b>.</li>
           <li>Underline the numbers.</li>
           <li>Ask: is this <b>joining</b> (+) or <b>taking away / comparing</b> (−)?</li>
           <li>If it is a two-step problem, find the middle answer first.</li>
           <li>Write the <b>unit</b> in your answer — kg, m, litres, people.</li>
         </ol>` },
      { t: 'Words that give it away', h:
        `<div class="hy-vs">
           <div><b>Add</b><p>altogether · in all · total · both</p></div>
           <div><b>Subtract</b><p>left · remaining · how many more · how much less</p></div>
         </div>
         <p>They are clues, not rules — the sentence still has to make sense.</p>` }
    ],
    worked: {
      q: 'A shop had <b>12,450 kg</b> of rice. It sold <b>3,275 kg</b> on Monday and <b>4,180 kg</b> on Tuesday. How much is left?',
      steps: [
        { t: 'What is being asked?', h: '<p>"How much is left" → something is being taken away.</p>' },
        { t: 'But two lots were sold', h: '<p>So this is a <b>two-step</b> problem. Find the total sold first.</p>' },
        { t: 'Step 1 — total sold', h: '<p class="hy-eg">3,275 + 4,180 = <b>7,455 kg</b></p>' },
        { t: 'Step 2 — take it off the stock', h: '<p class="hy-eg">12,450 − 7,455 = <b>4,995 kg</b></p>' },
        { t: 'Answer with the unit', h: '<p class="hy-eg"><b>4,995 kg</b> of rice is left.</p>' }
      ],
      ans: '4,995 kg'
    },
    recall: 'Two numbers being taken away? Add them together first.'
  });

  /* ======================================================= MULTIPLICATION */

  L('M15', {
    goal: 'Answer any table fact from 2 to 12 in under three seconds.',
    cards: [
      { t: 'This one is about speed', h:
        `<p>You already know most of these. The exam does not give you time to count on
         your fingers, so the target is <b>under 3 seconds</b>, every time.</p>
         <p>Every long multiplication, every word problem and every area question sits on
         top of these facts. Slow tables make everything else slow.</p>` },
      { t: 'The handful everybody forgets', h:
        `<p class="hy-eg">7 × 8 = 56 &nbsp;·&nbsp; 6 × 7 = 42 &nbsp;·&nbsp; 8 × 9 = 72<br>
         6 × 8 = 48 &nbsp;·&nbsp; 7 × 9 = 63 &nbsp;·&nbsp; 12 × 7 = 84 &nbsp;·&nbsp; 11 × 12 = 132</p>
         <p>Learn these seven and the rest come easily.</p>` },
      { t: 'Two tricks that halve the work', h:
        `<p><b>Order does not matter.</b> 8 × 3 and 3 × 8 are the same fact, so you only
         ever have to learn one of them.</p>
         <p><b>Halve then double.</b> If a fact escapes you, use an easier one next door:
         7 × 8 → 7 × 4 = 28 → double → <b>56</b>.</p>` }
    ],
    worked: {
      q: 'You cannot remember <b>7 × 8</b>. Get to it in two steps.',
      steps: [
        { t: 'Pick an easier neighbour', h: '<p>You do know 7 × 4.</p>' },
        { t: 'Work that one out', h: '<p class="hy-eg">7 × 4 = 28</p>' },
        { t: '8 is double 4, so double the answer', h: '<p class="hy-eg">28 + 28 = <b>56</b></p>' },
        { t: 'Say it out loud three times', h: '<p class="hy-eg">7 × 8 = 56 &nbsp;·&nbsp; 5, 6, 7, 8 — the digits are in order, which is why this one is worth memorising.</p>' }
      ],
      ans: '7 × 8 = 56'
    },
    recall: 'If a fact runs away: halve, then double.'
  });

  L('M16', {
    goal: 'Multiply by 10, 100, 1000 and by numbers ending in zeros.',
    cards: [
      { t: 'The zero rule', h:
        `<p>Multiply the non-zero parts first, then write <b>all</b> the zeros on the end.</p>
         <p class="hy-eg">× 10 → one zero<br>× 100 → two zeros<br>× 1000 → three zeros</p>` },
      { t: 'Numbers like 400 and 6,000', h:
        `<p>Split the number: 400 is 4 with two zeros.</p>
         <p class="hy-eg">32 × 400 → 32 × 4 = 128 → add 2 zeros → <b>12,800</b></p>
         <p>Count the zeros before you start and count them again at the end.</p>` }
    ],
    worked: {
      q: 'Multiply: <b>32 × 400</b>',
      steps: [
        { t: 'Split off the zeros', h: '<p class="hy-eg">400 = 4 followed by <b>2 zeros</b></p>' },
        { t: 'Multiply the easy part', h: '<p class="hy-eg">32 × 4 = 128</p>' },
        { t: 'Put the zeros back', h: '<p class="hy-eg">128 → 128<b>00</b></p>' },
        { t: 'Add the comma', h: '<p class="hy-eg">= <b>12,800</b></p>' }
      ],
      ans: '12,800'
    },
    recall: 'Multiply the digits, then give back every zero you borrowed.'
  });

  L('M17', {
    goal: 'Name and use the properties of multiplication.',
    cards: [
      { t: 'The easy two', h:
        `<p><b>Multiply by 0</b> → the answer is always <b>0</b>.</p>
         <p><b>Multiply by 1</b> → the answer is the number itself.</p>
         <p class="hy-eg">6,857 × 0 = 0 &nbsp;&nbsp; 6,857 × 1 = 6,857</p>` },
      { t: 'Order and grouping', h:
        `<p><b>Order:</b> a × b = b × a</p>
         <p><b>Grouping:</b> (a × b) × c = a × (b × c)</p>
         <p>Both let you rearrange a multiplication to make it easier.</p>` },
      { t: 'Distributive — the useful one', h:
        `<p class="hy-key">a × (b + c) = (a × b) + (a × c)</p>
         <p>It lets you break a hard number into two easy ones.</p>
         <p class="hy-eg">6 × 104 = 6 × (100 + 4)</p>` }
    ],
    worked: {
      q: 'Use the distributive property: <b>6 × 104</b>',
      steps: [
        { t: 'Break 104 into friendly pieces', h: '<p class="hy-eg">104 = 100 + 4</p>' },
        { t: 'Share the 6 out over both pieces', h: '<p class="hy-eg">6 × (100 + 4) = (6 × 100) + (6 × 4)</p>' },
        { t: 'Do the two easy multiplications', h: '<p class="hy-eg">600 + 24</p>' },
        { t: 'Add', h: '<p class="hy-eg">= <b>624</b></p>' }
      ],
      ans: '624'
    },
    recall: 'Break the awkward number into a round one plus a small one.'
  });

  L('M18', {
    goal: 'Multiply a large number by a single digit, carrying properly.',
    cards: [
      { t: 'Set it out in columns', h:
        `<p>The single digit goes under the <b>ones</b> place. Work right to left.</p>
         <p class="hy-eg">&nbsp;&nbsp;4,672<br>×&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4<span class="hy-rule"></span></p>` },
      { t: 'The carry rule that catches everyone', h:
        `<p class="hy-key">Multiply first, then add the carry.</p>
         <p>Never add the carry before multiplying — that is the single most common
         mistake in the whole chapter.</p>` }
    ],
    worked: {
      q: 'Multiply: <b>4,672 × 4</b>',
      steps: [
        { t: 'Ones', h: '<p>2 × 4 = <b>8</b>. Nothing to carry.</p>' },
        { t: 'Tens', h: '<p>7 × 4 = 28 → write <b>8</b>, carry 2</p>' },
        { t: 'Hundreds', h: '<p>6 × 4 = 24, <i>then</i> add the carry: 24 + 2 = 26 → write <b>6</b>, carry 2</p>' },
        { t: 'Thousands', h: '<p>4 × 4 = 16, then add the carry: 16 + 2 = <b>18</b></p>' },
        { t: 'Read it off', h: '<p class="hy-eg">= <b>18,688</b></p>' }
      ],
      ans: '18,688'
    },
    recall: 'Multiply the digit, THEN add the carry.'
  });

  L('M19', {
    goal: 'Spot a multiplication word problem and answer it with its unit.',
    cards: [
      { t: 'The words that mean multiply', h:
        `<p><b>each · every · per · in one</b> — these tell you that one amount is
         repeated many times.</p>
         <p class="hy-eg">One carton holds 144 pens. How many pens in 6 cartons?</p>` },
      { t: 'Write the sum before you work it out', h:
        `<ol class="hy-l-steps">
           <li>How much in <b>one</b>?</li>
           <li>How many of them?</li>
           <li>Multiply the two.</li>
           <li>Answer with the unit — pens, kg, chairs.</li>
         </ol>` }
    ],
    worked: {
      q: 'One carton holds <b>144 pens</b>. How many pens are there in <b>6 cartons</b>?',
      steps: [
        { t: 'How much in one?', h: '<p>144 pens in one carton.</p>' },
        { t: 'How many of them?', h: '<p>6 cartons.</p>' },
        { t: 'So it is a multiplication', h: '<p class="hy-eg">144 × 6</p>' },
        { t: 'Work it out in columns', h: '<p>4×6=24 write 4 carry 2 · 4×6=24 +2 = 26 write 6 carry 2 · 1×6=6 +2 = 8</p>' },
        { t: 'Answer with the unit', h: '<p class="hy-eg">= <b>864 pens</b></p>' }
      ],
      ans: '864 pens'
    },
    recall: '"Each" is the word that means multiply.'
  });

  /* ============================================================= GEOMETRY */

  L('M20', {
    goal: 'Tell a point, a line, a ray and a line segment apart on sight.',
    cards: [
      { t: 'Count the end points', h:
        `<p>That single question separates all three.</p>
         <p><b>Line segment</b> — <b>2</b> end points. Has a definite length, so you can
         measure it with a ruler.</p>
         <p><b>Ray</b> — <b>1</b> end point, then goes on for ever in one direction.</p>
         <p><b>Line</b> — <b>no</b> end points, goes on for ever both ways.</p>` },
      { t: 'Point', h:
        `<p>A <b>point</b> is an exact location. It is shown by a dot and named with a
         capital letter — A, B, P.</p>` },
      { t: 'Open and closed curves', h:
        `<p>A <b>closed</b> curve finishes where it started — a circle, the outline of a
         leaf.</p>
         <p>An <b>open</b> curve does not — the letter S, a piece of string laid out flat.</p>` }
    ],
    worked: {
      q: 'A figure has one dot at one end and an arrow at the other. What is it?',
      steps: [
        { t: 'Ask the only question that matters', h: '<p>How many <b>end points</b> does it have?</p>' },
        { t: 'Count them', h: '<p>The dot is an end point. The arrow means it never stops that way, so that side has no end point. Total: <b>1</b>.</p>' },
        { t: 'Match it to the list', h: '<p>2 end points → segment · <b>1 end point → ray</b> · 0 end points → line</p>' },
        { t: 'One more check', h: '<p>Could you measure it with a ruler? No — so it cannot be a line segment. It is a <b>ray</b>.</p>' }
      ],
      ans: 'A ray'
    },
    recall: 'Two ends a segment, one end a ray, no ends a line.'
  });

  L('M21', {
    goal: 'Name any angle from its size, and name the parts of an angle.',
    cards: [
      { t: 'What an angle is made of', h:
        `<p>An angle is formed when <b>two rays meet at a common end point</b>.</p>
         <p>The two rays are the <b>arms</b>. The point where they meet is the <b>vertex</b>.</p>` },
      { t: 'The six names, in order of size', h:
        `<p class="hy-eg"><b>Acute</b> &nbsp;less than 90°<br>
         <b>Right</b> &nbsp;exactly 90°<br>
         <b>Obtuse</b> &nbsp;more than 90°, less than 180°<br>
         <b>Straight</b> &nbsp;exactly 180°<br>
         <b>Reflex</b> &nbsp;more than 180°, less than 360°<br>
         <b>Complete</b> &nbsp;exactly 360°</p>` },
      { t: 'Read the number twice', h:
        `<p>89° is <b>acute</b> and 91° is <b>obtuse</b> — one digit changes the whole
         answer. The exam will give you numbers close to 90 on purpose.</p>` }
    ],
    worked: {
      q: 'Name the angle: <b>135°</b>',
      steps: [
        { t: 'Is it less than 90°?', h: '<p>No — 135 is bigger than 90. So it is not acute.</p>' },
        { t: 'Is it exactly 90° or exactly 180°?', h: '<p>No. So it is neither a right angle nor a straight angle.</p>' },
        { t: 'Is it between 90° and 180°?', h: '<p>Yes — 90 &lt; 135 &lt; 180.</p>' },
        { t: 'That is the definition of obtuse', h: '<p class="hy-eg">135° is an <b>obtuse</b> angle.</p>' }
      ],
      ans: 'Obtuse'
    },
    recall: 'Walk the ladder: 90, 180, 360 — and see where the number lands.'
  });

  L('M22', {
    goal: 'Name a polygon by its sides and count its vertices.',
    cards: [
      { t: 'What counts as a polygon', h:
        `<p>A polygon is a <b>closed</b> figure made <b>only of line segments</b>.</p>
         <p>A circle is not a polygon — it is made of a curve. A shape with a gap in it
         is not a polygon either, because it is not closed.</p>` },
      { t: 'The names', h:
        `<p class="hy-eg">Triangle <b>3</b> · Quadrilateral <b>4</b> · Pentagon <b>5</b><br>
         Hexagon <b>6</b> · Heptagon <b>7</b> · Octagon <b>8</b></p>` },
      { t: 'Two facts worth a free mark', h:
        `<p class="hy-key">Number of sides = number of vertices</p>
         <p>A <b>regular</b> polygon has all its sides equal <b>and</b> all its angles
         equal.</p>` }
    ],
    worked: {
      q: 'A polygon has <b>8 vertices</b>. Name it, and say how many sides it has.',
      steps: [
        { t: 'Use the rule', h: '<p>Sides always equal vertices, so it has <b>8 sides</b>.</p>' },
        { t: 'Look up the name for 8', h: '<p class="hy-eg">3 triangle · 4 quadrilateral · 5 pentagon · 6 hexagon · 7 heptagon · <b>8 octagon</b></p>' },
        { t: 'Write the full answer', h: '<p class="hy-eg">It is an <b>octagon</b>, with <b>8</b> sides.</p>' }
      ],
      ans: 'Octagon · 8 sides'
    },
    recall: 'Sides and vertices always match.'
  });

  L('M23', {
    goal: 'Name every part of a circle and convert radius to diameter.',
    cards: [
      { t: 'The parts', h:
        `<p><b>Centre</b> — the middle point.</p>
         <p><b>Radius</b> — centre to any point on the circle.</p>
         <p><b>Chord</b> — a line segment joining any two points on the circle.</p>
         <p><b>Diameter</b> — a chord that passes through the centre. It is the longest
         chord there is.</p>
         <p><b>Circumference</b> — the distance all the way around.</p>
         <p><b>Arc</b> — any part of the circumference.</p>` },
      { t: 'The one calculation', h:
        `<p class="hy-key">Diameter = 2 × radius &nbsp;·&nbsp; Radius = diameter ÷ 2</p>
         <p>Every numerical circle question in this portion is one of those two.</p>` }
    ],
    worked: {
      q: 'The radius of a circle is <b>7 cm</b>. Find its diameter. Then a second circle has a diameter of <b>18 cm</b> — find its radius.',
      steps: [
        { t: 'First one: radius given, diameter wanted', h: '<p>Going from radius to diameter, you <b>double</b>.</p>' },
        { t: 'Work it out', h: '<p class="hy-eg">d = 2 × 7 = <b>14 cm</b></p>' },
        { t: 'Second one: diameter given, radius wanted', h: '<p>Going the other way, you <b>halve</b>.</p>' },
        { t: 'Work it out', h: '<p class="hy-eg">r = 18 ÷ 2 = <b>9 cm</b></p>' }
      ],
      ans: 'Diameter 14 cm · Radius 9 cm'
    },
    recall: 'Radius to diameter: double. Diameter to radius: halve.'
  });

  /* ==================================================== PERIMETER & AREA */

  L('M24', {
    goal: 'Find the perimeter of any polygon and set the working out the way your teacher wants it.',
    cards: [
      { t: 'What perimeter means', h:
        `<p class="hy-key">Perimeter of a polygon = the sum of the lengths of all its sides</p>
         <p>It is the distance you would walk if you went all the way round the edge.</p>` },
      { t: 'Write it out in full', h:
        `<p>Marks are given for the working, not only the answer. Copy this shape:</p>
         <p class="hy-eg">Perimeter of the polygon<br>
         = sum of the lengths of the sides<br>
         = 5 + 8 + 6 + 4 cm<br>
         = <b>23 cm</b></p>
         <p>The unit goes on the line where the numbers are, and again on the answer.</p>` }
    ],
    worked: {
      q: 'Find the perimeter of a four-sided figure with sides <b>7 cm, 9 cm, 6 cm and 5 cm</b>.',
      steps: [
        { t: 'Write the opening line', h: '<p class="hy-eg">Perimeter of the polygon<br>= sum of the lengths of the sides</p>' },
        { t: 'List every side — check none is missed', h: '<p class="hy-eg">= 7 + 9 + 6 + 5 cm</p>' },
        { t: 'Add them in pairs to be safe', h: '<p class="hy-eg">7 + 9 = 16 &nbsp;·&nbsp; 6 + 5 = 11 &nbsp;·&nbsp; 16 + 11 = 27</p>' },
        { t: 'Finish with the unit', h: '<p class="hy-eg">= <b>27 cm</b></p>' }
      ],
      ans: '27 cm'
    },
    recall: 'Perimeter is just every side added up.'
  });

  L('M25', {
    goal: 'Use the rectangle perimeter formula both forwards and backwards.',
    cards: [
      { t: 'The formula', h:
        `<p class="hy-key">Perimeter of a rectangle = 2 × (length + breadth)</p>
         <p>A rectangle has two lengths and two breadths, so you add one of each and
         double the lot.</p>
         <p class="hy-eg">l = 9 cm, b = 4 cm<br>P = 2 × (9 + 4) = 2 × 13 = <b>26 cm</b></p>` },
      { t: 'Backwards — finding a missing side', h:
        `<p>If they give you the perimeter and one side:</p>
         <p class="hy-key">length = (P ÷ 2) − breadth</p>
         <p>Halving the perimeter gives you one length plus one breadth. Take the side
         you know off that.</p>` }
    ],
    worked: {
      q: 'The perimeter of a rectangle is <b>30 cm</b> and its breadth is <b>7 cm</b>. Find its length.',
      steps: [
        { t: 'Start from the formula', h: '<p class="hy-eg">P = 2 × (l + b)</p>' },
        { t: 'Halve the perimeter', h: '<p>That undoes the "2 ×" and leaves one length plus one breadth.</p><p class="hy-eg">30 ÷ 2 = 15 cm</p>' },
        { t: 'Take away the breadth', h: '<p class="hy-eg">15 − 7 = <b>8 cm</b></p>' },
        { t: 'Check by going forwards', h: '<p class="hy-eg">2 × (8 + 7) = 2 × 15 = 30 cm ✓</p>' }
      ],
      ans: '8 cm'
    },
    recall: 'Half the perimeter is one length plus one breadth.'
  });

  L('M26', {
    goal: 'Use the square perimeter formula both forwards and backwards.',
    cards: [
      { t: 'The formula', h:
        `<p class="hy-key">Perimeter of a square = 4 × side</p>
         <p>All four sides are the same, so there is nothing to add up.</p>
         <p class="hy-eg">side = 7 cm → P = 4 × 7 = <b>28 cm</b></p>` },
      { t: 'Backwards', h:
        `<p class="hy-key">side = perimeter ÷ 4</p>
         <p class="hy-eg">P = 36 cm → side = 36 ÷ 4 = <b>9 cm</b></p>` }
    ],
    worked: {
      q: 'The perimeter of a square is <b>36 cm</b>. Find the length of one side.',
      steps: [
        { t: 'Start from the formula', h: '<p class="hy-eg">P = 4 × side</p>' },
        { t: 'You know P, you want the side — so divide', h: '<p class="hy-eg">side = 36 ÷ 4</p>' },
        { t: 'Work it out', h: '<p class="hy-eg">= <b>9 cm</b></p>' },
        { t: 'Check by going forwards', h: '<p class="hy-eg">4 × 9 = 36 cm ✓</p>' }
      ],
      ans: '9 cm'
    },
    recall: 'Times four one way, divide by four the other.'
  });

  L('M27', {
    goal: 'Find areas of squares and rectangles — and always use square units.',
    cards: [
      { t: 'The two formulas', h:
        `<p class="hy-key">Area of a rectangle = length × breadth</p>
         <p class="hy-key">Area of a square = side × side</p>` },
      { t: 'Square units', h:
        `<p>Area is measured in <b>square</b> units: cm², m². Area counts the little
         squares that fit inside, so the unit gets a little 2 on it.</p>
         <p class="hy-eg">l = 8 cm, b = 5 cm → Area = 8 × 5 = <b>40 cm²</b></p>` },
      { t: 'Perimeter or area?', h:
        `<div class="hy-vs">
           <div><b>Perimeter</b><p>The border. Measured in cm, m.</p></div>
           <div><b>Area</b><p>The surface inside. Measured in cm², m².</p></div>
         </div>
         <p>Losing the little 2 loses the mark, even when the number is right.</p>` }
    ],
    worked: {
      q: 'Find the area of a rectangle <b>8 cm</b> long and <b>5 cm</b> wide, and of a square of side <b>6 cm</b>.',
      steps: [
        { t: 'Rectangle: length × breadth', h: '<p class="hy-eg">Area = 8 × 5</p>' },
        { t: 'Work it out and write the unit', h: '<p class="hy-eg">= <b>40 cm²</b></p>' },
        { t: 'Square: side × side', h: '<p class="hy-eg">Area = 6 × 6</p>' },
        { t: 'And its unit', h: '<p class="hy-eg">= <b>36 cm²</b></p>' }
      ],
      ans: '40 cm² and 36 cm²'
    },
    recall: 'Area is always square units — cm², never cm.'
  });

  L('M28', {
    goal: 'Decide whether a word problem is asking for perimeter or for area.',
    cards: [
      { t: 'Around the edge → perimeter', h:
        `<p>Fencing a field · running around a park · ribbon around a photo frame ·
         a border around a garden · wire around a picture.</p>
         <p>Anything that goes <b>along the edge</b>.</p>` },
      { t: 'Covering the inside → area', h:
        `<p>Carpet on a floor · tiles in a bathroom · painting a wall · grass in a
         field · cloth for a handkerchief.</p>
         <p>Anything that <b>covers the surface</b>.</p>` },
      { t: 'The habit that saves you', h:
        `<p>Read the <b>last line</b> of the question again before choosing. It is the
         line that tells you what is actually wanted, and it is the line people skip.</p>` }
    ],
    worked: {
      q: 'A garden is <b>15 m</b> long and <b>9 m</b> wide. How much fencing is needed to go all the way around it?',
      steps: [
        { t: 'Find the deciding words', h: '<p>"fencing" and "all the way around" — both point to the <b>edge</b>.</p>' },
        { t: 'So it is perimeter, not area', h: '<p class="hy-eg">P = 2 × (l + b)</p>' },
        { t: 'Put the numbers in', h: '<p class="hy-eg">= 2 × (15 + 9) = 2 × 24</p>' },
        { t: 'Finish with the right unit', h: '<p class="hy-eg">= <b>48 m</b> of fencing — m, not m², because it is a length.</p>' }
      ],
      ans: '48 m'
    },
    recall: 'Along the edge is perimeter. Covering the inside is area.'
  });

})();

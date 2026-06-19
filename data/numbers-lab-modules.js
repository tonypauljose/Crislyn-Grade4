/* ============================================================
   NUMBERS LAB — module map & missions (Phase A: 4 flagship modules)
   Stage kinds: teach | widget | quiz | milestone
   Coming-soon modules render as locked cards on the map.
   ============================================================ */
window.NLAB_MODULES = [

  /* ---------- 1 · NUMBER DETECTIVE ---------- */
  {
    id: 'number-detective', num: 1, emoji: '🔍',
    title: 'Number Detective',
    tagline: 'Crack the secret of digits, places and number names.',
    badge: { emoji: '🔍', name: 'Number Detective' },
    stages: [
      {
        kind: 'teach', emoji: '🔢', title: 'Digits vs Numbers',
        why: 'If you know what each digit is <em>worth</em>, huge numbers stop being scary.',
        body:
          '<p>There are only <strong>ten digits</strong>: 0 1 2 3 4 5 6 7 8 9. Think of them like letters.</p>' +
          '<p>A <strong>number</strong> is digits put together — like a word. The same digit means different amounts depending on <strong>where</strong> it sits. In <strong>4582</strong>, the 5 isn’t just “5” — it means <strong>5 hundreds = 500</strong>.</p>' +
          '<p>That position is called its <strong>place value</strong>. Every step to the left is <strong>ten times bigger</strong>: ones → tens → hundreds → thousands…</p>',
        guide: 'I’m Digit! Tap “Read the number” below to hear it. Then notice how each column is ten times bigger than the one on its right.',
        widget: 'place-value-grid', widgetOpts: { number: 4582, task: 'show' }
      },
      { kind: 'widget', title: '🕵️ Find the place', intro: 'A real detective knows exactly where each digit lives.', widget: 'place-value-grid', opts: { number: 5739, task: 'identify' } },
      {
        kind: 'teach', emoji: '➕', title: 'Expanded form & comma groups',
        why: 'Breaking a number into its place values is the secret behind adding, rounding and estimating.',
        body:
          '<p><strong>Expanded form</strong> shows what every digit is really worth, added up:</p>' +
          '<p style="font-family:var(--nl-font-mono)">3527 = <strong>3000 + 500 + 20 + 7</strong></p>' +
          '<p>Commas split big numbers into easy groups. In the <strong>Indian system</strong> we group 3-2-2 (e.g. 12,34,567) and in the <strong>International system</strong> we group in 3s (1,234,567). Same number — different grouping!</p>' +
          '<div class="nl-tip">Tip: a comma is just a “rest stop” for your eyes. It never changes the value.</div>',
        guide: 'Ready to build one yourself? Tap the pieces from biggest to smallest.'
      },
      { kind: 'widget', title: '🧩 Build the expanded form', widget: 'expanded-form-builder', opts: { number: 3527 } },
      {
        kind: 'teach', emoji: '⚖️', title: 'Comparing numbers',
        why: 'Knowing which number is bigger helps with money, scores, distances — everywhere.',
        body:
          '<p>To compare, line them up and check the <strong>leftmost digit first</strong>. More digits usually means a bigger number.</p>' +
          '<p>If the first digits match, slide right one place and compare again — like checking names letter by letter.</p>' +
          '<div class="nl-watch">Watch out: 105 is bigger than 95, even though 95 “feels” big — 105 has an extra place (hundreds)!</div>',
        guide: 'Tap >, = or < . Trust the places, not the look of the number.'
      },
      { kind: 'widget', title: '⚖️ Greater, less or equal?', widget: 'compare', opts: { rounds: 5 } },
      { kind: 'quiz', title: '🎯 Detective test', bankKey: 'number-detective' },
      { kind: 'milestone', title: 'Case closed!', message: 'You can read, expand and compare numbers like a true <strong>Number Detective</strong>. 🔍' }
    ]
  },

  /* ---------- 2 · ALIGNMENT ACADEMY ---------- */
  {
    id: 'alignment-academy', num: 2, emoji: '📐',
    title: 'Alignment Academy',
    tagline: 'Why numbers MUST line up on the right — and how to do it.',
    badge: { emoji: '📏', name: 'Alignment Ace' },
    stages: [
      {
        kind: 'teach', emoji: '📐', title: 'Why columns matter',
        why: 'Most “silly mistakes” in maths come from digits that aren’t lined up. Fix this once and your answers get way more accurate.',
        body:
          '<p>When we add, subtract, multiply or divide “in columns”, every column must hold <strong>the same place value</strong> — ones with ones, tens with tens, hundreds with hundreds.</p>' +
          '<p>If a 7 ones accidentally sits under a 4 hundreds, the computer in your head adds 7 + 400 as if they belong together. That’s how answers go wrong.</p>',
        guide: 'Let me show you the danger first. Watch what happens when numbers line up on the LEFT instead of the right.'
      },
      { kind: 'widget', title: '👀 Wrong vs Right', widget: 'align-demo', opts: { a: 342, b: 57 } },
      {
        kind: 'teach', emoji: '🏅', title: 'The Golden Rule',
        why: 'One simple habit — line up on the right — prevents a huge number of mistakes.',
        body:
          '<p><strong>The Golden Rule:</strong> when stacking numbers, line them up on the <strong>RIGHT</strong>. The ones digits should sit in one straight column.</p>' +
          '<p>Then work <strong>right to left</strong>: ones first, then tens, then hundreds.</p>' +
          '<div class="nl-tip">Decimals too! For 12.5 + 3.75, line up the <strong>decimal points</strong> — that automatically lines up the places.</div>',
        guide: 'Now you try. Slide each digit of the small number into the correct column. Start with the ones!'
      },
      { kind: 'widget', title: '🎯 Line them up', widget: 'right-align', opts: { a: 426, b: 38, op: '+' } },
      { kind: 'widget', title: '🎯 One more — trickier', widget: 'right-align', opts: { a: 1530, b: 245, op: '+' } },
      { kind: 'quiz', title: '🎯 Alignment test', bankKey: 'alignment-academy' },
      { kind: 'milestone', title: 'Aligned and accurate!', message: 'You’ve mastered the Golden Rule. Your column maths just got a lot more reliable. 📏' }
    ]
  },

  /* ---------- 3-6 coming soon ---------- */
  { id: 'addition-lab', num: 3, emoji: '➕', title: 'Addition Lab', tagline: 'Carrying, mental tricks, estimating & checking.', comingSoon: true },
  { id: 'subtraction-lab', num: 4, emoji: '➖', title: 'Subtraction Lab', tagline: 'Borrowing, number-line jumps & differences.', comingSoon: true },
  { id: 'multiplication-workshop', num: 5, emoji: '✖️', title: 'Multiplication Workshop', tagline: 'Arrays, table patterns & clever shortcuts.', comingSoon: true },
  { id: 'division-station', num: 6, emoji: '➗', title: 'Division Station', tagline: 'Sharing, grouping, remainders & checking.', comingSoon: true },

  /* ---------- 7 · BINARY WORLD ---------- */
  {
    id: 'binary-world', num: 7, emoji: '💡',
    title: 'Binary World',
    tagline: 'The on/off code every computer thinks in.',
    badge: { emoji: '🤖', name: 'Binary Boss' },
    stages: [
      {
        kind: 'teach', emoji: '💡', title: 'Yes or No, On or Off',
        why: 'Every phone, game and computer stores EVERYTHING using just two symbols: 0 and 1. Understanding this is like learning the language of machines.',
        body:
          '<p>Inside a computer there are billions of tiny switches. Each one is either <strong>OFF (0)</strong> or <strong>ON (1)</strong>. That’s it — there is no “2”.</p>' +
          '<p>This two-symbol system is called <strong>binary</strong> (bi = two). To make bigger numbers, we line up several switches — just like we line up digits.</p>',
        guide: 'Play with the switches below — flip them on and off and watch the number change. Then I’ll set you a challenge.',
        widget: 'binary-switchboard', widgetOpts: { bits: 5 }
      },
      { kind: 'widget', title: '🎯 Build a number in binary', intro: 'Flip the lights to make the target number.', widget: 'binary-switchboard', opts: { bits: 5, target: 13 } },
      {
        kind: 'teach', emoji: '🔢', title: 'Counting with powers of two',
        why: 'Once you see the pattern 1, 2, 4, 8, 16… you can read any binary number.',
        body:
          '<p>In our normal numbers, places go ×10: 1, 10, 100, 1000. In binary, places go <strong>×2</strong>: 1, 2, 4, 8, 16, 32…</p>' +
          '<p>To find a binary number’s value, just add up the “on” places. <strong>1 1 0 1</strong> = 8 + 4 + 0 + 1 = <strong>13</strong>.</p>' +
          '<div class="nl-tip">Cool fact: with 5 switches you can count all the way from 0 to 31!</div>',
        guide: 'Time for a game — flip the dot-cards so the dots you can see add up to my target number.'
      },
      { kind: 'widget', title: '🃏 Count the dots', widget: 'binary-cards', opts: { bits: 5, rounds: 3 } },
      {
        kind: 'teach', emoji: '🔤', title: 'Letters, pictures… everything',
        why: 'It shows that ALL your photos, songs and chats are really just huge rows of 0s and 1s.',
        body:
          '<p>If computers only know 0 and 1, how do they store the letter “A” or a cat photo?</p>' +
          '<p>Easy — they agree on a code. The letter “A” is the number <strong>65</strong> = binary <strong>1000001</strong>. A photo is millions of tiny coloured dots, each written as numbers, each number written in binary.</p>' +
          '<p>So everything on a screen is, deep down, a giant pattern of switches. You now know the secret! 🤫</p>',
        guide: 'Mind-blowing, right? Your favourite game is millions of 0s and 1s, switching on and off super fast.'
      },
      { kind: 'quiz', title: '🎯 Binary test', bankKey: 'binary-world' },
      { kind: 'milestone', title: 'You speak computer!', message: 'You can read and build binary numbers — the language of every machine. 🤖' }
    ]
  },

  /* ---------- 8 · HEX COLOUR LAB ---------- */
  {
    id: 'hex-colour-lab', num: 8, emoji: '🎨',
    title: 'Hex Colour Lab',
    tagline: 'Mix colours the way programmers do — with hex.',
    badge: { emoji: '🎨', name: 'Colour Coder' },
    stages: [
      {
        kind: 'teach', emoji: '🎨', title: 'Sixteen digits: 0–9 then A–F',
        why: 'Hex is everywhere designers and coders work — colours, game code, memory. Knowing it makes you feel like a real programmer.',
        body:
          '<p><strong>Hexadecimal</strong> (hex) is a counting system with <strong>16</strong> digits instead of 10. After 9 we keep going with letters: <strong>A=10, B=11, C=12, D=13, E=14, F=15</strong>.</p>' +
          '<p>Why 16? Because it fits computers beautifully (you’ll see why in a minute). It lets us write big numbers in very few characters — <strong>FF</strong> means 255!</p>',
        guide: 'The most fun place hex shows up is colours. Let’s mix some.'
      },
      { kind: 'widget', title: '🌈 The colour mixer', intro: 'Every colour = how much Red, Green and Blue, each written in hex.', widget: 'hex-mixer', opts: {} },
      {
        kind: 'teach', emoji: '🤝', title: 'Hex is binary’s best friend',
        why: 'This is the “aha!” that ties binary, hex and decimal together.',
        body:
          '<p>Here’s the magic: <strong>16 = 2 × 2 × 2 × 2 = 2⁴</strong>. That means <strong>one hex digit is exactly four binary digits (bits)</strong>.</p>' +
          '<p>So instead of writing a long binary number like <strong>11111111</strong>, programmers split it into 4s — <strong>1111 1111</strong> — and write each group as one hex digit: <strong>F F</strong> → <strong>FF</strong>. Much shorter!</p>' +
          '<div class="nl-tip">Decimal for people, binary for machines, hex as the short-hand bridge between them.</div>',
        guide: 'Type any number below and watch it appear in binary, octal and hex — with the steps.'
      },
      { kind: 'widget', title: '🔁 See how they connect', widget: 'base-converter', opts: { value: 255 } },
      { kind: 'quiz', title: '🎯 Hex test', bankKey: 'hex-colour-lab' },
      { kind: 'milestone', title: 'Colour coded!', message: 'You can read hex, mix colours and explain why 16 loves binary. 🎨' }
    ]
  },

  /* ---------- 9-12 coming soon ---------- */
  { id: 'number-systems', num: 9, emoji: '🔢', title: 'Number Systems Converter', tagline: 'Switch between decimal, binary, octal & hex — step by step.', comingSoon: true },
  { id: 'math-tricks', num: 10, emoji: '🦸', title: 'Math Tricks & Superpowers', tagline: 'Mental-maths shortcuts & divisibility magic.', comingSoon: true },
  { id: 'real-life-numbers', num: 11, emoji: '🛒', title: 'Real-Life Numbers', tagline: 'Money, time, speed, scores & cooking.', comingSoon: true },
  { id: 'final-challenge', num: 12, emoji: '🏆', title: 'Final Challenge', tagline: 'Become a Number Master — everything combined!', comingSoon: true }
];

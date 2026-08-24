/* ==========================================================================
   HALF-YEARLY 2026 — ENGLISH ITEM BANK
   --------------------------------------------------------------------------
   Grammar is generated where a pattern exists; the two literature chapters are
   typed out from Crislyn's own class notebook so the answers she rehearses are
   word-for-word the ones her teacher accepted.

   Chapters: Unit 1 "Together We Can" (poem) · Lesson 3 "Be Smart, Be Safe"
   ========================================================================== */

(function () {
  'use strict';
  const R = window.HY.register;
  const B = window.HY.registerBank;

  /* Split a model answer into tappable phrase tiles for the "build" type. */
  function chunk(sentence, parts) {
    const words = sentence.split(' ');
    const per = Math.ceil(words.length / parts);
    const out = [];
    for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(' '));
    return out;
  }

  /* =========================================================== E1 sentences */
  const SENTENCES = [
    ['The sun rises in the east', 'declarative'],
    ['Where do you live', 'interrogative'],
    ['Please close the door', 'imperative'],
    ['What a beautiful garden this is', 'exclamatory'],
    ['My brother plays football every evening', 'declarative'],
    ['How fast that car is going', 'exclamatory'],
    ['Did you finish your homework', 'interrogative'],
    ['Stand in a line', 'imperative'],
    ['Bahrain is a small island country', 'declarative'],
    ['Hurrah We have won the match', 'exclamatory'],
    ['Why are you laughing', 'interrogative'],
    ['Bring me a glass of water', 'imperative'],
    ['The children are playing in the park', 'declarative'],
    ['What is your favourite colour', 'interrogative'],
    ['Never tell a lie', 'imperative'],
    ['Alas The old tree has fallen', 'exclamatory']
  ];
  const PUNCT = { declarative: '.', interrogative: '?', imperative: '.', exclamatory: '!' };

  R('E1', (lvl, rng) => {
    const pair = rng.pick(SENTENCES);
    const kinds = ['declarative', 'interrogative', 'imperative', 'exclamatory'];
    if (lvl >= 3 && rng() < 0.35) {
      return {
        type: 'mcq',
        // The blank must NOT show a "?" here — in a punctuation question that
        // reads as if the answer has already been filled in.
        q: `Which punctuation mark should end this sentence?<br><span class="hy-sent">${pair[0]} <span class="hy-blank">&nbsp;</span></span>`,
        options: ['.', '?', '!', ','],
        answer: ['.', '?', '!', ','].indexOf(PUNCT[pair[1]]),
        hint: 'Asking → ? &nbsp; Strong feeling → ! &nbsp; Telling or ordering → .',
        explain: `It is an <b>${pair[1]}</b> sentence, so it ends with <b>${PUNCT[pair[1]]}</b>`
      };
    }
    const opts = rng.shuffle(kinds);
    return {
      type: 'mcq',
      q: `What kind of sentence is this?<br><span class="hy-sent">${pair[0]}${PUNCT[pair[1]]}</span>`,
      options: opts, answer: opts.indexOf(pair[1]),
      hint: 'Does it tell, ask, order/request, or show sudden strong feeling?',
      explain: `<b>${pair[1].charAt(0).toUpperCase() + pair[1].slice(1)}</b> — ` + ({
        declarative: 'it tells us something and ends with a full stop.',
        interrogative: 'it asks something and ends with a question mark.',
        imperative: 'it gives an order or a request.',
        exclamatory: 'it shows a sudden strong feeling and ends with an exclamation mark.'
      })[pair[1]]
    };
  });

  /* ============================================================== E2 nouns */
  const NOUNS = [
    ['Crislyn', 'proper'], ['Bahrain', 'proper'], ['Ganga', 'proper'], ['Monday', 'proper'],
    ['Manama', 'proper'], ['Diwali', 'proper'], ['India', 'proper'],
    ['girl', 'common'], ['city', 'common'], ['river', 'common'], ['teacher', 'common'],
    ['school', 'common'], ['bicycle', 'common'], ['mountain', 'common'],
    ['herd', 'collective'], ['bunch', 'collective'], ['flock', 'collective'],
    ['team', 'collective'], ['crowd', 'collective'], ['swarm', 'collective'], ['fleet', 'collective'],
    ['gold', 'material'], ['cotton', 'material'], ['wood', 'material'],
    ['silver', 'material'], ['glass', 'material'], ['iron', 'material'],
    ['honesty', 'abstract'], ['love', 'abstract'], ['childhood', 'abstract'],
    ['bravery', 'abstract'], ['kindness', 'abstract'], ['trust', 'abstract'], ['joy', 'abstract']
  ];

  R('E2', (lvl, rng) => {
    const kinds = ['common', 'proper', 'collective', 'material', 'abstract'];
    if (lvl >= 2 && rng() < 0.35) {
      const kind = rng.pick(kinds);
      const right = NOUNS.filter(n => n[1] === kind);
      const wrong = NOUNS.filter(n => n[1] !== kind);
      const correct = rng.pick(right)[0];
      const opts = rng.shuffle([correct].concat(rng.shuffle(wrong).slice(0, 3).map(w => w[0])));
      return {
        type: 'mcq',
        q: `Which of these is a <b>${kind} noun</b>?`,
        options: opts, answer: opts.indexOf(correct),
        hint: ({
          common: 'A general name for any one of a group.',
          proper: 'A particular name — it always takes a capital letter.',
          collective: 'A name for a whole group taken together.',
          material: 'The stuff a thing is made from.',
          abstract: 'Something you cannot see or touch — a feeling or an idea.'
        })[kind],
        explain: `<b>${correct}</b> is a ${kind} noun.`
      };
    }
    const n = rng.pick(NOUNS);
    const opts = rng.shuffle(kinds);
    return {
      type: 'mcq',
      q: `What kind of noun is <span class="hy-word">${n[0]}</span>?`,
      options: opts, answer: opts.indexOf(n[1]),
      hint: 'Particular name → proper. A group → collective. What it is made of → material. A feeling or idea → abstract.',
      explain: `<b>${n[0]}</b> is a <b>${n[1]}</b> noun.`
    };
  });

  /* ================================================ E3 countable/uncountable */
  const COUNTABLE = ['apple', 'bus', 'chair', 'pencil', 'book', 'star', 'bottle', 'shoe',
    'mango', 'coin', 'window', 'egg', 'toy', 'lorry'];
  const UNCOUNTABLE = ['water', 'rice', 'air', 'milk', 'sugar', 'sand', 'honey', 'oil',
    'bread', 'salt', 'flour', 'butter', 'wool'];

  R('E3', (lvl, rng) => {
    if (lvl >= 3 && rng() < 0.4) {
      const items = rng.shuffle(COUNTABLE).slice(0, 3).concat(rng.shuffle(UNCOUNTABLE).slice(0, 3));
      return {
        type: 'sort',
        q: 'Sort these nouns.',
        buckets: [
          { name: 'Countable', items: items.filter(w => COUNTABLE.indexOf(w) > -1) },
          { name: 'Uncountable', items: items.filter(w => UNCOUNTABLE.indexOf(w) > -1) }
        ],
        hint: 'Can you say "one, two, three…" of it? Then it is countable.',
        explain: 'Countable nouns can be counted and have a plural. Uncountable nouns cannot — we measure them instead.'
      };
    }
    const un = rng() < 0.5;
    const w = rng.pick(un ? UNCOUNTABLE : COUNTABLE);
    return {
      type: 'mcq',
      q: `Is <span class="hy-word">${w}</span> countable or uncountable?`,
      options: ['Countable', 'Uncountable'], answer: un ? 1 : 0,
      hint: 'Try saying "two ' + w + 's". Does it sound right?',
      explain: un
        ? `<b>${w}</b> is <b>uncountable</b> — we measure it, we do not count it one by one.`
        : `<b>${w}</b> is <b>countable</b> — we can say one ${w}, two ${w}s.`
    };
  });

  /* =========================================================== E4 plurals */
  const PLURALS = [
    ['book', 'books'], ['bus', 'buses'], ['box', 'boxes'], ['brush', 'brushes'],
    ['watch', 'watches'], ['glass', 'glasses'], ['baby', 'babies'], ['city', 'cities'],
    ['lady', 'ladies'], ['story', 'stories'], ['boy', 'boys'], ['key', 'keys'],
    ['leaf', 'leaves'], ['knife', 'knives'], ['wolf', 'wolves'], ['thief', 'thieves'],
    ['child', 'children'], ['man', 'men'], ['woman', 'women'], ['tooth', 'teeth'],
    ['foot', 'feet'], ['mouse', 'mice'], ['goose', 'geese'], ['ox', 'oxen'],
    ['mango', 'mangoes'], ['potato', 'potatoes'], ['photo', 'photos'], ['piano', 'pianos'],
    ['sheep', 'sheep'], ['deer', 'deer']
  ];

  R('E4', (lvl, rng) => {
    const easy = PLURALS.slice(0, 12), hard = PLURALS.slice(12);
    const p = lvl === 1 ? rng.pick(easy) : (lvl === 3 ? rng.pick(hard) : rng.pick(PLURALS));
    const backwards = lvl === 3 && rng() < 0.3;
    if (backwards) {
      return {
        type: 'fill',
        q: `Write the <b>singular</b> of <span class="hy-word">${p[1]}</span>`,
        answer: p[0], accept: [p[0]],
        hint: 'Go backwards — what would just one of these be called?',
        explain: `${p[1]} → <b>${p[0]}</b>`
      };
    }
    return {
      type: 'fill',
      q: `Write the <b>plural</b> of <span class="hy-word">${p[0]}</span>`,
      answer: p[1], accept: [p[1]],
      hint: 'Ends in s/sh/ch/x → add -es. Consonant + y → -ies. f/fe → -ves. Some are just odd.',
      explain: `${p[0]} → <b>${p[1]}</b>`
    };
  });

  /* ============================================================ E5 gender */
  const GENDER = [
    ['king', 'queen'], ['lion', 'lioness'], ['uncle', 'aunt'], ['boy', 'girl'],
    ['father', 'mother'], ['brother', 'sister'], ['son', 'daughter'], ['husband', 'wife'],
    ['nephew', 'niece'], ['cock', 'hen'], ['horse', 'mare'], ['bull', 'cow'],
    ['prince', 'princess'], ['actor', 'actress'], ['waiter', 'waitress'], ['hero', 'heroine'],
    ['grandfather', 'grandmother'], ['dog', 'bitch'], ['tiger', 'tigress'], ['man', 'woman']
  ];
  const COMMON_G = ['teacher', 'doctor', 'cousin', 'student', 'friend', 'child', 'baby', 'pupil'];
  const NEUTER_G = ['table', 'book', 'stone', 'chair', 'pencil', 'window', 'river', 'cup'];

  R('E5', (lvl, rng) => {
    if (lvl >= 2 && rng() < 0.4) {
      const kinds = ['masculine', 'feminine', 'common', 'neuter'];
      const pick = rng();
      let w, kind;
      if (pick < 0.3) { w = rng.pick(GENDER)[0]; kind = 'masculine'; }
      else if (pick < 0.6) { w = rng.pick(GENDER)[1]; kind = 'feminine'; }
      else if (pick < 0.8) { w = rng.pick(COMMON_G); kind = 'common'; }
      else { w = rng.pick(NEUTER_G); kind = 'neuter'; }
      const opts = rng.shuffle(kinds);
      return {
        type: 'mcq',
        q: `What gender is <span class="hy-word">${w}</span>?`,
        options: opts, answer: opts.indexOf(kind),
        hint: 'Male → masculine. Female → feminine. Either → common. No life at all → neuter.',
        explain: `<b>${w}</b> is <b>${kind}</b> gender.`
      };
    }
    const p = rng.pick(GENDER);
    const toFem = rng() < 0.5;
    return {
      type: 'fill',
      q: `Write the <b>${toFem ? 'feminine' : 'masculine'}</b> of <span class="hy-word">${toFem ? p[0] : p[1]}</span>`,
      answer: toFem ? p[1] : p[0], accept: [toFem ? p[1] : p[0]],
      hint: 'Some change completely; some just add -ess.',
      explain: `${p[0]} — <b>${p[1]}</b>`
    };
  });

  /* ======================================================== E6 adjectives ✱ */
  const ADJ = [
    ['brave', 'quality'], ['red', 'quality'], ['tall', 'quality'], ['beautiful', 'quality'],
    ['clever', 'quality'], ['round', 'quality'], ['honest', 'quality'], ['noisy', 'quality'],
    ['some', 'quantity'], ['little', 'quantity'], ['enough', 'quantity'], ['whole', 'quantity'],
    ['much', 'quantity'], ['half', 'quantity'], ['no', 'quantity'], ['all', 'quantity'],
    ['five', 'number'], ['many', 'number'], ['few', 'number'], ['several', 'number'],
    ['first', 'number'], ['double', 'number'], ['each', 'number'],
    ['this', 'demonstrative'], ['that', 'demonstrative'], ['these', 'demonstrative'],
    ['those', 'demonstrative'],
    ['my', 'possessive'], ['your', 'possessive'], ['his', 'possessive'], ['her', 'possessive'],
    ['our', 'possessive'], ['their', 'possessive'], ['its', 'possessive'],
    ['which', 'interrogative'], ['what', 'interrogative'], ['whose', 'interrogative']
  ];

  R('E6', (lvl, rng) => {
    const kinds = ['quality', 'quantity', 'number', 'demonstrative', 'possessive', 'interrogative'];
    const a = rng.pick(ADJ);
    // Keep the mistakes she actually made in circulation as distractors.
    let opts = rng.shuffle(kinds).slice(0, 4);
    if (opts.indexOf(a[1]) === -1) { opts[0] = a[1]; opts = rng.shuffle(opts); }
    // Interrogative and demonstrative words are meaningless on their own —
    // "What kind of adjective is what?" — so show them inside a phrase.
    const CONTEXT = {
      which: 'Which book is yours?', what: 'What colour is the car?',
      whose: 'Whose pencil is this?', this: 'This mango is sweet.',
      that: 'That house is old.', these: 'These shoes are new.',
      those: 'Those birds are singing.'
    };
    const shown = CONTEXT[a[0]]
      ? `<span class="hy-sent">${CONTEXT[a[0]].replace(new RegExp('\\b' + a[0] + '\\b', 'i'),
        m => `<span class="hy-word">${m}</span>`)}</span>`
      : `<span class="hy-word">${a[0]}</span>`;
    return {
      type: 'mcq',
      q: CONTEXT[a[0]]
        ? `What kind of adjective is the highlighted word?<br>${shown}`
        : `What kind of adjective is <span class="hy-word">${a[0]}</span>?`,
      options: opts, answer: opts.indexOf(a[1]),
      hint: 'What kind? → quality. How much? → quantity. How many? → number. Which one? → demonstrative. Whose? → possessive.',
      explain: `<b>${a[0]}</b> is an adjective of <b>${a[1]}</b>.` +
        (a[1] === 'demonstrative' ? ' Remember: this, that, these, those all point out WHICH one — they are demonstrative, never possessive.' : '') +
        (a[0] === 'enough' ? ' "Enough" answers HOW MUCH, so it is quantity, not quality.' : '')
    };
  });

  B('E6', [
    {
      type: 'sort', level: 2, q: 'Sort these adjectives.',
      buckets: [
        { name: 'Demonstrative', items: ['this', 'those'] },
        { name: 'Possessive', items: ['my', 'their'] },
        { name: 'Quantity', items: ['enough', 'little'] }
      ],
      explain: 'this / those point out WHICH one → demonstrative. my / their tell WHOSE → possessive. enough / little tell HOW MUCH → quantity.'
    },
    {
      type: 'mcq', level: 3, q: 'In "<i>Those</i> mangoes are sweet", the word <b>those</b> is an adjective of …',
      options: ['possessive', 'demonstrative', 'quality', 'number'], answer: 1,
      explain: '<b>Demonstrative</b> — it points out WHICH mangoes. This is the one that was marked wrong in your book, so keep it in mind.'
    },
    {
      type: 'mcq', level: 3, q: 'In "We have <i>enough</i> chairs", the word <b>enough</b> is an adjective of …',
      options: ['quality', 'quantity', 'number', 'demonstrative'], answer: 1,
      explain: '<b>Quantity</b> — it answers HOW MUCH, not what kind.'
    },
    {
      type: 'fill', level: 2, q: 'Pick the adjective out of this sentence:<br><span class="hy-sent">The <b>brave</b> soldier saved the child.</span><br>Write it, then say nothing more.',
      answer: 'brave', accept: ['brave'], explain: '<b>brave</b> describes the soldier — an adjective of quality.'
    }
  ]);

  /* =================================================== E7 degrees of comparison */
  const DEGREES = [
    ['tall', 'taller', 'tallest'], ['big', 'bigger', 'biggest'], ['small', 'smaller', 'smallest'],
    ['fast', 'faster', 'fastest'], ['happy', 'happier', 'happiest'], ['easy', 'easier', 'easiest'],
    ['brave', 'braver', 'bravest'], ['hot', 'hotter', 'hottest'], ['thin', 'thinner', 'thinnest'],
    ['beautiful', 'more beautiful', 'most beautiful'],
    ['careful', 'more careful', 'most careful'],
    ['difficult', 'more difficult', 'most difficult'],
    ['good', 'better', 'best'], ['bad', 'worse', 'worst'], ['many', 'more', 'most'],
    ['little', 'less', 'least'], ['far', 'farther', 'farthest']
  ];

  R('E7', (lvl, rng) => {
    const set = lvl === 3 ? DEGREES.slice(9) : (lvl === 1 ? DEGREES.slice(0, 9) : DEGREES);
    const d = rng.pick(set);
    const want = rng() < 0.5 ? 1 : 2;
    const names = ['positive', 'comparative', 'superlative'];
    return {
      type: 'fill',
      q: `Write the <b>${names[want]}</b> degree of <span class="hy-word">${d[0]}</span>`,
      answer: d[want], accept: [d[want]],
      hint: 'Comparative compares TWO. Superlative compares THREE or more. Long words take more / most.',
      explain: `${d[0]} → ${d[1]} → ${d[2]}. Answer: <b>${d[want]}</b>`
    };
  });

  /* ======================================================= E8 conjunctions */
  const CONJ = [
    ['I was tired, ___ I finished my homework.', 'but', ['and', 'but', 'or', 'because'], 'Two ideas that disagree → <b>but</b>.'],
    ['She was late ___ the bus broke down.', 'because', ['because', 'but', 'or', 'and'], 'A reason → <b>because</b>.'],
    ['Would you like tea ___ coffee?', 'or', ['and', 'or', 'but', 'so'], 'A choice → <b>or</b>.'],
    ['It rained heavily, ___ the match was cancelled.', 'so', ['so', 'or', 'because', 'but'], 'A result → <b>so</b>.'],
    ['Rani ___ Meena are best friends.', 'and', ['and', 'but', 'or', 'so'], 'Adding two things → <b>and</b>.'],
    ['___ he studied hard, he did not top the class.', 'Although', ['Although', 'Because', 'And', 'So'], 'A surprising contrast → <b>although</b>.'],
    ['We waited ___ the rain stopped.', 'until', ['until', 'or', 'but', 'and'], 'Up to a point in time → <b>until</b>.'],
    ['I will call you ___ I reach home.', 'when', ['when', 'but', 'or', 'so'], 'At the time that → <b>when</b>.'],
    ['He is poor ___ honest.', 'but', ['and', 'but', 'or', 'so'], 'The two ideas contrast → <b>but</b>.'],
    ['Hurry up ___ you will miss the bus.', 'or', ['or', 'and', 'because', 'so'], 'A warning about the other choice → <b>or</b>.']
  ];

  R('E8', (lvl, rng) => {
    const c = rng.pick(CONJ);
    const opts = rng.shuffle(c[2]);
    return {
      type: 'mcq',
      q: `Choose the right conjunction:<br><span class="hy-sent">${c[0].replace('___', '<span class="hy-blank">?</span>')}</span>`,
      options: opts, answer: opts.indexOf(c[1]),
      hint: 'Is it adding, contrasting, giving a choice, or giving a reason?',
      explain: c[3]
    };
  });

  /* ================================================= E9 "Together We Can" */
  const POEM = [
    'Together we stand, strong and tall,',
    'Helping each other, we never fall.',
    'Cheering aloud, we shout and sing,',
    'Teamwork can overcome anything.',
    'Win or lose, we always share,',
    'Our bond of trust is always there.',
    'With each hand joined, the goal is near,',
    'Team spirit fills the air with cheer.',
    'Together we shine, our hearts as one,',
    "For in our team, the joy's begun!"
  ];

  R('E9', (lvl, rng) => {
    // Complete the next line of the poem.
    const i = rng.int(0, POEM.length - 2);
    const correct = POEM[i + 1];
    const others = rng.shuffle(POEM.filter((l, k) => k !== i + 1)).slice(0, 3);
    const opts = rng.shuffle([correct].concat(others));
    return {
      type: 'mcq',
      q: `Which line comes <b>next</b> in the poem?<br><span class="hy-poem">${POEM[i]}</span>`,
      options: opts, answer: opts.indexOf(correct),
      hint: 'Say the two lines out loud — the last words rhyme.',
      explain: `<span class="hy-poem">${POEM[i]}<br><b>${correct}</b></span>`
    };
  });

  B('E9', [
    {
      type: 'fill', level: 1, q: 'Complete the line:<br><span class="hy-poem">Together we stand, strong and <span class="hy-blank">?</span></span>',
      answer: 'tall', accept: ['tall'], explain: '“Together we stand, strong and <b>tall</b>,” — it rhymes with <i>fall</i>.'
    },
    {
      type: 'fill', level: 1, q: 'Complete the line:<br><span class="hy-poem">Teamwork can <span class="hy-blank">?</span> anything.</span>',
      answer: 'overcome', accept: ['overcome'], explain: '“Teamwork can <b>overcome</b> anything.”'
    },
    {
      type: 'fill', level: 2, q: 'Complete the line:<br><span class="hy-poem">Our bond of <span class="hy-blank">?</span> is always there.</span>',
      answer: 'trust', accept: ['trust'], explain: '“Our bond of <b>trust</b> is always there.”'
    },
    {
      type: 'mcq', level: 1, q: 'What is the poem "Together We Can" mainly about?',
      options: ['Winning a prize', 'Teamwork and helping each other', 'A long journey', 'Playing alone'],
      answer: 1, explain: 'It is about <b>teamwork</b> — standing together, helping each other and reaching the goal as one.'
    },
    {
      type: 'mcq', level: 2, q: 'According to the poem, what happens when each hand is joined?',
      options: ['The goal is near', 'The game ends', 'Everyone goes home', 'The team is tired'],
      answer: 0, explain: '“With each hand joined, <b>the goal is near</b>, / Team spirit fills the air with cheer.”'
    },
    {
      type: 'build', level: 2,
      q: 'Build the class answer:<br><b>What happens when you join hands with your team?</b>',
      answer: chunk('When we join hands with our team, we become stronger together and can achieve our goal with unity and teamwork.', 6),
      explain: 'When we join hands with our team, we become stronger together and can achieve our goal with unity and teamwork.'
    },
    {
      type: 'build', level: 3,
      q: 'Build the class answer:<br><b>Why is helping each other important?</b>',
      answer: chunk('Helping each other builds trust, makes tasks easier, and ensures no one feels left out. It also helps the team succeed.', 6),
      explain: 'Helping each other builds trust, makes tasks easier, and ensures no one feels left out. It also helps the team succeed.'
    },
    {
      type: 'write', level: 3,
      q: '<b>What happens when you join hands with your team?</b><br><span class="hy-sub">Write the full answer in your notebook, then check.</span>',
      model: 'When we join hands with our team, we become stronger together and can achieve our goal with unity and teamwork.'
    },
    {
      type: 'write', level: 3,
      q: '<b>Why is helping each other important?</b><br><span class="hy-sub">Write the full answer in your notebook, then check.</span>',
      model: 'Helping each other builds trust, makes tasks easier, and ensures no one feels left out. It also helps the team succeed.'
    }
  ]);

  /* ================================================ E10 "Be Smart, Be Safe" */
  B('E10', [
    {
      type: 'mcq', level: 1, q: 'Where should you cross a road?',
      options: ['Anywhere you like', 'At a zebra crossing', 'Between parked cars', 'At a bend'],
      answer: 1, explain: 'Always cross at a <b>zebra crossing</b>, where drivers expect people to cross.'
    },
    {
      type: 'order', level: 1, q: 'Put the safe crossing steps in the right order.',
      tiles: ['Look left', 'Look right', 'Look right again', 'Then cross when it is safe'],
      answer: ['Look right', 'Look left', 'Look right again', 'Then cross when it is safe'],
      explain: 'Look <b>right</b>, then <b>left</b>, then <b>right again</b> — and only cross when it is safe.'
    },
    {
      type: 'mcq', level: 1, q: 'What does a <b>red</b> traffic light mean?',
      options: ['Go', 'Get ready', 'Stop', 'Turn left'], answer: 2,
      explain: 'Red means <b>stop</b>. Yellow means get ready. Green means go.'
    },
    {
      type: 'match', level: 2, q: 'Match each traffic light to what it means.',
      pairs: [['Red', 'Stop'], ['Yellow', 'Get ready'], ['Green', 'Go']],
      explain: 'Red = stop · Yellow = get ready · Green = go.'
    },
    {
      type: 'mcq', level: 2, q: 'The footpath is meant for …',
      options: ['playing games', 'parking cars', 'walking safely', 'cycling fast'], answer: 2,
      explain: 'The footpath is meant for <b>walking safely</b> — not for playing on.'
    },
    {
      type: 'fill', level: 2, q: 'One word: a person walking in the street and not travelling in a vehicle.',
      answer: 'pedestrian', accept: ['pedestrian'],
      explain: 'A <b>pedestrian</b> is someone travelling on foot.'
    },
    {
      type: 'fill', level: 2, q: 'One word: to draw away the attention.',
      answer: 'distract', accept: ['distract'],
      explain: 'To <b>distract</b> is to pull someone\'s attention away.'
    },
    {
      type: 'build', level: 2,
      q: 'Build the class answer:<br><b>What should you do before crossing a road?</b>',
      answer: ['Before crossing a road, we should look for a zebra crossing.',
        'Then look right, then left and again right',
        'to make sure no vehicles are coming.',
        'We should cross the road only when it is safe.'],
      explain: 'Before crossing a road, we should look for a zebra crossing. Then look right, then left and again right to make sure no vehicles are coming. We should cross the road only when it is safe.'
    },
    {
      type: 'build', level: 3,
      q: 'Build the class answer:<br><b>Why should you not play on the road?</b>',
      answer: ['We should not play on the road',
        'because it can be dangerous and distracting.',
        'The footpath is meant for walking safely.'],
      explain: 'We should not play on the road because it can be dangerous and distracting. The footpath is meant for walking safely.'
    },
    {
      type: 'build', level: 3,
      q: 'Build the class answer:<br><b>Why should you hold an adult\'s hand while crossing the road?</b>',
      answer: ['We should hold an adult\'s hand',
        'to stay safe and avoid accidents.',
        'Adults can guide and protect us in traffic.'],
      explain: 'We should hold an adult\'s hand to stay safe and avoid accidents. Adults can guide and protect us in traffic.'
    },
    {
      type: 'write', level: 3,
      q: '<b>What should you do before crossing a road?</b><br><span class="hy-sub">Write the full answer in your notebook, then check.</span>',
      model: 'Before crossing a road, we should look for a zebra crossing. Then look right, then left and again right to make sure no vehicles are coming. We should cross the road only when it is safe.'
    },
    {
      type: 'write', level: 3,
      q: '<b>Why should you hold an adult\'s hand while crossing the road?</b><br><span class="hy-sub">Write the full answer in your notebook, then check.</span>',
      model: 'We should hold an adult\'s hand to stay safe and avoid accidents. Adults can guide and protect us in traffic.'
    },
    {
      type: 'tf', level: 2, q: 'It is safe to use a mobile phone while crossing the road.',
      answer: false, explain: 'False — a phone <b>distracts</b> you. Put it away and watch the traffic.'
    },
    {
      type: 'tf', level: 2, q: 'You should always wear a helmet when riding a bicycle.',
      answer: true, explain: 'True — a helmet protects your head if you fall.'
    }
  ]);

  /* ======================================== E11 chapter words & meanings */
  B('E11', [
    { type: 'fill', level: 1, q: 'One word: a shout of applause or encouragement.', answer: 'cheer', accept: ['cheer'], explain: 'A <b>cheer</b> — as in "Team spirit fills the air with cheer."' },
    { type: 'fill', level: 1, q: 'One word: to believe that someone is good and honest and will not harm you.', answer: 'trust', accept: ['trust'], explain: '<b>Trust</b> — "Our bond of trust is always there."' },
    { type: 'fill', level: 1, q: 'One word: to manage, to control or to defeat something.', answer: 'overcome', accept: ['overcome'], explain: '<b>Overcome</b> — "Teamwork can overcome anything."' },
    { type: 'mcq', level: 1, q: 'What does <b>teamwork</b> mean?', options: ['Working on your own', 'The ability of people to work together', 'Winning a prize', 'Giving orders'], answer: 1, explain: 'Teamwork is <b>the ability of people to work together</b>.' },
    { type: 'mcq', level: 2, q: 'What does <b>goal</b> mean?', options: ['A close connection', 'Something you hope to achieve in the future', 'A loud shout', 'A safe place'], answer: 1, explain: 'A goal is <b>something that you hope to achieve in the future</b>.' },
    { type: 'mcq', level: 2, q: 'What does <b>bond</b> mean?', options: ['A close connection between individuals', 'A kind of rope', 'A traffic sign', 'A team captain'], answer: 0, explain: 'A bond is <b>a close connection between individuals</b>.' },
    { type: 'mcq', level: 2, q: 'What does <b>install</b> mean?', options: ['To break something', 'To place in position ready for use', 'To run quickly', 'To ask a question'], answer: 1, explain: 'To install is <b>to place in position ready for use</b>.' },
    { type: 'mcq', level: 2, q: 'What does <b>regulate</b> mean?', options: ['To control the rate or speed of a machine or process', 'To draw a picture', 'To cross a road', 'To make a noise'], answer: 0, explain: 'To regulate is <b>to control the rate or speed of a machine or process</b>.' },
    { type: 'fill', level: 2, q: 'What does <b>safety</b> mean? "The condition of being <span class="hy-blank">?</span>"', answer: 'safe', accept: ['safe'], explain: 'Safety is <b>the condition of being safe</b>.' },
    { type: 'fill', level: 1, q: 'Write the opposite: <span class="hy-word">strong</span>', answer: 'weak', accept: ['weak', 'fragile'], explain: 'strong × <b>weak / fragile</b>' },
    { type: 'fill', level: 1, q: 'Write the opposite: <span class="hy-word">win</span>', answer: 'lose', accept: ['lose'], explain: 'win × <b>lose</b>' },
    { type: 'fill', level: 1, q: 'Write the opposite: <span class="hy-word">aloud</span>', answer: 'quietly', accept: ['quietly', 'silently'], explain: 'aloud × <b>quietly</b>' },
    { type: 'fill', level: 2, q: 'Write the opposite: <span class="hy-word">joy</span>', answer: 'sorrow', accept: ['sorrow', 'sadness'], explain: 'joy × <b>sorrow</b>' },
    { type: 'fill', level: 2, q: 'Write the opposite: <span class="hy-word">busy</span>', answer: 'idle', accept: ['idle', 'free'], explain: 'busy × <b>idle</b>' },
    { type: 'fill', level: 2, q: 'Write the opposite: <span class="hy-word">simple</span>', answer: 'complicated', accept: ['complicated', 'difficult', 'complex'], explain: 'simple × <b>complicated / difficult</b>' },
    { type: 'fill', level: 3, q: 'Write the opposite: <span class="hy-word">often</span>', answer: 'rarely', accept: ['rarely', 'seldom'], explain: 'often × <b>rarely</b>' },
    { type: 'fill', level: 3, q: 'Write the opposite: <span class="hy-word">distract</span>', answer: 'concentrate', accept: ['concentrate', 'focus'], explain: 'distract × <b>concentrate</b>' },
    { type: 'match', level: 3, q: 'Match each word to its opposite.', pairs: [['strong', 'weak'], ['tall', 'short'], ['win', 'lose'], ['aloud', 'quietly'], ['joy', 'sorrow']], explain: 'These are the five antonyms from your "Together We Can" notebook page.' }
  ]);

  /* =================================================== E12 comprehension */
  B('E12', [
    {
      type: 'passage', level: 1,
      passage: `<p>Amal lives in a small village near the sea. Every morning he walks to the beach with
        his grandfather to watch the fishing boats come in. The boats are painted bright blue and yellow.
        Amal helps his grandfather carry the nets, and afterwards they share a breakfast of bread and dates
        under an old palm tree.</p>`,
      questions: [
        { q: 'Where does Amal live?', answer: 'in a small village near the sea', accept: ['small village near the sea', 'a small village near the sea', 'near the sea', 'in a village near the sea'], model: 'Amal lives in a small village near the sea.' },
        { q: 'Who does Amal walk to the beach with?', answer: 'his grandfather', accept: ['his grandfather', 'grandfather'], model: 'Amal walks to the beach with his grandfather.' },
        { q: 'What colours are the boats painted?', answer: 'bright blue and yellow', accept: ['blue and yellow', 'bright blue and yellow'], model: 'The boats are painted bright blue and yellow.' },
        { q: 'What do they eat for breakfast?', answer: 'bread and dates', accept: ['bread and dates'], model: 'They eat bread and dates for breakfast.' }
      ],
      explain: 'Answer in a full sentence, starting with words borrowed from the question.'
    },
    {
      type: 'passage', level: 2,
      passage: `<p>The peacock is the national bird of India. It has a long neck and a crown of feathers
        on its head. When it spreads its tail, the feathers open like a beautiful fan with blue and green
        eyes on them. Peacocks dance before the rains come. Only the male bird has the bright tail;
        the female, called a peahen, is brown and much plainer.</p>`,
      questions: [
        { q: 'Which country has the peacock as its national bird?', answer: 'india', accept: ['india'], model: 'India has the peacock as its national bird.' },
        { q: 'What is a female peacock called?', answer: 'peahen', accept: ['peahen', 'a peahen'], model: 'A female peacock is called a peahen.' },
        { q: 'When do peacocks dance?', answer: 'before the rains come', accept: ['before the rains', 'before the rains come', 'before it rains'], model: 'Peacocks dance before the rains come.' },
        { q: 'Which bird has the bright tail — the male or the female?', answer: 'the male', accept: ['male', 'the male', 'the male bird'], model: 'Only the male bird has the bright tail.' }
      ],
      explain: 'Every answer was hiding in the passage — underline it before you write.'
    },
    {
      type: 'passage', level: 3,
      passage: `<p>Long ago, a thirsty crow flew about looking for water. At last he found a pitcher with
        a little water at the bottom. His beak could not reach it. The crow thought for a while. Then he
        picked up small pebbles one by one and dropped them into the pitcher. Slowly the water rose to the
        top and the clever crow drank his fill and flew away happily.</p>`,
      questions: [
        { q: 'What was the crow looking for?', answer: 'water', accept: ['water'], model: 'The crow was looking for water.' },
        { q: 'Why could the crow not drink the water?', answer: 'his beak could not reach it', accept: ['his beak could not reach it', 'beak could not reach', 'the water was too low'], model: 'The crow could not drink because his beak could not reach the water.' },
        { q: 'What did the crow drop into the pitcher?', answer: 'small pebbles', accept: ['pebbles', 'small pebbles', 'stones'], model: 'The crow dropped small pebbles into the pitcher.' },
        { q: 'What lesson does this story teach us?', answer: 'think', accept: ['think', 'thinking', 'cleverness', 'be clever', 'use your brain', 'where there is a will there is a way'], model: 'It teaches us that thinking cleverly helps us solve difficult problems.' }
      ],
      explain: 'The last question asks for the moral — say it in your own words, in one full sentence.'
    }
  ]);

  /* =================================================== E13 informal letter */
  B('E13', [
    {
      type: 'order', level: 1, q: 'Put the parts of an informal letter in the right order, top to bottom.',
      tiles: ['Salutation — Dear Grandma,', 'Your address', 'Body — what you want to say',
        'Date', 'Closing — With love,', 'Your name'],
      answer: ['Your address', 'Date', 'Salutation — Dear Grandma,', 'Body — what you want to say',
        'Closing — With love,', 'Your name'],
      explain: 'Address → Date → Salutation → Body → Closing → Your name.'
    },
    {
      type: 'mcq', level: 1, q: 'Where does the <b>date</b> go in an informal letter?',
      options: ['At the very bottom', 'Just under your address', 'After the salutation', 'In the middle of the body'],
      answer: 1, explain: 'The date goes <b>just under your address</b>, at the top.'
    },
    {
      type: 'mcq', level: 2, q: 'Which closing suits a letter to your <b>cousin</b>?',
      options: ['Yours faithfully,', 'With love,', 'Yours sincerely,', 'Respected Sir,'],
      answer: 1, explain: '"With love," or "Yours lovingly," suits family and friends. "Yours faithfully" belongs in a formal letter.'
    },
    {
      type: 'mcq', level: 2, q: 'Which salutation is correct for an informal letter to a friend?',
      options: ['Dear Sir,', 'Respected Madam,', 'Dear Aisha,', 'To whom it may concern,'],
      answer: 2, explain: 'Use the person\'s name: <b>Dear Aisha,</b> — always with a comma after it.'
    },
    {
      // Asked as a choice, not a typed answer: a lone comma is impossible to
      // type-match reliably (the marker strips punctuation before comparing).
      type: 'mcq', level: 2, q: 'Which punctuation mark comes after the salutation <b>Dear Grandma</b>?',
      options: ['A comma  ,', 'A full stop  .', 'A colon  :', 'Nothing at all'], answer: 0,
      explain: 'A <b>comma</b> — Dear Grandma<b>,</b>'
    },
    {
      type: 'write', level: 3,
      q: '<b>Write a short letter to your grandmother telling her about your Half-Yearly exam.</b><br><span class="hy-sub">Use all six parts. Write it in your notebook, then check against the model.</span>',
      model: `14, Al Zahra Street, Manama, Bahrain
23rd August 2026

Dear Grandma,

I hope you are keeping well. My Half-Yearly examination starts in the middle of September. I am revising Maths, English and Hindi every day, and I like the Geometry chapter the best.

Please pray for me. I will write again after my exams are over. Give my love to Grandpa.

With love,
Crislyn`
    }
  ]);
})();

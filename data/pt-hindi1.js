/* ============================================================
   Crislyn's World — HINDI PERIODIC TEST 1
   पाठ ६ · आम का पेड़ (The Mango Tree)

   This is the ONLY file that changes per chapter. The slide engine
   (js/hindi-journey.js) and styles (css/hindi-journey.css) are
   chapter-agnostic — a future Hindi test ships as data/pt-hindiN.js
   with the same schema + one line in periodic-hindi.html.

   Teaching model (read-first, never spoon-fed):
     discover (meaning shown ONCE) -> readCheck (Hindi only, read aloud,
     🔊 = "check my reading") -> guessMeaning (attempt before reveal)
     -> trace -> copy -> match -> choose/fill -> miniTest -> milestone.
   Answer-writing objective: answerBuild (tap tiles in order) ->
     traceAnswer (trace clause by clause) -> recall ("write it on paper").
   ============================================================ */
(function () {
  'use strict';

  // ---- Words (defined once; Devanagari spelt here only) ----------------
  const W = {
    // Mission 1 — शब्दार्थ
    pratidin: { hi: 'प्रतिदिन', roman: 'pratidin', en: 'every day', emoji: '📅' },
    kompal:   { hi: 'कोंपल',    roman: 'kompal',   en: 'a tender new leaf', emoji: '🌱' },
    nanha:    { hi: 'नन्हा',    roman: 'nanha',    en: 'tiny / smallest', emoji: '🐣' },
    dekhbhal: { hi: 'देखभाल',   roman: 'dekhbhaal', en: 'to take care', emoji: '🤲' },
    avashya:  { hi: 'अवश्य',    roman: 'avashya',  en: 'surely / for sure', emoji: '✅' },
    varsha:   { hi: 'वर्षा',    roman: 'varsha',   en: 'rain', emoji: '🌧️' },
    // Mission 2 — विलोम (antonyms)
    thoda:    { hi: 'थोड़ा',    roman: 'thoda',    en: 'a little', emoji: '🤏' },
    zyada:    { hi: 'ज़्यादा',  roman: 'zyada',    en: 'more / a lot', emoji: '➕' },
    prasann:  { hi: 'प्रसन्न',  roman: 'prasann',  en: 'happy', emoji: '😄' },
    niraash:  { hi: 'निराश',   roman: 'niraash',  en: 'sad / let down', emoji: '😔' },
    pyaar:    { hi: 'प्यार',    roman: 'pyaar',    en: 'love', emoji: '❤️' },
    ghrina:   { hi: 'घृणा',     roman: 'ghrina',   en: 'hate', emoji: '💢' },
    turant:   { hi: 'तुरंत',    roman: 'turant',   en: 'at once', emoji: '⚡' },
    deri:     { hi: 'देरी से',  roman: 'deri se',  en: 'late / slowly', emoji: '🐢' },
    saamne:   { hi: 'सामने',    roman: 'saamne',   en: 'in front', emoji: '⬆️' },
    peeche:   { hi: 'पीछे',     roman: 'peeche',   en: 'behind', emoji: '⬇️' },
    // Mission 3 — पर्यायवाची (synonyms)
    subah:    { hi: 'सुबह',     roman: 'subah',    en: 'morning', emoji: '🌅' },
    savera:   { hi: 'सवेरा',    roman: 'savera',   en: 'morning', emoji: '🌄' },
    praatah:  { hi: 'प्रातः',   roman: 'praatah',  en: 'morning', emoji: '🌇' },
    bageecha: { hi: 'बगीचा',    roman: 'bageecha', en: 'garden', emoji: '🌷' },
    vaatika:  { hi: 'वाटिका',   roman: 'vaatika',  en: 'garden', emoji: '🏡' },
    baag:     { hi: 'बाग',      roman: 'baag',     en: 'garden', emoji: '🌳' },
    paani:    { hi: 'पानी',     roman: 'paani',    en: 'water', emoji: '💧' },
    jal:      { hi: 'जल',       roman: 'jal',      en: 'water', emoji: '🚰' },
    neer:     { hi: 'नीर',      roman: 'neer',     en: 'water', emoji: '💦' },
    // Mission 4 — root vegetables
    gaajar:   { hi: 'गाजर',     roman: 'gaajar',   en: 'carrot', emoji: '🥕' },
    mooli:    { hi: 'मूली',     roman: 'mooli',    en: 'radish', emoji: '🥬' },
    chukandar:{ hi: 'चुकंदर',   roman: 'chukandar', en: 'beetroot', emoji: '🍠' },
    shalgam:  { hi: 'शलगम',     roman: 'shalgam',  en: 'turnip', emoji: '🧅' },
    shakarkand:{ hi: 'शकरकंद',  roman: 'shakarkand', en: 'sweet potato', emoji: '🍠' },
    // Mission 5 — make-a-sentence words
    udaas:    { hi: 'उदास',     roman: 'udaas',    en: 'sad', emoji: '😢' },
    // People (Mission 6)
    saurabh:  { hi: 'सौरभ',     roman: 'Saurabh',  en: 'Saurabh (the boy)', emoji: '👦' },
    priya:    { hi: 'प्रिया',   roman: 'Priya',    en: 'Priya (his sister)', emoji: '👧' },
    pitaji:   { hi: 'पिताजी',   roman: 'pitaji',   en: 'Father', emoji: '👨' },
  };

  // ---- Slide builder helpers (keep the data DRY + correct) -------------
  let _n = 0;
  const uid = (p) => `${p}-${++_n}`;

  const discover = (w, note) => ({ kind: 'discover', id: uid('disc-' + w.roman), word: w, note: note || '' });
  const readCheck = (w) => ({ kind: 'readCheck', id: uid('read-' + w.roman), word: w });
  // options are English meanings; answer is index of the correct one (engine shuffles)
  const guess = (w, distractors) => ({
    kind: 'guessMeaning', id: uid('guess-' + w.roman), word: w,
    options: [w.en, ...distractors], answer: 0
  });
  const trace = (w) => ({ kind: 'trace', id: uid('trace-' + w.roman), word: w });
  const copy = (w) => ({ kind: 'copy', id: uid('copy-' + w.roman), word: w });
  const milestone = (headline, stickerId, label, stars) =>
    ({ kind: 'milestone', id: uid('done'), headline, sticker: { id: stickerId, label }, stars });
  const intro = (emoji, headline, body) => ({ kind: 'intro', id: uid('intro'), emoji, headline, body });

  /* =====================================================================
     MISSION 1 — Word Meanings · शब्दार्थ
     ===================================================================== */
  const m1Words = [W.pratidin, W.kompal, W.nanha, W.dekhbhal, W.avashya, W.varsha];
  const m1 = {
    id: 'm1-shabdarth', title: 'Word Meanings', titleHi: 'शब्दार्थ', emoji: '📖', estMin: 12,
    words: m1Words.map(w => w.hi),
    steps: [
      intro('📖', 'Mission 1 · New Words', 'Meet 6 new words from the story. Look, listen, read, trace — then play a matching game! 🌱'),
      // discover all 6 (meaning shown once)
      ...m1Words.map(w => discover(w)),
      // read-first: read aloud + check, then attempt the meaning
      readCheck(W.pratidin), guess(W.pratidin, ['rain', 'a garden']),
      readCheck(W.kompal),   guess(W.kompal, ['a big tree', 'rain']),
      readCheck(W.nanha),    guess(W.nanha, ['very big', 'every day']),
      readCheck(W.dekhbhal), guess(W.dekhbhal, ['to run away', 'to sleep']),
      readCheck(W.avashya),  guess(W.avashya, ['maybe', 'never']),
      readCheck(W.varsha),   guess(W.varsha, ['sunshine', 'a tiny leaf']),
      // tracing + copying
      trace(W.varsha), trace(W.pratidin), copy(W.nanha),
      // matching: word -> meaning
      {
        kind: 'match', id: uid('m1-match'), title: 'Match each word to its meaning',
        pairs: [
          { left: { hi: 'प्रतिदिन', roman: 'pratidin' }, right: { en: 'every day' } },
          { left: { hi: 'कोंपल', roman: 'kompal' }, right: { en: 'tender new leaf' } },
          { left: { hi: 'नन्हा', roman: 'nanha' }, right: { en: 'tiny' } },
          { left: { hi: 'देखभाल', roman: 'dekhbhaal' }, right: { en: 'to take care' } },
          { left: { hi: 'अवश्य', roman: 'avashya' }, right: { en: 'surely' } },
          { left: { hi: 'वर्षा', roman: 'varsha' }, right: { en: 'rain' } },
        ]
      },
      // choose + fill
      {
        kind: 'choose', id: uid('m1-choose'), prompt: 'Which word means "rain"?',
        options: [{ hi: 'वर्षा' }, { hi: 'अवश्य' }, { hi: 'नन्हा' }], answer: 0,
        explain: 'वर्षा (varsha) = rain. 🌧️'
      },
      {
        kind: 'fill', id: uid('m1-fill'), title: 'Tap the word that fits',
        prompt: 'हम पौधे की ____ करेंगे।  (We will take ____ of the plant.)',
        bank: [{ hi: 'देखभाल' }, { hi: 'वर्षा' }, { hi: 'कोंपल' }], answer: 'देखभाल',
        explain: 'देखभाल = to take care. 🤲'
      },
      {
        kind: 'miniTest', id: uid('m1-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: 'प्रतिदिन means…', options: [{ en: 'every day' }, { en: 'rain' }, { en: 'tiny' }], answer: 0 },
          { kind: 'choose', prompt: 'Which word means "tiny"?', options: [{ hi: 'नन्हा' }, { hi: 'वर्षा' }, { hi: 'अवश्य' }], answer: 0 },
          { kind: 'fill', prompt: 'अवश्य means ____', bank: [{ en: 'surely' }, { en: 'every day' }, { en: 'rain' }], answer: 'surely' },
        ]
      },
      milestone('Mission 1 complete! You met 6 new words! 🎉', 'pt-hindi1-m1', 'Word Explorer', 10),
    ]
  };

  /* =====================================================================
     MISSION 2 — Opposites · विलोम शब्द
     ===================================================================== */
  const m2Pairs = [
    [W.thoda, W.zyada], [W.prasann, W.niraash], [W.pyaar, W.ghrina],
    [W.turant, W.deri], [W.saamne, W.peeche],
  ];
  const m2 = {
    id: 'm2-vilom', title: 'Opposites', titleHi: 'विलोम शब्द', emoji: '⚖️', estMin: 12,
    words: m2Pairs.flat().map(w => w.hi),
    steps: [
      intro('⚖️', 'Mission 2 · Opposites', 'Opposite words are like day and night! Learn 5 pairs that mean the opposite of each other. 🌗'),
      // discover each pair (both words), with an "opposite of" note
      ...m2Pairs.flatMap(([a, b]) => [
        discover(a, `The opposite of "${b.en}".`),
        discover(b, `The opposite of "${a.en}".`),
      ]),
      // read + guess a few
      readCheck(W.prasann), guess(W.prasann, ['sad', 'behind']),
      readCheck(W.saamne),  guess(W.saamne, ['behind', 'love']),
      readCheck(W.pyaar),   guess(W.pyaar, ['hate', 'a little']),
      // trace + copy
      trace(W.pyaar), trace(W.saamne), copy(W.prasann),
      // match each word to its OPPOSITE
      {
        kind: 'match', id: uid('m2-match'), title: 'Match each word to its opposite',
        pairs: [
          { left: { hi: 'थोड़ा', roman: 'thoda' }, right: { hi: 'ज़्यादा' } },
          { left: { hi: 'प्रसन्न', roman: 'prasann' }, right: { hi: 'निराश' } },
          { left: { hi: 'प्यार', roman: 'pyaar' }, right: { hi: 'घृणा' } },
          { left: { hi: 'तुरंत', roman: 'turant' }, right: { hi: 'देरी से' } },
          { left: { hi: 'सामने', roman: 'saamne' }, right: { hi: 'पीछे' } },
        ]
      },
      {
        kind: 'choose', id: uid('m2-choose1'), prompt: 'What is the opposite of प्रसन्न (happy)?',
        options: [{ hi: 'निराश' }, { hi: 'प्यार' }, { hi: 'तुरंत' }], answer: 0,
        explain: 'प्रसन्न (happy) ↔ निराश (sad).'
      },
      {
        kind: 'choose', id: uid('m2-choose2'), prompt: 'What is the opposite of सामने (in front)?',
        options: [{ hi: 'पीछे' }, { hi: 'थोड़ा' }, { hi: 'घृणा' }], answer: 0,
        explain: 'सामने (in front) ↔ पीछे (behind).'
      },
      {
        kind: 'miniTest', id: uid('m2-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: 'Opposite of थोड़ा?', options: [{ hi: 'ज़्यादा' }, { hi: 'पीछे' }, { hi: 'प्यार' }], answer: 0 },
          { kind: 'choose', prompt: 'Opposite of प्यार (love)?', options: [{ hi: 'घृणा' }, { hi: 'सामने' }, { hi: 'निराश' }], answer: 0 },
          { kind: 'choose', prompt: 'तुरंत (at once) is the opposite of…', options: [{ hi: 'देरी से' }, { hi: 'ज़्यादा' }, { hi: 'पीछे' }], answer: 0 },
        ]
      },
      milestone('Mission 2 complete! You are an Opposite Master! ⚖️', 'pt-hindi1-m2', 'Opposite Master', 10),
    ]
  };

  /* =====================================================================
     MISSION 3 — Same-Meaning Words · पर्यायवाची
     ===================================================================== */
  const m3 = {
    id: 'm3-paryayvachi', title: 'Same-Meaning Words', titleHi: 'पर्यायवाची शब्द', emoji: '🌅', estMin: 11,
    words: [W.subah, W.savera, W.praatah, W.bageecha, W.vaatika, W.baag, W.paani, W.jal, W.neer].map(w => w.hi),
    steps: [
      intro('🌅', 'Mission 3 · Word Friends', 'Some words are "friends" — they mean the SAME thing! Learn 3 word families. 👭'),
      discover(W.subah, 'Other words for morning: सवेरा, प्रातः.'),
      discover(W.savera, 'Means morning, like सुबह.'),
      discover(W.praatah, 'Means morning, like सुबह.'),
      discover(W.bageecha, 'Other words for garden: वाटिका, बाग.'),
      discover(W.baag, 'Means garden, like बगीचा.'),
      discover(W.paani, 'Other words for water: जल, नीर.'),
      discover(W.jal, 'Means water, like पानी.'),
      discover(W.neer, 'Means water, like पानी.'),
      readCheck(W.savera), guess(W.savera, ['water', 'garden']),
      readCheck(W.baag),   guess(W.baag, ['morning', 'water']),
      readCheck(W.jal),    guess(W.jal, ['garden', 'morning']),
      trace(W.jal), trace(W.baag), copy(W.subah),
      // group-bucket match: each synonym -> its head word
      {
        kind: 'match', id: uid('m3-match'), title: 'Match each word to its family',
        pairs: [
          { left: { hi: 'सवेरा', roman: 'savera' }, right: { hi: 'सुबह', en: '(morning)' } },
          { left: { hi: 'वाटिका', roman: 'vaatika' }, right: { hi: 'बगीचा', en: '(garden)' } },
          { left: { hi: 'जल', roman: 'jal' }, right: { hi: 'पानी', en: '(water)' } },
          { left: { hi: 'नीर', roman: 'neer' }, right: { hi: 'पानी', en: '(water)' } },
          { left: { hi: 'बाग', roman: 'baag' }, right: { hi: 'बगीचा', en: '(garden)' } },
        ]
      },
      {
        kind: 'choose', id: uid('m3-choose1'), prompt: 'Which word also means पानी (water)?',
        options: [{ hi: 'जल' }, { hi: 'सवेरा' }, { hi: 'बाग' }], answer: 0,
        explain: 'पानी = जल = नीर (all mean water). 💧'
      },
      {
        kind: 'choose', id: uid('m3-choose2'), prompt: 'सवेरा and प्रातः both mean…',
        options: [{ en: 'morning' }, { en: 'garden' }, { en: 'water' }], answer: 0,
        explain: 'सुबह = सवेरा = प्रातः (all mean morning). 🌅'
      },
      {
        kind: 'miniTest', id: uid('m3-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: 'वाटिका means the same as…', options: [{ hi: 'बगीचा' }, { hi: 'पानी' }, { hi: 'सुबह' }], answer: 0 },
          { kind: 'choose', prompt: 'Which means water?', options: [{ hi: 'नीर' }, { hi: 'सवेरा' }, { hi: 'बाग' }], answer: 0 },
          { kind: 'choose', prompt: 'प्रातः means…', options: [{ en: 'morning' }, { en: 'water' }, { en: 'garden' }], answer: 0 },
        ]
      },
      milestone('Mission 3 complete! Word friends unlocked! 🌅', 'pt-hindi1-m3', 'Word-Friends Star', 10),
    ]
  };

  /* =====================================================================
     MISSION 4 — Questions & Answers · प्रश्न-उत्तर  (core writing mission)
     ===================================================================== */
  const m4 = {
    id: 'm4-prashn-uttar', title: 'Questions & Answers', titleHi: 'प्रश्न-उत्तर', emoji: '🥭', estMin: 15,
    words: [W.gaajar, W.mooli, W.chukandar, W.shalgam, W.shakarkand].map(w => w.hi),
    steps: [
      intro('🥭', 'Mission 4 · Answer the Questions', 'These are the questions from class. We will learn each answer, build it, trace it — then YOU write it! ✍️ (You can read the full story too.)'),
      // pre-teach root vegetables
      discover(W.gaajar), discover(W.mooli), discover(W.chukandar), discover(W.shalgam), discover(W.shakarkand),
      readCheck(W.gaajar), guess(W.gaajar, ['radish', 'turnip']),
      trace(W.mooli),

      // Q1
      {
        kind: 'choose', id: uid('m4-q1-choose'),
        prompt: 'आम खाकर सौरभ के मन में क्या विचार आया?', promptEn: 'After eating the mango, what did Saurabh think?',
        options: [
          { hi: 'वह भी मीठे आम के पेड़ अपने बगीचे में लगाएगा।', en: 'He will also plant sweet mango trees in his garden.' },
          { hi: 'वह आम बेचकर पैसे कमाएगा।', en: 'He will sell mangoes for money.' },
          { hi: 'वह कभी आम नहीं खाएगा।', en: 'He will never eat mangoes.' },
        ], answer: 0
      },
      {
        kind: 'answerBuild', id: uid('m4-q1-build'),
        question: 'आम खाकर सौरभ के मन में क्या विचार आया?',
        questionEn: 'Build the answer: tap the words in the right order.',
        answer: ['वह', 'भी', 'मीठे', 'आम', 'के', 'पेड़', 'लगाएगा।'],
        hintEn: 'He will also plant sweet mango trees.'
      },
      {
        kind: 'traceAnswer', id: uid('m4-q1-trace'),
        clauses: ['वह भी मीठे आम के', 'पेड़ लगाएगा।'],
        en: 'He will also plant sweet mango trees.'
      },
      {
        kind: 'recall', id: uid('m4-q1-recall'),
        prompt: 'आम खाकर सौरभ के मन में क्या विचार आया?',
        modelHi: 'वह भी मीठे आम के पेड़ अपने बगीचे में लगाएगा।',
        modelEn: 'He will also plant sweet mango trees in his garden.'
      },

      // Q2
      {
        kind: 'choose', id: uid('m4-q2-choose'),
        prompt: 'पिताजी ने पौधे के बारे में क्या बताया?', promptEn: 'What did Father tell about the plant?',
        options: [
          { hi: 'बड़ा होने में चार-पाँच वर्ष लगेंगे, फिर आम लगेंगे।', en: 'It takes 4–5 years to grow, then mangoes will come.' },
          { hi: 'यह कल ही बड़ा हो जाएगा।', en: 'It will grow up tomorrow.' },
          { hi: 'यह पौधा कभी बड़ा नहीं होगा।', en: 'This plant will never grow.' },
        ], answer: 0
      },
      {
        kind: 'answerBuild', id: uid('m4-q2-build'),
        question: 'पौधे को बड़ा होने में कितना समय लगेगा?',
        questionEn: 'Build the answer: how long to grow?',
        answer: ['पौधे', 'को', 'चार', 'से', 'पाँच', 'वर्ष', 'लगेंगे।'],
        hintEn: 'The plant will take four to five years.'
      },
      {
        kind: 'recall', id: uid('m4-q2-recall'),
        prompt: 'पिताजी ने पौधे के बारे में क्या बताया?',
        modelHi: 'छोटे पौधे को बड़ा होने में चार से पाँच वर्ष लगेंगे, फिर उस पर आम लगेंगे।',
        modelEn: 'The small plant takes four to five years to grow, then mangoes will grow on it.'
      },

      // Q3 — the 5 root vegetables (answerBuild fits perfectly)
      {
        kind: 'answerBuild', id: uid('m4-q3-build'),
        question: 'जड़ों से मिलने वाली पाँच सब्ज़ियाँ कौन-सी हैं?',
        questionEn: 'Build the answer: 5 vegetables that come from roots.',
        answer: ['गाजर', 'मूली', 'चुकंदर', 'शलगम', 'शकरकंद'],
        hintEn: 'carrot, radish, beetroot, turnip, sweet potato'
      },
      {
        kind: 'recall', id: uid('m4-q3-recall'),
        prompt: 'जड़ों से प्राप्त पाँच सब्ज़ियों के नाम लिखिए।',
        modelHi: 'गाजर, मूली, चुकंदर, शलगम, शकरकंद।',
        modelEn: 'Carrot, radish, beetroot, turnip, sweet potato.'
      },

      // Q4
      {
        kind: 'choose', id: uid('m4-q4-choose'),
        prompt: 'सौरभ ने पानी डालना क्यों बंद कर दिया?', promptEn: 'Why did Saurabh stop watering?',
        options: [
          { hi: 'क्योंकि आम का पौधा नहीं निकल रहा था।', en: 'Because the mango plant was not sprouting.' },
          { hi: 'क्योंकि पानी खत्म हो गया था।', en: 'Because the water ran out.' },
          { hi: 'क्योंकि वह थक गया था।', en: 'Because he was tired.' },
        ], answer: 0
      },
      {
        kind: 'recall', id: uid('m4-q4-recall'),
        prompt: 'सौरभ ने पानी डालना क्यों बंद कर दिया?',
        modelHi: 'क्योंकि आम का पौधा नहीं निकल रहा था।',
        modelEn: 'Because the mango plant was not sprouting.'
      },

      {
        kind: 'miniTest', id: uid('m4-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: 'How long for the plant to grow?', options: [{ en: '4–5 years' }, { en: '1 day' }, { en: '10 years' }], answer: 0 },
          { kind: 'choose', prompt: 'Which is a root vegetable?', options: [{ hi: 'गाजर' }, { hi: 'आम' }, { hi: 'पानी' }], answer: 0 },
          { kind: 'choose', prompt: 'Why did Saurabh stop watering?', options: [{ en: 'the plant was not sprouting' }, { en: 'he was tired' }, { en: 'no water' }], answer: 0 },
        ]
      },
      milestone('Mission 4 complete! You can answer AND write them! 🥭', 'pt-hindi1-m4', 'Story Detective', 14),
    ]
  };

  /* =====================================================================
     MISSION 5 — Make a Sentence · वाक्य बनाओ
     ===================================================================== */
  const m5 = {
    id: 'm5-vakya', title: 'Make a Sentence', titleHi: 'वाक्य बनाओ', emoji: '✏️', estMin: 12,
    words: [W.dekhbhal.hi, W.udaas.hi],
    steps: [
      intro('✏️', 'Mission 5 · Make a Sentence', 'Use the word in a sentence — just like in the test! Build it, then write it. ✍️'),
      discover(W.dekhbhal, 'We will use this in a sentence.'),
      discover(W.udaas, 'We will use this in a sentence.'),
      readCheck(W.udaas), guess(W.udaas, ['happy', 'rain']),
      trace(W.udaas),

      // देखभाल sentence
      {
        kind: 'choose', id: uid('m5-dk-choose'), prompt: 'Which sentence uses देखभाल correctly?',
        options: [
          { hi: 'माँ बच्चों की देखभाल करती है।', en: 'Mother takes care of the children.' },
          { hi: 'माँ आम को देखभाल खाती है।', en: '(not correct)' },
        ], answer: 0
      },
      {
        kind: 'answerBuild', id: uid('m5-dk-build'),
        question: 'वाक्य बनाओ — देखभाल', questionEn: 'Build a sentence using देखभाल.',
        answer: ['माँ', 'बच्चों', 'की', 'देखभाल', 'करती', 'है।'],
        hintEn: 'Mother takes care of the children.'
      },
      {
        kind: 'recall', id: uid('m5-dk-recall'),
        prompt: 'देखभाल — अपना वाक्य लिखो।', modelHi: 'माँ बच्चों की देखभाल करती है।',
        modelEn: 'Mother takes care of the children.'
      },

      // उदास sentence
      {
        kind: 'fill', id: uid('m5-ud-fill'), title: 'Tap the word that fits',
        prompt: 'खिलौना टूट जाने पर राम ____ हो गया।  (Ram became ____ when the toy broke.)',
        bank: [{ hi: 'उदास' }, { hi: 'प्रसन्न' }, { hi: 'वर्षा' }], answer: 'उदास',
        explain: 'उदास = sad. 😢'
      },
      {
        kind: 'answerBuild', id: uid('m5-ud-build'),
        question: 'वाक्य बनाओ — उदास', questionEn: 'Build a sentence using उदास.',
        answer: ['खिलौना', 'टूटने', 'पर', 'राम', 'उदास', 'हुआ।'],
        hintEn: 'Ram became sad when the toy broke.'
      },
      {
        kind: 'recall', id: uid('m5-ud-recall'),
        prompt: 'उदास — अपना वाक्य लिखो।', modelHi: 'खिलौना टूट जाने पर राम उदास हो गया।',
        modelEn: 'Ram became sad when the toy broke.'
      },

      {
        kind: 'miniTest', id: uid('m5-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: 'देखभाल means…', options: [{ en: 'to take care' }, { en: 'to run' }, { en: 'rain' }], answer: 0 },
          { kind: 'fill', prompt: 'जब खिलौना टूटा तो राम ____ हुआ।', bank: [{ hi: 'उदास' }, { hi: 'प्रसन्न' }], answer: 'उदास' },
          { kind: 'choose', prompt: 'उदास means…', options: [{ en: 'sad' }, { en: 'happy' }, { en: 'tiny' }], answer: 0 },
        ]
      },
      milestone('Mission 5 complete! You are a Sentence Builder! ✏️', 'pt-hindi1-m5', 'Sentence Builder', 12),
    ]
  };

  /* =====================================================================
     MISSION 6 — Who Said to Whom + Moral · किसने किससे कहा / जीवन मूल्य
     ===================================================================== */
  const dlg = (id, quote, quoteEn, whoIdx, toIdx, explain) => ({
    kind: 'dialogue', id: uid(id), quote, quoteEn,
    whoOptions: [{ hi: 'सौरभ' }, { hi: 'प्रिया' }, { hi: 'पिताजी' }],
    whoAnswer: whoIdx,
    toOptions: [{ hi: 'पिताजी' }, { hi: 'प्रिया' }, { hi: 'बच्चों' }],
    toAnswer: toIdx, explain
  });
  const m6 = {
    id: 'm6-dialogue-moral', title: 'Who Said It? + Moral', titleHi: 'किसने किससे कहा / जीवन मूल्य', emoji: '💬', estMin: 13,
    words: [W.saurabh.hi, W.priya.hi, W.pitaji.hi],
    steps: [
      intro('💬', 'Mission 6 · Who Said It?', 'In the story, who said each line — and to whom? Then we learn what the story teaches us. 🌳'),
      discover(W.saurabh), discover(W.priya), discover(W.pitaji),
      // dialogues
      dlg('m6-d1', 'बगीचे में आम का पौधा निकल आया है।', 'A mango plant has come up in the garden.', 1, 0,
        'प्रिया said this to पिताजी.'),
      dlg('m6-d2', 'आज तुम दोनों बहुत प्रसन्न हो।', 'Today you both are very happy.', 2, 2,
        'पिताजी said this to the children (बच्चों).'),
      dlg('m6-d3', 'छोटे से पौधे को बड़ा होने में बहुत समय लगेगा।', 'The little plant will take a long time to grow.', 2, 1,
        'पिताजी said this to प्रिया.'),
      dlg('m6-d4', 'यह पौधा मैंने लगाया है।', 'I planted this plant.', 0, 1,
        'सौरभ said this to प्रिया.'),
      // match quote -> speaker
      {
        kind: 'match', id: uid('m6-match'), title: 'Match the line to who said it',
        pairs: [
          { left: { hi: 'बगीचे में पौधा निकल आया है।' }, right: { hi: 'प्रिया' } },
          { left: { hi: 'यह पौधा मैंने लगाया है।' }, right: { hi: 'सौरभ' } },
          { left: { hi: 'तुम दोनों बहुत प्रसन्न हो।' }, right: { hi: 'पिताजी' } },
        ]
      },
      // Moral
      {
        kind: 'choose', id: uid('m6-moral-choose'),
        prompt: 'इस पाठ से हमें क्या शिक्षा मिलती है?', promptEn: 'What does this story teach us?',
        options: [
          { hi: 'हमें पेड़ों की रक्षा और दूसरों की भलाई करनी चाहिए।', en: 'We should protect trees and do good to others.' },
          { hi: 'हमें कभी पौधे नहीं लगाने चाहिए।', en: 'We should never plant trees.' },
          { hi: 'हमें जल्दबाज़ी करनी चाहिए।', en: 'We should always be in a hurry.' },
        ], answer: 0
      },
      {
        kind: 'answerBuild', id: uid('m6-moral-build'),
        question: 'इस पाठ की सीख बनाओ', questionEn: 'Build the moral of the story.',
        answer: ['हमें', 'पेड़ों', 'की', 'रक्षा', 'करनी', 'चाहिए।'],
        hintEn: 'We should protect the trees.'
      },
      {
        kind: 'recall', id: uid('m6-moral-recall'),
        prompt: 'इस पाठ से हमें क्या शिक्षा मिलती है?',
        modelHi: 'हमें निस्वार्थ सेवा और दूसरों की भलाई करनी चाहिए तथा पेड़ों की रक्षा करनी चाहिए।',
        modelEn: 'We should do selfless service, do good to others, and protect trees.'
      },
      {
        kind: 'miniTest', id: uid('m6-mini'), title: 'Quick check — 3 questions',
        questions: [
          { kind: 'choose', prompt: '"यह पौधा मैंने लगाया है।" — who said it?', options: [{ hi: 'सौरभ' }, { hi: 'पिताजी' }, { hi: 'माँ' }], answer: 0 },
          { kind: 'choose', prompt: 'Who explained the plant takes years to grow?', options: [{ hi: 'पिताजी' }, { hi: 'प्रिया' }, { hi: 'सौरभ' }], answer: 0 },
          { kind: 'choose', prompt: 'The story teaches us to…', options: [{ en: 'protect trees & help others' }, { en: 'hurry always' }, { en: 'never plant trees' }], answer: 0 },
        ]
      },
      milestone('🏆 Chapter complete! You finished आम का पेड़! Amazing work!', 'pt-hindi1-champion', 'आम का पेड़ Champion', 16),
    ]
  };

  /* =====================================================================
     PRACTICE MODE — mixed pool from all missions
     ===================================================================== */
  const practice = {
    pool: [
      { kind: 'choose', prompt: 'प्रतिदिन means…', options: [{ en: 'every day' }, { en: 'rain' }, { en: 'tiny' }], answer: 0 },
      { kind: 'choose', prompt: 'वर्षा means…', options: [{ en: 'rain' }, { en: 'morning' }, { en: 'love' }], answer: 0 },
      { kind: 'choose', prompt: 'Opposite of प्रसन्न?', options: [{ hi: 'निराश' }, { hi: 'सामने' }, { hi: 'जल' }], answer: 0 },
      { kind: 'choose', prompt: 'Opposite of सामने?', options: [{ hi: 'पीछे' }, { hi: 'ज़्यादा' }, { hi: 'प्यार' }], answer: 0 },
      { kind: 'choose', prompt: 'Which means water?', options: [{ hi: 'जल' }, { hi: 'बाग' }, { hi: 'सवेरा' }], answer: 0 },
      { kind: 'choose', prompt: 'सवेरा means…', options: [{ en: 'morning' }, { en: 'garden' }, { en: 'water' }], answer: 0 },
      { kind: 'fill', prompt: 'हम पौधे की ____ करेंगे।', bank: [{ hi: 'देखभाल' }, { hi: 'वर्षा' }], answer: 'देखभाल' },
      { kind: 'choose', prompt: 'Which is a root vegetable?', options: [{ hi: 'गाजर' }, { hi: 'आम' }, { hi: 'पानी' }], answer: 0 },
      { kind: 'choose', prompt: 'उदास means…', options: [{ en: 'sad' }, { en: 'happy' }, { en: 'tiny' }], answer: 0 },
      { kind: 'choose', prompt: 'Plant takes how long to grow?', options: [{ en: '4–5 years' }, { en: '1 day' }, { en: '1 week' }], answer: 0 },
      { kind: 'dialogue', quote: 'यह पौधा मैंने लगाया है।', quoteEn: 'I planted this plant.',
        whoOptions: [{ hi: 'सौरभ' }, { hi: 'प्रिया' }, { hi: 'पिताजी' }], whoAnswer: 0,
        toOptions: [{ hi: 'पिताजी' }, { hi: 'प्रिया' }, { hi: 'बच्चों' }], toAnswer: 1 },
      { kind: 'choose', prompt: 'The story teaches us to…', options: [{ en: 'protect trees & help others' }, { en: 'be lazy' }, { en: 'hurry' }], answer: 0 },
      { kind: 'choose', prompt: 'नन्हा means…', options: [{ en: 'tiny' }, { en: 'every day' }, { en: 'rain' }], answer: 0 },
      { kind: 'choose', prompt: 'Opposite of थोड़ा?', options: [{ hi: 'ज़्यादा' }, { hi: 'पीछे' }, { hi: 'जल' }], answer: 0 },
      { kind: 'choose', prompt: 'वाटिका means the same as…', options: [{ hi: 'बगीचा' }, { hi: 'पानी' }, { hi: 'सुबह' }], answer: 0 },
    ]
  };

  window.PT_HINDI1 = {
    id: 'pt-hindi1',
    chapter: 'पाठ ६',
    title: 'आम का पेड़',
    titleEn: 'The Mango Tree',
    theme: { primary: '#B45309', light: '#FBBF24', accent: '#16A34A' },
    storyHref: 'chapters/hi02-aam-ka-ped.html',
    missions: [m1, m2, m3, m4, m5, m6],
    practice: practice,
  };
})();

/* ==========================================================================
   MEASUREQUEST — content layer
   --------------------------------------------------------------------------
   Crislyn can already recite "perimeter = 2 x (l + b)" and still buy carpet
   by the metre. The gap is not arithmetic, it is MEANING: which of the two
   numbers the world is actually asking for.

   So the content here is built around one decision, not two formulas:

       "Perimeter goes around. Area covers the ground."
       Border or cover?

   Everything below is DATA. No DOM, no maths, no rendering — those live in
   js/mq-engine.js, js/mq-activities.js and js/mq-ui.js. Keeping the content
   separate is what lets the worksheet generator, the practice engine and the
   Grown-up Corner all quote the same words she was taught with.

   Three things in here are load-bearing:

   1. JOBS, not objects. The 21 real-life situations are *jobs* — "ribbon
      around a birthday cake", "icing covering the top of a cake" — each
      tagged around/inside. Several share an object on purpose, so the same
      cake can ask for a border one moment and a cover the next. That
      contrast is the whole lesson.
   2. MISCONCEPTIONS are named and addressed. Every wrong answer a question
      can produce carries a tag, and every tag has teaching written for it.
      "Incorrect" is never a valid response.
   3. UNITS are carried as data (cm/m/km and cm2/m2/km2), never assumed, so
      a question can never print an area without a square unit.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------- THE CUES */

  const CUE_LONG = 'Perimeter goes around. Area covers the ground.';
  const CUE_SHORT = 'Border or cover?';

  /* --------------------------------------------------------------- SKILLS
     The ten things tracked separately. Order is teaching order: meaning
     first, counting second, formulas third, comparison last. */

  const SKILLS = [
    { id: 'boundary', name: 'Boundary or surface', short: 'Border or cover',
      about: 'Telling the edge of a shape apart from the space inside it.' },
    { id: 'id-perimeter', name: 'Spotting perimeter jobs', short: 'Perimeter jobs',
      about: 'Knowing that fences, ribbons and borders travel around the outside.' },
    { id: 'count-perimeter', name: 'Counting around', short: 'Counting around',
      about: 'Counting unit lengths all the way around a grid shape and back to the start.' },
    { id: 'calc-perimeter', name: 'Perimeter of squares and rectangles', short: 'Perimeter sums',
      about: 'Using 2 x (length + width) and 4 x side, and understanding why they work.' },
    { id: 'id-area', name: 'Spotting area jobs', short: 'Area jobs',
      about: 'Knowing that carpet, paint and tiles cover the surface inside.' },
    { id: 'count-squares', name: 'Counting unit squares', short: 'Counting squares',
      about: 'Finding how many equal squares fit inside a surface, with no gaps or overlaps.' },
    { id: 'calc-area', name: 'Area of squares and rectangles', short: 'Area sums',
      about: 'Using length x width and side x side, kept beside the grid that explains it.' },
    { id: 'units', name: 'Choosing the unit', short: 'Units',
      about: 'cm, m and km for perimeter. cm2, m2 and km2 for area.' },
    { id: 'real-life', name: 'Real-life decisions', short: 'Real life',
      about: 'Reading a real problem and deciding what actually needs measuring.' },
    { id: 'compare', name: 'Comparing area and perimeter', short: 'Comparing',
      about: 'Seeing that the same area can have different perimeters, and the other way round.' }
  ];

  /* -------------------------------------------------------------- MISSIONS
     Seven. The first six unlock in order; Shape Lab is an explore-any-time
     bonus that opens once she can count both quantities (mission 4). */

  const MISSIONS = [
    { id: 'm1', n: 1, name: 'Border or Cover?',
      tag: 'What are the two jobs?',
      blurb: 'A roll of ribbon. A box of tiles. One goes around, one fills the ground — find out which is which.',
      skills: ['boundary', 'id-perimeter', 'id-area'],
      colour: 'both', opens: null },

    { id: 'm2', n: 2, name: 'Walk Around the Shape',
      tag: 'Counting the journey',
      blurb: 'Trace every edge of a shape with your finger and count the steps. Stop before you get back to the start and the number is wrong.',
      skills: ['count-perimeter'],
      colour: 'perimeter', opens: 'm1' },

    { id: 'm3', n: 3, name: 'Perimeter Shortcuts',
      tag: 'Why the formula works',
      blurb: 'Adding four sides every time is slow. Group the equal sides and a shortcut appears.',
      skills: ['calc-perimeter', 'units'],
      colour: 'perimeter', opens: 'm2' },

    { id: 'm4', n: 4, name: 'Fill the Floor',
      tag: 'Counting the cover',
      blurb: 'Cover a floor with square tiles and count them. No gaps, no overlaps — that count is the area.',
      skills: ['count-squares'],
      colour: 'area', opens: 'm3' },

    { id: 'm5', n: 5, name: 'Area Shortcuts',
      tag: 'Rows and columns',
      blurb: 'Counting 48 tiles one by one is slow. Count one row, count the rows, multiply.',
      skills: ['calc-area', 'units'],
      colour: 'area', opens: 'm4' },

    { id: 'm6', n: 6, name: 'Measurement Detective',
      tag: 'Real problems, real consequences',
      blurb: 'Real jobs from real life. Decide what to measure, choose the unit, and see what happens if you get it wrong.',
      skills: ['real-life', 'units', 'id-perimeter', 'id-area'],
      colour: 'both', opens: 'm5' },

    { id: 'm7', n: 7, name: 'Shape Lab',
      tag: 'Explore and discover',
      blurb: 'Build your own shapes out of tiles. Find two shapes with the same area but different borders.',
      skills: ['compare'],
      colour: 'both', opens: 'm4', bonus: true }
  ];

  /* ------------------------------------------------------------------ JOBS
     The 21 real-life situations, as JOBS. `mode` is the whole point of the
     module, so it is the first field. `why` must always answer "why would
     anybody measure this?" — a story with no reason teaches nothing.
     `unit` is the sensible real unit for that job. */

  const JOBS = [
    /* ---- around: the border jobs ---- */
    { id: 'cake-ribbon', mode: 'around', obj: 'cake', icon: 'cake',
      what: 'Ribbon around a birthday cake',
      why: 'The ribbon has to reach all the way round the cake and meet itself, or it will not tie.',
      unit: 'cm', verb: 'ribbon', buy: 'a length of ribbon' },
    { id: 'card-border', mode: 'around', obj: 'card', icon: 'card',
      what: 'A border drawn around a birthday card',
      why: 'The border runs along all four edges of the card, so she needs the total length of the edges.',
      unit: 'cm', verb: 'border', buy: 'a strip of border tape' },
    { id: 'stage-tape', mode: 'around', obj: 'stage', icon: 'stage',
      what: 'Bright tape around the edge of the dance stage',
      why: 'The tape marks where the stage ends so nobody dances off the side in the dark.',
      unit: 'm', verb: 'tape', buy: 'a roll of tape' },
    { id: 'pitch-line', mode: 'around', obj: 'pitch', icon: 'pitch',
      what: 'The white line painted around a football pitch',
      why: 'The line shows where the ball has gone out, so it must go the whole way round.',
      unit: 'm', verb: 'white line', buy: 'line paint' },
    { id: 'garden-fence', mode: 'around', obj: 'garden', icon: 'garden',
      what: 'A fence around a garden',
      why: 'A fence with a gap is not a fence — it has to close all the way round.',
      unit: 'm', verb: 'fence', buy: 'fencing' },
    { id: 'photo-frame', mode: 'around', obj: 'photo', icon: 'photo',
      what: 'A wooden frame around a photograph',
      why: 'The frame is made of strips joined at the corners, so the wood must match the edges.',
      unit: 'cm', verb: 'frame', buy: 'framing wood' },
    { id: 'bedroom-skirting', mode: 'around', obj: 'bedroom', icon: 'bedroom',
      what: 'Skirting board around a bedroom',
      why: 'Skirting is a strip that runs along the bottom of every wall, all the way round the room.',
      unit: 'm', verb: 'skirting', buy: 'skirting board' },
    { id: 'window-lights', mode: 'around', obj: 'window', icon: 'window',
      what: 'A string of lights around a window',
      why: 'The lights are one long string that has to reach right around the window frame.',
      unit: 'm', verb: 'lights', buy: 'a string of lights', plural: true },
    { id: 'playground-rope', mode: 'around', obj: 'playground', icon: 'playground',
      what: 'A rope around the playground',
      why: 'The rope keeps the little ones inside, so it must run round the whole playground.',
      unit: 'm', verb: 'rope', buy: 'rope' },
    { id: 'tablecloth-lace', mode: 'around', obj: 'tablecloth', icon: 'table',
      what: 'Lace sewn around the edge of a tablecloth',
      why: 'The lace is sewn along the outside edge, so its length must match the way round.',
      unit: 'cm', verb: 'lace', buy: 'lace trim' },
    { id: 'gift-ribbon', mode: 'around', obj: 'giftbox', icon: 'gift',
      what: 'Ribbon around the front of a gift box',
      why: 'The ribbon has to go round the edge of the front and tie in a bow.',
      unit: 'cm', verb: 'ribbon', buy: 'ribbon' },

    /* ---- inside: the cover jobs ---- */
    { id: 'cake-icing', mode: 'inside', obj: 'cake', icon: 'cake',
      what: 'Icing covering the top of a cake',
      why: 'The icing has to spread across the whole top surface, not just the rim.',
      unit: 'cm2', verb: 'icing', buy: 'icing' },
    { id: 'gift-paper', mode: 'inside', obj: 'giftbox', icon: 'gift',
      what: 'Wrapping paper covering the front of a gift box',
      why: 'The paper must cover the whole face of the box with nothing showing through.',
      unit: 'cm2', verb: 'wrapping paper', buy: 'wrapping paper' },
    { id: 'stage-mats', mode: 'inside', obj: 'stage', icon: 'stage',
      what: 'Square mats covering the dance floor',
      why: 'The mats have to cover the whole floor so the dancers do not slip on bare boards.',
      unit: 'm2', verb: 'mats', buy: 'floor mats', plural: true },
    { id: 'pitch-grass', mode: 'inside', obj: 'pitch', icon: 'pitch',
      what: 'Grass covering a football pitch',
      why: 'Grass has to grow over the whole playing surface, not just around the edge.',
      unit: 'm2', verb: 'grass', buy: 'rolls of turf' },
    { id: 'garden-flowers', mode: 'inside', obj: 'garden', icon: 'garden',
      what: 'Flowers planted across a garden bed',
      why: 'The flowers fill the ground inside the fence, so she needs the surface, not the border.',
      unit: 'm2', verb: 'flowers', buy: 'flower plants', plural: true },
    { id: 'board-paper', mode: 'inside', obj: 'noticeboard', icon: 'board',
      what: 'Coloured paper covering a noticeboard',
      why: 'The paper is a backing sheet — it has to cover the whole board before anything is pinned up.',
      unit: 'cm2', verb: 'coloured paper', buy: 'coloured paper' },
    { id: 'bedroom-carpet', mode: 'inside', obj: 'bedroom', icon: 'bedroom',
      what: 'Carpet covering a bedroom floor',
      why: 'Carpet is sold by the square metre because it has to cover the whole floor.',
      unit: 'm2', verb: 'carpet', buy: 'carpet' },
    { id: 'wall-paint', mode: 'inside', obj: 'wall', icon: 'wall',
      what: 'Paint covering a wall',
      why: 'A tin of paint says how many square metres it will cover, so she needs the surface.',
      unit: 'm2', verb: 'paint', buy: 'paint' },
    { id: 'kitchen-tiles', mode: 'inside', obj: 'kitchen', icon: 'kitchen',
      what: 'Tiles covering a kitchen floor',
      why: 'Every tile takes up a square of floor, so the number of tiles depends on the surface.',
      unit: 'm2', verb: 'tiles', buy: 'floor tiles', plural: true },
    { id: 'playarea-sand', mode: 'inside', obj: 'playarea', icon: 'playground',
      what: 'Sand covering a play area',
      why: 'The sand has to spread over the whole play area to make it soft to land on.',
      unit: 'm2', verb: 'sand', buy: 'sand' },
    { id: 'table-fabric', mode: 'inside', obj: 'tablecloth', icon: 'table',
      what: 'Fabric covering the top of a table',
      why: 'The fabric has to cover the whole table top, so she needs the surface it must hide.',
      unit: 'cm2', verb: 'fabric', buy: 'fabric' }
  ];

  /* Objects, so a question can say "the same garden" and mean it.
     `range` is the believable size of the real thing in its own unit — a
     table is not 4 cm long, and a question that says so teaches her to stop
     picturing the problem.
     `areaOk` marks the objects that are still believable at the small
     numbers an area question needs. Perimeter is addition, so it stays easy
     at any size and every object may be used for it; area is multiplication,
     so the big objects are kept out of the generated area questions rather
     than handing a nine-year-old 140 x 90. */
  const OBJECTS = {
    cake:        { name: 'birthday cake',  the: 'the cake',          unit: 'cm', range: [15, 30], areaOk: false },
    card:        { name: 'birthday card',  the: 'the card',          unit: 'cm', range: [8, 20],  areaOk: true },
    giftbox:     { name: 'gift box',       the: 'the gift box',      unit: 'cm', range: [6, 18],  areaOk: true },
    stage:       { name: 'dance stage',    the: 'the stage',         unit: 'm',  range: [4, 14],  areaOk: true },
    pitch:       { name: 'football pitch', the: 'the pitch',         unit: 'm',  range: [8, 20],  areaOk: true },
    garden:      { name: 'garden',         the: 'the garden',        unit: 'm',  range: [4, 16],  areaOk: true },
    photo:       { name: 'photograph',     the: 'the photograph',    unit: 'cm', range: [8, 20],  areaOk: true },
    noticeboard: { name: 'noticeboard',    the: 'the noticeboard',   unit: 'cm', range: [60, 150], areaOk: false },
    bedroom:     { name: 'bedroom',        the: 'the bedroom',       unit: 'm',  range: [3, 9],   areaOk: true },
    window:      { name: 'window',         the: 'the window',        unit: 'm',  range: [1, 3],   areaOk: false },
    wall:        { name: 'wall',           the: 'the wall',          unit: 'm',  range: [3, 12],  areaOk: true },
    kitchen:     { name: 'kitchen floor',  the: 'the kitchen floor', unit: 'm',  range: [3, 10],  areaOk: true },
    playground:  { name: 'playground',     the: 'the playground',    unit: 'm',  range: [10, 25], areaOk: false },
    playarea:    { name: 'play area',      the: 'the play area',     unit: 'm',  range: [4, 12],  areaOk: true },
    tablecloth:  { name: 'table',          the: 'the table',         unit: 'cm', range: [60, 150], areaOk: false }
  };

  /* Friendly classmates and teachers. First names only, and none of them are
     real children — Crislyn is the only real person named anywhere. */
  const PEOPLE = ['Maya', 'Aarav', 'Zara', 'Noor', 'Ravi', 'Leena', 'Sam', 'Priya',
                  'Omar', 'Tara', 'Kiran', 'Dev'];
  const TEACHERS = ['Miss Rosy', 'Mr Alan', 'Miss Farah'];

  /* ------------------------------------------------------- MISCONCEPTIONS
     Every wrong answer the app can produce is tagged with one of these, and
     every tag has teaching written for it. `back` names the visual model to
     return to when she gets the same thing wrong twice running. */

  const MISCONCEPTIONS = {
    'chose-area-for-border': {
      label: 'Chose area when the job goes around',
      say: 'A fence travels around the outside. Trace the fence with your finger. That tells us we need the perimeter.',
      back: 'trace-border'
    },
    'chose-perimeter-for-cover': {
      label: 'Chose perimeter when the job covers a surface',
      say: 'Carpet does not sit on the edge — it covers the whole floor. When something covers the ground, we need the area.',
      back: 'shade-inside'
    },
    'added-two-sides': {
      label: 'Added only length + width',
      say: 'You counted the top and one side, but our journey has not returned to the starting point yet. A rectangle has four sides to walk.',
      back: 'walk-around'
    },
    'linear-unit-for-area': {
      label: 'Used cm where cm2 was needed',
      say: 'Area counts little squares, so the unit also needs a square: cm2.',
      back: 'unit-card'
    },
    'square-unit-for-perimeter': {
      label: 'Used cm2 where cm was needed',
      say: 'Perimeter measures one line going around the shape, so we use cm, not cm2.',
      back: 'unit-card'
    },
    'multiplied-for-perimeter': {
      label: 'Multiplied the sides to find perimeter',
      say: 'Multiplying the sides fills the inside with squares. Perimeter is a walk along the edge, so we add the sides instead.',
      back: 'walk-around'
    },
    'added-for-area': {
      label: 'Added the sides to find area',
      say: 'Adding the sides measures the walk around the edge. To cover the inside we count the squares, and that means length x width.',
      back: 'rows-columns'
    },
    'missed-a-side': {
      label: 'Missed one side of the shape',
      say: 'One side did not get counted. Start at a corner and go all the way round until you arrive back where you began.',
      back: 'walk-around'
    },
    'counted-corner-twice': {
      label: 'Counted a corner square twice',
      say: 'Each square gets counted once. Go along one row at a time so no square is missed and none is counted twice.',
      back: 'rows-columns'
    },
    'counted-edge-squares': {
      label: 'Counted only the squares around the edge',
      say: 'The squares in the middle are covered too. Area counts every square inside the shape, not just the ring around it.',
      back: 'shade-inside'
    },
    'used-one-row': {
      label: 'Counted one row instead of all rows',
      say: 'That is one row. Now count how many rows there are, and multiply — every row has the same number of squares.',
      back: 'rows-columns'
    },
    'divided-wrong-way': {
      label: 'Divided by the wrong number',
      say: 'To go backwards from a total, undo what was done. Area was length x width, so the missing side is area divided by the side you know.',
      back: 'rows-columns'
    },
    'square-halved': {
      label: 'Halved instead of quartering a square perimeter',
      say: 'A square has four equal sides, so to find one side from the perimeter we share it into four, not two.',
      back: 'walk-around'
    },
    'same-area-same-perimeter': {
      label: 'Assumed equal areas must have equal perimeters',
      say: 'Both shapes are made of the same number of tiles, so the area matches. But a long thin shape has a much longer border than a fat one. Count the edges and see.',
      back: 'compare-lab'
    },
    'ordered-by-eye': {
      label: 'Judged by how big it looks',
      say: 'A shape can look bigger and still have a smaller border. Count instead of guessing — counting is what a detective does.',
      back: 'compare-lab'
    },
    'wrong-magnitude-unit': {
      label: 'Chose a unit of the wrong size',
      say: 'Think how big the real thing is. A football pitch in centimetres would be a huge number, and a postage stamp in kilometres would be almost nothing.',
      back: 'unit-card'
    }
  };

  /* The visual models we can send her back to after two wrong answers. */
  const MODELS = {
    'trace-border': { name: 'Trace the border', mission: 'm1' },
    'shade-inside': { name: 'Shade the inside', mission: 'm1' },
    'walk-around':  { name: 'Walk around the shape', mission: 'm2' },
    'rows-columns': { name: 'Rows and columns', mission: 'm5' },
    'unit-card':    { name: 'cm or cm2?', mission: 'm3' },
    'compare-lab':  { name: 'Compare two shapes', mission: 'm7' }
  };

  /* -------------------------------------------------------------- BADGES */

  const BADGES = [
    { id: 'border-detective', name: 'Border Detective',
      how: 'Sorted eight jobs correctly into around and inside.',
      earn: 'Told the border jobs from the cover jobs.' },
    { id: 'edge-explorer', name: 'Edge Explorer',
      how: 'Traced the whole way around five shapes.',
      earn: 'Walked every edge without missing one.' },
    { id: 'tile-master', name: 'Tile Master',
      how: 'Covered five surfaces with no gaps and no overlaps.',
      earn: 'Covered a floor perfectly.' },
    { id: 'unit-expert', name: 'Unit Expert',
      how: 'Chose the right unit ten times.',
      earn: 'Never once wrote cm where cm2 belonged.' },
    { id: 'perimeter-pathfinder', name: 'Perimeter Pathfinder',
      how: 'Made the perimeter skills secure.',
      earn: 'Can find the way around any rectangle.' },
    { id: 'area-adventurer', name: 'Area Adventurer',
      how: 'Made the area skills secure.',
      earn: 'Can cover any rectangle and count it.' },
    { id: 'measurement-champion', name: 'Measurement Champion',
      how: 'Made every skill secure.',
      earn: 'Knows which number the world is asking for.' },
    /* effort badges — earned for the behaviour, not the score */
    { id: 'great-recovery', name: 'Great Recovery',
      how: 'Got a question right straight after getting one wrong, five times.',
      earn: 'Turned a mistake into the right answer.', effort: true },
    { id: 'clue-reader', name: 'Clue Reader',
      how: 'Used a hint and then solved it, five times.',
      earn: 'Used a clue properly instead of guessing.', effort: true },
    { id: 'explainer', name: 'Explainer',
      how: 'Explained an answer in her own words five times.',
      earn: 'Said why, not just what.', effort: true }
  ];

  /* ------------------------------------------------- GROWN-UP: TEACH WITH ME
     Short scripts Tony can read out. Each has a follow-up that depends on
     what she says, because the answer she gives is the useful part. */

  const TEACH_SCRIPTS = [
    { id: 't1', skill: 'boundary',
      say: 'Crislyn, if we put ribbon around this book, are we measuring the border or covering the surface?',
      ifRight: 'Ask her to run her finger along exactly what the ribbon would touch.',
      ifWrong: 'Put a real ribbon or a piece of string along the edge of the book and let her feel it going around. Then ask again.',
      then: 'Now ask: and if we wrapped the book in paper instead?' },
    { id: 't2', skill: 'id-area',
      say: 'We are going to put new carpet in your bedroom. Should I measure around the walls, or across the floor?',
      ifRight: 'Ask her why the shop needs square metres and not metres.',
      ifWrong: 'Say: if I only measured around the walls, I would come home with a long thin strip of carpet. Would that cover your floor?',
      then: 'Then ask the same about skirting board, which is the opposite answer.' },
    { id: 't3', skill: 'count-perimeter',
      say: 'Trace around this photo frame with your finger and count out loud as you pass each side.',
      ifRight: 'Ask her what would happen if she stopped after two sides.',
      ifWrong: 'Start her finger at a corner and say "back to where we started" as she goes. The journey has to close.',
      then: 'Ask: how many sides did you count? Does a rectangle always have four?' },
    { id: 't4', skill: 'calc-perimeter',
      say: 'This card is 8 cm long and 5 cm wide. Tell me the four sides out loud before you work anything out.',
      ifRight: 'Now ask her to group them: two 8s and two 5s. That is where 2 x (8 + 5) comes from.',
      ifWrong: 'Draw the rectangle and write a number on each of the four sides, including the two she cannot see the labels for.',
      then: 'Ask her to explain why the shortcut has a 2 in front of the bracket.' },
    { id: 't5', skill: 'count-squares',
      say: 'Put square paper on the table. How many squares does your hand cover?',
      ifRight: 'Ask her to check by counting rows instead of one at a time.',
      ifWrong: 'Ask her to count one row first, then how many rows.',
      then: 'Ask: is it quicker to count every square, or to count rows and multiply?' },
    { id: 't6', skill: 'units',
      say: 'I need 20 of something for this room. If I say 20 metres, what am I buying? If I say 20 square metres?',
      ifRight: 'Ask her which one you would buy for a fence, and which for a floor.',
      ifWrong: 'Say: the little 2 means squares. Squares cover, lines go around.',
      then: 'Ask her to invent a job for each unit.' },
    { id: 't7', skill: 'compare',
      say: 'Take 12 square tiles or 12 squares of paper. Make a long thin rectangle, then a fat one. Which needs more ribbon around it?',
      ifRight: 'Ask her why, when both are made of the same 12 squares.',
      ifWrong: 'Count the edges of each together, out loud.',
      then: 'Ask: did the area change when you moved the tiles?' },
    { id: 't8', skill: 'real-life',
      say: 'We are decorating for a party. Lights around the window, and paper covering the table. Which is which?',
      ifRight: 'Ask her which one she would measure with a tape measure going round.',
      ifWrong: 'Do one of them for real with string and let her see it.',
      then: 'Ask her to think of one more job for each kind.' }
  ];

  /* ---------------------------------------------- GROWN-UP: HOME ACTIVITIES
     Everything here uses what is already in the house. Nothing sharp, nothing
     outdoors on her own, nothing that needs a grown-up to leave the room. */

  const HOME_CARDS = [
    { id: 'h1', title: 'The string and the notebook', skill: 'boundary',
      need: 'A notebook, a piece of string, a ruler.',
      say: 'I am going to put this string around the edge of your notebook. Watch where it touches.',
      does: 'Crislyn lays the string along all four edges, marks where it meets, then straightens it and measures it with the ruler.',
      learns: 'The perimeter is a length. It can be straightened out into one line and measured in centimetres.',
      ask: 'If the notebook were fatter, would the string need to be longer or shorter?' },
    { id: 'h2', title: 'Cover the notebook', skill: 'count-squares',
      need: 'A notebook, square paper (or sticky notes of the same size).',
      say: 'Now cover the front of the notebook with squares. No gaps and no overlaps.',
      does: 'Crislyn lays squares across the cover, then counts them by rows.',
      learns: 'Area is how many equal squares are needed to cover a surface.',
      ask: 'How many squares in one row? How many rows? Does that multiply to your total?' },
    { id: 'h3', title: 'The dining table', skill: 'real-life',
      need: 'A dining table, a tape measure or a long ruler.',
      say: 'We want lace around the edge of a tablecloth, and fabric to cover the top. Which measurement do we take first?',
      does: 'Crislyn measures the length and the width, then works out both numbers and labels them cm and cm2.',
      learns: 'One real object needs both measurements for two different jobs.',
      ask: 'If we only bought fabric and no lace, what would be missing?' },
    { id: 'h4', title: 'Carpet for the bedroom', skill: 'id-area',
      need: 'A bedroom floor, a tape measure, paper.',
      say: 'Pretend we are buying carpet. Measure the floor and tell me what to ask for in the shop.',
      does: 'Crislyn measures length and width in metres and writes the answer with m2.',
      learns: 'Carpet is sold by the square metre because it covers a surface.',
      ask: 'What would we measure instead if we wanted new skirting board?' },
    { id: 'h5', title: 'Lights around the window', skill: 'id-perimeter',
      need: 'A window (stay inside), a tape measure or string.',
      say: 'If we hang lights around this window, how long must the string of lights be?',
      does: 'Crislyn measures each side of the window frame and adds all four.',
      learns: 'A border job needs the total of every side, all the way round.',
      ask: 'Would a longer string be a problem? Would a shorter one?' },
    { id: 'h6', title: 'Frame the photograph', skill: 'calc-perimeter',
      need: 'A photograph or a picture, a ruler.',
      say: 'We are making a frame. How much wood do we need?',
      does: 'Crislyn measures the length and width, then finds 2 x (length + width).',
      learns: 'The formula is just the four sides grouped into two pairs.',
      ask: 'Show me the two lengths and the two widths in your sum.' },
    { id: 'h7', title: 'Same tiles, different shape', skill: 'compare',
      need: '12 squares of paper, all the same size.',
      say: 'Make me a rectangle out of all 12. Now make a different one, still using all 12.',
      does: 'Crislyn builds 3x4, then 2x6, then 1x12, and counts the border of each.',
      learns: 'The same area can have very different perimeters.',
      ask: 'Which shape needed the most ribbon? Why do you think that is?' },
    { id: 'h8', title: 'The ruler hunt', skill: 'units',
      need: 'A ruler, and anything in the room.',
      say: 'Find me something we would measure in cm, and something we would measure in m.',
      does: 'Crislyn finds objects and says which unit fits, then does it again for cm2 and m2.',
      learns: 'Units are chosen to suit the size of the real thing.',
      ask: 'Why would nobody measure a football pitch in centimetres?' }
  ];

  window.MQ_CONTENT = {
    CUE_LONG, CUE_SHORT,
    skills: SKILLS,
    missions: MISSIONS,
    jobs: JOBS,
    objects: OBJECTS,
    people: PEOPLE,
    teachers: TEACHERS,
    misconceptions: MISCONCEPTIONS,
    models: MODELS,
    badges: BADGES,
    teachScripts: TEACH_SCRIPTS,
    homeCards: HOME_CARDS,
    skill(id) { return SKILLS.find(s => s.id === id) || null; },
    mission(id) { return MISSIONS.find(m => m.id === id) || null; },
    job(id) { return JOBS.find(j => j.id === id) || null; },
    badge(id) { return BADGES.find(b => b.id === id) || null; },
    jobsByMode(mode) { return JOBS.filter(j => j.mode === mode); },
    misconception(tag) { return MISCONCEPTIONS[tag] || null; }
  };
})();

/* ==========================================================================
   MEASUREQUEST — the curated activity bank
   --------------------------------------------------------------------------
   76 hand-written activities across the seven missions. These are the taught
   path: sequenced, varied, and written so that no two next to each other feel
   the same. The seeded generators in js/mq-engine.js supply unlimited extra
   practice AFTER a skill has been met here — they never introduce it.

   Every activity is a real question object, so the same renderers and the
   same check() in the engine handle both the bank and the generators. That
   is why there is only one copy of the grading logic in the whole module.

   Rules kept while writing these:
   - Nothing is asked before it has been shown. Mission 1 never mentions a
     formula; missions 2 and 4 count before missions 3 and 5 calculate.
   - `story` is a teaching panel that sits ABOVE a question, never instead of
     one. Every screen still has something to do.
   - Hints always go clue -> visual -> worked. Three, always, in that order.
   - Area answers carry square units. Side answers do not, even in an area
     question. The engine's validate() enforces this on every one of these.
   ========================================================================== */

(function () {
  'use strict';

  /* Local shape helpers so this file does not depend on load order. */
  function rc(l, w) {
    const out = [];
    for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) out.push({ x, y });
    return out;
  }
  function lc(l, w, cutL, cutW) {
    const out = [];
    for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) {
      if (x >= l - cutL && y >= w - cutW) continue;
      out.push({ x, y });
    }
    return out;
  }

  const BANK = {};
  const ALL = [];
  function A(mission, id, o) {
    o.id = mission + '-' + id;
    o.mission = mission;
    o.curated = true;
    (BANK[mission] = BANK[mission] || []).push(o);
    ALL.push(o);
    return o;
  }

  /* ====================================================================== */
  /*  MISSION 1 — BORDER OR COVER?                                          */
  /*  The words "perimeter" and "area" are deliberately withheld until a11.  */
  /* ====================================================================== */

  A('m1', 'a1', {
    type: 'mcq', skill: 'boundary',
    story: {
      title: 'The note in the box',
      text: 'Under the stage at school, Crislyn finds a dusty box. Inside there is a roll of shiny ribbon, ' +
        'a stack of square mats, and a folded note.<br><br>' +
        '<i>"One of these goes around.<br>One of these fills the ground.<br>' +
        'Solve the mystery before the school dance begins!"</i><br><br>' +
        'The dance is tomorrow. The stage needs both jobs done.',
      art: 'box'
    },
    prompt: 'The stage needs bright tape all the way round the edge, so nobody dances off it. Which thing from the box does that job?',
    choices: [
      { label: 'The roll of ribbon', correct: true },
      { label: 'The square mats', correct: false, tag: 'chose-area-for-border',
        teach: 'A mat is a flat square — it sits on the floor and covers it. This job has to travel ' +
          'all the way round the outside edge, and only something long and thin can do that.' }
    ],
    hints: [
      'Read the note again. One of them goes AROUND.',
      'A mat is a flat square. Could you make a long thin line all round the stage out of flat squares?',
      'Ribbon is long and thin, so it can travel all the way round the edge. That is the going-around job.'
    ],
    explain: 'Ribbon is long and thin, so it does the going-around job. That is the first of our two jobs.'
  });

  A('m1', 'a2', {
    type: 'mcq', skill: 'boundary',
    prompt: 'The stage floor is bare wood and the dancers will slip. It needs covering. Which thing does THAT job?',
    choices: [
      { label: 'The square mats', correct: true },
      { label: 'The roll of ribbon', correct: false, tag: 'chose-perimeter-for-cover',
        teach: 'Ribbon is one long thin line. Laid on the floor it would cover a single stripe and ' +
          'leave the rest bare. This job has to cover the whole middle.' }
    ],
    hints: [
      'This job is about the middle of the stage, not the edge.',
      'Ribbon laid on the floor would be one thin line. Would that stop anyone slipping in the middle?',
      'Mats are flat and square, so they can cover the whole floor. That is the filling-the-ground job.'
    ],
    explain: 'Mats cover the middle. So we have two different jobs: one goes around the edge, one fills the ground.'
  });

  A('m1', 'a3', {
    type: 'trace', skill: 'boundary', justDo: true,
    story: {
      title: 'Job one: the tape',
      text: 'Put your finger on a corner of the stage and drag it all the way round the edge. ' +
        'Do not lift it off until you are back where you started.',
      art: 'stage'
    },
    prompt: 'Trace the tape all the way around the stage with your finger.',
    shape: { cells: rc(6, 4), unit: 'units' },
    hints: [
      'Start at any corner and go one way round.',
      'Keep your finger on the edge — the tape only touches the outside line.',
      'You have finished when you arrive back at the corner you started from.'
    ],
    explain: 'That line your finger drew is the whole first job. It is a LENGTH — one long line going around.'
  });

  A('m1', 'a4', {
    type: 'shade', skill: 'boundary', justDo: true,
    story: {
      title: 'Job two: the mats',
      text: 'Now the other job. Drag your finger across the middle of the stage to lay the mats down. ' +
        'Every part of the floor needs covering.',
      art: 'stage'
    },
    prompt: 'Cover the whole stage floor by dragging your finger across it.',
    shape: { cells: rc(6, 4), unit: 'units' },
    hints: [
      'Sweep your finger across, like spreading butter.',
      'Do not forget the middle — every square has to be covered.',
      'When no bare wood is left, the job is done.'
    ],
    explain: 'That is the second job. It is not a line at all — it is a SURFACE, made of squares.'
  });

  A('m1', 'a5', {
    type: 'mcq', skill: 'boundary',
    prompt: 'You just did both jobs on the same stage. What was different about them?',
    choices: [
      { label: 'One went around the edge, the other covered the middle', correct: true },
      { label: 'One was bigger than the other', correct: false, tag: 'ordered-by-eye',
        teach: 'It is not about big or small. Think about WHERE your finger went each time — ' +
          'once along the outside line, once all over the middle.' },
      { label: 'They were really the same job', correct: false, tag: 'chose-perimeter-for-cover',
        teach: 'They really are two different jobs. One stays on the outside edge; the other ' +
          'covers every part of the middle.' }
    ],
    hints: [
      'Think about where your finger went each time.',
      'The first time it stayed on the outside line. The second time it went all over the middle.',
      'One is a line around the edge. One is a surface covering the ground.'
    ],
    explain: 'One job is a line around the edge. The other is the surface inside. Two different jobs, two different numbers.'
  });

  A('m1', 'a6', {
    type: 'sort', skill: 'boundary',
    prompt: 'Six real jobs. Does each one go AROUND the edge, or cover the INSIDE?',
    cards: [
      { id: 'c1', text: 'A fence around a garden', bin: 'around', icon: 'garden' },
      { id: 'c2', text: 'Carpet covering a bedroom floor', bin: 'inside', icon: 'bedroom' },
      { id: 'c3', text: 'Ribbon around a birthday cake', bin: 'around', icon: 'cake' },
      { id: 'c4', text: 'Paint covering a wall', bin: 'inside', icon: 'wall' },
      { id: 'c5', text: 'A frame around a photograph', bin: 'around', icon: 'photo' },
      { id: 'c6', text: 'Tiles covering a kitchen floor', bin: 'inside', icon: 'kitchen' }
    ],
    bins: [{ id: 'around', label: 'Goes around', hint: 'the border' },
           { id: 'inside', label: 'Covers the inside', hint: 'the surface' }],
    hints: [
      'For each one ask: could I do this with a long piece of string, or would I need a big sheet?',
      'String jobs go around. Sheet jobs cover.',
      'Fence, ribbon and frame all travel round the edge. Carpet, paint and tiles all cover a surface.'
    ],
    teachWrong: 'Look at each card again and ask: could I do this job with a long piece of string, ' +
      'or would I need a big flat sheet? String jobs go around the edge. Sheet jobs cover the middle.',
    explain: 'Fences, ribbons and frames travel around the edge. Carpet, paint and tiles spread over the inside.'
  });

  A('m1', 'a7', {
    type: 'trace', skill: 'boundary', justDo: true,
    prompt: 'This garden is not a rectangle. Trace the fence all the way around it anyway.',
    shape: { cells: lc(5, 5, 2, 2), unit: 'units' },
    hints: [
      'Follow every edge, even where it turns a corner inwards.',
      'A fence has to close all the way round, whatever shape the garden is.',
      'Go slowly round the notch — it is still part of the edge.'
    ],
    explain: 'Even an odd shape has one edge that closes. A border job follows it wherever it goes.'
  });

  A('m1', 'a8', {
    type: 'shade', skill: 'boundary', justDo: true,
    prompt: 'Now plant flowers over the whole of that same garden.',
    shape: { cells: lc(5, 5, 2, 2), unit: 'units' },
    hints: [
      'Drag across every part of the ground inside the fence.',
      'The notch is outside the garden, so nothing gets planted there.',
      'When all the ground inside is covered, the job is done.'
    ],
    explain: 'The same garden has both jobs: a fence around the edge, and flowers covering the ground inside.'
  });

  A('m1', 'a9', {
    type: 'mcq', skill: 'id-area',
    story: {
      title: 'The same cake, twice',
      text: 'Maya is making a cake for the dance. She needs ribbon to tie around it, and icing to spread on the top.',
      art: 'cake'
    },
    prompt: 'The ICING has to be spread on the top of the cake. Which job is that?',
    choices: [
      { label: 'Covering the inside', correct: true },
      { label: 'Going around the edge', correct: false, tag: 'chose-perimeter-for-cover',
        teach: 'Icing does not sit on the rim of the cake. It spreads across the whole top, ' +
          'so it is the covering job.' }
    ],
    hints: [
      'Where does icing actually sit on a cake?',
      'It spreads across the whole top, right to the edges.',
      'Spreading over a surface is the covering job.'
    ],
    explain: 'Icing covers the top surface. The same cake also needs ribbon around it — one object, two different jobs.'
  });

  A('m1', 'a10', {
    type: 'sort', skill: 'boundary',
    prompt: 'Six more. Sort them carefully — two of them are about the same table.',
    cards: [
      { id: 'd1', text: 'Lace sewn around the edge of a tablecloth', bin: 'around', icon: 'table' },
      { id: 'd2', text: 'Fabric covering the top of the table', bin: 'inside', icon: 'table' },
      { id: 'd3', text: 'A string of lights around a window', bin: 'around', icon: 'window' },
      /* NB: 'play area' is deliberately avoided here — mission 1 must not use
         the word 'area' in any sense before it is defined in a11. */
      { id: 'd4', text: 'Soft sand covering the playground', bin: 'inside', icon: 'playground' },
      { id: 'd5', text: 'Skirting board around a bedroom', bin: 'around', icon: 'bedroom' },
      { id: 'd6', text: 'Coloured paper covering a noticeboard', bin: 'inside', icon: 'board' }
    ],
    bins: [{ id: 'around', label: 'Goes around', hint: 'the border' },
           { id: 'inside', label: 'Covers the inside', hint: 'the surface' }],
    hints: [
      'The word in the middle of each card usually gives it away: "around" or "covering".',
      'Lace is sewn along the edge. Fabric lies over the top.',
      'The same table needs both — a border job and a cover job.'
    ],
    teachWrong: 'Read the middle of each card again. "Around" means it follows the outside edge. ' +
      '"Covering" means it spreads over the whole middle.',
    explain: 'One object often needs both jobs. The words "around" and "covering" tell you which is which.'
  });

  A('m1', 'a11', {
    type: 'mcq', skill: 'boundary',
    story: {
      title: 'The mystery is solved',
      text: 'The two jobs have real names, and now you have earned them.<br><br>' +
        '<b>Around the edge is called PERIMETER.</b><br>' +
        '<b>Covering the inside is called AREA.</b><br><br>' +
        'There is a way to remember it that will never let you down:<br><br>' +
        '<b>"Perimeter goes around. Area covers the ground."</b>',
      art: 'reveal'
    },
    prompt: 'So which one is the fence around the garden?',
    choices: [
      { label: 'Perimeter', correct: true },
      { label: 'Area', correct: false, tag: 'chose-area-for-border' }
    ],
    hints: [
      'Say the rhyme to yourself.',
      'Perimeter goes AROUND. A fence goes around.',
      'Fence = around the edge = perimeter.'
    ],
    explain: 'Perimeter goes around. Area covers the ground. A fence goes around, so it is perimeter.'
  });

  A('m1', 'a12', {
    type: 'explain', skill: 'boundary',
    prompt: 'Last one for this mission. In your own words, what is the difference between perimeter and area?',
    keywords: ['around', 'inside', 'cover', 'edge', 'surface', 'border', 'middle'],
    model: 'Perimeter is the distance all the way around the edge. Area is the surface covered inside.',
    hints: [
      'There is no wrong way to say this. Use your own words.',
      'Try: "Perimeter is... and area is..."',
      'One good way: perimeter goes around the edge, area covers the ground inside.'
    ],
    explain: 'Perimeter is the distance all the way around the edge. Area is the surface covered inside. ' +
      'Perimeter goes around. Area covers the ground.'
  });

  /* ====================================================================== */
  /*  MISSION 2 — WALK AROUND THE SHAPE                                     */
  /*  Counting, still no formula.                                           */
  /* ====================================================================== */

  A('m2', 'a1', {
    type: 'trace', skill: 'count-perimeter',
    story: {
      title: 'How far is around?',
      text: 'Knowing that a fence goes around is not enough — the shop will ask HOW MUCH fence. ' +
        'So we have to count the journey.<br><br>' +
        'Each little step along the edge of the grid is 1 unit. Trace the whole way round and count your steps.',
      art: 'walk'
    },
    prompt: 'Trace around this shape and count the steps. How many units is the whole journey?',
    shape: { cells: rc(4, 3), unit: 'units' },
    answer: 14, answerKind: 'count', unit: null,
    hints: [
      'Count each little step as your finger moves along the edge.',
      'The top has 4 steps. The right side has 3. Keep going round.',
      '4 + 3 + 4 + 3 = 14 steps all the way round.'
    ],
    explain: 'The journey around is 4 + 3 + 4 + 3 = 14 units. That is the perimeter.',
    wrongs: [{ value: 12, tag: 'added-for-area' }, { value: 7, tag: 'added-two-sides' }]
  });

  A('m2', 'a2', {
    type: 'trace', skill: 'count-perimeter',
    prompt: 'A square this time. Trace around it and count the steps.',
    shape: { cells: rc(5, 5), unit: 'units' },
    answer: 20, answerKind: 'count', unit: null,
    hints: [
      'All four sides of a square are the same length.',
      'One side is 5 steps. There are four sides.',
      '5 + 5 + 5 + 5 = 20 steps.'
    ],
    explain: 'Four sides of 5 steps each: 5 + 5 + 5 + 5 = 20 units.',
    wrongs: [{ value: 25, tag: 'multiplied-for-perimeter' }, { value: 10, tag: 'added-two-sides' }]
  });

  A('m2', 'a3', {
    type: 'mcq', skill: 'count-perimeter',
    story: {
      title: 'Ravi stopped too soon',
      text: 'Ravi traced a rectangle 6 units long and 2 units wide. He counted 6, then 2, and said ' +
        '"the perimeter is 8".',
      art: 'walk'
    },
    prompt: 'What went wrong for Ravi?',
    choices: [
      { label: 'He stopped halfway — he never got back to where he started', correct: true },
      { label: 'He should have multiplied instead', correct: false, tag: 'multiplied-for-perimeter' },
      { label: 'Nothing, 8 is right', correct: false, tag: 'added-two-sides' }
    ],
    hints: [
      'Trace it yourself with your finger. Does 6 then 2 bring you back to the start?',
      'After the top and one side, you are at the far corner — halfway round.',
      'He counted 2 sides out of 4. The journey is 6 + 2 + 6 + 2 = 16.'
    ],
    explain: 'Ravi counted the top and one side, but the journey has not returned to the starting point yet. ' +
      'A rectangle has four sides: 6 + 2 + 6 + 2 = 16.'
  });

  A('m2', 'a4', {
    type: 'trace', skill: 'count-perimeter',
    prompt: 'Now an L-shaped stage. Trace right around it — mind the corner that turns inwards.',
    shape: { cells: lc(5, 4, 2, 2), unit: 'units' },
    answer: 18, answerKind: 'count', unit: null,
    hints: [
      'Follow the edge wherever it goes, including into the notch.',
      'An inside corner still has edges to walk along. Do not cut across.',
      'Counting every step around this shape gives 18.'
    ],
    explain: 'Even with a notch, you count every step of the edge: 18 units.',
    wrongs: [{ value: 20, tag: 'missed-a-side' }, { value: 16, tag: 'added-for-area' }]
  });

  A('m2', 'a5', {
    type: 'number', skill: 'count-perimeter',
    story: {
      title: 'Sides you cannot see',
      text: 'Real questions do not always label every side. But a rectangle has a rule: ' +
        'the side opposite a side is always the same length.',
      art: 'rect'
    },
    prompt: 'A rectangle has a top of 7 units and a right side of 4 units. Only those two are labelled. ' +
      'What is the perimeter?',
    shape: { kind: 'rect', l: 7, w: 4, unit: 'units', show: 'perimeter' },
    dims: { l: 7, w: 4 },
    answer: 22, answerKind: 'count', unit: null,
    hints: [
      'The bottom is the same as the top. The left side is the same as the right.',
      'So the four sides are 7, 4, 7 and 4.',
      '7 + 4 + 7 + 4 = 22 units.'
    ],
    explain: 'Opposite sides of a rectangle match, so the sides are 7, 4, 7, 4 and the perimeter is 22 units.',
    wrongs: [{ value: 11, tag: 'added-two-sides' }, { value: 28, tag: 'multiplied-for-perimeter' },
             { value: 18, tag: 'missed-a-side' }]
  });

  A('m2', 'a6', {
    type: 'mistake', skill: 'count-perimeter',
    prompt: 'Zara traced this rectangle and wrote her working. Find what went wrong.',
    shape: { kind: 'rect', l: 8, w: 3, unit: 'units', show: 'perimeter' },
    dims: { l: 8, w: 3 },
    workingShown: 'P = 8 + 3 + 8 = 19 units',
    choices: [
      { label: 'She missed one side — there should be four numbers, not three', correct: true },
      { label: 'She should have multiplied 8 by 3', correct: false, tag: 'multiplied-for-perimeter' },
      { label: 'She used the wrong unit', correct: false, tag: 'square-unit-for-perimeter' }
    ],
    answer: 22,
    hints: [
      'Count how many numbers are in her sum. Now count the sides of a rectangle.',
      'She has 8, 3 and 8. Which side has she not written?',
      'The missing side is the other 3. The perimeter is 8 + 3 + 8 + 3 = 22.'
    ],
    explain: 'She only wrote three sides. The fourth side is 3, so the perimeter is 8 + 3 + 8 + 3 = 22 units.'
  });

  A('m2', 'a7', {
    type: 'trace', skill: 'count-perimeter',
    prompt: 'A long thin one. Trace around it and count.',
    shape: { cells: rc(8, 2), unit: 'units' },
    answer: 20, answerKind: 'count', unit: null,
    hints: [
      'Long shapes have a surprisingly long way round.',
      'The two long sides are 8 each, and the two short ones are 2 each.',
      '8 + 2 + 8 + 2 = 20 units.'
    ],
    explain: 'Long and thin means a long journey: 8 + 2 + 8 + 2 = 20 units.',
    wrongs: [{ value: 16, tag: 'added-for-area' }, { value: 10, tag: 'added-two-sides' }]
  });

  A('m2', 'a8', {
    type: 'number', skill: 'count-perimeter',
    story: {
      title: 'A missing label',
      text: 'Sometimes the shop tells you the total and you have to work backwards.',
      art: 'rect'
    },
    prompt: 'Three sides of this shape are 5, 6 and 5 units. The whole way round is 22 units. ' +
      'How long is the fourth side?',
    shape: { kind: 'rect', l: 6, w: 5, unit: 'units', show: 'perimeter', missing: true },
    dims: { known: 5 },
    answer: 6, answerKind: 'count', unit: null,
    hints: [
      'Add up the three sides you know.',
      '5 + 6 + 5 = 16. The whole journey is 22.',
      '22 − 16 = 6 units.'
    ],
    explain: 'The three known sides add to 16, and 22 − 16 = 6 units.',
    wrongs: [{ value: 16, tag: 'missed-a-side' }, { value: 11, tag: 'added-two-sides' }]
  });

  A('m2', 'a9', {
    type: 'compare', skill: 'count-perimeter',
    prompt: 'Both shapes are made of 8 tiles. Which one has the longer journey around it?',
    shapes: [
      { key: 'A', l: 8, w: 1, cells: rc(8, 1), area: 8, perimeter: 18 },
      { key: 'B', l: 4, w: 2, cells: rc(4, 2), area: 8, perimeter: 12 }
    ],
    choices: [
      { label: 'Shape A', correct: true },
      { label: 'Shape B', correct: false, tag: 'ordered-by-eye' },
      { label: 'They are the same', correct: false, tag: 'same-area-same-perimeter' }
    ],
    fact: 'Same area (8 tiles), different perimeters (18 and 12).',
    hints: [
      'Count the tiles in each first. They are the same.',
      'Now trace around each one and count the steps.',
      'A goes round in 18 steps, B in only 12. Long and thin has a longer border.'
    ],
    explain: 'Both hold 8 tiles, so they cover the same ground. But A is long and thin, so its journey around ' +
      'is 18 steps against B’s 12. Same area does not mean same perimeter.'
  });

  A('m2', 'a10', {
    type: 'trace', skill: 'count-perimeter',
    prompt: 'One more shape with a notch. Trace it and count every step.',
    shape: { cells: lc(6, 4, 3, 2), unit: 'units' },
    answer: 20, answerKind: 'count', unit: null,
    hints: [
      'Start top-left and go clockwise.',
      'When the edge turns inwards, keep following it. Do not jump across the gap.',
      'Every step counted gives 20 units.'
    ],
    explain: 'Following every edge, including both turns of the notch, gives 20 units.',
    wrongs: [{ value: 18, tag: 'missed-a-side' }, { value: 20 + 2, tag: 'counted-corner-twice' }]
  });

  A('m2', 'a11', {
    type: 'explain', skill: 'count-perimeter',
    prompt: 'Why is it important to get all the way back to where you started?',
    keywords: ['back', 'start', 'round', 'all', 'four', 'whole', 'complete', 'miss'],
    model: 'If you stop early you have not measured the whole edge, so the fence or ribbon would be too short.',
    hints: [
      'Think about Ravi and his fence.',
      'What would happen if you bought fence for only half the way round?',
      'One good answer: if you stop early the number is too small, and the fence would not close.'
    ],
    explain: 'A border job has to close. If you stop early the number is too small and the fence leaves a gap. ' +
      'Perimeter goes around. Area covers the ground.'
  });

  /* ====================================================================== */
  /*  MISSION 3 — PERIMETER SHORTCUTS                                       */
  /*  The formula, derived from the counting she has already done.          */
  /* ====================================================================== */

  A('m3', 'a1', {
    type: 'mcq', skill: 'calc-perimeter',
    story: {
      title: 'Adding four numbers every time is slow',
      text: 'You have been adding all four sides, and that always works. But look at what a rectangle ' +
        'gives you for free:<br><br>' +
        'The top and the bottom are <b>the same</b>. The left and the right are <b>the same</b>.<br><br>' +
        'So instead of 9 + 4 + 9 + 4, you can think: <b>two 9s and two 4s</b>.',
      art: 'pairs'
    },
    prompt: 'A rectangle is 9 units long and 4 units wide. Which of these gives the same answer as 9 + 4 + 9 + 4?',
    choices: [
      { label: '2 x (9 + 4)', correct: true },
      { label: '9 x 4', correct: false, tag: 'multiplied-for-perimeter' },
      { label: '9 + 4', correct: false, tag: 'added-two-sides' }
    ],
    hints: [
      'You need two lengths and two widths altogether.',
      '9 + 4 is one length and one width — that is half the journey. What would give you both halves?',
      'Doubling one length-plus-one-width gives the whole journey: 2 x (9 + 4) = 26.'
    ],
    explain: '9 + 4 is half the journey. Doubling it gives the whole way round: 2 x (9 + 4) = 26 units.'
  });

  A('m3', 'a2', {
    type: 'worked', skill: 'calc-perimeter',
    prompt: 'Finish the working. A photo frame is 12 cm long and 7 cm wide.',
    shape: { kind: 'rect', l: 12, w: 7, unit: 'cm', show: 'perimeter' },
    dims: { l: 12, w: 7 },
    steps: [
      { text: 'A frame goes around the edge, so we need the perimeter.' },
      { text: 'The four sides are 12, 7, 12 and 7 cm.' },
      { text: 'P = 2 x (12 + 7) = 2 x □', blank: 19 },
      { text: 'P = □ cm', blank: 38 }
    ],
    answer: 38, unit: 'cm', answerKind: 'length',
    hints: [
      'Work out the bracket first.',
      '12 + 7 = 19. Now double it.',
      '2 x 19 = 38 cm.'
    ],
    explain: 'P = 2 x (12 + 7) = 2 x 19 = 38 cm.'
  });

  A('m3', 'a3', {
    type: 'number', skill: 'calc-perimeter',
    prompt: 'A birthday card is 15 cm long and 10 cm wide. Crislyn wants a border right round the edge. ' +
      'How much border tape does she need?',
    context: 'card-border',
    shape: { kind: 'rect', l: 15, w: 10, unit: 'cm', show: 'perimeter' },
    dims: { l: 15, w: 10 },
    answer: 50, unit: 'cm', answerKind: 'length',
    hints: [
      'A border goes around the edge, so this is perimeter.',
      'P = 2 x (length + width).',
      'P = 2 x (15 + 10) = 2 x 25 = 50 cm.'
    ],
    explain: 'P = 2 x (15 + 10) = 50 cm of border tape.',
    wrongs: [{ value: 25, tag: 'added-two-sides' }, { value: 150, tag: 'multiplied-for-perimeter' }]
  });

  A('m3', 'a4', {
    type: 'mcq', skill: 'calc-perimeter',
    story: {
      title: 'Squares are even quicker',
      text: 'A square has four sides and every one of them is the same. ' +
        'So you do not need to add four numbers, or even two.',
      art: 'square'
    },
    prompt: 'A square tile has sides of 6 cm. Which sum gives its perimeter?',
    choices: [
      { label: '4 x 6', correct: true },
      { label: '6 x 6', correct: false, tag: 'multiplied-for-perimeter' },
      { label: '2 x 6', correct: false, tag: 'added-two-sides' }
    ],
    hints: [
      'How many sides does a square have?',
      'All four are 6 cm. So you need 6 four times.',
      '4 x 6 = 24 cm.'
    ],
    explain: 'A square has four equal sides, so P = 4 x side = 4 x 6 = 24 cm.'
  });

  A('m3', 'a5', {
    type: 'number', skill: 'calc-perimeter',
    prompt: 'A square cake has sides of 22 cm. How much ribbon goes around it?',
    context: 'cake-ribbon',
    shape: { kind: 'square', l: 22, w: 22, unit: 'cm', show: 'perimeter' },
    dims: { s: 22 },
    answer: 88, unit: 'cm', answerKind: 'length',
    hints: [
      'Ribbon goes around, so it is perimeter. The cake is a square.',
      'P = 4 x side.',
      'P = 4 x 22 = 88 cm.'
    ],
    explain: 'P = 4 x 22 = 88 cm of ribbon.',
    wrongs: [{ value: 484, tag: 'multiplied-for-perimeter' }, { value: 44, tag: 'added-two-sides' }]
  });

  A('m3', 'a6', {
    type: 'unit', skill: 'units',
    story: {
      title: 'cm or cm²?',
      text: 'Perimeter is <b>one line</b> going around the shape. A line has length, so it is measured in ' +
        'plain units: cm, m or km.<br><br>' +
        'The little 2 is for squares, and there are no squares in a line.',
      art: 'unitcard'
    },
    prompt: 'A fence goes around a field. Which unit should the answer use?',
    choices: [
      { label: 'm', correct: true },
      { label: 'm²', correct: false, tag: 'square-unit-for-perimeter' },
      { label: 'cm', correct: false, tag: 'wrong-magnitude-unit' }
    ],
    answerUnit: 'm',
    hints: [
      'Is a fence a line, or a surface?',
      'It is one long line, so no little 2.',
      'A field is big, so metres, not centimetres. The answer is m.'
    ],
    explain: 'A fence is a line around the edge, so it uses a plain unit — and a field is big, so metres.'
  });

  A('m3', 'a7', {
    type: 'missing', skill: 'calc-perimeter',
    prompt: 'A rectangle has a perimeter of 30 cm. One side is 9 cm. How long is the side next to it?',
    shape: { kind: 'rect', l: 9, w: null, unit: 'cm', show: 'perimeter', missing: true },
    dims: { known: 9 },
    answer: 6, unit: 'cm', answerKind: 'length',
    hints: [
      'The whole way round is two lengths and two widths.',
      'Half the perimeter is one length plus one width: 30 ÷ 2 = 15.',
      '15 − 9 = 6 cm.'
    ],
    worked: ['Perimeter = 2 x (length + width).', 'Half of 30 is 15, and that is length + width.',
             '15 − 9 = 6', 'The missing side is 6 cm.'],
    explain: 'Half of 30 is 15. Then 15 − 9 = 6 cm.',
    wrongs: [{ value: 21, tag: 'missed-a-side' }, { value: 7.5, tag: 'square-halved' }]
  });

  A('m3', 'a8', {
    type: 'missing', skill: 'calc-perimeter',
    prompt: 'A square has a perimeter of 36 m. How long is one side?',
    shape: { kind: 'square', l: null, w: null, unit: 'm', show: 'perimeter', missing: true },
    answer: 9, unit: 'm', answerKind: 'length',
    hints: [
      'A square has four equal sides.',
      'The perimeter was made by multiplying one side by 4. To go backwards, divide.',
      '36 ÷ 4 = 9 m.'
    ],
    worked: ['A square has 4 equal sides.', 'P = 4 x side, so side = P ÷ 4.', '36 ÷ 4 = 9', 'Each side is 9 m.'],
    explain: 'side = 36 ÷ 4 = 9 m.',
    wrongs: [{ value: 18, tag: 'square-halved' }, { value: 144, tag: 'multiplied-for-perimeter' }]
  });

  A('m3', 'a9', {
    type: 'mistake', skill: 'calc-perimeter',
    prompt: 'Omar worked out how much rope he needs around a playground 14 m by 9 m. Find the mistake.',
    shape: { kind: 'rect', l: 14, w: 9, unit: 'm', show: 'perimeter' },
    dims: { l: 14, w: 9 },
    workingShown: 'P = 2 x (14 + 9) = 46 m²',
    choices: [
      { label: 'The number is right but the unit should be m, not m²', correct: true },
      { label: 'He should have written 14 x 9', correct: false, tag: 'multiplied-for-perimeter' },
      { label: 'He should not have doubled it', correct: false, tag: 'added-two-sides' }
    ],
    answer: 46, answerUnit: 'm',
    hints: [
      'Check the working first, then check the unit.',
      '2 x (14 + 9) = 2 x 23 = 46. That part is perfect.',
      'Rope is a line, not a surface. Perimeter uses m, not m². So the answer is 46 m.'
    ],
    explain: 'The maths is right: 46. But perimeter measures one line going around the shape, so we use m, not m².'
  });

  A('m3', 'a10', {
    type: 'number', skill: 'calc-perimeter',
    prompt: 'The dance stage is 12 m long and 8 m wide. How much bright tape goes around its edge?',
    context: 'stage-tape',
    shape: { kind: 'rect', l: 12, w: 8, unit: 'm', show: 'perimeter' },
    dims: { l: 12, w: 8 },
    answer: 40, unit: 'm', answerKind: 'length',
    hints: [
      'Tape around the edge is a border job, so it is perimeter.',
      'P = 2 x (12 + 8).',
      'P = 2 x 20 = 40 m.'
    ],
    explain: 'P = 2 x (12 + 8) = 40 m of tape.',
    wrongs: [{ value: 96, tag: 'multiplied-for-perimeter' }, { value: 20, tag: 'added-two-sides' }]
  });

  A('m3', 'a11', {
    type: 'match', skill: 'calc-perimeter',
    prompt: 'Match each shape to the sum that finds its perimeter.',
    left: [
      { id: 'p1', text: 'A rectangle 10 cm by 6 cm' },
      { id: 'p2', text: 'A square of side 10 cm' },
      { id: 'p3', text: 'A rectangle 12 cm by 4 cm' }
    ],
    right: [
      { id: 'p2', text: '4 x 10 = 40 cm' },
      { id: 'p3', text: '2 x (12 + 4) = 32 cm' },
      { id: 'p1', text: '2 x (10 + 6) = 32 cm' }
    ],
    hints: [
      'Squares use 4 x side. Rectangles use 2 x (length + width).',
      'Two of these give 32 cm, so read the numbers inside the brackets carefully.',
      'Match the numbers in the sum to the numbers on the shape.'
    ],
    explain: 'A square uses 4 x side. A rectangle uses 2 x (length + width). Two different rectangles can share ' +
      'the same perimeter, which is why you must check the numbers, not just the answer.'
  });

  /* ====================================================================== */
  /*  MISSION 4 — FILL THE FLOOR                                            */
  /*  Counting squares. Still no area formula.                              */
  /* ====================================================================== */

  A('m4', 'a1', {
    type: 'tiles', skill: 'count-squares',
    story: {
      title: 'Back to the mats',
      text: 'The stage floor needs covering, and the caretaker will ask how many mats to bring.<br><br>' +
        'Each mat is exactly 1 square unit. Lay them down with <b>no gaps</b> and <b>no overlaps</b>, ' +
        'then count them.',
      art: 'tiles'
    },
    prompt: 'Cover this floor with mats, then tell us how many it took.',
    shape: { cells: rc(5, 3), unit: 'units' },
    dims: { l: 5, w: 3 },
    answer: 15, answerKind: 'count', unit: null,
    hints: [
      'Fill one row all the way across first.',
      'One row holds 5 mats. Now count the rows.',
      'There are 3 rows of 5 mats: 15 altogether.'
    ],
    explain: '3 rows of 5 mats is 15 mats. That count is the area.',
    wrongs: [{ value: 16, tag: 'chose-perimeter-for-cover' }, { value: 5, tag: 'used-one-row' }]
  });

  A('m4', 'a2', {
    type: 'mcq', skill: 'count-squares',
    prompt: 'Why do the mats have to be laid with no gaps and no overlaps?',
    choices: [
      { label: 'So every square of floor is counted exactly once', correct: true },
      { label: 'So the mats look neat', correct: false, tag: 'counted-corner-twice' },
      { label: 'So they fit in the box', correct: false, tag: 'counted-corner-twice' }
    ],
    hints: [
      'Think what would happen to your count if two mats sat on top of each other.',
      'An overlap counts the same bit of floor twice. A gap misses a bit out.',
      'Area only works if every square is counted once.'
    ],
    explain: 'Area is how many equal squares fit inside. A gap misses floor out; an overlap counts it twice. ' +
      'Either way the number would be wrong.'
  });

  A('m4', 'a3', {
    type: 'tiles', skill: 'count-squares',
    prompt: 'A bigger floor. Cover it and count the tiles.',
    shape: { cells: rc(7, 4), unit: 'units' },
    dims: { l: 7, w: 4 },
    answer: 28, answerKind: 'count', unit: null,
    hints: [
      'Do it row by row rather than jumping about.',
      'Each row holds 7 tiles, and there are 4 rows.',
      '4 rows of 7 is 28 tiles.'
    ],
    explain: '4 rows of 7 tiles is 28 tiles, so the area is 28 square units.',
    wrongs: [{ value: 22, tag: 'chose-perimeter-for-cover' }, { value: 7, tag: 'used-one-row' }]
  });

  A('m4', 'a4', {
    type: 'mcq', skill: 'count-squares',
    story: {
      title: 'Noor counted the wrong squares',
      text: 'Noor was asked for the area of a floor 6 tiles by 4 tiles. She counted only the tiles ' +
        'touching the wall, all the way round, and said 16.',
      art: 'tiles'
    },
    prompt: 'What did Noor forget?',
    choices: [
      { label: 'The tiles in the middle are part of the floor too', correct: true },
      { label: 'She should have counted the edges twice', correct: false, tag: 'counted-corner-twice' },
      { label: 'She should have added 6 and 4', correct: false, tag: 'added-for-area' }
    ],
    hints: [
      'Picture the floor. Which tiles did she leave out?',
      'She counted a ring around the outside and stopped.',
      'Area counts EVERY square inside, middle ones included: 24, not 16.'
    ],
    explain: 'Noor counted only the ring around the edge. Area counts every square inside the shape, ' +
      'so the answer is 24 tiles.'
  });

  A('m4', 'a5', {
    type: 'number', skill: 'count-squares',
    prompt: 'This floor has 6 tiles in each row and there are 5 rows. How many tiles altogether?',
    shape: { cells: rc(6, 5), unit: 'units' },
    dims: { l: 6, w: 5 },
    answer: 30, answerKind: 'count', unit: null,
    hints: [
      'You do not have to count them one at a time.',
      'Every row has the same number, so you can add 6 five times — or multiply.',
      '5 rows of 6 = 30 tiles.'
    ],
    explain: '5 rows with 6 tiles in each is 30 tiles.',
    wrongs: [{ value: 11, tag: 'added-for-area' }, { value: 22, tag: 'chose-perimeter-for-cover' }]
  });

  A('m4', 'a6', {
    type: 'tiles', skill: 'count-squares',
    prompt: 'An L-shaped room. Cover every part of the floor and count the tiles.',
    shape: { cells: lc(5, 4, 2, 2), unit: 'units' },
    answer: 16, answerKind: 'count', unit: null,
    hints: [
      'Do the big part first, then the smaller part.',
      'The notch is not part of the room, so nothing goes there.',
      'Counting the whole L gives 16 tiles.'
    ],
    explain: 'The L-shaped floor holds 16 tiles. Area works on any shape, not just rectangles.',
    wrongs: [{ value: 20, tag: 'counted-corner-twice' }, { value: 18, tag: 'chose-perimeter-for-cover' }]
  });

  A('m4', 'a7', {
    type: 'unit', skill: 'units',
    story: {
      title: 'Why area needs a square unit',
      text: 'Area is a count of <b>squares</b>. So the unit has to say "square" too.<br><br>' +
        'One square with sides of 1 cm is <b>1 square centimetre</b>, written <b>cm²</b>.<br><br>' +
        'That little 2 is not decoration. It is telling you these are squares.',
      art: 'unitcard'
    },
    prompt: 'A noticeboard is covered with coloured paper. Which unit should the answer use?',
    choices: [
      { label: 'cm²', correct: true },
      { label: 'cm', correct: false, tag: 'linear-unit-for-area' },
      { label: 'km²', correct: false, tag: 'wrong-magnitude-unit' }
    ],
    answerUnit: 'cm2',
    hints: [
      'Is paper covering a surface, or running along an edge?',
      'It covers, so it is area — and area counts squares.',
      'A noticeboard is small, so cm².'
    ],
    explain: 'Covering a surface is area, so the unit needs its square: cm² for something the size of a noticeboard.'
  });

  A('m4', 'a8', {
    type: 'tiles', skill: 'count-squares',
    prompt: 'One more. Cover this floor and count.',
    shape: { cells: rc(8, 3), unit: 'units' },
    dims: { l: 8, w: 3 },
    answer: 24, answerKind: 'count', unit: null,
    hints: [
      'Row by row again.',
      '8 tiles in a row, 3 rows.',
      '3 x 8 = 24 tiles.'
    ],
    explain: '3 rows of 8 is 24 tiles.',
    wrongs: [{ value: 22, tag: 'chose-perimeter-for-cover' }, { value: 11, tag: 'added-for-area' }]
  });

  A('m4', 'a9', {
    type: 'compare', skill: 'count-squares',
    prompt: 'Two floors. Which one needs MORE tiles to cover it?',
    shapes: [
      { key: 'A', l: 6, w: 2, cells: rc(6, 2), area: 12, perimeter: 16 },
      { key: 'B', l: 4, w: 4, cells: rc(4, 4), area: 16, perimeter: 16 }
    ],
    choices: [
      { label: 'Shape B', correct: true },
      { label: 'Shape A', correct: false, tag: 'ordered-by-eye' },
      { label: 'They are the same', correct: false, tag: 'same-area-same-perimeter' }
    ],
    fact: 'Same perimeter (16), different areas (12 and 16).',
    hints: [
      'Trace around each one. Both journeys are 16 steps — so that is not the difference.',
      'Now count the tiles inside each.',
      'A holds 12 tiles, B holds 16. Same border, different cover.'
    ],
    explain: 'Both have a border of 16 steps, but A holds 12 tiles and B holds 16. ' +
      'Same perimeter does not mean same area.'
  });

  A('m4', 'a10', {
    type: 'mcq', skill: 'count-squares',
    prompt: 'A floor is 9 tiles by 4 tiles. What is the quickest correct way to find how many tiles?',
    choices: [
      { label: 'Count one row, then count the rows, then multiply', correct: true },
      { label: 'Count every tile one at a time', correct: false },
      { label: 'Add 9 and 4', correct: false, tag: 'added-for-area' }
    ],
    hints: [
      'Counting one at a time works, but it is slow and easy to lose your place.',
      'Every row holds the same number of tiles.',
      '9 in a row, 4 rows, so 4 x 9 = 36.'
    ],
    explain: 'Counting one at a time is not wrong, just slow. Because every row is the same, ' +
      'you can count one row and multiply by the number of rows: 4 x 9 = 36.'
  });

  A('m4', 'a11', {
    type: 'explain', skill: 'count-squares',
    prompt: 'What does the area of a floor actually tell you?',
    keywords: ['squares', 'cover', 'tiles', 'inside', 'surface', 'how many', 'fit'],
    model: 'It tells you how many equal squares are needed to cover the whole surface inside.',
    hints: [
      'Think about what you counted.',
      'Say it in terms of tiles or squares.',
      'One good answer: how many equal squares it takes to cover the whole surface.'
    ],
    explain: 'Area tells you how many equal squares are needed to cover the whole surface inside a shape. ' +
      'Perimeter goes around. Area covers the ground.'
  });

  /* ====================================================================== */
  /*  MISSION 5 — AREA SHORTCUTS                                            */
  /* ====================================================================== */

  A('m5', 'a1', {
    type: 'mcq', skill: 'calc-area',
    story: {
      title: 'Counting 48 tiles is slow',
      text: 'You already know why: every row holds the same number.<br><br>' +
        'If a floor has <b>8 tiles in a row</b> and there are <b>6 rows</b>, you do not have to count to 48. ' +
        'You can go straight to <b>6 x 8</b>.<br><br>' +
        'The row length is the <b>length</b>. The number of rows is the <b>width</b>. ' +
        'So <b>area = length x width</b>.',
      art: 'rows'
    },
    prompt: 'A floor is 8 tiles long and 6 tiles wide. Which sum gives its area?',
    choices: [
      { label: '8 x 6', correct: true },
      { label: '8 + 6', correct: false, tag: 'added-for-area' },
      { label: '2 x (8 + 6)', correct: false, tag: 'chose-perimeter-for-cover' }
    ],
    hints: [
      'How many tiles in one row? How many rows?',
      '8 in a row, and 6 rows of them.',
      '6 lots of 8 is 8 x 6 = 48.'
    ],
    explain: 'Each of the 6 rows holds 8 tiles, so the area is 8 x 6 = 48 square units.'
  });

  A('m5', 'a2', {
    type: 'worked', skill: 'calc-area',
    prompt: 'Finish the working. A noticeboard is 9 cm by 5 cm and needs covering with paper.',
    shape: { cells: rc(9, 5), kind: 'rect', l: 9, w: 5, unit: 'cm', show: 'area', labels: { area: 45 } },
    dims: { l: 9, w: 5 },
    steps: [
      { text: 'Paper covers the inside, so we need the area.' },
      { text: 'It holds 5 rows with 9 squares in each.' },
      { text: 'A = 9 x 5 = □', blank: 45 },
      { text: 'The unit must be □', blankUnit: 'cm2' }
    ],
    answer: 45, unit: 'cm2', answerKind: 'area',
    hints: [
      'Multiply the two sides for the number, then think about the unit.',
      '9 x 5 = 45.',
      'Area counts squares, so the answer is 45 cm².'
    ],
    explain: 'A = 9 x 5 = 45 cm². The square unit is part of the answer, not an extra.'
  });

  A('m5', 'a3', {
    type: 'number', skill: 'calc-area',
    prompt: 'A bedroom floor is 6 m long and 4 m wide. How much carpet is needed to cover it?',
    context: 'bedroom-carpet',
    shape: { cells: rc(6, 4), kind: 'rect', l: 6, w: 4, unit: 'm', show: 'area', labels: { area: 24 } },
    dims: { l: 6, w: 4 },
    answer: 24, unit: 'm2', answerKind: 'area',
    hints: [
      'Carpet covers the floor, so this is area.',
      'A = length x width.',
      'A = 6 x 4 = 24 m².'
    ],
    explain: 'A = 6 x 4 = 24 m² of carpet.',
    wrongs: [{ value: 20, tag: 'chose-perimeter-for-cover' }, { value: 10, tag: 'added-for-area' }]
  });

  A('m5', 'a4', {
    type: 'mcq', skill: 'calc-area',
    story: {
      title: 'Squares again',
      text: 'A square has equal sides, so its rows and its columns hold the same number.<br><br>' +
        '<b>Area of a square = side x side.</b>',
      art: 'square'
    },
    prompt: 'A square tile has sides of 7 cm. Which sum gives its area?',
    choices: [
      { label: '7 x 7', correct: true },
      { label: '4 x 7', correct: false, tag: 'chose-perimeter-for-cover' },
      { label: '7 + 7', correct: false, tag: 'added-for-area' }
    ],
    hints: [
      'How many squares in one row? How many rows?',
      'Both are 7, because it is a square.',
      '7 x 7 = 49 cm².'
    ],
    explain: 'A square of side 7 holds 7 rows of 7, so the area is 7 x 7 = 49 cm². ' +
      '(4 x 7 would be its perimeter.)'
  });

  A('m5', 'a5', {
    type: 'number', skill: 'calc-area',
    prompt: 'A square window is 90 cm on each side. How much fabric covers it?',
    shape: { kind: 'square', l: 90, w: 90, unit: 'cm', show: 'area' },
    dims: { s: 90 },
    answer: 8100, unit: 'cm2', answerKind: 'area',
    hints: [
      'Fabric covers the surface, so this is area.',
      'A = side x side.',
      'A = 90 x 90 = 8100 cm².'
    ],
    explain: 'A = 90 x 90 = 8100 cm².',
    wrongs: [{ value: 360, tag: 'chose-perimeter-for-cover' }, { value: 180, tag: 'added-for-area' }]
  });

  A('m5', 'a6', {
    type: 'mistake', skill: 'calc-area',
    prompt: 'Priya worked out the paint needed for a wall 5 m by 3 m. Find the mistake.',
    shape: { cells: rc(5, 3), kind: 'rect', l: 5, w: 3, unit: 'm', show: 'area', labels: { area: 15 } },
    dims: { l: 5, w: 3 },
    workingShown: 'A = 5 x 3 = 15 m',
    choices: [
      { label: 'The number is right but the unit is missing its square', correct: true },
      { label: 'She should have added 5 and 3', correct: false, tag: 'added-for-area' },
      { label: 'She should have used 2 x (5 + 3)', correct: false, tag: 'chose-perimeter-for-cover' }
    ],
    answer: 15, answerUnit: 'm2',
    hints: [
      'Check the number first. Is 5 x 3 = 15 correct?',
      'Yes. So look at what comes after the number.',
      'Area counts little squares, so the unit also needs a square: the answer is 15 m².'
    ],
    explain: 'The working is perfect. But area counts little squares, so the unit also needs a square: 15 m².'
  });

  A('m5', 'a7', {
    type: 'missing', skill: 'calc-area',
    prompt: 'A rug covers 32 m². It is 8 m long. How wide is it?',
    shape: { kind: 'rect', l: 8, w: null, unit: 'm', show: 'area', missing: true },
    dims: { known: 8 },
    answer: 4, unit: 'm', answerKind: 'length',
    hints: [
      'The area was made by multiplying the two sides.',
      'To undo a multiplication, divide.',
      '32 ÷ 8 = 4 m.'
    ],
    worked: ['Area = length x width.', 'So width = area ÷ length.', '32 ÷ 8 = 4',
             'The rug is 4 m wide. Note that is m, not m² — a side is a length.'],
    explain: '32 ÷ 8 = 4 m. The answer is a side, so it is m and not m².',
    wrongs: [{ value: 24, tag: 'added-for-area' }, { value: 16, tag: 'divided-wrong-way' }]
  });

  A('m5', 'a8', {
    type: 'number', skill: 'calc-area',
    prompt: 'The dance stage is 12 m long and 8 m wide. How many square metres of mats cover it?',
    context: 'stage-mats',
    shape: { kind: 'rect', l: 12, w: 8, unit: 'm', show: 'area' },
    dims: { l: 12, w: 8 },
    answer: 96, unit: 'm2', answerKind: 'area',
    hints: [
      'Mats cover the floor, so this is area.',
      'A = 12 x 8.',
      'A = 96 m².'
    ],
    explain: 'A = 12 x 8 = 96 m² of mats. Earlier you found the tape around the same stage was 40 m — ' +
      'the same stage gives two completely different numbers.',
    wrongs: [{ value: 40, tag: 'chose-perimeter-for-cover' }, { value: 20, tag: 'added-for-area' }]
  });

  A('m5', 'a9', {
    type: 'unit', skill: 'units',
    prompt: 'A football pitch is covered with grass. Which unit should the answer use?',
    choices: [
      { label: 'm²', correct: true },
      { label: 'm', correct: false, tag: 'linear-unit-for-area' },
      { label: 'cm²', correct: false, tag: 'wrong-magnitude-unit' }
    ],
    answerUnit: 'm2',
    hints: [
      'Grass covers the surface, so it is area.',
      'Area always needs the little 2.',
      'A pitch is big, so metres — m².'
    ],
    explain: 'Grass covers a surface, so it is an area. A pitch is big, so square metres: m².'
  });

  A('m5', 'a10', {
    type: 'match', skill: 'calc-area',
    prompt: 'Match each job to the sum that answers it. Look carefully — two are about the same room.',
    left: [
      { id: 'q1', text: 'Carpet covering a room 7 m by 5 m' },
      { id: 'q2', text: 'Skirting around that same room' },
      { id: 'q3', text: 'Icing on a square cake of side 20 cm' }
    ],
    right: [
      { id: 'q3', text: '20 x 20 = 400 cm²' },
      { id: 'q1', text: '7 x 5 = 35 m²' },
      { id: 'q2', text: '2 x (7 + 5) = 24 m' }
    ],
    hints: [
      'Decide border or cover for each one first.',
      'Carpet covers, skirting goes around, icing covers.',
      'The units help: only the covering jobs have a little 2.'
    ],
    explain: 'The same room needs 35 m² of carpet but only 24 m of skirting. ' +
      'Border and cover give different numbers AND different units.'
  });

  A('m5', 'a11', {
    type: 'number', skill: 'calc-area',
    prompt: 'A kitchen floor is 5 m by 4 m. Tiles come in squares of 1 m². How many tiles are needed?',
    context: 'kitchen-tiles',
    shape: { cells: rc(5, 4), kind: 'rect', l: 5, w: 4, unit: 'm', show: 'area', labels: { area: 20 } },
    dims: { l: 5, w: 4 },
    answer: 20, unit: 'm2', answerKind: 'area',
    hints: [
      'Each tile covers exactly 1 square metre.',
      'So the number of tiles is the same as the area in m².',
      'A = 5 x 4 = 20, so 20 tiles.'
    ],
    explain: 'A = 5 x 4 = 20 m², and since each tile is 1 m², that is 20 tiles.',
    wrongs: [{ value: 18, tag: 'chose-perimeter-for-cover' }, { value: 9, tag: 'added-for-area' }]
  });

  /* ====================================================================== */
  /*  MISSION 6 — MEASUREMENT DETECTIVE                                     */
  /*  Mixed. Every one shows the consequence of choosing wrong.             */
  /* ====================================================================== */

  A('m6', 'a1', {
    type: 'mission', skill: 'real-life',
    story: {
      title: 'The detective’s question',
      text: 'From here on, nobody tells you whether it is perimeter or area. You have to decide.<br><br>' +
        'Every time, ask yourself the same short question first: <b>Border or cover?</b><br><br>' +
        'Then a detective asks three more: which measurement, which unit, and what is the sum.',
      art: 'detective'
    },
    prompt: 'Mr Alan is buying fencing for the school garden. The garden is 15 m long and 9 m wide.',
    job: { id: 'garden-fence', what: 'A fence around a garden',
      why: 'A fence with a gap is not a fence — it has to close all the way round.',
      verb: 'fencing', buy: 'fencing' },
    shape: { kind: 'rect', l: 15, w: 9, unit: 'm', show: 'perimeter' },
    dims: { l: 15, w: 9 },
    steps: [
      { ask: 'Does a fence go around the edge, or cover the inside?',
        options: [{ label: 'Around the edge', correct: true }, { label: 'Covers the inside', correct: false }],
        tagWrong: 'chose-area-for-border' },
      { ask: 'So what do we measure?',
        options: [{ label: 'Perimeter', correct: true }, { label: 'Area', correct: false }],
        tagWrong: 'chose-area-for-border' },
      { ask: 'Which unit will the answer use?',
        options: [{ label: 'm', correct: true }, { label: 'm²', correct: false }],
        tagWrong: 'square-unit-for-perimeter' },
      { ask: 'Now work it out.', numeric: true, answer: 48, unit: 'm' }
    ],
    answer: 48, unit: 'm', answerKind: 'length',
    consequence: 'If Mr Alan had measured the area instead, he would have ordered 135 m² of fencing. ' +
      'The shop sells fencing by the metre, so he would have been asking for something that does not exist.',
    hints: ['Border or cover? A fence has to close all the way round.',
            'Border job. Add all four sides.',
            'P = 2 x (15 + 9) = 48 m.'],
    explain: 'A fence is a border job: P = 2 x (15 + 9) = 48 m.'
  });

  A('m6', 'a2', {
    type: 'mission', skill: 'real-life',
    prompt: 'The same garden, 15 m by 9 m, is now being planted with grass.',
    job: { id: 'garden-flowers', what: 'Grass covering a garden',
      why: 'Grass fills the ground inside the fence.', verb: 'turf', buy: 'rolls of turf' },
    shape: { kind: 'rect', l: 15, w: 9, unit: 'm', show: 'area' },
    dims: { l: 15, w: 9 },
    steps: [
      { ask: 'Does grass go around the edge, or cover the inside?',
        options: [{ label: 'Covers the inside', correct: true }, { label: 'Around the edge', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'So what do we measure?',
        options: [{ label: 'Area', correct: true }, { label: 'Perimeter', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'Which unit will the answer use?',
        options: [{ label: 'm²', correct: true }, { label: 'm', correct: false }],
        tagWrong: 'linear-unit-for-area' },
      { ask: 'Now work it out.', numeric: true, answer: 135, unit: 'm2' }
    ],
    answer: 135, unit: 'm2', answerKind: 'area',
    consequence: 'Exactly the same garden as the last question — but 135 m² of grass, not 48 m of fence. ' +
      'The object did not change. The job did.',
    hints: ['Grass fills the ground inside the fence.', 'Cover job. Multiply the two sides.',
            'A = 15 x 9 = 135 m².'],
    explain: 'Grass is a cover job: A = 15 x 9 = 135 m².'
  });

  A('m6', 'a3', {
    type: 'mcq', skill: 'real-life',
    prompt: 'Leena bought carpet by measuring around the walls of her room instead of across the floor. ' +
      'What will happen when it arrives?',
    choices: [
      { label: 'It will be a long thin strip that cannot cover the floor', correct: true },
      { label: 'It will be slightly too small but will nearly fit', correct: false, tag: 'chose-perimeter-for-cover' },
      { label: 'It will fit perfectly', correct: false, tag: 'chose-perimeter-for-cover' }
    ],
    hints: [
      'What shape is a perimeter measurement? A line, or a surface?',
      'She has measured a line going around the edge.',
      'Carpet has to cover a surface. A line measurement cannot describe one.'
    ],
    explain: 'Perimeter is a length, so she has described a long thin strip. Carpet covers a surface, ' +
      'which needs an area in m². This is why the units matter.'
  });

  A('m6', 'a4', {
    type: 'mission', skill: 'real-life',
    prompt: 'Tara is putting lights around her bedroom window. The window is 120 cm by 90 cm.',
    job: { id: 'window-lights', what: 'Lights around a window',
      why: 'The lights are one long string that has to reach right around the frame.',
      verb: 'lights', buy: 'a string of lights' },
    shape: { kind: 'rect', l: 120, w: 90, unit: 'cm', show: 'perimeter' },
    dims: { l: 120, w: 90 },
    steps: [
      { ask: 'Around the edge, or covering the inside?',
        options: [{ label: 'Around the edge', correct: true }, { label: 'Covering the inside', correct: false }],
        tagWrong: 'chose-area-for-border' },
      { ask: 'So what do we measure?',
        options: [{ label: 'Perimeter', correct: true }, { label: 'Area', correct: false }],
        tagWrong: 'chose-area-for-border' },
      { ask: 'Which unit?',
        options: [{ label: 'cm', correct: true }, { label: 'cm²', correct: false }],
        tagWrong: 'square-unit-for-perimeter' },
      { ask: 'Now work it out.', numeric: true, answer: 420, unit: 'cm' }
    ],
    answer: 420, unit: 'cm', answerKind: 'length',
    consequence: 'A string of lights is one long line. If Tara had worked out the area she would have asked ' +
      'for 10800 cm² of lights, and no shop sells lights by the square centimetre.',
    hints: ['The lights are one long string around the frame.', 'Border job: 2 x (120 + 90).',
            'P = 2 x 210 = 420 cm.'],
    explain: 'P = 2 x (120 + 90) = 420 cm of lights.'
  });

  A('m6', 'a5', {
    type: 'mcq', skill: 'real-life',
    prompt: 'A shop sells paint in tins. Each tin says "covers 10 m²". What does the painter need to ' +
      'measure before buying?',
    choices: [
      { label: 'The area of the wall', correct: true },
      { label: 'The perimeter of the wall', correct: false, tag: 'chose-perimeter-for-cover' },
      { label: 'The length of the longest side', correct: false, tag: 'added-two-sides' }
    ],
    hints: [
      'Read the tin. What unit is on it?',
      'm² is a square unit, so the tin is talking about a surface.',
      'Paint covers the wall, so he needs the area.'
    ],
    explain: 'The tin is labelled in m², a square unit, so it is telling you how much surface it covers. ' +
      'The painter needs the area of the wall.'
  });

  A('m6', 'a6', {
    type: 'mission', skill: 'real-life',
    prompt: 'Miss Rosy is covering the classroom noticeboard with coloured paper. It is 150 cm by 100 cm.',
    job: { id: 'board-paper', what: 'Coloured paper covering a noticeboard',
      why: 'The paper has to cover the whole board before anything is pinned up.',
      verb: 'coloured paper', buy: 'coloured paper' },
    shape: { kind: 'rect', l: 150, w: 100, unit: 'cm', show: 'area' },
    dims: { l: 150, w: 100 },
    steps: [
      { ask: 'Around the edge, or covering the inside?',
        options: [{ label: 'Covering the inside', correct: true }, { label: 'Around the edge', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'So what do we measure?',
        options: [{ label: 'Area', correct: true }, { label: 'Perimeter', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'Which unit?',
        options: [{ label: 'cm²', correct: true }, { label: 'cm', correct: false }],
        tagWrong: 'linear-unit-for-area' },
      { ask: 'Now work it out.', numeric: true, answer: 15000, unit: 'cm2' }
    ],
    answer: 15000, unit: 'cm2', answerKind: 'area',
    consequence: 'If she had measured around the board she would have bought a 500 cm ribbon of paper — ' +
      'long enough to go round, but nowhere near enough to cover it.',
    hints: ['The paper has to cover the whole board.', 'Cover job: 150 x 100.',
            'A = 15000 cm².'],
    explain: 'A = 150 x 100 = 15000 cm² of paper.'
  });

  A('m6', 'a7', {
    type: 'unit', skill: 'units',
    prompt: 'Rope around the playground. Which unit?',
    choices: [
      { label: 'm', correct: true },
      { label: 'm²', correct: false, tag: 'square-unit-for-perimeter' },
      { label: 'km', correct: false, tag: 'wrong-magnitude-unit' }
    ],
    answerUnit: 'm',
    hints: ['Rope is a line, not a surface.', 'So no little 2.',
            'A playground is a few tens of metres across, so m — km would be far too big.'],
    explain: 'Rope goes around, so it is a length in m. Not m² (that is for surfaces), and not km ' +
      '(a playground is nowhere near a kilometre).'
  });

  A('m6', 'a8', {
    type: 'mcq', skill: 'real-life',
    story: {
      title: 'Two answers, one cake',
      text: 'A square cake has sides of 20 cm. Maya needs ribbon around it and icing on top.',
      art: 'cake'
    },
    prompt: 'Which pair of answers is right?',
    choices: [
      { label: 'Ribbon 80 cm, icing 400 cm²', correct: true },
      { label: 'Ribbon 400 cm, icing 80 cm²', correct: false, tag: 'chose-area-for-border' },
      { label: 'Ribbon 80 cm², icing 400 cm', correct: false, tag: 'square-unit-for-perimeter' }
    ],
    hints: [
      'Do the ribbon first. It goes around a square: 4 x side.',
      '4 x 20 = 80 cm. Now the icing covers: side x side.',
      '20 x 20 = 400 cm². Check the units on each.'
    ],
    explain: 'Ribbon goes around: 4 x 20 = 80 cm. Icing covers: 20 x 20 = 400 cm². ' +
      'Same cake, two jobs, two numbers, two different units.'
  });

  A('m6', 'a9', {
    type: 'mission', skill: 'real-life',
    prompt: 'Sam is laying sand in the play area. It is 9 m by 7 m.',
    job: { id: 'playarea-sand', what: 'Sand covering a play area',
      why: 'The sand spreads over the whole area to make it soft to land on.',
      verb: 'sand', buy: 'sand' },
    shape: { kind: 'rect', l: 9, w: 7, unit: 'm', show: 'area' },
    dims: { l: 9, w: 7 },
    steps: [
      { ask: 'Around the edge, or covering the inside?',
        options: [{ label: 'Covering the inside', correct: true }, { label: 'Around the edge', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'So what do we measure?',
        options: [{ label: 'Area', correct: true }, { label: 'Perimeter', correct: false }],
        tagWrong: 'chose-perimeter-for-cover' },
      { ask: 'Which unit?',
        options: [{ label: 'm²', correct: true }, { label: 'm', correct: false }],
        tagWrong: 'linear-unit-for-area' },
      { ask: 'Now work it out.', numeric: true, answer: 63, unit: 'm2' }
    ],
    answer: 63, unit: 'm2', answerKind: 'area',
    consequence: 'Sand is delivered by the square metre of coverage. Order 32 m of sand and the yard ' +
      'will not know what you mean.',
    hints: ['Sand spreads over the whole area.', 'Cover job: 9 x 7.', 'A = 63 m².'],
    explain: 'A = 9 x 7 = 63 m² of sand.'
  });

  A('m6', 'a10', {
    type: 'mistake', skill: 'real-life',
    prompt: 'Kiran worked out how much lace is needed around a tablecloth 140 cm by 90 cm. Find the mistake.',
    shape: { kind: 'rect', l: 140, w: 90, unit: 'cm', show: 'perimeter' },
    dims: { l: 140, w: 90 },
    workingShown: 'Lace = 140 x 90 = 12600 cm',
    choices: [
      { label: 'Lace goes around, so the sides should be added, not multiplied', correct: true },
      { label: 'The unit should have been cm²', correct: false, tag: 'square-unit-for-perimeter' },
      { label: 'He should have divided instead', correct: false, tag: 'divided-wrong-way' }
    ],
    answer: 460, answerUnit: 'cm',
    hints: [
      'Is lace a border job or a cover job?',
      'It is sewn along the edge, so it is perimeter — and perimeter adds.',
      'P = 2 x (140 + 90) = 460 cm.'
    ],
    explain: 'Multiplying the sides fills the inside with squares. Lace runs along the edge, so we add: ' +
      'P = 2 x (140 + 90) = 460 cm.'
  });

  A('m6', 'a11', {
    type: 'match', skill: 'real-life',
    prompt: 'Four jobs, four sums. Match them up.',
    left: [
      { id: 'r1', text: 'Tiles for a kitchen floor 6 m by 3 m' },
      { id: 'r2', text: 'Skirting around that kitchen' },
      { id: 'r3', text: 'A frame around a photo 12 cm by 8 cm' },
      { id: 'r4', text: 'Glass covering that photo' }
    ],
    right: [
      { id: 'r3', text: '2 x (12 + 8) = 40 cm' },
      { id: 'r1', text: '6 x 3 = 18 m²' },
      { id: 'r4', text: '12 x 8 = 96 cm²' },
      { id: 'r2', text: '2 x (6 + 3) = 18 m' }
    ],
    hints: [
      'Sort them into border jobs and cover jobs first.',
      'Tiles and glass cover. Skirting and frame go around.',
      'Watch out: two answers are 18, but one is m² and one is m. The unit tells them apart.'
    ],
    explain: 'Two of these answers are both 18 — but 18 m² of tiles and 18 m of skirting are ' +
      'completely different things. The unit is what tells you which job was done.'
  });

  A('m6', 'a12', {
    type: 'explain', skill: 'real-life',
    prompt: 'A friend says "I need 30 metres of carpet for my room." What would you tell them?',
    keywords: ['area', 'square', 'cover', 'm2', 'm²', 'floor', 'wrong', 'metre'],
    model: 'Carpet covers the floor, so it is sold in square metres. They need an area in m², not a length in m.',
    hints: [
      'Is carpet a border job or a cover job?',
      'Think about what unit a carpet shop would actually use.',
      'One good answer: carpet covers, so it needs m², not m.'
    ],
    explain: 'Carpet covers a surface, so it is measured in square metres. Asking for 30 m of carpet ' +
      'describes a long thin strip, not a floor.'
  });

  /* ====================================================================== */
  /*  MISSION 7 — SHAPE LAB                                                 */
  /*  Building, not answering. Whole numbers only.                          */
  /* ====================================================================== */

  A('m7', 'a1', {
    type: 'build', skill: 'compare',
    story: {
      title: 'Welcome to the Shape Lab',
      text: 'No questions here — you build the shapes yourself.<br><br>' +
        'Tap or drag on the grid to add tiles. The lab counts the area and the perimeter for you as ' +
        'you go, so you can watch what happens when you change the shape.',
      art: 'lab'
    },
    prompt: 'Build any shape with an area of exactly 12 tiles.',
    target: { area: 12 },
    hints: [
      'Any shape at all, as long as it uses 12 tiles.',
      'You could do 3 rows of 4, or 2 rows of 6, or something wobbly.',
      'Keep adding tiles until the area counter reads 12.'
    ],
    explain: 'There are many shapes with an area of 12. They do not all have the same perimeter.'
  });

  A('m7', 'a2', {
    type: 'build', skill: 'compare',
    prompt: 'Now build a rectangle with an area of exactly 12 tiles.',
    target: { area: 12, rectangle: true },
    hints: [
      'A rectangle has straight sides and square corners.',
      'Which two numbers multiply to make 12?',
      '1 x 12, 2 x 6 or 3 x 4 all work.'
    ],
    explain: 'The rectangles with area 12 are 1 x 12, 2 x 6 and 3 x 4. Three different shapes, same area.'
  });

  A('m7', 'a3', {
    type: 'build', skill: 'compare',
    prompt: 'Build a DIFFERENT rectangle that also has an area of 12. Then look at both perimeters.',
    target: { area: 12, rectangle: true, differentFrom: 'm7-a2' },
    hints: [
      'If you built 3 x 4 last time, try 2 x 6 this time.',
      'The area counter should still read 12.',
      'Watch the perimeter counter — it will not be the same as before.'
    ],
    explain: '3 x 4 has a perimeter of 14. 2 x 6 has a perimeter of 16. 1 x 12 has a perimeter of 26. ' +
      'Same area, three different perimeters.'
  });

  A('m7', 'a4', {
    type: 'mcq', skill: 'compare',
    prompt: 'You just built two rectangles with the same area but different perimeters. Which shape had the LONGEST border?',
    choices: [
      { label: 'The longest, thinnest one', correct: true },
      { label: 'The one closest to a square', correct: false, tag: 'ordered-by-eye' },
      { label: 'They were equal', correct: false, tag: 'same-area-same-perimeter' }
    ],
    hints: [
      'Think about 1 x 12 against 3 x 4.',
      '1 x 12 stretches a long way in one direction, so its edge is very long.',
      'Long and thin gives the longest border for the same area.'
    ],
    explain: 'Stretching a shape long and thin makes its border much longer without changing its area at all. ' +
      '1 x 12 has a perimeter of 26; 3 x 4 has only 14.'
  });

  A('m7', 'a5', {
    type: 'build', skill: 'compare',
    prompt: 'Now the other way round. Build a rectangle with a perimeter of exactly 20 units.',
    target: { perimeter: 20, rectangle: true },
    hints: [
      'Perimeter 20 means length + width = 10.',
      'So try 1 x 9, 2 x 8, 3 x 7, 4 x 6 or 5 x 5.',
      'Watch the perimeter counter until it reads 20.'
    ],
    explain: 'Any rectangle whose length and width add to 10 has a perimeter of 20.'
  });

  A('m7', 'a6', {
    type: 'build', skill: 'compare',
    prompt: 'Build a different rectangle that ALSO has a perimeter of 20. Then compare the areas.',
    target: { perimeter: 20, rectangle: true, differentFrom: 'm7-a5' },
    hints: [
      'Pick another pair that adds to 10.',
      'The perimeter counter should still read 20.',
      '1 x 9 covers only 9 tiles, but 5 x 5 covers 25.'
    ],
    explain: '1 x 9, 2 x 8, 3 x 7, 4 x 6 and 5 x 5 all have a perimeter of 20 — but their areas are ' +
      '9, 16, 21, 24 and 25. The squarer the shape, the more it covers.'
  });

  A('m7', 'a7', {
    type: 'mcq', skill: 'compare',
    prompt: 'Two shapes have the same perimeter. Which one covers the most ground?',
    choices: [
      { label: 'The one closest to a square', correct: true },
      { label: 'The longest, thinnest one', correct: false, tag: 'ordered-by-eye' },
      { label: 'They always cover the same', correct: false, tag: 'same-area-same-perimeter' }
    ],
    hints: [
      'Look back at your two shapes with perimeter 20.',
      '1 x 9 covered 9 tiles. 5 x 5 covered 25.',
      'For the same border, the squarer shape holds much more inside.'
    ],
    explain: 'For a fixed perimeter, the closer a rectangle is to a square, the more area it covers. ' +
      'That is why a farmer with a fixed length of fence makes the field as square as possible.'
  });

  A('m7', 'a8', {
    type: 'explain', skill: 'compare',
    prompt: 'Say what you discovered in the Shape Lab, in your own words.',
    keywords: ['same', 'area', 'perimeter', 'different', 'thin', 'square', 'border', 'change'],
    model: 'Two shapes can have the same area but different perimeters, and the same perimeter but ' +
      'different areas. Long thin shapes have big borders; square ones cover more.',
    hints: [
      'What happened when you kept the area at 12?',
      'And what happened when you kept the perimeter at 20?',
      'One good answer: same area does not mean same perimeter, and same perimeter does not mean same area.'
    ],
    explain: 'Same area does not mean same perimeter, and same perimeter does not mean same area. ' +
      'They are two different measurements of the same shape.'
  });

  /* ====================================================================== */

  window.MQ_BANK = {
    all: ALL,
    byMission: BANK,
    forMission(m) { return (BANK[m] || []).slice(); },
    get(id) { return ALL.find(a => a.id === id) || null; },
    count() { return ALL.length; }
  };
})();

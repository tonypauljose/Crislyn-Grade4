/* ==========================================================================
   MEASUREQUEST — the engine
   --------------------------------------------------------------------------
   All the maths, all the memory, all the question making. No DOM in this
   file, which is why the whole thing can be tested headlessly.

   The design points that matter:

   1. QUESTIONS ARE GENERATED FROM A SEED, so the same seed always builds the
      same question. That is what makes "unlimited variations" testable and
      what lets a printed worksheet and its answer key be built twice and
      agree. `gen(id, seed)` is a pure function.

   2. NOTHING AMBIGUOUS EVER LEAVES A GENERATOR. A missing-side question is
      only built when the division comes out whole; a comparison is only
      built when the two shapes genuinely differ in the quantity being
      compared; MCQ distractors are checked distinct from the answer and from
      each other. `validate()` runs on every generated question and throws
      rather than showing Crislyn a broken question.

   3. WRONG ANSWERS ARE DIAGNOSED, NOT JUST MARKED. Every generator lists the
      wrong values it expects — length + width, l x w for a perimeter, the
      unit without the square — and maps each to a misconception tag from
      MQ_CONTENT. `check()` returns the tag, so the UI can teach instead of
      printing a cross.

   4. SHAPES ARE CELL SETS, not width/height pairs. That is what lets an
      L-shape have the same area as a rectangle with a different perimeter,
      and it gives the tracing activity a real boundary loop to follow.

   localStorage key: crislyn_measurequest_v1
   ========================================================================== */

(function () {
  'use strict';

  const KEY = 'crislyn_measurequest_v1';
  const SCHEMA = 1;

  const SESSION_TARGET = 9;      /* questions before a natural stopping point */
  const SECURE_WINDOW = 5;       /* "4 of the last 5" */
  const SECURE_NEEDED = 4;
  const SECURE_FORMATS = 2;      /* across at least two question formats */

  const C = () => window.MQ_CONTENT;

  /* ====================================================================== */
  /*  UNITS                                                                 */
  /* ====================================================================== */

  const LINEAR = ['cm', 'm', 'km'];
  const SQUARE = ['cm2', 'm2', 'km2'];

  function isSquareUnit(u) { return SQUARE.indexOf(u) >= 0; }
  function isLinearUnit(u) { return LINEAR.indexOf(u) >= 0; }
  /** 'cm' -> 'cm2'. Area must never be printed without this. */
  function toSquare(u) { return isSquareUnit(u) ? u : u + '2'; }
  /** 'cm2' -> 'cm' */
  function toLinear(u) { return isSquareUnit(u) ? u.slice(0, -1) : u; }
  /** Display form: 'cm2' -> 'cm²' */
  function fmtUnit(u) { return isSquareUnit(u) ? toLinear(u) + '²' : u; }
  /** Spoken form, because a screen reader saying "cm two" is no use. */
  function speakUnit(u) {
    const base = { cm: 'centimetres', m: 'metres', km: 'kilometres' }[toLinear(u)] || u;
    return isSquareUnit(u) ? 'square ' + base : base;
  }
  function fmtVal(n, u) { return n + ' ' + fmtUnit(u); }

  /* ====================================================================== */
  /*  MATHS — the four facts the whole module rests on                      */
  /* ====================================================================== */

  function perimeterRect(l, w) { return 2 * (l + w); }
  function areaRect(l, w) { return l * w; }
  function perimeterSquare(s) { return 4 * s; }
  function areaSquare(s) { return s * s; }

  /** Missing side of a rectangle given its perimeter. Null if not whole. */
  function sideFromPerimeter(P, known) {
    const half = P / 2;
    const other = half - known;
    if (!Number.isInteger(other) || other <= 0) return null;
    return other;
  }
  /** Missing side of a rectangle given its area. Null if not whole. */
  function sideFromArea(A, known) {
    if (known <= 0 || A % known !== 0) return null;
    const other = A / known;
    return other > 0 ? other : null;
  }
  function sideOfSquareFromPerimeter(P) {
    return P % 4 === 0 && P > 0 ? P / 4 : null;
  }

  /* ====================================================================== */
  /*  SHAPES — cell sets, so area and perimeter are both counted honestly   */
  /* ====================================================================== */

  const ck = (x, y) => x + ',' + y;

  /** A solid rectangle as a cell set. */
  function rectCells(l, w) {
    const cells = [];
    for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) cells.push({ x, y });
    return cells;
  }

  /** An L-shape: a big rectangle with a corner bitten out. */
  function lCells(l, w, cutL, cutW) {
    const set = [];
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < l; x++) {
        if (x >= l - cutL && y >= w - cutW) continue;   /* the bite */
        set.push({ x, y });
      }
    }
    return set;
  }

  function cellsArea(cells) { return cells.length; }

  /** Perimeter = every unit edge with a cell on one side and nothing on the
      other. Counted, never assumed from width and height. */
  function cellsPerimeter(cells) {
    const have = new Set(cells.map(c => ck(c.x, c.y)));
    let p = 0;
    cells.forEach(c => {
      if (!have.has(ck(c.x, c.y - 1))) p++;
      if (!have.has(ck(c.x, c.y + 1))) p++;
      if (!have.has(ck(c.x - 1, c.y))) p++;
      if (!have.has(ck(c.x + 1, c.y))) p++;
    });
    return p;
  }

  /** The boundary as an ordered closed loop of unit edges, so a finger can
      trace it and we can tell whether she went all the way round.
      Each edge is {ax,ay,bx,by} between lattice points. */
  function boundaryLoop(cells) {
    const have = new Set(cells.map(c => ck(c.x, c.y)));
    const edges = [];
    cells.forEach(c => {
      if (!have.has(ck(c.x, c.y - 1))) edges.push({ ax: c.x, ay: c.y, bx: c.x + 1, by: c.y });
      if (!have.has(ck(c.x + 1, c.y))) edges.push({ ax: c.x + 1, ay: c.y, bx: c.x + 1, by: c.y + 1 });
      if (!have.has(ck(c.x, c.y + 1))) edges.push({ ax: c.x + 1, ay: c.y + 1, bx: c.x, by: c.y + 1 });
      if (!have.has(ck(c.x - 1, c.y))) edges.push({ ax: c.x, ay: c.y + 1, bx: c.x, by: c.y });
    });
    if (!edges.length) return [];

    /* Walk the loop: each boundary vertex of a simple polyomino has exactly
       two incident edges, so following "the edge I have not used yet" from
       the current point traces the outline in order. */
    const byPoint = {};
    edges.forEach((e, i) => {
      const k = ck(e.ax, e.ay);
      (byPoint[k] = byPoint[k] || []).push(i);
    });
    const used = new Array(edges.length).fill(false);
    const loop = [];
    let cur = edges[0];
    used[0] = true;
    loop.push(cur);
    for (let guard = 0; guard < edges.length + 2; guard++) {
      const k = ck(cur.bx, cur.by);
      const next = (byPoint[k] || []).find(i => !used[i]);
      if (next === undefined) break;
      used[next] = true;
      cur = edges[next];
      loop.push(cur);
    }
    return loop;
  }

  /** Bounding box, for drawing. */
  function bounds(cells) {
    let maxX = 0, maxY = 0;
    cells.forEach(c => { maxX = Math.max(maxX, c.x + 1); maxY = Math.max(maxY, c.y + 1); });
    return { w: maxX, h: maxY };
  }

  /* ====================================================================== */
  /*  SEEDED RANDOM — same seed, same question, every time                  */
  /* ====================================================================== */

  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  /* ====================================================================== */
  /*  QUESTION HELPERS                                                      */
  /* ====================================================================== */

  /** Build MCQ choices, each carrying the misconception it reveals.
      Duplicates are dropped, so a distractor can never equal the answer. */
  function choices(r, correctLabel, wrongs) {
    const out = [{ label: String(correctLabel), correct: true, tag: null }];
    wrongs.forEach(w => {
      const label = String(w.label);
      if (out.some(o => o.label === label)) return;      /* never a duplicate */
      out.push({ label, correct: false, tag: w.tag || null });
    });
    /* deterministic shuffle */
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  /** Every question passes through here before Crislyn ever sees it. */
  function validate(q) {
    const where = q.gen + '#' + q.seed;
    if (!q.type) throw new Error(where + ': no type');
    if (!q.skill) throw new Error(where + ': no skill');
    if (!q.prompt) throw new Error(where + ': no prompt');
    if (!q.hints || q.hints.length !== 3) throw new Error(where + ': needs exactly 3 hints');
    if (!q.explain) throw new Error(where + ': no explanation');

    if (q.shape && q.shape.cells) {
      if (!q.shape.cells.length) throw new Error(where + ': empty shape');
      q.shape.cells.forEach(c => {
        if (!Number.isInteger(c.x) || !Number.isInteger(c.y) || c.x < 0 || c.y < 0)
          throw new Error(where + ': bad cell');
      });
    }
    /* A drawn shape must agree with the numbers printed on it. */
    if (q.shape && q.shape.cells && q.shape.labels) {
      const a = cellsArea(q.shape.cells), p = cellsPerimeter(q.shape.cells);
      if (q.shape.labels.area != null && q.shape.labels.area !== a)
        throw new Error(where + ': label says area ' + q.shape.labels.area + ' but the drawing has ' + a);
      if (q.shape.labels.perimeter != null && q.shape.labels.perimeter !== p)
        throw new Error(where + ': label says perimeter ' + q.shape.labels.perimeter + ' but the drawing has ' + p);
    }
    if (q.dims) {
      Object.keys(q.dims).forEach(k => {
        const v = q.dims[k];
        if (!Number.isInteger(v) || v <= 0)
          throw new Error(where + ': dimension ' + k + ' is ' + v + ', must be a positive whole number');
      });
    }
    if (q.type === 'mcq' || q.type === 'unit' || q.type === 'mistake' || q.type === 'compare') {
      if (!q.choices || q.choices.length < 2) throw new Error(where + ': needs choices');
      if (!q.choices.some(c => c.correct)) throw new Error(where + ': no correct choice');
      const labels = q.choices.map(c => c.label);
      if (new Set(labels).size !== labels.length) throw new Error(where + ': duplicate choices');
    }
    if ((q.type === 'number' || q.type === 'missing') && !q.justDo) {
      if (typeof q.answer !== 'number' || !isFinite(q.answer))
        throw new Error(where + ': numeric question with no numeric answer');
      if (q.answer <= 0) throw new Error(where + ': answer must be positive');
    }
    /* An answer that IS an area must carry a square unit, and an answer that
       is a length must not. Note this is about the ANSWER, not the topic:
       "a rectangle covers 24 cm2, one side is 6 cm, how long is the other?"
       is an area question whose answer is a length. Getting this wrong is
       the exact confusion the module exists to fix, so it is checked
       explicitly rather than inferred from the topic. */
    const kind = q.answerKind || (q.mode === 'area' ? 'area' : q.mode === 'perimeter' ? 'length' : null);
    if (q.unit && kind) {
      if (kind === 'area' && !isSquareUnit(q.unit))
        throw new Error(where + ': an area answer without a square unit (' + q.unit + ')');
      if (kind === 'length' && isSquareUnit(q.unit))
        throw new Error(where + ': a length answer given a square unit (' + q.unit + ')');
    }
    if (kind === 'count' && q.unit)
      throw new Error(where + ': a count of squares should carry no unit');
    return q;
  }

  /* ====================================================================== */
  /*  GENERATORS                                                            */
  /* ====================================================================== */

  const GEN = {};
  const register = (id, skill, type, fn) => { GEN[id] = { id, skill, type, fn }; };

  /* ---------------------------------------------------- border or cover? */

  register('sort-jobs', 'boundary', 'sort', (r, seed) => {
    const around = C().jobsByMode('around'), inside = C().jobsByMode('inside');
    const n = 3;
    const cards = [];
    const usedA = [], usedI = [];
    for (let i = 0; i < n; i++) {
      let a; do { a = pick(r, around); } while (usedA.indexOf(a.id) >= 0);
      usedA.push(a.id); cards.push({ id: a.id, text: a.what, bin: 'around', icon: a.icon, why: a.why });
      let b; do { b = pick(r, inside); } while (usedI.indexOf(b.id) >= 0);
      usedI.push(b.id); cards.push({ id: b.id, text: b.what, bin: 'inside', icon: b.icon, why: b.why });
    }
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1)); const t = cards[i]; cards[i] = cards[j]; cards[j] = t;
    }
    return {
      gen: 'sort-jobs', seed, skill: 'boundary', type: 'sort', mode: null,
      prompt: 'Put each job where it belongs. Does it go AROUND the edge, or cover the INSIDE?',
      cards,
      bins: [{ id: 'around', label: 'Goes around', hint: 'the border' },
             { id: 'inside', label: 'Covers the inside', hint: 'the surface' }],
      hints: [
        'Ask yourself: could I do this job with a piece of string, or would I need a sheet of paper?',
        'String jobs go around the edge. Sheet jobs cover the middle.',
        C().CUE_LONG
      ],
      explain: 'A job that travels along the edge is a border job. A job that spreads over the middle is a cover job.'
    };
  });

  register('job-which', 'real-life', 'mcq', (r, seed) => {
    const job = pick(r, C().jobs);
    const wantPerimeter = job.mode === 'around';
    return {
      gen: 'job-which', seed, skill: wantPerimeter ? 'id-perimeter' : 'id-area',
      type: 'mcq', mode: wantPerimeter ? 'perimeter' : 'area',
      prompt: job.what + '. What do we need to measure?',
      context: job.id,
      choices: choices(r, wantPerimeter ? 'Perimeter' : 'Area', [
        { label: wantPerimeter ? 'Area' : 'Perimeter',
          tag: wantPerimeter ? 'chose-area-for-border' : 'chose-perimeter-for-cover' }
      ]).concat([]),
      hints: [
        job.why,
        wantPerimeter
          ? 'Trace the edge with your finger. Everything the job touches is on that line.'
          : 'Spread your whole hand over it. The job touches all of that middle part.',
        C().CUE_SHORT + ' This one is a ' + (wantPerimeter ? 'border' : 'cover') + ' job, so it is the ' +
          (wantPerimeter ? 'perimeter' : 'area') + '.'
      ],
      explain: job.why + ' So we measure the ' + (wantPerimeter ? 'perimeter' : 'area') + '.'
    };
  });

  /* ------------------------------------------------------ counting around */

  register('count-perimeter', 'count-perimeter', 'trace', (r, seed) => {
    const kind = r() < 0.6 ? 'rect' : 'L';
    let cells, l, w;
    if (kind === 'rect') {
      l = int(r, 2, 7); w = int(r, 2, 6);
      cells = rectCells(l, w);
    } else {
      l = int(r, 3, 7); w = int(r, 3, 6);
      const cutL = int(r, 1, l - 2), cutW = int(r, 1, w - 2);
      cells = lCells(l, w, cutL, cutW);
    }
    const p = cellsPerimeter(cells);
    return {
      gen: 'count-perimeter', seed, skill: 'count-perimeter', type: 'trace', mode: 'perimeter',
      prompt: 'Trace all the way around this shape with your finger, then tell us how many steps you took.',
      shape: { cells, unit: 'units', labels: { perimeter: p } },
      answer: p, unit: null, answerKind: 'count',
      hints: [
        'Start at any corner and keep going the same way round.',
        'Every little step along the edge counts as 1. Count out loud as your finger moves.',
        'The journey is only finished when you are back where you started. This shape has ' + p + ' steps.'
      ],
      explain: 'Going all the way round takes ' + p + ' steps, so the perimeter is ' + p + ' units.',
      wrongs: [{ value: cellsArea(cells), tag: 'added-for-area' }]
    };
  });

  /* ------------------------------------------------------ counting squares */

  register('count-squares', 'count-squares', 'tiles', (r, seed) => {
    const l = int(r, 2, 8), w = int(r, 2, 6);
    const cells = rectCells(l, w);
    const a = areaRect(l, w);
    return {
      gen: 'count-squares', seed, skill: 'count-squares', type: 'tiles', mode: 'area',
      prompt: 'Cover the whole floor with tiles, then tell us how many tiles it took.',
      shape: { cells, unit: 'units', labels: { area: a } },
      dims: { l, w },
      answer: a, unit: null, answerKind: 'count',
      hints: [
        'Fill one row first, all the way across.',
        'One row holds ' + l + ' tiles. Now count how many rows there are.',
        'There are ' + w + ' rows of ' + l + ' tiles, and ' + w + ' x ' + l + ' = ' + a + '.'
      ],
      explain: 'The floor holds ' + w + ' rows of ' + l + ' tiles, so the area is ' + a + ' square units.',
      wrongs: [
        { value: l, tag: 'used-one-row' },
        { value: perimeterRect(l, w), tag: 'chose-perimeter-for-cover' },
        { value: 2 * (l + w) - 4, tag: 'counted-edge-squares' }
      ]
    };
  });

  /* -------------------------------------------------- perimeter shortcuts */

  register('perim-rect', 'calc-perimeter', 'number', (r, seed) => {
    const job = pick(r, C().jobsByMode('around'));
    const o = C().objects[job.obj];
    const unit = o.unit;
    const dd = dimsFor(r, o, false);
    const l = dd.l, w = dd.w;
    const p = perimeterRect(l, w);
    return {
      gen: 'perim-rect', seed, skill: 'calc-perimeter', type: 'number', mode: 'perimeter',
      prompt: job.what + '. ' + cap(o.the) + ' is ' + l + ' ' + unit + ' long and ' + w + ' ' + unit +
        ' wide. ' + askFor(job),
      context: job.id,
      shape: { cells: null, kind: 'rect', l, w, unit, show: 'perimeter' },
      dims: { l, w },
      answer: p, unit, answerKind: 'length',
      hints: [
        'This job goes around the edge, so we need the perimeter.',
        'Write all four sides: ' + l + ', ' + w + ', ' + l + ', ' + w + '. Now add them.',
        'P = 2 x (' + l + ' + ' + w + ') = 2 x ' + (l + w) + ' = ' + p + ' ' + fmtUnit(unit)
      ],
      worked: [
        'The job goes around, so we need the perimeter.',
        'The four sides are ' + l + ', ' + w + ', ' + l + ' and ' + w + ' ' + unit + '.',
        'Group the pairs: 2 x (' + l + ' + ' + w + ')',
        '2 x ' + (l + w) + ' = ' + p + ' ' + fmtUnit(unit)
      ],
      explain: 'P = 2 x (' + l + ' + ' + w + ') = ' + p + ' ' + fmtUnit(unit) + '.',
      wrongs: [
        { value: l + w, tag: 'added-two-sides' },
        { value: l * w, tag: 'multiplied-for-perimeter' },
        { value: 2 * l + w, tag: 'missed-a-side' }
      ]
    };
  });

  register('perim-square', 'calc-perimeter', 'number', (r, seed) => {
    const job = pick(r, C().jobsByMode('around'));
    const o = C().objects[job.obj];
    const unit = o.unit;
    const rr = o.range || [3, 14];
    const s = int(r, rr[0], rr[1]);
    const p = perimeterSquare(s);
    return {
      gen: 'perim-square', seed, skill: 'calc-perimeter', type: 'number', mode: 'perimeter',
      prompt: job.what + '. ' + cap(o.the) + ' is a square with sides of ' + s + ' ' + unit +
        '. ' + askFor(job),
      context: job.id,
      shape: { cells: null, kind: 'square', l: s, w: s, unit, show: 'perimeter' },
      dims: { s },
      answer: p, unit, answerKind: 'length',
      hints: [
        'A square has four sides, and all four are the same length.',
        'So we need ' + s + ' four times.',
        'P = 4 x ' + s + ' = ' + p + ' ' + fmtUnit(unit)
      ],
      worked: [
        'A square has four equal sides.',
        'Each side is ' + s + ' ' + unit + '.',
        'P = 4 x ' + s,
        '= ' + p + ' ' + fmtUnit(unit)
      ],
      explain: 'P = 4 x ' + s + ' = ' + p + ' ' + fmtUnit(unit) + '.',
      wrongs: [
        { value: s * s, tag: 'multiplied-for-perimeter' },
        { value: 2 * s, tag: 'added-two-sides' }
      ]
    };
  });

  register('perim-missing', 'calc-perimeter', 'missing', (r, seed) => {
    /* Built backwards from whole numbers so the answer is always exact. */
    const l = int(r, 3, 14), w = int(r, 2, 12);
    const p = perimeterRect(l, w);
    const known = r() < 0.5 ? l : w;
    const want = known === l ? w : l;
    const check = sideFromPerimeter(p, known);
    if (check !== want) return null;                     /* never guessed at */
    const unit = pick(r, ['cm', 'm']);
    return {
      gen: 'perim-missing', seed, skill: 'calc-perimeter', type: 'missing', mode: 'perimeter',
      prompt: 'A rectangle has a perimeter of ' + p + ' ' + unit + '. One side is ' + known + ' ' + unit +
        '. How long is the side next to it?',
      shape: { cells: null, kind: 'rect', l: known === l ? l : w, w: null, unit, show: 'perimeter', missing: true },
      dims: { known },
      answer: want, unit, answerKind: 'length',
      hints: [
        'The perimeter is two lengths and two widths added together.',
        'Half of the perimeter is one length plus one width: ' + p + ' ÷ 2 = ' + (p / 2) + '.',
        'Now take away the side you know: ' + (p / 2) + ' − ' + known + ' = ' + want + ' ' + fmtUnit(unit)
      ],
      worked: [
        'Perimeter = 2 x (length + width), so half of it is length + width.',
        p + ' ÷ 2 = ' + (p / 2),
        (p / 2) + ' − ' + known + ' = ' + want,
        'The missing side is ' + want + ' ' + fmtUnit(unit) + '.'
      ],
      explain: 'Half the perimeter is ' + (p / 2) + ', and ' + (p / 2) + ' − ' + known + ' = ' + want + ' ' + fmtUnit(unit) + '.',
      wrongs: [
        { value: p - known, tag: 'missed-a-side' },
        { value: p / 4, tag: 'square-halved' }
      ]
    };
  });

  /* ------------------------------------------------------- area shortcuts */

  register('area-rect', 'calc-area', 'number', (r, seed) => {
    const job = pick(r, areaJobs());
    const o = C().objects[job.obj];
    const unit = o.unit;
    const dd = dimsFor(r, o, true);
    const l = dd.l, w = dd.w;
    const a = areaRect(l, w);
    return {
      gen: 'area-rect', seed, skill: 'calc-area', type: 'number', mode: 'area',
      prompt: job.what + '. ' + cap(o.the) + ' is ' + l + ' ' + unit + ' long and ' + w + ' ' + unit +
        ' wide. ' + askFor(job),
      context: job.id,
      shape: { cells: rectCells(l, w), kind: 'rect', l, w, unit, show: 'area', labels: { area: a } },
      dims: { l, w },
      answer: a, unit: toSquare(unit), answerKind: 'area',
      hints: [
        'This job covers the surface, so we need the area.',
        'Picture the shape filled with squares: ' + w + ' rows with ' + l + ' in each row.',
        'A = ' + l + ' x ' + w + ' = ' + a + ' ' + fmtUnit(toSquare(unit))
      ],
      worked: [
        'The job covers the inside, so we need the area.',
        'Fill it with squares: ' + w + ' rows of ' + l + '.',
        'A = length x width = ' + l + ' x ' + w,
        '= ' + a + ' ' + fmtUnit(toSquare(unit))
      ],
      explain: 'A = ' + l + ' x ' + w + ' = ' + a + ' ' + fmtUnit(toSquare(unit)) + '.',
      wrongs: [
        { value: perimeterRect(l, w), tag: 'chose-perimeter-for-cover' },
        { value: l + w, tag: 'added-for-area' }
      ]
    };
  });

  register('area-square', 'calc-area', 'number', (r, seed) => {
    const job = pick(r, areaJobs());
    const o = C().objects[job.obj];
    const unit = o.unit;
    const s = int(r, 3, 11);
    const a = areaSquare(s);
    return {
      gen: 'area-square', seed, skill: 'calc-area', type: 'number', mode: 'area',
      prompt: job.what + '. ' + cap(o.the) + ' is a square of side ' + s + ' ' + unit +
        '. ' + askFor(job),
      context: job.id,
      shape: { cells: rectCells(s, s), kind: 'square', l: s, w: s, unit, show: 'area', labels: { area: a } },
      dims: { s },
      answer: a, unit: toSquare(unit), answerKind: 'area',
      hints: [
        'A square is just a rectangle whose length and width are the same.',
        'So it holds ' + s + ' rows with ' + s + ' squares in each.',
        'A = ' + s + ' x ' + s + ' = ' + a + ' ' + fmtUnit(toSquare(unit))
      ],
      worked: [
        'A square has equal sides, both ' + s + ' ' + unit + '.',
        'A = side x side = ' + s + ' x ' + s,
        '= ' + a + ' ' + fmtUnit(toSquare(unit))
      ],
      explain: 'A = ' + s + ' x ' + s + ' = ' + a + ' ' + fmtUnit(toSquare(unit)) + '.',
      wrongs: [
        { value: perimeterSquare(s), tag: 'chose-perimeter-for-cover' },
        { value: 2 * s, tag: 'added-for-area' }
      ]
    };
  });

  register('area-missing', 'calc-area', 'missing', (r, seed) => {
    const l = int(r, 2, 12), w = int(r, 2, 9);
    const a = areaRect(l, w);
    const known = r() < 0.5 ? l : w;
    const want = known === l ? w : l;
    if (sideFromArea(a, known) !== want) return null;    /* whole numbers only */
    const unit = pick(r, ['cm', 'm']);
    return {
      gen: 'area-missing', seed, skill: 'calc-area', type: 'missing', mode: 'area',
      prompt: 'A rectangle covers ' + a + ' ' + fmtUnit(toSquare(unit)) + '. One side is ' + known + ' ' +
        unit + '. How long is the other side?',
      shape: { cells: null, kind: 'rect', l: known, w: null, unit, show: 'area', missing: true },
      dims: { known },
      answer: want, unit, answerKind: 'length',
      hints: [
        'Area was made by multiplying the two sides together.',
        'To go backwards from a multiplication, we divide.',
        a + ' ÷ ' + known + ' = ' + want + ' ' + fmtUnit(unit)
      ],
      worked: [
        'Area = length x width.',
        'So the missing side = area ÷ the side we know.',
        a + ' ÷ ' + known + ' = ' + want,
        'The missing side is ' + want + ' ' + fmtUnit(unit) + '. Note it is ' + fmtUnit(unit) + ', not ' +
          fmtUnit(toSquare(unit)) + ' — a side is a length.'
      ],
      explain: a + ' ÷ ' + known + ' = ' + want + ' ' + fmtUnit(unit) + '.',
      wrongs: [
        { value: a - known, tag: 'added-for-area' },
        { value: known * 2, tag: 'divided-wrong-way' }
      ]
    };
  });

  /* ---------------------------------------------------------------- units */

  register('unit-pick', 'units', 'unit', (r, seed) => {
    const job = pick(r, C().jobs);
    const wantArea = job.mode === 'inside';
    const base = toLinear(job.unit);
    const right = wantArea ? toSquare(base) : base;
    const wrong = wantArea ? base : toSquare(base);
    const otherBase = base === 'cm' ? 'm' : 'cm';
    return {
      gen: 'unit-pick', seed, skill: 'units', type: 'unit', mode: wantArea ? 'area' : 'perimeter',
      prompt: job.what + '. Which unit should the answer be written in?',
      context: job.id,
      choices: choices(r, fmtUnit(right), [
        { label: fmtUnit(wrong), tag: wantArea ? 'linear-unit-for-area' : 'square-unit-for-perimeter' },
        { label: fmtUnit(wantArea ? toSquare(otherBase) : otherBase), tag: 'wrong-magnitude-unit' }
      ]),
      answerUnit: right,
      hints: [
        wantArea ? 'This job covers a surface, so the answer is an area.'
                 : 'This job runs along the edge, so the answer is a length.',
        wantArea ? 'Area counts squares, so the unit needs a little 2 on it.'
                 : 'Perimeter is one line, so the unit has no little 2.',
        'The answer is written in ' + fmtUnit(right) + '.'
      ],
      explain: job.why + ' That makes it ' + (wantArea ? 'an area' : 'a length') + ', measured in ' +
        fmtUnit(right) + '.'
    };
  });

  /* ------------------------------------------------------- find the error */

  register('find-mistake', 'calc-perimeter', 'mistake', (r, seed) => {
    const l = int(r, 3, 12), w = int(r, 2, 9);
    const wantPerimeter = r() < 0.5;
    const who = pick(r, C().people);
    const unit = pick(r, ['cm', 'm']);
    const right = wantPerimeter ? perimeterRect(l, w) : areaRect(l, w);
    const rightUnit = wantPerimeter ? unit : toSquare(unit);

    /* One planted error, chosen from the mistakes she actually makes. */
    const faults = wantPerimeter
      ? [{ line: 'P = ' + l + ' + ' + w + ' = ' + (l + w) + ' ' + fmtUnit(unit),
           tag: 'added-two-sides', fix: 'Only two sides were added. A rectangle has four.' },
         { line: 'P = ' + l + ' x ' + w + ' = ' + (l * w) + ' ' + fmtUnit(unit),
           tag: 'multiplied-for-perimeter', fix: 'The sides were multiplied. Multiplying fills the inside; perimeter adds the edges.' },
         { line: 'P = 2 x (' + l + ' + ' + w + ') = ' + perimeterRect(l, w) + ' ' + fmtUnit(toSquare(unit)),
           tag: 'square-unit-for-perimeter', fix: 'The working is right but the unit is a square unit. Perimeter is a length.' }]
      : [{ line: 'A = ' + l + ' + ' + w + ' = ' + (l + w) + ' ' + fmtUnit(toSquare(unit)),
           tag: 'added-for-area', fix: 'The sides were added. Area needs them multiplied.' },
         { line: 'A = ' + l + ' x ' + w + ' = ' + areaRect(l, w) + ' ' + fmtUnit(unit),
           tag: 'linear-unit-for-area', fix: 'The number is right but the unit is missing its square.' },
         { line: 'A = 2 x (' + l + ' + ' + w + ') = ' + perimeterRect(l, w) + ' ' + fmtUnit(toSquare(unit)),
           tag: 'chose-perimeter-for-cover', fix: 'That is the perimeter formula. Area is length x width.' }];
    const fault = pick(r, faults);

    return {
      gen: 'find-mistake', seed, skill: wantPerimeter ? 'calc-perimeter' : 'calc-area',
      type: 'mistake', mode: wantPerimeter ? 'perimeter' : 'area',
      prompt: who + ' worked out the ' + (wantPerimeter ? 'perimeter' : 'area') + ' of a rectangle ' +
        l + ' ' + unit + ' by ' + w + ' ' + unit + '. Something went wrong. What was it?',
      shape: { cells: null, kind: 'rect', l, w, unit, show: wantPerimeter ? 'perimeter' : 'area' },
      dims: { l, w },
      workingShown: fault.line,
      choices: choices(r, fault.fix, faults.filter(f => f.tag !== fault.tag).map(f => ({
        label: f.fix, tag: 'misread-working'
      }))),
      answer: right, answerUnit: rightUnit, answerKind: wantPerimeter ? 'length' : 'area',
      hints: [
        'Read the working line by line. Which line does not match what we are looking for?',
        wantPerimeter ? 'Perimeter adds all four sides and uses a plain unit.'
                      : 'Area multiplies the two sides and uses a square unit.',
        fault.fix + ' The right answer is ' + right + ' ' + fmtUnit(rightUnit) + '.'
      ],
      explain: fault.fix + ' It should be ' + right + ' ' + fmtUnit(rightUnit) + '.',
      correctionTag: fault.tag
    };
  });

  /* ------------------------------------------- complete the worked example */

  register('complete-working', 'calc-perimeter', 'worked', (r, seed) => {
    const wantPerimeter = r() < 0.5;
    const l = int(r, 3, 12), w = int(r, 2, 9);
    const unit = pick(r, ['cm', 'm']);
    const ans = wantPerimeter ? perimeterRect(l, w) : areaRect(l, w);
    const ansUnit = wantPerimeter ? unit : toSquare(unit);
    const steps = wantPerimeter
      ? [{ text: 'This job goes around the edge, so we need the perimeter.' },
         { text: 'The four sides are ' + l + ', ' + w + ', ' + l + ' and ' + w + '.' },
         { text: 'P = 2 x (' + l + ' + ' + w + ') = 2 x □', blank: l + w },
         { text: 'P = □ ' + fmtUnit(unit), blank: ans }]
      : [{ text: 'This job covers the inside, so we need the area.' },
         { text: 'It holds ' + w + ' rows with ' + l + ' squares in each.' },
         { text: 'A = ' + l + ' x ' + w + ' = □', blank: ans },
         { text: 'The unit must be □', blankUnit: ansUnit }];
    return {
      gen: 'complete-working', seed, skill: wantPerimeter ? 'calc-perimeter' : 'calc-area',
      type: 'worked', mode: wantPerimeter ? 'perimeter' : 'area',
      prompt: 'Finish the working. A rectangle is ' + l + ' ' + unit + ' by ' + w + ' ' + unit + '.',
      shape: { cells: null, kind: 'rect', l, w, unit, show: wantPerimeter ? 'perimeter' : 'area' },
      dims: { l, w },
      steps,
      answer: ans, unit: ansUnit, answerKind: wantPerimeter ? 'length' : 'area',
      hints: [
        'Look at the line above the box. It tells you what to work out.',
        wantPerimeter ? 'Add the length and the width first, then double it.'
                      : 'Multiply the length by the width.',
        'The finished answer is ' + ans + ' ' + fmtUnit(ansUnit) + '.'
      ],
      explain: 'The completed working gives ' + ans + ' ' + fmtUnit(ansUnit) + '.'
    };
  });

  /* -------------------------------------------------------- comparing two */

  register('compare-shapes', 'compare', 'compare', (r, seed) => {
    /* Two rectangles with the SAME area and different perimeters, or the same
       perimeter and different areas. Built by search so the claim is true. */
    const sameArea = r() < 0.5;
    let A = null, B = null;
    if (sameArea) {
      const areas = [12, 16, 18, 24, 36];
      const a = pick(r, areas);
      const pairs = [];
      for (let x = 1; x <= a; x++) if (a % x === 0) { const y = a / x; if (x <= y && x <= 9 && y <= 12) pairs.push([x, y]); }
      if (pairs.length < 2) return null;
      const i = int(r, 0, pairs.length - 2);
      A = { l: pairs[i][1], w: pairs[i][0] };
      B = { l: pairs[pairs.length - 1][1], w: pairs[pairs.length - 1][0] };
      if (perimeterRect(A.l, A.w) === perimeterRect(B.l, B.w)) return null;
    } else {
      const half = int(r, 7, 14);                       /* l + w */
      const a1 = int(r, 1, Math.floor(half / 2) - 1);
      const a2 = Math.floor(half / 2);
      if (a1 === a2) return null;
      A = { l: half - a1, w: a1 };
      B = { l: half - a2, w: a2 };
      if (areaRect(A.l, A.w) === areaRect(B.l, B.w)) return null;
      if (A.w < 1 || B.w < 1) return null;
    }
    const pa = perimeterRect(A.l, A.w), pb = perimeterRect(B.l, B.w);
    const aa = areaRect(A.l, A.w), ab = areaRect(B.l, B.w);
    const askPerimeter = sameArea;
    const bigger = askPerimeter ? (pa > pb ? 'A' : 'B') : (aa > ab ? 'A' : 'B');

    return {
      gen: 'compare-shapes', seed, skill: 'compare', type: 'compare', mode: null,
      prompt: sameArea
        ? 'Both shapes are made from the same number of tiles. Which one needs MORE ribbon around it?'
        : 'Both shapes need the same length of ribbon around them. Which one covers MORE ground?',
      shapes: [
        { key: 'A', l: A.l, w: A.w, cells: rectCells(A.l, A.w), area: aa, perimeter: pa },
        { key: 'B', l: B.l, w: B.w, cells: rectCells(B.l, B.w), area: ab, perimeter: pb }
      ],
      choices: choices(r, 'Shape ' + bigger, [
        { label: 'Shape ' + (bigger === 'A' ? 'B' : 'A'), tag: 'ordered-by-eye' },
        { label: 'They are the same', tag: sameArea ? 'same-area-same-perimeter' : 'same-area-same-perimeter' }
      ]),
      fact: sameArea
        ? 'Same area (' + aa + ' squares), different perimeters (' + pa + ' and ' + pb + ').'
        : 'Same perimeter (' + pa + '), different areas (' + aa + ' and ' + ab + ').',
      hints: [
        sameArea ? 'Count the tiles in each. They match — so the area is not what is different.'
                 : 'Count the steps around each. They match — so the perimeter is not what is different.',
        sameArea ? 'Now count the steps around the edge of each shape.'
                 : 'Now count the tiles inside each shape.',
        sameArea
          ? 'Shape A goes round in ' + pa + ' steps and shape B in ' + pb + '. The long thin one has the longer border.'
          : 'Shape A holds ' + aa + ' tiles and shape B holds ' + ab + '. The squarer one covers more.'
      ],
      explain: sameArea
        ? 'Both hold ' + aa + ' tiles, so the areas are equal. But the borders are ' + pa + ' and ' + pb +
          ' — stretching a shape long and thin makes its border longer without changing its area.'
        : 'Both borders are ' + pa + ', so the perimeters are equal. But they hold ' + aa + ' and ' + ab +
          ' tiles — the squarer a shape is, the more it covers for the same border.'
    };
  });

  /* ------------------------------------------------- real-life mini mission */

  register('mini-mission', 'real-life', 'mission', (r, seed) => {
    const job = pick(r, C().jobsByMode('around').concat(areaJobs()));
    const o = C().objects[job.obj];
    const unit = o.unit;
    const wantPerimeter = job.mode === 'around';
    const dd = dimsFor(r, o, !wantPerimeter);
    const l = dd.l, w = dd.w;
    const ans = wantPerimeter ? perimeterRect(l, w) : areaRect(l, w);
    const ansUnit = wantPerimeter ? unit : toSquare(unit);
    const who = pick(r, C().people);
    return {
      gen: 'mini-mission', seed, skill: 'real-life', type: 'mission',
      mode: wantPerimeter ? 'perimeter' : 'area',
      prompt: who + ' is getting ' + job.buy + '. ' + cap(o.the) + ' is ' + l + ' ' + unit + ' by ' + w +
        ' ' + unit + '.',
      context: job.id,
      job: { id: job.id, what: job.what, why: job.why, verb: job.verb, buy: job.buy },
      shape: { cells: null, kind: 'rect', l, w, unit, show: wantPerimeter ? 'perimeter' : 'area' },
      dims: { l, w },
      steps: [
        { ask: 'Does this job go around the edge, or cover the inside?',
          options: [{ label: 'Around the edge', correct: wantPerimeter },
                    { label: 'Covers the inside', correct: !wantPerimeter }],
          tagWrong: wantPerimeter ? 'chose-area-for-border' : 'chose-perimeter-for-cover' },
        { ask: 'So what do we measure?',
          options: [{ label: 'Perimeter', correct: wantPerimeter },
                    { label: 'Area', correct: !wantPerimeter }],
          tagWrong: wantPerimeter ? 'chose-area-for-border' : 'chose-perimeter-for-cover' },
        { ask: 'Which unit will the answer use?',
          options: [{ label: fmtUnit(ansUnit), correct: true },
                    { label: fmtUnit(wantPerimeter ? toSquare(unit) : unit), correct: false }],
          tagWrong: wantPerimeter ? 'square-unit-for-perimeter' : 'linear-unit-for-area' },
        { ask: 'Now work it out.', numeric: true, answer: ans, unit: ansUnit }
      ],
      answer: ans, unit: ansUnit, answerKind: wantPerimeter ? 'length' : 'area',
      consequence: wantPerimeter
        ? 'If ' + who + ' had measured the area instead, the shop would have sold ' + areaRect(l, w) +
          ' ' + fmtUnit(toSquare(unit)) + ' of ' + job.verb + ' — far too much, and the wrong shape entirely.'
        : 'If ' + who + ' had measured the perimeter instead, the shop would have sold ' +
          perimeterRect(l, w) + ' ' + fmtUnit(unit) + ' of ' + job.verb +
          ' — a long thin strip that would not cover the middle at all.',
      hints: [
        job.why,
        wantPerimeter ? 'Border job. Add all four sides.' : 'Cover job. Multiply the two sides.',
        'The answer is ' + ans + ' ' + fmtUnit(ansUnit) + '.'
      ],
      explain: job.why + ' The answer is ' + ans + ' ' + fmtUnit(ansUnit) + '.'
    };
  });

  /* ------------------------------------------------------ match to the sum */

  register('match-sum', 'real-life', 'match', (r, seed) => {
    const around = pick(r, C().jobsByMode('around'));
    const inside = pick(r, C().jobsByMode('inside'));
    const l = int(r, 4, 10), w = int(r, 2, 8);
    const u1 = C().objects[around.obj].unit, u2 = C().objects[inside.obj].unit;
    const left = [
      { id: 'a', text: around.what + ' (' + l + ' ' + u1 + ' by ' + w + ' ' + u1 + ')' },
      { id: 'b', text: inside.what + ' (' + l + ' ' + u2 + ' by ' + w + ' ' + u2 + ')' }
    ];
    const right = [
      { id: 'a', text: '2 x (' + l + ' + ' + w + ') = ' + perimeterRect(l, w) + ' ' + fmtUnit(u1) },
      { id: 'b', text: l + ' x ' + w + ' = ' + areaRect(l, w) + ' ' + fmtUnit(toSquare(u2)) }
    ];
    for (let i = right.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1)); const t = right[i]; right[i] = right[j]; right[j] = t;
    }
    return {
      gen: 'match-sum', seed, skill: 'real-life', type: 'match', mode: null,
      prompt: 'Match each job to the sum that answers it.',
      left, right,
      hints: [
        'Read each job and ask: border, or cover?',
        'A border job adds the sides. A cover job multiplies them.',
        'Look at the units too — the square unit belongs to the covering job.'
      ],
      explain: around.what + ' is a border job, so it needs 2 x (l + w). ' + inside.what +
        ' is a cover job, so it needs l x w.'
    };
  });

  /* ------------------------------------------------ explain in her own words */

  register('explain-it', 'boundary', 'explain', (r, seed) => {
    const which = pick(r, ['perimeter', 'area', 'difference']);
    const prompts = {
      perimeter: { q: 'In your own words, what is perimeter?',
        keys: ['around', 'round', 'edge', 'border', 'outside', 'side'],
        model: 'Perimeter is the distance all the way around the edge of a shape.' },
      area: { q: 'In your own words, what is area?',
        keys: ['inside', 'cover', 'surface', 'square', 'fill', 'middle'],
        model: 'Area is the amount of surface covered inside a shape, counted in equal squares.' },
      difference: { q: 'How would you explain the difference to a friend who has never heard of them?',
        keys: ['around', 'inside', 'cover', 'edge', 'surface', 'border'],
        model: 'Perimeter goes around the edge. Area covers the ground inside.' }
    };
    const p = prompts[which];
    return {
      gen: 'explain-it', seed, skill: which === 'area' ? 'id-area' : 'boundary',
      type: 'explain', mode: null,
      prompt: p.q,
      keywords: p.keys,
      model: p.model,
      hints: [
        'There is no wrong way to say it. Use your own words.',
        'Try starting with "It is the..." and say where it is on the shape.',
        'One good way to say it: ' + p.model
      ],
      explain: p.model
    };
  });

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /** Pick believable whole-number sides for a real object, longest first so
      "12 m long and 8 m wide" always reads the right way round. */
  function dimsFor(r, o, forArea) {
    const rng = (o && o.range) || [3, 12];
    let lo = rng[0], hi = rng[1];
    if (forArea) { lo = Math.max(2, Math.min(lo, 3)); hi = Math.min(hi, 12); }
    let a = int(r, lo, hi), b = int(r, lo, hi);
    if (b > a) { const t = a; a = b; b = t; }
    if (a === b) b = Math.max(lo, b - 1);
    if (b < 1) b = 1;
    return { l: a, w: b };
  }

  /** Only objects that stay believable at small numbers get area questions. */
  function areaJobs() {
    return C().jobsByMode('inside').filter(j => (C().objects[j.obj] || {}).areaOk);
  }


  /**
   * Phrase the question so it asks for the quantity actually being answered.
   * "How much ribbon is needed?" is fine — ribbon is uncountable and the
   * answer is a length. But "How many tiles are needed?" answered with
   * "20 m2" is simply a wrong question: it asks for a count and is given an
   * area. So countable materials are asked about by the measurement instead.
   */
  function askFor(job) {
    if (job.ask) return job.ask;
    if (!job.plural) return 'How much ' + job.verb + ' is needed?';
    return job.mode === 'inside'
      ? 'What area do the ' + job.verb + ' have to cover?'
      : 'What length of ' + job.verb + ' is needed?';
  }

  /* ====================================================================== */
  /*  GENERATION                                                            */
  /* ====================================================================== */

  /** Pure: the same (id, seed) always builds the same question.
      Generators may return null when a seed would make an ambiguous or
      non-whole-number question; we walk the seed forward until one is valid,
      so a caller can never receive null. */
  function gen(id, seed) {
    const g = GEN[id];
    if (!g) throw new Error('no generator called ' + id);
    for (let attempt = 0; attempt < 64; attempt++) {
      const s = (seed + attempt * 7919) >>> 0;
      const q = g.fn(rng(s), s);
      if (q) {
        q.gen = id; q.seed = s;
        q.skill = q.skill || g.skill;
        q.type = q.type || g.type;
        q.sig = signature(q);
        return validate(q);
      }
    }
    throw new Error(id + ': could not build a valid question from seed ' + seed);
  }

  /** What makes two questions "the same numbers" for repeat avoidance. */
  function signature(q) {
    const d = q.dims ? Object.keys(q.dims).sort().map(k => k + q.dims[k]).join('.') : '';
    return q.gen + '|' + d + '|' + (q.context || '') + '|' + (q.answer != null ? q.answer : '');
  }

  const GENS_FOR = {};
  Object.keys(GEN).forEach(id => {
    const s = GEN[id].skill;
    (GENS_FOR[s] = GENS_FOR[s] || []).push(id);
  });
  /* Skills that are exercised by generators registered under another skill. */
  GENS_FOR['id-perimeter'] = ['job-which', 'unit-pick', 'mini-mission'];
  GENS_FOR['id-area'] = ['job-which', 'unit-pick', 'mini-mission', 'explain-it'];
  GENS_FOR['boundary'] = ['sort-jobs', 'explain-it', 'job-which'];
  GENS_FOR['units'] = ['unit-pick', 'find-mistake', 'complete-working'];
  GENS_FOR['real-life'] = ['mini-mission', 'match-sum', 'job-which'];
  GENS_FOR['calc-perimeter'] = ['perim-rect', 'perim-square', 'perim-missing', 'find-mistake', 'complete-working'];
  GENS_FOR['calc-area'] = ['area-rect', 'area-square', 'area-missing', 'find-mistake', 'complete-working'];

  function generatorsFor(skill) { return (GENS_FOR[skill] || []).slice(); }

  /* ====================================================================== */
  /*  STATE                                                                 */
  /* ====================================================================== */

  const todayKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  };

  function blank() {
    const s = { v: SCHEMA, name: 'Crislyn', skills: {}, missions: {}, badges: {}, sessions: [],
      diagnostic: null, counters: { recovery: 0, hintSolve: 0, explain: 0, sortRight: 0,
        traceRight: 0, tileRight: 0, unitRight: 0 },
      lab: [], prefs: { speak: true }, seed: Math.floor(Math.random() * 1e9), recent: [],
      lastDay: null, streak: 0, days: [] };
    C().skills.forEach(k => {
      s.skills[k.id] = { hist: [], attempts: 0, correct: 0, hints: 0, misc: {} };
    });
    C().missions.forEach(m => { s.missions[m.id] = { done: false, acts: {}, best: 0 }; });
    return s;
  }

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === SCHEMA) {
          state = p;
          /* tolerate content growing after a save */
          C().skills.forEach(k => {
            if (!state.skills[k.id]) state.skills[k.id] = { hist: [], attempts: 0, correct: 0, hints: 0, misc: {} };
          });
          C().missions.forEach(m => { if (!state.missions[m.id]) state.missions[m.id] = { done: false, acts: {}, best: 0 }; });
          if (!state.counters) state.counters = blank().counters;
          if (!state.recent) state.recent = [];
          if (!state.lab) state.lab = [];
          return state;
        }
      }
    } catch (e) { /* corrupted save: start clean rather than crash on her */ }
    state = blank();
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function init() {
    if (!state) load();
    const t = todayKey();
    if (state.lastDay !== t) {
      if (state.lastDay) {
        const gap = dayGap(state.lastDay, t);
        state.streak = gap === 1 ? (state.streak || 0) + 1 : 1;
      } else state.streak = 1;
      state.lastDay = t;
      if (state.days.indexOf(t) < 0) state.days.push(t);
      save();
    }
    return state;
  }

  function dayGap(a, b) {
    const pa = new Date(a + 'T00:00:00'), pb = new Date(b + 'T00:00:00');
    return Math.round((pb - pa) / 86400000);
  }

  const get = () => state || load();

  /* ====================================================================== */
  /*  ANSWERING                                                             */
  /* ====================================================================== */

  /** Compare a typed answer with the expected one. Accepts "24", "24 cm",
      "24cm", and the spelt unit — the maths is what is being tested, not
      punctuation. Returns null when nothing usable was typed. */
  function parseNumber(text) {
    if (text == null) return null;
    const m = String(text).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  }

  /** Did the typed text carry a unit, and was it the right kind? */
  function unitInText(text) {
    const t = String(text || '').toLowerCase().replace(/\s+/g, '');
    if (/(cm|m|km)(2|²|sq)/.test(t) || /sq(uare)?(cm|m|km)/.test(t)) return 'square';
    if (/\d\s*(cm|m|km)\b/.test(String(text || '').toLowerCase())) return 'linear';
    if (/(cm|m|km)$/.test(t)) return 'linear';
    return null;
  }

  /**
   * The single place a response is judged. Returns:
   *   { correct, tag, teach, value }
   * `tag` names the misconception when we can identify it, so the UI can
   * teach the specific thing rather than saying "no".
   */
  function check(q, response) {
    const out = { correct: false, tag: null, teach: null, value: response };

    if (q.type === 'mcq' || q.type === 'unit' || q.type === 'mistake' || q.type === 'compare') {
      const chosen = typeof response === 'number' ? q.choices[response] : response;
      if (!chosen) return out;
      out.correct = !!chosen.correct;
      out.tag = chosen.correct ? null : chosen.tag;
      /* A choice may carry its own wording. Mission 1 needs this: the mistake
         is still recorded under its proper name for the grown-up report, but
         it has to be EXPLAINED in words she has already met — saying "we need
         the area" to a child who has not been told what area is teaches her
         nothing. */
      if (!out.correct && chosen.teach) out.teach = chosen.teach;
    } else if (q.justDo) {
      /* Tracing the border or shading the inside to FEEL the difference —
         there is no number to get wrong, only a job to finish. */
      out.correct = !!(response && response.complete);
      if (!out.correct && response && response.strayed) out.tag = q.strayTag || null;
    } else if (q.type === 'number' || q.type === 'missing' || q.type === 'trace' ||
               q.type === 'tiles' || q.type === 'shade') {
      const n = typeof response === 'number' ? response : parseNumber(response);
      out.value = n;
      if (n == null) return out;
      out.correct = n === q.answer;
      if (!out.correct && q.wrongs) {
        const hit = q.wrongs.find(w => w.value === n);
        if (hit) out.tag = hit.tag;
      }
      /* A right number with the wrong kind of unit is still a unit mistake. */
      if (out.correct && q.unit && typeof response === 'string') {
        const kind = unitInText(response);
        if (kind === 'linear' && isSquareUnit(q.unit)) { out.correct = false; out.tag = 'linear-unit-for-area'; }
        if (kind === 'square' && !isSquareUnit(q.unit)) { out.correct = false; out.tag = 'square-unit-for-perimeter'; }
      }
    } else if (q.type === 'sort') {
      const placed = response || {};
      const wrong = q.cards.filter(c => placed[c.id] && placed[c.id] !== c.bin);
      out.correct = q.cards.every(c => placed[c.id] === c.bin);
      if (!out.correct && wrong.length) {
        out.tag = wrong[0].bin === 'around' ? 'chose-area-for-border' : 'chose-perimeter-for-cover';
        out.wrongCards = wrong.map(c => c.id);
      }
    } else if (q.type === 'match') {
      const m = response || {};
      out.correct = q.left.every(l => m[l.id] === l.id);
      if (!out.correct) out.tag = 'chose-perimeter-for-cover';
    } else if (q.type === 'explain') {
      const text = String(response || '').toLowerCase();
      const words = text.split(/\s+/).filter(Boolean);
      const hit = q.keywords.some(k => text.indexOf(k) >= 0);
      /* An explanation is never "wrong". It either shows the idea or it is
         an invitation to compare with a model answer. */
      out.correct = words.length >= 3 && hit;
      out.tag = out.correct ? null : 'explain-thin';
      out.teach = q.model;
    } else if (q.type === 'worked') {
      const vals = response || {};
      out.correct = q.steps.every((s, i) => {
        if (s.blank != null) return parseNumber(vals[i]) === s.blank;
        if (s.blankUnit) return String(vals[i] || '').replace(/²/g, '2').replace(/\s/g, '') === s.blankUnit;
        return true;
      });
      if (!out.correct) {
        const bad = q.steps.findIndex((s, i) =>
          (s.blank != null && parseNumber(vals[i]) !== s.blank) ||
          (s.blankUnit && String(vals[i] || '').replace(/²/g, '2').replace(/\s/g, '') !== s.blankUnit));
        out.badStep = bad;
        if (q.steps[bad] && q.steps[bad].blankUnit)
          out.tag = q.mode === 'area' ? 'linear-unit-for-area' : 'square-unit-for-perimeter';
      }
    } else if (q.type === 'mission') {
      out.correct = !!(response && response.allRight);
      out.tag = response && response.firstWrongTag ? response.firstWrongTag : null;
    } else if (q.type === 'build') {
      out.correct = !!(response && response.ok);
      out.tag = response && response.tag ? response.tag : null;
    }

    /* A question may also carry its own wording for any wrong answer — same
       reason as the per-choice override above. */
    if (!out.correct && !out.teach && q.teachWrong) out.teach = q.teachWrong;
    if (!out.teach && out.tag && C().misconception(out.tag)) out.teach = C().misconception(out.tag).say;
    if (!out.teach && !out.correct) out.teach = q.explain;
    return out;
  }

  /* ====================================================================== */
  /*  RECORDING AND MASTERY                                                 */
  /* ====================================================================== */

  function record(skillId, opts) {
    const st = get();
    const sk = st.skills[skillId];
    if (!sk) return null;
    const correct = !!opts.correct;
    sk.hist.push({ c: correct ? 1 : 0, t: opts.type || 'mcq', d: todayKey() });
    if (sk.hist.length > 40) sk.hist = sk.hist.slice(-40);
    sk.attempts++;
    if (correct) sk.correct++;
    if (opts.hintsUsed) sk.hints += opts.hintsUsed;
    if (!correct && opts.tag) sk.misc[opts.tag] = (sk.misc[opts.tag] || 0) + 1;

    /* effort counters — these drive the effort badges */
    const cs = st.counters;
    if (correct && opts.afterWrong) cs.recovery++;
    if (correct && opts.hintsUsed) cs.hintSolve++;
    if (opts.type === 'explain' && correct) cs.explain++;
    if (correct && opts.type === 'sort') cs.sortRight++;
    if (correct && opts.type === 'trace') cs.traceRight++;
    if (correct && opts.type === 'tiles') cs.tileRight++;
    if (correct && opts.type === 'unit') cs.unitRight++;

    if (opts.sig) {
      st.recent.push(opts.sig);
      if (st.recent.length > 5) st.recent = st.recent.slice(-5);
    }
    save();
    return sk;
  }

  /**
   * Log a misconception WITHOUT counting an attempt.
   * A first wrong answer gets a retry rather than a mark against her, so it
   * never reaches record(). But a mistake she recovers from is still the most
   * useful thing the Grown-up Corner can report — "she keeps reading a border
   * job as a cover job" is true whether or not she fixed it on the second go.
   */
  function noteMisconception(skillId, tag) {
    const sk = get().skills[skillId];
    if (!sk || !tag) return;
    sk.misc[tag] = (sk.misc[tag] || 0) + 1;
    save();
  }

  /** Secure = at least 4 of the last 5 right, across at least 2 formats. */
  function isSecure(skillId) {
    const sk = get().skills[skillId];
    if (!sk || sk.hist.length < SECURE_WINDOW) return false;
    const last = sk.hist.slice(-SECURE_WINDOW);
    const right = last.reduce((n, h) => n + h.c, 0);
    const formats = new Set(last.map(h => h.t));
    return right >= SECURE_NEEDED && formats.size >= SECURE_FORMATS;
  }

  function accuracy(skillId) {
    const sk = get().skills[skillId];
    if (!sk || !sk.attempts) return null;
    return sk.correct / sk.attempts;
  }

  /** 0 not met · 1 met · 2 getting there · 3 secure */
  function level(skillId) {
    const sk = get().skills[skillId];
    if (!sk || !sk.attempts) return 0;
    if (isSecure(skillId)) return 3;
    const last = sk.hist.slice(-SECURE_WINDOW);
    const right = last.reduce((n, h) => n + h.c, 0);
    return right >= 3 ? 2 : 1;
  }

  function secureCount() { return C().skills.filter(s => isSecure(s.id)).length; }

  function weakSkills() {
    return C().skills
      .map(s => ({ id: s.id, name: s.name, acc: accuracy(s.id), attempts: get().skills[s.id].attempts }))
      .filter(s => s.attempts >= 2 && !isSecure(s.id) && s.acc != null && s.acc < 0.7)
      .sort((a, b) => a.acc - b.acc);
  }

  /** The misconception she is making most, for the Grown-up Corner. */
  function topMisconceptions(n) {
    const all = {};
    C().skills.forEach(s => {
      const m = get().skills[s.id].misc || {};
      Object.keys(m).forEach(t => { all[t] = (all[t] || 0) + m[t]; });
    });
    return Object.keys(all)
      .map(t => ({ tag: t, n: all[t], info: C().misconception(t) }))
      .filter(x => x.info)
      .sort((a, b) => b.n - a.n)
      .slice(0, n || 4);
  }

  /* ---------------------------------------------------------- missions */

  function missionOpen(id) {
    const m = C().mission(id);
    if (!m) return false;
    if (!m.opens) return true;
    return get().missions[m.opens] && get().missions[m.opens].done;
  }

  function missionProgress(id) {
    const st = get().missions[id];
    if (!st) return 0;
    const total = (window.MQ_BANK && window.MQ_BANK.forMission(id).length) || 0;
    if (!total) return 0;
    const done = Object.keys(st.acts).filter(k => st.acts[k].done).length;
    return Math.min(1, done / total);
  }

  function completeActivity(missionId, actId, correct) {
    const st = get().missions[missionId];
    if (!st) return;
    const prev = st.acts[actId] || { done: false, tries: 0, correct: false };
    prev.done = true;
    prev.tries++;
    prev.correct = prev.correct || !!correct;
    st.acts[actId] = prev;
    const total = (window.MQ_BANK && window.MQ_BANK.forMission(missionId).length) || 0;
    if (total && Object.keys(st.acts).filter(k => st.acts[k].done).length >= total) st.done = true;
    save();
  }

  /* ------------------------------------------------------------ badges */

  function checkBadges() {
    const st = get();
    const cs = st.counters;
    const won = [];
    const give = id => { if (!st.badges[id]) { st.badges[id] = todayKey(); won.push(id); } };

    if (cs.sortRight >= 8) give('border-detective');
    if (cs.traceRight >= 5) give('edge-explorer');
    if (cs.tileRight >= 5) give('tile-master');
    if (cs.unitRight >= 10) give('unit-expert');
    if (isSecure('count-perimeter') && isSecure('calc-perimeter')) give('perimeter-pathfinder');
    if (isSecure('count-squares') && isSecure('calc-area')) give('area-adventurer');
    if (secureCount() === C().skills.length) give('measurement-champion');
    if (cs.recovery >= 5) give('great-recovery');
    if (cs.hintSolve >= 5) give('clue-reader');
    if (cs.explain >= 5) give('explainer');

    if (won.length) save();
    return won;
  }

  /* ---------------------------------------------------------- sessions */

  function logSession(n, correct) {
    const st = get();
    st.sessions.push({ day: todayKey(), n, correct, at: Date.now() });
    if (st.sessions.length > 40) st.sessions = st.sessions.slice(-40);
    save();
  }

  function doneToday() {
    const t = todayKey();
    return get().sessions.filter(s => s.day === t).reduce((n, s) => n + s.n, 0);
  }

  /* ====================================================================== */
  /*  PRACTICE QUEUES                                                       */
  /* ====================================================================== */

  let seedCounter = 0;
  function nextSeed() {
    const st = get();
    seedCounter = (seedCounter + 1) % 100000;
    return ((st.seed || 1) + Date.now() % 100000 + seedCounter * 2654435761) >>> 0;
  }

  /**
   * A question for a skill, avoiding anything whose numbers match one of her
   * five most recent questions.
   */
  function question(skillId, opts) {
    opts = opts || {};
    const ids = generatorsFor(skillId);
    if (!ids.length) return null;
    const recent = get().recent || [];
    let best = null;
    for (let i = 0; i < 24; i++) {
      const id = ids[(i + (opts.offset || 0)) % ids.length];
      const q = gen(id, opts.seed != null ? opts.seed + i : nextSeed());
      if (recent.indexOf(q.sig) < 0) return q;
      best = best || q;
    }
    return best;
  }

  /** A five-question set aimed at one weak skill, as promised on the report. */
  function practiceSet(skillId, n) {
    const out = [];
    const ids = generatorsFor(skillId);
    for (let i = 0; i < (n || 5); i++) {
      out.push(gen(ids[i % ids.length], nextSeed()));
    }
    return out;
  }

  /** The daily mix: weak skills first, then anything not yet secure, then a
      light review of what is secure so it does not fade. */
  function dailyQueue(n) {
    n = n || SESSION_TARGET;
    const weak = weakSkills().map(w => w.id);
    const unmet = C().skills.filter(s => get().skills[s.id].attempts === 0).map(s => s.id);
    const notSecure = C().skills.filter(s => !isSecure(s.id) && get().skills[s.id].attempts > 0).map(s => s.id);
    const secure = C().skills.filter(s => isSecure(s.id)).map(s => s.id);
    const order = [];
    const push = arr => arr.forEach(id => { if (order.indexOf(id) < 0) order.push(id); });
    push(weak); push(unmet); push(notSecure); push(secure);
    const out = [];
    for (let i = 0; i < n && order.length; i++) out.push(question(order[i % order.length], { offset: i }));
    return out.filter(Boolean);
  }

  /* ====================================================================== */
  /*  WORKSHEET DATA (rendered by worksheets/mq-worksheet.html)             */
  /* ====================================================================== */

  const SHEET_KINDS = {
    perimeter: { name: 'Perimeter only', gens: ['perim-rect', 'perim-square', 'perim-missing'] },
    area: { name: 'Area only', gens: ['area-rect', 'area-square', 'area-missing'] },
    choose: { name: 'Choose area or perimeter', gens: ['job-which', 'unit-pick'] },
    mixed: { name: 'Mixed practice', gens: ['perim-rect', 'area-rect', 'unit-pick', 'perim-square', 'area-square', 'find-mistake'] },
    words: { name: 'Word problems', gens: ['mini-mission', 'perim-rect', 'area-rect'] },
    weak: { name: 'Her weak skills right now', gens: null }
  };

  /** Build a sheet from an explicit generator list. One implementation, so a
      sheet and its answer key can never drift apart. */
  function worksheetFrom(gens, seed, n) {
    const out = [];
    const list = (gens && gens.length) ? gens : SHEET_KINDS.mixed.gens;
    for (let i = 0; i < (n || 12); i++) {
      out.push(gen(list[i % list.length], (seed + i * 104729) >>> 0));
    }
    return out;
  }

  /** The generators behind a set of skills, de-duplicated and in order. */
  function gensForSkills(skillIds) {
    const out = [];
    (skillIds || []).forEach(id => generatorsFor(id).forEach(g => {
      if (out.indexOf(g) < 0) out.push(g);
    }));
    return out;
  }

  /** Deterministic given a seed, so the sheet and its key always agree. */
  function worksheet(kind, seed, n) {
    n = n || 12;
    let gens = (SHEET_KINDS[kind] || SHEET_KINDS.mixed).gens;
    if (kind === 'weak') {
      const w = weakSkills();
      gens = w.length
        ? w.slice(0, 3).reduce((acc, s) => acc.concat(generatorsFor(s.id)), [])
        : SHEET_KINDS.mixed.gens;
      gens = gens.filter((v, i, a) => a.indexOf(v) === i);
    }
    return worksheetFrom(gens, seed, n);
  }

  /* ====================================================================== */
  /*  DIAGNOSTIC — "Let's see what you already know!"                       */
  /* ====================================================================== */

  function diagnosticQuestions(seed) {
    seed = seed || 20260831;
    return [
      gen('sort-jobs', seed),
      gen('job-which', seed + 11),
      gen('count-perimeter', seed + 22),
      gen('count-squares', seed + 33),
      gen('job-which', seed + 44),
      gen('unit-pick', seed + 55),
      gen('perim-rect', seed + 66),
      gen('area-rect', seed + 77)
    ];
  }

  /** Never a score. A place to begin. */
  function diagnosticAdvice(results) {
    const byMission = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0 };
    const seen = { m1: 0, m2: 0, m3: 0, m4: 0, m5: 0 };
    results.forEach(r => {
      const map = { boundary: 'm1', 'id-perimeter': 'm1', 'id-area': 'm1',
        'count-perimeter': 'm2', 'calc-perimeter': 'm3', units: 'm3',
        'count-squares': 'm4', 'calc-area': 'm5', 'real-life': 'm1', compare: 'm1' };
      const m = map[r.skill] || 'm1';
      seen[m]++;
      if (r.correct) byMission[m]++;
    });
    const order = ['m1', 'm2', 'm3', 'm4', 'm5'];
    let start = 'm1';
    for (let i = 0; i < order.length; i++) {
      const m = order[i];
      if (seen[m] && byMission[m] === seen[m]) start = order[Math.min(i + 1, order.length - 1)];
      else { start = m; break; }
    }
    const strong = order.filter(m => seen[m] && byMission[m] === seen[m]);
    return {
      start,
      startName: (C().mission(start) || {}).name,
      strong: strong.map(m => (C().mission(m) || {}).name).filter(Boolean),
      note: strong.length
        ? 'You already know a lot of this. We will start you where it gets new.'
        : 'A perfect place to start — everything here is going to be new and that is exactly right.'
    };
  }

  /* ====================================================================== */

  window.MQ = {
    KEY, SCHEMA, SESSION_TARGET,

    /* units */
    LINEAR, SQUARE, isSquareUnit, isLinearUnit, toSquare, toLinear, fmtUnit, speakUnit, fmtVal,

    /* maths */
    perimeterRect, areaRect, perimeterSquare, areaSquare,
    sideFromPerimeter, sideFromArea, sideOfSquareFromPerimeter,

    /* shapes */
    rectCells, lCells, cellsArea, cellsPerimeter, boundaryLoop, bounds,

    /* generation */
    rng, gen, generatorsFor, validate, signature,
    generators: () => Object.keys(GEN),

    /* state */
    init, load, save, get, reset() { state = blank(); save(); return state; },
    name() { return get().name; },
    setName(n) { get().name = (n || 'Crislyn').trim() || 'Crislyn'; save(); },
    todayKey, dayGap,

    /* answering + progress */
    check, parseNumber, record, noteMisconception, isSecure, accuracy, level, secureCount, weakSkills,
    topMisconceptions, missionOpen, missionProgress, completeActivity, checkBadges,
    logSession, doneToday,

    /* queues */
    question, practiceSet, dailyQueue,

    /* extras */
    worksheet, worksheetFrom, gensForSkills, sheetKinds: SHEET_KINDS,
    diagnosticQuestions, diagnosticAdvice
  };
})();

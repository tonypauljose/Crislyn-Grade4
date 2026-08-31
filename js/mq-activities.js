/* ==========================================================================
   MEASUREQUEST — the activities
   --------------------------------------------------------------------------
   Fifteen renderers, one contract. Everything that draws a shape or takes an
   answer lives here; everything that decides whether the answer is right
   lives in the engine. There is one copy of the grading logic and it is not
   in this file.

   THE CONTRACT
     const act = MQActivities.render(q, host, { onSubmit, onProgress });
     act.auto      true when the activity submits on its own (tapping a
                   choice), false when the screen needs a Check button
     act.collect() the response, in the shape MQ.check() expects

   TABLET FIRST. Crislyn works on a touchscreen, so the two activities that
   carry the core idea are FINGER GESTURES, not taps:

     trace  — drag around the boundary. The edge lights up behind her finger,
              it refuses to jump across the shape, and it is only finished
              when she arrives back where she began. "Perimeter goes around"
              stops being a sentence and becomes something her hand did.
     shade  — drag across the middle. The squares fill in under her finger.

   Both work with a mouse, and both have a keyboard path (a Step button plus
   arrow keys) so nothing here needs a pointer at all.

   Pointer events are used rather than touch events so one code path covers
   finger, stylus and mouse. `touch-action: none` on the drawing surface is
   what stops the page scrolling while she is tracing.
   ========================================================================== */

(function () {
  'use strict';

  const MQ = () => window.MQ;
  const CT = () => window.MQ_CONTENT;

  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    if (attrs) Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  };
  const h = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ====================================================================== */
  /*  ILLUSTRATIONS — small, custom, no emoji, no stock art                 */
  /* ====================================================================== */

  const ICONS = {
    cake: '<circle cx="12" cy="5" r="1.1"/><path d="M12 6.2v2.3"/><path d="M4 12h16v7H4z"/><path d="M4 12c0-1.7 3.6-3 8-3s8 1.3 8 3"/><path d="M4 15.5c1.6 1.2 3.2-1.2 4.8 0s3.2-1.2 4.8 0 3.2-1.2 4.8 0"/>',
    card: '<path d="M4 5h16v14H4z"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    gift: '<path d="M3 9h18v3H3z"/><path d="M4.5 12h15v8h-15z"/><path d="M12 9v11"/><path d="M12 9c-2.5 0-4-1-4-2.4S9.6 4.4 12 9zM12 9c2.5 0 4-1 4-2.4S14.4 4.4 12 9z"/>',
    stage: '<path d="M3 8h18v10H3z"/><path d="M3 8l3-3h12l3 3"/><path d="M7 18v3M17 18v3"/>',
    pitch: '<path d="M3 6h18v12H3z"/><path d="M12 6v12"/><circle cx="12" cy="12" r="2.2"/><path d="M3 9.5h2.5v5H3M21 9.5h-2.5v5H21"/>',
    garden: '<path d="M4 20V9M8 20V9M12 20V9M16 20V9M20 20V9"/><path d="M2 9h20"/><path d="M6 6.5c0-1.4 1.1-2.5 2.5-2.5M15.5 4c1.4 0 2.5 1.1 2.5 2.5"/>',
    photo: '<path d="M4 5h16v14H4z"/><path d="M7 8h10v8H7z"/><circle cx="10" cy="11" r="1"/><path d="M7 16l3.5-3.5 2.5 2.5 2-2 2 3"/>',
    board: '<path d="M4 5h16v12H4z"/><path d="M12 17v3"/><path d="M8 8h5M8 11h8M8 14h4"/>',
    bedroom: '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M6 10V7h6v3"/>',
    window: '<path d="M4 4h16v16H4z"/><path d="M12 4v16M4 12h16"/>',
    wall: '<path d="M3 6h18v12H3z"/><path d="M3 10h18M3 14h18"/><path d="M9 6v4M15 10v4M9 14v4"/>',
    kitchen: '<path d="M3 6h18v12H3z"/><path d="M9 6v12M15 6v12M3 12h18"/>',
    playground: '<path d="M5 20V6l7 3 7-3v14"/><path d="M5 12h14"/>',
    table: '<path d="M3 9h18"/><path d="M5 9v11M19 9v11"/><path d="M4 9l3-3h10l3 3"/>',
    box: '<path d="M3 8h18v12H3z"/><path d="M3 8l2-4h14l2 4"/><path d="M12 4v16"/><path d="M8 12h2M14 12h2"/>',
    walk: '<circle cx="9" cy="4.5" r="1.6"/><path d="M9 7v5l-2 8M9 12l3 3 1 5M6 9l3-2 3 1 2 3"/>',
    rect: '<path d="M4 7h16v10H4z"/><path d="M4 7l-1.5-1.5M20 7l1.5-1.5"/>',
    square: '<path d="M6 6h12v12H6z"/><path d="M9 6v1M15 6v1M6 9h1M6 15h1"/>',
    pairs: '<path d="M4 8h16M4 16h16"/><path d="M4 8v8M20 8v8"/><circle cx="7" cy="8" r="1.2"/><circle cx="7" cy="16" r="1.2"/>',
    tiles: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    rows: '<path d="M3 5h18v14H3z"/><path d="M3 9.7h18M3 14.3h18"/><path d="M8 5v14M13 5v14M18 5v14"/>',
    unitcard: '<path d="M4 6h16v12H4z"/><path d="M8 10h3M8 14h8"/><circle cx="16" cy="9.5" r="1.6"/>',
    reveal: '<path d="M12 3l2.2 5.6L20 9.4l-4 4.2 1 5.9-5-2.9-5 2.9 1-5.9-4-4.2 5.8-.8z"/>',
    detective: '<circle cx="10" cy="10" r="5"/><path d="M13.8 13.8L21 21"/><path d="M5 5.5C5.6 3.8 7.2 3 10 3"/>',
    lab: '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 18l-5-9V3"/><path d="M8 3h8"/><path d="M7.5 15h9"/>'
  };

  function icon(name, cls) {
    const box = h('span', 'mq-icon ' + (cls || ''));
    box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || ICONS.rect) + '</svg>';
    return box;
  }

  /* ====================================================================== */
  /*  SHAPE DRAWING                                                         */
  /* ====================================================================== */

  const CELL = 34;      /* px per unit square at full size */
  const PAD = 26;

  /** Grid-cell shape. Returns { svg, cellAt, edgeAt } for the interactives. */
  function drawCells(cells, opts) {
    opts = opts || {};
    const b = MQ().bounds(cells);
    const size = opts.cell || Math.max(18, Math.min(CELL, Math.floor(520 / Math.max(b.w, b.h + 1))));
    const W = b.w * size + PAD * 2, H = b.h * size + PAD * 2;
    const svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H, class: 'mq-shape',
      role: 'img', 'aria-label': opts.label || 'A shape on a grid'
    });
    svg.style.maxWidth = Math.min(W, 560) + 'px';

    const gGrid = el('g', { class: 'mq-grid' }, svg);
    const gFill = el('g', { class: 'mq-fill' }, svg);
    const gEdge = el('g', { class: 'mq-edges' }, svg);

    const px = x => PAD + x * size;
    const py = y => PAD + y * size;

    /* faint full-grid backdrop so the unit squares are visible */
    for (let y = 0; y <= b.h; y++)
      el('line', { x1: px(0), y1: py(y), x2: px(b.w), y2: py(y), class: 'mq-gridline' }, gGrid);
    for (let x = 0; x <= b.w; x++)
      el('line', { x1: px(x), y1: py(0), x2: px(x), y2: py(b.h), class: 'mq-gridline' }, gGrid);

    /* the cells themselves */
    const cellNodes = {};
    cells.forEach(c => {
      const r = el('rect', {
        x: px(c.x), y: py(c.y), width: size, height: size,
        class: 'mq-cell', 'data-cell': c.x + ',' + c.y
      }, gFill);
      cellNodes[c.x + ',' + c.y] = r;
    });

    /* boundary, in loop order, each edge separately hit-testable */
    const loop = MQ().boundaryLoop(cells);
    const edgeNodes = [];
    loop.forEach((e, i) => {
      const g = el('g', { class: 'mq-edge-g' }, gEdge);
      el('line', {
        x1: px(e.ax), y1: py(e.ay), x2: px(e.bx), y2: py(e.by),
        class: 'mq-edge-hit', 'data-edge': i
      }, g);
      const line = el('line', {
        x1: px(e.ax), y1: py(e.ay), x2: px(e.bx), y2: py(e.by), class: 'mq-edge'
      }, g);
      edgeNodes.push({ line, g, i });
    });

    return { svg, size, px, py, cellNodes, edgeNodes, loop, bounds: b };
  }

  /** A labelled rectangle with no grid — for the formula questions. */
  function drawRect(shape, opts) {
    opts = opts || {};
    const mode = shape.show === 'area' ? 'area' : 'perimeter';
    const maxW = 300, maxH = 200;
    const l = shape.l, w = shape.w;
    let pw = maxW, ph = 150;
    if (l && w) {
      /* The drawing must have the SAME shape as the numbers describe it —
         a square of side 8 has to come out square, not a wide rectangle,
         or the equal-side ticks are drawn on sides that plainly are not
         equal. So scale the true ratio down until it fits the box. */
      const ratio = w / l;
      pw = maxW; ph = pw * ratio;
      if (ph > maxH) { ph = maxH; pw = ph / ratio; }
      if (ph < 40) { ph = 40; pw = Math.min(maxW, ph / ratio); }
    }
    const W = pw + 120, H = ph + 96;
    const said = shape.kind === 'square'
      ? 'A square with sides of ' + (shape.l != null ? shape.l : 'unknown length') +
        (shape.unit && shape.unit !== 'units' ? ' ' + shape.unit : '')
      : 'A rectangle ' + (shape.l != null ? shape.l : 'an unknown length') + ' by ' +
        (shape.w != null ? shape.w : 'an unknown width') +
        (shape.unit && shape.unit !== 'units' ? ' ' + shape.unit : '');
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'mq-shape mq-shape-' + mode,
      role: 'img', 'aria-label': said });
    svg.style.maxWidth = Math.min(W, 460) + 'px';
    const x0 = 60, y0 = 44;

    el('rect', { x: x0, y: y0, width: pw, height: ph, class: 'mq-rect mq-rect-' + mode }, svg);

    if (mode === 'area') {
      el('rect', { x: x0, y: y0, width: pw, height: ph, class: 'mq-rect-hatch', fill: 'url(#mqhatch)' }, svg);
      const defs = el('defs', {}, svg);
      const pat = el('pattern', { id: 'mqhatch', width: 8, height: 8, patternUnits: 'userSpaceOnUse',
        patternTransform: 'rotate(45)' }, defs);
      el('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: 'currentColor', 'stroke-width': 2, opacity: .18 }, pat);
    }

    const lbl = (x, y, text, cls) => {
      const t = el('text', { x, y, class: 'mq-dim ' + (cls || ''), 'text-anchor': 'middle' }, svg);
      t.textContent = text;
      return t;
    };
    const unit = shape.unit && shape.unit !== 'units' ? ' ' + shape.unit : '';
    lbl(x0 + pw / 2, y0 - 14, shape.l != null ? shape.l + unit : '?');
    lbl(x0 - 34, y0 + ph / 2 + 5, shape.w != null ? shape.w + unit : '?');
    if (opts.showOpposite !== false && shape.kind === 'rect' && shape.l != null && shape.w != null) {
      lbl(x0 + pw / 2, y0 + ph + 26, shape.l + unit, 'mq-dim-ghost');
      lbl(x0 + pw + 34, y0 + ph / 2 + 5, shape.w + unit, 'mq-dim-ghost');
    }
    if (shape.kind === 'square') {
      /* equal-side ticks, drawn on all four sides because they ARE all equal */
      const tick = (cx, cy, vertical) => el('line', {
        x1: vertical ? cx - 6 : cx, y1: vertical ? cy : cy - 6,
        x2: vertical ? cx + 6 : cx, y2: vertical ? cy : cy + 6, class: 'mq-tick'
      }, svg);
      tick(x0 + pw / 2, y0, false); tick(x0 + pw / 2, y0 + ph, false);
      tick(x0, y0 + ph / 2, true); tick(x0 + pw, y0 + ph / 2, true);
    }
    return { svg };
  }

  /** Whichever drawing this question needs. */
  function drawShape(shape, opts) {
    if (!shape) return null;
    if (shape.cells && shape.cells.length) return drawCells(shape.cells, opts);
    return drawRect(shape, opts);
  }

  /* ====================================================================== */
  /*  SHARED BITS                                                           */
  /* ====================================================================== */

  function storyPanel(story) {
    const box = h('div', 'mq-story');
    if (story.art) {
      const art = h('div', 'mq-story-art');
      art.appendChild(icon(story.art));
      box.appendChild(art);
    }
    const body = h('div', 'mq-story-body');
    if (story.title) body.appendChild(h('h3', 'mq-story-title', story.title));
    body.appendChild(h('div', 'mq-story-text', story.text));
    box.appendChild(body);
    return box;
  }

  /** A big friendly number pad. Producing the number is the skill, so there
      is never a list of answers to pick from. */
  function numberPad(input, onEnter) {
    const pad = h('div', 'mq-pad');
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];
    keys.forEach(k => {
      const b = h('button', 'mq-key' + (k === 'clear' || k === 'back' ? ' mq-key-fn' : ''),
        k === 'back' ? '&larr;' : k === 'clear' ? 'clear' : k);
      b.type = 'button';
      b.setAttribute('aria-label', k === 'back' ? 'Delete last digit' : k === 'clear' ? 'Clear' : k);
      b.onclick = () => {
        if (k === 'clear') input.value = '';
        else if (k === 'back') input.value = input.value.slice(0, -1);
        else input.value += k;
        input.dispatchEvent(new Event('input'));
        input.focus();
      };
      pad.appendChild(b);
    });
    return pad;
  }

  function unitChips(units, onPick, selected) {
    const row = h('div', 'mq-units');
    units.forEach(u => {
      const b = h('button', 'mq-unit-chip' + (selected === u ? ' is-on' : ''), MQ().fmtUnit(u));
      b.type = 'button';
      b.setAttribute('aria-pressed', selected === u ? 'true' : 'false');
      b.onclick = () => onPick(u, b);
      row.appendChild(b);
    });
    return row;
  }

  /* ====================================================================== */
  /*  THE RENDERERS                                                         */
  /* ====================================================================== */

  const R = {};

  /* ------------------------------------------------------------------ mcq */
  R.mcq = R.unit = R.mistake = R.compare = function (q, host, api) {
    if (q.type === 'mistake' && q.workingShown) {
      const w = h('div', 'mq-working');
      w.appendChild(h('div', 'mq-working-label', 'The working:'));
      w.appendChild(h('div', 'mq-working-line', q.workingShown));
      host.appendChild(w);
    }
    if (q.type === 'compare' && q.shapes) {
      const row = h('div', 'mq-compare');
      q.shapes.forEach(s => {
        const card = h('div', 'mq-compare-card');
        card.appendChild(h('div', 'mq-compare-key', 'Shape ' + s.key));
        const d = drawCells(s.cells, { cell: 22, label: 'Shape ' + s.key });
        card.appendChild(d.svg);
        card.appendChild(h('div', 'mq-compare-note',
          '<span class="mq-chip mq-chip-area">' + s.area + ' tiles inside</span>' +
          '<span class="mq-chip mq-chip-perimeter">' + s.perimeter + ' steps around</span>'));
        row.appendChild(card);
      });
      host.appendChild(row);
    }
    const list = h('div', 'mq-choices');
    q.choices.forEach((c, i) => {
      const b = h('button', 'mq-choice', c.label);
      b.type = 'button';
      b.onclick = () => {
        if (list.dataset.locked) return;
        list.dataset.locked = '1';
        Array.from(list.children).forEach(x => x.classList.add('is-dim'));
        b.classList.remove('is-dim');
        b.classList.add('is-picked');
        api.onSubmit(c);
      };
      list.appendChild(b);
    });
    host.appendChild(list);
    return { auto: true, collect: () => null, reset() { delete list.dataset.locked;
      Array.from(list.children).forEach(x => { x.className = 'mq-choice'; }); } };
  };

  /* --------------------------------------------------------------- number */
  R.number = R.missing = function (q, host, api, opts) {
    /* `opts.shape === false` when this is nested underneath a trace or a
       tiling activity, which has already drawn the very same shape. Drawing
       it twice would stack two identical grids down the tablet screen. */
    if (q.shape && !(opts && opts.shape === false)) {
      const d = drawShape(q.shape);
      if (d) host.appendChild(wrapShape(d.svg, q));
    }
    const wrap = h('div', 'mq-answer');
    const input = h('input', 'mq-input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'Your answer');
    input.placeholder = '?';
    const line = h('div', 'mq-answer-line');
    line.appendChild(input);
    if (q.unit) line.appendChild(h('span', 'mq-answer-unit', MQ().fmtUnit(q.unit)));
    wrap.appendChild(line);
    wrap.appendChild(numberPad(input));
    host.appendChild(wrap);
    input.addEventListener('input', () => api.onProgress && api.onProgress());
    return {
      auto: false,
      focus: () => input.focus(),
      collect: () => MQ().parseNumber(input.value),
      ready: () => String(input.value).trim() !== ''
    };
  };

  /* ---------------------------------------------------------------- trace */
  /* Drag a finger around the boundary. Refuses to jump, refuses to skip,
     and is only finished when the loop closes. */
  R.trace = function (q, host, api) {
    const d = drawCells(q.shape.cells, { label: 'Trace around this shape' });
    d.svg.classList.add('mq-traceable');
    const n = d.edgeNodes.length;
    const done = new Array(n).fill(false);
    let first = -1, last = -1, dir = 0, count = 0, closed = false;

    const counter = h('div', 'mq-trace-count');
    const paint = () => {
      counter.innerHTML = '<span class="mq-trace-n">' + count + '</span> ' +
        (count === 1 ? 'step' : 'steps') + (closed ? ' &mdash; back at the start!' : '');
      counter.classList.toggle('is-closed', closed);
    };

    function take(i) {
      if (closed || done[i]) return;
      if (first < 0) { first = i; dir = 0; }
      else if (dir === 0) {
        if (i === (last + 1) % n) dir = 1;
        else if (i === (last - 1 + n) % n) dir = -1;
        else return nudge();
      } else if (i !== (last + dir + n) % n) return nudge();
      done[i] = true; last = i; count++;
      d.edgeNodes[i].line.classList.add('is-traced');
      if (count === n) { closed = true; d.svg.classList.add('is-closed'); }
      paint();
      api.onProgress && api.onProgress();
    }
    function nudge() {
      d.svg.classList.add('mq-shake');
      setTimeout(() => d.svg.classList.remove('mq-shake'), 320);
    }

    let drawing = false;
    const hit = (x, y) => {
      const t = document.elementFromPoint(x, y);
      if (t && t.hasAttribute && t.hasAttribute('data-edge')) take(+t.getAttribute('data-edge'));
    };
    d.svg.addEventListener('pointerdown', e => { drawing = true; d.svg.setPointerCapture(e.pointerId); hit(e.clientX, e.clientY); e.preventDefault(); });
    d.svg.addEventListener('pointermove', e => { if (drawing) hit(e.clientX, e.clientY); });
    const stop = () => { drawing = false; };
    d.svg.addEventListener('pointerup', stop);
    d.svg.addEventListener('pointercancel', stop);
    d.svg.addEventListener('pointerleave', stop);

    host.appendChild(wrapShape(d.svg, q));
    host.appendChild(counter);

    /* Keyboard and no-pointer path: one edge per press. */
    const step = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Step around &rarr;');
    step.type = 'button';
    step.onclick = () => { take(first < 0 ? 0 : (last + (dir || 1) + n) % n); };
    const tools = h('div', 'mq-tools');
    tools.appendChild(step);
    const undo = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Start again');
    undo.type = 'button';
    undo.onclick = () => {
      done.fill(false); first = last = -1; dir = 0; count = 0; closed = false;
      d.edgeNodes.forEach(e => e.line.classList.remove('is-traced'));
      d.svg.classList.remove('is-closed');
      paint();
    };
    tools.appendChild(undo);
    host.appendChild(tools);
    paint();

    if (q.justDo) return { auto: false, collect: () => ({ complete: closed }), ready: () => closed };

    /* It also wants the number, once the walk is done. */
    const numHost = h('div', 'mq-after-trace');
    host.appendChild(numHost);
    const num = R.number(q, numHost, api, { shape: false });
    return {
      auto: false,
      collect: () => num.collect(),
      ready: () => num.ready(),
      traced: () => closed
    };
  };

  /* ------------------------------------------------------- shade / tiles */
  R.shade = R.tiles = function (q, host, api) {
    const isTiles = q.type === 'tiles';
    const d = drawCells(q.shape.cells, { label: isTiles ? 'Cover this floor with tiles' : 'Shade the inside' });
    d.svg.classList.add(isTiles ? 'mq-tileable' : 'mq-shadeable');
    const keys = Object.keys(d.cellNodes);
    const filled = {};
    let n = 0;

    const counter = h('div', 'mq-trace-count');
    const paint = () => {
      const all = n === keys.length;
      counter.innerHTML = '<span class="mq-trace-n">' + n + '</span> of ' + keys.length +
        (isTiles ? (n === 1 ? ' tile' : ' tiles') : ' squares') + (all ? ' &mdash; all covered!' : '');
      counter.classList.toggle('is-closed', all);
    };
    function fill(k) {
      if (filled[k]) return;
      filled[k] = true; n++;
      d.cellNodes[k].classList.add(isTiles ? 'is-tiled' : 'is-shaded');
      paint();
      api.onProgress && api.onProgress();
    }
    let drawing = false;
    const hit = (x, y) => {
      const t = document.elementFromPoint(x, y);
      if (t && t.hasAttribute && t.hasAttribute('data-cell')) fill(t.getAttribute('data-cell'));
    };
    d.svg.addEventListener('pointerdown', e => { drawing = true; d.svg.setPointerCapture(e.pointerId); hit(e.clientX, e.clientY); e.preventDefault(); });
    d.svg.addEventListener('pointermove', e => { if (drawing) hit(e.clientX, e.clientY); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
      d.svg.addEventListener(ev, () => { drawing = false; }));

    host.appendChild(wrapShape(d.svg, q));
    host.appendChild(counter);

    const tools = h('div', 'mq-tools');
    const fillAll = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', isTiles ? 'Lay one tile' : 'Shade one square');
    fillAll.type = 'button';
    fillAll.onclick = () => { const k = keys.find(x => !filled[x]); if (k) fill(k); };
    tools.appendChild(fillAll);
    const clear = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Start again');
    clear.type = 'button';
    clear.onclick = () => {
      keys.forEach(k => { d.cellNodes[k].classList.remove('is-tiled', 'is-shaded'); delete filled[k]; });
      n = 0; paint();
    };
    tools.appendChild(clear);
    host.appendChild(tools);
    paint();

    if (q.justDo) return { auto: false, collect: () => ({ complete: n === keys.length }), ready: () => n === keys.length };

    const numHost = h('div', 'mq-after-trace');
    host.appendChild(numHost);
    const num = R.number(q, numHost, api, { shape: false });
    return { auto: false, collect: () => num.collect(), ready: () => num.ready() };
  };

  /* ----------------------------------------------------------------- sort */
  R.sort = function (q, host, api) {
    const placed = {};
    const board = h('div', 'mq-sort');
    const pool = h('div', 'mq-sort-pool');
    pool.setAttribute('aria-label', 'Cards to sort');
    const bins = {};

    q.bins.forEach(b => {
      const bin = h('div', 'mq-bin mq-bin-' + b.id);
      bin.appendChild(h('div', 'mq-bin-head', b.label + '<span>' + b.hint + '</span>'));
      const drop = h('div', 'mq-bin-drop');
      drop.dataset.bin = b.id;
      bin.appendChild(drop);
      bins[b.id] = drop;
      board.appendChild(bin);

      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('is-over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
      drop.addEventListener('drop', e => {
        e.preventDefault(); drop.classList.remove('is-over');
        const id = e.dataTransfer.getData('text/plain');
        const card = q.cards.find(c => c.id === id);
        if (card) put(card, b.id);
      });
    });

    function put(card, binId) {
      placed[card.id] = binId;
      const node = document.getElementById('mqcard-' + card.id);
      if (node) {
        bins[binId].appendChild(node);
        node.classList.add('is-placed');
        node.querySelector('.mq-card-where').textContent = binId === 'around' ? 'around' : 'inside';
      }
      api.onProgress && api.onProgress();
    }

    q.cards.forEach(c => {
      const card = h('div', 'mq-card');
      card.id = 'mqcard-' + c.id;
      card.draggable = true;
      card.tabIndex = 0;
      if (c.icon) card.appendChild(icon(c.icon, 'mq-card-icon'));
      card.appendChild(h('span', 'mq-card-text', c.text));
      card.appendChild(h('span', 'mq-card-where', ''));
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', c.id);
        card.classList.add('is-dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('is-dragging'));

      /* Touch and keyboard both get a tap path — dragging is a bonus, never
         the only way in. */
      const choose = () => {
        const cur = placed[c.id];
        const next = cur === 'around' ? 'inside' : cur === 'inside' ? null : 'around';
        if (next) put(c, next);
        else {
          delete placed[c.id];
          pool.appendChild(card);
          card.classList.remove('is-placed');
          card.querySelector('.mq-card-where').textContent = '';
          api.onProgress && api.onProgress();
        }
      };
      card.onclick = choose;
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } };
      pool.appendChild(card);
    });

    host.appendChild(h('p', 'mq-hint-inline', 'Drag a card into a box &mdash; or just tap it to move it along.'));
    host.appendChild(pool);
    host.appendChild(board);
    return {
      auto: false,
      collect: () => placed,
      ready: () => q.cards.every(c => placed[c.id]),
      mark(wrongIds) {
        q.cards.forEach(c => {
          const node = document.getElementById('mqcard-' + c.id);
          if (!node) return;
          node.classList.toggle('is-wrong', (wrongIds || []).indexOf(c.id) >= 0);
          node.classList.toggle('is-right', (wrongIds || []).indexOf(c.id) < 0 && !!placed[c.id]);
        });
      }
    };
  };

  /* ---------------------------------------------------------------- match */
  R.match = function (q, host, api) {
    const pairs = {};
    let armed = null;
    const wrap = h('div', 'mq-match');
    const colL = h('div', 'mq-match-col'), colR = h('div', 'mq-match-col');
    const nodes = {};

    q.left.forEach((l, i) => {
      const b = h('button', 'mq-match-item', '<span class="mq-match-tag">' + (i + 1) + '</span>' + l.text);
      b.type = 'button';
      b.onclick = () => { armed = { side: 'L', id: l.id, node: b }; refresh(); };
      nodes['L' + l.id] = b;
      colL.appendChild(b);
    });
    q.right.forEach(r => {
      const b = h('button', 'mq-match-item mq-match-right', r.text);
      b.type = 'button';
      b.onclick = () => {
        if (!armed) { armed = { side: 'R', id: r.id, node: b }; refresh(); return; }
        if (armed.side === 'L') { pairs[armed.id] = r.id; armed = null; refresh(); api.onProgress && api.onProgress(); }
        else { armed = { side: 'R', id: r.id, node: b }; refresh(); }
      };
      nodes['R' + r.id] = b;
      colR.appendChild(b);
    });

    function refresh() {
      Object.keys(nodes).forEach(k => nodes[k].classList.remove('is-armed'));
      if (armed) armed.node.classList.add('is-armed');
      q.left.forEach((l, i) => {
        const got = pairs[l.id];
        const rn = got ? nodes['R' + got] : null;
        const tagText = got ? String(i + 1) : '';
        Object.keys(pairs).forEach(() => {});
        if (rn) {
          let tag = rn.querySelector('.mq-match-tag');
          if (!tag) { tag = h('span', 'mq-match-tag'); rn.insertBefore(tag, rn.firstChild); }
          tag.textContent = tagText;
        }
        nodes['L' + l.id].classList.toggle('is-paired', !!got);
      });
      /* clear tags on right items nobody points at */
      q.right.forEach(r => {
        const used = Object.keys(pairs).some(k => pairs[k] === r.id);
        const rn = nodes['R' + r.id];
        const tag = rn.querySelector('.mq-match-tag');
        if (!used && tag) tag.remove();
        rn.classList.toggle('is-paired', used);
      });
    }

    wrap.appendChild(colL); wrap.appendChild(colR);
    host.appendChild(h('p', 'mq-hint-inline', 'Tap a job on the left, then tap the sum that answers it.'));
    host.appendChild(wrap);
    return { auto: false, collect: () => pairs, ready: () => q.left.every(l => pairs[l.id]) };
  };

  /* --------------------------------------------------------------- worked */
  R.worked = function (q, host, api) {
    if (q.shape) { const d = drawShape(q.shape); if (d) host.appendChild(wrapShape(d.svg, q)); }
    const vals = {};
    const list = h('div', 'mq-worked');
    q.steps.forEach((s, i) => {
      const row = h('div', 'mq-worked-step');
      if (s.blank == null && !s.blankUnit) {
        row.classList.add('is-given');
        row.innerHTML = '<span class="mq-worked-n">' + (i + 1) + '</span><span>' + s.text + '</span>';
      } else {
        const span = h('span', 'mq-worked-text');
        const parts = s.text.split('□');
        span.appendChild(document.createTextNode(parts[0]));
        if (s.blankUnit) {
          const chips = unitChips(['cm', 'm', 'cm2', 'm2'], (u, b) => {
            vals[i] = u;
            Array.from(chips.children).forEach(c => { c.classList.remove('is-on'); c.setAttribute('aria-pressed', 'false'); });
            b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true');
            api.onProgress && api.onProgress();
          });
          span.appendChild(chips);
        } else {
          const inp = h('input', 'mq-blank');
          inp.type = 'text'; inp.inputMode = 'numeric'; inp.autocomplete = 'off';
          inp.setAttribute('aria-label', 'Step ' + (i + 1) + ' answer');
          inp.oninput = () => { vals[i] = inp.value; api.onProgress && api.onProgress(); };
          span.appendChild(inp);
        }
        if (parts[1]) span.appendChild(document.createTextNode(parts[1]));
        row.innerHTML = '<span class="mq-worked-n">' + (i + 1) + '</span>';
        row.appendChild(span);
      }
      list.appendChild(row);
    });
    host.appendChild(list);
    return {
      auto: false,
      collect: () => vals,
      ready: () => q.steps.every((s, i) => (s.blank == null && !s.blankUnit) || (vals[i] != null && String(vals[i]).trim() !== '')),
      markStep(i) {
        const row = list.children[i];
        if (row) { row.classList.add('is-wrong'); }
      }
    };
  };

  /* -------------------------------------------------------------- mission */
  /* The detective's four questions, one at a time, on one screen. */
  R.mission = function (q, host, api) {
    if (q.job) {
      const j = h('div', 'mq-job');
      j.appendChild(h('div', 'mq-job-what', q.job.what));
      host.appendChild(j);
    }
    if (q.shape) { const d = drawShape(q.shape); if (d) host.appendChild(wrapShape(d.svg, q)); }

    const answers = [];
    let firstWrongTag = null;
    let idx = 0;
    const holder = h('div', 'mq-steps');
    host.appendChild(holder);
    const done = h('div', 'mq-steps-done');
    host.appendChild(done);

    function showStep() {
      holder.innerHTML = '';
      if (idx >= q.steps.length) return;
      const s = q.steps[idx];
      const box = h('div', 'mq-step');
      box.appendChild(h('div', 'mq-step-n', 'Step ' + (idx + 1) + ' of ' + q.steps.length));
      box.appendChild(h('div', 'mq-step-ask', s.ask));
      if (s.numeric) {
        const wrap = h('div', 'mq-answer');
        const input = h('input', 'mq-input');
        input.type = 'text'; input.inputMode = 'numeric'; input.autocomplete = 'off';
        input.setAttribute('aria-label', 'Your answer');
        input.placeholder = '?';
        const line = h('div', 'mq-answer-line');
        line.appendChild(input);
        if (s.unit) line.appendChild(h('span', 'mq-answer-unit', MQ().fmtUnit(s.unit)));
        wrap.appendChild(line);
        wrap.appendChild(numberPad(input));
        const go = h('button', 'mq-btn mq-btn-primary', 'Check it');
        go.type = 'button';
        go.onclick = () => {
          const v = MQ().parseNumber(input.value);
          if (v == null) return;
          const ok = v === s.answer;
          answers.push(ok);
          if (!ok && !firstWrongTag) firstWrongTag = q.mode === 'area' ? 'added-for-area' : 'added-two-sides';
          markDone(s.ask, ok ? String(v) + ' ' + MQ().fmtUnit(s.unit || '') : String(v), ok);
          idx++; showStep();
          if (idx >= q.steps.length) api.onSubmit({ allRight: answers.every(Boolean), firstWrongTag });
        };
        wrap.appendChild(go);
        box.appendChild(wrap);
        setTimeout(() => input.focus(), 30);
      } else {
        const opts = h('div', 'mq-choices mq-choices-tight');
        s.options.forEach(o => {
          const b = h('button', 'mq-choice', o.label);
          b.type = 'button';
          b.onclick = () => {
            answers.push(!!o.correct);
            if (!o.correct && !firstWrongTag) firstWrongTag = s.tagWrong || null;
            markDone(s.ask, o.label, !!o.correct);
            idx++; showStep();
            if (idx >= q.steps.length) api.onSubmit({ allRight: answers.every(Boolean), firstWrongTag });
          };
          opts.appendChild(b);
        });
        box.appendChild(opts);
      }
      holder.appendChild(box);
      api.onProgress && api.onProgress();
    }
    function markDone(ask, given, ok) {
      const row = h('div', 'mq-step-done' + (ok ? ' is-ok' : ' is-no'));
      row.innerHTML = '<span class="mq-step-mark" aria-hidden="true">' + (ok ? '&#10003;' : '&#8226;') +
        '</span><span class="mq-step-q">' + ask + '</span><b>' + given + '</b>';
      done.appendChild(row);
    }
    showStep();
    return { auto: true, collect: () => ({ allRight: answers.every(Boolean), firstWrongTag }) };
  };

  /* -------------------------------------------------------------- explain */
  R.explain = function (q, host, api) {
    const wrap = h('div', 'mq-explain');
    const ta = h('textarea', 'mq-textarea');
    ta.rows = 3;
    ta.setAttribute('aria-label', 'Your explanation');
    ta.placeholder = 'Type what you think...';
    wrap.appendChild(ta);
    ta.addEventListener('input', () => api.onProgress && api.onProgress());

    /* Speaking it is easier than typing it for a lot of nine-year-olds, so
       offer the microphone when the browser has one, and never require it. */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Say it instead');
      mic.type = 'button';
      mic.onclick = () => {
        try {
          const rec = new SR();
          rec.lang = 'en-GB';
          rec.onresult = e => {
            ta.value = (ta.value ? ta.value + ' ' : '') + e.results[0][0].transcript;
            ta.dispatchEvent(new Event('input'));
          };
          mic.textContent = 'Listening...';
          rec.onend = () => { mic.textContent = 'Say it instead'; };
          rec.start();
        } catch (err) { mic.remove(); }
      };
      wrap.appendChild(mic);
    }
    host.appendChild(wrap);
    return {
      auto: false,
      focus: () => ta.focus(),
      collect: () => ta.value,
      ready: () => ta.value.trim().split(/\s+/).filter(Boolean).length >= 2
    };
  };

  /* ---------------------------------------------------------------- build */
  /* The Shape Lab. Tap or drag to add tiles; the counters update live, so
     the discovery happens in front of her rather than being told to her. */
  R.build = function (q, host, api) {
    const GW = 10, GH = 8;
    const size = 34;
    const W = GW * size + PAD * 2, H = GH * size + PAD * 2;
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'mq-shape mq-buildable', role: 'application',
      'aria-label': 'Building grid, ' + GW + ' by ' + GH });
    svg.style.maxWidth = '520px';
    const px = x => PAD + x * size, py = y => PAD + y * size;
    const on = {};
    const nodes = {};

    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const r = el('rect', { x: px(x), y: py(y), width: size, height: size,
        class: 'mq-build-cell', 'data-cell': x + ',' + y, tabindex: -1 }, svg);
      nodes[x + ',' + y] = r;
    }
    const outline = el('g', { class: 'mq-build-outline' }, svg);

    const bar = h('div', 'mq-lab-bar');
    const areaChip = h('div', 'mq-lab-stat mq-lab-area', '<b>0</b><span>tiles inside (area)</span>');
    const perimChip = h('div', 'mq-lab-stat mq-lab-perim', '<b>0</b><span>steps around (perimeter)</span>');
    bar.appendChild(areaChip); bar.appendChild(perimChip);

    const targetLine = h('div', 'mq-lab-target');
    function targetText() {
      const t = q.target || {};
      const bits = [];
      if (t.area != null) bits.push('area of <b>' + t.area + '</b>');
      if (t.perimeter != null) bits.push('perimeter of <b>' + t.perimeter + '</b>');
      if (t.rectangle) bits.push('and it must be a <b>rectangle</b>');
      return bits.length ? 'Aim for: ' + bits.join(', ') : '';
    }
    targetLine.innerHTML = targetText();

    function cells() {
      return Object.keys(on).filter(k => on[k]).map(k => {
        const p = k.split(',').map(Number); return { x: p[0], y: p[1] };
      });
    }
    function isRectangle(cs) {
      if (!cs.length) return false;
      const xs = cs.map(c => c.x), ys = cs.map(c => c.y);
      const w = Math.max.apply(null, xs) - Math.min.apply(null, xs) + 1;
      const hh = Math.max.apply(null, ys) - Math.min.apply(null, ys) + 1;
      return cs.length === w * hh;
    }
    function connected(cs) {
      if (cs.length < 2) return cs.length === 1;
      const set = new Set(cs.map(c => c.x + ',' + c.y));
      const seen = new Set();
      const stack = [cs[0].x + ',' + cs[0].y];
      while (stack.length) {
        const k = stack.pop();
        if (seen.has(k) || !set.has(k)) continue;
        seen.add(k);
        const p = k.split(',').map(Number);
        stack.push((p[0] + 1) + ',' + p[1], (p[0] - 1) + ',' + p[1],
                   p[0] + ',' + (p[1] + 1), p[0] + ',' + (p[1] - 1));
      }
      return seen.size === cs.length;
    }

    function repaint() {
      const cs = cells();
      const a = cs.length;
      const p = cs.length ? MQ().cellsPerimeter(cs) : 0;
      areaChip.querySelector('b').textContent = a;
      perimChip.querySelector('b').textContent = cs.length && connected(cs) ? p : '—';
      outline.innerHTML = '';
      if (cs.length && connected(cs)) {
        MQ().boundaryLoop(cs).forEach(e => {
          el('line', { x1: px(e.ax), y1: py(e.ay), x2: px(e.bx), y2: py(e.by), class: 'mq-edge is-traced' }, outline);
        });
      }
      api.onProgress && api.onProgress();
    }

    let drawing = false, mode = 1;
    function toggle(k, forceMode) {
      const want = forceMode != null ? forceMode : !on[k];
      if (!!on[k] === want) return;
      on[k] = want;
      nodes[k].classList.toggle('is-on', want);
      repaint();
    }
    const hit = (x, y, m) => {
      const t = document.elementFromPoint(x, y);
      if (t && t.hasAttribute && t.hasAttribute('data-cell')) toggle(t.getAttribute('data-cell'), m);
    };
    svg.addEventListener('pointerdown', e => {
      const t = document.elementFromPoint(e.clientX, e.clientY);
      const k = t && t.getAttribute && t.getAttribute('data-cell');
      mode = k && on[k] ? 0 : 1;
      drawing = true; svg.setPointerCapture(e.pointerId);
      hit(e.clientX, e.clientY, mode); e.preventDefault();
    });
    svg.addEventListener('pointermove', e => { if (drawing) hit(e.clientX, e.clientY, mode); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
      svg.addEventListener(ev, () => { drawing = false; }));

    const tools = h('div', 'mq-tools');
    const clear = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Clear the grid');
    clear.type = 'button';
    clear.onclick = () => { Object.keys(on).forEach(k => { on[k] = false; nodes[k].classList.remove('is-on'); }); repaint(); };
    tools.appendChild(clear);

    /* Keyboard building: a cursor you move with the arrows and toggle with space. */
    let cx = 0, cy = 0;
    const kb = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Build with the keyboard');
    kb.type = 'button';
    kb.onclick = () => {
      svg.setAttribute('tabindex', '0'); svg.focus();
      svg.classList.add('mq-kb');
      mark();
    };
    function mark() {
      Object.keys(nodes).forEach(k => nodes[k].classList.remove('is-cursor'));
      const n = nodes[cx + ',' + cy];
      if (n) n.classList.add('is-cursor');
    }
    svg.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'ArrowRight') cx = Math.min(GW - 1, cx + 1);
      else if (k === 'ArrowLeft') cx = Math.max(0, cx - 1);
      else if (k === 'ArrowDown') cy = Math.min(GH - 1, cy + 1);
      else if (k === 'ArrowUp') cy = Math.max(0, cy - 1);
      else if (k === ' ' || k === 'Enter') { toggle(cx + ',' + cy); }
      else return;
      e.preventDefault(); mark();
    });
    tools.appendChild(kb);

    if (targetLine.innerHTML) host.appendChild(targetLine);
    host.appendChild(wrapShape(svg, q));
    host.appendChild(bar);
    host.appendChild(tools);
    repaint();

    return {
      auto: false,
      collect() {
        const cs = cells();
        const t = q.target || {};
        const a = cs.length, p = cs.length ? MQ().cellsPerimeter(cs) : 0;
        if (!cs.length) return { ok: false, tag: null, why: 'Nothing built yet.' };
        if (!connected(cs)) return { ok: false, tag: null, why: 'All the tiles need to join up into one shape.' };
        if (t.rectangle && !isRectangle(cs))
          return { ok: false, tag: null, why: 'That is a shape, but it is not a rectangle yet — a rectangle has no bumps or gaps.' };
        if (t.area != null && a !== t.area)
          return { ok: false, tag: null, why: 'That shape has an area of ' + a + '. You are aiming for ' + t.area + '.' };
        if (t.perimeter != null && p !== t.perimeter)
          return { ok: false, tag: null, why: 'That shape goes around in ' + p + ' steps. You are aiming for ' + t.perimeter + '.' };
        if (t.differentFrom) {
          const prev = (MQ().get().lab || []).find(x => x.act === t.differentFrom);
          if (prev && prev.a === a && prev.p === p)
            return { ok: false, tag: 'same-area-same-perimeter',
              why: 'That is the same shape as last time. Try a different one with the same ' +
                (t.area != null ? 'area' : 'perimeter') + '.' };
        }
        const st = MQ().get();
        st.lab = (st.lab || []).filter(x => x.act !== q.id);
        st.lab.push({ act: q.id, a, p, cells: cs });
        if (st.lab.length > 20) st.lab = st.lab.slice(-20);
        MQ().save();
        return { ok: true, area: a, perimeter: p };
      },
      ready: () => cells().length > 0
    };
  };

  /* ====================================================================== */

  function wrapShape(svg, q) {
    const box = h('div', 'mq-shape-box' +
      (q && q.mode === 'area' ? ' is-area' : q && q.mode === 'perimeter' ? ' is-perimeter' : ''));
    if (q && q.mode) {
      box.appendChild(h('div', 'mq-shape-tag mq-shape-tag-' + q.mode,
        q.mode === 'area' ? 'Area — covers the ground' : 'Perimeter — goes around'));
    }
    box.appendChild(svg);
    return box;
  }

  window.MQActivities = {
    /**
     * Draw one activity into `host`.
     * api: { onSubmit(response), onProgress() }
     */
    render(q, host, api) {
      host.innerHTML = '';
      if (q.story) host.appendChild(storyPanel(q.story));
      const p = h('p', 'mq-prompt', q.prompt);
      host.appendChild(p);
      const body = h('div', 'mq-body');
      host.appendChild(body);
      const fn = R[q.type];
      if (!fn) {
        body.appendChild(h('p', 'mq-prompt', 'This activity type is not available.'));
        return { auto: false, collect: () => null, ready: () => false };
      }
      const act = fn(q, body, api) || {};
      act.host = body;
      return act;
    },
    drawShape, drawCells, drawRect, icon, ICONS, numberPad, storyPanel,
    types: () => Object.keys(R)
  };
})();

/* ==========================================================================
   HALF-YEARLY 2026 — mock paper builder
   --------------------------------------------------------------------------
   Renders a printable question paper + answer key from the SAME item banks the
   app drills from, so the paper can never drift out of sync with the practice
   and its answer key is computed, never hand-typed.

   Usage:  HYPaper.build({ subject:'maths', sections:[ … ] })
   Each section: { title, marks, skills:[ids], count, level }
   ========================================================================== */

(function () {
  'use strict';

  const HY = window.HY;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  const strip = h => String(h == null ? '' : h)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const LETTER = ['a', 'b', 'c', 'd', 'e', 'f'];

  /** One question block + the matching key entry. */
  function renderItem(item, n) {
    const q = el('div', 'q');
    const head = el('span', 'n', n + '.');
    q.appendChild(head);
    const body = el('span', null, item.q || '');
    q.appendChild(body);

    let key = '';

    switch (item.type) {
      case 'mcq': {
        const g = el('div', 'opts');
        item.options.forEach((o, i) => g.appendChild(el('span', null, `<b>(${LETTER[i]})</b> ${o}`)));
        q.appendChild(g);
        key = `(${LETTER[item.answer]}) ${strip(item.options[item.answer])}`;
        break;
      }
      case 'tf': {
        q.appendChild(el('div', 'opts', '<span><b>(a)</b> True</span><span><b>(b)</b> False</span>'));
        key = item.answer ? 'True' : 'False';
        break;
      }
      case 'fill': {
        q.appendChild(el('span', 'ans-short', '&nbsp;'));
        if (item.suffix) q.appendChild(el('span', null, ' ' + item.suffix));
        key = strip(item.answer) + (item.suffix ? ' ' + item.suffix : '');
        break;
      }
      case 'steps': {
        item.steps.forEach(st => {
          q.appendChild(el('div', null, '<span class="hy-sub">' + strip(st.ask) + '</span>'));
          q.appendChild(el('span', 'ans-short', '&nbsp;'));
          if (st.suffix) q.appendChild(el('span', null, ' ' + st.suffix));
        });
        key = item.steps.map(st => strip(st.answer) + (st.suffix ? ' ' + st.suffix : '')).join('  →  ');
        break;
      }
      case 'order': case 'build': {
        const tiles = (item.tiles || item.answer).slice().sort(() => Math.random() - 0.5);
        const t = el('div', 'tiles');
        tiles.forEach(x => t.appendChild(el('i', null, x)));
        q.appendChild(t);
        q.appendChild(el('span', 'ans-line'));
        if (item.type === 'build') q.appendChild(el('span', 'ans-line'));
        key = item.answer.join(item.type === 'build' ? ' ' : '  ,  ');
        break;
      }
      case 'match': {
        const rights = item.pairs.map(p => p[1]).slice().sort(() => Math.random() - 0.5);
        const tbl = el('table', 'pair-tbl');
        item.pairs.forEach((p, i) => {
          const tr = el('tr');
          tr.appendChild(el('td', null, `<b>${LETTER[i]})</b> ${p[0]}`));
          tr.appendChild(el('td', null, '&nbsp;'));
          tr.appendChild(el('td', null, `<b>${i + 1}.</b> ${rights[i]}`));
          tbl.appendChild(tr);
        });
        q.appendChild(tbl);
        key = item.pairs.map((p, i) =>
          `${LETTER[i]}) ${strip(p[0])} → ${strip(p[1])}`).join(' · ');
        break;
      }
      case 'sort': {
        const words = [];
        item.buckets.forEach(b => b.items.forEach(x => words.push(x)));
        const t = el('div', 'tiles');
        words.sort(() => Math.random() - 0.5).forEach(x => t.appendChild(el('i', null, x)));
        q.appendChild(t);
        const tbl = el('table', 'bucket-tbl');
        const hr = el('tr');
        item.buckets.forEach(b => hr.appendChild(el('th', null, b.name)));
        tbl.appendChild(hr);
        const br2 = el('tr');
        item.buckets.forEach(() => br2.appendChild(el('td', null, '<br><br>')));
        tbl.appendChild(br2);
        q.appendChild(tbl);
        key = item.buckets.map(b => b.name + ': ' + b.items.join(', ')).join(' · ');
        break;
      }
      case 'passage': {
        const box = el('div', 'passage-box', item.passage);
        q.insertBefore(box, body.nextSibling);
        item.questions.forEach((sub, i) => {
          q.appendChild(el('div', null, `<b>(${LETTER[i]})</b> ${sub.q}`));
          q.appendChild(el('span', 'ans-line'));
        });
        key = item.questions.map((s, i) => `(${LETTER[i]}) ${strip(s.model)}`).join('  ');
        break;
      }
      case 'write': {
        q.appendChild(el('div', 'ans-box ans-box-tall'));
        key = strip(item.model);
        break;
      }
      default: {
        q.appendChild(el('span', 'ans-line'));
        key = strip(item.explain || item.answer);
      }
    }

    if (!key && item.explain) key = strip(item.explain);
    return { node: q, key };
  }

  /**
   * @param cfg { subject, title, subtitle, marks, minutes, sections:[{title,marks,skills,count,level}] }
   */
  function build(cfg) {
    HY.init();
    const seed = cfg.seed || String(Date.now());
    const paper = document.getElementById('paper-body');
    const keyWrap = document.getElementById('key-body');
    if (!paper || !keyWrap) return;
    paper.innerHTML = ''; keyWrap.innerHTML = '';

    let n = 0, totalMarks = 0;

    cfg.sections.forEach((sec, si) => {
      const rng = HY.rngFrom(HY.hashStr(seed + '|' + si + '|' + sec.title));
      const box = el('div', 'pt-section');
      box.appendChild(el('h3', null,
        `${sec.title}<span class="marks">${sec.marks} mark${sec.marks === 1 ? '' : 's'}</span>`));
      totalMarks += sec.marks;

      const keys = [];
      const used = new Set();
      // Spread the questions evenly across the skills this section covers.
      for (let i = 0; i < sec.count; i++) {
        const skillId = sec.skills[i % sec.skills.length];
        if (!HY.hasContent(skillId)) continue;
        let item = null, tries = 0;
        while (tries++ < 25) {
          const cand = HY.makeItem(skillId, sec.level || 2, rng, used);
          if (!cand) break;
          if (sec.types && sec.types.indexOf(cand.type) === -1) continue;
          if (sec.notTypes && sec.notTypes.indexOf(cand.type) > -1) continue;
          item = cand; break;
        }
        if (!item) continue;
        used.add(item.id);
        n++;
        const r = renderItem(item, n);
        box.appendChild(r.node);
        keys.push(r.key);
      }
      paper.appendChild(box);

      const kh = el('div');
      kh.appendChild(el('h4', null, sec.title));
      const ol = el('ol');
      ol.setAttribute('start', String(n - keys.length + 1));
      keys.forEach(k => ol.appendChild(el('li', null, k)));
      kh.appendChild(ol);
      keyWrap.appendChild(kh);
    });

    const mk = document.getElementById('paper-marks');
    if (mk) mk.textContent = totalMarks;
    const qc = document.getElementById('paper-qcount');
    if (qc) qc.textContent = n;
  }

  window.HYPaper = { build };
})();

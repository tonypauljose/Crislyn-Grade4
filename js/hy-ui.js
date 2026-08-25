/* ==========================================================================
   HALF-YEARLY 2026 — DRILL STAGE
   --------------------------------------------------------------------------
   Renders one item at a time on a full-screen, tablet-first stage. No page
   scrolling: everything fits the viewport so a tap never misses.

   Tone rules (carried over from the Hindi Journey module):
     · never "wrong" / "failed" — "एक बार और" / "Almost — look again"
     · the correct method is always shown, not just the correct answer
     · a missed item comes back later in the same session, with new numbers
   ========================================================================== */

(function () {
  'use strict';

  const HY = window.HY;
  const REINJECT_GAP = 3;

  /* --------------------------------------------------------------- helpers */

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }

  /**
   * Loose comparison for typed answers: ignores thousands commas, trailing
   * full stops / danda, hyphens and case, so "5,21,885", "521885" and
   * "521,885" all mark the same.
   */
  function matches(given, item) {
    if (given === null || given === undefined) return false;
    const norm = s => String(s).toLowerCase()
      .replace(/[,\s]+/g, '')
      .replace(/[.!।]+$/, '')
      .replace(/[-–—]/g, '')
      .trim();
    const pool = [item.answer].concat(item.accept || []);
    // A punctuation-only answer normalises away to nothing — compare raw then.
    if (!norm(item.answer)) {
      const raw = String(given).trim();
      return pool.some(a => String(a).trim() === raw);
    }
    const g = norm(given);
    if (!g) return false;
    return pool.some(a => norm(a) === g);
  }

  function speak(text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ''));
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      u.rate = 0.82;
      const voices = window.speechSynthesis.getVoices() || [];
      const v = voices.find(x => x.lang === u.lang) ||
        voices.find(x => x.lang && x.lang.indexOf(u.lang.split('-')[0]) === 0);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice on this device — silent */ }
  }

  function confetti() {
    if (window.Confetti && window.Confetti.burst) { window.Confetti.burst(); return; }
    const wrap = el('div', 'hy-confetti');
    const cols = ['#FACC15', '#A855F7', '#22C55E', '#F97316', '#3B82F6', '#EC4899'];
    for (let i = 0; i < 28; i++) {
      const p = el('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      p.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 2200);
  }

  const PRAISE = ['Yes!', 'Well done!', 'That is it!', 'Exactly right.', 'Lovely.', 'Spot on!', 'Good thinking.'];
  const PRAISE_HI = ['शाबाश!', 'बहुत बढ़िया!', 'सही है!', 'वाह!', 'बिलकुल ठीक!'];
  const AGAIN = ['Almost — look again.', 'Not quite yet. Here is the way.', 'Good try. Let us do it together.', 'Close! One small thing.'];
  const AGAIN_HI = ['अच्छी कोशिश! एक बार और।', 'लगभग सही — फिर से देखिए।', 'चलिए, साथ में करते हैं।'];

  /* ============================================================== the stage */

  const Stage = {
    root: null,
    queue: [],
    idx: 0,
    opts: null,
    answered: 0,
    right: 0,
    started: 0,
    hintUsed: false,
    touched: {},     // skills seen this session → for the summary
    lessonSeen: {},  // skills whose lesson has been offered this session
    locked: false,

    /* ------------------------------------------------------------- lifecycle */

    start(opts) {
      HY.init();
      this.opts = Object.assign({ mode: 'daily', target: HY.DEFAULT_TARGET }, opts || {});
      this.queue = HY.buildSession(this.opts);
      if (!this.queue.length) { alert('Nothing to practise here yet.'); return; }
      this.idx = 0; this.answered = 0; this.right = 0;
      this.touched = {};
      this.lessonSeen = {};
      this.started = Date.now();

      if (!this.root) {
        this.root = el('div', 'hy-stage');
        document.body.appendChild(this.root);
      }
      document.body.classList.add('hy-running');
      this.root.style.display = 'flex';
      this.renderIntro();
    },

    close() {
      document.body.classList.remove('hy-running');
      if (this.root) this.root.style.display = 'none';
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (this.opts && this.opts.onClose) this.opts.onClose();
    },

    /* ---------------------------------------------------------------- chrome */

    shell(bodyNode, footNode) {
      this.root.innerHTML = '';
      const item = this.queue[this.idx];
      const sub = item ? item.subject : (this.opts.subject || 'maths');
      const subject = window.HY_SKILLS.subjects[sub];

      const top = el('div', 'hy-top');
      top.style.setProperty('--sub', subject ? subject.colour : '#6B21A8');

      const left = el('div', 'hy-top-left');
      if (subject) left.appendChild(el('span', 'hy-chip', subject.icon + ' ' + subject.name));
      if (item && item.skillName) left.appendChild(el('span', 'hy-skillname', item.skillName));
      top.appendChild(left);

      const bar = el('div', 'hy-bar');
      const done = Math.min(this.answered, this.queue.length);
      bar.appendChild(el('i', 'hy-bar-fill')).style.width =
        Math.round((done / this.queue.length) * 100) + '%';
      top.appendChild(bar);

      const right = el('div', 'hy-top-right');
      right.appendChild(el('span', 'hy-count', done + ' / ' + this.queue.length));
      const x = el('button', 'hy-x', '✕');
      x.setAttribute('aria-label', 'Close');
      x.onclick = () => this.confirmClose();
      right.appendChild(x);
      top.appendChild(right);

      this.root.appendChild(top);

      const body = el('div', 'hy-body');
      body.appendChild(bodyNode);
      this.root.appendChild(body);

      const foot = el('div', 'hy-foot');
      if (footNode) foot.appendChild(footNode);
      this.root.appendChild(foot);
    },

    confirmClose() {
      if (this.answered < 3) { this.close(); return; }
      const card = el('div', 'hy-card hy-centre');
      card.appendChild(el('h2', null, 'Stop here for today?'));
      card.appendChild(el('p', 'hy-sub', `You have done <b>${this.answered}</b> so far — your progress is saved either way.`));
      const row = el('div', 'hy-actions');
      const keep = el('button', 'hy-btn hy-btn-primary', 'Keep going →');
      keep.onclick = () => this.render();
      const stop = el('button', 'hy-btn hy-btn-ghost', 'Stop and save');
      stop.onclick = () => this.finish(true);
      row.appendChild(keep); row.appendChild(stop);
      this.shell(card, row);
    },

    /* ----------------------------------------------------------------- intro */

    renderIntro() {
      const modeName = {
        daily: "Today's mission", subject: 'Subject practice',
        weak: 'Trouble spots', skill: 'One skill, focused'
      }[this.opts.mode] || 'Practice';

      const skills = {};
      this.queue.forEach(i => { skills[i.skill] = true; });
      const names = Object.keys(skills).map(id => {
        const s = window.HY_SKILLS.get(id);
        return s ? s.name : id;
      });

      const card = el('div', 'hy-card hy-centre');
      card.appendChild(el('div', 'hy-hero-icon', '🎯'));
      card.appendChild(el('h2', null, modeName));
      card.appendChild(el('p', 'hy-lead', `${this.queue.length} questions · about ${Math.round(this.queue.length * 0.9)} minutes`));
      const list = el('div', 'hy-tags');
      names.slice(0, 8).forEach(n => list.appendChild(el('span', 'hy-tag', n)));
      if (names.length > 8) list.appendChild(el('span', 'hy-tag hy-tag-more', '+' + (names.length - 8) + ' more'));
      card.appendChild(list);
      /* Say up front how much of this is teaching, so a session that stops to
         explain three new skills does not feel like an interruption. */
      const toTeach = Object.keys(skills).filter(id => !HY.isTaught(id) && window.HYLearn).length;
      if (toTeach) {
        card.appendChild(el('p', 'hy-note',
          '<b>' + toTeach + ' new skill' + (toTeach === 1 ? '' : 's') + '</b> in here. ' +
          'Each one gets taught first — the method, an example, then your turn.'));
      }
      card.appendChild(el('p', 'hy-note',
        'Take your time. If something is new, tap <b>Show me</b> — that is not cheating, that is learning.'));

      const go = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Start →');
      go.onclick = () => this.render();
      this.shell(card, go);
    },

    /* --------------------------------------------------------------- routing */

    render() {
      this.locked = false;
      this.hintUsed = false;
      if (this.idx >= this.queue.length) { this.finish(); return; }
      const item = this.queue[this.idx];

      /* TEACH FIRST. A skill she has never been taught does not get sprung on
         her as a question — the lesson runs first, right here, and the three
         goes the scheduler has queued for it become the "now you try". */
      if (this.needsLesson(item.skill)) { this.teachThen(item.skill); return; }

      this.touched[item.skill] = true;

      const card = el('div', 'hy-card');
      if (item.lang === 'hi') card.classList.add('hy-hi');

      // question
      const qWrap = el('div', 'hy-q');
      qWrap.innerHTML = item.q || '';
      if (item.speak && (item.speakText || item.q)) {
        const sp = el('button', 'hy-speak', '🔊');
        sp.title = 'सुनिए';
        sp.onclick = () => speak(item.speakText || item.q.replace(/<[^>]*>/g, ' '), 'hi');
        qWrap.appendChild(sp);
      }
      card.appendChild(qWrap);

      const answerArea = el('div', 'hy-answer');
      card.appendChild(answerArea);

      const foot = el('div', 'hy-actions');

      const R = this['render_' + item.type] || this.render_mcq;
      R.call(this, item, answerArea, foot, card);

      // Show me / hint buttons live on every item
      const helpRow = el('div', 'hy-help-row');
      const teach = el('button', 'hy-btn hy-btn-ghost hy-btn-sm', '💡 Show me');
      teach.onclick = () => this.showTeach(item);
      helpRow.appendChild(teach);
      if (item.hint) {
        const h = el('button', 'hy-btn hy-btn-ghost hy-btn-sm', '🤔 Give me a clue');
        h.onclick = () => {
          this.hintUsed = true;
          h.remove();
          const hn = el('div', 'hy-hint', item.hint);
          card.insertBefore(hn, answerArea);
        };
        helpRow.appendChild(h);
      }
      card.appendChild(helpRow);

      this.shell(card, foot);
    },

    /**
     * Only in the ordinary practice modes, only for a skill with no lesson on
     * record, and only once per skill per session — so closing a lesson early
     * cannot put the drill into a loop.
     */
    needsLesson(skillId) {
      if (this.opts && this.opts.noLessons) return false;
      if (!window.HYLearn || !window.HY_LESSONS) return false;
      if (this.lessonSeen[skillId]) return false;
      if (HY.isTaught(skillId)) return false;
      /* A safety valve, not a policy. The scheduler only ever introduces
         floor(target * 0.55 / 3) new skills — 4 in a normal mission, 7 in the
         40-question mock — so this never actually bites; it just guarantees a
         session can never turn into nothing but lessons. */
      return Object.keys(this.lessonSeen).length < 8;
    },

    teachThen(skillId) {
      this.lessonSeen[skillId] = true;
      window.HYLearn.open(skillId, { compact: true, onDone: () => this.render() });
    },

    showTeach(item) {
      const skill = window.HY_SKILLS.get(item.skill);
      if (!skill) return;
      const back = el('div', 'hy-modal');
      const box = el('div', 'hy-modal-box');
      box.appendChild(el('div', 'hy-modal-kicker', skill.topic));
      box.appendChild(el('h3', null, skill.name));
      const body = el('div', 'hy-teach');
      body.innerHTML = skill.teach || '';
      if (skill.watch) {
        const w = el('div', 'hy-watch');
        w.innerHTML = '<b>Watch out —</b> ' + skill.watch;
        body.appendChild(w);
      }
      box.appendChild(body);
      const ok = el('button', 'hy-btn hy-btn-primary', 'Got it — let me try');
      ok.onclick = () => back.remove();
      box.appendChild(ok);
      back.appendChild(box);
      back.onclick = e => { if (e.target === back) back.remove(); };
      this.root.appendChild(back);
    },

    /* ------------------------------------------------------------ item types */

    render_mcq(item, area, foot) {
      const opts = el('div', 'hy-opts' + (item.options.some(o => String(o).length > 26) ? ' hy-opts-tall' : ''));
      item.options.forEach((o, i) => {
        const b = el('button', 'hy-opt', String(o));
        b.onclick = () => {
          if (this.locked) return;
          this.locked = true;
          [].forEach.call(opts.children, c => c.classList.add('hy-dim'));
          b.classList.remove('hy-dim');
          const ok = i === item.answer;
          b.classList.add(ok ? 'hy-right' : 'hy-wrongpick');
          if (!ok) opts.children[item.answer].classList.add('hy-right', 'hy-reveal');
          this.judge(item, ok);
        };
        opts.appendChild(b);
      });
      area.appendChild(opts);
    },

    render_tf(item, area) {
      const opts = el('div', 'hy-opts hy-opts-2');
      [['True', true], ['False', false]].forEach(pair => {
        const b = el('button', 'hy-opt hy-opt-tf', pair[0]);
        b.onclick = () => {
          if (this.locked) return;
          this.locked = true;
          const ok = pair[1] === item.answer;
          b.classList.add(ok ? 'hy-right' : 'hy-wrongpick');
          this.judge(item, ok);
        };
        opts.appendChild(b);
      });
      area.appendChild(opts);
    },

    render_fill(item, area, foot) {
      const wrap = el('div', 'hy-fill');
      const inp = el('input', 'hy-input' + (item.numeric ? ' hy-input-num' : '') +
        (item.lang === 'hi' ? ' hy-input-hi' : '') + (item.words ? ' hy-input-wide' : ''));
      inp.type = 'text';
      inp.autocomplete = 'off'; inp.autocapitalize = item.upper ? 'characters' : 'off';
      inp.spellcheck = false;
      inp.setAttribute('inputmode', item.numeric ? 'numeric' : 'text');
      inp.placeholder = item.lang === 'hi' ? 'यहाँ लिखिए' : 'your answer';
      wrap.appendChild(inp);
      if (item.suffix) wrap.appendChild(el('span', 'hy-suffix', item.suffix));
      area.appendChild(wrap);

      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Check');
      const go = () => {
        if (this.locked) return;
        this.locked = true;
        const ok = matches(inp.value, item);
        inp.classList.add(ok ? 'hy-right' : 'hy-wrongpick');
        inp.disabled = true;
        this.judge(item, ok, ok ? null : inp.value);
      };
      check.onclick = go;
      inp.onkeydown = e => { if (e.key === 'Enter') go(); };
      foot.appendChild(check);
      setTimeout(() => { try { inp.focus(); } catch (e) { } }, 120);
    },

    render_steps(item, area, foot) {
      const inputs = [];
      item.steps.forEach((st, i) => {
        const row = el('div', 'hy-step');
        row.appendChild(el('div', 'hy-step-ask', st.ask));
        const w = el('div', 'hy-fill');
        const inp = el('input', 'hy-input hy-input-num');
        inp.type = 'text'; inp.setAttribute('inputmode', 'numeric'); inp.autocomplete = 'off';
        w.appendChild(inp);
        if (st.suffix) w.appendChild(el('span', 'hy-suffix', st.suffix));
        row.appendChild(w);
        area.appendChild(row);
        inputs.push({ inp, st });
      });
      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Check');
      check.onclick = () => {
        if (this.locked) return;
        this.locked = true;
        let all = true;
        inputs.forEach(o => {
          const ok = matches(o.inp.value, o.st);
          o.inp.classList.add(ok ? 'hy-right' : 'hy-wrongpick');
          o.inp.disabled = true;
          if (!ok) all = false;
        });
        this.judge(item, all);
      };
      foot.appendChild(check);
      setTimeout(() => { try { inputs[0].inp.focus(); } catch (e) { } }, 120);
    },

    render_order(item, area, foot) {
      const chosen = [];
      const slot = el('div', 'hy-slot');
      const pool = el('div', 'hy-tiles');
      area.appendChild(slot); area.appendChild(pool);

      const paint = () => {
        slot.innerHTML = '';
        chosen.forEach((t, i) => {
          const c = el('button', 'hy-tile hy-tile-in', t);
          c.onclick = () => { if (this.locked) return; chosen.splice(i, 1); paint(); };
          slot.appendChild(c);
        });
        if (!chosen.length) slot.appendChild(el('span', 'hy-slot-empty', 'tap the answers in order'));
        [].forEach.call(pool.children, b => {
          b.disabled = chosen.indexOf(b.textContent) > -1;
          b.classList.toggle('hy-used', chosen.indexOf(b.textContent) > -1);
        });
      };

      item.tiles.forEach(t => {
        const b = el('button', 'hy-tile', t);
        b.onclick = () => {
          if (this.locked) return;
          if (chosen.indexOf(t) > -1) return;
          chosen.push(t); paint();
        };
        pool.appendChild(b);
      });
      paint();

      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Check');
      check.onclick = () => {
        if (this.locked) return;
        if (chosen.length !== item.answer.length) return;
        this.locked = true;
        const ok = chosen.every((t, i) => t === item.answer[i]);
        [].forEach.call(slot.children, (c, i) => {
          c.classList.add(c.textContent === item.answer[i] ? 'hy-right' : 'hy-wrongpick');
        });
        this.judge(item, ok);
      };
      foot.appendChild(check);
    },

    render_build(item, area, foot) {
      // Same interaction as `order`, different framing: she assembles the
      // exact sentence her teacher wants before ever writing it down.
      const shuffled = item.answer.slice().sort(() => Math.random() - 0.5);
      this.render_order(Object.assign({}, item, { tiles: shuffled }), area, foot);
    },

    render_match(item, area, foot) {
      const lefts = item.pairs.map(p => p[0]);
      const rights = item.pairs.map(p => p[1]).slice().sort(() => Math.random() - 0.5);
      const made = {};       // left -> right
      let pending = null;

      const grid = el('div', 'hy-match');
      const colL = el('div', 'hy-match-col');
      const colR = el('div', 'hy-match-col');
      grid.appendChild(colL); grid.appendChild(colR);
      area.appendChild(grid);

      const paint = () => {
        [].forEach.call(colL.children, b => {
          b.classList.toggle('hy-picked', pending === b.dataset.v);
          b.classList.toggle('hy-matched', !!made[b.dataset.v]);
          const tail = made[b.dataset.v] ? ' → ' + made[b.dataset.v] : '';
          b.innerHTML = b.dataset.v + (tail ? '<span class="hy-match-tail">' + tail + '</span>' : '');
        });
        [].forEach.call(colR.children, b => {
          const taken = Object.keys(made).some(k => made[k] === b.dataset.v);
          b.classList.toggle('hy-matched', taken);
          b.disabled = taken;
        });
      };

      lefts.forEach(l => {
        const b = el('button', 'hy-match-item', l);
        b.dataset.v = l;
        b.onclick = () => {
          if (this.locked) return;
          if (made[l]) { delete made[l]; pending = null; paint(); return; }
          pending = l; paint();
        };
        colL.appendChild(b);
      });
      rights.forEach(r => {
        const b = el('button', 'hy-match-item hy-match-right', r);
        b.dataset.v = r;
        b.onclick = () => {
          if (this.locked || !pending) return;
          made[pending] = r; pending = null; paint();
        };
        colR.appendChild(b);
      });
      paint();

      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Check');
      check.onclick = () => {
        if (this.locked) return;
        if (Object.keys(made).length !== item.pairs.length) return;
        this.locked = true;
        let ok = true;
        item.pairs.forEach(p => { if (made[p[0]] !== p[1]) ok = false; });
        [].forEach.call(colL.children, b => {
          const want = item.pairs.find(p => p[0] === b.dataset.v)[1];
          b.classList.add(made[b.dataset.v] === want ? 'hy-right' : 'hy-wrongpick');
        });
        this.judge(item, ok);
      };
      foot.appendChild(check);
    },

    render_sort(item, area, foot) {
      const all = [];
      item.buckets.forEach(b => b.items.forEach(i => all.push({ v: i, home: b.name })));
      const pool = all.slice().sort(() => Math.random() - 0.5);
      const placed = {};      // value -> bucket name
      let pending = null;

      const tray = el('div', 'hy-tiles');
      const cols = el('div', 'hy-buckets');
      area.appendChild(tray); area.appendChild(cols);

      const paint = () => {
        tray.innerHTML = '';
        pool.filter(p => !placed[p.v]).forEach(p => {
          const b = el('button', 'hy-tile' + (pending === p.v ? ' hy-picked' : ''), p.v);
          b.onclick = () => { if (this.locked) return; pending = pending === p.v ? null : p.v; paint(); };
          tray.appendChild(b);
        });
        if (!tray.children.length) tray.appendChild(el('span', 'hy-slot-empty', 'all placed — now check'));
        [].forEach.call(cols.children, c => {
          const list = c.querySelector('.hy-bucket-list');
          list.innerHTML = '';
          Object.keys(placed).filter(v => placed[v] === c.dataset.name).forEach(v => {
            const t = el('button', 'hy-tile hy-tile-in', v);
            t.onclick = () => { if (this.locked) return; delete placed[v]; paint(); };
            list.appendChild(t);
          });
        });
      };

      item.buckets.forEach(b => {
        const c = el('div', 'hy-bucket');
        c.dataset.name = b.name;
        const head = el('button', 'hy-bucket-head', b.name);
        head.onclick = () => {
          if (this.locked || !pending) return;
          placed[pending] = b.name; pending = null; paint();
        };
        c.appendChild(head);
        c.appendChild(el('div', 'hy-bucket-list'));
        cols.appendChild(c);
      });
      paint();

      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Check');
      check.onclick = () => {
        if (this.locked) return;
        if (Object.keys(placed).length !== all.length) return;
        this.locked = true;
        let ok = true;
        all.forEach(a => { if (placed[a.v] !== a.home) ok = false; });
        [].forEach.call(cols.children, c => {
          [].forEach.call(c.querySelector('.hy-bucket-list').children, t => {
            const home = all.find(a => a.v === t.textContent).home;
            t.classList.add(home === c.dataset.name ? 'hy-right' : 'hy-wrongpick');
          });
        });
        this.judge(item, ok);
      };
      foot.appendChild(check);
    },

    render_passage(item, area, foot) {
      // Comprehension: passage stays visible while she answers each question.
      const p = el('div', 'hy-passage');
      p.innerHTML = item.passage;
      area.appendChild(p);

      const qi = item._qi || 0;
      const q = item.questions[qi];
      const box = el('div', 'hy-passage-q');
      box.appendChild(el('div', 'hy-pq', `<b>Q${qi + 1}.</b> ${q.q}`));
      const w = el('div', 'hy-fill');
      const inp = el('input', 'hy-input hy-input-wide' + (item.lang === 'hi' ? ' hy-input-hi' : ''));
      inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.placeholder = item.lang === 'hi' ? 'उत्तर लिखिए' : 'find it in the passage';
      w.appendChild(inp);
      box.appendChild(w);
      area.appendChild(box);

      const check = el('button', 'hy-btn hy-btn-primary hy-btn-big',
        qi < item.questions.length - 1 ? 'Check & next question' : 'Check');
      check.onclick = () => {
        if (this.locked) return;
        this.locked = true;
        const ok = matches(inp.value, q);
        inp.classList.add(ok ? 'hy-right' : 'hy-wrongpick');
        inp.disabled = true;
        const fb = el('div', 'hy-model');
        fb.innerHTML = '<span class="hy-model-tag">Full-sentence answer</span>' + q.model;
        box.appendChild(fb);

        // Each sub-question is recorded, so a 4-part passage gives 4 retrievals.
        this.recordOnly(item.skill, ok);
        this.answered++; if (ok) this.right++;

        const next = el('button', 'hy-btn hy-btn-primary hy-btn-big',
          qi < item.questions.length - 1 ? 'Next question →' : 'Continue →');
        next.onclick = () => {
          if (qi < item.questions.length - 1) {
            item._qi = qi + 1;
            this.locked = false;
            this.render();
          } else {
            item._qi = 0;
            this.idx++;
            this.render();
          }
        };
        const f = this.root.querySelector('.hy-foot');
        f.innerHTML = ''; f.appendChild(next);
      };
      foot.appendChild(check);
      setTimeout(() => { try { inp.focus(); } catch (e) { } }, 120);
    },

    render_write(item, area, foot) {
      area.appendChild(el('div', 'hy-write-note',
        item.lang === 'hi'
          ? '✍️ पहले कॉपी में पूरा उत्तर लिखिए। लिख लेने के बाद ही नीचे दबाइए।'
          : '✍️ Write the whole answer in your notebook first. Only then tap below.'));

      const show = el('button', 'hy-btn hy-btn-primary hy-btn-big',
        item.lang === 'hi' ? 'लिख लिया — उत्तर दिखाइए' : "I've written it — show me the answer");
      show.onclick = () => {
        const model = el('div', 'hy-model hy-model-big');
        model.innerHTML = '<span class="hy-model-tag">' +
          (item.lang === 'hi' ? 'आदर्श उत्तर' : 'Model answer') + '</span>' +
          String(item.model).replace(/\n/g, '<br>');
        area.appendChild(model);

        const row = el('div', 'hy-actions');
        const good = el('button', 'hy-btn hy-btn-ok',
          item.lang === 'hi' ? '✓ मेरा उत्तर मिल गया' : '✓ Mine matched');
        good.onclick = () => this.judge(item, true, null, true);
        const bad = el('button', 'hy-btn hy-btn-again',
          item.lang === 'hi' ? '↻ पूरा नहीं था' : '↻ Mine was not complete');
        bad.onclick = () => this.judge(item, false, null, true);
        row.appendChild(good); row.appendChild(bad);
        const f = this.root.querySelector('.hy-foot');
        f.innerHTML = ''; f.appendChild(row);
      };
      foot.appendChild(show);
    },

    /* ------------------------------------------------------------ judgement */

    recordOnly(skillId, ok) {
      const res = HY.record(skillId, ok);
      if (res.justMastered) this.celebrate(skillId);
      return res;
    },

    celebrate(skillId) {
      const s = window.HY_SKILLS.get(skillId);
      confetti();
      if (window.State && window.State.addStars) window.State.addStars(5, 'Mastered: ' + (s ? s.name : skillId));
      const t = el('div', 'hy-toast', '⭐ Mastered — <b>' + (s ? s.name : skillId) + '</b>');
      this.root.appendChild(t);
      setTimeout(() => t.remove(), 3200);
    },

    /**
     * @param selfMarked true for the "write it on paper" type, where she grades
     *        herself — we do not want to double-count a hint there.
     */
    judge(item, ok, given, selfMarked) {
      const res = this.recordOnly(item.skill, ok);
      this.answered++;
      if (ok) this.right++;

      const hi = item.lang === 'hi';
      const panel = el('div', 'hy-fb ' + (ok ? 'hy-fb-ok' : 'hy-fb-no'));
      const head = el('div', 'hy-fb-head');
      head.innerHTML = (ok ? '✓ ' : '↻ ') +
        (ok ? (hi ? PRAISE_HI[this.answered % PRAISE_HI.length] : PRAISE[this.answered % PRAISE.length])
          : (hi ? AGAIN_HI[this.answered % AGAIN_HI.length] : AGAIN[this.answered % AGAIN.length]));
      panel.appendChild(head);

      if (!ok && given) panel.appendChild(el('div', 'hy-fb-given', 'You wrote: <b>' + given + '</b>'));
      if (item.explain) {
        const ex = el('div', 'hy-fb-why');
        ex.innerHTML = item.explain;
        panel.appendChild(ex);
      }

      if (!ok) {
        const skill = window.HY_SKILLS.get(item.skill);
        if (skill && skill.teach) {
          const more = el('button', 'hy-btn hy-btn-ghost hy-btn-sm', '💡 Show me the method again');
          more.onclick = () => this.showTeach(item);
          panel.appendChild(more);
        }
        // Bring this skill back later in the same session, with a fresh item.
        this.reinject(item);
      }

      const card = this.root.querySelector('.hy-card');
      if (card) card.appendChild(panel);
      panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      const next = el('button', 'hy-btn hy-btn-primary hy-btn-big',
        this.idx >= this.queue.length - 1 ? 'Finish →' : (hi ? 'आगे →' : 'Next →'));
      next.onclick = () => { this.idx++; this.render(); };
      const f = this.root.querySelector('.hy-foot');
      f.innerHTML = ''; f.appendChild(next);
      setTimeout(() => { try { next.focus(); } catch (e) { } }, 60);

      if (ok && res.levelAfter > res.levelBefore && res.levelAfter < 4) {
        const t = el('div', 'hy-toast hy-toast-soft', 'Getting stronger — <b>' +
          (window.HY_SKILLS.get(item.skill) || {}).name + '</b>');
        this.root.appendChild(t);
        setTimeout(() => t.remove(), 2400);
      }
    },

    /** A missed skill returns a few items later, never immediately. */
    reinject(item) {
      const at = Math.min(this.queue.length, this.idx + 1 + REINJECT_GAP);
      const rng = HY.rngFrom(HY.hashStr(item.skill + this.answered + Date.now()));
      const fresh = HY.makeItem(item.skill, Math.max(1, HY.skill(item.skill).level), rng, new Set([item.id]));
      if (fresh) { fresh._retry = true; this.queue.splice(at, 0, fresh); }
    },

    /* ---------------------------------------------------------------- finish */

    finish(early) {
      const secs = Math.round((Date.now() - this.started) / 1000);
      HY.finishSession({
        total: this.answered, right: this.right,
        mode: this.opts.mode, subject: this.opts.subject, secs
      });

      const pct = this.answered ? Math.round((this.right / this.answered) * 100) : 0;
      const card = el('div', 'hy-card hy-centre');
      card.appendChild(el('div', 'hy-hero-icon', pct >= 80 ? '🌟' : (pct >= 60 ? '💪' : '🌱')));
      card.appendChild(el('h2', null, early ? 'Saved — well done for starting' :
        (pct >= 80 ? 'Brilliant session!' : (pct >= 60 ? 'Good, solid work.' : 'Every one of these counts.'))));

      const stats = el('div', 'hy-stats');
      [['Questions', this.answered], ['Right first time', this.right + ' / ' + this.answered],
      ['Time', Math.floor(secs / 60) + 'm ' + (secs % 60) + 's']].forEach(s => {
        const b = el('div', 'hy-stat');
        b.appendChild(el('div', 'hy-stat-n', String(s[1])));
        b.appendChild(el('div', 'hy-stat-l', s[0]));
        stats.appendChild(b);
      });
      card.appendChild(stats);

      // What moved
      const moved = Object.keys(this.touched).map(id => ({
        id, name: (window.HY_SKILLS.get(id) || {}).name || id,
        lvl: HY.level(id), prog: HY.progress(id), acc: HY.accuracy(id)
      })).sort((a, b) => b.lvl - a.lvl);

      const grid = el('div', 'hy-moved');
      moved.forEach(m => {
        const row = el('div', 'hy-moved-row hy-lvl-' + m.lvl);
        row.appendChild(el('span', 'hy-moved-dot', ['○', '◔', '◑', '◕', '●'][m.lvl]));
        row.appendChild(el('span', 'hy-moved-name', m.name));
        row.appendChild(el('span', 'hy-moved-pct', Math.round(m.prog * 100) + '%'));
        grid.appendChild(row);
      });
      card.appendChild(el('h3', 'hy-moved-title', 'Where these skills stand now'));
      card.appendChild(grid);

      if (pct >= 80) confetti();
      if (window.State && window.State.addStars) {
        window.State.addStars(Math.max(1, Math.round(this.right / 3)), 'Half-Yearly practice');
      }

      const row = el('div', 'hy-actions');
      const again = el('button', 'hy-btn hy-btn-ghost', 'One more round');
      again.onclick = () => this.start(Object.assign({}, this.opts, { seed: String(Date.now()) }));
      const done = el('button', 'hy-btn hy-btn-primary hy-btn-big', 'Done for now');
      done.onclick = () => this.close();
      row.appendChild(again); row.appendChild(done);
      this.shell(card, row);
    }
  };

  window.HYStage = Stage;
})();

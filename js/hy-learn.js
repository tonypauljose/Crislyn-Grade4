/* ==========================================================================
   HALF-YEARLY 2026 — LESSON STAGE
   --------------------------------------------------------------------------
   The "learn it" half of the module. Full screen, tablet-first, same chrome
   as the drill so it feels like one app.

   A lesson runs:  cover → method cards → the worked example → the trap → done

   The worked example is revealed one step at a time. She taps to see the next
   line, which keeps her reading instead of skimming to the answer — the whole
   point of showing working at all.

   Two ways in:
     · from the Learn shelf on the hub — full lesson, ends by offering a short
       test on that skill straight away
     · from inside the drill — the same lesson, `compact: true`, shown the
       first time an untaught skill comes up. The drill itself is then the
       "try it", so the finish card hands straight back.
   ========================================================================== */

(function () {
  'use strict';

  const HY = window.HY;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }

  /** Loose match so "5,21,885" and "521885" both count as the same answer. */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[,\s]+/g, '')
      .replace(/[.!।]+$/, '')
      .replace(/[-–—·]/g, '')
      .trim();
  }

  function speak(text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ' '));
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      u.rate = 0.82;
      const voices = window.speechSynthesis.getVoices() || [];
      const v = voices.find(x => x.lang === u.lang) ||
        voices.find(x => x.lang && x.lang.indexOf(u.lang.split('-')[0]) === 0);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice on this device — silent */ }
  }

  /* Words differ by subject: हिंदी lessons speak Hindi. */
  const WORDS = {
    en: {
      kicker: 'Lesson', next: 'Next →', start: 'Teach me →', step: 'Show the next step →',
      tryIt: 'Now let us try it →', done: 'Lesson done', test: 'Try it now — 3 questions →',
      later: 'Not just now', worked: 'Watch one being done', trap: 'Watch out for this',
      remember: 'Remember this', goal: 'By the end of this you can',
      yourGo: 'Your turn first — what do you think the answer is?',
      typeIt: 'Type your answer', check: 'Check it →', youSaid: 'You said',
      order: 'Put the method back in order', orderHelp: 'Tap the steps in the order you would do them.',
      orderNo: 'Not that one yet — which comes first?', showOrder: 'Show me the order'
    },
    hi: {
      kicker: 'पाठ', next: 'आगे →', start: 'सिखाइए →', step: 'अगला चरण दिखाइए →',
      tryIt: 'अब कोशिश करते हैं →', done: 'पाठ पूरा हुआ', test: 'अब ३ प्रश्न कीजिए →',
      later: 'अभी नहीं', worked: 'एक उदाहरण साथ में', trap: 'यहाँ ध्यान दीजिए',
      remember: 'यह याद रखिए', goal: 'इस पाठ के बाद आप कर सकेंगी',
      yourGo: 'पहले आप बताइए — उत्तर क्या होगा?',
      typeIt: 'अपना उत्तर लिखिए', check: 'जाँचिए →', youSaid: 'आपने लिखा',
      order: 'विधि को क्रम में लगाइए', orderHelp: 'जिस क्रम में करेंगी, उसी क्रम में चरण दबाइए।',
      orderNo: 'अभी यह नहीं — पहले कौन-सा?', showOrder: 'क्रम दिखाइए'
    }
  };

  /* ============================================================== the stage */

  const Learn = {
    root: null,
    lesson: null,
    screens: [],
    idx: 0,
    revealed: 0,
    opts: null,
    W: WORDS.en,

    /**
     * @param {string} skillId
     * @param {object} opts
     *   compact  true when the drill is about to take over (no test offer)
     *   onDone   called when she finishes or closes — the drill continues here
     */
    open(skillId, opts) {
      HY.init();
      const lesson = window.HY_LESSONS && window.HY_LESSONS.get(skillId);
      if (!lesson) { if (opts && opts.onDone) opts.onDone(); return; }

      this.lesson = lesson;
      this.opts = Object.assign({ compact: false }, opts || {});
      this.W = WORDS[lesson.lang === 'hi' ? 'hi' : 'en'];
      this.idx = 0;
      this.revealed = 0;
      this.guessed = false;
      this.guess = '';

      /* Flatten the lesson into screens so the progress bar can be honest. */
      this.screens = [{ kind: 'cover' }]
        .concat(lesson.cards.map((c, i) => ({ kind: 'card', i: i })));
      if (lesson.worked && lesson.worked.steps && lesson.worked.steps.length) {
        this.screens.push({ kind: 'worked' });
        /* I do, then WE do: the method she has just watched, shuffled, for her
           to put back in order. Rebuilding the sequence is the cheapest honest
           way to find out whether she followed it or just tapped through. */
        const labels = lesson.worked.steps.map(st => st.t);
        const distinct = labels.filter((t, i) => labels.indexOf(t) === i).length === labels.length;
        /* Two steps with the same label cannot be put "in order" fairly, so a
           lesson like that simply does not get this screen. */
        if (lesson.worked.steps.length >= 3 && distinct) this.screens.push({ kind: 'order' });
      }
      if (lesson.trap) this.screens.push({ kind: 'trap' });
      this.screens.push({ kind: 'finish' });

      if (!this.root) {
        this.root = el('div', 'hy-learn');
        document.body.appendChild(this.root);
      }
      document.body.classList.add('hy-running');
      this.root.style.display = 'flex';
      this.render();
    },

    close(finished) {
      if (this.root) this.root.style.display = 'none';
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      /* The drill only removes hy-running when IT closes; if the drill is what
         opened this lesson, leave the class alone. */
      if (!this.opts || !this.opts.compact) document.body.classList.remove('hy-running');
      const done = this.opts && this.opts.onDone;
      const closed = this.opts && this.opts.onClose;
      this.opts = null;
      if (finished && done) done();
      else if (!finished && closed) closed();
      else if (done) done();
    },

    /* ---------------------------------------------------------------- chrome */

    shell(bodyNode, footNode) {
      this.root.innerHTML = '';
      const sub = window.HY_SKILLS.subjects[this.lesson.skill.subject];

      const top = el('div', 'hy-top');
      top.style.setProperty('--sub', sub ? sub.colour : '#6B21A8');

      const left = el('div', 'hy-top-left');
      left.appendChild(el('span', 'hy-chip', (sub ? sub.icon + ' ' : '') + this.W.kicker));
      left.appendChild(el('span', 'hy-skillname', this.lesson.skill.name));
      top.appendChild(left);

      const bar = el('div', 'hy-bar');
      bar.appendChild(el('i', 'hy-bar-fill')).style.width =
        Math.round((this.idx / (this.screens.length - 1)) * 100) + '%';
      top.appendChild(bar);

      const right = el('div', 'hy-top-right');
      right.appendChild(el('span', 'hy-count', (this.idx + 1) + ' / ' + this.screens.length));
      const x = el('button', 'hy-x', '✕');
      x.setAttribute('aria-label', 'Close');
      x.onclick = () => this.close(false);
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

    card() {
      const c = el('div', 'hy-card hy-learn-card');
      if (this.lesson.lang === 'hi') c.classList.add('hy-hi');
      return c;
    },

    /** A 🔊 button, but only where it helps — हिंदी. */
    voice(node, text) {
      if (this.lesson.lang !== 'hi') return;
      const b = el('button', 'hy-speak hy-speak-sm', '🔊');
      b.title = 'सुनिए';
      b.onclick = () => speak(text, 'hi');
      node.appendChild(b);
    },

    nextBtn(label) {
      const b = el('button', 'hy-btn hy-btn-primary hy-btn-big', label || this.W.next);
      b.onclick = () => { this.idx++; this.revealed = 0; this.render(); };
      return b;
    },

    /* --------------------------------------------------------------- screens */

    render() {
      if (this.idx >= this.screens.length) { this.finish(); return; }
      const s = this.screens[this.idx];
      if (s.kind === 'cover') return this.renderCover();
      if (s.kind === 'card') return this.renderCard(this.lesson.cards[s.i]);
      if (s.kind === 'worked') return this.renderWorked();
      if (s.kind === 'order') return this.renderOrder();
      if (s.kind === 'trap') return this.renderTrap();
      return this.renderFinish();
    },

    renderCover() {
      const sub = window.HY_SKILLS.subjects[this.lesson.skill.subject];
      const c = this.card();
      c.classList.add('hy-centre');
      c.appendChild(el('div', 'hy-hero-icon', '💡'));
      c.appendChild(el('div', 'hy-modal-kicker', this.lesson.skill.topic));
      c.appendChild(el('h2', null, this.lesson.skill.name));

      const goal = el('div', 'hy-learn-goal');
      goal.appendChild(el('span', 'hy-learn-goal-tag', this.W.goal));
      goal.appendChild(el('p', null, this.lesson.goal));
      c.appendChild(goal);

      const map = el('div', 'hy-learn-map');
      const nCards = this.lesson.cards.length;
      [['📖', nCards + (this.lesson.lang === 'hi' ? ' कार्ड' : (nCards === 1 ? ' card' : ' cards'))],
      ['✏️', this.W.worked],
      ['🎯', this.lesson.lang === 'hi' ? 'फिर अभ्यास' : 'Then you try']].forEach(p => {
        const step = el('div', 'hy-learn-map-step');
        step.appendChild(el('b', null, p[0]));
        step.appendChild(el('span', null, p[1]));
        map.appendChild(step);
      });
      c.appendChild(map);

      if (sub) c.appendChild(el('p', 'hy-note', sub.icon + ' ' + sub.name + ' · ' + this.lesson.skill.topic));
      this.shell(c, this.nextBtn(this.W.start));
    },

    renderCard(cardData) {
      const c = this.card();
      const h = el('h3', 'hy-learn-title', cardData.t);
      c.appendChild(h);
      this.voice(h, cardData.t);
      const body = el('div', 'hy-teach hy-learn-body');
      body.innerHTML = cardData.h;
      c.appendChild(body);
      this.shell(c, this.nextBtn());
    },

    renderWorked() {
      const w = this.lesson.worked;
      const c = this.card();
      c.appendChild(el('div', 'hy-modal-kicker', this.W.worked));

      const q = el('div', 'hy-learn-q');
      q.innerHTML = w.q;
      c.appendChild(q);
      this.voice(q, w.q);

      const list = el('div', 'hy-work');
      c.appendChild(list);

      const foot = el('div', 'hy-actions');
      const btn = el('button', 'hy-btn hy-btn-primary hy-btn-big', this.W.step);
      foot.appendChild(btn);

      const paint = () => {
        list.innerHTML = '';
        for (let i = 0; i < this.revealed; i++) {
          const st = w.steps[i];
          const row = el('div', 'hy-work-step');
          row.appendChild(el('span', 'hy-work-n', String(i + 1)));
          const bd = el('div', 'hy-work-body');
          bd.appendChild(el('b', null, st.t));
          const inner = el('div', null, st.h);
          bd.appendChild(inner);
          row.appendChild(bd);
          list.appendChild(row);
        }
        if (this.revealed >= w.steps.length) {
          /* Before the answer is handed over, she commits to one. Guessing
             first and then being told is worth far more than being told. */
          if (!this.guessed) {
            const ask = el('div', 'hy-guess');
            ask.appendChild(el('div', 'hy-guess-tag', this.W.yourGo));
            const inp = el('input', 'hy-input hy-input-wide');
            inp.setAttribute('type', 'text');
            inp.setAttribute('autocomplete', 'off');
            inp.placeholder = this.W.typeIt;
            if (this.lesson.lang === 'hi') inp.classList.add('hy-input-hi');
            ask.appendChild(inp);
            list.appendChild(ask);
            setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);

            btn.textContent = this.W.check;
            btn.onclick = () => {
              this.guessed = true;
              this.guess = inp.value;
              paint();
            };
            const lastNode = list.lastChild;
            if (lastNode && lastNode.scrollIntoView) lastNode.scrollIntoView({ block: 'nearest' });
            return;
          }

          const near = norm(this.guess) && norm(this.guess) === norm(w.ans);
          if (this.guess) {
            const mine = el('div', 'hy-guess-mine' + (near ? ' is-right' : ''));
            mine.innerHTML = (near ? '✓ ' : '') + this.W.youSaid + ' <b>' + this.guess + '</b>';
            list.appendChild(mine);
          }
          const ansRow = el('div', 'hy-work-answer');
          ansRow.innerHTML = '<span>' + (near ? '🎉' : '✓') + '</span><div>' + w.ans + '</div>';
          list.appendChild(ansRow);
          btn.textContent = this.W.next;
          btn.onclick = () => { this.idx++; this.revealed = 0; this.guessed = false; this.guess = ''; this.render(); };
        } else {
          btn.onclick = () => { this.revealed++; paint(); };
        }
        const last = list.lastChild;
        if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };

      this.revealed = this.revealed || 1;
      paint();
      this.shell(c, foot);
    },

    /**
     * WE DO. The steps she has just watched, shuffled, to be put back in the
     * order she would actually do them. She cannot tap her way past this one:
     * a wrong pick says so and stays put until the right step is chosen.
     */
    renderOrder() {
      const w = this.lesson.worked;
      const c = this.card();
      c.appendChild(el('div', 'hy-modal-kicker', this.W.order));
      const q = el('div', 'hy-learn-q');
      q.innerHTML = w.q;
      c.appendChild(q);
      c.appendChild(el('p', 'hy-note', this.W.orderHelp));

      const slot = el('div', 'hy-order-slot');
      c.appendChild(slot);
      const bank = el('div', 'hy-order-bank');
      c.appendChild(bank);
      const msg = el('div', 'hy-order-msg');
      c.appendChild(msg);

      /* A deterministic shuffle so the same lesson feels the same twice. */
      const seedRng = HY.rngFrom(HY.hashStr(this.lesson.id + '|order'));
      const order = w.steps.map((st, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(seedRng() * (i + 1));
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }

      let want = 0;
      const btns = {};
      const finishOrder = () => {
        msg.innerHTML = '✓ ' + (this.lesson.lang === 'hi'
          ? 'यही पूरी विधि है।' : 'That is the whole method, in order.');
        msg.className = 'hy-order-msg is-ok';
        const go = el('button', 'hy-btn hy-btn-primary hy-btn-big', this.W.next);
        go.onclick = () => { this.idx++; this.render(); };
        const ft = this.root.querySelector('.hy-foot');
        ft.innerHTML = ''; ft.appendChild(go);
      };
      order.forEach(i => {
        const b = el('button', 'hy-order-step', w.steps[i].t);
        b.onclick = () => {
          if (b.disabled) return;
          if (i === want) {
            b.disabled = true;
            b.classList.add('is-used');
            const placed = el('div', 'hy-order-placed');
            placed.appendChild(el('span', 'hy-order-n', String(want + 1)));
            placed.appendChild(el('span', null, w.steps[i].t));
            slot.appendChild(placed);
            msg.textContent = '';
            want++;
            if (want === w.steps.length) finishOrder();
          } else {
            b.classList.add('is-wrong');
            msg.textContent = this.W.orderNo;
            msg.className = 'hy-order-msg is-no';
            setTimeout(() => b.classList.remove('is-wrong'), 500);
          }
        };
        btns[i] = b;
        bank.appendChild(b);
      });

      /* Never a dead end. If she cannot see it, this lays the method out for
         her — she has still read it, which is the point of the screen. */
      const help = el('button', 'hy-btn hy-btn-ghost hy-btn-sm', this.W.showOrder);
      help.onclick = () => {
        w.steps.forEach((st, i) => {
          if (btns[i] && !btns[i].disabled) {
            btns[i].disabled = true;
            btns[i].classList.add('is-used');
            const placed = el('div', 'hy-order-placed');
            placed.appendChild(el('span', 'hy-order-n', String(i + 1)));
            placed.appendChild(el('span', null, st.t));
            slot.appendChild(placed);
          }
        });
        want = w.steps.length;
        finishOrder();
      };
      this.shell(c, help);
    },

    renderTrap() {
      const c = this.card();
      c.appendChild(el('div', 'hy-hero-icon', '⚠️'));
      c.appendChild(el('h3', 'hy-learn-title', this.W.trap));
      const box = el('div', 'hy-watch hy-watch-big');
      box.innerHTML = this.lesson.trap;
      c.appendChild(box);
      if (this.lesson.note) {
        const own = el('div', 'hy-own-note');
        own.innerHTML = '<span>' + (this.lesson.lang === 'hi' ? 'आपकी कॉपी से' : 'From your own book') +
          '</span>' + this.lesson.note;
        c.appendChild(own);
      }
      this.shell(c, this.nextBtn());
    },

    renderFinish() {
      /* Reaching this screen is what counts as taught. Closing early does not. */
      HY.markTaught(this.lesson.id);

      const c = this.card();
      c.classList.add('hy-centre');
      c.appendChild(el('div', 'hy-hero-icon', '✅'));
      c.appendChild(el('h2', null, this.W.done));
      c.appendChild(el('p', 'hy-lead', this.lesson.skill.name));

      if (this.lesson.recall) {
        const r = el('div', 'hy-recall');
        r.appendChild(el('span', 'hy-recall-tag', this.W.remember));
        const line = el('p', null, this.lesson.recall);
        r.appendChild(line);
        c.appendChild(r);
        this.voice(r, this.lesson.recall);
      }

      const row = el('div', 'hy-actions');
      if (this.opts.compact) {
        const go = el('button', 'hy-btn hy-btn-primary hy-btn-big', this.W.tryIt);
        go.onclick = () => this.close(true);
        row.appendChild(go);
      } else {
        const test = el('button', 'hy-btn hy-btn-primary hy-btn-big', this.W.test);
        test.onclick = () => {
          const id = this.lesson.id;
          const after = this.opts && this.opts.onDone;
          this.opts = null;
          if (this.root) this.root.style.display = 'none';
          if (window.HYStage) {
            window.HYStage.start({ mode: 'skill', skillId: id, target: 3, onClose: after });
          } else if (after) { after(); }
        };
        const later = el('button', 'hy-btn hy-btn-ghost', this.W.later);
        later.onclick = () => this.close(true);
        row.appendChild(test);
        row.appendChild(later);
      }
      this.shell(c, row);
    },

    finish() { this.close(true); }
  };

  window.HYLearn = Learn;
})();

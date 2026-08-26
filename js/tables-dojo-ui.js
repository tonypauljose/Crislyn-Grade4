/* ==========================================================================
   TABLES DOJO — the stage
   --------------------------------------------------------------------------
   Everything here is something she DOES. There is no screen whose only
   interaction is a Next button.

     Build it    tap out the rows of an array and watch it count up
     Count it    fill the gaps in the skip-counting ladder
     Work it     derive the fact from one she already knows, step by step
     Fold it in  the new fact rehearsed against a growing run of known ones
     Speed check sixty seconds on the keypad, against her own best

   Answers are typed on a keypad rather than picked from four buttons, because
   producing "42" is the thing being learnt; recognising it among four options
   is a different and much easier trick. The keypad checks itself as soon as
   she has typed as many digits as the answer has, so there is no submit tap
   between her and the next question.

   Time is recorded on every answer. Three seconds is the line between working
   it out and knowing it, and only the fast ones count towards fluency.
   ========================================================================== */

(function () {
  'use strict';

  const T = window.TDojo;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined && html !== null) n.innerHTML = html;
    return n;
  }

  function say(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ' '));
      u.lang = 'en-IN'; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice — fine */ }
  }

  function cheer() {
    if (window.Confetti && window.Confetti.launch) { window.Confetti.launch(60); return; }
    if (window.Confetti && window.Confetti.burst) { window.Confetti.burst(); return; }
  }

  const PRAISE = ['Yes!', 'Got it!', 'That is it.', 'Sharp.', 'Lovely.', 'Quick!', 'Nice one.'];

  /* ------------------------------------------------- deriving from a known */

  /**
   * Turn a fact into "work it out from one you already know" steps. The
   * strategy used is always the one belonging to whichever factor she met
   * EARLIER on the ladder — for 6 × 7 that means the sixes strategy applied
   * to 7, never the sevens strategy, because the sixes are the solid half.
   */
  function derive(k) {
    const p = T.parseKey(k);
    const ia = T.LADDER.indexOf(p.a), ib = T.LADDER.indexOf(p.b);
    const S = (ask, ans) => ({ ask, ans });

    if (ia === ib) {
      // The rung factor squared: lean on one lot less, which is already known.
      const n = p.a;
      return { via: n + ' × ' + (n - 1) + ', then one more ' + n,
        steps: [S(n + ' × ' + (n - 1), n * (n - 1)), S(n * (n - 1) + ' + ' + n, n * n)] };
    }

    const f = ia < ib ? p.a : p.b;   // the familiar one
    const o = ia < ib ? p.b : p.a;   // the newer one

    switch (f) {
      case 2:  return { via: 'doubling', steps: [S('Double ' + o, 2 * o)] };
      case 10: return { via: 'a zero on the end', steps: [S(o + ' with a 0 on the end', 10 * o)] };
      case 5:  return { via: 'half of ten lots',
        steps: [S(o + ' × 10', 10 * o), S('Half of ' + 10 * o, 5 * o)] };
      case 4:  return { via: 'double, double',
        steps: [S('Double ' + o, 2 * o), S('Double ' + 2 * o, 4 * o)] };
      case 3:  return { via: 'double, then one more lot',
        steps: [S('Double ' + o, 2 * o), S(2 * o + ' + ' + o, 3 * o)] };
      case 9:  return { via: 'ten lots take one away',
        steps: [S(o + ' × 10', 10 * o), S(10 * o + ' − ' + o, 9 * o)] };
      case 11: return o <= 9
        ? { via: 'the twin digits', steps: [S('Write ' + o + ' twice', 11 * o)] }
        : { via: 'ten lots and one more', steps: [S(o + ' × 10', 10 * o), S(10 * o + ' + ' + o, 11 * o)] };
      case 6:  return { via: 'five lots and one more',
        steps: [S(o + ' × 5', 5 * o), S(5 * o + ' + ' + o, 6 * o)] };
      case 8:  return { via: 'double, double, double',
        steps: [S('Double ' + o, 2 * o), S('Double ' + 2 * o, 4 * o), S('Double ' + 4 * o, 8 * o)] };
      case 7:  return { via: 'five lots and two more',
        steps: [S(o + ' × 5', 5 * o), S(5 * o + ' + ' + o + ' + ' + o, 7 * o)] };
      case 12: return { via: 'ten lots and two lots',
        steps: [S(o + ' × 10', 10 * o), S(o + ' × 2', 2 * o), S(10 * o + ' + ' + 2 * o, 12 * o)] };
      default: return { via: 'one lot at a time',
        steps: [S(p.a + ' × ' + (p.b - 1), p.a * (p.b - 1)), S(p.a * (p.b - 1) + ' + ' + p.a, p.a * p.b)] };
    }
  }

  /* ============================================================== the stage */

  const Stage = {
    root: null,
    screens: [],
    idx: 0,
    opts: null,
    tally: { n: 0, right: 0 },
    started: 0,

    /**
     * @param opts.mode  'daily' · 'rung' · 'speed' · 'fact'
     *        opts.rungId / opts.fact
     */
    start(opts) {
      T.init();
      this.opts = Object.assign({ mode: 'daily' }, opts || {});
      this.tally = { n: 0, right: 0 };
      this.started = Date.now();
      this.idx = 0;
      this.screens = this.plan();
      if (!this.screens.length) { this.opts.onClose && this.opts.onClose(); return; }

      if (!this.root) {
        this.root = el('div', 'td-stage');
        document.body.appendChild(this.root);
      }
      document.body.classList.add('td-running');
      this.root.style.display = 'flex';
      this.render();
    },

    close() {
      document.body.classList.remove('td-running');
      if (this.root) this.root.style.display = 'none';
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      this.opts && this.opts.onClose && this.opts.onClose();
    },

    /* ------------------------------------------------------------ planning */

    plan() {
      const m = this.opts.mode;
      if (m === 'speed') return [{ kind: 'speed', secs: this.opts.secs || 60 }, { kind: 'done' }];
      if (m === 'fact') {
        const k = this.opts.fact;
        return [{ kind: 'build', fact: k }, { kind: 'work', fact: k },
          { kind: 'fold', facts: [k] }, { kind: 'done' }];
      }

      const rung = this.opts.rungId ? T.rung(this.opts.rungId) : T.currentRung();
      const targets = T.targetsIn(rung);
      const teach = targets.slice(0, this.opts.newPerSession || 3);
      const screens = [{ kind: 'rung', rung }];

      if (teach.length) {
        screens.push({ kind: 'skip', rung });
        teach.forEach(k => {
          screens.push({ kind: 'build', fact: k, rung });
          screens.push({ kind: 'work', fact: k, rung });
        });
        screens.push({ kind: 'fold', facts: teach, rung });
      } else {
        /* Rung already met — go straight to keeping it fast. */
        screens.push({ kind: 'fold', facts: rung.facts.filter(k => !T.isFluent(k)).slice(0, 3), rung });
      }
      screens.push({ kind: 'speed', secs: 60 });
      screens.push({ kind: 'done', rung });
      return screens;
    },

    /* -------------------------------------------------------------- chrome */

    shell(body, foot, opts) {
      opts = opts || {};
      this.root.innerHTML = '';

      const top = el('div', 'td-top');
      const left = el('div', 'td-top-left');
      left.appendChild(el('span', 'td-chip', opts.chip || '✖️ Tables Dojo'));
      if (opts.sub) left.appendChild(el('span', 'td-sub', opts.sub));
      top.appendChild(left);

      const bar = el('div', 'td-bar');
      const pct = opts.pct !== undefined ? opts.pct
        : Math.round((this.idx / Math.max(1, this.screens.length - 1)) * 100);
      bar.appendChild(el('i', 'td-bar-fill')).style.width = pct + '%';
      top.appendChild(bar);

      const right = el('div', 'td-top-right');
      if (opts.right) right.appendChild(el('span', 'td-count', opts.right));
      const x = el('button', 'td-x', '✕');
      x.setAttribute('aria-label', 'Close');
      x.onclick = () => this.close();
      right.appendChild(x);
      top.appendChild(right);
      this.root.appendChild(top);

      const b = el('div', 'td-body');
      b.appendChild(body);
      this.root.appendChild(b);

      const f = el('div', 'td-foot');
      if (foot) f.appendChild(foot);
      this.root.appendChild(f);
    },

    next() { this.idx++; this.render(); },

    render() {
      if (this.idx >= this.screens.length) { this.close(); return; }
      const s = this.screens[this.idx];
      const fn = this['screen_' + s.kind];
      if (!fn) { this.next(); return; }
      fn.call(this, s);
    },

    /* ================================================== 1. the rung opening */

    screen_rung(s) {
      const r = s.rung;
      const rep = T.rungReport(r);
      const card = el('div', 'td-card td-centre');
      card.appendChild(el('div', 'td-hero', '🥋'));
      card.appendChild(el('h2', null, r.title));
      card.appendChild(el('div', 'td-strategy-name', r.strategy.name));
      card.appendChild(el('p', 'td-strategy-line', r.strategy.line));
      card.appendChild(el('div', 'td-eg', r.strategy.how));

      const news = T.targetsIn(r);
      card.appendChild(el('p', 'td-note', news.length
        ? '<b>' + news.length + '</b> new fact' + (news.length === 1 ? '' : 's') +
          ' on this belt. The rest of the ' + r.factor + 's you already know from the other tables.'
        : 'Every fact on this belt is met — today is about making them <b>fast</b>.'));

      const chips = el('div', 'td-factrow');
      r.facts.forEach(k => {
        const p = T.parseKey(k);
        const st = T.status(k);
        chips.appendChild(el('span', 'td-factchip s' + st, p.a + '×' + p.b));
      });
      card.appendChild(chips);

      const go = el('button', 'td-btn td-btn-go', 'Start the belt →');
      go.onclick = () => this.next();
      this.shell(card, go, { sub: rep.fluent + ' / ' + rep.total + ' fast' });
    },

    /* ============================================ 2. skip counting (doing) */

    screen_skip(s) {
      const f = s.rung.factor;
      const full = [];
      for (let i = 1; i <= 12; i++) full.push(f * i);

      /* Give her the first two, then blank roughly half — she generates the
         rest rather than reading a list. */
      const blanks = [];
      for (let i = 2; i < 12; i++) if (i % 2 === 0 || i > 8) blanks.push(i);

      const card = el('div', 'td-card');
      card.appendChild(el('h3', 'td-h', 'Count up in ' + f + 's'));
      card.appendChild(el('p', 'td-lead', 'Tap the missing numbers, in order. Say them out loud as you go.'));

      const ladder = el('div', 'td-ladder');
      const cells = full.map((v, i) => {
        const c = el('button', 'td-rung-cell', blanks.indexOf(i) === -1 ? String(v) : '?');
        if (blanks.indexOf(i) === -1) c.classList.add('is-given');
        c.disabled = true;
        ladder.appendChild(c);
        return c;
      });
      card.appendChild(ladder);

      const prompt = el('div', 'td-prompt', 'Which comes next?');
      card.appendChild(prompt);

      const choiceWrap = el('div', 'td-choices');
      card.appendChild(choiceWrap);

      let bi = 0;
      const askNext = () => {
        if (bi >= blanks.length) {
          prompt.innerHTML = '✓ The whole ' + f + ' times table, counted by you.';
          choiceWrap.innerHTML = '';
          const go = el('button', 'td-btn td-btn-go', 'Next →');
          go.onclick = () => this.next();
          const ft = this.root.querySelector('.td-foot');
          ft.innerHTML = ''; ft.appendChild(go);
          cheer();
          return;
        }
        const i = blanks[bi];
        const want = full[i];
        cells[i].classList.add('is-asking');
        prompt.innerHTML = 'What comes after <b>' + full[i - 1] + '</b>?';

        const opts = [want, want + f, want - f, want + 1].filter((v, ix, arr) =>
          v > 0 && arr.indexOf(v) === ix);
        for (let j = opts.length - 1; j > 0; j--) {
          const t = Math.floor(Math.random() * (j + 1));
          const tmp = opts[j]; opts[j] = opts[t]; opts[t] = tmp;
        }
        choiceWrap.innerHTML = '';
        opts.forEach(v => {
          const b = el('button', 'td-choice', String(v));
          b.onclick = () => {
            if (v === want) {
              cells[i].textContent = String(want);
              cells[i].classList.remove('is-asking');
              cells[i].classList.add('is-got');
              say(String(want));
              bi++; askNext();
            } else {
              b.classList.add('is-no');
              b.disabled = true;
            }
          };
          choiceWrap.appendChild(b);
        });
      };

      this.shell(card, null, { sub: 'Counting in ' + f + 's' });
      askNext();
    },

    /* ================================== 3. build the array (concrete first) */

    screen_build(s) {
      const p = T.parseKey(s.fact);
      /* Rows of the SMALLER number so the grid stays a sensible shape. */
      const rows = Math.min(p.a, p.b), cols = Math.max(p.a, p.b);

      const card = el('div', 'td-card');
      card.appendChild(el('h3', 'td-h', 'Build ' + rows + ' × ' + cols));
      card.appendChild(el('p', 'td-lead',
        'Tap each row to fill it in. Watch what the total does — that is what "' +
        rows + ' lots of ' + cols + '" means.'));

      const grid = el('div', 'td-array');
      grid.style.setProperty('--cols', cols);
      const rowEls = [];
      for (let r = 0; r < rows; r++) {
        const rowEl = el('button', 'td-array-row');
        for (let c = 0; c < cols; c++) rowEl.appendChild(el('i', 'td-dot'));
        grid.appendChild(rowEl);
        rowEls.push(rowEl);
      }
      card.appendChild(grid);

      const run = el('div', 'td-running', '0');
      card.appendChild(run);
      const eq = el('div', 'td-eq');
      card.appendChild(eq);

      let filled = 0;
      const fill = (r) => {
        if (r !== filled) return;              // must go in order
        rowEls[r].classList.add('is-on');
        filled++;
        const total = filled * cols;
        run.textContent = Array.from({ length: filled }, (_, i) => (i + 1) * cols).join('  ·  ');
        say(String(total));
        if (filled === rows) {
          eq.innerHTML = '<b>' + rows + ' × ' + cols + ' = ' + (rows * cols) + '</b>';
          eq.classList.add('is-on');
          T.markSeen(s.fact);
          cheer();
          const go = el('button', 'td-btn td-btn-go', 'Now work it out →');
          go.onclick = () => this.next();
          const ft = this.root.querySelector('.td-foot');
          ft.innerHTML = ''; ft.appendChild(go);
        }
      };
      rowEls.forEach((rowEl, r) => { rowEl.onclick = () => fill(r); });

      this.shell(card, el('div', 'td-hint', 'Tap the top row first.'),
        { sub: rows + ' × ' + cols });
    },

    /* ========================== 4. work it out from something already known */

    screen_work(s) {
      const p = T.parseKey(s.fact);
      const d = derive(s.fact);

      const card = el('div', 'td-card');
      card.appendChild(el('h3', 'td-h', p.a + ' × ' + p.b + ' — work it out'));
      card.appendChild(el('p', 'td-lead', 'Using <b>' + d.via + '</b>. Fill in each step.'));

      const list = el('div', 'td-steps');
      card.appendChild(list);

      const padWrap = el('div', 'td-padwrap');
      card.appendChild(padWrap);

      let si = 0;
      const ask = () => {
        if (si >= d.steps.length) {
          const fin = el('div', 'td-final');
          fin.innerHTML = 'So <b>' + p.a + ' × ' + p.b + ' = ' + (p.a * p.b) + '</b>';
          list.appendChild(fin);
          padWrap.innerHTML = '';
          say(p.a + ' times ' + p.b + ' is ' + (p.a * p.b));
          cheer();
          const go = el('button', 'td-btn td-btn-go', 'Fold it in →');
          go.onclick = () => this.next();
          const ft = this.root.querySelector('.td-foot');
          ft.innerHTML = ''; ft.appendChild(go);
          return;
        }
        const st = d.steps[si];
        const row = el('div', 'td-step');
        row.appendChild(el('span', 'td-step-n', String(si + 1)));
        row.appendChild(el('span', 'td-step-ask', st.ask + ' = '));
        const slot = el('span', 'td-slot', '?');
        row.appendChild(slot);
        list.appendChild(row);

        padWrap.innerHTML = '';
        padWrap.appendChild(this.keypad(String(st.ans).length, (val, ok) => {
          if (ok) {
            slot.textContent = String(st.ans);
            slot.classList.add('is-got');
            row.classList.add('is-done');
            si++; ask();
          } else {
            slot.textContent = val;
            slot.classList.add('is-no');
            setTimeout(() => { slot.textContent = '?'; slot.classList.remove('is-no'); }, 700);
          }
        }, st.ans));
      };

      this.shell(card, null, { sub: 'via ' + d.via });
      ask();
    },

    /* =============================== 5. fold the new fact in among the known */

    screen_fold(s) {
      const news = (s.facts || []).filter(Boolean);
      if (!news.length) { this.next(); return; }

      /* One fold-in ladder per new fact, run back to back. */
      const seq = [];
      news.forEach(k => {
        T.foldIn(k, { depth: 5 }).forEach(x => seq.push(x));
      });

      this.runDrill(seq, {
        chip: '🔁 Fold it in',
        sub: 'new fact, then ones you know',
        onDone: () => this.next()
      });
    },

    /* ================================================== 6. the speed check */

    screen_speed(s) {
      const secs = s.secs || 60;
      const card = el('div', 'td-card td-centre');
      card.appendChild(el('div', 'td-hero', '⏱️'));
      card.appendChild(el('h2', null, secs + '-second speed check'));
      const best = T.getBest('speed' + secs);
      card.appendChild(el('p', 'td-lead', best
        ? 'Your best so far is <b>' + best + '</b>. Beat it.'
        : 'How many can you get? This sets your first record.'));
      card.appendChild(el('p', 'td-note',
        'Only the ones you answer in under 3 seconds count as <b>fast</b> on your wall.'));

      const go = el('button', 'td-btn td-btn-go', 'Go →');
      go.onclick = () => this.runSpeed(secs);
      this.shell(card, go, { chip: '⏱️ Speed check' });
    },

    runSpeed(secs) {
      const seq = T.speedSet(200);
      let i = 0, right = 0, wrong = 0;
      const t0 = Date.now();
      let timer = null, qStart = 0;

      const card = el('div', 'td-card td-centre');
      const clock = el('div', 'td-clock', String(secs));
      card.appendChild(clock);
      const q = el('div', 'td-bigq');
      card.appendChild(q);
      const score = el('div', 'td-score', '0');
      card.appendChild(score);
      const padWrap = el('div', 'td-padwrap');
      card.appendChild(padWrap);

      let over = false;
      const finish = () => {
        if (over) return;          // the buzzer only goes once
        over = true;
        clearInterval(timer);
        const isBest = T.recordBest('speed' + secs, right);
        T.finishSession({ kind: 'speed', n: right + wrong, right, secs });
        const done = el('div', 'td-card td-centre');
        done.appendChild(el('div', 'td-hero', isBest ? '🏆' : (right >= 20 ? '💪' : '🌱')));
        done.appendChild(el('h2', null, isBest ? 'New record!' : 'Time!'));
        done.appendChild(el('div', 'td-bigscore', String(right)));
        done.appendChild(el('p', 'td-lead', 'right in ' + secs + ' seconds' +
          (isBest ? '' : ' · your best is ' + T.getBest('speed' + secs))));
        if (isBest) cheer();
        if (window.State && window.State.addStars) {
          window.State.addStars(Math.max(1, Math.round(right / 5)), 'Tables speed check');
        }
        const go = el('button', 'td-btn td-btn-go', 'Next →');
        go.onclick = () => this.next();
        this.shell(done, go, { chip: '⏱️ Speed check', pct: 100 });
      };

      const askOne = () => {
        if (over) return;
        if (i >= seq.length) { finish(); return; }
        const k = seq[i];
        const p = T.parseKey(k);
        const flip = Math.random() < 0.5;
        const A = flip ? p.b : p.a, B = flip ? p.a : p.b;
        q.innerHTML = A + ' × ' + B;
        qStart = Date.now();
        padWrap.innerHTML = '';
        padWrap.appendChild(this.keypad(String(p.a * p.b).length, (val, ok) => {
          /* An answer still being typed when the buzzer goes does not count —
             for her score or against her facts. */
          if (over) return;
          const ms = Date.now() - qStart;
          T.record(k, undefined, ok, ms);
          if (ok) { right++; score.textContent = String(right); }
          else { wrong++; }
          i++;
          askOne();
        }, p.a * p.b));
      };

      this.shell(card, null, { chip: '⏱️ Speed check' });
      askOne();
      timer = setInterval(() => {
        const left = secs - Math.floor((Date.now() - t0) / 1000);
        clock.textContent = String(Math.max(0, left));
        if (left <= 5) clock.classList.add('is-low');
        if (left <= 0) finish();
      }, 200);
    },

    /* ================================================ the reusable drill run */

    runDrill(seq, opts) {
      let i = 0, right = 0;
      const total = seq.length;

      const card = el('div', 'td-card td-centre');
      const q = el('div', 'td-bigq');
      card.appendChild(q);
      const fb = el('div', 'td-fb');
      card.appendChild(fb);
      const padWrap = el('div', 'td-padwrap');
      card.appendChild(padWrap);

      const step = () => {
        if (i >= seq.length) {
          T.finishSession({ kind: 'fold', n: total, right,
            secs: Math.round((Date.now() - this.started) / 1000) });
          opts.onDone();
          return;
        }
        const k = seq[i];
        const p = T.parseKey(k);
        const flip = Math.random() < 0.5;
        const A = flip ? p.b : p.a, B = flip ? p.a : p.b;
        const ansv = p.a * p.b;

        q.innerHTML = A + ' × ' + B;
        if (this._tick) this._tick();
        fb.textContent = '';
        fb.className = 'td-fb';
        const t0 = Date.now();

        padWrap.innerHTML = '';
        padWrap.appendChild(this.keypad(String(ansv).length, (val, ok) => {
          const ms = Date.now() - t0;
          const res = T.record(k, undefined, ok, ms);
          this.tally.n++;
          if (ok) {
            right++; this.tally.right++;
            fb.textContent = (ms <= T.FLUENT_MS ? '⚡ ' : '✓ ') + PRAISE[i % PRAISE.length];
            fb.className = 'td-fb is-ok';
            if (res.justFluent) {
              fb.innerHTML = '⭐ <b>' + A + ' × ' + B + '</b> is locked in!';
              cheer();
            }
            i++;
            setTimeout(step, 420);
          } else {
            fb.innerHTML = 'Not quite — <b>' + A + ' × ' + B + ' = ' + ansv + '</b>. Say it, then type it.';
            fb.className = 'td-fb is-no';
            say(A + ' times ' + B + ' is ' + ansv);
            /* Wrong answers are asked again straight away, then again later —
               that is the whole point of the fold-in. */
            padWrap.innerHTML = '';
            padWrap.appendChild(this.keypad(String(ansv).length, () => {
              /* Copying it once is enough here — it has already been pushed
                 back into the queue, so it returns on its own. */
              i++; setTimeout(step, 300);
            }, ansv));
            if (seq.indexOf(k, i + 1) === -1) seq.splice(Math.min(seq.length, i + 3), 0, k);
          }
        }, ansv));
      };

      this.shell(card, null, { chip: opts.chip, sub: opts.sub, right: '1 / ' + total, pct: 0 });
      const tick = () => {
        const bar = this.root.querySelector('.td-bar-fill');
        const cnt = this.root.querySelector('.td-count');
        if (bar) bar.style.width = Math.round((i / seq.length) * 100) + '%';
        if (cnt) cnt.textContent = Math.min(i + 1, seq.length) + ' / ' + seq.length;
      };
      this._tick = tick;
      step();
    },

    /* --------------------------------------------------------- the keypad */

    /**
     * Big number pad. It checks itself the moment she has typed as many
     * digits as the answer has, so there is no extra tap between her and the
     * next question — which matters when the target is under three seconds.
     */
    keypad(len, onAnswer, answer, opts) {
      opts = opts || {};
      const wrap = el('div', 'td-pad');
      const shown = el('div', 'td-pad-out', '');
      wrap.appendChild(shown);

      const keys = el('div', 'td-pad-keys');
      let buf = '';

      const check = () => {
        const ok = Number(buf) === Number(answer);
        shown.classList.add(ok ? 'is-ok' : 'is-no');
        const v = buf;
        buf = '';
        setTimeout(() => {
          shown.textContent = '';
          shown.classList.remove('is-ok', 'is-no');
          onAnswer(v, ok);
        }, ok ? 120 : 260);
      };

      const press = (d) => {
        if (buf.length >= len) return;
        buf += d;
        shown.textContent = buf;
        if (buf.length === len) setTimeout(check, 60);
      };

      ['1','2','3','4','5','6','7','8','9'].forEach(d => {
        const b = el('button', 'td-key', d);
        b.onclick = () => press(d);
        keys.appendChild(b);
      });
      const del = el('button', 'td-key td-key-del', '⌫');
      del.onclick = () => { buf = buf.slice(0, -1); shown.textContent = buf; };
      keys.appendChild(del);
      const zero = el('button', 'td-key', '0');
      zero.onclick = () => press('0');
      keys.appendChild(zero);
      const blank = el('span', 'td-key td-key-blank');
      keys.appendChild(blank);

      wrap.appendChild(keys);
      return wrap;
    },

    /* --------------------------------------------------------------- done */

    screen_done(s) {
      const rep = T.report();
      const card = el('div', 'td-card td-centre');
      card.appendChild(el('div', 'td-hero', '🥋'));
      card.appendChild(el('h2', null, 'Dojo done for today'));

      const stats = el('div', 'td-stats');
      [['Answered', this.tally.n], ['Right', this.tally.right + ' / ' + this.tally.n],
      ['Facts fast', rep.fluent + ' / ' + rep.total]].forEach(row => {
        const b = el('div', 'td-stat');
        b.appendChild(el('div', 'td-stat-n', String(row[1])));
        b.appendChild(el('div', 'td-stat-l', row[0]));
        stats.appendChild(b);
      });
      card.appendChild(stats);

      if (s.rung) {
        const r = T.rungReport(s.rung);
        card.appendChild(el('p', 'td-lead',
          s.rung.title + ' — <b>' + r.fluent + ' of ' + r.total + '</b> fast' +
          (r.done ? ' · belt earned! 🎖️' : '')));
        if (r.done) cheer();
      }
      card.appendChild(this.wallNode());

      const go = el('button', 'td-btn td-btn-go', 'Finish');
      go.onclick = () => this.close();
      this.shell(card, go, { pct: 100 });
    },

    /** The 11×11 wall — she can see exactly which facts are solid. */
    wallNode() {
      const wrap = el('div', 'td-wallwrap');
      wrap.appendChild(el('div', 'td-wall-title', 'Your fact wall'));
      const grid = el('div', 'td-wall');
      grid.style.setProperty('--n', T.FACTORS.length + 1);
      grid.appendChild(el('i', 'td-wall-corner', '×'));
      T.FACTORS.forEach(b => grid.appendChild(el('i', 'td-wall-head', String(b))));
      T.wall().forEach((row, ri) => {
        grid.appendChild(el('i', 'td-wall-head', String(T.FACTORS[ri])));
        row.forEach(cell => {
          const c = el('i', 'td-wall-cell s' + cell.status);
          c.title = cell.a + ' × ' + cell.b + ' = ' + cell.product;
          grid.appendChild(c);
        });
      });
      wrap.appendChild(grid);
      const keyRow = el('div', 'td-wall-key');
      [['s0', 'not met'], ['s1', 'shaky'], ['s2', 'knows it'], ['s3', 'fast']].forEach(p => {
        const s = el('span', null, '<i class="' + p[0] + '"></i>' + p[1]);
        keyRow.appendChild(s);
      });
      wrap.appendChild(keyRow);
      return wrap;
    }
  };

  Stage.derive = derive;
  window.TDojoStage = Stage;
})();

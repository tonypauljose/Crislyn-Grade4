/* ==========================================================================
   MEASUREQUEST — the app shell
   --------------------------------------------------------------------------
   Screens, session flow, and the feedback loop. Draws into #mq-app.

   The part worth reading is `judge()`. A wrong answer never ends a question.
   It runs this ladder instead:

     1st wrong   name the misconception and offer another go at the SAME
                 question, because she now knows something she did not know
                 a moment ago.
     2nd wrong   go back to the visual model that idea came from (tracing a
                 border, tiling a floor, rows and columns), show the worked
                 example, and then hand her a DIFFERENT question on the same
                 skill so the last thing she does is succeed.

   That is also why the session never gets harder after a mistake. The
   `wrongRun` counter per skill drives everything, and it resets the moment
   she gets one right.

   Hints are three, always in the same order: clue, then picture, then the
   whole worked example with a fresh question behind it. Using one is not
   penalised anywhere — it earns the Clue Reader badge.
   ========================================================================== */

(function () {
  'use strict';

  const MQ = () => window.MQ;
  const CT = () => window.MQ_CONTENT;
  const BK = () => window.MQ_BANK;
  const AC = () => window.MQActivities;
  const SP = () => window.MQSpeak;

  const h = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const $ = id => document.getElementById(id);

  let root = null;
  let screen = 'home';
  let S = null;                 /* the running session, or null */

  /* ====================================================================== */
  /*  CHROME                                                                */
  /* ====================================================================== */

  function header(title, opts) {
    opts = opts || {};
    const bar = h('div', 'mq-topbar');
    const back = h('button', 'mq-back', '<span aria-hidden="true">&larr;</span> ' + (opts.backLabel || 'Back'));
    back.type = 'button';
    back.onclick = opts.onBack || (() => go('home'));
    bar.appendChild(back);
    bar.appendChild(h('div', 'mq-topbar-title', title));
    const right = h('div', 'mq-topbar-right');
    if (opts.right) right.appendChild(opts.right);
    bar.appendChild(right);
    return bar;
  }

  /** Read-aloud controls. Absent entirely when the browser cannot speak. */
  function speakControls(getText) {
    if (!SP().available()) return null;
    const box = h('div', 'mq-speak');
    const play = h('button', 'mq-speak-btn', 'Read it to me');
    play.type = 'button';
    play.setAttribute('aria-label', 'Read this out loud');
    const stop = h('button', 'mq-speak-btn mq-speak-stop', 'Stop');
    stop.type = 'button';
    stop.hidden = true;
    play.onclick = () => {
      SP().speak(getText(), { onend: () => { stop.hidden = true; play.textContent = 'Read it again'; } });
      stop.hidden = false;
      play.textContent = 'Reading...';
    };
    stop.onclick = () => { SP().stop(); stop.hidden = true; play.textContent = 'Read it to me'; };
    box.appendChild(play);
    box.appendChild(stop);
    return box;
  }

  function go(name, arg) {
    SP().stop();
    screen = name;
    render(arg);
    window.scrollTo(0, 0);
  }

  /* ====================================================================== */
  /*  HOME                                                                  */
  /* ====================================================================== */

  function screenHome() {
    const st = MQ().get();
    const wrap = h('div', 'mq-home');
    const name = MQ().name();
    const started = st.sessions.length > 0 ||
      Object.keys(st.missions).some(k => st.missions[k].done || Object.keys(st.missions[k].acts).length) ||
      CT().skills.some(s => st.skills[s.id] && st.skills[s.id].attempts > 0);

    const hero = h('header', 'mq-hero');
    hero.appendChild(h('p', 'mq-hero-kicker', 'MeasureQuest'));
    hero.appendChild(h('h1', 'mq-hero-title', 'Hello, ' + name + '!'));
    hero.appendChild(h('p', 'mq-hero-sub',
      'Around or Inside? One roll of ribbon, one box of tiles, and a mystery to solve before the school dance.'));

    const cue = h('div', 'mq-cue');
    cue.appendChild(h('span', 'mq-cue-long', CT().CUE_LONG));
    hero.appendChild(cue);

    const cta = h('div', 'mq-hero-cta');
    const start = h('button', 'mq-btn mq-btn-primary mq-btn-big',
      started ? 'Carry on where you left off' : 'Start today&rsquo;s mission');
    start.type = 'button';
    start.onclick = () => {
      const next = nextMission();
      if (next) startMission(next.id);
      else startPractice();
    };
    cta.appendChild(start);
    if (started) {
      const fresh = h('button', 'mq-btn mq-btn-ghost', 'Practise instead');
      fresh.type = 'button';
      fresh.onclick = startPractice;
      cta.appendChild(fresh);
    }
    hero.appendChild(cta);

    if (!st.diagnostic) {
      const check = h('button', 'mq-link-btn', 'Or first: let&rsquo;s see what you already know');
      check.type = 'button';
      check.onclick = () => go('check');
      hero.appendChild(check);
    }
    wrap.appendChild(hero);

    /* four destinations */
    const grid = h('div', 'mq-dests');
    const dest = (key, title, sub, art, fn, badge) => {
      const b = h('button', 'mq-dest mq-dest-' + key);
      b.type = 'button';
      const ic = AC().icon(art, 'mq-dest-icon');
      b.appendChild(ic);
      b.appendChild(h('span', 'mq-dest-title', title));
      b.appendChild(h('span', 'mq-dest-sub', sub));
      if (badge) b.appendChild(h('span', 'mq-dest-badge', badge));
      b.onclick = fn;
      grid.appendChild(b);
    };
    const doneMissions = CT().missions.filter(m => st.missions[m.id].done).length;
    dest('learn', 'Learn', 'Seven missions, in order', 'walk', () => go('missions'),
      doneMissions + ' of ' + CT().missions.length);
    dest('practise', 'Practise', 'A short set, picked for you', 'tiles', startPractice,
      MQ().doneToday() ? MQ().doneToday() + ' today' : null);
    dest('challenge', 'Challenge', 'Mixed detective work', 'detective', startChallenge,
      MQ().missionOpen('m6') ? null : 'opens later');
    dest('progress', 'My Progress', 'Badges and skills', 'reveal', () => go('progress'),
      MQ().secureCount() + ' secure');
    wrap.appendChild(grid);

    const foot = h('div', 'mq-home-foot');
    const grown = h('button', 'mq-link-btn', 'Grown-up Corner');
    grown.type = 'button';
    grown.onclick = () => go('grown');
    foot.appendChild(grown);
    const rename = h('button', 'mq-link-btn', 'Change name');
    rename.type = 'button';
    rename.onclick = () => {
      const n = window.prompt('Who is using MeasureQuest?', MQ().name());
      if (n) { MQ().setName(n); render(); }
    };
    foot.appendChild(rename);
    wrap.appendChild(foot);
    return wrap;
  }

  function nextMission() {
    const st = MQ().get();
    return CT().missions.find(m => !m.bonus && MQ().missionOpen(m.id) && !st.missions[m.id].done) || null;
  }

  /* ====================================================================== */
  /*  MISSION LIST                                                          */
  /* ====================================================================== */

  function screenMissions() {
    const wrap = h('div', 'mq-page');
    wrap.appendChild(header('Learn'));
    wrap.appendChild(h('p', 'mq-lede',
      'Seven missions. Each one unlocks the next, so nothing is ever asked before it has been shown.'));

    const list = h('div', 'mq-missions');
    CT().missions.forEach(m => {
      const st = MQ().get().missions[m.id];
      const open = MQ().missionOpen(m.id);
      const pct = Math.round(MQ().missionProgress(m.id) * 100);
      const card = h('div', 'mq-mission mq-mission-' + m.colour +
        (open ? '' : ' is-locked') + (st.done ? ' is-done' : ''));
      const top = h('div', 'mq-mission-top');
      top.appendChild(h('span', 'mq-mission-n', m.bonus ? 'Bonus' : String(m.n)));
      const t = h('div', 'mq-mission-titles');
      t.appendChild(h('h3', 'mq-mission-name', m.name));
      t.appendChild(h('p', 'mq-mission-tag', m.tag));
      top.appendChild(t);
      if (st.done) top.appendChild(h('span', 'mq-mission-done', 'Finished'));
      card.appendChild(top);
      card.appendChild(h('p', 'mq-mission-blurb', m.blurb));

      const meter = h('div', 'mq-meter');
      meter.innerHTML = '<i style="width:' + pct + '%"></i>';
      card.appendChild(meter);
      card.appendChild(h('p', 'mq-mission-meta',
        BK().forMission(m.id).length + ' activities &middot; ' + pct + '% done'));

      const b = h('button', 'mq-btn ' + (open ? 'mq-btn-primary' : 'mq-btn-ghost'),
        !open ? 'Finish mission ' + (CT().mission(m.opens) || {}).n + ' first'
          : st.done ? 'Do it again' : pct > 0 ? 'Carry on' : 'Start');
      b.type = 'button';
      b.disabled = !open;
      b.onclick = () => startMission(m.id);
      card.appendChild(b);
      list.appendChild(card);
    });
    wrap.appendChild(list);
    return wrap;
  }

  /* ====================================================================== */
  /*  SESSIONS                                                              */
  /* ====================================================================== */

  function startMission(id) {
    const acts = BK().forMission(id);
    const st = MQ().get().missions[id];
    const undone = acts.filter(a => !(st.acts[a.id] && st.acts[a.id].done));
    const queue = (undone.length ? undone : acts).slice(0, Math.max(6, Math.min(10, acts.length)));
    S = newSession(queue, { source: 'mission', missionId: id, title: CT().mission(id).name });
    go('run');
  }

  function startPractice() {
    const q = MQ().dailyQueue(MQ().SESSION_TARGET);
    if (!q.length) { go('missions'); return; }
    S = newSession(q, { source: 'practice', title: 'Practice' });
    go('run');
  }

  function startChallenge() {
    if (!MQ().missionOpen('m6')) {
      alert('The Challenge opens once you have finished Mission 5. Keep going — you are close!');
      return;
    }
    const q = [];
    for (let i = 0; i < 8; i++) {
      q.push(MQ().question(i % 2 ? 'real-life' : (i % 3 ? 'units' : 'compare'), { offset: i }));
    }
    S = newSession(q.filter(Boolean), { source: 'challenge', title: 'Detective Challenge' });
    go('run');
  }

  function startPracticeSet(skillId) {
    S = newSession(MQ().practiceSet(skillId, 5), {
      source: 'practice', title: 'Five on ' + (CT().skill(skillId) || {}).short
    });
    go('run');
  }

  function newSession(queue, opts) {
    return {
      queue: queue.slice(), i: 0, correct: 0, hintsUsed: 0, asked: 0,
      wrongRun: {}, results: [], injected: 0,
      source: opts.source, missionId: opts.missionId, title: opts.title,
      hintLevel: 0, tries: 0, act: null, q: null
    };
  }

  /* ====================================================================== */
  /*  THE RUNNER                                                            */
  /* ====================================================================== */

  function screenRun() {
    const wrap = h('div', 'mq-page mq-run');
    if (!S || S.i >= S.queue.length) return screenDone();

    const q = S.queue[S.i];
    S.q = q;
    /* Only clear the per-question counters when the question actually
       CHANGES. Re-rendering after "Try it again" is the same question, and
       forgetting that would lose the recovery — which is the one thing this
       app most wants to notice and praise. */
    if (S.shownFor !== q) { S.shownFor = q; S.hintLevel = 0; S.tries = 0; }

    wrap.appendChild(header(S.title, {
      backLabel: 'Leave',
      onBack: () => { if (S.asked) finishSession(); else go('home'); }
    }));

    /* progress dots — she can always see where she is */
    const dots = h('div', 'mq-dots');
    dots.setAttribute('role', 'img');
    dots.setAttribute('aria-label', 'Question ' + (S.i + 1) + ' of ' + S.queue.length);
    for (let i = 0; i < S.queue.length; i++) {
      const d = h('span', 'mq-dot' + (i < S.i ? ' is-done' : i === S.i ? ' is-now' : ''));
      dots.appendChild(d);
    }
    wrap.appendChild(dots);

    const card = h('div', 'mq-card-main');
    wrap.appendChild(card);

    const stage = h('div', 'mq-stage');
    card.appendChild(stage);

    const sc = speakControls(() => (q.story ? q.story.text + '. ' : '') + q.prompt);
    if (sc) card.insertBefore(sc, stage);

    const foot = h('div', 'mq-foot');
    card.appendChild(foot);

    const feedback = h('div', 'mq-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    card.appendChild(feedback);

    /* Declared BEFORE the render call: some activities (the Shape Lab, for
       one) call onProgress while they are still being built, and a `let`
       declared afterwards would still be in its dead zone — which blanked
       the whole screen rather than failing quietly. */
    let checkBtn = null;
    const syncCheck = () => {
      if (checkBtn) checkBtn.disabled = !(S.act && S.act.ready && S.act.ready());
    };

    const act = AC().render(q, stage, {
      onSubmit: resp => judge(resp, { card, stage, foot, feedback, act: S.act }),
      onProgress: syncCheck
    });
    S.act = act;

    /* hint + check */
    const hint = h('button', 'mq-btn mq-btn-ghost', 'I need a clue');
    hint.type = 'button';
    hint.onclick = () => showHint(feedback, hint);
    foot.appendChild(hint);

    if (!act.auto) {
      checkBtn = h('button', 'mq-btn mq-btn-primary', 'Check it');
      checkBtn.type = 'button';
      checkBtn.disabled = !(act.ready && act.ready());
      checkBtn.onclick = () => judge(act.collect(), { card, stage, foot, feedback, act });
      foot.appendChild(checkBtn);
    }
    if (act.focus) setTimeout(() => act.focus(), 60);
    return wrap;
  }

  function showHint(feedback, btn) {
    const q = S.q;
    S.hintLevel = Math.min(3, S.hintLevel + 1);
    S.hintsUsed++;
    const labels = ['', 'A clue', 'Look at this', 'Here it is, worked out'];
    feedback.className = 'mq-feedback is-hint';
    feedback.innerHTML = '';
    feedback.appendChild(h('div', 'mq-fb-title', labels[S.hintLevel]));
    feedback.appendChild(h('div', 'mq-fb-body', q.hints[S.hintLevel - 1]));

    if (S.hintLevel === 3 && q.worked) {
      const w = h('div', 'mq-worked-out');
      q.worked.forEach((line, i) => w.appendChild(h('div', 'mq-worked-line',
        '<span>' + (i + 1) + '</span>' + line)));
      feedback.appendChild(w);
    }
    if (S.hintLevel >= 3) { btn.disabled = true; btn.textContent = 'No more clues'; }
    else btn.textContent = 'Another clue';
    const sc = speakControls(() => q.hints[S.hintLevel - 1]);
    if (sc) feedback.appendChild(sc);
  }

  /* --------------------------------------------------------------- judge */

  function judge(resp, ui) {
    const q = S.q;
    const res = MQ().check(q, resp);
    S.tries++;

    const skill = q.skill;
    S.wrongRun[skill] = S.wrongRun[skill] || 0;

    if (res.correct) {
      S.wrongRun[skill] = 0;
      S.correct++;
      S.asked++;
      MQ().record(skill, {
        correct: true, type: q.type, hintsUsed: S.hintLevel ? 1 : 0,
        afterWrong: S.tries > 1, sig: q.sig
      });
      if (S.source === 'mission' && q.curated) MQ().completeActivity(S.missionId, q.id, true);
      S.results.push({ skill, correct: true, type: q.type });
      praise(ui, res, q);
    } else {
      S.wrongRun[skill]++;
      teach(ui, res, q);
    }
  }

  function praise(ui, res, q) {
    const lines = [];
    if (S.tries > 1) lines.push('Great recovery.');
    else if (S.hintLevel) lines.push('That clue did its job.');
    else lines.push(pickPraise(q));
    ui.feedback.className = 'mq-feedback is-right';
    ui.feedback.innerHTML = '';
    ui.feedback.appendChild(h('div', 'mq-fb-title', lines[0]));
    if (q.explain) ui.feedback.appendChild(h('div', 'mq-fb-body', q.explain));
    if (q.consequence) ui.feedback.appendChild(h('div', 'mq-fb-note', q.consequence));
    if (q.fact) ui.feedback.appendChild(h('div', 'mq-fb-note', q.fact));
    if (q.type === 'explain' && q.model)
      ui.feedback.appendChild(h('div', 'mq-fb-note', 'Another way to say it: ' + q.model));

    const won = MQ().checkBadges();
    won.forEach(b => {
      const badge = CT().badge(b);
      if (badge) ui.feedback.appendChild(h('div', 'mq-fb-badge',
        '<b>New badge: ' + badge.name + '</b><span>' + badge.earn + '</span>'));
    });

    ui.foot.innerHTML = '';
    const next = h('button', 'mq-btn mq-btn-primary', S.i + 1 >= S.queue.length ? 'Finish' : 'Next');
    next.type = 'button';
    next.onclick = advance;
    ui.foot.appendChild(next);
    next.focus();
  }

  function pickPraise(q) {
    const byType = {
      trace: 'You found the edge!',
      shade: 'Every square covered.',
      tiles: 'No gaps, no overlaps.',
      sort: 'Sorted, every one.',
      unit: 'You checked the unit carefully.',
      explain: 'Said in your own words.',
      compare: 'You counted instead of guessing.',
      build: 'Built it exactly.',
      mission: 'A proper detective job.'
    };
    return byType[q.type] || 'That is it.';
  }

  function teach(ui, res, q) {
    const skill = q.skill;
    const runs = S.wrongRun[skill];
    ui.feedback.className = 'mq-feedback is-teach';
    ui.feedback.innerHTML = '';

    /* Log what went wrong straight away. The attempt itself is only recorded
       on the second miss (below), so a recovered slip costs her nothing —
       but the grown-up still gets to see the pattern. */
    if (res.tag) MQ().noteMisconception(skill, res.tag);

    const tag = res.tag && CT().misconception(res.tag);
    ui.feedback.appendChild(h('div', 'mq-fb-title',
      runs === 1 ? 'Not quite — look at this' : 'Let us go back to the picture'));
    ui.feedback.appendChild(h('div', 'mq-fb-body', res.teach || q.explain));

    if (res.wrongCards && S.act && S.act.mark) S.act.mark(res.wrongCards);
    if (res.badStep != null && S.act && S.act.markStep) S.act.markStep(res.badStep);
    if (res.why) ui.feedback.appendChild(h('div', 'mq-fb-note', res.why));
    if (resWhy(res)) ui.feedback.appendChild(h('div', 'mq-fb-note', resWhy(res)));

    const sc = speakControls(() => res.teach || q.explain);
    if (sc) ui.feedback.appendChild(sc);

    ui.foot.innerHTML = '';

    if (runs === 1) {
      /* She knows something now that she did not know a second ago. */
      const again = h('button', 'mq-btn mq-btn-primary', 'Try it again');
      again.type = 'button';
      again.onclick = () => {
        ui.feedback.className = 'mq-feedback';
        ui.feedback.innerHTML = '';
        if (S.act && S.act.reset) S.act.reset();
        render();
      };
      ui.foot.appendChild(again);
      const show = h('button', 'mq-btn mq-btn-ghost', 'Show me how');
      show.type = 'button';
      show.onclick = () => { S.hintLevel = 2; showHint(ui.feedback, show); show.disabled = true; };
      ui.foot.appendChild(show);
      again.focus();
      return;
    }

    /* Second miss: back to the model, then a different question. */
    if (tag && tag.back) {
      const model = CT().models[tag.back];
      const panel = h('div', 'mq-model');
      panel.appendChild(h('div', 'mq-model-title', 'Remember this picture: ' + (model ? model.name : '')));
      const demo = modelPicture(tag.back);
      if (demo) panel.appendChild(demo);
      panel.appendChild(h('div', 'mq-model-cue', CT().CUE_LONG));
      ui.feedback.appendChild(panel);
    }
    if (q.worked) {
      const w = h('div', 'mq-worked-out');
      q.worked.forEach((line, i) => w.appendChild(h('div', 'mq-worked-line', '<span>' + (i + 1) + '</span>' + line)));
      ui.feedback.appendChild(w);
    } else {
      ui.feedback.appendChild(h('div', 'mq-fb-note', 'The answer was: ' + answerText(q)));
    }

    S.asked++;
    MQ().record(skill, { correct: false, type: q.type, hintsUsed: S.hintLevel ? 1 : 0, sig: q.sig });
    if (S.source === 'mission' && q.curated) MQ().completeActivity(S.missionId, q.id, false);
    S.results.push({ skill, correct: false, type: q.type });

    const on = h('button', 'mq-btn mq-btn-primary', 'Try a similar one');
    on.type = 'button';
    on.onclick = () => {
      injectSimilar(skill, q.sig);
      advance();
    };
    ui.foot.appendChild(on);
    on.focus();
  }

  function resWhy(res) { return res && res.value && res.value.why ? res.value.why : null; }

  function answerText(q) {
    if (q.answer != null) return q.answer + (q.unit ? ' ' + MQ().fmtUnit(q.unit) : '');
    if (q.choices) { const c = q.choices.find(x => x.correct); return c ? c.label : ''; }
    if (q.model) return q.model;
    return '';
  }

  /** A fresh, easier-shaped question on the same skill — never the same one. */
  function injectSimilar(skill, avoidSig) {
    if (S.injected >= 3) return;
    let q = null;
    for (let i = 0; i < 8; i++) {
      const cand = MQ().question(skill, { offset: i });
      if (cand && cand.sig !== avoidSig) { q = cand; break; }
    }
    if (!q) return;
    S.injected++;
    S.queue.splice(S.i + 1, 0, q);
  }

  function modelPicture(which) {
    const box = h('div', 'mq-model-pic');
    const cells = MQ().rectCells(4, 3);
    if (which === 'trace-border' || which === 'walk-around') {
      const d = AC().drawCells(cells, { cell: 26 });
      d.edgeNodes.forEach(e => e.line.classList.add('is-traced'));
      box.appendChild(d.svg);
      box.appendChild(h('p', 'mq-model-cap', 'Perimeter is the whole way round the edge: 4 + 3 + 4 + 3 = 14.'));
    } else if (which === 'shade-inside' || which === 'rows-columns') {
      const d = AC().drawCells(cells, { cell: 26 });
      Object.keys(d.cellNodes).forEach(k => d.cellNodes[k].classList.add('is-shaded'));
      box.appendChild(d.svg);
      box.appendChild(h('p', 'mq-model-cap', 'Area is every square inside: 3 rows of 4 = 12 squares.'));
    } else if (which === 'unit-card') {
      box.appendChild(h('div', 'mq-unit-model',
        '<div><b>cm</b><span>a line going around</span></div>' +
        '<div><b>cm&sup2;</b><span>squares covering a surface</span></div>'));
    } else if (which === 'compare-lab') {
      const row = h('div', 'mq-compare');
      [[6, 2], [4, 3]].forEach((d2, i) => {
        const c = MQ().rectCells(d2[0], d2[1]);
        const card = h('div', 'mq-compare-card');
        const d = AC().drawCells(c, { cell: 20 });
        card.appendChild(d.svg);
        card.appendChild(h('div', 'mq-compare-note',
          '<span class="mq-chip mq-chip-area">' + MQ().cellsArea(c) + ' inside</span>' +
          '<span class="mq-chip mq-chip-perimeter">' + MQ().cellsPerimeter(c) + ' around</span>'));
        row.appendChild(card);
      });
      box.appendChild(row);
      box.appendChild(h('p', 'mq-model-cap', 'Same 12 tiles, different borders.'));
    } else return null;
    return box;
  }

  function advance() {
    S.i++;
    S.shownFor = null;
    if (S.i >= S.queue.length || S.asked >= 10) finishSession();
    else render();
  }

  function finishSession() {
    if (S && S.asked) {
      MQ().logSession(S.asked, S.correct);
      MQ().checkBadges();
    }
    go('done');
  }

  /* ------------------------------------------------------------- done */

  function screenDone() {
    const wrap = h('div', 'mq-page mq-done');
    const n = S ? S.asked : 0, c = S ? S.correct : 0;
    wrap.appendChild(header('Well done', { backLabel: 'Home' }));

    const card = h('div', 'mq-card-main mq-done-card');
    card.appendChild(h('h2', 'mq-done-title', 'That is a good stint.'));
    card.appendChild(h('p', 'mq-done-sub',
      n ? 'You worked through <b>' + n + '</b> question' + (n === 1 ? '' : 's') + ' just now.'
        : 'Come back when you are ready.'));

    /* Effort, not marks. */
    const bits = [];
    if (S && S.hintsUsed) bits.push('You used a clue and then solved it — that is exactly what clues are for.');
    if (S && S.results.some(r => !r.correct)) bits.push('You corrected a mistake. Mistakes help detectives find the clue.');
    if (c === n && n > 0) bits.push('Every one right, and you explained your thinking as you went.');
    if (bits.length) card.appendChild(h('p', 'mq-done-note', bits.join(' ')));

    const secure = CT().skills.filter(s => MQ().isSecure(s.id));
    if (secure.length) {
      const sr = h('div', 'mq-secure-row');
      sr.appendChild(h('span', 'mq-secure-label', 'Secure so far:'));
      secure.forEach(s => sr.appendChild(h('span', 'mq-chip mq-chip-secure', s.short)));
      card.appendChild(sr);
    }

    const row = h('div', 'mq-hero-cta');
    const more = h('button', 'mq-btn mq-btn-primary', 'Keep going');
    more.type = 'button';
    more.onclick = () => {
      const next = nextMission();
      if (next) startMission(next.id); else startPractice();
    };
    row.appendChild(more);
    const home = h('button', 'mq-btn mq-btn-ghost', 'Stop for now');
    home.type = 'button';
    home.onclick = () => { S = null; go('home'); };
    row.appendChild(home);
    card.appendChild(row);
    wrap.appendChild(card);
    return wrap;
  }

  /* ====================================================================== */
  /*  DIAGNOSTIC                                                            */
  /* ====================================================================== */

  let D = null;
  function screenCheck() {
    const wrap = h('div', 'mq-page');
    wrap.appendChild(header('Let us see what you already know!', { backLabel: 'Skip this' }));

    if (!D) {
      D = { qs: MQ().diagnosticQuestions(), i: 0, results: [] };
      const intro = h('div', 'mq-card-main');
      intro.appendChild(h('h2', 'mq-done-title', 'This is not a test.'));
      intro.appendChild(h('p', 'mq-lede',
        'Eight quick things. There is no score and nothing is written down as right or wrong — ' +
        'it just helps us start you in the right place. You can skip it whenever you like.'));
      const row = h('div', 'mq-hero-cta');
      const go1 = h('button', 'mq-btn mq-btn-primary', 'I am ready');
      go1.type = 'button';
      go1.onclick = () => { D.started = true; render(); };
      row.appendChild(go1);
      const skip = h('button', 'mq-btn mq-btn-ghost', 'Skip it');
      skip.type = 'button';
      skip.onclick = () => { D = null; go('missions'); };
      row.appendChild(skip);
      intro.appendChild(row);
      wrap.appendChild(intro);
      D.started = false;
      return wrap;
    }
    if (!D.started) { D = null; return screenCheck(); }

    if (D.i >= D.qs.length) {
      const advice = MQ().diagnosticAdvice(D.results);
      MQ().get().diagnostic = { done: true, at: Date.now(), start: advice.start };
      MQ().save();
      const card = h('div', 'mq-card-main');
      card.appendChild(h('h2', 'mq-done-title', 'Thank you — that tells us a lot.'));
      card.appendChild(h('p', 'mq-lede', advice.note));
      if (advice.strong.length)
        card.appendChild(h('p', 'mq-done-note', 'You are already comfortable with: ' + advice.strong.join(', ') + '.'));
      card.appendChild(h('p', 'mq-lede', 'A good place to begin is <b>' + advice.startName + '</b>.'));
      const row = h('div', 'mq-hero-cta');
      const b = h('button', 'mq-btn mq-btn-primary', 'Start there');
      b.type = 'button';
      b.onclick = () => { const s = advice.start; D = null; startMission(s); };
      row.appendChild(b);
      const all = h('button', 'mq-btn mq-btn-ghost', 'Show me all the missions');
      all.type = 'button';
      all.onclick = () => { D = null; go('missions'); };
      row.appendChild(all);
      card.appendChild(row);
      wrap.appendChild(card);
      return wrap;
    }

    const q = D.qs[D.i];
    const dots = h('div', 'mq-dots');
    for (let i = 0; i < D.qs.length; i++)
      dots.appendChild(h('span', 'mq-dot' + (i < D.i ? ' is-done' : i === D.i ? ' is-now' : '')));
    wrap.appendChild(dots);

    const card = h('div', 'mq-card-main');
    wrap.appendChild(card);
    const stage = h('div', 'mq-stage');
    card.appendChild(stage);
    const foot = h('div', 'mq-foot');
    card.appendChild(foot);

    const act = AC().render(q, stage, {
      onSubmit: resp => step(resp),
      onProgress: () => { if (chk) chk.disabled = !(act.ready && act.ready()); }
    });
    let chk = null;
    if (!act.auto) {
      chk = h('button', 'mq-btn mq-btn-primary', 'Next');
      chk.type = 'button';
      chk.disabled = !(act.ready && act.ready());
      chk.onclick = () => step(act.collect());
      foot.appendChild(chk);
    }
    const skip = h('button', 'mq-btn mq-btn-ghost', 'I am not sure');
    skip.type = 'button';
    skip.onclick = () => step(null);
    foot.appendChild(skip);

    function step(resp) {
      const r = MQ().check(q, resp);
      D.results.push({ skill: q.skill, correct: r.correct });
      D.i++;
      render();
    }
    return wrap;
  }

  /* ====================================================================== */
  /*  PROGRESS                                                              */
  /* ====================================================================== */

  function screenProgress() {
    const wrap = h('div', 'mq-page');
    wrap.appendChild(header('My Progress'));
    const st = MQ().get();

    const top = h('div', 'mq-stats');
    const stat = (n, label) => {
      const d = h('div', 'mq-stat');
      d.appendChild(h('b', null, String(n)));
      d.appendChild(h('span', null, label));
      top.appendChild(d);
    };
    stat(MQ().secureCount() + ' / ' + CT().skills.length, 'Skills secure');
    stat(CT().missions.filter(m => st.missions[m.id].done).length + ' / ' + CT().missions.length, 'Missions done');
    stat(Object.keys(st.badges).length, 'Badges');
    stat(st.streak || 0, 'Day streak');
    wrap.appendChild(top);

    wrap.appendChild(h('h3', 'mq-h3', 'Badges'));
    const bg = h('div', 'mq-badges');
    CT().badges.forEach(b => {
      const got = !!st.badges[b.id];
      const card = h('div', 'mq-badge' + (got ? ' is-got' : ''));
      card.appendChild(AC().icon(got ? 'reveal' : 'square', 'mq-badge-icon'));
      card.appendChild(h('b', null, b.name));
      card.appendChild(h('span', null, got ? b.earn : b.how));
      bg.appendChild(card);
    });
    wrap.appendChild(bg);

    wrap.appendChild(h('h3', 'mq-h3', 'The ten skills'));
    const sk = h('div', 'mq-skills');
    CT().skills.forEach(s => {
      const lvl = MQ().level(s.id);
      const acc = MQ().accuracy(s.id);
      const row = h('div', 'mq-skill lvl-' + lvl);
      row.appendChild(h('span', 'mq-skill-dot', ['&#9675;', '&#9682;', '&#9681;', '&#9679;'][lvl]));
      const mid = h('div', 'mq-skill-mid');
      mid.appendChild(h('b', null, s.name));
      mid.appendChild(h('span', null, s.about));
      row.appendChild(mid);
      row.appendChild(h('span', 'mq-skill-state',
        ['not met', 'just met', 'getting it', 'secure'][lvl] +
        (acc != null ? ' &middot; ' + Math.round(acc * 100) + '%' : '')));
      if (lvl < 3 && st.skills[s.id].attempts > 0) {
        const b = h('button', 'mq-btn mq-btn-ghost mq-btn-sm', 'Five on this');
        b.type = 'button';
        b.onclick = () => startPracticeSet(s.id);
        row.appendChild(b);
      }
      sk.appendChild(row);
    });
    wrap.appendChild(sk);
    return wrap;
  }

  /* ====================================================================== */
  /*  GROWN-UP CORNER                                                       */
  /* ====================================================================== */

  function screenGrown() {
    const wrap = h('div', 'mq-page mq-grown');
    wrap.appendChild(header('Grown-up Corner'));
    wrap.appendChild(h('p', 'mq-lede',
      'What is going well, what is not, and what to say next. Written for the adult sitting beside her.'));

    const st = MQ().get();
    const tabs = h('div', 'mq-tabs');
    const panes = h('div', 'mq-panes');
    const defs = [
      ['Progress', paneProgress],
      ['Teach with me', paneTeach],
      ['Home activities', paneHome],
      ['Worksheets', paneSheets]
    ];
    let active = 0;
    defs.forEach((d, i) => {
      const b = h('button', 'mq-tab' + (i === 0 ? ' is-on' : ''), d[0]);
      b.type = 'button';
      b.onclick = () => {
        active = i;
        Array.from(tabs.children).forEach((x, j) => x.classList.toggle('is-on', j === i));
        panes.innerHTML = '';
        panes.appendChild(defs[i][1]());
      };
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);
    panes.appendChild(defs[0][1]());
    wrap.appendChild(panes);
    return wrap;

    function paneProgress() {
      const p = h('div', 'mq-pane');
      const done = CT().missions.filter(m => st.missions[m.id].done);
      const secure = CT().skills.filter(s => MQ().isSecure(s.id));
      const developing = CT().skills.filter(s => !MQ().isSecure(s.id) && st.skills[s.id].attempts > 0);
      const hints = CT().skills.reduce((n, s) => n + st.skills[s.id].hints, 0);

      p.appendChild(h('h3', 'mq-h3', 'Where she is'));
      const g = h('div', 'mq-grid2');
      g.appendChild(kv('Missions completed', done.length + ' of ' + CT().missions.length +
        (done.length ? ' — ' + done.map(m => m.name).join(', ') : '')));
      g.appendChild(kv('Skills secure', secure.length ? secure.map(s => s.name).join(', ') : 'none yet'));
      g.appendChild(kv('Still developing', developing.length ? developing.map(s => s.name).join(', ') : '—'));
      g.appendChild(kv('Hints used', String(hints) + ' — using a hint is encouraged here, not penalised'));
      p.appendChild(g);

      p.appendChild(h('h3', 'mq-h3', 'Accuracy by skill'));
      const tbl = h('div', 'mq-table');
      CT().skills.forEach(s => {
        const a = MQ().accuracy(s.id);
        const att = st.skills[s.id].attempts;
        const row = h('div', 'mq-trow');
        row.appendChild(h('span', 'mq-tname', s.name));
        const bar = h('span', 'mq-tbar');
        bar.innerHTML = '<i style="width:' + (a == null ? 0 : Math.round(a * 100)) + '%"></i>';
        row.appendChild(bar);
        row.appendChild(h('span', 'mq-tval', att ? Math.round(a * 100) + '% of ' + att : 'not started'));
        tbl.appendChild(row);
      });
      p.appendChild(tbl);

      const miscs = MQ().topMisconceptions(4);
      p.appendChild(h('h3', 'mq-h3', 'What she is actually getting wrong'));
      if (!miscs.length) p.appendChild(h('p', 'mq-lede', 'Nothing has come up often enough to report yet.'));
      else {
        const ul = h('div', 'mq-misc');
        miscs.forEach(m => {
          const row = h('div', 'mq-misc-row');
          row.appendChild(h('b', null, m.info.label + ' <span>&times;' + m.n + '</span>'));
          row.appendChild(h('span', null, 'Say this: &ldquo;' + m.info.say + '&rdquo;'));
          ul.appendChild(row);
        });
        p.appendChild(ul);
      }

      const weak = MQ().weakSkills();
      p.appendChild(h('h3', 'mq-h3', 'Helpful next activity'));
      if (weak.length) {
        const w = weak[0];
        const box = h('div', 'mq-next');
        box.appendChild(h('p', null, '<b>' + (CT().skill(w.id) || {}).name + '</b> is the weakest right now (' +
          Math.round(w.acc * 100) + '% of ' + w.attempts + '). A five-question set on just that skill will help most.'));
        const b = h('button', 'mq-btn mq-btn-primary mq-btn-sm', 'Start those five');
        b.type = 'button';
        b.onclick = () => startPracticeSet(w.id);
        box.appendChild(b);
        p.appendChild(box);
      } else {
        p.appendChild(h('p', 'mq-lede',
          'Nothing is lagging. The next mission in order is the best use of the time.'));
      }

      p.appendChild(h('h3', 'mq-h3', 'Recent sessions'));
      const ss = st.sessions.slice(-8).reverse();
      if (!ss.length) p.appendChild(h('p', 'mq-lede', 'No sessions yet.'));
      else {
        const list = h('div', 'mq-sessions');
        ss.forEach(x => list.appendChild(h('div', 'mq-session',
          '<b>' + x.day + '</b><span>' + x.n + ' questions, ' + x.correct + ' right first time</span>')));
        p.appendChild(list);
      }
      return p;
    }

    function kv(k, v) {
      const d = h('div', 'mq-kv');
      d.appendChild(h('b', null, k));
      d.appendChild(h('span', null, v));
      return d;
    }

    function paneTeach() {
      const p = h('div', 'mq-pane');
      p.appendChild(h('p', 'mq-lede',
        'Short things to say out loud. Her answer tells you which way to go next — that is the useful part, ' +
        'not whether she got it right.'));
      CT().teachScripts.forEach(t => {
        const c = h('div', 'mq-script');
        c.appendChild(h('span', 'mq-script-skill', (CT().skill(t.skill) || {}).short || ''));
        c.appendChild(h('p', 'mq-script-say', '&ldquo;' + t.say + '&rdquo;'));
        const g = h('div', 'mq-script-branch');
        g.appendChild(h('div', 'mq-branch is-ok', '<b>If she gets it</b><span>' + t.ifRight + '</span>'));
        g.appendChild(h('div', 'mq-branch is-no', '<b>If she does not</b><span>' + t.ifWrong + '</span>'));
        c.appendChild(g);
        c.appendChild(h('p', 'mq-script-then', '<b>Then:</b> ' + t.then));
        p.appendChild(c);
      });
      return p;
    }

    function paneHome() {
      const p = h('div', 'mq-pane');
      p.appendChild(h('p', 'mq-lede',
        'Eight activities using things already in the house. Nothing sharp, nothing outdoors on her own.'));
      const grid = h('div', 'mq-cards');
      CT().homeCards.forEach(c => {
        const card = h('div', 'mq-homecard');
        card.appendChild(h('h4', null, c.title));
        card.appendChild(h('div', 'mq-hc-row', '<b>You need</b><span>' + c.need + '</span>'));
        card.appendChild(h('div', 'mq-hc-row', '<b>You say</b><span>&ldquo;' + c.say + '&rdquo;</span>'));
        card.appendChild(h('div', 'mq-hc-row', '<b>She does</b><span>' + c.does + '</span>'));
        card.appendChild(h('div', 'mq-hc-row', '<b>The point</b><span>' + c.learns + '</span>'));
        card.appendChild(h('div', 'mq-hc-row', '<b>Then ask</b><span>' + c.ask + '</span>'));
        grid.appendChild(card);
      });
      p.appendChild(grid);
      const pr = h('button', 'mq-btn mq-btn-ghost', 'Print these cards');
      pr.type = 'button';
      pr.onclick = () => window.print();
      p.appendChild(pr);
      return p;
    }

    function paneSheets() {
      const p = h('div', 'mq-pane');
      p.appendChild(h('p', 'mq-lede',
        'A printable A4 worksheet with a separate answer key. Each one is built from a seed, so the same ' +
        'link always prints the same sheet — handy if you want to print it twice.'));
      const kinds = MQ().sheetKinds;
      const grid = h('div', 'mq-sheetgrid');
      Object.keys(kinds).forEach(k => {
        const b = h('button', 'mq-sheet');
        b.type = 'button';
        b.appendChild(h('b', null, kinds[k].name));
        b.appendChild(h('span', null, k === 'weak' ? 'Built from what she is getting wrong right now'
          : '12 questions with a full answer key'));
        b.onclick = () => {
          const seed = Math.floor(Math.random() * 900000) + 1000;
          let url = 'worksheets/mq-worksheet.html?kind=' + k + '&seed=' + seed;
          if (k === 'weak') {
            const w = MQ().weakSkills().slice(0, 3).map(x => x.id).join(',');
            url += '&skills=' + encodeURIComponent(w);
          }
          window.open(url, '_blank');
        };
        grid.appendChild(b);
      });
      p.appendChild(grid);
      return p;
    }
  }

  /* ====================================================================== */
  /*  RENDER                                                                */
  /* ====================================================================== */

  function render(arg) {
    if (!root) return;
    root.innerHTML = '';
    let node;
    switch (screen) {
      case 'missions': node = screenMissions(); break;
      case 'run': node = screenRun(); break;
      case 'done': node = screenDone(); break;
      case 'check': node = screenCheck(); break;
      case 'progress': node = screenProgress(); break;
      case 'grown': node = screenGrown(); break;
      default: node = screenHome();
    }
    root.appendChild(node);
  }

  function boot(mount) {
    root = typeof mount === 'string' ? $(mount) : mount;
    if (!root) return;
    MQ().init();
    screen = 'home';          /* booting always lands on the front screen */
    S = null;
    render();
  }

  window.MQUI = { boot, go, render, startMission, startPractice, startChallenge, startPracticeSet,
    get session() { return S; } };
})();

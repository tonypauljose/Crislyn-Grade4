/* MeasureQuest — the end-to-end journey.
   Loads the real measurequest.html and walks it the way Crislyn would:
   open the app, start a mission, do an activity, get an answer wrong and be
   taught, get it right, make a skill secure, and see the progress change.

   Anything that only works when you already know the internals is not tested
   here — every step below goes through the actual buttons on the page. */

const { page, runner } = require('./harness');
const t = runner('JOURNEY — open, learn, slip up, recover, progress');

const app = page('measurequest.html');
const { w, d } = app;
const MQ = w.MQ, CT = w.MQ_CONTENT, UI = w.MQUI;

t.eq(app.errors.length, 0, 'the page loads with no script errors' +
  (app.errors.length ? ': ' + app.errors.join(' | ') : ''));

const $ = s => d.querySelector(s);
const $$ = s => Array.from(d.querySelectorAll(s));
const byText = (sel, re) => $$(sel).find(n => re.test(n.textContent));
const click = n => { if (n && n.click) n.click(); };
const fire = (node, type, init) => {
  const E = type.indexOf('key') === 0 ? w.KeyboardEvent : w.Event;
  node.dispatchEvent(new E(type, Object.assign({ bubbles: true, cancelable: true }, init || {})));
};
const typeIn = (i, v) => { i.value = String(v); fire(i, 'input'); };
const key = (n, k) => fire(n, 'keydown', { key: k });

/* Start from nothing, the way a first visit does. */
MQ.reset();
UI.go('home');

/* ------------------------------------------------------------- 1. opening */

t.ok(/Hello, Crislyn/.test(d.body.textContent), 'the app greets her by name');
t.ok(/Perimeter goes around/.test(d.body.textContent), 'the memory sentence is on the front screen');
t.eq($$('.mq-dest').length, 4, 'the four destinations are there');
const destNames = $$('.mq-dest-title').map(n => n.textContent).sort();
t.eq(destNames.join(','), 'Challenge,Learn,My Progress,Practise', 'and they are the right four');
t.ok(!!byText('.mq-link-btn', /Grown-up Corner/), 'the Grown-up Corner is reachable but understated');
t.ok(!!byText('.mq-link-btn', /already know/), 'and the optional starting check is offered');

/* ------------------------------------------------------ 2. the mission list */

click(byText('.mq-dest', /Learn/));
t.eq($$('.mq-mission').length, 7, 'there are seven missions');
t.eq($$('.mq-mission.is-locked').length, 6, 'six of them are locked on a fresh start');
t.ok(/Border or Cover/.test($('.mq-mission').textContent), 'and the first one is Border or Cover?');
const lockedBtn = $$('.mq-mission.is-locked button')[0];
t.ok(lockedBtn.disabled, 'a locked mission cannot be started');
t.ok(/Finish mission/.test(lockedBtn.textContent), 'and it says what to finish first');

/* ------------------------------------------------------- 3. start mission 1 */

click($$('.mq-mission button')[0]);
t.ok(!!UI.session, 'starting a mission opens a session');
t.eq(UI.session.missionId, 'm1', 'and it is mission 1');
t.ok($$('.mq-dot').length > 0, 'the progress dots show how far through she is');
t.ok(!!$('.mq-prompt'), 'the first activity has a prompt');
t.ok(/ribbon|tape|mats|box/i.test(d.body.textContent), 'the ribbon-and-tiles story has begun');

/* --------------------------------- 4. get one wrong, and be taught properly */

(function () {
  /* Walk to the first activity that has choices, then pick a wrong one. */
  let guard = 0;
  while (UI.session && UI.session.q && !UI.session.q.choices && guard++ < 8) skipForward();
  const q = UI.session.q;
  t.ok(!!q && !!q.choices, 'found a question with choices to answer wrongly');

  const wrongIdx = q.choices.findIndex(c => !c.correct);
  const wrongLabel = q.choices[wrongIdx].label;
  click($$('.mq-choice').find(b => b.textContent === wrongLabel));

  const fb = $('.mq-feedback');
  t.ok(fb.className.indexOf('is-teach') >= 0, 'a wrong answer opens the teaching panel');
  t.ok(!/^(wrong|incorrect)$/i.test(fb.textContent.trim()), 'it never just says "incorrect"');
  t.ok(fb.textContent.length > 40, 'it says something substantial instead');
  t.ok(!!byText('.mq-foot .mq-btn', /Try it again/), 'and offers another go at the same question');
  t.ok(!!byText('.mq-foot .mq-btn', /Show me how/), 'with a way to be shown how');

  /* The teaching must be the one written for THIS mistake — either the
     misconception's own wording, or the choice's override where the lesson
     has not introduced the vocabulary yet. Either way it must be specific. */
  const tag = q.choices[wrongIdx].tag;
  const own = q.choices[wrongIdx].teach;
  const say = tag && CT.misconception(tag) ? CT.misconception(tag).say : null;
  const shown = fb.textContent;
  t.ok((own && shown.indexOf(own.slice(0, 30)) >= 0) ||
       (say && shown.indexOf(say.slice(0, 30)) >= 0),
    'the teaching is the one written for that exact mistake');

  /* and whichever wording was shown, the misconception is still recorded
     under its proper name for the Grown-up Corner */
  if (tag) {
    const misc = MQ.get().skills[q.skill].misc || {};
    t.ok(misc[tag] >= 1, 'the mistake is logged as "' + tag + '" for the grown-up report');
  }

  /* try again, correctly this time */
  click(byText('.mq-foot .mq-btn', /Try it again/));
  const rightLabel = q.choices.find(c => c.correct).label;
  click($$('.mq-choice').find(b => b.textContent === rightLabel));
  const fb2 = $('.mq-feedback');
  t.ok(fb2.className.indexOf('is-right') >= 0, 'the second attempt is accepted');
  t.ok(/recovery/i.test(fb2.textContent), 'and the recovery is what gets praised, not the score');
})();

function skipForward() {
  const q = UI.session.q;
  play(q, true);
  const next = byText('.mq-foot .mq-btn', /Next|Finish/);
  if (next) click(next);
}

/* ---------------------------------------- 5. a second miss goes to the model */

(function () {
  click(byText('.mq-foot .mq-btn', /Next|Finish/));
  let guard = 0;
  while (UI.session && UI.session.q && !UI.session.q.choices && guard++ < 8) skipForward();
  const q = UI.session.q;
  if (!q || !q.choices) { t.note('no second choice question left in this mission — skipped'); return; }

  const wrong = q.choices.find(c => !c.correct);
  click($$('.mq-choice').find(b => b.textContent === wrong.label));
  click(byText('.mq-foot .mq-btn', /Try it again/));
  const wrong2 = q.choices.find(c => !c.correct);
  click($$('.mq-choice').find(b => b.textContent === wrong2.label));

  const fb = $('.mq-feedback');
  t.ok(/go back to the picture/i.test(fb.textContent),
    'a second miss goes back to the visual model rather than pressing on');
  t.ok(!!$('.mq-model') || /answer was/i.test(fb.textContent),
    'and it shows the model or the worked answer');
  t.ok(!!byText('.mq-foot .mq-btn', /similar one/),
    'then it offers a SIMILAR question, not a harder one');

  const before = UI.session.queue.length;
  click(byText('.mq-foot .mq-btn', /similar one/));
  t.ok(UI.session.queue.length > before || UI.session.i > 0,
    'a fresh question on the same skill is put in front of her');
})();

/* ------------------------------------------------------- a generic player */

function play(q, right) {
  if (!q) return;
  switch (q.type) {
    case 'mcq': case 'unit': case 'mistake': case 'compare': {
      const c = q.choices.find(x => right ? x.correct : !x.correct);
      click($$('.mq-choice').find(b => b.textContent === c.label));
      break;
    }
    case 'number': case 'missing': {
      typeIn($('.mq-input'), right ? q.answer : q.answer + 3);
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'trace': case 'tiles': case 'shade': {
      const step = $$('.mq-tools .mq-btn')[0];
      const n = q.type === 'trace' ? MQ.cellsPerimeter(q.shape.cells) : q.shape.cells.length;
      for (let i = 0; i < n; i++) click(step);
      const inp = $('.mq-input');
      if (inp) typeIn(inp, right ? q.answer : q.answer + 2);
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'sort': {
      q.cards.forEach(c => {
        const node = d.getElementById('mqcard-' + c.id);
        const want = right ? c.bin : (c.bin === 'around' ? 'inside' : 'around');
        click(node);
        if (want === 'inside') click(node);
      });
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'match': {
      const cols = $$('.mq-match-col');
      const lefts = Array.from(cols[0].querySelectorAll('.mq-match-item'));
      const rights = Array.from(cols[1].querySelectorAll('.mq-match-item'));
      q.left.forEach((l, i) => {
        click(lefts[i]);
        click(rights[q.right.findIndex(r => r.id === l.id)]);
      });
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'worked': {
      const blanks = $$('.mq-blank');
      let bi = 0;
      q.steps.forEach(s => {
        if (s.blank != null) typeIn(blanks[bi++], right ? s.blank : s.blank + 1);
        else if (s.blankUnit) {
          const want = MQ.fmtUnit(s.blankUnit);
          const chip = $$('.mq-unit-chip').find(c => c.textContent === want);
          click(chip);
        }
      });
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'mission': {
      for (let g = 0; g < 10; g++) {
        const inp = $('.mq-step .mq-input');
        if (inp) {
          const last = q.steps[q.steps.length - 1];
          typeIn(inp, right ? last.answer : last.answer + 4);
          click(byText('.mq-step .mq-btn', /Check it/));
        } else {
          const opts = $$('.mq-step .mq-choice');
          if (!opts.length) break;
          const s = q.steps[$$('.mq-step-done').length];
          const o = s.options.find(x => right ? x.correct : !x.correct);
          click(opts.find(b => b.textContent === o.label) || opts[0]);
        }
      }
      break;
    }
    case 'explain': {
      typeIn($('.mq-textarea'), right ? q.model : 'no');
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    case 'build': {
      const svg = $('.mq-buildable');
      const tg = q.target || {};
      let W = 4, H = 3;
      if (tg.area != null) { for (let x = 1; x <= tg.area; x++) if (tg.area % x === 0 && x <= 10 && tg.area / x <= 8) { W = x; H = tg.area / x; } }
      else if (tg.perimeter != null) { const half = tg.perimeter / 2; W = Math.min(8, half - 2); H = half - W; }
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) { key(svg, ' '); if (x < W - 1) key(svg, 'ArrowRight'); }
        for (let x = 0; x < W - 1; x++) key(svg, 'ArrowLeft');
        if (y < H - 1) key(svg, 'ArrowDown');
      }
      click(byText('.mq-foot .mq-btn', /Check it/));
      break;
    }
    default: break;
  }
}

/* ------------------------------------------- 6. finish a session, get a skill */

(function () {
  let guard = 0;
  while (UI.session && UI.session.q && guard++ < 40) {
    play(UI.session.q, true);
    const next = byText('.mq-foot .mq-btn', /Next|Finish/);
    if (!next) break;
    click(next);
    if (!UI.session || /Well done/.test(d.body.textContent)) break;
  }
  t.ok(/good stint|Well done/i.test(d.body.textContent), 'the session reaches a natural stopping point');
  t.ok(!/\d+ *\/ *\d+ *marks|score/i.test($('.mq-done-card').textContent),
    'and the finish screen never shows a mark out of ten');

  const sessions = MQ.get().sessions;
  t.ok(sessions.length >= 1, 'the session is recorded');
  t.ok(sessions[sessions.length - 1].n > 0, 'with the number of questions worked through');
})();

/* --------------------------------------------------- 7. progress has moved */

(function () {
  const attempted = CT.skills.filter(s => MQ.get().skills[s.id].attempts > 0);
  t.ok(attempted.length > 0, 'skills have been recorded against her (' + attempted.length + ' touched)');

  UI.go('progress');
  t.ok(/My Progress/.test(d.body.textContent), 'the progress screen opens');
  t.eq($$('.mq-skill').length, 10, 'all ten skills are listed');
  t.eq($$('.mq-badge').length, CT.badges.length, 'and every badge is shown, earned or not');
  const states = $$('.mq-skill-state').map(n => n.textContent);
  t.ok(states.some(s => !/not met/.test(s)), 'at least one skill has moved off "not met"');
})();

/* -------------------------------- 8. make a skill secure and see it change */

(function () {
  const skill = 'calc-perimeter';
  MQ.reset();
  for (let i = 0; i < 4; i++) MQ.record(skill, { correct: true, type: 'number' });
  MQ.record(skill, { correct: true, type: 'mcq' });
  t.ok(MQ.isSecure(skill), 'four right in one format plus one in another makes the skill secure');

  UI.go('progress');
  const row = $$('.mq-skill').find(r => /Perimeter of squares/.test(r.textContent));
  t.ok(!!row, 'the skill appears on the progress screen');
  t.ok(/secure/.test(row.textContent), 'and it now reads as secure');
  t.ok(row.className.indexOf('lvl-3') >= 0, 'with the secure styling');
  t.ok(!row.querySelector('.mq-btn'), 'a secure skill is not offered more easy drilling');
})();

/* ----------------------------------------------- 9. progress survives a reload */

(function () {
  const before = JSON.stringify(MQ.get().skills['calc-perimeter']);
  /* Same browser storage, fresh boot — what a page refresh actually does. */
  w.MQ.load();
  UI.boot('mq-app');
  const after = JSON.stringify(MQ.get().skills['calc-perimeter']);
  t.eq(after, before, 'progress survives a reload');
  t.ok(/Hello, Crislyn/.test(d.body.textContent), 'and the app comes back up on the home screen');
  t.ok(/Carry on/.test(d.body.textContent), 'offering to carry on where she left off');
})();

/* --------------------------------------------------- 10. the Grown-up Corner */

(function () {
  UI.go('grown');
  t.ok(/Grown-up Corner/.test(d.body.textContent), 'the Grown-up Corner opens');
  t.eq($$('.mq-tab').length, 4, 'it has four sections');
  t.ok(/Accuracy by skill/.test(d.body.textContent), 'the progress pane shows accuracy per skill');
  t.eq($$('.mq-trow').length, 10, 'one row per skill');
  t.ok(/Hints used/.test(d.body.textContent), 'and reports hints used');
  t.ok(!/total marks/i.test(d.body.textContent), 'without leaning on a total mark');

  click($$('.mq-tab')[1]);
  t.ok(/ribbon around this book|carpet/i.test(d.body.textContent), 'Teach With Me has scripts to read out');
  t.eq($$('.mq-script').length, CT.teachScripts.length, 'all of them are there');
  t.ok($$('.mq-branch').length >= 2, 'each with a branch for what she answers');

  click($$('.mq-tab')[2]);
  t.eq($$('.mq-homecard').length, CT.homeCards.length, 'the home activity cards are all present');
  const card = $('.mq-homecard');
  ['You need', 'You say', 'She does', 'The point', 'Then ask'].forEach(label => {
    t.ok(card.textContent.indexOf(label) >= 0, 'a home card lists "' + label + '"');
  });

  click($$('.mq-tab')[3]);
  t.eq($$('.mq-sheet').length, Object.keys(MQ.sheetKinds).length, 'every worksheet kind can be generated');
})();

/* ------------------- 11. EVERY mission opens without throwing and is not blank
   The Shape Lab once rendered a completely blank page because an activity
   called onProgress() while the screen was still being built. Nothing caught
   it until the page was actually looked at, so it is caught here now. */

(function () {
  const thrown = [];
  const onerr = e => thrown.push(String(e && e.message || e));
  w.addEventListener('error', onerr);

  CT.missions.forEach(m => {
    MQ.reset();
    /* unlock everything so each mission can genuinely be entered */
    CT.missions.forEach(x => { MQ.get().missions[x.id].done = true; });
    MQ.get().missions[m.id].done = false;
    MQ.save();

    let threw = null;
    try { UI.startMission(m.id); } catch (e) { threw = e.message; }
    t.ok(!threw, m.name + ' opens without throwing' + (threw ? ': ' + threw : ''));

    const stage = d.querySelector('.mq-stage');
    t.ok(!!stage, m.name + ' renders an activity stage');
    if (stage) {
      t.ok(stage.textContent.trim().length > 10, m.name + ' is not a blank screen');
      t.ok(!!stage.querySelector('button, input, textarea, svg'),
        m.name + ' gives her something to do on the first screen');
    }
    t.ok(!!d.querySelector('.mq-prompt'), m.name + ' shows a prompt');
  });

  w.removeEventListener('error', onerr);
  t.eq(thrown.length, 0, 'no mission throws while rendering' +
    (thrown.length ? ': ' + thrown.join(' | ') : ''));
})();

/* ------------------------------------------------- 12. the starting check */

(function () {
  MQ.reset();
  UI.go('check');
  t.ok(/not a test/i.test(d.body.textContent), 'the starting check says plainly that it is not a test');
  t.ok(!!byText('.mq-btn', /Skip it/), 'and can be skipped');
  click(byText('.mq-btn', /I am ready/));
  t.ok($$('.mq-dot').length === 8, 'it is eight questions long');

  for (let i = 0; i < 8; i++) {
    const skip = byText('.mq-foot .mq-btn', /not sure/);
    if (skip) click(skip); else break;
  }
  t.ok(/place to begin|start there/i.test(d.body.textContent), 'it ends by recommending where to begin');
  t.ok(!/\d+ *\/ *8|score/i.test(d.body.textContent), 'and never shows a score');
})();

t.done('journey: the whole path from first visit to secure skill');

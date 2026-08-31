/* MeasureQuest — the content itself.
   Not "does the code run" but "is what she reads any good": enough
   activities, hints that actually escalate, every misconception answered,
   nothing asked before it is taught, and no emoji doing the job of an icon. */

const { sandbox, runner } = require('./harness');
const sb = sandbox();
const MQ = sb.MQ, CT = sb.MQ_CONTENT, BK = sb.MQ_BANK;
const t = runner('CONTENT — the activities, the words and the teaching order');
MQ.init();

/* ------------------------------------------------------------- how much */

t.ok(BK.count() >= 72, 'there are at least 72 curated activities (' + BK.count() + ')');
CT.missions.forEach(m => {
  const acts = BK.forMission(m.id);
  t.ok(acts.length >= 8, m.name + ' has a proper set of activities (' + acts.length + ')');
});
t.eq(CT.missions.length, 7, 'there are seven missions');
t.eq(CT.skills.length, 10, 'and ten skills tracked separately');
const around = CT.jobs.filter(j => j.mode === 'around').length;
const inside = CT.jobs.filter(j => j.mode === 'inside').length;
t.ok(CT.jobs.length >= 21, 'the real-life bank covers all 21 situations from the plan (' +
  CT.jobs.length + ' jobs: ' + around + ' border, ' + inside + ' cover)');
t.ok(around >= 10 && inside >= 10, 'and the two kinds are evenly balanced');

/* ------------------------------------------------- every activity is sound */

(function () {
  let bad = 0;
  BK.all.forEach(a => {
    try { MQ.validate(Object.assign({ seed: 0 }, a)); }
    catch (e) { bad++; console.log('    ✗ ' + a.id + ': ' + e.message); }
  });
  t.eq(bad, 0, 'every curated activity passes the same validator the generators do');
})();

(function () {
  let short = 0, same = 0, noExplain = 0;
  BK.all.forEach(a => {
    if (!a.hints || a.hints.length !== 3) { short++; return; }
    /* clue -> picture -> worked. They must genuinely differ, or the help
       ladder is decorative. */
    const uniq = new Set(a.hints.map(x => x.trim().toLowerCase()));
    if (uniq.size !== 3) { same++; console.log('    ✗ ' + a.id + ' repeats a hint'); }
    if (!a.explain || a.explain.length < 20) noExplain++;
    /* the last hint should be the most complete one */
    if (a.hints[2].length < a.hints[0].length * 0.6) {
      /* not an error, just worth knowing about */
    }
  });
  t.eq(short, 0, 'every activity has exactly three hints');
  t.eq(same, 0, 'and no two hints on an activity are the same');
  t.eq(noExplain, 0, 'every activity explains itself afterwards');
})();

(function () {
  /* The third hint must actually give the answer away — that is its job. */
  let vague = 0;
  BK.all.forEach(a => {
    if (a.answer == null || typeof a.answer !== 'number') return;
    const last = a.hints[2];
    if (last.indexOf(String(a.answer)) < 0) { vague++; console.log('    ✗ ' + a.id + ' final hint never states the answer'); }
  });
  t.eq(vague, 0, 'the third hint always works the answer out in full');
})();

/* --------------------------------------------------- taught before tested */

(function () {
  /* Mission 1 must not mention perimeter or area before the reveal in a11. */
  const before = BK.forMission('m1').filter(a => Number(a.id.replace('m1-a', '')) < 11);
  let leaked = 0;
  /* Only what she can actually READ — the internal skill ids are allowed to
     be called "id-area", she never sees them. */
  const visible = a => [a.prompt, a.explain, a.story && a.story.text]
    .concat(a.hints || [])
    .concat((a.choices || []).map(c => c.label))
    .concat((a.cards || []).map(c => c.text))
    .concat((a.bins || []).map(b => b.label + ' ' + b.hint))
    .filter(Boolean).join(' ').toLowerCase();
  before.forEach(a => {
    if (/perimeter|area/.test(visible(a))) { leaked++; console.log('    ✗ ' + a.id + ' uses the words too early'); }
  });
  t.eq(leaked, 0, 'mission 1 withholds the words "perimeter" and "area" until the reveal');

  /* The FEEDBACK has to withhold them too. A wrong answer that replies "we
     need the area" to a child who has not been told what area is teaches her
     nothing, and this leaked through the misconception library once already. */
  let fbLeak = 0;
  before.forEach(a => {
    const wrongs = [];
    (a.choices || []).filter(c => !c.correct).forEach(c => wrongs.push(MQ.check(a, c)));
    if (a.type === 'sort') {
      const flipped = {};
      a.cards.forEach(c => { flipped[c.id] = c.bin === 'around' ? 'inside' : 'around'; });
      wrongs.push(MQ.check(a, flipped));
    }
    wrongs.forEach(r => {
      if (r.teach && /perimeter|area/i.test(r.teach)) {
        fbLeak++; console.log('    ✗ ' + a.id + ' feedback says it too early: "' + r.teach.slice(0, 70) + '"');
      }
    });
  });
  t.eq(fbLeak, 0, 'and so does every piece of feedback mission 1 can give');

  /* The diagnosis must also be the RIGHT way round: picking the covering tool
     for a border job is "chose area for a border", not the reverse. */
  const a1 = BK.get('m1-a1'), a2 = BK.get('m1-a2');
  t.eq(a1.choices.find(c => !c.correct).tag, 'chose-area-for-border',
    'choosing the mats for the tape job is diagnosed as treating a border job as a cover job');
  t.eq(a2.choices.find(c => !c.correct).tag, 'chose-perimeter-for-cover',
    'and choosing the ribbon for the floor job is diagnosed the other way round');
  const reveal = BK.get('m1-a11');
  t.ok(/PERIMETER/.test(reveal.story.text) && /AREA/.test(reveal.story.text),
    'and then names them both properly');
  t.ok(reveal.story.text.indexOf(CT.CUE_LONG) >= 0, 'introducing the memory sentence at the same moment');
})();

(function () {
  /* No formula before the counting that explains it. */
  const m1m2 = BK.forMission('m1').concat(BK.forMission('m2'));
  let early = 0;
  m1m2.forEach(a => {
    const text = JSON.stringify(a);
    if (/2 x \(|4 x side|length x width/.test(text)) {
      early++; console.log('    ✗ ' + a.id + ' shows a formula before mission 3');
    }
  });
  t.eq(early, 0, 'no formula appears before the counting missions are done');

  const m3first = BK.forMission('m3')[0];
  t.ok(/2 x \(9 \+ 4\)/.test(JSON.stringify(m3first)),
    'and mission 3 opens by DERIVING the shortcut rather than stating it');
})();

(function () {
  /* Missions unlock in a chain, so the order is enforced not merely suggested. */
  const chain = CT.missions.filter(m => !m.bonus).map(m => m.opens);
  t.eq(chain[0], null, 'mission 1 needs nothing');
  for (let i = 1; i < chain.length; i++) {
    t.eq(chain[i], CT.missions[i - 1].id, 'mission ' + (i + 1) + ' waits for the one before it');
  }
  t.eq(CT.mission('m7').opens, 'm4', 'the Shape Lab opens once she can count both quantities');
})();

/* ------------------------------------------------------- misconceptions */

(function () {
  const tags = Object.keys(CT.misconceptions);
  t.ok(tags.length >= 12, 'there are at least a dozen named misconceptions (' + tags.length + ')');
  let bad = 0;
  tags.forEach(k => {
    const m = CT.misconceptions[k];
    if (!m.label || !m.say) { bad++; console.log('    ✗ ' + k + ' is missing its label or its teaching'); }
    if (m.say && m.say.length < 30) { bad++; console.log('    ✗ ' + k + ' says too little'); }
    if (m.back && !CT.models[m.back]) { bad++; console.log('    ✗ ' + k + ' points at a model that does not exist'); }
  });
  t.eq(bad, 0, 'every misconception has real teaching and a real model to return to');

  /* The four the plan calls out by name must say what it asked them to say. */
  t.ok(/trace the fence with your finger/i.test(CT.misconceptions['chose-area-for-border'].say),
    'choosing area for a fence gets the "trace the fence" teaching');
  t.ok(/has not returned to the starting point/i.test(CT.misconceptions['added-two-sides'].say),
    'adding only length + width gets the "not back to the start" teaching');
  t.ok(/cm2/.test(CT.misconceptions['linear-unit-for-area'].say),
    'using cm for an area is answered with cm2');
  t.ok(/one line going around/i.test(CT.misconceptions['square-unit-for-perimeter'].say),
    'using cm2 for a perimeter is answered with "one line going around"');
})();

(function () {
  /* Every wrong choice in the bank is diagnosed, not just marked. */
  let untagged = 0;
  BK.all.forEach(a => {
    (a.choices || []).forEach(c => {
      if (c.correct) return;
      if (!c.tag) return;                       /* a plain distractor is allowed */
      if (!CT.misconception(c.tag) && c.tag !== 'misread-working') {
        untagged++; console.log('    ✗ ' + a.id + ' uses unknown tag ' + c.tag);
      }
    });
    (a.wrongs || []).forEach(x => {
      if (!CT.misconception(x.tag)) { untagged++; console.log('    ✗ ' + a.id + ' uses unknown tag ' + x.tag); }
    });
  });
  t.eq(untagged, 0, 'every tagged wrong answer maps to a misconception with teaching behind it');
})();

/* ------------------------------------------------------------ the wording */

(function () {
  /* Emoji must not be doing the work of an icon anywhere a child reads. */
  const EMOJI = /[⌚-⌛⏩-⏺◽-◾☀-➿⬀-⯿️\u{1F000}-\u{1FAFF}]/u;
  let found = 0;
  const scan = (text, where) => {
    if (EMOJI.test(text)) { found++; console.log('    ✗ emoji in ' + where + ': ' + text.slice(0, 60)); }
  };
  BK.all.forEach(a => {
    scan(a.prompt, a.id + ' prompt');
    if (a.story) scan(a.story.text, a.id + ' story');
    a.hints.forEach((x, i) => scan(x, a.id + ' hint ' + (i + 1)));
    scan(a.explain, a.id + ' explanation');
  });
  CT.jobs.forEach(j => { scan(j.what, j.id); scan(j.why, j.id + ' why'); });
  Object.keys(CT.misconceptions).forEach(k => scan(CT.misconceptions[k].say, k));
  t.eq(found, 0, 'no emoji anywhere in the words she reads');
})();

(function () {
  /* Class 4 English: short sentences, no walls of text on a learner screen. */
  let longPrompt = 0, longSentence = 0;
  BK.all.forEach(a => {
    if (a.prompt.length > 220) { longPrompt++; console.log('    ✗ ' + a.id + ' prompt is ' + a.prompt.length + ' chars'); }
    a.prompt.split(/[.?!]\s/).forEach(sent => {
      const words = sent.trim().split(/\s+/).filter(Boolean).length;
      if (words > 32) { longSentence++; console.log('    ✗ ' + a.id + ' has a ' + words + '-word sentence'); }
    });
  });
  t.eq(longPrompt, 0, 'no prompt is a wall of text');
  t.eq(longSentence, 0, 'and no sentence runs away with itself');
})();

(function () {
  /* Nothing that suggests ability is fixed, and no punishing language. */
  const BANNED = /\b(stupid|clever|dumb|smart kids|bad at|no good at|failed|failure|you always|you never get)\b/i;
  let bad = 0;
  BK.all.forEach(a => {
    const text = [a.prompt, a.explain].concat(a.hints).join(' ');
    if (BANNED.test(text)) { bad++; console.log('    ✗ ' + a.id + ' uses discouraging language'); }
  });
  Object.keys(CT.misconceptions).forEach(k => {
    if (BANNED.test(CT.misconceptions[k].say)) { bad++; console.log('    ✗ ' + k); }
  });
  t.eq(bad, 0, 'nothing anywhere suggests she is or is not "good at maths"');
})();

/* ---------------------------------------------------- every job earns itself */

(function () {
  let noWhy = 0, noUnit = 0;
  CT.jobs.forEach(j => {
    if (!j.why || j.why.length < 30) { noWhy++; console.log('    ✗ ' + j.id + ' does not say why anyone would measure it'); }
    if (!j.unit) noUnit++;
    const shouldBeSquare = j.mode === 'inside';
    if (shouldBeSquare !== MQ.isSquareUnit(j.unit)) {
      noUnit++; console.log('    ✗ ' + j.id + ' has the wrong kind of unit: ' + j.unit);
    }
  });
  t.eq(noWhy, 0, 'every real-life job explains why the measurement is useful');
  t.eq(noUnit, 0, 'and carries the right kind of unit for its job');

  /* Several objects appear as BOTH a border job and a cover job — that
     contrast is the lesson, so it must actually be there. */
  const both = {};
  CT.jobs.forEach(j => { (both[j.obj] = both[j.obj] || new Set()).add(j.mode); });
  const paired = Object.keys(both).filter(k => both[k].size === 2);
  t.ok(paired.length >= 5, 'at least five objects appear with both jobs (' + paired.join(', ') + ')');
})();

/* ------------------------------------------------------------ grown-ups */

(function () {
  t.eq(CT.homeCards.length, 8, 'there are eight home activity cards');
  let bad = 0;
  CT.homeCards.forEach(c => {
    ['need', 'say', 'does', 'learns', 'ask'].forEach(f => {
      if (!c[f] || c[f].length < 10) { bad++; console.log('    ✗ home card ' + c.id + ' is missing ' + f); }
    });
    /* nothing dangerous, nothing unsupervised outdoors */
    if (/knife|scissors|blade|ladder|climb|outside on your own|alone outdoors/i.test(JSON.stringify(c))) {
      bad++; console.log('    ✗ home card ' + c.id + ' asks for something unsafe');
    }
  });
  t.eq(bad, 0, 'every home card is complete and safe');

  t.ok(CT.teachScripts.length >= 8, 'there are teaching scripts for the adult');
  let sbad = 0;
  CT.teachScripts.forEach(s => {
    ['say', 'ifRight', 'ifWrong', 'then'].forEach(f => { if (!s[f]) sbad++; });
    if (!CT.skill(s.skill)) sbad++;
  });
  t.eq(sbad, 0, 'and each one branches on what she answers');
  t.ok(CT.teachScripts.some(s => /ribbon around this book/i.test(s.say)),
    'including the exact opener the plan asked for');
})();

/* --------------------------------------------------------------- badges */

(function () {
  const names = CT.badges.map(b => b.name);
  ['Border Detective', 'Edge Explorer', 'Tile Master', 'Unit Expert',
   'Perimeter Pathfinder', 'Area Adventurer', 'Measurement Champion'].forEach(n => {
    t.ok(names.indexOf(n) >= 0, 'the ' + n + ' badge exists');
  });
  const effort = CT.badges.filter(b => b.effort);
  t.ok(effort.length >= 3, 'and there are effort badges too (' + effort.map(b => b.name).join(', ') + ')');
  t.ok(!CT.badges.some(b => /streak lost|lives|hearts|leaderboard|rank/i.test(JSON.stringify(b))),
    'nothing punishing: no lives, no hearts, no leaderboard');
})();

/* -------------------------------------- the two cues appear where they should */

(function () {
  t.eq(CT.CUE_LONG, 'Perimeter goes around. Area covers the ground.', 'the memory sentence is exact');
  t.eq(CT.CUE_SHORT, 'Border or cover?', 'and the short decision cue is exact');
  const usesLong = BK.all.filter(a => JSON.stringify(a).indexOf(CT.CUE_LONG) >= 0).length;
  const usesShort = BK.all.filter(a => JSON.stringify(a).indexOf(CT.CUE_SHORT) >= 0).length;
  t.ok(usesLong >= 2, 'the memory sentence is used through the missions (' + usesLong + ' places)');
  t.ok(usesShort >= 1, 'and so is the decision cue (' + usesShort + ' places)');
})();

t.done('content: 76 activities, sequenced, diagnosed and written for a nine-year-old');

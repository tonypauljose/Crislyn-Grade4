/* ============================================================
   Crislyn's World — hindi-journey.js
   A chapter-agnostic, tablet-first, no-scroll slide engine for the
   Hindi periodic-test learning journey.

   - One activity per screen (full-viewport stage, no scrolling)
   - Big Hindi, large touch buttons (Next / Back / Try Again / I Did It)
   - Read-first teaching: discover once -> read & self-check -> guess
   - Finger/stylus tracing (lifted from handwriting.html)
   - Hindi TTS via Web Speech API (lifted from hi02-aam-ka-ped.html)
   - Gentle, never-judgmental validation ("Let's try once more")
   - Progress + reading-confidence persisted to localStorage; stars &
     badges awarded through the global State (js/state.js)

   Public API (window.HindiJourney):
     start({ data, missionId, host, onExit })
     startNext({ data, host, onExit })
     startPractice({ data, host, onExit })
     getProgress(dataId)            -> chapter progress object (no DOM)
     resetProgress(dataId)
   ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'crislyn_hindi_journey_v1';
  let speechRate = 0.8;             // comfortable for a learner; 🐢 toggle slows it

  /* ---------------- small utils ---------------- */
  const shuffle = (arr) => (window.Utils && Utils.shuffle) ? Utils.shuffle(arr) : arr.slice().sort(() => Math.random() - 0.5);
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  const esc = escAttr;
  function tone(t) { if (window.AudioManager) AudioManager.playTone(t); }

  /* ---------------- Hindi TTS (self-contained) ---------------- */
  let _hiVoice = null;
  function pickHindiVoice() {
    if (_hiVoice) return _hiVoice;
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    if (!voices.length) return null;
    const hi = voices.filter(v => /^hi/i.test(v.lang || ''));
    const cands = hi.length ? hi : voices;
    const pats = [/madhur/i, /kalpana/i, /heera/i, /lekha/i, /veena/i, /swara/i, /aditi/i, /priya/i, /shruti/i, /rishi/i, /hemant/i, /female/i, /hi[-_]IN/i];
    for (const p of pats) { const v = cands.find(x => p.test(x.name || '') || p.test(x.lang || '')); if (v) { _hiVoice = v; return v; } }
    _hiVoice = cands[0];
    return _hiVoice;
  }
  function speak(text, btn) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const fire = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'hi-IN';
      u.rate = speechRate;
      const v = pickHindiVoice(); if (v) u.voice = v;
      if (btn) {
        document.querySelectorAll('.hj-speak.speaking').forEach(b => b.classList.remove('speaking'));
        btn.classList.add('speaking');
        u.onend = u.onerror = () => btn.classList.remove('speaking');
      }
      window.speechSynthesis.speak(u);
    };
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.addEventListener('voiceschanged', fire, { once: true });
      setTimeout(() => { if (!_hiVoice) fire(); }, 400);
    } else { fire(); }
  }

  /* ---------------- progress persistence ---------------- */
  function loadAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (_) { return {}; } }
  function saveAll(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (_) {} }
  function blankChapter() {
    return { missions: {}, miniTests: {}, wordsPractised: [], wordsReadSelf: [], revealsUsed: {}, attempts: {}, answersWritten: [], practiceRuns: [], readiness: 0 };
  }
  function getProgress(dataId) {
    const all = loadAll();
    if (!all[dataId]) { all[dataId] = blankChapter(); }
    return all[dataId];
  }
  function withProgress(dataId, fn) {
    const all = loadAll();
    if (!all[dataId]) all[dataId] = blankChapter();
    fn(all[dataId]);
    saveAll(all);
  }
  function addUnique(arr, v) { if (v && arr.indexOf(v) === -1) arr.push(v); }

  /* ---------------- the engine ---------------- */
  const J = {
    data: null, mission: null, steps: [], idx: 0, host: null, onExit: null,
    mode: 'mission',   // 'mission' | 'practice'
    ss: {},            // per-step transient state
  };

  function totalMissions() { return (J.data.missions || []).length; }

  function recomputeReadiness(p) {
    const total = totalMissions() || 1;
    const done = Object.values(p.missions).filter(m => m.done).length;
    const tests = Object.values(p.miniTests);
    const avgTest = tests.length ? tests.reduce((a, t) => a + (t.score / t.total), 0) / tests.length : 0;
    const readTotal = p.wordsReadSelf.length;
    const practised = Math.max(1, p.wordsPractised.length);
    const reading = Math.min(1, readTotal / practised);
    p.readiness = Math.round((0.4 * (done / total) + 0.4 * avgTest + 0.2 * reading) * 100);
  }

  function markStep(stepId) {
    if (J.mode !== 'mission' || !J.mission) return;
    withProgress(J.data.id, p => {
      const m = p.missions[J.mission.id] || (p.missions[J.mission.id] = { done: false, starsAwarded: 0, steps: {} });
      m.steps[stepId] = true;
      recomputeReadiness(p);
    });
  }
  function recordWordPractised(hi) { withProgress(J.data.id, p => { addUnique(p.wordsPractised, hi); recomputeReadiness(p); }); }
  function recordReadSelf(hi) { withProgress(J.data.id, p => { addUnique(p.wordsReadSelf, hi); recomputeReadiness(p); }); }
  function recordReveal(hi) { withProgress(J.data.id, p => { p.revealsUsed[hi] = (p.revealsUsed[hi] || 0) + 1; recomputeReadiness(p); }); }
  function recordAttempt(id) { withProgress(J.data.id, p => { p.attempts[id] = (p.attempts[id] || 0) + 1; }); }
  function recordAnswerWritten(id) { withProgress(J.data.id, p => { addUnique(p.answersWritten, id); recomputeReadiness(p); }); }
  function recordMiniTest(missionId, score, total) {
    withProgress(J.data.id, p => { p.miniTests[missionId] = { score, total, at: new Date().toISOString().slice(0, 10) }; recomputeReadiness(p); });
  }
  function recordPracticeRun(score, total) {
    withProgress(J.data.id, p => { p.practiceRuns.push({ at: new Date().toISOString().slice(0, 10), score, total }); });
  }

  /* ---------------- shell render ---------------- */
  function shell(slideHtml) {
    const n = J.steps.length;
    const dots = J.steps.map((_, i) =>
      `<span class="hj-dot ${i < J.idx ? 'is-done' : i === J.idx ? 'is-now' : ''}"></span>`).join('');
    const titleBit = J.mode === 'practice'
      ? '⚡ Practice'
      : `${J.mission.emoji} ${J.mission.titleHi} <span class="hj-title-en">· ${J.mission.title}</span>`;
    J.host.innerHTML = `
      <div class="hj-top">
        <button class="hj-exit" id="hj-exit" title="Back to menu">✕</button>
        <div class="hj-title">${titleBit}</div>
        <button class="hj-speed" id="hj-speed" title="Reading speed">${speechRate <= 0.7 ? '🐢' : '🚶'}</button>
      </div>
      <div class="hj-progress"><div class="hj-dots">${dots}</div><div class="hj-count">${Math.min(J.idx + 1, n)} / ${n}</div></div>
      <div class="hj-slide" id="hj-slide">${slideHtml}</div>
      <div class="hj-nav" id="hj-nav">
        <button class="hj-btn hj-back" id="hj-back">← Back</button>
        <div class="hj-nav-mid" id="hj-nav-mid"></div>
        <button class="hj-btn hj-primary" id="hj-primary" disabled>Next →</button>
      </div>`;
    document.getElementById('hj-exit').onclick = exit;
    document.getElementById('hj-speed').onclick = () => { speechRate = speechRate <= 0.7 ? 0.95 : 0.6; document.getElementById('hj-speed').textContent = speechRate <= 0.7 ? '🐢' : '🚶'; };
    document.getElementById('hj-back').onclick = back;
    // delegated 🔊
    document.getElementById('hj-slide').addEventListener('click', (e) => {
      const b = e.target.closest('.hj-speak'); if (b) { e.preventDefault(); speak(b.getAttribute('data-text'), b); }
    });
  }
  function setPrimary(label, enabled, onClick) {
    const b = document.getElementById('hj-primary');
    b.textContent = label; b.disabled = !enabled;
    b.onclick = enabled ? onClick : null;
  }
  function setNavMid(html) { document.getElementById('hj-nav-mid').innerHTML = html || ''; }

  function speakBtn(text, label) {
    return `<button class="hj-speak" data-text="${esc(text)}">🔊 ${label || 'Listen'}</button>`;
  }
  function bigHi(text, cls) { return `<div class="hj-hi ${cls || ''}">${text}</div>`; }

  /* ---------------- navigation ---------------- */
  function back() {
    if (J.idx > 0) { J.idx--; renderSlide(); }
    else exit();
  }
  function advance() {
    const step = J.steps[J.idx];
    if (step && step.id) markStep(step.id);
    if (J.idx < J.steps.length - 1) { J.idx++; renderSlide(); }
    else exit();
  }
  // Renderers call goNext() so the same renderer works in mission mode
  // (J.next = advance) and practice mode (J.next = advancePractice).
  function goNext() { (J.next || advance)(); }
  function exit() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {} if (J.onExit) J.onExit(); }

  /* ---------------- per-kind renderers ---------------- */
  function renderSlide() {
    J.ss = {};
    J.next = advance;
    const s = J.steps[J.idx];
    const fn = RENDER[s.kind];
    if (!fn) { console.warn('Unknown slide kind', s.kind); advance(); return; }
    fn(s);
    document.getElementById('hj-back').disabled = false;
    // resize any tracer to fit
    requestAnimationFrame(fitTracers);
  }

  const RENDER = {};

  RENDER.intro = (s) => {
    shell(`<div class="hj-center">
      <div class="hj-emoji-xl">${s.emoji || '🌟'}</div>
      <h2 class="hj-headline">${s.headline || ''}</h2>
      <p class="hj-body">${s.body || ''}</p>
    </div>`);
    setPrimary('Start →', true, advance);
  };

  RENDER.discover = (s) => {
    const w = s.word;
    shell(`<div class="hj-center">
      <div class="hj-pill">New word — try to read it!</div>
      ${w.emoji ? `<div class="hj-emoji-xl">${w.emoji}</div>` : ''}
      ${bigHi(w.hi)}
      <div class="hj-roman" id="hj-roman" hidden>${w.roman || ''}</div>
      <div class="hj-speakrow">
        ${speakBtn(w.hi, 'Hear it')}
        <button class="hj-reveal" id="hj-say">🔤 How to say it</button>
      </div>
      <div class="hj-meaning">means <strong>${w.en}</strong></div>
      ${s.note ? `<p class="hj-note">${s.note}</p>` : ''}
    </div>`);
    const say = document.getElementById('hj-say');
    if (say) say.onclick = () => { const r = document.getElementById('hj-roman'); if (r) r.hidden = false; say.style.display = 'none'; };
    recordWordPractised(w.hi);
    setPrimary('Next →', true, advance);
  };

  RENDER.readCheck = (s) => {
    const w = s.word;
    shell(`<div class="hj-center">
      <div class="hj-pill">Read it yourself</div>
      <p class="hj-instr">${s.title || 'Read this out loud! 🗣️'}</p>
      ${bigHi(w.hi)}
      <div class="hj-speakrow">${speakBtn(w.hi, 'Check my reading')}</div>
      <p class="hj-hint-mini">Tap 🔊 to hear if you read it right.</p>
    </div>`);
    let checked = false;
    document.getElementById('hj-slide').addEventListener('click', (e) => {
      if (e.target.closest('.hj-speak') && !checked) { checked = true; setPrimary('I read it ✓', true, () => { recordWordPractised(w.hi); advance(); }); }
    });
    setPrimary('Tap 🔊 first', false, null);
  };

  RENDER.guessMeaning = (s) => {
    const w = s.word;
    const opts = shuffle(s.options.map((o, i) => ({ en: o, correct: i === s.answer })));
    shell(`<div class="hj-center">
      <div class="hj-pill">What does it mean?</div>
      ${bigHi(w.hi)}
      <div class="hj-speakrow">${speakBtn(w.hi, 'Hear it')}
        <button class="hj-reveal" id="hj-reveal">Show meaning 🔁</button></div>
      <div class="hj-options hj-options--text">
        ${opts.map((o, i) => `<button class="hj-opt" data-i="${i}" data-correct="${o.correct}">${o.en}</button>`).join('')}
      </div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let answered = false, revealed = false;
    document.getElementById('hj-reveal').onclick = () => {
      if (revealed) return; revealed = true; recordReveal(w.hi);
      document.getElementById('hj-fb').innerHTML = `It means <strong>${w.en}</strong> · ${w.roman || ''}. Now pick it! 🌈`;
    };
    J.host.querySelectorAll('.hj-opt').forEach(btn => {
      btn.onclick = () => {
        if (answered) return;
        const correct = btn.dataset.correct === 'true';
        if (correct) {
          answered = true; tone('correct');
          btn.classList.add('is-correct');
          if (!revealed) recordReadSelf(w.hi); else recordWordPractised(w.hi);
          document.getElementById('hj-fb').innerHTML = `✅ Yes! ${w.hi} means <strong>${w.en}</strong>.`;
          setPrimary('Next →', true, advance);
        } else {
          tone('wrong'); recordReveal(w.hi);
          btn.classList.add('is-soft');
          J.host.querySelectorAll('.hj-opt').forEach(b => { if (b.dataset.correct === 'true') b.classList.add('is-correct'); });
          document.getElementById('hj-fb').innerHTML = `Good try — ${w.hi} means <strong>${w.en}</strong>. 🌱`;
          answered = true;
          setPrimary('Next →', true, advance);
        }
      };
    });
    setPrimary('Pick a meaning', false, null);
  };

  function traceSlide(s, withGuide) {
    const w = s.word;
    shell(`<div class="hj-center">
      <div class="hj-pill">${withGuide ? 'Trace it' : 'Write it yourself'}</div>
      <p class="hj-instr">${s.title || (withGuide ? 'Trace over the faded word ✏️' : 'Write this word on the empty line ✏️')}</p>
      ${withGuide ? '' : `<div class="hj-copy-target">${w.hi}</div>`}
      <div class="hj-tracer" data-glyph="${esc(w.hi)}" data-guide="${withGuide ? '1' : '0'}"></div>
      <div class="hj-speakrow">${speakBtn(w.hi, 'Hear it')}
        <button class="hj-clear" id="hj-clear">🗑️ Clear</button></div>
    </div>`);
    const tracer = mountTracer(J.host.querySelector('.hj-tracer'), {
      glyph: w.hi, showGuide: withGuide,
      onStroke: () => setPrimary('I Did It ✓', true, () => { recordWordPractised(w.hi); advance(); })
    });
    document.getElementById('hj-clear').onclick = () => { tracer.clear(); setPrimary('Trace first', false, null); };
    setPrimary('Trace first', false, null);
  }
  RENDER.trace = (s) => traceSlide(s, true);
  RENDER.copy = (s) => traceSlide(s, false);

  RENDER.match = (s) => {
    const lefts = s.pairs.map((p, i) => ({ ...p.left, pair: i }));
    const rights = shuffle(s.pairs.map((p, i) => ({ ...p.right, pair: i })));
    const leftHtml = lefts.map((l, i) =>
      `<button class="hj-chip hj-chip--left" data-pair="${l.pair}" data-side="L">${l.hi ? `<span class="hj-chip-hi">${l.hi}</span>` : l.en}</button>`).join('');
    const rightHtml = rights.map((r) =>
      `<button class="hj-chip hj-chip--right" data-pair="${r.pair}" data-side="R">${r.hi ? `<span class="hj-chip-hi">${r.hi}</span>` : ''}${r.en ? `<span class="hj-chip-en">${r.en}</span>` : ''}</button>`).join('');
    shell(`<div class="hj-center hj-center--wide">
      <p class="hj-instr">${s.title || 'Match the pairs'}</p>
      <div class="hj-match">
        <div class="hj-match-col">${leftHtml}</div>
        <div class="hj-match-col">${rightHtml}</div>
      </div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let sel = null, done = 0;
    const total = s.pairs.length;
    J.host.querySelectorAll('.hj-chip').forEach(chip => {
      chip.onclick = () => {
        if (chip.classList.contains('is-matched')) return;
        if (chip.dataset.side === 'L') {
          J.host.querySelectorAll('.hj-chip--left').forEach(c => c.classList.remove('is-sel'));
          // also let Hindi chips be heard
          const hi = chip.querySelector('.hj-chip-hi'); if (hi) speak(hi.textContent);
          sel = chip; chip.classList.add('is-sel');
        } else if (sel) {
          if (chip.dataset.pair === sel.dataset.pair) {
            tone('correct'); chip.classList.add('is-matched'); sel.classList.add('is-matched'); sel.classList.remove('is-sel');
            sel = null; done++;
            if (done === total) { document.getElementById('hj-fb').textContent = '🎉 All matched!'; setPrimary('Next →', true, advance); }
          } else {
            tone('wrong'); chip.classList.add('is-shake');
            document.getElementById('hj-fb').textContent = 'Good try — match it with its pair. 🙂';
            setTimeout(() => chip.classList.remove('is-shake'), 500);
          }
        }
      };
    });
    setPrimary('Match them all', false, null);
  };

  function optionHtml(o, i) {
    const inner = o.hi
      ? `<span class="hj-opt-hi">${o.hi}</span>${o.en ? `<span class="hj-opt-en">${o.en}</span>` : ''}`
      : `${o.en}`;
    return `<button class="hj-opt ${o.hi ? 'hj-opt--hi' : ''}" data-i="${i}" data-correct="${o.correct}">${inner}</button>`;
  }
  RENDER.choose = (s) => {
    const opts = shuffle(s.options.map((o, i) => ({ ...o, correct: i === s.answer })));
    shell(`<div class="hj-center">
      <p class="hj-instr">${s.prompt}</p>
      ${s.promptEn ? `<p class="hj-instr-en">${s.promptEn}</p>` : ''}
      ${s.promptWord ? `${bigHi(s.promptWord)}<div class="hj-speakrow">${speakBtn(s.promptWord, 'Hear it')}</div>` : ''}
      <div class="hj-options">${opts.map(optionHtml).join('')}</div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    chooseWire(s, goNext);
    setPrimary('Pick an answer', false, null);
  };
  function chooseWire(s, onNext) {
    let answered = false;
    J.host.querySelectorAll('.hj-opt').forEach(btn => {
      // hear Hindi options
      const hi = btn.querySelector('.hj-opt-hi');
      btn.onclick = () => {
        if (answered) return;
        const correct = btn.dataset.correct === 'true';
        if (correct) {
          answered = true; tone('correct'); btn.classList.add('is-correct');
          if (s.explain) document.getElementById('hj-fb').innerHTML = '✅ ' + s.explain;
          setPrimary('Next →', true, onNext);
        } else {
          tone('wrong'); recordAttempt(s.id || 'q');
          btn.classList.add('is-soft');
          J.host.querySelectorAll('.hj-opt').forEach(b => { if (b.dataset.correct === 'true') b.classList.add('is-correct'); });
          document.getElementById('hj-fb').innerHTML = "Let's try once more — the right one is shown in green. " + (s.explain || '');
          answered = true;
          setNavMid('<button class="hj-btn hj-try" id="hj-try">↻ Try again</button>');
          document.getElementById('hj-try').onclick = () => chooseRetry(s);
          setPrimary('Next →', true, onNext);
        }
        if (hi) speak(hi.textContent);
      };
    });
  }
  function chooseRetry(s) { RENDER[s.kind](s); }

  RENDER.fill = (s) => {
    const bank = shuffle(s.bank.map(b => ({ ...b })));
    shell(`<div class="hj-center">
      <p class="hj-instr">${s.title || 'Tap the word that fits'}</p>
      <div class="hj-sentence" id="hj-sentence">${s.prompt.replace('____', '<span class="hj-blank" id="hj-blank">____</span>')}</div>
      <div class="hj-options hj-options--chips">
        ${bank.map((b, i) => `<button class="hj-opt ${b.hi ? 'hj-opt--hi' : ''}" data-i="${i}">${b.hi ? `<span class="hj-opt-hi">${b.hi}</span>` : b.en}</button>`).join('')}
      </div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let answered = false;
    J.host.querySelectorAll('.hj-opt').forEach((btn, i) => {
      const b = bank[i];
      btn.onclick = () => {
        if (answered) return;
        const val = b.hi || b.en;
        const blank = document.getElementById('hj-blank');
        if (val === s.answer) {
          answered = true; tone('correct'); btn.classList.add('is-correct');
          blank.textContent = val; blank.classList.add('is-filled');
          if (s.explain) document.getElementById('hj-fb').innerHTML = '✅ ' + s.explain;
          setPrimary('Next →', true, goNext);
        } else {
          tone('wrong'); recordAttempt(s.id || 'fill'); btn.classList.add('is-soft');
          document.getElementById('hj-fb').textContent = "Good try — pick another word. 🙂";
          setTimeout(() => btn.classList.remove('is-soft'), 500);
        }
        if (b.hi) speak(b.hi);
      };
    });
    setPrimary('Fill the blank', false, null);
  };

  RENDER.answerBuild = (s) => {
    const tiles = shuffle(s.answer.map((w, i) => ({ w, i })));
    shell(`<div class="hj-center hj-center--wide">
      <div class="hj-pill">Build the answer</div>
      <p class="hj-instr">${s.question}</p>
      ${s.questionEn ? `<p class="hj-instr-en">${s.questionEn}</p>` : ''}
      <div class="hj-build" id="hj-build"></div>
      <div class="hj-tiles" id="hj-tiles">
        ${tiles.map((t) => `<button class="hj-tile" data-w="${esc(t.w)}">${t.w}</button>`).join('')}
      </div>
      ${s.hintEn ? `<p class="hj-hint-mini">💡 ${s.hintEn} ${speakBtn(s.answer.join(' '), 'Hear answer')}</p>` : ''}
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let ptr = 0;
    const buildEl = document.getElementById('hj-build');
    J.host.querySelectorAll('.hj-tile').forEach(tile => {
      tile.onclick = () => {
        if (tile.disabled) return;
        const expected = s.answer[ptr];
        if (tile.dataset.w === expected) {
          tone('correct'); tile.disabled = true; tile.classList.add('is-used');
          const span = document.createElement('span'); span.className = 'hj-built-word'; span.textContent = expected;
          buildEl.appendChild(span); ptr++;
          if (ptr === s.answer.length) {
            document.getElementById('hj-fb').innerHTML = '🎉 You built it! ' + speakBtn(s.answer.join(' '), 'Hear it');
            setPrimary('Next →', true, advance);
          }
        } else {
          tone('wrong'); tile.classList.add('is-shake');
          document.getElementById('hj-fb').textContent = 'Good try — which word comes next? 🙂';
          setTimeout(() => tile.classList.remove('is-shake'), 500);
        }
      };
    });
    setNavMid('<button class="hj-btn hj-try" id="hj-undo">↶ Undo</button>');
    document.getElementById('hj-undo').onclick = () => RENDER.answerBuild(s);
    setPrimary('Build it', false, null);
  };

  RENDER.traceAnswer = (s) => {
    const clauses = s.clauses;
    const i = J.ss.clauseIdx || 0;
    shell(`<div class="hj-center">
      <div class="hj-pill">Trace the answer (${i + 1}/${clauses.length})</div>
      <p class="hj-instr">Trace this part ✏️</p>
      <div class="hj-tracer" data-glyph="${esc(clauses[i])}" data-guide="1"></div>
      <div class="hj-speakrow">${speakBtn(clauses[i], 'Hear it')}<button class="hj-clear" id="hj-clear">🗑️ Clear</button></div>
      ${s.en ? `<p class="hj-hint-mini">💡 ${s.en}</p>` : ''}
    </div>`);
    const tracer = mountTracer(J.host.querySelector('.hj-tracer'), {
      glyph: clauses[i], showGuide: true,
      onStroke: () => setPrimary(i < clauses.length - 1 ? 'Next part →' : 'I Did It ✓', true, () => {
        if (i < clauses.length - 1) { J.ss.clauseIdx = i + 1; RENDER.traceAnswer(s); requestAnimationFrame(fitTracers); }
        else advance();
      })
    });
    document.getElementById('hj-clear').onclick = () => { tracer.clear(); setPrimary('Trace first', false, null); };
    setPrimary('Trace first', false, null);
  };

  RENDER.recall = (s) => {
    shell(`<div class="hj-center">
      <div class="hj-pill">Now you write it! ✍️</div>
      <p class="hj-instr">${s.prompt}</p>
      <p class="hj-body">Write the answer on your paper. Then tap “Show me” to check.</p>
      <div class="hj-model" id="hj-model" hidden>
        ${bigHi(s.modelHi, 'hj-hi--ans')}
        <div class="hj-meaning">${s.modelEn || ''}</div>
        <div class="hj-speakrow">${speakBtn(s.modelHi, 'Hear it')}</div>
      </div>
      <button class="hj-reveal hj-reveal--big" id="hj-show">👀 Show me</button>
    </div>`);
    document.getElementById('hj-show').onclick = () => {
      document.getElementById('hj-model').hidden = false;
      document.getElementById('hj-show').style.display = 'none';
    };
    setPrimary('I wrote it ✍️', true, () => { recordAnswerWritten(s.id); if (window.State) State.addStars(2, 'Hindi: wrote an answer'); advance(); });
  };

  RENDER.dialogue = (s) => {
    shell(`<div class="hj-center">
      <div class="hj-pill">Who said it?</div>
      <div class="hj-quote">“${s.quote}” <span class="hj-speak-inline">${speakBtn(s.quote, 'Hear')}</span></div>
      ${s.quoteEn ? `<p class="hj-instr-en">${s.quoteEn}</p>` : ''}
      <p class="hj-instr-sm">1) Who <strong>said</strong> it?</p>
      <div class="hj-options" id="hj-who">${shuffle(s.whoOptions.map((o, i) => ({ ...o, correct: i === s.whoAnswer }))).map(optionHtml).join('')}</div>
      <p class="hj-instr-sm" id="hj-to-label" style="opacity:.4;">2) To <strong>whom</strong>?</p>
      <div class="hj-options" id="hj-to" style="pointer-events:none;opacity:.4;">${shuffle(s.toOptions.map((o, i) => ({ ...o, correct: i === s.toAnswer }))).map(optionHtml).join('')}</div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let whoDone = false, toDone = false;
    function maybeFinish() {
      if (whoDone && toDone) { if (s.explain) document.getElementById('hj-fb').innerHTML = '✅ ' + s.explain; setPrimary('Next →', true, goNext); }
    }
    bindGroup('hj-who', s.id + '-who', () => {
      whoDone = true;
      const to = document.getElementById('hj-to'); to.style.pointerEvents = 'auto'; to.style.opacity = '1';
      document.getElementById('hj-to-label').style.opacity = '1';
      maybeFinish();
    });
    bindGroup('hj-to', s.id + '-to', () => { toDone = true; maybeFinish(); });
    setPrimary('Answer both', false, null);
  };
  function bindGroup(containerId, attemptId, onSolved) {
    const c = document.getElementById(containerId);
    let solved = false;
    c.querySelectorAll('.hj-opt').forEach(btn => {
      const hi = btn.querySelector('.hj-opt-hi');
      btn.onclick = () => {
        if (solved) return;
        if (btn.dataset.correct === 'true') { solved = true; tone('correct'); btn.classList.add('is-correct'); onSolved(); }
        else { tone('wrong'); recordAttempt(attemptId); btn.classList.add('is-soft'); setTimeout(() => btn.classList.remove('is-soft'), 500); }
        if (hi) speak(hi.textContent);
      };
    });
  }

  RENDER.miniTest = (s) => {
    J.ss.mt = J.ss.mt || { qi: 0, score: 0 };
    const st = J.ss.mt;
    if (st.qi >= s.questions.length) {
      recordMiniTest(J.mission.id, st.score, s.questions.length);
      const msg = st.score === s.questions.length ? 'Perfect! 🌟' : st.score >= 2 ? 'Great trying! 👏' : "Nice effort — let's keep practising. 💪";
      shell(`<div class="hj-center">
        <div class="hj-emoji-xl">${st.score >= 2 ? '🌟' : '📚'}</div>
        <h2 class="hj-headline">You got ${st.score} of ${s.questions.length}!</h2>
        <p class="hj-body">${msg}</p>
      </div>`);
      setPrimary('Next →', true, goNext);
      return;
    }
    const q = s.questions[st.qi];
    // choose questions use options/answer-index; fill questions use bank/answer-value
    const raw = q.options || q.bank;
    const ansIdx = q.options ? q.answer : q.bank.findIndex(b => (b.hi || b.en) === q.answer);
    const opts = shuffle(raw.map((o, i) => ({ ...o, correct: i === ansIdx })));
    shell(`<div class="hj-center">
      <div class="hj-pill">Question ${st.qi + 1} of ${s.questions.length}</div>
      <p class="hj-instr">${q.prompt}</p>
      <div class="hj-options ${q.kind === 'fill' ? 'hj-options--chips' : ''}">${opts.map(optionHtml).join('')}</div>
      <p class="hj-fb" id="hj-fb"></p>
    </div>`);
    let answered = false;
    J.host.querySelectorAll('.hj-opt').forEach(btn => {
      const hi = btn.querySelector('.hj-opt-hi');
      btn.onclick = () => {
        if (answered) return; answered = true;
        const correct = btn.dataset.correct === 'true';
        if (correct) { tone('correct'); btn.classList.add('is-correct'); st.score++; document.getElementById('hj-fb').textContent = '✅ Correct!'; }
        else {
          tone('wrong'); btn.classList.add('is-soft');
          J.host.querySelectorAll('.hj-opt').forEach(b => { if (b.dataset.correct === 'true') b.classList.add('is-correct'); });
          document.getElementById('hj-fb').textContent = 'Good try! The green one is the answer.';
        }
        if (hi) speak(hi.textContent);
        setPrimary('Next →', true, () => { st.qi++; renderMiniSame(s); });
      };
    });
    setPrimary('Pick an answer', false, null);
  };
  function renderMiniSame(s) { RENDER.miniTest(s); requestAnimationFrame(fitTracers); }

  RENDER.milestone = (s) => {
    // award once
    if (J.mode === 'mission') {
      withProgress(J.data.id, p => {
        const m = p.missions[J.mission.id] || (p.missions[J.mission.id] = { done: false, starsAwarded: 0, steps: {} });
        if (!m.done) {
          m.done = true; m.starsAwarded = s.stars || 0; m.completedAt = new Date().toISOString().slice(0, 10);
          if (window.State) {
            if (s.stars) State.addStars(s.stars, 'Hindi: ' + J.mission.title);
            if (s.sticker) State.addSticker(s.sticker.id, s.sticker.label);
          }
        }
        recomputeReadiness(p);
      });
      if (window.Confetti) Confetti.launch(110);
      tone('levelup');
    }
    const nextMission = nextMissionId();
    shell(`<div class="hj-center hj-milestone">
      <div class="hj-emoji-xl hj-pop">🏆</div>
      <h2 class="hj-headline">${s.headline || 'Mission complete!'}</h2>
      ${s.sticker ? `<div class="hj-sticker-card">🎖️ New badge: <strong>${s.sticker.label}</strong></div>` : ''}
      ${s.stars ? `<div class="hj-stars-won">+${s.stars} ⭐</div>` : ''}
    </div>`);
    if (nextMission) {
      setNavMid(`<button class="hj-btn hj-next-m" id="hj-next-m">Next mission →</button>`);
      document.getElementById('hj-next-m').onclick = () => start({ data: J.data, missionId: nextMission, host: J.host, onExit: J.onExit });
    }
    setPrimary('Back to map 🗺️', true, exit);
    document.getElementById('hj-back').disabled = true;
  };

  function nextMissionId() {
    const ms = J.data.missions; const i = ms.findIndex(m => m.id === J.mission.id);
    return (i >= 0 && i < ms.length - 1) ? ms[i + 1].id : null;
  }

  /* ---------------- tracer widget (from handwriting.html) ---------------- */
  function mountTracer(container, opts) {
    const glyph = opts.glyph, showGuide = opts.showGuide !== false, color = opts.color || '#B45309';
    container.innerHTML = `
      <div class="hj-trace-wrap">
        ${showGuide ? `<div class="hj-trace-guide">${glyph}</div>` : ''}
        <canvas class="hj-trace-canvas"></canvas>
      </div>`;
    const wrap = container.querySelector('.hj-trace-wrap');
    const canvas = container.querySelector('.hj-trace-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false, lastX = 0, lastY = 0, strokeCount = 0;

    function size() {
      const w = Math.max(200, wrap.clientWidth || 320);
      const h = Math.max(120, wrap.clientHeight || 200);
      // preserve drawing? simplest: clear on resize
      canvas.width = w; canvas.height = h; strokeCount = 0;
    }
    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return { x: cx * (canvas.width / r.width), y: cy * (canvas.height / r.height) };
    }
    function start(e) { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; if (strokeCount === 0 && opts.onStroke) opts.onStroke(); strokeCount++; }
    function move(e) {
      if (!drawing) return; e.preventDefault();
      const p = getPos(e);
      ctx.strokeStyle = color; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
      lastX = p.x; lastY = p.y;
    }
    function end() { drawing = false; }
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
    container._fit = size;
    size();
    return { clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); strokeCount = 0; }, _fit: size };
  }
  function fitTracers() {
    document.querySelectorAll('.hj-tracer').forEach(t => { if (t._fit) t._fit(); });
  }
  window.addEventListener('resize', () => requestAnimationFrame(fitTracers));

  /* ---------------- Practice Mode ---------------- */
  function startPractice(cfg) {
    J.data = cfg.data; J.host = cfg.host; J.onExit = cfg.onExit; J.mode = 'practice'; J.mission = null;
    const pool = shuffle((cfg.data.practice && cfg.data.practice.pool) || []).slice(0, 10);
    J.ss = { practice: { qi: 0, score: 0, pool } };
    document.body.classList.add('hj-running');
    renderPractice();
  }
  function renderPractice() {
    const st = J.ss.practice;
    J.steps = st.pool; // for the progress dots count
    if (st.qi >= st.pool.length) {
      const pct = Math.round((st.score / st.pool.length) * 100);
      recordPracticeRun(st.score, st.pool.length);
      if (window.State) State.addStars(pct >= 80 ? 6 : 3, 'Hindi practice');
      if (window.Confetti && pct >= 80) Confetti.launch(80);
      J.idx = st.pool.length - 1;
      shell(`<div class="hj-center">
        <div class="hj-emoji-xl">${pct >= 70 ? '🌟' : '📚'}</div>
        <h2 class="hj-headline">You scored ${st.score} / ${st.pool.length}</h2>
        <p class="hj-body">${pct >= 90 ? 'Brilliant! 🏆' : pct >= 70 ? 'Great work! ⭐' : "Good effort — let's practise again! 💪"}</p>
      </div>`);
      setNavMid('<button class="hj-btn hj-try" id="hj-again">↻ 10 more</button>');
      document.getElementById('hj-again').onclick = () => startPractice({ data: J.data, host: J.host, onExit: J.onExit });
      setPrimary('Done 🗺️', true, exit);
      document.getElementById('hj-back').disabled = true;
      return;
    }
    J.idx = st.qi;
    // In practice, "Next" goes to the next practice item (not mission steps).
    J.next = () => { st.qi++; renderPractice(); };
    const q = Object.assign({ id: 'pr-' + st.qi }, st.pool[st.qi]);
    if (q.kind === 'dialogue') RENDER.dialogue(q);
    else if (q.kind === 'fill') RENDER.fill(q);
    else RENDER.choose(q);
    document.getElementById('hj-back').disabled = true;   // no going back mid-practice
    requestAnimationFrame(fitTracers);
  }

  /* ---------------- public start ---------------- */
  function start(cfg) {
    J.data = cfg.data; J.host = cfg.host; J.onExit = cfg.onExit; J.mode = 'mission';
    J.mission = (cfg.data.missions || []).find(m => m.id === cfg.missionId) || cfg.data.missions[0];
    J.steps = J.mission.steps; J.idx = 0;
    document.body.classList.add('hj-running');
    renderSlide();
  }
  function startNext(cfg) {
    const p = getProgress(cfg.data.id);
    const first = (cfg.data.missions || []).find(m => !(p.missions[m.id] && p.missions[m.id].done));
    start(Object.assign({}, cfg, { missionId: (first || cfg.data.missions[0]).id }));
  }

  window.HindiJourney = {
    start, startNext, startPractice, getProgress,
    resetProgress(dataId) { const all = loadAll(); delete all[dataId]; saveAll(all); },
  };
})();

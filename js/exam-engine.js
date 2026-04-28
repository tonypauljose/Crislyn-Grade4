/* ============================================================
   CRISLYN'S WORLD — exam-engine.js
   Ported from Crispin's competitive-exam runner, adapted to
   Crislyn's framework (Utils, Toast, Confetti, AudioManager, State).

   - Sticky top bar with timer (always visible)
   - Question palette grid (jump anywhere, see answered/marked status)
   - Save answers as you go; nothing scored until final Submit
   - "Mark for review" toggle, Clear answer, Previous / Save & Next
   - Confirmation modal warns about unanswered/marked
   - Hard timer auto-submits at 0:00
   - Optional parent-email at submit, results emailed via FormSubmit.co
   ============================================================ */
(function () {
  'use strict';

  const FORMSUBMIT_BASE = 'https://formsubmit.co/ajax/';
  const EMAIL_LS_KEY = 'crislyn_exam_parent_email';
  const DEFAULT_DURATION_SEC = 30 * 60;
  const DEFAULT_QUESTION_COUNT = 25;

  function isValidEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
  }
  function loadSavedEmail() {
    try { return localStorage.getItem(EMAIL_LS_KEY) || ''; } catch (_) { return ''; }
  }
  function saveEmail(e) {
    try { localStorage.setItem(EMAIL_LS_KEY, e); } catch (_) {}
  }
  function formatDateDMY(d) {
    d = d || new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Tiny modal helper (uses existing .modal-overlay / .modal classes)
  function openExamModal(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal exam-modal">${html}</div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
      if (e.target.matches('[data-close]')) close();
    });
    return { overlay, close };
  }

  function ExamEngine(opts) {
    this.host = document.getElementById(opts.containerId);
    this.subject = opts.subject || 'Maths';
    this.chapter = opts.chapter || 'Unknown';
    this.chapterTitle = opts.chapterTitle || opts.chapter;
    this.bank = opts.bank || [];
    this.count = Math.min(opts.count || DEFAULT_QUESTION_COUNT, this.bank.length);
    this.durationSec = opts.durationSec || DEFAULT_DURATION_SEC;
    this.studentName = opts.studentName || 'Crislyn';
    this.parentEmail = opts.parentEmail || '';
    this.backHref = opts.backHref || 'learning.html';

    const shuffler = (window.Utils && Utils.shuffle) ? Utils.shuffle.bind(Utils) : (a => a.slice());
    this.qs = shuffler(this.bank).slice(0, this.count);
    this.answers = new Array(this.qs.length).fill(null);
    this.markedReview = new Array(this.qs.length).fill(false);
    this.visited = new Array(this.qs.length).fill(false);
    this.idx = 0;

    this.startTime = Date.now();
    this.endTime = this.startTime + this.durationSec * 1000;
    this.tickHandle = null;
    this.finished = false;
  }

  ExamEngine.prototype.start = function () {
    if (!this.host) return;
    const totalMin = Math.round(this.durationSec / 60);
    this.host.innerHTML = `
      <div class="exam-shell">
        <div class="exam-topbar">
          <div class="exam-topbar__title">📝 ${this.subject} · ${this.chapterTitle}</div>
          <div class="exam-topbar__center" id="exam-counter">Question 1 of ${this.qs.length}</div>
          <div class="exam-topbar__timer" id="exam-timer">${String(totalMin).padStart(2,'0')}:00</div>
        </div>
        <div class="exam-body">
          <aside class="exam-palette">
            <h3>Questions</h3>
            <div class="palette-grid" id="palette-grid"></div>
            <div class="palette-legend">
              <div><span class="dot dot--ok"></span> Answered</div>
              <div><span class="dot dot--seen"></span> Seen, not answered</div>
              <div><span class="dot dot--mark"></span> Marked for review</div>
              <div><span class="dot dot--new"></span> Not visited</div>
            </div>
            <div class="palette-counts">
              <div><span>Answered</span><strong id="cnt-ok">0</strong></div>
              <div><span>Marked</span><strong id="cnt-mark">0</strong></div>
              <div><span>Remaining</span><strong id="cnt-rem">${this.qs.length}</strong></div>
            </div>
          </aside>
          <main class="exam-main">
            <div class="exam-q-header">
              <div class="exam-q-num" id="exam-q-num">Q 1</div>
              <span id="exam-mark-status">⚑ Marked for Review</span>
            </div>
            <div class="exam-q-text" id="exam-question"></div>
            <div class="exam-q-body" id="exam-body"></div>
            <div class="exam-controls">
              <button class="btn btn-outline" id="exam-prev">← Previous</button>
              <button class="btn btn-outline btn-sm" id="exam-clear">Clear answer</button>
              <button class="btn btn-outline" id="exam-mark">⚑ Mark for review</button>
              <button class="btn btn-primary" id="exam-next">Save &amp; Next →</button>
            </div>
            <div class="exam-submit-row">
              <button class="btn btn-success btn-lg" id="exam-submit">📤 Submit Exam</button>
              <p class="muted" style="margin-top:8px;">Nothing is graded until you click Submit.</p>
            </div>
          </main>
        </div>
      </div>
    `;
    this.renderPalette();
    this.gotoQuestion(0);
    this.startTimer();
    this.wireControls();

    // Block accidental close mid-exam
    window.addEventListener('beforeunload', this._beforeunload = (e) => {
      if (!this.finished) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });
  };

  // ---------- Timer ----------
  ExamEngine.prototype.startTimer = function () {
    const tick = () => {
      const remaining = Math.max(0, Math.round((this.endTime - Date.now()) / 1000));
      const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
      const ss = String(remaining % 60).padStart(2, '0');
      const t = document.getElementById('exam-timer');
      if (t) {
        t.textContent = mm + ':' + ss;
        t.classList.toggle('exam-topbar__timer--warn', remaining <= 300 && remaining > 60);
        t.classList.toggle('exam-topbar__timer--danger', remaining <= 60);
      }
      if (remaining <= 0) {
        this.finish(true);
      } else {
        this.tickHandle = setTimeout(tick, 500);
      }
    };
    tick();
  };

  // ---------- Palette ----------
  ExamEngine.prototype._hasAnswer = function (i) {
    const a = this.answers[i];
    return a !== null && a !== undefined && a !== '';
  };
  ExamEngine.prototype.tileClasses = function (i) {
    const c = ['palette-tile'];
    if (i === this.idx) c.push('is-current');
    if (this._hasAnswer(i)) c.push('is-answered');
    else if (this.visited[i]) c.push('is-visited');
    if (this.markedReview[i]) c.push('is-marked');
    return c.join(' ');
  };

  ExamEngine.prototype.renderPalette = function () {
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = this.qs.map((_, i) =>
      `<div class="${this.tileClasses(i)}" data-i="${i}" tabindex="0">${i + 1}</div>`
    ).join('');
    grid.querySelectorAll('.palette-tile').forEach(t => {
      t.addEventListener('click', () => this.gotoQuestion(parseInt(t.dataset.i, 10)));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.gotoQuestion(parseInt(t.dataset.i, 10));
        }
      });
    });
    this.updateCounts();
  };

  ExamEngine.prototype.updatePaletteTile = function (i) {
    const tile = document.querySelector(`.palette-tile[data-i="${i}"]`);
    if (!tile) return;
    tile.className = this.tileClasses(i);
  };

  ExamEngine.prototype.updateCounts = function () {
    const ok = this.answers.reduce((c, _, i) => c + (this._hasAnswer(i) ? 1 : 0), 0);
    const mark = this.markedReview.filter(Boolean).length;
    const rem = this.qs.length - ok;
    const okEl = document.getElementById('cnt-ok');
    const markEl = document.getElementById('cnt-mark');
    const remEl = document.getElementById('cnt-rem');
    if (okEl) okEl.textContent = ok;
    if (markEl) markEl.textContent = mark;
    if (remEl) remEl.textContent = rem;
  };

  // ---------- Navigation ----------
  ExamEngine.prototype.gotoQuestion = function (i) {
    if (i < 0 || i >= this.qs.length) return;
    const prevIdx = this.idx;
    this.idx = i;
    this.visited[i] = true;
    this.renderQuestion();
    this.updatePaletteTile(prevIdx);
    this.updatePaletteTile(i);
    this.updateCounts();
    document.getElementById('exam-counter').textContent = `Question ${i + 1} of ${this.qs.length}`;
    document.getElementById('exam-q-num').textContent = 'Q ' + (i + 1);
    const ms = document.getElementById('exam-mark-status');
    ms.classList.toggle('show', !!this.markedReview[i]);
    document.getElementById('exam-prev').disabled = (i === 0);
    document.getElementById('exam-next').disabled = (i === this.qs.length - 1);
  };

  ExamEngine.prototype.renderQuestion = function () {
    const i = this.idx;
    const q = this.qs[i];
    const stored = this.answers[i];
    const self = this;

    document.getElementById('exam-question').innerHTML = q.q;
    const body = document.getElementById('exam-body');

    if (q.type === 'mcq' || q.type === 'compare') {
      body.innerHTML = q.options.map((o, j) => {
        const isSel = stored === j;
        return `
          <label class="exam-option ${isSel ? 'selected' : ''}">
            <input type="radio" name="exam-q-${i}" value="${j}" ${isSel ? 'checked' : ''}>
            <span class="exam-option__letter">${String.fromCharCode(65 + j)}</span>
            <span class="exam-option__text">${o}</span>
          </label>`;
      }).join('');
      body.querySelectorAll('input[type=radio]').forEach(r => {
        r.addEventListener('change', () => {
          self.answers[i] = parseInt(r.value, 10);
          body.querySelectorAll('.exam-option').forEach(l => l.classList.remove('selected'));
          r.closest('.exam-option').classList.add('selected');
          self.updatePaletteTile(i);
          self.updateCounts();
          if (window.AudioManager) AudioManager.playTone('click');
        });
      });
    } else if (q.type === 'tf') {
      body.innerHTML = ['✅ True', '❌ False'].map((o, j) => {
        const isSel = stored === j;
        return `
          <label class="exam-option ${isSel ? 'selected' : ''}">
            <input type="radio" name="exam-q-${i}" value="${j}" ${isSel ? 'checked' : ''}>
            <span class="exam-option__letter">${j === 0 ? 'T' : 'F'}</span>
            <span class="exam-option__text">${o}</span>
          </label>`;
      }).join('');
      body.querySelectorAll('input[type=radio]').forEach(r => {
        r.addEventListener('change', () => {
          self.answers[i] = parseInt(r.value, 10);
          body.querySelectorAll('.exam-option').forEach(l => l.classList.remove('selected'));
          r.closest('.exam-option').classList.add('selected');
          self.updatePaletteTile(i);
          self.updateCounts();
          if (window.AudioManager) AudioManager.playTone('click');
        });
      });
    } else if (q.type === 'fill') {
      const value = (stored !== null && stored !== undefined) ? String(stored) : '';
      body.innerHTML = `
        <input class="exam-fill-input" id="exam-fill-input"
               placeholder="Type your answer here"
               value="${value.replace(/"/g, '&quot;')}" autocomplete="off">
      `;
      const inp = document.getElementById('exam-fill-input');
      inp.addEventListener('input', () => {
        self.answers[i] = inp.value.trim() === '' ? null : inp.value;
        self.updatePaletteTile(i);
        self.updateCounts();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (self.idx < self.qs.length - 1) self.gotoQuestion(self.idx + 1);
        }
      });
      setTimeout(() => inp.focus(), 50);
    }
  };

  // ---------- Controls ----------
  ExamEngine.prototype.wireControls = function () {
    const self = this;
    document.getElementById('exam-prev').addEventListener('click', () => {
      if (self.idx > 0) self.gotoQuestion(self.idx - 1);
    });
    document.getElementById('exam-next').addEventListener('click', () => {
      if (self.idx < self.qs.length - 1) self.gotoQuestion(self.idx + 1);
    });
    document.getElementById('exam-clear').addEventListener('click', () => {
      self.answers[self.idx] = null;
      self.renderQuestion();
      self.updatePaletteTile(self.idx);
      self.updateCounts();
    });
    document.getElementById('exam-mark').addEventListener('click', () => {
      self.markedReview[self.idx] = !self.markedReview[self.idx];
      const ms = document.getElementById('exam-mark-status');
      ms.classList.toggle('show', !!self.markedReview[self.idx]);
      self.updatePaletteTile(self.idx);
      self.updateCounts();
    });
    document.getElementById('exam-submit').addEventListener('click', () => self.confirmSubmit());
  };

  ExamEngine.prototype.confirmSubmit = function () {
    const ok = this.answers.reduce((c, _, i) => c + (this._hasAnswer(i) ? 1 : 0), 0);
    const total = this.qs.length;
    const unanswered = total - ok;
    const marked = this.markedReview.filter(Boolean).length;
    const savedEmail = this.parentEmail || loadSavedEmail();

    let warn = '';
    if (unanswered > 0) warn += `<p style="color:var(--color-error); margin: 4px 0;"><strong>${unanswered}</strong> question${unanswered === 1 ? '' : 's'} still unanswered.</p>`;
    if (marked > 0) warn += `<p style="color:var(--color-primary); margin: 4px 0;"><strong>${marked}</strong> marked for review.</p>`;

    const html = `
      <h2 class="modal__title" style="margin-top:0;">Submit your exam?</h2>
      <div class="modal__body">
        <p>You answered <strong>${ok} / ${total}</strong> questions. After submitting, your answers are locked and the results are shown.</p>
        ${warn}
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--color-border-light);">
          <label for="exam-email-input" style="display:block; font-weight:700; color:var(--color-primary-dark); margin-bottom:6px;">📧 Email results to (optional):</label>
          <input type="email" id="exam-email-input" class="exam-fill-input" autocomplete="email"
                 placeholder="parent@example.com"
                 value="${savedEmail.replace(/"/g, '&quot;')}" />
          <p class="muted" style="font-size:0.78rem; margin-top: 6px; line-height: 1.4;">
            We'll save this on this device for next time. Leave blank to skip emailing — you'll still see the results on screen.
            <br>First submission to a new address triggers a one-time confirmation email from FormSubmit (free, no account); click confirm once and future results arrive silently.
          </p>
        </div>
      </div>
      <div class="modal__footer" style="display:flex; gap:12px; justify-content:flex-end; margin-top: 18px;">
        <button class="btn btn-outline" data-close>Keep working</button>
        <button class="btn btn-success btn-lg" id="confirm-submit-btn">📤 Submit</button>
      </div>
    `;
    const { close } = openExamModal(html);
    const input = document.getElementById('exam-email-input');
    input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('confirm-submit-btn').click(); }
    });
    document.getElementById('confirm-submit-btn').addEventListener('click', () => {
      const entered = (input.value || '').trim();
      if (entered && !isValidEmail(entered)) {
        if (window.Toast) Toast.show('That email looks off — check it (or leave blank to skip).', 'error');
        return;
      }
      this.parentEmail = entered;
      if (entered) saveEmail(entered);
      close();
      this.finish(false);
    });
  };

  // ---------- Score & finish ----------
  ExamEngine.prototype._correctText = function (q) {
    if (q.type === 'mcq' || q.type === 'compare') return q.options[q.answer];
    if (q.type === 'tf') return q.answer === 0 ? 'True' : 'False';
    if (q.type === 'fill') return Array.isArray(q.answer) ? q.answer[0] : q.answer;
    return '';
  };

  ExamEngine.prototype._scoreAll = function () {
    return this.qs.map((q, i) => {
      const stored = this.answers[i];
      let given = '', isCorrect = false;
      if (stored === null || stored === undefined || stored === '') {
        given = '(unanswered)';
      } else if (q.type === 'mcq' || q.type === 'compare') {
        given = q.options[stored];
        isCorrect = (stored === q.answer);
      } else if (q.type === 'tf') {
        given = stored === 0 ? 'True' : 'False';
        isCorrect = (stored === q.answer);
      } else if (q.type === 'fill') {
        given = String(stored);
        const norm = given.toLowerCase().trim().replace(/\s+/g, ' ').replace(/,/g, '');
        const acceptable = Array.isArray(q.answer) ? q.answer : [q.answer];
        isCorrect = acceptable.some(a => String(a).toLowerCase().trim().replace(/\s+/g, ' ').replace(/,/g, '') === norm);
      }
      return {
        q: q.q, type: q.type, given,
        correct: this._correctText(q),
        isCorrect,
        explain: q.explain || ''
      };
    });
  };

  ExamEngine.prototype.finish = function (timedOut) {
    if (this.finished) return;
    this.finished = true;
    if (this.tickHandle) clearTimeout(this.tickHandle);
    window.removeEventListener('beforeunload', this._beforeunload);

    const review = this._scoreAll();
    const total = review.length;
    const correct = review.filter(r => r.isCorrect).length;
    const wrong = review.filter(r => !r.isCorrect && r.given !== '(unanswered)').length;
    const skipped = review.filter(r => r.given === '(unanswered)').length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(timeTaken / 60), secs = timeTaken % 60;
    const avgSecPerQ = total ? Math.round(timeTaken / total) : 0;

    let stars, verdict;
    if (pct === 100) { stars = '⭐⭐⭐⭐⭐'; verdict = 'PERFECT! 🏆'; }
    else if (pct >= 90) { stars = '⭐⭐⭐⭐'; verdict = 'Brilliant!'; }
    else if (pct >= 75) { stars = '⭐⭐⭐'; verdict = 'Great job!'; }
    else if (pct >= 60) { stars = '⭐⭐'; verdict = 'Good effort!'; }
    else if (pct >= 40) { stars = '⭐'; verdict = 'Keep practising — you got this.'; }
    else { stars = '✨'; verdict = "Don't worry — read the rationales below and try again."; }

    const formatAnswer = (val) => val === '(unanswered)' ? '<em>not answered</em>' : val;

    this.host.innerHTML = `
      <div class="exam-result">
        ${timedOut ? '<div class="exam-banner exam-banner--warn">⏱ Time\'s up! The exam was auto-submitted.</div>' : ''}

        <div class="exam-result__hero">
          <h2>📊 Exam Results</h2>
          <div class="exam-result__stars">${stars}</div>
          <div class="exam-result__big">${correct} <span class="of">/ ${total}</span></div>
          <div class="exam-result__marks100">📏 <strong>${pct}</strong> / 100 marks <span class="muted" style="font-weight:600;">· ${pct}%</span></div>
          <div class="exam-result__verdict">${verdict}</div>
          <div class="exam-result__chapter">${this.subject} · ${this.chapterTitle}</div>
        </div>

        <div class="exam-result__stats">
          <div class="result-stat result-stat--ok">
            <div class="result-stat__num">${correct}</div>
            <div class="result-stat__label">✓ Correct</div>
          </div>
          <div class="result-stat result-stat--bad">
            <div class="result-stat__num">${wrong}</div>
            <div class="result-stat__label">✗ Wrong</div>
          </div>
          <div class="result-stat result-stat--skip">
            <div class="result-stat__num">${skipped}</div>
            <div class="result-stat__label">⊘ Skipped</div>
          </div>
          <div class="result-stat result-stat--time">
            <div class="result-stat__num">${mins}m ${secs}s</div>
            <div class="result-stat__label">⏱ Time taken</div>
          </div>
          <div class="result-stat result-stat--avg">
            <div class="result-stat__num">${avgSecPerQ}s</div>
            <div class="result-stat__label">avg per Q</div>
          </div>
        </div>

        <div id="email-status" class="exam-email-status">${this.parentEmail ? `Sending results to <strong>${this.parentEmail}</strong>…` : '✏️ Email not sent (no address entered). Results are shown below.'}</div>

        <h3 class="exam-review-heading">📋 Question-by-Question Review</h3>
        <p class="exam-review-help">Read every rationale — even on the ones you got right. That's how the next exam goes higher.</p>

        <ol class="exam-review-list">
          ${review.map((a, i) => {
            const isUnanswered = a.given === '(unanswered)';
            const cls = a.isCorrect ? 'is-ok' : (isUnanswered ? 'is-skip' : 'is-bad');
            const status = a.isCorrect ? '✓ CORRECT' : (isUnanswered ? '⊘ SKIPPED' : '✗ WRONG');
            return `
              <li class="exam-review-card ${cls}">
                <div class="exam-review-card__header">
                  <span class="exam-review-card__qnum">Q${i + 1}</span>
                  <span class="exam-review-card__status">${status}</span>
                </div>
                <div class="exam-review-card__q">${a.q}</div>
                <div class="exam-review-card__answers">
                  <div class="ans-block ans-block--yours">
                    <div class="ans-block__label">Your answer</div>
                    <div class="ans-block__val">${formatAnswer(a.given)}</div>
                  </div>
                  <div class="ans-block ans-block--correct">
                    <div class="ans-block__label">Correct answer</div>
                    <div class="ans-block__val">${a.correct}</div>
                  </div>
                </div>
                ${a.explain ? `
                  <div class="exam-review-card__rationale">
                    <span class="rationale-label">💡 Why?</span>
                    <span>${a.explain}</span>
                  </div>` : ''}
              </li>
            `;
          }).join('')}
        </ol>

        <div class="exam-result__actions">
          <a class="btn btn-primary btn-lg" href="exam.html">📝 New Exam</a>
          <a class="btn btn-outline" href="${this.backHref}">← Back to ${this.subject}</a>
          <button class="btn btn-accent" onclick="window.print()">🖨️ Print results</button>
        </div>
      </div>
    `;
    if (window.Confetti && pct >= 80) Confetti.launch(120);
    if (window.AudioManager) {
      AudioManager.playTone(pct >= 80 ? 'levelup' : pct >= 50 ? 'correct' : 'wrong');
    }
    if (window.State && State.addStars) {
      const earned = pct >= 90 ? 16 : pct >= 70 ? 12 : pct >= 50 ? 8 : 5;
      State.addStars(earned, `Exam · ${this.chapterTitle} · ${pct}%`);
    }

    if (this.parentEmail) {
      this._sendEmail({ correct, total, pct, mins, secs, timedOut, review });
    }
  };

  ExamEngine.prototype._sendEmail = function ({ correct, total, pct, mins, secs, timedOut, review }) {
    if (!this.parentEmail) return;
    const wrongList = review.filter(a => !a.isCorrect);
    const wrongSummary = wrongList.length === 0
      ? 'All correct! 🎉'
      : wrongList.map((a, i) => `Q${i + 1}: ${a.q}\n   Your answer: ${a.given}\n   Correct: ${a.correct}`).join('\n\n');

    const payload = {
      _subject: `Crislyn's exam result — ${this.subject} · ${this.chapterTitle} · ${pct}%`,
      _template: 'box',
      _captcha: 'false',
      student: this.studentName,
      subject: this.subject,
      chapter: this.chapterTitle,
      score: `${correct} / ${total} (${pct} / 100 marks · ${pct}%)`,
      time_taken: `${mins} min ${secs} sec`,
      total_questions: total,
      correct_answers: correct,
      wrong_or_skipped: total - correct,
      timed_out: timedOut ? 'YES — exam ended automatically when timer hit zero' : 'No',
      taken_at: formatDateDMY(new Date()) + ' (Bahrain time)',
      review: wrongSummary
    };

    const status = document.getElementById('email-status');
    fetch(FORMSUBMIT_BASE + encodeURIComponent(this.parentEmail), {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          status.innerHTML = `✅ Results sent to <strong>${this.parentEmail}</strong>.`;
          status.classList.add('exam-email-status--ok');
        } else {
          throw new Error('FormSubmit returned non-success');
        }
      })
      .catch(err => {
        console.warn('Email delivery failed:', err);
        const body = encodeURIComponent(
`Crislyn's exam result

Subject: ${this.subject}
Chapter: ${this.chapterTitle}
Score: ${correct} / ${total} (${pct}%)
Time: ${mins} min ${secs} sec
Date: ${formatDateDMY(new Date())}

${wrongSummary}`);
        const subject = encodeURIComponent(payload._subject);
        status.innerHTML = `
          ⚠️ Auto-email didn't go through (probably the first time — FormSubmit needs a one-time confirmation at <strong>${this.parentEmail}</strong>, sent to that inbox).<br>
          You can also <a href="mailto:${this.parentEmail}?subject=${subject}&body=${body}" class="btn btn-outline btn-sm" style="margin-top:6px;">📧 Open email manually</a>.
        `;
        status.classList.add('exam-email-status--warn');
      });
  };

  window.ExamEngine = ExamEngine;
})();

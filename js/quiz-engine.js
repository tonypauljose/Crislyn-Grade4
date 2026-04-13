/* ============================================
   CRISLYN'S MATH ADVENTURE — Quiz Engine
   ============================================
   Reusable, data-driven quiz runner.

   Usage:
     const quiz = new QuizEngine({
       containerId: 'quiz-area',
       questions: [...],       // array of question objects
       tier: 'explorer',       // filter by tier
       questionCount: 15,      // how many to ask
       onComplete: (results) => { ... }
     });
     quiz.start();
   ============================================ */

class QuizEngine {
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    this.allQuestions = config.questions || [];
    this.tier = config.tier || 'explorer';
    this.questionCount = config.questionCount || 15;
    this.onComplete = config.onComplete || (() => {});
    this.onAnswer = config.onAnswer || (() => {});

    // State
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.startTime = null;
    this.isAnswered = false;
  }

  start() {
    // Filter by tier and shuffle
    let pool = this.allQuestions.filter(q => q.tier === this.tier);
    pool = Utils.shuffle(pool);
    this.questions = pool.slice(0, this.questionCount);

    if (this.questions.length === 0) {
      this.container.innerHTML = `
        <div class="quiz-container text-center p-8">
          <h3>No questions available for this tier yet!</h3>
          <p class="text-muted mt-4">Check back soon.</p>
        </div>
      `;
      return;
    }

    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.startTime = Date.now();
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    const progress = ((this.currentIndex) / this.questions.length) * 100;
    this.isAnswered = false;

    let questionHTML = '';

    switch (q.type) {
      case 'mcq':
        questionHTML = this.renderMCQ(q);
        break;
      case 'true-false':
        questionHTML = this.renderTrueFalse(q);
        break;
      case 'fill-blank':
        questionHTML = this.renderFillBlank(q);
        break;
      case 'compare':
        questionHTML = this.renderCompare(q);
        break;
      default:
        questionHTML = this.renderMCQ(q);
    }

    this.container.innerHTML = `
      <div class="quiz-container fade-in">
        <div class="quiz-header">
          <span class="quiz-question-num">Q${this.currentIndex + 1}/${this.questions.length}</span>
          <div class="quiz-progress">
            <div class="quiz-progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="quiz-score">${this.score} pts</span>
        </div>

        <div class="quiz-question pop-in">
          ${q.visual ? `<div class="question-visual">${q.visual}</div>` : ''}
          <div class="question-text">${q.question}</div>
          ${questionHTML}
          <div class="quiz-feedback" id="quiz-feedback"></div>
        </div>

        <div class="flex-center mt-6">
          <button class="btn btn-primary btn-lg hidden" id="next-btn" onclick="window._quizEngine.next()">
            ${this.currentIndex < this.questions.length - 1 ? 'Next Question →' : 'See Results ✨'}
          </button>
        </div>
      </div>
    `;

    // Store reference for button onclick
    window._quizEngine = this;

    // Auto-focus input for fill-blank
    if (q.type === 'fill-blank') {
      setTimeout(() => {
        const input = document.getElementById('quiz-answer-input');
        if (input) input.focus();
      }, 300);
    }
  }

  renderMCQ(q) {
    const options = Utils.shuffle(q.options);
    return `
      <div class="quiz-options">
        ${options.map((opt, i) => `
          <button class="quiz-option" onclick="window._quizEngine.checkAnswer('${this.escapeHTML(opt)}', this)"
                  data-answer="${this.escapeHTML(opt)}">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
  }

  renderTrueFalse(q) {
    return `
      <div class="quiz-options" style="grid-template-columns: 1fr 1fr; max-width: 400px; margin: 0 auto;">
        <button class="quiz-option" onclick="window._quizEngine.checkAnswer('true', this)"
                data-answer="true" style="font-size: var(--text-xl);">
          ✅ True
        </button>
        <button class="quiz-option" onclick="window._quizEngine.checkAnswer('false', this)"
                data-answer="false" style="font-size: var(--text-xl);">
          ❌ False
        </button>
      </div>
    `;
  }

  renderFillBlank(q) {
    return `
      <div class="quiz-input-group">
        <input type="text" class="quiz-input" id="quiz-answer-input"
               placeholder="${q.placeholder || 'Type your answer...'}"
               autocomplete="off" spellcheck="false"
               onkeydown="if(event.key==='Enter') window._quizEngine.checkFillBlank()">
        <button class="btn btn-primary" onclick="window._quizEngine.checkFillBlank()">
          Check ✓
        </button>
      </div>
    `;
  }

  renderCompare(q) {
    return `
      <div class="flex-center gap-4" style="flex-wrap: wrap;">
        <div class="digit-box" style="width: auto; padding: 8px 20px; font-size: var(--text-2xl);">
          ${Utils.formatIndian(q.leftNum)}
        </div>
        <div class="flex gap-2">
          <button class="compare-btn" onclick="window._quizEngine.checkAnswer('<', this)" data-answer="<">&lt;</button>
          <button class="compare-btn" onclick="window._quizEngine.checkAnswer('>', this)" data-answer=">">&gt;</button>
          <button class="compare-btn" onclick="window._quizEngine.checkAnswer('=', this)" data-answer="=">=</button>
        </div>
        <div class="digit-box" style="width: auto; padding: 8px 20px; font-size: var(--text-2xl);">
          ${Utils.formatIndian(q.rightNum)}
        </div>
      </div>
    `;
  }

  checkAnswer(answer, buttonEl) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const q = this.questions[this.currentIndex];
    const correct = String(answer).trim().toLowerCase() === String(q.answer).trim().toLowerCase();

    // Disable all option buttons
    document.querySelectorAll('.quiz-option, .compare-btn').forEach(btn => {
      btn.disabled = true;
      if (String(btn.dataset.answer).toLowerCase() === String(q.answer).toLowerCase()) {
        btn.classList.add('correct');
      }
    });

    if (correct) {
      if (buttonEl) buttonEl.classList.add('correct');
      this.handleCorrect(q);
    } else {
      if (buttonEl) buttonEl.classList.add('wrong');
      this.handleWrong(q);
    }
  }

  checkFillBlank() {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const q = this.questions[this.currentIndex];
    const input = document.getElementById('quiz-answer-input');
    const userAnswer = input.value.trim();

    let correct = false;

    // Check if answer matches (support multiple accepted answers)
    const acceptedAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];

    if (q.matchType === 'fuzzy') {
      correct = acceptedAnswers.some(a => Utils.fuzzyMatchName(userAnswer, String(a)));
    } else {
      correct = acceptedAnswers.some(a =>
        userAnswer.toLowerCase().replace(/[\s,]+/g, '') === String(a).toLowerCase().replace(/[\s,]+/g, '')
      );
    }

    input.disabled = true;

    if (correct) {
      input.classList.add('correct');
      this.handleCorrect(q);
    } else {
      input.classList.add('wrong');
      this.handleWrong(q);
    }
  }

  handleCorrect(q) {
    const points = q.points || 10;
    this.score += points;
    this.answers.push({ question: q, correct: true, points });

    AudioManager.playTone('correct');

    const feedback = document.getElementById('quiz-feedback');
    feedback.className = 'quiz-feedback correct show';
    feedback.innerHTML = `
      ✨ Excellent! That's correct! +${points} points
      ${q.explanation ? `<div class="hint">${q.explanation}</div>` : ''}
    `;

    this.showNextButton();
    this.onAnswer({ correct: true, question: q, score: this.score });
  }

  handleWrong(q) {
    this.answers.push({ question: q, correct: false, points: 0 });

    AudioManager.playTone('wrong');

    const feedback = document.getElementById('quiz-feedback');
    feedback.className = 'quiz-feedback wrong show';
    feedback.innerHTML = `
      Not quite! The correct answer is: <strong>${Array.isArray(q.answer) ? q.answer[0] : q.answer}</strong>
      ${q.hint ? `<div class="hint">💡 Hint: ${q.hint}</div>` : ''}
      ${q.explanation ? `<div class="hint">${q.explanation}</div>` : ''}
    `;

    this.showNextButton();
    this.onAnswer({ correct: false, question: q, score: this.score });
  }

  showNextButton() {
    const btn = document.getElementById('next-btn');
    if (btn) btn.classList.remove('hidden');
  }

  next() {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.showResults();
    } else {
      this.renderQuestion();
    }
  }

  showResults() {
    const totalQuestions = this.questions.length;
    const correctCount = this.answers.filter(a => a.correct).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    // Star rating
    let stars = 1;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;

    const starHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    // Message based on score
    let message = '';
    if (percentage >= 90) {
      message = 'Outstanding! You are a true Champion! 🏆';
      Confetti.launch(100);
      AudioManager.playTone('levelup');
    } else if (percentage >= 70) {
      message = 'Great job! You are getting really good! 🌟';
      Confetti.launch(50);
      AudioManager.playTone('correct');
    } else if (percentage >= 50) {
      message = 'Good effort! Keep practising and you will master it! 💪';
    } else {
      message = 'Don\'t worry! Review the lessons and try again! 📚';
    }

    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-results card pop-in">
          <div class="stars">${starHTML}</div>
          <div class="score-display">${percentage}%</div>
          <div class="result-message">${message}</div>

          <div class="grid-2 gap-4 mb-6" style="max-width: 400px; margin: 0 auto var(--space-6);">
            <div class="card text-center p-4" style="background: var(--color-bg-alt);">
              <div style="font-size: var(--text-2xl); font-family: var(--font-heading); color: var(--color-success);">${correctCount}</div>
              <div class="text-sm text-muted">Correct</div>
            </div>
            <div class="card text-center p-4" style="background: var(--color-bg-alt);">
              <div style="font-size: var(--text-2xl); font-family: var(--font-heading); color: var(--color-primary);">${this.score}</div>
              <div class="text-sm text-muted">Points</div>
            </div>
            <div class="card text-center p-4" style="background: var(--color-bg-alt);">
              <div style="font-size: var(--text-2xl); font-family: var(--font-heading); color: var(--color-teal);">${minutes}:${String(seconds).padStart(2, '0')}</div>
              <div class="text-sm text-muted">Time</div>
            </div>
            <div class="card text-center p-4" style="background: var(--color-bg-alt);">
              <div style="font-size: var(--text-2xl); font-family: var(--font-heading); color: var(--color-coral);">${totalQuestions - correctCount}</div>
              <div class="text-sm text-muted">Missed</div>
            </div>
          </div>

          <div class="flex-center gap-4">
            <button class="btn btn-primary btn-lg" onclick="window._quizEngine.start()">
              Try Again 🔄
            </button>
            <button class="btn btn-outline btn-lg" onclick="window._quizEngine.showReview()">
              Review Answers 📋
            </button>
          </div>
        </div>
      </div>
    `;

    // Callback
    this.onComplete({
      score: this.score,
      percentage,
      correctCount,
      totalQuestions,
      timeTaken,
      stars,
      tier: this.tier,
      answers: this.answers
    });
  }

  showReview() {
    let reviewHTML = this.answers.map((a, i) => {
      const q = a.question;
      const icon = a.correct ? '✅' : '❌';
      const bgClass = a.correct ? 'correct' : 'wrong';
      return `
        <div class="card mb-4 quiz-feedback ${bgClass} show" style="text-align: left;">
          <strong>${icon} Q${i + 1}: ${q.question}</strong>
          <div class="mt-2">
            ${!a.correct ? `<div>Your answer was wrong</div>` : ''}
            <div>Correct answer: <strong>${Array.isArray(q.answer) ? q.answer[0] : q.answer}</strong></div>
            ${q.explanation ? `<div class="hint mt-2">${q.explanation}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="quiz-container">
        <h3 class="text-center mb-6">Answer Review</h3>
        ${reviewHTML}
        <div class="flex-center gap-4 mt-6">
          <button class="btn btn-primary btn-lg" onclick="window._quizEngine.start()">
            Try Again 🔄
          </button>
          <button class="btn btn-outline" onclick="window._quizEngine.showResults()">
            Back to Results
          </button>
        </div>
      </div>
    `;
  }

  escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// Export
window.QuizEngine = QuizEngine;

/* ============================================
   CRISLYN'S LEARNING PORTAL — Progress System
   ============================================
   Persistent XP, levels, badges, streaks.
   All data stored in localStorage.
   ============================================ */

const Progress = {
  STORAGE_KEY: 'crislyn_progress_v2',

  // --- Level Thresholds ---
  levels: [
    { name: 'Beginner', minXP: 0, icon: '🌱', color: '#22C55E' },
    { name: 'Explorer', minXP: 100, icon: '🌿', color: '#0D9488' },
    { name: 'Learner', minXP: 300, icon: '📚', color: '#3B82F6' },
    { name: 'Adventurer', minXP: 600, icon: '⚔️', color: '#7C3AED' },
    { name: 'Scholar', minXP: 1000, icon: '🎓', color: '#6B21A8' },
    { name: 'Master', minXP: 1500, icon: '👑', color: '#EAB308' },
    { name: 'Champion', minXP: 2500, icon: '🏆', color: '#F97316' },
    { name: 'Legend', minXP: 4000, icon: '⭐', color: '#EC4899' },
  ],

  // --- Badge Definitions ---
  badges: {
    // Chapter 1 badges
    first_lesson: { name: 'First Steps', icon: '👣', desc: 'Open your first lesson', condition: (d) => d.lessonsOpened >= 1 },
    lesson_explorer: { name: 'Curious Mind', icon: '🔍', desc: 'Open all 9 lessons', condition: (d) => d.lessonsOpened >= 9 },
    first_practice: { name: 'Practice Beginner', icon: '✏️', desc: 'Complete your first exercise', condition: (d) => d.exercisesCompleted >= 1 },
    practice_star: { name: 'Practice Star', icon: '⭐', desc: 'Complete all 8 exercises', condition: (d) => d.exercisesCompleted >= 8 },
    practice_perfect: { name: 'Perfectionist', icon: '💎', desc: 'Score 100% on any exercise', condition: (d) => d.perfectExercises >= 1 },
    quiz_starter: { name: 'Quiz Taker', icon: '🎯', desc: 'Complete your first quiz', condition: (d) => d.quizzesCompleted >= 1 },
    explorer_pass: { name: 'Explorer Badge', icon: '🌿', desc: 'Pass Explorer quiz (70%+)', condition: (d) => d.explorerBest >= 70 },
    adventurer_pass: { name: 'Adventurer Badge', icon: '⚔️', desc: 'Pass Adventurer quiz (70%+)', condition: (d) => d.adventurerBest >= 70 },
    champion_pass: { name: 'Champion Badge', icon: '👑', desc: 'Pass Champion quiz (70%+)', condition: (d) => d.championBest >= 70 },
    quiz_master: { name: 'Quiz Master', icon: '🏆', desc: 'Score 90%+ on any quiz', condition: (d) => d.bestQuizScore >= 90 },
    quiz_perfect: { name: 'Flawless Victory', icon: '💯', desc: 'Score 100% on any quiz', condition: (d) => d.bestQuizScore >= 100 },
    century: { name: 'Century!', icon: '💪', desc: 'Earn 100 XP total', condition: (d) => d.totalXP >= 100 },
    five_hundred: { name: 'Rising Star', icon: '🌟', desc: 'Earn 500 XP total', condition: (d) => d.totalXP >= 500 },
    thousand: { name: 'Superstar', icon: '🔥', desc: 'Earn 1000 XP total', condition: (d) => d.totalXP >= 1000 },
    streak_3: { name: '3-Day Streak', icon: '🔥', desc: 'Learn 3 days in a row', condition: (d) => d.bestStreak >= 3 },
    streak_7: { name: 'Week Warrior', icon: '⚡', desc: 'Learn 7 days in a row', condition: (d) => d.bestStreak >= 7 },
    worksheet_printed: { name: 'Paper & Pen', icon: '🖨️', desc: 'Open a printable worksheet', condition: (d) => d.worksheetOpened >= 1 },
    speed_demon: { name: 'Speed Demon', icon: '⚡', desc: 'Complete a quiz in under 2 minutes', condition: (d) => d.fastestQuiz > 0 && d.fastestQuiz <= 120 },
    number_names_pro: { name: 'Name Wizard', icon: '📝', desc: 'Score 80%+ on Number Names exercise', condition: (d) => (d.exerciseScores?.names || 0) >= 80 },
    roman_expert: { name: 'Roman Scholar', icon: '🏛️', desc: 'Score 80%+ on Roman Numerals exercise', condition: (d) => (d.exerciseScores?.roman || 0) >= 80 },
    comparison_king: { name: 'Comparison King', icon: '⚖️', desc: 'Score 80%+ on Comparison exercise', condition: (d) => (d.exerciseScores?.compare || 0) >= 80 },
  },

  // --- XP Awards ---
  xpValues: {
    lessonOpen: 5,
    exerciseComplete: 15,
    exercisePerfect: 30,      // bonus for 100%
    exerciseGood: 10,         // bonus for 80%+
    quizComplete: 20,
    quizPass70: 25,           // bonus for 70%+
    quizPass90: 40,           // bonus for 90%+
    quizPerfect: 60,          // bonus for 100%
    dailyLogin: 10,
    streakBonus: 5,           // per day of streak
    badgeEarned: 20,          // bonus per badge
    worksheetOpen: 10,
  },

  // --- Core State ---
  data: null,

  init() {
    this.load();
    this.checkDailyLogin();
    this.renderGamificationBar();
  },

  getDefaultData() {
    return {
      totalXP: 0,
      lessonsOpened: 0,
      lessonsOpenedSet: [],
      exercisesCompleted: 0,
      exercisesCompletedSet: [],
      exerciseScores: {},
      perfectExercises: 0,
      quizzesCompleted: 0,
      bestQuizScore: 0,
      explorerBest: 0,
      adventurerBest: 0,
      championBest: 0,
      fastestQuiz: 0,
      earnedBadges: [],
      worksheetOpened: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      dailyXPAwarded: false,
      totalCorrectAnswers: 0,
      totalAnswered: 0,
    };
  },

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      this.data = saved ? { ...this.getDefaultData(), ...JSON.parse(saved) } : this.getDefaultData();
    } catch {
      this.data = this.getDefaultData();
    }
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save progress:', e);
    }
  },

  // --- XP Management ---
  addXP(amount, reason) {
    const prevLevel = this.getLevel();
    this.data.totalXP += amount;
    this.save();

    const newLevel = this.getLevel();
    if (newLevel.name !== prevLevel.name) {
      this.showLevelUp(newLevel);
    }

    this.updateXPDisplay();
    Toast.show(`+${amount} XP — ${reason}`, 'xp', 2500);

    // Check badges after XP change
    this.checkBadges();
  },

  getLevel() {
    let current = this.levels[0];
    for (const level of this.levels) {
      if (this.data.totalXP >= level.minXP) {
        current = level;
      } else {
        break;
      }
    }
    return current;
  },

  getNextLevel() {
    const current = this.getLevel();
    const idx = this.levels.indexOf(current);
    return idx < this.levels.length - 1 ? this.levels[idx + 1] : null;
  },

  getLevelProgress() {
    const current = this.getLevel();
    const next = this.getNextLevel();
    if (!next) return 100;
    const progressInLevel = this.data.totalXP - current.minXP;
    const levelRange = next.minXP - current.minXP;
    return Math.min(100, Math.round((progressInLevel / levelRange) * 100));
  },

  // --- Streak ---
  checkDailyLogin() {
    const today = new Date().toDateString();
    if (this.data.lastActiveDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (this.data.lastActiveDate === yesterday) {
      this.data.currentStreak++;
    } else if (this.data.lastActiveDate !== today) {
      this.data.currentStreak = 1;
    }

    if (this.data.currentStreak > this.data.bestStreak) {
      this.data.bestStreak = this.data.currentStreak;
    }

    this.data.lastActiveDate = today;

    if (!this.data.dailyXPAwarded) {
      this.data.dailyXPAwarded = true;
      const streakXP = this.xpValues.dailyLogin + (this.data.currentStreak * this.xpValues.streakBonus);
      this.data.totalXP += streakXP;
      setTimeout(() => {
        Toast.show(`+${streakXP} XP — Day ${this.data.currentStreak} streak! 🔥`, 'xp', 3000);
      }, 1000);
    }

    this.save();
  },

  // --- Event Tracking ---
  trackLessonOpen(lessonId) {
    if (!this.data.lessonsOpenedSet.includes(lessonId)) {
      this.data.lessonsOpenedSet.push(lessonId);
      this.data.lessonsOpened = this.data.lessonsOpenedSet.length;
      this.addXP(this.xpValues.lessonOpen, `Lesson opened`);
    }
  },

  trackExerciseComplete(exerciseId, score, total) {
    const pct = Math.round((score / total) * 100);
    this.data.exerciseScores = this.data.exerciseScores || {};
    const prevBest = this.data.exerciseScores[exerciseId] || 0;

    if (pct > prevBest) {
      this.data.exerciseScores[exerciseId] = pct;
    }

    if (!this.data.exercisesCompletedSet.includes(exerciseId)) {
      this.data.exercisesCompletedSet.push(exerciseId);
      this.data.exercisesCompleted = this.data.exercisesCompletedSet.length;
    }

    this.data.totalCorrectAnswers += score;
    this.data.totalAnswered += total;

    let xp = this.xpValues.exerciseComplete;
    let reason = `Exercise done (${pct}%)`;

    if (pct === 100) {
      this.data.perfectExercises++;
      xp += this.xpValues.exercisePerfect;
      reason = `Perfect score! (${pct}%)`;
    } else if (pct >= 80) {
      xp += this.xpValues.exerciseGood;
      reason = `Great score! (${pct}%)`;
    }

    this.addXP(xp, reason);
  },

  trackQuizComplete(tier, percentage, timeTaken) {
    this.data.quizzesCompleted++;

    if (percentage > this.data.bestQuizScore) {
      this.data.bestQuizScore = percentage;
    }

    if (tier === 'explorer' && percentage > this.data.explorerBest) {
      this.data.explorerBest = percentage;
    }
    if (tier === 'adventurer' && percentage > this.data.adventurerBest) {
      this.data.adventurerBest = percentage;
    }
    if (tier === 'champion' && percentage > this.data.championBest) {
      this.data.championBest = percentage;
    }

    if (this.data.fastestQuiz === 0 || timeTaken < this.data.fastestQuiz) {
      this.data.fastestQuiz = timeTaken;
    }

    let xp = this.xpValues.quizComplete;
    let reason = `Quiz completed (${percentage}%)`;

    if (percentage === 100) {
      xp += this.xpValues.quizPerfect;
      reason = `PERFECT quiz! 💯`;
    } else if (percentage >= 90) {
      xp += this.xpValues.quizPass90;
      reason = `Outstanding quiz! (${percentage}%)`;
    } else if (percentage >= 70) {
      xp += this.xpValues.quizPass70;
      reason = `Quiz passed! (${percentage}%)`;
    }

    this.addXP(xp, reason);
  },

  trackWorksheetOpen() {
    if (this.data.worksheetOpened === 0) {
      this.data.worksheetOpened = 1;
      this.addXP(this.xpValues.worksheetOpen, 'Worksheet opened');
    }
  },

  // --- Badge System ---
  checkBadges() {
    let newBadges = [];

    for (const [id, badge] of Object.entries(this.badges)) {
      if (!this.data.earnedBadges.includes(id) && badge.condition(this.data)) {
        this.data.earnedBadges.push(id);
        newBadges.push({ id, ...badge });
      }
    }

    if (newBadges.length > 0) {
      this.save();
      newBadges.forEach((badge, i) => {
        setTimeout(() => {
          this.showBadgeEarned(badge);
          // Badge XP (don't re-trigger badge check)
          this.data.totalXP += this.xpValues.badgeEarned;
          this.save();
          this.updateXPDisplay();
        }, i * 2000);
      });
    }
  },

  showBadgeEarned(badge) {
    AudioManager.playTone('levelup');
    Confetti.launch(60);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `
      <div class="modal" style="text-align: center;">
        <div style="font-size: 5rem;" class="pop-in">${badge.icon}</div>
        <h2 style="margin: var(--space-3) 0; color: var(--color-primary);">Badge Earned!</h2>
        <h3 style="color: var(--color-accent-dark);">${badge.name}</h3>
        <p style="color: var(--color-text-light); margin-top: var(--space-2);">${badge.desc}</p>
        <p style="color: var(--color-accent-dark); font-weight: 700; margin-top: var(--space-2);">+${this.xpValues.badgeEarned} XP</p>
        <button class="btn btn-primary mt-6" onclick="this.closest('.modal-overlay').remove()">Awesome! 🎉</button>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
    }, 8000);
  },

  showLevelUp(level) {
    AudioManager.playTone('levelup');
    Confetti.launch(100);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `
      <div class="modal" style="text-align: center;">
        <div style="font-size: 5rem;" class="pop-in">${level.icon}</div>
        <h2 style="margin: var(--space-3) 0; color: var(--color-primary);">Level Up!</h2>
        <h3 style="color: ${level.color}; font-size: var(--text-2xl);">${level.name}</h3>
        <p style="color: var(--color-text-light); margin-top: var(--space-2);">You've reached a new level! Keep going!</p>
        <button class="btn btn-primary mt-6" onclick="this.closest('.modal-overlay').remove()">Let's Go! 🚀</button>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
    }, 8000);
  },

  // --- UI Rendering ---
  renderGamificationBar() {
    const existing = document.getElementById('gamification-bar');
    if (existing) existing.remove();

    const level = this.getLevel();
    const nextLevel = this.getNextLevel();
    const progress = this.getLevelProgress();
    const badgeCount = this.data.earnedBadges.length;
    const totalBadges = Object.keys(this.badges).length;

    const bar = document.createElement('div');
    bar.id = 'gamification-bar';
    bar.innerHTML = `
      <div class="gbar-inner">
        <div class="gbar-level" title="Level: ${level.name}">
          <span class="gbar-level-icon">${level.icon}</span>
          <span class="gbar-level-name">${level.name}</span>
        </div>
        <div class="gbar-xp">
          <div class="gbar-xp-bar">
            <div class="gbar-xp-fill" style="width: ${progress}%"></div>
          </div>
          <span class="gbar-xp-text">${this.data.totalXP} XP${nextLevel ? ` / ${nextLevel.minXP}` : ''}</span>
        </div>
        <div class="gbar-stats">
          <div class="gbar-stat" title="Badges: ${badgeCount}/${totalBadges}" onclick="Progress.showBadgePanel()">
            <span>🏅</span> <span>${badgeCount}/${totalBadges}</span>
          </div>
          <div class="gbar-stat" title="Streak: ${this.data.currentStreak} days">
            <span>🔥</span> <span>${this.data.currentStreak}</span>
          </div>
          <div class="gbar-stat" title="Accuracy: ${this.data.totalAnswered > 0 ? Math.round((this.data.totalCorrectAnswers / this.data.totalAnswered) * 100) : 0}%">
            <span>🎯</span> <span>${this.data.totalAnswered > 0 ? Math.round((this.data.totalCorrectAnswers / this.data.totalAnswered) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    `;

    // Insert after page header or at top of body
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.after(bar);
    } else {
      document.body.prepend(bar);
    }
  },

  updateXPDisplay() {
    const level = this.getLevel();
    const nextLevel = this.getNextLevel();
    const progress = this.getLevelProgress();
    const badgeCount = this.data.earnedBadges.length;
    const totalBadges = Object.keys(this.badges).length;

    const bar = document.getElementById('gamification-bar');
    if (!bar) return;

    const fill = bar.querySelector('.gbar-xp-fill');
    const xpText = bar.querySelector('.gbar-xp-text');
    const levelIcon = bar.querySelector('.gbar-level-icon');
    const levelName = bar.querySelector('.gbar-level-name');

    if (fill) fill.style.width = `${progress}%`;
    if (xpText) xpText.textContent = `${this.data.totalXP} XP${nextLevel ? ` / ${nextLevel.minXP}` : ''}`;
    if (levelIcon) levelIcon.textContent = level.icon;
    if (levelName) levelName.textContent = level.name;

    const stats = bar.querySelectorAll('.gbar-stat span:last-child');
    if (stats[0]) stats[0].textContent = `${badgeCount}/${totalBadges}`;
    if (stats[1]) stats[1].textContent = this.data.currentStreak;
    if (stats[2]) stats[2].textContent = `${this.data.totalAnswered > 0 ? Math.round((this.data.totalCorrectAnswers / this.data.totalAnswered) * 100) : 0}%`;
  },

  showBadgePanel() {
    const allBadges = Object.entries(this.badges);
    const earned = this.data.earnedBadges;

    let badgesHTML = allBadges.map(([id, badge]) => {
      const isEarned = earned.includes(id);
      return `
        <div class="badge-item ${isEarned ? 'earned' : 'locked'}">
          <div class="badge-icon">${isEarned ? badge.icon : '🔒'}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
      `;
    }).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.style.zIndex = '5000';
    overlay.innerHTML = `
      <div class="modal" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
        <h2 style="text-align: center; margin-bottom: var(--space-4);">🏅 My Badges (${earned.length}/${allBadges.length})</h2>
        <div class="badges-grid">${badgesHTML}</div>
        <div style="text-align: center; margin-top: var(--space-6);">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  },
};

// --- Gamification Bar Styles (injected) ---
const gbarStyles = document.createElement('style');
gbarStyles.textContent = `
  #gamification-bar {
    background: linear-gradient(135deg, #1E1B4B, #312E81);
    padding: 10px 0;
    position: sticky;
    top: 0;
    z-index: 99;
    box-shadow: 0 4px 20px rgba(30, 27, 75, 0.3);
  }

  .gbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .gbar-level {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .gbar-level-icon {
    font-size: 1.8rem;
  }

  .gbar-level-name {
    font-family: 'Fredoka One', cursive;
    color: #FACC15;
    font-size: 0.95rem;
    white-space: nowrap;
  }

  .gbar-xp {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .gbar-xp-bar {
    flex: 1;
    height: 12px;
    background: rgba(255,255,255,0.15);
    border-radius: 99px;
    overflow: hidden;
  }

  .gbar-xp-fill {
    height: 100%;
    background: linear-gradient(90deg, #A855F7, #FACC15);
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  }

  .gbar-xp-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .gbar-xp-text {
    color: rgba(255,255,255,0.8);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .gbar-stats {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
  }

  .gbar-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255,255,255,0.9);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .gbar-stat:hover {
    transform: scale(1.1);
  }

  /* Badge Panel */
  .badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .badge-item {
    text-align: center;
    padding: 16px 8px;
    border-radius: 16px;
    border: 2px solid #E9D5FF;
    transition: all 0.3s;
  }

  .badge-item.earned {
    background: #FAF5FF;
    border-color: #A855F7;
  }

  .badge-item.locked {
    opacity: 0.5;
    background: #F9FAFB;
    border-color: #E5E7EB;
  }

  .badge-icon {
    font-size: 2.2rem;
    margin-bottom: 6px;
  }

  .badge-name {
    font-family: 'Fredoka One', cursive;
    font-size: 0.8rem;
    color: #4C1D95;
    margin-bottom: 2px;
  }

  .badge-desc {
    font-size: 0.7rem;
    color: #6B7280;
  }

  @media (max-width: 768px) {
    .gbar-inner { gap: 12px; }
    .gbar-level-name { display: none; }
    .gbar-stats { gap: 10px; }
    .gbar-stat span:first-child { font-size: 1.1rem; }
  }
`;
document.head.appendChild(gbarStyles);

// Export
window.Progress = Progress;

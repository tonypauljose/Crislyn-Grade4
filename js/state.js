/* =====================================================
   CRISLYN'S WORLD — Central State System
   Stars, streaks, stickers, garden, theme, daily quest.
   All persisted in localStorage. Single source of truth.
   ===================================================== */

const State = {
  KEY: 'crislyn_world_v1',

  data: null,

  defaults() {
    return {
      stars: 0,                      // total stars earned (Duolingo XP equivalent)
      streak: 0,                     // consecutive day count
      bestStreak: 0,
      streakShieldUsed: false,       // resets each Monday
      streakShieldWeek: null,        // ISO week of last shield use
      lastActiveDate: null,          // YYYY-MM-DD
      stickers: [],                  // array of sticker IDs earned
      gardenLevel: 0,                // visual stage 0-5
      theme: 'strawberry',           // 'strawberry' | 'lavender' | 'mint'
      mascotName: 'Pixie',
      mascotMood: 'idle',
      character: 'fox',              // user's chosen 3D companion: fox/cesium/duck/brainstem            // last expression shown
      onboardingDone: false,
      dailyQuest: null,              // { date: 'YYYY-MM-DD', task, done }
      perks: {                       // unlocks for Pixie
        crown: false,                // 7-day streak
        glasses: false,              // 1st chapter complete
        cape: false,                 // 30-day streak
      },
      visited: {},                   // { 'pageId': count }
    };
  },

  init() {
    this.load();
    this.checkDailyLogin();
    this.applyTheme();
  },

  load() {
    try {
      const saved = localStorage.getItem(this.KEY);
      this.data = saved ? { ...this.defaults(), ...JSON.parse(saved) } : this.defaults();
      // Migrate older v1 progress to new system if needed
      try {
        const old = JSON.parse(localStorage.getItem('crislyn_progress_v2'));
        if (old && this.data.stars === 0 && old.totalXP > 0) {
          this.data.stars = Math.floor(old.totalXP / 5); // Convert old XP to stars
          this.data.streak = old.currentStreak || 0;
          this.data.bestStreak = old.bestStreak || 0;
        }
      } catch {}
    } catch {
      this.data = this.defaults();
    }
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch {}
  },

  // ----- Theme -----
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.data.theme);
  },
  setTheme(name) {
    this.data.theme = name;
    this.applyTheme();
    this.save();
    if (window.Pixie) Pixie.say(`Pretty! I love this theme!`, 'cheer');
  },

  // ----- Stars -----
  addStars(amount, reason) {
    if (!amount) return;
    this.data.stars += amount;
    this.checkGardenGrowth();
    this.save();
    this._animateStars();
    if (window.Pixie && reason) Pixie.flash(`+${amount} ⭐ ${reason}`);
    this._renderHUD();
    this._checkPerks();
  },

  _animateStars() {
    const el = document.querySelector('.hud-stars-num');
    if (!el) return;
    el.classList.remove('star-pop');
    void el.offsetWidth;
    el.classList.add('star-pop');
  },

  // ----- Streak -----
  checkDailyLogin() {
    const today = this._dateKey();
    if (this.data.lastActiveDate === today) return;

    const yesterday = this._dateKey(-1);

    if (this.data.lastActiveDate === yesterday) {
      this.data.streak += 1;
    } else if (this.data.lastActiveDate && this.data.lastActiveDate < yesterday) {
      // Missed a day — try shield
      const wk = this._weekKey();
      if (!this.data.streakShieldUsed || this.data.streakShieldWeek !== wk) {
        this.data.streakShieldUsed = true;
        this.data.streakShieldWeek = wk;
        // Streak preserved
        setTimeout(() => {
          if (window.Pixie) Pixie.say(`I saved your streak! 🛡️`, 'cheer', 5000);
        }, 1500);
      } else {
        this.data.streak = 1;
      }
    } else {
      this.data.streak = Math.max(this.data.streak, 1);
    }

    if (this.data.streak > this.data.bestStreak) {
      this.data.bestStreak = this.data.streak;
    }

    this.data.lastActiveDate = today;
    this._checkPerks();
    this.save();
  },

  _dateKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  },

  _weekKey() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  },

  // ----- Stickers -----
  addSticker(id, label) {
    if (this.data.stickers.find(s => s.id === id)) return false;
    this.data.stickers.push({ id, label, date: this._dateKey() });
    this.save();
    if (window.Pixie) Pixie.say(`A new sticker: ${label}! 🎉`, 'cheer', 4000);
    if (window.Confetti) Confetti.launch(60);
    this._renderHUD();
    return true;
  },

  // ----- Garden -----
  checkGardenGrowth() {
    const stars = this.data.stars;
    const newLevel = stars >= 500 ? 5
      : stars >= 200 ? 4
      : stars >= 100 ? 3
      : stars >= 50 ? 2
      : stars >= 10 ? 1 : 0;
    if (newLevel > this.data.gardenLevel) {
      this.data.gardenLevel = newLevel;
      const titles = ['', 'Sprout!', 'Sapling!', 'Flowers bloomed!', 'Butterflies arrived!', 'Treehouse appeared!'];
      setTimeout(() => {
        if (window.Pixie) Pixie.say(`Your garden grew! ${titles[newLevel]}`, 'cheer', 5000);
      }, 800);
    }
  },

  // ----- Perks (Pixie unlocks) -----
  _checkPerks() {
    if (this.data.streak >= 7 && !this.data.perks.crown) {
      this.data.perks.crown = true;
      setTimeout(() => {
        if (window.Pixie) Pixie.say(`I got a crown! Thank you for the 7-day streak! 👑`, 'cheer', 6000);
      }, 1200);
    }
    if (this.data.streak >= 30 && !this.data.perks.cape) {
      this.data.perks.cape = true;
      setTimeout(() => {
        if (window.Pixie) Pixie.say(`30 days! Look at my superhero cape! 🦸`, 'cheer', 6000);
      }, 1200);
    }
  },

  unlockGlasses() {
    if (!this.data.perks.glasses) {
      this.data.perks.glasses = true;
      this.save();
      if (window.Pixie) Pixie.say(`First chapter done — now I have glasses to read more! 🤓`, 'cheer', 5000);
    }
  },

  // ----- Daily Quest -----
  getDailyQuest() {
    const today = this._dateKey();
    if (!this.data.dailyQuest || this.data.dailyQuest.date !== today) {
      const quests = [
        { id: 'lesson', label: 'Open any chapter and read 1 lesson', stars: 10 },
        { id: 'practice', label: 'Complete 1 practice exercise', stars: 15 },
        { id: 'quiz', label: 'Take a quiz (any tier)', stars: 20 },
        { id: 'worksheet', label: 'Open a printable worksheet', stars: 10 },
        { id: 'visit', label: 'Visit 2 different subjects today', stars: 10 },
      ];
      const q = quests[Math.floor(Math.random() * quests.length)];
      this.data.dailyQuest = { date: today, ...q, done: false };
      this.save();
    }
    return this.data.dailyQuest;
  },

  completeDailyQuest() {
    const q = this.data.dailyQuest;
    if (!q || q.done) return false;
    q.done = true;
    this.addStars(q.stars, 'Daily quest done!');
    this.save();
    if (window.Pixie) Pixie.say(`Daily quest complete! You're amazing! 🎯`, 'cheer', 5000);
    return true;
  },

  // ----- HUD (top bar widget) -----
  injectHUD() {
    if (document.getElementById('crw-hud')) return;
    const hud = document.createElement('div');
    hud.id = 'crw-hud';
    hud.className = 'crw-hud';
    hud.innerHTML = `
      <div class="hud-item hud-stars" title="Stars earned">
        <span class="hud-icon">⭐</span>
        <span class="hud-stars-num">${this.data.stars}</span>
      </div>
      <div class="hud-item hud-streak ${this.data.streak > 0 ? 'active' : ''}" title="Daily streak">
        <span class="hud-icon">🔥</span>
        <span class="hud-streak-num">${this.data.streak}</span>
      </div>
      <div class="hud-item hud-stickers" title="Stickers collected" onclick="State._showStickerPanel()">
        <span class="hud-icon">🎨</span>
        <span class="hud-stickers-num">${this.data.stickers.length}</span>
      </div>
      <div class="theme-picker" title="Switch theme">
        <div class="theme-swatch strawberry ${this.data.theme === 'strawberry' ? 'active' : ''}" onclick="State.setTheme('strawberry'); State._renderHUD();" title="Strawberry Cream"></div>
        <div class="theme-swatch lavender ${this.data.theme === 'lavender' ? 'active' : ''}" onclick="State.setTheme('lavender'); State._renderHUD();" title="Lavender Dreams"></div>
        <div class="theme-swatch mint ${this.data.theme === 'mint' ? 'active' : ''}" onclick="State.setTheme('mint'); State._renderHUD();" title="Mint Sunshine"></div>
      </div>
    `;
    // Append to first .navbar/.top-bar wrapper area
    const nav = document.querySelector('.navbar .container') || document.body;
    nav.appendChild(hud);
  },

  _renderHUD() {
    const el = document.getElementById('crw-hud');
    if (!el) return;
    el.querySelector('.hud-stars-num').textContent = this.data.stars;
    el.querySelector('.hud-streak-num').textContent = this.data.streak;
    el.querySelector('.hud-stickers-num').textContent = this.data.stickers.length;
    el.querySelector('.hud-streak').classList.toggle('active', this.data.streak > 0);
    el.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('active', s.classList.contains(this.data.theme));
    });
  },

  _showStickerPanel() {
    const stickers = this.data.stickers;
    const overlay = document.createElement('div');
    overlay.className = 'crw-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const stickerEmojis = {
      'numbers-ch1': '🔢', 'sentences-ch1': '📝', 'nouns-ch2': '📦',
      'plants-ch1': '🌳', 'sangya-ch1': '📖',
    };

    overlay.innerHTML = `
      <div class="crw-modal">
        <button class="crw-modal-close" onclick="this.closest('.crw-modal-overlay').remove()">✕</button>
        <h2 style="margin-top:0;">🎨 My Sticker Collection</h2>
        <p style="color: var(--t-text-soft);">${stickers.length === 0 ? 'No stickers yet — complete a chapter to earn one!' : `You've collected ${stickers.length} sticker${stickers.length === 1 ? '' : 's'}!`}</p>
        <div class="crw-sticker-grid">
          ${stickers.map(s => `
            <div class="crw-sticker">
              <div class="crw-sticker-emoji">${stickerEmojis[s.id] || '⭐'}</div>
              <div class="crw-sticker-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },
};

// Inject HUD styles
const hudStyles = document.createElement('style');
hudStyles.textContent = `
  .crw-hud {
    display: flex; align-items: center; gap: 14px;
    padding: 6px 14px; border-radius: 99px;
    background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
    box-shadow: 0 4px 14px var(--t-shadow, rgba(0,0,0,0.1));
    flex-wrap: wrap;
  }
  .hud-item {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Fredoka One', cursive; font-size: 1rem;
    color: var(--t-text, #1F2A44); cursor: pointer;
    transition: transform 0.2s;
  }
  .hud-item:hover { transform: scale(1.1); }
  .hud-item .hud-icon { font-size: 1.2rem; }
  .hud-streak:not(.active) { opacity: 0.4; filter: grayscale(0.7); }
  .hud-stars-num.star-pop { animation: starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes starPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); color: var(--t-accent-deep, #F2B544); }
    100% { transform: scale(1); }
  }
  .crw-modal-overlay {
    position: fixed; inset: 0; background: rgba(31, 42, 68, 0.5);
    backdrop-filter: blur(6px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.25s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .crw-modal {
    background: var(--t-card, white); border-radius: 24px; padding: 30px;
    max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
    position: relative;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .crw-modal-close {
    position: absolute; top: 14px; right: 14px;
    width: 32px; height: 32px; border-radius: 50%; border: none;
    background: var(--t-bg-2, #f0f0f0); cursor: pointer;
    font-size: 1.1rem; font-weight: bold;
  }
  .crw-sticker-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 14px; margin-top: 20px;
  }
  .crw-sticker {
    text-align: center; padding: 14px 10px; border-radius: 16px;
    background: linear-gradient(135deg, var(--t-bg-1, #fff8f0), var(--t-bg-2, #fff0f5));
    border: 2px dashed var(--t-primary, #F4A6BD);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .crw-sticker:hover { transform: scale(1.08) rotate(-3deg); }
  .crw-sticker-emoji { font-size: 2.5rem; margin-bottom: 4px; }
  .crw-sticker-label { font-size: 0.85rem; font-weight: 700; color: var(--t-text, #333); }
  @media (max-width: 768px) {
    .crw-hud { gap: 8px; padding: 4px 10px; font-size: 0.9rem; }
    .hud-item .hud-icon { font-size: 1rem; }
    .theme-picker { display: none; }
  }
`;
document.head.appendChild(hudStyles);

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => State.init());
} else {
  State.init();
}

window.State = State;

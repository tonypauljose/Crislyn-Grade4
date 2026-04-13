/* ============================================
   CRISLYN'S MATH ADVENTURE — Common Utilities
   ============================================ */

// --- Audio Manager ---
const AudioManager = {
  context: null,
  sfxEnabled: false,    // SFX off by default
  musicEnabled: false,  // Music off by default
  musicGain: null,
  musicOscillators: [],
  musicPlaying: false,
  PREF_KEY: 'crislyn_audio_prefs',

  init() {
    // Load saved preferences
    this.loadPrefs();

    // Create audio context on first user interaction
    document.addEventListener('click', () => {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGain = this.context.createGain();
        this.musicGain.gain.setValueAtTime(0.06, this.context.currentTime); // Very soft
        this.musicGain.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
      // Start music if enabled
      if (this.musicEnabled && !this.musicPlaying) {
        this.startMusic();
      }
    }, { once: true });

    // Render the sound control panel
    this.renderSoundPanel();
  },

  loadPrefs() {
    try {
      const saved = localStorage.getItem(this.PREF_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        this.sfxEnabled = prefs.sfx === true;
        this.musicEnabled = prefs.music === true;
      }
    } catch {}
  },

  savePrefs() {
    try {
      localStorage.setItem(this.PREF_KEY, JSON.stringify({
        sfx: this.sfxEnabled,
        music: this.musicEnabled
      }));
    } catch {}
  },

  // Play a simple tone for correct/wrong feedback
  playTone(type) {
    if (!this.sfxEnabled || !this.context) return;

    if (type === 'correct') {
      // Happy ascending chime
      this._playNotes([
        { freq: 523, time: 0, dur: 0.3, vol: 0.25 },
        { freq: 659, time: 0.1, dur: 0.3, vol: 0.25 },
        { freq: 784, time: 0.2, dur: 0.4, vol: 0.3 },
      ]);
    } else if (type === 'wrong') {
      // Soft descending boing
      this._playNotes([
        { freq: 330, time: 0, dur: 0.2, vol: 0.15 },
        { freq: 220, time: 0.12, dur: 0.25, vol: 0.12 },
      ]);
    } else if (type === 'click') {
      this._playNotes([
        { freq: 800, time: 0, dur: 0.05, vol: 0.08 },
      ]);
    } else if (type === 'levelup') {
      // Triumphant fanfare
      this._playNotes([
        { freq: 523, time: 0, dur: 0.4, vol: 0.2 },
        { freq: 659, time: 0.15, dur: 0.4, vol: 0.22 },
        { freq: 784, time: 0.3, dur: 0.4, vol: 0.25 },
        { freq: 1047, time: 0.45, dur: 0.5, vol: 0.3 },
      ]);
    } else if (type === 'badge') {
      // Magical sparkle
      this._playNotes([
        { freq: 880, time: 0, dur: 0.15, vol: 0.15 },
        { freq: 1109, time: 0.08, dur: 0.15, vol: 0.15 },
        { freq: 1319, time: 0.16, dur: 0.15, vol: 0.18 },
        { freq: 1760, time: 0.24, dur: 0.3, vol: 0.2 },
      ]);
    }
  },

  _playNotes(notes) {
    if (!this.context) return;
    notes.forEach(n => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.frequency.setValueAtTime(n.freq, this.context.currentTime + n.time);
      gain.gain.setValueAtTime(n.vol, this.context.currentTime + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + n.time + n.dur);
      osc.start(this.context.currentTime + n.time);
      osc.stop(this.context.currentTime + n.time + n.dur);
    });
  },

  // --- Background Music (procedural, soft ambient) ---
  startMusic() {
    if (!this.context || this.musicPlaying) return;
    this.musicPlaying = true;

    // Soft ambient pad — two detuned oscillators for warmth
    const playChord = (freqs, startTime, duration) => {
      freqs.forEach(freq => {
        const osc = this.context.createOscillator();
        const g = this.context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(1, startTime + 1.5);
        g.gain.linearRampToValueAtTime(0, startTime + duration - 0.5);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
        this.musicOscillators.push(osc);
      });
    };

    // Gentle chord progression: C major → A minor → F major → G major (loop)
    const chords = [
      [261.6, 329.6, 392.0],   // C major
      [220.0, 261.6, 329.6],   // A minor
      [174.6, 220.0, 261.6],   // F major
      [196.0, 246.9, 293.7],   // G major
    ];
    const chordDuration = 6; // seconds per chord

    const scheduleLoop = () => {
      if (!this.musicEnabled || !this.musicPlaying) return;
      const now = this.context.currentTime;
      chords.forEach((chord, i) => {
        playChord(chord, now + i * chordDuration, chordDuration + 0.5);
      });
      // Schedule next loop
      this._musicTimer = setTimeout(scheduleLoop, chords.length * chordDuration * 1000 - 500);
    };

    scheduleLoop();
  },

  stopMusic() {
    this.musicPlaying = false;
    if (this._musicTimer) clearTimeout(this._musicTimer);
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.musicOscillators = [];
  },

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    this.savePrefs();
    this.updateSoundPanel();
    if (this.sfxEnabled) this.playTone('click');
  },

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.savePrefs();
    this.updateSoundPanel();
    if (this.musicEnabled) {
      if (this.context) this.startMusic();
    } else {
      this.stopMusic();
    }
  },

  // --- Sound Control Panel UI ---
  renderSoundPanel() {
    const panel = document.createElement('div');
    panel.id = 'sound-panel';
    panel.innerHTML = `
      <button class="sound-toggle-btn" id="sound-main-btn" onclick="AudioManager.toggleSoundMenu()" title="Sound Settings">
        <span id="sound-main-icon">${this.sfxEnabled ? '🔊' : '🔇'}</span>
      </button>
      <div class="sound-menu hidden" id="sound-menu">
        <div class="sound-menu-item" onclick="AudioManager.toggleSFX()">
          <span id="sfx-icon">${this.sfxEnabled ? '🔊' : '🔇'}</span>
          <span>Sound Effects</span>
          <span class="sound-status" id="sfx-status">${this.sfxEnabled ? 'ON' : 'OFF'}</span>
        </div>
        <div class="sound-menu-item" onclick="AudioManager.toggleMusic()">
          <span id="music-icon">${this.musicEnabled ? '🎵' : '🎵'}</span>
          <span>Background Music</span>
          <span class="sound-status" id="music-status">${this.musicEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('sound-menu');
      const btn = document.getElementById('sound-main-btn');
      if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
  },

  toggleSoundMenu() {
    const menu = document.getElementById('sound-menu');
    if (menu) menu.classList.toggle('hidden');
  },

  updateSoundPanel() {
    const mainIcon = document.getElementById('sound-main-icon');
    const sfxIcon = document.getElementById('sfx-icon');
    const sfxStatus = document.getElementById('sfx-status');
    const musicStatus = document.getElementById('music-status');

    if (mainIcon) mainIcon.textContent = this.sfxEnabled || this.musicEnabled ? '🔊' : '🔇';
    if (sfxIcon) sfxIcon.textContent = this.sfxEnabled ? '🔊' : '🔇';
    if (sfxStatus) {
      sfxStatus.textContent = this.sfxEnabled ? 'ON' : 'OFF';
      sfxStatus.className = `sound-status ${this.sfxEnabled ? 'on' : ''}`;
    }
    if (musicStatus) {
      musicStatus.textContent = this.musicEnabled ? 'ON' : 'OFF';
      musicStatus.className = `sound-status ${this.musicEnabled ? 'on' : ''}`;
    }
  }
};

// --- Sound Panel Styles ---
const soundStyles = document.createElement('style');
soundStyles.textContent = `
  #sound-panel {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 4000;
  }

  .sound-toggle-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4C1D95, #7C3AED);
    border: 3px solid rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(107, 33, 168, 0.4);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sound-toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(107, 33, 168, 0.5);
  }

  .sound-menu {
    position: absolute;
    bottom: 62px;
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    padding: 8px;
    min-width: 220px;
    animation: fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sound-menu.hidden {
    display: none;
  }

  .sound-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    color: #1E1B4B;
    transition: background 0.2s;
  }

  .sound-menu-item:hover {
    background: #F3E8FF;
  }

  .sound-status {
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 99px;
    background: #F3F4F6;
    color: #6B7280;
  }

  .sound-status.on {
    background: #DCFCE7;
    color: #166534;
  }

  @media (max-width: 768px) {
    #sound-panel {
      bottom: 16px;
      right: 16px;
    }
    .sound-toggle-btn {
      width: 44px;
      height: 44px;
      font-size: 1.2rem;
    }
  }
`;
document.head.appendChild(soundStyles);

// --- Confetti System ---
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  launch(count = 80) {
    if (!this.ctx) this.init();

    const colors = ['#6B21A8', '#A855F7', '#FACC15', '#0D9488', '#F97316', '#EC4899', '#22C55E', '#3B82F6'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * -18 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.3,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  },

  animate() {
    if (!this.ctx || this.particles.length === 0) {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;
      p.vx *= 0.99;

      if (p.opacity <= 0) return false;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
      return true;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

// --- Toast Notifications ---
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();

    const icons = {
      success: '✅',
      error: '❌',
      xp: '⭐',
      info: '💡',
      badge: '🏆'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// --- Utility Functions ---
const Utils = {
  // Format number with Indian numbering system (commas)
  formatIndian(num) {
    const str = String(num);
    if (str.length <= 3) return str;
    let result = str.slice(-3);
    let rest = str.slice(0, -3);
    while (rest.length > 2) {
      result = rest.slice(-2) + ',' + result;
      rest = rest.slice(0, -2);
    }
    if (rest.length > 0) {
      result = rest + ',' + result;
    }
    return result;
  },

  // Format number with International numbering system
  formatInternational(num) {
    return Number(num).toLocaleString('en-US');
  },

  // Convert number to Indian number name
  numberToIndianName(num) {
    if (num === 0) return 'zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    function twoDigit(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
    }

    function threeDigit(n) {
      if (n < 100) return twoDigit(n);
      return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + twoDigit(n % 100) : '');
    }

    let result = '';
    if (num >= 10000000) {
      result += threeDigit(Math.floor(num / 10000000)) + ' crore ';
      num %= 10000000;
    }
    if (num >= 100000) {
      result += twoDigit(Math.floor(num / 100000)) + ' lakh ';
      num %= 100000;
    }
    if (num >= 1000) {
      result += twoDigit(Math.floor(num / 1000)) + ' thousand ';
      num %= 1000;
    }
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    if (num > 0) {
      if (result) result += 'and ';
      result += twoDigit(num);
    }

    return result.trim();
  },

  // Convert number to expanded form string
  expandedForm(num) {
    const digits = String(num).split('').reverse();
    const parts = [];
    const placeValues = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];

    for (let i = digits.length - 1; i >= 0; i--) {
      const d = parseInt(digits[i]);
      if (d > 0) {
        parts.push(Utils.formatIndian(d * placeValues[i]));
      }
    }
    return parts.join(' + ');
  },

  // Get place value name
  placeValueName(position) {
    const names = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands', 'Lakhs', 'Ten Lakhs'];
    return names[position] || '';
  },

  // Get place value short label
  placeValueShort(position) {
    const labels = ['O', 'T', 'H', 'Th', 'TTh', 'L', 'TL'];
    return labels[position] || '';
  },

  // Convert number to Roman numeral
  toRoman(num) {
    if (num < 1 || num > 3999) return '';
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) {
        result += syms[i];
        num -= vals[i];
      }
    }
    return result;
  },

  // Convert Roman numeral to number
  fromRoman(roman) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    const upper = roman.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const curr = map[upper[i]];
      const next = map[upper[i + 1]];
      if (next && curr < next) {
        result -= curr;
      } else {
        result += curr;
      }
    }
    return result;
  },

  // Generate random integer between min and max (inclusive)
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Shuffle an array (Fisher-Yates)
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Generate unique random digits
  randomDigits(count, includeZero = true) {
    const pool = includeZero ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return this.shuffle(pool).slice(0, count);
  },

  // Form greatest number from digits
  greatestNumber(digits) {
    return parseInt([...digits].sort((a, b) => b - a).join(''));
  },

  // Form smallest number from digits (handle leading zero)
  smallestNumber(digits) {
    const sorted = [...digits].sort((a, b) => a - b);
    // Move first non-zero digit to front
    if (sorted[0] === 0) {
      const firstNonZero = sorted.findIndex(d => d > 0);
      if (firstNonZero > 0) {
        [sorted[0], sorted[firstNonZero]] = [sorted[firstNonZero], sorted[0]];
      }
    }
    return parseInt(sorted.join(''));
  },

  // Get predecessor
  predecessor(num) {
    return num - 1;
  },

  // Get successor
  successor(num) {
    return num + 1;
  },

  // Round to nearest place value
  roundTo(num, place) {
    return Math.round(num / place) * place;
  },

  // Fuzzy string match for number names (case-insensitive, ignoring extra spaces/hyphens)
  fuzzyMatchName(input, expected) {
    const normalize = s => s.toLowerCase().replace(/[-\s]+/g, ' ').trim();
    return normalize(input) === normalize(expected);
  },

  // Format date as DD MMMM YYYY
  formatDate(date) {
    const d = date || new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  // Debounce
  debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  // Get ordinal suffix
  ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
};

// --- Initialize on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();
  Toast.init();
  Confetti.init();
});

// --- Tab Navigation ---
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetContent = document.getElementById(target);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      AudioManager.playTone('click');
    });
  });
}

// --- Lesson Card Toggle ---
function initLessonCards() {
  document.querySelectorAll('.lesson-card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.parentElement;
      card.classList.toggle('open');
      AudioManager.playTone('click');
    });
  });
}

// Export for use in other files
window.AudioManager = AudioManager;
window.Confetti = Confetti;
window.Toast = Toast;
window.Utils = Utils;
window.initTabs = initTabs;
window.initLessonCards = initLessonCards;

/* ============================================
   CRISLYN'S MATH ADVENTURE — Common Utilities
   ============================================ */

// --- Audio Manager ---
const AudioManager = {
  context: null,
  enabled: true,
  sounds: {},

  init() {
    document.addEventListener('click', () => {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
    }, { once: true });
  },

  // Play a simple tone for correct/wrong feedback
  playTone(type) {
    if (!this.enabled || !this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.connect(gain);
    gain.connect(this.context.destination);

    if (type === 'correct') {
      // Happy ascending chime
      osc.frequency.setValueAtTime(523, this.context.currentTime); // C5
      osc.frequency.setValueAtTime(659, this.context.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, this.context.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.3, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
      osc.start(this.context.currentTime);
      osc.stop(this.context.currentTime + 0.5);
    } else if (type === 'wrong') {
      // Soft descending boing
      osc.frequency.setValueAtTime(330, this.context.currentTime);
      osc.frequency.setValueAtTime(220, this.context.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
      osc.start(this.context.currentTime);
      osc.stop(this.context.currentTime + 0.3);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, this.context.currentTime);
      gain.gain.setValueAtTime(0.1, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
      osc.start(this.context.currentTime);
      osc.stop(this.context.currentTime + 0.05);
    } else if (type === 'levelup') {
      // Triumphant fanfare
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const o = this.context.createOscillator();
        const g = this.context.createGain();
        o.connect(g);
        g.connect(this.context.destination);
        o.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.15);
        g.gain.setValueAtTime(0.25, this.context.currentTime + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.15 + 0.4);
        o.start(this.context.currentTime + i * 0.15);
        o.stop(this.context.currentTime + i * 0.15 + 0.4);
      });
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
};

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

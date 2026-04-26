/* =====================================================
   PIXIE — The magical kitten mascot
   - Pure SVG character with 5 expressions
   - Speech bubble system with auto-dismiss
   - Reactive idle animations + sparkle trail
   - Listens to State events (stars, streaks, perks)
   ===================================================== */

const Pixie = {
  expression: 'idle',
  bubbleTimeout: null,

  // Page-specific greetings
  greetings: {
    'index': [
      "Hi Crislyn! Ready for an adventure today? ✨",
      "Welcome back! What should we learn today?",
      "Hello hello! I missed you!",
      "Yay, you're here! Let's have fun!",
    ],
    'learning': [
      "Pick a subject! Each one is a different adventure!",
      "Where shall we explore today?",
      "Pick wisely... they're all so fun!",
    ],
    'maths': [
      "Numbers are like puzzle pieces — let's solve some!",
      "Maths is my favourite! It's like magic!",
      "Tap any chapter to start your adventure!",
    ],
    'english': [
      "Let's play with words today!",
      "I love stories! Pick a chapter!",
    ],
    'evs': [
      "Nature is so cool! Let's explore!",
      "Plants, animals, water — wow!",
    ],
    'hindi': [
      "हिंदी is fun once you know the secret!",
      "Don't worry, I'll help you!",
    ],
    'chapter': [
      "Take it slow — I'm right here with you!",
      "You can do this! One bit at a time!",
      "Let's read this together!",
    ],
    'quiz': [
      "Take a deep breath — you got this!",
      "Trust your brain — it's smart!",
      "Wrong answer? No big deal! Try again.",
    ],
  },

  init() {
    this.render();
    this.scheduleGreeting();
    this.observeInteractions();
  },

  render() {
    if (document.getElementById('pixie-container')) return;
    const container = document.createElement('div');
    container.className = 'pixie-container';
    container.id = 'pixie-container';
    container.onclick = () => this.onClick();
    container.innerHTML = `
      <span class="pixie-sparkle">✨</span>
      <span class="pixie-sparkle">⭐</span>
      <span class="pixie-sparkle">💖</span>
      ${this.svg()}
    `;
    document.body.appendChild(container);
  },

  svg() {
    const showCrown = State.data && State.data.perks && State.data.perks.crown;
    const showGlasses = State.data && State.data.perks && State.data.perks.glasses;
    const showCape = State.data && State.data.perks && State.data.perks.cape;

    return `
      <svg class="pixie-svg" id="pixie-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pixieBody" cx="50%" cy="40%">
            <stop offset="0%" stop-color="#FFE4F0"/>
            <stop offset="100%" stop-color="#F4A6BD"/>
          </radialGradient>
          <linearGradient id="pixieHorn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700"/>
            <stop offset="100%" stop-color="#FFA500"/>
          </linearGradient>
          <radialGradient id="pixieCheek" cx="50%" cy="50%">
            <stop offset="0%" stop-color="rgba(255,150,180,0.7)"/>
            <stop offset="100%" stop-color="rgba(255,150,180,0)"/>
          </radialGradient>
        </defs>

        ${showCape ? `
          <!-- Superhero cape -->
          <path d="M 30 60 Q 20 95 25 105 Q 40 85 60 90 Q 80 85 95 105 Q 100 95 90 60 Z" fill="#7C3AED" opacity="0.85"/>
          <path d="M 30 60 Q 60 70 90 60" fill="none" stroke="#5B21B6" stroke-width="2"/>
        ` : ''}

        <!-- Body / face -->
        <ellipse cx="60" cy="68" rx="36" ry="32" fill="url(#pixieBody)"/>

        <!-- Ears -->
        <path d="M 30 50 L 26 28 L 44 42 Z" fill="url(#pixieBody)"/>
        <path d="M 90 50 L 94 28 L 76 42 Z" fill="url(#pixieBody)"/>
        <!-- Inner ears -->
        <path d="M 32 46 L 31 33 L 40 41 Z" fill="#F8C8D5"/>
        <path d="M 88 46 L 89 33 L 80 41 Z" fill="#F8C8D5"/>

        ${showCrown ? `
          <!-- Crown -->
          <path d="M 44 30 L 50 18 L 56 26 L 60 14 L 64 26 L 70 18 L 76 30 Z"
                fill="url(#pixieHorn)" stroke="#B8860B" stroke-width="1"/>
          <circle cx="60" cy="22" r="2" fill="#FF1493"/>
          <circle cx="50" cy="26" r="1.5" fill="#00BFFF"/>
          <circle cx="70" cy="26" r="1.5" fill="#00BFFF"/>
        ` : `
          <!-- Unicorn horn -->
          <path d="M 56 28 L 60 8 L 64 28 Z" fill="url(#pixieHorn)" stroke="#B8860B" stroke-width="1"/>
        `}

        <!-- Cheeks -->
        <ellipse cx="38" cy="72" rx="9" ry="6" fill="url(#pixieCheek)"/>
        <ellipse cx="82" cy="72" rx="9" ry="6" fill="url(#pixieCheek)"/>

        <!-- Eyes — these are replaced based on expression -->
        <g id="pixie-eyes">${this._eyesFor(this.expression)}</g>

        ${showGlasses ? `
          <!-- Glasses -->
          <circle cx="50" cy="62" r="10" fill="none" stroke="#1F2A44" stroke-width="2.5"/>
          <circle cx="70" cy="62" r="10" fill="none" stroke="#1F2A44" stroke-width="2.5"/>
          <line x1="60" y1="62" x2="60" y2="62" stroke="#1F2A44" stroke-width="2.5"/>
          <path d="M 60 62 L 60 62" stroke="#1F2A44" stroke-width="2.5"/>
          <line x1="60" y1="62" x2="60" y2="62" stroke="#1F2A44" stroke-width="2.5"/>
          <line x1="59" y1="62" x2="61" y2="62" stroke="#1F2A44" stroke-width="2.5"/>
        ` : ''}

        <!-- Nose -->
        <path d="M 58 76 L 62 76 L 60 80 Z" fill="#E68FA0"/>

        <!-- Mouth -->
        <g id="pixie-mouth">${this._mouthFor(this.expression)}</g>

        <!-- Whiskers -->
        <line x1="20" y1="78" x2="32" y2="76" stroke="#9C7A8C" stroke-width="1" opacity="0.6"/>
        <line x1="20" y1="82" x2="32" y2="82" stroke="#9C7A8C" stroke-width="1" opacity="0.6"/>
        <line x1="100" y1="78" x2="88" y2="76" stroke="#9C7A8C" stroke-width="1" opacity="0.6"/>
        <line x1="100" y1="82" x2="88" y2="82" stroke="#9C7A8C" stroke-width="1" opacity="0.6"/>
      </svg>
    `;
  },

  _eyesFor(expr) {
    switch (expr) {
      case 'cheer':
        return `
          <path d="M 44 60 Q 50 54 56 60" stroke="#1F2A44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 64 60 Q 70 54 76 60" stroke="#1F2A44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `;
      case 'think':
        return `
          <ellipse cx="50" cy="62" rx="3" ry="3.5" fill="#1F2A44"/>
          <circle cx="51.5" cy="60.5" r="1" fill="white"/>
          <ellipse cx="70" cy="62" rx="2" ry="2.5" fill="#1F2A44"/>
        `;
      case 'sleep':
        return `
          <path d="M 44 62 Q 50 64 56 62" stroke="#1F2A44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 64 62 Q 70 64 76 62" stroke="#1F2A44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <text x="80" y="50" font-size="10" fill="#6EC6F0" font-family="serif">Z</text>
        `;
      case 'sad':
        return `
          <ellipse cx="50" cy="63" rx="3.5" ry="4" fill="#1F2A44"/>
          <circle cx="51" cy="61" r="1" fill="white"/>
          <ellipse cx="70" cy="63" rx="3.5" ry="4" fill="#1F2A44"/>
          <circle cx="71" cy="61" r="1" fill="white"/>
          <ellipse cx="50" cy="68" rx="1.5" ry="2" fill="#6EC6F0" opacity="0.7"/>
        `;
      default: // idle
        return `
          <ellipse cx="50" cy="62" rx="3.5" ry="4" fill="#1F2A44"/>
          <circle cx="51.5" cy="60.5" r="1.2" fill="white"/>
          <ellipse cx="70" cy="62" rx="3.5" ry="4" fill="#1F2A44"/>
          <circle cx="71.5" cy="60.5" r="1.2" fill="white"/>
        `;
    }
  },

  _mouthFor(expr) {
    switch (expr) {
      case 'cheer':
        return `<path d="M 50 84 Q 60 95 70 84" stroke="#9C2B5E" stroke-width="2.5" fill="#FF8FA3" stroke-linecap="round"/>`;
      case 'think':
        return `<line x1="56" y1="86" x2="64" y2="86" stroke="#9C2B5E" stroke-width="2" stroke-linecap="round"/>`;
      case 'sleep':
        return `<ellipse cx="60" cy="86" rx="3" ry="2" fill="#9C2B5E" opacity="0.6"/>`;
      case 'sad':
        return `<path d="M 52 88 Q 60 82 68 88" stroke="#9C2B5E" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      default:
        return `<path d="M 54 84 Q 60 89 66 84" stroke="#9C2B5E" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
  },

  setExpression(expr) {
    this.expression = expr;
    const eyesEl = document.getElementById('pixie-eyes');
    const mouthEl = document.getElementById('pixie-mouth');
    if (eyesEl) eyesEl.innerHTML = this._eyesFor(expr);
    if (mouthEl) mouthEl.innerHTML = this._mouthFor(expr);
  },

  // Show a speech bubble with a message
  say(text, expr = 'idle', duration = 4500) {
    this.setExpression(expr);
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

    let bubble = document.getElementById('pixie-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'pixie-bubble';
      bubble.className = 'pixie-bubble';
      document.body.appendChild(bubble);
    }
    bubble.innerHTML = `
      <button class="pixie-bubble-close" onclick="Pixie.hideBubble()">✕</button>
      ${text}
    `;
    requestAnimationFrame(() => bubble.classList.add('show'));

    if (duration > 0) {
      this.bubbleTimeout = setTimeout(() => this.hideBubble(), duration);
    }
  },

  hideBubble() {
    const bubble = document.getElementById('pixie-bubble');
    if (bubble) bubble.classList.remove('show');
    this.setExpression('idle');
  },

  // Quick floating "+10 ⭐" notification
  flash(text) {
    const f = document.createElement('div');
    f.className = 'pixie-flash';
    f.textContent = text;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 2000);
  },

  // On click — friendly greeting
  onClick() {
    const messages = [
      "Meow! Hi friend! 💖",
      "You're doing amazing!",
      `You have ${State.data.stars} stars! Wow!`,
      State.data.streak > 0 ? `${State.data.streak} day streak! 🔥` : "Let's start a streak today!",
      "Tap a chapter to learn together!",
      "I believe in you! ✨",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    this.say(msg, 'cheer');
  },

  // Greet user once per session per page
  scheduleGreeting() {
    setTimeout(() => {
      // Detect page from URL/title
      const path = location.pathname.toLowerCase();
      let key = 'index';
      if (path.includes('learning')) key = 'learning';
      else if (path.includes('maths')) key = 'maths';
      else if (path.includes('english')) key = 'english';
      else if (path.includes('evs')) key = 'evs';
      else if (path.includes('hindi')) key = 'hindi';
      else if (path.includes('chapter')) key = 'chapter';
      const arr = this.greetings[key] || this.greetings['index'];
      const msg = arr[Math.floor(Math.random() * arr.length)];
      this.say(msg, 'idle', 5000);
    }, 1200);
  },

  // Observe key interactions
  observeInteractions() {
    // Listen for chapter/quiz/exercise completion via custom events
    document.addEventListener('crw:correct', () => {
      this.setExpression('cheer');
      setTimeout(() => this.setExpression('idle'), 1500);
    });
    document.addEventListener('crw:wrong', () => {
      this.setExpression('think');
      setTimeout(() => this.setExpression('idle'), 1500);
    });
    document.addEventListener('crw:perfect', () => {
      this.say("PERFECT! You're brilliant! 🌟", 'cheer', 5000);
    });
  },
};

// Auto-init after State + DOM ready
function initPixie() {
  if (typeof State === 'undefined') {
    setTimeout(initPixie, 60);
    return;
  }
  Pixie.init();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPixie);
} else {
  initPixie();
}

window.Pixie = Pixie;

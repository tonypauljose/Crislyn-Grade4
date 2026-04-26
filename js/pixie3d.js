/* =====================================================
   PIXIE 3D — Real 3D character via GLTFLoader
   Supports multiple character models. User can pick which
   companion she wants from a Character Picker.
   ===================================================== */

const Pixie3D = {
  scene: null,
  camera: null,
  renderer: null,
  model: null,
  mixer: null,
  clock: null,
  actions: {},
  currentAction: null,
  bubbleTimeout: null,
  ready: false,
  loading: false,

  // Available characters — easy to add more
  characters: {
    fox: {
      name: 'Foxy',
      emoji: '🦊',
      desc: 'Cute orange fox',
      url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Fox/glTF-Binary/Fox.glb',
      scale: 0.6,
      cameraY: 110,
      cameraZ: 220,
      lookY: 50,
      idleAnimation: 'Survey',
      runAnimation: 'Run',
      tint: null,
    },
    cesium: {
      name: 'Cosmo',
      emoji: '🧑‍🚀',
      desc: 'Friendly humanoid',
      url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/CesiumMan/glTF-Binary/CesiumMan.glb',
      scale: 100,
      cameraY: 0.8,
      cameraZ: 2.5,
      lookY: 0.7,
      idleAnimation: null,  // use first available
      runAnimation: null,
      tint: null,
    },
    duck: {
      name: 'Quacky',
      emoji: '🦆',
      desc: 'Cute yellow duck',
      url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Duck/glTF-Binary/Duck.glb',
      scale: 1.2,
      cameraY: 1.4,
      cameraZ: 4,
      lookY: 1,
      idleAnimation: null,
      runAnimation: null,
      tint: null,
    },
    brainstem: {
      name: 'Robo',
      emoji: '🤖',
      desc: 'Dancing robot friend',
      url: 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/BrainStem/glTF-Binary/BrainStem.glb',
      scale: 1,
      cameraY: 1.3,
      cameraZ: 3,
      lookY: 1,
      idleAnimation: null,
      runAnimation: null,
      tint: null,
    },
  },

  greetings: {
    'index': [
      "Hi Crislyn! Ready for an adventure today? ✨",
      "Welcome back! What should we learn today?",
      "Hello hello! I missed you!",
    ],
    'learning': ["Pick a subject! Each one is a different adventure!"],
    'maths': ["Numbers are like puzzle pieces — let's solve some!"],
    'english': ["Let's play with words today!"],
    'evs': ["Nature is so cool! Let's explore!"],
    'hindi': ["हिंदी is fun once you know the secret!"],
    'art': ["YAY! Time to make art! 🎨"],
    'chapter': ["Take it slow — I'm right here with you!"],
  },

  init() {
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
      setTimeout(() => this.init(), 200);
      return;
    }
    this.createContainer();
    this.setupScene();
    this.loadCurrentCharacter();
    this.scheduleGreeting();
    this.observeInteractions();
    this.injectPickerStyles();
    this.ready = true;
  },

  getCurrentCharacterId() {
    return (State && State.data && State.data.character) || 'fox';
  },

  setCharacter(id) {
    if (!this.characters[id]) return;
    if (State) {
      State.data.character = id;
      State.save();
    }
    this.loadCurrentCharacter();
    if (window.Pixie) Pixie.say(`Hi! I'm ${this.characters[id].name}! ${this.characters[id].emoji}`, 'cheer');
  },

  createContainer() {
    const container = document.createElement('div');
    container.id = 'pixie3d-container';
    container.className = 'pixie3d-container';
    container.onclick = (e) => {
      // Don't trigger click if user clicked the picker button
      if (e.target.closest('.pixie3d-picker-btn')) return;
      this.onClick();
    };

    const canvasWrap = document.createElement('div');
    canvasWrap.id = 'pixie3d-canvas';
    canvasWrap.className = 'pixie3d-canvas';
    container.appendChild(canvasWrap);

    // Loading badge
    const loader = document.createElement('div');
    loader.id = 'pixie3d-loading';
    loader.className = 'pixie3d-loading hidden';
    loader.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';
    container.appendChild(loader);

    // Picker button (gear)
    const pickerBtn = document.createElement('button');
    pickerBtn.className = 'pixie3d-picker-btn';
    pickerBtn.innerHTML = '⚙';
    pickerBtn.title = 'Choose your companion';
    pickerBtn.onclick = (e) => { e.stopPropagation(); this.openPicker(); };
    container.appendChild(pickerBtn);

    document.body.appendChild(container);
  },

  setupScene() {
    const W = 200, H = 200;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 1000);
    this.camera.position.set(0, 110, 220);
    this.camera.lookAt(0, 50, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.SRGBColorSpace) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (THREE.sRGBEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    document.getElementById('pixie3d-canvas').appendChild(this.renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffe4f0, 0.7);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff5e6, 1.4);
    key.position.set(80, 150, 100);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 400;
    key.shadow.camera.left = -120;
    key.shadow.camera.right = 120;
    key.shadow.camera.top = 120;
    key.shadow.camera.bottom = -120;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xffe0f0, 0.6);
    fill.position.set(-100, 50, 50);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc9a7e0, 0.5);
    rim.position.set(0, 50, -100);
    this.scene.add(rim);

    // Magical platform
    const platformGeo = new THREE.CylinderGeometry(60, 70, 8, 32);
    const platformMat = new THREE.MeshPhysicalMaterial({
      color: 0xffd1e0,
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });
    this.platform = new THREE.Mesh(platformGeo, platformMat);
    this.platform.position.y = -4;
    this.platform.receiveShadow = true;
    this.scene.add(this.platform);

    // Sparkles
    const sparkleGeo = new THREE.SphereGeometry(1.5, 8, 8);
    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true });
      const s = new THREE.Mesh(sparkleGeo, sparkleMat);
      const angle = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(angle) * 75, 30 + Math.random() * 20, Math.sin(angle) * 75);
      s.userData = { angle, baseY: s.position.y };
      this.scene.add(s);
      this.sparkles.push(s);
    }

    this.clock = new THREE.Clock();
    this.startLoop();
  },

  async loadCurrentCharacter() {
    const id = this.getCurrentCharacterId();
    const c = this.characters[id];
    if (!c) return;

    // Show loading
    document.getElementById('pixie3d-loading')?.classList.remove('hidden');

    // Remove existing model
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.model = null;
      this.mixer = null;
      this.actions = {};
      this.currentAction = null;
    }

    // Update camera for new character's scale
    this.camera.position.set(0, c.cameraY, c.cameraZ);
    this.camera.lookAt(0, c.lookY, 0);

    // Hide platform if it makes sense for the model
    if (this.platform) {
      this.platform.visible = c.scale < 50;  // only show platform for small-coordinate models
    }

    // Load model
    const loader = new THREE.GLTFLoader();
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(c.url, resolve, undefined, reject);
      });

      this.model = gltf.scene;
      this.model.scale.set(c.scale, c.scale, c.scale);
      this.model.position.set(0, 0, 0);
      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          if (c.tint && child.material) {
            child.material.color = new THREE.Color(c.tint);
          }
        }
      });
      this.scene.add(this.model);

      // Setup animations
      this.mixer = new THREE.AnimationMixer(this.model);
      gltf.animations.forEach(clip => {
        this.actions[clip.name] = this.mixer.clipAction(clip);
      });

      const idleName = c.idleAnimation || gltf.animations[0]?.name;
      if (idleName && this.actions[idleName]) {
        this.actions[idleName].play();
        this.currentAction = this.actions[idleName];
      }
    } catch (err) {
      console.warn(`[Pixie3D] Failed to load ${c.name}:`, err);
      this.fallbackPlaceholder();
    }

    document.getElementById('pixie3d-loading')?.classList.add('hidden');
  },

  fallbackPlaceholder() {
    const geo = new THREE.SphereGeometry(40, 32, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xfac6d7, roughness: 0.4, clearcoat: 0.5,
      emissive: 0xff8fa3, emissiveIntensity: 0.3,
    });
    this.model = new THREE.Mesh(geo, mat);
    this.model.position.y = 30;
    this.model.castShadow = true;
    this.scene.add(this.model);
  },

  startLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = this.clock.getDelta();
      const t = this.clock.elapsedTime;

      if (this.mixer) this.mixer.update(dt);

      // Sparkles
      if (this.sparkles) {
        this.sparkles.forEach((s, i) => {
          s.userData.angle += dt * 0.4;
          const angle = s.userData.angle;
          s.position.x = Math.cos(angle) * 75;
          s.position.z = Math.sin(angle) * 75;
          s.position.y = s.userData.baseY + Math.sin(t * 2 + i) * 5;
          s.material.opacity = 0.6 + Math.sin(t * 3 + i) * 0.4;
        });
      }

      if (this.model) {
        this.model.rotation.y = Math.sin(t * 0.5) * 0.4;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  },

  setExpression() {},

  say(text, expr = 'idle', duration = 4500) {
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    let bubble = document.getElementById('pixie3d-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'pixie3d-bubble';
      bubble.className = 'pixie3d-bubble';
      document.body.appendChild(bubble);
    }
    bubble.innerHTML = `
      <button class="pixie3d-bubble-close" onclick="Pixie3D.hideBubble()">✕</button>
      ${text}
    `;
    requestAnimationFrame(() => bubble.classList.add('show'));
    if (duration > 0) {
      this.bubbleTimeout = setTimeout(() => this.hideBubble(), duration);
    }

    if (expr === 'cheer') {
      this.playCelebrationAnimation();
    }
  },

  playCelebrationAnimation() {
    const c = this.characters[this.getCurrentCharacterId()];
    const runName = c.runAnimation || Object.keys(this.actions).find(n => /run|jump|walk/i.test(n));
    if (runName && this.actions[runName] && this.currentAction !== this.actions[runName]) {
      const prev = this.currentAction;
      prev?.fadeOut(0.25);
      this.actions[runName].reset().fadeIn(0.25).play();
      this.currentAction = this.actions[runName];
      setTimeout(() => {
        if (prev) {
          this.actions[runName].fadeOut(0.5);
          prev.reset().fadeIn(0.5).play();
          this.currentAction = prev;
        }
      }, 1800);
    }
  },

  hideBubble() {
    const bubble = document.getElementById('pixie3d-bubble');
    if (bubble) bubble.classList.remove('show');
  },

  flash(text) {
    const f = document.createElement('div');
    f.className = 'pixie3d-flash';
    f.textContent = text;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 2000);
  },

  onClick() {
    if (typeof State === 'undefined' || !State.data) return;
    const c = this.characters[this.getCurrentCharacterId()];
    const messages = [
      `Hi friend! I'm ${c.name}! 💖`,
      "You're doing amazing!",
      `You have ${State.data.stars} stars! Wow!`,
      State.data.streak > 0 ? `${State.data.streak} day streak! 🔥` : "Let's start a streak today!",
      "Tap anywhere to learn together!",
      "I believe in you! ✨",
      "Tap the gear to change me!",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    this.say(msg, 'cheer');
  },

  scheduleGreeting() {
    setTimeout(() => {
      const path = location.pathname.toLowerCase();
      let key = 'index';
      if (path.includes('art-studio') || path.includes('drawing') || path.includes('coloring') || path.includes('handwriting') || path.includes('craft')) key = 'art';
      else if (path.includes('learning')) key = 'learning';
      else if (path.includes('maths')) key = 'maths';
      else if (path.includes('english')) key = 'english';
      else if (path.includes('evs')) key = 'evs';
      else if (path.includes('hindi')) key = 'hindi';
      else if (path.includes('chapter')) key = 'chapter';
      const arr = this.greetings[key] || this.greetings['index'];
      const msg = arr[Math.floor(Math.random() * arr.length)];
      this.say(msg, 'idle', 5500);
    }, 1500);
  },

  observeInteractions() {
    document.addEventListener('crw:correct', () => this.playCelebrationAnimation());
    document.addEventListener('crw:perfect', () => {
      this.say("PERFECT! You're brilliant! 🌟", 'cheer', 5000);
    });
  },

  // ----- Character Picker UI -----
  openPicker() {
    if (document.getElementById('pixie3d-picker-modal')) return;
    const currentId = this.getCurrentCharacterId();
    const overlay = document.createElement('div');
    overlay.id = 'pixie3d-picker-modal';
    overlay.className = 'pixie3d-picker-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="pixie3d-picker">
        <button class="pixie3d-picker-close" onclick="this.closest('.pixie3d-picker-overlay').remove()">✕</button>
        <h3>Choose Your Companion</h3>
        <p class="pixie3d-picker-sub">Pick the friend you want to learn with!</p>
        <div class="pixie3d-picker-grid">
          ${Object.entries(this.characters).map(([id, c]) => `
            <div class="pixie3d-character-card ${id === currentId ? 'active' : ''}"
                 onclick="Pixie3D.setCharacter('${id}'); this.closest('.pixie3d-picker-overlay').remove();">
              <div class="character-emoji">${c.emoji}</div>
              <div class="character-name">${c.name}</div>
              <div class="character-desc">${c.desc}</div>
              ${id === currentId ? '<div class="character-active-badge">★ Active</div>' : ''}
            </div>
          `).join('')}
        </div>
        <div class="pixie3d-picker-note">
          ✨ More characters coming soon — including Sonic when we add a model!
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  injectPickerStyles() {
    if (document.getElementById('pixie3d-picker-styles')) return;
    const style = document.createElement('style');
    style.id = 'pixie3d-picker-styles';
    style.textContent = `
      .pixie3d-loading {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        gap: 6px; pointer-events: none;
      }
      .pixie3d-loading.hidden { display: none; }
      .loading-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #F4A6BD;
        animation: loadingPulse 1.4s ease-in-out infinite;
      }
      .loading-dot:nth-child(2) { animation-delay: 0.2s; }
      .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes loadingPulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.7); }
        40% { opacity: 1; transform: scale(1.3); }
      }

      .pixie3d-picker-btn {
        position: absolute; top: 0; right: 0;
        width: 32px; height: 32px;
        border-radius: 50%; border: 2px solid white;
        background: linear-gradient(135deg, #F4A6BD, #C9A7E0);
        color: white; cursor: pointer;
        font-size: 1rem; font-weight: bold;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        transition: all 0.2s;
        z-index: 10;
        display: flex; align-items: center; justify-content: center;
      }
      .pixie3d-picker-btn:hover { transform: rotate(90deg) scale(1.1); }

      .pixie3d-picker-overlay {
        position: fixed; inset: 0;
        background: rgba(31, 42, 68, 0.55);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease-out;
        padding: 20px;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      .pixie3d-picker {
        background: white; border-radius: 28px;
        padding: 32px; max-width: 600px; width: 100%;
        max-height: 85vh; overflow-y: auto;
        position: relative;
        animation: pickerPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 24px 60px rgba(0,0,0,0.25);
      }
      @keyframes pickerPop {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
      }

      .pixie3d-picker h3 {
        font-family: 'Fredoka One', cursive;
        font-size: 1.8rem;
        background: linear-gradient(90deg, #EC4899, #7C3AED);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        margin: 0 0 6px;
        text-align: center;
      }
      .pixie3d-picker-sub {
        text-align: center; color: #6B7280;
        font-family: 'Patrick Hand', cursive; font-size: 1.1rem;
        margin-bottom: 24px;
      }
      .pixie3d-picker-close {
        position: absolute; top: 16px; right: 16px;
        width: 36px; height: 36px; border-radius: 50%;
        background: #F3F4F6; border: none; cursor: pointer;
        font-size: 1rem; font-weight: bold; color: #6B7280;
      }
      .pixie3d-picker-close:hover { background: #FCE7F3; color: #BE185D; }

      .pixie3d-picker-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
      }

      .pixie3d-character-card {
        background: linear-gradient(135deg, #FFF8F0, #FFF0F5);
        border: 3px solid #F3E8FF;
        border-radius: 20px; padding: 20px 14px;
        text-align: center; cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }
      .pixie3d-character-card:hover {
        transform: translateY(-6px) rotate(-2deg);
        border-color: #C9A7E0;
        box-shadow: 0 10px 24px rgba(124, 58, 237, 0.18);
      }
      .pixie3d-character-card.active {
        border-color: #EC4899;
        background: linear-gradient(135deg, #FCE7F3, #FBCFE8);
        box-shadow: 0 6px 20px rgba(236, 72, 153, 0.25);
      }
      .character-emoji { font-size: 3.2rem; margin-bottom: 6px; }
      .character-name {
        font-family: 'Fredoka One', cursive; font-size: 1.1rem;
        color: #6B21A8; margin-bottom: 4px;
      }
      .character-desc {
        font-family: 'Patrick Hand', cursive; font-size: 0.9rem;
        color: #6B7280;
      }
      .character-active-badge {
        position: absolute; top: 6px; right: 6px;
        background: linear-gradient(135deg, #EC4899, #C44EE6);
        color: white; padding: 2px 8px; border-radius: 99px;
        font-size: 0.65rem; font-weight: bold;
      }

      .pixie3d-picker-note {
        text-align: center; margin-top: 24px;
        padding: 12px; border-radius: 14px;
        background: #FEF3C7; color: #92400E;
        font-family: 'Patrick Hand', cursive; font-size: 0.95rem;
      }
    `;
    document.head.appendChild(style);
  },
};

function initPixie3D() {
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined' || typeof State === 'undefined') {
    setTimeout(initPixie3D, 80);
    return;
  }
  Pixie3D.init();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPixie3D);
} else {
  initPixie3D();
}

window.Pixie3D = Pixie3D;
window.Pixie = Pixie3D;

/* =====================================================
   PIXIE 3D — Real 3D character via GLTFLoader
   Loads the Khronos Fox model (publicly available CC-BY).
   Has built-in animations: Idle, Walk, Run.
   Falls back to a coloured platform if model fails to load.
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

  // Multiple URLs to try (CDN fallbacks)
  modelURLs: [
    'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Fox/glTF-Binary/Fox.glb',
    'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb',
    'https://threejs.org/examples/models/gltf/Fox/glTF-Binary/Fox.glb',
  ],

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
    this.loadModel();
    this.scheduleGreeting();
    this.observeInteractions();
    this.ready = true;
  },

  createContainer() {
    const container = document.createElement('div');
    container.id = 'pixie3d-container';
    container.className = 'pixie3d-container';
    container.onclick = () => this.onClick();

    const canvasWrap = document.createElement('div');
    canvasWrap.id = 'pixie3d-canvas';
    canvasWrap.className = 'pixie3d-canvas';
    container.appendChild(canvasWrap);

    document.body.appendChild(container);
  },

  setupScene() {
    const W = 200, H = 200;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 200);
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
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -4;
    platform.receiveShadow = true;
    this.scene.add(platform);

    // Sparkles around the platform
    const sparkleGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    this.sparkles = [];
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(sparkleGeo, sparkleMat);
      const angle = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(angle) * 75, 30 + Math.random() * 20, Math.sin(angle) * 75);
      s.userData.angle = angle;
      s.userData.baseY = s.position.y;
      this.scene.add(s);
      this.sparkles.push(s);
    }

    this.clock = new THREE.Clock();
  },

  async loadModel() {
    const loader = new THREE.GLTFLoader();

    let loaded = false;
    for (const url of this.modelURLs) {
      try {
        const gltf = await new Promise((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });

        this.model = gltf.scene;
        this.model.scale.set(0.6, 0.6, 0.6);
        this.model.position.set(0, 0, 0);
        this.model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            // Enhance materials with sheen for fur effect
            if (child.material) {
              child.material.roughness = 0.7;
              if (child.material.sheen !== undefined) {
                child.material.sheen = 0.3;
                child.material.sheenColor = new THREE.Color(0xffd1e0);
              }
            }
          }
        });
        this.scene.add(this.model);

        // Setup animations
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach(clip => {
          this.actions[clip.name] = this.mixer.clipAction(clip);
        });

        // Play "Survey" (idle) by default
        const idleName = gltf.animations[0]?.name || 'Survey';
        this.playAction(idleName);

        loaded = true;
        this.startLoop();
        break;
      } catch (err) {
        console.warn(`[Pixie3D] Failed to load from ${url}, trying next…`);
      }
    }

    if (!loaded) {
      console.warn('[Pixie3D] All model URLs failed; falling back to placeholder.');
      this.fallbackPlaceholder();
    }
  },

  playAction(name, fadeTime = 0.3) {
    if (!this.actions[name]) return;
    const next = this.actions[name];
    if (this.currentAction === next) return;
    if (this.currentAction) {
      this.currentAction.fadeOut(fadeTime);
    }
    next.reset().fadeIn(fadeTime).play();
    this.currentAction = next;
  },

  fallbackPlaceholder() {
    // Cute glowing sphere if model fails
    const geo = new THREE.SphereGeometry(40, 32, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xfac6d7, roughness: 0.4, clearcoat: 0.5,
      emissive: 0xff8fa3, emissiveIntensity: 0.3,
    });
    this.model = new THREE.Mesh(geo, mat);
    this.model.position.y = 30;
    this.model.castShadow = true;
    this.scene.add(this.model);
    this.startLoop();
  },

  startLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = this.clock.getDelta();
      const t = this.clock.elapsedTime;

      if (this.mixer) this.mixer.update(dt);

      // Sparkles orbit + bob
      if (this.sparkles) {
        this.sparkles.forEach((s, i) => {
          s.userData.angle += dt * 0.4;
          const angle = s.userData.angle;
          s.position.x = Math.cos(angle) * 75;
          s.position.z = Math.sin(angle) * 75;
          s.position.y = s.userData.baseY + Math.sin(t * 2 + i) * 5;
          s.material.opacity = 0.6 + Math.sin(t * 3 + i) * 0.4;
          s.material.transparent = true;
        });
      }

      // Rotate the model slightly to feel "alive"
      if (this.model) {
        this.model.rotation.y = Math.sin(t * 0.5) * 0.4;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  },

  setExpression(/* unused for real model — animations handle this */) {},

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

    // Switch to a more lively animation if available
    if (expr === 'cheer') {
      this.playAction('Run', 0.25);
      setTimeout(() => this.playAction(this.idleName(), 0.5), 1800);
    }
  },

  idleName() {
    return Object.keys(this.actions)[0] || 'Survey';
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
    const messages = [
      "Hi friend! 💖",
      "You're doing amazing!",
      `You have ${State.data.stars} stars! Wow!`,
      State.data.streak > 0 ? `${State.data.streak} day streak! 🔥` : "Let's start a streak today!",
      "Tap anywhere to learn together!",
      "I believe in you! ✨",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    this.say(msg, 'cheer');

    // Quick run animation
    if (this.actions['Run']) {
      this.playAction('Run', 0.2);
      setTimeout(() => this.playAction(this.idleName(), 0.4), 1500);
    } else if (this.actions['Walk']) {
      this.playAction('Walk', 0.2);
      setTimeout(() => this.playAction(this.idleName(), 0.4), 1500);
    }
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
    document.addEventListener('crw:correct', () => {
      if (this.actions['Run']) {
        this.playAction('Run', 0.2);
        setTimeout(() => this.playAction(this.idleName(), 0.4), 1200);
      }
    });
    document.addEventListener('crw:perfect', () => {
      this.say("PERFECT! You're brilliant! 🌟", 'cheer', 5000);
    });
  },
};

// Auto-init
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

/* =====================================================
   PIXIE 3D — Real 3D kitten using Three.js
   Built with primitives (spheres, cones) — no model needed.
   Has idle breathing, tail swish, ear flicks, eye-follow,
   and reactions to clicks.
   ===================================================== */

const Pixie3D = {
  scene: null,
  camera: null,
  renderer: null,
  cat: null,
  parts: {},
  mouse: { x: 0, y: 0 },
  expression: 'idle',
  bubbleTimeout: null,
  ready: false,

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
    if (typeof THREE === 'undefined') {
      console.warn('[Pixie3D] Three.js not loaded yet, retrying...');
      setTimeout(() => this.init(), 200);
      return;
    }
    this.createContainer();
    this.setupScene();
    this.buildKitten();
    this.startLoop();
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

    // Track mouse globally for eye-follow
    window.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.mouse.x = (e.clientX - cx) / 200;
      this.mouse.y = (e.clientY - cy) / 200;
      // Clamp
      this.mouse.x = Math.max(-1, Math.min(1, this.mouse.x));
      this.mouse.y = Math.max(-1, Math.min(1, this.mouse.y));
    });

    // Touch tracking
    window.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.mouse.x = (e.touches[0].clientX - cx) / 200;
      this.mouse.y = (e.touches[0].clientY - cy) / 200;
      this.mouse.x = Math.max(-1, Math.min(1, this.mouse.x));
      this.mouse.y = Math.max(-1, Math.min(1, this.mouse.y));
    });
  },

  setupScene() {
    const W = 160, H = 160;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    this.camera.position.set(0, 0.3, 4.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.getElementById('pixie3d-canvas').appendChild(this.renderer.domElement);

    // Lights — warm 3-point setup for cute shading
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.1);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffe0f0, 0.5);
    fillLight.position.set(-2, 1, 1);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, -1, -2);
    this.scene.add(rimLight);

    // Soft shadow plane below
    const shadowGeo = new THREE.CircleGeometry(1.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.15,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.05;
    this.scene.add(shadow);
  },

  buildKitten() {
    this.cat = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfac6d7, roughness: 0.7, metalness: 0.1,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xf8b5cb, roughness: 0.7,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2a44, roughness: 0.3, metalness: 0.2,
    });
    const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xe68fa0, roughness: 0.6,
    });
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, roughness: 0.4, metalness: 0.6,
      emissive: 0xffaa00, emissiveIntensity: 0.15,
    });
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xf8c8d5, roughness: 0.8,
    });

    // Body (slightly squished sphere for cute proportions)
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 32, 32),
      bodyMat
    );
    body.position.y = -0.55;
    body.scale.set(1, 0.9, 1);
    body.castShadow = true;
    this.cat.add(body);
    this.parts.body = body;

    // Head (bigger sphere, sits on top)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 32),
      bodyMat
    );
    head.position.set(0, 0.45, 0);
    head.scale.set(1, 0.95, 0.95);
    head.castShadow = true;
    this.cat.add(head);
    this.parts.head = head;

    // Ears (cones)
    const earGeo = new THREE.ConeGeometry(0.22, 0.4, 12);

    const earL = new THREE.Mesh(earGeo, bodyMat);
    earL.position.set(-0.42, 0.95, 0.1);
    earL.rotation.set(-0.2, 0, -0.3);
    earL.castShadow = true;
    this.cat.add(earL);
    this.parts.earL = earL;

    const earR = new THREE.Mesh(earGeo, bodyMat);
    earR.position.set(0.42, 0.95, 0.1);
    earR.rotation.set(-0.2, 0, 0.3);
    earR.castShadow = true;
    this.cat.add(earR);
    this.parts.earR = earR;

    // Inner ear pink bits
    const innerEarGeo = new THREE.ConeGeometry(0.12, 0.25, 12);
    const innerEarL = new THREE.Mesh(innerEarGeo, innerEarMat);
    innerEarL.position.set(-0.42, 0.95, 0.18);
    innerEarL.rotation.set(-0.2, 0, -0.3);
    this.cat.add(innerEarL);

    const innerEarR = new THREE.Mesh(innerEarGeo, innerEarMat);
    innerEarR.position.set(0.42, 0.95, 0.18);
    innerEarR.rotation.set(-0.2, 0, 0.3);
    this.cat.add(innerEarR);

    // Magic horn (unicorn)
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.45, 16),
      hornMat
    );
    horn.position.set(0, 1.15, 0.25);
    horn.rotation.x = -0.05;
    horn.castShadow = true;
    this.cat.add(horn);
    this.parts.horn = horn;

    // Eyes (slightly inset spheres)
    const eyeGeo = new THREE.SphereGeometry(0.13, 24, 24);

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.25, 0.5, 0.62);
    this.cat.add(eyeL);
    this.parts.eyeL = eyeL;

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.25, 0.5, 0.62);
    this.cat.add(eyeR);
    this.parts.eyeR = eyeR;

    // Eye shines (white highlight)
    const shineGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const shineL = new THREE.Mesh(shineGeo, eyeShineMat);
    shineL.position.set(-0.22, 0.55, 0.74);
    this.cat.add(shineL);
    this.parts.shineL = shineL;

    const shineR = new THREE.Mesh(shineGeo, eyeShineMat);
    shineR.position.set(0.28, 0.55, 0.74);
    this.cat.add(shineR);
    this.parts.shineR = shineR;

    // Cheeks (translucent pink)
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xff8fa3, transparent: true, opacity: 0.5, roughness: 0.9,
    });
    const cheekGeo = new THREE.SphereGeometry(0.13, 16, 16);

    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.45, 0.32, 0.55);
    cheekL.scale.set(1, 0.6, 0.4);
    this.cat.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(0.45, 0.32, 0.55);
    cheekR.scale.set(1, 0.6, 0.4);
    this.cat.add(cheekR);

    // Nose (small triangle-ish via cone)
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.08, 4),
      noseMat
    );
    nose.position.set(0, 0.32, 0.72);
    nose.rotation.x = Math.PI;
    this.cat.add(nose);
    this.parts.nose = nose;

    // Mouth — small smile via tube
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.1, 0.18, 0.7),
      new THREE.Vector3(0, 0.13, 0.74),
      new THREE.Vector3(0.1, 0.18, 0.7)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 12, 0.015, 8, false);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x9c2b5e });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.cat.add(mouth);
    this.parts.mouth = mouth;

    // Tail (thin cylinder bent up)
    const tailGroup = new THREE.Group();
    const tailGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.7, 12);
    const tail = new THREE.Mesh(tailGeo, accentMat);
    tail.position.y = 0.35;
    tailGroup.add(tail);
    tailGroup.position.set(-0.7, -0.6, -0.5);
    tailGroup.rotation.set(0.3, 0, 0.4);
    tailGroup.castShadow = true;
    this.cat.add(tailGroup);
    this.parts.tail = tailGroup;

    // Tiny paws
    const pawGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const pawL = new THREE.Mesh(pawGeo, bodyMat);
    pawL.position.set(-0.45, -1, 0.4);
    pawL.scale.set(1, 0.7, 1.4);
    this.cat.add(pawL);
    this.parts.pawL = pawL;

    const pawR = new THREE.Mesh(pawGeo, bodyMat);
    pawR.position.set(0.45, -1, 0.4);
    pawR.scale.set(1, 0.7, 1.4);
    this.cat.add(pawR);
    this.parts.pawR = pawR;

    this.cat.position.y = 0.2;
    this.scene.add(this.cat);
  },

  startLoop() {
    let t = 0;
    let blinkTimer = 0;
    let blinkPhase = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.016;
      blinkTimer += 0.016;

      if (!this.cat) return;

      // Idle breathing
      const breath = Math.sin(t * 1.6) * 0.018;
      this.parts.body.scale.set(1, 0.9 + breath, 1);

      // Subtle bounce
      this.cat.position.y = 0.2 + Math.sin(t * 1.4) * 0.025;

      // Eye-follow mouse
      const ex = this.mouse.x * 0.04;
      const ey = -this.mouse.y * 0.03;
      this.parts.eyeL.position.x = -0.25 + ex;
      this.parts.eyeL.position.y = 0.5 + ey;
      this.parts.eyeR.position.x = 0.25 + ex;
      this.parts.eyeR.position.y = 0.5 + ey;
      this.parts.shineL.position.x = -0.22 + ex;
      this.parts.shineL.position.y = 0.55 + ey;
      this.parts.shineR.position.x = 0.28 + ex;
      this.parts.shineR.position.y = 0.55 + ey;

      // Head turn slightly toward mouse
      this.cat.rotation.y = this.mouse.x * 0.25;
      this.cat.rotation.x = this.mouse.y * 0.12;

      // Tail swish
      this.parts.tail.rotation.z = 0.4 + Math.sin(t * 2.5) * 0.25;

      // Ear flicks (random occasional)
      const earFlick = Math.sin(t * 4) > 0.95 ? 0.15 : 0;
      this.parts.earL.rotation.z = -0.3 + earFlick;
      this.parts.earR.rotation.z = 0.3 - earFlick;

      // Blink — every 4-6 seconds
      if (blinkTimer > 4 + Math.random() * 2) {
        blinkPhase = 0.2;
        blinkTimer = 0;
      }
      if (blinkPhase > 0) {
        const eyeScale = Math.max(0.05, 1 - (blinkPhase * 5));
        this.parts.eyeL.scale.y = eyeScale;
        this.parts.eyeR.scale.y = eyeScale;
        blinkPhase -= 0.018;
      } else {
        this.parts.eyeL.scale.y = 1;
        this.parts.eyeR.scale.y = 1;
      }

      // Cheer effect — scale slightly bigger when expressing 'cheer'
      if (this.expression === 'cheer') {
        this.cat.scale.lerp(new THREE.Vector3(1.08, 1.08, 1.08), 0.1);
      } else {
        this.cat.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  },

  setExpression(expr) {
    this.expression = expr;
  },

  say(text, expr = 'idle', duration = 4500) {
    this.setExpression(expr);
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
  },

  hideBubble() {
    const bubble = document.getElementById('pixie3d-bubble');
    if (bubble) bubble.classList.remove('show');
    this.setExpression('idle');
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
      "Meow! Hi friend! 💖",
      "You're doing amazing!",
      `You have ${State.data.stars} stars! Wow!`,
      State.data.streak > 0 ? `${State.data.streak} day streak! 🔥` : "Let's start a streak today!",
      "Tap anywhere to learn together!",
      "I believe in you! ✨",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    this.say(msg, 'cheer');
    // Little jump
    if (this.cat) {
      const startY = this.cat.position.y;
      let phase = 0;
      const jumpInt = setInterval(() => {
        phase += 0.18;
        this.cat.position.y = startY + Math.sin(phase) * 0.3;
        if (phase >= Math.PI) {
          this.cat.position.y = startY;
          clearInterval(jumpInt);
        }
      }, 16);
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
      this.say(msg, 'idle', 5000);
    }, 1500);
  },

  observeInteractions() {
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

// Auto-init when Three.js + State + DOM ready
function initPixie3D() {
  if (typeof THREE === 'undefined' || typeof State === 'undefined') {
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
// Alias so existing code that calls Pixie.say() still works
window.Pixie = Pixie3D;

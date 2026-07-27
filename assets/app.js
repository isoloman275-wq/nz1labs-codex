/* =====================================================================
   TE PŪMANAWA — The Hermes Codex
   A self-contained WebGL experience. No build step, no external deps
   beyond the vendored three.min.js. All shaders, gates, audio and
   generative art are original.
   ===================================================================== */
(function () {
  "use strict";

  if (typeof THREE === "undefined") {
    document.getElementById("loader").innerHTML =
      '<div class="txt" style="color:#ef6b6b">three.js failed to load — check assets/three.min.js</div>';
    return;
  }

  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Per-visitor seed: no two visits ever look the same.
  var VISIT = Math.random() * 6.2831853;

  /* ----------------------------- DATA ------------------------------- */
  // Grounded in the live lab topology (M1/M2/M3 routing, models, mandates).
  var PROFILES = [
    {
      id: "ai", name: "AI AGENTS", maori: "Ngā Kaihautū",
      color: "#6ee7b7", seed: 0.13, scale: 1.12,
      machine: "Hermes Operator", ctx: "M1 · M2 · M3",
      mandate: "We build autonomous AI agent systems that run your operations around the clock — multi-model routing, kanban task orchestration, self-correcting fleets. Your backlog works itself down while you sleep.",
      caps: ["Autonomous agent fleets", "Multi-model routing", "Kanban task orchestration", "24/7 self-correcting ops"],
      gate: "choice",
      gatePrompt: "A client drops a 500-ticket backlog on you. What do you deploy?",
      options: [
        { t: "An autonomous agent fleet that triages, builds and reviews itself", c: true },
        { t: "One junior dev and a prayer", c: false },
        { t: "A spreadsheet and hope", c: false },
        { t: "Manual ticket-by-ticket heroics", c: false }
      ]
    },
    {
      id: "webgl", name: "WEBGL & WEB", maori: "Te Whakaaturanga",
      color: "#60a5fa", seed: 0.31, scale: 1.0,
      machine: "Three.js / WebGL", ctx: "This very site",
      mandate: "Immersive, self-contained web experiences — custom GLSL shaders, original interaction design, zero templates, zero CDN. (This codex is one.) We make your brand feel alive in the browser.",
      caps: ["Custom WebGL / Three.js", "Original GLSL shaders", "Self-contained, no CDN", "Brand-led interaction"],
      gate: "order",
      gatePrompt: "How an immersive site ships — click the steps in order.",
      items: ["Concept", "Shader R&D", "Build", "Polish", "Launch"]
    },
    {
      id: "apps", name: "APP DEV", maori: "Ngā Taupānga",
      color: "#fbbf24", seed: 0.07, scale: 1.06,
      machine: "iOS · Android · PWA", ctx: "Product builds",
      mandate: "End-to-end product builds — native iOS/Android and cross-platform PWAs, from first prototype to store-ready launch. We ship things people actually install.",
      caps: ["iOS / Android / PWA", "Full product lifecycle", "Store-ready launches", "Native + cross-platform"],
      gate: "choice",
      gatePrompt: "A client needs a booking app on phone + web, fast. Best call?",
      options: [
        { t: "A PWA with native-feel UX — one codebase, all platforms", c: true },
        { t: "Three separate teams, three codebases", c: false },
        { t: "A PDF form emailed around", c: false },
        { t: "Wait for a bigger budget, do nothing", c: false }
      ]
    },
    {
      id: "design", name: "DESIGN", maori: "Te Whare Toi",
      color: "#fb923c", seed: 0.63, scale: 0.92,
      machine: "Indigenous-led studio", ctx: "Original motifs",
      mandate: "An Indigenous-led design studio. Original Māori + Pacific motifs drawn in-house, brand systems built to last. Our iron rule: IP-safe by default — we never touch another's characters, logos, or likeness. Your brand stays clean and defensible.",
      caps: ["Original Māori + Pacific art", "Brand systems & identity", "IP-SAFE by default", "Print + digital ready"],
      gate: "choice",
      gatePrompt: "The IP rule. Which asset is safe to ship for a client?",
      options: [
        { t: "Original kowhaiwhai pattern — our motif, no brand marks", c: true },
        { t: "A Marvel hero poster (fan art)", c: false },
        { t: "An All Blacks logo on merch", c: false },
        { t: "A Drake album-cover print", c: false }
      ]
    },
    {
      id: "data", name: "DATA & INTEL", maori: "Te Mātai",
      color: "#c084fc", seed: 0.52, scale: 0.96,
      machine: "ML · SQL · Dashboards", ctx: "Decision intelligence",
      mandate: "We turn raw data into decisions — live dashboards, ML model pipelines, and decision engines that surface the leak before it costs you. Evidence over opinion, every time.",
      caps: ["Decision intelligence", "Live dashboards", "ML model pipelines", "Act on the signal, not the noise"],
      gate: "meter",
      gatePrompt: "Keep the dashboard online — press & hold the pulse inside the green band."
    },
    {
      id: "devops", name: "DEVOPS & INFRA", maori: "Te Tūāpapa",
      color: "#22d3ee", seed: 0.88, scale: 1.04,
      machine: "Self-hosted · GPU fleet", ctx: "Bulletproof infra",
      mandate: "We stand up self-hosted AI infrastructure across multiple machines — hardened gateways, zero-downtime deploys, multi-machine orchestration. Bulletproof outcomes, data that never leaves your roof.",
      caps: ["Self-hosted GPU fleets", "Hardened gateways", "Zero-downtime CI/CD", "Multi-machine orchestration"],
      gate: "order",
      gatePrompt: "How a deploy goes live — click in order.",
      items: ["Provision", "Harden", "Stage", "Canary", "Ship"]
    },
    {
      id: "content", name: "CONTENT & GROWTH", maori: "Te Reo Whakaari",
      color: "#34d399", seed: 0.44, scale: 0.94,
      machine: "Automated pipelines", ctx: "Top of funnel",
      mandate: "We run daily content pipelines — automated video, social, growth loops — so your brand shows up every day without burning your team. Consistency is the strategy; virality is the side effect.",
      caps: ["Automated video pipelines", "Daily content cadence", "Multi-channel growth", "Hands-off consistency"],
      gate: "choice",
      gatePrompt: "What wins in content for a client?",
      options: [
        { t: "Daily cadence + automation — show up without fail", c: true },
        { t: "One viral swing, then silence", c: false },
        { t: "Post only when inspired", c: false },
        { t: "Buy followers, fake the rest", c: false }
      ]
    },
    {
      id: "oss", name: "OPEN SOURCE", maori: "Te Puna",
      color: "#f472b6", seed: 0.71, scale: 0.98,
      machine: "GitHub · MIT", ctx: "Reusable craft",
      mandate: "We ship our tooling as public MIT — battle-tested, forkable, yours to own. You get production-grade scaffolding, not black boxes. Knowledge shared is leverage compounded.",
      caps: ["github.com/isoloman275-wq", "Public MIT tooling", "Battle-tested scaffolds", "Fork it, own it"],
      gate: "order",
      gatePrompt: "How a tool ships — click in order.",
      items: ["Build", "Use daily", "Polish", "MIT it", "Ship repo"]
    },
    {
      id: "mandate", name: "THE MANDATE", maori: "Te Take",
      color: "#e8c37a", seed: 0.95, scale: 1.1,
      machine: "NZ1Labs", ctx: "Indigenous-led",
      mandate: "NZ1Labs is an Indigenous-led development studio. We build exceptional things for people with exceptional products — AI agents, immersive web, apps, and the infrastructure underneath. Bulletproof outcomes, original craft, owned by you. By Māori, for ours — and yours.",
      caps: ["Indigenous-led dev studio", "For clients with exceptional products", "Bulletproof · original · yours", "By Māori, for ours — and yours"],
      gate: "choice",
      gatePrompt: "Who do we build for?",
      options: [
        { t: "People with exceptional products who need them built right", c: true },
        { t: "Anyone, as long as it's cheap", c: false },
        { t: "The highest bidder, no questions", c: false },
        { t: "Nobody — we only demo", c: false }
      ]
    }
  ];

  /* --------------------------- SHADERS ------------------------------ */
  var NOISE3 = [
    "float hash3(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }",
    "float noise3(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);",
    " return mix(mix(mix(hash3(i+vec3(0,0,0)),hash3(i+vec3(1,0,0)),f.x),",
    "                mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),",
    "            mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),",
    "                mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z); }",
    "float fbm3(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise3(p); p*=2.03; a*=0.5; } return v; }"
  ].join("\n");

  var NODE_VERT = [
    "uniform float uTime, uAmp, uSeed, uFreq;",
    "varying vec3 vNormal; varying vec3 vView; varying float vN;",
    NOISE3,
    "void main(){",
    "  vec3 pos=position;",
    "  float n=fbm3(pos*uFreq + uSeed + uTime*0.12);",
    "  vN=n;",
    "  vec3 displaced=pos + normal * n * uAmp;",
    "  vec4 mv=modelViewMatrix*vec4(displaced,1.0);",
    "  vNormal=normalize(normalMatrix*normal);",
    "  vView=normalize(-mv.xyz);",
    "  gl_Position=projectionMatrix*mv;",
    "}"
  ].join("\n");

  var NODE_FRAG = [
    "uniform vec3 uColor; uniform float uTime, uLocked, uSeed, uGlow;",
    "varying vec3 vNormal; varying vec3 vView; varying float vN;",
    "vec3 pal(float t){ return 0.5+0.5*cos(6.2831*(vec3(1.0,1.0,1.0)*t+vec3(0.0,0.33,0.67))); }",
    "void main(){",
    "  float fres=pow(1.0-clamp(dot(normalize(vNormal),normalize(vView)),0.0,1.0),3.0);",
    "  vec3 irid=pal(fres*0.8 + uSeed + uTime*0.05);",
    "  vec3 base=uColor*(0.22+vN*0.35);",
    "  vec3 col=base + irid*fres*1.3 + uColor*fres*0.6;",
    "  col*= (0.7+vN*0.6);",
    "  if(uLocked>0.5){",
    "    float g=dot(col,vec3(0.299,0.587,0.114));",
    "    col=mix(col, vec3(g*0.5,g*0.62,g*0.8), 0.78);",
    "    col*=0.78;",
    "  }",
    "  col+=uColor*fres*uGlow;",
    "  gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  var BG_FRAG = [
    "precision highp float;",
    "uniform float uTime; uniform vec2 uRes; uniform float uSeed; varying vec2 vUv;",
    "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
    "float noise(vec2 p){ vec2 i=floor(p),f=fract(p); float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
    "  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }",
    "float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }",
    "void main(){",
    "  vec2 uv=vUv; vec2 p=(uv-0.5); p.x*=uRes.x/uRes.y; float cs=cos(uSeed),sn=sin(uSeed); p=vec2(p.x*cs-p.y*sn,p.x*sn+p.y*cs);",
    "  float t=uTime*0.04;",
    "  vec2 q=vec2(fbm(p*1.5+t), fbm(p*1.5-t+5.2));",
    "  vec2 r=vec2(fbm(p*1.5+1.5*q+vec2(1.7,9.2)+0.15*t), fbm(p*1.5+1.5*q+vec2(8.3,2.8)-0.12*t));",
    "  float f=fbm(p*1.5+1.8*r);",
    "  vec3 c1=vec3(0.02,0.05,0.08); vec3 c2=vec3(0.04,0.16,0.22); vec3 c3=vec3(0.10,0.05,0.18); vec3 c4=vec3(0.85,0.62,0.30);",
    "  vec3 col=mix(c1,c2,clamp(f*1.4,0.,1.));",
    "  col=mix(col,c3,clamp(length(r)*0.7,0.,1.));",
    "  col=mix(col,c4,clamp(pow(f,3.0)*0.6,0.,1.));",
    "  float ang=atan(p.y,p.x); float rad=length(p);",
    "  float swirl=sin(ang*3.0+rad*8.0 - uTime*0.3)*0.5+0.5;",
    "  col+=vec3(0.10,0.30,0.35)*pow(swirl,4.0)*0.25;",
    "  vec2 sp=uv*uRes/2.2; vec2 gid=floor(sp); float h=hash(gid);",
    "  if(h>0.991){ float tw=0.5+0.5*sin(uTime*3.0+h*40.0); col+=vec3(0.9,0.95,1.0)*tw*(h-0.991)*60.0; }",
    "  col*=smoothstep(1.25,0.18,length(p));",
    "  col+=(hash(uv*uRes+uTime)-0.5)*0.015;",
    "  gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  var BG_VERT = "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }";

  /* --------------------------- STATE -------------------------------- */
  var canvas = document.getElementById("scene");
  var renderer, bgScene, bgCam, scene, camera, clock;
  var nodeMeshes = [], nodes = [];
  var hiddenNode = null, hiddenRevealed = false;
  var unlocked = {};
  var group;
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var cam = { theta: 0.7, phi: 1.12, radius: RM ? 15 : 19, tT: 0.7, tP: 1.12, tR: RM ? 15 : 19 };
  var lastInteract = -1e9, dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, moved = 0, downT = 0;
  var activeGate = null;          // {update(dt)}
  var typeHandler = null;
  var pendingBrief = null;        // cancellable showBrief timer
  var audio = null, soundOn = false;

  var label = document.getElementById("label");
  var modal = document.getElementById("modal");
  var cardBody = document.getElementById("cardBody");
  var master = document.getElementById("master");

  /* ----------------------------- AUDIO ----------------------------- */
  function initAudio() {
    if (audio) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audio = new Ctx();
      var masterGain = audio.createGain();
      masterGain.gain.value = 0.0;
      masterGain.connect(audio.destination);
      // ambient pad: two detuned sines through a slow filter
      var filt = audio.createBiquadFilter();
      filt.type = "lowpass"; filt.frequency.value = 600;
      filt.connect(masterGain);
      var lfo = audio.createOscillator(); var lfoG = audio.createGain();
      lfo.frequency.value = 0.06; lfoG.gain.value = 240; lfo.connect(lfoG); lfoG.connect(filt.frequency); lfo.start();
      [55, 82.4, 110].forEach(function (f, i) {
        var o = audio.createOscillator(); o.type = "sine"; o.frequency.value = f * (1 + i * 0.001);
        var g = audio.createGain(); g.gain.value = 0.18 / (i + 1); o.connect(g); g.connect(filt); o.start();
      });
      masterGain.gain.linearRampToValueAtTime(0.5, audio.currentTime + 3);
      soundOn = true;
    } catch (e) { audio = null; }
  }
  function blip(freq, dur, type, vol) {
    if (!audio) return;
    try {
      var o = audio.createOscillator(); o.type = type || "triangle"; o.frequency.value = freq;
      var g = audio.createGain(); g.gain.value = 0.0001;
      o.connect(g); g.connect(audio.destination);
      var t = audio.currentTime;
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.18));
      o.start(t); o.stop(t + (dur || 0.18) + 0.02);
    } catch (e) {}
  }
  function chord() {
    if (!audio) return;
    [392, 523.25, 659.25, 784].forEach(function (f, i) { setTimeout(function () { blip(f, 0.5, "sine", 0.1); }, i * 70); });
  }

  /* --------------------------- TEXTURES ----------------------------- */
  function glowTexture() {
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  var GLOW_TEX = null;

  /* --------------------------- BUILD SCENE -------------------------- */
  function fib(i, n) {
    var y = 1 - (i / (n - 1)) * 2;
    var r = Math.sqrt(Math.max(0, 1 - y * y));
    var th = i * 2.39996323;
    return new THREE.Vector3(Math.cos(th) * r, y * 0.82, Math.sin(th) * r);
  }

  function makeNode(p, i) {
    var geo = new THREE.IcosahedronGeometry(1, 4);
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uAmp: { value: 0.34 }, uSeed: { value: p.seed * 10 + VISIT },
        uFreq: { value: 1.6 }, uColor: { value: new THREE.Color(p.color) },
        uLocked: { value: 1 }, uGlow: { value: 0.2 }
      },
      vertexShader: NODE_VERT, fragmentShader: NODE_FRAG
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(p.scale);
    var pos = fib(i, PROFILES.length).multiplyScalar(6.4);
    mesh.position.copy(pos);
    mesh.userData = { profile: p, index: i };
    // glow sprite
    var spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GLOW_TEX, color: new THREE.Color(p.color), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35
    }));
    spr.scale.setScalar(p.scale * 4.2);
    mesh.add(spr);
    return { mesh: mesh, mat: mat, spr: spr, profile: p, base: pos.clone(), phase: i * 0.7 };
  }

  function buildWeb() {
    // faint lines from each node toward centre + a neighbour ring
    var pts = [];
    for (var i = 0; i < nodes.length; i++) {
      pts.push(0, 0, 0, nodes[i].mesh.position.x, nodes[i].mesh.position.y, nodes[i].mesh.position.z);
      var j = (i + 1) % nodes.length;
      pts.push(nodes[i].mesh.position.x, nodes[i].mesh.position.y, nodes[i].mesh.position.z,
               nodes[j].mesh.position.x, nodes[j].mesh.position.y, nodes[j].mesh.position.z);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    var m = new THREE.LineBasicMaterial({ color: 0x3a4a5a, transparent: true, opacity: 0.12 });
    var lines = new THREE.LineSegments(g, m);
    lines.name = "web";
    return lines;
  }

  function buildStars() {
    var N = 1400, arr = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 30);
      arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    var m = new THREE.PointsMaterial({ color: 0xbfd4e6, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false });
    return new THREE.Points(g, m);
  }

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    // background scene
    bgScene = new THREE.Scene();
    bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var bgMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, uSeed: { value: VISIT } },
      vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthTest: false, depthWrite: false
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));
    bgScene.userData.mat = bgMat;

    // main scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    GLOW_TEX = glowTexture();

    group = new THREE.Group();
    scene.add(group);
    PROFILES.forEach(function (p, i) {
      var n = makeNode(p, i);
      nodes.push(n); nodeMeshes.push(n.mesh); group.add(n.mesh);
    });
    // Hidden 10th node — WĀHI NGARO — does not exist until all nine are unsealed.
    var hgeo = new THREE.IcosahedronGeometry(1, 4);
    var hmat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAmp: { value: 0.5 }, uSeed: { value: VISIT + 3.1 }, uFreq: { value: 2.2 },
        uColor: { value: new THREE.Color("#f5e6b8") }, uLocked: { value: 0 }, uGlow: { value: 0.9 } },
      vertexShader: NODE_VERT, fragmentShader: NODE_FRAG
    });
    var hmesh = new THREE.Mesh(hgeo, hmat);
    hmesh.scale.setScalar(0.001); hmesh.visible = false;
    hmesh.userData = { hidden: true };
    var hspr = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color: new THREE.Color("#f5e6b8"),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.0 }));
    hspr.scale.setScalar(5.0); hmesh.add(hspr);
    group.add(hmesh);
    hiddenNode = { mesh: hmesh, mat: hmat, spr: hspr, phase: 0 };
    group.rotation.y = VISIT;
    group.add(buildWeb());
    group.add(buildStars());

    clock = new THREE.Clock();
    bindEvents();
    animate();

    // hide loader
    setTimeout(function () { document.getElementById("loader").classList.add("hide"); }, 500);
  }

  /* --------------------------- INTERACTION -------------------------- */
  function bindEvents() {
    window.addEventListener("resize", onResize);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    document.getElementById("closeBtn").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeModal(); closeManifesto(); } });
    master.addEventListener("click", function (e) { if (e.target === master) closeManifesto(); });
    // first gesture starts audio
    window.addEventListener("pointerdown", function once() {
      initAudio(); window.removeEventListener("pointerdown", once);
    });
    document.getElementById("hud").style.pointerEvents = "none";
    document.getElementById("hint").style.pointerEvents = "none";
  }

  function ndc(e) {
    var r = renderer.domElement.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1, r: r };
  }

  function onDown(e) {
    dragging = true; downX = lastX = e.clientX; downY = lastY = e.clientY; moved = 0; downT = performance.now();
    lastInteract = performance.now();
  }
  function onMove(e) {
    if (dragging) {
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      cam.tT -= dx * 0.005; cam.tP -= dy * 0.005;
      cam.tP = Math.max(0.25, Math.min(Math.PI - 0.25, cam.tP));
      lastInteract = performance.now();
    } else {
      hoverLabel(e);
    }
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    var dt = performance.now() - downT;
    if (moved < 6 && dt < 420) {
      var n = ndc(e);
      mouse.set(n.x, n.y);
      raycaster.setFromCamera(mouse, camera);
      var targets = nodeMeshes.slice();
      if (hiddenRevealed) targets.push(hiddenNode.mesh);
      var hit = raycaster.intersectObjects(targets, false);
      if (hit.length) {
        var ud = hit[0].object.userData;
        if (ud.hidden) { showManifesto(); return; }
        var p = ud.profile;
        if (unlocked[p.id]) showBrief(p); else openGate(p);
      }
    }
  }
  function onWheel(e) {
    e.preventDefault();
    cam.tR *= (1 + e.deltaY * 0.0009);
    cam.tR = Math.max(8, Math.min(28, cam.tR));
    lastInteract = performance.now();
  }

  function hoverLabel(e) {
    var n = ndc(e);
    mouse.set(n.x, n.y);
    raycaster.setFromCamera(mouse, camera);
    var targets = nodeMeshes.slice();
    if (hiddenRevealed) targets.push(hiddenNode.mesh);
    var hit = raycaster.intersectObjects(targets, false);
    if (hit.length) {
      var ud = hit[0].object.userData;
      var wp = hit[0].object.getWorldPosition(new THREE.Vector3()).project(camera);
      var x = (wp.x * 0.5 + 0.5) * n.r.width + n.r.left;
      var y = (-wp.y * 0.5 + 0.5) * n.r.height + n.r.top;
      label.style.left = x + "px"; label.style.top = y + "px";
      label.style.opacity = "1";
      label.innerHTML = ud.hidden
        ? "✦ WĀHI NGARO <span class=\"maori\">te tono · the proposal</span>"
        : (unlocked[ud.profile.id] ? "" : "🔒 ") + ud.profile.name + '<span class="maori">' + ud.profile.maori + "</span>";
    } else label.style.opacity = "0";
  }

  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    if (bgScene) bgScene.userData.mat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  }

  /* ----------------------------- GATES ------------------------------ */
  function openGate(p) {
    if (pendingBrief) { clearTimeout(pendingBrief); pendingBrief = null; }
    activeGate = null;
    cardBody.innerHTML =
      '<div class="eyebrow" style="--role:' + p.color + '">Sealed · Trial of the ' + p.name + '</div>' +
      '<h2>' + p.name + '</h2>' +
      '<div class="maori">' + p.maori + '</div>' +
      '<div id="gate"><div class="prompt">' + p.gatePrompt + '</div><div id="stage"></div></div>';
    modal.classList.add("show");
    var stage = document.getElementById("stage");
    if (p.gate === "choice") buildChoice(stage, p);
    else if (p.gate === "type") buildType(stage, p);
    else if (p.gate === "order") buildOrder(stage, p);
    else if (p.gate === "meter") buildMeter(stage, p);
  }

  function solve(p) {
    chord();
    unlocked[p.id] = true;
    // light up the node
    var n = nodes.filter(function (x) { return x.profile.id === p.id; })[0];
    n.mat.uniforms.uLocked.value = 0.0;
    n.spr.material.opacity = 0.7;
    updateHud();
    // replace gate with brief
    pendingBrief = setTimeout(function () { showBrief(p, true); }, 650);
    if (Object.keys(unlocked).length === PROFILES.length && !hiddenRevealed) {
      hiddenRevealed = true;
      hiddenNode.mesh.visible = true;
      chord();
    }
  }

  function buildChoice(stage, p) {
    if (p.chart) stage.appendChild(makeChart());
    p.options.forEach(function (o) {
      var b = document.createElement("div");
      b.className = "opt"; b.textContent = o.t;
      b.addEventListener("click", function () {
        if (b.classList.contains("right") || b.classList.contains("wrong")) return;
        if (o.c) {
          b.classList.add("right"); blip(660, 0.2, "sine", 0.12);
          Array.prototype.forEach.call(stage.querySelectorAll(".opt"), function (x) { x.style.pointerEvents = "none"; });
          setTimeout(function () { solve(p); }, 480);
        } else {
          b.classList.add("wrong"); blip(160, 0.18, "sawtooth", 0.1);
          setTimeout(function () { b.classList.remove("wrong"); }, 600);
        }
      });
      stage.appendChild(b);
    });
  }

  function makeChart() {
    var c = document.createElement("canvas"); c.width = 240; c.height = 150; c.style.margin = "0 auto 6px";
    var g = c.getContext("2d");
    var bars = [["M1", 256, "#34d399"], ["M2·35", 201, "#c084fc"], ["M2·H", 192, "#60a5fa"], ["M3", 128, "#22d3ee"]];
    var max = 256, bw = 44, gap = 14, base = 130;
    bars.forEach(function (b, i) {
      var h = (b[1] / max) * 110;
      g.fillStyle = b[2]; g.fillRect(16 + i * (bw + gap), base - h, bw, h);
      g.fillStyle = "#9fb0bd"; g.font = "10px monospace"; g.textAlign = "center";
      g.fillText(b[0], 16 + i * (bw + gap) + bw / 2, base + 14);
    });
    return c;
  }

  function buildType(stage, p) {
    var box = document.createElement("div"); box.className = "codebox";
    stage.appendChild(box);
    var note = document.createElement("div"); note.className = "typenote";
    note.textContent = "Click here, then type — backspace to fix"; stage.appendChild(note);
    stage.tabIndex = 0; stage.focus();
    var typed = "";
    function render() {
      var h = "";
      for (var i = 0; i < p.type.length; i++) {
        if (i < typed.length) h += '<span class="typed">' + esc(p.type[i]) + "</span>";
        else if (i === typed.length) h += '<span class="cur">' + (p.type[i] === " " ? " " : esc(p.type[i])) + "</span>";
        else h += esc(p.type[i]);
      }
      box.innerHTML = h;
    }
    function onKey(e) {
      e.preventDefault();
      if (e.key === "Backspace") { typed = typed.slice(0, -1); render(); return; }
      if (e.key.length === 1) {
        if (typed.length < p.type.length && e.key === p.type[typed.length]) {
          typed += e.key; blip(420 + typed.length * 18, 0.06, "square", 0.06); render();
          if (typed.length === p.type.length) setTimeout(function () { solve(p); }, 250);
        } else { blip(150, 0.1, "sawtooth", 0.07); }
      }
    }
    typeHandler = onKey;
    window.addEventListener("keydown", typeHandler);
    render();
  }

  function buildOrder(stage, p) {
    var seqEl = document.createElement("div");
    seqEl.style.cssText = "width:100%;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:30px;margin-bottom:6px";
    var pool = document.createElement("div");
    pool.style.cssText = "width:100%;display:flex;flex-wrap:wrap;gap:8px;justify-content:center";
    stage.appendChild(seqEl); stage.appendChild(pool);

    var order = p.items.map(function (_, i) { return i; });
    // shuffle (deterministic-ish)
    for (var i = order.length - 1; i > 0; i--) { var j = (i * 7 + 3) % (i + 1); var t = order[i]; order[i] = order[j]; order[j] = t; }
    var correct = p.items.map(function (_, i) { return i; }); // natural order
    var clicked = [];
    function renderSeq() {
      seqEl.innerHTML = "";
      clicked.forEach(function (idx, k) {
        var s = document.createElement("span"); s.className = "chip"; s.style.borderColor = p.color; s.textContent = (k + 1) + ". " + p.items[idx];
        seqEl.appendChild(s);
      });
    }
    order.forEach(function (idx) {
      var b = document.createElement("div"); b.className = "opt"; b.textContent = p.items[idx];
      b.addEventListener("click", function () {
        if (clicked.indexOf(idx) !== -1) return;
        if (idx === correct[clicked.length]) {
          clicked.push(idx); blip(520 + clicked.length * 30, 0.1, "sine", 0.1); renderSeq();
          if (clicked.length === correct.length) setTimeout(function () { solve(p); }, 350);
        } else {
          b.classList.add("wrong"); blip(150, 0.18, "sawtooth", 0.1);
          setTimeout(function () { b.classList.remove("wrong"); }, 500);
          clicked = []; renderSeq();
        }
      });
      pool.appendChild(b);
    });
    renderSeq();
  }

  function buildMeter(stage, p) {
    var meter = document.createElement("div"); meter.className = "meter";
    var zone = document.createElement("div"); zone.className = "zone"; meter.appendChild(zone);
    var fill = document.createElement("i"); meter.appendChild(fill);
    stage.appendChild(meter);
    var hint = document.createElement("div"); hint.className = "typenote"; hint.textContent = "Press & HOLD the mouse inside the green band";
    stage.appendChild(hint);
    var pos = 0, t = 0, holding = false, stable = 0, need = 2.2;
    meter.addEventListener("pointerdown", function () { holding = true; initAudio(); });
    window.addEventListener("pointerup", function () { holding = false; });
    var self = { update: function (dt) {
      t += dt; pos = 0.5 + 0.5 * Math.sin(t * 2.2);
      fill.style.transform = "translateX(" + (pos * 100) + "%)";
      var inZone = pos > 0.38 && pos < 0.62;
      if (holding) {
        if (inZone) { stable += dt; blip(300 + stable * 120, 0.04, "sine", 0.04); }
        else stable = Math.max(0, stable - dt * 1.6);
        hint.textContent = "Stability " + Math.min(100, Math.round(stable / need * 100)) + "%";
        if (stable >= need) { activeGate = null; solve(p); }
      } else if (stable > 0) {
        stable = Math.max(0, stable - dt * 0.6);
        hint.textContent = "Stability " + Math.min(100, Math.round(stable / need * 100)) + "% — keep holding";
      }
    } };
    activeGate = self;
  }

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ----------------------------- BRIEF ------------------------------ */
  function showBrief(p, justSolved) {
    if (pendingBrief) { clearTimeout(pendingBrief); pendingBrief = null; }
    activeGate = null;
    if (typeHandler) { window.removeEventListener("keydown", typeHandler); typeHandler = null; }
    var caps = p.caps.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    cardBody.innerHTML =
      '<div class="eyebrow" style="--role:' + p.color + '">' + (justSolved ? "Unsealed · " : "Brief · ") + p.machine + '</div>' +
      '<h2>' + p.name + '</h2>' +
      '<div class="maori">' + p.maori + "</div>" +
      '<div class="meta">' +
      '<span class="chip">Model <b>' + esc(p.machine.split("· ")[1] || p.machine) + "</b></span>" +
      '<span class="chip">Context <b>' + esc(p.ctx) + "</b></span>" +
      '<span class="chip">Status <b style="color:#6ee7b7">Unsealed</b></span>' +
      "</div>" +
      '<p class="lead">' + esc(p.mandate) + "</p>" +
      '<div class="sect"><h3>Mandate</h3><ul>' + caps + "</ul></div>" +
      '<div class="sigwrap"><canvas id="sig" width="220" height="220"></canvas>' +
      '<div class="sigcap">The living signature of ' + p.name + " — a generative kowhaiwhai, seeded uniquely by its name.</div></div>";
    modal.classList.add("show");
    drawKoru(document.getElementById("sig"), p.seed, p.color);
    blip(523, 0.3, "sine", 0.08);
  }

  /* --------------------------- GENERATIVE ART ------------------------ */
  function drawKoru(canvas, seed, color) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d"); var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, baseR = Math.min(w, h) * 0.34;
    var rs = seed * 6.2831;
    function spiral(x, y, r, ang, turns, depth) {
      if (depth <= 0 || r < 2) return;
      ctx.beginPath();
      var steps = 110;
      for (var i = 0; i <= steps; i++) {
        var tt = i / steps;
        var a = ang + tt * turns * Math.PI * 2;
        var rr = r * (1 - tt * 0.92);
        var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, r * 0.12); ctx.lineCap = "round";
      ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.stroke(); ctx.shadowBlur = 0;
      var ex = x + Math.cos(ang + turns * Math.PI * 2) * r * 0.08;
      var ey = y + Math.sin(ang + turns * Math.PI * 2) * r * 0.08;
      spiral(ex, ey, r * 0.42, ang + turns * Math.PI * 2 + 1.1, 0.9, depth - 1);
    }
    var arms = 3;
    for (var k = 0; k < arms; k++) {
      var a = rs + k * (Math.PI * 2 / arms);
      var ox = cx + Math.cos(a) * baseR * 0.5, oy = cy + Math.sin(a) * baseR * 0.5;
      spiral(ox, oy, baseR * 0.62, a, 1.15, 3);
    }
    spiral(cx, cy, baseR * 0.8, rs, 1.2, 3);
  }

  function showManifesto() {
    master.classList.add("show");
    chord();
    master.innerHTML =
      '<button class="close" id="masterClose" aria-label="Close">×</button>' +
      '<div class="inner">' +
      '<div class="eyebrow" style="--role:#f5e6b8">WĀHI NGARO · te tono — the proposal</div>' +
      '<h1>NZ1Labs</h1>' +
      '<p id="masterText">Nine disciplines, one studio. The codex is whole — and so is the offer: ' +
      'bring us your exceptional product, and we\'ll build it bulletproof, original, and yours to own. ' +
      'NZ1Labs — Indigenous-led, by Māori, for ours and yours. The mark below was drawn ' +
      'for this visit alone. Refresh, and it is gone forever.</p>' +
      '<canvas id="masterCanvas" width="440" height="440"></canvas>' +
      '<div class="sigcap">Your tohu — generated uniquely from this moment. No two visitors see the same.</div>' +
      '<div class="sigcap" id="contactLine">→ Start a project — tell us about your product</div>' +
      '</div>';
    document.getElementById("masterClose").addEventListener("click", closeManifesto);
    drawTohu(document.getElementById("masterCanvas"), VISIT);
  }
  function closeManifesto() { master.classList.remove("show"); }

  // A generative signature seeded by the visitor — unique every load.
  function drawTohu(canvas, seed) {
    var ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    var gold = "#f5e6b8", poun = "#6ee7b7", ink = "#e8c37a";
    // radial spokes
    var spokes = 7 + Math.floor((seed * 13) % 7);
    for (var s = 0; s < spokes; s++) {
      var a = seed + s * (Math.PI * 2 / spokes);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      var g = ctx.createLinearGradient(0, 0, w * 0.46, 0);
      g.addColorStop(0, gold); g.addColorStop(1, "rgba(245,230,184,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.46, 0); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // nested koru, rotated by seed
    var arms = 3 + Math.floor((seed * 5) % 3);
    for (var k = 0; k < arms; k++) {
      var ka = seed * 2 + k * (Math.PI * 2 / arms);
      var ox = cx + Math.cos(ka) * 60, oy = cy + Math.sin(ka) * 60;
      drawKoruAt(ctx, ox, oy, 120, ka, 1.15, 3, k % 2 ? poun : gold);
    }
    drawKoruAt(ctx, cx, cy, 150, seed * 3, 1.25, 3, ink);
    ctx.fillStyle = gold; ctx.font = "12px monospace"; ctx.textAlign = "center";
    ctx.fillText("· " + spokes + " whenua · " + arms + " kōwhai ·", cx, h - 12);
  }
  function drawKoruAt(ctx, x, y, r, ang, turns, depth, color) {
    function spiral(px, py, rr, a, tn, d) {
      if (d <= 0 || rr < 2) return;
      ctx.beginPath();
      var steps = 110;
      for (var i = 0; i <= steps; i++) {
        var tt = i / steps, aa = a + tt * tn * Math.PI * 2, rad = rr * (1 - tt * 0.92);
        var X = px + Math.cos(aa) * rad, Y = py + Math.sin(aa) * rad;
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.2, rr * 0.11); ctx.lineCap = "round";
      ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
      var ex = px + Math.cos(a + tn * Math.PI * 2) * rr * 0.08, ey = py + Math.sin(a + tn * Math.PI * 2) * rr * 0.08;
      spiral(ex, ey, rr * 0.42, a + tn * Math.PI * 2 + 1.1, 0.9, d - 1);
    }
    spiral(x, y, r, ang, turns, depth);
  }

  function closeModal() {
    if (pendingBrief) { clearTimeout(pendingBrief); pendingBrief = null; }
    modal.classList.remove("show");
    if (typeHandler) { window.removeEventListener("keydown", typeHandler); typeHandler = null; }
    activeGate = null;
  }

  function updateHud() {
    var n = Object.keys(unlocked).length;
    document.getElementById("count").textContent = n + " / " + PROFILES.length;
    document.getElementById("barfill").style.width = (n / PROFILES.length * 100) + "%";
  }

  /* ----------------------------- LOOP ------------------------------- */
  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    // background
    bgScene.userData.mat.uniforms.uTime.value = t;

    // camera damping + idle auto-rotate
    if (!dragging && performance.now() - lastInteract > 2600 && !RM) cam.tT += dt * 0.05;
    cam.theta += (cam.tT - cam.theta) * 0.08;
    cam.phi += (cam.tP - cam.phi) * 0.08;
    cam.radius += (cam.tR - cam.radius) * 0.08;
    camera.position.set(
      cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta),
      cam.radius * Math.cos(cam.phi),
      cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta)
    );
    camera.lookAt(0, 0, 0);

    // nodes
    group.rotation.y += dt * 0.04;
    nodes.forEach(function (n) {
      n.mat.uniforms.uTime.value = t;
      n.mesh.position.y = n.base.y + Math.sin(t * 0.6 + n.phase) * 0.18;
      n.spr.material.opacity = (unlocked[n.profile.id] ? 0.7 : 0.35) + Math.sin(t * 1.5 + n.phase) * 0.08;
    });

    if (hiddenRevealed) {
      var ht = hiddenNode.mesh.scale.x + (1.6 - hiddenNode.mesh.scale.x) * 0.06;
      hiddenNode.mesh.scale.setScalar(ht);
      hiddenNode.mat.uniforms.uTime.value = t;
      hiddenNode.spr.material.opacity = 0.7 + Math.sin(t * 2.0) * 0.2;
      hiddenNode.mesh.position.y = Math.sin(t * 0.8) * 0.25;
    }

    if (activeGate && activeGate.update) activeGate.update(dt);

    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.render(scene, camera);
  }

  /* ----------------------------- GO --------------------------------- */
  // Debug surface (harmless): lets tooling inspect/drive the codex.
  window.__codex = {
    PROFILES: PROFILES, openGate: openGate, solve: solve, showBrief: showBrief,
    showManifesto: showManifesto, unlocked: unlocked, nodes: nodes,
    getHidden: function () { return hiddenNode; },
    isRevealed: function () { return hiddenRevealed; }
  };
  try { init(); } catch (e) {
    document.getElementById("loader").innerHTML = '<div class="txt" style="color:#ef6b6b">WebGL init failed: ' + esc(String(e)) + "</div>";
  }
})();

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

  /* ----------------------------- DATA ------------------------------- */
  // Grounded in the live lab topology (M1/M2/M3 routing, models, mandates).
  var PROFILES = [
    {
      id: "architect", name: "ARCHITECT", maori: "Kaiwhakamahere",
      color: "#6ee7b7", seed: 0.13, scale: 1.12,
      machine: "M2 · ornith:35b", ctx: "~201K context",
      mandate: "The shape before the stone. Architect decomposes the brief into contracts and load paths, then hands a clean spec downstream. It owns design — never routing.",
      caps: ["System & interface decomposition", "API contract + data-shape design", "Brief → task graph for the Coder", "Explicitly NOT the traffic controller"],
      gate: "order",
      gatePrompt: "Assemble the load path — click the build stages in their true order.",
      items: ["Decompose the brief", "Design API contract", "Hand spec to Coder", "Security review", "Deploy"]
    },
    {
      id: "coder", name: "CODER", maori: "Kaihanga Waehere",
      color: "#60a5fa", seed: 0.31, scale: 1.0,
      machine: "M2 · qwen3.6-hermes", ctx: "192K context",
      mandate: "The primary hand. Coder turns specs into working code against M2's Hermes-tuned model, with a Cloud fallback for the big or stuck jobs.",
      caps: ["Feature & module implementation", "Refactors, tests, build fixes", "Fallback → Cloud (us) when blocked", "Pairs with Reviewer before merge"],
      gate: "type",
      gatePrompt: "Type the incantation to open the channel to the local model.",
      type: "ollama.chat()"
    },
    {
      id: "researcher", name: "RESEARCHER", maori: "Kairapu",
      color: "#c084fc", seed: 0.52, scale: 0.96,
      machine: "M2 · qwen3.6-hermes", ctx: "192K context",
      mandate: "The seeker. Researcher runs recon, literature and market discovery, resolving entities out of noise before a build begins.",
      caps: ["Domain & codebase reconnaissance", "Paper / market / API discovery", "Entity resolution & signal extraction", "Feeds Architect's briefs"],
      gate: "choice",
      gatePrompt: "Among the noise, resolve the true signal — which endpoint is the M1 Ollama API?",
      options: [
        { t: "http://192.168.1.8:11434", c: true },
        { t: "http://192.168.1.15:8188", c: false },
        { t: "http://localhost:11434", c: false },
        { t: "m3 · qwen3.5:4b /api/chat", c: false }
      ]
    },
    {
      id: "reviewer", name: "REVIEWER", maori: "Kaiarotake",
      color: "#f472b6", seed: 0.71, scale: 0.98,
      machine: "M2 · qwen3.6-hermes", ctx: "192K context",
      mandate: "The gate. Reviewer holds quality and security gates, catching the silent faults a pipeline would otherwise ship.",
      caps: ["Diff & security review", "Pre-merge quality gates", "Bug / regression spotting", "Sign-off before Deploy"],
      gate: "choice",
      gatePrompt: "A pipeline silently drops subtitles. Which line is the fault?",
      code: ["segments = model.transcribe(path)", "for s in segments: write_timing(s)", "for s in segments: write_words(s)", "ffmpeg(subtitles=srt)"],
      options: [
        { t: "for s in segments: write_words(s)", c: true },
        { t: "segments = model.transcribe(path)", c: false },
        { t: "for s in segments: write_timing(s)", c: false },
        { t: "ffmpeg(subtitles=srt)", c: false }
      ]
    },
    {
      id: "builder", name: "BUILDER", maori: "Kaihanga",
      color: "#fbbf24", seed: 0.07, scale: 1.06,
      machine: "M1 · ornith:9b", ctx: "256K context",
      mandate: "On the WSL box, Builder does general integration and assembly work where the big context of ornith:9b earns its keep.",
      caps: ["General build & integration", "Wiring services on M1", "Hands-on assembly tasks", "Local-first, no LAN hops"],
      gate: "order",
      gatePrompt: "Sequence the integration steps — click them in build order.",
      items: ["Pull the repo", "Install dependencies", "Run the build", "Smoke test", "Commit & push"]
    },
    {
      id: "data-analyst", name: "DATA-ANALYST", maori: "Kaitātari",
      color: "#34d399", seed: 0.44, scale: 0.94,
      machine: "M1 · ornith:9b", ctx: "256K context",
      mandate: "The measurer. Data-Analyst turns raw signals — poker sessions, token spend, pipeline metrics — into decisions.",
      caps: ["Analytics & visualisation", "Poker-coach metrics & trends", "Cost / VRAM / throughput reads", "Feeds strategy, not just charts"],
      gate: "choice",
      gatePrompt: "Read the context windows. Tap the deepest memory — the tallest bar.",
      chart: true,
      options: [
        { t: "M1 · ornith:9b · 256K", c: true },
        { t: "M2 · ornith:35b · 201K", c: false },
        { t: "M2 · qwen3.6-hermes · 192K", c: false },
        { t: "M3 · qwen3.5:4b · 128K", c: false }
      ]
    },
    {
      id: "copywriter", name: "COPYWRITER", maori: "Kaituhi",
      color: "#fb923c", seed: 0.63, scale: 0.92,
      machine: "M3 · qwen3.5:4b", ctx: "~128K context",
      mandate: "The voice. Copywriter writes Etsy listings and TikTok scripts that persuade — always inside the IP line.",
      caps: ["Etsy listing & product copy", "TikTok script & hook writing", "Brand voice for the studio", "IP-clean by default"],
      gate: "choice",
      gatePrompt: "Which Etsy line is both persuasive and IP-clean?",
      options: [
        { t: "Hand-painted koru tee — original Aotearoa design by our studio", c: true },
        { t: "Official Disney Mickey tee (inspired)", c: false },
        { t: "Nike-style 'just-do-it' hoodie", c: false },
        { t: "Taylor Swift lyrics mug", c: false }
      ]
    },
    {
      id: "devops", name: "DEVOPS", maori: "Kaiwhakahaere",
      color: "#22d3ee", seed: 0.88, scale: 1.04,
      machine: "M3 · qwen3.5:4b", ctx: "~128K context",
      mandate: "The keeper of the lights. DevOps runs the gateway, deployments and the watchers that keep services alive.",
      caps: ["Gateway & channel ops", "Deploys & systemd units", "Pipeline liveness & restarts", "Incident first responder"],
      gate: "meter",
      gatePrompt: "Hold to keep the gateway pulse inside the green band. Three steady holds unseals it."
    },
    {
      id: "ip-guard", name: "IP-GUARD", maori: "Kaitiaki IP",
      color: "#f87171", seed: 0.95, scale: 1.0,
      machine: "M3 · qwen3.5:4b", ctx: "~128K context",
      mandate: "The fence. IP-Guard enforces the HARD IP RULE on every asset: no copyrighted characters, likenesses, logos, lyrics or real artists.",
      caps: ["Pre-publish IP compliance scan", "Blocks characters / logos / lyrics", "Keeps the studio original", "Signs off Etsy & TikTok drops"],
      gate: "choice",
      gatePrompt: "The HARD IP RULE: no copyrighted chars, likenesses, logos, lyrics or real artists. Which brief is safe to ship?",
      options: [
        { t: "Original kowhaiwhai tote — our own motif, no brand marks", c: true },
        { t: "MCU hero poster (fan art, not for sale)", c: false },
        { t: "All Blacks logo stubby holder", c: false },
        { t: "Drake album-cover print", c: false }
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
    "uniform float uTime; uniform vec2 uRes; varying vec2 vUv;",
    "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
    "float noise(vec2 p){ vec2 i=floor(p),f=fract(p); float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
    "  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }",
    "float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }",
    "void main(){",
    "  vec2 uv=vUv; vec2 p=(uv-0.5); p.x*=uRes.x/uRes.y;",
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
        uTime: { value: 0 }, uAmp: { value: 0.34 }, uSeed: { value: p.seed * 10 },
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
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } },
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
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
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
      var hit = raycaster.intersectObjects(nodeMeshes, false);
      if (hit.length) {
        var p = hit[0].object.userData.profile;
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
    var hit = raycaster.intersectObjects(nodeMeshes, false);
    if (hit.length) {
      var p = hit[0].object.userData.profile;
      var wp = hit[0].object.getWorldPosition(new THREE.Vector3()).project(camera);
      var x = (wp.x * 0.5 + 0.5) * n.r.width + n.r.left;
      var y = (-wp.y * 0.5 + 0.5) * n.r.height + n.r.top;
      label.style.left = x + "px"; label.style.top = y + "px";
      label.style.opacity = "1";
      label.innerHTML = (unlocked[p.id] ? "" : "🔒 ") + p.name + '<span class="maori">' + p.maori + "</span>";
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
    if (Object.keys(unlocked).length === PROFILES.length) setTimeout(showMaster, 1600);
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

  function showMaster() {
    master.classList.add("show");
    chord();
    var c = document.getElementById("masterCanvas"); drawMaster(c);
  }
  function drawMaster(canvas) {
    var ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    var gold = "#e8c37a", poun = "#6ee7b7";
    for (var k = 0; k < 9; k++) {
      var a = k * (Math.PI * 2 / 9) - Math.PI / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      var col = k % 2 ? gold : poun;
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 12;
      ctx.beginPath();
      for (var i = 0; i <= 120; i++) {
        var t = i / 120, ang = t * 1.3 * Math.PI * 2, rr = (w * 0.42) * (1 - t * 0.9);
        var px = Math.cos(ang) * rr, py = Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = gold; ctx.font = "13px monospace"; ctx.textAlign = "center";
    ctx.fillText("9 / 9 · the whakapapa is whole", cx, h - 10);
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

    if (activeGate && activeGate.update) activeGate.update(dt);

    renderer.clear();
    renderer.render(bgScene, bgCam);
    renderer.render(scene, camera);
  }

  /* ----------------------------- GO --------------------------------- */
  // Debug surface (harmless): lets tooling inspect/drive the codex.
  window.__codex = {
    PROFILES: PROFILES, openGate: openGate, solve: solve, showBrief: showBrief,
    unlocked: unlocked, nodes: nodes
  };
  try { init(); } catch (e) {
    document.getElementById("loader").innerHTML = '<div class="txt" style="color:#ef6b6b">WebGL init failed: ' + esc(String(e)) + "</div>";
  }
})();

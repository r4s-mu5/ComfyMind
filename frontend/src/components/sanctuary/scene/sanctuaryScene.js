// Liminal Sanctuary: the dusk atrium scene (framework-agnostic, three@0.160).
// Source of truth for both the Vue app and docs/redesign/liminal/index.html.
//
//   const scene = await createSanctuaryScene(canvas, { object: 'escultura' })
//   scene.setOptions({ fx: false }); scene.resize(); scene.snapshot(); scene.dispose()
//
// Everything is procedural geometry: no models, no textures, no figurative shapes.
import {
  ACESFilmicToneMapping, BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Float32BufferAttribute, FogExp2, Group, HalfFloatType, HemisphereLight, InstancedMesh, LatheGeometry, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, NearestFilter, NoColorSpace, OrthographicCamera, PerspectiveCamera, PlaneGeometry, SRGBColorSpace, Scene, ShaderMaterial, Shape, SphereGeometry, TorusGeometry, TubeGeometry, UnsignedByteType, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

export const OBJECTS = ['ruina', 'escultura', 'estudio'];
export const FRAMINGS = ['landing', 'background', 'small'];

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

const DEG = Math.PI / 180;
const MAX_DPR = 1.5;
const FRAME_MS = 32; // about 30 fps while something moves

// The approved "Quiet" mood: pastel dusk, light fog, short colonnade, near-still.
const MOOD = {
  sky: { top: '#1D2142', mid: '#5E5A8A', low: '#B49AB4', horizon: '#D9B4AE' },
  sun: { color: '#FFE6CC', color2: '#F7CDBE', size: 5.0, dir: [0.05, 0.05], glow: 0.3, alpha: 0.8 },
  fog: { color: '#D9B4AE', density: 0.036 },
  floor: '#6C6486',
  hemi: ['#B7B2E0', '#5A4C72', 0.85],
  key: ['#FFE1C6', 2.3, [-4.6, 4.2, 2.4]],
  back: ['#C8B7FF', 1.4, [2, 3, -6]],
  rim: ['#D2C4FF', 0.42],
  stone: '#E7E0E2',
  colonnade: { count: 6, spacing: 2.7, x: 2.8, start: -1.8 },
  drift: 0.35,
};

/* ------------------------------------------------------------------ geometry */

const R = 0.3, SHAFT = 3.7; // column radius and shaft height (m)

function prepParts(parts) {
  return parts.map(g => {
    g = g.index ? g.toNonIndexed() : g;
    if (g.attributes.uv) g.deleteAttribute('uv');
    if (g.attributes.uv2) g.deleteAttribute('uv2');
    return g;
  });
}
function merge(parts) {
  const prepped = prepParts(parts);
  const m = mergeGeometries(prepped);
  prepped.forEach(g => g.dispose());
  parts.forEach(g => g.dispose());
  return m;
}

function flute(geo, flutes, depth, taper) {
  const p = geo.attributes.position, v = new Vector3();
  geo.computeBoundingBox();
  const y0 = geo.boundingBox.min.y, y1 = geo.boundingBox.max.y;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const r = Math.hypot(v.x, v.z); if (r < 1e-5) continue;
    const th = Math.atan2(v.x, v.z);
    const u = ((th / (2 * Math.PI)) * flutes % 1 + 1) % 1;
    const scoop = Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
    const t = (v.y - y0) / (y1 - y0 || 1);
    const k = (1 - depth * scoop) * (1 - taper * Math.pow(t, 1.4));
    p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}
const lathe = (pts, seg, s = R) => new LatheGeometry(pts.map(([x, y]) => new Vector2(x * s, y * s)), seg);

function column(radial) {
  const base = lathe([[0, 0], [1.34, 0], [1.34, 0.12], [1.26, 0.16], [1.3, 0.3], [1.2, 0.42], [1.1, 0.46], [1.14, 0.56], [1.04, 0.64], [1.0, 0.7]], radial / 2);
  const plinth = new BoxGeometry(2.8 * R, 0.3 * R, 2.8 * R).translate(0, -0.15 * R, 0);
  const shaft = flute(new CylinderGeometry(R, R, SHAFT, radial, 3, true), 16, 0.07, 0.14).translate(0, 0.7 * R + SHAFT / 2, 0);
  const capY = 0.7 * R + SHAFT;
  const cap = lathe([[0.86, 0], [0.92, 0.05], [0.86, 0.1], [0.9, 0.16], [0.88, 0.22], [1.0, 0.34], [1.22, 0.5], [1.34, 0.62], [0, 0.62]], radial / 2).translate(0, capY, 0);
  const abacus = new BoxGeometry(2.9 * R, 0.32 * R, 2.9 * R).translate(0, capY + 0.62 * R + 0.16 * R, 0);
  const merged = merge([plinth, base, shaft, cap, abacus]);
  merged.userData.height = capY + 0.94 * R;
  return merged;
}

function brokenDrum(h, seed, seg = 48) {
  const g = flute(new CylinderGeometry(R, R, h, seg, 1, false), 16, 0.07, 0.0).translate(0, h / 2, 0);
  const p = g.attributes.position, v = new Vector3();
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const jag = Array.from({ length: seg }, () => rnd());
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (v.y > h - 1e-3) {
      const th = Math.atan2(v.x, v.z); const idx = Math.round(((th / (2 * Math.PI)) * seg + seg)) % seg;
      const r = Math.hypot(v.x, v.z) / R;
      const drop = r < 1e-3 ? 0.08 : (0.04 + 0.24 * jag[idx] * (0.6 + 0.4 * Math.sin(th * 2 + seed)));
      p.setY(i, v.y - drop * h);
    }
  }
  g.computeVertexNormals();
  return g;
}

function plinthGeo(w, h) {
  return merge([
    new BoxGeometry(w, h - 0.12, w).translate(0, (h - 0.12) / 2 + 0.06, 0),
    new BoxGeometry(w + 0.14, 0.06, w + 0.14).translate(0, h - 0.03, 0),
    new BoxGeometry(w + 0.14, 0.06, w + 0.14).translate(0, 0.03, 0),
  ]);
}

// Ionic capital: echinus with egg moulding, a volute bolster with spiral scrolls on both faces, abacus.
function ionicCapital() {
  const parts = [];
  parts.push(new CylinderGeometry(0.19, 0.19, 0.03, 48).translate(0, 0.015, 0));
  parts.push(new TorusGeometry(0.19, 0.022, 10, 48).rotateX(Math.PI / 2).translate(0, 0.05, 0));
  parts.push(lathe([[0.17, 0.06], [0.2, 0.07], [0.245, 0.1], [0.265, 0.135], [0.262, 0.16], [0.24, 0.175], [0, 0.175]], 48, 1));
  // bolster: canalis band joining two volute discs, extruded front to back
  const VX = 0.3, VY = 0.135, VR = 0.11, CB = 0.165, D = 0.4;
  const dx = Math.sqrt(VR * VR - (VY - CB) ** 2), aIn = Math.atan2(CB - VY, dx);
  const sh = new Shape();
  sh.moveTo(-VX, VY + VR); sh.lineTo(VX, VY + VR);
  sh.absarc(VX, VY, VR, Math.PI / 2, Math.PI - aIn, true);
  sh.lineTo(-VX + dx, CB);
  sh.absarc(-VX, VY, VR, aIn, Math.PI / 2, true);
  const bevel = 0.008;
  parts.push(new ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 40 }).translate(0, 0, -D / 2));
  // spiral scrolls (raised fillet) and eyes on front and back faces
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pts = [], turns = 2.6, n = 140;
    for (let i = 0; i <= n; i++) {
      const t = i / n, th = Math.PI / 2 - sx * t * turns * Math.PI * 2;
      const r = 0.098 * Math.pow(1 - t, 0.85) + 0.022;
      pts.push(new Vector3(sx * VX + Math.cos(th) * r, VY + Math.sin(th) * r, sz * (D / 2 + bevel + 0.002)));
    }
    parts.push(new TubeGeometry(new CatmullRomCurve3(pts), 150, 0.0085, 6, false));
    parts.push(new SphereGeometry(0.022, 12, 8).scale(1, 1, 0.6).translate(sx * VX, VY, sz * (D / 2 + bevel)));
    parts.push(new TorusGeometry(VR + 0.002, 0.011, 8, 40).translate(sx * VX, VY, sz * 0.07)); // balteus bands
  }
  // abacus with a thin lip
  const ab = new Shape(); const AW = 0.31, AD = 0.225, rr = 0.012;
  ab.moveTo(-AW + rr, -AD); ab.lineTo(AW - rr, -AD); ab.quadraticCurveTo(AW, -AD, AW, -AD + rr); ab.lineTo(AW, AD - rr);
  ab.quadraticCurveTo(AW, AD, AW - rr, AD); ab.lineTo(-AW + rr, AD); ab.quadraticCurveTo(-AW, AD, -AW, AD - rr); ab.lineTo(-AW, -AD + rr); ab.quadraticCurveTo(-AW, -AD, -AW + rr, -AD);
  parts.push(new ExtrudeGeometry(ab, { depth: 0.036, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 4 }).rotateX(-Math.PI / 2).translate(0, VY + VR + 0.018, 0));
  parts.push(new BoxGeometry(0.58, 0.012, 0.42).translate(0, VY + VR + 0.006, 0));
  const g = merge(parts);
  g.computeBoundingBox();
  return g;
}

/* ------------------------------------------------------------------ generative sculpture */

// Small, fast, seeded PRNG (mulberry32). Same seed, same sculpture, on every device.
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SEED_MAX = 9999;
export const randomSeed = () => Math.floor(Math.random() * (SEED_MAX + 1));

// The parameters of one sculpture. The ranges are deliberately narrow: every seed must read as an abstract
// carved stone, never as a figure. So: one opening at most (never a pair), always in the lower body and away
// from the horn tips; the outline is always wider than a head and never narrows into a neck above shoulders;
// the bite that opens the form is always off the vertical axis, so nothing is left-right symmetric.
export function sculptureParams(seed) {
  const r = rng(seed * 2654435761 + 12345);
  const R = (a, b) => a + (b - a) * r();
  const sign = () => (r() < 0.5 ? -1 : 1);
  const P = {};
  // hewn block (bottom at y = -0.86)
  P.bx = R(0.52, 0.66); P.by = R(0.15, 0.22); P.bz = R(0.36, 0.46);
  P.byc = -0.86 + P.by;
  P.blockTop = -0.86 + 2 * P.by;
  P.chamfers = [];
  const nCh = 1 + Math.floor(r() * 3);
  for (let i = 0; i < nCh; i++) {
    const a = r() * Math.PI * 2, tilt = R(0.5, 1.1);
    const n = [Math.cos(a), tilt, Math.sin(a)], l = Math.hypot(n[0], n[1], n[2]);
    const nn = n.map(v => v / l);
    const support = Math.abs(nn[0]) * P.bx + Math.abs(nn[1]) * P.by + Math.abs(nn[2]) * P.bz;
    P.chamfers.push([nn[0], nn[1], nn[2], support * R(0.6, 0.82)]);
  }
  // carved form: a broad leaning ellipse, opened by one off-axis bite
  P.rx = R(0.52, 0.7);
  P.ry = Math.min(P.rx * R(0.88, 1.12), (0.88 - P.blockTop + 0.08) / 1.96);
  P.cx = R(-0.08, 0.08);
  P.cy = P.blockTop - 0.08 + P.ry * 0.96;
  P.lean = R(-0.28, 0.28);
  const side = sign();
  P.biteA = side * R(0.22, 1.05);                  // radians from vertical, never 0
  const bk = R(0.72, 0.98);
  P.bix = P.cx + Math.sin(P.biteA) * P.ry * bk;
  P.biy = P.cy + Math.cos(P.biteA) * P.ry * bk;
  P.brx = R(0.26, 0.4) * P.rx / 0.6; P.bry = R(0.34, 0.55);
  P.twist = sign() * R(0.25, 0.95);
  P.th0 = R(0.13, 0.2); P.taper = R(0.02, 0.08);
  P.bowA = R(0.04, 0.15); P.bowF = R(1.6, 2.8); P.bowP = R(0, Math.PI * 2);
  // at most one drilled opening, in the lower body, on the side away from the bite
  P.hole = r() < 0.72;
  P.hr = R(0.09, 0.15);
  P.hx = P.cx - side * R(0.06, 0.24);
  P.hy = P.cy - P.ry * R(0.12, 0.38);
  P.yaw = (-28 + R(-18, 18)) * DEG;
  return P;
}

export function sculptureSdf(x, y, z, P) {
  const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  const smax = (a, b, k) => -smin(-a, -b, k);
  // hewn block with chamfered top edges
  const yb = y - P.byc;
  let block = Math.max(Math.abs(x) - P.bx, Math.abs(yb) - P.by, Math.abs(z) - P.bz);
  for (const c of P.chamfers) block = Math.max(block, c[0] * x + c[1] * yb + c[2] * z - c[3]);
  // carved part: twisted about the vertical as it rises
  const tw = P.twist * (y - P.blockTop), c = Math.cos(tw), s = Math.sin(tw);
  const px = c * x - s * z, pz = s * x + c * z;
  const cl = Math.cos(P.lean), sl = Math.sin(P.lean);
  const lx = cl * (px - P.cx) - sl * (y - P.cy), ly = sl * (px - P.cx) + cl * (y - P.cy);
  const outer = (Math.hypot(lx / P.rx, ly / P.ry) - 1) * Math.min(P.rx, P.ry);
  const bite = (Math.hypot((px - P.bix) / P.brx, (y - P.biy) / P.bry) - 1) * Math.min(P.brx, P.bry);
  let form = smax(outer, -bite, 0.12);
  const th = P.th0 - P.taper * Math.max(0, y - P.cy) * 2 + 0.03 * Math.cos(px * 2.2);
  const bow = P.bowA * Math.cos(px * P.bowF + P.bowP) - P.bowA * 0.5;
  form = smax(form, Math.abs(pz - bow) - th, 0.12);
  form = smax(form, -(y - P.blockTop + 0.1), 0.02);
  if (P.hole) form = smax(form, -(Math.hypot(px - P.hx, y - P.hy) - P.hr), 0.07);
  return smin(block, form, 0.1);
}

// Meshes one sculpture. About 35-60 ms in V8 at res 60 (measured in Node); 12-20k triangles.
export function buildSculptureGeometry(seed, res = 60) {
  const P = sculptureParams(seed);
  const mc = new MarchingCubes(res, new MeshBasicMaterial(), false, false, 40000);
  mc.isolation = 0;
  const f = mc.field, h = res / 2, inv = 1 / h;
  for (let k = 0; k < res; k++) {
    const z = (k - h) * inv;
    for (let j = 0; j < res; j++) {
      const y = (j - h) * inv, row = j * res + k * res * res;
      for (let i = 0; i < res; i++) f[i + row] = -sculptureSdf((i - h) * inv, y, z, P) * 10;
    }
  }
  mc.update();
  const n = mc.count;
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(mc.positionArray.slice(0, n * 3), 3));
  g.setAttribute('normal', new BufferAttribute(mc.normalArray.slice(0, n * 3), 3));
  mc.geometry.dispose(); mc.material.dispose();
  g.computeBoundingBox();
  g.userData.params = P;
  return g;
}

// Dürer's solid (Melencolia I, 1514): a rhombohedron with 72-degree faces, truncated at both apexes.
function durerSolid(size) {
  const cosA = Math.sqrt((Math.cos(72 * DEG) + 0.5) / 1.5), sinA = Math.sqrt(1 - cosA * cosA);
  const e = [0, 1, 2].map(i => new Vector3(sinA * Math.cos(i * 2 * Math.PI / 3), cosA, sinA * Math.sin(i * 2 * Math.PI / 3)));
  const top = e[0].clone().add(e[1]).add(e[2]);
  const cut = 0.6; // fraction of an edge removed at each apex
  const pts = [];
  for (let i = 0; i < 3; i++) {
    pts.push(e[i].clone()); // lower ring
    pts.push(e[i].clone().add(e[(i + 1) % 3])); // upper ring
    pts.push(e[i].clone().multiplyScalar(cut)); // bottom truncation
    pts.push(top.clone().sub(e[i].clone().multiplyScalar(cut))); // top truncation
  }
  const H = top.y - 2 * cut * cosA;
  const s = size / H;
  pts.forEach(p => { p.y -= cut * cosA; p.multiplyScalar(s); });
  const g = new ConvexGeometry(pts);
  g.userData.height = size;
  return g;
}

/* ------------------------------------------------------------------ shaders */

const SKY_VS = `varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`;
// Writes linear colour with alpha 0, so the output pass can skip tone mapping for the sky.
const SKY_FS = `uniform vec3 top, mid, low, horizon, sunColor, sunColor2, sunDir; uniform float sunSize, glow, sunAlpha;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(horizon, low, smoothstep(-0.02, 0.10, h));
  col = mix(col, mid, smoothstep(0.08, 0.30, h));
  col = mix(col, top, smoothstep(0.28, 0.85, h));
  col = mix(col, horizon*0.92, smoothstep(0.0, -0.2, h));
  float a = acos(clamp(dot(d, sunDir), -1., 1.));
  float disc = (1. - smoothstep(sunSize*0.96, sunSize, a)) * smoothstep(-0.01, 0.04, h);
  vec3 sc = mix(sunColor2, sunColor, smoothstep(-1., 1., (h - sunDir.y) / sunSize));
  col = mix(col, sc, disc * sunAlpha);
  col += sunColor * glow * exp(-a * 7.0) * 0.4;
  gl_FragColor = vec4(col, 0.);
}`;

const POST_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
// Nearest upscale in whole device-pixel blocks, then tone map, encode, grain, ordered dither, vignette.
const POST_FS = `uniform sampler2D tScene; uniform vec2 rtSize, outSize; uniform float block, levels, ditherAmt, grainAmt, vignetteAmt, seed;
varying vec2 vUv;
float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec2 cell = floor(gl_FragCoord.xy / block);
  vec4 t = texture2D(tScene, (cell + 0.5) / rtSize);
  vec3 mapped = t.rgb;
  #ifdef TONE_MAPPING
  mapped = toneMapping(t.rgb);
  #endif
  gl_FragColor = vec4(mix(t.rgb, mapped, t.a), 1.);
  #include <colorspace_fragment>
  vec3 c = gl_FragColor.rgb;
  vec2 q = (cell + 0.5) * block / outSize - 0.5;
  q.x *= outSize.x / outSize.y;
  c *= 1. - vignetteAmt * smoothstep(0.35, 1.05, length(q));
  c += (hash(cell + seed) - 0.5) * grainAmt;
  if (levels > 1.5) {
    float b = 0.5 + (bayer4(cell) - 0.5) * ditherAmt;
    c = floor(c * (levels - 1.) + b) / (levels - 1.);
  }
  gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
}`;

/* ------------------------------------------------------------------ the scene */

export async function createSanctuaryScene(canvas, {
  object = 'escultura',
  fx = true,
  pixelScale = 3,
  motion = true,
  framing = 'landing',
  onReady = () => {},
  // optional extras (the fixed interface above is unchanged)
  dither = 0.35,   // 0 = no quantising, 1 = strong
  grain = 0.5,     // 0 = none, 1 = most (still low amplitude); static, never per-frame
  vignette = 0,    // 0..1, soft
  onError = null,
} = {}) {
  if (!canvas) throw new Error('createSanctuaryScene: canvas is required');
  const opts = { object, fx, pixelScale, motion, framing, dither, grain, vignette };
  const host = canvas.parentElement || canvas;

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  renderer.setPixelRatio(1); // sizes below are handled in device pixels

  const halfFloat = renderer.capabilities.isWebGL2 &&
    (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));

  const C = h => new Color(h);
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 600);
  camera.rotation.order = 'YXZ';

  /* sky */
  const skyU = {
    top: { value: C(MOOD.sky.top) }, mid: { value: C(MOOD.sky.mid) }, low: { value: C(MOOD.sky.low) }, horizon: { value: C(MOOD.sky.horizon) },
    sunColor: { value: C(MOOD.sun.color) }, sunColor2: { value: C(MOOD.sun.color2) },
    sunDir: { value: new Vector3(MOOD.sun.dir[0], MOOD.sun.dir[1], -1).normalize() },
    sunSize: { value: MOOD.sun.size * DEG }, glow: { value: MOOD.sun.glow }, sunAlpha: { value: MOOD.sun.alpha },
  };
  const skyMat = new ShaderMaterial({ side: BackSide, depthWrite: false, fog: false, uniforms: skyU, vertexShader: SKY_VS, fragmentShader: SKY_FS });
  const sky = new Mesh(new SphereGeometry(300, 32, 16), skyMat);
  sky.renderOrder = -1;
  scene.add(sky);
  scene.fog = new FogExp2(C(MOOD.fog.color), MOOD.fog.density);


  /* lights */
  const hemi = new HemisphereLight(C(MOOD.hemi[0]), C(MOOD.hemi[1]), MOOD.hemi[2]);
  const key = new DirectionalLight(C(MOOD.key[0]), MOOD.key[1]);
  const back = new DirectionalLight(C(MOOD.back[0]), MOOD.back[1]);
  scene.add(hemi, key, back, key.target, back.target);

  /* materials */
  const materials = [];
  function withRim(mat, strength = MOOD.rim[1]) {
    const rim = { color: { value: C(MOOD.rim[0]) }, strength: { value: strength } };
    mat.onBeforeCompile = s => {
      s.uniforms.rimColor = rim.color; s.uniforms.rimStrength = rim.strength;
      s.fragmentShader = s.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 rimColor; uniform float rimStrength;')
        .replace('#include <opaque_fragment>', 'float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.6);\noutgoingLight += rimColor * rimF * rimStrength;\n#include <opaque_fragment>');
    };
    materials.push(mat);
    return mat;
  }
  const std = p => { const m = new MeshStandardMaterial(p); materials.push(m); return m; };
  const stone = std({ color: C(MOOD.stone), roughness: 0.85 });
  const floorMat = std({ color: C(MOOD.floor), roughness: 0.95 });
  const plinthMat = withRim(new MeshStandardMaterial({ color: 0xE4DCDB, roughness: 0.8 }), 0.3);
  const marble = withRim(new MeshStandardMaterial({ color: 0xF1EBE6, roughness: 0.62 }));
  const ruinStone = withRim(new MeshStandardMaterial({ color: 0xE9E1DE, roughness: 0.78 }), 0.32);
  const facetMat = withRim(new MeshStandardMaterial({ color: 0xF0E2D8, emissive: 0x2a2238, roughness: 0.66, flatShading: true }), 0.3);
  const honed = withRim(new MeshStandardMaterial({ color: 0xECE6EC, roughness: 0.38 }), 0.36);
  const ringMat = withRim(new MeshStandardMaterial({ color: 0xE3DDEE, roughness: 0.55 }), 0.36);

  /* architecture */
  const geometries = [];
  const keepGeo = g => { geometries.push(g); return g; };
  const colNear = keepGeo(column(40)), colFar = keepGeo(column(24));
  const COL_H = colNear.userData.height;
  const M = (x, y, z) => new Matrix4().makeTranslation(x, y, z);
  {
    const cfg = MOOD.colonnade, near = [], far = [];
    for (const side of [-1, 1]) for (let i = 0; i < cfg.count; i++) (i < 4 ? near : far).push(M(side * cfg.x, 0, cfg.start - i * cfg.spacing));
    for (const [geo, list] of [[colNear, near], [colFar, far]]) {
      const m = new InstancedMesh(geo, stone, list.length);
      list.forEach((mx, i) => m.setMatrixAt(i, mx));
      scene.add(m);
    }
    const len = cfg.count * cfg.spacing + 1.2;
    const beamGeo = keepGeo(new BoxGeometry(0.95, 0.62, len));
    for (const side of [-1, 1]) {
      const beam = new Mesh(beamGeo, stone);
      beam.position.set(side * cfg.x, COL_H + 0.31, cfg.start - len / 2 + 0.6);
      scene.add(beam);
    }
  }
  const floor = new Mesh(keepGeo(new PlaneGeometry(240, 240).rotateX(-Math.PI / 2)), floorMat);
    scene.add(floor);

  /* the object on its plinth(s) */
  const rig = new Group();
  scene.add(rig);
  let kit = null;

  function mesh(geo, mat) { return new Mesh(geo, mat); }
  // fake contact shadow: a soft radial-gradient decal on the floor (no shadow maps)
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  })();
  const shadowMat = new MeshBasicMaterial({ color: 0x241d38, alphaMap: shadowTex, transparent: true, opacity: 0.55, depthWrite: false });
  materials.push(shadowMat);
  const shadowGeo = keepGeo(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
  function contact(x, z, sx, sz, rot = 0, o = 1) {
    const m = new Mesh(shadowGeo, o === 1 ? shadowMat : Object.assign(shadowMat.clone(), { opacity: shadowMat.opacity * o }));
    if (o !== 1) materials.push(m.material);
    m.position.set(x, 0.004, z); m.scale.set(sx, 1, sz); m.rotation.y = rot; m.renderOrder = 1;
    return m;
  }
  function mover(obj, base = obj.rotation.y) { return { obj, baseY: base, baseX: obj.rotation.x }; }

  function buildKit(name) {
    const g = new Group(), own = [];
    const G = geo => { own.push(geo); return geo; };
    let movers = [], focusY = 1.45, extent = 0.6, tap = 'turn';
    if (name === 'ruina') {
      const PH = 1.0;
      g.add(mesh(G(plinthGeo(0.8, PH)), plinthMat), contact(0.08, 0.06, 1.7, 1.7));
      const cap = mesh(G(ionicCapital()), ruinStone);
      cap.scale.setScalar(1.05); cap.position.y = PH; cap.rotation.y = -30 * DEG;
      g.add(cap); movers = [mover(cap)];
      const d1 = mesh(G(brokenDrum(0.62, 7)), ruinStone);
      d1.rotation.set(0, 0.5, Math.PI / 2); d1.position.set(-1.05, R * 0.94, -1.1);
      const d2 = mesh(G(brokenDrum(0.44, 19)), ruinStone);
      d2.rotation.set(0, -0.4, -Math.PI / 2); d2.position.set(0.95, R * 0.94, -1.9);
      g.add(d1, d2, contact(-1.05, -1.1, 1.0, 0.85, 0.5, 0.9), contact(0.95, -1.9, 0.78, 0.8, -0.4, 0.9));
      focusY = 1.42; extent = 0.75;
    } else if (name === 'escultura') {
      const PH = 1.04;
      g.add(mesh(G(plinthGeo(0.72, PH)), plinthMat), contact(0.06, 0.06, 1.6, 1.6));
      const s = 0.37;
      const sc = mesh(G(sculptureGeometry()), marble);
      sc.scale.setScalar(s);
      sc.position.y = PH + 0.86 * s; // block bottom at y = -0.86
      sc.rotation.y = -28 * DEG;
      g.add(sc); movers = [mover(sc)];
      focusY = 1.5; extent = 0.55;
    } else {
      // the sculptor's study: three solids on plinths of different heights
      const spots = [
        { x: -0.52, z: 0.22, h: 0.78, w: 0.4 },
        { x: 0.0, z: -0.14, h: 1.08, w: 0.46 },
        { x: 0.5, z: 0.3, h: 0.9, w: 0.38 },
      ];
      for (const s of spots) { const p = mesh(G(plinthGeo(s.w, s.h)), plinthMat); p.position.set(s.x, 0, s.z); g.add(p, contact(s.x + 0.05, s.z + 0.05, s.w * 2.1, s.w * 2.1)); }
      const ring = mesh(G(new TorusGeometry(0.15, 0.052, 14, 48)), ringMat);
      ring.position.set(spots[0].x, spots[0].h + 0.202, spots[0].z); ring.rotation.y = 28 * DEG;
      const solid = mesh(G(durerSolid(0.46)), facetMat);
      solid.position.set(spots[1].x, spots[1].h, spots[1].z); solid.rotation.y = 12 * DEG;
      const ball = mesh(G(new SphereGeometry(0.155, 40, 28)), honed);
      ball.position.set(spots[2].x, spots[2].h + 0.155, spots[2].z);
      g.add(ring, solid, ball);
      movers = [mover(solid), mover(ring)];
      focusY = 1.34; extent = 1.0; tap = 'light';
    }
    return { name, group: g, movers, focusY, extent, tap, own };
  }

  function setObject(name) {
    if (!OBJECTS.includes(name)) name = 'escultura';
    if (kit && kit.name === name) return;
    if (kit) { rig.remove(kit.group); kit.own.forEach(g => g.dispose()); }
    kit = buildKit(name);
    rig.add(kit.group);
    turn.value = turn.from = turn.target = 0;
    light.value = light.from = light.target = 0; light.index = 0;
  }

  /* framing */
  const view = { cam: new Vector3(), offX: 0, offY: 0, fov: 38 };
  function frame3() {
    const portrait = size.w / size.h < 0.95;
    const f = opts.framing, k = kit;
    if (f === 'small') {
      view.fov = 30;
      const dist = (k.extent * 1.25) / Math.tan(view.fov * DEG / 2) / Math.min(1, size.w / size.h);
      rig.position.set(0, 0, 0);
      view.cam.set(0, k.focusY + 0.1, dist);
      view.offX = 0; view.offY = 0.16;
    } else if (f === 'background') {
      view.fov = portrait ? 52 : 36;
      rig.position.set(0, 0, 0);
      view.cam.set(0, k.focusY + 0.15, portrait ? 4.2 : 4.6);
      view.offX = 0; view.offY = portrait ? 0.3 : 0.12;
    } else if (portrait) {
      view.fov = 50;
      rig.position.set(0, 0, 0.3);
      view.cam.set(0, k.focusY + 0.3, k.name === 'estudio' ? 4.4 : 3.7);
      view.offX = 0; view.offY = 0.3;
    } else {
      // landscape landing: text panel on the left, object at about two thirds
      const wide = size.w / size.h > 2;
      view.fov = wide ? 32 : 38;
      rig.position.set(0.62, 0, 0.3);
      view.cam.set(0, k.focusY + 0.2, 4.3);
      view.offX = -0.08; view.offY = 0.03;
    }
    const kp = MOOD.key[2], bp = MOOD.back[2];
    key.target.position.copy(rig.position); back.target.position.copy(rig.position);
    key.userData.base = new Vector3(kp[0], kp[1], kp[2]);
    back.position.set(rig.position.x + bp[0], bp[1], rig.position.z + bp[2]);
    placeKey();
  }
  function placeKey() {
    const b = key.userData.base; if (!b) return;
    const a = light.value;
    key.position.set(rig.position.x + b.x * Math.cos(a) - b.z * Math.sin(a), b.y, rig.position.z + b.x * Math.sin(a) + b.z * Math.cos(a));
  }

  /* render targets and the output pass */
  const size = { w: 1, h: 1, dw: 1, dh: 1, block: 1, rw: 1, rh: 1 };
  let rt = null;
  const postU = {
    tScene: { value: null }, rtSize: { value: new Vector2(1, 1) }, outSize: { value: new Vector2(1, 1) },
    block: { value: 1 }, levels: { value: 0 }, ditherAmt: { value: 1 }, grainAmt: { value: 0 }, vignetteAmt: { value: 0 }, seed: { value: 17.0 },
  };
  const postMat = new ShaderMaterial({ uniforms: postU, vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false });
  const postGeo = new BufferGeometry();
  postGeo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  postGeo.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const postQuad = new Mesh(postGeo, postMat);
  postQuad.frustumCulled = false;
  const postScene = new Scene(); postScene.add(postQuad);
  const postCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function fxParams() {
    const on = !!opts.fx;
    const d = on ? clamp01(num(opts.dither, 0.35)) : 0;
    const gr = on ? clamp01(num(opts.grain, 0.5)) : 0;
    const v = on ? clamp01(num(opts.vignette, 0)) : 0;
    return { on, d, gr, v, scale: on ? Math.max(1, Math.min(4, Math.round(num(opts.pixelScale, 3)))) : 1 };
  }

  function resize() {
    const w = Math.max(1, Math.round(canvas.clientWidth || host.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight || host.clientHeight || window.innerHeight));
    const p = fxParams();
    size.w = w; size.h = h;
    size.dw = Math.round(w * dpr); size.dh = Math.round(h * dpr);
    size.block = p.scale > 1 ? Math.max(1, Math.round(p.scale * dpr)) : 1;
    size.rw = Math.ceil(size.dw / size.block); size.rh = Math.ceil(size.dh / size.block);
    renderer.setSize(size.dw, size.dh, false);
    const samples = size.block === 1 && renderer.capabilities.isWebGL2 ? 4 : 0;
    if (!rt || rt.width !== size.rw || rt.height !== size.rh || rt.samples !== samples) {
      if (rt) rt.dispose();
      rt = new WebGLRenderTarget(size.rw, size.rh, {
        type: halfFloat ? HalfFloatType : UnsignedByteType,
        colorSpace: halfFloat ? NoColorSpace : SRGBColorSpace,
        minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: true, samples,
      });
    }
    postU.tScene.value = rt.texture;
    postU.rtSize.value.set(size.rw, size.rh);
    postU.outSize.value.set(size.dw, size.dh);
    postU.block.value = size.block;
    postU.levels.value = p.d > 0 ? Math.round(34 - 26 * p.d) : 0;
    postU.ditherAmt.value = 1;
    postU.grainAmt.value = p.gr * 0.045;
    postU.vignetteAmt.value = p.v * 0.4;
    frame3();
    camera.aspect = size.rw / size.rh;
    camera.fov = view.fov;
    const ox = Math.round(view.offX * size.rw), oy = Math.round(view.offY * size.rh);
    camera.setViewOffset(size.rw, size.rh, ox, oy, size.rw, size.rh);
    camera.updateProjectionMatrix();
    requestRender();
  }

  /* interaction (attached to the canvas's parent) */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const turn = { value: 0, from: 0, target: 0, t0: 0, dur: 4600 };
  const light = { value: 0, from: 0, target: 0, t0: 0, dur: 4600, index: 0 };
  const LIGHT_ANGLES = [0, 1.05, -0.85];
  const onMove = e => {
    if (e.pointerType === 'touch' || !opts.motion) return;
    const r = host.getBoundingClientRect();
    pointer.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / (r.width || 1)) * 2 - 1));
    pointer.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / (r.height || 1)) * 2 - 1));
    requestRender();
  };
  const onLeave = () => { pointer.tx = 0; pointer.ty = 0; requestRender(); };
  const onClick = e => {
    if (!opts.motion || disposed) return;
    if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, label, [role="button"], [data-no-tap]')) return;
    const now = performance.now();
    turn.from = turn.value; turn.target = turn.target + (kit.tap === 'light' ? Math.PI / 3 : Math.PI / 2); turn.t0 = now;
    if (kit.tap === 'light') {
      light.index = (light.index + 1) % LIGHT_ANGLES.length;
      light.from = light.value; light.target = LIGHT_ANGLES[light.index]; light.t0 = now;
    }
    requestRender();
  };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('click', onClick);

  /* render loop: on demand when still, about 30 fps while moving, paused when hidden */
  let raf = 0, needs = false, lastRender = 0, lastUpdate = 0, clock = 0, ready = false, disposed = false, lost = false, slow = 0;
  const ease = t => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
  function schedule() { if (!raf && !disposed && !lost && !document.hidden) raf = requestAnimationFrame(tick); }
  function requestRender() { needs = true; schedule(); }
  function animating() {
    return opts.motion && (MOOD.drift > 0 || Math.abs(pointer.x - pointer.tx) > 1e-3 || Math.abs(pointer.y - pointer.ty) > 1e-3 ||
      turn.value !== turn.target || light.value !== light.target);
  }

  function update(now) {
    const dt = lastUpdate ? Math.min(0.1, (now - lastUpdate) / 1000) : 0;
    lastUpdate = now;
    const motionOn = !!opts.motion;
    if (motionOn) clock += dt;
    const drift = motionOn ? MOOD.drift : 0;
    if (!motionOn) { pointer.tx = pointer.ty = 0; pointer.x = pointer.y = 0; turn.value = turn.target; light.value = light.target; }
    const k = 1 - Math.pow(0.02, dt / 1.2); // settles in about 1.2 s
    pointer.x += (pointer.tx - pointer.x) * k; pointer.y += (pointer.ty - pointer.y) * k;
    if (motionOn && turn.value !== turn.target) {
      const e = ease((now - turn.t0) / turn.dur);
      turn.value = e >= 1 ? turn.target : turn.from + (turn.target - turn.from) * e;
    }
    if (motionOn && light.value !== light.target) {
      const e = ease((now - light.t0) / light.dur);
      light.value = e >= 1 ? light.target : light.from + (light.target - light.from) * e;
    }
    placeKey();
    // camera: a tiny lean and drift by rotation only, snapped to whole low-res pixels so the grid never shimmers
    let yaw = -pointer.x * 0.55 * DEG + Math.sin(clock * 0.21) * 0.25 * DEG * drift;
    let pitch = -pointer.y * 0.3 * DEG + Math.sin(clock * 0.17 + 1.3) * 0.15 * DEG * drift;
    if (size.block > 1) { const q = (view.fov * DEG) / size.rh; yaw = Math.round(yaw / q) * q; pitch = Math.round(pitch / q) * q; }
    camera.position.copy(view.cam);
    camera.rotation.set(pitch, yaw, 0);
    // the object leans at most 3 degrees toward the pointer and breathes slowly
    for (const m of kit.movers) {
      m.obj.rotation.y = m.baseY + turn.value + pointer.x * 3 * DEG + Math.sin(clock * 0.13) * 1.2 * DEG * drift;
      m.obj.rotation.x = m.baseX + pointer.y * 1.5 * DEG;
    }
  }

  function render() {
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  }

  function tick(now) {
    raf = 0;
    if (disposed || lost || document.hidden) return;
    const moving = animating();
    if (!needs && !moving) return;
    if (moving && !needs && now - lastRender < FRAME_MS) { schedule(); return; }
    update(now);
    render();
    if (opts.motion && lastRender && now - lastRender > 55) {
      if (++slow > 40 && dpr > 1) { dpr = 1; slow = 0; resize(); }
    } else slow = Math.max(0, slow - 1);
    lastRender = now; needs = false;
    if (!ready) { ready = true; try { onReady(); } catch (e) { console.error(e); } }
    if (animating()) schedule();
    else lastUpdate = 0;
  }

  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { lastUpdate = 0; requestRender(); } };
  document.addEventListener('visibilitychange', onVis);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
  if (ro) ro.observe(host);

  const onLost = e => {
    e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0;
    const err = new Error('WebGL context lost');
    if (typeof onError === 'function') onError(err); else throw err;
  };
  canvas.addEventListener('webglcontextlost', onLost);

  setObject(opts.object);
  resize();

  return {
    setOptions(partial = {}) {
      if (disposed || !partial) return;
      const prevObj = opts.object;
      Object.assign(opts, partial);
      if (opts.object !== prevObj) setObject(opts.object);
      if (!opts.motion) { pointer.tx = pointer.ty = 0; }
      lastUpdate = 0;
      resize();
    },
    resize,
    snapshot(type = 'image/jpeg', q = 0.86) {
      if (disposed || lost) return '';
      update(performance.now()); render();
      return canvas.toDataURL(type, q);
    },
    triangles(part = 'scene') {
      let n = 0;
      const visible = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
      (part === 'object' ? rig : scene).traverse(o => {
        if (o.isMesh && o !== sky && visible(o)) {
          const g = o.geometry;
          n += (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
        }
      });
      return Math.round(n);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf); raf = 0;
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (ro) ro.disconnect();
      if (kit) kit.own.forEach(g => g.dispose());
      geometries.forEach(g => g.dispose());
      sky.geometry.dispose(); skyMat.dispose();
      materials.forEach(m => m.dispose());
      postGeo.dispose(); postMat.dispose(); shadowTex.dispose();
      if (rt) rt.dispose();
      scene.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function num(v, d) { if (v === true) return d; if (v === false || v == null) return v === false ? 0 : d; const n = Number(v); return Number.isFinite(n) ? n : d; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// Liminal Sanctuary: the dusk atrium scene (framework-agnostic, three@0.160).
// Source of truth for both the Vue app (SanctuaryScene.vue) and docs/redesign/liminal/index.html (a copy).
//
//   const scene = await createSanctuaryScene(canvas, { object: 'escultura', seed: 427, onSculpture: s => {} })
//   scene.regenerate()          // another sculpture (returns its seed); a click on the scene does the same
//   scene.setOptions({ fx: false, turn: false }); scene.resize(); scene.snapshot(); scene.anchor('plinth'); scene.dispose()
//   scene.setTuning({ pixelScale: 2, palette: {...}, assets: { sculpture: { y: 0.1 } } })   // live tuning (dev panel)
//   scene.setPlinthControls({ on: true, label: 'Escultura nº', technique: 'Mármol, generada para ti', pause: 'pause' })
//
// The camera and the room never move: no drift, no pointer lean, no breathing. Two things move, and neither
// does with motion: false: the sculpture turns on its plinth (D14: one turn every TURN_MS, linear, driven by
// elapsed time, at about 30 fps; turn: false holds it at its current angle), and an 800 ms dissolve (in Bayer
// order) brings in a new sculpture. When nothing moves, frames are drawn only on change.
// 'escultura' is generative: a seeded signed-distance field, meshed with marching cubes, always abstract.
// Everything is procedural geometry: no models, no textures, no figurative shapes.
import {
  ACESFilmicToneMapping, BackSide, Box3, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, CircleGeometry, Color, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Float32BufferAttribute, FogExp2, Group, HalfFloatType, HemisphereLight, InstancedMesh, LatheGeometry, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, NearestFilter, NoColorSpace, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Raycaster, SRGBColorSpace, Scene, ShaderMaterial, Shape, SphereGeometry, TorusGeometry, TubeGeometry, UnsignedByteType, Vector2, Vector3, WebGLRenderTarget, WebGLRenderer,
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
const FRAME_MS = 1000 / 30; // frame cap while anything moves (turntable, dissolve)
const TURN_MS = 75000; // one full turn of the sculpture, linear (D14: 60-90 s)

// The approved "Quiet" mood: pastel dusk, light fog, short colonnade, fully still.
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
};

/* ------------------------------------------------------------------ live tuning (dev panel) */

// The scene's colours as one palette (src/theme/palettes.ts uses the same shape). This one is today's MOOD.
// marble tints every stone material, marbleShadow the hemisphere ground light, floor and contact shadows,
// sun the disc and the key light.
export const DEFAULT_PALETTE = {
  skyTop: MOOD.sky.top, skyMid: MOOD.sky.mid, skyLow: MOOD.sky.low, horizon: MOOD.sky.horizon,
  sun: MOOD.sun.color, marble: MOOD.stone, marbleShadow: MOOD.hemi[1], fog: MOOD.fog.color,
};
// Each asset takes { visible, x, y, z (m, offsets from its place), rotY (degrees, added), scale (factor) }.
// object = the plinth and its sculpture together; sun x/y move the disc (direction units), scale its size.
export const ASSETS = ['object', 'sculpture', 'plinth', 'shadow', 'colonnadeLeft', 'colonnadeRight', 'floor', 'sky', 'sun'];
export const DITHER_PATTERNS = ['bayer4', 'bayer8', 'none'];
const assetDefaults = () => ({ visible: true, x: 0, y: 0, z: 0, rotY: 0, scale: 1 });
/** Today's look. pixelScale 1..8; levels = colours per channel (2..32); grainAmount 0..3; fog and light are factors. */
export function defaultTuning() {
  return {
    pixelScale: 4, dither: true, ditherStrength: 1, ditherPattern: 'bayer4', levels: 13,
    grain: true, grainAmount: 0.5, vignette: 0, fog: 1, exposure: 1,
    light: { key: 1, fill: 1, back: 1 },
    turntable: true, turnSeconds: TURN_MS / 1000, seed: null,
    palette: { ...DEFAULT_PALETTE },
    assets: Object.fromEntries(ASSETS.map(n => [n, assetDefaults()])),
  };
}

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

// Five families of carved stone, picked by seed. None has a drilled hole: openings read as eyes.
// Rules that keep every seed abstract: forms are wider than they are tall, nothing is left-right symmetric,
// no small mass sits centred on a larger one (head on shoulders), and hollows are shallow and off-centre.
export const FAMILIES = ['arc', 'pair', 'ribbon', 'split', 'slab'];

export function sculptureParams(seed) {
  const r = rng(seed * 2654435761 + 12345);
  const R = (a, b) => a + (b - a) * r();
  const sign = () => (r() < 0.5 ? -1 : 1);
  const P = { family: FAMILIES[Math.floor(rng(seed * 7919 + 3)() * FAMILIES.length)] };
  // base: a hewn box, a low drum, or two stepped slabs (bottom always at y = -0.86)
  P.base = ['box', 'drum', 'step'][Math.floor(r() * 3)];
  P.bx = R(0.5, 0.66); P.by = P.base === 'step' ? R(0.09, 0.12) : R(0.12, 0.21); P.bz = R(0.36, 0.46);
  P.byc = -0.86 + P.by;
  P.blockTop = -0.86 + 2 * P.by * (P.base === 'step' ? 2 : 1);
  P.chamfers = [];
  const nCh = P.base === 'box' ? 1 + Math.floor(r() * 3) : 0;
  for (let i = 0; i < nCh; i++) {
    const a = r() * Math.PI * 2, tilt = R(0.5, 1.1);
    const n = [Math.cos(a), tilt, Math.sin(a)], l = Math.hypot(n[0], n[1], n[2]);
    const nn = n.map(v => v / l);
    const support = Math.abs(nn[0]) * P.bx + Math.abs(nn[1]) * P.by + Math.abs(nn[2]) * P.bz;
    P.chamfers.push([nn[0], nn[1], nn[2], support * R(0.6, 0.82)]);
  }
  const top = P.blockTop, room = 0.88 - top; // vertical room above the base
  P.twist = sign() * R(0.1, 0.45);
  P.yaw = (-22 + R(-14, 14)) * DEG;
  const side = sign();
  if (P.family === 'arc') {
    // an open crescent: a broad ellipse with a deep off-axis bite
    P.rx = R(0.54, 0.7); P.ry = Math.min(P.rx * R(0.8, 0.95), (room + 0.08) / 1.96);
    P.cx = R(-0.08, 0.08); P.cy = top - 0.08 + P.ry * 0.96; P.lean = R(-0.22, 0.22);
    // the bite takes one shoulder: near the top it leaves two symmetric prongs (horns, a tooth)
    P.biteA = side * R(0.7, 1.0);
    const bk = R(0.84, 1.0); // centred near the rim, so the bite opens one side right through
    P.bix = P.cx + Math.sin(P.biteA) * P.ry * bk; P.biy = P.cy + Math.cos(P.biteA) * P.ry * bk;
    // wide bites only: narrow ones leave two prongs
    // tall bites: a short one leaves a small low tip beside the mass (a thumb, a mitten)
    P.brx = R(0.32, 0.42) * P.rx / 0.6; P.bry = R(0.62, 0.8);
    // deep and barely tapered: a thin, tapering fin reads as a standing figure or a bird from the side
    P.th0 = R(0.21, 0.28); P.taper = R(0.0, 0.03);
    P.bowA = R(0.04, 0.15); P.bowF = R(1.6, 2.8); P.bowP = R(0, Math.PI * 2);
  } else if (P.family === 'pair') {
    // two soft blocks: a narrow lower one and a longer upper one cantilevered well off to one side
    P.a = [R(0.3, 0.42), R(0.16, 0.24), R(0.26, 0.36)];
    P.ac = [side * R(0.05, 0.16), top + P.a[1] - 0.05, R(-0.05, 0.05)];
    P.b = [R(0.4, 0.54), R(0.17, 0.24), R(0.26, 0.36)];
    P.bc = [P.ac[0] - side * R(0.16, 0.28), P.ac[1] + P.a[1] + P.b[1] - 0.05, R(-0.08, 0.08)];
    P.bRotY = R(0.35, 0.8) * sign(); P.bRotZ = side * R(0.08, 0.22);
    P.round = R(0.04, 0.07);
  } else if (P.family === 'ribbon') {
    // a thick band round an upright loop, nearly closed, with a small gap low on one side (never a hook)
    P.rr = Math.min(R(0.4, 0.52), (room + 0.04) / 2.1);
    P.cy = top - 0.04 + P.rr; P.cx = R(-0.06, 0.06);
    const gap = R(0.45, 0.8), gapAt = -Math.PI / 2 + side * R(0.95, 1.4);
    P.a0 = gapAt + gap / 2; P.a1 = gapAt - gap / 2 + Math.PI * 2;
    // a light twist only: a strong one turns the deep side of the band inwards and closes the loop into a
    // thick ring with a small round hole (a drilled hole; a snail or an ear from some angles)
    P.t1 = R(0.12, 0.16); P.t2 = R(0.2, 0.3); P.bandTwist = side * R(0.04, 0.1);
  } else if (P.family === 'split') {
    // a low, wide stone split by one straight, narrow slot, cut diagonally from the top down to its middle
    // low and deep: seen from the side a rounder stone becomes a ball on a block (a head on a pedestal)
    P.ex = R(0.58, 0.72); P.ey = Math.min(R(0.24, 0.31), room * 0.55); P.ez = R(0.5, 0.6);
    P.cx = R(-0.06, 0.06); P.cy = top - 0.06 + P.ey * 0.9; P.tilt = side * R(0.06, 0.2);
    const gA = side * R(0.45, 1.0), gl = Math.hypot(Math.cos(gA), 0.25, Math.sin(gA));
    P.gn = [Math.cos(gA) / gl, side * 0.25 / gl, Math.sin(gA) / gl];
    // the slot stays near the middle: an edge slot leaves a beak-like cap
    P.gOff = side * R(0.03, 0.13); P.gW = R(0.035, 0.06); P.gFloor = P.cy - P.ey * R(0.1, 0.35);
  } else {
    // a wide slab leaning back and tipped sideways, with one shallow hollow off centre (never through)
    P.hx = R(0.56, 0.7); P.hy = Math.min(R(0.28, 0.38), room * 0.48); P.ht = R(0.1, 0.14);
    P.cy = top - 0.05 + P.hy; P.cx = R(-0.05, 0.05);
    P.roll = side * R(0.24, 0.48); P.pitch = R(0.18, 0.36);
    // a broad, shallow scoop: a small deep one reads as an eye when the slab is seen edge-on
    P.dr = R(0.34, 0.46); P.dx = -side * R(0.14, 0.3); P.dy = R(-0.05, 0.12); P.dd = R(0.03, 0.045);
  }
  return P;
}
export const sculptureFamily = seed => sculptureParams(seed).family;

export function sculptureSdf(x, y, z, P) {
  const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  const smax = (a, b, k) => -smin(-a, -b, k);
  const rbox = (px, py, pz, bx, by, bz, rr) => {
    const qx = Math.abs(px) - bx + rr, qy = Math.abs(py) - by + rr, qz = Math.abs(pz) - bz + rr;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - rr;
  };
  // base
  const yb = y - P.byc;
  let block;
  if (P.base === 'drum') {
    block = Math.max(Math.hypot(x / P.bx, z / P.bz) * Math.min(P.bx, P.bz) - Math.min(P.bx, P.bz), Math.abs(yb) - P.by);
  } else if (P.base === 'step') {
    const lower = Math.max(Math.abs(x) - P.bx, Math.abs(yb) - P.by, Math.abs(z) - P.bz);
    const upper = Math.max(Math.abs(x - 0.06) - P.bx * 0.78, Math.abs(yb - 2 * P.by) - P.by, Math.abs(z + 0.03) - P.bz * 0.8);
    block = Math.min(lower, upper);
  } else {
    block = Math.max(Math.abs(x) - P.bx, Math.abs(yb) - P.by, Math.abs(z) - P.bz);
    for (const c of P.chamfers) block = Math.max(block, c[0] * x + c[1] * yb + c[2] * z - c[3]);
  }
  // a gentle twist about the vertical as the form rises
  const tw = P.twist * (y - P.blockTop), c = Math.cos(tw), s = Math.sin(tw);
  const px = c * x - s * z, pz = s * x + c * z;
  let form;
  if (P.family === 'arc') {
    const cl = Math.cos(P.lean), sl = Math.sin(P.lean);
    const lx = cl * (px - P.cx) - sl * (y - P.cy), ly = sl * (px - P.cx) + cl * (y - P.cy);
    const outer = (Math.hypot(lx / P.rx, ly / P.ry) - 1) * Math.min(P.rx, P.ry);
    const bite = (Math.hypot((px - P.bix) / P.brx, (y - P.biy) / P.bry) - 1) * Math.min(P.brx, P.bry);
    form = smax(outer, -bite, 0.12);
    const th = P.th0 - P.taper * Math.max(0, y - P.cy) * 2 + 0.03 * Math.cos(px * 2.2);
    const bow = P.bowA * Math.cos(px * P.bowF + P.bowP) - P.bowA * 0.5;
    form = smax(form, Math.abs(pz - bow) - th, 0.12);
  } else if (P.family === 'pair') {
    const A = rbox(x - P.ac[0], y - P.ac[1], z - P.ac[2], P.a[0], P.a[1], P.a[2], P.round);
    let bx = x - P.bc[0], by = y - P.bc[1], bz = z - P.bc[2];
    const cy = Math.cos(P.bRotY), sy = Math.sin(P.bRotY);
    [bx, bz] = [cy * bx - sy * bz, sy * bx + cy * bz];
    const cz = Math.cos(P.bRotZ), sz = Math.sin(P.bRotZ);
    [bx, by] = [cz * bx - sz * by, sz * bx + cz * by];
    form = smin(A, rbox(bx, by, bz, P.b[0], P.b[1], P.b[2], P.round), 0.05);
  } else if (P.family === 'ribbon') {
    const dx = px - P.cx, dy = y - P.cy;
    let ang = Math.atan2(dy, dx);
    while (ang < P.a0) ang += Math.PI * 2;
    while (ang > P.a0 + Math.PI * 2) ang -= Math.PI * 2;
    // inside the gap, measure from the nearer end of the band
    const ac = ang <= P.a1 ? ang : (ang - P.a1 < P.a0 + Math.PI * 2 - ang ? P.a1 : P.a0);
    const nx = Math.cos(ac), ny = Math.sin(ac);
    const ex = dx - nx * P.rr, ey = dy - ny * P.rr;
    let u = ex * nx + ey * ny, w = -ex * ny + ey * nx, v = pz;
    const k = P.bandTwist * (ac - P.a0), ck = Math.cos(k), sk = Math.sin(k);
    [u, v] = [ck * u - sk * v, sk * u + ck * v];
    form = rbox(u, v, w, P.t1, P.t2, 0.06, 0.06);
  } else if (P.family === 'split') {
    const ct = Math.cos(P.tilt), st = Math.sin(P.tilt);
    const lx = ct * (px - P.cx) - st * (y - P.cy), ly = st * (px - P.cx) + ct * (y - P.cy);
    form = (Math.hypot(lx / P.ex, ly / P.ey, pz / P.ez) - 1) * Math.min(P.ex, P.ey, P.ez);
    // the slot: a thin slab of space through a diagonal plane, from the top down to gFloor
    const slot = Math.abs(P.gn[0] * (px - P.cx - P.gOff) + P.gn[1] * (y - P.cy) + P.gn[2] * pz) - P.gW;
    form = smax(form, -Math.max(slot, P.gFloor - y), 0.03);
  } else {
    let lx = px - P.cx, ly = y - P.cy, lz = pz;
    const cp = Math.cos(P.pitch), sp = Math.sin(P.pitch);
    [ly, lz] = [cp * ly - sp * lz, sp * ly + cp * lz];
    const cr = Math.cos(P.roll), sr = Math.sin(P.roll);
    [lx, ly] = [cr * lx - sr * ly, sr * lx + cr * ly];
    form = rbox(lx, ly, lz, P.hx, P.hy, P.ht, 0.05);
    const hollow = Math.hypot(lx - P.dx, ly - P.dy, lz - (P.ht + P.dr - P.dd)) - P.dr;
    form = smax(form, -hollow, 0.05);
  }
  form = smax(form, -(y - P.blockTop + 0.1), 0.02);
  return smin(block, form, 0.08);
}

// Meshes one sculpture. About 35-70 ms in V8 at res 60 (measured in Node); under 16k triangles.
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
// Nearest upscale in whole device-pixel blocks, an optional Bayer-order dissolve, then tone map, encode,
// static grain, ordered dither and vignette.
const POST_FS = `uniform sampler2D tScene, tPrev; uniform vec2 rtSize, outSize; uniform float block, levels, ditherAmt, grainAmt, vignetteAmt, seed, progress, pattern;
varying vec2 vUv;
float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec2 cell = floor(gl_FragCoord.xy / block);
  vec2 uv = (cell + 0.5) / rtSize;
  vec4 t = texture2D(tScene, uv);
  // dissolve between two sculptures: each low-res pixel switches when progress passes its Bayer rank
  if (progress < 1.0 && bayer4(cell) >= progress) t = texture2D(tPrev, uv);
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
    float r = pattern > 1.5 ? bayer8(cell) : pattern > 0.5 ? bayer4(cell) : 0.5;
    float b = 0.5 + (r - 0.5) * ditherAmt;
    c = floor(c * (levels - 1.) + b) / (levels - 1.);
  }
  gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
}`;

// The plinth controls (nameplate and buttons) are drawn in a second pass at full resolution, so their text
// stays legible, with the same vignette, grain (on the main pixel grid) and ordered dither (on a grid half
// as coarse) as the output pass. Injected at the end of their MeshStandardMaterial shaders.
const OV_HEAD = `uniform float uBlock, uOvBlock, uLevels, uDitherAmt, uGrainAmt, uVignetteAmt, uSeed, uPattern; uniform vec2 uOutSize;
float ovB2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float ovB4(vec2 a){ return ovB2(0.5 * a) * 0.25 + ovB2(a); }
float ovB8(vec2 a){ return ovB4(0.5 * a) * 0.25 + ovB2(a); }
float ovHash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`;
const OV_TAIL = `{
  vec3 c = gl_FragColor.rgb;
  vec2 big = floor(gl_FragCoord.xy / uBlock);
  vec2 q = (big + 0.5) * uBlock / uOutSize - 0.5; q.x *= uOutSize.x / uOutSize.y;
  c *= 1. - uVignetteAmt * smoothstep(0.35, 1.05, length(q));
  c += (ovHash(big + uSeed) - 0.5) * uGrainAmt;
  if (uLevels > 1.5) {
    vec2 cell = floor(gl_FragCoord.xy / uOvBlock);
    float r = uPattern > 1.5 ? ovB8(cell) : uPattern > 0.5 ? ovB4(cell) : 0.5;
    c = floor(c * (uLevels - 1.) + 0.5 + (r - 0.5) * uDitherAmt) / (uLevels - 1.);
  }
  gl_FragColor.rgb = clamp(c, 0., 1.);
}`;

/* ------------------------------------------------------------------ the scene */

export async function createSanctuaryScene(canvas, {
  object = 'escultura',
  fx = true,
  pixelScale = 4,
  motion = true,
  framing = 'landing',
  onReady = () => {},
  // optional extras (backwards-compatible additions)
  seed = undefined,        // escultura: which sculpture (0..9999); random when omitted
  onSculpture = null,      // called with the seed whenever a sculpture is shown
  interactive = true,      // a click or tap on the scene calls regenerate()
  turn = true,             // escultura: the sculpture turns on its plinth (only while motion is also true)
  dither = 0.8,            // 0 = no quantising, 1 = strongest
  grain = 0.5,             // 0 = none, 1 = most (still low amplitude); static, never refreshed
  vignette = 0,            // 0..1, soft
  onError = null,          // lost WebGL context; without it the handler throws
  onControl = null,        // a click on a plinth control (setPlinthControls): called with 'regenerate' or 'pause'
} = {}) {
  if (!canvas) throw new Error('createSanctuaryScene: canvas is required');
  const opts = { object, fx, pixelScale, motion, framing, dither, grain, vignette, interactive, turn,
    seed: Number.isFinite(Number(seed)) && seed !== null ? clampSeed(seed) : randomSeed() };
  // Everything setTuning() can change. The post-FX fields start from the options above.
  const tune = defaultTuning();
  function fxFromOptions(o) {
    if ('pixelScale' in o) tune.pixelScale = num(o.pixelScale, 4);
    if ('dither' in o) { const d = clamp01(num(o.dither, 0.8)); tune.dither = d > 0; if (d > 0) tune.levels = Math.round(34 - 26 * d); }
    if ('grain' in o) { const g = clamp01(num(o.grain, 0.5)); tune.grain = g > 0; tune.grainAmount = g; }
    if ('vignette' in o) tune.vignette = clamp01(num(o.vignette, 0));
  }
  fxFromOptions(opts);
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
  scene.background = null; // set to the fog colour only while the sky is hidden (dev tuning)

  /* lights */
  const hemi = new HemisphereLight(C(MOOD.hemi[0]), C(MOOD.hemi[1]), MOOD.hemi[2]);
  const key = new DirectionalLight(C(MOOD.key[0]), MOOD.key[1]);
  const back = new DirectionalLight(C(MOOD.back[0]), MOOD.back[1]);
  scene.add(hemi, key, back, key.target, back.target);
  [hemi, key, back].forEach(l => l.layers.enable(1)); // layer 1: the plinth controls' full-resolution pass

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
  const colonnades = {};
  {
    const cfg = MOOD.colonnade;
    const len = cfg.count * cfg.spacing + 1.2;
    const beamGeo = keepGeo(new BoxGeometry(0.95, 0.62, len));
    for (const side of [-1, 1]) {
      // one group per side, so each colonnade can be moved or hidden on its own
      const grp = new Group(), near = [], far = [];
      for (let i = 0; i < cfg.count; i++) (i < 4 ? near : far).push(M(side * cfg.x, 0, cfg.start - i * cfg.spacing));
      for (const [geo, list] of [[colNear, near], [colFar, far]]) {
        const m = new InstancedMesh(geo, stone, list.length);
        list.forEach((mx, i) => m.setMatrixAt(i, mx));
        grp.add(m);
      }
      const beam = new Mesh(beamGeo, stone);
      beam.position.set(side * cfg.x, COL_H + 0.31, cfg.start - len / 2 + 0.6);
      grp.add(beam);
      scene.add(grp);
      colonnades[side < 0 ? 'colonnadeLeft' : 'colonnadeRight'] = grp;
    }
  }
  const floor = new Mesh(keepGeo(new PlaneGeometry(240, 240).rotateX(-Math.PI / 2)), floorMat);
  scene.add(floor);

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
  function contact(x, z, sx, sz, rot = 0) {
    const m = new Mesh(shadowGeo, shadowMat);
    m.position.set(x, 0.004, z); m.scale.set(sx, 1, sz); m.rotation.y = rot; m.renderOrder = 1;
    m.userData.shadow = true;
    return m;
  }

  /* plinth controls: a nameplate and two buttons set into the plinth's front face (setPlinthControls).
     Layer 1 only: they are drawn in their own full-resolution pass (renderOverlay), never in the low-res one. */
  const controls = (() => {
    const group = new Group(); group.visible = false;
    const own = [], texes = [];
    const ovU = { ovBlock: { value: 1 } };
    const FACE = 0.36; // the escultura plinth body's front face (w 0.72)
    const state = { label: '', technique: '', pause: null, hover: null, focus: null, press: null, ink: '#3a3046', hi: '#ffffff', plate: '#eeeeee', stone: '#e4dcdb' };
    function ovMat(p, rimStrength = 0.3) {
      const m = new MeshStandardMaterial({ fog: false, roughness: 0.8, ...p });
      const rim = { color: { value: C(MOOD.rim[0]) }, strength: { value: rimStrength } };
      m.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, {
          rimColor: rim.color, rimStrength: rim.strength, uOvBlock: ovU.ovBlock,
          uBlock: postU.block, uLevels: postU.levels, uDitherAmt: postU.ditherAmt, uGrainAmt: postU.grainAmt,
          uVignetteAmt: postU.vignetteAmt, uSeed: postU.seed, uPattern: postU.pattern, uOutSize: postU.outSize,
        });
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec3 rimColor; uniform float rimStrength;\n' + OV_HEAD)
          .replace('#include <opaque_fragment>', 'float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.6);\noutgoingLight += rimColor * rimF * rimStrength;\n#include <opaque_fragment>')
          .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + OV_TAIL);
      };
      materials.push(m);
      return m;
    }
    const canvasTex = (w, h) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
      texes.push(t);
      return t;
    };
    const L1 = o => { o.traverse(x => x.layers.set(1)); return o; };
    const G = g => { own.push(g); return g; };

    // the nameplate: a thin marble panel inlaid flush (2 mm proud), with the text cut into it
    const plateTex = canvasTex(1024, 312);
    const plateSide = ovMat({ color: 0xffffff });
    const plateFace = ovMat({ color: 0xffffff, map: plateTex, roughness: 0.7 });
    const plate = new Mesh(G(new BoxGeometry(0.56, 0.17, 0.004)), [plateSide, plateSide, plateSide, plateSide, plateFace, plateSide]);
    plate.position.set(0, 0.8, FACE + 0.002);
    group.add(L1(plate));

    // two round buttons under it: a low stone drum in a cut socket, its face carrying the glyph
    const buttons = {};
    for (const [name, x] of [['regenerate', -0.12], ['pause', 0.12]]) {
      const holder = new Group(); holder.position.set(x, 0.55, FACE);
      const socket = new Mesh(G(new TorusGeometry(0.083, 0.006, 8, 48)), ovMat({ color: 0x000000, roughness: 1 }, 0));
      socket.position.z = 0.001;
      const press = new Group();
      const bodyMat = ovMat({ color: 0xffffff, emissive: 0x000000 });
      const body = new Mesh(G(new CylinderGeometry(0.074, 0.077, 0.024, 48).rotateX(Math.PI / 2).translate(0, 0, 0.012)), bodyMat);
      const tex = canvasTex(256, 256);
      const faceMat = ovMat({ color: 0xffffff, map: tex, emissive: 0x000000, roughness: 0.7 });
      const face = new Mesh(G(new CircleGeometry(0.074, 48)), faceMat);
      face.position.z = 0.0242;
      press.add(body, face);
      holder.add(socket, press);
      holder.userData.control = name; body.userData.control = name; face.userData.control = name;
      group.add(L1(holder));
      buttons[name] = { holder, press, tex, mats: [bodyMat, faceMat], socket };
    }

    function drawGlyph(name) {
      const b = buttons[name], c = b.tex.image, x = c.getContext('2d'), S = c.width;
      x.fillStyle = state.stone; x.fillRect(0, 0, S, S);
      const ink = (dx, dy, col) => {
        x.save(); x.translate(S / 2 + dx, S / 2 + dy);
        x.strokeStyle = col; x.fillStyle = col; x.lineWidth = S * 0.075; x.lineCap = 'butt';
        if (name === 'regenerate') {
          // the classic reload sign: an open circle with one arrowhead
          const r = S * 0.25, a0 = -Math.PI * 0.32, a1 = Math.PI * 1.36;
          x.beginPath(); x.arc(0, 0, r, a0, a1); x.stroke();
          const ax = Math.cos(a0) * r, ay = Math.sin(a0) * r, h = S * 0.13;
          x.beginPath();
          x.moveTo(ax + h * 0.95, ay - h * 0.1);
          x.lineTo(ax - h * 0.55, ay - h * 0.95);
          x.lineTo(ax - h * 0.25, ay + h * 0.75);
          x.closePath(); x.fill();
        } else if (state.pause === 'play') {
          x.beginPath(); x.moveTo(-S * 0.11, -S * 0.2); x.lineTo(S * 0.21, 0); x.lineTo(-S * 0.11, S * 0.2); x.closePath(); x.fill();
        } else {
          x.fillRect(-S * 0.15, -S * 0.19, S * 0.1, S * 0.38); x.fillRect(S * 0.05, -S * 0.19, S * 0.1, S * 0.38);
        }
        x.restore();
      };
      // cut, not printed: a light lower lip under a dark incision
      ink(0, S * 0.012, state.hi); ink(0, 0, state.ink);
      b.tex.needsUpdate = true;
    }
    function drawPlateText(title, technique) {
      const c = plateTex.image, x = c.getContext('2d'), W = c.width, H = c.height;
      x.fillStyle = state.plate; x.fillRect(0, 0, W, H);
      x.strokeStyle = state.ink; x.globalAlpha = 0.55; x.lineWidth = 4; x.strokeRect(22, 22, W - 44, H - 44); x.globalAlpha = 1;
      const line = (text, px, y, spacing) => {
        let size = px;
        x.font = `${size}px 'Tenor Sans', serif`;
        if ('letterSpacing' in x) x.letterSpacing = `${Math.round(size * spacing)}px`;
        while (x.measureText(text).width > W - 120 && size > 20) {
          size -= 2; x.font = `${size}px 'Tenor Sans', serif`;
          if ('letterSpacing' in x) x.letterSpacing = `${Math.round(size * spacing)}px`;
        }
        x.textAlign = 'center'; x.textBaseline = 'alphabetic';
        x.fillStyle = state.hi; x.fillText(text, W / 2, y + 3);
        x.fillStyle = state.ink; x.fillText(text, W / 2, y);
      };
      line(title.toUpperCase(), 92, H * 0.5, 0.1);
      line(technique.toUpperCase(), 52, H * 0.8, 0.12);
      plateTex.needsUpdate = true;
    }
    function shade() {
      for (const [name, b] of Object.entries(buttons)) {
        const lit = state.hover === name || state.focus === name;
        b.mats.forEach(m => { m.emissive.copy(skyU.sunColor.value); m.emissiveIntensity = lit ? 0.32 : 0; });
        b.press.position.z = state.press === name ? -0.011 : 0;
      }
      buttons.pause.holder.visible = state.pause !== null;
    }
    return {
      group, state, ovU,
      recolour(p) {
        const ink = C(p.marbleShadow).lerp(C('#000000'), 0.45);
        state.ink = '#' + ink.getHexString();
        state.hi = '#' + C(p.marble).lerp(C('#ffffff'), 0.5).getHexString();
        state.plate = '#' + marble.color.getHexString();
        state.stone = '#' + plinthMat.color.clone().lerp(C('#ffffff'), 0.12).getHexString();
        plateSide.color.copy(marble.color);
        Object.values(buttons).forEach(b => b.socket.material.color.copy(C(p.marbleShadow).lerp(C('#000000'), 0.6)));
        drawGlyph('regenerate'); drawGlyph('pause');
      },
      drawPlate: drawPlateText, drawGlyph, shade,
      buttons, plate,
      dispose() { own.forEach(g => g.dispose()); texes.forEach(t => t.dispose()); },
    };
  })();
  function drawPlate() {
    if (!controls.group.visible || !kit || kit.name !== 'escultura') return;
    controls.drawPlate(`${controls.state.label} ${String(opts.seed).padStart(4, '0')}`, controls.state.technique);
    requestRender();
  }

  /* the object on its plinth(s) */
  const rig = new Group();
  scene.add(rig);
  let kit = null;
  const mesh = (geo, mat) => new Mesh(geo, mat);

  // The turntable: only the sculpture turns; the plinth (and the label pinned to its corner) stays put.
  // The angle lives here, not on the mesh, so a new sculpture carries on from the same angle.
  const spin = { angle: 0, last: 0 };
  let turner = null;
  const spinning = () => !!(opts.motion && opts.turn && tune.turntable && turner && opts.object === 'escultura');

  function buildKit(name, sculptureSeed) {
    turner = null;
    const g = new Group(), own = [];
    const G = geo => { own.push(geo); return geo; };
    let focusY = 1.45, extent = 0.6, plinth = { w: 0.72, h: 1.04 };
    const plinths = [];
    const plinthMesh = (w, h, x = 0, z = 0) => {
      const p = mesh(G(plinthGeo(w, h)), plinthMat);
      p.position.set(x, 0, z); p.userData.base = new Vector3(x, 0, z);
      plinths.push(p);
      return p;
    };
    if (name === 'ruina') {
      const PH = 1.0;
      plinth = { w: 0.8, h: PH };
      g.add(plinthMesh(0.8, PH), contact(0.08, 0.06, 1.7, 1.7));
      const cap = mesh(G(ionicCapital()), ruinStone);
      cap.scale.setScalar(1.05); cap.position.y = PH; cap.rotation.y = -30 * DEG;
      g.add(cap);
      const d1 = mesh(G(brokenDrum(0.62, 7)), ruinStone);
      d1.rotation.set(0, 0.5, Math.PI / 2); d1.position.set(-1.05, R * 0.94, -1.1);
      const d2 = mesh(G(brokenDrum(0.44, 19)), ruinStone);
      d2.rotation.set(0, -0.4, -Math.PI / 2); d2.position.set(0.95, R * 0.94, -1.9);
      g.add(d1, d2, contact(-1.05, -1.1, 1.0, 0.85, 0.5), contact(0.95, -1.9, 0.78, 0.8, -0.4));
      focusY = 1.42; extent = 0.75;
    } else if (name === 'escultura') {
      const PH = 1.04;
      g.add(plinthMesh(0.72, PH), contact(0.06, 0.06, 1.6, 1.6));
      const s = 0.37;
      const geo = G(buildSculptureGeometry(sculptureSeed));
      const sc = mesh(geo, marble);
      sc.scale.setScalar(s);
      sc.position.y = PH - geo.boundingBox.min.y * s;
      sc.rotation.y = geo.userData.params.yaw + spin.angle;
      sc.userData.yaw = geo.userData.params.yaw;
      sc.userData.scale = s; sc.userData.plinthH = PH;
      g.add(sc);
      turner = sc;
      focusY = 1.5; extent = 0.55;
    } else {
      // the sculptor's study: three solids on plinths of different heights
      const spots = [
        { x: -0.52, z: 0.22, h: 0.78, w: 0.4 },
        { x: 0.0, z: -0.14, h: 1.08, w: 0.46 },
        { x: 0.5, z: 0.3, h: 0.9, w: 0.38 },
      ];
      for (const sp of spots) g.add(plinthMesh(sp.w, sp.h, sp.x, sp.z), contact(sp.x + 0.05, sp.z + 0.05, sp.w * 2.1, sp.w * 2.1));
      const ring = mesh(G(new TorusGeometry(0.15, 0.052, 14, 48)), ringMat);
      ring.position.set(spots[0].x, spots[0].h + 0.202, spots[0].z); ring.rotation.y = 28 * DEG;
      const solid = mesh(G(durerSolid(0.46)), facetMat);
      solid.position.set(spots[1].x, spots[1].h, spots[1].z); solid.rotation.y = 12 * DEG;
      const ball = mesh(G(new SphereGeometry(0.155, 40, 28)), honed);
      ball.position.set(spots[2].x, spots[2].h + 0.155, spots[2].z);
      g.add(ring, solid, ball);
      focusY = 1.34; extent = 1.0; plinth = { w: 0.46, h: 1.08, z: -0.14 };
    }
    // the main plinth: the label anchor and the plinth controls belong to it
    const main = name === 'estudio' ? plinths[1] : plinths[0];
    return { name, seed: sculptureSeed, group: g, focusY, extent, plinth, plinths, main, own };
  }

  function setKit(name, sculptureSeed) {
    if (kit) { kit.main.remove(controls.group); rig.remove(kit.group); kit.own.forEach(g => g.dispose()); }
    kit = buildKit(name, sculptureSeed);
    rig.add(kit.group);
    if (name === 'escultura') kit.main.add(controls.group);
    applyAssets();
    drawPlate();
    if (name === 'escultura' && typeof onSculpture === 'function') {
      try { onSculpture(sculptureSeed); } catch (e) { console.error(e); }
    }
  }

  /* framing: a fixed camera per framing; nothing moves */
  const view = { cam: new Vector3(), offX: 0, offY: 0, fov: 38, rigBase: new Vector3() };
  function frame3() {
    const aspect = size.w / size.h, portrait = aspect < 0.95;
    const f = opts.framing, k = kit, base = view.rigBase;
    if (f === 'small') {
      view.fov = 30;
      const dist = (k.extent * 1.25) / Math.tan(view.fov * DEG / 2) / Math.min(1, aspect);
      base.set(0, 0, 0);
      view.cam.set(0, k.focusY + 0.1, dist);
      view.offX = 0; view.offY = 0.16;
    } else if (f === 'background') {
      view.fov = portrait ? 52 : 36;
      base.set(0, 0, 0);
      view.cam.set(0, k.focusY + 0.15, portrait ? 4.2 : 4.6);
      view.offX = 0; view.offY = portrait ? 0.3 : 0.12;
    } else if (portrait) {
      view.fov = 50;
      base.set(0, 0, 0.3);
      view.cam.set(0, k.focusY + 0.3, k.name === 'estudio' ? 4.6 : 4.0);
      view.offX = 0; view.offY = 0.42; // the object sits in the upper third, above a bottom text panel
    } else {
      // landscape landing: text panel on the left (about 45% of the width), the object right of centre.
      // The plinth's centre lands at a fixed share of the width: 61% at 16:10 and wider, easing to 64.5%
      // at 4:3, where the text column takes relatively more room. (It sat at about 72% before 2026-11-25.)
      view.fov = aspect > 2 ? 32 : 38;
      const share = 0.61 + 0.035 * clamp01((1.6 - aspect) / 0.27);
      const depth = 4.3 - 0.3 - 0.36; // camera to the plinth's front face
      base.set((2 * share - 1) * depth * Math.tan(view.fov * DEG / 2) * aspect, 0, 0.3);
      view.cam.set(0, k.focusY + 0.2, 4.3);
      view.offX = 0; view.offY = 0.07; // a little higher than the old 0.03, clear of the bottom edge
    }
    camera.position.copy(view.cam);
    camera.rotation.set(0, 0, 0);
    applyAssets();
  }

  /* assets: base transforms (framing, kit) plus the tuning's offsets */
  const sunBase = new Vector3(MOOD.sun.dir[0], MOOD.sun.dir[1], -1);
  function applyAssets() {
    const A = tune.assets;
    const o = A.object;
    rig.position.set(view.rigBase.x + o.x, view.rigBase.y + o.y, view.rigBase.z + o.z);
    rig.rotation.y = o.rotY * DEG; rig.scale.setScalar(o.scale); rig.visible = o.visible;
    const kp = MOOD.key[2], bp = MOOD.back[2];
    key.target.position.copy(rig.position); back.target.position.copy(rig.position);
    key.position.set(rig.position.x + kp[0], kp[1], rig.position.z + kp[2]);
    back.position.set(rig.position.x + bp[0], bp[1], rig.position.z + bp[2]);
    if (kit) {
      const P = A.plinth;
      for (const m of kit.plinths) {
        const b = m.userData.base;
        m.position.set(b.x + P.x, b.y + P.y, b.z + P.z);
        m.rotation.y = P.rotY * DEG; m.scale.setScalar(P.scale); m.visible = P.visible;
      }
      kit.group.children.forEach(m => { if (m.userData.shadow) m.visible = A.shadow.visible; });
      if (turner) {
        // the sculpture stands on the plinth wherever the plinth goes
        const S = A.sculpture, sc = turner.userData.scale * S.scale;
        turner.scale.setScalar(sc);
        turner.position.set(P.x + S.x, P.y + turner.userData.plinthH * P.scale - turner.geometry.boundingBox.min.y * sc + S.y, P.z + S.z);
        turner.visible = S.visible;
        turner.rotation.y = turner.userData.yaw + spin.angle + S.rotY * DEG;
      }
    }
    for (const n of ['colonnadeLeft', 'colonnadeRight']) {
      const g = colonnades[n], t = A[n];
      g.position.set(t.x, t.y, t.z); g.rotation.y = t.rotY * DEG; g.scale.setScalar(t.scale); g.visible = t.visible;
    }
    floor.position.set(A.floor.x, A.floor.y, A.floor.z); floor.visible = A.floor.visible;
    sky.visible = A.sky.visible;
    scene.background = A.sky.visible ? null : scene.fog.color;
    skyU.sunDir.value.set(sunBase.x + A.sun.x, sunBase.y + A.sun.y, -1).normalize();
    skyU.sunSize.value = MOOD.sun.size * DEG * A.sun.scale;
    skyU.sunAlpha.value = A.sun.visible ? MOOD.sun.alpha : 0;
    skyU.glow.value = A.sun.visible ? MOOD.sun.glow : 0;
    sceneDirty = true;
  }

  /* palette: sky, sun and fog take the colours as they are; materials are tinted by the ratio to the
     default palette, so the default reproduces today's colours exactly */
  const ratio = (hex, ref) => { const a = C(hex), b = C(ref); return new Color(a.r / b.r, a.g / b.g, a.b / b.b); };
  const tinted = (hex, r) => { const c = C(hex).multiply(r); c.r = Math.min(1, c.r); c.g = Math.min(1, c.g); c.b = Math.min(1, c.b); return c; };
  const BASE = {
    stone: MOOD.stone, plinth: '#E4DCDB', marble: '#F1EBE6', ruin: '#E9E1DE', facet: '#F0E2D8', honed: '#ECE6EC', ring: '#E3DDEE',
    floor: MOOD.floor, shadow: '#241d38',
  };
  function applyPalette() {
    const p = { ...DEFAULT_PALETTE, ...tune.palette }, D = DEFAULT_PALETTE;
    skyU.top.value.set(p.skyTop); skyU.mid.value.set(p.skyMid); skyU.low.value.set(p.skyLow); skyU.horizon.value.set(p.horizon);
    skyU.sunColor.value.set(p.sun);
    skyU.sunColor2.value.copy(p.sun.toLowerCase() === D.sun.toLowerCase() ? C(MOOD.sun.color2) : C(p.sun).lerp(C(p.horizon), 0.35));
    key.color.copy(tinted(MOOD.key[0], ratio(p.sun, D.sun)));
    scene.fog.color.set(p.fog);
    const m = ratio(p.marble, D.marble), sh = ratio(p.marbleShadow, D.marbleShadow);
    stone.color.copy(tinted(BASE.stone, m)); plinthMat.color.copy(tinted(BASE.plinth, m)); marble.color.copy(tinted(BASE.marble, m));
    ruinStone.color.copy(tinted(BASE.ruin, m)); facetMat.color.copy(tinted(BASE.facet, m));
    honed.color.copy(tinted(BASE.honed, m)); ringMat.color.copy(tinted(BASE.ring, m));
    hemi.groundColor.set(p.marbleShadow);
    floorMat.color.copy(tinted(BASE.floor, sh)); shadowMat.color.copy(tinted(BASE.shadow, sh));
    controls.recolour(p);
    drawPlate();
    sceneDirty = true;
  }

  /* render targets (two, for the dissolve) and the output pass */
  const size = { w: 1, h: 1, dw: 1, dh: 1, block: 1, rw: 1, rh: 1 };
  let rtCur = null, rtPrev = null;
  const postU = {
    tScene: { value: null }, tPrev: { value: null }, progress: { value: 1 },
    rtSize: { value: new Vector2(1, 1) }, outSize: { value: new Vector2(1, 1) },
    block: { value: 1 }, levels: { value: 0 }, ditherAmt: { value: 1 }, grainAmt: { value: 0 }, vignetteAmt: { value: 0 }, seed: { value: 17.0 },
    pattern: { value: 1 },
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
    const on = !!opts.fx, t = tune;
    return {
      levels: on && t.dither ? Math.max(2, Math.min(64, Math.round(num(t.levels, 13)))) : 0,
      ditherAmt: clamp01(num(t.ditherStrength, 1)),
      pattern: t.ditherPattern === 'none' ? 0 : t.ditherPattern === 'bayer8' ? 2 : 1,
      gr: on && t.grain ? Math.max(0, Math.min(3, num(t.grainAmount, 0.5))) : 0,
      v: on ? clamp01(num(t.vignette, 0)) : 0,
      scale: on ? Math.max(1, Math.min(8, Math.round(num(t.pixelScale, 4)))) : 1,
    };
  }
  const makeRT = samples => new WebGLRenderTarget(size.rw, size.rh, {
    type: halfFloat ? HalfFloatType : UnsignedByteType,
    colorSpace: halfFloat ? NoColorSpace : SRGBColorSpace,
    minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: true, samples,
  });

  function resize() {
    if (disposed) return;
    const w = Math.max(1, Math.round(canvas.clientWidth || host.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight || host.clientHeight || window.innerHeight));
    const p = fxParams();
    size.w = w; size.h = h;
    size.dw = Math.round(w * dpr); size.dh = Math.round(h * dpr);
    size.block = p.scale > 1 ? Math.max(1, Math.round(p.scale * dpr)) : 1;
    size.rw = Math.ceil(size.dw / size.block); size.rh = Math.ceil(size.dh / size.block);
    renderer.setSize(size.dw, size.dh, false);
    const samples = size.block === 1 && renderer.capabilities.isWebGL2 ? 4 : 0;
    if (!rtCur || rtCur.width !== size.rw || rtCur.height !== size.rh || rtCur.samples !== samples) {
      if (rtCur) rtCur.dispose();
      if (rtPrev) rtPrev.dispose();
      rtCur = makeRT(samples); rtPrev = makeRT(samples);
      endDissolve();
    }
    postU.tScene.value = rtCur.texture;
    postU.tPrev.value = rtPrev.texture;
    postU.rtSize.value.set(size.rw, size.rh);
    postU.outSize.value.set(size.dw, size.dh);
    postU.block.value = size.block;
    postU.levels.value = p.levels;
    postU.ditherAmt.value = p.ditherAmt;
    postU.pattern.value = p.pattern;
    postU.grainAmt.value = p.gr * 0.045;
    postU.vignetteAmt.value = p.v * 0.4;
    controls.ovU.ovBlock.value = Math.max(1, Math.floor(size.block / 2));
    frame3();
    camera.aspect = size.rw / size.rh;
    camera.fov = view.fov;
    camera.setViewOffset(size.rw, size.rh, Math.round(view.offX * size.rw), Math.round(view.offY * size.rh), size.rw, size.rh);
    camera.updateProjectionMatrix();
    sceneDirty = true;
    requestRender();
  }

  /* dissolve between two sculptures (motion on only); the scene itself never moves */
  const DISSOLVE_MS = 800;
  const dissolve = { active: false, t0: 0 };
  function endDissolve() { dissolve.active = false; postU.progress.value = 1; }

  function regenerate(next) {
    if (disposed) return opts.seed;
    let s = next === undefined || next === null ? randomSeed() : clampSeed(next);
    if (next === undefined || next === null) {
      // a new family every time, so consecutive sculptures look clearly different
      const was = sculptureFamily(opts.seed);
      for (let i = 0; i < 40 && (s === opts.seed || sculptureFamily(s) === was); i++) s = randomSeed();
    }
    opts.seed = s;
    if (opts.object !== 'escultura') return s;
    const animate = !!opts.motion && ready && !lost && !document.hidden;
    if (animate) {
      // keep the last image of the old sculpture in rtPrev, render the new one into rtCur, then dissolve
      const t = rtPrev; rtPrev = rtCur; rtCur = t;
      postU.tScene.value = rtCur.texture; postU.tPrev.value = rtPrev.texture;
      setKit('escultura', s);
      frame3();
      renderScene();
      dissolve.active = true; dissolve.t0 = performance.now(); postU.progress.value = 0;
      requestRender();
    } else {
      endDissolve();
      setKit('escultura', s);
      frame3();
      sceneDirty = true;
      requestRender();
    }
    return s;
  }

  /* the only interaction: a click or tap on the scene shows another sculpture */
  const raycaster = new Raycaster(); raycaster.layers.set(1);
  function pickControl(clientX, clientY) {
    if (!controls.group.visible || !kit || !rig.visible) return null;
    const r = canvas.getBoundingClientRect();
    const cropX = (size.rw * size.block - size.dw) / dpr, cropY = (size.rh * size.block - size.dh) / dpr;
    const ndc = new Vector2(((clientX - r.left) / (size.w + cropX)) * 2 - 1, 1 - ((clientY - r.top + cropY) / (size.h + cropY)) * 2);
    raycaster.setFromCamera(ndc, camera);
    for (const hit of raycaster.intersectObject(controls.group, true)) {
      for (let o = hit.object; o; o = o.parent) {
        if (o.userData.control && (o.userData.control !== 'pause' || controls.state.pause !== null)) return o.userData.control;
      }
    }
    return null;
  }
  const onClick = e => {
    if (disposed) return;
    const hit = pickControl(e.clientX, e.clientY);
    if (hit) { if (typeof onControl === 'function') onControl(hit); return; }
    if (!opts.interactive || opts.object !== 'escultura') return;
    if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea, label, [role="button"], [data-no-tap]')) return;
    regenerate();
  };
  host.addEventListener('click', onClick);

  /* render loop: frames only on change, about 30 fps while turning or dissolving, nothing while hidden */
  let raf = 0, needs = false, sceneDirty = true, lastRender = 0, ready = false, disposed = false, lost = false, frames = 0;
  function schedule() { if (!raf && !disposed && !lost && !document.hidden) raf = requestAnimationFrame(tick); }
  function requestRender() { needs = true; schedule(); }

  function renderScene() {
    renderer.setRenderTarget(rtCur);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    sceneDirty = false;
  }
  function renderPost() { renderer.render(postScene, postCam); renderOverlay(); frames++; }
  // the plinth controls at full resolution, on the same frame as the low-res image (whose grid is
  // rw*block x rh*block device px from the bottom-left corner, cropped at the top and right)
  function renderOverlay() {
    if (!controls.group.visible || !kit || !rig.visible || !kit.main.visible) return;
    const bg = scene.background;
    scene.background = null;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.setViewport(0, 0, size.rw * size.block, size.rh * size.block);
    camera.layers.set(1);
    renderer.render(scene, camera);
    camera.layers.set(0);
    renderer.setViewport(0, 0, size.dw, size.dh);
    renderer.autoClear = true;
    scene.background = bg;
  }

  function tick(now) {
    raf = 0;
    if (disposed || lost || document.hidden) return;
    const moving = dissolve.active || spinning();
    if (moving) {
      // 2 ms of slack, so a 60 Hz display draws every second frame instead of every third
      if (now - lastRender < FRAME_MS - 2 && !needs) { schedule(); return; }
      if (dissolve.active) {
        const k = Math.min(1, (now - dissolve.t0) / DISSOLVE_MS);
        postU.progress.value = k;
        if (k >= 1) endDissolve();
      }
      update(now);
    } else if (!needs) return;
    if (sceneDirty) renderScene();
    renderPost();
    lastRender = now; needs = false;
    if (!ready) { ready = true; try { onReady(); } catch (e) { console.error(e); } }
    if (dissolve.active || spinning()) schedule();
    else spin.last = 0;
  }

  // Advances the turntable by the time that really passed (frame-rate independent). A long gap (the
  // first frame, a stall, a pause) never jumps: the step is capped and the turn simply resumes.
  function update(now) {
    if (!spinning()) { spin.last = 0; return; }
    const dt = spin.last ? Math.min(now - spin.last, 100) : 0;
    spin.last = now;
    if (dt > 0) {
      const turnMs = Math.max(5, num(tune.turnSeconds, TURN_MS / 1000)) * 1000;
      spin.angle = (spin.angle + (dt / turnMs) * Math.PI * 2) % (Math.PI * 2);
      turner.rotation.y = turner.userData.yaw + spin.angle + tune.assets.sculpture.rotY * DEG;
      sceneDirty = true;
    }
  }

  const onVis = () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; endDissolve(); spin.last = 0; }
    else requestRender();
  };
  document.addEventListener('visibilitychange', onVis);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
  if (ro) ro.observe(host);

  const onLost = e => {
    e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0;
    const err = new Error('WebGL context lost');
    if (typeof onError === 'function') onError(err); else throw err;
  };
  canvas.addEventListener('webglcontextlost', onLost);

  setKit(opts.object = OBJECTS.includes(opts.object) ? opts.object : 'escultura', opts.seed);
  applyTuning();
  // the nameplate is drawn in Tenor Sans: draw it again once the font is there
  try { document.fonts.load("92px 'Tenor Sans'").then(() => { if (!disposed) drawPlate(); }, () => {}); } catch (e) { /* no font loading API */ }

  // Live tuning: post-FX, light, palette, turntable and per-asset offsets. Only changed parts are needed.
  function applyTuning() {
    scene.fog.density = MOOD.fog.density * Math.max(0, num(tune.fog, 1));
    renderer.toneMappingExposure = Math.max(0.05, num(tune.exposure, 1));
    hemi.intensity = MOOD.hemi[2] * num(tune.light.fill, 1);
    key.intensity = MOOD.key[1] * num(tune.light.key, 1);
    back.intensity = MOOD.back[1] * num(tune.light.back, 1);
    applyPalette();
    resize(); // post-FX uniforms, pixel grid, framing and assets
  }
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  function deepMerge(into, from) {
    for (const [k, v] of Object.entries(from)) {
      if (isObj(v) && isObj(into[k])) deepMerge(into[k], v);
      else if (v !== undefined) into[k] = v;
    }
  }
  // Where an object sits on screen, in CSS px from the canvas's top-left corner (the same mapping as anchor()).
  function toScreen(v) {
    v.project(camera);
    const cropX = (size.rw * size.block - size.dw) / dpr, cropY = (size.rh * size.block - size.dh) / dpr;
    return { x: (v.x * 0.5 + 0.5) * (size.w + cropX), y: (1 - (v.y * 0.5 + 0.5)) * (size.h + cropY) - cropY };
  }
  function screenRect(obj) {
    scene.updateMatrixWorld();
    const b = new Box3().setFromObject(obj);
    if (b.isEmpty()) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < 8; i++) {
      const p = toScreen(new Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  return {
    setOptions(partial = {}) {
      if (disposed || !partial) return;
      const prevObj = opts.object, prevSeed = opts.seed;
      const { seed: nextSeed, ...rest } = partial;
      Object.assign(opts, rest);
      fxFromOptions(rest);
      if (!OBJECTS.includes(opts.object)) opts.object = 'escultura';
      if (!opts.motion) endDissolve();
      if (nextSeed !== undefined && nextSeed !== null && clampSeed(nextSeed) !== prevSeed && opts.object === prevObj) {
        regenerate(nextSeed);
      } else if (nextSeed !== undefined && nextSeed !== null) {
        opts.seed = clampSeed(nextSeed);
      }
      if (opts.object !== prevObj) { endDissolve(); setKit(opts.object, opts.seed); }
      resize();
    },
    resize,
    regenerate,
    /** Live tuning (dev panel): any part of defaultTuning()'s shape. Re-renders, never reloads. */
    setTuning(partial = {}) {
      if (disposed || !isObj(partial)) return;
      const { seed: nextSeed, ...rest } = partial;
      deepMerge(tune, rest);
      if (nextSeed !== undefined && nextSeed !== null && clampSeed(nextSeed) !== opts.seed) regenerate(nextSeed);
      applyTuning();
      if (spinning()) requestRender();
    },
    /** A copy of the current tuning. */
    getTuning() { return JSON.parse(JSON.stringify({ ...tune, seed: opts.seed })); },
    /**
     * The nameplate and buttons on the plinth's front face (escultura only). label: 'Escultura nº' (the seed is
     * added), technique: the second line, pause: 'pause' | 'play' | null (null hides that button).
     */
    setPlinthControls(o = {}) {
      if (disposed) return;
      const st = controls.state;
      if (typeof o.label === 'string') st.label = o.label;
      if (typeof o.technique === 'string') st.technique = o.technique;
      const glyphWas = st.pause;
      if ('pause' in o) st.pause = o.pause === 'play' || o.pause === 'pause' ? o.pause : null;
      if ('on' in o) controls.group.visible = !!o.on;
      if (st.pause !== glyphWas && st.pause) controls.drawGlyph('pause');
      controls.shade();
      drawPlate();
      requestRender();
    },
    /** Hover, keyboard focus and press feedback: each 'regenerate' | 'pause' | null. */
    setControlState(o = {}) {
      if (disposed) return;
      Object.assign(controls.state, o);
      controls.shade();
      requestRender();
    },
    /** Screen rectangles (CSS px from the canvas's top-left) of the nameplate and the two buttons, or null. */
    controlRects() {
      if (disposed || !controls.group.visible || !kit || kit.name !== 'escultura' || !rig.visible || !kit.main.visible) return null;
      const B = controls.buttons;
      return {
        plate: screenRect(controls.plate),
        regenerate: screenRect(B.regenerate.press),
        pause: controls.state.pause ? screenRect(B.pause.press) : null,
      };
    },
    /** Which plinth control is under a viewport point, if any. */
    pickControl,
    /** Frames drawn so far (for an FPS readout). */
    get frames() { return frames; },
    get seed() { return opts.seed; },
    /** True while the sculpture is actually turning (motion on, turn on, escultura). */
    get turning() { return spinning(); },
    /** The turntable angle in radians (0..2π); it holds while paused. */
    get angle() { return spin.angle; },
    snapshot(type = 'image/jpeg', q = 0.86) {
      if (disposed || lost) return '';
      endDissolve(); renderScene(); renderPost();
      return canvas.toDataURL(type, q);
    },
    // Where to pin a museum label, in CSS px from the canvas's top-left corner.
    // 'plinth': the front-right top corner of the (main) plinth. 'beside': right of the object at its middle height.
    anchor(which = 'plinth') {
      if (!kit) return null;
      const p = kit.plinth, half = p.w / 2 + 0.07;
      // in the main plinth's own space, so the anchor follows any tuning of the object or the plinth
      const v = which === 'beside' ? new Vector3(half + 0.06, p.h + 0.28, 0) : new Vector3(half, p.h, half);
      scene.updateMatrixWorld();
      return toScreen(kit.main.localToWorld(v));
    },
    triangles(part = 'scene') {
      let n = 0;
      const visible = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
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
      host.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (ro) ro.disconnect();
      if (kit) kit.own.forEach(g => g.dispose());
      controls.dispose();
      geometries.forEach(g => g.dispose());
      sky.geometry.dispose(); skyMat.dispose();
      materials.forEach(m => m.dispose());
      postGeo.dispose(); postMat.dispose(); shadowTex.dispose();
      if (rtCur) rtCur.dispose();
      if (rtPrev) rtPrev.dispose();
      scene.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function clampSeed(v) { const n = Math.round(Number(v)); return Number.isFinite(n) ? ((n % (SEED_MAX + 1)) + SEED_MAX + 1) % (SEED_MAX + 1) : randomSeed(); }

function num(v, d) { if (v === true) return d; if (v === false || v == null) return v === false ? 0 : d; const n = Number(v); return Number.isFinite(n) ? n : d; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

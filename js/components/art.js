// Arte do login (anéis + ondas), redesenhada conforme o tamanho real do painel.
// As cores vêm de variáveis CSS, então a troca de tema não exige redesenho.
import { html, useRef, useEffect } from '../../vendor/htm-preact.js';

const NS = 'http://www.w3.org/2000/svg';
const desktopMq = window.matchMedia('(min-width: 860px)');

const rad = a => a * Math.PI / 180;
const pt = (cx, cy, r, a) => [+(cx + r * Math.cos(rad(a))).toFixed(1), +(cy + r * Math.sin(rad(a))).toFixed(1)];

// anel quase completo, com abertura no canto superior direito
function ring(cx, cy, r) {
  const p1 = pt(cx, cy, r, -20), p2 = pt(cx, cy, r, -80);
  return `M${p1[0]} ${p1[1]}A${r} ${r} 0 1 1 ${p2[0]} ${p2[1]}`;
}
function arc(cx, cy, r, a1, a2) {
  const p1 = pt(cx, cy, r, a1), p2 = pt(cx, cy, r, a2);
  return { d: `M${p1[0]} ${p1[1]}A${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${p2[0]} ${p2[1]}`, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] };
}
function dotOf(cx, cy, r, a = -50) {
  const p = pt(cx, cy, r * 1.092, a);
  return { x: p[0], y: p[1], r: +(r * 0.277).toFixed(1) };
}
// onda vertical: preenche à esquerda da curva x(y)
function waveV(base, amp, ph, H) {
  let p = `M0 0L${base} 0`;
  for (let y = 0; y <= H; y += 8) p += `L${(base + amp * Math.sin(y / 70 + ph) + amp * 0.45 * Math.sin(y / 23 + ph * 2)).toFixed(1)} ${y}`;
  return p + `L0 ${H}Z`;
}
// onda horizontal: preenche abaixo da curva y(x)
function waveH(base, amp, ph, W, H) {
  let p = `M0 ${H}L0 ${base}`;
  for (let x = 0; x <= W; x += 6) p += `L${x} ${(base + amp * Math.sin(x / 48 + ph) + amp * 0.4 * Math.sin(x / 17 + ph * 2)).toFixed(1)}`;
  return p + `L${W} ${H}Z`;
}

const el = (name, attrs) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

function draw(svg) {
  const w = svg.clientWidth, h = svg.clientHeight;
  if (!w || !h) return;
  const desktop = desktopMq.matches;

  let cx, cy, r, k, waves, echoRadii, streakDefs;
  if (desktop) {
    r = Math.max(70, Math.min(w * 0.2, h * 0.16)); k = r / 112; cx = w * 0.6; cy = h * 0.4;
    echoRadii = [190, 262, 334, 406, 478, 560].map(v => v * k);
    streakDefs = [[262, 110, 190, 3], [406, -150, -95, 4], [560, 70, 140, 2.5]].map(s => [s[0] * k, s[1], s[2], s[3]]);
    // faixas verticais na borda esquerda, encostadas no painel do formulário
    waves = [['var(--w1)', waveV(64, 12, 0.4, h)], ['var(--w2)', waveV(40, 12, 1.3, h)], ['var(--w3)', waveV(16, 12, 2.2, h)]];
  } else {
    r = Math.max(34, Math.min(w * 0.145, h * 0.2)); k = r / 56; cx = w * 0.72; cy = h * 0.4;
    echoRadii = [100, 150, 200, 250].map(v => v * k);
    streakDefs = [[150 * k, 100, 175, 3]];
    // faixas horizontais na base, encostadas no formulário
    waves = [['var(--w1)', waveH(h - 40, 8, 0.6, w, h)], ['var(--w2)', waveH(h - 26, 7, 1.4, w, h)], ['var(--w3)', waveH(h - 12, 6, 2.3, w, h)]];
  }
  const ringW = (desktop ? 44 : 22) * k;

  const defs = el('defs', {});
  const glow = el('radialGradient', { id: 'glow', cx, cy, r: Math.max(w, h) * 0.55, gradientUnits: 'userSpaceOnUse' });
  glow.append(el('stop', { offset: 0, style: 'stop-color:color-mix(in srgb, var(--art) 82%, #fff)' }), el('stop', { offset: 1, style: 'stop-color:var(--art)' }));
  defs.append(glow);
  const streaks = streakDefs.map((s, i) => {
    const a = arc(cx, cy, s[0], s[1], s[2]);
    const g = el('linearGradient', { id: 'st' + i, x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2, gradientUnits: 'userSpaceOnUse' });
    g.append(el('stop', { offset: 0, style: 'stop-color:var(--ring);stop-opacity:0' }), el('stop', { offset: 1, style: 'stop-color:var(--ring)' }));
    defs.append(g);
    return { a, w: s[3], i };
  });

  const frag = document.createDocumentFragment();
  frag.append(defs, el('rect', { width: w, height: h, fill: 'url(#glow)' }));
  echoRadii.forEach((rr, i) => frag.append(el('path', { d: ring(cx, cy, rr), fill: 'none', style: 'stroke:var(--echo)', 'stroke-opacity': Math.max(0.03, 0.16 - i * 0.022).toFixed(3), 'stroke-width': 1.5, 'stroke-linecap': 'round' })));
  streaks.forEach(s => frag.append(
    el('path', { d: s.a.d, fill: 'none', stroke: `url(#st${s.i})`, 'stroke-width': s.w, 'stroke-linecap': 'round' }),
    el('circle', { cx: s.a.x2, cy: s.a.y2, r: s.w * 1.8, style: 'fill:var(--ring)' })));
  frag.append(el('path', { d: ring(cx, cy, r), fill: 'none', style: 'stroke:var(--ring)', 'stroke-width': ringW, 'stroke-linecap': 'round' }));
  [[-37, 0.32, 0.9], [-27, 0.14, 0.78]].forEach(g => {
    const d = dotOf(cx, cy, r, g[0]);
    frag.append(el('circle', { cx: d.x, cy: d.y, r: +(d.r * g[2]).toFixed(1), style: 'fill:var(--dot)', 'fill-opacity': g[1] }));
  });
  const dot = dotOf(cx, cy, r);
  frag.append(el('circle', { cx: dot.x, cy: dot.y, r: dot.r, style: 'fill:var(--dot)' }));
  waves.forEach(([fill, d]) => frag.append(el('path', { d, style: `fill:${fill}` })));

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.replaceChildren(frag);
}

export function Art() {
  const ref = useRef(null);
  useEffect(() => {
    const svg = ref.current; let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => draw(svg)); };
    const ro = new ResizeObserver(schedule); ro.observe(svg);
    draw(svg);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return html`<svg class="art__svg" ref=${ref} aria-hidden="true" focusable="false"></svg>`;
}

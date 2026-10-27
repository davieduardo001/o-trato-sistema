(function () {
  'use strict';

  // ---------- arte (anéis + ondas), redesenhada conforme o tamanho real do painel ----------

  var svg = document.getElementById('art');
  var NS = 'http://www.w3.org/2000/svg';
  var desktopMq = window.matchMedia('(min-width: 860px)');

  function rad(a) { return a * Math.PI / 180; }
  function pt(cx, cy, r, a) { return [+(cx + r * Math.cos(rad(a))).toFixed(1), +(cy + r * Math.sin(rad(a))).toFixed(1)]; }

  // anel quase completo, com abertura no canto superior direito
  function ring(cx, cy, r) {
    var p1 = pt(cx, cy, r, -20), p2 = pt(cx, cy, r, -80);
    return 'M' + p1[0] + ' ' + p1[1] + 'A' + r + ' ' + r + ' 0 1 1 ' + p2[0] + ' ' + p2[1];
  }
  function arc(cx, cy, r, a1, a2) {
    var p1 = pt(cx, cy, r, a1), p2 = pt(cx, cy, r, a2);
    return { d: 'M' + p1[0] + ' ' + p1[1] + 'A' + r + ' ' + r + ' 0 ' + (a2 - a1 > 180 ? 1 : 0) + ' 1 ' + p2[0] + ' ' + p2[1], x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] };
  }
  function dotOf(cx, cy, r, a) {
    var p = pt(cx, cy, r * 1.092, a == null ? -50 : a);
    return { x: p[0], y: p[1], r: +(r * 0.277).toFixed(1) };
  }

  // onda vertical: preenche à esquerda da curva x(y)
  function waveV(base, amp, ph, H) {
    var p = 'M0 0L' + base + ' 0';
    for (var y = 0; y <= H; y += 8) {
      var x = base + amp * Math.sin(y / 70 + ph) + amp * 0.45 * Math.sin(y / 23 + ph * 2);
      p += 'L' + x.toFixed(1) + ' ' + y;
    }
    return p + 'L0 ' + H + 'Z';
  }
  // onda horizontal: preenche abaixo da curva y(x)
  function waveH(base, amp, ph, W, H) {
    var p = 'M0 ' + H + 'L0 ' + base;
    for (var x = 0; x <= W; x += 6) {
      var y = base + amp * Math.sin(x / 48 + ph) + amp * 0.4 * Math.sin(x / 17 + ph * 2);
      p += 'L' + x + ' ' + y.toFixed(1);
    }
    return p + 'L' + W + ' ' + H + 'Z';
  }

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function gradient(id, attrs, stops) {
    var g = el(id.indexOf('glow') >= 0 ? 'radialGradient' : 'linearGradient', Object.assign({ id: id, gradientUnits: 'userSpaceOnUse' }, attrs));
    stops.forEach(function (s) { g.appendChild(el('stop', s)); });
    return g;
  }

  function drawArt() {
    var w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    var desktop = desktopMq.matches;

    var cx, cy, r, k, waves, echoRadii, streakDefs, ringW, echoW;
    if (desktop) {
      r = Math.max(70, Math.min(w * 0.2, h * 0.16));
      k = r / 112;
      cx = w * 0.6; cy = h * 0.4;
      ringW = 44 * k; echoW = 1.5;
      echoRadii = [190, 262, 334, 406, 478, 560].map(function (v) { return v * k; });
      streakDefs = [[262, 110, 190, 3], [406, -150, -95, 4], [560, 70, 140, 2.5]].map(function (s) { return [s[0] * k, s[1], s[2], s[3]]; });
      // faixas verticais na borda esquerda, encostadas no painel do formulário
      waves = [
        { fill: '#FABD07', d: waveV(64, 12, 0.4, h) },
        { fill: '#F0ECE1', d: waveV(40, 12, 1.3, h) },
        { fill: '#FFFFFF', d: waveV(16, 12, 2.2, h) }
      ];
    } else {
      r = Math.max(34, Math.min(w * 0.145, h * 0.2));
      k = r / 56;
      cx = w * 0.72; cy = h * 0.4;
      ringW = 22 * k; echoW = 1.5;
      echoRadii = [100, 150, 200, 250].map(function (v) { return v * k; });
      streakDefs = [[150 * k, 100, 175, 3]];
      // faixas horizontais na base, encostadas no formulário
      waves = [
        { fill: '#FABD07', d: waveH(h - 40, 8, 0.6, w, h) },
        { fill: '#F0ECE1', d: waveH(h - 26, 7, 1.4, w, h) },
        { fill: '#FFFFFF', d: waveH(h - 12, 6, 2.3, w, h) }
      ];
    }

    var defs = el('defs', {});
    defs.appendChild(gradient('glow', { cx: cx, cy: cy, r: Math.max(w, h) * 0.55 }, [
      { offset: 0, 'stop-color': '#3D3A36' }, { offset: 1, 'stop-color': '#252422' }
    ]));
    var streaks = streakDefs.map(function (s, i) {
      var a = arc(cx, cy, s[0], s[1], s[2]);
      defs.appendChild(gradient('st' + i, { x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }, [
        { offset: 0, 'stop-color': '#FABD07', 'stop-opacity': 0 }, { offset: 1, 'stop-color': '#FABD07' }
      ]));
      return { a: a, w: s[3], i: i };
    });

    var frag = document.createDocumentFragment();
    frag.appendChild(defs);
    frag.appendChild(el('rect', { width: w, height: h, fill: 'url(#glow)' }));

    echoRadii.forEach(function (rr, i) {
      frag.appendChild(el('path', { d: ring(cx, cy, rr), fill: 'none', stroke: '#FFFFFF', 'stroke-opacity': Math.max(0.03, 0.16 - i * 0.022).toFixed(3), 'stroke-width': echoW, 'stroke-linecap': 'round' }));
    });
    streaks.forEach(function (s) {
      frag.appendChild(el('path', { d: s.a.d, fill: 'none', stroke: 'url(#st' + s.i + ')', 'stroke-width': s.w, 'stroke-linecap': 'round' }));
      frag.appendChild(el('circle', { cx: s.a.x2, cy: s.a.y2, r: s.w * 1.8, fill: '#FABD07' }));
    });
    frag.appendChild(el('path', { d: ring(cx, cy, r), fill: 'none', stroke: '#FABD07', 'stroke-width': ringW, 'stroke-linecap': 'round' }));
    [[-37, 0.32, 0.9], [-27, 0.14, 0.78]].forEach(function (g) {
      var d = dotOf(cx, cy, r, g[0]);
      frag.appendChild(el('circle', { cx: d.x, cy: d.y, r: +(d.r * g[2]).toFixed(1), fill: '#FFFFFF', 'fill-opacity': g[1] }));
    });
    var dot = dotOf(cx, cy, r);
    frag.appendChild(el('circle', { cx: dot.x, cy: dot.y, r: dot.r, fill: '#FFFFFF' }));
    waves.forEach(function (wv) { frag.appendChild(el('path', { d: wv.d, fill: wv.fill })); });

    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.replaceChildren(frag);
  }

  var raf = 0;
  function scheduleDraw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawArt); }
  if ('ResizeObserver' in window) new ResizeObserver(scheduleDraw).observe(svg);
  else window.addEventListener('resize', scheduleDraw);
  drawArt();

  // ---------- formulário ----------

  var form = document.getElementById('login');
  var email = document.getElementById('email');
  var pw = document.getElementById('pw');
  var pwToggle = document.getElementById('pw-toggle');
  var cta = document.getElementById('cta-label');
  var segBtns = form.querySelectorAll('.seg__btn');

  var copy = {
    cliente: { placeholder: 'voce@email.com', cta: 'Entrar' },
    equipe: { placeholder: 'nome@trato.com.br', cta: 'Entrar no painel' }
  };

  segBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var profile = btn.dataset.profile;
      segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      email.placeholder = copy[profile].placeholder;
      cta.textContent = copy[profile].cta;
    });
  });

  pwToggle.addEventListener('click', function () {
    var show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Ocultar' : 'Mostrar';
  });

  // protótipo: ainda não há autenticação
  form.addEventListener('submit', function (e) { e.preventDefault(); });
})();

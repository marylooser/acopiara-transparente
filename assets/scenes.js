// Cenas ilustradas em estilo editorial plano (formas cheias, paleta da bandeira de Acopiara).
// Cada grupo <g class="b"> entra em sequência quando a cena aparece na tela.
(function () {
  const P = { v: '#0E5A3A', v2: '#3F8A5F', v3: '#CFE3D6', a: '#123B6E', a2: '#5F84B3', a3: '#DCE6F1', o: '#C9A227', o2: '#E8C766', ar: '#EFE6CF', te: '#D9C59B', te2: '#C4A877', b: '#FFFFFF', t: '#17211C', pele: '#B07D56', pele2: '#7A5236', cz: '#8B948F' };
  let k = 0;
  const G = (s) => `<g class="b" style="--i:${k++}">${s}</g>`;
  const rect = (x, y, w, h, f, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" fill="${f}"/>`;
  const circ = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
  const path = (d, f, s, w) => `<path d="${d}" fill="${f || 'none'}"${s ? ` stroke="${s}" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round"` : ''}/>`;
  const W = 800, H = 360, Y = 300;
  function ceu() { return rect(0, 0, W, H, P.a3) + path(`M0 ${Y - 40} Q120 ${Y - 95} 240 ${Y - 55} T480 ${Y - 70} T800 ${Y - 50} V${H} H0Z`, '#C7D6E6') + path(`M0 ${Y - 20} Q160 ${Y - 60} 330 ${Y - 30} T800 ${Y - 30} V${H} H0Z`, '#B4C7DB'); }
  function chao(c) { return rect(0, Y, W, H - Y, c || P.te) + rect(0, Y, W, 6, P.te2); }
  function sol(x, y) { return G(circ(x, y, 34, P.o2) + circ(x, y, 24, P.o)); }
  function nuvem(x, y, s) { s = s || 1; return G(`<g transform="translate(${x} ${y}) scale(${s})">${circ(0, 0, 16, P.b)}${circ(20, -8, 20, P.b)}${circ(42, 0, 15, P.b)}${rect(-14, 0, 70, 14, P.b, 7)}</g>`); }
  function cacto(x, h, c) { c = c || P.v; return G(rect(x, Y - h, 16, h, c, 8) + rect(x - 18, Y - h * .62, 12, h * .3, c, 6) + rect(x - 18, Y - h * .4, 22, 10, c, 5) + rect(x + 22, Y - h * .78, 12, h * .34, c, 6) + rect(x + 12, Y - h * .5, 22, 10, c, 5)); }
  function pessoa(x, cor, opt) {
    opt = opt || {}; const s = opt.s || 1, y = Y - 2, pe = opt.pele || (x % 2 ? P.pele : P.pele2);
    let g = `<g transform="translate(${x} ${y}) scale(${s})">` + rect(-7, -30, 6, 30, P.t, 3) + rect(1, -30, 6, 30, P.t, 3) + rect(-11, -62, 22, 36, cor, 9) + circ(0, -72, 9, pe);
    if (opt.placa) g += rect(-3, -110, 3, 46, P.t) + rect(-22, -122, 42, 26, opt.placa, 3) + rect(-16, -114, 28, 3, P.t) + rect(-16, -107, 20, 3, P.t);
    if (opt.bolsa) g += rect(-16, -56, 10, 20, opt.bolsa, 3);
    if (opt.jaleco) g += rect(-11, -62, 22, 36, P.b, 9) + rect(-2, -62, 4, 36, P.a3);
    return G(g + '</g>');
  }
  function casa(x, w, h, cor, telha, porta) {
    return G(rect(x, Y - h, w, h, cor) + path(`M${x - 8} ${Y - h} L${x + w / 2} ${Y - h - h * .55} L${x + w + 8} ${Y - h}Z`, telha || P.o) + rect(x + w / 2 - 9, Y - 34, 18, 34, porta || P.a) + rect(x + 10, Y - h + 14, 16, 14, P.b) + (w > 70 ? rect(x + w - 26, Y - h + 14, 16, 14, P.b) : ''));
  }
  function predio(x, w, h, cor, jan, n) {
    let s = rect(x, Y - h, w, h, cor); const cols = n || Math.floor((w - 16) / 26);
    for (let r = 0; r < Math.floor((h - 50) / 34); r++) for (let c = 0; c < cols; c++) s += rect(x + 14 + c * 26, Y - h + 16 + r * 34, 14, 18, jan || P.a3);
    return G(s);
  }
  const svg = (inner, label) => { k = 0; return `<svg class="scene cena" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><defs><clipPath id="cc"><rect width="${W}" height="${H}" rx="8"/></clipPath></defs><g clip-path="url(#cc)">${inner}</g></svg>`; };
  const C = {};
  C['Saúde'] = () => svg(ceu() + sol(690, 70) + nuvem(120, 70, 1.1) + chao() +
    predio(120, 300, 170, P.b, P.a3, 10) + G(rect(120, Y - 186, 300, 20, P.v) + rect(250, Y - 230, 44, 44, P.b) + rect(266, Y - 224, 12, 32, '#C0392B') + rect(256, Y - 214, 32, 12, '#C0392B') + rect(240, Y - 60, 64, 60, P.a)) +
    G(rect(470, Y - 76, 170, 60, P.b, 8) + path(`M640 ${Y - 66} h44 l30 32 v18 h-74z`, P.b) + rect(650, Y - 60, 34, 22, P.a3, 3) + rect(470, Y - 46, 244, 10, '#C0392B') + circ(510, Y - 14, 16, P.t) + circ(670, Y - 14, 16, P.t) + circ(510, Y - 14, 7, P.cz) + circ(670, Y - 14, 7, P.cz) + rect(540, Y - 70, 30, 8, '#C0392B') + rect(551, Y - 81, 8, 30, '#C0392B') + rect(560, Y - 90, 30, 10, P.o, 3)) +
    [0, 1, 2, 3, 4].map(i => pessoa(150 + i * 26, [P.v2, P.o, P.a2, P.v, P.te2][i], { s: .9 })).join('') + cacto(760, 110), 'Hospital com ambulância e fila de pacientes');
  C['Educação'] = () => svg(ceu() + sol(110, 70) + nuvem(560, 60) + chao() +
    G(rect(80, Y - 150, 330, 150, P.o2) + path(`M60 ${Y - 150} L245 ${Y - 220} L430 ${Y - 150}Z`, P.v) + rect(220, Y - 70, 50, 70, P.a) + [0, 1, 2, 3].map(i => rect(100 + i * 78 + (i > 1 ? 26 : 0), Y - 120, 34, 30, P.b)).join('') + circ(245, Y - 178, 16, P.b) + path(`M245 ${Y - 188} v10 h7`, null, P.t, 2.5)) +
    G(rect(460, Y - 110, 270, 86, P.o, 12) + rect(700, Y - 110, 30, 86, P.o, 6) + [0, 1, 2, 3, 4, 5].map(i => rect(474 + i * 36, Y - 98, 26, 26, P.b, 3)).join('') + rect(460, Y - 60, 270, 8, P.t) + circ(510, Y - 20, 18, P.t) + circ(680, Y - 20, 18, P.t) + circ(510, Y - 20, 8, P.cz) + circ(680, Y - 20, 8, P.cz)) +
    [0, 1, 2].map(i => pessoa(300 + i * 32, [P.a2, P.v2, P.o][i], { s: .72, bolsa: P.v })).join('') + cacto(30, 90), 'Escola e ônibus escolar');
  C['Habitação'] = () => svg(ceu() + sol(700, 72) + chao() +
    [0, 1, 2, 3].map(i => casa(40 + i * 120, 90, 80, [P.b, P.a3, P.v3, P.b][i], [P.o, P.v, P.o, P.a][i])).join('') +
    G(rect(540, Y - 130, 6, 130, P.te2) + rect(640, Y - 130, 6, 130, P.te2) + rect(540, Y - 130, 106, 6, P.te2) + rect(540, Y - 70, 106, 6, P.te2) + path(`M546 ${Y - 124} L640 ${Y - 70} M640 ${Y - 124} L546 ${Y - 70}`, null, P.te2, 4) + rect(552, Y - 60, 86, 60, '#D9D2C3') + path(`M548 ${Y - 60} l46 -40 l46 40`, null, P.cz, 4)) +
    G(path(`M680 ${Y} V${Y - 40} M720 ${Y} V${Y - 40} M760 ${Y} V${Y - 40} M670 ${Y - 30} H780 M670 ${Y - 14} H780`, null, P.t, 3)) +
    [0, 1].map(i => pessoa(700 + i * 40, [P.v2, P.o][i], { s: .85 })).join(''), 'Casas populares e obra cercada');
  C['Cultura e eventos'] = () => svg(rect(0, 0, W, H, '#1B2A44') + [...Array(18)].map((_, i) => circ((i * 97) % W, 20 + (i * 53) % 120, 1.8, P.b)).join('') + rect(0, Y, W, H - Y, '#24314A') +
    G(path(`M160 ${Y - 40} L240 40 M640 ${Y - 40} L560 40`, null, P.o2, 1) + path(`M200 40 L260 ${Y - 80} L320 ${Y - 80}Z`, 'rgba(232,199,102,.25)') + path(`M600 40 L540 ${Y - 80} L480 ${Y - 80}Z`, 'rgba(232,199,102,.25)')) +
    G(rect(150, Y - 90, 500, 50, P.a) + rect(140, 40, 520, 18, P.v) + rect(150, 58, 10, 140, P.t) + rect(640, 58, 10, 140, P.t) + rect(170, Y - 150, 40, 60, P.t, 4) + circ(190, Y - 130, 10, P.cz) + circ(190, Y - 108, 13, P.cz) + rect(590, Y - 150, 40, 60, P.t, 4) + circ(610, Y - 130, 10, P.cz) + circ(610, Y - 108, 13, P.cz)) +
    G(path(`M140 58 Q240 90 340 58 T540 58 T660 58`, null, P.o, 2) + [...Array(12)].map((_, i) => path(`M${160 + i * 42} ${66 + (i % 2) * 6} l10 16 l10 -16z`, [P.o, P.v2, '#C0392B', P.b][i % 4])).join('')) +
    G(rect(380, Y - 140, 10, 50, P.o) + circ(385, Y - 148, 12, P.pele)) +
    G([...Array(16)].map((_, i) => circ(60 + i * 46, Y + 6 + (i % 3) * 6, 14, '#0F1A2C') + rect(46 + i * 46, Y + 14 + (i % 3) * 6, 28, 40, '#0F1A2C', 10)).join('')), 'Palco de show com multidão');
  C['Turismo'] = () => svg(ceu() + sol(120, 80) + nuvem(560, 70, .9) +
    G(path(`M0 ${Y - 70} L120 ${Y - 150} L230 ${Y - 90} L330 ${Y - 170} L470 ${Y - 80} L800 ${Y - 120} V${Y} H0Z`, P.v2)) +
    G(rect(0, Y - 40, W, 80, P.a2) + path(`M40 ${Y - 20} q30 -8 60 0 M200 ${Y - 10} q30 -8 60 0 M420 ${Y - 24} q30 -8 60 0`, null, P.b, 3)) +
    G(path(`M520 ${Y - 44} L800 ${Y - 60} V${Y + 20} L520 ${Y + 20}Z`, '#B9B2A2') + rect(520, Y - 48, 280, 8, P.cz)) + chao().replace(`y="${Y}"`, `y="${Y + 20}"`) +
    G(path(`M60 ${Y + 40} q40 -40 90 -20 q40 -30 80 10z`, '#A89A7E') + path(`M640 ${Y + 40} q30 -30 70 -12 q30 -20 60 12z`, '#A89A7E')) +
    G(path(`M400 150 c0 -46 -56 -46 -56 0 c0 30 28 56 28 56 s28 -26 28 -56z`, P.o) + circ(372, 146, 11, P.b)) + cacto(300, 80) + cacto(720, 100), 'Açude, serra e marcador de mapa vazio');
  C['Obras e infraestrutura'] = () => svg(ceu() + sol(700, 70) + chao() +
    G(rect(120, 40, 14, Y - 40, P.o) + rect(120, 40, 360, 12, P.o) + path(`M134 52 L200 40 M134 52 l40 52`, null, P.o, 3) + rect(470, 52, 2, 90, P.t) + rect(450, 142, 42, 30, P.cz)) +
    G(path(`M300 ${Y} q60 -70 120 0z`, P.te2) + path(`M380 ${Y} q50 -50 100 0z`, '#C9B184')) +
    G(rect(520, Y - 80, 150, 64, P.v, 6) + rect(670, Y - 64, 50, 48, P.v2, 6) + rect(680, Y - 58, 26, 20, P.a3) + circ(560, Y - 12, 15, P.t) + circ(690, Y - 12, 15, P.t) + rect(530, Y - 74, 130, 10, P.b)) +
    G([0, 1, 2].map(i => path(`M${220 + i * 34} ${Y} l13 -40 l13 40z`, '#E0702E') + rect(222 + i * 34, Y - 20, 22, 5, P.b)).join('')) +
    G(rect(40, Y - 120, 70, 50, P.b) + rect(72, Y - 70, 6, 70, P.t) + rect(48, Y - 110, 54, 4, P.cz) + rect(48, Y - 100, 40, 4, P.cz)), 'Guindaste, areia, caminhão e placa de obra');
  C['Administração'] = () => svg(rect(0, 0, W, H, P.a3) + rect(0, 250, W, 110, '#B98E5B') + rect(0, 250, W, 10, '#9C7546') +
    G([0, 1, 2, 3, 4, 5, 6].map(i => rect(110 + (i % 2) * 6, 230 - i * 18, 150, 18, [P.b, '#F3EDDC'][i % 2], 2) + rect(120, 236 - i * 18, 60, 3, P.cz)).join('')) +
    G([0, 1, 2, 3, 4].map(i => rect(300 + (i % 2) * 4, 230 - i * 20, 130, 20, [P.o2, P.b][i % 2], 2)).join('')) +
    G(rect(470, 200, 120, 40, P.v, 4) + rect(510, 150, 40, 54, P.v2, 4) + rect(500, 140, 60, 14, P.t, 4) + rect(460, 238, 140, 10, '#C0392B')) +
    G(circ(650, 150, 52, 'rgba(255,255,255,.6)') + `<circle cx="650" cy="150" r="52" fill="none" stroke="${P.t}" stroke-width="10"/>` + rect(686, 186, 70, 18, P.t, 8).replace('<rect', `<rect transform="rotate(45 690 190)"`)) +
    G([0, 1, 2, 3].map(i => circ(250 + i * 22, 246 + (i % 2) * 6, 11, P.o) + circ(250 + i * 22, 246 + (i % 2) * 6, 6, P.o2)).join('')), 'Pilhas de processos, carimbo e lupa');
  C['Família e nomeações'] = () => svg(ceu() + sol(700, 70) + chao() +
    G(rect(80, Y - 140, 280, 140, P.b) + path(`M60 ${Y - 140} L220 ${Y - 200} L380 ${Y - 140}Z`, P.a) + [0, 1, 2, 3, 4].map(i => rect(100 + i * 54, Y - 120, 18, 120, P.a3)).join('') + rect(196, Y - 196 + 20, 48, 14, P.o)) +
    G(rect(540, Y - 150, 22, 150, '#7A5236') + path(`M551 ${Y - 120} Q480 ${Y - 150} 450 ${Y - 210} M551 ${Y - 130} Q620 ${Y - 160} 660 ${Y - 220} M551 ${Y - 150} Q551 ${Y - 200} 551 ${Y - 250}`, null, '#7A5236', 12)) +
    G(circ(450, Y - 220, 44, P.v2) + circ(660, Y - 230, 48, P.v2) + circ(551, Y - 262, 52, P.v)) +
    G([[450, Y - 190], [660, Y - 196], [551, Y - 226], [500, Y - 150], [610, Y - 160]].map(([x, y], i) => rect(x - 14, y, 28, 36, P.b, 4) + rect(x - 14, y, 28, 9, [P.o, P.a, '#C0392B', P.o, P.a][i], 4) + circ(x, y + 22, 6, P.cz)).join('')), 'Prefeitura e árvore genealógica com crachás');
  C['Direitos do cidadão'] = () => svg(ceu() + sol(110, 70) + chao('#D3C7AA') +
    G(rect(470, Y - 150, 280, 150, P.b) + path(`M450 ${Y - 150} L610 ${Y - 200} L770 ${Y - 150}Z`, P.v) + [0, 1, 2, 3].map(i => rect(490 + i * 66, Y - 120, 22, 120, P.a3)).join('')) +
    [0, 1, 2, 3, 4].map(i => pessoa(110 + i * 64, [P.v2, P.o, P.a2, P.v, '#C0392B'][i], { placa: [P.o2, P.b, P.o2, P.b, P.o2][i] })).join('') +
    G(`<g transform="translate(430 ${Y - 80}) rotate(-20)">` + path('M0 0 l40 -16 v42 l-40 -16z', P.t) + rect(-12, -6, 14, 14, P.t, 3) + path('M48 -14 q10 12 0 26 M58 -22 q16 20 0 42', null, P.o, 3) + '</g>'), 'Moradores protestando com cartazes');
  C['Câmara Municipal'] = () => svg(ceu() + sol(690, 70) + chao() +
    G(rect(170, Y - 30, 460, 30, '#E3DCCB') + rect(190, Y - 40, 420, 12, '#D3C9B2') + [0, 1, 2, 3, 4, 5].map(i => rect(210 + i * 70, Y - 170, 26, 132, P.b)).join('') + rect(180, Y - 186, 440, 18, P.a) + path(`M180 ${Y - 186} L400 ${Y - 250} L620 ${Y - 186}Z`, P.v) + circ(400, Y - 214, 14, P.o)), 'Prédio da Câmara Municipal');
  C['Dinheiro'] = () => svg(ceu() + chao() +
    G([0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="150" cy="${Y - 12 - i * 16}" rx="56" ry="14" fill="${P.o}"/><ellipse cx="150" cy="${Y - 16 - i * 16}" rx="56" ry="14" fill="${P.o2}"/>`).join('')) +
    G(path(`M230 ${Y - 120} C330 ${Y - 220} 450 ${Y - 220} 540 ${Y - 130}`, null, P.a2, 6) + path(`M528 ${Y - 150} l16 22 l-26 4z`, P.a2)) +
    G(rect(540, Y - 160, 170, 160, P.b, 6) + rect(560, Y - 140, 130, 20, P.a3) + rect(560, Y - 110, 90, 10, P.cz) + rect(560, Y - 92, 110, 10, P.cz) + circ(625, Y - 46, 26, '#C0392B') + rect(611, Y - 49, 28, 6, P.b)), 'Moedas e caminho do dinheiro até a conta');
  C['Jornadas'] = () => svg(ceu() + chao() +
    G(path(`M0 ${Y + 30} C200 ${Y - 30} 300 ${Y + 40} 420 ${Y + 10} S700 ${Y - 20} 800 ${Y + 20}`, null, P.cz, 14) + path(`M0 ${Y + 30} C200 ${Y - 30} 300 ${Y + 40} 420 ${Y + 10} S700 ${Y - 20} 800 ${Y + 20}`, null, P.b, 2)) +
    [60, 330, 620].map((x, i) => G(rect(x, Y - 110, 120, 110, P.b) + rect(x, Y - 124, 120, 16, [P.v, P.a, P.v2][i]) + rect(x + 50, Y - 104, 20, 20, '#C0392B') + rect(x + 56, Y - 110, 8, 32, P.b) + rect(x + 46, Y - 98, 28, 8, P.b) + rect(x + 46, Y - 44, 28, 44, P.a3))).join('') +
    G(circ(400, 90, 64, P.b) + `<circle cx="400" cy="90" r="64" fill="none" stroke="${P.t}" stroke-width="8"/>` + path('M400 90 L400 44 M400 90 L436 112', null, '#C0392B', 6) + circ(400, 90, 6, P.t)) +
    pessoa(260, P.b, { jaleco: 1 }) + pessoa(560, P.b, { jaleco: 1 }), 'Relógio passando da meia-noite e médico entre três hospitais');
  C['Panorama'] = () => svg(ceu() + sol(680, 70) + nuvem(80, 60) + nuvem(420, 50, .8) +
    G(path(`M0 ${Y - 60} L140 ${Y - 140} L260 ${Y - 80} L380 ${Y - 160} L520 ${Y - 90} L800 ${Y - 130} V${Y} H0Z`, P.v2)) + chao() +
    G(rect(320, Y - 170, 70, 170, P.b) + path(`M310 ${Y - 170} L355 ${Y - 230} L400 ${Y - 170}Z`, P.a) + rect(345, Y - 260, 20, 40, P.b) + path(`M341 ${Y - 260} l14 -18 l14 18z`, P.a) + rect(343, Y - 60, 24, 60, P.a) + circ(355, Y - 130, 12, P.o)) +
    casa(60, 90, 70, P.o2, P.v) + casa(170, 80, 60, P.b, P.a) + casa(420, 90, 66, P.v3, P.o) +
    G(rect(540, Y - 80, 120, 80, P.a3) + path(`M530 ${Y - 80} L600 ${Y - 110} L670 ${Y - 80}Z`, P.o) + rect(560, Y - 60, 20, 30, P.b) + rect(600, Y - 60, 20, 30, P.b)) +
    G(rect(540, Y - 26, 260, 4, P.t) + rect(670, Y - 70, 90, 44, P.v, 6) + rect(740, Y - 92, 26, 22, P.t) + circ(690, Y - 22, 9, P.t) + circ(740, Y - 22, 9, P.t)) + cacto(280, 80) + cacto(770, 70), 'Panorama de Acopiara com igreja, casario, estação e trem');
  const IMG = { 'Saúde': 'saude', 'Educação': 'educacao', 'Habitação': 'habitacao', 'Cultura e eventos': 'cultura', 'Turismo': 'turismo', 'Obras e infraestrutura': 'obras', 'Administração': 'administracao', 'Família e nomeações': 'familia', 'Direitos do cidadão': 'direitos', 'Panorama': 'panorama', 'Jornadas': 'jornadas', 'Dinheiro': 'dinheiro', 'Câmara Municipal': 'familia' };
  const collection = () => window.EDITORIAL_IMAGES || {};
  const activeSource = image => document.documentElement.dataset.theme === 'dark' && image.nightSrc ? image.nightSrc : image.src;
  function art(image, eager = false, className = 'cena cena-img editorial-image') {
    return `<span class="${className}"><img src="${attr(activeSource(image))}" data-light="${attr(image.src)}"${image.nightSrc ? ` data-dark="${attr(image.nightSrc)}"` : ''} alt="${attr(image.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="${image.width}" height="${image.height}"${eager ? ' fetchpriority="high"' : ''}></span>`;
  }
  const get = a => {
    const key = IMG[a];
    if (!key) return (C[a] || C['Administração'])();
    return art((collection().categories || {})[key] || {src: `img/cenas/${key}.jpg`, width:1488, height:744, alt:''});
  };
  const record = item => {
    const collection = window.EDITORIAL_IMAGES || {};
    return (collection[Object.prototype.hasOwnProperty.call(item, 'fato') ? 'noticias' : 'casos'] || {})[item.id];
  };
  const attr = value => String(value || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function itemImage(item, eager = false) {
    const image = record(item);
    if (!image) return get(item.cena || item.area);
    return art(image, eager);
  }
  function source(item) {
    if (item.shareType === 'page' && item.id === 'portal') return activeSource(collection().cover);
    const image = record(item), key = IMG[item.cena || item.area];
    const category = (collection().categories || {})[key];
    return image ? activeSource(image) : category ? activeSource(category) : key ? 'img/cenas/' + key + '.jpg' : null;
  }
  const cover = () => art(collection().cover || {src:'img/editorial/capa-acopiara.webp',width:1774,height:887,alt:'Arco da Santa na entrada de Acopiara'}, true, 'capa-art');
  const footer = () => {
    const images = collection();
    const image = images.footerAlternate && /\/(?:direitos|editorial|sobre)(?:[?/#]|$)/.test(location.hash) ? images.footerAlternate : images.footer;
    return image ? art(image, false, 'footer-art') : DOODLES.paisagem(1200, 120);
  };
  window.SCENES = { IMG, get, item: itemImage, source, cover, footer };

})();

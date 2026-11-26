// Ilustrações originais em traço, inspiradas na história de Acopiara:
// o lajedo que deu o primeiro nome ("Lages"), a ferrovia e a estação,
// o açude Trussu, o mandacaru e o sol do sertão.
window.DOODLES = (function () {
  const V = '#0E5A3A', A = '#123B6E', O = '#C9A227';
  const st = (c, w) => `fill="none" stroke="${c}" stroke-width="${w || 2.4}" stroke-linecap="round" stroke-linejoin="round"`;
  const sol = (x, y, r) => `<g ${st(O)}><circle cx="${x}" cy="${y}" r="${r}"/>${[...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return `<line x1="${x + Math.cos(a) * (r + 6)}" y1="${y + Math.sin(a) * (r + 6)}" x2="${x + Math.cos(a) * (r + 16)}" y2="${y + Math.sin(a) * (r + 16)}"/>`; }).join('')}</g>`;
  const mandacaru = (x, y, h) => `<g ${st(V)}><path d="M${x} ${y} v-${h} q0 -14 9 -14 q9 0 9 14 v${h}"/><path d="M${x} ${y - h * .45} h-16 q-9 0 -9 -9 v-${h * .3} q0 -9 7 -9 q7 0 7 9 v${h * .18} h11"/><path d="M${x + 18} ${y - h * .6} h14 q9 0 9 -9 v-${h * .22} q0 -9 -7 -9 q-7 0 -7 9 v${h * .12} h-9"/><line x1="${x + 9}" y1="${y - h + 4}" x2="${x + 9}" y2="${y - 4}" stroke-dasharray="2 7"/></g>`;
  const lajedo = (x, y) => `<g ${st(A)}><path d="M${x} ${y} q20 -34 62 -30 q34 2 46 30"/><path d="M${x + 96} ${y} q16 -22 44 -18 q22 4 28 18"/><path d="M${x + 18} ${y - 12} q14 -6 26 0 M${x + 60} ${y - 20} q12 -4 20 3"/></g>`;
  const trem = (x, y) => `<g ${st(A)}><rect x="${x}" y="${y - 34}" width="58" height="26" rx="3"/><rect x="${x + 58}" y="${y - 46}" width="28" height="38" rx="3"/><rect x="${x + 64}" y="${y - 40}" width="14" height="12"/><path d="M${x + 12} ${y - 34} v-14 h12 v14"/><circle cx="${x + 14}" cy="${y - 4}" r="7"/><circle cx="${x + 40}" cy="${y - 4}" r="7"/><circle cx="${x + 72}" cy="${y - 4}" r="7"/><path d="M${x + 18} ${y - 54} q6 -10 16 -8 q8 -12 20 -6"/><line x1="${x - 30}" y1="${y + 6}" x2="${x + 130}" y2="${y + 6}"/>${[...Array(8)].map((_, i) => `<line x1="${x - 26 + i * 20}" y1="${y + 3}" x2="${x - 22 + i * 20}" y2="${y + 10}"/>`).join('')}</g>`;
  const estacao = (x, y) => `<g ${st(V)}><path d="M${x} ${y} v-40 l40 -22 l40 22 v40 z"/><rect x="${x + 30}" y="${y - 26}" width="20" height="26"/><rect x="${x + 8}" y="${y - 30}" width="12" height="12"/><rect x="${x + 60}" y="${y - 30}" width="12" height="12"/><circle cx="${x + 40}" cy="${y - 44}" r="6"/></g>`;
  const acude = (x, y, w) => `<g ${st(A)}><path d="M${x} ${y} h${w}"/>${[0, 1, 2].map(i => `<path d="M${x + 10 + i * 14} ${y + 10 + i * 9} q${w / 8} -7 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0"/>`).join('')}<path d="M${x + w} ${y} l18 30 h-36" stroke="${V}"/></g>`;
  const casa = (x, y) => `<g ${st(V)}><path d="M${x} ${y} v-26 l22 -16 l22 16 v26 z"/><rect x="${x + 16}" y="${y - 16}" width="12" height="16"/></g>`;

  // Cenas ilustradas por área (traço que se desenha ao aparecer)
  const g = (c, w) => `fill="none" stroke="${c}" stroke-width="${w || 2.6}" stroke-linecap="round" stroke-linejoin="round"`;
  const chao = `<path d="M10 182 H590" ${g('#17211C', 1.4)} opacity=".4"/>`;
  const CENAS = {
    'Saúde': `<g ${g(V)}><rect x="60" y="70" width="170" height="112"/><path d="M60 70 L145 34 L230 70"/><rect x="128" y="132" width="34" height="50"/><path d="M145 84 v30 M130 99 h30" stroke="${O}" stroke-width="5"/>${[0,1,2,3].map(i=>`<rect x="${76+i*38}" y="${i%2?132:120}" width="20" height="16"/>`).join('')}</g>
      <g ${g(A)}><rect x="300" y="118" width="150" height="50" rx="6"/><path d="M450 130 h40 l22 22 v16 h-62"/><circle cx="335" cy="172" r="12"/><circle cx="470" cy="172" r="12"/><path d="M360 133 v22 M349 144 h22" stroke="${O}" stroke-width="4"/><path d="M468 136 h18 l12 14 h-30z"/></g>
      <g ${g(V, 2)}><path d="M530 70 q0 40 22 40 q22 0 22 -40 M552 110 v24 q0 22 -24 22"/><circle cx="526" cy="160" r="7"/></g>${chao}`,
    'Educação': `<g ${g(A)}><path d="M60 182 V92 h150 v90"/><path d="M50 92 L135 50 L220 92"/><rect x="118" y="140" width="34" height="42"/><circle cx="135" cy="74" r="10"/><path d="M135 66 v8 h6"/>${[0,1].map(i=>`<rect x="${78+i*92}" y="110" width="26" height="20"/>`).join('')}</g>
      <g ${g(V)}><rect x="300" y="112" width="210" height="56" rx="8"/><path d="M510 130 h24 v38 h-24"/>${[0,1,2,3,4].map(i=>`<rect x="${312+i*38}" y="120" width="26" height="18"/>`).join('')}<circle cx="340" cy="172" r="12"/><circle cx="480" cy="172" r="12"/><path d="M300 150 h210" stroke="${O}" stroke-width="4"/></g>
      <g ${g(O, 2)}><path d="M240 60 l8 -16 l8 16 M244 52 h8"/><path d="M262 40 v26 M262 40 q12 0 12 7 q0 6 -12 6 q14 0 14 7 q0 6 -14 6"/></g>${chao}`,
    'Habitação': `<g ${g(V)}>${[0,1,2].map(i=>`<path d="M${50+i*110} 182 v-60 l45 -34 l45 34 v60"/><rect x="${80+i*110}" y="146" width="22" height="36"/><rect x="${112+i*110}" y="128" width="16" height="14"/>`).join('')}</g>
      <g ${g(A)}><path d="M400 182 v-74 M520 182 v-74 M400 108 h120 M400 140 h120 M400 108 l120 32 M520 108 l-120 32"/><path d="M412 182 v-40 l48 -36 l48 36 v40" stroke-dasharray="6 7"/></g>
      <g ${g(O, 2.4)}><circle cx="560" cy="60" r="14"/><path d="M571 69 l18 18 M582 80 l6 -6 M588 86 l5 -5"/></g>${chao}`,
    'Cultura e eventos': `<g ${g(A)}><path d="M90 182 v-30 h420 v30"/><path d="M90 152 v-96 h420 v96"/><path d="M90 56 q210 40 420 0"/><rect x="120" y="96" width="34" height="56"/><rect x="446" y="96" width="34" height="56"/><circle cx="137" cy="112" r="8"/><circle cx="137" cy="134" r="11"/><circle cx="463" cy="112" r="8"/><circle cx="463" cy="134" r="11"/></g>
      <g ${g(O)}><path d="M220 56 l-40 96 M380 56 l40 96" opacity=".8"/><path d="M290 120 v-34 l30 -8 v34"/><circle cx="284" cy="122" r="7"/><circle cx="314" cy="114" r="7"/></g>
      <g ${g(V, 2)}>${[0,1,2,3,4,5,6].map(i=>`<circle cx="${180+i*40}" cy="176" r="7"/><path d="M${172+i*40} 182 q8 -8 16 0"/>`).join('')}</g>${chao}`,
    'Turismo': `<g ${g(A)}><path d="M40 150 q60 -20 120 0 t120 0 t120 0 t120 0 t120 0"/><path d="M60 166 q60 -16 120 0 t120 0 t120 0 t120 0"/><path d="M380 120 h150 l20 30 h-190z" stroke="${V}"/></g>
      <g ${g(V)}><path d="M160 112 c0 -40 -50 -40 -50 0 c0 26 25 50 25 50 s25 -24 25 -50z"/><circle cx="135" cy="110" r="10"/></g>
      ${sol(470, 60, 20)}<g ${g(O, 2)}><path d="M250 70 q20 -14 40 0 M276 82 q14 -10 28 0"/></g>`,
    'Obras e infraestrutura': `<g ${g(A)}><path d="M120 182 V40 M120 40 h260 M120 60 h40 M380 40 v70"/><path d="M120 40 l30 30 M150 40 l-30 30 M120 70 l30 30 M150 70 l-30 30 M120 100 l30 30 M150 100 l-30 30" opacity=".7"/><rect x="360" y="110" width="40" height="26"/></g>
      <g ${g(V)}><rect x="200" y="150" width="70" height="32"/><rect x="270" y="150" width="70" height="32"/><rect x="235" y="118" width="70" height="32"/></g>
      <g ${g(O)}>${[0,1,2].map(i=>`<path d="M${450+i*40} 182 l12 -40 l12 40 z M${455+i*40} 166 h14"/>`).join('')}</g>${chao}`,
    'Administração': `<g ${g(A)}>${[0,1,2,3].map(i=>`<rect x="${80+i*8}" y="${70-i*10}" width="140" height="${112+i*10}"/>`).join('')}${[0,1,2,3,4].map(i=>`<path d="M${120} ${92+i*16} h80"/>`).join('')}</g>
      <g ${g(V)}><path d="M300 150 h90 v-14 h-90z M330 136 v-36 h30 v36 M325 100 h40"/><rect x="290" y="160" width="110" height="14" stroke="${O}"/></g>
      <g ${g(O)}><circle cx="480" cy="100" r="34"/><path d="M505 125 l40 40"/><path d="M466 100 h28" stroke="${V}"/></g>${chao}`,
    'Família e nomeações': `<g ${g(A)}><path d="M60 182 v-90 h180 v90 M50 92 h200 l-100 -40 z"/>${[0,1,2,3].map(i=>`<path d="M${82+i*42} 182 v-76"/>`).join('')}</g>
      <g ${g(V)}><path d="M420 182 v-70 M420 140 q-40 -10 -60 -40 M420 128 q40 -8 64 -42 M420 112 q-10 -30 0 -60"/>${[[360,96],[484,82],[420,48],[338,130],[506,120]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13"/>`).join('')}</g>
      <g ${g(O, 2)}><path d="M250 120 q60 -40 90 -20" stroke-dasharray="5 6"/></g>${chao}`,
    'Direitos do cidadão': `<g ${g(A)}><path d="M120 120 l70 -30 v80 l-70 -30z M120 120 v20 h-20 v-30 h20 M140 150 l10 30"/><path d="M205 110 q12 20 0 40 M220 100 q20 30 0 60" stroke="${O}"/></g>
      <g ${g(V)}>${[0,1,2,3].map(i=>`<circle cx="${320+i*60}" cy="96" r="12"/><path d="M${320+i*60} 108 v40 M${306+i*60} 182 l14 -34 l14 34 M${320+i*60} 120 l${i%2?16:-16} -24"/><rect x="${i%2?326+i*60:296+i*60}" y="${54}" width="40" height="26"/>`).join('')}</g>${chao}`,
    'Câmara Municipal': `<g ${g(A)}><path d="M120 182 h360 M140 170 h320 M150 170 v-80 M190 170 v-80 M230 170 v-80 M370 170 v-80 M410 170 v-80 M450 170 v-80 M130 90 h340 L300 40 z"/><circle cx="300" cy="72" r="10"/></g>${chao}`,
    'Dinheiro': `<g ${g(V)}>${[0,1,2,3,4].map(i=>`<ellipse cx="140" cy="${170-i*14}" rx="40" ry="10"/>`).join('')}</g><g ${g(A)}><path d="M220 120 h200" stroke-dasharray="8 8"/><path d="M410 110 l14 10 l-14 10"/><rect x="440" y="80" width="110" height="80" rx="6"/><path d="M455 120 h80" stroke="${O}"/></g><g ${g(O)}><circle cx="300" cy="80" r="20"/><path d="M300 68 v24 M292 74 q8 -6 14 0 q-14 6 0 12 q6 4 -14 6"/></g>${chao}`
  };
  function cena(area, cls) { return `<svg class="scene draw ${cls || ''}" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${CENAS[area] || CENAS['Administração']}</svg>`; }
  function paisagem(w, h) {
    const b = h - 14;
    return `<svg class="draw" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${sol(w * .86, 46, 18)}
      ${lajedo(20, b)}${mandacaru(240, b, 70)}${estacao(330, b)}${trem(470, b)}${casa(660, b)}${casa(712, b)}
      ${acude(790, b - 20, 150)}${mandacaru(1000, b, 56)}${lajedo(1060, b)}
      <line x1="0" y1="${b}" x2="${w}" y2="${b}" stroke="#17211C" stroke-width="1.2" opacity=".35"/>
    </svg>`;
  }
  const icone = {
    'Saúde': '<path d="M12 4v16M4 12h16" stroke-width="3"/>',
    'Educação': '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/>',
    'Habitação': '<path d="M4 20v-9l8-6 8 6v9z"/><rect x="10" y="14" width="4" height="6"/>',
    'Cultura e eventos': '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/>',
    'Turismo': '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/>',
    'Obras e infraestrutura': '<path d="M3 20h18M6 20V10h12v10M9 10V6h6v4"/>',
    'Administração': '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    'Assistência social': '<path d="M12 20s-8-5-8-11a4 4 0 018-1 4 4 0 018 1c0 6-8 11-8 11z"/>',
    'Câmara Municipal': '<path d="M3 20h18M5 20V10M9 20V10M15 20V10M19 20V10M3 10l9-6 9 6z"/>',
    'Família e nomeações': '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-4 2-7 5-7s5 3 5 7M11 20c0-4 2-7 5-7s5 3 5 7"/>',
    'Direitos do cidadão': '<path d="M4 10l9-4v12l-9-4z"/><path d="M16 8q3 4 0 8"/>',
    'Dinheiro': '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'
  };
  function icon(area, size, color) {
    return `<svg width="${size || 22}" height="${size || 22}" viewBox="0 0 24 24" fill="none" stroke="${color || A}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icone[area] || icone['Administração']}</svg>`;
  }
  return { paisagem, cena, icon, sol, mandacaru, lajedo, trem, estacao, acude, casa };
})();

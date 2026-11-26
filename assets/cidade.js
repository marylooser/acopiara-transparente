/* Ilustração da capa: pontos de Acopiara em traço simples (desenho autoral, estilizado). */
window.CIDADE = function () {
  const L = (x, y, t, a) => `<g class="lbl"><line x1="${x}" y1="${y}" x2="${x}" y2="448"/><text x="${x}" y="462" text-anchor="${a || 'middle'}">${t}</text></g>`;
  return `<svg class="cidade" viewBox="0 0 720 480" role="img" aria-labelledby="cid-t cid-d" xmlns="http://www.w3.org/2000/svg">
  <title id="cid-t">Acopiara em traço</title>
  <desc id="cid-d">Desenho do Arco da Santa, da Igreja Matriz de Nossa Senhora do Perpétuo Socorro, da Igreja de São Francisco, da Barragem Dr. Tibúrcio Soares e do Polo de Lazer, sob o sol do sertão.</desc>
  <style>
    .cidade{width:100%;height:auto;color:var(--ink)}
    .cidade .s{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    .cidade .f{fill:var(--surface);stroke:currentColor;stroke-width:2.2;stroke-linejoin:round}
    .cidade .m{fill:var(--mark)}.cidade .ag{fill:var(--azul-2);stroke:var(--azul);stroke-width:2}
    .cidade .vd{fill:var(--verde);opacity:.9}.cidade .ch{fill:var(--ink);opacity:.08}
    .cidade .lbl line{stroke:currentColor;stroke-width:1;opacity:.5}
    .cidade .lbl text{font:600 11.5px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase;fill:currentColor;opacity:.75}
    .cidade .sol{transform-origin:600px 74px;animation:gira 60s linear infinite}
    @keyframes gira{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion:reduce){.cidade .sol{animation:none}}
  </style>
  <!-- céu -->
  <g class="sol"><circle cx="600" cy="74" r="34" class="m"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, x1 = 600 + Math.cos(a) * 44, y1 = 74 + Math.sin(a) * 44, x2 = 600 + Math.cos(a) * 58, y2 = 74 + Math.sin(a) * 58; return `<line class="s" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('')}</g>
  <path class="s" d="M110 70 q14 -12 28 0 q12 -10 24 0" opacity=".5"/><path class="s" d="M420 50 q10 -8 20 0 q9 -7 18 0" opacity=".5"/>
  <!-- serra ao fundo -->
  <path class="ch" d="M0 250 L60 205 L120 232 L190 188 L260 226 L330 196 L400 230 L470 200 L540 236 L610 206 L720 240 L720 300 L0 300Z"/>
  <path class="s" d="M0 250 L60 205 L120 232 L190 188 L260 226 L330 196 L400 230 L470 200 L540 236 L610 206 L720 240" opacity=".45"/>

  <!-- BARRAGEM DR. TIBÚRCIO SOARES (fundo, à direita) -->
  <path class="ag" d="M470 262 C520 252 640 250 712 258 L712 300 L470 300Z"/>
  <path class="s" d="M490 276 q12 -5 24 0 q12 5 24 0" stroke="var(--azul)"/><path class="s" d="M600 284 q12 -5 24 0 q12 5 24 0" stroke="var(--azul)"/>
  <path class="f" d="M462 300 L478 258 L712 258 L712 300"/>
  <path class="s" d="M478 258 L712 258"/>${[500, 540, 580, 620, 660, 700].map(x => `<line class="s" x1="${x}" y1="262" x2="${x - 6}" y2="300" opacity=".55"/>`).join('')}
  <rect class="f" x="560" y="246" width="40" height="14"/><path class="s" d="M566 246 v-8 h28 v8"/>
  <g class="lbl"><text x="600" y="240" text-anchor="middle">Barragem Dr. Tibúrcio Soares</text></g>

  <!-- IGREJA MATRIZ — N. S. DO PERPÉTUO SOCORRO (centro) -->
  <g transform="translate(-44 0)">
    <rect class="f" x="286" y="196" width="116" height="134"/>
    <path class="f" d="M278 200 L344 150 L410 200Z"/>
    <rect class="f" x="324" y="96" width="40" height="104"/>
    <path class="f" d="M318 100 L344 62 L370 100Z"/><line class="s" x1="344" y1="62" x2="344" y2="36"/><line class="s" x1="334" y1="46" x2="354" y2="46"/>
    <circle class="f" cx="344" cy="128" r="11"/><path class="s" d="M344 128 v-7 M344 128 h5"/>
    <path class="s" d="M336 174 q8 -12 16 0 v14 h-16z"/>
    <path class="f" d="M326 330 v-50 q18 -26 36 0 v50"/><line class="s" x1="344" y1="292" x2="344" y2="330"/>
    ${[300, 384].map(x => `<path class="f" d="M${x - 9} 262 v-22 q9 -12 18 0 v22z"/>`).join('')}
    <path class="s" d="M270 330 h148 M262 340 h164"/>
  </g>
  ${L(300, 344, 'Matriz')}

  <!-- IGREJA DE SÃO FRANCISCO (direita, frente) -->
  <g transform="translate(28 0)">
    <rect class="f" x="470" y="300" width="84" height="74"/>
    <path class="f" d="M462 304 L512 262 L562 304Z"/>
    <line class="s" x1="512" y1="262" x2="512" y2="240"/><line class="s" x1="504" y1="248" x2="520" y2="248"/>
    <circle class="f" cx="512" cy="288" r="7"/>
    <path class="f" d="M500 374 v-30 q12 -16 24 0 v30"/>
    <rect class="f" x="478" y="320" width="12" height="18"/><rect class="f" x="534" y="320" width="12" height="18"/>
  </g>
  ${L(540, 378, 'São Francisco')}

  <!-- ARCO DA SANTA (esquerda) -->
  <g transform="translate(-32 0)">
    <path class="f" d="M70 384 V262 Q70 200 128 200 Q186 200 186 262 V384 H160 V266 Q160 228 128 228 Q96 228 96 266 V384Z"/>
    <path class="s" d="M64 384 h32 M154 384 h38 M70 262 h26 M160 262 h26"/>
    <rect class="f" x="114" y="186" width="28" height="16"/>
    <path class="f" d="M128 186 c-8 0 -11 -14 -9 -30 c1 -8 4 -14 9 -14 c5 0 8 6 9 14 c2 16 -1 30 -9 30z"/>
    <circle class="f" cx="128" cy="136" r="7"/><path class="s" d="M118 128 q10 -8 20 0" opacity=".6"/>
    <path class="m" d="M121 160 q7 -4 14 0 l-2 14 h-10z" opacity=".85"/>
  </g>
  ${L(96, 388, 'Arco da Santa')}

  <!-- POLO DE LAZER (frente, centro-esquerda) -->
  <g transform="translate(140 0) scale(.86) translate(40 66)">
    <path class="s" d="M196 410 h250"/>
    <path class="f" d="M214 410 v-44 h52 v44"/><path class="f" d="M206 368 L240 342 L274 368Z"/>
    ${[232, 248].map(x => `<line class="s" x1="${x}" y1="372" x2="${x}" y2="410"/>`).join('')}
    <g><line class="s" x1="300" y1="410" x2="304" y2="350"/><path class="vd" d="M304 350 q-26 -4 -34 8 q16 -12 34 -8z M304 350 q24 -8 34 4 q-16 -10 -34 -4z M304 350 q-12 -20 -28 -20 q16 6 28 20z M304 350 q8 -22 26 -24 q-16 8 -26 24z"/></g>
    <g><line class="s" x1="418" y1="410" x2="414" y2="358"/><path class="vd" d="M414 358 q-22 -4 -30 6 q14 -10 30 -6z M414 358 q20 -8 30 2 q-14 -8 -30 -2z M414 358 q-10 -18 -24 -18 q14 6 24 18z M414 358 q8 -18 22 -20 q-14 6 -22 20z"/></g>
    <path class="f" d="M338 410 v-18 h48 v18"/><path class="s" d="M332 392 h60"/><circle class="s" cx="350" cy="402" r="4"/><circle class="s" cx="374" cy="402" r="4"/>
  </g>
  ${L(420, 414, 'Polo de Lazer')}

  <!-- chão e mandacaru -->
  <path class="s" d="M0 384 h60 M196 384 h60 M572 384 h148" opacity=".6"/>
  <g transform="translate(640 330)"><path class="vd" d="M10 54 V6 q0 -8 6 -8 q6 0 6 8 v48z M10 30 h-10 v-16 q0 -6 5 -6 q5 0 5 6z M22 24 h10 v-14 q0 -6 -5 -6 q-5 0 -5 6z"/></g>
  <g transform="translate(22 334) scale(.8)"><path class="vd" d="M10 54 V6 q0 -8 6 -8 q6 0 6 8 v48z M10 30 h-10 v-16 q0 -6 5 -6 q5 0 5 6z M22 24 h10 v-14 q0 -6 -5 -6 q-5 0 -5 6z"/></g>
</svg>`;
};

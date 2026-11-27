(function () {
  const $ = (s, el) => (el || document).querySelector(s), $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const brl = v => v == null ? '' : 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  const nb = s => esc(s).replace(/R\$ /g, () => 'R$\u00a0').replace(/(\d) (h|km|mil|mi)\b/g, (m, a, u) => a + '\u00a0' + u);
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const ic = n => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const SITE = 'www.acopiaratransparente.com.br';
  const mq = matchMedia('(max-width: 760px)'); let M = mq.matches;
  let CASOS = [], X = {}, NOT = [], PERF = [], DIN = {}, PROC = [];
  const stCls = s => s === 'comprovado' ? 'st-comprovado' : s === 'em juízo' ? 'st-juizo' : 'st-indicio';
  const stChip = s => `<span class="chip ${stCls(s)}">${esc(s || 'indício a apurar')}</span>`;
  const per = p => p ? CARDS.fmtPer(p) : '';
  const fmtData = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return dd ? `${dd}/${m}/${y}` : m ? `${m}/${y}` : y; };
  const main = $('#main');
  let layerTrigger = null;
  const cenaKey = a => window.SCENES && SCENES.IMG[a];
  const img = (a, cls) => SCENES.get(a);
  const toast = t => { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); };

  document.body.classList.toggle('m', M);
  const j = u => fetch(u).then(r => r.ok ? r.json() : []).catch(() => []);
  Promise.all([j('data/casos.json'), j('data/site.json'), j('data/noticias.json'), j('data/perfis.json'), j('data/dinheiro.json'), j('data/processos.json')]).then(([c, x, n, p, d, pr]) => {
    DIN = d || {}; PROC = pr || [];
    CASOS = c; X = x; NOT = (n || []).sort((a, b) => b.data.localeCompare(a.data)); PERF = p || [];
    $('#footdoodle').innerHTML = SCENES.footer(); route(); animate($('.foot')); chrome();
  });
  window.addEventListener('hashchange', route);
  mq.addEventListener ? mq.addEventListener('change', e => { M = e.matches; document.body.classList.toggle('m', M); route(true); }) : 0;

  /* ---------- roteador ---------- */
  function route(keep) {
    const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?'); const [p, ...rest] = path.split('/'); const a = decodeURIComponent(rest.join('/') || '');
    const current = p === 'caso' ? 'casos' : p === 'noticia' ? 'noticias' : p === 'pessoa' ? 'pessoas' : p;
    $$('.nav a,.tabbar [data-r]').forEach(n => {
      const on = n.getAttribute('href') === '#/' + current;
      n.classList.toggle('on', on);
      if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
    });
    $$('.tabbar [data-r]').forEach(n => n.classList.toggle('on', n.dataset.r === p || (p === 'caso' && n.dataset.r === 'casos') || (p === 'noticia' && n.dataset.r === 'noticias')));
    closeLayer($('#sheet'), false); closeLayer($('#modal'), false); document.body.classList.remove('has-mbar');
    const v = { '': home, casos, caso: () => caso(a), noticias, noticia: () => noticia(a), 'linha-do-tempo': tempo, dinheiro, pessoas, pessoa: () => pessoa(a), fiscalize, direitos, denuncie, sobre, processos, editorial, busca: () => { setTimeout(() => openSearch(new URLSearchParams(qs || '').get('q') || ''), 0); return home(); } }[p] || home;
    main.innerHTML = v(); if (keep !== true) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
    after(p, a, qs); animate(main);
    $('#footdoodle').innerHTML = SCENES.footer(); animate($('.foot'));
    document.title = (($('h1', main) || {}).textContent || 'Acopiara Transparente').slice(0, 70) + (p ? ' · Acopiara Transparente' : '');
  }

  /* Informação e documentos ficam legíveis desde o primeiro quadro. */
  function animate(root) {
    root.classList.add('in');
    $$('svg.cena,.cena-img,svg.draw,.pr,.chart,.tl,.mk', root).forEach(el => el.classList.add('in'));
    $$('[data-n]', root).forEach(b => {
      b.textContent = (b.dataset.pre || '') + Number(b.dataset.n).toLocaleString('pt-BR', {
        minimumFractionDigits: +b.dataset.dec || 0, maximumFractionDigits: +b.dataset.dec || 0
      }) + (b.dataset.suf || '');
    });
  }

  /* ---------- gráficos (SVG, cores do tema) ---------- */
  const fmtN = v => v >= 1e6 ? 'R$\u00a0' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + (v / 1e6 === 1 ? ' milhão' : ' milhões') : v >= 1e4 ? 'R$\u00a0' + Math.round(v / 1e3).toLocaleString('pt-BR') + '\u00a0mil' : 'R$\u00a0' + Math.round(v).toLocaleString('pt-BR');
  function chartBars(g) {
    const d = g.dados, mx = Math.max(...d.map(x => x[1])), money = g.moeda !== false && mx > 999;
    return `<figure class="chart"><figcaption>${esc(g.titulo)}</figcaption><div class="hbars">${d.map((x, i) => `<div class="hb"><span class="hlab">${esc(x[0])}</span><div class="bar ${i === 0 && g.destaque ? '' : ''}"><i style="width:${(100 * x[1] / mx).toFixed(1)}%;--d:${(i * .08).toFixed(2)}s"></i></div><b>${money ? fmtN(x[1]) : Number(x[1]).toLocaleString('pt-BR')}</b></div>`).join('')}</div>${g.fonte ? `<p class="cf">${esc(g.fonte)}</p>` : ''}</figure>`;
  }
  function chartLine(g, series) {
    // series: [{nome, cor, pts:[[label,val]]}]
    const W = M ? 420 : 760, H = M ? 240 : 260, pl = 54, pr = 12, pt = 16, pb = 34, labs = series[0].pts.map(p => p[0]), n = labs.length;
    const all = series.flatMap(s => s.pts.map(p => p[1])).filter(v => v != null), mn = g.zero ? 0 : Math.min(...all) * .97, mx = Math.max(...all) * 1.03;
    const x = i => pl + i * (W - pl - pr) / Math.max(1, n - 1), y = v => pt + (1 - (v - mn) / (mx - mn || 1)) * (H - pt - pb);
    const fmtv = v => g.dec ? v.toLocaleString('pt-BR', { minimumFractionDigits: g.dec, maximumFractionDigits: g.dec }) : Math.round(v).toLocaleString('pt-BR');
    const grid = [0, .25, .5, .75, 1].map(f => { const v = mn + (mx - mn) * f; return `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${fmtv(v)}</text>`; }).join('');
    const step = Math.ceil(n / 9), xl = labs.map((l, i) => i % step === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(l)}</text>` : '').join('');
    const lines = series.map(s => { const pts = s.pts.map((p, i) => p[1] == null ? null : [x(i), y(p[1])]).filter(Boolean); return `<polyline class="ln" style="stroke:${s.cor}" points="${pts.map(p => p.join(',')).join(' ')}"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" style="fill:${s.cor}"/>`).join('')}`; }).join('');
    return `<figure class="chart"><figcaption>${esc(g.titulo)}</figcaption><div class="legend">${series.map(s => `<span><i style="background:${s.cor}"></i>${esc(s.nome)}</span>`).join('')}</div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(g.titulo)}">${grid}${lines}${xl}</svg>${g.fonte ? `<p class="cf">${esc(g.fonte)}</p>` : ''}</figure>`;
  }
  function chart(g) {
    if (!g) return '';
    if (g === 'combustivel') return chartComb();
    if (g.tipo === 'linha') return chartLine(g, [{ nome: g.serie || 'valor', cor: 'var(--verde)', pts: g.dados }]);
    return chartBars(g);
  }
  function chartComb() {
    const s = (DIN.combustivel || []).filter(r => r.prod === 'DIESEL S10'); if (!s.length) return '';
    const MS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'], lb = r => MS[+r.mes.slice(5) - 1] + '/' + r.mes.slice(2, 4);
    return chartLine({ titulo: 'Diesel: preço por litro pago pela Prefeitura × preço médio nos postos de Iguatu (ANP)', dec: 2, fonte: 'Fontes: notas fiscais informadas ao TCE-CE (SIM) e levantamento de preços da ANP. Elaboração própria.' }, [{ nome: 'Prefeitura de Acopiara', cor: 'var(--alerta)', pts: s.map(r => [lb(r), r.pago_medio]) }, { nome: 'Postos de Iguatu (bomba)', cor: 'var(--azul)', pts: s.map(r => [lb(r), r.iguatu]) }]);
  }
  const brlAud = v => 'R$\u00a0' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function financialSummary(v) {
    if (!v) return '';
    return `<dl class="financial-summary">${[['bruto','Empenhado bruto'],['anulado','Anulado'],['liquido','Empenhado líquido'],['pago','Pago, sem estornos']].map(([k,t]) => `<div><dt>${t}</dt><dd>${brlAud(v[k])}</dd></div>`).join('')}</dl>`;
  }
  function financialDetail(v) {
    if (!v) return '';
    return `<details class="financial-detail"><summary><b>${brlAud(v.liquido)}</b><span>Empenhado líquido · ver composição</span></summary><dl><dt>Bruto</dt><dd>${brlAud(v.bruto)}</dd><dt>Anulado</dt><dd>${brlAud(v.anulado)}</dd><dt>Pago, sem estornos</dt><dd>${brlAud(v.pago)}</dd></dl></details>`;
  }
  function reviewNotes(item) {
    return item.conferencia?.length ? `<section class="review-note" aria-label="Conferência documental"><h3>O que foi conferido e o que ainda falta</h3>${item.conferencia.map(t => `<p>${esc(t)}</p>`).join('')}</section>` : '';
  }
  function serieCaso(c) {
    if (!c.serie || !c.serie.meses?.length) return '';
    const MS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const ms = c.serie.meses, tot = ms.reduce((a, b) => a + b[1], 0), mx = Math.max(...ms.map(m => m[1]));
    return `<h2>O dinheiro mês a mês</h2><p>Empenhos líquidos após as anulações parciais deste recorte, segundo os registros do SIM/TCE-CE. Total: <b>${brl(tot)}</b>.</p>
      <figure class="chart"><figcaption>Empenhos líquidos por mês (R$)</figcaption><div class="vbars">${ms.map((m, i) => `<div class="vb" title="${esc(m[0])}: ${brl(m[1])}"><i style="height:${(100 * m[1] / mx).toFixed(1)}%;--d:${(i * .03).toFixed(2)}s"></i><span>${MS[+m[0].slice(5) - 1]}<br>${m[0].slice(2, 4)}</span></div>`).join('')}</div>
      ${c.serie.por_empresa?.length > 1 ? `<div class="hbars" style="margin-top:16px">${c.serie.por_empresa.map(p => `<div class="hb"><span class="hlab">${esc(p[0])}</span><div class="bar"><i style="width:${(100 * p[1] / c.serie.por_empresa[0][1]).toFixed(1)}%"></i></div><b>${fmtN(p[1])}</b></div>`).join('')}</div>` : ''}
      <p class="cf">Fonte: TCE-CE, Sistema de Informações Municipais (SIM), empenhos de jan./2025 a set./2026, excluídas as notas totalmente anuladas e descontadas as anulações parciais até 30/09/2026.</p></figure>`;
  }

  function agentesBloco(nomes, titulo) {
    const ps = (nomes || []).map(n => PERF.find(p => norm(p.nome) === norm(n)) || { nome: n, cargo: '' });
    if (!ps.length) return '';
    return `<h2>${titulo || 'Agentes públicos envolvidos'}</h2><div class="grid ${M ? '' : 'g2'}">${ps.map(p => `<a class="card agente" href="#/pessoa/${encodeURIComponent(p.nome)}"><div class="body"><div class="perfil">${avatar(p)}<div><h3 style="font-size:17px">${esc(p.nome)}</h3><div class="meta" style="margin-top:6px">${esc(p.cargo || '')}</div></div></div>${p.historico?.length ? `<p style="margin-top:12px;font-size:14px">${esc(p.historico[p.historico.length - 1])}</p>` : ''}${p.gestao ? `<p style="font-size:14px"><b>${fmtN(p.gestao.total)}</b> empenhos líquidos na unidade sob sua gestão</p>` : ''}</div></a>`).join('')}</div>`;
  }
  function ordenadoresBloco(c) {
    const o = c.serie && c.serie.ordenadores; if (!o || !o.length) return '';
    return `<h2>Quem respondia pelas despesas</h2><p>Gestores das secretarias na data de cada empenho deste caso, segundo o cadastro que a Prefeitura envia ao Tribunal de Contas. O gestor da unidade é quem autoriza a despesa.</p>${tabela([['Secretaria', 'Gestor(a) na data do empenho', 'Empenhado líquido'], ...o.map(r => [r[0], r[1], brl(r[2])])])}<p class="muted" style="font-size:13px;margin-top:8px">${o.map(r => PERF.find(p => norm(p.nome) === norm(r[1])) ? `<a href="#/pessoa/${encodeURIComponent(PERF.find(p => norm(p.nome) === norm(r[1])).nome)}">Perfil de ${esc(r[1])} →</a>` : '').filter(Boolean).join(' · ')}</p>`;
  }

  function capturasBloco(c) {
    if (!c.capturas?.length) return '';
    return `<h2>O que a gestão publicou nas redes</h2><p>Capturas de publicações oficiais no Instagram, feitas em 25/11/2026. Nomes e fotos de cidadãos que comentaram foram borrados; perfis oficiais e de agentes públicos aparecem como publicados. Toque na imagem para ampliar.</p>
      <div class="caps">${c.capturas.map(k => `<figure class="cap"><img loading="lazy" src="${esc(k.img)}" alt="Captura de ${esc(k.conta)} em ${esc(k.data)}" data-zoom="${esc(k.img)}"><figcaption><span class="tag">${esc(k.tema)} · ${esc(k.data)}</span><b>${esc(k.conta)}</b><p>${esc(k.resumo)}</p><a href="${esc(k.url)}" target="_blank" rel="noopener">Ver a publicação original ↗</a></figcaption></figure>`).join('')}</div>`;
  }
  function leituraBloco(c) { return c.leitura_dados?.length ? `<h2>O que os dados do Tribunal de Contas mostram</h2>${c.leitura_dados.map(p => `<p>${esc(p)}</p>`).join('')}` : ''; }
  function sociosBloco(c) {
    if (!c.socios?.length) return '';
    return `<h2>Quem são os donos das empresas</h2><p>Quadro de sócios na Receita Federal (consulta pública de 26/11/2026). Ter sócio citado aqui não é irregularidade; serve para conferir vínculos com a Prefeitura.</p><div class="grid ${M ? '' : 'g2'}">${c.socios.map(s => `<div class="box"><h4>${esc(s.empresa)}</h4><div class="nums"><div><span>CNPJ</span><b>${esc(s.cnpj)}</b></div><div><span>Sede</span><b>${esc(s.cidade)}</b></div><div><span>Aberta em</span><b>${fmtData(s.abertura)}</b></div></div><p style="font-size:14px;margin:12px 0 6px"><b>Atividade:</b> ${esc(s.atividade || '')}</p><p style="font-size:14px;margin:0"><b>Sócios:</b> ${esc(s.socios.join('; ') || 'não informado')}</p></div>`).join('')}</div>`;
  }
  function empenhosBloco(c) {
    if (!c.empenhos?.length) return '';
    const rows = c.empenhos;
    return `<h2>Os empenhos, um a um</h2><p>${rows.length} registros vinculados ao recorte deste caso. Reserva orçamentária, anulação e pagamento são etapas diferentes; os valores abaixo as distinguem.</p>${financialSummary(c.financeiro)}
      <label class="muted" for="ef">Filtrar registros</label><input id="ef" type="search" placeholder="Fornecedor, secretaria, objeto…" style="width:100%;margin:12px 0">
      <div id="el">${tabela([['Data','Fornecedor','Secretaria','Gestor(a)','Composição do registro','Forma','Objeto declarado'], ...rows.map(r => [fmtData(r[0]),r[1],r[2],r[3],`Líquido: ${brlAud(r[8] ?? r[4])}; bruto: ${brlAud(r[4])}; anulado: ${brlAud(r[7] || 0)}; pago: ${brlAud(r[9] || 0)}`,r[5],r[6]])],{id:'etb',data:1,lim:10})}</div>
      <p class="note">Fonte: SIM/TCE-CE. Notas do recorte publicado, anulações até 30/09/2026 e pagamentos válidos ligados às mesmas notas. Uma anulação não é prova de prejuízo; pode corresponder a ajuste de fonte ou relançamento.</p>`;
  }
  function relacionadosBloco(c) {
    const r = (c.relacionados || []).map(id => CASOS.find(x => x.id === id)).filter(Boolean); if (!r.length) return '';
    return `<h2>Leia também</h2><p>Casos com as mesmas pessoas, empresas ou área.</p>${list(r, cardCaso, 'g2')}`;
  }
  function conferirBloco(c) {
    const tipos = [...new Set((c.fontes || []).map(f => norm(f.tipo || '')))].join(' ');
    const passos = [];
    if (/diario|dom|oficial/.test(tipos) || true) passos.push(['Diário Oficial dos Municípios', 'Pesquise "Acopiara" e o nome da empresa ou o número do contrato para ver o extrato, o edital e os aditivos.', 'https://www.diariomunicipal.com.br/aprece/']);
    if (c.empenhos?.length) passos.push(['TCE-CE: despesas', 'Abra o portal, escolha Acopiara e o ano, e pesquise pelo nome do recebedor para ver cada empenho e pagamento.', 'https://municipios-transparencia.tce.ce.gov.br/']);
    passos.push(['PNCP', 'Toda contratação deve estar no Portal Nacional. Pesquise "Acopiara" e confira se o contrato está publicado.', 'https://pncp.gov.br/app/editais?q=Acopiara']);
    if (c.socios?.length) passos.push(['Receita Federal (CNPJ)', 'Consulte o cartão CNPJ e o quadro de sócios da empresa.', 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp']);
    if (/saude|cnes/.test(norm(c.area + tipos))) passos.push(['CNES', 'Veja em quais unidades cada profissional está registrado e quantas horas declara.', 'https://cnes.datasus.gov.br/pages/profissionais/consulta.jsp']);
    return `<h2>Como conferir este caso</h2><ol class="q">${passos.map(p => `<li><b>${esc(p[0])}:</b> ${esc(p[1])} <a href="${esc(p[2])}" target="_blank" rel="noopener">Abrir ↗</a></li>`).join('')}</ol>`;
  }



  /* ---------- PROCESSOS ---------- */
  function processos() {
    const s = PROC.filter(p => p.sensivel).length;
    const card = p => `<article class="proc${p.sensivel ? ' sens' : ''}" data-s="${p.sensivel ? 1 : 0}" data-t="${esc(norm(JSON.stringify(p)))}">
      <div class="ph"><span class="chip">${esc(p.classe)}</span>${p.sensivel ? '<span class="chip st-sens">Sensível</span>' : ''}<span class="chip">${esc(p.situacao)}</span></div>
      <h3>${esc(p.tema)}</h3><p class="pn">${esc(p.n)} · ${esc(p.orgao)}</p>
      <dl><dt>Quem propôs</dt><dd>${esc(p.autor)}</dd><dt>Contra quem</dt><dd>${esc(p.reus)}</dd></dl>
      ${p.sensivel ? `<p class="aviso">${esc(p.motivo)}</p>` : ''}
      ${p.marcos?.length ? `<div class="tl">${p.marcos.map(m => `<div class="ev"><time>${/^\d{4}-\d{2}-\d{2}$/.test(m[0]) ? fmtData(m[0]) : esc(m[0])}</time><span>${esc(m[1])}</span></div>`).join('')}</div>` : ''}
      ${p.casos?.length ? `<p class="plinks">${p.casos.map(id => { const c = CASOS.find(x => x.id === id); return c ? `<a href="#/caso/${id}">${esc(c.titulo.split(':')[0])} →</a>` : ''; }).join('')}</p>` : ''}</article>`;
    return `<section class="block"><div class="wrap"><div class="kicker">Processos em andamento</div><h1>O que já está na Justiça, no Ministério Público e no Tribunal de Contas</h1>
      <p class="lead">${PROC.length} procedimentos sobre a gestão municipal, com a situação conhecida em ${fmtData('2026-11-26')}. Os marcados como sensíveis envolvem pessoas que merecem proteção especial ou decisões ainda não definitivas: neles, nenhum cidadão comum é identificado e vale a presunção de inocência.</p>
      <div class="filters"><input id="prq" type="search" placeholder="Filtrar por número, tema, órgão…" aria-label="Filtrar processos"><select id="prs" aria-label="Tipo"><option value="">Todos</option><option value="1">Só sensíveis (${s})</option><option value="0">Só não sensíveis</option></select></div>
      <div class="procs" id="prl">${PROC.map(card).join('')}</div>
      <p class="note">Processos judiciais são públicos, salvo segredo de justiça, e podem ser consultados no PJe do TJCE pelo número. Procedimentos do Ministério Público podem ser acompanhados no portal do MPCE. Se você é parte e quer acrescentar informação, use o <a href="#/denuncie">formulário</a>.</p></div></section>`;
  }
  function editorial() {
    const E = X.editorial || {};
    return `<section class="block"><div class="wrap"><div class="row"><div class="c8"><div class="kicker">Quem somos e como escrevemos</div><h1>${esc(E.titulo || 'Linha editorial')}</h1>
      <div class="prose">${(E.secoes || []).map(s => `<h2>${esc(s.titulo)}</h2>${(s.paragrafos || []).map(p => `<p>${esc(p)}</p>`).join('')}${s.lista ? `<ol class="q">${s.lista.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}`).join('')}</div>
      <div class="btns" style="margin-top:var(--s3)"><a class="btn solid" href="#/casos">Ver os casos</a><a class="btn" href="#/sobre">Sobre e correções</a></div></div></div></div></section>`;
  }

  /* ---------- estrutura editorial ---------- */
  function secao(n, t, html) { return html && String(html).replace(/<[^>]+>/g, '').trim() ? `<section class="sec"><h2><span class="sn">${n}</span>${esc(t)}</h2>${html}</section>` : ''; }
  function leituraEditorial(item) {
    const m = item.materia || {}, leitura = m.leitura_editorial;
    if (leitura?.paragrafos?.length) return `<div class="concl"><span class="tag">Nossa leitura</span><h3 class="leitura-title">${esc(leitura.titulo)}</h3><div class="leitura-body">${leitura.paragrafos.map(p => `<p>${esc(p)}</p>`).join('')}</div></div>`;
    const texto = m.conclusao || item.conclusao || item.avaliacao || '';
    return texto ? `<div class="concl"><span class="tag">Nossa leitura</span><div class="leitura-body"><p>${esc(texto)}</p></div></div>` : '';
  }
  function direitosBloco(ds) { return (ds || []).length ? `<div class="dgrid">${ds.map(d => `<div class="dcard"><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p></div>`).join('')}</div>` : ''; }
  function medidasBloco(m) {
    const t = m.tomadas || [], c = [...new Set(m.cabiveis || [])];
    return `<div class="medidas"><div><h3>Já tomadas</h3>${t.length ? `<ul class="q ok">${t.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted">Não há, nos documentos públicos, medida conhecida contra este fato até a data da publicação. É aqui que a população pode agir.</p>'}</div>
      <div><h3>Cabíveis</h3><ul class="q">${c.map(x => `<li>${esc(x)}</li>`).join('')}</ul><a class="btn ghost" href="#/denuncie">Envie uma informação</a> <a class="btn ghost" href="#/fiscalize">Como pedir documentos</a></div></div>`;
  }
  function sessaoBloco(s) {
    if (!s) return '';
    const yt = t => `${s.video}&t=${t}s`, mmss = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    return `<h2>${esc(s.titulo)}</h2><p>${esc(s.intro)}</p>
      <div class="frames">${s.quadros.map(q => `<figure class="frame"><img loading="lazy" src="${esc(q.img)}" alt="${esc(q.leg)}" data-zoom="${esc(q.img)}"><figcaption><a class="tag" href="${esc(yt(q.t))}" target="_blank" rel="noopener">▶ ${mmss(q.t)}</a> ${esc(q.leg)}</figcaption></figure>`).join('')}</div>
      <h3>O que o Secretário disse</h3><div class="tl">${s.disse.map(d => `<div class="ev"><time><a href="${esc(s.video)}&t=${d[0].split(':').reduce((a, b) => a * 60 + +b, 0)}s" target="_blank" rel="noopener">${esc(d[0])}</a></time><span>${esc(d[1])}</span></div>`).join('')}</div>
      <h3>O que ficou sem resposta</h3><ul class="q">${s.falta.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="concl"><span class="tag">Quem escolhe</span><p>${esc(s.leitura)}</p></div>
      ${s.circulando?.length ? `<h3>O que circula nas redes</h3><div class="frames two">${s.circulando.map(q => `<figure class="frame"><img loading="lazy" src="${esc(q.img)}" alt="${esc(q.leg)}" data-zoom="${esc(q.img)}"><figcaption>${esc(q.leg)}</figcaption></figure>`).join('')}</div><p class="muted" style="font-size:14px">${esc(s.nota_circulando)}</p>` : ''}
      <p><a class="btn" href="${esc(s.video)}" target="_blank" rel="noopener">Assistir à sessão completa ↗</a></p>`;
  }
  function precedenteBloco(p) {
    if (!p) return '';
    return `<div class="preced"><h2>${esc(p.titulo)}</h2>${p.texto.map(t => `<p>${esc(t)}</p>`).join('')}${tabela(p.quadro)}<p class="muted" style="font-size:13px;margin-top:8px">Fonte: ${esc(p.fonte)}</p></div>`;
  }
  /* ---------- peças comuns ---------- */
  function cardCaso(c) {
    if (M) return `<a class="lrow" href="#/caso/${c.id}"><div class="th">${SCENES.item(c)}</div><div><div class="meta">${esc(c.area)} · ${esc(per(c.periodo))}</div><h3>${esc(c.titulo)}</h3><div class="sub">${c.valor ? `<span class="val">${brl(c.valor)}</span>` : ''}${stChip(c.status)}</div></div></a>`;
    return `<a class="card" href="#/caso/${c.id}"><div class="media">${SCENES.item(c)}</div><div class="body"><div class="meta">${esc(c.area)} · ${esc(per(c.periodo))}</div><h3>${esc(c.titulo)}</h3><p>${esc(c.resumo)}</p>
      <div class="cfoot">${c.valor ? `<span class="val">${brl(c.valor)}</span>` : '<span></span>'}${stChip(c.status)}</div></div></a>`;
  }
  function cardNot(n) {
    if (M) return `<a class="lrow" href="#/noticia/${n.id}"><div class="th">${SCENES.item(n)}</div><div><div class="meta">${esc(fmtData(n.data))} · ${esc(n.veiculo)}</div><h3>${esc(n.titulo)}</h3><div class="sub">${(n.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div></a>`;
    return `<a class="card ncard" href="#/noticia/${n.id}"><div class="media">${SCENES.item(n)}</div><div class="body"><div class="meta">${esc(fmtData(n.data))} · ${esc(n.veiculo)}</div><h3>${esc(n.titulo)}</h3><p>${esc(n.fato.length > 220 ? n.fato.slice(0, n.fato.lastIndexOf(' ', 210)) + '…' : n.fato)}</p>
      <div class="cfoot"><span class="chips">${(n.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</span><span class="muted" style="font-size:13px">Nossa análise →</span></div></div></a>`;
  }
  const list = (arr, fn, cls) => M ? `<div>${arr.map(fn).join('')}</div>` : `<div class="grid ${cls || 'g3'}">${arr.map(fn).join('')}</div>`;
  function tabela(t, opts) {
    const head = t[0], rows = t.slice(1);
    const identifier = h => /(?:processo|cpf|cnpj|c[óo]digo|protocolo|matr[ií]cula|documento|^n[úu]mero|^n[º°.]|^id$|data|^ano$|^m[eê]s$|per[ií]odo)/i.test(h);
    const numCol = head.map((h, i) => {
      const values = rows.map(r => String(r[i] ?? '').trim()).filter(v => v && !/^[–—-]$/.test(v));
      return !identifier(h) && values.length > 0 && values.every(v => /^(?:R\$\s*)?[+−–-]?\d[\d\s.,]*(?:\s*(?:%|h|horas?|km|mil|mi|meses))?$/.test(v));
    });
    const cellClass = i => numCol[i] ? 'num' : identifier(head[i]) ? 'identifier' : 'text';
    if (M) return `<div class="recs" ${opts && opts.id ? `id="${opts.id}"` : ''}>${rows.map(r => `<div class="rec"${opts && opts.data ? ` data-t="${esc(norm(r.join(' ')))}"` : ''}><div class="h">${nb(r[0])}</div><dl>${head.slice(1).map((h, i) => `<dt>${esc(h)}</dt><dd class="${cellClass(i + 1)}">${nb(r[i + 1])}</dd>`).join('')}</dl></div>`).join('')}</div>`;
    const objI = head.findIndex(h => /objeto/i.test(h)), lim = opts && opts.lim, cut = s => { s = String(s || ''); return s.length > 160 ? s.slice(0, s.lastIndexOf(' ', 155)) + '…' : s; };
    const trs = rows.map((r, k) => `<tr class="${lim && k >= lim ? 'mais' : ''}"${opts && opts.data ? ` data-t="${esc(norm(r.join(' ')))}"` : ''}>${r.map((x, i) => i === objI ? `<td class="obj" title="${esc(x)}">${nb(x)}</td>` : `<td class="${cellClass(i)}">${nb(x)}</td>`).join('')}</tr>`).join('');
    return `<div class="tscroll" tabindex="0" role="region" aria-label="Tabela; deslize para ver todas as colunas"><table class="t${head.length > 5 ? ' wide' : ''}" ${opts && opts.id ? `id="${opts.id}"` : ''}><thead><tr>${head.map((h, i) => `<th scope="col" class="${cellClass(i)}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${trs}</tbody></table></div>${lim && rows.length > lim ? `<button class="btn ghost vermais" onclick="const t=this.previousElementSibling;t.classList.toggle('aberta');this.textContent=t.classList.contains('aberta')?'Mostrar menos':'Mostrar todos os ${rows.length}'">Mostrar todos os ${rows.length}</button>` : ''}`;
  }
  function engage(p) {
    const btns = `<button class="rbtn" data-act="like" aria-label="Curtir">${ic('up')}<span class="n" data-c="like"></span></button><button class="rbtn" data-act="dislike" aria-label="Não curtir">${ic('down')}<span class="n" data-c="dislike"></span></button><button class="rbtn solid-share" data-act="share">${ic('share')}<span>Compartilhar</span></button>`;
    return { box: `<div class="box" data-eng="${esc(p)}"><h4>Participe</h4><div class="engage">${btns}</div><div class="counters" style="margin-top:12px"><span>${ic('olho')}<b data-c="views">–</b> visualizações</span><span>${ic('share')}<b data-c="shares">–</b> compartilhamentos</span></div></div>`,
      bar: `<div class="mbar" data-eng="${esc(p)}">${btns}</div>`, line: `<div class="counters" data-eng="${esc(p)}" style="margin-top:12px"><span>${ic('olho')}<b data-c="views">–</b></span><span>${ic('share')}<b data-c="shares">–</b></span></div>` };
  }
  async function bindEngage(p, item) {
    const boxes = $$(`[data-eng="${CSS.escape(p)}"]`);
    const paint = r => { if (r.off) { boxes.forEach(b => b.classList.add('off')); return; } boxes.forEach(b => { ['views', 'shares', 'like', 'dislike'].forEach(k => $$(`[data-c="${k}"]`, b).forEach(e => { if (r[k] != null) e.textContent = Number(r[k]).toLocaleString('pt-BR'); })); $$('[data-act="like"]', b).forEach(x => x.classList.toggle('on', r.mine === 'like')); $$('[data-act="dislike"]', b).forEach(x => { x.classList.toggle('on', r.mine === 'dislike'); x.classList.add('neg'); }); }); };
    $$('[data-act]', main).forEach(b => b.onclick = async () => {
      if (b.dataset.act === 'share') return openShare(item, p);
      const r = await API.react(p, b.dataset.act); if (!r.off) { paint(Object.assign({}, r)); if (r.mine && r.mine !== b.dataset.act) toast('Seu voto já foi registrado neste aparelho'); }
    });
    $$('.mbar[data-eng]').length && document.body.classList.add('has-mbar');
    paint(await API.hit(p));
  }

  /* ---------- INÍCIO ---------- */
  function home() {
    const destaques = (X.destaques || []).map(id => CASOS.find(c => c.id === id)).filter(Boolean);
    const intro = String(X.intro || ''), split = intro.indexOf('. ');
    const opening = split < 0 ? intro : intro.slice(0, split + 1), context = split < 0 ? '' : intro.slice(split + 2);
    return `<section class="hero"><div class="wrap"><div class="hero-location"><span>Dossiê da Reconstrução</span><span>Acopiara, Ceará · 2025–2026</span></div><div class="row hero-grid"><div class="c7">
      <h1>O dinheiro é público.<span>A informação também.</span></h1>
      <p class="lead">${esc(opening)}</p>
      ${context ? `<details class="hero-details"><summary>O que você encontra neste dossiê</summary><p>${esc(context)}</p></details>` : ''}
      <div class="btns hero-actions"><a class="btn solid" href="#/casos">Explorar os casos <span aria-hidden="true">↗</span></a><a class="btn ghost" href="#/noticias">Notícias e análises</a></div>
      <a class="source-note" href="#/sobre">${ic('casos')}Documentos públicos. Fontes para conferir.<span aria-hidden="true">→</span></a>
      </div><div class="c5 heroart">${M ? '' : `<figure class="capa">${SCENES.cover()}<figcaption>Arco da Santa · entrada de Acopiara</figcaption></figure>`}</div></div>${M ? `<div class="heroart m"><figure class="capa">${SCENES.cover()}<figcaption>Arco da Santa · entrada de Acopiara</figcaption></figure></div>` : ''}
      <div class="stats" aria-label="O dossiê em números">${(X.numeros || []).map(n => `<div class="stat"><b>${nb(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('')}</div>
    </div></section>
    <section class="block"><div class="wrap"><div class="sec-head"><div><div class="kicker">Comece por aqui</div><h2>Os casos que mais pesam no bolso de Acopiara</h2></div>${M ? '' : `<a class="btn ghost" href="#/casos">Todos os ${CASOS.length} casos</a>`}</div>
      ${list(destaques.slice(0, M ? 6 : 9), cardCaso)}${M ? `<p style="margin-top:16px"><a class="btn block" href="#/casos">Todos os ${CASOS.length} casos</a></p>` : ''}</div></section>
    ${NOT.length ? `<section class="block"><div class="wrap"><div class="sec-head"><div><div class="kicker">Notícias</div><h2>O que saiu na imprensa, e o que os documentos dizem</h2></div>${M ? '' : `<a class="btn ghost" href="#/noticias">Todas as notícias</a>`}</div>${list(NOT.slice(0, 3), cardNot)}</div></section>` : ''}
    ${balanco()}
    <section class="block"><div class="wrap"><div class="row">
      <div class="c6"><div class="kicker">Como ler este site</div><h2>Comprovado, indício ou em juízo</h2>${(X.como_ler || []).map(p => `<p>${p}</p>`).join('')}</div>
      <div class="c6"><div class="kicker">Por áreas</div><h2>Escolha um assunto</h2><div class="grid g2">${areas().map(a => `<a class="card" href="#/casos?area=${encodeURIComponent(a.nome)}">${M ? '' : `<div class="media">${img(a.nome)}</div>`}<div class="body"><h3>${esc(a.nome)}</h3><p>${a.n} caso${a.n > 1 ? 's' : ''}</p></div></a>`).join('')}</div></div>
    </div></div></section>
    ${chamada()}`;
  }
  function balanco() {
    const b = X.balanco || {};
    return `<section class="balanco"><div class="wrap"><div class="kicker">O balanço</div><h2 style="font-size:clamp(28px,4vw,44px)">${esc(b.titulo)}</h2><p class="lead">${esc(b.intro)}</p>
      <div class="bigs">${(b.numeros || []).map(n => `<div><b data-n="${n.n}" data-pre="${esc(n.pre || '')}" data-suf="${esc(n.suf || '')}" data-dec="${n.dec || 0}">${esc(n.pre || '')}0${esc(n.suf || '')}</b><span>${esc(n.rotulo)}</span></div>`).join('')}</div>
      <h3 style="font-size:24px;margin-top:var(--s5)">O padrão que os documentos mostram</h3>
      <ol class="padrao">${(b.padrao || []).map(p => `<li><b>${esc(p.t)}</b><br>${esc(p.d)}${p.casos ? `<span class="plinks">${p.casos.map(id => { const c = CASOS.find(x => x.id === id); if (!c) return ''; const t = c.titulo.split(':')[0]; return `<a href="#/caso/${id}">${esc(t.length > 60 ? t.slice(0, t.lastIndexOf(' ', 58)) + '…' : t)} →</a>`; }).join('')}</span>` : ''}</li>`).join('')}</ol>
      <p class="quote" style="margin-top:var(--s5)">${esc(b.frase)}</p><p style="color:#C9C7BF;max-width:760px">${esc(b.fecho)}</p></div></section>`;
  }
  function chamada() {
    const d = X.direitos || {};
    return `<section class="acao"><div class="wrap"><div class="kicker">E agora?</div><h2>${esc(d.titulo)}</h2><p class="lead">${esc(d.intro)}</p>
      <div class="grid g3" style="margin-top:var(--s3)">${(d.passos || []).map(p => `<div><h3>${civicIcon(p.t)}<span>${esc(p.t)}</span></h3><p>${esc(p.d)}</p>${p.link ? `<a href="${esc(p.link)}">${esc(p.link_txt || 'Saiba como')} →</a>` : ''}</div>`).join('')}</div>
      <div class="btns" style="margin-top:var(--s3)"><a class="btn solid" href="#/direitos">Questionar não é crime: conheça seus direitos</a><a class="btn" href="#/denuncie">Envie uma denúncia</a></div></div></section>`;
  }
  function direitos() {
    const d = X.direitos || {};
    return `<section class="block"><div class="wrap"><div class="row"><div class="c8"><div class="kicker">Seus direitos</div><h1>Questionar não é crime</h1>${pageShareButton('direitos', '', 'Compartilhar seus direitos')}<div class="heroimg">${SCENES.get('Direitos do cidadão')}</div>
      <div class="prose">${(d.secoes || []).map((s, i) => `<section id="direito-${i}" class="rights-section"><h2>${esc(s.titulo)}</h2>${s.paragrafos.map(p => `<p>${esc(p)}</p>`).join('')}${s.lista ? `<ul class="q">${s.lista.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${pageShareButton('direitos', i, 'Compartilhar este trecho')}</section>`).join('')}</div>
      <div class="btns" style="margin-top:var(--s3)"><a class="btn" href="#/caso/desacato">Ver os números de Acopiara</a><a class="btn solid" href="#/denuncie">Relatar um caso</a></div></div></div></div></section>`;
  }
  function civicIcon(title) {
    const label = norm(title);
    const key = /camara/.test(label) ? 'camara' : /informacao/.test(label) ? 'informacao' : /denuncie/.test(label) ? 'denuncie' : /proteste/.test(label) ? 'proteste' : /registre/.test(label) ? 'registre' : 'protecao';
    const paths = {
      camara: '<path d="m3 8 9-5 9 5M4 9h16M5 20h14M3 22h18M7 10v8m5-8v8m5-8v8"/>',
      informacao: '<path d="M13 3H5v18h9M13 3v5h5l-5-5M8 11h5m-5 4h3"/><circle cx="17" cy="16" r="3.5"/><path d="m19.5 18.5 2 2"/>',
      denuncie: '<path d="M4 4h16v12H9l-5 4V4Z"/><path d="M12 7v4m0 2v.1"/>',
      proteste: '<path d="m4 10 14-5v14L4 14v-4Zm3 5 1 6h3l-1-5m11-8 1-1m-1 9 1 1"/>',
      registre: '<path d="M4 7h4l2-3h4l2 3h4v13H4V7Z"/><circle cx="12" cy="13" r="3.5"/>',
      protecao: '<path d="M12 3 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>'
    };
    return `<svg class="civic-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">${paths[key]}</svg>`;
  }
  const areas = () => { const m = {}; CASOS.forEach(c => m[c.area] = (m[c.area] || 0) + 1); return Object.entries(m).map(([nome, n]) => ({ nome, n })).sort((a, b) => b.n - a.n); };

  /* ---------- CASOS ---------- */
  function casos() {
    const opts = arr => [...new Set(arr.filter(Boolean))].sort().map(v => `<option>${esc(v)}</option>`).join('');
    const pes = CASOS.flatMap(c => (c.pessoas || []).map(p => p.nome));
    const anos = [...new Set(CASOS.flatMap(c => [c.periodo?.inicio?.slice(0, 4), c.periodo?.fim?.slice(0, 4)]))].filter(Boolean).sort();
    return `<section class="block"><div class="wrap"><div class="kicker">Casos</div><h1>Tudo o que os documentos mostram</h1>
      <p class="lead">Cada caso tem resumo, documentos com o trecho marcado, o que diz a lei, as perguntas que a Prefeitura precisa responder e o que você pode fazer.</p>
      <div class="filters" role="search">
        <input id="fq" type="search" placeholder="Filtrar por palavra, empresa, servidor, valor…" aria-label="Filtrar">
        <select id="fa" aria-label="Área"><option value="">Todas as áreas</option>${opts(CASOS.map(c => c.area))}</select>
        <select id="fs" aria-label="Secretaria"><option value="">Todas as secretarias</option>${opts(CASOS.map(c => c.secretaria))}</select>
        <select id="fp" aria-label="Pessoa"><option value="">Todas as pessoas</option>${opts(pes)}</select>
        <select id="fy" aria-label="Período"><option value="">Todo o período</option>${anos.map(a => `<option>${a}</option>`).join('')}</select>
      </div>
      <div class="chips" id="fst"><button class="chip on" data-s="">Todos</button><button class="chip st-comprovado" data-s="comprovado">Comprovado</button><button class="chip st-indicio" data-s="indício a apurar">Indício a apurar</button><button class="chip st-juizo" data-s="em juízo">Em juízo</button></div>
      <div class="count" id="fc" role="status" aria-live="polite"></div><div id="fl"></div></div></section>`;
  }
  function bindFiltros(qs) {
    const q = new URLSearchParams(qs || ''); if (q.get('area')) $('#fa').value = q.get('area'); if (q.get('pessoa')) $('#fp').value = q.get('pessoa');
    let st = '';
    const run = () => {
      const t = norm($('#fq').value), a = $('#fa').value, s = $('#fs').value, p = $('#fp').value, y = $('#fy').value;
      const r = CASOS.filter(c => (!a || c.area === a) && (!s || c.secretaria === s) && (!st || c.status === st) && (!p || (c.pessoas || []).some(x => x.nome === p))
        && (!y || (c.periodo && c.periodo.inicio.slice(0, 4) <= y && (c.periodo.fim || c.periodo.inicio).slice(0, 4) >= y)) && (!t || norm(JSON.stringify(c)).includes(t)));
      $('#fl').innerHTML = r.length ? list(r, cardCaso) : '<p>Nenhum caso com esses filtros.</p>'; animate($('#fl'));
      $('#fc').textContent = `${r.length} de ${CASOS.length} casos`;
    };
    ['#fq', '#fa', '#fs', '#fp', '#fy'].forEach(id => $(id).addEventListener('input', run));
    $$('#fst button').forEach(b => { b.setAttribute('aria-pressed', String(b.classList.contains('on'))); b.onclick = () => { st = b.dataset.s; $$('#fst button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); run(); }; });
    run();
  }

  /* ---------- CASO ---------- */
  function caso(id) {
    const c = CASOS.find(x => x.id === id); if (!c) return `<section class="block"><div class="wrap"><h1>Caso não encontrado</h1><a href="#/casos">Voltar aos casos</a></div></section>`;
    const i = CASOS.indexOf(c), prev = CASOS[i - 1], next = CASOS[i + 1], E = engage('caso/' + id);
    const ps = (c.pessoas || []).map(p => `<a class="chip" href="#/pessoa/${encodeURIComponent(p.nome)}">${esc(p.nome)}${p.papel ? ' · ' + esc(p.papel) : ''}</a>`).join('');
    const ul = a => `<ul class="q">${(a || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const ev = (c.recortes || []).map((r, k) => `<figure class="evid"><img loading="lazy" src="${esc(r.img)}" alt="Trecho do documento: ${esc(r.legenda)}" data-zoom="${esc(r.img)}"><figcaption><span class="tag">Documento ${k + 1}</span>${esc(r.legenda)}<br><span class="muted">${esc(r.doc || '')}</span>${r.url ? ` · <a href="${esc(r.url)}" target="_blank" rel="noopener">abrir a fonte ↗</a>` : ''}</figcaption></figure>`).join('');
    const nums = `${c.valor ? `<div class="box"><h4>Valor</h4><div class="bigval"><span class="mk">${brl(c.valor)}</span></div><div class="muted" style="font-size:14px;margin-top:8px">${esc(c.valor_rotulo || '')}</div></div>` : ''}
      ${c.numeros?.length ? `<div class="box nums"><h4>Números</h4>${c.numeros.map(n => `<div><span>${esc(n.rotulo)}</span><b>${nb(n.valor)}</b></div>`).join('')}</div>` : ''}`;
    const pratica = c.na_pratica?.length ? `<h2>Na prática</h2><div class="pratica">${c.na_pratica.map(p => { const h = /^([\d.]+)h$/.exec(p.n); const v = h ? +h[1] : 0;
      return `<div class="pr"><b>${esc(p.n.replace('.', ','))}</b><span class="pt">${esc(p.t)}</span>${h ? `<div class="dia" title="O dia tem 24 horas"><i style="width:${Math.min(100, v / 24 * 100)}%"></i>${v > 24 ? `<em style="width:${Math.min(60, (v - 24) / 24 * 100)}%"></em>` : ''}<small>0h</small><small style="right:0">24h</small></div>` : ''}<p>${esc(p.d)}</p></div>`; }).join('')}</div>` : '';
    const m = c.materia || {}, H3 = h => h.replace(/<h2([ >])/g, '<h3$1').replace(/<\/h2>/g, '</h3>');
    const fatos = H3(`${pratica}${(c.o_que_aconteceu || []).flatMap(chunk).map(p => /^[a-z]\) /.test(p) ? `<h4 class="sub">${esc(p)}</h4>` : `<p>${esc(p)}</p>`).join('')}
        ${(c.tabelas || []).map(t => `<div style="margin:var(--s3) 0">${tabela(t)}</div>`).join('')}
        ${sessaoBloco(c.sessao)}${precedenteBloco(c.precedente)}
        ${leituraBloco(c)}${serieCaso(c)}${empenhosBloco(c)}
        ${ev ? `<h2>O que dizem os documentos</h2><p class="muted">Recortes dos documentos originais. O trecho em amarelo é o que sustenta a informação. Toque na imagem para ampliar.</p>${ev}` : ''}
        ${capturasBloco(c)}
        ${c.datas?.length ? `<h2>Linha do tempo do caso</h2><div class="tl">${c.datas.map(d => `<div class="ev"><time>${fmtData(d.data)}</time><span>${esc(d.evento)}</span></div>`).join('')}</div>` : ''}`);
    const envolvidos = H3(`<p>Área: <b>${esc(c.area)}</b>. Unidade responsável: <b>${esc(c.secretaria || 'Prefeitura')}</b>.</p>${ps ? `<div class="people">${ps}</div>` : '<p class="muted">Os documentos não individualizam pessoas neste caso; a responsabilidade é da unidade citada e de quem a geria.</p>'}${ordenadoresBloco(c)}${sociosBloco(c)}`);
    const art = `<div class="prose materia">${M ? nums : ''}
        ${secao(1, 'Introdução', `<p class="intro">${esc(m.intro || c.resumo)}</p>`)}
        ${secao(2, 'O problema', `<p>${esc(m.problema || c.resumo)}</p>`)}
        ${secao(3, 'Quem está envolvido', envolvidos)}
        ${secao(4, 'Os fatos', reviewNotes(c) + fatos)}
        ${secao(5, 'Os direitos atingidos', direitosBloco(m.direitos))}
        ${secao(6, 'O que isso causa à população', `<p>${esc(m.efeitos_coletivos || '')}</p>${(c.por_que_importa || []).flatMap(chunk).map(p => `<p>${esc(p)}</p>`).join('')}`)}
        ${secao(7, 'O que isso causa ao patrimônio público', `<p>${esc(m.efeitos_bem_publico || '')}</p>${c.valor ? `<p>Valor envolvido: <span class="mk">${brl(c.valor)}</span>${c.valor_rotulo ? ' (' + esc(c.valor_rotulo) + ')' : ''}.</p>` : ''}`)}
        ${secao(8, 'Consequências administrativas e jurídicas', `<div class="lei">${String(m.consequencias || '').split('\n').flatMap(chunk).map(p => `<p>${esc(p)}</p>`).join('')}</div>`)}
        ${secao(9, 'Medidas já tomadas e medidas cabíveis', medidasBloco(m))}
    ${secao(10, 'Conclusão crítica', leituraEditorial(c))}
        ${relNot('caso', c.id)}
        ${conferirBloco(c)}
        ${relacionadosBloco(c)}
        <h2>Fontes</h2><ul class="src">${(c.fontes || []).map(f => `<li><span class="tag">${esc(f.tipo || '')}</span>${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titulo)} ↗</a>` : esc(f.titulo)}</li>`).join('')}</ul>
        <p class="note">Indício não é condenação. As pessoas citadas podem apresentar explicações ou documentos; veja <a href="#/sobre">como pedir correção</a> ou <a href="#/denuncie">envie uma informação</a>.</p>
        <div class="pager">${prev ? `<a href="#/caso/${prev.id}"><small>Caso anterior</small>${esc(prev.titulo)}</a>` : '<span></span>'}${next ? `<a href="#/caso/${next.id}"><small>Próximo caso</small>${esc(next.titulo)}</a>` : ''}</div></div>`;
    return `<header class="casehead"><div class="wrap">${M ? `<div class="heroimg">${SCENES.item(c, true)}</div>` : ''}<div class="row"><div class="c8">
      <div class="chips"><a class="chip" href="#/casos">← Casos</a><span class="chip">${esc(c.area)}</span>${M ? '' : `<span class="chip">${esc(c.secretaria || '')}</span>`}<span class="chip">${esc(per(c.periodo))}</span>${stChip(c.status)}</div>
      <h1>${esc(c.titulo)}</h1><p class="lead">${esc(c.resumo)}</p>${M ? E.line : ''}</div>${M ? '' : `<div class="c4 heroimg" style="margin-top:0">${SCENES.item(c, true)}</div>`}</div></div></header>
      <div class="wrap casebody"><div class="row"><article class="c8">${art}</article>
      ${M ? '' : `<aside class="c4 aside">${nums}${E.box}<div class="box toc"><h4>Nesta página</h4><div id="toc"></div></div>${ps ? `<div class="box"><h4>Pessoas citadas</h4><div class="people">${ps}</div></div>` : ''}<div class="box"><h4>Fiscalize</h4><p style="font-size:15px">Confira os documentos e as fontes você mesmo.</p><a class="btn ghost block" href="#/fiscalize">Como fiscalizar</a></div></aside>`}
      </div></div>${M ? E.bar : ''}`;
  }
  function relNot(tipo, id) { const r = NOT.filter(n => (n.casos || []).includes(id)); return r.length ? `<h2>Na imprensa</h2>${M ? r.map(cardNot).join('') : `<div class="grid g2">${r.map(cardNot).join('')}</div>`}` : ''; }
  function chunk(p) { p = String(p); if (p.length < 520) return [p]; const ss = p.split(/(?<=[.!?:])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"(])/); const out = []; let cur = ''; ss.forEach(x => { if ((cur + ' ' + x).length > 420 && cur) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; }); if (cur.trim()) out.push(cur.trim()); return out; }

  /* ---------- NOTÍCIAS ---------- */
  function noticias() {
    const tags = [...new Set(NOT.flatMap(n => n.tags || []))].sort();
    return `<section class="block"><div class="wrap"><div class="kicker">Notícias e análises</div><h1>O que foi noticiado, e o que os documentos mostram</h1>
      <p class="lead">Reunimos o que a imprensa, os órgãos públicos e a própria Prefeitura publicaram sobre Acopiara e cruzamos cada notícia com o dossiê. Primeiro, o fato, com a fonte; depois, a nossa leitura, como oposição que fiscaliza.</p>
      <div class="chips" id="ntag" style="margin:var(--s3) 0"><button class="chip on" data-t="">Todas</button>${tags.map(t => `<button class="chip" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div id="nl">${list(NOT, cardNot)}</div></div></section>`;
  }
  function noticia(id) {
    const n = NOT.find(x => x.id === id); if (!n) return `<section class="block"><div class="wrap"><h1>Notícia não encontrada</h1><a href="#/noticias">Voltar</a></div></section>`;
    const E = engage('noticia/' + id), rel = (n.casos || []).map(i => CASOS.find(c => c.id === i)).filter(Boolean);
    const m = n.materia || {}, H3 = h => h.replace(/<h2([ >])/g, '<h3$1').replace(/<\/h2>/g, '</h3>');
    const sx = n.sessao ? (CASOS.find(c => c.sessao) || {}).sessao : null;
    const fatos = H3(`<p>${esc(n.fato)}</p>${(n.contexto || []).map(p => `<p>${esc(p)}</p>`).join('')}<p class="muted" style="font-size:15px">Fonte: <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.veiculo)}, ${fmtData(n.data)} ↗</a></p>
      ${n.grafico ? `<h2>Os números</h2>${chart(n.grafico)}` : ''}
      ${sessaoBloco(sx)}
      ${n.cruzamentos?.length ? `<h2>O que os documentos oficiais mostram</h2><div class="xgrid">${n.cruzamentos.map((x, i) => `<div class="xcard"><span class="xn">${i + 1}</span><h4>${esc(x.t)}</h4><p>${esc(x.d)}</p><small>Fonte: ${esc(x.fonte)}</small></div>`).join('')}</div>` : ''}
      ${capturasBloco(n)}`);
    const art = `<div class="prose materia">${n.numeros?.length ? `<div class="kpis">${n.numeros.map(k => `<div class="kpi"><b>${nb(k.n)}</b><span>${esc(k.t)}</span></div>`).join('')}</div>` : ''}
      ${secao(1, 'Introdução', `<p class="intro">${esc(m.intro || n.fato)}</p>`)}
      ${secao(2, 'O problema', `<p>${esc(m.problema || '')}</p>`)}
      ${secao(3, 'Quem está envolvido', H3(agentesBloco(n.agentes, 'Agentes públicos')) || '<p class="muted">A notícia não individualiza agentes públicos.</p>')}
      ${secao(4, 'Os fatos', reviewNotes(n) + fatos)}
      ${secao(5, 'Os direitos atingidos', direitosBloco(m.direitos))}
      ${secao(6, 'O que isso causa à população', `<p>${esc(m.efeitos_coletivos || '')}</p>`)}
      ${secao(7, 'O que isso causa ao patrimônio público', `<p>${esc(m.efeitos_bem_publico || '')}</p>`)}
      ${secao(8, 'Consequências administrativas e jurídicas', `<div class="lei"><p>${esc(m.consequencias || '')}</p></div>`)}
      ${secao(9, 'Medidas já tomadas e medidas cabíveis', `${n.perguntas?.length ? `<h3>O que a Prefeitura precisa responder</h3><ul class="q">${n.perguntas.map(q => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}${medidasBloco(m)}`)}
    ${secao(10, 'Conclusão crítica', `<div class="analise">${(n.analise || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>${leituraEditorial(n)}`)}
      ${rel.length ? `<h2>Casos do dossiê ligados</h2>${list(rel, cardCaso, 'g2')}` : ''}
      ${n.documentos?.length ? `<h2>Documentos e onde conferir</h2><ul class="src">${n.documentos.map(d => `<li><a href="${esc(d.u)}" target="_blank" rel="noopener">${esc(d.t)} ↗</a></li>`).join('')}</ul>` : ''}
      <p class="note">Esta página separa o fato, atribuído à fonte, da nossa opinião. Se você é citado e quer se manifestar, veja <a href="#/sobre">como pedir correção</a>.</p></div>`;
    return `<header class="casehead"><div class="wrap">${M ? `<div class="heroimg">${SCENES.item(n, true)}</div>` : ''}<div class="row"><div class="c8">
      <div class="chips"><a class="chip" href="#/noticias">← Notícias</a><span class="chip">${esc(fmtData(n.data))}</span><span class="chip">${esc(n.veiculo)}</span></div>
      <h1>${esc(n.titulo)}</h1>${M ? E.line : ''}</div>${M ? '' : `<div class="c4 heroimg" style="margin-top:0">${SCENES.item(n, true)}</div>`}</div></div></header>
      <div class="wrap casebody"><div class="row"><article class="c8">${art}</article>${M ? '' : `<aside class="c4 aside">${E.box}<div class="box toc"><h4>Nesta página</h4><div id="toc"></div></div><div class="box"><h4>Fonte original</h4><a class="btn ghost block" href="${esc(n.url)}" target="_blank" rel="noopener">Abrir ${esc(n.veiculo)} ↗</a></div></aside>`}</div></div>${M ? E.bar : ''}`;
  }

  /* ---------- LINHA DO TEMPO ---------- */
  function tempo() {
    const evs = CASOS.flatMap(c => (c.datas || []).map(d => ({ ...d, c }))).concat((X.marcos || []).map(m => ({ ...m, c: null }))).sort((a, b) => a.data.localeCompare(b.data));
    let yr = '';
    const items = evs.map(e => { const y = e.data.slice(0, 4); const h = y !== yr ? `<div class="yr">${y}</div>` : ''; yr = y;
      return `${h}<div class="ev" data-a="${esc(e.c ? e.c.area : 'Marco')}" data-t="${esc(norm(e.evento + ' ' + (e.c ? e.c.titulo + JSON.stringify(e.c.pessoas) : '')))}"><time>${fmtData(e.data)}</time> ${e.c ? `<span class="chip">${esc(e.c.area)}</span>` : '<span class="chip st-juizo">Marco</span>'}<div style="margin-top:6px">${esc(e.evento)}</div>${e.c ? `<a href="#/caso/${e.c.id}" style="font-size:14px">${esc(e.c.titulo)} →</a>` : ''}</div>`; }).join('');
    return `<section class="block"><div class="wrap"><div class="kicker">Cronologia</div><h1>Linha do tempo</h1>
      <p class="lead">Todos os fatos datados do dossiê, em ordem. Use os filtros para ver uma área ou uma pessoa.</p>
      <h2 style="margin-top:var(--s5)">Como o dinheiro anda</h2><p>O caminho que todo recurso público percorre, e em que ponto de cada etapa os documentos de Acopiara mostram falhas.</p>
      ${M ? fluxoM() : fluxo()}
      <div class="filters" style="grid-template-columns:2fr 1fr"><input id="tq" type="search" placeholder="Filtrar por nome, empresa, palavra…"><select id="ta"><option value="">Todas as áreas</option>${areas().map(a => `<option>${esc(a.nome)}</option>`).join('')}</select></div>
      <div class="tl" id="tl">${items}</div></div></section>`;
  }
  function fluxoM() { return `<div class="recs" style="margin:var(--s3) 0">${(X.fluxo || []).map((e, i) => `<div class="rec"><div class="h">${i + 1}. ${esc(e.etapa)}</div><p style="font-size:15px;margin-bottom:8px">${esc(e.descricao)}</p><p style="font-size:14px;color:var(--alerta);margin:0">⚠ ${esc(e.falha || '')}</p></div>`).join('')}</div>`; }
  function fluxo() {
    const et = X.fluxo || [];
    return `<ol class="fluxo" aria-label="Caminho do dinheiro público">${et.map((e, i) => `<li><div class="fx"><span class="fn">${i + 1}</span><h4>${esc(e.etapa)}</h4><p>${esc(e.descricao)}</p></div><p class="ff">⚠ ${esc(e.falha || '')}</p></li>`).join('')}</ol>`;
  }
  function wrapSvg(t, n) { const ws = String(t).split(' '), out = []; let c = ''; ws.forEach(w => { if ((c + ' ' + w).trim().length > n) { out.push(c.trim()); c = w; } else c += ' ' + w; }); if (c.trim()) out.push(c.trim()); return out; }

  /* ---------- DINHEIRO: o que chega × o que vira serviço ---------- */
  function dinheiro() {
    const d = X.dinheiro || { linhas: [] }, D = DIN || {};
    const tot = d.linhas.reduce((a, l) => ({ r: a.r + l.recebido, p: a.p + l.pago, g: a.g + l.lacuna }), { r: 0, p: 0, g: 0 });
    const comb = (D.combustivel || []).filter(r => r.prod === 'DIESEL S10'), acima = comb.filter(r => r.dif > 0), excesso = acima.reduce((a, r) => a + r.dif, 0), abaixo = -comb.filter(r => r.dif < 0).reduce((a,r)=>a+r.dif,0), saldo = excesso - abaixo;
    const gen = Object.entries(D.genericos || {}), genTot = gen.reduce((a, g) => a + g[1].total, 0);
    const est = D.estado || [], estTot = est.reduce((a, e) => a + e.valor, 0);
    const uniao = M ? `<div class="recs">${d.linhas.map(l => `<div class="rec"><div class="h">${esc(l.area)}</div><div class="muted" style="font-size:13px;margin-bottom:8px">${esc(l.recurso)}</div><dl><dt>Recebido</dt><dd>${brl(l.recebido)}</dd><dt>Pago</dt><dd>${brl(l.pago)}</dd><dt>Sem registro</dt><dd><b>${brl(l.lacuna)}</b></dd></dl>${l.equivale ? `<p style="font-size:14px;margin:10px 0 0">${esc(l.equivale)}</p>` : ''}</div>`).join('')}</div>`
      : `<div class="tscroll"><table class="t"><thead><tr><th>Área e recurso</th><th class="num">Recebido</th><th class="num">Pago</th><th class="num">Sem registro de gasto</th><th style="min-width:160px">Proporção</th><th>Isso daria para…</th></tr></thead><tbody>
      ${d.linhas.map(l => `<tr><td><b>${esc(l.area)}</b><br><span class="muted">${esc(l.recurso)}</span></td><td class="num">${brl(l.recebido)}</td><td class="num">${brl(l.pago)}</td><td class="num"><b>${brl(l.lacuna)}</b></td><td><div class="bar"><i style="width:${(100 * l.pago / l.recebido).toFixed(1)}%"></i></div><div class="muted" style="font-size:12px;margin-top:4px">${Math.round(100 * l.pago / l.recebido)}% aplicado</div></td><td>${esc(l.equivale || '')}</td></tr>`).join('')}</tbody></table></div>`;
    return `<section class="block"><div class="wrap"><div class="kicker">O dinheiro</div><h1>O que chega a Acopiara, e o que chega à população</h1>
      <p class="lead">A União e o Estado destinam recursos para saúde, educação, assistência e obras. Esta página confronta repasses com pagamentos identificados, compara o preço do diesel com uma referência regional e mostra compras sem descrição suficiente dos itens. Na consulta por fornecedor, distingue a reserva bruta, as anulações, o empenhado líquido e os pagamentos.</p>
      <div class="kpis" style="margin-top:var(--s4)"><div class="kpi"><b>${fmtN(tot.g)}</b><span>da União sem gasto registrado com a fonte correspondente (jan./2025 a set./2026)</span></div><div class="kpi"><b>${fmtN(saldo)}</b><span>saldo da comparação do diesel com a referência de Iguatu; ${acima.length} de ${comb.length} meses ficaram acima</span></div><div class="kpi"><b>${fmtN(genTot)}</b><span>em notas fiscais sem item identificado: remédios "de A a Z", peças e materiais "diversos"</span></div></div>
      <nav class="chips" style="margin:var(--s2) 0 var(--s4)"><a class="chip" href="#/dinheiro" data-jump="d-uniao">1. União</a><a class="chip" href="#/dinheiro" data-jump="d-estado">2. Estado</a><a class="chip" href="#/dinheiro" data-jump="d-preco">3. Comparação do diesel</a><a class="chip" href="#/dinheiro" data-jump="d-gen">4. Compras sem item</a><a class="chip" href="#/dinheiro" data-jump="d-forn">5. Fornecedores e pagamentos</a></nav>
      <div class="prose" style="max-width:none">
      <h2 id="d-uniao">1. O que a União mandou e o que foi aplicado</h2><p>${esc(d.intro)}</p>
      ${chartBars({ titulo: 'Recebido da União × pago com o mesmo recurso (R$, jan./2025 a set./2026)', dados: [['Recebido', tot.r], ['Pago com a fonte correspondente', tot.p], ['Sem gasto registrado', tot.g]] })}
      ${uniao}<p class="note">${esc(d.nota)}</p>
      ${(d.textos || []).map(t => `<h3 style="margin-top:var(--s3)">${esc(t.titulo)}</h3>${t.paragrafos.map(p => `<p>${esc(p)}</p>`).join('')}`).join('')}
      <div class="concl"><span class="tag">Nossa leitura</span><p>A diferença de ${fmtN(tot.g)} entre repasses e pagamentos identificados exige conciliação por programa e fonte. Ela não é saldo bancário nem prova de desvio ou disponibilidade livre: pode envolver saldo anterior, prazo de execução, classificação ou relançamento. Extratos, restos a pagar e registros da execução devem mostrar o destino de cada recurso.</p></div>

      <h2 id="d-estado">2. Convênios e repasses registrados do Estado</h2><p>Valores pactuados em convênios e repasses estaduais registrados pelo Município no Tribunal de Contas: ${fmtN(estTot)} em transporte escolar, saúde, educação e obras. O valor pactuado não demonstra, sozinho, liberação integral ou pagamento; é necessário conferir as parcelas efetivamente transferidas.</p>
      </div><div class="estcards">${est.map(e => `<div class="est"><span class="muted" style="font-size:12.5px">${fmtData(e.data)} · ${esc(e.orgao)}</span><div class="v">${brl(e.valor)}</div><div class="o">${esc(e.objeto)}</div><p>${esc(e.nota)}</p>${e.caso ? `<a href="#/caso/${e.caso}" style="font-size:14px;margin-top:auto">Ver o caso relacionado →</a>` : ''}</div>`).join('')}</div>
      <div class="prose" style="max-width:none">
      <div class="concl" style="margin-top:var(--s3)"><span class="tag">Nossa leitura</span><p>O Estado paga transporte, saúde e obras em Acopiara, mas os planos de trabalho e as prestações de contas desses convênios não estão no portal da Prefeitura. Quem paga a conta, a população, tem o direito de ver obra por obra e repasse por repasse.</p></div>

      <h2 id="d-preco">3. Diesel: comparação com a referência de Iguatu</h2>
      <p>Cruzamos as notas fiscais de combustível informadas ao TCE-CE com o preço médio que a ANP coleta nos postos de Iguatu, a cidade pesquisada mais próxima. Em ${acima.length} de ${comb.length} meses de diesel, a média das notas ficou acima da referência: as diferenças positivas somam ${brl(excesso)}. Nos meses abaixo, a diferença no sentido contrário soma ${brl(abaixo)}; o saldo da comparação é ${brl(saldo)}. Essa conta regional não prova, por si, sobrepreço ou dano; requer confrontar produto, amostra e condições do contrato.</p>
      ${chartComb()}
      ${M ? '' : `<div class="tscroll"><table class="t"><thead><tr><th>Mês</th><th class="num">Litros</th><th class="num">Preço pago (R$/l)</th><th class="num">Bomba em Iguatu (R$/l)</th><th class="num">Diferença no mês</th></tr></thead><tbody>${comb.map(r => `<tr><td>${r.mes.slice(5)}/${r.mes.slice(0, 4)}</td><td class="num">${r.litros.toLocaleString('pt-BR')}</td><td class="num">${r.pago_medio.toFixed(2).replace('.', ',')}</td><td class="num">${r.iguatu.toFixed(2).replace('.', ',')}</td><td class="num" style="color:${r.dif > 0 ? 'var(--alerta)' : 'var(--ok)'}"><b>${r.dif > 0 ? '+' : ''}${brl(r.dif)}</b></td></tr>`).join('')}</tbody></table></div>`}
      <p class="note">Referência de varejo: a ANP não pesquisa Acopiara. A comparação utiliza a média de Iguatu e não substitui a análise de logística, condições de fornecimento e representatividade da amostra. As médias e diferenças da série estão arredondadas.</p>
      <div class="concl"><span class="tag">Nossa leitura</span><p>De junho de 2025 a fevereiro de 2026, as médias municipais ficaram próximas de R$ 6,48 em boa parte do período, com R$ 6,59 em novembro e R$ 6,498 em julho. A revisão deve examinar as cláusulas e as condições de execução, as oscilações de mercado e os pedidos de recomposição, sem tratar uma média regional como prova suficiente de prejuízo.</p></div>

      <h2 id="d-gen">4. Compras que ninguém consegue conferir</h2>
      <p>Para saber se um preço é justo, é preciso saber o que foi comprado. Em parte das notas fiscais informadas ao Tribunal de Contas, o item é descrito de forma genérica, sem nome do remédio, da peça ou do material. Assim, não há como comparar com tabelas oficiais, como a de preços máximos de medicamentos (CMED).</p>
      ${chartBars({ titulo: 'Notas fiscais com item genérico (R$, jan./2025 a set./2026)', dados: gen.map(g => [g[0], g[1].total]) })}
      ${gen.map(g => `<p><b>${esc(g[0])}:</b> ${g[1].forn.slice(0, 4).map(f => `${esc(f[0])} (${fmtN(f[1])})`).join('; ')}.</p>`).join('')}
      <div class="concl"><span class="tag">Nossa leitura</span><p>Comprar "medicamentos de A a Z" ou "peças e demais componentes" sem dizer quais é comprar no escuro. A nota fiscal precisa identificar cada item, quantidade e preço. Sem isso, superfaturamento não pode ser descartado, e o ônus de provar que o preço foi justo é da Prefeitura.</p></div>

      <h2 id="d-forn">5. Empenhos e pagamentos por fornecedor</h2>
      <p>Empresas e pessoas com notas no recorte de janeiro de 2025 a setembro de 2026, sem folha, impostos e repasses entre órgãos. O total em destaque é o empenhado líquido; abra a composição para ver o bruto, as anulações parciais e os pagamentos válidos ligados às mesmas notas. Pesquise por nome, área ou contratação.</p></div>
      <div class="filters" style="grid-template-columns:2fr 1fr 1fr"><input id="dq" type="search" placeholder="Empresa, objeto, CNPJ…"><select id="da"><option value="">Todas as áreas</option>${[...new Set((D.fornecedores || []).map(f => f.area))].sort().map(a => `<option>${esc(a)}</option>`).join('')}</select><select id="dm"><option value="">Qualquer forma de contratação</option>${[...new Set((D.fornecedores || []).map(f => f.modo))].sort().map(a => `<option>${esc(a)}</option>`).join('')}</select></div>
      <div class="count" id="dc"></div><div id="dl"></div><div class="btns" style="margin-top:var(--s2)"><button class="btn ghost" id="dmore">Mostrar mais</button></div>
      <p class="note">Fonte: TCE-CE, Sistema de Informações Municipais (SIM), notas de jan./2025 a set./2026. Empenhos totalmente anulados foram excluídos; as anulações parciais até 30/09/2026 foram descontadas. Pagamentos estornados foram excluídos. Reserva líquida e pagamento são valores diferentes; o pagamento pode ocorrer em outra competência.</p>
      </div></section>`;
  }
  function bindDin() {
    $$('[data-jump]').forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); });
    const F = DIN.fornecedores || []; let lim = 30;
    const run = () => {
      const q = norm($('#dq').value), a = $('#da').value, m = $('#dm').value;
      const r = F.filter(f => (!a || f.area === a) && (!m || f.modo === m) && (!q || norm(f.nome + ' ' + f.objeto).includes(q)));
      $('#dc').textContent = `${r.length} fornecedores · ${brlAud(r.reduce((s, f) => s + f.total, 0))} em empenhos líquidos`;
      const v = r.slice(0, lim);
      $('#dl').innerHTML = M ? `<div class="recs">${v.map(f => `<div class="rec"><div class="h">${esc(f.nome)}</div><dl><dt>Composição</dt><dd>${financialDetail(f.financeiro)}</dd><dt>2025</dt><dd>${brl(f.a2025)}</dd><dt>2026</dt><dd>${brl(f.a2026)}</dd><dt>Área</dt><dd>${esc(f.area)}</dd><dt>Contratação</dt><dd>${esc(f.modo)}</dd></dl><p class="muted" style="font-size:13px;margin:8px 0 0">${esc(f.objeto)}</p></div>`).join('')}</div>`
        : `<div class="tscroll"><table class="t"><thead><tr><th>Fornecedor</th><th>Reserva e pagamento</th><th class="num">2025 (líquido)</th><th class="num">2026 (líquido)</th><th>Área</th><th>Contratação</th><th>Maior empenho: objeto</th></tr></thead><tbody>${v.map(f => `<tr><td><b>${esc(f.nome)}</b><br><span class="muted" style="font-size:12.5px">${f.n} empenho${f.n > 1 ? 's' : ''}</span></td><td>${financialDetail(f.financeiro)}</td><td class="num">${brl(f.a2025)}</td><td class="num">${brl(f.a2026)}</td><td>${esc(f.area)}</td><td>${esc(f.modo)}</td><td style="font-size:13px">${esc(f.objeto)}</td></tr>`).join('')}</tbody></table></div>`;
      $('#dmore').hidden = r.length <= lim;
    };
    $('#dmore').onclick = () => { lim += 50; run(); };
    ['#dq', '#da', '#dm'].forEach(i => $(i).addEventListener('input', () => { lim = 30; run(); }));
    run();
  }

  /* ---------- PESSOAS ---------- */
  function todasPessoas() {
    const m = {};
    CASOS.forEach(c => (c.pessoas || []).forEach(p => { (m[p.nome] = m[p.nome] || { nome: p.nome, papeis: new Set(), casos: [] }); m[p.nome].papeis.add(p.papel); if (!m[p.nome].casos.includes(c)) m[p.nome].casos.push(c); }));
    (X.pessoas_extra || []).forEach(p => { (m[p.nome] = m[p.nome] || { nome: p.nome, papeis: new Set(), casos: [] }); m[p.nome].papeis.add(p.papel); });
    PERF.forEach(p => { (m[p.nome] = m[p.nome] || { nome: p.nome, papeis: new Set(), casos: [] }); m[p.nome].papeis.add(p.cargo); (p.casos || []).forEach(id => { const c = CASOS.find(x => x.id === id); if (c && !m[p.nome].casos.includes(c)) m[p.nome].casos.push(c); }); });
    return Object.values(m).sort((a, b) => b.casos.length - a.casos.length || a.nome.localeCompare(b.nome));
  }
  // separa "22 meses; média R$ 14.205, máximo R$ 17.500 (na folha em out./2026)" em colunas
  function salCols(s) {
    const t = String(s); const me = /^(\d+) meses?/.exec(t), md = /média R\$ ([\d.]+)/.exec(t), mx = /máximo R\$ ([\d.]+)/.exec(t), sit = /\(([^)]*)\)\s*$/.exec(t), per2 = /meses? \(([^)]*)\)/.exec(t);
    return { meses: me ? me[1] + (per2 ? ` (${per2[1]})` : '') : '', media: md ? 'R$ ' + md[1] : '', maximo: mx ? 'R$ ' + mx[1] : '', sit: sit ? sit[1] : '', extra: /dois vínculos/.test(t) ? 'dois vínculos simultâneos' : '' };
  }
  function salTabela() {
    const s = X.salarios || { linhas: [] };
    const rows = s.linhas.map(r => { const f = salCols(r[2]); return [r[0], r[1], f.meses + (f.extra ? '; ' + f.extra : ''), f.media, f.maximo, f.sit, r[3], r[4], r[5]]; });
    return tabela([['Profissional', 'Cargo', 'Meses na folha', 'Média mensal', 'Máximo', 'Situação', 'Horas em Acopiara', 'Horas em outras cidades', 'Total semanal'], ...rows], { id: 'stb', data: 1 });
  }
  function avatar(p) { return p.foto ? `<img class="avatar" src="${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" loading="lazy">` : `<div class="avatar" aria-hidden="true">${initials(p.nome)}</div>`; }
  function initials(n) { const p = n.split(' ').filter(w => w.length > 2); return (p[0][0] + (p[p.length - 1] || ' ')[0]).toUpperCase(); }
  function pessoas() {
    const P = todasPessoas(); const s = X.salarios || { linhas: [] };
    const linhas = P.map(p => [p.nome, [...p.papeis].filter(Boolean).join('; '), p.casos.length]);
    const tab = M ? `<div class="recs" id="pt">${P.map(p => `<a class="rec" style="text-decoration:none;color:inherit" href="#/pessoa/${encodeURIComponent(p.nome)}" data-t="${esc(norm(p.nome + ' ' + [...p.papeis].join(' ')))}" data-qtd="${p.casos.length}"><div class="h">${esc(p.nome)}</div><div class="muted" style="font-size:14px">${esc([...p.papeis].filter(Boolean).join('; '))}</div><div style="font-size:13px;margin-top:6px">${p.casos.length} caso${p.casos.length === 1 ? '' : 's'}</div></a>`).join('')}</div>`
      : `<div class="tscroll"><table class="t" id="pt"><thead><tr><th>Nome</th><th>Papel nos documentos</th><th>Casos</th></tr></thead><tbody>${P.map(p => `<tr data-t="${esc(norm(p.nome + ' ' + [...p.papeis].join(' ')))}" data-qtd="${p.casos.length}"><td><a href="#/pessoa/${encodeURIComponent(p.nome)}"><b>${esc(p.nome)}</b></a></td><td>${esc([...p.papeis].filter(Boolean).join('; '))}</td><td>${p.casos.map(c => `<a href="#/caso/${c.id}">${esc(c.titulo)}</a>`).join('<br>')}</td></tr>`).join('')}</tbody></table></div>`;
    return `<section class="block"><div class="wrap"><div class="kicker">Pessoas</div><h1>Quem aparece nos documentos</h1>
      <p class="lead">Agentes públicos, empresas e pessoas citadas nos atos oficiais, com os casos em que aparecem. Aparecer aqui não significa culpa.</p>
      ${PERF.length ? `<h2 style="margin-top:var(--s5)">Quem decide</h2><div class="grid ${M ? '' : 'g3'}" style="margin-bottom:var(--s5)">${PERF.map(p => `<a class="card" href="#/pessoa/${encodeURIComponent(p.nome)}"><div class="body"><div class="perfil">${avatar(p)}<div><h3 style="font-size:17px">${esc(p.nome)}</h3><div class="meta" style="margin-top:6px">${esc(p.cargo)}</div></div></div><p style="margin-top:12px">${esc(p.bio.length > 160 ? p.bio.slice(0, p.bio.lastIndexOf(' ', 150)) + '…' : p.bio)}</p></div></a>`).join('')}</div>` : ''}
      <h2>Todos os citados</h2>
      <div class="filters" style="grid-template-columns:2fr 1fr"><input id="pq" type="search" placeholder="Buscar por nome ou cargo…"><select id="pc"><option value="">Todos</option><option value="1">Com mais de um caso</option></select></div>
      ${tab}
      <h2 style="margin-top:var(--s5)" id="salarios">${esc(s.titulo)}</h2>${(s.intro || []).map(p => `<p>${esc(p)}</p>`).join('')}
      <input id="sq" class="field" type="search" placeholder="Filtrar por nome, cidade, cargo…" style="margin:var(--s1) 0 var(--s2)">
      ${salTabela()}<p class="note">${esc(s.nota)}</p></div></section>`;
  }
  function pessoa(nome) {
    const p = todasPessoas().find(x => x.nome === nome), pf = PERF.find(x => x.nome === nome);
    if (!p) return `<section class="block"><div class="wrap"><h1>Pessoa não encontrada</h1><a href="#/pessoas">Voltar</a></div></section>`;
    const sal = (X.salarios?.linhas || []).filter(r => norm(r[0]) === norm(nome));
    const lado = pf ? `<div class="box"><h4>Contatos oficiais</h4>${pf.contatos.map(c => `<a class="btn ghost block" style="margin-bottom:8px" href="${esc(c.u)}" target="_blank" rel="noopener">${esc(c.t)} ↗</a>`).join('')}<p class="muted" style="font-size:13px;margin:8px 0 0">Publicamos só canais institucionais. Telefones e endereços pessoais não são divulgados.</p></div>` : '';
    return `<section class="block"><div class="wrap"><div class="chips"><a class="chip" href="#/pessoas">← Pessoas</a></div>
      <div class="row" style="margin-top:var(--s3)"><div class="c8">
      <div class="perfil">${avatar(pf || p)}<div><h1 style="font-size:clamp(28px,3.4vw,40px);margin-bottom:8px">${esc(p.nome)}</h1><p class="lead" style="margin:0">${esc(pf ? pf.cargo + (pf.partido ? ' · ' + pf.partido : '') : [...p.papeis].filter(Boolean).join('; '))}</p></div></div>
      <div class="prose" style="margin-top:var(--s4)">
      ${pf ? `<h2>Quem é</h2><p>${esc(pf.bio)}</p>${financialSummary(pf.gestao?.financeiro)}${pf.historico?.length ? `<h2>Cargos e funções</h2><ul class="q">${pf.historico.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}<h2>O que assinou ou decidiu nos documentos</h2><p>${esc(pf.atos)}</p>
        ${pf.declaracoes?.length ? `<h2>O que disse publicamente</h2>${pf.declaracoes.map(d => `<p><b>${fmtData(d.data)}.</b> ${esc(d.texto)} <a href="${esc(d.url)}" target="_blank" rel="noopener">Fonte ↗</a></p>`).join('')}` : ''}` : ''}
      ${sal.length ? `<h2>Vínculos e jornada (indício a apurar)</h2>${sal.map(r => `<div class="box"><div class="nums">${X.salarios.colunas.map((c, i) => `<div><span>${esc(c)}</span><b>${nb(r[i])}</b></div>`).join('')}</div></div>`).join('')}` : ''}
      <h2>Casos em que aparece</h2>${p.casos.length ? list(p.casos, cardCaso, 'g2') : '<p>Citado em tabela de vínculos ou em ato oficial.</p>'}
      <p class="note">Aparecer em um documento oficial não significa ter cometido irregularidade. Correções e manifestações: veja <a href="#/sobre">Sobre</a>.</p></div></div>
      <aside class="c4 aside">${lado}</aside></div></div></section>`;
  }

  /* ---------- FISCALIZE ---------- */
  function fiscalize() {
    return `<section class="block"><div class="wrap"><div class="row"><div class="c8"><div class="kicker">Fiscalize você também</div><h1>Como conferir tudo isso sozinho</h1>
      <p class="lead">${esc(X.fiscalize_intro)}</p>${pageShareButton('fiscalize', '', 'Compartilhar este guia')}
      <div style="margin-top:var(--s4)">${(X.tutoriais || []).map((t, i) => `<details class="tut" id="tut-${i}"><summary><span class="n">${i + 1}</span>${esc(t.titulo)}</summary><div class="in">
        <p>${esc(t.para_que)}</p>${t.link ? `<p><a class="btn azul" href="${esc(t.link)}" target="_blank" rel="noopener">Abrir ${esc(t.site)} ↗</a></p>` : ''}
        <ol>${t.passos.map(s => `<li>${esc(s)}</li>`).join('')}</ol>${t.dica ? `<p class="lei"><b>Dica:</b> ${esc(t.dica)}</p>` : ''}${pageShareButton('fiscalize', i, 'Compartilhar este passo a passo')}</div></details>`).join('')}</div></div>
      <aside class="c4 aside"><div class="box"><h4>Pesquise nos portais</h4><p style="font-size:15px">A busca do site também procura nos portais oficiais.</p><button class="btn solid block" data-open-search>${ic('busca')}Pesquisar</button></div></aside></div></div></section>`;
  }

  /* ---------- DENUNCIE ---------- */
  function denuncie() {
    const ar = [...new Set(CASOS.map(c => c.area))].sort();
    return `<section class="block"><div class="wrap"><div class="row"><div class="c8"><div class="kicker">Participe</div><h1>Envie uma denúncia, reclamação ou notícia</h1>
      <p class="lead">Viu algo errado no serviço público de Acopiara? Recebeu um "não tem vaga" que não fez sentido? Tem um documento, uma foto ou uma data? Conte aqui. Você pode enviar sem se identificar.</p>
      <form class="form" id="fden" novalidate style="margin-top:var(--s4)">
        <div class="two"><div><label class="lb" for="d-tipo">O que você quer enviar</label><select class="field" id="d-tipo" name="tipo"><option value="denuncia">Denúncia</option><option value="reclamacao">Reclamação de serviço</option><option value="noticia">Notícia ou informação</option><option value="correcao">Pedido de correção</option><option value="outro">Outro</option></select></div>
        <div><label class="lb" for="d-area">Área</label><select class="field" id="d-area" name="area"><option value="">Escolha</option>${ar.map(a => `<option>${esc(a)}</option>`).join('')}<option>Outra</option></select></div></div>
        <div class="two"><div><label class="lb" for="d-local">Onde aconteceu</label><input class="field" id="d-local" name="local" placeholder="Bairro, distrito, posto, escola…"></div>
        <div><label class="lb" for="d-quando">Quando</label><input class="field" id="d-quando" name="quando" placeholder="Data ou período"></div></div>
        <div><label class="lb" for="d-texto">O que aconteceu</label><textarea class="field" id="d-texto" name="texto" required minlength="30" placeholder="Descreva o fato com o máximo de detalhes: o que, quem (cargo ou setor), quando, onde, como você sabe."></textarea></div>
        <div><label class="lb" for="d-links">Links de documentos, fotos ou publicações (opcional)</label><input class="field" id="d-links" name="links" placeholder="Cole links do Google Drive, Diário Oficial, redes sociais…"></div>
        <label class="check"><input type="checkbox" id="d-anon" name="anonimo" checked> Enviar de forma anônima</label>
        <div id="d-cont" hidden><label class="lb" for="d-contato">Como podemos falar com você (opcional)</label><input class="field" id="d-contato" name="contato" placeholder="E-mail ou telefone"></div>
        <input type="text" name="site" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
        <div class="alert"><b>Antes de enviar:</b> não escreva dados de saúde, documentos ou endereço de terceiros sem necessidade. Tudo o que chega é conferido com documentos públicos antes de qualquer publicação, e quem é citado pode se manifestar. Informação falsa dada de má-fé pode ser crime (Código Penal, art. 339).</div>
        <div class="btns"><button class="btn solid" type="submit">Enviar</button></div><div id="d-res" aria-live="polite"></div>
      </form></div>
      <aside class="c4 aside"><div class="box"><h4>Urgência ou crime em andamento</h4><p style="font-size:15px">Procure diretamente os canais oficiais. Este site não substitui a polícia nem o Ministério Público.</p>
        <a class="btn ghost block" style="margin-bottom:8px" href="https://www.mpce.mp.br/ouvidoria/" target="_blank" rel="noopener">Ouvidoria do MPCE ↗</a><a class="btn ghost block" style="margin-bottom:8px" href="https://www.tce.ce.gov.br/ouvidoria" target="_blank" rel="noopener">Ouvidoria do TCE-CE ↗</a><a class="btn ghost block" href="https://falabr.cgu.gov.br/" target="_blank" rel="noopener">Fala.BR (verba federal) ↗</a></div>
        <div class="box"><h4>Seus direitos</h4><p style="font-size:15px">Denunciar irregularidade é direito de todo cidadão, e a lei protege a identidade de quem informa (Lei 13.608/2018).</p><a class="btn ghost block" href="#/direitos">Questionar não é crime</a></div></aside></div></div></section>`;
  }
  function bindDen() {
    const f = $('#fden'); $('#d-anon').onchange = e => $('#d-cont').hidden = e.target.checked;
    f.onsubmit = async e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f)); d.anonimo = $('#d-anon').checked; const out = $('#d-res');
      if ((d.texto || '').trim().length < 30) { out.innerHTML = '<div class="alert err">Descreva o fato com pelo menos 30 caracteres.</div>'; return; }
      $('button[type=submit]', f).disabled = true; out.innerHTML = '<p class="muted">Enviando…</p>';
      const r = await API.denuncia(d);
      out.innerHTML = r.protocolo ? `<div class="alert ok"><b>Recebido.</b> Seu protocolo é <b>${esc(r.protocolo)}</b>. Guarde-o para acompanhar ou complementar.</div>` : `<div class="alert err">${esc(r.erro || 'Não foi possível enviar.')} Se preferir, use a Ouvidoria do Ministério Público.</div>`;
      if (r.protocolo) f.reset(); $('button[type=submit]', f).disabled = false;
    };
  }

  /* ---------- SOBRE ---------- */
  function sobre() {
    return `<section class="block"><div class="wrap"><div class="row"><div class="c8"><div class="kicker">Sobre o projeto</div><h1>${esc(X.sobre?.titulo)}</h1>
      <div class="prose">${(X.sobre?.secoes || []).map(s => `<h2>${esc(s.titulo)}</h2>${s.paragrafos.map(p => `<p>${esc(p)}</p>`).join('')}`).join('')}
      <h2>Linha editorial</h2><p>Nossos princípios, metas e a estrutura que toda matéria segue estão em <a href="#/editorial">Linha editorial</a>.</p><h2>Correções e direito de resposta</h2><p>Se você é citado, encontrou um erro ou tem um documento que muda a leitura de um caso, envie pelo <a href="#/denuncie">formulário</a>, escolhendo "Pedido de correção". A manifestação é analisada e, quando procedente, o caso é corrigido com registro da data.</p></div></div></div></div></section>`;
  }

  /* ---------- BUSCA ---------- */
  let IDX = null;
  function index() {
    if (IDX) return IDX;
    const it = [];
    CASOS.forEach(c => it.push({ tipo: 'Caso', titulo: c.titulo, sub: c.resumo, href: '#/caso/' + c.id, area: c.area, ano: c.periodo?.inicio?.slice(0, 4), fim: (c.periodo?.fim || c.periodo?.inicio || '').slice(0, 4), status: c.status, t: norm([c.titulo, c.resumo, c.area, c.secretaria, (c.o_que_aconteceu || []).join(' '), JSON.stringify(c.tabelas || []), (c.pessoas || []).map(p => p.nome + ' ' + p.papel).join(' ')].join(' ')), tt: norm(c.titulo) }));
    NOT.forEach(n => it.push({ tipo: 'Notícia', titulo: n.titulo, sub: n.veiculo + ' · ' + fmtData(n.data), href: '#/noticia/' + n.id, area: (n.tags || [])[0], ano: n.data.slice(0, 4), fim: n.data.slice(0, 4), t: norm([n.titulo, n.fato, n.analise.join(' '), n.veiculo, (n.tags || []).join(' ')].join(' ')), tt: norm(n.titulo) }));
    todasPessoas().forEach(p => it.push({ tipo: 'Pessoa', titulo: p.nome, sub: [...p.papeis].filter(Boolean).join('; '), href: '#/pessoa/' + encodeURIComponent(p.nome), t: norm(p.nome + ' ' + [...p.papeis].join(' ')), tt: norm(p.nome) }));
    (X.tutoriais || []).forEach((t, i) => it.push({ tipo: 'Tutorial', titulo: t.titulo, sub: t.para_que, href: '#/fiscalize', t: norm(t.titulo + ' ' + t.para_que + ' ' + t.passos.join(' ')), tt: norm(t.titulo) }));
    CASOS.forEach(c => (c.datas || []).forEach(d => it.push({ tipo: 'Data', titulo: fmtData(d.data) + ' · ' + d.evento, sub: c.titulo, href: '#/caso/' + c.id, area: c.area, ano: d.data.slice(0, 4), fim: d.data.slice(0, 4), t: norm(d.evento + ' ' + c.titulo), tt: norm(d.evento) })));
    return IDX = it;
  }
  const EXT = [
    ['Portal da Transparência (União)', q => 'https://portaldatransparencia.gov.br/busca?termo=' + encodeURIComponent(q)],
    ['PNCP: contratações', q => 'https://pncp.gov.br/app/editais?q=' + encodeURIComponent(q + ' Acopiara')],
    ['Diário Oficial dos Municípios', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:diariomunicipal.com.br/aprece Acopiara "' + q + '"')],
    ['Site da Prefeitura', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:acopiara.ce.gov.br "' + q + '"')],
    ['Câmara Municipal', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:camaraacopiara.ce.gov.br "' + q + '"')],
    ['TCE-CE', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:tce.ce.gov.br Acopiara "' + q + '"')],
    ['Ministério Público (MPCE)', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:mpce.mp.br Acopiara "' + q + '"')],
    ['Ceará Transparente', q => 'https://www.google.com/search?q=' + encodeURIComponent('site:cearatransparente.ce.gov.br Acopiara "' + q + '"')],
    ['Querido Diário', q => 'https://queridodiario.ok.org.br/pesquisa?term=' + encodeURIComponent(q)],
  ];
  function openSearch(q0) {
    const m = $('#modal'), ar = areas().map(a => a.nome), anos = ['2025', '2026'];
    m.innerHTML = `<div class="in" role="dialog" aria-label="Pesquisar"><div class="mh"><h3>Pesquisar</h3><button class="ibtn" data-x aria-label="Fechar">${ic('x')}</button></div><div class="mb">
      <div class="search-in"><input class="field" id="sq0" aria-label="Pesquisar no dossiê" type="search" placeholder="Nome, empresa, valor, assunto…" value="${esc(q0 || '')}" autocomplete="off"></div>
      <details style="margin-top:12px"><summary style="cursor:pointer;font-weight:600;font-size:14px">Pesquisa avançada</summary><div class="adv">
        <select class="field" id="sq-tipo" aria-label="Tipo de conteúdo"><option value="">Tudo</option><option>Caso</option><option>Notícia</option><option>Pessoa</option><option>Tutorial</option><option>Data</option></select>
        <select class="field" id="sq-area" aria-label="Área"><option value="">Todas as áreas</option>${ar.map(a => `<option>${esc(a)}</option>`).join('')}</select>
        <select class="field" id="sq-ano" aria-label="Período"><option value="">Todo o período</option>${anos.map(a => `<option>${a}</option>`).join('')}</select>
        <select class="field" id="sq-st" aria-label="Situação"><option value="">Qualquer situação</option><option>comprovado</option><option>indício a apurar</option><option>em juízo</option></select>
      </div><label class="check" style="margin-top:12px"><input type="checkbox" id="sq-exato"> Frase exata</label></details>
      <div id="sq-res" class="res" aria-live="polite"></div><div id="sq-ext"></div></div></div>`;
    openLayer(m); const inp = $('#sq0'); inp.focus({ preventScroll: true });
    const run = () => {
      const raw = inp.value.trim(), q = norm(raw), ex = $('#sq-exato').checked, tipo = $('#sq-tipo').value, area = $('#sq-area').value, ano = $('#sq-ano').value, st = $('#sq-st').value;
      const toks = ex ? [q] : q.split(/\s+/).filter(Boolean);
      let r = index().filter(x => (!tipo || x.tipo === tipo) && (!area || x.area === area) && (!ano || (x.ano && x.ano <= ano && (x.fim || x.ano) >= ano)) && (!st || x.status === st) && toks.every(t => x.t.includes(t)));
      r = r.map(x => ({ x, s: toks.reduce((a, t) => a + (x.tt.includes(t) ? 5 : 0) + (x.t.split(t).length - 1), 0) + (x.tipo === 'Caso' ? 2 : x.tipo === 'Notícia' ? 1 : 0) })).sort((a, b) => b.s - a.s).map(o => o.x);
      $('#sq-res').innerHTML = !toks.length && !tipo && !area && !ano && !st ? '<p class="muted" style="margin-top:16px">Digite para pesquisar em casos, notícias, pessoas, datas e tutoriais.</p>' : r.length ? `<p class="count">${r.length} resultado${r.length > 1 ? 's' : ''} no site</p>` + r.slice(0, 60).map(x => `<a href="${x.href}"><small>${esc(x.tipo)}${x.area ? ' · ' + esc(x.area) : ''}</small><b>${esc(x.titulo)}</b><span>${esc((x.sub || '').slice(0, 170))}</span></a>`).join('') : '<p class="muted" style="margin-top:16px">Nada encontrado no site. Tente os portais oficiais abaixo.</p>';
      $('#sq-ext').innerHTML = raw ? `<h4 style="margin-top:var(--s3)">Pesquisar “${esc(raw)}” nos portais oficiais</h4><div class="ext">${EXT.map(([n, f]) => `<a href="${esc(f(raw))}" target="_blank" rel="noopener">${esc(n)}<span>↗</span></a>`).join('')}</div><p class="muted" style="font-size:13px;margin-top:8px">Abre o portal em outra aba com a pesquisa já feita. Alguns usam a busca do Google restrita ao site oficial.</p>` : '';
      $$('#sq-res a').forEach(a => a.onclick = () => closeLayer(m));
    };
    let tm; inp.oninput = () => { clearTimeout(tm); tm = setTimeout(run, 120); }; $$('#sq-tipo,#sq-area,#sq-ano,#sq-st,#sq-exato').forEach(e => e.onchange = run);
    inp.onkeydown = e => { if (e.key === 'Enter') { const a = $('#sq-res a'); if (a) { location.hash = a.getAttribute('href'); closeLayer(m); } } };
    closeable(m); run();
  }
  function layerFocusable(layer) {
    return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]', layer)
      .filter(el => !el.closest('[hidden]') && el.getClientRects().length);
  }
  function openLayer(layer) {
    if ($('#modal').hidden && $('#sheet').hidden) layerTrigger = document.activeElement;
    [$('#modal'), $('#sheet')].forEach(other => { if (other !== layer) other.hidden = true; });
    layer.hidden = false;
    document.body.classList.add('overlay-open');
    $$('.top,main,.foot,.tabbar').forEach(el => el.inert = true);
    const panel = $('.in', layer);
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.tabIndex = -1;
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) panel.setAttribute('aria-label', ($('h2,h3', panel) || {}).textContent || 'Janela');
    $$('#btn-menu,#tab-mais').forEach(b => b.setAttribute('aria-expanded', String(layer.id === 'sheet')));
    (layerFocusable(layer)[0] || panel).focus({ preventScroll: true });
  }
  function closeLayer(layer, restore = true) {
    if (layer.hidden) return;
    layer.hidden = true;
    if (!$('#modal').hidden || !$('#sheet').hidden) return;
    document.body.classList.remove('overlay-open');
    $$('.top,main,.foot,.tabbar').forEach(el => el.inert = false);
    $$('#btn-menu,#tab-mais').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (restore && layerTrigger && layerTrigger.isConnected) layerTrigger.focus({ preventScroll: true });
    layerTrigger = null;
  }
  function closeable(m) {
    $$('[data-x]', m).forEach(b => b.onclick = () => closeLayer(m));
    m.onclick = e => { if (e.target === m) closeLayer(m); };
  }

  /* ---------- COMPARTILHAR ---------- */
  function pageShareButton(page, section, label) {
    return `<div class="page-share"><button class="btn ghost" data-share-page="${page}" data-share-section="${section}" aria-label="${esc(label)}">${ic('share')}${esc(label)}</button></div>`;
  }
  // Os trechos vêm do próprio conteúdo da página; páginas informativas não usam contadores de casos.
  function pageShareItem(page, section) {
    const index = section === '' || section == null ? null : Number(section);
    const rights = page === 'direitos', d = X.direitos || {};
    const all = rights ? (d.secoes || []) : (X.tutoriais || []);
    const selected = index == null ? null : all[index];
    let blocks = (selected ? [selected] : all).map(b => rights
      ? { secao: 'Seus direitos', titulo: b.titulo, texto: (b.paragrafos || []).join(' '), lista: b.lista || [] }
      : { secao: 'Fiscalize você também', titulo: b.titulo, texto: b.para_que, lista: b.passos || [] });
    if (!rights && !selected) {
      // O guia completo compartilha um índice; cada tutorial oferece a própria sequência detalhada.
      blocks = [];
      for (let i = 0; i < all.length; i += 3) blocks.push({ secao: 'Fiscalize você também', titulo: 'Onde consultar', lista: all.slice(i, i + 3).map(b => b.titulo) });
    }
    return { shareType: 'page', id: page, route: page + (selected ? '?sec=' + index : ''),
      titulo: selected ? selected.titulo : rights ? d.titulo || 'Questionar não é crime' : 'Como conferir tudo isso sozinho',
      resumo: selected ? rights ? (selected.paragrafos || []).join(' ') : selected.para_que : rights ? d.intro : X.fiscalize_intro,
      area: rights ? 'Seus direitos' : 'Fiscalize você também', cena: rights ? 'Direitos do cidadão' : 'Administração',
      fonte: rights ? 'Seus direitos · referências no texto' : 'Guia de consulta aos portais públicos', slides: blocks };
  }
  function shareItem(x) {
    const theme = x.theme || document.documentElement.dataset.theme || 'light';
    if (x.shareType === 'page') return { kicker: x.area, titulo: x.titulo, resumo: x.resumo, imagem: SCENES.source(x), theme,
      link: SITE + '/#/' + x.route, fonte: x.fonte, cta: 'Leia o guia completo:', nome: 'acopiara-' + x.id + (x.route.includes('?') ? '-trecho-' + x.route.split('=')[1] : '') };
    if (x.fato) return { theme, kicker: 'Notícia · ' + x.veiculo + ' · ' + fmtData(x.data), titulo: x.titulo, resumo: (x.analise || [])[0] || x.fato, cena: cenaKey(x.cena), imagem: SCENES.source(x), link: SITE + '/#/noticia/' + x.id, fonte: x.veiculo + ' e documentos públicos', cta: 'Leia a análise completa:', nome: 'acopiara-noticia-' + x.id };
    return { theme, kicker: x.area + (x.periodo ? ' · ' + per(x.periodo) : ''), titulo: x.titulo, valor: x.valor, valor_rotulo: x.valor_rotulo, resumo: x.resumo, status: x.status, cena: cenaKey(x.cena || x.area), imagem: SCENES.source(x), link: SITE + '/#/caso/' + x.id, fonte: (x.fontes && x.fontes[0] && x.fontes[0].tipo) || 'documentos públicos', nome: 'acopiara-caso-' + x.id };
  }

  function slidesDe(x, link) {
    if (x.shareType === 'page') {
      const slides = [];
      (x.slides || []).forEach(b => {
        // Dividir parágrafos longos mantém o texto inteiro e a leitura confortável.
        const chunks = []; let chunk = '';
        String(b.texto || '').split(/(?<=[.!?])\s+/).forEach(sentence => {
          if (chunk && (chunk + ' ' + sentence).length > 480) { chunks.push(chunk); chunk = ''; }
          chunk += (chunk ? ' ' : '') + sentence;
        });
        if (chunk) chunks.push(chunk);
        chunks.forEach((texto, i) => slides.push({ secao: b.secao, titulo: b.titulo + (i ? ' · continuação' : ''), texto }));
        for (let i = 0; i < (b.lista || []).length; i += 3) slides.push({ secao: b.secao, titulo: b.titulo, lista: b.lista.slice(i, i + 3) });
      });
      return slides.map((s, i) => Object.assign(s, { n: i + 2, total: slides.length + 1, link, theme: x.theme || document.documentElement.dataset.theme }));
    }
    const m = x.materia || {}, cut = (t, n) => { t = String(t || ''); return t.length > n ? t.slice(0, t.lastIndexOf(' ', n - 1)) + '…' : t; }, S = [];
    const fatos = x.fato || (x.o_que_aconteceu || []).filter(p => !/^[a-z]\) /.test(p))[0];
    S.push({ secao: 'O problema', titulo: 'O que está errado', texto: cut(m.problema || x.resumo, 420) });
    if (fatos) S.push({ secao: 'Os fatos', titulo: 'O que os documentos mostram', texto: cut(fatos, 520) });
    const pes = (x.pessoas || []).slice(0, 4).map(p => p.nome + (p.papel ? ' — ' + cut(p.papel, 70) : ''));
    if (pes.length) S.push({ secao: 'Quem está envolvido', titulo: 'Os responsáveis', lista: pes });
    if ((m.direitos || []).length) S.push({ secao: 'Direitos atingidos', titulo: 'O que a Constituição garante', lista: m.direitos.slice(0, 4).map(d => d.t) });
    if (m.efeitos_coletivos) S.push({ secao: 'O que isso causa a você', titulo: 'O preço para a cidade', texto: cut(m.efeitos_coletivos, 420) });
    const cab = (m.cabiveis || []).slice(0, 3).map(t => cut(t, 120));
    if (cab.length) S.push({ secao: 'O que pode ser feito', titulo: 'Medidas cabíveis', lista: cab });
    if (m.leitura_editorial?.paragrafos?.length) {
      m.leitura_editorial.paragrafos.forEach((texto, i) => {
        S.push({ secao: 'Nossa leitura · ' + (i + 1) + '/' + m.leitura_editorial.paragrafos.length, titulo: i ? '' : m.leitura_editorial.titulo, texto, tema: 'escuro' });
      });
    } else if (m.conclusao) S.push({ secao: 'Conclusão crítica', titulo: '', texto: cut(m.conclusao, 560), tema: 'escuro' });
    S.push({ secao: 'Fiscalize', titulo: 'Leia completo, com os documentos', texto: 'No link: ' + link + '. Cada informação tem a fonte oficial. Compartilhe. Cobrar é direito.', tema: 'escuro' });
    const total = S.length + 1; S.forEach((s, i) => { s.n = i + 2; s.total = total; s.link = link; s.theme = x.theme || document.documentElement.dataset.theme; });
    return S;
  }
  async function openShare(x, p) {
    const it = shareItem(x), m = $('#modal'); let fmt = 'story';
    const url = 'https://' + it.link, txt = x.titulo + ' — ' + url;
    const recordShare = mode => p ? API.share(p, mode) : Promise.resolve({ off: true });
    m.innerHTML = `<div class="in" role="dialog" aria-label="Compartilhar"><div class="mh"><h3>Compartilhar</h3><button class="ibtn" data-x aria-label="Fechar">${ic('x')}</button></div><div class="mb"><div class="share">
      <div class="pv"><canvas id="cv" aria-label="Prévia da imagem para compartilhar"></canvas></div>
      <div><div class="seg" role="tablist" id="sh-modo"><button class="on" data-m="uma">Uma imagem</button><button data-m="seq">Sequência</button></div><div class="seg" role="tablist" id="sh-fmt" style="margin-top:8px"><button class="on" data-f="story">Stories · 9:16</button><button data-f="feed">Feed · 4:5</button></div>
        <p class="muted" style="font-size:15px" id="sh-dim">Imagem vertical de 2160 × 3840 px, pronta para Instagram, WhatsApp e Facebook. O texto fica centralizado e a ilustração vai no topo.</p>
        <div class="thumbs" id="sh-th" hidden></div><div class="acts"><button class="btn solid" id="sh-img">${ic('share')}Compartilhar imagem</button><button class="btn" id="sh-dl">${ic('baixar')}Baixar imagem</button>
        <a class="btn" id="sh-wa" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Enviar link pelo WhatsApp</a><button class="btn ghost" id="sh-cp">${ic('link')}Copiar link</button></div></div></div></div></div>`;
    openLayer(m); closeable(m);
    let modo = 'uma', seqCv = [];
    const cv = $('#cv'), draw = async () => {
      const controls = $$('#sh-modo button, #sh-fmt button, #sh-img, #sh-dl', m);
      controls.forEach(b => b.disabled = true); cv.setAttribute('aria-busy', 'true');
      try {
      $('#sh-th').hidden = modo !== 'seq';
      $('#sh-img').innerHTML = ic('share') + (modo === 'seq' ? 'Compartilhar a sequência' : 'Compartilhar imagem'); $('#sh-dl').innerHTML = ic('baixar') + (modo === 'seq' ? 'Baixar todas' : 'Baixar imagem');
      const pvx = $('#pvimg'); if (pvx) pvx.remove(); cv.style.display = '';
      await CARDS.render(cv, it, fmt);
      if (modo === 'uma') { $('#sh-dim').textContent = fmt === 'story' ? 'Imagem vertical de 2160 × 3840 px (9:16), pronta para os stories do Instagram, WhatsApp e Facebook.' : 'Imagem vertical de 2160 × 2700 px (4:5), o formato que ocupa mais espaço no feed do Instagram e do Facebook.'; return; }
      const S = slidesDe(x, it.link); seqCv = [cv];
      for (const s of S) { const c = document.createElement('canvas'); await CARDS.slide(c, s, fmt); seqCv.push(c); }
      const pv0 = $('#pvimg'); if (pv0) pv0.remove(); cv.style.display = '';
      $('#sh-th').innerHTML = ''; seqCv.forEach((c, i) => { const t = document.createElement('img'); t.src = c.toDataURL('image/jpeg', .5); t.alt = 'Imagem ' + (i + 1); t.tabIndex = 0; t.setAttribute('role', 'button'); t.setAttribute('aria-label', 'Ver imagem ' + (i + 1) + ' de ' + seqCv.length); t.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); } }; t.onclick = () => { let pv = $('#pvimg'); if (!pv) { pv = document.createElement('img'); pv.id = 'pvimg'; pv.style.cssText = 'width:100%;height:auto;display:block'; cv.after(pv); } pv.src = c.toDataURL('image/jpeg', .85); cv.style.display = 'none'; $$('#sh-th img').forEach(z => z.classList.toggle('on', z === t)); }; $('#sh-th').appendChild(t); });
      $('#sh-dim').textContent = `${seqCv.length} imagens em sequência (${fmt === 'story' ? 'stories 9:16' : 'carrossel do feed 4:5'}). No celular, toque em "Compartilhar a sequência" e escolha o Instagram: no feed elas viram um carrossel; nos stories, entram uma depois da outra. No computador, as imagens são baixadas numeradas.`;
      } finally { controls.forEach(b => b.disabled = false); cv.removeAttribute('aria-busy'); }
    };
    $$('#sh-modo button', m).forEach(b => b.onclick = async () => { modo = b.dataset.m; $$('#sh-modo button', m).forEach(x => x.classList.toggle('on', x === b)); await draw(); });
    $$('#sh-fmt button', m).forEach(b => b.onclick = async () => { fmt = b.dataset.f; $$('#sh-fmt button', m).forEach(x => x.classList.toggle('on', x === b)); await draw(); });
    $('#sh-img').onclick = async () => { const r = modo === 'seq' ? await CARDS.shareMany(seqCv, it.nome + '-' + fmt, x.titulo) : await CARDS.share($('#cv'), it.nome + '-' + fmt, x.titulo); if (r !== 'cancel') recordShare(fmt).then(r => r && !r.off && $$(`[data-eng] [data-c="shares"]`).forEach(e => e.textContent = Number(r.shares).toLocaleString('pt-BR'))); };
    $('#sh-dl').onclick = async () => { if (modo === 'seq') await CARDS.saveMany(seqCv, it.nome + '-' + fmt); else await CARDS.save($('#cv'), it.nome + '-' + fmt); recordShare(fmt + '-download'); };
    $('#sh-wa').onclick = () => { recordShare('whatsapp'); };
    $('#sh-cp').onclick = async () => { try { await navigator.clipboard.writeText(url); toast('Link copiado'); } catch (e) { prompt('Copie o link:', url); } recordShare('link'); };
    await draw();
  }

  /* ---------- interações por página ---------- */
  function after(p, a, qs) {
    $$('[data-share-page]', main).forEach(b => b.onclick = () => openShare(pageShareItem(b.dataset.sharePage, b.dataset.shareSection)));
    if (p === 'direitos' || p === 'fiscalize') {
      const section = new URLSearchParams(qs || '').get('sec');
      if (section !== null && /^\d+$/.test(section)) {
        const target = document.getElementById((p === 'direitos' ? 'direito-' : 'tut-') + section);
        if (target) { if (target.tagName === 'DETAILS') target.open = true; requestAnimationFrame(() => target.scrollIntoView({ block: 'start' })); }
      }
    }
    $$('[data-open-search]', main).forEach(b => b.onclick = () => openSearch(''));
    if (p === 'casos') bindFiltros(qs);
    if (p === 'linha-do-tempo') { const run = () => { const t = norm($('#tq').value), ar = $('#ta').value; $$('#tl .ev').forEach(e => e.hidden = !((!t || e.dataset.t.includes(t)) && (!ar || e.dataset.a === ar))); }; $('#tq').oninput = run; $('#ta').oninput = run; }
    if (p === 'pessoas') {
      const run = () => { const t = norm($('#pq').value), m = $('#pc').value; $$('#pt [data-t]').forEach(r => r.hidden = !((!t || r.dataset.t.includes(t)) && (!m || +r.dataset.qtd > 1))); }; $('#pq').oninput = run; $('#pc').oninput = run;
      $('#sq').oninput = () => { const t = norm($('#sq').value); $$('#stb tbody tr, #stb .rec').forEach(r => { r.hidden = !!t && !(r.dataset.t || '').includes(t); }); };
    }
    if (p === 'noticias') $$('#ntag button').forEach(b => b.onclick = () => { $$('#ntag button').forEach(x => x.classList.toggle('on', x === b)); const t = b.dataset.t; $('#nl').innerHTML = list(NOT.filter(n => !t || (n.tags || []).includes(t)), cardNot); animate($('#nl')); });
    if (p === 'denuncie') bindDen();
    if (p === 'processos') { const run = () => { const t = norm($('#prq').value), s = $('#prs').value; $$('#prl .proc').forEach(e => e.hidden = !((!t || e.dataset.t.includes(t)) && (!s || e.dataset.s === s))); }; $('#prq').oninput = run; $('#prs').oninput = run; }
    if (p === 'dinheiro') bindDin();
    if (p === 'caso' || p === 'noticia') { const t = $('#toc'); if (t) { const hs = $$('.prose h2', main); hs.forEach((h, i) => h.id = h.id || 'sec' + i); t.innerHTML = hs.map(h => { const sn = h.querySelector('.sn'); const tx = sn ? sn.textContent + '. ' + h.textContent.slice(sn.textContent.length) : h.textContent; return `<a href="#${location.hash.slice(1)}" data-to="${h.id}">${esc(tx)}</a>`; }).join(''); $$('a', t).forEach(l => l.onclick = e => { e.preventDefault(); const el = document.getElementById(l.dataset.to); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' }); }); } }
    if (p === 'caso') { const c = CASOS.find(x => x.id === a); if (c) bindEngage('caso/' + a, c); const eq = $('#eq'); if (eq) eq.oninput = () => { const t = norm(eq.value); $$('#etb tbody tr, #etb .rec').forEach(r => r.hidden = !!t && !(r.dataset.t || '').includes(t)); const sc = $('#el .tscroll'); if (sc && t) sc.classList.add('aberta'); }; }
    if (p === 'noticia') { const n = NOT.find(x => x.id === a); if (n) bindEngage('noticia/' + a, n); }
    if (p === '' || p === 'casos' || p === 'noticias' || p === 'fiscalize' || p === 'direitos' || p === 'dinheiro' || p === 'pessoas' || p === 'linha-do-tempo' || p === 'sobre' || p === 'denuncie' || p === 'pessoa') API.hit(p || 'inicio');
    $$('[data-zoom]', main).forEach(im => im.onclick = () => { const m = $('#modal'); m.innerHTML = `<div class="in"><div class="mh"><h3>Documento</h3><button class="ibtn" data-x aria-label="Fechar">${ic('x')}</button></div><div class="mb"><img class="zoom" src="${im.dataset.zoom}" alt=""></div></div>`; openLayer(m); closeable(m); });
  }

  /* ---------- moldura: busca, tema, app, notificações ---------- */
  function chrome() {
    $('#btn-busca').onclick = () => openSearch(''); $('#tab-busca').onclick = () => openSearch('');
    $('#tab-mais').onclick = () => openLayer($('#sheet')); $('#btn-menu').onclick = () => openLayer($('#sheet'));
    $('#close-menu').onclick = () => closeLayer($('#sheet'));
    $('#sheet').onclick = e => { if (e.target.id === 'sheet') closeLayer($('#sheet')); else if (e.target.closest('a')) closeLayer($('#sheet')); };
    const tema = () => { const d = document.documentElement, t = d.dataset.theme === 'dark' ? 'light' : 'dark'; d.dataset.theme = t; try { localStorage.setItem('tema', t); } catch (e) { } $('meta[name=theme-color]').content = t === 'dark' ? '#0E1411' : '#0E5A3A'; };
    $('#btn-tema').onclick = tema; $('#sh-tema').onclick = tema;
    const showApp = () => { const v = (API.canInstall() || (API.isIOS && !API.standalone)); $('#btn-app').hidden = !v; $('#sh-app').hidden = !v; };
    document.addEventListener('api:install', showApp); showApp();
    const inst = async () => { if (API.canInstall()) { if (await API.install()) toast('Aplicativo instalado'); showApp(); } else alert('No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".'); };
    $('#btn-app').onclick = inst; $('#sh-app').onclick = inst;
    const showN = () => { const v = (API.pushOK() || API.isIOS) && !API.subscribed(); $('#btn-notif').hidden = !v; $('#sh-notif').hidden = !v; };
    showN();
    const nt = async () => { const r = await API.subscribe(); if (r.ok) toast('Pronto! Você vai receber as novas publicações.'); else alert(r.erro); showN(); };
    $('#btn-notif').onclick = nt; $('#sh-notif').onclick = nt;
    document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, { passive: true });
    document.addEventListener('keydown', e => {
      document.documentElement.dataset.input = 'keyboard';
      const layer = !$('#modal').hidden ? $('#modal') : !$('#sheet').hidden ? $('#sheet') : null;
      if (e.key === 'Escape' && layer) { e.preventDefault(); closeLayer(layer); return; }
      if (e.key === 'Tab' && layer) {
        const items = layerFocusable(layer), first = items[0], last = items[items.length - 1];
        if (!first) { e.preventDefault(); $('.in', layer).focus(); }
        else if (e.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { e.preventDefault(); first.focus(); }
      }
      if (e.key === '/' && !layer && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); openSearch(''); }
    }, true);
  }
})();

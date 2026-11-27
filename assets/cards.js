// Imagens para compartilhar: Stories (9:16) e Feed (4:5), em alta resolução (2160 px de largura).
// O texto fica centralizado na vertical no espaço livre entre a ilustração e o rodapé.
window.CARDS = (function () {
  const K = 2, W = 1080, FMT = { story: { H: 1920, img: 540, title: 80, body: 42, foot: 250 }, feed: { H: 1350, img: 420, title: 64, body: 36, foot: 220 } };
  const V = '#244F3D', A = '#233F5D', P = '#F6F3EA', T = '#1E2B24', M = '#E2CB86', C = '#627067';
  const palette = item => {
    const dark = (item.theme || document.documentElement.dataset.theme) === 'dark' || item.tema === 'escuro';
    return dark ? { dark, paper: '#17251F', text: '#F1EDE2', body: '#D8DED5', muted: '#AFBDB2', green: '#B7CCAF', blue: '#B8CADD', line: '#405047' }
      : { dark, paper: P, text: T, body: '#35443A', muted: C, green: V, blue: A, line: '#D9DCD1' };
  };
  const displayLink = link => String(link || 'www.acopiaratransparente.com.br').replace(/^https?:\/\//, '').replace(/\/$/, '');
  function footerLink(ctx, link, x, y, width, color, maxSize = 30) {
    const text = displayLink(link); let size = maxSize, lines;
    do { ctx.font = `600 ${size}px Inter, Arial`; lines = wrap(ctx, text.replace('/#/', '/# /'), width); if (lines.length <= 2) break; size -= 1; } while (size > 24);
    ctx.fillStyle = color; lines.slice(0, 2).forEach((line, i) => ctx.fillText(line.replace('/# ', '/#'), x, y + i * (size + 9)));
  }
  const L = 84, R = W - 84, MW = R - L;
  function wrap(ctx, text, maxW) {
    const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
    for (const word of words) {
      const parts = []; let part = '';
      for (const ch of word) { if (part && ctx.measureText(part + ch).width > maxW) { parts.push(part); part = ''; } part += ch; }
      if (part) parts.push(part);
      for (const w of parts) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    }
    if (cur) lines.push(cur); return lines;
  }
  function clip(ctx, text, maxW, n) {
    const all = wrap(ctx, text, maxW); if (all.length <= n) return all;
    let t = all.slice(0, n).join(' '); const cut = t.lastIndexOf('. ');
    if (cut > t.length * .45) return wrap(ctx, t.slice(0, cut + 1), maxW);
    const ls = all.slice(0, n); let last = ls[n - 1].replace(/\s+\S*$/, ''); while (last && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1); ls[n - 1] = last.trimEnd() + '…'; return ls;
  }
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const fmtPer = p => { if (!p) return ''; const f = s => s ? s.slice(5, 7) + '/' + s.slice(0, 4) : ''; return p.inicio === p.fim || !p.fim ? f(p.inicio) : f(p.inicio) + ' a ' + f(p.fim); };
  const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // item: { kicker, titulo, valor, valor_rotulo, resumo, status, cena, link, fonte }
  async function render(canvas, item, formato) {
    const F = FMT[formato] || FMT.story, H = F.H, colors = palette(item);
    try { await Promise.all(['800 80px Fraunces', '700 30px Inter', '400 40px Inter', '600 30px Inter'].map(f => document.fonts.load(f))); } catch (e) { }
    canvas.width = W * K; canvas.height = H * K; const ctx = canvas.getContext('2d'); ctx.setTransform(K, 0, 0, K, 0, 0); ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = colors.paper; ctx.fillRect(0, 0, W, H);
    // ilustração no topo, recortada para preencher a faixa
    const imageSource = item.imagem || (item.cena ? 'img/cenas/' + item.cena + '.jpg' : null);
    let top = 16, im = imageSource ? await load(imageSource) : null;
    if (im) { const ar = W / F.img, iar = im.width / im.height; let sw = im.width, sh = im.height, sx = 0, sy = 0; if (iar > ar) { sw = im.height * ar; sx = (im.width - sw) / 2; } else { sh = im.width / ar; sy = (im.height - sh) / 2; } ctx.drawImage(im, sx, sy, sw, sh, 0, 16, W, F.img); top = 16 + F.img; }
    // faixa da bandeira
    ctx.fillStyle = V; ctx.fillRect(0, 0, W / 3, 16); ctx.fillStyle = '#fff'; ctx.fillRect(W / 3, 0, W / 3, 16); ctx.fillStyle = A; ctx.fillRect(2 * W / 3, 0, W / 3, 16);
    // A borda superior é a única moldura; o papel deixa o conteúdo respirar.
    // rodapé fixo
    const fy = H - F.foot;
    ctx.fillStyle = colors.line; ctx.fillRect(L, fy, MW, 2);
    const lg = await load(colors.dark ? 'img/logo-mark-dark.svg' : 'img/logo-mark.svg'); const ls = formato === 'feed' ? 104 : 132; if (lg) ctx.drawImage(lg, R - ls, fy + (F.foot - ls) / 2, ls, ls);
    const fw = MW - ls - 32; let y = fy + (formato === 'feed' ? 46 : 58);
    ctx.fillStyle = colors.muted; ctx.font = '500 24px Inter, Arial'; ctx.fillText(clip(ctx, 'Fonte: ' + (item.fonte || 'documentos públicos'), fw, 1)[0], L, y); y += formato === 'feed' ? 40 : 48;
    ctx.fillStyle = colors.green; ctx.font = '600 27px Inter, Arial'; ctx.fillText(item.cta || 'Leia completo, com os documentos:', L, y); y += formato === 'feed' ? 42 : 48;
    footerLink(ctx, item.link, L, y, fw, colors.blue);
    // bloco de conteúdo: mede, ajusta e centraliza na vertical
    const zoneTop = top + (im ? 48 : 100), zoneBot = fy - 48, avail = zoneBot - zoneTop;
    let tSize = F.title, bSize = F.body, gap = 36, bLines = formato === 'feed' ? 4 : 7, plan;
    for (let tries = 0; tries < 30; tries++) {
      plan = layout(ctx, item, tSize, bSize, bLines, gap);
      if (plan.h <= avail) break;
      if (bLines > 2) bLines--; else if (tSize > 44) tSize -= 4; else if (gap > 20) gap -= 4; else if (bSize > 30) bSize -= 2; else break;
    }
    let cy = zoneTop + Math.max(0, (avail - plan.h) / 2);
    for (const op of plan.ops) { op(ctx, cy); }
    return canvas;
    function layout(ctx, it, ts, bs, bl, gap) {
      const ops = []; let h = 0;
      const add = (dh, fn) => { const y0 = h; ops.push((c, base) => fn(c, base + y0)); h += dh; };
      ctx.font = '700 28px Inter, Arial';
      add(40, (c, y) => { c.fillStyle = colors.blue; c.font = '700 28px Inter, Arial'; c.fillText(clip(c, (it.kicker || '').toUpperCase(), MW, 1)[0] || '', L, y + 28); });
      h += 24;
      ctx.font = `800 ${ts}px Fraunces, Georgia, serif`; const tl = clip(ctx, it.titulo, MW, 5), lh = Math.round(ts * 1.12);
      add(tl.length * lh, (c, y) => { c.fillStyle = colors.text; c.font = `800 ${ts}px Fraunces, Georgia, serif`; tl.forEach((l, i) => c.fillText(l, L, y + ts + i * lh)); });
      if (it.valor) {
        h += gap; const v = brl(it.valor); let vs = Math.round(ts * 1.25);
        while (vs > 40) { ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; if (ctx.measureText(v).width <= MW - 20) break; vs -= 2; }
        ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; const vw = Math.min(ctx.measureText(v).width, MW);
        add(vs + 8, (c, y) => { c.fillStyle = M; c.fillRect(L - 10, y + vs * .12, vw + 20, vs * .98); c.fillStyle = T; c.font = `800 ${vs}px Fraunces, Georgia, serif`; c.fillText(v, L, y + vs * .9); });
        if (it.valor_rotulo) { ctx.font = '500 28px Inter, Arial'; const rl = clip(ctx, it.valor_rotulo, MW, 2); h += 12; add(rl.length * 38, (c, y) => { c.fillStyle = colors.muted; c.font = '500 28px Inter, Arial'; rl.forEach((l, i) => c.fillText(l, L, y + 28 + i * 38)); }); }
      }
      if (it.resumo && bl > 0) {
        h += gap; ctx.font = `400 ${bs}px Inter, Arial`; const bLs = clip(ctx, it.resumo, MW, bl), blh = Math.round(bs * 1.45);
        add(bLs.length * blh, (c, y) => { c.fillStyle = colors.body; c.font = `400 ${bs}px Inter, Arial`; bLs.forEach((l, i) => c.fillText(l, L, y + bs + i * blh)); });
      }
      if (it.status) {
        h += gap; const st = ({ 'comprovado': 'Comprovado', 'em juízo': 'Em juízo', 'indício a apurar': 'Indício a apurar' }[it.status] || it.status).toUpperCase(); ctx.font = '700 26px Inter, Arial'; const sw = ctx.measureText(st).width + 44;
        add(52, (c, y) => { c.fillStyle = it.status === 'comprovado' ? '#E5F2EA' : it.status === 'em juízo' ? '#E2E9F3' : '#FFF4D1'; rr(c, L, y, Math.min(sw, MW), 52, 12); c.fill(); c.fillStyle = it.status === 'comprovado' ? '#2E7D4F' : it.status === 'em juízo' ? A : '#7A5B00'; c.font = '700 26px Inter, Arial'; c.fillText(st, L + 22, y + 35); });
      }
      return { ops, h };
    }
  }
  function blob(canvas) { return new Promise(r => canvas.toBlob(r, 'image/jpeg', .95)); }
  async function share(canvas, nome, titulo) {
    const b = await blob(canvas), file = new File([b], nome + '.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: titulo }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancel'; } }
    download(b, file.name); return 'download';
  }
  async function save(canvas, nome) { download(await blob(canvas), nome + '.jpg'); }
  function download(b, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }

  // ---- sequência (carrossel do feed ou stories em série) ----
  // s: { n, total, secao, titulo, texto, lista[], link }
  async function slide(canvas, s, formato) {
    const F = FMT[formato] || FMT.story, H = F.H, story = formato === 'story';
    try { await Promise.all(['800 80px Fraunces', '700 30px Inter', '400 40px Inter'].map(f => document.fonts.load(f))); } catch (e) { }
    canvas.width = W * K; canvas.height = H * K; const ctx = canvas.getContext('2d'); ctx.setTransform(K, 0, 0, K, 0, 0);
    const colors = palette(s);
    ctx.fillStyle = colors.paper; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = V; ctx.fillRect(0, 0, W / 3, 16); ctx.fillStyle = '#fff'; ctx.fillRect(W / 3, 0, W / 3, 16); ctx.fillStyle = A; ctx.fillRect(2 * W / 3, 0, W / 3, 16);
    // cabeçalho: contador e seção
    const hy = story ? 150 : 110;
    ctx.font = '700 28px Inter, Arial'; ctx.fillStyle = colors.blue; ctx.fillText((s.secao || '').toUpperCase(), L, hy);
    const cnt = s.n + '/' + s.total; ctx.textAlign = 'right'; ctx.fillStyle = colors.muted; ctx.fillText(cnt, R, hy); ctx.textAlign = 'left';
    ctx.fillStyle = M; ctx.fillRect(L, hy + 24, 90, 8);
    // rodapé
    const fy = H - (story ? 210 : 190);
    ctx.fillStyle = colors.line; ctx.fillRect(L, fy, MW, 2);
    const lg = await load(colors.dark ? 'img/logo-mark-dark.svg' : 'img/logo-mark.svg'), ls = story ? 96 : 80; if (lg) ctx.drawImage(lg, L, fy + 30, ls, ls);
    ctx.font = '800 32px Fraunces, Georgia, serif'; ctx.fillStyle = colors.text; ctx.fillText('Acopiara Transparente', L + ls + 24, fy + 30 + ls / 2 - 4);
    footerLink(ctx, s.link, L + ls + 24, fy + 30 + ls / 2 + 34, MW - ls - 24, colors.muted, 26);
    if (s.n < s.total) { ctx.font = '700 28px Inter, Arial'; ctx.fillStyle = colors.green; ctx.textAlign = 'right'; ctx.fillText('arraste →', R, fy - 28); ctx.textAlign = 'left'; }
    // conteúdo centralizado e ajustado
    const zt = hy + 90, zb = fy - 80, avail = zb - zt;
    let ts = story ? 86 : 68, bs = story ? 48 : 38, plan;
    for (let i = 0; i < 40; i++) { plan = lay(ts, bs); if (plan.h <= avail) break; if (bs > 26) bs -= 2; else if (ts > 44) ts -= 4; else break; }
    let y = zt + Math.max(0, (avail - plan.h) / 2); plan.ops.forEach(o => o(y));
    return canvas;
    function lay(ts, bs) {
      const ops = []; let h = 0; const add = (dh, fn) => { const y0 = h; ops.push(b => fn(b + y0)); h += dh; };
      if (s.titulo) { ctx.font = `800 ${ts}px Fraunces, Georgia, serif`; const tl = wrap(ctx, s.titulo, MW), lh = Math.round(ts * 1.12);
        add(tl.length * lh, y => { ctx.fillStyle = colors.text; ctx.font = `800 ${ts}px Fraunces, Georgia, serif`; tl.forEach((l, i) => ctx.fillText(l, L, y + ts + i * lh)); }); h += 40; }
      if (s.destaque) { let vs = Math.round(ts * 1.2); while (vs > 38) { ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; if (ctx.measureText(s.destaque).width <= MW - 20) break; vs -= 2; } ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; const vw = Math.min(ctx.measureText(s.destaque).width, MW);
        add(vs + 30, y => { ctx.fillStyle = M; ctx.fillRect(L - 10, y + vs * .12, vw + 20, vs * .98); ctx.fillStyle = T; ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; ctx.fillText(s.destaque, L, y + vs * .9); }); }
      if (s.texto) { ctx.font = `400 ${bs}px Inter, Arial`; const bl = wrap(ctx, s.texto, MW), lh = Math.round(bs * 1.42);
        add(bl.length * lh, y => { ctx.fillStyle = colors.body; ctx.font = `400 ${bs}px Inter, Arial`; bl.forEach((l, i) => ctx.fillText(l, L, y + bs + i * lh)); }); h += 24; }
      (s.lista || []).forEach(it => { ctx.font = `500 ${bs}px Inter, Arial`; const bl = wrap(ctx, it, MW - 50), lh = Math.round(bs * 1.38);
        add(bl.length * lh + 22, y => { ctx.fillStyle = colors.green; ctx.fillRect(L, y + bs * .45, 18, 18); ctx.fillStyle = colors.text; ctx.font = `500 ${bs}px Inter, Arial`; bl.forEach((l, i) => ctx.fillText(l, L + 50, y + bs + i * lh)); }); });
      return { ops, h };
    }
  }
  async function shareMany(canvases, nome, titulo) {
    const files = await Promise.all(canvases.map(async (cv, i) => new File([await blob(cv)], `${nome}-${String(i + 1).padStart(2, '0')}.jpg`, { type: 'image/jpeg' })));
    if (navigator.canShare && navigator.canShare({ files })) { try { await navigator.share({ files, title: titulo }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancel'; } }
    for (const f of files) { download(f, f.name); await new Promise(r => setTimeout(r, 400)); } return 'download';
  }
  async function saveMany(canvases, nome) { for (let i = 0; i < canvases.length; i++) { download(await blob(canvases[i]), `${nome}-${String(i + 1).padStart(2, '0')}.jpg`); await new Promise(r => setTimeout(r, 400)); } }
  return { render, share, save, slide, shareMany, saveMany, fmtPer, brl };
})();

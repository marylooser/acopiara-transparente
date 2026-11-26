// Imagens para compartilhar: Stories (9:16) e Feed (4:5), em alta resolução (2160 px de largura).
// O texto fica centralizado na vertical no espaço livre entre a ilustração e o rodapé.
window.CARDS = (function () {
  const K = 2, W = 1080, FMT = { story: { H: 1920, img: 540, title: 80, body: 42, foot: 250 }, feed: { H: 1350, img: 420, title: 64, body: 36, foot: 190 } };
  const V = '#0E5A3A', A = '#123B6E', P = '#FBFAF6', T = '#17211C', M = '#FFD84D', C = '#5E6762';
  const L = 84, R = W - 84, MW = R - L;
  function wrap(ctx, text, maxW) {
    const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }
  function clip(ctx, text, maxW, n) {
    const all = wrap(ctx, text, maxW); if (all.length <= n) return all;
    let t = all.slice(0, n).join(' '); const cut = t.lastIndexOf('. ');
    if (cut > t.length * .45) return wrap(ctx, t.slice(0, cut + 1), maxW);
    const ls = all.slice(0, n); ls[n - 1] = ls[n - 1].replace(/\s+\S*$/, '') + '…'; return ls;
  }
  const load = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  const fmtPer = p => { if (!p) return ''; const f = s => s ? s.slice(5, 7) + '/' + s.slice(0, 4) : ''; return p.inicio === p.fim || !p.fim ? f(p.inicio) : f(p.inicio) + ' a ' + f(p.fim); };
  const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // item: { kicker, titulo, valor, valor_rotulo, resumo, status, cena, link, fonte }
  async function render(canvas, item, formato) {
    const F = FMT[formato] || FMT.story, H = F.H;
    try { await Promise.all(['800 80px Fraunces', '700 30px Inter', '400 40px Inter', '600 30px Inter'].map(f => document.fonts.load(f))); } catch (e) { }
    canvas.width = W * K; canvas.height = H * K; const ctx = canvas.getContext('2d'); ctx.setTransform(K, 0, 0, K, 0, 0); ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = P; ctx.fillRect(0, 0, W, H);
    // ilustração no topo, recortada para preencher a faixa
    let top = 16, im = item.cena ? await load('img/cenas/' + item.cena + '.jpg') : null;
    if (im) { const ar = W / F.img, iar = im.width / im.height; let sw = im.width, sh = im.height, sx = 0, sy = 0; if (iar > ar) { sw = im.height * ar; sx = (im.width - sw) / 2; } else { sh = im.width / ar; sy = (im.height - sh) / 2; } ctx.drawImage(im, sx, sy, sw, sh, 0, 16, W, F.img); top = 16 + F.img; }
    // faixa da bandeira e barra lateral
    ctx.fillStyle = V; ctx.fillRect(0, 0, W / 3, 16); ctx.fillStyle = '#fff'; ctx.fillRect(W / 3, 0, W / 3, 16); ctx.fillStyle = A; ctx.fillRect(2 * W / 3, 0, W / 3, 16);
    ctx.fillStyle = V; ctx.fillRect(0, top, 12, H - top);
    // rodapé fixo
    const fy = H - F.foot;
    ctx.fillStyle = '#DAD8CF'; ctx.fillRect(L, fy, MW, 2);
    const lg = await load('img/logo-mark.svg'); const ls = formato === 'feed' ? 104 : 132; if (lg) ctx.drawImage(lg, R - ls, fy + (F.foot - ls) / 2, ls, ls);
    const fw = MW - ls - 32; let y = fy + (formato === 'feed' ? 58 : 72);
    ctx.fillStyle = C; ctx.font = '600 26px Inter, Arial'; ctx.fillText(clip(ctx, 'Fonte: ' + (item.fonte || 'documentos públicos'), fw, 1)[0], L, y); y += formato === 'feed' ? 46 : 56;
    ctx.fillStyle = V; ctx.font = '700 30px Inter, Arial'; ctx.fillText(item.cta || 'Leia completo, com os documentos:', L, y); y += formato === 'feed' ? 46 : 54;
    let fs = 34; do { ctx.font = '700 ' + fs + 'px Inter, Arial'; fs -= 2; } while (ctx.measureText(item.link).width > fw && fs > 18); ctx.fillStyle = A; ctx.fillText(item.link, L, y);
    // bloco de conteúdo: mede, ajusta e centraliza na vertical
    const zoneTop = top + (im ? 56 : 110), zoneBot = fy - 56, avail = zoneBot - zoneTop;
    let tSize = F.title, bLines = formato === 'feed' ? 4 : 7, plan;
    for (let tries = 0; tries < 30; tries++) {
      plan = layout(ctx, item, tSize, F.body, bLines);
      if (plan.h <= avail) break;
      if (bLines > 2) bLines--; else if (tSize > 48) tSize -= 4; else break;
    }
    let cy = zoneTop + Math.max(0, (avail - plan.h) / 2);
    for (const op of plan.ops) { op(ctx, cy); }
    return canvas;
    function layout(ctx, it, ts, bs, bl) {
      const ops = []; let h = 0;
      const add = (dh, fn) => { const y0 = h; ops.push((c, base) => fn(c, base + y0)); h += dh; };
      ctx.font = '700 28px Inter, Arial';
      add(40, (c, y) => { c.fillStyle = A; c.font = '700 28px Inter, Arial'; c.fillText(clip(c, (it.kicker || '').toUpperCase(), MW, 1)[0] || '', L, y + 28); });
      h += 24;
      ctx.font = `800 ${ts}px Fraunces, Georgia, serif`; const tl = clip(ctx, it.titulo, MW, 5), lh = Math.round(ts * 1.12);
      add(tl.length * lh, (c, y) => { c.fillStyle = T; c.font = `800 ${ts}px Fraunces, Georgia, serif`; tl.forEach((l, i) => c.fillText(l, L, y + ts + i * lh)); });
      if (it.valor) {
        h += 36; const v = brl(it.valor), vs = Math.round(ts * 1.25);
        ctx.font = `800 ${vs}px Fraunces, Georgia, serif`; const vw = Math.min(ctx.measureText(v).width, MW);
        add(vs + 8, (c, y) => { c.fillStyle = M; c.fillRect(L - 10, y + vs * .12, vw + 20, vs * .98); c.fillStyle = T; c.font = `800 ${vs}px Fraunces, Georgia, serif`; c.fillText(v, L, y + vs * .9); });
        if (it.valor_rotulo) { ctx.font = '500 28px Inter, Arial'; const rl = clip(ctx, it.valor_rotulo, MW, 2); h += 12; add(rl.length * 38, (c, y) => { c.fillStyle = C; c.font = '500 28px Inter, Arial'; rl.forEach((l, i) => c.fillText(l, L, y + 28 + i * 38)); }); }
      }
      if (it.resumo && bl > 0) {
        h += 36; ctx.font = `400 ${bs}px Inter, Arial`; const bLs = clip(ctx, it.resumo, MW, bl), blh = Math.round(bs * 1.45);
        add(bLs.length * blh, (c, y) => { c.fillStyle = '#2B3530'; c.font = `400 ${bs}px Inter, Arial`; bLs.forEach((l, i) => c.fillText(l, L, y + bs + i * blh)); });
      }
      if (it.status) {
        h += 36; const st = it.status.toUpperCase(); ctx.font = '700 26px Inter, Arial'; const sw = ctx.measureText(st).width + 44;
        add(52, (c, y) => { c.fillStyle = it.status === 'comprovado' ? '#E5F2EA' : it.status === 'em juízo' ? '#E2E9F3' : '#FFF4D1'; rr(c, L, y, sw, 52, 4); c.fill(); c.fillStyle = it.status === 'comprovado' ? '#2E7D4F' : it.status === 'em juízo' ? A : '#7A5B00'; c.font = '700 26px Inter, Arial'; c.fillText(st, L + 22, y + 35); });
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
  return { render, share, save, fmtPer, brl };
})();

// Painel privado: estatísticas, denúncias e envio de notificações. Exige ADMIN_TOKEN no cabeçalho Authorization.
const { ok, pipe, one, body, day, send, isAdmin, clean } = require('./_db');
module.exports = async (req, res) => {
  if (!isAdmin(req)) return send(res, 401, { erro: 'Acesso negado.' });
  if (!ok()) return send(res, 200, { off: true, erro: 'Banco de dados não configurado.' });
  try {
    if (req.method === 'POST') {
      const b = await body(req);
      if (b.acao === 'push') return send(res, 200, await enviar(b));
      if (b.acao === 'den-status') { await one('HSET', 'den:st', clean(b.protocolo, 40), clean(b.status, 20)); return send(res, 200, { ok: 1 }); }
      return send(res, 400, {});
    }
    const now = Date.now(), dias = [];
    for (let i = 29; i >= 0; i--) dias.push(day(now - i * 864e5));
    await pipe([['ZREMRANGEBYSCORE', 'on', 0, now - 90e3]]);
    const pages = (await one('SMEMBERS', 'pages')) || [];
    const cmds = [['GET', 'v:_all'], ['PFCOUNT', 'u:_all'], ['GET', 's:_all'], ['GET', 'r:_all:like'], ['GET', 'r:_all:dislike'], ['ZCARD', 'on'], ['SCARD', 'push'], ['GET', 'den:n'], ['HGETALL', 'sk:_all'], ['LRANGE', 'den', 0, 299], ['HGETALL', 'den:st']];
    dias.forEach(d => cmds.push(['GET', 'd:' + d], ['PFCOUNT', 'u:' + d], ['GET', 'sd:' + d]));
    pages.forEach(p => cmds.push(['GET', 'v:' + p], ['GET', 'r:' + p + ':like'], ['GET', 'r:' + p + ':dislike'], ['GET', 's:' + p]));
    const r = await pipe(cmds); let k = 11;
    const pairs = a => { const o = {}; for (let i = 0; a && i < a.length; i += 2) o[a[i]] = +a[i + 1] || a[i + 1]; return o; };
    const serie = dias.map(d => ({ dia: d, views: +r[k++] || 0, unicos: +r[k++] || 0, shares: +r[k++] || 0 }));
    const paginas = pages.map(p => ({ p, views: +r[k++] || 0, like: +r[k++] || 0, dislike: +r[k++] || 0, shares: +r[k++] || 0 })).sort((a, b) => b.views - a.views);
    const st = pairs(r[10]);
    send(res, 200, { total: { views: +r[0] || 0, unicos: +r[1] || 0, shares: +r[2] || 0, like: +r[3] || 0, dislike: +r[4] || 0, online: +r[5] || 0, inscritos: +r[6] || 0, denuncias: +r[7] || 0 }, porFormato: pairs(r[8]), serie, paginas, denuncias: (r[9] || []).map(x => { try { const o = JSON.parse(x); o.status = st[o.protocolo] || 'nova'; return o; } catch (e) { return null; } }).filter(Boolean) });
  } catch (e) { send(res, 500, { erro: String(e.message || e) }); }
};
async function enviar(b) {
  let webpush; try { webpush = require('web-push'); } catch (e) { return { erro: 'Biblioteca web-push ausente.' }; }
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return { erro: 'Chaves VAPID não configuradas.' };
  webpush.setVapidDetails('mailto:' + (process.env.VAPID_EMAIL || 'contato@example.com'), process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const subs = (await one('SMEMBERS', 'push')) || [], payload = JSON.stringify({ title: clean(b.title, 80) || 'Acopiara Transparente', body: clean(b.body, 200), url: clean(b.url, 200) || '/' });
  let enviados = 0, removidos = 0;
  await Promise.all(subs.map(async s => { try { await webpush.sendNotification(JSON.parse(s), payload, { TTL: 86400 }); enviados++; } catch (e) { if (e.statusCode === 404 || e.statusCode === 410) { await one('SREM', 'push', s); removidos++; } } }));
  return { enviados, removidos, total: subs.length };
}

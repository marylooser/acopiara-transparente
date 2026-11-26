// Recebe denúncias, reclamações, notícias e pedidos de correção. Não guarda IP: só um resumo (hash) para limitar abusos.
const crypto = require('crypto');
const { ok, pipe, body, clean, send } = require('./_db');
const TIPOS = ['denuncia', 'reclamacao', 'noticia', 'correcao', 'outro'];
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, {});
  if (!ok()) return send(res, 503, { erro: 'O canal está temporariamente indisponível.' });
  try {
    const b = await body(req);
    if (b.site) return send(res, 200, { protocolo: 'ok' }); // armadilha para robôs
    const texto = clean(b.texto, 6000);
    if (texto.length < 30) return send(res, 400, { erro: 'Descreva o fato com pelo menos 30 caracteres.' });
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const h = crypto.createHash('sha256').update(ip + (process.env.ADMIN_TOKEN || 'x')).digest('hex').slice(0, 16);
    const hr = new Date().toISOString().slice(0, 13);
    const [n] = await pipe([['INCR', 'rl:' + h + ':' + hr], ['EXPIRE', 'rl:' + h + ':' + hr, 3700]]);
    if (n > 5) return send(res, 429, { erro: 'Muitos envios em pouco tempo. Tente de novo em uma hora.' });
    const protocolo = 'AT-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const item = { protocolo, em: new Date().toISOString(), tipo: TIPOS.includes(b.tipo) ? b.tipo : 'outro', area: clean(b.area, 60), local: clean(b.local, 160), quando: clean(b.quando, 40), texto, links: clean(b.links, 1200), contato: b.anonimo ? '' : clean(b.contato, 160), anonimo: !!b.anonimo, origem: h };
    await pipe([['LPUSH', 'den', JSON.stringify(item)], ['LTRIM', 'den', 0, 4999], ['INCR', 'den:n']]);
    send(res, 200, { protocolo });
  } catch (e) { send(res, 500, { erro: 'Não foi possível registrar agora. Tente novamente.' }); }
};

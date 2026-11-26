// Inscrição para notificações (Web Push). GET devolve a chave pública; POST inscreve; DELETE cancela.
const { ok, pipe, body, send } = require('./_db');
module.exports = async (req, res) => {
  if (req.method === 'GET') return send(res, 200, { key: process.env.VAPID_PUBLIC_KEY || null });
  if (!ok()) return send(res, 200, { off: true });
  try {
    const b = await body(req), s = b.subscription;
    if (!s || !s.endpoint || !/^https:\/\//.test(s.endpoint)) return send(res, 400, {});
    const v = JSON.stringify({ endpoint: s.endpoint, keys: s.keys || {} });
    await pipe([[req.method === 'DELETE' ? 'SREM' : 'SADD', 'push', v]]);
    send(res, 200, { ok: 1 });
  } catch (e) { send(res, 200, { off: true }); }
};

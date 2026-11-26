// Presença: quem está com o site aberto agora (janela de 90 segundos). Usado só no painel.
const { ok, pipe, body, clean, send } = require('./_db');
module.exports = async (req, res) => {
  if (!ok()) return send(res, 200, { off: true });
  try { const b = await body(req), sid = clean(b.sid, 40); if (sid) await pipe([['ZADD', 'on', Date.now(), sid]]); send(res, 200, { ok: 1 }); }
  catch (e) { send(res, 200, { off: true }); }
};

// Conta compartilhamentos por página e por formato (stories, feed, link, whatsapp).
const { ok, pipe, body, page, clean, day, send } = require('./_db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, {});
  if (!ok()) return send(res, 200, { off: true });
  try {
    const b = await body(req), p = page(b.p), kind = clean(b.kind, 16).replace(/\W/g, '') || 'link';
    const r = await pipe([['INCR', 's:' + p], ['HINCRBY', 'sk:' + p, kind, 1], ['INCR', 's:_all'], ['HINCRBY', 'sk:_all', kind, 1], ['INCR', 'sd:' + day()]]);
    send(res, 200, { shares: +r[0] || 0 });
  } catch (e) { send(res, 200, { off: true }); }
};

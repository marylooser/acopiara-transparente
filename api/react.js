// Curtir / não curtir. Um voto por visitante e por página; clicar de novo desfaz.
const { ok, pipe, one, body, page, clean, send } = require('./_db');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, {});
  if (!ok()) return send(res, 200, { off: true });
  try {
    const b = await body(req), p = page(b.p), sid = clean(b.sid, 40), v = b.v === 'dislike' ? 'dislike' : 'like';
    if (!sid) return send(res, 400, {});
    const prev = await one('HGET', 'rv:' + p, sid), cmds = [];
    if (prev) cmds.push(['DECR', 'r:' + p + ':' + prev], ['HDEL', 'rv:' + p, sid]);
    if (prev !== v) cmds.push(['INCR', 'r:' + p + ':' + v], ['HSET', 'rv:' + p, sid, v], ['INCR', 'r:_all:' + v]);
    cmds.push(['GET', 'r:' + p + ':like'], ['GET', 'r:' + p + ':dislike']);
    const r = await pipe(cmds), k = r.length;
    send(res, 200, { like: Math.max(0, +r[k - 2] || 0), dislike: Math.max(0, +r[k - 1] || 0), mine: prev === v ? null : v });
  } catch (e) { send(res, 200, { off: true }); }
};

// Registra uma visualização e devolve os contadores da página (visualizações, reações, compartilhamentos).
const { ok, pipe, body, page, clean, day, send } = require('./_db');
module.exports = async (req, res) => {
  if (!ok()) return send(res, 200, { off: true });
  try {
    const b = req.method === 'POST' ? await body(req) : req.query || {};
    const p = page(b.p), sid = clean(b.sid, 40) || 'anon', now = Date.now(), d = day(), count = req.method === 'POST';
    const cmds = [];
    if (count) cmds.push(['INCR', 'v:' + p], ['INCR', 'v:_all'], ['INCR', 'd:' + d], ['HINCRBY', 'dp:' + d, p, 1], ['PFADD', 'u:' + d, sid], ['PFADD', 'u:_all', sid], ['SADD', 'pages', p], ['ZADD', 'on', now, sid]);
    cmds.push(['GET', 'v:' + p], ['GET', 'r:' + p + ':like'], ['GET', 'r:' + p + ':dislike'], ['GET', 's:' + p], ['HGET', 'rv:' + p, sid]);
    const r = await pipe(cmds), k = r.length;
    send(res, 200, { views: +r[k - 5] || 0, like: +r[k - 4] || 0, dislike: +r[k - 3] || 0, shares: +r[k - 2] || 0, mine: r[k - 1] || null });
  } catch (e) { send(res, 200, { off: true }); }
};

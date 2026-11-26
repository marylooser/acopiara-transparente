// Acesso ao Redis (Upstash, via REST). Funciona com as variáveis criadas pela integração da Vercel.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOK = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ok = () => !!(URL_ && TOK);
async function pipe(cmds) {
  if (!ok()) throw new Error('db-off');
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('db ' + r.status);
  return (await r.json()).map(x => x.result);
}
const one = async (...c) => (await pipe([c]))[0];
function body(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(res => { let d = ''; req.on('data', c => { d += c; if (d.length > 2e5) req.destroy(); }); req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch (e) { res({}); } }); });
}
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const page = p => clean(p, 120).replace(/[^\w\/\-.]/g, '') || '/';
const day = (t = Date.now()) => new Date(t - 3 * 3600e3).toISOString().slice(0, 10); // horário de Fortaleza
function send(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function isAdmin(req) { const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, ''); return !!process.env.ADMIN_TOKEN && t.length > 0 && t === process.env.ADMIN_TOKEN; }
module.exports = { ok, pipe, one, body, clean, page, day, send, isAdmin };

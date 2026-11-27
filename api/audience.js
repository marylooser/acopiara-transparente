// Anonymous aggregate audience counts. No IP, user-agent, referrer or query is stored.
const crypto = require('node:crypto');
const { ok, one, body, day, send } = require('./_db');
const PREFIX = 'at:{audience}:v1:';
const SCRIPT = `
local root, now, sid, path, date, event, kind = KEYS[1], tonumber(ARGV[1]), ARGV[2], ARGV[3], ARGV[4], ARGV[5], ARGV[6]
local total, daily, online = root..'total', root..'day:'..date, root..'online'
local pageOnline = root..'online:'..path
if sid ~= '' then
  local session = root..'session:'..sid
  if redis.call('SET', session, '1', 'NX', 'EX', 1800) then
    redis.call('HINCRBY', total, 'visits', 1)
    redis.call('HINCRBY', daily, 'visits', 1)
  end
  redis.call('EXPIRE', session, 1800)
  local previous = redis.call('GET', root..'path:'..sid)
  if previous and previous ~= path then redis.call('ZREM', root..'online:'..previous, sid) end
  redis.call('SET', root..'path:'..sid, path, 'EX', 120)
  redis.call('ZADD', online, now, sid)
  redis.call('ZADD', pageOnline, now, sid)
  redis.call('EXPIRE', pageOnline, 150)
  if kind == 'view' and redis.call('SET', root..'event:'..sid..':'..event, '1', 'NX', 'EX', 600) then
    redis.call('HINCRBY', total, 'views', 1)
    redis.call('HINCRBY', daily, 'views', 1)
    redis.call('HINCRBY', root..'pages', path, 1)
  end
  redis.call('SET', root..'since', date, 'NX')
  redis.call('EXPIRE', daily, 34560000)
end
redis.call('ZREMRANGEBYSCORE', online, '-inf', now-90000)
redis.call('ZREMRANGEBYSCORE', pageOnline, '-inf', now-90000)
return {redis.call('HGET', total, 'visits') or '0', redis.call('HGET', total, 'views') or '0', redis.call('ZCARD', online), redis.call('ZCARD', pageOnline), redis.call('GET', root..'since') or ''}
`;
function cors(req,res) {
  const origin=req.headers.origin;
  const allowed=['https://acopiaratransparente.com.br','https://www.acopiaratransparente.com.br'];
  if (origin && !allowed.includes(origin) && !(process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))) return false;
  if (origin) {res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('X-Content-Type-Options','nosniff');
  return true;
}
function validPage(p) {return typeof p==='string' && /^(inicio|casos|noticias|dinheiro|pessoas|processos|linha-do-tempo|fiscalize|direitos|denuncie|editorial|sobre|(?:caso|noticia|pessoa)\/[a-zA-Z0-9_-]{1,100})$/.test(p);}
module.exports=async(req,res)=>{
  if (!cors(req,res)) return send(res,403,{off:true});
  if (req.method==='OPTIONS') {res.statusCode=204;return res.end();}
  if (!['GET','POST'].includes(req.method)) return send(res,405,{off:true});
  if (!ok()) return send(res,503,{off:true});
  try {
    const b=req.method==='POST' ? await body(req) : req.query || {};
    if (JSON.stringify(b).length>2048 || !validPage(b.p || 'inicio')) return send(res,400,{off:true});
    if (b.export==='daily' && req.method==='GET') {
      const days=Array.from({length:31},(_,i)=>day(Date.now()-(30-i)*86400000));
      const rows=await Promise.all(days.map(async d=>[d,+(await one('HGET',PREFIX+'day:'+d,'visits'))||0,+(await one('HGET',PREFIX+'day:'+d,'views'))||0]));
      res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('Content-Disposition','attachment; filename="audiencia-acopiara-31-dias.csv"');
      return res.end('\uFEFFdata;visitas;visualizacoes\n'+rows.map(r=>r.join(';')).join('\n')+'\n');
    }
    const writing=req.method==='POST';
    if (writing && (!/^[a-zA-Z0-9-]{20,80}$/.test(b.sid || '') || !['view','ping'].includes(b.kind) || !/^[a-zA-Z0-9-]{10,80}$/.test(b.event || ''))) return send(res,400,{off:true});
    const sid=writing ? crypto.createHmac('sha256',process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN).update(b.sid).digest('hex').slice(0,32) : '';
    const r=await one('EVAL',SCRIPT,1,PREFIX,String(Date.now()),sid,b.p||'inicio',day(),writing?b.event:'',writing?b.kind:'read');
    if (!Array.isArray(r) || r.length!==5) throw new Error('audience unavailable');
    send(res,200,{visits:+r[0],views:+r[1],online:+r[2],pageOnline:+r[3],since:r[4],activeWindowSeconds:90});
  } catch (_) {send(res,503,{off:true});}
};

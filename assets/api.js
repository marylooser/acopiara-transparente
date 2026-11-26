// Contadores, reações, compartilhamentos, presença, notificações e instalação como aplicativo.
// Se o servidor (funções da Vercel + banco) não estiver configurado, tudo some sem erro.
window.API = (function () {
  let sid = '';
  try { sid = localStorage.getItem('sid') || ''; if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('sid', sid); } } catch (e) { sid = 'x' + Math.random().toString(36).slice(2); }
  let off = location.protocol === 'file:';
  const post = (u, b) => off ? Promise.resolve({ off: true }) : fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ sid }, b)), keepalive: true }).then(r => r.json()).catch(() => ({ off: true }));
  // Contador público sem servidor próprio (GitHub Pages): abacus.jasoncameron.dev, só números, nenhum dado pessoal.
  const AB = 'https://abacus.jasoncameron.dev', NS = 'acopiara-transparente';
  const key = (p, s) => (String(p).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 58) || 'inicio') + '-' + s;
  const abGet = k => fetch(`${AB}/get/${NS}/${k}`).then(r => r.ok ? r.json() : { value: 0 }).then(j => j.value || 0).catch(() => null);
  const abHit = k => fetch(`${AB}/hit/${NS}/${k}`).then(r => r.json()).then(j => j.value || 0).catch(() => null);
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { } };
  const ss = k => { try { if (sessionStorage.getItem(k)) return true; sessionStorage.setItem(k, '1'); } catch (e) { } return false; };
  let useAb = null; // null = ainda não sabe; true = usa o contador público
  async function server(u, b) { if (useAb) return { off: true }; const r = await post(u, b); if (r.off) useAb = true; else useAb = false; return r; }
  async function abState(p, countView) {
    const [views, like, dislike, shares] = await Promise.all([countView && !ss('v:' + p) ? abHit(key(p, 'v')) : abGet(key(p, 'v')), abGet(key(p, 'l')), abGet(key(p, 'd')), abGet(key(p, 's'))]);
    if (views === null && like === null) return { off: true };
    return { views: views || 0, like: like || 0, dislike: dislike || 0, shares: shares || 0, mine: ls('r:' + p) || '' };
  }
  async function hit(p) { const r = await server('/api/hit', { p }); return r.off ? abState(p, true) : r; }
  async function react(p, v) {
    const r = await server('/api/react', { p, v }); if (!r.off) return r;
    if (!ls('r:' + p)) { ls('r:' + p, v); await abHit(key(p, v === 'like' ? 'l' : 'd')); }
    return abState(p, false);
  }
  async function share(p, kind) { const r = await server('/api/share', { p, kind }); if (!r.off) return r; await abHit(key(p, 's')); return abState(p, false); }
  const denuncia = d => (off || useAb) ? Promise.resolve({ erro: 'O canal está temporariamente indisponível.' }) : fetch('/api/denuncia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()).catch(() => ({ erro: 'Sem conexão. Tente novamente.' }));
  // presença discreta: um sinal a cada 45 s enquanto a aba está visível
  setInterval(() => { if (!off && useAb === false && document.visibilityState === 'visible') post('/api/ping', {}); }, 45000);

  // ----- aplicativo (PWA) -----
  let promptEv = null;
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptEv = e; document.dispatchEvent(new Event('api:install')); });
  const canInstall = () => !!promptEv;
  async function install() { if (!promptEv) return false; promptEv.prompt(); const r = await promptEv.userChoice; promptEv = null; return r.outcome === 'accepted'; }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  // ----- notificações (Web Push) -----
  const pushOK = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && location.protocol === 'https:';
  const b64 = s => { const p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...b].map(c => c.charCodeAt(0))); };
  async function subscribe() {
    if (!pushOK()) return { erro: isIOS && !standalone ? 'No iPhone, primeiro adicione o site à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abra por lá.' : 'Este navegador não aceita notificações.' };
    const k = await fetch('/api/push').then(r => r.json()).catch(() => ({}));
    if (!k.key) return { erro: 'As notificações ainda não foram ativadas no servidor.' };
    const perm = await Notification.requestPermission(); if (perm !== 'granted') return { erro: 'Permissão negada no navegador.' };
    const reg = await navigator.serviceWorker.ready;
    const s = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(k.key) });
    await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: s }) });
    try { localStorage.setItem('push', '1'); } catch (e) { }
    return { ok: true };
  }
  const subscribed = () => { try { return localStorage.getItem('push') === '1'; } catch (e) { return false; } };
  return { sid, hit, react, share, denuncia, canInstall, install, isIOS, standalone, pushOK, subscribe, subscribed, get off() { return off; } };
})();

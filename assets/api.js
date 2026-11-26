// Contadores, reações, compartilhamentos, presença, notificações e instalação como aplicativo.
// Se o servidor (funções da Vercel + banco) não estiver configurado, tudo some sem erro.
window.API = (function () {
  let sid = '';
  try { sid = localStorage.getItem('sid') || ''; if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('sid', sid); } } catch (e) { sid = 'x' + Math.random().toString(36).slice(2); }
  let off = location.protocol === 'file:';
  const post = (u, b) => off ? Promise.resolve({ off: true }) : fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ sid }, b)), keepalive: true }).then(r => r.json()).catch(() => ({ off: true }));
  async function hit(p) { const r = await post('/api/hit', { p }); if (r.off) off = true; return r; }
  const react = (p, v) => post('/api/react', { p, v });
  const share = (p, kind) => post('/api/share', { p, kind });
  const denuncia = d => off ? Promise.resolve({ erro: 'O canal está temporariamente indisponível.' }) : fetch('/api/denuncia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()).catch(() => ({ erro: 'Sem conexão. Tente novamente.' }));
  // presença discreta: um sinal a cada 45 s enquanto a aba está visível
  setInterval(() => { if (!off && document.visibilityState === 'visible') post('/api/ping', {}); }, 45000);

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

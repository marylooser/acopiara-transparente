// Service worker: funciona offline com o que já foi visto e recebe notificações.
const V = 'at-v28';
const CORE = ["./", "index.html", "manifest.webmanifest", "assets/styles.css", "assets/interface.css", "assets/sharing.css", "assets/theme-art.css", "assets/tables.css", "assets/app.js", "assets/publications.js", "data/publicacoes.json", "assets/api.js", "assets/audience.js", "data/services.json", "assets/cards.js", "assets/scenes.js", "assets/illustrations.js", "assets/theme-art.js", "assets/reading-motion.js", "assets/tables.js", "assets/doodles.js", "img/favicon.svg", "img/favicon-light.svg", "img/favicon-dark.svg", "img/logo-mark.svg", "img/logo-mark-dark.svg", "img/notification-badge.png", "img/editorial/capa-acopiara.webp", "img/editorial/night/capa-acopiara.webp", "img/editorial/rodape-acopiara.webp", "img/editorial/night/rodape-acopiara.webp", "img/editorial/rodape-sao-francisco.webp", "img/editorial/night/rodape-sao-francisco.webp", "data/casos.json", "data/site.json", "data/noticias.json", "data/perfis.json", "data/dinheiro.json", "data/processos.json", "data/transferencias-federais-resumo.csv"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => 0)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('at-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function validCached(request) {
  const cache = await caches.open(V), result = await cache.match(request);
  if (result && !result.ok) { await cache.delete(request); return undefined; }
  return result;
}
async function networkResult(request) {
  try {
    const result = await fetch(request);
    if (result.ok) { const cache = await caches.open(V); await cache.put(request, result.clone()); return result; }
    return await validCached(request) || result;
  } catch (_) { return await validCached(request) || Response.error(); }
}
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/') || u.pathname.includes('/painel')) return;
  const fresh = u.pathname.includes('/data/') || u.pathname.endsWith('/') || /\.(?:html|js|css)$/.test(u.pathname);
  e.respondWith(fresh ? networkResult(e.request) : validCached(e.request).then(cached => cached || networkResult(e.request)));
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Acopiara Transparente', body: e.data ? e.data.text() : 'Nova publicação no site.' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Acopiara Transparente', { body: d.body || '', icon: 'img/icon-192.png', badge: 'img/notification-badge.png', data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', e => { e.notification.close(); const url = (e.notification.data && e.notification.data.url) || '/'; e.waitUntil(clients.matchAll({ type: 'window' }).then(ws => { for (const w of ws) if ('focus' in w) { w.navigate(url); return w.focus(); } return clients.openWindow(url); })); });

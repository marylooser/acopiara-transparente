/* Isolated counter: no article route, query, profile name or form content is sent to the provider. */
(() => {
  'use strict';
  const box=document.getElementById('provider-audience');
  if (!box || !['acopiaratransparente.com.br','www.acopiaratransparente.com.br'].includes(location.hostname)) return;
  if (navigator.webdriver || navigator.globalPrivacyControl || navigator.doNotTrack==='1') return;
  fetch('data/services.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).then(config=>{
    if(!config.stats4u?.id) return;
    const frame=document.createElement('iframe');
    frame.src='contador.html';frame.title='Contador de acessos e presença recente no portal';frame.width='220';frame.height='70';
    frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';
    frame.onload=()=>{box.hidden=false;box.querySelector('time').textContent=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});};
    box.querySelector('.counter-frame').appendChild(frame);
  }).catch(()=>{});
})();

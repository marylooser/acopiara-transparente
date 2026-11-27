/* Session-level totals; visible tabs send presence signals. Counts require a configured service. */
(() => {
  'use strict';
  const box=document.getElementById('audience'), state={endpoint:null,path:null,last:null,inflight:false,viewEvent:null};
  const uuid=()=>crypto.randomUUID();
  const optedOut=()=>navigator.globalPrivacyControl===true || navigator.doNotTrack==='1';
  const testing=navigator.webdriver && !['localhost','127.0.0.1'].includes(location.hostname);
  let memory=null;
  function session() {
    let value=memory;
    try {value=JSON.parse(localStorage.getItem('audience-session') || 'null');}catch(_){}
    if (!value || typeof value.id!=='string' || Date.now()-value.at>=1800000) value={id:uuid(),at:Date.now()};
    value.at=Date.now();memory=value;
    try {localStorage.setItem('audience-session',JSON.stringify(value));}catch(_){}
    return value.id;
  }
  function page() {
    const path=(location.hash.replace(/^#\/?/,'').split('?')[0] || 'inicio').replace(/\/$/,'');
    if(path.startsWith('pessoa/')) {try{return 'pessoa/'+decodeURIComponent(path.slice(7)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);}catch(_){return 'pessoas';}}
    return path;
  }
  function paint(data) {
    if (!box || data.off || !['visits','views','online','pageOnline'].every(k=>Number.isSafeInteger(data[k]) && data[k]>=0)) {if(box) box.hidden=true;return;}
    const n=v=>v.toLocaleString('pt-BR');
    box.hidden=false;
    box.querySelector('[data-audience="online"]').textContent=n(data.online);
    box.querySelector('[data-audience="pageOnline"]').textContent=n(data.pageOnline);
    box.querySelector('[data-audience="visits"]').textContent=n(data.visits);
    box.querySelector('[data-audience="views"]').textContent=n(data.views);
    box.querySelector('[data-audience="since"]').textContent=data.since ? data.since.split('-').reverse().join('/') : 'início do registro';
    const url=new URL(state.endpoint);url.searchParams.set('export','daily');url.searchParams.set('p','inicio');
    box.querySelector('[data-audience-export]').href=url.href;
  }
  async function update(kind,expected=state.path,event=state.viewEvent) {
    if (!state.endpoint || document.visibilityState!=='visible' || state.inflight) return;
    state.inflight=true;
    try {
      let request, url=state.endpoint;
      if (optedOut() || testing) {const u=new URL(url);u.searchParams.set('p',expected);url=u.href;request={cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'};}
      else request={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sid:session(),p:expected,kind,event}),credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)};
      const r=await fetch(url,request);if(!r.ok) throw new Error('offline');
      const data=await r.json();
      if(expected===state.path) {paint(data);if(!data.off && kind==='view') state.last=expected;}
    }catch(_){if(box) box.hidden=true;}
    finally {state.inflight=false;if(state.path!==expected) update('view');}
  }
  function route() {const next=page();if(next===state.path) return;state.path=next;state.viewEvent=uuid();update('view');}
  fetch('data/services.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).then(config=>{
    if (!config.audience) return;
    const url=new URL(config.audience,location.href);
    if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname)) return;
    state.endpoint=url.href;route();
    setInterval(()=>update(state.last===state.path?'ping':'view'),45000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')update(state.last===state.path?'ping':'view');});
    window.addEventListener('hashchange',route);
  }).catch(()=>{});
})();

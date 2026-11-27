/* PDFs completos, produzidos a partir da versão publicada e das fontes indicadas. */
window.PUBLICATIONS = (() => {
  let manifest;
  const load = () => manifest ||= fetch('data/publicacoes.json', {cache:'no-cache'})
    .then(r => { if (!r.ok) throw new Error('manifest'); return r.json(); })
    .catch(() => { manifest = null; return null; });
  const filePath = s => typeof s === 'string' && /^publicacoes\/(caso|noticia)-[a-z0-9-]+\.pdf$/.test(s);
  const formatSize = n => n >= 1048576 ? (n / 1048576).toLocaleString('pt-BR', {maximumFractionDigits:1}) + ' MB' : Math.ceil(n / 1024) + ' KB';
  async function mount(root, route) {
    if (!root) return;
    const [kind,id] = String(route || '').split('?')[0].split('/');
    if (!['caso','noticia'].includes(kind) || !id) return;
    const data = await load();
    if (!root.isConnected) return;
    const item = data?.publications?.find(x => x.kind === kind && x.id === id);
    if (!item || !filePath(item.pdf)) return;
    const url = new URL(item.pdf, location.href.split('#')[0]);
    url.searchParams.set('v', String(item.sha256 || '').slice(0,12));
    const box = document.createElement('section'); box.className='document-export';
    const title = document.createElement('h4'); title.textContent='Leve a matéria em documento';
    const info = document.createElement('p'); info.className='muted';
    info.textContent=`PDF completo, com tabelas, recortes e fontes. ${item.pages} páginas · ${formatSize(item.bytes)} · versão de ${String(item.exported).split('-').reverse().join('/')}.`;
    const actions=document.createElement('div'); actions.className='btns';
    const download=document.createElement('a'); download.className='btn'; download.href=url.href;download.download=item.pdf.split('/').pop();download.textContent='Baixar matéria em PDF';actions.append(download);
    const message=document.createElement('p');message.className='document-export-status muted';message.setAttribute('role','status');
    if(navigator.share && navigator.canShare){
      const button=document.createElement('button');button.type='button';button.className='btn ghost';button.textContent='Preparar PDF para enviar';
      let file=null;
      button.onclick=async()=>{
        if(file){
          try{await navigator.share({files:[file],title:item.title});}
          catch(e){if(e.name!=='AbortError')message.textContent='O envio de arquivos não está disponível aqui. Baixe o PDF e anexe na conversa ou publicação.';}
          return;
        }
        button.disabled=true;button.textContent='Preparando PDF…';message.textContent='';
        try{
          const response=await fetch(url.href);if(!response.ok)throw Error('download');
          const blob=await response.blob();
          const signature=new TextDecoder().decode(await blob.slice(0,5).arrayBuffer());
          if(signature!=='%PDF-')throw Error('format');
          const candidate=new File([blob],download.download,{type:'application/pdf'});
          if(!navigator.canShare({files:[candidate]})){button.hidden=true;message.textContent='Baixe o PDF para anexar no aplicativo que preferir.';return;}
          file=candidate;button.textContent='Enviar PDF';message.textContent='PDF pronto. Toque em Enviar PDF para escolher o aplicativo.';
        }catch(_){button.textContent='Tentar preparar novamente';message.textContent='Não foi possível preparar o envio. Você pode usar Baixar matéria em PDF.';}
        finally{button.disabled=false;}
      };
      actions.append(button);
    }
    if(item.bundle && /^https:\/\/archive\.org\/download\//.test(item.bundle)){
      const bundle=document.createElement('a');bundle.className='btn ghost';bundle.href=item.bundle;bundle.textContent='Matéria + documentos (ZIP)';bundle.target='_blank';bundle.rel='noopener';actions.append(bundle);
    }
    box.append(title,info,actions,message);root.replaceChildren(box);
  }
  return {mount};
})();

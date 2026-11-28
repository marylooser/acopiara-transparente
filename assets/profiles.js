/* Public biographies: named sources, local portraits, and explicit social-link provenance. */
window.PROFILES = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = name => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let people = new Map(), criteria = '';
  const get = name => people.get(key(name));
  function set(data) {
    people = new Map((data?.pessoas || []).map(person => [key(person.nome), person]));
    criteria = data?.criterios || '';
  }
  function summary(name) { return get(name)?.resumo || ''; }
  function avatar(person, initials) {
    const source = get(person.nome)?.foto;
    const path = source?.arquivo || person.foto;
    const fallback = `<span class="avatar" aria-hidden="true">${escape(initials)}</span>`;
    return path ? `<span class="portrait">${fallback}<img class="avatar" data-portrait src="${escape(path)}" alt="Retrato de ${escape(person.nome)}" width="72" height="72" loading="lazy" decoding="async"></span>` : fallback;
  }
  function biography(name) {
    const person = get(name);
    if (!person?.trajetoria?.length) return '';
    return `<section class="profile-background" aria-labelledby="profile-background-title"><h2 id="profile-background-title">Formação e trajetória</h2>${person.trajetoria.map(item => `<div class="profile-topic"><h3>${escape(item.titulo)}</h3><p>${escape(item.texto)}</p><p class="profile-citations">${item.fontes.map(source => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.titulo)} ↗</a>`).join('<span aria-hidden="true"> · </span>')}</p></div>`).join('')}</section>`;
  }
  function channels(name) {
    const person = get(name);
    if (!person?.redes?.length) return '';
    const social = person.redes?.length ? person.redes.map(network => `<div class="profile-network"><a class="btn ghost" href="${escape(network.url)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram de ${escape(name)}: ${escape(network.usuario)}">${escape(network.usuario)} ↗</a><p>${escape(network.criterio)} <a href="${escape(network.fonte)}" target="_blank" rel="noopener noreferrer">Conferir origem ↗</a></p></div>`).join('') : `<p class="note">${escape(person.instagramSituacao)} Isso não significa que a pessoa não tenha conta.</p>`;
    return `<section class="box profile-channels" aria-labelledby="profile-channels-title"><h4 id="profile-channels-title">Instagram</h4>${social}</section>`;
  }
  function provenance(name) {
    const person = get(name);
    if (!person) return '';
    const credit = person.foto ? `<span>Retrato: <a href="${escape(person.foto.origem)}" target="_blank" rel="noopener noreferrer">${escape(person.foto.credito)} ↗</a></span>` : '';
    const socialStatus = person.redes?.length ? '' : '<span>Instagram não confirmado nas fontes consultadas.</span>';
    return `<div class="profile-provenance">${credit}${socialStatus}<span>Pesquisa de perfil: ${escape(person.consultadoEm.split('-').reverse().join('/'))}.</span><details><summary>Como identificamos os perfis</summary><p>${escape(criteria)}</p></details></div>`;
  }
  function dossierContext(name) {
    const text = get(name)?.contextoDossie;
    return text ? `<h2>Atuação e ocorrências no dossiê</h2><p>${escape(text)}</p>` : '';
  }
  document.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement && event.target.matches('[data-portrait]')) event.target.remove();
  }, true);
  return {set, get, summary, avatar, biography, channels, provenance, dossierContext};
})();

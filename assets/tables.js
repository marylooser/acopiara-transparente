/* Mantém tabelas densas navegáveis por teclado sem encolher seu conteúdo. */
(() => {
  const seen = new WeakSet();
  const live = new Set();
  function measure(box) {
    const over = box.scrollWidth > box.clientWidth + 1;
    box.dataset.overflow = String(over);
    if (over) {
      box.tabIndex = 0;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', 'Tabela; deslize para ver todas as colunas');
    } else {
      box.removeAttribute('tabindex');
      box.removeAttribute('role');
      box.removeAttribute('aria-label');
    }
  }
  const resize = new ResizeObserver(entries => entries.forEach(e => measure(e.target)));
  function scan() {
    for (const box of live) if (!box.isConnected) { resize.unobserve(box); live.delete(box); }
    document.querySelectorAll('.tscroll').forEach(box => {
      if (!seen.has(box)) { seen.add(box); live.add(box); resize.observe(box); }
      measure(box);
    });
  }
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; scan(); });
  }).observe(document.getElementById('main'), {childList: true, subtree: true});
  document.fonts.ready.then(scan);
  scan();
})();

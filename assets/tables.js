/* Mantém tabelas densas navegáveis por teclado sem encolher seu conteúdo. */
(() => {
  const seen = new WeakSet();
  const live = new Set();
  function measure(box) {
    const table = box.querySelector('table');
    if (!table) return;
    const heads = [...table.querySelectorAll('thead th')];
    const comparable = heads.length > 8 && heads.filter(h => h.classList.contains('num')).length >= heads.length * .65;
    box.dataset.layout = 'table';
    const needsMoreSpace = table.scrollWidth > box.clientWidth + 1;
    box.dataset.layout = needsMoreSpace && !comparable ? 'records' : 'table';
    if (box.dataset.layout === 'records') {
      table.querySelectorAll('tbody tr').forEach(row => [...row.cells].forEach((cell, i) => {
        if (!cell.dataset.label) cell.dataset.label = heads[i]?.textContent || '';
      }));
    }
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

/* Progressive reading cues; content remains available without motion or JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new Set(), live = new Map(), running = new Set(), counters = new Map();
  const immediate = () => reduced.matches || root.dataset.input === 'keyboard';
  const ease = () => getComputedStyle(root).getPropertyValue('--ease-out').trim() || 'cubic-bezier(.23,1,.32,1)';
  const key = (el, kind) => location.hash.split('?')[0] + '|' + kind + '|' + (el.closest('a.card')?.getAttribute('href') || el.textContent.trim().slice(0, 160));
  function play(el, frames, options) {
    const animation = el.animate(frames, options); running.add(animation);
    const clear = () => running.delete(animation);
    animation.onfinish = clear; animation.oncancel = clear;
  }
  function count(el) {
    const finalText = el.textContent, match = /^R\$\s*([\d.,]+)(\s*(?:milhões|milhão|mil|mi))?$/i.exec(finalText.trim());
    if (!match) return;
    const amount = Number(match[1].replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const precision = match[1].includes(',') ? match[1].split(',')[1].length : 0;
    const format = new Intl.NumberFormat('pt-BR', {minimumFractionDigits: precision, maximumFractionDigits: precision});
    const visual = document.createElement('span'), accessible = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true'); accessible.className = 'money-accessible'; accessible.textContent = finalText;
    // Keep the final line height while the shorter intermediate numerals are shown.
    visual.style.display = 'block'; visual.style.minHeight = el.getBoundingClientRect().height + 'px';
    const value = document.createTextNode('R$\u00a0' + format.format(0) + (match[2] || '')); visual.append(value); el.replaceChildren(visual, accessible);
    const began = performance.now(); let frame;
    const finish = () => { cancelAnimationFrame(frame); el.textContent = finalText; counters.delete(el); };
    counters.set(el, finish);
    const tick = now => {
      if (!el.isConnected || immediate()) { finish(); return; }
      const progress = Math.min(1, (now - began) / 280), eased = 1 - Math.pow(1 - progress, 3);
      value.nodeValue = 'R$\u00a0' + format.format(amount * eased) + (match[2] || '');
      if (progress < 1) frame = requestAnimationFrame(tick); else finish();
    };
    frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, kind = live.get(el); observer.unobserve(el); live.delete(el);
      if (!kind || !el.isConnected) return;
      const id = key(el, kind); if (seen.has(id)) return; seen.add(id);
      if (immediate()) return;
      if (kind === 'money') count(el);
      else if (kind === 'bar') {
        el.style.transformOrigin = el.closest('.vb') ? 'center bottom' : 'left center';
        play(el, el.closest('.vb') ? [{transform:'scaleY(.75)'},{transform:'scaleY(1)'}] : [{transform:'scaleX(.75)'},{transform:'scaleX(1)'}], {duration:240,easing:ease()});
      } else {
        // Leave headings and controls immediately available; reveal only reading blocks.
        play(el, [{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:220,easing:ease()});
      }
    });
  }, {threshold:.05});
  function observe(el, kind) { if (live.has(el) || seen.has(key(el, kind))) return; live.set(el, kind); observer.observe(el); }
  function scan(scope) {
    for (const el of live.keys()) if (!el.isConnected) { observer.unobserve(el); live.delete(el); }
    scope.querySelectorAll('.materia > .sec,.reading-section,.rights-section,.card,.lrow,.tut,.proc,.est').forEach(el => observe(el, 'section'));
    scope.querySelectorAll('.stat b,.bigval .mk,.kpi b,.card .val,.lrow .val,.est .v,.bigs b,.financial-summary dd').forEach(el => { if (/^R\$/.test(el.textContent.trim())) observe(el, 'money'); });
    scope.querySelectorAll('.chart .bar i,.chart .vb i').forEach(el => observe(el, 'bar'));
  }
  function finish() { running.forEach(a => a.finish()); counters.forEach(done => done()); }
  document.addEventListener('keydown', finish, true);
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  window.READING_MOTION = {scan};
})();

/* Acopiara Transparente · troca de arte por tema, sem alterar a rota. */
(() => {
  'use strict';
  const root = document.documentElement;
  const selector = 'img[data-light][data-dark],link[rel~="icon"][data-light][data-dark]';
  const states = new WeakMap();
  const pending = new Map();
  const overlays = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const immediate = () => reduced.matches || root.dataset.input === 'keyboard';
  const target = el => el.getAttribute(root.dataset.theme === 'dark' ? 'data-dark' : 'data-light');

  function clearOverlay(state) {
    if (!state.overlay) return;
    clearTimeout(state.timer);
    state.overlay.remove();
    overlays.delete(state);
    state.overlay = null;
  }

  function clearAll() {
    for (const state of overlays) clearOverlay(state);
  }

  function preload(src) {
    if (pending.has(src)) return pending.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = async () => {
        try { await image.decode(); } catch (_) { /* Loaded SVGs may reject decode in older engines. */ }
        if (image.naturalWidth) resolve(); else reject(new Error('Image unavailable'));
      };
      image.onerror = () => reject(new Error('Image unavailable'));
      image.src = src;
    });
    pending.set(src, promise);
    // Share requests in flight without retaining every decoded illustration.
    promise.then(() => pending.delete(src), () => pending.delete(src));
    return promise;
  }

  function previousImage(image, state) {
    const parent = image.parentElement;
    if (!parent) return null;
    if (getComputedStyle(parent).position === 'static') parent.classList.add('art-host');
    const box = image.getBoundingClientRect();
    if (!box.width || !box.height) return null;
    const host = parent.getBoundingClientRect();
    const style = getComputedStyle(image);
    const clone = image.cloneNode(false);
    for (const name of ['id', 'data-light', 'data-dark', 'srcset', 'sizes', 'loading']) clone.removeAttribute(name);
    clone.classList.add('art-previous');
    clone.alt = '';
    clone.setAttribute('aria-hidden', 'true');
    clone.style.cssText = '';
    Object.assign(clone.style, {
      left: `${box.left - host.left - parent.clientLeft + parent.scrollLeft}px`,
      top: `${box.top - host.top - parent.clientTop + parent.scrollTop}px`,
      width: `${box.width}px`, height: `${box.height}px`,
      objectFit: style.objectFit, objectPosition: style.objectPosition,
      borderRadius: style.borderRadius
    });
    parent.append(clone);
    state.overlay = clone;
    overlays.add(state);
    return clone;
  }

  function sync(el) {
    const src = target(el);
    if (!src) return;
    if (el.tagName === 'LINK') {
      if (el.getAttribute('href') !== src) el.setAttribute('href', src);
      return;
    }
    let state = states.get(el);
    if (!state) {
      state = { version: 0, overlay: null, timer: 0, retries: new Set() };
      states.set(el, state);
      const recover = () => {
        const wanted = target(el);
        if (!wanted || state.retries.has(wanted)) return;
        state.retries.add(wanted);
        const version = ++state.version, url = new URL(wanted, document.baseURI);
        url.searchParams.set('artretry', '24');
        preload(url.href).then(() => {
          if (el.isConnected && state.version === version && target(el) === wanted) el.src = url.href;
        }).catch(() => { /* Keep meaningful alt text if the retry also fails. */ });
      };
      el.addEventListener('error', recover);
      // New route images must match the selected theme before the next paint.
      if (el.getAttribute('src') !== src) el.setAttribute('src', src);
      if (el.complete && !el.naturalWidth) recover();
      return;
    }
    const version = ++state.version;
    clearOverlay(state);
    if (el.getAttribute('src') === src) return;
    preload(src).then(() => src).catch(async () => {
      if (state.retries.has(src) || !el.isConnected || version !== state.version) throw new Error('Image unavailable');
      state.retries.add(src);
      const url = new URL(src, document.baseURI); url.searchParams.set('artretry', '24');
      await preload(url.href); return url.href;
    }).then(async loadedSrc => {
      if (!el.isConnected || version !== state.version || target(el) !== src) return;
      const old = !immediate() && el.complete && el.naturalWidth ? previousImage(el, state) : null;
      el.setAttribute('src', loadedSrc);
      if (!old) return;
      try { await el.decode(); } catch (_) { /* Preload already confirmed availability. */ }
      if (version !== state.version || state.overlay !== old) return;
      if (immediate()) { clearOverlay(state); return; }
      // Resolve starting geometry once; only opacity changes during the fade.
      old.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (version !== state.version || state.overlay !== old) return;
        old.classList.add('art-fading');
        state.timer = setTimeout(() => clearOverlay(state), 230);
      });
    }).catch(() => { /* Keep the current decoded image if a counterpart is unavailable. */ });
  }

  function scan(node) {
    if (node.nodeType !== 1 && node.nodeType !== 9) return;
    if (node.matches && node.matches(selector)) sync(node);
    node.querySelectorAll(selector).forEach(sync);
  }

  const observer = new MutationObserver(changes => {
    let themeChanged = false;
    for (const change of changes) {
      if (change.type === 'attributes') {
        if (change.target === root && change.attributeName === 'data-theme') themeChanged = true;
        else if (change.target === root && change.attributeName === 'data-input') {
          if (immediate()) clearAll();
        } else if (change.target.matches(selector)) sync(change.target);
      } else {
        change.addedNodes.forEach(scan);
        // Route changes can remove an image while its crossfade is in progress.
        for (const state of overlays) if (!state.overlay.isConnected) clearOverlay(state);
      }
    }
    if (themeChanged) scan(document);
  });
  observer.observe(document, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['data-theme', 'data-input', 'data-light', 'data-dark']
  });
  reduced.addEventListener('change', () => { if (immediate()) clearAll(); });
  scan(document);
})();

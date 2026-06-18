/* ════════════════════════════════════════
   gallery.js — photo grid gallery
   Loads the photo list from photos.json
   (single source of truth — slider.js on
   the homepage pulls from the same file).
════════════════════════════════════════ */

(function () {
  const wall    = document.getElementById('photoWall');
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbCap   = document.getElementById('lbCaption');
  const countEl = document.getElementById('photoCount');

  /* ── LIGHTBOX ── */
  document.getElementById('lbClose').addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

  function attachLightbox(item) {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = item.dataset.label + (item.dataset.tag ? ' · ' + item.dataset.tag : '');
      lb.classList.add('open');
    });
  }

  /* ── BUILD WALL FROM photos.json ── */
  fetch('/photos.json')
    .then(r => r.json())
    .then(photos => {
      photos.forEach(p => {
        const div = document.createElement('div');
        div.className     = 'pw-item';
        div.dataset.label = p.label;
        div.dataset.tag   = p.tag;
        div.innerHTML = `
          <img src="${p.src}" alt="${p.label}" loading="lazy">
          <div class="pw-overlay">
            <div class="pw-label">${p.label}</div>
            <div class="pw-tag">${p.tag}</div>
          </div>`;
        wall.appendChild(div);
        attachLightbox(div);
      });
      countEl.textContent = photos.length + ' PHOTOS';
    })
    .catch(() => {
      countEl.textContent = '— PHOTOS';
      console.error('Could not load photos.json');
    });
})();

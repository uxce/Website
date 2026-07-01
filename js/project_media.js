
(function () {
  const lightbox = document.getElementById('projLightbox');
  const lbImg    = document.getElementById('plImg');
  const lbCap    = document.getElementById('plCaption');
  const lbPrev   = document.getElementById('plPrev');
  const lbNext   = document.getElementById('plNext');
  const lbClose  = document.getElementById('plClose');
  if (!lightbox) return;

  let activeImages = [];
  let activeIdx = 0;

  function openLightbox(images, idx) {
    activeImages = images;
    activeIdx = idx;
    renderLightbox();
    lightbox.classList.add('open');
  }
  function renderLightbox() {
    const img = activeImages[activeIdx];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    const multi = activeImages.length > 1;
    lbPrev.style.display = multi ? 'flex' : 'none';
    lbNext.style.display = multi ? 'flex' : 'none';
    lbCap.textContent = multi ? `${activeIdx + 1} / ${activeImages.length}` : '';
  }
  lbPrev.addEventListener('click', e => {
    e.stopPropagation();
    activeIdx = (activeIdx - 1 + activeImages.length) % activeImages.length;
    renderLightbox();
  });
  lbNext.addEventListener('click', e => {
    e.stopPropagation();
    activeIdx = (activeIdx + 1) % activeImages.length;
    renderLightbox();
  });
  lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     lightbox.classList.remove('open');
    if (e.key === 'ArrowLeft')  lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
  });

  document.querySelectorAll('.proj-body-screenshot').forEach(container => {
    const track = container.querySelector('.pss-track');
    if (!track) return;
    const imgs = Array.from(track.querySelectorAll('img'));
    if (!imgs.length) return;

    let cur = 0;

    if (imgs.length > 1) {
      const prevBtn = document.createElement('div');
      prevBtn.className = 'pss-prev';
      prevBtn.textContent = '◀';
      const nextBtn = document.createElement('div');
      nextBtn.className = 'pss-next';
      nextBtn.textContent = '▶';
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'pss-dots';

      imgs.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'pss-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
        dotsWrap.appendChild(d);
      });

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
      container.appendChild(dotsWrap);

      prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(cur - 1); });
      nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(cur + 1); });

      function goTo(n) {
        cur = (n + imgs.length) % imgs.length;
        track.style.transform = `translateX(-${cur * 100}%)`;
        dotsWrap.querySelectorAll('.pss-dot').forEach((d, i) => d.classList.toggle('active', i === cur));
      }
    }

    imgs.forEach((img, i) => {
      img.addEventListener('click', () => openLightbox(imgs, i));
    });
  });
})();
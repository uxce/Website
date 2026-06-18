/* ════════════════════════════════════════
   slider.js — image gallery slider
   Pulls from photos.json — the same source
   gallery.js uses — so the homepage slider
   and the full gallery never drift apart.
════════════════════════════════════════ */

(function () {
  const track = document.getElementById('sliderTrack');
  const dotsW = document.getElementById('sliderDots');
  const label = document.getElementById('sliderLabel');
  if (!track) return;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  fetch('photos.json')
    .then(r => r.json())
    .then(allPhotos => {
      const picks = shuffle(allPhotos).slice(0, 8);

      track.innerHTML = picks.map(p => `
        <div class="slide">
          <img src="${p.src}" alt="${p.label}" loading="lazy">
        </div>`).join('');

      const slides = track.querySelectorAll('.slide');
      const total  = slides.length;
      dotsW.innerHTML = '';
      let cur = 0;
      let autoTimer;

      for (let i = 0; i < total; i++) {
        const d = document.createElement('div');
        d.className = 'sdot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsW.appendChild(d);
      }

      function goTo(n) {
        cur = (n + total) % total;
        track.style.transform = `translateX(-${cur * 100}%)`;
        dotsW.querySelectorAll('.sdot').forEach((d, i) =>
          d.classList.toggle('active', i === cur));
        label.textContent = `PHOTO ${cur + 1} / ${total}`;
        resetAuto();
      }

      function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(cur + 1), 4000);
      }

      document.getElementById('sliderPrev')?.addEventListener('click', () => goTo(cur - 1));
      document.getElementById('sliderNext')?.addEventListener('click', () => goTo(cur + 1));

      goTo(0);
    })
    .catch(() => {
      label.textContent = 'COULD NOT LOAD PHOTOS';
    });
})();

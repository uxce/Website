/* ════════════════════════════════════════
   cursor.js — custom cursor + trail
════════════════════════════════════════ */

(function () {
  const dot    = document.getElementById('cursor-dot');
  const trailW = document.getElementById('cursor-trail-wrap');

  let mx = -100, my = -100;

  const TRAIL_LEN = 10;
  const trail = [];
  for (let i = 0; i < TRAIL_LEN; i++) {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    d.style.opacity = ((i + 1) / TRAIL_LEN * 0.5).toFixed(2);
    trailW.appendChild(d);
    trail.push({ el: d, x: -100, y: -100 });
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animCursor() {
    for (let i = trail.length - 1; i > 0; i--) {
      trail[i].x = trail[i - 1].x;
      trail[i].y = trail[i - 1].y;
    }
    trail[0].x = mx; trail[0].y = my;
    trail.forEach((t, i) => {
      t.el.style.left   = t.x + 'px';
      t.el.style.top    = t.y + 'px';
      t.el.style.width  = (3 - i * 0.22) + 'px';
      t.el.style.height = (3 - i * 0.22) + 'px';
    });

    requestAnimationFrame(animCursor);
  }
  animCursor();
})();

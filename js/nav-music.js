/* ════════════════════════════════════════
   nav-music.js
   Injected into every page inside the shell.
   Renders a music widget in .leftnav,
   communicates with shell.html via postMessage.
════════════════════════════════════════ */

(function () {
  // Tell shell we're ready
  parent.postMessage({ type: 'MP_READY' }, '*');

  // Fire first-click unlock once
  document.addEventListener('click', () => {
    parent.postMessage({ type: 'MP_FIRST_CLICK' }, '*');
  }, { once: true });

  /* ── Intercept ALL internal nav links ── */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    // Only intercept same-site .html links (not mailto, external, anchors)
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    if (!href.endsWith('.html') && !href.match(/^[a-zA-Z0-9_\-]+\.html/)) return;
    e.preventDefault();
    parent.postMessage({ type: 'MP_NAVIGATE', href }, '*');
  }, true);

  /* ── Build widget HTML ── */
  const nav = document.querySelector('.leftnav');
  if (!nav) return;

  const widget = document.createElement('div');
  widget.className = 'widget music-nav-widget';
  widget.id = 'musicNavWidget';
  widget.innerHTML = `
    <span class="widget-label">♫ NOW PLAYING</span>
    <div class="mnw-track">
      <div class="mnw-title" id="mnwTitle">SELECT A TRACK</div>
      <div class="mnw-artist" id="mnwArtist">— — —</div>
    </div>
    <div class="mnw-bar-wrap">
      <div class="mnw-bar" id="mnwBar"></div>
    </div>
    <div class="mnw-controls">
      <button class="mnw-btn" id="mnwPrev" title="Previous">⏮</button>
      <button class="mnw-btn mnw-play" id="mnwPlay" title="Play/Pause">▶</button>
      <button class="mnw-btn" id="mnwNext" title="Next">⏭</button>
      <button class="mnw-btn mnw-mute" id="mnwMute" title="Mute">🔊</button>
    </div>
    <div class="mnw-glow"></div>
  `;

  // Insert before last-update div, or append
  const lastUpdate = nav.querySelector('.last-update');
  if (lastUpdate) nav.insertBefore(widget, lastUpdate);
  else nav.appendChild(widget);

  /* ── Inject styles ── */
  if (!document.getElementById('mnwStyles')) {
    const s = document.createElement('style');
    s.id = 'mnwStyles';
    s.textContent = `
      .music-nav-widget {
        position: relative;
        border-bottom: 1px solid #100900;
        border-top: 1px solid #3D2000;
        padding: 10px 14px 12px;
        overflow: hidden;
        background: #030100;
      }

      /* Amber glow layer behind widget */
      .mnw-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 50% 100%, rgba(232,133,10,0.12) 0%, transparent 70%);
        animation: mnw-glow-pulse 3s ease-in-out infinite;
      }
      @keyframes mnw-glow-pulse {
        0%, 100% { opacity: 0.6; }
        50%       { opacity: 1; }
      }

      /* Outer border glow on the widget itself */
      .music-nav-widget {
        box-shadow:
          0 0 0 1px #3D2000,
          0 0 12px rgba(232,133,10,0.10),
          inset 0 0 18px rgba(232,133,10,0.04);
        transition: box-shadow 0.4s ease;
      }
      .music-nav-widget.playing {
        box-shadow:
          0 0 0 1px #7A4400,
          0 0 18px rgba(232,133,10,0.22),
          0 0 36px rgba(232,133,10,0.08),
          inset 0 0 24px rgba(232,133,10,0.07);
      }

      .mnw-track {
        margin-bottom: 8px;
        position: relative;
        z-index: 1;
      }
      .mnw-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 13px;
        color: #9A6020;
        letter-spacing: 1px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.3s;
      }
      .music-nav-widget.playing .mnw-title {
        color: #E8850A;
        text-shadow: 0 0 10px rgba(232,133,10,0.4);
      }
      .mnw-artist {
        font-family: 'Space Mono', monospace;
        font-size: 7px;
        color: #3D2000;
        letter-spacing: 2px;
        margin-top: 2px;
      }

      /* Progress bar */
      .mnw-bar-wrap {
        height: 3px;
        background: #0D0700;
        border: 1px solid #1A0E00;
        margin-bottom: 8px;
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      .mnw-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #3D2000, #E8850A);
        position: relative;
        transition: width 1s linear;
      }
      .mnw-bar::after {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 3px; height: 100%;
        background: #F5A623;
        box-shadow: 0 0 6px rgba(245,166,35,0.8);
      }

      /* Controls */
      .mnw-controls {
        display: flex;
        gap: 3px;
        align-items: center;
        position: relative;
        z-index: 1;
      }
      .mnw-btn {
        flex: 1;
        font-family: 'Space Mono', monospace;
        font-size: 8px;
        color: #3D2000;
        background: #0A0700;
        border: 1px solid #1A0E00;
        padding: 5px 2px;
        cursor: none;
        transition: color 0.12s, border-color 0.12s, background 0.12s, box-shadow 0.2s;
        line-height: 1;
        text-align: center;
      }
      .mnw-btn:hover {
        color: var(--white, #F5EDD8);
        border-color: #3D2000;
        background: #0F0800;
        box-shadow: 0 0 6px rgba(232,133,10,0.2);
      }
      .mnw-play {
        color: #E8850A;
        border-color: #3D2000;
        background: #0A0500;
        font-size: 10px;
        padding: 5px 4px;
      }
      .mnw-play:hover {
        color: #F5A623;
        border-color: #7A4400;
        box-shadow: 0 0 10px rgba(232,133,10,0.35);
      }
      .mnw-mute {
        font-size: 9px;
        flex: 0 0 auto;
        padding: 5px 6px;
      }

      /* Scanline shimmer on widget */
      .music-nav-widget::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          0deg,
          transparent 0, transparent 2px,
          rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px
        );
        z-index: 0;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Wire buttons ── */
  document.getElementById('mnwPlay').addEventListener('click', () => {
    const btn = document.getElementById('mnwPlay');
    const isPlaying = btn.textContent === '⏸';
    parent.postMessage({ type: isPlaying ? 'MP_PAUSE' : 'MP_PLAY' }, '*');
  });
  document.getElementById('mnwPrev').addEventListener('click', () => {
    parent.postMessage({ type: 'MP_PREV' }, '*');
  });
  document.getElementById('mnwNext').addEventListener('click', () => {
    parent.postMessage({ type: 'MP_NEXT' }, '*');
  });
  document.getElementById('mnwMute').addEventListener('click', () => {
    const btn = document.getElementById('mnwMute');
    const muted = btn.textContent === '/';
    parent.postMessage({ type: 'MP_MUTE', muted: !muted }, '*');
  });

  /* ── Receive state from shell ── */
  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || d.type !== 'MP_STATE') return;

    const widget  = document.getElementById('musicNavWidget');
    const title   = document.getElementById('mnwTitle');
    const artist  = document.getElementById('mnwArtist');
    const bar     = document.getElementById('mnwBar');
    const btnPlay = document.getElementById('mnwPlay');
    const btnMute = document.getElementById('mnwMute');

    if (!widget) return;

    // Track info
    if (title)  title.textContent  = d.title  || 'SELECT A TRACK';
    if (artist) artist.textContent = d.artist || '— — —';

    // Progress
    if (bar && d.duration > 0) {
      bar.style.width = (d.current / d.duration * 100) + '%';
    }

    // Play/pause button
    if (btnPlay) btnPlay.textContent = d.playing ? '⏸' : '▶';

    // Mute button
    if (btnMute) btnMute.textContent = d.muted ? '/' : 'O';

    // Glow class
    widget.classList.toggle('playing', d.playing && !d.muted);
  });

})();

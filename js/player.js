/* ════════════════════════════════════════
   player.js — music player (index.html)
   When running inside shell.html, delegates
   to the shell audio. Standalone fallback
   kept for direct index.html access.
════════════════════════════════════════ */

(function () {
  const playlist = [
    { title: 'Cartz',     artist: 'gum.mp3',    src: 'https://pub-f3421bbecaba465e83e033376eb8cdb2.r2.dev/music/cartz.mp3',    duration: '2:50' },
    { title: 'Till Dawn', artist: 'Janaway',     src: 'https://pub-f3421bbecaba465e83e033376eb8cdb2.r2.dev/music/TillDawn.mp3', duration: '5:22' },
    { title: 'I could take u there',  artist: 'Dazegxd', src: 'https://pub-f3421bbecaba465e83e033376eb8cdb2.r2.dev/music/iCouldTakeUthere.mp3',  duration: '3:21' },
    { title: 'Get Lit',  artist: 'ANDRS', src: 'https://pub-f3421bbecaba465e83e033376eb8cdb2.r2.dev/music/getLit.mp3',  duration: '2:23' },

  ];

  const inShell = window.self !== window.top;

  let curIdx  = 0;
  let looping = false;

  const btnPlay = document.getElementById('btnPlay');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnLoop = document.getElementById('btnLoop');
  const npDot   = document.getElementById('npDot');
  const tTitle  = document.getElementById('trackTitle');
  const tArtist = document.getElementById('trackArtist');
  const pFill   = document.getElementById('progressFill');
  const pTrack  = document.getElementById('progressTrack');
  const tElap   = document.getElementById('timeElapsed');
  const tDur    = document.getElementById('timeDuration');
  const volSldr = document.getElementById('volSlider');
  const vizEl   = document.getElementById('visualizer');
  const listEl  = document.getElementById('trackList');

  /* ── Visualizer ── */
  const BAR_COUNT = 24;
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const b = document.createElement('div');
    b.className = 'vbar';
    b.style.height = '3px';
    vizEl.appendChild(b);
    bars.push(b);
  }

  let vizPlaying = false;
  function animViz() {
    bars.forEach((b, i) => {
      const base = vizPlaying ? 8 : 3;
      const amp  = vizPlaying ? Math.random() * 28 : 0;
      const h    = base + amp * Math.sin(Date.now() / 200 + i * 0.7) * 0.5 + amp * 0.5;
      b.style.height = Math.max(3, h) + 'px';
      b.style.background = vizPlaying
        ? (h > 24 ? '#F5A623' : h > 14 ? '#E8850A' : '#3D2000')
        : '#1A0E00';
    });
    requestAnimationFrame(animViz);
  }
  animViz();

  function fmt(s) {
    return isNaN(s) ? '0:00' : Math.floor(s/60) + ':' + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60);
  }

  function buildList(activeIdx) {
    listEl.innerHTML = '';
    playlist.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'track-item' + (i === activeIdx ? ' active' : '');
      row.innerHTML = `
        <span class="track-num">${String(i+1).padStart(2,'0')}</span>
        <span class="track-name-item">${t.title} — ${t.artist}</span>
        <span class="track-dur">${t.duration}</span>`;
      row.addEventListener('click', () => {
        if (inShell) parent.postMessage({ type: 'MP_TRACK', idx: i }, '*');
        else loadTrackLocal(i, true);
      });
      listEl.appendChild(row);
    });
  }

  /* ══════════════════════════════════
     SHELL MODE — delegate to parent
  ══════════════════════════════════ */
  if (inShell) {
    buildList(0);

    btnPlay.addEventListener('click', () => {
      const playing = btnPlay.textContent === '⏸';
      parent.postMessage({ type: playing ? 'MP_PAUSE' : 'MP_PLAY' }, '*');
    });
    btnPrev.addEventListener('click', () => parent.postMessage({ type: 'MP_PREV' }, '*'));
    btnNext.addEventListener('click', () => parent.postMessage({ type: 'MP_NEXT' }, '*'));
    btnLoop.addEventListener('click', () => {
      looping = !looping;
      parent.postMessage({ type: 'MP_LOOP', loop: looping }, '*');
      btnLoop.style.color       = looping ? '#E8850A' : '#444';
      btnLoop.style.borderColor = looping ? '#7A4400' : '#1a1a1a';
      btnLoop.style.background  = looping ? '#0a0500' : '#0a0a0a';
    });
    volSldr.addEventListener('input', () => {
      parent.postMessage({ type: 'MP_VOLUME', volume: parseFloat(volSldr.value) }, '*');
    });
    pTrack.addEventListener('click', e => {
      parent.postMessage({ type: 'MP_SEEK', time: e.offsetX / pTrack.offsetWidth }, '*');
    });

    // Receive state from shell
    window.addEventListener('message', e => {
      const d = e.data;
      if (!d || d.type !== 'MP_STATE') return;

      vizPlaying = d.playing;
      const t = playlist[d.idx] || {};
      curIdx = d.idx;

      if (tTitle)  tTitle.textContent  = d.title  || t.title  || 'SELECT A TRACK';
      if (tArtist) tArtist.textContent = d.artist || t.artist || '— — —';
      if (btnPlay) btnPlay.textContent = d.playing ? '⏸' : '▶';
      if (npDot)   npDot.classList.toggle('paused', !d.playing);

      if (d.duration > 0) {
        const pct = d.current / d.duration * 100;
        if (pFill)  pFill.style.width   = pct + '%';
        if (tElap)  tElap.textContent   = fmt(d.current);
        if (tDur)   tDur.textContent    = fmt(d.duration);
      }

      buildList(d.idx);
    });

    // Seek: send fraction, shell converts
    pTrack.addEventListener('click', e => {
      const r = pTrack.getBoundingClientRect();
      const frac = (e.clientX - r.left) / r.width;
      parent.postMessage({ type: 'MP_SEEK', time: frac, isFraction: true }, '*');
    });

    return; // done for shell mode
  }

  /* ══════════════════════════════════
     STANDALONE MODE (direct open)
  ══════════════════════════════════ */
  const audio = new Audio();
  audio.volume = 0.1;

  function loadTrackLocal(idx, autoplay) {
    curIdx = ((idx % playlist.length) + playlist.length) % playlist.length;
    const t = playlist[curIdx];
    audio.src = t.src;
    tTitle.textContent  = t.title;
    tArtist.textContent = t.artist;
    tDur.textContent    = t.duration;
    tElap.textContent   = '0:00';
    pFill.style.width   = '0%';
    buildList(curIdx);
    if (autoplay) { audio.play().catch(() => {}); setPlayingLocal(true); }
    else setPlayingLocal(false);
  }

  function setPlayingLocal(p) {
    vizPlaying = p;
    btnPlay.textContent = p ? '⏸' : '▶';
    npDot.classList.toggle('paused', !p);
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    pFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    tElap.textContent = fmt(audio.currentTime);
    tDur.textContent  = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (looping) audio.play();
    else loadTrackLocal(curIdx + 1, true);
  });

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      if (!audio.src) loadTrackLocal(0, true);
      else { audio.play().catch(() => {}); setPlayingLocal(true); }
    } else { audio.pause(); setPlayingLocal(false); }
  });
  btnPrev.addEventListener('click', () => loadTrackLocal(curIdx - 1, !audio.paused));
  btnNext.addEventListener('click', () => loadTrackLocal(curIdx + 1, !audio.paused));
  btnLoop.addEventListener('click', () => {
    looping = !looping;
    btnLoop.style.color       = looping ? '#E8850A' : '#444';
    btnLoop.style.borderColor = looping ? '#7A4400' : '#1a1a1a';
    btnLoop.style.background  = looping ? '#0a0500' : '#0a0a0a';
  });
  volSldr.addEventListener('input', () => { audio.volume = volSldr.value; });
  pTrack.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = pTrack.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  loadTrackLocal(0, true);
  audio.play().catch(() => {
    document.addEventListener('click', () => audio.play().catch(() => {}), { once: true });
  });

})();
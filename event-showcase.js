(() => {
  'use strict';
  // Native controls remain available even when JavaScript or autoplay is unavailable.
  const videos = [...document.querySelectorAll('video[data-event-video]')];
  if (!videos.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const menu = document.querySelector('#pw-menu');
  const states = new Map(videos.map(video => [video, {
    video, visible: false, userPaused: false, manual: false, pending: false, autoPaused: false
  }]));

  function shouldPlay(state) {
    return state.visible && !document.hidden && !menu?.open && !state.userPaused &&
      (state.manual || (!reduced.matches && !connection?.saveData));
  }

  function pause(state) {
    if (state.video.paused) return;
    state.autoPaused = true;
    state.video.pause();
  }

  function sync(state) {
    if (!shouldPlay(state)) { pause(state); return; }
    if (!state.video.paused || state.pending) return;
    state.pending = true;
    // Automatic playback is always silent, including after a scroll or tab change.
    state.video.muted = true;
    state.video.play().then(() => {
      if (!shouldPlay(state)) pause(state);
    }).catch(() => {
      // The poster and native Play control remain usable if autoplay is blocked.
    }).finally(() => { state.pending = false; });
  }

  const syncAll = () => states.forEach(sync);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.get(entry.target);
      state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      sync(state);
    });
  }, { threshold: [0, 0.25] });

  states.forEach(state => {
    const video = state.video;
    video.addEventListener('play', () => {
      if (!state.pending) {
        state.manual = true;
        state.userPaused = false;
      }
    });
    video.addEventListener('pause', () => {
      if (state.autoPaused) { state.autoPaused = false; return; }
      if (state.visible && !document.hidden && !menu?.open) {
        state.userPaused = true;
        state.manual = false;
      }
    });
    observer.observe(video);
  });
  document.addEventListener('visibilitychange', syncAll);
  if (menu) new MutationObserver(syncAll).observe(menu, { attributes: true, attributeFilter: ['open'] });
  reduced.addEventListener('change', () => {
    states.forEach(state => { state.manual = false; });
    syncAll();
  });
  connection?.addEventListener?.('change', syncAll);
})();

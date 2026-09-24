(() => {
  const video = document.querySelector('#corporate-hero-video');
  if (!video) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function applyPreference() {
    video.autoplay = !motion.matches;
    if (motion.matches) video.pause();
    else { video.muted = true; video.play().catch(() => {}); }
  }
  motion.addEventListener('change', applyPreference);
  applyPreference();
})();

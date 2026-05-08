// PowerWyze — interactions

// Sticky header shadow on scroll
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Reveal-on-scroll for sections (progressive enhancement only)
(function () {
  if (!('IntersectionObserver' in window)) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const targets = document.querySelectorAll(
    '.why-card, .suite-card, .flow-step, .metric, .price-card, .model-pillar, .status-card, .compare-col'
  );
  targets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px 100px 0px' }
  );
  targets.forEach((el) => io.observe(el));
  // Safety fallback
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
  }, 1500);
})();

// Year
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Autoplay in-field videos when they scroll into view (muted, looped)
(function () {
  if (!('IntersectionObserver' in window)) return;
  const videos = document.querySelectorAll('.video-card video');
  if (!videos.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.35 }
  );
  videos.forEach((v) => io.observe(v));
})();

// Hero "Watch the launch" lightbox
(function () {
  const trigger = document.querySelector('.hero-play');
  const lightbox = document.getElementById('video-lightbox');
  if (!trigger || !lightbox) return;
  const player = lightbox.querySelector('.video-lightbox-player');
  const closeBtn = lightbox.querySelector('.video-lightbox-close');

  function open() {
    const src = trigger.getAttribute('data-video');
    const poster = trigger.getAttribute('data-poster');
    if (!src) return;
    player.setAttribute('src', src);
    if (poster) player.setAttribute('poster', poster);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    const p = player.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('is-open');
    player.pause();
    setTimeout(() => {
      lightbox.hidden = true;
      player.removeAttribute('src');
      player.load();
      document.body.style.overflow = '';
    }, 200);
  }
  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) close();
  });
})();

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

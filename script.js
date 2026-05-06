// PowerWyze — interactions

// Theme toggle (default: dark)
(function () {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = sysDark ? 'dark' : 'dark'; // default dark to match brand energy
  root.setAttribute('data-theme', theme);

  const sun =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const moon =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  const render = () => {
    btn.innerHTML = theme === 'dark' ? sun : moon;
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  };
  if (btn) {
    render();
    btn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      render();
    });
  }
})();

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
  const targets = document.querySelectorAll('.cap, .flow-step, .wild-card, .quote, .case, .metric');
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
  // Safety fallback: ensure all reveal items are visible after 1.5s regardless
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
  }, 1500);
})();

// Year
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Ambassador page interactions
// - GSAP reveal on scroll
// - Header / mobile nav
// - Form POSTs natively to FormSubmit (https://formsubmit.co/wyzer@powerwyze.com)

(function () {
  const header = document.querySelector('[data-header]');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    header.classList.toggle('is-light', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  function setMenuOpen(isOpen) {
    nav?.classList.toggle('is-open', isOpen);
    toggle?.setAttribute('aria-expanded', String(isOpen));
    const label = toggle?.querySelector('.sr-only');
    if (label) label.textContent = isOpen ? 'Close menu' : 'Menu';
    document.body.classList.toggle('nav-open', Boolean(isOpen && nav));
    if (!isOpen) document.body.style.removeProperty('overflow');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setMenuOpen(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1200) setMenuOpen(false);
    });
  }

  document.querySelectorAll('a[href="#apply"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById('apply');
      if (!target) return;
      event.preventDefault();
      setMenuOpen(false);
      const top = target.getBoundingClientRect().top + window.scrollY - 108;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      history.replaceState(null, '', '#apply');
    });
  });

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray('.reveal').forEach((el) => {
      window.gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
  }
})();

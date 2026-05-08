(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('#mobile-nav');
  const quoteModal = document.querySelector('[data-quote-modal]');
  const quoteForm = document.querySelector('[data-quote-form]');
  const closeModal = document.querySelector('[data-close-modal]');
  const status = document.querySelector('[data-form-status]');

  let activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', activeTheme);

  function setTheme(nextTheme) {
    activeTheme = nextTheme;
    root.setAttribute('data-theme', activeTheme);
    if (!themeToggle) return;
    const isDark = activeTheme === 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeToggle.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>';
  }

  setTheme(activeTheme);
  themeToggle?.addEventListener('click', () => setTheme(activeTheme === 'dark' ? 'light' : 'dark'));

  function closeMobileNav() {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    mobileNav.hidden = isOpen;
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });

  mobileNav?.addEventListener('click', (event) => {
    if (event.target.closest('a') || event.target.closest('[data-quote]')) closeMobileNav();
  });

  function openQuoteModal() {
    closeMobileNav();
    if (typeof quoteModal.showModal === 'function') {
      quoteModal.showModal();
      quoteModal.querySelector('input')?.focus();
    } else {
      window.location.hash = 'quote';
    }
  }

  document.querySelectorAll('[data-quote]').forEach((button) => {
    button.addEventListener('click', openQuoteModal);
  });

  closeModal?.addEventListener('click', () => quoteModal.close());

  quoteModal?.addEventListener('click', (event) => {
    if (event.target === quoteModal) quoteModal.close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileNav();
  });

  quoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!quoteForm.reportValidity()) {
      status.textContent = 'Please complete the required contact fields.';
      return;
    }

    const data = new FormData(quoteForm);
    const lines = [
      'PowerWyze corporate quote request',
      '----------------------------------',
      '',
    ];

    for (const [key, value] of data.entries()) {
      lines.push(`${key}: ${value || '(not provided)'}`);
    }

    lines.push('', 'Requested via powerwyze.com');

    const company = data.get('Company') || 'Corporate event';
    const subject = `PowerWyze corporate quote request — ${company}`;
    const mailto = `mailto:wyzer@powerwyze.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

    status.textContent = 'Opening your email client with the completed quote request.';
    window.__lastMailto = mailto;
    window.location.href = mailto;
  });

  function initMotion() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.from('[data-gsap]', {
      autoAlpha: 0,
      y: 18,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.08,
      clearProps: 'transform,opacity,visibility',
    });

    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, clipPath: 'inset(18% 0 0 0)' },
        {
          autoAlpha: 1,
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        },
      );
    });

    gsap.to('.hero-card img', {
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.utils.toArray('.process-item').forEach((item, index) => {
      gsap.to(item, {
        backgroundColor: index % 2 === 0 ? 'rgba(28,166,106,0.10)' : 'rgba(215,148,61,0.10)',
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top 70%',
          end: 'bottom 35%',
          scrub: true,
        },
      });
    });
  }

  window.addEventListener('load', () => {
    initMotion();
    document.querySelectorAll('video[autoplay]').forEach((video) => {
      video.play().catch(() => {});
    });
  });
})();

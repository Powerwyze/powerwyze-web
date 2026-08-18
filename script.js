(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  function setHeaderState() {
    header && header.classList.toggle('is-light', window.scrollY > window.innerHeight * 0.82);
  }
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  function setMenuOpen(isOpen) {
    nav?.classList.toggle('is-open', isOpen);
    menuToggle?.setAttribute('aria-expanded', String(isOpen));
    const label = menuToggle?.querySelector('.sr-only');
    if (label) label.textContent = isOpen ? 'Close menu' : 'Menu';
    document.body.classList.toggle('nav-open', Boolean(isOpen && nav));
    if (!isOpen) document.body.style.removeProperty('overflow');
  }

  menuToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!nav) return;
    setMenuOpen(!nav.classList.contains('is-open'));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    const target = event.target;
    if (nav.contains(target) || menuToggle?.contains(target)) return;
    setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1200) setMenuOpen(false);
  });

  const heroTitle = document.querySelector('[data-split]');
  if (heroTitle) {
    const text = heroTitle.textContent.trim();
    heroTitle.setAttribute('aria-label', text);
    heroTitle.textContent = '';
    text.split(' ').forEach((word, wordIndex, words) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.setAttribute('aria-hidden', 'true');
      [...word].forEach((char) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        wordSpan.appendChild(span);
      });
      heroTitle.appendChild(wordSpan);
      if (wordIndex < words.length - 1) heroTitle.appendChild(document.createTextNode(' '));
    });
  }

  if (!reduceMotion && window.gsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to('.char', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.018,
      ease: 'power3.out',
      delay: 0.15,
    });
    window.gsap.from('.hero-copy p, .hero-copy .pill-cta', {
      opacity: 0,
      y: 18,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.55,
    });
    window.gsap.utils.toArray('.reveal').forEach((el) => {
      window.gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      });
    });
  } else {
    document.querySelectorAll('.char').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('[data-slide-dot]')];
  let slideIndex = 0;
  let slideTimer;
  function showSlide(index) {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === slideIndex));
  }
  function startSlides() {
    if (reduceMotion || slides.length < 2) return;
    slideTimer = window.setInterval(() => showSlide(slideIndex + 1), 5200);
  }
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      window.clearInterval(slideTimer);
      showSlide(Number(dot.dataset.slideDot));
      startSlides();
    });
  });
  startSlides();

  const statEls = [...document.querySelectorAll('[data-count]')];
  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const obj = { value: 0 };
    if (window.gsap) {
      window.gsap.to(obj, {
        value: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = `${Math.round(obj.value)}${suffix}`; },
      });
    } else {
      el.textContent = `${target}${suffix}`;
    }
  }
  if (statEls.length) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statEls.forEach(animateCount);
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    statsObserver.observe(document.querySelector('.stats'));
  }

  const serviceImage = document.querySelector('[data-service-image]');
  document.querySelectorAll('.service-item').forEach((item) => {
    const trigger = item.querySelector('.service-trigger');
    trigger?.addEventListener('click', () => {
      document.querySelectorAll('.service-item').forEach((other) => {
        const isCurrent = other === item;
        other.classList.toggle('is-open', isCurrent);
        other.querySelector('.service-trigger')?.setAttribute('aria-expanded', String(isCurrent));
        const plus = other.querySelector('.plus');
        if (plus) plus.textContent = isCurrent ? '×' : '+';
      });
      if (serviceImage && item.dataset.image) {
        serviceImage.style.opacity = '0';
        window.setTimeout(() => {
          serviceImage.src = item.dataset.image;
          serviceImage.alt = item.dataset.alt || '';
          serviceImage.style.opacity = '1';
        }, reduceMotion ? 0 : 160);
      }
    });
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('button');
    button?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      const icon = button.querySelector('span:last-child');
      if (icon) icon.textContent = open ? '×' : '+';
    });
  });

  // Quote / contact forms POST natively to FormSubmit. Do not intercept with mailto.
})();

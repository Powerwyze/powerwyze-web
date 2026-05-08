// PowerWyze — corporate funnel interactions

// TODO: Paste the deployed Google Apps Script Web App /exec URL here after publishing SHEET_WEBHOOK.gs.
const WEBHOOK_URL = '';
const LEAD_EMAIL = 'wyzer@powerwyze.com';

const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Sticky header state + mobile nav
(function () {
  const header = document.getElementById('site-header');
  const toggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (toggle && mobileNav) {
    const closeNav = () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      header?.classList.remove('mobile-nav-open');
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;
      header?.classList.toggle('mobile-nav-open', !isOpen);
    });
    mobileNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });
  }
})();

// Corporate quote modal + form
(function () {
  const modal = document.getElementById('quote-modal');
  const dialog = modal?.querySelector('.quote-dialog');
  const form = document.getElementById('quote-form');
  const status = modal?.querySelector('[data-form-status]');
  const success = modal?.querySelector('.quote-success');
  let lastFocused = null;

  if (!modal || !dialog || !form) return;

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function getFocusable() {
    return Array.from(dialog.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null);
  }

  function openQuoteModal() {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    form.hidden = false;
    success.hidden = true;
    form.reset();
    setStatus('');
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      if (window.gsap && !prefersReducedMotion()) {
        gsap.fromTo(dialog, { autoAlpha: 0, scale: 0.96, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.24, ease: 'power2.out' });
      }
      const first = getFocusable()[0];
      first?.focus({ preventScroll: true });
    });
  }

  function closeQuoteModal() {
    modal.classList.remove('is-open');
    const finish = () => {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      lastFocused?.focus?.({ preventScroll: true });
    };
    if (window.gsap && !prefersReducedMotion()) {
      gsap.to(dialog, { autoAlpha: 0, scale: 0.98, duration: 0.18, ease: 'power1.in', onComplete: finish });
    } else {
      finish();
    }
  }

  function setStatus(message, type = '') {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = type;
  }

  function collectPayload() {
    const fd = new FormData(form);
    return {
      name: String(fd.get('name') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      title: String(fd.get('title') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      eventName: String(fd.get('eventName') || '').trim(),
      eventType: String(fd.get('eventType') || '').trim(),
      eventDates: String(fd.get('eventDates') || '').trim(),
      days: String(fd.get('days') || '').trim(),
      kiosks: String(fd.get('kiosks') || '').trim(),
      attendance: String(fd.get('attendance') || '').trim(),
      venue: String(fd.get('venue') || '').trim(),
      branding: String(fd.get('branding') || '').trim(),
      notes: String(fd.get('notes') || '').trim(),
      referral: String(fd.get('referral') || '').trim(),
      source: 'powerwyze.com',
      userAgent: navigator.userAgent,
    };
  }

  function buildEmailBody(payload) {
    const lines = [
      'New PowerWyze corporate quote request',
      '',
      `Name: ${payload.name}`,
      `Company: ${payload.company}`,
      `Title: ${payload.title}`,
      `Work email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Event name: ${payload.eventName}`,
      `Event type: ${payload.eventType}`,
      `Event dates: ${payload.eventDates}`,
      `Number of days: ${payload.days}`,
      `Number of kiosks: ${payload.kiosks}`,
      `Expected attendance: ${payload.attendance}`,
      `Venue / city: ${payload.venue}`,
      `Branding / theme direction: ${payload.branding}`,
      `Anything else: ${payload.notes}`,
      `How they heard about us: ${payload.referral}`,
      '',
      `Source: ${payload.source}`,
      `User agent: ${payload.userAgent}`,
    ];
    return lines.join('\n');
  }

  function triggerMailto(payload) {
    const subject = `PowerWyze corporate quote request — ${payload.company || payload.name || 'New lead'}`;
    const body = buildEmailBody(payload);
    const href = `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    return href;
  }

  async function submitLead(payload) {
    if (!WEBHOOK_URL) throw new Error('Webhook URL is not configured.');
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open="quote"]');
    if (trigger) {
      event.preventDefault();
      openQuoteModal();
      return;
    }
    const closeTrigger = event.target.closest('[data-close="quote"]');
    if (closeTrigger && modal.classList.contains('is-open')) {
      event.preventDefault();
      closeQuoteModal();
    }
  });

  modal.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('quote-backdrop')) closeQuoteModal();
  });

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeQuoteModal();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus('Please complete the required fields before submitting.', 'error');
      return;
    }

    const payload = collectPayload();
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    setStatus('Sending your request…', 'loading');

    try {
      await submitLead(payload);
      form.hidden = true;
      success.hidden = false;
      success.querySelector('button')?.focus({ preventScroll: true });
    } catch (error) {
      const href = triggerMailto(payload);
      setStatus('Email fallback opened with your request details. Please send the draft email to complete your quote request.', 'error');
      modal.dataset.lastMailto = href;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  window.openQuoteModal = openQuoteModal;
  window.closeQuoteModal = closeQuoteModal;
})();

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
    document.body.classList.add('video-open');
  }
  function close() {
    lightbox.classList.remove('is-open');
    player.pause();
    setTimeout(() => {
      lightbox.hidden = true;
      player.removeAttribute('src');
      player.load();
      document.body.classList.remove('video-open');
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

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// GSAP / ScrollTrigger animation layer
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion()) {
    gsap.set('[data-gsap], .section-head > *, .card-grid > *', { clearProps: 'all', opacity: 1 });
    return;
  }

  document.querySelectorAll('.section-head > *, .card-grid > *').forEach((el) => el.classList.add('reveal'));

  gsap.from('[data-gsap]', {
    opacity: 0,
    y: 18,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
  });
  gsap.fromTo(
    '.hero-visual img',
    { scale: 1.04 },
    { scale: 1, duration: 1.2, ease: 'power3.out', transformOrigin: 'center center' }
  );

  document.querySelectorAll('.section-head').forEach((head) => {
    gsap.from(head.children, {
      scrollTrigger: { trigger: head, start: 'top 75%', once: true },
      opacity: 0,
      y: 16,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
    });
  });

  document.querySelectorAll('.card-grid').forEach((grid) => {
    gsap.from(grid.children, {
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
      opacity: 0,
      y: 16,
      duration: 0.55,
      stagger: 0.08,
      ease: 'power3.out',
    });
  });
})();

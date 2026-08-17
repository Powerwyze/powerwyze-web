// Ambassador page interactions
// - GSAP reveal on scroll
// - Form POST natively to FormSubmit (https://formsubmit.co/wyzer@powerwyze.com)
// - Optional JSON POST to a Google Apps Script webhook (configurable via
//   window.PW_AMBASSADOR_WEBHOOK or the AMBASSADOR_WEBHOOK_URL const below).

const AMBASSADOR_WEBHOOK_URL = ""; // <-- paste deployed Apps Script /exec URL here

(function () {
  // Header background switch on scroll
  const header = document.querySelector('[data-header]');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  function setMenuOpen(isOpen) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
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
  }

  // GSAP reveal
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

  // Form submit
  const form = document.querySelector('[data-ambassador-form]');
  const status = document.querySelector('[data-form-status]');
  if (!form) return;

  form.addEventListener('submit', () => {
    if (status) {
      status.classList.remove('success', 'error');
      status.textContent = 'Sending your application…';
    }

    const fd = new FormData(form);
    const data = {
      timestamp: new Date().toISOString(),
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      city: (fd.get('city') || '').toString().trim(),
      state: (fd.get('state') || '').toString().trim(),
      instagram: (fd.get('instagram') || '').toString().trim(),
      tiktok: (fd.get('tiktok') || '').toString().trim(),
      otherSocials: (fd.get('otherSocials') || '').toString().trim(),
      audience: (fd.get('audience') || '').toString().trim(),
      why: (fd.get('why') || '').toString().trim(),
    };

    // Optional sheet webhook — native FormSubmit POST continues regardless.
    const webhook =
      (typeof window !== 'undefined' && window.PW_AMBASSADOR_WEBHOOK) ||
      AMBASSADOR_WEBHOOK_URL;
    if (webhook) {
      try {
        fetch(webhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data),
        }).catch(() => {});
      } catch (_) {
        /* non-blocking */
      }
    }
  });
})();

/*
============================================================
APPS SCRIPT SETUP (paste into the PowerWyze CRM sheet):
============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Ambassadors');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Ambassadors tab not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.city || '',
      data.state || '',
      data.instagram || '',
      data.tiktok || '',
      data.otherSocials || '',
      data.audience || '',
      data.why || '',
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/

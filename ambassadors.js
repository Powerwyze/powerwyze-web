// Ambassador page interactions
// - GSAP reveal on scroll
// - Form submit: opens mailto to wyzer@powerwyze.com AND fires JSON POST to a
//   Google Apps Script webhook (configurable via window.PW_AMBASSADOR_WEBHOOK or
//   the AMBASSADOR_WEBHOOK_URL const below).
//
// To wire up sheet logging:
//   1) Open the "PowerWyze CRM - Outreach Tracker" Google Sheet.
//   2) Extensions → Apps Script. Paste the snippet at the bottom of this file.
//   3) Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
//   4) Copy the resulting /exec URL into AMBASSADOR_WEBHOOK_URL below.

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
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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

    // Minimal required-field validation
    if (!data.name || !data.email || !data.phone || !data.city || !data.state || !data.why || !data.audience) {
      if (status) {
        status.classList.add('error');
        status.textContent = 'Please complete all required fields.';
      }
      return;
    }

    // 1) Fire-and-forget POST to Apps Script webhook if configured
    const webhook =
      (typeof window !== 'undefined' && window.PW_AMBASSADOR_WEBHOOK) ||
      AMBASSADOR_WEBHOOK_URL;
    if (webhook) {
      try {
        // no-cors mode: Apps Script web apps accept this; we don't read the response
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

    // 2) Open mailto so we always have an email copy
    const subject = `Ambassador application — ${data.name}`;
    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `City/State: ${data.city}, ${data.state}`,
      `Audience size: ${data.audience}`,
      `Instagram: ${data.instagram || '—'}`,
      `TikTok: ${data.tiktok || '—'}`,
      `Other socials: ${data.otherSocials || '—'}`,
      '',
      'Why PowerWyze:',
      data.why,
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const mailto = `mailto:wyzer@powerwyze.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    if (status) {
      status.classList.add('success');
      status.textContent = 'Thanks — your application has been logged. Opening your email to send a copy…';
    }

    // Small delay so the success message paints before the mailto handoff
    setTimeout(() => {
      window.location.href = mailto;
    }, 350);

    // Reset after a short pause (user may return to the page after the mailto)
    setTimeout(() => {
      form.reset();
    }, 2000);
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

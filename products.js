/* PowerWyze Products configurator
   - Price calc
   - Gallery thumbs
   - App preview modal (iframes the live kiosk demo)
   - Order form submission via mailto
*/
(function () {
  'use strict';

  const fmt = (n) => '$' + n.toLocaleString('en-US');
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // ===== Year =====
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Gallery =====
  const galleryMainImg = $('#gallery-main-img');
  $$('.thumb').forEach((t) => {
    t.addEventListener('click', () => {
      $$('.thumb').forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
      const src = t.getAttribute('data-src');
      const alt = t.getAttribute('data-alt') || '';
      if (galleryMainImg && src) {
        galleryMainImg.src = src;
        galleryMainImg.alt = alt;
      }
    });
  });

  // ===== Size selection =====
  const sizeInputs = $$('input[name="size"]');
  sizeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      $$('.size-option').forEach((opt) => opt.classList.remove('is-selected'));
      input.closest('.size-option').classList.add('is-selected');
      updatePrice();
    });
  });

  // ===== Branding toggle (shows details, makes IT yr1 free) =====
  const optBranding = $('#opt-branding');
  const brandingDetails = $('#branding-details');
  const optIt = $('#opt-it');
  const itMeta = $('#it-meta');
  const itCard = $('#it-card');

  optBranding.addEventListener('change', () => {
    brandingDetails.hidden = !optBranding.checked;
    updatePrice();
  });

  optIt.addEventListener('change', updatePrice);

  // ===== Custom app toggle =====
  const optCustomApp = $('#opt-custom-app');
  const customAppDetails = $('#custom-app-details');
  optCustomApp.addEventListener('change', () => {
    customAppDetails.hidden = !optCustomApp.checked;
    updatePrice();
  });

  // ===== App checkboxes (update summary only) =====
  $$('input[name="app"]').forEach((cb) => cb.addEventListener('change', updatePrice));

  // ===== Price calculation =====
  function updatePrice() {
    const sizeInput = sizeInputs.find((i) => i.checked);
    const basePrice = sizeInput ? Number(sizeInput.getAttribute('data-price')) : 3500;
    const sizeLabel = sizeInput ? sizeInput.value + '"' : '32"';

    const brandingOn = optBranding.checked;
    const itOn = optIt.checked;

    // If branding is on, Year 1 IT support is free
    const itYr1Cost = brandingOn ? 0 : (itOn ? 500 : 0);
    const brandingCost = brandingOn ? 500 : 0;

    const total = basePrice + itYr1Cost + brandingCost;

    // Update price card
    $('#price-total').textContent = fmt(total);
    const lines = [
      sizeLabel + ' base kiosk: ' + fmt(basePrice),
    ];
    if (itOn && brandingOn) lines.push('IT Year 1: free with branding');
    else if (itOn) lines.push('IT Year 1: $500');
    if (brandingOn) lines.push('Custom branding: $500');
    lines.push('No payment taken on this page');
    $('#price-breakdown').textContent = lines.join(' · ');

    // Update IT card meta to reflect branding bonus
    if (brandingOn) {
      itMeta.innerHTML = '<strong style="color: var(--green-dark);">Free Year 1 (branding bonus)</strong> · $1,000/yr after';
    } else {
      itMeta.textContent = itOn ? '$500 first year · $1,000/yr after' : '$500 first year';
    }

    // Update order summary
    $('#sum-size').textContent = sizeLabel;
    $('#sum-base').textContent = fmt(basePrice);
    $('#sum-it').textContent = brandingOn && itOn ? 'Free (branding bonus)' : (itOn ? '$500' : 'Not added');
    $('#sum-branding').textContent = brandingOn ? '$500' : '—';
    const appsChecked = $$('input[name="app"]:checked').length;
    $('#sum-apps').textContent = String(appsChecked);
    $('#sum-custom').textContent = optCustomApp.checked ? 'Requested' : '—';
    $('#sum-total').textContent = fmt(total);
  }

  // Initialise once
  updatePrice();

  // ===== App preview modal =====
  const modal = $('#preview-modal');
  const iframe = $('#preview-iframe');
  const titleEl = $('#preview-title');
  const openLink = $('#preview-open');

  function openModal(url, title) {
    titleEl.textContent = title || 'App preview';
    openLink.href = url;
    iframe.src = url;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    iframe.src = 'about:blank';
    document.body.style.overflow = '';
  }
  $$('[data-preview-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  $$('.app-preview').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-preview-url');
      const title = btn.getAttribute('data-preview-title') || 'App preview';
      if (url) openModal(url, title);
    });
  });

  // ===== Order form submission via mailto =====
  const form = $('[data-order-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const sizeInput = sizeInputs.find((i) => i.checked);
    const size = sizeInput ? sizeInput.value + '"' : '32"';
    const basePrice = sizeInput ? Number(sizeInput.getAttribute('data-price')) : 3500;
    const brandingOn = optBranding.checked;
    const itOn = optIt.checked;
    const customAppOn = optCustomApp.checked;
    const itYr1 = brandingOn ? 0 : (itOn ? 500 : 0);
    const branding = brandingOn ? 500 : 0;
    const total = basePrice + itYr1 + branding;
    const apps = $$('input[name="app"]:checked').map((cb) => cb.value);

    const lines = [];
    lines.push('Hi PowerWyze team,');
    lines.push('');
    lines.push("I'd like to place a kiosk order with the following configuration:");
    lines.push('');
    lines.push('--- ORDER DETAILS ---');
    lines.push('Name: ' + (fd.get('name') || ''));
    lines.push('Email: ' + (fd.get('email') || ''));
    lines.push('Phone: ' + (fd.get('phone') || ''));
    if (fd.get('company')) lines.push('Company/Event: ' + fd.get('company'));
    lines.push('');
    lines.push('--- KIOSK CONFIGURATION ---');
    lines.push('Size: ' + size);
    lines.push('Base kiosk: ' + fmt(basePrice));
    lines.push('IT support (Year 1): ' + (brandingOn && itOn ? 'Free (branding bonus)' : (itOn ? '$500' : 'Not added')));
    lines.push('Custom branding: ' + (brandingOn ? '$500 (Year 1 IT free)' : 'Not added'));
    if (brandingOn && fd.get('branding_description')) {
      lines.push('Branding description: ' + fd.get('branding_description'));
    }
    if (brandingOn && fd.get('branding_upload') && fd.get('branding_upload').name) {
      lines.push('Branding upload: ' + fd.get('branding_upload').name + ' (please attach to your reply)');
    }
    lines.push('');
    lines.push('Apps selected (' + apps.length + '):');
    if (apps.length === 0) lines.push('  (none)');
    apps.forEach((a) => lines.push('  - ' + a));
    if (customAppOn) {
      lines.push('');
      lines.push('Custom app requested:');
      lines.push('  ' + (fd.get('custom_app_description') || '(no description provided)'));
    }
    lines.push('');
    lines.push('--- ORDER TOTAL (submitted, no payment) ---');
    lines.push('Total: ' + fmt(total));
    lines.push('');
    lines.push('Please follow up to finalize scope, timeline, and payment.');
    lines.push('');
    lines.push('Thanks!');

    const body = encodeURIComponent(lines.join('\n'));
    const subject = encodeURIComponent('Kiosk Order — ' + size + ' RoboKiosk (' + (fd.get('name') || 'New order') + ')');
    const mailto = 'mailto:wyzer@powerwyze.com?subject=' + subject + '&body=' + body;

    window.location.href = mailto;
  });
})();

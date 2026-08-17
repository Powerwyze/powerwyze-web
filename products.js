/* PowerWyze Products configurator
   - Mode toggle (Purchase vs Activation Rental)
   - Price calc
   - Gallery thumbs
   - App preview modal (iframes the live kiosk demo)
   - Order form POST to FormSubmit with cart summary fields
*/
(function () {
  'use strict';

  const fmt = (n) => '$' + n.toLocaleString('en-US');
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // ===== Year =====
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Mode (purchase vs rental) =====
  let mode = 'purchase'; // 'purchase' | 'rental'
  const modeBtns = $$('.mode-btn');
  modeBtns.forEach((b) => {
    b.addEventListener('click', () => {
      mode = b.getAttribute('data-mode');
      modeBtns.forEach((x) => {
        const active = x === b;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      // Update size prices displayed on each option card
      $$('.size-option').forEach((opt) => {
        const input = opt.querySelector('input[name="size"]');
        const priceEl = opt.querySelector('[data-size-price]');
        const v = Number(input.getAttribute(mode === 'rental' ? 'data-rent' : 'data-buy'));
        priceEl.textContent = fmt(v) + (mode === 'rental' ? '/day' : '');
      });
      // Update help copy
      const sizeHelp = $('#size-help');
      const itHelp = $('#it-help');
      const brandingHelp = $('#branding-help');
      const itTitle = $('#it-title');
      const priceLabel = $('#price-label');
      const sumModeEl = $('#sum-mode');
      const sumBaseLabel = $('#sum-base-label');
      const sumItLabel = $('#sum-it-label');
      const sumTotalLabel = $('#sum-total-label');
      if (mode === 'rental') {
        sizeHelp.textContent = 'Floor-standing kiosk available in 32", 37", 43", 55", and 65" portrait displays. Each unit ships with an integrated overhead 4K camera mount for AI vision, capture, and audience analytics.';
        itHelp.textContent = 'IT support is included free during your activation rental. Unlimited edits and new simple app activations on-site.';
        brandingHelp.innerHTML = 'Custom wrap and on-brand UI for $500 (one-time per activation).';
        itTitle.textContent = 'Add IT support (included)';
        priceLabel.textContent = 'Per-day total';
        sumModeEl.textContent = 'Activation rental';
        sumBaseLabel.textContent = 'Base kiosk (per day)';
        sumItLabel.textContent = 'IT support';
        sumTotalLabel.textContent = 'Per-day total';
      } else {
        sizeHelp.textContent = 'Floor-standing kiosk available in 32", 37", 43", 55", and 65" portrait displays. Each unit ships with an integrated overhead 4K camera mount for AI vision, capture, and audience analytics.';
        itHelp.textContent = '$1,000 per year · Includes unlimited software and new simple app activations.';
        brandingHelp.innerHTML = 'Custom wrap and on-brand UI for $500 (one-time). <strong>Bonus:</strong> opt in for branding and the first year of IT support is on us.';
        itTitle.textContent = 'Add IT support';
        priceLabel.textContent = 'Configured total';
        sumModeEl.textContent = 'Purchase';
        sumBaseLabel.textContent = 'Base kiosk';
        sumItLabel.textContent = 'IT support (Year 1)';
        sumTotalLabel.textContent = 'Total submitted';
      }
      updatePrice();
    });
  });

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

  // ===== Branding toggle =====
  const optBranding = $('#opt-branding');
  const brandingDetails = $('#branding-details');
  const optIt = $('#opt-it');
  const itMeta = $('#it-meta');

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
  function getSizePrice(input) {
    return Number(input.getAttribute(mode === 'rental' ? 'data-rent' : 'data-buy'));
  }

  function getQty() {
    const qtyEl = document.getElementById('qty');
    if (!qtyEl) return 1;
    let q = parseInt(qtyEl.value, 10);
    if (isNaN(q) || q < 1) q = 1;
    if (q > 50) q = 50;
    return q;
  }

  function updatePrice() {
    const sizeInput = sizeInputs.find((i) => i.checked);
    const basePriceUnit = sizeInput ? getSizePrice(sizeInput) : (mode === 'rental' ? 1200 : 3500);
    const sizeLabel = sizeInput ? sizeInput.value + '"' : '32"';
    const qty = getQty();

    const brandingOn = optBranding.checked;
    const itOn = optIt.checked;

    let itCost, brandingCostUnit;

    if (mode === 'rental') {
      // Rental: IT support always $0, branding is the only add-on (per kiosk)
      itCost = 0;
      brandingCostUnit = brandingOn ? 500 : 0;
    } else {
      // Purchase: IT $1,000/yr (per account, not multiplied), branding $500/kiosk + makes Year 1 IT free
      itCost = brandingOn ? 0 : (itOn ? 1000 : 0);
      brandingCostUnit = brandingOn ? 500 : 0;
    }

    const baseTotal = basePriceUnit * qty;
    const brandingTotal = brandingCostUnit * qty;
    const total = baseTotal + itCost + brandingTotal;
    const suffix = mode === 'rental' ? '/day' : '';
    const qtySuffix = qty > 1 ? ' (×' + qty + ')' : '';

    // Update price card
    $('#price-total').textContent = fmt(total) + suffix;
    const lines = [];
    if (mode === 'rental') {
      lines.push(qty + '× ' + sizeLabel + ' base kiosk: ' + fmt(baseTotal) + '/day');
      lines.push('IT support: included');
      if (brandingOn) lines.push('Custom branding: ' + fmt(brandingTotal) + ' (one-time)');
      lines.push('No payment taken on this page');
    } else {
      lines.push(qty + '× ' + sizeLabel + ' base kiosk: ' + fmt(baseTotal));
      if (itOn && brandingOn) lines.push('IT Year 1: free with branding');
      else if (itOn) lines.push('IT support: $1,000/yr');
      if (brandingOn) lines.push('Custom branding: ' + fmt(brandingTotal) + ' (one-time)');
      lines.push('No payment taken on this page');
    }
    $('#price-breakdown').textContent = lines.join(' · ');

    // Update IT card meta
    if (mode === 'rental') {
      itMeta.innerHTML = '<strong style="color: var(--green-dark);">Included free with rental</strong>';
    } else if (brandingOn) {
      itMeta.innerHTML = '<strong style="color: var(--green-dark);">Free Year 1 (branding bonus)</strong> · $1,000/yr after';
      // ^ keep same string for branding-on case
    } else {
      itMeta.textContent = '$1,000 / year';
    }

    // Update order summary
    $('#sum-size').textContent = sizeLabel;
    const sumQtyEl = document.getElementById('sum-qty');
    if (sumQtyEl) sumQtyEl.textContent = String(qty);
    $('#sum-base').textContent = fmt(baseTotal) + suffix + (qty > 1 ? ' (' + qty + ' × ' + fmt(basePriceUnit) + suffix + ')' : '');
    if (mode === 'rental') {
      $('#sum-it').textContent = 'Included';
    } else {
      $('#sum-it').textContent = brandingOn && itOn ? 'Free (branding bonus)' : (itOn ? '$1,000' : 'Not added');
    }
    $('#sum-branding').textContent = brandingOn ? (fmt(brandingTotal) + (qty > 1 ? ' (' + qty + ' × $500)' : '')) : '—';
    const appsChecked = $$('input[name="app"]:checked').length;
    $('#sum-apps').textContent = String(appsChecked);
    $('#sum-custom').textContent = optCustomApp.checked ? 'Requested' : '—';
    $('#sum-total').textContent = fmt(total) + suffix;

    const setHidden = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };
    setHidden('order-type-value', mode === 'rental' ? 'Activation rental' : 'Kiosk purchase');
    setHidden('order-total-value', fmt(total) + suffix);
    setHidden('order-summary-value', lines.join(' · '));
    setHidden('order-size-value', sizeLabel);
    setHidden('order-qty-value', String(qty));
    if (mode === 'rental') {
      setHidden('order-it-value', 'Included free with rental');
    } else {
      setHidden('order-it-value', brandingOn && itOn ? 'Free Year 1 (branding bonus)' : (itOn ? '$1,000 / year' : 'Not added'));
    }
    setHidden('order-branding-value', brandingOn ? (fmt(brandingTotal) + ' one-time') : 'Not added');
    const apps = $$('input[name="app"]:checked').map((cb) => cb.value);
    setHidden('order-apps-value', apps.length ? apps.join(', ') : '(none)');
    setHidden('order-custom-value', optCustomApp && optCustomApp.checked ? 'Requested' : 'Not requested');
  }

  // ===== Quantity stepper =====
  const qtyEl = document.getElementById('qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  function syncQtyButtons() {
    if (!qtyEl || !qtyMinus || !qtyPlus) return;
    const q = getQty();
    qtyMinus.disabled = q <= 1;
    qtyPlus.disabled = q >= 50;
  }
  if (qtyMinus) qtyMinus.addEventListener('click', () => {
    const q = getQty();
    qtyEl.value = Math.max(1, q - 1);
    syncQtyButtons();
    updatePrice();
  });
  if (qtyPlus) qtyPlus.addEventListener('click', () => {
    const q = getQty();
    qtyEl.value = Math.min(50, q + 1);
    syncQtyButtons();
    updatePrice();
  });
  if (qtyEl) qtyEl.addEventListener('input', () => {
    // Allow typing; clamp on blur
    syncQtyButtons();
    updatePrice();
  });
  if (qtyEl) qtyEl.addEventListener('blur', () => {
    qtyEl.value = String(getQty());
    syncQtyButtons();
    updatePrice();
  });
  syncQtyButtons();

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

  // Cart checkout POSTs natively to FormSubmit. Keep hidden summary fields in sync first.
  const form = $('[data-order-form]');
  form?.addEventListener('submit', () => {
    updatePrice();
  });
})();

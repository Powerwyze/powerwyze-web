/* Smart Station inquiry form: gallery, configuration summary, and app previews. */
(function () {
  'use strict';
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const form = $('[data-order-form]');
  if (!form) return;
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
        $('#gallery-caption').textContent = t.dataset.caption || 'Product reference';
      }
    });
  });


  const qtyEl = $('#qty');
  const qtyMinus = $('#qty-minus');
  const qtyPlus = $('#qty-plus');
  const getQty = () => Math.min(50, Math.max(1, parseInt(qtyEl.value, 10) || 1));

  function updateSummary() {
    const selectedModel = $('input[name="model"]:checked');
    $$('.model-option').forEach((option) => {
      option.classList.toggle('is-selected', option.contains(selectedModel));
    });
    $('#branding-details').hidden = !$('#opt-branding').checked;
    $('#custom-app-details').hidden = !$('#opt-custom-app').checked;
    $('#sum-mode').textContent = $('#order-type-field').selectedOptions[0].textContent;
    $('#sum-model').textContent = selectedModel.value;
    $('#sum-qty').textContent = String(getQty());
    $('#sum-branding').textContent = $('#opt-branding').checked ? 'Requested' : '—';
    $('#sum-apps').textContent = String($$('input[name="app"]:checked').length);
    $('#sum-custom').textContent = $('#opt-custom-app').checked ? 'Requested' : '—';
    qtyMinus.disabled = getQty() <= 1;
    qtyPlus.disabled = getQty() >= 50;
    $('#order-config-field').value = $$('#order-summary-list li').map((li) =>
      Array.from(li.children).map((span) => span.textContent.trim()).join(': ')
    ).join('\n');
  }
  form.addEventListener('change', (event) => {
    updateSummary();
    if (event.target.name === 'model') {
      const card = event.target.closest('.model-option');
      const photo = card.querySelector('img');
      galleryMainImg.src = photo.getAttribute('src');
      galleryMainImg.alt = photo.alt;
      $('#gallery-caption').textContent = event.target.value + ' · Product reference';
      $$('.thumb').forEach((thumb) => thumb.classList.toggle('is-active', thumb.dataset.src === photo.getAttribute('src')));
    }
  });
  qtyEl.addEventListener('input', updateSummary);
  qtyEl.addEventListener('blur', () => { qtyEl.value = getQty(); updateSummary(); });
  qtyMinus.addEventListener('click', () => { qtyEl.value = Math.max(1, getQty() - 1); updateSummary(); });
  qtyPlus.addEventListener('click', () => { qtyEl.value = Math.min(50, getQty() + 1); updateSummary(); });
  form.addEventListener('submit', updateSummary);
  updateSummary();

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

})();

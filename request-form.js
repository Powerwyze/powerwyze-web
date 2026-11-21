(() => {
  const MAX_FILES = 10;
  // Stay within the submission provider's combined 10 MB attachment limit.
  const MAX_BYTES = 10_000_000;
  const mimeTypes = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf'
  };

  function uploadError(groups) {
    const files = groups.flatMap(group => group.files);
    if (files.length > MAX_FILES) return 'Please choose no more than 10 files across all three upload categories. Clear a category and choose fewer files.';
    if (files.reduce((sum, file) => sum + file.size, 0) > MAX_BYTES) return 'Your files exceed the combined 10 MB limit. Choose smaller files or fewer images.';
    for (const group of groups) {
      for (const file of group.files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!group.accept.split(',').includes('.' + extension) || (file.type && file.type !== mimeTypes[extension])) {
          return `${file.name}: unsupported file type for ${group.category}. Choose one of the formats listed below that upload.`;
        }
        if (!file.size) return `${file.name} is empty. Please choose a non-empty file.`;
      }
    }
    return '';
  }

  // Each multipart file has its own field name: repeated unbracketed names can
  // collapse to the last file in a backend. A manifest preserves the categories.
  function attachmentEntries(groups) {
    let index = 0;
    return groups.flatMap(group => group.files.map(file => {
      index += 1;
      return { key: index === 1 ? 'attachment' : `attachment${index}`, file, category: group.category };
    }));
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { uploadError, attachmentEntries };
  if (typeof document === 'undefined') return;
  const form = document.querySelector('[data-quote-form]');
  if (!form) return;
  const uploads = [...form.querySelectorAll('[data-request-upload]')];
  const status = document.querySelector('#request-file-status');
  const submitStatus = document.querySelector('#request-submit-status');
  const submitButton = form.querySelector('[type="submit"]');
  const selector = form.querySelector('[data-enquiry-type]');
  const panels = [...form.querySelectorAll('[data-enquiry-panel]')];
  const hours = form.querySelector('#private-hours');
  let submitting = false;
  const groups = () => uploads.filter(input => !input.matches(':disabled')).map(input => ({
    category: input.dataset.requestUpload, accept: input.accept, files: [...input.files]
  }));

  // The no-JS fallback submits one file per named input. Enable multi-selection
  // only when the formdata handler below can serialize every selected file.
  uploads.forEach(input => { input.multiple = true; });

  function validateFiles() {
    const activeGroups = groups();
    const message = uploadError(activeGroups);
    uploads.forEach(input => {
      input.setCustomValidity(input.matches(':disabled') ? '' : message);
      input.setAttribute('aria-invalid', String(!input.matches(':disabled') && Boolean(message)));
      const list = document.getElementById(input.id + '-files');
      list.replaceChildren(...[...input.files].map(file => {
        const item = document.createElement('li');
        item.textContent = `${file.name} (${(file.size / 1_000_000).toFixed(2)} MB)`;
        return item;
      }));
      form.querySelector(`[data-clear-upload="${input.id}"]`).hidden = !input.files.length;
    });
    const files = activeGroups.flatMap(group => group.files);
    status.textContent = message || (files.length ? `${files.length} of 10 files selected · ${(files.reduce((sum, file) => sum + file.size, 0) / 1_000_000).toFixed(2)} of 10 MB` : '0 of 10 files selected. A company logo is required.');
    status.dataset.error = String(Boolean(message));
    return !message;
  }
  function validateHours() {
    if (!hours) return true;
    const invalid = !hours.matches(':disabled') && hours.value !== '' && hours.valueAsNumber <= 0;
    hours.setCustomValidity(invalid ? 'Please enter a number of hours greater than 0.' : '');
    return !invalid;
  }
  function syncEnquiry(announce = false) {
    if (!selector || !panels.length) return;
    panels.forEach(panel => {
      const inactive = panel.dataset.enquiryPanel !== selector.value;
      panel.hidden = inactive;
      panel.disabled = inactive;
    });
    validateFiles();
    validateHours();
    form.querySelector('[data-enquiry-selector]').hidden = false;
    if (announce) document.querySelector('#enquiry-type-status').textContent = selector.value + ' form selected.';
  }
  function restoreSubmit() {
    submitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Request';
    submitStatus.textContent = '';
  }
  selector?.addEventListener('change', () => syncEnquiry(true));
  window.addEventListener('pageshow', () => { restoreSubmit(); syncEnquiry(); });
  form.addEventListener('reset', () => queueMicrotask(() => { restoreSubmit(); syncEnquiry(); }));
  uploads.forEach(input => input.addEventListener('change', validateFiles));
  form.querySelectorAll('[data-clear-upload]').forEach(button => button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.clearUpload);
    input.value = '';
    validateFiles();
    input.focus();
  }));
  hours?.addEventListener('input', validateHours);
  form.addEventListener('formdata', event => {
    const data = event.formData;
    uploads.forEach(input => data.delete(input.name));
    const entries = attachmentEntries(groups());
    entries.forEach(({ key, file }) => data.append(key, file, file.name));
    if (entries.length) data.set('Upload categories', entries.map(({ key, file, category }) => `${key}: ${category} — ${file.name}`).join('\n'));
  });
  syncEnquiry();
  form.addEventListener('submit', event => {
    if (submitting) { event.preventDefault(); return; }
    const filesValid = validateFiles();
    const hoursValid = validateHours();
    if (!filesValid || !hoursValid) { event.preventDefault(); form.reportValidity(); return; }
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Continuing to verification…';
    submitStatus.textContent = 'Complete the verification on the next page to send your request. If that page fails to load, return here to review your details and retry.';
    // Keep the native multipart POST and provider verification. Do not retry
    // automatically: a lost response does not prove that a request was unsent.
  });
})();

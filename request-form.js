(() => {
  const form = document.querySelector('[data-quote-form]');
  if (!form) return;
  const upload = form.elements.attachment;
  const status = document.querySelector('#request-file-status');
  const selector = form.querySelector('[data-enquiry-type]');
  const panels = [...form.querySelectorAll('[data-enquiry-panel]')];
  const hours = form.querySelector('#private-hours');

  function validateFiles() {
    // A hidden enquiry's upload must not block the selected enquiry.
    if (!upload || upload.matches(':disabled')) {
      upload?.setCustomValidity('');
      if (status) status.textContent = '';
      return true;
    }
    const total = [...upload.files].reduce((sum, file) => sum + file.size, 0);
    const message = total > 10 * 1024 * 1024 ? 'Please choose logo files totaling 10 MB or less.' : '';
    upload.setCustomValidity(message);
    status.textContent = message;
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
      // Disabled fieldsets exclude every inactive field from both native
      // required validation and the multipart POST, while retaining values.
      panel.disabled = inactive;
    });
    validateFiles();
    validateHours();
    form.querySelector('[data-enquiry-selector]').hidden = false;
    if (announce) document.querySelector('#enquiry-type-status').textContent = selector.value + ' form selected.';
  }
  selector?.addEventListener('change', () => syncEnquiry(true));
  window.addEventListener('pageshow', () => syncEnquiry());
  form.addEventListener('reset', () => queueMicrotask(() => syncEnquiry()));
  upload?.addEventListener('change', validateFiles);
  hours?.addEventListener('input', validateHours);
  syncEnquiry();
  form.addEventListener('submit', event => {
    if (!validateFiles()) { event.preventDefault(); upload.reportValidity(); }
    if (!validateHours()) { event.preventDefault(); hours.reportValidity(); }
  });
})();

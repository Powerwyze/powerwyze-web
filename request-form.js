(() => {
  const form = document.querySelector('[data-quote-form]');
  if (!form) return;
  const upload = form.elements.attachment;
  const status = document.querySelector('#request-file-status');
  function validateFiles() {
    const total = [...upload.files].reduce((sum, file) => sum + file.size, 0);
    const message = total > 10 * 1024 * 1024 ? 'Please choose logo files totaling 10 MB or less.' : '';
    upload.setCustomValidity(message);
    status.textContent = message;
    return !message;
  }
  upload.addEventListener('change', validateFiles);
  form.addEventListener('submit', event => {
    if (!validateFiles()) { event.preventDefault(); upload.reportValidity(); }
  });
})();

(() => {
  'use strict';
  // Use Jotform's supported embed handler for responsive height and submission transitions.
  // If its script is blocked, the iframe stays scrollable and the direct link stays available.
  const selector = "iframe[id='JotFormIFrame-262035571422046']";
  if (document.querySelector(selector) && typeof window.jotformEmbedHandler === 'function') {
    window.jotformEmbedHandler(selector, 'https://form.jotform.com/');
  }
})();

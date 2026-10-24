
      (function () {
        const params = new URLSearchParams(window.location.search);
        const type = (params.get('type') || '').toLowerCase();
        const title = document.getElementById('thanks-title');
        const body = document.querySelector('[data-thanks-body]');
        const kicker = document.querySelector('[data-thanks-kicker]');
        const cta = document.querySelector('[data-thanks-cta] span');
        const copy = {
          quote: {
            kicker: 'Quote request',
            title: 'Thanks — your quote request is in.',
            body: 'We’ll review your event details and follow up within one business day with scope, pricing, and a lead-capture plan.',
            cta: 'Back to home',
            href: '/'
          },
          order: {
            kicker: 'Smart Station inquiry',
            title: 'Thanks — we received your Smart Station inquiry.',
            body: 'No payment was taken. We’ll confirm your configuration and follow up within one business day to finalize scope and timeline.',
            cta: 'View products',
            href: '/products'
          },
          ambassador: {
            kicker: 'Ambassador application',
            title: 'Thanks — your ambassador application is in.',
            body: 'We review every application and respond within three business days with next steps.',
            cta: 'Back to Ambassadors',
            href: '/ambassadors'
          },
          aicards: {
            kicker: 'AI Cards order',
            title: 'Thanks — we received your AI Cards request.',
            body: 'We’ll review the details and follow up within one business day to confirm artwork, quantity, and next steps.',
            cta: 'Back to AI Cards',
            href: '/ai-cards'
          }
        };
        const selected = copy[type];
        if (!selected) return;
        document.title = 'PowerWyze — ' + selected.title;
        if (kicker) kicker.textContent = selected.kicker;
        if (title) title.textContent = selected.title;
        if (body) {
          body.textContent = selected.body + ' ';
          const mail = document.createElement('a');
          mail.href = 'mailto:wyzer@powerwyze.com';
          mail.textContent = 'wyzer@powerwyze.com';
          body.appendChild(document.createTextNode('Need us sooner? Email '));
          body.appendChild(mail);
          body.appendChild(document.createTextNode('.'));
        }
        if (cta) {
          cta.textContent = selected.cta;
          cta.parentElement.setAttribute('href', selected.href);
        }
      })();
    
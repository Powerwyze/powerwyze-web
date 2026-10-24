(() => {
 'use strict';
 const menu = document.querySelector('#pw-menu');
 const toggle = document.querySelector('.pw-menu-toggle');
 function closeMenu() {
   if (!menu?.open) return;
   menu.close();
   toggle.setAttribute('aria-expanded', 'false');
   document.body.classList.remove('menu-open');
   toggle.focus();
 }
 toggle?.addEventListener('click', () => {
   menu.showModal();
   toggle.setAttribute('aria-expanded', 'true');
   document.body.classList.add('menu-open');
 });
 menu?.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);
 menu?.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
 menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
 const hero = document.querySelector('#hero-video');
 const videoToggle = document.querySelector('[data-hero-toggle]');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused = false;
 if (hero && videoToggle) {
   function reflect() {
     videoToggle.textContent = hero.paused ? 'Play video' : 'Pause video';
     videoToggle.setAttribute('aria-label', (hero.paused ? 'Play' : 'Pause') + ' background video');
   }
   hero.addEventListener('play', reflect);
   hero.addEventListener('pause', reflect);
   videoToggle.addEventListener('click', () => {
     if (hero.paused) { userPaused = false; hero.play().catch(reflect); }
     else { userPaused = true; hero.pause(); }
   });
   if (!reduced.matches) hero.play().catch(reflect);
   reduced.addEventListener('change', () => { if (reduced.matches) hero.pause(); });
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) hero.pause();
     else if (!userPaused && !reduced.matches) hero.play().catch(reflect);
   });
   if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
     if (!entries[0].isIntersecting) hero.pause();
     else if (!userPaused && !reduced.matches && !document.hidden) hero.play().catch(reflect);
   }, { threshold: 0.15 }).observe(hero);
   reflect();
 }
 // Keep previously shared section URLs useful after the information architecture change.
 const hash = location.hash.slice(1);
 if (['/','/about','/about.html'].includes(location.pathname)) {
   const aliases = {
     quote:'/contact#quote', 'quote-title':'/contact#quote', 'logo-help':'/contact#logo-help',
     'request-file-status':'/contact#quote', field:'/projects', 'field-title':'/projects',
     system:'/experiences', 'services-title':'/experiences', products:'/products/robokiosk',
     'products-teaser-title':'/products/robokiosk', pricing:'/products/robokiosk',
     'white-experiences':'/experiences', 'amb-callout-title':'/ambassadors'
   };
   if (aliases[hash]) { const destination = new URL(aliases[hash], location.origin); destination.search = location.search; location.replace(destination.href); }
   else if (location.pathname==='/' && ['faq','faq-title','about','leadership-title'].includes(hash)) location.replace('/about#' + (hash.includes('faq')?'faq':'about'));
 }
})();

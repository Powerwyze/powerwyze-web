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
   syncAllVideos();
 }
 toggle?.addEventListener('click', () => {
   menu.showModal();
   toggle.setAttribute('aria-expanded', 'true');
   document.body.classList.add('menu-open');
   syncAllVideos();
 });
 menu?.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);
 menu?.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
 menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
 // Silent clips only play while they are in view. Controls are native when JS/IO is unavailable.
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const videoStates = new Map();
 const videoGroups = [];
 function wantsPlayback(state) {
   return state.visible && !document.hidden && !menu?.open &&
     !state.group.userPaused && (!reduced.matches || state.group.manualPlay);
 }
 function reflectVideos(group) {
   const playing = group.states.some(state => !state.video.paused || state.pending);
   group.button.textContent = playing ? 'Pause' : 'Play';
   group.button.dataset.playing = String(playing);
   group.button.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + group.label + ' (silent)');
 }
 function syncVideo(state) {
   const video = state.video;
   if (!wantsPlayback(state)) {
     video.pause();
     reflectVideos(state.group);
     return;
   }
   if (!video.paused || state.pending) return;
   state.pending = true;
   video.muted = true;
   reflectVideos(state.group);
   // A scroll or tab switch can happen before play() resolves.
   video.play().then(() => {
     if (!wantsPlayback(state)) video.pause();
   }).catch(() => {
     // Keep the poster and Play control available if autoplay is blocked.
   }).finally(() => {
     state.pending = false;
     reflectVideos(state.group);
   });
 }
 function syncAllVideos() {
   videoStates.forEach(syncVideo);
 }
 if ('IntersectionObserver' in window) {
   const observer = new IntersectionObserver(entries => {
     entries.forEach(entry => {
       const state = videoStates.get(entry.target);
       state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
       syncVideo(state);
     });
   }, { threshold: [0, 0.2] });
   document.querySelectorAll('[data-scroll-videos]').forEach(element => {
     const button = element.querySelector('[data-video-toggle]');
     const videos = [...element.querySelectorAll('video')];
     if (!button || !videos.length) return;
     const group = {
       button, states: [], userPaused: false, manualPlay: false,
       label: videos.length > 1 ? 'background videos' : (videos[0].getAttribute('aria-label') || 'video')
     };
     videos.forEach(video => {
       video.muted = true;
       video.defaultMuted = true;
       video.loop = true;
       video.playsInline = true;
       video.controls = false;
       const state = { video, group, visible: false, pending: false };
       group.states.push(state);
       videoStates.set(video, state);
       video.addEventListener('play', () => reflectVideos(group));
       video.addEventListener('pause', () => reflectVideos(group));
       observer.observe(video);
     });
     button.hidden = false;
     button.addEventListener('click', () => {
       const playing = group.states.some(state => !state.video.paused || state.pending);
       group.userPaused = playing;
       group.manualPlay = !playing;
       group.states.forEach(syncVideo);
     });
     reflectVideos(group);
     videoGroups.push(group);
   });
   document.addEventListener('visibilitychange', syncAllVideos);
   reduced.addEventListener('change', () => {
     videoGroups.forEach(group => { group.manualPlay = false; });
     syncAllVideos();
   });
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

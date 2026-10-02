// AI Cards page script. Do not name this file ai-cards.js — Vercel treats
// that as a serverless function and 307s /ai-cards to /api/ai-cards.

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // FormSubmit combined attachment limit

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup ScrollTrigger
  const canAnimate = Boolean(window.gsap && window.ScrollTrigger);
  if (canAnimate) window.gsap.registerPlugin(window.ScrollTrigger);

  // Header scroll state
  const header = document.querySelector("[data-header]");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  // Mobile nav toggle
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-nav]");
  function setMenuOpen(isOpen) {
    siteNav?.classList.toggle("is-open", isOpen);
    menuToggle?.setAttribute("aria-expanded", String(isOpen));
    const label = menuToggle?.querySelector(".sr-only");
    if (label) label.textContent = isOpen ? "Close menu" : "Menu";
    document.body.classList.toggle("nav-open", Boolean(isOpen && siteNav));
    if (!isOpen) document.body.style.removeProperty("overflow");
  }
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMenuOpen(!siteNav.classList.contains("is-open"));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("is-open")) return;
      if (siteNav.contains(event.target) || menuToggle.contains(event.target)) return;
      setMenuOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1200) setMenuOpen(false);
    });
  }

  // Close mobile nav on link click
  const navLinks = document.querySelectorAll("[data-nav] a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  // Reveal animations
  const reveals = document.querySelectorAll(".reveal");
  if (canAnimate && reveals.length > 0) {
    reveals.forEach(el => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  // Submit artwork directly with the email; no external upload service is needed.
  const form = document.querySelector("[data-aicards-form]");
  const fileInput = document.querySelector("[data-aicards-files]");
  const fileList = document.querySelector("[data-aicards-file-list]");
  const statusEl = document.querySelector("[data-aicards-status]");

  function validateFiles() {
    const files = Array.from(fileInput?.files || []);
    const tooLarge = files.reduce((total, file) => total + file.size, 0) > MAX_ATTACHMENT_BYTES;
    const message = tooLarge ? "Artwork must be 10 MB or less in total. Please remove or compress files." : "";
    fileInput?.setCustomValidity(message);
    if (fileList) {
      fileList.textContent = message || files.map(file => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join(", ");
      fileList.classList.toggle("is-error", tooLarge);
    }
    return !tooLarge;
  }
  fileInput?.addEventListener("change", validateFiles);
  form?.addEventListener("submit", (event) => {
    if (event.defaultPrevented) return;
    if (!validateFiles() || !form.reportValidity()) {
      event.preventDefault();
      setStatus("Please check your details and artwork size before sending.", "error");
      return;
    }
    setStatus("Opening secure verification. Complete the verification to send your request.", "info");
    // Keep the native multipart POST and CAPTCHA, required for customer autoresponses.
  });

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (kind === "error") statusEl.classList.add("is-error");
    else if (kind === "success") statusEl.classList.add("is-success");
    else statusEl.classList.add("is-info");
  }
});


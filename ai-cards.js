// ai-cards.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Header scroll state
  const header = document.querySelector("[data-header]");
  if (header) {
    let lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y > 50) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
      lastY = y;
    }, { passive: true });
  }

  // Mobile nav toggle
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-nav]");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !expanded);
      siteNav.classList.toggle("is-open");
    });
  }

  // Close mobile nav on link click
  const navLinks = document.querySelectorAll("[data-nav] a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (menuToggle && siteNav.classList.contains("is-open")) {
        menuToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-open");
      }
    });
  });

  // Reveal animations
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length > 0) {
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

  // Form handling (Mailto)
  const form = document.querySelector("[data-aicards-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Basic validation
      if (!data.name || !data.company || !data.email || !data.tier || !data.quantity || !data.add_ai || !data.brand_details) {
        alert("Please fill in all required fields.");
        return;
      }
      
      const subject = encodeURIComponent(`AI Cards order — ${data.name}`);
      const bodyText = `
Name: ${data.name}
Company: ${data.company}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

Order Details:
Tier: ${data.tier}
Quantity: ${data.quantity}
Add AI Secretary: ${data.add_ai}
Use Case: ${data.use_case || 'Not selected'}

Brand Details & Requirements:
${data.brand_details}
      `.trim();
      
      const body = encodeURIComponent(bodyText);
      const mailtoUrl = `mailto:wyzer@powerwyze.com?subject=${subject}&body=${body}`;
      
      window.location.href = mailtoUrl;
    });
  }
});

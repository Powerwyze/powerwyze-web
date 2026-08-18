// ai-cards.js

// Supabase client for artwork uploads. Public anon key — safe to expose;
// the ai-cards-uploads bucket only allows insert + select for anon by policy.
const SUPABASE_URL = "https://iabkupefwyvqjnflfcxl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gUeQU46FlSposxZgjXLo1Q_tk83r25m";
const AI_CARDS_BUCKET = "ai-cards-uploads";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

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

  // Supabase client (lazy — only if the SDK loaded)
  let supabase = null;
  if (window.supabase && typeof window.supabase.createClient === "function") {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // File input — show file names + validate size as user picks
  const fileInput = document.querySelector("[data-aicards-files]");
  const fileList = document.querySelector("[data-aicards-file-list]");
  if (fileInput && fileList) {
    fileInput.addEventListener("change", () => {
      const files = Array.from(fileInput.files || []);
      if (files.length === 0) {
        fileList.textContent = "";
        return;
      }
      const oversized = files.filter(f => f.size > MAX_FILE_BYTES);
      if (oversized.length > 0) {
        fileList.textContent = `${oversized.length} file(s) exceed 10 MB and will be rejected. Please compress or remove them.`;
        fileList.classList.add("is-error");
        return;
      }
      fileList.classList.remove("is-error");
      const summary = files
        .map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`)
        .join(", ");
      fileList.textContent = `Selected: ${summary}`;
    });
  }

  // Form submission — upload files first, then open mailto with links
  const form = document.querySelector("[data-aicards-form]");
  const submitBtn = document.querySelector("[data-aicards-submit]");
  const statusEl = document.querySelector("[data-aicards-status]");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic validation — only name + email are required
      if (!data.name || !data.email) {
        setStatus("Please fill in your name and email.", "error");
        return;
      }

      const files = Array.from((fileInput && fileInput.files) || []);

      // Reject oversized files up front
      const oversized = files.filter(f => f.size > MAX_FILE_BYTES);
      if (oversized.length > 0) {
        setStatus(`${oversized.length} file(s) exceed 10 MB. Please remove or compress them.`, "error");
        return;
      }

      let uploadedUrls = [];

      if (files.length > 0) {
        if (!supabase) {
          setStatus("Upload service unavailable. Please refresh the page and try again.", "error");
          return;
        }

        submitBtn.disabled = true;
        setStatus(`Uploading ${files.length} file(s)…`, "info");

        try {
          uploadedUrls = await uploadFiles(supabase, files, data);
        } catch (err) {
          console.error("[ai-cards] upload failed", err);
          setStatus("Something went wrong uploading your files. Please try again or email wyzer@powerwyze.com directly.", "error");
          submitBtn.disabled = false;
          return;
        }

        submitBtn.disabled = false;
      }

      // Build email body
      const subject = encodeURIComponent(`AI Cards order — ${data.name}`);
      let bodyText = `Name: ${data.name}
Company: ${data.company || "Not provided"}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}

Order Details:
Tier: ${data.tier || "Not selected"}
Quantity: ${data.quantity || "Not specified"}
Add AI Secretary: ${data.add_ai || "Not specified"}
Use Case: ${data.use_case || "Not selected"}

Brand Details & Requirements:
${data.brand_details || "None provided"}
`;

      if (uploadedUrls.length > 0) {
        bodyText += `\n\nUploaded Artwork (${uploadedUrls.length} file${uploadedUrls.length === 1 ? "" : "s"}):\n`;
        uploadedUrls.forEach((entry) => {
          bodyText += `- ${entry.name}: ${entry.url}\n`;
        });
      } else {
        bodyText += `\n\nUploaded Artwork: none attached\n`;
      }

      const body = encodeURIComponent(bodyText.trim());
      const mailtoUrl = `mailto:wyzer@powerwyze.com?subject=${subject}&body=${body}`;

      setStatus(
        uploadedUrls.length > 0
          ? `Files uploaded. Opening your email app to finish sending…`
          : `Opening your email app to finish sending…`,
        "success"
      );

      window.location.href = mailtoUrl;
    });
  }

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove("is-error", "is-success", "is-info");
    if (kind === "error") statusEl.classList.add("is-error");
    else if (kind === "success") statusEl.classList.add("is-success");
    else statusEl.classList.add("is-info");
  }
});

// Upload every selected file to Supabase Storage in parallel.
// Object path: {yyyymmdd}/{uuid}-{safeFilename}. Returns [{name, url}].
async function uploadFiles(supabase, files, formValues) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const datePrefix = `${y}${m}${d}`;

  const companySlug = (formValues.company || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "unknown";

  const uploads = files.map(async (file) => {
    const uid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "artwork";
    const path = `${datePrefix}/${companySlug}/${uid}-${safeName}`;

    const { error } = await supabase.storage
      .from("ai-cards-uploads")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      throw new Error(`Upload failed for ${file.name}: ${error.message}`);
    }

    const { data: pub } = supabase.storage
      .from("ai-cards-uploads")
      .getPublicUrl(path);

    return { name: file.name, url: pub.publicUrl };
  });

  return Promise.all(uploads);
}

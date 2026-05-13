# PowerWyze — Rebuild in Peach LED's visual style

The user loves [PeachLED.com](https://peachled.com) and wants the PowerWyze site to look like it. **Match Peach LED's layout, motion, and visual system. Replace every piece of Peach LED's content with PowerWyze's content.**

The full Peach LED audit is at `/home/user/workspace/peachled_site_documentation.md` — read it first. Screenshots at `/home/user/workspace/peachled_hero_desktop_1280.jpg` and `peachled_services_section.jpg`.

## What to keep from Peach LED (visual system)
- **Monochromatic dark palette:** pure black `#000000` hero/dark sections, white/off-white `#F5F5F5` body sections. Near-black text `#111111` on light bg. White text on dark. NO color accents. (Use a small mint accent `#BBF7D0` ONLY for the small "live" status dots, otherwise stay grayscale.)
- **Editorial display typography:** big serif/transitional display for H1/H2 (use **DM Serif Display** or **Cormorant Garamond** via Google Fonts). Clean sans-serif body (**Inter** 300-400).
- **CTA pill pattern:** dark pill button, label on the left, **circular arrow-icon badge** on the right (white circle on black button — the arrow is `↗` style, NE arrow). Use this consistently for every CTA on the site. On hover: rotate the arrow 45° to point right, or scale the badge.
- **Sticky nav:** logo left, 4-5 nav links center, CTA pill far right with arrow badge. Dark on hero, light when scrolling past hero.
- **Hero pattern:** left-aligned text block (~50-55%), right side full-bleed **rotating media** (slideshow). Pure black background. Letter-by-letter H1 reveal animation on load. NO eyebrow. CTA pill below subhead.
- **Two-tone alternating sections:** dark (hero, urgency banner, footer) and white/light (body sections).
- **Section patterns:**
  - Mission / About: large left H2, right body text (2-col split)
  - Urgency banner: full-bleed dark strip with centered headline + inline CTA
  - Stats row: 3-column animated count-up
  - Services accordion: sticky left image, right expandable accordion items
  - Testimonials carousel (skip if no real ones — use customer logos/names instead)
  - Logo/case-study marquee: horizontal auto-scroll
  - Case studies: large stacked cards, image left + text right
  - FAQ: 2-col (left heading + CTA, right accordion)
  - Quote form: centered inline (NOT modal this time — match Peach LED)
  - Centered minimal footer
- **Motion (use GSAP + ScrollTrigger):**
  1. Hero H1 letter-by-letter reveal on load (GSAP SplitText or manual span split)
  2. Hero slideshow auto-rotate (5-7s per slide) with pagination dots top-right
  3. Stats count-up on scroll into view
  4. Accordion: smooth expand/collapse; clicking an accordion item swaps the sticky left image
  5. Horizontal marquee for case-study/customer ticker (infinite loop, CSS keyframes)
  6. CTA hover: arrow badge rotates/scales
  7. Respect `prefers-reduced-motion`

## What changes vs the current PowerWyze site
Start from scratch — replace `index.html`, `styles.css`, `script.js` entirely. Don't try to retrofit the current design.

Keep these from the existing project:
- All real assets in `/home/user/workspace/powerwyze/assets/` and `/assets/video/` (DO NOT regenerate)
- `assets/logo.png` (real PowerWyze logo)
- Vercel auto-deploys from the `master` branch — just push to GitHub when done.

## PowerWyze content map (Peach LED structure → PowerWyze content)

### Navigation
- Logo (left): `assets/logo.png` — use the real logo image; on dark hero, the logo's navy circle will need light treatment. The logo is white text + colored mark on cream-ish bg, so on a black hero it may need inversion — your call. (Acceptable: use a CSS `filter: invert(1) brightness(2)` on the logo when over dark sections, OR just keep the logo with its cream background and let it sit naturally.)
- Nav links (4-5): **System** · **In the field** · **Pricing** · **FAQ** · **About**
- CTA pill (right): `Request a quote` → scrolls to `#quote` form

### Hero
- **H1:** `AI-powered event kiosks for brands that need more than badge scans.`
- **Subhead:** `PowerWyze deploys AI brand ambassadors, lead-capture kiosks, and on-site production lanes for trade shows, conferences, sponsorships, and multi-day launches.`
- **CTA pill:** `Request a quote` (arrow badge) → `#quote`
- **Right side rotating slideshow** (5-second autorotate, pagination dots top-right):
  - Slide 1: `assets/hero.jpg` (RoboKiosk render with mint LED glow)
  - Slide 2: still frame from `assets/video/launch-southbeach.mp4` — use the poster `launch-southbeach.jpg`
  - Slide 3: `assets/product-uv.jpg` (AI Customization Studio)
  - Slide 4: `assets/video/event-dr-engagement.jpg` (DR Tradeshow)
- Black background, white text. Apply letter-by-letter reveal to the H1.

### Mission / About ("Visual Excellence for Every Space." equivalent)
- **Left H2:** `A corporate activation system. Not a party booth.`
- **Right body:** `PowerWyze deploys AI brand ambassadors, lead-capture kiosks, and on-site production lanes built for trade shows, conferences, brand activations, and multi-day product launches. The booth grows attendees, gets them through a moment of brand interaction, captures the details your team needs, and produces a personalized takeaway that keeps the conversation moving after the event.`

### Urgency banner
- **Headline (centered):** `Booking sponsorships and brand activations for the upcoming event season.`
- **Inline CTA pill:** `Request a quote` → `#quote`
- Dark `#0A0A0A` background, white text.

### Stats (3-column count-up)
**IMPORTANT — do NOT fabricate numbers.** Use these real, defensible stats:
- `4+` — `Brand activations deployed` (Bartenura, ROM Barceló, Curaleaf, DR Tradeshow)
- `1:1` — `Lead-to-image ratio` (every output ties to a captured lead)
- `100%` — `On-site production` (no offsite manufacturing dependency)

If 3 stats feel thin, use only 3 (mirroring Peach LED's 3). Animate from 0 → final on scroll.

### Services accordion ("All In One Solution" equivalent) — title: `Rental suite`
- Centered heading: `Every layer of an AI-powered activation.`
- Subhead: `Start with a single AI kiosk. Add a production lane when the takeaway needs to be made on site.`
- Left: **sticky image panel** that swaps when an accordion item is opened
- Right: 4 accordion items, each with icon, title, copy, `Request a quote` arrow CTA:
  1. **RoboKiosk** — `AI brand ambassador with custom software, lead capture, and CRM-ready output.` Image: `assets/product-robokiosk.jpg`
  2. **AI Customization Studio (Kiosk + UV)** — `Kiosk paired with UV printer and robotic arm to produce personalized branded merchandise on the floor.` Image: `assets/product-uv.jpg`
  3. **RoboBooth (Kiosk + Embroidery)** — `Production lane with a Brother embroidery machine for branded apparel made live during the event.` Image: `assets/product-booth.jpg`
  4. **Custom builds** — `Bespoke kiosk hardware + software for high-attendance trade shows and multi-day activations.` Image: `assets/hero.jpg` (or whatever fits best)

### Logo / Customer ticker (horizontal marquee)
Auto-scroll text marquee with real customer / event names (since we don't have logo files):
`Bartenura · ROM Barceló · Curaleaf · Dominican Republic Tradeshow · South Beach Wine & Food Festival · Bartenura · ROM Barceló · Curaleaf · DR Tradeshow · SoBeWFF` (repeat seamlessly)
Use a tall thin uppercase sans-serif (letter-spaced) for the marquee items. Section heading above: `Built with recognizable brands.`

### Case studies ("Our Work" equivalent) — title: `In the field`
3 large stacked cards (image left, text right, light card background, rounded corners). Each card has a video instead of an image. Each card ends with a `Request a quote` arrow CTA (not "See our work" — we don't have separate pages).

1. **South Beach Wine & Food Festival** — `Brand moment around the pour. Real footage from the launch reel.` Video: `assets/video/launch-southbeach.mp4` (poster `launch-southbeach.jpg`)
2. **Dominican Republic Tradeshow** — `QR engagement and structured lead capture across a multi-day tradeshow.` Video: `assets/video/event-dr-engagement.mp4`
3. **Outdoor festival activation** — `Outdoor kiosk activation built for high-throughput foot traffic.` Video: `assets/video/event-festival-kiosk.mp4`

All videos: `muted loop playsinline preload="metadata"`, controls enabled, poster set.

### FAQ (2-col: left heading + CTA, right accordion)
- Left heading: `Answering your questions.`
- Left CTA pill: `Get in touch` → `mailto:wyzer@powerwyze.com`
- Right accordion (6 items):
  1. **What event types does PowerWyze support?** — `Trade shows, conferences, sponsorship activations, brand launches, festival activations, multi-day corporate events. We build for floor-plan-driven environments where lead capture and branded takeaway matter.`
  2. **How does the lead capture work?** — `Every attendee interaction generates a structured lead record (name, email, phone, opt-ins) tied 1:1 to the personalized takeaway. Output is CRM-ready CSV or pushed directly to your stack on request.`
  3. **What does the production lane add?** — `On-site UV print and embroidery turns the AI interaction into a physical branded product the attendee walks away wearing — apparel, accessories, branded merchandise — made live during the event.`
  4. **How is pricing structured?** — `Base kiosk rate, production-lane add-on, plus custom-build pricing for multi-day or bespoke enclosures. Quote per event. Request a quote for details.`
  5. **Can the booth be branded for our company?** — `Yes. Every kiosk ships with a custom-wrapped enclosure, on-brand UI, and a tailored AI ambassador trained for your activation.`
  6. **Where do you operate?** — `Headquartered in South Florida, deployed nationally for trade shows and brand activations. International activations available on request.`

### Quote form ("Get A Free Quote" equivalent)
- Centered section, light background.
- Heading: `Request a corporate quote.`
- Sub-heading: `Ready to bring an AI-powered booth to your next event? We respond within one business day.`
- **Inline form (NOT modal)** — match Peach LED's pattern:
  - Name (text, required)
  - Work email (email, required)
  - Phone (tel, required)
  - Company (text, required)
  - Event type (select: Trade show, Conference, Brand activation, Festival sponsorship, Multi-day corporate event, Product launch, Other) (required)
  - Tell us about your event (textarea)
- Submit button (dark pill, no arrow icon — match Peach LED's submit treatment): `Submit`
- Submission: build a `mailto:wyzer@powerwyze.com?subject=Corporate quote request — [Company]&body=...` with all field values URL-encoded in the body. Open via `window.location.href = mailtoUrl` on submit.

### Footer (centered, minimal, black bg)
- Large PowerWyze logo (use `assets/logo.png` — invert if needed for dark bg)
- Thin horizontal rule
- Contact block (centered):
  - **Office:** `Hallandale Beach, FL` (no street address — keep it light)
  - **Email:** `wyzer@powerwyze.com` (mailto link)
  - **Site:** `powerwyze.com`
- `Follow us` label
- 3 social icons: LinkedIn, Instagram, YouTube (use simple SVG icons; placeholder URLs `#` are fine)
- Thin horizontal rule
- Copyright: `© POWERWYZE — ALL RIGHTS RESERVED`

## Hard non-negotiables (do not violate)
1. Use only real assets — never regenerate product images
2. No fake metrics (no "271 leads", no "300+ projects")
3. Never show a $600 tier
4. mailto:wyzer@powerwyze.com is the only form destination
5. Single-page site (anchors only — no separate routes)
6. Vanilla HTML/CSS/JS, no frameworks. GSAP + ScrollTrigger via CDN.
7. Respect `prefers-reduced-motion`
8. Must look like Peach LED — luxe, dark, editorial, monochromatic, big serif display, pill+arrow CTAs

## Project paths
- Root: `/home/user/workspace/powerwyze/`
- Overwrite `index.html`, `styles.css`, `script.js`
- Add `?v=6` cache-buster on CSS/JS links
- Keep `vercel.json`, `.vercelignore`, `assets/` untouched
- After build: git add+commit+push to `master` (api_credentials=['github'], commit message `Rebuild in Peach LED visual style`). Vercel auto-deploys.

## QA before declaring done
- Playwright screenshot at 1280px and 390px (use the style override to disable sticky + reveals: `header,.site-header{position:static!important;} .reveal,[data-gsap]{opacity:1!important;transform:none!important;} *{animation:none!important;transition:none!important;}`)
- Visually confirm: dark hero with rotating media on right, big serif H1, pill+arrow CTAs everywhere, monochromatic palette
- Click every CTA — each scrolls to or submits the quote form
- Submit form (filled) → mailto opens to wyzer@powerwyze.com with all fields in body
- Submit form (empty required fields) → HTML5 validation fires
- All 3 case-study videos play
- Hero slideshow auto-rotates through 4 slides
- Stats count up on scroll
- Accordion expands and swaps the sticky image
- No console errors
- No $600, no Wize Pin, no fabricated metrics, no "Book a demo"

## What to return
- Live URL: `https://powerwyze.vercel.app` (auto-deployed after push)
- GitHub commit hash
- Section order verified
- Motion/animations list
- Screenshot file paths

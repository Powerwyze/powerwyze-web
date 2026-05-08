# PowerWyze Corporate Funnel Redesign — Brief for Build Agent

## Goal
Refocus the PowerWyze website around content + a corporate B2B lead-capture funnel modeled on PartyBoothKiosk.com. Drive every visitor toward submitting a corporate quote-request form. No personal/private event path.

## Build constraints
- **Stack:** vanilla HTML/CSS/JS (existing files). No frameworks. Add **GSAP 3** (CDN) + **ScrollTrigger** for smooth motion.
- **Project root:** `/home/user/workspace/powerwyze/`
- **Files to edit:** `index.html`, `styles.css`, `script.js`. Keep file structure flat.
- **Design system (preserve verbatim):** Background `#FFFFFF`, ink `#102018`, primary green `#2F8763`/`#1F6D46`, mint button `#BBF7D0` on `#0F4F30`, soft mint `#F1FAF3`. Font: Inter 400-800. Existing pricing: $1,200/day base (Most common), $5,000/day production lane, $50/pin/day. **Never display $600 tier.**
- **Real assets stay:** all 4 product images and 4 videos in `assets/` and `assets/video/` — do not replace.
- **GitHub repo:** https://github.com/Powerwyze/powerwyze-web (public). Pushes go through git-agent-proxy. user.email "agent@powerwyze.local", user.name "PowerWyze Agent". Use `api_credentials=["github"]`.

## Funnel mechanics (copy from PartyBoothKiosk audit)
- **Sticky nav with always-visible CTA pill** → opens corporate form modal
- **Hero dual CTAs:** primary "Request a quote" → modal · secondary "See it live" → `#in-the-field`
- **Repeat the primary CTA** at minimum: hero, after how-it-works, after traction, in pricing, final CTA section
- **Modal form** (zero page navigation), backdrop click + Esc closes, focus trap, body scroll lock
- **Response promise** inside the form: "We respond within one business day."

## Form fields (B2B corporate)
Required = ✅
- Your name ✅
- Company ✅
- Title
- Work email ✅
- Phone ✅
- Event name
- Event type (dropdown: Trade show, Conference, Brand activation, Festival sponsorship, Multi-day corporate event, Product launch, Other)
- Event dates (free text)
- Number of days (number)
- Number of kiosks (number)
- Expected attendance (number)
- Venue / city
- Branding / theme direction (textarea)
- Anything else we should know? (textarea)
- How did you hear about us? (text, optional)

Submit button copy: **`Request corporate quote`**

## Form submission wiring
**Two destinations on submit:**
1. **POST JSON** to a Google Apps Script webhook URL (placeholder constant `WEBHOOK_URL` in script.js — leave as `''` initially with a TODO comment; user will paste their `/exec` URL after deploying `SHEET_WEBHOOK.gs`).
2. **Mailto fallback:** if `WEBHOOK_URL` is empty OR fetch fails, open a `mailto:wyzer@powerwyze.com` link with the form contents pre-filled in the body so a lead is never lost.

JSON keys to send (must match Apps Script):
`name, company, title, email, phone, eventName, eventType, eventDates, days, kiosks, attendance, venue, branding, notes, referral, source, userAgent`

Set `source` to `'powerwyze.com'` and `userAgent` to `navigator.userAgent`.

UX:
- Submit button shows loading state ("Sending…")
- On success: show in-modal success state with "We'll be in touch within one business day." + close button
- On failure: show inline error + auto-trigger mailto fallback
- Use `fetch` with `mode: 'no-cors'` (Apps Script trick) — or use `application/x-www-form-urlencoded` body to allow CORS. **Recommended:** `fetch(WEBHOOK_URL, {method:'POST', body: JSON.stringify(payload)})` with `redirect: 'follow'` and treat any non-error completion as success since Apps Script returns opaque response cross-origin.

## Sections (final structure, top → bottom)
1. **Sticky header** — logo, nav links (Why now, Suite, How it works, See it live, Pricing), `[Request a quote]` pill (always visible, opens modal)
2. **Hero** — eyebrow badge, headline, subhead, dual CTAs, hero visual with overlay play button (KEEP existing). Add small badge "● LIVE FROM A RECENT EVENT" overlay on hero image.
3. **Stats strip** — 4 quick proof points: e.g. "271 leads captured · 1:1 lead-to-image · Multi-event deployments · CRM-ready output"
4. **Why now** (existing — keep, tighten copy)
5. **Product suite** (existing — keep, add CTA at end: "Spec your activation →" opens modal)
6. **How it works** (existing — keep, add CTA at end: "Request a quote for your event")
7. **In the field** (existing video grid — keep)
8. **Traction** (existing — keep)
9. **Pricing** (existing — keep all 3 cards. Replace each card's button to open the modal instead of `#contact`. Add subline under pricing: "Custom enclosures and multi-day packages quoted per event.")
10. **Why PowerWyze vs legacy** (existing compare grid — keep)
11. **Final CTA section** — replace the current "Seeking strategic event partners" copy with corporate-focused: "Bring an AI-powered booth to your next event." + big `[Request corporate quote]` button (opens modal). Keep mailto as a tertiary text link below the button.
12. **Footer** — add "Request a quote" link in footer nav.

## GSAP / motion (smooth, restrained — no glitter)
- ScrollTrigger reveal: each section's eyebrow + title + lede stagger up 16px / opacity 0→1 over 600ms when 75% in view. Once only.
- Hero: on load, stagger eyebrow → headline → sub → CTAs with 80ms gap, y: 18 → 0, ease "power3.out". Hero image: subtle scale 1.04 → 1.00, 1200ms.
- Suite cards / why cards / video cards: stagger 80ms when grid enters viewport.
- Sticky CTA pill: subtle bg shift after 300px scroll (already-active nav state).
- Video grid: NO parallax (videos already loop) — just fade-in.
- Modal open: scale 0.96 → 1, opacity 0 → 1, 240ms power2.out. Backdrop fade 200ms.
- **Respect `prefers-reduced-motion`** — wrap GSAP in `if (!matchMedia('(prefers-reduced-motion: reduce)').matches)` and otherwise just set elements to final state.

## CTAs to add/change (every place that currently says "Book a demo" or links to `#contact`)
Replace with **"Request a quote"** that opens the modal. Set up via a single delegated handler:
```js
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-open="quote"]');
  if (t) { e.preventDefault(); openQuoteModal(); }
});
```
Add `data-open="quote"` attribute to every CTA button/link that should open the form. Keep the hero secondary CTA pointing to `#in-the-field`.

## Accessibility
- Modal: `role="dialog" aria-modal="true" aria-labelledby="quote-title"`, focus trap, restore focus on close
- Esc closes modal; backdrop click closes
- Body gets `class="modal-open"` (overflow hidden) when modal active
- Required fields have `aria-required="true"` and visible `*` indicator
- Honor `prefers-reduced-motion`

## Mobile
- Sticky nav: collapse links into a hamburger if width < 720px, but keep the `[Request a quote]` pill always visible in the header bar.
- Modal becomes full-screen sheet on mobile (≤ 640px), 24px radius top, slides up from bottom.
- Form: single column on mobile.

## Files to deliver
1. `index.html` — restructured per above
2. `styles.css` — append modal styles, sticky CTA polish, mobile sheet, GSAP-friendly hidden states
3. `script.js` — modal open/close, focus trap, form handler with webhook + mailto fallback, GSAP/ScrollTrigger animations
4. `SHEET_WEBHOOK.gs` — already created at `/home/user/workspace/powerwyze/SHEET_WEBHOOK.gs`. Do not modify.

## QA checklist (you must verify before marking done)
- [ ] Site builds with no console errors
- [ ] Modal opens from every CTA (count them — should be 6+)
- [ ] Modal closes via X, Esc, backdrop click
- [ ] Required field validation works (try submit with empty required fields)
- [ ] Submit with WEBHOOK_URL='' triggers mailto fallback to wyzer@powerwyze.com
- [ ] All 4 videos still play, lightbox still works
- [ ] Pricing cards: all 3 buttons now open modal
- [ ] No $600 tier visible anywhere
- [ ] Desktop screenshot looks clean (use Playwright)
- [ ] Mobile screenshot at 390px looks clean
- [ ] `prefers-reduced-motion: reduce` setting kills animations gracefully

## Deploy steps (last)
1. `git -C /home/user/workspace/powerwyze add -A`
2. `git -C /home/user/workspace/powerwyze commit -m "Refocus on corporate B2B funnel: modal quote form, GSAP motion, sticky CTA"`
3. `git -C /home/user/workspace/powerwyze push origin main` (api_credentials=["github"])
4. Use the `deploy_website` tool with `project_path="/home/user/workspace/powerwyze"`, `site_name="PowerWyze"`, `entry_point="index.html"`. Reuse same project_path so URL stays the same.

## What to return
- A summary listing: every CTA placement, the webhook integration approach, the modal close behaviors verified, GSAP animations added, and the live URL.
- Note in the summary that the user must (a) deploy `SHEET_WEBHOOK.gs` as an Apps Script Web App, then (b) paste the `/exec` URL into the `WEBHOOK_URL` constant in `script.js` and redeploy.

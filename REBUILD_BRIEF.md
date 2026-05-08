# PowerWyze — Full Rebuild from Scratch

You have **full creative control**. Make it the best B2B corporate-events website you can.

## What PowerWyze actually does
PowerWyze rents AI-powered event kiosks to corporate brands for trade shows, conferences, festival sponsorships, brand activations, and multi-day product launches. The kiosks engage booth visitors with an AI brand ambassador that captures structured leads, generates personalized AI takeaways (images, embroidery, UV prints), and pipes everything into the brand's CRM. It is **not** a photo booth rental for parties — it is a B2B activation system for revenue and event marketing teams.

Real customers / events deployed: **Bartenura** (South Beach Wine & Food Festival), **ROM Barceló**, **Curaleaf**, **Dominican Republic Tradeshow**.

Founded by a CTO building bespoke event hardware + software stacks. The audience is event marketing directors, brand activation leads, and trade-show producers — people who write a five-figure check for a single event.

## Hard non-negotiables (only these)
1. **Fully B2B / corporate** — no personal/private event path, no "rent for your birthday".
2. **Single conversion goal:** every CTA opens or scrolls to a quote-request form. Form fields:
   - Required: Name, Company, Work email, Phone
   - Optional: Title, Event name, Event type, Event dates, # days, # kiosks, Expected attendance, Venue/city, Branding direction, Notes, Referral
   - Submit button copy: **"Request corporate quote"**
3. **Form delivery:** `mailto:wyzer@powerwyze.com` with all field values pre-filled in the email body. (No webhook needed — simple mailto only.)
4. **Use the real assets at `/home/user/workspace/powerwyze/assets/`** — do not generate new product imagery. Available:
   - `assets/hero.jpg` — RoboKiosk render with mint LED glow (good for hero)
   - `assets/product-robokiosk.jpg` — kiosk on event floor with branded base
   - `assets/product-uv.jpg` — AI Customization Studio (kiosk + UV printer + robotic arm)
   - `assets/product-booth.jpg` — RoboBooth with Brother embroidery machine
   - `assets/product-pin.png` — Wize Pin wearable badge concept
   - `assets/video/launch-southbeach.mp4` — South Beach Wine & Food Festival launch reel (15s)
   - `assets/video/event-festival-kiosk.mp4` — outdoor festival activation (portrait)
   - `assets/video/event-dr-engagement.mp4` — DR Tradeshow QR engagement (landscape)
   - `assets/video/event-serving.mp4` — South Beach pour moment (portrait)
   - `assets/video/product-bartenura.mp4` — Bartenura product moment (use if you want)
   - All videos have matching `.jpg` poster frames
5. **NEVER display the $600 tier.** Pricing-wise: $1,200/kiosk/day base, $5,000/day for production-lane (kiosk + UV/embroidery), $50/pin/day for Wize Pin. You may show pricing OR hide it behind the form — your call. If you show it, use those numbers.
6. **No fake metrics.** Do not invent stats like "271 leads captured" — earlier versions had this and the user wants it removed. Use real proof: real customer logos/names (Bartenura, ROM Barceló, Curaleaf, DR Tradeshow), real video footage, real product photos.
7. **GSAP + ScrollTrigger** for motion. Smooth, restrained, premium. Honor `prefers-reduced-motion`.
8. **Vanilla HTML/CSS/JS** only. No frameworks. Single page.

## Beyond that — full freedom
- Pick the design system, color palette, typography, layout structure, section order, copy, voice, motion language.
- Choose whether pricing is visible or hidden.
- Decide whether to include FAQ, testimonials placeholders, case-study cards, phone/WhatsApp click-to-call — your judgment on what makes the page convert hardest.
- Choose modal-form vs full-page form vs sticky inline form. Whatever feels best.
- Choose the navigation pattern (sticky pill, side rail, full-screen menu, etc.).

## Reference for inspiration (don't copy)
- The user audited [PartyBoothKiosk.com](https://partyboothkiosk.com) — they liked: sticky-nav corporate CTA, dual hero CTA, modal forms, repeated CTAs throughout, real photography only, tight editorial copy. Full audit is at `/home/user/workspace/partyboothkiosk_funnel_report.md` if useful.

## Project paths
- **Project root:** `/home/user/workspace/powerwyze/`
- **Existing files to REPLACE:** `index.html`, `styles.css`, `script.js`. Delete or overwrite — start fresh.
- **Keep untouched:** everything in `assets/` and `assets/video/`.
- **Other files in dir** (REDESIGN_BRIEF.md, REBUILD_BRIEF.md, SHEET_WEBHOOK.gs) — leave alone, harmless.

## Deploy
After building and self-QA:
1. `git -C /home/user/workspace/powerwyze add -A`
2. `git -C /home/user/workspace/powerwyze commit -m "Full rebuild: corporate B2B funnel"`  (api_credentials=["github"])
3. `git -C /home/user/workspace/powerwyze push origin main`
4. `deploy_website` with `project_path="/home/user/workspace/powerwyze"`, `site_name="PowerWyze"`, `entry_point="index.html"`. Same project_path → updates same URL.

## QA before declaring done
- Open in Playwright at 1280px and 390px — take full-page screenshots (use the style override below)
- Click every CTA, confirm each opens/scrolls to the quote form
- Submit the form (with required fields filled) and confirm it builds a `mailto:wyzer@powerwyze.com` link with all field values in the body
- Submit with empty required fields → validation works
- Confirm all 4+ videos play
- Confirm no $600 tier visible anywhere
- Confirm no "Book a demo" copy anywhere
- Confirm no fabricated metrics ("271 leads", "1:1 ratio", etc.)
- Console clean

```js
// For full-page screenshots, disable sticky chrome + reveals:
await page.addStyleTag({ content: `
  header, .site-header, [data-sticky] { position: static !important; }
  [data-gsap], .reveal { opacity: 1 !important; transform: none !important; }
  * { animation: none !important; transition: none !important; }
`});
```

## What to return
- Live URL + GitHub commit hash
- One-paragraph design-direction summary (what aesthetic you chose and why)
- List of section order
- List of CTA placements
- List of GSAP animations added
- Confirmation of QA checklist above

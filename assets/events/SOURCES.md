# Event showcase media

Reviewed event clips for the homepage showcase. Source files remain unchanged in Drive. Videos are site-hosted H.264, 30 fps, no audio, with fast-start metadata and JPEG posters. They load on view; native controls remain available. Reduced motion and data saver disable automatic playback.

| Event | Drive source ID | Source segment | Notes |
| --- | --- | --- | --- |
| IMEX · Turespaña | `1uNJTcfQsqJC4XJrUPmuVTeAXdzy1fx4F` | 0–20.500 s | Adult event footage and on-screen portrait results. |
| Startup OLÉ Miami | `10qkb3GrLcLictflJulU9XLhj1uSxDlPW` | 0–3.600 s | Stops before the email address enters the frame. |
| Barceló Activation | `13658xC8WmSL-SD1XL-CD9UJtPKroX_9n` | 0–5.200 s | Stops before the delivery/address area appears. |
| Dominican Republic Trade Show | `1BDJaBse1s3kutbL6tg9gaePkVmB70ZPk` | 8–22.000 s | Adult event footage and on-screen portrait results. |
| South Beach Wine & Food Festival | `1MrYxQ75jD-hd0ejwE2-6mJEq9JL0shPZ` | 0.6–18.600 s | Top 140 px removed to omit the old product-name overlay; real event scenes retained. |
| Americas Food & Beverage | `1vRyRhQGulcZFY9ArzUFd_-P3uvgi-Hym` | 0–3.268 s | Adult event footage and on-screen portrait results. |
| Urban Golf Weekend | `1AlLQ7rOoaPZygarMHDby96pwQN_Ij4uk` | 0–16.000 s | Correct golf-themed photo booth source; separate UV-printing promo is not in this collection. |
| Film Festival | `1Kde79GvUmbdKhE9gFxFkLn4AHLsBuMr-` | 3.4–6.900 s | Keyboard/input sequence omitted. Generic event title retained because the formal title is unverified. |
| Taste of South Florida | `11BpcwD06zyaag2flB6Xt6lRSLxz-oIY2` | 28.5–34.300 s | Only the clearly event-branded booth segment, omitting the showroom walkthrough. |

Excluded: generated UGC and octopus/product-loop demos; school/child footage; unverified event labels. Existing corporate-gifting work remains separately labeled. No event dates, metrics, lead-capture claims, or endorsements have been added.

Edit `data/event-showcase.json` and run `python3 scripts/render-event-showcase.py` to render each clip once in the homepage gallery.

## Additional homepage footage

These ten distinct source takes join the nine existing event clips. Full source files are kept outside the deployment. This source log and the source-ID manifest are excluded from the public build.

| Clip | Drive source ID | Source segment | Privacy treatment |
| --- | --- | --- | --- |
| Americas Food & Beverage · Barceló Portrait | `1i-FzGbTz_dHX0pJKuwGJmsJuLDaWq_32` | 0–3.7 s | Adult event footage; no visible private delivery data in reviewed frames. |
| Americas Food & Beverage · Group Portrait | `1FDpQKtO1-5VpbOKSBNT9nmhm62W10J58` | 0–4.6 s | Adult event footage; no visible private delivery data in reviewed frames. |
| Americas Food & Beverage · Guest Reveal | `1IXudWK6fyUB3vNaEmQN99CiWpTRh4VNj` | 0–5.3 s | Adult event footage; no visible private delivery data in reviewed frames. |
| Americas Food & Beverage · Bump | `126IW83Al2ruOMX-w2gZJcJe6AKwlM1-S` | 0–3.6 s | Top 60% crop removes the guest badge throughout. |
| Trade Show · Guest Experience | `1kjAB43ilew2ZJK7iadoQvsOv2imOnxAe` | 0–7.2 s | Adult event footage; no visible private delivery data in reviewed frames. |
| Dominican Republic Trade Show · Welcome | `1ksdq_Au0gesiR4mzuzgakpSNgUMFiVcn` | 2.8–7.8 s | Rotated clockwise; trimmed camera rotation; tracked badge mask. |
| Barceló Activation · Group Experience | `1uMGSx4Yx8f8aG20MNLzLhmD9AxqLXiFh` | 0–4.3 s | Stops before the private delivery/input screen sequence. |
| Elevate · Guest Reactions | `1D8-LxvrV6ibtu2HGxPFf0-HhsRqLMVFt` | 11–19 s | Top-half crop removes the lower delivery and QR area throughout. |
| Americas Food & Beverage · Barceló Reveal | `11zXwHCDdWCirAWlXV--xmSI2_MobisS6` | 0–2 s | Guest badge obscured throughout. |
| Americas Food & Beverage · Food Portrait | `1bg_-t8vndlUUYbt9gYqWVvWXbFSGGKTd` | 0–0.9 s | Bottom 20% removed to omit a visible delivery email. |

The gift-printing hero is a separate source and is not repeated in this gallery. The 0.9-second Food Portrait clip remains its natural duration; no generated motion or unrelated footage was added. Bump and Elevate use crops that preserve the full selected duration while removing sensitive regions.

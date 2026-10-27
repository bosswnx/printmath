# TODO — things that need the user's identity

## Done

- **Live site: https://printmath.bosswnx.xyz/** — 764 pages (407 English + 357
  Chinese), HTTPS enforced, custom domain on Cloudflare + GitHub Pages.
  Auto-rebuilt on push and nightly.
- Bilingual: Chinese under `/zh/`, with hreflang and a language switch. Chinese
  covers home, about/privacy/terms, the filament guide, troubleshooting, the
  calculators under `/tools/` (labels, notes, intros, FAQs and the client-side
  result strings), the full printer × material settings surface and all 30 cost
  guides. The printer database is the last untranslated section.
- Per-material calibration guides (temperature tower + flow test) for all 15
  filaments, plus the `/guides/calibration/` hub, in English and Chinese.
- Cloudflare DNS managed by me (token at `~/.config/opencode/secrets/cloudflare-api-token`).
- Bing/Yandex/Seznam/Naver: URL list submitted through IndexNow.
- Repo: https://github.com/bosswnx/printmath

## 1. Google Search Console  ← next, opens up the growth loop

1. https://search.google.com/search-console → Add property → **Domain** →
   `bosswnx.xyz` (a domain property covers every subdomain, so you only do this once).
2. Cloudflare → DNS → add the **TXT** record Google shows you.
3. Tell me, or just wait: once it resolves I can finish verification and submit
   `https://printmath.bosswnx.xyz/sitemap.xml`.
4. Once a month: Search Console → Performance → Queries → Export CSV, and drop the
   file into `printmath/data/gsc/`. The nightly job will then target the exact
   queries that are one push away from page 1.

## 2. Payments (for the Pro membership)

Register at **https://www.creem.io** (supports mainland-China individuals, pays out to
Alipay). Create a subscription product, e.g. `PrintMath Pro`, $4/month, and give me the
checkout link. I will build the paywall around it.

Not urgent: the site needs traffic first, and ads + affiliate links come before a
paywall. Do this around the time the site passes ~1,000 visits a day.

## 3. Affiliate accounts (once there is traffic)

Amazon Associates, and/or Bambu Lab / Creality / Polymaker affiliate programs.
Give me the tracking IDs and I will wire them into the relevant pages
(filament pages, printer pages, cost guides).

## 4. Optional: more Cloudflare access

If you later want me to manage anything beyond DNS on bosswnx.xyz (Cloudflare Pages,
email routing, R2), extend the token's permissions. Not needed right now.

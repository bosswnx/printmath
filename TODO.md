# TODO — things that need the user's identity

These are the only steps I cannot do myself. Everything else is automated.

## Live now (no action needed)

- Site: **https://bosswnx.github.io/printmath/** — 390 pages, live, auto-rebuilt on
  every push and once nightly (GitHub Actions).
- Repo: **https://github.com/bosswnx/printmath** (public).
- Bing/Yandex: all URLs submitted via IndexNow.

## 1. Point bosswnx.xyz at the site  ← blocking the custom domain

In the Cloudflare dashboard for **bosswnx.xyz** → DNS → Records → Add record:

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Name | `printmath` |
| Target | `bosswnx.github.io` |
| Proxy status | **DNS only** (grey cloud, not orange) |
| TTL | Auto |

Then tell me, and I will finish the switch automatically:
set the GitHub Pages custom domain, flip `DEPLOY_URL`, rebuild with root-relative
links, enable HTTPS and resubmit every URL to IndexNow with the new host.

**Faster alternative:** create a Cloudflare API token with `Zone → DNS → Edit` for
bosswnx.xyz and save it to `~/.config/opencode/secrets/cloudflare-api-token`.
Then I can manage DNS myself from now on (and set up Cloudflare Pages, which is
faster than GitHub Pages).

## 2. Payments (for the Pro membership)

Register at **https://www.creem.io** (supports mainland-China individuals, pays out
to Alipay). Create a subscription product, e.g. `PrintMath Pro`, $4/month, and give
me the checkout link. I will build the paywall around it.

Not urgent: the site makes no money until it has traffic, and traffic takes months.
Ads and affiliate links come before this.

## 3. Google Search Console

Add property `printmath.bosswnx.xyz`, verify by the DNS TXT record Cloudflare shows
you, and submit `https://printmath.bosswnx.xyz/sitemap.xml`. Then drop monthly
Queries CSV exports into `printmath/data/gsc/` so the nightly loop can target
near-miss keywords.

## 4. Affiliate accounts (once there is traffic)

Amazon Associates and/or Bambu Lab / Creality / Polymaker affiliate programs.
Give me the tracking IDs and I will wire them into the relevant pages.

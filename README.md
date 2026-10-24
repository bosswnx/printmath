# PrintMath

Free 3D-printing calculators, per-machine settings and troubleshooting — built as a
static site generator so the whole thing can be regenerated and redeployed by a
machine, with no server to run.

## What it is

A niche tool site with three layers, all generated from data:

1. **Calculators** (client-side JS, no server):
   - `/tools/cost-calculator/` — material, electricity, machine wear, labour, failure
     buffer, suggested selling price and margin.
   - `/tools/gcode-analyzer/` — drop a `.gcode` file, get filament length, weight, cost,
     layer count and print time. Parses slicer comments and falls back to summing
     extrusion (handles M82/M83).
   - `/tools/filament-length/` — grams ↔ metres ↔ cm³ for any density/diameter.
   - `/tools/spool-remaining/` — weigh a spool, subtract empty weight.
   - `/tools/flow-calculator/` — speed × layer height × line width vs hotend limit.
   - `/tools/farm-calculator/` — throughput, revenue and profit.
2. **Reference** — 16 filament guides, 20 pairwise comparisons, 22 printers,
   241 printer × material settings pages, 19 troubleshooting guides.
3. **Programmatic SEO** — every printer × material combination is its own page with
   settings tuned to that machine's extruder (direct vs Bowden), enclosure and speed.

Total: **333 pages**, generated in well under a second, zero dependencies.

## Commands

```bash
npm run build     # regenerate dist/
npm run serve     # build + preview at http://localhost:4173
npm run check     # verify internal links, titles, descriptions, duplicates
```

## Layout

```
src/data/      filaments.js  printers.js  symptoms.js   <- the moat: structured data
src/lib/       site.js (shell, SEO, JSON-LD)  ui.js
src/pages/     tools.js  filaments.js  printers.js  settings.js  troubleshooting.js  static.js
src/build.js   static site generator (writes dist/)
public/        styles.css  app.js  favicon.svg
scripts/       loop.js (nightly SEO loop)  deploy.sh
```

## Deploying

Output is a plain static folder (`dist/`). Any static host works:

- **Cloudflare Pages** (free, fast, custom domain + free TLS): connect the repo,
  build command `node src/build.js`, output directory `dist`. Or run
  `scripts/deploy.sh cloudflare`.
- **Netlify / Vercel / GitHub Pages**: same idea; `dist/` is the artifact.

## The loop

`scripts/loop.js` is the automated maintenance step: it is meant to run on a schedule,
read Search Console data, and turn "nearly ranking" queries into new pages. See the
top-level `SETUP.md` for the one-time wiring.

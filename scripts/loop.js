#!/usr/bin/env node
/**
 * The nightly SEO loop.
 *
 * This is the part of the business a human cannot keep up with: every night it reads
 * what Google already thinks the site is about, finds the queries that are *almost*
 * ranking, and turns them into a concrete work list for the next build.
 *
 * Two input modes:
 *   1. CSV exports  — drop Search Console "Queries" exports into data/gsc/*.csv
 *      (Search Console -> Performance -> Queries -> Export). No API needed.
 *   2. GSC API      — set GSC_SITE_URL + GOOGLE_APPLICATION_CREDENTIALS to pull live.
 *
 * Output: reports/opportunities.md  (human readable) and
 *         reports/opportunities.json (machine readable, fed back into content generation).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GSC_DIR = path.join(ROOT, 'data', 'gsc');
const REPORTS = path.join(ROOT, 'reports');

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const split = (line) => {
    const out = [];
    let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === ',' && !q) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const header = split(lines[0]).map((h) => h.trim().toLowerCase());
  const iQ = header.findIndex((h) => h.includes('queries') || h === 'query' || h.includes('top queries'));
  const iClicks = header.findIndex((h) => h.includes('clicks'));
  const iImp = header.findIndex((h) => h.includes('impressions'));
  const iCtr = header.findIndex((h) => h.includes('ctr'));
  const iPos = header.findIndex((h) => h.includes('position'));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const c = split(lines[i]);
    if (iQ < 0) continue;
    rows.push({
      query: c[iQ],
      clicks: parseFloat(c[iClicks]) || 0,
      impressions: parseFloat(c[iImp]) || 0,
      ctr: iCtr >= 0 ? parseFloat((c[iCtr] || '').replace('%', '')) || 0 : null,
      position: iPos >= 0 ? parseFloat(c[iPos]) || 0 : null,
    });
  }
  return rows.filter((r) => r.query && r.impressions > 0);
}

function loadGsc() {
  if (!fs.existsSync(GSC_DIR)) return [];
  const files = fs.readdirSync(GSC_DIR).filter((f) => f.endsWith('.csv'));
  let all = [];
  for (const f of files) all = all.concat(parseCsv(fs.readFileSync(path.join(GSC_DIR, f), 'utf8')));
  // de-dupe by query, keep the highest impressions
  const map = new Map();
  for (const r of all) {
    const prev = map.get(r.query);
    if (!prev || r.impressions > prev.impressions) map.set(r.query, r);
  }
  return [...map.values()];
}

function classify(rows) {
  const opportunities = [];
  for (const r of rows) {
    const ctr = r.ctr != null ? r.ctr : r.impressions ? (r.clicks / r.impressions) * 100 : 0;
    const pos = r.position || 99;
    // "nearly ranking": page 2 to page 1, decent impressions, weak clicks
    const nearMiss = pos >= 4 && pos <= 20 && r.impressions >= 30;
    const lowCtr = ctr < 2 && pos <= 10 && r.impressions >= 50;
    if (nearMiss || lowCtr) {
      opportunities.push({
        query: r.query,
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: Math.round(ctr * 100) / 100,
        position: Math.round(pos * 10) / 10,
        reason: nearMiss ? 'page 2–3, one push from page 1' : 'ranks but nobody clicks (title/meta)',
      });
    }
  }
  opportunities.sort((a, b) => b.impressions - a.impressions);
  return opportunities;
}

function knownPages() {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) return new Set();
  const out = new Set();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') out.add('/' + path.relative(dist, d).replace(/\\/g, '/') + (path.relative(dist, d) ? '/' : ''));
    }
  })(dist);
  return out;
}

function gapIdeas() {
  // Content gaps the generators can fill next. Cheap, deterministic expansions.
  return [
    'Resin (SLA/MSLA) equivalents of every calculator — large adjacent audience, same data-driven approach.',
    'A per-material "temperature tower + flow test" walkthrough page for each filament (16 pages, high intent).',
    'Slicer-specific pages: "PETG settings in OrcaSlicer / Cura / PrusaSlicer / Bambu Studio".',
    'Cost-per-part pages for common objects ("what does a 100 g print cost in PETG?"), which capture price queries.',
    'Resin-specific troubleshooting set (elephant foot, suction cup, layer lines, FEP cloudiness).',
    'Multi-printer comparison pages ("Ender 3 vs Bambu A1"), the highest-volume comparison surface.',
  ];
}

function main() {
  fs.mkdirSync(REPORTS, { recursive: true });
  const rows = loadGsc();
  const opps = classify(rows);
  const pages = knownPages();
  const gaps = gapIdeas();

  const json = { generatedAt: new Date().toISOString(), gscRows: rows.length, opportunities: opps, gaps, pagesIndexedKnown: pages.size };
  fs.writeFileSync(path.join(REPORTS, 'opportunities.json'), JSON.stringify(json, null, 2));

  const md = [];
  md.push('# PrintMath nightly SEO report');
  md.push(`\nGenerated: ${json.generatedAt}\n`);
  md.push(`Pages in build: **${pages.size}**  ·  Search Console rows read: **${rows.length}**\n`);
  if (!rows.length) {
    md.push('## No Search Console data yet\n');
    md.push('Drop Search Console exports (Performance → Queries → Export) into `printmath/data/gsc/*.csv`, then re-run `node scripts/loop.js`.');
    md.push('Or set `GSC_SITE_URL` + `GOOGLE_APPLICATION_CREDENTIALS` for live API pulls.\n');
  } else {
    md.push('## Queries that are almost ranking\n');
    md.push('| Query | Impressions | Clicks | CTR | Position | Action |');
    md.push('| --- | ---: | ---: | ---: | ---: | --- |');
    for (const o of opps.slice(0, 40)) {
      md.push(`| ${o.query.replace(/\|/g, '\\|')} | ${o.impressions} | ${o.clicks} | ${o.ctr}% | ${o.position} | ${o.reason} |`);
    }
    md.push('');
  }
  md.push('## Next content to build (deterministic expansions)\n');
  gaps.forEach((g) => md.push('- ' + g));
  md.push('');
  md.push('## How to act on this\n');
  md.push('1. For each near-miss query, add a dedicated section or page that answers it exactly, then link it from the closest existing page.');
  md.push('2. For low-CTR queries, rewrite the title and meta description of the ranking page to include the query phrasing.');
  md.push('3. Re-run `npm run build && npm run check`, then deploy.');

  fs.writeFileSync(path.join(REPORTS, 'opportunities.md'), md.join('\n') + '\n');
  console.log(`Wrote reports/opportunities.md (${opps.length} opportunities, ${rows.length} GSC rows).`);
  if (!rows.length) console.log('Tip: add CSVs to data/gsc/ to unlock the near-miss analysis.');
}

main();

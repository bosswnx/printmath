#!/usr/bin/env node
// Static site generator for PrintMath. No dependencies.
const fs = require('fs');
const path = require('path');
const { SITE } = require('./lib/site');
const { buildTools } = require('./pages/tools');
const { buildFilaments } = require('./pages/filaments');
const { buildPrinters } = require('./pages/printers');
const { buildSettings } = require('./pages/settings');
const { buildTroubleshooting } = require('./pages/troubleshooting');
const { buildStatic, notFound } = require('./pages/static');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function copyDir(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function outFileFor(pagePath) {
  if (pagePath.endsWith('.html')) return path.join(DIST, pagePath);
  const clean = pagePath.replace(/^\/|\/$/g, '');
  return clean ? path.join(DIST, clean, 'index.html') : path.join(DIST, 'index.html');
}

function build() {
  rmrf(DIST);
  mkdirp(DIST);

  const pages = [
    ...buildStatic(),
    ...buildTools(),
    ...buildFilaments(),
    ...buildPrinters(),
    ...buildSettings(),
    ...buildTroubleshooting(),
    notFound(),
  ];

  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.path)) throw new Error('Duplicate path: ' + p.path);
    seen.add(p.path);
    const file = outFileFor(p.path);
    mkdirp(path.dirname(file));
    fs.writeFileSync(file, p.html);
  }

  // static assets
  copyDir(PUBLIC, DIST);

  // Base-path rewrite for subpath deployments (e.g. GitHub Pages project sites).
  if (SITE.basePath) {
    let rewritten = 0;
    for (const f of walk(DIST).filter((x) => x.endsWith('.html'))) {
      const html = fs.readFileSync(f, 'utf8');
      const next = html.replace(/(href|src)="\//g, `$1="${SITE.basePath}/`);
      if (next !== html) {
        fs.writeFileSync(f, next);
        rewritten++;
      }
    }
    console.log(`Base path ${SITE.basePath} applied to ${rewritten} pages`);
  }

  // sitemap (exclude 404 and search)
  const urls = pages
    .filter((p) => !p.path.endsWith('.html') && p.path !== '/search/')
    .map((p) => `  <url><loc>${SITE.baseUrl}${p.path}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n');
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );

  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`
  );

  // 404 for hosts that want it (Netlify/Cloudflare Pages use /404.html)
  console.log(`Built ${pages.length} pages → ${path.relative(process.cwd(), DIST)}`);
  const bySection = {};
  for (const p of pages) {
    const seg = p.path.split('/')[1] || '(home)';
    bySection[seg] = (bySection[seg] || 0) + 1;
  }
  Object.entries(bySection)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

build();

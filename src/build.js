#!/usr/bin/env node
// Static site generator for PrintMath. No dependencies.
//
// Two language passes are run from the same page builders: English at the root,
// Chinese under /zh/. The builders read the current language from lib/i18n, so
// nothing has to be threaded through their signatures.
const fs = require('fs');
const path = require('path');
const { SITE } = require('./lib/site');
const i18n = require('./lib/i18n');
const { buildTools } = require('./pages/tools');
const { buildFilaments } = require('./pages/filaments');
const { buildPrinters } = require('./pages/printers');
const { buildSettings } = require('./pages/settings');
const { buildTroubleshooting } = require('./pages/troubleshooting');
const { buildCost } = require('./pages/cost');
const { buildGuides } = require('./pages/guides');
const { buildStatic, notFound } = require('./pages/static');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

// Sections that are fully translated. Anything else stays English-only, and links
// to it from Chinese pages fall back to the English page.
const ZH_PREFIXES = ['/tools/', '/filaments/', '/troubleshooting/', '/settings/', '/guides/'];
const ZH_EXACT = new Set(['/', '/about/', '/privacy/', '/terms/', '/search/', '/filaments/compare/']);

const zhReady = (p) => ZH_EXACT.has(p.path) || ZH_PREFIXES.some((pre) => p.path.startsWith(pre));

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

function buildAll() {
  return [
    ...buildStatic(),
    ...buildTools(),
    ...buildFilaments(),
    ...buildPrinters(),
    ...buildSettings(),
    ...buildTroubleshooting(),
    ...buildCost(),
    ...buildGuides(),
  ];
}

function writePages(pages) {
  const seen = new Set();
  for (const p of pages) {
    if (seen.has(p.path)) throw new Error('Duplicate path: ' + p.path);
    seen.add(p.path);
    const file = outFileFor(p.path);
    mkdirp(path.dirname(file));
    fs.writeFileSync(file, p.html);
  }
}

function build() {
  rmrf(DIST);
  mkdirp(DIST);

  // --- Chinese pass (run twice: once to learn which paths exist, once for real) ---
  i18n.setLang('zh');
  const zhPaths = new Set(buildAll().filter(zhReady).map((p) => p.path));
  i18n.setTranslated(zhPaths);
  i18n.setLang('zh');
  const zhPages = buildAll().filter(zhReady);

  // --- English pass ---
  i18n.setLang('en');
  const enPages = [...buildAll(), notFound()];

  writePages(enPages.map((p) => ({ path: p.path, html: p.html })));
  writePages(zhPages.map((p) => ({ path: i18n.localePath(p.path, 'zh'), html: p.html })));

  // --- Rewrite Chinese internal links to point at the Chinese version where it exists ---
  const zhDir = path.join(DIST, 'zh');
  if (fs.existsSync(zhDir)) {
    for (const f of walk(zhDir).filter((x) => x.endsWith('.html'))) {
      const html = fs.readFileSync(f, 'utf8');
      const next = html.replace(/<a\b[^>]*>/g, (tag) => {
        if (tag.includes('data-no-i18n')) return tag; // language switch keeps its own target
        return tag.replace(/href="(\/[^"#?]*)"/, (m, href) => {
          if (href.startsWith('/zh/')) return m;
          const enPath = href.endsWith('/') || !/\.[a-z0-9]+$/i.test(href) ? href.replace(/\/?$/, '/') : href;
          if (zhPaths.has(enPath)) return `href="${i18n.localePath(enPath, 'zh')}"`;
          return m;
        });
      });
      if (next !== html) fs.writeFileSync(f, next);
    }
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

  // --- sitemap, with hreflang alternates ---
  const enForSitemap = enPages.filter((p) => !p.path.endsWith('.html') && p.path !== '/search/');
  const entries = [];
  for (const p of enForSitemap) {
    const zh = zhPaths.has(p.path);
    const alts = [
      `    <xhtml:link rel="alternate" hreflang="en" href="${SITE.baseUrl}${p.path}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.baseUrl}${p.path}"/>`,
    ];
    if (zh) alts.push(`    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${SITE.baseUrl}${i18n.localePath(p.path, 'zh')}"/>`);
    entries.push(`  <url>\n    <loc>${SITE.baseUrl}${p.path}</loc>\n${alts.join('\n')}\n  </url>`);
  }
  for (const p of zhPages.filter((x) => x.path !== '/search/')) {
    entries.push(`  <url>\n    <loc>${SITE.baseUrl}${i18n.localePath(p.path, 'zh')}</loc>\n    <xhtml:link rel="alternate" hreflang="en" href="${SITE.baseUrl}${p.path}"/>\n    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${SITE.baseUrl}${i18n.localePath(p.path, 'zh')}"/>\n  </url>`);
  }
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
  );

  fs.writeFileSync(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`
  );

  console.log(`Built ${enPages.length} English + ${zhPages.length} Chinese pages → ${path.relative(process.cwd(), DIST)}`);
  const bySection = {};
  for (const p of enPages) {
    const seg = p.path.split('/')[1] || '(home)';
    bySection[seg] = (bySection[seg] || 0) + 1;
  }
  Object.entries(bySection)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`  sitemap URLs: ${entries.length}`);
}

build();

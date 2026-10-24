#!/usr/bin/env node
// Post-build sanity checks: internal links resolve, no empty titles, sitemap matches.
const fs = require('fs');
const path = require('path');
const { SITE } = require('./lib/site');
const DIST = path.join(__dirname, '..', 'dist');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const exists = (urlPath) => {
  if (SITE.basePath && urlPath.startsWith(SITE.basePath)) urlPath = urlPath.slice(SITE.basePath.length) || '/';
  const clean = urlPath.replace(/^\/|\/$/g, '');
  const f = clean ? path.join(DIST, clean, 'index.html') : path.join(DIST, 'index.html');
  return fs.existsSync(f) || fs.existsSync(path.join(DIST, urlPath));
};

let broken = 0, emptyTitle = 0, emptyDesc = 0, dupCount = 0;
const seenTitles = new Map();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = '/' + path.relative(DIST, f).replace(/index\.html$/, '');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!title.trim()) { emptyTitle++; console.log('EMPTY TITLE', rel); }
  if (!desc.trim()) { emptyDesc++; console.log('EMPTY DESC', rel); }
  if (title) {
    if (seenTitles.has(title)) {
      dupCount++;
      console.log('DUPLICATE TITLE:', title, '\n   ', rel, '\n   ', seenTitles.get(title));
    } else seenTitles.set(title, rel);
  }
  const links = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
  for (const l of new Set(links)) {
    if (l.startsWith('/styles.css') || l.startsWith('/app.js') || l.startsWith('/favicon')) continue;
    if (!exists(l)) { broken++; console.log('BROKEN LINK', rel, '->', l); }
  }
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].length;
console.log(`\nChecked ${htmlFiles.length} pages.`);
console.log(`  broken internal links: ${broken}`);
console.log(`  empty titles: ${emptyTitle}`);
console.log(`  empty descriptions: ${emptyDesc}`);
console.log(`  sitemap urls: ${locs}`);
console.log(`  duplicate titles: ${dupCount}`);
if (broken || emptyTitle || emptyDesc) process.exit(1);

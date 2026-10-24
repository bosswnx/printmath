#!/usr/bin/env node
/**
 * Submit every URL to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * IndexNow needs no account: you host a key file at the site root and POST the URL
 * list. That gets new pages in front of Bing — which now also feeds a lot of AI search.
 *
 * Usage:  node scripts/indexnow.js [--dry]
 * Requires the build to already exist in dist/ and the key file to be deployed.
 */
const fs = require('fs');
const path = require('path');
const { SITE } = require('../src/lib/site');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DRY = process.argv.includes('--dry');

function findKey() {
  const keyFile = fs.readdirSync(path.join(ROOT, 'public')).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) throw new Error('No IndexNow key file in public/ — create one first.');
  return { key: keyFile.replace(/\.txt$/, ''), file: keyFile };
}

function urls() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html' && !p.includes(`${path.sep}404.html`)) {
        const rel = path.relative(DIST, dir).replace(/\\/g, '/');
        out.push(`${SITE.baseUrl}${rel ? '/' + rel : ''}/`);
      }
    }
  })(DIST);
  return out;
}

async function main() {
  const { key, file } = findKey();
  const list = urls();
  const keyLocation = `${SITE.baseUrl}/${file}`;
  console.log(`IndexNow: ${list.length} URLs, host ${SITE.domain}, key file ${keyLocation}`);
  if (DRY) {
    console.log(list.slice(0, 5).join('\n') + '\n…');
    return;
  }
  // IndexNow accepts up to 10,000 URLs per request.
  const body = { host: SITE.domain, key, keyLocation, urlList: list.slice(0, 10000) };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`Submitted: HTTP ${res.status} ${res.statusText}`);
  if (res.status !== 200 && res.status !== 202) {
    console.log(await res.text());
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

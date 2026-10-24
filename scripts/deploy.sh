#!/usr/bin/env node
/**
 * Deployment helper. Builds and pushes dist/ to a static host.
 *
 *   ./scripts/deploy.sh cloudflare      # wrangler pages deploy
 *   ./scripts/deploy.sh netlify         # netlify deploy --prod
 *   ./scripts/deploy.sh ghpages         # push dist/ to gh-pages branch
 *
 * Nothing here is required to develop locally — `npm run serve` is enough.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const target = process.argv[2] || 'cloudflare';

function run(cmd) {
  console.log('$ ' + cmd);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

run('node src/build.js');

if (target === 'cloudflare') {
  const project = process.env.CF_PAGES_PROJECT || 'printmath';
  run(`npx --yes wrangler@latest pages deploy dist --project-name=${project}`);
} else if (target === 'netlify') {
  run('npx --yes netlify-cli@latest deploy --dir=dist --prod');
} else if (target === 'ghpages') {
  const tmp = fs.mkdtempSync('/tmp/printmath-gh-');
  fs.cpSync(path.join(root, 'dist'), tmp, { recursive: true });
  run(`git -C ${tmp} init -q && git -C ${tmp} add -A && git -C ${tmp} -c user.email=bot@printmath.app -c user.name=printmath commit -qm "deploy" && git -C ${tmp} branch -M gh-pages`);
  const remote = execSync('git remote get-url origin', { cwd: root }).toString().trim();
  run(`git -C ${tmp} push -f ${remote} gh-pages`);
} else {
  console.error('Unknown target: ' + target);
  process.exit(1);
}

const { esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { symptoms, byId } = require('../data/symptoms');

function severityPill(s) {
  const map = { 1: ['ok', 'Quick fix'], 2: ['ok', 'Easy'], 3: ['warn', 'Needs tuning'], 4: ['bad', 'Print-killer'] };
  const [tone, label] = map[s] || map[2];
  return `<span class="pill ${tone}">${label}</span>`;
}

function symptomPage(s) {
  const path = `/troubleshooting/${s.id}/`;
  const related = symptoms.filter((x) => x.id !== s.id && x.causes.some((c) => s.causes.includes(c))).slice(0, 4);
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Troubleshooting', path: '/troubleshooting/' }, { name: s.name.split('(')[0].trim(), path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(s.name)}</h1>
    <p class="lead">${esc(s.looks)}</p>
    <p>${severityPill(s.severity)} ${s.aka.map((a) => `<span class="pill">${esc(a)}</span>`).join(' ')}</p>
  </div>

  <h2>Likely causes</h2>
  <ol>${s.causes.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>

  <h2>How to fix it</h2>
  <ol>${s.fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>

  <div class="card premium">
    <div class="kicker">Work through it in order</div>
    <h3>The fastest path to a fix</h3>
    <p class="muted">Change one thing at a time and print a small test. The first fix listed is the most common cause, so start there rather than at the bottom of the list.</p>
  </div>

  ${related.length ? `<h2>Related problems</h2>
  <div class="grid cols-2">
${related.map((r) => `    <a class="card link" href="/troubleshooting/${r.id}/"><h3>${esc(r.name.split('(')[0].trim())}</h3><p class="muted tiny">${esc(r.looks.slice(0, 90))}…</p></a>`).join('\n')}
  </div>` : ''}

  <h2>Tools that help</h2>
  <div class="grid cols-2">
    <a class="card link" href="/tools/gcode-analyzer/"><h3>G-code analyzer</h3><p class="muted">Check the actual filament use and time of a failed print.</p></a>
    <a class="card link" href="/tools/flow-calculator/"><h3>Flow calculator</h3><p class="muted">Rule out a hotend limit behind under-extrusion.</p></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${s.name.split('(')[0].trim()} — 3D printing troubleshooting`,
      description: `${s.name}: what it looks like, the usual causes and how to fix it, ranked by how often each cause is the real culprit.`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Troubleshooting', path: '/troubleshooting/' }, { name: s.name.split('(')[0].trim(), path }]),
        faq([
          { q: `What causes ${s.aka[0]} in 3D printing?`, a: s.causes.slice(0, 3).join('; ') + '.' },
          { q: `How do I fix ${s.aka[0]}?`, a: s.fixes.slice(0, 3).join(' ') },
        ]),
      ],
    }),
  };
}

function buildTroubleshooting() {
  const pages = [];
  pages.push({
    path: '/troubleshooting/',
    html: layout({
      title: '3D printing troubleshooting guide — every common defect',
      description:
        'Fix stringing, warping, layer shifting, under-extrusion, blobs, elephant foot, ringing and more. Each problem with its causes and fixes.',
      path: '/troubleshooting/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Troubleshooting', path: '/troubleshooting/' }])}
<div class="wrap">
  <div class="hero"><h1>3D printing troubleshooting</h1>
  <p class="lead">${symptoms.length} print defects, what each one looks like, and the fixes ranked by how often they are the real cause.</p></div>
  <div class="grid cols-2">
${symptoms.map((s) => `    <a class="card link" href="/troubleshooting/${s.id}/"><h3>${esc(s.name.split('(')[0].trim())}</h3><p class="muted tiny">${esc(s.looks.slice(0, 110))}…</p></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Troubleshooting', path: '/troubleshooting/' }])],
    }),
  });
  symptoms.forEach((s) => pages.push(symptomPage(s)));
  return pages;
}

module.exports = { buildTroubleshooting };

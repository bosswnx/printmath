const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { filaments, byId } = require('../data/filaments');
const { printers } = require('../data/printers');
const { symptoms } = require('../data/symptoms');

const COMPARISONS = [
  ['pla', 'petg'], ['pla', 'abs'], ['pla', 'pla-plus'], ['petg', 'abs'], ['abs', 'asa'],
  ['petg', 'tpu'], ['pla', 'tpu'], ['nylon', 'pc'], ['petg', 'petg-cf'], ['pla', 'pla-cf'],
  ['nylon', 'pa-cf'], ['hips', 'abs'], ['asa', 'petg'], ['pla', 'asa'], ['pc', 'abs'],
  ['pva', 'hips'], ['tpu', 'tpu-95a'], ['wood-pla', 'pla'], ['petg', 'nylon'], ['pla-cf', 'petg-cf'],
];

function home() {
  const path = '/';
  const body = `<div class="wrap">
  <div class="hero">
    <h1>3D printing maths, settings and fixes — without the guesswork</h1>
    <p class="lead">Free calculators for print cost, filament use and flow, a settings profile for every printer and material, and a troubleshooting guide for ${symptoms.length} common defects.</p>
    <p><a class="btn" href="/tools/cost-calculator/">Calculate a print's cost</a> <a class="btn ghost" href="/tools/gcode-analyzer/">Analyze a G-code file</a></p>
  </div>

  <h2>Calculators</h2>
  <div class="grid cols-3">
    <a class="card link" href="/tools/cost-calculator/"><div class="kicker">Cost</div><h3>Print cost calculator</h3><p class="muted">Material, electricity, wear, labour and a suggested price.</p></a>
    <a class="card link" href="/tools/gcode-analyzer/"><div class="kicker">Analysis</div><h3>G-code analyzer</h3><p class="muted">Filament, weight, cost and time from a sliced file.</p></a>
    <a class="card link" href="/tools/filament-length/"><div class="kicker">Convert</div><h3>Length &amp; weight</h3><p class="muted">Grams, metres and cm³ for any material.</p></a>
    <a class="card link" href="/tools/spool-remaining/"><div class="kicker">Convert</div><h3>Spool remaining</h3><p class="muted">Weigh a spool to see what is left.</p></a>
    <a class="card link" href="/tools/flow-calculator/"><div class="kicker">Tuning</div><h3>Volumetric flow</h3><p class="muted">Is your speed beyond the hotend?</p></a>
    <a class="card link" href="/tools/farm-calculator/"><div class="kicker">Business</div><h3>Print farm profit</h3><p class="muted">Throughput, revenue and margin.</p></a>
  </div>

  <h2>Find your settings</h2>
  <p class="muted">Starting profiles for ${printers.length} printers × ${filaments.length} materials, tuned to each machine's extruder and enclosure.</p>
  <div class="grid cols-3">
${printers.slice(0, 9).map((p) => `    <a class="card link" href="/settings/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? 'Enclosed' : 'Open frame'}</p></a>`).join('\n')}
  </div>
  <p><a href="/settings/">All printer settings →</a></p>

  <h2>Fix a bad print</h2>
  <div class="grid cols-3">
${symptoms.slice(0, 6).map((s) => `    <a class="card link" href="/troubleshooting/${s.id}/"><h3>${esc(s.name.split('(')[0].trim())}</h3></a>`).join('\n')}
  </div>
  <p><a href="/troubleshooting/">All ${symptoms.length} problems →</a></p>

  <h2>Choose a filament</h2>
  <div class="grid cols-3">
${filaments.slice(0, 6).map((f) => `    <a class="card link" href="/filaments/${f.id}/"><h3>${esc(f.name)}</h3><p class="muted tiny">Nozzle ${f.nozzle[0]}–${f.nozzle[1]} °C · ${f.density} g/cm³</p></a>`).join('\n')}
  </div>
  <p><a href="/filaments/">All filaments →</a></p>
</div>`;
  return {
    path,
    html: layout({
      path,
      body,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: SITE.name,
          url: SITE.baseUrl,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faq([
          { q: 'Are these 3D printing tools free?', a: 'Yes. Every calculator and reference page is free and works in your browser without an account.' },
          { q: 'Do my G-code files get uploaded?', a: 'No. The G-code analyzer runs entirely in your browser; no file leaves your device.' },
          { q: 'How accurate are the suggested settings?', a: 'They are sensible starting points based on each machine and material, not a guarantee. Always confirm with a temperature tower and a flow test.' },
        ]),
      ],
    }),
  };
}

function staticPage({ path, title, description, h1, html }) {
  return {
    path,
    html: layout({
      path,
      title,
      description,
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: h1, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px"><h1>${esc(h1)}</h1></div>
  ${html}
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: h1, path }])],
    }),
  };
}

function buildStatic() {
  const pages = [home()];

  pages.push({
    path: '/filaments/compare/',
    html: layout({
      title: 'Filament comparisons — which material wins',
      description: 'Side-by-side 3D printing filament comparisons: PLA vs PETG, ABS vs ASA, nylon vs PC and more.',
      path: '/filaments/compare/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: 'Compare', path: '/filaments/compare/' }])}
<div class="wrap">
  <div class="hero"><h1>Filament comparisons</h1><p class="lead">Pick two materials and see the differences that matter.</p></div>
  <div class="grid cols-3">
${COMPARISONS.map(([a, b]) => `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(byId[a].name)} vs ${esc(byId[b].name)}</h3></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: 'Compare', path: '/filaments/compare/' }])],
    }),
  });

  pages.push(
    staticPage({
      path: '/about/',
      title: 'About',
      description: `About ${SITE.name}: free 3D printing calculators, settings and troubleshooting.`,
      h1: `About ${SITE.name}`,
      html: `<p>${esc(SITE.name)} is a set of free tools for people who print things: calculators that handle the maths slicers leave to you, starting settings for real printer and material combinations, and a troubleshooting guide written the way you actually debug a print — most likely cause first.</p>
<p>Everything runs in your browser. There is no account, no upload, and no tracking beyond basic, anonymous page counts.</p>
<p>Settings and temperatures are starting points drawn from manufacturer data sheets and community consensus. They are not a guarantee: machines vary, and the only test that counts is the one on your printer. Always confirm with a temperature tower and a flow test.</p>
<p>${esc(SITE.name)} is independent and not affiliated with any printer or filament manufacturer. Some outbound product links may be affiliate links; they never change what we recommend.</p>
<p>Corrections and suggestions: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
    })
  );

  pages.push(
    staticPage({
      path: '/privacy/',
      title: 'Privacy',
      description: `${SITE.name} privacy policy: no accounts, no file uploads, minimal analytics.`,
      h1: 'Privacy',
      html: `<p>The calculators on ${esc(SITE.name)} run entirely in your browser. G-code files you open are read locally with the FileReader API and are never transmitted to a server.</p>
<p>We do not require an account and we do not sell data. We may use privacy-respecting, aggregate analytics to count page views and see which tools are useful.</p>
<p>Third-party links (for example to a filament vendor) are governed by those sites' own privacy policies.</p>
<p>Questions: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
    })
  );

  pages.push(
    staticPage({
      path: '/terms/',
      title: 'Terms',
      description: `${SITE.name} terms of use.`,
      h1: 'Terms of use',
      html: `<p>${esc(SITE.name)} is provided "as is", without warranty of any kind. The calculators, settings and troubleshooting advice are estimates and guidance, not professional engineering advice. You are responsible for the parts you design, print and sell.</p>
<p>Do not rely on these figures for safety-critical applications. Where a part must not fail, test it and apply an appropriate safety factor.</p>
<p>Content is © ${SITE.year} ${esc(SITE.name)}. You may use the tools freely for personal and commercial printing.</p>`,
    })
  );

  pages.push(
    staticPage({
      path: '/search/',
      title: 'Search',
      description: `Search ${SITE.name}.`,
      h1: 'Search',
      html: `<p class="muted">Find a calculator, material, printer or fix.</p>
<div class="tool" data-tool="settings-filter">
  <div class="field"><label for="q">Search</label><input id="q" type="search" placeholder="e.g. PETG, Ender 3, warping, cost" data-filter></div>
  <p class="muted tiny" data-count></p>
  <div class="grid cols-2" style="margin-top:12px">
    ${[
      ['/tools/cost-calculator/', 'Print cost calculator'],
      ['/tools/gcode-analyzer/', 'G-code analyzer'],
      ['/tools/filament-length/', 'Filament length & weight'],
      ['/tools/spool-remaining/', 'Spool remaining'],
      ['/tools/flow-calculator/', 'Volumetric flow calculator'],
      ['/tools/farm-calculator/', 'Print farm calculator'],
      ['/filaments/', 'Filament guide'],
      ['/printers/', 'Printer database'],
      ['/settings/', 'Settings by printer'],
      ['/troubleshooting/', 'Troubleshooting'],
    ]
      .concat(filaments.map((f) => [`/filaments/${f.id}/`, f.name + ' filament']))
      .concat(printers.map((p) => [`/printers/${p.id}/`, p.name]))
      .concat(symptoms.map((s) => [`/troubleshooting/${s.id}/`, s.name.split('(')[0].trim()]))
      .map(([href, label]) => `<a class="card link" data-row="${esc((label + ' ' + href).toLowerCase())}" href="${href}"><h3 style="margin:0;font-size:16px">${esc(label)}</h3></a>`)
      .join('\n    ')}
  </div>
</div>`,
    })
  );

  return pages;
}

function notFound() {
  return {
    path: '/404.html',
    html: layout({
      title: 'Not found',
      description: 'Page not found.',
      path: '/404.html',
      noindex: true,
      body: `<div class="wrap"><div class="hero"><h1>Page not found</h1>
      <p class="lead">That page does not exist. Try the <a href="/tools/">tools</a>, <a href="/filaments/">filament guide</a> or <a href="/troubleshooting/">troubleshooting</a>.</p></div></div>`,
    }),
  };
}

module.exports = { buildStatic, notFound };

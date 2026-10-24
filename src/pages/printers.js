const { esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs, diffPill } = require('../lib/ui');
const { printers, byId: pById } = require('../data/printers');
const { filaments, byId: fById } = require('../data/filaments');

const ABRASIVE = new Set(['pla-cf', 'petg-cf', 'pa-cf']);

function nozzleMax(p) {
  return p.hardened ? 300 : 260;
}

function materialFit(p) {
  const good = [], possible = [], no = [];
  filaments.forEach((f) => {
    if (f.nozzle[1] > nozzleMax(p)) return no.push(f);
    if (f.enclosure && !p.enclosure) return no.push(f);
    if (ABRASIVE.has(f.id) && !p.hardened) return possible.push(f);
    if (f.difficulty >= 4 && !p.directDrive) return possible.push(f);
    good.push(f);
  });
  return { good, possible, no };
}

function printerPage(p) {
  const path = `/printers/${p.id}/`;
  const fit = materialFit(p);
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: p.name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(p.name)}</h1>
    <p class="lead">${esc(p.notes)}</p>
    <p>${p.tags.map((t) => `<span class="pill">${esc(t)}</span>`).join(' ')}</p>
  </div>

  <h2>Specifications</h2>
  <div class="table-scroll"><table>
    <tbody>
      <tr><th>Build volume</th><td>${p.build[0]} × ${p.build[1]} × ${p.build[2]} mm</td></tr>
      <tr><th>Maker</th><td>${esc(p.maker)}</td></tr>
      <tr><th>Released</th><td>${p.year}</td></tr>
      <tr><th>Stock nozzle</th><td>${p.nozzle} mm${p.hardened ? ' (hardened)' : ''}</td></tr>
      <tr><th>Typical usable speed</th><td>~${p.maxSpeed} mm/s</td></tr>
      <tr><th>Enclosure</th><td>${p.enclosure ? 'Yes' : 'No'}</td></tr>
      <tr><th>Extruder</th><td>${p.directDrive ? 'Direct drive' : 'Bowden'}</td></tr>
      <tr><th>Bed levelling</th><td>${esc(p.leveling)}</td></tr>
      <tr><th>Approx. price</th><td>~$${p.price}</td></tr>
    </tbody>
  </table></div>

  <h2>What this printer prints well</h2>
  <p>${fit.good.map((f) => `<a class="pill ok" href="/filaments/${f.id}/">${esc(f.name)}</a>`).join(' ')}</p>
  ${fit.possible.length ? `<h3>Possible with changes</h3><p>${fit.possible.map((f) => `<a class="pill warn" href="/filaments/${f.id}/">${esc(f.name)}</a>`).join(' ')}</p>` : ''}
  ${fit.no.length ? `<h3>Not recommended</h3><p>${fit.no.map((f) => `<a class="pill bad" href="/filaments/${f.id}/">${esc(f.name)}</a>`).join(' ')}</p>` : ''}

  <h2>Starting settings</h2>
  <p>Per-material starting points for the ${esc(p.name)}:</p>
  <div class="grid cols-3">
${fit.good
      .slice(0, 6)
      .map((f) => `    <a class="card link" href="/settings/${p.id}/${f.id}/"><h3>${esc(f.name)} settings</h3><p class="muted tiny">Nozzle ${f.nozzle[0]}–${f.nozzle[1]} °C · Bed ${f.bed[0]}–${f.bed[1]} °C</p></a>`)
      .join('\n')}
  </div>
  <p><a href="/settings/${p.id}/">See all settings for the ${esc(p.name)} →</a></p>
  ${(() => {
    const pairs = PRINTER_COMPARISONS.filter(([x, y]) => x === p.id || y === p.id);
    return pairs.length
      ? `<h2>Compare with other printers</h2><div class="grid cols-3">${pairs
          .map(([x, y]) => `    <a class="card link" href="/printers/compare/${x}-vs-${y}/"><h3>${esc(pById[x].name)} vs ${esc(pById[y].name)}</h3></a>`)
          .join('\n')}</div>`
      : '';
  })()}
</div>`;
  return {
    path,
    html: layout({
      title: `${p.name} — specs, materials and settings`,
      description: `${p.name} 3D printer: build volume, enclosure, speed, which filaments it prints well, and starting settings for each material.`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: p.name, path }]),
        faq([
          { q: `What is the build volume of the ${p.name}?`, a: `${p.build[0]} × ${p.build[1]} × ${p.build[2]} mm.` },
          { q: `Can the ${p.name} print ABS or ASA?`, a: p.enclosure ? 'Yes — it is enclosed, so ABS and ASA are practical.' : 'Not well. It is an open-frame machine, so ABS and ASA will warp and the fumes are best avoided.' },
        ]),
      ],
    }),
  };
}

const PRINTER_COMPARISONS = [
  ['ender-3-v3', 'bambu-a1'],
  ['ender-3-v3', 'prusa-mk4'],
  ['bambu-a1', 'bambu-p1s'],
  ['bambu-p1s', 'bambu-x1c'],
  ['bambu-a1-mini', 'bambu-a1'],
  ['ender-3', 'ender-3-v2'],
  ['ender-3', 'ender-3-v3'],
  ['k1', 'bambu-p1s'],
  ['k1', 'ender-3-v3'],
  ['prusa-mk3s', 'prusa-mk4'],
  ['prusa-mk4', 'bambu-p1s'],
  ['voron-24', 'bambu-x1c'],
  ['neptune-4-pro', 'ender-3-v3'],
  ['sovol-sv06', 'ender-3-v3'],
  ['anycubic-kobra-2', 'neptune-4-pro'],
  ['qidi-x-plus-3', 'bambu-p1s'],
  ['voron-0-2', 'bambu-a1-mini'],
  ['flashforge-adventurer-5m', 'k1'],
  ['prusa-mini', 'bambu-a1-mini'],
  ['prusa-xl', 'voron-24'],
  ['ender-5-s1', 'ender-3-s1'],
  ['k1-max', 'bambu-x1c'],
  ['ender-3-s1', 'ender-3-v3'],
  ['bambu-a1', 'prusa-mk4'],
  ['anycubic-kobra-2', 'sovol-sv06'],
];

function comparePage(pa, pb) {
  const a = pById[pa], b = pById[pb];
  const path = `/printers/compare/${pa}-vs-${pb}/`;
  const fa = materialFit(a), fb = materialFit(b);
  const vol = (p) => p.build[0] * p.build[1] * p.build[2];
  const bigger = vol(a) === vol(b) ? null : vol(a) > vol(b) ? a : b;
  const faster = a.maxSpeed === b.maxSpeed ? null : a.maxSpeed > b.maxSpeed ? a : b;
  const cheaper = a.price === b.price ? null : a.price < b.price ? a : b;
  const rows = [
    ['Build volume', a.build.join(' × ') + ' mm', b.build.join(' × ') + ' mm'],
    ['Volume', Math.round(vol(a) / 1000) + ' L', Math.round(vol(b) / 1000) + ' L'],
    ['Enclosure', a.enclosure ? 'Yes' : 'No', b.enclosure ? 'Yes' : 'No'],
    ['Extruder', a.directDrive ? 'Direct drive' : 'Bowden', b.directDrive ? 'Direct drive' : 'Bowden'],
    ['Hardened nozzle', a.hardened ? 'Yes' : 'No', b.hardened ? 'Yes' : 'No'],
    ['Bed levelling', a.leveling, b.leveling],
    ['Usable speed', '~' + a.maxSpeed + ' mm/s', '~' + b.maxSpeed + ' mm/s'],
    ['Release year', String(a.year), String(b.year)],
    ['Approx. price', '$' + a.price, '$' + b.price],
    ['Materials it prints well', String(fa.good.length), String(fb.good.length)],
  ];
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: 'Compare', path: '/printers/compare/' }, { name: `${a.name} vs ${b.name}`, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(a.name)} vs ${esc(b.name)}</h1>
    <p class="lead">Two popular machines side by side on volume, enclosure, speed, material range and price — and which one to buy for your case.</p>
  </div>
  <div class="table-scroll"><table>
    <thead><tr><th>Spec</th><th>${esc(a.name)}</th><th>${esc(b.name)}</th></tr></thead>
    <tbody>${rows.map(([k, av, bv]) => `<tr><td>${k}</td><td>${esc(av)}</td><td>${esc(bv)}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Quick verdict</h2>
  <ul>
    <li><strong>Bigger prints:</strong> ${bigger ? esc(bigger.name) : 'A tie.'}</li>
    <li><strong>Faster:</strong> ${faster ? esc(faster.name) : 'A tie.'}</li>
    <li><strong>Cheaper:</strong> ${cheaper ? esc(cheaper.name) : 'A tie.'}</li>
    <li><strong>Wider material range:</strong> ${fa.good.length === fb.good.length ? 'A tie.' : esc((fa.good.length > fb.good.length ? a : b).name)} (${fa.good.length} vs ${fb.good.length} materials without modification)</li>
  </ul>

  <h2>The ${esc(a.name)} in short</h2>
  <p>${esc(a.notes)}</p>
  <h2>The ${esc(b.name)} in short</h2>
  <p>${esc(b.notes)}</p>

  <div class="grid cols-2">
    <a class="card link" href="/printers/${a.id}/"><h3>${esc(a.name)} full specs</h3></a>
    <a class="card link" href="/printers/${b.id}/"><h3>${esc(b.name)} full specs</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${a.name} vs ${b.name} — 3D printer comparison`,
      description: `${a.name} vs ${b.name}: build volume, enclosure, speed, material compatibility and price compared, with a verdict on which to buy.`,
      path,
      body,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: `${a.name} vs ${b.name}`, path }])],
    }),
  };
}

function buildPrinters() {
  const pages = [];
  pages.push({
    path: '/printers/',
    html: layout({
      title: '3D printer database — specs and material compatibility',
      description:
        'Compare popular 3D printers: Creality, Bambu Lab, Prusa, Voron, Elegoo, Qidi and more. Build volume, enclosure, speed and which filaments each prints well.',
      path: '/printers/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }])}
<div class="wrap">
  <div class="hero"><h1>Printer database</h1>
  <p class="lead">${printers.length} popular FDM printers with build volume, enclosure, extruder and the materials each one handles well.</p></div>
  <div class="table-scroll"><table>
    <thead><tr><th>Printer</th><th>Build volume</th><th>Enclosed</th><th>Extruder</th><th class="num">Speed</th><th class="num">Price</th></tr></thead>
    <tbody>
${printers
      .map(
        (p) => `      <tr><td><a href="/printers/${p.id}/">${esc(p.name)}</a></td><td>${p.build.join('×')}</td><td>${p.enclosure ? 'Yes' : 'No'}</td><td>${p.directDrive ? 'Direct' : 'Bowden'}</td><td class="num">${p.maxSpeed}</td><td class="num">$${p.price}</td></tr>`
      )
      .join('\n')}
    </tbody>
  </table></div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }])],
    }),
  });
  printers.forEach((p) => pages.push(printerPage(p)));
  pages.push({
    path: '/printers/compare/',
    html: layout({
      title: '3D printer comparisons — which machine to buy',
      description: 'Head-to-head 3D printer comparisons: Ender 3 vs Bambu A1, P1S vs X1 Carbon, Prusa MK4 vs Bambu and more.',
      path: '/printers/compare/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: 'Compare', path: '/printers/compare/' }])}
<div class="wrap">
  <div class="hero"><h1>Printer comparisons</h1><p class="lead">The match-ups people actually search for before buying.</p></div>
  <div class="grid cols-2">
${PRINTER_COMPARISONS.map(([x, y]) => `    <a class="card link" href="/printers/compare/${x}-vs-${y}/"><h3>${esc(pById[x].name)} vs ${esc(pById[y].name)}</h3></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Printers', path: '/printers/' }, { name: 'Compare', path: '/printers/compare/' }])],
    }),
  });
  PRINTER_COMPARISONS.forEach(([x, y]) => pages.push(comparePage(x, y)));
  return pages;
}

module.exports = { buildPrinters, materialFit, nozzleMax };

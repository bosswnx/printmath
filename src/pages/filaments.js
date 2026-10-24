const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs, diffPill, materialCards } = require('../lib/ui');
const { filaments, byId } = require('../data/filaments');
const { printers } = require('../data/printers');

const KEY_COMPARISONS = [
  ['pla', 'petg'],
  ['pla', 'abs'],
  ['pla', 'pla-plus'],
  ['petg', 'abs'],
  ['abs', 'asa'],
  ['petg', 'tpu'],
  ['pla', 'tpu'],
  ['nylon', 'pc'],
  ['petg', 'petg-cf'],
  ['pla', 'pla-cf'],
  ['nylon', 'pa-cf'],
  ['hips', 'abs'],
  ['asa', 'petg'],
  ['pla', 'asa'],
  ['pc', 'abs'],
  ['pva', 'hips'],
  ['tpu', 'tpu-95a'],
  ['wood-pla', 'pla'],
  ['petg', 'nylon'],
  ['pla-cf', 'petg-cf'],
];

function suitedPrinters(f) {
  return printers.filter((p) => {
    if (f.enclosure && !p.enclosure) return false;
    if (f.nozzle[0] > 260 && !p.hardened) return false;
    if (f.difficulty >= 4 && !p.directDrive) return false;
    return true;
  });
}

function filamentPage(f) {
  const path = `/filaments/${f.id}/`;
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: f.name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(f.name)}</h1>
    <p class="lead">${esc(f.summary)}</p>
    <p>${diffPill(f.difficulty)} ${f.enclosure ? '<span class="pill warn">Enclosure recommended</span>' : '<span class="pill ok">Prints on open printers</span>'} <span class="pill">${f.density} g/cm³</span> <span class="pill">~$${f.pricePerKg}/kg</span></p>
  </div>

  <h2>Print settings (starting points)</h2>
  <div class="table-scroll"><table>
    <tbody>
      <tr><th>Nozzle temperature</th><td>${f.nozzle[0]}–${f.nozzle[1]} °C</td></tr>
      <tr><th>Bed temperature</th><td>${f.bed[0]}–${f.bed[1]} °C</td></tr>
      <tr><th>Enclosure</th><td>${f.enclosure ? 'Recommended' : 'Not required'}</td></tr>
      <tr><th>Drying</th><td>${f.dryTemp} °C for ${f.dryHours} h${f.drySensitive ? ' <span class="pill warn">Moisture sensitive</span>' : ''}</td></tr>
      <tr><th>Density</th><td>${f.density} g/cm³</td></tr>
      <tr><th>Max continuous use</th><td>~${f.heat} °C</td></tr>
    </tbody>
  </table></div>

  <h2>Properties</h2>
  <div class="table-scroll"><table>
    <thead><tr><th>Property</th><th>Rating</th></tr></thead>
    <tbody>
      <tr><td>Strength</td><td>${'●'.repeat(f.strength)}${'○'.repeat(5 - f.strength)}</td></tr>
      <tr><td>Heat resistance</td><td>${'●'.repeat(Math.max(1, Math.round(f.heat / 25)))}${'○'.repeat(5 - Math.max(1, Math.round(f.heat / 25)))}</td></tr>
      <tr><td>UV / weather resistance</td><td>${'●'.repeat(f.uv)}${'○'.repeat(5 - f.uv)}</td></tr>
      <tr><td>Flexibility</td><td>${'●'.repeat(f.flex)}${'○'.repeat(5 - f.flex)}</td></tr>
      <tr><td>Print difficulty</td><td>${'●'.repeat(f.difficulty)}${'○'.repeat(5 - f.difficulty)}</td></tr>
    </tbody>
  </table></div>

  <div class="grid cols-2">
    <div class="card"><h3>Pros</h3><ul>${f.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="card"><h3>Cons</h3><ul>${f.cons.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
  </div>

  <h2>Best uses</h2>
  <p>${f.uses.map((u) => `<span class="pill">${esc(u)}</span>`).join(' ')}</p>

  <h2>Printers suited to ${esc(f.name)}</h2>
  <p class="muted">Machines that meet this material's enclosure, temperature and extruder needs.</p>
  <div class="grid cols-3">
${suitedPrinters(f)
      .slice(0, 9)
      .map((p) => `    <a class="card link" href="/printers/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? 'Enclosed' : 'Open frame'}</p></a>`)
      .join('\n')}
  </div>

  <h2>Cost and usage</h2>
  <p>At ~$${f.pricePerKg}/kg, 100 g of ${esc(f.name)} costs about $${(f.pricePerKg / 10).toFixed(2)}. Use the <a href="/tools/filament-length/">length &amp; weight converter</a> to turn a print's weight into metres, or the <a href="/tools/cost-calculator/">cost calculator</a> for a full price.</p>

  <h2>Compare ${esc(f.name)} with other materials</h2>
  <div class="grid cols-3">
${KEY_COMPARISONS.filter(([a, b]) => a === f.id || b === f.id)
      .map(([a, b]) => {
        const other = byId[a === f.id ? b : a];
        return `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(f.name)} vs ${esc(other.name)}</h3></a>`;
      })
      .join('\n') || '    <p class="muted">See the <a href="/filaments/">full comparison list</a>.</p>'}
  </div>
</div>`;

  return {
    path,
    html: layout({
      title: `${f.name} filament — settings, properties and best uses`,
      description: `${f.name} 3D printing guide: nozzle and bed temperatures, drying, strength, heat and UV resistance, pros, cons and which printers suit it.`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: f.name, path }]),
        faq([
          { q: `What temperature do I print ${f.name} at?`, a: `A typical nozzle range is ${f.nozzle[0]}–${f.nozzle[1]} °C with a bed at ${f.bed[0]}–${f.bed[1]} °C. Start in the middle and tune with a temperature tower.` },
          { q: `Does ${f.name} need an enclosure?`, a: f.enclosure ? 'Yes, an enclosure is strongly recommended to control warping and draughts.' : 'No. It prints fine on an open-frame printer.' },
          { q: `Is ${f.name} food safe or weatherproof?`, a: `Treat ${f.name} as ${f.uv >= 4 ? 'reasonably weather resistant' : 'not weather resistant'}, and do not assume food safety — layer lines harbour bacteria regardless of material.` },
        ]),
      ],
    }),
  };
}

function comparisonPage(aId, bId) {
  const a = byId[aId], b = byId[bId];
  const path = `/filaments/compare/${aId}-vs-${bId}/`;
  const rows = [
    ['Nozzle temperature', `${a.nozzle[0]}–${a.nozzle[1]} °C`, `${b.nozzle[0]}–${b.nozzle[1]} °C`],
    ['Bed temperature', `${a.bed[0]}–${a.bed[1]} °C`, `${b.bed[0]}–${b.bed[1]} °C`],
    ['Enclosure', a.enclosure ? 'Recommended' : 'Not required', b.enclosure ? 'Recommended' : 'Not required'],
    ['Density', `${a.density} g/cm³`, `${b.density} g/cm³`],
    ['Strength', `${a.strength}/5`, `${b.strength}/5`],
    ['Heat resistance', `~${a.heat} °C`, `~${b.heat} °C`],
    ['UV resistance', `${a.uv}/5`, `${b.uv}/5`],
    ['Flexibility', `${a.flex}/5`, `${b.flex}/5`],
    ['Print difficulty', `${a.difficulty}/5`, `${b.difficulty}/5`],
    ['Typical price', `~$${a.pricePerKg}/kg`, `~$${b.pricePerKg}/kg`],
  ];
  const winner = (key, higherBetter = true) => {
    const av = a[key], bv = b[key];
    if (av === bv) return 'tie';
    return (higherBetter ? av > bv : av < bv) ? a.id : b.id;
  };
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: 'Compare', path: '/filaments/compare/' }, { name: `${a.name} vs ${b.name}`, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(a.name)} vs ${esc(b.name)}</h1>
    <p class="lead">${esc(a.name)} and ${esc(b.name)} compared on temperature, strength, heat and UV resistance, difficulty and price — and which one to pick.</p>
  </div>
  <div class="table-scroll"><table>
    <thead><tr><th>Property</th><th>${esc(a.name)}</th><th>${esc(b.name)}</th></tr></thead>
    <tbody>${rows.map(([k, av, bv]) => `<tr><td>${k}</td><td>${av}</td><td>${bv}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Quick verdict</h2>
  <ul>
    <li><strong>Stronger part:</strong> ${byId[winner('strength')] ? (a.strength === b.strength ? 'A tie.' : esc((a.strength > b.strength ? a : b).name)) : ''}</li>
    <li><strong>More heat resistant:</strong> ${a.heat === b.heat ? 'A tie.' : esc((a.heat > b.heat ? a : b).name)}</li>
    <li><strong>Better outdoors:</strong> ${a.uv === b.uv ? 'A tie.' : esc((a.uv > b.uv ? a : b).name)}</li>
    <li><strong>Easier to print:</strong> ${a.difficulty === b.difficulty ? 'A tie.' : esc((a.difficulty < b.difficulty ? a : b).name)}</li>
    <li><strong>Cheaper:</strong> ${a.pricePerKg === b.pricePerKg ? 'A tie.' : esc((a.pricePerKg < b.pricePerKg ? a : b).name)}</li>
  </ul>

  <h2>${esc(a.name)} in short</h2>
  <p>${esc(a.summary)}</p>
  <h2>${esc(b.name)} in short</h2>
  <p>${esc(b.summary)}</p>

  <h2>Which should you choose?</h2>
  <p>Pick <strong>${esc(a.name)}</strong> if ${esc(a.uses[0].toLowerCase())} matters most to you. Pick <strong>${esc(b.name)}</strong> if ${esc(b.uses[0].toLowerCase())} is the priority. If you are unsure, buy a small sample of each and print the same test part twice.</p>

  <div class="grid cols-2">
    <a class="card link" href="/filaments/${a.id}/"><h3>${esc(a.name)} full guide</h3></a>
    <a class="card link" href="/filaments/${b.id}/"><h3>${esc(b.name)} full guide</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${a.name} vs ${b.name} — 3D printing filament comparison`,
      description: `${a.name} vs ${b.name}: compare nozzle and bed temperatures, strength, heat and UV resistance, print difficulty and price to choose the right filament.`,
      path,
      body,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }, { name: `${a.name} vs ${b.name}`, path }])],
    }),
  };
}

function buildFilaments() {
  const pages = [];
  pages.push({
    path: '/filaments/',
    html: layout({
      title: '3D printing filament guide — every common material compared',
      description:
        'Compare 15 FDM filaments: PLA, PETG, ABS, ASA, TPU, nylon, PC and carbon-fibre blends. Temperatures, strength, heat and UV resistance.',
      path: '/filaments/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }])}
<div class="wrap">
  <div class="hero"><h1>Filament guide</h1>
  <p class="lead">Every common FDM material, what it is good at, and what it is not. Start with PLA for looks, PETG for function, ASA for outdoors, and go from there.</p></div>
  ${materialCards(filaments)}
  <h2>Head-to-head comparisons</h2>
  <div class="grid cols-3">
${KEY_COMPARISONS.map(([a, b]) => `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(byId[a].name)} vs ${esc(byId[b].name)}</h3></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Filaments', path: '/filaments/' }])],
    }),
  });

  filaments.forEach((f) => pages.push(filamentPage(f)));
  KEY_COMPARISONS.forEach(([a, b]) => pages.push(comparisonPage(a, b)));
  return pages;
}

module.exports = { buildFilaments };

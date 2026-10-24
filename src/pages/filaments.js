const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs, diffPill, materialCards } = require('../lib/ui');
const { t, tr, trList } = require('../lib/i18n');
const { filaments, byId } = require('../data/filaments');
const { printers } = require('../data/printers');

const fname = (f) => tr('filaments', f.id, 'name', f.name);

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
  const name = fname(f);
  const summary = tr('filaments', f.id, 'summary', f.summary);
  const pros = trList('filaments', f.id, 'pros', f.pros);
  const cons = trList('filaments', f.id, 'cons', f.cons);
  const uses = trList('filaments', f.id, 'uses', f.uses);
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(name)}</h1>
    <p class="lead">${esc(summary)}</p>
    <p>${diffPill(f.difficulty)} ${f.enclosure ? `<span class="pill warn">${esc(t('fl.enclosureNeeded', 'Enclosure recommended'))}</span>` : `<span class="pill ok">${esc(t('fl.openOk', 'Prints on open printers'))}</span>`} <span class="pill">${f.density} g/cm³</span> <span class="pill">~$${f.pricePerKg}/kg</span></p>
  </div>

  <h2>${esc(t('fl.printSettings', 'Print settings (starting points)'))}</h2>
  <div class="table-scroll"><table>
    <tbody>
      <tr><th>${esc(t('fl.nozzleTemp', 'Nozzle temperature'))}</th><td>${f.nozzle[0]}–${f.nozzle[1]} °C</td></tr>
      <tr><th>${esc(t('fl.bedTemp', 'Bed temperature'))}</th><td>${f.bed[0]}–${f.bed[1]} °C</td></tr>
      <tr><th>${esc(t('fl.enclosure', 'Enclosure'))}</th><td>${f.enclosure ? esc(t('fl.recommended', 'Recommended')) : esc(t('fl.notRequired', 'Not required'))}</td></tr>
      <tr><th>${esc(t('fl.drying', 'Drying'))}</th><td>${f.dryTemp} °C × ${f.dryHours} h${f.drySensitive ? ` <span class="pill warn">${esc(t('fl.moistureSensitive', 'Moisture sensitive'))}</span>` : ''}</td></tr>
      <tr><th>${esc(t('fl.density', 'Density'))}</th><td>${f.density} g/cm³</td></tr>
      <tr><th>${esc(t('fl.maxUse', 'Max continuous use'))}</th><td>~${f.heat} °C</td></tr>
    </tbody>
  </table></div>

  <h2>${esc(t('fl.properties', 'Properties'))}</h2>
  <div class="table-scroll"><table>
    <thead><tr><th>${esc(t('fl.vsProperty', 'Property'))}</th><th>${esc(t('fl.vsRating', 'Rating'))}</th></tr></thead>
    <tbody>
      <tr><td>${esc(t('fl.strength', 'Strength'))}</td><td>${'●'.repeat(f.strength)}${'○'.repeat(5 - f.strength)}</td></tr>
      <tr><td>${esc(t('fl.heatRes', 'Heat resistance'))}</td><td>${'●'.repeat(Math.max(1, Math.round(f.heat / 25)))}${'○'.repeat(5 - Math.max(1, Math.round(f.heat / 25)))}</td></tr>
      <tr><td>${esc(t('fl.uvRes', 'UV / weather resistance'))}</td><td>${'●'.repeat(f.uv)}${'○'.repeat(5 - f.uv)}</td></tr>
      <tr><td>${esc(t('fl.flexibility', 'Flexibility'))}</td><td>${'●'.repeat(f.flex)}${'○'.repeat(5 - f.flex)}</td></tr>
      <tr><td>${esc(t('fl.printDifficulty', 'Print difficulty'))}</td><td>${'●'.repeat(f.difficulty)}${'○'.repeat(5 - f.difficulty)}</td></tr>
    </tbody>
  </table></div>

  <div class="grid cols-2">
    <div class="card"><h3>${esc(t('fl.pros', 'Pros'))}</h3><ul>${pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="card"><h3>${esc(t('fl.cons', 'Cons'))}</h3><ul>${cons.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
  </div>

  <h2>${esc(t('fl.bestUses', 'Best uses'))}</h2>
  <p>${uses.map((u) => `<span class="pill">${esc(u)}</span>`).join(' ')}</p>

  <h2>${esc(t('fl.suitedPrinters', 'Printers suited to'))} ${esc(name)}</h2>
  <p class="muted">${esc(t('fl.suitedPrintersNote', "Machines that meet this material's enclosure, temperature and extruder needs."))}</p>
  <div class="grid cols-3">
${suitedPrinters(f)
      .slice(0, 9)
      .map((p) => `    <a class="card link" href="/printers/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? esc(t('fl.enclosed', 'Enclosed')) : esc(t('fl.openFrame', 'Open frame'))}</p></a>`)
      .join('\n')}
  </div>

  <h2>${esc(t('fl.costUsage', 'Cost and usage'))}</h2>
  <p>${t('fl.costUsageBody', 'At ~${price}/kg, 100 g of {name} costs about ${per100}. Use the {lenTool} to turn a printed weight into metres, or the {costTool} for a full price.', {
    price: f.pricePerKg,
    name,
    per100: (f.pricePerKg / 10).toFixed(2),
    lenTool: `<a href="/tools/filament-length/">${esc(t('tool.length.short', 'length & weight converter'))}</a>`,
    costTool: `<a href="/tools/cost-calculator/">${esc(t('tool.cost.short', 'cost calculator'))}</a>`,
  })}</p>

  <h2>${esc(t('fl.compareWith', 'Compare'))} ${esc(name)}</h2>
  <div class="grid cols-3">
${KEY_COMPARISONS.filter(([a, b]) => a === f.id || b === f.id)
      .map(([a, b]) => {
        const other = byId[a === f.id ? b : a];
        return `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(name)} vs ${esc(fname(other))}</h3></a>`;
      })
      .join('\n') || `    <p class="muted">${esc(t('fl.seeAllComparisons', 'See the full comparison list.'))}</p>`}
  </div>
</div>`;

  return {
    path,
    html: layout({
      title: `${name} — ${t('fl.pageTitleSuffix', 'settings, properties and best uses')}`,
      description: `${name}: ${summary}`.slice(0, 300),
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name, path }]),
        faq([
          { q: t('fl.q.temp', 'What temperature do I print {name} at?', { name }), a: t('fl.q.tempA', '', { nozzleMin: f.nozzle[0], nozzleMax: f.nozzle[1], bedMin: f.bed[0], bedMax: f.bed[1] }) },
          { q: t('fl.q.enclosure', 'Does {name} need an enclosure?', { name }), a: f.enclosure ? t('fl.q.enclosureYes', 'Yes, an enclosure is strongly recommended.') : t('fl.q.enclosureNo', 'No, it prints fine on an open-frame printer.') },
        ]),
      ],
    }),
  };
}

function comparisonPage(aId, bId) {
  const a = byId[aId], b = byId[bId];
  const an = fname(a), bn = fname(b);
  const path = `/filaments/compare/${aId}-vs-${bId}/`;
  const rows = [
    [t('fl.nozzleTemp', 'Nozzle temperature'), `${a.nozzle[0]}–${a.nozzle[1]} °C`, `${b.nozzle[0]}–${b.nozzle[1]} °C`],
    [t('fl.bedTemp', 'Bed temperature'), `${a.bed[0]}–${a.bed[1]} °C`, `${b.bed[0]}–${b.bed[1]} °C`],
    [t('fl.enclosure', 'Enclosure'), a.enclosure ? t('fl.recommended', 'Recommended') : t('fl.notRequired', 'Not required'), b.enclosure ? t('fl.recommended', 'Recommended') : t('fl.notRequired', 'Not required')],
    [t('fl.density', 'Density'), `${a.density} g/cm³`, `${b.density} g/cm³`],
    [t('fl.strength', 'Strength'), `${a.strength}/5`, `${b.strength}/5`],
    [t('fl.heatRes', 'Heat resistance'), `~${a.heat} °C`, `~${b.heat} °C`],
    [t('fl.uvRes', 'UV resistance'), `${a.uv}/5`, `${b.uv}/5`],
    [t('fl.flexibility', 'Flexibility'), `${a.flex}/5`, `${b.flex}/5`],
    [t('fl.printDifficulty', 'Print difficulty'), `${a.difficulty}/5`, `${b.difficulty}/5`],
    [t('fl.typicalPrice', 'Typical price'), `~$${a.pricePerKg}/kg`, `~$${b.pricePerKg}/kg`],
  ];
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name: t('fl.compareIndex', 'Compare'), path: '/filaments/compare/' }, { name: `${an} vs ${bn}`, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(t('fl.vsTitle', '{a} vs {b}', { a: an, b: bn }))}</h1>
    <p class="lead">${esc(t('fl.vsLead', '', { a: an, b: bn }))}</p>
  </div>
  <div class="table-scroll"><table>
    <thead><tr><th>${esc(t('fl.vsProperty', 'Property'))}</th><th>${esc(an)}</th><th>${esc(bn)}</th></tr></thead>
    <tbody>${rows.map(([k, av, bv]) => `<tr><td>${esc(k)}</td><td>${esc(av)}</td><td>${esc(bv)}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>${esc(t('fl.vsVerdict', 'Quick verdict'))}</h2>
  <ul>
    <li><strong>${esc(t('fl.vsStronger', 'Stronger part'))}:</strong> ${a.strength === b.strength ? esc(t('fl.vsTie', 'A tie.')) : esc(a.strength > b.strength ? an : bn)}</li>
    <li><strong>${esc(t('fl.vsHeat', 'More heat resistant'))}:</strong> ${a.heat === b.heat ? esc(t('fl.vsTie', 'A tie.')) : esc(a.heat > b.heat ? an : bn)}</li>
    <li><strong>${esc(t('fl.vsOutdoor', 'Better outdoors'))}:</strong> ${a.uv === b.uv ? esc(t('fl.vsTie', 'A tie.')) : esc(a.uv > b.uv ? an : bn)}</li>
    <li><strong>${esc(t('fl.vsEasier', 'Easier to print'))}:</strong> ${a.difficulty === b.difficulty ? esc(t('fl.vsTie', 'A tie.')) : esc(a.difficulty < b.difficulty ? an : bn)}</li>
    <li><strong>${esc(t('fl.vsCheaper', 'Cheaper'))}:</strong> ${a.pricePerKg === b.pricePerKg ? esc(t('fl.vsTie', 'A tie.')) : esc(a.pricePerKg < b.pricePerKg ? an : bn)}</li>
  </ul>

  <h2>${esc(t('fl.vsInShort', '{name} in short', { name: an }))}</h2>
  <p>${esc(tr('filaments', a.id, 'summary', a.summary))}</p>
  <h2>${esc(t('fl.vsInShort', '{name} in short', { name: bn }))}</h2>
  <p>${esc(tr('filaments', b.id, 'summary', b.summary))}</p>

  <h2>${esc(t('fl.vsWhich', 'Which should you choose?'))}</h2>
  <p>${esc(t('fl.vsWhichBody', '', { a: an, b: bn, ause: trList('filaments', a.id, 'uses', a.uses)[0].toLowerCase(), buse: trList('filaments', b.id, 'uses', b.uses)[0].toLowerCase() }))}</p>

  <div class="grid cols-2">
    <a class="card link" href="/filaments/${a.id}/"><h3>${esc(an)} ${esc(t('fl.fullGuide', 'full guide'))}</h3></a>
    <a class="card link" href="/filaments/${b.id}/"><h3>${esc(bn)} ${esc(t('fl.fullGuide', 'full guide'))}</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${an} vs ${bn} — ${t('fl.vsPageSuffix', 'filament comparison')}`,
      description: `${an} vs ${bn}: ${t('fl.vsDescTail', 'compare temperature, strength, heat and UV resistance, difficulty and price.')}`,
      path,
      body,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name: `${an} vs ${bn}`, path }])],
    }),
  };
}

function buildFilaments() {
  const pages = [];
  pages.push({
    path: '/filaments/',
    html: layout({
      title: t('fl.title', '3D printing filament guide — every common material compared'),
      description: t('fl.desc', 'Compare 16 FDM filaments: PLA, PETG, ABS, ASA, TPU, nylon, PC and carbon-fibre blends.'),
      path: '/filaments/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('fl.h1', 'Filament guide'))}</h1>
  <p class="lead">${esc(t('fl.lead', 'Every common FDM material, what it is good at, and what it is not.'))}</p></div>
  ${materialCards(filaments)}
  <h2>${esc(t('fl.compareTitle', 'Head-to-head comparisons'))}</h2>
  <div class="grid cols-3">
${KEY_COMPARISONS.map(([a, b]) => `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(fname(byId[a]))} vs ${esc(fname(byId[b]))}</h3></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }])],
    }),
  });

  filaments.forEach((f) => pages.push(filamentPage(f)));
  KEY_COMPARISONS.forEach(([a, b]) => pages.push(comparisonPage(a, b)));
  return pages;
}

module.exports = { buildFilaments, KEY_COMPARISONS };

const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr } = require('../lib/i18n');
const { filaments } = require('../data/filaments');

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'AUD', 'CAD', 'INR'];

const fname = (f) => tr('filaments', f.id, 'name', f.name);

// One row per tool: the index cards and the "related tools" cards both read the
// name/blurb/kicker/related fields from the `tools` data group so a translated
// build gets Chinese labels without duplicating the list.
const TOOLS = [
  {
    id: 'cost-calculator',
    path: '/tools/cost-calculator/',
    kicker: 'Cost',
    name: 'Print cost calculator',
    blurb: 'Material, electricity, machine wear and labour, plus a suggested selling price and margin.',
    related: 'Work out the real cost of a print and a selling price.',
  },
  {
    id: 'gcode-analyzer',
    path: '/tools/gcode-analyzer/',
    kicker: 'Analysis',
    name: 'G-code analyzer',
    blurb: 'Drop a .gcode file to get filament length, weight, cost, layer count and print time — in your browser.',
    related: 'Drop in a .gcode file to get filament use, weight and cost.',
  },
  {
    id: 'filament-length',
    path: '/tools/filament-length/',
    kicker: 'Convert',
    name: 'Filament length & weight',
    blurb: 'Convert between grams, metres and cubic centimetres for any material and diameter.',
    related: 'Convert between metres, grams and cubic centimetres.',
  },
  {
    id: 'spool-remaining',
    path: '/tools/spool-remaining/',
    kicker: 'Convert',
    name: 'Spool remaining',
    blurb: 'Weigh a part-used spool to see how many grams and metres are left.',
    related: 'Weigh a part-used spool to see how much is left.',
  },
  {
    id: 'flow-calculator',
    path: '/tools/flow-calculator/',
    kicker: 'Tuning',
    name: 'Volumetric flow calculator',
    blurb: 'Check whether your speed and layer height exceed what your hotend can melt.',
    related: 'Check whether your speed is more than the hotend can melt.',
  },
  {
    id: 'farm-calculator',
    path: '/tools/farm-calculator/',
    kicker: 'Business',
    name: 'Print farm calculator',
    blurb: 'Estimate throughput, revenue and profit across one or many printers.',
    related: 'Model throughput and profit for one or many printers.',
  },
];

function currencyField() {
  return `<div class="field"><label for="cur">${t('common.currency', 'Currency')}</label>
<select id="cur" data-cur>${CURRENCIES.map((c) => `<option value="${c}">${c}</option>`).join('')}</select></div>`;
}
function materialField(selected) {
  return `<div class="field"><label for="mat">${t('common.material', 'Material')}</label>
<select id="mat" data-mat>${filaments
    .map((f) => `<option value="${f.id}"${f.id === selected ? ' selected' : ''}>${esc(fname(f))} — ${f.density} g/cm³</option>`)
    .join('')}<option value="custom">${t('common.customDensity', 'Custom density…')}</option></select></div>`;
}
function densityField(value) {
  return `<div class="field"><label for="dens">${t('common.density', 'Density')} <span class="hint">g/cm³</span></label>
<input id="dens" type="number" step="0.01" value="${value || 1.24}" data-density></div>`;
}
function diameterField() {
  return `<div class="field"><label for="dia">${t('common.diameter', 'Filament diameter')} <span class="hint">mm</span></label>
<select id="dia" data-diameter><option value="1.75">1.75 mm</option><option value="2.85">2.85 mm</option><option value="3">3.00 mm</option></select></div>`;
}
function priceField(v) {
  return `<div class="field"><label for="pkg">${t('common.priceKg', 'Filament price')} <span class="hint">${t('unit.perKg', 'per kg')}</span></label>
<input id="pkg" type="number" step="0.01" value="${v == null ? 20 : v}" data-price-kg></div>`;
}
function field(label, id, attrs, value, hint) {
  return `<div class="field"><label for="${id}">${label}${hint ? ` <span class="hint">${hint}</span>` : ''}</label>
<input id="${id}" ${attrs} value="${value}" ></div>`;
}

function relatedToolLinks(exclude) {
  return `<h2>${t('common.related', 'Related tools')}</h2>
<div class="grid cols-2">
${TOOLS
    .filter((x) => x.path !== exclude)
    .map(
      (x) =>
        `  <a class="card link" href="${x.path}"><h3>${esc(tr('tools', x.id, 'name', x.name))}</h3><p class="muted">${esc(tr('tools', x.id, 'related', x.related))}</p></a>`
    )
    .join('\n')}
</div>`;
}

function toolPage({ slug, title, h1, description, intro, toolHtml, explain, faqs, howTo }) {
  const path = `/tools/${slug}/`;
  const jsonLd = [
    breadcrumbs([
      { name: t('common.home', 'Home'), path: '/' },
      { name: t('nav.tools', 'Tools'), path: '/tools/' },
      { name: h1, path },
    ]),
  ];
  if (faqs && faqs.length) jsonLd.push(faq(faqs));
  if (howTo) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howTo.name,
      description: howTo.description,
      step: howTo.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    });
  }
  const body = `${crumbs([
    { name: t('common.home', 'Home'), path: '/' },
    { name: t('nav.tools', 'Tools'), path: '/tools/' },
    { name: h1, path },
  ])}
<div class="wrap">
  <div class="hero" style="padding-bottom:8px">
    <h1>${esc(h1)}</h1>
    <p class="lead">${intro}</p>
  </div>
  ${toolHtml}
  ${explain || ''}
  ${relatedToolLinks(path)}
  ${
    faqs && faqs.length
      ? `<h2>${t('common.faq', 'FAQ')}</h2>
<div class="grid cols-2">${faqs.map((f) => `<div class="card"><h3>${esc(f.q)}</h3><p class="muted">${esc(f.a)}</p></div>`).join('')}</div>`
      : ''
  }
</div>`;
  return { path, html: layout({ title, description, path, body, jsonLd }) };
}

function buildTools() {
  const pages = [];

  pages.push({
    path: '/tools/',
    html: layout({
      title: t('tools.title', '3D printing calculators & tools'),
      description: t(
        'tools.desc',
        'Free 3D printing calculators: print cost, G-code analysis, filament length, spool remaining, volumetric flow and print-farm profit.'
      ),
      path: '/tools/',
      body: `${crumbs([
        { name: t('common.home', 'Home'), path: '/' },
        { name: t('nav.tools', 'Tools'), path: '/tools/' },
      ])}
<div class="wrap">
  <div class="hero"><h1>${t('tools.h1', '3D printing calculators')}</h1>
  <p class="lead">${t(
    'tools.lead',
    "Six free tools for the maths that slicers don't do for you: what a print really costs, how much filament is left, and whether your hotend can keep up."
  )}</p></div>
  <div class="grid cols-2">
${TOOLS.map(
  (x) => `    <a class="card link" href="${x.path}"><div class="kicker">${esc(tr('tools', x.id, 'kicker', x.kicker))}</div><h3>${esc(tr('tools', x.id, 'name', x.name))}</h3><p class="muted">${esc(tr('tools', x.id, 'blurb', x.blurb))}</p></a>`
).join('\n')}
  </div>
  <h2>${t('tools.reference', 'Reference')}</h2>
  <div class="grid cols-3">
    <a class="card link" href="/filaments/"><h3>${esc(t('tools.ref.filaments', 'Filament guide'))}</h3><p class="muted">${esc(
      t('tools.ref.filamentsD', 'Temperatures, properties and trade-offs for 15 materials.')
    )}</p></a>
    <a class="card link" href="/printers/"><h3>${esc(t('tools.ref.printers', 'Printer database'))}</h3><p class="muted">${esc(
      t('tools.ref.printersD', 'Build volumes, enclosures and material suitability.')
    )}</p></a>
    <a class="card link" href="/troubleshooting/"><h3>${esc(t('tools.ref.trouble', 'Troubleshooting'))}</h3><p class="muted">${esc(
      t('tools.ref.troubleD', '19 print defects, their causes and fixes.')
    )}</p></a>
  </div>
</div>`,
      jsonLd: [
        breadcrumbs([
          { name: t('common.home', 'Home'), path: '/' },
          { name: t('nav.tools', 'Tools'), path: '/tools/' },
        ]),
      ],
    }),
  });

  // Cost calculator
  pages.push(
    toolPage({
      slug: 'cost-calculator',
      title: t('tools.cost.title', '3D print cost calculator (with selling price)'),
      h1: t('tools.cost.h1', '3D print cost calculator'),
      description: t(
        'tools.cost.desc',
        'Work out what a 3D print costs in material, electricity, machine wear and labour — and what to charge for it. Free, instant, no sign-up.'
      ),
      intro: t(
        'tools.cost.intro',
        'Most people only count filament. This calculator adds electricity, machine wear, labour and your failure rate, then suggests a selling price for a target margin.'
      ),
      toolHtml: `<div class="tool" data-tool="cost-calculator">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${priceField(20)}
    ${field(t('tools.f.partWeight', 'Part weight'), 'weight', 'type="number" step="0.1" data-weight', 30, t('unit.grams', 'grams'))}
    ${field(t('common.hours', 'Print time'), 'hours', 'type="number" step="0.1" data-hours', 4, t('unit.hours', 'hours'))}
    ${field(t('tools.f.qty', 'Quantity'), 'qty', 'type="number" step="1" min="1" data-qty', 1)}
    ${field(t('tools.f.power', 'Printer power'), 'watts', 'type="number" step="5" data-watts', 120, t('unit.watts', 'watts'))}
    ${field(t('tools.f.kwh', 'Electricity price'), 'kwh', 'type="number" step="0.01" data-kwh', 0.15, t('unit.perKwh', 'per kWh'))}
    ${field(t('tools.f.machine', 'Printer price'), 'machine', 'type="number" step="1" data-machine', 400, t('tools.hint.forWear', 'for wear'))}
    ${field(t('tools.f.life', 'Machine life'), 'life', 'type="number" step="100" data-life', 5000, t('unit.hours', 'hours'))}
    ${field(t('tools.f.labor', 'Hands-on time'), 'labor-min', 'type="number" step="1" data-labor-min', 5, t('unit.minutes', 'minutes'))}
    ${field(t('tools.f.rate', 'Your hourly rate'), 'labor-rate', 'type="number" step="1" data-labor-rate', 15, t('unit.perHour', 'per hour'))}
    ${field(t('tools.f.fail', 'Failure / waste rate'), 'fail', 'type="number" step="1" min="0" max="95" data-fail', 5, '%')}
    ${field(t('tools.f.margin', 'Target margin'), 'margin', 'type="number" step="1" min="0" max="95" data-margin', 40, '%')}
  </div>
  <div class="results">
    <div class="result-row"><span class="k">${t('common.material', 'Material')}</span><span class="v" data-out-material>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.electricity', 'Electricity')}</span><span class="v" data-out-energy>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.wear', 'Machine wear')}</span><span class="v" data-out-wear>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.labour', 'Labour')}</span><span class="v" data-out-labor>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.waste', 'Failure buffer')}</span><span class="v" data-out-waste>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.r.cost', 'True cost per part')}</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.r.price', 'Suggested price')}</span><span class="v" data-out-price>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.profit', 'Profit per part')}</span><span class="v" data-out-profit>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.batch', 'Batch cost')}</span><span class="v" data-out-batch>—</span></div>
    <div class="result-row"><span class="k">${t('tools.r.batchPrice', 'Batch revenue at suggested price')}</span><span class="v" data-out-batch-price>—</span></div>
  </div>
  <p class="note">${t(
    'tools.cost.note',
    "Electricity uses an average draw (a heated bed plus hotend usually averages 80–150 W). Machine wear spreads the printer's price over its expected life in print hours. Update the inputs to match your machine and energy price."
  )}</p>
</div>`,
      howTo: {
        name: t('tools.cost.howToName', 'How to calculate the cost of a 3D print'),
        description: t('tools.cost.howToDesc', 'Estimate material, energy, wear and labour, then derive a selling price.'),
        steps: [
          t('tools.cost.step1', 'Weigh the finished part, or read the weight from your slicer preview.'),
          t('tools.cost.step2', 'Enter print time and your local electricity price.'),
          t('tools.cost.step3', 'Enter your printer price and expected life in hours to include wear.'),
          t('tools.cost.step4', 'Add hands-on time and your hourly rate, then a failure rate.'),
          t('tools.cost.step5', 'Pick a target margin to get a suggested selling price.'),
        ],
      },
      explain: `<h2>${t('tools.cost.exH2', 'How the cost is built up')}</h2>
<p>${t('tools.cost.exLead', 'The calculator sums four real costs and then adds a buffer for failed prints:')}</p>
<ul>
<li><strong>${t('tools.cost.exMaterialT', 'Material')}</strong> — ${t(
        'tools.cost.exMaterial',
        'weight ÷ 1000 × price per kg. This ignores purge and support waste; if you purge a lot, add 10–20%.'
      )}</li>
<li><strong>${t('tools.cost.exEnergyT', 'Electricity')}</strong> — ${t(
        'tools.cost.exEnergy',
        'watts ÷ 1000 × hours × price per kWh. A typical enclosed printer averages 100–150 W; a large heated bed pushes it higher.'
      )}</li>
<li><strong>${t('tools.cost.exWearT', 'Machine wear')}</strong> — ${t(
        'tools.cost.exWear',
        'printer price ÷ life hours × print hours. This is the cost people forget; it is what pays for the next printer.'
      )}</li>
<li><strong>${t('tools.cost.exLabourT', 'Labour')}</strong> — ${t(
        'tools.cost.exLabour',
        'hands-on minutes × your rate. Slicing, setup, removal and finishing all count.'
      )}</li>
</ul>
<p>${t(
        'tools.cost.exFail',
        'The failure buffer divides the subtotal by (1 − failure rate). A 10% failure rate adds about 11% to cost. The suggested price then divides by (1 − margin), which is not the same as adding a markup: a 40% margin means 40% of the price is profit.'
      )}</p>`,
      faqs: [
        {
          q: t('tools.cost.q1', 'Should I price by weight or by print time?'),
          a: t(
            'tools.cost.a1',
            'By time is more honest for anything slow, because machine time is the scarce resource. A common compromise is to charge material cost plus a fixed rate per hour of printer time.'
          ),
        },
        {
          q: t('tools.cost.q2', 'What failure rate should I use?'),
          a: t(
            'tools.cost.a2',
            'For a tuned printer and a proven model, 2–5%. For a new material or a tall print, 10–20% is realistic. Track your own scrap rate and use it.'
          ),
        },
        {
          q: t('tools.cost.q3', 'Is electricity really worth counting?'),
          a: t(
            'tools.cost.a3',
            'For a long ABS print on an enclosed machine, electricity can approach the cost of the filament. It is worth counting if you print a lot.'
          ),
        },
      ],
    })
  );

  // G-code analyzer
  pages.push(
    toolPage({
      slug: 'gcode-analyzer',
      title: t('tools.gcode.title', 'G-code analyzer — filament, weight, cost & print time'),
      h1: t('tools.gcode.h1', 'G-code analyzer'),
      description: t(
        'tools.gcode.desc',
        'Drop a .gcode file to see filament length, weight, cost, layer count and print time. Runs entirely in your browser — nothing is uploaded.'
      ),
      intro: t(
        'tools.gcode.intro',
        'Upload a sliced file and this tool reads the slicer comments and extrusion moves to report exactly how much filament the print needs and what it costs.'
      ),
      toolHtml: `<div class="tool" data-tool="gcode-analyzer">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${priceField(20)}
  </div>
  <div class="field" style="margin-top:16px">
    <label for="gcode">${t('tools.g.fileLabel', 'G-code file')}</label>
    <input id="gcode" type="file" accept=".gcode,.gco,.g,.txt" data-file>
    <div class="note" data-drop style="border-style:dashed;border-color:var(--line);padding:18px;text-align:center">${t(
      'tools.g.drop',
      '…or drop a .gcode file here. Files never leave your device.'
    )}</div>
  </div>
  <div class="results" data-results hidden>
    <div class="result-row"><span class="k">${t('tools.g.file', 'File')}</span><span class="v" data-out-file>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.g.length', 'Filament length')}</span><span class="v" data-out-length>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.g.grams', 'Filament weight')}</span><span class="v" data-out-grams>—</span></div>
    <div class="result-row"><span class="k">${t('tools.g.cost', 'Material cost')}</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row"><span class="k">${t('tools.g.layers', 'Layers')}</span><span class="v" data-out-layers>—</span></div>
    <div class="result-row"><span class="k">${t('tools.g.time', 'Print time (from slicer)')}</span><span class="v" data-out-time>—</span></div>
    <div class="result-row"><span class="k">${t('tools.g.spools', 'Spool use')}</span><span class="v" data-out-spools>—</span></div>
  </div>
</div>`,
      explain: `<h2>${t('tools.gcode.exH2', 'How it reads your file')}</h2>
<p>${t('tools.gcode.exP1a', 'The tool first looks for slicer comments —')} <code>;Filament used: 12.3m</code>, <code>;TIME:14400</code>, <code>;LAYER:</code> ${t(
        'tools.gcode.exP1b',
        '— which PrusaSlicer, OrcaSlicer, SuperSlicer, Cura and Bambu Studio all write. If those are missing it falls back to summing the extrusion axis (E) in the G-code, handling both absolute (M82) and relative (M83) modes.'
      )}</p>
<p>${t(
        'tools.gcode.exP2',
        'Weight is derived from the extrusion length, filament diameter and material density, so set those to match your spool. Everything happens locally in your browser: no file is uploaded anywhere.'
      )}</p>
<p>${t('tools.gcode.exP3a', 'For pricing the print properly, take the weight into the ')}<a href="/tools/cost-calculator/">${t(
        'tools.gcode.exP3link',
        'cost calculator'
      )}</a>${t('tools.gcode.exP3b', '.')}</p>`,
      faqs: [
        {
          q: t('tools.gcode.q1', 'Why does the weight differ from my slicer?'),
          a: t(
            'tools.gcode.a1',
            'Check the density and diameter inputs — they must match the material and spool you are using. Most slicers assume 1.24 g/cm³ for PLA.'
          ),
        },
        {
          q: t('tools.gcode.q2', 'Is my file uploaded?'),
          a: t('tools.gcode.a2', 'No. The analysis runs in your browser with the FileReader API. Nothing is sent to a server.'),
        },
        {
          q: t('tools.gcode.q3', 'Which slicers are supported?'),
          a: t(
            'tools.gcode.a3',
            'Any G-code file. Slicer comments give the most accurate result; extrusion summing works on all of them.'
          ),
        },
      ],
    })
  );

  // Filament length
  pages.push(
    toolPage({
      slug: 'filament-length',
      title: t('tools.len.title', 'Filament length to weight converter (grams, metres, cm³)'),
      h1: t('tools.len.h1', 'Filament length & weight converter'),
      description: t(
        'tools.len.desc',
        'Convert filament between grams, metres and cubic centimetres for any material, density and diameter. Includes cost per metre.'
      ),
      intro: t(
        'tools.len.intro',
        'How long is 500 g of PETG? How many grams in 100 m of 1.75 mm PLA? This converter answers both directions using real material densities.'
      ),
      toolHtml: `<div class="tool" data-tool="filament-length">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${field(t('common.weight', 'Weight'), 'grams', 'type="number" step="1" data-grams', 500, t('unit.grams', 'grams'))}
    ${priceField(20)}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">${t('tools.len.length', 'Length')}</span><span class="v" data-out-m>—</span></div>
    <div class="result-row"><span class="k">${t('tools.len.mm', 'Length in mm')}</span><span class="v" data-out-mm>—</span></div>
    <div class="result-row"><span class="k">${t('tools.len.vol', 'Volume')}</span><span class="v" data-out-vol>—</span></div>
    <div class="result-row"><span class="k">${t('tools.len.cost', 'Cost of this amount')}</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row"><span class="k">${t('tools.len.perM', 'Cost per metre')}</span><span class="v" data-out-per-m>—</span></div>
  </div>
</div>`,
      explain: `<h2>${t('tools.len.exH2', 'The formula')}</h2>
<p>${t(
        'tools.len.exP1',
        'Filament is a cylinder, so volume = π × r² × length. With the radius in centimetres, multiplying by density (g/cm³) gives grams:'
      )}</p>
<p><code>weight = (length_mm ÷ 10) × π × (diameter_mm ÷ 20)² × density</code></p>
<p>${t(
        'tools.len.exP3',
        'As a sanity check: 1 kg of 1.75 mm PLA at 1.24 g/cm³ is about 335 m, and 1 kg of PETG is about 327 m. If your result is far from that, check the density and diameter.'
      )}</p>`,
      faqs: [
        {
          q: t('tools.len.q1', 'How many metres is 1 kg of PLA?'),
          a: t(
            'tools.len.a1',
            'About 335 m for 1.75 mm PLA at 1.24 g/cm³. PETG is about 327 m, ABS about 400 m because it is less dense.'
          ),
        },
        {
          q: t('tools.len.q2', 'Does 2.85 mm filament hold more grams per metre?'),
          a: t(
            'tools.len.a2',
            'Yes. 2.85 mm filament is about 2.65× the cross-section of 1.75 mm, so the same weight is much shorter — around 126 m per kg of PLA.'
          ),
        },
      ],
    })
  );

  // Spool remaining
  pages.push(
    toolPage({
      slug: 'spool-remaining',
      title: t('tools.spool.title', 'How much filament is left on my spool? (weight calculator)'),
      h1: t('tools.spool.h1', 'Spool remaining calculator'),
      description: t(
        'tools.spool.desc',
        'Weigh a part-used spool and subtract the empty spool weight to find how many grams and metres of filament remain.'
      ),
      intro: t(
        'tools.spool.intro',
        'The only accurate way to know what is left on a spool is to weigh it. Enter the total weight, the empty spool weight and the material to get the remaining filament in grams, metres and percent.'
      ),
      toolHtml: `<div class="tool" data-tool="spool-remaining">
  <div class="tool-grid">
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${field(t('tools.spool.full', 'Full spool net weight'), 'full', 'type="number" step="1" data-full', 1000, t('unit.grams', 'grams'))}
    ${field(t('tools.spool.empty', 'Empty spool weight'), 'empty', 'type="number" step="1" data-empty', 200, t('unit.grams', 'grams'))}
    ${field(t('tools.spool.now', 'Current total weight'), 'now', 'type="number" step="1" data-now', 700, t('unit.grams', 'grams'))}
    ${field(t('tools.spool.perPart', 'Filament per part'), 'per-part', 'type="number" step="1" data-per-part', 20, t('unit.grams', 'grams'))}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">${t('tools.spool.remain', 'Filament remaining')}</span><span class="v" data-out-remain>—</span></div>
    <div class="result-row"><span class="k">${t('tools.spool.m', 'Remaining length')}</span><span class="v" data-out-m>—</span></div>
    <div class="result-row"><span class="k">${t('tools.spool.pct', 'Percent of full spool')}</span><span class="v" data-out-pct>—</span></div>
    <div class="result-row"><span class="k">${t('tools.spool.prints', 'Prints of your part')}</span><span class="v" data-out-prints>—</span></div>
    <div class="bar" data-bar><span style="width:0%"></span></div>
  </div>
  <p class="note">${t(
    'tools.spool.note',
    'Empty spool weight varies: most 1 kg plastic spools are 150–250 g, cardboard spools 100–180 g. Weigh an empty one once and keep the number.'
  )}</p>
</div>`,
      explain: `<h2>${t('tools.spool.exH2', 'Why weighing beats guessing')}</h2>
<p>${t(
        'tools.spool.exP1a',
        'Slicers cannot know what is physically left on your spool. A kitchen scale can. Weigh the whole spool, subtract the empty spool weight, and what remains is filament. The tool then converts grams to metres with the same density maths as the '
      )}<a href="/tools/filament-length/">${t('tools.spool.exP1link', 'length converter')}</a>${t('tools.spool.exP1b', '.')}</p>
<p>${t('tools.spool.exP2', 'Keep the empty-spool number for each brand you buy — it makes the reading exact in one step.')}</p>`,
      faqs: [
        {
          q: t('tools.spool.q1', 'How much does an empty filament spool weigh?'),
          a: t(
            'tools.spool.a1',
            'Typically 150–250 g for plastic 1 kg spools, and 100–180 g for cardboard. Weigh one when it runs out and note the figure.'
          ),
        },
        {
          q: t('tools.spool.q2', 'Can I trust the percent reading?'),
          a: t(
            'tools.spool.a2',
            'It is accurate as long as the "full spool net weight" matches the spool you bought (some are 750 g or 1 kg) and you use the right empty-spool weight.'
          ),
        },
      ],
    })
  );

  // Flow calculator
  pages.push(
    toolPage({
      slug: 'flow-calculator',
      title: t('tools.flow.title', 'Volumetric flow calculator — can your hotend keep up?'),
      h1: t('tools.flow.h1', 'Volumetric flow calculator'),
      description: t(
        'tools.flow.desc',
        'Calculate the volumetric flow your slicer asks for from speed, layer height and line width, and compare it with your hotend’s melting limit.'
      ),
      intro: t(
        'tools.flow.intro',
        'Under-extrusion at high speed is usually a hotend limit, not a slicer bug. This calculator turns your speed settings into a volumetric flow rate so you can see whether the hotend can melt that much plastic.'
      ),
      toolHtml: `<div class="tool" data-tool="flow-calculator">
  <div class="tool-grid">
    ${field(t('tools.flow.speed', 'Print speed'), 'speed', 'type="number" step="5" data-speed', 150, t('unit.mms', 'mm/s'))}
    ${field(t('tools.flow.layerHeight', 'Layer height'), 'layer-height', 'type="number" step="0.01" data-layer-height', 0.2, t('unit.mm', 'mm'))}
    ${field(t('tools.flow.lineWidth', 'Line width'), 'line-width', 'type="number" step="0.01" data-line-width', 0.45, t('unit.mm', 'mm'))}
    <div class="field"><label for="hotend">${t('tools.flow.hotend', 'Hotend')}</label>
    <select id="hotend" data-hotend>
      <option value="stock">${t('tools.flow.hotendStock', 'Stock MK8 / V6')}</option>
      <option value="volcano">${t('tools.flow.hotendVolcano', 'Volcano / long melt zone')}</option>
      <option value="highflow" selected>${t('tools.flow.hotendHighFlow', 'High-flow (Rapido, Dragon HF)')}</option>
      <option value="custom">${t('tools.flow.hotendCustom', 'Custom…')}</option>
    </select></div>
    ${field(t('tools.flow.hotendMax', 'Custom hotend max'), 'hotend-max', 'type="number" step="1" data-hotend-max', 15, 'mm³/s')}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">${t('tools.flow.outFlow', 'Volumetric flow')}</span><span class="v" data-out-flow>—</span></div>
    <div class="result-row"><span class="k">${t('tools.flow.outLimit', 'Hotend limit')}</span><span class="v" data-out-max>—</span></div>
    <div class="result-row"><span class="k">${t('tools.flow.outMaxSpeed', 'Max speed at these settings')}</span><span class="v" data-out-maxspeed>—</span></div>
    <div class="result-row"><span class="k">${t('tools.flow.outVerdict', 'Verdict')}</span><span class="v"><span class="pill" data-out-verdict>—</span></span></div>
  </div>
  <p class="note">${t(
    'tools.flow.note',
    'Limits are rough averages for PLA at typical temperatures. Higher temperatures and larger nozzles raise the limit; PETG and filled materials lower it.'
  )}</p>
</div>`,
      explain: `<h2>${t('tools.flow.exH2', 'The maths')}</h2>
<p>${t(
        'tools.flow.exP1',
        'Volumetric flow (mm³/s) = speed (mm/s) × layer height (mm) × line width (mm). A 0.4 mm nozzle at 0.2 mm layers and 0.45 mm width printing at 150 mm/s needs 13.5 mm³/s. A stock MK8 hotend tops out around 10–12 mm³/s with PLA, so that speed will under-extrude.'
      )}</p>
<p>${t(
        'tools.flow.exP2',
        'Typical ceilings with PLA: stock MK8/V6 ≈ 10–12 mm³/s, Volcano ≈ 20, high-flow ≈ 25+. If you need more, raise the nozzle temperature, fit a larger nozzle, or use a high-flow hotend.'
      )}</p>`,
      faqs: [
        {
          q: t('tools.flow.q1', 'What is a good volumetric flow limit?'),
          a: t(
            'tools.flow.a1',
            'For a 0.4 mm nozzle with PLA: about 10–12 mm³/s on a stock hotend, 20 with a Volcano, and 25 or more with a modern high-flow hotend.'
          ),
        },
        {
          q: t('tools.flow.q2', 'Why does my print under-extrude only on infill?'),
          a: t(
            'tools.flow.a2',
            'Many slicers print infill faster than walls, so infill crosses the flow limit first. Cap infill volumetric speed to the hotend limit.'
          ),
        },
      ],
    })
  );

  // Farm calculator
  pages.push(
    toolPage({
      slug: 'farm-calculator',
      title: t('tools.farm.title', '3D print farm calculator — throughput, revenue and profit'),
      h1: t('tools.farm.h1', 'Print farm calculator'),
      description: t(
        'tools.farm.desc',
        'Model daily and monthly output, revenue, cost and profit for one or many 3D printers, including a failure rate.'
      ),
      intro: t(
        'tools.farm.intro',
        'If you sell prints, the numbers that matter are throughput and margin. Set your printers, hours, part time and price to see monthly output and profit.'
      ),
      toolHtml: `<div class="tool" data-tool="farm-calculator">
  <div class="tool-grid">
    ${currencyField()}
    ${field(t('tools.farm.printers', 'Printers'), 'printers', 'type="number" step="1" min="1" data-printers', 1)}
    ${field(t('tools.farm.hoursDay', 'Print hours per day'), 'hours-day', 'type="number" step="0.5" max="24" data-hours-day', 20, t('unit.perPrinter', 'per printer'))}
    ${field(t('tools.farm.partHours', 'Time per part'), 'part-hours', 'type="number" step="0.1" data-part-hours', 4, t('unit.hours', 'hours'))}
    ${field(t('tools.farm.partCost', 'Cost per part'), 'part-cost', 'type="number" step="0.1" data-part-cost', 2, t('tools.hint.yourCost', 'your cost'))}
    ${field(t('tools.farm.partPrice', 'Selling price per part'), 'part-price', 'type="number" step="0.1" data-part-price', 12)}
    ${field(t('tools.farm.fail', 'Failure rate'), 'fail', 'type="number" step="1" data-fail', 5, '%')}
    ${field(t('tools.farm.days', 'Days per month'), 'days', 'type="number" step="1" data-days', 30)}
  </div>
  <div class="results">
    <div class="result-row"><span class="k">${t('tools.farm.perPrinter', 'Output per printer')}</span><span class="v" data-out-perprinter>—</span></div>
    <div class="result-row"><span class="k">${t('tools.farm.perDay', 'Output per day')}</span><span class="v" data-out-perday>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.farm.perMonth', 'Parts per month')}</span><span class="v" data-out-permonth>—</span></div>
    <div class="result-row"><span class="k">${t('tools.farm.revenue', 'Monthly revenue')}</span><span class="v" data-out-revenue>—</span></div>
    <div class="result-row"><span class="k">${t('tools.farm.cost', 'Monthly cost')}</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row big"><span class="k">${t('tools.farm.profit', 'Monthly profit')}</span><span class="v" data-out-profit>—</span></div>
    <div class="result-row"><span class="k">${t('tools.farm.margin', 'Margin')}</span><span class="v" data-out-margin>—</span></div>
  </div>
  <p class="note">${t(
    'tools.farm.note',
    'This ignores idle time, maintenance and shipping. It assumes parts are printed back to back, which is only true if you always have work queued.'
  )}</p>
</div>`,
      explain: `<h2>${t('tools.farm.exH2', 'Reading the numbers')}</h2>
<p>${t(
        'tools.farm.exP1',
        'The model is deliberately simple: each printer runs for the hours you give it, each part takes a fixed time, and a failure rate removes some output. Output per printer per day = (hours ÷ part time) × (1 − failure rate).'
      )}</p>
<p>${t(
        'tools.farm.exP2',
        'In practice, idle time is the biggest gap between the model and reality: overnight jobs, plate changes and waiting for orders all cut into it. Treat the result as a ceiling, then discount it.'
      )}</p>`,
      faqs: [
        {
          q: t('tools.farm.q1', 'Is a print farm profitable?'),
          a: t(
            'tools.farm.a1',
            'It can be, but only with consistent demand. Printing is the easy part; selling enough to keep the machines busy is what decides the profit.'
          ),
        },
        {
          q: t('tools.farm.q2', 'Should I count printer depreciation here?'),
          a: t(
            'tools.farm.a2',
            'Use the cost calculator per part to include machine wear, then enter that figure as cost per part here.'
          ),
        },
      ],
    })
  );

  return pages;
}

module.exports = { buildTools };

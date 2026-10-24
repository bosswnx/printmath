const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { filaments } = require('../data/filaments');

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'AUD', 'CAD', 'INR'];

function currencyField() {
  return `<div class="field"><label for="cur">Currency</label>
<select id="cur" data-cur>${CURRENCIES.map((c) => `<option value="${c}">${c}</option>`).join('')}</select></div>`;
}
function materialField(selected) {
  return `<div class="field"><label for="mat">Material</label>
<select id="mat" data-mat>${filaments
    .map((f) => `<option value="${f.id}"${f.id === selected ? ' selected' : ''}>${esc(f.name)} — ${f.density} g/cm³</option>`)
    .join('')}<option value="custom">Custom density…</option></select></div>`;
}
function densityField(value) {
  return `<div class="field"><label for="dens">Density <span class="hint">g/cm³</span></label>
<input id="dens" type="number" step="0.01" value="${value || 1.24}" data-density></div>`;
}
function diameterField() {
  return `<div class="field"><label for="dia">Filament diameter <span class="hint">mm</span></label>
<select id="dia" data-diameter><option value="1.75">1.75 mm</option><option value="2.85">2.85 mm</option><option value="3">3.00 mm</option></select></div>`;
}
function priceField(v) {
  return `<div class="field"><label for="pkg">Filament price <span class="hint">per kg</span></label>
<input id="pkg" type="number" step="0.01" value="${v == null ? 20 : v}" data-price-kg></div>`;
}
function field(label, id, attrs, value, hint) {
  return `<div class="field"><label for="${id}">${label}${hint ? ` <span class="hint">${hint}</span>` : ''}</label>
<input id="${id}" ${attrs} value="${value}" ></div>`;
}

function relatedToolLinks(exclude) {
  const tools = [
    ['/tools/cost-calculator/', 'Print cost calculator', 'Work out the real cost of a print and a selling price.'],
    ['/tools/gcode-analyzer/', 'G-code analyzer', 'Drop in a .gcode file to get filament use, weight and cost.'],
    ['/tools/filament-length/', 'Filament length & weight', 'Convert between metres, grams and cubic centimetres.'],
    ['/tools/spool-remaining/', 'Spool remaining', 'Weigh a part-used spool to see how much is left.'],
    ['/tools/flow-calculator/', 'Volumetric flow calculator', 'Check whether your speed is more than the hotend can melt.'],
    ['/tools/farm-calculator/', 'Print farm calculator', 'Model throughput and profit for one or many printers.'],
  ];
  return `<h2>Related tools</h2>
<div class="grid cols-2">
${tools
    .filter(([href]) => href !== exclude)
    .map(([href, t, d]) => `  <a class="card link" href="${href}"><h3>${t}</h3><p class="muted">${d}</p></a>`)
    .join('\n')}
</div>`;
}

function toolPage({ slug, title, h1, description, intro, toolHtml, explain, faqs, howTo }) {
  const path = `/tools/${slug}/`;
  const jsonLd = [
    breadcrumbs([
      { name: 'Home', path: '/' },
      { name: 'Tools', path: '/tools/' },
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
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools/' }, { name: h1, path }])}
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
      ? `<h2>FAQ</h2>
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
      title: '3D printing calculators & tools',
      description:
        'Free 3D printing calculators: print cost, G-code analysis, filament length, spool remaining, volumetric flow and print-farm profit.',
      path: '/tools/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools/' }])}
<div class="wrap">
  <div class="hero"><h1>3D printing calculators</h1>
  <p class="lead">Six free tools for the maths that slicers don't do for you: what a print really costs, how much filament is left, and whether your hotend can keep up.</p></div>
  <div class="grid cols-2">
    <a class="card link" href="/tools/cost-calculator/"><div class="kicker">Cost</div><h3>Print cost calculator</h3><p class="muted">Material, electricity, machine wear and labour, plus a suggested selling price and margin.</p></a>
    <a class="card link" href="/tools/gcode-analyzer/"><div class="kicker">Analysis</div><h3>G-code analyzer</h3><p class="muted">Drop a .gcode file to get filament length, weight, cost, layer count and print time — in your browser.</p></a>
    <a class="card link" href="/tools/filament-length/"><div class="kicker">Convert</div><h3>Filament length &amp; weight</h3><p class="muted">Convert between grams, metres and cubic centimetres for any material and diameter.</p></a>
    <a class="card link" href="/tools/spool-remaining/"><div class="kicker">Convert</div><h3>Spool remaining</h3><p class="muted">Weigh a part-used spool to see how many grams and metres are left.</p></a>
    <a class="card link" href="/tools/flow-calculator/"><div class="kicker">Tuning</div><h3>Volumetric flow calculator</h3><p class="muted">Check whether your speed and layer height exceed what your hotend can melt.</p></a>
    <a class="card link" href="/tools/farm-calculator/"><div class="kicker">Business</div><h3>Print farm calculator</h3><p class="muted">Estimate throughput, revenue and profit across one or many printers.</p></a>
  </div>
  <h2>Reference</h2>
  <div class="grid cols-3">
    <a class="card link" href="/filaments/"><h3>Filament guide</h3><p class="muted">Temperatures, properties and trade-offs for 15 materials.</p></a>
    <a class="card link" href="/printers/"><h3>Printer database</h3><p class="muted">Build volumes, enclosures and material suitability.</p></a>
    <a class="card link" href="/troubleshooting/"><h3>Troubleshooting</h3><p class="muted">19 print defects, their causes and fixes.</p></a>
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools/' }])],
    }),
  });

  // Cost calculator
  pages.push(
    toolPage({
      slug: 'cost-calculator',
      title: '3D print cost calculator (with selling price)',
      h1: '3D print cost calculator',
      description:
        'Work out what a 3D print costs in material, electricity, machine wear and labour — and what to charge for it. Free, instant, no sign-up.',
      intro:
        'Most people only count filament. This calculator adds electricity, machine wear, labour and your failure rate, then suggests a selling price for a target margin.',
      toolHtml: `<div class="tool" data-tool="cost-calculator">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${priceField(20)}
    ${field('Part weight', 'weight', 'type="number" step="0.1" data-weight', 30, 'grams')}
    ${field('Print time', 'hours', 'type="number" step="0.1" data-hours', 4, 'hours')}
    ${field('Quantity', 'qty', 'type="number" step="1" min="1" data-qty', 1)}
    ${field('Printer power', 'watts', 'type="number" step="5" data-watts', 120, 'watts')}
    ${field('Electricity price', 'kwh', 'type="number" step="0.01" data-kwh', 0.15, 'per kWh')}
    ${field('Printer price', 'machine', 'type="number" step="1" data-machine', 400, 'for wear')}
    ${field('Machine life', 'life', 'type="number" step="100" data-life', 5000, 'hours')}
    ${field('Hands-on time', 'labor-min', 'type="number" step="1" data-labor-min', 5, 'minutes')}
    ${field('Your hourly rate', 'labor-rate', 'type="number" step="1" data-labor-rate', 15, 'per hour')}
    ${field('Failure / waste rate', 'fail', 'type="number" step="1" min="0" max="95" data-fail', 5, '%')}
    ${field('Target margin', 'margin', 'type="number" step="1" min="0" max="95" data-margin', 40, '%')}
  </div>
  <div class="results">
    <div class="result-row"><span class="k">Material</span><span class="v" data-out-material>—</span></div>
    <div class="result-row"><span class="k">Electricity</span><span class="v" data-out-energy>—</span></div>
    <div class="result-row"><span class="k">Machine wear</span><span class="v" data-out-wear>—</span></div>
    <div class="result-row"><span class="k">Labour</span><span class="v" data-out-labor>—</span></div>
    <div class="result-row"><span class="k">Failure buffer</span><span class="v" data-out-waste>—</span></div>
    <div class="result-row big"><span class="k">True cost per part</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row big"><span class="k">Suggested price</span><span class="v" data-out-price>—</span></div>
    <div class="result-row"><span class="k">Profit per part</span><span class="v" data-out-profit>—</span></div>
    <div class="result-row"><span class="k">Batch cost</span><span class="v" data-out-batch>—</span></div>
    <div class="result-row"><span class="k">Batch revenue at suggested price</span><span class="v" data-out-batch-price>—</span></div>
  </div>
  <p class="note">Electricity uses an average draw (a heated bed plus hotend usually averages 80–150 W). Machine wear spreads the printer's price over its expected life in print hours. Update the inputs to match your machine and energy price.</p>
</div>`,
      howTo: {
        name: 'How to calculate the cost of a 3D print',
        description: 'Estimate material, energy, wear and labour, then derive a selling price.',
        steps: [
          'Weigh the finished part, or read the weight from your slicer preview.',
          'Enter print time and your local electricity price.',
          'Enter your printer price and expected life in hours to include wear.',
          'Add hands-on time and your hourly rate, then a failure rate.',
          'Pick a target margin to get a suggested selling price.',
        ],
      },
      explain: `<h2>How the cost is built up</h2>
<p>The calculator sums four real costs and then adds a buffer for failed prints:</p>
<ul>
<li><strong>Material</strong> — weight ÷ 1000 × price per kg. This ignores purge and support waste; if you purge a lot, add 10–20%.</li>
<li><strong>Electricity</strong> — watts ÷ 1000 × hours × price per kWh. A typical enclosed printer averages 100–150 W; a large heated bed pushes it higher.</li>
<li><strong>Machine wear</strong> — printer price ÷ life hours × print hours. This is the cost people forget; it is what pays for the next printer.</li>
<li><strong>Labour</strong> — hands-on minutes × your rate. Slicing, setup, removal and finishing all count.</li>
</ul>
<p>The failure buffer divides the subtotal by (1 − failure rate). A 10% failure rate adds about 11% to cost. The suggested price then divides by (1 − margin), which is not the same as adding a markup: a 40% margin means 40% of the price is profit.</p>`,
      faqs: [
        { q: 'Should I price by weight or by print time?', a: 'By time is more honest for anything slow, because machine time is the scarce resource. A common compromise is to charge material cost plus a fixed rate per hour of printer time.' },
        { q: 'What failure rate should I use?', a: 'For a tuned printer and a proven model, 2–5%. For a new material or a tall print, 10–20% is realistic. Track your own scrap rate and use it.' },
        { q: 'Is electricity really worth counting?', a: 'For a long ABS print on an enclosed machine, electricity can approach the cost of the filament. It is worth counting if you print a lot.' },
      ],
    })
  );

  // G-code analyzer
  pages.push(
    toolPage({
      slug: 'gcode-analyzer',
      title: 'G-code analyzer — filament, weight, cost & print time',
      h1: 'G-code analyzer',
      description:
        'Drop a .gcode file to see filament length, weight, cost, layer count and print time. Runs entirely in your browser — nothing is uploaded.',
      intro:
        'Upload a sliced file and this tool reads the slicer comments and extrusion moves to report exactly how much filament the print needs and what it costs.',
      toolHtml: `<div class="tool" data-tool="gcode-analyzer">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${priceField(20)}
  </div>
  <div class="field" style="margin-top:16px">
    <label for="gcode">G-code file</label>
    <input id="gcode" type="file" accept=".gcode,.gco,.g,.txt" data-file>
    <div class="note" data-drop style="border-style:dashed;border-color:var(--line);padding:18px;text-align:center">…or drop a .gcode file here. Files never leave your device.</div>
  </div>
  <div class="results" data-results hidden>
    <div class="result-row"><span class="k">File</span><span class="v" data-out-file>—</span></div>
    <div class="result-row big"><span class="k">Filament length</span><span class="v" data-out-length>—</span></div>
    <div class="result-row big"><span class="k">Filament weight</span><span class="v" data-out-grams>—</span></div>
    <div class="result-row"><span class="k">Material cost</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row"><span class="k">Layers</span><span class="v" data-out-layers>—</span></div>
    <div class="result-row"><span class="k">Print time (from slicer)</span><span class="v" data-out-time>—</span></div>
    <div class="result-row"><span class="k">Spool use</span><span class="v" data-out-spools>—</span></div>
  </div>
</div>`,
      explain: `<h2>How it reads your file</h2>
<p>The tool first looks for slicer comments — <code>;Filament used: 12.3m</code>, <code>;TIME:14400</code>, <code>;LAYER:</code> — which PrusaSlicer, OrcaSlicer, SuperSlicer, Cura and Bambu Studio all write. If those are missing it falls back to summing the extrusion axis (E) in the G-code, handling both absolute (M82) and relative (M83) modes.</p>
<p>Weight is derived from the extrusion length, filament diameter and material density, so set those to match your spool. Everything happens locally in your browser: no file is uploaded anywhere.</p>
<p>For pricing the print properly, take the weight into the <a href="/tools/cost-calculator/">cost calculator</a>.</p>`,
      faqs: [
        { q: 'Why does the weight differ from my slicer?', a: 'Check the density and diameter inputs — they must match the material and spool you are using. Most slicers assume 1.24 g/cm³ for PLA.' },
        { q: 'Is my file uploaded?', a: 'No. The analysis runs in your browser with the FileReader API. Nothing is sent to a server.' },
        { q: 'Which slicers are supported?', a: 'Any G-code file. Slicer comments give the most accurate result; extrusion summing works on all of them.' },
      ],
    })
  );

  // Filament length
  pages.push(
    toolPage({
      slug: 'filament-length',
      title: 'Filament length to weight converter (grams, metres, cm³)',
      h1: 'Filament length & weight converter',
      description:
        'Convert filament between grams, metres and cubic centimetres for any material, density and diameter. Includes cost per metre.',
      intro:
        'How long is 500 g of PETG? How many grams in 100 m of 1.75 mm PLA? This converter answers both directions using real material densities.',
      toolHtml: `<div class="tool" data-tool="filament-length">
  <div class="tool-grid">
    ${currencyField()}
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${field('Weight', 'grams', 'type="number" step="1" data-grams', 500, 'grams')}
    ${priceField(20)}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">Length</span><span class="v" data-out-m>—</span></div>
    <div class="result-row"><span class="k">Length in mm</span><span class="v" data-out-mm>—</span></div>
    <div class="result-row"><span class="k">Volume</span><span class="v" data-out-vol>—</span></div>
    <div class="result-row"><span class="k">Cost of this amount</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row"><span class="k">Cost per metre</span><span class="v" data-out-per-m>—</span></div>
  </div>
</div>`,
      explain: `<h2>The formula</h2>
<p>Filament is a cylinder, so volume = π × r² × length. With the radius in centimetres, multiplying by density (g/cm³) gives grams:</p>
<p><code>weight = (length_mm ÷ 10) × π × (diameter_mm ÷ 20)² × density</code></p>
<p>As a sanity check: 1 kg of 1.75 mm PLA at 1.24 g/cm³ is about 335 m, and 1 kg of PETG is about 327 m. If your result is far from that, check the density and diameter.</p>`,
      faqs: [
        { q: 'How many metres is 1 kg of PLA?', a: 'About 335 m for 1.75 mm PLA at 1.24 g/cm³. PETG is about 327 m, ABS about 400 m because it is less dense.' },
        { q: 'Does 2.85 mm filament hold more grams per metre?', a: 'Yes. 2.85 mm filament is about 2.65× the cross-section of 1.75 mm, so the same weight is much shorter — around 126 m per kg of PLA.' },
      ],
    })
  );

  // Spool remaining
  pages.push(
    toolPage({
      slug: 'spool-remaining',
      title: 'How much filament is left on my spool? (weight calculator)',
      h1: 'Spool remaining calculator',
      description:
        'Weigh a part-used spool and subtract the empty spool weight to find how many grams and metres of filament remain.',
      intro:
        'The only accurate way to know what is left on a spool is to weigh it. Enter the total weight, the empty spool weight and the material to get the remaining filament in grams, metres and percent.',
      toolHtml: `<div class="tool" data-tool="spool-remaining">
  <div class="tool-grid">
    ${materialField('pla')}
    ${densityField(1.24)}
    ${diameterField()}
    ${field('Full spool net weight', 'full', 'type="number" step="1" data-full', 1000, 'grams')}
    ${field('Empty spool weight', 'empty', 'type="number" step="1" data-empty', 200, 'grams')}
    ${field('Current total weight', 'now', 'type="number" step="1" data-now', 700, 'grams')}
    ${field('Filament per part', 'per-part', 'type="number" step="1" data-per-part', 20, 'grams')}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">Filament remaining</span><span class="v" data-out-remain>—</span></div>
    <div class="result-row"><span class="k">Remaining length</span><span class="v" data-out-m>—</span></div>
    <div class="result-row"><span class="k">Percent of full spool</span><span class="v" data-out-pct>—</span></div>
    <div class="result-row"><span class="k">Prints of your part</span><span class="v" data-out-prints>—</span></div>
    <div class="bar" data-bar><span style="width:0%"></span></div>
  </div>
  <p class="note">Empty spool weight varies: most 1 kg plastic spools are 150–250 g, cardboard spools 100–180 g. Weigh an empty one once and keep the number.</p>
</div>`,
      explain: `<h2>Why weighing beats guessing</h2>
<p>Slicers cannot know what is physically left on your spool. A kitchen scale can. Weigh the whole spool, subtract the empty spool weight, and what remains is filament. The tool then converts grams to metres with the same density maths as the <a href="/tools/filament-length/">length converter</a>.</p>
<p>Keep the empty-spool number for each brand you buy — it makes the reading exact in one step.</p>`,
      faqs: [
        { q: 'How much does an empty filament spool weigh?', a: 'Typically 150–250 g for plastic 1 kg spools, and 100–180 g for cardboard. Weigh one when it runs out and note the figure.' },
        { q: 'Can I trust the percent reading?', a: 'It is accurate as long as the "full spool net weight" matches the spool you bought (some are 750 g or 1 kg) and you use the right empty-spool weight.' },
      ],
    })
  );

  // Flow calculator
  pages.push(
    toolPage({
      slug: 'flow-calculator',
      title: 'Volumetric flow calculator — can your hotend keep up?',
      h1: 'Volumetric flow calculator',
      description:
        'Calculate the volumetric flow your slicer asks for from speed, layer height and line width, and compare it with your hotend’s melting limit.',
      intro:
        'Under-extrusion at high speed is usually a hotend limit, not a slicer bug. This calculator turns your speed settings into a volumetric flow rate so you can see whether the hotend can melt that much plastic.',
      toolHtml: `<div class="tool" data-tool="flow-calculator">
  <div class="tool-grid">
    ${field('Print speed', 'speed', 'type="number" step="5" data-speed', 150, 'mm/s')}
    ${field('Layer height', 'layer-height', 'type="number" step="0.01" data-layer-height', 0.2, 'mm')}
    ${field('Line width', 'line-width', 'type="number" step="0.01" data-line-width', 0.45, 'mm')}
    <div class="field"><label for="hotend">Hotend</label>
    <select id="hotend" data-hotend>
      <option value="stock">Stock MK8 / V6</option>
      <option value="volcano">Volcano / long melt zone</option>
      <option value="highflow" selected>High-flow (Rapido, Dragon HF)</option>
      <option value="custom">Custom…</option>
    </select></div>
    ${field('Custom hotend max', 'hotend-max', 'type="number" step="1" data-hotend-max', 15, 'mm³/s')}
  </div>
  <div class="results">
    <div class="result-row big"><span class="k">Volumetric flow</span><span class="v" data-out-flow>—</span></div>
    <div class="result-row"><span class="k">Hotend limit</span><span class="v" data-out-max>—</span></div>
    <div class="result-row"><span class="k">Max speed at these settings</span><span class="v" data-out-maxspeed>—</span></div>
    <div class="result-row"><span class="k">Verdict</span><span class="v"><span class="pill" data-out-verdict>—</span></span></div>
  </div>
  <p class="note">Limits are rough averages for PLA at typical temperatures. Higher temperatures and larger nozzles raise the limit; PETG and filled materials lower it.</p>
</div>`,
      explain: `<h2>The maths</h2>
<p>Volumetric flow (mm³/s) = speed (mm/s) × layer height (mm) × line width (mm). A 0.4 mm nozzle at 0.2 mm layers and 0.45 mm width printing at 150 mm/s needs 13.5 mm³/s. A stock MK8 hotend tops out around 10–12 mm³/s with PLA, so that speed will under-extrude.</p>
<p>Typical ceilings with PLA: stock MK8/V6 ≈ 10–12 mm³/s, Volcano ≈ 20, high-flow ≈ 25+. If you need more, raise the nozzle temperature, fit a larger nozzle, or use a high-flow hotend.</p>`,
      faqs: [
        { q: 'What is a good volumetric flow limit?', a: 'For a 0.4 mm nozzle with PLA: about 10–12 mm³/s on a stock hotend, 20 with a Volcano, and 25 or more with a modern high-flow hotend.' },
        { q: 'Why does my print under-extrude only on infill?', a: 'Many slicers print infill faster than walls, so infill crosses the flow limit first. Cap infill volumetric speed to the hotend limit.' },
      ],
    })
  );

  // Farm calculator
  pages.push(
    toolPage({
      slug: 'farm-calculator',
      title: '3D print farm calculator — throughput, revenue and profit',
      h1: 'Print farm calculator',
      description:
        'Model daily and monthly output, revenue, cost and profit for one or many 3D printers, including a failure rate.',
      intro:
        'If you sell prints, the numbers that matter are throughput and margin. Set your printers, hours, part time and price to see monthly output and profit.',
      toolHtml: `<div class="tool" data-tool="farm-calculator">
  <div class="tool-grid">
    ${currencyField()}
    ${field('Printers', 'printers', 'type="number" step="1" min="1" data-printers', 1)}
    ${field('Print hours per day', 'hours-day', 'type="number" step="0.5" max="24" data-hours-day', 20, 'per printer')}
    ${field('Time per part', 'part-hours', 'type="number" step="0.1" data-part-hours', 4, 'hours')}
    ${field('Cost per part', 'part-cost', 'type="number" step="0.1" data-part-cost', 2, 'your cost')}
    ${field('Selling price per part', 'part-price', 'type="number" step="0.1" data-part-price', 12)}
    ${field('Failure rate', 'fail', 'type="number" step="1" data-fail', 5, '%')}
    ${field('Days per month', 'days', 'type="number" step="1" data-days', 30)}
  </div>
  <div class="results">
    <div class="result-row"><span class="k">Output per printer</span><span class="v" data-out-perprinter>—</span></div>
    <div class="result-row"><span class="k">Output per day</span><span class="v" data-out-perday>—</span></div>
    <div class="result-row big"><span class="k">Parts per month</span><span class="v" data-out-permonth>—</span></div>
    <div class="result-row"><span class="k">Monthly revenue</span><span class="v" data-out-revenue>—</span></div>
    <div class="result-row"><span class="k">Monthly cost</span><span class="v" data-out-cost>—</span></div>
    <div class="result-row big"><span class="k">Monthly profit</span><span class="v" data-out-profit>—</span></div>
    <div class="result-row"><span class="k">Margin</span><span class="v" data-out-margin>—</span></div>
  </div>
  <p class="note">This ignores idle time, maintenance and shipping. It assumes parts are printed back to back, which is only true if you always have work queued.</p>
</div>`,
      explain: `<h2>Reading the numbers</h2>
<p>The model is deliberately simple: each printer runs for the hours you give it, each part takes a fixed time, and a failure rate removes some output. Output per printer per day = (hours ÷ part time) × (1 − failure rate).</p>
<p>In practice, idle time is the biggest gap between the model and reality: overnight jobs, plate changes and waiting for orders all cut into it. Treat the result as a ceiling, then discount it.</p>`,
      faqs: [
        { q: 'Is a print farm profitable?', a: 'It can be, but only with consistent demand. Printing is the easy part; selling enough to keep the machines busy is what decides the profit.' },
        { q: 'Should I count printer depreciation here?', a: 'Use the cost calculator per part to include machine wear, then enter that figure as cost per part here.' },
      ],
    })
  );

  return pages;
}

module.exports = { buildTools };

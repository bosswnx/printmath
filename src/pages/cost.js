const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { objects, byId } = require('../data/objects');
const { byId: fById } = require('../data/filaments');

// Assumptions used for every object page. Kept explicit so the numbers are auditable.
const ASSUMPTIONS = { watts: 120, kwh: 0.15, machine: 400, life: 5000, failPct: 5 };
const MATERIALS = ['pla', 'petg', 'abs', 'asa', 'pla-cf', 'tpu'];
const SERVICE_RATE = 0.9; // typical 3D printing service price per gram of finished part, USD

function costFor(obj, matId) {
  const f = fById[matId];
  const material = (obj.weightG / 1000) * f.pricePerKg;
  const energy = (ASSUMPTIONS.watts / 1000) * obj.hours * ASSUMPTIONS.kwh;
  const wear = (ASSUMPTIONS.machine / ASSUMPTIONS.life) * obj.hours;
  const base = material + energy + wear;
  const total = base / (1 - ASSUMPTIONS.failPct / 100);
  return { material, energy, wear, total };
}

function money(n) {
  return '$' + n.toFixed(2);
}

function objectPage(obj) {
  const path = `/cost/${obj.id}/`;
  const rows = MATERIALS.map((m) => {
    const f = fById[m];
    const c = costFor(obj, m);
    return { m, f, c };
  });
  const cheapest = rows.reduce((a, b) => (a.c.total <= b.c.total ? a : b));
  const pla = rows[0].c;
  const serviceLow = obj.weightG * SERVICE_RATE * 0.6;
  const serviceHigh = obj.weightG * SERVICE_RATE * 1.4;
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Print cost', path: '/cost/' }, { name: `Cost to print a ${obj.name}`, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>How much does it cost to 3D print a ${esc(obj.name)}?</h1>
    <p class="lead">About <strong>${money(pla.total)}</strong> in PLA on a typical hobby printer, for a ${obj.weightG} g part that takes roughly ${obj.hours} hour${obj.hours === 1 ? '' : 's'}. Here is the breakdown, what changes it, and how it compares with paying a print service.</p>
  </div>

  <h2>Cost by material</h2>
  <div class="table-scroll"><table>
    <thead><tr><th>Material</th><th class="num">Material</th><th class="num">Electricity</th><th class="num">Machine wear</th><th class="num">Total (incl. 5% failure)</th></tr></thead>
    <tbody>
${rows
  .map(
    (r) => `      <tr><td><a href="/filaments/${r.m}/">${esc(r.f.name)}</a></td><td class="num">${money(r.c.material)}</td><td class="num">${money(r.c.energy)}</td><td class="num">${money(r.c.wear)}</td><td class="num"><strong>${money(r.c.total)}</strong></td></tr>`
  )
  .join('\n')}
    </tbody>
  </table></div>
  <p class="note">Assumes ${ASSUMPTIONS.watts} W average draw, ${'$'}${ASSUMPTIONS.kwh}/kWh, a ${'$'}${ASSUMPTIONS.machine} printer used over ${ASSUMPTIONS.life.toLocaleString()} hours, and a 5% failure rate. ${esc(obj.note)}</p>

  <h2>What drives the cost</h2>
  <p>For a ${obj.weightG} g part, material is ${Math.round((pla.material / pla.total) * 100)}% of the cost, electricity ${Math.round((pla.energy / pla.total) * 100)}% and machine wear ${Math.round((pla.wear / pla.total) * 100)}%. ${obj.hours >= 6 ? 'This is a long print, so machine time matters more than usual — a faster printer or a bigger nozzle cuts the real cost most.' : 'This is a short print, so material dominates and switching to a cheaper spool helps most.'}</p>
  <p>Switching to the cheapest material here (${esc(cheapest.f.name)}) saves ${money(pla.total - cheapest.c.total)} versus PLA. Paying extra for PETG or ASA buys durability, not savings.</p>

  <h2>DIY vs a print service</h2>
  <p>Print services typically charge ${money(serviceLow)}–${money(serviceHigh)} for a part this size, because you are paying for their machine time, labour and margin, not just plastic. Printing it yourself costs ${money(pla.total)} in materials and wear — plus your time, which is the honest difference. If you value an hour at $15, add ${money((obj.hours > 1 ? 0.25 : 0.1) * 15)} for the few minutes of hands-on work.</p>

  <h2>Printing a batch</h2>
  <p>${obj.weightG <= 20 ? `Small parts like this are worth printing in bulk: 20 of them on one plate cost about ${money(pla.total * 20 * 0.85)}, because you save the per-print setup and the plate is not empty.` : `For a part this size, batch printing saves less — you are limited by plate area and print time rather than setup overhead.`}</p>

  <h2>Work it out for your own numbers</h2>
  <p>These figures use fixed assumptions. Put in your own electricity price, printer cost and filament price with the <a href="/tools/cost-calculator/">print cost calculator</a>, or drop a sliced file into the <a href="/tools/gcode-analyzer/">G-code analyzer</a> to get the exact weight and time.</p>

  <div class="grid cols-2">
    <a class="card link" href="/cost/"><h3>More object cost guides</h3></a>
    <a class="card link" href="/tools/cost-calculator/"><h3>Print cost calculator</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `How much does it cost to 3D print a ${obj.name}?`,
      description: `A ${obj.name} costs about ${money(pla.total)} to 3D print in PLA (${obj.weightG} g, ~${obj.hours}h). Full breakdown by material, plus DIY vs print-service pricing.`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Print cost', path: '/cost/' }, { name: `Cost to print a ${obj.name}`, path }]),
        faq([
          { q: `How much does it cost to 3D print a ${obj.name}?`, a: `About ${money(pla.total)} in PLA including material, electricity, machine wear and a failure buffer, for a part weighing roughly ${obj.weightG} g and taking about ${obj.hours} hour(s) to print.` },
          { q: `How much filament does a ${obj.name} use?`, a: `Roughly ${obj.weightG} g, or about ${Math.round((obj.weightG / 1.24) / 3.35)} m of 1.75 mm PLA.` },
        ]),
      ],
    }),
  };
}

function buildCost() {
  const pages = [];
  pages.push({
    path: '/cost/',
    html: layout({
      title: '3D printing cost guide — what things cost to print',
      description:
        'What popular objects cost to 3D print: phone stands, vases, planters, cosplay helmets and more, broken down by material.',
      path: '/cost/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Print cost', path: '/cost/' }])}
<div class="wrap">
  <div class="hero"><h1>What does it cost to print…?</h1>
  <p class="lead">Real costs for ${objects.length} common objects, broken down into material, electricity and machine wear, using explicit assumptions.</p></div>
  <div class="grid cols-3">
${objects
  .map((o) => {
    const c = costFor(o, 'pla');
    return `    <a class="card link" href="/cost/${o.id}/"><div class="kicker">${esc(o.category)}</div><h3>${esc(o.name)}</h3><p class="muted tiny">${o.weightG} g · ${o.hours} h · <strong>${money(c.total)}</strong> in PLA</p></a>`;
  })
  .join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Print cost', path: '/cost/' }])],
    }),
  });
  objects.forEach((o) => pages.push(objectPage(o)));
  return pages;
}

module.exports = { buildCost };

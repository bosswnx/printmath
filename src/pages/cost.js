const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr } = require('../lib/i18n');
const { objects, byId } = require('../data/objects');
const { byId: fById } = require('../data/filaments');

// Assumptions used for every object page. Kept explicit so the numbers are auditable.
const ASSUMPTIONS = { watts: 120, kwh: 0.15, machine: 400, life: 5000, failPct: 5 };
const MATERIALS = ['pla', 'petg', 'abs', 'asa', 'pla-cf', 'tpu'];
const SERVICE_RATE = 0.9; // typical 3D printing service price per gram of finished part, USD

const oname = (o) => tr('objects', o.id, 'name', o.name);
const ocat = (o) => tr('objects', o.id, 'category', o.category);
const onote = (o) => tr('objects', o.id, 'note', o.note);
const fname = (f) => tr('filaments', f.id, 'name', f.name);

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

// "1 hour" / "3 hours" / "40 minutes" in English, "1 小时" / "3 小时" / "40 分钟" in Chinese.
function hoursText(h) {
  if (h < 1) return t('cost.minutes', '{n} minutes', { n: Math.round(h * 60) });
  return h === 1 ? t('cost.hourOne', '1 hour') : t('cost.hourMany', '{n} hours', { n: h });
}

function objectPage(obj) {
  const path = `/cost/${obj.id}/`;
  const name = oname(obj);
  const hours = hoursText(obj.hours);
  const rows = MATERIALS.map((m) => {
    const f = fById[m];
    const c = costFor(obj, m);
    return { m, f, c };
  });
  const cheapest = rows.reduce((a, b) => (a.c.total <= b.c.total ? a : b));
  const pla = rows[0].c;
  const serviceLow = obj.weightG * SERVICE_RATE * 0.6;
  const serviceHigh = obj.weightG * SERVICE_RATE * 1.4;
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('cost.crumbIndex', 'Print cost'), path: '/cost/' }, { name: t('cost.crumbObj', 'Cost to print a {name}', { name }), path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(t('cost.objH1', 'How much does it cost to 3D print a {name}?', { name }))}</h1>
    <p class="lead">${t(
      'cost.lead',
      'About <strong>{total}</strong> in PLA on a typical hobby printer, for a {weight} g part that takes roughly {hours}. Here is the breakdown, what changes it, and how it compares with paying a print service.',
      { total: money(pla.total), weight: obj.weightG, hours }
    )}</p>
  </div>

  <h2>${esc(t('cost.byMaterial', 'Cost by material'))}</h2>
  <div class="table-scroll"><table>
    <thead><tr><th>${esc(t('cost.material', 'Material'))}</th><th class="num">${esc(t('cost.material', 'Material'))}</th><th class="num">${esc(t('cost.electricity', 'Electricity'))}</th><th class="num">${esc(t('cost.wear', 'Machine wear'))}</th><th class="num">${esc(t('cost.totalWithFail', 'Total (incl. 5% failure)'))}</th></tr></thead>
    <tbody>
${rows
  .map(
    (r) => `      <tr><td><a href="/filaments/${r.m}/">${esc(fname(r.f))}</a></td><td class="num">${money(r.c.material)}</td><td class="num">${money(r.c.energy)}</td><td class="num">${money(r.c.wear)}</td><td class="num"><strong>${money(r.c.total)}</strong></td></tr>`
  )
  .join('\n')}
    </tbody>
  </table></div>
  <p class="note">${esc(
    t(
      'cost.assumptions',
      'Assumes {watts} W average draw, {kwh}/kWh, a {machine} printer used over {life} hours, and a 5% failure rate. {note}',
      {
        watts: ASSUMPTIONS.watts,
        kwh: '$' + ASSUMPTIONS.kwh,
        machine: '$' + ASSUMPTIONS.machine,
        life: ASSUMPTIONS.life.toLocaleString('en-US'),
        note: onote(obj),
      }
    )
  )}</p>

  <h2>${esc(t('cost.drivers', 'What drives the cost'))}</h2>
  <p>${t(
    'cost.driversBody',
    'For a {weight} g part, material is {matPct}% of the cost, electricity {energyPct}% and machine wear {wearPct}%. {tail}',
    {
      weight: obj.weightG,
      matPct: Math.round((pla.material / pla.total) * 100),
      energyPct: Math.round((pla.energy / pla.total) * 100),
      wearPct: Math.round((pla.wear / pla.total) * 100),
      tail:
        obj.hours >= 6
          ? t(
              'cost.driversLong',
              'This is a long print, so machine time matters more than usual — a faster printer or a bigger nozzle cuts the real cost most.'
            )
          : t(
              'cost.driversShort',
              'This is a short print, so material dominates and switching to a cheaper spool helps most.'
            ),
    }
  )}</p>
  <p>${esc(
    cheapest.m === 'pla'
      ? t(
          'cost.switchAlready',
          'PLA is already the cheapest option here — the other materials cost up to {extra} more and buy durability, not savings.',
          { extra: money(rows.reduce((a, b) => (a.c.total >= b.c.total ? a : b)).c.total - pla.total) }
        )
      : t(
          'cost.switchSaves',
          'Switching to the cheapest material here ({name}) saves {saving} versus PLA. Paying extra for PETG or ASA buys durability, not savings.',
          { name: fname(cheapest.f), saving: money(pla.total - cheapest.c.total) }
        )
  )}</p>

  <h2>${esc(t('cost.diyVsService', 'DIY vs a print service'))}</h2>
  <p>${esc(
    t(
      'cost.diyVsServiceBody',
      'Print services typically charge {low}–{high} for a part this size, because you are paying for their machine time, labour and margin, not just plastic. Printing it yourself costs {total} in materials and wear — plus your time, which is the honest difference. If you value an hour at $15, add {labor} for the few minutes of hands-on work.',
      {
        low: money(serviceLow),
        high: money(serviceHigh),
        total: money(pla.total),
        labor: money((obj.hours > 1 ? 0.25 : 0.1) * 15),
      }
    )
  )}</p>

  <h2>${esc(t('cost.batch', 'Printing a batch'))}</h2>
  <p>${esc(
    obj.weightG <= 20
      ? t(
          'cost.batchSmall',
          'Small parts like this are worth printing in bulk: 20 of them on one plate cost about {batch}, because you save the per-print setup and the plate is not empty.',
          { batch: money(pla.total * 20 * 0.85) }
        )
      : t(
          'cost.batchLarge',
          'For a part this size, batch printing saves less — you are limited by plate area and print time rather than setup overhead.'
        )
  )}</p>

  <h2>${esc(t('cost.ownNumbers', 'Work it out for your own numbers'))}</h2>
  <p>${t(
    'cost.ownNumbersBody',
    'These figures use fixed assumptions. Put in your own electricity price, printer cost and filament price with the {costTool}, or drop a sliced file into the {gcodeTool} to get the exact weight and time.',
    {
      costTool: `<a href="/tools/cost-calculator/">${esc(t('tool.cost.short', 'print cost calculator'))}</a>`,
      gcodeTool: `<a href="/tools/gcode-analyzer/">${esc(t('tool.gcode.short', 'G-code analyzer'))}</a>`,
    }
  )}</p>

  <div class="grid cols-2">
    <a class="card link" href="/cost/"><h3>${esc(t('cost.cardMore', 'More object cost guides'))}</h3></a>
    <a class="card link" href="/tools/cost-calculator/"><h3>${esc(t('cost.cardCalc', 'Print cost calculator'))}</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: t('cost.objH1', 'How much does it cost to 3D print a {name}?', { name }),
      description: t(
        'cost.objDesc',
        'A {name} costs about {cost} to 3D print in PLA ({weight} g, ~{hours}). Full breakdown by material, plus DIY vs print-service pricing.',
        { name, cost: money(pla.total), weight: obj.weightG, hours }
      ),
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('cost.crumbIndex', 'Print cost'), path: '/cost/' }, { name: t('cost.crumbObj', 'Cost to print a {name}', { name }), path }]),
        faq([
          {
            q: t('cost.q.howMuch', 'How much does it cost to 3D print a {name}?', { name }),
            a: t(
              'cost.q.howMuchA',
              'About {total} in PLA including material, electricity, machine wear and a failure buffer, for a part weighing roughly {weight} g and taking about {hours} to print.',
              { total: money(pla.total), weight: obj.weightG, hours }
            ),
          },
          {
            q: t('cost.q.filament', 'How much filament does a {name} use?', { name }),
            a: t(
              'cost.q.filamentA',
              'Roughly {weight} g, or about {meters} m of 1.75 mm PLA.',
              { weight: obj.weightG, meters: Math.round(obj.weightG / 1.24 / 3.35) }
            ),
          },
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
      title: t('cost.title', '3D printing cost guide — what things cost to print'),
      description: t(
        'cost.desc',
        'What popular objects cost to 3D print: phone stands, vases, planters, cosplay helmets and more, broken down by material.'
      ),
      path: '/cost/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('cost.crumbIndex', 'Print cost'), path: '/cost/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('cost.h1', 'What does it cost to print…?'))}</h1>
  <p class="lead">${esc(
    t(
      'cost.indexLead',
      'Real costs for {n} common objects, broken down into material, electricity and machine wear, using explicit assumptions.',
      { n: objects.length }
    )
  )}</p></div>
  <div class="grid cols-3">
${objects
  .map((o) => {
    const c = costFor(o, 'pla');
    return `    <a class="card link" href="/cost/${o.id}/"><div class="kicker">${esc(ocat(o))}</div><h3>${esc(oname(o))}</h3><p class="muted tiny">${o.weightG} g · ${o.hours} h · <strong>${esc(t('cost.cardPrice', '{price} in PLA', { price: money(c.total) }))}</strong></p></a>`;
  })
  .join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('cost.crumbIndex', 'Print cost'), path: '/cost/' }])],
    }),
  });
  objects.forEach((o) => pages.push(objectPage(o)));
  return pages;
}

module.exports = { buildCost };

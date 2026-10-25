const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr } = require('../lib/i18n');
const { filaments } = require('../data/filaments');
const { printers } = require('../data/printers');
const { symptoms } = require('../data/symptoms');
const { objects } = require('../data/objects');
const { KEY_COMPARISONS } = require('./filaments');
const { byId } = require('../data/filaments');

const fname = (f) => tr('filaments', f.id, 'name', f.name);
const sname = (s) => tr('symptoms', s.id, 'name', s.name).split(/[(（]/)[0].trim();
const oname = (o) => tr('objects', o.id, 'name', o.name);

const TOOL_CARDS = [
  ['/tools/cost-calculator/', 'cost', 'Cost', 'Print cost calculator', 'Material, electricity, machine wear and labour, plus a suggested selling price and margin.'],
  ['/tools/gcode-analyzer/', 'gcode', 'Analysis', 'G-code analyzer', 'Drop a .gcode file to get filament length, weight, cost, layer count and print time — in your browser.'],
  ['/tools/filament-length/', 'length', 'Convert', 'Filament length & weight', 'Convert between grams, metres and cubic centimetres for any material and diameter.'],
  ['/tools/spool-remaining/', 'spool', 'Convert', 'Spool remaining', 'Weigh a part-used spool to see how many grams and metres are left.'],
  ['/tools/flow-calculator/', 'flow', 'Tuning', 'Volumetric flow calculator', 'Check whether your speed and layer height exceed what your hotend can melt.'],
  ['/tools/farm-calculator/', 'farm', 'Business', 'Print farm calculator', 'Estimate throughput, revenue and profit across one or many printers.'],
];

function home() {
  const path = '/';
  const body = `<div class="wrap">
  <div class="hero">
    <h1>${esc(t('home.h1', '3D printing maths, settings and fixes — without the guesswork'))}</h1>
    <p class="lead">${esc(t('home.lead', 'Free tools for print cost, filament use and flow; starting settings for every printer and material; and fixes for {n} common print defects.', { n: symptoms.length }))}</p>
    <p><a class="btn" href="/tools/cost-calculator/">${esc(t('home.ctaCost', 'Calculate a print cost'))}</a> <a class="btn ghost" href="/tools/gcode-analyzer/">${esc(t('home.ctaGcode', 'Analyze a G-code file'))}</a></p>
  </div>

  <h2>${esc(t('home.calculators', 'Calculators'))}</h2>
  <div class="grid cols-3">
${TOOL_CARDS.map(([href, key, kicker, name, desc]) => `    <a class="card link" href="${href}"><div class="kicker">${esc(t('tool.kicker.' + kicker.toLowerCase(), kicker))}</div><h3>${esc(t('tool.' + key + '.name', name))}</h3><p class="muted">${esc(t('tool.' + key + '.desc', desc))}</p></a>`).join('\n')}
  </div>

  <h2>${esc(t('home.findSettings', 'Find your settings'))}</h2>
  <p class="muted">${esc(t('home.findSettingsNote', 'Starting settings for {printers} printers × {filaments} materials, tuned to each machine’s extruder and enclosure.', { printers: printers.length, filaments: filaments.length }))}</p>
  <div class="grid cols-3">
${printers.slice(0, 9).map((p) => `    <a class="card link" href="/settings/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? esc(t('fl.enclosed', 'Enclosed')) : esc(t('fl.openFrame', 'Open frame'))}</p></a>`).join('\n')}
  </div>
  <p><a href="/settings/">${esc(t('nav.settings', 'Settings'))} →</a></p>

  <h2>${esc(t('home.fixPrint', 'Fix a bad print'))}</h2>
  <div class="grid cols-3">
${symptoms.slice(0, 6).map((s) => `    <a class="card link" href="/troubleshooting/${s.id}/"><h3>${esc(sname(s))}</h3></a>`).join('\n')}
  </div>
  <p><a href="/troubleshooting/">${esc(t('nav.troubleshooting', 'Troubleshooting'))} →</a></p>

  <h2>${esc(t('home.costSection', 'What does it cost to print…?'))}</h2>
  <p class="muted">${esc(t('home.costSectionNote', 'Real costs for common objects, broken down by material.'))}</p>
  <div class="grid cols-3">
${objects.slice(0, 6).map((o) => `    <a class="card link" href="/cost/${o.id}/"><h3>${esc(oname(o))}</h3><p class="muted tiny">${o.weightG} g · ${o.hours} h</p></a>`).join('\n')}
  </div>
  <p><a href="/cost/">${esc(t('cost.moreGuides', 'All cost guides'))} →</a></p>

  <h2>${esc(t('home.chooseFilament', 'Choose a filament'))}</h2>
  <div class="grid cols-3">
${filaments.slice(0, 6).map((f) => `    <a class="card link" href="/filaments/${f.id}/"><h3>${esc(fname(f))}</h3><p class="muted tiny">${f.nozzle[0]}–${f.nozzle[1]} °C · ${f.density} g/cm³</p></a>`).join('\n')}
  </div>
  <p><a href="/filaments/">${esc(t('fl.h1', 'Filament guide'))} →</a></p>
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
          { q: t('home.q.free', 'Are these 3D printing tools free?'), a: t('home.q.freeA', 'Yes. Every calculator and reference page is free and works in your browser without an account.') },
          { q: t('home.q.upload', 'Do my G-code files get uploaded?'), a: t('home.q.uploadA', 'No. The G-code analyzer runs entirely in your browser.') },
          { q: t('home.q.accurate', 'How accurate are the suggested settings?'), a: t('home.q.accurateA', 'They are sensible starting points, not a guarantee. Confirm with a temperature tower and a flow test.') },
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
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: h1, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px"><h1>${esc(h1)}</h1></div>
  ${html}
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: h1, path }])],
    }),
  };
}

function buildStatic() {
  const pages = [home()];

  pages.push({
    path: '/filaments/compare/',
    html: layout({
      title: t('fl.compareIndex', 'Filament comparisons'),
      description: t('fl.compareIndexLead', 'Side-by-side filament comparisons.'),
      path: '/filaments/compare/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name: t('fl.compareIndex', 'Compare'), path: '/filaments/compare/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('fl.compareIndex', 'Filament comparisons'))}</h1><p class="lead">${esc(t('fl.compareIndexLead', 'Pick two materials and see the differences that matter.'))}</p></div>
  <div class="grid cols-3">
${KEY_COMPARISONS.map(([a, b]) => `    <a class="card link" href="/filaments/compare/${a}-vs-${b}/"><h3>${esc(fname(byId[a]))} vs ${esc(fname(byId[b]))}</h3></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.filaments', 'Filaments'), path: '/filaments/' }, { name: t('fl.compareIndex', 'Compare'), path: '/filaments/compare/' }])],
    }),
  });

  pages.push(
    staticPage({
      path: '/about/',
      title: t('about.title', 'About'),
      description: `${SITE.name} — ${t('brand.tagline', SITE.tagline)}`,
      h1: t('about.h1', 'About').replace('{name}', SITE.name),
      html: `${t('about.body', '<p>About this site.</p>')}<p>${esc(t('about.question', 'Corrections and suggestions:'))} <a href="mailto:${SITE.email}">${SITE.email}</a></p>`,
    })
  );

  pages.push(
    staticPage({
      path: '/privacy/',
      title: t('privacy.title', 'Privacy'),
      description: `${SITE.name} — ${t('privacy.title', 'Privacy')}`,
      h1: t('privacy.h1', 'Privacy'),
      html: `${t('privacy.body', '<p>Privacy policy.</p>')}<p>${esc(t('privacy.question', 'Questions:'))} <a href="mailto:${SITE.email}">${SITE.email}</a></p>`,
    })
  );

  pages.push(
    staticPage({
      path: '/terms/',
      title: t('terms.title', 'Terms'),
      description: `${SITE.name} — ${t('terms.title', 'Terms')}`,
      h1: t('terms.h1', 'Terms of use'),
      html: t('terms.body', '<p>Terms.</p>'),
    })
  );

  const searchItems = [
    ['/tools/cost-calculator/', t('tool.cost.name', 'Print cost calculator')],
    ['/tools/gcode-analyzer/', t('tool.gcode.name', 'G-code analyzer')],
    ['/tools/filament-length/', t('tool.length.name', 'Filament length & weight')],
    ['/tools/spool-remaining/', t('tool.spool.name', 'Spool remaining')],
    ['/tools/flow-calculator/', t('tool.flow.name', 'Volumetric flow calculator')],
    ['/tools/farm-calculator/', t('tool.farm.name', 'Print farm calculator')],
    ['/filaments/', t('fl.h1', 'Filament guide')],
    ['/printers/', t('nav.printers', 'Printers')],
    ['/settings/', t('nav.settings', 'Settings')],
    ['/troubleshooting/', t('nav.troubleshooting', 'Troubleshooting')],
  ]
    .concat(filaments.map((f) => [`/filaments/${f.id}/`, fname(f)]))
    .concat(printers.map((p) => [`/printers/${p.id}/`, p.name]))
    .concat(symptoms.map((s) => [`/troubleshooting/${s.id}/`, sname(s)]))
    .concat(objects.map((o) => [`/cost/${o.id}/`, oname(o)]));

  pages.push(
    staticPage({
      path: '/search/',
      title: t('search.title', 'Search'),
      description: `${SITE.name} — ${t('search.title', 'Search')}`,
      h1: t('search.h1', 'Search'),
      html: `<p class="muted">${esc(t('search.lead', 'Find a calculator, material, printer or fix.'))}</p>
<div class="tool" data-tool="settings-filter">
  <div class="field"><label for="q">${esc(t('search.h1', 'Search'))}</label><input id="q" type="search" placeholder="${esc(t('search.placeholder', 'e.g. PETG, Ender 3, warping, cost'))}" data-filter></div>
  <p class="muted tiny" data-count></p>
  <div class="grid cols-2" style="margin-top:12px">
    ${searchItems.map(([href, label]) => `<a class="card link" data-row="${esc((label + ' ' + href).toLowerCase())}" href="${href}"><h3 style="margin:0;font-size:16px">${esc(label)}</h3></a>`).join('\n    ')}
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
      title: t('404.title', 'Not found'),
      description: t('404.title', 'Page not found.'),
      path: '/404.html',
      noindex: true,
      body: `<div class="wrap"><div class="hero"><h1>${esc(t('404.h1', 'Page not found'))}</h1>
      <p class="lead">${esc(t('404.lead', 'That page does not exist. Try the tools, the filament guide or the troubleshooting guide.'))}</p></div></div>`,
    }),
  };
}

module.exports = { buildStatic, notFound };

const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr } = require('../lib/i18n');
const { filaments } = require('../data/filaments');

const fname = (f) => tr('filaments', f.id, 'name', f.name);
const fsummary = (f) => tr('filaments', f.id, 'summary', f.summary);

const STRINGY = new Set(['petg', 'petg-cf', 'tpu', 'tpu-95a', 'nylon', 'pa-cf']);
const ABRASIVE = new Set(['pla-cf', 'petg-cf', 'pa-cf']);
const FLEXIBLE = new Set(['tpu', 'tpu-95a']);

// Five temperature bands across the material's real nozzle range, rounded to 5 °C
// and anchored on the published minimum and maximum.
function bands(f) {
  const [lo, hi] = f.nozzle;
  const n = 5;
  const step = (hi - lo) / (n - 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    let v = i === 0 ? lo : i === n - 1 ? hi : Math.round((lo + i * step) / 5) * 5;
    out.push(v);
  }
  return [...new Set(out)];
}

function materialGuide(f) {
  const path = `/guides/calibration/${f.id}/`;
  const name = fname(f);
  const b = bands(f);
  const bandText = b.join(' · ') + ' °C';

  const materialNotes = [];
  if (f.drySensitive) materialNotes.push(t('cal.towerDry', 'Dry the filament at {temp} °C for {hours} h first. Moisture shows up as stringing and a rough surface and will make the tower misleading.', { temp: f.dryTemp, hours: f.dryHours }));
  if (f.enclosure) materialNotes.push(t('cal.towerEnclosure', 'Print with the enclosure closed and the chamber stable; a draught changes the result.'));
  if (STRINGY.has(f.id)) materialNotes.push(t('cal.towerStringy', 'This material strings easily, so judge the bands on stringing as well as strength.'));

  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }, { name: t('cal.indexCrumb', 'Calibration'), path: '/guides/calibration/' }, { name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(t('cal.materialH1', '{name} calibration: temperature tower and flow test', { name }))}</h1>
    <p class="lead">${esc(t('cal.materialLead', 'Two tests turn a {name} preset into settings that work on your machine: a temperature tower for bonding and surface, then a flow test for exact extrusion.', { name }))}</p>
    <p class="muted">${esc(fsummary(f))}</p>
  </div>

  <h2>${esc(t('cal.startH2', 'Starting point'))}</h2>
  <div class="table-scroll"><table>
    <tbody>
      <tr><th>${esc(t('cal.nozzle', 'Nozzle'))}</th><td>${f.nozzle[0]}–${f.nozzle[1]} °C</td></tr>
      <tr><th>${esc(t('cal.bed', 'Bed'))}</th><td>${f.bed[0]}–${f.bed[1]} °C</td></tr>
      <tr><th>${esc(t('cal.drying', 'Drying'))}</th><td>${f.dryTemp} °C × ${f.dryHours} h</td></tr>
      <tr><th>${esc(t('cal.enclosure', 'Enclosure'))}</th><td>${f.enclosure ? esc(t('cal.enclosureYes', 'Recommended')) : esc(t('cal.enclosureNo', 'Not required'))}</td></tr>
    </tbody>
  </table></div>

  <h2>${esc(t('cal.towerH2', 'Temperature tower'))}</h2>
  <p>${esc(t('cal.towerIntro', 'Print a tower with five bands across the range, keeping flow at 1.00 and cooling fixed.'))}</p>
  <p class="note">${esc(t('cal.bandsLabel', 'Five bands:'))} ${esc(bandText)}</p>
  ${materialNotes.length ? `<p>${materialNotes.map((n) => esc(n)).join(' ')}</p>` : ''}
  <p>${esc(t('cal.towerRead', 'Read the tower in this order:'))}</p>
  <ul>
    <li><strong>${esc(t('cal.readAdhesionT', 'Layer adhesion'))}</strong> — ${esc(t('cal.readAdhesion', 'snap each band. A clean, strong break above the band is good; a brittle, flaky break means too cold.'))}</li>
    <li><strong>${esc(t('cal.readStringingT', 'Stringing'))}</strong> — ${esc(t('cal.readStringing', 'look at the gaps between features. The cooler bands should have less.'))}</li>
    <li><strong>${esc(t('cal.readSurfaceT', 'Surface and bridging'))}</strong> — ${esc(t('cal.readSurface', 'glossy, blobby or drooping bands are too hot.'))}</li>
  </ul>
  <p>${esc(t('cal.towerPick', 'Pick the lowest band that still gives strong layer adhesion and a clean surface. Lower is better for stringing and overhangs, as long as the part is not brittle.'))}</p>

  <h2>${esc(t('cal.flowH2', 'Flow test'))}</h2>
  <p>${esc(t('cal.flowBody', 'Print a single-wall cube with two perimeters, no top or bottom layers, and your normal line width. Measure the wall in several places with calipers.'))}</p>
  <p><code>${esc(t('cal.flowFormula', 'extrusion multiplier = target wall width ÷ measured wall width'))}</code></p>
  <p>${esc(t('cal.flowExample', 'For a 0.45 mm line width, a measured 0.48 mm wall means 0.45 ÷ 0.48 = 0.94. Set the multiplier to 0.94 and print the cube again to confirm.'))}</p>
  <p class="note">${esc(t('cal.flowNote', 'Change only the multiplier between tests. If the wall varies by more than 0.03 mm, fix mechanical issues (loose belts, a worn nozzle, inconsistent filament diameter) before tuning further.'))}</p>
  ${ABRASIVE.has(f.id) ? `<p>${esc(t('cal.flowAbrasive', 'Use a hardened nozzle for this abrasive filament, or the nozzle will wear and change the result mid-test.'))}</p>` : ''}

  <h2>${esc(t('cal.retractH2', 'Retraction starting points'))}</h2>
  <p>${esc(t('cal.retractBody', 'Print a retraction test with two towers 30 mm apart. Increase the retraction distance in 0.2 mm steps until stringing stops, then back off one step to protect layer adhesion.'))}</p>
  <ul>
    <li>${esc(t('cal.retractDirect', 'Direct drive: 0.6 mm at 30 mm/s.'))}</li>
    <li>${esc(t('cal.retractBowden', 'Bowden: 5 mm at 40 mm/s.'))}</li>
    ${FLEXIBLE.has(f.id) ? `<li>${esc(t('cal.retractTpu', 'Flexible filament: about 0.4 mm on direct drive or 1.5 mm on Bowden, at 20 mm/s.'))}</li>` : ''}
  </ul>
  <p>${esc(t('cal.dimsBody', 'Then print a 20 mm calibration cube and a 10 mm hole. FDM holes usually come out small; add 0.05–0.15 mm of hole compensation rather than scaling the whole part.'))}</p>

  <h2>${esc(t('cal.checkH2', 'When is it good enough?'))}</h2>
  <ul>
    <li>${esc(t('cal.check1', 'The temperature band snaps cleanly and has no stringing.'))}</li>
    <li>${esc(t('cal.check2', 'The measured wall is within 0.02 mm of the line width.'))}</li>
    <li>${esc(t('cal.check3', 'Two towers 30 mm apart print with no visible strings.'))}</li>
    <li>${esc(t('cal.check4', 'A 20 mm cube measures 20.0 ± 0.1 mm.'))}</li>
  </ul>

  <div class="grid cols-2">
    <a class="card link" href="/filaments/${f.id}/"><h3>${esc(t('cal.guideCard', '{name} material guide', { name }))}</h3></a>
    <a class="card link" href="/guides/calibration/"><h3>${esc(t('cal.allMaterials', 'Calibration guides for every material'))}</h3></a>
  </div>

  <h2>${esc(t('cal.toolsH2', 'Tools that help'))}</h2>
  <div class="grid cols-2">
    <a class="card link" href="/tools/flow-calculator/"><h3>${esc(t('tool.flow.short', 'Volumetric flow calculator'))}</h3><p class="muted">${esc(t('cal.toolFlowDesc', 'Check whether your speed exceeds what the hotend can melt.'))}</p></a>
    <a class="card link" href="/tools/cost-calculator/"><h3>${esc(t('tool.cost.short', 'Print cost calculator'))}</h3><p class="muted">${esc(t('cal.toolCostDesc', 'Price the part once the profile is dialled in.'))}</p></a>
  </div>

  <h2>${esc(t('cal.faqH2', 'FAQ'))}</h2>
  <div class="grid cols-2">
    <div class="card"><h3>${esc(t('cal.q.temp', 'What temperature should I print {name} at?', { name }))}</h3><p class="muted">${esc(t('cal.a.temp', 'The usual range is {n0}–{n1} °C. Start in the middle and pick the final value from a temperature tower.', { n0: f.nozzle[0], n1: f.nozzle[1] }))}</p></div>
    <div class="card"><h3>${esc(t('cal.q.flow', 'How do I calibrate flow for {name}?', { name }))}</h3><p class="muted">${esc(t('cal.a.flow', 'Print a single-wall cube, measure the wall with calipers, and set the extrusion multiplier to target width ÷ measured width.'))}</p></div>
    <div class="card"><h3>${esc(t('cal.q.dry', 'Do I need to dry {name} before printing?', { name }))}</h3><p class="muted">${esc(f.drySensitive ? t('cal.a.dryYes', 'Yes. Dry it at {temp} °C for {hours} h — this material absorbs moisture.', { temp: f.dryTemp, hours: f.dryHours }) : t('cal.a.dryNo', 'Not usually. Store it dry, and dry it only if you see stringing, popping or a rough surface.'))}</p></div>
  </div>
</div>`;

  return {
    path,
    html: layout({
      title: t('cal.materialTitle', '{name} temperature tower and flow test', { name }),
      description: t('cal.materialDesc', 'Calibrate {name}: a temperature tower across {n0}–{n1} °C, how to read it, then a flow test to set the extrusion multiplier.', { name, n0: f.nozzle[0], n1: f.nozzle[1] }),
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }, { name: t('cal.indexCrumb', 'Calibration'), path: '/guides/calibration/' }, { name, path }]),
        {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: t('cal.howToName', 'Calibrate {name}: temperature tower and flow test', { name }),
          description: t('cal.howToDesc', 'Find the best printing temperature and set the extrusion multiplier for {name}.', { name }),
          step: [
            { '@type': 'HowToStep', position: 1, text: t('cal.howTo1', 'Print a temperature tower with bands from {n0} to {n1} °C and pick the strongest clean band.', { n0: f.nozzle[0], n1: f.nozzle[1] }) },
            { '@type': 'HowToStep', position: 2, text: t('cal.howTo2', 'Print a single-wall cube and measure the wall with calipers.') },
            { '@type': 'HowToStep', position: 3, text: t('cal.howTo3', 'Set the extrusion multiplier to target width divided by measured width.') },
          ],
        },
        faq([
          { q: t('cal.q.temp', 'What temperature should I print {name} at?', { name }), a: t('cal.a.temp', 'The usual range is {n0}–{n1} °C. Start in the middle and pick the final value from a temperature tower.', { n0: f.nozzle[0], n1: f.nozzle[1] }) },
          { q: t('cal.q.dry', 'Do I need to dry {name} before printing?', { name }), a: f.drySensitive ? t('cal.a.dryYes', 'Yes. Dry it at {temp} °C for {hours} h — this material absorbs moisture.', { temp: f.dryTemp, hours: f.dryHours }) : t('cal.a.dryNo', 'Not usually. Store it dry, and dry it only if you see stringing, popping or a rough surface.') },
        ]),
      ],
    }),
  };
}

// Hub page for /guides/calibration/. It is linked from every material guide's
// breadcrumb and bottom card, so it has to exist as a real page.
function calibrationHub() {
  const path = '/guides/calibration/';
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }, { name: t('cal.indexCrumb', 'Calibration'), path }])}
<div class="wrap">
  <div class="hero">
    <h1>${esc(t('cal.hubH1', 'Calibration by material: 15 temperature tower and flow test guides'))}</h1>
    <p class="lead">${esc(
      t(
        'cal.hubLead',
        'Every material has its own temperature range, moisture sensitivity and enclosure needs, so a preset is only ever a starting point. Here are all 15 common FDM filaments in one two-test routine: a temperature tower first, then a flow test.'
      )
    )}</p>
  </div>

  <h2>${esc(t('cal.hubWhyH2', 'Why calibrate per material'))}</h2>
  <p>${esc(
    t(
      'cal.hubWhyBody',
      'PLA bonding well at 210 °C on your machine does not mean PETG will: PETG usually needs around 240 °C, and ABS or ASA also need a closed chamber to control shrinkage. Print PETG at PLA temperatures and the layers split; print PLA at ABS temperatures and it strings and sags. The datasheet gives you a range — your machine, nozzle and spool decide the point inside it. A temperature tower and a flow test are the cheapest way to find that point, at a cost of a few tens of grams.'
    )
  )}</p>

  <h2>${esc(t('cal.hubHowH2', 'How to use these guides'))}</h2>
  <ol>
    <li>${esc(t('cal.hubHow1', 'Open the guide for your material and set the nozzle and bed from its starting-point table.'))}</li>
    <li>${esc(t('cal.hubHow2', 'Print a five-band temperature tower across the material range and read it for layer adhesion, stringing and surface.'))}</li>
    <li>${esc(t('cal.hubHow3', 'Set the extrusion multiplier with a single-wall cube and calipers, then run a retraction test to remove stringing.'))}</li>
  </ol>
  <p class="note">${esc(t('cal.hubHowNote', 'Change one variable at a time. Fix temperature before flow, or you will not know which change did the work.'))}</p>

  <h2>${esc(t('cal.hubTableH2', 'All materials at a glance'))}</h2>
  <p class="muted">${esc(t('cal.hubTableLead', 'Nozzle and bed are starting ranges; drying is the schedule for moisture-sensitive materials. Open a guide for the full routine.'))}</p>
  <div class="table-scroll"><table>
    <thead><tr><th>${esc(t('cal.thMaterial', 'Material'))}</th><th>${esc(t('cal.thNozzle', 'Nozzle'))}</th><th>${esc(t('cal.thBed', 'Bed'))}</th><th>${esc(t('cal.thDry', 'Drying'))}</th><th>${esc(t('cal.thEnclosure', 'Enclosure'))}</th><th>${esc(t('cal.thGuide', 'Guide'))}</th></tr></thead>
    <tbody>
${filaments
  .map(
    (f) => `      <tr><td><a href="/guides/calibration/${f.id}/">${esc(fname(f))}</a></td><td>${f.nozzle[0]}–${f.nozzle[1]} °C</td><td>${f.bed[0]}–${f.bed[1]} °C</td><td>${f.dryTemp} °C × ${f.dryHours} h</td><td>${f.enclosure ? esc(t('cal.enclosureYes', 'Recommended')) : esc(t('cal.enclosureNo', 'Not required'))}</td><td><a href="/guides/calibration/${f.id}/">${esc(t('cal.guideLink', 'Calibration guide'))} →</a></td></tr>`
  )
  .join('\n')}
    </tbody>
  </table></div>

  <h2>${esc(t('cal.hubCheckH2', 'What a finished calibration looks like'))}</h2>
  <ul>
    <li>${esc(t('cal.hubCheck1', 'The chosen tower band snaps cleanly with no visible stringing and no blobby surface.'))}</li>
    <li>${esc(t('cal.hubCheck2', 'The single-wall cube measures within 0.02 mm of the target line width.'))}</li>
    <li>${esc(t('cal.hubCheck3', 'Two retraction towers 30 mm apart print with no strings, and layer adhesion has not got worse.'))}</li>
  </ul>

  <h2>${esc(t('cal.toolsH2', 'Tools that help'))}</h2>
  <div class="grid cols-3">
    <a class="card link" href="/tools/flow-calculator/"><h3>${esc(t('tool.flow.short', 'Volumetric flow calculator'))}</h3><p class="muted">${esc(t('cal.toolFlowDesc', 'Check whether your speed exceeds what the hotend can melt.'))}</p></a>
    <a class="card link" href="/tools/gcode-analyzer/"><h3>${esc(t('tool.gcode.short', 'G-code analyzer'))}</h3><p class="muted">${esc(t('cal.toolGcodeDesc', 'Read the real filament use and time from a sliced file.'))}</p></a>
    <a class="card link" href="/tools/cost-calculator/"><h3>${esc(t('tool.cost.short', 'Print cost calculator'))}</h3><p class="muted">${esc(t('cal.toolCostDesc', 'Price the part once the profile is dialled in.'))}</p></a>
  </div>

  <h2>${esc(t('cal.hubFaqH2', 'FAQ'))}</h2>
  <div class="grid cols-2">
    <div class="card"><h3>${esc(t('cal.hubQ1', 'Do I need to calibrate every material separately?'))}</h3><p class="muted">${esc(t('cal.hubA1', 'Yes. Temperature, flow and retraction all depend on how the material melts and shrinks, and those differ a lot. When you open a new batch of the same spool, re-checking flow is usually enough.'))}</p></div>
    <div class="card"><h3>${esc(t('cal.hubQ2', 'Can I calibrate flow without calipers?'))}</h3><p class="muted">${esc(t('cal.hubA2', 'You can judge a flow test piece by eye, but calipers get the error under 0.02 mm. It is a cheap tool and worth buying.'))}</p></div>
    <div class="card"><h3>${esc(t('cal.hubQ3', 'How long does a calibration last?'))}</h3><p class="muted">${esc(t('cal.hubA3', 'As long as the spool, unless you change the nozzle or see an extrusion problem. Save the final numbers as a filament preset in your slicer and reuse them.'))}</p></div>
  </div>
</div>`;

  return {
    path,
    html: layout({
      title: t('cal.hubTitle', 'Calibration guides for all 15 filaments — temperature tower and flow test'),
      description: t(
        'cal.hubDesc',
        'A calibration guide for every FDM filament: real nozzle and bed ranges, drying schedules, enclosure needs, and how to read a temperature tower and set the extrusion multiplier.'
      ),
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }, { name: t('cal.indexCrumb', 'Calibration'), path }]),
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('cal.hubH1', 'Calibration by material: 15 temperature tower and flow test guides'),
          description: t('cal.hubDesc', 'A calibration guide for every FDM filament: real nozzle and bed ranges, drying schedules, enclosure needs, and how to read a temperature tower and set the extrusion multiplier.'),
          hasPart: filaments.map((f) => ({
            '@type': 'HowTo',
            name: t('cal.materialH1', '{name} calibration: temperature tower and flow test', { name: fname(f) }),
            url: `${SITE.baseUrl}/guides/calibration/${f.id}/`,
          })),
        },
        faq([
          { q: t('cal.hubQ1', 'Do I need to calibrate every material separately?'), a: t('cal.hubA1', 'Yes. Temperature, flow and retraction all depend on how the material melts and shrinks, and those differ a lot. When you open a new batch of the same spool, re-checking flow is usually enough.') },
          { q: t('cal.hubQ2', 'Can I calibrate flow without calipers?'), a: t('cal.hubA2', 'You can judge a flow test piece by eye, but calipers get the error under 0.02 mm. It is a cheap tool and worth buying.') },
          { q: t('cal.hubQ3', 'How long does a calibration last?'), a: t('cal.hubA3', 'As long as the spool, unless you change the nozzle or see an extrusion problem. Save the final numbers as a filament preset in your slicer and reuse them.') },
        ]),
      ],
    }),
  };
}

function buildGuides() {
  const pages = [];

  pages.push({
    path: '/guides/',
    html: layout({
      title: t('cal.indexTitle', '3D printing calibration guide — temperature tower and flow test'),
      description: t('cal.indexDesc', 'How to calibrate any filament: run a temperature tower across its real range, pick the best band, then dial in flow (extrusion multiplier) and retraction.'),
      path: '/guides/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('cal.indexH1', 'Filament calibration: temperature tower and flow test'))}</h1>
  <p class="lead">${esc(t('cal.indexLead', 'Slicer presets are a starting point. This two-test routine turns a preset into settings that actually work on your machine: a temperature tower for bonding and surface, then a flow test for exact extrusion.'))}</p></div>

  <h2>${esc(t('cal.beforeH2', 'Before you start'))}</h2>
  <p>${esc(t('cal.beforeBody', 'Dry the filament if it is moisture-sensitive, check that the nozzle is clean and the plate is level, and set flow to 1.00 with cooling at your normal value. Change one variable at a time, or the tower will not tell you anything.'))}</p>

  <h2>${esc(t('cal.materialsH2', 'Material-by-material starting points'))}</h2>
  <p class="muted">${esc(t('cal.materialsLead', "Each guide uses that material's real temperature range, drying schedule and enclosure needs."))}</p>
  <div class="grid cols-3">
${filaments.map((f) => `    <a class="card link" href="/guides/calibration/${f.id}/"><h3>${esc(fname(f))}</h3><p class="muted tiny">${f.nozzle[0]}–${f.nozzle[1]} °C · ${f.bed[0]}–${f.bed[1]} °C bed · dry ${f.dryTemp} °C/${f.dryHours} h</p></a>`).join('\n')}
  </div>
  <p><a href="/guides/calibration/">${esc(t('cal.allMaterials', 'Calibration guides for every material'))} →</a></p>

  <h2>${esc(t('cal.toolsH2', 'Tools that help'))}</h2>
  <div class="grid cols-3">
    <a class="card link" href="/tools/flow-calculator/"><h3>${esc(t('tool.flow.short', 'Volumetric flow calculator'))}</h3><p class="muted">${esc(t('cal.toolFlowDesc', 'Check whether your speed exceeds what the hotend can melt.'))}</p></a>
    <a class="card link" href="/tools/gcode-analyzer/"><h3>${esc(t('tool.gcode.short', 'G-code analyzer'))}</h3><p class="muted">${esc(t('cal.toolGcodeDesc', 'Read the real filament use and time from a sliced file.'))}</p></a>
    <a class="card link" href="/tools/cost-calculator/"><h3>${esc(t('tool.cost.short', 'Print cost calculator'))}</h3><p class="muted">${esc(t('cal.toolCostDesc', 'Price the part once the profile is dialled in.'))}</p></a>
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.guides', 'Guides'), path: '/guides/' }])],
    }),
  });

  pages.push(calibrationHub());

  filaments.forEach((f) => pages.push(materialGuide(f)));
  return pages;
}

module.exports = { buildGuides, bands };

const { esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr } = require('../lib/i18n');
const { printers, byId: pById } = require('../data/printers');
const { filaments, byId: fById } = require('../data/filaments');
const { materialFit } = require('./printers');

// Translated material name (printer names are brand names and stay as-is).
const fname = (f) => tr('filaments', f.id, 'name', f.name);

const SPEED = { pla: 100, 'pla-plus': 100, petg: 60, abs: 50, asa: 50, tpu: 25, 'tpu-95a': 30, nylon: 50, pc: 40, hips: 50, pva: 40, 'pla-cf': 60, 'petg-cf': 50, 'pa-cf': 40, 'wood-pla': 50 };
const FAN = { pla: 100, 'pla-plus': 100, petg: 50, abs: 10, asa: 10, tpu: 30, 'tpu-95a': 30, nylon: 20, pc: 10, hips: 10, pva: 40, 'pla-cf': 80, 'petg-cf': 40, 'pa-cf': 20, 'wood-pla': 80 };

function settingsFor(p, f) {
  const speed = Math.min(SPEED[f.id] || 60, p.maxSpeed);
  let retract, retractSpeed;
  if (f.id === 'tpu' || f.id === 'tpu-95a') {
    retract = p.directDrive ? 0.4 : 1.5;
    retractSpeed = 20;
  } else if (p.directDrive) {
    retract = 0.6;
    retractSpeed = 30;
  } else {
    retract = 5;
    retractSpeed = 40;
  }
  const nozzle = Math.round((f.nozzle[0] + f.nozzle[1]) / 2);
  const bed = Math.round((f.bed[0] + f.bed[1]) / 2);
  const notes = [];
  if (!p.enclosure && f.enclosure) notes.push(t('set.note.enclosure', 'This material normally wants an enclosure. On an open machine, add a brim, disable cooling and avoid draughts — or expect warping.'));
  if (!p.directDrive && (f.id === 'tpu' || f.id === 'tpu-95a')) notes.push(t('set.note.bowdenTpu', 'Bowden extruders struggle with flexible filament. Keep the retraction tiny, slow the print right down, and consider a direct-drive upgrade.'));
  if (p.directDrive && (f.id === 'tpu' || f.id === 'tpu-95a')) notes.push(t('set.note.directTpu', 'Direct drive makes TPU much easier. Keep retraction under 0.5 mm and print slowly.'));
  if (f.id === 'petg') notes.push(t('set.note.petg', 'PETG strings easily and can fuse to smooth PEI. Use a textured plate or a release agent, and tune retraction.'));
  if (['abs', 'asa', 'pc', 'nylon', 'pa-cf'].includes(f.id)) notes.push(t('set.note.shrink', 'High-shrinkage material: keep the chamber warm and steady, and never open the door mid-print.'));
  if (f.drySensitive) notes.push(t('set.note.dry', '{name} absorbs moisture. Dry it at {temp} °C for {hours} h before a long print.', { name: fname(f), temp: f.dryTemp, hours: f.dryHours }));
  if (p.maxSpeed < 60) notes.push(t('set.note.slow', 'This is a slower machine — the speeds below already account for it. Do not push much past them without input shaping.'));
  return { speed, retract, retractSpeed, nozzle, bed, fan: FAN[f.id] || 50, notes };
}

// "direct drive" / "Bowden" as a descriptive word (lower case, used mid-sentence).
const driveWord = (p) => (p.directDrive ? t('set.drive.direct', 'direct drive') : t('set.drive.bowden', 'Bowden'));
const frameWord = (p) => (p.enclosure ? t('set.frame.enclosed', 'enclosed') : t('set.frame.open', 'open frame'));

function comboPage(p, f, fit) {
  const path = `/settings/${p.id}/${f.id}/`;
  const name = fname(f);
  const s = settingsFor(p, f);
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }, { name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(t('set.h1', '{material} settings for the {printer}', { material: name, printer: p.name }))}</h1>
    <p class="lead">${esc(t('set.lead', 'A starting profile for printing {material} on the {printer} ({build} mm, {frame}, {drive}). Tune from here with a temperature tower and a flow test.', { material: name, printer: p.name, build: p.build.join(' × '), frame: frameWord(p), drive: driveWord(p) }))}</p>
  </div>

  <div class="tool">
    <div class="table-scroll"><table>
      <thead><tr><th>${esc(t('set.tableSetting', 'Setting'))}</th><th>${esc(t('set.tableValue', 'Starting value'))}</th></tr></thead>
      <tbody>
        <tr><td>${esc(t('set.nozzleTemp', 'Nozzle temperature'))}</td><td>${f.nozzle[0]}–${f.nozzle[1]} °C <span class="muted">${esc(t('set.start', '(start {v})', { v: s.nozzle }))}</span></td></tr>
        <tr><td>${esc(t('set.bedTemp', 'Bed temperature'))}</td><td>${f.bed[0]}–${f.bed[1]} °C <span class="muted">${esc(t('set.start', '(start {v})', { v: s.bed }))}</span></td></tr>
        <tr><td>${esc(t('set.printSpeed', 'Print speed'))}</td><td>${s.speed} mm/s</td></tr>
        <tr><td>${esc(t('set.firstLayer', 'First layer speed'))}</td><td>20 mm/s</td></tr>
        <tr><td>${esc(t('set.layerHeight', 'Layer height'))}</td><td>0.2 mm (${f.id.includes('cf') || f.id === 'wood-pla' ? '0.2–0.28' : '0.12–0.28'})</td></tr>
        <tr><td>${esc(t('set.retractionDist', 'Retraction distance'))}</td><td>${s.retract} mm</td></tr>
        <tr><td>${esc(t('set.retractionSpeed', 'Retraction speed'))}</td><td>${s.retractSpeed} mm/s</td></tr>
        <tr><td>${esc(t('set.fan', 'Part cooling fan'))}</td><td>${s.fan}%</td></tr>
        <tr><td>${esc(t('set.enclosureLabel', 'Enclosure'))}</td><td>${f.enclosure ? (p.enclosure ? esc(t('set.closeDoor', 'Close the door')) : esc(t('set.notAvailable', 'Not available — see notes'))) : esc(t('set.open', 'Open'))}</td></tr>
        <tr><td>${esc(t('set.drying', 'Drying before use'))}</td><td>${f.dryTemp} °C for ${f.dryHours} h</td></tr>
      </tbody>
    </table></div>
    <p class="note">${s.notes.length ? s.notes.join(' ') : t('set.matched', "This is a well-matched combination: the printer meets the material's requirements without compromise.")}</p>
  </div>

  <h2>${esc(t('set.whyH2', 'Why these values'))}</h2>
  <p>${esc(t('set.whyP1', 'The {printer} is {driveClause}. Its usable speed is around {maxSpeed} mm/s, so the {speed} mm/s above is {speedClause}.', { printer: p.name, driveClause: p.directDrive ? t('set.why.driveDirect', 'a direct-drive machine, so retraction can stay short (around 0.6 mm)') : t('set.why.driveBowden', 'a Bowden machine, so it needs longer retraction (around 5 mm) to relieve nozzle pressure'), maxSpeed: p.maxSpeed, speed: s.speed, speedClause: s.speed < SPEED[f.id] ? t('set.why.capped', 'capped to what the machine handles comfortably') : t('set.why.within', 'within the comfortable range for this material') }))}</p>
  <p>${esc(t('set.whyP2', 'Cooling is set to {fan}%: {fanClause}.', { fan: s.fan, fanClause: s.fan >= 80 ? t('set.why.fanHigh', 'this material needs strong cooling for detail and overhangs') : s.fan <= 20 ? t('set.why.fanLow', 'this material bonds poorly when cooled too fast, so the fan stays low') : t('set.why.fanMid', 'a middle setting balances surface quality against layer bonding') }))}</p>

  <h2>${esc(t('set.nextH2', 'Next steps'))}</h2>
  <ul>
    <li>${esc(t('set.next1', 'Print a temperature tower across {n0}–{n1} °C and pick the cleanest band.', { n0: f.nozzle[0], n1: f.nozzle[1] }))}</li>
    <li>${t('set.next2', 'Calibrate flow, then check the {flowTool} against your hotend.', { flowTool: `<a href="/tools/flow-calculator/">${esc(t('tool.flow.short', 'volumetric flow'))}</a>` })}</li>
    <li>${t('set.next3', 'If something goes wrong, see the {tbTool}.', { tbTool: `<a href="/troubleshooting/">${esc(t('nav.troubleshooting', 'troubleshooting guide'))}</a>` })}</li>
    <li>${t('set.next4', 'Price the part with the {costTool}.', { costTool: `<a href="/tools/cost-calculator/">${esc(t('tool.cost.short', 'cost calculator'))}</a>` })}</li>
    <li>${t('set.next5', 'Calibrate the filament with the {calTool}.', { calTool: `<a href="/guides/calibration/${f.id}/">${esc(t('cal.linkText', 'calibration guide'))}</a>` })}</li>
  </ul>

  <div class="grid cols-2">
    <a class="card link" href="/filaments/${f.id}/"><h3>${esc(t('set.guideCard', '{material} material guide', { material: name }))}</h3></a>
    <a class="card link" href="/printers/${p.id}/"><h3>${esc(t('set.overviewCard', '{printer} overview', { printer: p.name }))}</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: t('set.title', '{material} settings for {printer} — temperatures, speed and retraction', { material: name, printer: p.name }),
      description: t('set.desc', 'Starting {material} settings for the {printer}: nozzle and bed temperature, print speed, retraction, cooling and drying. Tuned for its {frame} {drive} setup.', { material: name, printer: p.name, frame: frameWord(p), drive: driveWord(p) }),
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }, { name, path }]),
        faq([
          { q: t('set.q.nozzle', 'What nozzle temperature should I use for {material} on the {printer}?', { material: name, printer: p.name }), a: t('set.a.nozzle', 'Start at {nozzle} °C, within the {n0}–{n1} °C range for {material}, and adjust with a temperature tower.', { nozzle: s.nozzle, n0: f.nozzle[0], n1: f.nozzle[1], material: name }) },
          { q: t('set.q.retract', 'What retraction for {material} on the {printer}?', { material: name, printer: p.name }), a: t('set.a.retract', '{retract} mm at {speed} mm/s, because this printer uses a {drive} extruder.', { retract: s.retract, speed: s.retractSpeed, drive: driveWord(p) }) },
        ]),
      ],
    }),
  };
}

function buildSettings() {
  const pages = [];
  pages.push({
    path: '/settings/',
    html: layout({
      title: t('set.indexTitle', '3D printer settings by machine — starting profiles for every material'),
      description: t('set.indexDesc', 'Starting slicer settings for every popular printer and filament combination: temperatures, speed, retraction and cooling, tuned to each machine.'),
      path: '/settings/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('set.indexH1', 'Settings by printer'))}</h1>
  <p class="lead">${esc(t('set.indexLead', 'Pick your machine to get starting profiles for every filament it can print.'))}</p></div>
  <div class="grid cols-3">
${printers.map((p) => `    <a class="card link" href="/settings/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? esc(t('set.enclosed', 'Enclosed')) : esc(t('set.open', 'Open'))}</p></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }])],
    }),
  });

  printers.forEach((p) => {
    const fit = materialFit(p);
    const all = fit.good.concat(fit.possible);
    pages.push({
      path: `/settings/${p.id}/`,
      html: layout({
        title: t('set.printerTitle', '{printer} settings — every material', { printer: p.name }),
        description: t('set.printerDesc', 'Starting settings for every filament you can print on the {printer}: nozzle and bed temperatures, speed, retraction and cooling.', { printer: p.name }),
        path: `/settings/${p.id}/`,
        body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px"><h1>${esc(t('set.printerH1', '{printer} settings', { printer: p.name }))}</h1>
  <p class="lead">${esc(t('set.printerLead', 'Starting profiles for each material the {printer} can print. Values assume a {nozzle} mm nozzle.', { printer: p.name, nozzle: p.nozzle }))}</p></div>
  <div class="table-scroll"><table>
    <thead><tr><th>${esc(t('set.colMaterial', 'Material'))}</th><th class="num">${esc(t('set.colNozzle', 'Nozzle'))}</th><th class="num">${esc(t('set.colBed', 'Bed'))}</th><th class="num">${esc(t('set.colSpeed', 'Speed'))}</th><th class="num">${esc(t('set.colRetraction', 'Retraction'))}</th><th class="num">${esc(t('set.colFan', 'Fan'))}</th></tr></thead>
    <tbody>
${all
          .map((f) => {
            const s = settingsFor(p, f);
            return `      <tr><td><a href="/settings/${p.id}/${f.id}/">${esc(fname(f))}</a></td><td class="num">${s.nozzle} °C</td><td class="num">${s.bed} °C</td><td class="num">${s.speed} mm/s</td><td class="num">${s.retract} mm</td><td class="num">${s.fan}%</td></tr>`;
          })
          .join('\n')}
    </tbody>
  </table></div>
</div>`,
        jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.settings', 'Settings'), path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }])],
      }),
    });
    all.forEach((f) => pages.push(comboPage(p, f, fit)));
  });
  return pages;
}

module.exports = { buildSettings, settingsFor };

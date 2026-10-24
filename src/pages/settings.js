const { esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { printers, byId: pById } = require('../data/printers');
const { filaments, byId: fById } = require('../data/filaments');
const { materialFit } = require('./printers');

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
  if (!p.enclosure && f.enclosure) notes.push('This material normally wants an enclosure. On an open machine, add a brim, disable cooling and avoid draughts — or expect warping.');
  if (!p.directDrive && (f.id === 'tpu' || f.id === 'tpu-95a')) notes.push('Bowden extruders struggle with flexible filament. Keep the retraction tiny, slow the print right down, and consider a direct-drive upgrade.');
  if (p.directDrive && (f.id === 'tpu' || f.id === 'tpu-95a')) notes.push('Direct drive makes TPU much easier. Keep retraction under 0.5 mm and print slowly.');
  if (f.id === 'petg') notes.push('PETG strings easily and can fuse to smooth PEI. Use a textured plate or a release agent, and tune retraction.');
  if (['abs', 'asa', 'pc', 'nylon', 'pa-cf'].includes(f.id)) notes.push('High-shrinkage material: keep the chamber warm and steady, and never open the door mid-print.');
  if (f.drySensitive) notes.push(`${f.name} absorbs moisture. Dry it at ${f.dryTemp} °C for ${f.dryHours} h before a long print.`);
  if (p.maxSpeed < 60) notes.push('This is a slower machine — the speeds below already account for it. Do not push much past them without input shaping.');
  return { speed, retract, retractSpeed, nozzle, bed, fan: FAN[f.id] || 50, notes };
}

function comboPage(p, f, fit) {
  const path = `/settings/${p.id}/${f.id}/`;
  const s = settingsFor(p, f);
  const body = `${crumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }, { name: f.name, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(f.name)} settings for the ${esc(p.name)}</h1>
    <p class="lead">A starting profile for printing ${esc(f.name)} on the ${esc(p.name)} (${p.build[0]} × ${p.build[1]} × ${p.build[2]} mm, ${p.enclosure ? 'enclosed' : 'open frame'}, ${p.directDrive ? 'direct drive' : 'Bowden'}). Tune from here with a temperature tower and a flow test.</p>
  </div>

  <div class="tool">
    <div class="table-scroll"><table>
      <thead><tr><th>Setting</th><th>Starting value</th></tr></thead>
      <tbody>
        <tr><td>Nozzle temperature</td><td>${f.nozzle[0]}–${f.nozzle[1]} °C <span class="muted">(start ${s.nozzle})</span></td></tr>
        <tr><td>Bed temperature</td><td>${f.bed[0]}–${f.bed[1]} °C <span class="muted">(start ${s.bed})</span></td></tr>
        <tr><td>Print speed</td><td>${s.speed} mm/s</td></tr>
        <tr><td>First layer speed</td><td>20 mm/s</td></tr>
        <tr><td>Layer height</td><td>0.2 mm (${f.id.includes('cf') || f.id === 'wood-pla' ? '0.2–0.28' : '0.12–0.28'})</td></tr>
        <tr><td>Retraction distance</td><td>${s.retract} mm</td></tr>
        <tr><td>Retraction speed</td><td>${s.retractSpeed} mm/s</td></tr>
        <tr><td>Part cooling fan</td><td>${s.fan}%</td></tr>
        <tr><td>Enclosure</td><td>${f.enclosure ? (p.enclosure ? 'Close the door' : 'Not available — see notes') : 'Open'}</td></tr>
        <tr><td>Drying before use</td><td>${f.dryTemp} °C for ${f.dryHours} h</td></tr>
      </tbody>
    </table></div>
    <p class="note">${s.notes.length ? s.notes.join(' ') : "This is a well-matched combination: the printer meets the material's requirements without compromise."}</p>
  </div>

  <h2>Why these values</h2>
  <p>The ${esc(p.name)} is ${p.directDrive ? 'a direct-drive machine, so retraction can stay short (around 0.6 mm)' : 'a Bowden machine, so it needs longer retraction (around 5 mm) to relieve nozzle pressure'}. Its usable speed is around ${p.maxSpeed} mm/s, so the ${s.speed} mm/s above is ${s.speed < SPEED[f.id] ? 'capped to what the machine handles comfortably' : 'within the comfortable range for this material'}.</p>
  <p>Cooling is set to ${s.fan}%: ${s.fan >= 80 ? 'this material needs strong cooling for detail and overhangs' : s.fan <= 20 ? 'this material bonds poorly when cooled too fast, so the fan stays low' : 'a middle setting balances surface quality against layer bonding'}.</p>

  <h2>Next steps</h2>
  <ul>
    <li>Print a temperature tower across ${f.nozzle[0]}–${f.nozzle[1]} °C and pick the cleanest band.</li>
    <li>Calibrate flow, then check the <a href="/tools/flow-calculator/">volumetric flow</a> against your hotend.</li>
    <li>If something goes wrong, see the <a href="/troubleshooting/">troubleshooting guide</a>.</li>
    <li>Price the part with the <a href="/tools/cost-calculator/">cost calculator</a>.</li>
  </ul>

  <div class="grid cols-2">
    <a class="card link" href="/filaments/${f.id}/"><h3>${esc(f.name)} material guide</h3></a>
    <a class="card link" href="/printers/${p.id}/"><h3>${esc(p.name)} overview</h3></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${f.name} settings for ${p.name} — temperatures, speed and retraction`,
      description: `Starting ${f.name} settings for the ${p.name}: nozzle and bed temperature, print speed, retraction, cooling and drying. Tuned for its ${p.enclosure ? 'enclosed' : 'open'} ${p.directDrive ? 'direct-drive' : 'Bowden'} setup.`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }, { name: f.name, path }]),
        faq([
          { q: `What nozzle temperature should I use for ${f.name} on the ${p.name}?`, a: `Start at ${s.nozzle} °C, within the ${f.nozzle[0]}–${f.nozzle[1]} °C range for ${f.name}, and adjust with a temperature tower.` },
          { q: `What retraction for ${f.name} on the ${p.name}?`, a: `${s.retract} mm at ${s.retractSpeed} mm/s, because this printer uses a ${p.directDrive ? 'direct-drive' : 'Bowden'} extruder.` },
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
      title: '3D printer settings by machine — starting profiles for every material',
      description:
        'Starting slicer settings for every popular printer and filament combination: temperatures, speed, retraction and cooling, tuned to each machine.',
      path: '/settings/',
      body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }])}
<div class="wrap">
  <div class="hero"><h1>Settings by printer</h1>
  <p class="lead">Pick your machine to get starting profiles for every filament it can print.</p></div>
  <div class="grid cols-3">
${printers.map((p) => `    <a class="card link" href="/settings/${p.id}/"><h3>${esc(p.name)}</h3><p class="muted tiny">${p.build.join('×')} mm · ${p.enclosure ? 'Enclosed' : 'Open'}</p></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }])],
    }),
  });

  printers.forEach((p) => {
    const fit = materialFit(p);
    const all = fit.good.concat(fit.possible);
    pages.push({
      path: `/settings/${p.id}/`,
      html: layout({
        title: `${p.name} settings — every material`,
        description: `Starting settings for every filament you can print on the ${p.name}: nozzle and bed temperatures, speed, retraction and cooling.`,
        path: `/settings/${p.id}/`,
        body: `${crumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px"><h1>${esc(p.name)} settings</h1>
  <p class="lead">Starting profiles for each material the ${esc(p.name)} can print. Values assume a ${p.nozzle} mm nozzle.</p></div>
  <div class="table-scroll"><table>
    <thead><tr><th>Material</th><th class="num">Nozzle</th><th class="num">Bed</th><th class="num">Speed</th><th class="num">Retraction</th><th class="num">Fan</th></tr></thead>
    <tbody>
${all
          .map((f) => {
            const s = settingsFor(p, f);
            return `      <tr><td><a href="/settings/${p.id}/${f.id}/">${esc(f.name)}</a></td><td class="num">${s.nozzle} °C</td><td class="num">${s.bed} °C</td><td class="num">${s.speed} mm/s</td><td class="num">${s.retract} mm</td><td class="num">${s.fan}%</td></tr>`;
          })
          .join('\n')}
    </tbody>
  </table></div>
</div>`,
        jsonLd: [breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Settings', path: '/settings/' }, { name: p.name, path: `/settings/${p.id}/` }])],
      }),
    });
    all.forEach((f) => pages.push(comboPage(p, f, fit)));
  });
  return pages;
}

module.exports = { buildSettings, settingsFor };

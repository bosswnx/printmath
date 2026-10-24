const { esc } = require('./site');

function crumbs(items) {
  // items: [{name, path}] — last has no link
  const parts = items.map((it, i) => {
    if (i === items.length - 1) return `<span>${esc(it.name)}</span>`;
    return `<a href="${esc(it.path)}">${esc(it.name)}</a>`;
  });
  return `<nav class="crumbs wrap" aria-label="Breadcrumb">${parts.join(' <span aria-hidden="true">/</span> ')}</nav>`;
}

function diffPill(d) {
  const map = { 1: ['ok', 'Easy'], 2: ['ok', 'Moderate'], 3: ['warn', 'Tricky'], 4: ['warn', 'Hard'], 5: ['bad', 'Expert'] };
  const [tone, label] = map[d] || map[3];
  return `<span class="pill ${tone}">${label}</span>`;
}

function meter(value, max) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return `<span class="bar" style="display:block"><span style="width:${pct}%"></span></span>`;
}

function materialCards(filaments) {
  return `<div class="grid cols-3">
${filaments
    .map(
      (f) => `  <a class="card link" href="/filaments/${f.id}/">
    <div class="kicker">${esc(f.name)}</div>
    <h3>${esc(f.summary.split('.')[0])}</h3>
    <p class="muted tiny">Nozzle ${f.nozzle[0]}–${f.nozzle[1]} °C · Bed ${f.bed[0]}–${f.bed[1]} °C · ${f.density} g/cm³</p>
    <p>${diffPill(f.difficulty)} ${f.enclosure ? '<span class="pill warn">Enclosure</span>' : '<span class="pill ok">Open frame OK</span>'}</p>
  </a>`
    )
    .join('\n')}
</div>`;
}

module.exports = { crumbs, diffPill, meter, materialCards };

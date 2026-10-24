const { esc } = require('./site');
const { t, tr } = require('./i18n');

function crumbs(items) {
  // items: [{name, path}] — last has no link
  const parts = items.map((it, i) => {
    if (i === items.length - 1) return `<span>${esc(it.name)}</span>`;
    return `<a href="${esc(it.path)}">${esc(it.name)}</a>`;
  });
  return `<nav class="crumbs wrap" aria-label="Breadcrumb">${parts.join(' <span aria-hidden="true">/</span> ')}</nav>`;
}

function diffPill(d) {
  const map = {
    1: ['ok', t('diff.1', 'Easy')],
    2: ['ok', t('diff.2', 'Moderate')],
    3: ['warn', t('diff.3', 'Tricky')],
    4: ['warn', t('diff.4', 'Hard')],
    5: ['bad', t('diff.5', 'Expert')],
  };
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
    .map((f) => {
      const name = tr('filaments', f.id, 'name', f.name);
      const summary = tr('filaments', f.id, 'summary', f.summary);
      return `  <a class="card link" href="/filaments/${f.id}/">
    <div class="kicker">${esc(name)}</div>
    <h3>${esc(summary.split('。')[0].split('.')[0])}</h3>
    <p class="muted tiny">${f.nozzle[0]}–${f.nozzle[1]} °C · ${f.bed[0]}–${f.bed[1]} °C · ${f.density} g/cm³</p>
    <p>${diffPill(f.difficulty)} ${f.enclosure ? `<span class="pill warn">${esc(t('fl.enclosureNeeded', 'Enclosure'))}</span>` : `<span class="pill ok">${esc(t('fl.openOk', 'Open frame OK'))}</span>`}</p>
  </a>`;
    })
    .join('\n')}
</div>`;
}

module.exports = { crumbs, diffPill, meter, materialCards };

const { SITE, esc, layout, breadcrumbs, faq } = require('../lib/site');
const { crumbs } = require('../lib/ui');
const { t, tr, trList } = require('../lib/i18n');
const { symptoms } = require('../data/symptoms');

const shortName = (name) => name.split(/[(（]/)[0].trim();

function severityPill(s) {
  const map = {
    1: ['ok', t('tb.sev.quick', 'Quick fix')],
    2: ['ok', t('tb.sev.easy', 'Easy')],
    3: ['warn', t('tb.sev.tuning', 'Needs tuning')],
    4: ['bad', t('tb.sev.killer', 'Print-killer')],
  };
  const [tone, label] = map[s] || map[2];
  return `<span class="pill ${tone}">${label}</span>`;
}

function symptomPage(s) {
  const path = `/troubleshooting/${s.id}/`;
  const name = tr('symptoms', s.id, 'name', s.name);
  const looks = tr('symptoms', s.id, 'looks', s.looks);
  const causes = trList('symptoms', s.id, 'causes', s.causes);
  const fixes = trList('symptoms', s.id, 'fixes', s.fixes);
  const title = shortName(name);
  const related = symptoms.filter((x) => x.id !== s.id && x.causes.some((c) => s.causes.includes(c))).slice(0, 4);
  const body = `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.troubleshooting', 'Troubleshooting'), path: '/troubleshooting/' }, { name: title, path }])}
<div class="wrap">
  <div class="hero" style="padding-bottom:10px">
    <h1>${esc(name)}</h1>
    <p class="lead">${esc(looks)}</p>
    <p>${severityPill(s.severity)} ${s.aka.map((a) => `<span class="pill">${esc(a)}</span>`).join(' ')}</p>
  </div>

  <h2>${esc(t('tb.likelyCauses', 'Likely causes'))}</h2>
  <ol>${causes.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>

  <h2>${esc(t('tb.howToFix', 'How to fix it'))}</h2>
  <ol>${fixes.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>

  <div class="card premium">
    <div class="kicker">${esc(t('tb.inOrder', 'Work through it in order'))}</div>
    <h3>${esc(t('tb.fastestPath', 'The fastest path to a fix'))}</h3>
    <p class="muted">${esc(t('tb.fastestPathBody', 'Change one thing at a time and print a small test. Start with the first fix listed — it is the most common cause.'))}</p>
  </div>

  ${related.length ? `<h2>${esc(t('tb.relatedProblems', 'Related problems'))}</h2>
  <div class="grid cols-2">
${related.map((r) => `    <a class="card link" href="/troubleshooting/${r.id}/"><h3>${esc(shortName(tr('symptoms', r.id, 'name', r.name)))}</h3><p class="muted tiny">${esc(tr('symptoms', r.id, 'looks', r.looks).slice(0, 80))}…</p></a>`).join('\n')}
  </div>` : ''}

  <h2>${esc(t('tb.toolsThatHelp', 'Tools that help'))}</h2>
  <div class="grid cols-2">
    <a class="card link" href="/tools/gcode-analyzer/"><h3>${esc(t('tool.gcode.short', 'G-code analyzer'))}</h3><p class="muted">${esc(t('tb.toolGcode', 'Check the actual filament use and time of a failed print.'))}</p></a>
    <a class="card link" href="/tools/flow-calculator/"><h3>${esc(t('tool.flow.short', 'Flow calculator'))}</h3><p class="muted">${esc(t('tb.toolFlow', 'Rule out a hotend limit behind under-extrusion.'))}</p></a>
  </div>
</div>`;
  return {
    path,
    html: layout({
      title: `${title} — ${t('tb.pageSuffix', '3D printing troubleshooting')}`,
      description: `${name}: ${t('tb.descTail', 'what it looks like, the usual causes and how to fix it.')}`,
      path,
      body,
      jsonLd: [
        breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.troubleshooting', 'Troubleshooting'), path: '/troubleshooting/' }, { name: title, path }]),
        faq([
          { q: t('tb.q.cause', 'What causes this in 3D printing?'), a: causes.slice(0, 3).join('; ') + '.' },
          { q: t('tb.q.fix', 'How do I fix it?'), a: fixes.slice(0, 3).join(' ') },
        ]),
      ],
    }),
  };
}

function buildTroubleshooting() {
  const pages = [];
  pages.push({
    path: '/troubleshooting/',
    html: layout({
      title: t('tb.title', '3D printing troubleshooting guide — every common defect'),
      description: t('tb.desc', 'Fix stringing, warping, layer shifting, under-extrusion, blobs, elephant foot, ringing and more.'),
      path: '/troubleshooting/',
      body: `${crumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.troubleshooting', 'Troubleshooting'), path: '/troubleshooting/' }])}
<div class="wrap">
  <div class="hero"><h1>${esc(t('tb.h1', '3D printing troubleshooting'))}</h1>
  <p class="lead">${esc(t('tb.leadCount', '{n} print defects, what each one looks like, and the fixes ranked by how often they are the real cause.', { n: symptoms.length }))}</p></div>
  <div class="grid cols-2">
${symptoms.map((s) => `    <a class="card link" href="/troubleshooting/${s.id}/"><h3>${esc(shortName(tr('symptoms', s.id, 'name', s.name)))}</h3><p class="muted tiny">${esc(tr('symptoms', s.id, 'looks', s.looks).slice(0, 90))}…</p></a>`).join('\n')}
  </div>
</div>`,
      jsonLd: [breadcrumbs([{ name: t('common.home', 'Home'), path: '/' }, { name: t('nav.troubleshooting', 'Troubleshooting'), path: '/troubleshooting/' }])],
    }),
  });
  symptoms.forEach((s) => pages.push(symptomPage(s)));
  return pages;
}

module.exports = { buildTroubleshooting };

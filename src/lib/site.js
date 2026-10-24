// Site shell: <head>, nav, footer, and structured-data helpers.

// Deployment-aware config. Set SITE_URL / BASE_PATH to deploy under a subpath
// (e.g. GitHub Pages project sites) without changing any link code.
const SITE_URL = (process.env.SITE_URL || 'https://printmath.io').replace(/\/$/, '');
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');

const SITE = {
  name: 'PrintMath',
  domain: new URL(SITE_URL).host,
  baseUrl: SITE_URL,
  basePath: BASE_PATH,
  tagline: '3D printing calculators, settings and fixes',
  description:
    'Free 3D printing calculators and reference tools: print cost, filament use, spool remaining, and a full FDM troubleshooting guide.',
  email: 'hello@printmath.io',
  year: new Date().getFullYear(),
};

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const attr = esc;

function nav() {
  const items = [
    ['/tools/', 'Tools'],
    ['/filaments/', 'Filaments'],
    ['/printers/', 'Printers'],
    ['/settings/', 'Settings'],
    ['/troubleshooting/', 'Troubleshooting'],
  ];
  return `<header class="site-head">
  <div class="wrap head-inner">
    <a class="brand" href="/">
      <span class="brand-mark" aria-hidden="true"></span>
      <span>${esc(SITE.name)}</span>
    </a>
    <nav class="site-nav" aria-label="Main">
      ${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('\n      ')}
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-cols">
      <div>
        <div class="brand small"><span class="brand-mark" aria-hidden="true"></span> ${esc(SITE.name)}</div>
        <p class="muted">${esc(SITE.tagline)}. Values are starting points — always verify with a test print.</p>
      </div>
      <div>
        <h4>Tools</h4>
        <a href="/tools/cost-calculator/">Print cost calculator</a>
        <a href="/tools/gcode-analyzer/">G-code analyzer</a>
        <a href="/tools/filament-length/">Filament length &amp; weight</a>
        <a href="/tools/spool-remaining/">Spool remaining</a>
        <a href="/tools/">All tools</a>
      </div>
      <div>
        <h4>Reference</h4>
        <a href="/filaments/">Filament guide</a>
        <a href="/printers/">Printer database</a>
        <a href="/settings/">Settings by printer</a>
        <a href="/troubleshooting/">Troubleshooting</a>
      </div>
      <div>
        <h4>Site</h4>
        <a href="/about/">About</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
        <a href="mailto:${attr(SITE.email)}">Contact</a>
      </div>
    </div>
    <p class="muted tiny">© ${SITE.year} ${esc(SITE.name)}. Not affiliated with any printer manufacturer. As an Amazon Associate we may earn from qualifying purchases.</p>
  </div>
</footer>`;
}

function layout({ title, description, path = '/', body = '', jsonLd = [], noindex = false, head = '' }) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const url = `${SITE.baseUrl}${path}`;
  const desc = description || SITE.description;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${attr(desc)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<link rel="canonical" href="${attr(url)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${attr(fullTitle)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${attr(url)}">
<meta property="og:site_name" content="${attr(SITE.name)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.baseUrl}/search/?q={query}`,
      'query-input': 'required name=query',
    },
  })}</script>
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
${head}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${nav()}
<main id="main">
${body}
</main>
${footer()}
<script src="/app.js" defer></script>
</body>
</html>`;
}

// Breadcrumb JSON-LD from [{name, path}]
function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.baseUrl}${it.path}`,
    })),
  };
}

function faq(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

module.exports = { SITE, esc, attr, layout, nav, footer, breadcrumbs, faq };

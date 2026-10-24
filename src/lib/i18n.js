// Minimal i18n. The current language is a module-level value set by the build
// before each language pass, so page builders call t()/tr() without threading a
// language parameter through every function.
//
// English lives inline in the templates as fallbacks; Chinese lives in i18n/zh.js.
// Anything not yet translated simply falls back to English, so partial translation
// is always safe to ship.

const zh = require('../i18n/zh');

const LANGS = ['en', 'zh'];
const HTML_LANG = { en: 'en', zh: 'zh-Hans' };
const DICTS = { zh };

let CURRENT = 'en';

function setLang(l) {
  CURRENT = LANGS.includes(l) ? l : 'en';
}
function lang() {
  return CURRENT;
}
function isDefault() {
  return CURRENT === 'en';
}

// UI string. English is the fallback text passed in.
function t(key, en) {
  const d = DICTS[CURRENT];
  if (d && d.ui && d.ui[key] != null) return d.ui[key];
  return en != null ? en : key;
}

// Data translation: tr('symptoms', 'stringing', 'looks', englishFallback)
function tr(group, id, field, en) {
  const d = DICTS[CURRENT];
  const g = d && d[group];
  const v = g && g[id] && g[id][field];
  return v != null ? v : en;
}

// Whole translated array/field, e.g. a list of causes.
function trList(group, id, field, en) {
  const d = DICTS[CURRENT];
  const g = d && d[group];
  const v = g && g[id] && g[id][field];
  return Array.isArray(v) ? v : en;
}

// Path helpers: default language lives at the root, other languages under /zh.
function localePath(path, l) {
  const language = l || CURRENT;
  if (language === 'en') return path;
  return path === '/' ? `/${language}/` : `/${language}${path}`;
}

// Link from the current language to another page, given the set of paths that
// exist in each language. Falls back to the English page when untranslated.
function localizedHref(path, translatedPaths) {
  if (isDefault()) return path;
  if (translatedPaths && !translatedPaths.has(path)) return path; // fall back to English page
  return localePath(path);
}

module.exports = { LANGS, HTML_LANG, setLang, lang, isDefault, t, tr, trList, localePath, localizedHref, setTranslated, hasTranslation, translatedSet };

let TRANSLATED = new Set();
function setTranslated(set) {
  TRANSLATED = set;
}
function hasTranslation(path) {
  return TRANSLATED.has(path);
}
function translatedSet() {
  return TRANSLATED;
}

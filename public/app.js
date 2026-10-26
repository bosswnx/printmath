/* PrintMath client tools. No dependencies. Each tool is a function that reads
   inputs from its root element and writes formatted results back. */

(function () {
  'use strict';

  var MATERIALS = {
    pla: { name: 'PLA', d: 1.24 },
    'pla-plus': { name: 'PLA+', d: 1.24 },
    petg: { name: 'PETG', d: 1.27 },
    abs: { name: 'ABS', d: 1.04 },
    asa: { name: 'ASA', d: 1.07 },
    tpu: { name: 'TPU', d: 1.21 },
    'tpu-95a': { name: 'TPU 95A', d: 1.21 },
    nylon: { name: 'Nylon (PA)', d: 1.14 },
    pc: { name: 'Polycarbonate', d: 1.2 },
    hips: { name: 'HIPS', d: 1.04 },
    pva: { name: 'PVA', d: 1.23 },
    'pla-cf': { name: 'PLA-CF', d: 1.3 },
    'petg-cf': { name: 'PETG-CF', d: 1.35 },
    'pa-cf': { name: 'PA-CF', d: 1.2 },
    'wood-pla': { name: 'Wood-fill PLA', d: 1.28 },
    custom: { name: 'Custom', d: 1.24 }
  };

  var SYMBOL = { USD: '$', EUR: '\u20ac', GBP: '\u00a3', CNY: '\u00a5', JPY: '\u00a5', AUD: 'A$', CAD: 'C$', INR: '\u20b9' };

  /* Output strings. The build writes window.PM_LANG before this script loads,
     so Chinese pages get Chinese results text. Units (g, m, %) stay as they are. */
  var LANG = (typeof window !== 'undefined' && window.PM_LANG) || 'en';
  var STR = {
    en: {
      within: 'OK — within hotend limit',
      tooHigh: 'Too high — lower speed or raise temperature',
      spoolPct: '{n}% of a 1 kg spool',
      parts: '{n} parts',
      partsPerDay: '{n} parts/day',
      shown: '{n} shown'
    },
    zh: {
      within: 'OK — 在热端上限内',
      tooHigh: '过高 — 降低速度或提高温度',
      spoolPct: '1 kg 料盘的 {n}%',
      parts: '{n} 件',
      partsPerDay: '{n} 件/天',
      shown: '已显示 {n} 条'
    }
  };
  function L(key, vars) {
    var d = STR[LANG] || STR.en;
    var s = d[key] != null ? d[key] : STR.en[key];
    if (s == null) return key;
    return String(s).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] != null ? vars[k] : m;
    });
  }

  function $(root, sel) { return root.querySelector(sel); }
  function num(el, fallback) {
    if (!el) return fallback || 0;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : (fallback || 0);
  }
  function fmt(n, dp) {
    if (!isFinite(n)) return '—';
    dp = dp == null ? 2 : dp;
    return n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function money(n, sym) { return (sym || '$') + fmt(n, 2); }
  function setText(root, sel, text) { var el = $(root, sel); if (el) el.textContent = text; }

  function areaCm2(diameterMm) { var r = diameterMm / 20; return Math.PI * r * r; } // mm->cm radius
  function gramsFromMm(lengthMm, diameterMm, density) {
    return (lengthMm / 10) * areaCm2(diameterMm) * density; // cm * cm^2 * g/cm^3
  }
  function mmFromGrams(grams, diameterMm, density) {
    return (grams / density / areaCm2(diameterMm)) * 10;
  }

  function curSym(root) {
    var s = $(root, '[data-cur]');
    return s ? SYMBOL[s.value] || '$' : '$';
  }

  function wire(root, fn) {
    root.addEventListener('input', fn);
    root.addEventListener('change', fn);
    fn();
  }

  /* ---------------- Tool: print cost calculator ---------------- */
  function costCalc(root) {
    var matSel = $(root, '[data-mat]');
    var densEl = $(root, '[data-density]');
    if (matSel) {
      matSel.addEventListener('change', function () {
        var m = MATERIALS[matSel.value];
        if (m && densEl && matSel.value !== 'custom') densEl.value = m.d;
      });
    }
    wire(root, function () {
      var sym = curSym(root);
      var density = num(densEl, 1.24);
      var priceKg = num($(root, '[data-price-kg]'), 20);
      var weight = num($(root, '[data-weight]'), 0);
      var qty = Math.max(1, num($(root, '[data-qty]'), 1));
      var hours = num($(root, '[data-hours]'), 0);
      var watts = num($(root, '[data-watts]'), 120);
      var kwh = num($(root, '[data-kwh]'), 0.15);
      var machine = num($(root, '[data-machine]'), 0);
      var life = Math.max(1, num($(root, '[data-life]'), 5000));
      var laborMin = num($(root, '[data-labor-min]'), 0);
      var laborRate = num($(root, '[data-labor-rate]'), 15);
      var fail = num($(root, '[data-fail]'), 5);
      var margin = num($(root, '[data-margin]'), 40);

      var materialCost = (weight / 1000) * priceKg;
      var energyCost = (watts / 1000) * hours * kwh;
      var wearCost = (machine / life) * hours;
      var laborCost = (laborMin / 60) * laborRate;
      var unitBase = materialCost + energyCost + wearCost + laborCost;
      var withFail = unitBase / (1 - Math.min(fail, 95) / 100);
      var waste = withFail - unitBase;
      var price = withFail / (1 - Math.min(margin, 95) / 100);
      var profit = price - withFail;

      setText(root, '[data-out-material]', money(materialCost, sym));
      setText(root, '[data-out-energy]', money(energyCost, sym));
      setText(root, '[data-out-wear]', money(wearCost, sym));
      setText(root, '[data-out-labor]', money(laborCost, sym));
      setText(root, '[data-out-waste]', money(waste, sym));
      setText(root, '[data-out-cost]', money(withFail, sym));
      setText(root, '[data-out-price]', money(price, sym));
      setText(root, '[data-out-profit]', money(profit, sym));
      setText(root, '[data-out-batch]', money(withFail * qty, sym));
      setText(root, '[data-out-batch-price]', money(price * qty, sym));
    });
  }

  /* ---------------- Tool: filament length <-> weight ---------------- */
  function filamentLen(root) {
    var matSel = $(root, '[data-mat]');
    var densEl = $(root, '[data-density]');
    if (matSel) matSel.addEventListener('change', function () {
      var m = MATERIALS[matSel.value];
      if (m && densEl && matSel.value !== 'custom') densEl.value = m.d;
    });
    wire(root, function () {
      var sym = curSym(root);
      var density = num(densEl, 1.24);
      var dia = num($(root, '[data-diameter]'), 1.75);
      var grams = num($(root, '[data-grams]'), 0);
      var priceKg = num($(root, '[data-price-kg]'), 20);
      var mm = mmFromGrams(grams, dia, density);
      var vol = (mm / 10) * areaCm2(dia);
      setText(root, '[data-out-mm]', fmt(mm, 0) + ' mm');
      setText(root, '[data-out-m]', fmt(mm / 1000, 2) + ' m');
      setText(root, '[data-out-vol]', fmt(vol, 2) + ' cm\u00b3');
      setText(root, '[data-out-cost]', money((grams / 1000) * priceKg, sym));
      setText(root, '[data-out-per-m]', money((grams / 1000) * priceKg / (mm / 1000 || 1), sym) + ' / m');
    });
  }

  /* ---------------- Tool: spool remaining ---------------- */
  function spoolRemaining(root) {
    var matSel = $(root, '[data-mat]');
    var densEl = $(root, '[data-density]');
    if (matSel) matSel.addEventListener('change', function () {
      var m = MATERIALS[matSel.value];
      if (m && densEl && matSel.value !== 'custom') densEl.value = m.d;
    });
    wire(root, function () {
      var density = num(densEl, 1.24);
      var dia = num($(root, '[data-diameter]'), 1.75);
      var full = num($(root, '[data-full]'), 1000);
      var empty = num($(root, '[data-empty]'), 200);
      var now = num($(root, '[data-now]'), 0);
      var remain = Math.max(0, now - empty);
      var pct = full > 0 ? (remain / full) * 100 : 0;
      var mm = mmFromGrams(remain, dia, density);
      setText(root, '[data-out-remain]', fmt(remain, 0) + ' g');
      setText(root, '[data-out-pct]', fmt(pct, 1) + '%');
      setText(root, '[data-out-m]', fmt(mm / 1000, 2) + ' m');
      var bar = $(root, '[data-bar] > span');
      if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      setText(root, '[data-out-prints]', L('parts', { n: fmt(remain / (num($(root, '[data-per-part]'), 20) || 20), 1) }));
    });
  }

  /* ---------------- Tool: max volumetric flow ---------------- */
  function flowCalc(root) {
    wire(root, function () {
      var speed = num($(root, '[data-speed]'), 100);
      var lh = num($(root, '[data-layer-height]'), 0.2);
      var lw = num($(root, '[data-line-width]'), 0.45);
      var vol = speed * lh * lw;
      setText(root, '[data-out-flow]', fmt(vol, 2) + ' mm\u00b3/s');
      var maxes = { stock: 12, volcano: 20, highflow: 25, custom: num($(root, '[data-hotend-max]'), 15) };
      var sel = $(root, '[data-hotend]');
      var max = sel ? (maxes[sel.value] || 15) : 15;
      setText(root, '[data-out-max]', fmt(max, 0) + ' mm\u00b3/s');
      var verdict = vol <= max ? L('within') : L('tooHigh');
      var v = $(root, '[data-out-verdict]');
      if (v) { v.textContent = verdict; v.className = vol <= max ? 'pill ok' : 'pill bad'; }
      var maxSpeed = (max / (lh * lw));
      setText(root, '[data-out-maxspeed]', fmt(maxSpeed, 0) + ' mm/s');
    });
  }

  /* ---------------- Tool: print farm / capacity ---------------- */
  function farmCalc(root) {
    wire(root, function () {
      var sym = curSym(root);
      var printers = Math.max(1, num($(root, '[data-printers]'), 1));
      var hoursPerDay = Math.min(24, num($(root, '[data-hours-day]'), 20));
      var partHours = Math.max(0.05, num($(root, '[data-part-hours]'), 4));
      var partCost = num($(root, '[data-part-cost]'), 2);
      var price = num($(root, '[data-part-price]'), 12);
      var fail = num($(root, '[data-fail]'), 5);
      var days = num($(root, '[data-days]'), 30);

      var partsPerPrinterPerDay = (hoursPerDay / partHours) * (1 - fail / 100);
      var perDay = partsPerPrinterPerDay * printers;
      var perMonth = perDay * days;
      var revenue = perMonth * price;
      var cost = perMonth * partCost;
      var profit = revenue - cost;
      var marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

      setText(root, '[data-out-perprinter]', L('partsPerDay', { n: fmt(partsPerPrinterPerDay, 1) }));
      setText(root, '[data-out-perday]', L('partsPerDay', { n: fmt(perDay, 1) }));
      setText(root, '[data-out-permonth]', L('parts', { n: fmt(perMonth, 0) }));
      setText(root, '[data-out-revenue]', money(revenue, sym));
      setText(root, '[data-out-cost]', money(cost, sym));
      setText(root, '[data-out-profit]', money(profit, sym));
      setText(root, '[data-out-margin]', fmt(marginPct, 0) + '%');
    });
  }

  /* ---------------- Tool: G-code analyzer ---------------- */
  function gcodeAnalyzer(root) {
    var fileEl = $(root, '[data-file]');
    var dropEl = $(root, '[data-drop]');
    if (!fileEl) return;

    function analyze(text, name) {
      var sym = curSym(root);
      var density = num($(root, '[data-density]'), 1.24);
      var dia = num($(root, '[data-diameter]'), 1.75);
      var priceKg = num($(root, '[data-price-kg]'), 20);

      var lengthMm = null;
      var gramsComment = null;
      var timeSec = null;
      var layers = 0;
      var m, re;

      // Slicer comments (PrusaSlicer / OrcaSlicer / Cura / Bambu)
      m = text.match(/;\s*Filament used:\s*([\d.]+)\s*m\b/i);
      if (m) lengthMm = parseFloat(m[1]) * 1000;
      m = text.match(/;\s*Filament used:\s*([\d.]+)\s*g\b/i) || text.match(/;\s*total filament used\s*\[g\]\s*=\s*([\d.]+)/i);
      if (m) gramsComment = parseFloat(m[1]);
      m = text.match(/;\s*(?:TIME|estimated printing time \(normal mode\)|print time \(normal mode\)):\s*(\d+)/i);
      if (m) timeSec = parseInt(m[1], 10);
      m = text.match(/;\s*TIME:\s*(\d+)/i);
      if (!timeSec && m) timeSec = parseInt(m[1], 10);
      // human readable time: 1h 2m 3s
      if (!timeSec) {
        m = text.match(/;\s*estimated printing time[^:]*:\s*((?:\d+[dhms]\s*)+)/i);
        if (m) {
          var hh = /(\d+)h/.exec(m[1]), mm2 = /(\d+)m/.exec(m[1]), ss = /(\d+)s/.exec(m[1]);
          timeSec = (hh ? +hh[1] * 3600 : 0) + (mm2 ? +mm2[1] * 60 : 0) + (ss ? +ss[1] : 0);
        }
      }
      re = /;LAYER[_ :]/gi; while (re.exec(text)) layers++;
      if (!layers) { re = /;LAYER_CHANGE/g; while (re.exec(text)) layers++; }

      if (lengthMm == null && gramsComment != null) {
        // Slicer gave grams only: derive a consistent length from it.
        lengthMm = mmFromGrams(gramsComment, dia, density);
      }
      if (lengthMm == null) {
        // Sum extrusion moves (absolute or relative)
        var relative = false;
        var total = 0;
        var lastE = 0;
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.charCodeAt(0) === 59) continue; // ';'
          if (line.indexOf('M83') !== -1) { relative = true; continue; }
          if (line.indexOf('M82') !== -1) { relative = false; continue; }
          if (line.indexOf('G92') !== -1 && line.indexOf('E') !== -1) { lastE = 0; continue; }
          if (line.indexOf('E') === -1) continue;
          if (line.indexOf('G1') === -1 && line.indexOf('G0') === -1) continue;
          var em = /E(-?\d*\.?\d+)/.exec(line);
          if (!em) continue;
          var e = parseFloat(em[1]);
          if (relative) { if (e > 0) total += e; }
          else { if (e > lastE) total += e - lastE; lastE = e; }
        }
        lengthMm = total;
      }

      var grams = gramsComment != null ? gramsComment : gramsFromMm(lengthMm, dia, density);
      var cost = (grams / 1000) * priceKg;

      setText(root, '[data-out-file]', name);
      setText(root, '[data-out-length]', fmt(lengthMm / 1000, 2) + ' m');
      setText(root, '[data-out-grams]', fmt(grams, 1) + ' g');
      setText(root, '[data-out-cost]', money(cost, sym));
      setText(root, '[data-out-layers]', layers ? fmt(layers, 0) : '—');
      setText(root, '[data-out-time]', timeSec ? humanTime(timeSec) : '—');
      var spools = $(root, '[data-out-spools]');
      if (spools) spools.textContent = L('spoolPct', { n: fmt((grams / 1000) * 100, 1) });
      var res = $(root, '[data-results]');
      if (res) res.hidden = false;
    }

    function humanTime(sec) {
      var h = Math.floor(sec / 3600), m2 = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
      return (h ? h + 'h ' : '') + (m2 ? m2 + 'm ' : '') + s + 's';
    }

    function readFile(f) {
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { analyze(String(reader.result), f.name); };
      reader.readAsText(f.slice ? f : f);
    }

    fileEl.addEventListener('change', function () { readFile(fileEl.files[0]); });
    if (dropEl) {
      ['dragenter', 'dragover'].forEach(function (ev) {
        dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.remove('over'); });
      });
      dropEl.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
      });
    }
    wire(root, function () { if (fileEl.files && fileEl.files[0]) readFile(fileEl.files[0]); });
  }

  /* ---------------- Tool: settings lookup (filter) ---------------- */
  function settingsFilter(root) {
    var input = $(root, '[data-filter]');
    var rows = Array.prototype.slice.call(root.querySelectorAll('[data-row]'));
    var count = $(root, '[data-count]');
    function apply() {
      var q = (input.value || '').toLowerCase().trim();
      var shown = 0;
      rows.forEach(function (r) {
        var hit = !q || r.getAttribute('data-row').indexOf(q) !== -1;
        r.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      if (count) count.textContent = L('shown', { n: shown });
    }
    if (input) { input.addEventListener('input', apply); apply(); }
  }

  var TOOLS = {
    'cost-calculator': costCalc,
    'filament-length': filamentLen,
    'spool-remaining': spoolRemaining,
    'flow-calculator': flowCalc,
    'farm-calculator': farmCalc,
    'gcode-analyzer': gcodeAnalyzer,
    'settings-filter': settingsFilter
  };

  document.addEventListener('DOMContentLoaded', function () {
    Object.keys(TOOLS).forEach(function (key) {
      document.querySelectorAll('[data-tool="' + key + '"]').forEach(function (root) {
        try { TOOLS[key](root); } catch (e) { /* keep page usable */ }
      });
    });
  });
})();

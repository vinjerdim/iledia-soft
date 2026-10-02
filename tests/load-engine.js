'use strict';

/*
 * Memuat shared/engine.js (skrip browser tanpa modul) ke dalam konteks
 * vm Node agar fungsi globalnya bisa diuji. Berkas data.js modul dapat
 * ikut dimuat lewat `files` sehingga DATA tersedia di konteks yang sama.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function loadEngine(files) {
  const ctx = { console };
  vm.createContext(ctx);
  ['shared/engine.js'].concat(files || []).forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  });
  /* `var DATA` di skrip lain menjadi properti konteks; `const` tidak. */
  return ctx;
}

module.exports = { loadEngine, ROOT };

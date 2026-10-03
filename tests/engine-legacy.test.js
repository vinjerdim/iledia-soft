'use strict';

/*
 * Tes kompatibilitas: Engine.createLesson (bagian 19 shared/engine.js)
 * dipertahankan untuk modul lama. Sejak mpi-2.2 ditulis ulang ke gaya
 * iledia-math, tidak ada lagi modul yang memakainya; tes ini menjaga
 * API-nya tetap utuh sampai bagian itu sengaja dihapus.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

test('Engine.createLesson lama tetap tersedia', () => {
  const ctx = loadEngine();
  assert.equal(vm.runInContext('typeof Engine.createLesson', ctx), 'function');
  assert.equal(vm.runInContext('typeof Engine.shuffle', ctx), 'function');
  assert.equal(vm.runInContext('typeof Engine.esc', ctx), 'function');
});

test('semua modul memakai gaya iledia-math (tanpa berkas app-stage-* lama)', () => {
  const fase = path.join(ROOT, 'fase-f');
  fs.readdirSync(fase).forEach((mod) => {
    const files = fs.readdirSync(path.join(fase, mod));
    assert.ok(!files.some((f) => /^app-(core|stage-)/.test(f)), mod + ' tanpa berkas modul lama');
    assert.ok(files.includes('app.js') && files.includes('data.js'), mod + ' punya app & data');
  });
});

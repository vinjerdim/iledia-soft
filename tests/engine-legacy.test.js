'use strict';

/*
 * Tes kompatibilitas: modul lama (mpi-2.2) masih memakai
 * Engine.createLesson dan mendeklarasikan nama global sendiri. Engine
 * global gaya iledia-math tidak boleh mematahkannya.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const LEGACY = ['mpi-2.2'];

/* Nama global lama yang sengaja ditimpa modul lama dengan versi
   Engine.* yang setara (var esc = Engine.esc, dst.). */
const BOLEH_DITIMPA = ['esc', 'showNotice'];

function topLevelNames(src) {
  const out = [];
  const re = /^(?:function|var|let|const)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(src))) out.push({ kind: m[0].split(/\s+/)[0], name: m[1] });
  return out;
}

function legacyScripts(mod) {
  const html = fs.readFileSync(path.join(ROOT, 'fase-f', mod, 'index.html'), 'utf8');
  return Array.from(html.matchAll(/<script src="([^"]+)"/g))
    .map((m) => m[1])
    .filter((src) => !src.includes('shared/'));
}

test('Engine.createLesson lama tetap tersedia', () => {
  const ctx = loadEngine();
  assert.equal(vm.runInContext('typeof Engine.createLesson', ctx), 'function');
  assert.equal(vm.runInContext('typeof Engine.shuffle', ctx), 'function');
  assert.equal(vm.runInContext('typeof Engine.esc', ctx), 'function');
});

test('global engine tidak bertabrakan dengan nama global modul lama', () => {
  const engineNames = new Set(
    topLevelNames(fs.readFileSync(path.join(ROOT, 'shared/engine.js'), 'utf8')).map((n) => n.name)
  );
  LEGACY.forEach((mod) => {
    legacyScripts(mod).forEach((src) => {
      const file = path.join(ROOT, 'fase-f', mod, src);
      topLevelNames(fs.readFileSync(file, 'utf8')).forEach(({ kind, name }) => {
        if (!engineNames.has(name)) return;
        assert.ok(
          kind !== 'const' && kind !== 'let',
          `${mod}/${src}: ${kind} ${name} akan melempar SyntaxError (sudah dideklarasikan engine)`
        );
        assert.ok(
          BOLEH_DITIMPA.includes(name),
          `${mod}/${src}: ${name} menimpa fungsi engine yang dipakai komponen bersama`
        );
      });
    });
  });
});

test('modul lama tetap memuat tokens.css, base.css, dan engine.js bersama', () => {
  LEGACY.forEach((mod) => {
    const html = fs.readFileSync(path.join(ROOT, 'fase-f', mod, 'index.html'), 'utf8');
    assert.match(html, /\.\.\/\.\.\/shared\/tokens\.css/);
    assert.match(html, /\.\.\/\.\.\/shared\/base\.css/);
    assert.match(html, /\.\.\/\.\.\/shared\/engine\.js/);
  });
});

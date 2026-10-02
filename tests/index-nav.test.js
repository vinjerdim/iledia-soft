'use strict';

/*
 * Tes navigasi halaman utama (Fase → Kelas → Topik, meniru iledia-math):
 * hierarki memuat Fase F → Kelas XI → Topik 1 & 2, setiap card punya
 * data-kelas/data-topik yang terdaftar dan tautan yang ada, dan card
 * MPI 1.1 & 1.2 berada di Kelas XI Topik 1.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ROOT } = require('./load-engine');

const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function hierarki() {
  const m = HTML.match(/const HIERARKI = (\{[\s\S]*?\n {6}\});/);
  assert.ok(m, 'objek HIERARKI ada di index.html');
  return vm.runInNewContext('(' + m[1] + ')');
}

function cards() {
  return Array.from(HTML.matchAll(/<a\s[^>]*class="card"[^>]*>/g)).map((m) => {
    const tag = m[0];
    const attr = (n) => (tag.match(new RegExp(n + '="([^"]*)"')) || [])[1];
    return { href: attr('href'), kelas: attr('data-kelas'), topik: attr('data-topik'), tag };
  });
}

test('hierarki Fase F → Kelas XI → Topik 1 dan 2', () => {
  const H = hierarki();
  assert.ok(H['fase-f'], 'fase-f ada');
  const xi = H['fase-f'].kelas.find((k) => k.id === 'XI');
  assert.ok(xi, 'Kelas XI ada');
  assert.equal(xi.topik[1], 'Basis Data Relasional');
  assert.equal(xi.topik[2], 'Sistem Manajemen Basis Data (DBMS)');
});

test('setiap card terdaftar di hierarki dan tautannya ada', () => {
  const xi = hierarki()['fase-f'].kelas.find((k) => k.id === 'XI');
  const list = cards();
  assert.ok(list.length >= 6);
  list.forEach((c) => {
    assert.equal(c.kelas, 'XI', c.href + ' data-kelas');
    assert.ok(xi.topik[c.topik], c.href + ' data-topik terdaftar');
    assert.ok(fs.existsSync(path.join(ROOT, c.href)), c.href + ' ada');
    assert.match(c.tag, /role="listitem"/);
  });
});

test('card MPI 1.1 ada di Kelas XI Topik 1 dengan judul TP baru', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-1.1/index.html');
  assert.ok(c, 'card mpi-1.1 ada');
  assert.equal(c.topik, '1');
  assert.match(c.tag, /entitas dan atribut/i);
});

test('card MPI 1.2 ada di Kelas XI Topik 1 dengan TP relasi & kardinalitas', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-1.2/index.html');
  assert.ok(c, 'card mpi-1.2 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '1');
  assert.match(c.tag, /jenis relasi/i);
  assert.match(c.tag, /kardinalitas/i);
  assert.match(c.tag, /Cooperative Learning/);
});

test('urutan card mengikuti nomor materi', () => {
  const hrefs = cards().map((c) => c.href);
  assert.deepEqual(hrefs, [
    'fase-f/mpi-1.1/index.html',
    'fase-f/mpi-1.2/index.html',
    'fase-f/mpi-1.3/index.html',
    'fase-f/mpi-1.4/index.html',
    'fase-f/mpi-2.1/index.html',
    'fase-f/mpi-2.2/index.html',
  ]);
});

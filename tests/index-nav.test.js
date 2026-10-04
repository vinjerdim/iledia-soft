'use strict';

/*
 * Tes navigasi halaman utama (Fase → Kelas → Topik, meniru iledia-math):
 * hierarki memuat Fase F → Kelas XI → Topik 1 & 2, setiap card punya
 * data-kelas/data-topik yang terdaftar dan tautan yang ada, dan card
 * MPI 1.1 – 1.4 berada di Kelas XI Topik 1, dan MPI 2.1 – 2.3 di Topik 2.
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

test('card MPI 1.3 ada di Kelas XI Topik 1 dengan TP ERD lengkap', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-1.3/index.html');
  assert.ok(c, 'card mpi-1.3 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '1');
  assert.match(c.tag, /ERD Lengkap/);
  assert.match(c.tag, /Analisis Kebutuhan Data/);
  assert.match(c.tag, /Cooperative Learning/);
});

test('card MPI 1.4 ada di Kelas XI Topik 1 dengan TP normalisasi', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-1.4/index.html');
  assert.ok(c, 'card mpi-1.4 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '1');
  assert.match(c.tag, /Normalisasi Basis Data/);
  assert.match(c.tag, /1NF, 2NF, 3NF/);
  assert.match(c.tag, /Redundansi Data/);
  assert.match(c.tag, /Problem Based Learning/);
});

test('card MPI 2.1 ada di Kelas XI Topik 2 dengan TP SQL DDL dari ERD', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-2.1/index.html');
  assert.ok(c, 'card mpi-2.1 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '2');
  assert.match(c.tag, /SQL DDL/);
  assert.match(c.tag, /ERD/);
  assert.match(c.tag, /Inquiry Learning/);
});

test('card MPI 2.2 ada di Kelas XI Topik 2 dengan TP CREATE DATABASE & CREATE TABLE', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-2.2/index.html');
  assert.ok(c, 'card mpi-2.2 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '2');
  assert.match(c.tag, /CREATE DATABASE/);
  assert.match(c.tag, /CREATE TABLE/);
  assert.match(c.tag, /Problem Based Learning/);
  const blok = HTML.slice(HTML.indexOf(c.tag));
  const isi = blok.slice(0, blok.indexOf('</a>'));
  assert.match(isi, /Materi 2\.2/);
  assert.match(isi, /Membuat Basis Data dan Tabel/);
});

test('card MPI 2.3 ada di Kelas XI Topik 2 dengan TP ALTER TABLE', () => {
  const c = cards().find((x) => x.href === 'fase-f/mpi-2.3/index.html');
  assert.ok(c, 'card mpi-2.3 ada');
  assert.equal(c.kelas, 'XI');
  assert.equal(c.topik, '2');
  assert.match(c.tag, /ALTER TABLE/);
  assert.match(c.tag, /Problem Based Learning/);
  const blok = HTML.slice(HTML.indexOf(c.tag));
  const isi = blok.slice(0, blok.indexOf('</a>'));
  assert.match(isi, /Materi 2\.3/);
  assert.match(isi, /Mengubah Struktur Tabel/);
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
    'fase-f/mpi-2.3/index.html',
  ]);
});

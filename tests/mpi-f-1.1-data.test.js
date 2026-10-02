'use strict';

/*
 * Tes konsistensi fase-f/mpi-1.1 (Discovery Learning — analisis
 * kebutuhan data untuk mengidentifikasi entitas & atribut):
 *   • tahap cocok dengan manifest dan urutan sintaks Discovery Learning;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan penuntun punya kunci & umpan balik per opsi;
 *   • frasa dokumen kebutuhan cocok dengan penandanya;
 *   • setiap atribut tepat milik satu entitas, kunci milik entitasnya;
 *   • kunci tahap pembuktian cocok dengan cakupanKebutuhan (engine);
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-1.1';
const E = loadEngine([MOD + '/data.js', MOD + '/app.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function sorted(arr) {
  return Array.from(arr).slice().sort();
}

function assertOptions(list, name, min) {
  const n = min || 4;
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= n, name + ' minimal ' + n + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + ': opsi ' + o.id + ' tanpa label'));
  const labels = list.map((o) => o.label || o.teks);
  assert.equal(new Set(labels).size, list.length, name + ': label opsi harus unik');
}

function assertGuided(q, name) {
  assert.ok(q.id && (q.tanya || q.teks), name + ': id & pertanyaan');
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

function assertMulti(m, name, min) {
  assertOptions(m.opsi, name, min || 5);
  const benar = m.opsi.filter((o) => o.benar);
  assert.ok(benar.length >= 2, name + ': minimal dua jawaban benar');
  assert.ok(benar.length < m.opsi.length, name + ': harus ada pengecoh');
  m.opsi.forEach((o) => assert.ok(o.alasan, name + ': alasan untuk ' + o.id));
}

function assertSortItems(items, options, name) {
  assert.ok(items.length >= 6, name + ': minimal 6 butir');
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(it.teks, name + ': teks ' + it.id);
    assert.ok(ids(options).includes(it.correct), name + ': kunci ' + it.id + ' bukan opsi');
    assert.ok(it.explanation, name + ': penjelasan ' + it.id);
  });
  options.forEach((o) =>
    assert.ok(
      items.some((it) => it.correct === o.id),
      name + ': kategori ' + o.id + ' tidak punya butir'
    )
  );
}

function semuaPertanyaan() {
  return []
    .concat(D.masalah.pertanyaan)
    .concat(D.contoh.pertanyaan)
    .concat(D.olah.kunci)
    .concat(D.simpulan.pertanyaan)
    .concat([D.terapkan.kunci]);
}

test('tahap cocok dengan manifest dan sintaks Discovery Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.match(m.h1, /Entitas/);
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'stimulasi',
    'masalah',
    'kumpulData',
    'contoh',
    'olah',
    'pembuktian',
    'simpulan',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = D.tahap.map((t) => t.sintaks || '').join('|');
  [
    'Stimulasi',
    'Identifikasi Masalah',
    'Pengumpulan Data',
    'Pengolahan Data',
    'Pembuktian',
    'Generalisasi',
  ].forEach((s) => assert.ok(sintaks.includes(s), 'sintaks ' + s + ' terpetakan'));
});

test('panel tujuan belajar memuat TP dan kriteria', () => {
  const o = D.orientasi;
  assert.match(o.tp, /kebutuhan data/i);
  assert.match(o.tp, /entitas dan atribut/i);
  assert.ok(o.tpJudul);
  assert.ok(o.kriteria.length >= 3);
  assertOptions(o.apersepsi.opsi, 'orientasi.apersepsi', 4);
});

test('setiap tahap punya kicker, tujuan, dan catatan peran guru', () => {
  D.tahap.forEach((t) => {
    const s = D[t.id];
    assert.ok(s, 'konten tahap ' + t.id);
    assert.ok(s.kicker, t.id + '.kicker');
    assert.ok(s.goal, t.id + '.goal');
    if (t.id !== 'selesai') assert.ok(s.guru, t.id + '.guru');
  });
});

test('stimulasi: tabel datar konsisten dan kejanggalan berdiagnosa', () => {
  const t = D.stimulasi.tabel;
  assert.ok(t.baris.length >= 6);
  t.baris.forEach((b, i) => assert.equal(b.length, t.kolom.length, 'baris ' + i));
  assertMulti(D.stimulasi.kejanggalan, 'stimulasi.kejanggalan');
});

test('pertanyaan penuntun: kunci, opsi, dan umpan balik lengkap; id unik lintas tahap', () => {
  const list = semuaPertanyaan();
  list.forEach((q) => assertGuided(q, q.id));
  assert.equal(new Set(ids(list)).size, list.length, 'id pertanyaan unik');
  assert.ok(D.masalah.pertanyaan.length >= 2);
  assert.ok(D.contoh.pertanyaan.length >= 4);
  assert.ok(D.simpulan.pertanyaan.length >= 2);
});

test('pengumpulan data: setiap frasa bertanda tepat sekali di dokumen kebutuhan', () => {
  const K = D.kumpulData;
  assert.ok(K.dokumen.length >= 3);
  assertOptions(K.kategori, 'kumpulData.kategori', 4);
  assertSortItems(K.frasa, K.kategori, 'kumpulData.frasa');
  const marked = K.dokumen.flatMap((d) => Array.from(E.daftarFrasa(d.teks)));
  assert.deepEqual(sorted(marked.map((m) => m.id)), sorted(ids(K.frasa)));
  marked.forEach((m) => {
    const f = K.frasa.find((x) => x.id === m.id);
    assert.equal(f.teks, m.label, 'teks frasa ' + m.id + ' sama dengan penanda');
  });
});

test('contoh & non-contoh: ada kartu contoh dan bukan-contoh', () => {
  const k = D.contoh.kartu;
  assert.ok(k.filter((x) => x.jenis === 'contoh').length >= 2);
  assert.ok(k.filter((x) => x.jenis === 'bukan').length >= 2);
});

test('pengolahan data: atribut milik tepat satu entitas, kunci milik entitasnya', () => {
  const O = D.olah;
  assertOptions(O.entitas, 'olah.entitas', 4);
  assertSortItems(O.atribut, O.entitas, 'olah.atribut');
  assert.equal(O.kunci.length, O.entitas.length, 'satu pertanyaan kunci per entitas');
  O.entitas.forEach((ent) => {
    const milik = O.atribut.filter((a) => a.correct === ent.id);
    assert.ok(milik.length >= 3, ent.id + ' minimal 3 atribut');
    assert.ok(ids(milik).includes(ent.kunci), ent.id + ': kunci milik entitas');
    const q = O.kunci.find((k) => k.entitas === ent.id);
    assert.ok(q, 'pertanyaan kunci untuk ' + ent.id);
    assert.equal(q.correct, ent.kunci);
    q.opsi.forEach((o) =>
      assert.ok(ids(milik).includes(o.id), q.id + ': opsi ' + o.id + ' atribut ' + ent.id)
    );
  });
});

test('pembuktian: kunci sesuai cakupan rancangan (engine cakupanKebutuhan)', () => {
  const P = D.pembuktian;
  assertOptions(P.kategori, 'pembuktian.kategori', 3);
  assertSortItems(P.kasus, P.kategori, 'pembuktian.kasus');
  const rancangan = ids(D.olah.atribut);
  P.kasus.forEach((k) => {
    const c = E.cakupanKebutuhan(rancangan, k);
    let harus;
    if (!c.terpenuhi) harus = 'tambah';
    else harus = k.turunan ? 'hitung' : 'bisa';
    assert.equal(k.correct, harus, k.id + ' seharusnya ' + harus);
  });
});

test('generalisasi: langkah analisis kebutuhan data berurutan', () => {
  const S = D.simpulan;
  assertOptions(S.langkah, 'simpulan.langkah', 4);
  assert.deepEqual(sorted(S.urutan), sorted(ids(S.langkah)));
});

test('uji terap: kandidat entitas, pemilahan atribut, dan kunci konsisten', () => {
  const T = D.terapkan;
  assertMulti(T.kandidat, 'terapkan.kandidat', 6);
  const benar = T.kandidat.opsi.filter((o) => o.benar).map((o) => o.id);
  assert.deepEqual(sorted(benar), sorted(ids(T.entitas)));
  assertSortItems(T.atribut, T.entitas, 'terapkan.atribut');
  assert.ok(ids(T.atribut).includes(T.kunci.correct));
  assert.equal(
    T.atribut.find((a) => a.id === T.kunci.correct).correct,
    T.kunci.entitas,
    'kunci uji terap milik entitasnya'
  );
});

test('refleksi: skala Likert 5 tingkat dan pernyataan per kriteria', () => {
  const R = D.refleksi;
  assert.equal(R.skala.length, 5);
  assert.ok(R.pernyataan.length >= D.orientasi.kriteria.length);
});

test('initOrders mengacak SETIAP daftar pilihan sekali dan stabil', () => {
  vm.runInContext('initOrders();', E);
  const S = E.State;
  const perm = (order, list, name) =>
    assert.deepEqual(sorted(order), sorted(ids(list)), name + ' adalah permutasi opsi');

  perm(S.apersepsiOrder, D.orientasi.apersepsi.opsi, 'apersepsiOrder');
  perm(S.multi.stimulasi.order, D.stimulasi.kejanggalan.opsi, 'multi.stimulasi');
  perm(S.multi.kandidat.order, D.terapkan.kandidat.opsi, 'multi.kandidat');
  semuaPertanyaan().forEach((q) => perm(S.qOrders[q.id], q.opsi, 'qOrders.' + q.id));

  [
    ['frasa', D.kumpulData.frasa, D.kumpulData.kategori],
    ['atribut', D.olah.atribut, D.olah.entitas],
    ['kasus', D.pembuktian.kasus, D.pembuktian.kategori],
    ['terapAtribut', D.terapkan.atribut, D.terapkan.entitas],
  ].forEach(([key, items, opts]) => {
    perm(S.sortOrders[key], items, 'sortOrders.' + key);
    items.forEach((it) => perm(S.sorts[key][it.id].optionOrder, opts, key + '.' + it.id));
  });

  const urut = S.langkahUrut;
  perm(urut.pool, D.simpulan.langkah, 'langkahUrut.pool');
  assert.notEqual(urut.pool.join(), D.simpulan.urutan.join(), 'urutan awal tidak langsung benar');

  const snapshot = JSON.stringify(S);
  vm.runInContext('initOrders();', E);
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
});

'use strict';

/*
 * Tes konsistensi fase-f/mpi-1.4 (Problem Based Learning — menganalisis
 * konsep normalisasi basis data 1NF, 2NF, 3NF untuk mengatasi redundansi):
 *   • tahap cocok dengan manifest dan lima sintaks PBL;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • spreadsheet asal belum normal, kunci 2NF/3NF valid menurut engine
 *     (bentukNormal, periksaDekomposisi), dan kunci pemilahan
 *     ketergantungan serta atribut konsisten dengannya;
 *   • kasus evaluasi TEFA: kunci soal sesuai engine, rancangan Tim Merah
 *     memang keliru;
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-1.4';
const E = loadEngine([MOD + '/data.js', MOD + '/app.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function sorted(arr) {
  return Array.from(arr).slice().sort();
}

function plain(x) {
  return JSON.parse(JSON.stringify(x));
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

function assertSoal(q, name) {
  assert.ok(q.id && q.tanya, name + ': id & pertanyaan');
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

function assertMulti(opsi, name, min) {
  assertOptions(opsi, name, min || 5);
  const benar = opsi.filter((o) => o.benar);
  assert.ok(benar.length >= 2, name + ': minimal dua jawaban benar');
  assert.ok(benar.length < opsi.length, name + ': harus ada pengecoh');
  opsi.forEach((o) => assert.ok(o.alasan, name + ': alasan untuk ' + o.id));
}

function assertSortItems(items, kategori, name) {
  assertOptions(kategori, name + '.kategori', 3);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(it.teks && it.explanation, name + '.' + it.id + ': teks & penjelasan');
    assert.ok(ids(kategori).includes(it.correct), name + '.' + it.id + ': kunci');
  });
  kategori.forEach((k) =>
    assert.ok(
      items.some((it) => it.correct === k.id),
      name + ': kategori ' + k.id + ' terpakai'
    )
  );
}

function semuaPertanyaan() {
  return []
    .concat(D.konsep.pertanyaan)
    .concat(D.nf1.pertanyaan)
    .concat(D.ketergantungan.pertanyaan)
    .concat(D.dekomposisi.pertanyaan2NF)
    .concat(D.dekomposisi.pertanyaan3NF);
}

function tabel1NF() {
  return Object.assign({}, D.rekap, { baris: E.ratakanBaris(D.rekap.baris) });
}

test('tahap cocok dengan manifest dan lima sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.h1, /Normalisasi/);
  assert.match(m.h1, /1NF, 2NF, 3NF/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'organisasi',
    'konsep',
    'nf1',
    'ketergantungan',
    'dekomposisi',
    'sajikan',
    'evaluasi',
    'refleksi',
    'selesai',
  ]);
  const sintaks = D.tahap.map((t) => t.sintaks || '').join('|');
  [
    'Sintaks 1 · Orientasi pada Masalah',
    'Sintaks 2 · Mengorganisasi Murid untuk Belajar',
    'Sintaks 3 · Membimbing Penyelidikan',
    'Sintaks 4 · Mengembangkan & Menyajikan Hasil Karya',
    'Sintaks 5 · Menganalisis & Mengevaluasi Pemecahan Masalah',
  ].forEach((s) => assert.ok(sintaks.includes(s), 'sintaks ' + s + ' terpetakan'));
});

test('index.html modul dihasilkan dari template dan berkas modul lama dihapus', () => {
  const html = fs.readFileSync(path.join(ROOT, MOD, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((x) => x[1]);
  assert.deepEqual(scripts, ['../../shared/engine.js', 'data.js', 'app.js']);
  assert.match(html, /id="resetModal"/);
  assert.match(html, /Normalisasi Basis Data/);
  assert.match(html, /0 dari 11 tahap selesai/);
  [
    'app-core.js',
    'app-stage-awal.js',
    'app-stage-inti.js',
    'app-stage-hasil.js',
    'app-stage-akhir.js',
  ].forEach((f) =>
    assert.ok(!fs.existsSync(path.join(ROOT, MOD, f)), f + ' modul lama sudah dihapus')
  );
});

test('panel tujuan belajar memuat TP normalisasi dan kriteria', () => {
  const o = D.orientasi;
  assert.equal(
    o.tp,
    'Menganalisis konsep normalisasi basis data (1NF, 2NF, 3NF) untuk mengatasi redundansi data.'
  );
  assert.ok(o.tpJudul);
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'orientasi.apersepsi', 4);
  assert.ok(o.apersepsi.umpan);
});

test('setiap tahap punya kicker bernomor, tujuan, dan catatan peran guru', () => {
  D.tahap.forEach((t, i) => {
    const s = D[t.id];
    assert.ok(s, 'konten tahap ' + t.id);
    assert.ok(s.kicker.startsWith('Tahap ' + (i + 1) + ' '), t.id + '.kicker bernomor urut');
    assert.ok(s.title, t.id + '.title');
    assert.ok(s.goal, t.id + '.goal');
    if (t.id !== 'selesai') assert.ok(s.guru, t.id + '.guru');
  });
});

test('pertanyaan penuntun & kuis lengkap, id unik lintas tahap', () => {
  semuaPertanyaan().forEach((q) => assertSoal(q, q.id));
  D.evaluasi.soal.forEach((q) => assertSoal(q, q.id));
  assert.ok(D.evaluasi.soal.length >= 5);
  const semua = ids(semuaPertanyaan().concat(D.evaluasi.soal));
  assert.equal(new Set(semua).size, semua.length);
});

test('masalah: spreadsheet asal belum normal, anomali & akar masalah', () => {
  assert.equal(E.bentukNormal(D.rekap), 0, 'spreadsheet asal bentuk tidak normal');
  const tak = Array.from(E.selTakAtomik(D.rekap));
  assert.ok(tak.length >= 8, 'cukup banyak sel tak atomik');
  assert.ok(
    D.rekap.baris.some((b) => D.rekap.kolom.every((k) => E.selAtomik(b[k.id]))),
    'ada nota yang seluruh selnya atomik (pengecoh)'
  );
  const M = D.masalah;
  assertSortItems(M.anomali.items, M.anomali.kategori, 'masalah.anomali');
  M.anomali.kategori.forEach((k) =>
    assert.ok(M.anomali.items.filter((it) => it.correct === k.id).length >= 2, k.id + ' ≥ 2')
  );
  assertMulti(M.akar.opsi, 'masalah.akar', 6);
  assert.ok(M.rumusan.min >= 20);
});

test('organisasi: peran tim dan langkah normalisasi', () => {
  const O = D.organisasi;
  assert.ok(O.peran.length >= 4);
  O.peran.forEach((p) => assert.ok(p.label && p.tugas, 'peran ' + p.id));
  assertOptions(O.langkah.items, 'organisasi.langkah', 6);
  assert.deepEqual(sorted(O.langkah.urutan), sorted(ids(O.langkah.items)));
});

test('konsep: kartu istilah lengkap dan petunjuk bertingkat', () => {
  const K = D.konsep;
  ['redundansi', 'atomik', 'kunci', 'fd', 'parsial', 'transitif', 'nf1', 'nf2', 'nf3'].forEach(
    (id) => assert.ok(ids(K.kartu).includes(id), 'kartu ' + id)
  );
  K.kartu.forEach((k) => assert.ok(k.istilah && k.def && k.contoh, 'kartu ' + k.id));
  assert.ok(K.petunjuk.length >= 2);
  assert.ok(K.pertanyaan.length >= 4);
});

test('nf1: kunci primer 1NF unik pada baris hasil perataan', () => {
  const t = tabel1NF();
  assert.equal(E.bentukNormal(t), 1, 'tabel 1NF masih punya parsial');
  const kunci = t.baris.map((b) => t.pk.map((k) => b[k]).join('|'));
  assert.equal(new Set(kunci).size, kunci.length, '(No Nota, Kode Barang) unik');
  const q = D.nf1.pertanyaan.find((x) => x.id === 'n1q2');
  assert.equal(q.correct, 'gabung');
  const nota = t.baris.map((b) => b.nota);
  assert.notEqual(new Set(nota).size, nota.length, 'No Nota saja tidak unik');
  const nisKode = t.baris.map((b) => b.nis + '|' + b.kode);
  assert.notEqual(new Set(nisKode).size, nisKode.length, '(NIS, Kode Barang) tidak unik');
});

test('ketergantungan: kunci pemilahan = jenisKetergantungan engine', () => {
  const K = D.ketergantungan;
  assertSortItems(K.items, K.kategori, 'ketergantungan');
  assert.deepEqual(sorted(ids(K.items)), sorted(ids(D.rekap.fd)), 'setiap FD dipilah');
  K.items.forEach((it) => {
    const fd = D.rekap.fd.find((f) => f.id === it.id);
    assert.equal(it.teks, E.fdTeks(fd, D.rekap), it.id + ': teks = fdTeks');
    assert.equal(it.correct, E.jenisKetergantungan(fd, D.rekap), it.id + ': jenis');
  });
});

test('dekomposisi: kunci 2NF & 3NF valid menurut engine', () => {
  const asal = tabel1NF();
  assert.deepEqual(plain(E.periksaDekomposisi(asal, D.hasil2NF, 2)), [], '2NF valid');
  assert.ok(E.periksaDekomposisi(asal, D.hasil2NF).length > 0, '2NF belum 3NF');
  assert.deepEqual(plain(E.periksaDekomposisi(asal, D.hasil3NF)), [], '3NF valid');
  D.hasil3NF.forEach((t) =>
    assert.equal(E.bentukNormal(Object.assign({ fd: asal.fd }, t)), 3, t.id + ' 3NF')
  );
  const r = E.hitungDekomposisi(asal, D.hasil3NF);
  assert.equal(r.berulang, 0, 'tidak ada sel mengulang fakta setelah 3NF');
  assert.ok(E.hitungRedundansi(asal).berulang > 0, 'tabel 1NF masih redundan');
});

test('dekomposisi: kunci pemilahan atribut konsisten dengan tabel kunci', () => {
  const Dk = D.dekomposisi;
  function cek(items, kategori, hasil, name) {
    assertSortItems(items, kategori, name);
    items.forEach((it) => {
      const t = hasil.find((x) => x.id === it.correct);
      assert.ok(t, name + '.' + it.id + ': tabel ' + it.correct);
      const k = t.kolom.find((x) => x.id === it.id);
      assert.ok(k, name + '.' + it.id + ': ada di tabel ' + t.id);
      assert.equal(it.teks, k.teks, name + '.' + it.id + ': teks = nama kolom');
      assert.ok(!t.pk.includes(it.id), name + '.' + it.id + ': bukan kunci primer tabelnya');
    });
    /* Setiap atribut bukan kunci tabel tujuan dipilah. */
    const harus = hasil
      .filter((t) => ids(kategori).includes(t.id))
      .flatMap((t) => t.kolom.filter((k) => !t.pk.includes(k.id)).map((k) => k.id + '@' + t.id));
    assert.deepEqual(sorted(items.map((it) => it.id + '@' + it.correct)), sorted(harus));
  }
  cek(Dk.atribut2NF, Dk.kategori2NF, D.hasil2NF, 'atribut2NF');
  cek(Dk.atribut3NF, Dk.kategori3NF, D.hasil3NF, 'atribut3NF');
  /* Langkah 3NF memecah tabel Nota (sementara) hasil 2NF. */
  const nota2 = D.hasil2NF.find((t) => t.id === 'nota2');
  assert.deepEqual(
    sorted(ids(Dk.atribut3NF)),
    sorted(nota2.kolom.filter((k) => !nota2.pk.includes(k.id)).map((k) => k.id))
  );
  assert.equal(E.bentukNormal(Object.assign({ fd: D.rekap.fd }, nota2)), 2);
});

test('sajikan: klaim presentasi berdiagnosa', () => {
  assertMulti(D.sajikan.klaim.opsi, 'sajikan.klaim', 6);
});

test('evaluasi TEFA: kunci soal sesuai engine, Tim Merah memang keliru', () => {
  const Ev = D.evaluasi;
  const t = Ev.tabel;
  assert.equal(E.bentukNormal(t), 0, 'tabel servis belum 1NF');
  const t1 = Object.assign({}, t, { baris: E.ratakanBaris(t.baris) });
  assert.equal(E.bentukNormal(t1), 1);
  const kunci = t1.baris.map((b) => t1.pk.map((k) => b[k]).join('|'));
  assert.equal(new Set(kunci).size, kunci.length, 'kunci 1NF servis unik');
  assert.deepEqual(plain(E.periksaDekomposisi(t1, Ev.kunci3NF)), [], 'kunci 3NF servis valid');

  const fdTek = t.fd.find((f) => f.id === 'tTek');
  const fdLay = { dari: ['klay'], ke: ['biaya'] };
  assert.equal(E.jenisKetergantungan(fdLay, t), Ev.soal.find((q) => q.id === 'ev3').correct);
  assert.equal(E.jenisKetergantungan(fdTek, t), Ev.soal.find((q) => q.id === 'ev4').correct);

  const U = Ev.ujiSilang;
  assertMulti(U.opsi, 'evaluasi.ujiSilang', 6);
  const salah = Array.from(E.periksaDekomposisi(t1, U.hasil));
  assert.ok(salah.length >= 3, 'periksaDekomposisi menemukan kesalahan: ' + salah.join(' | '));
  const pesan = salah.join('\n');
  assert.match(pesan, /No HP/);
  assert.match(pesan, /Servis baru memenuhi 2NF/);
  assert.match(pesan, /Detail Servis baru memenuhi 1NF/);
});

test('refleksi: skala Likert 5 tingkat dan pernyataan cukup', () => {
  const R = D.refleksi;
  assert.equal(R.skala.length, 5);
  assert.ok(R.pernyataan.length >= D.orientasi.kriteria.length);
  assert.ok(D.selesai.rangkuman.length >= 4);
});

test('initOrders mengacak SETIAP daftar pilihan sekali dan stabil', () => {
  vm.runInContext('initOrders();', E);
  const S = E.State;
  const perm = (order, list, name) =>
    assert.deepEqual(sorted(order), sorted(ids(list)), name + ' adalah permutasi opsi');

  perm(S.apersepsiOrder, D.orientasi.apersepsi.opsi, 'apersepsiOrder');
  semuaPertanyaan()
    .concat(D.evaluasi.soal)
    .forEach((q) => perm(S.qOrders[q.id], q.opsi, 'qOrders.' + q.id));

  [
    ['anomali', D.masalah.anomali.items, D.masalah.anomali.kategori],
    ['fd', D.ketergantungan.items, D.ketergantungan.kategori],
    ['a2', D.dekomposisi.atribut2NF, D.dekomposisi.kategori2NF],
    ['a3', D.dekomposisi.atribut3NF, D.dekomposisi.kategori3NF],
  ].forEach(([key, items, kategori]) => {
    perm(S.sortOrders[key], items, 'sortOrders.' + key);
    items.forEach((it) =>
      perm(S.sorts[key][it.id].optionOrder, kategori, key + '.' + it.id + '.optionOrder')
    );
  });

  perm(S.multi.akar.order, D.masalah.akar.opsi, 'multi.akar');
  perm(S.multi.klaim.order, D.sajikan.klaim.opsi, 'multi.klaim');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');

  const urut = S.langkah;
  perm(urut.pool, D.organisasi.langkah.items, 'langkah.pool');
  assert.notEqual(urut.pool.join(), D.organisasi.langkah.urutan.join(), 'urutan awal tidak benar');

  const snapshot = JSON.stringify(S);
  vm.runInContext('initOrders();', E);
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
});

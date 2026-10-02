'use strict';

/*
 * Tes konsistensi fase-f/mpi-1.2 (Cooperative Learning — menentukan
 * jenis relasi dan kardinalitas antar entitas dalam rancangan ERD):
 *   • tahap cocok dengan manifest dan enam sintaks Cooperative Learning;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • kuis awal dan evaluasi paralel (sama banyak) untuk poin peningkatan;
 *   • kunci jenis relasi konsisten dengan jenisDariKardinalitas (engine);
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-1.2';
const E = loadEngine([MOD + '/data.js', MOD + '/app.js']);
const D = E.DATA;

const JENIS_KE_KATEGORI = { '1:1': 'r11', '1:N': 'r1n', 'N:1': 'r1n', 'M:N': 'rmn' };

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

function assertSoal(q, name) {
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

function assertRelasi(rel, name) {
  assert.ok(rel.id && rel.a && rel.b && rel.kerja && rel.kerjaBalik, name + ': lengkap');
  assert.ok(E.uraiKardinalitas(rel.ab), name + ': ab valid');
  assert.ok(E.uraiKardinalitas(rel.ba), name + ': ba valid');
}

function semuaTopikPertanyaan() {
  return D.kelompok.topik.flatMap((t) => D.ahli.topik[t.id].pertanyaan);
}

function semuaPertanyaan() {
  return []
    .concat(D.informasi.pertanyaan)
    .concat(semuaTopikPertanyaan())
    .concat(D.rancang.pertanyaan);
}

test('tahap cocok dengan manifest dan sintaks Cooperative Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Cooperative Learning/);
  assert.match(m.h1, /Relasi/);
  assert.match(m.h1, /Kardinalitas/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'kuisAwal',
    'informasi',
    'kelompok',
    'ahli',
    'diskusi',
    'rancang',
    'evaluasi',
    'penghargaan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = D.tahap.map((t) => t.sintaks || '').join('|');
  [
    'Menyampaikan Tujuan',
    'Menyajikan Informasi',
    'Mengorganisasi Kelompok',
    'Membimbing Kelompok',
    'Evaluasi',
    'Memberikan Penghargaan',
  ].forEach((s) => assert.ok(sintaks.includes(s), 'sintaks ' + s + ' terpetakan'));
});

test('index.html modul dihasilkan dari template dan memuat skrip yang benar', () => {
  const html = fs.readFileSync(path.join(ROOT, MOD, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((x) => x[1]);
  assert.deepEqual(scripts, ['../../shared/engine.js', 'data.js', 'app.js']);
  assert.match(html, /id="resetModal"/);
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

test('panel tujuan belajar memuat TP dan kriteria', () => {
  const o = D.orientasi;
  assert.match(o.tp, /jenis relasi/i);
  assert.match(o.tp, /kardinalitas/i);
  assert.match(o.tp, /ERD/);
  assert.ok(o.tpJudul);
  assert.ok(o.kriteria.length >= 3);
  assertOptions(o.apersepsi.opsi, 'orientasi.apersepsi', 4);
  assert.ok(o.apersepsi.umpan);
});

test('setiap tahap punya kicker, tujuan, dan catatan peran guru', () => {
  D.tahap.forEach((t) => {
    const s = D[t.id];
    assert.ok(s, 'konten tahap ' + t.id);
    assert.ok(s.kicker, t.id + '.kicker');
    assert.ok(s.title, t.id + '.title');
    assert.ok(s.goal, t.id + '.goal');
    if (t.id !== 'selesai') assert.ok(s.guru, t.id + '.guru');
  });
});

test('kuis awal dan evaluasi paralel, kunci & umpan lengkap', () => {
  const a = D.kuisAwal.soal;
  const e = D.evaluasi.soal;
  assert.ok(a.length >= 5);
  assert.equal(a.length, e.length, 'kuis awal dan evaluasi sama banyak');
  a.concat(e).forEach((q) => assertSoal(q, q.id));
  const semua = ids(a.concat(e)).concat(ids(semuaPertanyaan()));
  assert.equal(new Set(semua).size, semua.length, 'id soal & pertanyaan unik lintas tahap');
});

test('pertanyaan penuntun lengkap', () => {
  semuaPertanyaan().forEach((q) => assertSoal(q, q.id));
  assert.ok(D.informasi.pertanyaan.length >= 3);
  assert.ok(D.rancang.pertanyaan.length >= 1);
});

test('informasi: tiga kartu konsep jenis relasi dengan contoh yang konsisten', () => {
  const k = D.informasi.konsep;
  assert.deepEqual(sorted(ids(k)), ['r11', 'r1n', 'rmn']);
  k.forEach((c) => {
    assert.ok(c.judul && c.def, c.id + ': judul & definisi');
    assertRelasi(c.rel, 'informasi.' + c.id);
    assert.equal(JENIS_KE_KATEGORI[E.jenisDariKardinalitas(c.rel.ab, c.rel.ba)], c.id);
  });
  assert.deepEqual(sorted(ids(D.informasi.notasi)), sorted(ids(E.KARDINALITAS_OPSI)));
});

test('kelompok: peran, topik ahli Jigsaw, dan norma tim berdiagnosa', () => {
  const K = D.kelompok;
  assert.ok(K.peran.length >= 4);
  assert.equal(new Set(ids(K.peran)).size, K.peran.length);
  K.peran.forEach((p) => assert.ok(p.label && p.tugas, 'peran ' + p.id));
  assert.equal(K.topik.length, 3);
  assertMulti(K.norma, 'kelompok.norma', 6);
});

test('ahli: setiap topik punya materi, contoh, dan pertanyaan yang cocok jenisnya', () => {
  D.kelompok.topik.forEach((t) => {
    const a = D.ahli.topik[t.id];
    assert.ok(a, 'materi ahli ' + t.id);
    assert.ok(a.materi.length >= 2, t.id + ': materi');
    assert.ok(a.pertanyaan.length >= 3, t.id + ': minimal 3 pertanyaan');
    assertRelasi(a.rel, 'ahli.' + t.id);
    assert.equal(JENIS_KE_KATEGORI[E.jenisDariKardinalitas(a.rel.ab, a.rel.ba)], t.kategori);
  });
  const ka = D.ahli.kartuAjar;
  assertOptions(ka.langkah, 'ahli.kartuAjar.langkah', 4);
  assert.deepEqual(sorted(ka.urutan), sorted(ids(ka.langkah)));
});

test('diskusi: aturan bisnis dipilah ke tiga jenis relasi', () => {
  const S = D.diskusi;
  assertOptions(S.kategori, 'diskusi.kategori', 3);
  assert.deepEqual(sorted(ids(S.kategori)), ['r11', 'r1n', 'rmn']);
  assert.ok(S.aturan.length >= 8);
  assert.equal(new Set(ids(S.aturan)).size, S.aturan.length);
  S.aturan.forEach((it) => {
    assert.ok(it.teks && it.explanation, it.id);
    assert.ok(ids(S.kategori).includes(it.correct), it.id + ': kunci');
  });
  S.kategori.forEach((k) =>
    assert.ok(S.aturan.filter((it) => it.correct === k.id).length >= 2, k.id + ' minimal 2')
  );
});

test('rancang: kardinalitas tiap relasi valid, jenis kunci konsisten, ada M:N', () => {
  const R = D.rancang.relasi;
  assert.ok(R.length >= 4);
  assert.equal(new Set(ids(R)).size, R.length);
  const jenis = R.map((rel) => {
    assertRelasi(rel, 'rancang.' + rel.id);
    assert.ok(rel.aturan, rel.id + ': aturan bisnis');
    const j = E.jenisDariKardinalitas(rel.ab, rel.ba);
    assert.equal(j, rel.jenis, rel.id + ': jenis kunci = turunan kardinalitas');
    return j;
  });
  ['1:1', '1:N', 'M:N'].forEach((j) => assert.ok(jenis.includes(j), 'rancang memuat relasi ' + j));
});

test('evaluasi: uji silang ERD tim lain cocok dengan aturan', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U, 'evaluasi.ujiSilang', 6);
  assert.ok(U.relasi.length >= 3);
  let salah = 0;
  U.relasi.forEach((rel) => {
    assertRelasi(rel, 'ujiSilang.' + rel.id);
    assert.ok(
      E.uraiKardinalitas(rel.timAb) && E.uraiKardinalitas(rel.timBa),
      rel.id + ': versi tim'
    );
    if (rel.timAb !== rel.ab || rel.timBa !== rel.ba) salah++;
  });
  assert.equal(salah, U.opsi.filter((o) => o.benar).length, 'satu opsi benar per relasi keliru');
});

test('penghargaan & refleksi: aturan poin, rangkuman, skala Likert 5 tingkat', () => {
  assert.ok(D.penghargaan.aturanPoin.length >= 4);
  assert.ok(D.penghargaan.rangkuman.length >= 3);
  assert.ok(D.penghargaan.jumlahAnggota >= 3);
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
  D.kuisAwal.soal
    .concat(D.evaluasi.soal)
    .concat(semuaPertanyaan())
    .forEach((q) => perm(S.qOrders[q.id], q.opsi, 'qOrders.' + q.id));
  perm(S.multi.norma.order, D.kelompok.norma.opsi, 'multi.norma');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');

  perm(S.sortOrders.aturan, D.diskusi.aturan, 'sortOrders.aturan');
  D.diskusi.aturan.forEach((it) =>
    perm(S.sorts.aturan[it.id].optionOrder, D.diskusi.kategori, 'aturan.' + it.id)
  );

  D.rancang.relasi.forEach((rel) => {
    perm(S.kardinalitas[rel.id].ab.order, E.KARDINALITAS_OPSI, rel.id + '.ab');
    perm(S.kardinalitas[rel.id].ba.order, E.KARDINALITAS_OPSI, rel.id + '.ba');
  });

  const urut = S.kartuAjar;
  perm(urut.pool, D.ahli.kartuAjar.langkah, 'kartuAjar.pool');
  assert.notEqual(urut.pool.join(), D.ahli.kartuAjar.urutan.join(), 'urutan awal tidak benar');

  const snapshot = JSON.stringify(S);
  vm.runInContext('initOrders();', E);
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
});

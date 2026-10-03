'use strict';

/*
 * Tes konsistensi fase-f/mpi-1.3 (Cooperative Learning — merancang ERD
 * lengkap berdasarkan hasil analisis kebutuhan data studi kasus):
 *   • tahap cocok dengan manifest dan enam sintaks Cooperative Learning;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • kuis awal dan evaluasi paralel (sama banyak) untuk poin peningkatan;
 *   • kunci ERD lengkap valid menurut periksaErd (engine), dan soal
 *     atribut, kunci primer, serta kunci tamu konsisten dengannya;
 *   • penanda frasa dokumen kebutuhan cocok dengan daftar frasa;
 *   • ERD tim lain pada uji silang memang keliru;
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-1.3';
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

function assertSortItems(items, kategori, name) {
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(it.teks && it.explanation, name + '.' + it.id + ': teks & penjelasan');
    assert.ok(ids(kategori).includes(it.correct), name + '.' + it.id + ': kunci');
  });
  kategori.forEach((k) =>
    assert.ok(items.filter((it) => it.correct === k.id).length >= 2, name + ': ' + k.id + ' ≥ 2')
  );
}

function semuaTopikPertanyaan() {
  return D.kelompok.topik.flatMap((t) => D.ahli.topik[t.id].pertanyaan);
}

function semuaPertanyaan() {
  return []
    .concat(D.informasi.pertanyaan)
    .concat(semuaTopikPertanyaan())
    .concat(D.rancang.kunci)
    .concat(D.relasi.pertanyaan);
}

function entitas(id) {
  return D.erd.entitas.find((e) => e.id === id);
}

test('tahap cocok dengan manifest dan sintaks Cooperative Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Cooperative Learning/);
  assert.match(m.h1, /ERD Lengkap/);
  assert.match(m.h1, /Analisis Kebutuhan/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'kuisAwal',
    'informasi',
    'kelompok',
    'ahli',
    'analisis',
    'rancang',
    'relasi',
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
  assert.match(html, /ERD Lengkap/);
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
  assert.match(o.tp, /ERD lengkap/);
  assert.match(o.tp, /analisis kebutuhan data/);
  assert.ok(o.tpJudul);
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'orientasi.apersepsi', 4);
  assert.ok(o.apersepsi.umpan);
});

test('setiap tahap punya kicker, tujuan, dan catatan peran guru', () => {
  D.tahap.forEach((t, i) => {
    const s = D[t.id];
    assert.ok(s, 'konten tahap ' + t.id);
    assert.ok(s.kicker.startsWith('Tahap ' + (i + 1) + ' '), t.id + '.kicker bernomor urut');
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
});

test('kunci ERD lengkap valid dan memuat semua komponen', () => {
  assert.deepEqual(Array.from(E.periksaErd(D.erd)), [], 'periksaErd tanpa kesalahan');
  assert.ok(D.erd.entitas.length >= 5);
  assert.ok(
    D.erd.entitas.some((e) => e.penghubung),
    'ada entitas penghubung'
  );
  const jenis = D.erd.relasi.map((rel) => {
    const j = E.jenisDariKardinalitas(rel.ab, rel.ba);
    assert.equal(j, rel.jenis, rel.id + ': jenis kunci = turunan kardinalitas');
    assert.ok(rel.aturan, rel.id + ': aturan bisnis');
    return j;
  });
  assert.ok(jenis.includes('1:N') && jenis.includes('M:N'), 'ada relasi 1:N dan M:N');
  const attrIds = D.erd.entitas.flatMap((e) => ids(e.atribut));
  assert.equal(new Set(attrIds).size, attrIds.length, 'id atribut ERD unik');
});

test('informasi: komponen ERD, contoh valid, dan langkah merancang', () => {
  const I = D.informasi;
  assert.ok(I.komponen.length >= 6);
  ['entitas', 'atribut', 'pk', 'fk', 'relasi', 'kardinalitas', 'penghubung'].forEach((k) =>
    assert.ok(ids(I.komponen).includes(k), 'komponen ' + k)
  );
  assert.deepEqual(Array.from(E.periksaErd(I.contoh)), [], 'contoh ERD mini valid');
  assertOptions(I.langkah.items, 'informasi.langkah', 5);
  assert.deepEqual(sorted(I.langkah.urutan), sorted(ids(I.langkah.items)));
});

test('kelompok: peran, empat topik ahli Jigsaw, dan norma tim berdiagnosa', () => {
  const K = D.kelompok;
  assert.ok(K.peran.length >= 4);
  assert.equal(new Set(ids(K.peran)).size, K.peran.length);
  K.peran.forEach((p) => assert.ok(p.label && p.tugas, 'peran ' + p.id));
  assert.equal(K.topik.length, 4);
  assertMulti(K.norma, 'kelompok.norma', 6);
});

test('ahli: setiap topik punya materi, contoh valid, ciri, dan 3 pertanyaan', () => {
  D.kelompok.topik.forEach((t) => {
    const a = D.ahli.topik[t.id];
    assert.ok(a, 'materi ahli ' + t.id);
    assert.ok(a.materi.length >= 2, t.id + ': materi');
    assert.ok(a.ciri, t.id + ': ciri');
    assert.ok(a.contoh.entitas.length || a.contoh.relasi.length, t.id + ': contoh');
    if (a.contoh.entitas.length) {
      assert.deepEqual(Array.from(E.periksaErd(a.contoh)), [], t.id + ': contoh valid');
    }
    assert.ok(a.pertanyaan.length >= 3, t.id + ': minimal 3 pertanyaan');
  });
});

test('analisis: penanda frasa dokumen cocok dengan daftar frasa', () => {
  const A = D.analisis;
  assertOptions(A.kategori, 'analisis.kategori', 4);
  const tanda = Array.from(A.dokumen).flatMap((dok) => Array.from(E.daftarFrasa(dok.teks)));
  assert.deepEqual(
    tanda.map((f) => f.id),
    ids(A.frasa),
    'urutan id frasa = urutan penanda'
  );
  tanda.forEach((f, i) => assert.equal(f.label, A.frasa[i].teks, f.id + ': teks sama persis'));
  assertSortItems(A.frasa, A.kategori, 'analisis.frasa');
});

test('rancang: atribut & kunci primer konsisten dengan kunci ERD', () => {
  const R = D.rancang;
  R.entitas.forEach((id) => assert.ok(entitas(id), 'entitas ' + id + ' ada di ERD'));
  assertSortItems(
    R.atribut,
    R.entitas.map((id) => ({ id })),
    'rancang.atribut'
  );
  /* Setiap atribut milik sendiri (bukan FK) entitas utama harus dipilah. */
  const harus = R.entitas.flatMap((id) =>
    entitas(id)
      .atribut.filter((a) => !a.fk)
      .map((a) => a.id + '@' + id)
  );
  assert.deepEqual(sorted(R.atribut.map((it) => it.id + '@' + it.correct)), sorted(harus));
  R.atribut.forEach((it) => {
    const a = entitas(it.correct).atribut.find((x) => x.id === it.id);
    assert.equal(it.teks, a.teks, it.id + ': teks = nama atribut ERD');
  });
  assert.deepEqual(sorted(R.kunci.map((q) => q.entitas)), sorted(R.entitas));
  R.kunci.forEach((q) => {
    assert.deepEqual(Array.from(E.kunciPrimer(entitas(q.entitas))), [q.correct], q.id);
  });
});

test('relasi: soal kunci tamu & M:N konsisten dengan letakKunciTamu', () => {
  const byId = Object.fromEntries(D.relasi.relasi.map((r) => [r.id, r]));
  assert.equal(D.relasi.relasi, D.erd.relasi, 'relasi tahap = relasi ERD');
  const dibahas = new Set();
  D.relasi.pertanyaan.forEach((q) => {
    const rel = byId[q.relasi];
    assert.ok(rel, q.id + ': relasi ' + q.relasi + ' ada');
    dibahas.add(rel.id);
    const letak = E.letakKunciTamu(rel);
    if (letak.jenis === 'fk') {
      assert.equal(letak.di, q.di, q.id + ': letak kunci tamu');
      assert.ok(
        entitas(q.di).atribut.some((a) => a.fk === letak.rujuk),
        q.id + ': ERD memuat kunci tamu itu'
      );
    } else {
      assert.equal(q.di, undefined, q.id + ': M:N tidak punya letak FK');
    }
  });
  assert.deepEqual(sorted(dibahas), sorted(ids(D.relasi.relasi)), 'setiap relasi dibahas');
  const mn = D.relasi.pertanyaan.find((q) => q.id === 'mnKunci');
  assert.equal(E.kunciPrimer(entitas('detail')).length, 2, 'penghubung berkunci gabungan');
  assert.equal(mn.correct, 'gabung');
});

test('evaluasi: ERD tim lain pada uji silang memang keliru', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U, 'evaluasi.ujiSilang', 6);
  const salah = Array.from(E.periksaErd(U.erd));
  assert.ok(salah.length >= 2, 'periksaErd menemukan kesalahan: ' + salah.join(' | '));
  assert.ok(U.opsi.filter((o) => o.benar).length >= salah.length);
});

test('penghargaan & refleksi: aturan poin, rangkuman, skala Likert 5 tingkat', () => {
  assert.ok(D.penghargaan.aturanPoin.length >= 4);
  assert.ok(D.penghargaan.rangkuman.length >= 4);
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

  perm(S.sortOrders.frasa, D.analisis.frasa, 'sortOrders.frasa');
  D.analisis.frasa.forEach((it) =>
    perm(S.sorts.frasa[it.id].optionOrder, D.analisis.kategori, 'frasa.' + it.id)
  );
  const kategoriEntitas = D.rancang.entitas.map((id) => ({ id }));
  perm(S.sortOrders.atribut, D.rancang.atribut, 'sortOrders.atribut');
  D.rancang.atribut.forEach((it) =>
    perm(S.sorts.atribut[it.id].optionOrder, kategoriEntitas, 'atribut.' + it.id)
  );

  D.relasi.relasi.forEach((rel) => {
    perm(S.kardinalitas[rel.id].ab.order, E.KARDINALITAS_OPSI, rel.id + '.ab');
    perm(S.kardinalitas[rel.id].ba.order, E.KARDINALITAS_OPSI, rel.id + '.ba');
  });

  const urut = S.langkahErd;
  perm(urut.pool, D.informasi.langkah.items, 'langkahErd.pool');
  assert.notEqual(urut.pool.join(), D.informasi.langkah.urutan.join(), 'urutan awal tidak benar');

  const snapshot = JSON.stringify(S);
  vm.runInContext('initOrders();', E);
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
});

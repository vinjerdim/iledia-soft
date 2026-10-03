'use strict';

/*
 * Tes konsistensi fase-f/mpi-2.1 (Inquiry Learning — konsep & fungsi
 * perintah SQL DDL serta identifikasi struktur basis data dari ERD):
 *   • tahap cocok dengan manifest dan enam sintaks Inquiry Learning;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • ERD lengkap menurut engine; hasil setiap langkah Lab DDL, kunci
 *     pemilahan bahasa/peran/tipe, urutan tabel, isian rumpang, dan
 *     kunci evaluasi konsisten dengan simulator DDL engine;
 *   • skrip Tim Biru memang keliru sesuai opsi yang benar;
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-2.1';
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
    .concat(D.eksperimen.pertanyaan)
    .concat(D.konsep.pertanyaan)
    .concat(D.identifikasi.pertanyaan)
    .concat(D.rakit.rumpang)
    .concat(D.uji.pertanyaan)
    .concat(D.kesimpulan.rumpang);
}

function soal(list, id) {
  return list.find((q) => q.id === id);
}

function labelBenar(q) {
  return q.opsi.find((o) => o.id === q.correct).label;
}

function skemaErd(erd, db) {
  const h = E.jalankanDdl(E.skemaKosong(), E.ddlSkripErd(erd, db));
  assert.equal(h.ok, true, 'skrip ERD lolos simulasi');
  return h.skema;
}

test('tahap cocok dengan manifest dan enam sintaks Inquiry Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.match(m.h1, /SQL DDL/);
  assert.match(m.h1, /ERD/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'hipotesis',
    'eksperimen',
    'konsep',
    'identifikasi',
    'rakit',
    'uji',
    'kesimpulan',
    'evaluasi',
    'refleksi',
    'selesai',
  ]);
  const sintaks = D.tahap.map((t) => t.sintaks || '').join('|');
  [
    'Sintaks 1 · Orientasi',
    'Sintaks 2 · Merumuskan Masalah',
    'Sintaks 3 · Merumuskan Hipotesis',
    'Sintaks 4 · Mengumpulkan Data',
    'Sintaks 5 · Menguji Hipotesis',
    'Sintaks 6 · Merumuskan Kesimpulan',
  ].forEach((s) => assert.ok(sintaks.includes(s), 'sintaks ' + s + ' terpetakan'));
  D.tahap.forEach((t) => {
    if (t.id === 'selesai') return;
    assert.ok(D[t.id] && D[t.id].kicker && D[t.id].title && D[t.id].goal, t.id + ': kepala');
    assert.ok(D[t.id].guru, t.id + ': catatan guru');
  });
});

test('index.html modul dihasilkan dari template dan berkas modul lama dihapus', () => {
  const html = fs.readFileSync(path.join(ROOT, MOD, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((x) => x[1]);
  assert.deepEqual(scripts, ['../../shared/engine.js', 'data.js', 'app.js']);
  assert.match(html, /id="resetModal"/);
  assert.match(html, /Perintah SQL DDL/);
  assert.match(html, /0 dari 12 tahap selesai/);
  ['app-core.js', 'app-stage-awal.js', 'app-stage-inti.js', 'app-stage-akhir.js'].forEach((f) =>
    assert.ok(!fs.existsSync(path.join(ROOT, MOD, f)), f + ' modul lama sudah dihapus')
  );
});

test('panel tujuan belajar memuat TP DDL & ERD dan kriteria', () => {
  const o = D.orientasi;
  assert.equal(
    o.tp,
    'Menjelaskan konsep dan fungsi perintah SQL DDL dalam pembuatan basis data serta mengidentifikasi struktur basis data berdasarkan rancangan ERD yang diberikan.'
  );
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'apersepsi');
  assert.ok(o.apersepsi.umpan);
  assert.equal(D.meta.model, 'Inquiry Learning');
});

test('ERD Perpustakaan & Lab RPL lengkap menurut engine dan berlima tabel', () => {
  [D.erd, D.erdLab].forEach((erd) => {
    assert.deepEqual(plain(E.periksaErd(erd)), []);
    assert.equal(E.strukturDariErd(erd).length, 5);
    erd.entitas.forEach((ent) =>
      ent.atribut.forEach((a) => assert.ok(a.tipe, ent.id + '.' + a.teks + ' bertipe'))
    );
  });
});

test('masalah: pertanyaan penyelidikan berdiagnosa dan rumusan minimal', () => {
  assertMulti(D.masalah.pertanyaan.opsi, 'masalah.pertanyaan', 6);
  assert.ok(D.masalah.rumusan.min >= 15);
});

test('hipotesis: setiap tebakan punya opsi dan bukti yang konsisten dengan engine', () => {
  const H = D.hipotesis;
  assertOptions(H.efek.opsi, 'hipotesis.efek', 5);
  assert.equal(new Set(H.efek.items.map((it) => it.benar)).size, H.efek.items.length);
  H.efek.items.forEach((it) => {
    assert.ok(ids(H.efek.opsi).includes(it.benar), it.id + ': kunci efek');
    assert.equal(E.klasifikasiPerintah(it.sql), 'ddl', it.sql + ' termasuk DDL');
  });
  H.prediksi.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.benar), q.id + ': kunci');
    assert.ok(q.bukti, q.id + ': bukti');
  });
  const st = E.strukturDariErd(D.erd);
  const pJumlah = H.prediksi.find((q) => q.id === 'pJumlah');
  assert.match(pJumlah.opsi.find((o) => o.id === pJumlah.benar).label, new RegExp('^' + st.length));
  const u = Array.from(E.urutanBuatTabel(D.erd, ['buku', 'kategori']));
  assert.ok(u.indexOf('kategori') < u.indexOf('buku'), 'kategori sebelum buku');
  const pFk = H.prediksi.find((q) => q.id === 'pFk');
  const pemilikNis = st.filter((t) => t.fk.some((f) => f.kolom === 'nis')).map((t) => t.nama);
  assert.deepEqual(plain(pemilikNis), [pFk.opsi.find((o) => o.id === pFk.benar).label]);
});

test('Lab DDL: hasil setiap langkah sesuai harapan dan mencakup semua perintah DDL', () => {
  const L = D.eksperimen.langkah;
  assert.equal(new Set(ids(L)).size, L.length);
  const st = { jalan: L.length, bebas: [], draf: '' };
  const h = E.putarKonsol(E.skemaKosong(), L, st);
  assert.equal(h.log.length, L.length, 'satu pernyataan per langkah');
  L.forEach((l, i) => {
    assert.equal(h.log[i].ok, l.harapOk, l.id + ': ' + h.log[i].pesan);
    assert.ok(l.amati, l.id + ': ajakan mengamati');
  });
  const kata = L.map((l) => l.sql.split(/\s+/)[0].toUpperCase());
  ['CREATE', 'USE', 'ALTER', 'INSERT', 'TRUNCATE', 'DROP', 'RENAME'].forEach((k) =>
    assert.ok(kata.includes(k), 'lab memuat ' + k)
  );
  const akhir = E.ddlDbAktif(h.skema);
  assert.deepEqual(plain(akhir.tabel.map((t) => t.nama)), ['anggota', 'peminjaman']);
  assert.match(h.log[1].pesan, /USE/);
  assert.match(h.log[4].pesan, /anggota/);
  assert.match(h.log[10].pesan, /dirujuk/);
  D.eksperimen.pertanyaan.forEach((q) => assertSoal(q, 'eksperimen.' + q.id));
});

test('kartu konsep & pilah bahasa SQL konsisten dengan klasifikasiPerintah', () => {
  const K = D.konsep;
  assert.ok(K.kartu.length >= 6);
  K.kartu.forEach((k) => assert.ok(k.ikon && k.istilah && k.def && k.contoh));
  assertSortItems(K.bahasa.items, K.bahasa.kategori, 'konsep.bahasa');
  K.bahasa.items.forEach((it) => assert.equal(E.klasifikasiPerintah(it.teks), it.correct, it.teks));
  assertSortItems(K.fungsi.items, K.fungsi.kategori, 'konsep.fungsi');
  K.fungsi.items.forEach((it) => {
    assert.equal(E.klasifikasiPerintah(it.teks), 'ddl', it.teks);
    const p = E.uraiDdl(it.teks)[0];
    assert.notEqual(p.jenis, 'galat', it.teks + ' sintaksnya valid');
  });
  K.pertanyaan.forEach((q) => assertSoal(q, 'konsep.' + q.id));
});

test('bedah ERD: kunci peran kolom & tipe data diturunkan dari strukturDariErd', () => {
  const I = D.identifikasi;
  const st = E.strukturDariErd(D.erd);
  const cari = (t, k) => {
    const tab = st.find((x) => x.nama === t);
    assert.ok(tab, 'tabel ' + t);
    const kol = tab.kolom.find((x) => x.nama === k);
    assert.ok(kol, t + '.' + k);
    return { tab, kol };
  };
  assertSortItems(I.peran.items, I.peran.kategori, 'identifikasi.peran');
  I.peran.items.forEach((it) => {
    const { tab } = cari(it.tabel, it.kolom);
    const pk = tab.pk.includes(it.kolom);
    const fk = tab.fk.some((f) => f.kolom === it.kolom);
    const harap = pk && fk ? 'pkfk' : pk ? 'pk' : fk ? 'fk' : 'biasa';
    assert.equal(it.correct, harap, it.id);
  });
  assertSortItems(I.tipe.items, I.tipe.kategori, 'identifikasi.tipe');
  I.tipe.items.forEach((it) => {
    const { kol } = cari(it.tabel, it.kolom);
    assert.equal(E.tipeDasar(kol.tipe), it.correct, it.id);
  });
  I.pertanyaan.forEach((q) => assertSoal(q, 'identifikasi.' + q.id));
  assert.match(labelBenar(soal(I.pertanyaan, 'iJumlah')), new RegExp('^' + st.length));
  const det = st.find((t) => t.nama === 'detail_pinjam');
  assert.match(labelBenar(soal(I.pertanyaan, 'iPkGabung')), new RegExp(det.pk.join(', ')));
  const tanpaFk = st.filter((t) => !t.fk.length).map((t) => t.nama);
  assert.deepEqual(plain(tanpaFk), ['kategori', 'anggota']);
  assert.equal(labelBenar(soal(I.pertanyaan, 'iTanpaFk')), tanpaFk.join(' dan '));
});

test('rakit: isian rumpang benar membentuk CREATE TABLE detail_pinjam yang sesuai ERD', () => {
  const R = D.rakit;
  R.rumpang.forEach((q, i) => {
    assertSoal(q, 'rakit.' + q.id);
    assert.ok(R.rumpangSql.includes('__' + (i + 1) + '__'), 'rumpang ' + (i + 1) + ' ada');
    assert.equal(labelBenar(q), R.isian[q.id], q.id + ': isian = label kunci');
  });
  let sql = R.rumpangSql;
  R.rumpang.forEach((q, i) => {
    sql = sql.replace('__' + (i + 1) + '__', R.isian[q.id]);
  });
  const st = E.strukturDariErd(D.erd);
  const urut = Array.from(E.urutanBuatTabel(D.erd)).filter((n) => n !== 'detail_pinjam');
  const skrip =
    'CREATE DATABASE db; USE db; ' +
    urut.map((n) => E.ddlBuatTabel(st.find((t) => t.nama === n))).join(' ') +
    sql;
  const h = E.jalankanDdl(E.skemaKosong(), skrip);
  assert.equal(h.ok, true, JSON.stringify(h.log[h.log.length - 1]));
  assert.deepEqual(plain(E.periksaStruktur(h.skema, st)), []);
});

test('rakit: urutan teracak awal tidak sah dan urutan murid yang sah diterima', () => {
  vm.runInContext('initOrders();', E);
  const urut = E.State.urutan;
  assert.equal(urut.pool.length, 5);
  assert.notEqual(
    urut.pool.join(),
    Array.from(E.urutanBuatTabel(D.erd)).join(),
    'kolam awal tidak sama dengan urutan kunci'
  );
  const sah = ['anggota', 'kategori', 'buku', 'peminjaman', 'detail_pinjam'];
  urut.placed = sah.slice();
  urut.pool = [];
  urut.correct = true;
  assert.deepEqual(plain(vm.runInContext('jawabanUrutan()', E)), sah);
  assert.match(vm.runInContext('skripTim()', E), /USE db_perpus;\n\nCREATE TABLE anggota/);
  vm.runInContext('store.reset(); initOrders();', E);
});

test('uji & kesimpulan: pertanyaan valid dan skrip ERD lolos periksaStruktur', () => {
  D.uji.pertanyaan.forEach((q) => assertSoal(q, 'uji.' + q.id));
  D.kesimpulan.rumpang.forEach((q) => assertSoal(q, 'kesimpulan.' + q.id));
  assert.ok(D.kesimpulan.paragraf.length >= 3);
  const s = skemaErd(D.erd, D.namaDb);
  assert.deepEqual(plain(E.periksaStruktur(s, E.strukturDariErd(D.erd))), []);
});

test('evaluasi: kunci kuis Lab RPL konsisten dengan engine', () => {
  const Ev = D.evaluasi;
  Ev.soal.forEach((q) => assertSoal(q, 'evaluasi.' + q.id));
  const st = E.strukturDariErd(D.erdLab);
  assert.match(labelBenar(soal(Ev.soal, 'ev1')), new RegExp('^' + st.length));

  const det = st.find((t) => t.nama === 'detail_peminjaman');
  assert.match(labelBenar(soal(Ev.soal, 'ev2')), new RegExp('\\(' + det.pk.join(', ') + '\\)'));

  const ev3 = soal(Ev.soal, 'ev3');
  ev3.opsi.forEach((o) => {
    const t = st.find((x) => x.nama === o.label);
    assert.ok(t, 'opsi ev3 ' + o.label + ' adalah tabel');
    assert.equal(t.fk.length === 0, o.id === ev3.correct, 'ev3 ' + o.label);
  });

  const s = skemaErd(D.erdLab, 'db_lab');
  const ev4 = soal(Ev.soal, 'ev4');
  ev4.opsi.forEach((o) => {
    const h = E.jalankanDdl(s, o.label);
    const ada = h.ok && E.ddlTabel(h.skema, 'siswa').kolom.some((k) => k.nama === 'no_hp');
    assert.equal(ada, o.id === ev4.correct, 'ev4 ' + o.label);
  });

  const isi = E.jalankanDdl(s, "INSERT INTO detail_peminjaman VALUES (1, 'L01', 'baik');").skema;
  const ev5 = soal(Ev.soal, 'ev5');
  ev5.opsi.forEach((o) => {
    const h = E.jalankanDdl(isi, o.label);
    const t = h.ok && E.ddlTabel(h.skema, 'detail_peminjaman');
    const tepat = !!t && t.baris === 0 && t.kolom.length === 3;
    assert.equal(tepat, o.id === ev5.correct, 'ev5 ' + o.label);
  });

  const alat = st.find((t) => t.nama === 'alat');
  const kat = alat.kolom.find((k) => k.nama === 'id_kategori');
  assert.match(labelBenar(soal(Ev.soal, 'ev6')), new RegExp('^' + E.tipeDasar(kat.tipe)));

  const ev7 = soal(Ev.soal, 'ev7');
  ev7.opsi.forEach((o) =>
    assert.equal(E.klasifikasiPerintah(o.label) === 'ddl', o.id === ev7.correct, o.label)
  );
});

test('evaluasi: skrip Tim Biru gagal dan kesalahannya sesuai opsi yang benar', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U.opsi, 'evaluasi.ujiSilang', 6);
  const h = E.jalankanDdl(E.skemaKosong(), U.skrip);
  assert.equal(h.ok, false, 'skrip Tim Biru ditolak DBMS');
  assert.match(h.log[h.log.length - 1].pesan, /kategori_alat/);

  /* Bila urutan dibetulkan (kategori_alat dahulu), galat tipe muncul. */
  const p = E.pecahPernyataan(U.skrip);
  const iAlat = p.findIndex((x) => /^CREATE TABLE alat/.test(x));
  const iKat = p.findIndex((x) => /^CREATE TABLE kategori_alat/.test(x));
  const tukar = p.slice();
  tukar[iAlat] = p[iKat];
  tukar[iKat] = p[iAlat];
  const h2 = E.jalankanDdl(E.skemaKosong(), tukar.join(';\n') + ';');
  assert.equal(h2.ok, false);
  assert.match(h2.log[h2.log.length - 1].pesan, /tipe/i);

  /* Bila tipe juga dibetulkan, skrip jalan tetapi kunci primer detail keliru. */
  const h3 = E.jalankanDdl(
    E.skemaKosong(),
    tukar.join(';\n').replace('id_kategori VARCHAR(5)', 'id_kategori INT') + ';'
  );
  assert.equal(h3.ok, true);
  const selisih = Array.from(E.periksaStruktur(h3.skema, E.strukturDariErd(D.erdLab)));
  assert.equal(selisih.length, 1, selisih.join(' | '));
  assert.match(selisih[0], /Kunci primer tabel detail_peminjaman/);
  assert.deepEqual(sorted(U.opsi.filter((o) => o.benar).map((o) => o.id)), ['pk', 'tipe', 'urut']);
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

  D.hipotesis.efek.items.forEach((it) =>
    perm(S.hipoOrders[it.id], D.hipotesis.efek.opsi, 'hipoOrders.' + it.id)
  );
  D.hipotesis.prediksi.forEach((q) => perm(S.hipoOrders[q.id], q.opsi, 'hipoOrders.' + q.id));

  [
    ['bahasa', D.konsep.bahasa],
    ['fungsi', D.konsep.fungsi],
    ['peran', D.identifikasi.peran],
    ['tipe', D.identifikasi.tipe],
  ].forEach(([key, s]) => {
    perm(S.sortOrders[key], s.items, 'sortOrders.' + key);
    s.items.forEach((it) =>
      perm(S.sorts[key][it.id].optionOrder, s.kategori, key + '.' + it.id + '.optionOrder')
    );
  });

  perm(S.multi.pertanyaan.order, D.masalah.pertanyaan.opsi, 'multi.pertanyaan');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');
  perm(
    S.urutan.pool,
    E.strukturDariErd(D.erd).map((t) => ({ id: t.nama })),
    'urutan.pool'
  );
  assert.deepEqual(plain(S.konsol.lab), { jalan: 0, bebas: [], draf: '' });

  const snapshot = JSON.stringify(S);
  vm.runInContext('initOrders();', E);
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer dan setiap tahap punya renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
  const r = vm.runInContext('Object.keys(RENDERERS)', E);
  assert.deepEqual(plain(r), ids(D.tahap));
});

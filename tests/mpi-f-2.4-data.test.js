'use strict';

/*
 * Tes konsistensi fase-f/mpi-2.4 (Problem Based Learning — menghapus
 * basis data dan tabel dengan DROP DATABASE dan DROP TABLE secara tepat
 * serta memahami konsekuensi dan risikonya):
 *   • tahap cocok dengan manifest dan lima sintaks PBL;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • server Bank Sampah berisi data; skrip kunci berantai menghapus
 *     TEPAT target dan basis data aktif tetap bank_sampah;
 *   • setiap editor menolak kesalahan umum dengan pesan yang tepat
 *     (induk sebelum anak, tabel inti ikut terhapus, basis data yang
 *     salah, basis data aktif lepas, TRUNCATE pada tabel inti);
 *   • contoh kartu, kunci pemilahan dampak, konsol latihan, skrip tim
 *     junior, kunci evaluasi TEFA, dan skrip Tim Biru konsisten dengan
 *     simulator engine;
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-2.4';
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

function run(src) {
  return vm.runInContext(src, E);
}

function teks(html) {
  return String(html)
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
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

function soal(list, id) {
  return list.find((q) => q.id === id);
}

function teksBenar(q) {
  return teks(q.opsi.find((o) => o.id === q.correct).label);
}

function benarIds(opsi) {
  return sorted(opsi.filter((o) => o.benar).map((o) => o.id));
}

function semuaPertanyaan() {
  return []
    .concat(D.konsep.pertanyaan)
    .concat(D.hapusTabel.pertanyaan)
    .concat(D.hapusDb.pertanyaan);
}

function server(srv) {
  return E.skemaBanyakDb((srv || D.server).db, (srv || D.server).aktif);
}

function db(skema, nama) {
  return E.cariNama(skema.basisData, nama);
}

const KUNCI_SEMUA = [D.kunci.hapusTabel, D.kunci.hapusDb].join('\n');

test('tahap cocok dengan manifest dan lima sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.h1, /DROP DATABASE/);
  assert.match(m.h1, /DROP TABLE/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'organisasi',
    'konsep',
    'hapusTabel',
    'hapusDb',
    'risiko',
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
  D.tahap.forEach((t) => {
    if (t.id === 'selesai') return;
    assert.ok(D[t.id] && D[t.id].kicker && D[t.id].title && D[t.id].goal, t.id + ': kepala');
    assert.ok(D[t.id].guru, t.id + ': catatan guru');
  });
});

test('index.html modul dihasilkan dari template', () => {
  const html = fs.readFileSync(path.join(ROOT, MOD, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((x) => x[1]);
  assert.deepEqual(scripts, ['../../shared/engine.js', 'data.js', 'app.js']);
  assert.match(html, /id="resetModal"/);
  assert.match(html, /DROP DATABASE/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('panel tujuan belajar memuat TP DROP dan kriteria', () => {
  const o = D.orientasi;
  assert.equal(
    o.tp,
    'Menghapus basis data dan tabel menggunakan perintah DROP DATABASE dan DROP TABLE secara tepat serta memahami konsekuensi dan risiko penggunaannya.'
  );
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'apersepsi');
  assert.ok(o.apersepsi.umpan);
  assert.equal(D.meta.model, 'Problem Based Learning');
});

test('server Bank Sampah berisi data; target ada dan tabel inti tidak termasuk target', () => {
  const s = server();
  assert.equal(s.aktif, 'bank_sampah');
  assert.deepEqual(plain(s.basisData.map((b) => b.nama)), [
    'bank_sampah',
    'bank_sampah_uji',
    'tefa_servis',
  ]);
  D.server.db.forEach((b) => {
    assert.ok(b.ket, b.nama + ': keterangan');
    b.struktur.forEach((t) => assert.ok(b.baris[t.nama] > 0, b.nama + '.' + t.nama + ' berisi'));
  });
  assert.equal(E.ddlTabel(s, 'setoran').baris, 1342);
  assert.equal(E.ddlTabel(s, 'nasabah').baris, 128);
  /* Setiap target memang ada di server. */
  const semua = D.target.semua;
  semua.db.forEach((n) => assert.ok(db(s, n), 'target db ' + n));
  semua.tabel.forEach((t) => assert.ok(E.cariNama(db(s, t.db).tabel, t.nama), t.nama));
  ['nasabah', 'setoran', 'jenis_sampah', 'petugas'].forEach((n) =>
    assert.ok(!semua.tabel.some((t) => t.nama === n), n + ' bukan target')
  );
  assert.ok(!semua.db.includes('bank_sampah') && !semua.db.includes('tefa_servis'));
  /* pemenang_kuis merujuk kuis_hadiah: urutan anak → induk penting. */
  const pk = E.ddlTabel(s, 'pemenang_kuis');
  assert.ok(pk.fk.some((f) => f.rujukTabel === 'kuis_hadiah'));
});

test('skrip kunci berantai menghapus TEPAT target; data tabungan & TEFA utuh', () => {
  const awal = server();
  const h = E.periksaSkripDdl(KUNCI_SEMUA, null, {
    awal: awal,
    namaDb: 'bank_sampah',
    hapus: D.target.semua,
  });
  assert.equal(h.lulus, true, h.salah.join('; ') + JSON.stringify(plain(h.log)));
  const d = E.dampakHapus(awal, h.skema);
  assert.deepEqual(plain(d.db.map((x) => x.nama)), ['bank_sampah_uji']);
  assert.deepEqual(sorted(d.tabel.map((x) => x.nama)), [
    'kuis_hadiah',
    'pemenang_kuis',
    'setoran_impor_tmp',
  ]);
  assert.equal(d.dikosongkan.length, 0);
  assert.equal(d.baris, 57 + 12 + 3 + 36, 'angka yang dikutip di klaim sajikan');
  ['nasabah', 'setoran', 'jenis_sampah', 'petugas'].forEach((n) =>
    assert.equal(E.ddlTabel(h.skema, n).baris, E.ddlTabel(awal, n).baris, n + ' utuh')
  );
  assert.equal(h.skema.aktif, 'bank_sampah');
  assert.ok(
    E.uraiDdl(KUNCI_SEMUA).every((p) =>
      ['dropTable', 'dropDatabase', 'showDatabases', 'showTables', 'selectDatabase'].includes(
        p.jenis
      )
    ),
    'kunci hanya memakai DROP dan perintah pengecekan'
  );
});

test('skrip kunci setiap editor lulus di atas skrip tim sebelumnya; kerangka belum', () => {
  run('store.reset(); initOrders();');
  ['hapusTabel', 'hapusDb'].forEach((k) => {
    const opts = run('editorOpts(' + JSON.stringify(k) + ')');
    assert.ok(opts.label && opts.kerangka && opts.petunjuk.length >= 2, k + ': teks editor');
    assert.ok(opts.server && opts.hapus && opts.namaDb === 'bank_sampah', k + ': opsi');
    const h = E.periksaSkripDdl(D.kunci[k], null, opts);
    assert.equal(h.lulus, true, k + ': ' + h.salah.join('; ') + JSON.stringify(plain(h.log)));
    assert.equal(E.periksaSkripDdl(opts.kerangka, null, opts).lulus, false, k);
    assert.equal(E.periksaSkripDdl('SHOW TABLES;', null, opts).lulus, false, k + ': belum hapus');
  });
});

test('editor hapus tabel: induk dulu ditolak, tabel inti & DB lain tidak boleh ikut', () => {
  run('store.reset(); initOrders();');
  const o = run('editorOpts("hapusTabel")');
  const cek = (sql) => E.periksaSkripDdl(sql, null, o);
  const induk = cek(
    'DROP TABLE setoran_impor_tmp;\nDROP TABLE kuis_hadiah;\nDROP TABLE pemenang_kuis;'
  );
  assert.equal(induk.ok, false);
  assert.match(induk.log[1].pesan, /masih dirujuk kunci tamu tabel pemenang_kuis/);
  assert.equal(
    cek('DROP TABLE IF EXISTS setoran_impor_tmp, pemenang_kuis, kuis_hadiah;').lulus,
    true,
    'satu DROP TABLE banyak tabel'
  );
  assert.match(
    cek(D.kunci.hapusTabel + '\nDROP TABLE setoran;').salah.join(' '),
    /Tabel bank_sampah\.setoran ikut terhapus — 1342 baris data hilang/
  );
  assert.match(
    cek(D.kunci.hapusTabel + '\nTRUNCATE TABLE setoran;').salah.join(' '),
    /Isi tabel bank_sampah\.setoran ikut dikosongkan/
  );
  assert.match(
    cek('DROP TABLE setoran_impor_tmp;\nDROP TABLE pemenang_kuis;').salah.join(' '),
    /Tabel bank_sampah\.kuis_hadiah masih ada/
  );
  assert.match(
    cek(D.kunci.hapusTabel + '\nDROP DATABASE bank_sampah_uji;').salah.join(' '),
    /Basis data bank_sampah_uji ikut terhapus/,
    'basis data dihapus di tahap berikutnya'
  );
  /* Bekerja di basis data yang salah: tabelnya tidak ada di sana. */
  const salahDb = cek('USE bank_sampah_uji;\nDROP TABLE setoran_impor_tmp;');
  assert.equal(salahDb.ok, false);
  assert.match(salahDb.log[1].pesan, /tidak ada/);
});

test('editor hapus basis data: DB yang salah dan DB aktif yang lepas ditolak', () => {
  run('store.reset(); initOrders();');
  const o = run('editorOpts("hapusDb")');
  assert.equal(db(o.awal, 'bank_sampah_uji').tabel.length, 4, 'awal = setelah skrip tabel');
  assert.equal(E.ddlTabel(o.awal, 'kuis_hadiah'), null);
  const cek = (sql) => E.periksaSkripDdl(sql, null, o);
  const salah = cek('DROP DATABASE bank_sampah;');
  assert.equal(salah.ok, true, 'DBMS menerimanya — tanpa bertanya');
  assert.match(
    salah.salah.join(' '),
    /Basis data bank_sampah ikut terhapus — 4 tabel dan 1485 baris/
  );
  assert.match(salah.salah.join(' '), /bank_sampah_uji masih ada/);
  const lepas = cek('USE bank_sampah_uji;\nDROP DATABASE bank_sampah_uji;');
  assert.equal(lepas.ok, true);
  assert.match(lepas.salah.join(' '), /bank_sampah belum dipilih dengan USE/);
  assert.equal(
    cek('USE bank_sampah_uji;\nDROP DATABASE bank_sampah_uji;\nUSE bank_sampah;').lulus,
    true
  );
  assert.match(
    cek('DROP DATABASE bank_sampah_uji;\nDROP DATABASE tefa_servis;').salah.join(' '),
    /tefa_servis ikut terhapus — 3 tabel dan 369 baris/
  );
  const typo = cek('DROP DATABASE bank_sampah_ujii;');
  assert.equal(typo.ok, false, 'salah ketik seperti di log insiden');
  assert.match(typo.log[0].pesan, /bank_sampah_ujii tidak ada/);
});

test('editor berantai memakai skrip murid yang lulus sebagai skema awal', () => {
  run('store.reset(); initOrders();');
  const ed = E.State.editor.hapusTabel;
  ed.jalan = 'DROP TABLE IF EXISTS setoran_impor_tmp, pemenang_kuis, kuis_hadiah;';
  ed.lulus = true;
  assert.match(run('skripTim()'), /setoran_impor_tmp, pemenang_kuis, kuis_hadiah/);
  assert.equal(run('hasilTim()').lulus, true);
  run('store.reset(); initOrders();');
});

test('masalah: log insiden, akar masalah berdiagnosa, dan rumusan minimal', () => {
  const M = D.masalah;
  assert.ok(M.log.some((l) => /DROP TABLE nasabah;.*foreign key/.test(l)));
  assert.ok(M.log.some((l) => /bank_sampah_ujii.*doesn't exist/.test(l)));
  assert.ok(M.log.some((l) => /setoran_impor_tmp tertinggal \(57 baris\)/.test(l)));
  assert.equal(server().basisData[0].tabel.find((t) => t.nama === 'setoran_impor_tmp').baris, 57);
  assertMulti(M.akar.opsi, 'masalah.akar', 6);
  assert.deepEqual(benarIds(M.akar.opsi), ['permanen', 'pilih', 'urutan']);
  assert.ok(M.rumusan.min >= 20);
  /* Insiden pertama memang ditolak simulator. */
  const h = E.jalankanDdl(server(), 'DROP TABLE nasabah;');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /dirujuk kunci tamu/);
});

test('organisasi: peran tim unik dan rencana langkah berurutan logis', () => {
  const O = D.organisasi;
  assert.ok(O.peran.length >= 3);
  assert.equal(new Set(ids(O.peran)).size, O.peran.length);
  O.peran.forEach((p) => assert.ok(p.label && p.tugas, p.id));
  assertOptions(O.rencana.items, 'rencana', 5);
  const pos = (re) => O.rencana.items.findIndex((x) => re.test(x.label));
  assert.ok(pos(/Daftar objek/) < pos(/Cek isi server/), 'daftar target sebelum mengecek');
  assert.ok(pos(/Cek isi server/) < pos(/[Cc]adangkan/), 'cek sebelum mencadangkan');
  assert.ok(pos(/[Cc]adangkan/) < pos(/Jalankan DROP/), 'cadangkan sebelum DROP');
  assert.ok(pos(/Jalankan DROP/) < pos(/Verifikasi/), 'DROP sebelum verifikasi');
  assert.ok(pos(/Verifikasi/) < pos(/Laporkan/), 'verifikasi sebelum melapor');
});

test('bekal sintaks: contoh kartu berjalan, pemilahan dampak sesuai simulator', () => {
  const K = D.konsep;
  assert.ok(K.kartu.length >= 6);
  K.kartu.forEach((k) => {
    assert.ok(k.istilah && k.def && k.contoh, k.istilah);
    const h = E.jalankanDdl(server(), k.contoh);
    assert.equal(h.ok, true, 'contoh kartu ' + k.istilah + ': ' + JSON.stringify(plain(h.log)));
  });
  assertSortItems(K.aksi.items, K.aksi.kategori, 'aksi');
  assertSortItems(K.dampak.items, K.dampak.kategori, 'dampak');
  K.dampak.items.forEach((it) => {
    assert.equal(it.teks, it.sql, it.id + ': teks = sql');
    const awal = server();
    const h = E.jalankanDdl(awal, it.sql);
    const d = E.dampakHapus(awal, h.skema);
    const dampak = !h.ok
      ? 'ditolak'
      : d.db.length || d.tabel.length
        ? 'semua'
        : d.dikosongkan.length
          ? 'isi'
          : 'aman';
    assert.equal(dampak, it.correct, it.id + ' (' + it.sql + ')');
  });
  /* Angka di penjelasan d5 sesuai simulator. */
  const d5 = E.dampakHapus(
    server(),
    E.jalankanDdl(server(), 'DROP DATABASE bank_sampah_uji;').skema
  );
  assert.match(
    K.dampak.items.find((x) => x.id === 'd5').explanation,
    new RegExp(d5.baris + ' baris')
  );
  K.pertanyaan.forEach((q) => assertSoal(q, 'konsep.' + q.id));
});

test('hapus tabel: konsol menolak induk, IF EXISTS melewati', () => {
  const H = D.hapusTabel;
  H.pertanyaan.forEach((q) => assertSoal(q, 'hapusTabel.' + q.id));
  const st = { jalan: H.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(run('skemaLab("hapusTabel")'), H.langkah, st);
  const okPerLangkah = H.langkah.map((l) =>
    h.log.filter((x) => x.langkah === l.id).every((x) => x.ok)
  );
  assert.deepEqual(plain(okPerLangkah), [true, false, true, true, false, true]);
  const pesan = (id) =>
    h.log
      .filter((x) => x.langkah === id)
      .map((x) => x.pesan)
      .join(' ');
  assert.match(pesan('t1'), /siswa \(30 baris\)/);
  assert.match(pesan('t2'), /dirujuk kunci tamu tabel siswa/);
  assert.match(pesan('t3'), /30 baris/);
  assert.match(pesan('t5'), /tidak ada/);
  assert.match(pesan('t6'), /dilewati \(IF EXISTS\)/);
  assert.equal(E.ddlDbAktif(h.skema).tabel.length, 0);
  H.langkah.forEach((l) => assert.ok(l.amati, l.id + ' punya pertanyaan pengamatan'));
});

test('hapus basis data: konsol menunjukkan basis data aktif yang lepas', () => {
  const H = D.hapusDb;
  H.pertanyaan.forEach((q) => assertSoal(q, 'hapusDb.' + q.id));
  const st = { jalan: H.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(run('skemaLab("hapusDb")'), H.langkah, st);
  const okPerLangkah = H.langkah.map((l) =>
    h.log.filter((x) => x.langkah === l.id).every((x) => x.ok)
  );
  assert.deepEqual(plain(okPerLangkah), [true, true, true, false, true, false]);
  const pesan = (id) =>
    h.log
      .filter((x) => x.langkah === id)
      .map((x) => x.pesan)
      .join(' ');
  assert.match(pesan('b2'), /Basis data aktif: latihan_uji/);
  assert.match(pesan('b3'), /2 tabel, 16 baris.*Tidak ada lagi basis data yang aktif/);
  assert.match(pesan('b4'), /Belum ada basis data yang dipilih/);
  assert.match(pesan('b5'), /Basis data aktif: latihan\./);
  assert.equal(h.skema.aktif, 'latihan');
  assert.equal(E.ddlTabel(h.skema, 'siswa').baris, 30, 'latihan tidak tersentuh');
  H.langkah.forEach((l) => assert.ok(l.amati, l.id));
});

test('risiko: skrip junior berjalan tanpa galat tetapi menghapus basis data utama', () => {
  const R = D.risiko;
  const h = run('hasilJunior()');
  assert.equal(h.ok, true, 'DBMS menerima semuanya');
  assert.ok(h.log.some((l) => /Isi tabel setoran dikosongkan \(1342 baris/.test(l.pesan)));
  const d = E.dampakHapus(server(), h.skema);
  assert.deepEqual(plain(d.db.map((x) => x.nama)), ['bank_sampah']);
  assert.ok(db(h.skema, 'bank_sampah_uji'), 'salinan latihan justru selamat');
  assertMulti(R.analisis.opsi, 'risiko.analisis', 6);
  assert.deepEqual(benarIds(R.analisis.opsi), ['cadangan', 'salahDb', 'truncate']);
  assert.ok(!/SELECT DATABASE/.test(R.skrip), 'opsi cadangan: tidak ada cek basis data aktif');
  assertMulti(R.aturan.opsi, 'risiko.aturan', 6);
  assert.deepEqual(benarIds(R.aturan.opsi), ['backup', 'cek', 'empatMata', 'salinan']);
});

test('sajikan: skrip pembersihan tim lolos, klaim benar didukung bukti', () => {
  run('store.reset(); initOrders();');
  const h = run('hasilTim()');
  assert.equal(h.lulus, true, h.salah.join('; '));
  assert.ok(db(h.skema, 'tefa_servis'));
  assertMulti(D.sajikan.klaim.opsi, 'klaim', 6);
  assert.deepEqual(benarIds(D.sajikan.klaim.opsi), ['target', 'tefa', 'utuh']);
  const d = E.dampakHapus(server(), h.skema);
  assert.match(
    D.sajikan.klaim.opsi.find((o) => o.id === 'nol').alasan,
    new RegExp(d.baris + ' baris')
  );
});

test('evaluasi: kunci kuis TEFA konsisten dengan engine', () => {
  const S = D.evaluasi.soal;
  assert.ok(S.length >= 6);
  S.forEach((q) => assertSoal(q, 'evaluasi.' + q.id));
  const awal = () => server(D.serverTefa);
  const target = {
    db: ['tefa_servis_2023'],
    tabel: ['servis_tmp', 'promo', 'klaim_promo'].map((n) => ({ db: 'tefa_servis', nama: n })),
  };
  /* e1–e3 berurutan menghapus tepat target. */
  const skrip = ['e1', 'e2', 'e3'].map((id) => teksBenar(soal(S, id))).join('\n');
  const h = E.periksaSkripDdl(skrip, null, { awal: awal(), namaDb: 'tefa_servis', hapus: target });
  assert.equal(h.lulus, true, h.salah.join('; ') + JSON.stringify(plain(h.log)));
  /* e2 dengan IF EXISTS tetap aman dijalankan dua kali. */
  assert.equal(E.jalankanDdl(h.skema, teksBenar(soal(S, 'e2'))).ok, true);
  /* Pengecoh e1 (basis data utama), e2 (TRUNCATE), e3 (induk dulu) memang keliru. */
  const cek = (id, label) =>
    E.periksaSkripDdl(skrip.replace(teksBenar(soal(S, id)), label), null, {
      awal: awal(),
      namaDb: 'tefa_servis',
      hapus: target,
    });
  const opsi = (id, re) => teks(soal(S, id).opsi.find((o) => re.test(teks(o.label))).label);
  assert.equal(cek('e1', opsi('e1', /DROP DATABASE tefa_servis;/)).lulus, false);
  assert.match(cek('e2', opsi('e2', /TRUNCATE/)).salah.join(' '), /servis_tmp masih ada/);
  const indukDulu = cek('e3', opsi('e3', /^DROP TABLE promo; DROP TABLE klaim_promo;$/));
  assert.equal(indukDulu.ok, false);
  assert.match(indukDulu.log.find((l) => !l.ok).pesan, /dirujuk kunci tamu tabel klaim_promo/);
  /* e4: TRUNCATE mengosongkan isi, tabel tetap. */
  const e4 = E.jalankanDdl(awal(), teksBenar(soal(S, 'e4')));
  const d4 = E.dampakHapus(awal(), e4.skema);
  assert.deepEqual(plain(d4.dikosongkan), [{ db: 'tefa_servis', nama: 'log_uji', baris: 300 }]);
  assert.equal(d4.tabel.length, 0);
  /* e5: basis data aktif ikut terhapus → CREATE ditolak. */
  const e5 = E.jalankanDdl(awal(), D.evaluasi.sqlE5);
  assert.equal(e5.ok, false);
  assert.match(e5.log[2].pesan, /Belum ada basis data yang dipilih/);
  /* e6: servis memang tidak dirujuk, sehingga DROP diterima dan 214 baris hilang. */
  const e6 = E.jalankanDdl(awal(), D.evaluasi.sqlE6);
  assert.equal(e6.ok, true);
  assert.equal(E.dampakHapus(awal(), e6.skema).baris, 214);
  assert.match(soal(S, 'e6').tanya, /214/);
});

test('evaluasi: skrip Tim Biru berjalan tanpa galat tetapi keliru sesuai opsi benar', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U.opsi, 'ujiSilang', 6);
  assert.deepEqual(benarIds(U.opsi), ['aktif', 'sisa', 'tefa']);
  run('store.reset(); initOrders();');
  const h = run('hasilTimBiru()');
  assert.equal(h.ok, true, 'DBMS menerima semua perintahnya');
  assert.equal(h.lulus, false);
  const salah = h.salah.join(' ');
  assert.match(salah, /Tabel bank_sampah\.kuis_hadiah masih ada/);
  assert.match(salah, /Basis data tefa_servis ikut terhapus — 3 tabel dan 369 baris/);
  assert.match(salah, /bank_sampah belum dipilih dengan USE/);
  assert.equal(h.salah.length, 3, 'tepat tiga kesalahan: ' + salah);
  assert.equal(E.ddlTabel(E.skemaBanyakDb(D.server.db, 'bank_sampah'), 'setoran').baris, 1342);
});

test('refleksi: skala Likert 5 tingkat dan pernyataan cukup', () => {
  const R = D.refleksi;
  assert.equal(R.skala.length, 5);
  assert.ok(R.pernyataan.length >= D.orientasi.kriteria.length);
  assert.ok(D.selesai.rangkuman.length >= 4);
});

test('initOrders mengacak SETIAP daftar pilihan sekali dan stabil', () => {
  run('store.reset(); initOrders();');
  const S = E.State;
  const perm = (order, list, name) =>
    assert.deepEqual(sorted(order), sorted(ids(list)), name + ' adalah permutasi opsi');

  perm(S.apersepsiOrder, D.orientasi.apersepsi.opsi, 'apersepsiOrder');
  semuaPertanyaan()
    .concat(D.evaluasi.soal)
    .forEach((q) => perm(S.qOrders[q.id], q.opsi, 'qOrders.' + q.id));

  [
    ['aksi', D.konsep.aksi],
    ['dampak', D.konsep.dampak],
  ].forEach(([key, s]) => {
    perm(S.sortOrders[key], s.items, 'sortOrders.' + key);
    s.items.forEach((it) =>
      perm(S.sorts[key][it.id].optionOrder, s.kategori, key + '.' + it.id + '.optionOrder')
    );
  });

  perm(S.multi.akar.order, D.masalah.akar.opsi, 'multi.akar');
  perm(S.multi.analisis.order, D.risiko.analisis.opsi, 'multi.analisis');
  perm(S.multi.aturan.order, D.risiko.aturan.opsi, 'multi.aturan');
  perm(S.multi.klaim.order, D.sajikan.klaim.opsi, 'multi.klaim');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');
  perm(S.rencana.pool, D.organisasi.rencana.items, 'rencana.pool');
  assert.notDeepEqual(plain(S.rencana.pool), ids(D.organisasi.rencana.items), 'rencana teracak');
  ['hapusTabel', 'hapusDb'].forEach((k) => {
    assert.deepEqual(plain(S.konsol[k]), { jalan: 0, bebas: [], draf: '' }, 'konsol ' + k);
    assert.equal(S.editor[k].percobaan, 0, 'editor ' + k);
  });

  const snapshot = JSON.stringify(S);
  run('initOrders();');
  assert.equal(JSON.stringify(E.State), snapshot, 'initOrders ulang tidak mengacak ulang');
});

test('app.js tidak mengacak di dalam renderer dan setiap tahap punya renderer', () => {
  const src = fs.readFileSync(path.join(ROOT, MOD, 'app.js'), 'utf8');
  const calls = src.match(/shuffleArray\(/g) || [];
  assert.equal(calls.length, 0, 'pakai ensure*() di initOrders, bukan shuffleArray langsung');
  const r = run('Object.keys(RENDERERS)');
  assert.deepEqual(plain(r), ids(D.tahap));
});

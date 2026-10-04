'use strict';

/*
 * Tes konsistensi fase-f/mpi-2.3 (Problem Based Learning — mengubah
 * struktur tabel dengan ALTER TABLE: menambah, mengubah, dan menghapus
 * kolom sesuai perubahan rancangan basis data):
 *   • tahap cocok dengan manifest dan lima sintaks PBL;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • rancangan v1 → v2 Bank Sampah konsisten: skrip kunci berantai
 *     mengubah v1 (berisi data) menjadi v2 tanpa kehilangan data;
 *   • setiap editor menolak kesalahan umum dengan pesan yang tepat
 *     (lupa NOT NULL saat MODIFY, panjang tetap, DROP+ADD, DROP+CREATE);
 *   • konsol latihan, kunci pemilahan dampak data, kunci evaluasi
 *     TEFA, dan skrip Tim Biru konsisten dengan simulator engine;
 *   • SETIAP daftar pilihan diacak oleh initOrders() di app.js, sekali,
 *     dan stabil saat dipanggil ulang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadEngine, ROOT } = require('./load-engine');

const MOD = 'fase-f/mpi-2.3';
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

function semuaPertanyaan() {
  return []
    .concat(D.konsep.pertanyaan)
    .concat(D.tambah.pertanyaan)
    .concat(D.ubah.pertanyaan)
    .concat(D.ubah.rumpang);
}

/* Struktur tanpa keterangan, urutan kolom & tabel dinormalkan. */
function bentuk(struktur) {
  return sorted(
    struktur.map((t) =>
      JSON.stringify({
        nama: t.nama,
        kolom: sorted(t.kolom.map((k) => [k.nama, E.tipeLengkap(k.tipe), !!k.notNull].join(' '))),
        pk: sorted(t.pk),
        fk: sorted(t.fk.map((f) => f.kolom + '>' + f.rujukTabel + '.' + f.rujukKolom)),
      })
    )
  );
}

const STRUKTUR_V1 = E.strukturDariErd(D.erdV1);
const STRUKTUR_V2 = E.strukturDariErd(D.erdV2);

function skemaV1() {
  return E.skemaDariStruktur(D.namaDb, STRUKTUR_V1, D.baris);
}

const KUNCI_SEMUA = [D.kunci.tambah, D.kunci.ubah, D.kunci.hapus].join('\n');

test('tahap cocok dengan manifest dan lima sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.h1, /ALTER TABLE/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'organisasi',
    'konsep',
    'tambah',
    'ubah',
    'hapus',
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
  assert.match(html, /ALTER TABLE/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('panel tujuan belajar memuat TP ALTER TABLE dan kriteria', () => {
  const o = D.orientasi;
  assert.equal(
    o.tp,
    'Mengubah struktur tabel menggunakan perintah ALTER TABLE (menambah, mengubah, dan menghapus kolom) sesuai kebutuhan perubahan rancangan basis data.'
  );
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'apersepsi');
  assert.ok(o.apersepsi.umpan);
  assert.equal(D.meta.model, 'Problem Based Learning');
});

test('rancangan v1 & v2 lengkap; v1 berisi data', () => {
  [D.erdV1, D.erdV2, D.erdTefa, D.erdTefaV2].forEach((erd) => {
    assert.deepEqual(plain(E.periksaErd(erd)), []);
    erd.entitas.forEach((ent) => {
      assert.ok(E.kunciPrimer(ent).length, ent.id + ' berkunci primer');
      ent.atribut.forEach((a) => assert.ok(a.tipe, ent.id + '.' + a.teks + ' bertipe'));
    });
  });
  STRUKTUR_V2.forEach((t) =>
    t.kolom.forEach((k) => assert.ok(k.ket, t.nama + '.' + k.nama + ' ket'))
  );
  assert.equal(D.namaDb, 'bank_sampah');
  STRUKTUR_V1.forEach((t) => assert.ok(D.baris[t.nama] > 0, t.nama + ' berisi data'));
  const v1 = skemaV1();
  assert.equal(E.ddlTabel(v1, 'setoran').baris, D.baris.setoran);
  assert.ok(E.cariNama(E.ddlTabel(v1, 'setoran').kolom, 'nama_nasabah'), 'kolom redundan ada');
  const saldo = STRUKTUR_V2.find((t) => t.nama === 'nasabah').kolom.find((k) => k.nama === 'saldo');
  assert.equal(saldo.bawaan, '0');
});

test('skrip kunci berantai mengubah v1 menjadi v2 tanpa kehilangan data', () => {
  const h = E.jalankanDdl(skemaV1(), KUNCI_SEMUA);
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.deepEqual(bentuk(E.strukturDariSkema(h.skema)), bentuk(STRUKTUR_V2));
  E.ddlDbAktif(h.skema).tabel.forEach((t) =>
    assert.equal(t.baris, D.baris[t.nama], t.nama + ': jumlah baris tetap')
  );
  const noWa = E.cariNama(E.ddlTabel(h.skema, 'nasabah').kolom, 'no_wa');
  assert.equal(noWa.isi, true, 'isi no_hp lama ikut ke no_wa');
  h.log.forEach((l) => assert.equal(l.kategori, 'ddl'));
  assert.ok(
    E.uraiDdl(KUNCI_SEMUA).every((p) => p.jenis === 'alterTable'),
    'kunci hanya memakai ALTER TABLE'
  );
});

test('skrip kunci setiap editor lulus di atas skrip tim sebelumnya; kerangka belum', () => {
  run('store.reset(); initOrders();');
  ['tambah', 'ubah', 'hapus'].forEach((k) => {
    const opts = run('editorOpts(' + JSON.stringify(k) + ')');
    assert.ok(opts.label && opts.kerangka && opts.petunjuk.length >= 2, k + ': teks editor');
    assert.ok(opts.ketat !== false && opts.panjang && opts.jagaIsi && opts.beda, k + ': opsi');
    const h = E.periksaSkripDdl(D.kunci[k], opts.harapan, opts);
    assert.equal(h.lulus, true, k + ': ' + h.salah.join('; ') + JSON.stringify(plain(h.log)));
    assert.equal(E.periksaSkripDdl(opts.kerangka, opts.harapan, opts).lulus, false, k);
    /* Belum mengerjakan apa pun → belum lulus. */
    assert.equal(E.periksaSkripDdl('-- kosong', opts.harapan, opts).lulus, false, k);
  });
});

test('editor tambah: DEFAULT, NOT NULL, dan tabel lain dicek', () => {
  run('store.reset(); initOrders();');
  const o = run('editorOpts("tambah")');
  const cek = (sql) => E.periksaSkripDdl(sql, o.harapan, o);
  assert.match(
    cek('ALTER TABLE nasabah ADD saldo INT NOT NULL, ADD email VARCHAR(60);').salah.join(' '),
    /saldo perlu nilai bawaan — tambahkan DEFAULT 0/
  );
  assert.match(
    cek('ALTER TABLE nasabah ADD saldo INT DEFAULT 0, ADD email VARCHAR(60);').salah.join(' '),
    /saldo wajib diisi/
  );
  assert.match(
    cek('ALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0, ADD email VARCHAR(30);').salah.join(
      ' '
    ),
    /email bertipe VARCHAR\(30\), seharusnya VARCHAR\(60\)/
  );
  assert.equal(
    cek(
      'ALTER TABLE nasabah ADD email VARCHAR(60) AFTER kelas;\nALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0 FIRST;'
    ).lulus,
    true,
    'dua pernyataan & posisi kolom bebas'
  );
  assert.match(
    cek(D.kunci.tambah + '\nALTER TABLE setoran DROP COLUMN nama_nasabah;').salah.join(' '),
    /nama_nasabah tidak ada di rancangan|belum punya kolom nama_nasabah/
  );
});

test('editor ubah: lupa NOT NULL, panjang tetap, dan DROP+ADD ditolak; CHANGE diterima', () => {
  run('store.reset(); initOrders();');
  const o = run('editorOpts("ubah")');
  const cek = (sql) => E.periksaSkripDdl(sql, o.harapan, o);
  const rename = 'ALTER TABLE nasabah RENAME COLUMN no_hp TO no_wa;';
  assert.match(
    cek('ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60);\n' + rename).salah.join(' '),
    /nama_jenis wajib diisi — tambahkan NOT NULL/
  );
  assert.match(
    cek('ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(30) NOT NULL;\n' + rename).salah.join(
      ' '
    ),
    /nama_jenis bertipe VARCHAR\(30\), seharusnya VARCHAR\(60\)/
  );
  const dropAdd = cek(
    'ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60) NOT NULL;\n' +
      'ALTER TABLE nasabah DROP COLUMN no_hp;\nALTER TABLE nasabah ADD no_wa VARCHAR(15);'
  );
  assert.equal(dropAdd.ok, true);
  assert.match(dropAdd.salah.join(' '), /nasabah\.no_wa .*data lama hilang/);
  assert.equal(
    cek(
      'ALTER TABLE jenis_sampah CHANGE nama_jenis nama_jenis VARCHAR(60) NOT NULL;\n' +
        'ALTER TABLE nasabah CHANGE no_hp no_wa VARCHAR(15);'
    ).lulus,
    true
  );
});

test('editor hapus: DROP TABLE + CREATE ulang ditolak karena data hilang', () => {
  run('store.reset(); initOrders();');
  const o = run('editorOpts("hapus")');
  const ulang =
    'DROP TABLE setoran;\n' + E.ddlBuatTabel(STRUKTUR_V2.find((t) => t.nama === 'setoran'));
  const h = E.periksaSkripDdl(ulang, o.harapan, o);
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.match(h.salah.join(' '), /Data tabel setoran hilang/);
  const fk = E.periksaSkripDdl('ALTER TABLE nasabah DROP COLUMN id_nasabah;', o.harapan, o);
  assert.equal(fk.ok, false);
  assert.match(fk.log[0].pesan, /dirujuk kunci tamu/);
});

test('editor berantai memakai skrip murid yang lulus sebagai skema awal', () => {
  run('store.reset(); initOrders();');
  const ed = E.State.editor.tambah;
  ed.jalan =
    'ALTER TABLE nasabah ADD email VARCHAR(60), ADD saldo INT NOT NULL DEFAULT 0 AFTER kelas;';
  ed.lulus = true;
  const o = run('editorOpts("ubah")');
  const nasabah = E.ddlTabel(o.awal, 'nasabah');
  assert.deepEqual(plain(nasabah.kolom.map((k) => k.nama)).slice(0, 4), [
    'id_nasabah',
    'nama_nasabah',
    'kelas',
    'saldo',
  ]);
  assert.match(run('skripTim()'), /AFTER kelas/);
  assert.equal(run('hasilTim()').lulus, true);
  run('store.reset(); initOrders();');
});

test('masalah: log galat, akar masalah berdiagnosa, dan rumusan minimal', () => {
  const M = D.masalah;
  assert.ok(M.log.some((l) => /Data too long for column 'nama_jenis'/.test(l)));
  assert.ok(M.log.some((l) => /Unknown column 'saldo'/.test(l)));
  assert.ok(M.log.some((l) => /Unknown column 'no_wa'/.test(l)));
  assertMulti(M.akar.opsi, 'masalah.akar', 6);
  assert.ok(M.rumusan.min >= 20);
  /* Nama jenis pada log memang lebih panjang dari VARCHAR(30) dan muat di v2. */
  const panjang = M.namaPanjang.length;
  const v1 = STRUKTUR_V1.find((t) => t.nama === 'jenis_sampah').kolom.find(
    (k) => k.nama === 'nama_jenis'
  );
  const v2 = STRUKTUR_V2.find((t) => t.nama === 'jenis_sampah').kolom.find(
    (k) => k.nama === 'nama_jenis'
  );
  assert.ok(panjang > E.panjangTipe(v1.tipe) && panjang <= E.panjangTipe(v2.tipe));
  assert.ok(M.log.some((l) => l.includes(M.namaPanjang)));
});

test('organisasi: peran tim unik dan rencana langkah berurutan logis', () => {
  const O = D.organisasi;
  assert.ok(O.peran.length >= 3);
  assert.equal(new Set(ids(O.peran)).size, O.peran.length);
  O.peran.forEach((p) => assert.ok(p.label && p.tugas, p.id));
  assertOptions(O.rencana.items, 'rencana', 5);
  const pos = (re) => O.rencana.items.findIndex((x) => re.test(x.label));
  assert.ok(pos(/Bandingkan/) < pos(/Catat/), 'bandingkan sebelum mencatat');
  assert.ok(pos(/[Cc]adangkan/) < pos(/ALTER TABLE/), 'cadangkan sebelum ALTER');
  assert.ok(pos(/ALTER TABLE/) < pos(/Periksa/), 'ALTER sebelum memeriksa');
  assert.ok(pos(/Periksa/) < pos(/Sajikan/), 'periksa sebelum menyajikan');
});

test('bekal sintaks: kartu, pemilahan aksi & dampak data sesuai simulator', () => {
  const K = D.konsep;
  assert.ok(K.kartu.length >= 6);
  K.kartu.forEach((k) => assert.ok(k.istilah && k.def && k.contoh, k.istilah));
  K.kartu.forEach((k) => {
    const h = E.jalankanDdl(skemaV1(), k.contoh);
    assert.equal(
      h.ok,
      true,
      'contoh kartu ' + k.istilah + ' berjalan di v1: ' + JSON.stringify(plain(h.log))
    );
  });
  assertSortItems(K.aksi.items, K.aksi.kategori, 'aksi');
  assertSortItems(K.dampak.items, K.dampak.kategori, 'dampak');
  /* Kunci pemilahan dampak dibuktikan simulator di atas v1 berisi data. */
  K.dampak.items.forEach((it) => {
    assert.ok(it.sql, it.id + ': sql');
    const awal = skemaV1();
    const h = E.jalankanDdl(awal, it.sql);
    assert.equal(h.ok, true, it.id + ': ' + JSON.stringify(plain(h.log)));
    const beda = E.bedaSkema(awal, h.skema, it.sql);
    const hilang = beda.some(
      (t) =>
        t.status === 'hapus' ||
        (t.barisLama !== null && t.baris < t.barisLama) ||
        t.kolom.some((k) => k.status === 'hapus')
    );
    const baru = beda.some((t) => t.kolom.some((k) => k.status === 'baru'));
    const dampak = hilang ? 'hilang' : baru ? 'bawaan' : 'tetap';
    assert.equal(dampak, it.correct, it.id + ' (' + it.sql + ')');
  });
  K.pertanyaan.forEach((q) => assertSoal(q, 'konsep.' + q.id));
});

test('tambah: konsol latihan sesuai pengamatan dan baris tetap', () => {
  const T = D.tambah;
  T.pertanyaan.forEach((q) => assertSoal(q, 'tambah.' + q.id));
  const awal = run('skemaLab("tambah")');
  const st = { jalan: T.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(awal, T.langkah, st);
  assert.deepEqual(plain(h.log.map((l) => l.ok)), [true, true, false, true]);
  assert.match(h.log[0].pesan, /NULL/);
  assert.match(h.log[1].pesan, /nilai bawaan 0/);
  assert.match(h.log[2].pesan, /sudah ada/);
  const t = E.ddlDbAktif(h.skema).tabel[0];
  assert.equal(t.baris, T.lab.baris[t.nama], 'ADD tidak mengubah jumlah baris');
  assert.equal(t.kolom[2].nama, 'poin', 'AFTER menempatkan kolom');
  T.langkah.forEach((l) => assert.ok(l.amati, l.id + ' punya pertanyaan pengamatan'));
});

test('ubah: konsol menunjukkan jebakan MODIFY, rumpang membentuk perintah kunci', () => {
  const U = D.ubah;
  const st = { jalan: U.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(run('skemaLab("ubah")'), U.langkah, st);
  assert.ok(
    h.log.every((l) => l.ok),
    JSON.stringify(plain(h.log))
  );
  assert.match(h.log[0].pesan, /NOT NULL tidak ditulis ulang/);
  assert.doesNotMatch(h.log[1].pesan, /Perhatian/);
  assert.ok(
    h.log.some((l) => /tidak muat/.test(l.pesan)),
    'ada contoh tipe menyusut'
  );
  U.langkah.forEach((l) => assert.ok(l.amati, l.id));
  assert.equal(U.rumpang.length, 3);
  U.rumpang.forEach((q, i) => {
    assertSoal(q, 'rumpang.' + q.id);
    assert.ok(U.rumpangSql.includes('__' + (i + 1) + '__'));
    assert.equal(teksBenar(q), U.isian[q.id], q.id + ': label kunci = isian');
  });
  const sql = run('skripRumpang()');
  assert.ok(D.kunci.ubah.includes(sql), 'rumpang terisi = baris kunci ubah');
});

test('hapus: konsol menolak kolom yang dirujuk, analisis berdiagnosa', () => {
  const H = D.hapus;
  const st = { jalan: H.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(run('skemaLab("hapus")'), H.langkah, st);
  assert.deepEqual(plain(h.log.map((l) => l.ok)), [true, false, false]);
  assert.match(h.log[0].pesan, /terhapus permanen/);
  assert.match(h.log[1].pesan, /dirujuk kunci tamu/);
  assertMulti(H.analisis.opsi, 'hapus.analisis', 6);
  assert.deepEqual(sorted(H.analisis.opsi.filter((o) => o.benar).map((o) => o.id)), [
    'permanen',
    'pk',
    'redundan',
  ]);
});

test('sajikan: skrip migrasi tim lolos, data utuh, klaim benar didukung bukti', () => {
  run('store.reset(); initOrders();');
  const h = run('hasilTim()');
  assert.equal(h.lulus, true, h.salah.join('; '));
  const beda = E.bedaSkema(skemaV1(), h.skema, run('skripTim()'));
  beda.forEach((t) => assert.equal(t.baris, t.barisLama, t.nama + ' utuh'));
  const nasabah = beda.find((t) => t.nama === 'nasabah');
  const st = (n) => nasabah.kolom.find((k) => k.nama === n).status;
  assert.equal(st('saldo'), 'baru');
  assert.equal(st('email'), 'baru');
  assert.equal(st('no_wa'), 'ganti');
  assertMulti(D.sajikan.klaim.opsi, 'klaim', 6);
  assert.deepEqual(sorted(D.sajikan.klaim.opsi.filter((o) => o.benar).map((o) => o.id)), [
    'kolom',
    'panjang',
    'utuh',
  ]);
});

test('evaluasi: kunci kuis TEFA konsisten dengan engine', () => {
  const S = D.evaluasi.soal;
  assert.ok(S.length >= 6);
  S.forEach((q) => assertSoal(q, 'evaluasi.' + q.id));
  const awal = () => E.skemaDariStruktur(D.namaDbTefa, E.strukturDariErd(D.erdTefa), D.barisTefa);
  /* e1–e4 berurutan mengubah TEFA v1 menjadi v2 tanpa kehilangan data. */
  const skrip = ['e1', 'e2', 'e3', 'e4'].map((id) => teksBenar(soal(S, id))).join('\n');
  const h = E.periksaSkripDdl(skrip, E.strukturDariErd(D.erdTefaV2), {
    awal: awal(),
    ketat: true,
    panjang: true,
  });
  assert.equal(h.lulus, true, h.salah.join('; ') + JSON.stringify(plain(h.log)));
  E.ddlDbAktif(h.skema).tabel.forEach((t) => assert.equal(t.baris, D.barisTefa[t.nama]));
  /* Pengecoh e2 (tanpa NOT NULL) & e3 (DROP+ADD) memang keliru. */
  const harapanTefa = E.strukturDariSkema(E.jalankanDdl(awal(), skrip).skema);
  const e2 = soal(S, 'e2');
  const e2Salah = e2.opsi.find((o) => o.id !== e2.correct && /MODIFY/.test(o.label));
  assert.ok(e2Salah, 'e2 punya pengecoh MODIFY');
  const cek = (ganti, id) =>
    E.periksaSkripDdl(skrip.replace(teksBenar(soal(S, id)), ganti), harapanTefa, {
      awal: awal(),
      ketat: true,
      panjang: true,
      jagaIsi: true,
    });
  assert.equal(cek(teks(e2Salah.label), 'e2').lulus, false);
  const e3 = soal(S, 'e3');
  const dropAdd = e3.opsi.find((o) => /DROP/.test(o.label));
  assert.ok(dropAdd, 'e3 punya pengecoh DROP+ADD');
  assert.match(cek(teks(dropAdd.label), 'e3').salah.join(' '), /data lama hilang/);
  /* e5: kolom yang dirujuk kunci tamu memang ditolak. */
  const e5 = E.jalankanDdl(awal(), D.evaluasi.sqlE5);
  assert.equal(e5.ok, false);
  assert.match(e5.log[0].pesan, /dirujuk kunci tamu/);
  /* e6: baris lama berisi nilai DEFAULT. */
  const e6 = E.jalankanDdl(awal(), D.evaluasi.sqlE6);
  assert.match(e6.log[0].pesan, new RegExp(D.barisTefa.servis + ' baris lama .*nilai bawaan 0'));
});

test('evaluasi: skrip Tim Biru berjalan tanpa galat tetapi keliru sesuai opsi benar', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U.opsi, 'ujiSilang', 6);
  assert.deepEqual(sorted(U.opsi.filter((o) => o.benar).map((o) => o.id)), [
    'notnull',
    'nowa',
    'setoran',
  ]);
  run('store.reset(); initOrders();');
  const h = run('hasilTimBiru()');
  assert.equal(h.ok, true, 'DBMS menerima semua perintahnya');
  assert.equal(h.lulus, false);
  const salah = h.salah.join(' ');
  assert.match(salah, /nama_jenis wajib diisi/);
  assert.match(salah, /nasabah\.no_wa .*data lama hilang/);
  assert.match(salah, /Data tabel setoran hilang/);
  assert.equal(h.salah.length, 3, 'tepat tiga kesalahan: ' + salah);
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
  perm(S.multi.analisis.order, D.hapus.analisis.opsi, 'multi.analisis');
  perm(S.multi.klaim.order, D.sajikan.klaim.opsi, 'multi.klaim');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');
  perm(S.rencana.pool, D.organisasi.rencana.items, 'rencana.pool');
  assert.notDeepEqual(plain(S.rencana.pool), ids(D.organisasi.rencana.items), 'rencana teracak');
  ['tambah', 'ubah', 'hapus'].forEach((k) => {
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

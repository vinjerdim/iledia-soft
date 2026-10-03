'use strict';

/*
 * Tes konsistensi fase-f/mpi-2.2 (Problem Based Learning — membuat
 * basis data dan tabel dengan CREATE DATABASE dan CREATE TABLE sesuai
 * rancangan basis data):
 *   • tahap cocok dengan manifest dan lima sintaks PBL;
 *   • setiap daftar pilihan punya id & label unik dan cukup opsi;
 *   • setiap pertanyaan (penuntun & kuis) punya kunci & umpan per opsi;
 *   • rancangan Bank Sampah & TEFA lengkap; skrip kunci setiap editor
 *     dan skrip tim lolos periksaSkripDdl; rumpang, konsol latihan,
 *     urutan tabel, kunci pemilahan, dan kunci evaluasi konsisten
 *     dengan simulator DDL engine;
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

const MOD = 'fase-f/mpi-2.2';
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
    .concat(D.basisData.pertanyaan)
    .concat(D.tabelInduk.rumpang)
    .concat(D.tabelAnak.pertanyaan);
}

function soal(list, id) {
  return list.find((q) => q.id === id);
}

function teksBenar(q) {
  return q.opsi.find((o) => o.id === q.correct).label.replace(/<[^>]+>/g, '');
}

const STRUKTUR = E.strukturDariErd(D.erd);
const STRUKTUR_TEFA = E.strukturDariErd(D.erdTefa);

test('tahap cocok dengan manifest dan lima sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest[MOD];
  assert.ok(m, 'manifest ' + MOD + ' ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.h1, /CREATE DATABASE/);
  assert.match(m.h1, /CREATE TABLE/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'organisasi',
    'konsep',
    'basisData',
    'tabelInduk',
    'tabelAnak',
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

test('index.html modul dihasilkan dari template dan berkas modul lama dihapus', () => {
  const html = fs.readFileSync(path.join(ROOT, MOD, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((x) => x[1]);
  assert.deepEqual(scripts, ['../../shared/engine.js', 'data.js', 'app.js']);
  assert.match(html, /id="resetModal"/);
  assert.match(html, /CREATE DATABASE dan CREATE TABLE/);
  assert.match(html, /0 dari 11 tahap selesai/);
  ['app-core.js', 'app-stage-awal.js', 'app-stage-inti.js', 'app-stage-akhir.js'].forEach((f) =>
    assert.ok(!fs.existsSync(path.join(ROOT, MOD, f)), f + ' modul lama sudah dihapus')
  );
});

test('panel tujuan belajar memuat TP CREATE DATABASE & CREATE TABLE dan kriteria', () => {
  const o = D.orientasi;
  assert.equal(
    o.tp,
    'Membuat basis data dan tabel menggunakan perintah CREATE DATABASE dan CREATE TABLE sesuai rancangan basis data yang telah ditentukan.'
  );
  assert.ok(o.kriteria.length >= 4);
  assertOptions(o.apersepsi.opsi, 'apersepsi');
  assert.ok(o.apersepsi.umpan);
  assert.equal(D.meta.model, 'Problem Based Learning');
});

test('rancangan Bank Sampah & TEFA lengkap: tipe, kunci, dan keterangan', () => {
  [D.erd, D.erdTefa].forEach((erd) => {
    assert.deepEqual(plain(E.periksaErd(erd)), []);
    erd.entitas.forEach((ent) => {
      assert.ok(E.kunciPrimer(ent).length, ent.id + ' berkunci primer');
      ent.atribut.forEach((a) => assert.ok(a.tipe, ent.id + '.' + a.teks + ' bertipe'));
    });
  });
  assert.deepEqual(sorted(STRUKTUR.map((t) => t.nama)), [
    'jenis_sampah',
    'nasabah',
    'petugas',
    'setoran',
  ]);
  assert.equal(STRUKTUR_TEFA.length, 5);
  STRUKTUR.forEach((t) => t.kolom.forEach((k) => assert.ok(k.ket, t.nama + '.' + k.nama + ' ket')));
  const setoran = STRUKTUR.find((t) => t.nama === 'setoran');
  assert.equal(setoran.fk.length, 3);
  assert.equal(D.namaDb, 'bank_sampah');
});

test('masalah: log galat, akar masalah berdiagnosa, dan rumusan minimal', () => {
  const M = D.masalah;
  assert.ok(M.log.some((l) => /Unknown database 'bank_sampah'/.test(l)));
  assert.ok(M.log.some((l) => /doesn't exist/.test(l)));
  assertMulti(M.akar.opsi, 'masalah.akar', 6);
  assert.ok(M.rumusan.min >= 20);
});

test('organisasi: peran tim unik dan rencana langkah berurutan logis', () => {
  const O = D.organisasi;
  assert.ok(O.peran.length >= 3);
  assert.equal(new Set(ids(O.peran)).size, O.peran.length);
  O.peran.forEach((p) => assert.ok(p.label && p.tugas, p.id));
  assertOptions(O.rencana.items, 'rencana', 5);
  const label = (id) => O.rencana.items.find((x) => x.id === id).label;
  const pos = (re) => O.rencana.items.findIndex((x) => re.test(x.label));
  assert.ok(pos(/CREATE DATABASE/) < pos(/USE/), 'CREATE DATABASE sebelum USE');
  assert.ok(pos(/USE/) < pos(/induk/), 'USE sebelum tabel induk');
  assert.ok(pos(/induk/) < pos(/FOREIGN KEY/), 'induk sebelum anak');
  assert.ok(label(O.rencana.items[0].id));
});

test('bekal sintaks: kartu, kunci pemilahan tipe & constraint sesuai rancangan', () => {
  const K = D.konsep;
  assert.ok(K.kartu.length >= 6);
  K.kartu.forEach((k) => {
    assert.ok(k.istilah && k.def && k.contoh, k.istilah);
  });
  ['CREATE DATABASE', 'USE', 'CREATE TABLE', 'NOT NULL', 'PRIMARY KEY'].forEach((s) =>
    assert.ok(
      K.kartu.some((k) => k.istilah === s),
      'kartu ' + s
    )
  );
  assertSortItems(K.tipe.items, K.tipe.kategori, 'tipe');
  assertSortItems(K.constraint.items, K.constraint.kategori, 'constraint');
  /* Setiap kategori tipe dipakai oleh rancangan sungguhan. */
  const tipeDipakai = new Set(
    STRUKTUR.flatMap((t) => t.kolom.map((k) => E.tipeDasar(k.tipe).toLowerCase()))
  );
  K.tipe.kategori.forEach((k) =>
    assert.ok(tipeDipakai.has(k.id), 'tipe ' + k.id + ' di rancangan')
  );
  K.pertanyaan.forEach((q) => assertSoal(q, 'konsep.' + q.id));
  /* Definisi kolom kunci k1 lolos pengurai dan sesuai kamus data. */
  const k1 = soal(K.pertanyaan, 'k1');
  const h = E.periksaSkripDdl(
    'CREATE TABLE t (' + teksBenar(k1) + ');',
    [
      {
        nama: 't',
        kolom: [{ nama: 'nama_nasabah', tipe: 'VARCHAR(50)', notNull: true }],
        pk: [],
        fk: [],
      },
    ],
    { awal: E.jalankanDdl(E.skemaKosong(), 'CREATE DATABASE x; USE x;').skema }
  );
  assert.equal(h.lulus, true, h.salah.join('; '));
});

test('buat basis data: konsol latihan ditolak/diterima sesuai pengamatan', () => {
  const B = D.basisData;
  B.pertanyaan.forEach((q) => assertSoal(q, 'basisData.' + q.id));
  const st = { jalan: B.langkah.length, bebas: [], draf: '' };
  const h = E.putarKonsol(E.skemaKosong(), B.langkah, st);
  assert.deepEqual(plain(h.log.map((l) => l.ok)), [false, true, false, true, true, false, true]);
  assert.match(h.log[0].pesan, /USE/);
  assert.match(h.log[5].pesan, /sudah ada/);
  assert.match(h.log[6].pesan, /IF NOT EXISTS/);
  B.langkah.forEach((l) => assert.ok(l.amati, l.id + ' punya pertanyaan pengamatan'));
});

test('skrip kunci setiap editor lulus periksaSkripDdl di atas skrip tim sebelumnya', () => {
  run('initOrders();');
  ['db', 'induk', 'anak'].forEach((k) => {
    const opts = run('editorOpts(' + JSON.stringify(k) + ')');
    assert.ok(opts.label && opts.kerangka && opts.petunjuk.length >= 2, k + ': teks editor');
    const h = E.periksaSkripDdl(D.kunci[k], opts.harapan, opts);
    assert.equal(h.lulus, true, k + ': ' + h.salah.join('; ') + JSON.stringify(plain(h.log)));
    /* Kerangka saja belum lulus. */
    assert.equal(E.periksaSkripDdl(opts.kerangka, opts.harapan, opts).lulus, false, k);
  });
});

test('editor: kesalahan umum murid ditolak dengan pesan yang tepat', () => {
  run('initOrders();');
  const induk = run('editorOpts("induk")');
  const tanpaNotNull = D.kunci.induk.replace('kelas VARCHAR(10) NOT NULL', 'kelas VARCHAR(10)');
  assert.match(
    E.periksaSkripDdl(tanpaNotNull, induk.harapan, induk).salah.join(' '),
    /nasabah\.kelas wajib diisi/
  );
  const salahTipe = D.kunci.induk.replace('id_petugas INT', 'id_petugas VARCHAR(5)');
  assert.match(
    E.periksaSkripDdl(salahTipe, induk.harapan, induk).salah.join(' '),
    /petugas\.id_petugas bertipe/
  );
  const anak = run('editorOpts("anak")');
  const fkBeda = D.kunci.anak.replace('kode_jenis CHAR(4) NOT NULL', 'kode_jenis INT NOT NULL');
  const h = E.periksaSkripDdl(fkBeda, anak.harapan, anak);
  assert.equal(h.ok, false);
  assert.match(h.log[h.log.length - 1].pesan, /tipe/i);
  const tanpaFk = D.kunci.anak.replace(
    /,\n {2}FOREIGN KEY \(id_petugas\) REFERENCES petugas\(id_petugas\)/,
    ''
  );
  assert.match(
    E.periksaSkripDdl(tanpaFk, anak.harapan, anak).salah.join(' '),
    /kunci tamu id_petugas/
  );
  const db = run('editorOpts("db")');
  assert.match(
    E.periksaSkripDdl('CREATE DATABASE bank_sampah;', db.harapan, db).salah.join(' '),
    /USE/
  );
});

test('tabel induk: isian rumpang benar membentuk jenis_sampah sesuai rancangan', () => {
  const T = D.tabelInduk;
  assert.equal(T.rumpang.length, 4);
  T.rumpang.forEach((q, i) => {
    assertSoal(q, 'rumpang.' + q.id);
    assert.ok(T.rumpangSql.includes('__' + (i + 1) + '__'));
    assert.equal(teksBenar(q), T.isian[q.id], q.id + ': label kunci = isian');
  });
  const sql = run('skripJenis()');
  const h = E.periksaSkripDdl(D.kunci.db + '\n' + sql, STRUKTUR, {
    namaDb: D.namaDb,
    tabel: ['jenis_sampah'],
  });
  assert.equal(h.lulus, true, h.salah.join('; '));
});

test('tabel berelasi: urutan teracak awal tidak sah, setoran selalu terakhir', () => {
  run('store.reset(); initOrders();');
  const st = E.State.urutan;
  assert.equal(E.urutanValid(D.erd, st.pool), false, 'kolam awal tidak langsung sah');
  assert.equal(E.urutanBuatTabel(D.erd).slice(-1)[0], 'setoran');
  assert.equal(E.urutanValid(D.erd, ['petugas', 'jenis_sampah', 'nasabah', 'setoran']), true);
  assert.equal(E.urutanValid(D.erd, ['setoran', 'petugas', 'jenis_sampah', 'nasabah']), false);
  D.tabelAnak.pertanyaan.forEach((q) => assertSoal(q, 'anak.' + q.id));
});

test('sajikan: skrip tim lolos dan klaim benar didukung bukti DBMS', () => {
  run('store.reset(); initOrders();');
  const h = run('hasilTim()');
  assert.equal(h.lulus, true, h.salah.join('; '));
  const db = E.ddlDbAktif(h.skema);
  assert.equal(db.nama, D.namaDb);
  assert.equal(db.tabel.length, 4);
  assert.ok(
    db.tabel.every((t) => t.pk.length && t.baris === 0),
    'berkunci primer, belum berisi'
  );
  assertMulti(D.sajikan.klaim.opsi, 'klaim', 6);
  const benar = sorted(D.sajikan.klaim.opsi.filter((o) => o.benar).map((o) => o.id));
  assert.deepEqual(benar, ['empat', 'fk', 'pk']);
  const nasabah = E.ddlTabel(h.skema, 'nasabah');
  assert.equal(E.cariNama(nasabah.kolom, 'no_hp').notNull, false, 'no_hp boleh kosong');
});

test('sajikan: skrip tim memakai skrip murid yang lulus', () => {
  run('store.reset(); initOrders();');
  const ed = E.State.editor.db;
  ed.jalan = 'CREATE DATABASE IF NOT EXISTS bank_sampah;\nUSE bank_sampah;';
  ed.lulus = true;
  assert.match(run('skripTim()'), /IF NOT EXISTS bank_sampah/);
  assert.equal(run('hasilTim()').lulus, true);
  run('store.reset(); initOrders();');
});

test('evaluasi: kunci kuis TEFA konsisten dengan engine', () => {
  const S = D.evaluasi.soal;
  assert.ok(S.length >= 5);
  S.forEach((q) => assertSoal(q, 'evaluasi.' + q.id));
  assert.match(teksBenar(soal(S, 'e1')), new RegExp('CREATE DATABASE ' + D.namaDbTefa));
  const biaya = STRUKTUR_TEFA.find((t) => t.nama === 'layanan').kolom.find(
    (k) => k.nama === 'biaya'
  );
  assert.equal(teksBenar(soal(S, 'e2')), 'biaya ' + biaya.tipe + ' NOT NULL');
  assert.equal(teksBenar(soal(S, 'e3')), E.urutanBuatTabel(D.erdTefa).slice(-1)[0]);
  /* e4 & e5 lolos simulator di atas tabel TEFA lain. */
  const skrip = E.ddlSkripErd(D.erdTefa, D.namaDbTefa);
  assert.equal(E.periksaSkripDdl(skrip, STRUKTUR_TEFA, { namaDb: D.namaDbTefa }).lulus, true);
  assert.ok(skrip.includes(teksBenar(soal(S, 'e4'))), 'e4 sesuai DDL rancangan');
  assert.ok(skrip.includes(teksBenar(soal(S, 'e5'))), 'e5 sesuai DDL rancangan');
  assert.match(teksBenar(soal(S, 'e6')), new RegExp('USE ' + D.namaDbTefa));
});

test('evaluasi: skrip Tim Biru gagal dan kesalahannya sesuai opsi yang benar', () => {
  const U = D.evaluasi.ujiSilang;
  assertMulti(U.opsi, 'ujiSilang', 6);
  assert.deepEqual(sorted(U.opsi.filter((o) => o.benar).map((o) => o.id)), [
    'urutan',
    'use',
    'varchar',
  ]);
  const h1 = E.jalankanDdl(E.skemaKosong(), U.skrip);
  assert.equal(h1.ok, false);
  assert.match(h1.log[h1.log.length - 1].pesan, /USE/);

  const pakaiUse = U.skrip.replace(';\n\n', ';\nUSE tefa_servis;\n\n');
  const h2 = E.jalankanDdl(E.skemaKosong(), pakaiUse);
  assert.equal(h2.ok, false);
  assert.match(h2.log[h2.log.length - 1].pesan, /pelanggan belum ada/);

  /* Setelah tabel pelanggan & teknisi dibuat lebih dulu, galat VARCHAR muncul. */
  const bagian = E.pecahPernyataan(pakaiUse);
  const teknisi =
    'CREATE TABLE teknisi (kode_tek CHAR(2), nama_tek VARCHAR(50) NOT NULL, PRIMARY KEY (kode_tek))';
  const tukar = [bagian[0], bagian[1], bagian[3], teknisi, bagian[2]].join(';\n') + ';';
  const h3 = E.jalankanDdl(E.skemaKosong(), tukar);
  assert.equal(h3.ok, false);
  assert.match(h3.log[h3.log.length - 1].pesan, /VARCHAR/);

  const beres = tukar.replace('nama_plg VARCHAR NOT NULL', 'nama_plg VARCHAR(50) NOT NULL');
  const h4 = E.periksaSkripDdl(beres, STRUKTUR_TEFA, {
    namaDb: D.namaDbTefa,
    tabel: ['pelanggan', 'teknisi', 'servis'],
  });
  assert.equal(h4.lulus, true, h4.salah.join('; '));
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
    ['tipe', D.konsep.tipe],
    ['constraint', D.konsep.constraint],
  ].forEach(([key, s]) => {
    perm(S.sortOrders[key], s.items, 'sortOrders.' + key);
    s.items.forEach((it) =>
      perm(S.sorts[key][it.id].optionOrder, s.kategori, key + '.' + it.id + '.optionOrder')
    );
  });

  perm(S.multi.akar.order, D.masalah.akar.opsi, 'multi.akar');
  perm(S.multi.klaim.order, D.sajikan.klaim.opsi, 'multi.klaim');
  perm(S.multi.ujiSilang.order, D.evaluasi.ujiSilang.opsi, 'multi.ujiSilang');
  perm(S.rencana.pool, D.organisasi.rencana.items, 'rencana.pool');
  assert.notDeepEqual(plain(S.rencana.pool), ids(D.organisasi.rencana.items), 'rencana teracak');
  perm(
    S.urutan.pool,
    STRUKTUR.map((t) => ({ id: t.nama })),
    'urutan.pool'
  );
  assert.deepEqual(plain(S.konsol.lab), { jalan: 0, bebas: [], draf: '' });
  ['db', 'induk', 'anak'].forEach((k) => assert.equal(S.editor[k].percobaan, 0, 'editor ' + k));

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

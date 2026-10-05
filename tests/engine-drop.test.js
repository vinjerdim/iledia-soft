'use strict';

/*
 * Tes seksi "SQL DDL" bagian penghapusan (DROP) pada shared/engine.js:
 * DROP TABLE banyak tabel sekaligus, pesan dampak DROP (jumlah tabel &
 * baris yang hilang), perintah pengecekan sebelum DROP (SHOW DATABASES,
 * SHOW TABLES, SELECT DATABASE()), server berisi beberapa basis data
 * (skemaBanyakDb), laporan dampak (dampakHapus / buildDampakHapus),
 * pemeriksa "hapus yang tepat saja" (periksaPenghapusan, opsi `hapus`
 * pada periksaSkripDdl), panel server (buildServerDdl), serta konsol
 * dan editor DDL dengan opsi `server`.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

function teks(html) {
  return String(html).replace(/<[^>]+>/g, '');
}

/* Toko: kategori ← barang; arsip lomba: hadiah ← pemenang. */
const TOKO = [
  {
    nama: 'kategori',
    kolom: [
      { nama: 'id_kat', tipe: 'INT', notNull: true },
      { nama: 'nama_kat', tipe: 'VARCHAR(20)', notNull: true },
    ],
    pk: ['id_kat'],
    fk: [],
  },
  {
    nama: 'barang',
    kolom: [
      { nama: 'kode', tipe: 'CHAR(4)', notNull: true },
      { nama: 'id_kat', tipe: 'INT', notNull: true },
    ],
    pk: ['kode'],
    fk: [{ kolom: 'id_kat', rujukTabel: 'kategori', rujukKolom: 'id_kat' }],
  },
  {
    nama: 'hadiah',
    kolom: [{ nama: 'id_hadiah', tipe: 'INT', notNull: true }],
    pk: ['id_hadiah'],
    fk: [],
  },
  {
    nama: 'pemenang',
    kolom: [
      { nama: 'nis', tipe: 'CHAR(5)', notNull: true },
      { nama: 'id_hadiah', tipe: 'INT', notNull: true },
    ],
    pk: ['nis'],
    fk: [{ kolom: 'id_hadiah', rujukTabel: 'hadiah', rujukKolom: 'id_hadiah' }],
  },
];
const BARIS_TOKO = { kategori: 4, barang: 40, hadiah: 3, pemenang: 12 };

const LAIN = [
  {
    nama: 'catatan',
    kolom: [{ nama: 'id', tipe: 'INT', notNull: true }],
    pk: ['id'],
    fk: [],
  },
];

function server() {
  return E.skemaBanyakDb(
    [
      { nama: 'toko', struktur: TOKO, baris: BARIS_TOKO },
      { nama: 'toko_uji', struktur: TOKO, baris: { kategori: 2, barang: 5 } },
      { nama: 'kelas_lain', struktur: LAIN, baris: { catatan: 7 } },
    ],
    'toko'
  );
}

test('skemaBanyakDb: beberapa basis data berisi data, satu aktif', () => {
  const s = server();
  assert.deepEqual(plain(s.basisData.map((b) => b.nama)), ['toko', 'toko_uji', 'kelas_lain']);
  assert.equal(s.aktif, 'toko');
  assert.equal(E.ddlTabel(s, 'barang').baris, 40);
  assert.equal(E.ddlTabel(s, 'barang').kolom[0].isi, true);
  const uji = E.cariNama(s.basisData, 'toko_uji');
  assert.equal(E.cariNama(uji.tabel, 'hadiah').baris, 0);
  assert.equal(E.skemaBanyakDb([], null).aktif, null);
  assert.equal(E.skemaBanyakDb([{ nama: 'a', struktur: [] }], 'b').aktif, null, 'aktif harus ada');
});

test('urai DROP TABLE banyak tabel sekaligus', () => {
  const p = E.uraiDdl('DROP TABLE IF EXISTS pemenang, `hadiah`;')[0];
  assert.equal(p.jenis, 'dropTable');
  assert.equal(p.ifExists, true);
  assert.equal(p.nama, 'pemenang');
  assert.deepEqual(plain(p.daftar), ['pemenang', 'hadiah']);
  assert.deepEqual(plain(E.uraiDdl('DROP TABLE barang;')[0].daftar), ['barang']);
  assert.equal(E.uraiDdl('DROP TABLE a,;')[0].jenis, 'galat');
  assert.equal(E.uraiDdl('DROP DATABASE a, b;')[0].jenis, 'galat', 'DATABASE hanya satu');
});

test('DROP TABLE: pesan menyebut baris yang hilang; urutan anak → induk', () => {
  let h = E.jalankanDdl(server(), 'DROP TABLE hadiah;');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /masih dirujuk kunci tamu tabel pemenang/);

  h = E.jalankanDdl(server(), 'DROP TABLE pemenang;\nDROP TABLE hadiah;');
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.match(h.log[0].pesan, /Tabel pemenang .*12 baris.* dihapus/);
  assert.match(h.log[1].pesan, /Tabel hadiah .*3 baris.* dihapus/);
  assert.equal(E.ddlTabel(h.skema, 'hadiah'), null);

  /* Satu pernyataan: perujuk yang ikut dihapus tidak menghalangi. */
  h = E.jalankanDdl(server(), 'DROP TABLE hadiah, pemenang;');
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.match(h.log[0].pesan, /2 tabel .*15 baris/);
  /* Tetapi tidak bila perujuknya tidak ikut. */
  h = E.jalankanDdl(server(), 'DROP TABLE hadiah, kategori;');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /dirujuk kunci tamu/);
  assert.ok(E.ddlTabel(h.skema, 'hadiah'), 'gagal → tidak ada tabel yang terhapus');
});

test('DROP TABLE IF EXISTS banyak tabel: yang tidak ada dilewati', () => {
  let h = E.jalankanDdl(server(), 'DROP TABLE IF EXISTS pemenang, arsip_lama;');
  assert.equal(h.ok, true);
  assert.match(h.log[0].pesan, /pemenang/);
  assert.match(h.log[0].pesan, /arsip_lama tidak ada — dilewati/);
  h = E.jalankanDdl(server(), 'DROP TABLE pemenang, arsip_lama;');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /Tabel arsip_lama tidak ada/);
  assert.ok(E.ddlTabel(h.skema, 'pemenang'), 'gagal → tidak ada yang terhapus');
  h = E.jalankanDdl(server(), 'DROP TABLE IF EXISTS arsip_lama;');
  assert.match(h.log[0].pesan, /dilewati \(IF EXISTS\)/);
});

test('DROP DATABASE: pesan menyebut tabel & baris; basis data aktif ikut lepas', () => {
  let h = E.jalankanDdl(server(), 'DROP DATABASE toko_uji;');
  assert.equal(h.ok, true);
  assert.match(h.log[0].pesan, /toko_uji .*4 tabel.*7 baris/);
  assert.equal(h.skema.aktif, 'toko', 'basis data aktif lain tidak berubah');

  h = E.jalankanDdl(server(), 'DROP DATABASE toko;\nCREATE TABLE x (id INT);');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /tidak ada lagi basis data yang aktif/i);
  assert.equal(h.skema.aktif, null);
  assert.match(h.log[1].pesan, /Belum ada basis data yang dipilih/);

  h = E.jalankanDdl(server(), 'DROP DATABASE IF EXISTS toko_lama;');
  assert.equal(h.ok, true);
  assert.match(h.log[0].pesan, /dilewati/);
});

test('SHOW DATABASES, SHOW TABLES, dan SELECT DATABASE() untuk mengecek sebelum DROP', () => {
  const h = E.jalankanDdl(server(), 'SHOW DATABASES;\nSHOW TABLES;\nSELECT DATABASE();');
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.match(h.log[0].pesan, /toko, toko_uji, kelas_lain/);
  assert.match(h.log[1].pesan, /toko: .*kategori \(4 baris\).*pemenang \(12 baris\)/);
  assert.match(h.log[2].pesan, /Basis data aktif: toko/);
  const kosong = E.jalankanDdl(E.skemaKosong(), 'SHOW DATABASES; SELECT DATABASE();');
  assert.match(kosong.log[0].pesan, /Belum ada basis data/);
  assert.match(kosong.log[1].pesan, /NULL/);
  assert.equal(E.jalankanDdl(E.skemaKosong(), 'SHOW TABLES;').ok, false);
  assert.equal(E.uraiDdl('SHOW KOLOM;')[0].jenis, 'galat');
  /* SELECT lain tetap DML yang tidak dijalankan simulator. */
  assert.equal(E.uraiDdl('SELECT * FROM barang;')[0].jenis, 'bukanDdl');
  assert.ok(E.sorotSql('SHOW DATABASES;').includes('sql-kw'));
});

test('dampakHapus: basis data, tabel, dan isi yang hilang lintas server', () => {
  const awal = server();
  const akhir = E.jalankanDdl(
    awal,
    'DROP DATABASE toko_uji;\nDROP TABLE pemenang;\nTRUNCATE TABLE barang;'
  ).skema;
  const d = E.dampakHapus(awal, akhir);
  assert.deepEqual(plain(d.db), [{ nama: 'toko_uji', tabel: 4, baris: 7 }]);
  assert.deepEqual(plain(d.tabel), [{ db: 'toko', nama: 'pemenang', baris: 12 }]);
  assert.deepEqual(plain(d.dikosongkan), [{ db: 'toko', nama: 'barang', baris: 40 }]);
  assert.equal(d.baris, 59);
  const nol = E.dampakHapus(awal, E.jalankanDdl(awal, 'SHOW TABLES;').skema);
  assert.deepEqual(plain(nol), { db: [], tabel: [], dikosongkan: [], baris: 0 });
});

test('periksaPenghapusan: target harus hilang, objek lain harus utuh', () => {
  const awal = server();
  const target = { db: ['toko_uji'], tabel: [{ db: 'toko', nama: 'pemenang' }] };
  const cek = (sql) => E.periksaPenghapusan(awal, E.jalankanDdl(awal, sql).skema, target);
  assert.deepEqual(plain(cek('DROP TABLE pemenang;\nDROP DATABASE toko_uji;')), []);
  assert.match(cek('DROP TABLE pemenang;').join(' '), /Basis data toko_uji masih ada/);
  assert.match(cek('DROP DATABASE toko_uji;').join(' '), /Tabel toko\.pemenang masih ada/);
  assert.match(
    cek('DROP TABLE pemenang, hadiah;\nDROP DATABASE toko_uji;').join(' '),
    /Tabel toko\.hadiah ikut terhapus — 3 baris data hilang/
  );
  assert.match(
    cek('DROP TABLE pemenang;\nDROP DATABASE toko_uji;\nDROP DATABASE kelas_lain;').join(' '),
    /Basis data kelas_lain ikut terhapus — 1 tabel dan 7 baris data hilang/
  );
  assert.match(
    cek('DROP TABLE pemenang;\nDROP DATABASE toko_uji;\nTRUNCATE TABLE barang;').join(' '),
    /Isi tabel toko\.barang ikut dikosongkan — 40 baris data hilang/
  );
  assert.match(
    cek(
      'DROP TABLE pemenang;\nDROP DATABASE toko_uji;\nALTER TABLE barang DROP COLUMN id_kat;'
    ).join(' '),
    /Kolom toko\.barang\.id_kat ikut terhapus/
  );
  /* Tabel target di dalam basis data target yang dihapus tidak dihitung ganda. */
  const t2 = { db: ['toko_uji'], tabel: [{ db: 'toko_uji', nama: 'barang' }] };
  assert.deepEqual(
    plain(E.periksaPenghapusan(awal, E.jalankanDdl(awal, 'DROP DATABASE toko_uji;').skema, t2)),
    []
  );
});

test('periksaSkripDdl opsi hapus + namaDb: DB aktif harus benar', () => {
  const opts = {
    awal: server(),
    namaDb: 'toko',
    hapus: { db: ['toko_uji'], tabel: [] },
  };
  assert.equal(E.periksaSkripDdl('DROP DATABASE toko_uji;', null, opts).lulus, true);
  const lepas = E.periksaSkripDdl('USE toko_uji;\nDROP DATABASE toko_uji;', null, opts);
  assert.equal(lepas.ok, true);
  assert.match(lepas.salah.join(' '), /belum dipilih dengan USE/);
  assert.equal(
    E.periksaSkripDdl('USE toko_uji;\nDROP DATABASE toko_uji;\nUSE toko;', null, opts).lulus,
    true
  );
  const salahDb = E.periksaSkripDdl('DROP DATABASE toko;', null, opts);
  assert.equal(salahDb.lulus, false);
  assert.match(salahDb.salah.join(' '), /toko ikut terhapus/);
  assert.match(salahDb.salah.join(' '), /toko_uji masih ada/);
  assert.equal(E.periksaSkripDdl('-- belum', null, opts).lulus, false);
});

test('buildDampakHapus: aman bila tak ada data hilang, rinci bila ada', () => {
  const awal = server();
  const aman = E.buildDampakHapus(E.dampakHapus(awal, awal), { judul: 'Dampak' });
  assert.match(aman, /ddl-dampak--aman/);
  assert.match(teks(aman), /Dampak/);
  assert.match(teks(aman), /Tidak ada data yang hilang/);
  const akhir = E.jalankanDdl(awal, 'DROP DATABASE toko_uji;\nDROP TABLE pemenang;').skema;
  const html = E.buildDampakHapus(E.dampakHapus(awal, akhir));
  assert.match(html, /ddl-dampak--hilang/);
  assert.match(teks(html), /toko_uji/);
  assert.match(teks(html), /toko\.pemenang/);
  assert.match(teks(html), /19 baris/);
  assert.doesNotMatch(
    E.buildDampakHapus({ db: [], tabel: [], dikosongkan: [], baris: 0 }),
    /<script/
  );
});

test('buildServerDdl: kartu per basis data, aktif & yang dihapus ditandai', () => {
  const awal = server();
  const html = E.buildServerDdl(awal, { judul: 'Server' });
  assert.match(teks(html), /Server/);
  assert.equal((html.match(/class="ddl-server__db/g) || []).length, 3);
  assert.match(html, /ddl-server__db--aktif/);
  assert.match(teks(html), /pemenang/);
  assert.match(teks(html), /12 baris/);
  const akhir = E.jalankanDdl(awal, 'DROP DATABASE toko_uji;\nDROP TABLE pemenang;').skema;
  const beda = E.buildServerDdl(akhir, { awal: awal });
  assert.equal((beda.match(/ddl-server__db--hapus/g) || []).length, 1);
  assert.equal((beda.match(/ddl-server__tabel--hapus/g) || []).length, 1);
  assert.match(teks(E.buildServerDdl(E.skemaKosong())), /Belum ada basis data/);
  assert.match(teks(E.buildServerDdl(E.jalankanDdl(awal, 'DROP DATABASE toko;').skema)), /USE/);
});

test('konsol & editor opsi server menampilkan panel server dan dampak', () => {
  const awal = server();
  const st = { jalan: 1, bebas: [], draf: '' };
  const k = E.buildKonsolDdl('k', [{ id: 'a', sql: 'DROP DATABASE toko_uji;' }], st, {
    awal: awal,
    server: true,
  });
  assert.match(k, /ddl-server/);
  assert.match(k, /ddl-server__db--hapus/);
  const ed = E.ensureEditorState({}, 'x');
  ed.draf = ed.jalan = 'DROP DATABASE toko_uji;';
  const html = E.buildEditorDdl('ed', ed, {
    awal: awal,
    namaDb: 'toko',
    hapus: { db: ['toko_uji'], tabel: [] },
    server: true,
  });
  assert.match(html, /ddl-server/);
  assert.match(html, /ddl-dampak/);
  assert.match(teks(html), /7 baris/);
});

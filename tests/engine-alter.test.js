'use strict';

/*
 * Tes seksi "SQL DDL" bagian ALTER TABLE pada shared/engine.js:
 * CHANGE / FIRST / AFTER, catatan dampak data, penanda kolom berisi
 * data lama (`isi`), skema berisi data (skemaDariStruktur), struktur
 * dari skema (strukturDariSkema), pemeriksaan panjang tipe & jaga isi
 * data, beda skema sebelum–sesudah, dan editor DDL dengan opsi `beda`.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

/* Rancangan mini toko: kategori ← barang. */
const STRUKTUR = [
  {
    nama: 'kategori',
    kolom: [
      { nama: 'id_kat', tipe: 'INT', notNull: true, ket: 'abaikan' },
      { nama: 'nama_kat', tipe: 'VARCHAR(20)', notNull: true },
    ],
    pk: ['id_kat'],
    fk: [],
  },
  {
    nama: 'barang',
    kolom: [
      { nama: 'kode', tipe: 'CHAR(4)', notNull: true },
      { nama: 'nama', tipe: 'VARCHAR(30)', notNull: true },
      { nama: 'hp', tipe: 'VARCHAR(15)', notNull: false },
      { nama: 'id_kat', tipe: 'INT', notNull: true },
    ],
    pk: ['kode'],
    fk: [{ kolom: 'id_kat', rujukTabel: 'kategori', rujukKolom: 'id_kat' }],
  },
];

function awal() {
  return E.skemaDariStruktur('toko', STRUKTUR, { kategori: 5, barang: 40 });
}

function tabel(skema, nama) {
  return E.ddlTabel(skema, nama);
}

function namaKolom(skema, t) {
  return plain(tabel(skema, t).kolom.map((k) => k.nama));
}

test('skemaDariStruktur membuat basis data aktif berisi data', () => {
  const s = awal();
  assert.equal(s.aktif, 'toko');
  assert.equal(E.ddlDbAktif(s).tabel.length, 2);
  const b = tabel(s, 'barang');
  assert.equal(b.baris, 40);
  assert.ok(
    b.kolom.every((k) => k.isi === true),
    'kolom tabel berisi ditandai isi'
  );
  assert.equal(b.kolom[0].ket, undefined, 'keterangan kamus data tidak ikut');
  assert.deepEqual(plain(b.fk), plain(STRUKTUR[1].fk));
  assert.notEqual(b.fk, STRUKTUR[1].fk, 'struktur asal tidak ikut termutasi');
  const kosong = E.skemaDariStruktur('x', STRUKTUR);
  assert.equal(tabel(kosong, 'barang').baris, 0);
  assert.ok(tabel(kosong, 'barang').kolom.every((k) => !k.isi));
});

test('uraiDdl mengurai CHANGE, FIRST, dan AFTER', () => {
  const [p] = E.uraiDdl(
    'ALTER TABLE barang CHANGE COLUMN hp no_wa VARCHAR(20), ADD stok INT NOT NULL DEFAULT 0 AFTER nama, ' +
      'ADD id INT FIRST, MODIFY nama VARCHAR(60) NOT NULL AFTER kode'
  );
  assert.equal(p.jenis, 'alterTable');
  assert.deepEqual(plain(p.aksi.map((a) => a.tipe)), ['change', 'add', 'add', 'modify']);
  assert.equal(p.aksi[0].dari, 'hp');
  assert.equal(p.aksi[0].kolom.nama, 'no_wa');
  assert.deepEqual(plain(p.aksi[1].posisi), { setelah: 'nama' });
  assert.equal(p.aksi[1].kolom.bawaan, '0');
  assert.deepEqual(plain(p.aksi[2].posisi), { pertama: true });
  assert.deepEqual(plain(p.aksi[3].posisi), { setelah: 'kode' });
  const [g] = E.uraiDdl('ALTER TABLE barang UBAH nama INT');
  assert.equal(g.jenis, 'galat');
  assert.match(g.pesan, /CHANGE/);
  assert.match(E.sorotSql('ALTER TABLE t CHANGE a b INT AFTER c'), /sql-kw">CHANGE/);
  assert.match(E.sorotSql('ADD x INT FIRST'), /sql-kw">FIRST/);
});

test('ADD menempatkan kolom (FIRST/AFTER) dan mencatat isi baris lama', () => {
  let h = E.jalankanDdl(
    awal(),
    'ALTER TABLE barang ADD stok INT NOT NULL DEFAULT 0 AFTER nama; ALTER TABLE barang ADD id INT FIRST;'
  );
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.deepEqual(namaKolom(h.skema, 'barang'), ['id', 'kode', 'nama', 'stok', 'hp', 'id_kat']);
  assert.match(h.log[0].pesan, /ditambahkan/);
  assert.match(h.log[0].pesan, /40 baris lama .*nilai bawaan 0/);
  assert.match(h.log[1].pesan, /NULL/);
  const stok = E.cariNama(tabel(h.skema, 'barang').kolom, 'stok');
  assert.ok(!stok.isi, 'kolom baru belum berisi data lama');
  assert.equal(tabel(h.skema, 'barang').baris, 40, 'ALTER tidak mengubah jumlah baris');
  h = E.jalankanDdl(awal(), 'ALTER TABLE barang ADD x INT AFTER zz');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /zz/);
  h = E.jalankanDdl(awal(), 'ALTER TABLE barang ADD diskon INT NOT NULL');
  assert.match(h.log[0].pesan, /nilai kosong bawaan/);
});

test('MODIFY menjaga isi, memperingatkan NOT NULL hilang & tipe menyusut', () => {
  let h = E.jalankanDdl(awal(), 'ALTER TABLE barang MODIFY nama VARCHAR(60);');
  assert.equal(h.ok, true);
  const k = E.cariNama(tabel(h.skema, 'barang').kolom, 'nama');
  assert.equal(k.tipe, 'VARCHAR(60)');
  assert.equal(k.notNull, false);
  assert.equal(k.isi, true, 'data lama tetap ada');
  assert.match(h.log[0].pesan, /NOT NULL tidak ditulis ulang/);
  h = E.jalankanDdl(awal(), 'ALTER TABLE barang MODIFY nama VARCHAR(10) NOT NULL;');
  assert.match(h.log[0].pesan, /tidak muat/);
  assert.doesNotMatch(h.log[0].pesan, /NOT NULL tidak ditulis ulang/);
  h = E.jalankanDdl(awal(), 'ALTER TABLE barang MODIFY nama VARCHAR(60) NOT NULL AFTER hp;');
  assert.doesNotMatch(h.log[0].pesan, /Perhatian/);
  assert.deepEqual(namaKolom(h.skema, 'barang'), ['kode', 'hp', 'nama', 'id_kat']);
});

test('CHANGE mengganti nama + definisi, memperbarui kunci, dan menjaga isi', () => {
  let h = E.jalankanDdl(awal(), 'ALTER TABLE barang CHANGE hp no_wa VARCHAR(20);');
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  assert.deepEqual(namaKolom(h.skema, 'barang'), ['kode', 'nama', 'no_wa', 'id_kat']);
  const k = E.cariNama(tabel(h.skema, 'barang').kolom, 'no_wa');
  assert.equal(k.tipe, 'VARCHAR(20)');
  assert.equal(k.isi, true);
  assert.match(h.log[0].pesan, /hp.*no_wa/);
  h = E.jalankanDdl(awal(), 'ALTER TABLE kategori CHANGE id_kat id_kategori INT;');
  assert.equal(h.ok, true);
  assert.deepEqual(plain(tabel(h.skema, 'kategori').pk), ['id_kategori']);
  assert.equal(tabel(h.skema, 'barang').fk[0].rujukKolom, 'id_kategori');
  assert.equal(E.jalankanDdl(awal(), 'ALTER TABLE barang CHANGE zz a INT').ok, false);
  assert.equal(E.jalankanDdl(awal(), 'ALTER TABLE barang CHANGE hp nama INT').ok, false);
  /* RENAME COLUMN juga menjaga isi. */
  h = E.jalankanDdl(awal(), 'ALTER TABLE barang RENAME COLUMN hp TO no_wa;');
  assert.equal(E.cariNama(tabel(h.skema, 'barang').kolom, 'no_wa').isi, true);
});

test('DROP COLUMN mencatat data yang ikut terhapus; INSERT menandai isi', () => {
  let h = E.jalankanDdl(awal(), 'ALTER TABLE barang DROP COLUMN hp;');
  assert.equal(h.ok, true);
  assert.match(h.log[0].pesan, /40 baris ikut terhapus permanen/);
  h = E.jalankanDdl(awal(), 'ALTER TABLE kategori DROP COLUMN id_kat;');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /dirujuk kunci tamu/);
  h = E.jalankanDdl(
    E.skemaDariStruktur('toko', STRUKTUR),
    "ALTER TABLE kategori ADD ket VARCHAR(9); INSERT INTO kategori (id_kat, nama_kat) VALUES (1, 'a');"
  );
  const kol = tabel(h.skema, 'kategori').kolom;
  assert.equal(E.cariNama(kol, 'nama_kat').isi, true);
  assert.ok(!E.cariNama(kol, 'ket').isi, 'kolom yang tidak diisi INSERT tetap kosong');
});

test('strukturDariSkema membalik skema aktif ke format harapan', () => {
  const st = E.strukturDariSkema(awal());
  assert.deepEqual(plain(st.map((t) => t.nama)), ['kategori', 'barang']);
  assert.equal(st[1].baris, 40);
  assert.deepEqual(plain(st[1].kolom[2]), {
    nama: 'hp',
    tipe: 'VARCHAR(15)',
    notNull: false,
    isi: true,
  });
  assert.deepEqual(plain(E.strukturDariSkema(E.skemaKosong())), []);
});

test('periksaStruktur opsi panjang membandingkan panjang tipe', () => {
  const s = E.jalankanDdl(awal(), 'ALTER TABLE barang MODIFY nama VARCHAR(60) NOT NULL').skema;
  assert.deepEqual(plain(E.periksaStruktur(s, STRUKTUR, { tabel: ['barang'] })), []);
  const salah = E.periksaStruktur(s, STRUKTUR, { tabel: ['barang'], panjang: true });
  assert.equal(salah.length, 1);
  assert.match(salah[0], /barang\.nama bertipe VARCHAR\(60\), seharusnya VARCHAR\(30\)/);
  assert.equal(E.tipeLengkap('integer'), 'INT');
  assert.equal(E.tipeLengkap('decimal( 5, 2 )'), 'DECIMAL(5,2)');
});

test('periksaSkripDdl jagaIsi menolak DROP+CREATE dan DROP+ADD', () => {
  const harapan = E.strukturDariSkema(
    E.jalankanDdl(awal(), 'ALTER TABLE barang RENAME COLUMN hp TO no_wa').skema
  );
  const opts = { awal: awal(), ketat: true, panjang: true, jagaIsi: true, tabel: ['barang'] };
  assert.equal(
    E.periksaSkripDdl('ALTER TABLE barang CHANGE hp no_wa VARCHAR(15);', harapan, opts).lulus,
    true
  );
  const dropAdd = E.periksaSkripDdl(
    'ALTER TABLE barang DROP COLUMN hp; ALTER TABLE barang ADD no_wa VARCHAR(15) AFTER nama;',
    harapan,
    opts
  );
  assert.equal(dropAdd.ok, true);
  assert.equal(dropAdd.lulus, false);
  assert.match(dropAdd.salah.join(' '), /barang\.no_wa .*data lama hilang/);
  /* Tanpa jagaIsi, DROP+ADD dianggap sama. */
  assert.equal(
    E.periksaSkripDdl(dropAdd.log.map((l) => l.sql).join(';') + ';', harapan, {
      awal: awal(),
      tabel: ['barang'],
    }).lulus,
    true
  );
  const ulang = E.periksaSkripDdl(
    'DROP TABLE barang; CREATE TABLE barang (kode CHAR(4) NOT NULL, nama VARCHAR(30) NOT NULL, ' +
      'no_wa VARCHAR(15), id_kat INT NOT NULL, PRIMARY KEY (kode), ' +
      'FOREIGN KEY (id_kat) REFERENCES kategori(id_kat));',
    harapan,
    opts
  );
  assert.equal(ulang.ok, true);
  assert.match(ulang.salah.join(' '), /Data tabel barang hilang: tadinya 40 baris, sekarang 0/);
  assert.equal(
    ulang.salah.filter((s) => /data lama hilang/.test(s)).length,
    0,
    'tidak dobel melapor per kolom'
  );
});

test('bedaSkema mengenali kolom baru, diubah, ganti nama, dan dihapus', () => {
  const sql =
    'ALTER TABLE barang ADD stok INT NOT NULL DEFAULT 0; ALTER TABLE barang MODIFY nama VARCHAR(60) NOT NULL; ' +
    'ALTER TABLE barang RENAME COLUMN hp TO no_wa; ALTER TABLE kategori DROP COLUMN nama_kat; ' +
    'ALTER TABLE kategori ADD label VARCHAR(20);';
  const h = E.jalankanDdl(awal(), sql);
  assert.equal(h.ok, true, JSON.stringify(plain(h.log)));
  const beda = E.bedaSkema(awal(), h.skema, sql);
  const b = beda.find((t) => t.nama === 'barang');
  const st = (t, n) => t.kolom.find((k) => k.nama === n).status;
  assert.equal(b.status, 'ubah');
  assert.equal(st(b, 'kode'), 'tetap');
  assert.equal(st(b, 'stok'), 'baru');
  assert.equal(st(b, 'nama'), 'ubah');
  assert.equal(b.kolom.find((k) => k.nama === 'nama').tipeLama, 'VARCHAR(30)');
  assert.equal(st(b, 'no_wa'), 'ganti');
  assert.equal(b.kolom.find((k) => k.nama === 'no_wa').namaLama, 'hp');
  assert.equal(b.baris, 40);
  assert.equal(b.barisLama, 40);
  const k = beda.find((t) => t.nama === 'kategori');
  assert.equal(st(k, 'nama_kat'), 'hapus');
  assert.equal(st(k, 'label'), 'baru');
  /* Tanpa sql, ganti nama terbaca sebagai hapus + baru. */
  const kasar = E.bedaSkema(awal(), h.skema).find((t) => t.nama === 'barang');
  assert.equal(st(kasar, 'hp'), 'hapus');
  assert.equal(st(kasar, 'no_wa'), 'baru');
  /* Tabel yang dihapus & tabel tanpa perubahan. */
  const s2 = E.jalankanDdl(awal(), 'ALTER TABLE barang DROP COLUMN hp').skema;
  const b2 = E.bedaSkema(awal(), s2, 'ALTER TABLE barang DROP COLUMN hp');
  assert.equal(b2.find((t) => t.nama === 'kategori').status, 'tetap');
});

test('buildBedaSkema menampilkan legenda, penanda status, dan baris data', () => {
  const sql =
    'ALTER TABLE barang CHANGE hp no_wa VARCHAR(15); ALTER TABLE barang DROP COLUMN nama;';
  const h = E.jalankanDdl(awal(), sql);
  const html = E.buildBedaSkema(E.bedaSkema(awal(), h.skema, sql), { judul: 'Sebelum <> sesudah' });
  assert.match(html, /class="ddl-beda"/);
  assert.match(html, /Sebelum &lt;&gt; sesudah/);
  assert.match(html, /ddl-beda__kolom--ganti/);
  assert.match(html, /ddl-beda__kolom--hapus/);
  assert.match(html, /hp → no_wa/);
  assert.match(html, /40 baris/);
  const hanya = E.buildBedaSkema(E.bedaSkema(awal(), h.skema, sql), { hanyaBerubah: true });
  assert.doesNotMatch(hanya, /kategori/);
  const hilang = E.jalankanDdl(awal(), 'TRUNCATE TABLE barang').skema;
  assert.match(E.buildBedaSkema(E.bedaSkema(awal(), hilang, '')), /ddl-beda__baris--hilang/);
});

test('buildEditorDdl opsi beda menampilkan perubahan terhadap skema awal', () => {
  const st = E.ensureEditorState({}, 'x');
  st.draf = st.jalan = 'ALTER TABLE barang ADD stok INT;';
  const opts = {
    awal: awal(),
    harapan: E.strukturDariSkema(awal()),
    tabel: ['barang'],
    beda: true,
  };
  const html = E.buildEditorDdl('ed', st, opts);
  assert.match(html, /ddl-beda__kolom--baru/);
  const biasa = E.buildEditorDdl('ed', st, Object.assign({}, opts, { beda: false }));
  assert.doesNotMatch(biasa, /ddl-beda/);
  assert.match(biasa, /ddl-schema/);
});

test('DEFAULT: strukturDariErd membawa `bawaan`, periksaStruktur ketat memeriksanya', () => {
  const erd = {
    entitas: [
      {
        id: 'akun',
        label: 'Akun',
        atribut: [
          { id: 'a_id', teks: 'id', pk: true, tipe: 'INT' },
          { id: 'a_saldo', teks: 'saldo', tipe: 'INT', wajib: true, bawaan: 0 },
        ],
      },
    ],
    relasi: [],
  };
  const harapan = E.strukturDariErd(erd);
  assert.equal(harapan[0].kolom[1].bawaan, '0');
  const awalAkun = E.skemaDariStruktur('bank', [
    { nama: 'akun', kolom: [harapan[0].kolom[0]], pk: ['id'], fk: [] },
  ]);
  const opts = { awal: awalAkun, ketat: true };
  assert.equal(
    E.periksaSkripDdl('ALTER TABLE akun ADD saldo INT NOT NULL DEFAULT 0;', harapan, opts).lulus,
    true
  );
  assert.equal(
    E.periksaSkripDdl("ALTER TABLE akun ADD saldo INT NOT NULL DEFAULT '0';", harapan, opts).lulus,
    true,
    'kutip diabaikan'
  );
  const tanpa = E.periksaSkripDdl('ALTER TABLE akun ADD saldo INT NOT NULL;', harapan, opts);
  assert.match(tanpa.salah.join(' '), /akun\.saldo perlu nilai bawaan — tambahkan DEFAULT 0/);
  assert.match(E.buildKamusData(harapan), /Nilai bawaan 0/);
  const s = E.periksaSkripDdl(
    'ALTER TABLE akun ADD saldo INT NOT NULL DEFAULT 0;',
    harapan,
    opts
  ).skema;
  assert.match(E.buildSkemaDdl(s), /DEFAULT 0/);
  assert.equal(E.strukturDariSkema(s)[0].kolom[1].bawaan, '0');
});

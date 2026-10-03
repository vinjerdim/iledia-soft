'use strict';

/*
 * Tes seksi "SQL DDL" pada shared/engine.js: klasifikasi perintah SQL,
 * pengurai pernyataan DDL mini, simulasi DBMS (jalankanDdl) beserta
 * pesan galatnya, struktur tabel dari ERD, urutan pembuatan tabel,
 * pemeriksaan struktur, pembangkit CREATE TABLE, penyorot sintaks, dan
 * konsol DDL berlangkah.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

function tabel(skema, nama) {
  return E.ddlTabel(skema, nama);
}

/* ERD mini perpustakaan (format seksi 15 + tipe kolom). */
const ENT = {
  kategori: { id: 'kategori', label: 'Kategori' },
  buku: { id: 'buku', label: 'Buku' },
  anggota: { id: 'anggota', label: 'Anggota' },
  pinjam: { id: 'pinjam', label: 'Peminjaman' },
};

const ERD = {
  entitas: [
    {
      id: 'pinjam',
      tabel: 'peminjaman',
      label: 'Peminjaman',
      atribut: [
        { id: 'id_pinjam', teks: 'id_pinjam', pk: true, tipe: 'INT' },
        { id: 'tgl', teks: 'tgl_pinjam', tipe: 'DATE', wajib: true },
        { id: 'p_nis', teks: 'nis', fk: 'anggota', tipe: 'VARCHAR(10)', wajib: true },
      ],
    },
    {
      id: 'buku',
      label: 'Buku',
      atribut: [
        { id: 'kode_buku', teks: 'kode_buku', pk: true, tipe: 'VARCHAR(10)' },
        { id: 'judul', teks: 'judul', tipe: 'VARCHAR(100)', wajib: true },
        { id: 'b_kat', teks: 'id_kategori', fk: 'kategori', tipe: 'INT' },
      ],
    },
    {
      id: 'kategori',
      label: 'Kategori',
      atribut: [
        { id: 'id_kategori', teks: 'id_kategori', pk: true, tipe: 'INT' },
        { id: 'nama_kategori', teks: 'nama_kategori', tipe: 'VARCHAR(30)' },
      ],
    },
    {
      id: 'anggota',
      label: 'Anggota',
      atribut: [
        { id: 'nis', teks: 'nis', pk: true, tipe: 'VARCHAR(10)' },
        { id: 'nama', teks: 'nama_anggota', tipe: 'VARCHAR(50)' },
      ],
    },
    {
      id: 'detail',
      tabel: 'detail_pinjam',
      label: 'Detail Peminjaman',
      penghubung: true,
      atribut: [
        { id: 'd_pinjam', teks: 'id_pinjam', pk: true, fk: 'pinjam', tipe: 'INT' },
        { id: 'd_buku', teks: 'kode_buku', pk: true, fk: 'buku', tipe: 'VARCHAR(10)' },
      ],
    },
  ],
  relasi: [
    { id: 'r1', a: ENT.kategori, b: ENT.buku, ab: '0..N', ba: '1..1' },
    { id: 'r2', a: ENT.anggota, b: ENT.pinjam, ab: '0..N', ba: '1..1' },
    { id: 'r3', a: ENT.pinjam, b: ENT.buku, ab: '1..N', ba: '0..N', penghubung: 'detail' },
  ],
};

const AWAL = 'CREATE DATABASE db_perpus; USE db_perpus;';

test('klasifikasiPerintah membedakan DDL, DML, DCL, dan TCL', () => {
  [
    ['CREATE TABLE a (x INT);', 'ddl'],
    ['create database x', 'ddl'],
    ['ALTER TABLE a ADD y INT', 'ddl'],
    ['DROP TABLE a', 'ddl'],
    ['TRUNCATE TABLE a', 'ddl'],
    ['RENAME TABLE a TO b', 'ddl'],
    ['INSERT INTO a VALUES (1)', 'dml'],
    ['UPDATE a SET x = 1', 'dml'],
    ['DELETE FROM a', 'dml'],
    ['SELECT * FROM a', 'dml'],
    ['GRANT SELECT ON a TO budi', 'dcl'],
    ['REVOKE SELECT ON a FROM budi', 'dcl'],
    ['COMMIT', 'tcl'],
    ['ROLLBACK', 'tcl'],
    ['  -- komentar\n  create table b (x int)', 'ddl'],
    ['USE db', 'lain'],
    ['', 'lain'],
  ].forEach(([sql, k]) => assert.equal(E.klasifikasiPerintah(sql), k, sql));
});

test('pecahPernyataan memisahkan per titik koma tanpa memotong teks di dalam kutip', () => {
  assert.deepEqual(plain(E.pecahPernyataan("USE a; INSERT INTO t VALUES ('x;y'); ;")), [
    'USE a',
    "INSERT INTO t VALUES ('x;y')",
  ]);
  assert.deepEqual(plain(E.pecahPernyataan('-- catatan\nCREATE DATABASE a')), [
    'CREATE DATABASE a',
  ]);
});

test('uraiDdl mengurai CREATE TABLE lengkap dengan constraint', () => {
  const p = E.uraiDdl(
    'CREATE TABLE IF NOT EXISTS `buku` (\n' +
      '  kode_buku VARCHAR(10) NOT NULL,\n' +
      '  judul varchar(100) NOT NULL UNIQUE,\n' +
      '  stok INT DEFAULT 0,\n' +
      '  harga DECIMAL(10,2),\n' +
      '  id_kategori INT,\n' +
      '  PRIMARY KEY (kode_buku),\n' +
      '  FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)\n' +
      ');'
  );
  assert.equal(p.length, 1);
  const c = p[0];
  assert.equal(c.jenis, 'createTable');
  assert.equal(c.nama, 'buku');
  assert.equal(c.ifNotExists, true);
  assert.deepEqual(plain(c.kolom.map((k) => [k.nama, k.tipe])), [
    ['kode_buku', 'VARCHAR(10)'],
    ['judul', 'VARCHAR(100)'],
    ['stok', 'INT'],
    ['harga', 'DECIMAL(10,2)'],
    ['id_kategori', 'INT'],
  ]);
  assert.equal(c.kolom[0].notNull, true);
  assert.equal(c.kolom[1].unique, true);
  assert.equal(c.kolom[2].bawaan, '0');
  assert.deepEqual(plain(c.pk), ['kode_buku']);
  assert.deepEqual(plain(c.fk), [
    { kolom: 'id_kategori', rujukTabel: 'kategori', rujukKolom: 'id_kategori' },
  ]);
});

test('uraiDdl: PRIMARY KEY & AUTO_INCREMENT di definisi kolom, kunci gabungan', () => {
  const [a] = E.uraiDdl('CREATE TABLE k (id INT PRIMARY KEY AUTO_INCREMENT, n CHAR(3))');
  assert.deepEqual(plain(a.pk), ['id']);
  assert.equal(a.kolom[0].autoInc, true);
  assert.equal(a.kolom[0].notNull, true, 'kolom PK otomatis NOT NULL');
  const [b] = E.uraiDdl(
    'CREATE TABLE d (a INT, b INT, PRIMARY KEY (a, b), FOREIGN KEY (a) REFERENCES x(a))'
  );
  assert.deepEqual(plain(b.pk), ['a', 'b']);
});

test('uraiDdl mengurai ALTER, DROP, TRUNCATE, RENAME, CREATE/DROP DATABASE, USE, INSERT', () => {
  const p = E.uraiDdl(
    'CREATE DATABASE db1; USE db1; ALTER TABLE t ADD COLUMN x INT NOT NULL, DROP COLUMN y, ' +
      'MODIFY z VARCHAR(20); ALTER TABLE t ADD FOREIGN KEY (a) REFERENCES u(b); ' +
      'ALTER TABLE t RENAME TO t2; DROP TABLE IF EXISTS t2; TRUNCATE TABLE u; ' +
      "RENAME TABLE u TO v; DROP DATABASE db1; INSERT INTO v VALUES (1, 'a'), (2, 'b');"
  );
  assert.deepEqual(plain(p.map((x) => x.jenis)), [
    'createDatabase',
    'use',
    'alterTable',
    'alterTable',
    'alterTable',
    'dropTable',
    'truncate',
    'renameTable',
    'dropDatabase',
    'insert',
  ]);
  assert.deepEqual(plain(p[2].aksi.map((a) => a.tipe)), ['add', 'drop', 'modify']);
  assert.equal(p[2].aksi[0].kolom.notNull, true);
  assert.equal(p[3].aksi[0].tipe, 'addFk');
  assert.equal(p[4].aksi[0].tipe, 'renameTo');
  assert.equal(p[4].aksi[0].nama, 't2');
  assert.equal(p[5].ifExists, true);
  assert.equal(p[7].dari, 'u');
  assert.equal(p[7].ke, 'v');
  assert.equal(p[9].baris, 2);
});

test('uraiDdl melaporkan galat sintaks dan perintah bukan DDL', () => {
  const [a] = E.uraiDdl('CREATE TABEL x (a INT)');
  assert.equal(a.jenis, 'galat');
  assert.ok(a.pesan);
  const [b] = E.uraiDdl('CREATE TABLE x (a VARCHAR)');
  assert.equal(b.jenis, 'galat');
  assert.match(b.pesan, /VARCHAR/);
  const [c] = E.uraiDdl('CREATE TABLE x (a INT');
  assert.equal(c.jenis, 'galat');
  const [d] = E.uraiDdl('CREATE TABLE x (a TIPEANEH)');
  assert.equal(d.jenis, 'galat');
  assert.match(d.pesan, /TIPEANEH/);
  const [e] = E.uraiDdl('SELECT * FROM x');
  assert.equal(e.jenis, 'bukanDdl');
  assert.equal(e.kategori, 'dml');
});

test('jalankanDdl: tabel butuh basis data aktif', () => {
  const h = E.jalankanDdl(E.skemaKosong(), 'CREATE TABLE a (x INT)');
  assert.equal(h.ok, false);
  assert.match(h.log[0].pesan, /USE/);
  const h2 = E.jalankanDdl(E.skemaKosong(), AWAL + ' CREATE TABLE a (x INT);');
  assert.equal(h2.ok, true);
  assert.equal(h2.skema.aktif, 'db_perpus');
  assert.ok(tabel(h2.skema, 'a'));
  assert.equal(h2.log.length, 3);
});

test('jalankanDdl tidak mengubah skema masukan dan berhenti di galat pertama', () => {
  const s0 = E.jalankanDdl(E.skemaKosong(), AWAL).skema;
  const snap = JSON.stringify(s0);
  const h = E.jalankanDdl(
    s0,
    'CREATE TABLE a (x INT); CREATE TABLE a (y INT); CREATE TABLE b (z INT);'
  );
  assert.equal(JSON.stringify(s0), snap, 'skema asal utuh');
  assert.equal(h.ok, false);
  assert.equal(h.log.length, 2);
  assert.match(h.log[1].pesan, /sudah ada/);
  assert.ok(tabel(h.skema, 'a'));
  assert.ok(!tabel(h.skema, 'b'), 'pernyataan setelah galat tidak dijalankan');
});

test('jalankanDdl: aturan kunci tamu (tabel rujukan, kolom, tipe sama)', () => {
  const base = E.jalankanDdl(
    E.skemaKosong(),
    AWAL + ' CREATE TABLE anggota (nis VARCHAR(10), PRIMARY KEY (nis));'
  ).skema;
  const belum = E.jalankanDdl(
    base,
    'CREATE TABLE p (id INT, kode VARCHAR(10), PRIMARY KEY (id), FOREIGN KEY (kode) REFERENCES buku(kode))'
  );
  assert.equal(belum.ok, false);
  assert.match(belum.log[0].pesan, /buku/);
  assert.match(belum.log[0].pesan, /belum ada/);
  const beda = E.jalankanDdl(
    base,
    'CREATE TABLE p (id INT, nis INT, PRIMARY KEY (id), FOREIGN KEY (nis) REFERENCES anggota(nis))'
  );
  assert.equal(beda.ok, false);
  assert.match(beda.log[0].pesan, /tipe/i);
  const kolom = E.jalankanDdl(
    base,
    'CREATE TABLE p (id INT, nis VARCHAR(10), PRIMARY KEY (id), FOREIGN KEY (nis) REFERENCES anggota(no))'
  );
  assert.equal(kolom.ok, false);
  const ok = E.jalankanDdl(
    base,
    'CREATE TABLE p (id INT, nis VARCHAR(10), PRIMARY KEY (id), FOREIGN KEY (nis) REFERENCES anggota(nis))'
  );
  assert.equal(ok.ok, true);
  const drop = E.jalankanDdl(ok.skema, 'DROP TABLE anggota');
  assert.equal(drop.ok, false);
  assert.match(drop.log[0].pesan, /dirujuk/);
  const urut = E.jalankanDdl(ok.skema, 'DROP TABLE p; DROP TABLE anggota;');
  assert.equal(urut.ok, true);
  assert.equal(E.ddlDbAktif(urut.skema).tabel.length, 0);
});

test('jalankanDdl: ALTER, RENAME, TRUNCATE, DROP, INSERT, dan galat kolom', () => {
  let s = E.jalankanDdl(
    E.skemaKosong(),
    AWAL + ' CREATE TABLE a (id INT, n VARCHAR(5), PRIMARY KEY (id));'
  ).skema;
  let h = E.jalankanDdl(
    s,
    'ALTER TABLE a ADD kelas VARCHAR(10); ALTER TABLE a MODIFY n VARCHAR(50);'
  );
  assert.equal(h.ok, true);
  assert.deepEqual(plain(tabel(h.skema, 'a').kolom.map((k) => k.nama + ' ' + k.tipe)), [
    'id INT',
    'n VARCHAR(50)',
    'kelas VARCHAR(10)',
  ]);
  assert.equal(E.jalankanDdl(h.skema, 'ALTER TABLE a ADD n INT').ok, false);
  assert.equal(E.jalankanDdl(h.skema, 'ALTER TABLE a DROP COLUMN zz').ok, false);
  assert.equal(E.jalankanDdl(h.skema, 'ALTER TABLE x ADD y INT').ok, false);

  h = E.jalankanDdl(h.skema, "INSERT INTO a VALUES (1,'x','y'), (2,'p','q');");
  assert.equal(h.ok, true);
  assert.equal(h.log[0].kategori, 'dml');
  assert.equal(tabel(h.skema, 'a').baris, 2);
  assert.equal(E.jalankanDdl(h.skema, "INSERT INTO a (zz) VALUES ('x')").ok, false);
  assert.equal(E.jalankanDdl(h.skema, "INSERT INTO a VALUES (3, 'x')").ok, false);
  h = E.jalankanDdl(h.skema, 'TRUNCATE TABLE a');
  assert.equal(tabel(h.skema, 'a').baris, 0);
  assert.equal(tabel(h.skema, 'a').kolom.length, 3, 'TRUNCATE mempertahankan struktur');

  h = E.jalankanDdl(h.skema, 'RENAME TABLE a TO b');
  assert.ok(!tabel(h.skema, 'a') && tabel(h.skema, 'b'));
  h = E.jalankanDdl(h.skema, 'ALTER TABLE b RENAME TO c');
  assert.ok(tabel(h.skema, 'c'));
  h = E.jalankanDdl(h.skema, 'DROP TABLE c');
  assert.ok(!tabel(h.skema, 'c'));
  assert.equal(E.jalankanDdl(h.skema, 'DROP TABLE c').ok, false);
  assert.equal(E.jalankanDdl(h.skema, 'DROP TABLE IF EXISTS c').ok, true);
  assert.equal(E.jalankanDdl(h.skema, 'SELECT * FROM c').ok, false, 'hanya DDL + INSERT');

  h = E.jalankanDdl(h.skema, 'DROP DATABASE db_perpus');
  assert.equal(h.ok, true);
  assert.equal(h.skema.aktif, null);
  assert.equal(h.skema.basisData.length, 0);
});

test('jalankanDdl: RENAME memperbarui rujukan kunci tamu tabel lain', () => {
  const s = E.jalankanDdl(
    E.skemaKosong(),
    AWAL +
      ' CREATE TABLE k (id INT, PRIMARY KEY (id));' +
      ' CREATE TABLE b (x INT, id INT, PRIMARY KEY (x), FOREIGN KEY (id) REFERENCES k(id));' +
      ' RENAME TABLE k TO kategori;'
  ).skema;
  assert.equal(tabel(s, 'b').fk[0].rujukTabel, 'kategori');
});

test('strukturDariErd menurunkan tabel, kolom, PK, dan FK dari ERD', () => {
  const st = E.strukturDariErd(ERD);
  assert.deepEqual(plain(st.map((t) => t.nama)), [
    'peminjaman',
    'buku',
    'kategori',
    'anggota',
    'detail_pinjam',
  ]);
  const det = st.find((t) => t.nama === 'detail_pinjam');
  assert.deepEqual(plain(det.pk), ['id_pinjam', 'kode_buku']);
  assert.deepEqual(plain(det.fk), [
    { kolom: 'id_pinjam', rujukTabel: 'peminjaman', rujukKolom: 'id_pinjam' },
    { kolom: 'kode_buku', rujukTabel: 'buku', rujukKolom: 'kode_buku' },
  ]);
  const p = st.find((t) => t.nama === 'peminjaman');
  assert.equal(p.kolom.find((k) => k.nama === 'tgl_pinjam').notNull, true);
  assert.equal(p.kolom.find((k) => k.nama === 'id_pinjam').tipe, 'INT');
});

test('urutanBuatTabel: induk sebelum anak; mengikuti preferensi bila valid', () => {
  const u = E.urutanBuatTabel(ERD);
  assert.equal(u.length, 5);
  const pos = (n) => u.indexOf(n);
  assert.ok(pos('kategori') < pos('buku'));
  assert.ok(pos('anggota') < pos('peminjaman'));
  assert.ok(pos('peminjaman') < pos('detail_pinjam'));
  assert.ok(pos('buku') < pos('detail_pinjam'));
  const pilih = ['anggota', 'kategori', 'peminjaman', 'buku', 'detail_pinjam'];
  assert.deepEqual(plain(E.urutanBuatTabel(ERD, pilih)), pilih);
  const salah = ['buku', 'kategori', 'anggota', 'peminjaman', 'detail_pinjam'];
  const benar = E.urutanBuatTabel(ERD, salah);
  assert.equal(benar[0], 'kategori', 'buku belum boleh: kategori didahulukan');
  assert.equal(E.urutanValid(ERD, pilih), true);
  assert.equal(E.urutanValid(ERD, salah), false);
  assert.equal(E.urutanValid(ERD, pilih.slice(0, 4)), false);
});

test('ddlBuatTabel membangkitkan CREATE TABLE yang bisa diurai kembali', () => {
  const st = E.strukturDariErd(ERD);
  const det = st.find((t) => t.nama === 'detail_pinjam');
  const sql = E.ddlBuatTabel(det);
  assert.match(sql, /^CREATE TABLE detail_pinjam \(\n/);
  assert.match(sql, /PRIMARY KEY \(id_pinjam, kode_buku\)/);
  assert.match(sql, /\);$/);
  const [p] = E.uraiDdl(sql);
  assert.equal(p.jenis, 'createTable');
  assert.deepEqual(plain(p.pk), plain(det.pk));
  assert.deepEqual(plain(p.fk), plain(det.fk));
  const kat = E.ddlBuatTabel(st.find((t) => t.nama === 'peminjaman'));
  assert.match(kat, /tgl_pinjam DATE NOT NULL/);
});

test('skrip dari ERD lolos simulasi dan periksaStruktur; selisih dilaporkan', () => {
  const st = E.strukturDariErd(ERD);
  const skrip = E.ddlSkripErd(ERD, 'db_perpus');
  assert.match(skrip, /^CREATE DATABASE db_perpus;\nUSE db_perpus;/);
  const h = E.jalankanDdl(E.skemaKosong(), skrip);
  assert.equal(h.ok, true, JSON.stringify(h.log[h.log.length - 1]));
  assert.deepEqual(plain(E.periksaStruktur(h.skema, st)), []);

  const kurang = E.jalankanDdl(
    E.skemaKosong(),
    AWAL +
      ' CREATE TABLE kategori (id_kategori VARCHAR(5), PRIMARY KEY (id_kategori));' +
      ' CREATE TABLE anggota (nis VARCHAR(10), nama_anggota VARCHAR(50));'
  ).skema;
  const selisih = E.periksaStruktur(kurang, st);
  const teks = selisih.join('\n');
  assert.match(teks, /peminjaman/);
  assert.match(teks, /nama_kategori/);
  assert.match(teks, /id_kategori/);
  assert.match(teks, /kunci primer/i);
});

test('sorotSql meng-escape HTML dan menandai kata kunci, tipe, dan teks', () => {
  const h = E.sorotSql("CREATE TABLE t (n VARCHAR(5) DEFAULT '<b>'); -- catatan");
  assert.ok(!h.includes('<b>'));
  assert.match(h, /&lt;b&gt;/);
  assert.match(h, /<span class="sql-kw">CREATE<\/span>/);
  assert.match(h, /<span class="sql-type">VARCHAR<\/span>/);
  assert.match(h, /<span class="sql-str">/);
  assert.match(h, /<span class="sql-com">-- catatan<\/span>/);
});

test('putarKonsol memutar ulang langkah yang dijalankan dan percobaan bebas', () => {
  const langkah = [
    { id: 'l1', sql: 'CREATE DATABASE d;' },
    { id: 'l2', sql: 'CREATE TABLE a (x INT);' },
    { id: 'l3', sql: 'USE d;' },
    { id: 'l4', sql: 'CREATE TABLE a (x INT);' },
  ];
  const st = E.ensureKonsolState({}, 'k').k;
  assert.deepEqual(plain(st), { jalan: 0, bebas: [], draf: '' });
  st.jalan = 4;
  st.bebas = ['ALTER TABLE a ADD y INT', 'DROP TABLE zzz'];
  const h = E.putarKonsol(E.skemaKosong(), langkah, st);
  assert.equal(h.log.length, 6);
  assert.deepEqual(plain(h.log.map((l) => l.ok)), [true, false, true, true, true, false]);
  assert.equal(tabel(h.skema, 'a').kolom.length, 2, 'galat tidak menghentikan langkah berikutnya');
  const html = E.buildKonsolDdl('k', langkah, st, { awal: E.skemaKosong(), bebas: true });
  assert.match(html, /id="kBebas"/);
  assert.match(html, /ddl-log/);
  assert.ok(!html.includes('data-konsol-run'), 'semua langkah sudah dijalankan');
  const st2 = { jalan: 1, bebas: [], draf: '' };
  const html2 = E.buildKonsolDdl('k', langkah, st2, { awal: E.skemaKosong() });
  assert.match(html2, /data-konsol-run="k"/);
  assert.ok(!html2.includes('id="kBebas"'), 'konsol bebas hanya bila diminta & langkah tuntas');
});

test('buildSkemaDdl menampilkan basis data aktif, kolom, PK, FK, dan jumlah baris', () => {
  const s = E.jalankanDdl(E.skemaKosong(), E.ddlSkripErd(ERD, 'db_perpus')).skema;
  const html = E.buildSkemaDdl(s);
  assert.match(html, /db_perpus/);
  assert.match(html, /detail_pinjam/);
  assert.match(html, /🔑/);
  assert.match(html, /🔗/);
  assert.match(html, /→ buku\.kode_buku/);
  assert.match(E.buildSkemaDdl(E.skemaKosong()), /Belum ada basis data/);
});

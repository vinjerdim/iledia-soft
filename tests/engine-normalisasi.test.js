'use strict';

/*
 * Tes seksi "Normalisasi basis data" pada shared/engine.js: sel atomik,
 * perataan grup berulang (1NF), closure atribut, jenis ketergantungan
 * fungsional (penuh/parsial/transitif), bentuk normal sebuah tabel,
 * pemeriksaan dekomposisi, hitungan redundansi, dan render tabel/skema.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

const KOLOM = [
  { id: 'nota', teks: 'No Nota' },
  { id: 'tgl', teks: 'Tanggal' },
  { id: 'nis', teks: 'NIS' },
  { id: 'nama', teks: 'Nama Siswa' },
  { id: 'kelas', teks: 'Kelas' },
  { id: 'wali', teks: 'Wali Kelas' },
  { id: 'kode', teks: 'Kode Barang' },
  { id: 'barang', teks: 'Nama Barang' },
  { id: 'harga', teks: 'Harga' },
  { id: 'jml', teks: 'Jumlah' },
];

const FD = [
  { id: 'f1', dari: ['nota', 'kode'], ke: ['jml'] },
  { id: 'f2', dari: ['nota'], ke: ['tgl', 'nis'] },
  { id: 'f3', dari: ['kode'], ke: ['barang', 'harga'] },
  { id: 'f4', dari: ['nis'], ke: ['nama', 'kelas'] },
  { id: 'f5', dari: ['kelas'], ke: ['wali'] },
];

const UNF = [
  {
    nota: 'N1',
    tgl: 't1',
    nis: '1',
    nama: 'Ayu',
    kelas: 'A',
    wali: 'Rina',
    kode: ['B1', 'B7'],
    barang: ['Pulpen', 'Buku'],
    harga: ['3500', '6000'],
    jml: ['2', '3'],
  },
  {
    nota: 'N2',
    tgl: 't1',
    nis: '2',
    nama: 'Dimas',
    kelas: 'B',
    wali: 'Hadi',
    kode: ['B7'],
    barang: ['Buku'],
    harga: ['6000'],
    jml: ['1'],
  },
  {
    nota: 'N3',
    tgl: 't2',
    nis: '1',
    nama: 'Ayu',
    kelas: 'A',
    wali: 'Rina',
    kode: ['B1', 'B7'],
    barang: ['Pulpen', 'Buku'],
    harga: ['3500', '6000'],
    jml: ['1', '1'],
  },
];

function tabel(extra) {
  return Object.assign(
    { id: 't', label: 'Rekap', kolom: KOLOM, pk: ['nota', 'kode'], fd: FD },
    extra
  );
}

function kol(ids) {
  return ids.map((id) => KOLOM.find((k) => k.id === id));
}

function hasil3NF() {
  return [
    { id: 'nota', label: 'Nota', kolom: kol(['nota', 'tgl', 'nis']), pk: ['nota'] },
    { id: 'siswa', label: 'Siswa', kolom: kol(['nis', 'nama', 'kelas']), pk: ['nis'] },
    { id: 'kelas', label: 'Kelas', kolom: kol(['kelas', 'wali']), pk: ['kelas'] },
    { id: 'barang', label: 'Barang', kolom: kol(['kode', 'barang', 'harga']), pk: ['kode'] },
    {
      id: 'detail',
      label: 'Detail Nota',
      kolom: kol(['nota', 'kode', 'jml']),
      pk: ['nota', 'kode'],
    },
  ];
}

test('selAtomik: array berisi lebih dari satu nilai tidak atomik', () => {
  assert.equal(E.selAtomik('Ayu Lestari'), true, 'dua kata tetap satu nilai');
  assert.equal(E.selAtomik(['B1']), true, 'array satu isi = satu nilai');
  assert.equal(E.selAtomik(['B1', 'B7']), false);
  assert.equal(E.selAtomik(''), true);
});

test('selTakAtomik mendaftar kunci sel majemuk urut baris lalu kolom', () => {
  const keys = plain(E.selTakAtomik(tabel({ baris: UNF })));
  assert.deepEqual(keys, [
    '0:kode',
    '0:barang',
    '0:harga',
    '0:jml',
    '2:kode',
    '2:barang',
    '2:harga',
    '2:jml',
  ]);
  assert.equal(E.kunciSel(3, 'nama'), '3:nama');
});

test('ratakanBaris memecah grup berulang menjadi baris atomik (1NF)', () => {
  const rata = plain(E.ratakanBaris(UNF));
  assert.equal(rata.length, 5);
  assert.deepEqual(rata[0], {
    nota: 'N1',
    tgl: 't1',
    nis: '1',
    nama: 'Ayu',
    kelas: 'A',
    wali: 'Rina',
    kode: 'B1',
    barang: 'Pulpen',
    harga: '3500',
    jml: '2',
  });
  assert.equal(rata[1].kode, 'B7');
  assert.equal(rata[2].kode, 'B7', 'array satu isi dibuka');
  rata.forEach((b) => Object.values(b).forEach((v) => assert.equal(typeof v, 'string')));
  assert.equal(UNF[0].kode.length, 2, 'masukan tidak diubah');
});

test('tutupAtribut menghitung closure lewat ketergantungan berantai', () => {
  assert.deepEqual(plain(E.tutupAtribut(['nis'], FD)).sort(), ['kelas', 'nama', 'nis', 'wali']);
  assert.deepEqual(
    plain(E.tutupAtribut(['nota', 'kode'], FD)).sort(),
    KOLOM.map((k) => k.id).sort()
  );
});

test('jenisKetergantungan: penuh, parsial, transitif terhadap kunci primer', () => {
  const t = tabel();
  assert.equal(E.jenisKetergantungan(FD[0], t), 'penuh');
  assert.equal(E.jenisKetergantungan(FD[1], t), 'parsial');
  assert.equal(E.jenisKetergantungan(FD[2], t), 'parsial');
  assert.equal(E.jenisKetergantungan(FD[3], t), 'transitif');
  assert.equal(E.jenisKetergantungan(FD[4], t), 'transitif');
});

test('fdTeks memakai nama kolom', () => {
  assert.equal(E.fdTeks(FD[0], tabel()), 'No Nota, Kode Barang → Jumlah');
  assert.equal(E.fdTeks(FD[3], tabel()), 'NIS → Nama Siswa, Kelas');
});

test('bentukNormal: 0 (tak atomik/tanpa kunci), 1, 2, 3', () => {
  assert.equal(E.bentukNormal(tabel({ baris: UNF })), 0, 'grup berulang');
  assert.equal(E.bentukNormal(tabel({ pk: [] })), 0, 'tanpa kunci');
  assert.equal(E.bentukNormal(tabel({ pk: ['nota'] })), 0, 'kunci tidak menentukan semua kolom');
  assert.equal(E.bentukNormal(tabel({ baris: E.ratakanBaris(UNF) })), 1, 'ada parsial');
  const nota2 = {
    kolom: kol(['nota', 'tgl', 'nis', 'nama', 'kelas', 'wali']),
    pk: ['nota'],
    fd: FD,
  };
  assert.equal(E.bentukNormal(nota2), 2, 'tanpa parsial, ada transitif');
  hasil3NF().forEach((t) => assert.equal(E.bentukNormal(Object.assign({ fd: FD }, t)), 3, t.id));
});

test('proyeksiFd hanya memuat ketergantungan di dalam kolom tabel', () => {
  const p = plain(E.proyeksiFd(FD, ['nota', 'tgl', 'nis', 'nama']));
  assert.deepEqual(p, [
    { dari: ['nota'], ke: ['tgl', 'nis', 'nama'] },
    { dari: ['nis'], ke: ['nama'] },
  ]);
});

test('periksaDekomposisi: rancangan 3NF yang benar tanpa kesalahan', () => {
  const asal = tabel();
  assert.deepEqual(plain(E.periksaDekomposisi(asal, hasil3NF())), []);
  const dua = [
    {
      id: 'nota',
      label: 'Nota',
      kolom: kol(['nota', 'tgl', 'nis', 'nama', 'kelas', 'wali']),
      pk: ['nota'],
    },
    hasil3NF()[3],
    hasil3NF()[4],
  ];
  assert.deepEqual(plain(E.periksaDekomposisi(asal, dua, 2)), [], 'lolos target 2NF');
  const salah = plain(E.periksaDekomposisi(asal, dua));
  assert.equal(salah.length, 1);
  assert.match(salah[0], /Nota/);
  assert.match(salah[0], /2NF/);
});

test('periksaDekomposisi menemukan atribut hilang, redundan, kunci salah, parsial', () => {
  const asal = tabel();
  const rusak = hasil3NF();
  rusak[2] = { id: 'kelas', label: 'Kelas', kolom: kol(['kelas']), pk: ['kelas'] }; // wali hilang
  rusak[1].kolom = kol(['nis', 'nama', 'kelas', 'harga']); // harga ganda & kunci salah
  rusak[4].kolom = kol(['nota', 'kode', 'jml', 'barang']); // barang ganda & parsial
  const msg = plain(E.periksaDekomposisi(asal, rusak)).join('\n');
  assert.match(msg, /"Wali Kelas" hilang/);
  assert.match(msg, /"Harga" disimpan di lebih dari satu tabel/);
  assert.match(msg, /Kunci primer tabel Siswa tidak menentukan/);
  assert.match(msg, /Detail Nota baru memenuhi 1NF/);
  assert.match(msg, /Kelas → Wali Kelas/, 'ketergantungan tak terjaga');
});

test('periksaDekomposisi: kunci asal harus tersimpan di salah satu tabel', () => {
  const tanpaDetail = hasil3NF().slice(0, 4);
  tanpaDetail.push({ id: 'jml', label: 'Jumlah', kolom: kol(['nota', 'jml']), pk: ['nota'] });
  const msg = plain(E.periksaDekomposisi(tabel(), tanpaDetail)).join('\n');
  assert.match(msg, /kunci asal \(No Nota, Kode Barang\)/);
});

test('hitungRedundansi menghitung sel yang mengulang fakta yang sama', () => {
  const t1 = tabel({ baris: E.ratakanBaris(UNF) });
  const r = plain(E.hitungRedundansi(t1));
  assert.equal(r.sel, 50);
  /* N1 dua baris: tgl,nis,nama,kelas,wali berulang 1×5 = 5; N3 juga 5.
     B7 muncul 3×: barang,harga 2×2 = 4; B1 2×: 2.
     NIS 1 juga di baris pertama N3 → nama,kelas,wali +3. Kelas A
     tidak menambah (wali di baris itu sudah terhitung). */
  assert.equal(r.berulang, 19);
  const d = plain(E.hitungDekomposisi(t1, hasil3NF()));
  assert.equal(d.berulang, 0);
  /* Nota 3×3 + Siswa 2×3 + Kelas 2×2 + Barang 2×3 + Detail 5×3 */
  assert.equal(d.sel, 9 + 6 + 4 + 6 + 15);
  assert.equal(plain(E.proyeksiBaris(t1.baris, ['nis', 'nama'])).length, 2);
});

test('periksaSel: tepat, salah pilih, dan terlewat', () => {
  const r = plain(E.periksaSel(['0:kode', '0:jml'], { '0:kode': true, '1:nama': true }));
  assert.deepEqual(r, {
    semuaBenar: false,
    tepat: 1,
    total: 2,
    salah: ['1:nama'],
    terlewat: ['0:jml'],
  });
  assert.equal(E.periksaSel(['0:kode'], { '0:kode': true, '0:jml': false }).semuaBenar, true);
});

test('buildTabelData: header PK/FK, sel majemuk, sel ketuk bertanda', () => {
  const t = tabel({
    baris: UNF,
    kolom: KOLOM.map((k) => (k.id === 'nis' ? Object.assign({ fk: 'siswa' }, k) : k)),
  });
  const html = E.buildTabelData(t, { judul: 'Rekap <x>' });
  assert.match(html, /class="nf-table-wrap"[^>]*tabindex="0"/);
  assert.match(html, /<caption[^>]*>Rekap &lt;x&gt;<\/caption>/);
  assert.match(html, /🔑[^<]*<\/span> No Nota/);
  assert.match(html, /🔗[^<]*<\/span> NIS/);
  assert.match(html, /Pulpen, Buku/);
  assert.doesNotMatch(html, /data-sel=/);

  const ketuk = E.buildTabelData(t, {
    id: 'unf',
    ketuk: true,
    pilih: { '0:kode': true },
    tanda: { '0:kode': 'benar', '0:nama': 'salah', '2:kode': 'terlewat' },
  });
  assert.match(ketuk, /data-sel="0:kode" data-tabel="unf"[^>]*aria-pressed="true"/);
  assert.match(ketuk, /nf-cell-btn is-selected is-correct" data-sel="0:kode"/);
  assert.match(ketuk, /nf-cell-btn is-incorrect" data-sel="0:nama"/);
  assert.match(ketuk, /nf-cell-btn is-missed" data-sel="2:kode"/);
});

test('buildSkemaRelasi menandai PK bergaris bawah dan FK', () => {
  const html = E.buildSkemaRelasi({
    label: 'Siswa',
    ikon: '🧑',
    kolom: [
      { id: 'nis', teks: 'NIS' },
      { id: 'kelas', teks: 'Kelas', fk: 'kelas' },
    ],
    pk: ['nis'],
  });
  assert.match(html, /Siswa/);
  assert.match(html, /nf-schema__kol--pk[^>]*>.*NIS/);
  assert.match(html, /nf-schema__kol--fk[^>]*>.*Kelas/);
});

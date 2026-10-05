'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Menghapus Basis Data dan Tabel
   dengan DROP DATABASE dan DROP TABLE
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js (seksi 17 SQL DDL: simulator, konsol,
   editor DDL berpemeriksa, server berisi data, laporan dampak).
   Guru dapat menyunting teks, soal, kunci, dan umpan balik di
   sini tanpa menyentuh kode.

   Masalah autentik (lanjutan MPI 2.2 & 2.3): akhir tahun ajaran,
   server DBMS sekolah hampir penuh dan berantakan. Selain basis
   data utama `bank_sampah` (berisi tabungan siswa) ada salinan
   latihan `bank_sampah_uji`, tabel sisa impor `setoran_impor_tmp`,
   dan arsip lomba `kuis_hadiah` ← `pemenang_kuis`. Di server yang
   sama ada `tefa_servis` milik kelas lain. Tim junior sudah dua
   kali salah menjalankan DROP. Tim murid menghapus TEPAT objek
   yang diminta — memeriksa target, urutan kunci tamu, dan basis
   data aktif — menulis skripnya SENDIRI, menguji di salinan
   server, menganalisis risiko skrip tim junior, lalu menyajikan
   bukti bahwa data tabungan utuh. Kasus transfer: Servis Laptop
   TEFA.

   Pemetaan sintaks PBL → tahap media:
     1. Orientasi murid pada masalah
                         → orientasi   (TP, alur, apersepsi)
                         → masalah     (memo pembina, log insiden,
                                        isi server, akar masalah,
                                        rumusan masalah)
     2. Mengorganisasi murid untuk belajar
                         → organisasi  (peran tim, rencana langkah
                                        penghapusan yang aman)
     3. Membimbing penyelidikan individu & kelompok
                         → konsep      (kartu sintaks DROP, pilah
                                        perintah & dampak)
                         → hapusTabel  (konsol DROP TABLE, kunci tamu,
                                        IF EXISTS; tulis sendiri)
                         → hapusDb     (konsol DROP DATABASE & basis
                                        data aktif; tulis sendiri)
     4. Mengembangkan & menyajikan hasil karya
                         → risiko      (uji skrip tim junior di
                                        salinan server, laporan
                                        dampak, aturan aman)
                         → sajikan     (skrip pembersihan tim di
                                        server awal, bukti sebelum–
                                        sesudah, klaim presentasi)
     5. Menganalisis & mengevaluasi proses pemecahan masalah
                         → evaluasi    (kasus Servis Laptop TEFA +
                                        uji silang skrip Tim Biru)
                         → refleksi
     Penutup             → selesai

   KONVENSI: struktur tabel memakai format strukturDariErd engine
   seksi 17 ({ nama, kolom: [{ nama, tipe, notNull }], pk, fk });
   `baris` = jumlah baris data per tabel. `target` = objek yang
   BOLEH dihapus ({ db: [nama], tabel: [{ db, nama }] }); semua
   objek lain wajib utuh. `kunci` berisi skrip contoh tiap editor;
   semuanya diuji otomatis terhadap simulator engine
   (tests/mpi-f-2.4-data.test.js).

   ATURAN: setiap pilihan punya `id` unik dan stabil. Urutan
   tampilnya DIACAK oleh app.js (initOrders) dan jawaban murid
   disimpan per id.
   ============================================================ */

/* soalPilih('q1', 'Tanya?', 'b', [['a', 'Label', 'Umpan'], …]) */
function soalPilih(id, tanya, correct, opsi) {
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o[0]] = o[2];
  });
  return {
    id: id,
    tanya: tanya,
    correct: correct,
    opsi: opsi.map(function (o) {
      return { id: o[0], label: o[1] };
    }),
    umpan: umpan,
  };
}

/* kol('nama', 'VARCHAR(50)', true) → kolom; true = NOT NULL. */
function kol(nama, tipe, wajib) {
  return { nama: nama, tipe: tipe, notNull: !!wajib };
}

/* tabel('nama', [kolom], ['pk'], [['kolom', 'tabelRujukan', 'kolomRujukan']]) */
function tabel(nama, kolom, pk, fk) {
  return {
    nama: nama,
    kolom: kolom,
    pk: pk,
    fk: (fk || []).map(function (f) {
      return { kolom: f[0], rujukTabel: f[1], rujukKolom: f[2] };
    }),
  };
}

/* ---------- Server Bank Sampah Sekolah ---------- */

var T_NASABAH = tabel(
  'nasabah',
  [
    kol('id_nasabah', 'INT', true),
    kol('nama_nasabah', 'VARCHAR(50)', true),
    kol('kelas', 'VARCHAR(10)', true),
    kol('no_wa', 'VARCHAR(15)'),
    kol('saldo', 'INT', true),
  ],
  ['id_nasabah']
);

var T_JENIS = tabel(
  'jenis_sampah',
  [
    kol('kode_jenis', 'CHAR(4)', true),
    kol('nama_jenis', 'VARCHAR(60)', true),
    kol('harga_per_kg', 'INT', true),
  ],
  ['kode_jenis']
);

var T_PETUGAS = tabel(
  'petugas',
  [kol('id_petugas', 'INT', true), kol('nama_petugas', 'VARCHAR(50)', true)],
  ['id_petugas']
);

var T_SETORAN = tabel(
  'setoran',
  [
    kol('no_setoran', 'INT', true),
    kol('tgl_setor', 'DATE', true),
    kol('id_nasabah', 'INT', true),
    kol('kode_jenis', 'CHAR(4)', true),
    kol('id_petugas', 'INT', true),
    kol('berat_kg', 'DECIMAL(5,2)', true),
  ],
  ['no_setoran'],
  [
    ['id_nasabah', 'nasabah', 'id_nasabah'],
    ['kode_jenis', 'jenis_sampah', 'kode_jenis'],
    ['id_petugas', 'petugas', 'id_petugas'],
  ]
);

/* Tabel inti: tabungan siswa — TIDAK BOLEH tersentuh. */
var INTI_BANK = [T_NASABAH, T_JENIS, T_PETUGAS, T_SETORAN];

/* Tabel sisa yang diminta dihapus pembina. */
var SISA_BANK = [
  tabel('setoran_impor_tmp', [kol('baris_ke', 'INT', true), kol('isi_csv', 'TEXT')], ['baris_ke']),
  tabel(
    'kuis_hadiah',
    [kol('id_hadiah', 'INT', true), kol('nama_hadiah', 'VARCHAR(40)', true)],
    ['id_hadiah']
  ),
  tabel(
    'pemenang_kuis',
    [
      kol('id_pemenang', 'INT', true),
      kol('id_nasabah', 'INT', true),
      kol('id_hadiah', 'INT', true),
    ],
    ['id_pemenang'],
    [
      ['id_nasabah', 'nasabah', 'id_nasabah'],
      ['id_hadiah', 'kuis_hadiah', 'id_hadiah'],
    ]
  ),
];

var T_PELANGGAN = tabel(
  'pelanggan',
  [
    kol('kode_plg', 'CHAR(3)', true),
    kol('nama_plg', 'VARCHAR(50)', true),
    kol('no_wa', 'VARCHAR(15)'),
  ],
  ['kode_plg']
);

var T_TEKNISI = tabel(
  'teknisi',
  [kol('kode_tek', 'CHAR(2)', true), kol('nama_tek', 'VARCHAR(50)', true)],
  ['kode_tek']
);

var T_SERVIS = tabel(
  'servis',
  [
    kol('no_servis', 'CHAR(3)', true),
    kol('tgl_masuk', 'DATE', true),
    kol('kode_plg', 'CHAR(3)', true),
    kol('kode_tek', 'CHAR(2)', true),
  ],
  ['no_servis'],
  [
    ['kode_plg', 'pelanggan', 'kode_plg'],
    ['kode_tek', 'teknisi', 'kode_tek'],
  ]
);

var TEFA_INTI = [T_PELANGGAN, T_TEKNISI, T_SERVIS];

/* Server awal: tiga basis data berisi data, bank_sampah aktif. */
var SERVER_BANK = {
  aktif: 'bank_sampah',
  db: [
    {
      nama: 'bank_sampah',
      ket: 'Basis data utama — tabungan siswa',
      struktur: INTI_BANK.concat(SISA_BANK),
      baris: {
        nasabah: 128,
        jenis_sampah: 9,
        petugas: 6,
        setoran: 1342,
        setoran_impor_tmp: 57,
        kuis_hadiah: 3,
        pemenang_kuis: 12,
      },
    },
    {
      nama: 'bank_sampah_uji',
      ket: 'Salinan latihan tim junior',
      struktur: INTI_BANK,
      baris: { nasabah: 5, jenis_sampah: 9, petugas: 2, setoran: 20 },
    },
    {
      nama: 'tefa_servis',
      ket: 'Milik kelas XI TJKT — jangan disentuh',
      struktur: TEFA_INTI,
      baris: { pelanggan: 150, teknisi: 5, servis: 214 },
    },
  ],
};

/* Objek yang diminta dihapus, per editor dan seluruhnya. */
var TARGET_TABEL = {
  db: [],
  tabel: [
    { db: 'bank_sampah', nama: 'setoran_impor_tmp' },
    { db: 'bank_sampah', nama: 'kuis_hadiah' },
    { db: 'bank_sampah', nama: 'pemenang_kuis' },
  ],
};
var TARGET_DB = { db: ['bank_sampah_uji'], tabel: [] };

/* ---------- Server evaluasi: Servis Laptop TEFA ---------- */

var SERVER_TEFA = {
  aktif: 'tefa_servis',
  db: [
    {
      nama: 'tefa_servis',
      ket: 'Basis data utama TEFA',
      struktur: TEFA_INTI.concat([
        tabel('servis_tmp', [kol('no', 'INT', true), kol('isi', 'TEXT')], ['no']),
        tabel(
          'promo',
          [kol('kode_promo', 'CHAR(4)', true), kol('potongan', 'INT', true)],
          ['kode_promo']
        ),
        tabel(
          'klaim_promo',
          [
            kol('no_klaim', 'INT', true),
            kol('kode_promo', 'CHAR(4)', true),
            kol('kode_plg', 'CHAR(3)', true),
          ],
          ['no_klaim'],
          [
            ['kode_promo', 'promo', 'kode_promo'],
            ['kode_plg', 'pelanggan', 'kode_plg'],
          ]
        ),
        tabel('log_uji', [kol('no', 'INT', true), kol('pesan', 'TEXT')], ['no']),
      ]),
      baris: {
        pelanggan: 150,
        teknisi: 5,
        servis: 214,
        servis_tmp: 40,
        promo: 4,
        klaim_promo: 25,
        log_uji: 300,
      },
    },
    {
      nama: 'tefa_servis_2023',
      ket: 'Arsip tahun lalu — sudah dicadangkan',
      struktur: TEFA_INTI,
      baris: { pelanggan: 98, teknisi: 4, servis: 160 },
    },
  ],
};

/* ---------- Skrip yang dianalisis murid ---------- */

var SKRIP_JUNIOR =
  '-- Skrip bersih-bersih Tim Junior (belum dijalankan di server asli)\n' +
  'SHOW DATABASES;\n' +
  'DROP TABLE IF EXISTS setoran_impor_tmp;\n' +
  '-- kosongkan data uji coba setoran\n' +
  'TRUNCATE TABLE setoran;\n' +
  'DROP TABLE pemenang_kuis, kuis_hadiah;\n' +
  '-- hapus database latihan\n' +
  'DROP DATABASE bank_sampah;';

var SKRIP_TIM_BIRU =
  '-- Pembersihan server Bank Sampah (Tim Biru)\n' +
  'DROP TABLE IF EXISTS setoran_impor_tmp, pemenang_kuis;\n' +
  'USE bank_sampah_uji;\n' +
  'DROP DATABASE IF EXISTS bank_sampah_uji;\n' +
  '-- sekalian, ini juga tidak kita pakai\n' +
  'DROP DATABASE IF EXISTS tefa_servis;';

var DATA = {
  meta: {
    judul: 'Menghapus Basis Data dan Tabel dengan DROP',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Problem Based Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Orientasi pada Masalah' },
    {
      id: 'masalah',
      label: 'Permintaan Pembersihan',
      sintaks: 'Sintaks 1 · Orientasi pada Masalah',
    },
    {
      id: 'organisasi',
      label: 'Bentuk Tim',
      sintaks: 'Sintaks 2 · Mengorganisasi Murid untuk Belajar',
    },
    { id: 'konsep', label: 'Bekal Sintaks', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'hapusTabel', label: 'Hapus Tabel', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    {
      id: 'hapusDb',
      label: 'Hapus Basis Data',
      sintaks: 'Sintaks 3 · Membimbing Penyelidikan',
    },
    {
      id: 'risiko',
      label: 'Analisis Risiko',
      sintaks: 'Sintaks 4 · Mengembangkan & Menyajikan Hasil Karya',
    },
    {
      id: 'sajikan',
      label: 'Sajikan Hasil',
      sintaks: 'Sintaks 4 · Mengembangkan & Menyajikan Hasil Karya',
    },
    {
      id: 'evaluasi',
      label: 'Evaluasi',
      sintaks: 'Sintaks 5 · Menganalisis & Mengevaluasi Pemecahan Masalah',
    },
    {
      id: 'refleksi',
      label: 'Refleksi',
      sintaks: 'Sintaks 5 · Menganalisis & Mengevaluasi Pemecahan Masalah',
    },
    { id: 'selesai', label: 'Selesai', sintaks: '' },
  ],

  server: SERVER_BANK,
  target: {
    hapusTabel: TARGET_TABEL,
    hapusDb: TARGET_DB,
    semua: { db: TARGET_DB.db, tabel: TARGET_TABEL.tabel },
  },
  serverTefa: SERVER_TEFA,

  /* Skrip contoh tiap editor — kunci guru & bahan tes otomatis.
     Murid boleh menulis versi lain (mis. IF EXISTS, beberapa tabel
     dalam satu DROP TABLE, perintah pengecekan) selama yang hilang
     TEPAT target dan basis data aktif tetap bank_sampah. */
  kunci: {
    hapusTabel:
      'DROP TABLE IF EXISTS setoran_impor_tmp;\n' +
      'DROP TABLE pemenang_kuis;\n' +
      'DROP TABLE kuis_hadiah;',
    hapusDb: 'SELECT DATABASE();\nDROP DATABASE IF EXISTS bank_sampah_uji;\nSHOW DATABASES;',
  },

  /* ==========================================================
     SINTAKS 1 — Orientasi pada masalah
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Server Penuh, Data Tabungan Jangan Sampai Hilang',
    goal: 'Mengetahui tujuan belajar, alur pemecahan masalah, dan cara memakai media ini.',
    guru: 'Kaitkan dengan MPI 2.1–2.3: kini murid belajar perintah DDL yang paling berisiko. Ceritakan singkat kasus nyata data hilang karena salah menjalankan DROP. Minta murid menjawab pemanasan tanpa dinilai — jawaban "langsung jalankan DROP" justru bahan diskusi yang bagus.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menghapus basis data dan tabel menggunakan perintah DROP DATABASE dan DROP TABLE secara tepat serta memahami konsekuensi dan risiko penggunaannya.',
    kriteria: [
      'Menentukan objek yang tepat untuk dihapus dan memeriksanya dulu dengan SHOW DATABASES, SELECT DATABASE(), dan SHOW TABLES.',
      'Menghapus tabel dengan DROP TABLE (termasuk IF EXISTS dan beberapa tabel sekaligus) dalam urutan yang benar terhadap kunci tamu: tabel anak sebelum induk.',
      'Menghapus basis data dengan DROP DATABASE dan menjelaskan akibatnya terhadap semua tabel di dalamnya serta basis data yang aktif.',
      'Menjelaskan konsekuensi DROP — struktur dan seluruh isi hilang permanen, tidak bisa di-ROLLBACK — dan membedakannya dari TRUNCATE, DELETE, dan DROP COLUMN.',
      'Menganalisis risiko skrip DROP, menerapkan kebiasaan aman (cadangan, cek target, uji di salinan), dan mengevaluasi skrip tim lain.',
    ],
    pengantar:
      'Akhir tahun ajaran, server DBMS sekolah hampir penuh. Di dalamnya ada basis data <strong>bank_sampah</strong> berisi tabungan 128 siswa, tetapi juga salinan latihan dan tabel-tabel sisa yang tidak terpakai. Pembina meminta server dibersihkan. Masalahnya: perintah <strong>DROP</strong> menghapus permanen — salah satu kata saja, tabungan siswa bisa lenyap.',
    alur: [
      { judul: 'Masalah', desk: 'Baca memo pembina, log insiden, dan isi server.' },
      { judul: 'Bentuk Tim', desk: 'Bagi peran dan susun rencana penghapusan yang aman.' },
      {
        judul: 'Bekal Sintaks',
        desk: 'Kenali DROP TABLE, DROP DATABASE, IF EXISTS, dan risikonya.',
      },
      { judul: 'Hapus Tabel', desk: 'Selidiki kunci tamu, lalu hapus tiga tabel sisa.' },
      { judul: 'Hapus Basis Data', desk: 'Selidiki basis data aktif, lalu hapus salinan latihan.' },
      {
        judul: 'Analisis Risiko',
        desk: 'Uji skrip tim junior di salinan server dan susun aturan aman.',
      },
      { judul: 'Sajikan Hasil', desk: 'Buktikan target terhapus dan data tabungan utuh.' },
      { judul: 'Evaluasi', desk: 'Terapkan pada Servis Laptop TEFA dan uji skrip Tim Biru.' },
    ],
    caraPakai: [
      'Server DBMS tiruan di media ini <strong>berisi beberapa basis data dan data</strong>. Setiap kartu menunjukkan tabel dan jumlah barisnya; basis data aktif bertanda <em>aktif</em>.',
      'Kamu <strong>mengetik skrip DROP sendiri</strong> di editor. Tekan <em>Jalankan &amp; periksa</em>: objek yang terhapus ditandai ➖, dan <strong>laporan dampak</strong> menghitung berapa baris data yang hilang.',
      'Semua dijalankan di salinan — server asli aman. Galat bukan kegagalan: baca pesan DBMS, perbaiki, lalu jalankan lagi. Petunjuk bertingkat tersedia bila buntu.',
      'Pertanyaan boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama. Kuis evaluasi hanya bisa dijawab sekali. Urutan pilihan diacak, dan tombol Reset mengacak ulang.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: kakak kelas memintamu "hapus saja database latihannya". Apa yang pertama kali kamu lakukan?',
      opsi: [
        { id: 'langsung', label: 'Langsung menjalankan DROP DATABASE sesuai nama yang diingat' },
        { id: 'cek', label: 'Melihat dulu daftar basis data dan isinya, baru menghapus' },
        { id: 'semua', label: 'Menghapus semua basis data supaya server benar-benar bersih' },
        { id: 'tolak', label: 'Menolak, karena menghapus basis data selalu dilarang' },
      ],
      umpan:
        'Simpan jawabanmu — tahap berikutnya memberi bukti. Ingat MPI 2.1: <strong>DROP</strong> termasuk DDL yang menghapus objek beserta seluruh isinya. Pertanyaannya bukan "boleh atau tidak", tetapi "bagaimana memastikan yang terhapus memang yang dimaksud".',
    },
  },

  masalah: {
    kicker: 'Tahap 2 · Orientasi pada Masalah',
    title: 'Permintaan Pembersihan Server',
    goal: 'Menemukan akar masalah dari memo pembina, log insiden, dan isi server, lalu merumuskan masalah.',
    guru: 'Bacakan memo Bu Rina. Minta tim menunjuk di panel server: mana yang boleh dihapus, mana yang tidak boleh disentuh. Bahas dua insiden tim junior: yang pertama ditolak DBMS, yang kedua gagal karena salah ketik — keduanya "beruntung". Tanyakan: bagaimana jika salah ketiknya justru menunjuk basis data utama? Rumusan masalah tidak dinilai otomatis.',
    kutipan:
      '"Server sekolah sudah hampir penuh. Tolong hapus database latihan bank_sampah_uji, tabel sisa impor setoran yang gagal kemarin, dan dua tabel kuis yang lombanya sudah selesai. Tapi ingat, tabungan anak-anak dan database TEFA milik kelas sebelah jangan sampai tersentuh sedikit pun!" — Bu Rina, pembina Bank Sampah',
    logJudul: 'Log insiden server',
    log: [
      "[Sen 07:10] junior> DROP TABLE nasabah;  -- ERROR 3730: Cannot drop table 'nasabah' referenced by a foreign key constraint",
      "[Sen 07:12] junior> DROP DATABASE bank_sampah_ujii;  -- ERROR 1008: Can't drop database 'bank_sampah_ujii'; database doesn't exist",
      '[Sen 07:30] PERINGATAN: penyimpanan server 92% terpakai',
      '[Sel 09:05] Impor CSV setoran gagal di tengah jalan — tabel setoran_impor_tmp tertinggal (57 baris)',
      '[Sel 09:20] Lomba kuis Hari Bumi selesai — tabel kuis_hadiah & pemenang_kuis tidak dipakai lagi',
    ],
    serverJudul: 'Isi server DBMS saat ini',
    akar: {
      tanya:
        'Berdasarkan memo, log insiden, dan panel server, pilih SEMUA pernyataan yang tepat tentang masalahnya.',
      opsi: [
        {
          id: 'pilih',
          label:
            'Hanya objek tertentu yang boleh dihapus; data tabungan di bank_sampah dan basis data tefa_servis harus tetap utuh',
          benar: true,
          alasan:
            'Memo menyebut tiga tabel sisa dan satu basis data latihan. Selebihnya — 1.342 setoran, 128 nasabah, dan seluruh tefa_servis — tidak boleh tersentuh.',
        },
        {
          id: 'permanen',
          label: 'DROP menghapus struktur beserta seluruh isinya dan tidak bisa dibatalkan',
          benar: true,
          alasan:
            'Perintah DDL langsung tersimpan permanen. Tanpa cadangan, data yang terhapus tidak bisa dikembalikan.',
        },
        {
          id: 'urutan',
          label:
            'Beberapa tabel saling terhubung lewat kunci tamu, jadi urutan penghapusannya penting',
          benar: true,
          alasan:
            'Insiden pertama: nasabah ditolak dihapus karena dirujuk kunci tamu. pemenang_kuis juga merujuk kuis_hadiah.',
        },
        {
          id: 'ulang',
          label: 'Paling cepat: DROP DATABASE bank_sampah lalu buat ulang yang bersih',
          benar: false,
          alasan:
            'Struktur bisa dibuat ulang, tetapi 1.342 setoran dan saldo 128 siswa ikut lenyap — basis data baru selalu kosong.',
        },
        {
          id: 'delete',
          label: 'Cukup DELETE FROM pada tabel sisa agar tabelnya ikut hilang dari server',
          benar: false,
          alasan:
            'DELETE (DML) hanya menghapus baris. Tabelnya tetap ada di server; untuk membuang tabel pakai DROP TABLE.',
        },
        {
          id: 'aman',
          label: 'Salah ketik nama tidak berbahaya karena DBMS selalu menolaknya',
          benar: false,
          alasan:
            'DBMS hanya menolak nama yang tidak ada. Salah ketik yang kebetulan cocok dengan basis data lain akan dijalankan tanpa bertanya.',
        },
      ],
      done: '<strong>Akar masalah ditemukan:</strong> server harus dibersihkan dengan DROP, tetapi hanya objek yang tepat — dalam urutan yang benar — sementara data tabungan dan basis data milik kelas lain wajib utuh.',
    },
    rumusan: {
      label: 'Rumusan masalah tim',
      petunjuk:
        'Tulis rumusan masalah dalam bentuk pertanyaan yang memuat kata "menghapus", "tepat", dan "data".',
      placeholder:
        'Contoh: Bagaimana menghapus basis data latihan dan tabel sisa di server dengan tepat tanpa menghilangkan data tabungan siswa?',
      min: 40,
    },
  },

  /* ==========================================================
     SINTAKS 2 — Mengorganisasi murid untuk belajar
     ========================================================== */
  organisasi: {
    kicker: 'Tahap 3 · Mengorganisasi Belajar',
    title: 'Bentuk Tim Pembersih Server',
    goal: 'Membagi peran tim dan menyusun rencana langkah menghapus basis data dan tabel dengan aman.',
    guru: 'Bentuk tim berempat. Analis Dampak membuat daftar target di kertas dan mencentangnya; Penulis Skrip mengetik; Penguji wajib membacakan basis data aktif dan jumlah baris sebelum dan sesudah setiap skrip. Tekankan prinsip "empat mata": skrip DROP dibaca ulang orang kedua sebelum dijalankan.',
    peran: [
      {
        id: 'analis',
        ikon: '🧭',
        label: 'Analis Dampak',
        tugas:
          'Mendaftar objek yang boleh dihapus dan yang wajib utuh, serta memeriksa kunci tamu.',
      },
      {
        id: 'penulis',
        ikon: '⌨️',
        label: 'Penulis Skrip',
        tugas: 'Mengetik perintah DROP di editor sesuai daftar target, dalam urutan yang benar.',
      },
      {
        id: 'penguji',
        ikon: '🔍',
        label: 'Penguji (DBA)',
        tugas:
          'Membaca ulang skrip, menjalankannya di salinan, dan memastikan tidak ada data lain yang hilang.',
      },
      {
        id: 'jubir',
        ikon: '📣',
        label: 'Juru Bicara',
        tugas: 'Mencatat bukti sebelum–sesudah dan laporan dampak, lalu menyajikannya ke pembina.',
      },
    ],
    rencana: {
      pengantar:
        'Susun rencana kerja tim. Ketuk kartu sesuai urutan yang paling aman untuk menghapus objek di server yang berisi data penting.',
      items: [
        { id: 'r1', label: 'Daftar objek yang diminta dihapus dan yang wajib utuh' },
        { id: 'r2', label: 'Cek isi server dan rujukan kunci tamu antartabel' },
        { id: 'r3', label: 'Cadangkan (backup) basis data sebelum menghapus' },
        { id: 'r4', label: 'Jalankan DROP sesuai daftar: tabel anak sebelum induk' },
        { id: 'r5', label: 'Verifikasi: target hilang, data tabungan tetap utuh' },
        { id: 'r6', label: 'Laporkan hasil dan bukti ke pembina' },
      ],
      sukses:
        '<strong>Rencana tim siap!</strong> Tahu dulu apa yang dihapus, periksa hubungannya, amankan cadangan, baru jalankan DROP — lalu buktikan hasilnya.',
      salah:
        'Ingat: kamu tidak bisa menghapus sebelum tahu targetnya, dan cadangan harus dibuat <em>sebelum</em> DROP — setelahnya sudah terlambat.',
    },
  },

  /* ==========================================================
     SINTAKS 3 — Membimbing penyelidikan
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Membimbing Penyelidikan',
    title: 'Bekal Sintaks: Keluarga DROP',
    goal: 'Mengenali bentuk DROP TABLE dan DROP DATABASE, perintah pengecekan, serta dampaknya dibandingkan TRUNCATE, DELETE, dan DROP COLUMN.',
    guru: 'Minta Analis Dampak membuka kartu sintaks dan menjelaskannya dengan kata-kata sendiri. Pada pemilahan dampak, tanyakan "Apa yang tersisa setelah perintah ini?" — tabel kosong (TRUNCATE), tidak ada apa-apa (DROP), atau semuanya tetap karena ditolak/dilewati.',
    pengantar:
      'Semua contoh di kartu bisa dijalankan di server Bank Sampah. Buka kartunya, lalu latih memilih perintah yang tepat dan memperkirakan dampaknya.',
    kartu: [
      {
        ikon: '▦',
        istilah: 'DROP TABLE',
        def: 'Menghapus satu tabel: strukturnya DAN seluruh barisnya. Tabelnya benar-benar hilang dari basis data aktif.',
        contoh: 'DROP TABLE setoran_impor_tmp;',
      },
      {
        ikon: '❓',
        istilah: 'IF EXISTS',
        def: 'Bila objeknya tidak ada, perintah dilewati tanpa galat — berguna di skrip. IF EXISTS TIDAK membuat DROP bisa dibatalkan.',
        contoh: 'DROP TABLE IF EXISTS arsip_2019;',
      },
      {
        ikon: '🧩',
        istilah: 'Beberapa tabel',
        def: 'Beberapa tabel boleh dihapus dalam satu DROP TABLE, dipisah koma. Bila satu ditolak, tidak ada yang terhapus.',
        contoh: 'DROP TABLE pemenang_kuis, kuis_hadiah;',
      },
      {
        ikon: '🔗',
        istilah: 'Anak sebelum induk',
        def: 'Tabel yang masih dirujuk kunci tamu (induk) ditolak dihapus. Hapus dulu tabel yang merujuknya (anak).',
        contoh: 'DROP TABLE pemenang_kuis;\nDROP TABLE kuis_hadiah;',
      },
      {
        ikon: '🗄️',
        istilah: 'DROP DATABASE',
        def: 'Menghapus basis data beserta SEMUA tabel dan datanya sekaligus. Perintah DDL paling berisiko.',
        contoh: 'DROP DATABASE bank_sampah_uji;',
      },
      {
        ikon: '🔎',
        istilah: 'Cek dulu',
        def: 'SHOW DATABASES menampilkan daftar basis data, SELECT DATABASE() menampilkan basis data aktif, SHOW TABLES menampilkan tabelnya. DROP TABLE selalu bekerja di basis data AKTIF.',
        contoh: 'SHOW DATABASES;\nSELECT DATABASE();\nSHOW TABLES;',
      },
      {
        ikon: '💾',
        istilah: 'Permanen',
        def: 'DROP tidak masuk "recycle bin" dan tidak bisa di-ROLLBACK: perintah DDL langsung tersimpan permanen. Satu-satunya jalan kembali adalah cadangan yang dibuat SEBELUMNYA.',
        contoh:
          '-- di terminal, SEBELUM menghapus:\n-- mysqldump bank_sampah > cadangan.sql\nSHOW TABLES;',
      },
      {
        ikon: '🧹',
        istilah: 'Bukan DROP',
        def: 'TRUNCATE TABLE mengosongkan semua baris tetapi tabelnya tetap. DELETE FROM (DML) menghapus baris tertentu. ALTER TABLE … DROP COLUMN hanya membuang satu kolom.',
        contoh: 'TRUNCATE TABLE setoran_impor_tmp;',
      },
    ],
    aksi: {
      pengantar: 'Perintah apa yang paling tepat untuk setiap permintaan berikut?',
      kategori: [
        { id: 'dropDb', label: 'DROP DATABASE' },
        { id: 'dropTabel', label: 'DROP TABLE' },
        { id: 'truncate', label: 'TRUNCATE TABLE' },
        { id: 'dropKolom', label: 'ALTER TABLE … DROP COLUMN' },
      ],
      items: [
        {
          id: 'a1',
          teks: 'Salinan latihan bank_sampah_uji beserta semua tabelnya tidak dipakai lagi',
          correct: 'dropDb',
          explanation: 'Seluruh basis data dibuang → DROP DATABASE.',
        },
        {
          id: 'a2',
          teks: 'Tabel setoran_impor_tmp sisa impor yang gagal harus dibuang dari server',
          correct: 'dropTabel',
          explanation: 'Tabelnya sendiri tidak dibutuhkan lagi → DROP TABLE.',
        },
        {
          id: 'a3',
          teks: 'Tabel log_harian tetap dipakai aplikasi, tetapi isinya ingin dikosongkan',
          correct: 'truncate',
          explanation: 'Struktur dipertahankan, hanya isi yang dibuang → TRUNCATE TABLE.',
        },
        {
          id: 'a4',
          teks: 'Kolom no_fax di tabel pelanggan tidak dipakai lagi',
          correct: 'dropKolom',
          explanation: 'Hanya satu kolom, tabelnya tetap → ALTER TABLE … DROP COLUMN (MPI 2.3).',
        },
        {
          id: 'a5',
          teks: 'Arsip lomba kuis_hadiah dan pemenang_kuis dibuang karena lombanya selesai',
          correct: 'dropTabel',
          explanation: 'Dua tabel dibuang, basis data utamanya tetap → DROP TABLE (anak dulu).',
        },
        {
          id: 'a6',
          teks: 'Basis data arsip tefa_servis_2023 sudah dicadangkan dan boleh dibuang',
          correct: 'dropDb',
          explanation: 'Satu basis data utuh yang sudah dicadangkan → DROP DATABASE.',
        },
        {
          id: 'a7',
          teks: 'Data uji coba di tabel servis_uji dibuang, tetapi tabelnya dipakai lagi minggu depan',
          correct: 'truncate',
          explanation: 'Tabelnya masih dibutuhkan → kosongkan isinya saja dengan TRUNCATE.',
        },
      ],
    },
    dampak: {
      pengantar:
        'Server Bank Sampah berisi data. Apa yang terjadi bila perintah berikut dijalankan pada basis data aktif bank_sampah?',
      kategori: [
        { id: 'semua', label: 'Struktur & seluruh isi hilang' },
        { id: 'isi', label: 'Isi hilang, struktur tetap' },
        { id: 'ditolak', label: 'Ditolak DBMS, tidak ada yang hilang' },
        { id: 'aman', label: 'Dilewati / tidak mengubah apa pun' },
      ],
      items: [
        {
          id: 'd1',
          teks: 'DROP TABLE setoran_impor_tmp;',
          sql: 'DROP TABLE setoran_impor_tmp;',
          correct: 'semua',
          explanation: 'Tabel dan 57 barisnya hilang dari server.',
        },
        {
          id: 'd2',
          teks: 'TRUNCATE TABLE setoran_impor_tmp;',
          sql: 'TRUNCATE TABLE setoran_impor_tmp;',
          correct: 'isi',
          explanation: '57 baris hilang, tetapi tabel kosongnya tetap ada.',
        },
        {
          id: 'd3',
          teks: 'DROP TABLE nasabah;',
          sql: 'DROP TABLE nasabah;',
          correct: 'ditolak',
          explanation: 'nasabah masih dirujuk kunci tamu setoran — DBMS melindunginya.',
        },
        {
          id: 'd4',
          teks: 'DROP TABLE IF EXISTS arsip_2019;',
          sql: 'DROP TABLE IF EXISTS arsip_2019;',
          correct: 'aman',
          explanation:
            'Tabel arsip_2019 tidak ada; berkat IF EXISTS perintah dilewati tanpa galat.',
        },
        {
          id: 'd5',
          teks: 'DROP DATABASE bank_sampah_uji;',
          sql: 'DROP DATABASE bank_sampah_uji;',
          correct: 'semua',
          explanation: 'Basis data latihan beserta 4 tabel dan 36 barisnya hilang.',
        },
        {
          id: 'd6',
          teks: 'DROP TABLE kuis_hadiah;',
          sql: 'DROP TABLE kuis_hadiah;',
          correct: 'ditolak',
          explanation: 'kuis_hadiah masih dirujuk pemenang_kuis. Hapus anaknya dulu.',
        },
        {
          id: 'd7',
          teks: 'SHOW TABLES;',
          sql: 'SHOW TABLES;',
          correct: 'aman',
          explanation: 'Hanya menampilkan daftar tabel — tidak mengubah apa pun.',
        },
      ],
    },
    pertanyaan: [
      soalPilih(
        'k1',
        'Perintah yang benar untuk menghapus tabel <code>setoran_impor_tmp</code> adalah …',
        'b',
        [
          [
            'a',
            '<code>DELETE TABLE setoran_impor_tmp;</code>',
            'Tidak ada perintah DELETE TABLE. DELETE FROM menghapus baris, bukan tabel.',
          ],
          [
            'b',
            '<code>DROP TABLE setoran_impor_tmp;</code>',
            'Tepat: DROP TABLE lalu nama tabel, diakhiri titik koma.',
          ],
          [
            'c',
            '<code>DROP setoran_impor_tmp;</code>',
            'Jenis objeknya (TABLE atau DATABASE) wajib ditulis.',
          ],
          [
            'd',
            '<code>ALTER TABLE setoran_impor_tmp DROP;</code>',
            'ALTER TABLE … DROP dipakai untuk membuang kolom, bukan tabel.',
          ],
        ]
      ),
      soalPilih(
        'k2',
        'Setelah <code>DROP TABLE</code> yang keliru, temanmu mengetik <code>ROLLBACK;</code>. Apa hasilnya?',
        'c',
        [
          [
            'a',
            'Tabel kembali lengkap dengan isinya',
            'DROP adalah DDL yang langsung tersimpan permanen; ROLLBACK tidak menjangkaunya.',
          ],
          [
            'b',
            'Strukturnya kembali, isinya kosong',
            'Tidak ada yang kembali; membuat ulang struktur pun harus dengan CREATE TABLE.',
          ],
          [
            'c',
            'Tidak ada yang kembali — hanya cadangan yang bisa memulihkannya',
            'Tepat: itulah sebabnya cadangan dibuat SEBELUM menjalankan DROP.',
          ],
          [
            'd',
            'Basis data ikut terhapus',
            'ROLLBACK tidak menghapus apa pun; ia membatalkan transaksi DML yang belum di-COMMIT.',
          ],
        ]
      ),
      soalPilih(
        'k3',
        'Apa fungsi <code>IF EXISTS</code> pada <code>DROP TABLE IF EXISTS arsip_2019;</code>?',
        'a',
        [
          [
            'a',
            'Bila tabelnya tidak ada, perintah dilewati tanpa galat',
            'Tepat: skrip tetap berjalan ke perintah berikutnya.',
          ],
          [
            'b',
            'Tabel hanya dihapus bila isinya kosong',
            'IF EXISTS tidak memeriksa isi; tabel berisi pun tetap terhapus.',
          ],
          [
            'c',
            'Membuat penghapusan bisa dibatalkan',
            'IF EXISTS tidak memberi jalan kembali sama sekali.',
          ],
          [
            'd',
            'Menghapus tabel di semua basis data yang punya nama itu',
            'DROP TABLE hanya bekerja pada basis data aktif.',
          ],
        ]
      ),
    ],
  },

  hapusTabel: {
    kicker: 'Tahap 5 · Membimbing Penyelidikan',
    title: 'Menghapus Tabel dengan DROP TABLE',
    goal: 'Menyelidiki perilaku DROP TABLE terhadap kunci tamu dan IF EXISTS, lalu menghapus tiga tabel sisa sendiri.',
    guru: 'Biarkan tim menjalankan konsol langkah demi langkah. Setelah setiap langkah, Penguji membacakan pesan DBMS dan menunjuk perubahan di panel server. Pancing dengan pertanyaan: "Mengapa DBMS menolak langkah 2, padahal kita tidak salah ketik?"',
    pengantar:
      'Konsol berisi basis data <code>latihan</code>: tabel <code>kelas</code> (induk), <code>siswa</code> (anak, merujuk kelas), dan <code>log_lama</code>. Jalankan langkahnya dan amati: kapan DROP TABLE diterima, ditolak, atau dilewati?',
    lab: {
      aktif: 'latihan',
      db: [
        {
          nama: 'latihan',
          struktur: [
            tabel(
              'kelas',
              [kol('id_kelas', 'INT', true), kol('nama_kelas', 'VARCHAR(20)', true)],
              ['id_kelas']
            ),
            tabel(
              'siswa',
              [
                kol('nis', 'CHAR(5)', true),
                kol('nama', 'VARCHAR(40)', true),
                kol('id_kelas', 'INT', true),
              ],
              ['nis'],
              [['id_kelas', 'kelas', 'id_kelas']]
            ),
            tabel('log_lama', [kol('no', 'INT', true), kol('pesan', 'TEXT')], ['no']),
          ],
          baris: { kelas: 3, siswa: 30, log_lama: 100 },
        },
      ],
    },
    langkah: [
      {
        id: 't1',
        sql: 'SHOW TABLES;',
        amati: 'Catat dulu: tabel apa saja yang ada, dan berapa barisnya?',
      },
      {
        id: 't2',
        sql: 'DROP TABLE kelas;',
        amati: 'Ditolak! Siapa yang masih bergantung pada tabel kelas?',
      },
      {
        id: 't3',
        sql: 'DROP TABLE siswa;\nDROP TABLE kelas;',
        amati: 'Anak dulu, baru induk — keduanya terhapus. Ke mana 30 data siswa?',
      },
      {
        id: 't4',
        sql: 'DROP TABLE log_lama;',
        amati: 'Tabel tanpa hubungan kunci tamu langsung terhapus.',
      },
      {
        id: 't5',
        sql: 'DROP TABLE log_lama;',
        amati: 'Dijalankan sekali lagi — mengapa sekarang galat?',
      },
      {
        id: 't6',
        sql: 'DROP TABLE IF EXISTS log_lama;',
        amati: 'Sama-sama tabel yang sudah tidak ada, tetapi kali ini tidak galat.',
      },
    ],
    pertanyaan: [
      soalPilih('ht1', 'Langkah 2 ditolak karena …', 'c', [
        ['a', 'Nama tabel kelas salah ketik', 'Tabel kelas ada (lihat SHOW TABLES di langkah 1).'],
        [
          'b',
          'Tabel yang berisi data tidak bisa dihapus',
          'log_lama berisi 100 baris dan tetap terhapus.',
        ],
        [
          'c',
          'Tabel kelas masih dirujuk kunci tamu tabel siswa',
          'Tepat: DBMS melindungi induk selama masih ada anak yang merujuknya.',
        ],
        [
          'd',
          'DROP TABLE harus memakai IF EXISTS',
          'IF EXISTS hanya berpengaruh bila tabelnya tidak ada.',
        ],
      ]),
      soalPilih('ht2', 'Setelah langkah 3, bagaimana nasib 30 data siswa?', 'b', [
        ['a', 'Pindah ke tabel kelas', 'Data tidak pernah dipindahkan oleh DROP.'],
        [
          'b',
          'Hilang permanen bersama tabelnya',
          'Tepat: DROP TABLE membuang struktur dan seluruh barisnya.',
        ],
        [
          'c',
          'Masih ada, hanya tabelnya disembunyikan',
          'Tidak ada fitur sembunyi; tabelnya benar-benar hilang.',
        ],
        ['d', 'Bisa dikembalikan dengan ROLLBACK', 'DDL langsung tersimpan permanen.'],
      ]),
      soalPilih('ht3', 'Apa beda hasil langkah 5 dan langkah 6?', 'd', [
        ['a', 'Langkah 6 membuat ulang tabel log_lama', 'DROP tidak pernah membuat tabel.'],
        [
          'b',
          'Langkah 5 menghapus data, langkah 6 menghapus struktur',
          'Tabelnya sudah tidak ada sejak langkah 4.',
        ],
        ['c', 'Tidak ada bedanya', 'Langkah 5 galat dan menghentikan skrip; langkah 6 tidak.'],
        [
          'd',
          'Langkah 5 galat karena tabelnya tidak ada; IF EXISTS di langkah 6 membuatnya dilewati',
          'Tepat: di skrip panjang, IF EXISTS mencegah satu galat menghentikan perintah sesudahnya.',
        ],
      ]),
    ],
    editor: {
      judul: '✍️ Giliranmu: hapus tiga tabel sisa',
      tugas:
        'Basis data <code>bank_sampah</code> sudah aktif. Hapus tabel <code>setoran_impor_tmp</code>, <code>pemenang_kuis</code>, dan <code>kuis_hadiah</code>. Perhatikan panel server: tabel mana yang merujuk tabel lain? Tabel inti (nasabah, setoran, jenis_sampah, petugas) dan basis data lain harus tetap utuh.',
      label: 'Skrip menghapus tabel sisa',
      placeholder: 'DROP TABLE …;',
      kerangka:
        '-- 1) tabel sisa impor setoran\n\n-- 2) arsip lomba: tabel anak (yang merujuk) dulu, baru induknya\n\n',
      petunjuk: [
        'Lihat panel server: <code>pemenang_kuis</code> punya kunci tamu ke <code>kuis_hadiah</code>. Jadi pemenang_kuis adalah anak, kuis_hadiah induknya.',
        'Pola: <code>DROP TABLE nama_tabel;</code> — satu pernyataan per tabel, atau beberapa tabel dipisah koma.',
        'Urutan aman: <code>DROP TABLE setoran_impor_tmp;</code> lalu <code>DROP TABLE pemenang_kuis;</code> lalu <code>DROP TABLE kuis_hadiah;</code>',
      ],
      sukses:
        '<strong>Tiga tabel sisa terhapus!</strong> Tabel inti tetap utuh: 128 nasabah dan 1.342 setoran tidak tersentuh.',
    },
  },

  hapusDb: {
    kicker: 'Tahap 6 · Membimbing Penyelidikan',
    title: 'Menghapus Basis Data dengan DROP DATABASE',
    goal: 'Menyelidiki akibat DROP DATABASE terhadap tabel di dalamnya dan basis data aktif, lalu menghapus salinan latihan sendiri.',
    guru: 'Langkah 3–4 konsol sengaja menunjukkan jebakan: setelah basis data aktif dihapus, tidak ada lagi basis data yang dipilih. Minta Penguji membacakan hasil SELECT DATABASE() sebelum dan sesudah. Tegaskan: sebelum DROP DATABASE, baca namanya huruf demi huruf — insiden "bank_sampah_ujii" di log adalah contohnya.',
    pengantar:
      'Konsol berisi dua basis data: <code>latihan</code> (aktif) dan salinannya <code>latihan_uji</code>. Jalankan langkahnya dan perhatikan label <em>aktif</em> di panel server.',
    lab: {
      aktif: 'latihan',
      db: [
        {
          nama: 'latihan',
          struktur: [
            tabel(
              'siswa',
              [kol('nis', 'CHAR(5)', true), kol('nama', 'VARCHAR(40)', true)],
              ['nis']
            ),
          ],
          baris: { siswa: 30 },
        },
        {
          nama: 'latihan_uji',
          struktur: [
            tabel(
              'siswa',
              [kol('nis', 'CHAR(5)', true), kol('nama', 'VARCHAR(40)', true)],
              ['nis']
            ),
            tabel('nilai', [kol('nis', 'CHAR(5)', true), kol('skor', 'INT', true)], ['nis']),
          ],
          baris: { siswa: 8, nilai: 8 },
        },
      ],
    },
    langkah: [
      {
        id: 'b1',
        sql: 'SHOW DATABASES;',
        amati: 'Ada dua basis data dengan nama yang mirip. Mana yang aktif?',
      },
      {
        id: 'b2',
        sql: 'USE latihan_uji;\nSELECT DATABASE();',
        amati: 'Basis data aktif berpindah ke latihan_uji.',
      },
      {
        id: 'b3',
        sql: 'DROP DATABASE latihan_uji;',
        amati: 'Berapa tabel dan baris yang ikut hilang? Lihat juga label aktif di panel.',
      },
      {
        id: 'b4',
        sql: 'CREATE TABLE coba (id INT);',
        amati: 'Ditolak! Mengapa DBMS tidak tahu harus membuat tabel di mana?',
      },
      {
        id: 'b5',
        sql: 'USE latihan;\nSELECT DATABASE();',
        amati: 'Pilih kembali basis data yang benar sebelum melanjutkan pekerjaan.',
      },
      {
        id: 'b6',
        sql: 'DROP DATABASE latihan_uji;',
        amati:
          'Basis data yang sudah tidak ada tidak bisa dihapus lagi — kecuali dengan IF EXISTS.',
      },
    ],
    pertanyaan: [
      soalPilih('hd1', 'Mengapa <code>CREATE TABLE</code> di langkah 4 ditolak?', 'a', [
        [
          'a',
          'Basis data aktif ikut terhapus, jadi belum ada basis data yang dipilih',
          'Tepat: setelah DROP DATABASE pada basis data aktif, pilih lagi dengan USE.',
        ],
        ['b', 'Nama tabel coba sudah ada', 'Tabel coba belum pernah dibuat.'],
        ['c', 'Tipe INT tidak boleh dipakai', 'INT tipe yang sah.'],
        [
          'd',
          'Server terkunci setelah DROP DATABASE',
          'Server tetap berjalan; yang hilang hanya pilihan basis data aktif.',
        ],
      ]),
      soalPilih(
        'hd2',
        'Mengapa <code>SELECT DATABASE()</code> penting dijalankan sebelum <code>DROP TABLE</code>?',
        'c',
        [
          [
            'a',
            'Agar DROP TABLE bisa dibatalkan',
            'Tidak ada perintah yang membuat DROP bisa dibatalkan.',
          ],
          [
            'b',
            'Karena DROP TABLE wajib diawali SELECT',
            'DROP TABLE berdiri sendiri; SELECT DATABASE() hanya pengecekan.',
          ],
          [
            'c',
            'DROP TABLE bekerja di basis data aktif — tabel bernama sama bisa ada di basis data lain',
            'Tepat: bank_sampah dan bank_sampah_uji sama-sama punya tabel setoran.',
          ],
          [
            'd',
            'Untuk mencadangkan basis data',
            'SELECT DATABASE() hanya menampilkan nama basis data aktif.',
          ],
        ]
      ),
      soalPilih('hd3', 'Langkah 3 <code>DROP DATABASE latihan_uji;</code> menghapus …', 'b', [
        ['a', 'Hanya tabel yang kosong di latihan_uji', 'Tabel berisi pun ikut terhapus.'],
        [
          'b',
          'Basis data latihan_uji beserta semua tabel dan datanya; latihan tidak tersentuh',
          'Tepat: lihat panel — latihan tetap punya 30 siswa.',
        ],
        [
          'c',
          'Semua basis data yang namanya diawali "latihan"',
          'DROP DATABASE hanya menghapus satu nama yang ditulis persis.',
        ],
        ['d', 'Hanya namanya; tabelnya pindah ke latihan', 'Tidak ada tabel yang dipindahkan.'],
      ]),
    ],
    editor: {
      judul: '✍️ Giliranmu: hapus basis data latihan',
      tugas:
        'Hapus basis data <code>bank_sampah_uji</code> — dan HANYA itu. Di akhir skrip, basis data aktif harus tetap <code>bank_sampah</code>. Skema awal = server setelah skrip hapus tabelmu.',
      label: 'Skrip menghapus basis data latihan',
      placeholder: 'DROP DATABASE …;',
      kerangka:
        '-- 1) cek dulu basis data yang ada dan yang aktif\n\n-- 2) hapus basis data latihan saja (baca namanya dua kali!)\n\n',
      petunjuk: [
        'Yang dihapus basis data latihan <code>bank_sampah_uji</code> — bukan <code>bank_sampah</code> dan bukan <code>tefa_servis</code>.',
        'Pola: <code>DROP DATABASE [IF EXISTS] nama_basis_data;</code> Tidak perlu USE dulu; bila kamu memakai USE, kembalikan dengan <code>USE bank_sampah;</code>.',
        'Contoh: <code>SELECT DATABASE();</code> lalu <code>DROP DATABASE IF EXISTS bank_sampah_uji;</code>',
      ],
      sukses:
        '<strong>Basis data latihan terhapus!</strong> bank_sampah tetap aktif dan utuh, tefa_servis tidak tersentuh.',
    },
  },

  /* ==========================================================
     SINTAKS 4 — Mengembangkan & menyajikan hasil karya
     ========================================================== */
  risiko: {
    kicker: 'Tahap 7 · Mengembangkan Hasil Karya',
    title: 'Analisis Risiko Skrip Tim Junior',
    goal: 'Menguji skrip DROP orang lain di salinan server, membaca laporan dampaknya, dan menyusun aturan aman sebelum menjalankan DROP.',
    guru: 'Ini inti pembelajaran mendalam tentang risiko. Minta tim menebak dulu dampaknya sebelum menekan tombol jalankan, lalu membandingkan tebakan dengan laporan dampak. Tekankan: skrip ini berjalan TANPA GALAT — DBMS tidak pernah bertanya "yakin?". Aturan aman yang dipilih menjadi checklist tim untuk sisa pertemuan.',
    pengantar:
      'Tim junior menulis skrip bersih-bersih berikut dan hampir menjalankannya di server asli. Untungnya Penguji tim kalian memintanya diuji dulu di <strong>salinan server</strong>.',
    skrip: SKRIP_JUNIOR,
    analisis: {
      tanya: 'Baca laporan dampaknya. Pilih SEMUA masalah dalam skrip tim junior.',
      opsi: [
        {
          id: 'salahDb',
          label:
            '<code>DROP DATABASE bank_sampah;</code> menghapus basis data utama, bukan salinan latihan bank_sampah_uji',
          benar: true,
          alasan:
            'Komentarnya "hapus database latihan", tetapi namanya kurang "_uji". Semua tabungan siswa ikut lenyap.',
        },
        {
          id: 'truncate',
          label:
            '<code>TRUNCATE TABLE setoran;</code> mengosongkan setoran ASLI karena basis data aktifnya bank_sampah',
          benar: true,
          alasan:
            'Perintah tanpa nama basis data bekerja di basis data aktif. Data uji coba ada di bank_sampah_uji, bukan di sini.',
        },
        {
          id: 'cadangan',
          label: 'Tidak ada cadangan dan pengecekan basis data aktif sebelum perintah berbahaya',
          benar: true,
          alasan:
            'SHOW DATABASES dijalankan, tetapi SELECT DATABASE() tidak, dan tidak ada cadangan — kesalahan tidak bisa dipulihkan.',
        },
        {
          id: 'gabung',
          label:
            '<code>DROP TABLE pemenang_kuis, kuis_hadiah;</code> ditolak karena dua tabel tidak boleh digabung',
          benar: false,
          alasan:
            'Beberapa tabel boleh dihapus dalam satu DROP TABLE; anak dan induknya terhapus bersama tanpa galat.',
        },
        {
          id: 'ifexists',
          label: '<code>IF EXISTS</code> pada setoran_impor_tmp membuat skrip berbahaya',
          benar: false,
          alasan: 'IF EXISTS hanya melewati tabel yang tidak ada. Masalahnya ada di perintah lain.',
        },
        {
          id: 'show',
          label: '<code>SHOW DATABASES;</code> ikut menghapus daftar basis data',
          benar: false,
          alasan: 'SHOW hanya menampilkan; tidak mengubah apa pun.',
        },
      ],
      done: '<strong>Analisis tajam!</strong> Skrip berjalan tanpa galat, tetapi menghapus objek yang salah. DBMS menjalankan perintah apa adanya — pengamannya ada pada kita.',
    },
    aturan: {
      tanya:
        'Susun checklist tim. Pilih SEMUA kebiasaan yang mencegah bencana seperti skrip tim junior.',
      opsi: [
        {
          id: 'backup',
          label: 'Mencadangkan basis data (mis. mysqldump) sebelum menjalankan DROP',
          benar: true,
          alasan: 'Cadangan adalah satu-satunya jalan kembali setelah DROP.',
        },
        {
          id: 'cek',
          label: 'Memeriksa target dengan SHOW DATABASES, SELECT DATABASE(), dan SHOW TABLES',
          benar: true,
          alasan: 'Memastikan nama dan basis data aktif sebelum perintah dijalankan.',
        },
        {
          id: 'salinan',
          label: 'Menguji skrip di salinan server dan membaca laporan dampaknya dulu',
          benar: true,
          alasan: 'Seperti yang baru saja kalian lakukan: bencana terlihat sebelum terjadi.',
        },
        {
          id: 'empatMata',
          label: 'Meminta anggota lain membaca ulang nama objek di skrip DROP',
          benar: true,
          alasan:
            'Prinsip "empat mata" menangkap salah ketik seperti bank_sampah vs bank_sampah_uji.',
        },
        {
          id: 'fkOff',
          label: 'Mematikan pemeriksaan kunci tamu supaya DROP tidak pernah ditolak',
          benar: false,
          alasan:
            'Penolakan karena kunci tamu justru pengaman. Mematikannya membuat tabel induk bisa terhapus dan data anak kehilangan rujukan.',
        },
        {
          id: 'ifUndo',
          label: 'Selalu memakai IF EXISTS agar penghapusan bisa dibatalkan',
          benar: false,
          alasan: 'IF EXISTS hanya mencegah galat bila objeknya tidak ada; tidak ada pembatalan.',
        },
        {
          id: 'langsung',
          label: 'Menjalankan langsung di server asli agar cepat selesai',
          benar: false,
          alasan: 'Kecepatan tidak sebanding dengan risiko kehilangan data permanen.',
        },
      ],
      done: '<strong>Checklist tim siap:</strong> cadangkan, cek target, uji di salinan, dan baca ulang berdua sebelum DROP.',
    },
  },

  sajikan: {
    kicker: 'Tahap 8 · Menyajikan Hasil Karya',
    title: 'Sajikan Bukti Pembersihan',
    goal: 'Menjalankan skrip pembersihan tim pada salinan server awal, membaca laporan dampak, dan menyusun klaim presentasi berbasis bukti.',
    guru: 'Setiap tim menjalankan skripnya pada salinan server di depan kelas. Juru Bicara menyampaikan klaim, Penguji menunjuk buktinya di panel server dan laporan dampak. Tim lain boleh bertanya "Di mana buktinya?" dan "Baris apa saja yang hilang — memang sasaran?"',
    pengantar:
      'Ini <strong>skrip pembersihan tim</strong> gabungan semua yang kalian tulis. Jalankan pada salinan server awal — persis keadaan server sekolah sebelum dibersihkan.',
    lulus:
      '<strong>Pembersihan lolos uji!</strong> Tepat empat objek sasaran yang hilang; data tabungan dan basis data TEFA utuh.',
    klaim: {
      tanya:
        'Pilih SEMUA klaim yang <strong>didukung bukti</strong> di panel server dan laporan dampak untuk presentasi ke Bu Rina.',
      opsi: [
        {
          id: 'target',
          label: 'Tiga tabel sisa dan basis data bank_sampah_uji sudah terhapus',
          benar: true,
          alasan: 'Panel menandai keempatnya ➖ dihapus.',
        },
        {
          id: 'utuh',
          label:
            'Tabel nasabah, jenis_sampah, petugas, dan setoran masih utuh dengan jumlah baris yang sama',
          benar: true,
          alasan:
            'Kartu bank_sampah tetap menunjukkan 128 nasabah, 9 jenis, 6 petugas, 1.342 setoran.',
        },
        {
          id: 'tefa',
          label: 'Basis data tefa_servis tidak tersentuh',
          benar: true,
          alasan: 'Kartu tefa_servis tidak berubah dan tidak muncul di laporan dampak.',
        },
        {
          id: 'nol',
          label: 'Tidak ada satu baris data pun yang terhapus',
          benar: false,
          alasan:
            'Laporan dampak mencatat 108 baris hilang — semuanya isi objek sasaran (57 + 12 + 3 + 36), bukan data tabungan.',
        },
        {
          id: 'rollback',
          label: 'Bila ternyata keliru, semuanya bisa dibatalkan dengan ROLLBACK',
          benar: false,
          alasan: 'DROP tidak bisa di-ROLLBACK. Yang bisa memulihkan hanya cadangan.',
        },
        {
          id: 'kosong',
          label: 'Basis data bank_sampah kini kosong dan perlu diisi ulang',
          benar: false,
          alasan: 'bank_sampah masih berisi empat tabel inti lengkap dengan datanya.',
        },
      ],
      done: '<strong>Klaim presentasi kuat!</strong> Yang hilang hanya sasaran, dan setiap klaim bisa ditunjuk buktinya.',
    },
  },

  /* ==========================================================
     SINTAKS 5 — Menganalisis & mengevaluasi
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 9 · Evaluasi',
    title: 'Kasus Baru: Bersih-bersih Server Servis Laptop TEFA',
    goal: 'Menerapkan DROP TABLE dan DROP DATABASE pada permintaan baru dan mengevaluasi skrip pembersihan tim lain.',
    guru: 'Kuis dikerjakan individu dan hanya sekali jawab. Uji silang dikerjakan berpasangan: skrip Tim Biru berjalan tanpa galat, sehingga murid harus menilai dari bukti (panel server, laporan dampak, basis data aktif), bukan dari pesan galat.',
    pengantarKuis:
      'Server TEFA berisi basis data aktif <code>tefa_servis</code> dan arsip <code>tefa_servis_2023</code>. Permintaan kepala TEFA:',
    permintaan: [
      'Basis data arsip <code>tefa_servis_2023</code> sudah dicadangkan dan boleh dihapus.',
      'Tabel sementara <code>servis_tmp</code> di tefa_servis dihapus (mungkin sudah dihapus teknisi lain).',
      'Fitur promo dihentikan: tabel <code>promo</code> dan <code>klaim_promo</code> dihapus. klaim_promo merujuk promo.',
      'Tabel <code>log_uji</code> tetap dipakai, tetapi 300 baris uji cobanya dibuang.',
    ],
    serverJudul: 'Server TEFA saat ini',
    sqlE5: 'USE tefa_servis_2023;\nDROP DATABASE tefa_servis_2023;\nCREATE TABLE catatan (id INT);',
    sqlE6: 'DROP TABLE servis;',
    soal: [
      soalPilih('e1', 'Perintah untuk permintaan nomor 1 adalah …', 'c', [
        [
          'a',
          '<code>DROP TABLE tefa_servis_2023;</code>',
          'Yang dihapus basis data, jadi DROP DATABASE.',
        ],
        [
          'b',
          '<code>DELETE DATABASE tefa_servis_2023;</code>',
          'Tidak ada perintah DELETE DATABASE.',
        ],
        [
          'c',
          '<code>DROP DATABASE tefa_servis_2023;</code>',
          'Benar: basis data arsip beserta semua tabelnya terhapus.',
        ],
        [
          'd',
          '<code>DROP DATABASE tefa_servis;</code>',
          'Itu basis data utama yang masih dipakai!',
        ],
      ]),
      soalPilih('e2', 'Perintah untuk permintaan nomor 2 adalah …', 'b', [
        [
          'a',
          '<code>TRUNCATE TABLE servis_tmp;</code>',
          'Isinya hilang, tetapi tabelnya tetap ada di server.',
        ],
        [
          'b',
          '<code>DROP TABLE IF EXISTS servis_tmp;</code>',
          'Benar: tabel terhapus, dan bila sudah dihapus teknisi lain, perintahnya dilewati tanpa galat.',
        ],
        [
          'c',
          '<code>DELETE FROM servis_tmp;</code>',
          'DELETE hanya menghapus baris; tabelnya tetap ada.',
        ],
        ['d', '<code>DROP servis_tmp;</code>', 'Kata kunci TABLE tertinggal.'],
      ]),
      soalPilih('e3', 'Perintah untuk permintaan nomor 3 adalah …', 'a', [
        [
          'a',
          '<code>DROP TABLE klaim_promo; DROP TABLE promo;</code>',
          'Benar: tabel anak (klaim_promo) dulu, baru induknya (promo).',
        ],
        [
          'b',
          '<code>DROP TABLE promo; DROP TABLE klaim_promo;</code>',
          'promo ditolak karena masih dirujuk klaim_promo — skrip berhenti di galat pertama.',
        ],
        ['c', '<code>DROP TABLE promo;</code>', 'Ditolak, dan klaim_promo pun tetap tersisa.'],
        [
          'd',
          '<code>DROP DATABASE tefa_servis;</code>',
          'Promo memang hilang, tetapi seluruh data servis, pelanggan, dan teknisi ikut lenyap.',
        ],
      ]),
      soalPilih('e4', 'Perintah untuk permintaan nomor 4 adalah …', 'd', [
        [
          'a',
          '<code>DROP TABLE log_uji;</code>',
          'Tabelnya ikut hilang padahal masih dipakai — aplikasi akan galat.',
        ],
        ['b', '<code>DROP DATABASE log_uji;</code>', 'log_uji adalah tabel, bukan basis data.'],
        [
          'c',
          '<code>ALTER TABLE log_uji DROP COLUMN pesan;</code>',
          'Kolomnya hilang, tetapi 300 barisnya tetap ada.',
        ],
        [
          'd',
          '<code>TRUNCATE TABLE log_uji;</code>',
          'Benar: semua baris dibuang, strukturnya tetap.',
        ],
      ]),
      soalPilih(
        'e5',
        'Seorang teknisi menjalankan <code>USE tefa_servis_2023; DROP DATABASE tefa_servis_2023;</code> lalu <code>CREATE TABLE catatan (id INT);</code> ditolak. Mengapa?',
        'c',
        [
          ['a', 'Tabel catatan sudah ada', 'Tabel catatan belum pernah dibuat.'],
          [
            'b',
            'Server menolak CREATE setelah DROP',
            'CREATE tetap bisa, asal ada basis data yang dipilih.',
          ],
          [
            'c',
            'Basis data aktif ikut terhapus; harus USE tefa_servis dulu',
            'Benar: setelah basis data aktif dihapus, tidak ada basis data yang dipilih.',
          ],
          ['d', 'INT tidak boleh menjadi kolom pertama', 'INT sah sebagai kolom pertama.'],
        ]
      ),
      soalPilih(
        'e6',
        'Teknisi lain tidak sengaja menjalankan <code>DROP TABLE servis;</code> dan DBMS menerimanya karena servis tidak dirujuk tabel lain. Bagaimana memulihkan 214 data servis?',
        'b',
        [
          ['a', 'Menjalankan ROLLBACK', 'DROP tidak bisa di-ROLLBACK.'],
          [
            'b',
            'Hanya dari cadangan (backup) yang dibuat sebelum DROP',
            'Benar: tanpa cadangan, 214 data servis itu hilang selamanya.',
          ],
          [
            'c',
            'Menjalankan CREATE TABLE servis lagi',
            'Strukturnya kembali, tetapi tabelnya kosong.',
          ],
          ['d', 'Menjalankan DROP TABLE IF EXISTS servis', 'IF EXISTS tidak memulihkan apa pun.'],
        ]
      ),
    ],
    ujiSilang: {
      judul: 'Skrip pembersihan Tim Biru',
      pengantar:
        'Kembali ke server Bank Sampah. Tim Biru mengklaim skrip berikut menuntaskan permintaan Bu Rina dan "berhasil karena tidak ada galat". Jalankan pada salinan server awal, lalu periksa buktinya.',
      tanya: 'Pilih SEMUA kesalahan dalam skrip Tim Biru.',
      opsi: [
        {
          id: 'tefa',
          label: 'Basis data tefa_servis milik kelas lain ikut dihapus',
          benar: true,
          alasan: 'Laporan dampak: tefa_servis beserta 3 tabel dan 369 barisnya hilang.',
        },
        {
          id: 'sisa',
          label: 'Tabel kuis_hadiah tidak dihapus',
          benar: true,
          alasan:
            'Hanya setoran_impor_tmp dan pemenang_kuis yang dihapus; kuis_hadiah masih ada di panel.',
        },
        {
          id: 'aktif',
          label: 'Di akhir skrip tidak ada basis data yang aktif',
          benar: true,
          alasan:
            'USE bank_sampah_uji lalu DROP DATABASE bank_sampah_uji membuat pilihan basis data lepas; tidak ada USE bank_sampah sesudahnya.',
        },
        {
          id: 'gabung',
          label: 'Dua tabel tidak boleh dihapus dalam satu DROP TABLE',
          benar: false,
          alasan: 'Boleh, dipisah koma. Perintah itu berjalan tanpa galat.',
        },
        {
          id: 'ifexists',
          label: 'IF EXISTS membuat skrip menghapus objek yang salah',
          benar: false,
          alasan:
            'IF EXISTS hanya melewati objek yang tidak ada; yang salah adalah nama yang ditulis.',
        },
        {
          id: 'inti',
          label: 'Tabel setoran ikut terhapus',
          benar: false,
          alasan: 'Kartu bank_sampah masih menunjukkan setoran dengan 1.342 baris.',
        },
      ],
      skrip: SKRIP_TIM_BIRU,
      done: '<strong>Uji silang tuntas!</strong> "Tidak ada galat" bukan bukti benar — DBMS menjalankan DROP apa adanya. Bukti dampak dan basis data aktif yang menentukan.',
    },
  },

  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Refleksi Pemecahan Masalah',
    goal: 'Menilai kemampuan diri dan proses tim dalam menghapus basis data dan tabel secara aman.',
    guru: 'Beri 5 menit refleksi mandiri. Kumpulkan jawaban terbuka untuk menemukan kebiasaan yang paling sering terlupa (biasanya cek basis data aktif dan cadangan) sebagai bahan pertemuan berikutnya: mengisi dan mengubah data dengan DML.',
    skala: [
      { value: 1, label: 'Belum bisa' },
      { value: 2, label: 'Masih ragu' },
      { value: 3, label: 'Cukup bisa' },
      { value: 4, label: 'Bisa' },
      { value: 5, label: 'Sangat bisa' },
    ],
    pernyataan: [
      {
        id: 'p1',
        teks: 'Aku bisa memeriksa target dengan SHOW DATABASES, SELECT DATABASE(), dan SHOW TABLES sebelum menghapus.',
      },
      {
        id: 'p2',
        teks: 'Aku bisa menghapus tabel dengan DROP TABLE dalam urutan yang benar terhadap kunci tamu.',
      },
      {
        id: 'p3',
        teks: 'Aku bisa menghapus basis data dengan DROP DATABASE dan tahu akibatnya pada basis data aktif.',
      },
      {
        id: 'p4',
        teks: 'Aku bisa menjelaskan beda DROP, TRUNCATE, DELETE, dan DROP COLUMN beserta risikonya.',
      },
      {
        id: 'p5',
        teks: 'Aku bisa menganalisis risiko skrip DROP dan menerapkan kebiasaan aman sebelum menjalankannya.',
      },
    ],
    tanyaTerbuka:
      'Kebiasaan aman apa yang akan selalu kamu lakukan sebelum menjalankan DROP, dan mengapa?',
  },

  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Server Bersih, Tabungan Utuh!',
    goal: 'Melihat rekap skor dan skrip pembersihan hasil kerja tim.',
    pesan:
      'Server sekolah kini bersih dari objek tak terpakai, sementara tabungan siswa dan basis data kelas lain tetap utuh. Pertemuan berikutnya: mengisi dan mengubah data dengan DML.',
    rangkuman: [
      '<code>DROP TABLE [IF EXISTS] nama[, nama2];</code> menghapus tabel beserta struktur dan seluruh isinya dari basis data AKTIF.',
      'Tabel yang masih dirujuk kunci tamu ditolak dihapus: hapus tabel anak dulu, baru induknya.',
      '<code>DROP DATABASE [IF EXISTS] nama;</code> menghapus basis data beserta semua tabelnya; bila itu basis data aktif, pilih lagi dengan USE.',
      'DROP permanen dan tidak bisa di-ROLLBACK. TRUNCATE mengosongkan isi, DELETE menghapus baris, DROP COLUMN membuang kolom — tabelnya tetap.',
      'Sebelum DROP: cadangkan, cek target (SHOW DATABASES, SELECT DATABASE(), SHOW TABLES), uji di salinan, dan minta orang lain membaca ulang.',
    ],
  },
};

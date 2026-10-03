'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Membuat Basis Data dan Tabel dengan
   CREATE DATABASE dan CREATE TABLE sesuai Rancangan Basis Data
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js (seksi 17 SQL DDL: simulator, kamus data,
   editor DDL berpemeriksa). Guru dapat menyunting teks, soal,
   kunci, dan umpan balik di sini tanpa menyentuh kode.

   Masalah autentik: Bank Sampah Sekolah (program Adiwiyata).
   Tim TEFA sudah membuat aplikasi pencatat setoran dan rancangan
   basis data `bank_sampah` (kamus data) sudah disetujui, tetapi
   aplikasi galat: basis data dan tabelnya belum pernah dibuat.
   Tim murid menerjemahkan kamus data menjadi skrip CREATE
   DATABASE dan CREATE TABLE, menulisnya SENDIRI di editor DDL,
   menguji di DBMS tiruan, lalu menyajikan buktinya. Kasus transfer
   pada evaluasi: Servis Laptop TEFA (hasil 3NF dari MPI 1.4).

   Pemetaan sintaks PBL → tahap media:
     1. Orientasi murid pada masalah
                         → orientasi   (TP, alur, apersepsi)
                         → masalah     (laporan galat aplikasi,
                                        kamus data, akar masalah,
                                        rumusan masalah)
     2. Mengorganisasi murid untuk belajar
                         → organisasi  (peran tim, rencana langkah)
     3. Membimbing penyelidikan individu & kelompok
                         → konsep      (kartu sintaks, terjemahkan
                                        kamus data → tipe data &
                                        constraint)
                         → basisData   (selidiki CREATE DATABASE &
                                        USE di konsol, tulis sendiri)
                         → tabelInduk  (lengkapi jenis_sampah, tulis
                                        nasabah & petugas sendiri)
     4. Mengembangkan & menyajikan hasil karya
                         → tabelAnak   (urutan tabel, tulis setoran
                                        berkunci tamu)
                         → sajikan     (jalankan skrip tim dari awal,
                                        bandingkan dengan kamus data,
                                        klaim presentasi)
     5. Menganalisis & mengevaluasi proses pemecahan masalah
                         → evaluasi    (kasus Servis Laptop TEFA +
                                        uji silang skrip Tim Biru)
                         → refleksi
     Penutup             → selesai

   KONVENSI: rancangan memakai format ERD engine seksi 15 dengan
   `tipe`, `wajib`, dan `ket` per atribut serta `tabel` per entitas
   (seksi 17). `kunci` berisi skrip contoh untuk setiap editor;
   semuanya diuji otomatis terhadap simulator engine
   (tests/mpi-f-2.2-data.test.js).

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

/* ---------- Rancangan utama: Bank Sampah Sekolah ---------- */

var ERD_BANK = {
  entitas: [
    {
      id: 'setoran',
      tabel: 'setoran',
      label: 'Setoran',
      ikon: '♻️',
      atribut: [
        { id: 's_no', teks: 'no_setoran', pk: true, tipe: 'INT', ket: 'Nomor urut setoran' },
        { id: 's_tgl', teks: 'tgl_setor', tipe: 'DATE', wajib: true, ket: 'Tanggal setor' },
        {
          id: 's_nasabah',
          teks: 'id_nasabah',
          fk: 'nasabah',
          tipe: 'INT',
          wajib: true,
          ket: 'Nasabah yang menyetor',
        },
        {
          id: 's_jenis',
          teks: 'kode_jenis',
          fk: 'jenis',
          tipe: 'CHAR(4)',
          wajib: true,
          ket: 'Jenis sampah yang disetor',
        },
        {
          id: 's_petugas',
          teks: 'id_petugas',
          fk: 'petugas',
          tipe: 'INT',
          wajib: true,
          ket: 'Petugas yang menimbang',
        },
        {
          id: 's_berat',
          teks: 'berat_kg',
          tipe: 'DECIMAL(5,2)',
          wajib: true,
          ket: 'Berat dalam kg, mis. 2.75',
        },
      ],
    },
    {
      id: 'nasabah',
      tabel: 'nasabah',
      label: 'Nasabah',
      ikon: '🧑‍🎓',
      atribut: [
        { id: 'n_id', teks: 'id_nasabah', pk: true, tipe: 'INT', ket: 'Nomor nasabah' },
        {
          id: 'n_nama',
          teks: 'nama_nasabah',
          tipe: 'VARCHAR(50)',
          wajib: true,
          ket: 'Nama lengkap',
        },
        { id: 'n_kelas', teks: 'kelas', tipe: 'VARCHAR(10)', wajib: true, ket: 'Mis. XI RPL 1' },
        { id: 'n_hp', teks: 'no_hp', tipe: 'VARCHAR(15)', ket: 'Boleh kosong' },
      ],
    },
    {
      id: 'jenis',
      tabel: 'jenis_sampah',
      label: 'Jenis Sampah',
      ikon: '🗑️',
      atribut: [
        { id: 'j_kode', teks: 'kode_jenis', pk: true, tipe: 'CHAR(4)', ket: 'Selalu 4 karakter' },
        {
          id: 'j_nama',
          teks: 'nama_jenis',
          tipe: 'VARCHAR(30)',
          wajib: true,
          ket: 'Mis. Botol plastik',
        },
        {
          id: 'j_harga',
          teks: 'harga_per_kg',
          tipe: 'INT',
          wajib: true,
          ket: 'Rupiah tanpa sen',
        },
      ],
    },
    {
      id: 'petugas',
      tabel: 'petugas',
      label: 'Petugas',
      ikon: '🧑‍🔧',
      atribut: [
        { id: 'p_id', teks: 'id_petugas', pk: true, tipe: 'INT', ket: 'Nomor petugas' },
        {
          id: 'p_nama',
          teks: 'nama_petugas',
          tipe: 'VARCHAR(50)',
          wajib: true,
          ket: 'Nama petugas piket',
        },
      ],
    },
  ],
  relasi: [],
};

/* ---------- Kasus transfer evaluasi: Servis Laptop TEFA (MPI 1.4) ---------- */

var ERD_TEFA = {
  entitas: [
    {
      id: 'detail',
      tabel: 'detail_servis',
      label: 'Detail Servis',
      ikon: '🧾',
      penghubung: true,
      atribut: [
        { id: 'd_srv', teks: 'no_servis', pk: true, fk: 'servis', tipe: 'CHAR(3)' },
        { id: 'd_lay', teks: 'kode_lay', pk: true, fk: 'layanan', tipe: 'CHAR(2)' },
      ],
    },
    {
      id: 'servis',
      tabel: 'servis',
      label: 'Servis',
      ikon: '💻',
      atribut: [
        { id: 's_no', teks: 'no_servis', pk: true, tipe: 'CHAR(3)', ket: 'Mis. S01' },
        { id: 's_tgl', teks: 'tgl_masuk', tipe: 'DATE', wajib: true },
        { id: 's_plg', teks: 'kode_plg', fk: 'pelanggan', tipe: 'CHAR(3)', wajib: true },
        { id: 's_tek', teks: 'kode_tek', fk: 'teknisi', tipe: 'CHAR(2)', wajib: true },
      ],
    },
    {
      id: 'pelanggan',
      tabel: 'pelanggan',
      label: 'Pelanggan',
      ikon: '🙋',
      atribut: [
        { id: 'p_kode', teks: 'kode_plg', pk: true, tipe: 'CHAR(3)', ket: 'Mis. P01' },
        { id: 'p_nama', teks: 'nama_plg', tipe: 'VARCHAR(50)', wajib: true },
        { id: 'p_hp', teks: 'no_hp', tipe: 'VARCHAR(15)' },
      ],
    },
    {
      id: 'teknisi',
      tabel: 'teknisi',
      label: 'Teknisi',
      ikon: '🧑‍🔧',
      atribut: [
        { id: 't_kode', teks: 'kode_tek', pk: true, tipe: 'CHAR(2)', ket: 'Mis. T1' },
        { id: 't_nama', teks: 'nama_tek', tipe: 'VARCHAR(50)', wajib: true },
      ],
    },
    {
      id: 'layanan',
      tabel: 'layanan',
      label: 'Layanan',
      ikon: '🛠️',
      atribut: [
        { id: 'l_kode', teks: 'kode_lay', pk: true, tipe: 'CHAR(2)', ket: 'Mis. L1' },
        { id: 'l_nama', teks: 'nama_lay', tipe: 'VARCHAR(40)', wajib: true },
        { id: 'l_biaya', teks: 'biaya', tipe: 'DECIMAL(10,2)', wajib: true, ket: 'Rupiah' },
      ],
    },
  ],
  relasi: [],
};

/* Skrip Tim Biru (uji silang): tiga kesalahan yang muncul bergiliran
   saat diperbaiki — lupa USE, tabel anak dibuat sebelum induknya,
   dan VARCHAR tanpa panjang. */
var SKRIP_TIM_BIRU =
  'CREATE DATABASE tefa_servis;\n\n' +
  'CREATE TABLE servis (\n' +
  '  no_servis CHAR(3),\n' +
  '  tgl_masuk DATE NOT NULL,\n' +
  '  kode_plg CHAR(3) NOT NULL,\n' +
  '  kode_tek CHAR(2) NOT NULL,\n' +
  '  PRIMARY KEY (no_servis),\n' +
  '  FOREIGN KEY (kode_plg) REFERENCES pelanggan(kode_plg),\n' +
  '  FOREIGN KEY (kode_tek) REFERENCES teknisi(kode_tek)\n' +
  ');\n\n' +
  'CREATE TABLE pelanggan (\n' +
  '  kode_plg CHAR(3),\n' +
  '  nama_plg VARCHAR NOT NULL,\n' +
  '  no_hp VARCHAR(15),\n' +
  '  PRIMARY KEY (kode_plg)\n' +
  ');';

/* Pernyataan berumpang tahap Tabel Induk; __n__ = isian ke-n. */
var RUMPANG_JENIS =
  'CREATE TABLE jenis_sampah (\n' +
  '  kode_jenis __1__,\n' +
  '  nama_jenis VARCHAR(30) __2__,\n' +
  '  harga_per_kg __3__ NOT NULL,\n' +
  '  __4__ (kode_jenis)\n' +
  ');';

/* Pernyataan konsol yang dipakai berulang. */
var SQL_NASABAH_MINI = 'CREATE TABLE nasabah (\n  id_nasabah INT PRIMARY KEY\n);';

var DATA = {
  meta: {
    judul: 'Membuat Basis Data dan Tabel dengan CREATE DATABASE dan CREATE TABLE',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Problem Based Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Orientasi pada Masalah' },
    {
      id: 'masalah',
      label: 'Masalah Bank Sampah',
      sintaks: 'Sintaks 1 · Orientasi pada Masalah',
    },
    {
      id: 'organisasi',
      label: 'Bentuk Tim',
      sintaks: 'Sintaks 2 · Mengorganisasi Murid untuk Belajar',
    },
    { id: 'konsep', label: 'Bekal Sintaks', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'basisData', label: 'Buat Basis Data', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'tabelInduk', label: 'Tabel Induk', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    {
      id: 'tabelAnak',
      label: 'Tabel Berelasi',
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

  erd: ERD_BANK,
  erdTefa: ERD_TEFA,
  namaDb: 'bank_sampah',
  namaDbTefa: 'tefa_servis',

  /* Skrip contoh tiap editor — kunci guru & bahan tes otomatis.
     Murid boleh menulis versi lain selama hasilnya sesuai rancangan. */
  kunci: {
    db: 'CREATE DATABASE bank_sampah;\nUSE bank_sampah;',
    induk:
      'CREATE TABLE nasabah (\n' +
      '  id_nasabah INT,\n' +
      '  nama_nasabah VARCHAR(50) NOT NULL,\n' +
      '  kelas VARCHAR(10) NOT NULL,\n' +
      '  no_hp VARCHAR(15),\n' +
      '  PRIMARY KEY (id_nasabah)\n' +
      ');\n\n' +
      'CREATE TABLE petugas (\n' +
      '  id_petugas INT,\n' +
      '  nama_petugas VARCHAR(50) NOT NULL,\n' +
      '  PRIMARY KEY (id_petugas)\n' +
      ');',
    anak:
      'CREATE TABLE setoran (\n' +
      '  no_setoran INT,\n' +
      '  tgl_setor DATE NOT NULL,\n' +
      '  id_nasabah INT NOT NULL,\n' +
      '  kode_jenis CHAR(4) NOT NULL,\n' +
      '  id_petugas INT NOT NULL,\n' +
      '  berat_kg DECIMAL(5,2) NOT NULL,\n' +
      '  PRIMARY KEY (no_setoran),\n' +
      '  FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah),\n' +
      '  FOREIGN KEY (kode_jenis) REFERENCES jenis_sampah(kode_jenis),\n' +
      '  FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas)\n' +
      ');',
  },

  /* ==========================================================
     SINTAKS 1 — Orientasi pada masalah
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Aplikasi Bank Sampah Tidak Bisa Menyimpan Data',
    goal: 'Mengetahui tujuan belajar, alur pemecahan masalah, dan cara memakai media ini.',
    guru: 'Kaitkan dengan MPI 2.1: murid sudah tahu fungsi perintah DDL, kini mereka harus <em>menulisnya sendiri</em> dari rancangan. Ceritakan masalah Bank Sampah secara singkat seperti laporan klien sungguhan, lalu minta murid menjawab pemanasan. Jangan memberi skrip jadi — masalah inilah yang akan mereka pecahkan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membuat basis data dan tabel menggunakan perintah CREATE DATABASE dan CREATE TABLE sesuai rancangan basis data yang telah ditentukan.',
    kriteria: [
      'Membaca kamus data: nama tabel, kolom, tipe data, kunci primer, kunci tamu, dan kolom wajib.',
      'Menulis perintah CREATE DATABASE dan USE untuk menyiapkan basis data sesuai nama di rancangan.',
      'Menulis perintah CREATE TABLE lengkap dengan tipe data, NOT NULL, dan PRIMARY KEY.',
      'Menulis FOREIGN KEY … REFERENCES dan mengurutkan pembuatan tabel: induk sebelum anak.',
      'Menguji skrip di DBMS, membaca pesan galat, lalu memperbaiki skrip sendiri maupun skrip tim lain.',
    ],
    pengantar:
      'Bank Sampah Sekolah menukar sampah pilah menjadi tabungan. Tim TEFA RPL sudah membuat <strong>aplikasi pencatat setoran</strong> dan rancangan basis datanya sudah disetujui pembina. Tetapi saat aplikasi dicoba, setiap setoran <strong>gagal disimpan</strong>. Timmu dipanggil untuk memecahkan masalah ini.',
    alur: [
      { judul: 'Masalah', desk: 'Baca laporan galat aplikasi dan rancangan basis data.' },
      { judul: 'Bentuk Tim', desk: 'Bagi peran dan susun rencana langkah pemecahan masalah.' },
      { judul: 'Bekal Sintaks', desk: 'Terjemahkan kamus data menjadi tipe data dan constraint.' },
      { judul: 'Buat Basis Data', desk: 'Selidiki CREATE DATABASE dan USE, lalu tulis sendiri.' },
      { judul: 'Tabel Induk', desk: 'Tulis CREATE TABLE untuk tabel tanpa kunci tamu.' },
      { judul: 'Tabel Berelasi', desk: 'Tulis tabel setoran beserta FOREIGN KEY-nya.' },
      { judul: 'Sajikan Hasil', desk: 'Jalankan skrip tim dari awal dan tunjukkan buktinya.' },
      { judul: 'Evaluasi', desk: 'Uji kemampuan pada kasus Servis Laptop TEFA.' },
    ],
    caraPakai: [
      'Kamu akan <strong>mengetik skrip SQL sendiri</strong> di editor. Tekan <em>Jalankan &amp; periksa</em>: DBMS tiruan menjalankan skripmu lalu mencocokkannya dengan rancangan.',
      'Galat bukan kegagalan — baca pesan DBMS, perbaiki, dan jalankan lagi. Petunjuk bertingkat tersedia bila buntu.',
      'Pertanyaan boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama. Kuis evaluasi hanya bisa dijawab sekali.',
      'Urutan pilihan jawaban diacak. Progres tersimpan di perangkat ini; tombol Reset mengulang dari awal dan mengacak ulang pilihan.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: aplikasi sudah jadi dan rancangan basis data sudah disetujui, tetapi data tetap gagal disimpan. Menurut dugaanmu, apa penyebabnya?',
      opsi: [
        { id: 'wadah', label: 'Basis data dan tabelnya belum dibuat di DBMS' },
        { id: 'aplikasi', label: 'Kode aplikasinya harus ditulis ulang' },
        { id: 'internet', label: 'Koneksi internet sekolah lambat' },
        { id: 'rancangan', label: 'Rancangan basis datanya salah total' },
      ],
      umpan:
        'Simpan dugaanmu — tahap berikutnya memberi bukti. Ingat MPI 2.1: rancangan di atas kertas belum menjadi apa-apa di DBMS sampai seseorang <strong>menjalankan perintah DDL</strong> untuk membangunnya.',
    },
  },

  masalah: {
    kicker: 'Tahap 2 · Orientasi pada Masalah',
    title: 'Laporan Masalah dari Bank Sampah',
    goal: 'Menemukan akar masalah dari laporan galat dan rancangan basis data, lalu merumuskan masalah.',
    guru: "Bacakan laporan Bu Rina seperti klien sungguhan. Minta tim menandai kata kunci pada pesan galat (<em>Unknown database</em>, <em>doesn't exist</em>). Rumusan masalah tidak dinilai otomatis; pilih dua rumusan tim untuk dibacakan dan dijadikan pegangan kelas.",
    kutipan:
      '"Aplikasinya sudah dipasang di laptop pos Bank Sampah, tapi setiap kali petugas menekan Simpan, muncul pesan merah. Rancangan basis datanya sudah kami setujui bulan lalu. Tolong cari tahu apa yang kurang, ya." — Bu Rina, pembina Bank Sampah',
    logJudul: 'Log galat aplikasi',
    log: [
      "[07:02] Koneksi ke server … gagal: Unknown database 'bank_sampah'",
      "[07:15] Simpan setoran #1 … gagal: Unknown database 'bank_sampah'",
      "[07:16] Cek tabel setoran … gagal: Table 'bank_sampah.setoran' doesn't exist",
    ],
    kamusJudul: 'Rancangan basis data (kamus data) yang sudah disetujui',
    akar: {
      tanya:
        'Berdasarkan log galat dan kamus data, pilih SEMUA pernyataan yang tepat tentang masalahnya.',
      opsi: [
        {
          id: 'db',
          label: 'Basis data <code>bank_sampah</code> belum ada di DBMS',
          benar: true,
          alasan: '"Unknown database" berarti DBMS tidak mengenal basis data dengan nama itu.',
        },
        {
          id: 'tabel',
          label: 'Tabel-tabel sesuai rancangan belum dibuat',
          benar: true,
          alasan: '"Table … doesn\'t exist": tabel setoran (dan kawan-kawannya) memang belum ada.',
        },
        {
          id: 'rancangan',
          label: 'Rancangan sudah tersedia, tinggal diwujudkan dengan perintah SQL',
          benar: true,
          alasan:
            'Kamus data sudah lengkap: nama tabel, kolom, tipe, dan kunci tinggal diterjemahkan ke CREATE DATABASE dan CREATE TABLE.',
        },
        {
          id: 'insert',
          label: 'Data setoran harus dimasukkan dulu dengan INSERT',
          benar: false,
          alasan:
            'INSERT mengisi baris ke tabel. Tabelnya sendiri belum ada, jadi INSERT pun akan gagal.',
        },
        {
          id: 'kode',
          label: 'Kode aplikasi salah sehingga harus ditulis ulang',
          benar: false,
          alasan:
            'Aplikasi sudah benar mencari basis data bank_sampah; yang belum ada adalah basis datanya.',
        },
        {
          id: 'ulang',
          label: 'Rancangan basis data harus dibuat ulang dari awal',
          benar: false,
          alasan: 'Rancangan sudah disetujui dan tidak ada galat yang menyinggung rancangan.',
        },
      ],
      done: '<strong>Akar masalah ditemukan:</strong> wadah datanya (basis data dan tabel) belum pernah dibangun dari rancangan.',
    },
    rumusan: {
      label: 'Rumusan masalah tim',
      petunjuk:
        'Tulis rumusan masalah dalam bentuk pertanyaan yang memuat kata "basis data", "tabel", dan "rancangan".',
      placeholder:
        'Contoh: Bagaimana membuat basis data bank_sampah beserta tabel-tabelnya dengan perintah SQL agar sesuai rancangan?',
      min: 40,
    },
  },

  /* ==========================================================
     SINTAKS 2 — Mengorganisasi murid untuk belajar
     ========================================================== */
  organisasi: {
    kicker: 'Tahap 3 · Mengorganisasi Belajar',
    title: 'Bentuk Tim Pembangun Basis Data',
    goal: 'Membagi peran tim dan menyusun rencana langkah membangun basis data dari rancangan.',
    guru: 'Bentuk tim berempat dan pastikan setiap peran terisi; peran boleh dirangkap bila tim bertiga. Penulis skrip memegang keyboard, tetapi Pembaca Rancangan wajib mengecek setiap baris terhadap kamus data. Diskusikan rencana langkah bersama sebelum murid lanjut.',
    peran: [
      {
        id: 'ketua',
        ikon: '🧭',
        label: 'Ketua',
        tugas: 'Mengatur waktu, memastikan urutan langkah diikuti, dan memimpin presentasi.',
      },
      {
        id: 'pembaca',
        ikon: '📖',
        label: 'Pembaca Rancangan',
        tugas: 'Membacakan kamus data: tabel, kolom, tipe data, kunci, dan kolom wajib.',
      },
      {
        id: 'penulis',
        ikon: '⌨️',
        label: 'Penulis Skrip',
        tugas: 'Mengetik perintah CREATE DATABASE dan CREATE TABLE di editor.',
      },
      {
        id: 'penguji',
        ikon: '🔍',
        label: 'Penguji',
        tugas: 'Menjalankan skrip, membaca pesan galat, dan mencocokkan hasil dengan rancangan.',
      },
    ],
    rencana: {
      pengantar:
        'Susun rencana kerja tim. Ketuk kartu sesuai urutan yang paling masuk akal untuk membangun basis data dari rancangan.',
      items: [
        { id: 'r1', label: 'Baca kamus data: catat tabel, kolom, tipe, dan kunci' },
        { id: 'r2', label: 'Buat basis data dengan CREATE DATABASE' },
        { id: 'r3', label: 'Pilih basis data itu dengan USE' },
        { id: 'r4', label: 'Buat tabel induk (yang tidak punya kunci tamu)' },
        { id: 'r5', label: 'Buat tabel anak yang punya FOREIGN KEY' },
        { id: 'r6', label: 'Uji: bandingkan isi DBMS dengan kamus data' },
      ],
      sukses:
        '<strong>Rencana tim siap!</strong> Wadah dulu (basis data), pilih wadahnya, isi dengan tabel induk, baru tabel anak yang merujuk induknya — lalu uji.',
      salah:
        'Ingat: tabel hanya bisa dibuat di dalam basis data yang sudah <em>dipilih</em>, dan kunci tamu hanya bisa merujuk tabel yang sudah ada.',
    },
  },

  /* ==========================================================
     SINTAKS 3 — Membimbing penyelidikan
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Membimbing Penyelidikan',
    title: 'Bekal Sintaks: Dari Kamus Data ke SQL',
    goal: 'Menerjemahkan isi kamus data menjadi tipe data dan constraint SQL.',
    guru: 'Minta Pembaca Rancangan membuka kartu sintaks lalu menjelaskannya ke tim dengan kata-kata sendiri. Saat memilah, tekankan alasan: nomor HP bukan INT (angka 0 di depan hilang), kode berpanjang tetap cocok CHAR. Gunakan pertanyaan "Bagaimana kamu tahu?" daripada memberi jawaban.',
    pengantar:
      'Setiap baris kamus data harus diterjemahkan ke SQL. Buka kartu di bawah untuk melihat sintaksnya, lalu latih terjemahanmu.',
    kartu: [
      {
        ikon: '🗄️',
        istilah: 'CREATE DATABASE',
        def: 'Membuat basis data baru — wadah bagi tabel-tabel. Nama tanpa spasi; gunakan garis bawah.',
        contoh: 'CREATE DATABASE nama_basis_data;',
      },
      {
        ikon: '👉',
        istilah: 'USE',
        def: 'Memilih basis data yang akan dipakai. Tabel selalu dibuat di basis data yang sedang aktif.',
        contoh: 'USE nama_basis_data;',
      },
      {
        ikon: '▦',
        istilah: 'CREATE TABLE',
        def: 'Membuat tabel. Di dalam kurung: satu definisi kolom per baris (nama, tipe, constraint), dipisah koma; kunci ditulis di akhir.',
        contoh:
          'CREATE TABLE nama_tabel (\n  kolom1 TIPE NOT NULL,\n  kolom2 TIPE,\n  PRIMARY KEY (kolom1)\n);',
      },
      {
        ikon: '🔢',
        istilah: 'Tipe data',
        def: 'INT bilangan bulat; DECIMAL(p,s) bilangan berkoma; VARCHAR(n) teks panjang berubah maks n; CHAR(n) teks panjang tetap n; DATE tanggal.',
        contoh: 'harga INT,\nberat DECIMAL(5,2),\nnama VARCHAR(50),\nkode CHAR(4),\ntanggal DATE',
      },
      {
        ikon: '🚫',
        istilah: 'NOT NULL',
        def: 'Kolom wajib diisi; DBMS menolak baris yang mengosongkannya. Tanpa NOT NULL, kolom boleh kosong.',
        contoh: 'nama_nasabah VARCHAR(50) NOT NULL',
      },
      {
        ikon: '🔑',
        istilah: 'PRIMARY KEY',
        def: 'Kunci primer: nilai unik penanda setiap baris dan otomatis wajib diisi.',
        contoh: 'PRIMARY KEY (id_nasabah)',
      },
      {
        ikon: '🔗',
        istilah: 'FOREIGN KEY … REFERENCES',
        def: 'Kunci tamu: kolom yang merujuk kunci primer tabel lain. Tipe datanya harus sama, dan tabel rujukan harus sudah ada.',
        contoh: 'FOREIGN KEY (id_nasabah)\n  REFERENCES nasabah(id_nasabah)',
      },
    ],
    tipe: {
      pengantar: 'Pilih tipe data yang paling tepat untuk setiap keterangan kamus data.',
      kategori: [
        { id: 'int', label: 'INT' },
        { id: 'decimal', label: 'DECIMAL(p,s)' },
        { id: 'varchar', label: 'VARCHAR(n)' },
        { id: 'char', label: 'CHAR(n)' },
        { id: 'date', label: 'DATE' },
      ],
      items: [
        {
          id: 't1',
          teks: 'Harga per kg dalam rupiah, tanpa sen (mis. 3000)',
          correct: 'int',
          explanation: 'Bilangan bulat tanpa koma cukup disimpan sebagai INT.',
        },
        {
          id: 't2',
          teks: 'Berat sampah dalam kg, bisa berkoma (mis. 2.75)',
          correct: 'decimal',
          explanation: 'Nilai berkoma memakai DECIMAL; DECIMAL(5,2) muat sampai 999.99.',
        },
        {
          id: 't3',
          teks: 'Nama nasabah, panjangnya berbeda-beda, paling banyak 50 karakter',
          correct: 'varchar',
          explanation: 'Panjang teks berubah-ubah → VARCHAR(50), hemat tempat untuk nama pendek.',
        },
        {
          id: 't4',
          teks: 'Kode jenis sampah, selalu tepat 4 karakter (mis. PL01)',
          correct: 'char',
          explanation: 'Teks yang panjangnya selalu sama cocok dengan CHAR(4).',
        },
        {
          id: 't5',
          teks: 'Tanggal setoran',
          correct: 'date',
          explanation: 'Tanggal disimpan dengan DATE agar bisa diurutkan dan dihitung selisihnya.',
        },
        {
          id: 't6',
          teks: 'Nomor HP nasabah (mis. 081234567890)',
          correct: 'varchar',
          explanation:
            'Nomor HP bukan untuk dihitung dan diawali 0 — sebagai INT angka 0 di depan hilang. Simpan sebagai VARCHAR(15).',
        },
        {
          id: 't7',
          teks: 'Nomor urut setoran: 1, 2, 3, …',
          correct: 'int',
          explanation: 'Nomor urut adalah bilangan bulat → INT.',
        },
      ],
    },
    constraint: {
      pengantar: 'Constraint apa yang mewujudkan aturan kamus data berikut?',
      kategori: [
        { id: 'pk', label: 'PRIMARY KEY' },
        { id: 'nn', label: 'NOT NULL' },
        { id: 'fk', label: 'FOREIGN KEY … REFERENCES' },
      ],
      items: [
        {
          id: 'c1',
          teks: 'no_setoran membedakan setiap setoran dan tidak boleh ganda',
          correct: 'pk',
          explanation: 'Penanda unik setiap baris adalah kunci primer.',
        },
        {
          id: 'c2',
          teks: 'nama_jenis harus selalu diisi',
          correct: 'nn',
          explanation: '"Wajib diisi" di kamus data diterjemahkan menjadi NOT NULL.',
        },
        {
          id: 'c3',
          teks: 'id_nasabah pada setoran harus merujuk nasabah yang terdaftar',
          correct: 'fk',
          explanation: 'Kolom yang merujuk kunci primer tabel lain adalah kunci tamu.',
        },
        {
          id: 'c4',
          teks: 'Setiap setoran wajib mencatat berat_kg',
          correct: 'nn',
          explanation: 'Kolom wajib → tambahkan NOT NULL setelah tipe datanya.',
        },
        {
          id: 'c5',
          teks: 'kode_jenis pada setoran harus ada di tabel jenis_sampah',
          correct: 'fk',
          explanation:
            'Merujuk tabel jenis_sampah → FOREIGN KEY (kode_jenis) REFERENCES jenis_sampah(kode_jenis).',
        },
        {
          id: 'c6',
          teks: 'id_petugas menandai setiap petugas secara unik',
          correct: 'pk',
          explanation: 'Penanda unik di tabel petugas sendiri adalah kunci primernya.',
        },
      ],
    },
    pertanyaan: [
      soalPilih(
        'k1',
        'Kamus data: <code>nama_nasabah</code>, teks maks 50 karakter, wajib diisi. Definisi kolom yang benar adalah …',
        'b',
        [
          [
            'a',
            '<code>nama_nasabah VARCHAR NOT NULL</code>',
            'VARCHAR wajib diberi panjang di dalam kurung, mis. VARCHAR(50).',
          ],
          [
            'b',
            '<code>nama_nasabah VARCHAR(50) NOT NULL</code>',
            'Tepat: nama kolom, tipe beserta panjangnya, lalu constraint.',
          ],
          [
            'c',
            '<code>VARCHAR(50) nama_nasabah NOT NULL</code>',
            'Urutannya terbalik — nama kolom selalu ditulis lebih dulu, baru tipe datanya.',
          ],
          [
            'd',
            '<code>nama_nasabah VARCHAR(50) NULL</code>',
            'NULL justru berarti boleh kosong. Kolom wajib memakai NOT NULL.',
          ],
        ]
      ),
      soalPilih(
        'k2',
        'Di dalam kurung <code>CREATE TABLE ( … )</code>, definisi kolom yang satu dengan berikutnya dipisahkan oleh …',
        'a',
        [
          [
            'a',
            'Tanda koma ( , )',
            'Benar. Baris terakhir sebelum kurung tutup tidak diberi koma.',
          ],
          [
            'b',
            'Tanda titik koma ( ; )',
            'Titik koma mengakhiri seluruh <em>pernyataan</em>, bukan memisahkan kolom.',
          ],
          ['c', 'Cukup baris baru', 'Baris baru hanya merapikan tampilan; DBMS butuh tanda koma.'],
          [
            'd',
            'Tanda titik ( . )',
            'Titik dipakai untuk tabel.kolom, bukan pemisah definisi kolom.',
          ],
        ]
      ),
      soalPilih(
        'k3',
        'Kunci tamu <code>id_nasabah</code> di tabel setoran merujuk <code>nasabah(id_nasabah)</code> yang bertipe INT. Tipe kolom kunci tamu itu harus …',
        'c',
        [
          [
            'a',
            'VARCHAR(10) agar lebih fleksibel',
            'Tipe berbeda membuat DBMS menolak kunci tamu.',
          ],
          [
            'b',
            'Bebas, asal namanya sama',
            'Nama boleh berbeda; yang wajib sama justru tipe datanya.',
          ],
          [
            'c',
            'INT, sama dengan kolom yang dirujuk',
            'Tepat: kunci tamu dan kunci primer rujukannya harus bertipe sama.',
          ],
          [
            'd',
            'DECIMAL agar muat angka besar',
            'Tipe harus sama persis dengan kolom yang dirujuk, yaitu INT.',
          ],
        ]
      ),
    ],
  },

  basisData: {
    kicker: 'Tahap 5 · Membimbing Penyelidikan',
    title: 'Menyiapkan Wadah: CREATE DATABASE dan USE',
    goal: 'Menyelidiki perilaku CREATE DATABASE dan USE, lalu menulis sendiri perintah untuk basis data bank_sampah.',
    guru: 'Biarkan tim menjalankan konsol langkah demi langkah dan berdebat mengapa langkah tertentu ditolak. Penguji membacakan pesan DBMS keras-keras. Setelah pertanyaan penuntun, Penulis Skrip mengetik perintah sendiri — jangan didikte.',
    pengantar:
      'Di konsol latihan berikut ada langkah yang <strong>sengaja ditolak</strong> DBMS. Jalankan satu per satu dan baca pesannya: kapan tabel boleh dibuat?',
    langkah: [
      {
        id: 'l1',
        sql: SQL_NASABAH_MINI,
        amati: 'Ditolak! Tabel ini akan disimpan di basis data yang mana?',
      },
      {
        id: 'l2',
        sql: 'CREATE DATABASE latihan;',
        amati: 'Basis data latihan muncul di panel DBMS, tetapi belum aktif.',
      },
      {
        id: 'l3',
        sql: SQL_NASABAH_MINI,
        amati: 'Masih ditolak, padahal basis datanya sudah ada. Apa yang kurang?',
      },
      {
        id: 'l4',
        sql: 'USE latihan;',
        amati: 'Basis data latihan sekarang aktif (dicetak tebal).',
      },
      {
        id: 'l5',
        sql: SQL_NASABAH_MINI,
        amati: 'Berhasil! Tabel dibuat di basis data yang aktif.',
      },
      {
        id: 'l6',
        sql: 'CREATE DATABASE latihan;',
        amati: 'Ditolak: nama basis data tidak boleh kembar.',
      },
      {
        id: 'l7',
        sql: 'CREATE DATABASE IF NOT EXISTS latihan;',
        amati: 'Tidak galat — perintah dilewati karena basis datanya sudah ada.',
      },
    ],
    pertanyaan: [
      soalPilih('bd1', 'Mengapa langkah 1 ditolak DBMS?', 'b', [
        [
          'a',
          'Nama tabel nasabah tidak boleh dipakai',
          'Nama nasabah sah — di langkah 5 perintah yang sama berhasil.',
        ],
        [
          'b',
          'Belum ada basis data yang dipilih sebagai tempat tabel',
          'Tepat: tabel selalu dibuat di dalam basis data yang sedang aktif.',
        ],
        [
          'c',
          'Tipe INT tidak boleh menjadi kunci primer',
          'INT justru lazim dipakai untuk kunci primer.',
        ],
        [
          'd',
          'CREATE TABLE harus ditulis huruf kecil',
          'Kata kunci SQL tidak membedakan huruf besar-kecil.',
        ],
      ]),
      soalPilih(
        'bd2',
        'Langkah 2 berhasil membuat basis data latihan, tetapi langkah 3 tetap ditolak. Kesimpulannya …',
        'c',
        [
          [
            'a',
            'CREATE DATABASE gagal tanpa pesan galat',
            'Panel DBMS menunjukkan basis data latihan sudah ada, jadi langkah 2 berhasil.',
          ],
          [
            'b',
            'Tabel hanya bisa dibuat sekali seumur DBMS',
            'Langkah 5 membuktikan tabel bisa dibuat.',
          ],
          [
            'c',
            'Membuat basis data tidak otomatis memilihnya; perlu USE',
            'Benar: setelah CREATE DATABASE, jalankan USE agar basis data itu aktif.',
          ],
          [
            'd',
            'Perlu menunggu beberapa detik sebelum membuat tabel',
            'DBMS tidak butuh jeda; yang kurang adalah USE.',
          ],
        ]
      ),
      soalPilih('bd3', 'Apa fungsi <code>IF NOT EXISTS</code> pada langkah 7?', 'a', [
        [
          'a',
          'Membuat basis data hanya bila belum ada, tanpa galat bila sudah ada',
          'Tepat — berguna agar skrip aman dijalankan ulang.',
        ],
        [
          'b',
          'Menghapus basis data lama lalu membuat yang baru',
          'Itu tugas DROP DATABASE; IF NOT EXISTS tidak menghapus apa pun.',
        ],
        ['c', 'Mengganti nama basis data yang kembar', 'Nama tetap; perintah hanya dilewati.'],
        [
          'd',
          'Memilih basis data seperti USE',
          'IF NOT EXISTS tidak mengaktifkan basis data — tetap perlu USE.',
        ],
      ]),
    ],
    editor: {
      judul: '✍️ Giliranmu: siapkan basis data Bank Sampah',
      tugas:
        'Tulis perintah untuk <strong>membuat</strong> basis data sesuai nama di rancangan, lalu <strong>memilihnya</strong>. DBMS dimulai dalam keadaan kosong.',
      label: 'Skrip basis data bank_sampah',
      placeholder: '-- tulis dua perintah di sini, masing-masing diakhiri ;',
      kerangka: '-- 1) buat basis data sesuai nama di kamus data\n\n-- 2) pilih basis data itu\n',
      petunjuk: [
        'Nama basis data ada di atas kamus data: <code>bank_sampah</code>.',
        'Pola perintahnya: <code>CREATE DATABASE nama;</code> lalu <code>USE nama;</code>',
      ],
      sukses:
        '<strong>Basis data bank_sampah siap dan aktif!</strong> Pesan pertama di log aplikasi sudah teratasi. Sekarang wadah itu butuh tabel.',
    },
  },

  tabelInduk: {
    kicker: 'Tahap 6 · Membimbing Penyelidikan',
    title: 'Membuat Tabel Induk dengan CREATE TABLE',
    goal: 'Menulis CREATE TABLE lengkap dengan tipe data, NOT NULL, dan PRIMARY KEY sesuai kamus data.',
    guru: 'Tabel jenis_sampah dikerjakan bersama sebagai contoh terbimbing (isian rumpang). Untuk nasabah dan petugas, Pembaca Rancangan membacakan kamus data baris demi baris sementara Penulis Skrip mengetik. Bila tim buntu lebih dari 3 menit, arahkan ke petunjuk bertingkat, bukan ke jawaban.',
    rumpangPengantar:
      'Mulai dari tabel induk paling sederhana: <code>jenis_sampah</code>. Lengkapi empat bagian yang kosong berdasarkan kamus data di atas.',
    rumpangSql: RUMPANG_JENIS,
    isian: { r1: 'CHAR(4)', r2: 'NOT NULL', r3: 'INT', r4: 'PRIMARY KEY' },
    rumpang: [
      soalPilih('r1', 'Isian ① — tipe data <code>kode_jenis</code>:', 'b', [
        ['a', '<code>INT</code>', 'Kode PL01 berisi huruf; INT hanya menyimpan bilangan.'],
        ['b', '<code>CHAR(4)</code>', 'Tepat: kode selalu tepat 4 karakter.'],
        [
          'c',
          '<code>VARCHAR</code>',
          'Kamus data menulis CHAR(4); lagi pula VARCHAR wajib diberi panjang.',
        ],
        ['d', '<code>DATE</code>', 'DATE untuk tanggal, bukan kode.'],
      ]),
      soalPilih('r2', 'Isian ② — aturan <code>nama_jenis</code> yang wajib diisi:', 'c', [
        [
          'a',
          '<code>PRIMARY KEY</code>',
          'Kunci primer tabel ini adalah kode_jenis, bukan nama_jenis.',
        ],
        ['b', '<code>NULL</code>', 'NULL berarti boleh kosong — kebalikan dari wajib.'],
        ['c', '<code>NOT NULL</code>', 'Tepat: wajib diisi → NOT NULL.'],
        ['d', '<code>UNIQUE</code>', 'UNIQUE melarang nilai kembar, bukan memaksa kolom terisi.'],
      ]),
      soalPilih('r3', 'Isian ③ — tipe data <code>harga_per_kg</code> (rupiah tanpa sen):', 'a', [
        ['a', '<code>INT</code>', 'Tepat: bilangan bulat.'],
        [
          'b',
          '<code>VARCHAR(10)</code>',
          'Harga akan dihitung (dikali berat); simpan sebagai angka, bukan teks.',
        ],
        ['c', '<code>CHAR(4)</code>', 'CHAR untuk teks berpanjang tetap, bukan nilai uang.'],
        ['d', '<code>DATE</code>', 'DATE untuk tanggal, bukan harga.'],
      ]),
      soalPilih('r4', 'Isian ④ — baris penutup yang menjadikan kode_jenis kunci primer:', 'd', [
        [
          'a',
          '<code>FOREIGN KEY</code>',
          'Kunci tamu merujuk tabel lain; kode_jenis adalah penanda tabel ini sendiri.',
        ],
        [
          'b',
          '<code>NOT NULL</code>',
          'NOT NULL hanya memaksa kolom terisi, tidak menjadikannya kunci.',
        ],
        [
          'c',
          '<code>UNIQUE KEY</code>',
          'Kamus data menandai kode_jenis 🔑 kunci primer, bukan sekadar unik.',
        ],
        ['d', '<code>PRIMARY KEY</code>', 'Tepat: PRIMARY KEY (kode_jenis).'],
      ]),
    ],
    rumpangSukses:
      'Pernyataan <code>jenis_sampah</code> lengkap dan langsung dijalankan di basis data timmu. Sekarang tulis sendiri dua tabel induk berikutnya.',
    editor: {
      judul: '✍️ Giliranmu: tabel nasabah dan petugas',
      tugas:
        'Tulis <strong>dua</strong> pernyataan CREATE TABLE untuk <code>nasabah</code> dan <code>petugas</code> persis sesuai kamus data: nama kolom, tipe data, NOT NULL untuk kolom wajib, dan PRIMARY KEY. Basis data bank_sampah sudah aktif dan sudah berisi tabel jenis_sampah.',
      label: 'Skrip tabel nasabah & petugas',
      placeholder: 'CREATE TABLE nasabah (\n  …\n);',
      kerangka:
        'CREATE TABLE nasabah (\n  -- satu baris per kolom: nama_kolom TIPE [NOT NULL],\n  -- baris terakhir: PRIMARY KEY (kolom_kunci)\n);\n\nCREATE TABLE petugas (\n  -- …\n);\n',
      petunjuk: [
        'Tabel <code>nasabah</code> punya 4 kolom dan <code>petugas</code> 2 kolom. Kolom bertanda "Wajib diisi" diberi <code>NOT NULL</code>; <code>no_hp</code> boleh kosong.',
        'Contoh baris kolom: <code>nama_nasabah VARCHAR(50) NOT NULL,</code> — jangan lupa koma di akhir setiap baris kecuali baris terakhir.',
        'Kerangka lengkap petugas:<br /><code>CREATE TABLE petugas (<br />&nbsp;&nbsp;id_petugas INT,<br />&nbsp;&nbsp;nama_petugas VARCHAR(50) NOT NULL,<br />&nbsp;&nbsp;PRIMARY KEY (id_petugas)<br />);</code>',
      ],
      sukses:
        '<strong>Tiga tabel induk berdiri!</strong> nasabah dan petugas sesuai kamus data. Tinggal tabel yang paling penting: setoran.',
    },
  },

  /* ==========================================================
     SINTAKS 4 — Mengembangkan & menyajikan hasil karya
     ========================================================== */
  tabelAnak: {
    kicker: 'Tahap 7 · Mengembangkan Hasil Karya',
    title: 'Tabel Berelasi: setoran dan FOREIGN KEY',
    goal: 'Menentukan urutan pembuatan tabel dan menulis CREATE TABLE berkunci tamu sesuai rancangan.',
    guru: 'Tanyakan: "Mengapa setoran tidak bisa dibuat pertama?" sebelum murid mengurutkan. Saat menulis setoran, minta Penguji mengecek tiga kunci tamu satu per satu di kamus data. Galat "tabel rujukan belum ada" atau "tipe berbeda" adalah bahan diskusi yang berharga.',
    urutan: {
      pengantar:
        'Andaikan seluruh skrip ditulis ulang dari nol. Susun urutan CREATE TABLE yang <strong>pasti diterima</strong> DBMS.',
      sukses:
        '<strong>Urutan sah!</strong> Tabel induk (nasabah, jenis_sampah, petugas) bebas urutannya, tetapi setoran harus terakhir karena merujuk ketiganya.',
      salah:
        'Periksa tabel yang memiliki kunci tamu 🔗: tabel yang dirujuknya harus sudah dibuat lebih dulu.',
    },
    pertanyaan: [
      soalPilih(
        'a1',
        'Baris <code>FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah)</code> berarti …',
        'b',
        [
          [
            'a',
            'Membuat tabel nasabah baru',
            'REFERENCES hanya menunjuk tabel yang sudah ada, tidak membuatnya.',
          ],
          [
            'b',
            'Kolom id_nasabah di setoran hanya boleh berisi id yang ada di tabel nasabah',
            'Tepat: kunci tamu menjaga setiap setoran milik nasabah yang terdaftar.',
          ],
          [
            'c',
            'id_nasabah menjadi kunci primer tabel setoran',
            'Kunci primer setoran adalah no_setoran.',
          ],
          [
            'd',
            'Menyalin semua kolom nasabah ke setoran',
            'Hanya satu kolom (id_nasabah) yang menghubungkan kedua tabel.',
          ],
        ]
      ),
      soalPilih(
        'a2',
        'Kamus data: <code>kode_jenis</code> di setoran bertipe CHAR(4) dan merujuk jenis_sampah. Bila ditulis <code>kode_jenis INT</code>, apa yang terjadi?',
        'd',
        [
          [
            'a',
            'Diterima, DBMS mengubah tipenya otomatis',
            'Simulator (dan DBMS sungguhan) tidak menebak maksudmu.',
          ],
          [
            'b',
            'Diterima, tetapi kodenya jadi angka',
            'Kunci tamu bertipe beda dengan rujukannya ditolak sejak awal.',
          ],
          [
            'c',
            'Tabel jenis_sampah ikut berubah menjadi INT',
            'CREATE TABLE tidak pernah mengubah tabel lain.',
          ],
          [
            'd',
            'Ditolak, karena tipe kunci tamu harus sama dengan kolom yang dirujuk',
            'Tepat — samakan dengan CHAR(4).',
          ],
        ]
      ),
    ],
    editor: {
      judul: '✍️ Giliranmu: tabel setoran',
      tugas:
        'Tulis CREATE TABLE <code>setoran</code> sesuai kamus data, termasuk <strong>tiga</strong> FOREIGN KEY. Tabel nasabah, jenis_sampah, dan petugas sudah ada di DBMS timmu.',
      label: 'Skrip tabel setoran',
      placeholder: 'CREATE TABLE setoran (\n  …\n);',
      kerangka:
        'CREATE TABLE setoran (\n  -- enam kolom: nama_kolom TIPE [NOT NULL],\n  -- PRIMARY KEY (…),\n  -- FOREIGN KEY (kolom) REFERENCES tabel_induk(kolom)\n);\n',
      petunjuk: [
        'Enam kolom: no_setoran, tgl_setor, id_nasabah, kode_jenis, id_petugas, berat_kg. Semua kecuali kunci primer bertanda "Wajib diisi".',
        'Tipe kunci tamu harus sama dengan kolom rujukannya: id_nasabah INT, kode_jenis CHAR(4), id_petugas INT. Berat memakai <code>DECIMAL(5,2)</code>.',
        'Tiga baris terakhir:<br /><code>FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah),<br />FOREIGN KEY (kode_jenis) REFERENCES jenis_sampah(kode_jenis),<br />FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas)</code>',
      ],
      sukses:
        '<strong>Tabel setoran berdiri dengan tiga kunci tamu!</strong> Semua tabel rancangan sudah dibuat. Saatnya membuktikan hasil kerja tim.',
    },
  },

  sajikan: {
    kicker: 'Tahap 8 · Menyajikan Hasil Karya',
    title: 'Sajikan Bukti ke Klien',
    goal: 'Menjalankan skrip tim dari DBMS kosong, membandingkannya dengan kamus data, dan menyusun klaim presentasi berbasis bukti.',
    guru: 'Setiap tim menayangkan skripnya dan menjalankannya dari DBMS kosong di depan kelas. Ketua menyampaikan klaim, Penguji menunjukkan buktinya di panel DBMS. Tim lain boleh bertanya "Di mana buktinya?" untuk setiap klaim.',
    pengantar:
      'Ini <strong>skrip tim</strong> gabungan dari semua yang kalian tulis. Jalankan dari DBMS yang benar-benar kosong — seperti saat dipasang di laptop pos Bank Sampah.',
    lulus:
      '<strong>Skrip tim lolos uji!</strong> Basis data bank_sampah dan keempat tabelnya sesuai kamus data. Aplikasi Bank Sampah kini punya wadah untuk menyimpan setoran.',
    klaim: {
      tanya:
        'Pilih SEMUA klaim yang <strong>didukung bukti</strong> di panel DBMS untuk presentasi ke Bu Rina.',
      opsi: [
        {
          id: 'empat',
          label: 'Basis data bank_sampah berisi empat tabel sesuai kamus data',
          benar: true,
          alasan: 'Panel DBMS menampilkan nasabah, jenis_sampah, petugas, dan setoran.',
        },
        {
          id: 'pk',
          label: 'Setiap tabel memiliki kunci primer 🔑',
          benar: true,
          alasan: 'Setiap kartu tabel menandai satu kolom 🔑.',
        },
        {
          id: 'fk',
          label: 'Setoran terhubung ke nasabah, jenis_sampah, dan petugas lewat kunci tamu',
          benar: true,
          alasan: 'Tiga kolom setoran bertanda 🔗 dengan rujukan ke ketiga tabel induk.',
        },
        {
          id: 'isi',
          label: 'Tabel-tabel sudah berisi data setoran siswa',
          benar: false,
          alasan:
            'Setiap tabel masih 0 baris. CREATE hanya membangun struktur; isinya diisi dengan INSERT (DML).',
        },
        {
          id: 'bebas',
          label: 'Urutan CREATE TABLE bebas, DBMS selalu menerima',
          benar: false,
          alasan: 'Setoran ditolak bila dibuat sebelum tabel yang dirujuknya.',
        },
        {
          id: 'hp',
          label: 'Kolom no_hp wajib diisi',
          benar: false,
          alasan: 'no_hp sengaja dibuat tanpa NOT NULL karena tidak semua siswa punya HP.',
        },
      ],
      done: '<strong>Klaim presentasi kuat!</strong> Setiap klaim dapat ditunjuk buktinya di DBMS.',
    },
  },

  /* ==========================================================
     SINTAKS 5 — Menganalisis & mengevaluasi
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 9 · Evaluasi',
    title: 'Kasus Baru: Servis Laptop TEFA',
    goal: 'Menerapkan CREATE DATABASE dan CREATE TABLE pada rancangan baru dan mengevaluasi skrip tim lain.',
    guru: 'Kuis dikerjakan individu dan hanya sekali jawab. Uji silang dikerjakan berpasangan: minta murid menjalankan skrip Tim Biru, lalu memperbaiki kesalahannya satu per satu secara lisan sebelum memilih jawaban.',
    pengantarKuis:
      'Teaching Factory RPL juga melayani servis laptop. Rancangan hasil normalisasi di MPI 1.4 sudah menjadi kamus data berikut. Jawab setiap soal — <strong>hanya satu kesempatan</strong>.',
    kamusJudul: 'Kamus data Servis Laptop TEFA',
    soal: [
      soalPilih('e1', 'Perintah pertama yang harus dijalankan untuk kasus ini adalah …', 'c', [
        ['a', '<code>USE tefa_servis;</code>', 'USE gagal bila basis datanya belum dibuat.'],
        [
          'b',
          '<code>CREATE TABLE servis (…);</code>',
          'Belum ada basis data yang aktif untuk menampung tabel.',
        ],
        [
          'c',
          '<code>CREATE DATABASE tefa_servis;</code>',
          'Benar: wadahnya dibuat lebih dulu, lalu dipilih dengan USE.',
        ],
        [
          'd',
          '<code>INSERT INTO servis …;</code>',
          'INSERT mengisi data, padahal tabelnya pun belum ada.',
        ],
      ]),
      soalPilih('e2', 'Definisi kolom <code>biaya</code> yang sesuai kamus data adalah …', 'b', [
        [
          'a',
          '<code>biaya INT NOT NULL</code>',
          'Kamus data menetapkan DECIMAL(10,2) agar bisa menyimpan nilai berkoma.',
        ],
        [
          'b',
          '<code>biaya DECIMAL(10,2) NOT NULL</code>',
          'Benar: tipe dan aturan wajib sesuai kamus data.',
        ],
        ['c', '<code>biaya DECIMAL(10,2)</code>', 'Biaya wajib diisi — NOT NULL tertinggal.'],
        [
          'd',
          '<code>biaya VARCHAR(10) NOT NULL</code>',
          'Biaya akan dihitung; jangan disimpan sebagai teks.',
        ],
      ]),
      soalPilih('e3', 'Tabel mana yang harus dibuat paling akhir?', 'd', [
        [
          'a',
          '<code>pelanggan</code>',
          'pelanggan tidak merujuk tabel lain, jadi bisa dibuat lebih dulu.',
        ],
        ['b', '<code>servis</code>', 'servis masih dirujuk oleh detail_servis.'],
        ['c', '<code>layanan</code>', 'layanan adalah tabel induk tanpa kunci tamu.'],
        [
          'd',
          '<code>detail_servis</code>',
          'Benar: ia merujuk servis dan layanan, dan servis sendiri merujuk pelanggan & teknisi.',
        ],
      ]),
      soalPilih(
        'e4',
        'Baris kunci tamu yang benar di tabel servis untuk kolom kode_tek adalah …',
        'a',
        [
          [
            'a',
            '<code>FOREIGN KEY (kode_tek) REFERENCES teknisi(kode_tek)</code>',
            'Benar: kolom di tabel ini, lalu tabel dan kolom rujukannya.',
          ],
          [
            'b',
            '<code>FOREIGN KEY teknisi(kode_tek) REFERENCES (kode_tek)</code>',
            'Posisinya tertukar: kolom lokal di FOREIGN KEY, rujukan di REFERENCES.',
          ],
          [
            'c',
            '<code>PRIMARY KEY (kode_tek) REFERENCES teknisi</code>',
            'kode_tek bukan kunci primer servis, dan REFERENCES milik FOREIGN KEY.',
          ],
          [
            'd',
            '<code>REFERENCES teknisi(kode_tek) FOREIGN KEY</code>',
            'Urutan kata kunci terbalik.',
          ],
        ]
      ),
      soalPilih(
        'e5',
        'Kunci primer <code>detail_servis</code> adalah gabungan no_servis dan kode_lay. Penulisannya …',
        'c',
        [
          [
            'a',
            '<code>PRIMARY KEY (no_servis), PRIMARY KEY (kode_lay)</code>',
            'Satu tabel hanya punya satu PRIMARY KEY; gabungkan kolomnya.',
          ],
          [
            'b',
            '<code>PRIMARY KEY no_servis + kode_lay</code>',
            'Daftar kolom ditulis di dalam kurung, dipisah koma.',
          ],
          [
            'c',
            '<code>PRIMARY KEY (no_servis, kode_lay)</code>',
            'Benar: kunci gabungan ditulis dalam satu PRIMARY KEY.',
          ],
          [
            'd',
            '<code>PRIMARY KEY (detail_servis)</code>',
            'Yang ditulis adalah nama kolom, bukan nama tabel.',
          ],
        ]
      ),
      soalPilih(
        'e6',
        'Saat menjalankan CREATE TABLE, DBMS menjawab "Belum ada basis data yang dipilih". Perbaikannya …',
        'b',
        [
          ['a', 'Mengganti nama tabel', 'Masalahnya bukan nama tabel.'],
          [
            'b',
            'Menjalankan <code>USE tefa_servis;</code> sebelum CREATE TABLE',
            'Benar: pilih basis datanya lebih dulu.',
          ],
          [
            'c',
            'Menghapus semua NOT NULL',
            'Constraint tidak berhubungan dengan basis data aktif.',
          ],
          ['d', 'Menjalankan CREATE TABLE dua kali', 'Hasilnya tetap sama selama belum ada USE.'],
        ]
      ),
    ],
    ujiSilang: {
      judul: 'Skrip Tim Biru',
      pengantar:
        'Tim Biru mengklaim skrip berikut membangun sebagian basis data servis laptop. Jalankan skripnya, baca pesan DBMS, lalu telusuri: kesalahan apa saja yang ada di skrip itu (termasuk yang belum terlihat karena DBMS berhenti di galat pertama)?',
      tanya: 'Pilih SEMUA kesalahan dalam skrip Tim Biru.',
      opsi: [
        {
          id: 'use',
          label: 'Tidak ada <code>USE tefa_servis;</code> setelah CREATE DATABASE',
          benar: true,
          alasan: 'Inilah galat pertama: tabel tidak tahu harus dibuat di basis data mana.',
        },
        {
          id: 'urutan',
          label: 'Tabel servis dibuat sebelum pelanggan dan teknisi yang dirujuknya',
          benar: true,
          alasan: 'Setelah USE ditambahkan, DBMS menolak kunci tamu ke tabel yang belum ada.',
        },
        {
          id: 'varchar',
          label: '<code>nama_plg VARCHAR</code> tidak diberi panjang',
          benar: true,
          alasan: 'VARCHAR wajib diberi panjang sesuai kamus data: VARCHAR(50).',
        },
        {
          id: 'akhir',
          label: 'PRIMARY KEY tidak boleh ditulis di baris akhir',
          benar: false,
          alasan:
            'Menulis PRIMARY KEY (kolom) di akhir daftar kolom justru cara yang sah dan rapi.',
        },
        {
          id: 'kapital',
          label: 'Kata kunci SQL harus ditulis huruf kecil',
          benar: false,
          alasan: 'Kata kunci SQL tidak membedakan huruf besar dan kecil.',
        },
        {
          id: 'tanggal',
          label: '<code>tgl_masuk</code> seharusnya bertipe INT',
          benar: false,
          alasan: 'Tanggal disimpan dengan DATE, sesuai kamus data.',
        },
      ],
      skrip: SKRIP_TIM_BIRU,
      done: '<strong>Uji silang tuntas!</strong> Kamu menemukan galat yang terlihat dan yang tersembunyi di balik galat pertama.',
    },
  },

  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Refleksi Pemecahan Masalah',
    goal: 'Menilai kemampuan diri dan proses tim dalam membangun basis data dari rancangan.',
    guru: 'Beri 5 menit refleksi mandiri. Baca jawaban terbuka untuk menemukan galat yang paling sering muncul (biasanya lupa USE, lupa koma, atau tipe kunci tamu berbeda) sebagai bahan pertemuan berikutnya: ALTER TABLE dan DML.',
    skala: [
      { value: 1, label: 'Belum bisa' },
      { value: 2, label: 'Masih ragu' },
      { value: 3, label: 'Cukup bisa' },
      { value: 4, label: 'Bisa' },
      { value: 5, label: 'Sangat bisa' },
    ],
    pernyataan: [
      { id: 'p1', teks: 'Aku bisa membaca kamus data: tabel, kolom, tipe data, dan kunci.' },
      { id: 'p2', teks: 'Aku bisa menulis CREATE DATABASE dan USE tanpa melihat contoh.' },
      {
        id: 'p3',
        teks: 'Aku bisa menulis CREATE TABLE dengan tipe data, NOT NULL, dan PRIMARY KEY.',
      },
      { id: 'p4', teks: 'Aku bisa menulis FOREIGN KEY dan menentukan urutan pembuatan tabel.' },
      { id: 'p5', teks: 'Aku bisa membaca pesan galat DBMS lalu memperbaiki skripku sendiri.' },
    ],
    tanyaTerbuka:
      'Galat apa yang paling sering kamu temui hari ini, dan bagaimana kamu memperbaikinya?',
  },

  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Bank Sampah Siap Mencatat Setoran!',
    goal: 'Melihat rekap skor dan skrip DDL hasil kerja tim.',
    pesan:
      'Aplikasi Bank Sampah kini terhubung ke basis data bank_sampah yang sesuai rancangan. Pertemuan berikutnya: mengubah struktur dengan ALTER TABLE dan mengisi data dengan DML.',
    rangkuman: [
      '<code>CREATE DATABASE nama;</code> membuat wadah; <code>USE nama;</code> memilihnya sebelum membuat tabel.',
      '<code>CREATE TABLE nama ( … );</code> berisi definisi kolom <em>nama TIPE [NOT NULL]</em> yang dipisah koma.',
      'Terjemahan kamus data: tipe → INT, DECIMAL(p,s), VARCHAR(n), CHAR(n), DATE; wajib diisi → NOT NULL; 🔑 → PRIMARY KEY; 🔗 → FOREIGN KEY … REFERENCES.',
      'Tabel induk dibuat lebih dulu; kunci tamu harus bertipe sama dengan kolom yang dirujuk.',
      'Pesan galat DBMS adalah petunjuk: baca, temukan barisnya, perbaiki, jalankan lagi.',
    ],
  },
};

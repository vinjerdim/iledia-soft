'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Perintah SQL DDL untuk Membangun
   Basis Data dari ERD
   Fase F — SMK Rekayasa Perangkat Lunak, Inquiry Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js (seksi 15 ERD lengkap, seksi 17 SQL DDL).
   Guru dapat menyunting teks, soal, kunci, dan umpan balik di
   sini tanpa menyentuh kode.

   Fenomena: ERD Perpustakaan Sekolah sudah disetujui, tetapi DBMS
   masih kosong. Murid menyelidiki SENDIRI perintah apa yang
   membangun struktur basis data: merumuskan masalah, menebak
   (hipotesis), bereksperimen di konsol DBMS tiruan, menurunkan
   struktur tabel dari ERD, menguji skripnya, lalu menyimpulkan.
   Kasus transfer pada evaluasi: ERD Lab RPL dari MPI 1.3.

   Pemetaan sintaks Inquiry Learning → tahap media:
     1. Orientasi              → orientasi    (TP, alur, apersepsi)
     2. Merumuskan masalah     → masalah      (ERD vs DBMS kosong,
                                               pertanyaan penyelidikan,
                                               rumusan masalah)
     3. Merumuskan hipotesis   → hipotesis    (tebak efek perintah,
                                               jumlah tabel, urutan, FK)
     4. Mengumpulkan data      → eksperimen   (konsol DDL berlangkah +
                                               coba sendiri)
                               → konsep       (kartu konsep, pilah
                                               DDL/DML/DCL & fungsi)
                               → identifikasi (struktur dari ERD: peran
                                               kolom & tipe data)
                               → rakit        (urutan CREATE TABLE &
                                               melengkapi pernyataan)
     5. Menguji hipotesis      → uji          (jalankan skrip, periksa
                                               terhadap ERD, hipotesis
                                               vs bukti)
     6. Merumuskan kesimpulan  → kesimpulan   (kesimpulan rumpang)
                               → evaluasi     (kasus Lab RPL + periksa
                                               skrip tim lain)
                               → refleksi
     Penutup                   → selesai

   KONVENSI: ERD memakai format engine seksi 15 dengan tambahan
   `tipe` dan `wajib` per atribut serta `tabel` per entitas (seksi
   17). Kunci identifikasi, urutan, soal, dan hasil eksperimen
   diuji otomatis terhadap engine (tests/mpi-f-2.1-data.test.js).

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

/* ---------- Studi kasus utama: Perpustakaan Sekolah ---------- */

var ENT_PERPUS = {
  kategori: { id: 'kategori', label: 'Kategori', ikon: '🗂️' },
  buku: { id: 'buku', label: 'Buku', ikon: '📘' },
  anggota: { id: 'anggota', label: 'Anggota', ikon: '🧑‍🎓' },
  pinjam: { id: 'pinjam', label: 'Peminjaman', ikon: '📋' },
  detail: { id: 'detail', label: 'Detail Pinjam', ikon: '🧾' },
};

var ERD_PERPUS = {
  entitas: [
    {
      id: 'kategori',
      tabel: 'kategori',
      label: 'Kategori',
      ikon: '🗂️',
      atribut: [
        { id: 'k_id', teks: 'id_kategori', pk: true, tipe: 'INT' },
        { id: 'k_nama', teks: 'nama_kategori', tipe: 'VARCHAR(30)', wajib: true },
      ],
    },
    {
      id: 'buku',
      tabel: 'buku',
      label: 'Buku',
      ikon: '📘',
      atribut: [
        { id: 'b_kode', teks: 'kode_buku', pk: true, tipe: 'VARCHAR(10)' },
        { id: 'b_judul', teks: 'judul', tipe: 'VARCHAR(100)', wajib: true },
        { id: 'b_penulis', teks: 'penulis', tipe: 'VARCHAR(50)' },
        { id: 'b_stok', teks: 'stok', tipe: 'INT', wajib: true },
        { id: 'b_kat', teks: 'id_kategori', fk: 'kategori', tipe: 'INT', wajib: true },
      ],
    },
    {
      id: 'anggota',
      tabel: 'anggota',
      label: 'Anggota',
      ikon: '🧑‍🎓',
      atribut: [
        { id: 'a_nis', teks: 'nis', pk: true, tipe: 'VARCHAR(10)' },
        { id: 'a_nama', teks: 'nama_anggota', tipe: 'VARCHAR(50)', wajib: true },
        { id: 'a_kelas', teks: 'kelas', tipe: 'VARCHAR(10)' },
      ],
    },
    {
      id: 'pinjam',
      tabel: 'peminjaman',
      label: 'Peminjaman',
      ikon: '📋',
      atribut: [
        { id: 'p_id', teks: 'id_pinjam', pk: true, tipe: 'INT' },
        { id: 'p_tgl', teks: 'tgl_pinjam', tipe: 'DATE', wajib: true },
        { id: 'p_kembali', teks: 'tgl_kembali', tipe: 'DATE' },
        { id: 'p_denda', teks: 'denda', tipe: 'DECIMAL(8,2)' },
        { id: 'p_nis', teks: 'nis', fk: 'anggota', tipe: 'VARCHAR(10)', wajib: true },
      ],
    },
    {
      id: 'detail',
      tabel: 'detail_pinjam',
      label: 'Detail Pinjam',
      ikon: '🧾',
      penghubung: true,
      atribut: [
        { id: 'd_pinjam', teks: 'id_pinjam', pk: true, fk: 'pinjam', tipe: 'INT' },
        { id: 'd_buku', teks: 'kode_buku', pk: true, fk: 'buku', tipe: 'VARCHAR(10)' },
        { id: 'd_jumlah', teks: 'jumlah', tipe: 'INT', wajib: true },
      ],
    },
  ],
  relasi: [
    {
      id: 'rKelompok',
      a: ENT_PERPUS.kategori,
      b: ENT_PERPUS.buku,
      kerja: 'mengelompokkan',
      kerjaBalik: 'termasuk dalam',
      aturan: 'Satu kategori berisi banyak buku; setiap buku masuk tepat satu kategori.',
      ab: '0..N',
      ba: '1..1',
      jenis: '1:N',
    },
    {
      id: 'rLakukan',
      a: ENT_PERPUS.anggota,
      b: ENT_PERPUS.pinjam,
      kerja: 'melakukan',
      kerjaBalik: 'dilakukan oleh',
      aturan:
        'Anggota boleh belum pernah meminjam; setiap peminjaman atas nama tepat satu anggota.',
      ab: '0..N',
      ba: '1..1',
      jenis: '1:N',
    },
    {
      id: 'rMuat',
      a: ENT_PERPUS.pinjam,
      b: ENT_PERPUS.buku,
      kerja: 'memuat',
      kerjaBalik: 'dimuat dalam',
      aturan:
        'Satu peminjaman memuat satu buku atau lebih; satu buku bisa dipinjam pada banyak peminjaman.',
      ab: '1..N',
      ba: '0..N',
      jenis: 'M:N',
      penghubung: 'detail',
    },
  ],
};

/* ---------- Kasus transfer evaluasi: Lab RPL (MPI 1.3) ---------- */

var ENT_LAB = {
  siswa: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
  kategori: { id: 'kategori', label: 'Kategori Alat', ikon: '🗂️' },
  alat: { id: 'alat', label: 'Alat', ikon: '💻' },
  pinjam: { id: 'pinjam', label: 'Peminjaman', ikon: '📋' },
  detail: { id: 'detail', label: 'Detail Peminjaman', ikon: '🧾' },
};

var ERD_LAB = {
  entitas: [
    {
      id: 'siswa',
      tabel: 'siswa',
      label: 'Siswa',
      ikon: '🧑‍🎓',
      atribut: [
        { id: 's_nis', teks: 'nis', pk: true, tipe: 'VARCHAR(10)' },
        { id: 's_nama', teks: 'nama_siswa', tipe: 'VARCHAR(50)', wajib: true },
        { id: 's_kelas', teks: 'kelas', tipe: 'VARCHAR(10)' },
      ],
    },
    {
      id: 'kategori',
      tabel: 'kategori_alat',
      label: 'Kategori Alat',
      ikon: '🗂️',
      atribut: [
        { id: 'k_id', teks: 'id_kategori', pk: true, tipe: 'INT' },
        { id: 'k_nama', teks: 'nama_kategori', tipe: 'VARCHAR(30)', wajib: true },
      ],
    },
    {
      id: 'alat',
      tabel: 'alat',
      label: 'Alat',
      ikon: '💻',
      atribut: [
        { id: 'al_kode', teks: 'kode_alat', pk: true, tipe: 'VARCHAR(10)' },
        { id: 'al_nama', teks: 'nama_alat', tipe: 'VARCHAR(50)', wajib: true },
        { id: 'al_kat', teks: 'id_kategori', fk: 'kategori', tipe: 'INT', wajib: true },
      ],
    },
    {
      id: 'pinjam',
      tabel: 'peminjaman',
      label: 'Peminjaman',
      ikon: '📋',
      atribut: [
        { id: 'p_no', teks: 'no_pinjam', pk: true, tipe: 'INT' },
        { id: 'p_tgl', teks: 'tgl_pinjam', tipe: 'DATE', wajib: true },
        { id: 'p_nis', teks: 'nis', fk: 'siswa', tipe: 'VARCHAR(10)', wajib: true },
      ],
    },
    {
      id: 'detail',
      tabel: 'detail_peminjaman',
      label: 'Detail Peminjaman',
      ikon: '🧾',
      penghubung: true,
      atribut: [
        { id: 'd_no', teks: 'no_pinjam', pk: true, fk: 'pinjam', tipe: 'INT' },
        { id: 'd_alat', teks: 'kode_alat', pk: true, fk: 'alat', tipe: 'VARCHAR(10)' },
        { id: 'd_kondisi', teks: 'kondisi_kembali', tipe: 'VARCHAR(20)' },
      ],
    },
  ],
  relasi: [
    {
      id: 'rKelompok',
      a: ENT_LAB.kategori,
      b: ENT_LAB.alat,
      kerja: 'mengelompokkan',
      kerjaBalik: 'termasuk dalam',
      aturan: 'Satu kategori berisi banyak alat; setiap alat masuk tepat satu kategori.',
      ab: '1..N',
      ba: '1..1',
      jenis: '1:N',
    },
    {
      id: 'rLakukan',
      a: ENT_LAB.siswa,
      b: ENT_LAB.pinjam,
      kerja: 'melakukan',
      kerjaBalik: 'dilakukan oleh',
      aturan: 'Siswa boleh belum pernah meminjam; setiap peminjaman atas nama tepat satu siswa.',
      ab: '0..N',
      ba: '1..1',
      jenis: '1:N',
    },
    {
      id: 'rMuat',
      a: ENT_LAB.pinjam,
      b: ENT_LAB.alat,
      kerja: 'memuat',
      kerjaBalik: 'dimuat dalam',
      aturan: 'Satu peminjaman memuat satu alat atau lebih; satu alat bisa dipinjam berkali-kali.',
      ab: '1..N',
      ba: '0..N',
      jenis: 'M:N',
      penghubung: 'detail',
    },
  ],
};

/* Skrip Tim Biru untuk uji silang evaluasi (sengaja mengandung kesalahan). */
var SKRIP_TIM_BIRU =
  'CREATE DATABASE db_lab;\n' +
  'USE db_lab;\n\n' +
  'CREATE TABLE siswa (\n' +
  '  nis VARCHAR(10) NOT NULL,\n' +
  '  nama_siswa VARCHAR(50) NOT NULL,\n' +
  '  kelas VARCHAR(10),\n' +
  '  PRIMARY KEY (nis)\n' +
  ');\n\n' +
  'CREATE TABLE alat (\n' +
  '  kode_alat VARCHAR(10) NOT NULL,\n' +
  '  nama_alat VARCHAR(50) NOT NULL,\n' +
  '  id_kategori VARCHAR(5) NOT NULL,\n' +
  '  PRIMARY KEY (kode_alat),\n' +
  '  FOREIGN KEY (id_kategori) REFERENCES kategori_alat(id_kategori)\n' +
  ');\n\n' +
  'CREATE TABLE kategori_alat (\n' +
  '  id_kategori INT NOT NULL,\n' +
  '  nama_kategori VARCHAR(30) NOT NULL,\n' +
  '  PRIMARY KEY (id_kategori)\n' +
  ');\n\n' +
  'CREATE TABLE peminjaman (\n' +
  '  no_pinjam INT NOT NULL,\n' +
  '  tgl_pinjam DATE NOT NULL,\n' +
  '  nis VARCHAR(10) NOT NULL,\n' +
  '  PRIMARY KEY (no_pinjam),\n' +
  '  FOREIGN KEY (nis) REFERENCES siswa(nis)\n' +
  ');\n\n' +
  'CREATE TABLE detail_peminjaman (\n' +
  '  no_pinjam INT NOT NULL,\n' +
  '  kode_alat VARCHAR(10) NOT NULL,\n' +
  '  kondisi_kembali VARCHAR(20),\n' +
  '  PRIMARY KEY (no_pinjam),\n' +
  '  FOREIGN KEY (no_pinjam) REFERENCES peminjaman(no_pinjam),\n' +
  '  FOREIGN KEY (kode_alat) REFERENCES alat(kode_alat)\n' +
  ');';

/* Pernyataan CREATE TABLE detail_pinjam berumpang (__1__ … __4__)
   untuk tahap Rakit; isian benar ada di rakit.rumpang[i].isi. */
var RUMPANG_DETAIL =
  '__1__ TABLE detail_pinjam (\n' +
  '  id_pinjam INT NOT NULL,\n' +
  '  kode_buku __2__ NOT NULL,\n' +
  '  jumlah INT NOT NULL,\n' +
  '  __3__ (id_pinjam, kode_buku),\n' +
  '  FOREIGN KEY (id_pinjam) REFERENCES __4__,\n' +
  '  FOREIGN KEY (kode_buku) REFERENCES buku(kode_buku)\n' +
  ');';

var SQL_KATEGORI_SQL =
  'CREATE TABLE kategori (\n  id_kategori INT,\n  nama_kategori VARCHAR(30) NOT NULL,\n  PRIMARY KEY (id_kategori)\n);';

var SQL_PEMINJAMAN_LAB =
  'CREATE TABLE peminjaman (\n' +
  '  id_pinjam INT,\n' +
  '  tgl_pinjam DATE NOT NULL,\n' +
  '  nis VARCHAR(10) NOT NULL,\n' +
  '  PRIMARY KEY (id_pinjam),\n' +
  '  FOREIGN KEY (nis) REFERENCES anggota(nis)\n' +
  ');';

var DATA = {
  meta: {
    judul: 'Perintah SQL DDL untuk Membangun Basis Data dari ERD',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Inquiry Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Orientasi' },
    { id: 'masalah', label: 'Rumuskan Masalah', sintaks: 'Sintaks 2 · Merumuskan Masalah' },
    { id: 'hipotesis', label: 'Hipotesis', sintaks: 'Sintaks 3 · Merumuskan Hipotesis' },
    { id: 'eksperimen', label: 'Lab DDL', sintaks: 'Sintaks 4 · Mengumpulkan Data' },
    { id: 'konsep', label: 'Kartu Konsep', sintaks: 'Sintaks 4 · Mengumpulkan Data' },
    { id: 'identifikasi', label: 'Bedah ERD', sintaks: 'Sintaks 4 · Mengumpulkan Data' },
    { id: 'rakit', label: 'Rakit Skrip', sintaks: 'Sintaks 4 · Mengumpulkan Data' },
    { id: 'uji', label: 'Uji Hipotesis', sintaks: 'Sintaks 5 · Menguji Hipotesis' },
    { id: 'kesimpulan', label: 'Kesimpulan', sintaks: 'Sintaks 6 · Merumuskan Kesimpulan' },
    { id: 'evaluasi', label: 'Evaluasi', sintaks: 'Sintaks 6 · Merumuskan Kesimpulan' },
    { id: 'refleksi', label: 'Refleksi', sintaks: 'Sintaks 6 · Merumuskan Kesimpulan' },
    { id: 'selesai', label: 'Selesai', sintaks: '' },
  ],

  erd: ERD_PERPUS,
  erdLab: ERD_LAB,
  namaDb: 'db_perpus',

  /* ==========================================================
     SINTAKS 1 — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'ERD Sudah Jadi, DBMS Masih Kosong',
    goal: 'Mengetahui tujuan belajar, alur penyelidikan, dan cara memakai media ini.',
    guru: 'Ingatkan materi 1.3 (ERD lengkap) dan 1.4 (normalisasi): rancangan sudah siap, kini rancangan itu harus <em>diwujudkan</em> di DBMS. Jangan menjelaskan perintah SQL lebih dulu — biarkan murid menemukannya lewat penyelidikan. Tayangkan tahap ini di layar kelas dan minta murid menjawab pemanasan secara lisan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menjelaskan konsep dan fungsi perintah SQL DDL dalam pembuatan basis data serta mengidentifikasi struktur basis data berdasarkan rancangan ERD yang diberikan.',
    kriteria: [
      'Menjelaskan pengertian DDL dan membedakannya dari DML dan DCL.',
      'Menjelaskan fungsi perintah CREATE, ALTER, DROP, TRUNCATE, dan RENAME beserta akibatnya pada struktur dan isi basis data.',
      'Mengidentifikasi tabel, kolom, tipe data, kunci primer, dan kunci tamu dari rancangan ERD.',
      'Menentukan urutan pembuatan tabel sehingga setiap kunci tamu merujuk tabel yang sudah ada.',
      'Memeriksa skrip DDL tim lain dan menjelaskan kesalahannya berdasarkan ERD.',
    ],
    pengantar:
      'Bu Sari, pustakawan SMK, sudah menyetujui <strong>ERD Perpustakaan Sekolah</strong> rancangan tim RPL. Masalahnya, server sekolah baru berisi <strong>DBMS yang masih kosong</strong>: belum ada basis data, belum ada tabel. Timmu ditugasi menyelidiki cara "berbicara" dengan DBMS agar rancangan itu berubah menjadi struktur basis data sungguhan.',
    alur: [
      {
        judul: 'Rumuskan Masalah',
        desk: 'Bandingkan ERD dengan DBMS kosong, tentukan pertanyaan penyelidikan.',
      },
      { judul: 'Hipotesis', desk: 'Tebak fungsi perintah SQL dan struktur tabel sebelum mencoba.' },
      {
        judul: 'Lab DDL',
        desk: 'Jalankan perintah satu per satu di konsol DBMS dan amati hasilnya.',
      },
      { judul: 'Kartu Konsep', desk: 'Kumpulkan informasi DDL, tipe data, dan constraint.' },
      { judul: 'Bedah ERD', desk: 'Turunkan tabel, kolom, tipe data, PK, dan FK dari ERD.' },
      { judul: 'Rakit Skrip', desk: 'Susun urutan CREATE TABLE dan lengkapi pernyataannya.' },
      { judul: 'Uji Hipotesis', desk: 'Jalankan skrip, cocokkan dengan ERD dan dengan tebakanmu.' },
      { judul: 'Kesimpulan & Evaluasi', desk: 'Rumuskan kesimpulan lalu uji pada kasus Lab RPL.' },
    ],
    caraPakai: [
      'Ini media <strong>penyelidikan</strong>: tebak dulu, buktikan kemudian. Tebakan yang keliru justru bahan belajar.',
      'Pertanyaan boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama. Kuis evaluasi hanya bisa dijawab sekali.',
      'Urutan pilihan jawaban diacak, jadi hafalan posisi jawaban tidak membantu.',
      'Progres tersimpan otomatis di perangkat ini. Tombol Reset mengulang dari awal dan mengacak ulang pilihan.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: ERD Perpustakaan sudah disetujui. Menurutmu, apa langkah berikutnya agar data buku bisa disimpan di DBMS?',
      opsi: [
        { id: 'isi', label: 'Langsung mengetik data buku ke DBMS' },
        { id: 'struktur', label: 'Membuat basis data dan tabel sesuai ERD lebih dulu' },
        { id: 'gambar', label: 'Menggambar ulang ERD di aplikasi lain' },
        { id: 'cetak', label: 'Mencetak ERD lalu menyimpannya di map' },
      ],
      umpan:
        'Apa pun tebakanmu, simpan dulu. Data tidak bisa disimpan di DBMS sebelum ada <strong>wadahnya</strong>: basis data dan tabel dengan kolom yang jelas. Hari ini kalian menyelidiki perintah SQL apa yang membangun wadah itu.',
    },
  },

  /* ==========================================================
     SINTAKS 2 — Merumuskan masalah
     ========================================================== */
  masalah: {
    kicker: 'Tahap 2 · Merumuskan Masalah',
    title: 'Dari Gambar ERD ke DBMS',
    goal: 'Membandingkan ERD dengan DBMS yang masih kosong, lalu merumuskan masalah penyelidikan.',
    guru: 'Beri murid waktu 2 menit mengamati ERD dan panel DBMS kosong. Tanyakan: "Apa yang ada di ERD tetapi belum ada di DBMS?" Pertanyaan penyelidikan yang tepat dipilih bersama; rumusan masalah tidak dinilai otomatis — pilih dua rumusan untuk dibacakan dan dijadikan pegangan kelas.',
    kutipan:
      '"ERD-nya sudah bagus, ada lima kotak lengkap dengan kunci. Tapi waktu saya buka DBMS di server, isinya kosong melompong. Bagaimana cara memindahkan rancangan ini ke sana?" — Bu Sari, pustakawan',
    erdJudul: 'ERD Perpustakaan Sekolah (sudah disetujui)',
    dbmsJudul: 'Isi DBMS di server sekolah',
    pertanyaan: {
      tanya:
        'Pertanyaan apa saja yang perlu diselidiki tim agar ERD bisa diwujudkan di DBMS? <strong>Pilih semua yang relevan.</strong>',
      opsi: [
        {
          id: 'perintah',
          label: 'Perintah SQL apa yang dipakai untuk membuat basis data dan tabel?',
          benar: true,
          alasan: 'Inilah inti masalahnya: DBMS hanya bisa dibangun lewat perintah.',
        },
        {
          id: 'terjemah',
          label:
            'Bagaimana entitas, atribut, dan kunci di ERD diterjemahkan menjadi tabel, kolom, dan constraint?',
          benar: true,
          alasan: 'ERD harus dibaca ulang dalam "bahasa" tabel agar strukturnya sama persis.',
        },
        {
          id: 'ubah',
          label:
            'Bagaimana mengubah atau menghapus struktur tabel bila kebutuhan perpustakaan berubah?',
          benar: true,
          alasan:
            'Struktur basis data jarang sekali jadi; perlu tahu cara mengubahnya dengan aman.',
        },
        {
          id: 'urutan',
          label: 'Apakah urutan pembuatan tabel berpengaruh pada tabel yang saling berelasi?',
          benar: true,
          alasan: 'Relasi (kunci tamu) membuat tabel saling bergantung — patut diselidiki.',
        },
        {
          id: 'logo',
          label: 'Warna apa yang cocok untuk logo aplikasi perpustakaan?',
          benar: false,
          alasan: 'Menarik, tetapi tidak berhubungan dengan membangun struktur basis data.',
        },
        {
          id: 'harga',
          label: 'Berapa harga laptop yang dipakai pustakawan?',
          benar: false,
          alasan: 'Perangkat keras tidak menentukan perintah pembuat struktur basis data.',
        },
        {
          id: 'gambar',
          label: 'Bagaimana menggambar ERD dengan aplikasi desain yang lebih bagus?',
          benar: false,
          alasan: 'ERD sudah disetujui; masalahnya ada di DBMS, bukan di gambarnya.',
        },
      ],
      done: '<strong>Pertanyaan penyelidikan siap.</strong> Empat pertanyaan ini menjadi peta tahap-tahap berikutnya.',
    },
    rumusan: {
      label: 'Tulis rumusan masalah tim',
      petunjuk:
        'Gabungkan pertanyaan penyelidikan menjadi satu kalimat tanya, mis. "Perintah SQL apa yang …, dan bagaimana …?"',
      placeholder: 'Perintah SQL apa yang …',
      min: 25,
    },
  },

  /* ==========================================================
     SINTAKS 3 — Merumuskan hipotesis
     ========================================================== */
  hipotesis: {
    kicker: 'Tahap 3 · Merumuskan Hipotesis',
    title: 'Tebak Sebelum Mencoba',
    goal: 'Menyusun dugaan sementara tentang fungsi perintah SQL dan struktur tabel dari ERD.',
    guru: 'Tegaskan bahwa hipotesis <strong>tidak dinilai</strong> — yang dinilai nanti adalah kemampuan membandingkannya dengan bukti. Dorong murid menebak dari arti kata bahasa Inggrisnya (create, alter, drop, truncate, rename). Simpan diskusi: tebakan akan diuji di tahap 8.',
    pengantar:
      'Belum ada yang memberi tahu jawabannya — gunakan arti kata dan logikamu. Semua tebakan disimpan, lalu diuji dengan bukti dari Lab DDL pada tahap <strong>Uji Hipotesis</strong>.',
    efek: {
      pengantar: 'Hipotesis ①: menurutmu apa akibat setiap perintah ini pada DBMS?',
      opsi: [
        { id: 'buat', label: 'Membuat struktur baru' },
        { id: 'ubah', label: 'Mengubah struktur tabel yang sudah ada' },
        { id: 'hapus', label: 'Menghapus tabel beserta struktur dan isinya' },
        { id: 'kosong', label: 'Mengosongkan isi tabel, strukturnya tetap' },
        { id: 'nama', label: 'Mengganti nama tabel' },
      ],
      items: [
        { id: 'hCreate', sql: 'CREATE TABLE …', benar: 'buat' },
        { id: 'hAlter', sql: 'ALTER TABLE … ADD …', benar: 'ubah' },
        { id: 'hDrop', sql: 'DROP TABLE …', benar: 'hapus' },
        { id: 'hTruncate', sql: 'TRUNCATE TABLE …', benar: 'kosong' },
        { id: 'hRename', sql: 'RENAME TABLE … TO …', benar: 'nama' },
      ],
    },
    prediksi: [
      {
        id: 'pJumlah',
        tanya: 'Hipotesis ②: berapa tabel yang akan dibuat dari ERD Perpustakaan?',
        opsi: [
          { id: 'tiga', label: '3 tabel' },
          { id: 'empat', label: '4 tabel' },
          { id: 'lima', label: '5 tabel' },
          { id: 'tujuh', label: '7 tabel' },
        ],
        benar: 'lima',
        bukti: 'Lima entitas (termasuk entitas penghubung Detail Pinjam) menjadi lima tabel.',
      },
      {
        id: 'pUrutan',
        tanya: 'Hipotesis ③: tabel buku merujuk tabel kategori. Mana yang harus dibuat lebih dulu?',
        opsi: [
          { id: 'kategori', label: 'kategori lebih dulu' },
          { id: 'buku', label: 'buku lebih dulu' },
          { id: 'bebas', label: 'Bebas, urutan tidak berpengaruh' },
          { id: 'bersamaan', label: 'Harus dibuat dalam satu perintah' },
        ],
        benar: 'kategori',
        bukti:
          'DBMS menolak kunci tamu yang merujuk tabel yang belum ada, jadi tabel induk (kategori) dibuat lebih dulu.',
      },
      {
        id: 'pFk',
        tanya: 'Hipotesis ④: kolom nis milik anggota akan muncul sebagai kunci tamu di tabel mana?',
        opsi: [
          { id: 'peminjaman', label: 'peminjaman' },
          { id: 'buku', label: 'buku' },
          { id: 'kategori', label: 'kategori' },
          { id: 'detail', label: 'detail_pinjam' },
        ],
        benar: 'peminjaman',
        bukti:
          'Relasi Anggota–Peminjaman 1:N, sehingga kunci tamu nis diletakkan di sisi banyak: peminjaman.',
      },
    ],
  },

  /* ==========================================================
     SINTAKS 4 — Mengumpulkan data
     ========================================================== */
  eksperimen: {
    kicker: 'Tahap 4 · Mengumpulkan Data',
    title: 'Lab DDL: Bereksperimen dengan DBMS',
    goal: 'Mengumpulkan bukti akibat setiap perintah DDL dengan menjalankannya di konsol DBMS.',
    guru: 'Minta setiap tim menjalankan langkah <em>satu per satu</em> dan mencatat perubahan pada panel DBMS sebelum menekan langkah berikutnya. Beberapa langkah sengaja gagal — tahan diri untuk tidak menjelaskan; ajukan pertanyaan "Mengapa ditolak?" Setelah pertanyaan penuntun selesai, beri waktu 5 menit untuk "Coba sendiri".',
    pengantar:
      'Konsol di bawah terhubung ke DBMS tiruan. Tekan <strong>Jalankan</strong> untuk setiap langkah, lalu <strong>amati</strong> panel <em>Isi DBMS</em>: apa yang muncul, berubah, atau hilang? Ada langkah yang sengaja dibuat gagal — baca pesan DBMS-nya baik-baik.',
    langkah: [
      {
        id: 'l1',
        sql: 'CREATE DATABASE db_perpus;',
        harapOk: true,
        amati: 'Muncul basis data baru, tetapi belum ada tabel.',
      },
      {
        id: 'l2',
        sql: SQL_KATEGORI_SQL,
        harapOk: false,
        amati: 'Mengapa DBMS menolak? Basis data mana yang dimaksud?',
      },
      { id: 'l3', sql: 'USE db_perpus;', harapOk: true, amati: 'Basis data db_perpus kini aktif.' },
      {
        id: 'l4',
        sql: SQL_KATEGORI_SQL,
        harapOk: true,
        amati: 'Perintah yang sama sekarang berhasil. Apa bedanya dengan langkah 2?',
      },
      {
        id: 'l5',
        sql: SQL_PEMINJAMAN_LAB,
        harapOk: false,
        amati: 'Kunci tamu nis merujuk tabel anggota. Apakah tabel itu sudah ada?',
      },
      {
        id: 'l6',
        sql: 'CREATE TABLE anggota (\n  nis VARCHAR(10),\n  nama_anggota VARCHAR(50) NOT NULL,\n  PRIMARY KEY (nis)\n);',
        harapOk: true,
        amati: 'Tabel anggota dibuat dengan dua kolom; nis bertanda 🔑.',
      },
      {
        id: 'l7',
        sql: 'ALTER TABLE anggota ADD kelas VARCHAR(10);',
        harapOk: true,
        amati: 'Perhatikan kolom tabel anggota: apa yang bertambah?',
      },
      {
        id: 'l8',
        sql: "INSERT INTO anggota VALUES\n  ('23001', 'Ayu Lestari', 'XI RPL 1'),\n  ('23002', 'Bima Saputra', 'XI RPL 2'),\n  ('23003', 'Citra Dewi', 'XI RPL 1');",
        harapOk: true,
        amati: 'Ini perintah DML. Apa yang berubah: jumlah baris atau kolom?',
      },
      {
        id: 'l9',
        sql: 'TRUNCATE TABLE anggota;',
        harapOk: true,
        amati: 'Jumlah baris kembali 0. Apakah kolom-kolomnya ikut hilang?',
      },
      {
        id: 'l10',
        sql: SQL_PEMINJAMAN_LAB,
        harapOk: true,
        amati: 'Sekarang berhasil — tabel anggota sudah ada.',
      },
      {
        id: 'l11',
        sql: 'DROP TABLE anggota;',
        harapOk: false,
        amati: 'DBMS melindungi tabel yang masih dirujuk. Tabel mana yang merujuknya?',
      },
      {
        id: 'l12',
        sql: 'RENAME TABLE kategori TO kategori_buku;',
        harapOk: true,
        amati: 'Nama tabel berubah; kolomnya tetap.',
      },
      {
        id: 'l13',
        sql: 'DROP TABLE kategori_buku;',
        harapOk: true,
        amati: 'Tabel hilang seluruhnya — struktur dan isinya.',
      },
    ],
    pertanyaan: [
      soalPilih(
        'eUse',
        'Langkah 2 dan 4 berisi perintah yang <strong>sama persis</strong>. Mengapa langkah 2 gagal?',
        'use',
        [
          [
            'use',
            'Belum ada basis data yang dipilih dengan USE',
            '<strong>Tepat.</strong> CREATE TABLE selalu membuat tabel di basis data yang <em>aktif</em>. Setelah USE db_perpus; (langkah 3) DBMS tahu tabel itu milik siapa.',
          ],
          [
            'tipe',
            'Tipe data VARCHAR(30) salah tulis',
            'Coba lihat lagi: perintah yang sama berhasil di langkah 4 tanpa diubah, jadi tipenya tidak salah.',
          ],
          [
            'nama',
            'Nama tabel kategori sudah dipakai',
            'Pada langkah 2 belum ada tabel apa pun. Baca pesan DBMS di langkah 2.',
          ],
          [
            'acak',
            'DBMS kadang gagal secara acak',
            'DBMS selalu memberi alasan. Baca pesannya: ada perintah yang perlu dijalankan dulu.',
          ],
        ]
      ),
      soalPilih(
        'eAlter',
        'Apa akibat <code>ALTER TABLE anggota ADD kelas VARCHAR(10);</code> (langkah 7)?',
        'struktur',
        [
          [
            'struktur',
            'Struktur tabel bertambah satu kolom; tabelnya tidak dibuat ulang',
            '<strong>Benar.</strong> ALTER mengubah struktur tabel yang sudah ada — di sini menambah kolom kelas.',
          ],
          [
            'isi',
            'Satu baris data baru bernama kelas ditambahkan',
            'Jumlah baris tetap 0. Yang bertambah adalah kolom, bukan baris data.',
          ],
          [
            'baru',
            'Tabel anggota dihapus lalu dibuat ulang',
            'Kolom nis dan nama_anggota tetap ada; tabelnya tidak dibuat ulang.',
          ],
          [
            'nama',
            'Nama tabel anggota berganti menjadi kelas',
            'Mengganti nama tabel adalah tugas RENAME. Nama tabel tetap anggota.',
          ],
        ]
      ),
      soalPilih(
        'eTruncate',
        'Bandingkan langkah 8 (INSERT) dan langkah 9 (TRUNCATE). Kesimpulan yang tepat adalah …',
        'isi',
        [
          [
            'isi',
            'INSERT menambah isi (DML); TRUNCATE mengosongkan isi tetapi struktur tetap (DDL)',
            '<strong>Tepat.</strong> Jumlah baris naik menjadi 3 lalu kembali 0, sedangkan tiga kolom anggota tidak berubah.',
          ],
          [
            'sama',
            'Keduanya mengubah struktur tabel',
            'Perhatikan kolom tabel anggota pada langkah 8 dan 9: kolomnya tetap tiga.',
          ],
          [
            'hapus',
            'TRUNCATE menghapus tabel anggota beserta kolomnya',
            'Tabel anggota masih ada setelah langkah 9 — hanya baris datanya yang hilang.',
          ],
          [
            'ddl',
            'INSERT dan TRUNCATE sama-sama termasuk DML',
            'Lihat label kategori di log: INSERT bertanda DML, TRUNCATE bertanda DDL.',
          ],
        ]
      ),
      soalPilih(
        'eFk',
        'Langkah 5 gagal, padahal perintah yang sama berhasil di langkah 10. Mengapa?',
        'induk',
        [
          [
            'induk',
            'Kunci tamu hanya boleh merujuk tabel yang sudah ada; anggota baru dibuat di langkah 6',
            '<strong>Benar.</strong> Tabel induk (yang dirujuk) harus dibuat lebih dulu daripada tabel anak (yang merujuk).',
          ],
          [
            'use',
            'Basis data belum dipilih dengan USE',
            'USE sudah dijalankan di langkah 3, dan kategori berhasil dibuat di langkah 4.',
          ],
          [
            'date',
            'Tipe DATE belum didukung DBMS',
            'Langkah 10 memakai tipe DATE yang sama dan berhasil.',
          ],
          [
            'isi',
            'Tabel anggota masih kosong',
            'Pada langkah 10 tabel anggota juga kosong (sudah di-TRUNCATE), tetapi perintahnya berhasil.',
          ],
        ]
      ),
      soalPilih(
        'eDrop',
        'Mengapa <code>DROP TABLE anggota;</code> (langkah 11) ditolak DBMS?',
        'rujuk',
        [
          [
            'rujuk',
            'Tabel anggota masih dirujuk kunci tamu tabel peminjaman',
            '<strong>Tepat.</strong> DBMS menjaga <em>integritas referensial</em>: tabel induk tidak boleh hilang selama ada tabel anak yang merujuknya.',
          ],
          [
            'kosong',
            'Tabel yang kosong tidak boleh dihapus',
            'kategori_buku juga kosong, tetapi berhasil dihapus di langkah 13.',
          ],
          [
            'izin',
            'Murid tidak punya izin menghapus tabel',
            'Pesan DBMS tidak membahas izin. Baca lagi: tabel anggota masih dipakai oleh siapa?',
          ],
          [
            'nama',
            'Nama tabel salah tulis',
            'Tabel anggota ada di panel DBMS dengan nama yang sama.',
          ],
        ]
      ),
      soalPilih(
        'eBeda',
        'Dari langkah 9 dan 13, apa beda <strong>TRUNCATE TABLE</strong> dengan <strong>DROP TABLE</strong>?',
        'beda',
        [
          [
            'beda',
            'TRUNCATE mengosongkan isi; DROP menghapus tabel seluruhnya (struktur dan isi)',
            '<strong>Benar.</strong> Setelah TRUNCATE tabelnya masih bisa diisi lagi; setelah DROP tabelnya harus dibuat ulang dengan CREATE.',
          ],
          [
            'sama',
            'Keduanya sama-sama menghapus tabel',
            'Setelah langkah 9 tabel anggota masih tampak di panel DBMS.',
          ],
          [
            'balik',
            'DROP mengosongkan isi; TRUNCATE menghapus tabel',
            'Terbalik. Lihat panel DBMS setelah masing-masing langkah.',
          ],
          [
            'kolom',
            'TRUNCATE menghapus satu kolom; DROP menghapus satu baris',
            'Menghapus kolom dilakukan dengan ALTER TABLE … DROP COLUMN.',
          ],
        ]
      ),
    ],
    bebasPetunjuk:
      'Contoh yang bisa dicoba: <code>ALTER TABLE peminjaman ADD tgl_kembali DATE;</code>, <code>ALTER TABLE peminjaman MODIFY tgl_pinjam DATETIME;</code>, <code>RENAME TABLE peminjaman TO pinjam;</code>, atau buat tabel kategori lagi.',
  },

  konsep: {
    kicker: 'Tahap 5 · Mengumpulkan Data',
    title: 'Kartu Konsep DDL',
    goal: 'Melengkapi bukti eksperimen dengan informasi tentang DDL, tipe data, dan constraint.',
    guru: 'Bagi kartu konsep ke anggota tim (masing-masing membaca 2 kartu lalu menjelaskan ke tim). Hubungkan setiap kartu dengan langkah di Lab DDL: "Kartu ini menjelaskan langkah nomor berapa?"',
    pengantar:
      'Buka setiap kartu, lalu cocokkan dengan pengamatanmu di Lab DDL. Setelah itu pilah perintah-perintah SQL ke kelompok bahasanya dan ke fungsinya.',
    kartu: [
      {
        ikon: '🧱',
        istilah: 'DDL (Data Definition Language)',
        def: 'Kelompok perintah SQL untuk mendefinisikan dan mengubah STRUKTUR basis data: basis data, tabel, kolom, dan constraint. DDL tidak mengolah isi data.',
        contoh: 'CREATE, ALTER, DROP, TRUNCATE, RENAME',
      },
      {
        ikon: '🧭',
        istilah: 'DML & DCL',
        def: 'DML (Data Manipulation Language) mengolah ISI tabel: INSERT, UPDATE, DELETE, SELECT. DCL (Data Control Language) mengatur HAK AKSES pengguna: GRANT, REVOKE.',
        contoh: "INSERT INTO anggota VALUES ('23001', 'Ayu', 'XI RPL 1');",
      },
      {
        ikon: '🗄️',
        istilah: 'CREATE DATABASE & USE',
        def: 'CREATE DATABASE membuat basis data baru (wadah tabel). USE memilih basis data yang aktif, tempat perintah tabel berikutnya dijalankan.',
        contoh: 'CREATE DATABASE db_perpus;\nUSE db_perpus;',
      },
      {
        ikon: '▦',
        istilah: 'CREATE TABLE',
        def: 'Membuat tabel baru: nama tabel, daftar kolom beserta tipe datanya, dan constraint. Satu entitas ERD → satu tabel; satu atribut → satu kolom.',
        contoh:
          'CREATE TABLE kategori (\n  id_kategori INT,\n  nama_kategori VARCHAR(30) NOT NULL,\n  PRIMARY KEY (id_kategori)\n);',
      },
      {
        ikon: '🔤',
        istilah: 'Tipe data',
        def: 'Menentukan jenis nilai sebuah kolom. INT untuk bilangan bulat yang dihitung; VARCHAR(n) untuk teks/kode hingga n karakter; DATE untuk tanggal; DECIMAL(p,s) untuk bilangan berkoma seperti uang. Kode seperti NIS atau B001 disimpan sebagai VARCHAR karena tidak dihitung dan bisa diawali nol.',
        contoh: 'stok INT, judul VARCHAR(100), tgl_pinjam DATE, denda DECIMAL(8,2)',
      },
      {
        ikon: '🔒',
        istilah: 'Constraint',
        def: 'Aturan yang dijaga DBMS. PRIMARY KEY: nilai unik dan tidak boleh kosong (kunci primer). FOREIGN KEY … REFERENCES: nilai harus ada di tabel induk (kunci tamu). NOT NULL: wajib diisi. UNIQUE: tidak boleh kembar.',
        contoh: 'PRIMARY KEY (id_pinjam, kode_buku),\nFOREIGN KEY (nis) REFERENCES anggota(nis)',
      },
      {
        ikon: '🛠️',
        istilah: 'ALTER TABLE',
        def: 'Mengubah struktur tabel yang sudah ada tanpa menghapus isinya: ADD (tambah kolom/constraint), MODIFY (ubah tipe kolom), DROP COLUMN (hapus kolom), RENAME TO (ganti nama tabel).',
        contoh:
          'ALTER TABLE anggota ADD kelas VARCHAR(10);\nALTER TABLE anggota MODIFY kelas VARCHAR(15);',
      },
      {
        ikon: '🗑️',
        istilah: 'DROP, TRUNCATE, RENAME',
        def: 'DROP TABLE menghapus tabel beserta struktur dan isinya. TRUNCATE TABLE mengosongkan seluruh isi, strukturnya tetap. RENAME TABLE mengganti nama tabel. Tabel yang masih dirujuk kunci tamu tidak bisa di-DROP.',
        contoh:
          'TRUNCATE TABLE anggota;\nRENAME TABLE kategori TO kategori_buku;\nDROP TABLE kategori_buku;',
      },
    ],
    bahasa: {
      pengantar: 'Pilah setiap perintah ke kelompok bahasanya.',
      kategori: [
        { id: 'ddl', label: 'DDL — mengatur struktur' },
        { id: 'dml', label: 'DML — mengolah isi data' },
        { id: 'dcl', label: 'DCL — mengatur hak akses' },
      ],
      items: [
        {
          id: 'bCreate',
          teks: 'CREATE TABLE rak (id_rak INT);',
          correct: 'ddl',
          explanation: 'CREATE membuat struktur baru, jadi termasuk DDL.',
        },
        {
          id: 'bAlter',
          teks: 'ALTER TABLE buku ADD tahun INT;',
          correct: 'ddl',
          explanation: 'ALTER mengubah struktur tabel (menambah kolom) — DDL.',
        },
        {
          id: 'bDrop',
          teks: 'DROP TABLE rak;',
          correct: 'ddl',
          explanation: 'DROP menghapus objek struktur (tabel) — DDL.',
        },
        {
          id: 'bTruncate',
          teks: 'TRUNCATE TABLE peminjaman;',
          correct: 'ddl',
          explanation:
            'Meski yang hilang isinya, TRUNCATE bekerja pada tabel secara utuh dan tergolong DDL.',
        },
        {
          id: 'bInsert',
          teks: "INSERT INTO kategori VALUES (1, 'Novel');",
          correct: 'dml',
          explanation: 'INSERT menambah baris data (isi) — DML.',
        },
        {
          id: 'bUpdate',
          teks: 'UPDATE buku SET stok = 5;',
          correct: 'dml',
          explanation: 'UPDATE mengubah nilai data yang sudah ada — DML.',
        },
        {
          id: 'bDelete',
          teks: "DELETE FROM anggota WHERE nis = '23001';",
          correct: 'dml',
          explanation:
            'DELETE menghapus baris data tertentu — DML (bandingkan dengan TRUNCATE yang mengosongkan semua).',
        },
        {
          id: 'bGrant',
          teks: 'GRANT SELECT ON buku TO pustakawan;',
          correct: 'dcl',
          explanation: 'GRANT memberi hak akses kepada pengguna — DCL.',
        },
        {
          id: 'bRevoke',
          teks: 'REVOKE SELECT ON buku FROM tamu;',
          correct: 'dcl',
          explanation: 'REVOKE mencabut hak akses — DCL.',
        },
      ],
    },
    fungsi: {
      pengantar: 'Pilah setiap perintah DDL ke fungsinya.',
      kategori: [
        { id: 'buat', label: 'Membuat objek baru' },
        { id: 'ubah', label: 'Mengubah struktur tabel' },
        { id: 'nama', label: 'Mengganti nama tabel' },
        { id: 'kosong', label: 'Mengosongkan isi tabel' },
        { id: 'hapus', label: 'Menghapus objek' },
      ],
      items: [
        {
          id: 'fDb',
          teks: 'CREATE DATABASE db_perpus;',
          correct: 'buat',
          explanation: 'Membuat basis data baru sebagai wadah tabel.',
        },
        {
          id: 'fTable',
          teks: 'CREATE TABLE rak (id_rak INT, PRIMARY KEY (id_rak));',
          correct: 'buat',
          explanation: 'Membuat tabel baru beserta kolom dan kunci primernya.',
        },
        {
          id: 'fAdd',
          teks: 'ALTER TABLE buku ADD tahun_terbit INT;',
          correct: 'ubah',
          explanation: 'Menambah kolom berarti mengubah struktur tabel buku.',
        },
        {
          id: 'fModify',
          teks: 'ALTER TABLE anggota MODIFY kelas VARCHAR(15);',
          correct: 'ubah',
          explanation: 'MODIFY mengubah definisi (tipe/panjang) kolom yang sudah ada.',
        },
        {
          id: 'fRename',
          teks: 'RENAME TABLE anggota TO member;',
          correct: 'nama',
          explanation: 'RENAME mengganti nama tabel tanpa mengubah kolom dan isinya.',
        },
        {
          id: 'fTruncate',
          teks: 'TRUNCATE TABLE detail_pinjam;',
          correct: 'kosong',
          explanation: 'Seluruh baris dihapus; struktur tabel tetap siap dipakai.',
        },
        {
          id: 'fDropTable',
          teks: 'DROP TABLE rak;',
          correct: 'hapus',
          explanation: 'Tabel rak hilang beserta struktur dan isinya.',
        },
        {
          id: 'fDropDb',
          teks: 'DROP DATABASE db_latihan;',
          correct: 'hapus',
          explanation: 'Basis data beserta semua tabelnya dihapus — perintah paling berisiko!',
        },
      ],
    },
    pertanyaan: [
      soalPilih(
        'cPk',
        'Kolom <code>kode_buku</code> diberi <strong>PRIMARY KEY</strong>. Apa yang dijaga DBMS?',
        'unik',
        [
          [
            'unik',
            'Setiap kode_buku unik dan tidak boleh kosong',
            '<strong>Benar.</strong> Kunci primer menjamin setiap baris bisa dikenali secara pasti.',
          ],
          [
            'urut',
            'kode_buku otomatis diurutkan dari A sampai Z',
            'Kunci primer tidak bertugas mengurutkan tampilan data.',
          ],
          [
            'angka',
            'kode_buku hanya boleh berisi angka',
            'Isi kolom ditentukan oleh tipe data (VARCHAR boleh huruf), bukan oleh PRIMARY KEY.',
          ],
          [
            'rujuk',
            'kode_buku harus ada di tabel lain',
            'Itu tugas FOREIGN KEY, bukan PRIMARY KEY.',
          ],
        ]
      ),
      soalPilih(
        'cFk',
        '<code>FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)</code> di tabel buku berarti …',
        'ada',
        [
          [
            'ada',
            'id_kategori pada buku hanya boleh berisi nilai yang ada di tabel kategori',
            '<strong>Tepat.</strong> Kunci tamu mewujudkan relasi Kategori–Buku dan mencegah buku dengan kategori "hantu".',
          ],
          [
            'salin',
            'Seluruh isi tabel kategori disalin ke tabel buku',
            'Yang disimpan di buku hanya nilai id_kategori, bukan seluruh isi kategori.',
          ],
          [
            'pk',
            'id_kategori menjadi kunci primer tabel buku',
            'Kunci primer buku tetap kode_buku. id_kategori hanya kunci tamu.',
          ],
          [
            'unik',
            'Setiap kategori hanya boleh dipakai oleh satu buku',
            'Relasinya 1:N — satu kategori boleh dipakai banyak buku.',
          ],
        ]
      ),
      soalPilih(
        'cNotNull',
        'Mengapa <code>judul VARCHAR(100) NOT NULL</code> diberi NOT NULL?',
        'wajib',
        [
          [
            'wajib',
            'Agar setiap buku wajib punya judul (tidak boleh dikosongkan)',
            '<strong>Benar.</strong> NOT NULL dipakai untuk atribut yang wajib diisi menurut kebutuhan.',
          ],
          [
            'unik',
            'Agar tidak ada dua buku dengan judul sama',
            'Untuk mencegah kembar dipakai UNIQUE. Dua buku boleh saja berjudul sama.',
          ],
          [
            'pendek',
            'Agar judul tidak lebih dari 100 karakter',
            'Batas 100 karakter berasal dari VARCHAR(100), bukan NOT NULL.',
          ],
          [
            'angka',
            'Agar judul tidak boleh berisi angka',
            'NOT NULL tidak membatasi jenis karakter.',
          ],
        ]
      ),
    ],
  },

  identifikasi: {
    kicker: 'Tahap 6 · Mengumpulkan Data',
    title: 'Bedah ERD Menjadi Struktur Tabel',
    goal: 'Mengidentifikasi tabel, kolom, tipe data, kunci primer, dan kunci tamu dari ERD.',
    guru: 'Tunjuk ERD di layar dan tanyakan: "Kotak menjadi apa? Atribut menjadi apa? Garis relasi menjadi apa?" Saat memilah tipe data, ajak murid bertanya "Apakah nilai ini dihitung?" untuk membedakan INT dan VARCHAR.',
    pengantar:
      'Setiap <strong>entitas</strong> menjadi <strong>tabel</strong>, setiap <strong>atribut</strong> menjadi <strong>kolom</strong>, kunci primer menjadi <code>PRIMARY KEY</code>, dan setiap relasi diwujudkan dengan <code>FOREIGN KEY</code>. Selidiki ERD Perpustakaan berikut.',
    peran: {
      pengantar: '① Apa peran setiap kolom di tabelnya?',
      kategori: [
        { id: 'pk', label: 'Kunci primer (PK)' },
        { id: 'fk', label: 'Kunci tamu (FK)' },
        { id: 'pkfk', label: 'PK sekaligus FK' },
        { id: 'biasa', label: 'Kolom biasa' },
      ],
      items: [
        {
          id: 'rKatId',
          tabel: 'kategori',
          kolom: 'id_kategori',
          teks: 'kategori.id_kategori',
          correct: 'pk',
          explanation: 'Pengenal unik setiap kategori — kunci primer tabel kategori.',
        },
        {
          id: 'rBukuKat',
          tabel: 'buku',
          kolom: 'id_kategori',
          teks: 'buku.id_kategori',
          correct: 'fk',
          explanation:
            'Relasi Kategori–Buku 1:N, jadi id_kategori dibawa ke sisi banyak (buku) sebagai kunci tamu.',
        },
        {
          id: 'rBukuKode',
          tabel: 'buku',
          kolom: 'kode_buku',
          teks: 'buku.kode_buku',
          correct: 'pk',
          explanation: 'Pengenal unik setiap buku — kunci primer tabel buku.',
        },
        {
          id: 'rJudul',
          tabel: 'buku',
          kolom: 'judul',
          teks: 'buku.judul',
          correct: 'biasa',
          explanation: 'Judul bisa kembar dan tidak merujuk tabel lain — kolom biasa (NOT NULL).',
        },
        {
          id: 'rPinjamNis',
          tabel: 'peminjaman',
          kolom: 'nis',
          teks: 'peminjaman.nis',
          correct: 'fk',
          explanation: 'Relasi Anggota–Peminjaman 1:N: nis di peminjaman merujuk anggota.',
        },
        {
          id: 'rTgl',
          tabel: 'peminjaman',
          kolom: 'tgl_pinjam',
          teks: 'peminjaman.tgl_pinjam',
          correct: 'biasa',
          explanation: 'Tanggal pinjam adalah data biasa yang wajib diisi.',
        },
        {
          id: 'rDetPinjam',
          tabel: 'detail_pinjam',
          kolom: 'id_pinjam',
          teks: 'detail_pinjam.id_pinjam',
          correct: 'pkfk',
          explanation:
            'Di tabel penghubung, id_pinjam merujuk peminjaman (FK) sekaligus bagian kunci primer gabungan.',
        },
        {
          id: 'rDetBuku',
          tabel: 'detail_pinjam',
          kolom: 'kode_buku',
          teks: 'detail_pinjam.kode_buku',
          correct: 'pkfk',
          explanation:
            'kode_buku merujuk buku (FK) dan bersama id_pinjam membentuk kunci primer gabungan.',
        },
      ],
    },
    tipe: {
      pengantar: '② Tipe data apa yang paling tepat untuk setiap kolom?',
      kategori: [
        { id: 'INT', label: 'INT (bilangan bulat)' },
        { id: 'VARCHAR', label: 'VARCHAR(n) (teks / kode)' },
        { id: 'DATE', label: 'DATE (tanggal)' },
        { id: 'DECIMAL', label: 'DECIMAL(p,s) (bilangan berkoma)' },
      ],
      items: [
        {
          id: 'tKode',
          tabel: 'buku',
          kolom: 'kode_buku',
          teks: 'buku.kode_buku — contoh: B0012',
          correct: 'VARCHAR',
          explanation: 'Berisi huruf dan angka serta tidak dihitung, jadi VARCHAR.',
        },
        {
          id: 'tJudul',
          tabel: 'buku',
          kolom: 'judul',
          teks: 'buku.judul — contoh: Laskar Pelangi',
          correct: 'VARCHAR',
          explanation: 'Teks dengan panjang berbeda-beda → VARCHAR(100).',
        },
        {
          id: 'tStok',
          tabel: 'buku',
          kolom: 'stok',
          teks: 'buku.stok — contoh: 4',
          correct: 'INT',
          explanation:
            'Jumlah eksemplar adalah bilangan bulat yang dihitung (bertambah/berkurang).',
        },
        {
          id: 'tNis',
          tabel: 'anggota',
          kolom: 'nis',
          teks: 'anggota.nis — contoh: 0230011',
          correct: 'VARCHAR',
          explanation:
            'NIS tampak seperti angka, tetapi tidak dihitung dan bisa diawali nol. Sebagai INT, 0230011 menjadi 230011!',
        },
        {
          id: 'tTgl',
          tabel: 'peminjaman',
          kolom: 'tgl_pinjam',
          teks: 'peminjaman.tgl_pinjam — contoh: 2026-10-05',
          correct: 'DATE',
          explanation:
            'Tanggal disimpan dengan DATE agar bisa dibandingkan dan dihitung selisih harinya.',
        },
        {
          id: 'tDenda',
          tabel: 'peminjaman',
          kolom: 'denda',
          teks: 'peminjaman.denda — contoh: 2500.00',
          correct: 'DECIMAL',
          explanation: 'Nilai uang bisa berkoma dan harus tepat → DECIMAL(8,2).',
        },
        {
          id: 'tBukuKat',
          tabel: 'buku',
          kolom: 'id_kategori',
          teks: 'buku.id_kategori (kunci tamu ke kategori)',
          correct: 'INT',
          explanation:
            'Kunci tamu wajib bertipe sama dengan kunci primer yang dirujuk: kategori.id_kategori bertipe INT.',
        },
        {
          id: 'tJumlah',
          tabel: 'detail_pinjam',
          kolom: 'jumlah',
          teks: 'detail_pinjam.jumlah — contoh: 1',
          correct: 'INT',
          explanation: 'Banyaknya eksemplar yang dipinjam — bilangan bulat.',
        },
      ],
    },
    pertanyaan: [
      soalPilih('iJumlah', '③ Berapa tabel yang perlu dibuat dari ERD Perpustakaan?', 'lima', [
        [
          'lima',
          '5 tabel',
          '<strong>Benar.</strong> Empat entitas ditambah entitas penghubung Detail Pinjam — semuanya menjadi tabel.',
        ],
        [
          'empat',
          '4 tabel',
          'Entitas penghubung Detail Pinjam juga harus menjadi tabel, karena relasi M:N tidak bisa disimpan dengan satu kunci tamu.',
        ],
        ['tiga', '3 tabel', 'Hitung lagi kotak entitas pada ERD, termasuk entitas penghubung.'],
        [
          'delapan',
          '8 tabel (5 entitas + 3 relasi)',
          'Relasi 1:N tidak menjadi tabel; cukup diwujudkan dengan kunci tamu.',
        ],
      ]),
      soalPilih(
        'iPkGabung',
        '④ Kunci primer tabel <code>detail_pinjam</code> yang tepat adalah …',
        'gabung',
        [
          [
            'gabung',
            'PRIMARY KEY (id_pinjam, kode_buku) — kunci gabungan',
            '<strong>Tepat.</strong> Pasangan peminjaman + buku yang unik; satu buku tidak dicatat dua kali pada peminjaman yang sama.',
          ],
          [
            'pinjam',
            'PRIMARY KEY (id_pinjam) saja',
            'Satu peminjaman bisa memuat beberapa buku, sehingga id_pinjam saja akan kembar.',
          ],
          [
            'buku',
            'PRIMARY KEY (kode_buku) saja',
            'Satu buku bisa dipinjam berkali-kali, sehingga kode_buku saja akan kembar.',
          ],
          [
            'jumlah',
            'PRIMARY KEY (jumlah)',
            'jumlah bukan pengenal — banyak baris bisa berjumlah sama.',
          ],
        ]
      ),
      soalPilih(
        'iTanpaFk',
        '⑤ Tabel mana yang <strong>tidak</strong> memiliki kunci tamu sama sekali?',
        'katAng',
        [
          [
            'katAng',
            'kategori dan anggota',
            '<strong>Benar.</strong> Keduanya hanya dirujuk, tidak merujuk. Karena itu keduanya bisa dibuat paling awal.',
          ],
          ['buku', 'buku dan kategori', 'buku merujuk kategori lewat id_kategori.'],
          ['pinjam', 'peminjaman dan anggota', 'peminjaman merujuk anggota lewat nis.'],
          ['detail', 'detail_pinjam', 'detail_pinjam justru punya dua kunci tamu.'],
        ]
      ),
    ],
  },

  rakit: {
    kicker: 'Tahap 7 · Mengumpulkan Data',
    title: 'Rakit Skrip DDL Perpustakaan',
    goal: 'Menyusun urutan CREATE TABLE yang sah dan melengkapi pernyataan CREATE TABLE dari ERD.',
    guru: 'Ada lebih dari satu urutan yang benar — yang penting setiap tabel induk dibuat sebelum tabel anaknya. Minta tim yang urutannya berbeda membandingkan alasannya. Saat melengkapi pernyataan, minta murid menunjuk bagian ERD yang menjadi dasar setiap isian.',
    urutan: {
      pengantar:
        '① Susun urutan pembuatan kelima tabel. Ingat temuan Lab DDL: kunci tamu hanya boleh merujuk tabel yang <strong>sudah ada</strong>.',
      sukses:
        '<strong>Urutan sah!</strong> Setiap tabel induk dibuat sebelum tabel yang merujuknya. (Urutan lain juga bisa benar selama aturan ini dipenuhi.)',
      salah:
        'Kartu bertanda merah dibuat sebelum tabel induk yang dirujuknya. Periksa kunci tamu (🔗) setiap tabel di ERD, lalu susun ulang.',
    },
    rumpangPengantar:
      '② Lengkapi pernyataan CREATE TABLE untuk tabel penghubung <code>detail_pinjam</code>. Setiap isian dipilih pada pertanyaan di bawahnya.',
    rumpangSql: RUMPANG_DETAIL,
    rumpang: [
      soalPilih('r1', 'Isian ①: kata kunci untuk membuat tabel baru adalah …', 'create', [
        ['create', 'CREATE', '<strong>Benar.</strong> CREATE TABLE membuat struktur tabel baru.'],
        [
          'alter',
          'ALTER',
          'ALTER mengubah tabel yang <em>sudah ada</em>; detail_pinjam belum ada.',
        ],
        ['insert', 'INSERT', 'INSERT mengisi baris data (DML), bukan membuat tabel.'],
        ['make', 'MAKE', 'MAKE bukan kata kunci SQL.'],
      ]),
      soalPilih('r2', 'Isian ②: tipe data kode_buku di detail_pinjam adalah …', 'varchar', [
        [
          'varchar',
          'VARCHAR(10)',
          '<strong>Benar.</strong> Kunci tamu harus bertipe sama dengan buku.kode_buku, yaitu VARCHAR(10).',
        ],
        [
          'int',
          'INT',
          'buku.kode_buku bertipe VARCHAR(10). Tipe kunci tamu yang berbeda akan ditolak DBMS.',
        ],
        ['date', 'DATE', 'Kode buku bukan tanggal.'],
        ['decimal', 'DECIMAL(8,2)', 'Kode buku tidak berkoma dan tidak dihitung.'],
      ]),
      soalPilih(
        'r3',
        'Isian ③: constraint untuk kunci gabungan (id_pinjam, kode_buku) adalah …',
        'pk',
        [
          [
            'pk',
            'PRIMARY KEY',
            '<strong>Benar.</strong> Pasangan id_pinjam dan kode_buku menjadi kunci primer gabungan.',
          ],
          [
            'fk',
            'FOREIGN KEY',
            'Kunci tamu sudah ditulis di baris berikutnya. Isian ini menandai pengenal unik tabel.',
          ],
          [
            'notnull',
            'NOT NULL',
            'NOT NULL hanya mewajibkan kolom diisi, tidak menjadikannya pengenal unik.',
          ],
          ['references', 'REFERENCES', 'REFERENCES hanya dipakai setelah FOREIGN KEY.'],
        ]
      ),
      soalPilih('r4', 'Isian ④: id_pinjam merujuk ke …', 'pinjam', [
        [
          'pinjam',
          'peminjaman(id_pinjam)',
          '<strong>Benar.</strong> Relasi Peminjaman–Buku diwujudkan lewat detail_pinjam; id_pinjam merujuk kunci primer peminjaman.',
        ],
        ['buku', 'buku(id_pinjam)', 'Tabel buku tidak punya kolom id_pinjam.'],
        ['anggota', 'anggota(nis)', 'detail_pinjam tidak berelasi langsung dengan anggota.'],
        [
          'diri',
          'detail_pinjam(id_pinjam)',
          'Kunci tamu merujuk tabel induk, bukan dirinya sendiri.',
        ],
      ]),
    ],
    isian: {
      r1: 'CREATE',
      r2: 'VARCHAR(10)',
      r3: 'PRIMARY KEY',
      r4: 'peminjaman(id_pinjam)',
    },
    simpulan:
      'Skrip lengkap di bawah dibangkitkan dari ERD mengikuti <strong>urutan susunan timmu</strong>. Simpan baik-baik — tahap berikutnya akan menjalankannya di DBMS untuk menguji hipotesismu.',
  },

  /* ==========================================================
     SINTAKS 5 — Menguji hipotesis
     ========================================================== */
  uji: {
    kicker: 'Tahap 8 · Menguji Hipotesis',
    title: 'Jalankan Skrip & Uji Dugaanmu',
    goal: 'Menguji skrip DDL terhadap ERD dan membandingkan hipotesis dengan bukti.',
    guru: 'Minta tim membacakan hipotesis yang <em>tidak</em> sesuai bukti dan menjelaskan apa yang membuat dugaan awal mereka keliru. Tekankan bahwa merevisi dugaan berdasarkan bukti adalah sikap ilmiah, bukan kegagalan.',
    pengantar:
      'Jalankan skrip hasil rakitan timmu di DBMS kosong. DBMS akan menolak bila ada yang keliru; bila berhasil, struktur hasilnya dicocokkan dengan ERD.',
    lulus:
      '<strong>Struktur DBMS sama persis dengan ERD.</strong> Lima tabel, semua kolom, kunci primer, dan kunci tamu sudah terbentuk.',
    pertanyaan: [
      soalPilih(
        'uMakna',
        'Pemeriksaan menunjukkan struktur DBMS sama dengan ERD. Apa artinya?',
        'wujud',
        [
          [
            'wujud',
            'Setiap entitas menjadi tabel, atribut menjadi kolom, dan kunci serta relasi menjadi constraint PRIMARY KEY dan FOREIGN KEY',
            '<strong>Tepat.</strong> Inilah inti mengidentifikasi struktur basis data dari ERD.',
          ],
          [
            'isi',
            'Data buku perpustakaan sudah tersimpan semua',
            'Semua tabel masih berisi 0 baris. DDL membangun struktur, bukan mengisi data.',
          ],
          [
            'erd',
            'ERD tidak diperlukan lagi dan boleh dibuang',
            'ERD tetap menjadi dokumentasi rancangan dan acuan bila struktur perlu diubah.',
          ],
          [
            'dml',
            'Skrip tadi termasuk perintah DML',
            'CREATE DATABASE dan CREATE TABLE termasuk DDL.',
          ],
        ]
      ),
      soalPilih(
        'uBalik',
        'Bila <code>detail_pinjam</code> dibuat <strong>paling awal</strong>, apa yang terjadi?',
        'tolak',
        [
          [
            'tolak',
            'DBMS menolak, karena tabel peminjaman dan buku yang dirujuknya belum ada',
            '<strong>Benar.</strong> Ini persis bukti dari Lab DDL langkah 5.',
          ],
          [
            'sama',
            'Tidak ada masalah, urutan tidak berpengaruh',
            'Ingat langkah 5 di Lab DDL: kunci tamu ke tabel yang belum ada ditolak.',
          ],
          [
            'otomatis',
            'DBMS otomatis membuat tabel peminjaman dan buku',
            'DBMS tidak menebak struktur tabel yang belum didefinisikan.',
          ],
          [
            'kosong',
            'detail_pinjam dibuat tanpa kolom',
            'DBMS menolak seluruh pernyataan; tidak ada tabel setengah jadi.',
          ],
        ]
      ),
      soalPilih(
        'uSikap',
        'Jika sebagian hipotesismu tidak sesuai bukti, langkah yang tepat adalah …',
        'revisi',
        [
          [
            'revisi',
            'Merevisi dugaan berdasarkan bukti dan mencatat alasannya',
            '<strong>Tepat.</strong> Dalam inkuiri, hipotesis diuji lalu diterima atau diperbaiki sesuai bukti.',
          ],
          [
            'ganti',
            'Mengganti bukti agar sesuai dengan hipotesis',
            'Bukti tidak boleh diubah; yang diperbaiki adalah dugaan.',
          ],
          [
            'abaikan',
            'Mengabaikan hipotesis yang salah',
            'Hipotesis yang keliru justru menunjukkan bagian yang perlu dipahami ulang.',
          ],
          [
            'ulang',
            'Menebak ulang tanpa melihat bukti',
            'Tebakan baru tanpa bukti tidak menambah pemahaman.',
          ],
        ]
      ),
    ],
  },

  /* ==========================================================
     SINTAKS 6 — Merumuskan kesimpulan
     ========================================================== */
  kesimpulan: {
    kicker: 'Tahap 9 · Merumuskan Kesimpulan',
    title: 'Simpulkan Temuan Timmu',
    goal: 'Merumuskan kesimpulan tentang konsep dan fungsi DDL serta cara menurunkan struktur dari ERD.',
    guru: 'Minta satu juru bicara per tim membacakan kesimpulan yang sudah lengkap, lalu bandingkan dengan rumusan masalah di tahap 2: apakah semua pertanyaan penyelidikan terjawab?',
    pengantar:
      'Lengkapi setiap bagian kesimpulan dengan istilah yang tepat berdasarkan bukti penyelidikanmu.',
    rumpang: [
      soalPilih('k1', 'DDL adalah kelompok perintah SQL untuk ___ basis data.', 'struktur', [
        [
          'struktur',
          'mendefinisikan dan mengubah struktur',
          '<strong>Benar.</strong> DDL bekerja pada wadah: basis data, tabel, kolom, dan constraint.',
        ],
        ['isi', 'mengisi dan mengubah isi data', 'Itu tugas DML (INSERT, UPDATE, DELETE).'],
        ['akses', 'memberi dan mencabut hak akses', 'Itu tugas DCL (GRANT, REVOKE).'],
        ['cetak', 'mencetak laporan', 'Mencetak laporan bukan fungsi bahasa SQL.'],
      ]),
      soalPilih(
        'k2',
        'Basis data dan tabel baru dibuat dengan perintah ___ , setelah basis datanya dipilih dengan USE.',
        'create',
        [
          ['create', 'CREATE', '<strong>Benar.</strong> CREATE DATABASE dan CREATE TABLE.'],
          ['insert', 'INSERT', 'INSERT mengisi baris data, bukan membuat tabel.'],
          ['alter', 'ALTER', 'ALTER mengubah objek yang sudah ada.'],
          ['grant', 'GRANT', 'GRANT memberi hak akses.'],
        ]
      ),
      soalPilih('k3', 'Struktur tabel yang sudah ada diubah dengan ___ .', 'alter', [
        [
          'alter',
          'ALTER TABLE (ADD, MODIFY, DROP COLUMN)',
          '<strong>Benar.</strong> Lab DDL langkah 7: kolom kelas ditambahkan tanpa membuat ulang tabel.',
        ],
        [
          'create',
          'CREATE TABLE sekali lagi',
          'Membuat ulang tabel yang sudah ada ditolak DBMS ("sudah ada").',
        ],
        ['update', 'UPDATE', 'UPDATE mengubah nilai data, bukan struktur.'],
        ['truncate', 'TRUNCATE TABLE', 'TRUNCATE mengosongkan isi.'],
      ]),
      soalPilih('k4', 'TRUNCATE TABLE ___ , sedangkan DROP TABLE ___ .', 'beda', [
        [
          'beda',
          'mengosongkan isi tetapi struktur tetap · menghapus struktur beserta isinya',
          '<strong>Benar.</strong> Bukti Lab DDL langkah 9 dan 13.',
        ],
        [
          'balik',
          'menghapus struktur beserta isinya · mengosongkan isi',
          'Terbalik — ingat lagi panel DBMS setelah langkah 9.',
        ],
        ['sama', 'menghapus tabel · menghapus tabel', 'Setelah TRUNCATE tabelnya masih ada.'],
        [
          'kolom',
          'menghapus satu kolom · menghapus satu baris',
          'Menghapus kolom memakai ALTER TABLE … DROP COLUMN.',
        ],
      ]),
      soalPilih(
        'k5',
        'Dari ERD: entitas → ___ , atribut → kolom bertipe data, kunci primer → PRIMARY KEY.',
        'tabel',
        [
          [
            'tabel',
            'tabel',
            '<strong>Benar.</strong> Satu entitas, termasuk entitas penghubung, menjadi satu tabel.',
          ],
          ['baris', 'baris data', 'Baris data adalah isi tabel, diisi kemudian dengan DML.'],
          [
            'db',
            'basis data',
            'Seluruh ERD menjadi satu basis data; setiap entitas menjadi tabel di dalamnya.',
          ],
          ['kolom', 'kolom', 'Kolom berasal dari atribut, bukan entitas.'],
        ]
      ),
      soalPilih(
        'k6',
        'Relasi diwujudkan dengan ___ , sehingga tabel induk harus dibuat lebih dulu.',
        'fk',
        [
          [
            'fk',
            'FOREIGN KEY … REFERENCES',
            '<strong>Benar.</strong> Relasi 1:N → kunci tamu di sisi banyak; M:N → tabel penghubung dengan dua kunci tamu.',
          ],
          ['pk', 'PRIMARY KEY', 'PRIMARY KEY menandai pengenal tabelnya sendiri, bukan relasi.'],
          ['notnull', 'NOT NULL', 'NOT NULL hanya mewajibkan kolom diisi.'],
          ['rename', 'RENAME TABLE', 'RENAME hanya mengganti nama tabel.'],
        ]
      ),
    ],
    paragraf: [
      '<strong>DDL</strong> (Data Definition Language) adalah perintah SQL untuk <strong>mendefinisikan dan mengubah struktur</strong> basis data — bukan isinya.',
      '<code>CREATE DATABASE</code> dan <code>CREATE TABLE</code> membuat struktur baru (setelah basis data dipilih dengan <code>USE</code>); <code>ALTER TABLE</code> mengubah struktur; <code>RENAME TABLE</code> mengganti nama; <code>TRUNCATE TABLE</code> mengosongkan isi; <code>DROP</code> menghapus struktur beserta isinya.',
      'Struktur basis data diidentifikasi dari ERD: <strong>entitas → tabel</strong>, <strong>atribut → kolom bertipe data</strong>, <strong>kunci primer → PRIMARY KEY</strong>, dan <strong>relasi → FOREIGN KEY</strong> (M:N lewat tabel penghubung berkunci gabungan). Tabel induk dibuat sebelum tabel yang merujuknya.',
    ],
  },

  evaluasi: {
    kicker: 'Tahap 10 · Evaluasi',
    title: 'Uji Pemahaman: Basis Data Lab RPL',
    goal: 'Menerapkan konsep DDL dan identifikasi struktur pada ERD baru.',
    guru: 'Kuis dikerjakan <strong>individu</strong> dan hanya bisa dijawab sekali. Setelah itu, uji silang skrip Tim Biru boleh didiskusikan berpasangan. Bahas dua soal dengan jawaban salah terbanyak di akhir pertemuan.',
    pengantarKuis:
      'Ingat ERD <strong>Sistem Peminjaman Alat Lab RPL</strong> dari materi 1.3? Kini ERD itu akan dibuat di DBMS. Jawab setiap soal (hanya sekali) berdasarkan ERD berikut.',
    erdJudul: 'ERD Sistem Peminjaman Alat Lab RPL',
    soal: [
      soalPilih('ev1', 'Berapa tabel yang dibuat dari ERD Lab RPL?', 'lima', [
        ['lima', '5 tabel', 'Empat entitas ditambah entitas penghubung Detail Peminjaman.'],
        ['empat', '4 tabel', 'Entitas penghubung Detail Peminjaman juga menjadi tabel.'],
        ['tiga', '3 tabel', 'Hitung semua kotak entitas pada ERD.'],
        ['delapan', '8 tabel', 'Relasi 1:N tidak menjadi tabel tersendiri.'],
      ]),
      soalPilih('ev2', 'Kunci primer tabel <code>detail_peminjaman</code> adalah …', 'gabung', [
        [
          'gabung',
          'PRIMARY KEY (no_pinjam, kode_alat)',
          'Kunci gabungan dari dua kunci tamu pada tabel penghubung.',
        ],
        [
          'no',
          'PRIMARY KEY (no_pinjam)',
          'Satu peminjaman bisa memuat banyak alat, sehingga no_pinjam akan kembar.',
        ],
        ['alat', 'PRIMARY KEY (kode_alat)', 'Satu alat bisa dipinjam berkali-kali.'],
        ['kondisi', 'PRIMARY KEY (kondisi_kembali)', 'Kondisi kembali bukan pengenal unik.'],
      ]),
      soalPilih('ev3', 'Tabel mana yang <strong>boleh</strong> dibuat pertama kali?', 'siswa', [
        ['siswa', 'siswa', 'siswa tidak punya kunci tamu, jadi tidak bergantung pada tabel lain.'],
        ['alat', 'alat', 'alat merujuk kategori_alat yang harus dibuat lebih dulu.'],
        ['pinjam', 'peminjaman', 'peminjaman merujuk siswa.'],
        ['detail', 'detail_peminjaman', 'detail_peminjaman merujuk peminjaman dan alat.'],
      ]),
      soalPilih(
        'ev4',
        'Petugas lab ingin menyimpan nomor HP siswa. Perintah yang tepat adalah …',
        'alter',
        [
          [
            'alter',
            'ALTER TABLE siswa ADD no_hp VARCHAR(15);',
            'ALTER TABLE … ADD menambah kolom baru pada tabel yang sudah ada.',
          ],
          [
            'create',
            'CREATE TABLE siswa (no_hp VARCHAR(15));',
            'Tabel siswa sudah ada; DBMS akan menolak.',
          ],
          [
            'update',
            'UPDATE siswa ADD no_hp VARCHAR(15);',
            'UPDATE mengubah nilai data dan tidak mengenal ADD.',
          ],
          [
            'insert',
            "INSERT INTO siswa (no_hp) VALUES ('0812');",
            'INSERT mengisi data ke kolom yang sudah ada; kolom no_hp belum ada.',
          ],
        ]
      ),
      soalPilih(
        'ev5',
        'Akhir semester, semua catatan kondisi alat di <code>detail_peminjaman</code> dikosongkan, tetapi tabelnya dipakai lagi semester depan. Perintahnya …',
        'truncate',
        [
          [
            'truncate',
            'TRUNCATE TABLE detail_peminjaman;',
            'TRUNCATE mengosongkan seluruh isi; struktur tabel tetap siap dipakai.',
          ],
          [
            'drop',
            'DROP TABLE detail_peminjaman;',
            'DROP menghapus tabelnya juga — semester depan harus dibuat ulang.',
          ],
          [
            'dropcol',
            'ALTER TABLE detail_peminjaman DROP COLUMN kondisi_kembali;',
            'Ini menghapus kolomnya (struktur), bukan isinya.',
          ],
          ['dropdb', 'DROP DATABASE db_lab;', 'Seluruh basis data lab ikut hilang!'],
        ]
      ),
      soalPilih('ev6', 'Tipe data yang tepat untuk <code>alat.id_kategori</code> adalah …', 'int', [
        [
          'int',
          'INT, sama dengan kategori_alat.id_kategori',
          'Kunci tamu wajib bertipe sama dengan kunci primer yang dirujuk.',
        ],
        [
          'varchar',
          'VARCHAR(5), karena berupa kode',
          'kategori_alat.id_kategori bertipe INT; tipe berbeda ditolak DBMS.',
        ],
        ['date', 'DATE', 'id_kategori bukan tanggal.'],
        [
          'bebas',
          'Bebas, asal NOT NULL',
          'Tipe kunci tamu tidak bebas: harus sama dengan kunci yang dirujuk.',
        ],
      ]),
      soalPilih('ev7', 'Manakah yang termasuk perintah <strong>DDL</strong>?', 'ddl', [
        [
          'ddl',
          'CREATE TABLE kategori_alat (id_kategori INT);',
          'CREATE TABLE membuat struktur — DDL.',
        ],
        [
          'dml',
          "INSERT INTO siswa VALUES ('23001', 'Ayu', 'XI RPL 1');",
          'INSERT mengisi data — DML.',
        ],
        ['dml2', "UPDATE alat SET nama_alat = 'Laptop';", 'UPDATE mengubah data — DML.'],
        ['dcl', 'GRANT SELECT ON alat TO petugas;', 'GRANT mengatur hak akses — DCL.'],
      ]),
    ],
    ujiSilang: {
      pengantar:
        'Tim Biru menulis skrip DDL untuk ERD Lab RPL, tetapi skripnya gagal dijalankan dan strukturnya tidak sesuai ERD. Periksa skrip berikut.',
      judul: 'Skrip DDL Tim Biru',
      skrip: SKRIP_TIM_BIRU,
      tanya:
        'Kesalahan apa saja yang ada pada skrip Tim Biru? <strong>Pilih semua yang tepat.</strong>',
      opsi: [
        {
          id: 'urut',
          label: 'Tabel alat dibuat sebelum tabel kategori_alat yang dirujuknya',
          benar: true,
          alasan:
            'Kunci tamu alat.id_kategori merujuk tabel yang belum ada, sehingga DBMS menolak.',
        },
        {
          id: 'tipe',
          label:
            'alat.id_kategori bertipe VARCHAR(5), padahal kategori_alat.id_kategori bertipe INT',
          benar: true,
          alasan: 'Tipe kunci tamu harus sama dengan kunci primer yang dirujuk.',
        },
        {
          id: 'pk',
          label:
            'Kunci primer detail_peminjaman hanya no_pinjam, seharusnya (no_pinjam, kode_alat)',
          benar: true,
          alasan: 'Tabel penghubung M:N memakai kunci gabungan; no_pinjam saja akan kembar.',
        },
        {
          id: 'db',
          label: 'CREATE DATABASE seharusnya ditulis setelah semua CREATE TABLE',
          benar: false,
          alasan: 'Justru basis data harus dibuat dan dipilih (USE) lebih dulu.',
        },
        {
          id: 'nis',
          label: 'peminjaman.nis seharusnya bertipe INT',
          benar: false,
          alasan:
            'siswa.nis bertipe VARCHAR(10), jadi peminjaman.nis yang VARCHAR(10) sudah tepat.',
        },
        {
          id: 'siswa',
          label: 'Tabel siswa tidak perlu PRIMARY KEY karena tidak punya kunci tamu',
          benar: false,
          alasan: 'Setiap tabel butuh kunci primer, apalagi siswa dirujuk oleh peminjaman.',
        },
      ],
      done: '<strong>Teliti!</strong> Kamu menemukan ketiga kesalahan Tim Biru: urutan tabel, tipe kunci tamu, dan kunci gabungan.',
    },
  },

  refleksi: {
    kicker: 'Tahap 11 · Refleksi',
    title: 'Refleksi Penyelidikan',
    goal: 'Menilai pemahaman diri dan proses penyelidikan tentang SQL DDL.',
    guru: 'Beri 5 menit refleksi mandiri. Baca sekilas jawaban terbuka untuk menemukan konsep yang masih membingungkan (biasanya TRUNCATE vs DROP atau tipe kunci tamu) sebagai bahan pertemuan berikutnya: praktik DML.',
    skala: [
      { value: 1, label: 'Belum bisa' },
      { value: 2, label: 'Masih ragu' },
      { value: 3, label: 'Cukup bisa' },
      { value: 4, label: 'Bisa' },
      { value: 5, label: 'Sangat bisa' },
    ],
    pernyataan: [
      { id: 'p1', teks: 'Aku bisa menjelaskan pengertian DDL dan membedakannya dari DML dan DCL.' },
      { id: 'p2', teks: 'Aku bisa menjelaskan fungsi CREATE, ALTER, DROP, TRUNCATE, dan RENAME.' },
      {
        id: 'p3',
        teks: 'Aku bisa mengidentifikasi tabel, kolom, tipe data, PK, dan FK dari sebuah ERD.',
      },
      { id: 'p4', teks: 'Aku bisa menentukan urutan pembuatan tabel yang saling berelasi.' },
      { id: 'p5', teks: 'Aku berani menguji dugaanku sendiri dan merevisinya berdasarkan bukti.' },
    ],
    tanyaTerbuka:
      'Hipotesis mana yang paling meleset dari bukti, dan apa yang membuatmu berubah pikiran?',
  },

  selesai: {
    kicker: 'Tahap 12 · Selesai',
    title: 'Basis Data Perpustakaan Siap Diisi!',
    goal: 'Melihat rekap skor dan skrip DDL hasil penyelidikan.',
    pesan:
      'DBMS perpustakaan kini punya lima tabel yang sesuai ERD. Bu Sari tinggal menunggu pertemuan berikutnya: mengisi datanya dengan perintah DML.',
    rangkuman: [
      '<strong>DDL</strong> mengatur struktur basis data; <strong>DML</strong> mengolah isinya; <strong>DCL</strong> mengatur hak akses.',
      '<code>CREATE DATABASE</code> + <code>USE</code> menyiapkan wadah; <code>CREATE TABLE</code> membuat tabel beserta kolom, tipe data, dan constraint.',
      '<code>ALTER TABLE</code> mengubah struktur tanpa menghapus isi; <code>RENAME TABLE</code> mengganti nama.',
      '<code>TRUNCATE</code> mengosongkan isi (struktur tetap); <code>DROP</code> menghapus struktur beserta isinya.',
      'Dari ERD: entitas → tabel, atribut → kolom bertipe data, kunci primer → <code>PRIMARY KEY</code>, relasi → <code>FOREIGN KEY</code>; tabel induk dibuat lebih dulu.',
    ],
  },
};

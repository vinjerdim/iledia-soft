'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Mengubah Struktur Tabel dengan
   ALTER TABLE (Menambah, Mengubah, dan Menghapus Kolom)
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js (seksi 17 SQL DDL: simulator, kamus data,
   editor DDL berpemeriksa, skema berisi data, beda skema). Guru
   dapat menyunting teks, soal, kunci, dan umpan balik di sini
   tanpa menyentuh kode.

   Masalah autentik (lanjutan MPI 2.2): basis data `bank_sampah`
   sudah dipakai satu semester dan BERISI DATA. Pembina Bank Sampah
   mengirim permintaan perubahan: aplikasi galat karena kolom saldo,
   email, dan no_wa belum ada, nama jenis sampah terpotong, dan
   kolom nama_nasabah di setoran membuat laporan tidak konsisten.
   Tim junior mengusulkan "DROP TABLE lalu CREATE ulang" — yang
   akan menghapus data. Tim murid mengubah struktur v1 → v2 dengan
   ALTER TABLE (ADD, MODIFY / CHANGE / RENAME COLUMN, DROP COLUMN),
   menulisnya SENDIRI di editor DDL, menguji di DBMS tiruan yang
   berisi data, lalu menyajikan bukti sebelum–sesudah. Kasus
   transfer pada evaluasi: Servis Laptop TEFA (MPI 2.2).

   Pemetaan sintaks PBL → tahap media:
     1. Orientasi murid pada masalah
                         → orientasi   (TP, alur, apersepsi)
                         → masalah     (memo perubahan, log galat,
                                        DBMS v1 berisi data vs kamus
                                        data v2, akar masalah,
                                        rumusan masalah)
     2. Mengorganisasi murid untuk belajar
                         → organisasi  (peran tim, rencana langkah)
     3. Membimbing penyelidikan individu & kelompok
                         → konsep      (kartu sintaks ALTER TABLE,
                                        pilah aksi & dampak data)
                         → tambah      (selidiki ADD di konsol, tulis
                                        ADD saldo & email sendiri)
                         → ubah        (jebakan MODIFY di konsol,
                                        rumpang MODIFY, tulis MODIFY
                                        & ganti nama kolom sendiri)
     4. Mengembangkan & menyajikan hasil karya
                         → hapus       (DROP COLUMN, kolom yang
                                        dirujuk kunci tamu, tulis
                                        sendiri)
                         → sajikan     (jalankan skrip migrasi tim di
                                        DBMS v1, beda sebelum–sesudah,
                                        klaim presentasi)
     5. Menganalisis & mengevaluasi proses pemecahan masalah
                         → evaluasi    (kasus Servis Laptop TEFA +
                                        uji silang skrip Tim Biru)
                         → refleksi
     Penutup             → selesai

   KONVENSI: rancangan memakai format ERD engine seksi 15 dengan
   `tipe`, `wajib`, `bawaan` (DEFAULT), dan `ket` per atribut serta
   `tabel` per entitas (seksi 17). `baris` = jumlah baris data yang
   sudah ada di DBMS. `kunci` berisi skrip contoh tiap editor;
   semuanya diuji otomatis terhadap simulator engine
   (tests/mpi-f-2.3-data.test.js).

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

/* ---------- Rancangan Bank Sampah: v1 (di DBMS) dan v2 (baru) ---------- */

function atributSetoran(denganNama) {
  var a = [
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
  ];
  if (denganNama) {
    a.push({
      id: 's_nama',
      teks: 'nama_nasabah',
      tipe: 'VARCHAR(50)',
      wajib: true,
      ket: 'Salinan nama nasabah (ditambahkan tim lama)',
    });
  }
  return a.concat([
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
  ]);
}

var PETUGAS = {
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
};

var ERD_V1 = {
  entitas: [
    {
      id: 'setoran',
      tabel: 'setoran',
      label: 'Setoran',
      ikon: '♻️',
      atribut: atributSetoran(true),
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
        { id: 'j_harga', teks: 'harga_per_kg', tipe: 'INT', wajib: true, ket: 'Rupiah tanpa sen' },
      ],
    },
    PETUGAS,
  ],
  relasi: [],
};

var ERD_V2 = {
  entitas: [
    {
      id: 'setoran',
      tabel: 'setoran',
      label: 'Setoran',
      ikon: '♻️',
      atribut: atributSetoran(false),
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
        {
          id: 'n_wa',
          teks: 'no_wa',
          tipe: 'VARCHAR(15)',
          ket: 'BERUBAH: dulu no_hp, isinya tetap. Boleh kosong',
        },
        {
          id: 'n_saldo',
          teks: 'saldo',
          tipe: 'INT',
          wajib: true,
          bawaan: 0,
          ket: 'BARU: saldo tabungan (rupiah), mulai dari 0',
        },
        {
          id: 'n_email',
          teks: 'email',
          tipe: 'VARCHAR(60)',
          ket: 'BARU: untuk struk digital. Boleh kosong',
        },
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
          tipe: 'VARCHAR(60)',
          wajib: true,
          ket: 'BERUBAH: diperbesar dari 30 ke 60 karakter',
        },
        { id: 'j_harga', teks: 'harga_per_kg', tipe: 'INT', wajib: true, ket: 'Rupiah tanpa sen' },
      ],
    },
    PETUGAS,
  ],
  relasi: [],
};

/* Jumlah baris yang sudah ada setelah satu semester. */
var BARIS_BANK = { setoran: 1342, nasabah: 128, jenis_sampah: 9, petugas: 6 };

/* ---------- Kasus transfer evaluasi: Servis Laptop TEFA (MPI 2.2) ---------- */

function erdTefa(v2) {
  return {
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
        ].concat(v2 ? [{ id: 's_keluhan', teks: 'keluhan', tipe: 'TEXT' }] : []),
      },
      {
        id: 'pelanggan',
        tabel: 'pelanggan',
        label: 'Pelanggan',
        ikon: '🙋',
        atribut: [
          { id: 'p_kode', teks: 'kode_plg', pk: true, tipe: 'CHAR(3)', ket: 'Mis. P01' },
          { id: 'p_nama', teks: 'nama_plg', tipe: 'VARCHAR(50)', wajib: true },
          v2
            ? { id: 'p_wa', teks: 'no_wa', tipe: 'VARCHAR(15)' }
            : { id: 'p_hp', teks: 'no_hp', tipe: 'VARCHAR(15)' },
        ].concat(
          v2
            ? []
            : [{ id: 'p_fax', teks: 'no_fax', tipe: 'VARCHAR(15)', ket: 'Tidak dipakai lagi' }]
        ),
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
          { id: 'l_nama', teks: 'nama_lay', tipe: v2 ? 'VARCHAR(80)' : 'VARCHAR(40)', wajib: true },
          { id: 'l_biaya', teks: 'biaya', tipe: 'DECIMAL(10,2)', wajib: true, ket: 'Rupiah' },
        ],
      },
    ],
    relasi: [],
  };
}

var BARIS_TEFA = { detail_servis: 310, servis: 214, pelanggan: 150, teknisi: 5, layanan: 12 };

/* ---------- Skrip yang dipakai berulang ---------- */

var SQL_SETORAN_BARU =
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
  ');';

/* Skrip Tim Biru (uji silang): DBMS menerima SEMUA perintahnya, tetapi
   hasilnya keliru di tiga tempat — MODIFY tanpa NOT NULL, ganti nama
   lewat DROP + ADD (isi no_hp hilang), dan setoran dibuat ulang (1342
   baris hilang). */
var SKRIP_TIM_BIRU =
  '-- Migrasi bank_sampah v1 → v2 versi Tim Biru\n' +
  'ALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0, ADD email VARCHAR(60);\n' +
  'ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60);\n' +
  'ALTER TABLE nasabah DROP COLUMN no_hp;\n' +
  'ALTER TABLE nasabah ADD no_wa VARCHAR(15);\n' +
  'DROP TABLE setoran;\n' +
  SQL_SETORAN_BARU;

/* Pernyataan berumpang tahap Ubah; __n__ = isian ke-n. */
var RUMPANG_UBAH = 'ALTER TABLE jenis_sampah __1__ nama_jenis __2__ __3__;';

var DATA = {
  meta: {
    judul: 'Mengubah Struktur Tabel dengan ALTER TABLE',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Problem Based Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Orientasi pada Masalah' },
    {
      id: 'masalah',
      label: 'Permintaan Perubahan',
      sintaks: 'Sintaks 1 · Orientasi pada Masalah',
    },
    {
      id: 'organisasi',
      label: 'Bentuk Tim',
      sintaks: 'Sintaks 2 · Mengorganisasi Murid untuk Belajar',
    },
    { id: 'konsep', label: 'Bekal Sintaks', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'tambah', label: 'Tambah Kolom', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'ubah', label: 'Ubah Kolom', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    {
      id: 'hapus',
      label: 'Hapus Kolom',
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

  erdV1: ERD_V1,
  erdV2: ERD_V2,
  baris: BARIS_BANK,
  namaDb: 'bank_sampah',
  erdTefa: erdTefa(false),
  erdTefaV2: erdTefa(true),
  barisTefa: BARIS_TEFA,
  namaDbTefa: 'tefa_servis',

  /* Skrip contoh tiap editor — kunci guru & bahan tes otomatis.
     Murid boleh menulis versi lain (mis. CHANGE, AFTER, satu atau
     beberapa pernyataan) selama hasilnya sesuai rancangan v2 dan
     tidak ada data yang hilang. */
  kunci: {
    tambah: 'ALTER TABLE nasabah\n  ADD saldo INT NOT NULL DEFAULT 0,\n  ADD email VARCHAR(60);',
    ubah:
      'ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60) NOT NULL;\n' +
      'ALTER TABLE nasabah RENAME COLUMN no_hp TO no_wa;',
    hapus: 'ALTER TABLE setoran DROP COLUMN nama_nasabah;',
  },

  /* ==========================================================
     SINTAKS 1 — Orientasi pada masalah
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Rancangan Berubah, Data Sudah Ada',
    goal: 'Mengetahui tujuan belajar, alur pemecahan masalah, dan cara memakai media ini.',
    guru: 'Kaitkan dengan MPI 2.2: basis data bank_sampah yang dibuat murid kini sudah dipakai satu semester dan berisi ribuan baris. Tekankan bahwa di dunia kerja rancangan basis data hampir selalu berubah setelah aplikasi berjalan. Minta murid menjawab pemanasan tanpa dinilai — jawaban "hapus lalu buat ulang" justru bahan diskusi yang bagus.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Mengubah struktur tabel menggunakan perintah ALTER TABLE (menambah, mengubah, dan menghapus kolom) sesuai kebutuhan perubahan rancangan basis data.',
    kriteria: [
      'Membandingkan struktur tabel di DBMS dengan rancangan baru dan mendaftar perubahan per kolom: tambah, ubah, atau hapus.',
      'Menambah kolom dengan ALTER TABLE … ADD, termasuk NOT NULL dan DEFAULT untuk tabel yang sudah berisi data.',
      'Mengubah kolom dengan MODIFY (tipe, panjang, aturan) dan mengganti nama kolom dengan RENAME COLUMN atau CHANGE tanpa kehilangan isinya.',
      'Menghapus kolom dengan ALTER TABLE … DROP COLUMN dan menjelaskan dampaknya terhadap data serta kunci tamu.',
      'Menguji skrip ALTER di DBMS, memastikan data lama tetap utuh, dan mengevaluasi skrip tim lain.',
    ],
    pengantar:
      'Satu semester lalu timmu membangun basis data <strong>bank_sampah</strong>. Sekarang isinya sudah ribuan baris setoran. Pembina Bank Sampah meminta fitur baru, tetapi aplikasi galat karena <strong>struktur tabelnya belum sesuai rancangan baru</strong>. Ubah strukturnya — tanpa menghilangkan satu pun data tabungan siswa.',
    alur: [
      { judul: 'Masalah', desk: 'Baca permintaan perubahan, log galat, dan rancangan v2.' },
      { judul: 'Bentuk Tim', desk: 'Bagi peran dan susun rencana migrasi struktur.' },
      { judul: 'Bekal Sintaks', desk: 'Kenali ADD, MODIFY, CHANGE, RENAME COLUMN, DROP COLUMN.' },
      { judul: 'Tambah Kolom', desk: 'Selidiki ADD di konsol, lalu tambah saldo dan email.' },
      { judul: 'Ubah Kolom', desk: 'Perbesar nama_jenis dan ganti nama no_hp menjadi no_wa.' },
      { judul: 'Hapus Kolom', desk: 'Buang kolom redundan setoran.nama_nasabah.' },
      { judul: 'Sajikan Hasil', desk: 'Tunjukkan bukti sebelum–sesudah dan data yang utuh.' },
      { judul: 'Evaluasi', desk: 'Terapkan pada Servis Laptop TEFA dan uji skrip Tim Biru.' },
    ],
    caraPakai: [
      'DBMS tiruan di media ini <strong>sudah berisi data</strong> — jumlah barisnya tampil di setiap kartu tabel. Perhatikan apakah jumlah itu berubah setelah skripmu dijalankan.',
      'Kamu <strong>mengetik skrip ALTER TABLE sendiri</strong> di editor. Tekan <em>Jalankan &amp; periksa</em>: hasilnya dibandingkan dengan rancangan v2, dan perubahan struktur ditandai ➕ baru, ✏️ diubah, 🔁 ganti nama, ➖ dihapus.',
      'Galat bukan kegagalan — baca pesan DBMS, perbaiki, dan jalankan lagi. Petunjuk bertingkat tersedia bila buntu.',
      'Pertanyaan boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama. Kuis evaluasi hanya bisa dijawab sekali. Urutan pilihan diacak, dan tombol Reset mengacak ulang.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: rancangan tabel berubah, padahal tabelnya sudah berisi ribuan baris data. Apa yang akan kamu lakukan?',
      opsi: [
        { id: 'alter', label: 'Ubah struktur tabel yang ada tanpa menghapus datanya' },
        { id: 'ulang', label: 'Hapus tabelnya lalu buat ulang sesuai rancangan baru' },
        { id: 'baru', label: 'Buat tabel baru di sampingnya dan biarkan tabel lama' },
        { id: 'biar', label: 'Biarkan saja, aplikasinya yang harus menyesuaikan' },
      ],
      umpan:
        'Simpan jawabanmu — tahap berikutnya memberi bukti. Ingat MPI 2.1: perintah DDL <strong>ALTER</strong> dibuat khusus untuk mengubah struktur objek yang sudah ada, sedangkan DROP menghapusnya beserta seluruh isinya.',
    },
  },

  masalah: {
    kicker: 'Tahap 2 · Orientasi pada Masalah',
    title: 'Permintaan Perubahan dari Bank Sampah',
    goal: 'Menemukan akar masalah dari log galat, struktur DBMS saat ini, dan rancangan v2, lalu merumuskan masalah.',
    guru: 'Bacakan memo Bu Rina. Minta tim mencocokkan setiap baris log dengan kolom di rancangan v2 (cari kata <em>BARU</em> dan <em>BERUBAH</em> di kolom Keterangan) dan menunjuk jumlah baris di panel DBMS. Diskusikan usulan tim junior: apa yang terjadi pada 1.342 setoran bila tabelnya di-DROP? Rumusan masalah tidak dinilai otomatis.',
    kutipan:
      '"Aplikasi versi baru sudah siap: ada saldo tabungan, struk lewat email, dan notifikasi WhatsApp. Tapi begitu dipasang, muncul pesan merah di mana-mana. Tim junior bilang tabelnya dihapus saja lalu dibuat ulang. Jangan sampai tabungan anak-anak hilang, ya!" — Bu Rina, pembina Bank Sampah',
    logJudul: 'Log galat aplikasi versi baru',
    namaPanjang: 'Kemasan karton minuman (Tetra Pak)',
    log: [
      "[07:05] Simpan jenis 'Kemasan karton minuman (Tetra Pak)' … gagal: Data too long for column 'nama_jenis' at row 1",
      "[07:20] Tampilkan saldo nasabah … gagal: Unknown column 'saldo' in 'field list'",
      "[07:21] Kirim struk digital … gagal: Unknown column 'email' in 'field list'",
      "[07:30] Kirim notifikasi WA … gagal: Unknown column 'no_wa' in 'field list'",
      "[07:45] Laporan setoran: nama 'Dewi Lestari' ≠ data nasabah 'Dewi Lestari Putri'",
    ],
    skemaJudul: 'Isi DBMS saat ini (v1, sudah berisi data)',
    kamusJudul: 'Rancangan baru yang disetujui (kamus data v2)',
    akar: {
      tanya:
        'Berdasarkan log galat, panel DBMS, dan kamus data v2, pilih SEMUA pernyataan yang tepat tentang masalahnya.',
      opsi: [
        {
          id: 'struktur',
          label: 'Struktur tabel di DBMS masih versi lama, belum sesuai rancangan v2',
          benar: true,
          alasan:
            '"Unknown column" dan "Data too long" muncul karena kolom saldo, email, no_wa belum ada dan nama_jenis masih VARCHAR(30).',
        },
        {
          id: 'data',
          label: 'Tabel-tabelnya sudah berisi data yang tidak boleh hilang',
          benar: true,
          alasan:
            'Panel DBMS menunjukkan 1.342 setoran dan 128 nasabah — semuanya catatan tabungan siswa.',
        },
        {
          id: 'kolom',
          label: 'Perubahannya cukup pada kolom tertentu: menambah, mengubah, dan menghapus kolom',
          benar: true,
          alasan:
            'Nama tabel dan kuncinya tetap; yang berubah hanya beberapa kolom. Itu pekerjaan ALTER TABLE.',
        },
        {
          id: 'drop',
          label: 'Solusi terbaik: DROP TABLE semua tabel lalu CREATE TABLE ulang',
          benar: false,
          alasan:
            'DROP TABLE menghapus tabel beserta seluruh isinya. Tabel nasabah bahkan ditolak dihapus karena dirujuk kunci tamu setoran.',
        },
        {
          id: 'insert',
          label: 'Masalahnya selesai bila data baru dimasukkan dengan INSERT',
          benar: false,
          alasan:
            'INSERT mengisi baris ke kolom yang sudah ada. Kolom saldo dan email justru belum ada.',
        },
        {
          id: 'aplikasi',
          label: 'Aplikasi harus dikembalikan ke versi lama agar cocok dengan tabel',
          benar: false,
          alasan:
            'Rancangan v2 sudah disetujui pembina; yang harus menyesuaikan adalah struktur basis datanya.',
        },
      ],
      done: '<strong>Akar masalah ditemukan:</strong> struktur tabel harus diubah ke v2 dengan ALTER TABLE, sementara data yang sudah ada wajib tetap utuh.',
    },
    rumusan: {
      label: 'Rumusan masalah tim',
      petunjuk:
        'Tulis rumusan masalah dalam bentuk pertanyaan yang memuat kata "struktur", "rancangan", dan "data".',
      placeholder:
        'Contoh: Bagaimana mengubah struktur tabel bank_sampah agar sesuai rancangan v2 tanpa menghilangkan data yang sudah ada?',
      min: 40,
    },
  },

  /* ==========================================================
     SINTAKS 2 — Mengorganisasi murid untuk belajar
     ========================================================== */
  organisasi: {
    kicker: 'Tahap 3 · Mengorganisasi Belajar',
    title: 'Bentuk Tim Migrasi Struktur',
    goal: 'Membagi peran tim dan menyusun rencana langkah mengubah struktur tabel dengan aman.',
    guru: 'Bentuk tim berempat. Analis Perubahan memegang kamus data v2 dan membuat daftar perubahan per kolom di kertas; Penulis Skrip mengetik; Penguji wajib menyebut jumlah baris sebelum dan sesudah setiap skrip. Bahas mengapa basis data dicadangkan (backup) sebelum diubah — di DBMS sungguhan, kesalahan ALTER tidak bisa di-undo.',
    peran: [
      {
        id: 'analis',
        ikon: '🧭',
        label: 'Analis Perubahan',
        tugas: 'Membandingkan struktur v1 dan rancangan v2, lalu mendaftar perubahan per kolom.',
      },
      {
        id: 'penulis',
        ikon: '⌨️',
        label: 'Penulis Skrip',
        tugas: 'Mengetik perintah ALTER TABLE di editor sesuai daftar perubahan.',
      },
      {
        id: 'penguji',
        ikon: '🔍',
        label: 'Penguji (DBA)',
        tugas:
          'Menjalankan skrip, membaca pesan DBMS, dan memastikan jumlah baris data tidak berkurang.',
      },
      {
        id: 'jubir',
        ikon: '📣',
        label: 'Juru Bicara',
        tugas: 'Mencatat bukti sebelum–sesudah dan menyajikannya ke pembina.',
      },
    ],
    rencana: {
      pengantar:
        'Susun rencana kerja tim. Ketuk kartu sesuai urutan yang paling aman untuk mengubah struktur basis data yang sudah berisi data.',
      items: [
        { id: 'r1', label: 'Bandingkan struktur tabel di DBMS dengan rancangan v2' },
        { id: 'r2', label: 'Catat daftar perubahan per kolom: tambah, ubah, atau hapus' },
        { id: 'r3', label: 'Cadangkan (backup) basis data sebelum diubah' },
        { id: 'r4', label: 'Tulis dan jalankan ALTER TABLE untuk setiap perubahan' },
        { id: 'r5', label: 'Periksa: struktur sesuai v2 dan jumlah baris tetap' },
        { id: 'r6', label: 'Sajikan bukti sebelum–sesudah ke pembina' },
      ],
      sukses:
        '<strong>Rencana tim siap!</strong> Kenali dulu apa yang berubah, amankan datanya, ubah strukturnya, lalu buktikan hasilnya.',
      salah:
        'Ingat: kamu tidak bisa menulis perintah sebelum tahu kolom mana yang berubah, dan cadangan harus dibuat <em>sebelum</em> struktur diubah.',
    },
  },

  /* ==========================================================
     SINTAKS 3 — Membimbing penyelidikan
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Membimbing Penyelidikan',
    title: 'Bekal Sintaks: Keluarga ALTER TABLE',
    goal: 'Mengenali bentuk ALTER TABLE untuk menambah, mengubah, mengganti nama, dan menghapus kolom serta dampaknya terhadap data.',
    guru: 'Minta Analis Perubahan membuka kartu sintaks dan menjelaskannya dengan kata-kata sendiri. Pada pemilahan dampak, tanyakan "Bagaimana kamu tahu datanya tetap?" — jawabannya ada pada jenis perintahnya: ADD menambah kolom kosong/bawaan, MODIFY & RENAME menjaga isi, DROP menghapus permanen.',
    pengantar:
      'Semua perintah di bawah <strong>mengubah struktur</strong> tabel yang sudah ada — bukan isinya. Buka kartunya, lalu latih memilih perintah yang tepat dan memperkirakan dampaknya.',
    kartu: [
      {
        ikon: '➕',
        istilah: 'ADD',
        def: 'Menambah kolom baru di akhir tabel. Baris lama berisi NULL di kolom itu.',
        contoh: 'ALTER TABLE nasabah\n  ADD email VARCHAR(60);',
      },
      {
        ikon: '0️⃣',
        istilah: 'NOT NULL DEFAULT',
        def: 'Kolom wajib yang ditambahkan ke tabel berisi data perlu nilai bawaan agar baris lama terisi otomatis.',
        contoh: 'ALTER TABLE nasabah\n  ADD saldo INT NOT NULL DEFAULT 0;',
      },
      {
        ikon: '📍',
        istilah: 'AFTER / FIRST',
        def: 'Opsional: menentukan letak kolom (setelah kolom tertentu, atau paling depan). Tanpa itu, kolom ditaruh di akhir.',
        contoh: 'ALTER TABLE nasabah\n  ADD email VARCHAR(60) AFTER kelas;',
      },
      {
        ikon: '✏️',
        istilah: 'MODIFY',
        def: 'Mengganti definisi kolom (tipe, panjang, aturan). Tulis ulang definisi LENGKAP — aturan yang tidak ditulis ulang, seperti NOT NULL, akan hilang.',
        contoh: 'ALTER TABLE jenis_sampah\n  MODIFY nama_jenis VARCHAR(60) NOT NULL;',
      },
      {
        ikon: '🔁',
        istilah: 'RENAME COLUMN',
        def: 'Mengganti nama kolom. Isi, tipe, dan aturannya tetap.',
        contoh: 'ALTER TABLE nasabah\n  RENAME COLUMN no_hp TO no_wa;',
      },
      {
        ikon: '🔀',
        istilah: 'CHANGE',
        def: 'Gaya MySQL: mengganti nama sekaligus definisi kolom. Tulis nama lama, nama baru, lalu definisi lengkap.',
        contoh: 'ALTER TABLE nasabah\n  CHANGE no_hp no_wa VARCHAR(15);',
      },
      {
        ikon: '➖',
        istilah: 'DROP COLUMN',
        def: 'Menghapus kolom beserta isinya di semua baris — permanen. Kolom yang dirujuk kunci tamu tidak bisa dihapus.',
        contoh: 'ALTER TABLE setoran\n  DROP COLUMN nama_nasabah;',
      },
      {
        ikon: '🧩',
        istilah: 'Beberapa sekaligus',
        def: 'Beberapa perubahan pada satu tabel boleh ditulis dalam satu ALTER TABLE, dipisah koma.',
        contoh:
          'ALTER TABLE nasabah\n  ADD email VARCHAR(60),\n  ADD saldo INT NOT NULL DEFAULT 0;',
      },
    ],
    aksi: {
      pengantar: 'Perintah ALTER TABLE apa yang menjawab setiap permintaan perubahan berikut?',
      kategori: [
        { id: 'add', label: 'ADD (tambah kolom)' },
        { id: 'modify', label: 'MODIFY (ubah definisi)' },
        { id: 'rename', label: 'RENAME COLUMN / CHANGE (ganti nama)' },
        { id: 'drop', label: 'DROP COLUMN (hapus kolom)' },
      ],
      items: [
        {
          id: 'a1',
          teks: 'Nasabah butuh kolom saldo tabungan',
          correct: 'add',
          explanation: 'Kolom saldo belum ada sama sekali → tambahkan dengan ADD.',
        },
        {
          id: 'a2',
          teks: 'Nama jenis "Kemasan karton minuman (Tetra Pak)" tidak muat di VARCHAR(30)',
          correct: 'modify',
          explanation: 'Kolomnya sudah ada, hanya panjangnya yang diperbesar → MODIFY.',
        },
        {
          id: 'a3',
          teks: 'Kolom no_hp kini khusus nomor WhatsApp dan diganti nama menjadi no_wa',
          correct: 'rename',
          explanation:
            'Isinya tetap, hanya namanya berubah → RENAME COLUMN atau CHANGE, bukan hapus lalu tambah.',
        },
        {
          id: 'a4',
          teks: 'Kolom nama_nasabah di tabel setoran ganda dengan tabel nasabah',
          correct: 'drop',
          explanation: 'Data ganda (redundan) dibuang → DROP COLUMN.',
        },
        {
          id: 'a5',
          teks: 'Kolom kelas yang tadinya boleh kosong kini wajib diisi',
          correct: 'modify',
          explanation: 'Aturan kolom berubah (tambah NOT NULL) → MODIFY dengan definisi lengkap.',
        },
        {
          id: 'a6',
          teks: 'Petugas perlu kolom jadwal piket',
          correct: 'add',
          explanation: 'Kolom baru → ADD.',
        },
        {
          id: 'a7',
          teks: 'Kolom catatan_lama tidak pernah dipakai lagi oleh aplikasi',
          correct: 'drop',
          explanation: 'Kolom yang sudah tidak diperlukan dihapus dengan DROP COLUMN.',
        },
      ],
    },
    dampak: {
      pengantar:
        'Tabel di bank_sampah sudah berisi data. Apa yang terjadi pada data lama bila perintah berikut dijalankan?',
      kategori: [
        { id: 'tetap', label: 'Data lama tetap utuh' },
        { id: 'bawaan', label: 'Kolom baru, baris lama diisi NULL/DEFAULT' },
        { id: 'hilang', label: 'Sebagian data hilang permanen' },
      ],
      items: [
        {
          id: 'd1',
          teks: 'ALTER TABLE nasabah ADD email VARCHAR(60);',
          sql: 'ALTER TABLE nasabah ADD email VARCHAR(60);',
          correct: 'bawaan',
          explanation: 'Kolom baru tanpa DEFAULT: 128 nasabah lama berisi NULL di kolom email.',
        },
        {
          id: 'd2',
          teks: 'ALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0;',
          sql: 'ALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0;',
          correct: 'bawaan',
          explanation: 'Semua nasabah lama otomatis bersaldo 0 berkat DEFAULT 0.',
        },
        {
          id: 'd3',
          teks: 'ALTER TABLE nasabah RENAME COLUMN no_hp TO no_wa;',
          sql: 'ALTER TABLE nasabah RENAME COLUMN no_hp TO no_wa;',
          correct: 'tetap',
          explanation: 'Hanya namanya yang berganti; nomor-nomor lama tetap ada di kolom no_wa.',
        },
        {
          id: 'd4',
          teks: 'ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60) NOT NULL;',
          sql: 'ALTER TABLE jenis_sampah MODIFY nama_jenis VARCHAR(60) NOT NULL;',
          correct: 'tetap',
          explanation: 'Panjang diperbesar, jadi semua nama lama tetap muat.',
        },
        {
          id: 'd5',
          teks: 'ALTER TABLE setoran DROP COLUMN nama_nasabah;',
          sql: 'ALTER TABLE setoran DROP COLUMN nama_nasabah;',
          correct: 'hilang',
          explanation:
            'Isi kolom itu pada 1.342 baris ikut terhapus. Aman di sini karena namanya masih tersimpan di tabel nasabah.',
        },
        {
          id: 'd6',
          teks: 'DROP TABLE setoran; lalu CREATE TABLE setoran ( … ) versi baru',
          sql: 'DROP TABLE setoran;\n' + SQL_SETORAN_BARU,
          correct: 'hilang',
          explanation:
            'Strukturnya memang jadi sesuai v2, tetapi 1.342 setoran lenyap: tabel baru selalu kosong.',
        },
        {
          id: 'd7',
          teks: 'ALTER TABLE nasabah CHANGE no_hp no_wa VARCHAR(15);',
          sql: 'ALTER TABLE nasabah CHANGE no_hp no_wa VARCHAR(15);',
          correct: 'tetap',
          explanation: 'CHANGE mengganti nama dan definisi, tetapi isinya ikut dibawa.',
        },
      ],
    },
    pertanyaan: [
      soalPilih(
        'k1',
        'Perintah yang benar untuk menambah kolom <code>email VARCHAR(60)</code> ke tabel nasabah adalah …',
        'c',
        [
          [
            'a',
            '<code>ALTER nasabah ADD email VARCHAR(60);</code>',
            'Kata kunci TABLE tertinggal: ALTER TABLE nama_tabel …',
          ],
          [
            'b',
            '<code>UPDATE nasabah ADD email VARCHAR(60);</code>',
            'UPDATE adalah DML untuk mengubah isi baris, bukan struktur.',
          ],
          [
            'c',
            '<code>ALTER TABLE nasabah ADD email VARCHAR(60);</code>',
            'Tepat: ALTER TABLE, nama tabel, ADD, lalu definisi kolom.',
          ],
          [
            'd',
            '<code>ALTER TABLE nasabah ADD email;</code>',
            'Kolom baru wajib diberi tipe data.',
          ],
        ]
      ),
      soalPilih('k2', 'Apa beda <code>MODIFY</code> dan <code>CHANGE</code>?', 'b', [
        [
          'a',
          'MODIFY menghapus kolom, CHANGE menambah kolom',
          'Keduanya mengubah kolom yang sudah ada; menghapus memakai DROP COLUMN.',
        ],
        [
          'b',
          'MODIFY mengubah definisi saja; CHANGE bisa sekaligus mengganti nama',
          'Tepat: CHANGE ditulis nama_lama nama_baru definisi.',
        ],
        [
          'c',
          'MODIFY untuk tabel kosong, CHANGE untuk tabel berisi',
          'Keduanya bisa dipakai pada tabel kosong maupun berisi.',
        ],
        [
          'd',
          'Tidak ada bedanya sama sekali',
          'CHANGE butuh dua nama (lama & baru), MODIFY hanya satu.',
        ],
      ]),
      soalPilih('k3', 'ALTER TABLE termasuk kelompok perintah …', 'a', [
        [
          'a',
          'DDL, karena mengubah struktur tabel',
          'Benar: seperti CREATE dan DROP, ALTER bekerja pada struktur (definisi) objek basis data.',
        ],
        [
          'b',
          'DML, karena mengubah isi tabel',
          'Mengubah isi baris adalah tugas INSERT, UPDATE, dan DELETE.',
        ],
        ['c', 'DCL, karena mengatur hak akses', 'Hak akses diatur dengan GRANT dan REVOKE.'],
        ['d', 'TCL, karena mengatur transaksi', 'Transaksi diatur dengan COMMIT dan ROLLBACK.'],
      ]),
    ],
  },

  tambah: {
    kicker: 'Tahap 5 · Membimbing Penyelidikan',
    title: 'Menambah Kolom dengan ADD',
    goal: 'Menyelidiki perilaku ALTER TABLE … ADD pada tabel berisi data, lalu menambah kolom saldo dan email sendiri.',
    guru: 'Biarkan tim menjalankan konsol langkah demi langkah. Setelah setiap langkah, Penguji membacakan pesan DBMS dan jumlah baris di panel. Pancing dengan pertanyaan: "Kalau saldo dibuat NOT NULL tanpa DEFAULT, saldo siswa lama jadi berapa?"',
    pengantar:
      'Konsol latihan berisi tabel <code>siswa</code> dengan <strong>30 baris</strong> data. Jalankan langkah satu per satu dan amati dua hal: pesan DBMS dan jumlah baris.',
    lab: {
      namaDb: 'latihan',
      struktur: [
        {
          nama: 'siswa',
          kolom: [
            { nama: 'nis', tipe: 'CHAR(5)', notNull: true },
            { nama: 'nama', tipe: 'VARCHAR(40)', notNull: true },
          ],
          pk: ['nis'],
          fk: [],
        },
      ],
      baris: { siswa: 30 },
    },
    langkah: [
      {
        id: 't1',
        sql: 'ALTER TABLE siswa ADD hobi VARCHAR(30);',
        amati:
          'Kolom hobi muncul di akhir. Jumlah baris berubah atau tidak? Apa isi hobi siswa lama?',
      },
      {
        id: 't2',
        sql: 'ALTER TABLE siswa ADD poin INT NOT NULL DEFAULT 0 AFTER nama;',
        amati: 'Kolom wajib dengan DEFAULT 0 diletakkan setelah nama. Poin siswa lama otomatis 0.',
      },
      {
        id: 't3',
        sql: 'ALTER TABLE siswa ADD hobi VARCHAR(50);',
        amati: 'Ditolak! Mengapa kolom hobi tidak bisa ditambahkan lagi?',
      },
      {
        id: 't4',
        sql: 'ALTER TABLE siswa\n  ADD kelas VARCHAR(10),\n  ADD alamat VARCHAR(100);',
        amati: 'Dua kolom sekaligus dalam satu ALTER TABLE, dipisah koma.',
      },
    ],
    pertanyaan: [
      soalPilih('tb1', 'Setelah langkah 1, jumlah baris tabel siswa …', 'c', [
        ['a', 'Bertambah satu baris', 'ADD menambah kolom, bukan baris.'],
        ['b', 'Menjadi 0 karena tabelnya diubah', 'ALTER tidak menghapus baris apa pun.'],
        [
          'c',
          'Tetap 30; kolom hobi pada baris lama berisi NULL',
          'Tepat: struktur bertambah satu kolom, isinya tetap 30 baris.',
        ],
        ['d', 'Bertambah 30 baris kosong', 'Tidak ada baris baru yang dibuat.'],
      ]),
      soalPilih(
        'tb2',
        'Mengapa langkah 2 memakai <code>DEFAULT 0</code> untuk kolom wajib <code>poin</code>?',
        'a',
        [
          [
            'a',
            'Agar baris lama langsung punya nilai yang jelas, bukan nilai kosong tak terduga',
            'Tepat: kolom NOT NULL di tabel berisi data butuh nilai untuk baris lama; DEFAULT menentukannya.',
          ],
          [
            'b',
            'Agar kolom poin boleh kosong',
            'Justru NOT NULL melarang kosong; DEFAULT hanya memberi nilai awal.',
          ],
          [
            'c',
            'Supaya poin menjadi kunci primer',
            'DEFAULT tidak berhubungan dengan kunci primer.',
          ],
          [
            'd',
            'Karena INT tidak bisa dipakai tanpa DEFAULT',
            'INT boleh tanpa DEFAULT; DEFAULT dipakai karena tabelnya sudah berisi.',
          ],
        ]
      ),
      soalPilih('tb3', 'Langkah 3 ditolak karena …', 'd', [
        ['a', 'VARCHAR(50) terlalu panjang', 'Panjang 50 sah; masalahnya bukan di tipe.'],
        ['b', 'Tabel hanya boleh diubah sekali', 'Tabel boleh di-ALTER berkali-kali.'],
        [
          'c',
          'Kolom baru harus selalu NOT NULL',
          'Kolom baru boleh tanpa NOT NULL (langkah 1 berhasil).',
        ],
        [
          'd',
          'Kolom hobi sudah ada; untuk mengubahnya pakai MODIFY',
          'Tepat: nama kolom dalam satu tabel harus unik. Mengubah definisi kolom yang ada memakai MODIFY.',
        ],
      ]),
    ],
    editor: {
      judul: '✍️ Giliranmu: tambah kolom saldo dan email',
      tugas:
        'Lihat kamus data v2 tabel <code>nasabah</code> (tanda <strong>BARU</strong>). Tulis ALTER TABLE untuk menambah <code>saldo</code> dan <code>email</code> sesuai tipe, aturan wajib, dan nilai bawaannya. Basis data bank_sampah v1 sudah aktif dan berisi data.',
      label: 'Skrip menambah kolom nasabah',
      placeholder: 'ALTER TABLE nasabah …;',
      kerangka:
        'ALTER TABLE nasabah\n  -- 1) kolom saldo: tipe, wajib diisi, nilai bawaan\n  -- 2) kolom email: tipe, boleh kosong\n;',
      petunjuk: [
        'Dua kolom baru: <code>saldo INT</code> wajib diisi dengan nilai bawaan 0, dan <code>email VARCHAR(60)</code> yang boleh kosong.',
        'Pola satu kolom: <code>ADD nama_kolom TIPE [NOT NULL] [DEFAULT nilai]</code>. Dua kolom dalam satu ALTER TABLE dipisah koma.',
        'Contoh kolom pertama: <code>ALTER TABLE nasabah ADD saldo INT NOT NULL DEFAULT 0, …</code>',
      ],
      sukses:
        '<strong>Kolom saldo dan email ditambahkan!</strong> 128 nasabah tetap utuh — saldo mereka mulai dari 0 dan email masih kosong (NULL).',
    },
  },

  ubah: {
    kicker: 'Tahap 6 · Membimbing Penyelidikan',
    title: 'Mengubah Kolom: MODIFY, RENAME COLUMN, CHANGE',
    goal: 'Menyelidiki jebakan MODIFY, lalu mengubah panjang kolom dan mengganti nama kolom tanpa kehilangan isinya.',
    guru: 'Langkah 1 konsol sengaja menunjukkan jebakan paling sering: MODIFY tanpa menulis ulang NOT NULL. Minta murid membandingkan panel DBMS sebelum dan sesudah langkah 1. Untuk ganti nama, tanyakan: "Kalau no_hp di-DROP lalu no_wa di-ADD, nomor-nomor lama ke mana?"',
    pengantar:
      'Konsol berisi tabel <code>siswa</code> (30 baris) dengan kolom <code>nama VARCHAR(40) NOT NULL</code>. Jalankan langkahnya dan perhatikan aturan NOT NULL di panel DBMS.',
    lab: {
      namaDb: 'latihan',
      struktur: [
        {
          nama: 'siswa',
          kolom: [
            { nama: 'nis', tipe: 'CHAR(5)', notNull: true },
            { nama: 'nama', tipe: 'VARCHAR(40)', notNull: true },
            { nama: 'hp', tipe: 'VARCHAR(15)', notNull: false },
          ],
          pk: ['nis'],
          fk: [],
        },
      ],
      baris: { siswa: 30 },
    },
    langkah: [
      {
        id: 'u1',
        sql: 'ALTER TABLE siswa MODIFY nama VARCHAR(80);',
        amati: 'Panjangnya berubah, tetapi lihat panel: aturan NOT NULL pada nama hilang! Mengapa?',
      },
      {
        id: 'u2',
        sql: 'ALTER TABLE siswa MODIFY nama VARCHAR(80) NOT NULL;',
        amati: 'Definisi ditulis lengkap, aturan wajib kembali.',
      },
      {
        id: 'u3',
        sql: 'ALTER TABLE siswa RENAME COLUMN hp TO no_wa;',
        amati: 'Nama berganti, tipe dan isinya tetap.',
      },
      {
        id: 'u4',
        sql: 'ALTER TABLE siswa CHANGE no_wa hp VARCHAR(20);',
        amati: 'CHANGE: nama lama, nama baru, lalu definisi lengkap — sekaligus.',
      },
      {
        id: 'u5',
        sql: 'ALTER TABLE siswa MODIFY nama VARCHAR(10) NOT NULL;',
        amati:
          'Berhasil, tetapi ada peringatan. Apa risikonya memperkecil kolom yang sudah berisi?',
      },
    ],
    pertanyaan: [
      soalPilih(
        'ub1',
        'Mengapa aturan NOT NULL pada <code>nama</code> hilang setelah langkah 1?',
        'b',
        [
          [
            'a',
            'VARCHAR(80) tidak bisa NOT NULL',
            'Langkah 2 membuktikan VARCHAR(80) NOT NULL sah.',
          ],
          [
            'b',
            'MODIFY mengganti SELURUH definisi kolom; NOT NULL tidak ditulis ulang',
            'Tepat: tulis definisi lengkap setiap kali memakai MODIFY.',
          ],
          [
            'c',
            'Tabel yang berisi data tidak boleh punya NOT NULL',
            'Tabel berisi boleh punya kolom NOT NULL.',
          ],
          ['d', 'DBMS sedang galat', 'DBMS berjalan benar; skripnya yang kurang lengkap.'],
        ]
      ),
      soalPilih(
        'ub2',
        'Kolom <code>no_hp</code> harus menjadi <code>no_wa</code>. Mengapa tidak memakai DROP COLUMN no_hp lalu ADD no_wa?',
        'c',
        [
          [
            'a',
            'DBMS selalu menolak DROP COLUMN',
            'DROP COLUMN boleh selama kolomnya tidak dirujuk kunci tamu.',
          ],
          ['b', 'ADD tidak bisa dipakai untuk VARCHAR', 'ADD bisa untuk tipe apa pun.'],
          [
            'c',
            'Kolom no_wa baru akan kosong — semua nomor lama ikut terhapus',
            'Tepat: ganti nama dengan RENAME COLUMN atau CHANGE agar isinya terbawa.',
          ],
          [
            'd',
            'Karena urutan kolom jadi berubah',
            'Urutan bisa diatur dengan AFTER; masalah utamanya data yang hilang.',
          ],
        ]
      ),
    ],
    rumpangPengantar:
      'Sekarang tabel <code>jenis_sampah</code> di bank_sampah: <code>nama_jenis</code> harus muat 60 karakter dan <strong>tetap wajib diisi</strong>. Lengkapi tiga bagian yang kosong.',
    rumpangSql: RUMPANG_UBAH,
    isian: { m1: 'MODIFY', m2: 'VARCHAR(60)', m3: 'NOT NULL' },
    rumpang: [
      soalPilih('m1', 'Isian ① — perintah untuk mengubah definisi kolom yang sudah ada:', 'b', [
        ['a', '<code>ADD</code>', 'Kolom nama_jenis sudah ada; ADD akan ditolak.'],
        ['b', '<code>MODIFY</code>', 'Tepat: MODIFY mengganti definisi kolom.'],
        ['c', '<code>DROP</code>', 'DROP menghapus kolom beserta isinya.'],
        ['d', '<code>UPDATE</code>', 'UPDATE mengubah isi baris, bukan struktur.'],
      ]),
      soalPilih('m2', 'Isian ② — tipe baru sesuai kamus data v2:', 'd', [
        ['a', '<code>VARCHAR(30)</code>', 'Itu panjang lama yang membuat nama terpotong.'],
        ['b', '<code>CHAR(60)</code>', 'Panjang nama berbeda-beda; kamus data menetapkan VARCHAR.'],
        ['c', '<code>VARCHAR</code>', 'VARCHAR wajib diberi panjang.'],
        ['d', '<code>VARCHAR(60)</code>', 'Tepat: muat sampai 60 karakter.'],
      ]),
      soalPilih('m3', 'Isian ③ — agar nama_jenis tetap wajib diisi:', 'a', [
        ['a', '<code>NOT NULL</code>', 'Tepat: tulis ulang aturan wajibnya.'],
        ['b', '(dikosongkan saja)', 'Tanpa NOT NULL, aturan wajib hilang — jebakan langkah 1.'],
        ['c', '<code>NULL</code>', 'NULL berarti boleh kosong.'],
        ['d', '<code>DEFAULT 0</code>', 'Nama jenis berupa teks dan wajib diisi, bukan angka 0.'],
      ]),
    ],
    rumpangSukses:
      'Perintah MODIFY lengkap! Sekarang tulis sendiri skrip tahap ini: perintah MODIFY tadi <strong>dan</strong> penggantian nama <code>no_hp</code> menjadi <code>no_wa</code>.',
    editor: {
      judul: '✍️ Giliranmu: ubah nama_jenis dan ganti nama no_hp',
      tugas:
        'Tulis skrip yang (1) memperbesar <code>jenis_sampah.nama_jenis</code> menjadi VARCHAR(60) dan tetap wajib, serta (2) mengganti nama <code>nasabah.no_hp</code> menjadi <code>no_wa</code> tanpa kehilangan nomor yang sudah tersimpan. Skema awal = hasil skrip tambah kolommu.',
      label: 'Skrip mengubah kolom',
      placeholder: 'ALTER TABLE jenis_sampah …;\nALTER TABLE nasabah …;',
      kerangka:
        '-- 1) perbesar nama_jenis, tetap wajib diisi\nALTER TABLE jenis_sampah ;\n\n-- 2) ganti nama no_hp menjadi no_wa (isi tetap)\nALTER TABLE nasabah ;\n',
      petunjuk: [
        'Dua tabel berbeda → dua pernyataan ALTER TABLE, masing-masing diakhiri titik koma.',
        'Pernyataan pertama sudah kamu susun di rumpang: <code>MODIFY nama_jenis VARCHAR(60) NOT NULL</code>.',
        'Ganti nama: <code>ALTER TABLE nasabah RENAME COLUMN no_hp TO no_wa;</code> — atau gaya MySQL <code>CHANGE no_hp no_wa VARCHAR(15)</code>.',
      ],
      sukses:
        '<strong>Dua kolom diubah, isinya utuh!</strong> Nama jenis panjang kini muat, dan nomor HP lama pindah ke no_wa tanpa diketik ulang.',
    },
  },

  /* ==========================================================
     SINTAKS 4 — Mengembangkan & menyajikan hasil karya
     ========================================================== */
  hapus: {
    kicker: 'Tahap 7 · Mengembangkan Hasil Karya',
    title: 'Menghapus Kolom dengan DROP COLUMN',
    goal: 'Menganalisis kolom yang aman dihapus, menyelidiki batasan kunci tamu, lalu menghapus kolom redundan sendiri.',
    guru: 'Kaitkan dengan normalisasi (MPI 1.4): setoran.nama_nasabah bergantung pada id_nasabah, bukan pada no_setoran — ketergantungan transitif yang membuat laporan tidak konsisten. Tekankan bahwa DROP COLUMN tidak bisa dibatalkan; di dunia kerja selalu ada cadangan sebelum menjalankannya.',
    pengantar:
      'Konsol berisi tabel <code>kelas</code> dan <code>siswa</code> (siswa merujuk kelas lewat kunci tamu). Jalankan langkahnya: kapan DROP COLUMN diterima, dan kapan ditolak?',
    lab: {
      namaDb: 'latihan',
      struktur: [
        {
          nama: 'kelas',
          kolom: [
            { nama: 'id_kelas', tipe: 'INT', notNull: true },
            { nama: 'nama_kelas', tipe: 'VARCHAR(20)', notNull: true },
          ],
          pk: ['id_kelas'],
          fk: [],
        },
        {
          nama: 'siswa',
          kolom: [
            { nama: 'nis', tipe: 'CHAR(5)', notNull: true },
            { nama: 'nama', tipe: 'VARCHAR(40)', notNull: true },
            { nama: 'id_kelas', tipe: 'INT', notNull: true },
            { nama: 'wali_kelas', tipe: 'VARCHAR(40)', notNull: false },
          ],
          pk: ['nis'],
          fk: [{ kolom: 'id_kelas', rujukTabel: 'kelas', rujukKolom: 'id_kelas' }],
        },
      ],
      baris: { kelas: 3, siswa: 30 },
    },
    langkah: [
      {
        id: 'h1',
        sql: 'ALTER TABLE siswa DROP COLUMN wali_kelas;',
        amati: 'Diterima — dan isi kolom itu di 30 baris ikut lenyap. Bisakah dikembalikan?',
      },
      {
        id: 'h2',
        sql: 'ALTER TABLE kelas DROP COLUMN id_kelas;',
        amati: 'Ditolak! Siapa yang masih bergantung pada kolom ini?',
      },
      {
        id: 'h3',
        sql: 'ALTER TABLE siswa DROP COLUMN hobi;',
        amati: 'Ditolak: kolom yang tidak ada tentu tidak bisa dihapus.',
      },
    ],
    analisis: {
      tanya:
        'Rancangan v2 membuang <code>setoran.nama_nasabah</code>. Pilih SEMUA pernyataan yang tepat tentang rencana penghapusan kolom ini.',
      opsi: [
        {
          id: 'redundan',
          label:
            '<code>setoran.nama_nasabah</code> redundan: nama sudah tersimpan di tabel nasabah lewat <code>id_nasabah</code>',
          benar: true,
          alasan:
            'Nama bergantung pada id_nasabah, bukan no_setoran (ketergantungan transitif, melanggar 3NF). Itulah penyebab laporan "Dewi Lestari" ≠ "Dewi Lestari Putri".',
        },
        {
          id: 'permanen',
          label: 'DROP COLUMN menghapus isi kolom itu di 1.342 baris secara permanen',
          benar: true,
          alasan: 'Tidak ada undo; pastikan kolom benar-benar tidak dibutuhkan dan ada cadangan.',
        },
        {
          id: 'pk',
          label:
            '<code>nasabah.id_nasabah</code> tidak bisa dihapus karena dirujuk kunci tamu setoran',
          benar: true,
          alasan: 'Seperti langkah 2 konsol: kolom yang dirujuk kunci tamu dilindungi DBMS.',
        },
        {
          id: 'droptable',
          label: 'Cara paling aman: DROP TABLE setoran lalu buat ulang tanpa kolom itu',
          benar: false,
          alasan: 'Struktur memang jadi benar, tetapi seluruh 1.342 setoran ikut hilang.',
        },
        {
          id: 'truncate',
          label: 'TRUNCATE TABLE setoran akan menghapus kolom nama_nasabah',
          benar: false,
          alasan: 'TRUNCATE mengosongkan SEMUA baris dan tidak mengubah kolom sama sekali.',
        },
        {
          id: 'nohp',
          label: 'Kolom no_hp juga harus dihapus karena boleh kosong',
          benar: false,
          alasan:
            'Boleh kosong bukan alasan menghapus. no_hp tetap dipakai — hanya diganti nama menjadi no_wa.',
        },
      ],
      done: '<strong>Analisis tepat!</strong> Kolom redundan boleh dibuang dengan DROP COLUMN; kolom yang dirujuk kunci tamu harus dibiarkan.',
    },
    editor: {
      judul: '✍️ Giliranmu: buang kolom redundan',
      tugas:
        'Tulis perintah untuk menghapus kolom <code>nama_nasabah</code> dari tabel <code>setoran</code>. Tabel setoran berisi 1.342 baris yang lain-lainnya harus tetap utuh. Skema awal = hasil skrip tambah & ubah kolommu.',
      label: 'Skrip menghapus kolom',
      placeholder: 'ALTER TABLE setoran …;',
      kerangka: '-- hapus kolom redundan dari tabel setoran\nALTER TABLE setoran ;\n',
      petunjuk: [
        'Yang dihapus kolomnya, bukan tabelnya: tetap mulai dengan <code>ALTER TABLE setoran</code>.',
        'Pola: <code>ALTER TABLE nama_tabel DROP COLUMN nama_kolom;</code>',
      ],
      sukses:
        '<strong>Kolom redundan terbuang!</strong> Setoran tetap 1.342 baris; nama nasabah kini selalu diambil dari tabel nasabah sehingga laporan konsisten.',
    },
  },

  sajikan: {
    kicker: 'Tahap 8 · Menyajikan Hasil Karya',
    title: 'Sajikan Bukti Sebelum–Sesudah',
    goal: 'Menjalankan skrip migrasi tim pada DBMS v1 berisi data, membandingkan hasilnya dengan rancangan v2, dan menyusun klaim presentasi berbasis bukti.',
    guru: 'Setiap tim menjalankan skrip migrasinya pada DBMS v1 di depan kelas. Juru Bicara menyampaikan klaim, Penguji menunjuk buktinya di kartu beda struktur — termasuk jumlah baris. Tim lain boleh bertanya "Di mana buktinya?".',
    pengantar:
      'Ini <strong>skrip migrasi tim</strong> gabungan semua yang kalian tulis. Jalankan pada salinan DBMS v1 yang berisi data — persis keadaan laptop pos Bank Sampah.',
    lulus:
      '<strong>Migrasi lolos uji!</strong> Struktur bank_sampah sesuai kamus data v2, dan tidak ada satu baris pun yang hilang.',
    klaim: {
      tanya:
        'Pilih SEMUA klaim yang <strong>didukung bukti</strong> di kartu sebelum–sesudah untuk presentasi ke Bu Rina.',
      opsi: [
        {
          id: 'utuh',
          label: 'Jumlah baris keempat tabel sama sebelum dan sesudah migrasi',
          benar: true,
          alasan:
            'Setiap kartu menulis "… baris (utuh)": 1.342 setoran, 128 nasabah, 9 jenis, 6 petugas.',
        },
        {
          id: 'kolom',
          label: 'Nasabah kini punya saldo dan email, dan no_hp berganti nama menjadi no_wa',
          benar: true,
          alasan: 'Kartu nasabah menandai saldo & email ➕ baru dan no_hp → no_wa 🔁 ganti nama.',
        },
        {
          id: 'panjang',
          label: 'nama_jenis kini VARCHAR(60) dan tetap wajib diisi',
          benar: true,
          alasan: 'Kartu jenis_sampah menandai ✏️ VARCHAR(30) NOT NULL → VARCHAR(60) NOT NULL.',
        },
        {
          id: 'kosong',
          label: 'Saldo nasabah lama masih kosong (NULL)',
          benar: false,
          alasan: 'Saldo dibuat NOT NULL DEFAULT 0, jadi semua nasabah lama bersaldo 0.',
        },
        {
          id: 'baru',
          label: 'Tabel setoran dibuat ulang dari nol',
          benar: false,
          alasan: 'Setoran hanya kehilangan satu kolom lewat ALTER; jumlah barisnya tetap 1.342.',
        },
        {
          id: 'hp',
          label: 'Nomor HP lama hilang dan harus diketik ulang',
          benar: false,
          alasan: 'RENAME COLUMN/CHANGE membawa isinya; nomor lama ada di kolom no_wa.',
        },
      ],
      done: '<strong>Klaim presentasi kuat!</strong> Setiap klaim bisa ditunjuk buktinya: struktur sesuai v2, data utuh.',
    },
  },

  /* ==========================================================
     SINTAKS 5 — Menganalisis & mengevaluasi
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 9 · Evaluasi',
    title: 'Kasus Baru: Servis Laptop TEFA Berubah',
    goal: 'Menerapkan ALTER TABLE pada permintaan perubahan baru dan mengevaluasi skrip migrasi tim lain.',
    guru: 'Kuis dikerjakan individu dan hanya sekali jawab. Uji silang dikerjakan berpasangan: skrip Tim Biru berjalan tanpa galat, sehingga murid harus menilai dari bukti (beda struktur & jumlah baris), bukan dari pesan galat.',
    pengantarKuis:
      'Basis data <code>tefa_servis</code> (MPI 2.2) sudah dipakai dan berisi data. Permintaan perubahan dari kepala TEFA:',
    permintaan: [
      'Tabel <code>servis</code>: tambah kolom <code>keluhan</code> bertipe TEXT (boleh kosong).',
      'Tabel <code>layanan</code>: <code>nama_lay</code> diperbesar dari VARCHAR(40) menjadi VARCHAR(80), tetap wajib.',
      'Tabel <code>pelanggan</code>: <code>no_hp</code> diganti nama menjadi <code>no_wa</code>, isinya tetap.',
      'Tabel <code>pelanggan</code>: kolom <code>no_fax</code> tidak dipakai lagi dan dihapus.',
    ],
    kamusJudul: 'Kamus data tefa_servis saat ini (v1)',
    sqlE5: 'ALTER TABLE pelanggan DROP COLUMN kode_plg;',
    sqlE6: 'ALTER TABLE servis ADD garansi INT NOT NULL DEFAULT 0;',
    soal: [
      soalPilih('e1', 'Perintah untuk permintaan nomor 1 adalah …', 'c', [
        ['a', '<code>ALTER servis ADD keluhan TEXT;</code>', 'Kata kunci TABLE tertinggal.'],
        ['b', '<code>ALTER TABLE servis ADD keluhan;</code>', 'Kolom baru wajib diberi tipe data.'],
        [
          'c',
          '<code>ALTER TABLE servis ADD keluhan TEXT;</code>',
          'Benar: kolom baru boleh kosong, baris lama berisi NULL.',
        ],
        [
          'd',
          '<code>UPDATE servis ADD keluhan TEXT;</code>',
          'UPDATE mengubah isi, bukan struktur.',
        ],
      ]),
      soalPilih('e2', 'Perintah untuk permintaan nomor 2 adalah …', 'b', [
        [
          'a',
          '<code>ALTER TABLE layanan MODIFY nama_lay VARCHAR(80);</code>',
          'NOT NULL tidak ditulis ulang, sehingga nama_lay jadi boleh kosong.',
        ],
        [
          'b',
          '<code>ALTER TABLE layanan MODIFY nama_lay VARCHAR(80) NOT NULL;</code>',
          'Benar: definisi lengkap ditulis ulang.',
        ],
        [
          'c',
          '<code>ALTER TABLE layanan ADD nama_lay VARCHAR(80) NOT NULL;</code>',
          'nama_lay sudah ada; ADD akan ditolak.',
        ],
        [
          'd',
          '<code>ALTER TABLE layanan RENAME nama_lay VARCHAR(80);</code>',
          'RENAME untuk mengganti nama, bukan mengubah tipe.',
        ],
      ]),
      soalPilih('e3', 'Perintah untuk permintaan nomor 3 adalah …', 'a', [
        [
          'a',
          '<code>ALTER TABLE pelanggan CHANGE no_hp no_wa VARCHAR(15);</code>',
          'Benar: nama lama, nama baru, definisi lengkap — isinya terbawa.',
        ],
        [
          'b',
          '<code>ALTER TABLE pelanggan DROP COLUMN no_hp, ADD no_wa VARCHAR(15);</code>',
          'Strukturnya sama, tetapi semua nomor lama hilang.',
        ],
        [
          'c',
          '<code>ALTER TABLE pelanggan MODIFY no_hp no_wa VARCHAR(15);</code>',
          'MODIFY tidak bisa mengganti nama; pakai CHANGE atau RENAME COLUMN.',
        ],
        [
          'd',
          '<code>RENAME TABLE no_hp TO no_wa;</code>',
          'RENAME TABLE mengganti nama tabel, bukan kolom.',
        ],
      ]),
      soalPilih('e4', 'Perintah untuk permintaan nomor 4 adalah …', 'd', [
        [
          'a',
          '<code>DROP COLUMN no_fax FROM pelanggan;</code>',
          'Perintah selalu diawali ALTER TABLE nama_tabel.',
        ],
        [
          'b',
          '<code>DELETE no_fax FROM pelanggan;</code>',
          'DELETE menghapus baris (DML), bukan kolom.',
        ],
        [
          'c',
          '<code>ALTER TABLE pelanggan DROP TABLE no_fax;</code>',
          'Yang dihapus kolom, jadi DROP COLUMN.',
        ],
        [
          'd',
          '<code>ALTER TABLE pelanggan DROP COLUMN no_fax;</code>',
          'Benar: kolom beserta isinya terhapus.',
        ],
      ]),
      soalPilih(
        'e5',
        'Seorang teman menjalankan <code>ALTER TABLE pelanggan DROP COLUMN kode_plg;</code> dan ditolak. Mengapa?',
        'b',
        [
          [
            'a',
            'Kolom bertipe CHAR tidak bisa dihapus',
            'Tipe kolom tidak menentukan boleh-tidaknya dihapus.',
          ],
          [
            'b',
            'kode_plg dirujuk kunci tamu tabel servis',
            'Benar: kolom yang dirujuk kunci tamu dilindungi DBMS.',
          ],
          [
            'c',
            'Tabel pelanggan berisi data',
            'Kolom di tabel berisi tetap boleh dihapus, misalnya no_fax.',
          ],
          ['d', 'Harus memakai DROP TABLE', 'DROP TABLE menghapus seluruh tabel — bukan solusi.'],
        ]
      ),
      soalPilih(
        'e6',
        'Tabel servis berisi 214 baris. Setelah <code>ALTER TABLE servis ADD garansi INT NOT NULL DEFAULT 0;</code>, nilai garansi di baris lama adalah …',
        'c',
        [
          ['a', 'NULL', 'Kolom NOT NULL tidak boleh berisi NULL.'],
          ['b', 'Baris lama terhapus', 'ALTER tidak menghapus baris.'],
          ['c', '0 di semua baris lama', 'Benar: DEFAULT 0 mengisi semua baris lama.'],
          ['d', 'Acak', 'DBMS mengisi dengan nilai DEFAULT yang ditentukan, bukan acak.'],
        ]
      ),
    ],
    ujiSilang: {
      judul: 'Skrip migrasi Tim Biru',
      pengantar:
        'Tim Biru mengklaim skrip berikut memigrasikan bank_sampah v1 ke v2 dan "berhasil karena tidak ada galat". Jalankan pada salinan DBMS v1, lalu periksa buktinya: apakah hasilnya benar-benar sesuai v2 dan datanya utuh?',
      tanya: 'Pilih SEMUA kesalahan dalam skrip Tim Biru.',
      opsi: [
        {
          id: 'notnull',
          label: 'MODIFY nama_jenis tidak menulis ulang NOT NULL',
          benar: true,
          alasan: 'nama_jenis kini boleh kosong, padahal kamus data v2 mewajibkannya.',
        },
        {
          id: 'nowa',
          label: 'no_hp di-DROP lalu no_wa di-ADD, sehingga semua nomor lama hilang',
          benar: true,
          alasan: 'Kolom no_wa ada tetapi kosong; seharusnya RENAME COLUMN atau CHANGE.',
        },
        {
          id: 'setoran',
          label: 'Tabel setoran di-DROP lalu dibuat ulang, sehingga 1.342 setoran hilang',
          benar: true,
          alasan:
            'Struktur setoran benar, tetapi barisnya 1.342 → 0. Cukup DROP COLUMN nama_nasabah.',
        },
        {
          id: 'default',
          label: 'Saldo seharusnya tanpa DEFAULT',
          benar: false,
          alasan: 'Kamus data v2 justru menetapkan nilai bawaan 0 untuk saldo.',
        },
        {
          id: 'gabung',
          label: 'Dua kolom tidak boleh ditambahkan dalam satu ALTER TABLE',
          benar: false,
          alasan: 'Beberapa perubahan boleh digabung dengan koma dalam satu ALTER TABLE.',
        },
        {
          id: 'email',
          label: 'Kolom email seharusnya NOT NULL',
          benar: false,
          alasan: 'Kamus data v2 menyatakan email boleh kosong.',
        },
      ],
      skrip: SKRIP_TIM_BIRU,
      done: '<strong>Uji silang tuntas!</strong> "Tidak ada galat" belum tentu benar — bukti struktur dan jumlah baris yang menentukan.',
    },
  },

  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Refleksi Pemecahan Masalah',
    goal: 'Menilai kemampuan diri dan proses tim dalam mengubah struktur tabel dengan aman.',
    guru: 'Beri 5 menit refleksi mandiri. Kumpulkan jawaban terbuka untuk menemukan kesalahan paling sering (biasanya lupa NOT NULL saat MODIFY atau DROP+ADD untuk ganti nama) sebagai bahan pertemuan berikutnya: mengisi dan mengubah data dengan DML.',
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
        teks: 'Aku bisa membandingkan struktur tabel dengan rancangan baru dan mendaftar perubahannya.',
      },
      { id: 'p2', teks: 'Aku bisa menambah kolom dengan ADD, termasuk NOT NULL dan DEFAULT.' },
      {
        id: 'p3',
        teks: 'Aku bisa mengubah kolom dengan MODIFY dan mengganti nama dengan RENAME COLUMN atau CHANGE.',
      },
      {
        id: 'p4',
        teks: 'Aku bisa menghapus kolom dengan DROP COLUMN dan tahu kapan DBMS menolaknya.',
      },
      { id: 'p5', teks: 'Aku bisa memastikan data lama tetap utuh setelah struktur tabel diubah.' },
    ],
    tanyaTerbuka:
      'Kesalahan apa yang hampir membuat data hilang hari ini, dan bagaimana kamu mencegahnya?',
  },

  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Bank Sampah Versi Baru Siap!',
    goal: 'Melihat rekap skor dan skrip migrasi hasil kerja tim.',
    pesan:
      'Struktur bank_sampah kini sesuai rancangan v2 dan semua tabungan siswa tetap utuh. Pertemuan berikutnya: mengisi dan mengubah data dengan DML.',
    rangkuman: [
      '<code>ALTER TABLE nama ADD kolom TIPE [NOT NULL] [DEFAULT x];</code> menambah kolom; baris lama berisi NULL atau nilai DEFAULT.',
      '<code>MODIFY kolom definisi_lengkap</code> mengubah tipe/panjang/aturan — tulis ulang NOT NULL agar tidak hilang.',
      '<code>RENAME COLUMN lama TO baru</code> atau <code>CHANGE lama baru definisi</code> mengganti nama tanpa kehilangan isi; DROP + ADD menghapus isinya.',
      '<code>DROP COLUMN kolom</code> menghapus kolom beserta isinya secara permanen; kolom yang dirujuk kunci tamu ditolak.',
      'Ubah struktur dengan ALTER, bukan DROP TABLE lalu CREATE ulang — dan buktikan jumlah baris tetap sama.',
    ],
  },
};

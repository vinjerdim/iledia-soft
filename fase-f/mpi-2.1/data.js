'use strict';

/* ============================================================
   data.js — seluruh isi materi 2.1
   ============================================================
   Berkas ini hanya berisi KONTEN. Logika tampilan ada di app.js
   dan berkas app-stage-*.js. Guru dapat menyunting teks, tabel,
   soal, dan umpan balik di sini tanpa menyentuh kode.

   ATURAN PENTING: setiap pilihan yang ditampilkan ke murid wajib
   punya `id` yang unik dan stabil. Urutan tampilnya diacak oleh
   engine, dan jawaban murid disimpan berdasarkan id — bukan
   berdasarkan nomor urut. Mengganti id sama dengan menghapus
   jawaban murid yang sudah tersimpan.
   ============================================================ */

const DATA = {
  meta: {
    title: 'Konsep dan Fungsi DBMS dalam Pengelolaan Basis Data',
    subject: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Discovery Learning',
    goal: 'Menjelaskan konsep dan fungsi DBMS dalam pengelolaan basis data.'
  },

  /* ==========================================================
     TAHAP 1 — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Sebelum Mulai',
    goal: 'Memahami tujuan, alur, dan cara memakai media ini.',
    salam:
      'Di media ini kamu tidak diberi definisi DBMS lebih dulu. Kamu akan menyelidiki ' +
      'kekacauan data siswa di sebuah SMK yang menyimpan datanya di banyak file terpisah, ' +
      'lalu menemukan sendiri: perangkat lunak seperti apa yang dibutuhkan untuk mengelola ' +
      'basis data, dan apa saja tugasnya.',
    tujuanLabel: 'Setelah menyelesaikan media ini kamu dapat:',
    tujuan: [
      'Mengidentifikasi masalah pengelolaan data yang disimpan di banyak file terpisah.',
      'Menjelaskan pengertian DBMS dan membedakannya dari basis data itu sendiri.',
      'Menyebutkan komponen dan pengguna DBMS, serta contoh DBMS yang banyak dipakai.',
      'Mengelompokkan perintah bahasa DBMS ke dalam DDL, DML, dan DCL.',
      'Menjelaskan fungsi DBMS: definisi data, manipulasi data, keamanan, integritas, kendali konkurensi, serta backup dan recovery.'
    ],
    alurLabel: 'Alur belajar (9 tahap)',
    alur: [
      { title: 'Stimulasi', desc: 'Mengamati tiga file data siswa dan catatan kejadian, lalu menandai yang janggal.' },
      { title: 'Rumusan Masalah', desc: 'Menetapkan masalah yang perlu diselidiki.' },
      { title: 'Pengumpulan Data', desc: 'Membuka kartu konsep tentang DBMS, lalu menjodohkan istilah.' },
      { title: 'Pengolahan Data', desc: 'Menjadi operator Pusat Kendali DBMS: memilah permintaan pengguna ke fungsi DBMS.' },
      { title: 'Verifikasi', desc: 'Menguji dugaanmu lewat simulasi sebelum dan sesudah memakai DBMS.' },
      { title: 'Generalisasi', desc: 'Menyimpulkan konsep dan fungsi DBMS, lalu menguji pemahaman.' },
      { title: 'Refleksi & Selesai', desc: 'Menilai pemahamanmu sendiri dan melihat rangkuman hasil.' }
    ],
    caraPakaiLabel: 'Cara memakai',
    caraPakai: [
      'Tahap terbuka berurutan — selesaikan satu tahap untuk membuka tahap berikutnya.',
      'Progresmu tersimpan otomatis di perangkat ini. Boleh ditutup lalu dilanjutkan nanti.',
      'Tidak apa-apa salah. Setiap jawaban salah diberi penjelasan, bukan hukuman.',
      'Tombol Reset di kanan atas menghapus seluruh progres dan mengacak ulang pilihan jawaban.'
    ],
    mulaiLabel: 'Mulai menyelidiki →'
  },

  /* ==========================================================
     TAHAP 2 — Stimulasi
     ========================================================== */
  stimulasi: {
    kicker: 'Tahap 2 · Stimulasi',
    title: 'Data Siswa yang Tercecer',
    goal: 'Menemukan kejanggalan pada data siswa yang disimpan di banyak file terpisah.',
    cerita:
      '<p>Di SMK Nusantara, <strong>tiga bagian</strong> menyimpan data siswa sendiri-sendiri: ' +
      'Tata Usaha (TU), Bimbingan Konseling (BK), dan Perpustakaan. Masing-masing memakai ' +
      '<strong>file spreadsheet</strong> di folder bersama. Setiap bagian mengetik ulang data siswa ' +
      'yang sama ke file miliknya.</p>' +
      '<p>Pak Arif, operator TU, mengeluh:</p>',
    keluhan:
      '"Setiap ada siswa pindah alamat, saya ubah di file TU. Tapi BK dan Perpus tidak ikut berubah. ' +
      'Kemarin surat panggilan orang tua malah dikirim ke alamat lama. Belum lagi file perpustakaan hilang waktu laptopnya rusak…"',
    instruction:
      '<strong>Ketuk sel yang menurutmu janggal</strong> pada ketiga file di bawah. Bandingkan data ' +
      'siswa yang sama di file yang berbeda, dan perhatikan isi yang tidak masuk akal.',
    temuanLabel: 'Kejanggalan ditemukan',
    minTemuan: 4,
    hintLabel: 'Butuh petunjuk?',
    hint:
      '<p>Bandingkan baris <strong>NIS 2301 (Dewi)</strong> di file TU dan BK. Periksa juga kolom ' +
      '<strong>Kelas</strong> Bima, kolom <strong>NIS</strong> dan <strong>Umur</strong> di file Perpustakaan.</p>',
    files: [
      {
        id: 'tu',
        name: 'DataSiswa_TU.xlsx',
        owner: 'Tata Usaha',
        icon: '🗂️',
        columns: [
          { id: 'nis', label: 'NIS' },
          { id: 'nama', label: 'Nama' },
          { id: 'kelas', label: 'Kelas' },
          { id: 'alamat', label: 'Alamat' },
          { id: 'hp', label: 'No. HP' }
        ],
        rows: [
          { id: 'r1', cells: ['2301', 'Dewi Lestari', 'XI RPL 1', 'Jl. Anggrek 3', '0812-1111-2222'] },
          { id: 'r2', cells: ['2302', 'Bima Saputra', 'XI RPL 1', 'Jl. Kenanga 12', '0813-3333-4444'] },
          { id: 'r3', cells: ['2303', 'Citra Anggraini', 'XI RPL 2', 'Jl. Mawar 8', '0857-5555-6666'] }
        ]
      },
      {
        id: 'bk',
        name: 'CatatanBK.xlsx',
        owner: 'Bimbingan Konseling',
        icon: '💬',
        columns: [
          { id: 'nis', label: 'NIS' },
          { id: 'nama', label: 'Nama' },
          { id: 'kelas', label: 'Kelas' },
          { id: 'alamat', label: 'Alamat' },
          { id: 'hp', label: 'No. HP' }
        ],
        rows: [
          { id: 'r1', cells: ['2301', 'Dewi Lestari', 'XI RPL 1', 'Jl. Melati 5', '0812-1111-9999'] },
          { id: 'r2', cells: ['2302', 'Bima Saputra', 'X RPL 1', 'Jl. Kenanga 12', '0813-3333-4444'] },
          { id: 'r3', cells: ['2303', 'Citra Anggraini', 'XI RPL 2', 'Jl. Mawar 8', '0857-5555-6666'] }
        ]
      },
      {
        id: 'pp',
        name: 'AnggotaPerpus.xlsx',
        owner: 'Perpustakaan',
        icon: '📚',
        columns: [
          { id: 'nis', label: 'NIS' },
          { id: 'nama', label: 'Nama' },
          { id: 'kelas', label: 'Kelas' },
          { id: 'umur', label: 'Umur' },
          { id: 'pinjam', label: 'Jml Pinjam' }
        ],
        rows: [
          { id: 'r1', cells: ['2301', 'Dewi Lestari', 'XI RPL 1', '16', '7'] },
          { id: 'r2', cells: ['2301', 'Bima Saputra', 'XI RPL 1', 'tujuh belas', '3'] },
          { id: 'r3', cells: ['2303', 'Citra Anggraini', 'XI RPL 2', '170', '5'] }
        ]
      }
    ],
    /* Kunci: fileId:rowId:colId */
    problemCells: {
      'bk:r1:alamat': {
        why: '<strong>Tidak konsisten.</strong> Alamat Dewi di file BK (Jl. Melati 5) berbeda dengan file TU (Jl. Anggrek 3). Data yang sama disimpan dua kali, lalu hanya satu yang diperbarui.'
      },
      'bk:r1:hp': {
        why: '<strong>Tidak konsisten.</strong> Nomor HP Dewi di BK berbeda dengan di TU. Mana yang benar? Tidak ada yang tahu pasti.'
      },
      'bk:r2:kelas': {
        why: '<strong>Data usang.</strong> Bima sudah naik ke XI RPL 1 (tercatat di TU dan Perpus), tetapi file BK masih mencatat X RPL 1.'
      },
      'pp:r2:nis': {
        why: '<strong>NIS ganda.</strong> NIS 2301 dipakai Dewi dan Bima sekaligus. Tidak ada yang mencegah satu nomor induk dipakai dua siswa.'
      },
      'pp:r2:umur': {
        why: '<strong>Isian tidak sesuai aturan.</strong> Umur ditulis sebagai teks "tujuh belas". Spreadsheet menerimanya begitu saja, padahal kolom umur seharusnya angka.'
      },
      'pp:r3:umur': {
        why: '<strong>Isian tidak masuk akal.</strong> Umur 170 tahun jelas salah ketik, tetapi file tetap menyimpannya tanpa peringatan.'
      }
    },
    okCell: 'Sel ini wajar — isinya sama dengan data di file lain atau masih masuk akal.',
    kejadianLabel: 'Catatan kejadian minggu ini',
    kejadian: [
      {
        id: 'k1',
        icon: '⏱️',
        title: 'Senin, 08.05 — Perubahan hilang',
        text: 'Pak Arif (TU) dan Bu Rina (BK) membuka DataSiswa_TU.xlsx bersamaan. Bu Rina menyimpan belakangan, sehingga perubahan Pak Arif tertimpa tanpa ada yang sadar.'
      },
      {
        id: 'k2',
        icon: '💥',
        title: 'Selasa, 13.20 — Laptop rusak',
        text: 'Laptop perpustakaan mati total. AnggotaPerpus.xlsx tidak punya cadangan, sehingga data peminjaman dua bulan terakhir hilang.'
      },
      {
        id: 'k3',
        icon: '🔓',
        title: 'Rabu, 10.00 — Data rahasia terbuka',
        text: 'Seorang siswa yang meminjam komputer TU bisa membuka CatatanBK.xlsx dan membaca catatan konseling temannya.'
      },
      {
        id: 'k4',
        icon: '🐢',
        title: 'Kamis, 07.30 — Laporan dua hari',
        text: 'Kepala sekolah meminta daftar siswa XI RPL yang pernah konseling dan meminjam lebih dari 5 buku. Pak Arif butuh dua hari untuk menggabungkan tiga file secara manual.'
      }
    ],
    jenisLabel: 'Kelompokkan temuanmu',
    jenisInstruction:
      'Dari kejanggalan pada tabel dan catatan kejadian di atas, <strong>pilih semua jenis masalah</strong> yang benar-benar terjadi di SMK Nusantara.',
    jenis: [
      { id: 'j-redundansi', valid: true, text: 'Data yang sama diketik berulang di banyak file (redundansi).', feedback: 'Benar. Nama, kelas, alamat, dan HP siswa ditulis ulang oleh TU, BK, dan Perpustakaan.' },
      { id: 'j-inkonsisten', valid: true, text: 'Data siswa yang sama berbeda isinya di file yang berbeda (inkonsistensi).', feedback: 'Benar. Alamat dan HP Dewi serta kelas Bima tidak sama di setiap file.' },
      { id: 'j-integritas', valid: true, text: 'Isian yang melanggar aturan tetap tersimpan, misalnya NIS ganda dan umur berupa teks.', feedback: 'Benar. Tidak ada yang memeriksa apakah isian memenuhi aturan data.' },
      { id: 'j-keamanan', valid: true, text: 'Siapa pun yang memegang komputer bisa membuka data yang bukan haknya.', feedback: 'Benar. Catatan konseling bisa dibaca siswa lain (kejadian Rabu).' },
      { id: 'j-konkurensi', valid: true, text: 'Dua orang mengubah data bersamaan sehingga perubahan salah satunya hilang.', feedback: 'Benar. Perubahan Pak Arif tertimpa (kejadian Senin).' },
      { id: 'j-hilang', valid: true, text: 'Data hilang dan tidak bisa dipulihkan ketika perangkat rusak.', feedback: 'Benar. Data peminjaman dua bulan lenyap (kejadian Selasa).' },
      { id: 'j-sulit', valid: true, text: 'Menggabungkan dan mencari data dari beberapa file memakan waktu lama.', feedback: 'Benar. Laporan sederhana butuh dua hari (kejadian Kamis).' },
      { id: 'j-banyak', valid: false, text: 'Jumlah siswa terlalu banyak sehingga memang tidak mungkin dicatat dengan komputer.', feedback: 'Bukan. Komputer sanggup mengelola jutaan data. Masalahnya ada pada cara data dikelola, bukan jumlahnya.' },
      { id: 'j-operator', valid: false, text: 'Operatornya kurang teliti, jadi cukup diganti orang yang lebih teliti.', feedback: 'Bukan akar masalah. Salah ketik akan selalu terjadi pada siapa pun. Yang dibutuhkan adalah sistem yang mencegah dan menolak kesalahan.' },
      { id: 'j-warna', valid: false, text: 'Tabelnya kurang berwarna sehingga sulit dibaca.', feedback: 'Bukan. Tampilan tidak menyebabkan data ganda, hilang, atau bocor.' }
    ],
    cekLabel: 'Periksa pilihan',
    lanjutLabel: 'Lanjut ke Rumusan Masalah →'
  },

  /* ==========================================================
     TAHAP 3 — Rumusan Masalah
     ========================================================== */
  masalah: {
    kicker: 'Tahap 3 · Rumusan Masalah',
    title: 'Apa yang Sebenarnya Harus Diselidiki?',
    goal: 'Merumuskan masalah pengelolaan data yang akan diselidiki.',
    ringkasLabel: 'Temuanmu sejauh ini',
    instruction: 'Pilih <strong>satu</strong> rumusan masalah yang paling tepat mewakili semua temuanmu.',
    options: [
      {
        id: 'rm-kelola',
        correct: true,
        text: 'Perangkat lunak seperti apa yang dapat mengelola data sekolah di satu tempat agar tidak ganda, tetap konsisten, aman, dapat dipakai bersamaan, dan dapat dipulihkan?',
        feedback: 'Tepat. Rumusan ini mencakup semua jenis masalah yang kamu temukan dan mengarah ke penyelidikan tentang cara pengelolaan data.'
      },
      {
        id: 'rm-rapi',
        correct: false,
        text: 'Bagaimana cara membuat tampilan file spreadsheet agar lebih rapi dan mudah dibaca?',
        feedback: 'Kurang tepat. Kerapian tampilan tidak menyelesaikan data ganda, data hilang, maupun data yang bocor.'
      },
      {
        id: 'rm-salah',
        correct: false,
        text: 'Siapa operator yang paling sering salah mengetik data siswa?',
        feedback: 'Kurang tepat. Mencari siapa yang salah tidak mencegah masalah yang sama terulang.'
      },
      {
        id: 'rm-backup',
        correct: false,
        text: 'Bagaimana cara menyalin file perpustakaan ke flashdisk setiap minggu?',
        feedback: 'Terlalu sempit. Ini hanya menjawab masalah data hilang, sementara masalah lainnya tetap ada.'
      }
    ],
    cekLabel: 'Periksa rumusan',
    ownLabel: 'Pertanyaan penyelidikanmu',
    ownPrompt: 'Tulis satu pertanyaan yang ingin kamu jawab di tahap berikutnya.',
    ownPlaceholder: 'Contoh: Apa yang dilakukan perangkat lunak pengelola basis data ketika dua orang mengubah data yang sama bersamaan?',
    ownMin: 30,
    lanjutLabel: 'Lanjut ke Pengumpulan Data →'
  },

  /* ==========================================================
     TAHAP 4 — Pengumpulan Data
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Pengumpulan Data',
    title: 'Mengenal DBMS',
    goal: 'Mengumpulkan informasi tentang pengertian, komponen, bahasa, dan fungsi DBMS.',
    instruction: 'Buka semua kartu konsep di bawah. Hubungkan isinya dengan masalah di SMK Nusantara.',
    cards: [
      {
        id: 'c-dbms',
        icon: '🧠',
        term: 'DBMS (Database Management System)',
        def: 'Perangkat lunak yang dipakai untuk membuat, menyimpan, mengelola, dan mengamankan basis data. DBMS menjadi perantara antara pengguna/aplikasi dan data.',
        example: 'Aplikasi TU, BK, dan Perpustakaan tidak membuka file sendiri-sendiri, tetapi meminta data kepada satu DBMS.'
      },
      {
        id: 'c-beda',
        icon: '⚖️',
        term: 'Basis Data ≠ DBMS',
        def: 'Basis data adalah kumpulan data yang saling berhubungan dan tersimpan terorganisasi. DBMS adalah perangkat lunak yang mengelola kumpulan data itu.',
        example: 'Ibarat perpustakaan: buku-buku = basis data, pustakawan beserta aturan peminjamannya = DBMS.'
      },
      {
        id: 'c-file',
        icon: '🗃️',
        term: 'Sistem Berbasis File vs DBMS',
        def: 'Pada sistem berbasis file, tiap bagian menyimpan file sendiri sehingga data ganda dan tidak konsisten. Pada DBMS, data disimpan terpusat dan dipakai bersama oleh banyak aplikasi.',
        example: 'Alamat Dewi cukup disimpan sekali di tabel siswa, lalu dibaca oleh TU, BK, dan Perpustakaan.'
      },
      {
        id: 'c-komponen',
        icon: '🧩',
        term: 'Komponen Sistem Basis Data',
        def: 'Perangkat keras, perangkat lunak DBMS, data (beserta metadata/kamus data), prosedur, dan pengguna.',
        example: 'Server sekolah + MySQL + tabel siswa + aturan backup harian + operator TU.'
      },
      {
        id: 'c-pengguna',
        icon: '👥',
        term: 'Pengguna DBMS',
        def: 'Database Administrator (DBA) mengatur struktur, hak akses, dan backup. Programmer membuat aplikasi yang memakai basis data. Pengguna akhir (end user) memakai aplikasinya.',
        example: 'DBA: tim IT sekolah. Programmer: pembuat aplikasi presensi. End user: Pak Arif, Bu Rina, siswa.'
      },
      {
        id: 'c-bahasa',
        icon: '⌨️',
        term: 'Bahasa DBMS (SQL)',
        def: 'DDL (Data Definition Language) mendefinisikan struktur: CREATE, ALTER, DROP. DML (Data Manipulation Language) mengolah isi: SELECT, INSERT, UPDATE, DELETE. DCL (Data Control Language) mengatur hak akses: GRANT, REVOKE.',
        example: 'CREATE TABLE siswa (…) · UPDATE siswa SET alamat = … · GRANT SELECT ON siswa TO guru_bk'
      },
      {
        id: 'c-fungsi',
        icon: '⚙️',
        term: 'Fungsi DBMS',
        def: 'Definisi data, manipulasi data, keamanan & hak akses, integritas data, kendali konkurensi (akses bersamaan), backup & recovery, serta pengelolaan kamus data (metadata).',
        example: 'Setiap fungsi menjawab satu jenis masalah yang kamu temukan di tahap Stimulasi.'
      },
      {
        id: 'c-contoh',
        icon: '🏷️',
        term: 'Contoh DBMS',
        def: 'MySQL, MariaDB, PostgreSQL, SQLite, Oracle Database, Microsoft SQL Server. Spreadsheet seperti Excel bukan DBMS.',
        example: 'Aplikasi web sekolah umumnya memakai MySQL/MariaDB; aplikasi Android sering memakai SQLite.'
      }
    ],
    ujiTitle: 'Jodohkan istilah dengan pengertiannya',
    ujiInstruction: 'Ketuk satu istilah di kolom kiri, lalu ketuk pengertiannya di kolom kanan. Ketuk istilah yang sudah berpasangan untuk melepasnya.',
    terms: [
      { id: 't-dbms', label: 'DBMS' },
      { id: 't-dba', label: 'DBA' },
      { id: 't-ddl', label: 'DDL' },
      { id: 't-dml', label: 'DML' },
      { id: 't-dcl', label: 'DCL' },
      { id: 't-kamus', label: 'Kamus data' },
      { id: 't-konkurensi', label: 'Kendali konkurensi' },
      { id: 't-integritas', label: 'Integritas data' }
    ],
    defs: [
      { id: 'd-dbms', label: 'Perangkat lunak yang mengelola basis data dan menjadi perantara pengguna dengan data.' },
      { id: 'd-dba', label: 'Orang yang bertanggung jawab atas struktur, hak akses, dan cadangan basis data.' },
      { id: 'd-ddl', label: 'Kelompok perintah untuk membuat dan mengubah struktur tabel.' },
      { id: 'd-dml', label: 'Kelompok perintah untuk menampilkan, menambah, mengubah, dan menghapus isi data.' },
      { id: 'd-dcl', label: 'Kelompok perintah untuk memberi dan mencabut hak akses pengguna.' },
      { id: 'd-kamus', label: 'Data tentang data (metadata): nama tabel, kolom, tipe data, dan aturannya.' },
      { id: 'd-konkurensi', label: 'Pengaturan agar banyak pengguna dapat mengakses data bersamaan tanpa saling menimpa.' },
      { id: 'd-integritas', label: 'Keadaan data yang benar dan sesuai aturan, dijaga dengan batasan (constraint).' }
    ],
    key: {
      't-dbms': 'd-dbms',
      't-dba': 'd-dba',
      't-ddl': 'd-ddl',
      't-dml': 'd-dml',
      't-dcl': 'd-dcl',
      't-kamus': 'd-kamus',
      't-konkurensi': 'd-konkurensi',
      't-integritas': 'd-integritas'
    },
    cekLabel: 'Periksa pasangan',
    ulangLabel: 'Kosongkan pasangan',
    lanjutLabel: 'Lanjut ke Pengolahan Data →'
  },

  /* ==========================================================
     TAHAP 5 — Pengolahan Data
     ========================================================== */
  olah: {
    kicker: 'Tahap 5 · Pengolahan Data',
    title: 'Pusat Kendali DBMS',
    goal: 'Mengolah informasi dengan memetakan permintaan pengguna ke fungsi DBMS yang menanganinya.',
    intro:
      'SMK Nusantara kini memindahkan semua datanya ke satu DBMS. Kamu bertugas di <strong>Pusat Kendali DBMS</strong>. ' +
      'Permintaan dari pengguna berdatangan — tentukan <strong>fungsi DBMS</strong> mana yang menangani setiap permintaan.',
    fungsiLabel: 'Misi A · Pilah permintaan ke fungsi DBMS',
    fungsiInstruction: 'Ketuk satu tiket permintaan, lalu ketuk kolom fungsi yang tepat. Pada keyboard, fokuskan tiket lalu tekan angka 1–6.',
    fungsiColumns: [
      { id: 'definisi', name: 'Definisi Data', desc: 'membuat & mengubah struktur', colorKey: 'blue' },
      { id: 'manipulasi', name: 'Manipulasi Data', desc: 'mengolah isi data', colorKey: 'green' },
      { id: 'keamanan', name: 'Keamanan', desc: 'hak akses pengguna', colorKey: 'purple' },
      { id: 'integritas', name: 'Integritas', desc: 'menolak data yang salah', colorKey: 'orange' },
      { id: 'konkurensi', name: 'Konkurensi', desc: 'akses bersamaan', colorKey: 'teal' },
      { id: 'pemulihan', name: 'Backup & Recovery', desc: 'mencadangkan & memulihkan', colorKey: 'rose' }
    ],
    /* entityId = id kolom fungsi yang benar (nama properti mengikuti
       pembantu chipBoard di app-core.js). */
    fungsiChips: [
      { id: 'p-buat', label: 'Buat tabel baru "peminjaman"', entityId: 'definisi' },
      { id: 'p-kolom', label: 'Tambahkan kolom email ke tabel siswa', entityId: 'definisi' },
      { id: 'p-ubah', label: 'Ganti alamat Dewi menjadi Jl. Anggrek 3', entityId: 'manipulasi' },
      { id: 'p-cari', label: 'Tampilkan siswa XI RPL yang meminjam > 5 buku', entityId: 'manipulasi' },
      { id: 'p-siswa', label: 'Siswa hanya boleh melihat datanya sendiri', entityId: 'keamanan' },
      { id: 'p-bk', label: 'Hanya guru BK yang boleh membaca catatan konseling', entityId: 'keamanan' },
      { id: 'p-umur', label: 'Tolak isian umur yang berupa huruf', entityId: 'integritas' },
      { id: 'p-nis', label: 'Cegah dua siswa memakai NIS yang sama', entityId: 'integritas' },
      { id: 'p-bareng', label: 'TU dan BK mengubah data Dewi pada detik yang sama', entityId: 'konkurensi' },
      { id: 'p-presensi', label: '300 siswa mengisi presensi daring serentak', entityId: 'konkurensi' },
      { id: 'p-malam', label: 'Cadangkan seluruh data otomatis setiap malam', entityId: 'pemulihan' },
      { id: 'p-mati', label: 'Kembalikan data setelah server mati mendadak', entityId: 'pemulihan' }
    ],
    fungsiLabels: {
      pool: 'Tiket permintaan',
      poolEmpty: 'Semua tiket sudah dipilah',
      empty: 'Belum ada tiket'
    },
    bahasaLabel: 'Misi B · Kelompokkan perintah bahasa DBMS',
    bahasaInstruction: 'Fungsi definisi, manipulasi, dan keamanan dijalankan lewat perintah SQL. Kelompokkan setiap perintah ke DDL, DML, atau DCL.',
    bahasaColumns: [
      { id: 'ddl', name: 'DDL', desc: 'Data Definition Language', colorKey: 'blue' },
      { id: 'dml', name: 'DML', desc: 'Data Manipulation Language', colorKey: 'green' },
      { id: 'dcl', name: 'DCL', desc: 'Data Control Language', colorKey: 'purple' }
    ],
    bahasaChips: [
      { id: 'sql-create', label: 'CREATE TABLE', entityId: 'ddl' },
      { id: 'sql-alter', label: 'ALTER TABLE', entityId: 'ddl' },
      { id: 'sql-drop', label: 'DROP TABLE', entityId: 'ddl' },
      { id: 'sql-select', label: 'SELECT', entityId: 'dml' },
      { id: 'sql-insert', label: 'INSERT', entityId: 'dml' },
      { id: 'sql-update', label: 'UPDATE', entityId: 'dml' },
      { id: 'sql-delete', label: 'DELETE', entityId: 'dml' },
      { id: 'sql-grant', label: 'GRANT', entityId: 'dcl' },
      { id: 'sql-revoke', label: 'REVOKE', entityId: 'dcl' }
    ],
    bahasaLabels: {
      pool: 'Perintah SQL',
      poolEmpty: 'Semua perintah sudah dikelompokkan',
      empty: 'Belum ada perintah'
    },
    cekLabel: 'Periksa',
    fungsiBenar: 'Semua tiket tepat! Setiap masalah di SMK Nusantara ternyata punya fungsi DBMS yang menanganinya.',
    bahasaBenar: 'Semua perintah tepat! DDL mengurus struktur, DML mengurus isi, DCL mengurus hak akses.',
    salahPesan: 'Chip bertanda ✗ perlu dipindah. Ketuk chip itu untuk mengembalikannya, lalu tempatkan lagi.',
    lanjutLabel: 'Lanjut ke Verifikasi →'
  },

  /* ==========================================================
     TAHAP 6 — Verifikasi
     ========================================================== */
  uji: {
    kicker: 'Tahap 6 · Verifikasi',
    title: 'Simulasi: Sebelum dan Sesudah DBMS',
    goal: 'Membuktikan dugaanmu tentang fungsi DBMS pada kejadian-kejadian nyata di SMK Nusantara.',
    instruction:
      'Setiap kejadian di bawah pernah terjadi saat data masih berupa file. Tebak apa yang terjadi bila ' +
      'kejadian yang sama berlangsung setelah sekolah memakai DBMS, lalu jalankan simulasinya.',
    prediksiLabel: 'Tebakanmu: apa yang dilakukan DBMS?',
    bukaLabel: 'Jalankan simulasi',
    benarPrediksi: 'Dugaanmu terbukti!',
    salahPrediksi: 'Dugaanmu belum tepat — lihat hasil simulasi untuk mengetahui yang sebenarnya terjadi.',
    sebelumLabel: 'Sebelum: file terpisah',
    sesudahLabel: 'Sesudah: memakai DBMS',
    konsolLabel: 'Respons DBMS',
    cases: [
      {
        id: 'u-alamat',
        icon: '🏠',
        title: 'TU mengubah alamat Dewi',
        scenario: 'Pak Arif mengganti alamat Dewi menjadi Jl. Anggrek 3. Sesaat kemudian, Bu Rina di BK membuka data Dewi.',
        options: [
          { id: 'a', label: 'Bu Rina langsung melihat alamat baru, karena semua bagian membaca dari satu tabel siswa yang sama.' },
          { id: 'b', label: 'Bu Rina masih melihat alamat lama sampai ia mengetik ulang alamatnya sendiri.' },
          { id: 'c', label: 'Bu Rina melihat dua alamat sekaligus dan harus memilih salah satunya.' },
          { id: 'd', label: 'Data Dewi terkunci selamanya setelah diubah.' }
        ],
        correct: 'a',
        sebelum: 'Alamat hanya berubah di file TU. File BK tetap mencatat Jl. Melati 5, sehingga surat dikirim ke alamat lama.',
        sesudah: 'Data disimpan sekali secara terpusat. Perubahan langsung terlihat oleh semua aplikasi yang memakainya.',
        konsol: "UPDATE siswa SET alamat = 'Jl. Anggrek 3' WHERE nis = '2301';\n→ 1 baris diubah.\nSELECT alamat FROM siswa WHERE nis = '2301';  -- dari aplikasi BK\n→ Jl. Anggrek 3",
        konsep: 'Penyimpanan terpusat → mengurangi redundansi & inkonsistensi'
      },
      {
        id: 'u-umur',
        icon: '🔢',
        title: 'Petugas perpustakaan mengetik umur "tujuh belas"',
        scenario: 'Petugas perpustakaan mendaftarkan anggota baru dan mengetik "tujuh belas" pada kolom umur yang bertipe angka dengan batas 10–25.',
        options: [
          { id: 'a', label: 'DBMS menolak isian itu dan menampilkan pesan kesalahan, sehingga data yang salah tidak tersimpan.' },
          { id: 'b', label: 'DBMS menyimpannya apa adanya, nanti diperbaiki kalau ada yang sadar.' },
          { id: 'c', label: 'DBMS otomatis menghapus seluruh tabel anggota.' },
          { id: 'd', label: 'DBMS mengubahnya menjadi angka acak.' }
        ],
        correct: 'a',
        sebelum: 'Spreadsheet menerima teks "tujuh belas" dan angka 170 tanpa peringatan.',
        sesudah: 'DBMS memeriksa tipe data dan batasan (constraint) setiap kolom sebelum menyimpan.',
        konsol: "INSERT INTO anggota (nis, umur) VALUES ('2304', 'tujuh belas');\n→ ERROR: nilai 'tujuh belas' tidak valid untuk kolom umur (INTEGER).",
        konsep: 'Fungsi integritas data (tipe data & constraint)'
      },
      {
        id: 'u-bareng',
        icon: '⏱️',
        title: 'Dua operator menyimpan bersamaan',
        scenario: 'Pak Arif dan Bu Rina mengubah baris data Dewi pada detik yang sama dari dua komputer berbeda.',
        options: [
          { id: 'a', label: 'DBMS mengunci baris itu sementara, memproses perubahan secara bergiliran, sehingga tidak ada perubahan yang hilang diam-diam.' },
          { id: 'b', label: 'Perubahan yang disimpan terakhir menimpa yang pertama tanpa ada yang tahu.' },
          { id: 'c', label: 'Kedua komputer langsung mati.' },
          { id: 'd', label: 'DBMS membuat dua salinan data Dewi yang berbeda.' }
        ],
        correct: 'a',
        sebelum: 'File yang disimpan belakangan menimpa file sebelumnya. Perubahan Pak Arif hilang.',
        sesudah: 'DBMS mengatur akses bersamaan dengan penguncian (locking) dan transaksi.',
        konsol: "[TU]  BEGIN; UPDATE siswa SET hp = '0812-1111-2222' WHERE nis='2301';  → baris dikunci\n[BK]  UPDATE siswa SET kelas = 'XI RPL 1' WHERE nis='2301';  → menunggu…\n[TU]  COMMIT;  → kunci dilepas\n[BK]  → 1 baris diubah (kedua perubahan tersimpan)",
        konsep: 'Fungsi kendali konkurensi'
      },
      {
        id: 'u-akses',
        icon: '🔐',
        title: 'Siswa mencoba membuka catatan BK',
        scenario: 'Seorang siswa masuk memakai akun siswanya dan mencoba menampilkan tabel catatan konseling.',
        options: [
          { id: 'a', label: 'DBMS menolak permintaan karena akun siswa tidak diberi hak membaca tabel itu.' },
          { id: 'b', label: 'Siswa bisa membaca semua catatan asalkan tahu nama tabelnya.' },
          { id: 'c', label: 'DBMS menghapus akun siswa tersebut secara otomatis.' },
          { id: 'd', label: 'Catatan ditampilkan, tetapi hurufnya diperkecil.' }
        ],
        correct: 'a',
        sebelum: 'Siapa pun yang memegang komputer TU bisa membuka CatatanBK.xlsx.',
        sesudah: 'DBA memberi hak akses sesuai peran (GRANT/REVOKE). DBMS memeriksa hak setiap pengguna.',
        konsol: "-- login sebagai: siswa_2302\nSELECT * FROM catatan_bk;\n→ ERROR: akses SELECT ditolak untuk pengguna 'siswa_2302' pada tabel 'catatan_bk'.",
        konsep: 'Fungsi keamanan & hak akses (DCL)'
      },
      {
        id: 'u-mati',
        icon: '💥',
        title: 'Server mati mendadak',
        scenario: 'Listrik padam dan server basis data mati di tengah jam pelajaran. Setelah menyala, apa yang terjadi pada data?',
        options: [
          { id: 'a', label: 'DBMS memulihkan data dari cadangan dan catatan transaksi (log), sehingga data kembali ke keadaan terakhir yang utuh.' },
          { id: 'b', label: 'Semua data hilang dan harus diketik ulang dari awal.' },
          { id: 'c', label: 'Data hanya bisa dikembalikan jika ada yang ingat isinya.' },
          { id: 'd', label: 'Server tidak bisa dinyalakan lagi selamanya.' }
        ],
        correct: 'a',
        sebelum: 'Laptop perpustakaan rusak dan data peminjaman dua bulan hilang karena tidak ada cadangan.',
        sesudah: 'DBMS menyediakan backup terjadwal dan recovery memakai log transaksi.',
        konsol: "[startup] Pemulihan otomatis dimulai…\n[startup] Membaca log transaksi: 42 transaksi selesai diterapkan ulang, 1 transaksi belum selesai dibatalkan.\n[startup] Basis data siap dipakai.",
        konsep: 'Fungsi backup & recovery'
      },
      {
        id: 'u-laporan',
        icon: '📊',
        title: 'Kepala sekolah meminta laporan gabungan',
        scenario: 'Kepala sekolah kembali meminta daftar siswa XI RPL yang pernah konseling dan meminjam lebih dari 5 buku.',
        options: [
          { id: 'a', label: 'Operator cukup menjalankan satu perintah query, dan hasilnya muncul dalam hitungan detik.' },
          { id: 'b', label: 'Operator tetap harus menggabungkan tiga file secara manual selama dua hari.' },
          { id: 'c', label: 'DBMS tidak bisa menggabungkan data dari tabel yang berbeda.' },
          { id: 'd', label: 'Laporan hanya bisa dibuat oleh programmer pembuat DBMS.' }
        ],
        correct: 'a',
        sebelum: 'Tiga file harus dibuka, dicocokkan baris demi baris, lalu disalin manual.',
        sesudah: 'DBMS menyediakan bahasa query (DML) untuk mengambil dan menggabungkan data dengan cepat.',
        konsol: "SELECT s.nama FROM siswa s\n  JOIN konseling k ON k.nis = s.nis\n  JOIN anggota a ON a.nis = s.nis\n WHERE s.kelas LIKE 'XI RPL%' AND a.jml_pinjam > 5;\n→ 1 baris: Dewi Lestari  (0,02 detik)",
        konsep: 'Fungsi manipulasi data (query dengan DML)'
      }
    ],
    penutup: 'Semua simulasi sudah dijalankan. Setiap kejadian buruk di SMK Nusantara ternyata dicegah oleh fungsi DBMS tertentu.',
    lanjutLabel: 'Lanjut ke Generalisasi →'
  },

  /* ==========================================================
     TAHAP 7 — Generalisasi
     ========================================================== */
  simpulan: {
    kicker: 'Tahap 7 · Generalisasi',
    title: 'Menyimpulkan Konsep dan Fungsi DBMS',
    goal: 'Merumuskan kesimpulan umum tentang DBMS dan menguji pemahaman pada kasus baru.',
    instruction: 'Pilih <strong>semua</strong> pernyataan yang benar tentang DBMS berdasarkan hasil penyelidikanmu.',
    statements: [
      { id: 's-perantara', valid: true, text: 'DBMS adalah perangkat lunak yang menjadi perantara antara pengguna/aplikasi dan basis data.', feedback: 'Benar. Pengguna tidak membuka file data langsung, melainkan meminta data kepada DBMS.' },
      { id: 's-terpusat', valid: true, text: 'Dengan DBMS, data disimpan terpusat sehingga redundansi dan inkonsistensi berkurang.', feedback: 'Benar. Terbukti pada simulasi perubahan alamat Dewi.' },
      { id: 's-integritas', valid: true, text: 'DBMS menjaga integritas dengan menolak isian yang melanggar tipe data atau batasan (constraint).', feedback: 'Benar. Terbukti pada simulasi umur "tujuh belas".' },
      { id: 's-akses', valid: true, text: 'DBMS mengatur hak akses sehingga setiap pengguna hanya dapat membaca atau mengubah data sesuai perannya.', feedback: 'Benar. Terbukti pada simulasi siswa yang mencoba membuka catatan BK.' },
      { id: 's-konkurensi', valid: true, text: 'DBMS mengendalikan akses bersamaan serta menyediakan backup dan recovery.', feedback: 'Benar. Terbukti pada simulasi dua operator dan server yang mati mendadak.' },
      { id: 's-sama', valid: false, text: 'DBMS dan basis data adalah hal yang sama.', feedback: 'Keliru. Basis data adalah kumpulan datanya; DBMS adalah perangkat lunak yang mengelolanya.' },
      { id: 's-excel', valid: false, text: 'Spreadsheet seperti Excel termasuk DBMS karena dapat menyimpan data dalam tabel.', feedback: 'Keliru. Spreadsheet tidak menyediakan hak akses per pengguna, kendali konkurensi, constraint, maupun recovery seperti DBMS.' },
      { id: 's-sempurna', valid: false, text: 'Selama memakai DBMS, data tidak mungkin salah sehingga basis data tidak perlu dirancang.', feedback: 'Keliru. DBMS hanya menjalankan aturan yang dirancang. Tanpa rancangan yang baik, data tetap bisa salah.' }
    ],
    cekLabel: 'Periksa pernyataan',
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt: 'Dengan kata-katamu sendiri: apa itu DBMS dan apa saja fungsinya dalam pengelolaan basis data?',
    kesimpulanPlaceholder: 'DBMS adalah … Fungsinya antara lain …',
    kesimpulanMin: 80,
    kuisLabel: 'Uji pemahaman: Kantin Sekolah',
    kuisIntro:
      'Kantin sekolah mulai memakai aplikasi kasir yang terhubung ke DBMS. Data menu, stok, dan penjualan ' +
      'dipakai bersama oleh kasir, petugas gudang, dan bendahara. Jawab soal berikut.',
    questions: [
      {
        id: 'q-grant',
        prompt: 'Bendahara ingin kasir hanya bisa MEMBACA tabel menu, tanpa bisa mengubah harga. Perintah yang dipakai termasuk kelompok…',
        options: [
          { id: 'a', label: 'DCL, misalnya GRANT SELECT' },
          { id: 'b', label: 'DDL, misalnya CREATE TABLE' },
          { id: 'c', label: 'DML, misalnya UPDATE' },
          { id: 'd', label: 'Kamus data' }
        ],
        correct: 'a',
        explanation: 'Mengatur hak akses adalah tugas DCL (GRANT/REVOKE), bagian dari fungsi keamanan DBMS.'
      },
      {
        id: 'q-stok',
        prompt: 'Dua kasir menjual porsi terakhir nasi goreng pada detik yang sama. Fungsi DBMS yang mencegah stok menjadi minus adalah…',
        options: [
          { id: 'a', label: 'Kendali konkurensi' },
          { id: 'b', label: 'Definisi data' },
          { id: 'c', label: 'Backup dan recovery' },
          { id: 'd', label: 'Kamus data' }
        ],
        correct: 'a',
        explanation: 'Kendali konkurensi mengunci data stok sehingga dua transaksi diproses bergiliran.'
      },
      {
        id: 'q-harga',
        prompt: 'Petugas gudang tanpa sengaja memasukkan harga menu -5000. DBMS menolaknya. Fungsi apa yang sedang bekerja?',
        options: [
          { id: 'a', label: 'Integritas data' },
          { id: 'b', label: 'Manipulasi data' },
          { id: 'c', label: 'Keamanan' },
          { id: 'd', label: 'Recovery' }
        ],
        correct: 'a',
        explanation: 'Batasan (constraint) harga > 0 menjaga integritas data.'
      },
      {
        id: 'q-dba',
        prompt: 'Siapa yang bertanggung jawab mengatur struktur tabel, hak akses, dan jadwal backup basis data kantin?',
        options: [
          { id: 'a', label: 'Database Administrator (DBA)' },
          { id: 'b', label: 'Kasir sebagai pengguna akhir' },
          { id: 'c', label: 'Pembeli' },
          { id: 'd', label: 'Pembuat perangkat keras server' }
        ],
        correct: 'a',
        explanation: 'DBA mengelola DBMS: struktur, hak akses, kinerja, serta backup dan recovery.'
      },
      {
        id: 'q-contoh',
        prompt: 'Manakah yang merupakan contoh DBMS?',
        options: [
          { id: 'a', label: 'PostgreSQL' },
          { id: 'b', label: 'Microsoft Excel' },
          { id: 'c', label: 'Visual Studio Code' },
          { id: 'd', label: 'Google Chrome' }
        ],
        correct: 'a',
        explanation: 'PostgreSQL adalah DBMS. Excel adalah spreadsheet, VS Code adalah editor kode, Chrome adalah peramban.'
      },
      {
        id: 'q-beda',
        prompt: 'Apa perbedaan utama antara basis data dan DBMS?',
        options: [
          { id: 'a', label: 'Basis data adalah kumpulan data yang terorganisasi; DBMS adalah perangkat lunak yang mengelolanya.' },
          { id: 'b', label: 'Basis data adalah perangkat lunak; DBMS adalah kumpulan datanya.' },
          { id: 'c', label: 'Keduanya sama, hanya berbeda nama.' },
          { id: 'd', label: 'DBMS hanya dipakai untuk mencetak laporan.' }
        ],
        correct: 'a',
        explanation: 'Basis data = datanya; DBMS = perangkat lunak yang membuat, menyimpan, mengelola, dan mengamankan data itu.'
      }
    ],
    kuisCekLabel: 'Periksa jawaban',
    kuisUlangLabel: 'Kerjakan ulang',
    lanjutLabel: 'Lanjut ke Refleksi →'
  },

  /* ==========================================================
     TAHAP 8 — Refleksi
     ========================================================== */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    title: 'Melihat Kembali Perjalanan Belajarmu',
    goal: 'Menilai pemahaman diri dan cara belajarmu.',
    note: 'Tidak ada jawaban benar atau salah di tahap ini. Jawablah dengan jujur.',
    recallLabel: 'Tebakanmu saat simulasi',
    recallKosong: 'Belum ada tebakan yang tersimpan.',
    skalaLabel: 'Seberapa yakin kamu sekarang?',
    skala: [
      { value: 1, label: 'Belum' },
      { value: 2, label: 'Sedikit' },
      { value: 3, label: 'Cukup' },
      { value: 4, label: 'Yakin' },
      { value: 5, label: 'Sangat' }
    ],
    skalaItems: [
      { id: 'l-pengertian', text: 'Saya dapat menjelaskan perbedaan basis data dan DBMS.' },
      { id: 'l-masalah', text: 'Saya dapat menjelaskan masalah pengelolaan data tanpa DBMS.' },
      { id: 'l-bahasa', text: 'Saya dapat membedakan perintah DDL, DML, dan DCL.' },
      { id: 'l-fungsi', text: 'Saya dapat menjelaskan fungsi-fungsi DBMS beserta contohnya.' }
    ],
    prompts: [
      { id: 'p-kejut', question: 'Temuan apa yang paling mengejutkanmu selama penyelidikan ini? Mengapa?', placeholder: 'Yang paling mengejutkan bagiku adalah …' },
      { id: 'p-terap', question: 'Di aplikasi apa saja yang kamu pakai sehari-hari kira-kira ada DBMS di baliknya?', placeholder: 'Misalnya aplikasi …' }
    ],
    simpanLabel: 'Simpan refleksi',
    tersimpan: 'Refleksi tersimpan.',
    lanjutLabel: 'Lihat hasil akhir →'
  },

  /* ==========================================================
     TAHAP 9 — Selesai
     ========================================================== */
  selesai: {
    kicker: 'Tahap 9 · Selesai',
    title: 'Penyelidikan Selesai!',
    skorLabel: 'Rincian skor',
    fungsiLabel: 'Fungsi DBMS dan masalah yang diselesaikannya',
    fungsiHeaders: ['Fungsi DBMS', 'Tugasnya', 'Masalah di SMK Nusantara yang terselesaikan'],
    fungsiMasalah: {
      definisi: 'Struktur tabel dibuat sekali dan dipakai bersama, bukan per file.',
      manipulasi: 'Laporan gabungan dua hari menjadi hitungan detik.',
      keamanan: 'Catatan BK tidak lagi bisa dibaca siswa lain.',
      integritas: 'NIS ganda, umur "tujuh belas", dan umur 170 ditolak.',
      konkurensi: 'Perubahan TU dan BK tidak saling menimpa.',
      pemulihan: 'Data tidak hilang ketika perangkat rusak.'
    },
    kesimpulanLabel: 'Kesimpulanmu',
    konsepKunci: [
      'Basis data adalah kumpulan data yang terorganisasi; DBMS adalah perangkat lunak yang mengelolanya.',
      'Sistem berbasis file rawan redundansi, inkonsistensi, data bocor, data tertimpa, dan data hilang.',
      'Pengguna DBMS: DBA, programmer, dan pengguna akhir.',
      'Bahasa DBMS: DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE).',
      'Fungsi DBMS: definisi data, manipulasi data, keamanan, integritas, kendali konkurensi, backup & recovery, serta kamus data.',
      'Contoh DBMS: MySQL, MariaDB, PostgreSQL, SQLite, Oracle, SQL Server.'
    ],
    lanjutLabel: 'Langkah berikutnya',
    lanjut: [
      'Pasang salah satu DBMS (misalnya MariaDB/MySQL lewat XAMPP) dan coba perintah CREATE TABLE serta SELECT.',
      'Amati aplikasi sekolahmu: data apa saja yang kemungkinan dikelola oleh DBMS?'
    ],
    ulangLabel: 'Ulangi dari awal',
    ulangKonfirmasi: 'Reset seluruh progres materi ini? Semua jawaban akan dihapus dan pilihan jawaban diacak ulang.',
    berandaLabel: 'Kembali ke beranda'
  }
};

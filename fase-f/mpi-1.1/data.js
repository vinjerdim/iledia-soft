'use strict';

/* ============================================================
   data.js — seluruh isi materi 1.1
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
    title: 'Konsep Dasar Basis Data Relasional',
    subject: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Discovery Learning',
    goal:
      'Mengidentifikasi konsep dasar basis data relasional dan pentingnya ' +
      'perancangan struktur data dalam pengembangan perangkat lunak.'
  },

  /* ==========================================================
     TAHAP 1 — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Sebelum Mulai',
    goal: 'Memahami tujuan, alur, dan cara memakai media ini.',
    salam:
      'Di media ini kamu tidak akan diberi definisi lebih dulu. Kamu akan ' +
      '<strong>menemukan sendiri</strong> konsep basis data relasional dari sebuah ' +
      'masalah nyata di Lab RPL — lalu membuktikan sendiri mengapa perancangan ' +
      'struktur data itu penting.',
    tujuanLabel: 'Setelah menyelesaikan media ini kamu dapat:',
    tujuan: [
      'Membedakan data yang tersimpan rapi dan data yang tersimpan berantakan.',
      'Mengidentifikasi istilah dasar basis data relasional: entitas, tabel, record, field, primary key, dan foreign key.',
      'Memecah satu tabel berantakan menjadi beberapa tabel yang saling berelasi.',
      'Menjelaskan akibat buruk struktur data yang tidak dirancang terhadap perangkat lunak yang dibangun di atasnya.'
    ],
    alurLabel: 'Alur belajar (9 tahap)',
    alur: [
      { id: 'a1', title: 'Stimulasi', desc: 'Menemukan kejanggalan pada catatan Lab RPL.' },
      { id: 'a2', title: 'Rumusan Masalah', desc: 'Menetapkan masalah apa yang sebenarnya terjadi.' },
      { id: 'a3', title: 'Pengumpulan Data', desc: 'Mengumpulkan konsep dan istilah yang dibutuhkan.' },
      { id: 'a4', title: 'Pengolahan Data', desc: 'Merancang sendiri struktur tabel yang lebih baik.' },
      { id: 'a5', title: 'Verifikasi', desc: 'Menguji rancanganmu melawan catatan lama.' },
      { id: 'a6', title: 'Generalisasi', desc: 'Menyimpulkan konsep yang kamu temukan.' },
      { id: 'a7', title: 'Refleksi & Selesai', desc: 'Menilai pemahamanmu sendiri dan merangkum hasil.' }
    ],
    caraPakaiLabel: 'Cara memakai',
    caraPakai: [
      'Tahap terbuka berurutan — selesaikan satu tahap untuk membuka tahap berikutnya.',
      'Progresmu tersimpan otomatis di perangkat ini. Boleh ditutup lalu dilanjutkan nanti.',
      'Tidak apa-apa salah. Setiap jawaban salah diberi penjelasan, bukan hukuman.',
      'Tombol <strong>Reset</strong> di kanan atas menghapus seluruh progres dan mengacak ulang pilihan jawaban.'
    ]
  },

  /* ==========================================================
     TAHAP 2 — Stimulasi
     ========================================================== */
  stimulasi: {
    kicker: 'Tahap 2 · Stimulasi',
    title: 'Catatan Lab yang Bikin Pusing',
    goal: 'Menemukan kejanggalan pada cara data peminjaman dicatat.',
    cerita:
      '<p>Pak Yusuf, toolman Lab RPL, mencatat semua peminjaman alat di ' +
      '<strong>satu file spreadsheet</strong> bernama <em>SiPinjam</em>. Satu baris = satu peminjaman. ' +
      'Sudah berjalan dua tahun dan sekarang isinya ribuan baris.</p>' +
      '<p>Minggu lalu Pak Yusuf mengeluh:</p>',
    keluhan:
      '"Dewi ganti nomor HP, saya harus cari satu per satu semua barisnya. ' +
      'Kemarin ada yang kelewat, jadi sekarang nomornya beda-beda. Saya sendiri bingung mana yang benar."',
    instruction:
      'Amati tabel di bawah. <strong>Ketuk sel yang menurutmu janggal</strong> — ' +
      'sel yang isinya sekadar mengulang fakta yang sudah ditulis di baris sebelumnya, ' +
      'atau yang isinya tidak konsisten.',
    minTemuan: 6,
    hintLabel: '💡 Belum ketemu? Buka petunjuk',
    hint:
      'Bandingkan baris-baris yang <strong>siswanya sama</strong>, lalu baris-baris yang ' +
      '<strong>alatnya sama</strong>. Fakta mana yang ditulis berulang-ulang? ' +
      'Perhatikan juga apakah fakta yang berulang itu selalu ditulis dengan cara yang sama.',

    columns: [
      { id: 'tanggal', label: 'tanggal' },
      { id: 'nama_siswa', label: 'nama_siswa' },
      { id: 'kelas', label: 'kelas' },
      { id: 'no_hp', label: 'no_hp' },
      { id: 'kode_alat', label: 'kode_alat' },
      { id: 'nama_alat', label: 'nama_alat' },
      { id: 'spesifikasi', label: 'spesifikasi' },
      { id: 'lama', label: 'lama_pinjam' }
    ],

    rows: [
      { id: 'r1', cells: ['02/09/2025', 'Rani Alfiah', 'XI RPL 1', '0812-3344-5566', 'ALT-01', 'Laptop Lab', 'Core i5, RAM 8 GB', '3 hari'] },
      { id: 'r2', cells: ['02/09/2025', 'Bima Saputra', 'XI RPL 2', '0857-1122-3344', 'ALT-04', 'Proyektor', '3200 lumen, HDMI', '1 hari'] },
      { id: 'r3', cells: ['04/09/2025', 'Rani Alfiah', 'XI RPL 1', '0812-3344-5566', 'ALT-04', 'Proyektor', '3200 lumen, HDMI', '2 hari'] },
      { id: 'r4', cells: ['05/09/2025', 'Dewi Lestari', 'XI RPL 1', '0895-7788-9900', 'ALT-01', 'Laptop Lab', 'Core i5, RAM 8 GB', '5 hari'] },
      { id: 'r5', cells: ['08/09/2025', 'Bima Saputra', 'XI RPL 2', '0857-1122-3344', 'ALT-07', 'Kabel LAN 10 m', 'Cat6, abu-abu', '2 hari'] },
      { id: 'r6', cells: ['09/09/2025', 'Aldi Pratama', 'XI RPL 2', '0813-2211-4455', 'ALT-09', 'Kamera DSLR', '18 MP, lensa kit', '1 hari'] },
      { id: 'r7', cells: ['11/09/2025', 'Aldi Pratama', 'XI RPL 2', '0813-2211-4455', 'ALT-04', 'Proyektor', '3.200 lumen, HDMI', '3 hari'] },
      { id: 'r8', cells: ['12/09/2025', 'Dewi Lestari', 'XI RPL 1', '0895-7788-990', 'ALT-07', 'Kabel LAN 10 m', 'Cat6, abu-abu', '4 hari'] }
    ],

    /* Sel bermasalah, dikunci "barisId:kolomId".
       kind: 'ulang' (fakta diulang) | 'beda' (fakta tidak konsisten) */
    problemCells: {
      'r3:kelas': { kind: 'ulang', why: 'Kelas Rani sudah ditulis di baris 1. Ditulis ulang setiap kali Rani meminjam.' },
      'r3:no_hp': { kind: 'ulang', why: 'Nomor HP Rani sudah ada di baris 1. Fakta yang sama ditulis dua kali.' },
      'r3:nama_alat': { kind: 'ulang', why: 'Nama alat ALT-04 sudah ditulis di baris 2.' },
      'r3:spesifikasi': { kind: 'ulang', why: 'Spesifikasi ALT-04 sudah ditulis di baris 2.' },
      'r4:nama_alat': { kind: 'ulang', why: 'Nama alat ALT-01 sudah ditulis di baris 1.' },
      'r4:spesifikasi': { kind: 'ulang', why: 'Spesifikasi ALT-01 sudah ditulis di baris 1.' },
      'r5:kelas': { kind: 'ulang', why: 'Kelas Bima sudah ditulis di baris 2.' },
      'r5:no_hp': { kind: 'ulang', why: 'Nomor HP Bima sudah ditulis di baris 2.' },
      'r7:kelas': { kind: 'ulang', why: 'Kelas Aldi sudah ditulis di baris 6.' },
      'r7:no_hp': { kind: 'ulang', why: 'Nomor HP Aldi sudah ditulis di baris 6.' },
      'r7:nama_alat': { kind: 'ulang', why: 'Nama alat ALT-04 sudah ditulis dua kali sebelumnya.' },
      'r7:spesifikasi': { kind: 'beda', why: 'Temuan penting! ALT-04 yang sama ditulis "3200 lumen" di baris 2 dan 3, tetapi "3.200 lumen" di sini. Fakta yang diulang mulai berbeda-beda.' },
      'r8:kelas': { kind: 'ulang', why: 'Kelas Dewi sudah ditulis di baris 4.' },
      'r8:no_hp': { kind: 'beda', why: 'Inilah yang dikeluhkan Pak Yusuf. Nomor Dewi di baris 4 adalah 0895-7788-9900, di sini 0895-7788-990 — kurang satu angka. Mana yang benar?' },
      'r8:nama_alat': { kind: 'ulang', why: 'Nama alat ALT-07 sudah ditulis di baris 5.' },
      'r8:spesifikasi': { kind: 'ulang', why: 'Spesifikasi ALT-07 sudah ditulis di baris 5.' }
    },

    /* Umpan balik saat murid menandai sel yang sebenarnya wajar. */
    okCells: {
      tanggal: 'Tanggal berbeda di tiap peminjaman — ini memang fakta milik transaksi itu sendiri.',
      lama: 'Lama pinjam berbeda di tiap peminjaman — ini fakta milik transaksi itu sendiri.',
      nama_siswa: 'Nama siswa memang berulang, tapi kolom inilah yang nanti menjadi penghubung antar tabel. Yang bermasalah adalah fakta yang MENGIKUTI siswa: kelas dan no_hp.',
      kode_alat: 'Kode alat memang berulang, tapi kolom inilah penghubung ke data alat. Yang bermasalah adalah fakta yang MENGIKUTI alat: nama_alat dan spesifikasi.'
    },

    temuanLabel: 'Kejanggalan ditemukan',
    lanjutLabel: 'Lanjut: rumuskan masalahnya →'
  },

  /* ==========================================================
     TAHAP 3 — Rumusan Masalah
     ========================================================== */
  masalah: {
    kicker: 'Tahap 3 · Identifikasi Masalah',
    title: 'Sebenarnya Apa Masalahnya?',
    goal: 'Merumuskan masalah yang sesungguhnya, bukan sekadar gejalanya.',
    instruction:
      'Dari temuanmu di tahap sebelumnya, <strong>pilih semua pernyataan yang benar</strong> ' +
      'tentang catatan <em>SiPinjam</em>. Ada lebih dari satu jawaban benar.',

    statements: [
      {
        id: 's1', valid: true,
        text: 'Fakta tentang satu siswa (kelas, no HP) ditulis berulang di banyak baris.',
        feedback: 'Benar. Pengulangan ini disebut <strong>redundansi data</strong>.'
      },
      {
        id: 's2', valid: true,
        text: 'Mengubah satu fakta (misalnya nomor HP) menuntut perubahan di banyak baris sekaligus.',
        feedback: 'Benar. Inilah <strong>anomali pembaruan</strong> — satu perubahan, banyak titik sunting, besar peluang terlewat.'
      },
      {
        id: 's3', valid: true,
        text: 'Karena diulang, fakta yang sama bisa jadi berbeda-beda isinya dan tidak ada yang tahu mana yang benar.',
        feedback: 'Benar. Data kehilangan <strong>konsistensi</strong>, persis seperti nomor HP Dewi.'
      },
      {
        id: 's4', valid: true,
        text: 'Data alat baru tidak bisa dicatat sebelum ada yang meminjamnya.',
        feedback: 'Benar. Ini <strong>anomali penyisipan</strong> — satu baris hanya lahir kalau ada transaksi.'
      },
      {
        id: 's5', valid: true,
        text: 'Menghapus satu transaksi bisa ikut menghapus satu-satunya catatan tentang sebuah alat.',
        feedback: 'Benar. Ini <strong>anomali penghapusan</strong> — data ikut hilang tanpa sengaja.'
      },
      {
        id: 's6', valid: false,
        text: 'Masalahnya karena Pak Yusuf kurang teliti saat mengetik.',
        feedback: 'Belum tepat. Ketelitian membantu, tetapi ketidakkonsistenan muncul karena <strong>strukturnya</strong> memaksa fakta yang sama ditulis berulang. Siapa pun akan keliru cepat atau lambat.'
      },
      {
        id: 's7', valid: false,
        text: 'Masalahnya karena jumlah barisnya sudah terlalu banyak.',
        feedback: 'Belum tepat. Jumlah baris memperbesar akibatnya, tetapi struktur yang sama tetap bermasalah walau hanya 8 baris — seperti yang kamu lihat tadi.'
      },
      {
        id: 's8', valid: false,
        text: 'Masalahnya akan hilang jika filenya dipindah ke aplikasi spreadsheet yang lebih canggih.',
        feedback: 'Belum tepat. Mengganti alat bantu tidak mengubah <strong>cara data disusun</strong>. Masalahnya ada pada strukturnya, bukan pada perangkat lunaknya.'
      },
      {
        id: 's9', valid: false,
        text: 'Masalahnya karena setiap peminjaman ditulis pada baris yang terpisah.',
        feedback: 'Belum tepat. Satu baris per peminjaman justru sudah benar. Yang keliru adalah ikut menempelkan fakta siswa dan fakta alat pada baris transaksi itu.'
      }
    ],

    cekLabel: 'Periksa pilihanku',
    ownLabel: 'Sekarang tulis dengan kalimatmu sendiri',
    ownPrompt:
      'Menurutmu, apa masalah utama cara Pak Yusuf menyimpan data? Tulis satu sampai dua kalimat.',
    ownPlaceholder: 'Masalah utamanya adalah…',
    ownMin: 25,
    ownKurang: 'Tulis sedikit lebih panjang ya, minimal satu kalimat utuh.',
    lanjutLabel: 'Lanjut: kumpulkan konsepnya →'
  },

  /* ==========================================================
     TAHAP 4 — Pengumpulan Data (konsep)
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Pengumpulan Data',
    title: 'Kosakata untuk Memperbaikinya',
    goal: 'Mengumpulkan konsep dasar basis data relasional yang dibutuhkan untuk merancang ulang.',
    instruction:
      'Masalahnya sudah jelas. Sebelum memperbaiki, kamu butuh kosakatanya. ' +
      '<strong>Ketuk setiap kartu</strong> untuk membukanya.',

    cards: [
      {
        id: 'k_entitas', term: 'Entitas', icon: '🧩',
        def: 'Sesuatu yang nyata dan berdiri sendiri, yang kita ingin simpan datanya.',
        example: 'Pada SiPinjam ada tiga: <strong>Siswa</strong>, <strong>Alat</strong>, dan <strong>Peminjaman</strong>.'
      },
      {
        id: 'k_tabel', term: 'Tabel (Relasi)', icon: '🗂️',
        def: 'Tempat menyimpan data satu entitas. Satu entitas → satu tabel.',
        example: 'Entitas Siswa disimpan di tabel <code>siswa</code>, bukan dicampur ke baris peminjaman.'
      },
      {
        id: 'k_record', term: 'Record (Baris)', icon: '➡️',
        def: 'Satu baris pada tabel, berisi data lengkap tentang <em>satu</em> wujud entitas.',
        example: 'Satu baris di tabel <code>siswa</code> = satu orang siswa, ditulis <strong>sekali saja</strong>.'
      },
      {
        id: 'k_field', term: 'Field (Kolom / Atribut)', icon: '⬇️',
        def: 'Satu kolom pada tabel, yaitu satu jenis fakta yang dimiliki entitas itu.',
        example: '<code>nama_siswa</code>, <code>kelas</code>, dan <code>no_hp</code> adalah field milik entitas Siswa.'
      },
      {
        id: 'k_pk', term: 'Primary Key', icon: '🔑',
        def: 'Satu field yang nilainya <strong>unik</strong> untuk setiap baris, dipakai sebagai penanda resmi baris itu.',
        example: '<code>nis</code> pada tabel <code>siswa</code>. Dua siswa boleh sama nama, tetapi NIS-nya tidak pernah sama.'
      },
      {
        id: 'k_fk', term: 'Foreign Key', icon: '🔗',
        def: 'Field yang menyimpan primary key milik tabel lain, sehingga kedua tabel terhubung.',
        example: '<code>nis</code> di tabel <code>peminjaman</code> menunjuk ke <code>nis</code> di tabel <code>siswa</code> — cukup NIS-nya, bukan seluruh datanya.'
      }
    ],

    matchTitle: 'Uji kosakatamu',
    matchInstruction:
      'Pasangkan setiap istilah dengan pengertiannya. <strong>Ketuk satu istilah</strong>, ' +
      'lalu ketuk pengertian yang cocok.',
    /* Istilah dan pengertian diacak terpisah — itulah inti latihannya. */
    matchTerms: [
      { id: 'm_entitas', label: 'Entitas' },
      { id: 'm_tabel', label: 'Tabel' },
      { id: 'm_record', label: 'Record' },
      { id: 'm_field', label: 'Field' },
      { id: 'm_pk', label: 'Primary Key' },
      { id: 'm_fk', label: 'Foreign Key' }
    ],
    matchDefs: [
      { id: 'd_entitas', label: 'Sesuatu yang datanya ingin kita simpan' },
      { id: 'd_tabel', label: 'Tempat menyimpan data satu entitas' },
      { id: 'd_record', label: 'Satu baris data tentang satu wujud entitas' },
      { id: 'd_field', label: 'Satu jenis fakta yang dimiliki entitas' },
      { id: 'd_pk', label: 'Penanda unik sebuah baris di tabelnya sendiri' },
      { id: 'd_fk', label: 'Penunjuk ke baris milik tabel lain' }
    ],
    matchKey: {
      m_entitas: 'd_entitas',
      m_tabel: 'd_tabel',
      m_record: 'd_record',
      m_field: 'd_field',
      m_pk: 'd_pk',
      m_fk: 'd_fk'
    },
    cekLabel: 'Periksa pasangan',
    ulangLabel: 'Ulangi pasangan',
    lanjutLabel: 'Lanjut: rancang strukturnya →'
  },

  /* ==========================================================
     TAHAP 5 — Pengolahan Data (rancang struktur)
     ========================================================== */
  rancang: {
    kicker: 'Tahap 5 · Pengolahan Data',
    title: 'Pecah Jadi Tabel yang Rapi',
    goal: 'Memecah satu tabel datar menjadi beberapa tabel yang saling berelasi.',

    step1Title: 'Langkah 1 — Tempatkan setiap kolom',
    step1Instruction:
      'Setiap kolom harus disimpan di tabel <strong>pemilik faktanya</strong>. ' +
      'Ketuk satu kolom untuk memilih, lalu ketuk tabel tujuannya. ' +
      'Ketuk kolom yang sudah ditempatkan untuk mengembalikannya.',
    step1Hint:
      'Tanya pada dirimu: fakta ini <strong>milik siapa</strong>? ' +
      '"Kelas" itu fakta milik siswa, bukan milik peminjaman — kelas Rani tetap sama ' +
      'walau ia tidak meminjam apa pun. Sebaliknya "lama_pinjam" hanya ada ketika ada peminjaman.',
    keyboardHint:
      'Dengan keyboard: Tab untuk berpindah, Enter atau Spasi untuk memilih. ' +
      'Saat sebuah kolom terpilih, tekan angka 1, 2, atau 3 untuk langsung menempatkannya.',

    tables: [
      { id: 't_siswa', name: 'siswa', colorKey: 'blue', desc: 'Data orang yang meminjam', pk: 'c_nis' },
      { id: 't_alat', name: 'alat', colorKey: 'green', desc: 'Data barang yang dipinjam', pk: 'c_kode' },
      { id: 't_pinjam', name: 'peminjaman', colorKey: 'orange', desc: 'Data kejadian peminjaman', pk: 'c_idpinjam' }
    ],

    columns: [
      { id: 'c_nis', label: 'nis', tableId: 't_siswa', why: 'Nomor induk siswa — fakta milik siswa, dan unik untuk tiap orang.' },
      { id: 'c_nama', label: 'nama_siswa', tableId: 't_siswa', why: 'Nama menempel pada orangnya, bukan pada transaksinya.' },
      { id: 'c_kelas', label: 'kelas', tableId: 't_siswa', why: 'Kelas adalah fakta milik siswa. Inilah yang tadi ditulis berulang-ulang.' },
      { id: 'c_hp', label: 'no_hp', tableId: 't_siswa', why: 'Nomor HP milik siswa. Disimpan sekali di sini, tidak akan pernah beda-beda lagi.' },
      { id: 'c_kode', label: 'kode_alat', tableId: 't_alat', why: 'Kode alat — fakta milik alat, dan unik untuk tiap barang.' },
      { id: 'c_namaalat', label: 'nama_alat', tableId: 't_alat', why: 'Nama alat menempel pada barangnya.' },
      { id: 'c_spek', label: 'spesifikasi', tableId: 't_alat', why: 'Spesifikasi adalah fakta milik alat. Cukup ditulis sekali.' },
      { id: 'c_idpinjam', label: 'id_pinjam', tableId: 't_pinjam', why: 'Penanda unik tiap kejadian peminjaman — sesuatu yang belum ada di tabel lama.' },
      { id: 'c_tanggal', label: 'tanggal', tableId: 't_pinjam', why: 'Tanggal hanya bermakna jika ada peminjaman. Ini fakta milik transaksi.' },
      { id: 'c_lama', label: 'lama_pinjam', tableId: 't_pinjam', why: 'Lama pinjam berbeda tiap transaksi, jadi ia milik transaksi.' }
    ],

    poolLabel: 'Kolom yang belum ditempatkan',
    poolEmpty: 'Semua kolom sudah ditempatkan ✓',
    cekKolomLabel: 'Periksa penempatan',
    salahKolom: 'Masih ada kolom yang belum tepat. Kolom bertanda ✗ perlu kamu pindahkan.',
    benarKolom: 'Tepat! Satu fakta kini hanya disimpan di satu tempat.',

    step2Title: 'Langkah 2 — Tentukan primary key',
    step2Instruction:
      'Setiap tabel butuh satu field penanda yang <strong>nilainya tidak pernah kembar</strong>. Pilih satu untuk tiap tabel.',
    pkPlaceholder: '— pilih primary key —',

    step3Title: 'Langkah 3 — Hubungkan dengan foreign key',
    step3Instruction:
      'Tabel <code>peminjaman</code> perlu tahu <em>siapa</em> meminjam <em>apa</em>. ' +
      'Pilih field yang harus ditambahkan ke <code>peminjaman</code> sebagai foreign key.',
    fkOptions: [
      { id: 'fk_nis', label: 'nis', correct: true, why: 'Benar. Cukup NIS-nya, bukan nama dan kelasnya. Dari NIS, data siswa selengkapnya bisa ditelusuri.' },
      { id: 'fk_kode', label: 'kode_alat', correct: true, why: 'Benar. Cukup kode alatnya. Nama dan spesifikasi tidak perlu ikut disalin lagi.' },
      { id: 'fk_nama', label: 'nama_siswa', correct: false, why: 'Tidak perlu. Menyalin nama ke tabel peminjaman berarti mengulang fakta lagi — persis masalah yang tadi kita buang. Lagi pula nama bisa kembar.' },
      { id: 'fk_kelas', label: 'kelas', correct: false, why: 'Tidak perlu. Kelas sudah tersimpan di tabel siswa dan bisa ditelusuri lewat nis.' },
      { id: 'fk_spek', label: 'spesifikasi', correct: false, why: 'Tidak perlu. Spesifikasi sudah tersimpan di tabel alat dan bisa ditelusuri lewat kode_alat.' },
      { id: 'fk_hp', label: 'no_hp', correct: false, why: 'Tidak perlu — dan justru inilah yang membuat nomor Dewi jadi beda-beda. Cukup simpan di tabel siswa.' }
    ],
    cekKunciLabel: 'Periksa kunci',
    salahKunci: 'Belum tepat. Periksa lagi penjelasan di bawah tiap pilihan.',
    benarKunci: 'Rancanganmu sudah utuh — tiga tabel yang saling terhubung.',
    lanjutLabel: 'Lanjut: uji rancanganmu →'
  },

  /* ==========================================================
     TAHAP 6 — Verifikasi
     ========================================================== */
  uji: {
    kicker: 'Tahap 6 · Verifikasi',
    title: 'Uji: Rancanganmu vs Catatan Lama',
    goal: 'Membuktikan sendiri akibat struktur data terhadap perangkat lunak yang dibangun di atasnya.',
    instruction:
      'Tiga permintaan nyata datang ke Pak Yusuf. Untuk setiap permintaan, ' +
      '<strong>tebak dulu</strong> apa yang terjadi, baru hasilnya dibuka. Menebak dulu membuat temuannya menempel.',
    prediksiLabel: 'Tebakanmu:',
    bukaLabel: 'Buka hasilnya',
    flatLabel: 'Catatan lama (1 tabel datar)',
    rancanganLabel: 'Rancanganmu (3 tabel berelasi)',

    cases: [
      {
        id: 'u_update', icon: '✏️',
        title: 'Permintaan 1 — Dewi ganti nomor HP',
        scenario:
          'Dewi Lestari melapor bahwa nomor HP-nya berganti. Nomor barunya harus dipakai mulai sekarang.',
        options: [
          { id: 'o_u1', label: 'Cukup ubah satu tempat saja.' },
          { id: 'o_u2', label: 'Harus mengubah setiap baris yang memuat nama Dewi.' },
          { id: 'o_u3', label: 'Tidak bisa diubah sama sekali.' },
          { id: 'o_u4', label: 'Nomor lama otomatis terhapus sendiri.' }
        ],
        correct: 'o_u2',
        flat: {
          verdict: 'buruk',
          text:
            'Harus menyisir <strong>seluruh baris</strong> yang memuat Dewi — di tabel contoh ada 2 baris, ' +
            'di file asli bisa ratusan. Satu baris terlewat, datanya langsung tidak konsisten. ' +
            'Persis itulah yang sudah terjadi: <code>0895-7788-9900</code> di baris 4, <code>0895-7788-990</code> di baris 8.'
        },
        rancangan: {
          verdict: 'baik',
          text:
            'Ubah <strong>satu baris</strong> di tabel <code>siswa</code>, selesai. ' +
            'Tabel <code>peminjaman</code> hanya menyimpan <code>nis</code>, jadi seluruh riwayat ' +
            'peminjaman Dewi otomatis menunjuk ke nomor yang baru.'
        },
        konsep: 'Anomali pembaruan (update anomaly)'
      },
      {
        id: 'u_insert', icon: '📦',
        title: 'Permintaan 2 — Lab membeli alat baru',
        scenario:
          'Lab baru saja membeli 5 unit Arduino Uno (kode ALT-12). Barangnya sudah datang, tetapi belum ada satu pun siswa yang meminjamnya. Data alat ini harus tercatat sekarang.',
        options: [
          { id: 'o_i1', label: 'Bisa dicatat langsung sebagai data alat.' },
          { id: 'o_i2', label: 'Tidak bisa dicatat sampai ada yang meminjamnya.' },
          { id: 'o_i3', label: 'Harus menghapus alat lain dulu.' },
          { id: 'o_i4', label: 'Cukup ditulis di kolom spesifikasi alat lain.' }
        ],
        correct: 'o_i2',
        flat: {
          verdict: 'buruk',
          text:
            'Satu baris hanya lahir kalau ada peminjaman. Alat yang belum pernah dipinjam ' +
            '<strong>tidak punya tempat</strong>. Pak Yusuf terpaksa membuat baris transaksi palsu ' +
            '(peminjam kosong, tanggal karangan) — dan data palsu itu akan ikut terhitung di laporan.'
        },
        rancangan: {
          verdict: 'baik',
          text:
            'Tambah <strong>satu baris</strong> di tabel <code>alat</code>. ' +
            'Tabel <code>alat</code> berdiri sendiri, jadi keberadaan alat tidak bergantung ' +
            'pada ada atau tidaknya peminjaman.'
        },
        konsep: 'Anomali penyisipan (insert anomaly)'
      },
      {
        id: 'u_delete', icon: '🗑️',
        title: 'Permintaan 3 — Satu transaksi dibatalkan',
        scenario:
          'Peminjaman Kamera DSLR (ALT-09) oleh Aldi pada 09/09/2025 ternyata batal dan harus dihapus dari catatan. Perhatikan: itu satu-satunya baris yang memuat ALT-09.',
        options: [
          { id: 'o_d1', label: 'Hanya transaksinya yang hilang, data kamera tetap ada.' },
          { id: 'o_d2', label: 'Data Kamera DSLR ikut hilang dari catatan.' },
          { id: 'o_d3', label: 'Seluruh data Aldi ikut terhapus.' },
          { id: 'o_d4', label: 'Barisnya tidak bisa dihapus.' }
        ],
        correct: 'o_d2',
        flat: {
          verdict: 'buruk',
          text:
            'Menghapus baris itu berarti menghapus <strong>satu-satunya</strong> tempat ' +
            'nama dan spesifikasi Kamera DSLR pernah ditulis. Lab masih memiliki kameranya, ' +
            'tetapi sistem sudah lupa bahwa kamera itu ada.'
        },
        rancangan: {
          verdict: 'baik',
          text:
            'Hapus satu baris di tabel <code>peminjaman</code> saja. ' +
            'Data Kamera DSLR tetap aman di tabel <code>alat</code>, karena ia tidak pernah ' +
            'bergantung pada transaksi mana pun.'
        },
        konsep: 'Anomali penghapusan (delete anomaly)'
      }
    ],

    benarPrediksi: 'Tebakanmu tepat!',
    salahPrediksi: 'Tebakanmu belum tepat — dan itu wajar. Baca perbandingannya.',
    penutup:
      'Ketiga permintaan tadi <strong>tidak bisa diperbaiki dengan menulis kode yang lebih baik</strong>. ' +
      'Aplikasi secanggih apa pun yang dibangun di atas tabel datar itu akan mewarisi masalah yang sama. ' +
      'Yang menentukan adalah <strong>struktur datanya</strong> — dan itu dirancang sebelum satu baris kode ditulis.',
    lanjutLabel: 'Lanjut: simpulkan →'
  },

  /* ==========================================================
     TAHAP 7 — Generalisasi
     ========================================================== */
  simpulan: {
    kicker: 'Tahap 7 · Generalisasi',
    title: 'Tarik Kesimpulannya',
    goal: 'Merumuskan konsep yang kamu temukan agar berlaku untuk kasus lain, bukan hanya SiPinjam.',
    instruction: 'Jawab soal-soal berikut untuk menguji konsep yang sudah kamu temukan.',

    questions: [
      {
        id: 'q1',
        prompt: 'Sebuah baris pada tabel <code>alat</code> berisi data lengkap tentang satu buah alat. Baris itu disebut…',
        options: [
          { id: 'q1a', label: 'Record' },
          { id: 'q1b', label: 'Field' },
          { id: 'q1c', label: 'Entitas' },
          { id: 'q1d', label: 'Primary key' }
        ],
        correct: 'q1a',
        explanation: 'Record (baris) memuat data satu wujud entitas. Field adalah kolomnya, entitas adalah hal yang diwakilinya.'
      },
      {
        id: 'q2',
        prompt: 'Field <code>nis</code> pada tabel <code>peminjaman</code> menunjuk ke tabel <code>siswa</code>. Field seperti itu disebut…',
        options: [
          { id: 'q2a', label: 'Foreign key' },
          { id: 'q2b', label: 'Primary key' },
          { id: 'q2c', label: 'Record' },
          { id: 'q2d', label: 'Entitas' }
        ],
        correct: 'q2a',
        explanation: 'Foreign key menyimpan primary key milik tabel lain, dan itulah yang membuat kedua tabel berelasi.'
      },
      {
        id: 'q3',
        prompt: 'Mengapa <code>nama_siswa</code> tidak cocok dijadikan primary key tabel <code>siswa</code>?',
        options: [
          { id: 'q3a', label: 'Karena nama bisa kembar, sehingga tidak menjamin keunikan baris.' },
          { id: 'q3b', label: 'Karena nama terlalu panjang untuk disimpan.' },
          { id: 'q3c', label: 'Karena nama bukan berupa angka.' },
          { id: 'q3d', label: 'Karena nama tidak boleh disimpan di basis data.' }
        ],
        correct: 'q3a',
        explanation: 'Syarat primary key adalah unik dan tidak berubah-ubah. Dua siswa bisa bernama sama, jadi nama gagal memenuhi syarat itu. NIS memenuhinya.'
      },
      {
        id: 'q4',
        prompt: 'Sebuah tim membangun aplikasi kasir. Semua data (pembeli, barang, transaksi) dijadikan satu tabel datar. Apa akibat yang paling mungkin terjadi?',
        options: [
          { id: 'q4a', label: 'Data yang sama ditulis berulang, lalu mulai berbeda-beda isinya.' },
          { id: 'q4b', label: 'Aplikasi menjadi lebih cepat karena hanya satu tabel.' },
          { id: 'q4c', label: 'Aplikasi tidak bisa dijalankan sama sekali.' },
          { id: 'q4d', label: 'Basis datanya otomatis memperbaiki dirinya sendiri.' }
        ],
        correct: 'q4a',
        explanation: 'Masalahnya berulang di kasus mana pun: redundansi menimbulkan anomali pembaruan, penyisipan, dan penghapusan — persis seperti di SiPinjam.'
      },
      {
        id: 'q5',
        prompt: 'Kapan sebaiknya struktur tabel dirancang dalam sebuah proyek perangkat lunak?',
        options: [
          { id: 'q5a', label: 'Sejak awal, sebelum kode aplikasinya dibangun di atasnya.' },
          { id: 'q5b', label: 'Setelah aplikasinya selesai dan dipakai pengguna.' },
          { id: 'q5c', label: 'Hanya jika datanya sudah melebihi seribu baris.' },
          { id: 'q5d', label: 'Tidak perlu dirancang, cukup mengikuti kebutuhan sambil jalan.' }
        ],
        correct: 'q5a',
        explanation: 'Struktur data adalah fondasi. Mengubahnya setelah aplikasi berjalan berarti membongkar kode, memindahkan data lama, dan menanggung risiko kehilangan data.'
      },
      {
        id: 'q6',
        prompt: 'Apa inti manfaat memecah satu tabel datar menjadi beberapa tabel yang berelasi?',
        options: [
          { id: 'q6a', label: 'Setiap fakta cukup disimpan di satu tempat, sehingga tetap konsisten.' },
          { id: 'q6b', label: 'Jumlah seluruh baris data menjadi lebih sedikit.' },
          { id: 'q6c', label: 'Nama kolomnya menjadi lebih pendek.' },
          { id: 'q6d', label: 'Data tidak perlu lagi disimpan di penyimpanan apa pun.' }
        ],
        correct: 'q6a',
        explanation: 'Satu fakta, satu tempat. Dari situlah konsistensi, kemudahan perubahan, dan kemudahan pengembangan datang.'
      }
    ],

    cekLabel: 'Periksa jawaban',
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt:
      'Tulis satu kalimat: mengapa perancangan struktur data penting dalam pengembangan perangkat lunak?',
    kesimpulanPlaceholder: 'Perancangan struktur data penting karena…',
    kesimpulanMin: 30,
    kesimpulanKurang: 'Lengkapi dulu kesimpulanmu menjadi satu kalimat utuh.',
    lanjutLabel: 'Lanjut: refleksi →'
  },

  /* ==========================================================
     TAHAP 8 — Refleksi
     ========================================================== */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    title: 'Menilai Diri Sendiri',
    goal: 'Menyadari sejauh mana pemahamanmu berubah dan apa yang masih perlu diperdalam.',
    note:
      'Jawabanmu hanya tersimpan di perangkat ini dan tidak dikirim ke mana pun. ' +
      'Jawab sejujurnya — ini untukmu sendiri.',

    recallLabel: 'Tebakanmu di tahap Verifikasi',
    recallKosong: 'Kamu belum sempat menebak di tahap Verifikasi.',

    skalaLabel: 'Seberapa yakin kamu sekarang?',
    /* Skala Likert bersifat berurutan (ordinal) — urutannya TIDAK diacak,
       karena mengacak 1..5 merusak maknanya. Yang diacak adalah urutan
       pernyataannya. */
    skala: [
      { id: 'sk1', value: 1, label: 'Belum paham' },
      { id: 'sk2', value: 2, label: 'Sedikit paham' },
      { id: 'sk3', value: 3, label: 'Cukup paham' },
      { id: 'sk4', value: 4, label: 'Paham' },
      { id: 'sk5', value: 5, label: 'Paham & bisa menjelaskan' }
    ],
    skalaItems: [
      { id: 'li_istilah', text: 'Saya dapat membedakan entitas, tabel, record, dan field.' },
      { id: 'li_kunci', text: 'Saya dapat menjelaskan beda primary key dan foreign key.' },
      { id: 'li_pecah', text: 'Saya dapat memecah satu tabel datar menjadi tabel-tabel yang berelasi.' },
      { id: 'li_penting', text: 'Saya dapat menjelaskan mengapa perancangan struktur data itu penting.' }
    ],

    prompts: [
      {
        id: 'rf1',
        question: 'Bagian mana yang paling mengubah caramu memandang data? Mengapa?',
        placeholder: 'Yang paling mengubah cara pandang saya adalah…'
      },
      {
        id: 'rf2',
        question: 'Adakah yang masih membingungkan? Tulis pertanyaan yang ingin kamu tanyakan.',
        placeholder: 'Saya masih bingung tentang…'
      },
      {
        id: 'rf3',
        question: 'Di proyek atau aplikasi apa kamu akan memakai cara berpikir ini?',
        placeholder: 'Saya akan memakainya saat…'
      }
    ],

    simpanLabel: 'Simpan refleksi',
    tersimpan: 'Refleksi tersimpan.',
    lanjutLabel: 'Selesai →'
  },

  /* ==========================================================
     TAHAP 9 — Selesai
     ========================================================== */
  selesai: {
    kicker: 'Tahap 9 · Selesai',
    title: 'Kamu Sudah Sampai di Ujung',
    skorLabel: 'Ringkasan hasil',
    rancanganLabel: 'Rancangan struktur data buatanmu',
    kesimpulanLabel: 'Kesimpulan yang kamu tulis',

    konsepKunci: [
      'Satu <strong>entitas</strong> disimpan di satu <strong>tabel</strong>. Satu <strong>record</strong> adalah satu barisnya, satu <strong>field</strong> adalah satu kolomnya.',
      '<strong>Primary key</strong> membuat setiap baris dapat dibedakan; <strong>foreign key</strong> menghubungkan sebuah baris ke baris di tabel lain.',
      'Prinsip utamanya: <strong>satu fakta cukup disimpan di satu tempat</strong>.',
      'Menyimpan fakta berulang memunculkan tiga anomali: <strong>pembaruan</strong>, <strong>penyisipan</strong>, dan <strong>penghapusan</strong>.',
      'Struktur data adalah <strong>fondasi</strong> perangkat lunak. Kode yang baik tidak dapat menyelamatkan struktur data yang keliru.'
    ],

    lanjutLabel: 'Langkah berikutnya',
    lanjut: [
      'Materi 1.2 — menganalisis entitas dan atribut dari kebutuhan pengguna.',
      'Coba terapkan: ambil satu aplikasi yang kamu pakai sehari-hari, tebak entitas apa saja yang ada di baliknya.'
    ],

    ulangLabel: '↩ Ulangi dari awal',
    berandaLabel: 'Kembali ke beranda',
    ulangKonfirmasi:
      'Ulangi materi dari awal? Seluruh jawaban dan progresmu akan dihapus, dan pilihan jawaban akan diacak ulang.'
  }
};

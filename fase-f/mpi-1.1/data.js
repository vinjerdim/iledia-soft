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
    title: 'Konsep Dasar Basis Data & Peran Analisis Kebutuhan Sistem',
    subject: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Discovery Learning',
    goal:
      'Menjelaskan konsep dasar basis data dan peran analisis kebutuhan sistem ' +
      'dalam perancangan basis data.'
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
      '<strong>menemukan sendiri</strong> konsep dasar basis data dari sebuah masalah nyata ' +
      'di Koperasi Siswa — lalu membuktikan sendiri mengapa <strong>menggali kebutuhan pengguna ' +
      'lebih dulu</strong> (analisis kebutuhan sistem) menentukan baik atau buruknya rancangan basis data.',
    tujuanLabel: 'Setelah menyelesaikan media ini kamu dapat:',
    tujuan: [
      'Membedakan data yang tersimpan rapi dan data yang tersimpan berantakan.',
      'Mengidentifikasi istilah dasar basis data: entitas, tabel, record, field, primary key, dan foreign key.',
      'Menjelaskan apa itu analisis kebutuhan sistem dan mengapa dilakukan sebelum basis data dirancang.',
      'Menunjukkan bagaimana temuan analisis kebutuhan (hasil wawancara/pengamatan pengguna) menentukan entitas, atribut, dan relasi pada rancangan basis data.',
      'Menjelaskan akibat buruk struktur data yang tidak dirancang terhadap perangkat lunak yang dibangun di atasnya.'
    ],
    alurLabel: 'Alur belajar (9 tahap)',
    alur: [
      { id: 'a1', title: 'Stimulasi', desc: 'Menemukan kejanggalan dan kebutuhan yang belum tergali pada catatan Koperasi Siswa.' },
      { id: 'a2', title: 'Rumusan Masalah', desc: 'Menetapkan masalah struktur data sekaligus masalah kebutuhan yang belum digali.' },
      { id: 'a3', title: 'Pengumpulan Data', desc: 'Mengumpulkan konsep dasar basis data dan konsep analisis kebutuhan sistem.' },
      { id: 'a4', title: 'Pengolahan Data', desc: 'Membaca temuan analisis kebutuhan, lalu merancang struktur tabel berdasarkan temuan itu.' },
      { id: 'a5', title: 'Verifikasi', desc: 'Menguji rancanganmu melawan catatan lama dan kasus-kasus nyata.' },
      { id: 'a6', title: 'Generalisasi', desc: 'Menyimpulkan konsep dasar basis data dan peran analisis kebutuhan sistem.' },
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
    title: 'Catatan Koperasi yang Bikin Pusing',
    goal: 'Menemukan kejanggalan pada cara data koperasi dicatat, sekaligus kebutuhan yang selama ini luput digali.',
    cerita:
      '<p>Bu Sari, pengurus Koperasi Siswa, mencatat semua penjualan barang di ' +
      '<strong>satu file spreadsheet datar</strong> bernama <em>CatatanKoperasi</em>. Satu baris = satu transaksi. ' +
      'Sudah berjalan satu semester dan isinya sudah ratusan baris.</p>' +
      '<p>Minggu lalu Bu Sari mengeluh:</p>',
    keluhan:
      '"Nomor HP Dewi beda-beda saya tulisnya, jadi saya sendiri bingung yang benar yang mana. ' +
      'Terus kemarin stok tinta printer ternyata sudah habis dari beberapa hari lalu — saya baru tahu ' +
      'pas ada yang mau beli. Habis, dari awal memang tidak kepikiran perlu ada catatan stok."',
    instruction:
      'Amati tabel di bawah. <strong>Ketuk sel yang menurutmu janggal</strong> — ' +
      'sel yang isinya sekadar mengulang fakta yang sudah ditulis di baris sebelumnya, ' +
      'atau yang isinya tidak konsisten.',
    minTemuan: 6,
    hintLabel: '💡 Belum ketemu? Buka petunjuk',
    hint:
      'Bandingkan baris-baris yang <strong>anggotanya sama</strong>, lalu baris-baris yang ' +
      '<strong>barangnya sama</strong>. Fakta mana yang ditulis berulang-ulang? ' +
      'Perhatikan juga apakah fakta yang berulang itu selalu ditulis dengan cara yang sama.',

    columns: [
      { id: 'tanggal', label: 'tanggal' },
      { id: 'nama_anggota', label: 'nama_anggota' },
      { id: 'kelas', label: 'kelas' },
      { id: 'no_hp', label: 'no_hp' },
      { id: 'kode_barang', label: 'kode_barang' },
      { id: 'nama_barang', label: 'nama_barang' },
      { id: 'kategori', label: 'kategori' },
      { id: 'jumlah', label: 'jumlah' }
    ],

    rows: [
      { id: 'r1', cells: ['02/09/2025', 'Rani Alfiah', 'XI RPL 1', '0812-3344-5566', 'BRG-01', 'Buku Tulis 38 Lembar', 'Alat Tulis', '2'] },
      { id: 'r2', cells: ['02/09/2025', 'Bima Saputra', 'XI RPL 2', '0857-1122-3344', 'BRG-04', 'Pulpen Standar', 'Alat Tulis', '3'] },
      { id: 'r3', cells: ['04/09/2025', 'Rani Alfiah', 'XI RPL 1', '0812-3344-5566', 'BRG-04', 'Pulpen Standar', 'Alat Tulis', '1'] },
      { id: 'r4', cells: ['05/09/2025', 'Dewi Lestari', 'XI RPL 1', '0895-7788-9900', 'BRG-01', 'Buku Tulis 38 Lembar', 'Alat Tulis', '4'] },
      { id: 'r5', cells: ['08/09/2025', 'Bima Saputra', 'XI RPL 2', '0857-1122-3344', 'BRG-07', 'Map Plastik', 'Perlengkapan', '2'] },
      { id: 'r6', cells: ['09/09/2025', 'Aldi Pratama', 'XI RPL 2', '0813-2211-4455', 'BRG-09', 'Snack Kemasan', 'Makanan Ringan', '5'] },
      { id: 'r7', cells: ['11/09/2025', 'Aldi Pratama', 'XI RPL 2', '0813-2211-4455', 'BRG-04', 'Pulpen Standar', 'alat tulis', '2'] },
      { id: 'r8', cells: ['12/09/2025', 'Dewi Lestari', 'XI RPL 1', '0895-7788-990', 'BRG-07', 'Map Plastik', 'Perlengkapan', '1'] }
    ],

    /* Sel bermasalah, dikunci "barisId:kolomId".
       kind: 'ulang' (fakta diulang) | 'beda' (fakta tidak konsisten) */
    problemCells: {
      'r3:kelas': { kind: 'ulang', why: 'Kelas Rani sudah ditulis di baris 1. Ditulis ulang setiap kali Rani berbelanja.' },
      'r3:no_hp': { kind: 'ulang', why: 'Nomor HP Rani sudah ada di baris 1. Fakta yang sama ditulis dua kali.' },
      'r3:nama_barang': { kind: 'ulang', why: 'Nama barang BRG-04 sudah ditulis di baris 2.' },
      'r3:kategori': { kind: 'ulang', why: 'Kategori BRG-04 sudah ditulis di baris 2.' },
      'r4:nama_barang': { kind: 'ulang', why: 'Nama barang BRG-01 sudah ditulis di baris 1.' },
      'r4:kategori': { kind: 'ulang', why: 'Kategori BRG-01 sudah ditulis di baris 1.' },
      'r5:kelas': { kind: 'ulang', why: 'Kelas Bima sudah ditulis di baris 2.' },
      'r5:no_hp': { kind: 'ulang', why: 'Nomor HP Bima sudah ditulis di baris 2.' },
      'r7:kelas': { kind: 'ulang', why: 'Kelas Aldi sudah ditulis di baris 6.' },
      'r7:no_hp': { kind: 'ulang', why: 'Nomor HP Aldi sudah ditulis di baris 6.' },
      'r7:nama_barang': { kind: 'ulang', why: 'Nama barang BRG-04 sudah ditulis dua kali sebelumnya.' },
      'r7:kategori': { kind: 'beda', why: 'Temuan penting! Kategori BRG-04 ditulis "Alat Tulis" di baris 2 dan 3, tetapi "alat tulis" di sini. Fakta yang diulang mulai berbeda-beda.' },
      'r8:kelas': { kind: 'ulang', why: 'Kelas Dewi sudah ditulis di baris 4.' },
      'r8:no_hp': { kind: 'beda', why: 'Inilah yang dikeluhkan Bu Sari. Nomor Dewi di baris 4 adalah 0895-7788-9900, di sini 0895-7788-990 — kurang satu angka. Mana yang benar?' },
      'r8:nama_barang': { kind: 'ulang', why: 'Nama barang BRG-07 sudah ditulis di baris 5.' },
      'r8:kategori': { kind: 'ulang', why: 'Kategori BRG-07 sudah ditulis di baris 5.' }
    },

    /* Umpan balik saat murid menandai sel yang sebenarnya wajar. */
    okCells: {
      tanggal: 'Tanggal berbeda di tiap transaksi — ini memang fakta milik transaksi itu sendiri.',
      jumlah: 'Jumlah barang yang dibeli berbeda di tiap transaksi — ini fakta milik transaksi itu sendiri.',
      nama_anggota: 'Nama anggota memang berulang, tapi kolom inilah yang nanti menjadi penghubung antar tabel. Yang bermasalah adalah fakta yang MENGIKUTI anggota: kelas dan no_hp.',
      kode_barang: 'Kode barang memang berulang, tapi kolom inilah penghubung ke data barang. Yang bermasalah adalah fakta yang MENGIKUTI barang: nama_barang dan kategori.'
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
    goal: 'Merumuskan masalah yang sesungguhnya — baik dari sisi struktur data maupun dari sisi kebutuhan yang belum digali.',
    instruction:
      'Dari temuanmu di tahap sebelumnya dan keluhan Bu Sari, <strong>pilih semua pernyataan yang benar</strong> ' +
      'tentang catatan <em>CatatanKoperasi</em>. Ada lebih dari satu jawaban benar.',

    statements: [
      {
        id: 's1', valid: true,
        text: 'Fakta tentang satu anggota (kelas, no HP) ditulis berulang di banyak baris.',
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
        text: 'Data barang baru tidak bisa dicatat sebelum ada yang membelinya.',
        feedback: 'Benar. Ini <strong>anomali penyisipan</strong> — satu baris hanya lahir kalau ada transaksi.'
      },
      {
        id: 's5', valid: true,
        text: 'Menghapus satu transaksi bisa ikut menghapus satu-satunya catatan tentang sebuah barang.',
        feedback: 'Benar. Ini <strong>anomali penghapusan</strong> — data ikut hilang tanpa sengaja.'
      },
      {
        id: 's6', valid: true,
        text: 'Catatan ini tidak pernah dirancang berdasarkan kebutuhan nyata Bu Sari, sehingga hal sepenting info stok hampir habis luput sama sekali.',
        feedback: 'Benar. Inilah akibat tidak adanya <strong>analisis kebutuhan sistem</strong> sebelum catatan ini dibuat — kebutuhan pengguna yang sebenarnya tidak pernah digali lebih dulu.'
      },
      {
        id: 's7', valid: true,
        text: 'Sebelum tabelnya dirancang, seharusnya digali dulu apa saja yang benar-benar dibutuhkan Bu Sari dan anggota dari sistem ini.',
        feedback: 'Benar — inilah peran <strong>analisis kebutuhan sistem</strong>: menemukan kebutuhan nyata pengguna sebelum struktur datanya ditentukan.'
      },
      {
        id: 's8', valid: false,
        text: 'Masalahnya karena Bu Sari kurang teliti saat mencatat.',
        feedback: 'Belum tepat. Ketelitian membantu, tetapi ketidakkonsistenan muncul karena <strong>strukturnya</strong> memaksa fakta yang sama ditulis berulang. Siapa pun akan keliru cepat atau lambat.'
      },
      {
        id: 's9', valid: false,
        text: 'Masalahnya karena jumlah barisnya sudah terlalu banyak.',
        feedback: 'Belum tepat. Jumlah baris memperbesar akibatnya, tetapi struktur yang sama tetap bermasalah walau hanya 8 baris — seperti yang kamu lihat tadi.'
      },
      {
        id: 's10', valid: false,
        text: 'Masalahnya akan hilang jika filenya dipindah ke aplikasi spreadsheet yang lebih canggih.',
        feedback: 'Belum tepat. Mengganti alat bantu tidak mengubah <strong>cara data disusun</strong>. Masalahnya ada pada strukturnya, bukan pada perangkat lunaknya.'
      },
      {
        id: 's11', valid: false,
        text: 'Masalahnya karena setiap transaksi ditulis pada baris yang terpisah.',
        feedback: 'Belum tepat. Satu baris per transaksi justru sudah benar. Yang keliru adalah ikut menempelkan fakta anggota dan fakta barang pada baris transaksi itu.'
      },
      {
        id: 's12', valid: false,
        text: 'Analisis kebutuhan hanya perlu dilakukan kalau sistemnya sudah lama dipakai dan mulai bermasalah.',
        feedback: 'Belum tepat. Analisis kebutuhan sebaiknya dilakukan <strong>sebelum</strong> sistem dibangun, supaya rancangannya sudah sesuai kebutuhan sejak awal — bukan tambal sulam setelah masalah muncul.'
      }
    ],

    cekLabel: 'Periksa pilihanku',
    ownLabel: 'Sekarang tulis dengan kalimatmu sendiri',
    ownPrompt:
      'Menurutmu, apa masalah utama sistem pencatatan Koperasi Siswa ini — dari sisi struktur data maupun dari sisi kebutuhan yang belum digali?',
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
    goal: 'Mengumpulkan konsep dasar basis data dan konsep analisis kebutuhan sistem yang dibutuhkan untuk merancang ulang.',
    instruction:
      'Masalahnya sudah jelas. Sebelum memperbaiki, kamu butuh kosakatanya. ' +
      '<strong>Ketuk setiap kartu</strong> untuk membukanya.',

    cards: [
      {
        id: 'k_entitas', term: 'Entitas', icon: '🧩',
        def: 'Sesuatu yang nyata dan berdiri sendiri, yang kita ingin simpan datanya.',
        example: 'Pada CatatanKoperasi ada tiga: <strong>Anggota</strong>, <strong>Barang</strong>, dan <strong>Transaksi</strong>.'
      },
      {
        id: 'k_tabel', term: 'Tabel (Relasi)', icon: '🗂️',
        def: 'Tempat menyimpan data satu entitas. Satu entitas → satu tabel.',
        example: 'Entitas Anggota disimpan di tabel <code>anggota</code>, bukan dicampur ke baris transaksi.'
      },
      {
        id: 'k_record', term: 'Record (Baris)', icon: '➡️',
        def: 'Satu baris pada tabel, berisi data lengkap tentang <em>satu</em> wujud entitas.',
        example: 'Satu baris di tabel <code>anggota</code> = satu orang anggota, ditulis <strong>sekali saja</strong>.'
      },
      {
        id: 'k_field', term: 'Field (Kolom / Atribut)', icon: '⬇️',
        def: 'Satu kolom pada tabel, yaitu satu jenis fakta yang dimiliki entitas itu.',
        example: '<code>nama_anggota</code>, <code>kelas</code>, dan <code>no_hp</code> adalah field milik entitas Anggota.'
      },
      {
        id: 'k_pk', term: 'Primary Key', icon: '🔑',
        def: 'Satu field yang nilainya <strong>unik</strong> untuk setiap baris, dipakai sebagai penanda resmi baris itu.',
        example: '<code>nomor_anggota</code> pada tabel <code>anggota</code>. Dua anggota boleh sama nama, tetapi nomor anggotanya tidak pernah sama.'
      },
      {
        id: 'k_fk', term: 'Foreign Key', icon: '🔗',
        def: 'Field yang menyimpan primary key milik tabel lain, sehingga kedua tabel terhubung.',
        example: '<code>nomor_anggota</code> di tabel <code>transaksi</code> menunjuk ke <code>nomor_anggota</code> di tabel <code>anggota</code> — cukup nomornya, bukan seluruh datanya.'
      },
      {
        id: 'k_analisis', term: 'Analisis Kebutuhan Sistem', icon: '🔍',
        def: 'Proses menggali apa saja yang benar-benar dibutuhkan pengguna dari sebuah sistem — misalnya lewat wawancara atau pengamatan — <strong>sebelum</strong> struktur basis datanya dirancang.',
        example: 'Dari mengobrol dengan Bu Sari, tergali kebutuhan "harus tahu barang yang stoknya hampir habis" — temuan inilah yang nanti menentukan atribut apa saja yang harus ada di tabel barang.'
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
      { id: 'm_fk', label: 'Foreign Key' },
      { id: 'm_analisis', label: 'Analisis Kebutuhan Sistem' }
    ],
    matchDefs: [
      { id: 'd_entitas', label: 'Sesuatu yang datanya ingin kita simpan' },
      { id: 'd_tabel', label: 'Tempat menyimpan data satu entitas' },
      { id: 'd_record', label: 'Satu baris data tentang satu wujud entitas' },
      { id: 'd_field', label: 'Satu jenis fakta yang dimiliki entitas' },
      { id: 'd_pk', label: 'Penanda unik sebuah baris di tabelnya sendiri' },
      { id: 'd_fk', label: 'Penunjuk ke baris milik tabel lain' },
      { id: 'd_analisis', label: 'Proses menggali kebutuhan nyata pengguna sebelum basis data dirancang' }
    ],
    matchKey: {
      m_entitas: 'd_entitas',
      m_tabel: 'd_tabel',
      m_record: 'd_record',
      m_field: 'd_field',
      m_pk: 'd_pk',
      m_fk: 'd_fk',
      m_analisis: 'd_analisis'
    },
    cekLabel: 'Periksa pasangan',
    ulangLabel: 'Ulangi pasangan',
    lanjutLabel: 'Lanjut: rancang strukturnya →'
  },

  /* ==========================================================
     TAHAP 5 — Pengolahan Data (temuan analisis kebutuhan → rancang struktur)
     ========================================================== */
  rancang: {
    kicker: 'Tahap 5 · Pengolahan Data',
    title: 'Dari Temuan Kebutuhan, Menjadi Tabel yang Rapi',
    goal: 'Membaca hasil analisis kebutuhan, lalu memakainya untuk memecah satu tabel datar menjadi beberapa tabel yang saling berelasi.',

    temuanTitle: 'Temuan analisis kebutuhan',
    temuanInstruction:
      'Sebelum menempatkan kolom, baca dulu hasil wawancara singkat dan pengamatan terhadap Bu Sari ' +
      'dan anggota koperasi. Temuan inilah yang akan jadi dasar rancanganmu di bawah.',
    temuan: [
      '"Saya sering harus buka-buka catatan lama satu per satu cuma buat tahu barang mana yang stoknya mau habis. Enaknya kalau ada catatan stoknya langsung." — Bu Sari, pengurus koperasi',
      '"Saya ingin bisa lihat riwayat belanja saya sendiri di koperasi, biar tahu sudah beli apa saja." — anggota koperasi',
      '"Setiap barang itu ada kategorinya, biar gampang dicari pas mau bikin laporan bulanan." — Bu Sari',
      '"Nomor HP saya sempat salah dicatat. Untung ketahuan sebelum saya ditelepon soal pesanan yang salah." — Dewi, anggota koperasi'
    ],

    step1Title: 'Langkah 1 — Tempatkan setiap kolom',
    step1Instruction:
      'Berdasarkan temuan di atas, setiap kolom harus disimpan di tabel <strong>pemilik faktanya</strong>. ' +
      'Ketuk satu kolom untuk memilih, lalu ketuk tabel tujuannya. ' +
      'Ketuk kolom yang sudah ditempatkan untuk mengembalikannya.',
    step1Hint:
      'Tanya pada dirimu: fakta ini <strong>milik siapa</strong>? ' +
      '"Kelas" itu fakta milik anggota, bukan milik transaksi — kelas Rani tetap sama ' +
      'walau ia tidak berbelanja apa pun. Perhatikan juga: ada satu kolom yang <strong>tidak pernah ada</strong> ' +
      'di catatan lama, dan baru muncul karena kamu membaca temuan analisis kebutuhan di atas.',
    keyboardHint:
      'Dengan keyboard: Tab untuk berpindah, Enter atau Spasi untuk memilih. ' +
      'Saat sebuah kolom terpilih, tekan angka 1, 2, atau 3 untuk langsung menempatkannya.',

    tables: [
      { id: 't_anggota', name: 'anggota', colorKey: 'blue', desc: 'Data siswa yang menjadi anggota koperasi', pk: 'c_nomoranggota' },
      { id: 't_barang', name: 'barang', colorKey: 'green', desc: 'Data barang yang dijual koperasi', pk: 'c_kodebarang' },
      { id: 't_transaksi', name: 'transaksi', colorKey: 'orange', desc: 'Data kejadian pembelian barang oleh anggota', pk: 'c_idtransaksi' }
    ],

    columns: [
      { id: 'c_nomoranggota', label: 'nomor_anggota', tableId: 't_anggota', why: 'Penanda unik tiap anggota, menggantikan nama sebagai identitas resmi — nama bisa kembar, nomor anggota tidak.' },
      { id: 'c_namaanggota', label: 'nama_anggota', tableId: 't_anggota', why: 'Nama menempel pada orangnya, bukan pada transaksinya.' },
      { id: 'c_kelas', label: 'kelas', tableId: 't_anggota', why: 'Kelas adalah fakta milik anggota. Inilah yang tadi ditulis berulang-ulang.' },
      { id: 'c_hp', label: 'no_hp', tableId: 't_anggota', why: 'Nomor HP milik anggota. Disimpan sekali di sini, tidak akan pernah beda-beda lagi seperti punya Dewi.' },
      { id: 'c_kodebarang', label: 'kode_barang', tableId: 't_barang', why: 'Kode barang — fakta milik barang, dan unik untuk tiap jenis barang.' },
      { id: 'c_namabarang', label: 'nama_barang', tableId: 't_barang', why: 'Nama barang menempel pada barangnya.' },
      { id: 'c_kategori', label: 'kategori', tableId: 't_barang', why: 'Kategori adalah fakta milik barang. Ditulis sekali saja, jadi tidak akan beda-beda ("Alat Tulis" vs "alat tulis") seperti tadi.' },
      { id: 'c_stok', label: 'stok_saat_ini', tableId: 't_barang', why: 'Kolom ini TIDAK ADA di catatan lama. Ia baru muncul setelah kamu membaca temuan analisis kebutuhan Bu Sari — itulah peran analisis kebutuhan sistem: menemukan data yang harus disimpan, bukan sekadar mencatat apa yang kebetulan sudah ditulis.' },
      { id: 'c_idtransaksi', label: 'id_transaksi', tableId: 't_transaksi', why: 'Penanda unik tiap kejadian pembelian — sesuatu yang belum ada di catatan lama.' },
      { id: 'c_tanggal', label: 'tanggal', tableId: 't_transaksi', why: 'Tanggal hanya bermakna jika ada transaksi. Ini fakta milik transaksi itu sendiri.' },
      { id: 'c_jumlah', label: 'jumlah', tableId: 't_transaksi', why: 'Jumlah barang yang dibeli berbeda tiap transaksi, jadi ia milik transaksi.' }
    ],

    poolLabel: 'Kolom yang belum ditempatkan',
    poolEmpty: 'Semua kolom sudah ditempatkan ✓',
    cekKolomLabel: 'Periksa penempatan',
    salahKolom: 'Masih ada kolom yang belum tepat. Kolom bertanda ✗ perlu kamu pindahkan.',
    benarKolom: 'Tepat! Satu fakta kini hanya disimpan di satu tempat — termasuk kebutuhan baru yang tadi kamu gali dari temuan analisis kebutuhan.',

    step2Title: 'Langkah 2 — Tentukan primary key',
    step2Instruction:
      'Setiap tabel butuh satu field penanda yang <strong>nilainya tidak pernah kembar</strong>. Pilih satu untuk tiap tabel.',
    pkPlaceholder: '— pilih primary key —',

    step3Title: 'Langkah 3 — Hubungkan dengan foreign key',
    step3Instruction:
      'Tabel <code>transaksi</code> perlu tahu <em>siapa</em> membeli <em>apa</em>. ' +
      'Pilih field yang harus ditambahkan ke <code>transaksi</code> sebagai foreign key.',
    fkOptions: [
      { id: 'fk_nomoranggota', label: 'nomor_anggota', correct: true, why: 'Benar. Cukup nomor anggotanya, bukan nama dan kelasnya. Dari nomor anggota, data anggota selengkapnya bisa ditelusuri.' },
      { id: 'fk_kodebarang', label: 'kode_barang', correct: true, why: 'Benar. Cukup kode barangnya. Nama dan kategori tidak perlu ikut disalin lagi.' },
      { id: 'fk_namaanggota', label: 'nama_anggota', correct: false, why: 'Tidak perlu. Menyalin nama ke tabel transaksi berarti mengulang fakta lagi — persis masalah yang tadi kita buang. Lagi pula nama bisa kembar.' },
      { id: 'fk_kelas', label: 'kelas', correct: false, why: 'Tidak perlu. Kelas sudah tersimpan di tabel anggota dan bisa ditelusuri lewat nomor_anggota.' },
      { id: 'fk_kategori', label: 'kategori', correct: false, why: 'Tidak perlu. Kategori sudah tersimpan di tabel barang dan bisa ditelusuri lewat kode_barang.' },
      { id: 'fk_hp', label: 'no_hp', correct: false, why: 'Tidak perlu — dan justru inilah yang membuat nomor Dewi jadi beda-beda. Cukup simpan di tabel anggota.' }
    ],
    cekKunciLabel: 'Periksa kunci',
    salahKunci: 'Belum tepat. Periksa lagi penjelasan di bawah tiap pilihan.',
    benarKunci: 'Rancanganmu sudah utuh — tiga tabel yang saling terhubung, hasil dari temuan analisis kebutuhan tadi.',
    lanjutLabel: 'Lanjut: uji rancanganmu →'
  },

  /* ==========================================================
     TAHAP 6 — Verifikasi
     ========================================================== */
  uji: {
    kicker: 'Tahap 6 · Verifikasi',
    title: 'Uji: Rancanganmu vs Catatan Lama',
    goal: 'Membuktikan sendiri akibat struktur data dan akibat analisis kebutuhan yang terlewat terhadap perangkat lunak yang dibangun di atasnya.',
    instruction:
      'Empat permintaan nyata datang ke Bu Sari. Untuk setiap permintaan, ' +
      '<strong>tebak dulu</strong> apa yang terjadi, baru hasilnya dibuka. Menebak dulu membuat temuannya menempel.',
    prediksiLabel: 'Tebakanmu:',
    bukaLabel: 'Buka hasilnya',
    flatLabel: 'Tanpa rancangan yang matang',
    rancanganLabel: 'Dengan rancangan hasil analisis kebutuhan',

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
          text:
            'Harus menyisir <strong>seluruh baris</strong> yang memuat Dewi — di tabel contoh ada 2 baris, ' +
            'di file asli bisa ratusan. Satu baris terlewat, datanya langsung tidak konsisten. ' +
            'Persis itulah yang sudah terjadi: <code>0895-7788-9900</code> di baris 4, <code>0895-7788-990</code> di baris 8.'
        },
        rancangan: {
          text:
            'Ubah <strong>satu baris</strong> di tabel <code>anggota</code>, selesai. ' +
            'Tabel <code>transaksi</code> hanya menyimpan <code>nomor_anggota</code>, jadi seluruh riwayat ' +
            'transaksi Dewi otomatis menunjuk ke nomor yang baru.'
        },
        konsep: 'Anomali pembaruan (update anomaly)'
      },
      {
        id: 'u_insert', icon: '📦',
        title: 'Permintaan 2 — Koperasi menerima barang baru',
        scenario:
          'Koperasi baru saja menerima 20 pak amplop coklat (kode BRG-12). Barangnya sudah datang, tetapi belum ada satu pun anggota yang membelinya. Data barang ini harus tercatat sekarang.',
        options: [
          { id: 'o_i1', label: 'Bisa dicatat langsung sebagai data barang.' },
          { id: 'o_i2', label: 'Tidak bisa dicatat sampai ada yang membelinya.' },
          { id: 'o_i3', label: 'Harus menghapus barang lain dulu.' },
          { id: 'o_i4', label: 'Cukup ditulis di kolom kategori barang lain.' }
        ],
        correct: 'o_i2',
        flat: {
          text:
            'Satu baris hanya lahir kalau ada transaksi. Barang yang belum pernah dibeli ' +
            '<strong>tidak punya tempat</strong>. Bu Sari terpaksa membuat baris transaksi palsu ' +
            '(pembeli kosong, tanggal karangan) — dan data palsu itu akan ikut terhitung di laporan.'
        },
        rancangan: {
          text:
            'Tambah <strong>satu baris</strong> di tabel <code>barang</code>. ' +
            'Tabel <code>barang</code> berdiri sendiri, jadi keberadaan barang tidak bergantung ' +
            'pada ada atau tidaknya transaksi.'
        },
        konsep: 'Anomali penyisipan (insert anomaly)'
      },
      {
        id: 'u_delete', icon: '🗑️',
        title: 'Permintaan 3 — Satu transaksi dibatalkan',
        scenario:
          'Pembelian Snack Kemasan (BRG-09) oleh Aldi pada 09/09/2025 ternyata batal dan harus dihapus dari catatan. Perhatikan: itu satu-satunya baris yang memuat BRG-09.',
        options: [
          { id: 'o_d1', label: 'Hanya transaksinya yang hilang, data barangnya tetap ada.' },
          { id: 'o_d2', label: 'Data Snack Kemasan ikut hilang dari catatan.' },
          { id: 'o_d3', label: 'Seluruh data Aldi ikut terhapus.' },
          { id: 'o_d4', label: 'Barisnya tidak bisa dihapus.' }
        ],
        correct: 'o_d2',
        flat: {
          text:
            'Menghapus baris itu berarti menghapus <strong>satu-satunya</strong> tempat ' +
            'nama dan kategori Snack Kemasan pernah ditulis. Koperasi masih memiliki barangnya, ' +
            'tetapi sistem sudah lupa bahwa barang itu ada.'
        },
        rancangan: {
          text:
            'Hapus satu baris di tabel <code>transaksi</code> saja. ' +
            'Data Snack Kemasan tetap aman di tabel <code>barang</code>, karena ia tidak pernah ' +
            'bergantung pada transaksi mana pun.'
        },
        konsep: 'Anomali penghapusan (delete anomaly)'
      },
      {
        id: 'u_analisis', icon: '📉',
        title: 'Permintaan 4 — Sistem baru yang dibangun terburu-buru',
        scenario:
          'Sekolah lain pernah membangun sistem koperasi serupa tanpa sempat mewawancarai penggunanya lebih dulu — langsung membuat tabel dari data yang kebetulan sudah ada. Setelah dipakai, pengurus koperasinya mengeluh sistemnya tidak bisa menjawab pertanyaan "barang apa saja yang stoknya hampir habis?".',
        options: [
          { id: 'o_a1', label: 'Wajar terjadi — kebutuhan seperti ini memang mustahil diketahui sebelum sistem dibangun.' },
          { id: 'o_a2', label: 'Terjadi karena kebutuhan itu tidak pernah digali lebih dulu lewat analisis kebutuhan sistem.' },
          { id: 'o_a3', label: 'Terjadi karena database-nya kurang canggih secara teknis.' },
          { id: 'o_a4', label: 'Terjadi karena jumlah tabelnya terlalu sedikit.' }
        ],
        correct: 'o_a2',
        flat: {
          text:
            'Sistem itu dirancang langsung dari data yang kebetulan sudah tersedia, tanpa lebih dulu bertanya ' +
            '"apa yang sebenarnya dibutuhkan penggunanya?". Akibatnya kolom sepenting <code>stok_saat_ini</code> ' +
            'tidak pernah terpikirkan sampai penggunanya sendiri yang mengeluh — sama seperti Bu Sari di awal cerita ini.'
        },
        rancangan: {
          text:
            'Rancanganmu punya kolom <code>stok_saat_ini</code> justru karena kamu lebih dulu membaca ' +
            '<strong>temuan analisis kebutuhan</strong> — bukan sekadar mencatat apa yang sudah ada. ' +
            'Itulah gunanya menggali kebutuhan pengguna sebelum satu tabel pun dirancang.'
        },
        konsep: 'Analisis kebutuhan sistem yang terlewat'
      }
    ],

    benarPrediksi: 'Tebakanmu tepat!',
    salahPrediksi: 'Tebakanmu belum tepat — dan itu wajar. Baca perbandingannya.',
    penutup:
      'Baik kesalahan struktur data maupun analisis kebutuhan yang terlewat <strong>tidak bisa diperbaiki dengan ' +
      'menulis kode yang lebih baik</strong>. Aplikasi secanggih apa pun yang dibangun di atas rancangan yang ' +
      'keliru akan mewarisi masalah yang sama. Yang menentukan adalah <strong>struktur datanya dan seberapa ' +
      'dalam kebutuhan penggunanya digali</strong> — dan keduanya terjadi sebelum satu baris kode ditulis.',
    lanjutLabel: 'Lanjut: simpulkan →'
  },

  /* ==========================================================
     TAHAP 7 — Generalisasi
     ========================================================== */
  simpulan: {
    kicker: 'Tahap 7 · Generalisasi',
    title: 'Tarik Kesimpulannya',
    goal: 'Merumuskan konsep yang kamu temukan agar berlaku untuk kasus lain, bukan hanya Koperasi Siswa.',
    instruction: 'Jawab soal-soal berikut untuk menguji konsep yang sudah kamu temukan.',

    questions: [
      {
        id: 'q1',
        prompt: 'Sebuah baris pada tabel <code>barang</code> berisi data lengkap tentang satu jenis barang. Baris itu disebut…',
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
        prompt: 'Field <code>nomor_anggota</code> pada tabel <code>transaksi</code> menunjuk ke tabel <code>anggota</code>. Field seperti itu disebut…',
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
        prompt: 'Mengapa <code>nama_anggota</code> tidak cocok dijadikan primary key tabel <code>anggota</code>?',
        options: [
          { id: 'q3a', label: 'Karena nama bisa kembar, sehingga tidak menjamin keunikan baris.' },
          { id: 'q3b', label: 'Karena nama terlalu panjang untuk disimpan.' },
          { id: 'q3c', label: 'Karena nama bukan berupa angka.' },
          { id: 'q3d', label: 'Karena nama tidak boleh disimpan di basis data.' }
        ],
        correct: 'q3a',
        explanation: 'Syarat primary key adalah unik dan tidak berubah-ubah. Dua anggota bisa bernama sama, jadi nama gagal memenuhi syarat itu. Nomor anggota memenuhinya.'
      },
      {
        id: 'q4',
        prompt: 'Apa yang dimaksud dengan analisis kebutuhan sistem dalam perancangan basis data?',
        options: [
          { id: 'q4a', label: 'Proses menggali kebutuhan nyata pengguna — misalnya lewat wawancara atau pengamatan — sebelum struktur basis data dirancang.' },
          { id: 'q4b', label: 'Proses memperbaiki basis data setelah sistemnya selesai dibangun dan bermasalah.' },
          { id: 'q4c', label: 'Proses menulis kode program untuk mengelola basis data.' },
          { id: 'q4d', label: 'Proses mencatat semua data yang kebetulan sudah tersedia, apa adanya.' }
        ],
        correct: 'q4a',
        explanation: 'Analisis kebutuhan sistem dilakukan di awal, sebelum tabel dirancang, supaya rancangannya benar-benar menjawab kebutuhan penggunanya — bukan sekadar meniru data yang kebetulan sudah ada.'
      },
      {
        id: 'q5',
        prompt: 'Mengapa kolom <code>stok_saat_ini</code> baru muncul di rancanganmu, padahal tidak ada sama sekali di catatan lama Bu Sari?',
        options: [
          { id: 'q5a', label: 'Karena kebutuhan itu ditemukan lewat temuan analisis kebutuhan, bukan sekadar meniru data lama.' },
          { id: 'q5b', label: 'Karena setiap tabel barang wajib punya kolom stok, tanpa kecuali.' },
          { id: 'q5c', label: 'Karena kolom itu ditambahkan supaya jumlah kolomnya genap.' },
          { id: 'q5d', label: 'Karena kolom lama dianggap tidak penting lagi.' }
        ],
        correct: 'q5a',
        explanation: 'Analisis kebutuhan sistem menggali apa yang benar-benar dibutuhkan pengguna. Kebutuhan "tahu stok hampir habis" itulah yang mengarahkan penambahan kolom baru — bukan aturan baku atau kebetulan.'
      },
      {
        id: 'q6',
        prompt: 'Sebuah tim membangun aplikasi kasir. Semua data (pembeli, barang, transaksi) dijadikan satu tabel datar, tanpa lebih dulu menggali kebutuhan penggunanya. Apa akibat yang paling mungkin terjadi?',
        options: [
          { id: 'q6a', label: 'Data yang sama ditulis berulang, dan kebutuhan penting bisa terlewat karena tidak pernah digali sejak awal.' },
          { id: 'q6b', label: 'Aplikasi menjadi lebih cepat karena hanya satu tabel.' },
          { id: 'q6c', label: 'Aplikasi tidak bisa dijalankan sama sekali.' },
          { id: 'q6d', label: 'Basis datanya otomatis memperbaiki dirinya sendiri.' }
        ],
        correct: 'q6a',
        explanation: 'Masalahnya berulang di kasus mana pun: redundansi menimbulkan anomali, dan tanpa analisis kebutuhan, hal-hal penting bagi pengguna (seperti info stok) bisa luput sama sekali — persis seperti Koperasi Siswa.'
      },
      {
        id: 'q7',
        prompt: 'Kapan sebaiknya analisis kebutuhan dan perancangan struktur tabel dilakukan dalam sebuah proyek perangkat lunak?',
        options: [
          { id: 'q7a', label: 'Sejak awal, sebelum kode aplikasinya dibangun di atasnya.' },
          { id: 'q7b', label: 'Setelah aplikasinya selesai dan dipakai pengguna.' },
          { id: 'q7c', label: 'Hanya jika datanya sudah melebihi seribu baris.' },
          { id: 'q7d', label: 'Tidak perlu, cukup mengikuti kebutuhan sambil jalan.' }
        ],
        correct: 'q7a',
        explanation: 'Analisis kebutuhan dan struktur data adalah fondasi. Melakukannya belakangan berarti membongkar kode, memindahkan data lama, dan menanggung risiko kehilangan data.'
      }
    ],

    cekLabel: 'Periksa jawaban',
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt:
      'Tulis satu sampai dua kalimat: mengapa konsep dasar basis data dan analisis kebutuhan sistem sama-sama penting dalam pengembangan perangkat lunak?',
    kesimpulanPlaceholder: 'Keduanya penting karena…',
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
      { id: 'li_analisis', text: 'Saya dapat menjelaskan apa itu analisis kebutuhan sistem dan mengapa itu penting.' },
      { id: 'li_pecah', text: 'Saya dapat merancang tabel berdasarkan temuan analisis kebutuhan pengguna.' },
      { id: 'li_penting', text: 'Saya dapat menjelaskan mengapa konsep dasar basis data dan analisis kebutuhan sistem sama-sama penting.' }
    ],

    prompts: [
      {
        id: 'rf1',
        question: 'Bagian mana yang paling mengubah caramu memandang data dan kebutuhan pengguna? Mengapa?',
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
      '<strong>Analisis kebutuhan sistem</strong> menggali apa yang benar-benar dibutuhkan pengguna — lewat wawancara atau pengamatan — sebelum satu tabel pun dirancang.',
      'Hasil analisis kebutuhan itulah yang menentukan entitas, atribut (termasuk atribut yang sama sekali baru seperti <code>stok_saat_ini</code>), dan relasi pada basis data.',
      'Menyimpan fakta berulang tanpa rancangan yang matang memunculkan tiga anomali: <strong>pembaruan</strong>, <strong>penyisipan</strong>, dan <strong>penghapusan</strong>.',
      'Struktur data dan analisis kebutuhan adalah <strong>fondasi</strong> perangkat lunak. Kode yang baik tidak dapat menyelamatkan rancangan yang keliru sejak awal.'
    ],

    lanjutLabel: 'Langkah berikutnya',
    lanjut: [
      'Materi 1.2 — mendalami cara menganalisis entitas dan atribut langsung dari dokumen spesifikasi kebutuhan nyata.',
      'Coba terapkan: ambil satu aplikasi yang kamu pakai sehari-hari, tebak kebutuhan pengguna apa yang mungkin menentukan rancangan data di baliknya.'
    ],

    ulangLabel: '↩ Ulangi dari awal',
    berandaLabel: 'Kembali ke beranda',
    ulangKonfirmasi:
      'Ulangi materi dari awal? Seluruh jawaban dan progresmu akan dihapus, dan pilihan jawaban akan diacak ulang.'
  }
};

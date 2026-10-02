'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Menganalisis Kebutuhan Data untuk
   Mengidentifikasi Entitas & Atribut Basis Data
   Fase F — SMK Rekayasa Perangkat Lunak, Discovery Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js. Guru dapat menyunting teks, soal, kunci,
   dan umpan balik di sini tanpa menyentuh kode.

   Studi kasus: Koperasi Siswa "KopSis" akan dibuatkan aplikasi.
   Murid berperan sebagai analis yang menggali kebutuhan data
   dari dokumen kebutuhan (transkrip wawancara, catatan pemasok,
   nota lama), lalu menemukan sendiri konsep entitas, atribut,
   dan atribut kunci.

   Pemetaan sintaks Discovery Learning → tahap media:
     Pendahuluan            → orientasi   (tujuan, alur, apersepsi)
     1. Stimulasi           → stimulasi   (catatan spreadsheet datar
                                           yang bikin pusing)
     2. Identifikasi Masalah→ masalah     (rumusan masalah & dugaan)
     3. Pengumpulan Data    → kumpulData  (memilah frasa dokumen
                                           kebutuhan)
                            → contoh      (contoh vs non-contoh
                                           entitas & atribut)
     4. Pengolahan Data     → olah        (mengelompokkan atribut ke
                                           entitas, memilih kunci)
     5. Pembuktian          → pembuktian  (menguji rancangan terhadap
                                           kebutuhan pengguna)
     6. Generalisasi        → simpulan    (langkah analisis kebutuhan
                                           data & kesimpulan konsep)
     Penerapan              → terapkan    (kasus baru: servis laptop)
     Refleksi & penutup     → refleksi, selesai

   ATURAN: setiap pilihan punya `id` unik dan stabil. Urutan
   tampilnya DIACAK oleh app.js (initOrders) dan jawaban murid
   disimpan per id. Penanda frasa [[id|teks]] pada dokumen
   kebutuhan harus sama persis dengan `teks` pada daftar frasa.
   ============================================================ */

var DATA = {
  meta: {
    judul: 'Menganalisis Kebutuhan Data: Mengidentifikasi Entitas & Atribut',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Discovery Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Pendahuluan' },
    { id: 'stimulasi', label: 'Stimulasi', sintaks: 'Sintaks 1 · Stimulasi' },
    { id: 'masalah', label: 'Rumusan Masalah', sintaks: 'Sintaks 2 · Identifikasi Masalah' },
    { id: 'kumpulData', label: 'Gali Kebutuhan', sintaks: 'Sintaks 3 · Pengumpulan Data' },
    { id: 'contoh', label: 'Contoh & Bukan', sintaks: 'Sintaks 3 · Pengumpulan Data' },
    { id: 'olah', label: 'Rancang Entitas', sintaks: 'Sintaks 4 · Pengolahan Data' },
    { id: 'pembuktian', label: 'Uji Rancangan', sintaks: 'Sintaks 5 · Pembuktian' },
    { id: 'simpulan', label: 'Kesimpulan', sintaks: 'Sintaks 6 · Generalisasi' },
    { id: 'terapkan', label: 'Uji Terap', sintaks: 'Penerapan' },
    { id: 'refleksi', label: 'Refleksi', sintaks: 'Refleksi' },
    { id: 'selesai', label: 'Selesai', sintaks: 'Penutup' },
  ],

  /* ==========================================================
     PENDAHULUAN — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Sebelum Mulai',
    goal: 'Mengetahui tujuan belajar, alur, dan cara memakai media ini.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menganalisis kebutuhan data suatu studi kasus untuk mengidentifikasi entitas dan atribut basis data.',
    kriteria: [
      'Memilah informasi pada dokumen kebutuhan menjadi data yang perlu disimpan, proses sistem, nilai turunan, dan hal yang tidak relevan.',
      'Mengidentifikasi entitas dari hasil analisis kebutuhan data.',
      'Mengelompokkan atribut ke entitas yang tepat dan menentukan atribut kuncinya.',
      'Menguji rancangan entitas–atribut terhadap kebutuhan pengguna.',
    ],
    pengantar:
      'Koperasi Siswa (KopSis) di sekolahmu ingin beralih dari catatan spreadsheet ke sebuah aplikasi. ' +
      'Sebelum aplikasi dibuat, tim RPL harus tahu dulu <strong>data apa saja yang perlu disimpan</strong>. ' +
      'Di media ini kamu berperan sebagai <strong>analis sistem</strong>: kamu tidak diberi definisi lebih dulu, ' +
      'tetapi menemukannya sendiri dari dokumen kebutuhan KopSis.',
    alur: [
      { judul: 'Stimulasi', desk: 'Mengamati catatan KopSis yang bikin pusing.' },
      { judul: 'Rumusan masalah', desk: 'Menetapkan pertanyaan yang ingin dijawab.' },
      { judul: 'Pengumpulan data', desk: 'Menggali dokumen kebutuhan dan membandingkan contoh.' },
      { judul: 'Pengolahan data', desk: 'Menyusun entitas, atribut, dan atribut kunci.' },
      { judul: 'Pembuktian', desk: 'Menguji rancanganmu terhadap kebutuhan pengguna.' },
      { judul: 'Generalisasi', desk: 'Menyimpulkan langkah analisis kebutuhan data.' },
      { judul: 'Uji terap & refleksi', desk: 'Mencoba kasus baru, lalu menilai diri.' },
    ],
    caraPakai: [
      'Tahap terbuka berurutan — selesaikan satu tahap untuk membuka tahap berikutnya.',
      'Progres tersimpan otomatis di perangkat ini; boleh ditutup lalu dilanjutkan.',
      'Salah itu wajar. Setiap jawaban diberi penjelasan supaya kamu bisa menemukan sendiri alasannya.',
      'Pilihan jawaban diacak. Tombol <strong>Reset</strong> menghapus progres dan mengacak ulang pilihan.',
    ],
    apersepsi: {
      tanya:
        'Ingat aplikasi pesan-antar makanan yang pernah kamu pakai. Menurutmu, data apa yang <strong>pasti</strong> disimpan aplikasi itu?',
      opsi: [
        { id: 'ap1', label: 'Data pelanggan, restoran, menu, dan pesanan' },
        { id: 'ap2', label: 'Hanya foto-foto menu makanan' },
        { id: 'ap3', label: 'Hanya nomor HP pengemudi' },
        { id: 'ap4', label: 'Tidak ada; aplikasi tidak perlu menyimpan data' },
      ],
      umpan:
        'Tidak ada jawaban salah di sini — simpan dugaanmu. Di akhir media kamu akan bisa menjelaskan ' +
        '<em>mengapa</em> aplikasi seperti itu menyimpan data pelanggan, restoran, menu, dan pesanan secara terpisah.',
    },
    guru:
      'Bacakan TP dan kriteria. Gunakan apersepsi untuk memancing pengalaman murid memakai aplikasi; ' +
      'jangan dulu memberi definisi entitas/atribut — biarkan murid menemukannya di tahap berikutnya.',
  },

  /* ==========================================================
     SINTAKS 1 — Stimulasi
     ========================================================== */
  stimulasi: {
    kicker: 'Tahap 2 · Stimulasi',
    title: 'Catatan KopSis yang Bikin Pusing',
    goal: 'Menemukan kejanggalan pada cara data KopSis dicatat.',
    cerita:
      'Bu Sari, pengurus KopSis, mencatat semua penjualan di <strong>satu file spreadsheet</strong>. ' +
      'Satu baris = satu transaksi. Setelah satu semester, isinya ratusan baris. Minggu lalu Bu Sari mengeluh:',
    keluhan:
      '"Nomor HP Dewi saya tulis beda-beda, jadi saya bingung yang benar yang mana. ' +
      'Stok tinta printer ternyata habis dari kemarin — saya baru tahu waktu ada yang mau beli. ' +
      'Saya juga lupa pemasok tinta itu siapa dan nomornya berapa."',
    tabel: {
      judul: 'CatatanKopSis.xlsx (cuplikan 8 baris)',
      kolom: [
        'tanggal',
        'nama_anggota',
        'kelas',
        'no_hp',
        'kode_barang',
        'nama_barang',
        'kategori',
        'jumlah',
      ],
      baris: [
        [
          '02/09/2025',
          'Rani Alfiah',
          'XI RPL 1',
          '0812-3344-5566',
          'BRG-01',
          'Buku Tulis 38 Lbr',
          'Alat Tulis',
          '2',
        ],
        [
          '02/09/2025',
          'Bima Saputra',
          'XI RPL 2',
          '0857-1122-3344',
          'BRG-04',
          'Pulpen Standar',
          'Alat Tulis',
          '3',
        ],
        [
          '04/09/2025',
          'Rani Alfiah',
          'XI RPL 1',
          '0812-3344-5566',
          'BRG-04',
          'Pulpen Standar',
          'Alat Tulis',
          '1',
        ],
        [
          '05/09/2025',
          'Dewi Lestari',
          'XI RPL 1',
          '0895-7788-9900',
          'BRG-01',
          'Buku Tulis 38 Lbr',
          'Alat Tulis',
          '4',
        ],
        [
          '08/09/2025',
          'Bima Saputra',
          'XI RPL 2',
          '0857-1122-3344',
          'BRG-07',
          'Map Plastik',
          'Perlengkapan',
          '2',
        ],
        [
          '09/09/2025',
          'Aldi Pratama',
          'XI RPL 2',
          '0813-2211-4455',
          'BRG-09',
          'Snack Kemasan',
          'Makanan Ringan',
          '5',
        ],
        [
          '11/09/2025',
          'Aldi Pratama',
          'XI RPL 2',
          '0813-2211-4455',
          'BRG-04',
          'Pulpen Standar',
          'alat tulis',
          '2',
        ],
        [
          '12/09/2025',
          'Dewi Lestari',
          'XI RPL 1',
          '0895-7788-990',
          'BRG-07',
          'Map Plastik',
          'Perlengkapan',
          '1',
        ],
      ],
    },
    kejanggalan: {
      tanya:
        'Amati tabel dan keluhan Bu Sari. Mana saja yang merupakan <strong>kejanggalan</strong> cara pencatatan ini?',
      opsi: [
        {
          id: 'k1',
          benar: true,
          label:
            'Nama, kelas, dan nomor HP anggota yang sama ditulis berulang di setiap transaksi.',
          alasan:
            'Data Rani, Bima, Aldi, dan Dewi diketik ulang tiap kali mereka belanja. Pengulangan seperti ini membuka peluang salah ketik.',
        },
        {
          id: 'k2',
          benar: true,
          label: 'Nomor HP Dewi tertulis berbeda pada dua baris.',
          alasan:
            'Baris 4 tertulis 0895-7788-9900, baris 8 tertulis 0895-7788-990. Data yang sama menjadi tidak konsisten.',
        },
        {
          id: 'k3',
          benar: true,
          label: 'Kategori yang sama ditulis berbeda: "Alat Tulis" dan "alat tulis".',
          alasan: 'Komputer menganggap keduanya berbeda, sehingga rekap per kategori bisa keliru.',
        },
        {
          id: 'k4',
          benar: true,
          label:
            'Tidak ada tempat untuk mencatat stok barang dan data pemasok, padahal Bu Sari membutuhkannya.',
          alasan:
            'Keluhan Bu Sari soal stok tinta dan pemasok menunjukkan ada kebutuhan data yang belum digali sama sekali.',
        },
        {
          id: 'k5',
          benar: false,
          label: 'Tanggal ditulis dengan format hari/bulan/tahun.',
          alasan: 'Formatnya konsisten di semua baris, jadi bukan sumber masalah.',
        },
        {
          id: 'k6',
          benar: false,
          label: 'Jumlah barang ditulis dengan angka.',
          alasan: 'Menulis jumlah dengan angka justru tepat karena akan dihitung.',
        },
        {
          id: 'k7',
          benar: false,
          label: 'Ada pembeli dari dua kelas yang berbeda.',
          alasan:
            'Anggota KopSis memang berasal dari banyak kelas; itu bukan kejanggalan pencatatan.',
        },
      ],
      done: '<strong>Kamu menemukan semua kejanggalannya!</strong> Data ditulis berulang, tidak konsisten, dan ada kebutuhan yang belum tergali.',
    },
    pemantik:
      'Kalau kamu yang membuat aplikasinya, <strong>data apa saja</strong> yang harus disimpan, dan bagaimana mengelompokkannya agar tidak ditulis berulang?',
    guru: 'Minta murid mengamati tabel 2–3 menit sebelum memilih. Setelah semua kejanggalan ditemukan, ajukan pertanyaan pemantik secara lisan dan tampung jawaban murid di papan tanpa dikoreksi dulu.',
  },

  /* ==========================================================
     SINTAKS 2 — Identifikasi Masalah
     ========================================================== */
  masalah: {
    kicker: 'Tahap 3 · Rumusan Masalah',
    title: 'Apa yang Harus Kita Cari Tahu?',
    goal: 'Merumuskan masalah dan dugaan awal tentang kebutuhan data KopSis.',
    pengantar:
      'Tim RPL tidak bisa langsung membuat aplikasi. Mereka harus menjawab satu pertanyaan besar lebih dulu. ' +
      'Pilih rumusan masalah dan dugaan yang paling tepat. Kamu boleh mencoba lagi sampai tepat.',
    pertanyaan: [
      {
        id: 'm1',
        tanya: 'Rumusan masalah mana yang paling tepat untuk memulai rancangan aplikasi KopSis?',
        opsi: [
          {
            id: 'a',
            label:
              'Data apa saja yang dibutuhkan KopSis, dan bagaimana data itu dikelompokkan menjadi entitas beserta atributnya?',
          },
          { id: 'b', label: 'Bagaimana membuat tampilan aplikasi yang berwarna hijau?' },
          { id: 'c', label: 'Berapa total omzet KopSis selama satu semester?' },
          { id: 'd', label: 'Siapa siswa yang paling sering berbelanja di KopSis?' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat. Sebelum membuat aplikasi, analis harus tahu <strong>data apa</strong> yang disimpan dan <strong>bagaimana mengelompokkannya</strong>.',
          b: 'Tampilan memang penting, tetapi tidak menyelesaikan masalah data yang berulang dan tidak konsisten.',
          c: 'Omzet adalah hasil olahan data. Pertanyaannya: data apa yang harus disimpan agar omzet bisa dihitung?',
          d: 'Itu pertanyaan yang bisa dijawab <em>setelah</em> datanya tersimpan rapi — belum menyentuh akar masalah.',
        },
      },
      {
        id: 'm2',
        tanya: 'Dugaan (hipotesis) awal mana yang paling masuk akal untuk diuji?',
        opsi: [
          {
            id: 'a',
            label:
              'Jika data dikelompokkan menurut "sesuatu" yang dicatat (anggota, barang, …) beserta cirinya, data tidak perlu ditulis berulang dan menjadi konsisten.',
          },
          { id: 'b', label: 'Data cukup dipindah ke file spreadsheet yang lebih besar.' },
          { id: 'c', label: 'Masalahnya hilang asal Bu Sari mengetik lebih hati-hati.' },
          { id: 'd', label: 'Semua kolom dihapus kecuali nama anggota agar tabel lebih ringkas.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Dugaan yang bagus! Inilah yang akan kamu buktikan di tahap-tahap berikutnya.',
          b: 'File yang lebih besar tetap menulis data anggota berulang-ulang. Strukturnya yang perlu diubah.',
          c: 'Kehati-hatian membantu, tetapi selama data ditulis berulang, peluang salah ketik tetap ada.',
          d: 'Data barang, jumlah, dan tanggal tetap dibutuhkan. Menghapusnya justru menghilangkan informasi.',
        },
      },
    ],
    guru: 'Diskusikan mengapa rumusan masalah yang dipilih berfokus pada <em>data</em>, bukan tampilan. Tuliskan hipotesis kelas di papan untuk dibuktikan pada tahap Pembuktian.',
  },

  /* ==========================================================
     SINTAKS 3 — Pengumpulan Data (1): menggali dokumen kebutuhan
     ========================================================== */
  kumpulData: {
    kicker: 'Tahap 4 · Gali Kebutuhan',
    title: 'Dokumen Kebutuhan KopSis',
    goal: 'Memilah informasi dalam dokumen kebutuhan menjadi data yang perlu disimpan dan yang bukan.',
    pengantar:
      'Tim analis mengumpulkan tiga dokumen kebutuhan. Frasa penting sudah ditandai dan diberi nomor. ' +
      'Baca dokumennya, lalu pilah setiap frasa ke kategori yang tepat.',
    dokumen: [
      {
        id: 'd1',
        ikon: '🎙️',
        jenis: 'Transkrip wawancara',
        judul: 'Wawancara dengan Bu Sari (pengurus KopSis)',
        teks:
          'Analis: Bu, data apa saja yang Ibu perlukan dari aplikasi nanti?\n' +
          'Bu Sari: Saya perlu menyimpan [[f1|nama dan kelas setiap anggota]], juga [[f2|nomor HP anggota]] supaya gampang dihubungi. ' +
          'Setiap barang punya kode, jadi saya catat [[f3|kode, nama, harga jual, dan stok barang]].\n' +
          'Analis: Lalu setelah transaksi?\n' +
          'Bu Sari: Aplikasinya harus bisa [[f4|mencetak struk setelah pembeli membayar]]. Saya juga ingin langsung melihat [[f5|total belanja di setiap nota]] tanpa menghitung manual.\n' +
          'Bu Sari: Oh ya, ruang KopSis baru saja [[f6|dicat ulang warna hijau]]. Laptop kasir juga sudah ganti, [[f13|merek laptop yang dipakai kasir]] sekarang lebih bagus.',
      },
      {
        id: 'd2',
        ikon: '📋',
        jenis: 'Catatan kerja',
        judul: 'Buku catatan pemasok Bu Sari',
        teks:
          'Daftar pemasok — diisi setiap ada pemasok baru:\n' +
          '• [[f7|nama pemasok dan nomor teleponnya]]\n' +
          '• [[f8|alamat pemasok]]\n' +
          'Catatan: tiap akhir bulan saya ingin [[f9|mengirim pesanan ulang ke pemasok]] untuk barang yang hampir habis.',
      },
      {
        id: 'd3',
        ikon: '🧾',
        jenis: 'Dokumen lama',
        judul: 'Nota penjualan No. 0127',
        teks:
          'NOTA No. 0127 — [[f10|tanggal penjualan]]: 12/09/2025\n' +
          'Pembeli: Dewi Lestari (XI RPL 1)\n' +
          'Map Plastik × 1 → [[f11|jumlah beli]] per barang ditulis di setiap baris nota.\n' +
          'Pesan kepala sekolah: tolong laporkan [[f12|banyaknya anggota KopSis bulan ini]].',
      },
    ],
    kategori: [
      { id: 'data', label: '📦 Data yang perlu disimpan' },
      { id: 'proses', label: '⚙️ Proses/kegiatan sistem' },
      { id: 'turunan', label: '🧮 Nilai yang dapat dihitung' },
      { id: 'luar', label: '🚫 Tidak berkaitan dengan sistem' },
    ],
    frasa: [
      {
        id: 'f1',
        teks: 'nama dan kelas setiap anggota',
        correct: 'data',
        explanation:
          'Ini keterangan tentang anggota yang harus tersimpan dan dipakai berulang kali.',
      },
      {
        id: 'f2',
        teks: 'nomor HP anggota',
        correct: 'data',
        explanation:
          'Nomor HP adalah keterangan anggota yang perlu disimpan agar anggota bisa dihubungi.',
      },
      {
        id: 'f3',
        teks: 'kode, nama, harga jual, dan stok barang',
        correct: 'data',
        explanation: 'Semuanya keterangan tentang barang yang perlu disimpan.',
      },
      {
        id: 'f4',
        teks: 'mencetak struk setelah pembeli membayar',
        correct: 'proses',
        explanation:
          'Mencetak struk adalah <em>kegiatan</em> yang dilakukan aplikasi. Prosesnya memakai data, tetapi proses itu sendiri tidak disimpan sebagai data.',
      },
      {
        id: 'f5',
        teks: 'total belanja di setiap nota',
        correct: 'turunan',
        explanation:
          'Total belanja dapat <em>dihitung</em> dari harga jual × jumlah beli. Menyimpannya terpisah berisiko tidak cocok dengan rinciannya.',
      },
      {
        id: 'f6',
        teks: 'dicat ulang warna hijau',
        correct: 'luar',
        explanation: 'Warna cat ruangan tidak berkaitan dengan data yang dikelola aplikasi KopSis.',
      },
      {
        id: 'f7',
        teks: 'nama pemasok dan nomor teleponnya',
        correct: 'data',
        explanation:
          'Ini keterangan tentang pemasok — kebutuhan yang tadinya belum tergali di spreadsheet.',
      },
      {
        id: 'f8',
        teks: 'alamat pemasok',
        correct: 'data',
        explanation: 'Alamat juga keterangan pemasok yang perlu disimpan.',
      },
      {
        id: 'f9',
        teks: 'mengirim pesanan ulang ke pemasok',
        correct: 'proses',
        explanation:
          'Mengirim pesanan adalah kegiatan. Agar kegiatan ini bisa dilakukan, aplikasi membutuhkan data stok dan data pemasok.',
      },
      {
        id: 'f10',
        teks: 'tanggal penjualan',
        correct: 'data',
        explanation: 'Tanggal adalah keterangan setiap kejadian penjualan yang perlu disimpan.',
      },
      {
        id: 'f11',
        teks: 'jumlah beli',
        correct: 'data',
        explanation:
          'Jumlah beli dicatat pada setiap penjualan dan tidak bisa dihitung dari data lain.',
      },
      {
        id: 'f12',
        teks: 'banyaknya anggota KopSis bulan ini',
        correct: 'turunan',
        explanation:
          'Banyaknya anggota cukup <em>dihitung</em> dari daftar anggota yang tersimpan; tidak perlu disimpan sendiri.',
      },
      {
        id: 'f13',
        teks: 'merek laptop yang dipakai kasir',
        correct: 'luar',
        explanation:
          'Perangkat yang dipakai kasir bukan data yang dikelola aplikasi penjualan KopSis.',
      },
    ],
    temuan:
      'Dari dokumen kebutuhan, data yang perlu disimpan ternyata berkisar pada <strong>anggota</strong>, <strong>barang</strong>, <strong>pemasok</strong>, dan <strong>penjualan</strong>. Proses, nilai turunan, dan hal di luar sistem tidak disimpan sebagai data.',
    guru: 'Mintalah murid membaca dokumen secara berpasangan. Tekankan bahwa analis menyaring kebutuhan: tidak semua yang diucapkan pengguna menjadi data. Bahas frasa yang paling banyak keliru.',
  },

  /* ==========================================================
     SINTAKS 3 — Pengumpulan Data (2): contoh dan bukan contoh
     ========================================================== */
  contoh: {
    kicker: 'Tahap 5 · Contoh & Bukan Contoh',
    title: 'Apa Bedanya?',
    goal: 'Menemukan ciri entitas, atribut, dan atribut kunci dengan membandingkan contoh dan bukan contoh.',
    pengantar:
      'Analis senior menyusun kartu-kartu berikut. Kartu kiri disebut <strong>entitas</strong>, kartu kanan <strong>bukan entitas</strong>. ' +
      'Bandingkan, lalu jawab pertanyaan penuntun untuk menemukan sendiri cirinya.',
    kartu: [
      {
        id: 'e1',
        jenis: 'contoh',
        judul: '🧑 Anggota',
        isi: 'Rani, Bima, Dewi, Aldi, … Setiap anggota punya nama, kelas, dan nomor HP.',
      },
      {
        id: 'e2',
        jenis: 'contoh',
        judul: '📦 Barang',
        isi: 'Buku tulis, pulpen, map plastik, … Setiap barang punya kode, nama, harga jual, dan stok.',
      },
      {
        id: 'e3',
        jenis: 'contoh',
        judul: '🧾 Penjualan',
        isi: 'Nota 0127, 0128, 0129, … Setiap penjualan punya nomor nota, tanggal, dan jumlah beli.',
      },
      {
        id: 'n1',
        jenis: 'bukan',
        judul: '⚙️ Mencetak struk',
        isi: 'Sesuatu yang dilakukan aplikasi setelah pembeli membayar.',
      },
      {
        id: 'n2',
        jenis: 'bukan',
        judul: '🧮 Total belanja',
        isi: 'Harga jual × jumlah beli, dijumlahkan untuk satu nota.',
      },
      {
        id: 'n3',
        jenis: 'bukan',
        judul: '🎨 Warna cat ruangan',
        isi: 'Ruang KopSis dicat hijau.',
      },
    ],
    pertanyaan: [
      {
        id: 'c1',
        tanya: 'Apa kesamaan Anggota, Barang, dan Penjualan?',
        opsi: [
          {
            id: 'a',
            label:
              'Masing-masing mewakili banyak hal sejenis yang datanya perlu disimpan, dan setiap anggotanya dapat dibedakan satu sama lain.',
          },
          { id: 'b', label: 'Ketiganya adalah kegiatan yang dilakukan Bu Sari.' },
          { id: 'c', label: 'Ketiganya hanya muncul satu kali dalam catatan KopSis.' },
          { id: 'd', label: 'Ketiganya adalah hasil perhitungan dari data lain.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat! Ada banyak anggota, banyak barang, banyak penjualan — masing-masing dicatat dan dapat dibedakan.',
          b: 'Coba lihat lagi: "Anggota" dan "Barang" adalah orang dan benda, bukan kegiatan.',
          c: 'Justru sebaliknya: ada banyak anggota, banyak barang, dan banyak penjualan.',
          d: 'Nama anggota atau harga barang tidak dihitung dari data lain — keduanya harus dicatat.',
        },
      },
      {
        id: 'c2',
        tanya: 'Mengapa "Mencetak struk" tidak termasuk entitas?',
        opsi: [
          {
            id: 'a',
            label: 'Karena itu kegiatan/proses sistem, bukan sesuatu yang datanya disimpan.',
          },
          { id: 'b', label: 'Karena struk dicetak di atas kertas.' },
          { id: 'c', label: 'Karena namanya terdiri atas dua kata.' },
          { id: 'd', label: 'Karena hanya Bu Sari yang memakainya.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar. Proses memakai data, tetapi proses itu sendiri tidak menjadi entitas.',
          b: 'Media cetaknya tidak menentukan. Yang penting: ini sebuah kegiatan, bukan objek yang dicatat.',
          c: 'Banyaknya kata tidak berpengaruh. Perhatikan jenisnya: kegiatan atau objek?',
          d: 'Siapa pemakainya tidak menentukan. Perhatikan apakah ada data yang perlu disimpan tentangnya.',
        },
      },
      {
        id: 'c3',
        tanya: 'Mengapa "Total belanja" tidak perlu disimpan?',
        opsi: [
          { id: 'a', label: 'Karena nilainya dapat dihitung dari harga jual dan jumlah beli.' },
          { id: 'b', label: 'Karena total belanja selalu kecil.' },
          { id: 'c', label: 'Karena pembeli tidak peduli total belanjanya.' },
          { id: 'd', label: 'Karena total belanja hanya ada di struk.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat. Nilai turunan cukup dihitung saat dibutuhkan agar tidak bertentangan dengan rinciannya.',
          b: 'Besar kecilnya nilai tidak menentukan. Perhatikan dari mana nilai itu berasal.',
          c: 'Pembeli justru peduli. Pertanyaannya: perlukah disimpan bila bisa dihitung?',
          d: 'Coba pikirkan: dari data apa struk menghitung totalnya?',
        },
      },
      {
        id: 'c4',
        tanya:
          'Dari temuanmu, kalimat mana yang paling tepat menjelaskan <strong>entitas</strong>?',
        opsi: [
          {
            id: 'a',
            label:
              'Objek (orang, benda, tempat, atau kejadian) yang datanya perlu disimpan dan setiap anggotanya dapat dibedakan.',
          },
          { id: 'b', label: 'Setiap kata benda yang muncul dalam wawancara.' },
          { id: 'c', label: 'Kegiatan yang dikerjakan oleh aplikasi.' },
          { id: 'd', label: 'Kolom pada spreadsheet.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Inilah konsep entitas yang kamu temukan sendiri!',
          b: 'Tidak semua kata benda menjadi entitas — "warna cat" dan "merek laptop kasir" contohnya. Harus ada data yang perlu disimpan.',
          c: 'Kegiatan adalah proses, seperti mencetak struk. Entitas adalah objek yang datanya disimpan.',
          d: 'Kolom spreadsheet lebih dekat ke keterangan/ciri, bukan objeknya.',
        },
      },
      {
        id: 'c5',
        tanya:
          '<code>nama_barang</code>, <code>harga_jual</code>, dan <code>stok</code> melekat pada entitas Barang. Hal seperti ini disebut <strong>atribut</strong>. Apa artinya?',
        opsi: [
          { id: 'a', label: 'Ciri atau keterangan yang melekat pada sebuah entitas.' },
          { id: 'b', label: 'Entitas yang lebih kecil di dalam entitas lain.' },
          { id: 'c', label: 'Nilai yang selalu dihitung otomatis oleh aplikasi.' },
          { id: 'd', label: 'Daftar pengguna aplikasi.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat. Atribut menerangkan entitas — seperti nama, harga, dan stok menerangkan barang.',
          b: 'Atribut bukan entitas; ia keterangan yang menempel pada entitas.',
          c: 'Atribut justru data yang dicatat. Nilai yang dihitung adalah nilai turunan.',
          d: 'Pengguna aplikasi bisa saja menjadi entitas, tetapi atribut adalah keterangan entitas.',
        },
      },
      {
        id: 'c6',
        tanya:
          'Dua anggota bisa sama-sama bernama "Rani". Atribut seperti apa yang perlu ada agar setiap anggota tetap bisa dibedakan?',
        opsi: [
          {
            id: 'a',
            label: 'Atribut yang nilainya unik untuk setiap anggota, misalnya id_anggota.',
          },
          { id: 'b', label: 'Atribut kelas, karena setiap anggota pasti beda kelas.' },
          { id: 'c', label: 'Atribut nama, karena paling mudah diingat.' },
          { id: 'd', label: 'Tidak perlu; nama sudah cukup.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar! Atribut yang nilainya unik dan dipakai untuk membedakan disebut <strong>atribut kunci</strong>.',
          b: 'Banyak anggota berada di kelas yang sama, jadi kelas tidak unik.',
          c: 'Nama mudah diingat, tetapi bisa kembar. Pembeda harus selalu unik.',
          d: 'Coba bayangkan dua "Rani" di XI RPL 1 — data siapa yang dimaksud?',
        },
      },
    ],
    guru: 'Ajak murid membandingkan kartu kiri dan kanan sebelum menjawab. Setelah c4–c6 terjawab, minta murid merumuskan definisi entitas, atribut, dan atribut kunci dengan kalimat sendiri di buku catatan.',
  },

  /* ==========================================================
     SINTAKS 4 — Pengolahan Data
     ========================================================== */
  olah: {
    kicker: 'Tahap 6 · Rancang Entitas',
    title: 'Menyusun Entitas dan Atributnya',
    goal: 'Mengelompokkan atribut ke entitas yang tepat dan menentukan atribut kuncinya.',
    pengantar:
      'Dari dokumen kebutuhan, tim menemukan empat entitas. Kelompokkan setiap atribut ke entitas pemiliknya. ' +
      'Setelah semuanya terkelompok, tentukan atribut kunci tiap entitas.',
    entitas: [
      { id: 'anggota', label: 'Anggota', ikon: '🧑', kunci: 'id_anggota' },
      { id: 'barang', label: 'Barang', ikon: '📦', kunci: 'kode_barang' },
      { id: 'pemasok', label: 'Pemasok', ikon: '🚚', kunci: 'id_pemasok' },
      { id: 'penjualan', label: 'Penjualan', ikon: '🧾', kunci: 'no_nota' },
    ],
    atribut: [
      {
        id: 'id_anggota',
        teks: 'id_anggota',
        correct: 'anggota',
        explanation: 'Nomor pengenal yang diberikan KopSis untuk tiap anggota.',
      },
      {
        id: 'nama_anggota',
        teks: 'nama_anggota',
        correct: 'anggota',
        explanation: 'Nama menerangkan siapa anggotanya.',
      },
      {
        id: 'kelas',
        teks: 'kelas',
        correct: 'anggota',
        explanation: 'Kelas adalah keterangan anggota.',
      },
      {
        id: 'no_hp',
        teks: 'no_hp',
        correct: 'anggota',
        explanation: 'Nomor HP dipakai untuk menghubungi anggota — cukup disimpan sekali di sini.',
      },
      {
        id: 'kode_barang',
        teks: 'kode_barang',
        correct: 'barang',
        explanation: 'Kode yang ditempel Bu Sari pada setiap barang (BRG-01, BRG-04, …).',
      },
      {
        id: 'nama_barang',
        teks: 'nama_barang',
        correct: 'barang',
        explanation: 'Nama menerangkan barangnya.',
      },
      {
        id: 'kategori',
        teks: 'kategori',
        correct: 'barang',
        explanation: 'Kategori (alat tulis, perlengkapan, …) adalah keterangan barang.',
      },
      {
        id: 'harga_jual',
        teks: 'harga_jual',
        correct: 'barang',
        explanation: 'Harga jual melekat pada barang, bukan pada pembelinya.',
      },
      {
        id: 'stok',
        teks: 'stok',
        correct: 'barang',
        explanation: 'Stok menyatakan sisa barang — kebutuhan yang dulu tidak tercatat.',
      },
      {
        id: 'id_pemasok',
        teks: 'id_pemasok',
        correct: 'pemasok',
        explanation: 'Nomor pengenal untuk setiap pemasok.',
      },
      {
        id: 'nama_pemasok',
        teks: 'nama_pemasok',
        correct: 'pemasok',
        explanation: 'Nama menerangkan pemasoknya.',
      },
      {
        id: 'alamat_pemasok',
        teks: 'alamat_pemasok',
        correct: 'pemasok',
        explanation: 'Alamat dicatat dari buku catatan pemasok.',
      },
      {
        id: 'no_telp_pemasok',
        teks: 'no_telp_pemasok',
        correct: 'pemasok',
        explanation: 'Nomor telepon dibutuhkan untuk memesan ulang barang.',
      },
      {
        id: 'no_nota',
        teks: 'no_nota',
        correct: 'penjualan',
        explanation: 'Setiap kejadian penjualan punya nomor nota sendiri.',
      },
      {
        id: 'tanggal',
        teks: 'tanggal',
        correct: 'penjualan',
        explanation: 'Tanggal menerangkan kapan penjualan terjadi.',
      },
      {
        id: 'jumlah_beli',
        teks: 'jumlah_beli',
        correct: 'penjualan',
        explanation: 'Jumlah beli berbeda di setiap penjualan, jadi melekat pada penjualan.',
      },
      {
        id: 'metode_bayar',
        teks: 'metode_bayar',
        correct: 'penjualan',
        explanation: 'Tunai atau QRIS ditentukan pada saat penjualan.',
      },
    ],
    kunci: [
      {
        id: 'kunci-anggota',
        entitas: 'anggota',
        tanya:
          'Atribut mana yang paling tepat menjadi <strong>atribut kunci</strong> entitas Anggota?',
        opsi: [
          { id: 'id_anggota', label: '<code>id_anggota</code>' },
          { id: 'nama_anggota', label: '<code>nama_anggota</code>' },
          { id: 'kelas', label: '<code>kelas</code>' },
          { id: 'no_hp', label: '<code>no_hp</code>' },
        ],
        correct: 'id_anggota',
        umpan: {
          id_anggota: 'Tepat. id_anggota dibuat unik oleh KopSis dan tidak berubah.',
          nama_anggota: 'Nama bisa kembar, seperti dua "Rani". Pembeda harus unik.',
          kelas: 'Banyak anggota berada di kelas yang sama.',
          no_hp:
            'Nomor HP bisa berganti atau dipakai bersama saudara. Kunci sebaiknya tetap dan pasti unik.',
        },
      },
      {
        id: 'kunci-barang',
        entitas: 'barang',
        tanya: 'Atribut mana yang paling tepat menjadi atribut kunci entitas Barang?',
        opsi: [
          { id: 'kode_barang', label: '<code>kode_barang</code>' },
          { id: 'nama_barang', label: '<code>nama_barang</code>' },
          { id: 'kategori', label: '<code>kategori</code>' },
          { id: 'harga_jual', label: '<code>harga_jual</code>' },
          { id: 'stok', label: '<code>stok</code>' },
        ],
        correct: 'kode_barang',
        umpan: {
          kode_barang: 'Benar. Setiap barang punya kode yang berbeda.',
          nama_barang:
            'Nama bisa mirip atau berubah (misalnya ganti ukuran). Kode lebih pasti unik.',
          kategori: 'Banyak barang berada dalam kategori yang sama.',
          harga_jual: 'Dua barang bisa berharga sama, dan harga bisa berubah.',
          stok: 'Stok berubah setiap ada penjualan — tidak cocok menjadi pembeda.',
        },
      },
      {
        id: 'kunci-pemasok',
        entitas: 'pemasok',
        tanya: 'Atribut mana yang paling tepat menjadi atribut kunci entitas Pemasok?',
        opsi: [
          { id: 'id_pemasok', label: '<code>id_pemasok</code>' },
          { id: 'nama_pemasok', label: '<code>nama_pemasok</code>' },
          { id: 'alamat_pemasok', label: '<code>alamat_pemasok</code>' },
          { id: 'no_telp_pemasok', label: '<code>no_telp_pemasok</code>' },
        ],
        correct: 'id_pemasok',
        umpan: {
          id_pemasok: 'Tepat. id_pemasok dibuat unik untuk setiap pemasok.',
          nama_pemasok: 'Dua toko bisa bernama sama, misalnya "Toko Jaya".',
          alamat_pemasok:
            'Alamat bisa pindah, dan beberapa pemasok bisa berada di gedung yang sama.',
          no_telp_pemasok: 'Nomor telepon bisa berganti. Kunci sebaiknya tidak berubah.',
        },
      },
      {
        id: 'kunci-penjualan',
        entitas: 'penjualan',
        tanya: 'Atribut mana yang paling tepat menjadi atribut kunci entitas Penjualan?',
        opsi: [
          { id: 'no_nota', label: '<code>no_nota</code>' },
          { id: 'tanggal', label: '<code>tanggal</code>' },
          { id: 'jumlah_beli', label: '<code>jumlah_beli</code>' },
          { id: 'metode_bayar', label: '<code>metode_bayar</code>' },
        ],
        correct: 'no_nota',
        umpan: {
          no_nota: 'Benar. Setiap penjualan punya nomor nota yang berbeda.',
          tanggal: 'Dalam satu hari bisa terjadi banyak penjualan.',
          jumlah_beli: 'Banyak penjualan bisa berjumlah sama.',
          metode_bayar: 'Hanya ada sedikit pilihan metode bayar; pasti banyak yang sama.',
        },
      },
    ],
    guru: 'Setelah murid selesai, bandingkan rancangan beberapa murid di depan kelas. Catatan: hubungan Penjualan dengan Anggota dan Barang (foreign key) dibahas pada materi 1.4 — di sini cukup fokus pada atribut milik tiap entitas.',
  },

  /* ==========================================================
     SINTAKS 5 — Pembuktian
     Kunci tiap kasus diuji otomatis terhadap rancangan (tes
     cakupanKebutuhan): 'bisa' → semua atribut `perlu` ada di
     rancangan; 'hitung' → ada dan `turunan: true`; 'tambah' →
     ada atribut yang belum ada di rancangan.
     ========================================================== */
  pembuktian: {
    kicker: 'Tahap 7 · Uji Rancangan',
    title: 'Apakah Rancanganmu Menjawab Kebutuhan?',
    goal: 'Menguji rancangan entitas–atribut terhadap kebutuhan pengguna.',
    pengantar:
      'Rancangan yang baik harus mampu memenuhi kebutuhan pengguna. Bu Sari mengajukan beberapa permintaan. ' +
      'Untuk setiap permintaan, tentukan apakah rancangan di atas sudah bisa memenuhinya.',
    kategori: [
      { id: 'bisa', label: '✅ Bisa dipenuhi dengan atribut yang ada' },
      { id: 'hitung', label: '🧮 Bisa dihitung dari atribut yang ada' },
      { id: 'tambah', label: '➕ Perlu atribut baru' },
    ],
    kasus: [
      {
        id: 'p1',
        teks: 'Melihat daftar barang beserta harga jual dan sisa stoknya.',
        perlu: ['nama_barang', 'harga_jual', 'stok'],
        correct: 'bisa',
        explanation: 'Barang sudah punya nama_barang, harga_jual, dan stok.',
      },
      {
        id: 'p2',
        teks: 'Menghubungi anggota lewat WhatsApp.',
        perlu: ['nama_anggota', 'no_hp'],
        correct: 'bisa',
        explanation:
          'Anggota sudah punya no_hp — dan karena disimpan sekali, nomornya tidak lagi berbeda-beda.',
      },
      {
        id: 'p3',
        teks: 'Menghubungi pemasok saat barang hampir habis.',
        perlu: ['nama_pemasok', 'no_telp_pemasok', 'stok'],
        correct: 'bisa',
        explanation: 'Keluhan Bu Sari di awal kini terjawab: ada stok dan data pemasok.',
      },
      {
        id: 'p4',
        teks: 'Menampilkan total harga pada setiap nota.',
        perlu: ['harga_jual', 'jumlah_beli'],
        turunan: true,
        correct: 'hitung',
        explanation:
          'Total = harga_jual × jumlah_beli. Cukup dihitung, tidak perlu disimpan (hubungan nota dengan barangnya dibahas di materi 1.4).',
      },
      {
        id: 'p5',
        teks: 'Mengetahui banyaknya anggota di setiap kelas.',
        perlu: ['kelas'],
        turunan: true,
        correct: 'hitung',
        explanation: 'Cukup hitung anggota yang kelasnya sama.',
      },
      {
        id: 'p6',
        teks: 'Peringatan otomatis saat stok di bawah batas minimum yang berbeda untuk tiap barang.',
        perlu: ['stok', 'stok_minimum'],
        correct: 'tambah',
        explanation:
          'Batas minimum tiap barang belum tercatat. Tambahkan atribut stok_minimum pada Barang.',
      },
      {
        id: 'p7',
        teks: 'Mengirim ucapan selamat ulang tahun kepada anggota.',
        perlu: ['nama_anggota', 'tanggal_lahir'],
        correct: 'tambah',
        explanation:
          'Perlu atribut tanggal_lahir pada Anggota. Simpan tanggal lahir, bukan umur — umur dapat dihitung dari tanggal lahir.',
      },
      {
        id: 'p8',
        teks: 'Mengetahui keuntungan tiap barang (selisih harga jual dan harga beli).',
        perlu: ['harga_jual', 'harga_beli'],
        correct: 'tambah',
        explanation:
          'Harga beli dari pemasok belum tercatat. Setelah harga_beli ditambahkan, keuntungannya cukup dihitung.',
      },
    ],
    kesimpulan:
      'Hipotesismu terbukti: setelah data dikelompokkan menjadi entitas beserta atributnya, data tidak lagi ditulis berulang. ' +
      'Pengujian juga menunjukkan bahwa analisis kebutuhan adalah proses <strong>berulang</strong> — kebutuhan baru bisa menambah atribut.',
    guru: 'Tekankan dua temuan: (1) nilai turunan tidak disimpan, (2) kebutuhan baru dapat menambah atribut. Kaitkan kembali dengan hipotesis yang ditulis di papan pada tahap Rumusan Masalah.',
  },

  /* ==========================================================
     SINTAKS 6 — Generalisasi
     ========================================================== */
  simpulan: {
    kicker: 'Tahap 8 · Kesimpulan',
    title: 'Langkah Menganalisis Kebutuhan Data',
    goal: 'Menyimpulkan langkah analisis kebutuhan data dan konsep entitas–atribut.',
    pengantar:
      'Lihat kembali apa yang sudah kamu lakukan dari tahap 4 sampai 7. Susun langkah-langkahnya menjadi urutan kerja seorang analis.',
    langkah: [
      { id: 'l1', label: 'Kumpulkan dokumen kebutuhan (wawancara, catatan, dokumen lama)' },
      { id: 'l2', label: 'Tandai frasa yang menyebut informasi penting' },
      { id: 'l3', label: 'Saring: buang proses, nilai turunan, dan yang tidak relevan' },
      { id: 'l4', label: 'Kelompokkan data menjadi entitas beserta atributnya' },
      { id: 'l5', label: 'Tentukan atribut kunci setiap entitas' },
      { id: 'l6', label: 'Uji rancangan terhadap kebutuhan pengguna' },
    ],
    urutan: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'],
    pertanyaan: [
      {
        id: 'g1',
        tanya:
          'Lengkapi: "Sebuah informasi <strong>tidak</strong> perlu disimpan sebagai atribut bila …"',
        opsi: [
          { id: 'a', label: 'nilainya dapat dihitung dari data lain atau berupa kegiatan sistem.' },
          { id: 'b', label: 'nilainya berupa angka.' },
          { id: 'c', label: 'informasi itu disebut oleh pengguna.' },
          { id: 'd', label: 'namanya lebih dari satu kata.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Tepat — seperti total belanja (turunan) dan mencetak struk (proses).',
          b: 'Harga jual dan stok berupa angka, tetapi tetap perlu disimpan.',
          c: 'Justru informasi dari pengguna adalah sumber utama analisis; yang perlu disaring adalah jenisnya.',
          d: 'Panjang nama tidak berpengaruh.',
        },
      },
      {
        id: 'g2',
        tanya: 'Lengkapi: "Atribut kunci dipilih karena …"',
        opsi: [
          {
            id: 'a',
            label:
              'nilainya unik untuk setiap data sehingga dapat membedakan data satu dengan lainnya.',
          },
          { id: 'b', label: 'nilainya paling sering berubah.' },
          { id: 'c', label: 'letaknya selalu di kolom pertama.' },
          { id: 'd', label: 'paling mudah diingat oleh pengguna.' },
        ],
        correct: 'a',
        umpan: {
          a: 'Benar. Keunikan adalah syarat utama atribut kunci.',
          b: 'Kunci justru sebaiknya tidak berubah, seperti kode_barang.',
          c: 'Letak kolom tidak menentukan; keunikannya yang menentukan.',
          d: 'Nama mudah diingat tetapi bisa kembar.',
        },
      },
    ],
    rangkuman: [
      '<strong>Entitas</strong>: objek (orang, benda, tempat, kejadian) yang datanya perlu disimpan dan setiap anggotanya dapat dibedakan — misalnya Anggota, Barang, Pemasok, Penjualan.',
      '<strong>Atribut</strong>: ciri/keterangan yang melekat pada entitas — misalnya nama_barang, harga_jual, stok pada Barang.',
      '<strong>Atribut kunci</strong>: atribut yang nilainya unik untuk membedakan setiap data — misalnya kode_barang.',
      '<strong>Analisis kebutuhan data</strong> menyaring informasi dari pengguna: proses dan nilai turunan tidak disimpan, kebutuhan baru dapat menambah atribut.',
    ],
    guru: 'Minta beberapa murid membacakan urutan langkahnya dan alasan tiap langkah. Bandingkan rangkuman dengan definisi yang murid tulis sendiri di tahap 5.',
  },

  /* ==========================================================
     PENERAPAN — kasus baru
     ========================================================== */
  terapkan: {
    kicker: 'Tahap 9 · Uji Terap',
    title: 'Kasus Baru: Servis Laptop Teaching Factory',
    goal: 'Menerapkan langkah analisis kebutuhan data pada studi kasus baru.',
    kasus: {
      judul: 'Wawancara dengan Pak Andi (koordinator teaching factory RPL)',
      teks:
        '"Teaching factory kita membuka layanan servis laptop. Setiap pelanggan yang datang kami beri ID, lalu kami catat nama dan nomor HP-nya. ' +
        'Laptop yang diservis kami catat nomor seri, merek, dan keluhannya. Setiap servis punya nomor tiket, tanggal masuk, biaya, dan status pengerjaan. ' +
        'Servis dikerjakan oleh siswa teknisi — kami catat NIS, nama, dan kelasnya. Oh ya, aplikasinya juga harus bisa mengirim notifikasi saat laptop selesai ' +
        'dan menampilkan total pendapatan bulan ini. Ruang tunggunya nanti juga kami beri AC."',
    },
    kandidat: {
      tanya: 'Langkah 1 — Mana saja yang merupakan <strong>entitas</strong> pada kasus ini?',
      opsi: [
        {
          id: 'pelanggan',
          benar: true,
          label: 'Pelanggan',
          alasan: 'Banyak pelanggan, masing-masing punya ID, nama, dan nomor HP.',
        },
        {
          id: 'laptop',
          benar: true,
          label: 'Laptop',
          alasan: 'Setiap laptop dicatat nomor seri, merek, dan keluhannya.',
        },
        {
          id: 'servis',
          benar: true,
          label: 'Servis',
          alasan: 'Kejadian servis dicatat dengan nomor tiket, tanggal, biaya, dan status.',
        },
        {
          id: 'teknisi',
          benar: true,
          label: 'Teknisi',
          alasan: 'Setiap siswa teknisi dicatat NIS, nama, dan kelasnya.',
        },
        {
          id: 'notifikasi',
          benar: false,
          label: 'Mengirim notifikasi',
          alasan: 'Itu proses/kegiatan sistem, bukan entitas.',
        },
        {
          id: 'pendapatan',
          benar: false,
          label: 'Total pendapatan bulan ini',
          alasan: 'Nilai turunan: dihitung dari biaya setiap servis.',
        },
        {
          id: 'ruang',
          benar: false,
          label: 'Ruang tunggu ber-AC',
          alasan: 'Tidak ada data ruang tunggu yang perlu dikelola aplikasi.',
        },
      ],
      done: '<strong>Tepat!</strong> Empat entitas ditemukan: Pelanggan, Laptop, Servis, dan Teknisi.',
    },
    entitas: [
      { id: 'pelanggan', label: 'Pelanggan', ikon: '🙋', kunci: 'id_pelanggan' },
      { id: 'laptop', label: 'Laptop', ikon: '💻', kunci: 'no_seri' },
      { id: 'servis', label: 'Servis', ikon: '🛠️', kunci: 'no_tiket' },
      { id: 'teknisi', label: 'Teknisi', ikon: '🧑‍🔧', kunci: 'nis' },
    ],
    atribut: [
      {
        id: 'id_pelanggan',
        teks: 'id_pelanggan',
        correct: 'pelanggan',
        explanation: 'ID yang diberikan untuk tiap pelanggan.',
      },
      {
        id: 'nama_pelanggan',
        teks: 'nama_pelanggan',
        correct: 'pelanggan',
        explanation: 'Nama menerangkan pelanggan.',
      },
      {
        id: 'no_hp_pelanggan',
        teks: 'no_hp_pelanggan',
        correct: 'pelanggan',
        explanation: 'Dipakai untuk menghubungi pelanggan.',
      },
      {
        id: 'no_seri',
        teks: 'no_seri',
        correct: 'laptop',
        explanation: 'Nomor seri melekat pada laptopnya.',
      },
      {
        id: 'merek',
        teks: 'merek',
        correct: 'laptop',
        explanation: 'Merek adalah keterangan laptop.',
      },
      {
        id: 'keluhan',
        teks: 'keluhan',
        correct: 'laptop',
        explanation: 'Keluhan dicatat untuk laptop yang dibawa.',
      },
      {
        id: 'no_tiket',
        teks: 'no_tiket',
        correct: 'servis',
        explanation: 'Setiap servis punya nomor tiket.',
      },
      {
        id: 'tanggal_masuk',
        teks: 'tanggal_masuk',
        correct: 'servis',
        explanation: 'Tanggal masuk menerangkan kejadian servis.',
      },
      {
        id: 'biaya',
        teks: 'biaya',
        correct: 'servis',
        explanation: 'Biaya ditentukan per servis.',
      },
      {
        id: 'status',
        teks: 'status',
        correct: 'servis',
        explanation: 'Status (antre, dikerjakan, selesai) milik setiap servis.',
      },
      {
        id: 'nis',
        teks: 'nis',
        correct: 'teknisi',
        explanation: 'NIS adalah nomor induk siswa teknisi.',
      },
      {
        id: 'nama_teknisi',
        teks: 'nama_teknisi',
        correct: 'teknisi',
        explanation: 'Nama menerangkan teknisinya.',
      },
      {
        id: 'kelas_teknisi',
        teks: 'kelas_teknisi',
        correct: 'teknisi',
        explanation: 'Kelas adalah keterangan teknisi.',
      },
    ],
    kunci: {
      id: 'kunci-servis',
      entitas: 'servis',
      tanya:
        'Langkah 3 — Atribut mana yang paling tepat menjadi atribut kunci entitas <strong>Servis</strong>?',
      opsi: [
        { id: 'no_tiket', label: '<code>no_tiket</code>' },
        { id: 'tanggal_masuk', label: '<code>tanggal_masuk</code>' },
        { id: 'biaya', label: '<code>biaya</code>' },
        { id: 'status', label: '<code>status</code>' },
      ],
      correct: 'no_tiket',
      umpan: {
        no_tiket: 'Tepat. Setiap servis mendapat nomor tiket yang berbeda.',
        tanggal_masuk: 'Banyak laptop bisa masuk pada tanggal yang sama.',
        biaya: 'Dua servis bisa berbiaya sama.',
        status: 'Status hanya punya beberapa nilai dan terus berubah.',
      },
    },
    guru: 'Uji terap dikerjakan mandiri. Pantau murid yang masih memasukkan proses atau nilai turunan sebagai entitas, lalu ajak mereka kembali ke langkah "saring" pada tahap Kesimpulan.',
  },

  /* ==========================================================
     REFLEKSI
     ========================================================== */
  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Seberapa Yakin Kamu?',
    goal: 'Menilai pemahaman diri terhadap setiap kriteria tujuan belajar.',
    skala: [
      { value: 1, label: 'Belum bisa' },
      { value: 2, label: 'Masih ragu' },
      { value: 3, label: 'Cukup bisa' },
      { value: 4, label: 'Bisa' },
      { value: 5, label: 'Bisa menjelaskan ke teman' },
    ],
    pernyataan: [
      {
        id: 'r1',
        teks: 'Saya dapat memilah informasi dokumen kebutuhan: data, proses, nilai turunan, dan yang tidak relevan.',
      },
      { id: 'r2', teks: 'Saya dapat mengidentifikasi entitas dari hasil analisis kebutuhan data.' },
      {
        id: 'r3',
        teks: 'Saya dapat mengelompokkan atribut ke entitasnya dan menentukan atribut kunci.',
      },
      {
        id: 'r4',
        teks: 'Saya dapat menguji rancangan entitas–atribut terhadap kebutuhan pengguna.',
      },
    ],
    tanyaTerbuka:
      'Bagian mana yang paling menantang hari ini, dan apa yang akan kamu lakukan untuk menguasainya?',
    guru: 'Gunakan hasil skala untuk menentukan murid yang perlu pendampingan sebelum materi 1.2. Jawaban terbuka dapat dibacakan secara sukarela.',
  },

  /* ==========================================================
     PENUTUP
     ========================================================== */
  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Kerja Bagus, Analis!',
    goal: 'Melihat hasil belajar dan rancangan yang sudah kamu susun.',
    pesan:
      'Kamu sudah menganalisis kebutuhan data KopSis dan menemukan sendiri konsep entitas, atribut, dan atribut kunci. ' +
      'Di materi berikutnya kamu akan berlatih teknik menggali kebutuhan (wawancara, observasi, kuesioner) dengan lebih mendalam.',
  },
};

'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Semua narasi, kandidat, feedback, dan data simulasi ada di sini.
   Pisahkan dari app.js agar mudah dikustomisasi guru.
   ============================================================ */

const DATA = {

  meta: {
    title: 'Entitas, Atribut & Primary Key',
    subject: 'Rekayasa Perangkat Lunak — Fase F',
    goal: 'Menganalisis Entitas, Atribut, dan Primary Key Kebutuhan Sistem'
  },

  /* ----------------------------------------------------------
     TAHAP 2 — Narasi SRS & Klasifikasi
     ---------------------------------------------------------- */
  srs: {
    title: 'Narasi Spesifikasi Kebutuhan Sistem — Perpustakaan Sekolah',
    instruction: 'Baca narasi berikut. Kata/frasa yang dicetak tebal dan bergaris bawah adalah kandidat yang perlu kamu klasifikasikan di bawah.',
    /* Gunakan {ID|teks tampil} sebagai penanda kandidat */
    paragraphs: [
      'Sistem informasi {anggota|anggota perpustakaan} digunakan untuk mengelola data keanggotaan dan proses peminjaman buku.',
      'Setiap {anggota|anggota perpustakaan} memiliki {nomor_anggota|nomor anggota}, {nama_anggota|nama anggota}, {kelas|kelas}, dan {tanggal_bergabung|tanggal bergabung}.',
      'Anggota dapat meminjam {buku|buku} yang tersedia. Setiap {buku|buku} memiliki {kode_buku|kode buku}, {judul_buku|judul buku}, {pengarang|nama pengarang}, {penerbit|penerbit}, dan {tahun_terbit|tahun terbit}.',
      'Ketika anggota meminjam buku, sistem mencatat {peminjaman|transaksi peminjaman} yang memiliki {nomor_peminjaman|nomor peminjaman}, {tanggal_pinjam|tanggal pinjam}, dan {tanggal_kembali|tanggal harus kembali}.',
      'Petugas perpustakaan bertanggung jawab mencatat pengembalian dan memperbarui status buku.'
    ],
    candidates: [
      {
        id: 'anggota', label: 'anggota perpustakaan', correct: 'entitas',
        feedback: {
          entitas: 'Tepat! "Anggota perpustakaan" adalah objek utama yang perlu dikelola datanya secara terstruktur. Karena memiliki banyak karakteristik sendiri (nomor, nama, kelas, dll.), ini layak disebut <strong>entitas</strong>.',
          atribut: 'Kurang tepat. "Anggota perpustakaan" bukan sekadar karakteristik dari objek lain — justru objek inilah yang <em>memiliki</em> banyak atribut. Bandingkan: "nama anggota" adalah keterangan <em>tentang</em> anggota (atribut), sedangkan "anggota" sendiri adalah objek yang dideskripsikan (entitas).',
          bukan: 'Kurang tepat. Sistem perpustakaan perlu menyimpan dan mengelola data setiap anggota. Ini adalah objek utama yang penting dalam sistem.'
        }
      },
      {
        id: 'nomor_anggota', label: 'nomor anggota', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Nomor anggota" bukan objek utama — ini adalah karakteristik yang melekat pada Anggota. Pertanyaan panduan: "nomor anggota dari siapa?" → dari Anggota. Itu berarti ia adalah atribut.',
          atribut: 'Tepat! "Nomor anggota" adalah atribut dari entitas Anggota. Catatan: karena setiap anggota memiliki nomor berbeda dan tidak berubah, ini adalah kandidat primary key yang sangat baik.',
          bukan: 'Kurang tepat. Nomor anggota adalah informasi penting yang harus dicatat untuk setiap anggota — ia adalah atribut.'
        }
      },
      {
        id: 'nama_anggota', label: 'nama anggota', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Nama anggota" adalah keterangan tentang anggota, bukan objek tersendiri.',
          atribut: 'Tepat! "Nama anggota" adalah atribut dari entitas Anggota. Catatan penting: nama dapat berulang (dua siswa bisa bernama sama), sehingga <strong>kurang tepat dijadikan primary key</strong>.',
          bukan: 'Kurang tepat. Nama adalah informasi yang wajib dicatat untuk setiap anggota — ia adalah atribut.'
        }
      },
      {
        id: 'kelas', label: 'kelas', correct: 'atribut',
        feedback: {
          entitas: 'Dalam konteks sistem perpustakaan sederhana ini, "kelas" hanyalah informasi tambahan tentang anggota — cukup sebagai atribut. Di sistem yang lebih kompleks (seperti sistem akademik), kelas bisa menjadi entitas tersendiri. Ini menunjukkan bahwa klasifikasi bergantung pada cakupan sistem.',
          atribut: 'Tepat! Dalam konteks ini, "kelas" adalah atribut dari Anggota. Perhatikan: nilai kelas berubah setiap tahun ajaran, sehingga tidak stabil sebagai primary key.',
          bukan: 'Kurang tepat. Kelas adalah informasi relevan yang perlu dicatat untuk setiap anggota.'
        }
      },
      {
        id: 'tanggal_bergabung', label: 'tanggal bergabung', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Tanggal bergabung" adalah informasi waktu, bukan objek utama.',
          atribut: 'Tepat! "Tanggal bergabung" adalah atribut dari Anggota yang mencatat kapan anggota mendaftar. Banyak anggota bisa bergabung di tanggal yang sama, sehingga tidak tepat sebagai primary key.',
          bukan: 'Kurang tepat. Tanggal bergabung adalah informasi yang perlu dicatat untuk setiap anggota.'
        }
      },
      {
        id: 'buku', label: 'buku', correct: 'entitas',
        feedback: {
          entitas: 'Tepat! "Buku" adalah entitas kedua dalam sistem ini. Sistem perlu menyimpan data terstruktur tentang setiap buku yang dimiliki perpustakaan.',
          atribut: 'Kurang tepat. "Buku" memiliki banyak karakteristik sendiri (kode, judul, pengarang, dll.) — ia adalah objek utama (entitas), bukan keterangan dari objek lain.',
          bukan: 'Kurang tepat. Buku adalah objek utama yang harus dikelola dalam sistem perpustakaan.'
        }
      },
      {
        id: 'kode_buku', label: 'kode buku', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Kode buku" adalah keterangan tentang buku, bukan objek tersendiri.',
          atribut: 'Tepat! "Kode buku" adalah atribut dari entitas Buku. Karena setiap buku memiliki kode unik yang tidak berubah, ini adalah kandidat primary key yang ideal.',
          bukan: 'Kurang tepat. Kode buku adalah informasi penting yang harus dicatat untuk setiap buku.'
        }
      },
      {
        id: 'judul_buku', label: 'judul buku', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Judul buku" adalah keterangan tentang buku, bukan objek tersendiri.',
          atribut: 'Tepat! "Judul buku" adalah atribut dari entitas Buku. Catatan: buku berbeda bisa memiliki judul serupa (edisi, terjemahan), sehingga judul kurang tepat sebagai primary key.',
          bukan: 'Kurang tepat. Judul buku adalah informasi penting yang harus dicatat.'
        }
      },
      {
        id: 'peminjaman', label: 'transaksi peminjaman', correct: 'entitas',
        feedback: {
          entitas: 'Tepat! "Peminjaman" adalah entitas karena merepresentasikan sebuah kejadian (transaksi) yang perlu dicatat. <strong>Entitas tidak harus berupa benda fisik</strong> — transaksi dan kejadian bisnis juga bisa menjadi entitas.',
          atribut: 'Kurang tepat. "Peminjaman" adalah objek yang mencatat relasi antara anggota dan buku — ia berdiri sendiri sebagai entitas, bukan sekadar keterangan dari objek lain.',
          bukan: 'Kurang tepat. Setiap transaksi peminjaman perlu dicatat dan dilacak. Ini adalah entitas penting dalam sistem.'
        }
      },
      {
        id: 'nomor_peminjaman', label: 'nomor peminjaman', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Nomor peminjaman" adalah keterangan tentang transaksi, bukan objek tersendiri.',
          atribut: 'Tepat! "Nomor peminjaman" adalah atribut dari entitas Peminjaman. Setiap transaksi memiliki nomor unik, sehingga ini adalah kandidat primary key yang baik.',
          bukan: 'Kurang tepat. Nomor peminjaman adalah informasi penting yang harus ada dalam setiap transaksi.'
        }
      },
      {
        id: 'tanggal_pinjam', label: 'tanggal pinjam', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. "Tanggal pinjam" adalah informasi waktu, bukan objek tersendiri.',
          atribut: 'Tepat! "Tanggal pinjam" adalah atribut dari entitas Peminjaman. Banyak transaksi bisa terjadi di tanggal yang sama, sehingga tanggal tidak tepat sebagai primary key.',
          bukan: 'Kurang tepat. Tanggal pinjam adalah informasi yang wajib dicatat dalam setiap transaksi.'
        }
      },
      {
        id: 'tanggal_kembali', label: 'tanggal harus kembali', correct: 'atribut',
        feedback: {
          entitas: 'Kurang tepat. Tanggal harus kembali adalah informasi waktu, bukan objek tersendiri.',
          atribut: 'Tepat! "Tanggal harus kembali" adalah atribut dari entitas Peminjaman yang menentukan batas waktu pengembalian buku.',
          bukan: 'Kurang tepat. Tanggal harus kembali adalah informasi penting dalam setiap transaksi peminjaman.'
        }
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 3 — Peta Entitas–Atribut
     ---------------------------------------------------------- */
  mapping: {
    instruction: 'Klik sebuah atribut untuk memilihnya, lalu klik kolom entitas yang sesuai untuk menempatkannya. Klik atribut yang sudah ditempatkan untuk mengembalikannya ke daftar.',
    entities: [
      { id: 'anggota', label: 'Anggota', colorKey: 'blue' },
      { id: 'buku', label: 'Buku', colorKey: 'green' },
      { id: 'peminjaman', label: 'Peminjaman', colorKey: 'orange' }
    ],
    attributes: [
      { id: 'nomor_anggota', label: 'nomor_anggota', entityId: 'anggota' },
      { id: 'nama_anggota', label: 'nama_anggota', entityId: 'anggota' },
      { id: 'kelas', label: 'kelas', entityId: 'anggota' },
      { id: 'tanggal_bergabung', label: 'tanggal_bergabung', entityId: 'anggota' },
      { id: 'kode_buku', label: 'kode_buku', entityId: 'buku' },
      { id: 'judul_buku', label: 'judul_buku', entityId: 'buku' },
      { id: 'pengarang', label: 'pengarang', entityId: 'buku' },
      { id: 'penerbit', label: 'penerbit', entityId: 'buku' },
      { id: 'tahun_terbit', label: 'tahun_terbit', entityId: 'buku' },
      { id: 'nomor_peminjaman', label: 'nomor_peminjaman', entityId: 'peminjaman' },
      { id: 'tanggal_pinjam', label: 'tanggal_pinjam', entityId: 'peminjaman' },
      { id: 'tanggal_kembali', label: 'tanggal_kembali', entityId: 'peminjaman' }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 4 — Primary Key Challenge
     ---------------------------------------------------------- */
  pkChallenges: [
    {
      id: 'anggota_pk',
      entityName: 'Anggota',
      context: 'Dalam tabel Anggota, setiap baris mewakili satu orang anggota perpustakaan yang terdaftar.',
      attributes: [
        { id: 'nomor_anggota', label: 'nomor_anggota', note: 'Nomor unik yang ditetapkan sistem' },
        { id: 'nama_anggota', label: 'nama_anggota', note: 'Nama lengkap anggota' },
        { id: 'kelas', label: 'kelas', note: 'Kelas saat ini (misal: XI RPL 1)' },
        { id: 'tanggal_bergabung', label: 'tanggal_bergabung', note: 'Tanggal mendaftar sebagai anggota' }
      ],
      correctPK: 'nomor_anggota',
      reasoningOptions: [
        { id: 'ra1', label: 'Nilainya dijamin unik untuk setiap anggota karena ditetapkan oleh sistem.', isGood: true },
        { id: 'ra2', label: 'Nilainya tidak akan berubah selama anggota masih aktif (stabil).', isGood: true },
        { id: 'ra3', label: 'Ia adalah kolom pertama dalam tabel sehingga paling penting.', isGood: false },
        { id: 'ra4', label: 'Nama anggota lebih mudah diingat dan dikenali manusia.', isGood: false }
      ],
      feedbackMap: {
        nomor_anggota: {
          goodReason: 'Pilihan PK dan alasan kamu sudah tepat! nomor_anggota memenuhi semua kriteria: unik, stabil, tidak null, dan dapat mengidentifikasi satu record secara tepat.',
          poorReason: 'Pilihan PK kamu tepat (nomor_anggota), tetapi alasannya perlu diperbaiki. Primary key dipilih bukan karena posisinya dalam tabel atau kemudahan mengingat, melainkan karena keunikan dan kestabilan nilainya dalam mengidentifikasi setiap record.'
        },
        nama_anggota: 'Nama anggota tidak ideal sebagai primary key. Ada kemungkinan dua anggota memiliki nama yang sama (misal: dua siswa bernama "Budi Santoso"). Primary key harus benar-benar unik — tidak boleh ada dua record dengan nilai PK yang sama.',
        kelas: 'Kelas tidak bisa menjadi primary key karena satu kelas dimiliki oleh banyak anggota, artinya nilainya pasti berulang. Selain itu, kelas seorang siswa berubah setiap tahun ajaran — ini melanggar syarat kestabilan PK.',
        tanggal_bergabung: 'Tanggal bergabung tidak ideal sebagai primary key. Banyak anggota bisa mendaftar di tanggal yang sama. Nilai yang berulang berarti tidak memenuhi syarat keunikan. Selain itu, jika ada kesalahan input dan tanggal dikoreksi, mengubah PK bisa merusak relasi data di seluruh sistem.'
      }
    },
    {
      id: 'buku_pk',
      entityName: 'Buku',
      context: 'Dalam tabel Buku, setiap baris mewakili satu judul buku yang tersedia di perpustakaan.',
      attributes: [
        { id: 'kode_buku', label: 'kode_buku', note: 'Kode unik yang ditetapkan sistem perpustakaan' },
        { id: 'judul_buku', label: 'judul_buku', note: 'Judul lengkap buku' },
        { id: 'pengarang', label: 'pengarang', note: 'Nama penulis atau pengarang buku' },
        { id: 'tahun_terbit', label: 'tahun_terbit', note: 'Tahun buku pertama diterbitkan' }
      ],
      correctPK: 'kode_buku',
      reasoningOptions: [
        { id: 'rb1', label: 'Setiap buku memiliki kode yang berbeda — dijamin unik oleh sistem.', isGood: true },
        { id: 'rb2', label: 'Kode buku tidak berubah meskipun data lain diperbarui (stabil).', isGood: true },
        { id: 'rb3', label: 'Judul buku sudah cukup karena setiap buku punya judul berbeda.', isGood: false },
        { id: 'rb4', label: 'Kode buku efisien digunakan sebagai referensi (foreign key) di tabel lain.', isGood: true }
      ],
      feedbackMap: {
        kode_buku: {
          goodReason: 'Pilihan PK dan alasan kamu sudah tepat! kode_buku unik, stabil, dan efisien digunakan sebagai referensi di tabel Peminjaman.',
          poorReason: 'Pilihan PK kamu tepat (kode_buku), tetapi perhatikan alasannya. PK yang baik dipilih karena keunikan, kestabilan, dan kemampuan identifikasi — bukan karena paling populer atau mudah dikenali.'
        },
        judul_buku: 'Judul buku tidak ideal sebagai primary key. Dua edisi atau cetakan buku yang berbeda bisa memiliki judul yang sama. Perpustakaan juga mungkin punya beberapa eksemplar buku berjudul sama yang perlu dibedakan satu sama lain.',
        pengarang: 'Pengarang tidak bisa menjadi primary key karena satu pengarang menulis banyak buku — nilai pengarang pasti berulang di banyak baris. Primary key harus dapat membedakan <em>setiap</em> record.',
        tahun_terbit: 'Tahun terbit tidak bisa menjadi primary key. Banyak buku diterbitkan pada tahun yang sama — nilai ini pasti berulang. Primary key harus unik untuk setiap baris, bukan hanya untuk sebagian baris.'
      }
    }
  ],

  /* ----------------------------------------------------------
     TAHAP 5 — Simulasi Keunikan
     ---------------------------------------------------------- */
  uniqueness: {
    title: 'Simulasi Keunikan Data',
    tableName: 'Tabel: Anggota',
    instruction: 'Klik tombol "Uji sebagai PK" di bawah nama kolom untuk melihat apakah kolom tersebut memenuhi syarat keunikan. Perhatikan baris mana yang memiliki nilai sama.',
    columns: [
      { id: 'nomor_anggota', label: 'nomor_anggota', hint: 'Nomor unik ditetapkan sistem' },
      { id: 'nama_anggota', label: 'nama_anggota', hint: 'Nama lengkap anggota' },
      { id: 'kelas', label: 'kelas', hint: 'Kelas saat ini' },
      { id: 'tanggal_lahir', label: 'tanggal_lahir', hint: 'Tanggal lahir anggota' }
    ],
    rows: [
      { nomor_anggota: 'A001', nama_anggota: 'Budi Santoso', kelas: 'XI RPL 1', tanggal_lahir: '15 Mar 2008' },
      { nomor_anggota: 'A002', nama_anggota: 'Siti Rahayu', kelas: 'XI RPL 1', tanggal_lahir: '22 Jul 2008' },
      { nomor_anggota: 'A003', nama_anggota: 'Budi Santoso', kelas: 'XI RPL 2', tanggal_lahir: '10 Mei 2008' },
      { nomor_anggota: 'A004', nama_anggota: 'Ahmad Fauzi', kelas: 'X RPL 1', tanggal_lahir: '30 Jan 2009' },
      { nomor_anggota: 'A005', nama_anggota: 'Dewi Lestari', kelas: 'XII RPL 1', tanggal_lahir: '8 Nov 2007' },
      { nomor_anggota: 'A006', nama_anggota: 'Rizky Pratama', kelas: 'X RPL 2', tanggal_lahir: '15 Mar 2009' },
      { nomor_anggota: 'A007', nama_anggota: 'Dewi Lestari', kelas: 'XI RPL 3', tanggal_lahir: '20 Sep 2008' },
      { nomor_anggota: 'A008', nama_anggota: 'Fani Kusuma', kelas: 'XII RPL 1', tanggal_lahir: '8 Nov 2007' }
    ],
    /* Daftar pasangan baris yang nilainya sama (0-based index) */
    duplicates: {
      nomor_anggota: [],
      nama_anggota: [[0, 2], [4, 6]],
      kelas: [[0, 1], [4, 7]],
      tanggal_lahir: [[4, 7]]
    },
    analysis: {
      nomor_anggota: {
        hasDuplicate: false,
        feedback: 'Tidak ditemukan duplikasi. Setiap nilai nomor_anggota berbeda dan unik — tidak ada dua baris dengan nilai yang sama. Kolom ini <strong>memenuhi syarat keunikan</strong> untuk primary key.',
        verdict: 'MEMENUHI syarat keunikan ✓'
      },
      nama_anggota: {
        hasDuplicate: true,
        feedback: '"Budi Santoso" muncul di baris A001 dan A003; "Dewi Lestari" muncul di baris A005 dan A007. Nilai yang sama berarti sistem tidak dapat membedakan satu anggota dari yang lain berdasarkan nama saja.',
        verdict: 'TIDAK memenuhi syarat keunikan ✗'
      },
      kelas: {
        hasDuplicate: true,
        feedback: '"XI RPL 1" muncul di A001 dan A002; "XII RPL 1" di A005 dan A008, dan masih banyak lagi. Wajar — satu kelas berisi banyak siswa. Nilai berulang = tidak bisa menjadi primary key.',
        verdict: 'TIDAK memenuhi syarat keunikan ✗'
      },
      tanggal_lahir: {
        hasDuplicate: true,
        feedback: '"8 Nov 2007" muncul di A005 dan A008. Dua orang yang berbeda bisa lahir di tanggal yang sama. Ini cukup membuktikan bahwa tanggal lahir tidak memenuhi syarat keunikan untuk primary key.',
        verdict: 'TIDAK memenuhi syarat keunikan ✗'
      }
    }
  },

  /* ----------------------------------------------------------
     TAHAP 6 — Studi Kasus
     ---------------------------------------------------------- */
  casestudies: {
    sewamobil: {
      id: 'sewamobil',
      title: 'Sewa Mobil Nusantara',
      icon: '🚗',
      narasi: [
        'PT Sewa Mobil Nusantara adalah perusahaan rental kendaraan yang melayani pelanggan perorangan maupun perusahaan.',
        'Setiap pelanggan yang ingin menyewa harus mendaftar terlebih dahulu. Data pelanggan yang dicatat meliputi: nomor KTP, nama lengkap, alamat, nomor telepon, dan tanggal lahir.',
        'Perusahaan memiliki armada kendaraan dari berbagai merek dan tipe. Setiap kendaraan memiliki: nomor polisi (plat nomor), merek, tipe, tahun pembuatan, warna, tarif sewa per hari, dan status ketersediaan.',
        'Ketika pelanggan menyewa kendaraan, sistem mencatat transaksi penyewaan: nomor sewa, tanggal mulai sewa, tanggal rencana kembali, tanggal aktual kembali, dan total biaya. Setiap transaksi menghubungkan satu pelanggan dengan satu kendaraan.',
        'Data karyawan yang melayani penyewaan juga dicatat: nomor karyawan, nama karyawan, dan jabatan.'
      ],
      minEntities: 3,
      hints: [
        'Kata benda yang disebut berkali-kali biasanya adalah entitas.',
        'Setiap kalimat "Setiap X memiliki Y, Z, W" menunjukkan bahwa X adalah entitas dengan Y, Z, W sebagai atributnya.',
        'Entitas dalam kasus ini meliputi: Pelanggan, Kendaraan, Penyewaan, dan bisa juga Karyawan.',
        'PK yang baik biasanya adalah nomor/kode unik yang ditetapkan oleh sistem atau lembaga berwenang.'
      ]
    },
    klinik: {
      id: 'klinik',
      title: 'Klinik Kesehatan Sehat Sejahtera',
      icon: '🏥',
      narasi: [
        'Klinik Kesehatan Sehat Sejahtera adalah fasilitas layanan kesehatan yang melayani pasien rawat jalan.',
        'Setiap pasien yang pertama kali berobat dibuatkan nomor rekam medis. Data pasien meliputi: nomor rekam medis, nama pasien, tanggal lahir, jenis kelamin, alamat, dan nomor telepon.',
        'Klinik memiliki beberapa dokter dengan jadwal berbeda. Data dokter meliputi: kode dokter, nama dokter, spesialisasi, dan nomor STR (Surat Tanda Registrasi Dokter).',
        'Setiap kunjungan pasien dicatat: nomor kunjungan, tanggal kunjungan, keluhan utama, diagnosa, dan tindakan yang diberikan. Setiap kunjungan terkait dengan satu pasien dan satu dokter pemeriksa.',
        'Obat yang diresepkan dalam setiap kunjungan dicatat: kode obat, nama obat, satuan, dan kategori. Satu kunjungan bisa menghasilkan lebih dari satu resep obat.'
      ],
      minEntities: 3,
      hints: [
        'Perhatikan kata benda yang muncul sebagai subjek kalimat: Pasien, Dokter, Kunjungan, Obat.',
        'Entitas adalah objek yang "punya data tersendiri" dan perlu dikelola secara terstruktur.',
        'Entitas dalam kasus ini meliputi: Pasien, Dokter, Kunjungan, dan bisa juga Obat.',
        'Nomor/kode yang "ditetapkan sistem" biasanya adalah kandidat primary key terbaik.'
      ]
    }
  },

  /* ----------------------------------------------------------
     TAHAP 8 — Peer-Review Checklist
     ---------------------------------------------------------- */
  peerReview: {
    intro: 'Gunakan checklist ini untuk memeriksa kualitas analisis — misalnya hasil analisis kelompok lain. Peer-review sesungguhnya tetap dilakukan antarkelompok di kelas, dipandu guru.',
    items: [
      {
        id: 'pr1',
        question: 'Apakah setiap PK yang dipilih bersifat unik (tidak ada dua record dengan nilai PK yang sama)?',
        hint: 'Bayangkan jika ada dua baris dengan nilai PK yang sama — bisakah sistem membedakan keduanya?'
      },
      {
        id: 'pr2',
        question: 'Apakah satu nilai PK dapat mengidentifikasi tepat satu record (bukan dua atau lebih)?',
        hint: 'PK harus bersifat 1-to-1: satu nilai PK → satu baris data.'
      },
      {
        id: 'pr3',
        question: 'Apakah PK yang dipilih bersifat stabil (nilainya tidak mudah berubah)?',
        hint: 'Jika PK berubah, semua referensi ke data tersebut harus ikut diperbarui — ini berisiko.'
      },
      {
        id: 'pr4',
        question: 'Apakah semua entitas yang diidentifikasi benar-benar memerlukan pengelolaan data tersendiri dalam sistem?',
        hint: 'Tanyakan: apakah objek ini perlu punya "tabel sendiri" dalam database?'
      },
      {
        id: 'pr5',
        question: 'Apakah tidak ada atribut yang seharusnya menjadi entitas (atau sebaliknya)?',
        hint: 'Atribut yang memiliki banyak sub-informasi mungkin lebih tepat dijadikan entitas tersendiri.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 10 — Refleksi
     ---------------------------------------------------------- */
  reflection: {
    questions: [
      {
        id: 'r1',
        question: 'Mengapa atribut seperti Nama_Murid atau Tanggal_Lahir tidak ideal dijadikan sebagai primary key?',
        placeholder: 'Tuliskan penjelasanmu di sini...',
        guidance: 'Petunjuk: Pikirkan tentang kemungkinan duplikasi, kestabilan nilai, dan kemampuan membedakan satu record dari yang lain.'
      },
      {
        id: 'r2',
        question: 'Bagian mana yang paling sulit ketika membedakan entitas dan atribut dari narasi sistem?',
        placeholder: 'Ceritakan pengalamanmu di sini...',
        guidance: 'Tidak ada jawaban benar atau salah. Refleksi ini membantu kamu dan gurumu memahami bagian yang perlu dibahas lebih lanjut di kelas.'
      }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 11 — Ringkasan Konsep
     ---------------------------------------------------------- */
  summaryConcepts: [
    {
      term: 'Entitas',
      icon: '📦',
      definition: 'Objek utama dalam sistem yang perlu dikelola datanya secara terstruktur. Biasanya merupakan kata benda utama dalam narasi bisnis yang memiliki banyak karakteristik sendiri.',
      example: 'Anggota, Buku, Peminjaman, Pelanggan, Kendaraan, Pasien'
    },
    {
      term: 'Atribut',
      icon: '🏷️',
      definition: 'Karakteristik atau properti yang mendeskripsikan suatu entitas. Setiap entitas memiliki satu atau lebih atribut.',
      example: 'nomor_anggota, nama_anggota, kelas → atribut dari entitas Anggota'
    },
    {
      term: 'Primary Key (PK)',
      icon: '🔑',
      definition: 'Satu atribut (atau kombinasi atribut minimal) yang dapat mengidentifikasi setiap record secara unik dalam sebuah tabel. Tiga syarat utama: UNIK, TIDAK NULL, dan STABIL.',
      example: 'nomor_anggota sebagai PK di tabel Anggota'
    },
    {
      term: 'Kriteria Pemilihan PK',
      icon: '✅',
      definition: '① UNIK: tidak ada dua record dengan nilai PK yang sama. ② TIDAK NULL: setiap record harus memiliki nilai PK. ③ STABIL: nilainya tidak berubah setelah ditetapkan. ④ MINIMAL: pilih atribut paling ringkas yang memenuhi ketiga syarat di atas.',
      example: 'nomor_anggota ✓ Unik ✓ Tidak null ✓ Stabil'
    },
    {
      term: 'Mengapa Nama atau Tanggal Lahir bukan PK?',
      icon: '⚠️',
      definition: 'Nama dapat berulang (dua orang bisa bernama sama) dan bisa berubah (menikah, dll.). Tanggal lahir juga bisa berulang karena dua orang berbeda bisa lahir di hari yang sama. Kelayakan suatu atribut sebagai PK bergantung pada sifat data dan kebutuhan sistem nyata.',
      example: 'Dua anggota bernama "Budi Santoso" → nama tidak bisa jadi PK'
    }
  ]
};

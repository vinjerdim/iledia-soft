'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   MPI 1.3: Relationship, Kardinalitas & Foreign Key
   Pisahkan dari app.js agar mudah dikustomisasi guru.
   ============================================================ */

const DATA = {

  meta: {
    title: 'Relationship, Kardinalitas & Foreign Key',
    subject: 'Rekayasa Perangkat Lunak — Fase F',
    goal: 'Memetakan Relationship, Kardinalitas, dan Foreign Key Antarentitas'
  },

  /* ----------------------------------------------------------
     TAHAP 2 — Eksplorasi: Jenis Kardinalitas
     ---------------------------------------------------------- */
  cardinalityTypes: [
    {
      id: '1-1',
      label: '1 : 1',
      name: 'Satu ke Satu',
      description: 'Satu record pada Entitas A berhubungan dengan <strong>tepat satu</strong> record pada Entitas B, dan sebaliknya.',
      example: {
        entityA: 'Murid',
        verb: 'memiliki',
        entityB: 'Kartu Pelajar',
        note: 'Satu murid hanya punya satu kartu, dan satu kartu hanya milik satu murid.'
      },
      rule: 'FK dapat diletakkan di salah satu entitas, umumnya di entitas yang lebih "dependen".',
      visualA: '1',
      visualB: '1'
    },
    {
      id: '1-N',
      label: '1 : N',
      name: 'Satu ke Banyak',
      description: 'Satu record pada Entitas A dapat berhubungan dengan <strong>banyak</strong> record pada Entitas B, tetapi setiap record B hanya berhubungan dengan <strong>satu</strong> record A.',
      example: {
        entityA: 'Guru',
        verb: 'mengajar',
        entityB: 'Mata Kuliah',
        note: 'Satu guru bisa mengajar banyak mata kuliah, tapi setiap mata kuliah hanya diajar satu guru.'
      },
      rule: 'FK diletakkan di sisi N (entitas yang "banyak"), merujuk PK di sisi 1.',
      visualA: '1',
      visualB: 'N'
    },
    {
      id: 'N-M',
      label: 'N : M',
      name: 'Banyak ke Banyak',
      description: 'Banyak record pada Entitas A dapat berhubungan dengan <strong>banyak</strong> record pada Entitas B, dan sebaliknya.',
      example: {
        entityA: 'Murid',
        verb: 'membeli',
        entityB: 'Produk',
        note: 'Satu murid bisa membeli banyak produk, dan satu produk bisa dibeli banyak murid.'
      },
      rule: 'Tidak bisa direpresentasikan hanya dengan FK di salah satu entitas. Dibutuhkan <strong>tabel/entitas penghubung</strong> yang memuat FK dari kedua entitas.',
      visualA: 'N',
      visualB: 'M'
    }
  ],

  /* ----------------------------------------------------------
     TAHAP 3 — Contoh Terbimbing: Anggota & Buku
     ---------------------------------------------------------- */
  guidedExample: {
    context: 'Sistem Perpustakaan Sekolah memiliki entitas <strong>Anggota</strong> dan <strong>Buku</strong>. Anggota dapat meminjam buku. Satu anggota dapat meminjam banyak buku, dan satu buku dapat dipinjam oleh banyak anggota (dalam waktu berbeda).',
    relationship: 'meminjam',
    entityA: {
      id: 'anggota',
      name: 'Anggota',
      color: 'blue',
      pk: 'nomor_anggota',
      attrs: ['nama_anggota', 'kelas', 'tanggal_bergabung']
    },
    entityB: {
      id: 'buku',
      name: 'Buku',
      color: 'green',
      pk: 'kode_buku',
      attrs: ['judul_buku', 'pengarang', 'penerbit', 'tahun_terbit']
    },
    correctCardinality: 'N-M',
    correctFKPlacement: 'bridge',
    bridgeEntity: {
      id: 'peminjaman',
      name: 'Peminjaman',
      color: 'orange',
      pk: 'nomor_peminjaman',
      fkA: { attr: 'nomor_anggota', refsEntity: 'Anggota', refsPK: 'nomor_anggota' },
      fkB: { attr: 'kode_buku', refsEntity: 'Buku', refsPK: 'kode_buku' },
      attrs: ['tanggal_pinjam', 'tanggal_kembali']
    },
    cardinalityHint: 'Coba pikirkan: bisakah satu anggota meminjam lebih dari satu buku? Dan bisakah satu buku dipinjam lebih dari satu anggota (dalam waktu berbeda)?',
    fkHint: 'Pada relasi N:M, ada masalah jika FK diletakkan di salah satu entitas saja. Bagaimana cara menyimpan semua referensi jika satu anggota meminjam banyak buku?',
    fkOptions: [
      { id: 'entityA', label: 'FK di Anggota', desc: 'Tambahkan kolom FK di tabel Anggota' },
      { id: 'entityB', label: 'FK di Buku', desc: 'Tambahkan kolom FK di tabel Buku' },
      { id: 'bridge', label: 'Butuh Tabel Penghubung', desc: 'Buat entitas/tabel baru yang menghubungkan keduanya' }
    ],
    cardinalityFeedback: {
      wrong: {
        '1-1': 'Perhatikan kembali. Satu anggota hanya bisa meminjam satu buku? Dalam kenyataannya, satu anggota bisa meminjam beberapa buku, dan satu buku bisa dipinjam beberapa anggota (bergantian). Kardinalitas 1:1 tidak menggambarkan hubungan ini.',
        '1-N': 'Hampir tepat, tapi masih kurang. Memang satu anggota bisa meminjam banyak buku (sisi N benar). Namun bagaimana dengan satu buku — bisakah dipinjam oleh banyak anggota? Jika ya, kardinalitas bukan 1:N melainkan N:M.'
      },
      correct: 'Tepat! Hubungan Anggota–Buku memiliki kardinalitas N:M karena satu anggota bisa meminjam banyak buku, dan satu buku bisa dipinjam banyak anggota (dalam waktu berbeda).'
    },
    fkFeedback: {
      wrong: {
        entityA: 'Bayangkan: jika FK kode_buku ditaruh di tabel Anggota, bagaimana caranya mencatat anggota A yang meminjam 3 buku berbeda? Kamu akan butuh banyak kolom FK, atau ada data yang tidak bisa disimpan. Satu kolom FK tidak cukup untuk relasi N:M.',
        entityB: 'Bayangkan: jika FK nomor_anggota ditaruh di tabel Buku, bagaimana caranya mencatat buku B yang pernah dipinjam oleh 5 anggota berbeda? Satu kolom FK tidak bisa menyimpan banyak referensi sekaligus.'
      },
      correct: 'Tepat! Relasi N:M memerlukan tabel/entitas penghubung. Tabel Peminjaman menyimpan FK dari kedua entitas: nomor_anggota (→ Anggota) dan kode_buku (→ Buku), sehingga setiap baris mewakili satu transaksi peminjaman.'
    }
  },

  /* ----------------------------------------------------------
     TAHAP 4 — Simulasi Data
     ---------------------------------------------------------- */
  simulation: {
    description: 'Klik baris pada tabel <strong>Peminjaman</strong> untuk melihat bagaimana nilai FK menghubungkan record ke tabel Anggota dan Buku.',
    anggota: [
      { nomor_anggota: 'A001', nama_anggota: 'Budi Santoso', kelas: 'XI RPL 1' },
      { nomor_anggota: 'A002', nama_anggota: 'Citra Dewi', kelas: 'XI RPL 2' },
      { nomor_anggota: 'A003', nama_anggota: 'Dani Pratama', kelas: 'XII RPL 1' }
    ],
    buku: [
      { kode_buku: 'B001', judul_buku: 'Pemrograman Python', pengarang: 'Agus W.' },
      { kode_buku: 'B002', judul_buku: 'Basis Data Relasional', pengarang: 'Hendra T.' },
      { kode_buku: 'B003', judul_buku: 'Jaringan Komputer', pengarang: 'Rina S.' }
    ],
    peminjaman: [
      { nomor_peminjaman: 'P001', nomor_anggota: 'A001', kode_buku: 'B002', tanggal_pinjam: '2025-01-10', tanggal_kembali: '2025-01-24' },
      { nomor_peminjaman: 'P002', nomor_anggota: 'A001', kode_buku: 'B003', tanggal_pinjam: '2025-01-12', tanggal_kembali: '2025-01-26' },
      { nomor_peminjaman: 'P003', nomor_anggota: 'A002', kode_buku: 'B001', tanggal_pinjam: '2025-01-15', tanggal_kembali: '2025-01-29' },
      { nomor_peminjaman: 'P004', nomor_anggota: 'A003', kode_buku: 'B002', tanggal_pinjam: '2025-01-20', tanggal_kembali: '2025-02-03' },
      { nomor_peminjaman: 'P005', nomor_anggota: 'A002', kode_buku: 'B003', tanggal_pinjam: '2025-01-22', tanggal_kembali: '2025-02-05' }
    ]
  },

  /* ----------------------------------------------------------
     TAHAP 5 — Latihan Kasus
     ---------------------------------------------------------- */
  cases: [
    {
      id: 'guru-mk',
      title: 'Kasus 1',
      scenario: '1 Guru mengajar Banyak Mata Kuliah',
      description: 'Dalam sistem akademik, setiap guru dapat mengajar beberapa mata kuliah. Namun, setiap mata kuliah hanya diajar oleh satu guru (dalam satu semester).',
      relationship: 'mengajar',
      entities: [
        {
          id: 'guru',
          name: 'Guru',
          color: 'blue',
          pk: 'id_guru',
          attrs: ['nama_guru', 'nidn', 'email_guru']
        },
        {
          id: 'mk',
          name: 'Mata Kuliah',
          color: 'green',
          pk: 'kode_mk',
          attrs: ['nama_mk', 'sks', 'semester']
        }
      ],
      correctCardinality: '1-N',
      correctFKEntity: 'mk',
      fkAttr: 'id_guru',
      fkRefsEntity: 'Guru',
      fkRefsPK: 'id_guru',
      explanation: 'Pada relasi 1:N, FK diletakkan di sisi N. Karena satu Guru mengajar banyak Mata Kuliah, FK (id_guru) diletakkan di entitas Mata Kuliah. Setiap record Mata Kuliah menyimpan id_guru yang merujuk pada PK entitas Guru, sehingga sistem mengetahui guru mana yang mengajar mata kuliah tersebut.',
      cardinalityFeedback: {
        '1-1': 'Perhatikan kembali. Apakah satu guru benar-benar hanya mengajar satu mata kuliah? Skenario menyatakan "1 Guru mengajar Banyak Mata Kuliah".',
        'N-M': 'Terlalu luas. Skenario menyatakan setiap mata kuliah hanya diajar oleh satu guru. Jadi dari sisi Mata Kuliah, hanya ada satu Guru — bukan banyak.'
      },
      fkFeedback: {
        wrong: 'Ingat aturan 1:N: FK harus di sisi N. Coba identifikasi: entitas mana yang bisa memiliki banyak record yang merujuk ke entitas lain? Guru punya banyak Mata Kuliah, jadi Mata Kuliah-lah yang perlu menyimpan FK, bukan Guru.'
      }
    },
    {
      id: 'murid-kartu',
      title: 'Kasus 2',
      scenario: '1 Murid memiliki 1 Kartu Pelajar',
      description: 'Setiap murid mendapatkan tepat satu kartu pelajar sebagai identitas resmi. Setiap kartu pelajar hanya dimiliki oleh satu murid.',
      relationship: 'memiliki',
      entities: [
        {
          id: 'murid',
          name: 'Murid',
          color: 'blue',
          pk: 'nis',
          attrs: ['nama_murid', 'kelas', 'tanggal_lahir']
        },
        {
          id: 'kartu',
          name: 'Kartu Pelajar',
          color: 'green',
          pk: 'nomor_kartu',
          attrs: ['tahun_berlaku', 'tahun_berakhir']
        }
      ],
      correctCardinality: '1-1',
      correctFKEntity: 'kartu',
      fkAttr: 'nis',
      fkRefsEntity: 'Murid',
      fkRefsPK: 'nis',
      explanation: 'Pada relasi 1:1, FK dapat diletakkan di salah satu entitas. Dalam desain ini, FK diletakkan di entitas Kartu Pelajar karena kartu merupakan entitas "dependen" — keberadaannya bergantung pada Murid (kartu dibuat untuk murid). Kartu Pelajar menyimpan nis sebagai FK yang merujuk PK entitas Murid.',
      note: 'Catatan: Pada relasi 1:1, secara teknis FK bisa di Murid maupun di Kartu Pelajar. Pilihan biasanya bergantung pada arah dependensi dan kebutuhan desain sistem. Jawaban "FK di Murid" juga dapat diterima dengan alasan yang tepat, namun konvensi umum menempatkan FK di entitas yang lebih dependen.',
      cardinalityFeedback: {
        '1-N': 'Perhatikan sisi B. Skenario menyatakan satu Kartu Pelajar hanya dimiliki oleh satu Murid — bukan banyak murid. Jadi dari kedua sisi, hubungannya adalah satu-ke-satu.',
        'N-M': 'Terlalu luas. Skenario menyatakan setiap murid hanya memiliki satu kartu, dan setiap kartu hanya milik satu murid. Ini adalah 1:1, bukan N:M.'
      },
      fkFeedback: {
        wrong: 'Pada relasi 1:1, FK di Murid juga valid secara teknis. Namun konvensi umum menempatkan FK di entitas yang lebih "dependen" — entitas yang keberadaannya bergantung pada entitas lain. Kartu Pelajar ada karena Murid ada, sehingga FK (nis) lebih wajar diletakkan di Kartu Pelajar. Jika kamu memilih Murid dengan alasan yang tepat, diskusikan dengan gurumu.'
      },
      acceptBothFKEntities: true
    },
    {
      id: 'murid-produk',
      title: 'Kasus 3',
      scenario: 'Banyak Murid membeli Banyak Produk di Kantin',
      description: 'Di kantin sekolah, seorang murid dapat membeli berbagai produk. Satu produk juga dapat dibeli oleh banyak murid berbeda.',
      relationship: 'membeli',
      entities: [
        {
          id: 'murid',
          name: 'Murid',
          color: 'blue',
          pk: 'nis',
          attrs: ['nama_murid', 'kelas']
        },
        {
          id: 'produk',
          name: 'Produk',
          color: 'green',
          pk: 'kode_produk',
          attrs: ['nama_produk', 'harga', 'stok']
        }
      ],
      correctCardinality: 'N-M',
      correctFKEntity: 'bridge',
      bridgeEntity: {
        name: 'Pembelian',
        pk: 'id_pembelian',
        fkA: { attr: 'nis', refsEntity: 'Murid', refsPK: 'nis' },
        fkB: { attr: 'kode_produk', refsEntity: 'Produk', refsPK: 'kode_produk' },
        attrs: ['tanggal_beli', 'jumlah']
      },
      explanation: 'Relasi N:M antara Murid dan Produk tidak bisa direpresentasikan hanya dengan menambahkan FK di salah satu tabel. Dibutuhkan tabel/entitas penghubung (Pembelian) yang menyimpan FK dari kedua entitas: nis (FK→Murid) dan kode_produk (FK→Produk). Setiap baris di tabel Pembelian mewakili satu transaksi pembelian.',
      cardinalityFeedback: {
        '1-1': 'Terlalu terbatas. Skenario menyebutkan banyak murid bisa membeli banyak produk. Ini bukan hubungan satu-ke-satu.',
        '1-N': 'Perhatikan kedua sisi. Memang satu murid bisa membeli banyak produk. Tetapi bisakah satu produk dibeli oleh banyak murid? Jika ya, maka kardinalitas bukan 1:N melainkan N:M.'
      },
      fkFeedback: {
        murid: 'Bayangkan jika FK kode_produk ditaruh di tabel Murid: murid A membeli 5 produk berbeda — kamu perlu 5 kolom FK atau buat baris murid duplikat. Ini tidak efisien dan tidak benar. Relasi N:M butuh tabel penghubung.',
        produk: 'Bayangkan jika FK nis ditaruh di tabel Produk: produk B dibeli 20 murid berbeda — kamu perlu 20 kolom FK. Ini tidak mungkin dan tidak benar. Relasi N:M butuh tabel penghubung.'
      }
    }
  ],

  /* ----------------------------------------------------------
     TAHAP 6 — Asesmen Formatif
     ---------------------------------------------------------- */
  assessment: [
    {
      id: 'a1',
      question: 'Sistem penerbitan memiliki entitas <strong>Penulis</strong> dan <strong>Artikel</strong>. Satu Penulis dapat menulis banyak Artikel, tetapi setiap Artikel hanya ditulis oleh satu Penulis.',
      entities: [
        { id: 'penulis', name: 'Penulis', color: 'blue', pk: 'id_penulis', attrs: ['nama_penulis', 'email_penulis'] },
        { id: 'artikel', name: 'Artikel', color: 'green', pk: 'kode_artikel', attrs: ['judul_artikel', 'tanggal_terbit'] }
      ],
      relationship: 'menulis',
      correctCardinality: '1-N',
      correctFKEntity: 'artikel',
      fkAttr: 'id_penulis',
      fkRefsEntity: 'Penulis',
      fkRefsPK: 'id_penulis',
      explanation: 'Relasi 1:N (satu Penulis — banyak Artikel). FK id_penulis diletakkan di entitas Artikel (sisi N), merujuk PK entitas Penulis.'
    },
    {
      id: 'a2',
      question: 'Perusahaan memiliki entitas <strong>Pegawai</strong> dan <strong>Loker</strong>. Setiap Pegawai mendapatkan tepat satu Loker, dan setiap Loker hanya digunakan oleh satu Pegawai.',
      entities: [
        { id: 'pegawai', name: 'Pegawai', color: 'blue', pk: 'id_pegawai', attrs: ['nama_pegawai', 'divisi'] },
        { id: 'loker', name: 'Loker', color: 'green', pk: 'nomor_loker', attrs: ['lokasi', 'ukuran'] }
      ],
      relationship: 'menggunakan',
      correctCardinality: '1-1',
      correctFKEntity: 'loker',
      fkAttr: 'id_pegawai',
      fkRefsEntity: 'Pegawai',
      fkRefsPK: 'id_pegawai',
      acceptBothFKEntities: true,
      explanation: 'Relasi 1:1 (satu Pegawai — satu Loker). FK diletakkan di entitas Loker (entitas dependen), menyimpan id_pegawai sebagai FK yang merujuk PK Pegawai.'
    },
    {
      id: 'a3',
      question: 'Sekolah memiliki entitas <strong>Siswa</strong> dan <strong>Ekstrakurikuler</strong>. Banyak Siswa dapat mengikuti banyak Ekstrakurikuler, dan satu Ekstrakurikuler diikuti banyak Siswa.',
      entities: [
        { id: 'siswa', name: 'Siswa', color: 'blue', pk: 'nis', attrs: ['nama_siswa', 'kelas'] },
        { id: 'ekskul', name: 'Ekstrakurikuler', color: 'green', pk: 'id_ekskul', attrs: ['nama_ekskul', 'pembina'] }
      ],
      relationship: 'mengikuti',
      correctCardinality: 'N-M',
      correctFKEntity: 'bridge',
      bridgeEntity: {
        name: 'Pendaftaran_Ekskul',
        pk: 'id_pendaftaran',
        fkA: { attr: 'nis', refsEntity: 'Siswa', refsPK: 'nis' },
        fkB: { attr: 'id_ekskul', refsEntity: 'Ekstrakurikuler', refsPK: 'id_ekskul' },
        attrs: ['tanggal_daftar', 'status_aktif']
      },
      explanation: 'Relasi N:M antara Siswa dan Ekstrakurikuler memerlukan tabel penghubung (Pendaftaran_Ekskul) yang menyimpan nis (FK→Siswa) dan id_ekskul (FK→Ekstrakurikuler). Tabel ini merepresentasikan setiap pendaftaran siswa ke ekskul tertentu.'
    }
  ],

  /* ----------------------------------------------------------
     Pertanyaan Refleksi
     ---------------------------------------------------------- */
  reflectionQuestion: 'Pada relasi 1:N, di entitas mana foreign key harus diletakkan dan mengapa? Jelaskan dengan bahasamu sendiri dan berikan contoh dari materi yang telah kamu pelajari.',

  /* ----------------------------------------------------------
     Label Kardinalitas (untuk display)
     ---------------------------------------------------------- */
  cardinalityLabels: {
    '1-1': '1 : 1',
    '1-N': '1 : N',
    'N-M': 'N : M'
  }

};

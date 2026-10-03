'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Merancang ERD Lengkap Berdasarkan
   Hasil Analisis Kebutuhan Data Studi Kasus
   Fase F — SMK Rekayasa Perangkat Lunak, Cooperative Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js. Guru dapat menyunting teks, soal, kunci,
   dan umpan balik di sini tanpa menyentuh kode.

   Studi kasus: Kepala Lab RPL meminta tim merancang basis data
   Sistem Peminjaman Alat Lab. Tim membedah dokumen hasil analisis
   kebutuhan, lalu merakit ERD lengkap: entitas, atribut, kunci
   primer, relasi & kardinalitas, entitas penghubung M:N, dan kunci
   tamu. Kuis memakai kasus paralel: kantin sekolah (kuis awal) dan
   bank sampah sekolah (evaluasi).

   Model Cooperative Learning (sintaks Arends) dengan teknik
   Jigsaw untuk kerja kelompok, "Dua Tinggal Dua Tamu" untuk uji
   silang, dan poin peningkatan individu model STAD untuk
   penghargaan tim.

   Pemetaan sintaks Cooperative Learning → tahap media:
     1. Menyampaikan tujuan & memotivasi
                            → orientasi   (TP, alur, apersepsi)
                            → kuisAwal    (skor dasar individu)
     2. Menyajikan informasi→ informasi   (komponen & notasi ERD,
                                           langkah merancang ERD)
     3. Mengorganisasi siswa ke dalam kelompok belajar
                            → kelompok    (peran, topik ahli
                                           Jigsaw, norma tim)
     4. Membimbing kelompok bekerja dan belajar
                            → ahli        (kelompok ahli: dalami
                                           satu komponen ERD)
                            → analisis    (tim asal: saling
                                           mengajari, bedah dokumen
                                           kebutuhan)
                            → rancang     (rakit entitas, atribut,
                                           kunci primer)
                            → relasi      (rakit relasi, kardinalitas,
                                           penghubung M:N, kunci tamu
                                           → ERD lengkap)
     5. Evaluasi            → evaluasi    (kuis individu paralel +
                                           uji silang Dua Tinggal Dua
                                           Tamu)
     6. Memberikan penghargaan
                            → penghargaan (poin peningkatan & predikat
                                           tim)
     Refleksi & penutup     → refleksi, selesai

   KONVENSI ERD: lihat engine seksi 15. `ERD_LAB` adalah kunci ERD
   lengkap; daftar atribut tahap Rakit Entitas, soal kunci primer,
   dan soal kunci tamu diuji otomatis terhadapnya (tes
   tests/mpi-f-1.3-data.test.js). Relasi memakai konvensi seksi 13:
   `ab` = satu A punya berapa B, `ba` = satu B punya berapa A.

   ATURAN: setiap pilihan punya `id` unik dan stabil. Urutan
   tampilnya DIACAK oleh app.js (initOrders) dan jawaban murid
   disimpan per id. Penanda frasa [[id|teks]] pada dokumen
   kebutuhan harus sama persis dengan `teks` pada daftar frasa.
   ============================================================ */

/* Entitas studi kasus Lab RPL. */
var ENT = {
  siswa: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
  petugas: { id: 'petugas', label: 'Petugas Lab', ikon: '🧑‍🔧' },
  kategori: { id: 'kategori', label: 'Kategori Alat', ikon: '🗂️' },
  alat: { id: 'alat', label: 'Alat', ikon: '💻' },
  pinjam: { id: 'pinjam', label: 'Peminjaman', ikon: '📋' },
  detail: { id: 'detail', label: 'Detail Peminjaman', ikon: '🧾' },
};

/* Relasi studi kasus Lab RPL beserta aturan bisnisnya. */
var RELASI_LAB = [
  {
    id: 'rLakukan',
    a: ENT.siswa,
    b: ENT.pinjam,
    kerja: 'melakukan',
    kerjaBalik: 'dilakukan oleh',
    aturan:
      'Siswa boleh belum pernah meminjam alat, dan bisa meminjam berkali-kali. Setiap peminjaman atas nama tepat satu siswa.',
    ab: '0..N',
    ba: '1..1',
    jenis: '1:N',
  },
  {
    id: 'rCatat',
    a: ENT.petugas,
    b: ENT.pinjam,
    kerja: 'mencatat',
    kerjaBalik: 'dicatat oleh',
    aturan:
      'Petugas yang baru bertugas boleh belum mencatat peminjaman, dan nantinya mencatat banyak peminjaman. Setiap peminjaman dicatat tepat satu petugas.',
    ab: '0..N',
    ba: '1..1',
    jenis: '1:N',
  },
  {
    id: 'rKelompok',
    a: ENT.kategori,
    b: ENT.alat,
    kerja: 'mengelompokkan',
    kerjaBalik: 'termasuk dalam',
    aturan:
      'Kategori hanya dibuat bila sudah ada minimal satu alatnya, dan bisa berisi banyak alat. Setiap alat masuk tepat satu kategori.',
    ab: '1..N',
    ba: '1..1',
    jenis: '1:N',
  },
  {
    id: 'rMuat',
    a: ENT.pinjam,
    b: ENT.alat,
    kerja: 'memuat',
    kerjaBalik: 'dimuat dalam',
    aturan:
      'Satu peminjaman memuat minimal satu alat dan bisa beberapa alat. Alat baru boleh belum pernah dipinjam, dan satu alat bisa dipinjam berkali-kali pada peminjaman yang berbeda.',
    ab: '1..N',
    ba: '0..N',
    jenis: 'M:N',
    penghubung: 'detail',
  },
];

/* Kunci ERD lengkap Sistem Peminjaman Alat Lab RPL. */
var ERD_LAB = {
  entitas: [
    {
      id: 'siswa',
      label: 'Siswa',
      ikon: '🧑‍🎓',
      atribut: [
        { id: 'nis', teks: 'nis', pk: true },
        { id: 'nama_siswa', teks: 'nama_siswa' },
        { id: 'kelas', teks: 'kelas' },
      ],
    },
    {
      id: 'petugas',
      label: 'Petugas Lab',
      ikon: '🧑‍🔧',
      atribut: [
        { id: 'id_petugas', teks: 'id_petugas', pk: true },
        { id: 'nama_petugas', teks: 'nama_petugas' },
      ],
    },
    {
      id: 'kategori',
      label: 'Kategori Alat',
      ikon: '🗂️',
      atribut: [
        { id: 'id_kategori', teks: 'id_kategori', pk: true },
        { id: 'nama_kategori', teks: 'nama_kategori' },
      ],
    },
    {
      id: 'alat',
      label: 'Alat',
      ikon: '💻',
      atribut: [
        { id: 'kode_alat', teks: 'kode_alat', pk: true },
        { id: 'nama_alat', teks: 'nama_alat' },
        { id: 'kondisi_alat', teks: 'kondisi_alat' },
        { id: 'alat_id_kategori', teks: 'id_kategori', fk: 'kategori' },
      ],
    },
    {
      id: 'pinjam',
      label: 'Peminjaman',
      ikon: '📋',
      atribut: [
        { id: 'no_pinjam', teks: 'no_pinjam', pk: true },
        { id: 'tgl_pinjam', teks: 'tgl_pinjam' },
        { id: 'tgl_kembali', teks: 'tgl_kembali' },
        { id: 'pinjam_nis', teks: 'nis', fk: 'siswa' },
        { id: 'pinjam_id_petugas', teks: 'id_petugas', fk: 'petugas' },
      ],
    },
    {
      id: 'detail',
      label: 'Detail Peminjaman',
      ikon: '🧾',
      penghubung: true,
      atribut: [
        { id: 'detail_no_pinjam', teks: 'no_pinjam', pk: true, fk: 'pinjam' },
        { id: 'detail_kode_alat', teks: 'kode_alat', pk: true, fk: 'alat' },
        { id: 'kondisi_kembali', teks: 'kondisi_kembali' },
      ],
    },
  ],
  relasi: RELASI_LAB,
};

/* Opsi jenis relasi untuk kuis (id harus unik per soal). */
function opsiJenis() {
  return [
    { id: 'r11', label: 'One-to-One (1:1)' },
    { id: 'r1n', label: 'One-to-Many (1:N)' },
    { id: 'rmn', label: 'Many-to-Many (M:N)' },
    { id: 'tidak', label: 'Tidak ada relasi' },
  ];
}

var DATA = {
  meta: {
    judul: 'Merancang ERD Lengkap dari Hasil Analisis Kebutuhan Data',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Cooperative Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Menyampaikan Tujuan' },
    { id: 'kuisAwal', label: 'Kuis Awal', sintaks: 'Sintaks 1 · Menyampaikan Tujuan' },
    { id: 'informasi', label: 'Info Kunci', sintaks: 'Sintaks 2 · Menyajikan Informasi' },
    { id: 'kelompok', label: 'Bentuk Tim', sintaks: 'Sintaks 3 · Mengorganisasi Kelompok' },
    { id: 'ahli', label: 'Tim Ahli', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'analisis', label: 'Bedah Kebutuhan', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'rancang', label: 'Rakit Entitas', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'relasi', label: 'Rakit Relasi', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'evaluasi', label: 'Evaluasi', sintaks: 'Sintaks 5 · Evaluasi' },
    { id: 'penghargaan', label: 'Penghargaan', sintaks: 'Sintaks 6 · Memberikan Penghargaan' },
    { id: 'refleksi', label: 'Refleksi', sintaks: 'Refleksi' },
    { id: 'selesai', label: 'Selesai', sintaks: 'Penutup' },
  ],

  erd: ERD_LAB,

  /* ==========================================================
     SINTAKS 1 — Menyampaikan tujuan & memotivasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Dari Catatan Kebutuhan ke ERD Utuh',
    goal: 'Mengetahui tujuan belajar, alur kerja tim, dan cara memakai media ini.',
    guru: 'Bentuk kelompok heterogen berisi 4 murid <em>sebelum</em> pelajaran. Ingatkan bahwa materi 1.1 (entitas & atribut) dan 1.2 (relasi & kardinalitas) kini dirangkai menjadi satu ERD utuh. Tegaskan bahwa nilai tim ditentukan oleh <strong>peningkatan</strong> setiap anggota, sehingga setiap orang penting. Tayangkan tahap ini di layar kelas, lalu ajak murid menjawab pemanasan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Merancang ERD lengkap berdasarkan hasil analisis kebutuhan data studi kasus.',
    kriteria: [
      'Memilah frasa dokumen hasil analisis kebutuhan menjadi entitas, atribut, aturan relasi, dan hal yang bukan data.',
      'Menyusun setiap entitas beserta atributnya dan menentukan kunci primernya.',
      'Menentukan kardinalitas min..maks dan jenis setiap relasi dari aturan bisnis.',
      'Mewujudkan relasi M:N dengan entitas penghubung dan meletakkan kunci tamu di entitas yang tepat.',
      'Memeriksa ERD tim lain dan menjelaskan kesalahannya berdasarkan kebutuhan.',
    ],
    pengantar:
      'Lab RPL sering kehilangan jejak alat: laptop dipinjam tanpa catatan jelas, kabel jaringan tidak kembali, dan petugas lupa siapa yang meminjam. Kepala Lab meminta timmu merancang basis data <strong>Sistem Peminjaman Alat Lab RPL</strong>. Hasil analisis kebutuhan sudah dikumpulkan; tugas tim adalah merakitnya menjadi <strong>ERD lengkap</strong> — siap diubah menjadi tabel oleh programmer.',
    alur: [
      { judul: 'Kuis Awal', desk: 'Ukur bekal awalmu sendiri — ini menjadi skor dasar.' },
      { judul: 'Info Kunci', desk: 'Kenali komponen ERD lengkap dan langkah merancangnya.' },
      { judul: 'Bentuk Tim', desk: 'Bagi peran dan pilih satu komponen ERD sebagai keahlianmu.' },
      { judul: 'Tim Ahli', desk: 'Dalami topikmu bersama ahli dari tim lain.' },
      { judul: 'Bedah Kebutuhan', desk: 'Kembali ke tim asal, saling mengajari, bedah dokumen.' },
      { judul: 'Rakit Entitas', desk: 'Kelompokkan atribut dan tentukan kunci primer.' },
      { judul: 'Rakit Relasi', desk: 'Tentukan kardinalitas, entitas penghubung, kunci tamu.' },
      { judul: 'Evaluasi', desk: 'Kuis individu dan uji silang ERD tim lain.' },
      { judul: 'Penghargaan', desk: 'Hitung poin peningkatanmu dan predikat tim.' },
    ],
    caraPakai: [
      'Kerjakan Kuis Awal dan Evaluasi <strong>sendiri</strong> — keduanya hanya bisa dijawab sekali.',
      'Pertanyaan di tahap lain boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama.',
      'Urutan pilihan jawaban diacak, jadi diskusikan <em>alasannya</em>, bukan huruf jawabannya.',
      'Progres tersimpan otomatis di perangkat ini. Tombol Reset mengulang dari awal dan mengacak ulang pilihan.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: bagaimana peminjaman alat di lab sekolahmu dicatat saat ini? Pilih yang paling mirip dengan pengalamanmu.',
      opsi: [
        { id: 'buku', label: 'Ditulis tangan di buku peminjaman' },
        { id: 'sheet', label: 'Dicatat di satu lembar spreadsheet' },
        { id: 'ingat', label: 'Cukup diingat oleh petugas lab' },
        { id: 'tidak', label: 'Tidak dicatat sama sekali' },
      ],
      umpan:
        'Cara apa pun yang dipakai, masalahnya mirip: data siswa, alat, dan peminjaman bercampur di satu tempat sehingga sulit dicari dan mudah berulang. <strong>ERD lengkap</strong> memisahkan data itu ke entitas yang tepat, menghubungkannya dengan relasi yang jelas, dan menandai kunci yang menyambungkan semuanya.',
    },
  },

  kuisAwal: {
    kicker: 'Tahap 2 · Kuis Awal',
    title: 'Kuis Awal: Skor Dasarmu',
    goal: 'Mengukur pemahaman awal secara individu sebagai skor dasar poin peningkatan.',
    guru: 'Minta murid mengerjakan sendiri tanpa diskusi. Tegaskan bahwa skor rendah tidak masalah — skor ini hanya titik awal untuk menghitung <strong>poin peningkatan</strong>. Murid yang awalnya rendah justru berpeluang menyumbang poin besar bagi tim.',
    pengantar:
      'Jawab 5 soal berikut <strong>sendiri</strong>. Setiap soal hanya bisa dijawab <strong>sekali</strong>. Kasusnya: aplikasi pemesanan kantin sekolah.',
    soal: [
      {
        id: 'ka1',
        tanya:
          'Kebutuhan: "Kantin perlu mencatat setiap <em>stan</em> beserta nama pemilik dan nomor stannya." Mana yang menjadi <strong>entitas</strong>?',
        opsi: [
          { id: 'stan', label: 'Stan' },
          { id: 'pemilik', label: 'nama_pemilik' },
          { id: 'nomor', label: 'nomor_stan' },
          { id: 'catat', label: 'Mencatat' },
        ],
        correct: 'stan',
        umpan: {
          stan: 'Stan adalah objek yang datanya disimpan dan punya keterangan sendiri.',
          pemilik: 'Nama pemilik adalah keterangan yang melekat pada stan — itu atribut.',
          nomor: 'Nomor stan adalah keterangan stan (bahkan calon kunci primernya), bukan entitas.',
          catat: 'Mencatat adalah proses, bukan objek yang datanya disimpan.',
        },
      },
      {
        id: 'ka2',
        tanya:
          'Entitas <strong>Menu</strong> punya atribut berikut. Mana yang paling tepat menjadi <strong>kunci primer</strong>?',
        opsi: [
          { id: 'kode', label: 'kode_menu' },
          { id: 'nama', label: 'nama_menu' },
          { id: 'harga', label: 'harga' },
          { id: 'stan', label: 'id_stan' },
        ],
        correct: 'kode',
        umpan: {
          kode: 'Kode dibuat unik dan tidak berubah — ciri kunci primer yang baik.',
          nama: 'Dua stan bisa sama-sama menjual "Nasi Goreng"; nama bisa kembar.',
          harga: 'Banyak menu berharga sama, dan harga bisa berubah.',
          stan: 'id_stan menunjukkan pemilik menu (kunci tamu), dan banyak menu punya id_stan yang sama.',
        },
      },
      {
        id: 'ka3',
        tanya:
          'Aturan: "Satu stan menjual banyak menu, dan setiap menu dijual oleh tepat satu stan." Jenis relasi <strong>Stan – Menu</strong> adalah …',
        opsi: opsiJenis(),
        correct: 'r1n',
        umpan: {
          r11: 'Satu stan menjual <em>banyak</em> menu, jadi ada sisi "banyak".',
          r1n: 'Satu stan → banyak menu, satu menu → satu stan: One-to-Many.',
          rmn: 'Dari arah menu maksimumnya satu stan, jadi hanya satu sisi yang "banyak".',
          tidak: 'Stan dan menu jelas terhubung lewat kegiatan menjual.',
        },
      },
      {
        id: 'ka4',
        tanya:
          'Untuk mewujudkan relasi <strong>Stan – Menu (1:N)</strong>, kunci tamu diletakkan dengan cara …',
        opsi: [
          { id: 'diMenu', label: 'Menambah id_stan di entitas Menu' },
          { id: 'diStan', label: 'Menambah kode_menu di entitas Stan' },
          { id: 'keduanya', label: 'Menambah kunci tamu di kedua entitas' },
          { id: 'penghubung', label: 'Membuat entitas penghubung Stan_Menu' },
        ],
        correct: 'diMenu',
        umpan: {
          diMenu: 'Kunci tamu selalu di sisi "banyak": setiap menu cukup menyimpan satu id_stan.',
          diStan: 'Satu stan punya banyak menu — satu kolom kode_menu tidak akan cukup.',
          keduanya: 'Menyimpan di kedua sisi membuat data ganda yang bisa saling bertentangan.',
          penghubung: 'Entitas penghubung hanya diperlukan untuk relasi M:N.',
        },
      },
      {
        id: 'ka5',
        tanya:
          'Satu pesanan berisi beberapa menu, dan satu menu muncul di banyak pesanan. <strong>Jumlah porsi</strong> tiap menu dalam sebuah pesanan paling tepat disimpan di …',
        opsi: [
          { id: 'detail', label: 'Entitas penghubung Detail Pesanan' },
          { id: 'pesanan', label: 'Entitas Pesanan' },
          { id: 'menu', label: 'Entitas Menu' },
          { id: 'stan', label: 'Entitas Stan' },
        ],
        correct: 'detail',
        umpan: {
          detail:
            'Jumlah porsi milik <em>pasangan</em> pesanan–menu, jadi disimpan di entitas penghubung.',
          pesanan:
            'Satu pesanan berisi beberapa menu dengan porsi berbeda — satu kolom tidak cukup.',
          menu: 'Satu menu dipesan banyak kali dengan porsi berbeda — satu kolom tidak cukup.',
          stan: 'Stan tidak berkaitan langsung dengan porsi sebuah pesanan.',
        },
      },
    ],
  },

  /* ==========================================================
     SINTAKS 2 — Menyajikan informasi
     ========================================================== */
  informasi: {
    kicker: 'Tahap 3 · Info Kunci',
    title: 'Komponen & Langkah Merancang ERD Lengkap',
    goal: 'Mengenal komponen ERD lengkap beserta notasinya dan urutan langkah merancangnya.',
    guru: 'Sajikan informasi singkat (±10 menit). Kaitkan setiap komponen dengan materi sebelumnya: entitas & atribut (1.1), relasi & kardinalitas (1.2). Tekankan dua hal baru: <strong>kunci tamu</strong> yang menyambungkan entitas dan <strong>entitas penghubung</strong> untuk M:N. Minta tim menyusun langkah dan menjawab cek paham bersama.',
    pengantar:
      'ERD disebut <strong>lengkap</strong> bila programmer bisa langsung mengubahnya menjadi tabel: setiap entitas punya atribut dan kunci primer, setiap relasi punya kardinalitas, relasi M:N sudah dipecah, dan kunci tamu sudah diletakkan.',
    komponen: [
      {
        id: 'entitas',
        nama: 'Entitas',
        simbol: 'Persegi panjang',
        media: 'Kartu berjudul biru',
        contoh: 'Rak, Buku',
      },
      {
        id: 'atribut',
        nama: 'Atribut',
        simbol: 'Elips yang terhubung ke entitas',
        media: 'Baris di dalam kartu',
        contoh: 'judul, lokasi',
      },
      {
        id: 'pk',
        nama: 'Kunci primer (PK)',
        simbol: 'Elips dengan nama bergaris bawah',
        media: '🔑 dan garis bawah',
        contoh: 'kode_buku',
      },
      {
        id: 'fk',
        nama: 'Kunci tamu (FK)',
        simbol: 'Atribut yang merujuk PK entitas lain',
        media: '🔗 dan → entitas rujukan',
        contoh: 'id_rak di Buku',
      },
      {
        id: 'relasi',
        nama: 'Relasi',
        simbol: 'Belah ketupat berisi kata kerja',
        media: 'Belah ketupat ungu',
        contoh: 'Rak menyimpan Buku',
      },
      {
        id: 'kardinalitas',
        nama: 'Kardinalitas',
        simbol: 'Notasi min..maks di ujung garis',
        media: 'Lencana 0..1, 1..1, 0..N, 1..N',
        contoh: '0..N, 1..1',
      },
      {
        id: 'penghubung',
        nama: 'Entitas penghubung',
        simbol: 'Entitas baru pemecah relasi M:N',
        media: 'Kartu hijau bergaris putus',
        contoh: 'Detail Pinjam Buku',
      },
    ],
    contohJudul: 'Contoh ERD mini: perpustakaan kelas',
    contoh: {
      entitas: [
        {
          id: 'rak',
          label: 'Rak',
          ikon: '🗄️',
          atribut: [
            { id: 'id_rak', teks: 'id_rak', pk: true },
            { id: 'lokasi', teks: 'lokasi' },
          ],
        },
        {
          id: 'buku',
          label: 'Buku',
          ikon: '📚',
          atribut: [
            { id: 'kode_buku', teks: 'kode_buku', pk: true },
            { id: 'judul', teks: 'judul' },
            { id: 'buku_id_rak', teks: 'id_rak', fk: 'rak' },
          ],
        },
      ],
      relasi: [
        {
          id: 'rSimpan',
          a: { id: 'rak', label: 'Rak', ikon: '🗄️' },
          b: { id: 'buku', label: 'Buku', ikon: '📚' },
          kerja: 'menyimpan',
          kerjaBalik: 'disimpan di',
          ab: '0..N',
          ba: '1..1',
        },
      ],
    },
    langkah: {
      pengantar:
        'Susun langkah merancang ERD lengkap dari hasil analisis kebutuhan. Ketuk kartu dari kolam untuk mengisi urutan.',
      items: [
        { id: 'entitas', label: 'Temukan entitas: objek yang datanya perlu disimpan' },
        { id: 'atribut', label: 'Daftarkan atribut setiap entitas' },
        { id: 'pk', label: 'Tentukan kunci primer setiap entitas' },
        { id: 'relasi', label: 'Tentukan relasi dan kardinalitasnya dari aturan bisnis' },
        { id: 'mn', label: 'Pecah relasi M:N dengan entitas penghubung' },
        { id: 'fk', label: 'Letakkan kunci tamu, lalu periksa ERD terhadap kebutuhan' },
      ],
      urutan: ['entitas', 'atribut', 'pk', 'relasi', 'mn', 'fk'],
    },
    pertanyaan: [
      {
        id: 'in1',
        tanya: 'Atribut yang tepat menjadi <strong>kunci primer</strong> harus …',
        opsi: [
          { id: 'unik', label: 'Unik untuk setiap data dan tidak berubah-ubah' },
          { id: 'pertama', label: 'Selalu atribut yang ditulis paling atas' },
          { id: 'nama', label: 'Berupa nama agar mudah dibaca' },
          { id: 'boleh', label: 'Boleh kosong bila datanya belum lengkap' },
        ],
        correct: 'unik',
        umpan: {
          unik: 'Tepat. Kunci primer membedakan satu data dari data lain, jadi harus unik, tetap, dan tidak kosong.',
          pertama: 'Posisi tidak menentukan. Yang menentukan adalah keunikan nilainya.',
          nama: 'Nama sering kembar dan bisa berganti — kurang cocok menjadi kunci.',
          boleh: 'Kunci primer tidak boleh kosong; tanpa kunci, data tidak bisa dibedakan.',
        },
      },
      {
        id: 'in2',
        tanya: 'Pada contoh ERD mini, <code>id_rak</code> di entitas Buku disebut …',
        opsi: [
          { id: 'fk', label: 'Kunci tamu yang merujuk kunci primer Rak' },
          { id: 'pk', label: 'Kunci primer kedua milik Buku' },
          { id: 'turunan', label: 'Atribut turunan yang dihitung dari judul' },
          { id: 'salah', label: 'Kesalahan, karena id_rak milik Rak' },
        ],
        correct: 'fk',
        umpan: {
          fk: 'Benar. Kunci tamu adalah salinan kunci primer entitas lain yang menyambungkan dua entitas.',
          pk: 'Kunci primer Buku adalah kode_buku. id_rak hanya merujuk rak tempat buku disimpan.',
          turunan: 'id_rak tidak dihitung; ia menunjuk data di entitas Rak.',
          salah: 'Justru disengaja: dengan id_rak, setiap buku tahu di rak mana ia disimpan.',
        },
      },
      {
        id: 'in3',
        tanya: 'Sebuah ERD disebut <strong>lengkap</strong> bila …',
        opsi: [
          {
            id: 'lengkap',
            label:
              'Memuat entitas, atribut, kunci primer, relasi berkardinalitas, entitas penghubung M:N, dan kunci tamu',
          },
          { id: 'entitas', label: 'Semua entitas sudah digambar, relasinya menyusul' },
          { id: 'warna', label: 'Gambarnya rapi dan berwarna' },
          { id: 'tabel', label: 'Sudah berbentuk satu tabel besar berisi semua kolom' },
        ],
        correct: 'lengkap',
        umpan: {
          lengkap: 'Tepat. Dengan semua komponen itu, ERD siap diubah menjadi tabel.',
          entitas: 'Tanpa relasi dan kunci, programmer tidak tahu cara menyambungkan tabelnya.',
          warna: 'Kerapian membantu, tetapi kelengkapan isi yang utama.',
          tabel: 'Satu tabel besar justru masalah yang ingin dihindari ERD: data berulang.',
        },
      },
    ],
  },

  /* ==========================================================
     SINTAKS 3 — Mengorganisasi kelompok
     ========================================================== */
  kelompok: {
    kicker: 'Tahap 4 · Bentuk Tim',
    title: 'Bagi Peran & Pilih Keahlian',
    goal: 'Membagi peran tim, memilih topik ahli Jigsaw, dan menyepakati norma kerja tim.',
    guru: 'Pastikan setiap tim asal membagi empat topik ahli sehingga setiap topik punya tepat satu ahli. Arahkan para ahli dari tim berbeda dengan topik sama untuk duduk bersama di "meja ahli" pada tahap berikutnya. Gilir peran setiap pertemuan.',
    pengantar:
      'Dalam teknik <strong>Jigsaw</strong>, setiap anggota tim menjadi <em>ahli</em> satu komponen ERD. Kamu akan berdiskusi dengan ahli dari tim lain, lalu kembali dan <strong>mengajarkannya</strong> ke tim asal. ERD tim hanya lengkap bila keempat keahlian disatukan.',
    peran: [
      {
        id: 'pemandu',
        ikon: '🧭',
        label: 'Pemandu',
        tugas: 'Mengatur giliran bicara dan menjaga waktu diskusi.',
      },
      {
        id: 'pencatat',
        ikon: '📝',
        label: 'Pencatat',
        tugas: 'Mengisi media dan menuliskan keputusan tim beserta alasannya.',
      },
      {
        id: 'pemeriksa',
        ikon: '🔍',
        label: 'Pemeriksa Kebutuhan',
        tugas: 'Mencocokkan setiap keputusan dengan dokumen kebutuhan.',
      },
      {
        id: 'jubir',
        ikon: '🎤',
        label: 'Juru Bicara',
        tugas: 'Menjelaskan ERD tim kepada tamu saat uji silang.',
      },
    ],
    topik: [
      {
        id: 'entitas',
        ikon: '🧱',
        label: 'Ahli Entitas & Kunci Primer',
        desk: 'Menemukan entitas dan memilih kuncinya.',
      },
      {
        id: 'atribut',
        ikon: '🏷️',
        label: 'Ahli Atribut',
        desk: 'Menempatkan atribut di entitas pemiliknya.',
      },
      {
        id: 'relasi',
        ikon: '🔀',
        label: 'Ahli Relasi & Kardinalitas',
        desk: 'Membaca aturan bisnis dari dua arah.',
      },
      {
        id: 'fk',
        ikon: '🔗',
        label: 'Ahli Kunci Tamu & M:N',
        desk: 'Menyambungkan entitas dan memecah M:N.',
      },
    ],
    norma: {
      tanya:
        'Norma kerja tim mana yang membuat <strong>setiap</strong> anggota benar-benar paham? Pilih semua yang tepat.',
      opsi: [
        {
          id: 'giliran',
          label: 'Bergiliran berbicara dan mendengarkan sampai teman selesai',
          benar: true,
          alasan: 'Setiap suara terdengar, termasuk teman yang pendiam.',
        },
        {
          id: 'semua',
          label: 'Setiap anggota memahami keempat komponen ERD, bukan hanya topik ahlinya',
          benar: true,
          alasan: 'Evaluasi dikerjakan individu — tim berhasil bila semua paham.',
        },
        {
          id: 'buktikan',
          label: 'Setiap keputusan rancangan ditunjukkan buktinya pada dokumen kebutuhan',
          benar: true,
          alasan: 'ERD yang baik selalu bisa dilacak ke kebutuhan pengguna.',
        },
        {
          id: 'tanyaTim',
          label: 'Bertanya kepada teman satu tim lebih dulu sebelum bertanya kepada guru',
          benar: true,
          alasan: 'Membangun saling ketergantungan positif dalam tim.',
        },
        {
          id: 'tercepat',
          label: 'Anggota tercepat merakit seluruh ERD supaya tim cepat selesai',
          benar: false,
          alasan: 'Anggota lain tidak belajar, dan poin peningkatan mereka akan rendah.',
        },
        {
          id: 'diam',
          label: 'Menerima rancangan ahli tanpa bertanya agar tidak berdebat',
          benar: false,
          alasan: 'Pertanyaan justru menemukan kesalahan sebelum ERD diperiksa tim lain.',
        },
      ],
      done: '<strong>Kesepakatan tim siap!</strong> Ingat: ERD tim lengkap bila setiap ahli menyumbang bagiannya.',
    },
  },

  /* ==========================================================
     SINTAKS 4 — Membimbing kelompok bekerja & belajar
     ========================================================== */
  ahli: {
    kicker: 'Tahap 5 · Tim Ahli',
    title: 'Meja Ahli: Dalami Komponenmu',
    goal: 'Memahami satu komponen ERD secara mendalam agar mampu mengajarkannya kepada tim asal.',
    guru: 'Kelompokkan murid dengan topik ahli yang sama dari tim berbeda. Berkeliling dan ajukan pertanyaan pemantik ("Bagaimana kamu tahu itu entitas, bukan atribut?"). Jangan langsung memberi jawaban; minta ahli lain menjelaskan lebih dulu. Pastikan setiap ahli mencatat poin kartu ajarnya.',
    pengantar:
      'Bersama ahli dari tim lain, pelajari materi topikmu dan jawab pertanyaan penuntun. Contoh memakai kasus <em>perpustakaan</em>, supaya kasus Lab RPL tetap menjadi tantangan tim asal.',
    topik: {
      entitas: {
        judul: 'Entitas & Kunci Primer',
        materi: [
          '<strong>Entitas</strong> adalah objek — orang, benda, tempat, atau kejadian — yang datanya perlu disimpan dan punya beberapa keterangan sendiri. Cari kata benda pada dokumen kebutuhan, lalu tanyakan: "Apakah datanya perlu disimpan?"',
          'Kejadian atau transaksi (misalnya <em>peminjaman</em>) juga entitas, karena setiap kejadian punya data sendiri: tanggal, siapa yang terlibat, dan nomornya.',
          '<strong>Kunci primer</strong> adalah atribut yang nilainya unik, tidak kosong, dan tidak berubah. Biasanya berupa kode atau nomor yang dibuat khusus, seperti NIS atau kode buku.',
        ],
        ciri: 'Entitas = objek/kejadian yang datanya disimpan. Kunci primer = kode unik yang tetap.',
        contoh: {
          entitas: [
            {
              id: 'anggota',
              label: 'Anggota Perpus',
              ikon: '🧑',
              atribut: [
                { id: 'no_anggota', teks: 'no_anggota', pk: true },
                { id: 'nama', teks: 'nama' },
                { id: 'kelas', teks: 'kelas' },
              ],
            },
          ],
          relasi: [],
        },
        pertanyaan: [
          {
            id: 'ahEn1',
            tanya:
              'Kebutuhan: "Perpustakaan mencatat setiap kunjungan siswa: tanggal, jam masuk, dan keperluannya." Mana yang menjadi entitas?',
            opsi: [
              { id: 'kunjungan', label: 'Kunjungan' },
              { id: 'tanggal', label: 'Tanggal' },
              { id: 'jam', label: 'Jam masuk' },
              { id: 'mencatat', label: 'Mencatat' },
            ],
            correct: 'kunjungan',
            umpan: {
              kunjungan: 'Tepat. Kunjungan adalah kejadian yang punya data sendiri.',
              tanggal: 'Tanggal adalah keterangan kunjungan — atribut.',
              jam: 'Jam masuk adalah keterangan kunjungan — atribut.',
              mencatat: 'Mencatat adalah proses yang dilakukan aplikasi, bukan data.',
            },
          },
          {
            id: 'ahEn2',
            tanya:
              'Mana yang paling tepat menjadi kunci primer entitas <strong>Anggota Perpus</strong>?',
            opsi: [
              { id: 'no', label: 'no_anggota' },
              { id: 'nama', label: 'nama' },
              { id: 'kelas', label: 'kelas' },
              { id: 'hp', label: 'no_hp' },
            ],
            correct: 'no',
            umpan: {
              no: 'Nomor anggota dibuat unik dan tidak berganti.',
              nama: 'Dua siswa bisa bernama sama.',
              kelas: 'Banyak anggota berada di kelas yang sama.',
              hp: 'Nomor HP bisa berganti atau dipakai bersama saudara.',
            },
          },
          {
            id: 'ahEn3',
            tanya:
              'Mengapa "warna sampul buku" pada kalimat "petugas suka buku bersampul biru" <strong>tidak</strong> dijadikan entitas?',
            opsi: [
              { id: 'bukan', label: 'Tidak ada data tentang warna yang perlu disimpan sistem' },
              { id: 'pendek', label: 'Karena namanya terlalu pendek' },
              { id: 'kata', label: 'Karena bukan kata benda' },
              { id: 'atribut', label: 'Karena warna selalu menjadi kunci primer' },
            ],
            correct: 'bukan',
            umpan: {
              bukan:
                'Benar. Tidak semua kata benda menjadi entitas — harus ada data yang perlu disimpan.',
              pendek: 'Panjang nama tidak berpengaruh.',
              kata: '"Warna sampul" kata benda, tetapi kebutuhannya tidak meminta data itu disimpan.',
              atribut: 'Warna sering kembar, jadi tidak cocok sebagai kunci primer.',
            },
          },
        ],
      },
      atribut: {
        judul: 'Atribut',
        materi: [
          '<strong>Atribut</strong> adalah keterangan yang melekat pada satu entitas. Letakkan atribut di entitas yang benar-benar <em>memilikinya</em>: nama penerbit milik Penerbit, bukan milik Buku.',
          'Tanyakan: "Atribut ini menerangkan siapa?" Bila sebuah atribut ditulis berulang di banyak baris (nama penerbit di setiap buku), itu tanda atribut tersebut milik entitas lain.',
          'Ada atribut yang milik <em>pasangan</em> dua entitas, misalnya <em>tanggal pinjam buku tertentu</em>. Atribut seperti ini disimpan di entitas penghubung (dibahas ahli kunci tamu).',
        ],
        ciri: 'Atribut menerangkan tepat satu entitas. Atribut yang berulang adalah tanda salah tempat.',
        contoh: {
          entitas: [
            {
              id: 'penerbit',
              label: 'Penerbit',
              ikon: '🏢',
              atribut: [
                { id: 'id_penerbit', teks: 'id_penerbit', pk: true },
                { id: 'nama_penerbit', teks: 'nama_penerbit' },
                { id: 'kota', teks: 'kota' },
              ],
            },
            {
              id: 'buku',
              label: 'Buku',
              ikon: '📚',
              atribut: [
                { id: 'kode_buku', teks: 'kode_buku', pk: true },
                { id: 'judul', teks: 'judul' },
                { id: 'tahun_terbit', teks: 'tahun_terbit' },
              ],
            },
          ],
          relasi: [],
        },
        pertanyaan: [
          {
            id: 'ahAt1',
            tanya: 'Atribut <code>kota</code> (kota asal penerbit) paling tepat diletakkan di …',
            opsi: [
              { id: 'penerbit', label: 'Entitas Penerbit' },
              { id: 'buku', label: 'Entitas Buku' },
              { id: 'anggota', label: 'Entitas Anggota Perpus' },
              { id: 'dua', label: 'Di Penerbit dan Buku sekaligus' },
            ],
            correct: 'penerbit',
            umpan: {
              penerbit: 'Tepat. Kota menerangkan penerbit.',
              buku: 'Bila disimpan di Buku, kota yang sama ditulis berulang untuk setiap buku penerbit itu.',
              anggota: 'Kota asal penerbit tidak menerangkan anggota perpustakaan.',
              dua: 'Menyimpan di dua tempat membuat data ganda yang bisa saling bertentangan.',
            },
          },
          {
            id: 'ahAt2',
            tanya:
              'Tabel Buku berisi kolom <code>nama_penerbit</code> yang ditulis ulang di ratusan baris. Apa artinya?',
            opsi: [
              {
                id: 'milikLain',
                label: 'Atribut itu milik entitas lain (Penerbit) yang perlu dipisah',
              },
              { id: 'wajar', label: 'Wajar, semakin banyak kolom semakin lengkap' },
              { id: 'kunci', label: 'nama_penerbit sebaiknya menjadi kunci primer Buku' },
              { id: 'hapus', label: 'Kolom itu harus dihapus dari sistem' },
            ],
            correct: 'milikLain',
            umpan: {
              milikLain: 'Benar. Pengulangan adalah tanda atribut salah tempat.',
              wajar: 'Pengulangan membuat data mudah tidak konsisten saat diubah.',
              kunci: 'Banyak buku punya penerbit sama — tidak unik.',
              hapus: 'Datanya tetap dibutuhkan, hanya tempatnya yang perlu dipindah.',
            },
          },
          {
            id: 'ahAt3',
            tanya:
              'Siswa bisa meminjam banyak buku dan satu buku dipinjam banyak siswa. <strong>Tanggal kembali</strong> sebuah buku pada sebuah peminjaman disimpan di …',
            opsi: [
              { id: 'penghubung', label: 'Entitas penghubung antara Peminjaman dan Buku' },
              { id: 'buku', label: 'Entitas Buku' },
              { id: 'anggota', label: 'Entitas Anggota Perpus' },
              { id: 'penerbit', label: 'Entitas Penerbit' },
            ],
            correct: 'penghubung',
            umpan: {
              penghubung: 'Tepat. Tanggal itu milik pasangan peminjaman–buku.',
              buku: 'Satu buku dipinjam berkali-kali dengan tanggal berbeda.',
              anggota: 'Satu anggota meminjam banyak buku dengan tanggal berbeda.',
              penerbit: 'Penerbit tidak terkait dengan tanggal pengembalian.',
            },
          },
        ],
      },
      relasi: {
        judul: 'Relasi & Kardinalitas',
        materi: [
          '<strong>Relasi</strong> menghubungkan dua entitas dengan kata kerja, misalnya <em>Penerbit menerbitkan Buku</em>. Relasi ditemukan dari <strong>aturan bisnis</strong> pada dokumen kebutuhan.',
          'Baca aturan dari <strong>dua arah</strong>: "Satu A punya minimal … dan maksimal … B", lalu sebaliknya. Hasilnya ditulis dengan notasi <code>min..maks</code>: 0..1, 1..1, 0..N, atau 1..N.',
          'Jenis relasi diturunkan dari kedua maksimum: 1 & 1 → 1:1, N & 1 → 1:N, N & N → M:N.',
        ],
        ciri: 'Baca dari dua arah; minimum = wajib/opsional, maksimum = satu/banyak.',
        contoh: {
          entitas: [],
          relasi: [
            {
              id: 'rTerbit',
              a: { id: 'penerbit', label: 'Penerbit', ikon: '🏢' },
              b: { id: 'buku', label: 'Buku', ikon: '📚' },
              kerja: 'menerbitkan',
              kerjaBalik: 'diterbitkan oleh',
              ab: '1..N',
              ba: '1..1',
            },
          ],
        },
        pertanyaan: [
          {
            id: 'ahRe1',
            tanya:
              'Aturan: "Penerbit didaftarkan bila sudah ada minimal satu bukunya, dan bisa menerbitkan banyak buku." Kardinalitas sisi Buku (dilihat dari Penerbit) adalah …',
            opsi: [
              { id: '1n', label: '1..N' },
              { id: '0n', label: '0..N' },
              { id: '11', label: '1..1' },
              { id: '01', label: '0..1' },
            ],
            correct: '1n',
            umpan: {
              '1n': 'Tepat: minimal satu (wajib), bisa banyak.',
              '0n': '"Minimal satu buku" berarti wajib — minimumnya 1, bukan 0.',
              11: 'Penerbit bisa menerbitkan <em>banyak</em> buku, jadi maksimumnya N.',
              '01': 'Minimumnya 1 dan maksimumnya N.',
            },
          },
          {
            id: 'ahRe2',
            tanya:
              'Aturan: "Seorang anggota boleh belum pernah meminjam, dan setiap peminjaman atas nama satu anggota." Jenis relasi <strong>Anggota – Peminjaman</strong> adalah …',
            opsi: opsiJenis(),
            correct: 'r1n',
            umpan: {
              r11: 'Anggota bisa meminjam berkali-kali — ada sisi "banyak".',
              r1n: 'Satu anggota → banyak peminjaman, satu peminjaman → satu anggota.',
              rmn: 'Dari arah peminjaman maksimumnya satu anggota.',
              tidak: 'Peminjaman dilakukan oleh anggota, jadi keduanya berelasi.',
            },
          },
          {
            id: 'ahRe3',
            tanya:
              'Aturan bisnis paling mudah ditemukan pada dokumen kebutuhan lewat kalimat yang …',
            opsi: [
              {
                id: 'jumlah',
                label: 'Menyebut berapa banyak pasangan: "satu", "beberapa", "boleh belum"',
              },
              { id: 'warna', label: 'Menyebut warna dan bentuk benda' },
              { id: 'proses', label: 'Menyebut fitur cetak atau kirim pesan' },
              { id: 'panjang', label: 'Paling panjang di dokumen' },
            ],
            correct: 'jumlah',
            umpan: {
              jumlah: 'Benar. Kata penunjuk jumlah dan kewajiban adalah petunjuk kardinalitas.',
              warna: 'Warna dan bentuk biasanya bukan data yang disimpan.',
              proses: 'Fitur adalah proses aplikasi, bukan aturan relasi.',
              panjang: 'Panjang kalimat tidak menentukan isinya.',
            },
          },
        ],
      },
      fk: {
        judul: 'Kunci Tamu & Entitas Penghubung M:N',
        materi: [
          '<strong>Kunci tamu</strong> (foreign key) adalah salinan kunci primer entitas lain yang menyambungkan dua entitas. Pada relasi <strong>1:N</strong>, kunci tamu selalu diletakkan di sisi <strong>banyak</strong>: setiap buku menyimpan <code>id_penerbit</code>.',
          'Pada relasi <strong>1:1</strong>, kunci tamu diletakkan di sisi yang <em>wajib</em> punya pasangan, supaya kolomnya tidak banyak yang kosong.',
          'Relasi <strong>M:N</strong> tidak bisa diwujudkan dengan satu kunci tamu. Buat <strong>entitas penghubung</strong> berisi kunci primer kedua entitas (biasanya menjadi kunci primer gabungan) beserta atribut milik pasangan itu.',
        ],
        ciri: '1:N → FK di sisi banyak. 1:1 → FK di sisi wajib. M:N → entitas penghubung.',
        contoh: {
          entitas: [
            {
              id: 'buku',
              label: 'Buku',
              ikon: '📚',
              atribut: [
                { id: 'kode_buku', teks: 'kode_buku', pk: true },
                { id: 'judul', teks: 'judul' },
              ],
            },
            {
              id: 'penulis',
              label: 'Penulis',
              ikon: '✍️',
              atribut: [
                { id: 'id_penulis', teks: 'id_penulis', pk: true },
                { id: 'nama_penulis', teks: 'nama_penulis' },
              ],
            },
            {
              id: 'karya',
              label: 'Karya',
              ikon: '🧾',
              penghubung: true,
              atribut: [
                { id: 'karya_kode_buku', teks: 'kode_buku', pk: true, fk: 'buku' },
                { id: 'karya_id_penulis', teks: 'id_penulis', pk: true, fk: 'penulis' },
                { id: 'urutan_penulis', teks: 'urutan_penulis' },
              ],
            },
          ],
          relasi: [
            {
              id: 'rTulis',
              a: { id: 'buku', label: 'Buku', ikon: '📚' },
              b: { id: 'penulis', label: 'Penulis', ikon: '✍️' },
              kerja: 'ditulis',
              kerjaBalik: 'menulis',
              ab: '1..N',
              ba: '1..N',
              penghubung: 'karya',
            },
          ],
        },
        pertanyaan: [
          {
            id: 'ahFk1',
            tanya:
              'Relasi <strong>Penerbit – Buku</strong> adalah 1:N. Kunci tamu <code>id_penerbit</code> diletakkan di …',
            opsi: [
              { id: 'buku', label: 'Entitas Buku (sisi banyak)' },
              { id: 'penerbit', label: 'Entitas Penerbit (sisi satu)' },
              { id: 'dua', label: 'Di kedua entitas' },
              { id: 'penghubung', label: 'Entitas penghubung baru' },
            ],
            correct: 'buku',
            umpan: {
              buku: 'Tepat. Setiap buku cukup menyimpan satu id_penerbit.',
              penerbit: 'Satu penerbit punya banyak buku — satu kolom kode_buku tidak cukup.',
              dua: 'Cukup di satu sisi; dua sisi menimbulkan data ganda.',
              penghubung: 'Penghubung hanya untuk M:N.',
            },
          },
          {
            id: 'ahFk2',
            tanya:
              'Kunci primer entitas penghubung <strong>Karya</strong> yang paling tepat adalah …',
            opsi: [
              { id: 'gabung', label: 'Gabungan kode_buku + id_penulis' },
              { id: 'buku', label: 'kode_buku saja' },
              { id: 'penulis', label: 'id_penulis saja' },
              { id: 'urutan', label: 'urutan_penulis' },
            ],
            correct: 'gabung',
            umpan: {
              gabung: 'Benar. Pasangan buku–penulis yang sama tidak boleh tercatat dua kali.',
              buku: 'Satu buku punya beberapa penulis, jadi kode_buku berulang di Karya.',
              penulis: 'Satu penulis menulis beberapa buku, jadi id_penulis berulang.',
              urutan: 'Banyak buku punya penulis urutan ke-1 — tidak unik.',
            },
          },
          {
            id: 'ahFk3',
            tanya:
              'Mengapa relasi M:N <strong>tidak</strong> cukup diwujudkan dengan kolom <code>id_penulis</code> di Buku?',
            opsi: [
              {
                id: 'satuKolom',
                label: 'Satu kolom hanya muat satu penulis, padahal buku bisa punya beberapa',
              },
              { id: 'dilarang', label: 'Karena kunci tamu dilarang di basis data' },
              { id: 'lambat', label: 'Karena kolom angka membuat aplikasi lambat' },
              { id: 'nama', label: 'Karena seharusnya nama_penulis yang disalin' },
            ],
            correct: 'satuKolom',
            umpan: {
              satuKolom:
                'Tepat. Itulah alasan M:N dipecah menjadi dua relasi 1:N lewat penghubung.',
              dilarang: 'Kunci tamu justru alat utama menyambungkan tabel.',
              lambat: 'Masalahnya bukan kecepatan, melainkan daya tampung data.',
              nama: 'Menyalin nama malah membuat data berulang dan tetap hanya muat satu penulis.',
            },
          },
        ],
      },
    },
  },

  analisis: {
    kicker: 'Tahap 6 · Bedah Kebutuhan',
    title: 'Kembali ke Tim Asal: Bedah Dokumen Kebutuhan',
    goal: 'Mengajarkan topik ahli kepada tim asal dan memilah frasa dokumen kebutuhan menjadi bahan ERD.',
    guru: 'Minta setiap ahli mengajar ±3 menit memakai kartu ringkasnya, urut: entitas, atribut, relasi, kunci tamu. Pemeriksa Kebutuhan meminta alasan setiap pemilahan. Berkeliling dan pantau apakah setiap anggota bisa menjelaskan, bukan hanya ahlinya.',
    pengantar:
      'Setiap ahli mengajarkan kartu ringkasnya. Setelah itu, baca bersama dua dokumen hasil analisis kebutuhan Lab RPL. Frasa penting sudah ditandai dan diberi nomor — pilah setiap frasa ke bahan ERD yang tepat.',
    dokumen: [
      {
        id: 'd1',
        ikon: '🎙️',
        jenis: 'Transkrip wawancara',
        judul: 'Wawancara dengan Pak Budi (Kepala Lab RPL)',
        teks:
          'Analis: Pak, apa yang perlu dicatat aplikasi peminjaman nanti?\n' +
          'Pak Budi: Setiap [[f1|siswa]] yang meminjam harus tercatat [[f2|NIS, nama, dan kelasnya]]. [[f3|Satu siswa boleh meminjam berkali-kali, tetapi setiap peminjaman hanya atas nama satu siswa]].\n' +
          'Pak Budi: Setiap alat kami beri [[f4|kode alat, nama alat, dan kondisinya]]. Alat dikelompokkan menurut [[f5|kategori alat]] — laptop, proyektor, kabel jaringan — dan daftar kategorinya bisa ditambah petugas.\n' +
          'Pak Budi: Yang sering bikin repot, [[f6|satu kali pinjam bisa membawa beberapa alat, dan alat yang sama dipinjam bergantian di banyak peminjaman]].\n' +
          'Pak Budi: Oh ya, lab baru saja [[f7|memasang AC baru]]. Saya juga ingin aplikasi bisa [[f8|mengirim pengingat WhatsApp saat alat terlambat kembali]].',
      },
      {
        id: 'd2',
        ikon: '📋',
        jenis: 'Formulir lama',
        judul: 'Formulir peminjaman alat (kertas)',
        teks:
          'FORMULIR PEMINJAMAN ALAT LAB RPL\n' +
          'Setiap [[f9|transaksi peminjaman]] diberi nomor pinjam sendiri.\n' +
          'Diisi: [[f10|tanggal pinjam dan tanggal kembali]]\n' +
          'Dicatat oleh: [[f11|petugas lab]] yang bertugas — [[f12|setiap formulir diparaf tepat satu petugas, dan satu petugas mencatat banyak formulir]].\n' +
          'Daftar alat dipinjam: tulis juga [[f13|kondisi setiap alat saat dikembalikan]].\n' +
          'Catatan: formulir [[f14|dicetak di kertas warna biru]].',
      },
    ],
    kategori: [
      { id: 'entitas', label: '🧱 Entitas' },
      { id: 'atribut', label: '🏷️ Atribut' },
      { id: 'aturan', label: '🔀 Aturan relasi (kardinalitas)' },
      { id: 'bukan', label: '🚫 Bukan data yang disimpan' },
    ],
    frasa: [
      {
        id: 'f1',
        teks: 'siswa',
        correct: 'entitas',
        explanation: 'Siswa adalah orang yang datanya disimpan dan punya keterangan sendiri.',
      },
      {
        id: 'f2',
        teks: 'NIS, nama, dan kelasnya',
        correct: 'atribut',
        explanation: 'Ketiganya keterangan yang melekat pada siswa.',
      },
      {
        id: 'f3',
        teks: 'Satu siswa boleh meminjam berkali-kali, tetapi setiap peminjaman hanya atas nama satu siswa',
        correct: 'aturan',
        explanation:
          'Kalimat ini menyebut batas pasangan dari dua arah — sumber kardinalitas Siswa–Peminjaman.',
      },
      {
        id: 'f4',
        teks: 'kode alat, nama alat, dan kondisinya',
        correct: 'atribut',
        explanation: 'Semuanya keterangan tentang alat.',
      },
      {
        id: 'f5',
        teks: 'kategori alat',
        correct: 'entitas',
        explanation:
          'Kategori punya daftar sendiri yang bisa ditambah dan dipakai banyak alat, jadi dipisah menjadi entitas agar namanya tidak ditulis berulang.',
      },
      {
        id: 'f6',
        teks: 'satu kali pinjam bisa membawa beberapa alat, dan alat yang sama dipinjam bergantian di banyak peminjaman',
        correct: 'aturan',
        explanation: 'Dua arah sama-sama "banyak" — petunjuk relasi M:N Peminjaman–Alat.',
      },
      {
        id: 'f7',
        teks: 'memasang AC baru',
        correct: 'bukan',
        explanation: 'Informasi tentang ruangan ini tidak perlu disimpan sistem peminjaman.',
      },
      {
        id: 'f8',
        teks: 'mengirim pengingat WhatsApp saat alat terlambat kembali',
        correct: 'bukan',
        explanation:
          'Ini fitur/proses aplikasi. Prosesnya memakai data tanggal kembali, tetapi bukan data baru.',
      },
      {
        id: 'f9',
        teks: 'transaksi peminjaman',
        correct: 'entitas',
        explanation:
          'Peminjaman adalah kejadian yang punya data sendiri: nomor, tanggal, peminjam, petugas.',
      },
      {
        id: 'f10',
        teks: 'tanggal pinjam dan tanggal kembali',
        correct: 'atribut',
        explanation: 'Keduanya keterangan setiap transaksi peminjaman.',
      },
      {
        id: 'f11',
        teks: 'petugas lab',
        correct: 'entitas',
        explanation:
          'Petugas adalah orang yang datanya disimpan karena mencatat setiap peminjaman.',
      },
      {
        id: 'f12',
        teks: 'setiap formulir diparaf tepat satu petugas, dan satu petugas mencatat banyak formulir',
        correct: 'aturan',
        explanation: 'Batas pasangan dua arah — sumber kardinalitas Petugas–Peminjaman (1:N).',
      },
      {
        id: 'f13',
        teks: 'kondisi setiap alat saat dikembalikan',
        correct: 'atribut',
        explanation:
          'Ini atribut — tetapi miliknya pasangan peminjaman–alat. Ingat frasa ini saat merakit relasi!',
      },
      {
        id: 'f14',
        teks: 'dicetak di kertas warna biru',
        correct: 'bukan',
        explanation: 'Warna kertas formulir tidak perlu disimpan di basis data.',
      },
    ],
    temuan:
      'Tim kalian menemukan bahan ERD: <strong>4 entitas</strong> langsung dari dokumen (Siswa, Kategori Alat, Peminjaman, Petugas Lab) ditambah Alat yang disebut berulang, <strong>atribut</strong> masing-masing, dan <strong>3 aturan relasi</strong> — salah satunya M:N. Hal yang bukan data (AC, kertas biru, fitur pengingat) tidak masuk ERD.',
  },

  rancang: {
    kicker: 'Tahap 7 · Rakit Entitas',
    title: 'Rakit Entitas, Atribut, dan Kunci Primer',
    goal: 'Mengelompokkan atribut ke entitas pemiliknya dan menentukan kunci primer setiap entitas.',
    guru: 'Satu perangkat per tim boleh dipakai bersama: Pencatat yang memilih, ahli atribut dan ahli entitas memimpin diskusi. Bila tim ragu, tanyakan "Atribut ini menerangkan siapa?" dan "Apakah nilainya bisa kembar?". Atribut yang menyambungkan entitas (kunci tamu) sengaja belum muncul — itu tugas tahap berikutnya.',
    pengantar:
      'Dari hasil bedah dokumen, tim menetapkan lima entitas utama. Kelompokkan setiap atribut ke entitas pemiliknya, lalu tentukan kunci primer tiap entitas. Kartu entitas di bawah akan terisi sesuai jawaban tim.',
    entitas: ['siswa', 'petugas', 'kategori', 'alat', 'pinjam'],
    atribut: [
      {
        id: 'nis',
        teks: 'nis',
        correct: 'siswa',
        explanation: 'Nomor induk menerangkan siswa.',
      },
      {
        id: 'nama_siswa',
        teks: 'nama_siswa',
        correct: 'siswa',
        explanation: 'Nama siswa melekat pada siswa.',
      },
      { id: 'kelas', teks: 'kelas', correct: 'siswa', explanation: 'Kelas menerangkan siswa.' },
      {
        id: 'id_petugas',
        teks: 'id_petugas',
        correct: 'petugas',
        explanation: 'Nomor pengenal petugas lab.',
      },
      {
        id: 'nama_petugas',
        teks: 'nama_petugas',
        correct: 'petugas',
        explanation: 'Nama milik petugas lab.',
      },
      {
        id: 'id_kategori',
        teks: 'id_kategori',
        correct: 'kategori',
        explanation: 'Pengenal setiap kategori alat.',
      },
      {
        id: 'nama_kategori',
        teks: 'nama_kategori',
        correct: 'kategori',
        explanation:
          'Nama kategori (laptop, proyektor) disimpan sekali di Kategori Alat, tidak diulang di setiap alat.',
      },
      {
        id: 'kode_alat',
        teks: 'kode_alat',
        correct: 'alat',
        explanation: 'Kode yang ditempel di setiap alat.',
      },
      { id: 'nama_alat', teks: 'nama_alat', correct: 'alat', explanation: 'Nama milik alat.' },
      {
        id: 'kondisi_alat',
        teks: 'kondisi_alat',
        correct: 'alat',
        explanation: 'Kondisi terkini sebuah alat (baik/rusak) menerangkan alat itu sendiri.',
      },
      {
        id: 'no_pinjam',
        teks: 'no_pinjam',
        correct: 'pinjam',
        explanation: 'Nomor setiap transaksi peminjaman.',
      },
      {
        id: 'tgl_pinjam',
        teks: 'tgl_pinjam',
        correct: 'pinjam',
        explanation: 'Tanggal pinjam menerangkan transaksinya, bukan siswa atau alat.',
      },
      {
        id: 'tgl_kembali',
        teks: 'tgl_kembali',
        correct: 'pinjam',
        explanation: 'Batas kembali berlaku untuk satu transaksi peminjaman.',
      },
    ],
    kunci: [
      {
        id: 'pkSiswa',
        entitas: 'siswa',
        tanya: 'Kunci primer entitas <strong>Siswa</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'nis', label: 'nis' },
          { id: 'nama_siswa', label: 'nama_siswa' },
          { id: 'kelas', label: 'kelas' },
          { id: 'gabung', label: 'nama_siswa + kelas' },
        ],
        correct: 'nis',
        umpan: {
          nis: 'Tepat. NIS unik untuk setiap siswa dan tidak berubah.',
          nama_siswa: 'Dua siswa bisa bernama sama.',
          kelas: 'Banyak siswa berada di kelas yang sama.',
          gabung: 'Nama kembar di kelas yang sama tetap mungkin, dan kelas berganti setiap tahun.',
        },
      },
      {
        id: 'pkPetugas',
        entitas: 'petugas',
        tanya: 'Kunci primer entitas <strong>Petugas Lab</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'id_petugas', label: 'id_petugas' },
          { id: 'nama_petugas', label: 'nama_petugas' },
          { id: 'shift', label: 'shift jaga' },
          { id: 'tanpa', label: 'Tidak perlu kunci primer' },
        ],
        correct: 'id_petugas',
        umpan: {
          id_petugas: 'Benar. Pengenal khusus yang unik untuk setiap petugas.',
          nama_petugas: 'Nama bisa kembar dan bisa ditulis berbeda-beda.',
          shift: 'Banyak petugas berjaga pada shift yang sama.',
          tanpa: 'Setiap entitas wajib punya kunci primer agar datanya bisa dibedakan dan dirujuk.',
        },
      },
      {
        id: 'pkKategori',
        entitas: 'kategori',
        tanya: 'Kunci primer entitas <strong>Kategori Alat</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'id_kategori', label: 'id_kategori' },
          { id: 'nama_kategori', label: 'nama_kategori' },
          { id: 'kode_alat', label: 'kode_alat' },
          { id: 'jumlah', label: 'jumlah_alat' },
        ],
        correct: 'id_kategori',
        umpan: {
          id_kategori: 'Tepat. Pengenal tetap meski nama kategori diganti.',
          nama_kategori:
            'Nama kategori bisa diganti ("Kabel" → "Kabel Jaringan") — kunci sebaiknya tetap.',
          kode_alat: 'kode_alat milik Alat, bukan milik Kategori.',
          jumlah: 'Jumlah alat bisa sama dan selalu berubah — lagi pula nilainya dapat dihitung.',
        },
      },
      {
        id: 'pkAlat',
        entitas: 'alat',
        tanya: 'Kunci primer entitas <strong>Alat</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'kode_alat', label: 'kode_alat' },
          { id: 'nama_alat', label: 'nama_alat' },
          { id: 'kondisi_alat', label: 'kondisi_alat' },
          { id: 'id_kategori', label: 'id_kategori' },
        ],
        correct: 'kode_alat',
        umpan: {
          kode_alat: 'Benar. Setiap unit alat diberi kode unik.',
          nama_alat: 'Lab punya banyak "Laptop ASUS" — nama kembar.',
          kondisi_alat: 'Banyak alat berkondisi "baik".',
          id_kategori: 'Banyak alat masuk kategori yang sama.',
        },
      },
      {
        id: 'pkPinjam',
        entitas: 'pinjam',
        tanya: 'Kunci primer entitas <strong>Peminjaman</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'no_pinjam', label: 'no_pinjam' },
          { id: 'tgl_pinjam', label: 'tgl_pinjam' },
          { id: 'tgl_kembali', label: 'tgl_kembali' },
          { id: 'gabung', label: 'tgl_pinjam + tgl_kembali' },
        ],
        correct: 'no_pinjam',
        umpan: {
          no_pinjam: 'Tepat. Nomor pinjam dibuat unik untuk setiap transaksi.',
          tgl_pinjam: 'Banyak peminjaman terjadi pada tanggal yang sama.',
          tgl_kembali: 'Banyak peminjaman kembali pada tanggal yang sama.',
          gabung: 'Dua siswa bisa meminjam dan mengembalikan pada tanggal yang sama.',
        },
      },
    ],
    simpulan:
      'Lima entitas sudah lengkap dengan atribut dan kunci primernya. Perhatikan: belum ada yang menyambungkan Siswa dengan Peminjaman atau Alat dengan Kategori. Itu tugas <strong>relasi dan kunci tamu</strong> di tahap berikutnya.',
  },

  relasi: {
    kicker: 'Tahap 8 · Rakit Relasi',
    title: 'Rakit Relasi, Penghubung, dan Kunci Tamu',
    goal: 'Menentukan kardinalitas setiap relasi, mewujudkan relasi M:N, dan meletakkan kunci tamu hingga ERD lengkap.',
    guru: 'Ahli relasi memimpin langkah ①, ahli kunci tamu memimpin langkah ②. Bila tim keliru di minimum, tanyakan "Apakah boleh tidak ada?"; bila keliru di maksimum, "Apakah boleh lebih dari satu?". Setelah ERD lengkap muncul, minta Pemeriksa Kebutuhan mencocokkan setiap entitas dan relasi dengan dokumen kebutuhan.',
    pengantar:
      'Pakai aturan relasi hasil bedah dokumen. Pilih kardinalitas <strong>setiap sisi</strong> relasi — diagram berubah sesuai pilihan tim. Setelah itu, sambungkan entitas dengan kunci tamu dan pecah relasi M:N.',
    relasi: RELASI_LAB,
    pertanyaan: [
      {
        id: 'fkNis',
        relasi: 'rLakukan',
        di: 'pinjam',
        tanya:
          'Relasi <strong>Siswa – Peminjaman</strong> berjenis 1:N. Kunci tamu <code>nis</code> diletakkan di …',
        opsi: [
          { id: 'pinjam', label: 'Entitas Peminjaman (sisi banyak)' },
          { id: 'siswa', label: 'Entitas Siswa (sisi satu)' },
          { id: 'dua', label: 'Di Siswa dan Peminjaman sekaligus' },
          { id: 'penghubung', label: 'Entitas penghubung baru' },
        ],
        correct: 'pinjam',
        umpan: {
          pinjam: 'Tepat. Setiap peminjaman cukup menyimpan satu nis peminjamnya.',
          siswa: 'Satu siswa punya banyak peminjaman — satu kolom no_pinjam di Siswa tidak cukup.',
          dua: 'Cukup di satu sisi; dua sisi menimbulkan data ganda.',
          penghubung: 'Penghubung hanya untuk M:N, sedangkan relasi ini 1:N.',
        },
      },
      {
        id: 'fkPetugas',
        relasi: 'rCatat',
        di: 'pinjam',
        tanya:
          'Relasi <strong>Petugas Lab – Peminjaman</strong> juga 1:N. Atribut apa yang ditambahkan ke Peminjaman?',
        opsi: [
          { id: 'id_petugas', label: 'id_petugas sebagai kunci tamu' },
          { id: 'nama_petugas', label: 'Salinan nama_petugas' },
          { id: 'semua', label: 'Semua atribut Petugas Lab' },
          { id: 'tanpa', label: 'Tidak perlu atribut tambahan' },
        ],
        correct: 'id_petugas',
        umpan: {
          id_petugas: 'Benar. Kunci tamu cukup berisi kunci primer entitas yang dirujuk.',
          nama_petugas: 'Nama bisa kembar dan berubah — rujukan harus memakai kunci primer.',
          semua: 'Menyalin semua atribut membuat data petugas berulang di setiap peminjaman.',
          tanpa: 'Tanpa kunci tamu, sistem tidak tahu petugas mana yang mencatat.',
        },
      },
      {
        id: 'fkKategori',
        relasi: 'rKelompok',
        di: 'alat',
        tanya:
          'Relasi <strong>Kategori Alat – Alat</strong> berjenis 1:N. Kunci tamu <code>id_kategori</code> diletakkan di …',
        opsi: [
          { id: 'alat', label: 'Entitas Alat (sisi banyak)' },
          { id: 'kategori', label: 'Entitas Kategori Alat (sisi satu)' },
          { id: 'pinjam', label: 'Entitas Peminjaman' },
          { id: 'penghubung', label: 'Entitas penghubung baru' },
        ],
        correct: 'alat',
        umpan: {
          alat: 'Tepat. Setiap alat menyimpan satu id_kategori.',
          kategori: 'Satu kategori berisi banyak alat — satu kolom kode_alat tidak cukup.',
          pinjam: 'Kategori tidak berelasi langsung dengan Peminjaman.',
          penghubung: 'Relasi ini 1:N, jadi tidak memerlukan penghubung.',
        },
      },
      {
        id: 'mnCara',
        relasi: 'rMuat',
        tanya:
          'Relasi <strong>Peminjaman – Alat</strong> berjenis M:N. Bagaimana tim mewujudkannya?',
        opsi: [
          {
            id: 'penghubung',
            label: 'Membuat entitas penghubung Detail Peminjaman berisi no_pinjam dan kode_alat',
          },
          { id: 'fkAlat', label: 'Menambah kode_alat di Peminjaman' },
          { id: 'fkPinjam', label: 'Menambah no_pinjam di Alat' },
          { id: 'kolom', label: 'Menambah kolom alat1, alat2, alat3 di Peminjaman' },
        ],
        correct: 'penghubung',
        umpan: {
          penghubung: 'Tepat! Detail Peminjaman memecah M:N menjadi dua relasi 1:N.',
          fkAlat: 'Satu kolom hanya muat satu alat, padahal satu peminjaman bisa beberapa alat.',
          fkPinjam: 'Satu kolom hanya muat satu peminjaman, padahal alat dipinjam berkali-kali.',
          kolom: 'Kolom berulang membatasi jumlah alat dan menyulitkan pencarian.',
        },
      },
      {
        id: 'mnAtribut',
        relasi: 'rMuat',
        tanya:
          'Ingat frasa "<em>kondisi setiap alat saat dikembalikan</em>". Atribut <code>kondisi_kembali</code> disimpan di …',
        opsi: [
          { id: 'detail', label: 'Entitas penghubung Detail Peminjaman' },
          { id: 'alat', label: 'Entitas Alat' },
          { id: 'pinjam', label: 'Entitas Peminjaman' },
          { id: 'petugas', label: 'Entitas Petugas Lab' },
        ],
        correct: 'detail',
        umpan: {
          detail: 'Benar. Kondisi itu milik pasangan peminjaman–alat tertentu.',
          alat: 'Alat dipinjam berkali-kali; kondisi saat setiap pengembalian bisa berbeda.',
          pinjam: 'Satu peminjaman membawa beberapa alat dengan kondisi berbeda-beda.',
          petugas: 'Petugas memeriksa, tetapi kondisinya milik alat pada peminjaman itu.',
        },
      },
      {
        id: 'mnKunci',
        relasi: 'rMuat',
        tanya: 'Kunci primer <strong>Detail Peminjaman</strong> yang paling tepat adalah …',
        opsi: [
          { id: 'gabung', label: 'Gabungan no_pinjam + kode_alat' },
          { id: 'no_pinjam', label: 'no_pinjam saja' },
          { id: 'kode_alat', label: 'kode_alat saja' },
          { id: 'kondisi_kembali', label: 'kondisi_kembali' },
        ],
        correct: 'gabung',
        umpan: {
          gabung: 'Tepat. Satu alat tidak dicatat dua kali pada peminjaman yang sama.',
          no_pinjam: 'Satu peminjaman memuat beberapa alat, jadi no_pinjam berulang.',
          kode_alat: 'Satu alat dipinjam berkali-kali, jadi kode_alat berulang.',
          kondisi_kembali: 'Banyak baris berkondisi "baik" — tidak unik.',
        },
      },
    ],
    simpulan:
      'ERD Sistem Peminjaman Alat Lab RPL kalian <strong>lengkap</strong>: enam entitas berkunci primer, tiga relasi 1:N dengan kunci tamu di sisi banyak, dan relasi M:N Peminjaman–Alat yang diwujudkan lewat <strong>Detail Peminjaman</strong>. Pemeriksa Kebutuhan: cocokkan sekali lagi dengan dokumen!',
  },

  /* ==========================================================
     SINTAKS 5 — Evaluasi
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 9 · Evaluasi',
    title: 'Evaluasi Individu & Uji Silang',
    goal: 'Mengukur pemahaman individu dan memeriksa ERD tim lain berdasarkan kebutuhan.',
    guru: 'Kuis dikerjakan individu tanpa diskusi. Untuk uji silang pakai teknik <strong>Dua Tinggal Dua Tamu</strong>: dua anggota tinggal menjelaskan ERD tim, dua lainnya bertamu ke tim lain untuk memeriksa ERD-nya, lalu kembali melaporkan temuan. Media menampilkan contoh ERD tim tamu yang perlu diperiksa.',
    pengantarKuis:
      'Jawab 5 soal berikut <strong>sendiri</strong>, masing-masing hanya sekali. Kasusnya: aplikasi bank sampah sekolah. Nilaimu dibandingkan dengan skor dasar untuk menghitung poin peningkatan.',
    soal: [
      {
        id: 'ev1',
        tanya:
          'Kebutuhan: "Bank sampah perlu mencatat setiap <em>nasabah</em> beserta nomor rekening dan nama kelasnya." Mana yang menjadi <strong>entitas</strong>?',
        opsi: [
          { id: 'nasabah', label: 'Nasabah' },
          { id: 'rekening', label: 'no_rekening' },
          { id: 'kelas', label: 'nama_kelas' },
          { id: 'catat', label: 'Mencatat' },
        ],
        correct: 'nasabah',
        umpan: {
          nasabah: 'Nasabah adalah objek yang datanya disimpan dan punya keterangan sendiri.',
          rekening: 'Nomor rekening adalah keterangan (dan calon kunci primer) nasabah.',
          kelas: 'Nama kelas adalah keterangan nasabah — atribut.',
          catat: 'Mencatat adalah proses, bukan objek yang datanya disimpan.',
        },
      },
      {
        id: 'ev2',
        tanya:
          'Entitas <strong>Jenis Sampah</strong> punya atribut berikut. Mana yang paling tepat menjadi <strong>kunci primer</strong>?',
        opsi: [
          { id: 'kode', label: 'kode_jenis' },
          { id: 'nama', label: 'nama_jenis' },
          { id: 'harga', label: 'harga_per_kg' },
          { id: 'berat', label: 'berat' },
        ],
        correct: 'kode',
        umpan: {
          kode: 'Kode dibuat unik dan tidak berubah — ciri kunci primer yang baik.',
          nama: 'Nama jenis bisa diganti atau ditulis berbeda ("Plastik"/"Botol plastik").',
          harga: 'Banyak jenis sampah berharga sama, dan harga berubah-ubah.',
          berat: 'Berat milik setiap setoran, bukan pengenal jenis sampah.',
        },
      },
      {
        id: 'ev3',
        tanya:
          'Aturan: "Satu nasabah bisa melakukan banyak setoran, dan setiap setoran milik tepat satu nasabah." Jenis relasi <strong>Nasabah – Setoran</strong> adalah …',
        opsi: opsiJenis(),
        correct: 'r1n',
        umpan: {
          r11: 'Satu nasabah bisa menyetor <em>banyak</em> kali — ada sisi "banyak".',
          r1n: 'Satu nasabah → banyak setoran, satu setoran → satu nasabah: One-to-Many.',
          rmn: 'Dari arah setoran maksimumnya satu nasabah.',
          tidak: 'Setoran dilakukan oleh nasabah, jadi keduanya berelasi.',
        },
      },
      {
        id: 'ev4',
        tanya:
          'Untuk mewujudkan relasi <strong>Nasabah – Setoran (1:N)</strong>, kunci tamu diletakkan dengan cara …',
        opsi: [
          { id: 'diSetoran', label: 'Menambah no_rekening di entitas Setoran' },
          { id: 'diNasabah', label: 'Menambah id_setoran di entitas Nasabah' },
          { id: 'keduanya', label: 'Menambah kunci tamu di kedua entitas' },
          { id: 'penghubung', label: 'Membuat entitas penghubung Nasabah_Setoran' },
        ],
        correct: 'diSetoran',
        umpan: {
          diSetoran: 'Kunci tamu di sisi "banyak": setiap setoran menyimpan satu no_rekening.',
          diNasabah: 'Satu nasabah punya banyak setoran — satu kolom id_setoran tidak cukup.',
          keduanya: 'Menyimpan di kedua sisi membuat data ganda yang bisa saling bertentangan.',
          penghubung: 'Entitas penghubung hanya diperlukan untuk relasi M:N.',
        },
      },
      {
        id: 'ev5',
        tanya:
          'Satu setoran berisi beberapa jenis sampah, dan satu jenis sampah ada di banyak setoran. <strong>Berat</strong> tiap jenis sampah dalam sebuah setoran paling tepat disimpan di …',
        opsi: [
          { id: 'detail', label: 'Entitas penghubung Detail Setoran' },
          { id: 'setoran', label: 'Entitas Setoran' },
          { id: 'jenis', label: 'Entitas Jenis Sampah' },
          { id: 'nasabah', label: 'Entitas Nasabah' },
        ],
        correct: 'detail',
        umpan: {
          detail:
            'Berat milik <em>pasangan</em> setoran–jenis sampah, jadi disimpan di entitas penghubung.',
          setoran:
            'Satu setoran berisi beberapa jenis dengan berat berbeda — satu kolom tidak cukup.',
          jenis: 'Satu jenis sampah disetor berkali-kali dengan berat berbeda.',
          nasabah: 'Nasabah tidak menyimpan berat setiap jenis sampah.',
        },
      },
    ],
    ujiSilang: {
      pengantar:
        '<strong>Dua Tinggal Dua Tamu:</strong> kamu bertamu ke Tim Merah yang merancang ERD <em>Bank Sampah Sekolah</em> dari aturan berikut: "Nasabah boleh belum pernah menyetor dan bisa menyetor berkali-kali; setiap setoran milik satu nasabah. Satu setoran berisi minimal satu jenis sampah dan bisa beberapa; satu jenis sampah bisa ada di banyak setoran." Periksa ERD mereka.',
      erd: {
        entitas: [
          {
            id: 'nasabah',
            label: 'Nasabah',
            ikon: '🧑‍🎓',
            atribut: [
              { id: 'no_rekening', teks: 'no_rekening', pk: true },
              { id: 'nama_nasabah', teks: 'nama_nasabah' },
              { id: 'nama_kelas', teks: 'nama_kelas' },
              { id: 'nasabah_id_setoran', teks: 'id_setoran', fk: 'setoran' },
            ],
          },
          {
            id: 'setoran',
            label: 'Setoran',
            ikon: '♻️',
            atribut: [
              { id: 'id_setoran', teks: 'id_setoran', pk: true },
              { id: 'tgl_setor', teks: 'tgl_setor' },
              { id: 'setoran_kode_jenis', teks: 'kode_jenis', fk: 'jenis' },
            ],
          },
          {
            id: 'jenis',
            label: 'Jenis Sampah',
            ikon: '🧴',
            atribut: [
              { id: 'kode_jenis', teks: 'kode_jenis' },
              { id: 'nama_jenis', teks: 'nama_jenis', pk: true },
              { id: 'harga_per_kg', teks: 'harga_per_kg' },
            ],
          },
        ],
        relasi: [
          {
            id: 'rSetor',
            a: { id: 'nasabah', label: 'Nasabah', ikon: '🧑‍🎓' },
            b: { id: 'setoran', label: 'Setoran', ikon: '♻️' },
            kerja: 'melakukan',
            kerjaBalik: 'dilakukan oleh',
            ab: '0..N',
            ba: '1..1',
          },
          {
            id: 'rIsi',
            a: { id: 'setoran', label: 'Setoran', ikon: '♻️' },
            b: { id: 'jenis', label: 'Jenis Sampah', ikon: '🧴' },
            kerja: 'berisi',
            kerjaBalik: 'ada di',
            ab: '1..N',
            ba: '0..N',
          },
        ],
      },
      tanya: 'Temukan <strong>semua</strong> kesalahan pada ERD Tim Merah.',
      opsi: [
        {
          id: 'salahFk',
          label:
            'Kunci tamu id_setoran di Nasabah salah tempat; seharusnya no_rekening menjadi kunci tamu di Setoran',
          benar: true,
          alasan:
            'Relasinya 1:N, jadi kunci tamu di sisi banyak (Setoran). Satu kolom id_setoran tidak cukup untuk nasabah yang menyetor berkali-kali.',
        },
        {
          id: 'salahMn',
          label:
            'Relasi Setoran – Jenis Sampah M:N belum diwujudkan; perlu entitas penghubung Detail Setoran',
          benar: true,
          alasan:
            'Satu kode_jenis di Setoran hanya muat satu jenis, padahal satu setoran bisa beberapa jenis.',
        },
        {
          id: 'salahPk',
          label: 'nama_jenis kurang tepat sebagai kunci primer; sebaiknya kode_jenis',
          benar: true,
          alasan: 'Nama bisa diganti atau ditulis berbeda, sedangkan kode dibuat unik dan tetap.',
        },
        {
          id: 'kelasPk',
          label: 'nama_kelas seharusnya menjadi kunci primer Nasabah',
          benar: false,
          alasan: 'Banyak nasabah berada di kelas yang sama — tidak unik.',
        },
        {
          id: 'setorMn',
          label: 'Relasi Nasabah – Setoran seharusnya M:N',
          benar: false,
          alasan: 'Setiap setoran milik tepat satu nasabah, jadi 1:N sudah benar.',
        },
        {
          id: 'tglPindah',
          label: 'tgl_setor seharusnya dipindah ke Nasabah',
          benar: false,
          alasan: 'Tanggal setor menerangkan setiap setoran, bukan nasabahnya.',
        },
      ],
      done: '<strong>Uji silang tuntas!</strong> Kembali ke tim asal dan laporkan ketiga kesalahan beserta alasannya kepada Juru Bicara Tim Merah.',
    },
  },

  /* ==========================================================
     SINTAKS 6 — Memberikan penghargaan
     ========================================================== */
  penghargaan: {
    kicker: 'Tahap 10 · Penghargaan',
    title: 'Poin Peningkatan & Predikat Tim',
    goal: 'Menghitung sumbangan poin peningkatan individu dan menentukan predikat tim.',
    guru: 'Minta setiap anggota menyebutkan poin peningkatannya, lalu Pencatat memasukkannya. Umumkan predikat tim di depan kelas dan rayakan tim yang anggotanya paling meningkat — bukan sekadar tim dengan nilai tertinggi. Pajang ERD tim terbaik di dinding kelas bila memungkinkan.',
    pengantar:
      'Nilai tim tidak ditentukan oleh siapa yang paling pintar, tetapi oleh <strong>seberapa jauh setiap anggota meningkat</strong> dari Kuis Awal ke Evaluasi. Setiap anggota punya peluang menyumbang poin yang sama.',
    aturanPoin: [
      { syarat: 'Nilai evaluasi lebih dari 10 poin di bawah skor dasar', poin: 5 },
      { syarat: '10 poin di bawah sampai 1 poin di bawah skor dasar', poin: 10 },
      { syarat: 'Sama dengan skor dasar sampai 10 poin di atasnya', poin: 20 },
      { syarat: 'Lebih dari 10 poin di atas skor dasar', poin: 30 },
      { syarat: 'Nilai sempurna (100), berapa pun skor dasarnya', poin: 30 },
    ],
    jumlahAnggota: 4,
    rangkuman: [
      'Mulai dari dokumen kebutuhan: pilah frasa menjadi <strong>entitas</strong>, <strong>atribut</strong>, <strong>aturan relasi</strong>, dan hal yang bukan data.',
      'Setiap entitas punya atribut miliknya sendiri dan satu <strong>kunci primer</strong> yang unik dan tetap.',
      'Tentukan <strong>kardinalitas min..maks</strong> dari aturan bisnis yang dibaca dua arah; jenis relasi mengikuti kedua maksimum.',
      'Relasi <strong>1:N</strong> → kunci tamu di sisi banyak. Relasi <strong>M:N</strong> → entitas penghubung berkunci gabungan, tempat atribut milik pasangan.',
      'Periksa ERD terhadap kebutuhan: setiap data yang diminta pengguna harus punya tempat.',
    ],
  },

  refleksi: {
    kicker: 'Tahap 11 · Refleksi',
    title: 'Refleksi Diri & Kerja Tim',
    goal: 'Menilai pemahaman diri dan kontribusi dalam kerja tim.',
    guru: 'Beri waktu 5 menit untuk refleksi mandiri. Baca sekilas jawaban terbuka untuk menemukan komponen ERD yang masih membingungkan dan dinamika tim yang perlu dibenahi.',
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
        teks: 'Aku bisa memilah dokumen kebutuhan menjadi entitas, atribut, aturan relasi, dan hal yang bukan data.',
      },
      {
        id: 'p2',
        teks: 'Aku bisa menempatkan atribut di entitas pemiliknya dan memilih kunci primer yang tepat.',
      },
      {
        id: 'p3',
        teks: 'Aku bisa menentukan kardinalitas dan jenis relasi dari aturan bisnis.',
      },
      {
        id: 'p4',
        teks: 'Aku bisa meletakkan kunci tamu dan memecah relasi M:N dengan entitas penghubung.',
      },
      {
        id: 'p5',
        teks: 'Aku bisa menemukan dan menjelaskan kesalahan pada ERD tim lain.',
      },
      {
        id: 'p6',
        teks: 'Aku mengajarkan topik ahliku dengan jelas dan membantu temanku memahaminya.',
      },
    ],
    tanyaTerbuka:
      'Komponen ERD mana yang paling sulit bagimu, dan penjelasan teman mana yang paling membantu?',
  },

  selesai: {
    kicker: 'Tahap 12 · Selesai',
    title: 'Hebat, ERD Timmu Lengkap!',
    goal: 'Melihat rekap skor dan ERD lengkap hasil kerja tim.',
    pesan:
      'Kamu sudah merancang ERD lengkap Sistem Peminjaman Alat Lab RPL dari hasil analisis kebutuhan dan memeriksa ERD tim lain. ERD ini siap diubah menjadi tabel basis data pada materi berikutnya!',
  },
};

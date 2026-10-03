'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Menentukan Jenis Relasi dan
   Kardinalitas Antar Entitas dalam Rancangan ERD
   Fase F — SMK Rekayasa Perangkat Lunak, Cooperative Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js. Guru dapat menyunting teks, soal, kunci,
   dan umpan balik di sini tanpa menyentuh kode.

   Studi kasus: OSIS meminta tim RPL merancang basis data
   Sistem Informasi Ekstrakurikuler (Ekskul). Entitasnya sudah
   ditemukan (Siswa, Kartu Anggota, Pembina, Ekskul, Jadwal
   Latihan); tugas tim adalah menentukan jenis relasi dan
   kardinalitas di antara entitas itu. Kuis memakai kasus
   paralel: perpustakaan (kuis awal) dan UKS (evaluasi).

   Model Cooperative Learning (sintaks Arends) dengan teknik
   Jigsaw untuk kerja kelompok dan poin peningkatan individu
   model STAD untuk penghargaan tim.

   Pemetaan sintaks Cooperative Learning → tahap media:
     1. Menyampaikan tujuan & memotivasi
                            → orientasi   (TP, alur, apersepsi)
                            → kuisAwal    (skor dasar individu)
     2. Menyajikan informasi→ informasi   (kartu konsep 1:1, 1:N,
                                           M:N & notasi min..maks)
     3. Mengorganisasi siswa ke dalam kelompok belajar
                            → kelompok    (peran, topik ahli
                                           Jigsaw, norma tim)
     4. Membimbing kelompok bekerja dan belajar
                            → ahli        (kelompok ahli: dalami
                                           satu jenis relasi)
                            → diskusi     (kelompok asal: saling
                                           mengajari, pilah aturan)
                            → rancang     (kardinalitas ERD Ekskul)
     5. Evaluasi            → evaluasi    (kuis individu paralel +
                                           uji silang ERD tim lain)
     6. Memberikan penghargaan
                            → penghargaan (poin peningkatan & predikat
                                           tim)
     Refleksi & penutup     → refleksi, selesai

   KONVENSI RELASI: `ab` = kardinalitas "satu A punya berapa B",
   `ba` = "satu B punya berapa A", ditulis 'min..maks' (0..1,
   1..1, 0..N, 1..N). Jenis relasi diturunkan dari kedua
   maksimum oleh engine (jenisDariKardinalitas).

   ATURAN: setiap pilihan punya `id` unik dan stabil. Urutan
   tampilnya DIACAK oleh app.js (initOrders) dan jawaban murid
   disimpan per id.
   ============================================================ */

/* Entitas yang dipakai berulang pada studi kasus Ekskul. */
var ENT = {
  siswa: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
  kartu: { id: 'kartu', label: 'Kartu Anggota', ikon: '🪪' },
  pembina: { id: 'pembina', label: 'Pembina', ikon: '👩‍🏫' },
  ekskul: { id: 'ekskul', label: 'Ekskul', ikon: '⚽' },
  jadwal: { id: 'jadwal', label: 'Jadwal Latihan', ikon: '🗓️' },
};

/* Opsi jenis relasi yang dipakai beberapa soal (id harus unik per soal). */
function opsiJenis(tambahan) {
  return [
    { id: 'r11', label: 'One-to-One (1:1)' },
    { id: 'r1n', label: 'One-to-Many (1:N)' },
    { id: 'rmn', label: 'Many-to-Many (M:N)' },
    tambahan,
  ];
}

var DATA = {
  meta: {
    judul: 'Menentukan Jenis Relasi & Kardinalitas Antar Entitas dalam ERD',
    mapel: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Cooperative Learning',
  },

  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Menyampaikan Tujuan' },
    { id: 'kuisAwal', label: 'Kuis Awal', sintaks: 'Sintaks 1 · Menyampaikan Tujuan' },
    { id: 'informasi', label: 'Info Kunci', sintaks: 'Sintaks 2 · Menyajikan Informasi' },
    { id: 'kelompok', label: 'Bentuk Tim', sintaks: 'Sintaks 3 · Mengorganisasi Kelompok' },
    { id: 'ahli', label: 'Tim Ahli', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'diskusi', label: 'Diskusi Tim', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'rancang', label: 'Rancang ERD', sintaks: 'Sintaks 4 · Membimbing Kelompok' },
    { id: 'evaluasi', label: 'Evaluasi', sintaks: 'Sintaks 5 · Evaluasi' },
    { id: 'penghargaan', label: 'Penghargaan', sintaks: 'Sintaks 6 · Memberikan Penghargaan' },
    { id: 'refleksi', label: 'Refleksi', sintaks: 'Refleksi' },
    { id: 'selesai', label: 'Selesai', sintaks: 'Penutup' },
  ],

  /* ==========================================================
     SINTAKS 1 — Menyampaikan tujuan & memotivasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Satu Tim, Satu Rancangan',
    goal: 'Mengetahui tujuan belajar, alur kerja tim, dan cara memakai media ini.',
    guru: 'Bentuk kelompok heterogen berisi 3–4 murid (campur kemampuan dan gaya belajar) <em>sebelum</em> pelajaran. Sampaikan bahwa nilai tim ditentukan oleh <strong>peningkatan</strong> setiap anggota, bukan oleh anggota terpintar — sehingga setiap orang penting. Tayangkan tahap ini di layar kelas, lalu ajak murid menjawab pemanasan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menentukan jenis relasi dan kardinalitas antar entitas dalam rancangan ERD.',
    kriteria: [
      'Membaca aturan bisnis dari dua arah untuk menemukan batas minimum dan maksimum pasangan setiap entitas.',
      'Menuliskan kardinalitas setiap sisi relasi dengan notasi min..maks (0..1, 1..1, 0..N, 1..N).',
      'Menentukan jenis relasi One-to-One, One-to-Many, atau Many-to-Many dari kardinalitas maksimum kedua sisi.',
      'Memeriksa rancangan ERD tim lain dan menjelaskan kesalahan kardinalitasnya berdasarkan aturan bisnis.',
    ],
    pengantar:
      'OSIS ingin mengganti buku catatan ekskul dengan aplikasi <strong>Sistem Informasi Ekstrakurikuler</strong>. Tim analis sudah menemukan entitasnya: <em>Siswa, Kartu Anggota, Pembina, Ekskul,</em> dan <em>Jadwal Latihan</em>. Sekarang timmu ditugasi menentukan <strong>bagaimana entitas-entitas itu saling terhubung</strong>: berapa banyak pasangan yang boleh dimiliki setiap entitas? Kalian akan bekerja seperti tim proyek sungguhan — setiap anggota menjadi ahli satu bagian, lalu saling mengajari.',
    alur: [
      { judul: 'Kuis Awal', desk: 'Ukur bekal awalmu sendiri — ini menjadi skor dasar.' },
      { judul: 'Info Kunci', desk: 'Kenali tiga jenis relasi dan notasi kardinalitas.' },
      { judul: 'Bentuk Tim', desk: 'Bagi peran dan pilih topik keahlianmu.' },
      { judul: 'Tim Ahli', desk: 'Dalami satu jenis relasi bersama ahli dari tim lain.' },
      { judul: 'Diskusi Tim', desk: 'Kembali ke tim asal, saling mengajari, pilah aturan bisnis.' },
      { judul: 'Rancang ERD', desk: 'Tentukan kardinalitas relasi pada ERD Ekskul.' },
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
        'Pemanasan: di sekolahmu, <strong>satu siswa</strong> boleh mengikuti berapa ekskul? Pilih yang paling sesuai menurut pengalamanmu.',
      opsi: [
        { id: 'satu', label: 'Hanya boleh satu ekskul' },
        { id: 'banyak', label: 'Boleh lebih dari satu ekskul' },
        { id: 'nol', label: 'Boleh tidak ikut ekskul sama sekali' },
        { id: 'wajib', label: 'Wajib ikut minimal satu ekskul (misalnya Pramuka)' },
      ],
      umpan:
        'Jawaban tiap sekolah bisa berbeda — dan justru itulah intinya! Aturan seperti "boleh tidak ikut", "wajib minimal satu", atau "boleh lebih dari satu" disebut <strong>aturan bisnis</strong>. Dari aturan inilah kita menentukan <strong>kardinalitas</strong> (batas minimum & maksimum pasangan) dan <strong>jenis relasi</strong> di ERD.',
    },
  },

  kuisAwal: {
    kicker: 'Tahap 2 · Kuis Awal',
    title: 'Kuis Awal: Skor Dasarmu',
    goal: 'Mengukur pemahaman awal secara individu sebagai skor dasar poin peningkatan.',
    guru: 'Minta murid mengerjakan sendiri tanpa diskusi. Tegaskan bahwa skor rendah tidak masalah — skor ini hanya menjadi titik awal untuk menghitung <strong>poin peningkatan</strong>. Murid yang awalnya rendah justru berpeluang menyumbang poin besar bagi tim.',
    pengantar:
      'Jawab 5 soal berikut <strong>sendiri</strong>. Setiap soal hanya bisa dijawab <strong>sekali</strong>. Kasusnya: aplikasi perpustakaan sekolah.',
    soal: [
      {
        id: 'ka1',
        tanya:
          'Aturan: "Setiap kelas punya tepat satu wali kelas, dan seorang guru hanya boleh menjadi wali di satu kelas." Jenis relasi <strong>Kelas – Wali Kelas</strong> adalah …',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'r11',
        umpan: {
          r11: 'Dari kedua arah maksimumnya satu: satu kelas → satu wali, satu wali → satu kelas.',
          r1n: 'Coba baca dari arah guru: seorang guru hanya boleh menjadi wali di <em>satu</em> kelas, jadi tidak ada sisi "banyak".',
          rmn: 'Tidak ada sisi yang boleh lebih dari satu, jadi bukan M:N.',
          tidak: 'Kelas dan wali kelas jelas saling terhubung lewat aturan tersebut.',
        },
      },
      {
        id: 'ka2',
        tanya:
          'Aturan: "Satu penerbit menerbitkan banyak buku, tetapi setiap buku hanya diterbitkan oleh satu penerbit." Jenis relasi <strong>Penerbit – Buku</strong> adalah …',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'r1n',
        umpan: {
          r11: 'Satu penerbit menerbitkan <em>banyak</em> buku, jadi ada sisi "banyak".',
          r1n: 'Satu penerbit → banyak buku, satu buku → satu penerbit: One-to-Many.',
          rmn: 'Dari arah buku, maksimumnya satu penerbit — jadi hanya satu sisi yang "banyak".',
          tidak: 'Penerbit dan buku terhubung: buku diterbitkan oleh penerbit.',
        },
      },
      {
        id: 'ka3',
        tanya:
          'Aturan: "Satu buku dapat ditulis beberapa penulis, dan seorang penulis dapat menulis banyak buku." Jenis relasi <strong>Buku – Penulis</strong> adalah …',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'rmn',
        umpan: {
          r11: 'Kedua arah boleh lebih dari satu, jadi bukan 1:1.',
          r1n: 'Kamu baru membaca satu arah. Dari arah penulis pun bisa "banyak" buku.',
          rmn: 'Kedua arah "banyak": Many-to-Many.',
          tidak: 'Buku dan penulis terhubung lewat kegiatan menulis.',
        },
      },
      {
        id: 'ka4',
        tanya:
          'Pada relasi Anggota – Peminjaman, kardinalitas sisi Peminjaman ditulis <code>0..N</code>. Artinya …',
        opsi: [
          {
            id: 'opsional',
            label: 'Satu anggota boleh belum pernah meminjam, dan bisa meminjam berkali-kali',
          },
          { id: 'wajib', label: 'Satu anggota wajib meminjam minimal sekali' },
          { id: 'nol', label: 'Satu anggota tidak boleh meminjam' },
          { id: 'satu', label: 'Satu anggota hanya boleh meminjam satu kali' },
        ],
        correct: 'opsional',
        umpan: {
          opsional: 'Minimum 0 = boleh tidak ada (opsional); maksimum N = bisa banyak.',
          wajib: 'Itu notasi <code>1..N</code>. Angka di kiri (minimum) di sini adalah 0.',
          nol: 'Angka 0 hanya batas <em>minimum</em>; maksimumnya N, jadi tetap boleh meminjam.',
          satu: 'Maksimumnya N (banyak), bukan 1.',
        },
      },
      {
        id: 'ka5',
        tanya:
          'Di basis data relasional, relasi Many-to-Many (misalnya Buku – Penulis) biasanya diwujudkan dengan …',
        opsi: [
          { id: 'penghubung', label: 'Tabel/entitas penghubung yang berisi kunci kedua entitas' },
          { id: 'gabung', label: 'Menggabungkan Buku dan Penulis menjadi satu tabel' },
          { id: 'kolomBanyak', label: 'Menambah kolom penulis1, penulis2, penulis3 di tabel Buku' },
          { id: 'hapus', label: 'Menghapus relasinya karena M:N tidak boleh ada' },
        ],
        correct: 'penghubung',
        umpan: {
          penghubung: 'Tepat. Entitas penghubung (asosiatif) memecah M:N menjadi dua relasi 1:N.',
          gabung: 'Menggabungkan tabel membuat data penulis berulang di banyak baris buku.',
          kolomBanyak: 'Kolom berulang membatasi jumlah penulis dan menyulitkan pencarian.',
          hapus: 'Relasi M:N sah di ERD; hanya cara mewujudkannya di tabel yang perlu penghubung.',
        },
      },
    ],
  },

  /* ==========================================================
     SINTAKS 2 — Menyajikan informasi
     ========================================================== */
  informasi: {
    kicker: 'Tahap 3 · Info Kunci',
    title: 'Tiga Jenis Relasi & Notasi Kardinalitas',
    goal: 'Mengenal jenis relasi 1:1, 1:N, M:N dan cara membaca notasi min..maks.',
    guru: 'Sajikan informasi secara singkat (±10 menit) di depan kelas dengan contoh yang dekat dengan murid. Peragakan cara membaca relasi <strong>dari dua arah</strong> dengan kalimat "Satu … punya minimal … dan maksimal …". Minta tiap tim menjawab pertanyaan cek-paham bersama sebelum lanjut.',
    pengantar:
      'Relasi menghubungkan dua entitas. <strong>Kardinalitas</strong> menjawab: <em>satu</em> anggota entitas ini boleh punya <strong>minimal</strong> dan <strong>maksimal</strong> berapa pasangan di entitas lain? Bacalah selalu <strong>dari dua arah</strong>. Gabungan batas <strong>maksimum</strong> kedua arah menentukan <strong>jenis relasi</strong>.',
    konsep: [
      {
        id: 'r11',
        ikon: '🔗',
        judul: 'One-to-One (1:1)',
        def: 'Dari kedua arah, maksimum pasangannya <strong>satu</strong>.',
        rel: {
          id: 'contoh11',
          a: ENT.siswa,
          b: ENT.kartu,
          kerja: 'memiliki',
          kerjaBalik: 'dimiliki oleh',
          ab: '0..1',
          ba: '1..1',
        },
      },
      {
        id: 'r1n',
        ikon: '🌿',
        judul: 'One-to-Many (1:N)',
        def: 'Satu arah maksimumnya <strong>banyak</strong>, arah sebaliknya maksimumnya <strong>satu</strong>.',
        rel: {
          id: 'contoh1n',
          a: ENT.ekskul,
          b: ENT.jadwal,
          kerja: 'memiliki',
          kerjaBalik: 'milik',
          ab: '0..N',
          ba: '1..1',
        },
      },
      {
        id: 'rmn',
        ikon: '🕸️',
        judul: 'Many-to-Many (M:N)',
        def: 'Dari kedua arah, maksimum pasangannya <strong>banyak</strong>.',
        rel: {
          id: 'contohmn',
          a: ENT.siswa,
          b: ENT.ekskul,
          kerja: 'mengikuti',
          kerjaBalik: 'diikuti oleh',
          ab: '0..N',
          ba: '1..N',
        },
      },
    ],
    notasi: [
      {
        id: '0..1',
        arti: 'Opsional, paling banyak satu',
        contoh: 'Siswa → Kartu Anggota (belum mendaftar = belum punya kartu)',
      },
      {
        id: '1..1',
        arti: 'Wajib, tepat satu',
        contoh: 'Kartu Anggota → Siswa (setiap kartu pasti milik satu siswa)',
      },
      {
        id: '0..N',
        arti: 'Opsional, bisa banyak',
        contoh: 'Siswa → Ekskul (boleh tidak ikut, boleh ikut beberapa)',
      },
      {
        id: '1..N',
        arti: 'Wajib minimal satu, bisa banyak',
        contoh: 'Ekskul → Siswa (ekskul berjalan bila punya anggota)',
      },
    ],
    pertanyaan: [
      {
        id: 'in1',
        tanya:
          'Untuk menentukan <strong>jenis relasi</strong> (1:1, 1:N, M:N), batas apa yang dibandingkan?',
        opsi: [
          { id: 'maks', label: 'Batas maksimum dari kedua arah' },
          { id: 'min', label: 'Batas minimum dari kedua arah' },
          { id: 'satuArah', label: 'Batas maksimum dari satu arah saja' },
          { id: 'atribut', label: 'Jumlah atribut kedua entitas' },
        ],
        correct: 'maks',
        umpan: {
          maks: 'Benar! Maksimum kedua arah menentukan jenis: 1 & 1 → 1:1, N & 1 → 1:N, N & N → M:N.',
          min: 'Minimum menunjukkan wajib/opsional (partisipasi), bukan jenis relasi.',
          satuArah:
            'Satu arah saja bisa menipu: relasi 1:N dan M:N bisa tampak sama bila dibaca dari satu arah.',
          atribut: 'Banyaknya atribut tidak berpengaruh pada cara entitas saling terhubung.',
        },
      },
      {
        id: 'in2',
        tanya: 'Angka <strong>minimum 0</strong> pada notasi kardinalitas berarti …',
        opsi: [
          { id: 'opsional', label: 'Pasangan boleh tidak ada (partisipasi opsional)' },
          { id: 'tidakBoleh', label: 'Entitas tidak boleh punya pasangan' },
          { id: 'wajib', label: 'Pasangan wajib ada' },
          { id: 'kosong', label: 'Entitasnya belum punya atribut' },
        ],
        correct: 'opsional',
        umpan: {
          opsional: 'Tepat. Minimum 0 = opsional; minimum 1 = wajib.',
          tidakBoleh: 'Minimum 0 hanya batas bawah. Batas atasnya tetap bisa 1 atau N.',
          wajib: 'Pasangan wajib ditandai minimum <strong>1</strong>.',
          kosong: 'Kardinalitas membahas pasangan relasi, bukan atribut.',
        },
      },
      {
        id: 'in3',
        tanya:
          'Aturan: "Seorang pembina membina beberapa ekskul; setiap ekskul dibina satu pembina." Bila kamu hanya membaca dari arah pembina, kamu bisa keliru menyimpulkan …',
        opsi: [
          { id: 'mn', label: 'Relasinya M:N, padahal dari arah ekskul maksimumnya satu' },
          { id: 'satu', label: 'Relasinya 1:1, padahal sebenarnya M:N' },
          { id: 'tidakAda', label: 'Tidak ada relasi antara pembina dan ekskul' },
          { id: 'atribut', label: 'Pembina adalah atribut Ekskul' },
        ],
        correct: 'mn',
        umpan: {
          mn: 'Betul. Dari arah pembina terlihat "banyak", tetapi arah ekskul membatasi satu — jadi 1:N.',
          satu: 'Dari arah pembina saja sudah terlihat "beberapa", jadi tidak mungkin tampak 1:1.',
          tidakAda: 'Aturannya jelas menghubungkan pembina dengan ekskul.',
          atribut: 'Pembina punya data sendiri (nama, NIP, kontak), jadi ia entitas.',
        },
      },
    ],
  },

  /* ==========================================================
     SINTAKS 3 — Mengorganisasi siswa ke dalam kelompok
     ========================================================== */
  kelompok: {
    kicker: 'Tahap 4 · Bentuk Tim',
    title: 'Bagi Peran & Pilih Keahlian',
    goal: 'Membagi peran tim, memilih topik ahli Jigsaw, dan menyepakati norma kerja tim.',
    guru: 'Pastikan setiap tim (kelompok asal) membagi tiga topik ahli sehingga setiap topik punya minimal satu ahli; tim berisi 4 orang memberi topik M:N kepada dua anggota. Arahkan para ahli dari tim berbeda dengan topik sama untuk duduk bersama di "meja ahli" pada tahap berikutnya. Gilir peran setiap pertemuan.',
    pengantar:
      'Dalam teknik <strong>Jigsaw</strong>, setiap anggota tim menjadi <em>ahli</em> satu bagian materi. Kamu akan berdiskusi dengan ahli dari tim lain, lalu kembali dan <strong>mengajarkannya</strong> ke tim asalmu. Keberhasilan tim bergantung pada setiap anggota.',
    peran: [
      {
        id: 'ketua',
        ikon: '🧭',
        label: 'Pemandu',
        tugas: 'Mengatur giliran bicara dan menjaga waktu diskusi.',
      },
      {
        id: 'pencatat',
        ikon: '📝',
        label: 'Pencatat',
        tugas: 'Menuliskan keputusan tim dan alasan dari aturan bisnis.',
      },
      {
        id: 'pemeriksa',
        ikon: '🔍',
        label: 'Pemeriksa Aturan',
        tugas: 'Mengecek setiap jawaban terhadap aturan bisnis dari dua arah.',
      },
      {
        id: 'jubir',
        ikon: '🎤',
        label: 'Juru Bicara',
        tugas: 'Menyampaikan hasil tim saat uji silang dan presentasi.',
      },
    ],
    topik: [
      {
        id: 'satu',
        kategori: 'r11',
        ikon: '🔗',
        label: 'Ahli One-to-One (1:1)',
        desk: 'Kapan kedua sisi dibatasi satu pasangan?',
      },
      {
        id: 'satuBanyak',
        kategori: 'r1n',
        ikon: '🌿',
        label: 'Ahli One-to-Many (1:N)',
        desk: 'Relasi paling umum: satu induk, banyak anak.',
      },
      {
        id: 'banyakBanyak',
        kategori: 'rmn',
        ikon: '🕸️',
        label: 'Ahli Many-to-Many (M:N)',
        desk: 'Banyak ke banyak dan entitas penghubungnya.',
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
          label:
            'Setiap anggota bertanggung jawab memahami ketiga jenis relasi, bukan hanya topik ahlinya',
          benar: true,
          alasan: 'Evaluasi dikerjakan individu — tim berhasil bila semua paham.',
        },
        {
          id: 'tanyaTim',
          label: 'Bertanya kepada teman satu tim lebih dulu sebelum bertanya kepada guru',
          benar: true,
          alasan: 'Membangun saling ketergantungan positif dalam tim.',
        },
        {
          id: 'alasan',
          label: 'Mengoreksi jawaban teman dengan menunjukkan alasan dari aturan bisnis',
          benar: true,
          alasan: 'Kritik berbasis alasan membantu teman memperbaiki cara berpikirnya.',
        },
        {
          id: 'tercepat',
          label: 'Anggota tercepat mengerjakan semua soal supaya tim cepat selesai',
          benar: false,
          alasan: 'Anggota lain tidak belajar, dan poin peningkatan mereka akan rendah.',
        },
        {
          id: 'salin',
          label: 'Menyalin jawaban ahli tanpa menanyakan alasannya',
          benar: false,
          alasan:
            'Tanpa alasan, kamu tidak bisa mengerjakan evaluasi individu dengan kasus berbeda.',
        },
      ],
      done: '<strong>Kesepakatan tim siap!</strong> Ingat: tim menang bila setiap anggota meningkat.',
    },
  },

  /* ==========================================================
     SINTAKS 4 — Membimbing kelompok bekerja & belajar
     ========================================================== */
  ahli: {
    kicker: 'Tahap 5 · Tim Ahli',
    title: 'Meja Ahli: Dalami Topikmu',
    goal: 'Memahami satu jenis relasi secara mendalam agar mampu mengajarkannya kepada tim asal.',
    guru: 'Kelompokkan murid dengan topik ahli yang sama dari tim berbeda. Berkeliling dan ajukan pertanyaan pemantik ("Coba baca dari arah sebaliknya — apa yang berubah?"). Jangan langsung memberi jawaban; minta ahli lain menjelaskan lebih dulu. Pastikan setiap ahli menyusun kartu ajar sebelum kembali ke tim asal.',
    pengantar:
      'Bersama ahli dari tim lain, pelajari materi topikmu, jawab pertanyaan penuntun, lalu susun <strong>kartu ajar</strong> — langkah yang akan kamu pakai untuk mengajari tim asalmu.',
    topik: {
      satu: {
        judul: 'One-to-One (1:1)',
        materi: [
          'Relasi <strong>1:1</strong> terjadi bila <em>satu</em> anggota entitas A paling banyak berpasangan dengan <em>satu</em> anggota entitas B, dan sebaliknya.',
          'Relasi 1:1 relatif jarang. Biasanya muncul ketika data dipisah karena sifatnya berbeda: kartu, akun, atau dokumen pribadi yang hanya milik satu orang.',
          'Perhatikan minimumnya! Sering satu sisi opsional (<code>0..1</code>) — siswa yang belum mendaftar ekskul belum punya kartu — sementara sisi lain wajib (<code>1..1</code>) karena setiap kartu pasti milik seorang siswa.',
        ],
        ciri: 'Kata kunci aturan: "tepat satu", "hanya satu", "masing-masing satu" — dari KEDUA arah.',
        rel: {
          id: 'ahli11',
          a: ENT.siswa,
          b: ENT.kartu,
          kerja: 'memiliki',
          kerjaBalik: 'dimiliki oleh',
          ab: '0..1',
          ba: '1..1',
        },
        pertanyaan: [
          {
            id: 'ah11a',
            tanya:
              'Pada relasi Siswa – Kartu Anggota di atas, mengapa sisi Kartu Anggota (dilihat dari Siswa) bernotasi <code>0..1</code>?',
            opsi: [
              {
                id: 'belum',
                label:
                  'Siswa yang belum mendaftar ekskul belum punya kartu, dan paling banyak punya satu',
              },
              { id: 'wajib', label: 'Setiap siswa wajib punya satu kartu' },
              { id: 'banyak', label: 'Siswa boleh punya banyak kartu' },
              { id: 'acak', label: 'Notasinya bebas, tidak bergantung aturan' },
            ],
            correct: 'belum',
            umpan: {
              belum: 'Tepat: minimum 0 karena opsional, maksimum 1 karena kartu tidak dobel.',
              wajib:
                'Kalau wajib, notasinya <code>1..1</code>. Apakah siswa yang tidak ikut ekskul punya kartu anggota?',
              banyak: 'Maksimumnya 1 — satu siswa hanya memegang satu kartu anggota.',
              acak: 'Notasi selalu diturunkan dari aturan bisnis.',
            },
          },
          {
            id: 'ah11b',
            tanya: 'Manakah aturan yang menghasilkan relasi <strong>1:1</strong>?',
            opsi: [
              {
                id: 'ketua',
                label:
                  'Setiap ekskul dipimpin satu ketua, dan seorang siswa hanya boleh menjadi ketua di satu ekskul',
              },
              {
                id: 'pembina',
                label:
                  'Seorang pembina bisa membina beberapa ekskul, setiap ekskul dibina satu pembina',
              },
              {
                id: 'anggota',
                label: 'Siswa boleh ikut beberapa ekskul, ekskul diikuti banyak siswa',
              },
              {
                id: 'jadwal',
                label: 'Ekskul punya banyak jadwal latihan, setiap jadwal milik satu ekskul',
              },
            ],
            correct: 'ketua',
            umpan: {
              ketua: 'Benar. Dari kedua arah dibatasi satu.',
              pembina: 'Dari arah pembina bisa "beberapa" — itu 1:N.',
              anggota: 'Kedua arah "banyak" — itu M:N.',
              jadwal: 'Satu ekskul → banyak jadwal — itu 1:N.',
            },
          },
          {
            id: 'ah11c',
            tanya:
              'Temanmu menulis relasi 1:1 sebagai <code>1..N</code> di sisi Kartu. Apa dampaknya?',
            opsi: [
              {
                id: 'jadi1n',
                label: 'Relasinya berubah menjadi 1:N — seolah siswa boleh punya banyak kartu',
              },
              { id: 'tetap', label: 'Tidak berdampak, tetap 1:1' },
              { id: 'mn', label: 'Relasinya berubah menjadi M:N' },
              { id: 'opsional', label: 'Hanya mengubah sifat wajib/opsional' },
            ],
            correct: 'jadi1n',
            umpan: {
              jadi1n: 'Tepat. Maksimum N di satu sisi mengubah jenis relasi menjadi 1:N.',
              tetap: 'Maksimum menentukan jenis relasi — N di satu sisi sudah mengubahnya.',
              mn: 'M:N butuh maksimum N di <em>kedua</em> sisi. Sisi lainnya masih 1.',
              opsional: 'Yang berubah tidak hanya minimum (0→1) tetapi juga maksimum (1→N).',
            },
          },
        ],
      },
      satuBanyak: {
        judul: 'One-to-Many (1:N)',
        materi: [
          'Relasi <strong>1:N</strong> terjadi bila satu anggota entitas A boleh berpasangan dengan <em>banyak</em> anggota B, tetapi satu anggota B hanya berpasangan dengan <em>satu</em> anggota A.',
          'Inilah relasi paling umum: satu ekskul punya banyak jadwal latihan, satu pembina membina beberapa ekskul. Sisi "satu" sering disebut induk, sisi "banyak" disebut anak.',
          'Cara cepat memeriksa: tanyakan dari sisi anak, "Satu jadwal latihan milik berapa ekskul?" Bila jawabannya satu, relasinya 1:N, bukan M:N.',
        ],
        ciri: 'Kata kunci: "banyak/beberapa" dari satu arah, "hanya satu/tepat satu" dari arah sebaliknya.',
        rel: {
          id: 'ahli1n',
          a: ENT.ekskul,
          b: ENT.jadwal,
          kerja: 'memiliki',
          kerjaBalik: 'milik',
          ab: '0..N',
          ba: '1..1',
        },
        pertanyaan: [
          {
            id: 'ah1na',
            tanya:
              'Pada relasi Ekskul – Jadwal Latihan, mengapa sisi Ekskul (dilihat dari Jadwal) bernotasi <code>1..1</code>?',
            opsi: [
              { id: 'pasti', label: 'Setiap jadwal pasti milik tepat satu ekskul' },
              { id: 'opsional', label: 'Jadwal boleh tidak punya ekskul' },
              { id: 'banyak', label: 'Satu jadwal dipakai banyak ekskul' },
              { id: 'ekskulBaru', label: 'Ekskul baru belum punya jadwal' },
            ],
            correct: 'pasti',
            umpan: {
              pasti: 'Benar: wajib (min 1) dan tidak dobel (maks 1).',
              opsional: 'Jadwal tanpa ekskul tidak bermakna, jadi minimumnya 1.',
              banyak: 'Menurut aturan, satu jadwal hanya milik satu ekskul.',
              ekskulBaru:
                'Itu menjelaskan sisi <em>Jadwal</em> (<code>0..N</code>), bukan sisi Ekskul.',
            },
          },
          {
            id: 'ah1nb',
            tanya:
              'Aturan: "Satu ruang latihan dipakai banyak jadwal; satu jadwal memakai satu ruang." Jenis relasi <strong>Ruang – Jadwal</strong>?',
            opsi: opsiJenis({ id: 'tidak', label: 'Tidak bisa ditentukan' }),
            correct: 'r1n',
            umpan: {
              r11: 'Satu ruang dipakai <em>banyak</em> jadwal — ada sisi "banyak".',
              r1n: 'Tepat: satu ruang → banyak jadwal, satu jadwal → satu ruang.',
              rmn: 'Dari arah jadwal, maksimumnya satu ruang. Bukan M:N.',
              tidak: 'Aturannya sudah memberi batas dari kedua arah.',
            },
          },
          {
            id: 'ah1nc',
            tanya:
              'Pada rancangan tabel, kunci entitas sisi "satu" pada relasi 1:N biasanya disimpan …',
            opsi: [
              { id: 'fkAnak', label: 'Sebagai foreign key di tabel sisi "banyak" (anak)' },
              { id: 'fkInduk', label: 'Sebagai foreign key di tabel sisi "satu" (induk)' },
              { id: 'penghubung', label: 'Di tabel penghubung baru' },
              { id: 'tidakDisimpan', label: 'Tidak perlu disimpan' },
            ],
            correct: 'fkAnak',
            umpan: {
              fkAnak: 'Benar. Contoh: tabel jadwal_latihan menyimpan id_ekskul.',
              fkInduk:
                'Tabel ekskul harus menyimpan banyak id jadwal — tidak mungkin dalam satu kolom.',
              penghubung: 'Tabel penghubung dibutuhkan untuk M:N, bukan 1:N.',
              tidakDisimpan: 'Tanpa foreign key, jadwal tidak tahu milik ekskul mana.',
            },
          },
        ],
      },
      banyakBanyak: {
        judul: 'Many-to-Many (M:N)',
        materi: [
          'Relasi <strong>M:N</strong> terjadi bila dari <em>kedua</em> arah, satu anggota boleh berpasangan dengan banyak anggota entitas lain.',
          'Contoh: satu siswa boleh mengikuti beberapa ekskul, dan satu ekskul diikuti banyak siswa. Minimumnya bisa berbeda: siswa boleh tidak ikut ekskul (<code>0..N</code>), tetapi ekskul baru berjalan bila punya anggota (<code>1..N</code>).',
          'Di basis data relasional, M:N diwujudkan dengan <strong>entitas penghubung (asosiatif)</strong>, misalnya <em>Keanggotaan</em>, yang memecahnya menjadi dua relasi 1:N dan bisa menyimpan data milik pasangan itu (tanggal bergabung, jabatan).',
        ],
        ciri: 'Kata kunci: "banyak/beberapa" dari KEDUA arah.',
        rel: {
          id: 'ahlimn',
          a: ENT.siswa,
          b: ENT.ekskul,
          kerja: 'mengikuti',
          kerjaBalik: 'diikuti oleh',
          ab: '0..N',
          ba: '1..N',
        },
        pertanyaan: [
          {
            id: 'ahmna',
            tanya:
              'Pada relasi Siswa – Ekskul, apa arti <code>1..N</code> di sisi Siswa (dilihat dari Ekskul)?',
            opsi: [
              {
                id: 'minSatu',
                label: 'Setiap ekskul minimal punya satu anggota siswa dan bisa banyak',
              },
              { id: 'siswaWajib', label: 'Setiap siswa wajib ikut minimal satu ekskul' },
              { id: 'satuSiswa', label: 'Satu ekskul hanya punya satu siswa' },
              { id: 'boleh', label: 'Ekskul boleh tidak punya anggota' },
            ],
            correct: 'minSatu',
            umpan: {
              minSatu: 'Benar. Notasi di sisi Siswa menghitung siswa per satu ekskul.',
              siswaWajib:
                'Itu dibaca dari arah siswa (sisi Ekskul), yang notasinya <code>0..N</code>.',
              satuSiswa: 'Maksimumnya N, jadi bisa banyak siswa.',
              boleh: 'Minimumnya 1, artinya wajib punya anggota.',
            },
          },
          {
            id: 'ahmnb',
            tanya:
              'Aturan: "Satu lomba diikuti beberapa ekskul, dan satu ekskul mengikuti banyak lomba dalam setahun." Jenis relasi <strong>Lomba – Ekskul</strong>?',
            opsi: opsiJenis({ id: 'tidak', label: 'Tidak bisa ditentukan' }),
            correct: 'rmn',
            umpan: {
              r11: 'Kedua arah boleh lebih dari satu.',
              r1n: 'Baca juga dari arah ekskul: satu ekskul ikut <em>banyak</em> lomba.',
              rmn: 'Tepat: kedua arah "banyak".',
              tidak: 'Aturannya sudah memberi batas maksimum kedua arah.',
            },
          },
          {
            id: 'ahmnc',
            tanya:
              'Data <em>tanggal bergabung</em> seorang siswa pada sebuah ekskul paling tepat disimpan di …',
            opsi: [
              { id: 'asosiatif', label: 'Entitas penghubung Keanggotaan (Siswa – Ekskul)' },
              { id: 'siswa', label: 'Entitas Siswa' },
              { id: 'ekskul', label: 'Entitas Ekskul' },
              { id: 'jadwal', label: 'Entitas Jadwal Latihan' },
            ],
            correct: 'asosiatif',
            umpan: {
              asosiatif:
                'Tepat. Tanggal itu milik <em>pasangan</em> siswa–ekskul, bukan milik salah satunya.',
              siswa:
                'Siswa bisa ikut beberapa ekskul dengan tanggal berbeda — satu kolom tidak cukup.',
              ekskul:
                'Ekskul punya banyak anggota dengan tanggal berbeda — satu kolom tidak cukup.',
              jadwal: 'Jadwal latihan tidak berkaitan dengan kapan siswa bergabung.',
            },
          },
        ],
      },
    },
    kartuAjar: {
      pengantar:
        'Susun langkah yang akan kamu pakai untuk mengajarkan topikmu kepada tim asal. Langkah ini berlaku untuk jenis relasi apa pun.',
      langkah: [
        { id: 'baca', label: 'Bacakan aturan bisnis dan ubah menjadi kalimat dua arah' },
        { id: 'min', label: 'Tentukan minimum tiap arah: wajib (1) atau opsional (0)?' },
        { id: 'maks', label: 'Tentukan maksimum tiap arah: satu (1) atau banyak (N)?' },
        { id: 'jenis', label: 'Gabungkan kedua maksimum menjadi jenis relasi' },
        { id: 'uji', label: 'Beri contoh baru dan minta teman menebak jenisnya' },
      ],
      urutan: ['baca', 'min', 'maks', 'jenis', 'uji'],
    },
  },

  diskusi: {
    kicker: 'Tahap 6 · Diskusi Tim',
    title: 'Kembali ke Tim Asal: Saling Mengajari',
    goal: 'Mengajarkan topik ahli kepada tim asal dan memilah aturan bisnis ke jenis relasi yang tepat.',
    guru: 'Minta setiap ahli mengajar ±3 menit memakai kartu ajarnya, mulai dari 1:1, lalu 1:N, lalu M:N. Pemandu memastikan giliran; Pemeriksa Aturan meminta alasan setiap pemilahan. Berkeliling dan pantau apakah setiap anggota bisa menjelaskan, bukan hanya ahlinya.',
    pengantar:
      'Ahli setiap topik mengajarkan kartu ringkasnya. Setelah semua ahli selesai, pilah bersama setiap aturan bisnis Sistem Ekskul ke jenis relasinya. Pemeriksa Aturan wajib bertanya: "Sudah dibaca dari dua arah?"',
    kategori: [
      { id: 'r11', label: 'One-to-One (1:1)' },
      { id: 'r1n', label: 'One-to-Many (1:N)' },
      { id: 'rmn', label: 'Many-to-Many (M:N)' },
    ],
    aturan: [
      {
        id: 'at1',
        teks: 'Setiap siswa anggota ekskul memegang tepat satu kartu anggota, dan setiap kartu hanya milik satu siswa.',
        correct: 'r11',
        explanation: 'Kedua arah dibatasi satu.',
      },
      {
        id: 'at2',
        teks: 'Setiap ekskul dipimpin satu ketua, dan seorang siswa hanya boleh menjadi ketua di satu ekskul.',
        correct: 'r11',
        explanation: 'Satu ekskul → satu ketua, satu ketua → satu ekskul.',
      },
      {
        id: 'at3',
        teks: 'Seorang pembina dapat membina beberapa ekskul, tetapi setiap ekskul hanya punya satu pembina.',
        correct: 'r1n',
        explanation: 'Banyak dari arah pembina, satu dari arah ekskul.',
      },
      {
        id: 'at4',
        teks: 'Satu ekskul punya banyak jadwal latihan, dan satu jadwal latihan hanya untuk satu ekskul.',
        correct: 'r1n',
        explanation: 'Ekskul adalah induk, jadwal latihan adalah anak.',
      },
      {
        id: 'at5',
        teks: 'Satu ruang latihan dipakai oleh banyak jadwal, dan satu jadwal memakai satu ruang.',
        correct: 'r1n',
        explanation: 'Dari arah jadwal maksimumnya satu ruang.',
      },
      {
        id: 'at6',
        teks: 'Seorang siswa boleh mengikuti beberapa ekskul, dan satu ekskul diikuti banyak siswa.',
        correct: 'rmn',
        explanation: 'Kedua arah "banyak" — perlu entitas penghubung Keanggotaan.',
      },
      {
        id: 'at7',
        teks: 'Satu lomba dapat diikuti beberapa ekskul, dan satu ekskul mengikuti banyak lomba dalam setahun.',
        correct: 'rmn',
        explanation: 'Kedua arah "banyak".',
      },
      {
        id: 'at8',
        teks: 'Seorang siswa dapat meminjam banyak alat ekskul dalam setahun, dan satu alat dipinjam bergantian oleh banyak siswa.',
        correct: 'rmn',
        explanation: 'Kedua arah "banyak" — Peminjaman menjadi entitas penghubungnya.',
      },
    ],
    temuan:
      'Tim kalian menemukan polanya: <strong>maksimum kedua arah</strong> menentukan jenis relasi. Kata "banyak" dari satu arah saja belum cukup untuk menyebut M:N.',
  },

  rancang: {
    kicker: 'Tahap 7 · Rancang ERD',
    title: 'Tentukan Kardinalitas ERD Ekskul',
    goal: 'Menuliskan kardinalitas min..maks setiap sisi relasi dan menurunkan jenis relasinya.',
    guru: 'Satu perangkat per tim boleh dipakai bersama; Pencatat yang memilih, Pemeriksa Aturan membacakan aturan dari dua arah. Bila tim keliru di minimum, tanyakan "Apakah boleh tidak ada?"; bila keliru di maksimum, tanyakan "Apakah boleh lebih dari satu?". Akhiri dengan diskusi entitas penghubung untuk relasi M:N.',
    pengantar:
      'Untuk setiap relasi, baca aturan bisnisnya, lalu pilih kardinalitas <strong>setiap sisi</strong>. Diagram akan berubah sesuai pilihan tim. Ingat: notasi ditulis di dekat entitas yang <em>dihitung</em>.',
    relasi: [
      {
        id: 'rkartu',
        a: ENT.siswa,
        b: ENT.kartu,
        kerja: 'memiliki',
        kerjaBalik: 'dimiliki oleh',
        aturan:
          'Siswa yang mendaftar ekskul mendapat tepat satu kartu anggota; siswa yang belum mendaftar belum punya kartu. Setiap kartu milik tepat satu siswa.',
        ab: '0..1',
        ba: '1..1',
        jenis: '1:1',
      },
      {
        id: 'rbina',
        a: ENT.pembina,
        b: ENT.ekskul,
        kerja: 'membina',
        kerjaBalik: 'dibina oleh',
        aturan:
          'Guru yang terdaftar sebagai pembina membina minimal satu ekskul dan bisa lebih. Setiap ekskul wajib dibina tepat satu pembina.',
        ab: '1..N',
        ba: '1..1',
        jenis: '1:N',
      },
      {
        id: 'rjadwal',
        a: ENT.ekskul,
        b: ENT.jadwal,
        kerja: 'memiliki',
        kerjaBalik: 'milik',
        aturan:
          'Ekskul yang baru dibentuk boleh belum punya jadwal latihan, dan nantinya bisa punya banyak jadwal. Setiap jadwal latihan milik tepat satu ekskul.',
        ab: '0..N',
        ba: '1..1',
        jenis: '1:N',
      },
      {
        id: 'rikut',
        a: ENT.siswa,
        b: ENT.ekskul,
        kerja: 'mengikuti',
        kerjaBalik: 'diikuti oleh',
        aturan:
          'Siswa boleh tidak mengikuti ekskul apa pun, atau mengikuti beberapa ekskul. Ekskul baru boleh berjalan bila punya minimal satu anggota, dan bisa punya banyak anggota.',
        ab: '0..N',
        ba: '1..N',
        jenis: 'M:N',
      },
    ],
    pertanyaan: [
      {
        id: 'rc1',
        tanya:
          'Relasi Siswa – Ekskul berjenis M:N. Bagaimana tim mewujudkannya saat merancang tabel?',
        opsi: [
          {
            id: 'keanggotaan',
            label:
              'Menambah entitas penghubung Keanggotaan dengan dua relasi 1:N ke Siswa dan Ekskul',
          },
          { id: 'fkSiswa', label: 'Menambah kolom id_ekskul di tabel Siswa' },
          { id: 'fkEkskul', label: 'Menambah kolom id_siswa di tabel Ekskul' },
          { id: 'ubah1n', label: 'Mengubah aturan agar siswa hanya boleh ikut satu ekskul' },
        ],
        correct: 'keanggotaan',
        umpan: {
          keanggotaan:
            'Tepat! Keanggotaan menyimpan id_siswa dan id_ekskul (plus tanggal bergabung), memecah M:N menjadi dua 1:N.',
          fkSiswa: 'Satu kolom hanya muat satu ekskul, padahal siswa boleh ikut beberapa.',
          fkEkskul: 'Satu kolom hanya muat satu siswa, padahal ekskul punya banyak anggota.',
          ubah1n: 'Rancangan harus mengikuti aturan bisnis pengguna, bukan sebaliknya.',
        },
      },
    ],
    simpulan:
      'ERD Ekskul tim kalian lengkap: <strong>Siswa–Kartu Anggota 1:1</strong>, <strong>Pembina–Ekskul 1:N</strong>, <strong>Ekskul–Jadwal Latihan 1:N</strong>, dan <strong>Siswa–Ekskul M:N</strong> (diwujudkan lewat entitas Keanggotaan).',
  },

  /* ==========================================================
     SINTAKS 5 — Evaluasi
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 8 · Evaluasi',
    title: 'Kuis Individu & Uji Silang',
    goal: 'Membuktikan pemahaman individu dan memeriksa ERD tim lain berdasarkan aturan bisnis.',
    guru: 'Bagian A dikerjakan individu tanpa bantuan — tegaskan bahwa poin peningkatan tiap orang menyumbang nilai tim. Bagian B (uji silang) dikerjakan per tim: Juru Bicara menyampaikan temuan kesalahan kepada tim pemilik ERD. Simpan waktu 5 menit untuk membahas kesalahan yang paling sering muncul.',
    pengantarKuis:
      '<strong>Bagian A — Kuis individu.</strong> Kerjakan sendiri. Setiap soal hanya bisa dijawab sekali. Kasusnya: aplikasi UKS sekolah.',
    soal: [
      {
        id: 'ev1',
        tanya:
          'Aturan: "Setiap siswa punya tepat satu kartu kesehatan, dan setiap kartu kesehatan milik tepat satu siswa." Jenis relasi <strong>Siswa – Kartu Kesehatan</strong>?',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'r11',
        umpan: {
          r11: 'Kedua arah maksimum satu.',
          r1n: 'Tidak ada arah yang boleh "banyak" di aturan ini.',
          rmn: 'Tidak ada arah yang boleh "banyak" di aturan ini.',
          tidak: 'Kartu kesehatan jelas terhubung dengan siswa pemiliknya.',
        },
      },
      {
        id: 'ev2',
        tanya:
          'Aturan: "Satu petugas UKS mencatat banyak kunjungan; setiap kunjungan dicatat oleh satu petugas." Jenis relasi <strong>Petugas – Kunjungan</strong>?',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'r1n',
        umpan: {
          r11: 'Satu petugas mencatat <em>banyak</em> kunjungan.',
          r1n: 'Satu petugas → banyak kunjungan; satu kunjungan → satu petugas.',
          rmn: 'Dari arah kunjungan, maksimumnya satu petugas.',
          tidak: 'Petugas dan kunjungan terhubung lewat pencatatan.',
        },
      },
      {
        id: 'ev3',
        tanya:
          'Aturan: "Dalam satu kunjungan bisa diberikan beberapa jenis obat, dan satu jenis obat diberikan pada banyak kunjungan." Jenis relasi <strong>Kunjungan – Obat</strong>?',
        opsi: opsiJenis({ id: 'tidak', label: 'Tidak ada relasi' }),
        correct: 'rmn',
        umpan: {
          r11: 'Kedua arah boleh lebih dari satu.',
          r1n: 'Baca juga dari arah obat: satu obat diberikan pada <em>banyak</em> kunjungan.',
          rmn: 'Kedua arah "banyak".',
          tidak: 'Obat diberikan dalam kunjungan, jadi keduanya terhubung.',
        },
      },
      {
        id: 'ev4',
        tanya:
          'Aturan: "Setiap kunjungan WAJIB dicatat oleh tepat satu petugas." Kardinalitas di sisi <strong>Petugas</strong> (dilihat dari satu Kunjungan) adalah …',
        opsi: [
          { id: '11', label: '<code>1..1</code>' },
          { id: '01', label: '<code>0..1</code>' },
          { id: '1n', label: '<code>1..N</code>' },
          { id: '0n', label: '<code>0..N</code>' },
        ],
        correct: '11',
        umpan: {
          11: 'Wajib (min 1) dan tepat satu (maks 1).',
          '01': 'Kata "WAJIB" berarti minimumnya 1, bukan 0.',
          '1n': 'Kata "tepat satu" berarti maksimumnya 1, bukan N.',
          '0n': 'Minimum dan maksimumnya keliru: wajib dan tepat satu.',
        },
      },
      {
        id: 'ev5',
        tanya: 'Relasi M:N Kunjungan – Obat diwujudkan dalam tabel dengan …',
        opsi: [
          {
            id: 'resep',
            label: 'Entitas penghubung Pemberian Obat yang berisi id_kunjungan dan id_obat',
          },
          { id: 'kolomObat', label: 'Kolom obat1, obat2, obat3 di tabel Kunjungan' },
          { id: 'gabung', label: 'Menggabungkan Kunjungan dan Obat menjadi satu tabel' },
          { id: 'fkObat', label: 'Kolom id_kunjungan di tabel Obat' },
        ],
        correct: 'resep',
        umpan: {
          resep: 'Tepat. Entitas penghubung memecah M:N menjadi dua 1:N dan bisa menyimpan dosis.',
          kolomObat: 'Kolom berulang membatasi jumlah obat dan menyulitkan laporan pemakaian obat.',
          gabung: 'Data obat akan berulang di setiap kunjungan.',
          fkObat: 'Satu obat diberikan pada banyak kunjungan — satu kolom tidak cukup.',
        },
      },
    ],
    ujiSilang: {
      pengantar:
        '<strong>Bagian B — Uji silang (per tim).</strong> Tim lain menyerahkan ERD UKS berikut. Bandingkan setiap relasi dengan aturan bisnisnya.',
      tanya: 'Kesalahan mana yang benar-benar ada pada ERD tim lain? Pilih semua yang tepat.',
      relasi: [
        {
          id: 'uKartu',
          a: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
          b: { id: 'kartuSehat', label: 'Kartu Kesehatan', ikon: '💳' },
          kerja: 'memiliki',
          kerjaBalik: 'dimiliki oleh',
          aturan:
            'Setiap siswa wajib punya tepat satu kartu kesehatan; setiap kartu milik tepat satu siswa.',
          ab: '1..1',
          ba: '1..1',
          timAb: '1..N',
          timBa: '1..1',
        },
        {
          id: 'uCatat',
          a: { id: 'petugas', label: 'Petugas UKS', ikon: '🩺' },
          b: { id: 'kunjungan', label: 'Kunjungan', ikon: '📋' },
          kerja: 'mencatat',
          kerjaBalik: 'dicatat oleh',
          aturan:
            'Petugas baru boleh belum mencatat kunjungan dan bisa mencatat banyak; setiap kunjungan dicatat tepat satu petugas.',
          ab: '0..N',
          ba: '1..1',
          timAb: '0..N',
          timBa: '1..1',
        },
        {
          id: 'uObat',
          a: { id: 'kunjungan', label: 'Kunjungan', ikon: '📋' },
          b: { id: 'obat', label: 'Obat', ikon: '💊' },
          kerja: 'diberi',
          kerjaBalik: 'diberikan pada',
          aturan:
            'Kunjungan boleh tanpa obat atau dengan beberapa obat; satu obat boleh belum pernah diberikan dan bisa diberikan pada banyak kunjungan.',
          ab: '0..N',
          ba: '0..N',
          timAb: '0..N',
          timBa: '0..1',
        },
        {
          id: 'uDatang',
          a: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
          b: { id: 'kunjungan', label: 'Kunjungan', ikon: '📋' },
          kerja: 'melakukan',
          kerjaBalik: 'dilakukan oleh',
          aturan:
            'Siswa boleh belum pernah berkunjung ke UKS dan bisa berkunjung berkali-kali; setiap kunjungan dilakukan tepat satu siswa.',
          ab: '0..N',
          ba: '1..1',
          timAb: '1..N',
          timBa: '1..1',
        },
      ],
      opsi: [
        {
          id: 'salahKartu',
          label: 'Siswa – Kartu Kesehatan: maksimum kartu per siswa seharusnya 1, bukan N',
          benar: true,
          alasan: 'Aturannya "tepat satu kartu", jadi notasinya 1..1 dan relasinya 1:1, bukan 1:N.',
        },
        {
          id: 'salahObat',
          label:
            'Kunjungan – Obat: satu obat bisa diberikan pada banyak kunjungan, jadi sisi Kunjungan seharusnya 0..N',
          benar: true,
          alasan: 'Dengan 0..1, relasinya keliru menjadi 1:N; seharusnya M:N.',
        },
        {
          id: 'salahDatang',
          label:
            'Siswa – Kunjungan: minimum kunjungan per siswa seharusnya 0 karena siswa boleh belum pernah berkunjung',
          benar: true,
          alasan: 'Kata "boleh belum pernah" berarti opsional — 0..N, bukan 1..N.',
        },
        {
          id: 'catatMn',
          label: 'Petugas – Kunjungan: relasinya seharusnya M:N',
          benar: false,
          alasan: 'Setiap kunjungan dicatat tepat satu petugas, jadi 1:N sudah benar.',
        },
        {
          id: 'kartuMin',
          label: 'Siswa – Kartu Kesehatan: minimum kartu per siswa seharusnya 0',
          benar: false,
          alasan: 'Aturannya "wajib punya", jadi minimumnya 1.',
        },
        {
          id: 'catatOpsional',
          label: 'Petugas – Kunjungan: setiap kunjungan boleh tidak dicatat petugas (0..1)',
          benar: false,
          alasan: 'Aturannya "dicatat tepat satu petugas", jadi 1..1 sudah benar.',
        },
      ],
      done: '<strong>Uji silang tuntas!</strong> Juru Bicara, sampaikan ketiga kesalahan beserta alasannya kepada tim pemilik ERD.',
    },
  },

  /* ==========================================================
     SINTAKS 6 — Memberikan penghargaan
     ========================================================== */
  penghargaan: {
    kicker: 'Tahap 9 · Penghargaan',
    title: 'Poin Peningkatan & Predikat Tim',
    goal: 'Menghitung sumbangan poin peningkatan individu dan menentukan predikat tim.',
    guru: 'Minta setiap anggota menyebutkan poin peningkatannya, lalu Pencatat memasukkannya. Umumkan predikat tim di depan kelas dan rayakan tim yang anggotanya paling meningkat — bukan sekadar tim dengan nilai tertinggi. Berikan sertifikat/stiker sederhana bila memungkinkan.',
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
      'Kardinalitas ditulis <code>min..maks</code>: minimum menunjukkan wajib (1) atau opsional (0); maksimum menunjukkan satu (1) atau banyak (N).',
      'Baca relasi <strong>dari dua arah</strong>: "Satu A punya minimal … dan maksimal … B", lalu sebaliknya.',
      'Jenis relasi ditentukan oleh <strong>maksimum kedua arah</strong>: 1 & 1 → 1:1, N & 1 → 1:N, N & N → M:N.',
      'Relasi M:N diwujudkan dengan <strong>entitas penghubung</strong> yang memecahnya menjadi dua relasi 1:N.',
    ],
  },

  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Refleksi Diri & Kerja Tim',
    goal: 'Menilai pemahaman diri dan kontribusi dalam kerja tim.',
    guru: 'Beri waktu 5 menit untuk refleksi mandiri. Baca sekilas jawaban terbuka untuk menemukan konsep yang masih membingungkan dan dinamika tim yang perlu dibenahi pada pertemuan berikutnya.',
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
        teks: 'Aku bisa membaca aturan bisnis dari dua arah untuk menemukan batas minimum dan maksimum.',
      },
      {
        id: 'p2',
        teks: 'Aku bisa menulis kardinalitas dengan notasi min..maks (0..1, 1..1, 0..N, 1..N).',
      },
      {
        id: 'p3',
        teks: 'Aku bisa menentukan jenis relasi 1:1, 1:N, atau M:N dari kardinalitasnya.',
      },
      {
        id: 'p4',
        teks: 'Aku bisa menemukan dan menjelaskan kesalahan kardinalitas pada ERD tim lain.',
      },
      {
        id: 'p5',
        teks: 'Aku mengajarkan topik ahliku dengan jelas dan membantu temanku memahaminya.',
      },
    ],
    tanyaTerbuka:
      'Bagian mana yang paling terbantu oleh penjelasan temanmu? Apa yang akan kamu perbaiki dari kerja timmu?',
  },

  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Hebat, Timmu Tuntas!',
    goal: 'Melihat rekap skor dan rancangan ERD akhir.',
    pesan:
      'Kamu sudah menentukan jenis relasi dan kardinalitas pada ERD Sistem Ekskul serta memeriksa ERD tim lain. Bawa kebiasaan "baca dari dua arah" ke setiap rancangan basis data berikutnya!',
  },
};

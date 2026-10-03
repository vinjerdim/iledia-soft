'use strict';

/* ============================================================
   data.js — Konten media pembelajaran
   Rekayasa Perangkat Lunak: Menganalisis Konsep Normalisasi
   Basis Data (1NF, 2NF, 3NF) untuk Mengatasi Redundansi Data
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Berkas ini hanya berisi KONTEN; logika tampilan ada di app.js
   dan shared/engine.js. Guru dapat menyunting teks, soal, kunci,
   dan umpan balik di sini tanpa menyentuh kode.

   Masalah autentik: Koperasi Siswa mencatat penjualan di satu
   lembar spreadsheet. Harga yang tidak konsisten, siswa baru yang
   tidak bisa dicatat, dan data yang ikut hilang saat nota dihapus
   membuat pengelola kewalahan. Tim murid menyelidiki penyebabnya
   (redundansi), lalu menormalisasi tabel itu bertahap 1NF → 2NF →
   3NF dan menyajikan buktinya. Kasus transfer pada evaluasi:
   nota servis laptop Teaching Factory (TEFA).

   Pemetaan sintaks PBL → tahap media:
     1. Orientasi murid pada masalah
                         → orientasi       (TP, alur, apersepsi)
                         → masalah         (amati spreadsheet, pilah
                                            anomali, akar masalah,
                                            rumusan masalah)
     2. Mengorganisasi murid untuk belajar
                         → organisasi      (peran tim, rencana
                                            langkah penyelidikan)
     3. Membimbing penyelidikan individu & kelompok
                         → konsep          (bekal: atomik, kunci,
                                            ketergantungan, 1NF–3NF)
                         → nf1             (selidiki sel tak atomik,
                                            bentuk 1NF & kuncinya)
                         → ketergantungan  (pilah ketergantungan
                                            penuh/parsial/transitif)
     4. Mengembangkan & menyajikan hasil karya
                         → dekomposisi     (pecah ke 2NF lalu 3NF)
                         → sajikan         (bukti redundansi turun,
                                            klaim presentasi)
     5. Menganalisis & mengevaluasi proses pemecahan masalah
                         → evaluasi        (kasus TEFA + uji silang
                                            rancangan tim lain)
                         → refleksi
     Penutup             → selesai

   KONVENSI TABEL: lihat engine seksi 16. `REKAP` adalah tabel asal
   (bentuk tidak normal); `HASIL_2NF` dan `HASIL_3NF` adalah kunci
   rancangan. Kunci pemilahan ketergantungan dan atribut diuji
   otomatis terhadap engine (tests/mpi-f-1.4-data.test.js).

   ATURAN: setiap pilihan punya `id` unik dan stabil. Urutan
   tampilnya DIACAK oleh app.js (initOrders) dan jawaban murid
   disimpan per id.
   ============================================================ */

/* Kolom spreadsheet Koperasi Siswa. */
var KOLOM_KOP = {
  nota: 'No Nota',
  tgl: 'Tanggal',
  nis: 'NIS',
  nama: 'Nama Siswa',
  kelas: 'Kelas',
  wali: 'Wali Kelas',
  kode: 'Kode Barang',
  barang: 'Nama Barang',
  harga: 'Harga',
  jml: 'Jumlah',
};

/* kolomKop('nis', 'siswa') → { id: 'nis', teks: 'NIS', fk: 'siswa' } */
function kolomKop(id, fk) {
  var k = { id: id, teks: KOLOM_KOP[id] };
  if (fk) k.fk = fk;
  return k;
}

/* Ketergantungan fungsional yang berlaku di koperasi (satu ruas kanan
   per butir agar mudah dipilah murid). */
var FD_KOP = [
  { id: 'fJml', dari: ['nota', 'kode'], ke: ['jml'] },
  { id: 'fTgl', dari: ['nota'], ke: ['tgl'] },
  { id: 'fNis', dari: ['nota'], ke: ['nis'] },
  { id: 'fBarang', dari: ['kode'], ke: ['barang'] },
  { id: 'fHarga', dari: ['kode'], ke: ['harga'] },
  { id: 'fNama', dari: ['nis'], ke: ['nama'] },
  { id: 'fKelas', dari: ['nis'], ke: ['kelas'] },
  { id: 'fWali', dari: ['kelas'], ke: ['wali'] },
];

/* Spreadsheet asal: satu baris per nota, barang ditulis berderet. */
var REKAP = {
  id: 'rekap',
  label: 'Rekap Penjualan Koperasi Siswa',
  ikon: '📒',
  kolom: ['nota', 'tgl', 'nis', 'nama', 'kelas', 'wali', 'kode', 'barang', 'harga', 'jml'].map(
    function (id) {
      return kolomKop(id);
    }
  ),
  pk: ['nota', 'kode'],
  fd: FD_KOP,
  baris: [
    {
      nota: 'N001',
      tgl: '03-08-2026',
      nis: '1021',
      nama: 'Ayu Lestari',
      kelas: 'XI RPL 1',
      wali: 'Bu Rina',
      kode: ['B01', 'B07'],
      barang: ['Pulpen', 'Buku Tulis'],
      harga: ['Rp3.500', 'Rp6.000'],
      jml: ['2', '3'],
    },
    {
      nota: 'N002',
      tgl: '03-08-2026',
      nis: '1034',
      nama: 'Dimas Pratama',
      kelas: 'XI RPL 2',
      wali: 'Pak Hadi',
      kode: ['B07', 'B12'],
      barang: ['Buku Tulis', 'Map Plastik'],
      harga: ['Rp6.000', 'Rp2.500'],
      jml: ['1', '2'],
    },
    {
      nota: 'N003',
      tgl: '04-08-2026',
      nis: '1021',
      nama: 'Ayu Lestari',
      kelas: 'XI RPL 1',
      wali: 'Bu Rina',
      kode: ['B01'],
      barang: ['Pulpen'],
      harga: ['Rp3.500'],
      jml: ['1'],
    },
    {
      nota: 'N004',
      tgl: '05-08-2026',
      nis: '1045',
      nama: 'Sinta Maharani',
      kelas: 'XI RPL 1',
      wali: 'Bu Rina',
      kode: ['B07', 'B01'],
      barang: ['Buku Tulis', 'Pulpen'],
      harga: ['Rp6.000', 'Rp3.500'],
      jml: ['2', '1'],
    },
  ],
};

/* Kunci rancangan 2NF: ketergantungan parsial dipisahkan. */
var HASIL_2NF = [
  {
    id: 'nota2',
    label: 'Nota (sementara)',
    ikon: '🧾',
    kolom: [
      kolomKop('nota'),
      kolomKop('tgl'),
      kolomKop('nis'),
      kolomKop('nama'),
      kolomKop('kelas'),
      kolomKop('wali'),
    ],
    pk: ['nota'],
  },
  {
    id: 'barang',
    label: 'Barang',
    ikon: '📦',
    kolom: [kolomKop('kode'), kolomKop('barang'), kolomKop('harga')],
    pk: ['kode'],
  },
  {
    id: 'detail',
    label: 'Detail Nota',
    ikon: '🧮',
    kolom: [kolomKop('nota', 'nota2'), kolomKop('kode', 'barang'), kolomKop('jml')],
    pk: ['nota', 'kode'],
  },
];

/* Kunci rancangan 3NF: ketergantungan transitif ikut dipisahkan. */
var HASIL_3NF = [
  {
    id: 'nota',
    label: 'Nota',
    ikon: '🧾',
    kolom: [kolomKop('nota'), kolomKop('tgl'), kolomKop('nis', 'siswa')],
    pk: ['nota'],
  },
  {
    id: 'siswa',
    label: 'Siswa',
    ikon: '🧑‍🎓',
    kolom: [kolomKop('nis'), kolomKop('nama'), kolomKop('kelas', 'kelas')],
    pk: ['nis'],
  },
  {
    id: 'kelas',
    label: 'Kelas',
    ikon: '🏫',
    kolom: [kolomKop('kelas'), kolomKop('wali')],
    pk: ['kelas'],
  },
  {
    id: 'barang',
    label: 'Barang',
    ikon: '📦',
    kolom: [kolomKop('kode'), kolomKop('barang'), kolomKop('harga')],
    pk: ['kode'],
  },
  {
    id: 'detail',
    label: 'Detail Nota',
    ikon: '🧮',
    kolom: [kolomKop('nota', 'nota'), kolomKop('kode', 'barang'), kolomKop('jml')],
    pk: ['nota', 'kode'],
  },
];

/* Kasus evaluasi: nota servis laptop Teaching Factory (TEFA). */
var KOLOM_TEFA = {
  srv: 'No Servis',
  tglm: 'Tgl Masuk',
  kplg: 'Kode Pelanggan',
  nplg: 'Nama Pelanggan',
  hp: 'No HP',
  ktek: 'Kode Teknisi',
  ntek: 'Nama Teknisi',
  klay: 'Kode Layanan',
  nlay: 'Nama Layanan',
  biaya: 'Biaya',
};

function kolomTefa(id, fk) {
  var k = { id: id, teks: KOLOM_TEFA[id] };
  if (fk) k.fk = fk;
  return k;
}

var SERVIS = {
  id: 'servis',
  label: 'Nota Servis Laptop TEFA',
  ikon: '💻',
  kolom: Object.keys(KOLOM_TEFA).map(function (id) {
    return kolomTefa(id);
  }),
  pk: ['srv', 'klay'],
  fd: [
    { id: 'tSrv', dari: ['srv'], ke: ['tglm', 'kplg', 'ktek'] },
    { id: 'tPlg', dari: ['kplg'], ke: ['nplg', 'hp'] },
    { id: 'tTek', dari: ['ktek'], ke: ['ntek'] },
    { id: 'tLay', dari: ['klay'], ke: ['nlay', 'biaya'] },
  ],
  baris: [
    {
      srv: 'S01',
      tglm: '10-09-2026',
      kplg: 'P01',
      nplg: 'Raka',
      hp: '0812-1111',
      ktek: 'T1',
      ntek: 'Pak Joko',
      klay: ['L1', 'L3'],
      nlay: ['Instal Ulang OS', 'Ganti Keyboard'],
      biaya: ['Rp75.000', 'Rp150.000'],
    },
    {
      srv: 'S02',
      tglm: '10-09-2026',
      kplg: 'P02',
      nplg: 'Nadia',
      hp: '0813-2222',
      ktek: 'T2',
      ntek: 'Mbak Lia',
      klay: ['L2'],
      nlay: ['Bersihkan Kipas'],
      biaya: ['Rp50.000'],
    },
    {
      srv: 'S03',
      tglm: '11-09-2026',
      kplg: 'P01',
      nplg: 'Raka',
      hp: '0812-1111',
      ktek: 'T2',
      ntek: 'Mbak Lia',
      klay: ['L2', 'L1'],
      nlay: ['Bersihkan Kipas', 'Instal Ulang OS'],
      biaya: ['Rp50.000', 'Rp75.000'],
    },
  ],
};

/* Kunci 3NF kasus TEFA (untuk pembahasan & tes). */
var SERVIS_3NF = [
  {
    id: 'srv',
    label: 'Servis',
    kolom: [
      kolomTefa('srv'),
      kolomTefa('tglm'),
      kolomTefa('kplg', 'plg'),
      kolomTefa('ktek', 'tek'),
    ],
    pk: ['srv'],
  },
  {
    id: 'plg',
    label: 'Pelanggan',
    kolom: [kolomTefa('kplg'), kolomTefa('nplg'), kolomTefa('hp')],
    pk: ['kplg'],
  },
  { id: 'tek', label: 'Teknisi', kolom: [kolomTefa('ktek'), kolomTefa('ntek')], pk: ['ktek'] },
  {
    id: 'lay',
    label: 'Layanan',
    kolom: [kolomTefa('klay'), kolomTefa('nlay'), kolomTefa('biaya')],
    pk: ['klay'],
  },
  {
    id: 'dtl',
    label: 'Detail Servis',
    kolom: [kolomTefa('srv', 'srv'), kolomTefa('klay', 'lay')],
    pk: ['srv', 'klay'],
  },
];

/* Rancangan Tim Merah yang diuji silang — sengaja keliru. */
var SERVIS_TIM_MERAH = [
  {
    id: 'srv',
    label: 'Servis',
    ikon: '🛠️',
    kolom: [
      kolomTefa('srv'),
      kolomTefa('tglm'),
      kolomTefa('kplg'),
      kolomTefa('nplg'),
      kolomTefa('ktek', 'tek'),
    ],
    pk: ['srv'],
  },
  {
    id: 'tek',
    label: 'Teknisi',
    ikon: '🧑‍🔧',
    kolom: [kolomTefa('ktek'), kolomTefa('ntek')],
    pk: ['ktek'],
  },
  {
    id: 'lay',
    label: 'Layanan',
    ikon: '🧰',
    kolom: [kolomTefa('klay'), kolomTefa('nlay')],
    pk: ['klay'],
  },
  {
    id: 'dtl',
    label: 'Detail Servis',
    ikon: '🧮',
    kolom: [kolomTefa('srv', 'srv'), kolomTefa('klay', 'lay'), kolomTefa('biaya')],
    pk: ['srv', 'klay'],
  },
];

var DATA = {
  tahap: [
    { id: 'orientasi', label: 'Orientasi', sintaks: 'Sintaks 1 · Orientasi pada Masalah' },
    { id: 'masalah', label: 'Masalah Koperasi', sintaks: 'Sintaks 1 · Orientasi pada Masalah' },
    {
      id: 'organisasi',
      label: 'Atur Tim',
      sintaks: 'Sintaks 2 · Mengorganisasi Murid untuk Belajar',
    },
    { id: 'konsep', label: 'Bekal Konsep', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    { id: 'nf1', label: 'Selidiki 1NF', sintaks: 'Sintaks 3 · Membimbing Penyelidikan' },
    {
      id: 'ketergantungan',
      label: 'Ketergantungan',
      sintaks: 'Sintaks 3 · Membimbing Penyelidikan',
    },
    {
      id: 'dekomposisi',
      label: 'Pecah 2NF & 3NF',
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

  rekap: REKAP,
  hasil2NF: HASIL_2NF,
  hasil3NF: HASIL_3NF,

  /* ==========================================================
     SINTAKS 1 — Orientasi murid pada masalah
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Spreadsheet Koperasi yang Bikin Pusing',
    goal: 'Mengetahui tujuan belajar, alur pemecahan masalah, dan cara memakai media ini.',
    guru: 'Bentuk kelompok berisi 3–4 murid. Ingatkan materi 1.3: ERD sudah dirancang, kini kita memastikan <em>tabel</em>-nya bebas redundansi. Tayangkan tahap ini di layar kelas dan ajak murid menjawab pemanasan secara lisan sebelum menekan pilihan.',
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Menganalisis konsep normalisasi basis data (1NF, 2NF, 3NF) untuk mengatasi redundansi data.',
    kriteria: [
      'Mengidentifikasi redundansi data serta anomali sisip, ubah, dan hapus pada tabel yang belum normal.',
      'Menerapkan 1NF: memastikan setiap sel bernilai atomik dan menentukan kunci primer.',
      'Menganalisis ketergantungan fungsional penuh, parsial, dan transitif terhadap kunci primer.',
      'Memecah tabel menjadi 2NF lalu 3NF tanpa kehilangan data, lengkap dengan kunci primer dan kunci tamu.',
      'Mengevaluasi rancangan tabel tim lain dan menjelaskan pelanggaran bentuk normalnya.',
    ],
    pengantar:
      'Bu Wati, pembina <strong>Koperasi Siswa</strong>, mencatat setiap penjualan di satu lembar spreadsheet. Awalnya praktis, tetapi sekarang harga barang sering berbeda-beda, siswa baru tidak bisa didaftarkan, dan data ikut hilang ketika nota dibatalkan. Bu Wati meminta timmu menyelidiki penyebabnya dan merancang ulang tabelnya.',
    alur: [
      { judul: 'Masalah Koperasi', desk: 'Amati spreadsheet, kenali anomali, rumuskan masalah.' },
      { judul: 'Atur Tim', desk: 'Bagi peran dan susun rencana penyelidikan.' },
      { judul: 'Bekal Konsep', desk: 'Pelajari atomik, kunci, ketergantungan, 1NF–3NF.' },
      { judul: 'Selidiki 1NF', desk: 'Temukan sel tak atomik dan tentukan kunci primer.' },
      { judul: 'Ketergantungan', desk: 'Pilah ketergantungan penuh, parsial, dan transitif.' },
      { judul: 'Pecah 2NF & 3NF', desk: 'Pindahkan atribut ke tabel yang tepat.' },
      { judul: 'Sajikan Hasil', desk: 'Buktikan redundansi turun dan anomali teratasi.' },
      { judul: 'Evaluasi', desk: 'Terapkan pada kasus servis TEFA dan uji rancangan tim lain.' },
    ],
    caraPakai: [
      'Kerjakan bersama tim; diskusikan <em>alasan</em> sebelum memilih jawaban.',
      'Pertanyaan boleh dicoba lagi sampai benar; skor dihitung dari percobaan pertama. Kuis evaluasi hanya bisa dijawab sekali.',
      'Urutan pilihan jawaban diacak, jadi hafalan posisi jawaban tidak membantu.',
      'Progres tersimpan otomatis di perangkat ini. Tombol Reset mengulang dari awal dan mengacak ulang pilihan.',
    ],
    apersepsi: {
      tanya:
        'Pemanasan: harga pulpen di koperasi naik. Di spreadsheet, harga pulpen tertulis di banyak baris. Menurutmu apa yang paling mungkin terjadi?',
      opsi: [
        { id: 'semua', label: 'Petugas mengubah semua baris dengan teliti, tidak ada masalah' },
        { id: 'lupa', label: 'Ada baris yang terlewat sehingga harga pulpen jadi berbeda-beda' },
        { id: 'otomatis', label: 'Spreadsheet otomatis memperbarui semua harga' },
        { id: 'hapus', label: 'Baris lama harus dihapus semuanya' },
      ],
      umpan:
        'Apa pun tebakanmu, masalah intinya sama: <strong>satu fakta (harga pulpen) disimpan berulang kali</strong>. Inilah <strong>redundansi data</strong>. Hari ini kalian menyelidiki cara menghilangkannya dengan <strong>normalisasi</strong>.',
    },
  },

  masalah: {
    kicker: 'Tahap 2 · Masalah Koperasi',
    title: 'Selidiki Keluhan Bu Wati',
    goal: 'Mengenali redundansi dan anomali data pada spreadsheet, lalu merumuskan masalah.',
    guru: 'Biarkan tim mengamati tabel 2–3 menit tanpa petunjuk. Tanyakan: "Data apa yang ditulis berulang?" Saat memilah anomali, minta tiap tim menjelaskan satu contoh dengan kata-kata sendiri. Rumusan masalah tidak dinilai otomatis — pilih dua rumusan untuk dibacakan.',
    kutipan:
      '"Kemarin harga Buku Tulis naik jadi Rp6.500. Saya ubah di beberapa baris, tapi ternyata ada yang terlewat. Laporan pendapatan jadi kacau. Siswa baru juga tidak bisa saya daftarkan sebelum belanja…" — Bu Wati, pembina koperasi',
    tabelJudul: 'Spreadsheet Rekap Penjualan Koperasi Siswa',
    amati:
      'Amati tabel di atas (geser ke samping bila kolomnya terpotong). Perhatikan data apa saja yang ditulis berulang, dan sel mana yang berisi lebih dari satu nilai.',
    anomali: {
      pengantar:
        'Masalah akibat redundansi disebut <strong>anomali</strong>. Pilah setiap kejadian di koperasi ke jenis anomalinya.',
      kategori: [
        { id: 'ubah', label: 'Anomali ubah (update)' },
        { id: 'sisip', label: 'Anomali sisip (insert)' },
        { id: 'hapus', label: 'Anomali hapus (delete)' },
        { id: 'bukan', label: 'Bukan anomali data' },
      ],
      items: [
        {
          id: 'an1',
          teks: 'Harga Buku Tulis naik. Harga itu harus diubah di tiga nota; satu terlewat sehingga harganya tidak konsisten.',
          correct: 'ubah',
          explanation:
            'Satu fakta yang tersimpan berulang harus diubah di banyak tempat. Bila satu terlewat, data saling bertentangan — itulah anomali ubah.',
        },
        {
          id: 'an2',
          teks: 'Wali kelas XI RPL 1 berganti. Semua nota milik siswa XI RPL 1 harus disunting satu per satu.',
          correct: 'ubah',
          explanation:
            'Nama wali kelas ditulis di setiap nota siswa kelas itu, jadi satu perubahan menyentuh banyak baris — anomali ubah.',
        },
        {
          id: 'an3',
          teks: 'Barang baru "Stabilo" belum pernah terjual, sehingga tidak bisa dicatat karena setiap baris wajib punya No Nota.',
          correct: 'sisip',
          explanation:
            'Data barang tidak bisa disisipkan tanpa data lain (nota) yang belum ada — anomali sisip.',
        },
        {
          id: 'an4',
          teks: 'Siswa baru yang mendaftar menjadi anggota koperasi tidak bisa dicatat sebelum ia berbelanja.',
          correct: 'sisip',
          explanation:
            'Data siswa "menumpang" pada baris nota, sehingga siswa tanpa nota tidak punya tempat — anomali sisip.',
        },
        {
          id: 'an5',
          teks: 'Nota N002 dibatalkan lalu dihapus; data Dimas Pratama dan wali kelas XI RPL 2 ikut hilang.',
          correct: 'hapus',
          explanation:
            'Menghapus satu fakta (nota) membuat fakta lain (siswa, wali kelas) ikut lenyap — anomali hapus.',
        },
        {
          id: 'an6',
          teks: 'Setelah nota N002 dihapus, tidak ada lagi catatan bahwa Map Plastik (B12) dijual seharga Rp2.500.',
          correct: 'hapus',
          explanation:
            'Data barang B12 hanya ada di nota N002, sehingga ikut hilang saat nota dihapus — anomali hapus.',
        },
        {
          id: 'an7',
          teks: 'File spreadsheet lambat dibuka di laptop koperasi yang sudah tua.',
          correct: 'bukan',
          explanation: 'Ini masalah perangkat keras, bukan akibat cara data disusun dalam tabel.',
        },
        {
          id: 'an8',
          teks: 'Bu Wati lupa kata sandi akun komputernya sehingga tidak bisa membuka file.',
          correct: 'bukan',
          explanation: 'Ini masalah akses akun, tidak berhubungan dengan struktur tabel data.',
        },
      ],
    },
    akar: {
      tanya:
        'Dari hasil pengamatan, mana saja yang merupakan <strong>akar masalah</strong> pada rancangan tabel (bukan sekadar gejala)?',
      opsi: [
        {
          id: 'campur',
          label:
            'Satu tabel menyimpan data beberapa hal sekaligus: nota, siswa, kelas, dan barang.',
          benar: true,
          alasan:
            'Karena semua hal dicampur, fakta tentang siswa dan barang ikut ditulis ulang di setiap nota.',
        },
        {
          id: 'ulang',
          label:
            'Fakta yang sama (nama barang, harga, nama siswa, wali kelas) ditulis berulang di banyak baris.',
          benar: true,
          alasan: 'Inilah redundansi data — sumber anomali ubah, sisip, dan hapus.',
        },
        {
          id: 'atomik',
          label:
            'Ada sel yang berisi lebih dari satu nilai, misalnya beberapa barang dalam satu sel.',
          benar: true,
          alasan:
            'Sel tak atomik menyulitkan pencarian dan perhitungan, misalnya total penjualan Pulpen.',
        },
        {
          id: 'teliti',
          label: 'Petugas koperasi kurang teliti saat mengetik.',
          benar: false,
          alasan:
            'Ketelitian membantu, tetapi rancangan yang baik tidak bergantung pada petugas yang tidak pernah lupa. Ini gejala, bukan akar.',
        },
        {
          id: 'warna',
          label: 'Spreadsheet kurang berwarna sehingga sulit dibaca.',
          benar: false,
          alasan: 'Tampilan tidak mengubah struktur data; redundansinya tetap ada.',
        },
        {
          id: 'banyak',
          label: 'Barang yang dijual koperasi terlalu banyak.',
          benar: false,
          alasan:
            'Jumlah barang wajar bertambah. Masalahnya ada pada cara barang disimpan berulang, bukan pada jumlahnya.',
        },
      ],
      done: '<strong>Tepat!</strong> Akar masalahnya ada pada <em>struktur tabel</em>. Solusinya: menata ulang tabel lewat <strong>normalisasi</strong>.',
    },
    rumusan: {
      label: 'Rumusan masalah tim',
      petunjuk: 'Tulis satu kalimat dengan pola "Bagaimana … agar …?" (minimal 30 karakter).',
      placeholder:
        'Contoh: Bagaimana menata ulang tabel penjualan koperasi agar setiap fakta cukup disimpan sekali dan tidak terjadi anomali?',
      min: 30,
    },
  },

  /* ==========================================================
     SINTAKS 2 — Mengorganisasi murid untuk belajar
     ========================================================== */
  organisasi: {
    kicker: 'Tahap 3 · Atur Tim',
    title: 'Bagi Peran dan Rencanakan Penyelidikan',
    goal: 'Membagi tugas tim dan menyusun urutan langkah normalisasi yang akan diselidiki.',
    guru: 'Pastikan setiap peran terisi dan berganti antarpertemuan. Setelah tim menyusun langkah, tanyakan mengapa kunci primer harus ditentukan sebelum menganalisis ketergantungan.',
    pengantar:
      'Penyelidikan berjalan lancar bila setiap anggota tahu tugasnya. Isi nama anggota untuk setiap peran, lalu susun rencana kerja tim.',
    peran: [
      {
        id: 'ketua',
        ikon: '🧭',
        label: 'Ketua & Pengatur Waktu',
        tugas: 'Menjaga alur diskusi dan memastikan setiap tahap selesai tepat waktu.',
      },
      {
        id: 'analis',
        ikon: '🔍',
        label: 'Analis Data',
        tugas: 'Membaca tabel, menandai sel bermasalah, dan mencari ketergantungan.',
      },
      {
        id: 'perancang',
        ikon: '📐',
        label: 'Perancang Tabel',
        tugas: 'Menggambar tabel hasil 2NF dan 3NF beserta kunci primer dan kunci tamu.',
      },
      {
        id: 'penyaji',
        ikon: '🎤',
        label: 'Penyaji',
        tugas: 'Menyiapkan bukti dan menyampaikan hasil kerja tim ke kelas.',
      },
    ],
    langkah: {
      pengantar:
        'Susun langkah normalisasi dari yang dikerjakan pertama sampai terakhir. Rencana ini menjadi peta tahap-tahap berikutnya.',
      items: [
        { id: 'l1', label: 'Amati contoh data dan daftar semua kolom tabel' },
        { id: 'l2', label: 'Pastikan setiap sel atomik dan tidak ada grup berulang (1NF)' },
        { id: 'l3', label: 'Tentukan kunci primer tabel' },
        { id: 'l4', label: 'Daftar ketergantungan fungsional antarkolom' },
        { id: 'l5', label: 'Pisahkan atribut yang bergantung parsial pada kunci (2NF)' },
        { id: 'l6', label: 'Pisahkan atribut yang bergantung transitif (3NF)' },
        { id: 'l7', label: 'Uji hasil: data tetap utuh dan anomali hilang' },
      ],
      urutan: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'],
    },
  },

  /* ==========================================================
     SINTAKS 3 — Membimbing penyelidikan
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Bekal Konsep',
    title: 'Bekal Penyelidikan: Istilah Normalisasi',
    goal: 'Memahami nilai atomik, kunci primer, ketergantungan fungsional, serta syarat 1NF, 2NF, dan 3NF.',
    guru: 'Minta Analis Data membacakan satu kartu, lalu anggota lain mencari contohnya di spreadsheet koperasi. Gunakan petunjuk bertingkat bila tim buntu; jangan langsung memberi jawaban.',
    pengantar:
      '<strong>Normalisasi</strong> adalah proses menata tabel secara bertahap agar setiap fakta disimpan <em>sekali</em> di tempat yang tepat. Buka setiap kartu, lalu jawab pertanyaan penuntun.',
    kartu: [
      {
        id: 'redundansi',
        ikon: '🔁',
        istilah: 'Redundansi & anomali',
        def: 'Redundansi adalah fakta yang sama tersimpan berulang. Akibatnya muncul anomali ubah, sisip, dan hapus.',
        contoh: 'Harga Buku Tulis tertulis di tiga nota.',
      },
      {
        id: 'atomik',
        ikon: '⚛️',
        istilah: 'Nilai atomik',
        def: 'Setiap sel hanya berisi satu nilai yang tidak dipecah lagi. Satu sel tidak boleh memuat daftar.',
        contoh: '"Pulpen, Buku Tulis" dalam satu sel tidak atomik; "Ayu Lestari" tetap atomik.',
      },
      {
        id: 'kunci',
        ikon: '🔑',
        istilah: 'Kunci primer (gabungan)',
        def: 'Kolom (atau gabungan kolom) yang nilainya unik untuk setiap baris.',
        contoh:
          'Setelah barang dipecah per baris, No Nota saja tidak unik; perlu (No Nota, Kode Barang).',
      },
      {
        id: 'fd',
        ikon: '➡️',
        istilah: 'Ketergantungan fungsional',
        def: 'A → B berarti setiap nilai A selalu menentukan tepat satu nilai B.',
        contoh: 'Kode Barang → Harga: B07 selalu berharga Rp6.000.',
      },
      {
        id: 'parsial',
        ikon: '🧩',
        istilah: 'Ketergantungan parsial',
        def: 'Atribut bukan kunci yang bergantung hanya pada sebagian kunci primer gabungan.',
        contoh: 'Kunci (No Nota, Kode Barang), tetapi Harga cukup ditentukan Kode Barang.',
      },
      {
        id: 'transitif',
        ikon: '⛓️',
        istilah: 'Ketergantungan transitif',
        def: 'Atribut bukan kunci yang bergantung pada atribut bukan kunci lain, bukan langsung pada kunci.',
        contoh: 'No Nota → NIS → Nama Siswa; Kelas → Wali Kelas.',
      },
      {
        id: 'nf1',
        ikon: '1️⃣',
        istilah: 'Bentuk Normal Pertama (1NF)',
        def: 'Semua sel atomik, tidak ada grup berulang, dan tabel punya kunci primer.',
        contoh: 'Setiap barang dalam nota ditulis sebagai baris tersendiri.',
      },
      {
        id: 'nf2',
        ikon: '2️⃣',
        istilah: 'Bentuk Normal Kedua (2NF)',
        def: 'Sudah 1NF dan tidak ada ketergantungan parsial.',
        contoh: 'Nama Barang dan Harga dipindah ke tabel Barang berkunci Kode Barang.',
      },
      {
        id: 'nf3',
        ikon: '3️⃣',
        istilah: 'Bentuk Normal Ketiga (3NF)',
        def: 'Sudah 2NF dan tidak ada ketergantungan transitif.',
        contoh: 'Data siswa dan wali kelas dipindah ke tabel Siswa dan Kelas.',
      },
    ],
    petunjuk: [
      'Kembali ke kartu: setiap pertanyaan memakai istilah yang dijelaskan di salah satu kartu.',
      'Untuk ketergantungan, tanyakan: "Kolom ini ditentukan oleh <em>seluruh</em> kunci, <em>sebagian</em> kunci, atau kolom bukan kunci?"',
      'Ingat urutannya: 1NF dulu (atomik + kunci), lalu buang parsial (2NF), lalu buang transitif (3NF).',
    ],
    pertanyaan: [
      {
        id: 'kq1',
        tanya:
          'Sel <em>Nama Barang</em> pada nota N001 berisi "Pulpen, Buku Tulis". Aturan mana yang dilanggar?',
        opsi: [
          { id: 'nf1', label: '1NF — nilai sel tidak atomik' },
          { id: 'nf2', label: '2NF — ada ketergantungan parsial' },
          { id: 'nf3', label: '3NF — ada ketergantungan transitif' },
          { id: 'tidak', label: 'Tidak ada, karena nama barangnya benar' },
        ],
        correct: 'nf1',
        umpan: {
          nf1: 'Tepat. Satu sel berisi daftar dua barang, jadi tidak atomik — syarat 1NF dilanggar.',
          nf2: 'Ketergantungan parsial baru bisa diperiksa setelah tabel 1NF. Lihat lagi isi selnya.',
          nf3: 'Ketergantungan transitif diperiksa paling akhir. Masalah sel ini lebih mendasar.',
          tidak:
            'Isinya memang benar, tetapi satu sel memuat dua nilai sekaligus. Lihat kartu "Nilai atomik".',
        },
      },
      {
        id: 'kq2',
        tanya: 'Ketergantungan fungsional <code>Kode Barang → Harga</code> berarti…',
        opsi: [
          { id: 'tentu', label: 'Setiap kode barang selalu menentukan tepat satu harga' },
          { id: 'balik', label: 'Setiap harga menentukan tepat satu kode barang' },
          { id: 'urut', label: 'Kolom Kode Barang harus ditulis sebelum kolom Harga' },
          { id: 'hitung', label: 'Harga dihitung dari kode barang' },
        ],
        correct: 'tentu',
        umpan: {
          tentu: 'Benar. Bila kode barangnya diketahui, harganya pasti satu nilai yang sama.',
          balik: 'Arahnya terbalik. Dua barang berbeda bisa saja berharga sama.',
          urut: 'Ketergantungan tidak membahas urutan kolom, melainkan nilai mana menentukan nilai lain.',
          hitung: 'Tidak ada perhitungan; harga hanya "ditentukan" oleh barangnya.',
        },
      },
      {
        id: 'kq3',
        tanya:
          'Tabel berkunci gabungan (No Nota, Kode Barang). Kolom <em>Harga</em> cukup ditentukan oleh Kode Barang saja. Ketergantungan ini disebut…',
        opsi: [
          { id: 'parsial', label: 'Parsial' },
          { id: 'penuh', label: 'Penuh' },
          { id: 'transitif', label: 'Transitif' },
          { id: 'atomik', label: 'Atomik' },
        ],
        correct: 'parsial',
        umpan: {
          parsial:
            'Tepat. Harga bergantung pada sebagian kunci gabungan — penyebab tabel belum 2NF.',
          penuh: 'Penuh berarti butuh seluruh kunci. Harga tidak butuh No Nota.',
          transitif: 'Transitif terjadi lewat kolom bukan kunci. Kode Barang adalah bagian kunci.',
          atomik: 'Atomik adalah sifat nilai sel, bukan jenis ketergantungan.',
        },
      },
      {
        id: 'kq4',
        tanya: 'Syarat sebuah tabel memenuhi <strong>3NF</strong> adalah…',
        opsi: [
          {
            id: 'benar',
            label:
              'Sudah 2NF dan tidak ada atribut bukan kunci yang bergantung pada atribut bukan kunci lain',
          },
          { id: 'tiga', label: 'Tabel paling banyak berisi tiga kolom' },
          { id: 'kunci', label: 'Setiap tabel wajib memakai kunci primer gabungan' },
          { id: 'satu', label: 'Semua data disimpan dalam satu tabel besar' },
        ],
        correct: 'benar',
        umpan: {
          benar: 'Benar. 3NF = 2NF + bebas ketergantungan transitif.',
          tiga: '"Ketiga" adalah tingkat bentuk normal, bukan jumlah kolom.',
          kunci: 'Kunci gabungan hanya dipakai bila satu kolom tidak cukup unik.',
          satu: 'Justru sebaliknya: normalisasi memecah tabel besar menjadi tabel-tabel yang tepat.',
        },
      },
    ],
  },

  nf1: {
    kicker: 'Tahap 5 · Selidiki 1NF',
    title: 'Cari Sel yang Tidak Atomik',
    goal: 'Menemukan sel bernilai majemuk, mengubah tabel ke 1NF, dan menentukan kunci primernya.',
    guru: 'Analis Data mengetuk sel, anggota lain memeriksa. Tekankan bahwa "Ayu Lestari" (dua kata) tetap satu nilai, dan bahwa nota N003 hanya berisi satu barang sehingga selnya atomik.',
    pengantar:
      'Ketuk setiap sel yang berisi <strong>lebih dari satu nilai</strong>. Ketuk lagi untuk membatalkan. Setelah yakin, tekan <em>Periksa</em>. Di layar kecil, geser tabel ke samping untuk melihat semua kolom.',
    tabelJudul: 'Spreadsheet asal (bentuk tidak normal)',
    tabel1Judul: 'Tabel Penjualan bentuk 1NF',
    pertanyaan: [
      {
        id: 'n1q1',
        tanya: 'Cara yang tepat mengubah spreadsheet ini menjadi <strong>1NF</strong> adalah…',
        opsi: [
          {
            id: 'pecah',
            label:
              'Tulis setiap barang dalam nota sebagai baris tersendiri, sehingga setiap sel berisi satu nilai',
          },
          {
            id: 'kolom',
            label: 'Tambah kolom Barang 1, Barang 2, Barang 3, dan seterusnya',
          },
          { id: 'hapus', label: 'Hapus kolom Nama Barang supaya tabel lebih ringkas' },
          { id: 'gabung', label: 'Gabungkan semua barang ke satu kolom "Daftar Belanja"' },
        ],
        correct: 'pecah',
        umpan: {
          pecah:
            'Tepat. Grup berulang dipecah menjadi baris; data lain pada nota itu disalin ke setiap barisnya.',
          kolom:
            'Itu tetap grup berulang, hanya mendatar. Nota dengan empat barang tidak akan muat, dan banyak sel kosong.',
          hapus: 'Data penting jadi hilang. Normalisasi tidak boleh membuang informasi.',
          gabung: 'Satu kolom berisi daftar justru tidak atomik — masalahnya tetap ada.',
        },
      },
      {
        id: 'n1q2',
        tanya: 'Pada tabel 1NF (satu baris per barang dalam nota), kunci primer yang tepat adalah…',
        opsi: [
          { id: 'gabung', label: '(No Nota, Kode Barang)' },
          { id: 'nota', label: 'No Nota' },
          { id: 'kode', label: 'Kode Barang' },
          { id: 'nisKode', label: '(NIS, Kode Barang)' },
        ],
        correct: 'gabung',
        umpan: {
          gabung:
            'Benar. Satu nota memuat banyak barang dan satu barang muncul di banyak nota; pasangan keduanya unik.',
          nota: 'Nota N001 kini punya dua baris (B01 dan B07), jadi No Nota saja tidak unik.',
          kode: 'B07 muncul di N001, N002, dan N004 — tidak unik.',
          nisKode:
            'Ayu (1021) membeli Pulpen (B01) di N001 dan N003, jadi pasangan ini bisa kembar.',
        },
      },
    ],
    simpulan:
      'Tabel kini <strong>1NF</strong>: semua sel atomik dan berkunci (No Nota, Kode Barang). Tetapi lihat — nama siswa, wali kelas, dan harga barang masih ditulis berulang. Penyelidikan berlanjut ke ketergantungan antarkolom.',
  },

  ketergantungan: {
    kicker: 'Tahap 6 · Ketergantungan',
    title: 'Siapa Menentukan Siapa?',
    goal: 'Memilah ketergantungan fungsional menjadi penuh, parsial, dan transitif terhadap kunci (No Nota, Kode Barang).',
    guru: 'Minta tim membuktikan setiap ketergantungan dengan data: "Apakah B07 selalu Rp6.000?" Bila tim ragu antara parsial dan transitif, tanyakan apakah ruas kirinya bagian dari kunci primer.',
    pengantar:
      'Kunci primer tabel 1NF adalah <strong>(No Nota, Kode Barang)</strong>. Pilah setiap ketergantungan berikut ke jenisnya.',
    kategori: [
      { id: 'penuh', label: 'Penuh — bergantung pada seluruh kunci' },
      { id: 'parsial', label: 'Parsial — hanya pada sebagian kunci' },
      { id: 'transitif', label: 'Transitif — lewat atribut bukan kunci' },
    ],
    items: [
      {
        id: 'fJml',
        teks: 'No Nota, Kode Barang → Jumlah',
        correct: 'penuh',
        explanation:
          'Jumlah butuh keduanya: berapa banyak barang <em>ini</em> dibeli di nota <em>ini</em>.',
      },
      {
        id: 'fTgl',
        teks: 'No Nota → Tanggal',
        correct: 'parsial',
        explanation: 'Tanggal cukup ditentukan No Nota — hanya sebagian kunci.',
      },
      {
        id: 'fNis',
        teks: 'No Nota → NIS',
        correct: 'parsial',
        explanation: 'Pembeli sebuah nota cukup ditentukan No Nota, tanpa Kode Barang.',
      },
      {
        id: 'fBarang',
        teks: 'Kode Barang → Nama Barang',
        correct: 'parsial',
        explanation: 'Nama barang cukup ditentukan Kode Barang — bagian kunci.',
      },
      {
        id: 'fHarga',
        teks: 'Kode Barang → Harga',
        correct: 'parsial',
        explanation: 'Harga cukup ditentukan Kode Barang, tidak peduli di nota mana.',
      },
      {
        id: 'fNama',
        teks: 'NIS → Nama Siswa',
        correct: 'transitif',
        explanation: 'NIS bukan bagian kunci. Rantainya: No Nota → NIS → Nama Siswa.',
      },
      {
        id: 'fKelas',
        teks: 'NIS → Kelas',
        correct: 'transitif',
        explanation: 'Kelas ditentukan NIS, yang sendirinya bukan kunci tabel ini.',
      },
      {
        id: 'fWali',
        teks: 'Kelas → Wali Kelas',
        correct: 'transitif',
        explanation: 'Wali kelas ditentukan Kelas — atribut bukan kunci.',
      },
    ],
    pertanyaan: [
      {
        id: 'kgq1',
        tanya: 'Berdasarkan hasil pemilahan, tabel penjualan 1NF ini berada pada bentuk normal…',
        opsi: [
          { id: 'nf1', label: '1NF saja, karena masih ada ketergantungan parsial' },
          { id: 'nf2', label: '2NF, karena semua sel sudah atomik' },
          { id: 'nf3', label: '3NF, karena sudah punya kunci primer' },
          { id: 'nf0', label: 'Belum 1NF, karena masih ada data berulang' },
        ],
        correct: 'nf1',
        umpan: {
          nf1: 'Tepat. Selama ada ketergantungan parsial, tabel belum 2NF.',
          nf2: 'Sel atomik hanyalah syarat 1NF. 2NF menuntut tidak ada ketergantungan parsial.',
          nf3: 'Kunci primer saja tidak cukup; masih ada parsial dan transitif.',
          nf0: 'Data berulang tidak membatalkan 1NF; sel sudah atomik dan tabel berkunci.',
        },
      },
    ],
  },

  /* ==========================================================
     SINTAKS 4 — Mengembangkan & menyajikan hasil karya
     ========================================================== */
  dekomposisi: {
    kicker: 'Tahap 7 · Pecah 2NF & 3NF',
    title: 'Rancang Ulang Tabel Koperasi',
    goal: 'Memindahkan atribut ke tabel yang tepat sehingga tabel memenuhi 2NF lalu 3NF.',
    guru: 'Perancang Tabel memimpin tahap ini. Minta tim menggambar tabel di kertas sambil mengerjakan media. Tekankan bahwa kolom kunci yang tertinggal di tabel lain (NIS di Nota, Kelas di Siswa) bukan redundansi, melainkan <em>kunci tamu</em> penghubung.',
    pengantar2NF:
      '<strong>Langkah 2NF:</strong> pindahkan setiap atribut bukan kunci ke tabel yang kuncinya menentukan atribut itu secara <em>penuh</em>.',
    pengantar3NF:
      '<strong>Langkah 3NF:</strong> tabel Nota (sementara) masih memuat ketergantungan transitif. Pecah lagi kolom-kolomnya.',
    kategori2NF: [
      { id: 'nota2', label: '🧾 Nota (sementara) — kunci No Nota' },
      { id: 'barang', label: '📦 Barang — kunci Kode Barang' },
      { id: 'detail', label: '🧮 Detail Nota — kunci (No Nota, Kode Barang)' },
    ],
    atribut2NF: [
      {
        id: 'tgl',
        teks: 'Tanggal',
        correct: 'nota2',
        explanation: 'Tanggal bergantung pada No Nota saja.',
      },
      {
        id: 'nis',
        teks: 'NIS',
        correct: 'nota2',
        explanation: 'Setiap nota dibeli oleh satu siswa: No Nota → NIS.',
      },
      {
        id: 'nama',
        teks: 'Nama Siswa',
        correct: 'nota2',
        explanation:
          'Untuk sementara ikut NIS ke tabel Nota (tidak bergantung pada Kode Barang). Ia akan dipindah lagi di langkah 3NF.',
      },
      {
        id: 'kelas',
        teks: 'Kelas',
        correct: 'nota2',
        explanation: 'Ikut NIS ke tabel Nota untuk sementara; diperiksa lagi di langkah 3NF.',
      },
      {
        id: 'wali',
        teks: 'Wali Kelas',
        correct: 'nota2',
        explanation: 'Ikut ke tabel Nota untuk sementara; transitifnya dibereskan di langkah 3NF.',
      },
      {
        id: 'barang',
        teks: 'Nama Barang',
        correct: 'barang',
        explanation: 'Kode Barang → Nama Barang, jadi ia pindah ke tabel Barang.',
      },
      {
        id: 'harga',
        teks: 'Harga',
        correct: 'barang',
        explanation: 'Kode Barang → Harga. Kini harga cukup diubah di satu baris tabel Barang.',
      },
      {
        id: 'jml',
        teks: 'Jumlah',
        correct: 'detail',
        explanation:
          'Jumlah bergantung penuh pada (No Nota, Kode Barang), jadi tetap di Detail Nota.',
      },
    ],
    pertanyaan2NF: [
      {
        id: 'dq1',
        tanya: 'Tabel <strong>Nota (sementara)</strong> sudah 2NF. Apakah sudah 3NF?',
        opsi: [
          { id: 'belum', label: 'Belum — NIS → Nama Siswa dan Kelas → Wali Kelas masih transitif' },
          { id: 'sudah', label: 'Sudah — semua kolom bergantung pada No Nota' },
          { id: 'atomik', label: 'Belum — masih ada sel yang tidak atomik' },
          { id: 'gabung', label: 'Belum — kunci primernya masih gabungan' },
        ],
        correct: 'belum',
        umpan: {
          belum:
            'Tepat. Nama Siswa ditentukan NIS, bukan langsung oleh No Nota. Ayu masih tertulis di dua nota.',
          sudah:
            'Bergantung pada No Nota, tetapi <em>lewat</em> NIS. Itu ketergantungan transitif.',
          atomik: 'Semua sel sudah atomik sejak 1NF.',
          gabung: 'Kunci tabel Nota hanya No Nota, bukan gabungan.',
        },
      },
    ],
    kategori3NF: [
      { id: 'nota', label: '🧾 Nota — kunci No Nota' },
      { id: 'siswa', label: '🧑‍🎓 Siswa — kunci NIS' },
      { id: 'kelas', label: '🏫 Kelas — kunci Kelas' },
    ],
    atribut3NF: [
      {
        id: 'tgl',
        teks: 'Tanggal',
        correct: 'nota',
        explanation: 'Tanggal bergantung langsung pada No Nota, jadi tetap di Nota.',
      },
      {
        id: 'nis',
        teks: 'NIS',
        correct: 'nota',
        explanation:
          'NIS tetap di Nota sebagai <strong>kunci tamu</strong> agar setiap nota tahu pembelinya. Di tabel Siswa, NIS menjadi kunci primer.',
      },
      {
        id: 'nama',
        teks: 'Nama Siswa',
        correct: 'siswa',
        explanation:
          'NIS → Nama Siswa, jadi pindah ke tabel Siswa. Nama Ayu kini cukup ditulis sekali.',
      },
      {
        id: 'kelas',
        teks: 'Kelas',
        correct: 'siswa',
        explanation:
          'NIS → Kelas. Di tabel Siswa, Kelas sekaligus menjadi kunci tamu ke tabel Kelas.',
      },
      {
        id: 'wali',
        teks: 'Wali Kelas',
        correct: 'kelas',
        explanation:
          'Kelas → Wali Kelas, jadi pindah ke tabel Kelas. Ganti wali cukup di satu baris.',
      },
    ],
    pertanyaan3NF: [
      {
        id: 'dq2',
        tanya: 'Kunci primer tabel <strong>Detail Nota</strong> adalah…',
        opsi: [
          { id: 'gabung', label: '(No Nota, Kode Barang)' },
          { id: 'nota', label: 'No Nota' },
          { id: 'kode', label: 'Kode Barang' },
          { id: 'jml', label: '(No Nota, Jumlah)' },
        ],
        correct: 'gabung',
        umpan: {
          gabung:
            'Benar. Pasangan nota dan barang unik, sekaligus keduanya kunci tamu ke Nota dan Barang.',
          nota: 'Satu nota punya banyak baris detail, jadi tidak unik.',
          kode: 'Satu barang muncul di banyak nota, jadi tidak unik.',
          jml: 'Jumlah bukan pengenal; dua barang di nota yang sama bisa berjumlah sama.',
        },
      },
      {
        id: 'dq3',
        tanya: 'Kolom <em>Kelas</em> di tabel Siswa berperan sebagai…',
        opsi: [
          { id: 'fk', label: 'Kunci tamu yang merujuk ke tabel Kelas' },
          { id: 'pk', label: 'Kunci primer tabel Siswa' },
          { id: 'redundan', label: 'Data berulang yang seharusnya dihapus' },
          { id: 'atomik', label: 'Nilai tidak atomik' },
        ],
        correct: 'fk',
        umpan: {
          fk: 'Tepat. Kelas menghubungkan siswa ke data wali kelasnya di tabel Kelas.',
          pk: 'Kunci primer Siswa adalah NIS; banyak siswa bisa sekelas.',
          redundan:
            'Bila dihapus, kita tidak tahu kelas setiap siswa. Kunci tamu memang diulang sebagai penghubung.',
          atomik: '"XI RPL 1" adalah satu nilai.',
        },
      },
    ],
    simpulan:
      'Rancangan timmu kini <strong>3NF</strong>: lima tabel, setiap fakta disimpan sekali, dan tabel-tabelnya tersambung lewat kunci tamu.',
  },

  sajikan: {
    kicker: 'Tahap 8 · Sajikan Hasil',
    title: 'Buktikan: Redundansi Turun, Anomali Hilang',
    goal: 'Menyajikan rancangan 3NF beserta bukti bahwa redundansi berkurang dan anomali teratasi.',
    guru: 'Beri setiap tim 2 menit presentasi oleh Penyaji. Tim lain menanggapi memakai klaim yang sudah diperiksa. Arahkan diskusi pada mengapa kunci tamu tetap "berulang" tetapi bukan redundansi.',
    pengantar:
      'Penyaji timmu menyiapkan bukti untuk Bu Wati. Bandingkan tabel sebelum dan sesudah normalisasi, lalu pilih klaim presentasi yang bisa dipertanggungjawabkan.',
    klaim: {
      tanya: 'Klaim mana saja yang <strong>benar</strong> untuk dipresentasikan kepada Bu Wati?',
      opsi: [
        {
          id: 'harga',
          label: 'Bila harga Buku Tulis naik, cukup diubah di satu baris tabel Barang.',
          benar: true,
          alasan: 'Harga kini disimpan sekali; anomali ubah teratasi.',
        },
        {
          id: 'siswa',
          label: 'Siswa baru bisa dicatat di tabel Siswa walaupun belum pernah berbelanja.',
          benar: true,
          alasan: 'Data siswa tidak lagi menumpang di nota; anomali sisip teratasi.',
        },
        {
          id: 'hapus',
          label:
            'Menghapus nota N002 tidak lagi menghilangkan data Dimas, wali kelas XI RPL 2, dan Map Plastik.',
          benar: true,
          alasan: 'Siswa, kelas, dan barang disimpan di tabelnya sendiri; anomali hapus teratasi.',
        },
        {
          id: 'nol',
          label: 'Setelah normalisasi tidak ada satu pun nilai yang muncul dua kali.',
          benar: false,
          alasan:
            'Kunci tamu (mis. NIS di Nota, Kode Barang di Detail Nota) memang muncul berulang sebagai penghubung — itu disengaja, bukan redundansi.',
        },
        {
          id: 'tiga',
          label: '3NF berarti setiap tabel paling banyak memiliki tiga kolom.',
          benar: false,
          alasan: '"Ketiga" menunjukkan tingkat bentuk normal, bukan jumlah kolom.',
        },
        {
          id: 'satu',
          label: 'Sebaiknya semua tabel digabung lagi agar lebih praktis.',
          benar: false,
          alasan:
            'Menggabungkan kembali memunculkan lagi redundansi dan anomali yang baru saja diatasi.',
        },
      ],
      done: '<strong>Bukti siap dipresentasikan!</strong> Normalisasi mengatasi anomali dengan menyimpan setiap fakta sekali.',
    },
    catatanLabel: 'Kalimat pembuka presentasi tim (opsional)',
    catatanPlaceholder:
      'Contoh: Kami memecah spreadsheet koperasi menjadi lima tabel 3NF sehingga harga barang cukup diubah sekali…',
  },

  /* ==========================================================
     SINTAKS 5 — Menganalisis & mengevaluasi pemecahan masalah
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 9 · Evaluasi',
    title: 'Uji di Kasus Baru: Servis Laptop TEFA',
    goal: 'Menerapkan analisis normalisasi pada kasus baru dan mengevaluasi rancangan tim lain.',
    guru: 'Kuis dikerjakan individu dan hanya sekali. Setelah itu, uji silang dikerjakan berpasangan: satu murid menunjuk kesalahan, pasangannya menjelaskan aturan bentuk normal yang dilanggar.',
    tabel: SERVIS,
    tabelJudul: 'Nota Servis Laptop Teaching Factory (bentuk tidak normal)',
    pengantarKuis:
      'Teaching Factory (TEFA) jurusan RPL menerima servis laptop. Catatannya masih satu tabel seperti di bawah. Jawab 5 soal berikut <strong>sendiri</strong>; setiap soal hanya bisa dijawab <strong>sekali</strong>.',
    kunci3NF: SERVIS_3NF,
    soal: [
      {
        id: 'ev1',
        tanya: 'Sel mana yang membuat tabel servis <strong>belum 1NF</strong>?',
        opsi: [
          { id: 'layanan', label: 'Nama Layanan S01: "Instal Ulang OS, Ganti Keyboard"' },
          { id: 'raka', label: 'Nama Pelanggan "Raka" yang muncul di dua baris' },
          { id: 'hp', label: 'No HP "0812-1111"' },
          { id: 'tgl', label: 'Tgl Masuk S02 "10-09-2026"' },
        ],
        correct: 'layanan',
        umpan: {
          layanan: 'Sel itu memuat dua layanan sekaligus — tidak atomik.',
          raka: 'Itu redundansi (masalah 2NF/3NF nanti), bukan pelanggaran atomik.',
          hp: 'Nomor HP adalah satu nilai, walau berisi tanda hubung.',
          tgl: 'Tanggal adalah satu nilai yang atomik.',
        },
      },
      {
        id: 'ev2',
        tanya:
          'Setelah setiap layanan ditulis sebagai baris tersendiri (1NF), kunci primernya adalah…',
        opsi: [
          { id: 'gabung', label: '(No Servis, Kode Layanan)' },
          { id: 'srv', label: 'No Servis' },
          { id: 'lay', label: 'Kode Layanan' },
          { id: 'plg', label: '(No Servis, Kode Pelanggan)' },
        ],
        correct: 'gabung',
        umpan: {
          gabung:
            'Benar. Satu servis bisa beberapa layanan, dan satu layanan muncul di banyak servis.',
          srv: 'S01 punya dua baris layanan, jadi tidak unik.',
          lay: 'L1 dan L2 muncul di beberapa servis.',
          plg: 'Satu servis hanya satu pelanggan, sehingga pasangan ini kembar untuk S01 yang punya dua layanan.',
        },
      },
      {
        id: 'ev3',
        tanya:
          'Pada kunci (No Servis, Kode Layanan), ketergantungan <code>Kode Layanan → Biaya</code> termasuk…',
        opsi: [
          { id: 'parsial', label: 'Parsial' },
          { id: 'penuh', label: 'Penuh' },
          { id: 'transitif', label: 'Transitif' },
          { id: 'bukan', label: 'Bukan ketergantungan fungsional' },
        ],
        correct: 'parsial',
        umpan: {
          parsial: 'Tepat. Biaya cukup ditentukan sebagian kunci (Kode Layanan).',
          penuh: 'Biaya tidak membutuhkan No Servis.',
          transitif: 'Kode Layanan adalah bagian kunci, jadi bukan transitif.',
          bukan: 'L1 selalu Rp75.000 — itu ketergantungan fungsional.',
        },
      },
      {
        id: 'ev4',
        tanya: 'Ketergantungan <code>Kode Teknisi → Nama Teknisi</code> pada tabel itu termasuk…',
        opsi: [
          { id: 'transitif', label: 'Transitif' },
          { id: 'parsial', label: 'Parsial' },
          { id: 'penuh', label: 'Penuh' },
          { id: 'atomik', label: 'Pelanggaran atomik' },
        ],
        correct: 'transitif',
        umpan: {
          transitif: 'Benar. No Servis → Kode Teknisi → Nama Teknisi; Kode Teknisi bukan kunci.',
          parsial:
            'Parsial membutuhkan ruas kiri yang merupakan bagian kunci. Kode Teknisi bukan bagian kunci.',
          penuh: 'Penuh berarti ditentukan oleh seluruh kunci primer.',
          atomik: 'Nilai "Pak Joko" atomik; ini soal ketergantungan.',
        },
      },
      {
        id: 'ev5',
        tanya: 'Rancangan <strong>3NF</strong> yang tepat untuk kasus servis adalah…',
        opsi: [
          {
            id: 'tepat',
            label:
              'Servis(No Servis, Tgl Masuk, Kode Pelanggan, Kode Teknisi) · Pelanggan(Kode Pelanggan, Nama Pelanggan, No HP) · Teknisi(Kode Teknisi, Nama Teknisi) · Layanan(Kode Layanan, Nama Layanan, Biaya) · Detail Servis(No Servis, Kode Layanan)',
          },
          {
            id: 'namaPlg',
            label:
              'Servis(No Servis, Tgl Masuk, Kode Pelanggan, Nama Pelanggan, No HP, Kode Teknisi) · Teknisi(Kode Teknisi, Nama Teknisi) · Layanan(Kode Layanan, Nama Layanan, Biaya) · Detail Servis(No Servis, Kode Layanan)',
          },
          {
            id: 'biaya',
            label:
              'Servis(No Servis, Tgl Masuk, Kode Pelanggan, Kode Teknisi) · Pelanggan(Kode Pelanggan, Nama Pelanggan, No HP) · Teknisi(Kode Teknisi, Nama Teknisi) · Layanan(Kode Layanan, Nama Layanan) · Detail Servis(No Servis, Kode Layanan, Biaya)',
          },
          {
            id: 'dua',
            label:
              'Servis(No Servis, Tgl Masuk, Kode Pelanggan, Nama Pelanggan, No HP, Kode Teknisi, Nama Teknisi) · Detail Servis(No Servis, Kode Layanan, Nama Layanan, Biaya)',
          },
        ],
        correct: 'tepat',
        umpan: {
          tepat:
            'Tepat. Tidak ada parsial maupun transitif, dan semua tabel tersambung lewat kunci tamu.',
          namaPlg:
            'Nama Pelanggan dan No HP bergantung transitif lewat Kode Pelanggan — belum 3NF.',
          biaya: 'Biaya di Detail Servis hanya bergantung pada Kode Layanan — parsial, belum 2NF.',
          dua: 'Masih ada transitif di Servis dan parsial di Detail Servis.',
        },
      },
    ],
    ujiSilang: {
      pengantar:
        'Tim Merah menyerahkan rancangan berikut untuk kasus servis. Periksa dengan teliti seperti seorang <em>reviewer</em>.',
      judul: 'Rancangan Tim Merah',
      hasil: SERVIS_TIM_MERAH,
      tanya: 'Kritik mana saja yang <strong>tepat</strong> untuk rancangan Tim Merah?',
      opsi: [
        {
          id: 'transitif',
          label: 'Nama Pelanggan di tabel Servis bergantung transitif lewat Kode Pelanggan.',
          benar: true,
          alasan:
            'No Servis → Kode Pelanggan → Nama Pelanggan. Seharusnya dipindah ke tabel Pelanggan.',
        },
        {
          id: 'hilang',
          label: 'Kolom No HP hilang dari rancangan.',
          benar: true,
          alasan: 'Normalisasi tidak boleh membuang data. No HP seharusnya ada di tabel Pelanggan.',
        },
        {
          id: 'parsial',
          label: 'Biaya di Detail Servis hanya bergantung pada Kode Layanan (parsial).',
          benar: true,
          alasan: 'Biaya seharusnya disimpan di tabel Layanan agar cukup diubah sekali.',
        },
        {
          id: 'gabungan',
          label: 'Detail Servis tidak boleh memakai kunci primer gabungan.',
          benar: false,
          alasan: 'Kunci gabungan (No Servis, Kode Layanan) justru tepat untuk tabel detail.',
        },
        {
          id: 'teknisi',
          label: 'Tabel Teknisi sebaiknya digabung lagi ke tabel Servis.',
          benar: false,
          alasan:
            'Memisahkan Teknisi menghapus ketergantungan transitif Kode Teknisi → Nama Teknisi. Itu sudah benar.',
        },
        {
          id: 'fk',
          label: 'Kode Teknisi di tabel Servis adalah redundansi dan harus dihapus.',
          benar: false,
          alasan: 'Kode Teknisi adalah kunci tamu yang menunjukkan teknisi setiap servis.',
        },
      ],
      done: '<strong>Ulasan tajam!</strong> Kamu bisa menunjuk pelanggaran bentuk normal sekaligus alasannya.',
    },
  },

  refleksi: {
    kicker: 'Tahap 10 · Refleksi',
    title: 'Refleksi Proses Pemecahan Masalah',
    goal: 'Menilai pemahaman diri dan proses tim dalam memecahkan masalah redundansi data.',
    guru: 'Beri 5 menit refleksi mandiri. Baca sekilas jawaban terbuka untuk menemukan konsep yang masih membingungkan (biasanya parsial vs transitif) sebagai bahan pertemuan berikutnya.',
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
        teks: 'Aku bisa menjelaskan redundansi data dan memberi contoh anomali sisip, ubah, dan hapus.',
      },
      { id: 'p2', teks: 'Aku bisa mengubah tabel ke 1NF dan menentukan kunci primernya.' },
      { id: 'p3', teks: 'Aku bisa membedakan ketergantungan penuh, parsial, dan transitif.' },
      { id: 'p4', teks: 'Aku bisa memecah tabel menjadi 2NF dan 3NF tanpa kehilangan data.' },
      {
        id: 'p5',
        teks: 'Aku bisa menemukan dan menjelaskan pelanggaran bentuk normal pada rancangan tim lain.',
      },
      { id: 'p6', teks: 'Aku menjalankan peranku dan membantu tim memecahkan masalah koperasi.' },
    ],
    tanyaTerbuka:
      'Langkah mana yang paling sulit dalam memecahkan masalah koperasi, dan bagaimana timmu mengatasinya?',
  },

  selesai: {
    kicker: 'Tahap 11 · Selesai',
    title: 'Masalah Koperasi Terpecahkan!',
    goal: 'Melihat rekap skor dan rancangan 3NF hasil kerja tim.',
    pesan:
      'Spreadsheet koperasi kini menjadi lima tabel 3NF. Bu Wati cukup mengubah harga sekali, bisa mencatat siswa baru kapan saja, dan tidak kehilangan data saat nota dibatalkan.',
    rangkuman: [
      '<strong>Redundansi</strong> = fakta yang sama disimpan berulang; akibatnya anomali ubah, sisip, dan hapus.',
      '<strong>1NF</strong>: setiap sel atomik, tidak ada grup berulang, dan tabel punya kunci primer.',
      '<strong>2NF</strong>: sudah 1NF dan tidak ada atribut bukan kunci yang bergantung parsial pada kunci gabungan.',
      '<strong>3NF</strong>: sudah 2NF dan tidak ada ketergantungan transitif lewat atribut bukan kunci.',
      'Kunci tamu yang muncul berulang adalah <strong>penghubung</strong>, bukan redundansi.',
    ],
  },
};

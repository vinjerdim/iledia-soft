'use strict';

/* ============================================================
   data.js — seluruh konten materi 1.4
   ============================================================
   Studi kasus: Sistem Informasi Praktik Kerja Lapangan (PKL),
   SMK Cendekia Bangsa — lanjutan langsung dari materi 1.3.
   Entitas dan atribut sudah teridentifikasi; kini murid berperan
   sebagai tim analis yang menentukan relasi antar entitas
   beserta jenisnya (One-to-One, One-to-Many, Many-to-Many)
   sebelum tabel-tabel itu dirancang.
   ============================================================ */

var DATA = {};

/* ============================================================
   Entitas — rangkuman hasil materi 1.3, dipakai sebagai recap
   pada tahap 1 (orientasi) dan tahap 10 (selesai). Bukan bahan
   kuis, jadi tidak diacak.
   ============================================================ */
DATA.entitas = {
  list: [
    { id: 'siswa', name: 'Siswa PKL', desc: 'Siswa yang diberangkatkan PKL', colorKey: 'blue', key: 'ea-siswa-nis' },
    { id: 'dudi', name: 'DU/DI', desc: 'Perusahaan/instansi mitra PKL', colorKey: 'green', key: 'ea-dudi-kode' },
    { id: 'pembimbing', name: 'Pembimbing', desc: 'Pembimbing sekolah & industri', colorKey: 'orange', key: 'ea-pemb-kode' },
    { id: 'jurnal', name: 'Jurnal Kegiatan', desc: 'Catatan kegiatan harian siswa', colorKey: 'purple', key: 'ea-jurnal-kode' }
  ],
  attrs: [
    { id: 'ea-siswa-nis', label: 'NIS', entityId: 'siswa' },
    { id: 'ea-siswa-nama', label: 'Nama Siswa', entityId: 'siswa' },
    { id: 'ea-siswa-kelas', label: 'Kelas', entityId: 'siswa' },
    { id: 'ea-siswa-hp', label: 'No. HP Orang Tua', entityId: 'siswa' },
    { id: 'ea-dudi-kode', label: 'Kode DU/DI', entityId: 'dudi' },
    { id: 'ea-dudi-nama', label: 'Nama Perusahaan', entityId: 'dudi' },
    { id: 'ea-dudi-alamat', label: 'Alamat', entityId: 'dudi' },
    { id: 'ea-dudi-bidang', label: 'Bidang Usaha', entityId: 'dudi' },
    { id: 'ea-pemb-kode', label: 'Kode Pembimbing', entityId: 'pembimbing' },
    { id: 'ea-pemb-nama', label: 'Nama Pembimbing', entityId: 'pembimbing' },
    { id: 'ea-pemb-asal', label: 'Asal (Sekolah/Industri)', entityId: 'pembimbing' },
    { id: 'ea-pemb-hp', label: 'No. HP', entityId: 'pembimbing' },
    { id: 'ea-jurnal-kode', label: 'Kode Jurnal', entityId: 'jurnal' },
    { id: 'ea-jurnal-tanggal', label: 'Tanggal', entityId: 'jurnal' },
    { id: 'ea-jurnal-uraian', label: 'Uraian Kegiatan', entityId: 'jurnal' },
    { id: 'ea-jurnal-paraf', label: 'Status Paraf', entityId: 'jurnal' }
  ]
};

/* ============================================================
   TAHAP 1 — Orientasi
   ============================================================ */
DATA.orientasi = {
  kicker: 'Prolog',
  title: 'Selamat Datang Kembali, Tim Analis',
  goal: 'Memahami alur belajar dan peranmu dalam menentukan relasi antar entitas beserta jenisnya.',
  salam:
    'Entitas dan atribut Sistem Informasi PKL sudah kamu identifikasi. Kini Kepala Program RPL ' +
    'menugaskanmu pada langkah berikutnya: menentukan bagaimana keempat entitas itu — Siswa PKL, ' +
    'DU/DI, Pembimbing, dan Jurnal Kegiatan — saling berelasi, sebelum tabel-tabelnya benar-benar ' +
    'dirancang.',
  tujuanLabel: 'Tujuan Pembelajaran',
  tujuan: [
    'Menentukan relasi (hubungan) antar dua entitas berdasarkan temuan hasil analisis kebutuhan.',
    'Menentukan jenis relasi (kardinalitas): One-to-One, One-to-Many, atau Many-to-Many.',
    'Menentukan sisi mana yang menyimpan foreign key pada relasi One-to-One dan One-to-Many.',
    'Merancang tabel penghubung (junction table) untuk relasi Many-to-Many.'
  ],
  alurLabel: 'Alur Belajar (Problem Based Learning)',
  alur: [
    { title: 'Pahami Masalah', desc: 'Menelaah akibat tidak menentukan jenis relasi sebelum tabel PKL dirancang.' },
    { title: 'Bekal Konsep', desc: 'Mengenal relasi, kardinalitas, dan aturan peletakan foreign key lewat kartu konsep dan latihan menjodohkan.' },
    { title: 'Telusuri Petunjuk Lapangan', desc: 'Menandai kalimat yang mengungkap jenis relasi antar entitas PKL.' },
    { title: 'Saring Jenis Relasinya', desc: 'Mengelompokkan tiap pasangan entitas ke jenis relasinya.' },
    { title: 'Klasifikasikan FK & Tabel Penghubung', desc: 'Menentukan sisi foreign key, lalu merancang tabel penghubung untuk relasi Many-to-Many.' },
    { title: 'Sajikan dan Uji', desc: 'Menyusun ringkasan relasi final, lalu menguji identifikasi pada kasus baru.' },
    { title: 'Evaluasi', desc: 'Menjawab soal pada kasus lain untuk membuktikan pemahaman berlaku umum.' }
  ],
  recapLabel: 'Entitas yang Sudah Kamu Identifikasi (Materi 1.3)',
  recapNote: 'Empat entitas ini sudah punya atribut dan atribut kuncinya masing-masing — sekarang saatnya menentukan bagaimana mereka saling berelasi.',
  caraPakaiLabel: 'Cara Memakai Media Ini',
  caraPakai: [
    'Progresmu tersimpan otomatis di perangkat ini — boleh ditutup dan dilanjutkan nanti.',
    'Setiap tahap baru terbuka setelah tahap sebelumnya selesai.',
    'Pilihan jawaban selalu diacak setiap kali materi dimulai — kerjakan dengan cermat, bukan menghafal urutan.'
  ],
  mulaiLabel: 'Mulai: telusuri relasi antar entitas →'
};

/* ============================================================
   TAHAP 2 — Orientasi pada masalah (PBL fase 1)
   ============================================================ */
DATA.masalah = {
  kicker: 'Fase 1 · Orientasi pada Masalah',
  title: 'Tabel PKL yang Tidak Saling Terhubung',
  goal: 'Membedakan akar masalah (gagal menentukan jenis relasi antar entitas) dari gejala-gejala yang tampak.',
  briefLabel: 'Latar Belakang',
  brief:
    '<p>Setelah entitas dan atribut Sistem Informasi PKL berhasil diidentifikasi, tim langsung ' +
    'bersemangat merancang tabel Siswa, DU/DI, Pembimbing, dan Jurnal Kegiatan — tanpa lebih dulu ' +
    'menyepakati bagaimana tabel-tabel itu seharusnya saling terhubung.</p>' +
    '<p>Beberapa hari berjalan, staf Hubungan Industri (Hubin) mulai kebingungan menggunakannya.</p>',
  kutipan:
    'Saya tidak bisa tahu siswa mana yang ditempatkan di DU/DI mana — datanya terpisah tanpa ' +
    'penghubung yang jelas antar tabel.',
  kejadianLabel: 'Yang Terjadi',
  kejadian: [
    {
      tim: 'Tim Analis (pekan lalu)',
      hasil: 'Langsung membuat tabel Siswa PKL, DU/DI, Pembimbing, dan Jurnal Kegiatan tanpa menyepakati jenis relasi maupun letak foreign key antar tabel.'
    },
    {
      tim: 'Hasil di Lapangan',
      hasil: 'Staf Hubin tidak bisa melacak siswa mana ditempatkan di DU/DI mana, dan data pembimbing sekolah-industri tercampur karena satu siswa ternyata bisa dibimbing keduanya sekaligus.'
    }
  ],
  insiden:
    'Kepala Program RPL meminta timmu berhenti dulu dan menentukan relasi antar entitas beserta ' +
    'jenisnya sebelum melanjutkan rancangan tabel.',
  instruction:
    'Dari laporan evaluasi berikut, pilih pernyataan yang merupakan <strong>akar masalah</strong> ' +
    '(penyebab), bukan sekadar gejala yang tampak di permukaan.',
  statements: [
    { id: 'm1', text: 'Tim tidak menentukan jenis relasi (kardinalitas) antar entitas sebelum merancang tabel dan kolom foreign key-nya.', valid: true,
      feedback: 'Benar — ini akar masalahnya: tanpa jenis relasi yang jelas, tabel dirancang tanpa tahu bagaimana seharusnya saling terhubung.' },
    { id: 'm2', text: 'Staf Hubin harus mengecek manual siswa mana yang ditempatkan di DU/DI mana.', valid: false,
      feedback: 'Ini gejala (akibat) — muncul karena relasi Siswa-DU/DI tidak dirancang dengan foreign key yang tepat, bukan penyebabnya.' },
    { id: 'm3', text: 'Tim tidak menyadari bahwa satu siswa bisa dibimbing oleh pembimbing sekolah dan pembimbing industri sekaligus, sehingga tidak mengenali relasi itu sebagai Many-to-Many.', valid: true,
      feedback: 'Benar — salah mengenali jenis relasi (dikira One-to-Many, padahal Many-to-Many) membuat rancangan tabel keliru sejak awal.' },
    { id: 'm4', text: 'Nama pembimbing sekolah dan pembimbing industri tertukar dalam satu kolom yang sama.', valid: false,
      feedback: 'Ini gejala — akibat dari relasi Siswa-Pembimbing yang belum dikenali sebagai Many-to-Many, bukan penyebab utamanya.' },
    { id: 'm5', text: 'Tim tidak menyepakati di sisi mana foreign key seharusnya diletakkan untuk tiap relasi.', valid: true,
      feedback: 'Benar — tanpa kesepakatan sisi foreign key, tabel-tabel yang saling terhubung tidak bisa dirujuk dengan tepat.' },
    { id: 'm6', text: 'Aplikasi terasa lambat saat dibuka bersamaan oleh banyak siswa.', valid: false,
      feedback: 'Ini gejala teknis performa, bukan soal jenis relasi antar entitas.' },
    { id: 'm7', text: 'Tidak ada kesepakatan tabel penghubung (junction table) untuk relasi yang sebenarnya Many-to-Many.', valid: true,
      feedback: 'Benar — relasi Many-to-Many butuh tabel penghubung tersendiri; tanpanya, data relasi tidak punya tempat disimpan.' }
  ],
  cekLabel: 'Periksa Pilihanku',
  ownLabel: 'Rumusan Masalahmu',
  ownPrompt: "Tulis satu kalimat rumusan masalah untuk proyek ini (format: 'Bagaimana ... agar ...').",
  ownPlaceholder: 'Contoh: Bagaimana tim analis dapat menentukan relasi antar entitas beserta jenisnya agar rancangan tabel Sistem Informasi PKL saling terhubung dengan tepat?',
  ownMin: 30,
  lanjutLabel: 'Lanjut: Bekal Konsep →'
};

/* ============================================================
   TAHAP 3 — Mengorganisasikan belajar (PBL fase 2)
   ============================================================ */
DATA.bekal = {
  kicker: 'Fase 2 · Mengorganisasikan Belajar',
  title: 'Bekal: Relasi, Kardinalitas, dan Foreign Key',
  goal: 'Mengenal konsep relasi, kardinalitas (1:1, 1:N, N:N), dan aturan peletakan foreign key/tabel penghubung.',
  instruction: 'Ketuk tiap kartu untuk membuka penjelasannya.',
  cards: [
    { id: 'relasi', icon: '🔗', term: 'Relasi (Relationship)',
      def: 'Hubungan logis antara dua entitas yang menunjukkan bagaimana data pada entitas itu saling berkaitan.',
      example: 'Contoh: entitas Siswa PKL berelasi dengan entitas DU/DI karena tiap siswa ditempatkan di sebuah DU/DI.' },
    { id: 'kardinalitas', icon: '🔢', term: 'Kardinalitas',
      def: 'Jumlah maksimum keterhubungan record dari satu entitas ke entitas lainnya dalam sebuah relasi.',
      example: 'Contoh: kardinalitas menjawab pertanyaan "satu DU/DI bisa menerima berapa siswa?" dan sebaliknya.' },
    { id: 'satusatu', icon: '1️⃣', term: 'One-to-One (1:1)',
      def: 'Satu record entitas A berpasangan dengan tepat satu record entitas B, dan sebaliknya.',
      example: 'Contoh: satu Siswa PKL hanya punya tepat satu Akun Login PKL, dan satu akun hanya dipakai satu siswa.' },
    { id: 'satubanyak', icon: '🔀', term: 'One-to-Many (1:N)',
      def: 'Satu record entitas A dapat berpasangan dengan banyak record entitas B, tapi satu record B hanya berpasangan dengan satu record A.',
      example: 'Contoh: satu DU/DI bisa menerima banyak Siswa PKL, tapi satu siswa hanya ditempatkan di satu DU/DI pada satu periode.' },
    { id: 'banyakbanyak', icon: '🕸️', term: 'Many-to-Many (N:N)',
      def: 'Banyak record entitas A dapat berpasangan dengan banyak record entitas B, dan sebaliknya.',
      example: 'Contoh: satu siswa bisa dibimbing banyak pembimbing (sekolah & industri), dan satu pembimbing membimbing banyak siswa.' },
    { id: 'fk', icon: '🗝️', term: 'Foreign Key & Tabel Penghubung',
      def: 'Cara mewujudkan kardinalitas pada tabel: relasi 1:1/1:N diwujudkan dengan foreign key di sisi yang bergantung, sedangkan relasi N:N butuh tabel penghubung berisi foreign key ke kedua entitas.',
      example: 'Contoh: FK kode_dudi diletakkan di tabel Siswa PKL (sisi "banyak"); relasi Siswa-Pembimbing butuh tabel penghubung "Bimbingan".' }
  ],
  terms: [
    { id: 't1', label: 'Relasi (Relationship)' },
    { id: 't2', label: 'Kardinalitas' },
    { id: 't3', label: 'One-to-One (1:1)' },
    { id: 't4', label: 'One-to-Many (1:N)' },
    { id: 't5', label: 'Many-to-Many (N:N)' },
    { id: 't6', label: 'Foreign Key & Tabel Penghubung' }
  ],
  defs: [
    { id: 'd1', label: 'Hubungan logis antara dua entitas yang menunjukkan keterkaitan datanya' },
    { id: 'd2', label: 'Jumlah maksimum keterhubungan record dari satu entitas ke entitas lain' },
    { id: 'd3', label: 'Satu record di satu sisi berpasangan dengan tepat satu record di sisi lain' },
    { id: 'd4', label: 'Satu record di sisi "satu" bisa berpasangan dengan banyak record di sisi "banyak"' },
    { id: 'd5', label: 'Banyak record di satu sisi bisa berpasangan dengan banyak record di sisi lain' },
    { id: 'd6', label: 'Kolom rujukan yang mewujudkan relasi 1:1/1:N, atau tabel tersendiri untuk relasi N:N' }
  ],
  key: { t1: 'd1', t2: 'd2', t3: 'd3', t4: 'd4', t5: 'd5', t6: 'd6' },
  ujiTitle: 'Uji Pemahaman: Jodohkan Istilah dengan Pengertiannya',
  ujiInstruction: 'Ketuk satu istilah, lalu ketuk pengertian yang paling tepat untuknya.',
  cekLabel: 'Periksa Jodohnya',
  ulangLabel: 'Ulang Jodohkan',
  rencanaLabel: 'Rencana Menentukan Relasimu',
  rencana: [
    { title: 'Baca ulang catatan diskusi tim tentang keterkaitan entitas', desc: 'Menandai kalimat yang mengungkap jenis relasi antar entitas PKL.' },
    { title: 'Kelompokkan tiap pasangan entitas ke jenis relasinya', desc: 'Memastikan tiap pasangan dikelompokkan ke One-to-One, One-to-Many, atau Many-to-Many yang tepat.' },
    { title: 'Tentukan sisi foreign key', desc: 'Memilih tabel mana yang menyimpan foreign key untuk tiap relasi 1:1 dan 1:N.' },
    { title: 'Rancang tabel penghubung', desc: 'Menyusun kolom tabel penghubung untuk relasi Many-to-Many.' }
  ],
  ujiSaringLabel: '💡 Ingat sebelum lanjut',
  ujiSaring:
    '<p>Pada tahap berikutnya kamu akan membaca catatan diskusi tim analis tentang keterkaitan ' +
    'entitas PKL. Perhatikan baik-baik: tidak semua kalimat di sana mengungkap jenis relasi — ' +
    'ada obrolan dan kebutuhan fungsional yang tidak relevan yang harus kamu kenali dan hindari.</p>',
  lanjutLabel: 'Lanjut: Telusuri Petunjuk Lapangan →'
};

/* ============================================================
   TAHAP 4 — Telusur petunjuk lapangan (PBL fase 3)
   ============================================================ */
DATA.telusur = {
  kicker: 'Fase 3 · Penyelidikan',
  title: 'Telusuri Petunjuk Keterhubungan Entitas',
  goal: 'Menandai kalimat yang mengungkap jenis relasi antar entitas, sambil menghindari pengecoh.',
  instruction:
    'Ketuk frasa yang menurutmu mengungkap <strong>jenis relasi</strong> antar dua entitas. ' +
    'Hati-hati dengan kalimat yang menjelaskan fungsi/proses sistem dan obrolan yang tidak relevan.',
  temuanLabel: 'Petunjuk relasi ditemukan',
  minTemuan: 9,
  revealMin: 6,
  revealLabel: 'Saya sudah buntu, tunjukkan yang terlewat',
  revealNotice: 'Petunjuk relasi yang terlewat sudah ditandai. Pelajari kenapa itu penting.',
  hintLabel: '💡 Masih bingung?',
  hint:
    '<p>Perhatikan kata kunci seperti "tepat satu", "hanya satu", "bisa banyak", atau "sekaligus". ' +
    'Kalimat yang menjelaskan fungsi/proses sistem (mis. mengirim notifikasi) atau obrolan yang ' +
    'tidak berkaitan dengan keterhubungan data bukan petunjuk relasi.</p>',
  legendLabel: 'Legenda:',
  kinds: {
    satusatu: { label: 'Petunjuk One-to-One (1:1)', icon: '🔗', tone: 'success' },
    satubanyak: { label: 'Petunjuk One-to-Many (1:N)', icon: '🔀', tone: 'success' },
    banyakbanyak: { label: 'Petunjuk Many-to-Many (N:N)', icon: '🕸️', tone: 'success' },
    bukan: { label: 'Bukan Petunjuk Relasi', icon: '🙈', tone: 'warning' }
  },
  doc: {
    code: 'DISKUSI-PKL-02',
    title: 'Catatan Diskusi Tim Analis tentang Keterhubungan Data PKL',
    meta: [
      { label: 'Disusun oleh', value: 'Tim Analis (kamu)' },
      { label: 'Topik', value: 'Menentukan relasi antar entitas & jenisnya' }
    ],
    sections: [
      {
        heading: 'A. Diskusi tentang Akun Login dan Sertifikat Siswa',
        paras: [
          [
            { t: 'Saat membahas keamanan sistem, Bu Sari dari tim IT menjelaskan bahwa ' },
            { id: 'tl1', kind: 'satusatu', label: 'setiap siswa PKL hanya akan diberi tepat satu akun login sistem, dan satu akun login itu hanya dipakai oleh satu siswa saja',
              why: 'Kalimat "tepat satu ... hanya dipakai satu" menjadi ciri relasi One-to-One antara Siswa PKL dan Akun Login PKL.' },
            { t: '. Ia menekankan bahwa ' },
            { id: 'tl2', kind: 'bukan', label: 'sistem harus mengirim email aktivasi otomatis begitu akun dibuat',
              why: 'Ini kebutuhan fungsional (fitur notifikasi), bukan petunjuk jenis relasi.' },
            { t: '.' }
          ],
          [
            { t: 'Di bagian lain, Pak Bimo menambahkan bahwa ' },
            { id: 'tl3', kind: 'satusatu', label: 'di akhir program, tiap siswa hanya menerima tepat satu sertifikat PKL, dan satu sertifikat hanya berlaku untuk satu siswa tertentu',
              why: 'Pola "tepat satu ... hanya berlaku untuk satu" ini menandai relasi One-to-One antara Siswa PKL dan Sertifikat PKL.' },
            { t: ', walau sebelumnya sempat ' },
            { id: 'tl4', kind: 'bukan', label: 'membahas rencana pelatihan keamanan siber untuk staf IT bulan depan',
              why: 'Topik pelatihan staf IT tidak berkaitan dengan keterhubungan entitas Sistem Informasi PKL.' },
            { t: '. Ia memastikan pula bahwa ' },
            { id: 'tl5', kind: 'satusatu', label: 'akun login itu tidak pernah dipakai lebih dari satu siswa, bahkan ketika siswa berpindah kelas sekalipun',
              why: 'Penegasan ulang ini memperkuat bahwa relasi Siswa PKL—Akun Login PKL bersifat One-to-One.' },
            { t: '.' }
          ]
        ]
      },
      {
        heading: 'B. Diskusi tentang Penempatan DU/DI dan Pembimbing Industri',
        paras: [
          [
            { t: 'Pak Bimo menjelaskan bahwa ' },
            { id: 'tl6', kind: 'satubanyak', label: 'satu DU/DI bisa menerima banyak siswa PKL sekaligus dalam satu periode, tapi satu siswa hanya ditempatkan di satu DU/DI pada periode yang sama',
              why: 'Pola "satu ... banyak, tapi satu ... satu" menandai relasi One-to-Many antara DU/DI dan Siswa PKL.' },
            { t: '. Ia juga mencatat bahwa ' },
            { id: 'tl7', kind: 'satubanyak', label: 'satu DU/DI bisa memiliki beberapa pembimbing industri, tapi satu pembimbing industri hanya berasal dari satu DU/DI',
              why: 'Ini menandai relasi One-to-Many antara DU/DI dan Pembimbing (khusus pembimbing industri).' },
            { t: '. Sayangnya ' },
            { id: 'tl8', kind: 'bukan', label: 'beberapa berkas MoU DU/DI sudah lusuh dan perlu dicetak ulang',
              why: 'Kondisi fisik dokumen, tidak relevan dengan jenis relasi antar entitas.' },
            { t: '. Namun begitu, ' },
            { id: 'tl16', kind: 'satubanyak', label: 'satu pembimbing industri tidak pernah membimbing untuk lebih dari satu DU/DI dalam waktu yang sama',
              why: 'Penegasan ulang ini memperkuat relasi One-to-Many antara DU/DI dan Pembimbing industri.' },
            { t: '.' }
          ]
        ]
      },
      {
        heading: 'C. Diskusi tentang Pembimbing Siswa',
        paras: [
          [
            { t: 'Bu Sari menyoroti bahwa ' },
            { id: 'tl9', kind: 'banyakbanyak', label: 'beberapa siswa ternyata dibimbing oleh dua orang sekaligus — satu pembimbing dari sekolah dan satu dari industri — sementara satu pembimbing itu sendiri membimbing banyak siswa yang berbeda',
              why: 'Pola "banyak ... banyak" pada kedua sisi menandai relasi Many-to-Many antara Siswa PKL dan Pembimbing.' },
            { t: '. Ia lalu mengusulkan agar ' },
            { id: 'tl10', kind: 'bukan', label: 'sistem mengirim pengingat mingguan ke tiap pembimbing',
              why: 'Ini kebutuhan fungsional (fitur pengingat), bukan petunjuk jenis relasi.' },
            { t: '. Sempat juga dibahas ' },
            { id: 'tl11', kind: 'bukan', label: 'siapa yang akan mengoordinasikan rapat evaluasi PKL bulan depan',
              why: 'Topik koordinasi rapat tidak berkaitan dengan keterhubungan entitas.' },
            { t: '. Sekadar informasi, ' },
            { id: 'tl17', kind: 'bukan', label: 'salah satu pembimbing industri kebetulan alumni SMK Cendekia Bangsa',
              why: 'Fakta latar belakang pembimbing ini menarik, tapi tidak berkaitan dengan jenis relasi entitas.' },
            { t: '. Ia menambahkan bahwa ' },
            { id: 'tl12', kind: 'banyakbanyak', label: 'bila dihitung, jumlah pasangan siswa-pembimbing yang terjadi bisa lebih banyak daripada jumlah siswa itu sendiri, karena tiap siswa punya dua pembimbing sekaligus',
              why: 'Penegasan ulang ini memperkuat bahwa relasi Siswa PKL—Pembimbing bersifat Many-to-Many.' },
            { t: '.' }
          ]
        ]
      },
      {
        heading: 'D. Diskusi tentang Jurnal Kegiatan',
        paras: [
          [
            { t: 'Pak Bimo menutup diskusi dengan menjelaskan bahwa ' },
            { id: 'tl13', kind: 'satubanyak', label: 'satu siswa akan mengisi banyak entri jurnal kegiatan selama masa PKL berlangsung, tapi satu entri jurnal hanya milik satu siswa',
              why: 'Pola "satu ... banyak, tapi satu ... satu" ini menandai relasi One-to-Many antara Siswa PKL dan Jurnal Kegiatan.' },
            { t: '. Ia menegaskan lagi bahwa ' },
            { id: 'tl14', kind: 'satubanyak', label: 'siswa yang sama bisa mengisi jurnal di banyak tanggal berbeda, namun tiap entri jurnal itu sendiri tetap hanya tercatat untuk satu siswa',
              why: 'Penegasan ulang ini memperkuat bahwa relasi Siswa PKL—Jurnal Kegiatan bersifat One-to-Many.' },
            { t: '. Sementara itu ' },
            { id: 'tl15', kind: 'bukan', label: 'beberapa siswa mengeluh format jurnal cetak terlalu tebal',
              why: 'Keluhan format cetak tidak relevan dengan jenis relasi antar entitas.' },
            { t: '.' }
          ]
        ]
      }
    ]
  },
  lanjutLabel: 'Lanjut: Saring Jenis Relasinya →'
};

/* ============================================================
   TAHAP 5 — Saring pasangan entitas ke jenis relasinya (PBL fase 3)
   ============================================================ */
DATA.saring = {
  kicker: 'Fase 3 · Penyelidikan',
  title: 'Saring Pasangan Entitas ke Jenis Relasinya',
  goal: 'Menempatkan tiap pasangan entitas ke jenis relasi (kardinalitas) yang tepat.',
  instruction:
    'Setiap pasangan entitas berikut ditemukan dari catatan diskusi tim. Tempatkan ke kolom jenis ' +
    'relasi yang benar-benar sesuai.',
  poolLabel: 'Pasangan Entitas Ditemukan',
  poolEmpty: 'Semua pasangan sudah ditempatkan.',
  emptyColumn: 'Belum ada pasangan di sini.',
  hintLabel: '💡 Bingung menentukan jenisnya?',
  hint:
    '<p>Perhatikan apakah tiap sisi bisa berpasangan dengan banyak data atau hanya tepat satu. Bila ' +
    'kedua sisi hanya tepat satu, itu One-to-One. Bila satu sisi bisa banyak sedangkan sisi lain ' +
    'tetap satu, itu One-to-Many. Bila kedua sisi bisa banyak, itu Many-to-Many.</p>',
  keyboardHint: 'Pintasan: pilih pasangan lalu tekan angka 1-3 untuk menempatkannya.',
  cekLabel: 'Periksa Pengelompokan',
  benar: 'Tepat semua! Kamu berhasil mengelompokkan tiap pasangan entitas ke jenis relasinya.',
  salah: 'Beberapa pasangan masih di jenis relasi yang salah. Ketuk pasangan itu untuk memindahkannya.',
  lanjutLabel: 'Lanjut: Klasifikasikan Foreign Key →',
  columns: [
    { id: 'satu-satu', name: 'One-to-One (1:1)', desc: 'Satu data di satu sisi hanya berpasangan dengan tepat satu data di sisi lain.', colorKey: 'blue' },
    { id: 'satu-banyak', name: 'One-to-Many (1:N)', desc: 'Satu data di sisi "satu" bisa berpasangan dengan banyak data di sisi "banyak".', colorKey: 'green' },
    { id: 'banyak-banyak', name: 'Many-to-Many (N:N)', desc: 'Banyak data di satu sisi bisa berpasangan dengan banyak data di sisi lain.', colorKey: 'purple' }
  ],
  chips: [
    { id: 'pair-siswa-akun', label: 'Siswa PKL — Akun Login PKL', entityId: 'satu-satu',
      why: 'Satu siswa hanya punya tepat satu akun login, dan satu akun hanya dipakai satu siswa — keduanya saling tepat satu.' },
    { id: 'pair-siswa-sertifikat', label: 'Siswa PKL — Sertifikat PKL', entityId: 'satu-satu',
      why: 'Satu siswa hanya menerima tepat satu sertifikat, dan satu sertifikat hanya berlaku untuk satu siswa.' },
    { id: 'pair-dudi-siswa', label: 'DU/DI — Siswa PKL', entityId: 'satu-banyak',
      why: 'Satu DU/DI bisa menerima banyak siswa, tapi satu siswa hanya ditempatkan di satu DU/DI pada satu periode.' },
    { id: 'pair-siswa-jurnal', label: 'Siswa PKL — Jurnal Kegiatan', entityId: 'satu-banyak',
      why: 'Satu siswa mengisi banyak entri jurnal, tapi satu entri jurnal hanya milik satu siswa.' },
    { id: 'pair-dudi-pembimbing', label: 'DU/DI — Pembimbing Industri', entityId: 'satu-banyak',
      why: 'Satu DU/DI bisa memiliki beberapa pembimbing industri, tapi satu pembimbing industri hanya berasal dari satu DU/DI.' },
    { id: 'pair-siswa-pembimbing', label: 'Siswa PKL — Pembimbing', entityId: 'banyak-banyak',
      why: 'Satu siswa bisa dibimbing lebih dari satu pembimbing (sekolah & industri), dan satu pembimbing membimbing banyak siswa.' }
  ]
};

/* ============================================================
   TAHAP 6 — Klasifikasikan foreign key & tabel penghubung (PBL fase 3)
   ============================================================ */
DATA.klasifikasi = {
  kicker: 'Fase 3 · Penyelidikan',
  title: 'Klasifikasikan Foreign Key & Tabel Penghubung',
  goal: 'Menentukan sisi foreign key untuk relasi 1:1/1:N, lalu merancang tabel penghubung untuk relasi N:N.',
  step1Title: 'Langkah 1 — Tentukan Peletakan Foreign Key',
  step1Instruction: 'Untuk tiap pasangan entitas dengan relasi One-to-One atau One-to-Many, tentukan di tabel mana foreign key seharusnya diletakkan.',
  step1Hint:
    '<p>Pada relasi <strong>One-to-Many</strong>, foreign key selalu diletakkan di sisi "banyak" — ' +
    'tabel yang setiap recordnya hanya berpasangan dengan satu data di sisi lain. Pada relasi ' +
    '<strong>One-to-One</strong>, foreign key diletakkan di tabel yang secara logis bergantung pada ' +
    'tabel lainnya (dibuat setelah dan mengacu pada data yang sudah ada).</p>',
  cekLabel: 'Periksa Jawaban',
  ulangLabel: 'Coba Lagi',
  benar: 'Tepat semua! Kamu bisa menentukan sisi foreign key yang tepat untuk tiap relasi.',
  salah: 'Beberapa jawaban masih belum tepat. Perhatikan penjelasan di tiap soal, lalu coba lagi.',
  fkQuestions: [
    { id: 'pair-siswa-akun', pairLabel: 'Siswa PKL — Akun Login PKL (1:1)',
      prompt: 'Di sisi mana sebaiknya foreign key diletakkan?',
      options: [
        { id: 'akun', label: 'Foreign key NIS diletakkan di tabel Akun Login PKL' },
        { id: 'siswa', label: 'Foreign key kode_akun diletakkan di tabel Siswa PKL' },
        { id: 'keduanya', label: 'Foreign key diletakkan di kedua tabel sekaligus' }
      ],
      correct: 'akun',
      explanation: 'Akun Login dibuat setelah siswa terdaftar dan bergantung padanya, sehingga FK NIS diletakkan di tabel Akun Login PKL.' },
    { id: 'pair-siswa-sertifikat', pairLabel: 'Siswa PKL — Sertifikat PKL (1:1)',
      prompt: 'Di sisi mana sebaiknya foreign key diletakkan?',
      options: [
        { id: 'sertifikat', label: 'Foreign key NIS diletakkan di tabel Sertifikat PKL' },
        { id: 'siswa', label: 'Foreign key kode_sertifikat diletakkan di tabel Siswa PKL' },
        { id: 'keduanya', label: 'Foreign key diletakkan di kedua tabel sekaligus' }
      ],
      correct: 'sertifikat',
      explanation: 'Sertifikat baru terbit setelah siswa menyelesaikan PKL dan bergantung pada datanya, sehingga FK NIS diletakkan di tabel Sertifikat PKL.' },
    { id: 'pair-dudi-siswa', pairLabel: 'DU/DI — Siswa PKL (1:N)',
      prompt: 'Di sisi mana sebaiknya foreign key diletakkan?',
      options: [
        { id: 'dudi', label: 'Foreign key NIS diletakkan di tabel DU/DI' },
        { id: 'siswa', label: 'Foreign key kode_dudi diletakkan di tabel Siswa PKL' },
        { id: 'keduanya', label: 'Foreign key diletakkan di kedua tabel sekaligus' }
      ],
      correct: 'siswa',
      explanation: 'DU/DI adalah sisi "satu" dan Siswa PKL sisi "banyak", sehingga FK kode_dudi diletakkan di tabel Siswa PKL.' },
    { id: 'pair-siswa-jurnal', pairLabel: 'Siswa PKL — Jurnal Kegiatan (1:N)',
      prompt: 'Di sisi mana sebaiknya foreign key diletakkan?',
      options: [
        { id: 'siswa', label: 'Foreign key kode_jurnal diletakkan di tabel Siswa PKL' },
        { id: 'jurnal', label: 'Foreign key NIS diletakkan di tabel Jurnal Kegiatan' },
        { id: 'keduanya', label: 'Foreign key diletakkan di kedua tabel sekaligus' }
      ],
      correct: 'jurnal',
      explanation: 'Siswa PKL adalah sisi "satu" dan Jurnal Kegiatan sisi "banyak", sehingga FK NIS diletakkan di tabel Jurnal Kegiatan.' },
    { id: 'pair-dudi-pembimbing', pairLabel: 'DU/DI — Pembimbing Industri (1:N)',
      prompt: 'Di sisi mana sebaiknya foreign key diletakkan?',
      options: [
        { id: 'dudi', label: 'Foreign key kode_pembimbing diletakkan di tabel DU/DI' },
        { id: 'pembimbing', label: 'Foreign key kode_dudi diletakkan di tabel Pembimbing' },
        { id: 'keduanya', label: 'Foreign key diletakkan di kedua tabel sekaligus' }
      ],
      correct: 'pembimbing',
      explanation: 'DU/DI adalah sisi "satu" dan Pembimbing (industri) sisi "banyak", sehingga FK kode_dudi diletakkan di tabel Pembimbing.' }
  ],
  junctionPairId: 'pair-siswa-pembimbing',
  junctionTableName: 'Bimbingan',
  step2Title: 'Langkah 2 — Rancang Tabel Penghubung "Bimbingan"',
  step2Instruction: 'Relasi Siswa PKL—Pembimbing bertipe Many-to-Many, sehingga butuh tabel penghubung tersendiri. Pilih kolom yang layak masuk tabel Bimbingan.',
  cekUsulanLabel: 'Periksa Kolom',
  benarUsulan: 'Tepat — kamu bisa merancang kolom tabel penghubung yang benar.',
  salahUsulan: 'Belum semua tepat. Perhatikan kolom mana yang benar-benar milik relasi Siswa-Pembimbing.',
  usulan: [
    { id: 'kol1', label: 'kode_bimbingan', simpan: true,
      why: 'Atribut kunci milik tabel penghubung Bimbingan itu sendiri.' },
    { id: 'kol2', label: 'nis (foreign key ke Siswa PKL)', simpan: true,
      why: 'Foreign key yang merujuk ke entitas Siswa PKL.' },
    { id: 'kol3', label: 'kode_pembimbing (foreign key ke Pembimbing)', simpan: true,
      why: 'Foreign key yang merujuk ke entitas Pembimbing.' },
    { id: 'kol4', label: 'tanggal_mulai', simpan: true,
      why: 'Atribut milik relasi itu sendiri — hanya bermakna pada pasangan siswa-pembimbing tertentu.' },
    { id: 'kol5', label: 'nama_siswa', simpan: false,
      why: 'Duplikasi — nama siswa sudah tersimpan di tabel Siswa PKL, cukup diakses lewat foreign key nis.' },
    { id: 'kol6', label: 'alamat_dudi', simpan: false,
      why: 'Tidak relevan — atribut ini milik entitas DU/DI, bukan relasi Siswa-Pembimbing.' }
  ],
  lanjutLabel: 'Lanjut: Sajikan Hasil Karya →'
};

/* ============================================================
   TAHAP 7 — Sajikan hasil karya (PBL fase 4)
   ============================================================ */
DATA.sajikan = {
  kicker: 'Fase 4 · Menyajikan Hasil Karya',
  title: 'Sajikan dan Uji Identifikasi Relasi',
  goal: 'Menyusun ringkasan relasi final, lalu menguji ketepatan identifikasi jenis relasi pada kasus baru.',
  kartuLabel: 'Ringkasan Relasi — Sistem Informasi PKL',
  kartuNote: 'Rangkuman jenis relasi, foreign key, dan tabel penghubung yang berhasil kamu tentukan.',
  tableHeaders: ['Entitas 1', 'Kardinalitas', 'Entitas 2', 'Peletakan Foreign Key / Tabel Penghubung'],
  ujiLabel: 'Uji Identifikasi Jenis Relasi',
  ujiInstruction:
    'Empat tim lain di sekolah sedang merancang sistem serupa. Untuk tiap kasus, tebak jenis relasi ' +
    '(kardinalitas) yang tepat, lalu buka jawabannya.',
  prediksiLabel: 'Tebakanmu',
  bukaLabel: 'Buka Jawaban',
  benarPrediksi: 'Tepat! Pilihanmu sejalan dengan tim ahli.',
  salahPrediksi: 'Pahami dulu pertimbangannya sebelum lanjut ke kasus berikutnya.',
  kamuLabel: 'Tim yang Tepat',
  timALabel: 'Tim yang Meleset',
  penutup: 'Kamu sudah menguji identifikasi jenis relasi pada empat situasi berbeda.',
  justifLabel: 'Justifikasi Akhir',
  justifPrompt: 'Jelaskan mengapa menentukan jenis relasi (kardinalitas) dengan tepat penting sebelum tabel sebuah sistem dirancang.',
  justifPlaceholder: 'Tulis alasanmu, minimal beberapa kalimat...',
  justifMin: 40,
  lanjutLabel: 'Lanjut: Evaluasi →',
  cases: [
    {
      id: 'ekskul', icon: '🏃', title: 'Sistem Presensi Ekstrakurikuler',
      scenario: 'Tim ekskul futsal mencatat bahwa satu anggota bisa mengikuti banyak sesi latihan sepanjang semester, dan satu sesi latihan itu sendiri diikuti oleh banyak anggota sekaligus.',
      options: [
        { id: '1-1', label: 'One-to-One (1:1)' },
        { id: '1-n', label: 'One-to-Many (1:N)' },
        { id: 'n-n', label: 'Many-to-Many (N:N)' }
      ],
      correct: 'n-n',
      kamu: { verdict: 'baik', text: 'Tim yang menandai relasi Anggota—Sesi Latihan sebagai Many-to-Many berhasil merancang tabel penghubung presensi yang mencatat tiap kombinasi anggota dan sesi dengan tepat.' },
      timA: { verdict: 'buruk', text: 'Tim lain memaksakannya sebagai One-to-Many, sehingga tidak bisa mencatat satu anggota yang hadir di banyak sesi berbeda.' },
      konsep: 'Relasi Many-to-Many terjadi ketika kedua sisi bisa berpasangan dengan banyak data, dan butuh tabel penghubung tersendiri.'
    },
    {
      id: 'lab', icon: '💻', title: 'Sistem Reservasi Lab Komputer',
      scenario: 'Tim TI sekolah mencatat bahwa satu ruang lab bisa dipesan lewat banyak reservasi berbeda sepanjang bulan, tapi satu reservasi hanya untuk satu ruang lab.',
      options: [
        { id: '1-1', label: 'One-to-One (1:1)' },
        { id: '1-n', label: 'One-to-Many (1:N)' },
        { id: 'n-n', label: 'Many-to-Many (N:N)' }
      ],
      correct: '1-n',
      kamu: { verdict: 'baik', text: 'Tim yang menandai relasi Ruang Lab—Reservasi sebagai One-to-Many berhasil meletakkan foreign key kode_ruang di tabel Reservasi (sisi "banyak").' },
      timA: { verdict: 'buruk', text: 'Tim lain menganggapnya One-to-One, sehingga sistem menolak reservasi kedua untuk ruang lab yang sama di hari berbeda.' },
      konsep: 'Relasi One-to-Many diletakkan foreign key-nya di sisi "banyak" — di sini, tabel Reservasi.'
    },
    {
      id: 'lomba', icon: '🏆', title: 'Sistem Pendaftaran Lomba Antar Kelas',
      scenario: 'Panitia lomba menetapkan bahwa satu kelas hanya boleh mendaftarkan tepat satu tim peserta, dan satu tim peserta hanya mewakili satu kelas.',
      options: [
        { id: '1-1', label: 'One-to-One (1:1)' },
        { id: '1-n', label: 'One-to-Many (1:N)' },
        { id: 'n-n', label: 'Many-to-Many (N:N)' }
      ],
      correct: '1-1',
      kamu: { verdict: 'baik', text: 'Tim yang menandai relasi Kelas—Tim Peserta sebagai One-to-One berhasil mencegah satu kelas mendaftar dua kali atau satu tim mewakili dua kelas sekaligus.' },
      timA: { verdict: 'buruk', text: 'Tim lain menganggapnya One-to-Many, sehingga sistem sempat mengizinkan satu kelas mendaftarkan lebih dari satu tim.' },
      konsep: 'Relasi One-to-One terjadi ketika kedua sisi saling berpasangan dengan tepat satu data saja.'
    },
    {
      id: 'bengkel', icon: '🔧', title: 'Sistem Peminjaman Alat Bengkel Praktik',
      scenario: 'Tim bengkel mencatat bahwa satu alat praktik bisa dipinjam lewat banyak transaksi peminjaman dari waktu ke waktu, tapi satu transaksi peminjaman hanya untuk satu alat.',
      options: [
        { id: '1-1', label: 'One-to-One (1:1)' },
        { id: '1-n', label: 'One-to-Many (1:N)' },
        { id: 'n-n', label: 'Many-to-Many (N:N)' }
      ],
      correct: '1-n',
      kamu: { verdict: 'baik', text: 'Tim yang menandai relasi Alat—Transaksi Peminjaman sebagai One-to-Many berhasil melacak riwayat peminjaman tiap alat dengan foreign key kode_alat di tabel Transaksi.' },
      timA: { verdict: 'buruk', text: 'Tim lain menganggapnya One-to-One, sehingga sistem menolak alat yang sama dipinjam lagi setelah dikembalikan.' },
      konsep: 'Relasi One-to-Many bisa berulang pada banyak kasus berbeda — intinya tetap satu sisi "satu", satu sisi "banyak".'
    }
  ]
};

/* ============================================================
   TAHAP 8 — Evaluasi pada kasus lain (PBL fase 5)
   ============================================================ */
DATA.evaluasi = {
  kicker: 'Fase 5 · Menganalisis dan Mengevaluasi',
  title: 'Evaluasi: Uji pada Kasus Lain',
  goal: 'Membuktikan pemahamanmu tentang menentukan jenis relasi dan peletakan foreign key berlaku pada kasus baru.',
  instruction: 'Bacalah cuplikan kasus berikut, lalu jawab soal-soal di bawahnya.',
  dokLabel: 'CUPLIKAN-03',
  dokumen:
    '<p>Tim BKK (Bursa Kerja Khusus) SMK Cendekia Bangsa sedang membangun Sistem Pendataan Alumni ' +
    'untuk tracer study. Dari hasil analisis kebutuhan, tim sudah mengidentifikasi entitas Alumni ' +
    '(NISN, nama, tahun lulus, nomor HP aktif) dan entitas Perusahaan/Instansi (nama perusahaan, ' +
    'bidang usaha) tempat alumni bekerja.</p>' +
    '<p>Awalnya, tim hanya ingin mencatat perusahaan tempat alumni bekerja <strong>saat ini</strong>: ' +
    'satu perusahaan bisa mempekerjakan banyak alumni, tapi satu alumni saat ini hanya tercatat ' +
    'bekerja di satu perusahaan. Belakangan, kepala sekolah meminta agar sistem juga mencatat ' +
    '<strong>riwayat</strong> seluruh perusahaan yang pernah menjadi tempat kerja tiap alumni dari ' +
    'waktu ke waktu — sehingga satu alumni bisa memiliki banyak catatan riwayat perusahaan, dan satu ' +
    'perusahaan bisa muncul di banyak catatan riwayat alumni berbeda.</p>',
  questions: [
    {
      id: 'e1',
      prompt: 'Selama sistem hanya mencatat perusahaan tempat alumni bekerja saat ini, relasi Alumni—Perusahaan/Instansi paling tepat digolongkan sebagai...',
      options: [
        { id: 'a', label: 'One-to-One (1:1)' }, { id: 'b', label: 'One-to-Many (1:N)' },
        { id: 'c', label: 'Many-to-Many (N:N)' }, { id: 'd', label: 'Tidak ada relasi' }
      ],
      correct: 'b',
      explanation: 'Satu perusahaan bisa mempekerjakan banyak alumni, tapi satu alumni saat ini hanya bekerja di satu perusahaan — ini One-to-Many.'
    },
    {
      id: 'e2',
      prompt: 'Untuk relasi One-to-Many itu, di tabel mana sebaiknya foreign key kode_perusahaan diletakkan?',
      options: [
        { id: 'a', label: 'Tabel Alumni' }, { id: 'b', label: 'Tabel Perusahaan/Instansi' },
        { id: 'c', label: 'Kedua tabel sekaligus' }, { id: 'd', label: 'Tabel tersendiri' }
      ],
      correct: 'a',
      explanation: 'Alumni adalah sisi "banyak" pada relasi ini, sehingga foreign key kode_perusahaan diletakkan di tabel Alumni.'
    },
    {
      id: 'e3',
      prompt: 'Setelah kepala sekolah meminta seluruh riwayat perusahaan dicatat, relasi Alumni—Perusahaan/Instansi berubah menjadi...',
      options: [
        { id: 'a', label: 'One-to-One (1:1)' }, { id: 'b', label: 'Tetap One-to-Many (1:N)' },
        { id: 'c', label: 'Many-to-Many (N:N)' }, { id: 'd', label: 'Tidak ada relasi' }
      ],
      correct: 'c',
      explanation: 'Satu alumni bisa memiliki banyak riwayat perusahaan, dan satu perusahaan bisa muncul di banyak riwayat alumni berbeda — ini Many-to-Many.'
    },
    {
      id: 'e4',
      prompt: 'Apa yang dibutuhkan untuk mewujudkan relasi Many-to-Many itu di dalam basis data?',
      options: [
        { id: 'a', label: 'Tabel penghubung tersendiri berisi foreign key ke kedua entitas' },
        { id: 'b', label: 'Kolom tambahan biasa di tabel Alumni saja' },
        { id: 'c', label: 'Kolom tambahan biasa di tabel Perusahaan saja' },
        { id: 'd', label: 'Tidak perlu perubahan apa pun' }
      ],
      correct: 'a',
      explanation: 'Relasi Many-to-Many selalu diwujudkan lewat tabel penghubung (junction table) tersendiri, bukan kolom tambahan di salah satu tabel.'
    },
    {
      id: 'e5',
      prompt: 'Tabel penghubung "Riwayat Kerja" itu paling tepat berisi kolom...',
      options: [
        { id: 'a', label: 'NISN (FK), kode_perusahaan (FK), dan tanggal_mulai bekerja' },
        { id: 'b', label: 'Nama alumni dan nama perusahaan saja' },
        { id: 'c', label: 'Tahun lulus alumni dan bidang usaha perusahaan' },
        { id: 'd', label: 'Nomor HP alumni dan alamat perusahaan' }
      ],
      correct: 'a',
      explanation: 'Tabel penghubung berisi foreign key ke kedua entitas (NISN dan kode_perusahaan) ditambah atribut yang melekat pada relasi itu sendiri, seperti tanggal_mulai bekerja.'
    },
    {
      id: 'e6',
      prompt: 'Mengapa kolom nama_alumni sebaiknya TIDAK dimasukkan ke tabel Riwayat Kerja?',
      options: [
        { id: 'a', label: 'Karena datanya sudah tersimpan di tabel Alumni dan cukup diakses lewat foreign key NISN' },
        { id: 'b', label: 'Karena nama alumni tidak penting untuk dicatat sama sekali' },
        { id: 'c', label: 'Karena tabel penghubung tidak boleh memiliki foreign key' },
        { id: 'd', label: 'Karena nama alumni sudah pasti unik' }
      ],
      correct: 'a',
      explanation: 'Menyimpan nama_alumni di tabel Riwayat Kerja hanya menduplikasi data yang sudah ada di tabel Alumni — cukup dirujuk lewat foreign key NISN.'
    },
    {
      id: 'e7',
      prompt: 'Mengapa penting menentukan jenis relasi (kardinalitas) sebelum tabel sebuah sistem dirancang?',
      options: [
        { id: 'a', label: 'Agar foreign key atau tabel penghubung diletakkan dengan tepat sejak awal, sehingga data tidak salah struktur atau hilang keterkaitannya' },
        { id: 'b', label: 'Agar semua tabel memiliki jumlah kolom yang sama persis' },
        { id: 'c', label: 'Karena aturan baku mengharuskan tiap sistem punya tepat lima tabel' },
        { id: 'd', label: 'Agar warna setiap tabel di diagram terlihat berbeda' }
      ],
      correct: 'a',
      explanation: 'Menentukan jenis relasi lebih dulu memastikan foreign key dan tabel penghubung diletakkan dengan tepat, mencegah data salah struktur di kemudian hari.'
    }
  ],
  kesimpulanLabel: 'Kesimpulanmu',
  kesimpulanPrompt: 'Simpulkan, bagaimana cara menentukan jenis relasi antar entitas, dan bagaimana jenis itu menentukan peletakan foreign key atau kebutuhan tabel penghubung?',
  kesimpulanPlaceholder: 'Tulis kesimpulanmu di sini...',
  kesimpulanMin: 40,
  cekLabel: 'Periksa Jawaban',
  ulangLabel: 'Kerjakan Ulang',
  lanjutLabel: 'Lanjut: Refleksi →'
};

/* ============================================================
   TAHAP 9 — Refleksi (PBL fase 5)
   ============================================================ */
DATA.refleksi = {
  kicker: 'Fase 5 · Menganalisis dan Mengevaluasi',
  title: 'Refleksi',
  goal: 'Menilai proses belajarmu dan menyiapkan diri menerapkannya pada proyek nyata.',
  note: 'Refleksi ini tidak dinilai benar/salah — jawab sejujurnya sesuai pengalamanmu.',
  recallLabel: 'Ingat Kembali Tebakanmu',
  recallKosong: 'Kamu belum membuat tebakan pada tahap Sajikan.',
  skalaLabel: 'Skala Penilaian Diri',
  skala: [
    { value: 1, label: 'Sangat Tidak Setuju' },
    { value: 2, label: 'Tidak Setuju' },
    { value: 3, label: 'Netral' },
    { value: 4, label: 'Setuju' },
    { value: 5, label: 'Sangat Setuju' }
  ],
  skalaItems: [
    { id: 'r1', text: 'Saya bisa menentukan relasi antar dua entitas berdasarkan temuan hasil analisis kebutuhan.' },
    { id: 'r2', text: 'Saya bisa menentukan jenis relasi (kardinalitas): One-to-One, One-to-Many, atau Many-to-Many.' },
    { id: 'r3', text: 'Saya bisa menentukan di tabel mana foreign key seharusnya diletakkan untuk relasi 1:1 dan 1:N.' },
    { id: 'r4', text: 'Saya bisa merancang tabel penghubung (junction table) untuk relasi Many-to-Many.' },
    { id: 'r5', text: 'Saya siap menerapkan penentuan relasi dan kardinalitas ini pada proyek basis data nyata.' }
  ],
  prompts: [
    { id: 'p1', question: 'Bagian mana yang paling sulit: menentukan jenis relasi, menentukan sisi foreign key, atau merancang tabel penghubung? Mengapa?', placeholder: 'Tulis jawabanmu...' },
    { id: 'p2', question: 'Ceritakan satu momen kamu (atau timmu) pernah salah menentukan jenis relasi antar data. Apa akibatnya?', placeholder: 'Tulis pengalamanmu...' }
  ],
  simpanLabel: 'Simpan Refleksi',
  tersimpan: 'Refleksi tersimpan.',
  lanjutLabel: 'Selesai →'
};

/* ============================================================
   TAHAP 10 — Selesai
   ============================================================ */
DATA.selesai = {
  kicker: 'Penutup',
  title: 'Selesai!',
  skorLabel: 'Rincian Skor',
  entitasLabel: 'Kartu Entitas (dari Materi 1.3)',
  relasiLabel: 'Ringkasan Relasi Final',
  kesimpulanLabel: 'Kesimpulanmu (Tahap Evaluasi)',
  justifLabel: 'Justifikasimu (Tahap Sajikan)',
  konsepKunci: [
    'Relasi adalah hubungan logis antar dua entitas yang datanya saling berkaitan.',
    'Kardinalitas menentukan jenis relasi: One-to-One, One-to-Many, atau Many-to-Many.',
    'Pada relasi One-to-One dan One-to-Many, foreign key diletakkan di sisi yang bergantung atau sisi "banyak".',
    'Pada relasi Many-to-Many, dibutuhkan tabel penghubung (junction table) berisi foreign key ke kedua entitas.',
    'Menentukan jenis relasi dengan tepat sebelum tabel dirancang mencegah data salah struktur dan kehilangan keterkaitan.'
  ],
  lanjutLabel: 'Langkah Selanjutnya',
  lanjut: [
    'Coba tentukan relasi antar entitas dari proyek kelas atau organisasi sekolahmu sendiri.',
    'Pelajari materi berikutnya tentang merancang skema fisik basis data dan normalisasi.',
    'Diskusikan dengan gurumu, bagaimana relasi ini akan diwujudkan memakai alat bantu ERD (Entity Relationship Diagram).'
  ],
  ulangLabel: 'Ulangi dari Awal',
  berandaLabel: 'Kembali ke Beranda',
  ulangKonfirmasi: 'Reset seluruh progres materi ini? Semua jawaban dan urutan acak akan dihapus.'
};

'use strict';

/* ============================================================
   data.js — seluruh konten materi 1.2
   ============================================================
   Studi kasus: Sistem Informasi Perpustakaan "Wira Pustaka",
   SMK Cendekia Bangsa. Versi pertama aplikasi dibangun tanpa
   penggalian kebutuhan yang benar, sehingga meleset dari
   kebutuhan nyata petugas dan siswa. Murid berperan sebagai tim
   analis baru yang menggali kebutuhan informasi dan data lewat
   empat teknik: wawancara, observasi, studi dokumen, kuesioner.
   ============================================================ */

var DATA = {

  /* ============================================================
     TAHAP 1 — Orientasi
     ============================================================ */
  orientasi: {
    kicker: 'Prolog',
    title: 'Selamat Datang, Tim Analis Baru',
    goal: 'Memahami alur belajar dan peranmu sebagai analis yang menggali kebutuhan sistem.',
    salam:
      'Perpustakaan "Wira Pustaka" di SMK Cendekia Bangsa baru saja menghentikan sementara ' +
      'aplikasi peminjaman buku yang dibangun tahun lalu — fiturnya meleset jauh dari yang ' +
      'dibutuhkan petugas dan siswa. Kepala sekolah menugaskanmu, tim analis baru, untuk ' +
      'mengulang prosesnya dari awal: menggali kebutuhan informasi dan data yang sebenarnya ' +
      'sebelum sistem dirancang ulang.',
    tujuanLabel: 'Tujuan Pembelajaran',
    tujuan: [
      'Mengidentifikasi kebutuhan informasi dan data dari studi kasus sistem.',
      'Membedakan teknik penggalian kebutuhan (wawancara, observasi, kuesioner, studi dokumen) beserta kapan tepat dipakai.',
      'Memilah kebutuhan fungsional, kebutuhan data, dan kebutuhan non-fungsional dari temuan lapangan.',
      'Menilai teknik penggalian kebutuhan yang paling sesuai untuk situasi studi kasus baru.'
    ],
    alurLabel: 'Alur Belajar (Problem Based Learning)',
    alur: [
      { title: 'Pahami Masalah', desc: 'Menelaah kegagalan sistem lama akibat penggalian kebutuhan yang asal-asalan.' },
      { title: 'Bekal Teknik', desc: 'Mengenal lima teknik penggalian kebutuhan lewat kartu konsep dan latihan menjodohkan.' },
      { title: 'Telusuri Temuan Lapangan', desc: 'Menandai kebutuhan informasi dan data pada kutipan wawancara, observasi, dokumen, dan kuesioner.' },
      { title: 'Saring Sumbernya', desc: 'Mengenali teknik apa yang menghasilkan tiap temuan.' },
      { title: 'Klasifikasikan Kebutuhan', desc: 'Memilah kebutuhan fungsional, data, dan non-fungsional, lalu menyaring usulan tambahan.' },
      { title: 'Sajikan dan Uji', desc: 'Menyusun Kartu Kebutuhan, lalu menguji pilihan teknik pada kasus baru.' },
      { title: 'Evaluasi', desc: 'Menjawab soal pada kasus lain untuk membuktikan pemahaman berlaku umum.' }
    ],
    caraPakaiLabel: 'Cara Memakai Media Ini',
    caraPakai: [
      'Progresmu tersimpan otomatis di perangkat ini — boleh ditutup dan dilanjutkan nanti.',
      'Setiap tahap baru terbuka setelah tahap sebelumnya selesai.',
      'Pilihan jawaban selalu diacak setiap kali materi dimulai — kerjakan dengan cermat, bukan menghafal urutan.'
    ]
  },

  /* ============================================================
     TAHAP 2 — Orientasi pada masalah (PBL fase 1)
     ============================================================ */
  masalah: {
    kicker: 'Fase 1 · Orientasi pada Masalah',
    title: 'Sistem yang Meleset dari Kebutuhan',
    goal: 'Membedakan akar masalah (penggalian kebutuhan yang buruk) dari gejala-gejala yang tampak.',
    briefLabel: 'Latar Belakang',
    brief:
      '<p>Tahun lalu, seorang programmer junior ditugaskan membangun aplikasi peminjaman buku ' +
      'untuk perpustakaan "Wira Pustaka". Ia bekerja sendiri, memakai template aplikasi yang ' +
      'ditemukannya di internet, dan langsung mulai menulis kode tanpa lebih dulu berbicara ' +
      'dengan petugas perpustakaan atau siswa.</p>' +
      '<p>Tiga bulan setelah aplikasi diluncurkan, Bu Rahma — kepala perpustakaan — tetap ' +
      'mencatat peminjaman secara manual di buku besar.</p>',
    kutipan:
      'Programnya jadi, tapi bukan yang kami butuhkan. Laporan buku terpopuler saja tidak ada, ' +
      'padahal itu yang paling sering saya cari manual tiap bulan.',
    kejadianLabel: 'Yang Terjadi',
    kejadian: [
      {
        tim: 'Programmer Junior (tahun lalu)',
        hasil: 'Membangun aplikasi hanya berdasar template internet, tanpa wawancara atau observasi ke petugas perpustakaan.'
      },
      {
        tim: 'Hasil di Lapangan',
        hasil: 'Tiga bulan berjalan, petugas tetap mencatat manual di buku besar karena fitur laporan tidak sesuai kebutuhan nyata.'
      }
    ],
    insiden:
      'Kepala sekolah akhirnya menghentikan sementara pemakaian aplikasi dan menugaskan tim ' +
      'analis baru — kamu — untuk mengulang prosesnya dari awal, dimulai dari menggali ' +
      'kebutuhan yang sebenarnya.',
    instruction:
      'Dari laporan evaluasi proyek berikut, pilih pernyataan yang merupakan <strong>akar masalah</strong> ' +
      '(penyebab), bukan sekadar gejala yang tampak di permukaan.',
    statements: [
      { id: 'm1', text: 'Tidak pernah ada sesi wawancara dengan petugas perpustakaan sebelum aplikasi dirancang.', valid: true,
        feedback: 'Benar — ini akar masalah: tanpa wawancara, kebutuhan nyata pengguna tidak pernah tergali.' },
      { id: 'm2', text: 'Laporan buku terpopuler bulanan tidak tersedia di aplikasi.', valid: false,
        feedback: 'Ini gejala (akibat), bukan akar masalah — hilangnya fitur ini adalah dampak dari kebutuhan yang tidak digali, bukan penyebabnya.' },
      { id: 'm3', text: 'Programmer tidak pernah mengamati langsung alur peminjaman buku di perpustakaan.', valid: true,
        feedback: 'Benar — observasi langsung akan mengungkap detail proses yang sulit dijelaskan lewat kata-kata saja.' },
      { id: 'm4', text: 'Aplikasi terasa lambat saat dibuka dari HP siswa.', valid: false,
        feedback: 'Ini gejala teknis, bukan soal penggalian kebutuhan — bisa jadi soal performa, bukan akar masalah di studi kasus ini.' },
      { id: 'm5', text: 'Kebutuhan sistem hanya ditentukan sepihak oleh programmer tanpa melibatkan calon pengguna.', valid: true,
        feedback: 'Benar — keterlibatan calon pengguna adalah inti dari penggalian kebutuhan yang baik.' },
      { id: 'm6', text: 'Siswa mengeluh tidak bisa mengecek ketersediaan buku dari rumah.', valid: false,
        feedback: 'Ini gejala/keluhan pengguna, akibat dari kebutuhan yang tidak pernah digali lewat kuesioner atau wawancara ke siswa.' },
      { id: 'm7', text: 'Tidak ada dokumen atau catatan lama (buku peminjaman manual) yang dipelajari sebelum merancang aplikasi.', valid: true,
        feedback: 'Benar — studi dokumen terhadap catatan yang sudah ada adalah salah satu teknik penggalian kebutuhan yang terlewat.' }
    ],
    cekLabel: 'Periksa Pilihanku',
    ownLabel: 'Rumusan Masalahmu',
    ownPrompt: "Tulis satu kalimat rumusan masalah untuk proyek ini (format: 'Bagaimana ... agar ...').",
    ownPlaceholder: 'Contoh: Bagaimana tim analis dapat menggali kebutuhan informasi dan data perpustakaan secara tepat sebelum sistem dirancang ulang?',
    ownMin: 30,
    lanjutLabel: 'Lanjut: Bekal Teknik Penggalian Kebutuhan →'
  },

  /* ============================================================
     TAHAP 3 — Mengorganisasikan belajar (PBL fase 2)
     ============================================================ */
  bekal: {
    kicker: 'Fase 2 · Mengorganisasikan Belajar',
    title: 'Bekal: Teknik Penggalian Kebutuhan',
    goal: 'Mengenal lima teknik penggalian kebutuhan beserta ciri dan kapan tepat digunakan.',
    instruction: 'Ketuk tiap kartu untuk membuka penjelasannya.',
    cards: [
      { id: 'wawancara', icon: '🗣️', term: 'Wawancara',
        def: 'Tanya jawab langsung dan terarah dengan narasumber (pengguna, pemilik proses, atau pemangku kepentingan) untuk menggali kebutuhan, alasan, dan harapan mereka.',
        example: 'Contoh: menanyakan langsung ke petugas perpustakaan, laporan apa saja yang paling sering ia butuhkan.' },
      { id: 'observasi', icon: '👁️', term: 'Observasi',
        def: 'Mengamati langsung bagaimana proses berjalan di lapangan, tanpa mengandalkan penjelasan lisan saja.',
        example: 'Contoh: mengamati petugas mencatat peminjaman buku secara manual selama satu hari kerja.' },
      { id: 'kuesioner', icon: '📋', term: 'Kuesioner/Angket',
        def: 'Daftar pertanyaan tertulis yang dibagikan ke banyak responden sekaligus, cocok untuk menjangkau pendapat pengguna dalam jumlah besar.',
        example: 'Contoh: menyebar angket ke seluruh siswa untuk mengetahui fitur apa yang paling mereka inginkan.' },
      { id: 'dokumen', icon: '📄', term: 'Studi Dokumen',
        def: 'Mempelajari dokumen, catatan, atau laporan yang sudah ada untuk memahami proses dan data yang selama ini dipakai.',
        example: 'Contoh: mempelajari buku catatan peminjaman manual untuk mengetahui data apa saja yang selama ini dicatat.' },
      { id: 'fgd', icon: '👥', term: 'FGD (Diskusi Kelompok Terarah)',
        def: 'Diskusi terarah bersama sekelompok kecil pemangku kepentingan untuk menggali kebutuhan lewat perbincangan dan pertukaran ide.',
        example: 'Contoh: mengumpulkan pengurus OSIS, guru, dan petugas perpustakaan dalam satu sesi diskusi untuk menyepakati prioritas fitur.' }
    ],
    terms: [
      { id: 't1', label: 'Wawancara' },
      { id: 't2', label: 'Observasi' },
      { id: 't3', label: 'Kuesioner/Angket' },
      { id: 't4', label: 'Studi Dokumen' },
      { id: 't5', label: 'FGD (Diskusi Kelompok Terarah)' }
    ],
    defs: [
      { id: 'd1', label: "Bisa langsung menggali alasan 'mengapa' di balik jawaban narasumber" },
      { id: 'd2', label: 'Paling akurat melihat proses nyata yang sulit dijelaskan dengan kata-kata' },
      { id: 'd3', label: 'Paling efisien menjangkau pendapat banyak responden dalam waktu singkat' },
      { id: 'd4', label: 'Memanfaatkan catatan yang sudah ada tanpa perlu mengganggu aktivitas siapa pun' },
      { id: 'd5', label: 'Cocok menyepakati prioritas kebutuhan lewat diskusi banyak pihak sekaligus' }
    ],
    key: { t1: 'd1', t2: 'd2', t3: 'd3', t4: 'd4', t5: 'd5' },
    ujiTitle: 'Uji Pemahaman: Jodohkan Teknik dengan Cirinya',
    ujiInstruction: 'Ketuk satu teknik, lalu ketuk ciri yang paling tepat untuknya.',
    cekLabel: 'Periksa Jodohnya',
    ulangLabel: 'Ulang Jodohkan',
    rencanaLabel: 'Rencana Penggalian Kebutuhan Timmu',
    rencana: [
      { title: 'Wawancara Bu Rahma', desc: 'Menggali alasan di balik kebutuhan laporan dan notifikasi yang selama ini ia inginkan.' },
      { title: 'Observasi alur peminjaman', desc: 'Mengamati langsung bagaimana petugas dan siswa berinteraksi saat jam sibuk.' },
      { title: 'Pelajari buku catatan manual', desc: 'Menelusuri data apa saja yang selama ini sudah dicatat bertahun-tahun.' },
      { title: 'Sebar kuesioner ke siswa', desc: 'Menjangkau pendapat siswa dalam jumlah besar tentang fitur yang mereka harapkan.' }
    ],
    ujiSaringLabel: '💡 Ingat sebelum lanjut',
    ujiSaring:
      '<p>Pada tahap berikutnya kamu akan membaca kompilasi temuan dari keempat sumber ini ' +
      'sekaligus. Perhatikan baik-baik: tidak semua kalimat di sana adalah kebutuhan — ada ' +
      'opini pribadi, penjelasan proses lama, dan obrolan yang tidak relevan yang harus kamu ' +
      'kenali dan hindari.</p>',
    lanjutLabel: 'Lanjut: Telusuri Temuan Lapangan →'
  },

  /* ============================================================
     TAHAP 4 — Telusur temuan lapangan (PBL fase 3)
     ============================================================ */
  telusur: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Telusuri Temuan Lapangan',
    goal: 'Menandai kebutuhan informasi dan kebutuhan data dari empat sumber, sambil menghindari pengecoh.',
    instruction:
      'Ketuk frasa yang menurutmu merupakan <strong>kebutuhan informasi</strong> atau ' +
      '<strong>kebutuhan data</strong>. Hati-hati dengan opini pribadi, penjelasan proses lama, ' +
      'dan obrolan yang tidak relevan.',
    temuanLabel: 'Kebutuhan ditemukan',
    minTemuan: 8,
    revealMin: 5,
    revealLabel: 'Saya sudah buntu, tunjukkan yang terlewat',
    revealNotice: 'Kebutuhan yang terlewat sudah ditandai. Pelajari kenapa itu penting.',
    hintLabel: '💡 Masih bingung?',
    hint:
      '<p>Kebutuhan <strong>informasi</strong> biasanya berupa laporan, ringkasan, atau status ' +
      'olahan yang ingin dilihat pengguna. Kebutuhan <strong>data</strong> biasanya berupa daftar ' +
      'data mentah yang harus disimpan sistem. Keduanya berbeda dari opini pribadi, cerita ' +
      'proses lama, atau obrolan yang tidak berkaitan dengan sistem.</p>',
    legendLabel: 'Legenda:',
    kinds: {
      informasi: { label: 'Kebutuhan Informasi', icon: '📊', tone: 'success' },
      data: { label: 'Kebutuhan Data', icon: '🗂️', tone: 'success' },
      opini: { label: 'Opini/Pendapat Pribadi', icon: '💬', tone: 'warning' },
      proses: { label: 'Penjelasan Proses Lama', icon: '🔄', tone: 'info' },
      lain: { label: 'Obrolan/Tidak Relevan', icon: '🙈', tone: 'warning' }
    },
    doc: {
      code: 'TEMUAN-01',
      title: 'Kompilasi Temuan Lapangan — Perpustakaan Wira Pustaka',
      meta: [
        { label: 'Disusun oleh', value: 'Tim Analis (kamu)' },
        { label: 'Sumber', value: 'Wawancara, observasi, studi dokumen, kuesioner' }
      ],
      sections: [
        {
          heading: 'A. Kutipan Wawancara dengan Bu Rahma (Petugas Perpustakaan)',
          paras: [
            [
              { t: 'Bu Rahma bercerita, ' },
              { id: 'w1', kind: 'informasi', label: '"saya butuh laporan otomatis buku yang paling sering dipinjam setiap bulan"',
                why: 'Ini kebutuhan informasi: sebuah laporan/ringkasan yang harus dihasilkan sistem, bukan sekadar data mentah.' },
              { t: ', karena selama ini ia ' },
              { id: 'w2', kind: 'proses', label: 'merekapnya manual dari buku besar setiap akhir bulan',
                why: 'Ini menjelaskan proses lama yang berjalan sekarang — berguna sebagai konteks, tapi bukan kebutuhan itu sendiri.' },
              { t: '. Ia juga menambahkan ' },
              { id: 'w3', kind: 'opini', label: '"menurut saya aplikasi zaman sekarang harusnya secantik aplikasi belanja online"',
                why: 'Ini opini/selera pribadi, bukan kebutuhan informasi atau data yang bisa langsung dirancang.' },
              { t: ', lalu menjelaskan bahwa sistem perlu ' },
              { id: 'w4', kind: 'data', label: 'mencatat NIS peminjam, judul buku, tanggal pinjam, dan tanggal jatuh tempo',
                why: 'Ini kebutuhan data: daftar data mentah yang harus disimpan sistem.' },
              { t: '.' }
            ],
            [
              { t: 'Di sela wawancara, ' },
              { id: 'w5', kind: 'lain', label: 'Bu Rahma sempat bercerita tentang rencana renovasi ruang baca tahun depan',
                why: 'Menarik, tapi tidak relevan dengan kebutuhan sistem informasi perpustakaan yang sedang digali.' },
              { t: '. Ia menutup dengan menegaskan ' },
              { id: 'w6', kind: 'informasi', label: '"saya juga ingin tahu buku apa saja yang sudah lewat jatuh tempo tapi belum dikembalikan, tanpa harus mengecek satu per satu"',
                why: 'Ini kebutuhan informasi: sebuah daftar/ringkasan hasil olahan data, bukan data mentah semata.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'B. Catatan Observasi Alur Peminjaman',
          paras: [
            [
              { t: 'Saat diamati langsung selama satu hari, ' },
              { id: 'o1', kind: 'proses', label: 'petugas mencatat setiap peminjaman di buku besar dengan menulis tangan, memakan waktu sekitar 3-5 menit per siswa',
                why: 'Ini penjelasan proses manual yang berjalan sekarang, membantu memahami masalah tapi bukan kebutuhan sistem baru itu sendiri.' },
              { t: '. Rata-rata ' },
              { id: 'o2', kind: 'informasi', label: '40 siswa meminjam buku pada jam istirahat, sehingga antrean sering mengular',
                why: 'Ini kebutuhan informasi tersirat: sistem perlu mempercepat proses agar antrean tidak menumpuk.' },
              { t: '. Peneliti juga mencatat bahwa ' },
              { id: 'o3', kind: 'data', label: 'setiap buku memiliki kode rak dan status (tersedia/dipinjam) yang ditempel manual di sampulnya',
                why: 'Ini kebutuhan data: kode rak dan status ketersediaan buku perlu disimpan sistem.' },
              { t: ', walau ' },
              { id: 'o4', kind: 'lain', label: 'beberapa siswa terlihat mengobrol sambil menunggu giliran',
                why: 'Detail suasana, tidak relevan dengan kebutuhan sistem.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'C. Cuplikan Buku Catatan Peminjaman Manual (Studi Dokumen)',
          paras: [
            [
              { t: 'Dari buku catatan lima tahun terakhir, terlihat ' },
              { id: 'c1', kind: 'data', label: 'setiap baris berisi nomor urut, nama siswa, kelas, judul buku, tanggal pinjam, dan tanggal kembali',
                why: 'Ini kebutuhan data: kolom-kolom yang selama ini sudah dicatat manual dan wajib ada di sistem baru.' },
              { t: '. Halaman ringkasan di akhir buku menunjukkan ' },
              { id: 'c2', kind: 'informasi', label: 'jumlah total peminjaman per bulan dan lima buku dengan peminjaman terbanyak, yang selalu dihitung ulang manual',
                why: 'Ini kebutuhan informasi: laporan ringkasan yang sistem baru harus bisa hasilkan otomatis.' },
              { t: '. Sayangnya, ' },
              { id: 'c3', kind: 'lain', label: 'beberapa halaman sudah lusuh dan tulisannya sulit dibaca',
                why: 'Kondisi fisik dokumen, tidak relevan dengan kebutuhan sistem.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'D. Ringkasan Hasil Kuesioner ke 120 Siswa',
          paras: [
            [
              { id: 'k1', kind: 'informasi', label: '68% responden ingin bisa mengecek ketersediaan buku dari HP sebelum datang ke perpustakaan',
                why: 'Ini kebutuhan informasi: fitur pengecekan ketersediaan yang harus ditampilkan sistem.' },
              { t: '. Selain itu, ' },
              { id: 'k2', kind: 'data', label: 'responden diminta mencantumkan judul buku favorit yang paling ingin didigitalkan lebih dulu',
                why: 'Ini kebutuhan data: daftar judul buku prioritas yang perlu dicatat sistem.' },
              { t: '. Ada pula yang ' },
              { id: 'k3', kind: 'opini', label: 'menuliskan bahwa warna dinding perpustakaan sekarang terlihat membosankan',
                why: 'Opini tentang tampilan fisik ruangan, bukan kebutuhan sistem informasi.' },
              { t: ', sementara ' },
              { id: 'k4', kind: 'informasi', label: '45% siswa mengaku pernah kesulitan mengetahui apakah buku yang dicari sedang dipinjam orang lain atau tidak',
                why: 'Ini menegaskan kebutuhan informasi status ketersediaan buku secara langsung.' },
              { t: '.' }
            ]
          ]
        }
      ]
    },
    lanjutLabel: 'Lanjut: Saring Sumbernya →'
  },

  /* ============================================================
     TAHAP 5 — Saring sumbernya (PBL fase 3)
     ============================================================ */
  saring: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Saring Sumbernya',
    goal: 'Mengenali teknik penggalian kebutuhan yang menghasilkan tiap temuan.',
    instruction:
      'Setiap kutipan berikut berasal dari salah satu sumber temuan. Tempatkan ke kolom ' +
      'teknik yang menghasilkannya.',
    poolLabel: 'Kutipan Temuan',
    poolEmpty: 'Semua kutipan sudah ditempatkan.',
    emptyColumn: 'Belum ada kutipan di sini.',
    hintLabel: '💡 Bingung menentukan sumbernya?',
    hint:
      '<p>Perhatikan cara temuan itu didapat: tanya jawab langsung ke satu narasumber adalah ' +
      'wawancara, pengamatan langsung di lapangan adalah observasi, mempelajari catatan lama ' +
      'adalah studi dokumen, dan angka persentase dari banyak responden biasanya berasal dari ' +
      'kuesioner.</p>',
    keyboardHint: 'Pintasan: pilih kutipan lalu tekan angka 1-4 untuk menempatkannya.',
    cekLabel: 'Periksa Saringan',
    benar: 'Tepat semua! Kamu bisa mengenali sumber tiap temuan.',
    salah: 'Beberapa kutipan masih di kolom yang salah. Ketuk kutipan itu untuk memindahkannya.',
    lanjutLabel: 'Lanjut: Klasifikasikan Kebutuhan →',
    buckets: [
      { id: 'wawancara', name: 'Wawancara', desc: 'Tanya jawab langsung', colorKey: 'blue' },
      { id: 'observasi', name: 'Observasi', desc: 'Pengamatan langsung', colorKey: 'green' },
      { id: 'dokumen', name: 'Studi Dokumen', desc: 'Catatan/berkas lama', colorKey: 'orange' },
      { id: 'kuesioner', name: 'Kuesioner', desc: 'Angket ke banyak responden', colorKey: 'purple' }
    ],
    chips: [
      { id: 'sg1', label: '"Saya butuh laporan otomatis buku terpopuler tiap bulan" — dikatakan langsung oleh Bu Rahma saat ditanya', bucketId: 'wawancara',
        why: 'Diperoleh lewat tanya jawab langsung dengan narasumber — wawancara.' },
      { id: 'sg2', label: 'Petugas tercatat menulis peminjaman manual selama 3-5 menit per siswa, diamati langsung di lokasi', bucketId: 'observasi',
        why: 'Diketahui dari pengamatan langsung di lapangan — observasi.' },
      { id: 'sg3', label: 'Setiap baris di buku catatan lima tahun terakhir berisi nama, kelas, dan judul buku', bucketId: 'dokumen',
        why: 'Diperoleh dari mempelajari dokumen/catatan yang sudah ada — studi dokumen.' },
      { id: 'sg4', label: '68% dari 120 responden ingin mengecek ketersediaan buku dari HP', bucketId: 'kuesioner',
        why: 'Angka persentase dari banyak responden menandakan hasil angket — kuesioner.' },
      { id: 'sg5', label: 'Bu Rahma menjelaskan alasannya butuh notifikasi jatuh tempo saat ditanya langsung', bucketId: 'wawancara',
        why: 'Digali lewat tanya jawab langsung — wawancara.' },
      { id: 'sg6', label: 'Rata-rata 40 siswa terlihat mengantre meminjam buku saat jam istirahat', bucketId: 'observasi',
        why: 'Hasil pengamatan langsung terhadap kondisi nyata — observasi.' },
      { id: 'sg7', label: 'Halaman ringkasan buku besar menunjukkan lima buku terlaris tiap bulan', bucketId: 'dokumen',
        why: 'Ditemukan dari mempelajari dokumen lama — studi dokumen.' },
      { id: 'sg8', label: '45% siswa pada angket mengaku kesulitan mengetahui status ketersediaan buku', bucketId: 'kuesioner',
        why: 'Persentase dari hasil sebaran angket — kuesioner.' },
      { id: 'sg9', label: 'Setiap buku ternyata memiliki kode rak yang ditempel manual, terlihat saat pengamatan', bucketId: 'observasi',
        why: 'Ditemukan lewat pengamatan langsung di rak buku — observasi.' },
      { id: 'sg10', label: 'Kolom judul buku favorit yang diisi responden pada lembar angket', bucketId: 'kuesioner',
        why: 'Data yang dikumpulkan lewat lembar angket — kuesioner.' }
    ]
  },

  /* ============================================================
     TAHAP 6 — Klasifikasikan kebutuhan (PBL fase 3)
     ============================================================ */
  klasifikasi: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Klasifikasikan Kebutuhan',
    goal: 'Memilah kebutuhan fungsional, kebutuhan data, dan kebutuhan non-fungsional dari seluruh temuan.',
    step1Title: 'Langkah 1 — Kelompokkan Jenis Kebutuhannya',
    step1Instruction: 'Tempatkan tiap kebutuhan berikut ke jenisnya.',
    step1Hint:
      '<p><strong>Kebutuhan fungsional</strong> adalah fungsi/fitur yang harus dikerjakan sistem. ' +
      '<strong>Kebutuhan data</strong> adalah data mentah yang harus disimpan sistem. ' +
      '<strong>Kebutuhan non-fungsional</strong> adalah soal mutu layanan: kecepatan, kemudahan, ' +
      'atau keandalan.</p>',
    keyboardHint: 'Pintasan: pilih kebutuhan lalu tekan angka 1-3 untuk menempatkannya.',
    cekLabel: 'Periksa Kelompok',
    benar: 'Tepat semua! Kamu bisa membedakan ketiga jenis kebutuhan ini.',
    salah: 'Beberapa kebutuhan masih di kelompok yang salah. Ketuk kebutuhan itu untuk memindahkannya.',
    poolLabel: 'Kebutuhan Ditemukan',
    poolEmpty: 'Semua kebutuhan sudah dikelompokkan.',
    emptyColumn: 'Belum ada kebutuhan di sini.',
    entities: [
      { id: 'fungsional', name: 'Kebutuhan Fungsional', desc: 'Fitur/fungsi yang harus dikerjakan sistem', colorKey: 'blue', key: 'kl1' },
      { id: 'data', name: 'Kebutuhan Data', desc: 'Data mentah yang harus disimpan sistem', colorKey: 'green', key: 'kl2' },
      { id: 'nonfungsional', name: 'Kebutuhan Non-Fungsional', desc: 'Mutu layanan: kecepatan, kemudahan, keamanan', colorKey: 'purple', key: 'kl5' }
    ],
    chips: [
      { id: 'kl1', label: 'Menampilkan laporan buku terpopuler tiap bulan secara otomatis', entityId: 'fungsional',
        why: 'Ini fungsi yang harus dikerjakan sistem (menghasilkan laporan), bukan sekadar data mentah.' },
      { id: 'kl2', label: 'Menyimpan NIS peminjam, judul buku, tanggal pinjam, dan tanggal kembali', entityId: 'data',
        why: 'Ini data mentah yang perlu disimpan, belum berupa fungsi.' },
      { id: 'kl3', label: 'Menampilkan daftar buku yang sudah lewat jatuh tempo tanpa harus dicek satu per satu', entityId: 'fungsional',
        why: 'Ini fungsi mengolah data menjadi informasi siap pakai.' },
      { id: 'kl4', label: 'Menyimpan kode rak dan status ketersediaan tiap buku', entityId: 'data',
        why: 'Ini data mentah tentang buku.' },
      { id: 'kl5', label: 'Bisa diakses siswa dari HP kapan saja, dengan tampilan yang mudah dipahami', entityId: 'nonfungsional',
        why: 'Ini soal mutu layanan (kemudahan dan aksesibilitas), bukan fungsi atau data spesifik.' },
      { id: 'kl6', label: 'Menyimpan judul buku favorit yang diusulkan siswa lewat angket', entityId: 'data',
        why: 'Ini data mentah hasil angket.' },
      { id: 'kl7', label: 'Menampilkan status ketersediaan buku secara langsung', entityId: 'fungsional',
        why: 'Ini fungsi menampilkan informasi olahan dari data status buku.' },
      { id: 'kl8', label: 'Proses pencarian dan pengecekan status harus terasa cepat walau diakses banyak siswa sekaligus', entityId: 'nonfungsional',
        why: 'Ini soal performa/kecepatan (non-fungsional), bukan fitur atau data spesifik.' },
      { id: 'kl9', label: 'Menghitung dan menampilkan lima buku dengan peminjaman terbanyak per bulan', entityId: 'fungsional',
        why: 'Ini fungsi mengolah data peminjaman menjadi laporan ringkasan.' }
    ],
    step2Title: 'Langkah 2 — Saring Usulan Tambahan',
    step2Instruction:
      'Klienmu (Bu Rahma) mengajukan beberapa usulan tambahan. Pilih usulan yang layak masuk ' +
      'dokumen kebutuhan final — yakni yang benar-benar berasal dari temuan lapangan.',
    cekUsulanLabel: 'Periksa Usulan',
    benarUsulan: 'Tepat — kamu bisa memilah usulan yang relevan dari yang di luar cakupan.',
    salahUsulan: 'Belum semua tepat. Perhatikan mana usulan yang benar-benar berasal dari temuan lapangan.',
    usulan: [
      { id: 'us1', label: 'Menyimpan riwayat siapa saja yang pernah meminjam satu judul buku tertentu', simpan: true,
        why: 'Relevan — ini kebutuhan data yang mendukung laporan buku terpopuler dan pelacakan buku.' },
      { id: 'us2', label: 'Mengganti seluruh warna cat dinding perpustakaan agar lebih ceria', simpan: false,
        why: 'Ini urusan fasilitas fisik, sama sekali di luar cakupan sistem informasi.' },
      { id: 'us3', label: 'Mengirim notifikasi otomatis ke siswa H-1 sebelum jatuh tempo pengembalian', simpan: true,
        why: 'Relevan — langsung menjawab kebutuhan informasi yang digali dari wawancara dan kuesioner.' },
      { id: 'us4', label: 'Menambahkan fitur permainan di dalam aplikasi perpustakaan', simpan: false,
        why: 'Tidak relevan dengan kebutuhan yang tergali dari studi kasus ini, berpotensi memperbesar cakupan tanpa dasar temuan.' },
      { id: 'us5', label: 'Menyimpan status ketersediaan tiap buku agar bisa dicek tanpa datang langsung', simpan: true,
        why: 'Relevan — langsung menjawab kebutuhan informasi dari observasi dan kuesioner.' },
      { id: 'us6', label: 'Mengganti seluruh koleksi buku fisik menjadi e-book dalam satu tahun', simpan: false,
        why: 'Ini keputusan strategis besar di luar cakupan penggalian kebutuhan sistem peminjaman saat ini.' }
    ],
    lanjutLabel: 'Lanjut: Sajikan Hasil Karya →'
  },

  /* ============================================================
     TAHAP 7 — Sajikan hasil karya (PBL fase 4)
     ============================================================ */
  sajikan: {
    kicker: 'Fase 4 · Menyajikan Hasil Karya',
    title: 'Sajikan dan Uji Rekomendasi Teknik',
    goal: 'Menyusun Kartu Kebutuhan final, lalu menguji ketepatan pemilihan teknik pada kasus baru.',
    kartuLabel: 'Kartu Kebutuhan — Perpustakaan Wira Pustaka',
    kartuNote: 'Rangkuman kebutuhan yang berhasil kamu gali dan klasifikasikan.',
    keyBadge: 'Prioritas Utama',
    ujiLabel: 'Uji Pemilihan Teknik',
    ujiInstruction:
      'Empat tim lain di sekolah sedang merancang sistem serupa. Untuk tiap kasus, tebak ' +
      'teknik penggalian kebutuhan yang paling tepat dipakai, lalu buka jawabannya.',
    prediksiLabel: 'Tebakanmu',
    bukaLabel: 'Buka Jawaban',
    benarPrediksi: 'Tepat! Pilihanmu sejalan dengan tim ahli.',
    salahPrediksi: 'Pahami dulu pertimbangannya sebelum lanjut ke kasus berikutnya.',
    kamuLabel: 'Tim yang Tepat',
    timALabel: 'Tim yang Meleset',
    penutup: 'Kamu sudah menguji rekomendasi teknik pada empat situasi berbeda.',
    justifLabel: 'Justifikasi Akhir',
    justifPrompt: 'Jelaskan mengapa penggalian kebutuhan yang tepat penting sebelum sebuah sistem dirancang.',
    justifPlaceholder: 'Tulis alasanmu, minimal beberapa kalimat...',
    justifMin: 40,
    lanjutLabel: 'Lanjut: Evaluasi →',
    cases: [
      {
        id: 'kantin', icon: '🍱', title: 'Sistem Pemesanan Kantin Sekolah',
        scenario: 'Tim kantin ingin tahu menu apa yang paling laris tiap minggu, tapi hanya punya waktu dua hari sebelum rapat dengan kepala sekolah, dan datanya sudah tercatat rapi di nota-nota penjualan lama.',
        options: [
          { id: 'wawancara', label: 'Wawancara' },
          { id: 'observasi', label: 'Observasi' },
          { id: 'dokumen', label: 'Studi Dokumen' },
          { id: 'kuesioner', label: 'Kuesioner' }
        ],
        correct: 'dokumen',
        kamu: { verdict: 'baik', text: 'Tim yang mempelajari nota-nota penjualan lama berhasil menyusun daftar menu terlaris hanya dalam satu hari, karena datanya sudah tercatat rapi dan tidak perlu menunggu jadwal siapa pun.' },
        timA: { verdict: 'buruk', text: 'Tim lain memilih menyebar kuesioner ke seluruh siswa, tapi waktu dua hari tidak cukup untuk mengumpulkan dan mengolah jawaban sebelum rapat.' },
        konsep: 'Studi dokumen paling efisien ketika data historis sudah tersedia rapi dan waktu terbatas.'
      },
      {
        id: 'uks', icon: '🩺', title: 'Sistem Rekam Kunjungan UKS',
        scenario: 'Petugas UKS ingin memahami alasan sebenarnya di balik keluhan siswa yang sering bolak-balik berobat, sesuatu yang tidak akan terlihat hanya dari data kunjungan.',
        options: [
          { id: 'wawancara', label: 'Wawancara' },
          { id: 'observasi', label: 'Observasi' },
          { id: 'dokumen', label: 'Studi Dokumen' },
          { id: 'kuesioner', label: 'Kuesioner' }
        ],
        correct: 'wawancara',
        kamu: { verdict: 'baik', text: 'Tim yang mewawancarai petugas UKS berhasil menggali cerita di balik pola kunjungan berulang — ternyata banyak siswa datang karena kelelahan akibat jadwal ekstrakurikuler yang padat, bukan sekadar sakit.' },
        timA: { verdict: 'buruk', text: 'Tim lain hanya menganalisis angka kunjungan dari dokumen lama, sehingga tidak menemukan alasan di balik pola tersebut.' },
        konsep: 'Wawancara unggul menggali alasan dan konteks di balik sebuah kejadian, yang tidak tertangkap dari data saja.'
      },
      {
        id: 'ekskul', icon: '🎭', title: 'Sistem Pendaftaran Ekstrakurikuler',
        scenario: 'Panitia ingin tahu pendapat seluruh siswa baru (300 orang) tentang ekstrakurikuler favorit mereka, dalam waktu satu minggu sebelum masa orientasi berakhir.',
        options: [
          { id: 'wawancara', label: 'Wawancara' },
          { id: 'observasi', label: 'Observasi' },
          { id: 'dokumen', label: 'Studi Dokumen' },
          { id: 'kuesioner', label: 'Kuesioner' }
        ],
        correct: 'kuesioner',
        kamu: { verdict: 'baik', text: 'Tim yang menyebar kuesioner daring berhasil mengumpulkan tanggapan dari seluruh 300 siswa baru hanya dalam tiga hari, lengkap dengan rekap otomatis.' },
        timA: { verdict: 'buruk', text: 'Tim lain mencoba mewawancarai siswa satu per satu, tapi baru sempat mewawancarai 20 orang saat batas waktu habis.' },
        konsep: 'Kuesioner paling efisien menjangkau responden dalam jumlah besar dengan waktu terbatas.'
      },
      {
        id: 'bengkel', icon: '🔧', title: 'Sistem Peminjaman Alat Bengkel Praktik',
        scenario: 'Tim ingin memahami detail alur nyata siswa meminjam dan mengembalikan alat praktik, termasuk kebiasaan yang mungkin tidak disadari atau tidak diceritakan oleh siswa sendiri.',
        options: [
          { id: 'wawancara', label: 'Wawancara' },
          { id: 'observasi', label: 'Observasi' },
          { id: 'dokumen', label: 'Studi Dokumen' },
          { id: 'kuesioner', label: 'Kuesioner' }
        ],
        correct: 'observasi',
        kamu: { verdict: 'baik', text: 'Tim yang mengamati langsung di bengkel menemukan bahwa banyak siswa meminjam alat tanpa mencatat di buku pinjam karena terburu-buru — kebiasaan yang tidak pernah terungkap lewat wawancara.' },
        timA: { verdict: 'buruk', text: 'Tim lain hanya mewawancarai siswa, dan hampir semua menjawab "saya selalu mencatat", padahal kenyataannya berbeda.' },
        konsep: 'Observasi mengungkap kebiasaan nyata yang kadang tidak disadari atau tidak diakui oleh pelaku sendiri.'
      }
    ]
  },

  /* ============================================================
     TAHAP 8 — Evaluasi pada kasus lain (PBL fase 5)
     ============================================================ */
  evaluasi: {
    kicker: 'Fase 5 · Menganalisis dan Mengevaluasi',
    title: 'Evaluasi: Uji pada Kasus Lain',
    goal: 'Membuktikan pemahamanmu tentang penggalian kebutuhan berlaku pada kasus baru.',
    instruction: 'Bacalah cuplikan kasus berikut, lalu jawab soal-soal di bawahnya.',
    dokLabel: 'CUPLIKAN-02',
    dokumen:
      '<p>Pembina ekstrakurikuler Futsal SMK Cendekia Bangsa mengeluhkan presensi latihan yang ' +
      'masih dicatat di kertas dan sering hilang. Sebelum tim programmer merancang sistem ' +
      'presensi digital, kepala sekolah meminta mereka menggali kebutuhan terlebih dahulu: ' +
      'mewawancarai pembina, mengamati langsung sesi latihan, mempelajari kertas presensi ' +
      'lama, dan menyebar angket singkat ke seluruh anggota ekskul.</p>',
    questions: [
      {
        id: 'e1',
        prompt: 'Teknik apa yang paling tepat dipakai untuk memahami kebiasaan siswa saat presensi (misalnya siapa yang sering datang terlambat tanpa mau mengaku)?',
        options: [
          { id: 'a', label: 'Wawancara' }, { id: 'b', label: 'Observasi' },
          { id: 'c', label: 'Kuesioner' }, { id: 'd', label: 'Studi Dokumen' }
        ],
        correct: 'b',
        explanation: 'Observasi mengungkap kebiasaan nyata yang mungkin tidak diakui lewat wawancara atau angket.'
      },
      {
        id: 'e2',
        prompt: 'Mempelajari kertas presensi lama untuk mengetahui pola kehadiran selama ini termasuk teknik...',
        options: [
          { id: 'a', label: 'Wawancara' }, { id: 'b', label: 'Observasi' },
          { id: 'c', label: 'Kuesioner' }, { id: 'd', label: 'Studi Dokumen' }
        ],
        correct: 'd',
        explanation: 'Mempelajari catatan/berkas yang sudah ada adalah studi dokumen.'
      },
      {
        id: 'e3',
        prompt: "'Sistem harus menyimpan nama siswa, tanggal latihan, dan status hadir/izin/alpa' adalah contoh dari...",
        options: [
          { id: 'a', label: 'Kebutuhan Fungsional' }, { id: 'b', label: 'Kebutuhan Data' },
          { id: 'c', label: 'Kebutuhan Non-Fungsional' }, { id: 'd', label: 'Bukan kebutuhan' }
        ],
        correct: 'b',
        explanation: 'Ini daftar data mentah yang harus disimpan sistem — kebutuhan data.'
      },
      {
        id: 'e4',
        prompt: "'Sistem harus bisa menampilkan rekap kehadiran tiap siswa secara otomatis di akhir bulan' adalah contoh dari...",
        options: [
          { id: 'a', label: 'Kebutuhan Fungsional' }, { id: 'b', label: 'Kebutuhan Data' },
          { id: 'c', label: 'Kebutuhan Non-Fungsional' }, { id: 'd', label: 'Bukan kebutuhan' }
        ],
        correct: 'a',
        explanation: 'Ini fungsi mengolah data presensi menjadi laporan — kebutuhan fungsional.'
      },
      {
        id: 'e5',
        prompt: "'Sistem harus tetap bisa diakses walau sinyal internet di lapangan lemah' adalah contoh dari...",
        options: [
          { id: 'a', label: 'Kebutuhan Fungsional' }, { id: 'b', label: 'Kebutuhan Data' },
          { id: 'c', label: 'Kebutuhan Non-Fungsional' }, { id: 'd', label: 'Bukan kebutuhan' }
        ],
        correct: 'c',
        explanation: 'Ini soal mutu/keandalan layanan, bukan fitur atau data spesifik — kebutuhan non-fungsional.'
      },
      {
        id: 'e6',
        prompt: 'Untuk mengetahui pendapat seluruh 45 anggota ekskul dengan cepat tentang jam latihan favorit mereka, teknik paling efisien adalah...',
        options: [
          { id: 'a', label: 'Wawancara' }, { id: 'b', label: 'Observasi' },
          { id: 'c', label: 'Kuesioner' }, { id: 'd', label: 'Studi Dokumen' }
        ],
        correct: 'c',
        explanation: 'Kuesioner paling efisien menjangkau banyak responden sekaligus dalam waktu singkat.'
      },
      {
        id: 'e7',
        prompt: 'Mengapa penting menggabungkan lebih dari satu teknik penggalian kebutuhan, bukan hanya satu saja?',
        options: [
          { id: 'a', label: 'Karena setiap teknik punya kelebihan dan sudut pandang berbeda, sehingga saling melengkapi' },
          { id: 'b', label: 'Karena satu teknik saja dianggap kurang profesional' },
          { id: 'c', label: 'Karena semakin banyak teknik, proyeknya semakin terlihat serius' },
          { id: 'd', label: 'Karena tidak ada aturan bakunya, jadi sekadar ikut kebiasaan' }
        ],
        correct: 'a',
        explanation: 'Menggabungkan teknik menutupi kelemahan masing-masing — wawancara menggali alasan, observasi menangkap kebiasaan nyata, dokumen memberi data historis, kuesioner menjangkau banyak orang.'
      }
    ],
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt: 'Simpulkan, apa yang membedakan kebutuhan informasi, kebutuhan data, dan kebutuhan non-fungsional?',
    kesimpulanPlaceholder: 'Tulis kesimpulanmu di sini...',
    kesimpulanMin: 40,
    cekLabel: 'Periksa Jawaban',
    ulangLabel: 'Kerjakan Ulang',
    lanjutLabel: 'Lanjut: Refleksi →'
  },

  /* ============================================================
     TAHAP 9 — Refleksi (PBL fase 5)
     ============================================================ */
  refleksi: {
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
      { id: 'r1', text: 'Saya bisa membedakan wawancara, observasi, kuesioner, dan studi dokumen.' },
      { id: 'r2', text: 'Saya bisa membedakan kebutuhan fungsional, kebutuhan data, dan kebutuhan non-fungsional.' },
      { id: 'r3', text: 'Saya merasa yakin memilih teknik penggalian kebutuhan yang tepat untuk situasi baru.' },
      { id: 'r4', text: 'Saya memahami mengapa menggali kebutuhan langsung ke pengguna lebih baik daripada menebak-nebak.' },
      { id: 'r5', text: 'Saya siap menerapkan teknik penggalian kebutuhan ini pada proyek nyata.' }
    ],
    prompts: [
      { id: 'p1', question: 'Teknik penggalian kebutuhan mana yang paling ingin kamu coba praktikkan langsung? Mengapa?', placeholder: 'Tulis jawabanmu...' },
      { id: 'p2', question: 'Ceritakan satu momen kamu (atau timmu) pernah membuat sesuatu tanpa menggali kebutuhan orang lain terlebih dahulu. Apa akibatnya?', placeholder: 'Tulis pengalamanmu...' }
    ],
    simpanLabel: 'Simpan Refleksi',
    tersimpan: 'Refleksi tersimpan.',
    lanjutLabel: 'Selesai →'
  },

  /* ============================================================
     TAHAP 10 — Selesai
     ============================================================ */
  selesai: {
    kicker: 'Penutup',
    title: 'Selesai!',
    skorLabel: 'Rincian Skor',
    kartuLabel: 'Kartu Kebutuhan Final',
    kesimpulanLabel: 'Kesimpulanmu (Tahap Evaluasi)',
    justifLabel: 'Justifikasimu (Tahap Sajikan)',
    konsepKunci: [
      'Penggalian kebutuhan adalah proses menggali kebutuhan informasi dan data langsung dari studi kasus sistem, bukan menebak-nebak.',
      'Empat teknik utama: wawancara, observasi, kuesioner/angket, dan studi dokumen — masing-masing punya kekuatan berbeda.',
      'Kebutuhan fungsional adalah fungsi yang harus dikerjakan sistem, kebutuhan data adalah data mentah yang harus disimpan, dan kebutuhan non-fungsional adalah mutu layanan.',
      'Menggabungkan beberapa teknik sekaligus menghasilkan gambaran kebutuhan yang lebih lengkap dan akurat.',
      'Kebutuhan yang tergali dengan baik menjadi dasar yang kuat sebelum sistem dirancang.'
    ],
    lanjutLabel: 'Langkah Selanjutnya',
    lanjut: [
      'Coba praktikkan wawancara singkat dengan teman sekelas tentang kebutuhan aplikasi sederhana.',
      'Pelajari materi berikutnya tentang merancang basis data dari hasil penggalian kebutuhan ini.',
      'Diskusikan dengan gurumu, teknik apa yang paling relevan untuk proyek akhir kelasmu.'
    ],
    ulangLabel: 'Ulangi dari Awal',
    berandaLabel: 'Kembali ke Beranda',
    ulangKonfirmasi: 'Reset seluruh progres materi ini? Semua jawaban dan urutan acak akan dihapus.'
  }
};

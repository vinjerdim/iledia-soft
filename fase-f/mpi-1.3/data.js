'use strict';

/* ============================================================
   data.js — seluruh konten materi 1.3
   ============================================================
   Studi kasus: Sistem Informasi Praktik Kerja Lapangan (PKL),
   SMK Cendekia Bangsa. Percobaan pertama gagal karena vendor
   merancang satu tabel besar tanpa memisahkan data ke entitasnya
   masing-masing. Murid berperan sebagai tim analis (lanjutan dari
   materi 1.2) yang kini mengidentifikasi entitas dan atribut yang
   relevan dari hasil analisis kebutuhan, sebelum basis data
   dirancang ulang.
   ============================================================ */

var DATA = {

  /* ============================================================
     TAHAP 1 — Orientasi
     ============================================================ */
  orientasi: {
    kicker: 'Prolog',
    title: 'Selamat Datang Kembali, Tim Analis',
    goal: 'Memahami alur belajar dan peranmu dalam mengidentifikasi entitas dan atribut dari hasil analisis kebutuhan.',
    salam:
      'Setelah berhasil menggali kebutuhan Sistem Informasi Perpustakaan, Kepala Program RPL kini ' +
      'menugaskanmu pada proyek baru: Sistem Informasi Praktik Kerja Lapangan (PKL). Bagian ' +
      'Hubungan Industri (Hubin) sudah mengumpulkan hasil analisis kebutuhan — tugasmu sekarang ' +
      'adalah mengidentifikasi entitas dan atribut yang relevan dari hasil itu, sebelum basis ' +
      'datanya dirancang.',
    tujuanLabel: 'Tujuan Pembelajaran',
    tujuan: [
      'Mengidentifikasi entitas yang relevan dari hasil analisis kebutuhan sistem.',
      'Mengidentifikasi atribut yang melekat pada tiap entitas.',
      'Menentukan atribut kunci (primary key) yang tepat untuk tiap entitas.',
      'Memilah entitas dan atribut yang benar-benar relevan dari yang di luar cakupan, duplikat, atau hasil olahan.'
    ],
    alurLabel: 'Alur Belajar (Problem Based Learning)',
    alur: [
      { title: 'Pahami Masalah', desc: 'Menelaah kegagalan sistem PKL lama akibat tidak memisahkan data ke entitasnya.' },
      { title: 'Bekal Konsep', desc: 'Mengenal entitas, atribut, atribut kunci, dan teknik kata benda lewat kartu konsep dan latihan menjodohkan.' },
      { title: 'Telusuri Temuan Lapangan', desc: 'Menandai calon entitas dan atribut pada kutipan wawancara, observasi, dokumen, dan kuesioner.' },
      { title: 'Kelompokkan ke Entitas', desc: 'Menempatkan tiap atribut ke entitas yang tepat.' },
      { title: 'Klasifikasikan Atribut Kunci', desc: 'Memilah atribut kunci, atribut biasa, dan yang tidak relevan, lalu menyaring usulan tambahan.' },
      { title: 'Sajikan dan Uji', desc: 'Menyusun Kartu Entitas, lalu menguji identifikasi pada kasus baru.' },
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
    title: 'Sistem PKL yang Tercampur Aduk',
    goal: 'Membedakan akar masalah (gagal mengidentifikasi entitas & atribut) dari gejala-gejala yang tampak.',
    briefLabel: 'Latar Belakang',
    brief:
      '<p>Tahun lalu, sekolah sempat memakai jasa vendor luar untuk membangun sistem pencatatan PKL ' +
      'secara tergesa-gesa. Vendor langsung merancang satu tabel besar bernama "Data_PKL" yang ' +
      'mencampur data siswa, DU/DI, pembimbing, dan jurnal harian dalam satu baris per catatan, ' +
      'tanpa lebih dulu mempelajari hasil analisis kebutuhan dari tim Hubin.</p>' +
      '<p>Beberapa bulan berjalan, staf Hubungan Industri (Hubin) kewalahan menggunakannya.</p>',
    kutipan:
      'Setiap kali entri jurnal harian, saya harus mengetik ulang nama dan alamat perusahaan dari ' +
      'awal — capek, dan sering typo beda-beda setiap kali diinput ulang.',
    kejadianLabel: 'Yang Terjadi',
    kejadian: [
      {
        tim: 'Vendor Luar (tahun lalu)',
        hasil: 'Merancang satu tabel besar "Data_PKL" yang mencampur data siswa, DU/DI, pembimbing, dan jurnal harian dalam satu baris per catatan.'
      },
      {
        tim: 'Hasil di Lapangan',
        hasil: 'Staf Hubin kewalahan: nama dan alamat perusahaan yang sama harus diketik ulang untuk tiap siswa, dan data pembimbing sering tidak konsisten.'
      }
    ],
    insiden:
      'Kepala Program RPL akhirnya menghentikan sistem lama itu dan menugaskan tim analis — kamu — ' +
      'untuk merancang ulang, dimulai dari mengidentifikasi entitas dan atribut yang relevan dari ' +
      'hasil analisis kebutuhan sebelum basis data dirancang.',
    instruction:
      'Dari laporan evaluasi sistem lama berikut, pilih pernyataan yang merupakan <strong>akar masalah</strong> ' +
      '(penyebab), bukan sekadar gejala yang tampak di permukaan.',
    statements: [
      { id: 'm1', text: 'Vendor tidak pernah memisahkan data siswa, DU/DI, pembimbing, dan jurnal ke dalam kelompok data (entitas) masing-masing sebelum merancang tabel.', valid: true,
        feedback: 'Benar — ini akar masalah: tanpa memisahkan data ke entitasnya, satu tabel jadi mencampur banyak hal berbeda sekaligus.' },
      { id: 'm2', text: 'Nama dan alamat perusahaan harus diketik ulang setiap kali entri jurnal baru dibuat.', valid: false,
        feedback: 'Ini gejala (akibat) — data DU/DI yang berulang adalah dampak dari tidak dipisahkannya entitas DU/DI sendiri, bukan penyebabnya.' },
      { id: 'm3', text: 'Vendor tidak pernah mempelajari hasil analisis kebutuhan untuk menentukan atribut kunci tiap kelompok data.', valid: true,
        feedback: 'Benar — tanpa atribut kunci yang jelas, sistem tidak bisa membedakan satu data dari data lain yang mirip.' },
      { id: 'm4', text: 'Aplikasi terasa lambat saat dibuka bersamaan oleh banyak siswa.', valid: false,
        feedback: 'Ini gejala teknis performa, bukan soal identifikasi entitas dan atribut.' },
      { id: 'm5', text: 'Rancangan tabel hanya ditentukan sepihak oleh vendor tanpa mempelajari hasil analisis kebutuhan dari tim Hubin.', valid: true,
        feedback: 'Benar — merancang tabel tanpa mempelajari hasil analisis kebutuhan membuat entitas dan atributnya sekadar tebakan.' },
      { id: 'm6', text: 'Data pembimbing sekolah dan pembimbing industri sering tertukar karena dicampur dalam satu kolom yang sama.', valid: false,
        feedback: 'Ini gejala — akibat dari atribut/entitas pembimbing yang tidak dipisahkan dengan jelas, bukan penyebab utamanya.' },
      { id: 'm7', text: 'Tidak ada daftar entitas dan atribut yang disepakati bersama sebelum pengembangan sistem dimulai.', valid: true,
        feedback: 'Benar — tanpa daftar entitas dan atribut yang disepakati, tim tidak punya acuan bersama saat merancang basis data.' }
    ],
    cekLabel: 'Periksa Pilihanku',
    ownLabel: 'Rumusan Masalahmu',
    ownPrompt: "Tulis satu kalimat rumusan masalah untuk proyek ini (format: 'Bagaimana ... agar ...').",
    ownPlaceholder: 'Contoh: Bagaimana tim analis dapat mengidentifikasi entitas dan atribut yang relevan dari hasil analisis kebutuhan sebelum basis data Sistem Informasi PKL dirancang?',
    ownMin: 30,
    lanjutLabel: 'Lanjut: Bekal Konsep →'
  },

  /* ============================================================
     TAHAP 3 — Mengorganisasikan belajar (PBL fase 2)
     ============================================================ */
  bekal: {
    kicker: 'Fase 2 · Mengorganisasikan Belajar',
    title: 'Bekal: Entitas, Atribut, dan Atribut Kunci',
    goal: 'Mengenal konsep entitas, atribut, atribut kunci, dan teknik menjaringnya dari kalimat kebutuhan.',
    instruction: 'Ketuk tiap kartu untuk membuka penjelasannya.',
    cards: [
      { id: 'entitas', icon: '🗂️', term: 'Entitas',
        def: 'Objek, orang, atau konsep nyata yang datanya perlu disimpan dan dikelola oleh sistem — biasanya berupa kata benda utama dalam kalimat kebutuhan.',
        example: 'Contoh: pada Sistem Informasi PKL, "siswa", "DU/DI (perusahaan)", "pembimbing", dan "jurnal kegiatan" masing-masing adalah entitas.' },
      { id: 'atribut', icon: '🏷️', term: 'Atribut',
        def: 'Detail atau karakteristik yang melekat pada satu entitas tertentu, menjelaskan data apa saja yang perlu disimpan tentang entitas itu.',
        example: 'Contoh: entitas "Siswa PKL" memiliki atribut NIS, nama siswa, kelas, dan nomor HP orang tua.' },
      { id: 'kunci', icon: '🔑', term: 'Atribut Kunci (Primary Key)',
        def: 'Atribut yang nilainya unik dan tidak boleh sama antara satu data dengan data lain pada entitas yang sama, sehingga bisa membedakan tiap datanya.',
        example: 'Contoh: NIS adalah atribut kunci entitas Siswa PKL karena tiap siswa memiliki NIS yang berbeda.' },
      { id: 'katabenda', icon: '🔍', term: 'Teknik Kata Benda (Noun Spotting)',
        def: 'Teknik menandai kata benda pada tiap kalimat kebutuhan untuk menjaring calon entitas (kata benda utama) dan calon atribut (kata benda pendukung/detail).',
        example: 'Contoh: pada kalimat "sistem harus menyimpan NIS dan nama siswa", kata benda "siswa" menjaring calon entitas, sedangkan "NIS" dan "nama" menjaring calon atributnya.' },
      { id: 'relevansi', icon: '🧭', term: 'Relevansi',
        def: 'Proses memilah entitas dan atribut yang benar-benar didukung oleh temuan hasil analisis kebutuhan, dari yang di luar cakupan, duplikat, atau hasil olahan (bukan data mentah).',
        example: 'Contoh: "warna seragam PKL" bukan atribut yang relevan untuk Sistem Informasi PKL karena tidak berkaitan dengan data yang perlu dikelola sistem.' }
    ],
    terms: [
      { id: 't1', label: 'Entitas' },
      { id: 't2', label: 'Atribut' },
      { id: 't3', label: 'Atribut Kunci (Primary Key)' },
      { id: 't4', label: 'Teknik Kata Benda (Noun Spotting)' },
      { id: 't5', label: 'Relevansi' }
    ],
    defs: [
      { id: 'd1', label: 'Objek/orang/konsep nyata yang datanya perlu disimpan sistem, biasanya berupa kata benda utama' },
      { id: 'd2', label: 'Detail/karakteristik yang melekat pada satu entitas tertentu' },
      { id: 'd3', label: 'Atribut yang nilainya unik, membedakan satu data dari data lain pada entitas yang sama' },
      { id: 'd4', label: 'Teknik menandai kata benda pada kalimat kebutuhan untuk menjaring calon entitas dan atribut' },
      { id: 'd5', label: 'Proses memilah entitas/atribut yang benar-benar didukung temuan dari yang di luar cakupan atau duplikat' }
    ],
    key: { t1: 'd1', t2: 'd2', t3: 'd3', t4: 'd4', t5: 'd5' },
    ujiTitle: 'Uji Pemahaman: Jodohkan Istilah dengan Pengertiannya',
    ujiInstruction: 'Ketuk satu istilah, lalu ketuk pengertian yang paling tepat untuknya.',
    cekLabel: 'Periksa Jodohnya',
    ulangLabel: 'Ulang Jodohkan',
    rencanaLabel: 'Rencana Identifikasi Entitas & Atributmu',
    rencana: [
      { title: 'Baca ulang dokumen kebutuhan PKL', desc: 'Menandai kata benda yang berpotensi menjadi entitas dan atribut.' },
      { title: 'Kelompokkan atribut ke entitasnya', desc: 'Memastikan tiap atribut ditempatkan pada entitas yang tepat, bukan tercampur seperti sistem lama.' },
      { title: 'Tentukan atribut kunci tiap entitas', desc: 'Memilih atribut yang nilainya pasti unik untuk membedakan tiap data.' },
      { title: 'Saring usulan tambahan', desc: 'Memilah usulan yang benar-benar relevan dari yang di luar cakupan sistem.' }
    ],
    ujiSaringLabel: '💡 Ingat sebelum lanjut',
    ujiSaring:
      '<p>Pada tahap berikutnya kamu akan membaca kompilasi temuan dari keempat sumber ini ' +
      'sekaligus. Perhatikan baik-baik: tidak semua kata benda di sana adalah entitas atau ' +
      'atribut — ada kalimat kebutuhan fungsional/proses dan obrolan yang tidak relevan yang ' +
      'harus kamu kenali dan hindari.</p>',
    lanjutLabel: 'Lanjut: Telusuri Temuan Lapangan →'
  },

  /* ============================================================
     TAHAP 4 — Telusur temuan lapangan (PBL fase 3)
     ============================================================ */
  telusur: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Telusuri Temuan Lapangan',
    goal: 'Menandai calon entitas dan atribut dari empat sumber, sambil menghindari pengecoh.',
    instruction:
      'Ketuk frasa yang menurutmu merupakan <strong>calon entitas</strong> atau <strong>calon atribut</strong>. ' +
      'Hati-hati dengan kalimat yang menjelaskan fungsi/proses sistem dan bagian yang tidak relevan.',
    temuanLabel: 'Kebutuhan ditemukan',
    minTemuan: 9,
    revealMin: 6,
    revealLabel: 'Saya sudah buntu, tunjukkan yang terlewat',
    revealNotice: 'Kebutuhan yang terlewat sudah ditandai. Pelajari kenapa itu penting.',
    hintLabel: '💡 Masih bingung?',
    hint:
      '<p><strong>Entitas</strong> biasanya berupa kata benda utama yang mewakili objek/hal nyata ' +
      'yang datanya perlu dikelola tersendiri. <strong>Atribut</strong> biasanya berupa detail yang ' +
      'melekat pada entitas tersebut. Keduanya berbeda dari kalimat yang menjelaskan fungsi/proses ' +
      'sistem, atau obrolan yang tidak berkaitan dengan sistem.</p>',
    legendLabel: 'Legenda:',
    kinds: {
      entitas: { label: 'Calon Entitas', icon: '🗂️', tone: 'success' },
      atribut: { label: 'Calon Atribut', icon: '🏷️', tone: 'success' },
      fungsi: { label: 'Bukan Data (Fungsi/Proses)', icon: '⚙️', tone: 'info' },
      lain: { label: 'Obrolan/Tidak Relevan', icon: '🙈', tone: 'warning' }
    },
    doc: {
      code: 'TEMUAN-PKL-01',
      title: 'Kompilasi Temuan Hasil Analisis Kebutuhan — Sistem Informasi PKL',
      meta: [
        { label: 'Disusun oleh', value: 'Tim Analis (kamu)' },
        { label: 'Sumber', value: 'Wawancara, observasi, studi dokumen, kuesioner' }
      ],
      sections: [
        {
          heading: 'A. Kutipan Wawancara dengan Pak Bimo (Staf Hubungan Industri)',
          paras: [
            [
              { t: 'Pak Bimo menjelaskan, ' },
              { id: 'w1', kind: 'entitas', label: '"kami perlu mencatat data tiap siswa yang diberangkatkan PKL"',
                why: 'Kata benda "siswa" menjaring calon entitas: kelompok data tentang siswa PKL perlu disimpan tersendiri.' },
              { t: ', khususnya ' },
              { id: 'w2', kind: 'atribut', label: 'NIS, nama lengkap, kelas, dan nomor HP orang tua tiap siswa',
                why: 'Ini calon atribut: detail data yang melekat pada entitas Siswa PKL.' },
              { t: '. Ia menambahkan bahwa sistem harus bisa ' },
              { id: 'w3', kind: 'fungsi', label: 'menampilkan rekap jumlah siswa yang sudah dan belum ditempatkan di DU/DI',
                why: 'Ini kebutuhan fungsional (fungsi mengolah data menjadi laporan), bukan entitas atau atribut itu sendiri.' },
              { t: '.' }
            ],
            [
              { t: 'Ia juga sempat bercerita ' },
              { id: 'w4', kind: 'lain', label: 'tentang rencana studi banding ke sekolah lain tahun depan',
                why: 'Menarik, tapi tidak relevan dengan entitas/atribut Sistem Informasi PKL yang sedang digali.' },
              { t: ', lalu menegaskan bahwa ' },
              { id: 'w5', kind: 'entitas', label: 'setiap siswa perlu dicatat perusahaan atau instansi (DU/DI) tempatnya PKL',
                why: 'Kata benda "DU/DI" menjaring calon entitas baru: data tentang perusahaan/instansi mitra.' },
              { t: ', lengkap dengan ' },
              { id: 'w6', kind: 'atribut', label: 'nama perusahaan, alamat, dan bidang usahanya',
                why: 'Ini calon atribut milik entitas DU/DI.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'B. Catatan Observasi Pembekalan PKL',
          paras: [
            [
              { t: 'Saat pembekalan, terlihat ' },
              { id: 'o1', kind: 'fungsi', label: 'panitia kesulitan mencetak daftar penempatan siswa karena data perusahaan harus diketik ulang manual setiap kali dibutuhkan',
                why: 'Ini menjelaskan kendala proses lama (bukan data yang harus disimpan), meski menjadi alasan pentingnya memisahkan entitas DU/DI.' },
              { t: '. Panitia mencatat setiap siswa dibimbing oleh satu ' },
              { id: 'o2', kind: 'entitas', label: 'guru pembimbing dari sekolah maupun pembimbing dari pihak DU/DI',
                why: 'Kata benda "pembimbing" menjaring calon entitas baru: data tentang pembimbing PKL.' },
              { t: ', dengan ' },
              { id: 'o3', kind: 'atribut', label: 'nama pembimbing, asal (sekolah/industri), dan nomor HP yang dicatat pada lembar terpisah',
                why: 'Ini calon atribut milik entitas Pembimbing.' },
              { t: '. Sementara itu ' },
              { id: 'o4', kind: 'lain', label: 'beberapa siswa terlihat gugup menunggu giliran pembekalan',
                why: 'Detail suasana, tidak relevan dengan entitas atau atribut sistem.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'C. Cuplikan Dokumen Nota Kesepahaman (MoU) dengan DU/DI',
          paras: [
            [
              { t: 'Dari berkas MoU yang sudah ditandatangani, tercatat ' },
              { id: 'c1', kind: 'atribut', label: 'kode DU/DI, nama perusahaan, alamat lengkap, dan bidang usaha tiap mitra',
                why: 'Ini calon atribut entitas DU/DI, sudah tercatat rapi di dokumen MoU.' },
              { t: '. Setiap siswa yang ditempatkan wajib ' },
              { id: 'c2', kind: 'fungsi', label: 'mengisi jurnal kegiatan harian selama masa PKL berlangsung',
                why: 'Ini kebutuhan fungsional/aturan proses (mengisi jurnal), bukan atribut data itu sendiri — meski memunculkan entitas Jurnal Kegiatan pada bagian berikutnya.' },
              { t: ', yang di dalamnya berisi ' },
              { id: 'c3', kind: 'entitas', label: 'catatan kegiatan harian yang disebut jurnal kegiatan',
                why: 'Kata benda "jurnal kegiatan" menjaring calon entitas baru: catatan harian siswa selama PKL.' },
              { t: ', mencakup ' },
              { id: 'c4', kind: 'atribut', label: 'kode jurnal, tanggal, uraian kegiatan, dan status paraf pembimbing',
                why: 'Ini calon atribut milik entitas Jurnal Kegiatan.' },
              { t: '. Sayangnya ' },
              { id: 'c5', kind: 'lain', label: 'beberapa halaman MoU sudah lusuh dan tandatangannya pudar',
                why: 'Kondisi fisik dokumen, tidak relevan dengan entitas/atribut sistem.' },
              { t: '.' }
            ]
          ]
        },
        {
          heading: 'D. Ringkasan Hasil Kuesioner ke Pembimbing',
          paras: [
            [
              { id: 'k1', kind: 'fungsi', label: '92% pembimbing ingin sistem mengirim pengingat otomatis saat siswa belum mengisi jurnal lebih dari 3 hari',
                why: 'Ini kebutuhan fungsional (fitur pengingat otomatis), bukan entitas atau atribut data itu sendiri.' },
              { t: '. Selain itu, ' },
              { id: 'k2', kind: 'atribut', label: 'responden diminta mencantumkan nomor HP aktif mereka agar mudah dihubungi lewat sistem',
                why: 'Ini calon atribut milik entitas Pembimbing: nomor HP.' },
              { t: '. Ada pula yang ' },
              { id: 'k3', kind: 'lain', label: 'menuliskan bahwa formulir cetak sistem lama terlalu banyak halaman',
                why: 'Keluhan tentang formulir kertas sistem lama, tidak relevan dengan entitas/atribut sistem baru.' },
              { t: ', sementara ' },
              { id: 'k4', kind: 'entitas', label: 'beberapa pembimbing mengusulkan agar data nilai akhir PKL siswa turut disimpan dalam sistem yang sama',
                why: 'Kata benda "nilai akhir PKL" berpotensi menjaring entitas/atribut baru — relevansinya perlu ditelaah lebih lanjut pada tahap berikutnya.' },
              { t: '.' }
            ]
          ]
        }
      ]
    },
    lanjutLabel: 'Lanjut: Kelompokkan ke Entitas →'
  },

  /* ============================================================
     TAHAP 5 — Kelompokkan atribut ke entitas (PBL fase 3)
     ============================================================ */
  saring: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Kelompokkan Atribut ke Entitasnya',
    goal: 'Menempatkan tiap calon atribut ke entitas yang tepat, sesuai temuan hasil analisis kebutuhan.',
    instruction:
      'Setiap atribut berikut ditemukan dari kompilasi temuan. Tempatkan ke kolom entitas yang ' +
      'benar-benar memilikinya.',
    poolLabel: 'Atribut Ditemukan',
    poolEmpty: 'Semua atribut sudah ditempatkan.',
    emptyColumn: 'Belum ada atribut di sini.',
    hintLabel: '💡 Bingung menentukan entitasnya?',
    hint:
      '<p>Perhatikan data apa yang dijelaskan oleh atribut tersebut: bila menjelaskan siswa, ' +
      'atribut itu milik entitas Siswa PKL; bila menjelaskan perusahaan mitra, milik entitas ' +
      'DU/DI; bila menjelaskan orang yang membimbing, milik entitas Pembimbing; dan bila ' +
      'menjelaskan catatan kegiatan harian, milik entitas Jurnal Kegiatan.</p>',
    keyboardHint: 'Pintasan: pilih atribut lalu tekan angka 1-4 untuk menempatkannya.',
    cekLabel: 'Periksa Pengelompokan',
    benar: 'Tepat semua! Kamu berhasil mengelompokkan atribut ke entitas yang tepat.',
    salah: 'Beberapa atribut masih di entitas yang salah. Ketuk atribut itu untuk memindahkannya.',
    lanjutLabel: 'Lanjut: Klasifikasikan Atribut Kunci →',
    entities: [
      { id: 'siswa', name: 'Siswa PKL', desc: 'Siswa yang diberangkatkan PKL', colorKey: 'blue', key: 'sg-siswa-nis' },
      { id: 'dudi', name: 'DU/DI', desc: 'Perusahaan/instansi mitra PKL', colorKey: 'green', key: 'sg-dudi-kode' },
      { id: 'pembimbing', name: 'Pembimbing', desc: 'Pembimbing sekolah & industri', colorKey: 'orange', key: 'sg-pemb-kode' },
      { id: 'jurnal', name: 'Jurnal Kegiatan', desc: 'Catatan kegiatan harian siswa', colorKey: 'purple', key: 'sg-jurnal-kode' }
    ],
    chips: [
      { id: 'sg-siswa-nis', label: 'NIS', entityId: 'siswa',
        why: 'NIS adalah data yang melekat pada tiap siswa PKL, dan nilainya unik untuk membedakan satu siswa dari siswa lain.' },
      { id: 'sg-siswa-nama', label: 'Nama Siswa', entityId: 'siswa',
        why: 'Nama siswa adalah detail data yang menjelaskan entitas Siswa PKL.' },
      { id: 'sg-siswa-kelas', label: 'Kelas', entityId: 'siswa',
        why: 'Kelas adalah detail data yang melekat pada tiap siswa PKL.' },
      { id: 'sg-siswa-hp', label: 'No. HP Orang Tua', entityId: 'siswa',
        why: 'Nomor HP orang tua adalah data kontak yang melekat pada tiap siswa PKL.' },
      { id: 'sg-dudi-kode', label: 'Kode DU/DI', entityId: 'dudi',
        why: 'Kode DU/DI adalah data yang melekat pada tiap perusahaan mitra, dan nilainya unik untuk membedakan satu DU/DI dari DU/DI lain.' },
      { id: 'sg-dudi-nama', label: 'Nama Perusahaan', entityId: 'dudi',
        why: 'Nama perusahaan adalah detail data yang menjelaskan entitas DU/DI.' },
      { id: 'sg-dudi-alamat', label: 'Alamat', entityId: 'dudi',
        why: 'Alamat adalah detail data yang melekat pada tiap perusahaan mitra (DU/DI).' },
      { id: 'sg-dudi-bidang', label: 'Bidang Usaha', entityId: 'dudi',
        why: 'Bidang usaha adalah detail data yang menjelaskan entitas DU/DI.' },
      { id: 'sg-pemb-kode', label: 'Kode Pembimbing', entityId: 'pembimbing',
        why: 'Kode Pembimbing adalah data yang melekat pada tiap pembimbing, dan nilainya unik untuk membedakan satu pembimbing dari pembimbing lain.' },
      { id: 'sg-pemb-nama', label: 'Nama Pembimbing', entityId: 'pembimbing',
        why: 'Nama pembimbing adalah detail data yang menjelaskan entitas Pembimbing.' },
      { id: 'sg-pemb-asal', label: 'Asal (Sekolah/Industri)', entityId: 'pembimbing',
        why: 'Asal pembimbing adalah detail data yang melekat pada entitas Pembimbing.' },
      { id: 'sg-pemb-hp', label: 'No. HP', entityId: 'pembimbing',
        why: 'Nomor HP adalah data kontak yang melekat pada tiap pembimbing.' },
      { id: 'sg-jurnal-kode', label: 'Kode Jurnal', entityId: 'jurnal',
        why: 'Kode Jurnal adalah data yang melekat pada tiap catatan kegiatan, dan nilainya unik untuk membedakan satu jurnal dari jurnal lain.' },
      { id: 'sg-jurnal-tanggal', label: 'Tanggal', entityId: 'jurnal',
        why: 'Tanggal adalah detail data yang menjelaskan entitas Jurnal Kegiatan.' },
      { id: 'sg-jurnal-uraian', label: 'Uraian Kegiatan', entityId: 'jurnal',
        why: 'Uraian kegiatan adalah detail data yang melekat pada tiap catatan jurnal.' },
      { id: 'sg-jurnal-paraf', label: 'Status Paraf', entityId: 'jurnal',
        why: 'Status paraf adalah detail data yang melekat pada tiap catatan jurnal.' }
    ]
  },

  /* ============================================================
     TAHAP 6 — Klasifikasikan atribut kunci (PBL fase 3)
     ============================================================ */
  klasifikasi: {
    kicker: 'Fase 3 · Penyelidikan',
    title: 'Klasifikasikan Atribut Kunci',
    goal: 'Memilah atribut kunci, atribut biasa, dan atribut yang tidak relevan dari seluruh temuan.',
    step1Title: 'Langkah 1 — Kelompokkan Jenis Atributnya',
    step1Instruction: 'Tempatkan tiap calon atribut berikut ke jenisnya.',
    step1Hint:
      '<p><strong>Atribut kunci (primary key)</strong> adalah atribut yang nilainya pasti unik untuk ' +
      'membedakan satu data dari data lain pada entitas yang sama. <strong>Atribut biasa</strong> ' +
      'adalah detail data yang sah tapi nilainya bisa sama antar data. <strong>Bukan atribut yang ' +
      'relevan</strong> adalah data yang duplikat, hasil olahan/agregat, atau di luar cakupan ' +
      'temuan.</p>',
    keyboardHint: 'Pintasan: pilih atribut lalu tekan angka 1-3 untuk menempatkannya.',
    cekLabel: 'Periksa Kelompok',
    benar: 'Tepat semua! Kamu bisa membedakan atribut kunci, atribut biasa, dan yang tidak relevan.',
    salah: 'Beberapa atribut masih di kelompok yang salah. Ketuk atribut itu untuk memindahkannya.',
    poolLabel: 'Calon Atribut',
    poolEmpty: 'Semua atribut sudah dikelompokkan.',
    emptyColumn: 'Belum ada atribut di sini.',
    entities: [
      { id: 'kunci', name: 'Atribut Kunci (Primary Key)', desc: 'Nilainya pasti unik pada entitasnya', colorKey: 'blue' },
      { id: 'biasa', name: 'Atribut Biasa', desc: 'Detail data yang sah, nilainya bisa sama', colorKey: 'green' },
      { id: 'tidak-relevan', name: 'Bukan Atribut yang Relevan', desc: 'Duplikat, hasil olahan, atau di luar cakupan', colorKey: 'purple' }
    ],
    chips: [
      { id: 'kl1', label: 'NIS (Siswa PKL)', entityId: 'kunci',
        why: 'NIS bernilai unik untuk tiap siswa, cocok jadi atribut kunci entitas Siswa PKL.' },
      { id: 'kl2', label: 'Kode DU/DI (DU/DI)', entityId: 'kunci',
        why: 'Kode DU/DI unik untuk tiap perusahaan mitra, cocok jadi atribut kunci entitas DU/DI.' },
      { id: 'kl3', label: 'Kode Pembimbing (Pembimbing)', entityId: 'kunci',
        why: 'Kode Pembimbing unik untuk tiap pembimbing, cocok jadi atribut kunci entitas Pembimbing.' },
      { id: 'kl4', label: 'Kode Jurnal (Jurnal Kegiatan)', entityId: 'kunci',
        why: 'Kode Jurnal unik untuk tiap catatan harian, cocok jadi atribut kunci entitas Jurnal Kegiatan.' },
      { id: 'kl5', label: 'Nama Siswa (Siswa PKL)', entityId: 'biasa',
        why: 'Nama siswa adalah detail data biasa — bisa saja ada dua siswa dengan nama sama, jadi bukan atribut kunci.' },
      { id: 'kl6', label: 'Nama Perusahaan (DU/DI)', entityId: 'biasa',
        why: 'Nama perusahaan adalah detail data biasa milik entitas DU/DI, bukan atribut kunci.' },
      { id: 'kl7', label: 'Nama Pembimbing (Pembimbing)', entityId: 'biasa',
        why: 'Nama pembimbing adalah detail data biasa milik entitas Pembimbing, bukan atribut kunci.' },
      { id: 'kl8', label: 'Uraian Kegiatan (Jurnal Kegiatan)', entityId: 'biasa',
        why: 'Uraian kegiatan adalah detail data biasa milik entitas Jurnal Kegiatan, bukan atribut kunci.' },
      { id: 'kl9', label: 'Nomor Urut Cetak Laporan', entityId: 'tidak-relevan',
        why: 'Ini hanya nomor urut tampilan saat laporan dicetak, ditentukan sistem sendiri — bukan data yang perlu disimpan sebagai atribut.' },
      { id: 'kl10', label: 'Rata-rata Nilai PKL Seluruh Siswa', entityId: 'tidak-relevan',
        why: 'Ini hasil olahan/agregat dari banyak data, bukan atribut mentah yang melekat pada satu entitas.' },
      { id: 'kl11', label: 'Warna Seragam PKL', entityId: 'tidak-relevan',
        why: 'Tidak pernah muncul dalam temuan hasil analisis kebutuhan dan di luar cakupan sistem.' },
      { id: 'kl12', label: 'Alamat Rumah Pembimbing', entityId: 'tidak-relevan',
        why: 'Bukan kebutuhan yang tergali — temuan hanya menyebutkan nomor HP pembimbing yang perlu dicatat, bukan alamat rumahnya.' }
    ],
    step2Title: 'Langkah 2 — Saring Usulan Tambahan',
    step2Instruction:
      'Kaprog RPL mengajukan beberapa usulan tambahan. Pilih usulan yang layak masuk dokumen ' +
      'entitas dan atribut final — yakni yang benar-benar berasal dari temuan hasil analisis ' +
      'kebutuhan.',
    cekUsulanLabel: 'Periksa Usulan',
    benarUsulan: 'Tepat — kamu bisa memilah usulan yang relevan dari yang di luar cakupan.',
    salahUsulan: 'Belum semua tepat. Perhatikan mana usulan yang benar-benar berasal dari temuan hasil analisis kebutuhan.',
    usulan: [
      { id: 'us1', label: 'Menyimpan riwayat DU/DI yang pernah menerima siswa PKL dari sekolah (untuk referensi penempatan tahun berikutnya)', simpan: true,
        why: 'Relevan — mendukung entitas DU/DI dan riwayat penempatan yang tergali dari kebutuhan Hubin.' },
      { id: 'us2', label: 'Mengganti seluruh logo sekolah pada surat pengantar PKL agar lebih modern', simpan: false,
        why: 'Ini urusan desain administrasi, di luar cakupan Sistem Informasi PKL.' },
      { id: 'us3', label: 'Mengirim pengingat otomatis ke pembimbing bila siswa belum mengisi jurnal lebih dari 3 hari', simpan: true,
        why: 'Relevan — menjawab kebutuhan fungsional dari kuesioner pembimbing, dan didukung atribut tanggal serta status paraf jurnal yang sudah teridentifikasi.' },
      { id: 'us4', label: 'Menambahkan fitur obrolan (chat) antar siswa PKL di dalam sistem', simpan: false,
        why: 'Tidak relevan dengan kebutuhan yang tergali dari studi kasus ini, memperluas cakupan tanpa dasar temuan.' },
      { id: 'us5', label: 'Menyimpan status paraf pembimbing pada tiap jurnal kegiatan agar mudah dipantau', simpan: true,
        why: 'Relevan — langsung menjawab atribut Jurnal Kegiatan yang tergali dari wawancara dan dokumen MoU.' },
      { id: 'us6', label: 'Mengubah seluruh proses PKL menjadi sepenuhnya daring tanpa kunjungan langsung ke DU/DI', simpan: false,
        why: 'Ini keputusan kebijakan besar di luar cakupan identifikasi entitas dan atribut sistem saat ini.' }
    ],
    lanjutLabel: 'Lanjut: Sajikan Hasil Karya →'
  },

  /* ============================================================
     TAHAP 7 — Sajikan hasil karya (PBL fase 4)
     ============================================================ */
  sajikan: {
    kicker: 'Fase 4 · Menyajikan Hasil Karya',
    title: 'Sajikan dan Uji Identifikasi Entitas & Atribut',
    goal: 'Menyusun Kartu Entitas final, lalu menguji ketepatan identifikasi pada kasus baru.',
    kartuLabel: 'Kartu Entitas — Sistem Informasi PKL',
    kartuNote: 'Rangkuman entitas dan atribut yang berhasil kamu identifikasi dan kelompokkan.',
    keyBadge: 'Atribut Kunci',
    ujiLabel: 'Uji Identifikasi Entitas & Atribut',
    ujiInstruction:
      'Empat tim lain di sekolah sedang merancang sistem serupa. Untuk tiap kasus, tebak apakah ' +
      'istilah yang disebutkan merupakan entitas, atribut, atau atribut kunci, lalu buka jawabannya.',
    prediksiLabel: 'Tebakanmu',
    bukaLabel: 'Buka Jawaban',
    benarPrediksi: 'Tepat! Pilihanmu sejalan dengan tim ahli.',
    salahPrediksi: 'Pahami dulu pertimbangannya sebelum lanjut ke kasus berikutnya.',
    kamuLabel: 'Tim yang Tepat',
    timALabel: 'Tim yang Meleset',
    penutup: 'Kamu sudah menguji identifikasi entitas, atribut, dan atribut kunci pada empat situasi berbeda.',
    justifLabel: 'Justifikasi Akhir',
    justifPrompt: 'Jelaskan mengapa mengidentifikasi entitas dan atribut dengan tepat penting sebelum basis data sebuah sistem dirancang.',
    justifPlaceholder: 'Tulis alasanmu, minimal beberapa kalimat...',
    justifMin: 40,
    lanjutLabel: 'Lanjut: Evaluasi →',
    cases: [
      {
        id: 'ekskul', icon: '🏃', title: 'Sistem Presensi Ekstrakurikuler',
        scenario: 'Tim ekskul futsal ingin mencatat kehadiran tiap anggota di setiap sesi latihan. Salah satu data yang mereka rancang adalah "NIS anggota", yang nilainya berbeda untuk tiap siswa dan dipakai untuk membedakan satu anggota dari anggota lain.',
        options: [
          { id: 'entitas', label: 'Entitas' },
          { id: 'atribut', label: 'Atribut' },
          { id: 'kunci', label: 'Atribut Kunci (Primary Key)' }
        ],
        correct: 'kunci',
        kamu: { verdict: 'baik', text: 'Tim yang menandai "NIS anggota" sebagai atribut kunci berhasil merancang data Anggota Ekskul yang bisa membedakan tiap anggota dengan pasti, bahkan bila ada nama yang sama.' },
        timA: { verdict: 'buruk', text: 'Tim lain hanya menandainya sebagai "atribut biasa", sehingga sempat bingung saat dua anggota kebetulan bernama sama.' },
        konsep: 'Atribut kunci adalah atribut yang nilainya dipastikan unik dan dipakai untuk membedakan satu data dari data lainnya.'
      },
      {
        id: 'lab', icon: '💻', title: 'Sistem Reservasi Lab Komputer',
        scenario: 'Tim TI sekolah merancang sistem reservasi lab komputer. Salah satu kata benda yang mereka temukan dalam dokumen kebutuhan adalah "ruang lab" — kelompok data yang perlu dicatat sendiri, lengkap dengan kode ruang, kapasitas, dan lokasinya.',
        options: [
          { id: 'entitas', label: 'Entitas' },
          { id: 'atribut', label: 'Atribut' },
          { id: 'kunci', label: 'Atribut Kunci (Primary Key)' }
        ],
        correct: 'entitas',
        kamu: { verdict: 'baik', text: 'Tim yang menandai "ruang lab" sebagai entitas berhasil membuat kelompok data tersendiri untuk tiap ruang lab, lengkap dengan atribut kode ruang, kapasitas, dan lokasi.' },
        timA: { verdict: 'buruk', text: 'Tim lain menandainya sebagai atribut dari entitas "reservasi", sehingga data ruang lab jadi terulang setiap kali ada reservasi baru.' },
        konsep: 'Entitas adalah kata benda utama yang mewakili objek/hal nyata yang datanya perlu dikelola tersendiri, bukan sekadar detail dari objek lain.'
      },
      {
        id: 'lomba', icon: '🏆', title: 'Sistem Pendaftaran Lomba Antar Kelas',
        scenario: 'Panitia lomba merancang sistem pendaftaran. Mereka menemukan bahwa "nama tim" adalah data yang melekat pada entitas Tim Peserta, menjelaskan detail data tim tersebut.',
        options: [
          { id: 'entitas', label: 'Entitas' },
          { id: 'atribut', label: 'Atribut' },
          { id: 'kunci', label: 'Atribut Kunci (Primary Key)' }
        ],
        correct: 'atribut',
        kamu: { verdict: 'baik', text: 'Tim yang menandai "nama tim" sebagai atribut berhasil menempatkannya sebagai bagian data pada entitas Tim Peserta yang sudah ada.' },
        timA: { verdict: 'buruk', text: 'Tim lain sempat menganggapnya sebagai entitas terpisah, sehingga muncul kelompok data baru yang sebenarnya tidak perlu.' },
        konsep: 'Atribut adalah detail/karakteristik yang melekat pada satu entitas, bukan kelompok data yang berdiri sendiri.'
      },
      {
        id: 'bengkel', icon: '🔧', title: 'Sistem Peminjaman Alat Bengkel Praktik',
        scenario: 'Tim bengkel menemukan bahwa "kode alat" bernilai unik untuk tiap alat praktik, dan dipakai untuk mencocokkan alat mana yang sedang dipinjam.',
        options: [
          { id: 'entitas', label: 'Entitas' },
          { id: 'atribut', label: 'Atribut' },
          { id: 'kunci', label: 'Atribut Kunci (Primary Key)' }
        ],
        correct: 'kunci',
        kamu: { verdict: 'baik', text: 'Tim yang menandai "kode alat" sebagai atribut kunci berhasil melacak status tiap alat dengan tepat, bahkan bila ada alat dengan nama yang sama.' },
        timA: { verdict: 'buruk', text: 'Tim lain hanya mengandalkan "nama alat" sebagai penanda, sehingga tertukar saat ada dua alat dengan nama yang sama.' },
        konsep: 'Atribut kunci dipilih dari atribut yang nilainya pasti unik, bukan sekadar atribut yang paling mudah dibaca.'
      }
    ]
  },

  /* ============================================================
     TAHAP 8 — Evaluasi pada kasus lain (PBL fase 5)
     ============================================================ */
  evaluasi: {
    kicker: 'Fase 5 · Menganalisis dan Mengevaluasi',
    title: 'Evaluasi: Uji pada Kasus Lain',
    goal: 'Membuktikan pemahamanmu tentang identifikasi entitas dan atribut berlaku pada kasus baru.',
    instruction: 'Bacalah cuplikan kasus berikut, lalu jawab soal-soal di bawahnya.',
    dokLabel: 'CUPLIKAN-02',
    dokumen:
      '<p>Tim BKK (Bursa Kerja Khusus) SMK Cendekia Bangsa ingin membangun Sistem Pendataan Alumni ' +
      'untuk tracer study. Sebelum basis data dirancang, kepala sekolah meminta tim menggali dan ' +
      'mengidentifikasi entitas serta atributnya lebih dulu: mewawancarai alumni, mempelajari data ' +
      'ijazah lama, dan menyebar kuesioner tracer study ke lulusan tiga tahun terakhir. Hasil ' +
      'sementara menunjukkan sistem perlu mencatat data tiap alumni (NISN, nama, tahun lulus, nomor ' +
      'HP aktif) serta data perusahaan tempat alumni bekerja saat ini (nama perusahaan, bidang ' +
      'usaha).</p>',
    questions: [
      {
        id: 'e1',
        prompt: 'Kata benda "alumni" pada dokumen di atas paling tepat dianggap sebagai...',
        options: [
          { id: 'a', label: 'Entitas' }, { id: 'b', label: 'Atribut' },
          { id: 'c', label: 'Fungsi/proses' }, { id: 'd', label: 'Tidak relevan' }
        ],
        correct: 'a',
        explanation: 'Kata benda "alumni" mewakili kelompok data yang perlu dikelola tersendiri — sebuah entitas.'
      },
      {
        id: 'e2',
        prompt: '"Nomor HP aktif" pada dokumen di atas paling tepat dianggap sebagai...',
        options: [
          { id: 'a', label: 'Entitas' }, { id: 'b', label: 'Atribut' },
          { id: 'c', label: 'Atribut Kunci' }, { id: 'd', label: 'Bukan data' }
        ],
        correct: 'b',
        explanation: 'Nomor HP adalah detail data yang melekat pada entitas Alumni — sebuah atribut, bukan atribut kunci karena nilainya bisa berubah dan tidak dijamin unik.'
      },
      {
        id: 'e3',
        prompt: 'Dari data yang disebutkan, atribut manakah yang paling tepat dijadikan atribut kunci entitas Alumni?',
        options: [
          { id: 'a', label: 'Nama' }, { id: 'b', label: 'Tahun lulus' },
          { id: 'c', label: 'NISN' }, { id: 'd', label: 'Nomor HP' }
        ],
        correct: 'c',
        explanation: 'NISN bernilai unik untuk tiap siswa/alumni, sehingga paling tepat dijadikan atribut kunci.'
      },
      {
        id: 'e4',
        prompt: '"Mengirim notifikasi otomatis ke alumni untuk mengisi kuesioner tracer study" adalah contoh dari...',
        options: [
          { id: 'a', label: 'Entitas' }, { id: 'b', label: 'Atribut' },
          { id: 'c', label: 'Kebutuhan fungsional (bukan data)' }, { id: 'd', label: 'Atribut kunci' }
        ],
        correct: 'c',
        explanation: 'Ini adalah fungsi/fitur yang harus dikerjakan sistem, bukan entitas atau atribut data.'
      },
      {
        id: 'e5',
        prompt: '"Nama perusahaan tempat alumni bekerja" paling tepat dianggap sebagai atribut milik entitas...',
        options: [
          { id: 'a', label: 'Alumni' }, { id: 'b', label: 'Perusahaan/Instansi' },
          { id: 'c', label: 'Sekolah' }, { id: 'd', label: 'Tracer Study' }
        ],
        correct: 'b',
        explanation: 'Nama perusahaan menjelaskan detail data tentang perusahaan tempat kerja alumni, sehingga ia atribut milik entitas Perusahaan/Instansi, bukan entitas Alumni.'
      },
      {
        id: 'e6',
        prompt: 'Usulan "menyimpan warna almamater kebanggaan tiap alumni" paling tepat digolongkan sebagai...',
        options: [
          { id: 'a', label: 'Atribut relevan entitas Alumni' }, { id: 'b', label: 'Atribut kunci' },
          { id: 'c', label: 'Bukan atribut yang relevan' }, { id: 'd', label: 'Entitas baru' }
        ],
        correct: 'c',
        explanation: 'Tidak ada temuan yang mendukung kebutuhan ini — di luar cakupan sistem pendataan alumni untuk tracer study.'
      },
      {
        id: 'e7',
        prompt: 'Mengapa penting menentukan atribut kunci pada tiap entitas sebelum sistem dirancang?',
        options: [
          { id: 'a', label: 'Agar tiap data dapat dibedakan secara pasti satu sama lain, bahkan bila ada nilai atribut lain yang sama' },
          { id: 'b', label: 'Agar tabelnya terlihat lebih rapi di mata pengguna' },
          { id: 'c', label: 'Karena aturan baku mengharuskan tiap tabel diberi warna berbeda' },
          { id: 'd', label: 'Supaya jumlah kolom pada tiap tabel menjadi genap' }
        ],
        correct: 'a',
        explanation: 'Atribut kunci memastikan sistem dapat mengenali dan membedakan tiap data secara pasti, mencegah kerancuan meski ada data lain yang mirip.'
      }
    ],
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt: 'Simpulkan, apa yang membedakan entitas, atribut, dan atribut kunci?',
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
      { id: 'r1', text: 'Saya bisa membedakan entitas dan atribut dari sebuah kalimat kebutuhan.' },
      { id: 'r2', text: 'Saya bisa mengelompokkan atribut ke entitas yang tepat.' },
      { id: 'r3', text: 'Saya bisa menentukan atribut kunci (primary key) yang tepat untuk sebuah entitas.' },
      { id: 'r4', text: 'Saya bisa memilah entitas/atribut yang relevan dari yang di luar cakupan atau duplikat.' },
      { id: 'r5', text: 'Saya siap menerapkan identifikasi entitas dan atribut ini pada proyek basis data nyata.' }
    ],
    prompts: [
      { id: 'p1', question: 'Bagian mana yang paling sulit: menentukan entitas, menentukan atributnya, atau menentukan atribut kuncinya? Mengapa?', placeholder: 'Tulis jawabanmu...' },
      { id: 'p2', question: 'Ceritakan satu momen kamu (atau timmu) pernah merancang tabel/daftar data tanpa memisahkan entitasnya lebih dulu. Apa akibatnya?', placeholder: 'Tulis pengalamanmu...' }
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
    kartuLabel: 'Kartu Entitas Final',
    kesimpulanLabel: 'Kesimpulanmu (Tahap Evaluasi)',
    justifLabel: 'Justifikasimu (Tahap Sajikan)',
    konsepKunci: [
      'Entitas adalah objek/orang/konsep nyata yang datanya perlu disimpan sistem, biasanya berupa kata benda utama dalam kalimat kebutuhan.',
      'Atribut adalah detail/karakteristik yang melekat pada satu entitas tertentu.',
      'Atribut kunci (primary key) adalah atribut yang nilainya unik dan dipakai membedakan satu data dari data lain pada entitas yang sama.',
      'Teknik kata benda (noun spotting) membantu menjaring calon entitas dan atribut langsung dari kalimat kebutuhan.',
      'Entitas dan atribut yang tergali dengan tepat menjadi dasar rancangan basis data yang bebas duplikasi dan mudah dikelola.'
    ],
    lanjutLabel: 'Langkah Selanjutnya',
    lanjut: [
      'Coba identifikasi entitas dan atribut dari kebutuhan proyek kelas atau organisasi sekolahmu sendiri.',
      'Pelajari materi berikutnya tentang merancang relasi antar entitas menjadi skema basis data.',
      'Diskusikan dengan gurumu, atribut kunci apa yang paling tepat untuk proyek akhir kelasmu.'
    ],
    ulangLabel: 'Ulangi dari Awal',
    berandaLabel: 'Kembali ke Beranda',
    ulangKonfirmasi: 'Reset seluruh progres materi ini? Semua jawaban dan urutan acak akan dihapus.'
  }
};

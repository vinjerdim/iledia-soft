'use strict';

/* ============================================================
   data.js — seluruh isi materi 1.2
   ============================================================
   Berkas ini hanya berisi KONTEN. Logika tampilan ada di app.js
   dan berkas app-stage-*.js. Guru dapat menyunting teks dokumen,
   soal, dan umpan balik di sini tanpa menyentuh kode.

   ATURAN PENTING: setiap pilihan yang ditampilkan ke murid wajib
   punya `id` yang unik dan stabil. Urutan tampilnya diacak oleh
   engine, dan jawaban murid disimpan berdasarkan id — bukan
   berdasarkan nomor urut. Mengganti id sama dengan menghapus
   jawaban murid yang sudah tersimpan.
   ============================================================ */

const DATA = {
  meta: {
    title: 'Analisis Entitas dan Atribut dari Dokumen Spesifikasi',
    subject: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Problem Based Learning',
    goal:
      'Menganalisis dokumen spesifikasi sistem untuk menentukan calon entitas ' +
      'dan atribut utama.'
  },

  /* ==========================================================
     TAHAP 1 — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Sebelum Mulai',
    goal: 'Memahami masalah yang akan kamu selesaikan, alur kerjanya, dan cara memakai media ini.',
    salam:
      'Di materi sebelumnya kamu sudah mengenal entitas, atribut, dan kunci. ' +
      'Sekarang kamu mendapat pekerjaan yang sesungguhnya: <strong>sebuah dokumen ' +
      'spesifikasi dari klien</strong> — ditulis dengan bahasa manusia, bukan berupa daftar ' +
      'tabel yang siap pakai. Tugasmu sebagai analis adalah memutuskan sendiri: ' +
      'mana yang menjadi entitas, mana yang hanya atribut, dan mana yang bukan keduanya.',
    tujuanLabel: 'Setelah menyelesaikan media ini kamu dapat:',
    tujuan: [
      'Menelusuri dokumen spesifikasi sistem dan menandai frasa yang berpotensi menjadi data.',
      'Membedakan calon entitas, atribut, nilai data, proses, dan sinonim pada dokumen yang sama.',
      'Menentukan atribut utama beserta atribut kunci untuk setiap calon entitas.',
      'Mempertanggungjawabkan keputusan analisismu dengan alasan, bukan dengan tebakan.'
    ],
    alurLabel: 'Alur kerja (5 fase Problem Based Learning, 10 tahap)',
    alur: [
      { id: 'a1', title: 'Fase 1 · Orientasi pada masalah', desc: 'Menerima pekerjaan dari klien dan menemukan masalah yang sesungguhnya.' },
      { id: 'a2', title: 'Fase 2 · Menyiapkan bekal', desc: 'Menyepakati rambu pembeda entitas, atribut, nilai, proses, dan sinonim.' },
      { id: 'a3', title: 'Fase 3 · Penyelidikan', desc: 'Menelusuri dokumen, menyaring kandidat, lalu memetakan atributnya.' },
      { id: 'a4', title: 'Fase 4 · Menyajikan hasil karya', desc: 'Menyusun Kartu Data Entitas dan mengujinya dengan pertanyaan klien.' },
      { id: 'a5', title: 'Fase 5 · Evaluasi & refleksi', desc: 'Menguji keberlakuan caramu pada dokumen lain, lalu menilai diri sendiri.' }
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
     TAHAP 2 — Orientasi pada masalah (PBL fase 1)
     ========================================================== */
  masalah: {
    kicker: 'Tahap 2 · Fase 1 PBL',
    title: 'Satu Dokumen, Dua Hasil yang Berbeda',
    goal: 'Menemukan masalah yang sesungguhnya di balik kegagalan aplikasi Tim A.',

    briefLabel: 'Surat dari klien',
    brief:
      '<p><strong>Bu Rahma</strong>, Wakil Kepala Sekolah bidang Hubungan Industri di SMK Bina Karya ' +
      'Nusantara, meminta dibuatkan aplikasi <strong>SI-PKL</strong> untuk mendata Praktik Kerja ' +
      'Lapangan. Ia mengirim satu dokumen spesifikasi kebutuhan, lalu menyerahkannya kepada ' +
      'dua tim kelas XII sekaligus sebagai proyek uji coba.</p>',
    kutipan:
      '"Saya bukan orang IT. Saya tuliskan saja apa yang kami butuhkan, apa adanya. ' +
      'Silakan kalian yang menerjemahkannya menjadi rancangan datanya."',

    kejadianLabel: 'Yang terjadi saat demo',
    kejadian: [
      { id: 'kj_a', tim: 'Tim A', hasil: 'Membuat <strong>satu tabel besar</strong> bernama <code>pkl</code>. Setiap frasa penting di dokumen dijadikan satu kolom: nama siswa, kelas, nama perusahaan, alamat perusahaan, nama pembimbing, nomor HP pembimbing, tanggal mulai, tanggal selesai.' },
      { id: 'kj_b', tim: 'Tim B', hasil: 'Membuat <strong>empat tabel</strong>: <code>siswa</code>, <code>mitra</code>, <code>pembimbing</code>, dan <code>penempatan</code> yang menghubungkan ketiganya.' }
    ],
    insiden:
      'Saat demo, Bu Rahma meminta satu hal sederhana: <em>"Ada mitra baru, PT Cahaya Data. ' +
      'Belum ada siswa yang ditempatkan di sana. Tolong dicatat dulu."</em> Aplikasi Tim B mencatatnya ' +
      'dalam hitungan detik. Aplikasi Tim A tidak bisa — barisnya menuntut nama siswa, kelas, dan ' +
      'tanggal mulai diisi lebih dulu.',

    instruction:
      'Kedua tim membaca <strong>dokumen yang sama</strong>. Dari cerita di atas, ' +
      '<strong>pilih semua pernyataan yang benar</strong> tentang masalah yang sedang terjadi. ' +
      'Ada lebih dari satu jawaban benar.',

    statements: [
      {
        id: 's1', valid: true,
        text: 'Dokumen spesifikasi ditulis dengan bahasa manusia, sehingga entitas dan atributnya tidak tersedia sebagai daftar siap pakai.',
        feedback: 'Benar. Dokumen kebutuhan hampir selalu berupa kalimat biasa. Menerjemahkannya menjadi data adalah pekerjaan <strong>analisis</strong>, bukan pekerjaan menyalin.'
      },
      {
        id: 's2', valid: true,
        text: 'Tim A memperlakukan setiap frasa penting sebagai kolom, tanpa memilah mana yang sebenarnya berdiri sendiri.',
        feedback: 'Benar. Semua frasa dianggap setara. Padahal "perusahaan mitra" berdiri sendiri, sedangkan "tanggal mulai" hanya menempel pada peristiwa penempatan.'
      },
      {
        id: 's3', valid: true,
        text: 'Perbedaan hasil kedua tim berasal dari cara membaca dokumen, bukan dari kemampuan menulis kode.',
        feedback: 'Benar. Kedua tim sama-sama bisa membuat aplikasinya. Yang berbeda adalah <strong>keputusan analisis</strong> sebelum kode ditulis.'
      },
      {
        id: 's4', valid: true,
        text: 'Dibutuhkan kriteria yang sistematis untuk memutuskan sebuah frasa menjadi entitas, atribut, atau bukan keduanya.',
        feedback: 'Benar. Inilah yang akan kamu susun dan pakai di tahap-tahap berikutnya.'
      },
      {
        id: 's5', valid: false,
        text: 'Masalahnya karena dokumen dari Bu Rahma terlalu panjang dan bertele-tele.',
        feedback: 'Belum tepat. Dokumennya hanya beberapa halaman, dan Tim B berhasil memakainya. Panjang dokumen bukan penyebabnya.'
      },
      {
        id: 's6', valid: false,
        text: 'Masalahnya akan selesai jika Tim A memakai bahasa pemrograman atau framework yang lebih modern.',
        feedback: 'Belum tepat. Aplikasi secanggih apa pun yang berdiri di atas satu tabel besar akan mewarisi masalah yang sama — kamu sudah membuktikannya di materi 1.1.'
      },
      {
        id: 's7', valid: false,
        text: 'Masalahnya karena Tim A tidak membaca dokumennya sampai selesai.',
        feedback: 'Belum tepat. Tanpa kriteria pembeda, membaca dokumen sampai sepuluh kali pun hasilnya tetap sama: semua frasa terlihat sama pentingnya.'
      },
      {
        id: 's8', valid: false,
        text: 'Entitas dan atribut seharusnya ditentukan oleh klien, bukan oleh tim pengembang.',
        feedback: 'Belum tepat. Klien menyampaikan <em>kebutuhan</em>; menerjemahkannya menjadi entitas dan atribut adalah tanggung jawab analis. Bu Rahma sendiri sudah menegaskan hal itu.'
      }
    ],

    cekLabel: 'Periksa pilihanku',
    ownLabel: 'Rumuskan pertanyaan penyelidikanmu',
    ownPrompt:
      'Tulis satu pertanyaan yang akan kamu jawab lewat media ini. Mulailah dengan kata "Bagaimana…".',
    ownPlaceholder: 'Bagaimana cara…',
    ownMin: 30,
    ownKurang: 'Tulis sedikit lebih panjang ya, minimal satu pertanyaan utuh.',
    lanjutLabel: 'Lanjut: siapkan bekal analisis →'
  },

  /* ==========================================================
     TAHAP 3 — Mengorganisasi belajar (PBL fase 2)
     ========================================================== */
  bekal: {
    kicker: 'Tahap 3 · Fase 2 PBL',
    title: 'Bekal Sebelum Menelusuri',
    goal: 'Menyepakati rambu pembeda dan rencana penyelidikan sebelum membuka dokumen klien.',
    instruction:
      'Sebuah dokumen spesifikasi penuh dengan kata benda, dan tidak semuanya menjadi entitas. ' +
      '<strong>Ketuk setiap kartu</strong> untuk membuka rambunya.',

    cards: [
      {
        id: 'b_entitas', term: 'Calon Entitas', icon: '🧩',
        def: 'Sesuatu yang dapat berdiri sendiri, punya banyak wujud, dan menyimpan beberapa fakta sekaligus.',
        example: 'Pada dokumen PKL: <strong>siswa</strong>, <strong>perusahaan mitra</strong>, <strong>guru pembimbing</strong>.'
      },
      {
        id: 'b_atribut', term: 'Atribut', icon: '⬇️',
        def: 'Satu fakta tunggal yang melekat pada sebuah entitas dan tidak berarti apa-apa bila dipisahkan darinya.',
        example: '<code>alamat</code> hanya bermakna sebagai alamat <em>milik</em> perusahaan mitra.'
      },
      {
        id: 'b_nilai', term: 'Nilai Data', icon: '🏷️',
        def: 'Contoh isi datanya, bukan jenis datanya. Nilai menjadi baris, bukan tabel.',
        example: '"PT Nusa Kode Digital" adalah satu nilai; jenis datanya tetap perusahaan mitra.'
      },
      {
        id: 'b_proses', term: 'Proses', icon: '⚙️',
        def: 'Aktivitas atau fungsi yang dikerjakan sistem. Biasanya berawalan kata kerja: me-, men-, meng-.',
        example: '"mencetak rekapitulasi" adalah yang <em>dilakukan</em> sistem, bukan yang <em>disimpan</em> sistem.'
      },
      {
        id: 'b_sinonim', term: 'Sinonim', icon: '🔁',
        def: 'Dua istilah berbeda untuk hal yang sama. Cukup menjadi satu entitas dengan satu nama baku.',
        example: '"peserta didik" dan "siswa" pada dokumen yang sama menunjuk hal yang sama.'
      },
      {
        id: 'b_kunci', term: 'Atribut Kunci', icon: '🔑',
        def: 'Atribut yang nilainya unik untuk setiap wujud entitas, dipakai sebagai penanda resmi.',
        example: '<code>nis</code> menandai satu siswa; dua siswa boleh sama nama, NIS-nya tidak.'
      }
    ],

    ujiTitle: 'Uji rambumu',
    ujiInstruction:
      'Pasangkan setiap rambu dengan ciri pengenalnya di dokumen. ' +
      '<strong>Ketuk satu rambu</strong>, lalu ketuk cirinya.',
    /* Rambu dan ciri diacak terpisah — itulah inti latihannya. */
    terms: [
      { id: 'mt_entitas', label: 'Calon Entitas' },
      { id: 'mt_atribut', label: 'Atribut' },
      { id: 'mt_nilai', label: 'Nilai Data' },
      { id: 'mt_proses', label: 'Proses' },
      { id: 'mt_sinonim', label: 'Sinonim' },
      { id: 'mt_kunci', label: 'Atribut Kunci' }
    ],
    defs: [
      { id: 'df_entitas', label: 'Berdiri sendiri, banyak wujudnya, membawa beberapa fakta' },
      { id: 'df_atribut', label: 'Satu fakta yang menempel pada sesuatu yang lain' },
      { id: 'df_nilai', label: 'Contoh isi data yang layak menjadi satu baris' },
      { id: 'df_proses', label: 'Berupa kata kerja: yang dikerjakan, bukan yang disimpan' },
      { id: 'df_sinonim', label: 'Istilah berbeda yang menunjuk hal yang sama' },
      { id: 'df_kunci', label: 'Atribut yang nilainya tidak pernah kembar' }
    ],
    key: {
      mt_entitas: 'df_entitas',
      mt_atribut: 'df_atribut',
      mt_nilai: 'df_nilai',
      mt_proses: 'df_proses',
      mt_sinonim: 'df_sinonim',
      mt_kunci: 'df_kunci'
    },
    cekLabel: 'Periksa pasangan',
    ulangLabel: 'Ulangi pasangan',

    rencanaLabel: 'Rencana penyelidikan',
    rencana: [
      { id: 'r1', title: 'Langkah 1 — Telusur', desc: 'Baca dokumen, tandai setiap frasa kata benda yang berpotensi menjadi data.' },
      { id: 'r2', title: 'Langkah 2 — Saring', desc: 'Uji tiap frasa yang ditandai dengan tiga pertanyaan penyaring di bawah.' },
      { id: 'r3', title: 'Langkah 3 — Petakan', desc: 'Kembalikan setiap atribut kepada entitas pemiliknya, lalu pilih atribut kuncinya.' }
    ],
    ujiSaringLabel: '💡 Tiga pertanyaan penyaring',
    ujiSaring:
      '<ol class="plain-list">' +
      '<li><strong>Apakah ia punya lebih dari satu fakta yang perlu disimpan?</strong> Kalau hanya satu fakta, ia atribut.</li>' +
      '<li><strong>Apakah ia tetap bermakna tanpa yang lain?</strong> "Alamat" tanpa perusahaan tidak bermakna — berarti atribut.</li>' +
      '<li><strong>Apakah wujudnya banyak dan dapat didaftar satu per satu?</strong> Kalau hanya satu contoh tertentu, ia nilai data.</li>' +
      '</ol>',
    lanjutLabel: 'Lanjut: buka dokumen klien →'
  },

  /* ==========================================================
     TAHAP 4 — Penyelidikan: telusur dokumen (PBL fase 3)
     ========================================================== */
  telusur: {
    kicker: 'Tahap 4 · Fase 3 PBL',
    title: 'Telusuri Dokumen Klien',
    goal: 'Menandai frasa pada dokumen spesifikasi yang berpotensi menjadi calon entitas.',
    instruction:
      'Inilah dokumen dari Bu Rahma. Frasa <strong>bergaris putus-putus</strong> dapat diketuk. ' +
      '<strong>Ketuk frasa yang menurutmu layak menjadi calon entitas</strong> — setiap ketukan ' +
      'akan dijelaskan, termasuk ketika tebakanmu meleset.',
    minTemuan: 4,
    revealMin: 2,
    temuanLabel: 'Calon entitas ditemukan',
    revealLabel: 'Saya buntu — tampilkan calon entitasnya',
    revealNotice: 'Seluruh calon entitas kini bertanda ✓.',
    hintLabel: '💡 Buntu? Buka petunjuk',
    hint:
      'Pakai pertanyaan penyaring dari tahap sebelumnya. Cari frasa yang <strong>punya beberapa ' +
      'fakta sekaligus</strong>: bagian "Kebutuhan Fungsional" menyebutkan apa saja yang harus diisi ' +
      'untuk tiap frasa — frasa yang diikuti daftar isian panjang hampir pasti sebuah entitas. ' +
      'Waspadai kata kerja (me-, men-, meng-) dan nama diri seperti "PT ...".',

    legendLabel: 'Arti tanda',
    kinds: {
      entitas: { label: 'Calon entitas', icon: '✓', tone: 'success' },
      atribut: { label: 'Atribut, bukan entitas', icon: '⬇', tone: 'info' },
      nilai: { label: 'Nilai data', icon: '🏷', tone: 'warning' },
      proses: { label: 'Proses / fungsi', icon: '⚙', tone: 'warning' },
      sinonim: { label: 'Sinonim entitas lain', icon: '🔁', tone: 'info' }
    },

    doc: {
      code: 'SKPL-SIPKL-01',
      title: 'Spesifikasi Kebutuhan Perangkat Lunak — SI-PKL',
      meta: [
        { id: 'mt_klien', label: 'Klien', value: 'SMK Bina Karya Nusantara (Bu Rahma, Wakasek Hubin)' },
        { id: 'mt_versi', label: 'Versi', value: '1.0 — halaman 1 dari 1 (ringkasan)' }
      ],

      /* Urutan bagian dan kalimat TIDAK diacak: urutan dokumen adalah
         maknanya. Yang diacak pada materi ini adalah pilihan jawaban
         (tahap 2, 3, 5, 6, 7, 8) — lihat lesson.order() di engine. */
      sections: [
        {
          id: 'sec_latar',
          heading: '1. Latar Belakang',
          paras: [
            [
              { t: 'Setiap semester genap, sekolah memberangkatkan lebih dari 200 ' },
              {
                id: 'tk_siswa', label: 'siswa', kind: 'entitas',
                why: 'Tepat. Siswa berdiri sendiri, wujudnya banyak (200 lebih), dan membawa beberapa fakta sekaligus: NIS, nama, kelas, nomor HP.'
              },
              { t: ' kelas XI ke dunia kerja. Selama ini data pemberangkatan dicatat panitia pada satu berkas spreadsheet.' }
            ],
            [
              { t: 'Panitia kerepotan ketika harus ' },
              {
                id: 'tk_cetak', label: 'mencetak rekapitulasi', kind: 'proses',
                why: 'Ini <strong>proses</strong>, bukan data. Perhatikan awalannya: <em>men-cetak</em>. Yang dikerjakan sistem tidak perlu disimpan sebagai tabel.'
              },
              { t: ' di akhir periode. Pernah pula orang tua salah dihubungi karena nomor ' },
              {
                id: 'tk_nomor_nilai', label: '0812-9000-1122', kind: 'nilai',
                why: 'Ini <strong>nilai data</strong> — satu contoh isi, bukan jenis datanya. Nilai seperti ini menjadi isi satu baris, bukan sebuah tabel baru.'
              },
              { t: ' tertulis pada baris yang keliru.' }
            ]
          ]
        },
        {
          id: 'sec_lingkup',
          heading: '2. Ruang Lingkup',
          paras: [
            [
              { t: 'Aplikasi SI-PKL menyimpan data ' },
              {
                id: 'tk_peserta', label: 'peserta didik', kind: 'sinonim', canon: 'siswa',
                why: 'Hati-hati: ini <strong>sinonim</strong> dari "siswa" yang sudah disebut di bagian 1. Istilah berbeda, hal yang sama — cukup satu entitas dengan satu nama baku.'
              },
              { t: ' yang mengikuti PKL, data ' },
              {
                id: 'tk_mitra', label: 'perusahaan mitra', kind: 'entitas',
                why: 'Tepat. Perusahaan mitra berdiri sendiri — ia tetap ada walau belum menerima seorang siswa pun. Justru di sinilah aplikasi Tim A gagal.'
              },
              { t: ' tempat mereka bekerja, data ' },
              {
                id: 'tk_pembimbing', label: 'guru pembimbing', kind: 'entitas',
                why: 'Tepat. Seorang guru membimbing banyak siswa, dan datanya (NIP, nama, nomor HP) perlu disimpan sekali saja.'
              },
              { t: ' yang memantau, serta data ' },
              {
                id: 'tk_penempatan', label: 'penempatan', kind: 'entitas',
                why: 'Tepat, dan ini yang paling sering terlewat. Penempatan adalah <strong>peristiwa</strong> yang menghubungkan siswa, mitra, dan pembimbing — ia punya faktanya sendiri: tanggal mulai dan tanggal selesai.'
              },
              { t: ' yang menghubungkan ketiganya.' }
            ],
            [
              { t: 'Di luar lingkup versi ini: penilaian akhir PKL dan jurnal kegiatan harian.' }
            ]
          ]
        },
        {
          id: 'sec_fungsional',
          heading: '3. Kebutuhan Fungsional',
          reqs: [
            {
              id: 'f01', code: 'F-01',
              parts: [
                { t: 'Panitia dapat mendaftarkan peserta PKL baru dengan mengisi ' },
                {
                  id: 'tk_nis', label: 'NIS', kind: 'atribut', owner: 'siswa',
                  why: 'Ini <strong>atribut</strong> milik siswa — dan nanti menjadi atribut kuncinya, karena nilainya tidak pernah kembar.'
                },
                { t: ', ' },
                {
                  id: 'tk_nama', label: 'nama lengkap', kind: 'atribut', owner: 'siswa',
                  why: 'Ini <strong>atribut</strong> milik siswa. Satu fakta saja, dan tidak bermakna tanpa orangnya.'
                },
                { t: ', ' },
                {
                  id: 'tk_kelas', label: 'kelas', kind: 'atribut', owner: 'siswa',
                  why: 'Ini <strong>atribut</strong> milik siswa. Kelas Rani tetap sama walaupun ia belum ditempatkan di mana pun.'
                },
                { t: ', dan ' },
                {
                  id: 'tk_hp', label: 'nomor HP', kind: 'atribut', owner: 'siswa',
                  why: 'Ini <strong>atribut</strong> milik siswa. Di materi 1.1 justru inilah fakta yang berulang-ulang dan akhirnya berbeda-beda.'
                },
                { t: '.' }
              ]
            },
            {
              id: 'f02', code: 'F-02',
              parts: [
                { t: 'Panitia dapat mendaftarkan perusahaan baru dengan mengisi ' },
                {
                  id: 'tk_namamitra', label: 'nama perusahaan', kind: 'atribut', owner: 'perusahaan mitra',
                  why: 'Ini <strong>atribut</strong> milik perusahaan mitra. Perusahaannya entitas, namanya atribut — dua hal yang berbeda.'
                },
                { t: ', ' },
                {
                  id: 'tk_alamat', label: 'alamat', kind: 'atribut', owner: 'perusahaan mitra',
                  why: 'Ini <strong>atribut</strong>. "Alamat" tanpa pemiliknya tidak bermakna — ciri khas sebuah atribut.'
                },
                { t: ', dan bidang usaha. Perusahaan harus dapat didaftarkan meskipun belum ada siswa yang ditempatkan di sana.' }
              ]
            },
            {
              id: 'f03', code: 'F-03',
              parts: [
                { t: 'Panitia dapat menetapkan seorang pembimbing untuk setiap penempatan. Satu guru dapat membimbing banyak siswa sekaligus.' }
              ]
            },
            {
              id: 'f04', code: 'F-04',
              parts: [
                { t: 'Setiap penempatan mencatat ' },
                {
                  id: 'tk_mulai', label: 'tanggal mulai', kind: 'atribut', owner: 'penempatan',
                  why: 'Ini <strong>atribut</strong> milik penempatan — bukan milik siswa dan bukan milik perusahaan, karena ia baru ada ketika peristiwa penempatan terjadi.'
                },
                { t: ' dan ' },
                {
                  id: 'tk_selesai', label: 'tanggal selesai', kind: 'atribut', owner: 'penempatan',
                  why: 'Ini <strong>atribut</strong> milik penempatan, sama seperti tanggal mulai.'
                },
                { t: '.' }
              ]
            },
            {
              id: 'f05', code: 'F-05',
              parts: [
                { t: 'Sistem dapat ' },
                {
                  id: 'tk_tampil', label: 'menampilkan daftar', kind: 'proses',
                  why: 'Ini <strong>proses</strong>. Menampilkan adalah pekerjaan aplikasi; yang disimpan adalah datanya, bukan kegiatan menampilkannya.'
                },
                { t: ' siswa yang sedang PKL di ' },
                {
                  id: 'tk_ptnusa', label: 'PT Nusa Kode Digital', kind: 'nilai',
                  why: 'Ini <strong>nilai data</strong> — satu contoh perusahaan mitra, jadi ia menjadi satu baris di tabel mitra, bukan tabel tersendiri.'
                },
                { t: ' beserta pembimbingnya.' }
              ]
            },
            {
              id: 'f06', code: 'F-06',
              parts: [
                { t: 'Sistem dapat ' },
                {
                  id: 'tk_hitung', label: 'menghitung lama PKL', kind: 'proses',
                  why: 'Ini <strong>proses</strong>, sekaligus petunjuk penting: lama PKL dapat dihitung dari tanggal mulai dan tanggal selesai, jadi ia tidak perlu disimpan sebagai atribut.'
                },
                { t: ' setiap siswa dalam satuan hari.' }
              ]
            },
            {
              id: 'f07', code: 'F-07',
              parts: [
                { t: 'Panitia dapat memperbarui data perusahaan cukup di satu tempat, dan perubahannya berlaku untuk seluruh penempatan yang merujuk perusahaan tersebut.' }
              ]
            }
          ]
        },
        {
          id: 'sec_aturan',
          heading: '4. Aturan Bisnis',
          reqs: [
            {
              id: 'ab01', code: 'AB-01',
              parts: [
                { t: 'Istilah ' },
                {
                  id: 'tk_dudi', label: 'DUDI', kind: 'sinonim', canon: 'perusahaan mitra',
                  why: 'Ini <strong>sinonim</strong>. DUDI (dunia usaha dan dunia industri) adalah sebutan lain untuk perusahaan mitra — bukan entitas baru.'
                },
                { t: ' pada dokumen ini berarti perusahaan mitra sekolah.' }
              ]
            },
            {
              id: 'ab02', code: 'AB-02',
              parts: [
                { t: 'Satu siswa hanya boleh memiliki satu penempatan aktif pada satu periode. Pada periode berikutnya, siswa yang sama boleh ditempatkan lagi.' }
              ]
            },
            {
              id: 'ab03', code: 'AB-03',
              parts: [
                { t: 'Periode yang berjalan saat dokumen ini ditulis adalah ' },
                {
                  id: 'tk_periode', label: 'Semester Genap 2025/2026', kind: 'nilai',
                  why: 'Ini <strong>nilai data</strong>. Ia contoh isi dari "periode", bukan sesuatu yang perlu dijadikan tabel tersendiri.'
                },
                { t: '.' }
              ]
            }
          ]
        }
      ]
    },

    lanjutLabel: 'Lanjut: saring kandidatnya →'
  },

  /* ==========================================================
     TAHAP 5 — Penyelidikan: saring kandidat (PBL fase 3)
     ========================================================== */
  saring: {
    kicker: 'Tahap 5 · Fase 3 PBL',
    title: 'Saring Kandidat dari Dokumen',
    goal: 'Memilah seluruh frasa hasil telusur menjadi entitas, atribut, atau bukan keduanya.',
    instruction:
      'Semua frasa yang tadi dapat diketuk sudah dikumpulkan di sini. ' +
      'Ketuk satu chip untuk memilih, lalu ketuk keranjang tujuannya. ' +
      'Ketuk chip yang sudah masuk keranjang untuk mengeluarkannya kembali.',
    keyboardHint:
      'Dengan keyboard: Tab untuk berpindah, Enter atau Spasi untuk memilih. ' +
      'Saat sebuah chip terpilih, tekan angka 1, 2, atau 3 untuk langsung menempatkannya.',
    hintLabel: '💡 Ragu menentukan keranjangnya?',
    hint:
      'Ulangi tiga pertanyaan penyaring: punya beberapa fakta? tetap bermakna sendirian? ' +
      'wujudnya banyak? Tiga-tiganya "ya" → entitas. Hanya satu fakta dan menempel pada sesuatu → ' +
      'atribut. Sisanya — kata kerja, nama diri, dan istilah kembar — masuk keranjang ketiga.',

    buckets: [
      { id: 'bk_entitas', name: 'Calon Entitas', colorKey: 'blue', desc: 'Berdiri sendiri, banyak wujud' },
      { id: 'bk_atribut', name: 'Atribut', colorKey: 'green', desc: 'Satu fakta milik entitas' },
      { id: 'bk_bukan', name: 'Bukan Data', colorKey: 'orange', desc: 'Nilai, proses, atau sinonim' }
    ],

    chips: [
      { id: 'ch_siswa', label: 'siswa', bucketId: 'bk_entitas', why: 'Berdiri sendiri, wujudnya ratusan, dan membawa banyak fakta.' },
      { id: 'ch_mitra', label: 'perusahaan mitra', bucketId: 'bk_entitas', why: 'Tetap ada walau belum menerima siswa — F-02 menegaskannya.' },
      { id: 'ch_pembimbing', label: 'guru pembimbing', bucketId: 'bk_entitas', why: 'Satu guru membimbing banyak siswa; datanya cukup disimpan sekali.' },
      { id: 'ch_penempatan', label: 'penempatan', bucketId: 'bk_entitas', why: 'Peristiwa yang menghubungkan ketiganya, dan punya fakta sendiri (tanggal mulai, tanggal selesai).' },
      { id: 'ch_nis', label: 'NIS', bucketId: 'bk_atribut', why: 'Satu fakta milik siswa. Meski nanti menjadi atribut kunci, ia tetap atribut — bukan entitas.' },
      { id: 'ch_nama', label: 'nama lengkap', bucketId: 'bk_atribut', why: 'Satu fakta milik siswa, tidak bermakna tanpa orangnya.' },
      { id: 'ch_hp', label: 'nomor HP', bucketId: 'bk_atribut', why: 'Satu fakta yang menempel pada pemiliknya.' },
      { id: 'ch_alamat', label: 'alamat', bucketId: 'bk_atribut', why: '"Alamat" sendirian tidak bermakna: ia selalu alamat milik seseorang atau sesuatu.' },
      { id: 'ch_mulai', label: 'tanggal mulai', bucketId: 'bk_atribut', why: 'Satu fakta milik peristiwa penempatan.' },
      { id: 'ch_ptnusa', label: 'PT Nusa Kode Digital', bucketId: 'bk_bukan', why: 'Nilai data — satu contoh perusahaan mitra, jadi ia satu baris, bukan satu tabel.' },
      { id: 'ch_periode', label: 'Semester Genap 2025/2026', bucketId: 'bk_bukan', why: 'Nilai data — contoh isi dari periode yang sedang berjalan.' },
      { id: 'ch_cetak', label: 'mencetak rekapitulasi', bucketId: 'bk_bukan', why: 'Proses. Kata kerja menandakan yang dikerjakan sistem, bukan yang disimpan.' },
      { id: 'ch_hitung', label: 'menghitung lama PKL', bucketId: 'bk_bukan', why: 'Proses, sekaligus hasil hitungan yang tidak perlu disimpan.' },
      { id: 'ch_peserta', label: 'peserta didik', bucketId: 'bk_bukan', why: 'Sinonim dari "siswa". Menjadikannya entitas kedua berarti menyimpan orang yang sama dua kali.' },
      { id: 'ch_dudi', label: 'DUDI', bucketId: 'bk_bukan', why: 'Sinonim dari "perusahaan mitra", sebagaimana ditegaskan AB-01.' }
    ],

    poolLabel: 'Frasa yang belum disaring',
    poolEmpty: 'Semua frasa sudah masuk keranjang ✓',
    emptyColumn: 'Belum ada frasa',
    cekLabel: 'Periksa hasil saringan',
    salah: 'Masih ada yang belum tepat. Chip bertanda ✗ perlu kamu pindahkan.',
    benar: 'Tepat! Dari 15 frasa, hanya empat yang layak menjadi entitas.',
    lanjutLabel: 'Lanjut: petakan atributnya →'
  },

  /* ==========================================================
     TAHAP 6 — Penyelidikan: petakan atribut (PBL fase 3)
     ========================================================== */
  atribut: {
    kicker: 'Tahap 6 · Fase 3 PBL',
    title: 'Petakan Atribut Utama',
    goal: 'Menentukan atribut utama dan atribut kunci untuk setiap calon entitas.',

    step1Title: 'Langkah 1 — Kembalikan atribut kepada pemiliknya',
    step1Instruction:
      'Empat calon entitasmu sudah berdiri. Sekarang tempatkan setiap atribut pada entitas ' +
      '<strong>pemilik faktanya</strong>. Ketuk satu chip, lalu ketuk entitas tujuannya.',
    step1Hint:
      'Tanyakan: fakta ini <strong>milik siapa</strong>? Nomor HP guru tetap melekat pada gurunya ' +
      'walau ia sedang tidak membimbing siapa pun. Sebaliknya, tanggal mulai hanya ada ketika ' +
      'sebuah penempatan terjadi — jadi ia milik penempatan.',
    keyboardHint:
      'Dengan keyboard: Tab untuk berpindah, Enter atau Spasi untuk memilih. ' +
      'Saat sebuah chip terpilih, tekan angka 1 sampai 4 untuk langsung menempatkannya.',

    entities: [
      { id: 'en_siswa', name: 'siswa', colorKey: 'blue', desc: 'Orang yang mengikuti PKL', key: 'at_nis' },
      { id: 'en_mitra', name: 'mitra', colorKey: 'green', desc: 'Perusahaan tempat PKL', key: 'at_kodemitra' },
      { id: 'en_pembimbing', name: 'pembimbing', colorKey: 'orange', desc: 'Guru pemantau PKL', key: 'at_nip' },
      { id: 'en_penempatan', name: 'penempatan', colorKey: 'purple', desc: 'Peristiwa penempatan siswa', key: 'at_idpenempatan' }
    ],

    chips: [
      { id: 'at_nis', label: 'nis', entityId: 'en_siswa', why: 'Nomor induk siswa — fakta milik siswa, dan unik untuk tiap orang.' },
      { id: 'at_namasiswa', label: 'nama_siswa', entityId: 'en_siswa', why: 'Nama menempel pada orangnya, bukan pada penempatannya.' },
      { id: 'at_kelas', label: 'kelas', entityId: 'en_siswa', why: 'Kelas adalah fakta milik siswa; ia tetap sama walau siswa belum ditempatkan.' },
      { id: 'at_kodemitra', label: 'kode_mitra', entityId: 'en_mitra', why: 'Penanda resmi tiap perusahaan mitra, dan nilainya tidak pernah kembar.' },
      { id: 'at_namamitra', label: 'nama_perusahaan', entityId: 'en_mitra', why: 'Nama perusahaan menempel pada perusahaannya. Cukup ditulis sekali di sini.' },
      { id: 'at_alamat', label: 'alamat', entityId: 'en_mitra', why: 'Alamat adalah fakta milik perusahaan mitra (F-02).' },
      { id: 'at_nip', label: 'nip', entityId: 'en_pembimbing', why: 'Nomor induk pegawai — penanda unik setiap guru pembimbing.' },
      { id: 'at_namaguru', label: 'nama_guru', entityId: 'en_pembimbing', why: 'Nama guru menempel pada gurunya, bukan pada siswa yang dibimbingnya.' },
      { id: 'at_hpguru', label: 'no_hp_guru', entityId: 'en_pembimbing', why: 'Nomor HP guru adalah fakta milik guru. Disimpan sekali, berlaku untuk semua bimbingannya.' },
      { id: 'at_idpenempatan', label: 'id_penempatan', entityId: 'en_penempatan', why: 'Penanda unik tiap peristiwa penempatan — sesuatu yang tidak ada di tabel besar Tim A.' },
      { id: 'at_mulai', label: 'tanggal_mulai', entityId: 'en_penempatan', why: 'Tanggal mulai baru ada ketika penempatan terjadi, jadi ia milik penempatan (F-04).' },
      { id: 'at_selesai', label: 'tanggal_selesai', entityId: 'en_penempatan', why: 'Tanggal selesai juga hanya bermakna pada peristiwa penempatan (F-04).' }
    ],

    poolLabel: 'Atribut yang belum ditempatkan',
    poolEmpty: 'Semua atribut sudah ditempatkan ✓',
    emptyColumn: 'Belum ada atribut',
    cekLabel: 'Periksa penempatan',
    salah: 'Masih ada atribut yang belum tepat. Chip bertanda ✗ perlu kamu pindahkan.',
    benar: 'Tepat! Setiap fakta kini tinggal di satu tempat saja.',

    step2Title: 'Langkah 2 — Pilih atribut kunci',
    step2Instruction:
      'Setiap entitas butuh satu atribut penanda yang <strong>nilainya tidak pernah kembar</strong>. ' +
      'Pilih satu untuk tiap entitas.',
    keyPlaceholder: '— pilih atribut kunci —',
    cekKunciLabel: 'Periksa kunci',
    salahKunci: 'Belum tepat. Ingat syaratnya: unik untuk setiap wujud, dan tidak berubah-ubah.',
    benarKunci: 'Tepat. Setiap entitas kini punya penanda resminya.',

    step3Title: 'Langkah 3 — Saring atribut tabel penempatan',
    step3Instruction:
      'Panitia mengusulkan beberapa atribut tambahan untuk <code>penempatan</code>. ' +
      '<strong>Pilih yang memang perlu disimpan</strong> — sisanya biarkan kosong.',
    usulan: [
      { id: 'us_nis', label: 'nis', simpan: true, why: 'Perlu. Inilah penghubung ke entitas siswa — cukup NIS-nya, bukan nama dan kelasnya.' },
      { id: 'us_kodemitra', label: 'kode_mitra', simpan: true, why: 'Perlu. Penghubung ke entitas mitra, sehingga data perusahaan tidak perlu disalin ulang (F-07).' },
      { id: 'us_nip', label: 'nip', simpan: true, why: 'Perlu. Penghubung ke guru pembimbing yang ditetapkan untuk penempatan itu (F-03).' },
      { id: 'us_lama', label: 'lama_pkl', simpan: false, why: 'Tidak perlu. Lama PKL dapat dihitung dari tanggal mulai dan tanggal selesai (F-06). Menyimpan hasil hitungan berarti menyimpan fakta yang sama dua kali.' },
      { id: 'us_namamitra', label: 'nama_perusahaan', simpan: false, why: 'Tidak perlu. Namanya sudah tersimpan di entitas mitra dan dapat ditelusuri lewat kode_mitra — persis kesalahan Tim A bila disalin ke sini.' },
      { id: 'us_kelas', label: 'kelas_siswa', simpan: false, why: 'Tidak perlu. Kelas adalah fakta milik siswa dan dapat ditelusuri lewat nis.' }
    ],
    cekUsulanLabel: 'Periksa usulan',
    salahUsulan: 'Belum tepat. Baca lagi penjelasan di bawah tiap pilihan.',
    benarUsulan: 'Tepat. Penempatan hanya menyimpan faktanya sendiri, ditambah penghubung ke entitas lain.',
    lanjutLabel: 'Lanjut: sajikan hasilmu →'
  },

  /* ==========================================================
     TAHAP 7 — Menyajikan hasil karya (PBL fase 4)
     ========================================================== */
  sajikan: {
    kicker: 'Tahap 7 · Fase 4 PBL',
    title: 'Sajikan Kartu Data Entitas',
    goal: 'Menyajikan hasil analisis dan mengujinya dengan pertanyaan klien.',
    kartuLabel: 'Kartu Data Entitas — hasil analisismu',
    kartuNote:
      'Inilah hasil kerjamu: empat entitas dari satu dokumen, lengkap dengan atribut utama ' +
      'dan atribut kuncinya (bertanda 🔑). Kartu inilah yang akan kamu serahkan kepada Bu Rahma.',
    keyBadge: '🔑 kunci',

    ujiLabel: 'Uji kartumu dengan pertanyaan klien',
    ujiInstruction:
      'Bu Rahma menguji hasilmu dengan tiga pertanyaan. Untuk tiap pertanyaan, ' +
      '<strong>tebak dulu</strong> jawabannya, baru hasilnya dibuka. Menebak dulu membuat temuannya menempel.',
    prediksiLabel: 'Tebakanmu:',
    bukaLabel: 'Buka hasilnya',
    kamuLabel: 'Kartu data entitasmu',
    timALabel: 'Satu tabel besar (Tim A)',

    cases: [
      {
        id: 'uj_mitra', icon: '🏢',
        title: 'Pertanyaan 1 — Mitra baru, belum ada siswa',
        scenario:
          '"PT Cahaya Data baru saja menyetujui kerja sama. Belum ada satu pun siswa ditempatkan di sana. Bisakah datanya dicatat sekarang?"',
        options: [
          { id: 'om1', label: 'Bisa langsung dicatat sebagai data mitra.' },
          { id: 'om2', label: 'Tidak bisa sampai ada siswa yang ditempatkan.' },
          { id: 'om3', label: 'Harus menghapus data mitra lain terlebih dahulu.' },
          { id: 'om4', label: 'Cukup dititipkan pada kolom catatan siswa.' }
        ],
        correct: 'om1',
        kamu: {
          verdict: 'baik',
          text:
            'Tambah <strong>satu baris</strong> di entitas <code>mitra</code>, selesai. ' +
            'Mitra berdiri sendiri, jadi keberadaannya tidak bergantung pada ada atau tidaknya penempatan.'
        },
        timA: {
          verdict: 'buruk',
          text:
            'Gagal. Satu baris di tabel <code>pkl</code> hanya lahir kalau ada penempatan, sehingga ' +
            'mitra tanpa siswa tidak punya tempat. Inilah yang terjadi saat demo.'
        },
        konsep: 'Entitas harus berdiri sendiri (F-02)'
      },
      {
        id: 'uj_hp', icon: '✏️',
        title: 'Pertanyaan 2 — Nomor HP pembimbing berganti',
        scenario:
          '"Pak Andri membimbing 18 siswa. Nomor HP-nya berganti. Berapa tempat yang harus disunting?"',
        options: [
          { id: 'oh1', label: 'Satu tempat saja, di data pembimbing.' },
          { id: 'oh2', label: 'Delapan belas tempat, satu per siswa bimbingannya.' },
          { id: 'oh3', label: 'Dua tempat: data siswa dan data penempatan.' },
          { id: 'oh4', label: 'Tidak dapat diubah, harus dibuat data guru baru.' }
        ],
        correct: 'oh1',
        kamu: {
          verdict: 'baik',
          text:
            'Ubah <strong>satu baris</strong> di entitas <code>pembimbing</code>. Seluruh penempatan ' +
            'hanya menyimpan <code>nip</code>, jadi semuanya langsung menunjuk nomor yang baru.'
        },
        timA: {
          verdict: 'buruk',
          text:
            'Harus menyisir <strong>18 baris</strong>. Satu baris terlewat, sekolah punya dua nomor ' +
            'Pak Andri yang berbeda dan tidak ada yang tahu mana yang benar.'
        },
        konsep: 'Satu fakta cukup disimpan di satu tempat (F-07)'
      },
      {
        id: 'uj_ulang', icon: '🔁',
        title: 'Pertanyaan 3 — Siswa yang sama, periode berikutnya',
        scenario:
          '"Rani sudah selesai PKL semester ini. Semester depan ia ditempatkan lagi di perusahaan yang berbeda. Bagaimana pencatatannya?"',
        options: [
          { id: 'ou1', label: 'Tambah satu baris penempatan baru; data siswanya tetap satu.' },
          { id: 'ou2', label: 'Buat data siswa kedua atas nama Rani.' },
          { id: 'ou3', label: 'Timpa data penempatan yang lama.' },
          { id: 'ou4', label: 'Tidak boleh, satu siswa hanya boleh PKL sekali.' }
        ],
        correct: 'ou1',
        kamu: {
          verdict: 'baik',
          text:
            'Cukup satu baris baru di <code>penempatan</code> yang menunjuk <code>nis</code> Rani. ' +
            'Riwayat PKL-nya utuh, dan AB-02 tetap dipenuhi karena hanya satu penempatan yang aktif per periode.'
        },
        timA: {
          verdict: 'buruk',
          text:
            'Data Rani ditulis ulang seluruhnya di baris baru — nama, kelas, nomor HP. ' +
            'Fakta yang sama disimpan dua kali, dan mulai dari sinilah data menjadi tidak konsisten.'
        },
        konsep: 'Peristiwa adalah entitas tersendiri (AB-02)'
      }
    ],

    benarPrediksi: 'Tebakanmu tepat!',
    salahPrediksi: 'Tebakanmu belum tepat — dan itu wajar. Baca perbandingannya.',
    penutup:
      'Ketiga pertanyaan tadi dijawab oleh <strong>keputusan analisismu</strong>, bukan oleh kode yang kamu tulis. ' +
      'Keputusan itu diambil saat membaca dokumen — sebelum satu baris kode pun ada.',

    justifLabel: 'Pertanggungjawaban analis',
    justifPrompt:
      'Pilih satu frasa dari dokumen yang kamu TOLAK sebagai entitas, lalu jelaskan alasan penolakanmu kepada Bu Rahma.',
    justifPlaceholder: 'Saya tidak menjadikan … sebagai entitas karena…',
    justifMin: 40,
    justifKurang: 'Lengkapi dulu alasanmu menjadi satu penjelasan utuh.',
    lanjutLabel: 'Lanjut: uji pada dokumen lain →'
  },

  /* ==========================================================
     TAHAP 8 — Menganalisis & mengevaluasi (PBL fase 5)
     ========================================================== */
  evaluasi: {
    kicker: 'Tahap 8 · Fase 5 PBL',
    title: 'Berlaku Juga di Dokumen Lain?',
    goal: 'Menguji keberlakuan cara analisismu pada dokumen spesifikasi yang sama sekali baru.',
    instruction:
      'Cara kerja yang baik harus bisa dipakai di kasus lain. Berikut potongan dokumen dari klien berbeda. ' +
      'Baca sekali, lalu jawab soal-soalnya.',

    dokLabel: 'SKPL-BMJ-01 — Bengkel Maju Jaya',
    dokumen:
      '<p>"Pelanggan membawa sepeda motornya ke bengkel. Montir memeriksa motor tersebut, lalu mencatat ' +
      'servis yang dikerjakan. Setiap servis mencatat tanggal, keluhan, dan biaya. Kadang dokumen kami ' +
      'menyebut pelanggan dengan istilah konsumen — maksudnya sama. Pemilik bengkel ingin mencetak laporan ' +
      'servis bulanan dan mengetahui total biaya yang pernah dikeluarkan setiap pelanggan. ' +
      'Contoh servis terakhir: Bapak Sulaiman, motor bernomor plat B 1234 XYZ, biaya Rp150.000."</p>',

    questions: [
      {
        id: 'e1',
        prompt: 'Manakah frasa yang paling tepat dijadikan <strong>calon entitas</strong>?',
        options: [
          { id: 'e1a', label: 'Montir' },
          { id: 'e1b', label: 'Tanggal servis' },
          { id: 'e1c', label: 'Mencetak laporan bulanan' },
          { id: 'e1d', label: 'Rp150.000' }
        ],
        correct: 'e1a',
        explanation: 'Montir berdiri sendiri, wujudnya banyak, dan membawa beberapa fakta (nama, keahlian, nomor HP). Tanggal servis hanya satu fakta, "mencetak laporan" adalah proses, dan Rp150.000 adalah nilai data.'
      },
      {
        id: 'e2',
        prompt: '"Nomor plat" pada dokumen itu paling tepat diperlakukan sebagai…',
        options: [
          { id: 'e2a', label: 'Atribut milik entitas sepeda motor.' },
          { id: 'e2b', label: 'Entitas tersendiri karena nilainya unik.' },
          { id: 'e2c', label: 'Proses, karena dipakai saat pemeriksaan.' },
          { id: 'e2d', label: 'Nilai data, sehingga tidak perlu disimpan.' }
        ],
        correct: 'e2a',
        explanation: 'Nomor plat adalah satu fakta yang menempel pada sepeda motor — dan karena nilainya unik, ia justru cocok menjadi atribut kuncinya. Unik tidak membuat sebuah fakta berubah menjadi entitas.'
      },
      {
        id: 'e3',
        prompt: '"Total biaya yang pernah dikeluarkan setiap pelanggan" sebaiknya…',
        options: [
          { id: 'e3a', label: 'Tidak disimpan, karena dapat dihitung dari data servis.' },
          { id: 'e3b', label: 'Disimpan sebagai atribut pelanggan agar cepat tampil.' },
          { id: 'e3c', label: 'Dijadikan entitas baru bernama total_biaya.' },
          { id: 'e3d', label: 'Disimpan pada setiap baris servis.' }
        ],
        correct: 'e3a',
        explanation: 'Sama seperti "lama PKL" pada dokumen Bu Rahma: hasil hitungan tidak perlu disimpan. Bila disimpan, ia harus diperbarui setiap ada servis baru — dan akan segera berbeda dengan kenyataan.'
      },
      {
        id: 'e4',
        prompt: 'Dokumen memakai "pelanggan" dan "konsumen" bergantian. Tindakan analis yang tepat adalah…',
        options: [
          { id: 'e4a', label: 'Menyatukannya menjadi satu entitas dengan satu nama baku.' },
          { id: 'e4b', label: 'Membuat dua entitas terpisah sesuai istilah dokumen.' },
          { id: 'e4c', label: 'Menghapus keduanya karena membingungkan.' },
          { id: 'e4d', label: 'Menjadikan "konsumen" atribut milik "pelanggan".' }
        ],
        correct: 'e4a',
        explanation: 'Keduanya sinonim, persis seperti "peserta didik"/"siswa" dan "DUDI"/"perusahaan mitra". Dua entitas untuk satu hal berarti menyimpan orang yang sama dua kali.'
      },
      {
        id: 'e5',
        prompt: 'Kata seperti "memeriksa", "mencatat", dan "mencetak" pada dokumen spesifikasi menandakan…',
        options: [
          { id: 'e5a', label: 'Proses atau fungsi sistem, bukan calon entitas.' },
          { id: 'e5b', label: 'Entitas yang paling penting bagi klien.' },
          { id: 'e5c', label: 'Atribut kunci dari entitas terdekatnya.' },
          { id: 'e5d', label: 'Bagian dokumen yang boleh diabaikan seluruhnya.' }
        ],
        correct: 'e5a',
        explanation: 'Kata kerja menunjukkan yang <em>dikerjakan</em> sistem. Ia tidak diabaikan — justru dari kata kerja inilah kamu tahu data apa yang harus tersedia agar proses itu bisa berjalan.'
      },
      {
        id: 'e6',
        prompt: 'Ciri paling kuat sebuah frasa layak diangkat menjadi entitas adalah…',
        options: [
          { id: 'e6a', label: 'Dapat berdiri sendiri, banyak wujudnya, dan membawa beberapa fakta.' },
          { id: 'e6b', label: 'Paling sering disebut di sepanjang dokumen.' },
          { id: 'e6c', label: 'Muncul pada judul atau nama aplikasinya.' },
          { id: 'e6d', label: 'Berupa angka atau kode sehingga mudah diurutkan.' }
        ],
        correct: 'e6a',
        explanation: 'Itulah tiga pertanyaan penyaring yang kamu pakai sejak tahap 3. Sering disebut belum tentu entitas — "tanggal" disebut berkali-kali, tetapi ia tetap sebuah atribut.'
      }
    ],

    cekLabel: 'Periksa jawaban',
    ulangLabel: 'Kerjakan ulang',
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt:
      'Tulis langkah-langkah yang kamu pakai untuk menentukan calon entitas dan atribut utama dari sebuah dokumen spesifikasi.',
    kesimpulanPlaceholder: 'Untuk menentukan entitas dan atribut dari dokumen spesifikasi, saya…',
    kesimpulanMin: 40,
    kesimpulanKurang: 'Lengkapi dulu kesimpulanmu menjadi satu penjelasan utuh.',
    lanjutLabel: 'Lanjut: refleksi →'
  },

  /* ==========================================================
     TAHAP 9 — Refleksi
     ========================================================== */
  refleksi: {
    kicker: 'Tahap 9 · Fase 5 PBL',
    title: 'Menilai Diri Sendiri',
    goal: 'Menyadari sejauh mana cara berpikirmu sebagai analis berubah.',
    note:
      'Jawabanmu hanya tersimpan di perangkat ini dan tidak dikirim ke mana pun. ' +
      'Jawab sejujurnya — ini untukmu sendiri.',

    recallLabel: 'Tebakanmu saat diuji Bu Rahma',
    recallKosong: 'Kamu belum sempat menebak di tahap Sajikan Hasil.',

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
      { id: 'li_telusur', text: 'Saya dapat menandai frasa yang berpotensi menjadi data pada dokumen spesifikasi.' },
      { id: 'li_bedakan', text: 'Saya dapat membedakan calon entitas, atribut, nilai data, proses, dan sinonim.' },
      { id: 'li_atribut', text: 'Saya dapat menentukan atribut utama dan atribut kunci tiap entitas.' },
      { id: 'li_alasan', text: 'Saya dapat menjelaskan alasan di balik setiap keputusan analisis saya.' }
    ],

    prompts: [
      {
        id: 'rf1',
        question: 'Keputusan analisis mana yang paling sulit kamu ambil? Mengapa?',
        placeholder: 'Yang paling sulit bagi saya adalah…'
      },
      {
        id: 'rf2',
        question: 'Adakah yang masih membingungkan? Tulis pertanyaan yang ingin kamu tanyakan kepada gurumu.',
        placeholder: 'Saya masih bingung tentang…'
      },
      {
        id: 'rf3',
        question: 'Dokumen atau aplikasi apa di sekitarmu yang ingin kamu analisis dengan cara ini?',
        placeholder: 'Saya ingin mencobanya pada…'
      }
    ],

    simpanLabel: 'Simpan refleksi',
    tersimpan: 'Refleksi tersimpan.',
    lanjutLabel: 'Selesai →'
  },

  /* ==========================================================
     TAHAP 10 — Selesai
     ========================================================== */
  selesai: {
    kicker: 'Tahap 10 · Selesai',
    title: 'Laporan Analisis Selesai',
    skorLabel: 'Ringkasan hasil',
    kartuLabel: 'Kartu Data Entitas yang kamu serahkan',
    kesimpulanLabel: 'Kesimpulan yang kamu tulis',
    justifLabel: 'Pertanggungjawaban yang kamu tulis',

    konsepKunci: [
      'Dokumen spesifikasi ditulis dengan bahasa manusia; entitas dan atributnya <strong>ditentukan lewat analisis</strong>, bukan disalin.',
      'Sebuah frasa layak menjadi <strong>entitas</strong> bila ia berdiri sendiri, banyak wujudnya, dan membawa beberapa fakta.',
      'Sebuah frasa hanyalah <strong>atribut</strong> bila ia satu fakta yang tidak bermakna tanpa pemiliknya.',
      'Waspadai tiga penyamar: <strong>nilai data</strong> (contoh isi), <strong>proses</strong> (kata kerja), dan <strong>sinonim</strong> (nama lain untuk hal yang sama).',
      'Fakta yang dapat <strong>dihitung ulang</strong> tidak perlu disimpan; cukup simpan bahan hitungannya.',
      'Setiap entitas membutuhkan <strong>atribut kunci</strong> yang nilainya tidak pernah kembar.'
    ],

    lanjutLabel: 'Langkah berikutnya',
    lanjut: [
      'Materi berikutnya — menggambarkan relasi antarentitas dalam bentuk ERD.',
      'Coba terapkan: ambil satu dokumen kebutuhan nyata (proposal proyek, lembar pendaftaran ekskul), lalu telusuri entitas dan atributnya dengan tiga pertanyaan penyaring tadi.'
    ],

    ulangLabel: '↩ Ulangi dari awal',
    berandaLabel: 'Kembali ke beranda',
    ulangKonfirmasi:
      'Ulangi materi dari awal? Seluruh jawaban dan progresmu akan dihapus, dan pilihan jawaban akan diacak ulang.'
  }
};

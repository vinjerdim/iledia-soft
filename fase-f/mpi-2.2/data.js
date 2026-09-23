'use strict';

/* ============================================================
   data.js — seluruh isi materi 2.2
   ============================================================
   Berkas ini hanya berisi KONTEN. Logika tampilan ada di app.js
   dan berkas app-stage-*.js. Guru dapat menyunting teks, tabel,
   soal, dan umpan balik di sini tanpa menyentuh kode.

   ATURAN PENTING: setiap pilihan yang ditampilkan ke murid wajib
   punya `id` yang unik dan stabil. Urutan tampilnya diacak oleh
   engine, dan jawaban murid disimpan berdasarkan id — bukan
   berdasarkan nomor urut. Mengganti id sama dengan menghapus
   jawaban murid yang sudah tersimpan.
   ============================================================ */

const DATA = {
  meta: {
    title: 'Jenis-jenis DBMS dan Karakteristiknya',
    subject: 'Rekayasa Perangkat Lunak — Fase F (SMK)',
    model: 'Discovery Learning',
    goal: 'Mengidentifikasi dan membandingkan jenis-jenis DBMS beserta karakteristiknya.'
  },

  /* ==========================================================
     TAHAP 1 — Orientasi
     ========================================================== */
  orientasi: {
    kicker: 'Tahap 1 · Orientasi',
    title: 'Sebelum Mulai',
    goal: 'Memahami tujuan, alur, dan cara memakai media ini.',
    salam:
      'Di materi sebelumnya kamu sudah tahu bahwa DBMS adalah perangkat lunak pengelola basis data. ' +
      'Ternyata DBMS tidak hanya satu jenis! Di media ini kamu akan mengintip enam "gudang data" milik ' +
      'RPL Mart, toko online sekolah, yang menyimpan data yang sama dengan cara berbeda-beda. ' +
      'Dari situ kamu akan menemukan sendiri jenis-jenis DBMS dan apa yang membedakan mereka.',
    tujuanLabel: 'Setelah menyelesaikan media ini kamu dapat:',
    tujuan: [
      'Mengidentifikasi jenis-jenis DBMS berdasarkan model datanya: hierarkis, jaringan, relasional, berorientasi objek, dan NoSQL (dokumen, key-value, kolom lebar, graf).',
      'Menjelaskan karakteristik tiap jenis DBMS: struktur data, skema, bahasa kueri, konsistensi, dan skalabilitas.',
      'Mengelompokkan contoh produk DBMS ke dalam jenisnya.',
      'Membandingkan DBMS relasional, NoSQL, serta hierarkis & jaringan.',
      'Memilih jenis DBMS yang tepat untuk suatu kebutuhan beserta alasannya.'
    ],
    alurLabel: 'Alur belajar (9 tahap)',
    alur: [
      { title: 'Stimulasi', desc: 'Mengintip enam gudang data RPL Mart dan mencatat perbedaannya.' },
      { title: 'Rumusan Masalah', desc: 'Menetapkan pertanyaan yang akan diselidiki.' },
      { title: 'Pengumpulan Data', desc: 'Membuka kartu konsep jenis-jenis DBMS, lalu menjodohkan jenis dengan cirinya.' },
      { title: 'Pengolahan Data', desc: 'Memilah produk DBMS ke jenisnya dan membandingkan karakteristiknya.' },
      { title: 'Verifikasi', desc: 'Menjadi Konsultan DBMS: memilih jenis DBMS untuk kebutuhan nyata lalu membuktikannya.' },
      { title: 'Generalisasi', desc: 'Menyimpulkan perbandingan jenis DBMS, lalu menguji pemahaman.' },
      { title: 'Refleksi & Selesai', desc: 'Menilai pemahamanmu sendiri dan melihat tabel perbandingan akhir.' }
    ],
    caraPakaiLabel: 'Cara memakai',
    caraPakai: [
      'Tahap terbuka berurutan — selesaikan satu tahap untuk membuka tahap berikutnya.',
      'Progresmu tersimpan otomatis di perangkat ini. Boleh ditutup lalu dilanjutkan nanti.',
      'Tidak apa-apa salah. Setiap jawaban salah diberi penjelasan, bukan hukuman.',
      'Tombol Reset di kanan atas menghapus seluruh progres dan mengacak ulang pilihan jawaban.'
    ],
    mulaiLabel: 'Mulai menyelidiki →'
  },

  /* ==========================================================
     TAHAP 2 — Stimulasi
     ========================================================== */
  stimulasi: {
    kicker: 'Tahap 2 · Stimulasi',
    title: 'Satu Data, Enam Gudang',
    goal: 'Mengamati bagaimana data yang sama dapat disimpan dengan cara yang berbeda-beda.',
    cerita:
      '<p><strong>RPL Mart</strong> adalah toko online buatan siswa RPL. Isinya sederhana: ' +
      '<strong>Dewi</strong> membeli Kaos RPL dan Stiker, <strong>Bima</strong> membeli Tumbler, ' +
      'dan Dewi berteman dengan Bima.</p>' +
      '<p>Enam tim siswa diminta menyimpan data itu. Setiap tim memakai DBMS yang berbeda, ' +
      'dan hasilnya disebut <strong>gudang</strong>. Bu Sari, guru pembimbing, bertanya:</p>',
    keluhan:
      '"Datanya sama persis, tapi kenapa bentuk gudangnya beda-beda? Coba intip satu per satu. ' +
      'Perhatikan bentuk datanya, cara menanyakan datanya, dan catatan dari penjaga gudangnya."',
    instruction:
      '<strong>Ketuk setiap gudang</strong> untuk membukanya. Amati bentuk penyimpanan, cara bertanya, ' +
      'dan kata penjaga gudang.',
    bukaLabel: 'Gudang dibuka',
    bentukLabel: 'Bentuk data',
    tanyaLabel: 'Cara bertanya ke gudang',
    penjagaLabel: 'Kata penjaga gudang',
    /* Gudang TIDAK diacak: ini bahan pengamatan, bukan pilihan jawaban.
       Nama jenis DBMS sengaja tidak disebut — murid menemukannya di tahap 4. */
    gudang: [
      {
        id: 'g-pohon',
        icon: '🌳',
        name: 'Gudang Pohon',
        tim: 'Tim 1',
        visual:
          'RPL Mart\n' +
          '├── Pelanggan: Dewi\n' +
          '│   └── Pesanan #101\n' +
          '│       ├── Kaos RPL  ×1\n' +
          '│       └── Stiker    ×3\n' +
          '└── Pelanggan: Bima\n' +
          '    └── Pesanan #102\n' +
          '        └── Tumbler   ×1',
        tanya: 'Mulai dari akar → RPL Mart → Dewi → Pesanan #101 → daftar barang',
        penjaga:
          'Setiap data hanya punya SATU induk. Kalau Bima juga membeli Kaos RPL, data kaos harus saya tulis ' +
          'lagi di cabang Bima. Untuk mencari data, saya selalu menelusuri dari atas ke bawah.'
      },
      {
        id: 'g-jaring',
        icon: '🕸️',
        name: 'Gudang Jaring',
        tim: 'Tim 2',
        visual:
          '[Dewi] ──────► [Pesanan #101] ◄────── [Kaos RPL]\n' +
          '                     ▲\n' +
          '[Stiker] ────────────┘\n' +
          '\n' +
          '[Bima] ──────► [Pesanan #102] ◄────── [Tumbler]',
        tanya: 'FIND Dewi → ikuti pointer ke Pesanan → ikuti pointer ke setiap Produk',
        penjaga:
          'Satu pesanan boleh punya lebih dari satu induk: pelanggannya dan produknya. Semua dihubungkan ' +
          'dengan penunjuk (pointer). Cepat, tetapi kalau strukturnya diubah, program yang menelusuri jalurnya ikut harus diubah.'
      },
      {
        id: 'g-tabel',
        icon: '📋',
        name: 'Gudang Tabel',
        tim: 'Tim 3',
        visual:
          'pelanggan               produk\n' +
          '+----+------+           +----+----------+-------+\n' +
          '| id | nama |           | id | nama     | harga |\n' +
          '+----+------+           +----+----------+-------+\n' +
          '| 1  | Dewi |           | K1 | Kaos RPL | 75000 |\n' +
          '| 2  | Bima |           | S1 | Stiker   |  5000 |\n' +
          '+----+------+           | T1 | Tumbler  | 45000 |\n' +
          '                        +----+----------+-------+\n' +
          'pesanan\n' +
          '+-----+--------------+-----------+--------+\n' +
          '| no  | id_pelanggan | id_produk | jumlah |\n' +
          '+-----+--------------+-----------+--------+\n' +
          '| 101 | 1            | K1        | 1      |\n' +
          '| 101 | 1            | S1        | 3      |\n' +
          '| 102 | 2            | T1        | 1      |\n' +
          '+-----+--------------+-----------+--------+',
        tanya:
          'SELECT p.nama, pr.nama FROM pesanan ps\n' +
          '  JOIN pelanggan p ON p.id = ps.id_pelanggan\n' +
          '  JOIN produk pr  ON pr.id = ps.id_produk;',
        penjaga:
          'Semua data saya simpan dalam tabel berkolom tetap, dihubungkan lewat kunci (id). Mau menambah kolom ' +
          '"hobi"? Ubah dulu strukturnya. Setiap transaksi saya jamin utuh: berhasil semua atau batal semua.'
      },
      {
        id: 'g-dokumen',
        icon: '📄',
        name: 'Gudang Map Dokumen',
        tim: 'Tim 4',
        visual:
          '{ "_id": "dewi",\n' +
          '  "nama": "Dewi",\n' +
          '  "pesanan": [\n' +
          '    { "no": 101, "barang": ["Kaos RPL", "Stiker"] }\n' +
          '  ] }\n' +
          '\n' +
          '{ "_id": "bima",\n' +
          '  "nama": "Bima",\n' +
          '  "kelas": "XI RPL 1",\n' +
          '  "hobi": ["futsal"],\n' +
          '  "pesanan": [ { "no": 102, "barang": ["Tumbler"] } ] }',
        tanya: 'db.pelanggan.find({ "nama": "Dewi" })',
        penjaga:
          'Setiap pelanggan satu map dokumen (mirip JSON). Pesanannya ikut disimpan di dalam map itu. ' +
          'Lihat, dokumen Bima punya "kelas" dan "hobi", Dewi tidak — dan itu boleh! Kalau pelanggan makin banyak, cukup tambah server.'
      },
      {
        id: 'g-loker',
        icon: '🔑',
        name: 'Gudang Loker',
        tim: 'Tim 5',
        visual:
          'KUNCI                 NILAI\n' +
          'keranjang:dewi   →   "Kaos RPL, Stiker"\n' +
          'keranjang:bima   →   "Tumbler"\n' +
          'sesi:dewi        →   "token-a81f"\n' +
          'stok:tumbler     →   12',
        tanya: 'GET keranjang:dewi',
        penjaga:
          'Saya hanya kenal pasangan kunci → nilai, seperti loker bernomor. Kalau kamu tahu nomor lokernya, ' +
          'isinya saya berikan dalam sekejap. Tapi jangan tanya "siapa saja yang membeli kaos?" — saya tidak bisa mencari berdasarkan isi.'
      },
      {
        id: 'g-peta',
        icon: '🔗',
        name: 'Gudang Peta Relasi',
        tim: 'Tim 6',
        visual:
          '(Dewi) ──BERTEMAN──► (Bima)\n' +
          '  │                     │\n' +
          'MEMBELI              MEMBELI\n' +
          '  ▼                     ▼\n' +
          '(Kaos RPL)          (Tumbler)\n' +
          '  │\n' +
          '(Stiker) ◄──MEMBELI── (Dewi)',
        tanya:
          'MATCH (dewi)-[:BERTEMAN]->(teman)-[:MEMBELI]->(barang)\n' +
          'RETURN barang   // "Temanmu juga membeli…"',
        penjaga:
          'Saya menyimpan data sebagai simpul (orang, barang) dan garis hubungan (berteman, membeli). ' +
          'Menelusuri "teman dari teman" atau "yang juga dibeli temanmu" adalah keahlian saya.'
      }
    ],
    amatLabel: 'Catat hasil pengamatanmu',
    amatInstruction:
      'Dari keenam gudang di atas, <strong>pilih semua pernyataan</strong> yang sesuai dengan pengamatanmu.',
    amatan: [
      { id: 'o-bentuk', valid: true, text: 'Data yang sama dapat disimpan dengan struktur berbeda: pohon, jaringan, tabel, dokumen, kunci-nilai, atau simpul-garis.', feedback: 'Benar. Keenam gudang menyimpan data RPL Mart yang sama persis, tetapi strukturnya berbeda.' },
      { id: 'o-induk', valid: true, text: 'Di Gudang Pohon, setiap data hanya punya satu induk sehingga data yang sama bisa tertulis berulang.', feedback: 'Benar. Kaos RPL harus ditulis ulang di cabang Bima bila Bima juga membelinya.' },
      { id: 'o-skema', valid: true, text: 'Gudang Tabel memakai kolom yang tetap, sedangkan Gudang Map Dokumen membolehkan tiap data punya isian berbeda.', feedback: 'Benar. Dokumen Bima punya "kelas" dan "hobi", Dewi tidak. Di Gudang Tabel, kolom baru harus ditambahkan ke strukturnya dulu.' },
      { id: 'o-bahasa', valid: true, text: 'Cara bertanya ke tiap gudang berbeda; tidak semuanya memakai SQL.', feedback: 'Benar. Hanya Gudang Tabel yang memakai SELECT … JOIN. Gudang lain memakai find(), GET, MATCH, atau menelusuri jalur.' },
      { id: 'o-relasi', valid: true, text: 'Gudang Peta Relasi paling mudah menelusuri hubungan seperti "yang juga dibeli temanmu".', feedback: 'Benar. Hubungan disimpan langsung sebagai garis, sehingga penelusurannya cepat.' },
      { id: 'o-kunci', valid: true, text: 'Gudang Loker sangat cepat mengambil data asalkan kuncinya diketahui.', feedback: 'Benar. GET keranjang:dewi langsung dijawab, tetapi Gudang Loker tidak bisa mencari berdasarkan isi.' },
      { id: 'o-sama', valid: false, text: 'Semua gudang sebenarnya sama saja, hanya warna tampilannya yang berbeda.', feedback: 'Bukan. Perbedaannya ada pada struktur, aturan, dan cara bertanya — bukan pada tampilan.' },
      { id: 'o-sql', valid: false, text: 'Semua gudang wajib memakai perintah SQL seperti SELECT … FROM.', feedback: 'Bukan. Hanya Gudang Tabel yang memakai SQL.' },
      { id: 'o-terbaik', valid: false, text: 'Sudah pasti ada satu gudang yang paling baik untuk semua kebutuhan.', feedback: 'Belum tentu. Tiap gudang unggul di hal yang berbeda. Inilah yang akan kamu selidiki.' }
    ],
    cekLabel: 'Periksa pengamatan',
    lanjutLabel: 'Lanjut ke Rumusan Masalah →'
  },

  /* ==========================================================
     TAHAP 3 — Rumusan Masalah
     ========================================================== */
  masalah: {
    kicker: 'Tahap 3 · Rumusan Masalah',
    title: 'Apa yang Sebenarnya Harus Diselidiki?',
    goal: 'Merumuskan pertanyaan tentang jenis-jenis DBMS yang akan diselidiki.',
    ringkasLabel: 'Pengamatanmu sejauh ini',
    instruction: 'Pilih <strong>satu</strong> rumusan masalah yang paling tepat mewakili hasil pengamatanmu.',
    options: [
      {
        id: 'rm-jenis',
        correct: true,
        text: 'Apa saja jenis-jenis DBMS berdasarkan cara penyimpanan datanya, apa karakteristik masing-masing, dan kapan setiap jenis tepat dipakai?',
        feedback: 'Tepat. Rumusan ini mencakup semua perbedaan yang kamu amati dan mengarah ke penyelidikan tentang jenis dan karakteristik DBMS.'
      },
      {
        id: 'rm-mahal',
        correct: false,
        text: 'Merek DBMS apa yang harganya paling mahal?',
        feedback: 'Kurang tepat. Harga tidak menjelaskan mengapa struktur dan cara bertanya tiap gudang berbeda.'
      },
      {
        id: 'rm-warna',
        correct: false,
        text: 'Bagaimana cara mengganti warna tampilan tiap gudang agar lebih menarik?',
        feedback: 'Kurang tepat. Tampilan bukan pembeda jenis DBMS.'
      },
      {
        id: 'rm-sql',
        correct: false,
        text: 'Bagaimana cara menulis perintah SELECT di Gudang Tabel?',
        feedback: 'Terlalu sempit. Ini hanya membahas satu gudang, padahal yang kamu amati adalah perbedaan keenam gudang.'
      }
    ],
    cekLabel: 'Periksa rumusan',
    ownLabel: 'Pertanyaan penyelidikanmu',
    ownPrompt: 'Tulis satu pertanyaan yang ingin kamu jawab di tahap berikutnya.',
    ownPlaceholder: 'Contoh: Mengapa Gudang Map Dokumen boleh punya isian berbeda-beda, sedangkan Gudang Tabel tidak?',
    ownMin: 30,
    lanjutLabel: 'Lanjut ke Pengumpulan Data →'
  },

  /* ==========================================================
     TAHAP 4 — Pengumpulan Data
     ========================================================== */
  konsep: {
    kicker: 'Tahap 4 · Pengumpulan Data',
    title: 'Mengenal Jenis-jenis DBMS',
    goal: 'Mengumpulkan informasi tentang jenis-jenis DBMS dan karakteristiknya.',
    instruction: 'Buka semua kartu konsep di bawah. Cocokkan isinya dengan gudang yang kamu intip di tahap Stimulasi.',
    cards: [
      {
        id: 'c-model',
        icon: '🧭',
        term: 'Model Data: Pembeda Jenis DBMS',
        def: 'Jenis DBMS dibedakan terutama oleh model datanya, yaitu cara data disusun dan dihubungkan. Karakteristik yang biasa dibandingkan: struktur data, skema, bahasa kueri, konsistensi, dan skalabilitas.',
        example: 'Keenam gudang RPL Mart = enam model data yang berbeda.'
      },
      {
        id: 'c-hierarkis',
        icon: '🌳',
        term: 'DBMS Hierarkis',
        def: 'Data disusun seperti pohon. Setiap record anak hanya punya satu induk (relasi satu-ke-banyak). Data diakses dengan menelusuri dari akar. Model generasi awal (1960-an).',
        example: 'Contoh: IBM IMS, Windows Registry. = Gudang Pohon.'
      },
      {
        id: 'c-jaringan',
        icon: '🕸️',
        term: 'DBMS Jaringan (Network)',
        def: 'Pengembangan model hierarkis: satu record boleh punya banyak induk, dihubungkan dengan pointer sehingga mendukung relasi banyak-ke-banyak. Aksesnya tetap menelusuri jalur, dan strukturnya sulit diubah.',
        example: 'Contoh: IDMS, Integrated Data Store (IDS). = Gudang Jaring.'
      },
      {
        id: 'c-relasional',
        icon: '📋',
        term: 'DBMS Relasional (RDBMS)',
        def: 'Data disimpan dalam tabel (baris & kolom) yang dihubungkan dengan kunci (primary key & foreign key). Skemanya tetap, memakai bahasa standar SQL, dan menjamin transaksi ACID. Jenis yang paling banyak dipakai.',
        example: 'Contoh: MySQL, MariaDB, PostgreSQL, Oracle Database, SQL Server, SQLite. = Gudang Tabel.'
      },
      {
        id: 'c-objek',
        icon: '🧊',
        term: 'DBMS Berorientasi Objek (OODBMS)',
        def: 'Data disimpan sebagai objek lengkap dengan atribut dan perilakunya, sama seperti objek pada pemrograman berorientasi objek (class, pewarisan). Cocok untuk data kompleks seperti desain teknik/CAD.',
        example: 'Contoh: ObjectDB, db4o, Versant. Varian gabungannya disebut objek-relasional, misalnya PostgreSQL.'
      },
      {
        id: 'c-nosql',
        icon: '🚀',
        term: 'NoSQL (Not Only SQL)',
        def: 'Kelompok DBMS non-relasional yang muncul untuk data besar dan aplikasi web. Umumnya berskema fleksibel, mudah diskalakan horizontal (menambah server), dan banyak yang memakai konsistensi akhir (BASE). Terbagi menjadi empat jenis: dokumen, key-value, kolom lebar, dan graf.',
        example: 'NoSQL bukan berarti tanpa aturan atau tanpa kueri — bahasanya saja yang berbeda-beda.'
      },
      {
        id: 'c-dokumen',
        icon: '📄',
        term: 'NoSQL Dokumen',
        def: 'Data disimpan sebagai dokumen mirip JSON. Setiap dokumen boleh punya field berbeda, dan data terkait bisa disimpan bersarang di dalamnya.',
        example: 'Contoh: MongoDB, CouchDB, Firebase Firestore. = Gudang Map Dokumen.'
      },
      {
        id: 'c-kv',
        icon: '🔑',
        term: 'NoSQL Key-Value',
        def: 'Model paling sederhana: pasangan kunci → nilai. Sangat cepat membaca dan menulis bila kuncinya diketahui, tetapi tidak bisa mencari berdasarkan isi nilai.',
        example: 'Contoh: Redis, Riak KV. Dipakai untuk cache, sesi login, keranjang belanja. = Gudang Loker.'
      },
      {
        id: 'c-kolom',
        icon: '🧱',
        term: 'NoSQL Kolom Lebar (Wide-Column)',
        def: 'Data dikelompokkan dalam keluarga kolom; setiap baris boleh punya kolom berbeda dan jumlahnya bisa sangat banyak. Dirancang untuk menulis data berukuran raksasa dengan cepat di banyak server.',
        example: 'Contoh: Apache Cassandra, Apache HBase. Dipakai untuk log aktivitas dan data sensor (IoT).'
      },
      {
        id: 'c-graf',
        icon: '🔗',
        term: 'NoSQL Graf',
        def: 'Data disimpan sebagai simpul (node) dan garis hubungan (edge) yang masing-masing boleh punya properti. Unggul untuk menelusuri hubungan berlapis.',
        example: 'Contoh: Neo4j, Amazon Neptune. Dipakai untuk media sosial, rekomendasi, deteksi penipuan. = Gudang Peta Relasi.'
      },
      {
        id: 'c-banding',
        icon: '⚖️',
        term: 'ACID vs BASE · Vertikal vs Horizontal',
        def: 'ACID (Atomicity, Consistency, Isolation, Durability): data selalu konsisten di setiap transaksi — ciri RDBMS. BASE (Basically Available, Soft state, Eventually consistent): data selalu tersedia dan akhirnya konsisten — banyak dipakai NoSQL. Skala vertikal = memperkuat satu server; skala horizontal = menambah banyak server.',
        example: 'Transfer saldo butuh ACID. Jumlah "like" yang telat sedetik masih boleh (BASE).'
      }
    ],
    ujiTitle: 'Jodohkan jenis dengan cirinya',
    ujiInstruction: 'Ketuk satu istilah di kolom kiri, lalu ketuk ciri/pengertiannya di kolom kanan. Ketuk istilah yang sudah berpasangan untuk melepasnya.',
    terms: [
      { id: 't-hierarkis', label: 'Hierarkis' },
      { id: 't-jaringan', label: 'Jaringan' },
      { id: 't-relasional', label: 'Relasional' },
      { id: 't-objek', label: 'Berorientasi objek' },
      { id: 't-dokumen', label: 'Dokumen' },
      { id: 't-kv', label: 'Key-value' },
      { id: 't-kolom', label: 'Kolom lebar' },
      { id: 't-graf', label: 'Graf' },
      { id: 't-acid', label: 'ACID' },
      { id: 't-horizontal', label: 'Skala horizontal' }
    ],
    defs: [
      { id: 'd-hierarkis', label: 'Struktur pohon; setiap record anak hanya punya satu induk.' },
      { id: 'd-jaringan', label: 'Record boleh punya banyak induk yang dihubungkan dengan pointer.' },
      { id: 'd-relasional', label: 'Tabel baris-kolom yang dihubungkan dengan kunci dan dikueri dengan SQL.' },
      { id: 'd-objek', label: 'Menyimpan data sebagai objek beserta atribut dan perilakunya, seperti di pemrograman berorientasi objek.' },
      { id: 'd-dokumen', label: 'Menyimpan data sebagai dokumen mirip JSON yang isiannya boleh berbeda-beda.' },
      { id: 'd-kv', label: 'Pasangan kunci → nilai yang sangat cepat diambil bila kuncinya diketahui.' },
      { id: 'd-kolom', label: 'Keluarga kolom untuk data raksasa yang ditulis cepat di banyak server.' },
      { id: 'd-graf', label: 'Simpul dan garis hubungan untuk menelusuri relasi berlapis.' },
      { id: 'd-acid', label: 'Jaminan transaksi selalu utuh dan konsisten: berhasil semua atau batal semua.' },
      { id: 'd-horizontal', label: 'Menambah kapasitas dengan menambah banyak server, bukan memperkuat satu server.' }
    ],
    key: {
      't-hierarkis': 'd-hierarkis',
      't-jaringan': 'd-jaringan',
      't-relasional': 'd-relasional',
      't-objek': 'd-objek',
      't-dokumen': 'd-dokumen',
      't-kv': 'd-kv',
      't-kolom': 'd-kolom',
      't-graf': 'd-graf',
      't-acid': 'd-acid',
      't-horizontal': 'd-horizontal'
    },
    cekLabel: 'Periksa pasangan',
    ulangLabel: 'Kosongkan pasangan',
    lanjutLabel: 'Lanjut ke Pengolahan Data →'
  },

  /* ==========================================================
     TAHAP 5 — Pengolahan Data
     ========================================================== */
  olah: {
    kicker: 'Tahap 5 · Pengolahan Data',
    title: 'Lemari Arsip DBMS',
    goal: 'Mengolah informasi dengan mengelompokkan produk DBMS dan membandingkan karakteristik tiap jenis.',
    intro:
      'Laboratorium RPL sedang menyusun <strong>lemari arsip DBMS</strong>. Bantu merapikannya: ' +
      'kelompokkan produk DBMS ke laci jenisnya, lalu bandingkan karakteristik tiap kelompok.',
    produkLabel: 'Misi A · Kelompokkan produk DBMS ke jenisnya',
    produkInstruction: 'Ketuk satu kartu produk, lalu ketuk laci jenis yang tepat. Pada keyboard, fokuskan kartu lalu tekan angka 1–6.',
    produkColumns: [
      { id: 'relasional', name: 'Relasional', desc: 'tabel + SQL', colorKey: 'blue' },
      { id: 'dokumen', name: 'Dokumen', desc: 'dokumen mirip JSON', colorKey: 'green' },
      { id: 'kv', name: 'Key-Value', desc: 'kunci → nilai', colorKey: 'purple' },
      { id: 'kolom', name: 'Kolom Lebar', desc: 'keluarga kolom', colorKey: 'orange' },
      { id: 'graf', name: 'Graf', desc: 'simpul & hubungan', colorKey: 'teal' },
      { id: 'lama', name: 'Hierarkis / Jaringan', desc: 'model generasi awal', colorKey: 'rose' }
    ],
    /* entityId = id kolom yang benar (nama properti mengikuti
       pembantu chipBoard di app-core.js). */
    produkChips: [
      { id: 'pr-mysql', label: 'MySQL', entityId: 'relasional' },
      { id: 'pr-postgres', label: 'PostgreSQL', entityId: 'relasional' },
      { id: 'pr-oracle', label: 'Oracle Database', entityId: 'relasional' },
      { id: 'pr-sqlite', label: 'SQLite', entityId: 'relasional' },
      { id: 'pr-mongo', label: 'MongoDB', entityId: 'dokumen' },
      { id: 'pr-couch', label: 'CouchDB', entityId: 'dokumen' },
      { id: 'pr-redis', label: 'Redis', entityId: 'kv' },
      { id: 'pr-riak', label: 'Riak KV', entityId: 'kv' },
      { id: 'pr-cassandra', label: 'Apache Cassandra', entityId: 'kolom' },
      { id: 'pr-hbase', label: 'Apache HBase', entityId: 'kolom' },
      { id: 'pr-neo4j', label: 'Neo4j', entityId: 'graf' },
      { id: 'pr-neptune', label: 'Amazon Neptune', entityId: 'graf' },
      { id: 'pr-ims', label: 'IBM IMS', entityId: 'lama' },
      { id: 'pr-idms', label: 'IDMS', entityId: 'lama' }
    ],
    produkLabels: {
      pool: 'Kartu produk',
      poolEmpty: 'Semua produk sudah masuk laci',
      empty: 'Laci masih kosong'
    },
    ciriLabel: 'Misi B · Bandingkan karakteristiknya',
    ciriInstruction: 'Setiap kartu berisi satu karakteristik. Tempatkan ke kelompok DBMS yang paling sesuai.',
    ciriColumns: [
      { id: 'sql', name: 'Relasional (SQL)', desc: 'MySQL, PostgreSQL, …', colorKey: 'blue' },
      { id: 'nosql', name: 'NoSQL', desc: 'dokumen, key-value, kolom lebar, graf', colorKey: 'green' },
      { id: 'awal', name: 'Hierarkis & Jaringan', desc: 'IMS, IDMS', colorKey: 'rose' }
    ],
    ciriChips: [
      { id: 'ci-tabel', label: 'Data disimpan dalam tabel yang dihubungkan dengan kunci', entityId: 'sql' },
      { id: 'ci-skema-tetap', label: 'Skema tetap: struktur dibuat dulu sebelum data diisi', entityId: 'sql' },
      { id: 'ci-sql', label: 'Memakai bahasa kueri standar SQL', entityId: 'sql' },
      { id: 'ci-acid', label: 'Mengutamakan transaksi ACID (konsistensi ketat)', entityId: 'sql' },
      { id: 'ci-vertikal', label: 'Umumnya ditingkatkan dengan memperkuat satu server (skala vertikal)', entityId: 'sql' },
      { id: 'ci-fleksibel', label: 'Skema fleksibel: tiap data boleh punya isian berbeda', entityId: 'nosql' },
      { id: 'ci-ragam', label: 'Model datanya beragam: dokumen, kunci-nilai, kolom, graf', entityId: 'nosql' },
      { id: 'ci-horizontal', label: 'Dirancang untuk menambah banyak server (skala horizontal)', entityId: 'nosql' },
      { id: 'ci-base', label: 'Banyak yang memakai konsistensi akhir (BASE) demi kecepatan', entityId: 'nosql' },
      { id: 'ci-bahasa', label: 'Bahasa kuerinya berbeda-beda di setiap produk', entityId: 'nosql' },
      { id: 'ci-pointer', label: 'Data diakses dengan menelusuri jalur/pointer dari record ke record', entityId: 'awal' },
      { id: 'ci-mainframe', label: 'Model generasi awal, kini banyak tersisa di sistem mainframe lama', entityId: 'awal' },
      { id: 'ci-kaku', label: 'Mengubah struktur sulit karena program terikat pada jalur data', entityId: 'awal' }
    ],
    ciriLabels: {
      pool: 'Kartu karakteristik',
      poolEmpty: 'Semua karakteristik sudah dibandingkan',
      empty: 'Belum ada karakteristik'
    },
    cekLabel: 'Periksa',
    produkBenar: 'Semua produk tepat! Kini kamu bisa mengenali jenis DBMS dari nama produknya.',
    ciriBenar: 'Semua karakteristik tepat! Relasional unggul di konsistensi, NoSQL di fleksibilitas dan skala, model awal di penelusuran jalur.',
    salahPesan: 'Kartu bertanda ✗ perlu dipindah. Ketuk kartu itu untuk mengembalikannya, lalu tempatkan lagi.',
    lanjutLabel: 'Lanjut ke Verifikasi →'
  },

  /* ==========================================================
     TAHAP 6 — Verifikasi
     ========================================================== */
  uji: {
    kicker: 'Tahap 6 · Verifikasi',
    title: 'Konsultan DBMS',
    goal: 'Membuktikan pemahamanmu dengan memilih jenis DBMS yang tepat untuk kebutuhan nyata.',
    instruction:
      'RPL Mart makin besar dan punya kebutuhan baru. Kamu menjadi konsultan DBMS. Pilih jenis DBMS yang ' +
      'paling cocok untuk setiap kebutuhan, lalu buka buktinya.',
    prediksiLabel: 'Rekomendasimu: jenis DBMS apa?',
    bukaLabel: 'Buka bukti',
    benarPrediksi: 'Rekomendasimu tepat!',
    salahPrediksi: 'Rekomendasimu belum tepat — pelajari buktinya untuk tahu jenis yang paling cocok.',
    butuhLabel: 'Kebutuhan kunci',
    cocokLabel: 'Karakteristik yang cocok',
    bukanLabel: 'Mengapa bukan yang lain?',
    konsolLabel: 'Contoh perintah',
    /* Id pilihan pada setiap kasus memakai id jenis DBMS yang sama,
       sehingga label opsi diambil dari daftar jenis di bawah. */
    jenis: [
      { id: 'relasional', label: 'Relasional (mis. MySQL)' },
      { id: 'dokumen', label: 'NoSQL Dokumen (mis. MongoDB)' },
      { id: 'kv', label: 'NoSQL Key-Value (mis. Redis)' },
      { id: 'kolom', label: 'NoSQL Kolom Lebar (mis. Cassandra)' },
      { id: 'graf', label: 'NoSQL Graf (mis. Neo4j)' },
      { id: 'hierarkis', label: 'Hierarkis (mis. Windows Registry)' }
    ],
    cases: [
      {
        id: 'u-saldo',
        icon: '💳',
        title: 'Dompet digital koperasi',
        scenario: 'Siswa bisa mentransfer saldo koperasi ke temannya. Saldo tidak boleh berkurang di pengirim tanpa bertambah di penerima, walaupun server mati di tengah proses.',
        options: ['relasional', 'dokumen', 'kv', 'kolom'],
        correct: 'relasional',
        butuh: 'Setiap transfer harus utuh: berhasil semua atau batal semua. Konsistensi lebih penting daripada kecepatan.',
        cocok: 'RDBMS menjamin transaksi ACID dan menjaga relasi antartabel dengan kunci.',
        bukan: 'Key-value dan kolom lebar sering memakai konsistensi akhir (BASE), sehingga saldo bisa sempat tampil berbeda. Dokumen bisa, tetapi tabel saldo yang terstruktur dan transaksi ACID adalah keahlian utama RDBMS.',
        konsol: "BEGIN;\nUPDATE saldo SET jumlah = jumlah - 20000 WHERE nis = '2301';\nUPDATE saldo SET jumlah = jumlah + 20000 WHERE nis = '2302';\nCOMMIT;   -- bila gagal di tengah → ROLLBACK, saldo kembali utuh"
      },
      {
        id: 'u-katalog',
        icon: '👕',
        title: 'Katalog produk yang beragam',
        scenario: 'Kaos punya ukuran dan warna, tumbler punya kapasitas, stiker punya dimensi, dan tiap bulan muncul jenis produk baru dengan atribut baru.',
        options: ['dokumen', 'relasional', 'kv', 'hierarkis'],
        correct: 'dokumen',
        butuh: 'Atribut setiap produk berbeda-beda dan sering bertambah tanpa harus mengubah struktur.',
        cocok: 'Basis data dokumen berskema fleksibel: tiap dokumen boleh punya field sendiri.',
        bukan: 'Relasional mengharuskan kolom tetap, sehingga setiap atribut baru memerlukan ALTER TABLE atau banyak kolom kosong. Key-value tidak bisa mencari berdasarkan isi (mis. "kaos ukuran L").',
        konsol: 'db.produk.insertOne({ nama: "Kaos RPL", ukuran: ["M","L"], warna: "navy" })\ndb.produk.insertOne({ nama: "Tumbler", kapasitas_ml: 500 })\ndb.produk.find({ ukuran: "L" })'
      },
      {
        id: 'u-sesi',
        icon: '⚡',
        title: 'Flash sale 2.000 siswa',
        scenario: 'Saat flash sale, 2.000 siswa login bersamaan. Sesi login dan isi keranjang tiap siswa harus dibaca dalam hitungan milidetik berdasarkan ID sesinya.',
        options: ['kv', 'relasional', 'graf', 'hierarkis'],
        correct: 'kv',
        butuh: 'Membaca dan menulis data sederhana sangat cepat, dan kuncinya (ID sesi) selalu diketahui.',
        cocok: 'Basis data key-value menyimpan pasangan kunci → nilai, umumnya di memori, sehingga sangat cepat.',
        bukan: 'Relasional bisa, tetapi lebih lambat untuk beban baca-tulis sesaat sebesar ini. Graf dan hierarkis tidak dirancang untuk kebutuhan ini.',
        konsol: 'SET sesi:8f2a "nis=2301" EX 1800   -- kedaluwarsa 30 menit\nGET sesi:8f2a\n→ "nis=2301"   (0,3 milidetik)'
      },
      {
        id: 'u-rekom',
        icon: '🤝',
        title: '"Temanmu juga membeli…"',
        scenario: 'RPL Mart ingin menampilkan rekomendasi: barang yang dibeli oleh teman-temanmu, dan teman dari temanmu.',
        options: ['graf', 'relasional', 'kolom', 'kv'],
        correct: 'graf',
        butuh: 'Menelusuri hubungan berlapis (teman → teman → barang) dengan cepat.',
        cocok: 'Basis data graf menyimpan hubungan secara langsung sebagai garis (edge), sehingga penelusurannya cepat.',
        bukan: 'Relasional membutuhkan JOIN berulang yang makin lambat di setiap lapisan. Kolom lebar dan key-value tidak menyimpan hubungan.',
        konsol: 'MATCH (s:Siswa {nama:"Dewi"})-[:BERTEMAN*1..2]->(t)-[:MEMBELI]->(b)\nRETURN b.nama, count(*) AS jumlah ORDER BY jumlah DESC'
      },
      {
        id: 'u-log',
        icon: '📡',
        title: 'Jutaan data klik dan sensor',
        scenario: 'Setiap klik pengunjung dan data sensor suhu gudang dicatat. Jumlahnya jutaan baris per hari, terus ditulis tanpa henti, dan disebar ke banyak server.',
        options: ['kolom', 'relasional', 'hierarkis', 'graf'],
        correct: 'kolom',
        butuh: 'Menulis data berukuran raksasa dengan sangat cepat dan menambah server dengan mudah.',
        cocok: 'Basis data kolom lebar dirancang untuk penulisan masif dan skala horizontal.',
        bukan: 'Relasional pada satu server akan kewalahan dan mahal diperkuat (skala vertikal). Hierarkis dan graf tidak cocok untuk aliran data catatan waktu (time series).',
        konsol: "INSERT INTO klik (hari, waktu, halaman, id_sesi)\n  VALUES ('2026-09-23', toTimestamp(now()), '/produk/kaos', '8f2a');\n-- disebar otomatis ke 12 node cluster"
      },
      {
        id: 'u-registry',
        icon: '🗂️',
        title: 'Pengaturan aplikasi kasir',
        scenario: 'Aplikasi kasir di komputer Windows menyimpan pengaturannya berjenjang: HKEY → Software → RPLMart → Printer. Setiap kunci punya tepat satu induk dan dibaca dengan menelusuri dari akar.',
        options: ['hierarkis', 'graf', 'dokumen', 'relasional'],
        correct: 'hierarkis',
        butuh: 'Data berjenjang tetap, satu anak satu induk, dibaca dari atas ke bawah.',
        cocok: 'Windows Registry adalah basis data hierarkis: strukturnya berupa pohon kunci dan subkunci.',
        bukan: 'Graf dan dokumen bisa menyimpan pohon, tetapi Registry memang dibangun dengan model hierarkis. Relasional terlalu berat untuk pengaturan lokal sederhana.',
        konsol: 'HKEY_CURRENT_USER\n└── Software\n    └── RPLMart\n        └── Printer\n            ├── Nama   = "Thermal-58"\n            └── Lebar  = 58'
      }
    ],
    penutup: 'Semua kasus sudah dibuktikan. Tidak ada jenis DBMS yang terbaik untuk segalanya — yang ada adalah jenis yang paling cocok dengan kebutuhan.',
    lanjutLabel: 'Lanjut ke Generalisasi →'
  },

  /* ==========================================================
     TAHAP 7 — Generalisasi
     ========================================================== */
  simpulan: {
    kicker: 'Tahap 7 · Generalisasi',
    title: 'Menyimpulkan Perbandingan Jenis DBMS',
    goal: 'Merumuskan kesimpulan umum tentang jenis-jenis DBMS dan menguji pemahaman pada kasus baru.',
    instruction: 'Pilih <strong>semua</strong> pernyataan yang benar berdasarkan hasil penyelidikanmu.',
    statements: [
      { id: 's-model', valid: true, text: 'Jenis DBMS dibedakan berdasarkan model datanya, yaitu cara data disusun dan dihubungkan.', feedback: 'Benar. Keenam gudang RPL Mart menyimpan data yang sama dengan model berbeda.' },
      { id: 's-relasional', valid: true, text: 'DBMS relasional menyimpan data dalam tabel berskema tetap, memakai SQL, dan menjamin transaksi ACID.', feedback: 'Benar. Terbukti pada kasus dompet digital koperasi.' },
      { id: 's-nosql', valid: true, text: 'NoSQL terdiri atas jenis dokumen, key-value, kolom lebar, dan graf; umumnya berskema fleksibel dan mudah diskalakan horizontal.', feedback: 'Benar. Terbukti pada kasus katalog, flash sale, rekomendasi, dan data sensor.' },
      { id: 's-awal', valid: true, text: 'Model hierarkis (satu induk) dan jaringan (banyak induk lewat pointer) adalah model awal yang aksesnya menelusuri jalur.', feedback: 'Benar. Seperti Gudang Pohon, Gudang Jaring, dan Windows Registry.' },
      { id: 's-pilih', valid: true, text: 'Jenis DBMS dipilih sesuai kebutuhan: bentuk data, tingkat konsistensi, kecepatan, dan skala.', feedback: 'Benar. Setiap kasus di tahap Verifikasi punya jawaban yang berbeda.' },
      { id: 's-tanpa', valid: false, text: 'NoSQL berarti tidak punya aturan sama sekali dan datanya tidak bisa dikueri.', feedback: 'Keliru. NoSQL = Not Only SQL. Datanya tetap bisa dikueri, hanya bahasanya berbeda (find, GET, MATCH, …).' },
      { id: 's-usang', valid: false, text: 'DBMS relasional sudah usang dan tidak dipakai lagi karena ada NoSQL.', feedback: 'Keliru. RDBMS masih menjadi jenis yang paling banyak dipakai, terutama untuk data transaksi.' },
      { id: 's-satu', valid: false, text: 'Satu jenis DBMS pasti paling baik untuk semua aplikasi.', feedback: 'Keliru. Banyak aplikasi besar bahkan memakai beberapa jenis DBMS sekaligus (polyglot persistence).' }
    ],
    cekLabel: 'Periksa pernyataan',
    kesimpulanLabel: 'Kesimpulanmu',
    kesimpulanPrompt: 'Dengan kata-katamu sendiri: sebutkan jenis-jenis DBMS dan bandingkan karakteristik utamanya.',
    kesimpulanPlaceholder: 'Jenis-jenis DBMS antara lain … Perbedaannya, DBMS relasional … sedangkan NoSQL …',
    kesimpulanMin: 80,
    kuisLabel: 'Uji pemahaman: Aplikasi OSIS',
    kuisIntro:
      'OSIS membangun aplikasi sekolah: data anggota, iuran kas, forum pertemanan, dan papan pengumuman. ' +
      'Jawab soal berikut.',
    questions: [
      {
        id: 'q-mongo',
        prompt: 'OSIS menyimpan data pengumuman dengan MongoDB. MongoDB termasuk jenis DBMS…',
        options: [
          { id: 'a', label: 'NoSQL dokumen' },
          { id: 'b', label: 'Relasional' },
          { id: 'c', label: 'Hierarkis' },
          { id: 'd', label: 'NoSQL graf' }
        ],
        correct: 'a',
        explanation: 'MongoDB menyimpan data sebagai dokumen mirip JSON (BSON) yang skemanya fleksibel.'
      },
      {
        id: 'q-kas',
        prompt: 'Pencatatan iuran kas OSIS tidak boleh salah hitung walaupun dua bendahara menyimpan bersamaan. Jenis yang paling cocok adalah…',
        options: [
          { id: 'a', label: 'Relasional, karena menjamin transaksi ACID' },
          { id: 'b', label: 'Key-value, karena paling cepat' },
          { id: 'c', label: 'Kolom lebar, karena mudah menambah server' },
          { id: 'd', label: 'Hierarkis, karena berbentuk pohon' }
        ],
        correct: 'a',
        explanation: 'Data keuangan membutuhkan konsistensi ketat. Jaminan ACID adalah kekuatan utama RDBMS.'
      },
      {
        id: 'q-teman',
        prompt: 'Fitur "Kenalan yang mungkin kamu kenal" (teman dari teman) paling tepat memakai…',
        options: [
          { id: 'a', label: 'NoSQL graf' },
          { id: 'b', label: 'NoSQL key-value' },
          { id: 'c', label: 'Hierarkis' },
          { id: 'd', label: 'NoSQL kolom lebar' }
        ],
        correct: 'a',
        explanation: 'Basis data graf menyimpan hubungan sebagai garis sehingga penelusuran berlapis menjadi cepat.'
      },
      {
        id: 'q-induk',
        prompt: 'Model DBMS yang setiap record anaknya hanya boleh memiliki SATU induk adalah…',
        options: [
          { id: 'a', label: 'Hierarkis' },
          { id: 'b', label: 'Jaringan' },
          { id: 'c', label: 'Relasional' },
          { id: 'd', label: 'Graf' }
        ],
        correct: 'a',
        explanation: 'Model hierarkis berbentuk pohon (satu induk). Model jaringan membolehkan banyak induk.'
      },
      {
        id: 'q-skala',
        prompt: 'Pengguna aplikasi OSIS melonjak. Tim memilih menambah banyak server murah daripada membeli satu server super. Cara ini disebut…',
        options: [
          { id: 'a', label: 'Skala horizontal, ciri umum NoSQL' },
          { id: 'b', label: 'Skala vertikal, ciri umum NoSQL' },
          { id: 'c', label: 'Normalisasi' },
          { id: 'd', label: 'Transaksi ACID' }
        ],
        correct: 'a',
        explanation: 'Menambah banyak server = skala horizontal. Memperkuat satu server = skala vertikal.'
      },
      {
        id: 'q-ciri',
        prompt: 'Manakah pernyataan yang BENAR tentang perbandingan relasional dan NoSQL?',
        options: [
          { id: 'a', label: 'Relasional berskema tetap dan memakai SQL; NoSQL umumnya berskema fleksibel dengan bahasa kueri yang beragam.' },
          { id: 'b', label: 'Relasional berskema fleksibel; NoSQL wajib memakai tabel.' },
          { id: 'c', label: 'Keduanya sama persis, hanya berbeda nama produk.' },
          { id: 'd', label: 'NoSQL tidak dapat menyimpan data dalam jumlah besar.' }
        ],
        correct: 'a',
        explanation: 'Skema dan bahasa kueri adalah dua pembeda utama relasional dan NoSQL.'
      }
    ],
    kuisCekLabel: 'Periksa jawaban',
    kuisUlangLabel: 'Kerjakan ulang',
    lanjutLabel: 'Lanjut ke Refleksi →'
  },

  /* ==========================================================
     TAHAP 8 — Refleksi
     ========================================================== */
  refleksi: {
    kicker: 'Tahap 8 · Refleksi',
    title: 'Melihat Kembali Perjalanan Belajarmu',
    goal: 'Menilai pemahaman diri dan cara belajarmu.',
    note: 'Tidak ada jawaban benar atau salah di tahap ini. Jawablah dengan jujur.',
    recallLabel: 'Rekomendasimu saat menjadi konsultan',
    recallKosong: 'Belum ada rekomendasi yang tersimpan.',
    skalaLabel: 'Seberapa yakin kamu sekarang?',
    skala: [
      { value: 1, label: 'Belum' },
      { value: 2, label: 'Sedikit' },
      { value: 3, label: 'Cukup' },
      { value: 4, label: 'Yakin' },
      { value: 5, label: 'Sangat' }
    ],
    skalaItems: [
      { id: 'l-jenis', text: 'Saya dapat menyebutkan jenis-jenis DBMS berdasarkan model datanya.' },
      { id: 'l-produk', text: 'Saya dapat mengelompokkan contoh produk DBMS ke dalam jenisnya.' },
      { id: 'l-banding', text: 'Saya dapat membandingkan karakteristik DBMS relasional dan NoSQL.' },
      { id: 'l-pilih', text: 'Saya dapat memilih jenis DBMS yang tepat untuk suatu kebutuhan beserta alasannya.' }
    ],
    prompts: [
      { id: 'p-kejut', question: 'Gudang mana yang paling menarik bagimu? Mengapa?', placeholder: 'Gudang yang paling menarik bagiku adalah …' },
      { id: 'p-terap', question: 'Jika kamu membuat aplikasi impianmu, jenis DBMS apa yang akan kamu pakai dan apa alasannya?', placeholder: 'Aplikasiku adalah … aku akan memakai … karena …' }
    ],
    simpanLabel: 'Simpan refleksi',
    tersimpan: 'Refleksi tersimpan.',
    lanjutLabel: 'Lihat hasil akhir →'
  },

  /* ==========================================================
     TAHAP 9 — Selesai
     ========================================================== */
  selesai: {
    kicker: 'Tahap 9 · Selesai',
    title: 'Penyelidikan Selesai!',
    skorLabel: 'Rincian skor',
    bandingLabel: 'Tabel perbandingan jenis DBMS',
    bandingHeaders: ['Jenis', 'Struktur data', 'Skema', 'Bahasa kueri', 'Contoh produk', 'Cocok untuk'],
    banding: [
      ['Hierarkis', 'Pohon, satu induk', 'Tetap', 'Navigasi jalur', 'IBM IMS, Windows Registry', 'Data berjenjang, sistem mainframe lama'],
      ['Jaringan', 'Record + pointer, banyak induk', 'Tetap', 'Navigasi pointer', 'IDMS', 'Sistem lama dengan relasi banyak-ke-banyak'],
      ['Relasional', 'Tabel baris-kolom + kunci', 'Tetap', 'SQL', 'MySQL, PostgreSQL, Oracle, SQLite', 'Transaksi & data terstruktur (ACID)'],
      ['Berorientasi objek', 'Objek + atribut + perilaku', 'Mengikuti class', 'OQL / bahasa pemrograman', 'ObjectDB, db4o', 'Data kompleks (CAD, multimedia)'],
      ['NoSQL dokumen', 'Dokumen mirip JSON', 'Fleksibel', 'API/kueri dokumen', 'MongoDB, CouchDB, Firestore', 'Katalog, konten, profil pengguna'],
      ['NoSQL key-value', 'Pasangan kunci → nilai', 'Fleksibel', 'GET/SET', 'Redis, Riak KV', 'Cache, sesi, keranjang belanja'],
      ['NoSQL kolom lebar', 'Keluarga kolom', 'Fleksibel', 'CQL, API', 'Cassandra, HBase', 'Log, data sensor, big data'],
      ['NoSQL graf', 'Simpul + garis hubungan', 'Fleksibel', 'Cypher, Gremlin', 'Neo4j, Amazon Neptune', 'Media sosial, rekomendasi']
    ],
    kesimpulanLabel: 'Kesimpulanmu',
    konsepKunci: [
      'Jenis DBMS dibedakan berdasarkan model data: hierarkis, jaringan, relasional, berorientasi objek, dan NoSQL.',
      'NoSQL terbagi menjadi empat: dokumen, key-value, kolom lebar, dan graf.',
      'Relasional: tabel, skema tetap, SQL, ACID, umumnya skala vertikal.',
      'NoSQL: skema fleksibel, model beragam, skala horizontal, banyak yang memakai BASE.',
      'Hierarkis & jaringan: model awal yang aksesnya menelusuri jalur/pointer.',
      'Tidak ada DBMS terbaik untuk semua hal — pilih sesuai kebutuhan data dan aplikasinya.'
    ],
    lanjutLabel: 'Langkah berikutnya',
    lanjut: [
      'Coba MySQL/MariaDB (lewat XAMPP) dan MongoDB (lewat MongoDB Atlas versi gratis), lalu bandingkan cara menyimpan data yang sama.',
      'Cari tahu jenis DBMS yang dipakai aplikasi favoritmu (misalnya dari blog teknik perusahaannya).'
    ],
    ulangLabel: 'Ulangi dari awal',
    ulangKonfirmasi: 'Reset seluruh progres materi ini? Semua jawaban akan dihapus dan pilihan jawaban diacak ulang.',
    berandaLabel: 'Kembali ke beranda'
  }
};

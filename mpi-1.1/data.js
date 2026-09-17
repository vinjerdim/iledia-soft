'use strict';

const DATA = {

  meta: {
    title: 'Konsep Dasar Basis Data Relasional',
    subject: 'Rekayasa Perangkat Lunak — Fase F',
    goal: 'Mengidentifikasi konsep dasar basis data relasional dan pentingnya perancangan struktur data dalam pengembangan perangkat lunak.'
  },

  activityFlow: [
    {
      title: 'Orientasi',
      description: 'Murid memahami tujuan belajar, manfaat materi, dan alur aktivitas pada media.'
    },
    {
      title: 'Aktivasi pengetahuan awal',
      description: 'Murid membedakan data mentah, informasi, dan basis data melalui contoh singkat.'
    },
    {
      title: 'Eksplorasi konsep inti',
      description: 'Murid mengenali istilah tabel, record, field, dan relasi sederhana pada contoh nyata.'
    },
    {
      title: 'Analisis studi kasus',
      description: 'Murid menelaah kebutuhan data pada sistem absensi siswa agar tahu data apa yang perlu disimpan.'
    },
    {
      title: 'Simulasi penyusunan struktur',
      description: 'Murid menempatkan kolom ke tabel yang tepat untuk melihat bagaimana data menjadi lebih rapi dan mudah dikembangkan.'
    },
    {
      title: 'Evaluasi rancangan',
      description: 'Murid menilai rancangan yang lebih baik dan menjelaskan dampak struktur data terhadap kualitas perangkat lunak.'
    },
    {
      title: 'Refleksi',
      description: 'Murid menyimpulkan pelajaran utama dan menghubungkannya dengan praktik pengembangan aplikasi.'
    }
  ],

  activation: {
    instruction: 'Pilih kategori yang paling tepat untuk setiap contoh berikut.',
    categories: [
      { id: 'data', label: 'Data Mentah' },
      { id: 'informasi', label: 'Informasi' },
      { id: 'basisdata', label: 'Basis Data' }
    ],
    items: [
      {
        id: 'act1',
        label: 'NIS: 24017',
        correct: 'data',
        feedback: {
          data: 'Tepat. Ini adalah satu butir fakta tunggal yang belum diolah lebih jauh.',
          informasi: 'Belum tepat. Informasi biasanya sudah memberi makna atau rangkuman, sedangkan "NIS: 24017" masih berupa data tunggal.',
          basisdata: 'Belum tepat. Basis data adalah kumpulan data terstruktur, bukan satu nilai saja.'
        }
      },
      {
        id: 'act2',
        label: '28 dari 32 siswa hadir pada pelajaran Basis Data hari ini.',
        correct: 'informasi',
        feedback: {
          data: 'Belum tepat. Kalimat ini sudah merupakan hasil olahan dari banyak data kehadiran.',
          informasi: 'Tepat. Ini adalah ringkasan yang memberi makna bagi guru atau wali kelas.',
          basisdata: 'Belum tepat. Basis data menyimpan data, sedangkan kalimat ini adalah hasil pembacaan/olahan data.'
        }
      },
      {
        id: 'act3',
        label: 'Kumpulan tabel Siswa, Mata Pelajaran, dan Absensi yang saling terhubung di aplikasi sekolah.',
        correct: 'basisdata',
        feedback: {
          data: 'Belum tepat. Ini bukan satu fakta tunggal, melainkan susunan data yang terorganisasi.',
          informasi: 'Belum tepat. Ini bukan ringkasan hasil analisis, melainkan wadah penyimpanan data.',
          basisdata: 'Tepat. Basis data relasional menyimpan beberapa tabel yang saling berkaitan.'
        }
      },
      {
        id: 'act4',
        label: 'Tanggal absen: 2026-09-17',
        correct: 'data',
        feedback: {
          data: 'Tepat. Ini adalah satu nilai data yang bisa disimpan pada sebuah kolom.',
          informasi: 'Belum tepat. Nilai tanggal ini belum menjelaskan kondisi atau makna yang lebih luas.',
          basisdata: 'Belum tepat. Satu tanggal bukanlah sebuah basis data.'
        }
      },
      {
        id: 'act5',
        label: 'Kelas XI RPL 1 memiliki tingkat kehadiran tertinggi minggu ini.',
        correct: 'informasi',
        feedback: {
          data: 'Belum tepat. Ini bukan butir data mentah, tetapi hasil pengolahan banyak catatan kehadiran.',
          informasi: 'Tepat. Kalimat ini membantu pengambilan keputusan karena sudah bermakna.',
          basisdata: 'Belum tepat. Basis data menyimpan data sumbernya, sedangkan ini adalah hasil pembacaan.'
        }
      },
      {
        id: 'act6',
        label: 'Sistem yang memungkinkan guru mencari riwayat kehadiran siswa berdasarkan NIS dan tanggal.',
        correct: 'basisdata',
        feedback: {
          data: 'Belum tepat. Kalimat ini menjelaskan fungsi penyimpanan, bukan satu nilai data.',
          informasi: 'Belum tepat. Ini menggambarkan kemampuan sistem penyimpanan data, bukan hasil olahan data.',
          basisdata: 'Tepat. Kemampuan mencari, menyaring, dan memperbarui data adalah ciri penggunaan basis data.'
        }
      }
    ]
  },

  conceptLab: {
    intro: 'Amati contoh struktur sederhana berikut, lalu jawab pertanyaan untuk menguatkan istilah dasar basis data relasional.',
    tables: [
      {
        title: 'Tabel Siswa',
        columns: ['nis', 'nama_siswa', 'kelas'],
        rows: [
          ['A001', 'Alya Putri', 'XI RPL 1'],
          ['A002', 'Bima Saputra', 'XI RPL 1']
        ]
      },
      {
        title: 'Tabel Absensi',
        columns: ['id_absensi', 'nis', 'tanggal_absen', 'status_kehadiran'],
        rows: [
          ['ABS-01', 'A001', '2026-09-17', 'Hadir'],
          ['ABS-02', 'A002', '2026-09-17', 'Izin']
        ]
      }
    ],
    questions: [
      {
        id: 'cq1',
        prompt: 'Kolom `kelas` pada Tabel Siswa adalah contoh ...',
        correct: 'field',
        options: [
          { id: 'field', label: 'field / kolom' },
          { id: 'record', label: 'record / baris' },
          { id: 'relation', label: 'relasi antartabel' }
        ],
        feedback: {
          field: 'Tepat. Field atau kolom berisi jenis data yang sama untuk semua baris.',
          record: 'Belum tepat. Record adalah satu baris utuh, bukan nama kolom.',
          relation: 'Belum tepat. Relasi menjelaskan hubungan antartabel, bukan komponen di dalam satu tabel.'
        }
      },
      {
        id: 'cq2',
        prompt: 'Baris `A001 | Alya Putri | XI RPL 1` pada Tabel Siswa adalah contoh ...',
        correct: 'record',
        options: [
          { id: 'field', label: 'field / kolom' },
          { id: 'record', label: 'record / baris' },
          { id: 'schema', label: 'struktur keseluruhan basis data' }
        ],
        feedback: {
          field: 'Belum tepat. Field hanya satu kolom, sedangkan contoh ini terdiri dari beberapa nilai dalam satu baris.',
          record: 'Tepat. Record mewakili satu data lengkap tentang satu objek, dalam hal ini satu siswa.',
          schema: 'Belum tepat. Schema adalah rancangan umum, bukan satu baris data.'
        }
      },
      {
        id: 'cq3',
        prompt: 'Mengapa kolom `nis` muncul pada Tabel Siswa dan juga Tabel Absensi?',
        correct: 'link',
        options: [
          { id: 'link', label: 'Untuk menghubungkan data absensi ke siswa yang tepat.' },
          { id: 'speed', label: 'Agar semua tabel punya jumlah kolom yang sama.' },
          { id: 'decor', label: 'Supaya tampilan tabel terlihat lebih formal.' }
        ],
        feedback: {
          link: 'Tepat. Nilai yang sama dipakai sebagai penghubung agar sistem tahu absensi milik siswa yang mana.',
          speed: 'Belum tepat. Jumlah kolom tidak harus sama antartabel.',
          decor: 'Belum tepat. Tujuan utamanya adalah hubungan data, bukan tampilan.'
        }
      },
      {
        id: 'cq4',
        prompt: 'Mengapa nama siswa sebaiknya tidak diketik ulang di setiap baris absensi?',
        correct: 'duplication',
        options: [
          { id: 'duplication', label: 'Karena akan menimbulkan duplikasi data dan menyulitkan pembaruan.' },
          { id: 'forbidden', label: 'Karena semua tabel harus selalu berisi angka.' },
          { id: 'shorter', label: 'Karena nama siswa terlalu panjang untuk disimpan di basis data.' }
        ],
        feedback: {
          duplication: 'Tepat. Struktur yang baik mengurangi duplikasi sehingga data lebih konsisten saat diperbarui.',
          forbidden: 'Belum tepat. Basis data boleh menyimpan teks; masalah utamanya adalah duplikasi dan konsistensi.',
          shorter: 'Belum tepat. Nama boleh disimpan, tetapi tidak perlu diulang di setiap catatan absensi jika sudah ada tabel Siswa.'
        }
      }
    ]
  },

  caseStudy: {
    title: 'Studi Kasus: Aplikasi Absensi Siswa',
    instruction: 'Baca narasi berikut. Lalu tentukan data tersebut paling tepat dikelompokkan ke bagian mana agar struktur sistem tetap rapi.',
    paragraphs: [
      'SMK Cipta Karya ingin membuat aplikasi absensi siswa untuk membantu guru mencatat kehadiran setiap pertemuan.',
      'Setiap siswa memiliki NIS, nama siswa, dan kelas.',
      'Pada setiap pertemuan, guru memilih mata pelajaran yang diajar. Data mata pelajaran yang perlu disimpan adalah kode mapel, nama mapel, dan jam mulai.',
      'Ketika absensi dilakukan, sistem mencatat tanggal absen, status kehadiran, NIS siswa, dan kode mapel yang dipelajari pada pertemuan tersebut.',
      'Sekolah juga ingin menampilkan slogan sekolah dan warna tema aplikasi pada dashboard, tetapi keduanya tidak memengaruhi pencatatan absensi.'
    ],
    categories: [
      { id: 'siswa', label: 'Data Siswa' },
      { id: 'mapel', label: 'Data Mata Pelajaran' },
      { id: 'absensi', label: 'Data Absensi' },
      { id: 'bukan', label: 'Bukan Prioritas Struktur Inti' }
    ],
    items: [
      {
        id: 'case1',
        label: 'nis',
        correct: 'siswa',
        feedback: {
          siswa: 'Tepat. NIS adalah identitas utama milik siswa.',
          mapel: 'Belum tepat. NIS tidak mendeskripsikan mata pelajaran.',
          absensi: 'Belum tepat. Catatan absensi memang memakai NIS sebagai penghubung, tetapi sumber datanya tetap berasal dari data siswa.',
          bukan: 'Belum tepat. NIS adalah data inti yang wajib ada dalam sistem absensi.'
        }
      },
      {
        id: 'case2',
        label: 'nama_siswa',
        correct: 'siswa',
        feedback: {
          siswa: 'Tepat. Nama siswa adalah atribut inti pada data siswa.',
          mapel: 'Belum tepat. Nama siswa bukan deskripsi mata pelajaran.',
          absensi: 'Belum tepat. Nama siswa tidak perlu menjadi fokus tabel transaksi absensi.',
          bukan: 'Belum tepat. Nama siswa tetap diperlukan agar data mudah dibaca manusia.'
        }
      },
      {
        id: 'case3',
        label: 'kelas',
        correct: 'siswa',
        feedback: {
          siswa: 'Tepat. Kelas menjelaskan identitas akademik seorang siswa.',
          mapel: 'Belum tepat. Kelas bukan atribut milik mata pelajaran.',
          absensi: 'Belum tepat. Kelas bisa dibaca dari data siswa, jadi tidak perlu menjadi pusat catatan absensi.',
          bukan: 'Belum tepat. Kelas membantu laporan kehadiran per rombongan belajar.'
        }
      },
      {
        id: 'case4',
        label: 'kode_mapel',
        correct: 'mapel',
        feedback: {
          siswa: 'Belum tepat. Kode mapel tidak mendeskripsikan siswa.',
          mapel: 'Tepat. Kode mapel adalah identitas utama untuk data mata pelajaran.',
          absensi: 'Belum tepat. Tabel absensi akan memakai kode mapel sebagai penghubung, tetapi asalnya dari data mata pelajaran.',
          bukan: 'Belum tepat. Kode mapel adalah bagian inti dalam sistem.'
        }
      },
      {
        id: 'case5',
        label: 'nama_mapel',
        correct: 'mapel',
        feedback: {
          siswa: 'Belum tepat. Nama mata pelajaran tidak mendeskripsikan siswa.',
          mapel: 'Tepat. Nama mapel termasuk informasi utama pada data mata pelajaran.',
          absensi: 'Belum tepat. Jika nama mapel diulang terus di setiap absensi, duplikasi akan bertambah.',
          bukan: 'Belum tepat. Nama mapel tetap perlu disimpan agar catatan mudah dipahami.'
        }
      },
      {
        id: 'case6',
        label: 'jam_mulai',
        correct: 'mapel',
        feedback: {
          siswa: 'Belum tepat. Jam mulai tidak menggambarkan identitas siswa.',
          mapel: 'Tepat. Dalam skenario ini, jam mulai disimpan sebagai bagian dari data pelajaran/pertemuan yang dipilih guru.',
          absensi: 'Kurang tepat. Jam mulai bisa dibaca dari konteks mapel/jadwal, tidak harus diulang di semua catatan absensi.',
          bukan: 'Belum tepat. Jam mulai masih relevan untuk konteks absensi.'
        }
      },
      {
        id: 'case7',
        label: 'tanggal_absen',
        correct: 'absensi',
        feedback: {
          siswa: 'Belum tepat. Tanggal absen bukan identitas permanen siswa.',
          mapel: 'Belum tepat. Tanggal absen tidak mendeskripsikan data mapel.',
          absensi: 'Tepat. Ini adalah data transaksi/kejadian absensi.',
          bukan: 'Belum tepat. Tanggal absen adalah data inti pada pencatatan kehadiran.'
        }
      },
      {
        id: 'case8',
        label: 'status_kehadiran',
        correct: 'absensi',
        feedback: {
          siswa: 'Belum tepat. Status hadir berubah tiap pertemuan, jadi bukan identitas siswa.',
          mapel: 'Belum tepat. Status hadir tidak menjelaskan mata pelajaran.',
          absensi: 'Tepat. Status hadir, izin, sakit, atau alfa adalah isi utama transaksi absensi.',
          bukan: 'Belum tepat. Tanpa status kehadiran, sistem absensi tidak punya makna.'
        }
      },
      {
        id: 'case9',
        label: 'slogan_sekolah',
        correct: 'bukan',
        feedback: {
          siswa: 'Belum tepat. Slogan sekolah tidak mendeskripsikan siswa.',
          mapel: 'Belum tepat. Slogan sekolah bukan data mata pelajaran.',
          absensi: 'Belum tepat. Slogan sekolah tidak memengaruhi proses pencatatan absensi.',
          bukan: 'Tepat. Ini bisa tampil di antarmuka, tetapi bukan struktur inti data absensi.'
        }
      },
      {
        id: 'case10',
        label: 'warna_tema_aplikasi',
        correct: 'bukan',
        feedback: {
          siswa: 'Belum tepat. Warna tema aplikasi bukan data siswa.',
          mapel: 'Belum tepat. Warna tema aplikasi bukan data mata pelajaran.',
          absensi: 'Belum tepat. Warna tema tidak memengaruhi isi transaksi absensi.',
          bukan: 'Tepat. Ini kebutuhan antarmuka, bukan struktur data inti.'
        }
      }
    ]
  },

  structureMap: {
    instruction: 'Klik atribut untuk memilihnya, lalu klik nama tabel yang paling tepat. Tujuannya bukan sekadar menghafal, tetapi memahami mengapa data perlu dipisahkan.',
    entities: [
      { id: 'siswa', label: 'Tabel Siswa', colorKey: 'blue' },
      { id: 'mapel', label: 'Tabel Mata Pelajaran', colorKey: 'green' },
      { id: 'absensi', label: 'Tabel Absensi', colorKey: 'orange' }
    ],
    attributes: [
      { id: 'nis', label: 'nis', entityId: 'siswa' },
      { id: 'nama_siswa', label: 'nama_siswa', entityId: 'siswa' },
      { id: 'kelas', label: 'kelas', entityId: 'siswa' },
      { id: 'kode_mapel', label: 'kode_mapel', entityId: 'mapel' },
      { id: 'nama_mapel', label: 'nama_mapel', entityId: 'mapel' },
      { id: 'jam_mulai', label: 'jam_mulai', entityId: 'mapel' },
      { id: 'id_absensi', label: 'id_absensi', entityId: 'absensi' },
      { id: 'tanggal_absen', label: 'tanggal_absen', entityId: 'absensi' },
      { id: 'status_kehadiran', label: 'status_kehadiran', entityId: 'absensi' },
      { id: 'nis_absensi', label: 'nis', entityId: 'absensi' },
      { id: 'kode_mapel_absensi', label: 'kode_mapel', entityId: 'absensi' }
    ]
  },

  evaluation: {
    title: 'Menilai Rancangan Struktur Data',
    prompt: 'Pilih rancangan yang lebih siap dipakai mengembangkan aplikasi absensi, lalu pilih alasan yang paling kuat.',
    designs: [
      {
        id: 'flat',
        label: 'Rancangan A — Satu tabel besar',
        description: 'Semua data siswa, mapel, dan absensi ditulis berulang dalam satu tabel panjang.',
        rows: [
          ['nis', 'nama_siswa', 'kelas', 'kode_mapel', 'nama_mapel', 'tanggal_absen', 'status'],
          ['A001', 'Alya Putri', 'XI RPL 1', 'BD01', 'Basis Data', '2026-09-17', 'Hadir'],
          ['A001', 'Alya Putri', 'XI RPL 1', 'BD01', 'Basis Data', '2026-09-24', 'Hadir']
        ]
      },
      {
        id: 'relational',
        label: 'Rancangan B — Tabel terpisah dan saling terhubung',
        description: 'Data siswa, mata pelajaran, dan absensi dipisahkan sesuai fungsi masing-masing.',
        rows: [
          ['Siswa: nis, nama_siswa, kelas'],
          ['Mapel: kode_mapel, nama_mapel, jam_mulai'],
          ['Absensi: id_absensi, nis, kode_mapel, tanggal_absen, status_kehadiran']
        ]
      }
    ],
    correctDesign: 'relational',
    reasons: [
      { id: 'er1', label: 'Perubahan nama mapel cukup diperbarui di satu tempat.', isGood: true },
      { id: 'er2', label: 'Riwayat absensi lebih mudah dicari tanpa mengulang semua identitas siswa.', isGood: true },
      { id: 'er3', label: 'Setiap tabel fokus pada satu jenis data sehingga struktur lebih jelas.', isGood: true },
      { id: 'er4', label: 'Lebih banyak tabel pasti membuat aplikasi otomatis lebih cepat dalam semua kondisi.', isGood: false },
      { id: 'er5', label: 'Tabel yang terpisah membantu mengurangi duplikasi data.', isGood: true }
    ],
    feedback: {
      perfect: 'Pilihanmu tepat. Rancangan B lebih sesuai untuk basis data relasional karena memisahkan data berdasarkan fungsi, mengurangi duplikasi, dan memudahkan pengembangan fitur seperti pencarian, rekap, maupun perbaikan data.',
      partial: 'Rancanganmu sudah mengarah benar karena memilih Rancangan B, tetapi alasan yang dipilih belum sepenuhnya kuat. Fokus utama struktur relasional adalah kejelasan fungsi tabel, minim duplikasi, dan kemudahan pemeliharaan data.',
      wrong: 'Coba perhatikan ulang. Jika semua data diletakkan dalam satu tabel besar, nama siswa dan nama mapel akan terus berulang. Struktur seperti itu lebih rawan inkonsistensi saat ada perubahan data.'
    }
  },

  reflection: {
    questions: [
      {
        id: 'r1',
        question: 'Mengapa perancangan struktur data perlu dipikirkan sejak awal sebelum aplikasi dikembangkan lebih jauh?',
        placeholder: 'Tuliskan alasanmu di sini...',
        guidance: 'Petunjuk: pikirkan dampaknya pada pencarian data, perubahan data, laporan, dan pengembangan fitur berikutnya.'
      },
      {
        id: 'r2',
        question: 'Pada studi kasus absensi siswa, bagian mana yang paling membantumu memahami konsep basis data relasional?',
        placeholder: 'Ceritakan pengalaman belajarmu di sini...',
        guidance: 'Kamu bisa menyinggung aktivitas klasifikasi, pemetaan tabel, atau evaluasi rancangan.'
      }
    ]
  },

  summaryConcepts: [
    {
      term: 'Data Mentah',
      icon: '🧩',
      definition: 'Fakta tunggal yang belum diolah lebih jauh, misalnya satu NIS, satu tanggal, atau satu status hadir.',
      example: 'A001, 2026-09-17, Hadir'
    },
    {
      term: 'Informasi',
      icon: '📈',
      definition: 'Hasil olahan data yang sudah bermakna dan membantu pengambilan keputusan.',
      example: '28 dari 32 siswa hadir hari ini'
    },
    {
      term: 'Basis Data Relasional',
      icon: '🗃️',
      definition: 'Kumpulan tabel yang saling berhubungan untuk menyimpan data secara terstruktur.',
      example: 'Tabel Siswa, Mapel, dan Absensi yang saling terhubung'
    },
    {
      term: 'Field dan Record',
      icon: '📋',
      definition: 'Field adalah kolom/jenis data; record adalah satu baris lengkap yang mewakili satu objek atau satu kejadian.',
      example: 'kolom kelas = field, satu baris data Alya = record'
    },
    {
      term: 'Struktur Data yang Baik',
      icon: '🏗️',
      definition: 'Struktur yang memisahkan data sesuai fungsi, mengurangi duplikasi, dan memudahkan pencarian serta pembaruan.',
      example: 'Nama mapel tidak perlu diketik ulang di setiap baris absensi'
    },
    {
      term: 'Kolom Penghubung',
      icon: '🔗',
      definition: 'Kolom yang dipakai untuk mengaitkan data antar tabel agar aplikasi tahu hubungan antarcatatan.',
      example: 'nis pada tabel Absensi menghubungkan catatan ke tabel Siswa'
    }
  ]
};

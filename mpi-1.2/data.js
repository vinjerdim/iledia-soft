'use strict';

const DATA = {
  meta: {
    title: 'Analisis Entitas & Atribut Utama',
    subject: 'Rekayasa Perangkat Lunak — Fase F',
    goal: 'Menganalisis dokumen spesifikasi sistem untuk menentukan calon entitas dan atribut utama.'
  },

  activityFlow: [
    {
      title: 'Orientasi',
      description: 'Murid memahami tujuan pembelajaran, alur aktivitas, dan hasil akhir yang diharapkan.'
    },
    {
      title: 'Bekal konsep',
      description: 'Murid mempelajari kembali arti dokumen spesifikasi sistem, entitas, atribut, dan data yang bukan fokus inti.'
    },
    {
      title: 'Bedah dokumen',
      description: 'Murid membaca narasi spesifikasi sistem lalu menandai mana kandidat entitas, atribut, atau bukan fokus utama.'
    },
    {
      title: 'Peta entitas-atribut',
      description: 'Murid menempatkan atribut ke entitas yang tepat agar struktur data lebih jelas.'
    },
    {
      title: 'Analisis mandiri',
      description: 'Murid mencoba kasus baru untuk melihat apakah cara berpikirnya sudah konsisten.'
    },
    {
      title: 'Evaluasi',
      description: 'Murid menguji alasan berpikirnya melalui soal pemahaman konsep dan penerapan.'
    },
    {
      title: 'Refleksi',
      description: 'Murid menyimpulkan apa yang dipelajari dan bagaimana menggunakannya pada rancangan basis data berikutnya.'
    }
  ],

  conceptPrep: {
    intro: 'Sebelum menjawab pertanyaan, pelajari dulu empat petunjuk berikut agar kamu tahu apa yang sedang dicari dari sebuah dokumen spesifikasi sistem.',
    cards: [
      {
        icon: '📄',
        term: 'Dokumen spesifikasi sistem',
        definition: 'Deskripsi kebutuhan sistem yang menjelaskan objek apa saja yang dikelola dan data apa saja yang perlu disimpan.',
        example: 'Contoh: sistem perpustakaan menyimpan data anggota, buku, dan transaksi peminjaman.'
      },
      {
        icon: '🧱',
        term: 'Entitas',
        definition: 'Objek utama atau kejadian utama yang datanya perlu dicatat berulang kali oleh sistem.',
        example: 'Contoh: siswa, buku, laptop, pesanan, atau transaksi peminjaman.'
      },
      {
        icon: '🏷️',
        term: 'Atribut utama',
        definition: 'Informasi penting yang menjelaskan sebuah entitas agar sistem dapat mengenali dan mengolahnya.',
        example: 'Contoh: nama siswa, kelas, kode laptop, harga menu, atau tanggal pinjam.'
      },
      {
        icon: '🎨',
        term: 'Bukan fokus inti',
        definition: 'Informasi tampilan atau pelengkap yang tidak terlalu memengaruhi proses utama saat analisis awal basis data.',
        example: 'Contoh: warna banner, slogan aplikasi, atau gambar dekorasi pada dashboard.'
      }
    ],
    signals: [
      'Kata benda utama yang terus muncul dalam narasi sering menjadi kandidat entitas.',
      'Bagian kalimat seperti "memiliki", "menyimpan", atau "mencatat" sering diikuti atribut.',
      'Fokuskan dulu pada data yang mendukung proses inti sistem, bukan dekorasi antarmuka.',
      'Transaksi atau kejadian juga bisa menjadi entitas jika sistem harus mencatatnya berulang kali.'
    ],
    questions: [
      {
        id: 'prep1',
        prompt: 'Pada kalimat "setiap pelanggan memiliki id pelanggan dan nama pelanggan", kata "pelanggan" adalah ...',
        correct: 'entitas',
        options: [
          { id: 'entitas', label: 'entitas karena pelanggan adalah objek utama yang datanya dikelola sistem' },
          { id: 'atribut', label: 'atribut karena pelanggan hanya menjelaskan data lain' },
          { id: 'bukan', label: 'bukan fokus inti karena cukup ditampilkan saja' }
        ],
        feedback: {
          entitas: 'Tepat. "Pelanggan" adalah objek utama yang akan memiliki beberapa data rinci sendiri.',
          atribut: 'Belum tepat. Justru pelanggan adalah objek yang dijelaskan oleh atribut seperti id pelanggan dan nama pelanggan.',
          bukan: 'Belum tepat. Jika sistem melayani pelanggan, datanya termasuk bagian inti yang perlu disimpan.'
        }
      },
      {
        id: 'prep2',
        prompt: 'Masih pada kalimat yang sama, frasa "id pelanggan" paling tepat disebut ...',
        correct: 'atribut',
        options: [
          { id: 'entitas', label: 'entitas karena bisa berdiri sendiri tanpa pelanggan' },
          { id: 'atribut', label: 'atribut karena menjelaskan detail tentang pelanggan' },
          { id: 'bukan', label: 'bukan fokus inti karena hanya angka' }
        ],
        feedback: {
          entitas: 'Belum tepat. "Id pelanggan" tidak menjadi objek utama, melainkan informasi milik pelanggan.',
          atribut: 'Tepat. "Id pelanggan" adalah atribut karena berfungsi menjelaskan dan membedakan data pelanggan.',
          bukan: 'Belum tepat. Walau berupa angka, id pelanggan tetap data inti untuk mengenali pelanggan.'
        }
      },
      {
        id: 'prep3',
        prompt: 'Jika spesifikasi menyebut "aplikasi menampilkan warna banner promosi", data itu pada analisis awal basis data biasanya ...',
        correct: 'bukan',
        options: [
          { id: 'entitas', label: 'menjadi entitas karena tampil di aplikasi' },
          { id: 'atribut', label: 'menjadi atribut utama karena semua data tampilan wajib disimpan lebih dulu' },
          { id: 'bukan', label: 'bukan fokus inti karena tidak menentukan proses utama sistem' }
        ],
        feedback: {
          entitas: 'Belum tepat. Warna banner bukan objek utama yang dikelola berulang sebagai data inti.',
          atribut: 'Belum tepat. Bisa saja disimpan kemudian, tetapi pada analisis awal ia bukan atribut utama proses inti.',
          bukan: 'Tepat. Warna banner lebih dekat ke pengaturan tampilan, bukan kebutuhan inti basis data.'
        }
      },
      {
        id: 'prep4',
        prompt: 'Cara cepat mengenali kandidat atribut dalam dokumen spesifikasi adalah ...',
        correct: 'petunjuk',
        options: [
          { id: 'petunjuk', label: 'mencari detail yang menjelaskan entitas, biasanya muncul setelah kata "memiliki" atau "mencatat"' },
          { id: 'warna', label: 'mencari semua kata yang berkaitan dengan warna, ukuran huruf, atau dekorasi' },
          { id: 'acak', label: 'memilih kata yang paling panjang karena biasanya itulah atribut' }
        ],
        feedback: {
          petunjuk: 'Tepat. Atribut biasanya muncul sebagai detail yang menerangkan sebuah entitas atau transaksi.',
          warna: 'Belum tepat. Warna dan dekorasi justru sering bukan fokus inti pada analisis awal basis data.',
          acak: 'Belum tepat. Panjang kata tidak menentukan apakah sesuatu adalah atribut atau bukan.'
        }
      }
    ]
  },

  specAnalysis: {
    title: 'Dokumen Spesifikasi Sistem — Peminjaman Laptop Laboratorium',
    instruction: 'Baca narasi berikut. Frasa yang disorot adalah kandidat yang perlu kamu analisis. Setelah memahami narasi, klasifikasikan setiap kandidat menjadi entitas, atribut, atau bukan fokus inti.',
    categories: [
      { id: 'entitas', label: 'Entitas' },
      { id: 'atribut', label: 'Atribut Utama' },
      { id: 'bukan', label: 'Bukan Fokus Inti' }
    ],
    paragraphs: [
      'SMK Bina Teknologi ingin membuat aplikasi untuk mengelola peminjaman perangkat saat kegiatan praktikum.',
      'Setiap {peminjam|peminjam siswa} memiliki {id_peminjam|id peminjam}, {nama_siswa|nama siswa}, dan {kelas|kelas}.',
      'Setiap {laptop|laptop} yang tersedia memiliki {kode_laptop|kode laptop}, {merk_laptop|merk laptop}, dan {status_laptop|status laptop}.',
      'Saat praktikum berlangsung, sistem mencatat {transaksi_peminjaman|transaksi peminjaman} yang berisi {tanggal_pinjam|tanggal pinjam} dan {tanggal_kembali|tanggal kembali rencana}.',
      'Sekolah juga ingin menampilkan {warna_dashboard|warna dashboard} dan {pesan_sambutan|pesan sambutan} pada halaman awal aplikasi.'
    ],
    candidates: [
      {
        id: 'peminjam',
        label: 'peminjam siswa',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Peminjam siswa adalah objek utama yang datanya perlu dicatat agar sistem tahu siapa yang meminjam perangkat.',
          atribut: 'Belum tepat. Peminjam siswa bukan detail dari data lain, melainkan objek yang memiliki detail seperti id, nama, dan kelas.',
          bukan: 'Belum tepat. Data peminjam jelas mendukung proses inti peminjaman, jadi termasuk kandidat utama.'
        }
      },
      {
        id: 'id_peminjam',
        label: 'id peminjam',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Id peminjam bukan objek utama, tetapi informasi yang menjelaskan peminjam.',
          atribut: 'Tepat. Id peminjam adalah atribut utama karena membantu mengenali data peminjam secara jelas.',
          bukan: 'Belum tepat. Id peminjam dibutuhkan langsung dalam proses inti peminjaman.'
        }
      },
      {
        id: 'nama_siswa',
        label: 'nama siswa',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Nama siswa hanya menjelaskan siapa peminjamnya.',
          atribut: 'Tepat. Nama siswa adalah atribut karena menerangkan entitas peminjam.',
          bukan: 'Belum tepat. Nama siswa tetap termasuk data inti agar data peminjam mudah dipahami.'
        }
      },
      {
        id: 'kelas',
        label: 'kelas',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Pada konteks dokumen ini, kelas dipakai sebagai keterangan tentang peminjam siswa.',
          atribut: 'Tepat. Kelas adalah atribut yang menjelaskan peminjam.',
          bukan: 'Belum tepat. Kelas masih relevan untuk proses laporan dan identifikasi peminjam.'
        }
      },
      {
        id: 'laptop',
        label: 'laptop',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Laptop adalah objek utama yang dikelola sistem karena setiap perangkat perlu dicatat.',
          atribut: 'Belum tepat. Laptop memiliki atribut seperti kode, merk, dan status sehingga ia adalah entitas.',
          bukan: 'Belum tepat. Tanpa data laptop, sistem tidak dapat mengelola perangkat yang dipinjam.'
        }
      },
      {
        id: 'kode_laptop',
        label: 'kode laptop',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Kode laptop hanyalah detail identitas milik entitas laptop.',
          atribut: 'Tepat. Kode laptop adalah atribut utama untuk membedakan satu laptop dengan laptop lain.',
          bukan: 'Belum tepat. Kode laptop dibutuhkan dalam proses inti pengelolaan peminjaman perangkat.'
        }
      },
      {
        id: 'merk_laptop',
        label: 'merk laptop',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Merk laptop tidak berdiri sebagai objek utama terpisah pada kasus ini.',
          atribut: 'Tepat. Merk laptop adalah atribut karena menjelaskan data laptop.',
          bukan: 'Belum tepat. Merk tetap termasuk informasi penting untuk mengenali perangkat yang dipinjam.'
        }
      },
      {
        id: 'status_laptop',
        label: 'status laptop',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Status laptop adalah keterangan kondisi laptop, bukan objek utama.',
          atribut: 'Tepat. Status laptop merupakan atribut yang membantu sistem mengetahui apakah perangkat siap dipinjam.',
          bukan: 'Belum tepat. Status laptop penting untuk proses inti karena memengaruhi ketersediaan perangkat.'
        }
      },
      {
        id: 'transaksi_peminjaman',
        label: 'transaksi peminjaman',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Transaksi peminjaman adalah kejadian utama yang perlu disimpan berulang oleh sistem.',
          atribut: 'Belum tepat. Transaksi peminjaman bukan detail kecil, tetapi catatan kejadian yang memiliki detail sendiri.',
          bukan: 'Belum tepat. Justru inilah inti dari proses yang sedang dibangun sistem.'
        }
      },
      {
        id: 'tanggal_pinjam',
        label: 'tanggal pinjam',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Tanggal pinjam adalah detail tentang transaksi peminjaman.',
          atribut: 'Tepat. Tanggal pinjam adalah atribut karena menjelaskan kapan transaksi terjadi.',
          bukan: 'Belum tepat. Tanggal pinjam dibutuhkan untuk pencatatan transaksi dan pelacakan peminjaman.'
        }
      },
      {
        id: 'tanggal_kembali',
        label: 'tanggal kembali rencana',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Tanggal kembali rencana adalah detail dari transaksi peminjaman.',
          atribut: 'Tepat. Ini adalah atribut yang menerangkan batas waktu pengembalian perangkat.',
          bukan: 'Belum tepat. Informasi ini tetap penting untuk proses peminjaman dan pengembalian.'
        }
      },
      {
        id: 'warna_dashboard',
        label: 'warna dashboard',
        correct: 'bukan',
        feedback: {
          entitas: 'Belum tepat. Warna dashboard bukan objek utama yang dikelola sistem.',
          atribut: 'Belum tepat. Pada analisis awal basis data, warna dashboard belum menjadi atribut utama proses inti.',
          bukan: 'Tepat. Warna dashboard lebih dekat ke pengaturan tampilan daripada inti proses peminjaman.'
        }
      },
      {
        id: 'pesan_sambutan',
        label: 'pesan sambutan',
        correct: 'bukan',
        feedback: {
          entitas: 'Belum tepat. Pesan sambutan bukan objek utama yang dicatat berulang oleh sistem.',
          atribut: 'Belum tepat. Pesan sambutan bukan atribut utama dari peminjam, laptop, atau transaksi.',
          bukan: 'Tepat. Pesan sambutan adalah konten antarmuka, bukan fokus inti analisis data peminjaman.'
        }
      }
    ]
  },

  mapping: {
    instruction: 'Klik satu atribut dari daftar, lalu klik entitas yang paling tepat. Jika ingin memindahkan atribut, klik kembali chip yang sudah berada di kolom entitas.',
    explanation: 'Pada tahap ini entitasnya sudah diketahui. Tugasmu adalah menempatkan setiap atribut ke entitas yang dijelaskannya.',
    entities: [
      { id: 'peminjam', label: 'Peminjam', colorKey: 'blue' },
      { id: 'laptop', label: 'Laptop', colorKey: 'green' },
      { id: 'transaksi', label: 'Transaksi Peminjaman', colorKey: 'orange' }
    ],
    attributes: [
      { id: 'id_peminjam', label: 'id_peminjam', entityId: 'peminjam' },
      { id: 'nama_siswa', label: 'nama_siswa', entityId: 'peminjam' },
      { id: 'kelas', label: 'kelas', entityId: 'peminjam' },
      { id: 'kode_laptop', label: 'kode_laptop', entityId: 'laptop' },
      { id: 'merk_laptop', label: 'merk_laptop', entityId: 'laptop' },
      { id: 'status_laptop', label: 'status_laptop', entityId: 'laptop' },
      { id: 'tanggal_pinjam', label: 'tanggal_pinjam', entityId: 'transaksi' },
      { id: 'tanggal_kembali', label: 'tanggal_kembali', entityId: 'transaksi' }
    ]
  },

  independentCase: {
    title: 'Kasus Baru — Sistem Kantin Digital Sekolah',
    instruction: 'Sekarang gunakan cara berpikir yang sama pada kasus baru. Baca narasi, pahami dulu proses utamanya, lalu kelompokkan tiap kandidat data.',
    categories: [
      { id: 'entitas', label: 'Entitas' },
      { id: 'atribut', label: 'Atribut Utama' },
      { id: 'bukan', label: 'Bukan Fokus Inti' }
    ],
    paragraphs: [
      'Sekolah ingin membuat sistem kantin digital untuk mencatat pesanan makanan murid.',
      'Setiap pelanggan memiliki id pelanggan dan nama pelanggan.',
      'Setiap menu memiliki kode menu, nama menu, dan harga menu.',
      'Saat pembelian terjadi, sistem menyimpan pesanan dengan waktu pesan dan total bayar.',
      'Kantin juga ingin mengganti warna banner dan slogan harian pada halaman promosi.'
    ],
    items: [
      {
        id: 'pelanggan',
        label: 'pelanggan',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Pelanggan adalah objek utama yang terlibat langsung dalam proses pemesanan.',
          atribut: 'Belum tepat. Pelanggan memiliki atribut seperti id pelanggan dan nama pelanggan.',
          bukan: 'Belum tepat. Tanpa data pelanggan, sistem tidak dapat mencatat siapa yang memesan.'
        }
      },
      {
        id: 'id_pelanggan',
        label: 'id pelanggan',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Id pelanggan hanya menjelaskan pelanggan.',
          atribut: 'Tepat. Id pelanggan adalah atribut utama milik entitas pelanggan.',
          bukan: 'Belum tepat. Id pelanggan masih dibutuhkan untuk mengenali data pelanggan.'
        }
      },
      {
        id: 'nama_pelanggan',
        label: 'nama pelanggan',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Nama pelanggan bukan objek utama, melainkan detail tentang pelanggan.',
          atribut: 'Tepat. Nama pelanggan adalah atribut karena menjelaskan entitas pelanggan.',
          bukan: 'Belum tepat. Nama pelanggan masih termasuk data inti agar sistem mudah dibaca.'
        }
      },
      {
        id: 'menu',
        label: 'menu',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Menu adalah objek utama yang ditawarkan dan perlu dikelola sistem.',
          atribut: 'Belum tepat. Menu memiliki atribut sendiri seperti kode, nama, dan harga.',
          bukan: 'Belum tepat. Menu jelas termasuk bagian inti dari proses pemesanan.'
        }
      },
      {
        id: 'harga_menu',
        label: 'harga menu',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Harga menu adalah detail tentang menu, bukan objek utama.',
          atribut: 'Tepat. Harga menu menerangkan entitas menu.',
          bukan: 'Belum tepat. Harga menu penting untuk proses pemesanan dan perhitungan pembayaran.'
        }
      },
      {
        id: 'pesanan',
        label: 'pesanan',
        correct: 'entitas',
        feedback: {
          entitas: 'Tepat. Pesanan adalah kejadian utama yang dicatat sistem setiap kali pembelian terjadi.',
          atribut: 'Belum tepat. Pesanan memiliki rincian seperti waktu pesan dan total bayar.',
          bukan: 'Belum tepat. Pesanan adalah inti dari proses yang dikelola sistem kantin digital.'
        }
      },
      {
        id: 'waktu_pesan',
        label: 'waktu pesan',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Waktu pesan adalah detail kapan pesanan terjadi.',
          atribut: 'Tepat. Waktu pesan termasuk atribut utama untuk menjelaskan pesanan.',
          bukan: 'Belum tepat. Waktu pesan masih relevan untuk pencatatan transaksi.'
        }
      },
      {
        id: 'total_bayar',
        label: 'total bayar',
        correct: 'atribut',
        feedback: {
          entitas: 'Belum tepat. Total bayar adalah rincian nilai dari sebuah pesanan.',
          atribut: 'Tepat. Total bayar adalah atribut yang menjelaskan hasil transaksi pesanan.',
          bukan: 'Belum tepat. Total bayar mendukung proses inti pembayaran.'
        }
      },
      {
        id: 'warna_banner',
        label: 'warna banner',
        correct: 'bukan',
        feedback: {
          entitas: 'Belum tepat. Warna banner bukan objek utama dalam proses pemesanan makanan.',
          atribut: 'Belum tepat. Pada analisis awal basis data, warna banner bukan atribut utama dari entitas inti.',
          bukan: 'Tepat. Warna banner lebih berkaitan dengan tampilan promosi, bukan data inti sistem.'
        }
      },
      {
        id: 'slogan_harian',
        label: 'slogan harian',
        correct: 'bukan',
        feedback: {
          entitas: 'Belum tepat. Slogan harian bukan objek utama yang perlu dikelola seperti pelanggan, menu, atau pesanan.',
          atribut: 'Belum tepat. Slogan harian bukan atribut utama dari proses pemesanan.',
          bukan: 'Tepat. Ini hanya pelengkap tampilan promosi, bukan fokus inti analisis basis data.'
        }
      }
    ]
  },

  evaluation: {
    intro: 'Tahap ini memeriksa apakah kamu sudah memahami alasan di balik pemilihan entitas dan atribut, bukan hanya menghafal contohnya.',
    questions: [
      {
        id: 'eval1',
        prompt: 'Mengapa kata "pesanan" pada sistem kantin digital layak dianggap entitas?',
        correct: 'kejadian',
        options: [
          { id: 'kejadian', label: 'Karena pesanan adalah kejadian utama yang dicatat berulang oleh sistem.' },
          { id: 'warna', label: 'Karena kata pesanan terdengar lebih menarik daripada pelanggan.' },
          { id: 'dekorasi', label: 'Karena semua kata benda otomatis harus menjadi dekorasi tabel.' }
        ],
        feedback: {
          kejadian: 'Tepat. Entitas tidak selalu benda fisik; kejadian atau transaksi juga bisa menjadi entitas.',
          warna: 'Belum tepat. Entitas dipilih karena perannya dalam proses, bukan karena bunyinya menarik.',
          dekorasi: 'Belum tepat. Entitas dipilih dari kebutuhan data sistem, bukan untuk "menghias" tabel.'
        }
      },
      {
        id: 'eval2',
        prompt: 'Pilihan atribut utama yang paling tepat untuk entitas Laptop adalah ...',
        correct: 'laptopset',
        options: [
          { id: 'laptopset', label: 'kode laptop, merk laptop, status laptop' },
          { id: 'campur', label: 'nama siswa, tanggal pinjam, warna dashboard' },
          { id: 'tampilan', label: 'warna dashboard, slogan aplikasi, gambar header' }
        ],
        feedback: {
          laptopset: 'Tepat. Semua pilihan tersebut langsung menjelaskan data laptop.',
          campur: 'Belum tepat. Daftar itu mencampur atribut dari entitas lain dan data yang bukan fokus inti.',
          tampilan: 'Belum tepat. Itu adalah elemen tampilan, bukan atribut utama laptop.'
        }
      },
      {
        id: 'eval3',
        prompt: 'Mengapa "warna banner" tidak diprioritaskan saat analisis awal basis data?',
        correct: 'inti',
        options: [
          { id: 'inti', label: 'Karena tidak mendukung proses inti pencatatan data pelanggan, menu, atau pesanan.' },
          { id: 'angka', label: 'Karena semua atribut wajib berupa angka.' },
          { id: 'harus', label: 'Karena sistem basis data tidak boleh menyimpan data tampilan sama sekali.' }
        ],
        feedback: {
          inti: 'Tepat. Analisis awal fokus pada data yang membuat proses utama sistem dapat berjalan.',
          angka: 'Belum tepat. Atribut tidak harus berupa angka; teks juga bisa menjadi atribut.',
          harus: 'Belum tepat. Data tampilan bisa saja disimpan, tetapi bukan prioritas utama pada analisis awal ini.'
        }
      },
      {
        id: 'eval4',
        prompt: 'Jika spesifikasi menyebut "setiap menu memiliki kode menu, nama menu, dan harga menu", maka "harga menu" adalah ...',
        correct: 'atribut',
        options: [
          { id: 'entitas', label: 'entitas karena berdiri sendiri' },
          { id: 'atribut', label: 'atribut karena menjelaskan detail tentang menu' },
          { id: 'bukan', label: 'bukan fokus inti karena berupa angka uang' }
        ],
        feedback: {
          entitas: 'Belum tepat. Harga menu tidak menjadi objek utama terpisah, melainkan detail milik menu.',
          atribut: 'Tepat. Harga menu adalah atribut utama dari entitas menu.',
          bukan: 'Belum tepat. Harga justru penting untuk proses pemesanan dan pembayaran.'
        }
      }
    ]
  },

  reflection: {
    prompts: [
      {
        id: 'r1',
        title: 'Apa petunjuk yang paling membantumu menemukan entitas dari dokumen spesifikasi?',
        guidance: 'Tuliskan kata kunci, pola kalimat, atau cara berpikir yang menurutmu paling efektif.'
      },
      {
        id: 'r2',
        title: 'Mengapa membedakan atribut utama dan data pelengkap penting saat merancang basis data?',
        guidance: 'Hubungkan jawabanmu dengan kerapian struktur data atau kemudahan pengembangan aplikasi.'
      }
    ]
  },

  summaryConcepts: [
    {
      icon: '📄',
      term: 'Baca proses utamanya',
      definition: 'Mulailah dari tujuan sistem dan proses inti yang benar-benar harus didukung data.',
      example: 'Contoh: meminjam laptop, memesan makanan, atau mencatat absensi.'
    },
    {
      icon: '🧱',
      term: 'Temukan entitas',
      definition: 'Cari objek atau kejadian utama yang datanya perlu disimpan berulang kali.',
      example: 'Contoh: pelanggan, menu, pesanan, peminjam, laptop.'
    },
    {
      icon: '🏷️',
      term: 'Temukan atribut utama',
      definition: 'Cari detail yang menjelaskan setiap entitas agar sistem bisa mengenali dan mengolahnya.',
      example: 'Contoh: id pelanggan, harga menu, status laptop, tanggal pinjam.'
    },
    {
      icon: '🎯',
      term: 'Fokus pada data inti',
      definition: 'Pisahkan data inti dari data tampilan atau pelengkap agar rancangan basis data tetap rapi.',
      example: 'Contoh: warna banner bisa ditunda, sedangkan data pesanan harus dianalisis lebih dulu.'
    }
  ]
};

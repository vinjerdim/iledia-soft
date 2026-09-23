# iLedia — Media Pembelajaran Interaktif Rekayasa Perangkat Lunak (Fase F)

Kumpulan media pembelajaran interaktif untuk mata pelajaran Rekayasa Perangkat Lunak SMK (Fase F). Setiap media berjalan langsung di browser sebagai situs statis (HTML, CSS, dan JavaScript) tanpa proses build maupun dependensi.

## Daftar Materi

| TP | Materi | Judul | Model | Folder |
| -- | ------ | ----- | ----- | ------ |
| 1 | 1.1 | Konsep Dasar Basis Data & Peran Analisis Kebutuhan Sistem | Discovery Learning | [`fase-f/mpi-1.1/`](fase-f/mpi-1.1/index.html) |
| 1 | 1.2 | Menggali Kebutuhan Informasi dan Data lewat Teknik Requirement Gathering | Problem Based Learning | [`fase-f/mpi-1.2/`](fase-f/mpi-1.2/index.html) |
| 1 | 1.3 | Mengidentifikasi Entitas dan Atribut dari Hasil Analisis Kebutuhan Sistem | Problem Based Learning | [`fase-f/mpi-1.3/`](fase-f/mpi-1.3/index.html) |

Halaman utama ([`index.html`](index.html)) menampilkan daftar materi, dikelompokkan per fase lewat tab dan per tujuan pembelajaran lewat pills **TP**. Pills dibangun otomatis dari atribut `data-tp` pada tiap card, dan judul topiknya diambil dari `data-tp-labels` pada elemen `.tp-filter`.

## Menjalankan Secara Lokal

Buka `index.html` langsung di browser, atau jalankan server statis sederhana dari folder proyek:

```bash
python -m http.server 5173
```

Lalu akses `http://localhost:5173`.

## Struktur Folder

```
├── index.html              # halaman utama (tab fase + pills TP + daftar materi)
├── shared/                 # dipakai bersama oleh semua materi
│   ├── tokens.css          # warna, font, dan spasi (ubah tema di sini)
│   ├── base.css            # gaya dasar + komponen bersama
│   └── engine.js           # progres, navigasi tahap, progress bar, pengacakan
└── fase-f/mpi-X.Y/         # satu folder per materi
    ├── index.html          # kerangka halaman
    ├── data.js             # konten materi (teks, tabel, soal, kunci, umpan balik)
    ├── app-core.js         # pembantu render yang dipakai bersama antar tahap
    ├── app-stage-*.js      # renderer per kelompok tahap
    ├── app.js              # perakitan: createLesson + init (dimuat TERAKHIR)
    └── styles.css          # gaya khusus materi
```

Konten materi dipisahkan di `data.js`, sehingga teks dan soal dapat diubah tanpa menyentuh logika.

### Urutan muat

Gaya: `../../shared/tokens.css` → `../../shared/base.css` → `styles.css`.

Skrip: `../../shared/engine.js` → `data.js` → `app-core.js` → `app-stage-*.js` → `app.js`.

`app.js` wajib dimuat **terakhir** karena ia merujuk fungsi `render*` dari berkas tahap saat menyusun daftar tahap. Bila ada berkas tahap yang lupa didaftarkan di `index.html`, `app.js` berhenti dengan pesan yang menyebut nama fungsi yang hilang — tidak gagal diam-diam.

## Komponen Bersama (`shared/`)

`shared/engine.js` menyediakan `Engine.createLesson()` sehingga penyimpanan progres, penguncian tahap, dan progress bar tidak perlu ditulis ulang per materi. Kerangka halaman tiap materi wajib menyediakan id berikut: `#stageNavList`, `#stageContainer`, `#progressFill`, `#progressLabel`, `#appNotice`, dan `#resetAppBtn`.

`shared/base.css` memuat komponen yang dipakai lintas materi: tombol, panel, kotak umpan balik, input, kuis pilihan (`.choice-option` beserta state benar/salah), kolam chip (`.attr-pool` / `.attr-chip`) beserta kolom sasarannya (`.entity-column`), kartu konsep (`.concept-card`), papan menjodohkan (`.match-grid`), daftar penjelasan (`.explain-item`), penghitung temuan (`.find-counter`), skala Likert (`.likert`), panel skor penutup (`.done-panel` / `.score-list`), petunjuk yang dapat dibuka (`.hint-reveal`), dan tabel data (`.mini-table`). Pakai komponen ini lebih dulu sebelum menulis gaya baru di `styles.css` materi.

Jumlah kolom pada `.entity-column` mengikuti `--entity-columns-count` (bawaan 3); materi dengan empat entitas cukup menyetel variabel itu pada elemennya.

### Pengacakan pilihan jawaban

Setiap kumpulan pilihan yang ditampilkan ke murid **wajib diacak**. Engine menyediakannya lewat dua fungsi pada objek hasil `createLesson()`:

```js
lesson.order(key, ids)          // urutan id yang diacak dan dipersistensi
lesson.orderItems(key, items)   // sama, tetapi mengembalikan objek datanya
lesson.reshuffle(key)           // buang urutan tersimpan; tanpa argumen = semua
```

Urutan dibuat **sekali** lalu disimpan bersama progres di `state.shuffles`, sehingga render ulang dan reload halaman memakai urutan yang sama. Dua aturan yang menyertainya:

1. **Jangan memanggil `Engine.shuffle()` langsung dari renderer.** Setiap interaksi menggambar ulang tahap, sehingga urutannya akan berubah tiap klik. `Engine.shuffle()` diekspos hanya untuk pengujian.
2. **Simpan jawaban murid per id pilihan, bukan per indeks.** Pada daftar yang diacak, nomor urut tidak bermakna.

`createState()` tiap materi wajib menyertakan `shuffles: {}`. Tombol **Reset** mengosongkannya, sehingga pilihan jawaban teracak ulang. Bila isi `data.js` berubah setelah murid mulai belajar, urutan tersimpan direkonsiliasi otomatis: id yang hilang dibuang, id baru disisipkan acak, dan urutan relatif id lama dipertahankan.

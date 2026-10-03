# iLedia — Media Pembelajaran Interaktif Rekayasa Perangkat Lunak (Fase F)

Kumpulan media pembelajaran interaktif untuk mata pelajaran Rekayasa Perangkat Lunak SMK (Fase F). Setiap media berjalan langsung di browser sebagai situs statis (HTML, CSS, dan JavaScript). Tooling Node (Prettier, tes `node --test`, generator halaman) hanya dipakai saat pengembangan — situs di-deploy apa adanya.

## Daftar Materi

| TP | Materi | Judul | Model | Folder |
| -- | ------ | ----- | ----- | ------ |
| 1 | 1.1 | Menganalisis Kebutuhan Data: Mengidentifikasi Entitas & Atribut | Discovery Learning | [`fase-f/mpi-1.1/`](fase-f/mpi-1.1/index.html) |
| 1 | 1.2 | Menentukan Jenis Relasi & Kardinalitas Antar Entitas dalam ERD | Cooperative Learning | [`fase-f/mpi-1.2/`](fase-f/mpi-1.2/index.html) |
| 1 | 1.3 | Merancang ERD Lengkap dari Hasil Analisis Kebutuhan Data | Cooperative Learning | [`fase-f/mpi-1.3/`](fase-f/mpi-1.3/index.html) |
| 1 | 1.4 | Menganalisis Normalisasi Basis Data (1NF, 2NF, 3NF) untuk Mengatasi Redundansi Data | Problem Based Learning | [`fase-f/mpi-1.4/`](fase-f/mpi-1.4/index.html) |
| 2 | 2.1 | Konsep dan Fungsi DBMS dalam Pengelolaan Basis Data | Discovery Learning | [`fase-f/mpi-2.1/`](fase-f/mpi-2.1/index.html) |
| 2 | 2.2 | Jenis-jenis DBMS dan Karakteristiknya | Discovery Learning | [`fase-f/mpi-2.2/`](fase-f/mpi-2.2/index.html) |

Halaman utama ([`index.html`](index.html)) menampilkan daftar materi dengan navigasi **Fase → Kelas → Topik** (sama seperti iledia-math). Setiap card memakai `data-kelas` dan `data-topik`, yang wajib terdaftar pada objek `HIERARKI` di skrip halaman. Kelas tanpa topik ditampilkan berlabel "segera". Pilihan terakhir diingat di `localStorage` (`iledia-soft:nav`).

| Kelas | Topik | Judul | Materi |
| ----- | ----- | ----- | ------ |
| XI | 1 | Basis Data Relasional | 1.1 – 1.4 |
| XI | 2 | Sistem Manajemen Basis Data (DBMS) | 2.1 – 2.2 |

## Menjalankan Secara Lokal

Buka `index.html` langsung di browser, atau jalankan server statis sederhana dari folder proyek:

```bash
python -m http.server 5173
```

Lalu akses `http://localhost:5173`.

## Pengembangan

```bash
npm install          # Prettier, husky, lint-staged
npm test             # tes engine, konten modul, dan navigasi (node --test)
npm run build:pages  # menghasilkan index.html modul dari shared/page-template.html
```

Pre-commit hook (husky + lint-staged) memformat berkas yang di-stage dengan Prettier.

## Struktur Folder

```
├── index.html                  # halaman utama (Fase → Kelas → Topik)
├── shared/
│   ├── tokens.css              # warna, font, dan spasi (ubah tema di sini)
│   ├── base.css                # gaya dasar + komponen bersama
│   ├── engine.js               # engine global + Engine.createLesson (modul lama)
│   ├── page-template.html      # kerangka halaman modul gaya iledia-math
│   ├── pages-manifest.json     # judul, deskripsi, jumlah tahap per modul
│   └── partials/reset-modal.html
├── scripts/build-pages.js      # template + manifest → fase-*/mpi-*/index.html
├── tests/                      # node --test
└── fase-f/mpi-X.Y/             # satu folder per materi
```

### Modul gaya iledia-math (mpi-1.1 – 1.4)

Satu modul = `index.html` (dihasilkan `npm run build:pages`), `data.js` (konten), `app.js` (State, `createStore`, `createStageMachine`, renderer per tahap), dan `styles.css`. Urutan muat: `tokens.css` → `base.css` → `styles.css`; `engine.js` → `data.js` → `app.js`.

Komponen bersama di `shared/engine.js`: mesin tahap & store, kepala tahap bersintaks, catatan guru, panel tujuan belajar, pilihan ganda, pemilahan kategori, urut-ketuk, pertanyaan penuntun bertingkat, multi-pilih berdiagnosa, skala Likert, modal reset, seksi **analisis kebutuhan data** (dokumen kebutuhan bertanda frasa `[[id|teks]]`, `cakupanKebutuhan`, kartu entitas), seksi **relasi & kardinalitas ERD** (notasi `min..maks`, `jenisDariKardinalitas`, `buildRelasiDiagram`, pemilih kardinalitas teracak `ensureKardinalitasState` / `buildKardinalitasPicker`), seksi **kerja kelompok kooperatif** (kartu peran, kuis sekali-jawab `buildKuisSekali` / `skorKuis`, `poinPeningkatan` STAD, `rataPoinTim`, `predikatTim`), dan seksi **ERD lengkap** (`letakKunciTamu` — 1:N di sisi banyak, 1:1 di sisi wajib, M:N lewat entitas penghubung —, `kunciPrimer` termasuk kunci gabungan, validasi `periksaErd`, diagram `buildErdLengkap`; `buildEntityCard` menandai PK 🔑, FK 🔗, dan entitas penghubung), dan seksi **normalisasi basis data** (`selAtomik` / `selTakAtomik`, `ratakanBaris` untuk 1NF, `tutupAtribut`, `jenisKetergantungan` — penuh, parsial, transitif —, `bentukNormal` 0–3, `periksaDekomposisi`, `hitungRedundansi` / `hitungDekomposisi`, tabel data bersel ketuk `buildTabelData` / `bindTabelSel` / `periksaSel`, dan `buildSkemaRelasi`).

**Pengacakan:** setiap daftar pilihan diacak sekali di `initOrders()` lewat `ensureShuffledOrder` / `ensureSortStates` / `ensureTapOrderState` / `ensureMultiState` / `ensureKardinalitasState`, disimpan di State, dan teracak ulang saat Reset. Jangan memanggil `shuffleArray()` dari renderer. Tes `tests/mpi-f-1.1-data.test.js` – `tests/mpi-f-1.4-data.test.js` memastikan semua daftar pilihan teracak.

### Modul lama (mpi-2.1 – 2.2)

Masih memakai `Engine.createLesson()` (bagian 18 `shared/engine.js`, dipertahankan untuk kompatibilitas) dengan berkas `data.js`, `app-core.js`, `app-stage-*.js`, `app.js`, `styles.css` per modul. Tes `tests/engine-legacy.test.js` menjaga agar global engine baru tidak bertabrakan dengan nama global modul lama.

```
fase-f/mpi-X.Y/
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

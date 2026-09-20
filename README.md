# iLedia — Media Pembelajaran Interaktif Rekayasa Perangkat Lunak (Fase F)

Kumpulan media pembelajaran interaktif untuk mata pelajaran Rekayasa Perangkat Lunak SMK (Fase F). Setiap media berjalan langsung di browser sebagai situs statis (HTML, CSS, dan JavaScript) tanpa proses build maupun dependensi.

## Daftar Materi

| Materi | Judul | Folder |
| ------ | ----- | ------ |
| 1.1 | Konsep Dasar Basis Data Relasional | [`mpi-1.1/`](mpi-1.1/index.html) |
| 1.2 | Analisis Entitas & Atribut Utama | [`mpi-1.2/`](mpi-1.2/index.html) |
| 1.3 | Relationship, Kardinalitas & Foreign Key | [`mpi-1.3/`](mpi-1.3/index.html) |

Halaman utama ([`index.html`](index.html)) berisi daftar materi dan menautkan ke masing-masing media.

## Menjalankan Secara Lokal

Buka `index.html` langsung di browser, atau jalankan server statis sederhana dari folder proyek:

```bash
python -m http.server 5173
```

Lalu akses `http://localhost:5173`.

## Struktur Folder

```
├── index.html            # halaman utama (daftar materi)
├── shared/               # dipakai bersama oleh semua materi
│   ├── tokens.css        # warna, font, dan spasi (ubah tema di sini)
│   ├── base.css          # gaya dasar yang sama di semua materi
│   └── engine.js         # penyimpanan progres, navigasi tahap, progress bar
└── mpi-X.Y/              # satu folder per materi, strukturnya sama
    ├── index.html        # kerangka halaman
    ├── data.js           # konten materi (teks, soal, studi kasus)
    ├── app.js            # tampilan tiap tahap dan logika interaksi materi
    └── styles.css        # gaya khusus materi
```

Konten materi dipisahkan di `data.js`, sehingga teks dan soal dapat diubah tanpa menyentuh logika di `app.js`.

Urutan pemuatan di setiap materi: `data.js`, `../shared/engine.js`, lalu `app.js`; untuk gaya: `../shared/tokens.css`, `../shared/base.css`, lalu `styles.css`. Setiap `app.js` mendaftarkan tahap-tahapnya lewat `Engine.createLesson()` sehingga penyimpanan progres, penguncian tahap, dan progress bar tidak perlu ditulis ulang per materi.

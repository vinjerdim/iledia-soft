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

Setiap folder materi memiliki struktur yang sama:

```
mpi-X.Y/
├── index.html   # kerangka halaman
├── data.js      # konten materi (teks, soal, studi kasus)
├── app.js       # logika interaksi
└── styles.css   # tampilan
```

Konten materi dipisahkan di `data.js`, sehingga teks dan soal dapat diubah tanpa menyentuh logika di `app.js`.

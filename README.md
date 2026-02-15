# Kerangka Website Data

Ini adalah kerangka dasar untuk sebuah "website data" dengan struktur semantik, halaman registrasi, dan dashboard sederhana.

Cara mencoba secara lokal:

1. Buka file `Index.html` di browser (double-click atau buka lewat browser `File → Open`).
2. Klik tombol "Mulai Registrasi" untuk menuju halaman registrasi.
3. Isi form registrasi; data disimpan di `localStorage` browser dan akan muncul di `dashboard.html`.

Berita dan artikel:

- Untuk menulis berita langsung di kode, edit `data/news.json` atau `script.js` (array `sampleNews`).
- Jika ingin menghasilkan halaman artikel statis dari `data/news.json`, jalankan generator Node berikut dari workspace root:

```bash
node tools/generate_articles.js
```

Generator akan membuat file HTML artikel di folder `articles/`.

Catatan: `fetch('data/news.json')` dipanggil di `script.js` jika Anda melayani situs lewat server. Saat membuka `Index.html` langsung dari filesystem, browser mungkin memblokir `fetch`; dalam kasus itu `script.js` akan menggunakan daftar berita yang tertulis langsung di berkas.

Catatan:
- Ini adalah prototype front-end; otentikasi dan penyimpanan aman harus ditangani di server untuk produksi.

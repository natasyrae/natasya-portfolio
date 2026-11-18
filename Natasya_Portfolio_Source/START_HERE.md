# Mulai di sini — Natasya Portfolio

Ini adalah source lengkap portofolio **Natasya’s Curiosity Studio**, versi terakhir dengan foto profil, dua foto RAICOM/robotika, dan dua sertifikat penghargaan. Seluruh teks website berbahasa Inggris.

## Buka website

1. Ekstrak seluruh isi ZIP terlebih dahulu. Jangan hanya membuka HTML dari dalam ZIP.
2. Buka folder `Natasya_Portfolio_Source`.
3. Buka `dist/index.html` dengan browser.

Website ini menggunakan HTML, CSS, dan JavaScript biasa. Tidak memerlukan npm install, framework, atau proses build.

Jika ingin memakai server lokal dan Python sudah tersedia, jalankan perintah berikut dari folder `Natasya_Portfolio_Source`:

```bash
python -m http.server 5500 --directory dist
```

Lalu buka `http://localhost:5500` di browser. Hentikan server dengan Ctrl+C.

## File yang bisa kamu edit

| File | Isi dan fungsi |
| --- | --- |
| `dist/index.html` | Teks beranda, profil, pendidikan, pengalaman, kontak, dan struktur halaman. |
| `dist/styles.css` | Warna, ukuran teks, tata letak, bingkai foto, animasi, dan tampilan ponsel. |
| `dist/app.js` | Data tujuh proyek, detail proyek, demo interaktif, filter, keahlian, galeri, dan paspor penjelajah. |
| `dist/world.js` | Studio isometrik, karakter, kontrol permainan, pencahayaan, dan efek animasi. |
| `dist/assets/` | Foto profil, foto kompetisi, sertifikat, CV PDF, ikon, dan font simbol. |

Untuk mengubah data proyek, cari `const projects` di `dist/app.js`. Untuk mengganti judul dan deskripsi foto/sertifikat, cari `const galleries` di file yang sama.

Untuk mengganti gambar, ubah file di `dist/assets/` dan sesuaikan path-nya di `index.html` atau `app.js`. Jangan mengubah nama file tanpa memperbarui referensinya.

## Lanjutkan dengan Codex

Gunakan folder hasil ekstrak sebagai proyek. Isi `CODEX_PROMPT.txt` adalah prompt siap salin untuk menjelaskan proyek ini dan perubahan yang kamu inginkan. Ganti kalimat terakhir dengan permintaanmu.

Semua file yang diperlukan sudah ada di ZIP, termasuk gambar dan CV. Versi lokal dapat dibuka tanpa login ChatGPT. Perubahan lokal tidak otomatis memperbarui link website yang sebelumnya; versi yang sudah diedit perlu diterbitkan kembali untuk memperbarui website online.

## Fitur yang sudah ada

- Studio isometrik yang bisa dijelajahi dengan keyboard atau tombol sentuh.
- Tujuh proyek dengan detail dan demo mini.
- Filter proyek, tab keahlian, dan animasi saat scroll.
- Paspor penjelajah dengan empat stempel.
- Pencahayaan siang/malam dan pilihan jeda animasi.
- Foto profil, galeri robotika, serta dua sertifikat yang bisa diperbesar.
- Unduhan CV dan gambar asli.
- Tampilan responsif untuk desktop dan ponsel.

Demo proyek merupakan simulasi edukatif. RSA memakai kunci kecil tetap untuk pembelajaran; demo tiket dan perbankan tidak menjalankan transaksi nyata. Progres penjelajahan disimpan hanya di browser pengunjung.

Lihat `README.md` untuk catatan teknis asli dan `dist/assets/FONT_LICENSE.txt` untuk lisensi font.

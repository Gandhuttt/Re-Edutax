# Re-Edutax

Re-Edutax adalah repositori untuk membangun mock sistem Coretax berbasis kumpulan microservice. Setiap service akan memegang tanggung jawab yang spesifik, lalu saling bekerja sama melalui kontrak data, autentikasi, dan alur integrasi yang konsisten.

Repositori ini dirancang sebagai fondasi untuk pola arsitektur, boundary modul, dan standar implementasi service-service yang membentuk sistem secara keseluruhan.

## Tujuan Umum

- Menyediakan mock environment yang mendekati perilaku sistem Coretax.
- Memisahkan concern per domain ke dalam service yang berdiri sendiri.
- Menjaga agar kontrak antarmodul tetap eksplisit dan mudah dikembangkan.
- Menjadikan service pertama sebagai acuan untuk struktur service berikutnya.

## Gambaran Top-Level

### `auth/`

Service autentikasi dan manajemen sesi. Modul ini bertanggung jawab untuk identitas akun aplikasi, login, refresh session, logout, validasi request, dan audit event keamanan.

### `common/`

Area shared di level repositori. Folder ini disiapkan untuk menampung komponen lintas service seperti kontrak data bersama, helper umum, atau utilitas integrasi ketika jumlah service mulai bertambah.

## Rancangan Modul

Repositori ini dirancang agar berkembang menjadi sekumpulan modul dengan tanggung jawab yang terpisah namun saling terhubung.

Dalam jangka pendek, fokus pengembangan modul diarahkan ke empat service inti:

- `auth`
- `iam`
- `tax-reference`
- `taxpayer`

### `auth/`

Menangani identitas akun aplikasi, autentikasi, session, refresh token, logout, dan audit keamanan. Modul ini menjadi fondasi untuk seluruh service yang membutuhkan request context terautentikasi.

### `iam/`

Menangani identity and access management di atas lapisan autentikasi. Modul ini mengelola user internal, role, permission, assignment akses, dan aturan otorisasi yang dipakai service lain.

### `tax-reference/`

Mengelola data referensi perpajakan yang menjadi sumber acuan bersama, seperti kategori, kode, klasifikasi, tarif, atau parameter lain yang dibutuhkan modul domain.

### `taxpayer/`

Mengelola profil dan data utama wajib pajak atau entitas pajak yang direpresentasikan oleh sistem mock.

### `common/`

Menampung concern lintas service seperti shared types, kontrak integrasi, helper utilitas, dan komponen yang layak dipakai bersama tanpa menyalin logika ke banyak modul.

## Cara Berpikir Tentang Arsitektur

Target akhir repositori ini bukan satu aplikasi monolitik, melainkan sekumpulan service yang saling melengkapi. Secara garis besar:

- Setiap service memiliki domain responsibility yang jelas.
- `auth` menjadi pintu masuk untuk identitas pengguna dan lifecycle sesi.
- `iam` membangun lapisan otorisasi di atas identitas yang diterbitkan oleh `auth`.
- `tax-reference` menyediakan data acuan yang dapat dipakai konsisten oleh modul domain lain.
- `taxpayer` menjadi pemilik data profil entitas pajak dan memanfaatkan identitas serta hak akses dari `auth` dan `iam`.
- Shared concern yang benar-benar lintas service dapat dipindahkan ke `common` agar tidak terjadi duplikasi logika.

## Strategi Integrasi dan Deployment

Untuk menghubungkan modul-modul tersebut menjadi satu sistem, arsitektur ini diarahkan dalam dua horizon:

### Jangka pendek: Cloudflare Tunnel

Cloudflare Tunnel dipakai sebagai jalur eksposur awal untuk service-service yang berjalan terpisah. Pendekatan ini memudahkan pengembangan dan integrasi lintas modul tanpa harus lebih dulu membangun infrastruktur edge yang lebih kompleks.

Peran utamanya:

- membuka akses aman ke service yang berjalan lokal atau pada host terpisah,
- mempermudah pengujian integrasi antarmodul melalui endpoint publik yang terkontrol,
- menjadi jembatan awal untuk menyatukan `auth`, `iam`, `tax-reference`, dan `taxpayer`.

### Jangka panjang: Cloudflare Worker

Cloudflare Worker diposisikan sebagai lapisan edge untuk orkestrasi request, routing, komposisi response, dan kemungkinan policy enforcement yang lebih dekat ke sisi akses pengguna.

Peran yang dapat dituju:

- menjadi entrypoint tunggal untuk banyak service backend,
- menangani routing dan agregasi request ke modul yang relevan,
- menerapkan validasi awal, authorization check ringan, atau policy lintas modul,
- menyederhanakan konsumsi API dari sisi client dengan antarmuka yang lebih terpusat.

Dengan arah ini, Tunnel berfungsi sebagai strategi integrasi awal, sedangkan Worker menjadi target evolusi arsitektur ketika boundary antarmodul dan kontrak service sudah lebih matang.

## Dokumentasi Per Service

README top-level berfungsi sebagai peta sistem dan rancangan arsitektur. Detail implementasi, alur internal, struktur modul, dan model data setiap service sebaiknya ditempatkan pada README di dalam service masing-masing, misalnya `auth/README.md`, `iam/README.md`, dan seterusnya.

## Prinsip Pengembangan Repo

Saat modul-modul domain berkembang, pola yang dijaga adalah:

- setiap domain memiliki service sendiri,
- kontrak antarsystem dibuat eksplisit,
- concern umum dipindahkan ke `common`,
- integrasi awal dapat dipublikasikan melalui Cloudflare Tunnel,
- evolusi jangka panjang diarahkan ke entrypoint edge berbasis Cloudflare Worker,
- `auth` difokuskan pada identitas dan session,
- `iam` difokuskan pada role, permission, dan authorization policy,
- `tax-reference` difokuskan pada master data acuan,
- `taxpayer` difokuskan pada data subjek pajak, bukan logika autentikasi atau otorisasi.

Dengan begitu, repositori ini dapat berkembang menjadi mock Coretax yang modular, konsisten, dan lebih mudah diuji.

## Menjalankan Service yang Sudah Ada

Contoh service yang dapat dijalankan dari repositori ini adalah `auth`.

```sh
cd auth
npm install
npm run dev
```

Contoh environment minimal untuk `auth`:

```env
DATABASE_URL=local.db
JWT_ACCESS_SECRET=replace-this-secret
JWT_ACCESS_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=2592000
AUTH_MAX_FAILED_LOGINS=5
AUTH_LOCK_MINUTES=15
```

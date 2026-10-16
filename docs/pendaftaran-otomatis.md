# Pendaftaran otomatis (`/daftar`)

Form publik yang membuat akun peserta, menyimpan berkas ke Google Drive, dan mencatat satu baris ke Google Sheets.

## Penomoran NPWP: per batch

Setiap batch punya `penomoran` (kolom `batch_peserta.penomoran`):

| Mode | Berlaku untuk | NPWP / username |
| --- | --- | --- |
| `urut` | Semua batch yang sudah ada sebelum NIK dipakai (default kolom) | Nomor terbitan sistem (`helpers/npwp.ts`, ledger `npwp_terbit`), maks 99 peserta per batch |
| `nik` | Batch yang dibuat setelah `PENDAFTARAN_AKTIF=true` (**Buat Batch** di `/admin` memilih `nik` hanya bila saklar menyala) | **NIK peserta sendiri**; tidak ada nomor terbitan dan tidak ada baris di `npwp_terbit` |

Form `/daftar` menampilkan kolom **NIK** hanya bila kelas yang dipilih dipetakan ke batch `nik`. NIK divalidasi strukturnya (16 digit, kode wilayah 11–96, tanggal dan bulan lahir wajar, dan dua digit tahunnya harus cocok dengan Tahun lahir). Validasi ini tidak bisa memastikan NIK itu milik pengisinya.

Di `/admin`, batch `nik` tidak bisa memakai **Tambah Peserta Massal** (daftar nama tidak membawa NIK); **Tambah Peserta** mewajibkan NIK.

## Alur

1. Peserta mengisi `/daftar`. Cloudflare Turnstile memverifikasi di server.
2. Server mencari **batch tujuan** dari _Pilihan Kelas_ (tabel `pendaftaran_kelas`, diatur admin di `/admin` bagian _Pendaftaran Online_). Kelas tanpa batch **tertutup**.
3. Pemeriksaan murah ditolak sebelum efek samping apa pun: NIK tidak valid, email/NIK sudah terdaftar, format berkas salah.
4. Berkas diunggah ke subfolder baru di **folder induk di Drive Anda** (satu subfolder per pendaftar).
5. **Baris `pendaftaran` disimpan dengan status `diproses`** (termasuk URL folder). NPWP: NIK-nya sendiri (`nik`), atau nomor yang dicadangkan di ledger (`urut`).
6. Login Better Auth dan profil `wajib_pajak` dibuat, baris menjadi `selesai`, lalu dikirim ke Google Sheets. Password awal = _Password default_ batch.
7. **Admin mengirim password (dan NPWP untuk batch `urut`) secara manual**; tidak ada email otomatis. Peserta tidak melihat kredensial di layar.

### Pemulihan kegagalan

Baris `pendaftaran` ditulis **sebelum** akun, dan semua langkah sesudahnya idempoten. Jadi kegagalan di tengah jalan tidak meninggalkan akun yang memblokir email tanpa jejak:

- **Drive gagal** (langkah 4): belum ada yang tersimpan; folder yang setengah jadi dihapus. Peserta kirim ulang.
- **Menyimpan baris gagal** (langkah 5): folder dihapus, tidak ada akun. Peserta kirim ulang.
- **Login, profil, atau status gagal** (langkah 6): baris tetap `diproses` dengan alasan singkat. Peserta cukup **mengirim ulang formulir yang sama** (email dan NIK sama): server melanjutkan dari titik itu tanpa mengunggah ulang berkas. Atau admin menekan **Lanjutkan** di `/admin`. Pengiriman ulang dengan email/NIK berbeda ditolak, jadi orang lain tidak bisa mengambil alih pendaftaran yang tertunda. Pemulihan juga memastikan kredensial login (password) benar-benar ada, bukan hanya baris user.
- **Sheets gagal**: akun tetap jadi dan pendaftaran dianggap berhasil; baris ditandai _Sheets gagal_ dan bisa dikirim ulang dengan **Lanjutkan**.

Untuk mode `nik`, NIK sengaja tidak dicatat di ledger: kalau dicatat, kegagalan di tengah jalan akan "menghanguskan" NIK peserta itu selamanya.

## Siapa mengakses apa

| Layanan | Identitas | Alasan |
| --- | --- | --- |
| Google **Sheets** | Service account | Menulis ke spreadsheet tidak memakai kuota penyimpanan, jadi service account cukup. |
| Google **Drive** | **Akun Google Anda** lewat OAuth (scope `drive.file`) | Service account tidak punya kuota penyimpanan: di Drive pribadi unggahannya ditolak dengan `storageQuotaExceeded`, dan hanya Shared Drive (Google Workspace) yang bisa dipakai. Dengan OAuth, berkas dimiliki akun Anda dan memakai kuota Drive Anda. |

Scope `drive.file` hanya memberi akses ke berkas dan folder **yang dibuat aplikasi ini**, bukan seluruh Drive Anda. Karena itu folder induk harus dibuat oleh skrip setup di bawah; folder lama yang Anda buat sendiri tidak bisa dipakai. Karena pemiliknya akun Anda, rollback (`files.delete`) tidak butuh role tambahan.

## Konfigurasi

| Variabel | Isi | Rahasia |
| --- | --- | --- |
| `TURNSTILE_SITEKEY` | Sitekey widget Turnstile | tidak |
| `TURNSTILE_SECRET_KEY` | Secret widget Turnstile | **ya** |
| `TURNSTILE_HOSTNAMES` | Hostname frontend, dipisah koma. Produksi: `edutaxindo.warsidi.com` (jangan `localhost`) | tidak |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Isi lengkap file JSON kunci service account (untuk Sheets) | **ya** |
| `GOOGLE_SHEETS_ID` | ID spreadsheet (bagian `/d/<ID>/` pada URL) | tidak |
| `GOOGLE_SHEETS_RANGE` | Opsional, default `Pendaftaran!A:P` | tidak |
| `GOOGLE_OAUTH_CLIENT_ID` | Client ID OAuth tipe "Aplikasi desktop" | tidak |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Client secret OAuth tersebut | **ya** |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Dicetak skrip `scripts/google-drive-oauth.ts` | **ya** |
| `GOOGLE_DRIVE_FOLDER_ID` | ID folder induk, dicetak skrip yang sama | tidak |

Halaman `/daftar` menampilkan "Pendaftaran belum dibuka" bila salah satu variabel wajib belum terisi.

### Saklar rilis: `PENDAFTARAN_AKTIF`

Seluruh fitur ini mati kecuali `PENDAFTARAN_AKTIF` bernilai persis `true` (default mati, termasuk bila variabelnya tidak ada).

| Keadaan | `/daftar` | Endpoint kirim form |
| --- | --- | --- |
| `PENDAFTARAN_AKTIF` tidak diset atau bukan `true` (produksi, sampai dirilis) | 404, tanpa query ke database | 404, tidak menjalankan apa pun |
| `true`, tetapi variabel wajib di atas belum lengkap | "Pendaftaran belum dibuka" | ditolak |
| `true` dan semua lengkap | form tampil | berjalan |

Karena push ke `main` menjalankan workflow CI lalu Deploy (migrasi D1 remote + `wrangler deploy`), saklar ini yang menjaga fitur tetap tertutup di produksi. Lokal: `PENDAFTARAN_AKTIF=true` di `.env`. Untuk merilis: `npx wrangler secret put PENDAFTARAN_AKTIF` dengan nilai `true`, setelah seluruh daftar di atas terpasang.

Saklar juga mengatur dua hal di `/admin`: bagian **Pendaftaran Online** disembunyikan, dan **Buat Batch** membuat batch `urut` (perilaku lama) selama saklar mati, dan `nik` setelah menyala. Satu-satunya yang tidak ikut tertutup adalah tabel baru dari migrasi `0037_pendaftaran` (otomatis terpasang saat deploy; kolom `penomoran` berdefault `urut`, jadi batch yang ada tidak berubah).

Produksi (rahasia lewat `wrangler secret`, jangan ke `wrangler.jsonc`):

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put TURNSTILE_SITEKEY
npx wrangler secret put TURNSTILE_HOSTNAMES
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON < kunci-service-account.json
npx wrangler secret put GOOGLE_SHEETS_ID
npx wrangler secret put GOOGLE_OAUTH_CLIENT_ID
npx wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
npx wrangler secret put GOOGLE_OAUTH_REFRESH_TOKEN
npx wrangler secret put GOOGLE_DRIVE_FOLDER_ID
```

Lokal: isi `.env` (lihat `.env.example`) dengan sitekey dan secret widget Turnstile asli dan `TURNSTILE_HOSTNAMES=localhost`.

Kunci tes Cloudflare (`1x00000000000000000000AA` dst.) **tidak bisa dipakai**: siteverify-nya mengembalikan
`hostname: example.com` tanpa `action`, sedangkan server mewajibkan `action: daftar` dan hostname dari
`TURNSTILE_HOSTNAMES`, sehingga semua pendaftaran ditolak. Kegagalan verifikasi tampil ke peserta sebagai
"Verifikasi keamanan gagal".

## Menyiapkan Google

### Sheets (service account)

1. Google Cloud Console: buat project, aktifkan **Google Sheets API** dan **Google Drive API**.
2. Buat **service account**, lalu buat kunci JSON. Simpan di luar repo; isinya menjadi `GOOGLE_SERVICE_ACCOUNT_JSON`.
3. Buat spreadsheet. Beri nama tab `Pendaftaran`, isi baris 1 dengan header berikut (urutan harus sama):
   `Waktu (WIB) · Nama · Email · Tahun Lahir · Nomor Telepon · Pendidikan Terakhir · Bidang Keilmuan · Pekerjaan · Bidang Usaha · Alamat Domisili · Kota/Kabupaten · Provinsi · Pilihan Kelas · Batch · NPWP (NIK untuk batch baru) · Folder Berkas`
4. Bagikan spreadsheet ke `client_email` service account sebagai **Editor**.

### Drive (OAuth akun Anda)

1. Google Cloud Console → **Google Auth Platform**.
   - **Branding**: isi nama aplikasi dan email dukungan.
   - **Audience**: pilih **External**, tambahkan akun Google Anda sebagai pengguna uji.
   - **Data access**: tambahkan scope `.../auth/drive.file`.
   - Kembali ke **Audience**. Status **Testing** cukup untuk memulai, tetapi refresh token-nya berhenti berlaku dalam **7 hari** (lihat "Pembaruan refresh token" di bawah). Untuk token jangka panjang, **Publikasikan aplikasi** (status _In production_); itu mensyaratkan URL beranda dan URL kebijakan privasi di halaman Branding. `drive.file` adalah scope non-sensitif sehingga tidak perlu verifikasi.
2. **Clients → Buat client**, tipe **Aplikasi desktop**. Salin Client ID dan Client secret ke `.env` sebagai `GOOGLE_OAUTH_CLIENT_ID` dan `GOOGLE_OAUTH_CLIENT_SECRET`.
3. Jalankan:
   ```sh
   npx tsx scripts/google-drive-oauth.ts
   ```
   Buka alamat yang dicetak di browser, masuk dengan akun Google pemilik Drive, lalu setujui. Skrip membuat folder induk **Berkas Pendaftaran Edutaxindo** di Drive Anda (nama lain: argumen pertama) dan mencetak dua baris `GOOGLE_OAUTH_REFRESH_TOKEN=...` dan `GOOGLE_DRIVE_FOLDER_ID=...`. Salin ke `.env` dan ke secret produksi.
4. Buat **satu** widget Turnstile (Cloudflare Dashboard → Turnstile) dengan hostname `edutaxindo.warsidi.com` **dan** `localhost`, mode Managed. Sitekey dan secret yang sama dipakai di lokal dan produksi; yang berbeda hanya `TURNSTILE_HOSTNAMES` (lokal `localhost`, produksi `edutaxindo.warsidi.com`).

### Pembaruan refresh token (aplikasi OAuth berstatus Testing)

Keputusan saat ini: aplikasi OAuth **tetap berstatus Testing** (belum dipublikasikan, karena halaman kebijakan privasi belum ada). Konsekuensinya refresh token **berhenti berlaku 7 hari setelah diterbitkan**, jadi harus diperbarui sebelum itu. Selama masih Testing, catat tanggal penerbitan token terakhir.

Gejala bila terlambat: pendaftaran gagal dengan "Berkas gagal diunggah", dan log server memuat `invalid_grant` (juga bila token dicabut di https://myaccount.google.com/permissions). Tidak ada data peserta yang tersimpan pada pendaftaran yang gagal, tetapi peserta harus mengulang.

Pembaruan, cukup satu perintah:

```sh
npx tsx scripts/google-drive-oauth.ts
```

Setujui di browser dengan akun yang sama, lalu ganti **hanya** `GOOGLE_OAUTH_REFRESH_TOKEN` di `.env` dan di secret produksi. Skrip memakai ulang folder induk selama `GOOGLE_DRIVE_FOLDER_ID` di `.env` masih terbaca, jadi ID folder tidak berubah. Bila folder itu sudah dihapus atau di sampah, skrip membuat folder baru dan mencetak ID barunya juga.

Cara menghentikan siklus 7 hari: publikasikan aplikasi OAuth (Google Auth Platform → Audience → Publish app). Itu mensyaratkan nama aplikasi, email dukungan, URL beranda, dan URL kebijakan privasi di halaman Branding. Setelah dipublikasikan, jalankan skrip sekali lagi untuk token yang tidak kedaluwarsa.

## Batas dan keamanan

- Berkas: JPG, PNG, WEBP, PDF (dikenali dari byte awal, bukan nama/tipe kiriman browser); pas foto hanya gambar. Maks 10 MB per berkas, 30 MB total.
- Data tersimpan di tiga tempat: D1 (`pendaftaran`), Google Sheets, dan Google Drive (KTP dll., memakai kuota Drive Anda). Batasi akses ke spreadsheet dan folder induk, dan jangan membagikan folder itu secara luas.
- Refresh token + client secret memberi akses ke berkas yang dibuat aplikasi ini (bukan seluruh Drive, karena scope `drive.file`). Perlakukan seperti password.
- Sheets ditulis dengan `valueInputOption=RAW`, jadi isian yang diawali `=` tidak dievaluasi sebagai formula.
- Batch `urut` memuat maksimal 99 peserta; bila penuh, pendaftar melihat "Kuota kelas ini sudah penuh". Batch `nik` tidak punya batas itu.
- Tidak ada pembatasan laju selain Turnstile.
- Akun langsung aktif dengan _Password default_ batch (mis. `123`) begitu pendaftaran selesai, sebelum admin mengirim kredensial. Untuk batch `nik`, username-nya adalah NIK, yang bukan rahasia. Pertimbangkan password default yang tidak mudah ditebak untuk batch baru.

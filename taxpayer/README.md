# Taxpayer Service

Service `taxpayer` menyimpan profile wajib pajak dan master referensi yang dipakai service lain, terutama `auth`, untuk lookup `jenis_wp` dan `kategori_wp`.

## Yang Sudah Ada

- tabel `taxpayer_profile` untuk profile utama wajib pajak
- tabel referensi `ref_jenis_wp`
- tabel referensi `ref_kategori_wp`
- tabel `taxpayer_nitku` untuk NITKU cabang/pusat
- helper lookup profile by `userId`
- endpoint internal untuk lookup antar-service
- endpoint test untuk verifikasi lookup saat development

## Environment Minimal

```env
DATABASE_URL=local.db
INTERNAL_API_SECRET=replace-with-a-shared-internal-secret
```

## Struktur Data

`taxpayer_profile` menyimpan:

- `userId`
- `npwp`
- `nama`
- `kategoriWpCode`
- `statusWp`

`jenis_wp` tidak disimpan langsung di `taxpayer_profile`.
Nilainya diturunkan dari relasi `kategori_wp -> jenis_wp`.

## Master Referensi

Master data hidup di [src/lib/server/db/schema.ts](src/lib/server/db/schema.ts):

- `JENIS_WP_MASTER`
- `KATEGORI_WP_MASTER`

Seed membaca data dari sana agar schema tetap menjadi single source of truth.

## Seed

Jalankan:

```sh
npm run db:seed
```

Ini akan melakukan upsert ke:

- `ref_jenis_wp`
- `ref_kategori_wp`

## Lookup Helper

File: `src/lib/server/taxpayer-profile.ts`

Helper utama:

- `getTaxpayerProfileByUserId(userId)`

Respons lookup sudah menyertakan:

- profile utama
- `kategoriWp`
- `jenisWp`

## Endpoint Internal

Route:

```txt
GET /api/internal/taxpayer-profile?userId=<user-id>
```

Kebutuhan header:

```txt
x-internal-api-secret: <INTERNAL_API_SECRET>
```

Dipakai oleh service `auth` saat menerbitkan `POST /api/token`.

## Endpoint Test

Route:

```txt
GET /api/test/taxpayer-profile?userId=<user-id>
```

Dipakai untuk testing lokal tanpa secret internal.

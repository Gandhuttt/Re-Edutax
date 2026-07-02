# Auth Service

Service `auth` menangani login browser dengan Better Auth dan menerbitkan JWT akses untuk dipakai microservice lain.

## Yang Sudah Ada

- Better Auth untuk sign in, sign up, sign out, dan session cookie
- route auth browser di `/sign-in`, `/sign-up`, `/dashboard`
- endpoint Better Auth di `/api/auth/*`
- endpoint JWT internal di `POST /api/token`

## Environment Minimal

```env
DATABASE_URL=local.db
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace-with-another-long-random-secret
JWT_ACCESS_ISSUER=auth-service
JWT_ACCESS_AUDIENCE=internal-services
JWT_ACCESS_EXPIRES_IN=15m
TAXPAYER_SERVICE_URL=http://localhost:5174
INTERNAL_API_SECRET=replace-with-a-shared-internal-secret
```

Catatan:

- `JWT_ACCESS_SECRET` sebaiknya berbeda dari `BETTER_AUTH_SECRET`
- `JWT_ACCESS_ISSUER` dan `JWT_ACCESS_AUDIENCE` harus disamakan di service lain yang memverifikasi token

## Flow Untuk Browser

1. User login lewat Better Auth.
2. Better Auth menyimpan session cookie.
3. Route server di service `auth` memakai `locals.session`.

## Flow Untuk Microservice Lain

1. User login ke service `auth`.
2. Client memanggil `POST /api/token` dengan session cookie yang masih valid.
3. Service `auth` mengembalikan `accessToken` bearer.
4. Client mengirim `Authorization: Bearer <token>` ke microservice lain.
5. Microservice lain memverifikasi JWT dan mengisi `locals.user`.

Saat menerbitkan token, service `auth` melakukan lookup ke service `taxpayer` untuk mengambil `jenis_wp` dan `kategori_wp` terbaru berdasarkan `userId`.

Untuk development awal, `POST /api/token` sekarang mengembalikan error yang lebih eksplisit:

- `409 TAXPAYER_PROFILE_NOT_FOUND` jika user belum punya profile di service `taxpayer`
- `503 TAXPAYER_SERVICE_UNREACHABLE` jika service `taxpayer` tidak bisa dihubungi
- `502 TAXPAYER_SERVICE_UNAUTHORIZED` jika secret internal antar-service tidak cocok
- `500 TAXPAYER_SERVICE_URL_MISSING` atau `500 INTERNAL_API_SECRET_MISSING` jika env belum lengkap

Contoh respons `POST /api/token`:

```json
{
  "tokenType": "Bearer",
  "accessToken": "<jwt>",
  "expiresIn": "15m",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "taxpayer",
    "npwp": "012345678901234",
    "jenisWp": {
      "code": "ORANG_PRIBADI",
      "name": "Orang Pribadi"
    },
    "kategoriWp": {
      "code": "OP_KARYAWAN",
      "name": "Orang Pribadi Karyawan"
    }
  }
}
```

## Helper JWT di Service Auth

File: `src/lib/server/jwt.ts`

Helper yang tersedia:

- `signAccessToken(payload)`
- `verifyAccessToken(token)`
- `getBearerToken(request)`
- `authenticateBearerRequest(request)`

Claim minimum yang diterbitkan:

- `sub`
- `email`
- `name`
- `role`
- `jenisWp`
- `kategoriWp`
- `iss`
- `aud`
- `iat`
- `exp`

## Contoh Microservice SvelteKit Lain

Service lain tidak perlu menjalankan Better Auth penuh kalau hanya ingin memverifikasi user login dari auth service.

`src/app.d.ts`

```ts
declare global {
	namespace App {
		interface Locals {
			user: {
				sub: string;
				email: string;
				name?: string | null;
			} | null;
		}
	}
}

export {};
```

`src/lib/server/jwt.ts`

```ts
import jwt from 'jsonwebtoken';

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET!;

export function authenticateBearerRequest(request: Request) {
	const authorization = request.headers.get('authorization');

	if (!authorization?.startsWith('Bearer ')) {
		return null;
	}

	const token = authorization.slice('Bearer '.length).trim();

	try {
		const decoded = jwt.verify(token, jwtAccessSecret, {
			algorithms: ['HS256'],
			issuer: 'auth-service',
			audience: 'internal-services'
		});

		return typeof decoded === 'string' ? null : decoded;
	} catch {
		return null;
	}
}
```

`src/hooks.server.ts`

```ts
import type { Handle } from '@sveltejs/kit';

import { authenticateBearerRequest } from '$lib/server/jwt';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = authenticateBearerRequest(event.request);
	return resolve(event);
};
```

`src/routes/api/private/+server.ts`

```ts
import { json } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	return json({
		userId: locals.user.sub,
		email: locals.user.email
	});
};
```

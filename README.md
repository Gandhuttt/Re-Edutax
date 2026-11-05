# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.3 create --template minimal --types ts --install npm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Participant registration

Class registration is handled by the external page already linked from the landing
page (`https://bit.ly/BrevetEdutaxindo`). The internal `/daftar` form, online
registration admin controls, and Turnstile/Google Drive/Sheets integration have
been removed. Participant accounts and batches are still managed in `/admin`;
new batches use issued numbers (`urut`), while existing NIK batches retain their
numbering mode.

The simulator login page (`/auth/login`) explains that participant accounts are
provided when the training or brevet practicum begins, and are separate from
Coretax DJP credentials. New visitors can follow the class information and
registration link (`https://bit.ly/BrevetEdutaxindo`); existing participants who
have not received their practicum account are directed to the training organizer.
On desktop, the explanation and class link occupy the left panel, keeping the
right-hand login card focused on the form. On narrow screens, the form appears
first and the information panel follows below it.

Migration `0048_remove_internal_registration.sql` drops only `pendaftaran` and
`pendaftaran_kelas`, including any registration records in those tables. It does
not delete participant accounts, batches, or tax data. Historical migrations are
retained so existing databases can upgrade normally. Back up any registration
records that need retention before applying the migration to a deployed database.

Old registration environment variables are no longer read. Removing the module
does not revoke Google OAuth grants, delete Google Drive/Sheets data, remove a
Turnstile widget, or remove deployed secrets. Manage those resources separately;
Google access can be revoked at https://myaccount.google.com/permissions.

## BPU simulator

The BPU form supports keyword search in the **Nama Objek Pajak** dropdown.
Open the dropdown and type part of an object name, such as `konstruksi` or
`saham`, to filter the options without changing the tax calculation.
Form sections are ordered as **Informasi Umum**, **Pajak Penghasilan (Rp)**,
then **Dokumen Referensi**.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Production domain

The primary application URL is `https://coretax.edutaxindo.co.id`.
`wrangler.jsonc` retains `edutaxindo.warsidi.com` alongside the new custom domain
so the old hostname remains available for redirects. Both domains use the same
Worker and D1 database; no participant or tax data migration is required.

Before switching traffic, activate the `edutaxindo.co.id` Cloudflare zone, attach
the `coretax` custom domain, and verify its HTTPS certificate. Preserve the apex
website and email DNS records when changing nameservers.

During nameserver propagation, the former Rumahweb zone also publishes
`coretax.edutaxindo.co.id CNAME edutaxindo.warsidi.com` with TTL 300. This keeps
resolvers with cached old delegations pointed at Cloudflare without pinning edge
IP addresses. The authoritative Cloudflare zone uses the Worker-managed custom
domain record, not this alias. Previously cached negative DNS answers may still
need to expire before clients can resolve the new hostname.

At cutover, update the Worker's existing `BETTER_AUTH_URL` secret to
`https://coretax.edutaxindo.co.id` and verify a successful login on that hostname.
Users must sign in again because cookies cannot cross the two unrelated domains.
Then configure a Cloudflare Redirect Rule in the `warsidi.com` zone matching only
`http.host eq "edutaxindo.warsidi.com"`, with dynamic target
`concat("https://coretax.edutaxindo.co.id", http.request.uri.path)` and query-string
preservation enabled. Use a temporary 302 while verifying, then a permanent 301.
Keep the old hostname's DNS and HTTPS working for existing links.

The production cutover is complete: the Worker uses the new `BETTER_AUTH_URL`,
and the hostname-specific redirect is enabled with status 301. A browser request
to the old dashboard URL was verified to reach the new dashboard while retaining
its query string. Keep both custom domains configured on future deployments.

In the `edutaxindo.co.id` zone, the enabled `Coretax root ke dashboard` Redirect
Rule matches only
`http.host eq "coretax.edutaxindo.co.id" and http.request.uri.path eq "/"`.
It issues a 301 redirect to `https://coretax.edutaxindo.co.id/dashboard`, preserving
the query string. Anonymous visitors then follow the application's existing
redirect to `/auth/login`; signed-in visitors reach their dashboard. Other paths
and the main website at `https://edutaxindo.co.id/` remain unchanged.

Domain settings can be changed on the existing deployed Worker without publishing
local application changes or applying D1 migrations. The GitHub deployment workflow
also applies remote migrations, so do not use it solely to switch domains while an
unapproved database migration is pending.

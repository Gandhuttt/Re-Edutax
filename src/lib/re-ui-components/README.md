# Re UI components

Reusable Svelte 5 components for the Edutaxindo Praktika interface. Import from the barrel
module and place the UI inside `ReUiRoot` so the shared design tokens are
available to every component.

Override any token on `ReUiRoot` when a product needs a variation; component
files never need to be edited:

```svelte
<ReUiRoot style="--ui-navy:#132c49; --ui-yellow:#f2c230">
	<!-- application -->
</ReUiRoot>
```

## Page composition

The layout components own their responsive spacing, surfaces, and motion. A
route supplies only content and state:

```svelte
<ReUiRoot>
	<AppHeader brand="Edutaxindo Praktika" subtitle="Layanan Administrasi" logoSrc="/brand/wsd-mark-inverse.svg" />
	<PageLayout>
		<Breadcrumbs items={[{ label: "Beranda", href: "/dashboard" }, { label: "SPT" }]} />
		<PageHeading
			eyebrow="Pelaporan"
			title="Surat Pemberitahuan"
			description="Kelola dokumen pelaporan dalam satu ruang kerja."
		/>
		<Stack gap="34px">
			<ProcessWorkbench
				steps={steps}
				bind:active
				navLabel="Tahapan dokumen"
				navTitle="PROSES DOKUMEN"
			>
				{#snippet children(section)}
					<PanelHeading number="01" title={section} />
					<ContentSection title="Identitas">
						<FieldGrid><!-- fields --></FieldGrid>
					</ContentSection>
				{/snippet}
			</ProcessWorkbench>
		</Stack>
	</PageLayout>
</ReUiRoot>
```

`DocumentWorkspace` owns the standard document entrance and active-tab panel
motion while keeping every panel mounted, so routes do not need page-level CSS.

`FakturFormSection` is the full interactive Faktur composition used by the UI
lab. Its structure is built from the configurable `DocumentForm`, `LookupField`,
and `ConditionalField` components rather than Faktur-only CSS. Lower-level
layouts such as `ContentSection`, `FieldGrid`, `ResponsiveGrid`, `KeyValueGrid`,
`LabeledGroup`, and `Stack` can be combined for other workflows.

## Public site pages

Marketing pages (the landing page at `/`) use the same tokens with larger
type. `SiteSection` owns the content width and vertical rhythm; its `inverse`
tone (and `CtaBand tone="inverse"`, featured `OfferCard`, `SiteFooter`) adds the
`ui-surface-inverse` class, which flips the `--ui-surface-*` tokens so every
nested component adapts without extra props. Surfaces follow the library's
square style: 2px radius panels with a 4px navy or yellow top rule.

```svelte
<ReUiRoot>
	<AppHeader brand="Edutaxindo Praktika" logoSrc="/brand/wsd-mark-inverse.svg" homeHref="/" sticky skipLinkTarget="#main">
		{#snippet account()}
			<LinkButton href="/daftar" tone="accent" size="sm" shortLabel="Daftar">Daftar kelas</LinkButton>
		{/snippet}
	</AppHeader>
	<main id="main" tabindex="-1">
		<SiteSection spacing="lg" aria-labelledby="hero-title">
			<SplitLayout columns="minmax(0, 1.2fr) minmax(320px, 0.8fr)">
				{#snippet start()}
					<DisplayHeading level={1} size="hero" headingId="hero-title" title="Belajar pajak" emphasis="lewat praktik.">
						<LinkButton href="/daftar">Daftar</LinkButton>
					</DisplayHeading>
				{/snippet}
				{#snippet end()}
					<OfferCard featured live label="Pendaftaran dibuka" title="Batch 19" href="/daftar" actionLabel="Daftar Batch 19">
						<BulletList items={["Kasus nyata", "Praktik Coretax"]} />
					</OfferCard>
				{/snippet}
			</SplitLayout>
		</SiteSection>
		<SiteSection id="program" tone="inverse" aria-labelledby="program-title">
			<DisplayHeading layout="split" headingId="program-title" eyebrow="Program" title={"Fondasi lengkap.\nLatihan terarah."} />
			<NumberedGrid items={subjects} columns={3} />
		</SiteSection>
	</main>
	<SiteFooter brand="Edutaxindo Praktika" logoSrc="/brand/wsd-mark-inverse.svg" links={[{ label: "Program", href: "#program" }]} />
</ReUiRoot>
```

Other building blocks: `Eyebrow`, `FeatureImage` (intrinsic size, optional
caption and `zoom` crop), `StatementStrip`, `StepList`, `CredentialCard`
(details rendered with `KeyValueGrid`), `CtaBand` (`paper`, `inverse`, or
`accent`), and `BrandIdentity` (shared by `AppHeader` and `SiteFooter`; pass
`logoSrc` for an image logo or `mark` for a text monogram). Brand logos live in
`static/brand/`: `wsd-mark.svg` for light surfaces and the favicon,
`wsd-mark-inverse.svg` for navy surfaces.

## Root and form fields

```svelte
<script lang="ts">
	import {
		CheckboxField,
		DateField,
		FormField,
		ReUiRoot,
		SelectField,
		TextAreaField,
	} from "$lib/re-ui-components";

	let name = $state("");
	let period = $state("");
	let kind = $state("");
	let notes = $state("");
	let accepted = $state(false);
</script>

<ReUiRoot>
	<form>
		<FormField label="Nama wajib pajak" bind:value={name} required />
		<DateField label="Masa pajak" bind:value={period} />
		<SelectField
			label="Jenis dokumen"
			bind:value={kind}
			options={[
				{ value: "bpu", label: "Bukti potong unifikasi" },
				{ value: "spt", label: "SPT" },
			]}
		/>
		<TextAreaField label="Catatan" bind:value={notes} showCount />
		<CheckboxField label="Data telah diperiksa" bind:checked={accepted} />
	</form>
</ReUiRoot>
```

## SvelteKit remote-function forms

Pass the remote field proxy itself. The component reads and updates the proxy,
uses SvelteKit's generated input name, and shows the field's first validation
issue automatically. The route still owns the remote function and its schema.
You can also pass `value` or `checked` alongside `field` when initial data comes
from a query or page load; once edited, the remote field value takes precedence.

```svelte
<script lang="ts">
	import {
		ActionButton,
		CheckboxField,
		DateField,
		FormField,
		FormIssueSummary,
		RupiahField,
		SelectField,
	} from "$lib/re-ui-components";
	import { updateDocument } from "./updateDocument.remote";
</script>

<form {...updateDocument} novalidate>
	<FormField label="Nama" field={updateDocument.fields.name} />
	<SelectField
		label="Jenis pajak"
		field={updateDocument.fields.taxType}
		options={taxOptions}
	/>
	<DateField label="Tanggal" field={updateDocument.fields.date} />
	<RupiahField label="Nilai bruto" field={updateDocument.fields.grossAmount} />
	<CheckboxField label="Data sudah benar" field={updateDocument.fields.accepted} />

	<FormIssueSummary source={updateDocument.fields} />
	<ActionButton
		type="submit"
		pending={updateDocument.pending > 0}
		pendingLabel="Menyimpan..."
	>
		Simpan
	</ActionButton>
</form>
```

Nested and array fields use the same API, including
`field={updateDocument.fields.transactions[index].name}`. For a complete
document layout, pass the remote form to `DocumentForm` through its `remote`
prop (root forms and `form.for(id)` instances are both accepted); its footer
snippet receives the current pending state.

## Menus and navigation

Pass menu data directly to `NavDropdown` and `ProfileMenu`. Their item
callbacks can be used for client-side navigation or analytics.

```svelte
<script lang="ts">
	import {
		NavDropdown,
		ProfileMenu,
		type NavDropdownSection,
		type ProfileMenuGroup,
	} from "$lib/re-ui-components";

	const services: NavDropdownSection[] = [
		{
			heading: "Pelaporan",
			items: [
				{ label: "SPT Tahunan", href: "/spt" },
				{ label: "Bukti potong", href: "/bukti-potong" },
			],
		},
	];
	const profileGroups: ProfileMenuGroup[] = [
		{ label: "Portal saya", items: [{ label: "Pengaturan", href: "/akun" }] },
	];
</script>

<nav aria-label="Navigasi utama">
	<NavDropdown label="Layanan" sections={services} />
	<ProfileMenu
		name="PT Contoh"
		role="Wajib pajak badan"
		initials="PC"
		groups={profileGroups}
	/>
</nav>
```

## Data tables

`DataTable` is an alias for `DataTableViewport`. Keep the table itself native
HTML and add `TableActions` where a row needs actions.

```svelte
<script lang="ts">
	import { DataTable, TableActions } from "$lib/re-ui-components";
	const editDocument = () => {};
	const copyDocument = () => {};
	const deleteDocument = () => {};
</script>

<DataTable
	label="Dokumen terbaru"
	minWidth="960px"
	headerTone="navy"
	density="compact"
	stickyFirstColumn
>
	<table>
		<thead><tr><th scope="col">Aksi</th><th scope="col">Nomor</th><th scope="col">Status</th></tr></thead>
		<tbody>
			<tr>
				<td class="action-cell">
					<TableActions
						actions={[
							{ label: "Lihat", href: "/bukti-potong/1" },
							{ label: "Ubah", onclick: editDocument },
							{ label: "Salin", onclick: copyDocument },
							{ label: "Hapus", danger: true, onclick: deleteDocument },
						]}
					/>
				</td>
				<td>BPPU-2026-0001</td>
				<td>Draft</td>
			</tr>
		</tbody>
	</table>
</DataTable>
```

## Modal

`InstitutionalModal` uses a native modal dialog and exposes a bindable
`open` value. Actions are supplied as a snippet.

```svelte
<script lang="ts">
	import { ActionButton, InstitutionalModal } from "$lib/re-ui-components";
	let open = $state(false);
</script>

<ActionButton onclick={() => (open = true)}>Buka dialog</ActionButton>
<InstitutionalModal bind:open title="Konfirmasi pengiriman">
	<p>Dokumen akan dikirim untuk diproses.</p>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Batal</ActionButton>
		<ActionButton type="submit">Kirim</ActionButton>
	{/snippet}
</InstitutionalModal>
```

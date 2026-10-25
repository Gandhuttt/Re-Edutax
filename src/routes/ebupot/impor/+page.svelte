<script lang="ts">
	import { page } from '$app/state';
	import { importBp } from './importBp.remote';
	import { ActionButton, Breadcrumbs, FormActions, FormSection, InlineAlert, PageLayout, Stack } from '$lib/re-ui-components';
	const kind = $derived(page.url.searchParams.get('jenis') === 'bp26' ? 'bp26' : 'bp21');
</script>

<svelte:head><title>Impor XML {kind.toUpperCase()} — Simulasi</title></svelte:head>
<PageLayout contentWidth="1000px"><Stack gap="20px">
	<Breadcrumbs items={[{ label: 'e-Bupot', href: `/ebupot/${kind}` }, { label: `Impor XML ${kind.toUpperCase()}` }]} />
	<InlineAlert tone="warning" title="SIMULASI PENDIDIKAN — bukan upload ke DJP">
		Impor membuat konsep lokal berstatus SAVEDINVALID. Seluruh berkas dibatalkan jika ada baris tidak valid.
		Periksa kembali setiap konsep, lengkapi referensi lokal, lalu Submit dan terbitkan simulasi secara terpisah.
	</InlineAlert>
	<FormSection number="01" title={`Impor ${kind.toUpperCase()} dari template XML resmi`} bordered>
		<p>Gunakan struktur template resmi DJP. TIN pemotong harus sama dengan akun aktif. Maksimum 100 baris dan 1 MiB per berkas; masa aplikasi mulai Januari 2025.</p>
		<p><a href={`https://pajak.go.id/sites/default/files/2024-12/${kind}.zip`} target="_blank" rel="noopener noreferrer">Unduh template resmi DJP ({kind.toUpperCase()}, ZIP)</a> · <a href="/ebupot/referensi-lokal">Kelola referensi lokal</a></p>
		<p>Template BP21 tidak berisi nama penerima: daftarkan nama/TIN pada profil penerima lokal atau gunakan WP yang sudah terdaftar. Kode negara BP26 mengikuti COUNTRY_CODE resmi. Tarif otomatis dihitung ulang dan harus sesuai Deemed/Rate dalam XML. Sertifikat/SKD impor belum dianggap terverifikasi; Submit tetap memeriksa registry simulasi lokal.</p>
		<p>Format ini mengimpor konsep baru, bukan memperbarui dokumen terbit. WithholdingDate dipertahankan sebagai Tanggal Pemotongan. Template resmi tidak membawa bruto kumulatif sebelumnya; lengkapi pada form untuk objek pesangon/pensiun sebelum Submit.</p>
		<form {...importBp} enctype="multipart/form-data">
			<input type="hidden" name="jenis" value={kind} />
			<label for="bp-xml">Berkas XML {kind.toUpperCase()}</label>
			<input id="bp-xml" name="file" type="file" accept=".xml,application/xml,text/xml" required />
			{#each importBp.fields.allIssues() ?? [] as issue}<p class="issue" role="alert">{issue.message}</p>{/each}
			{#if importBp.result}<InlineAlert tone="success" title="Impor lokal berhasil" message={importBp.result.message} />{/if}
			<FormActions><ActionButton type="submit" pending={importBp.pending > 0}>Impor Konsep Lokal</ActionButton><a href={`/ebupot/${kind}`}>Kembali ke daftar {kind.toUpperCase()}</a></FormActions>
		</form>
	</FormSection>
</Stack></PageLayout>

<style>
	form { display: grid; gap: 16px; }
	input[type="file"] { max-width: 100%; padding: 12px; border: 1px solid var(--ui-border); border-radius: 8px; }
	.issue { color: var(--ui-danger); }
	p { overflow-wrap: anywhere; }
</style>

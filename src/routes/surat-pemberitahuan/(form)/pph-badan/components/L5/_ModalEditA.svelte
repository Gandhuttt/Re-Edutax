<script lang="ts">
	import { ActionButton, FieldGrid, FormField, InstitutionalModal } from "$lib/re-ui-components";

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			nitku: string;
			nama: string;
			alamat?: string;
			kelurahan?: string;
			kecamatan?: string;
			kabupaten?: string;
			provinsi?: string;
		},
		saveItem
	}: {
		open?: boolean;
		data: {
			id: string | number;
			nitku: string;
			nama: string;
			alamat?: string;
			kelurahan?: string;
			kecamatan?: string;
			kabupaten?: string;
			provinsi?: string;
		};
		saveItem: () => void;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal bind:open title="Edit Alamat Tempat Kegiatan Usaha" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="NI TKU" bind:value={data.nitku} required />
		<FormField label="Nama TKU" bind:value={data.nama} required />
		<FormField label="Alamat" value={data.alamat ?? ''} oninput={(event) => (data.alamat = event.currentTarget.value)} />
		<FormField label="Desa/Kelurahan" value={data.kelurahan ?? ''} oninput={(event) => (data.kelurahan = event.currentTarget.value)} />
		<FormField label="Kecamatan" value={data.kecamatan ?? ''} oninput={(event) => (data.kecamatan = event.currentTarget.value)} />
		<FormField label="Kota/Kabupaten" value={data.kabupaten ?? ''} oninput={(event) => (data.kabupaten = event.currentTarget.value)} />
		<FormField label="Provinsi" value={data.provinsi ?? ''} oninput={(event) => (data.provinsi = event.currentTarget.value)} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

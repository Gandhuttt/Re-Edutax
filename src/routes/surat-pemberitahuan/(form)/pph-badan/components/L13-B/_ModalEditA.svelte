<script lang="ts">
	import {
		ActionButton,
		DateField,
		FieldGrid,
		FormField,
		InstitutionalModal,
	} from "$lib/re-ui-components";
	import type { L13BARow } from "./types";

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		readonly = false,
	}: {
		open?: boolean;
		data: Partial<L13BARow>;
		saveItem: () => void;
		readonly?: boolean;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	id="modalL13BA"
	bind:open
	eyebrow="LAMPIRAN 13-B"
	title="Edit Perjanjian Kerja Sama"
	size="wide"
>
	<FieldGrid columns={2}>
		<FormField label="Nomor Perjanjian" bind:value={data.perjanjianNomor!} disabled={readonly} />
		<DateField label="Tanggal Perjanjian" bind:value={data.perjanjianTanggal!} disabled={readonly} />
		<FormField label="Mitra Kegiatan" bind:value={data.mitraKegiatan!} disabled={readonly} />
		<FormField label="Keterangan" bind:value={data.keterangan!} disabled={readonly} />
	</FieldGrid>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

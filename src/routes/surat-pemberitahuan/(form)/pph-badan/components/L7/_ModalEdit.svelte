<script lang="ts">
	import { ActionButton, FieldGrid, FormField, InstitutionalModal, RupiahField } from "$lib/re-ui-components";

	type Row = {
		tahunPajak: number;
		labaRugiNetoFiskal: number;
		kompensasiYMin4: number;
		kompensasiYMin3: number;
		kompensasiYMin2: number;
		kompensasiYMin1: number;
		kompensasiTahunIni: number;
		kompensasiYPlus1: number;
	};

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		readonly = false
	}: {
		open?: boolean;
		data: Row;
		saveItem: () => void;
		readonly?: boolean;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal bind:open title="SPT Pajak Penghasilan Badan" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Tahun/Bagian Tahun Pajak" value={String(data.tahunPajak)} disabled />
		<RupiahField label="Laba (Rugi) Netto Fiskal" bind:value={data.labaRugiNetoFiskal} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Y-4" bind:value={data.kompensasiYMin4} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Y-3" bind:value={data.kompensasiYMin3} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Y-2" bind:value={data.kompensasiYMin2} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Y-1" bind:value={data.kompensasiYMin1} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Tahun Pajak Ini" bind:value={data.kompensasiTahunIni} disabled={readonly} />
		<RupiahField label="Kompensasi Kerugian Fiskal Y+1" bind:value={data.kompensasiYPlus1} disabled={readonly} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

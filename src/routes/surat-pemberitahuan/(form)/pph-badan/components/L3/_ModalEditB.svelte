<script lang="ts">
	import { ActionButton, DateField, FieldGrid, FormField, InstitutionalModal, RupiahField, SelectField } from '$lib/re-ui-components';

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			namaPemotongPemungut: string;
			npwp?: string;
			jenisPajak?: string;
			dpp?: number;
			pph?: number;
			nomorBukti?: string;
			tanggalBukti?: string;
		},
		saveItem,
		jenisPajakOptions,
		readonly = false
	}: {
		open?: boolean;
		data: {
			id: string | number;
			namaPemotongPemungut: string;
			npwp?: string;
			jenisPajak?: string;
			dpp?: number;
			pph?: number;
			nomorBukti?: string;
			tanggalBukti?: string;
		};
		saveItem: () => void;
		jenisPajakOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal id="modalL3B" bind:open eyebrow="LAMPIRAN 3" title="Edit PPh yang Dipotong/Dipungut Pihak Lain" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Nama Pemotong/Pemungut Pajak" bind:value={data.namaPemotongPemungut} required disabled={readonly} />
		<FormField label="NPWP" bind:value={data.npwp!} required disabled={readonly} />
		<SelectField label="Jenis Pajak" bind:value={data.jenisPajak!} options={jenisPajakOptions} placeholder="Pilih jenis pajak" searchable required disabled={readonly} />
		<RupiahField label="DPP" bind:value={data.dpp!} disabled={readonly} />
		<RupiahField label="Pajak Penghasilan" bind:value={data.pph!} disabled={readonly} />
		<FormField label="Nomor Bukti Pemotongan/SSP/SSPCP" bind:value={data.nomorBukti!} required disabled={readonly} />
		<DateField label="Tanggal Bukti Pemotongan/SSP/SSPCP" bind:value={data.tanggalBukti!} required disabled={readonly} />
	</FieldGrid>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

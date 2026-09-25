<script lang="ts">
	import { ActionButton, DateField, FieldGrid, FormField, InstitutionalModal, RupiahField, SelectField, Stack } from '$lib/re-ui-components';

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			namaPemberiPenghasilan: string;
			negara?: string;
			tanggal?: string;
			jenisPenghasilan?: string;
			penghasilanNeto?: number;
			pphLuarNegeri?: number;
			mataUang?: string;
			pphLuarNegeriMataUangAsing?: number;
			kreditPajakYangDapatDikreditkan?: number;
			keterangan?: string;
		},
		saveItem,
		negaraOptions,
		jenisPenghasilanOptions,
		mataUangOptions,
		readonly = false
	}: {
		open?: boolean;
		data: {
			id: string | number;
			namaPemberiPenghasilan: string;
			negara?: string;
			tanggal?: string;
			jenisPenghasilan?: string;
			penghasilanNeto?: number;
			pphLuarNegeri?: number;
			mataUang?: string;
			pphLuarNegeriMataUangAsing?: number;
			kreditPajakYangDapatDikreditkan?: number;
			keterangan?: string;
		};
		saveItem: () => void;
		negaraOptions: { value: string; label: string }[];
		jenisPenghasilanOptions: { value: string; label: string }[];
		mataUangOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal id="modalL3A" bind:open eyebrow="LAMPIRAN 3" title="Edit Penghasilan dari Luar Negeri" size="wide" scrollable>
	<Stack gap="16px">
		<FieldGrid columns={2}>
			<FormField label="Nama" bind:value={data.namaPemberiPenghasilan} required disabled={readonly} />
			<SelectField label="Negara" bind:value={data.negara!} options={negaraOptions} placeholder="Pilih negara" searchable required disabled={readonly} />
			<DateField label="Tanggal PPh Terutang/Dibayar/Dipotong" bind:value={data.tanggal!} required disabled={readonly} />
			<SelectField label="Jenis Penghasilan" bind:value={data.jenisPenghasilan!} options={jenisPenghasilanOptions} placeholder="Pilih jenis penghasilan" required disabled={readonly} />
			<RupiahField label="Penghasilan Neto" bind:value={data.penghasilanNeto!} required disabled={readonly} />
			<RupiahField label="PPh Terutang/Dibayar/Dipotong di Luar Negeri" bind:value={data.pphLuarNegeri!} required disabled={readonly} />
			<SelectField label="Mata Uang" bind:value={data.mataUang!} options={mataUangOptions} placeholder="Pilih mata uang" searchable required disabled={readonly} />
			<RupiahField label="PPh dalam Mata Uang Asing" bind:value={data.pphLuarNegeriMataUangAsing!} currencyPrefix="" required disabled={readonly} />
			<RupiahField label="Kredit Pajak yang Dapat Diperhitungkan" bind:value={data.kreditPajakYangDapatDikreditkan!} required disabled={readonly} />
			<FormField label="Keterangan" bind:value={data.keterangan!} disabled={readonly} />
		</FieldGrid>
	</Stack>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

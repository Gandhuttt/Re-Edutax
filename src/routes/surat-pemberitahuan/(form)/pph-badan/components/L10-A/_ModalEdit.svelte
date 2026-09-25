<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField,
		Stack
	} from '$lib/re-ui-components';
	import type { L10ARow } from './types';

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		negaraOptions,
		bentukHubunganOptions,
		jenisTransaksiOptions,
		metodeHargaTransferOptions,
		readonly = false
	}: {
		open?: boolean;
		data: Partial<L10ARow>;
		saveItem: () => void;
		negaraOptions: { value: string; label: string }[];
		bentukHubunganOptions: { value: string; label: string }[];
		jenisTransaksiOptions: { value: string; label: string }[];
		metodeHargaTransferOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	const negaraChoices = $derived([{ value: '', label: 'Please Select' }, ...negaraOptions]);
	const bentukHubunganChoices = $derived([
		{ value: '', label: 'Please Select' },
		...bentukHubunganOptions
	]);
	const jenisTransaksiChoices = $derived([
		{ value: '', label: 'Please Select' },
		...jenisTransaksiOptions
	]);
	const metodeHargaTransferChoices = $derived([
		{ value: '', label: 'Please Select' },
		...metodeHargaTransferOptions
	]);

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	bind:open
	eyebrow="LAMPIRAN 10A"
	title="Edit transaksi yang dipengaruhi hubungan istimewa"
	size="large"
	scrollable
>
	<Stack gap="18px">
		<FieldGrid columns={2} gap="16px 18px">
			<FormField label="Nama *" type="text" bind:value={data.nama} disabled={readonly} />
			<FormField label="NPWP/TIN" type="text" bind:value={data.npwpTin} disabled={readonly} />
			<SelectField
				label="Negara"
				bind:value={data.negara}
				options={negaraChoices}
				disabled={readonly}
				searchable
				floatingPanel
			/>
			<SelectField
				label="Bentuk Hubungan"
				bind:value={data.bentukHubungan}
				options={bentukHubunganChoices}
				required
				disabled={readonly}
				floatingPanel
			/>
			<FormField
				label="Kegiatan Usaha"
				type="text"
				bind:value={data.kegiatanUsaha}
				disabled={readonly}
			/>
			<SelectField
				label="Jenis Transaksi"
				bind:value={data.jenisTransaksi}
				options={jenisTransaksiChoices}
				required
				disabled={readonly}
				floatingPanel
			/>
			<RupiahField
				label="Nilai Transaksi *"
				bind:value={data.nilaiTransaksi}
				disabled={readonly}
			/>
			<SelectField
				label="Metode Penentuan Harga Transfer yang Digunakan"
				bind:value={data.metodePenentuanHargaTransfer}
				options={metodeHargaTransferChoices}
				required
				disabled={readonly}
				floatingPanel
			/>
		</FieldGrid>
		<FormField
			label="Alasan Penggunaan Metode"
			type="text"
			bind:value={data.alasanPenggunaanMetode}
			disabled={readonly}
		/>
	</Stack>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton disabled={readonly} onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

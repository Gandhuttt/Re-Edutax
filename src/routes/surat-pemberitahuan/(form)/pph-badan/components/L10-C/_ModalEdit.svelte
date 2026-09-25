<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField
	} from '$lib/re-ui-components';
	import type { L10CRow } from './types';

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		negaraOptions,
		jenisTransaksiOptions,
		readonly = false
	}: {
		open?: boolean;
		data: Partial<L10CRow>;
		saveItem: () => void;
		negaraOptions: { value: string; label: string }[];
		jenisTransaksiOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	const negaraChoices = $derived([{ value: '', label: 'Please Select' }, ...negaraOptions]);
	const jenisTransaksiChoices = $derived([
		{ value: '', label: 'Please Select' },
		...jenisTransaksiOptions
	]);

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	bind:open
	eyebrow="LAMPIRAN 10C"
	title="Edit transaksi dengan pihak tax haven country"
	size="wide"
	scrollable
>
	<FieldGrid columns={2} gap="16px 18px">
		<FormField
			label="Nama Mitra Transaksi *"
			type="text"
			bind:value={data.namaMitraTransaksi}
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
		<SelectField
			label="Negara"
			bind:value={data.negara}
			options={negaraChoices}
			required
			disabled={readonly}
			searchable
			floatingPanel
		/>
		<RupiahField
			label="Nilai Transaksi *"
			bind:value={data.nilaiTransaksi}
			disabled={readonly}
		/>
	</FieldGrid>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton disabled={readonly} onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

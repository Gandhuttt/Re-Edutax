<script lang="ts">
	import { ActionButton, FieldGrid, FormField, InstitutionalModal, RupiahField, SelectField } from "$lib/re-ui-components";

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			jenisPenghasilan?: string;
			sumberPenghasilan?: string;
			penghasilanBruto?: number;
		},
		saveItem,
		jenisPenghasilanOptions
	}: {
		open?: boolean;
		data: {
			id: string | number;
			jenisPenghasilan?: string;
			sumberPenghasilan?: string;
			penghasilanBruto?: number;
		};
		saveItem: () => void;
		jenisPenghasilanOptions: { value: string; label: string }[];
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal bind:open title="Edit Penghasilan yang Tidak Termasuk Objek Pajak" size="wide">
	<FieldGrid columns={2}>
		<FormField label="Kode" value={data.jenisPenghasilan ?? ''} disabled required />
		<SelectField
			label="Jenis Penghasilan"
			bind:value={data.jenisPenghasilan!}
			options={jenisPenghasilanOptions}
			placeholder="Pilih jenis penghasilan"
			required
			searchable
			floatingPanel
		/>
		<FormField label="Sumber Penghasilan" bind:value={data.sumberPenghasilan!} required />
		<RupiahField
			label="Penghasilan Bruto"
			bind:value={data.penghasilanBruto!}
			required
		/>
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

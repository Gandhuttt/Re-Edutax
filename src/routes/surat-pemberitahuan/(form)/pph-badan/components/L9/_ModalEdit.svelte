<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FormField,
		FormSection,
		InstitutionalModal,
		RupiahField,
		SelectField,
		Stack
	} from '$lib/re-ui-components';
	import type { L9Row } from './types';

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		jenisHartaOptions,
		metodeKomersialOptions,
		metodeFiskalOptions,
		readonly = false
	}: {
		open?: boolean;
		data: Partial<L9Row>;
		saveItem: () => void;
		jenisHartaOptions: { value: string; label: string }[];
		metodeKomersialOptions: { value: string; label: string }[];
		metodeFiskalOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	const jenisHartaChoices = $derived([
		{ value: '', label: 'Please Select' },
		...jenisHartaOptions
	]);
	const metodeKomersialChoices = $derived([
		{ value: '', label: 'Please Select' },
		...metodeKomersialOptions.map((option) => ({ value: option.label, label: option.label }))
	]);
	const metodeFiskalChoices = $derived([
		{ value: '', label: 'Please Select' },
		...metodeFiskalOptions.map((option) => ({ value: option.label, label: option.label }))
	]);

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	bind:open
	eyebrow="LAMPIRAN 9"
	title="Edit Penyusutan dan Amortisasi Fiskal"
	size="large"
	scrollable
>
	<Stack gap="18px">
		<FieldGrid columns={2} gap="16px 18px">
			<FormField label="Kode Harta" type="text" bind:value={data.kodeHarta} disabled={readonly} />
			<SelectField
				label="Jenis Harta"
				bind:value={data.jenisHarta}
				options={jenisHartaChoices}
				required
				disabled={readonly}
				searchable
				floatingPanel
			/>
			<FormField
				label="Bulan / Tahun Perolehan *"
				type="month"
				bind:value={data.bulanTahunPerolehan}
				disabled={readonly}
			/>
			<RupiahField label="Biaya Perolehan *" bind:value={data.hargaPerolehan!} disabled={readonly} />
			<RupiahField
				label="Nilai Sisa Buku Fiskal pada Awal Tahun"
				bind:value={data.nilaiSisaBukuFiskalAwalTahun!}
				disabled={readonly}
			/>
		</FieldGrid>

		<FormSection title="Metode Penyusutan/Amortisasi" bordered>
			<FieldGrid columns={2} gap="16px 18px">
				<SelectField
					label="Komersial"
					bind:value={data.metodePenyusutanKomersial}
					options={metodeKomersialChoices}
					disabled={readonly}
					floatingPanel
				/>
				<SelectField
					label="Fiskal"
					bind:value={data.metodePenyusutanFiskal}
					options={metodeFiskalChoices}
					disabled={readonly}
					floatingPanel
				/>
			</FieldGrid>
		</FormSection>

		<FieldGrid columns={2} gap="16px 18px">
			<RupiahField
				label="Penyusutan/Amortisasi Fiskal Tahun Ini"
				bind:value={data.penyusutanAmortisasiFiskalTahunIni!}
				disabled={readonly}
			/>
			<RupiahField
				label="Penyusutan/Amortisasi Komersial Tahun Ini"
				bind:value={data.penyusutanAmortisasiKomersialTahunIni!}
				disabled={readonly}
			/>
			<RupiahField
				label="Akumulasi Penyusutan/Amortisasi Fiskal"
				bind:value={data.akumulasiPenyusutanAmortisasiFiskal!}
				disabled={readonly}
			/>
			<RupiahField
				label="Nilai Sisa Buku Fiskal pada Akhir Tahun"
				bind:value={data.nilaiSisaBukuFiskalAkhirTahun!}
				disabled={readonly}
			/>
		</FieldGrid>
		<FormField label="Keterangan" type="text" bind:value={data.keterangan} disabled={readonly} />
	</Stack>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton disabled={readonly} onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

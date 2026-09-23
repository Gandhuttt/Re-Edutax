<script lang="ts">
	import {
		CheckboxField,
		DataTableBody,
		DataTableViewport,
		FieldGrid,
		FileUploadField,
		FormField,
		FormSection,
		RadioGroup,
		Stack
	} from '$lib/re-ui-components';

	let {
		sptItem
	}: {
		sptItem: {
			iiiA: number;
			iiiB: number;
			iiiC: number;
			iiiD: number;
			iiiE: number;
			iiiF: number;
			iiiG: number;
			iiiHGantiSptSebelumnya: boolean | null;
			iiiHTindakan: 'dikompensasikan' | 'dikembalikan_pendahuluan' | 'dikembalikan_pemeriksaan' | null;
			iiiHRekeningPilihBank: string | null;
			iiiHRekeningNomor: string | null;
			iiiHRekeningNamaBank: string | null;
			iiiHRekeningNamaPemilik: string | null;
		};
	} = $props();

	const rows = $derived([
		{ code: 'A.', description: 'Pajak Keluaran yang harus dipungut sendiri (I.A.2 + I.A.3 + I.A.4 + I.A.5)', value: sptItem.iiiA },
		{ code: 'B.', description: 'PPN disetor di muka dalam masa pajak yang sama', value: sptItem.iiiB },
		{ code: 'C.', description: 'Pajak Masukan yang dapat diperhitungkan (II.G)', value: sptItem.iiiC },
		{ code: 'D.', description: 'Kelebihan pemungutan PPN oleh Pemungut PPN', value: sptItem.iiiD },
		{ code: 'E.', description: 'PPN kurang atau (lebih) bayar (III.A - III.B - III.C - III.D)', value: sptItem.iiiE },
		{ code: 'F.', description: 'PPN kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya', value: sptItem.iiiF },
		{ code: 'G.', description: 'PPN kurang atau (lebih) bayar karena pembetulan SPT (III.E - III.F)', value: sptItem.iiiG }
	]);
</script>

<Stack gap="14px">
	<div class="amount-table">
		<DataTableViewport
			label="Perhitungan PPN kurang bayar atau lebih bayar"
			minWidth="760px"
			headerTone="navy"
			density="compact"
		>
		<table>
			<thead>
				<tr>
					<th>Kode</th>
					<th>Uraian</th>
					<th class="number">PPN (Rupiah)</th>
				</tr>
			</thead>
			<DataTableBody items={rows} getKey={(row) => row.code} emptyColspan={3}>
				{#snippet row(item)}
					<td><strong>{item.code}</strong></td>
					<td>{item.description}</td>
					<td><FormField label={`PPN ${item.code}`} value={String(item.value)} disabled /></td>
				{/snippet}
			</DataTableBody>
			</table>
		</DataTableViewport>
	</div>

	<FormSection
		number="H."
		title="Diminta untuk"
		description="Pilih tindak lanjut atas kelebihan bayar dan lengkapi rekening penerima."
		bordered
	>
		<Stack gap="16px">
			<CheckboxField
				label="Ganti SPT sebelumnya"
				name="check-ganti"
				checked={sptItem.iiiHGantiSptSebelumnya ?? false}
			/>
			<RadioGroup
				label="Tindakan"
				name="radio-ganti"
				value={sptItem.iiiHTindakan ?? ''}
				options={[
					{ value: 'dikompensasikan', label: '1. Dikompensasikan' },
					{ value: 'dikembalikan_pendahuluan', label: '2. Dikembalikan melalui pengembalian pendahuluan' },
					{ value: 'dikembalikan_pemeriksaan', label: '3. Dikembalikan melalui pemeriksaan' }
				]}
			/>
			<FieldGrid columns={2} gap="14px 16px">
				<FileUploadField
					label="Pilih Rekening Bank"
					hint={sptItem.iiiHRekeningPilihBank ? `Rekening terpilih: ${sptItem.iiiHRekeningPilihBank}` : ''}
				/>
				<FormField
					label="Nomor Rekening"
					name="III_H_rekening_nomor"
					value={sptItem.iiiHRekeningNomor ?? ''}
				/>
				<FormField
					label="Nama Bank"
					name="III_H_rekening_namaBank"
					value={sptItem.iiiHRekeningNamaBank ?? ''}
				/>
				<FormField
					label="Nama Pemilik Rekening"
					name="III_H_rekening_namaPemilik"
					value={sptItem.iiiHRekeningNamaPemilik ?? ''}
				/>
			</FieldGrid>
		</Stack>
	</FormSection>
</Stack>

<style>
	.amount-table :global(.table-viewport td label .label) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.amount-table :global(.table-viewport td input) {
		min-width: 9rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

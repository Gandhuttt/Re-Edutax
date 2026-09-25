<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FieldGrid,
		FormField,
		FormSection,
		RupiahField,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import type { L9Row } from './types';

	let {
		data,
		openModal,
		deleteItem,
		jenisHartaOptions,
		jumlahPenyusutanKomersial = $bindable(),
		readonly = false
	}: {
		data: L9Row[];
		openModal: (
			row: L9Row | null,
			kelompokPenyusutan: L9Row['kelompokPenyusutan'],
			options: { value: string; label: string }[]
		) => void;
		deleteItem: (id: string | number) => void;
		jenisHartaOptions: { value: string; label: string }[];
		jumlahPenyusutanKomersial: number;
		readonly?: boolean;
	} = $props();

	const groups: { value: L9Row['kelompokPenyusutan']; label: string }[] = [
		{ value: 'permanen', label: 'PERMANEN' },
		{ value: 'tidak_permanen', label: 'TIDAK PERMANEN' }
	];

	const rupiah = new Intl.NumberFormat('id-ID');
	const jenisHartaLabel = (kode: string) =>
		jenisHartaOptions.find((option) => option.value === kode)?.label ?? kode;
	let rowsByGroup = $derived(
		new Map(groups.map((group) => [group.value, data.filter((row) => row.kelompokPenyusutan === group.value)]))
	);
	const totalFiskal = (rows: L9Row[]) =>
		rows.reduce((sum, row) => sum + Number(row.penyusutanAmortisasiFiskalTahunIni || 0), 0);
	let jumlahPenyusutanFiskal = $derived(totalFiskal(data));
	let selisihPenyusutan = $derived(
		jumlahPenyusutanFiskal - Number(jumlahPenyusutanKomersial || 0)
	);
</script>

<Stack gap="18px">
	{#each groups as group}
		{@const rows = rowsByGroup.get(group.value) ?? []}
		<FormSection title={group.label} bordered>
			{#snippet actions()}
				<ActionButton
					tone="secondary"
					disabled={readonly}
					onclick={() => openModal(null, group.value, jenisHartaOptions)}
				>
					Tambah
				</ActionButton>
			{/snippet}

			<DataTable
				label={`Daftar penyusutan ${group.label}`}
				minWidth="1500px"
				headerTone="navy"
				density="compact"
				stickyFirstColumn
			>
				<table>
					<thead>
						<tr>
							<th scope="col" rowspan="2">Tindakan</th>
							<th scope="col" rowspan="2">Kode Harta</th>
							<th scope="col" rowspan="2">Kelompok/Jenis Harta</th>
							<th scope="col" rowspan="2">Bulan/Tahun Perolehan</th>
							<th scope="col" rowspan="2" class="number">Biaya Perolehan (Rp)</th>
							<th scope="col" rowspan="2" class="number">Nilai Sisa Buku Fiskal pada Awal Tahun (Rp)</th>
							<th scope="colgroup" colspan="2">Metode Penyusutan/Amortisasi</th>
							<th scope="col" rowspan="2" class="number">Penyusutan/Amortisasi Fiskal Tahun Ini</th>
							<th scope="col" rowspan="2">Keterangan</th>
						</tr>
						<tr>
							<th scope="col">Komersial</th>
							<th scope="col">Fiskal</th>
						</tr>
					</thead>
					<tbody>
						{#if rows.length === 0}
							<tr><td class="empty" colspan="10">Tidak ada data yang ditampilkan</td></tr>
						{:else}
							{#each rows as row (row.id)}
								<tr>
									<td class="action-cell">
										<TableActions actions={[
											{ label: 'Edit', disabled: readonly, onclick: () => openModal(row, group.value, jenisHartaOptions) },
											{ label: 'Hapus', danger: true, disabled: readonly, onclick: () => deleteItem(row.id) }
										]} />
									</td>
									<td>{row.kodeHarta}</td>
									<td>{jenisHartaLabel(row.jenisHarta)}</td>
									<td>{row.bulanTahunPerolehan}</td>
									<td class="number">{rupiah.format(row.hargaPerolehan)}</td>
									<td class="number">{rupiah.format(row.nilaiSisaBukuFiskalAwalTahun)}</td>
									<td>{row.metodePenyusutanKomersial}</td>
									<td>{row.metodePenyusutanFiskal}</td>
									<td class="number">{rupiah.format(row.penyusutanAmortisasiFiskalTahunIni)}</td>
									<td>{row.keterangan}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
					<tfoot>
						<tr>
							<th scope="row" colspan="8">Total</th>
							<td class="number">{rupiah.format(totalFiskal(rows))}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</DataTable>
		</FormSection>
	{/each}

	<FormSection title="Ringkasan penyusutan" bordered>
		<FieldGrid columns={3}>
			<FormField label="Jumlah Penyusutan Fiskal" value={rupiah.format(jumlahPenyusutanFiskal)} disabled />
			<RupiahField label="Jumlah Penyusutan Komersial" bind:value={jumlahPenyusutanKomersial} disabled={readonly} />
			<FormField label="Selisih Penyusutan" value={rupiah.format(selisihPenyusutan)} disabled />
		</FieldGrid>
	</FormSection>
</Stack>

<style>
	.empty { text-align: center; }
	.number { text-align: right; }
	:global(.action-cell) { white-space: nowrap; }
</style>

<script lang="ts">
	import { DataTable, InlineAlert, Stack, TableActions } from '$lib/re-ui-components';
	import { computeLabaRugiRows, type LabaRugiAkunTemplate } from './labaRugiRollup';

	interface LabaRugiLeaf {
		id?: string;
		akunId: string;
		nilaiKomersial: number;
		nonObjekPajak: number;
		dikenakanPphFinal: number;
		penyesuaianFiskalPositif: number;
		penyesuaianFiskalNegatif: number;
		kodePenyesuaianFiskal: string[];
	}

	interface Props {
		sektorUsaha: string;
		templatesBySektor: Map<string, { lampiranKode: string | null; rows: LabaRugiAkunTemplate[] }>;
		labaRugi: LabaRugiLeaf[];
		readonly?: boolean;
		openModal: (row: unknown) => void;
	}

	let {
		sektorUsaha,
		templatesBySektor,
		labaRugi = $bindable(),
		readonly = false,
		openModal
	}: Props = $props();

	const rupiah = new Intl.NumberFormat('id-ID');
	const activeTemplate = $derived(templatesBySektor.get(sektorUsaha));
	const template = $derived(activeTemplate?.rows ?? []);
	const lampiranKode = $derived(activeTemplate?.lampiranKode ?? null);
	const computedRows = $derived(computeLabaRugiRows(template, labaRugi));
	const belumTersimpan = $derived(
		template.some((row) => row.rowType === 'data') &&
			!computedRows.some((row) => row.rowType === 'data' && row.id)
	);
	const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));
	const showFiskalSplit = (row: (typeof computedRows)[number]) => row.rowType !== 'sum' || row.kode === '4800';
	const formatCell = (row: (typeof computedRows)[number], value: number) =>
		row.kode === '4800' ? rupiah.format(value) : formatNilai(value);

	// Ensure every data row of the currently selected sektor's template has a
	// local labaRugi entry to edit, even before the SPT has been saved once
	// with that sektor (which is when these rows actually get persisted).
	$effect(() => {
		const existingAkunIds = new Set(labaRugi.map((row) => row.akunId));
		const missing = template.filter((row) => row.rowType === 'data' && !existingAkunIds.has(row.id));

		if (missing.length === 0) return;

		labaRugi.push(
			...missing.map((row) => ({
				akunId: row.id,
				nilaiKomersial: 0,
				nonObjekPajak: 0,
				dikenakanPphFinal: 0,
				penyesuaianFiskalPositif: 0,
				penyesuaianFiskalNegatif: 0,
				kodePenyesuaianFiskal: []
			}))
		);
	});
</script>

<Stack gap="12px">
	{#if lampiranKode}
		<div class="lampiran-code">Lampiran 1-{lampiranKode}</div>
		{#if belumTersimpan}
			<InlineAlert
				tone="warning"
				compact
				message="Perubahan sektor usaha belum disimpan. Klik Simpan Konsep untuk menyimpan baris ini."
			/>
		{/if}
	{:else}
		<InlineAlert compact message="Belum ada transkrip untuk sektor usaha yang dipilih." />
	{/if}

	<DataTable
		label="Transkrip laporan laba rugi"
		minWidth="1440px"
		headerTone="navy"
		density="compact"
		stickyFirstColumn
	>
		<table>
			<thead>
				<tr>
					<th scope="col">Tindakan</th>
					<th scope="col">Kode akun</th>
					<th scope="col">Nama akun</th>
					<th scope="col">Nilai komersial</th>
					<th scope="col">Tidak termasuk objek pajak</th>
					<th scope="col">Dikenakan PPh bersifat final</th>
					<th scope="col">Objek pajak tidak final</th>
					<th scope="col">Penyesuaian fiskal positif</th>
					<th scope="col">Penyesuaian fiskal negatif</th>
					<th scope="col">Kode penyesuaian fiskal</th>
					<th scope="col">Nilai fiskal</th>
				</tr>
			</thead>
			<tbody>
				{#each computedRows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header">
							<th scope="rowgroup" colspan="11">{row.namaAkun}</th>
						</tr>
					{:else}
						<tr class:sum-row={row.rowType === 'sum'}>
							<td class="action-cell">
								{#if row.rowType === 'data'}
									<TableActions
										actions={[{
											label: 'Edit',
											disabled: readonly,
											onclick: () => openModal(row)
										}]}
									/>
								{/if}
							</td>
							<td>{row.kode}</td>
							<td>{row.namaAkun}</td>
							<td class="number">{formatCell(row, row.nilaiKomersial)}</td>
							<td class="number">{showFiskalSplit(row) ? formatCell(row, row.nonObjekPajak) : ''}</td>
							<td class="number">{showFiskalSplit(row) ? formatCell(row, row.dikenakanPphFinal) : ''}</td>
							<td class="number">{formatCell(row, row.objekPajakTidakFinal)}</td>
							<td class="number">{showFiskalSplit(row) ? formatCell(row, row.penyesuaianFiskalPositif) : ''}</td>
							<td class="number">{showFiskalSplit(row) ? formatCell(row, row.penyesuaianFiskalNegatif) : ''}</td>
							<td>{row.kodePenyesuaianFiskal.join(', ')}</td>
							<td class="number">{formatCell(row, row.nilaiFiskal)}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</DataTable>
</Stack>

<style>
	.lampiran-code {
		color: var(--ui-navy);
		font-size: 14px;
		font-weight: 800;
	}
	.group-header th {
		padding: 10px;
		background: var(--ui-paper-deep);
		color: var(--ui-navy);
		text-align: left;
	}
	.sum-row td {
		font-weight: 800;
	}
</style>

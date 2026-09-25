<script lang="ts">
	import { DataTable, FieldGrid, InlineAlert, Stack } from '$lib/re-ui-components';
	import { applyRupiahInput } from '$lib/helpers/rupiahInput';
	import { computeNeracaRows, type NeracaAkunTemplate, type NeracaComputedRow } from './neracaRollup';

	interface NeracaLeaf {
		id?: string;
		akunId: string;
		nilai: number;
	}

	interface Props {
		sektorUsaha: string;
		neracaTemplatesBySektor: Map<string, { rows: NeracaAkunTemplate[] }>;
		neraca: NeracaLeaf[];
		readonly?: boolean;
	}

	let { sektorUsaha, neracaTemplatesBySektor, neraca = $bindable(), readonly = false }: Props = $props();

	const rupiah = new Intl.NumberFormat('id-ID');
	const activeNeracaTemplate = $derived(neracaTemplatesBySektor.get(sektorUsaha));
	const neracaTemplate = $derived(activeNeracaTemplate?.rows ?? []);
	const computedNeracaRows = $derived(computeNeracaRows(neracaTemplate, neraca));
	const asetRows = $derived(computedNeracaRows.filter((row) => row.section === 'aset'));
	const liabilitasEkuitasRows = $derived(computedNeracaRows.filter((row) => row.section === 'liabilitas_ekuitas'));
	const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));

	// Ensure every data row of the currently selected sektor's neraca template has a
	// local neraca entry to edit, even before the SPT has been saved once with that
	// sektor (which is when these rows actually get persisted).
	$effect(() => {
		const existingAkunIds = new Set(neraca.map((row) => row.akunId));
		const missing = neracaTemplate.filter((row) => row.rowType === 'data' && !existingAkunIds.has(row.id));

		if (missing.length === 0) return;

		neraca.push(...missing.map((row) => ({ akunId: row.id, nilai: 0 })));
	});

	function formatRupiahInput(value: number | undefined): string {
		return value ? value.toLocaleString('id-ID') : '';
	}

	function handleNeracaInput(e: Event, akunId: string): void {
		const num = applyRupiahInput(e);
		const index = neraca.findIndex((item) => item.akunId === akunId);
		if (index !== -1) neraca[index] = { ...neraca[index], nilai: num };
	}
</script>

{#snippet neracaTable(rows: NeracaComputedRow[], label: string)}
	<DataTable {label} minWidth="520px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Kode akun</th>
					<th scope="col">Nama akun</th>
					<th scope="col">Nilai</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header">
							<th scope="rowgroup" colspan="3">{row.namaAkun}</th>
						</tr>
					{:else}
						<tr class:sum-row={row.rowType === 'sum'}>
							<td>{row.kode}</td>
							<td>{row.namaAkun}</td>
							<td class="number input-cell">
								{#if row.rowType === 'data'}
									<input
										type="text"
										inputmode="numeric"
										aria-label={`Nilai ${row.namaAkun}`}
										value={formatRupiahInput(row.nilai)}
										disabled={readonly}
										oninput={(e) => handleNeracaInput(e, row.akunId ?? '')}
									/>
								{:else}
									<input
										type="text"
										aria-label={`Jumlah ${row.namaAkun}`}
										value={formatNilai(row.nilai)}
										readonly
										disabled
									/>
								{/if}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</DataTable>
{/snippet}

{#if neracaTemplate.length === 0}
	<InlineAlert compact message="Belum ada transkrip neraca untuk sektor usaha yang dipilih." />
{:else}
	<FieldGrid columns={2} gap="16px">
		<Stack gap="8px">
			<strong class="table-title">Aset</strong>
			{@render neracaTable(asetRows, 'Transkrip neraca aset')}
		</Stack>
		<Stack gap="8px">
			<strong class="table-title">Liabilitas dan ekuitas</strong>
			{@render neracaTable(liabilitasEkuitasRows, 'Transkrip neraca liabilitas dan ekuitas')}
		</Stack>
	</FieldGrid>
{/if}

<style>
	.table-title {
		color: var(--ui-navy);
		font-size: 14px;
		text-transform: uppercase;
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
	.input-cell input {
		width: 100%;
		min-width: 120px;
		height: 34px;
		padding: 0 9px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.input-cell input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.input-cell input:disabled {
		background: #e9e7df;
		color: #666b70;
	}
</style>

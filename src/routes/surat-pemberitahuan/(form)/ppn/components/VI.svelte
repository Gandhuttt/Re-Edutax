<script lang="ts">
	import {
		CheckboxField,
		DataTableBody,
		DataTableViewport,
		FormField
	} from '$lib/re-ui-components';

	let {
		sptItem
	}: {
		sptItem: {
			viA: number;
			viB: number;
			viC: number;
			viD: number;
			viE: number;
			viF: boolean | null;
		};
	} = $props();

	const rows = $derived([
		{ code: 'A.', description: 'PPnBM yang harus dipungut sendiri (I.A.2 + I.A.3 + I.A.4 + I.A.5)', value: sptItem.viA },
		{ code: 'B.', description: 'Kelebihan pemungutan PPnBM oleh Pemungut PPN', value: sptItem.viB },
		{ code: 'C.', description: 'PPnBM kurang atau (lebih) bayar (VI.A - VI.B)', value: sptItem.viC },
		{ code: 'D.', description: 'PPnBM kurang atau (lebih) pada SPT yang dibetulkan sebelumnya', value: sptItem.viD },
		{ code: 'E.', description: 'PPnBM kurang atau (lebih) bayar karena pembetulan SPT (VI.C - VI.D)', value: sptItem.viE }
	]);
</script>

<div class="amount-table">
	<DataTableViewport
		label="Pajak Penjualan atas Barang Mewah"
		minWidth="780px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Kode</th>
				<th>Uraian</th>
				<th class="number">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody items={rows} getKey={(row) => row.code} emptyColspan={3}>
			{#snippet row(item)}
				<td><strong>{item.code}</strong></td>
				<td>{item.description}</td>
				<td><FormField label={`PPnBM ${item.code}`} value={String(item.value)} disabled /></td>
			{/snippet}
		</DataTableBody>
		<tbody>
			<tr>
				<td><strong>F.</strong></td>
				<td colspan="2">
					<CheckboxField
						label="Diminta pengembalian pajak yang tidak seharusnya terutang"
						checked={sptItem.viF ?? false}
						id="VI-F"
						disabled
					/>
				</td>
			</tr>
		</tbody>
		</table>
	</DataTableViewport>
</div>

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

	.amount-table :global(.table-viewport td input:not([type='checkbox'])) {
		min-width: 9rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

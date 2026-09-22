<script lang="ts">
	import { DataTableBody, DataTableViewport, FormField } from '$lib/re-ui-components';

	let {
		sptItem
	}: {
		sptItem: {
			viiADpp: number;
			viiADppNilaiLain: number;
			viiAPpn: number;
			viiAPpnbm: number;
			viiBDpp: number;
			viiBDppNilaiLain: number;
			viiBPpn: number;
			viiBPpnbm: number;
			viiCDpp: number;
			viiCDppNilaiLain: number;
			viiCPpn: number;
			viiCPpnbm: number;
		};
	} = $props();

	const rows = $derived([
		{ code: 'A.', description: 'Jumlah PPN dan PPnBM yang dipungut', values: [sptItem.viiADpp, sptItem.viiADppNilaiLain, sptItem.viiAPpn, sptItem.viiAPpnbm] },
		{ code: 'B.', description: 'PPN dan PPnBM kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya', values: [sptItem.viiBDpp, sptItem.viiBDppNilaiLain, sptItem.viiBPpn, sptItem.viiBPpnbm] },
		{ code: 'C.', description: 'PPN dan PPnBM kurang atau (lebih) byar karena pembetulan SPT (VII.A - VII.B)', values: [sptItem.viiCDpp, sptItem.viiCDppNilaiLain, sptItem.viiCPpn, sptItem.viiCPpnbm] }
	]);
	const valueLabels = ['Harga jual/penggantian/DPP', 'DPP nilai lain/DPP', 'PPN', 'PPnBM'];
</script>

<div class="amount-table">
	<DataTableViewport
		label="Pemungutan PPN atau PPN dan PPnBM oleh Pemungut PPN"
		minWidth="1120px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Kode</th>
				<th>Uraian</th>
				<th class="number">Harga Jual/Penggantian/DPP (Rupiah)</th>
				<th class="number">DPP Nilai Lain/DPP (Rupiah)</th>
				<th class="number">PPN (Rupiah)</th>
				<th class="number">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody items={rows} getKey={(row) => row.code} emptyColspan={6} motion={false}>
			{#snippet row(item)}
				<td><strong>{item.code}</strong></td>
				<td>{item.description}</td>
				{#each item.values as value, index}
					<td><FormField label={`${valueLabels[index]} ${item.code}`} value={String(value)} disabled /></td>
				{/each}
			{/snippet}
		</DataTableBody>
		<tbody>
			<tr class="notice-row">
				<td></td>
				<td colspan="5">Setiap kelebihan pemungutan dari Bagian ini akan menjadi pengurang pada Bagian III.D untuk PPN dan VI.B untuk PPnBM</td>
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

	.amount-table :global(.table-viewport td input) {
		min-width: 8.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.amount-table :global(.table-viewport .notice-row td) {
		border-top: 2px solid var(--ui-yellow-deep);
		background: var(--ui-yellow-soft);
		color: var(--ui-ink);
		font-weight: 700;
	}
</style>

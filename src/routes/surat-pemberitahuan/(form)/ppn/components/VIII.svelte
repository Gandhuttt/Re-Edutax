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
			viiiADpp: number;
			viiiADppNilaiLain: number;
			viiiAPpn: number;
			viiiAPpnbm: number;
			viiiBDpp: number;
			viiiBDppNilaiLain: number;
			viiiBPpn: number;
			viiiBPpnbm: number;
			viiiCDpp: number;
			viiiCDppNilaiLain: number;
			viiiCPpn: number;
			viiiCPpnbm: number;
			viiiD: boolean | null;
		};
	} = $props();

	const rows = $derived([
		{ code: 'A.', description: 'Jumlah PPN dan PPnBM yang dipungut', values: [sptItem.viiiADpp, sptItem.viiiADppNilaiLain, sptItem.viiiAPpn, sptItem.viiiAPpnbm] },
		{ code: 'B.', description: 'PPN dan PPnBM kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya', values: [sptItem.viiiBDpp, sptItem.viiiBDppNilaiLain, sptItem.viiiBPpn, sptItem.viiiBPpnbm] },
		{ code: 'C.', description: 'PPN dan PPnBM kurang atau (lebih) byar karena pembetulan SPT (VII.A - VII.B)', values: [sptItem.viiiCDpp, sptItem.viiiCDppNilaiLain, sptItem.viiiCPpn, sptItem.viiiCPpnbm] }
	]);
	const valueLabels = ['Harga jual/penggantian/DPP', 'DPP nilai lain/DPP', 'PPN', 'PPnBM'];
</script>

<div class="amount-table">
	<DataTableViewport
		label="Pemungutan PPN atau PPN dan PPnBM oleh pihak lain"
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
		<DataTableBody items={rows} getKey={(row) => row.code} emptyColspan={6}>
			{#snippet row(item)}
				<td><strong>{item.code}</strong></td>
				<td>{item.description}</td>
				{#each item.values as value, index}
					<td><FormField label={`${valueLabels[index]} ${item.code}`} value={String(value)} disabled /></td>
				{/each}
			{/snippet}
		</DataTableBody>
		<tbody>
			<tr>
				<td><strong>D.</strong></td>
				<td colspan="5">
					<CheckboxField
						label="Diminta pengembalian pajak yang tidak seharusnya terutang"
						checked={sptItem.viiiD ?? false}
						id="VIII-D"
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
		min-width: 8.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

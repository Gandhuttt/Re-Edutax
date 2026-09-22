<script lang="ts">
	import { DataTableViewport, FormField } from '$lib/re-ui-components';

	let { sptItem }: { sptItem: { v: number } } = $props();
</script>

<div class="amount-table">
	<DataTableViewport
		label="Pembayaran kembali Pajak Masukan"
		minWidth="520px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Uraian</th>
				<th class="number">PPN (Rupiah)</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><strong>PPN yang wajib dibayar kembali</strong></td>
				<td><FormField label="PPN" value={String(sptItem.v)} disabled /></td>
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
		min-width: 9rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

<script lang="ts">
	import { DataTableViewport, FormField } from '$lib/re-ui-components';
	import { untrack } from 'svelte';

	const { sptItem }: { sptItem: { ivDpp: number } } = $props();

	let sptItemDpp: number | string = $state(untrack(() => sptItem.ivDpp));
	let ppnTerutang = $derived(Math.round((Number(sptItemDpp) * 22) / 1000));
</script>

<input type="hidden" value={sptItemDpp} name="IV_i" />
<input type="hidden" value={ppnTerutang} name="IV_ii" />

<div class="amount-table">
	<DataTableViewport
		label="PPN terutang atas kegiatan membangun sendiri"
		minWidth="680px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Uraian</th>
				<th class="number">DPP (Rupiah)</th>
				<th class="number">PPN (Rupiah)</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><strong>PPN terutang</strong></td>
				<td>
					<FormField
						label="DPP"
						bind:value={() => String(sptItemDpp), (value) => (sptItemDpp = value)}
						inputmode="numeric"
					/>
				</td>
				<td><FormField label="PPN terutang" value={String(ppnTerutang)} disabled /></td>
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

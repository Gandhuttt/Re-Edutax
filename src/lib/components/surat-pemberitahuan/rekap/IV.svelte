<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';
	import { untrack } from 'svelte';

	const { sptItem }: { sptItem: { ivDpp: number } } = $props();

	let sptItemDpp = $state(untrack(() => sptItem.ivDpp));
	let ppnTerutang = $derived(Math.round((Number(sptItemDpp) * 22) / 1000));
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th class="inputHead">DPP (Rupiah)</th>
			<th class="inputHead">PPN (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td
				>PPN terutang
				<input type={'hidden'} bind:value={sptItemDpp} name="IV_i" />
				<input type={'hidden'} bind:value={ppnTerutang} name="IV_ii" />
			</td>
			<td><Input type="text" bind:value={sptItemDpp} /></td>
			<td><Input type="text" bind:value={ppnTerutang} disabled/></td>
		</tr>
	{/snippet}
</Table>

<style>
	th,
	td {
		font-size: 0.9rem;
		padding: 0.5rem;
	}
	.inputHead {
		width: 10rem;
		text-align: center;
		vertical-align: middle;
	}
</style>

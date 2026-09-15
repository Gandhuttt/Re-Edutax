<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type DataTableBodyProps<Item> = {
		items: readonly Item[];
		getKey: (item: Item, index: number) => unknown;
		row: Snippet<[item: Item, index: number]>;
		empty?: Snippet;
		emptyText?: string;
		emptyColspan?: number;
		motion?: boolean;
	} & Omit<HTMLAttributes<HTMLTableSectionElement>, "children">;
</script>

<script lang="ts" generics="Item">
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";

	let {
		items,
		getKey,
		row,
		empty,
		emptyText = "Tidak ada data.",
		emptyColspan = 1,
		motion = true,
		...props
	}: DataTableBodyProps<Item> = $props();
</script>

<tbody {...props}>
	{#each items as item, index (getKey(item, index))}
		<tr
			animate:flip={{ duration: motion ? 220 : 0 }}
			in:fly={{ y: motion ? -9 : 0, duration: motion ? 230 : 0 }}
			out:fly={{ x: motion ? 12 : 0, duration: motion ? 180 : 0 }}
		>
			{@render row(item, index)}
		</tr>
	{:else}
		<tr>
			<td class="empty" colspan={emptyColspan}>
				{#if empty}{@render empty()}{:else}{emptyText}{/if}
			</td>
		</tr>
	{/each}
</tbody>

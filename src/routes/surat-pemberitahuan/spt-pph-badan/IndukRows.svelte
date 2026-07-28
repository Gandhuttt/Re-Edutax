<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="tw:p-5">
	<Table class="tw:min-w-full old-spt-table">
		{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
		{#snippet body()}{@render children()}{/snippet}
	</Table>
</div>

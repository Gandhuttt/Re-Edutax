<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';

	let {
		head,
		body,
		...restProps
	}: { head: Snippet; body: Snippet } & HTMLTableAttributes = $props();
</script>

<table {...restProps}>
	<thead>{@render head()}</thead>
	<tbody>{@render body()}</tbody>
</table>

<style>
	table {
		table-layout: fixed;
		border-collapse: collapse;
	}
</style>

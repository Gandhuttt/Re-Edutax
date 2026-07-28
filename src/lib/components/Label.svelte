<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	let { children, ...restProps }: { children: Snippet } & HTMLLabelAttributes = $props();
	const id = $props.id();

	setContext('id', `${id}-input`);
</script>

<label for="{id}-input" {...restProps}>
	{@render children()}
</label>

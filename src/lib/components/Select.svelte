<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		children,
		value = $bindable(),
		...restProps
	}: { children: Snippet } & HTMLSelectAttributes = $props();
</script>

<select bind:value {...restProps}>
	{@render children()}
</select>

<style>
	select {
		height: 2.5rem;
		width: 100%;
		border-color: var(--color-input-secondary);
		border-radius: 4px;
		transition:
			background 100ms linear,
			border-color 100ms linear;
	}

	select:hover {
		border-color: hsl(from var(--color-input-secondary) h s calc(l - 20));
	}

	select:disabled {
		background: hsl(from var(--color-input-primary) h s calc(l - 10));
	}

	select:disabled:hover {
		background: hsl(from var(--color-input-primary) h s calc(l - 20));
	}

	select:focus {
		border-color: hsl(from var(--color-input-secondary) h s calc(l - 50));
	}
</style>

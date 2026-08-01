<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		children,
		color = '#FFD230',
		...restProps
	}: { children: Snippet; color?: string } & HTMLButtonAttributes = $props();
</script>

<button style:--color={color} {...restProps}>
	{@render children()}
</button>

<style>
	button {
		--background-brighter: hsl(from var(--color) h s calc(l + 20));
		--background-darker: hsl(from var(--color) h s calc(l - 5));
		--background-darkest: hsl(from var(--color) h s calc(l - 10));
		padding: 0.5rem;
		min-width: 5rem;
		background: var(--color);
		border-radius: 5px;
		border: 0;
		transition: background 50ms linear;
		&:hover {
			background: var(--background-darker);
		}
		&:active {
			background: var(--background-darkest);
		}
		&:disabled {
			background: var(--background-brighter);
		}
	}
</style>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		children,
		active = false,
		...attributes
	}: { children: Snippet; active?: boolean } & HTMLAnchorAttributes = $props();
</script>

<a class:active aria-current={active ? "page" : undefined} {...attributes}>
	{@render children()}
</a>

<style>
	a {
		display: flex;
		align-items: center;
		padding: 0 16px;
		border-bottom: 3px solid transparent;
		color: #dce3ea;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
		transition:
			background 140ms ease,
			color 140ms ease;
	}
	a:hover,
	a.active {
		border-color: var(--ui-yellow);
		background: rgba(255, 255, 255, 0.055);
		color: white;
	}
	a:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: -4px;
	}
	@media (prefers-reduced-motion: reduce) {
		a {
			transition: none;
		}
	}
</style>

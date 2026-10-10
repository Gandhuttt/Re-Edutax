<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type EyebrowProps = {
		children: Snippet;
	} & HTMLAttributes<HTMLParagraphElement>;
</script>

<script lang="ts">
	let { children, class: className, ...props }: EyebrowProps = $props();
</script>

<p {...props} class="eyebrow {className ?? ""}">
	<span class="rule" aria-hidden="true"></span>
	<span>{@render children()}</span>
</p>

<style>
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0;
		color: var(--ui-surface-accent);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.14em;
		line-height: 1.35;
		text-transform: uppercase;
	}
	.rule {
		flex: 0 0 auto;
		width: 28px;
		height: 2px;
		background: var(--ui-surface-rule, var(--ui-yellow));
	}
</style>

<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type ConditionalFieldProps = {
		label?: string;
		children: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	let {
		label = "Field kondisional",
		children,
		class: className,
		...props
	}: ConditionalFieldProps = $props();
</script>

<div {...props} class="conditional-field {className ?? ""}">
	{#if label}<span>{label}</span>{/if}
	{@render children()}
</div>

<style>
	.conditional-field {
		padding: 13px;
		border-left: 3px solid var(--ui-yellow);
		background: #f1eee5;
	}

	span {
		display: block;
		margin-bottom: 8px;
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
</style>

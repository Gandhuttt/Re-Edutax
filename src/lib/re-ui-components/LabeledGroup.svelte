<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		label,
		children,
		direction = "vertical",
		gap = "6px",
	}: {
		label: string;
		children: Snippet;
		direction?: "vertical" | "horizontal";
		gap?: string;
	} = $props();

	const id = $props.id();
</script>

<div
	class="group"
	class:horizontal={direction === "horizontal"}
	style:--group-gap={gap}
	role="group"
	aria-labelledby={`${id}-label`}
>
	<span class="label" id={`${id}-label`}>{label}</span>
	<div class="items">{@render children()}</div>
</div>

<style>
	.group {
		min-width: 0;
		display: grid;
		align-content: start;
		gap: 6px;
	}
	.label {
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
	.items {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: var(--group-gap);
	}
	.horizontal .items {
		flex-flow: row wrap;
		align-items: center;
	}
</style>

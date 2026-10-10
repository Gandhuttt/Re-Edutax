<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type SplitLayoutProps = {
		start: Snippet;
		end: Snippet;
		/** `grid-template-columns` for wide containers; collapses to one column below 820px. */
		columns?: string;
		gap?: string;
		align?: "start" | "center" | "end" | "stretch";
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	let {
		start,
		end,
		columns = "minmax(0, 1fr) minmax(0, 1fr)",
		gap = "clamp(36px, 6vw, 88px)",
		align = "center",
		class: className,
		...props
	}: SplitLayoutProps = $props();
</script>

<div {...props} class="split-layout {className ?? ""}">
	<div
		class="split"
		style:--split-columns={columns}
		style:--split-gap={gap}
		style:--split-align={align}
	>
		<div class="pane">{@render start()}</div>
		<div class="pane">{@render end()}</div>
	</div>
</div>

<style>
	.split-layout {
		min-width: 0;
		container-type: inline-size;
	}
	.split {
		display: grid;
		grid-template-columns: var(--split-columns);
		align-items: var(--split-align);
		gap: var(--split-gap);
	}
	.pane {
		min-width: 0;
	}
	@container (max-width: 820px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		children: Snippet;
		columns?: 1 | 2 | 3 | 4;
		gap?: string;
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children">;

	let {
		children,
		columns = 2,
		gap = "18px 22px",
		class: className = "",
		...attributes
	}: Props = $props();
</script>

<div class={`responsive-grid-container ${className}`} {...attributes}>
	<div
		class="responsive-grid"
		style:--responsive-grid-columns={columns}
		style:--responsive-grid-gap={gap}
	>
		{@render children()}
	</div>
</div>

<style>
	.responsive-grid-container {
		min-width: 0;
		container-type: inline-size;
	}
	.responsive-grid {
		min-width: 0;
		display: grid;
		grid-template-columns: repeat(
			var(--responsive-grid-columns),
			minmax(0, 1fr)
		);
		gap: var(--responsive-grid-gap);
	}
	@container (max-width: 700px) {
		.responsive-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

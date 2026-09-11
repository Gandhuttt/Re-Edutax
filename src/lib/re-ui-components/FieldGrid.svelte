<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		children,
		columns = 2,
		gap = "18px 22px",
	}: {
		children: Snippet;
		columns?: 1 | 2 | 3 | 4;
		gap?: string;
	} = $props();
</script>

<div
	class="field-grid"
	style:--field-columns={columns}
	style:--field-gap={gap}
>
	{@render children()}
</div>

<style>
	.field-grid {
		display: grid;
		grid-template-columns: repeat(var(--field-columns), minmax(0, 1fr));
		gap: var(--field-gap);
	}
	@media (max-width: 700px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

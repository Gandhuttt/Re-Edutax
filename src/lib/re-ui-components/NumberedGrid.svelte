<script module lang="ts">
	import type { HTMLOlAttributes } from "svelte/elements";

	export type NumberedGridItem = {
		title: string;
		description: string;
	};

	export type NumberedGridProps = {
		items: readonly NumberedGridItem[];
		/** Columns on wide containers; drops to two below 900px and one below 560px. */
		columns?: 2 | 3 | 4;
	} & Omit<HTMLOlAttributes, "children">;
</script>

<script lang="ts">
	let { items, columns = 3, class: className, ...props }: NumberedGridProps = $props();
</script>

<div class="numbered-grid-container">
	<ol {...props} class="numbered-grid {className ?? ""}" style:--numbered-grid-columns={columns}>
		{#each items as item, index}
			<li>
				<span class="number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
				<h3>{item.title}</h3>
				<p>{item.description}</p>
			</li>
		{/each}
	</ol>
</div>

<style>
	.numbered-grid-container {
		min-width: 0;
		container-type: inline-size;
	}
	.numbered-grid {
		display: grid;
		grid-template-columns: repeat(var(--numbered-grid-columns), minmax(0, 1fr));
		gap: 1px;
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 1px solid var(--ui-surface-line);
		border-radius: 2px;
		background: var(--ui-surface-line);
		list-style: none;
	}
	li {
		display: flex;
		min-height: 210px;
		flex-direction: column;
		padding: 28px;
		background: var(--ui-surface-card);
		transition: background-color 180ms ease;
	}
	li:hover {
		background: white;
	}
	.number {
		color: var(--ui-surface-accent);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	h3 {
		margin: 0 0 10px;
		padding-top: 40px;
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-size: 24px;
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	p {
		margin: 0;
		color: var(--ui-surface-text);
		font-size: 15px;
		line-height: 1.6;
		text-wrap: pretty;
	}
	@container (max-width: 900px) {
		.numbered-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@container (max-width: 560px) {
		.numbered-grid {
			grid-template-columns: minmax(0, 1fr);
		}
		li {
			min-height: 0;
			padding: 22px;
		}
		h3 {
			padding-top: 18px;
			font-size: 22px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		li {
			transition: none;
		}
	}
</style>

<script module lang="ts">
	export type KeyValueItem = {
		label: string;
		value: string | number;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		items: KeyValueItem[];
		columns?: 1 | 2 | 3 | 4;
		compact?: boolean;
		surface?: "muted" | "paper";
		class?: string;
	} & Omit<HTMLAttributes<HTMLDListElement>, "class" | "children">;

	let {
		items,
		columns = 3,
		compact = false,
		surface = "muted",
		class: className = "",
		...attributes
	}: Props = $props();
</script>

<dl
	class={`key-value-grid ${className}`}
	class:compact
	class:paper={surface === "paper"}
	style:--key-value-columns={columns}
	{...attributes}
>
	{#each items as item}
		<div class="item">
			<dt>{item.label}</dt>
			<dd>{item.value}</dd>
		</div>
	{/each}
</dl>

<style>
	.key-value-grid {
		display: grid;
		grid-template-columns: repeat(
			var(--key-value-columns),
			minmax(0, 1fr)
		);
		gap: 1px;
		margin: 0;
		border: 1px solid var(--ui-line);
		background: var(--ui-line);
	}
	.item {
		min-width: 0;
		padding: 13px 20px;
		background: #efede5;
	}
	.paper .item {
		background: #fffefa;
	}
	dt,
	dd {
		margin: 0;
	}
	dt {
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.07em;
		line-height: 1.35;
		text-transform: uppercase;
	}
	dd {
		margin-top: 3px;
		overflow-wrap: anywhere;
		font-size: 12px;
		font-weight: 700;
	}
	.compact .item {
		padding: 10px 12px;
	}
	.compact dt {
		font-size: 9px;
	}
	.compact dd {
		font-size: 11px;
	}
	@media (max-width: 700px) {
		.key-value-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

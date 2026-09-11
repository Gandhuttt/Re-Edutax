<script module lang="ts">
	export type SummaryStripItem = {
		label: string;
		value: string | number;
	};

	export type SummaryStripProps = {
		items: readonly SummaryStripItem[];
		columns?: number;
	};
</script>

<script lang="ts">
	let { items, columns = 3 }: SummaryStripProps = $props();
	const normalizedColumns = $derived(
		Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 3,
	);
</script>

<dl class="summary-strip" style={`--summary-columns: ${normalizedColumns}`}>
	{#each items as item}
		<div>
			<dt>{item.label}</dt>
			<dd>{item.value}</dd>
		</div>
	{/each}
</dl>

<style>
	.summary-strip {
		display: grid;
		grid-template-columns: repeat(
			var(--summary-columns),
			minmax(0, 1fr)
		);
		gap: 1px;
		margin: 0;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-line);
	}

	.summary-strip div {
		min-width: 0;
		padding: 13px 20px;
		background: #efede5;
	}

	dt {
		color: var(--ui-muted);
		font-size: 10px;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	dd {
		margin: 3px 0 0;
		font-size: 12px;
		font-weight: 700;
	}

	@media (max-width: 900px) {
		.summary-strip {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>

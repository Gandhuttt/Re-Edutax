<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type StatementStripProps = {
		statement: string;
		/** Short numbered keywords shown beside the statement. */
		items?: string[];
		itemsLabel?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	let {
		statement,
		items = [],
		itemsLabel,
		class: className,
		...props
	}: StatementStripProps = $props();
</script>

<div {...props} class="statement-strip {className ?? ""}">
	<p>{statement}</p>
	{#if items.length}
		<ol aria-label={itemsLabel}>
			{#each items as item, index}
				<li><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item}</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.statement-strip {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px 40px;
		padding-block: 24px;
		border-block: 1px solid var(--ui-surface-line);
	}
	p {
		margin: 0;
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-size: 22px;
		line-height: 1.3;
	}
	ol {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 28px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: 8px;
		color: var(--ui-surface-heading);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	span {
		color: var(--ui-surface-accent);
	}
	@media (max-width: 560px) {
		p {
			font-size: 19px;
		}
		ol {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>

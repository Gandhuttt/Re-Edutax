<script module lang="ts">
	import type { HTMLOlAttributes } from "svelte/elements";

	export type StepListItem = {
		title: string;
		description: string;
	};

	export type StepListProps = {
		items: readonly StepListItem[];
	} & Omit<HTMLOlAttributes, "children">;
</script>

<script lang="ts">
	let { items, class: className, ...props }: StepListProps = $props();
</script>

<ol {...props} class="step-list {className ?? ""}">
	{#each items as item, index}
		<li>
			<span class="number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
			<div>
				<h3>{item.title}</h3>
				<p>{item.description}</p>
			</div>
		</li>
	{/each}
</ol>

<style>
	.step-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 16px;
		padding: 22px 0;
		border-top: 1px solid var(--ui-surface-line);
	}
	li:last-child {
		border-bottom: 1px solid var(--ui-surface-line);
	}
	.number {
		padding-top: 3px;
		color: var(--ui-surface-accent);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	h3 {
		margin: 0 0 6px;
		color: var(--ui-surface-heading);
		font-size: 18px;
		font-weight: 700;
		line-height: 1.3;
	}
	p {
		max-width: 480px;
		margin: 0;
		color: var(--ui-surface-text);
		font-size: 15px;
		line-height: 1.6;
	}
</style>

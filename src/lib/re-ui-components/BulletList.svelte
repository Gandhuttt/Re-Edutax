<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type BulletListItem = string | { title: string; description?: string };

	export type BulletListProps = {
		items: readonly BulletListItem[];
		columns?: 1 | 2;
	} & Omit<HTMLAttributes<HTMLUListElement>, "children">;
</script>

<script lang="ts">
	let { items, columns = 1, class: className, ...props }: BulletListProps = $props();
</script>

<ul {...props} class="bullet-list {className ?? ""}" class:two-columns={columns === 2}>
	{#each items as item}
		<li>
			{#if typeof item === "string"}
				{item}
			{:else}
				<strong>{item.title}</strong>
				{#if item.description}<span>{item.description}</span>{/if}
			{/if}
		</li>
	{/each}
</ul>

<style>
	.bullet-list {
		display: grid;
		gap: 12px 28px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.two-columns {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	li {
		position: relative;
		padding-left: 20px;
		color: var(--ui-surface-heading);
		font-size: 15px;
		line-height: 1.5;
	}
	li::before {
		position: absolute;
		top: 0.6em;
		left: 0;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--ui-yellow);
		content: "";
	}
	strong,
	span {
		display: block;
	}
	strong {
		font-weight: 700;
	}
	span {
		margin-top: 2px;
		color: var(--ui-surface-text);
		font-size: 14px;
	}
	@media (max-width: 560px) {
		.two-columns {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>

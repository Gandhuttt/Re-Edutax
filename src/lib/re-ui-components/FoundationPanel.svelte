<script module lang="ts">
	export type FoundationSwatch = {
		label: string;
		color: string;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		eyebrow?: string;
		title: string;
		description?: string;
		swatches?: FoundationSwatch[];
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, "class" | "children" | "title">;

	let {
		eyebrow = "",
		title,
		description = "",
		swatches = [],
		class: className = "",
		...attributes
	}: Props = $props();
</script>

<section class={`foundation-panel ${className}`} {...attributes}>
	<div class="heading">
		{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
		<h2>{title}</h2>
	</div>
	{#if description}<p>{description}</p>{/if}
	{#if swatches.length > 0}
		<ul class="swatches" aria-label="Color palette">
			{#each swatches as swatch}
				<li style:--swatch={swatch.color}>
					<span class="color" aria-hidden="true"></span>
					{swatch.label}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.foundation-panel {
		min-width: 0;
		padding: 24px;
		display: grid;
		grid-template-columns: minmax(180px, 230px) minmax(0, 1fr);
		gap: 28px;
		border-top: 4px solid var(--ui-navy);
		background: #ddd9cf;
	}
	.eyebrow {
		display: block;
		margin-bottom: 7px;
		color: #87640c;
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	h2 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 22px;
	}
	p {
		max-width: 700px;
		margin: 0;
		color: #4f5a64;
	}
	.swatches {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.swatches li {
		min-height: 42px;
		padding: 10px 14px 10px 10px;
		display: flex;
		align-items: center;
		gap: 10px;
		border: 1px solid var(--ui-line);
		background: var(--ui-paper);
		font-size: 10px;
		font-weight: 700;
	}
	.color {
		width: 20px;
		height: 20px;
		flex: 0 0 auto;
		border: 1px solid rgb(0 0 0 / 15%);
		background: var(--swatch);
	}
	@media (max-width: 700px) {
		.foundation-panel {
			grid-template-columns: 1fr;
		}
		.swatches {
			grid-column: 1;
		}
	}
	@media (max-width: 480px) {
		.swatches {
			flex-direction: column;
		}
	}
</style>

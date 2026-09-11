<script module lang="ts">
	import type { Snippet } from "svelte";

	export type PanelHeadingProps = {
		number: string;
		title: string;
		trailing?: Snippet;
	};
</script>

<script lang="ts">
	let { number, title, trailing }: PanelHeadingProps = $props();
</script>

<header class="panel-heading">
	<div class="heading">
		<span class="section-number">{number}</span>
		<h2>{title}</h2>
	</div>
	{#if trailing}<div class="trailing">{@render trailing()}</div>{/if}
</header>

<style>
	.panel-heading {
		min-height: 68px;
		padding: 12px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		border-bottom: 1px solid var(--ui-line);
	}

	.heading {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 12px;
	}

	.section-number {
		flex: 0 0 auto;
		color: var(--ui-yellow-deep);
		font: 800 12px var(--ui-font-mono);
	}

	h2 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 22px;
	}

	.trailing {
		flex: 0 0 auto;
	}

	@media (max-width: 600px) {
		.panel-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

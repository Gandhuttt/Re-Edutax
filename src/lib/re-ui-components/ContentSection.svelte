<script module lang="ts">
	import type { Snippet } from "svelte";

	export type ContentSectionProps = {
		title: string;
		description?: string;
		children: Snippet;
	};
</script>

<script lang="ts">
	let { title, description, children }: ContentSectionProps = $props();
</script>

<section class="content-section">
	<header>
		<h3>{title}</h3>
		{#if description}<p>{description}</p>{/if}
	</header>
	<div class="content">{@render children()}</div>
</section>

<style>
	.content-section {
		min-width: 0;
		padding: 25px 24px 28px;
	}

	header {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 20px;
	}

	h3 {
		margin: 0;
		color: var(--ui-navy);
		font-size: 15px;
	}

	p {
		max-width: 440px;
		margin: 0;
		color: var(--ui-muted);
		font-size: 11px;
	}

	.content {
		min-width: 0;
	}

	@media (max-width: 650px) {
		header {
			align-items: flex-start;
			flex-direction: column;
			gap: 6px;
		}
	}
</style>

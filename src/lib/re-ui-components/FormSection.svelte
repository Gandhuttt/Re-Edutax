<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		number = "",
		title,
		description = "",
		children,
		actions,
		padded = true,
		bordered = false,
	}: {
		number?: string;
		title: string;
		description?: string;
		children: Snippet;
		actions?: Snippet;
		padded?: boolean;
		bordered?: boolean;
	} = $props();
</script>

<section class="form-section" class:padded class:bordered>
	<header>
		<div class="heading">
			{#if number}<span class="number">{number}</span>{/if}
			<div>
				<h3>{title}</h3>
				{#if description}<p>{description}</p>{/if}
			</div>
		</div>
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</header>
	<div class="content">{@render children()}</div>
</section>

<style>
	.form-section {
		min-width: 0;
		background: var(--ui-paper);
	}
	.form-section.bordered {
		border: 1px solid var(--ui-line-strong);
	}
	header {
		min-height: 52px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}
	.heading {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.number {
		padding-top: 2px;
		color: var(--ui-yellow-deep);
		font: 800 10px var(--ui-font-mono);
	}
	h3 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 16px;
	}
	p {
		margin: 2px 0 0;
		color: var(--ui-muted);
		font-size: 10px;
	}
	.content {
		min-width: 0;
	}
	.padded .content {
		padding: 20px;
	}
	.actions {
		flex: 0 0 auto;
	}
	@media (max-width: 650px) {
		header {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

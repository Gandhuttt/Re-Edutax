<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, value, description = '', status }: {
		label: string;
		value: string;
		description?: string;
		status?: Snippet;
	} = $props();
</script>

<section class="amount-summary" aria-label={label}>
	<header><h3>{label}</h3>{#if status}{@render status()}{/if}</header>
	<p class="value">{value}</p>
	{#if description}<p class="description">{description}</p>{/if}
</section>

<style>
	.amount-summary {
		min-width: 0;
		padding: 24px;
		border: 1px solid var(--ui-line);
		border-top: 3px solid var(--ui-navy);
		background: var(--ui-surface-card);
	}
	header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
	h3 { margin: 0; color: var(--ui-muted); font: 700 11px var(--ui-font-body); letter-spacing: .08em; text-transform: uppercase; }
	.value { margin: 16px 0 10px; color: var(--ui-navy); font-size: clamp(24px, 3vw, 34px); font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
	.description { margin: 0; color: var(--ui-muted); font-size: 12px; line-height: 1.6; }
	@media (max-width: 650px) { .amount-summary { padding: 16px; } }
</style>

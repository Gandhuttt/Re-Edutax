<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		brand,
		subtitle = "",
		mark = "",
		homeHref = "/",
		homeLabel = brand,
		navigation,
		navigationLabel = "Navigasi utama",
		account,
		contentWidth = "1320px",
	}: {
		brand: string;
		subtitle?: string;
		mark?: string;
		homeHref?: string;
		homeLabel?: string;
		navigation?: Snippet;
		navigationLabel?: string;
		account?: Snippet;
		contentWidth?: string;
	} = $props();
</script>

<header class="app-header" style:--header-content-width={contentWidth}>
	<a class="identity" href={homeHref} aria-label={homeLabel}>
		{#if mark}<span class="mark" aria-hidden="true">{mark}</span>{/if}
		<span class="brand-copy">
			<strong>{brand}</strong>
			{#if subtitle}<small>{subtitle}</small>{/if}
		</span>
	</a>
	{#if navigation}
		<nav class="navigation" aria-label={navigationLabel}>
			{@render navigation()}
		</nav>
	{/if}
	{#if account}<div class="account">{@render account()}</div>{/if}
</header>

<style>
	.app-header {
		min-height: 72px;
		padding: 0 max(24px, calc((100vw - var(--header-content-width)) / 2));
		display: flex;
		align-items: center;
		gap: 40px;
		background: var(--ui-navy);
		color: white;
		border-bottom: 4px solid var(--ui-yellow);
		font: inherit;
	}
	.identity {
		display: flex;
		align-items: center;
		gap: 11px;
		min-width: 255px;
		color: white;
		text-decoration: none;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border: 2px solid var(--ui-yellow);
		color: var(--ui-yellow);
		font-size: 12px;
		font-weight: 900;
		letter-spacing: 0.08em;
	}
	.brand-copy strong,
	.brand-copy small {
		display: block;
	}
	.brand-copy strong {
		font-family: var(--ui-font-display);
		font-size: 20px;
		letter-spacing: 0.01em;
	}
	.brand-copy small {
		margin-top: 1px;
		color: #ccd6e0;
		font-size: 10px;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.navigation {
		align-self: stretch;
		display: flex;
		gap: 4px;
	}
	.account {
		margin-left: auto;
		align-self: stretch;
		display: flex;
		align-items: center;
	}
	@media (max-width: 900px) {
		.app-header {
			gap: 12px;
		}
		.navigation {
			display: none;
		}
	}
	@media (max-width: 600px) {
		.app-header {
			padding-right: 12px;
			padding-left: 12px;
		}
		.identity {
			min-width: 0;
		}
		.brand-copy small {
			display: none;
		}
	}
</style>

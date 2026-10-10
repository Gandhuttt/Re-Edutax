<script lang="ts">
	import type { Snippet } from "svelte";
	import BrandIdentity from "./BrandIdentity.svelte";

	let {
		brand,
		subtitle = "",
		mark = "",
		homeHref = "/dashboard",
		homeLabel = brand,
		navigation,
		navigationLabel = "Navigasi utama",
		account,
		contentWidth = "1320px",
		sticky = false,
		skipLinkTarget = "",
		skipLinkLabel = "Lewati ke konten utama",
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
		/** Keep the header pinned to the top of the viewport while scrolling. */
		sticky?: boolean;
		/** Fragment such as `#main-content`; renders a keyboard skip link when set. */
		skipLinkTarget?: string;
		skipLinkLabel?: string;
	} = $props();
</script>

{#if skipLinkTarget}
	<a class="skip-link" href={skipLinkTarget}>{skipLinkLabel}</a>
{/if}
<header class="app-header" class:sticky style:--header-content-width={contentWidth}>
	<div class="identity">
		<BrandIdentity {brand} {subtitle} {mark} href={homeHref} label={homeLabel} />
	</div>
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
	.sticky {
		position: sticky;
		z-index: 40;
		top: 0;
	}
	.identity {
		display: flex;
		min-width: 255px;
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
	.skip-link {
		position: fixed;
		z-index: 100;
		top: 12px;
		left: 12px;
		padding: 10px 16px;
		transform: translateY(-160%);
		border: 2px solid var(--ui-yellow);
		background: white;
		color: var(--ui-navy);
		font-size: 14px;
		font-weight: 800;
		text-decoration: none;
	}
	.skip-link:focus {
		transform: none;
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
	}
</style>

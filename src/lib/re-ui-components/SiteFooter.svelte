<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type SiteFooterLink = { label: string; href: string };

	export type SiteFooterProps = {
		brand: string;
		subtitle?: string;
		mark?: string;
		/** Logo for the navy footer; replaces the text mark. */
		logoSrc?: string;
		homeHref?: string;
		homeLabel?: string;
		tagline?: string;
		links?: SiteFooterLink[];
		linksLabel?: string;
		/** Small print such as the copyright holder. */
		legal?: string;
		width?: string;
	} & Omit<HTMLAttributes<HTMLElement>, "children">;
</script>

<script lang="ts">
	import BrandIdentity from "./BrandIdentity.svelte";

	let {
		brand,
		subtitle = "",
		mark = "",
		logoSrc = "",
		homeHref = "/",
		homeLabel = brand,
		tagline = "",
		links = [],
		linksLabel = "Navigasi footer",
		legal = "",
		width = "1240px",
		class: className,
		...props
	}: SiteFooterProps = $props();
</script>

<footer
	{...props}
	class="site-footer ui-surface-inverse {className ?? ""}"
	style:--site-footer-width={width}
>
	<div class="inner">
		<div class="top">
			<BrandIdentity {brand} {subtitle} {mark} {logoSrc} href={homeHref} label={homeLabel} />
			{#if tagline}<p class="tagline">{tagline}</p>{/if}
			{#if links.length}
				<nav aria-label={linksLabel}>
					{#each links as link}<a href={link.href}>{link.label}</a>{/each}
				</nav>
			{/if}
		</div>
		{#if legal}<p class="legal">{legal}</p>{/if}
	</div>
</footer>

<style>
	.site-footer {
		border-top: 4px solid var(--ui-yellow);
		background: var(--ui-navy);
		color: white;
	}
	.inner {
		width: min(var(--site-footer-width), calc(100% - 48px));
		margin-inline: auto;
		padding-block: 40px 28px;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 20px 40px;
	}
	.tagline {
		margin: 0;
		color: var(--ui-surface-text);
		font-family: var(--ui-font-display);
		font-size: 17px;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
	}
	nav a {
		color: white;
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
	}
	nav a:hover {
		color: var(--ui-yellow);
	}
	nav a:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 4px;
	}
	.legal {
		margin: 28px 0 0;
		padding-top: 20px;
		border-top: 1px solid var(--ui-surface-line);
		color: var(--ui-surface-text);
		font-size: 13px;
	}
	@media (max-width: 820px) {
		.tagline {
			order: 3;
			width: 100%;
		}
	}
	@media (max-width: 560px) {
		.inner {
			width: calc(100% - 32px);
		}
		.top {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>

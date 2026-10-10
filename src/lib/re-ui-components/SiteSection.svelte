<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type SiteSectionTone = "plain" | "paper" | "inverse";
	export type SiteSectionSpacing = "none" | "sm" | "md" | "lg";

	export type SiteSectionProps = {
		children: Snippet;
		/** Background spans the viewport; content stays within `width`. */
		tone?: SiteSectionTone;
		spacing?: SiteSectionSpacing;
		width?: string;
	} & Omit<HTMLAttributes<HTMLElement>, "children">;
</script>

<script lang="ts">
	let {
		children,
		tone = "plain",
		spacing = "md",
		width = "1240px",
		class: className,
		...props
	}: SiteSectionProps = $props();
</script>

<section
	{...props}
	class="site-section tone-{tone} spacing-{spacing} {className ?? ""}"
	class:ui-surface-inverse={tone === "inverse"}
	style:--site-section-width={width}
>
	<div class="inner">{@render children()}</div>
</section>

<style>
	:global(html:has(.site-section)) {
		scroll-behavior: smooth;
	}
	.site-section {
		padding-block: var(--site-section-spacing);
		scroll-margin-top: 76px;
	}
	.spacing-none {
		--site-section-spacing: 0;
	}
	.spacing-sm {
		--site-section-spacing: clamp(28px, 4vw, 44px);
	}
	.spacing-md {
		--site-section-spacing: clamp(52px, 7vw, 84px);
	}
	.spacing-lg {
		--site-section-spacing: clamp(64px, 9vw, 112px);
	}
	.tone-paper {
		border-block: 1px solid var(--ui-line);
		background: var(--ui-paper);
	}
	.tone-inverse {
		background: var(--ui-navy-strong);
		color: white;
	}
	.inner {
		width: min(var(--site-section-width), calc(100% - 48px));
		margin-inline: auto;
	}
	@media (max-width: 560px) {
		.inner {
			width: calc(100% - 32px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		:global(html:has(.site-section)) {
			scroll-behavior: auto;
		}
	}
</style>

<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type FeatureImageProps = {
		src: string;
		alt: string;
		/** Intrinsic pixel size; reserves layout space and sets the default aspect ratio. */
		width: number;
		height: number;
		/** Override the frame aspect ratio, e.g. `"16 / 9"`; the image is cropped to fill. */
		ratio?: string;
		/** Scale factor (>1) that crops the edges, e.g. to hide frames baked into the source. */
		zoom?: number;
		caption?: string;
		/** Load eagerly with high fetch priority (above-the-fold images). */
		priority?: boolean;
	} & Omit<HTMLAttributes<HTMLElement>, "children">;
</script>

<script lang="ts">
	let {
		src,
		alt,
		width,
		height,
		ratio,
		zoom = 1,
		caption = "",
		priority = false,
		class: className,
		...props
	}: FeatureImageProps = $props();
</script>

<figure {...props} class="feature-image {className ?? ""}" style:--feature-image-zoom={zoom}>
	<img
		{src}
		{alt}
		{width}
		{height}
		loading={priority ? "eager" : "lazy"}
		fetchpriority={priority ? "high" : "auto"}
		decoding="async"
		style:aspect-ratio={ratio ?? `${width} / ${height}`}
	/>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.feature-image {
		position: relative;
		min-width: 0;
		margin: 0;
		overflow: hidden;
		border-radius: 2px;
		background: var(--ui-navy-strong);
		box-shadow: 0 22px 48px rgba(16, 36, 60, 0.16);
	}
	img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
		transform: scale(var(--feature-image-zoom));
		transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.feature-image:hover img {
		transform: scale(calc(var(--feature-image-zoom) * 1.02));
	}
	figcaption {
		position: absolute;
		bottom: 16px;
		left: 16px;
		max-width: min(340px, calc(100% - 32px));
		padding: 12px 16px;
		border-radius: 2px;
		background: var(--ui-yellow);
		color: var(--ui-navy-strong);
		font-family: var(--ui-font-display);
		font-size: 16px;
		line-height: 1.35;
		box-shadow: 0 10px 24px rgba(16, 36, 60, 0.18);
	}
	@media (max-width: 560px) {
		.feature-image {
			box-shadow: 0 14px 30px rgba(16, 36, 60, 0.14);
		}
		figcaption {
			bottom: 10px;
			left: 10px;
			max-width: calc(100% - 20px);
			padding: 9px 12px;
			font-size: 14px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		img {
			transition: none;
		}
		.feature-image:hover img {
			transform: scale(var(--feature-image-zoom));
		}
	}
</style>

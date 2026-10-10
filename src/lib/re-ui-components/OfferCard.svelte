<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type OfferCardProps = {
		label: string;
		title: string;
		/** Primary date or schedule line. */
		schedule?: string;
		detail?: string;
		price?: string;
		priceNote?: string;
		href: string;
		actionLabel: string;
		/** Navy emphasis surface for the recommended offer. */
		featured?: boolean;
		/** Pulsing indicator before the label, e.g. open registration. */
		live?: boolean;
		/** Extra body content placed above the action. */
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, "title" | "children">;
</script>

<script lang="ts">
	let {
		label,
		title,
		schedule = "",
		detail = "",
		price = "",
		priceNote = "",
		href,
		actionLabel,
		featured = false,
		live = false,
		children,
		class: className,
		...props
	}: OfferCardProps = $props();
</script>

<article
	{...props}
	class="offer-card {className ?? ""}"
	class:featured
	class:ui-surface-inverse={featured}
>
	<div class="body">
		<p class="label">
			{#if live}<span class="live-dot" aria-hidden="true"></span>{/if}
			{label}
		</p>
		<h3>{title}</h3>
		{#if schedule}<p class="schedule">{schedule}</p>{/if}
		{#if detail}<p class="detail">{detail}</p>{/if}
		{#if price}
			<p class="price">
				<strong>{price}</strong>
				{#if priceNote}<span>{priceNote}</span>{/if}
			</p>
		{/if}
		{#if children}<div class="extra">{@render children()}</div>{/if}
	</div>
	<a class="action" {href}>{actionLabel} <span aria-hidden="true">→</span></a>
</article>

<style>
	.offer-card {
		position: relative;
		display: flex;
		height: 100%;
		min-height: 320px;
		flex-direction: column;
		padding: 28px;
		border: 1px solid var(--ui-surface-line);
		border-top: 4px solid var(--ui-navy);
		border-radius: 2px;
		background: var(--ui-surface-card);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}
	.offer-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 18px 38px rgba(16, 36, 60, 0.12);
	}
	.featured {
		border-color: var(--ui-navy);
		border-top-color: var(--ui-yellow);
		background: var(--ui-navy);
		color: white;
		box-shadow: 0 18px 42px rgba(16, 36, 60, 0.2);
	}
	.label {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 28px;
		color: var(--ui-surface-accent);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.live-dot {
		width: 9px;
		height: 9px;
		flex: 0 0 auto;
		border-radius: 50%;
		background: #5fae78;
		box-shadow: 0 0 0 5px rgba(95, 174, 120, 0.22);
		animation: live-pulse 2.6s ease-out infinite;
	}
	h3 {
		margin: 0 0 10px;
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}
	.schedule {
		margin: 0;
		color: var(--ui-surface-heading);
		font-size: 16px;
		font-weight: 700;
	}
	.detail {
		margin: 6px 0 0;
		color: var(--ui-surface-text);
		font-size: 14px;
	}
	.price {
		margin: 24px 0 0;
	}
	.price strong,
	.price span {
		display: block;
	}
	.price strong {
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-size: 28px;
		font-weight: 500;
		line-height: 1.2;
	}
	.price span {
		margin-top: 2px;
		color: var(--ui-surface-text);
		font-size: 13px;
	}
	.body {
		flex: 1 0 auto;
		padding-bottom: 28px;
	}
	.extra {
		margin-top: 24px;
	}
	.action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-top: 20px;
		border-top: 1px solid var(--ui-surface-line);
		color: var(--ui-surface-heading);
		font-size: 15px;
		font-weight: 800;
		text-decoration: none;
	}
	/* The whole card is the hit area; the visible action stays the accessible link. */
	.action::after {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		content: "";
	}
	.action span {
		transition: transform 160ms ease;
	}
	.offer-card:hover .action span {
		transform: translateX(4px);
	}
	.action:focus-visible {
		outline: none;
	}
	.action:focus-visible::after {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 3px;
	}
	@keyframes live-pulse {
		0%,
		55%,
		100% {
			box-shadow: 0 0 0 5px rgba(95, 174, 120, 0.22);
		}
		75% {
			box-shadow: 0 0 0 10px rgba(95, 174, 120, 0);
		}
	}
	@media (max-width: 560px) {
		.offer-card {
			min-height: 0;
			padding: 24px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.offer-card,
		.action span {
			transition: none;
		}
		.offer-card:hover,
		.offer-card:hover .action span {
			transform: none;
		}
		.live-dot {
			animation: none;
		}
	}
</style>

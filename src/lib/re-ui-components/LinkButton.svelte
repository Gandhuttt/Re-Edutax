<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	export type LinkButtonTone = "primary" | "accent" | "inverse" | "text";
	export type LinkButtonSize = "sm" | "md";

	export type LinkButtonProps = {
		href: string;
		children: Snippet;
		tone?: LinkButtonTone;
		size?: LinkButtonSize;
		/** Trailing glyph; pass an empty string to hide it. */
		icon?: string;
		/** Visible label on narrow viewports; the full label stays available to assistive tech. */
		shortLabel?: string;
		/** Stretch to the container width. */
		block?: boolean;
	} & Omit<HTMLAnchorAttributes, "href" | "children">;
</script>

<script lang="ts">
	let {
		href,
		children,
		tone = "primary",
		size = "md",
		icon = "→",
		shortLabel = "",
		block = false,
		class: className,
		...props
	}: LinkButtonProps = $props();
</script>

<a {...props} {href} class="link-button {tone} {size} {className ?? ""}" class:block>
	<span class="label" class:has-short={!!shortLabel}>{@render children()}</span>
	{#if shortLabel}<span class="short" aria-hidden="true">{shortLabel}</span>{/if}
	{#if icon}<span class="icon" aria-hidden="true">{icon}</span>{/if}
</a>

<style>
	.link-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
		border: 1px solid transparent;
		font: inherit;
		font-weight: 800;
		line-height: 1.2;
		text-decoration: none;
		transition:
			background-color 160ms ease,
			box-shadow 160ms ease,
			transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.md {
		min-height: 50px;
		padding: 12px 22px;
		border-radius: 3px;
		font-size: 15px;
	}
	.sm {
		min-height: 38px;
		padding: 8px 14px;
		border-radius: 3px;
		font-size: 13px;
	}
	.block {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}
	.link-button:not(.text):hover {
		transform: translateY(-1px);
	}
	.link-button:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--ui-yellow) 70%, transparent);
		outline-offset: 3px;
	}
	.icon {
		transition: transform 160ms ease;
	}
	.link-button:hover .icon {
		transform: translateX(3px);
	}
	.primary {
		background: var(--ui-navy);
		color: white;
		box-shadow: 0 10px 22px rgba(16, 36, 60, 0.18);
	}
	.primary:hover {
		background: var(--ui-navy-strong);
	}
	.accent {
		border-color: var(--ui-yellow-deep);
		background: var(--ui-yellow);
		color: var(--ui-navy-strong);
	}
	.accent:hover {
		background: color-mix(in srgb, var(--ui-yellow) 82%, white);
	}
	.inverse {
		background: white;
		color: var(--ui-navy-strong);
	}
	.inverse:hover {
		background: var(--ui-yellow-soft);
	}
	.text {
		min-height: 0;
		padding: 4px 0;
		color: var(--ui-surface-heading);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 6px;
	}
	.text:hover {
		text-decoration-thickness: 2px;
	}
	.text:hover .icon {
		transform: none;
	}
	.short {
		display: none;
	}
	@media (max-width: 560px) {
		.label.has-short {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}
		.short {
			display: inline;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.link-button,
		.icon {
			transition: none;
		}
		.link-button:not(.text):hover,
		.link-button:hover .icon {
			transform: none;
		}
	}
</style>

<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type DisplayHeadingProps = {
		/** Line breaks (`\n`) in the title are preserved. */
		title: string;
		/** Trailing phrase rendered with emphasis after the title. */
		emphasis?: string;
		eyebrow?: string;
		description?: string;
		level?: 1 | 2 | 3;
		size?: "hero" | "section";
		/** `split` places the description beside the title on wide containers. */
		layout?: "stacked" | "split";
		headingId?: string;
		/** Extra content after the description, e.g. actions. */
		children?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, "title" | "children">;
</script>

<script lang="ts">
	import Eyebrow from "./Eyebrow.svelte";

	let {
		title,
		emphasis = "",
		eyebrow = "",
		description = "",
		level = 2,
		size = "section",
		layout = "stacked",
		headingId,
		children,
		class: className,
		...props
	}: DisplayHeadingProps = $props();
</script>

<header {...props} class="display-heading {className ?? ""}">
	<div class="layout {layout} {size}">
		<div class="title-group">
			{#if eyebrow}<Eyebrow>{eyebrow}</Eyebrow>{/if}
			<svelte:element this={`h${level}`} id={headingId} class="title"
				>{title}{#if emphasis}{" "}<em>{emphasis}</em>{/if}</svelte:element
			>
		</div>
		{#if description || children}
			<div class="support">
				{#if description}<p>{description}</p>{/if}
				{#if children}<div class="extra">{@render children()}</div>{/if}
			</div>
		{/if}
	</div>
</header>

<style>
	.display-heading {
		min-width: 0;
		container-type: inline-size;
	}
	.layout {
		display: grid;
		gap: 24px;
	}
	.split {
		grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
		align-items: end;
		column-gap: 64px;
	}
	.title-group {
		display: grid;
		gap: 18px;
	}
	.title {
		margin: 0;
		color: var(--ui-surface-heading);
		font-family: var(--ui-font-display);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.05;
		text-wrap: balance;
		white-space: pre-line;
	}
	.section .title {
		font-size: clamp(34px, 4.2vw, 54px);
	}
	.hero .title {
		font-size: clamp(44px, 6vw, 80px);
		letter-spacing: -0.04em;
		line-height: 0.98;
	}
	em {
		color: var(--ui-surface-emphasis);
		font-weight: inherit;
	}
	.support {
		display: grid;
		gap: 30px;
		min-width: 0;
	}
	p {
		max-width: 560px;
		margin: 0;
		color: var(--ui-surface-text);
		font-size: 16px;
		line-height: 1.7;
		text-wrap: pretty;
	}
	.hero p {
		max-width: 580px;
		font-size: 18px;
	}
	@container (max-width: 760px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.hero p {
			font-size: 16px;
		}
		.support {
			gap: 24px;
		}
	}
</style>

<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type CtaBandTone = "paper" | "inverse" | "accent";

	export type CtaBandProps = {
		title: string;
		eyebrow?: string;
		description?: string;
		tone?: CtaBandTone;
		headingId?: string;
		/** Supporting content between the description and the action. */
		children?: Snippet;
		action?: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">;
</script>

<script lang="ts">
	import DisplayHeading from "./DisplayHeading.svelte";
	import SplitLayout from "./SplitLayout.svelte";

	let {
		title,
		eyebrow = "",
		description = "",
		tone = "paper",
		headingId,
		children,
		action,
		class: className,
		...props
	}: CtaBandProps = $props();
</script>

<div
	{...props}
	class="cta-band {tone} {className ?? ""}"
	class:ui-surface-inverse={tone === "inverse"}
>
	<SplitLayout columns="minmax(0, 1.05fr) minmax(0, 0.95fr)" align="end" gap="28px 72px">
		{#snippet start()}
			<DisplayHeading {title} {eyebrow} {headingId} />
		{/snippet}
		{#snippet end()}
			<div class="support">
				{#if description}<p>{description}</p>{/if}
				{#if children}{@render children()}{/if}
				{#if action}<div class="action">{@render action()}</div>{/if}
			</div>
		{/snippet}
	</SplitLayout>
</div>

<style>
	.cta-band {
		padding: clamp(32px, 6vw, 72px);
		border-top: 4px solid var(--ui-navy);
		border-radius: 2px;
	}
	.paper {
		border: 1px solid var(--ui-surface-line);
		background: var(--ui-surface-card);
	}
	.inverse {
		border-top-color: var(--ui-yellow);
		background: var(--ui-navy-strong);
		color: white;
	}
	.accent {
		--ui-surface-heading: var(--ui-navy-strong);
		--ui-surface-text: color-mix(in srgb, var(--ui-navy-strong) 78%, transparent);
		--ui-surface-accent: var(--ui-navy-strong);
		--ui-surface-rule: var(--ui-navy-strong);
		--ui-surface-line: color-mix(in srgb, var(--ui-navy-strong) 20%, transparent);
		background: var(--ui-yellow);
	}
	.support {
		display: grid;
		gap: 26px;
		justify-items: start;
	}
	p {
		max-width: 520px;
		margin: 0;
		color: var(--ui-surface-text);
		font-size: 16px;
		line-height: 1.7;
	}
	.action {
		padding-top: 4px;
	}
	@media (max-width: 560px) {
		.cta-band {
			padding: 28px 22px;
		}
		.support,
		.action {
			justify-items: stretch;
			width: 100%;
		}
	}
</style>

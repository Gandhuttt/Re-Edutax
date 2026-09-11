<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type SectionHeadingProps = {
		title: string;
		eyebrow?: string;
		description?: string;
		action?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, "title">;
</script>

<script lang="ts">
	let {
		title,
		eyebrow = "",
		description = "",
		action,
		class: className,
		...props
	}: SectionHeadingProps = $props();
</script>

<header {...props} class="section-heading {className ?? ""}">
	<div class="title-group">
		{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
		<h2>{title}</h2>
	</div>
	{#if description || action}
		<div class="support">
			{#if description}<p>{description}</p>{/if}
			{#if action}<div class="action">{@render action()}</div>{/if}
		</div>
	{/if}
</header>

<style>
	.section-heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 24px;
		margin-bottom: 13px;
	}

	.title-group {
		min-width: 0;
	}

	.eyebrow {
		display: block;
		margin-bottom: 7px;
		color: #87640c;
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 22px;
	}

	.support {
		display: flex;
		min-width: 0;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 20px;
	}

	p {
		max-width: 530px;
		margin: 0;
		color: var(--ui-muted);
		font-size: 11px;
	}

	.action {
		flex: 0 0 auto;
	}

	.action :global(a) {
		color: var(--ui-navy);
		font-size: 12px;
		font-weight: 700;
		text-underline-offset: 3px;
	}

	.action :global(a:hover) {
		text-decoration-thickness: 2px;
	}

	.action :global(a:focus-visible) {
		outline: 3px solid color-mix(in srgb, var(--ui-yellow) 55%, transparent);
		outline-offset: 3px;
	}

	@media (max-width: 600px) {
		.section-heading,
		.support {
			align-items: flex-start;
			flex-direction: column;
		}

		.section-heading {
			gap: 8px;
		}

		.support {
			width: 100%;
			gap: 8px;
		}
	}
</style>

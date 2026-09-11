<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type PageHeadingProps = {
		title: string;
		eyebrow?: string;
		description?: string;
		actions?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, "title">;
</script>

<script lang="ts">
	let {
		title,
		eyebrow = "",
		description = "",
		actions,
		class: className,
		...props
	}: PageHeadingProps = $props();
</script>

<header {...props} class="page-heading {className ?? ""}">
	<div class="copy">
		{#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
		<h1>{title}</h1>
		{#if description}<p>{description}</p>{/if}
	</div>
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</header>

<style>
	.page-heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 32px;
		padding: 30px 0 24px;
		animation: surface-arrive 360ms 40ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	.copy {
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

	h1 {
		margin: 0;
		color: var(--ui-navy-strong);
		font-family: var(--ui-font-display);
		font-size: 32px;
		font-weight: 600;
	}

	p {
		margin: 7px 0 0;
		color: var(--ui-muted);
	}

	.actions {
		display: flex;
		flex: 0 0 auto;
		gap: 8px;
	}

	@keyframes surface-arrive {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 900px) {
		.page-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}

	@media (max-width: 600px) {
		.actions {
			width: 100%;
			flex-wrap: wrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.page-heading {
			animation: none;
		}
	}
</style>

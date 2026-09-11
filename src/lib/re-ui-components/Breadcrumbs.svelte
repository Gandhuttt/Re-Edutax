<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export type BreadcrumbItem = {
		label: string;
		href?: string;
	};

	export type BreadcrumbsProps = {
		items: readonly BreadcrumbItem[];
		ariaLabel?: string;
		separator?: string;
	} & HTMLAttributes<HTMLElement>;
</script>

<script lang="ts">
	let {
		items,
		ariaLabel = "Breadcrumb",
		separator = "/",
		class: className,
		...props
	}: BreadcrumbsProps = $props();
</script>

<nav {...props} class="breadcrumbs {className ?? ""}" aria-label={ariaLabel}>
	<ol>
		{#each items as item, index}
			{#if index > 0}
				<li class="separator" aria-hidden="true">{separator}</li>
			{/if}
			<li>
				{#if item.href}
					<a
						href={item.href}
						aria-current={index === items.length - 1 ? "page" : undefined}
						>{item.label}</a
					>
				{:else if index === items.length - 1}
					<strong aria-current="page">{item.label}</strong>
				{:else}
					<span>{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		color: var(--ui-muted);
		font-size: 11px;
	}

	ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 9px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		min-width: 0;
	}

	a {
		color: var(--ui-navy);
		text-underline-offset: 2px;
	}

	a:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--ui-yellow) 55%, transparent);
		outline-offset: 2px;
	}

	strong {
		color: inherit;
	}

	.separator {
		user-select: none;
	}
</style>

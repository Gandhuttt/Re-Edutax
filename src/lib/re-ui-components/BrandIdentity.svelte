<script module lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

	export type BrandIdentityProps = {
		brand: string;
		subtitle?: string;
		mark?: string;
		href?: string;
		label?: string;
	} & Omit<HTMLAnchorAttributes, "href" | "children">;
</script>

<script lang="ts">
	let {
		brand,
		subtitle = "",
		mark = "",
		href = "/",
		label = brand,
		class: className,
		...props
	}: BrandIdentityProps = $props();
</script>

<a {...props} class="brand-identity {className ?? ""}" {href} aria-label={label}>
	{#if mark}<span class="brand-mark" aria-hidden="true">{mark}</span>{/if}
	<span class="copy">
		<strong>{brand}</strong>
		{#if subtitle}<small>{subtitle}</small>{/if}
	</span>
</a>

<style>
	.brand-identity {
		display: inline-flex;
		min-width: 0;
		align-items: center;
		gap: 11px;
		color: white;
		text-decoration: none;
	}
	.brand-identity:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 4px;
	}
	.brand-mark {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 38px;
		height: 38px;
		border: 2px solid var(--ui-yellow);
		color: var(--ui-yellow);
		font-size: 12px;
		font-weight: 900;
		letter-spacing: 0.08em;
	}
	.copy {
		min-width: 0;
	}
	strong,
	small {
		display: block;
	}
	strong {
		font-family: var(--ui-font-display);
		font-size: 20px;
		letter-spacing: 0.01em;
		line-height: 1.2;
	}
	small {
		margin-top: 1px;
		color: #ccd6e0;
		font-size: 10px;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	@media (max-width: 600px) {
		small {
			display: none;
		}
	}
</style>

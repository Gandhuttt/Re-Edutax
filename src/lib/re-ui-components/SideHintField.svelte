<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		hint: string;
		title?: string;
		wide?: boolean;
		children: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "title">;

	let {
		hint,
		title = "Petunjuk pengisian",
		wide = false,
		children,
		class: className,
		...props
	}: Props = $props();
</script>

<div {...props} class="side-hint-field {className ?? ""}" class:wide>
	<div class="control">{@render children()}</div>
	{#key hint}
		<aside aria-live="polite">
			<span class="info" aria-hidden="true">i</span>
			<p><strong>{title}</strong>{hint}</p>
		</aside>
	{/key}
</div>

<style>
	.side-hint-field {
		display: grid;
		grid-template-columns: minmax(220px, 0.8fr) minmax(250px, 1fr);
		align-items: end;
		gap: 12px;
	}
	.side-hint-field.wide {
		grid-column: 1/-1;
	}
	.control {
		min-width: 0;
	}
	aside {
		min-height: 40px;
		padding: 8px 11px;
		display: flex;
		align-items: flex-start;
		gap: 9px;
		border: 1px solid #d7c985;
		border-left: 3px solid var(--ui-yellow-deep);
		border-radius: 2px;
		background: var(--ui-yellow-soft);
		color: #655b3a;
		animation: hint-enter 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.info {
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		margin-top: 1px;
		border-radius: 50%;
		background: var(--ui-navy);
		color: white;
		font-family: var(--ui-font-display);
		font-size: 11px;
		font-weight: 800;
	}
	p {
		margin: 0;
		font-size: 10px;
		line-height: 1.45;
	}
	p strong {
		display: block;
		margin-bottom: 1px;
		color: var(--ui-ink);
		font-size: 10px;
	}
	@keyframes hint-enter {
		from {
			opacity: 0;
			transform: translateX(-5px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 700px) {
		.side-hint-field {
			grid-template-columns: 1fr;
			align-items: start;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		aside {
			animation: none;
		}
	}
</style>

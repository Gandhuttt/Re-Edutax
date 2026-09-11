<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		title: string;
		meta?: string;
		open?: boolean;
		expandLabel?: string;
		collapseLabel?: string;
		onopenchange?: (open: boolean) => void;
		children: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "title">;
	const generatedId = $props.id();

	let {
		title,
		meta = "",
		open = $bindable(false),
		expandLabel = "Buka",
		collapseLabel = "Tutup",
		onopenchange,
		children,
		id = generatedId,
		class: className,
		...props
	}: Props = $props();

	function toggle() {
		open = !open;
		onopenchange?.(open);
	}
</script>

<div {...props} {id} class="disclosure {className ?? ""}" class:open>
	<div class="disclosure-header">
		<span class="title" id="{id}-title"
			><strong>{title}</strong>{#if meta}<small>{meta}</small>{/if}</span
		><button
			type="button"
			aria-expanded={open}
			aria-controls="{id}-content"
			aria-label={`${open ? collapseLabel : expandLabel}: ${title}`}
			onclick={toggle}
			><span class="symbol" aria-hidden="true"></span></button
		>
	</div>
	<div class="content-grid" id="{id}-content">
		<div class="content-inner">
			<div class="disclosure-body"><div class="body-motion">{@render children()}</div></div>
		</div>
	</div>
</div>

<style>
	.disclosure {
		border: 1px solid var(--ui-line);
		border-bottom: 0;
		background: var(--ui-paper);
	}
	.disclosure:last-child {
		border-bottom: 1px solid var(--ui-line);
	}
	.disclosure-header {
		min-height: 48px;
		padding: 9px 12px 9px 14px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		transition:
			background 140ms ease,
			padding-left 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.disclosure-header:hover {
		background: var(--ui-paper-deep);
	}
	.open .disclosure-header {
		padding-left: 17px;
		background: var(--ui-paper-deep);
	}
	.title {
		flex: 1;
		user-select: text;
		cursor: text;
	}
	.title strong,
	.title small {
		display: block;
	}
	.title strong {
		color: var(--ui-navy);
		font-size: 12px;
	}
	.title small {
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 10px;
	}
	.disclosure-header button {
		flex: 0 0 auto;
		width: 29px;
		height: 29px;
		padding: 2px;
		display: grid;
		place-items: center;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.disclosure-header button:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 1px;
	}
	.symbol {
		position: relative;
		display: grid;
		place-items: center;
		width: 23px;
		height: 23px;
		border: 1px solid var(--ui-line-strong);
		color: var(--ui-navy);
		font-size: 16px;
		font-weight: 700;
		transition:
			background 180ms ease,
			color 180ms ease;
	}
	.symbol::before,
	.symbol::after {
		position: absolute;
		transition:
			opacity 140ms ease,
			transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.symbol::before {
		content: "+";
	}
	.symbol::after {
		content: "−";
		opacity: 0;
		transform: translateY(-3px);
	}
	.open .symbol {
		background: var(--ui-navy);
		color: white;
	}
	.open .symbol::before {
		opacity: 0;
		transform: translateY(3px);
	}
	.open .symbol::after {
		opacity: 1;
		transform: translateY(0);
	}
	.content-grid {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 150ms ease;
	}
	.open .content-grid {
		grid-template-rows: 1fr;
		opacity: 1;
	}
	.content-inner {
		min-height: 0;
		overflow: hidden;
	}
	.disclosure-body {
		padding: 16px;
		border-top: 1px solid var(--ui-line);
		background: #fffefa;
		color: var(--ui-muted);
		font-size: 12px;
		line-height: 1.55;
	}
	.body-motion {
		transition: transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.body-motion :global(p) {
		margin: 0;
	}
	.open .body-motion {
		transform: translateY(0);
	}
	.disclosure:not(.open) .body-motion {
		transform: translateY(-4px);
	}
	@media (prefers-reduced-motion: reduce) {
		.disclosure-header,
		.symbol,
		.symbol::before,
		.symbol::after,
		.content-grid,
		.body-motion {
			transition: none;
		}
	}
</style>

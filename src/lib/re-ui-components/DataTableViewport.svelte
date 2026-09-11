<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		label?: string;
		minWidth?: string;
		framed?: boolean;
		headerTone?: "paper" | "navy";
		density?: "regular" | "compact";
		stickyFirstColumn?: boolean;
		children: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

	let {
		label = "Tabel data",
		minWidth = "760px",
		framed = true,
		headerTone = "paper",
		density = "regular",
		stickyFirstColumn = false,
		children,
		class: className,
		tabindex = 0,
		...props
	}: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard users need to scroll overflowing tables) -->
<div
	{...props}
	class="table-viewport {className ?? ""}"
	class:framed
	class:navy-header={headerTone === "navy"}
	class:compact={density === "compact"}
	class:sticky-first={stickyFirstColumn}
	style:--table-min-width={minWidth}
	role="region"
	aria-label={label}
	{tabindex}
>
	{@render children()}
</div>

<style>
	.table-viewport {
		max-width: 100%;
		overflow-x: auto;
		overscroll-behavior-inline: contain;
		scrollbar-color: var(--ui-navy) var(--ui-paper-deep);
		scrollbar-width: thin;
		background: #fffefa;
	}
	.table-viewport.framed {
		border: 1px solid var(--ui-line-strong);
	}
	.table-viewport:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}
	.table-viewport :global(table) {
		width: 100%;
		min-width: var(--table-min-width);
		border-collapse: collapse;
		font-size: 12px;
	}
	.table-viewport :global(th) {
		padding: 11px 13px;
		background: #e1e4e2;
		color: #4f5a64;
		text-align: left;
		font-size: 10px;
		letter-spacing: 0.055em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.table-viewport :global(td) {
		padding: 13px;
		border-top: 1px solid var(--ui-line);
		background: #fffefa;
		vertical-align: middle;
	}
	.table-viewport :global(tbody tr) {
		transition: background 140ms ease;
	}
	.table-viewport :global(tbody tr:hover td) {
		background: #fffaf0;
	}
	.table-viewport :global(td a) {
		color: var(--ui-navy);
		font-weight: 800;
	}
	.table-viewport :global(.right),
	.table-viewport :global(.number) {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.table-viewport :global(.amount) {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}
	.table-viewport :global(td code) {
		color: var(--ui-navy);
		font: 700 10px var(--ui-font-mono);
	}
	.table-viewport :global(td strong) {
		color: var(--ui-navy);
	}
	.table-viewport :global(.number) {
		white-space: nowrap;
	}
	.table-viewport :global(.empty) {
		color: var(--ui-muted);
		text-align: center;
	}
	.table-viewport :global(.action-cell) {
		width: 1%;
		white-space: nowrap;
	}
	.table-viewport.navy-header :global(th) {
		background: var(--ui-navy);
		color: white;
	}
	.table-viewport.compact :global(th) {
		padding: 9px 10px;
		font-size: 8px;
	}
	.table-viewport.compact :global(td) {
		padding: 10px;
		font-size: 10px;
	}
	.table-viewport.sticky-first :global(th:first-child),
	.table-viewport.sticky-first :global(td:first-child) {
		position: sticky;
		left: 0;
		z-index: 2;
		box-shadow: 1px 0 0 var(--ui-line-strong);
	}
	.table-viewport.sticky-first :global(th:first-child) {
		z-index: 3;
	}
	.table-viewport::-webkit-scrollbar {
		height: 10px;
	}
	.table-viewport::-webkit-scrollbar-track {
		background: var(--ui-paper-deep);
		border-top: 1px solid var(--ui-line);
	}
	.table-viewport::-webkit-scrollbar-thumb {
		border: 2px solid var(--ui-paper-deep);
		border-radius: 5px;
		background: var(--ui-navy);
	}
	.table-viewport::-webkit-scrollbar-thumb:hover {
		background: var(--ui-navy-strong);
	}
	@media (prefers-reduced-motion: reduce) {
		.table-viewport :global(tbody tr) {
			transition: none;
		}
	}
</style>

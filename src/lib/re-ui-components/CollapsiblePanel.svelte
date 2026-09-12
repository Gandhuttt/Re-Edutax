<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type CollapsiblePanelProps = {
		open?: boolean;
		children: Snippet;
		label?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	let {
		open = false,
		children,
		label,
		class: className,
		...props
	}: CollapsiblePanelProps = $props();
	let overflowOpen = $state(false);
	let overflowTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		clearTimeout(overflowTimer);
		if (!open) {
			overflowOpen = false;
			return;
		}

		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		overflowTimer = setTimeout(() => (overflowOpen = true), reduceMotion ? 0 : 210);
	});

	onDestroy(() => clearTimeout(overflowTimer));
</script>

<div
	{...props}
	class="collapsible-panel {className ?? ""}"
	class:open
	class:overflow-open={overflowOpen}
	aria-hidden={!open}
	inert={!open}
>
	<div class="clip">
		<section aria-label={label}>{@render children()}</section>
	</div>
</div>

<style>
	.collapsible-panel {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-4px);
		transition:
			grid-template-rows 190ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 140ms ease,
			transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1),
			visibility 0s linear 190ms;
	}

	.collapsible-panel.open {
		position: relative;
		z-index: 40;
		grid-template-rows: 1fr;
		opacity: 1;
		visibility: visible;
		transform: none;
		transition:
			grid-template-rows 210ms cubic-bezier(0.2, 0.8, 0.2, 1),
			opacity 160ms ease 35ms,
			transform 210ms cubic-bezier(0.2, 0.8, 0.2, 1),
			visibility 0s;
	}

	.clip {
		min-height: 0;
		overflow: hidden;
	}
	.collapsible-panel.overflow-open .clip {
		overflow: visible;
	}

	section {
		padding: 18px 20px;
		border-bottom: 1px solid var(--ui-line);
		background: #f1eee5;
	}

	@media (prefers-reduced-motion: reduce) {
		.collapsible-panel,
		.collapsible-panel.open {
			transition: none;
		}
	}
</style>

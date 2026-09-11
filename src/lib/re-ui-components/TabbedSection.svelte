<script module lang="ts">
	import type { Snippet } from "svelte";

	export type TabbedSectionTab = {
		label: string;
		value?: string;
		disabled?: boolean;
		panelId?: string;
	};

	export type TabbedSectionTabInput = string | TabbedSectionTab;

	export type TabbedSectionProps = {
		tabs: readonly TabbedSectionTabInput[];
		active?: string;
		ariaLabel?: string;
		panelLabel?: string;
		tabIdPrefix?: string;
		panelIdPrefix?: string;
		onchange?: (active: string, tab: TabbedSectionTab) => void;
		children: Snippet<[string]>;
	};
</script>

<script lang="ts">
	type NormalizedTab = TabbedSectionTab & { value: string };

	let {
		tabs,
		active = $bindable(""),
		ariaLabel = "Bagian dokumen",
		panelLabel,
		tabIdPrefix = "tab",
		panelIdPrefix = "panel",
		onchange,
		children,
		id: providedId,
	}: TabbedSectionProps & { id?: string } = $props();
	const generatedId = $props.id();
	const id = $derived(providedId ?? generatedId);

	let tablist = $state<HTMLElement>();
	const normalizedTabs = $derived(tabs.map(normalizeTab));
	const activeIndex = $derived(
		normalizedTabs.findIndex((tab) => tab.value === active),
	);
	const activeTab = $derived(normalizedTabs[activeIndex]);
	const activePanelId = $derived(
		activeTab?.panelId ?? panelId(activeIndex >= 0 ? activeIndex : "content"),
	);
	const activeTabId = $derived(
		activeIndex >= 0 ? tabId(activeIndex) : undefined,
	);

	function normalizeTab(tab: TabbedSectionTabInput): NormalizedTab {
		return typeof tab === "string"
			? { label: tab, value: tab }
			: { ...tab, value: tab.value ?? tab.label };
	}

	function tabId(index: number) {
		return `${id}-${tabIdPrefix}-${index}`;
	}

	function panelId(index: number | string) {
		return `${id}-${panelIdPrefix}-${index}`;
	}

	function select(tab: NormalizedTab) {
		if (tab.disabled) return;
		active = tab.value;
		onchange?.(active, tab);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End",
		].includes(event.key))
			return;

		const enabledTabs = normalizedTabs.filter((tab) => !tab.disabled);
		if (!enabledTabs.length) return;
		event.preventDefault();
		const current = Math.max(0, enabledTabs.indexOf(normalizedTabs[index]));
		let next = current;
		if (event.key === "Home") next = 0;
		else if (event.key === "End") next = enabledTabs.length - 1;
		else if (event.key === "ArrowRight") next = (current + 1) % enabledTabs.length;
		else next = (current - 1 + enabledTabs.length) % enabledTabs.length;

		const target = enabledTabs[next];
		if (!target) return;
		select(target);
		requestAnimationFrame(() => {
			const targetIndex = normalizedTabs.indexOf(target);
			tablist?.querySelectorAll<HTMLButtonElement>("[role='tab']")[targetIndex]?.focus();
		});
	}
</script>

<div class="ui-tabs" {id}>
	<div class="tab-list" bind:this={tablist} role="tablist" aria-label={ariaLabel}>
		{#each normalizedTabs as tab, index (tab.value)}
			<button
				type="button"
				id={tabId(index)}
				role="tab"
				aria-selected={active === tab.value}
				aria-controls={tab.panelId ?? panelId(index)}
				tabindex={active === tab.value ? 0 : -1}
				disabled={tab.disabled}
				class:active={active === tab.value}
				onclick={() => select(tab)}
				onkeydown={(event) => handleKeydown(event, index)}>{tab.label}</button
			>
		{/each}
	</div>
	<div
		class="tab-panel"
		id={activePanelId}
		role="tabpanel"
		aria-labelledby={activeTabId}
		aria-label={panelLabel}
	>
		{#key active}<div class="tab-content">
				{@render children(active)}
			</div>{/key}
	</div>
</div>

<style>
	.ui-tabs {
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
	}
	.tab-list {
		display: flex;
		overflow-x: auto;
		border-bottom: 1px solid var(--ui-line-strong);
		background: #e1e4e2;
	}
	.tab-list button {
		position: relative;
		min-height: 43px;
		padding: 9px 16px;
		border: 0;
		border-right: 1px solid var(--ui-line);
		background: transparent;
		color: #59636c;
		font: inherit;
		font-size: 12px;
		font-weight: 750;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color 150ms ease,
			background 150ms ease;
	}
	.tab-list button:hover:not(:disabled) {
		background: #ebedea;
		color: var(--ui-navy);
	}
	.tab-list button.active {
		background: var(--ui-paper);
		color: var(--ui-navy);
	}
	.tab-list button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
	.tab-list button::after {
		content: "";
		position: absolute;
		left: 50%;
		right: 50%;
		bottom: -1px;
		height: 3px;
		background: var(--ui-yellow);
		transition:
			left 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
			right 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.tab-list button.active::after {
		left: 12px;
		right: 12px;
	}
	.tab-list button:focus-visible {
		z-index: 1;
		outline: 3px solid var(--ui-yellow);
		outline-offset: -3px;
	}
	.tab-panel {
		padding: 20px;
		overflow: hidden;
	}
	.tab-content {
		animation: tab-arrive 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes tab-arrive {
		from {
			opacity: 0;
			transform: translateX(8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tab-list button,
		.tab-list button::after {
			transition: none;
		}
		.tab-content {
			animation: none;
		}
	}
</style>

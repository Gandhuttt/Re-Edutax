<script lang="ts" module>
	export type DocumentTab = {
		label: string;
		value?: string;
		available?: boolean;
		disabled?: boolean;
		attention?: boolean;
		panelId?: string;
	};
</script>

<script lang="ts">
	let {
		tabs,
		active = $bindable(),
		ariaLabel = "Bagian dokumen",
		attentionLabel = "Perlu dilengkapi",
		onchange,
	}: {
		tabs: DocumentTab[];
		active: string;
		ariaLabel?: string;
		attentionLabel?: string;
		onchange?: (active: string, tab: DocumentTab) => void;
	} = $props();

	let tablist = $state<HTMLElement>();
	const visibleTabs = $derived(tabs.filter((tab) => tab.available !== false));

	function tabValue(tab: DocumentTab) {
		return tab.value ?? tab.label;
	}

	function select(tab: DocumentTab) {
		if (tab.disabled) return;
		active = tabValue(tab);
		onchange?.(active, tab);
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
			return;

		event.preventDefault();
		const enabledTabs = visibleTabs.filter((tab) => !tab.disabled);
		const current = enabledTabs.indexOf(visibleTabs[index]);
		let next = current;
		if (event.key === "Home") next = 0;
		else if (event.key === "End") next = enabledTabs.length - 1;
		else if (event.key === "ArrowRight") next = (current + 1) % enabledTabs.length;
		else next = (current - 1 + enabledTabs.length) % enabledTabs.length;

		const target = enabledTabs[next];
		if (!target) return;
		select(target);
		requestAnimationFrame(() => {
			const buttons = tablist?.querySelectorAll<HTMLButtonElement>("[role='tab']");
			buttons?.[visibleTabs.indexOf(target)]?.focus();
		});
	}
</script>

<div class="document-tabs">
	<div class="tab-list" bind:this={tablist} role="tablist" aria-label={ariaLabel}>
		{#each visibleTabs as tab, index (tabValue(tab))}
			<button
				type="button"
				role="tab"
				aria-selected={active === tabValue(tab)}
				aria-controls={tab.panelId}
				tabindex={active === tabValue(tab) ? 0 : -1}
				disabled={tab.disabled}
				class:active={active === tabValue(tab)}
				onclick={() => select(tab)}
				onkeydown={(event) => handleKeydown(event, index)}
			>
				<span>{tab.label}</span>
				{#if tab.attention}<i aria-label={attentionLabel}></i>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.document-tabs {
		overflow: hidden;
		border: 1px solid var(--ui-line);
		background: #fffefa;
	}
	.tab-list {
		display: flex;
		overflow-x: auto;
		scrollbar-width: thin;
		background: #fffefa;
	}
	button {
		position: relative;
		flex: 0 0 auto;
		min-width: 68px;
		min-height: 46px;
		padding: 10px 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border: 0;
		background: transparent;
		color: var(--ui-muted);
		font: inherit;
		font-size: 11px;
		font-weight: 750;
		cursor: pointer;
		transition:
			color 150ms ease,
			background 150ms ease;
	}
	button + button {
		border-left: 1px solid #eeebe3;
	}
	button:hover {
		background: var(--ui-paper);
		color: var(--ui-navy);
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	button::after {
		content: "";
		position: absolute;
		right: 50%;
		bottom: 0;
		left: 50%;
		height: 3px;
		background: var(--ui-yellow);
		transition:
			right 190ms cubic-bezier(0.2, 0.8, 0.2, 1),
			left 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	button.active {
		background: #f9f7f0;
		color: var(--ui-navy-strong);
	}
	button.active::after {
		right: 8px;
		left: 8px;
	}
	button:focus-visible {
		z-index: 1;
		outline: 3px solid var(--ui-yellow);
		outline-offset: -3px;
	}
	button i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #a13a33;
		box-shadow: 0 0 0 2px #f8e8e5;
	}
	@media (prefers-reduced-motion: reduce) {
		button,
		button::after {
			transition: none;
		}
	}
</style>

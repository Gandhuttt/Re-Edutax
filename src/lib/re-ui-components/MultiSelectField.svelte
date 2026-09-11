<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";

	export type MultiSelectFieldOption = {
		value: string;
		label: string;
		group?: string;
	};

	export type MultiSelectFieldProps = {
		label: string;
		value?: string[];
		field?: ReUiRemoteField<any>;
		name?: string;
		options?: MultiSelectFieldOption[];
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		panelLabel?: string;
		selectedLabel?: string;
		moreLabel?: string;
		emptyText?: string;
		formatSummary?: (
			selected: MultiSelectFieldOption[],
		) => string;
		formatSelectedCount?: (count: number) => string;
		onchange?: (value: string[], option: MultiSelectFieldOption) => void;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	let {
		label,
		value = $bindable([]),
		field,
		name = "",
		options = [],
		placeholder = "Pilih...",
		hint = "",
		error = "",
		required = false,
		disabled = false,
		panelLabel = "PILIH SATU ATAU LEBIH",
		selectedLabel = "dipilih",
		moreLabel = "lainnya",
		emptyText = "Tidak ada pilihan",
		formatSummary,
		formatSelectedCount,
		onchange,
	}: MultiSelectFieldProps = $props();

	const id = $props.id();
	let open = $state(false);
	let closing = $state(false);
	let root = $state<HTMLDivElement>();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const resolvedValue = $derived.by(() => {
		if (!field) return value;
		const remoteValue = field.value();
		return Array.isArray(remoteValue)
			? remoteValue.filter((entry): entry is string => typeof entry === "string")
			: value;
	});
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(
		field ? remoteFieldName(field, "select multiple") : name,
	);
	const messageId = $derived(`${id}-message`);
	const expanded = $derived(open && !closing);
	const selectedOptions = $derived(
		options.filter((option) => resolvedValue.includes(option.value)),
	);
	const summary = $derived.by(() =>
		formatSummary
			? formatSummary(selectedOptions)
			: selectedOptions.length === 0
			? placeholder
			: selectedOptions.length <= 2
				? selectedOptions.map((option) => option.label).join(", ")
				: `${selectedOptions[0].label} dan ${selectedOptions.length - 1} ${moreLabel}`,
	);
	const groups = $derived.by(() => {
		const grouped = new Map<string, MultiSelectFieldOption[]>();
		for (const option of options) {
			const key = option.group ?? "";
			grouped.set(key, [...(grouped.get(key) ?? []), option]);
		}
		return [...grouped.entries()];
	});

	function openPanel() {
		if (disabled) return;
		clearTimeout(closeTimer);
		closing = false;
		open = true;
	}
	function closePanel() {
		if (!open || closing) return;
		closing = true;
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		closeTimer = setTimeout(
			() => {
				open = false;
				closing = false;
			},
			reduceMotion ? 0 : 140,
		);
	}
	function togglePanel() {
		if (expanded) closePanel();
		else openPanel();
	}
	function toggleOption(option: MultiSelectFieldOption) {
		const next = resolvedValue.includes(option.value)
			? resolvedValue.filter((entry) => entry !== option.value)
			: [...resolvedValue, option.value];
		if (field) field.set(next);
		else value = next;
		onchange?.(next, option);
	}
	function handleOutsideClick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node))
			closePanel();
	}
	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window
	onclick={handleOutsideClick}
	onkeydown={(event) => {
		if (event.key === "Escape") closePanel();
	}}
/>

<div class="field" class:disabled class:error={Boolean(resolvedError)} bind:this={root}>
	{#if resolvedName}
		{#each resolvedValue as selectedValue}<input type="hidden" name={resolvedName} value={selectedValue} />{/each}
	{/if}
	<span class="field-label" id="{id}-label"
		>{label}{#if required}<em aria-hidden="true">*</em>{/if}</span
	>
	<button
		class="multi-trigger"
		type="button"
		role="combobox"
		aria-labelledby="{id}-label {id}-summary"
		aria-haspopup="listbox"
		aria-expanded={expanded}
		aria-controls="{id}-listbox"
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={resolvedError || hint ? messageId : undefined}
		{disabled}
		onclick={togglePanel}
	>
		<span class:placeholder={resolvedValue.length === 0} id="{id}-summary"
			>{summary}</span
		>
		<span class="trigger-meta"
			>{#if resolvedValue.length}<b>{resolvedValue.length}</b>{/if}<i
				class:open={expanded}
				aria-hidden="true">⌄</i
			></span
		>
	</button>
	{#if open}
		<div
			class="multi-panel"
			class:closing
			id="{id}-listbox"
			role="listbox"
			aria-multiselectable="true"
			aria-labelledby="{id}-label"
		>
			<div class="panel-summary">
				<span>{panelLabel}</span><strong
					>{formatSelectedCount?.(resolvedValue.length) ?? `${resolvedValue.length} ${selectedLabel}`}</strong
				>
			</div>
			<div class="option-groups">
				{#each groups as [group, groupOptions] (group)}
					{#if group}<div class="group-label">{group}</div>{/if}
					{#each groupOptions as option, index (option.value)}
						<button
							class="multi-option"
							type="button"
							class:selected={resolvedValue.includes(option.value)}
							style:--index={index}
							role="option"
							aria-selected={resolvedValue.includes(option.value)}
							onclick={() => toggleOption(option)}
						>
							<span class="box" aria-hidden="true">✓</span>
							<span>{option.label}</span>
						</button>
					{/each}
				{:else}<div class="empty-option">{emptyText}</div>
				{/each}
			</div>
		</div>
	{/if}
	{#if resolvedError}<span class="message" id={messageId}>{resolvedError}</span>{:else if hint}<span class="hint" id={messageId}>{hint}</span>{/if}
</div>

<style>
	.field {
		position: relative;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.field-label {
		font-size: 12px;
		font-weight: 700;
	}
	.field-label em {
		margin-left: 3px;
		color: #9b2f28;
		font-style: normal;
	}
	.multi-trigger {
		width: 100%;
		height: 40px;
		padding: 0 9px 0 11px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 13px;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}
	.multi-trigger:hover {
		border-color: #7e8994;
	}
	.multi-trigger:focus-visible,
	.multi-trigger[aria-expanded="true"] {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.multi-trigger:disabled {
		background: #e9e7df;
		color: #666b70;
		cursor: not-allowed;
	}
	.multi-trigger > span:first-child {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.placeholder {
		color: var(--ui-muted);
	}
	.trigger-meta {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.trigger-meta b {
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		display: grid;
		place-items: center;
		border-radius: 10px;
		background: var(--ui-navy);
		color: white;
		font-size: 10px;
	}
	.trigger-meta i {
		color: var(--ui-navy);
		font-size: 15px;
		font-style: normal;
		font-weight: 900;
		transition:
			color 150ms ease,
			transform 150ms ease;
	}
	.trigger-meta i.open {
		color: var(--ui-yellow-deep);
		transform: translateY(2px);
	}
	.multi-panel {
		position: absolute;
		z-index: 31;
		top: 64px;
		left: 0;
		right: 0;
		overflow: hidden;
		border: 1px solid var(--ui-line-strong);
		border-top: 3px solid var(--ui-yellow);
		border-radius: 2px;
		background: #fffefa;
		box-shadow: 0 12px 24px rgba(15, 34, 55, 0.16);
		transform-origin: top;
		animation: panel-enter 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.multi-panel.closing {
		pointer-events: none;
		animation: panel-leave 140ms ease-in forwards;
	}
	.panel-summary {
		min-height: 34px;
		padding: 7px 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}
	.panel-summary span {
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.09em;
	}
	.panel-summary strong {
		color: var(--ui-navy);
		font-size: 10px;
	}
	.option-groups {
		max-height: 240px;
		padding: 5px;
		overflow: auto;
	}
	.group-label {
		padding: 8px 9px 5px;
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
	.empty-option {
		padding: 18px 12px;
		color: var(--ui-muted);
		font-size: 11px;
		text-align: center;
	}
	.multi-option {
		min-height: 38px;
		padding: 8px 9px;
		display: grid;
		grid-template-columns: 19px 1fr;
		align-items: center;
		gap: 9px;
		border-left: 2px solid transparent;
		border-top: 0;
		border-right: 0;
		border-bottom: 0;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 12px;
		text-align: left;
		cursor: pointer;
		opacity: 0;
		animation: option-enter 160ms calc(var(--index) * 24ms + 35ms) ease-out
			forwards;
		transition:
			background 140ms ease,
			border-color 140ms ease,
			padding-left 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.multi-option:hover {
		padding-left: 12px;
		background: var(--ui-paper-deep);
	}
	.multi-option.selected {
		border-left-color: var(--ui-yellow);
		background: #fffaf0;
		color: var(--ui-navy);
		font-weight: 700;
	}
	.box {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		border: 1px solid #7e8994;
		border-radius: 2px;
		background: #fffefa;
		color: white;
		font-size: 12px;
		font-weight: 900;
		line-height: 1;
		transition:
			border-color 150ms ease,
			background 170ms cubic-bezier(0.2, 0.8, 0.2, 1),
			color 120ms ease;
	}
	.multi-option.selected .box {
		border-color: var(--ui-navy);
		background: var(--ui-navy);
		color: white;
	}
	.multi-option:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: -2px;
	}
	.hint,
	.message {
		color: var(--ui-muted);
		font-size: 11px;
		line-height: 1.4;
	}
	.message {
		color: var(--ui-danger);
	}
	.error .multi-trigger {
		border-color: var(--ui-danger);
		background: #fffafa;
	}
	.disabled {
		opacity: 0.72;
	}
	@keyframes panel-enter {
		from {
			opacity: 0;
			transform: translateY(-6px) scaleY(0.96);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes panel-leave {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scaleY(0.97);
		}
	}
	@keyframes option-enter {
		from {
			opacity: 0;
			transform: translateX(-5px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.multi-trigger,
		.trigger-meta i,
		.multi-option,
		.box {
			transition: none;
		}
		.multi-panel,
		.multi-option {
			animation: none;
			opacity: 1;
		}
	}
</style>

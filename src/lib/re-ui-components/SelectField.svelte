<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";

	export type SelectFieldValue = string | number;

	export type SelectFieldOption = {
		value: SelectFieldValue;
		label: string;
		searchText?: string;
	};

	export type SelectFieldProps = {
		label: string;
		value?: SelectFieldValue;
		field?: ReUiRemoteField<any>;
		name?: string;
		options?: SelectFieldOption[];
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		layout?: "stacked" | "inline";
		labelHidden?: boolean;
		floatingPanel?: boolean;
		searchable?: boolean;
		searchPlaceholder?: string;
		searchLabel?: string;
		emptyTitle?: string;
		emptyDescription?: string;
		locale?: string;
		onchange?: (value: SelectFieldValue, option: SelectFieldOption) => void;
	};
</script>

<script lang="ts">
	import { onDestroy, onMount, tick } from "svelte";
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	let {
		label,
		value = $bindable(),
		field,
		name = "",
		options = [],
		placeholder = "Pilih...",
		hint = "",
		error = "",
		required = false,
		disabled = false,
		layout = "stacked",
		labelHidden = false,
		floatingPanel = false,
		searchable = false,
		searchPlaceholder = "Cari pilihan...",
		searchLabel = `Cari ${label}`,
		emptyTitle = "Tidak ada hasil",
		emptyDescription = "Coba kata kunci atau kode lain.",
		locale = "id-ID",
		onchange,
	}: SelectFieldProps = $props();
	const id = $props.id();
	let open = $state(false);
	let closing = $state(false);
	let activeIndex = $state(0);
	let query = $state("");
	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let optionPanel = $state<HTMLDivElement>();
	let searchInput = $state<HTMLInputElement>();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	let floatingTop = $state(0);
	let floatingLeft = $state(0);
	let floatingWidth = $state(0);
	let floatingListHeight = $state(230);
	const resolvedValue = $derived.by(() => {
		if (!field) return value ?? "";
		const remoteValue = field.value();
		return typeof remoteValue === "string" || typeof remoteValue === "number"
			? remoteValue
			: (value ?? "");
	});
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(
		field ? remoteFieldName(field, "hidden", resolvedValue) : name,
	);
	const messageId = $derived(`${id}-message`);
	const selected = $derived(
		options.find((option) => option.value === resolvedValue) ?? options[0],
	);
	const filteredOptions = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase(locale);
		if (!searchable || !needle) return options;
		return options.filter((option) =>
			`${option.value} ${option.label} ${option.searchText ?? ""}`
				.toLocaleLowerCase(locale)
				.includes(needle),
		);
	});
	const expanded = $derived(open && !closing);
	function fixedContainingBlockOrigin() {
		let current = trigger?.parentElement;
		while (current) {
			const style = getComputedStyle(current);
			if (
				style.transform !== "none" ||
				style.perspective !== "none" ||
				style.filter !== "none" ||
				style.contain !== "none" ||
				style.willChange.includes("transform")
			) {
				const rect = current.getBoundingClientRect();
				return { left: rect.left, top: rect.top };
			}
			// A modal <dialog> lives in the top layer: its containing block is the
			// viewport, so transformed ancestors above it must not offset the panel.
			if (current.matches(":modal")) return { left: 0, top: 0 };
			current = current.parentElement;
		}
		return { left: 0, top: 0 };
	}
	function positionFloatingPanel() {
		if (!floatingPanel || !trigger) return;
		const margin = 8;
		const gap = 5;
		const triggerRect = trigger.getBoundingClientRect();
		const width = Math.min(
			Math.max(triggerRect.width, 180),
			window.innerWidth - margin * 2,
		);
		const panelHeight = optionPanel?.offsetHeight || 240;
		const origin = fixedContainingBlockOrigin();
		const spaceBelow = window.innerHeight - triggerRect.bottom - margin;
		const spaceAbove = triggerRect.top - margin;
		const opensAbove = spaceBelow < Math.min(panelHeight, 180) && spaceAbove > spaceBelow;
		const availableHeight = Math.max(
			90,
			(opensAbove ? spaceAbove : spaceBelow) - gap,
		);

		floatingWidth = width;
		floatingLeft =
			Math.min(
				Math.max(margin, triggerRect.left),
				window.innerWidth - width - margin,
			) - origin.left;
		floatingListHeight = Math.min(230, availableHeight - (searchable ? 52 : 0));
		floatingTop =
			(opensAbove
				? Math.max(
						margin,
						triggerRect.top - Math.min(panelHeight, availableHeight) - gap,
					)
				: triggerRect.bottom + gap) - origin.top;
	}
	async function openPanel() {
		clearTimeout(closeTimer);
		query = "";
		activeIndex = Math.max(
			0,
			options.findIndex((option) => option.value === resolvedValue),
		);
		closing = false;
		open = true;
		await tick();
		positionFloatingPanel();
		if (searchable) searchInput?.focus();
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
				query = "";
			},
			reduceMotion ? 0 : 140,
		);
	}
	function show() {
		if (disabled) return;
		if (expanded) closePanel();
		else openPanel();
	}
	function choose(option: SelectFieldOption | undefined) {
		if (!option) return;
		if (field) field.set(option.value);
		else value = option.value;
		onchange?.(option.value, option);
		closePanel();
	}
	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key === "Escape") {
			closePanel();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!expanded) openPanel();
			const direction = event.key === "ArrowDown" ? 1 : -1;
			if (options.length)
				activeIndex =
					(activeIndex + direction + options.length) % options.length;
		}
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (expanded) choose(options[activeIndex]);
			else openPanel();
		}
	}
	function handleSearchInput(event: Event) {
		query = (event.currentTarget as HTMLInputElement).value;
		activeIndex = 0;
	}
	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			event.preventDefault();
			closePanel();
			trigger?.focus();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!filteredOptions.length) return;
			const direction = event.key === "ArrowDown" ? 1 : -1;
			activeIndex =
				(activeIndex + direction + filteredOptions.length) %
				filteredOptions.length;
		}
		if (event.key === "Enter" && filteredOptions[activeIndex]) {
			event.preventDefault();
			choose(filteredOptions[activeIndex]);
			trigger?.focus();
		}
	}
	function handleOutsideClick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node))
			closePanel();
	}
	function handleDocumentScroll(event: Event) {
		if (
			floatingPanel &&
			expanded &&
			root &&
			!root.contains(event.target as Node)
		) {
			positionFloatingPanel();
		}
	}
	onMount(() => {
		document.addEventListener("scroll", handleDocumentScroll, true);
		return () => document.removeEventListener("scroll", handleDocumentScroll, true);
	});
	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window
	onclick={handleOutsideClick}
	onresize={() => {
		if (expanded) positionFloatingPanel();
	}}
/>
<div
	class="field"
	class:inline={layout === "inline"}
	class:error={Boolean(resolvedError)}
	class:disabled
	class:label-hidden={labelHidden}
	bind:this={root}
>
	{#if resolvedName}<input type="hidden" name={resolvedName} value={resolvedValue} />{/if}
	<span class="field-label" id="{id}-label"
		>{label}{#if required}<em aria-hidden="true">*</em>{/if}</span
	>
	<button
		bind:this={trigger}
		type="button"
		role="combobox"
		class="select-trigger"
		aria-labelledby="{id}-label {id}-value"
		aria-haspopup="listbox"
		aria-expanded={expanded}
		aria-controls="{id}-listbox"
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={resolvedError || hint ? messageId : undefined}
		{disabled}
		onclick={show}
		onkeydown={handleKeydown}
		><span id="{id}-value">{selected?.label ?? placeholder}</span><span
			class="chevron"
			class:open={expanded}>⌄</span
		></button
	>
	{#if open}
		<div
			bind:this={optionPanel}
			class="option-panel"
			class:closing
			class:floating={floatingPanel}
			id="{id}-listbox"
			role="listbox"
			aria-labelledby="{id}-label"
			style:--floating-top={`${floatingTop}px`}
			style:--floating-left={`${floatingLeft}px`}
			style:--floating-width={`${floatingWidth}px`}
			style:--floating-list-height={`${floatingListHeight}px`}
		>
			{#if searchable}<div class="option-search">
					<span aria-hidden="true">⌕</span><input
						bind:this={searchInput}
						type="search"
						value={query}
						placeholder={searchPlaceholder}
						aria-label={searchLabel}
						oninput={handleSearchInput}
						onkeydown={handleSearchKeydown}
					/>
				</div>{/if}
			<div class="option-list">
				{#each filteredOptions as option, index (option.value)}<button
						type="button"
						role="option"
						aria-selected={option.value === resolvedValue}
						class:selected={option.value === resolvedValue}
						class:active={index === activeIndex}
						style:--index={index}
						onmouseenter={() => (activeIndex = index)}
						onclick={() => choose(option)}
						><span>{option.label}</span
						>{#if option.value === resolvedValue}<span class="check">✓</span
							>{/if}</button
					>{:else}<div class="empty-option">
						<strong>{emptyTitle}</strong><span
							>{emptyDescription}</span
						>
					</div>{/each}
			</div>
		</div>
	{/if}
	{#if resolvedError}<span class="message" id={messageId}>{resolvedError}</span>{:else if hint}<span
			class="hint" id={messageId}>{hint}</span
		>{/if}
</div>

<style>
	.field {
		position: relative;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.field-label {
		font-size: 14px;
		font-weight: 700;
	}
	.label-hidden {
		gap: 0;
	}
	.label-hidden .field-label {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.label-hidden .select-trigger {
		height: 30px;
		padding: 0 8px;
		font-size: 10px;
	}
	.label-hidden .option-panel {
		top: 35px;
	}
	.field-label em {
		margin-left: 3px;
		color: #9b2f28;
		font-style: normal;
	}
	.field.inline {
		grid-template-columns: max-content minmax(68px, 1fr);
		align-items: center;
		gap: 8px;
	}
	.inline .field-label {
		color: var(--ui-muted);
		font-size: 12px;
		white-space: nowrap;
	}
	.inline .select-trigger {
		height: 34px;
		padding: 0 9px;
		font-size: 14px;
	}
	.inline .message,
	.inline .hint {
		grid-column: 1/-1;
	}
	.select-trigger {
		width: 100%;
		height: 40px;
		padding: 0 11px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 16px;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}
	.select-trigger:hover {
		border-color: #7e8994;
	}
	.select-trigger:focus-visible,
	.select-trigger[aria-expanded="true"] {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.select-trigger:disabled {
		background: #e9e7df;
		color: #666b70;
		cursor: not-allowed;
	}
	.chevron {
		color: var(--ui-navy);
		font-size: 15px;
		font-weight: 900;
		transition:
			color 150ms ease,
			transform 150ms ease;
	}
	.chevron.open {
		color: var(--ui-yellow-deep);
		transform: translateY(2px);
	}
	.option-panel {
		position: absolute;
		z-index: 30;
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
	.option-panel.closing {
		pointer-events: none;
		animation: panel-leave 140ms ease-in forwards;
	}
	.option-panel.floating {
		position: fixed;
		z-index: 80;
		top: var(--floating-top);
		left: var(--floating-left);
		right: auto;
		width: var(--floating-width);
	}
	.option-panel.floating .option-list {
		max-height: var(--floating-list-height);
	}
	.option-search {
		padding: 7px;
		display: grid;
		grid-template-columns: 24px 1fr;
		align-items: center;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}
	.option-search > span {
		color: var(--ui-navy);
		font-size: 17px;
		text-align: center;
	}
	.option-search input {
		width: 100%;
		height: 34px;
		padding: 6px 9px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 14px;
	}
	.option-search input:focus {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 1px;
		border-color: var(--ui-navy);
	}
	.option-search input::-webkit-search-cancel-button {
		cursor: pointer;
	}
	.option-list {
		max-height: 230px;
		padding: 5px;
		overflow: auto;
	}
	.option-list > button {
		width: 100%;
		min-height: 36px;
		padding: 8px 9px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 0;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 14px;
		text-align: left;
		cursor: pointer;
		opacity: 0;
		animation: option-enter 160ms calc(var(--index) * 24ms + 35ms) ease-out
			forwards;
	}
	.option-list > button:hover,
	.option-list > button.active {
		background: var(--ui-paper-deep);
	}
	.option-list > button.selected {
		color: var(--ui-navy);
		font-weight: 750;
	}
	.empty-option {
		padding: 18px 12px;
		text-align: center;
		color: var(--ui-muted);
	}
	.empty-option strong,
	.empty-option span {
		display: block;
	}
	.empty-option strong {
		color: var(--ui-ink);
		font-size: 14px;
	}
	.empty-option span {
		margin-top: 3px;
		font-size: 12px;
	}
	.check {
		color: var(--ui-yellow-deep);
		font-size: 14px;
		font-weight: 900;
	}
	.hint,
	.message {
		font-size: 12px;
		line-height: 1.4;
	}
	.hint {
		color: var(--ui-muted);
	}
	.message {
		color: #8d2924;
	}
	.error .select-trigger {
		border-color: #a9433d;
		background: #fffafa;
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
		.select-trigger,
		.chevron {
			transition: none;
		}
		.option-panel,
		.option-list > button {
			animation: none;
			opacity: 1;
		}
	}
</style>

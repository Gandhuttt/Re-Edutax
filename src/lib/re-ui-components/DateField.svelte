<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";

	export type DateFieldProps = {
		label: string;
		value?: string;
		field?: ReUiRemoteField<any>;
		name?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		min?: string;
		max?: string;
		required?: boolean;
		disabled?: boolean;
		locale?: string;
		weekdays?: readonly string[];
		calendarLabel?: string;
		previousMonthLabel?: string;
		nextMonthLabel?: string;
		todayLabel?: string;
		emptyValueText?: string;
		unavailableText?: string;
		outOfRangeTitle?: string;
		onchange?: (value: string) => void;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	let {
		label,
		value = $bindable(""),
		field,
		name = "",
		placeholder = "Pilih tanggal",
		hint = "",
		error = "",
		min = "",
		max = "",
		required = false,
		disabled = false,
		locale = "id-ID",
		weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
		calendarLabel = `Pilih ${label}`,
		previousMonthLabel = "Bulan sebelumnya",
		nextMonthLabel = "Bulan berikutnya",
		todayLabel = "Hari ini",
		emptyValueText = "Belum dipilih",
		unavailableText = ", tidak tersedia",
		outOfRangeTitle = "Di luar rentang tanggal yang diizinkan",
		onchange,
	}: DateFieldProps = $props();

	const id = $props.id();
	const today = new Date();
	const todayIso = toIso(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	let open = $state(false);
	let closing = $state(false);
	let viewYear = $state(today.getFullYear());
	let viewMonth = $state(today.getMonth());
	let root = $state<HTMLDivElement>();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const resolvedValue = $derived(
		field ? String(field.value() ?? value) : value,
	);
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(
		field ? remoteFieldName(field, "hidden", resolvedValue) : name,
	);
	const messageId = $derived(`${id}-message`);
	const expanded = $derived(open && !closing);
	const displayValue = $derived(
		resolvedValue ? formatDate(resolvedValue) : placeholder,
	);
	const monthLabel = $derived(
		new Intl.DateTimeFormat(locale, {
			month: "long",
			year: "numeric",
		}).format(new Date(viewYear, viewMonth, 1)),
	);
	const calendarCells = $derived.by(() => {
		const leading = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
		const days = new Date(viewYear, viewMonth + 1, 0).getDate();
		return [
			...Array<null>(leading).fill(null),
			...Array.from({ length: days }, (_, index) => index + 1),
		];
	});
	function toIso(year: number, month: number, day: number) {
		return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}
	function parseDate(date: string) {
		const [year, month, day] = date.split("-").map(Number);
		return year && month && day ? new Date(year, month - 1, day) : null;
	}
	function formatDate(date: string) {
		const parsed = parseDate(date);
		return parsed
			? new Intl.DateTimeFormat(locale, {
					day: "2-digit",
					month: "long",
					year: "numeric",
				}).format(parsed)
			: date;
	}
	function openPanel() {
		if (disabled) return;
		clearTimeout(closeTimer);
		const selected = parseDate(resolvedValue) ?? today;
		viewYear = selected.getFullYear();
		viewMonth = selected.getMonth();
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
			reduceMotion ? 0 : 150,
		);
	}
	function togglePanel() {
		if (expanded) closePanel();
		else openPanel();
	}
	function moveMonth(offset: number) {
		const next = new Date(viewYear, viewMonth + offset, 1);
		viewYear = next.getFullYear();
		viewMonth = next.getMonth();
	}
	function isUnavailable(date: string) {
		return Boolean((min && date < min) || (max && date > max));
	}
	function choose(day: number) {
		const next = toIso(viewYear, viewMonth, day);
		if (isUnavailable(next)) return;
		if (field) field.set(next);
		else value = next;
		onchange?.(next);
		closePanel();
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

<div class="date-field" class:error={Boolean(resolvedError)} class:disabled bind:this={root}>
	<span class="field-label" id="{id}-label"
		>{label}{#if required}<em aria-hidden="true">*</em>{/if}</span
	>
	{#if resolvedName}<input type="hidden" name={resolvedName} value={resolvedValue} />{/if}
	<button
		class="date-trigger"
		class:placeholder={!resolvedValue}
		type="button"
		aria-labelledby="{id}-label {id}-value"
		aria-haspopup="dialog"
		aria-expanded={expanded}
		aria-controls="{id}-calendar"
		aria-describedby={resolvedError || hint ? messageId : undefined}
		{disabled}
		onclick={togglePanel}
	>
		<span id="{id}-value">{displayValue}</span><span
			class="calendar-icon"
			aria-hidden="true"><i></i></span
		>
	</button>
	{#if open}
		<div
			class="calendar-panel"
			class:closing
			id="{id}-calendar"
			role="dialog"
			aria-modal="false"
			aria-label={calendarLabel}
		>
			<div class="calendar-head">
				<button
					type="button"
					aria-label={previousMonthLabel}
					onclick={() => moveMonth(-1)}>‹</button
				><strong>{monthLabel}</strong><button
					type="button"
					aria-label={nextMonthLabel}
					onclick={() => moveMonth(1)}>›</button
				>
			</div>
			<div class="weekday-row" aria-hidden="true">
				{#each weekdays as weekday}<span>{weekday}</span>{/each}
			</div>
			{#key `${viewYear}-${viewMonth}`}
				<div class="day-grid">
					{#each calendarCells as day, index}
						{#if day === null}<span class="empty" aria-hidden="true"
							></span>{:else}
							{@const date = toIso(viewYear, viewMonth, day)}
							<button
								type="button"
								class:selected={date === resolvedValue}
								class:today={date === todayIso}
								disabled={isUnavailable(date)}
								aria-label={`${formatDate(date)}${isUnavailable(date) ? unavailableText : ""}`}
								title={isUnavailable(date)
									? outOfRangeTitle
									: undefined}
								aria-pressed={date === resolvedValue}
								style:--index={index}
								onclick={() => choose(day)}>{day}</button
							>
						{/if}
					{/each}
				</div>
			{/key}
			<div class="calendar-foot">
				<button
					type="button"
					onclick={() => {
						const current = parseDate(todayIso)!;
						viewYear = current.getFullYear();
						viewMonth = current.getMonth();
						choose(current.getDate());
					}}>{todayLabel}</button
				><span>{resolvedValue ? formatDate(resolvedValue) : emptyValueText}</span>
			</div>
		</div>
	{/if}
	{#if resolvedError}<span class="message" id={messageId}>{resolvedError}</span>{:else if hint}<span
			class="hint" id={messageId}>{hint}</span
		>{/if}
</div>

<style>
	.date-field {
		position: relative;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.field-label {
		color: var(--ui-ink);
		font-size: 12px;
		font-weight: 700;
	}
	.field-label em {
		margin-left: 3px;
		color: #9b2f28;
		font-style: normal;
	}
	.date-trigger {
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
	.date-trigger:hover {
		border-color: #7e8994;
	}
	.date-trigger:focus-visible,
	.date-trigger[aria-expanded="true"] {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.date-trigger.placeholder {
		color: var(--ui-muted);
	}
	.date-trigger:disabled {
		background: #e9e7df;
		color: #666b70;
		cursor: not-allowed;
	}
	.calendar-icon {
		position: relative;
		flex: 0 0 auto;
		width: 20px;
		height: 20px;
		border: 1px solid var(--ui-navy);
		border-radius: 2px;
	}
	.calendar-icon::before {
		content: "";
		position: absolute;
		inset: 4px -1px auto;
		height: 1px;
		background: var(--ui-navy);
	}
	.calendar-icon::after {
		content: "";
		position: absolute;
		top: -3px;
		left: 4px;
		width: 2px;
		height: 5px;
		border-right: 2px solid #fffefa;
		border-left: 2px solid #fffefa;
		background: var(--ui-navy);
	}
	.calendar-icon i {
		position: absolute;
		right: 4px;
		bottom: 4px;
		width: 3px;
		height: 3px;
		background: var(--ui-yellow-deep);
	}
	.calendar-panel {
		position: absolute;
		z-index: 34;
		top: 64px;
		left: 0;
		width: 310px;
		overflow: hidden;
		border: 1px solid var(--ui-line-strong);
		border-top: 3px solid var(--ui-yellow);
		border-radius: 2px;
		background: #fffefa;
		box-shadow: 0 14px 28px rgba(15, 34, 55, 0.18);
		transform-origin: top;
		animation: calendar-enter 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.calendar-panel.closing {
		pointer-events: none;
		animation: calendar-leave 150ms ease-in forwards;
	}
	.calendar-head {
		min-height: 46px;
		padding: 6px 8px;
		display: grid;
		grid-template-columns: 34px 1fr 34px;
		align-items: center;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-navy);
		color: white;
	}
	.calendar-head strong {
		text-align: center;
		font-family: var(--ui-font-display);
		font-size: 14px;
		text-transform: capitalize;
	}
	.calendar-head button {
		width: 30px;
		height: 30px;
		border: 1px solid rgba(255, 255, 255, 0.24);
		border-radius: 2px;
		background: transparent;
		color: white;
		font: inherit;
		font-size: 20px;
		cursor: pointer;
	}
	.calendar-head button:hover {
		border-color: var(--ui-yellow);
		background: rgba(255, 255, 255, 0.08);
	}
	.calendar-head button:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 1px;
	}
	.weekday-row,
	.day-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	.weekday-row {
		padding: 8px 8px 4px;
		background: var(--ui-paper-deep);
	}
	.weekday-row span {
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		text-align: center;
		text-transform: uppercase;
	}
	.day-grid {
		padding: 4px 8px 8px;
		background: var(--ui-paper-deep);
	}
	.day-grid button,
	.day-grid .empty {
		height: 34px;
	}
	.day-grid button {
		position: relative;
		border: 1px solid transparent;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 11px;
		cursor: pointer;
		animation: day-enter 140ms calc(var(--index) * 5ms) ease-out both;
	}
	.day-grid button:hover {
		border-color: var(--ui-line-strong);
		background: #fffefa;
		color: var(--ui-navy);
	}
	.day-grid button.today::after {
		content: "";
		position: absolute;
		right: 5px;
		bottom: 3px;
		left: 5px;
		height: 2px;
		background: var(--ui-yellow-deep);
	}
	.day-grid button.selected {
		border-color: var(--ui-navy);
		background: var(--ui-navy);
		color: white;
		font-weight: 800;
	}
	.day-grid button.selected::after {
		background: var(--ui-yellow);
	}
	.day-grid button:focus-visible {
		z-index: 1;
		outline: 2px solid var(--ui-yellow);
		outline-offset: -1px;
	}
	.day-grid button:disabled {
		border-color: #d4d1c9;
		background: #e3e0d8;
		color: #8a8d90;
		opacity: 0.68;
		text-decoration: line-through;
		cursor: not-allowed;
	}
	.calendar-foot {
		min-height: 39px;
		padding: 6px 9px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-top: 1px solid var(--ui-line);
		background: #fffefa;
	}
	.calendar-foot button {
		padding: 5px 8px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: transparent;
		color: var(--ui-navy);
		font: inherit;
		font-size: 9px;
		font-weight: 800;
		cursor: pointer;
	}
	.calendar-foot button:hover {
		background: var(--ui-paper-deep);
	}
	.calendar-foot span {
		overflow: hidden;
		color: var(--ui-muted);
		font-size: 9px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.hint,
	.message {
		font-size: 11px;
		line-height: 1.4;
	}
	.hint {
		color: var(--ui-muted);
	}
	.message {
		color: #8d2924;
	}
	.error .date-trigger {
		border-color: #a9433d;
		background: #fffafa;
	}
	.disabled {
		opacity: 0.72;
	}
	@keyframes calendar-enter {
		from {
			opacity: 0;
			transform: translateY(-6px) scaleY(0.97);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes calendar-leave {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scaleY(0.98);
		}
	}
	@keyframes day-enter {
		from {
			opacity: 0;
			transform: translateY(3px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 420px) {
		.calendar-panel {
			right: 0;
			width: min(310px, calc(100vw - 40px));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.date-trigger {
			transition: none;
		}
		.calendar-panel,
		.calendar-panel.closing,
		.day-grid button {
			animation: none;
		}
	}
</style>

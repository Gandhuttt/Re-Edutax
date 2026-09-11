<script module lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { ReUiRemoteField } from "./remote-form";

	export type RupiahFieldProps = {
		label: string;
		value?: number;
		field?: ReUiRemoteField<any>;
		hint?: string;
		error?: string;
		currencyPrefix?: string;
	} & Omit<HTMLInputAttributes, "type" | "value" | "inputmode">;
</script>

<script lang="ts">
	import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";
	const generatedId = $props.id();

	let {
		label,
		value = $bindable(0),
		field,
		hint = "",
		error = "",
		currencyPrefix = "Rp",
		required = false,
		disabled = false,
		placeholder = "0",
		id = generatedId,
		name = "",
		oninput,
		...inputProps
	}: RupiahFieldProps = $props();

	const messageId = $derived(`${id}-message`);
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(field ? remoteFieldName(field, "text") : name);
	const resolvedValue = $derived.by(() => {
		if (!field) return value;
		const raw = field.value() ?? value;
		const numeric = Number(String(raw ?? "").replace(/\D/g, ""));
		return Number.isFinite(numeric) ? numeric : 0;
	});
	let control = $state<HTMLLabelElement>();
	let input = $state<HTMLInputElement>();

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		value = applyRupiahInput(event);
		field?.set(event.currentTarget.value);
		oninput?.(event);
	}

	function handleOutsidePointer(event: PointerEvent) {
		if (
			document.activeElement === input &&
			control &&
			!control.contains(event.target as Node)
		)
			input.blur();
	}
</script>

<svelte:window onpointerdown={handleOutsidePointer} />

<div class="field" class:error={Boolean(resolvedError)} class:disabled>
	<label class="label" for={id}
		>{label}{#if required}<em aria-hidden="true">*</em>{/if}</label
	>
	<label class="currency-control" for={id} bind:this={control}>
		<span class="prefix" aria-hidden="true">{currencyPrefix}</span>
		<input
			{...inputProps}
			bind:this={input}
			{id}
			type="text"
			inputmode="numeric"
			name={resolvedName || undefined}
			value={formatRupiah(resolvedValue)}
			{placeholder}
			{required}
			{disabled}
			aria-invalid={resolvedError ? "true" : undefined}
			aria-describedby={resolvedError || hint ? messageId : undefined}
			oninput={handleInput}
		/>
	</label>
	{#if resolvedError}<span class="message" id={messageId}>{resolvedError}</span>{:else if hint}<span
			class="hint"
			id={messageId}>{hint}</span
		>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.label {
		color: var(--ui-ink);
		font-size: 12px;
		font-weight: 700;
	}
	.label em {
		margin-left: 3px;
		color: #9b2f28;
		font-style: normal;
	}
	.currency-control {
		height: 40px;
		display: grid;
		grid-template-columns: 42px 1fr;
		overflow: hidden;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		box-shadow: inset 0 1px 0 rgba(25, 41, 65, 0.03);
		cursor: text;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}
	.currency-control:hover {
		border-color: #7e8994;
	}
	.currency-control:focus-within {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.prefix {
		display: grid;
		place-items: center;
		border-right: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
		color: var(--ui-navy);
		font-size: 11px;
		font-weight: 850;
		letter-spacing: 0.02em;
		transition:
			background 150ms ease,
			color 150ms ease;
	}
	.currency-control:focus-within .prefix {
		background: var(--ui-navy);
		color: white;
	}
	.currency-control input {
		min-width: 0;
		width: 100%;
		height: 100%;
		padding: 0 11px;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.currency-control input::placeholder {
		color: #8c9399;
	}
	.disabled .currency-control {
		background: #e9e7df;
		cursor: not-allowed;
	}
	.disabled .prefix {
		background: #dedcd5;
		color: #666b70;
	}
	.disabled {
		color: #666b70;
	}
	.error .currency-control {
		border-color: #a9433d;
		background: #fffafa;
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
	@media (prefers-reduced-motion: reduce) {
		.currency-control,
		.prefix {
			transition: none;
		}
	}
</style>

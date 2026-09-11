<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";

	export type RadioGroupOption = {
		value: string;
		label: string;
		description?: string;
		disabled?: boolean;
	};

	export type RadioGroupProps = {
		label: string;
		name?: string;
		value?: string;
		field?: ReUiRemoteField<string>;
		options?: RadioGroupOption[];
		required?: boolean;
		error?: string;
		hint?: string;
		onchange?: (
			value: string,
			option: RadioGroupOption,
			event: Event,
		) => void;
	};
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	const id = $props.id();
	let {
		label,
		name = id,
		value = $bindable(""),
		field,
		options = [],
		required = false,
		error,
		hint = "",
		onchange,
	}: RadioGroupProps = $props();

	const resolvedValue = $derived(field ? (field.value() ?? value) : value);
	const resolvedError = $derived(
		error !== undefined
			? error
			: (firstRemoteIssue(field)?.message ?? ""),
	);
	const messageId = $derived(
		resolvedError ? `${id}-error` : hint ? `${id}-hint` : undefined,
	);

	function select(option: RadioGroupOption, event: Event) {
		if (field) field.set(option.value);
		else value = option.value;
		onchange?.(option.value, option, event);
	}
</script>

<fieldset
	class="radio-group"
	class:error={Boolean(resolvedError)}
	aria-describedby={messageId}
>
	<legend id={`${id}-label`}>{label}{#if required}<em aria-hidden="true">*</em>{/if}</legend>
	<div
		class="options"
		role="radiogroup"
		aria-labelledby={`${id}-label`}
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={messageId}
	>
		{#each options as option (option.value)}
			<label
				class="option"
				class:selected={option.value === resolvedValue}
				class:disabled={option.disabled}
			>
				<input
					type="radio"
					name={field
						? remoteFieldName(field, "radio", option.value)
						: name}
					value={option.value}
					checked={option.value === resolvedValue}
					disabled={option.disabled}
					{required}
					aria-describedby={messageId}
					onchange={(event) => select(option, event)}
				/>
				<span class="radio" aria-hidden="true"><i></i></span>
				<span class="copy">
					<strong>{option.label}</strong>
					{#if option.description}<small>{option.description}</small>{/if}
				</span>
			</label>
		{/each}
	</div>
	{#if resolvedError}
		<span class="message" id={`${id}-error`} role="alert"
			>{resolvedError}</span
		>
	{:else if hint}
		<span class="hint" id={`${id}-hint`}>{hint}</span>
	{/if}
</fieldset>

<style>
	.radio-group {
		min-width: 0;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 7px;
		border: 0;
		color: var(--ui-ink);
	}
	legend {
		padding: 0;
		font-size: 12px;
		font-weight: 700;
	}
	legend em {
		margin-left: 3px;
		color: var(--ui-danger);
		font-style: normal;
	}
	.options {
		display: grid;
		gap: 6px;
	}
	.option {
		position: relative;
		min-height: 44px;
		padding: 9px 10px;
		display: grid;
		grid-template-columns: 19px minmax(0, 1fr);
		align-items: start;
		gap: 9px;
		border: 1px solid var(--ui-line);
		border-radius: 2px;
		background: #fffefa;
		cursor: pointer;
		transition:
			border-color 150ms ease,
			background 150ms ease,
			padding-left 170ms cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 150ms ease;
	}
	.option:hover {
		border-color: var(--ui-line-strong);
		background: var(--ui-paper);
	}
	.option.selected {
		padding-left: 13px;
		border-color: #b8aa67;
		background: var(--ui-yellow-soft);
		box-shadow: inset 3px 0 var(--ui-yellow);
	}
	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	.radio {
		width: 18px;
		height: 18px;
		margin-top: 1px;
		display: grid;
		place-items: center;
		border: 1px solid #7e8994;
		border-radius: 50%;
		background: #fffefa;
		transition:
			border-color 150ms ease,
			box-shadow 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.radio i {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--ui-navy);
		opacity: 0;
		transform: scale(0.35);
		transition:
			opacity 120ms ease,
			transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.selected .radio {
		border-color: var(--ui-navy);
		box-shadow: 0 0 0 2px #fffefa inset;
	}
	.selected .radio i {
		opacity: 1;
		transform: scale(1);
	}
	input:focus-visible + .radio {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}
	.copy strong,
	.copy small {
		display: block;
	}
	.copy strong {
		font-size: 12px;
		line-height: 1.35;
	}
	.copy small {
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 10px;
		line-height: 1.4;
	}
	.option.disabled {
		opacity: 0.55;
		cursor: not-allowed;
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
		color: var(--ui-danger);
	}
	.error .option {
		border-color: #c7847f;
	}
	@media (prefers-reduced-motion: reduce) {
		.option,
		.radio,
		.radio i {
			transition: none;
		}
	}
</style>

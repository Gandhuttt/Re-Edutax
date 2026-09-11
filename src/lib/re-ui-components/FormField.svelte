<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type FormFieldProps = {
		label: string;
		value?: string;
		field?: ReUiRemoteField<string>;
		hint?: string;
		error?: string;
	} & Omit<HTMLInputAttributes, "value">;
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	const generatedId = $props.id();

	let {
		label,
		value = $bindable(""),
		field,
		hint = "",
		error,
		required = false,
		disabled = false,
		name,
		oninput,
		id = generatedId,
		...inputProps
	}: FormFieldProps = $props();

	const resolvedValue = $derived(field ? (field.value() ?? value) : value);
	const resolvedName = $derived(
		field
			? remoteFieldName(field, String(inputProps.type ?? "text"))
			: name,
	);
	const resolvedError = $derived(
		error !== undefined
			? error
			: (firstRemoteIssue(field)?.message ?? ""),
	);
	const messageId = $derived(`${id}-message`);

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		const nextValue = event.currentTarget.value;
		if (field) field.set(nextValue);
		else value = nextValue;
		oninput?.(event);
	}
</script>

<label for={id}
	><span class="label">{label}{#if required}<em aria-hidden="true">*</em>{/if}</span><input
		{...inputProps}
		{id}
		name={resolvedName}
		value={resolvedValue}
		{required}
		{disabled}
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={resolvedError || hint ? messageId : undefined}
		oninput={handleInput}
	/>{#if resolvedError}<span class="message" id={messageId} role="alert"
			>{resolvedError}</span
		>{:else if hint}<span class="hint" id={messageId}>{hint}</span>{/if}</label
>

<style>
	label {
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
		color: var(--ui-danger);
		font-style: normal;
	}
	input {
		width: 100%;
		height: 40px;
		padding: 0 11px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 13px;
		box-shadow: inset 0 1px 0 rgba(25, 41, 65, 0.03);
	}
	input:hover {
		border-color: #7e8994;
	}
	input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	input:disabled {
		background: #e9e7df;
		color: #666b70;
	}
	.hint,
	.message {
		color: var(--ui-muted);
		font-size: 11px;
		line-height: 1.45;
	}
	.message {
		color: var(--ui-danger);
	}
</style>

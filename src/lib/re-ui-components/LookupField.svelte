<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type LookupFieldProps = {
		label: string;
		value?: string;
		field?: ReUiRemoteField<string>;
		buttonLabel?: string;
		buttonVisible?: boolean;
		hint?: string;
		error?: string;
		onlookup?: () => void;
		onvaluechange?: (value: string) => void;
	} & Omit<HTMLInputAttributes, "value" | "children" | "oninput">;
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	const generatedId = $props.id();

	let {
		label,
		value = $bindable(""),
		field,
		buttonLabel = "Cari",
		buttonVisible = true,
		hint = "",
		error,
		onlookup,
		onvaluechange,
		name,
		id = generatedId,
		class: className,
		...inputProps
	}: LookupFieldProps = $props();

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
		onvaluechange?.(nextValue);
	}
</script>

<label class="lookup-field {className ?? ""}" class:without-button={!buttonVisible} for={id}>
	<span>{label}</span>
	<div>
		<input
			{...inputProps}
			{id}
			name={resolvedName}
			value={resolvedValue}
			aria-invalid={resolvedError ? "true" : undefined}
			aria-describedby={resolvedError || hint ? messageId : undefined}
			oninput={handleInput}
		/>
		{#if buttonVisible}<button type="button" onclick={onlookup}>{buttonLabel}</button>{/if}
	</div>
	{#if resolvedError}
		<small class="message" id={messageId} role="alert">{resolvedError}</small>
	{:else if hint}
		<small class="hint" id={messageId}>{hint}</small>
	{/if}
</label>

<style>
	.lookup-field {
		display: grid;
		gap: 6px;
	}

	.lookup-field > span {
		font-size: 14px;
		font-weight: 700;
	}

	.lookup-field > div {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}

	input {
		min-width: 0;
		width: 100%;
		height: 40px;
		padding: 0 11px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px 0 0 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 16px;
	}

	input:focus {
		border-color: var(--ui-navy);
		outline: 3px solid var(--ui-yellow-soft);
	}

	.without-button input {
		border-radius: 3px;
	}

	button {
		padding: 0 14px;
		border: 1px solid var(--ui-navy);
		border-radius: 0 3px 3px 0;
		background: var(--ui-navy);
		color: white;
		font: inherit;
		font-size: 13px;
		font-weight: 800;
		cursor: pointer;
		transition:
			background 140ms ease,
			color 140ms ease;
	}

	button:hover {
		background: var(--ui-yellow);
		color: var(--ui-navy-strong);
	}

	button:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}

	.hint,
	.message {
		font-size: 12px;
		line-height: 1.45;
	}

	.hint {
		color: var(--ui-muted);
	}

	.message {
		color: var(--ui-danger);
	}

	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>

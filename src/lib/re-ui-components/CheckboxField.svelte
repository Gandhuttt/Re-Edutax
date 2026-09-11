<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type CheckboxFieldProps = {
		label: string;
		checked?: boolean;
		field?: ReUiRemoteField<boolean>;
		description?: string;
		error?: string;
		compact?: boolean;
	} & Omit<HTMLInputAttributes, "type" | "checked">;
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	const generatedId = $props.id();

	let {
		label,
		checked = $bindable(false),
		field,
		description = "",
		error,
		disabled = false,
		compact = false,
		name,
		onchange,
		id = generatedId,
		...inputProps
	}: CheckboxFieldProps = $props();

	const resolvedChecked = $derived(
		field ? Boolean(field.value() ?? checked) : checked,
	);
	const resolvedName = $derived(
		field ? remoteFieldName(field, "checkbox") : name,
	);
	const resolvedError = $derived(
		error !== undefined
			? error
			: (firstRemoteIssue(field)?.message ?? ""),
	);
	const descriptionId = $derived(`${id}-description`);
	const messageId = $derived(`${id}-message`);
	const describedBy = $derived(
		[
			description ? descriptionId : "",
			resolvedError ? messageId : "",
		]
			.filter(Boolean)
			.join(" ") || undefined,
	);

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		const nextChecked = event.currentTarget.checked;
		if (field) field.set(nextChecked);
		else checked = nextChecked;
		onchange?.(event);
	}
</script>

<label
	class:checked={resolvedChecked}
	class:disabled
	class:compact
	class:error={Boolean(resolvedError)}
	for={id}
>
	<input
		{...inputProps}
		{id}
		type="checkbox"
		name={resolvedName}
		checked={resolvedChecked}
		{disabled}
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={describedBy}
		onchange={handleChange}
	/>
	<span class="box" aria-hidden="true"><i>✓</i></span>
	<span class="copy"
		><strong>{label}</strong>{#if description}<small id={descriptionId}
				>{description}</small
			>{/if}</span
	>
	{#if resolvedError}
		<span class="message" id={messageId} role="alert">{resolvedError}</span>
	{/if}
</label>

<style>
	label {
		position: relative;
		min-height: 43px;
		padding: 8px 10px;
		display: grid;
		grid-template-columns: 19px 1fr;
		align-items: start;
		gap: 9px;
		border: 1px solid var(--ui-line);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-ink);
		cursor: pointer;
		transition:
			border-color 150ms ease,
			background 150ms ease,
			padding-left 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	label:hover {
		border-color: #8d969e;
		background: var(--ui-paper);
	}
	label.checked {
		padding-left: 13px;
		border-color: #b8aa67;
		background: var(--ui-yellow-soft);
	}
	label.compact {
		min-height: 34px;
		padding-top: 6px;
		padding-bottom: 6px;
		border-color: transparent;
		background: transparent;
	}
	label.compact:hover {
		border-color: var(--ui-line);
		background: var(--ui-paper-deep);
	}
	label.compact.checked {
		border-color: #d7c985;
		background: var(--ui-yellow-soft);
	}
	label.error {
		border-color: #c7847f;
	}
	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}
	.box {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		margin-top: 1px;
		border: 1px solid #7e8994;
		border-radius: 2px;
		background: #fffefa;
		color: white;
		box-shadow: inset 0 0 0 3px #fffefa;
		transition:
			border-color 150ms ease,
			background 170ms cubic-bezier(0.2, 0.8, 0.2, 1),
			box-shadow 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.box i {
		font-size: 12px;
		font-style: normal;
		font-weight: 900;
		line-height: 1;
		opacity: 0;
		transform: translateY(3px);
		transition:
			opacity 120ms ease,
			transform 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.checked .box {
		border-color: var(--ui-navy);
		background: var(--ui-navy);
		box-shadow: none;
	}
	.checked .box i {
		opacity: 1;
		transform: translateY(0);
	}
	input:focus-visible + .box {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}
	.copy strong,
	.copy small {
		display: block;
	}
	.copy strong {
		font-size: 11px;
	}
	.copy small {
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 9px;
		line-height: 1.35;
	}
	.message {
		grid-column: 1 / -1;
		color: var(--ui-danger);
		font-size: 10px;
		line-height: 1.4;
	}
	.disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	@media (prefers-reduced-motion: reduce) {
		label,
		.box,
		.box i {
			transition: none;
		}
	}
</style>

<script module lang="ts">
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { ReUiRemoteField } from "./remote-form";

	export type TextAreaFieldProps = Omit<
		HTMLTextareaAttributes,
		"value" | "children" | "rows" | "maxlength" | "name" | "placeholder"
	> & {
		label: string;
		value?: string;
		field?: ReUiRemoteField<any>;
		name?: string;
		rows?: number;
		maxLength?: number;
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		showCount?: boolean;
		resize?: "none" | "vertical" | "horizontal" | "both";
	};
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	let {
		label,
		value = $bindable(""),
		field,
		name = "",
		rows = 4,
		maxLength,
		placeholder = "",
		hint = "",
		error = "",
		required = false,
		disabled = false,
		showCount = false,
		resize = "vertical",
		...textareaAttributes
	}: TextAreaFieldProps = $props();

	const id = $props.id();
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(field ? remoteFieldName(field, "text") : name);
	const resolvedValue = $derived(String(field?.value() ?? value ?? ""));
	const messageId = $derived(
		resolvedError ? `${id}-error` : hint ? `${id}-hint` : undefined,
	);

	function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
		const next = event.currentTarget.value;
		value = next;
		field?.set(next);
		textareaAttributes.oninput?.(event);
	}
</script>

<div class="field" class:error={Boolean(resolvedError)} class:disabled>
	<label for={`${id}-textarea`}>
		{label}{#if required}<em aria-hidden="true">*</em>{/if}
	</label>
	<textarea
		{...textareaAttributes}
		id={`${id}-textarea`}
		name={resolvedName || undefined}
		{rows}
		maxlength={maxLength}
		{placeholder}
		{required}
		{disabled}
		aria-invalid={resolvedError ? "true" : undefined}
		aria-describedby={messageId}
		style:resize
		value={resolvedValue}
		oninput={handleInput}
	></textarea>
	{#if resolvedError || hint || showCount}
		<div class="field-meta">
			{#if resolvedError}
				<span class="message" id={`${id}-error`}>{resolvedError}</span>
			{:else if hint}
				<span class="hint" id={`${id}-hint`}>{hint}</span>
			{:else}
				<span></span>
			{/if}
			{#if showCount}
				<span class="count" aria-live="polite">
					{resolvedValue.length}{#if maxLength} / {maxLength}{/if}
				</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 6px;
		align-content: start;
		color: var(--ui-ink);
	}
	label {
		font-size: 12px;
		font-weight: 700;
	}
	label em {
		margin-left: 3px;
		color: var(--ui-danger);
		font-style: normal;
	}
	textarea {
		width: 100%;
		min-height: 92px;
		padding: 9px 11px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 13px;
		line-height: 1.5;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}
	textarea::placeholder {
		color: var(--ui-muted);
		opacity: 0.85;
	}
	textarea:hover:not(:disabled) {
		border-color: #7e8994;
	}
	textarea:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	textarea:disabled {
		background: var(--ui-paper-deep);
		color: var(--ui-muted);
		cursor: not-allowed;
	}
	.field-meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}
	.hint,
	.message,
	.count {
		font-size: 11px;
		line-height: 1.4;
	}
	.hint,
	.count {
		color: var(--ui-muted);
	}
	.message {
		color: var(--ui-danger);
	}
	.count {
		flex: 0 0 auto;
		font-family: var(--ui-font-mono);
		font-size: 10px;
	}
	.error textarea {
		border-color: #a9433d;
		background: #fffafa;
	}
	.disabled label {
		color: var(--ui-muted);
	}
	@media (prefers-reduced-motion: reduce) {
		textarea {
			transition: none;
		}
	}
</style>

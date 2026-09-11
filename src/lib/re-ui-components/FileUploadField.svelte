<script module lang="ts">
	import type { ReUiRemoteField } from "./remote-form";

	export type FileUploadFieldProps = {
		label: string;
		field?: ReUiRemoteField<any>;
		name?: string;
		hint?: string;
		error?: string;
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		required?: boolean;
		buttonLabel?: string;
		files?: FileList;
		onchange?: (files: FileList, event: Event) => void;
	};
</script>

<script lang="ts">
	import { firstRemoteIssue, remoteFieldName } from "./remote-form";

	let {
		label,
		field,
		name = "",
		hint = "",
		error = "",
		accept,
		multiple = false,
		disabled = false,
		required = false,
		buttonLabel = "Pilih berkas",
		files = $bindable(),
		onchange,
	}: FileUploadFieldProps = $props();

	const id = $props.id();
	const resolvedError = $derived(error || firstRemoteIssue(field)?.message || "");
	const resolvedName = $derived(
		field
			? remoteFieldName(field, multiple ? "file multiple" : "file")
			: name,
	);
	const summary = $derived.by(() => {
		if (!files?.length) return "Belum ada berkas dipilih";
		if (files.length === 1) return files[0]?.name ?? "1 berkas dipilih";
		return `${files.length} berkas dipilih`;
	});

	function handleChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (!input.files) return;
		field?.set(multiple ? Array.from(input.files) : input.files[0]);
		onchange?.(input.files, event);
	}
</script>

<div class="field" class:disabled class:error={Boolean(resolvedError)}>
	<span class="field-label" id={`${id}-label`}>
		{label}{#if required}<em aria-hidden="true">*</em>{/if}
	</span>
	<label class="upload" for={`${id}-input`}>
		<input
			id={`${id}-input`}
			type="file"
			name={resolvedName || undefined}
			{accept}
			{multiple}
			{disabled}
			{required}
			aria-labelledby={`${id}-label ${id}-button`}
			aria-invalid={resolvedError ? "true" : undefined}
			aria-describedby={resolvedError
				? `${id}-error`
				: hint
					? `${id}-hint`
					: `${id}-summary`}
			bind:files
			onchange={handleChange}
		/>
		<span class="button" id={`${id}-button`} aria-hidden="true">
			<span class="upload-icon">↑</span>{buttonLabel}
		</span>
		<span class="summary" id={`${id}-summary`}>{summary}</span>
	</label>
	{#if resolvedError}
		<span class="message" id={`${id}-error`}>{resolvedError}</span>
	{:else if hint}
		<span class="hint" id={`${id}-hint`}>{hint}</span>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 6px;
		align-content: start;
		color: var(--ui-ink);
	}
	.field-label {
		font-size: 12px;
		font-weight: 700;
	}
	.field-label em {
		margin-left: 3px;
		color: var(--ui-danger);
		font-style: normal;
	}
	.upload {
		position: relative;
		min-height: 42px;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		overflow: hidden;
		cursor: pointer;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}
	.upload:hover {
		border-color: #7e8994;
		background: var(--ui-paper);
	}
	input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	.button {
		align-self: stretch;
		padding: 0 12px;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		border-right: 1px solid var(--ui-line-strong);
		background: var(--ui-navy);
		color: white;
		font-size: 11px;
		font-weight: 800;
		white-space: nowrap;
		transition: background 140ms ease;
	}
	.upload:hover .button {
		background: var(--ui-navy-strong);
	}
	.upload-icon {
		color: var(--ui-yellow);
		font-size: 17px;
		font-weight: 900;
		line-height: 1;
	}
	.summary {
		min-width: 0;
		padding: 0 11px;
		overflow: hidden;
		color: var(--ui-muted);
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	input:focus-visible ~ .button {
		box-shadow: inset 0 0 0 3px var(--ui-yellow);
	}
	.upload:has(input:focus-visible) {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.hint {
		color: var(--ui-muted);
		font-size: 11px;
		line-height: 1.4;
	}
	.message {
		color: var(--ui-danger);
		font-size: 11px;
		line-height: 1.4;
	}
	.error .upload {
		border-color: var(--ui-danger);
		background: var(--ui-danger-surface);
	}
	.disabled {
		color: var(--ui-muted);
	}
	.disabled .upload {
		background: var(--ui-paper-deep);
		opacity: 0.7;
		cursor: not-allowed;
	}
	.disabled .button {
		background: #526273;
	}
	@media (max-width: 480px) {
		.upload {
			grid-template-columns: 1fr;
		}
		.button {
			min-height: 38px;
			justify-content: center;
			border-right: 0;
		}
		.summary {
			min-height: 34px;
			display: flex;
			align-items: center;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.upload,
		.button {
			transition: none;
		}
	}
</style>

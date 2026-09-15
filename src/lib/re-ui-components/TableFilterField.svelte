<script module lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	export type TableFilterFieldProps = {
		label: string;
		value?: string | number;
	} & Omit<HTMLInputAttributes, "value" | "children">;
</script>

<script lang="ts">
	const generatedId = $props.id();

	let {
		label,
		value = $bindable(""),
		type = "text",
		id = generatedId,
		class: className,
		...props
	}: TableFilterFieldProps = $props();
</script>

<label class="filter-field" for={id}>
	<span>{label}</span>
	<input {...props} {id} {type} bind:value class={className} />
</label>

<style>
	.filter-field {
		display: block;
		min-width: 88px;
	}
	.filter-field > span {
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
	input {
		width: 100%;
		height: 30px;
		padding: 5px 8px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: normal;
		text-transform: none;
		transition:
			border-color 130ms ease,
			box-shadow 130ms ease;
	}
	input::placeholder {
		color: #7a838a;
		opacity: 1;
	}
	input:hover {
		border-color: #858e96;
	}
	input:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 1px;
		border-color: var(--ui-navy);
	}
	input:disabled {
		background: #e9e7df;
		color: var(--ui-muted);
		cursor: not-allowed;
	}
	@media (prefers-reduced-motion: reduce) {
		input {
			transition: none;
		}
	}
</style>

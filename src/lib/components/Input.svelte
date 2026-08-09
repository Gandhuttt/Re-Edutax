<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		value = $bindable(),
		group = $bindable(),
		checked = $bindable(),
		type,
		...restProps
	}: HTMLInputAttributes = $props();
</script>

{#if type === 'checkbox'}
	<input type="checkbox" bind:checked {...restProps} />
{:else if type === 'radio'}
	<input type="radio" {value} checked={Boolean(checked)} {...restProps} />
{:else}
	<input {type} bind:value {...restProps} />
{/if}

<style>
	input[type='text'],
	input[type='date'],
	input[type='number'] {
		height: 2.5rem;
		width: 100%;
		border-color: var(--color-input-secondary);
		border-radius: 4px;
		background: var(--color-input-primary);
		transition:
			background 100ms linear,
			border-color 100ms linear;
		appearance: textfield;
		&:hover {
			border-color: hsl(from var(--color-input-secondary) h s calc(l - 20));
		}
		&:disabled, &:read-only {
			background: hsl(from var(--color-input-primary) h s calc(l - 10));
		}
		&:disabled:hover, &:read-only:hover {
			background: hsl(from var(--color-input-primary) h s calc(l - 20));
		}
		&:focus {
			border-color: hsl(from var(--color-input-secondary) h s calc(l - 50));
		}
	}

	input[type='file'] {
		display: none;
	}

	input[type='checkbox'] {
		border-radius: 4px;
		accent-color: rebeccapurple;
	}

	input[type='checkbox'],
	input[type='radio'] {
		&:hover {
			border-color: hsl(from var(--color-input-secondary) h s calc(l - 50));
		}
		&:disabled {
			background: hsl(from var(--color-input-primary) h s calc(l - 10));
		}
		&:disabled:hover {
			background: hsl(from var(--color-input-primary) h s calc(l - 20));
		}
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>

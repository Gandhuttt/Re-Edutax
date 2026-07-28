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
	input[type='date'] {
		height: 2.5rem;
		width: 100%;
		border-color: var(--color-input-secondary);
		border-radius: 4px;
		background: var(--color-input-primary);
		transition:
			background 100ms linear,
			border-color 100ms linear;
	}

	input[type='text']:hover,
	input[type='date']:hover {
		border-color: hsl(from var(--color-input-secondary) h s calc(l - 20));
	}

	input[type='text']:disabled,
	input[type='date']:disabled {
		background: hsl(from var(--color-input-primary) h s calc(l - 10));
	}

	input[type='text']:disabled:hover,
	input[type='date']:disabled:hover {
		background: hsl(from var(--color-input-primary) h s calc(l - 20));
	}

	input[type='text']:focus,
	input[type='date']:focus {
		border-color: hsl(from var(--color-input-secondary) h s calc(l - 50));
	}

	input[type='file'] {
		display: none;
	}

	input[type='checkbox'] {
		border-radius: 4px;
		accent-color: rebeccapurple;
	}
</style>

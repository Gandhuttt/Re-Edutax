<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props {
        children: Snippet;
    }
    let { children, value = $bindable(), ...restProps }: Props & HTMLInputAttributes = $props()
</script>

<div>
    <span>{@render children()}</span>
    <input bind:value {...restProps}/>
</div>

<style>
    :root{
        --radius-width: 4px;
    }
    
    div {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
    }

    div {
        border-width: 1px;
        border-color: var(--color-input-secondary);
        border-radius: var(--radius-width);
        &:hover {
            border-color: hsl(from var(--color-input-secondary) h s calc(l - 20));
        }
        &:focus {
			border-color: hsl(from var(--color-input-secondary) h s calc(l - 50));
		}
    }

    span {
        display: flex;
        align-items: center;
        background-color: var(--color-disabled);
    }

    span {
        border-start-start-radius: var(--radius-width);
        border-end-start-radius: var(--radius-width);
        border-right: 1px solid;
        border-color: var(--color-input-secondary);
    }

    input {
        border-start-end-radius: var(--radius-width);
        border-end-end-radius: var(--radius-width);
    }
    
    span, input {
        height: 2.5rem;
        padding-inline: .75rem;
    }
    
    input, div, span {
        transition:
            background 100ms linear,
            border-color 100ms linear;
    }
    
    input[type='text'],
	input[type='date'],
	input[type='number'] {
        width: 100%;
        background: var(--color-input-primary);
        border: none;
		appearance: textfield;
		&:disabled, &:read-only {
			background: hsl(from var(--color-input-primary) h s calc(l - 10));
		}
		&:disabled:hover, &:read-only:hover {
			background: hsl(from var(--color-input-primary) h s calc(l - 20));
		}
	}
    input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
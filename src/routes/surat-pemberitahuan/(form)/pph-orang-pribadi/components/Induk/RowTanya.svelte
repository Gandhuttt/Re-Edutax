<script lang="ts">
    import { FormField, InlineAlert, RupiahField } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { Hint } from "./hints";

    interface Props {
        nomor: string;
        label: string;
        name: string;
        answer: boolean | undefined;
        hint?: Hint;
        amount?: 'none' | 'derived' | 'input';
        amountValue?: number;
        amountWhen?: boolean;
        disabled?: boolean;
        disabledHint?: string;
        readonly?: boolean;
    }

    let {
        nomor,
        label,
        name,
        answer = $bindable(),
        hint,
        amount = 'none',
        amountValue = $bindable(0),
        amountWhen,
        disabled = false,
        disabledHint,
        readonly = false
    }: Props = $props();

    let showAmount = $derived(
        amount !== 'none' && (amountWhen === undefined || answer === amountWhen)
    );
    let chip = $derived(
        disabled ? disabledHint : answer === undefined || !hint ? '' : answer ? hint.ya : hint.tidak
    );
</script>

<tr>
    <td class="code"><strong>{nomor}</strong></td>
    <td>{label}</td>
    <td>
        <div class="boolean-options" role="radiogroup" aria-label={label}>
            <label class:selected={answer === false}>
                <input type="radio" {name} value={false} bind:group={answer} disabled={readonly || disabled} />
                <span>Tidak</span>
            </label>
            <label class:selected={answer === true}>
                <input type="radio" {name} value={true} bind:group={answer} disabled={readonly || disabled} />
                <span>Ya</span>
            </label>
        </div>
    </td>
    <td class="amount-cell">
        {#if showAmount}
            {#if amount === 'input'}
                <RupiahField
                    label={`Jumlah ${nomor}`}
                    bind:value={amountValue}
                    disabled={readonly || disabled}
                />
            {:else}
                <FormField
                    label={`Jumlah ${nomor}`}
                    value={formatRupiahDerived(amountValue)}
                    disabled
                />
            {/if}
        {/if}
    </td>
    <td>
        {#if chip}
            <InlineAlert compact message={chip} />
        {/if}
    </td>
</tr>

<style>
    .code {
        white-space: nowrap;
    }
    .boolean-options {
        min-width: 10rem;
        display: flex;
        gap: 6px;
    }
    .boolean-options label {
        min-height: 34px;
        padding: 7px 9px;
        display: flex;
        align-items: center;
        gap: 7px;
        border: 1px solid var(--ui-line);
        border-radius: 2px;
        background: #fffefa;
        cursor: pointer;
    }
    .boolean-options label.selected {
        border-color: #b8aa67;
        background: var(--ui-yellow-soft);
    }
    .boolean-options label:has(input:disabled) {
        cursor: not-allowed;
        opacity: 0.65;
    }
    .amount-cell {
        min-width: 13rem;
    }
    .amount-cell :global(.field > .label),
    .amount-cell :global(label > .label) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
    }
</style>

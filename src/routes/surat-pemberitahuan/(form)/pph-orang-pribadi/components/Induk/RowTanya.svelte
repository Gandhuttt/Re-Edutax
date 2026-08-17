<script lang="ts">
    import Alert from "$lib/components/Alert.svelte";
    import Input from "$lib/components/Input.svelte";
    import RadioPair from "$lib/components/RadioPair.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { Hint } from "./hints";

    // One Ya/Tidak question row, with its hint chip and optional amount cell.
    //
    // The amount cell has three distinct states on the real form, and all three
    // are needed: present and enabled, present but disabled (grey), and absent
    // from the DOM entirely. 10d = Ya enables its input; 10a = Tidak removes its
    // input rather than disabling it. See STATES.md / NOTES.md.
    interface Props {
        nomor: string;
        label: string;
        name: string;
        answer: boolean | undefined;
        // Omitted on rows that are permanently disabled: those never show an
        // answer-dependent chip, only `disabledHint`.
        hint?: Hint;
        // 'none' omits the cell, 'derived' shows it disabled (a computed figure),
        // 'input' shows an editable rupiah field.
        amount?: 'none' | 'derived' | 'input';
        amountValue?: number;
        // When set, the amount cell only appears for this answer. Used by 10a
        // (input absent on Tidak) and 10d (input only on Ya).
        amountWhen?: boolean;
        // A disabled row can still assert an answer through its hint, so the chip
        // text is passed separately rather than derived from `answer`.
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
    <td class="tw:w-10"><span>{nomor}</span></td>
    <td class="tw:w-[40rem]"><span>{label}</span></td>
    <td class="tw:w-[10rem]">
        <RadioPair {name} bind:group={answer} disabled={readonly || disabled} />
    </td>
    <td class="tw:w-[20rem]">
        {#if showAmount}
            {#if amount === 'input'}
                <Input
                    class={"tw:text-end"}
                    type={"text"}
                    value={formatRupiah(amountValue)}
                    oninput={(e: Event) => (amountValue = applyRupiahInput(e))}
                    disabled={readonly || disabled}
                />
            {:else}
                <Input class={"tw:text-end"} type={"text"} value={formatRupiah(amountValue)} disabled />
            {/if}
        {/if}
    </td>
    <td class="tw:w-[30rem]">
        {#if chip}
            <Alert bg={"var(--color-primary)"}>
                {#snippet head()}
                    <span>i</span>
                {/snippet}
                {#snippet body()}
                    <span>{chip}</span>
                {/snippet}
            </Alert>
        {/if}
    </td>
</tr>

<style>
    tr {
        border: none;
        &:nth-child(even) {
            background-color: #F9F6EE;
        }
    }
    td {
        padding: .25rem .5rem;
    }
    span {
        font-size: .8rem;
    }
</style>

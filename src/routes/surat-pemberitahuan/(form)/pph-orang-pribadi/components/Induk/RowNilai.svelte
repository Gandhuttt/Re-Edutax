<script lang="ts">
    import { FormField, RupiahField } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";

    interface Props {
        nomor: string;
        label: string;
        value: number;
        editable?: boolean;
        readonly?: boolean;
    }

    let { nomor, label, value = $bindable(), editable = false, readonly = false }: Props = $props();
</script>

<tr>
    <td class="code"><strong>{nomor}</strong></td>
    <td>{label}</td>
    <td></td>
    <td class="amount-cell">
        {#if editable}
            <RupiahField label={`Jumlah ${nomor}`} bind:value disabled={readonly} />
        {:else}
            <FormField label={`Jumlah ${nomor}`} value={formatRupiahDerived(value)} disabled />
        {/if}
    </td>
    <td></td>
</tr>

<style>
    .code {
        white-space: nowrap;
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

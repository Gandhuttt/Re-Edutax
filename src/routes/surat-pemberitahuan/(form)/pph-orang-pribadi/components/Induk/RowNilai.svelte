<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";

    // An amount row with no question attached: either a figure the form computes
    // (rows 2, 4, 6, 7, 9, 11a, 11c, 12b) or one the taxpayer types (10b, 10c).
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
    <td class="tw:w-10"><span>{nomor}</span></td>
    <td class="tw:w-[40rem]"><span>{label}</span></td>
    <td class="tw:w-[10rem]"></td>
    <td class="tw:w-[20rem]">
        {#if editable}
            <Input
                class={"tw:text-end"}
                type={"text"}
                value={formatRupiah(value)}
                oninput={(e: Event) => (value = applyRupiahInput(e))}
                disabled={readonly}
            />
        {:else}
            <Input class={"tw:text-end"} type={"text"} value={formatRupiah(value)} disabled />
        {/if}
    </td>
    <td class="tw:w-[30rem]"></td>
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

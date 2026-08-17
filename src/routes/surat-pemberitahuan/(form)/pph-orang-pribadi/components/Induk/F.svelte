<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { getContext } from "svelte";
    import type { hitungInduk } from "./hitungPphOrangPribadi";

    // Only applies when the SPT status is Pembetulan. On the real form this is a
    // section of the Induk rather than a separate flow, unlike the Badan side.
    interface Props {
        computed: ReturnType<typeof hitungInduk>;
        // Read from the SPT being amended, never typed.
        f12a: number;
        f12aGantiSptSebelumnya: boolean | undefined;
        readonly?: boolean;
    }

    let { computed, f12a, f12aGantiSptSebelumnya = $bindable(), readonly = false }: Props = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>12.a</span></td>
                <td class="tw:w-[40rem]"><span>PPh kurang/lebih bayar pada SPT yang dibetulkan</span></td>
                <td class="tw:w-[10rem]">
                    <Label for={getContext("id")} class="tw:flex! tw:items-center tw:gap-1">
                        <input type="checkbox" bind:checked={f12aGantiSptSebelumnya} disabled={readonly}>
                        <span>Ganti SPT sebelumnya</span>
                    </Label>
                </td>
                <td class="tw:w-[20rem]">
                    <Input class={"tw:text-end"} type={"text"} value={f12a.toLocaleString('id-ID')} disabled />
                </td>
                <td class="tw:w-[30rem]"></td>
            </tr>
            <RowNilai
                nomor={"12.b"}
                label={"PPh kurang/lebih bayar karena pembetulan (11a-12a)"}
                value={computed.n12b}
            />
        {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) { background-color: #F9F6EE; }
    }
    td { padding: .25rem .5rem; }
    span { font-size: .8rem; }
</style>

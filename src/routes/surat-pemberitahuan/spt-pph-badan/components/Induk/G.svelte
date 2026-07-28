<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
	import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import { getContext } from "svelte";

    let G20 = $state(false);
</script>

<div class="tw:p-5">
    <Table class={"tw:min-w-full"}>
        {#snippet head()}
            <tr class="tw:hidden">
                <td>
                    <Input hidden/>
                </td>
            </tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>20.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah Wajib Pajak merupakan Wajib Pajak tertentu yang harus menyampaikan Laporan Perhitungan Angsuran PPh Pasal 25? *</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G20" value={false} bind:group={G20} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G20" value={true} bind:group={G20} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled/></td>
            </tr>
        {/snippet}
    </Table>
</div>

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
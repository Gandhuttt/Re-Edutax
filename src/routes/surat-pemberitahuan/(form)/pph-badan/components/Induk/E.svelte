<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import { getContext } from "svelte";

    let E13 = $state(false);
    let E16 = $state(false);
</script>

<div class="tw:p-5">
    <Table class={"tw:min-w-full"}>

        <!-- Hidden field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>13.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah terdapat kredit pajak yang dibayarkan di luar negeri dan/atau dipotong/pungut oleh pihak lain?</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E13" value={false} bind:group={E13} defaultChecked>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E13" value={true} bind:group={E13}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
            </tr>
            <tr>
                <td><span>14.</span></td>
                <td><span>Angsuran PPh Pasal 25</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled/></td>
            </tr>
            <tr>
                <td><span>15.</span></td>
                <td><span>Surat Tagihan Pajak PPh Pasal 25 (hanya pokok pajak)</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={0}/></td>
            </tr>
            <tr>
                <td><span>16.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan PPh Badan? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E16" value={false} bind:group={E16} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E16" value={true} bind:group={E16} required>
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
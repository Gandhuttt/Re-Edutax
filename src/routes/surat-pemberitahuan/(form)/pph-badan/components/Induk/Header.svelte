<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";

    // const {headerData}: {headerData: NonNullable<(NonNullable<Awaited<ReturnType<typeof getKonsep>>>)['data']>['informasiLaporanKeuangan']} = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
        {#snippet head()}
            <tr class="tw:hidden">
                <td>
                    <Input hidden/>
                </td>
            </tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td>
                    <Label class="tw:w-full">
                        <span>Tahun Pajak/Bagian Tahun Pajak</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"2025"} disabled />
                </td>
            </tr>
            <tr>
                <td>
                    <Label class="tw:w-full">
                        <span class="tw:mr-10">Status</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"NORMAL"} disabled />
                </td>
            </tr>
            <tr>
                <td>
                    <Label>
                        <span>Periode Pembukuan</span>
                    </Label>
                </td>
                <td>
                    <div class="tw:flex tw:flex-row tw:gap-2">
                        <Input type={"text"} value={"1"} disabled />
                        <Input type={"text"} value={"12"} disabled />
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <Label>
                        <span>Metode Pembukuan/Pencatatan</span>
                    </Label>
                </td>
                <td>
                    <Select>
                        <option value=0>Akuntansi Berbasis Kas</option>
                        <option value=1>Akuntansi Berbasi Akrual</option>
                    </Select>
                </td>
            </tr>
        {/snippet}
    </Table>
    <div class="tw:flex tw:flex-row tw:my-2">
        <div class="tw:mr-5">
            <button class="btn btn-success" name="action" value="Post">Prefill SPT</button>
        </div>
        <p class="tw:hidden">Posting belum pernah dilakukan</p>
    </div>
</div>

<style>
    tr {
        border: none;
    }
    td {
        padding: .25rem 0;
    }
    span {
        font-size: .875rem;
    }
</style>

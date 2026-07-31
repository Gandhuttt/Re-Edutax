<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";

    // const {headerData}: {headerData: NonNullable<(NonNullable<Awaited<ReturnType<typeof getKonsep>>>)['data']>['informasiLaporanKeuangan']} = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >

        <!-- Hidden input field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td><span>Tahun Pajak/Bagian Tahun Pajak</span></td>
                <td><Input type={"text"} value={"2025"} readonly /></td>
            </tr>
            <tr>
                <td><span>Status</span></td>
                <td><Input type={"text"} value={"NORMAL"} readonly /></td>
            </tr>
            <tr>
                <td><span>Periode Pembukuan</span></td>
                <td>
                    <div class="tw:flex tw:flex-row tw:gap-2">
                        <Input type={"text"} value={"1"} readonly />
                        <Input type={"text"} value={"12"} readonly />
                    </div>
                </td>
            </tr>
            <tr>
                <td><span>Metode Pembukuan/Pencatatan</span></td>
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

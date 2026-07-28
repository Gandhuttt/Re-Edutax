<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full" >
        {#snippet head()}
            <tr class="tw:hidden">
                <td>
                    <Input hidden/>
                </td>
            </tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>1.</span></td>
                <td class="tw:w-[35rem]">
                    <Label class="tw:w-full">
                        <span>NPWP</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"2025"} disabled />
                </td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td>
                    <Label class="tw:w-full">
                        <span class="tw:mr-10">Nama</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"NORMAL"} disabled />
                </td>
            </tr>
            <tr>
                <td><span>3.</span></td>
                <td>
                    <Label>
                        <span>Alamat Email</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"1"} disabled />
                </td>
            </tr>
            <tr>
                <td><span>4.</span></td>
                <td>
                    <Label>
                        <span>Nomor Telepon</span>
                    </Label>
                </td>
                <td>
                    <Input type={"text"} value={"1"} disabled />
                </td>
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
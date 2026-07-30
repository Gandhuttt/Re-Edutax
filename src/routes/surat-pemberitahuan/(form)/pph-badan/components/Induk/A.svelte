<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full" >

        <!-- Hidden input field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>1.</span></td>
                <td class="tw:w-[35rem]"><span>NPWP</span></td>
                <td><Input type={"text"} value={"2025"} disabled /></td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td><span class="tw:mr-10">Nama</span></td>
                <td><Input type={"text"} value={"NORMAL"} disabled /></td>
            </tr>
            <tr>
                <td><span>3.</span></td>
                <td><span>Alamat Email</span></td>
                <td><Input type={"text"} value={"1"} disabled /></td>
            </tr>
            <tr>
                <td><span>4.</span></td>
                <td><span>Nomor Telepon</span></td>
                <td><Input type={"text"} value={"1"} disabled /></td>
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
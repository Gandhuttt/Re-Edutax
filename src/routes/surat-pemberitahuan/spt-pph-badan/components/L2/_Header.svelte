<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Card from "$lib/components/Card.svelte";
</script>

<Card>
    {#snippet head()}
        <span class="tw:text-xl!">HEADER</span>
    {/snippet}
    {#snippet body()}
        <div>
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
                        <td class="tw:w-[20rem]">
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
                                <span class="tw:mr-10">Nomor Identitas WP</span>
                            </Label>
                        </td>
                        <td>
                            <Input type={"text"} value={"00000000000000000"} disabled />
                        </td>
                    </tr>
                {/snippet}
            </Table>
        </div>
    {/snippet}
</Card>

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
<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";

    interface Props {
        identitas: { npwp: string; nama: string; email: string; nomorTelepon: string | null } | null;
        a7StatusKewajibanSuamiIstri: string;
        a8NpwpSuamiIstri: string;
        readonly?: boolean;
    }

    let {
        identitas,
        a7StatusKewajibanSuamiIstri = $bindable(),
        a8NpwpSuamiIstri = $bindable(),
        readonly = false
    }: Props = $props();

    // Two options only, so the unset state carries the meaning "neither".
    const statusOptions = [
        { value: '', label: '' },
        { value: 'ph', label: 'Pisah Harta (PH)' },
        { value: 'mt', label: 'Memilih Terpisah (MT)' }
    ];
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <!-- Rows 1 to 6 are prefilled and read-only, sourced from the wajib
                 pajak record rather than stored on the SPT. -->
            <tr>
                <td class="tw:w-10"><span>1.</span></td>
                <td class="tw:w-[25rem]"><span>NIK/NPWP</span></td>
                <td><Input type={"text"} value={identitas?.npwp ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td><span>Nama</span></td>
                <td><Input type={"text"} value={identitas?.nama ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>3.</span></td>
                <td><span>Jenis ID</span></td>
                <td><Input type={"text"} value={"KTP"} disabled /></td>
            </tr>
            <tr>
                <td><span>4.</span></td>
                <td><span>No. ID</span></td>
                <td><Input type={"text"} value={identitas?.npwp ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>5.</span></td>
                <td><span>No. Telepon</span></td>
                <td><Input type={"text"} value={identitas?.nomorTelepon ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>6.</span></td>
                <td><span>Email</span></td>
                <td><Input type={"text"} value={identitas?.email ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>7.</span></td>
                <td><span>Status Kewajiban Perpajakan Suami dan Istri (isi jika status adalah PH/MT)</span></td>
                <td>
                    <Select bind:value={a7StatusKewajibanSuamiIstri} disabled={readonly}>
                        {#each statusOptions as status}
                            <option class="tw:text-black" value={status.value}>{status.label}</option>
                        {/each}
                    </Select>
                </td>
            </tr>
            <tr>
                <td><span>8.</span></td>
                <td><span>NIK/NPWP Suami/Istri</span></td>
                <td>
                    <!-- Coretax derives this from linked family-member data and never
                         lets it be typed in, even once row 7 is set. -->
                    <Input type={"text"} bind:value={a8NpwpSuamiIstri} disabled />
                </td>
            </tr>
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

<script lang="ts">
	import Input from "$lib/components/Input.svelte";
    import Table from "$lib/components/Table.svelte";
	import type { SptPpnBlob } from "$lib/schemas/surat-pemberitahuan/spt-ppn";

    let { sptItem }: { sptItem: SptPpnBlob["V"] } = $props();
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
    {#snippet head()}
        <tr>
            <th></th>
            <th class="inputHead">PPN (Rupiah)</th>
        </tr>
    {/snippet}
    {#snippet body()}
        <tr>
            <td>PPN yang wajib dibayar kembali</td>
            <td><Input type={'text'} value={sptItem} disabled/></td>
        </tr>
    {/snippet}
</Table>

<style>
    th, td {
        font-size: .9rem;
        padding: .5rem;
    }
    .inputHead {
        width: 10rem;
        text-align: center;
        vertical-align: middle;
    }
</style>
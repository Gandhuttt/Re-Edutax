<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
	import type { SptPpnBlob } from "$lib/schemas/surat-pemberitahuan/spt-ppn";

    let { sptItem }: { sptItem: SptPpnBlob["VI"] } = $props();
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
    {#snippet head()}
        <tr>
            <th></th>
            <th></th>
            <th class="inputHead">PPnBM (Rupiah)</th>
        </tr>
    {/snippet}
    {#snippet body()}
        <tr>
            <td class="tw:w-1">A.</td>
            <td>PPnBM yang harus dipungut sendiri (I.A.2 + I.A.3 + I.A.4 + I.A.5)</td>
            <td><Input type={'text'} value={sptItem[0]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">B.</td>
            <td>Kelebihan pemungutan PPnBM oleh Pemungut PPN</td>
            <td><Input type={'text'} value={sptItem[1]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">C.</td>
            <td>PPnBM kurang atau (lebih) bayar (VI.A - VI.B)</td>
            <td><Input type={'text'} value={sptItem[2]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">D.</td>
            <td>PPnBM kurang atau (lebih) pada SPT yang dibetulkan sebelumnya</td>
            <td><Input type={'text'} value={sptItem[3]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">E.</td>
            <td>PPnBM kurang atau (lebih) bayar karena pembetulan SPT (VI.C - VI.D)</td>
            <td><Input type={'text'} value={sptItem[4]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">F.</td>
            <td>
                <Input type={"checkbox"} checked={sptItem[5]} id={"VI-F"}/>
                <label for="VI-F">diminta pengembalian pajak yang tidak seharusnya terutang</label>
            </td>
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
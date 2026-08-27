<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";

    let {
		sptItem
	}: { sptItem: { viA: number; viB: number; viC: number; viD: number; viE: number; viF: boolean | null } } =
		$props();
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
            <td><Input type={'text'} value={sptItem.viA} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">B.</td>
            <td>Kelebihan pemungutan PPnBM oleh Pemungut PPN</td>
            <td><Input type={'text'} value={sptItem.viB} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">C.</td>
            <td>PPnBM kurang atau (lebih) bayar (VI.A - VI.B)</td>
            <td><Input type={'text'} value={sptItem.viC} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">D.</td>
            <td>PPnBM kurang atau (lebih) pada SPT yang dibetulkan sebelumnya</td>
            <td><Input type={'text'} value={sptItem.viD} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">E.</td>
            <td>PPnBM kurang atau (lebih) bayar karena pembetulan SPT (VI.C - VI.D)</td>
            <td><Input type={'text'} value={sptItem.viE} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">F.</td>
            <td>
                <Input type={"checkbox"} checked={sptItem.viF ?? false} id={"VI-F"} disabled/>
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

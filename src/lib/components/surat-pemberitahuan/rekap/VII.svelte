<script lang="ts">
    import Input from "$lib/components/Input.svelte";
	import type { SptPpnBlob } from "$lib/schemas/surat-pemberitahuan/spt-ppn";

    let { sptItem }: { sptItem: SptPpnBlob["VII"] } = $props();
</script>

<table class="table table-hover align-middle">
    <thead>
        <tr>
            <th></th>
            <th></th>
            <th class="inputHead">HARGA JUAL/PENGGANTIAN/DPP (Rupiah)</th>
            <th class="inputHead">DPP NILAI LAIN/DPP (Rupiah)</th>
            <th class="inputHead">PPN (Rupiah)</th>
            <th class="inputHead">PPNBM (Rupiah)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="tw:w-1">A.</td>
            <td>Jumlah PPN dan PPnBM yang dipungut</td>
            <td><Input type={'text'} value={sptItem[0][0]} disabled/></td>
            <td><Input type={'text'} value={sptItem[0][1]} disabled/></td>
            <td><Input type={'text'} value={sptItem[0][2]} disabled/></td>
            <td><Input type={'text'} value={sptItem[0][3]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">B.</td>
            <td>PPN dan PPnBM kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya</td>
            <td><Input type={'text'} value={sptItem[1][0]} disabled/></td>
            <td><Input type={'text'} value={sptItem[1][1]} disabled/></td>
            <td><Input type={'text'} value={sptItem[1][2]} disabled/></td>
            <td><Input type={'text'} value={sptItem[1][3]} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">C.</td>
            <td>PPN dan PPnBM kurang atau (lebih) byar karena pembetulan SPT (VII.A - VII.B)</td>
            <td><Input type={'text'} value={sptItem[2][0]} disabled/></td>
            <td><Input type={'text'} value={sptItem[2][1]} disabled/></td>
            <td><Input type={'text'} value={sptItem[2][2]} disabled/></td>
            <td><Input type={'text'} value={sptItem[2][3]} disabled/></td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">Setiap kelebihan pemungutan dari Bagian ini akan menjadi pengurang pada Bagian III.D untuk PPN dan VI.B untuk PPnBM</td>
        </tr>
    </tbody>
</table>

<style>
    table{
        margin: 0;
    }
    th, td {
        font-size: .9rem;
    }
    .inputHead {
        width: 10rem;
        text-align: center;
        vertical-align: middle;
    }
</style>
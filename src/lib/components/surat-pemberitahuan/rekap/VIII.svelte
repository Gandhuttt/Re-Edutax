<script lang="ts">
    import Input from "$lib/components/Input.svelte";

    let {
		sptItem
	}: {
		sptItem: {
			viiiADpp: number;
			viiiADppNilaiLain: number;
			viiiAPpn: number;
			viiiAPpnbm: number;
			viiiBDpp: number;
			viiiBDppNilaiLain: number;
			viiiBPpn: number;
			viiiBPpnbm: number;
			viiiCDpp: number;
			viiiCDppNilaiLain: number;
			viiiCPpn: number;
			viiiCPpnbm: number;
			viiiD: boolean | null;
		};
	} = $props();
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
            <td><Input type={'text'} value={sptItem.viiiADpp} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiADppNilaiLain} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiAPpn} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiAPpnbm} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">B.</td>
            <td>PPN dan PPnBM kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya</td>
            <td><Input type={'text'} value={sptItem.viiiBDpp} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiBDppNilaiLain} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiBPpn} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiBPpnbm} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">C.</td>
            <td>PPN dan PPnBM kurang atau (lebih) byar karena pembetulan SPT (VII.A - VII.B)</td>
            <td><Input type={'text'} value={sptItem.viiiCDpp} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiCDppNilaiLain} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiCPpn} disabled/></td>
            <td><Input type={'text'} value={sptItem.viiiCPpnbm} disabled/></td>
        </tr>
        <tr>
            <td class="tw:w-1">D.</td>
            <td class="tw:pt-5">
                <Input type={"checkbox"} checked={sptItem.viiiD ?? false} id={"VIII-D"} disabled/>
                <label for="VIII-D">Diminta pengembalian pajak yang tidak seharusnya terutang</label>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>

<style>
    table{
        margin: 0;
    }
    th, td, label {
        font-size: .9rem;
    }
    .inputHead {
        width: 10rem;
        text-align: center;
        vertical-align: middle;
    }
</style>

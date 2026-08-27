<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';

	let {
		sptItem
	}: {
		sptItem: {
			iiADpp: number;
			iiAPpn: number;
			iiAPpnbm: number;
			iiBDpp: number;
			iiBDppNilaiLain: number;
			iiBPpn: number;
			iiBPpnbm: number;
			iiCDpp: number;
			iiCPpn: number;
			iiCPpnbm: number;
			iiDDpp: number;
			iiDDppNilaiLain: number;
			iiDPpn: number;
			iiDPpnbm: number;
			iiE: number;
			iiF: number;
			iiGDpp: number;
			iiGPpn: number;
			iiHDpp: number;
			iiHDppNilaiLain: number;
			iiHPpn: number;
			iiHPpnbm: number;
			iiI: number;
			iiJ: number;
		};
	} = $props();
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th></th>
			<th class="inputHead">Harga Jual/Penggantian/Nilai Impor/DPP (Rupiah)</th>
			<th class="inputHead">DPP Nilai Lain/DPP (Rupiah)</th>
			<th class="inputHead">PPN (Rupiah)</th>
			<th class="inputHead">PPnBM (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td>A.</td>
			<td
				>Impor BKP, Pemanfaatan BKP Tidak Berwujud dan/atau JKP dari luar Daerah Pabean di dalam
				Daerah Pabean yang Pajak Masukannya dapat dikreditkan</td
			>
			<td><Input type={'text'} value={sptItem.iiADpp} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iiAPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiAPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>B.</td>
			<td
				>Perolehan BKP/JKP dari dalam negeri dengan DPP Nilai Lain atau Besaran Tertentu yang Pajak
				Masukannya dapat dikreditkan (dengan Faktur Pajak Kode 04 dan 05)</td
			>
			<td><Input type={'text'} value={sptItem.iiBDpp} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiBDppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiBPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiBPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>C.</td>
			<td
				>Perolehan BKP/JKP dari dalam negeri selain dengan DPP Nilai Lain yang Pajak Masukannya
				dapat dikreditkan (dengan Faktur Pajak Kode 01, 09, dan 10)</td
			>
			<td><Input type={'text'} value={sptItem.iiCDpp} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iiCPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiCPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>D.</td>
			<td
				>Perolehan BKP/JKP dari dalam negeri sebagai Pemungutan PPN yang Pajak Masukannya dapat
				dikreditkan (dengan Faktur Pajak Kode 02 dan 03)</td
			>
			<td><Input type={'text'} value={sptItem.iiDDpp} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiDDppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiDPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiDPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>E.</td>
			<td>Kompensasi kelebihan Pajak Masukan</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iiE} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>F.</td>
			<td>Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iiF} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>G.</td>
			<td>Jumlah Pajak Masukan yang dapat diperhitungkan (II.A + II.B + II.C + II.D + II.F)</td>
			<td><Input type={'text'} value={sptItem.iiGDpp} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iiGPpn} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>H.</td>
			<td
				>Impor atau perolehan BKP/JKP yang Pajak Masukannya tidak dikreditkan dan/atau impor atau
				perolehan BKP/JKP yang mendapat fasilitas</td
			>
			<td><Input type={'text'} value={sptItem.iiHDpp} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiHDppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiHPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iiHPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>I.</td>
			<td
				>Impor atau perolehan BKP/JKP dengan Faktur Pajak yang dilaporkan secara digunggung dan barang/jasa
				yang tidak terutang PPN</td
			>
			<td><Input type={'text'} value={sptItem.iiI} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>J.</td>
			<td>Jumlah Perolehan (II.A + II.B + II.C + II.H + II.I)</td>
			<td><Input type={'text'} value={sptItem.iiJ} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
	{/snippet}
</Table>

<style>
	th,
	td {
		font-size: 0.9rem;
		padding: 0.5rem;
	}
	.inputHead {
		width: 10%;
		text-align: center;
		vertical-align: middle;
	}
</style>

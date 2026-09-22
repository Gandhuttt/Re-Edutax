<script lang="ts">
	import { DataTableBody, DataTableViewport } from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';

	let {
		rows
	}: {
		rows: {
			fakturPajakId: string;
			npwpPenjual: string;
			namaPenjual: string | null;
			npwpPembeli: string;
			namaPembeli: string | null;
			nomorFaktur: string;
			tanggalFaktur: string;
			kodeTransaksi: number;
			hargaJual: number;
			dppNilaiLain: number;
			ppn: number;
			ppnbm: number;
		}[];
	} = $props();

	const totalHargaJual = $derived(rows.reduce((total, row) => total + row.hargaJual, 0));
	const totalDppNilaiLain = $derived(rows.reduce((total, row) => total + row.dppNilaiLain, 0));
	const totalPpn = $derived(rows.reduce((total, row) => total + row.ppn, 0));
	const totalPpnbm = $derived(rows.reduce((total, row) => total + row.ppnbm, 0));

	function jenisPemungut(kodeTransaksi: number) {
		return kodeTransaksi === 2 ? 'Instansi Pemerintah' : 'Selain Instansi Pemerintah';
	}
</script>

<DataTableViewport
	label="Lampiran C pemungutan PPN oleh pemungut PPN"
	minWidth="1900px"
	framed={false}
	headerTone="navy"
	density="compact"
>
	<table>
		<thead>
			<tr>
				<th scope="col">No.</th>
				<th scope="col">Penjual</th>
				<th scope="col">NPWP penjual</th>
				<th scope="col">Pembeli</th>
				<th scope="col">NPWP pembeli</th>
				<th scope="col">Jenis pemungut</th>
				<th scope="col">Nomor faktur</th>
				<th scope="col">Tanggal faktur</th>
				<th scope="col" class="right">Harga jual/DPP (Rupiah)</th>
				<th scope="col" class="right">DPP nilai lain (Rupiah)</th>
				<th scope="col" class="right">PPN (Rupiah)</th>
				<th scope="col" class="right">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody
			items={rows}
			getKey={(row) => row.fakturPajakId}
			emptyColspan={12}
			emptyText="Tidak ada data yang ditemukan."
			motion={false}
		>
			{#snippet row(row, index)}
				<td>{index + 1}</td>
				<td>{row.namaPenjual ?? '-'}</td>
				<td>{row.npwpPenjual}</td>
				<td>{row.namaPembeli ?? '-'}</td>
				<td>{row.npwpPembeli}</td>
				<td>{jenisPemungut(row.kodeTransaksi)}</td>
				<td>{row.nomorFaktur}</td>
				<td>{row.tanggalFaktur}</td>
				<td class="number amount">{formatRupiahDerived(row.hargaJual)}</td>
				<td class="number amount">{formatRupiahDerived(row.dppNilaiLain)}</td>
				<td class="number amount">{formatRupiahDerived(row.ppn)}</td>
				<td class="number amount">{formatRupiahDerived(row.ppnbm)}</td>
			{/snippet}
		</DataTableBody>
		<tfoot>
			<tr>
				<th scope="row" colspan="8">Jumlah</th>
				<td class="number amount">{formatRupiahDerived(totalHargaJual)}</td>
				<td class="number amount">{formatRupiahDerived(totalDppNilaiLain)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpn)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpnbm)}</td>
			</tr>
		</tfoot>
	</table>
</DataTableViewport>

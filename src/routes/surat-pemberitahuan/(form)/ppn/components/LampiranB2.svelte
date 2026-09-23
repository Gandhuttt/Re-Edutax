<script lang="ts">
	import { DataTableBody, DataTableViewport } from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';

	let {
		rows
	}: {
		rows: {
			fakturPajakId: string;
			npwpLawanTransaksi: string;
			namaLawanTransaksi: string | null;
			nomorFaktur: string;
			tanggalFaktur: string;
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
</script>

<DataTableViewport
	label="Lampiran B2 pajak masukan yang dapat dikreditkan"
	minWidth="1380px"
	framed={false}
	headerTone="navy"
	density="compact"
>
	<table>
		<thead>
			<tr>
				<th scope="col">No.</th>
				<th scope="col">Lawan transaksi</th>
				<th scope="col">NPWP</th>
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
			emptyColspan={9}
			emptyText="Tidak ada data yang ditemukan."
		>
			{#snippet row(row, index)}
				<td>{index + 1}</td>
				<td>{row.namaLawanTransaksi ?? '-'}</td>
				<td>{row.npwpLawanTransaksi}</td>
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
				<th scope="row" colspan="5">Jumlah</th>
				<td class="number amount">{formatRupiahDerived(totalHargaJual)}</td>
				<td class="number amount">{formatRupiahDerived(totalDppNilaiLain)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpn)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpnbm)}</td>
			</tr>
		</tfoot>
	</table>
</DataTableViewport>

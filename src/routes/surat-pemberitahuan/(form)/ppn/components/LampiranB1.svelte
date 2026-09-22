<script lang="ts">
	// B-1, Pajak Masukan atas Dokumen Tertentu. Layout-only placeholder: there
	// is no "dokumen tertentu" tracking anywhere in this app yet. Building it
	// requires a new document-entry flow, scoped out of the A-2/B-2/C round
	// (see project memory ppn-normalization-and-xml-upload).
	import { DataTableBody, DataTableViewport } from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';

	const rows: {
		namaPenjual: string;
		npwpPenjual: string;
		nomorDokumen: string;
		tanggalDokumen: string;
		dpp: number;
		ppn: number;
		ppnbm: number;
	}[] = [];

	const totalDpp = $derived(rows.reduce((total, row) => total + row.dpp, 0));
	const totalPpn = $derived(rows.reduce((total, row) => total + row.ppn, 0));
	const totalPpnbm = $derived(rows.reduce((total, row) => total + row.ppnbm, 0));
</script>

<DataTableViewport
	label="Lampiran B1 pajak masukan atas dokumen tertentu"
	minWidth="1160px"
	framed={false}
	headerTone="navy"
	density="compact"
>
	<table>
		<thead>
			<tr>
				<th scope="col">No.</th>
				<th scope="col">Penjual</th>
				<th scope="col">NPWP</th>
				<th scope="col">Nomor dokumen</th>
				<th scope="col">Tanggal dokumen</th>
				<th scope="col" class="right">DPP (Rupiah)</th>
				<th scope="col" class="right">PPN (Rupiah)</th>
				<th scope="col" class="right">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody
			items={rows}
			getKey={(row) => row.nomorDokumen}
			emptyColspan={8}
			emptyText="Tidak ada data yang ditemukan."
			motion={false}
		>
			{#snippet row(row, index)}
				<td>{index + 1}</td>
				<td>{row.namaPenjual}</td>
				<td>{row.npwpPenjual}</td>
				<td>{row.nomorDokumen}</td>
				<td>{row.tanggalDokumen}</td>
				<td class="number amount">{formatRupiahDerived(row.dpp)}</td>
				<td class="number amount">{formatRupiahDerived(row.ppn)}</td>
				<td class="number amount">{formatRupiahDerived(row.ppnbm)}</td>
			{/snippet}
		</DataTableBody>
		<tfoot>
			<tr>
				<th scope="row" colspan="5">Jumlah</th>
				<td class="number amount">{formatRupiahDerived(totalDpp)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpn)}</td>
				<td class="number amount">{formatRupiahDerived(totalPpnbm)}</td>
			</tr>
		</tfoot>
	</table>
</DataTableViewport>

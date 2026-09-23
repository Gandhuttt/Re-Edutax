<script lang="ts">
	// A-1, Ekspor BKP/BKP Tidak Berwujud/JKP. Layout-only placeholder: there is
	// no export/PEB tracking anywhere in this app yet, so this table never
	// receives rows. Building it requires a new invoice-entry flow, scoped out
	// of the A-2/B-2/C round (see project memory ppn-normalization-and-xml-upload).
	import { DataTableBody, DataTableViewport } from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';

	const rows: {
		nomorDokumen: string;
		tanggalDokumen: string;
		negaraTujuan: string;
		namaPembeli: string;
		nilaiEkspor: number;
	}[] = [];

	const totalNilaiEkspor = $derived(rows.reduce((total, row) => total + row.nilaiEkspor, 0));
</script>

<DataTableViewport
	label="Lampiran A1 ekspor BKP, BKP tidak berwujud, dan JKP"
	minWidth="940px"
	framed={false}
	headerTone="navy"
	density="compact"
>
	<table>
		<thead>
			<tr>
				<th scope="col">No.</th>
				<th scope="col">Nomor dokumen</th>
				<th scope="col">Tanggal dokumen</th>
				<th scope="col">Negara tujuan</th>
				<th scope="col">Nama pembeli</th>
				<th scope="col" class="right">Nilai ekspor/DPP (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody
			items={rows}
			getKey={(row) => row.nomorDokumen}
			emptyColspan={6}
			emptyText="Tidak ada data yang ditemukan."
		>
			{#snippet row(row, index)}
				<td>{index + 1}</td>
				<td>{row.nomorDokumen}</td>
				<td>{row.tanggalDokumen}</td>
				<td>{row.negaraTujuan}</td>
				<td>{row.namaPembeli}</td>
				<td class="number amount">{formatRupiahDerived(row.nilaiEkspor)}</td>
			{/snippet}
		</DataTableBody>
		<tfoot>
			<tr>
				<th scope="row" colspan="5">Jumlah</th>
				<td class="number amount">{formatRupiahDerived(totalNilaiEkspor)}</td>
			</tr>
		</tfoot>
	</table>
</DataTableViewport>

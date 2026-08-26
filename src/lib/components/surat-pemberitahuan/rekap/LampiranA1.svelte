<script lang="ts">
	// A-1, Ekspor BKP/BKP Tidak Berwujud/JKP. Layout-only placeholder: there is
	// no export/PEB tracking anywhere in this app yet, so this table never
	// receives rows. Building it requires a new invoice-entry flow, scoped out
	// of the A-2/B-2/C round (see project memory ppn-normalization-and-xml-upload).
	import Table from '$lib/components/Table.svelte';
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

<div class="tw:overflow-x-auto">
	<Table class="tw:min-w-full">
		{#snippet head()}
			<tr>
				<th class="tw:w-[4rem]">NO.</th>
				<th>NOMOR DOKUMEN</th>
				<th>TANGGAL DOKUMEN</th>
				<th>NEGARA TUJUAN</th>
				<th>NAMA PEMBELI</th>
				<th class="tw:text-end">NILAI EKSPOR/DPP (RUPIAH)</th>
			</tr>
		{/snippet}
		{#snippet body()}
			{#each rows as row, index (row.nomorDokumen)}
				<tr>
					<td>{index + 1}</td>
					<td>{row.nomorDokumen}</td>
					<td>{row.tanggalDokumen}</td>
					<td>{row.negaraTujuan}</td>
					<td>{row.namaPembeli}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.nilaiEkspor)}</td>
				</tr>
			{:else}
				<tr><td colspan="6" class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
			{/each}
			<tr class="total">
				<td colspan="5">JUMLAH</td>
				<td class="tw:text-end">{formatRupiahDerived(totalNilaiEkspor)}</td>
			</tr>
		{/snippet}
	</Table>
</div>

<style>
	th {
		font-size: 0.7rem;
		font-weight: bold;
		text-align: center;
		padding: 0.4rem 0.5rem;
		white-space: nowrap;
		background-color: var(--color-primary);
		border: 1px solid white;
	}
	td {
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid white;
	}
	tr:not(.total):nth-child(odd) {
		background-color: #f9f6ee;
	}
	tr.total td {
		font-weight: bold;
		background-color: var(--color-primary);
		border: 1px solid white;
	}
</style>

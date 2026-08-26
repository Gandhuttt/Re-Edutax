<script lang="ts">
	// B-1, Pajak Masukan atas Dokumen Tertentu. Layout-only placeholder: there
	// is no "dokumen tertentu" tracking anywhere in this app yet. Building it
	// requires a new document-entry flow, scoped out of the A-2/B-2/C round
	// (see project memory ppn-normalization-and-xml-upload).
	import Table from '$lib/components/Table.svelte';
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

<div class="tw:overflow-x-auto">
	<Table class="tw:min-w-full">
		{#snippet head()}
			<tr>
				<th class="tw:w-[4rem]">NO.</th>
				<th>PENJUAL</th>
				<th>NPWP</th>
				<th>NOMOR DOKUMEN</th>
				<th>TANGGAL DOKUMEN</th>
				<th class="tw:text-end">DPP (RUPIAH)</th>
				<th class="tw:text-end">PPN (RUPIAH)</th>
				<th class="tw:text-end">PPNBM (RUPIAH)</th>
			</tr>
		{/snippet}
		{#snippet body()}
			{#each rows as row, index (row.nomorDokumen)}
				<tr>
					<td>{index + 1}</td>
					<td>{row.namaPenjual}</td>
					<td>{row.npwpPenjual}</td>
					<td>{row.nomorDokumen}</td>
					<td>{row.tanggalDokumen}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.dpp)}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.ppn)}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.ppnbm)}</td>
				</tr>
			{:else}
				<tr><td colspan="8" class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
			{/each}
			<tr class="total">
				<td colspan="5">JUMLAH</td>
				<td class="tw:text-end">{formatRupiahDerived(totalDpp)}</td>
				<td class="tw:text-end">{formatRupiahDerived(totalPpn)}</td>
				<td class="tw:text-end">{formatRupiahDerived(totalPpnbm)}</td>
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

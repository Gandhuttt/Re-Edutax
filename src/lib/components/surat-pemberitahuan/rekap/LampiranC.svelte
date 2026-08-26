<script lang="ts">
	import Table from '$lib/components/Table.svelte';
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

<div class="tw:overflow-x-auto">
	<Table class="tw:min-w-full">
		{#snippet head()}
			<tr>
				<th class="tw:w-[4rem]">NO.</th>
				<th>PENJUAL</th>
				<th>NPWP PENJUAL</th>
				<th>PEMBELI</th>
				<th>NPWP PEMBELI</th>
				<th>JENIS PEMUNGUT</th>
				<th>NOMOR FAKTUR</th>
				<th>TANGGAL FAKTUR</th>
				<th class="tw:text-end">HARGA JUAL/DPP (RUPIAH)</th>
				<th class="tw:text-end">DPP NILAI LAIN (RUPIAH)</th>
				<th class="tw:text-end">PPN (RUPIAH)</th>
				<th class="tw:text-end">PPNBM (RUPIAH)</th>
			</tr>
		{/snippet}
		{#snippet body()}
			{#each rows as row, index (row.fakturPajakId)}
				<tr>
					<td>{index + 1}</td>
					<td>{row.namaPenjual ?? '-'}</td>
					<td>{row.npwpPenjual}</td>
					<td>{row.namaPembeli ?? '-'}</td>
					<td>{row.npwpPembeli}</td>
					<td>{jenisPemungut(row.kodeTransaksi)}</td>
					<td>{row.nomorFaktur}</td>
					<td>{row.tanggalFaktur}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.hargaJual)}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.dppNilaiLain)}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.ppn)}</td>
					<td class="tw:text-end">{formatRupiahDerived(row.ppnbm)}</td>
				</tr>
			{:else}
				<tr><td colspan="12" class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
			{/each}
			<tr class="total">
				<td colspan="8">JUMLAH</td>
				<td class="tw:text-end">{formatRupiahDerived(totalHargaJual)}</td>
				<td class="tw:text-end">{formatRupiahDerived(totalDppNilaiLain)}</td>
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

<script lang="ts">
	import { DataTableBody, DataTableViewport, FormField } from '$lib/re-ui-components';

	type Row = { code: string; description: string; values: (number | null)[]; total?: boolean };

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

	const rows = $derived<Row[]>([
		{ code: 'A.', description: 'Impor BKP, Pemanfaatan BKP Tidak Berwujud dan/atau JKP dari luar Daerah Pabean di dalam Daerah Pabean yang Pajak Masukannya dapat dikreditkan', values: [sptItem.iiADpp, null, sptItem.iiAPpn, sptItem.iiAPpnbm] },
		{ code: 'B.', description: 'Perolehan BKP/JKP dari dalam negeri dengan DPP Nilai Lain atau Besaran Tertentu yang Pajak Masukannya dapat dikreditkan (dengan Faktur Pajak Kode 04 dan 05)', values: [sptItem.iiBDpp, sptItem.iiBDppNilaiLain, sptItem.iiBPpn, sptItem.iiBPpnbm] },
		{ code: 'C.', description: 'Perolehan BKP/JKP dari dalam negeri selain dengan DPP Nilai Lain yang Pajak Masukannya dapat dikreditkan (dengan Faktur Pajak Kode 01, 09, dan 10)', values: [sptItem.iiCDpp, null, sptItem.iiCPpn, sptItem.iiCPpnbm] },
		{ code: 'D.', description: 'Perolehan BKP/JKP dari dalam negeri sebagai Pemungutan PPN yang Pajak Masukannya dapat dikreditkan (dengan Faktur Pajak Kode 02 dan 03)', values: [sptItem.iiDDpp, sptItem.iiDDppNilaiLain, sptItem.iiDPpn, sptItem.iiDPpnbm] },
		{ code: 'E.', description: 'Kompensasi kelebihan Pajak Masukan', values: [null, null, sptItem.iiE, null] },
		{ code: 'F.', description: 'Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan', values: [null, null, sptItem.iiF, null] },
		{ code: 'G.', description: 'Jumlah Pajak Masukan yang dapat diperhitungkan (II.A + II.B + II.C + II.D + II.F)', values: [sptItem.iiGDpp, null, sptItem.iiGPpn, null], total: true },
		{ code: 'H.', description: 'Impor atau perolehan BKP/JKP yang Pajak Masukannya tidak dikreditkan dan/atau impor atau perolehan BKP/JKP yang mendapat fasilitas', values: [sptItem.iiHDpp, sptItem.iiHDppNilaiLain, sptItem.iiHPpn, sptItem.iiHPpnbm] },
		{ code: 'I.', description: 'Impor atau perolehan BKP/JKP dengan Faktur Pajak yang dilaporkan secara digunggung dan barang/jasa yang tidak terutang PPN', values: [sptItem.iiI, null, null, null] },
		{ code: 'J.', description: 'Jumlah Perolehan (II.A + II.B + II.C + II.H + II.I)', values: [sptItem.iiJ, null, null, null], total: true }
	]);
	const valueLabels = ['Harga jual/penggantian/nilai impor/DPP', 'DPP nilai lain/DPP', 'PPN', 'PPnBM'];
</script>

<div class="amount-table">
	<DataTableViewport
		label="Perolehan barang dan jasa"
		minWidth="1260px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Kode</th>
				<th>Uraian</th>
				<th class="number">Harga Jual/Penggantian/Nilai Impor/DPP (Rupiah)</th>
				<th class="number">DPP Nilai Lain/DPP (Rupiah)</th>
				<th class="number">PPN (Rupiah)</th>
				<th class="number">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody items={rows} getKey={(row) => row.code} emptyColspan={6} motion={false}>
			{#snippet row(item)}
				<td><strong>{item.code}</strong></td>
				<td class:total-copy={item.total}>{item.description}</td>
				{#each item.values as value, index}
					<td class:dash={value === null}>
						{#if value === null}
							<span aria-label="Tidak berlaku">—</span>
						{:else}
							<FormField label={`${valueLabels[index]} ${item.code}`} value={String(value)} disabled />
						{/if}
					</td>
				{/each}
			{/snippet}
		</DataTableBody>
		</table>
	</DataTableViewport>
</div>

<style>
	.total-copy {
		font-weight: 800;
	}

	.dash {
		text-align: center;
		color: var(--ui-muted);
		font-weight: 800;
	}

	.amount-table :global(.table-viewport td label .label) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.amount-table :global(.table-viewport td input) {
		min-width: 8.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

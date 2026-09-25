<script lang="ts">
	import { DataTable, TableActions } from "$lib/re-ui-components";
	import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

	const bulanNames = [
		'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
		'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
	];

	let {
		data,
		dipotongBulanan = $bindable(),
		openModal
	}: {
		data: Array<{
			id: string | number;
			nama: string;
			bulanan: Array<{
				bulan: number;
				jumlahPeredaranBruto: number;
			}>;
		}>;
		dipotongBulanan: Array<{ bulan: number; nilai: number }>;
		openModal: (item: unknown) => void;
	} = $props();

	function terutang(bruto: number): number {
		return Math.round(Number(bruto || 0) * 0.005);
	}

	function rowJumlahBruto(bulanan: { jumlahPeredaranBruto: number }[]): number {
		return bulanan.reduce((sum, b) => sum + Number(b.jumlahPeredaranBruto || 0), 0);
	}

	let totalBrutoPerBulan = $derived(
		Array.from({ length: 12 }, (_, i) =>
			data.reduce((sum, tku) => sum + Number(tku.bulanan[i]?.jumlahPeredaranBruto || 0), 0)
		)
	);
	let totalTerutangPerBulan = $derived(totalBrutoPerBulan.map((bruto) => terutang(bruto)));
	let totalSelisihPerBulan = $derived(
		totalTerutangPerBulan.map((terutangBulan, i) => terutangBulan - Number(dipotongBulanan[i]?.nilai || 0))
	);

	let grandBruto = $derived(totalBrutoPerBulan.reduce((a, b) => a + b, 0));
	let grandTerutang = $derived(totalTerutangPerBulan.reduce((a, b) => a + b, 0));
	let grandDipotong = $derived(dipotongBulanan.reduce((sum, b) => sum + Number(b.nilai || 0), 0));
	let grandSelisih = $derived(totalSelisihPerBulan.reduce((a, b) => a + b, 0));
</script>

<DataTable label="Rekapitulasi peredaran bruto dan PPh yang telah dibayar" minWidth="1680px" headerTone="navy" density="compact" stickyFirstColumn>
	<table>
		<thead>
			<tr>
				<th scope="col">Tindakan</th>
				<th scope="col">Nama TKU</th>
				{#each bulanNames as bulan}
					<th scope="col">{bulan}</th>
				{/each}
				<th scope="col">Jumlah</th>
			</tr>
		</thead>
		<tbody>
			{#if data.length === 0}
				<tr><td colspan="15" class="empty">Tidak ada data yang ditampilkan</td></tr>
			{:else}
				{#each data as item (item.id)}
					<tr>
						<td><TableActions actions={[{ label: 'Edit', onclick: () => openModal(item) }]} /></td>
						<td>{item.nama}</td>
						{#each item.bulanan as b}
							<td class="number">{Number(b.jumlahPeredaranBruto || 0).toLocaleString('id-ID')}</td>
						{/each}
						<td class="number">{rowJumlahBruto(item.bulanan).toLocaleString('id-ID')}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
		<tfoot>
			<tr>
				<th scope="row" colspan="2">Jumlah Peredaran Bruto</th>
				{#each totalBrutoPerBulan as bulan}<td class="number">{bulan.toLocaleString('id-ID')}</td>{/each}
				<td class="number">{grandBruto.toLocaleString('id-ID')}</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">Jumlah PPh Bersifat Final Terutang</th>
				{#each totalTerutangPerBulan as bulan}<td class="number">{bulan.toLocaleString('id-ID')}</td>{/each}
				<td class="number">{grandTerutang.toLocaleString('id-ID')}</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">PPh Bersifat Final yang Disetor Sendiri</th>
				{#each bulanNames as _}<td class="number">0</td>{/each}
				<td class="number">0</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">Jumlah PPh Bersifat Final Dipotong/Dipungut Pihak Lain</th>
				{#each dipotongBulanan as item}
					<td>
						<input
							type="text"
							inputmode="numeric"
							aria-label={`PPh dipotong bulan ${item.bulan}`}
							value={formatRupiah(item.nilai)}
							oninput={(e) => (item.nilai = applyRupiahInput(e))}
						/>
					</td>
				{/each}
				<td class="number">{grandDipotong.toLocaleString('id-ID')}</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">Selisih</th>
				{#each totalSelisihPerBulan as bulan}<td class="number">{bulan.toLocaleString('id-ID')}</td>{/each}
				<td class="number">{grandSelisih.toLocaleString('id-ID')}</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">Selisih pada SPT yang Dibetulkan</th>
				<td colspan="13" class="number">0</td>
			</tr>
			<tr>
				<th scope="row" colspan="2">Selisih karena Pembetulan</th>
				<td colspan="13" class="number">{grandSelisih.toLocaleString('id-ID')}</td>
			</tr>
		</tfoot>
	</table>
</DataTable>

<style>
	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.empty {
		text-align: center;
	}
	input {
		width: 100%;
		min-width: 5.5rem;
		padding: 6px 8px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		text-align: right;
		font: inherit;
		font-variant-numeric: tabular-nums;
	}
</style>

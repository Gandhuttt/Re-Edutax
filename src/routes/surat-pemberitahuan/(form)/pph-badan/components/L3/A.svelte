<script lang="ts">
	import { ActionButton, DataTable, Stack, TableActions } from "$lib/re-ui-components";
	import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

	let {
		data,
		openModal,
		deleteItem,
		pengembalianPengurangan = $bindable(0),
		readonly = false
	}: {
		data: Array<{
			id: string | number;
			namaPemberiPenghasilan: string;
			negara: string;
			tanggal: string;
			jenisPenghasilan: string;
			penghasilanNeto: number;
			pphLuarNegeri: number;
			mataUang: string;
			pphLuarNegeriMataUangAsing: number;
			kreditPajakYangDapatDikreditkan: number;
			keterangan: string;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		pengembalianPengurangan?: number;
		readonly?: boolean;
	} = $props();

	let totalPenghasilanNeto = $derived(data.reduce((sum, item) => sum + Number(item.penghasilanNeto || 0), 0));
	let totalPphLuarNegeri = $derived(data.reduce((sum, item) => sum + Number(item.pphLuarNegeri || 0), 0));
	let totalKreditPajak = $derived(data.reduce((sum, item) => sum + Number(item.kreditPajakYangDapatDikreditkan || 0), 0));
	let jumlahDapatDiperhitungkan = $derived(totalKreditPajak - Number(pengembalianPengurangan || 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" onclick={() => openModal(null)} disabled={readonly}>Tambah</ActionButton></div>
	<DataTable label="Penghasilan dari luar negeri" minWidth="1500px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col" rowspan="2">Tindakan</th>
					<th scope="col" rowspan="2">No</th>
					<th scope="colgroup" colspan="2">Pemotong Pajak</th>
					<th scope="col" rowspan="2">Tanggal</th>
					<th scope="col" rowspan="2">Jenis Penghasilan</th>
					<th scope="col" rowspan="2">Penghasilan Neto (Rp)</th>
					<th scope="colgroup" colspan="3">PPh yang Dibayar/Dipotong/Terutang di Luar Negeri</th>
					<th scope="col" rowspan="2">Kredit Pajak yang Dapat Dikreditkan (Rp)</th>
					<th scope="col" rowspan="2">Keterangan</th>
				</tr>
				<tr>
					<th scope="col">Nama</th>
					<th scope="col">Negara</th>
					<th scope="col">Nilai (Rp)</th>
					<th scope="col">Mata Uang</th>
					<th scope="col">Nilai dalam Mata Uang Asing</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="12" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item, i (item.id)}
						<tr>
							<td><TableActions actions={[
								{ label: 'Edit', disabled: readonly, onclick: () => openModal(item) },
								{ label: 'Hapus', disabled: readonly, danger: true, onclick: () => deleteItem(item.id) }
							]} /></td>
							<td>{i + 1}</td>
							<td>{item.namaPemberiPenghasilan}</td>
							<td>{item.negara}</td>
							<td>{item.tanggal}</td>
							<td>{item.jenisPenghasilan}</td>
							<td class="number">{Number(item.penghasilanNeto || 0).toLocaleString('id-ID')}</td>
							<td class="number">{Number(item.pphLuarNegeri || 0).toLocaleString('id-ID')}</td>
							<td>{item.mataUang}</td>
							<td class="number">{Number(item.pphLuarNegeriMataUangAsing || 0).toLocaleString('id-ID')}</td>
							<td class="number">{Number(item.kreditPajakYangDapatDikreditkan || 0).toLocaleString('id-ID')}</td>
							<td>{item.keterangan}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr><th colspan="6" scope="row">Jumlah</th><td class="number">{totalPenghasilanNeto.toLocaleString('id-ID')}</td><td class="number">{totalPphLuarNegeri.toLocaleString('id-ID')}</td><td colspan="2"></td><td class="number">{totalKreditPajak.toLocaleString('id-ID')}</td><td></td></tr>
				<tr>
					<th colspan="10" scope="row">Pengembalian/Pengurangan Pajak Penghasilan Luar Negeri (Pasal 24) yang Telah Dikreditkan untuk Tahun Sebelumnya</th>
					<td><input aria-label="Pengembalian atau pengurangan pajak penghasilan luar negeri" type="text" inputmode="numeric" value={formatRupiah(pengembalianPengurangan)} oninput={(event) => (pengembalianPengurangan = applyRupiahInput(event))} disabled={readonly} /></td><td></td>
				</tr>
				<tr><th colspan="10" scope="row">Jumlah Pajak Penghasilan yang Dibayar di Luar Negeri yang Dapat Diperhitungkan dalam Tahun Berjalan</th><td class="number">{jumlahDapatDiperhitungkan.toLocaleString('id-ID')}</td><td></td></tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<style>
	.empty { text-align: center; }
	.number { text-align: right; font-variant-numeric: tabular-nums; }
	tfoot th { text-align: right; }
	tfoot input { width: 100%; min-width: 120px; text-align: right; }
</style>

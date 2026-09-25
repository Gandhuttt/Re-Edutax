<script lang="ts">
	import { ActionButton, DataTable, Stack, TableActions } from "$lib/re-ui-components";

	let {
		data,
		openModal,
		deleteItem,
		objekPajakOptions,
		readonly = false
	}: {
		data: Array<{
			id: string | number;
			npwpPemotongPemungutPenyetor: string;
			namaPemotongPemungutPenyetor: string;
			objekPajak: string;
			dasarPengenaanPajak: number;
			tarif: number;
			pphFinalTerutang: number;
			nomorBuktiPotong: string;
			tanggalBuktiPotong: string;
			keterangan: string;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		objekPajakOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	const objekPajakLabel = (kode: string) => objekPajakOptions.find((option) => option.value === kode)?.label ?? kode;
	let totalDasarPengenaanPajak = $derived(data.reduce((sum, item) => sum + Number(item.dasarPengenaanPajak || 0), 0));
	let totalPphFinalTerutang = $derived(data.reduce((sum, item) => sum + Number(item.pphFinalTerutang || 0), 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" disabled={readonly} onclick={() => openModal(null)}>Tambah</ActionButton></div>
	<DataTable label="Penghasilan yang dikenakan PPh yang bersifat final" minWidth="1720px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Tindakan</th>
					<th scope="col">NPWP Pemotong/Pemungut/Penyetor</th>
					<th scope="col">Nama Pemotong/Pemungut/Penyetor</th>
					<th scope="col">Objek Pajak</th>
					<th scope="col">Dasar Pengenaan Pajak (Rupiah)</th>
					<th scope="col">Tarif (%)</th>
					<th scope="col">PPh Final Terutang (Rupiah)</th>
					<th scope="col">Nomor Bukti Potong/Setor</th>
					<th scope="col">Tanggal Bukti Potong/Setor</th>
					<th scope="col">Keterangan</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="10" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item (item.id)}
						<tr>
							<td><TableActions actions={[
								{ label: 'Edit', disabled: readonly, onclick: () => openModal(item) },
								{ label: 'Hapus', disabled: readonly, danger: true, onclick: () => deleteItem(item.id) }
							]} /></td>
							<td>{item.npwpPemotongPemungutPenyetor}</td>
							<td>{item.namaPemotongPemungutPenyetor}</td>
							<td>{objekPajakLabel(item.objekPajak)}</td>
							<td class="number">{Number(item.dasarPengenaanPajak || 0).toLocaleString('id-ID')}</td>
							<td class="number">{item.tarif}</td>
							<td class="number">{Number(item.pphFinalTerutang || 0).toLocaleString('id-ID')}</td>
							<td>{item.nomorBuktiPotong}</td>
							<td>{item.tanggalBuktiPotong}</td>
							<td>{item.keterangan}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="4">Jumlah</th>
					<td class="number">{totalDasarPengenaanPajak.toLocaleString('id-ID')}</td>
					<td></td>
					<td class="number">{totalPphFinalTerutang.toLocaleString('id-ID')}</td>
					<td colspan="3"></td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<style>
	.empty { text-align: center; }
	.number { text-align: right; font-variant-numeric: tabular-nums; }
</style>

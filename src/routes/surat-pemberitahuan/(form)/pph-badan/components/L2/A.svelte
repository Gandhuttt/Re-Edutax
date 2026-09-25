<script lang="ts">
	import { ActionButton, DataTable, Stack, TableActions } from '$lib/re-ui-components';

	let {
		data,
		openModal,
		deleteItem,
		readonly = false
	}: {
		data: Array<{
			id: string | number;
			nama: string;
			alamat: string;
			negara: string;
			npwp: string;
			jabatan: string;
			nilaiModal: number;
			persentase: number;
			dividen: number;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		readonly?: boolean;
	} = $props();

	let totalNilaiModal = $derived(data.reduce((sum, item) => sum + Number(item.nilaiModal || 0), 0));
	let totalPersentase = $derived(data.reduce((sum, item) => sum + Number(item.persentase || 0), 0));
	let totalDividen = $derived(data.reduce((sum, item) => sum + Number(item.dividen || 0), 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" onclick={() => openModal(null)} disabled={readonly}>Tambah</ActionButton></div>
	<DataTable label="Daftar pemegang saham, pemilik modal, pengurus, dan komisaris" minWidth="1280px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col" rowspan="2">Tindakan</th>
					<th scope="col" rowspan="2">No</th>
					<th scope="col" rowspan="2">Nama</th>
					<th scope="col" rowspan="2">Alamat</th>
					<th scope="col" rowspan="2">Kode negara</th>
					<th scope="col" rowspan="2">NPWP/NIK</th>
					<th scope="col" rowspan="2">Jabatan</th>
					<th scope="colgroup" colspan="2">Modal disetor</th>
					<th scope="col" rowspan="2">Dividen/Pembagian laba (Rp)</th>
				</tr>
				<tr>
					<th scope="col">Nilai (Rp)</th>
					<th scope="col">%</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="10" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item, index (item.id)}
						<tr>
							<td class="action-cell">
								<TableActions
									actions={[
										{ label: 'Edit', disabled: readonly, onclick: () => openModal(item) },
										{ label: 'Hapus', disabled: readonly, danger: true, onclick: () => deleteItem(item.id) }
									]}
								/>
							</td>
							<td>{index + 1}</td>
							<td>{item.nama}</td>
							<td>{item.alamat}</td>
							<td>{item.negara}</td>
							<td>{item.npwp}</td>
							<td>{item.jabatan}</td>
							<td class="number">{item.nilaiModal}</td>
							<td class="number">{item.persentase}</td>
							<td class="number">{item.dividen}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<th colspan="7">Jumlah</th>
					<td class="number">{totalNilaiModal.toLocaleString('id-ID')}</td>
					<td class="number">{totalPersentase.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
					<td class="number">{totalDividen.toLocaleString('id-ID')}</td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<style>
	tfoot th,
	tfoot td {
		background: var(--ui-yellow);
		color: var(--ui-navy-strong);
		font-weight: 800;
	}
	tfoot th {
		text-align: right;
	}
</style>

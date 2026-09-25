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
			negara: string;
			npwp: string;
			modalNilai: number;
			modalPersen: number;
			utangNilai: number;
			utangTahun: number;
			utangBunga: number;
			piutangNilai: number;
			piutangTahun: number;
			piutangBunga: number;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		readonly?: boolean;
	} = $props();

	let totalUtangNilai = $derived(data.reduce((sum, item) => sum + Number(item.utangNilai || 0), 0));
	let totalPiutangNilai = $derived(data.reduce((sum, item) => sum + Number(item.piutangNilai || 0), 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" onclick={() => openModal(null)} disabled={readonly}>Tambah</ActionButton></div>
	<DataTable label="Daftar penyertaan modal, utang, dan piutang pada perusahaan afiliasi" minWidth="1480px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col" rowspan="2">Tindakan</th>
					<th scope="col" rowspan="2">No</th>
					<th scope="col" rowspan="2">Nama</th>
					<th scope="col" rowspan="2">Negara</th>
					<th scope="col" rowspan="2">NPWP/NIK</th>
					<th scope="colgroup" colspan="2">Penyertaan modal</th>
					<th scope="colgroup" colspan="3">Utang</th>
					<th scope="colgroup" colspan="3">Piutang</th>
				</tr>
				<tr>
					<th scope="col">Nilai (Rp)</th>
					<th scope="col">%</th>
					<th scope="col">Nilai (Rp)</th>
					<th scope="col">Tahun</th>
					<th scope="col">Bunga utang/tahun</th>
					<th scope="col">Nilai (Rp)</th>
					<th scope="col">Tahun</th>
					<th scope="col">Bunga piutang/tahun</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="13" class="empty">Tidak ada data yang ditampilkan</td></tr>
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
							<td>{item.negara}</td>
							<td>{item.npwp}</td>
							<td class="number">{item.modalNilai}</td>
							<td class="number">{item.modalPersen}</td>
							<td class="number">{item.utangNilai}</td>
							<td class="number">{item.utangTahun}</td>
							<td class="number">{item.utangBunga}</td>
							<td class="number">{item.piutangNilai}</td>
							<td class="number">{item.piutangTahun}</td>
							<td class="number">{item.piutangBunga}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<th colspan="7">Jumlah</th>
					<td class="number">{totalUtangNilai.toLocaleString('id-ID')}</td>
					<td colspan="2"></td>
					<td class="number">{totalPiutangNilai.toLocaleString('id-ID')}</td>
					<td colspan="2"></td>
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

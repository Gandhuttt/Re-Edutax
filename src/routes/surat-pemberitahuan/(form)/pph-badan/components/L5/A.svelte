<script lang="ts">
	import { ActionButton, DataTable, Stack, TableActions } from "$lib/re-ui-components";

	let {
		data,
		openModal,
		deleteItem
	}: {
		data: Array<{
			id: string | number;
			nitku: string;
			nama: string;
			alamat?: string;
			kelurahan?: string;
			kecamatan?: string;
			kabupaten?: string;
			provinsi?: string;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
	} = $props();
</script>

<Stack gap="12px">
	<div><ActionButton type="button" onclick={() => openModal(null)}>Tambah</ActionButton></div>
	<DataTable label="Alamat tempat kegiatan usaha" minWidth="1120px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Tindakan</th>
					<th scope="col">NI TKU</th>
					<th scope="col">Nama TKU</th>
					<th scope="col">Alamat</th>
					<th scope="col">Desa/Kelurahan</th>
					<th scope="col">Kecamatan</th>
					<th scope="col">Kota/Kabupaten</th>
					<th scope="col">Provinsi</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="8" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item (item.id)}
						<tr>
							<td>
								<TableActions
									actions={[
										{ label: 'Edit', onclick: () => openModal(item) },
										{ label: 'Hapus', danger: true, onclick: () => deleteItem(item.id) }
									]}
								/>
							</td>
							<td>{item.nitku}</td>
							<td>{item.nama}</td>
							<td>{item.alamat}</td>
							<td>{item.kelurahan}</td>
							<td>{item.kecamatan}</td>
							<td>{item.kabupaten}</td>
							<td>{item.provinsi}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</DataTable>
</Stack>

<style>
	.empty {
		text-align: center;
	}
</style>

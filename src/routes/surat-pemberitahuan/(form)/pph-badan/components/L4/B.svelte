<script lang="ts">
	import { ActionButton, DataTable, Stack, TableActions } from "$lib/re-ui-components";

	let {
		data,
		openModal,
		deleteItem,
		jenisPenghasilanOptions,
		readonly = false
	}: {
		data: Array<{
			id: string | number;
			jenisPenghasilan: string;
			sumberPenghasilan: string;
			penghasilanBruto: number;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		jenisPenghasilanOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	const jenisPenghasilanLabel = (kode: string) => jenisPenghasilanOptions.find((option) => option.value === kode)?.label ?? kode;
	let totalPenghasilanBruto = $derived(data.reduce((sum, item) => sum + Number(item.penghasilanBruto || 0), 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" disabled={readonly} onclick={() => openModal(null)}>Tambah</ActionButton></div>
	<DataTable label="Penghasilan yang tidak termasuk objek pajak" minWidth="1040px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Tindakan</th>
					<th scope="col">No</th>
					<th scope="col">Kode</th>
					<th scope="col">Jenis Penghasilan</th>
					<th scope="col">Sumber Penghasilan</th>
					<th scope="col">Penghasilan Bruto</th>
				</tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="6" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item, index (item.id)}
						<tr>
							<td><TableActions actions={[
								{ label: 'Edit', disabled: readonly, onclick: () => openModal(item) },
								{ label: 'Hapus', disabled: readonly, danger: true, onclick: () => deleteItem(item.id) }
							]} /></td>
							<td>{index + 1}</td>
							<td>{item.jenisPenghasilan}</td>
							<td>{jenisPenghasilanLabel(item.jenisPenghasilan)}</td>
							<td>{item.sumberPenghasilan}</td>
							<td class="number">{Number(item.penghasilanBruto || 0).toLocaleString('id-ID')}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="5">Jumlah</th>
					<td class="number">{totalPenghasilanBruto.toLocaleString('id-ID')}</td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<style>
	.empty { text-align: center; }
	.number { text-align: right; font-variant-numeric: tabular-nums; }
</style>

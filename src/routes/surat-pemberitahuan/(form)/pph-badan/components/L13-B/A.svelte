<script lang="ts">
	import { ActionButton, DataTable, FormSection, Stack, TableActions } from "$lib/re-ui-components";
	import ModalEditA from "./_ModalEditA.svelte";
	import type { L13BARow } from "./types";

	let {
		data = $bindable(),
		readonly = false,
	}: {
		data: L13BARow[];
		readonly?: boolean;
	} = $props();

	let editing = $state<Partial<L13BARow>>({});
	let modalOpen = $state(false);

	function emptyRow(): Partial<L13BARow> {
		return { perjanjianNomor: "", perjanjianTanggal: "", mitraKegiatan: "", keterangan: "" };
	}

	function openModal(row: L13BARow | null) {
		editing = row ? { ...row } : emptyRow();
		modalOpen = true;
	}

	function saveItem() {
		const index = data.findIndex((row) => row.id === editing.id);
		if (index !== -1) {
			data[index] = { ...(editing as L13BARow) };
		} else {
			data.push({ ...(editing as L13BARow), id: Date.now() });
		}
	}

	function deleteItem(id: string | number) {
		data = data.filter((row) => row.id !== id);
	}
</script>

<FormSection title="Perjanjian kerja sama" padded>
	<Stack gap="12px">
		<ActionButton type="button" disabled={readonly} onclick={() => openModal(null)}>Tambah</ActionButton>
		<DataTable
			label="Daftar perjanjian kerja sama"
			minWidth="920px"
			headerTone="navy"
			density="compact"
			stickyFirstColumn
		>
			<table>
				<thead>
					<tr>
						<th scope="col" rowspan="2">Tindakan</th>
						<th scope="col" rowspan="2">No.</th>
						<th scope="colgroup" colspan="2">Perjanjian kerja sama</th>
						<th scope="col" rowspan="2">Mitra kegiatan</th>
						<th scope="col" rowspan="2">Keterangan</th>
					</tr>
					<tr>
						<th scope="col">Nomor</th>
						<th scope="col">Tanggal</th>
					</tr>
				</thead>
				<tbody>
					{#if data.length === 0}
						<tr><td colspan="6" class="empty">Tidak ada data yang ditampilkan</td></tr>
					{:else}
						{#each data as row, index (row.id)}
							<tr>
								<td class="action-cell">
									<TableActions
										actions={[
											{ label: "Edit", disabled: readonly, onclick: () => openModal(row) },
											{ label: "Hapus", disabled: readonly, danger: true, onclick: () => deleteItem(row.id) },
										]}
									/>
								</td>
								<td class="center">{index + 1}</td>
								<td>{row.perjanjianNomor}</td>
								<td>{row.perjanjianTanggal}</td>
								<td>{row.mitraKegiatan}</td>
								<td>{row.keterangan}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</DataTable>
	</Stack>
</FormSection>

<ModalEditA bind:open={modalOpen} bind:data={editing} {saveItem} {readonly} />

<style>
	:global(.action-cell) {
		white-space: nowrap;
	}
	.center,
	.empty {
		text-align: center;
	}
</style>

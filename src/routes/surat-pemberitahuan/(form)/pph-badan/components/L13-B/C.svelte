<script lang="ts">
	import { ActionButton, DataTable, FormSection, Stack, TableActions } from "$lib/re-ui-components";
	import ModalEditC from "./_ModalEditC.svelte";
	import type { L13BCRow } from "./types";

	let {
		data = $bindable(),
		readonly = false,
	}: {
		data: L13BCRow[];
		readonly?: boolean;
	} = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	const tambahanPengurang = (row: L13BCRow) =>
		Math.round((Number(row.jumlahBiaya || 0) * Number(row.persentaseFasilitasPajak || 0)) / 100);

	let totalTambahanPengurang = $derived(data.reduce((sum, row) => sum + tambahanPengurang(row), 0));
	let editing = $state<Partial<L13BCRow>>({});
	let modalOpen = $state(false);

	function emptyRow(): Partial<L13BCRow> {
		return {
			nomorProposal: "",
			jangkaWaktuDariTahun: 0,
			jangkaWaktuSampaiTahun: 0,
			jumlahBiaya: 0,
			tahunPerolehanHki: 0,
			persentaseFasilitasPajak: 0,
		};
	}

	function openModal(row: L13BCRow | null) {
		editing = row ? { ...row } : emptyRow();
		modalOpen = true;
	}

	function saveItem() {
		const index = data.findIndex((row) => row.id === editing.id);
		if (index !== -1) {
			data[index] = { ...(editing as L13BCRow) };
		} else {
			data.push({ ...(editing as L13BCRow), id: Date.now() });
		}
	}

	function deleteItem(id: string | number) {
		data = data.filter((row) => row.id !== id);
	}
</script>

<FormSection title="Fasilitas penelitian dan pengembangan" padded>
	<Stack gap="12px">
		<ActionButton type="button" disabled={readonly} onclick={() => openModal(null)}>Tambah</ActionButton>
		<DataTable
			label="Daftar fasilitas penelitian dan pengembangan"
			minWidth="1320px"
			headerTone="navy"
			density="compact"
			stickyFirstColumn
		>
			<table>
				<thead>
					<tr>
						<th scope="col" rowspan="2">Tindakan</th>
						<th scope="col" rowspan="2">No.</th>
						<th scope="col" rowspan="2">Nomor proposal</th>
						<th scope="colgroup" colspan="2">Jangka waktu pengeluaran biaya</th>
						<th scope="col" rowspan="2" class="right">Jumlah biaya</th>
						<th scope="col" rowspan="2">Tahun perolehan hak kekayaan intelektual / komersialisasi</th>
						<th scope="col" rowspan="2" class="right">Persentase fasilitas pajak (%)</th>
						<th scope="col" rowspan="2" class="right">Tambahan pengurangan penghasilan bruto penelitian dan pengembangan</th>
					</tr>
					<tr>
						<th scope="col">Dari tahun</th>
						<th scope="col">Sampai tahun</th>
					</tr>
				</thead>
				<tbody>
					{#if data.length === 0}
						<tr><td colspan="9" class="empty">Tidak ada data yang ditampilkan</td></tr>
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
								<td>{row.nomorProposal}</td>
								<td>{row.jangkaWaktuDariTahun}</td>
								<td>{row.jangkaWaktuSampaiTahun}</td>
								<td class="right amount">{rupiah.format(row.jumlahBiaya)}</td>
								<td>{row.tahunPerolehanHki}</td>
								<td class="right">{row.persentaseFasilitasPajak}</td>
								<td class="right amount">{rupiah.format(tambahanPengurang(row))}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" colspan="8">Jumlah tambahan pengurangan penghasilan bruto penelitian dan pengembangan</th>
						<td class="right amount">{rupiah.format(totalTambahanPengurang)}</td>
					</tr>
				</tfoot>
			</table>
		</DataTable>
	</Stack>
</FormSection>

<ModalEditC bind:open={modalOpen} bind:data={editing} {saveItem} {readonly} />

<style>
	.center,
	.empty {
		text-align: center;
	}
	.right {
		text-align: right;
	}
	:global(.action-cell) {
		white-space: nowrap;
	}
</style>

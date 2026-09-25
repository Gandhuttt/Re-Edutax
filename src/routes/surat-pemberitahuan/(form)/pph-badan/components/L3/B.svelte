<script lang="ts">
	import { ActionButton, DataTable, Stack, StatusBadge, TableActions } from "$lib/re-ui-components";

	let {
		data,
		openModal,
		deleteItem,
		kreditPajakLuarNegeri = 0,
		readonly = false
	}: {
		data: Array<{
			id: string | number;
			namaPemotongPemungut: string;
			npwp: string;
			jenisPajak: string;
			dpp: number;
			pph: number;
			nomorBukti: string;
			tanggalBukti: string;
			sumberBuktiPotongId?: string | null;
		}>;
		openModal: (item: unknown) => void;
		deleteItem: (id: string | number) => void;
		kreditPajakLuarNegeri?: number;
		readonly?: boolean;
	} = $props();

	let totalDpp = $derived(data.reduce((sum, item) => sum + Number(item.dpp || 0), 0));
	let totalPph = $derived(data.reduce((sum, item) => sum + Number(item.pph || 0), 0));
	let jumlahKreditPajak = $derived(totalPph + Number(kreditPajakLuarNegeri || 0));
</script>

<Stack gap="12px">
	<div><ActionButton type="button" onclick={() => openModal(null)} disabled={readonly}>Tambah</ActionButton></div>
	<DataTable label="PPh yang dipotong atau dipungut pihak lain" minWidth="1160px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col" rowspan="2">Tindakan</th>
					<th scope="col" rowspan="2">No</th>
					<th scope="col" rowspan="2">Nama Pemotong/Pemungut</th>
					<th scope="col" rowspan="2">NPWP Pemotong/Pemungut</th>
					<th scope="col" rowspan="2">Jenis Pajak</th>
					<th scope="col" rowspan="2">Dasar Pengenaan Pajak (Rupiah)</th>
					<th scope="col" rowspan="2">PPh yang Dipotong/Dipungut (Rupiah)</th>
					<th scope="colgroup" colspan="2">Bukti Potong/SSP/SSPCP</th>
				</tr>
				<tr><th scope="col">Nomor</th><th scope="col">Tanggal</th></tr>
			</thead>
			<tbody>
				{#if data.length === 0}
					<tr><td colspan="9" class="empty">Tidak ada data yang ditampilkan</td></tr>
				{:else}
					{#each data as item, i (item.id)}
						<tr>
							<td><TableActions actions={[
								{ label: 'Edit', disabled: readonly, onclick: () => openModal(item) },
								{ label: 'Hapus', disabled: readonly, danger: true, onclick: () => deleteItem(item.id) }
							]} /></td>
							<td>{i + 1}</td>
							<td>{item.namaPemotongPemungut} {#if item.sumberBuktiPotongId}<StatusBadge label="Diimpor" />{/if}</td>
							<td>{item.npwp}</td>
							<td>{item.jenisPajak}</td>
							<td class="number">{Number(item.dpp || 0).toLocaleString('id-ID')}</td>
							<td class="number">{Number(item.pph || 0).toLocaleString('id-ID')}</td>
							<td>{item.nomorBukti}</td>
							<td>{item.tanggalBukti}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
			<tfoot>
				<tr><th colspan="5" scope="row">Jumlah</th><td class="number">{totalDpp.toLocaleString('id-ID')}</td><td class="number">{totalPph.toLocaleString('id-ID')}</td><td colspan="2"></td></tr>
				<tr><th colspan="6" scope="row">Kredit Pajak Luar Negeri</th><td class="number">{kreditPajakLuarNegeri.toLocaleString('id-ID')}</td><td colspan="2"></td></tr>
				<tr><th colspan="6" scope="row">Jumlah Kredit Pajak</th><td class="number">{jumlahKreditPajak.toLocaleString('id-ID')}</td><td colspan="2"></td></tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<style>
	.empty { text-align: center; }
	.number { text-align: right; font-variant-numeric: tabular-nums; }
	tfoot th { text-align: right; }
</style>

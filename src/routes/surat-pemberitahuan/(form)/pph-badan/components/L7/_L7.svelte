<script lang="ts">
	import { DataTable, FormSection, TableActions } from "$lib/re-ui-components";
	import ModalEdit from "./_ModalEdit.svelte";

	type Row = {
		tahunPajak: number;
		labaRugiNetoFiskal: number;
		kompensasiYMin4: number;
		kompensasiYMin3: number;
		kompensasiYMin2: number;
		kompensasiYMin1: number;
		kompensasiTahunIni: number;
		kompensasiYPlus1: number;
	};

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l7: Row[];
		readonly?: boolean;
	}

	let { currentTab = $bindable(), l7 = $bindable(), readonly = false }: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L7" ? "PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL" : currentTab.title;
	});

	const currentYear = l7.length ? l7[l7.length - 1].tahunPajak : new Date().getFullYear();
	const rupiah = new Intl.NumberFormat('id-ID');

	let editing = $state<Row>({
		tahunPajak: 0,
		labaRugiNetoFiskal: 0,
		kompensasiYMin4: 0,
		kompensasiYMin3: 0,
		kompensasiYMin2: 0,
		kompensasiYMin1: 0,
		kompensasiTahunIni: 0,
		kompensasiYPlus1: 0
	});
	let modalOpen = $state(false);

	function openModal(row: Row) {
		editing = { ...row };
		modalOpen = true;
	}

	function saveItem() {
		const index = l7.findIndex((row) => row.tahunPajak === editing.tahunPajak);
		if (index !== -1) {
			l7[index] = { ...editing };
		}
		modalOpen = false;
	}

	let jumlah = $derived(
		l7.reduce(
			(acc, row) => ({
				kompensasiYMin4: acc.kompensasiYMin4 + Number(row.kompensasiYMin4 || 0),
				kompensasiYMin3: acc.kompensasiYMin3 + Number(row.kompensasiYMin3 || 0),
				kompensasiYMin2: acc.kompensasiYMin2 + Number(row.kompensasiYMin2 || 0),
				kompensasiYMin1: acc.kompensasiYMin1 + Number(row.kompensasiYMin1 || 0),
				kompensasiTahunIni: acc.kompensasiTahunIni + Number(row.kompensasiTahunIni || 0),
				kompensasiYPlus1: acc.kompensasiYPlus1 + Number(row.kompensasiYPlus1 || 0)
			}),
			{
				kompensasiYMin4: 0,
				kompensasiYMin3: 0,
				kompensasiYMin2: 0,
				kompensasiYMin1: 0,
				kompensasiTahunIni: 0,
				kompensasiYPlus1: 0
			}
		)
	);
</script>

<div id="spt-panel-l7" role="tabpanel" hidden={currentTab.tab !== "L7"}>
	<FormSection title="Penghitungan Kompensasi Kerugian Fiskal" bordered padded={false}>
		<DataTable label="Penghitungan kompensasi kerugian fiskal" minWidth="1280px" headerTone="navy" density="compact" stickyFirstColumn framed={false}>
			<table>
				<thead>
					<tr>
						<th scope="col" rowspan="3">Tindakan</th>
						<th scope="col" rowspan="3">No.</th>
						<th scope="colgroup" rowspan="2" colspan="2">Laba (Rugi) Netto Fiskal</th>
						<th scope="colgroup" colspan="6">Kompensasi Kerugian Fiskal</th>
					</tr>
					<tr>
						<th scope="col">Y-4</th>
						<th scope="col">Y-3</th>
						<th scope="col">Y-2</th>
						<th scope="col">Y-1</th>
						<th scope="col">{currentYear}</th>
						<th scope="col">Y+1</th>
					</tr>
					<tr>
						<th scope="col">Tahun/Bagian Tahun Pajak</th>
						<th scope="col">Nilai (Rp)</th>
						<th scope="col">Nilai (Rp)</th>
						<th scope="col">Nilai (Rp)</th>
						<th scope="col">Nilai (Rp)</th>
						<th scope="col">Nilai (Rp)</th>
						<th scope="col">Tahun Pajak Ini - Nilai (Rp)</th>
						<th scope="col">Tahun Pajak Berjalan - Nilai (Rp)</th>
					</tr>
				</thead>
				<tbody>
					{#each l7 as row, index (row.tahunPajak)}
						<tr>
							<td><TableActions actions={[{ label: 'Edit', disabled: readonly, onclick: () => openModal(row) }]} /></td>
							<td class="center">{index + 1}</td>
							<td class="center">{row.tahunPajak}</td>
							<td class="number">{rupiah.format(row.labaRugiNetoFiskal)}</td>
							<td class="number">{rupiah.format(row.kompensasiYMin4)}</td>
							<td class="number">{rupiah.format(row.kompensasiYMin3)}</td>
							<td class="number">{rupiah.format(row.kompensasiYMin2)}</td>
							<td class="number">{rupiah.format(row.kompensasiYMin1)}</td>
							<td class="number">{rupiah.format(row.kompensasiTahunIni)}</td>
							<td class="number">{rupiah.format(row.kompensasiYPlus1)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" colspan="4">Jumlah</th>
						<td class="number">{rupiah.format(jumlah.kompensasiYMin4)}</td>
						<td class="number">{rupiah.format(jumlah.kompensasiYMin3)}</td>
						<td class="number">{rupiah.format(jumlah.kompensasiYMin2)}</td>
						<td class="number">{rupiah.format(jumlah.kompensasiYMin1)}</td>
						<td class="number">{rupiah.format(jumlah.kompensasiTahunIni)}</td>
						<td class="number">{rupiah.format(jumlah.kompensasiYPlus1)}</td>
					</tr>
				</tfoot>
			</table>
		</DataTable>
	</FormSection>
</div>

<ModalEdit bind:open={modalOpen} bind:data={editing} {saveItem} {readonly} />

<style>
	.center { text-align: center; }
	.number { text-align: right; font-variant-numeric: tabular-nums; }
</style>

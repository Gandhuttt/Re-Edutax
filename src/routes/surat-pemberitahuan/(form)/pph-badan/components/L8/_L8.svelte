<script lang="ts">
	import { DataTable, FormSection, RupiahField } from "$lib/re-ui-components";
	import { hitungFasilitas31E } from "./fasilitas31e";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		jumlahPeredaranBruto: number;
		penghasilanKenaPajak: number;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		jumlahPeredaranBruto = $bindable(),
		penghasilanKenaPajak,
		readonly = false
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L8" ? "PERHITUNGAN FASILITAS PENGURANGAN TARIF PPh  BAGI WAJIB PAJAK BADAN DALAM NEGERI BERDASARKAN PASAL 31E AYAT (1) UDANG-UNDANG PPh" : currentTab.title;
	});

	let hasil = $derived(hitungFasilitas31E(Number(jumlahPeredaranBruto || 0), Number(penghasilanKenaPajak || 0)));
</script>

<div id="spt-panel-l8" role="tabpanel" hidden={currentTab.tab !== "L8"}>
	<FormSection title="Perhitungan Fasilitas Pengurangan Tarif PPh bagi Wajib Pajak Badan Dalam Negeri Berdasarkan Pasal 31E Ayat (1) Undang-Undang PPh" bordered padded={false}>
		<div class="facility-table">
			<DataTable label="Perhitungan fasilitas pengurangan tarif PPh" minWidth="820px" headerTone="navy" density="compact" framed={false}>
				<table>
					<thead>
						<tr>
							<th scope="col">No.</th>
							<th scope="col">Deskripsi</th>
							<th scope="col">Amount (Rupiah)</th>
						</tr>
					</thead>
					<tbody>
						<tr><th scope="row">1.</th><th colspan="2">Jumlah Peredaran Bruto</th></tr>
						<tr>
							<td></td>
							<td>Jumlah Peredaran Bruto</td>
							<td><RupiahField label="Jumlah Peredaran Bruto" bind:value={jumlahPeredaranBruto} disabled={readonly} /></td>
						</tr>
						<tr><th scope="row">2.</th><th colspan="2">Penghasilan Kena Pajak</th></tr>
						<tr>
							<td></td>
							<td>Penghasilan Kena Pajak dari bagian peredaran bruto yang memperoleh fasilitas</td>
							<td><RupiahField label="Penghasilan Kena Pajak yang memperoleh fasilitas" value={hasil.penghasilanKenaPajakMendapatFasilitas} disabled /></td>
						</tr>
						<tr>
							<td></td>
							<td>Penghasilan Kena Pajak dari bagian peredaran bruto yang tidak memperoleh fasilitas</td>
							<td><RupiahField label="Penghasilan Kena Pajak yang tidak memperoleh fasilitas" value={hasil.penghasilanKenaPajakTidakMendapatFasilitas} disabled /></td>
						</tr>
						<tr><th scope="row">3.</th><th colspan="2">Pajak Terutang</th></tr>
						<tr>
							<td></td>
							<td>PPh Terutang atas Penghasilan Kena Pajak dari bagian peredaran bruto yang memperoleh fasilitas</td>
							<td><RupiahField label="PPh terutang yang memperoleh fasilitas" value={hasil.pphTerutangMendapatFasilitas} disabled /></td>
						</tr>
						<tr>
							<td></td>
							<td>PPh Terutang atas Penghasilan Kena Pajak dari bagian peredaran bruto yang tidak memperoleh fasilitas</td>
							<td><RupiahField label="PPh terutang yang tidak memperoleh fasilitas" value={hasil.pphTerutangTidakMendapatFasilitas} disabled /></td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th scope="row" colspan="2">Jumlah PPh Terutang</th>
							<td class="number">{hasil.pphTerutangJumlah.toLocaleString('id-ID')}</td>
						</tr>
					</tfoot>
				</table>
			</DataTable>
		</div>
	</FormSection>
</div>

<style>
	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.facility-table :global(td label > .label),
	.facility-table :global(td .field > .label) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>

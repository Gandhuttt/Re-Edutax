<script lang="ts">
	import { ActionButton, DataTable, FormSection, Stack } from "$lib/re-ui-components";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
	}

	let { currentTab = $bindable() }: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L13-A" ? "DAFTAR FASILITAS PENANAMAN MODAL" : currentTab.title;
	});
</script>

<div id="spt-panel-l13-a" role="tabpanel" hidden={currentTab.tab !== "L13-A"}>
	<FormSection title="FASILITAS PERPAJAKAN DALAM RANGKA PENANAMAN MODAL" padded={false} bordered>
		<Stack gap="12px" align="start">
			<ActionButton tone="secondary">Tambah</ActionButton>
			<DataTable label="Fasilitas perpajakan dalam rangka penanaman modal" minWidth="2800px" headerTone="navy" density="compact" stickyFirstColumn>
				<table>
					<thead>
						<tr>
							<th scope="col" rowspan="2">TINDAKAN</th>
							<th scope="col" rowspan="2">NO.</th>
							<th scope="colgroup" colspan="2">KEPUTUSAN PEMBERIAN FASILITAS</th>
							<th scope="colgroup" colspan="2">KEPUTUSAN PEMANFAATAN FASILITAS</th>
							<th scope="colgroup" colspan="4">JUMLAH PENANAMAN MODAL YANG DISETUJUI</th>
							<th scope="col" rowspan="2">BENTUK PENANAMAN MODAL</th>
							<th scope="col" rowspan="2">DI BIDANG DAN/ATAU DAERAH</th>
							<th scope="col" rowspan="2">FASILITAS YANG DIBERIKAN</th>
							<th scope="col" rowspan="2">PERSENTASE PENGURANGAN PENGHASILAN NETO</th>
							<th scope="col" rowspan="2">PENAMBAHAN JANGKA WAKTU KOMPENSASI KERUGIAN</th>
							<th scope="colgroup" colspan="2">REALISASI PENANAMAN MODAL</th>
							<th scope="col" rowspan="2">SAAT MULAI BERPRODUKSI KOMERSIAL</th>
							<th scope="colgroup" colspan="2">FASILITAS PENGURANGAN PENGHASILAN NETO</th>
						</tr>
						<tr>
							<th scope="col">NO.</th><th scope="col">TANGGAL</th>
							<th scope="col">NO.</th><th scope="col">TANGGAL</th>
							<th scope="col">DALAM MATA UANG ASING</th>
							<th scope="col">EKUIVALEN</th>
							<th scope="col">DALAM RUPIAH</th>
							<th scope="col">JUMLAH (Rp)</th>
							<th scope="col">PENYUSUTAN TAHUN INI</th>
							<th scope="col">S.D. TAHUN INI</th>
							<th scope="col">TAHUN KE-</th>
							<th scope="col">JUMLAH (Rp)</th>
						</tr>
					</thead>
					<tbody>
						{#if true}
							<tr><td class="empty" colspan="20">Tidak ada data yang ditampilkan</td></tr>
						{:else}
							<tr>
								<td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
								<td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
								<td>tset</td><td>tset</td><td>tset</td><td>tset</td><td>tset</td><td>tset</td>
								<td>tset</td><td>tset</td><td>tset</td><td>tset</td><td>tset</td><td>tset</td>
								<td>tset</td><td>tset</td>
							</tr>
						{/if}
					</tbody>
					<tfoot>
						<tr>
							<th scope="row" colspan="19">JUMLAH FASILITAS PENGURANGAN PENGHASILAN NETO</th>
							<td class="right">0</td>
						</tr>
					</tfoot>
				</table>
			</DataTable>
		</Stack>
	</FormSection>
</div>

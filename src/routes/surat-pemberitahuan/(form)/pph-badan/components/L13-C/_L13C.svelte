<script lang="ts">
	import {
		ActionButton,
		DataTable,
		DisclosureItem,
		FormSection,
		Stack,
	} from "$lib/re-ui-components";
	import ModalEdit from "./_ModalEdit.svelte";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
	}

	let { currentTab = $bindable() }: Props = $props();
	let modalOpen = $state(false);

	$effect(() => {
		currentTab.title = currentTab.tab === "L13-C"
			? "DAFTAR FASILITAS PENGURANGAN PPh BADAN"
			: currentTab.title;
	});
</script>

<div class:hidden={currentTab.tab !== "L13-C"}>
	<Stack gap="0" class="tw:mt-5">
		<DisclosureItem id="l13c-fasilitas" title="DAFTAR FASILITAS PENGURANGAN PPh BADAN" open>
			<FormSection title="Fasilitas pengurangan PPh badan" padded>
				<Stack gap="12px">
					<ActionButton type="button" onclick={() => (modalOpen = true)}>Tambah</ActionButton>
					<DataTable
						label="Daftar fasilitas pengurangan PPh badan"
						minWidth="1500px"
						headerTone="navy"
						density="compact"
						stickyFirstColumn
					>
						<table>
							<thead>
								<tr>
									<th scope="col" rowspan="2">Tindakan</th>
									<th scope="col" rowspan="2">No.</th>
									<th scope="colgroup" colspan="2">Keputusan pemberian fasilitas</th>
									<th scope="colgroup" colspan="2">Keputusan pemanfaatan fasilitas</th>
									<th scope="col" rowspan="2">Jangka waktu fasilitas (tahun)</th>
									<th scope="col" rowspan="2">Pemanfaatan tahun ke-</th>
									<th scope="col" rowspan="2">Persentase pengurangan PPh</th>
									<th scope="colgroup" colspan="3">Penghitungan fasilitas pengurangan PPh badan</th>
								</tr>
								<tr>
									<th scope="col">No.</th>
									<th scope="col">Tanggal</th>
									<th scope="col">No.</th>
									<th scope="col">Tanggal</th>
									<th scope="col">Penghasilan kena pajak</th>
									<th scope="col">PPh terutang</th>
									<th scope="col">Besaran fasilitas pengurangan PPh terutang</th>
								</tr>
							</thead>
							<tbody>
								<tr><td colspan="12" class="empty">Tidak ada data yang ditampilkan</td></tr>
							</tbody>
							<tfoot>
								<tr>
									<th scope="row" colspan="11">Jumlah fasilitas pengurangan PPh terutang</th>
									<td class="right amount">0,00</td>
								</tr>
							</tfoot>
						</table>
					</DataTable>
				</Stack>
			</FormSection>
		</DisclosureItem>
	</Stack>
</div>

<ModalEdit bind:open={modalOpen} />

<style>
	.hidden {
		display: none;
	}
	.empty {
		text-align: center;
	}
	.right {
		text-align: right;
	}
</style>

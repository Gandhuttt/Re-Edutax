<script lang="ts">
	import {
		ActionButton,
		DataTable,
		DisclosureItem,
		FormSection,
		Stack,
	} from "$lib/re-ui-components";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
	}

	let { currentTab = $bindable() }: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L14"
			? "PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARAN DAN PRASARANA"
			: currentTab.title;
	});

	const currentYear = new Date().getFullYear();
</script>

<div class:hidden={currentTab.tab !== "L14"}>
	<Stack gap="0" class="tw:mt-5">
		<DisclosureItem
			id="l14-penggunaan-sisa-lebih"
			title="PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARANA DAN PRASARANA"
			open
		>
			<FormSection title="Penggunaan sisa lebih" padded>
				<Stack gap="12px">
					<ActionButton type="button">Tambah</ActionButton>
					<DataTable
						label="Penggunaan sisa lebih untuk pembangunan dan pengadaan sarana dan prasarana"
						minWidth="1640px"
						headerTone="navy"
						density="compact"
						stickyFirstColumn
					>
						<table>
							<thead>
								<tr>
									<th scope="col" rowspan="3">Tindakan</th>
									<th scope="col" rowspan="3">Tahun pajak/bagian tahun pajak</th>
									<th scope="col" rowspan="2">Penyediaan sisa lebih untuk ditanamkan kembali selama 4 tahun</th>
									<th scope="col" rowspan="3">Bentuk penanaman kembali sisa lebih</th>
									<th scope="colgroup" colspan="4">Penggunaan sisa lebih untuk pembangunan dan pengadaan sarana dan prasarana</th>
									<th scope="col" rowspan="2">Jumlah penggunaan sisa lebih</th>
									<th scope="col" rowspan="2">Sisa lebih yang belum ditanamkan kembali</th>
									<th scope="col" rowspan="2">Sisa lebih yang melewati jangka waktu penanaman kembali dalam jangka waktu 4 tahun</th>
								</tr>
								<tr>
									<th scope="col">Tahun ke-1</th>
									<th scope="col">Tahun ke-2</th>
									<th scope="col">Tahun ke-3</th>
									<th scope="col">Tahun ke-4</th>
								</tr>
								<tr>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
									<th scope="col">Rupiah</th>
								</tr>
							</thead>
							<tbody>
								{#each { length: 4 } as _, index}
									{@const indexYear = currentYear - (3 - index)}
									<tr>
										<td class="center">
											{#if indexYear !== currentYear}<ActionButton tone="quiet">Edit</ActionButton>{/if}
										</td>
										<td class="center">{indexYear}</td>
										<td class="right">0</td>
										<td></td>
										<td class="right">0</td>
										<td class="right">0</td>
										<td class="right">0</td>
										<td class="right">0</td>
										<td class="right">0</td>
										<td class="right">0</td>
										<td class="right">0</td>
									</tr>
								{/each}
							</tbody>
							<tfoot>
								<tr>
									<th scope="row" colspan="9">Jumlah</th>
									<td class="right">0</td>
									<td class="right">0</td>
								</tr>
								<tr>
									<th scope="row" colspan="10">Sisa lebih yang dapat digunakan kembali</th>
									<td class="right">0</td>
								</tr>
							</tfoot>
						</table>
					</DataTable>
				</Stack>
			</FormSection>
		</DisclosureItem>
	</Stack>
</div>

<style>
	.hidden {
		display: none;
	}
	.center {
		text-align: center;
	}
	.right {
		text-align: right;
	}
</style>

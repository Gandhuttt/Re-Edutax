<script lang="ts">
	import {
		ActionButton,
		DataTable,
		DisclosureItem,
		FieldGrid,
		FormField,
		RupiahField,
		Stack,
	} from "$lib/re-ui-components";
</script>

<Stack gap="0">
	<DisclosureItem title="IV.A DAFTAR SARANA DAN FASILITAS SERTA PENYUSUTANNYA">
		<Stack gap="12px" align="start">
			<ActionButton tone="secondary">Tambah</ActionButton>
			<DataTable label="Daftar sarana dan fasilitas serta penyusutannya" minWidth="1050px" headerTone="navy" density="compact" stickyFirstColumn>
				<table>
					<thead>
						<tr>
							<th scope="col" rowspan="2">TINDAKAN</th>
							<th scope="col" rowspan="2">NO.</th>
							<th scope="col" rowspan="2">JENIS HARTA BERWUJUD</th>
							<th scope="col" rowspan="2">TAHUN PEROLEHAN</th>
							<th scope="col" rowspan="2">NILAI PEROLEHAN</th>
							<th scope="colgroup" colspan="3">PENYUSUTAN</th>
						</tr>
						<tr>
							<th scope="col">S.D. TAHUN LALU</th>
							<th scope="col">PENYUSUTAN TAHUN INI</th>
							<th scope="col">S.D. TAHUN INI</th>
						</tr>
					</thead>
					<tbody>
						{#if true}
							<tr><td class="empty" colspan="8">Tidak ada data yang ditampilkan</td></tr>
						{:else}
							<tr>
								<td class="action-cell"><ActionButton tone="quiet">Edit</ActionButton></td>
								<td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
								<td>tset</td><td>tset</td><td>tset</td><td>tset</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</DataTable>
		</Stack>
	</DisclosureItem>

	<DisclosureItem title="IV.B RINCIAN PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN YANG DIBERIKAN BERKENAAN DENGAN PELAKSANAAN PEKERJAAN DI DAERAH TERTENTU">
		<FieldGrid columns={1}>
			<FormField label="Alamat Lokasi" type="text" />
			<FormField label="Nomor Surat Keputusan Penetapan Daerah Tertentu" type="text" />
			<FormField label="Tanggal Surat Keputusan Penetapan Daerah Tertentu" type="date" />
			<FormField label="Nomor Surat Keputusan  Perpanjangan Penetapan Daerah Tertentu" type="text" />
			<FormField label="Tanggal Surat Keputusan  Perpanjangan Penetapan Daerah Tertentu" type="date" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pegawai dan keluarganya" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pelayanan kesehatan" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pendidikan bagi pegawai dan keluarganya" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk peribadatan" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pengangkutan bagi pegawai dan keluarganya" />
			<RupiahField label="Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk olahraga bagi pegawai dan keluarganya, tidak termasuk golf, power boating, pacuan kuda, dan terbang layang" />
			<RupiahField label="Jumlah Biaya yang dikeluarkan" readonly />
		</FieldGrid>
	</DisclosureItem>
</Stack>

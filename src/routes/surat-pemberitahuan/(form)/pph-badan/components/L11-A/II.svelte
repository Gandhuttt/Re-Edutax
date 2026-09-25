<script lang="ts">
	import { ActionButton, DataTable, Stack } from "$lib/re-ui-components";
</script>

<Stack gap="12px" align="start">
	<ActionButton tone="secondary">Tambah</ActionButton>
	<DataTable label="Daftar nominatif biaya entertainment" minWidth="1600px" headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead>
				<tr>
					<th scope="col">TINDAKAN</th>
					<th scope="col">TANGGAL PEMBERIAN ENTERTAINMENT</th>
					<th scope="col">TEMPAT PEMBERIAN ENTERTAINMENT</th>
					<th scope="col">ALAMAT PEMBERI ENTERTAINMENT</th>
					<th scope="col">JENIS PEMBERIAN ENTERTAINMENT</th>
					<th scope="col">NILAI PEMBERIAN ENTERTAINMENT (Rp.)</th>
					<th scope="col">NAMA RELASI USAHA</th>
					<th scope="col">JABATAN RELASI USAHA</th>
					<th scope="col">NAMA PERUSAHAAN RELASI USAHA</th>
					<th scope="col">JENIS USAHA RELASI USAHA</th>
					<th scope="col">USAHA TIDAK MENGKHIANATI HASIL</th>
				</tr>
			</thead>
			<tbody>
				{#if true}
					<tr><td class="empty" colspan="11">Tidak ada data yang ditampilkan</td></tr>
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

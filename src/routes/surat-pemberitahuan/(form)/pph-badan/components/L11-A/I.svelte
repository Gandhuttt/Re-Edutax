<script lang="ts">
	import { ActionButton, DataTable, Stack } from "$lib/re-ui-components";
</script>

<Stack gap="12px" align="start">
	<ActionButton tone="secondary">Tambah</ActionButton>
	<DataTable label="Daftar nominatif biaya promosi dan penjualan" minWidth="1450px" headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead>
				<tr>
					<th scope="col">TINDAKAN</th>
					<th scope="col">NO.</th>
					<th scope="col">NOMOR IDENTITAS PENERIMA</th>
					<th scope="col">NAMA PENERIMA</th>
					<th scope="col">ALAMAT PENERIMA</th>
					<th scope="col">TANGGAL</th>
					<th scope="col">JENIS BIAYA</th>
					<th scope="col">NILAI (Rp.)</th>
					<th scope="col">KETERANGAN</th>
					<th scope="col">PPh YANG DIPOTONG/DIPUNGUT (Rp.)Rp.)</th>
				</tr>
			</thead>
			<tbody>
				{#if true}
					<tr><td class="empty" colspan="10">Tidak ada data yang ditampilkan</td></tr>
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

<script lang="ts">
	import { ActionButton, DataTable, Stack } from "$lib/re-ui-components";
</script>

<Stack gap="12px" align="start">
	<ActionButton tone="secondary">Tambah</ActionButton>
	<DataTable label="Daftar debitur non-performing loan" minWidth="1400px" headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead>
				<tr>
					<th scope="col">TINDAKAN</th>
					<th scope="col">NO.</th>
					<th scope="col">NOMOR IDENTITAS</th>
					<th scope="col">NAMA DEBITUR</th>
					<th scope="col">ALAMAT</th>
					<th scope="col">NILAI KREDIT KURANG LANCAR AWAL TAHUN BUKU</th>
					<th scope="col">NILAI KREDIT KURANG LANCAR AKHIR TAHUN BUKU</th>
					<th scope="col">JUMLAH BUNGA PADA TAHUN BUKU (AKRUAL)</th>
					<th scope="col">KATEGORI</th>
				</tr>
			</thead>
			<tbody>
				{#if true}
					<tr><td class="empty" colspan="9">Tidak ada data yang ditampilkan</td></tr>
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

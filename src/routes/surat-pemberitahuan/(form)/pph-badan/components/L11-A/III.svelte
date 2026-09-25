<script lang="ts">
	import { ActionButton, DataTable, Stack } from "$lib/re-ui-components";
</script>

<Stack gap="12px" align="start">
	<ActionButton tone="secondary">Tambah</ActionButton>
	<DataTable label="Daftar piutang yang nyata-nyata tidak dapat ditagih" minWidth="1500px" headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead>
				<tr>
					<th scope="col">TINDAKAN</th>
					<th scope="col">NO.</th>
					<th scope="col">NOMOR IDENTITAS</th>
					<th scope="col">NAMA DEBITUR</th>
					<th scope="col">ALAMAT</th>
					<th scope="col">PLAFON PIUTANG</th>
					<th scope="col">PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH</th>
					<th scope="col">METODE PEMBEBANAN</th>
					<th scope="col">JENIS DOKUMEN PEMBUKTI</th>
					<th scope="col">SCROLL KEKANAN</th>
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

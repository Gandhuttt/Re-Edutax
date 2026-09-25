<script lang="ts">
	import { ActionButton, DataTable, RadioGroup, Stack } from "$lib/re-ui-components";

	let utangSwasta = $state<boolean>();
</script>

<Stack gap="18px">
	<Stack gap="12px" align="start">
		<ActionButton tone="secondary">Tambah</ActionButton>
		<DataTable label="Penghitungan biaya pinjaman" minWidth="1200px" headerTone="navy" density="compact" stickyFirstColumn>
			<table>
				<thead>
					<tr>
						<th scope="col">TINDAKAN</th>
						<th scope="col">PEMBERI PINJAMAN</th>
						<th scope="col">SALDO RATA-RATA UTANG</th>
						<th scope="col">BIAYA PINJAMAN (BUNGA)</th>
						<th scope="col">BIAYA PINJAMAN YANG DAPAT DIPERHITUNGKAN</th>
						<th scope="col">BIAYA PINJAMAN YANG TIDAK DAPAT DIPERHITUNGKAN</th>
					</tr>
				</thead>
				<tbody>
					{#if true}
						<tr><td class="empty" colspan="6">Tidak ada data yang ditampilkan</td></tr>
					{:else}
						<tr>
							<td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
							<td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
							<td>tset</td><td>tset</td><td>tset</td><td>tset</td>
						</tr>
					{/if}
				</tbody>
				<tfoot>
					<tr>
						<th scope="row" colspan="2">JUMLAH</th>
						<td class="right">0</td><td class="right">0</td><td class="right">0</td><td class="right">0</td>
					</tr>
				</tfoot>
			</table>
		</DataTable>
	</Stack>
	<RadioGroup
		label="Apakah Anda mempunyai utang swasta luar negeri?"
		name="utangSwasta"
		value={utangSwasta === undefined ? "" : String(utangSwasta)}
		options={[
			{ value: "false", label: "Tidak" },
			{ value: "true", label: "Ya" },
		]}
		onchange={(value) => (utangSwasta = value === "true")}
	/>
</Stack>

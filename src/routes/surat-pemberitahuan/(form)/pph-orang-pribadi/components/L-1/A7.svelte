<script lang="ts">
	import { DataTable, FormSection } from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import type { Harta } from "./types";

	interface Props {
		harta: Harta;
	}

	let { harta }: Props = $props();

	const judul = {
		a1: "1. KAS DAN SETARA KAS",
		a2: "2. PIUTANG",
		a3: "3. INVESTASI/SEKURITAS",
		a4: "4. HARTA BERGERAK",
		a5: "5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)",
		a6: "6. HARTA LAINNYA"
	} as const;

	let baris = $derived(
		(["a1", "a2", "a3", "a4", "a5", "a6"] as const).map((key) => ({
			deskripsi: judul[key],
			hargaPerolehan: harta[key].reduce(
				(sum, row) => sum + Number(("hargaPerolehan" in row ? row.hargaPerolehan : row.nilaiSaatIni) || 0),
				0
			),
			nilaiSaatIni: harta[key].reduce((sum, row) => sum + Number(row.nilaiSaatIni || 0), 0)
		}))
	);
	let totalHarga = $derived(baris.reduce((sum, row) => sum + row.hargaPerolehan, 0));
	let totalNilai = $derived(baris.reduce((sum, row) => sum + row.nilaiSaatIni, 0));
</script>

<FormSection number="7" title="IKHTISAR HARTA" bordered padded={false}>
	<DataTable label="Ikhtisar harta" minWidth="680px" framed={false} headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Deskripsi</th>
					<th scope="col" class="right">Harga Perolehan</th>
					<th scope="col" class="right">Nilai Saat Ini</th>
				</tr>
			</thead>
			<tbody>
				{#each baris as row}
					<tr>
						<td>{row.deskripsi}</td>
						<td class="number amount">{formatRupiahDerived(row.hargaPerolehan)}</td>
						<td class="number amount">{formatRupiahDerived(row.nilaiSaatIni)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row">Jumlah Harta pada Akhir Tahun Pajak</th>
					<td class="number amount">{formatRupiahDerived(totalHarga)}</td>
					<td class="number amount">{formatRupiahDerived(totalNilai)}</td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</FormSection>

<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup } from "$lib/re-ui-components";
	import type { computeIndukDEF } from "./computeIndukDEF";

	interface Props {
		computed: ReturnType<typeof computeIndukDEF>;
		g20WajibLaporAngsuranPph25: boolean;
		readonly?: boolean;
	}

	let {
		computed,
		g20WajibLaporAngsuranPph25 = $bindable(),
		readonly = false,
	}: Props = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
</script>

<DataTable label="Penghitungan angsuran PPh Pasal 25 tahun berjalan" minWidth="1240px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Uraian</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>20.</td>
				<td>Apakah Wajib Pajak merupakan Wajib Pajak tertentu yang harus menyampaikan Laporan Perhitungan Angsuran PPh Pasal 25? *</td>
				<td><RadioGroup label="Wajib menyampaikan laporan penghitungan angsuran PPh Pasal 25" name="G20" value={String(g20WajibLaporAngsuranPph25)} options={yesNoOptions} required onchange={(value) => (g20WajibLaporAngsuranPph25 = value === "true")} /></td>
				<td><FormField label="Angsuran PPh Pasal 25 tahun depan" value={rupiah.format(computed.angsuranPph25TahunDepan)} disabled /></td>
				<td>
					{#if g20WajibLaporAngsuranPph25 != undefined}
						<InlineAlert compact message={g20WajibLaporAngsuranPph25 ? "Ya, silahkan lanjut pertanyaan berikutnya.\nPastikan anda menyampaikan Laporan Penghitungan PPh Pasal 25." : "Tidak, silahkan mengisi lampiran 6"} />
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
</DataTable>

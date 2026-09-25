<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup, RupiahField } from "$lib/re-ui-components";
	import type { computeIndukDEF } from "./computeIndukDEF";

	interface Props {
		computed: ReturnType<typeof computeIndukDEF>;
		e13AdaKreditPajakLuarNegeri: boolean;
		e14AngsuranPph25TahunBerjalan: number;
		e15StpPph25: number;
		e16FasilitasPenguranganPphTerutang: boolean;
		readonly?: boolean;
	}

	let {
		computed,
		e13AdaKreditPajakLuarNegeri = $bindable(),
		e14AngsuranPph25TahunBerjalan = $bindable(),
		e15StpPph25 = $bindable(),
		e16FasilitasPenguranganPphTerutang = $bindable(),
		readonly = false,
	}: Props = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
</script>

<DataTable label="Kredit pajak" minWidth="1240px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Uraian</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>13.</td>
				<td>Apakah terdapat kredit pajak yang dibayarkan di luar negeri dan/atau dipotong/pungut oleh pihak lain?</td>
				<td><RadioGroup label="Kredit pajak luar negeri atau dipotong pihak lain" name="E13" value={String(e13AdaKreditPajakLuarNegeri)} options={yesNoOptions} onchange={(value) => (e13AdaKreditPajakLuarNegeri = value === "true")} /></td>
				<td><FormField label="Jumlah kredit pajak" value={rupiah.format(computed.e13Amt)} disabled /></td>
				<td>{#if e13AdaKreditPajakLuarNegeri != undefined}<InlineAlert compact message={e13AdaKreditPajakLuarNegeri ? "Ya, silahkan mengisi lampiran 3" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
			<tr>
				<td>14.</td><td>Angsuran PPh Pasal 25</td><td></td>
				<td><RupiahField label="Angsuran PPh Pasal 25" bind:value={e14AngsuranPph25TahunBerjalan} disabled={readonly} /></td><td></td>
			</tr>
			<tr>
				<td>15.</td><td>Surat Tagihan Pajak PPh Pasal 25 (hanya pokok pajak)</td><td></td>
				<td><RupiahField label="Surat Tagihan Pajak PPh Pasal 25" bind:value={e15StpPph25} disabled={readonly} /></td><td></td>
			</tr>
			<tr>
				<td>16.</td>
				<td>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan PPh Badan? *</td>
				<td><RadioGroup label="Fasilitas pengurangan PPh Badan" name="E16" value={String(e16FasilitasPenguranganPphTerutang)} options={yesNoOptions} required onchange={(value) => (e16FasilitasPenguranganPphTerutang = value === "true")} /></td>
				<td><FormField label="Pengurangan PPh Badan" value="0" disabled /></td>
				<td>{#if e16FasilitasPenguranganPphTerutang != undefined}<InlineAlert compact message={e16FasilitasPenguranganPphTerutang ? "Ya, silahkan mengisi lampiran 13C" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
		</tbody>
	</table>
</DataTable>

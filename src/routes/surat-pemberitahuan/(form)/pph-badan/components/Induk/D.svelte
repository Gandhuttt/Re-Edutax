<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup, SelectField, Stack } from "$lib/re-ui-components";
	import type { computeIndukDEF } from "./computeIndukDEF";

	interface Props {
		computed: ReturnType<typeof computeIndukDEF>;
		d5FasilitasPenanamanModal: boolean;
		d6FasilitasBrutoVokasi: boolean;
		d8AdaKompensasiKerugian: boolean;
		d10FasilitasBrutoLitbang: boolean;
		tarifPajak: string;
		persentaseTarifLainnya: number;
		readonly?: boolean;
	}

	let {
		computed,
		d5FasilitasPenanamanModal = $bindable(),
		d6FasilitasBrutoVokasi = $bindable(),
		d8AdaKompensasiKerugian = $bindable(),
		d10FasilitasBrutoLitbang = $bindable(),
		tarifPajak = $bindable(),
		persentaseTarifLainnya = $bindable(),
		readonly = false,
	}: Props = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	const tarifPajakOptions = [
		{ value: "pasal_17_1_b", label: "a. Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh" },
		{ value: "pasal_17_2b", label: "b. Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh" },
		{ value: "pasal_31e", label: "c. Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh" },
		{ value: "lainnya", label: "d. Tarif Pajak Lainnya" },
	];
	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
</script>

<DataTable label="Penghitungan PPh" minWidth="1240px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Uraian</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr><td>4.</td><td>Penghasilan Neto Fiskal sebelum Fasilitas Pajak</td><td></td><td><FormField label="Penghasilan Neto Fiskal sebelum Fasilitas Pajak" value={rupiah.format(computed.d4)} disabled /></td><td></td></tr>
			<tr>
				<td>5.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Perpajakan Dalam Rangka Penanaman Modal berupa pengurangan penghasilan neto? *</td>
				<td><RadioGroup label="Fasilitas penanaman modal" name="D5" value={String(d5FasilitasPenanamanModal)} options={yesNoOptions} onchange={(value) => (d5FasilitasPenanamanModal = value === "true")} /></td>
				<td><FormField label="Pengurangan penghasilan neto" value="0" disabled /></td>
				<td>{#if d5FasilitasPenanamanModal != undefined}<InlineAlert compact message={d5FasilitasPenanamanModal ? "Ya, silahkan mengisi lampiran 13A" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
			<tr>
				<td>6.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan Penghasilan Bruto untuk Kegiatan Praktik Kerja, Pemagangan, dan/atau Pembelajaran Dalam Rangka Pembinaan dan Pengembangan Sumber daya Manusia Berbasis Kompetensi Tertentu? *</td>
				<td><RadioGroup label="Fasilitas penghasilan bruto vokasi" name="D6" value={String(d6FasilitasBrutoVokasi)} options={yesNoOptions} onchange={(value) => (d6FasilitasBrutoVokasi = value === "true")} /></td>
				<td><FormField label="Pengurangan penghasilan bruto vokasi" value={rupiah.format(computed.d6Amt)} disabled /></td>
				<td>{#if d6FasilitasBrutoVokasi != undefined}<InlineAlert compact message={d6FasilitasBrutoVokasi ? "Ya, silahkan mengisi lampiran 13B tabel A dan B" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
			<tr><td>7.</td><td>Penghasilan Neto Fiskal Setelah Fasilitas Pajak</td><td></td><td><FormField label="Penghasilan Neto Fiskal Setelah Fasilitas Pajak" value={rupiah.format(computed.d7)} disabled /></td><td></td></tr>
			<tr>
				<td>8.</td><td>Apakah terdapat kerugian fiskal yang dapat dikompensasikan? *</td>
				<td><RadioGroup label="Kompensasi kerugian fiskal" name="D8" value={String(d8AdaKompensasiKerugian)} options={yesNoOptions} onchange={(value) => (d8AdaKompensasiKerugian = value === "true")} /></td>
				<td><FormField label="Kompensasi kerugian fiskal" value={rupiah.format(computed.d8Amt)} disabled /></td>
				<td>{#if d8AdaKompensasiKerugian != undefined}<InlineAlert compact message={d8AdaKompensasiKerugian ? "Ya, silahkan mengisi lampiran 7" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
			<tr><td>9.</td><td>Penghasilan Kena Pajak</td><td></td><td><FormField label="Penghasilan Kena Pajak" value={rupiah.format(computed.d9)} disabled /></td><td></td></tr>
			<tr>
				<td>10.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Pnegurangan Penghasilan Bruto untuk kegiatan Penelitian dan Pengembangan Tertentu? *</td>
				<td><RadioGroup label="Fasilitas penghasilan bruto litbang" name="D10" value={String(d10FasilitasBrutoLitbang)} options={yesNoOptions} onchange={(value) => (d10FasilitasBrutoLitbang = value === "true")} /></td>
				<td><FormField label="Pengurangan penghasilan bruto litbang" value={rupiah.format(computed.d10Amt)} disabled /></td>
				<td>{#if d10FasilitasBrutoLitbang != undefined}<InlineAlert compact message={d10FasilitasBrutoLitbang ? "Ya, silahkan mengisi lampiran 13B tabel C dan D" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
			</tr>
			<tr>
				<td>11.</td><td>Tarif Pajak *</td><td></td>
				<td>
					<Stack gap="10px">
						<SelectField label="Tarif Pajak" bind:value={tarifPajak} options={tarifPajakOptions} required disabled={readonly} />
						{#if tarifPajak === "lainnya"}
							<FormField label="Persentase Tarif Lainnya (%)" type="number" bind:value={() => String(persentaseTarifLainnya), (value) => (persentaseTarifLainnya = Number(value))} disabled={readonly} />
						{/if}
					</Stack>
				</td><td></td>
			</tr>
			<tr><td>12.</td><td>PPh Terutang *</td><td></td><td><FormField label="PPh Terutang" value={rupiah.format(computed.d12)} disabled /></td><td></td></tr>
		</tbody>
	</table>
</DataTable>

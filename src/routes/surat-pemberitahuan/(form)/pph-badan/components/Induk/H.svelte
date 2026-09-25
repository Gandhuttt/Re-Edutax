<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup } from "$lib/re-ui-components";

	interface Props {
		h21aTransaksiHubunganIstimewa: boolean;
		h21bDokumenPenentuanHargaTransfer: boolean;
		h21cPenanamanModalAfiliasi: boolean;
		h21dUtangPiutangAfiliasi: boolean;
		h21ePenyusutanAmortisasiFiskal: boolean;
		h21fBiayaEntertainment: boolean;
		h21gFasilitasPenanamanModalDaerahTertentu: boolean;
		h21hSisaLebihSaranaPrasarana: boolean;
		h21iDividenLuarNegeri: boolean;
		readonly?: boolean;
	}

	let {
		h21aTransaksiHubunganIstimewa = $bindable(),
		h21bDokumenPenentuanHargaTransfer = $bindable(),
		h21cPenanamanModalAfiliasi = $bindable(),
		h21dUtangPiutangAfiliasi = $bindable(),
		h21ePenyusutanAmortisasiFiskal = $bindable(),
		h21fBiayaEntertainment = $bindable(),
		h21gFasilitasPenanamanModalDaerahTertentu = $bindable(),
		h21hSisaLebihSaranaPrasarana = $bindable(),
		h21iDividenLuarNegeri = $bindable(),
		readonly = false,
	}: Props = $props();

	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
</script>

<DataTable label="Transaksi dan kewajiban tambahan" minWidth="1180px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Pertanyaan</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>21.a.</td>
				<td>Apakah terdapat transaksi yang dipengaruhi hubungan istimewa atau transaksi dengan pihak yang merupakan penduduk tax haven country?</td>
				<td><RadioGroup label="Transaksi hubungan istimewa" name="H21A" value={h21aTransaksiHubunganIstimewa === undefined ? "" : String(h21aTransaksiHubunganIstimewa)} options={yesNoOptions} required onchange={(value) => (h21aTransaksiHubunganIstimewa = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21aTransaksiHubunganIstimewa ? "Ya, silahkan mengisi lampiran 10A, 10B, 10C" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.b.</td>
				<td>Apakah Wajib Pajak berkewajiban menyampaikan Dokumen Penentuan Harga Transfer? *</td>
				<td><RadioGroup label="Kewajiban dokumen penentuan harga transfer" name="H21B" value={h21bDokumenPenentuanHargaTransfer === undefined ? "" : String(h21bDokumenPenentuanHargaTransfer)} options={yesNoOptions} required onchange={(value) => (h21bDokumenPenentuanHargaTransfer = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21bDokumenPenentuanHargaTransfer ? "Ya, silahkan mengisi lampiran 10D" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.c.</td>
				<td>Apakah terdapat penanaman modal pada perusahaan afiliasi? *</td>
				<td><RadioGroup label="Penanaman modal pada perusahaan afiliasi" name="H21C" value={h21cPenanamanModalAfiliasi === undefined ? "" : String(h21cPenanamanModalAfiliasi)} options={yesNoOptions} required onchange={(value) => (h21cPenanamanModalAfiliasi = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21cPenanamanModalAfiliasi ? "Ya, silahkan mengisi lampiran 2 Bagian B" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.d.</td>
				<td>Apakah Wajib Pajak memiliki utang dari pemilik modal atau perusahaan afiliasi, dan/atau piutang ke pemilik modal atau perusahaan afiliasi? *</td>
				<td><RadioGroup label="Utang atau piutang afiliasi" name="H21D" value={h21dUtangPiutangAfiliasi === undefined ? "" : String(h21dUtangPiutangAfiliasi)} options={yesNoOptions} required onchange={(value) => (h21dUtangPiutangAfiliasi = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21dUtangPiutangAfiliasi ? "Ya, silahkan mengisi lampiran 2 Bagian B" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.e.</td>
				<td>Apakah Wajib Pajak membebankan biaya penyusutan dan/atau amortisasi fiskal? *</td>
				<td><RadioGroup label="Biaya penyusutan atau amortisasi fiskal" name="H21E" value={h21ePenyusutanAmortisasiFiskal === undefined ? "" : String(h21ePenyusutanAmortisasiFiskal)} options={yesNoOptions} required onchange={(value) => (h21ePenyusutanAmortisasiFiskal = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21ePenyusutanAmortisasiFiskal ? "Ya, silahkan mengisi lampiran 9" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.f.</td>
				<td>Apakah Wajib Pajak membebankan biaya entertainment, biaya promosi dan penjualan, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, dan piutang yang nyata-nyata tidak dapat ditagih? *</td>
				<td><RadioGroup label="Biaya entertainment dan biaya terkait" name="H21F" value={h21fBiayaEntertainment === undefined ? "" : String(h21fBiayaEntertainment)} options={yesNoOptions} required onchange={(value) => (h21fBiayaEntertainment = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21fBiayaEntertainment ? "Ya, silahkan mengisi lampiran 11A" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.g.</td>
				<td>Apakah Wajib Pajak memperoleh fasilitas perpajakan dalam rangka penanaman modal di bidang-bidang usaha tertentu dan/atau daerah-daerah tertentu selain pengurangan penghasilan neto *</td>
				<td><RadioGroup label="Fasilitas penanaman modal tertentu" name="H21G" value={h21gFasilitasPenanamanModalDaerahTertentu === undefined ? "" : String(h21gFasilitasPenanamanModalDaerahTertentu)} options={yesNoOptions} required onchange={(value) => (h21gFasilitasPenanamanModalDaerahTertentu = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21gFasilitasPenanamanModalDaerahTertentu ? "Ya, silahkan mengisi lampiran 13A" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.h.</td>
				<td>Apakah Wajib Pajak memiliki sisa lebih yang digunakan untuk pembangunan dan pengadaan sarana dan prasarana? *</td>
				<td><RadioGroup label="Sisa lebih untuk sarana dan prasarana" name="H21H" value={h21hSisaLebihSaranaPrasarana === undefined ? "" : String(h21hSisaLebihSaranaPrasarana)} options={yesNoOptions} required onchange={(value) => (h21hSisaLebihSaranaPrasarana = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21hSisaLebihSaranaPrasarana ? "Ya, silahkan mengisi lampiran 14" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.i.</td>
				<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan dividen dari luar negeri dan melaporkannya sebagai penghasilan yang tidak termasuk objek pajak? *</td>
				<td><RadioGroup label="Dividen luar negeri bukan objek pajak" name="H21I" value={h21iDividenLuarNegeri === undefined ? "" : String(h21iDividenLuarNegeri)} options={yesNoOptions} required onchange={(value) => (h21iDividenLuarNegeri = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={h21iDividenLuarNegeri ? "Ya, silahkan sampaikan laporan realisasi investasi secara terpisah pada menu\nlayanan wajib pajak" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>21.j.</td>
				<td>Kelebihan PPh yang bersifat final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diajukan pengembalian pajak *</td>
				<td></td>
				<td><FormField label="Kelebihan PPh final" value="0" disabled /></td>
				<td></td>
			</tr>
		</tbody>
	</table>
</DataTable>

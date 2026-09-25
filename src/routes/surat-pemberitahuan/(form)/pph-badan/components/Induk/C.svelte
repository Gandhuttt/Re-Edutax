<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup } from "$lib/re-ui-components";

	interface L4ARow {
		dasarPengenaanPajak: number;
	}

	interface L4BRow {
		penghasilanBruto: number;
	}

	let {
		menerimaPenghasilanPp23 = $bindable(),
		hanyaPenghasilanPp23 = $bindable(),
		menerimaPenghasilanFinal = $bindable(),
		menerimaPenghasilanBukanObjekPajak = $bindable(),
		l4a,
		l4b,
		readonly = false,
	}: {
		menerimaPenghasilanPp23: boolean;
		hanyaPenghasilanPp23: boolean;
		menerimaPenghasilanFinal: boolean;
		menerimaPenghasilanBukanObjekPajak: boolean;
		l4a: L4ARow[];
		l4b: L4BRow[];
		readonly?: boolean;
	} = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	let pphFinalTotal = $derived(l4a.reduce((total, row) => total + Number(row.dasarPengenaanPajak || 0), 0));
	let bukanObjekPajakTotal = $derived(l4b.reduce((total, row) => total + Number(row.penghasilanBruto || 0), 0));
	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
</script>

<DataTable label="Penghasilan final dan bukan objek pajak" minWidth="1180px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Pertanyaan</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>1.a.</td>
				<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</td>
				<td><RadioGroup label="Penghasilan usaha dikenakan PPh Final" name="menerimaPenghasilanPp23" value={String(menerimaPenghasilanPp23)} options={yesNoOptions} onchange={(value) => (menerimaPenghasilanPp23 = value === "true")} /></td>
				<td></td>
				<td><InlineAlert compact message={menerimaPenghasilanPp23 ? "Ya, silahkan mengisi lampiran 5" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>1.b.</td>
				<td>Apakah penghasilan Wajib Pajak semata-mata hanya penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</td>
				<td>
					<RadioGroup
						label="Hanya menerima penghasilan usaha yang dikenakan PPh Final"
						name="hanyaPenghasilanPp23"
						value={String(hanyaPenghasilanPp23)}
						options={[
							{ value: "false", label: "Tidak", disabled: !menerimaPenghasilanPp23 || readonly },
							{ value: "true", label: "Ya", disabled: !menerimaPenghasilanPp23 || readonly },
						]}
						onchange={(value) => (hanyaPenghasilanPp23 = value === "true")}
					/>
				</td>
				<td></td>
				<td><InlineAlert compact message={hanyaPenghasilanPp23 ? "Ya, silahkan lanjut pertanyaan berikutnya" : "Tidak, jawablah pertanyaan di bagian D di bawah"} /></td>
			</tr>
			<tr>
				<td>2.</td>
				<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang dikenakan PPh yang bersifat final? *</td>
				<td><RadioGroup label="Menerima penghasilan yang dikenakan PPh Final" name="menerimaPenghasilanFinal" value={String(menerimaPenghasilanFinal)} options={yesNoOptions} onchange={(value) => (menerimaPenghasilanFinal = value === "true")} /></td>
				<td><FormField label="Jumlah penghasilan final" value={rupiah.format(pphFinalTotal)} disabled /></td>
				<td><InlineAlert compact message={menerimaPenghasilanFinal ? "Ya, silahkan mengisi Lampiran 4 Bagian A" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
			<tr>
				<td>3.</td>
				<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang tidak termasuk objek pajak? *</td>
				<td><RadioGroup label="Menerima penghasilan bukan objek pajak" name="menerimaPenghasilanBukanObjekPajak" value={String(menerimaPenghasilanBukanObjekPajak)} options={yesNoOptions} onchange={(value) => (menerimaPenghasilanBukanObjekPajak = value === "true")} /></td>
				<td><FormField label="Jumlah penghasilan bukan objek pajak" value={rupiah.format(bukanObjekPajakTotal)} disabled /></td>
				<td><InlineAlert compact message={menerimaPenghasilanBukanObjekPajak ? "Ya, silahkan mengisi Lampiran 4 Bagian B" : "Tidak, silahkan lanjut pertanyaan berikutnya"} /></td>
			</tr>
		</tbody>
	</table>
</DataTable>

<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FieldGrid,
		FileUploadField,
		FormField,
		FormSection,
		InlineAlert,
		RadioGroup,
		RupiahField,
		Stack,
	} from "$lib/re-ui-components";
	import type { computeIndukDEF } from "./computeIndukDEF";

	interface Props {
		computed: ReturnType<typeof computeIndukDEF>;
		f17bAdaSkPengangsuranPenundaan: boolean;
		f17bJumlahDiangsurDitunda: number;
		f19aMetodePengembalian: boolean;
		f18a: number;
		f18b: number;
		readonly?: boolean;
	}

	let {
		computed,
		f17bAdaSkPengangsuranPenundaan = $bindable(),
		f17bJumlahDiangsurDitunda = $bindable(),
		f19aMetodePengembalian = $bindable(),
		f18a,
		f18b,
		readonly = false,
	}: Props = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	const yesNoOptions = $derived([
		{ value: "false", label: "Tidak", disabled: readonly },
		{ value: "true", label: "Ya", disabled: readonly },
	]);
	const refundOptions = $derived([
		{ value: "false", label: "dikembalikan melalui pemeriksaan", disabled: readonly },
		{ value: "true", label: "dikembalikan melalui Pengembalian Pendahuluan", disabled: readonly },
	]);
</script>

<Stack gap="16px">
	<DataTable label="PPh kurang/lebih bayar" minWidth="1240px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr><th scope="col">No.</th><th scope="col">Uraian</th><th scope="col">Jawaban</th><th scope="col">Jumlah</th><th scope="col">Informasi</th></tr>
			</thead>
			<tbody>
				<tr><td>17.a.</td><td>PPh yang Kurang/Lebih Bayar</td><td></td><td><FormField label="PPh yang Kurang/Lebih Bayar" value={rupiah.format(computed.f17a)} disabled /></td><td></td></tr>
				<tr>
					<td>17.b.</td>
					<td>Apakah terdapat Surat Keputusan Persetujuan Pengangsuran atau Penundaan Pembayaran Pajak?</td>
					<td><RadioGroup label="Persetujuan pengangsuran atau penundaan" name="F17B" value={String(f17bAdaSkPengangsuranPenundaan)} options={yesNoOptions} required onchange={(value) => (f17bAdaSkPengangsuranPenundaan = value === "true")} /></td>
					<td><RupiahField label="Jumlah pajak yang diangsur atau ditunda" bind:value={f17bJumlahDiangsurDitunda} disabled={readonly || !f17bAdaSkPengangsuranPenundaan} /></td>
					<td>{#if f17bAdaSkPengangsuranPenundaan != undefined}<InlineAlert compact message={f17bAdaSkPengangsuranPenundaan ? "Ya, silahkan mengisi jumlah pajak yang dapat diangsur/ditunda pembayarannya" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />{/if}</td>
				</tr>
				<tr><td>17.c.</td><td>PPh yang masih harus dibayar atau lebih dibayar</td><td></td><td><FormField label="PPh yang masih harus dibayar atau lebih dibayar" value={rupiah.format(computed.f17c)} disabled /></td><td></td></tr>
				<tr><td>18.a.</td><td>PPh yang kurang atau lebih bayar pada SPT yang dibetulkan</td><td></td><td><FormField label="PPh pada SPT yang dibetulkan" value={rupiah.format(f18a)} disabled /></td><td></td></tr>
				<tr><td>18.b.</td><td>PPh yang kurang atau lebih bayar karena pembetulan</td><td></td><td><FormField label="PPh karena pembetulan" value={rupiah.format(f18b)} disabled /></td><td></td></tr>
				<tr>
					<td>19.a.</td>
					<td>Lebih bayar pada Angka 17.a. atau 18.b. mohon untuk: (pilih salah satu):*</td>
					<td colspan="2"><RadioGroup label="Metode pengembalian lebih bayar" name="F19A" value={String(f19aMetodePengembalian)} options={refundOptions} required onchange={(value) => (f19aMetodePengembalian = value === "true")} /></td>
					<td></td>
				</tr>
			</tbody>
		</table>
	</DataTable>

	<FormSection number="19.b." title="Informasi Rekening" bordered>
		<Stack gap="16px">
			<Stack direction="horizontal" gap="8px" align="end" wrap>
				<FileUploadField label="Pilih Rekening Bank" buttonLabel="File" />
				<ActionButton type="button" tone="quiet">Clear</ActionButton>
			</Stack>
			<FieldGrid min="220px">
				<FormField label="Nomor Rekening" disabled />
				<FormField label="Nama Bank" disabled />
				<FormField label="Nama Pemilik Rekening" disabled />
			</FieldGrid>
		</Stack>
	</FormSection>
</Stack>

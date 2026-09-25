<script lang="ts">
	import { DataTable, FormField, InlineAlert, RadioGroup, SelectField } from "$lib/re-ui-components";
	import { getSektorUsaha } from "./getSektorUsaha.remote";
	import { getOpiniAuditor } from "./getOpiniAuditor.remote";

	export type SectionData = {
		"1"?: string;
		"2"?: { _?: boolean; opini?: string };
	};

	interface Props {
		data: {
			sektorUsahaKode: string | null;
			diaudit: boolean | null;
			opiniAuditorKode: string | null;
			npwpKantorAkuntanPublik: string | null;
			namaKantorAkuntanPublik: string | null;
		};
		readonly: boolean;
		sektorUsaha: string;
	}

	const sektorUsahaOptions = await getSektorUsaha();
	const opiniAuditorOptions = await getOpiniAuditor();

	let { data, readonly, sektorUsaha = $bindable() }: Props = $props();
	let isDiaudit = $derived(data.diaudit ?? undefined);
	const yesNoOptions = [
		{ value: "false", label: "Tidak" },
		{ value: "true", label: "Ya" },
	];
</script>

<DataTable label="Informasi laporan keuangan" minWidth="980px" headerTone="navy" density="compact">
	<table>
		<thead>
			<tr><th scope="col">No.</th><th scope="col">Pertanyaan</th><th scope="col">Jawaban</th><th scope="col">Informasi</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>1.</td>
				<td>Sektor Usaha Laporan Keuangan pada Lampiran 1 *</td>
				<td>
					<SelectField label="Sektor Usaha" name="sektorUsaha" bind:value={sektorUsaha} options={sektorUsahaOptions} placeholder="Select a business classification" required disabled={readonly} searchable />
				</td>
				<td></td>
			</tr>
			<tr>
				<td>2.</td>
				<td>Apakah Laporan Keuangan diaudit oleh Akuntan Publik? *</td>
				<td>
					<RadioGroup label="Laporan keuangan diaudit" name="diaudit" value={isDiaudit === undefined ? "" : String(isDiaudit)} options={yesNoOptions} required onchange={(value) => (isDiaudit = value === "true")} />
				</td>
				<td>
					{#if isDiaudit != undefined}
						<InlineAlert compact message={isDiaudit ? "Ya, silahkan mengisi isian berikutnya" : "Tidak, silahkan lanjut pertanyaan berikutnya"} />
					{/if}
				</td>
			</tr>
			{#if isDiaudit}
				<tr>
					<td>2.a.</td>
					<td>Opini Auditor</td>
					<td><SelectField label="Opini Auditor" name="opiniAuditor" value={data.opiniAuditorKode ?? ""} options={opiniAuditorOptions} placeholder="Select an auditor opinion" required /></td>
					<td></td>
				</tr>
				<tr>
					<td>2.b.</td>
					<td>NPWP Kantor Akuntan Publik</td>
					<td><FormField label="NPWP Kantor Akuntan Publik" name="npwpKantorAkuntanPublik" value="0123456789012000" disabled /></td>
					<td></td>
				</tr>
				<tr>
					<td>2.c.</td>
					<td>Nama Kantor Akuntan Publik</td>
					<td><FormField label="Nama Kantor Akuntan Publik" name="namaKantorAkuntanPublik" value="Akuntan Dummy" disabled /></td>
					<td></td>
				</tr>
			{/if}
		</tbody>
	</table>
</DataTable>

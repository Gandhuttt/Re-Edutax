<script lang="ts">
	import { ActionButton, FieldGrid, FormField, SelectField, Stack } from "$lib/re-ui-components";

	interface Props {
		data: {
			tahunPajak: number;
			statusSpt: "normal" | "pembetulan";
			periodePembukuanMulai: string;
			periodePembukuanSelesai: string;
			metodePembukuan: "akrual" | "kas";
		};
		readonly: boolean;
		postFormId?: string;
	}

	let { data, readonly, postFormId }: Props = $props();

	const periodeMulai = $derived(String(new Date(`${data.periodePembukuanMulai}T00:00:00`).getMonth() + 1));
	const periodeSelesai = $derived(String(new Date(`${data.periodePembukuanSelesai}T00:00:00`).getMonth() + 1));
</script>

<Stack gap="16px">
	<FieldGrid columns={2}>
		<FormField label="Tahun Pajak/Bagian Tahun Pajak" value={String(data.tahunPajak)} readonly />
		<FormField label="Status" value={data.statusSpt.toUpperCase()} readonly />
		<FormField label="Periode Pembukuan Mulai" value={periodeMulai} readonly />
		<FormField label="Periode Pembukuan Selesai" value={periodeSelesai} readonly />
		<SelectField
			label="Metode Pembukuan/Pencatatan"
			name="metodePembukuan"
			value={data.metodePembukuan}
			options={[
				{ value: "kas", label: "Akuntansi Berbasis Kas" },
				{ value: "akrual", label: "Akuntansi Berbasi Akrual" },
			]}
		/>
	</FieldGrid>
	<Stack direction="horizontal" gap="8px" wrap>
		<ActionButton type="submit" form={postFormId} name="action" value="Post" disabled={readonly}>Prefill SPT</ActionButton>
		<p class="tw:hidden">Posting belum pernah dilakukan</p>
	</Stack>
</Stack>

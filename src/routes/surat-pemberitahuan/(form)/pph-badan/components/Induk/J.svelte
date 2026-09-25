<script lang="ts">
	import { CheckboxField, FieldGrid, FormField, RadioGroup, Stack } from "$lib/re-ui-components";

	interface Props {
		pernyataanBenar: boolean;
		penandatangan: string;
		readonly?: boolean;
	}

	let {
		pernyataanBenar = $bindable(),
		penandatangan = $bindable(),
		readonly = false,
	}: Props = $props();

	const penandatanganOptions = $derived([
		{ value: "wajib_pajak", label: "Wajib Pajak", disabled: readonly || !pernyataanBenar },
		{ value: "kuasa_wajib_pajak", label: "Kuasa Wajib Pajak", disabled: readonly || !pernyataanBenar },
	]);
</script>

<Stack gap="18px">
	<CheckboxField
		label="Pernyataan kebenaran dan kelengkapan SPT"
		description="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas."
		bind:checked={pernyataanBenar}
		required
		disabled={readonly}
	/>
	<RadioGroup
		label="Penandatangan"
		name="penandatanganPilihan"
		bind:value={penandatangan}
		options={penandatanganOptions}
		required
	/>
	<FieldGrid columns={2}>
		<FormField label="Tanda Tangan" value="" disabled />
		<FormField label="NPWP" value="" readonly />
		<FormField label="Nama" value="" readonly />
		<FormField label="Jabatan" value="" />
	</FieldGrid>
</Stack>

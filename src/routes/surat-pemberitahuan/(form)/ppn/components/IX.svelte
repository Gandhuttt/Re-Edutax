<script lang="ts">
	import { CheckboxField, FormSection, Stack } from '$lib/re-ui-components';

	let { sptItem }: { sptItem: { ixA: boolean | null; ixB: boolean | null } } = $props();
</script>

<FormSection
	number="IX"
	title="Dokumen kelengkapan"
	description="Tandai daftar atau penghitungan yang disertakan dalam SPT."
	bordered
>
	<Stack gap="10px">
		<CheckboxField
			label="A. Daftar Rincian Kendaran Bermotor"
			name="IX_0"
			checked={sptItem.ixA ?? false}
		/>
		<CheckboxField
			label="B. Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan sebagai penambah (Pengurang) Pajak Masukan"
			name="IX_1"
			checked={sptItem.ixB ?? false}
		/>
	</Stack>
</FormSection>

<script lang="ts">
	import { FieldGrid, FormField, FormSection, SelectField, Stack } from '$lib/re-ui-components';
	import type { FooterL3A, LaporanKeuangan } from './types';

	interface Props { footer: FooterL3A; readonly?: boolean; }
	let { footer = $bindable(), readonly = false }: Props = $props();
	const diaudit = $derived(footer.laporanKeuangan === 'diaudit');
	const laporanOptions = [
		{ value: '', label: 'Silakan Pilih' },
		{ value: 'tidak_diaudit', label: 'Tidak Diaudit' },
		{ value: 'diaudit', label: 'Diaudit' }
	];
</script>

<FormSection title="Informasi Laporan Keuangan" bordered>
<Stack gap="16px">
	<SelectField
		label="Laporan Keuangan"
		value={footer.laporanKeuangan ?? ''}
		onchange={(value) => (footer.laporanKeuangan = value ? value as LaporanKeuangan : null)}
		options={laporanOptions}
		placeholder="Silakan Pilih"
		required
		disabled={readonly}
	/>
	<FieldGrid columns={2}>
		<FormField label="NPWP Konsultan Pajak" bind:value={() => footer.npwpKonsultanPajak ?? '', (value) => (footer.npwpKonsultanPajak = value || null)} disabled={readonly} />
		<FormField label="Nama Konsultan Pajak" bind:value={() => footer.namaKonsultanPajak ?? '', (value) => (footer.namaKonsultanPajak = value || null)} disabled={readonly} />
	</FieldGrid>
	{#if diaudit}
		<FieldGrid columns={2}>
			<FormField label="NPWP Kantor Akuntan Publik" bind:value={() => footer.npwpKantorAkuntanPublik ?? '', (value) => (footer.npwpKantorAkuntanPublik = value || null)} disabled={readonly} />
			<FormField label="Nama Kantor Akuntan Publik" bind:value={() => footer.namaKantorAkuntanPublik ?? '', (value) => (footer.namaKantorAkuntanPublik = value || null)} disabled={readonly} />
		</FieldGrid>
	{/if}
</Stack>
</FormSection>

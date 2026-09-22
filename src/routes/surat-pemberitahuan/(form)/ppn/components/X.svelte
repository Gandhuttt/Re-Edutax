<script lang="ts">
	import {
		CheckboxField,
		FieldGrid,
		FormField,
		FormSection,
		RadioGroup,
		Stack
	} from '$lib/re-ui-components';
	import { untrack } from 'svelte';

	let {
		sptItem
	}: {
		sptItem: {
			xSetuju: boolean | null;
			xDitandatanganiOleh: 'PKP' | 'KuasaWajibPajak' | null;
			xKotaPenandatanganSpt: string | null;
			xNama: string | null;
			xJabatan: string | null;
			xBatasWaktuPenyampaian: string | null;
		};
	} = $props();

	let checked = $state(untrack(() => sptItem.xSetuju ?? false));
	let isDisabled = $derived(!checked);
</script>

<Stack gap="14px">
	<div class="declaration">
		<CheckboxField
			label="Pernyataan kebenaran dan kelengkapan SPT"
			description="Dengan menyadari sepenuhnya akan segala akibatnya, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap, jelas, dan tidak bersyarat."
			id="X-0"
			name="check-ttd"
			bind:checked
		/>
	</div>

	<FormSection number="X" title="Penandatangan SPT" bordered>
		<Stack gap="16px">
			<RadioGroup
				label="Ditandatangani oleh"
				name="radio-ttd"
				value={sptItem.xDitandatanganiOleh ?? ''}
				options={[
					{ value: 'PKP', label: 'PKP', disabled: isDisabled },
					{ value: 'KuasaWajibPajak', label: 'Kuasa Wajib Pajak', disabled: isDisabled }
				]}
			/>

			<FieldGrid columns={2} gap="14px 16px">
				<FormField
					label="Kota Penandatanganan SPT"
					id="X-3"
					value={sptItem.xKotaPenandatanganSpt ?? ''}
					disabled
				/>
				<FormField label="Nama" id="X-4" value={sptItem.xNama ?? ''} disabled />
				<FormField
					label="Jabatan"
					id="X-5"
					name="X_jabatan"
					value={sptItem.xJabatan ?? ''}
					disabled={isDisabled}
				/>
				<FormField
					label="Batas Waktu Penyampaian SPT"
					id="X-6"
					type="date"
					value={sptItem.xBatasWaktuPenyampaian ?? ''}
					disabled
				/>
			</FieldGrid>
		</Stack>
	</FormSection>
</Stack>

<style>
	.declaration {
		border-left: 4px solid var(--ui-yellow-deep);
	}
</style>

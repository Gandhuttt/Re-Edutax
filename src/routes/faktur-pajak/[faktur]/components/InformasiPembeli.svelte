<script lang="ts">
	import { FieldGrid, FormField, LookupField, RadioGroup, Stack } from '$lib/re-ui-components';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { updateFaktur } from '../updateFaktur.remote';

	let {
		canEdit,
		npwpPembeli = $bindable('')
	}: {
		canEdit: boolean;
		npwpPembeli: string;
	} = $props();

	const formFields = updateFaktur.fields.informasiPembeli;
	let wpPembeli = $state(await getWajibPajak({ npwp: npwpPembeli }));

	async function lookupBuyer() {
		wpPembeli = await getWajibPajak({ npwp: npwpPembeli });
	}
</script>

<Stack gap="16px">
	<LookupField
		label="NPWP pembeli"
		field={canEdit ? formFields.npwpPembeli : undefined}
		bind:value={npwpPembeli}
		buttonLabel="Cari NPWP"
		buttonVisible={canEdit}
		disabled={!canEdit}
		inputmode="numeric"
		onlookup={lookupBuyer}
		onvaluechange={(value) => (npwpPembeli = value)}
	/>

	<RadioGroup
		label="Jenis identitas"
		value="npwp"
		options={[{ value: 'npwp', label: 'NPWP' }]}
	/>

	<FieldGrid gap="14px 16px">
		<FormField label="Negara" value={wpPembeli?.negara ?? ''} disabled />
		<FormField label="Nomor dokumen" value="" disabled />
		<FormField label="Nama" value={wpPembeli?.nama ?? ''} disabled />
		<FormField label="Email" value={wpPembeli?.email ?? ''} disabled />
	</FieldGrid>
</Stack>

<script lang="ts">
	import { FieldGrid, FormField, FormSection } from '$lib/re-ui-components';
</script>

<FormSection title="Header" bordered>
	<FieldGrid columns={2}>
		<FormField label="Tahun Pajak/Bagian Tahun Pajak" value="2025" disabled />
		<FormField label="Nomor Identitas WP" value="00000000000000000" disabled />
	</FieldGrid>
</FormSection>

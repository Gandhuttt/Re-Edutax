<script lang="ts">
	import { FieldGrid, FormField, FormSection } from "$lib/re-ui-components";
</script>

<FormSection title="Header" padded>
	<FieldGrid columns={2}>
		<FormField label="Tahun Pajak/Bagian Tahun Pajak" value="2025" readonly />
		<FormField label="Nomor Identitas WP" value="00000000000000000" readonly />
	</FieldGrid>
</FormSection>

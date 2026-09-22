<script lang="ts">
	import { ActionButton, FormActions } from '$lib/re-ui-components';

	const {
		readonly = true,
		saveFormId,
		reportFormId
	}: { readonly?: boolean; saveFormId?: string; reportFormId?: string } = $props();
</script>

{#if !readonly}
	<FormActions message="Periksa kembali seluruh bagian sebelum menyimpan atau melaporkan SPT.">
		<ActionButton type="submit" form={saveFormId} name="action" value="Simpan Konsep" tone="quiet">
			Simpan Konsep
		</ActionButton>
		<ActionButton type="submit" form={reportFormId} name="action" value="Simpan Lapor">
			Bayar dan Lapor
		</ActionButton>
	</FormActions>
{/if}

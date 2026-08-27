<script lang="ts">
	const {
		readonly = true,
		saveFormId,
		reportFormId
	}: { readonly?: boolean; saveFormId?: string; reportFormId?: string } = $props();
</script>

<div class="footer">
	<div class="tw:flex tw:flex-row">
		{#if !readonly}
			<div class="button-container">
				<button class="btn btn-primary" form={saveFormId} type="submit" name="action" value="Simpan Konsep"
					>Simpan Konsep</button
				>
			</div>
			<div class="button-container">
				<button class="btn btn-primary" form={reportFormId} type="submit" name="action" value="Simpan Lapor"
					>Bayar dan Lapor</button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.button-container {
		margin-right: 1rem;
	}
	button {
		--bs-btn-bg: #1c398e;
		--bs-btn-border-color: #1c398e;
		--bs-btn-hover-bg: #162456;
		--bs-btn-hover-border-color: #162456;
	}
	.footer {
		margin: 1rem 0rem;
	}
</style>

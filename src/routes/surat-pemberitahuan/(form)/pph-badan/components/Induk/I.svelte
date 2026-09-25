<script lang="ts">
	import { ActionButton, DataTable, FileUploadField, FormSection, Stack } from "$lib/re-ui-components";
</script>

<Stack gap="18px">
	<FormSection
		title="Laporan Keuangan"
		description="Laporan Keuangan/Laporan Keuangan yang Telah Diaudit *"
		bordered
	>
		<Stack gap="14px">
			<FileUploadField label="Pilih laporan keuangan" buttonLabel="Pilih" />
			<div class="actions">
				<ActionButton tone="secondary">Unggah</ActionButton>
				<ActionButton tone="quiet">Batal</ActionButton>
			</div>
			<div class="document-placeholder">PLACEHOLDER</div>
		</Stack>
	</FormSection>

	<FormSection title="Files Uploaded" bordered padded={false}>
		<DataTable label="Berkas laporan keuangan yang telah diunggah" minWidth="560px" headerTone="yellow" density="compact" framed={false}>
			<table>
				<thead>
					<tr><th scope="col">No.</th><th scope="col">Nama Dokumen</th><th scope="col">Tindakan</th></tr>
				</thead>
				<tbody>
					<tr><td>PLACEHOLDER</td><td>PLACEHOLDER</td><td>PLACEHOLDER</td></tr>
				</tbody>
			</table>
		</DataTable>
	</FormSection>
</Stack>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.document-placeholder {
		min-height: 48px;
		padding: 12px;
		border: 1px solid var(--ui-line);
		background: #fffefa;
		color: var(--ui-muted);
		font-size: 14px;
	}
</style>

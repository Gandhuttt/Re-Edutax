<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		DateField,
		FieldGrid,
		FileUploadField,
		FormActions,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		SelectField,
		Stack,
		TextAreaField,
		type SelectFieldValue,
	} from "$lib/re-ui-components";

	let represented = $state(false);
	let representativeId = $state("");
	let cancellationType = $state<SelectFieldValue>("");
	let uploadedFiles = $state<FileList>();
	let agreed = $state(false);
	let saved = $state(false);
	let cancellationError = $state("");
	const today = new Intl.DateTimeFormat("en-CA").format(new Date());

	function saveRequest(event: SubmitEvent) {
		event.preventDefault();
		if (!cancellationType) {
			cancellationError = "Jenis pembatalan wajib dipilih.";
			return;
		}
		saved = true;
	}
</script>

<svelte:head><title>Penghapusan dan Pencabutan</title></svelte:head>

<PageLayout contentWidth="1180px">
	<Breadcrumbs
		items={[
			{ label: "Portal Saya", href: "/" },
			{ label: "Penghapusan dan Pencabutan" },
		]}
	/>
	<PageHeading
		eyebrow="Portal Saya"
		title="Penghapusan NPWP dan/atau Pencabutan Pengukuhan PKP/SKT PBB P5L"
	/>

	<form onsubmit={saveRequest}>
		<Stack gap="18px">
			<FormSection title="Manajemen Kasus" bordered>
				<FieldGrid columns={2}>
					<FormField
						label="Kanal"
						value="Daring (Portal Wajib Pajak)"
						required
						disabled
					/>
					<DateField label="Tanggal Permohonan" value={today} disabled />
					<SelectField
						label="Jenis Pembatalan"
						value={cancellationType}
						required
						error={cancellationError}
						options={[
							{ value: "", label: "Silakan Pilih" },
							{ value: "Penghapusan NPWP", label: "Penghapusan NPWP" },
							{
								value: "Pencabutan Pengukuhan PKP",
								label: "Pencabutan Pengukuhan PKP",
							},
							{
								value: "Pencabutan SKT PBB P5L",
								label: "Pencabutan SKT PBB P5L",
							},
							{
								value: "Penghapusan NPWP dan Pencabutan Pengukuhan PKP",
								label: "Penghapusan NPWP dan Pencabutan Pengukuhan PKP",
							},
						]}
						onchange={(value) => {
							cancellationType = value;
							cancellationError = "";
						}}
					/>
				</FieldGrid>
			</FormSection>

			<FormSection title="Kuasa Wajib Pajak" bordered>
				<Stack gap="18px">
					<CheckboxField
						label="Diisi oleh perwakilan Wajib Pajak?"
						bind:checked={represented}
					/>
					<FieldGrid columns={2}>
						<FormField
							label="ID Penunjukan Wakil Wajib Pajak"
							bind:value={representativeId}
							required={represented}
							disabled={!represented}
						/>
						<FormField
							label="NIK/NPWP Perwakilan"
							required={represented}
							disabled
						/>
						<FormField
							label="Nama Wakil/Kuasa"
							required={represented}
							disabled
						/>
					</FieldGrid>
				</Stack>
			</FormSection>

			<FormSection title="Identitas Wajib Pajak" bordered>
				<FieldGrid columns={2}>
					<FormField
						label="NIK/TIN"
						placeholder="NIK/NPWP Wajib Pajak"
						required
						disabled
					/>
					<FormField label="Nama Wajib Pajak" disabled />
					<div class="full-row">
						<TextAreaField label="Alamat" rows={3} disabled />
					</div>
				</FieldGrid>
			</FormSection>

			<FormSection
				title="Penghapusan NPWP dan/atau Pencabutan Pengukuhan PKP/SKT PBB P5L"
				bordered
			>
				<FileUploadField
					label="Unggah File"
					bind:files={uploadedFiles}
					hint="Pastikan dokumen yang diunggah telah memenuhi persyaratan permohonan."
					required
				/>
			</FormSection>

			<FormSection title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField
					label="Saya menyatakan data yang disampaikan benar dan lengkap"
					description="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang saya sampaikan di atas adalah benar dan lengkap, dan saya menyetujui untuk menggunakan Akun Wajib Pajak saya sebagai sarana penerimaan surat dan dokumen perpajakan."
					bind:checked={agreed}
					required
				/>
			</FormSection>

			{#if saved}
				<InlineAlert
					tone="success"
					title="Permohonan tersimpan"
					message="Data permohonan telah disimpan."
				/>
			{/if}

			<FormActions message="Lengkapi seluruh kolom wajib sebelum menyimpan.">
				<ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton>
			</FormActions>
		</Stack>
	</form>
</PageLayout>

<style>
	.full-row {
		grid-column: 1 / -1;
	}

	@media (max-width: 700px) {
		.full-row {
			grid-column: auto;
		}
	}
</style>

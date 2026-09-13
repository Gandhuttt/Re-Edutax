<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		DateField,
		FileUploadField,
		FormActions,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		ResponsiveGrid,
		SelectField,
		Stack,
		type SelectFieldOption,
		type SelectFieldValue,
	} from "$lib/re-ui-components";

	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	let submitted = $state(false);
	let identityType = $state<SelectFieldValue>("");
	let citizenship = $state<SelectFieldValue>("");

	const today = new Intl.DateTimeFormat("en-CA").format(new Date());
	const identityChanges = [
		"Nama Wajib Pajak",
		"Nomor Identitas",
		"Tempat dan Tanggal Lahir",
		"Status Perkawinan",
		"Kewarganegaraan",
		"Nomor Telepon dan Email",
	];
	const option = (value: string): SelectFieldOption => ({ value, label: value || "Silakan Pilih" });
	const identityTypes = ["", "NIK", "Paspor", "Nomor Identitas Lain"].map(option);
	const genders = ["", "Laki-laki", "Perempuan"].map(option);
	const maritalStatuses = ["", "Belum Kawin", "Kawin", "Cerai"].map(option);
	const citizenships = ["", "Indonesia", "Asing"].map(option);
	const countries = ["", "Indonesia", "Negara Lain"].map(option);

	function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (!identityType || !citizenship) return;
		saved = true;
	}
</script>

<svelte:head><title>Perubahan Identitas Wajib Pajak</title></svelte:head>

<PageLayout contentWidth="1320px">
	<Breadcrumbs items={[{ label: "Perubahan Data", href: "/" }, { label: "Identitas Wajib Pajak" }]} />
	<PageHeading eyebrow="Perubahan Data" title="Perubahan Identitas Wajib Pajak" />

	<form onsubmit={save}>
		<Stack gap="18px">
			<FormSection number="01" title="Manajemen Kasus" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Kanal" value="Daring (Portal Wajib Pajak)" disabled required />
					<DateField label="Tanggal Permohonan" value={today} disabled />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="02" title="Kuasa Wajib Pajak" bordered>
				<Stack gap="16px">
					<CheckboxField label="Diisi oleh perwakilan Wajib Pajak?" bind:checked={represented} />
					<ResponsiveGrid columns={2}>
						<FormField label="ID Penunjukan Wakil Wajib Pajak" placeholder="Masukkan ID penunjukan" />
						<FormField label="NIK/NPWP Perwakilan" placeholder="Masukkan NIK/NPWP" />
						<FormField label="Nama Wakil/Kuasa" placeholder="Nama akan ditampilkan setelah verifikasi" disabled />
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="03" title="Identitas Wajib Pajak" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="NIK/TIN" placeholder="NIK/NPWP Wajib Pajak" disabled required />
					<FormField label="Nama Wajib Pajak" placeholder="Nama terdaftar" disabled />
					<FormField label="Jenis Wajib Pajak" placeholder="Jenis Wajib Pajak" disabled />
					<FormField label="Status Wajib Pajak" placeholder="Status terdaftar" disabled />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="04" title="Data yang Akan Diubah" description="Pilih data identitas yang menjadi bagian dari permohonan perubahan." bordered>
				<ResponsiveGrid columns={2} gap="8px 22px">
					{#each identityChanges as item}<CheckboxField label={item} compact />{/each}
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="05" title="Identitas Baru" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Nama Lengkap / Nama Badan" placeholder="Masukkan nama sesuai dokumen" required />
					<SelectField label="Jenis Identitas" bind:value={identityType} options={identityTypes} error={submitted && !identityType ? "Wajib dipilih." : ""} required />
					<FormField label="Nomor Identitas" inputmode="numeric" required />
					<FormField label="Nomor Kartu Keluarga" inputmode="numeric" />
					<FormField label="Tempat Lahir / Tempat Pendirian" />
					<DateField label="Tanggal Lahir / Tanggal Pendirian" />
					<SelectField label="Jenis Kelamin" options={genders} />
					<SelectField label="Status Perkawinan" options={maritalStatuses} />
					<SelectField label="Kewarganegaraan" bind:value={citizenship} options={citizenships} error={submitted && !citizenship ? "Wajib dipilih." : ""} required />
					<SelectField label="Negara Asal" options={countries} />
					<FormField label="Nomor Telepon" type="tel" placeholder="Contoh: 081234567890" />
					<FormField label="Alamat Email" type="email" placeholder="nama@contoh.id" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="06" title="Dokumen Pendukung" description="Format berkas PDF, JPG, JPEG, atau PNG." bordered>
				<ResponsiveGrid columns={2}>
					<FileUploadField label="Dokumen Identitas" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Dokumen Pendukung Perubahan" accept=".pdf,.jpg,.jpeg,.png" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="07" title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField label="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai ketentuan peraturan perundang-undangan, saya menyatakan bahwa data yang saya sampaikan adalah benar dan lengkap." bind:checked={agreed} required />
			</FormSection>

			{#if saved}<InlineAlert tone="success" message="Permohonan perubahan identitas telah disimpan." />{/if}
			<FormActions><ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton></FormActions>
		</Stack>
	</form>
</PageLayout>

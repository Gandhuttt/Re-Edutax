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
		TextAreaField,
		type SelectFieldOption,
		type SelectFieldValue,
	} from "$lib/re-ui-components";

	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	let submitted = $state(false);
	let addressType = $state<SelectFieldValue>("");
	let province = $state<SelectFieldValue>("");
	let city = $state<SelectFieldValue>("");
	let district = $state<SelectFieldValue>("");
	let village = $state<SelectFieldValue>("");
	const today = new Intl.DateTimeFormat("en-CA").format(new Date());
	const option = (value: string): SelectFieldOption => ({ value, label: value || "Silakan Pilih" });
	const addressTypes = ["", "Tempat Tinggal", "Tempat Kedudukan", "Tempat Kegiatan Usaha"].map(option);
	const provinces = ["", "DKI Jakarta", "Jawa Barat", "Provinsi Lain"].map(option);
	const emptyOptions = [""].map(option);

	function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (!addressType || !province || !city || !district || !village) return;
		saved = true;
	}
</script>

<svelte:head><title>Perubahan Alamat Utama</title></svelte:head>

<PageLayout contentWidth="1320px">
	<Breadcrumbs items={[{ label: "Perubahan Data", href: "/" }, { label: "Perubahan Alamat Utama" }]} />
	<PageHeading eyebrow="Perubahan Data" title="Perubahan Alamat Utama" />

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
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="04" title="Alamat Utama Saat Ini" bordered>
				<Stack gap="18px">
					<ResponsiveGrid columns={2}>
						<FormField label="Jenis Alamat" value="Alamat Utama" disabled />
						<FormField label="Kode KPP" placeholder="KPP terdaftar" disabled />
					</ResponsiveGrid>
					<TextAreaField label="Detail Alamat" rows={3} placeholder="Alamat terdaftar" disabled />
					<ResponsiveGrid columns={2}>
						<FormField label="Provinsi" disabled />
						<FormField label="Kabupaten/Kota" disabled />
						<FormField label="Kecamatan" disabled />
						<FormField label="Kelurahan/Desa" disabled />
						<FormField label="RT/RW" disabled />
						<FormField label="Kode Pos" disabled />
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="05" title="Alamat Utama Baru" bordered>
				<Stack gap="18px">
					<ResponsiveGrid columns={2}>
						<SelectField label="Jenis Alamat" bind:value={addressType} options={addressTypes} error={submitted && !addressType ? "Wajib dipilih." : ""} required />
						<FormField label="Nama Jalan / Blok" required />
					</ResponsiveGrid>
					<TextAreaField label="Detail Alamat" rows={3} placeholder="Nama gedung, nomor rumah, dan keterangan alamat" required />
					<ResponsiveGrid columns={2}>
						<SelectField label="Provinsi" bind:value={province} options={provinces} error={submitted && !province ? "Wajib dipilih." : ""} required />
						<SelectField label="Kabupaten/Kota" bind:value={city} options={emptyOptions} error={submitted && !city ? "Wajib dipilih." : ""} required />
						<SelectField label="Kecamatan" bind:value={district} options={emptyOptions} error={submitted && !district ? "Wajib dipilih." : ""} required />
						<SelectField label="Kelurahan/Desa" bind:value={village} options={emptyOptions} error={submitted && !village ? "Wajib dipilih." : ""} required />
						<FormField label="RT" inputmode="numeric" maxlength={3} placeholder="000" />
						<FormField label="RW" inputmode="numeric" maxlength={3} placeholder="000" />
						<FormField label="Kode Pos" inputmode="numeric" maxlength={5} required />
						<FormField label="Nomor Telepon" type="tel" />
						<FormField label="Data Geometri" placeholder="Diisi setelah alamat ditandai" disabled />
						<Stack align="end"><ActionButton tone="secondary">Tandai Alamat</ActionButton></Stack>
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="06" title="Dokumen Pendukung" description="Format berkas PDF, JPG, JPEG, atau PNG." bordered>
				<ResponsiveGrid columns={2}>
					<FileUploadField label="Bukti Kepemilikan/Penguasaan Tempat" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Dokumen Pendukung Lainnya" accept=".pdf,.jpg,.jpeg,.png" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="07" title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField label="Saya menyatakan bahwa alamat dan dokumen yang saya sampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan sesuai ketentuan yang berlaku." bind:checked={agreed} required />
			</FormSection>

			{#if saved}<InlineAlert tone="success" message="Permohonan perubahan alamat utama telah disimpan." />{/if}
			<FormActions><ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton></FormActions>
		</Stack>
	</form>
</PageLayout>

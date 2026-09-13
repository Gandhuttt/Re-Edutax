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
	let sector = $state<SelectFieldValue>("");
	let subsector = $state<SelectFieldValue>("");
	let earthType = $state<SelectFieldValue>("");
	let detail = $state<SelectFieldValue>("");
	let permitDate = $state("");
	let province = $state<SelectFieldValue>("");
	let city = $state<SelectFieldValue>("");
	let district = $state<SelectFieldValue>("");
	let village = $state<SelectFieldValue>("");
	const today = new Intl.DateTimeFormat("en-CA").format(new Date());
	const changeTypes = ["Identitas Objek Pajak", "Perizinan", "Luas Objek Pajak", "Alamat Objek Pajak", "Data Geometri"];
	const option = (value: string): SelectFieldOption => ({ value, label: value || "Silakan Pilih" });
	const sectors = ["", "Perkebunan", "Perhutanan", "Pertambangan Minyak dan Gas Bumi", "Pertambangan Mineral atau Batubara", "Sektor Lainnya"].map(option);
	const provinces = ["", "DKI Jakarta", "Jawa Barat", "Provinsi Lain"].map(option);
	const emptyOptions = [""].map(option);

	function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (!sector || !subsector || !earthType || !detail || !permitDate || !province || !city || !district || !village) return;
		saved = true;
	}
</script>

<svelte:head><title>Perubahan Data Objek Pajak PBB P5L</title></svelte:head>

<PageLayout contentWidth="1320px">
	<Breadcrumbs items={[{ label: "Perubahan Data", href: "/" }, { label: "Objek Pajak PBB P5L" }]} />
	<PageHeading eyebrow="Perubahan Data" title="Perubahan Data Objek Pajak PBB P5L" />

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

			<FormSection number="04" title="Objek Pajak PBB P5L" bordered>
				<Stack gap="18px">
					<ResponsiveGrid columns={2}>
						<FormField label="Nomor Objek Pajak (NOP)" placeholder="Masukkan NOP yang akan diubah" required />
						<FormField label="Nama Objek Pajak" placeholder="Nama objek terdaftar" disabled />
						<FormField label="Sektor PBB P5L" placeholder="Sektor terdaftar" disabled />
						<FormField label="Status Objek Pajak" placeholder="Status terdaftar" disabled />
					</ResponsiveGrid>
					<TextAreaField label="Alamat Objek Pajak" rows={3} placeholder="Alamat objek terdaftar" disabled />
				</Stack>
			</FormSection>

			<FormSection number="05" title="Jenis Perubahan" bordered>
				<ResponsiveGrid columns={3} gap="8px 22px">
					{#each changeTypes as item}<CheckboxField label={item} compact />{/each}
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="06" title="Data Objek Pajak Baru" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Nama Objek Pajak" required />
					<SelectField label="Sektor" bind:value={sector} options={sectors} error={submitted && !sector ? "Wajib dipilih." : ""} required />
					<SelectField label="Jenis/Subsektor" bind:value={subsector} options={emptyOptions} error={submitted && !subsector ? "Wajib dipilih." : ""} required />
					<SelectField label="Jenis Bumi" bind:value={earthType} options={emptyOptions} error={submitted && !earthType ? "Wajib dipilih." : ""} required />
					<SelectField label="Detail" bind:value={detail} options={emptyOptions} error={submitted && !detail ? "Wajib dipilih." : ""} required />
					<FormField label="Luas Objek Pajak (m²)" type="number" min="0" step=".01" required />
					<FormField label="Nomor Induk Berusaha" />
					<DateField label="Tanggal Nomor Induk Berusaha" />
					<FormField label="Nomor Izin Objek" required />
					<DateField label="Tanggal Izin Objek" bind:value={permitDate} error={submitted && !permitDate ? "Wajib diisi." : ""} required />
					<FormField label="Instansi Pemberi Izin" required />
					<DateField label="Masa Berlaku Izin" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="07" title="Alamat Objek Pajak Baru" bordered>
				<Stack gap="18px">
					<TextAreaField label="Detail Alamat" rows={3} required />
					<ResponsiveGrid columns={2}>
						<SelectField label="Provinsi" bind:value={province} options={provinces} error={submitted && !province ? "Wajib dipilih." : ""} required />
						<SelectField label="Kabupaten/Kota" bind:value={city} options={emptyOptions} error={submitted && !city ? "Wajib dipilih." : ""} required />
						<SelectField label="Kecamatan" bind:value={district} options={emptyOptions} error={submitted && !district ? "Wajib dipilih." : ""} required />
						<SelectField label="Kelurahan/Desa" bind:value={village} options={emptyOptions} error={submitted && !village ? "Wajib dipilih." : ""} required />
						<FormField label="Kode Pos" inputmode="numeric" maxlength={5} />
						<FormField label="Kode Wilayah" placeholder="Terisi berdasarkan alamat" disabled />
						<FormField label="Data Geometri" placeholder="Terisi setelah lokasi ditandai" disabled />
						<Stack align="end"><ActionButton tone="secondary">Tandai Alamat</ActionButton></Stack>
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="08" title="Dokumen Pendukung" description="Format berkas PDF, JPG, JPEG, atau PNG." bordered>
				<ResponsiveGrid columns={2}>
					<FileUploadField label="Dokumen Izin Objek Pajak" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Dokumen Perubahan Data" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Foto Objek Pajak" accept=".pdf,.jpg,.jpeg,.png" />
					<FileUploadField label="Peta Objek Pajak" accept=".pdf,.jpg,.jpeg,.png" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="09" title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField label="Saya menyatakan bahwa data objek pajak dan dokumen yang disampaikan adalah benar, lengkap, serta dapat dipertanggungjawabkan sesuai ketentuan yang berlaku." bind:checked={agreed} required />
			</FormSection>

			{#if saved}<InlineAlert tone="success" message="Permohonan perubahan data objek pajak telah disimpan." />{/if}
			<FormActions><ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton></FormActions>
		</Stack>
	</form>
</PageLayout>

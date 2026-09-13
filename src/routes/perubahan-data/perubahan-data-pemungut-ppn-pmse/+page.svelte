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
	let country = $state<SelectFieldValue>("");
	const today = new Intl.DateTimeFormat("en-CA").format(new Date());
	const changeTypes = ["Identitas Pemungut", "Alamat dan Negara", "Kontak", "Situs/Aplikasi", "Rekening Pembayaran"];
	const option = (value: string): SelectFieldOption => ({ value, label: value || "Silakan Pilih" });
	const countries = ["", "Singapura", "Malaysia", "Negara Lain"].map(option);

	function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (!country) return;
		saved = true;
	}
</script>

<svelte:head><title>Perubahan Data Pemungut PPN PMSE</title></svelte:head>

<PageLayout contentWidth="1320px">
	<Breadcrumbs items={[{ label: "Perubahan Data", href: "/" }, { label: "Pemungut PPN PMSE" }]} />
	<PageHeading eyebrow="Perubahan Data" title="Perubahan Data Pemungut PPN PMSE dengan Kepdirjen" />

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

			<FormSection number="04" title="Data Penunjukan Pemungut PPN PMSE" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Nomor Kepdirjen" placeholder="Nomor keputusan penunjukan" disabled />
					<DateField label="Tanggal Penunjukan" disabled />
					<FormField label="Status Penunjukan" placeholder="Status pemungut" disabled />
					<FormField label="ID Pemungut PPN PMSE" placeholder="ID terdaftar" disabled />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="05" title="Jenis Perubahan" bordered>
				<ResponsiveGrid columns={3} gap="8px 22px">
					{#each changeTypes as item}<CheckboxField label={item} compact />{/each}
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="06" title="Data Pemungut PPN PMSE Baru" bordered>
				<Stack gap="18px">
					<ResponsiveGrid columns={2}>
						<FormField label="Nama Badan Usaha" required />
						<FormField label="Nama Dagang / Merek" />
						<FormField label="Nomor Identitas Pajak Negara Asal" required />
						<SelectField label="Negara Asal" bind:value={country} options={countries} error={submitted && !country ? "Wajib dipilih." : ""} required />
					</ResponsiveGrid>
					<TextAreaField label="Alamat Kantor Pusat" rows={3} required />
					<ResponsiveGrid columns={2}>
						<FormField label="Kota" />
						<FormField label="Kode Pos" />
						<FormField label="Nomor Telepon" type="tel" required />
						<FormField label="Alamat Email" type="email" required />
						<FormField label="Nama Narahubung" required />
						<FormField label="Email Narahubung" type="email" required />
						<FormField label="Situs Web Utama" type="url" placeholder="https://contoh.com" required />
						<FormField label="Nama Aplikasi / Platform" />
						<FormField label="Nama Bank / Penyelenggara Pembayaran" />
						<FormField label="Nomor Rekening Pembayaran" />
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="07" title="Dokumen Pendukung" description="Format berkas PDF, JPG, JPEG, atau PNG." bordered>
				<ResponsiveGrid columns={2}>
					<FileUploadField label="Surat Permohonan Perubahan" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Dokumen Legalitas Badan Usaha" accept=".pdf,.jpg,.jpeg,.png" required />
					<FileUploadField label="Dokumen Pendukung Perubahan" accept=".pdf,.jpg,.jpeg,.png" />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="08" title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField label="Saya menyatakan bahwa data dan dokumen perubahan Pemungut PPN PMSE yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan." bind:checked={agreed} required />
			</FormSection>

			{#if saved}<InlineAlert tone="success" message="Permohonan perubahan data Pemungut PPN PMSE telah disimpan." />{/if}
			<FormActions><ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton></FormActions>
		</Stack>
	</form>
</PageLayout>

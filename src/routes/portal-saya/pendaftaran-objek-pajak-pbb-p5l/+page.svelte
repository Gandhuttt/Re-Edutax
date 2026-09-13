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
		type SelectFieldValue,
	} from "$lib/re-ui-components";

	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	let sector = $state<SelectFieldValue>("");
	let subsector = $state<SelectFieldValue>("");
	let earthType = $state<SelectFieldValue>("");
	let detail = $state<SelectFieldValue>("");
	let province = $state<SelectFieldValue>("");
	let city = $state<SelectFieldValue>("");
	let district = $state<SelectFieldValue>("");
	let village = $state<SelectFieldValue>("");

	const today = new Intl.DateTimeFormat("en-CA").format(new Date());
	const sectors = [
		"Perkebunan",
		"Perhutanan",
		"Pertambangan Minyak dan Gas Bumi",
		"Pertambangan Mineral atau Batubara",
		"Sektor Lainnya",
	];
</script>

<svelte:head><title>Pendaftaran Objek Pajak PBB P5L</title></svelte:head>

<PageLayout contentWidth="1320px">
	<Breadcrumbs
		items={[
			{ label: "Portal Saya", href: "/" },
			{ label: "Pendaftaran Objek Pajak PBB P5L" },
		]}
	/>
	<PageHeading eyebrow="Portal Saya" title="Pendaftaran Objek Pajak PBB P5L" />

	<form onsubmit={(event) => { event.preventDefault(); saved = true; }}>
		<Stack gap="18px">
			<FormSection number="01" title="Manajemen Kasus" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Kanal" value="Daring (Portal Wajib Pajak)" disabled required />
					<DateField label="Tanggal Permohonan" value={today} disabled />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="02" title="Kuasa Wajib Pajak" bordered>
				<Stack gap="16px">
					<CheckboxField
						label="Diisi oleh perwakilan Wajib Pajak?"
						bind:checked={represented}
					/>
					<ResponsiveGrid columns={2}>
						<FormField label="ID Penunjukan Perwakilan" disabled={!represented} />
						<FormField label="NIK/NPWP Perwakilan" disabled={!represented} />
						<FormField label="Nama Wakil/Kuasa" disabled={!represented} />
					</ResponsiveGrid>
				</Stack>
			</FormSection>

			<FormSection number="03" title="Identitas Wajib Pajak" bordered>
				<ResponsiveGrid columns={2}>
					<FormField
						label="NIK/TIN"
						placeholder="NIK/NPWP Wajib Pajak"
						disabled
						required
					/>
					<FormField label="Nama Wajib Pajak" disabled />
					<div class="full">
						<TextAreaField label="Alamat" rows={3} disabled />
					</div>
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="04" title="Data Objek Pajak" bordered>
				<ResponsiveGrid columns={2}>
					<FormField label="Nomor Induk Berusaha" required />
					<DateField label="Tanggal Nomor Induk Berusaha" required />
					<FormField label="Nomor Izin Objek" required />
					<DateField label="Tanggal Izin Objek" value={today} required />
					<FormField label="Nama Objek Pajak" required />
					<SelectField
						label="Sektor"
						bind:value={sector}
						required
						searchable
						options={[
							{ value: "", label: "Silakan Pilih" },
							...sectors.map((item) => ({ value: item, label: item })),
						]}
					/>
					<SelectField label="Jenis/Subsektor" bind:value={subsector} required options={[{ value: "", label: "Silakan Pilih" }]} />
					<SelectField label="Jenis Bumi" bind:value={earthType} required options={[{ value: "", label: "Silakan Pilih" }]} />
					<SelectField label="Detail" bind:value={detail} required options={[{ value: "", label: "Silakan Pilih" }]} />
					<FormField label="Instansi Pemberi Izin" required />
					<FormField label="Luas Objek Pajak (m²)" type="number" min="0" required />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="05" title="Alamat Objek" bordered>
				<ResponsiveGrid columns={2}>
					<div class="full">
						<TextAreaField label="Detail Alamat" rows={3} />
					</div>
					<SelectField label="Provinsi" bind:value={province} options={[{ value: "", label: "Silakan Pilih" }]} />
					<SelectField label="Kota" bind:value={city} required options={[{ value: "", label: "Silakan Pilih" }]} />
					<SelectField label="Kecamatan" bind:value={district} options={[{ value: "", label: "Silakan Pilih" }]} />
					<SelectField label="Kelurahan/Desa" bind:value={village} required options={[{ value: "", label: "Silakan Pilih" }]} />
					<FormField label="Kode Wilayah" disabled required />
					<FormField label="Kode Pos" inputmode="numeric" />
					<FormField label="Data Geometri" disabled required />
					<div class="field-action">
						<ActionButton disabled>Tandai Alamat</ActionButton>
					</div>
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="06" title="Dokumen" bordered>
				<ResponsiveGrid columns={2}>
					<FileUploadField label="Foto Objek Pajak" required />
					<FileUploadField label="Dokumen Izin Usaha" required />
					<FileUploadField label="Dokumen Izin Objek Pajak" required />
					<FileUploadField label="Peta Luar Objek Pajak" required />
				</ResponsiveGrid>
			</FormSection>

			<FormSection number="07" title="Pernyataan Wajib Pajak" bordered>
				<CheckboxField
					label="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang saya informasikan di atas adalah benar dan lengkap."
					bind:checked={agreed}
					required
				/>
			</FormSection>

			{#if saved}
				<InlineAlert tone="success" message="Data permohonan telah disimpan." />
			{/if}

			<FormActions>
				<ActionButton type="submit" disabled={!agreed}>Simpan</ActionButton>
			</FormActions>
		</Stack>
	</form>
</PageLayout>

<style>
	.full {
		grid-column: 1 / -1;
	}

	.field-action {
		display: flex;
		align-items: flex-end;
	}
</style>

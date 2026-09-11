<script lang="ts">
	import {
		ActionButton,
		ActionShowcase,
		AnnouncementBar,
		AppHeader,
		Breadcrumbs,
		CheckboxField,
		ContentSection,
		DataTableViewport,
		DateField,
		DisclosureItem,
		DocumentTabs,
		FakturFormSection,
		FieldGrid,
		FileUploadField,
		FormActions,
		FormField,
		FormIssueSummary,
		FoundationPanel,
		InlineAlert,
		InstitutionalModal,
		KeyValueGrid,
		LabeledGroup,
		MultiSelectField,
		NavDropdown,
		NavLink,
		PageHeading,
		PageLayout,
		PanelHeading,
		ProcessWorkbench,
		ProfileMenu,
		RadioGroup,
		ReUiRoot,
		ResponsiveGrid,
		RupiahField,
		SectionHeading,
		SelectField,
		SideHintField,
		Stack,
		StatusBadge,
		SummaryStrip,
		TabbedSection,
		TableActions,
		TextAreaField,
		TextBlock,
	} from "$lib/re-ui-components";
	import { remoteSpecimen } from "./specimen.remote";
	let activeSection = $state("Ringkasan");
	let modalOpen = $state(false);
	let specimenTab = $state("Formulir");
	let sptTab = $state("Induk");
	let taxType = $state("pph23");
	let itemCode = $state("010000");
	let incomeSources = $state(["business", "employment"]);
	let taxBase = $state(125000000);
	let correctionReason = $state("");
	let declarationAccepted = $state(false);
	let taxpayerType = $state("badan");
	let noticeOpen = $state(true);
	let transactionDescription = $state(
		"Jasa konsultasi pengembangan sistem informasi.",
	);
	const processSteps = [
		{ value: "Ringkasan", label: "Ringkasan", status: "Lengkap" },
		{ value: "Identitas", label: "Identitas", status: "Lengkap" },
		{
			value: "Dokumen",
			label: "Dokumen",
			status: "Sedang dikerjakan",
		},
		{
			value: "Perhitungan",
			label: "Perhitungan",
			status: "Belum dimulai",
		},
		{
			value: "Pernyataan",
			label: "Pernyataan",
			status: "Belum dimulai",
		},
	];
	const fakturMenu = [
		{
			heading: "Faktur Pajak",
			items: [
				{
					label: "Faktur Keluaran",
					description: "Buat dan kelola faktur penjualan",
					href: "#workspace",
				},
				{
					label: "Faktur Masukan",
					description: "Dokumen pajak dari pemasok",
					href: "#workspace",
				},
			],
		},
		{
			heading: "Administrasi",
			items: [
				{
					label: "Impor Faktur",
					description: "Unggah data transaksi secara massal",
					href: "#workspace",
				},
				{
					label: "Dokumen Lain",
					description: "Kelola dokumen pendukung",
					href: "#workspace",
				},
			],
		},
	];
	const sptMenu = [
		{
			heading: "Surat Pemberitahuan",
			items: [
				{
					label: "Konsep SPT",
					description: "Lanjutkan draf yang tersimpan",
					href: "#workspace",
				},
				{
					label: "Lapor SPT",
					description: "Siapkan dan kirim pelaporan",
					href: "#workspace",
				},
			],
		},
		{
			heading: "Riwayat",
			items: [
				{
					label: "SPT Dilaporkan",
					description: "Arsip bukti penerimaan",
					href: "#workspace",
				},
				{
					label: "Pembayaran",
					description: "Lihat status dan riwayat bayar",
					href: "#workspace",
				},
			],
		},
	];
	const ebupotMenu = [
		{
			heading: "Bukti Potong",
			items: [
				{
					label: "PPh Pasal 21",
					description: "Pegawai dan bukan pegawai",
					href: "#workspace",
				},
				{
					label: "Bukti Potong Unifikasi",
					description: "PPh 22, 23, 4(2), dan lainnya",
					href: "#workspace",
				},
			],
		},
		{
			heading: "Dokumen Saya",
			items: [
				{
					label: "Bukti Potong Diterima",
					description: "Dokumen sebagai penerima penghasilan",
					href: "#workspace",
				},
				{
					label: "Pemungutan Pajak",
					description: "Kelola dokumen pemungutan",
					href: "#workspace",
				},
			],
		},
	];
	const profileGroups = [
		{
			label: "Portal Saya",
			items: [
				"Dokumen Saya",
				"Notifikasi Saya",
				"Kasus Saya",
				"Kasus Berjalan Saya",
				"Pengukuhan PKP",
				"Pendaftaran Objek Pajak PBB P5L",
			].map((label) => ({ label, href: "#workspace" })),
		},
		{
			label: "Perubahan Data",
			items: [
				"Identitas Wajib Pajak",
				"Perubahan Alamat Utama",
				"Data Objek Pajak PBB P5L",
				"Data Pemungut PPN PMSE",
			].map((label) => ({ label, href: "#workspace" })),
		},
		{
			label: "Perubahan Status",
			items: [
				"Wajib Pajak Nonaktif",
				"Pengaktifan Kembali",
				"Pemungut PMSE",
				"Pemungut Bea Meterai",
				"Pemotong/Pemungut PPh dan PPN",
				"Lembaga Keuangan Pelapor",
				"Status Wajib Pajak GloBE",
			].map((label) => ({ label, href: "#workspace" })),
		},
		{
			label: "Profil Saya",
			items: [
				"Ikhtisar Profil",
				"Informasi Umum",
				"Alamat",
				"Detail Kontak",
				"Pihak Terkait",
				"Objek Pajak PBB",
				"Klasifikasi Lapangan Usaha",
				"Detail Bank",
				"Tempat Kegiatan Usaha",
				"Jenis Pajak",
				"Wakil/Kuasa Saya",
				"Verifikasi Dua Langkah",
			].map((label) => ({ label, href: "#workspace" })),
		},
	];
	const records = [
		{
			id: "BPU-2026-00481",
			name: "PT Sumber Data Nusantara",
			period: "Agustus 2026",
			amount: "Rp 12.450.000",
			status: "Perlu diperiksa",
			tone: "attention" as const,
		},
		{
			id: "BPU-2026-00480",
			name: "CV Karya Persada",
			period: "Agustus 2026",
			amount: "Rp 4.875.000",
			status: "Draf",
			tone: "neutral" as const,
		},
		{
			id: "BPU-2026-00479",
			name: "Nadia Putri Lestari",
			period: "Juli 2026",
			amount: "Rp 1.250.000",
			status: "Terverifikasi",
			tone: "success" as const,
		},
	];
</script>

<svelte:head><title>UI Lab — Institutional Paper</title></svelte:head>

<ReUiRoot>
	<AppHeader
		brand="EduTax"
		subtitle="Layanan Administrasi Perpajakan"
		mark="ET"
		homeHref="/dev/ui"
		homeLabel="Beranda UI Lab"
	>
		{#snippet navigation()}
			<NavDropdown label="Faktur" sections={fakturMenu} />
			<NavDropdown label="SPT" sections={sptMenu} />
			<NavDropdown label="eBupot" sections={ebupotMenu} />
			<NavLink href="#components">Komponen</NavLink>
		{/snippet}
		{#snippet account()}
			<ProfileMenu
				name="CV Demo Jaya"
				role="0345678901234000"
				initials="WP"
				groups={profileGroups}
			/>
		{/snippet}
	</AppHeader>
	<AnnouncementBar
		bind:open={noticeOpen}
		title="Pemberitahuan sistem"
		message="Pemeliharaan layanan dijadwalkan Sabtu, 12 September pukul 22.00 WIB."
	/>
	<PageLayout id="workspace">
		<Breadcrumbs
			ariaLabel="Jejak navigasi"
			items={[
				{ label: "Beranda", href: "/dev/ui" },
				{ label: "e-Bupot", href: "#workspace" },
				{ label: "Bukti Potong Unifikasi" },
			]}
		/>
		<PageHeading
			eyebrow="Layanan perpajakan"
			title="Bukti Potong Unifikasi"
			description="Kelola, periksa, dan terbitkan dokumen pemotongan pajak dalam satu ruang kerja."
		>
			{#snippet actions()}
				<ActionButton tone="quiet">Unduh panduan</ActionButton>
				<ActionButton tone="secondary" onclick={() => (modalOpen = true)}>
					+ Buat bukti potong
				</ActionButton>
			{/snippet}
		</PageHeading>

		<Stack gap="34px">
			<ProcessWorkbench
				steps={processSteps}
				bind:active={activeSection}
				navLabel="Tahapan proses dokumen"
				navTitle="PROSES DOKUMEN"
				help={{
					title: "Butuh bantuan?",
					description:
						"Lihat petunjuk pengisian dan dasar peraturan yang berlaku.",
					label: "Buka pusat bantuan",
					href: "#components",
				}}
			>
				{#snippet children(active)}
					<PanelHeading number="01" title={active}>
						{#snippet trailing()}
							<StatusBadge label="Draf tersimpan" />
						{/snippet}
					</PanelHeading>
					<SummaryStrip
						items={[
							{ label: "Nomor dokumen", value: "BPU-2026-00482" },
							{ label: "Masa pajak", value: "September 2026" },
							{ label: "Status validasi", value: "3 dari 5 bagian" },
						]}
					/>
					<ContentSection
						title="Identitas penerima penghasilan"
						description="Pastikan data identitas sesuai dengan dokumen resmi dan profil wajib pajak."
					>
						<Stack gap="20px">
							<FieldGrid>
								<FormField
									label="Nomor Identitas Wajib Pajak"
									value="0123456789012345"
									hint="16 digit NPWP penerima penghasilan"
								/>
								<FormField
									label="Nama penerima penghasilan"
									value="PT Sumber Data Nusantara"
								/>
								<FormField
									label="NITKU"
									value="0123456789012345000000"
									disabled
								/>
								<FormField
									label="Jenis dokumen"
									value="Faktur / invoice"
								/>
							</FieldGrid>
							<InlineAlert
								title="Informasi sebelum melanjutkan"
								message="Periksa kembali identitas penerima. Perubahan setelah dokumen diterbitkan memerlukan proses pembetulan."
							/>
						</Stack>
					</ContentSection>
					<FormActions message="Terakhir disimpan 10 September 2026, 14.32 WIB">
						<ActionButton tone="quiet">Simpan draf</ActionButton>
						<ActionButton>Lanjutkan ke dokumen →</ActionButton>
					</FormActions>
				{/snippet}
			</ProcessWorkbench>

			<section id="records">
				<SectionHeading eyebrow="Data terkini" title="Dokumen terakhir">
					{#snippet action()}
						<a href="#records">Lihat seluruh dokumen →</a>
					{/snippet}
				</SectionHeading>
				<DataTableViewport label="Dokumen terakhir" minWidth="860px">
					<table>
						<thead>
							<tr>
								<th>Nomor dokumen</th>
								<th>Penerima penghasilan</th>
								<th>Masa pajak</th>
								<th class="right">PPh dipotong</th>
								<th>Status</th>
								<th>Tindakan</th>
							</tr>
						</thead>
						<tbody>
							{#each records as record}
								<tr>
									<td><a href="#record">{record.id}</a></td>
									<td>{record.name}</td>
									<td>{record.period}</td>
									<td class="right amount">{record.amount}</td>
									<td class="action-cell">
										<StatusBadge label={record.status} tone={record.tone} />
									</td>
									<td>
										<TableActions
											actions={[{ label: "Buka" }]}
											visibleCount={1}
										/>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</DataTableViewport>
			</section>

			<section id="components">
				<SectionHeading
					eyebrow="Cakupan komponen"
					title="Administrative component lab"
					description="Komponen diuji dalam kepadatan, status, dan pola interaksi yang benar-benar muncul pada layanan proyek ini."
				/>
			<TabbedSection
				tabs={[
					"Formulir",
					"Remote function",
					"Pilihan & status",
					"Bagian bertingkat",
					"Faktur",
					"Tindakan",
				]}
				bind:active={specimenTab}
			>
				{#snippet children(active)}
					{#if active === "Formulir"}
						<FieldGrid gap="20px 24px">
							<SelectField
								label="Jenis pajak"
								bind:value={taxType}
								required
								options={[
									{ value: "pph23", label: "PPh Pasal 23" },
									{ value: "pph21", label: "PPh Pasal 21" },
									{
										value: "ppn",
										label: "Pajak Pertambahan Nilai",
									},
								]}
								hint="Menentukan daftar objek dan tarif pajak."
							/><SelectField
								label="Kode barang atau jasa"
								bind:value={itemCode}
								searchable
								searchPlaceholder="Cari kode atau nama barang/jasa"
								options={[
									{
										value: "010000",
										label: "010000 — Barang hasil pertanian",
									},
									{
										value: "020000",
										label: "020000 — Barang hasil peternakan",
									},
									{
										value: "030000",
										label: "030000 — Barang hasil perikanan",
									},
									{
										value: "040100",
										label: "040100 — Produk makanan olahan",
									},
									{
										value: "050200",
										label: "050200 — Peralatan elektronik",
									},
									{
										value: "060300",
										label: "060300 — Perangkat lunak dan lisensi",
									},
									{
										value: "070100",
										label: "070100 — Jasa konsultasi manajemen",
									},
									{
										value: "070200",
										label: "070200 — Jasa teknologi informasi",
									},
								]}
								hint="Ketik kode atau nama untuk menyaring daftar."
							/><MultiSelectField
								label="Sumber penghasilan"
								bind:value={incomeSources}
								required
								options={[
									{
										value: "business",
										label: "Kegiatan usaha",
									},
									{ value: "employment", label: "Pekerjaan" },
									{
										value: "independent",
										label: "Pekerjaan bebas",
									},
								]}
								hint="Beberapa pilihan dapat aktif sekaligus."
							/><SelectField
								label="Alasan pembetulan"
								bind:value={correctionReason}
								options={[
									{
										value: "",
										label: "Pilih alasan pembetulan",
									},
									{
										value: "data",
										label: "Kesalahan data penerima",
									},
									{
										value: "nilai",
										label: "Perubahan nilai transaksi",
									},
								]}
								error="Alasan pembetulan wajib dipilih."
							/><SideHintField
								wide
								hint={taxType === "ppn"
									? "Gunakan nilai sebelum PPN. Sistem menggunakan jumlah ini sebagai dasar perhitungan pajak."
									: "Lengkapi nilai bruto pada Lampiran terkait sebelum melanjutkan ke bagian perhitungan."}
								><RupiahField
									label="Dasar Pengenaan Pajak"
									bind:value={taxBase}
									required
									hint="Masukkan nilai tanpa simbol atau pemisah."
								/></SideHintField
							><TextAreaField
								label="Uraian transaksi"
								bind:value={transactionDescription}
								rows={4}
								maxLength={500}
								showCount
							/><FileUploadField
								label="Unggah dokumen pendukung"
								hint="PDF, JPG, atau PNG · maksimum 5 MB"
								accept=".pdf,.jpg,.jpeg,.png"
								buttonLabel="Pilih berkas"
							/>
							><SelectField
								label="Unit kegiatan usaha"
								value="pusat"
								disabled
								options={[
									{
										value: "pusat",
										label: "000000 — Kantor Pusat",
									},
								]}
								hint="Terisi dari profil wajib pajak."
							/>
						</FieldGrid>
					{:else if active === "Remote function"}
						<form {...remoteSpecimen} novalidate>
							<Stack gap="20px">
								<InlineAlert
									title="Terhubung langsung ke SvelteKit remote form"
									message="Setiap kontrol menerima field proxy, memakai nama input yang dihasilkan SvelteKit, dan membaca issue validasi tanpa adapter per halaman."
								/>
								<FieldGrid gap="20px 24px">
									<FormField
										label="Nama wajib pajak"
										field={remoteSpecimen.fields.name}
										value="CV Demo Jaya"
										required
										autocomplete="organization"
									/>
									<SelectField
										label="Jenis pajak"
										field={remoteSpecimen.fields.taxType}
										required
										options={[
											{ value: "", label: "Pilih jenis pajak" },
											{ value: "pph21", label: "PPh Pasal 21" },
											{ value: "pph23", label: "PPh Pasal 23" },
											{ value: "ppn", label: "Pajak Pertambahan Nilai" },
										]}
									/>
									<DateField
										label="Tanggal pelaporan"
										field={remoteSpecimen.fields.filingDate}
										required
									/>
									<RupiahField
										label="Penghasilan bruto"
										field={remoteSpecimen.fields.grossIncome}
										required
									/>
									<TextAreaField
										label="Catatan"
										field={remoteSpecimen.fields.notes}
										showCount
										maxLength={240}
									/>
									<CheckboxField
										label="Data telah diperiksa"
										description="Nilai boolean memakai nama input yang dihasilkan remote field."
										field={remoteSpecimen.fields.accepted}
									/>
								</FieldGrid>
								<FormIssueSummary source={remoteSpecimen.fields} />
								{#if remoteSpecimen.result?.message}
									<InlineAlert
										tone="success"
										title="Remote function selesai"
										message={remoteSpecimen.result.message}
									/>
								{/if}
								<FormActions message="Spesimen ini hanya tersedia melalui localhost.">
									<ActionButton
										type="submit"
										pending={remoteSpecimen.pending > 0}
										pendingLabel="Mengirim..."
									>
										Kirim spesimen
									</ActionButton>
								</FormActions>
							</Stack>
						</form>
					{:else if active === "Pilihan & status"}
						<ResponsiveGrid columns={3} gap="26px">
							<RadioGroup
								label="Jenis wajib pajak"
								name="taxpayer-type"
								bind:value={taxpayerType}
								options={[
									{
										value: "badan",
										label: "Badan",
										description: "Perusahaan atau organisasi",
									},
									{
										value: "orang",
										label: "Orang pribadi",
										description: "Individu penerima penghasilan",
									},
								]}
							/>
							<LabeledGroup label="Pernyataan">
								<CheckboxField
									label="Data telah diperiksa"
									description="Saya menyatakan informasi yang diisikan lengkap dan benar."
									bind:checked={declarationAccepted}
								/>
								<CheckboxField
									label="Persetujuan pasangan"
									description="Tidak diperlukan untuk profil ini."
									disabled
								/>
							</LabeledGroup>
							<LabeledGroup label="Status dokumen" gap="9px">
								<StatusBadge label="Draf" />
								<StatusBadge
									label="Perlu diperiksa"
									tone="attention"
								/>
								<StatusBadge
									label="Terverifikasi"
									tone="success"
								/>
							</LabeledGroup>
						</ResponsiveGrid>
					{:else if active === "Bagian bertingkat"}
						<Stack gap="20px" style="max-width: 850px">
							<DocumentTabs
								bind:active={sptTab}
								tabs={[
									{ label: "Induk" },
									{ label: "L-1" },
									{ label: "L-2", attention: true },
									{ label: "L-3A" },
									{ label: "L-3B" },
									{ label: "L-3C", available: false },
									{ label: "L-4" },
									{ label: "L-5" },
								]}
							/>
							<Stack gap="0">
								<DisclosureItem
									title="A. Identitas wajib pajak"
									meta="6 bidang · lengkap"
									open
									><p>
										Bagian terbuka menggunakan permukaan
										putih agar isi formulir terpisah jelas
										dari struktur navigasi.
									</p></DisclosureItem
								><DisclosureItem
									title="B. Penghasilan dan pemotongan"
									meta="12 bidang · 2 perlu diperiksa"
									><p>
										Konten perhitungan, tabel rincian, dan
										validasi ditempatkan di sini.
									</p></DisclosureItem
								><DisclosureItem
									title="C. Dokumen pendukung"
									meta="3 lampiran"
									><p>
										Daftar lampiran dan kontrol unggah
										dokumen ditempatkan di sini.
									</p></DisclosureItem
								>
							</Stack>
						</Stack>
					{:else if active === "Faktur"}
						<FakturFormSection />
					{:else}
						{#snippet primaryAction()}
							<ActionButton>Simpan dan lanjutkan</ActionButton>
						{/snippet}
						{#snippet addAction()}
							<ActionButton tone="secondary">+ Tambah data</ActionButton>
						{/snippet}
						{#snippet secondaryAction()}
							<ActionButton tone="quiet">Kembali</ActionButton>
						{/snippet}
						{#snippet modalAction()}
							<ActionButton onclick={() => (modalOpen = true)}>Buka modal</ActionButton>
						{/snippet}
						{#snippet dangerAction()}
							<ActionButton tone="danger">Hapus dokumen</ActionButton>
						{/snippet}
						<ActionShowcase
							groups={[
								{ label: "Utama", content: primaryAction },
								{ label: "Identitas / tambah", content: addAction },
								{ label: "Sekunder", content: secondaryAction },
								{ label: "Konfirmasi", content: modalAction },
								{
									label: "Zona berisiko",
									content: dangerAction,
									danger: true,
								},
							]}
						/>
					{/if}
				{/snippet}
			</TabbedSection>
			</section>

			<FoundationPanel
				id="foundation"
				eyebrow="Arah desain 01"
				title="Institutional Paper"
				description="Struktur yang tegas dan tenang untuk pekerjaan administratif yang padat. Navy membangun otoritas, kuning menandai hal yang perlu dikenali, dan permukaan hangat menjaga layar tetap nyaman dalam sesi panjang."
				swatches={[
					{ label: "Navy 900", color: "#12243c" },
					{ label: "Navy 700", color: "#263e5d" },
					{ label: "Identity yellow", color: "#f4c542" },
					{ label: "Paper 100", color: "#f7f4eb" },
				]}
			/>
		</Stack>
	</PageLayout>

	<InstitutionalModal bind:open={modalOpen} title="Buat bukti potong baru">
		<Stack gap="18px">
			<TextBlock>
				Sistem akan membuat dokumen draf baru untuk masa pajak yang dipilih.
			</TextBlock>
			<KeyValueGrid
				columns={2}
				surface="paper"
				items={[
					{ label: "Jenis dokumen", value: "Bukti Potong Unifikasi" },
					{ label: "Masa pajak", value: "September 2026" },
				]}
			/>
				<InlineAlert
					tone="warning"
					title="Pastikan masa pajak sudah benar."
					message="Masa pajak tidak dapat diubah setelah dokumen diterbitkan."
				/>
		</Stack>
		{#snippet actions()}
			<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Batal</ActionButton>
			<ActionButton onclick={() => (modalOpen = false)}>Buat dokumen draf</ActionButton>
		{/snippet}
	</InstitutionalModal>
</ReUiRoot>

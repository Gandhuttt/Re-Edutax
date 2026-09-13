<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		DataTableViewport,
		DateField,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		PaginationBar,
		Stack,
		TabbedSection,
		TextAreaField,
	} from "$lib/re-ui-components";

	const tabs = [
		"Profil",
		"Daftar Kode Billing Belum Dibayar",
		"Saldo Saat Ini",
		"SPT Belum Disampaikan",
		"Jenis Pajak Terdaftar",
		"Kasus Aktif",
		"Fasilitas Aktif",
	];

	let activeTab = $state("Profil");
	let tableFilterOpen = $state(false);
	let page = $state(1);
	let pageSize = $state(10);

	const tableDefinitions: Record<
		string,
		{ columns: string[]; rows: string[][]; activeFilter?: string }
	> = {
		"Daftar Kode Billing Belum Dibayar": {
			columns: ["Kode Billing", "Mata Uang", "Jumlah Total", "Masa Aktif"],
			rows: [],
		},
		"SPT Belum Disampaikan": {
			columns: [
				"Jenis Pajak",
				"Jenis SPT",
				"Masa Pajak",
				"Tanggal Jatuh Tempo",
				"Model SPT",
			],
			rows: [
				["PPN", "SPT Masa PPN", "Juli 2026", "31/08/2026", "Pembetulan"],
				[
					"PPh Badan",
					"SPT PPh Badan Rupiah",
					"Januari - Desember 2025",
					"30/04/2026",
					"Pembetulan",
				],
			],
		},
		"Jenis Pajak Terdaftar": {
			columns: [
				"Jenis Pajak",
				"Tanggal Permohonan",
				"Tanggal Mulai Transaksi",
				"Tanggal Pendaftaran",
				"Nomor Kasus",
			],
			rows: [],
		},
		"Kasus Aktif": {
			columns: [
				"Nomor Kasus",
				"Jenis Kasus",
				"Status Kasus",
				"Langkah Alur Kerja",
				"Tanggal Jatuh Tempo Tertinggi",
			],
			rows: [],
		},
		"Fasilitas Aktif": {
			columns: [
				"Kode Jenis Layanan",
				"Deskripsi Kode Jenis Layanan",
				"Nama Sub Kode Jenis Layanan",
				"Sub Kode Jenis Layanan Deskripsi",
				"Kode Layanan Administrasi",
				"Status",
				"Tanggal Mulai",
				"Tanggal Berakhir",
				"Tanggal Dibuat",
				"Tahun Pajak",
			],
			rows: [],
			activeFilter: "Status: Active",
		},
	};

	function selectTab(tab: string) {
		activeTab = tab;
		page = 1;
	}
</script>

<svelte:head><title>Ikhtisar Profil Wajib Pajak</title></svelte:head>

{#snippet pageActions()}
	<ActionButton>Unduh Ikhtisar Profil</ActionButton>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[{ label: "Profil Saya" }]} />
	<PageHeading eyebrow="Profil Saya" title="Ikhtisar Profil Wajib Pajak" actions={pageActions} />

	<TabbedSection tabs={tabs} active={activeTab} ariaLabel="Ikhtisar profil" onchange={selectTab}>
		{#snippet children()}
			{#if activeTab === "Profil"}
				<div class="profile-columns">
					<Stack gap="10px">
						<FormField label="Nama" name="namaWP" />
						<FormField label="Nomor Pokok Wajib Pajak" name="nomorWP" />
						<FormField label="Kegiatan Utama" name="kegiatanUtama" />
						<FormField label="Jenis Wajib Pajak" name="jenisWP" />
						<FormField label="Bentuk Badan Hukum" name="badanHukum" />
						<FormField label="Status NPWP" name="statusNPWP" />
						<DateField label="Tanggal Terdaftar" name="tglTerdaftar" />
						<DateField label="Tanggal Aktivasi" name="tglAktivasi" />
						<FormField label="Status Pengusaha Kena Pajak" name="statusKenaPajak" />
						<DateField
							label="Tanggal Pengukuhan Pengusaha Kena Pajak"
							name="tglPengukuhan"
						/>
						<FormField
							label="Kantor Wilayah Direktorat Jenderal Pajak"
							name="kantorDJP"
						/>
						<FormField label="Kantor Pelayanan Pajak" name="kantorPelayanan" />
						<FormField label="Seksi Pengawasan" name="seksiPengawasan" />
						<DateField
							label="Tanggal Pembaruan Profil Terakhir"
							name="lastProfileUpdate"
						/>
					</Stack>

					<Stack gap="18px">
						<FormSection title="Alamat Utama" bordered>
							<TextAreaField label="Alamat Utama" name="alamatWP" maxLength={200} resize="none" />
						</FormSection>
						<FormSection title="Kontak Utama" bordered>
							<Stack gap="10px">
								<FormField label="Nomor Handphone" name="handphoneWP" />
								<FormField label="Email" type="email" name="emailWP" />
							</Stack>
						</FormSection>
						<FormSection title="Klasifikasi Lapangan Usaha Utama" bordered>
							<Stack gap="10px">
								<FormField
									label="Kode Klasifikasi Lapangan Usaha"
									name="kodeKlasifikasi"
								/>
								<FormField
									label="Deskripsi Klasifikasi Lapangan Usaha"
									name="deskripsiKlasifikasi"
								/>
							</Stack>
						</FormSection>
					</Stack>
				</div>
			{:else if activeTab === "Saldo Saat Ini"}
				<div class="balance-grid">
					{#each ["Saldo", "Debit", "Kredit", "Debit Tersisa", "Kredit Tersisa"] as label}
						<div><span>{label}</span><strong>0,00</strong></div>
					{/each}
				</div>
			{:else}
				{@const tableDefinition = tableDefinitions[activeTab]}
				<FormSection title={activeTab} bordered padded={false}>
					{#snippet actions()}
						<Stack direction="horizontal" gap="7px" align="center" wrap>
							<ActionButton tone="quiet">Muat Ulang</ActionButton>
							<ActionButton
								tone={tableFilterOpen ? "secondary" : "quiet"}
								aria-pressed={tableFilterOpen}
								onclick={() => (tableFilterOpen = !tableFilterOpen)}>Filter</ActionButton
							>
							<ActionButton tone="quiet">Atur Kolom</ActionButton>
							<ActionButton tone="quiet">Export</ActionButton>
						</Stack>
					{/snippet}

					{#if tableDefinition.activeFilter}
						<div class="active-filter">
							<InlineAlert compact message={`Filter Aktif: ${tableDefinition.activeFilter}`} />
						</div>
					{/if}

					<DataTableViewport
						label={activeTab}
						minWidth={`${Math.max(1040, tableDefinition.columns.length * 170)}px`}
						framed={false}
						headerTone="navy"
						stickyFirstColumn
					>
						<table>
							<thead>
								<tr>{#each tableDefinition.columns as column}<th scope="col">{column}</th>{/each}</tr>
								{#if tableFilterOpen}
									<tr class="table-filters">
										{#each tableDefinition.columns as column}
											<th><input aria-label="Filter {column}" /></th>
										{/each}
									</tr>
								{/if}
							</thead>
							<tbody>
								{#each tableDefinition.rows as row}
									<tr>{#each row as value}<td>{value}</td>{/each}</tr>
								{:else}
									<tr><td class="empty" colspan={tableDefinition.columns.length}>Tidak ada data.</td></tr>
								{/each}
							</tbody>
						</table>
					</DataTableViewport>
					<PaginationBar
						bind:page
						bind:pageSize
						totalItems={tableDefinition.rows.length}
						itemLabel="data"
					/>
				</FormSection>
			{/if}
		{/snippet}
	</TabbedSection>
</PageLayout>

<style>
	.profile-columns {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 32px;
	}

	.balance-grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(150px, 1fr));
		gap: 14px;
		min-height: 400px;
		align-content: start;
	}

	.balance-grid div {
		display: flex;
		min-height: 116px;
		flex-direction: column;
		justify-content: space-between;
		padding: 16px;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper-deep);
	}

	.balance-grid span {
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	.balance-grid strong {
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 24px;
	}

	.active-filter {
		padding: 16px;
	}

	.table-filters th {
		padding: 7px;
		background: var(--ui-paper-deep);
	}

	.table-filters input {
		width: 100%;
		height: 34px;
		padding: 0 8px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		font: inherit;
	}

	.table-filters input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}

	@media (max-width: 1000px) {
		.profile-columns {
			grid-template-columns: 1fr;
		}

		.balance-grid {
			grid-template-columns: repeat(2, minmax(150px, 1fr));
		}
	}

	@media (max-width: 520px) {
		.balance-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CollapsiblePanel,
		DataTableViewport,
		FormField,
		FormSection,
		KeyValueGrid,
		PageHeading,
		PageLayout,
		Stack,
		TabbedSection,
	} from "$lib/re-ui-components";

	let activeTab = $state<"Umum" | "Penanda Wajib Pajak">("Umum");
	let filterOpen = $state(false);
	let view = $state<"Tabel" | "Kartu">("Tabel");

	const generalFields = [
		["Nama Wajib Pajak", "PT Contoh Nusantara"],
		["NIK/NPWP", "00.000.000.0-000.000"],
		["Jenis Wajib Pajak", "Badan"],
		["Bentuk Badan Hukum", "Perseroan Terbatas"],
		["Status NPWP", "Aktif"],
		["Tanggal Terdaftar", "15 Januari 2020"],
		["Kegiatan Utama", "Jasa konsultasi manajemen"],
		["Status Pengusaha Kena Pajak", "Non-PKP"],
		["Kantor Pelayanan Pajak", "KPP Pratama Contoh"],
		["Seksi Pengawasan", "Seksi Pengawasan I"],
		["Bahasa Komunikasi", "Bahasa Indonesia"],
		["Tanggal Pembaruan Terakhir", "20 Agustus 2026"],
	];

	const markers = [
		["Status Wajib Pajak", "Aktif", "15 Januari 2020", "-"],
		["Wajib Pajak Badan", "Ya", "15 Januari 2020", "-"],
	];

	function selectTab(tab: string) {
		activeTab = tab as typeof activeTab;
	}
</script>

<svelte:head><title>Informasi Umum Wajib Pajak</title></svelte:head>

{#snippet pageActions()}
	<ActionButton tone="secondary">Edit</ActionButton>
{/snippet}

{#snippet displayTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet">Muat ulang</ActionButton>
		<ActionButton
			tone={view === "Tabel" ? "secondary" : "quiet"}
			aria-pressed={view === "Tabel"}
			onclick={() => (view = "Tabel")}>Tabel</ActionButton
		>
		<ActionButton
			tone={view === "Kartu" ? "secondary" : "quiet"}
			aria-pressed={view === "Kartu"}
			onclick={() => (view = "Kartu")}>Kartu</ActionButton
		>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="marker-filter"
			onclick={() => (filterOpen = !filterOpen)}>Filter</ActionButton
		>
		<ActionButton tone="quiet">Atur Kolom</ActionButton>
		<ActionButton tone="quiet">Export</ActionButton>
		<ActionButton tone="quiet">Detail lengkap</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Profil Saya", href: "/profile" },
			{ label: "Informasi Umum" },
		]}
	/>
	<PageHeading
		eyebrow="Profil Saya"
		title="Informasi Umum Wajib Pajak"
		actions={pageActions}
	/>

	<FormSection title="Informasi Wajib Pajak" actions={displayTools} bordered padded={false}>
		<TabbedSection
			tabs={["Umum", "Penanda Wajib Pajak"]}
			active={activeTab}
			ariaLabel="Informasi wajib pajak"
			onchange={selectTab}
		>
			{#snippet children()}
				{#if activeTab === "Umum"}
					<KeyValueGrid
						items={generalFields.map(([label, value]) => ({ label, value }))}
						columns={2}
						surface="paper"
					/>
				{:else}
					<CollapsiblePanel open={filterOpen} id="marker-filter" label="Filter penanda">
						<div class="filter-field">
							<FormField label="Cari penanda" placeholder="Masukkan kata kunci" />
						</div>
					</CollapsiblePanel>

					{#if view === "Kartu"}
						<div class="marker-cards">
							{#each markers as row}
								<article>
									<strong>{row[0]}</strong>
									<span>Nilai: {row[1]}</span>
									<span>Mulai: {row[2]}</span>
									<span>Berakhir: {row[3]}</span>
								</article>
							{/each}
						</div>
					{:else}
						<DataTableViewport
							label="Penanda Wajib Pajak"
							minWidth="680px"
							framed={false}
							headerTone="navy"
						>
							<table>
								<thead>
									<tr>
										<th scope="col">Penanda</th>
										<th scope="col">Nilai</th>
										<th scope="col">Tanggal Mulai</th>
										<th scope="col">Tanggal Berakhir</th>
									</tr>
								</thead>
								<tbody>
									{#each markers as row}
										<tr>{#each row as value}<td>{value}</td>{/each}</tr>
									{/each}
								</tbody>
							</table>
						</DataTableViewport>
					{/if}
				{/if}
			{/snippet}
		</TabbedSection>
	</FormSection>
</PageLayout>

<style>
	.filter-field {
		max-width: 460px;
	}

	.marker-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 14px;
		padding-top: 16px;
	}

	.marker-cards article {
		display: flex;
		flex-direction: column;
		gap: 7px;
		padding: 16px;
		border: 1px solid var(--ui-line-strong);
		background: #fffefa;
	}

	.marker-cards strong {
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 17px;
	}

	.marker-cards span {
		color: var(--ui-muted);
		font-size: 12px;
	}
</style>

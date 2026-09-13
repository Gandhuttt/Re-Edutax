<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CollapsiblePanel,
		DataTableViewport,
		DateField,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		PaginationBar,
		ResponsiveGrid,
		SelectField,
		Stack,
		StatusBadge,
		SummaryStrip,
		TableActions,
		type StatusBadgeTone,
	} from "$lib/re-ui-components";

	type RequestRow = {
		number: string;
		type: string;
		taxpayer: string;
		submitted: string;
		updated: string;
		status: string;
		step: string;
	};

	let { variant = "all" }: { variant?: "all" | "pending" } = $props();

	const requests: RequestRow[] = [
		{
			number: "REQ-DEMO-2026-001",
			type: "Perubahan Data Wajib Pajak",
			taxpayer: "PT Contoh Sentosa",
			submitted: "02/09/2026",
			updated: "04/09/2026",
			status: "Dalam Penelitian",
			step: "Verifikasi dokumen",
		},
		{
			number: "REQ-DEMO-2026-002",
			type: "Permohonan Layanan Perpajakan",
			taxpayer: "Usaha Demo Mandiri",
			submitted: "28/08/2026",
			updated: "03/09/2026",
			status: "Menunggu Kelengkapan",
			step: "Kelengkapan pemohon",
		},
		{
			number: "REQ-DEMO-2026-003",
			type: "Pembaruan Kontak",
			taxpayer: "PT Contoh Sentosa",
			submitted: "14/08/2026",
			updated: "16/08/2026",
			status: "Selesai",
			step: "Selesai",
		},
		{
			number: "REQ-DEMO-2026-004",
			type: "Pencabutan Permohonan",
			taxpayer: "Usaha Demo Mandiri",
			submitted: "08/08/2026",
			updated: "09/08/2026",
			status: "Dibatalkan",
			step: "Ditutup",
		},
	];

	let filtersVisible = $state(false);
	let historyVisible = $state(false);
	let query = $state("");
	let status = $state<string | number>("");
	let submittedFrom = $state("");
	let page = $state(1);
	let pageSize = $state(10);

	const baseRows = $derived(
		variant === "pending"
			? requests.filter((item) => !["Selesai", "Dibatalkan"].includes(item.status))
			: requests,
	);
	const rows = $derived.by(() => {
		const search = query.trim().toLocaleLowerCase("id-ID");
		return baseRows.filter((item) => {
			const matchesQuery =
				!search ||
				Object.values(item).some((value) =>
					value.toLocaleLowerCase("id-ID").includes(search),
				);
			const matchesStatus = !status || item.status === status;
			const matchesDate = !submittedFrom || toIsoDate(item.submitted) >= submittedFrom;
			return matchesQuery && matchesStatus && matchesDate;
		});
	});
	const pagedRows = $derived(
		rows.slice((page - 1) * pageSize, page * pageSize),
	);
	const hasFilters = $derived(Boolean(query || status || submittedFrom));
	const title = $derived(
		variant === "pending" ? "Permohonan Tertunda" : "Semua Permintaan",
	);
	const description = $derived(
		variant === "pending"
			? "Pantau permohonan yang masih memerlukan proses atau tindakan."
			: "Telusuri seluruh riwayat permintaan dan status penyelesaiannya.",
	);

	function toIsoDate(date: string) {
		const [day, month, year] = date.split("/");
		return `${year}-${month}-${day}`;
	}

	function badgeTone(requestStatus: string): StatusBadgeTone {
		if (requestStatus === "Selesai") return "success";
		if (requestStatus === "Dibatalkan") return "error";
		return "attention";
	}

	function clearFilters() {
		query = "";
		status = "";
		submittedFrom = "";
		page = 1;
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

{#snippet pageActions()}
	<ActionButton tone="secondary">Buat Permintaan</ActionButton>
{/snippet}

{#snippet registryActions()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet">Muat Ulang</ActionButton>
		<ActionButton
			tone={filtersVisible ? "secondary" : "quiet"}
			aria-expanded={filtersVisible}
			aria-controls="request-filters"
			onclick={() => (filtersVisible = !filtersVisible)}
		>
			Filter
		</ActionButton>
		<ActionButton tone="quiet">Atur Kolom</ActionButton>
		<ActionButton tone="quiet">Export</ActionButton>
		<ActionButton
			tone={historyVisible ? "secondary" : "quiet"}
			aria-expanded={historyVisible}
			aria-controls="request-history"
			onclick={() => (historyVisible = !historyVisible)}
		>
			{historyVisible ? "Tutup Riwayat" : "Riwayat"}
		</ActionButton>
		{#if hasFilters}
			<ActionButton tone="quiet" onclick={clearFilters}>Hapus Filter</ActionButton>
		{/if}
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Profil", href: "/profile" },
			{ label: title },
		]}
	/>

	<PageHeading
		eyebrow="Profil Saya"
		{title}
		{description}
		actions={pageActions}
	/>

	<FormSection title="Daftar Permintaan" actions={registryActions} bordered padded={false}>
		<CollapsiblePanel
			open={filtersVisible}
			id="request-filters"
			label="Filter permintaan"
		>
			<ResponsiveGrid columns={3} gap="16px">
				<FormField
					label="Cari"
					bind:value={query}
					placeholder="Nomor, jenis, atau wajib pajak"
					oninput={() => (page = 1)}
				/>
				<SelectField
					label="Status"
					value={status}
					options={[
						{ value: "", label: "Semua status" },
						{ value: "Dalam Penelitian", label: "Dalam Penelitian" },
						{ value: "Menunggu Kelengkapan", label: "Menunggu Kelengkapan" },
						{ value: "Selesai", label: "Selesai" },
						{ value: "Dibatalkan", label: "Dibatalkan" },
					]}
					onchange={(value) => {
						status = value;
						page = 1;
					}}
				/>
				<DateField
					label="Diajukan sejak"
					value={submittedFrom}
					onchange={(value) => {
						submittedFrom = value;
						page = 1;
					}}
				/>
			</ResponsiveGrid>
		</CollapsiblePanel>

		{#if historyVisible}
			<div id="request-history" class="history">
				<InlineAlert
					title="Aktivitas terbaru"
					message="Pembaruan status terakhir pada 04/09/2026 untuk data demonstrasi."
				/>
			</div>
		{/if}

		<SummaryStrip
			columns={3}
			items={[
				{ label: "Daftar aktif", value: baseRows.length },
				{ label: "Hasil ditemukan", value: rows.length },
				{ label: "Halaman aktif", value: page },
			]}
		/>

		<DataTableViewport
			label={title}
			minWidth="1320px"
			framed={false}
			headerTone="navy"
		>
			<table>
				<thead>
					<tr>
						<th scope="col">Nomor Permintaan</th>
						<th scope="col">Jenis Permintaan</th>
						<th scope="col">Wajib Pajak</th>
						<th scope="col">Tanggal Diajukan</th>
						<th scope="col">Pembaruan Terakhir</th>
						<th scope="col">Status</th>
						<th scope="col">Langkah Saat Ini</th>
						<th scope="col">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each pagedRows as item (item.number)}
						<tr>
							<td><code>{item.number}</code></td>
							<td><strong>{item.type}</strong></td>
							<td>{item.taxpayer}</td>
							<td class="number">{item.submitted}</td>
							<td class="number">{item.updated}</td>
							<td>
								<StatusBadge label={item.status} tone={badgeTone(item.status)} />
							</td>
							<td>{item.step}</td>
							<td class="action-cell">
								<TableActions
									visibleCount={1}
									actions={[
										{
											label: "Lihat",
											ariaLabel: `Lihat ${item.number}`,
										},
									]}
								/>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="empty" colspan="8">
								<strong>
									{variant === "pending"
										? "Tidak ada permohonan tertunda."
										: "Tidak ada permintaan yang ditemukan."}
								</strong>
								<span>
									{hasFilters
										? "Coba ubah atau hapus kriteria filter."
										: "Permintaan yang dibuat akan tampil di tabel ini."}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>

		<PaginationBar
			bind:page
			bind:pageSize
			totalItems={rows.length}
			itemLabel="permintaan"
		/>
	</FormSection>
</PageLayout>

<style>
	.history {
		padding: 14px 16px;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-paper);
	}

	td:nth-child(2),
	td:nth-child(7) {
		min-width: 210px;
	}

	td.empty {
		height: 150px;
	}

	td.empty strong,
	td.empty span {
		display: block;
	}

	td.empty span {
		margin-top: 4px;
		font-weight: 400;
	}
</style>

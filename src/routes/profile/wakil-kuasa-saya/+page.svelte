<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		CollapsiblePanel,
		DataTableViewport,
		FormField,
		FormSection,
		InlineAlert,
		InstitutionalModal,
		PageHeading,
		PageLayout,
		PaginationBar,
		ResponsiveGrid,
		SelectField,
		Stack,
		StatusBadge,
		SummaryStrip,
		TableActions,
	} from "$lib/re-ui-components";

	type Representative = {
		id: number;
		npwp: string;
		name: string;
		role: string;
		startDate: string;
		endDate: string;
		status: string;
	};
	type ColumnKey = Exclude<keyof Representative, "id">;

	const representatives: Representative[] = [
		{
			id: 1,
			npwp: "00.000.000.0-000.001",
			name: "Pengguna Demo A",
			role: "Wakil Wajib Pajak",
			startDate: "01/01/2026",
			endDate: "-",
			status: "Aktif",
		},
		{
			id: 2,
			npwp: "00.000.000.0-000.002",
			name: "Pengguna Demo B",
			role: "Kuasa Wajib Pajak",
			startDate: "15/03/2026",
			endDate: "15/03/2027",
			status: "Aktif",
		},
	];
	const columnOptions: { key: ColumnKey; label: string }[] = [
		{ key: "npwp", label: "NPWP/NIK" },
		{ key: "name", label: "Nama Wakil/Kuasa" },
		{ key: "role", label: "Jenis Peran" },
		{ key: "startDate", label: "Tanggal Mulai" },
		{ key: "endDate", label: "Tanggal Berakhir" },
		{ key: "status", label: "Status" },
	];

	let filterOpen = $state(false);
	let query = $state("");
	let status = $state<string | number>("");
	let showHistory = $state(false);
	let columnDialogOpen = $state(false);
	let page = $state(1);
	let pageSize = $state(10);
	let notice = $state("");
	let visibleColumns = $state<Record<ColumnKey, boolean>>({
		npwp: true,
		name: true,
		role: true,
		startDate: true,
		endDate: true,
		status: true,
	});

	const rows = $derived(
		representatives.filter((item) => {
			const search = query.trim().toLocaleLowerCase("id-ID");
			return (
				(!search ||
					`${item.npwp} ${item.name} ${item.role}`
						.toLocaleLowerCase("id-ID")
						.includes(search)) &&
				(!status || item.status === status)
			);
		}),
	);
	const pagedRows = $derived(rows.slice((page - 1) * pageSize, page * pageSize));
	const activeCount = $derived(representatives.filter((item) => item.status === "Aktif").length);
	const visibleColumnCount = $derived(
		1 + columnOptions.filter((column) => visibleColumns[column.key]).length,
	);

	function clearFilters() {
		query = "";
		status = "";
		page = 1;
	}

	function reload() {
		clearFilters();
		notice = "Daftar wakil dan kuasa telah dimuat ulang dari data lokal.";
	}

	function restoreColumns() {
		for (const column of columnOptions) visibleColumns[column.key] = true;
	}

	function exportRepresentatives() {
		const headings = columnOptions.map((column) => column.label);
		const values = rows.map((item) => columnOptions.map((column) => item[column.key]));
		const csv = [headings, ...values]
			.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "wakil-kuasa-saya.csv";
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Wakil/Kuasa Saya</title></svelte:head>

{#snippet pageActions()}
	<ActionButton
		tone="secondary"
		onclick={() => (notice = "Penambahan wakil atau kuasa tersedia sebagai simulasi lokal.")}
	>
		Tambah Wakil/Kuasa
	</ActionButton>
{/snippet}

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={reload}>Muat Ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="representative-filters"
			onclick={() => (filterOpen = !filterOpen)}
		>Filter</ActionButton>
		<ActionButton tone="quiet" onclick={() => (columnDialogOpen = true)}>Atur Kolom</ActionButton>
		<ActionButton tone="quiet" onclick={exportRepresentatives}>Ekspor CSV</ActionButton>
		<ActionButton tone={showHistory ? "secondary" : "quiet"} onclick={() => (showHistory = !showHistory)}>
			{showHistory ? "Tutup Riwayat" : "Riwayat"}
		</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[{ label: "Profil Saya", href: "/profile" }, { label: "Wakil/Kuasa Saya" }]} />
	<PageHeading
		eyebrow="Profil Saya"
		title="Wakil/Kuasa Saya"
		description="Kelola pihak yang diberi kewenangan untuk mewakili akun ini."
		actions={pageActions}
	/>

	<Stack gap="18px">
		{#if notice}
			<InlineAlert
				tone="info"
				title="Informasi wakil/kuasa"
				message={notice}
				dismissible
				ondismiss={() => (notice = "")}
			/>
		{/if}
		{#if showHistory}
			<InlineAlert
				tone="info"
				title="Riwayat perubahan"
				message="Belum ada perubahan kewenangan yang tercatat pada sesi demo ini."
			/>
		{/if}

		<FormSection title="Daftar Wakil dan Kuasa" actions={tableTools} bordered padded={false}>
			<CollapsiblePanel open={filterOpen} id="representative-filters" label="Filter wakil dan kuasa">
				<ResponsiveGrid columns={3} gap="16px">
					<FormField
						label="Cari"
						bind:value={query}
						placeholder="NPWP, nama, atau peran"
						oninput={() => (page = 1)}
					/>
					<SelectField
						label="Status"
						bind:value={status}
						options={[
							{ value: "", label: "Semua status" },
							{ value: "Aktif", label: "Aktif" },
							{ value: "Berakhir", label: "Berakhir" },
						]}
						onchange={() => (page = 1)}
					/>
					<div class="filter-action"><ActionButton tone="quiet" onclick={clearFilters}>Hapus Filter</ActionButton></div>
				</ResponsiveGrid>
			</CollapsiblePanel>

			<SummaryStrip
				columns={3}
				items={[
					{ label: "Seluruh wakil/kuasa", value: representatives.length },
					{ label: "Wakil/kuasa aktif", value: activeCount },
					{ label: "Hasil ditemukan", value: rows.length },
				]}
			/>

			<DataTableViewport label="Daftar wakil dan kuasa saya" minWidth="1080px" framed={false} headerTone="navy">
				<table>
					<thead><tr>
						{#if visibleColumns.npwp}<th scope="col">NPWP/NIK</th>{/if}
						{#if visibleColumns.name}<th scope="col">Nama Wakil/Kuasa</th>{/if}
						{#if visibleColumns.role}<th scope="col">Jenis Peran</th>{/if}
						{#if visibleColumns.startDate}<th scope="col">Tanggal Mulai</th>{/if}
						{#if visibleColumns.endDate}<th scope="col">Tanggal Berakhir</th>{/if}
						{#if visibleColumns.status}<th scope="col">Status</th>{/if}
						<th scope="col">Aksi</th>
					</tr></thead>
					<tbody>
						{#each pagedRows as item}
							<tr>
								{#if visibleColumns.npwp}<td><code>{item.npwp}</code></td>{/if}
								{#if visibleColumns.name}<td><strong>{item.name}</strong></td>{/if}
								{#if visibleColumns.role}<td>{item.role}</td>{/if}
								{#if visibleColumns.startDate}<td class="number">{item.startDate}</td>{/if}
								{#if visibleColumns.endDate}<td class="number">{item.endDate}</td>{/if}
								{#if visibleColumns.status}<td><StatusBadge label={item.status} tone="success" /></td>{/if}
								<td class="action-cell"><TableActions visibleCount={1} actions={[{ label: "Lihat", ariaLabel: `Lihat ${item.name}`, onclick: () => (notice = `${item.name} terdaftar sebagai ${item.role}.`) }]} /></td>
							</tr>
						{:else}
							<tr><td class="empty" colspan={visibleColumnCount}><strong>Tidak ada wakil/kuasa yang ditemukan.</strong><br />Ubah kriteria filter atau tambahkan wakil/kuasa baru.</td></tr>
						{/each}
					</tbody>
				</table>
			</DataTableViewport>
			<PaginationBar bind:page bind:pageSize totalItems={rows.length} pageSizeOptions={[10, 25]} itemLabel="wakil/kuasa" />
		</FormSection>
	</Stack>
</PageLayout>

<InstitutionalModal bind:open={columnDialogOpen} eyebrow="PREFERENSI TABEL" title="Atur Kolom">
	<Stack gap="8px">
		{#each columnOptions as column}
			<CheckboxField label={column.label} checked={visibleColumns[column.key]} compact onchange={(event) => (visibleColumns[column.key] = event.currentTarget.checked)} />
		{/each}
	</Stack>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={restoreColumns}>Tampilkan Semua</ActionButton>
		<ActionButton onclick={() => (columnDialogOpen = false)}>Selesai</ActionButton>
	{/snippet}
</InstitutionalModal>

<style>
	.filter-action { display: flex; align-items: flex-end; }
</style>

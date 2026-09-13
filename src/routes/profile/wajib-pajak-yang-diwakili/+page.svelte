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

	type Taxpayer = {
		npwp: string;
		name: string;
		type: string;
		authority: string;
		startDate: string;
		status: string;
	};
	type ColumnKey = keyof Taxpayer;

	const taxpayers: Taxpayer[] = [
		{
			npwp: "00.000.000.0-000.010",
			name: "PT Contoh Sentosa",
			type: "Badan",
			authority: "Pelaporan dan pembayaran",
			startDate: "10/02/2026",
			status: "Aktif",
		},
		{
			npwp: "00.000.000.0-000.011",
			name: "Usaha Demo Mandiri",
			type: "Orang Pribadi",
			authority: "Pelaporan",
			startDate: "20/05/2026",
			status: "Aktif",
		},
	];
	const columnOptions: { key: ColumnKey; label: string }[] = [
		{ key: "npwp", label: "NPWP" },
		{ key: "name", label: "Nama Wajib Pajak" },
		{ key: "type", label: "Jenis Wajib Pajak" },
		{ key: "authority", label: "Lingkup Kewenangan" },
		{ key: "startDate", label: "Tanggal Mulai" },
		{ key: "status", label: "Status" },
	];

	let filterOpen = $state(false);
	let query = $state("");
	let type = $state<string | number>("");
	let historyOpen = $state(false);
	let columnDialogOpen = $state(false);
	let page = $state(1);
	let pageSize = $state(10);
	let notice = $state("");
	let visibleColumns = $state<Record<ColumnKey, boolean>>({
		npwp: true,
		name: true,
		type: true,
		authority: true,
		startDate: true,
		status: true,
	});

	const rows = $derived(
		taxpayers.filter(
			(item) =>
				(!query ||
					`${item.npwp} ${item.name} ${item.authority}`
						.toLocaleLowerCase("id-ID")
						.includes(query.toLocaleLowerCase("id-ID"))) &&
				(!type || item.type === type),
		),
	);
	const pagedRows = $derived(rows.slice((page - 1) * pageSize, page * pageSize));
	const visibleColumnCount = $derived(
		1 + columnOptions.filter((column) => visibleColumns[column.key]).length,
	);

	function clearFilters() {
		query = "";
		type = "";
		page = 1;
	}

	function reload() {
		clearFilters();
		notice = "Daftar wajib pajak telah dimuat ulang dari data lokal.";
	}

	function restoreColumns() {
		for (const column of columnOptions) visibleColumns[column.key] = true;
	}

	function exportTaxpayers() {
		const headings = columnOptions.map((column) => column.label);
		const values = rows.map((item) => columnOptions.map((column) => item[column.key]));
		const csv = [headings, ...values]
			.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "wajib-pajak-yang-diwakili.csv";
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Wajib Pajak yang Diwakili</title></svelte:head>

{#snippet pageActions()}
	<ActionButton
		tone="secondary"
		onclick={() => (notice = "Pengajuan perwakilan baru tersedia sebagai simulasi lokal.")}
	>
		Ajukan Perwakilan
	</ActionButton>
{/snippet}

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={reload}>Muat Ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="represented-taxpayer-filters"
			onclick={() => (filterOpen = !filterOpen)}
		>Filter</ActionButton>
		<ActionButton tone="quiet" onclick={() => (columnDialogOpen = true)}>Atur Kolom</ActionButton>
		<ActionButton tone="quiet" onclick={exportTaxpayers}>Ekspor CSV</ActionButton>
		<ActionButton tone={historyOpen ? "secondary" : "quiet"} onclick={() => (historyOpen = !historyOpen)}>
			{historyOpen ? "Tutup Riwayat" : "Riwayat"}
		</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Profil Saya", href: "/profile" },
			{ label: "Wajib Pajak yang Diwakili" },
		]}
	/>
	<PageHeading
		eyebrow="Profil Saya"
		title="Wajib Pajak yang Diwakili"
		description="Daftar wajib pajak yang memberikan akses perwakilan kepada akun ini."
		actions={pageActions}
	/>

	<Stack gap="18px">
		{#if notice}
			<InlineAlert
				tone="info"
				title="Informasi perwakilan"
				message={notice}
				dismissible
				ondismiss={() => (notice = "")}
			/>
		{/if}
		{#if historyOpen}
			<InlineAlert
				tone="info"
				title="Riwayat akses"
				message="Tidak ada perubahan akses dalam 30 hari terakhir."
			/>
		{/if}

		<FormSection title="Daftar Wajib Pajak" actions={tableTools} bordered padded={false}>
			<CollapsiblePanel open={filterOpen} id="represented-taxpayer-filters" label="Filter wajib pajak">
				<ResponsiveGrid columns={3} gap="16px">
					<FormField
						label="Cari"
						bind:value={query}
						placeholder="NPWP, nama, atau kewenangan"
						oninput={() => (page = 1)}
					/>
					<SelectField
						label="Jenis Wajib Pajak"
						bind:value={type}
						options={[
							{ value: "", label: "Semua jenis" },
							{ value: "Badan", label: "Badan" },
							{ value: "Orang Pribadi", label: "Orang Pribadi" },
						]}
						onchange={() => (page = 1)}
					/>
					<div class="filter-action"><ActionButton tone="quiet" onclick={clearFilters}>Hapus Filter</ActionButton></div>
				</ResponsiveGrid>
			</CollapsiblePanel>

			<SummaryStrip
				columns={3}
				items={[
					{ label: "Seluruh wajib pajak", value: taxpayers.length },
					{ label: "Status aktif", value: taxpayers.filter((item) => item.status === "Aktif").length },
					{ label: "Hasil ditemukan", value: rows.length },
				]}
			/>

			<DataTableViewport label="Wajib pajak yang diwakili" minWidth="1120px" framed={false} headerTone="navy">
				<table>
					<thead><tr>
						{#if visibleColumns.npwp}<th scope="col">NPWP</th>{/if}
						{#if visibleColumns.name}<th scope="col">Nama Wajib Pajak</th>{/if}
						{#if visibleColumns.type}<th scope="col">Jenis Wajib Pajak</th>{/if}
						{#if visibleColumns.authority}<th scope="col">Lingkup Kewenangan</th>{/if}
						{#if visibleColumns.startDate}<th scope="col">Tanggal Mulai</th>{/if}
						{#if visibleColumns.status}<th scope="col">Status</th>{/if}
						<th scope="col">Aksi</th>
					</tr></thead>
					<tbody>
						{#each pagedRows as item}
							<tr>
								{#if visibleColumns.npwp}<td><code>{item.npwp}</code></td>{/if}
								{#if visibleColumns.name}<td><strong>{item.name}</strong></td>{/if}
								{#if visibleColumns.type}<td>{item.type}</td>{/if}
								{#if visibleColumns.authority}<td>{item.authority}</td>{/if}
								{#if visibleColumns.startDate}<td class="number">{item.startDate}</td>{/if}
								{#if visibleColumns.status}<td><StatusBadge label={item.status} tone="success" /></td>{/if}
								<td class="action-cell"><TableActions visibleCount={1} actions={[{ label: "Pilih", ariaLabel: `Pilih ${item.name}`, onclick: () => (notice = `${item.name} dipilih sebagai wajib pajak yang diwakili.`) }]} /></td>
							</tr>
						{:else}
							<tr><td class="empty" colspan={visibleColumnCount}><strong>Tidak ada wajib pajak yang ditemukan.</strong><br />Ubah filter atau ajukan akses perwakilan baru.</td></tr>
						{/each}
					</tbody>
				</table>
			</DataTableViewport>
			<PaginationBar bind:page bind:pageSize totalItems={rows.length} pageSizeOptions={[10, 25]} itemLabel="wajib pajak" />
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

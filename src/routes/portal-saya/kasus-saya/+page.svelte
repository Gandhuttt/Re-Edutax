<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		CollapsiblePanel,
		DataTableViewport,
		DateField,
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
		SummaryStrip,
	} from "$lib/re-ui-components";

	type Column = {
		key: string;
		label: string;
		type: "text" | "date" | "select";
		options?: readonly string[];
	};

	const columns: Column[] = [
		{ key: "number", label: "Nomor Kasus", type: "text" },
		{ key: "npwp", label: "NPWP Wajib Pajak Pusat", type: "text" },
		{ key: "name", label: "Nama Wajib Pajak Pusat", type: "text" },
		{ key: "type", label: "Jenis Kasus", type: "text" },
		{
			key: "status",
			label: "Status Kasus",
			type: "select",
			options: ["Dalam Proses", "Selesai", "Dibatalkan"],
		},
		{ key: "created", label: "Dibuat", type: "date" },
		{ key: "createdBy", label: "Dibuat Oleh Pengguna", type: "text" },
		{ key: "finished", label: "Selesai", type: "select", options: ["Ya", "Tidak"] },
		{ key: "workflow", label: "Langkah Alur Kerja", type: "text" },
		{ key: "dueDate", label: "Tanggal Jatuh Tempo Tertinggi", type: "date" },
		{ key: "endDate", label: "Tanggal Akhir", type: "date" },
		{ key: "region", label: "Kantor Wilayah", type: "select", options: [] },
		{ key: "office", label: "Kantor Pelayanan Pajak", type: "select", options: [] },
	];

	let filtersVisible = $state(true);
	let columnDialogOpen = $state(false);
	let filters = $state<Record<string, string>>({});
	let visibleColumns = $state<Record<string, boolean>>(
		Object.fromEntries(columns.map((column) => [column.key, true])),
	);
	let page = $state(1);
	let pageSize = $state(10);
	let notice = $state("");

	const activeColumns = $derived(columns.filter((column) => visibleColumns[column.key]));
	const activeFilterCount = $derived(Object.values(filters).filter(Boolean).length);

	function clearFilters() {
		filters = {};
		page = 1;
	}

	function reload() {
		clearFilters();
		notice = "Daftar kasus telah dimuat ulang dari data lokal.";
	}

	function restoreColumns() {
		for (const column of columns) visibleColumns[column.key] = true;
	}

	function exportCases() {
		const csv = columns.map((column) => `"${column.label.replaceAll('"', '""')}"`).join(",");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "kasus-saya.csv";
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Kasus Saya</title></svelte:head>

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={reload}>Muat Ulang</ActionButton>
		<ActionButton
			tone={filtersVisible ? "secondary" : "quiet"}
			aria-expanded={filtersVisible}
			aria-controls="case-filters"
			onclick={() => (filtersVisible = !filtersVisible)}
		>Filter</ActionButton>
		<ActionButton tone="quiet" onclick={() => (columnDialogOpen = true)}>Atur Kolom</ActionButton>
		<ActionButton tone="quiet" onclick={exportCases}>Ekspor CSV</ActionButton>
		<ActionButton tone="quiet" onclick={clearFilters}>Hapus Filter</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[{ label: "Portal Saya", href: "/" }, { label: "Kasus Saya" }]} />
	<PageHeading
		eyebrow="Portal Saya"
		title="Kasus Saya"
		description="Telusuri riwayat kasus administrasi perpajakan Anda."
	/>

	<Stack gap="18px">
		{#if notice}
			<InlineAlert
				tone="success"
				title="Informasi kasus"
				message={notice}
				dismissible
				ondismiss={() => (notice = "")}
			/>
		{/if}

		<FormSection title="Daftar Kasus" actions={tableTools} bordered padded={false}>
			<CollapsiblePanel open={filtersVisible} id="case-filters" label="Filter kasus">
				<ResponsiveGrid columns={4} gap="16px">
					{#each columns as column}
						{#if column.type === "select"}
							<SelectField
								label={column.label}
								value={filters[column.key] ?? ""}
								options={[
									{ value: "", label: `Semua ${column.label.toLocaleLowerCase("id-ID")}` },
									...(column.options ?? []).map((option) => ({ value: option, label: option })),
								]}
								onchange={(value) => {
									filters[column.key] = String(value);
									page = 1;
								}}
							/>
						{:else if column.type === "date"}
							<DateField
								label={column.label}
								value={filters[column.key] ?? ""}
								onchange={(value) => {
									filters[column.key] = value;
									page = 1;
								}}
							/>
						{:else}
							<FormField
								label={column.label}
								value={filters[column.key] ?? ""}
								placeholder={`Cari ${column.label.toLocaleLowerCase("id-ID")}`}
								oninput={(event) => {
									filters[column.key] = event.currentTarget.value;
									page = 1;
								}}
							/>
						{/if}
					{/each}
				</ResponsiveGrid>
			</CollapsiblePanel>

			<SummaryStrip
				columns={3}
				items={[
					{ label: "Seluruh kasus", value: 0 },
					{ label: "Filter aktif", value: activeFilterCount },
					{ label: "Hasil ditemukan", value: 0 },
				]}
			/>

			<DataTableViewport label="Daftar kasus saya" minWidth="2100px" framed={false} headerTone="navy">
				<table>
					<thead>
						<tr>{#each activeColumns as column}<th scope="col">{column.label}</th>{/each}</tr>
					</thead>
					<tbody>
						<tr><td class="empty" colspan={Math.max(1, activeColumns.length)}>Tidak ada data yang ditemukan.</td></tr>
					</tbody>
				</table>
			</DataTableViewport>
			<PaginationBar bind:page bind:pageSize totalItems={0} itemLabel="kasus" />
		</FormSection>
	</Stack>
</PageLayout>

<InstitutionalModal bind:open={columnDialogOpen} eyebrow="PREFERENSI TABEL" title="Atur Kolom" size="wide">
	<ResponsiveGrid columns={2} gap="9px 14px">
		{#each columns as column}
			<CheckboxField
				label={column.label}
				checked={visibleColumns[column.key]}
				compact
				onchange={(event) => (visibleColumns[column.key] = event.currentTarget.checked)}
			/>
		{/each}
	</ResponsiveGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={restoreColumns}>Tampilkan Semua</ActionButton>
		<ActionButton onclick={() => (columnDialogOpen = false)}>Selesai</ActionButton>
	{/snippet}
</InstitutionalModal>

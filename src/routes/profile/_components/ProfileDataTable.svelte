<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CollapsiblePanel,
		DataTableViewport,
		FormField,
		FormSection,
		PageHeading,
		PageLayout,
		PaginationBar,
		Stack,
		SummaryStrip,
		TabbedSection,
	} from "$lib/re-ui-components";

	type DataSet = { label?: string; columns: string[]; rows: string[][] };
	type Props = { title: string; data?: DataSet; tabs?: DataSet[]; history?: DataSet };

	let { title, data, tabs = [], history }: Props = $props();
	let activeTab = $state("");
	let view = $state<"Tabel" | "Kartu">("Tabel");
	let filterOpen = $state(false);
	let query = $state("");
	let pageSize = $state(10);
	let page = $state(1);

	const selectedTab = $derived(activeTab || tabs[0]?.label || "");
	const current = $derived(
		tabs.find((tab) => tab.label === selectedTab) ?? data ?? { columns: [], rows: [] },
	);
	const normalizedQuery = $derived(query.trim().toLocaleLowerCase("id-ID"));
	const filteredRows = $derived(
		current.rows.filter(
			(row) =>
				!normalizedQuery ||
				row.some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)),
		),
	);
	const visibleRows = $derived(
		filteredRows.slice((page - 1) * pageSize, page * pageSize),
	);
	const tableMinWidth = $derived(`${Math.max(760, current.columns.length * 150)}px`);
	const historyMinWidth = $derived(
		`${Math.max(760, (history?.columns.length ?? 0) * 150)}px`,
	);

	function resetPage() {
		page = 1;
	}

	function selectTab(nextTab: string) {
		activeTab = nextTab;
		query = "";
		resetPage();
	}

	function exportRows() {
		const csv = [current.columns, ...filteredRows]
			.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `${title.toLocaleLowerCase("id-ID").replaceAll(/[^a-z0-9]+/g, "-")}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
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
			aria-controls="profile-table-filter"
			onclick={() => (filterOpen = !filterOpen)}>Filter</ActionButton
		>
		<ActionButton tone="quiet">Atur Kolom</ActionButton>
		<ActionButton tone="quiet" onclick={exportRows}>Export</ActionButton>
	</Stack>
{/snippet}

{#snippet dataView()}
	<SummaryStrip
		columns={3}
		items={[
			{ label: "Seluruh data", value: current.rows.length },
			{ label: "Hasil ditemukan", value: filteredRows.length },
			{ label: "Halaman aktif", value: page },
		]}
	/>

	{#if view === "Kartu"}
		<div class="card-grid" aria-label={`Daftar kartu ${title}`}>
			{#each visibleRows as row}
				<article>
					{#each current.columns as column, index}
						<div><span>{column}</span><strong>{row[index] ?? "-"}</strong></div>
					{/each}
				</article>
			{:else}
				<p class="empty-card">Tidak ada data.</p>
			{/each}
		</div>
	{:else}
		<DataTableViewport
			label={`Daftar ${title}`}
			minWidth={tableMinWidth}
			framed={false}
			headerTone="navy"
			stickyFirstColumn
		>
			<table>
				<thead><tr>{#each current.columns as column}<th scope="col">{column}</th>{/each}</tr></thead>
				<tbody>
					{#each visibleRows as row}
						<tr>{#each current.columns as _, index}<td>{row[index] ?? "-"}</td>{/each}</tr>
					{:else}
						<tr><td class="empty" colspan={current.columns.length || 1}>Tidak ada data.</td></tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>
	{/if}

	<PaginationBar bind:page bind:pageSize totalItems={filteredRows.length} itemLabel="data" />
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Profil Saya", href: "/profile" },
			{ label: title },
		]}
	/>

	<PageHeading
		eyebrow="Profil Saya"
		{title}
		description="Lihat dan telusuri data profil yang tercatat pada akun wajib pajak."
	/>

	<Stack gap="18px">
		<FormSection title={`Daftar ${title}`} actions={tableTools} bordered padded={false}>
			<CollapsiblePanel open={filterOpen} id="profile-table-filter" label={`Filter ${title}`}>
				<div class="filter-field">
					<FormField
						label="Cari data"
						bind:value={query}
						placeholder="Masukkan kata kunci"
						oninput={resetPage}
					/>
				</div>
			</CollapsiblePanel>

			{#if tabs.length}
				<TabbedSection
					tabs={tabs.map((tab) => ({ label: tab.label ?? "Data" }))}
					active={selectedTab}
					ariaLabel={title}
					onchange={selectTab}
				>
					{#snippet children()}{@render dataView()}{/snippet}
				</TabbedSection>
			{:else}
				{@render dataView()}
			{/if}
		</FormSection>

		{#if history}
			<FormSection title={history.label ?? "Riwayat"} bordered padded={false}>
				<DataTableViewport
					label={history.label ?? `Riwayat ${title}`}
					minWidth={historyMinWidth}
					framed={false}
					headerTone="navy"
				>
					<table>
						<thead><tr>{#each history.columns as column}<th scope="col">{column}</th>{/each}</tr></thead>
						<tbody>
							{#each history.rows as row}
								<tr>{#each history.columns as _, index}<td>{row[index] ?? "-"}</td>{/each}</tr>
							{:else}
								<tr><td class="empty" colspan={history.columns.length || 1}>Tidak ada riwayat.</td></tr>
							{/each}
						</tbody>
					</table>
				</DataTableViewport>
			</FormSection>
		{/if}
	</Stack>
</PageLayout>

<style>
	.filter-field {
		max-width: 520px;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
		gap: 14px;
		padding: 20px;
		background: #fffefa;
	}

	.card-grid article {
		min-width: 0;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
		box-shadow: 0 3px 10px rgba(16, 36, 60, 0.06);
	}

	.card-grid article div {
		display: grid;
		grid-template-columns: minmax(120px, 40%) minmax(0, 1fr);
		border-bottom: 1px solid var(--ui-line);
	}

	.card-grid article div:last-child {
		border-bottom: 0;
	}

	.card-grid span,
	.card-grid strong {
		min-width: 0;
		padding: 10px 12px;
		overflow-wrap: anywhere;
	}

	.card-grid span {
		background: var(--ui-paper-deep);
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.card-grid strong {
		color: var(--ui-navy);
		font-size: 12px;
		font-weight: 700;
	}

	.empty-card {
		grid-column: 1 / -1;
		margin: 0;
		padding: 32px;
		color: var(--ui-muted);
		text-align: center;
	}

	@media (max-width: 520px) {
		.card-grid article div {
			grid-template-columns: 1fr;
		}
	}
</style>

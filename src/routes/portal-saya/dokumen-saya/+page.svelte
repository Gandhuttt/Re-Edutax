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
		TableActions,
	} from "$lib/re-ui-components";

	type DocumentRow = {
		number: string;
		documentDate: string;
		title: string;
		type: string;
		caseNumber: string;
		createdDate: string;
		createdBy: string;
	};

	type ColumnKey = keyof DocumentRow;

	const columnOptions: { key: ColumnKey; label: string }[] = [
		{ key: "number", label: "Nomor dokumen" },
		{ key: "documentDate", label: "Tanggal dokumen" },
		{ key: "title", label: "Judul dokumen" },
		{ key: "type", label: "Jenis dokumen" },
		{ key: "caseNumber", label: "Nomor kasus" },
		{ key: "createdDate", label: "Tanggal pembuatan" },
		{ key: "createdBy", label: "Pengguna pembuatan" },
	];

	let documents = $state<DocumentRow[]>([
		{
			number: "DOC-PPN-2026-00021",
			documentDate: "26/08/2026",
			title: "Surat Tagihan Pajak Pertambahan Nilai",
			type: "Surat Tagihan Pajak Pertambahan Nilai",
			caseNumber: "CASE-2026-00148",
			createdDate: "26/08/2026",
			createdBy: "-",
		},
		{
			number: "DOC-PPN-2026-00020",
			documentDate: "26/08/2026",
			title: "Surat Tagihan Pajak Pertambahan Nilai",
			type: "Surat Tagihan Pajak Pertambahan Nilai",
			caseNumber: "CASE-2026-00147",
			createdDate: "26/08/2026",
			createdBy: "-",
		},
		{
			number: "",
			documentDate: "23/08/2026",
			title: "",
			type: "Dokumen Lain-Lain dari Wajib Pajak",
			caseNumber: "",
			createdDate: "23/08/2026",
			createdBy: "Wajib Pajak",
		},
		{
			number: "",
			documentDate: "23/08/2026",
			title: "Lampiran SPT Masa PPN",
			type: "Lampiran SPT Masa PPN",
			caseNumber: "",
			createdDate: "23/08/2026",
			createdBy: "Wajib Pajak",
		},
		{
			number: "BILL-2026-00042",
			documentDate: "11/08/2026",
			title: "BILLING_CODE",
			type: "Cetakan Kode Billing",
			caseNumber: "",
			createdDate: "11/08/2026",
			createdBy: "Wajib Pajak",
		},
		{
			number: "S-00491/TGR/2026",
			documentDate: "05/08/2026",
			title: "Surat Teguran",
			type: "Surat Teguran",
			caseNumber: "",
			createdDate: "05/08/2026",
			createdBy: "-",
		},
	]);

	let filterOpen = $state(false);
	let columnDialogOpen = $state(false);
	let generateDialogOpen = $state(false);
	let query = $state("");
	let typeFilter = $state<string | number>("");
	let creatorFilter = $state<string | number>("");
	let page = $state(1);
	let pageSize = $state(10);
	let uploadInput = $state<HTMLInputElement>();
	let uploadedFiles = $state<FileList>();
	let notice = $state("");
	let newDocumentTitle = $state("");
	let newDocumentType = $state<string | number>("Dokumen Lain-Lain dari Wajib Pajak");
	let newDocumentDate = $state("2026-09-11");
	let generationError = $state("");
	let visibleColumns = $state<Record<ColumnKey, boolean>>({
		number: true,
		documentDate: true,
		title: true,
		type: true,
		caseNumber: true,
		createdDate: true,
		createdBy: true,
	});
	const documentTypes = [
		"Surat Tagihan Pajak Pertambahan Nilai",
		"Dokumen Lain-Lain dari Wajib Pajak",
		"Lampiran SPT Masa PPN",
		"Cetakan Kode Billing",
		"Surat Teguran",
	];

	const filteredDocuments = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase("id-ID");
		return documents.filter((item) => {
			const matchesQuery =
				!needle ||
				Object.values(item).some((value) =>
					value.toLocaleLowerCase("id-ID").includes(needle),
				);
			const matchesType = !typeFilter || item.type === typeFilter;
			const matchesCreator = !creatorFilter || item.createdBy === creatorFilter;
			return matchesQuery && matchesType && matchesCreator;
		});
	});
	const pagedDocuments = $derived(
		filteredDocuments.slice((page - 1) * pageSize, page * pageSize),
	);
	const visibleColumnCount = $derived(
		1 + columnOptions.filter((column) => visibleColumns[column.key]).length,
	);

	function resetFilters() {
		query = "";
		typeFilter = "";
		creatorFilter = "";
		page = 1;
		notice = "Tampilan dokumen telah dimuat ulang.";
	}

	function restoreColumns() {
		for (const column of columnOptions) visibleColumns[column.key] = true;
	}

	function exportDocuments() {
		const headings = columnOptions.map((column) => column.label);
		const rows = filteredDocuments.map((item) =>
			columnOptions.map((column) => item[column.key]),
		);
		const csv = [headings, ...rows]
			.map((row) =>
				row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
			)
			.join("\n");
		downloadBlob("dokumen-saya.csv", csv, "text/csv;charset=utf-8");
	}

	function downloadDocument(item: DocumentRow) {
		const content = columnOptions
			.map((column) => `${column.label}: ${item[column.key] || "-"}`)
			.join("\n");
		const filename = `${(item.number || item.title || "dokumen").replaceAll("/", "-")}.txt`;
		downloadBlob(filename, content, "text/plain;charset=utf-8");
	}

	function downloadBlob(filename: string, content: string, type: string) {
		const url = URL.createObjectURL(new Blob([content], { type }));
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	function handleUpload() {
		const file = uploadedFiles?.[0];
		if (file) notice = `${file.name} siap diproses sebagai dokumen baru.`;
	}

	function formatDisplayDate(value: string) {
		const [year, month, day] = value.split("-");
		return year && month && day ? `${day}/${month}/${year}` : value;
	}

	function generateDocument() {
		if (!newDocumentTitle.trim()) {
			generationError = "Judul dokumen wajib diisi.";
			return;
		}

		const displayDate = formatDisplayDate(newDocumentDate);
		const number = `DOC-DEMO-2026-${String(documents.length + 1).padStart(5, "0")}`;
		documents.unshift({
			number,
			documentDate: displayDate,
			title: newDocumentTitle.trim(),
			type: String(newDocumentType),
			caseNumber: "",
			createdDate: displayDate,
			createdBy: "Wajib Pajak",
		});
		newDocumentTitle = "";
		generationError = "";
		generateDialogOpen = false;
		page = 1;
		notice = `${number} berhasil dibuat pada spesimen lokal.`;
	}
</script>

<svelte:head><title>Dokumen Saya</title></svelte:head>

{#snippet pageActions()}
	<ActionButton tone="secondary" onclick={() => (generateDialogOpen = true)}>
		Hasilkan Dokumen
	</ActionButton>
	<ActionButton onclick={() => uploadInput?.click()}>Unggah Dokumen</ActionButton>
{/snippet}

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={resetFilters}>Muat Ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="document-filters"
			onclick={() => (filterOpen = !filterOpen)}
		>Filter</ActionButton>
		<ActionButton tone="quiet" onclick={() => (columnDialogOpen = true)}>
			Atur Kolom
		</ActionButton>
		<ActionButton tone="quiet" onclick={exportDocuments}>Ekspor CSV</ActionButton>
	</Stack>
{/snippet}

<input
		bind:this={uploadInput}
		bind:files={uploadedFiles}
		type="file"
		hidden
		onchange={handleUpload}
	/>

<PageLayout contentWidth="1500px">
		<Breadcrumbs
			items={[
				{ label: "Portal Saya", href: "/" },
				{ label: "Dokumen Saya" },
			]}
		/>

		<PageHeading eyebrow="Portal Saya" title="Dokumen Saya" actions={pageActions} />

		<Stack gap="18px">
			{#if notice}
				<InlineAlert
					tone="success"
					title="Informasi dokumen"
					message={notice}
					dismissible
					ondismiss={() => (notice = "")}
				/>
			{/if}

			<FormSection title="Daftar Dokumen" actions={tableTools} bordered padded={false}>
				<CollapsiblePanel open={filterOpen} id="document-filters" label="Filter dokumen">
					<ResponsiveGrid columns={3} gap="16px">
						<FormField
							label="Cari dokumen"
							bind:value={query}
							placeholder="Nomor, judul, jenis, atau kasus"
							oninput={() => (page = 1)}
						/>
						<SelectField
							label="Jenis dokumen"
							value={typeFilter}
							options={[
								{ value: "", label: "Semua jenis" },
								...documentTypes.map((type) => ({ value: type, label: type })),
							]}
							searchable
							onchange={(value) => {
								typeFilter = value;
								page = 1;
							}}
						/>
						<SelectField
							label="Pengguna pembuatan"
							value={creatorFilter}
							options={[
								{ value: "", label: "Semua pengguna" },
								{ value: "Wajib Pajak", label: "Wajib Pajak" },
								{ value: "-", label: "Sistem" },
							]}
							onchange={(value) => {
								creatorFilter = value;
								page = 1;
							}}
						/>
					</ResponsiveGrid>
				</CollapsiblePanel>

				<SummaryStrip
					columns={3}
					items={[
						{ label: "Seluruh dokumen", value: documents.length },
						{ label: "Hasil ditemukan", value: filteredDocuments.length },
						{ label: "Halaman aktif", value: page },
					]}
				/>

				<DataTableViewport
					label="Daftar dokumen saya"
					minWidth="1240px"
					framed={false}
					headerTone="navy"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th scope="col">Aksi</th>
								{#if visibleColumns.number}<th scope="col">Nomor Dokumen</th>{/if}
								{#if visibleColumns.documentDate}<th scope="col">Tanggal Dokumen</th>{/if}
								{#if visibleColumns.title}<th scope="col">Judul Dokumen</th>{/if}
								{#if visibleColumns.type}<th scope="col">Jenis Dokumen</th>{/if}
								{#if visibleColumns.caseNumber}<th scope="col">Nomor Kasus</th>{/if}
								{#if visibleColumns.createdDate}<th scope="col">Tanggal Pembuatan</th>{/if}
								{#if visibleColumns.createdBy}<th scope="col">Pengguna Pembuatan</th>{/if}
							</tr>
						</thead>
						<tbody>
							{#each pagedDocuments as item}
								<tr>
									<td class="action-cell">
										<TableActions
											visibleCount={1}
											actions={[
												{
													label: "Unduh",
													ariaLabel: `Unduh ${item.number || item.title || item.type}`,
													onclick: () => downloadDocument(item),
												},
											]}
										/>
									</td>
									{#if visibleColumns.number}<td><code>{item.number || "—"}</code></td>{/if}
									{#if visibleColumns.documentDate}<td class="number">{item.documentDate}</td>{/if}
									{#if visibleColumns.title}<td><strong>{item.title || "—"}</strong></td>{/if}
									{#if visibleColumns.type}<td>{item.type}</td>{/if}
									{#if visibleColumns.caseNumber}<td><code>{item.caseNumber || "—"}</code></td>{/if}
									{#if visibleColumns.createdDate}<td class="number">{item.createdDate}</td>{/if}
									{#if visibleColumns.createdBy}<td>{item.createdBy}</td>{/if}
								</tr>
							{:else}
								<tr><td class="empty" colspan={visibleColumnCount}>Tidak ada dokumen yang sesuai.</td></tr>
							{/each}
						</tbody>
					</table>
				</DataTableViewport>

				<PaginationBar
					bind:page
					bind:pageSize
					totalItems={filteredDocuments.length}
					itemLabel="dokumen"
				/>
			</FormSection>
		</Stack>
</PageLayout>

<InstitutionalModal
		bind:open={columnDialogOpen}
		eyebrow="PREFERENSI TABEL"
		title="Atur Kolom"
		size="wide"
	>
		<ResponsiveGrid columns={2} gap="9px 14px">
			{#each columnOptions as column}
				<CheckboxField
					label={column.label}
					checked={visibleColumns[column.key]}
					compact
					onchange={(event) =>
						(visibleColumns[column.key] = event.currentTarget.checked)}
				/>
			{/each}
		</ResponsiveGrid>
		{#snippet actions()}
			<ActionButton tone="quiet" onclick={restoreColumns}>Tampilkan Semua</ActionButton>
			<ActionButton onclick={() => (columnDialogOpen = false)}>Selesai</ActionButton>
		{/snippet}
</InstitutionalModal>

<InstitutionalModal
		bind:open={generateDialogOpen}
		eyebrow="DOKUMEN BARU"
		title="Hasilkan Dokumen"
		size="wide"
	>
		<Stack gap="17px">
			<FormField
				label="Judul dokumen"
				bind:value={newDocumentTitle}
				error={generationError}
				required
				oninput={() => (generationError = "")}
			/>
			<SelectField
				label="Jenis dokumen"
				bind:value={newDocumentType}
				options={documentTypes.map((type) => ({ value: type, label: type }))}
				searchable
			/>
			<DateField label="Tanggal dokumen" bind:value={newDocumentDate} required />
		</Stack>
		{#snippet actions()}
			<ActionButton tone="quiet" onclick={() => (generateDialogOpen = false)}>Batal</ActionButton>
			<ActionButton onclick={generateDocument}>Hasilkan</ActionButton>
		{/snippet}
</InstitutionalModal>

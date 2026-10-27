<script module lang="ts">
	import type { Snippet } from "svelte";

	export type BpListKind = "bp21" | "bp26" | "bpa1" | "bpa2" | "mp";
	export type BpListAction = "delete" | "issue" | "cancel" | "amend";
	export type BpListStatus =
		| "NORMAL"
		| "SAVEDINVALID"
		| "SUBMITTED"
		| "AMENDMENT"
		| "AMENDED"
		| "CANCELLED"
		| "DELETED";

	export type BpListRow = {
		id: string;
		/** Masa Pajak (period end for BPA1/BPA2, which span Awal..Akhir). */
		masaPajak: number;
		tahun: number;
		/** Period start; only BPA1/BPA2 rows carry it. */
		masaPajakAwal?: number;
		tahunAwal?: number;
		status: BpListStatus;
		nomorIdentitasWp: string;
		nama: string;
		namaObjekPajak: string | null;
		pajakPenghasilan: number;
		diterbitkan: boolean;
		nomorPemotongan: string | null;
		pembetulanDariId: string | null;
		pembetulanKe: number;
		replacedById: string | null;
	};

	export type BpListWorkspaceProps = {
		kind: BpListKind;
		rows: readonly BpListRow[];
		accountName: string;
		accountNpwp: string;
		/** Runs an all-or-none lifecycle action; throws on failure. Returns created draft ids for `amend`. */
		onmutate: (action: BpListAction, ids: string[]) => Promise<{ createdIds?: string[] } | void>;
		/** Rendered in the primary action slot (e.g. the "Buat" remote form). */
		createAction: Snippet;
	};
</script>

<script lang="ts">
	import { goto } from "$app/navigation";
	import { SvelteSet } from "svelte/reactivity";
	import { formatMonth } from "$lib/helpers/date";
	import { importBp } from "../../routes/ebupot/impor/importBp.remote";
	import Breadcrumbs from "./Breadcrumbs.svelte";
	import ActionButton from "./ActionButton.svelte";
	import CheckboxField from "./CheckboxField.svelte";
	import ActionMenu, { type ActionMenuItem } from "./ActionMenu.svelte";
	import DataTableBody from "./DataTableBody.svelte";
	import DataTableViewport from "./DataTableViewport.svelte";
	import DataWorkspace from "./DataWorkspace.svelte";
	import InlineAlert from "./InlineAlert.svelte";
	import InstitutionalModal from "./InstitutionalModal.svelte";
	import PageLayout from "./PageLayout.svelte";
	import PaginationBar from "./PaginationBar.svelte";
	import SelectField from "./SelectField.svelte";
	import ServiceWorkspace from "./ServiceWorkspace.svelte";
	import Stack from "./Stack.svelte";
	import StatusBadge from "./StatusBadge.svelte";
	import TableFilterField from "./TableFilterField.svelte";
	import TableActions, { type TableAction } from "./TableActions.svelte";
	import TabbedSection from "./TabbedSection.svelte";

	let { kind, rows, accountName, accountNpwp, onmutate, createAction }: BpListWorkspaceProps = $props();
	let importFileInput = $state<HTMLInputElement>();
	const importFormId = $props.id();
	const importIssues = $derived(importBp.fields.allIssues() ?? []);

	function submitImport(event: Event) {
		(event.currentTarget as HTMLInputElement).form?.requestSubmit();
	}

	// Mirrors MAX_BP_BULK in $lib/server/ebupot/lifecycle (D1 bound-parameter limit).
	const MAX_BULK = 50;
	const label = $derived(kind.toUpperCase());
	const isBpa = $derived(kind === "bpa1" || kind === "bpa2");
	const periodeText = (row: BpListRow) =>
		row.masaPajakAwal !== undefined && row.tahunAwal !== undefined
			? `${formatMonth(row.masaPajakAwal)} ${row.tahunAwal} - ${formatMonth(row.masaPajak)} ${row.tahun}`
			: `${formatMonth(row.masaPajak)} ${row.tahun}`;
	const tabs = ["Belum Terbit", "Telah Terbit", "Tidak Valid", "Histori"] as const;
	type Tab = (typeof tabs)[number];

	const statusLabel: Record<BpListStatus, string> = {
		NORMAL: "Normal",
		SAVEDINVALID: "Disimpan Tidak Valid",
		SUBMITTED: "Disimpan",
		AMENDMENT: "Konsep Pembetulan",
		AMENDED: "Telah Dibetulkan",
		CANCELLED: "Dibatalkan",
		DELETED: "Dihapus"
	};
	const historyStatuses: BpListStatus[] = ["AMENDED", "CANCELLED"];
	const activeIssued: BpListStatus[] = ["NORMAL", "SUBMITTED", "AMENDMENT"];
	const rupiah = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 });

	const inTab = (row: BpListRow, tab: Tab) => {
		if (row.status === "DELETED") return tab === "Tidak Valid";
		if (historyStatuses.includes(row.status)) return tab === "Histori";
		if (row.diterbitkan) return tab === "Telah Terbit";
		if (row.status === "SAVEDINVALID") return tab === "Tidak Valid";
		return tab === "Belum Terbit";
	};

	let activeTab = $state<Tab>("Belum Terbit");
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let filterPeriode = $state("");
	let filterTin = $state("");
	let filterNama = $state("");
	let filterObjek = $state("");
	let filterNomor = $state("");
	let filterStatus = $state("");
	const selected = new SvelteSet<string>();
	let confirmOpen = $state(false);
	let pending = $state<{ action: BpListAction; ids: string[] } | null>(null);
	let busy = $state(false);
	let errorMessage = $state("");

	const tabRows = $derived(rows.filter((row) => inTab(row, activeTab)));
	const periodeOptions = $derived([
		{ value: "", label: "Semua masa" },
		...[...new Set(tabRows.map((row) => row.tahun * 100 + row.masaPajak))]
			.sort((a, b) => b - a)
			.map((key) => ({ value: String(key), label: `${formatMonth(key % 100)} ${Math.floor(key / 100)}` }))
	]);
	const statusOptions = $derived([
		{ value: "", label: "Semua status" },
		...[...new Set(tabRows.map((row) => row.status))].map((status) => ({
			value: status,
			label: statusLabel[status]
		}))
	]);
	const contains = (value: string | null | undefined, needle: string) =>
		!needle.trim() || (value ?? "").toLocaleLowerCase("id-ID").includes(needle.trim().toLocaleLowerCase("id-ID"));
	const filteredRows = $derived(
		tabRows.filter(
			(row) =>
				(!filterPeriode || String(row.tahun * 100 + row.masaPajak) === filterPeriode) &&
				contains(row.nomorIdentitasWp, filterTin) &&
				contains(row.nama, filterNama) &&
				contains(row.namaObjekPajak, filterObjek) &&
				contains(row.nomorPemotongan, filterNomor) &&
				(!filterStatus || row.status === filterStatus)
		)
	);
	const pageCount = $derived(Math.max(1, Math.ceil(filteredRows.length / pageSize)));
	const pagedRows = $derived(filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	const selectedRows = $derived(filteredRows.filter((row) => selected.has(row.id)));
	const allFilteredSelected = $derived(
		filteredRows.length > 0 && selectedRows.length === filteredRows.length
	);

	// Tab change: reset page and filters. Filter/data change: clamp page and drop
	// selections that are no longer visible so a hidden selection can never be acted on.
	$effect(() => {
		activeTab;
		currentPage = 1;
		filterPeriode = "";
		filterTin = "";
		filterNama = "";
		filterObjek = "";
		filterNomor = "";
		filterStatus = "";
		errorMessage = "";
	});
	$effect(() => {
		if (currentPage > pageCount) currentPage = pageCount;
		const visible = new Set(filteredRows.map((row) => row.id));
		for (const id of [...selected]) if (!visible.has(id)) selected.delete(id);
	});

	const canIssue = (row: BpListRow) => !row.diterbitkan && row.status === "SUBMITTED";
	const canDelete = (row: BpListRow) =>
		!row.diterbitkan && ["NORMAL", "SAVEDINVALID", "SUBMITTED", "AMENDMENT"].includes(row.status);
	const canIssued = (row: BpListRow) => row.diterbitkan && activeIssued.includes(row.status);
	const eligible: Record<BpListAction, (row: BpListRow) => boolean> = {
		issue: canIssue,
		delete: canDelete,
		cancel: canIssued,
		amend: canIssued
	};
	const actionText: Record<BpListAction, { button: string; verb: string; danger: boolean }> = {
		issue: { button: "Terbitkan", verb: "menerbitkan", danger: false },
		delete: { button: "Hapus", verb: "menghapus", danger: true },
		cancel: { button: "Batalkan", verb: "membatalkan", danger: true },
		amend: { button: "Buat Pembetulan", verb: "membuat pembetulan dari", danger: false }
	};
	const bulkActions = $derived(
		(["issue", "delete", "cancel", "amend"] as BpListAction[]).filter((action) =>
			filteredRows.some(eligible[action])
		)
	);

	function bulkBlocker(action: BpListAction) {
		if (selectedRows.length === 0) return "Pilih baris terlebih dahulu.";
		if (selectedRows.length > MAX_BULK) return `Maksimal ${MAX_BULK} baris per aksi.`;
		const bad = selectedRows.filter((row) => !eligible[action](row)).length;
		return bad > 0 ? `${bad} baris terpilih tidak dapat di-${actionText[action].button.toLowerCase()}.` : "";
	}

	function ask(action: BpListAction, ids: string[]) {
		errorMessage = "";
		pending = { action, ids };
		confirmOpen = true;
	}

	async function confirmAction() {
		if (!pending || busy) return;
		busy = true;
		errorMessage = "";
		try {
			const result = await onmutate(pending.action, pending.ids);
			selected.clear();
			confirmOpen = false;
			const created = result && "createdIds" in result ? result.createdIds : undefined;
			pending = null;
			if (created?.length === 1) await goto(`/ebupot/${kind}/${created[0]}`);
		} catch (cause) {
			const body = (cause as { body?: { message?: string } })?.body;
			errorMessage = body?.message ?? (cause instanceof Error ? cause.message : "Aksi gagal. Tidak ada perubahan disimpan.");
			confirmOpen = false;
			pending = null;
		} finally {
			busy = false;
		}
	}

	function toggleAll(checked: boolean) {
		selected.clear();
		if (checked) for (const row of filteredRows) selected.add(row.id);
	}

	function rowActions(row: BpListRow) {
		const open = { label: "Buka", href: `/ebupot/${kind}/${row.id}` };
		const acts: TableAction[] = [open];
		if (canIssue(row)) acts.push({ label: "Terbitkan", onclick: () => ask("issue", [row.id]) });
		if (canIssued(row)) {
			acts.push({ label: "Buat Pembetulan", onclick: () => ask("amend", [row.id]) });
			acts.push({ label: "Batalkan", danger: true, onclick: () => ask("cancel", [row.id]) });
		}
		if (canDelete(row)) acts.push({ label: "Hapus", danger: true, onclick: () => ask("delete", [row.id]) });
		return acts;
	}

	function badge(row: BpListRow): { label: string; tone: "neutral" | "attention" | "success" | "error" } {
		if (row.status === "CANCELLED" || row.status === "DELETED" || row.status === "SAVEDINVALID")
			return { label: statusLabel[row.status], tone: "error" };
		if (row.status === "AMENDED") return { label: statusLabel.AMENDED, tone: "neutral" };
		if (row.diterbitkan) return { label: "Telah Terbit", tone: "success" };
		return { label: statusLabel[row.status], tone: row.status === "SUBMITTED" ? "neutral" : "attention" };
	}

	const exportBase = $derived(`/ebupot/ekspor?jenis=${kind}`);
	const selectedIdsParam = $derived(selectedRows.map((row) => row.id).join(","));
	const exportBlocker = $derived(
		selectedRows.length === 0
			? "Pilih baris untuk diekspor."
			: selectedRows.length > MAX_BULK
				? `Maksimal ${MAX_BULK} baris per ekspor.`
				: ""
	);
	const exportUrl = (format: "csv" | "xlsx" | "print") => `${exportBase}&format=${format}&ids=${selectedIdsParam}`;
	const exportItems: ActionMenuItem[] = [
		{ label: "CSV", description: "Unduh berkas .csv", onclick: () => { window.location.href = exportUrl("csv"); } },
		{ label: "Excel", description: "Unduh berkas .xlsx", onclick: () => { window.location.href = exportUrl("xlsx"); } },
		{ label: "Cetak / Simpan PDF", description: "Buka tampilan cetak di tab baru", onclick: () => { window.open(exportUrl("print"), "_blank", "noopener"); } }
	];
</script>

<form {...importBp} id={importFormId} enctype="multipart/form-data" hidden>
	<input type="hidden" name="jenis" value={kind} />
	<input type="file" name="file" accept=".xml" bind:this={importFileInput} onchange={submitImport} />
</form>

{#snippet headerActions()}
	<div class="header-actions">
		<ActionMenu
			label={importBp.pending > 0 ? "Mengimpor..." : "Impor Data"}
			tone="quiet"
			disabled={importBp.pending > 0}
			items={[
				{ label: "Pilih File", onclick: () => { if (importFileInput) { importFileInput.value = ""; importFileInput.click(); } } },
				{ label: "Unduh Format XML", onclick: () => { window.location.href = kind === "mp" ? "/ebupot/impor/template/mp" : `https://pajak.go.id/sites/default/files/2024-12/${kind}.zip`; } }
			]}
		/>
		{@render createAction()}
	</div>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[{ label: "Beranda", href: "/dashboard" }, { label: "e-Bupot" }, { label }]}
		/>
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{ eyebrow: "Wajib Pajak", name: accountName, identifier: accountNpwp, mark: "EB" }}
			groups={[
				{
					label: "e-Bupot",
					links: [
						{ label: "Bukti Potong Saya", href: "/ebupot/bukti-potong-saya" },
						{ label: "BPPU", href: "/ebupot/bpu" },
						{ label: "BP21", href: "/ebupot/bp21", active: kind === "bp21" },
						{ label: "BP26", href: "/ebupot/bp26", active: kind === "bp26" },
						{ label: "BPA1", href: "/ebupot/bpa1", active: kind === "bpa1" },
						{ label: "BPA2", href: "/ebupot/bpa2", active: kind === "bpa2" },
						{ label: "Bukti Pemotongan Bulanan Pegawai Tetap", href: "/ebupot/mp", active: kind === "mp" }
					]
				}
			]}
		>
			<DataWorkspace title={`${label} ${activeTab}`} primaryActions={activeTab === "Belum Terbit" ? headerActions : undefined}>
				{#if importIssues.length > 0}
					<div class="bp-error"><InlineAlert tone="error" title="Impor dibatalkan" message={importIssues.map((issue) => issue.message).join(" ")} /></div>
				{/if}
				{#if importBp.result}
					<div class="bp-error"><InlineAlert tone="success" title="Impor berhasil" message={importBp.result.message} /></div>
				{/if}
				{#if errorMessage}
					<div class="bp-error">
						<InlineAlert tone="error" title="Aksi tidak dijalankan" message={errorMessage} dismissible ondismiss={() => (errorMessage = "")} />
					</div>
				{/if}
				<TabbedSection {tabs} active={activeTab} onchange={(value) => (activeTab = value as Tab)} ariaLabel={`Status ${label}`} panelLabel={`Daftar ${label}`}>
					{#snippet children()}
						<div class="bp-bulk" aria-live="polite">
							<span>
								{selectedRows.length} dari {filteredRows.length} baris terpilih
							</span>
							{#each bulkActions as action (action)}
								{@const blocker = bulkBlocker(action)}
								<ActionButton
									type="button"
									tone={actionText[action].danger ? "danger" : "secondary"}
									disabled={blocker !== "" || busy}
									title={blocker || `${actionText[action].button} ${selectedRows.length} baris`}
									onclick={() => ask(action, selectedRows.map((row) => row.id))}
								>{actionText[action].button} Terpilih</ActionButton>
							{/each}
							{#if selectedRows.length > 0}
								<ActionButton type="button" tone="quiet" onclick={() => selected.clear()}>Kosongkan Pilihan</ActionButton>
							{/if}
							<span class="bp-export">
								<ActionMenu label={selectedRows.length > 0 ? `Ekspor (${selectedRows.length})` : "Ekspor"} tone="quiet" align="end" disabled={exportBlocker !== ""} items={exportItems} />
							</span>
						</div>
						<DataTableViewport class="bp-table" label={`Daftar ${label} ${activeTab}`} minWidth="1520px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table>
								<thead>
									<tr>
										<th style="width: 40px">
											<CheckboxField
												label={`Pilih semua ${filteredRows.length} baris hasil filter`}
												labelHidden
												compact
												title="Pilih semua baris hasil filter (semua halaman)"
												checked={allFilteredSelected}
												disabled={filteredRows.length === 0}
												onchange={(event) => toggleAll((event.currentTarget as HTMLInputElement).checked)}
											/>
										</th>
										<th style="width: 190px">Aksi</th>
										<th style={`width: ${isBpa ? 260 : 170}px`}>{isBpa ? "Masa Pajak Awal - Akhir" : "Masa Pajak"}</th>
										<th style="width: 190px">Nomor Identitas WP</th>
										<th style="width: 200px">Nama</th>
										<th style="width: 260px">Objek Pajak</th>
										<th class="right" style="width: 190px">{isBpa ? "PPh Pasal 21 Terutang (Rp)" : "Pajak Penghasilan (Rp)"}</th>
										<th style="width: 220px">Nomor Pemotongan</th>
										<th style="width: 180px">Status</th>
										{#if activeTab === "Histori" || activeTab === "Telah Terbit"}<th style="width: 160px">Pembetulan</th>{/if}
									</tr>
									<tr>
										<th><span class="visually-hidden">Filter tabel</span></th>
										<th></th>
										<th><SelectField label="Filter masa pajak" labelHidden bind:value={filterPeriode} options={periodeOptions} /></th>
										<th><TableFilterField label="Filter nomor identitas WP" placeholder="Cari NPWP/NIK" bind:value={filterTin} /></th>
										<th><TableFilterField label="Filter nama" placeholder="Cari nama" bind:value={filterNama} /></th>
										<th><TableFilterField label="Filter objek pajak" placeholder="Cari objek" bind:value={filterObjek} /></th>
										<th></th>
										<th><TableFilterField label="Filter nomor pemotongan" placeholder="Cari nomor" bind:value={filterNomor} /></th>
										<th><SelectField label="Filter status" labelHidden bind:value={filterStatus} options={statusOptions} /></th>
										{#if activeTab === "Histori" || activeTab === "Telah Terbit"}<th></th>{/if}
									</tr>
								</thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={10} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const status = badge(row)}
										<td>
											<CheckboxField
												label={`Pilih ${row.nama || row.nomorIdentitasWp || "baris"}`}
												labelHidden
												compact
												checked={selected.has(row.id)}
												onchange={(event) => ((event.currentTarget as HTMLInputElement).checked ? selected.add(row.id) : selected.delete(row.id))}
											/>
										</td>
										<td class="action-cell"><TableActions visibleCount={3} actions={rowActions(row)} /></td>
										<td>{periodeText(row)}</td>
										<td>{row.nomorIdentitasWp || "—"}</td>
										<td><strong>{row.nama || "—"}</strong></td>
										<td>{row.namaObjekPajak ?? "—"}</td>
										<td class="right amount">{rupiah.format(row.pajakPenghasilan)}</td>
										<td>{row.nomorPemotongan ?? "—"}</td>
										<td><StatusBadge label={status.label} tone={status.tone} /></td>
										{#if activeTab === "Histori" || activeTab === "Telah Terbit"}
											<td>
												{#if row.pembetulanKe > 0}Pembetulan ke-{row.pembetulanKe}{/if}
												{#if row.pembetulanDariId}
													<a href={`/ebupot/${kind}/${row.pembetulanDariId}`}>Asal</a>
												{/if}
												{#if row.replacedById}
													<a href={`/ebupot/${kind}/${row.replacedById}`}>Pengganti</a>
												{/if}
												{#if row.pembetulanKe === 0 && !row.pembetulanDariId && !row.replacedById}—{/if}
											</td>
										{/if}
									{/snippet}
								</DataTableBody>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={filteredRows.length} pageSizeOptions={[10, 25, 50, 100]} itemLabel={label} />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

<InstitutionalModal bind:open={confirmOpen} title={pending ? `${actionText[pending.action].button} ${label}` : "Konfirmasi"} onafterclose={() => { if (!busy) pending = null; }}>
	{#if pending}
		<p>
			Anda akan {actionText[pending.action].verb} <strong>{pending.ids.length}</strong> {label}.
			Semua dibatalkan jika salah satu tidak lagi memenuhi syarat (all-or-none).
		</p>
		{#if pending.action === "issue"}
			<p>Nomor yang dibuat berawalan SIM- dan bukan nomor resmi DJP. Pembetulan menandai bukti potong asal sebagai Telah Dibetulkan.</p>
		{:else if pending.action === "amend"}
			<p>Salinan bukti potong dibuat sebagai konsep pembetulan baru; bukti potong asal tetap berlaku sampai pembetulan diterbitkan.</p>
		{:else if pending.action === "cancel"}
			<p>Bukti potong yang dibatalkan tidak lagi dihitung sebagai bukti potong aktif.</p>
		{:else}
			<p>Konsep akan dipindahkan ke Tidak Valid sebagai Dihapus.</p>
		{/if}
	{/if}
	{#snippet actions()}
		<ActionButton type="button" tone="quiet" disabled={busy} onclick={() => (confirmOpen = false)}>Batal</ActionButton>
		<ActionButton
			type="button"
			tone={pending && actionText[pending.action].danger ? "danger" : "primary"}
			pending={busy}
			pendingLabel="Memproses..."
			onclick={confirmAction}
		>Ya, lanjutkan</ActionButton>
	{/snippet}
</InstitutionalModal>

<style>
	:global(.bp-table) {
		position: relative;
	}
	table td {
		white-space: nowrap;
	}
	table :global(.select-value) {
		white-space: nowrap;
		overflow-wrap: normal;
	}
	.bp-bulk {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
		margin-bottom: 12px;
	}
	.bp-export {
		margin-left: auto;
	}
	.bp-error {
		padding: 12px 18px 0;
	}
	.header-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>

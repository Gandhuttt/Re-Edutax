<script module lang="ts">
	import type { Snippet } from "svelte";

	export type BpListKind = "bp21" | "bp26";
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
		masaPajak: number;
		tahun: number;
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
	import Breadcrumbs from "./Breadcrumbs.svelte";
	import ActionButton from "./ActionButton.svelte";
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
	import TableActions, { type TableAction } from "./TableActions.svelte";
	import TabbedSection from "./TabbedSection.svelte";

	let { kind, rows, accountName, accountNpwp, onmutate, createAction }: BpListWorkspaceProps = $props();

	// Mirrors MAX_BP_BULK in $lib/server/ebupot/lifecycle (D1 bound-parameter limit).
	const MAX_BULK = 50;
	const label = $derived(kind === "bp21" ? "BP21" : "BP26");
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
	const historyStatuses: BpListStatus[] = ["AMENDED", "CANCELLED", "DELETED"];
	const activeIssued: BpListStatus[] = ["NORMAL", "SUBMITTED", "AMENDMENT"];
	const rupiah = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 });

	const inTab = (row: BpListRow, tab: Tab) => {
		if (historyStatuses.includes(row.status)) return tab === "Histori";
		if (row.diterbitkan) return tab === "Telah Terbit";
		if (row.status === "SAVEDINVALID") return tab === "Tidak Valid";
		return tab === "Belum Terbit";
	};

	let activeTab = $state<Tab>("Belum Terbit");
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let filterTahun = $state("");
	let filterMasa = $state("");
	let filterStatus = $state("");
	const selected = new SvelteSet<string>();
	let confirmOpen = $state(false);
	let pending = $state<{ action: BpListAction; ids: string[] } | null>(null);
	let busy = $state(false);
	let errorMessage = $state("");

	const tabRows = $derived(rows.filter((row) => inTab(row, activeTab)));
	const tahunOptions = $derived([
		{ value: "", label: "Semua tahun" },
		...[...new Set(tabRows.map((row) => row.tahun))]
			.sort((a, b) => b - a)
			.map((tahun) => ({ value: String(tahun), label: String(tahun) }))
	]);
	const masaOptions = $derived([
		{ value: "", label: "Semua masa" },
		...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: formatMonth(i + 1) }))
	]);
	const statusOptions = $derived([
		{ value: "", label: "Semua status" },
		...[...new Set(tabRows.map((row) => row.status))].map((status) => ({
			value: status,
			label: statusLabel[status]
		}))
	]);
	const filteredRows = $derived(
		tabRows.filter(
			(row) =>
				(!filterTahun || String(row.tahun) === filterTahun) &&
				(!filterMasa || String(row.masaPajak) === filterMasa) &&
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
		filterTahun = "";
		filterMasa = "";
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
		issue: { button: "Terbitkan", verb: "menerbitkan (simulasi)", danger: false },
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
		if (row.diterbitkan) return { label: "Telah Terbit (Simulasi)", tone: "success" };
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
</script>

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
						{ label: "BPA1", href: "/ebupot/bpa1" },
						{ label: "BPA2", href: "/ebupot/bpa2" },
						{ label: "Bukti Pemotongan Bulanan Pegawai Tetap", href: "/ebupot/mp" },
						{ label: "Referensi Lokal (Simulasi)", href: "/ebupot/referensi-lokal" }
					]
				}
			]}
		>
			<DataWorkspace title={`${label} ${activeTab}`} primaryActions={activeTab === "Belum Terbit" ? createAction : undefined}>
				<Stack gap="12px">
					<InlineAlert
						tone="info"
						compact
						title="Simulasi Pendidikan"
						message={`Penerbitan, nomor pemotongan, pembetulan dan pembatalan ${label} di sini adalah simulasi lokal (nomor SIM-${label}-…), bukan penerbitan atau verifikasi DJP/Coretax.`}
					/>
					{#if errorMessage}
						<InlineAlert tone="error" title="Aksi tidak dijalankan" message={errorMessage} dismissible ondismiss={() => (errorMessage = "")} />
					{/if}
					<nav class="bp-links" aria-label={`Tautan ${label}`}>
						<a href="/ebupot/referensi-lokal">Referensi Lokal</a>
						<a href={`/ebupot/impor?jenis=${kind}`}>Impor XML</a>
					</nav>
				</Stack>
				<TabbedSection {tabs} active={activeTab} onchange={(value) => (activeTab = value as Tab)} ariaLabel={`Status ${label}`} panelLabel={`Daftar ${label}`}>
					{#snippet children()}
						<div class="bp-filters">
							<SelectField label="Tahun" bind:value={filterTahun} options={tahunOptions} />
							<SelectField label="Masa Pajak" bind:value={filterMasa} options={masaOptions} />
							<SelectField label="Status" bind:value={filterStatus} options={statusOptions} />
						</div>
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
								Ekspor terpilih:
								{#if exportBlocker}
									<span title={exportBlocker}>CSV · Excel · Cetak / Simpan PDF ({exportBlocker})</span>
								{:else}
									<a href={`${exportBase}&format=csv&ids=${selectedIdsParam}`}>CSV</a>
									<a href={`${exportBase}&format=xlsx&ids=${selectedIdsParam}`}>Excel</a>
									<a href={`${exportBase}&format=print&ids=${selectedIdsParam}`} target="_blank" rel="noopener">Cetak / Simpan PDF</a>
								{/if}
							</span>
						</div>
						<DataTableViewport label={`Daftar ${label} ${activeTab}`} minWidth="1250px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table>
								<thead>
									<tr>
										<th style="width: 40px">
											<input
												type="checkbox"
												aria-label={`Pilih semua ${filteredRows.length} baris hasil filter`}
												title="Pilih semua baris hasil filter (semua halaman)"
												checked={allFilteredSelected}
												disabled={filteredRows.length === 0}
												onchange={(event) => toggleAll(event.currentTarget.checked)}
											/>
										</th>
										<th style="width: 190px">Aksi</th>
										<th>Masa Pajak</th>
										<th>Nomor Identitas WP</th>
										<th>Nama</th>
										<th>Objek Pajak</th>
										<th class="right">Pajak Penghasilan (Rp)</th>
										<th>Nomor Pemotongan</th>
										<th>Status</th>
										{#if activeTab === "Histori" || activeTab === "Telah Terbit"}<th>Pembetulan</th>{/if}
									</tr>
								</thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={10} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const status = badge(row)}
										<td>
											<input
												type="checkbox"
												aria-label={`Pilih ${row.nama || row.nomorIdentitasWp || "baris"}`}
												checked={selected.has(row.id)}
												onchange={(event) => (event.currentTarget.checked ? selected.add(row.id) : selected.delete(row.id))}
											/>
										</td>
										<td class="action-cell"><TableActions visibleCount={3} actions={rowActions(row)} /></td>
										<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
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
			<p>Konsep akan dipindahkan ke Histori sebagai Dihapus.</p>
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
	.bp-filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 220px));
		gap: 12px;
		margin-bottom: 12px;
	}
	.bp-bulk {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
		margin-bottom: 12px;
	}
	.bp-export {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-left: auto;
	}
	.bp-links {
		display: flex;
		gap: 16px;
	}
</style>

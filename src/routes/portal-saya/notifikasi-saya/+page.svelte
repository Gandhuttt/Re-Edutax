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
		Stack,
		StatusBadge,
		SummaryStrip,
		TabbedSection,
		TableActions,
	} from "$lib/re-ui-components";
	import { notificationData, type Notification } from "./notifications";

	type NotificationTab = "all" | "read" | "unread";
	type ColumnKey = "sender" | "subject" | "sentAt" | "priority";

	const columnOptions: { key: ColumnKey; label: string }[] = [
		{ key: "sender", label: "Pengirim" },
		{ key: "subject", label: "Subjek" },
		{ key: "sentAt", label: "Tanggal Terkirim" },
		{ key: "priority", label: "Prioritas" },
	];

	let notifications = $state<Notification[]>(notificationData.map((item) => ({ ...item })));
	let activeTab = $state<NotificationTab>("all");
	let filterOpen = $state(false);
	let columnDialogOpen = $state(false);
	let query = $state("");
	let page = $state(1);
	let pageSize = $state(10);
	let notice = $state("");
	let visibleColumns = $state<Record<ColumnKey, boolean>>({
		sender: true,
		subject: true,
		sentAt: true,
		priority: true,
	});

	const readCount = $derived(notifications.filter((item) => item.read).length);
	const unreadCount = $derived(notifications.length - readCount);
	const visibleNotifications = $derived.by(() => {
		const search = query.trim().toLocaleLowerCase("id-ID");
		return notifications.filter((item) => {
			const matchesTab = activeTab === "all" || (activeTab === "read" ? item.read : !item.read);
			const matchesSearch =
				!search ||
				item.sender.toLocaleLowerCase("id-ID").includes(search) ||
				item.subject.toLocaleLowerCase("id-ID").includes(search);
			return matchesTab && matchesSearch;
		});
	});
	const pagedNotifications = $derived(
		visibleNotifications.slice((page - 1) * pageSize, page * pageSize),
	);
	const visibleColumnCount = $derived(
		1 + columnOptions.filter((column) => visibleColumns[column.key]).length,
	);

	function markAllRead() {
		notifications = notifications.map((item) => ({ ...item, read: true }));
		notice = "Semua notifikasi telah ditandai sebagai telah dibaca pada sesi ini.";
	}

	function reloadNotifications() {
		notifications = notificationData.map((item) => ({ ...item }));
		query = "";
		page = 1;
		notice = "Kotak masuk telah dimuat ulang dari data lokal.";
	}

	function restoreColumns() {
		for (const column of columnOptions) visibleColumns[column.key] = true;
	}

	function exportNotifications() {
		const rows = visibleNotifications.map((item) => [item.sender, item.subject, item.sentAt, item.priority]);
		const csv = [["Pengirim", "Subjek", "Tanggal Terkirim", "Prioritas"], ...rows]
			.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
			.join("\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "notifikasi-saya.csv";
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Notifikasi Saya</title></svelte:head>

{#snippet inboxActions()}
	<ActionButton tone="secondary" onclick={markAllRead} disabled={unreadCount === 0}>
		Tandai Semua Telah Dibaca
	</ActionButton>
{/snippet}

{#snippet tableTools()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={reloadNotifications}>Muat Ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="notification-filters"
			onclick={() => (filterOpen = !filterOpen)}
		>Filter</ActionButton>
		<ActionButton tone="quiet" onclick={() => (columnDialogOpen = true)}>Atur Kolom</ActionButton>
		<ActionButton tone="quiet" onclick={exportNotifications}>Ekspor CSV</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[{ label: "Portal Saya", href: "/" }, { label: "Notifikasi Saya" }]} />
	<PageHeading
		eyebrow="Portal Saya"
		title="Notifikasi Saya"
		description="Lihat pemberitahuan sistem dan pembaruan dokumen perpajakan Anda."
	/>

	<Stack gap="18px">
		{#if notice}
			<InlineAlert
				tone="success"
				title="Informasi notifikasi"
				message={notice}
				dismissible
				ondismiss={() => (notice = "")}
			/>
		{/if}

		<FormSection title="Kotak Masuk" actions={inboxActions} bordered padded={false}>
			<TabbedSection
				tabs={[
					{ label: `Semua (${notifications.length})`, value: "all" },
					{ label: `Baca (${readCount})`, value: "read" },
					{ label: `Belum dibaca (${unreadCount})`, value: "unread" },
				]}
				bind:active={activeTab}
				ariaLabel="Status notifikasi"
				onchange={() => (page = 1)}
			>
				{#snippet children()}
					<Stack gap="0">
						<div class="table-tools">{@render tableTools()}</div>
						<CollapsiblePanel open={filterOpen} id="notification-filters" label="Filter notifikasi">
							<ResponsiveGrid columns={2} gap="16px">
								<FormField
									label="Cari notifikasi"
									bind:value={query}
									placeholder="Pengirim atau subjek"
									oninput={() => (page = 1)}
								/>
							</ResponsiveGrid>
						</CollapsiblePanel>
						<SummaryStrip
							columns={3}
							items={[
								{ label: "Seluruh notifikasi", value: notifications.length },
								{ label: "Belum dibaca", value: unreadCount },
								{ label: "Hasil ditemukan", value: visibleNotifications.length },
							]}
						/>
						<DataTableViewport label="Daftar notifikasi saya" minWidth="960px" framed={false} headerTone="navy" stickyFirstColumn>
							<table>
								<thead>
									<tr>
										<th scope="col">Aksi</th>
										{#if visibleColumns.sender}<th scope="col">Pengirim</th>{/if}
										{#if visibleColumns.subject}<th scope="col">Subjek</th>{/if}
										{#if visibleColumns.sentAt}<th scope="col">Tanggal Terkirim</th>{/if}
										{#if visibleColumns.priority}<th scope="col">Prioritas</th>{/if}
									</tr>
								</thead>
								<tbody>
									{#each pagedNotifications as item}
										<tr class:unread={!item.read}>
											<td class="action-cell"><TableActions visibleCount={1} actions={[{ label: "Lihat", ariaLabel: `Lihat ${item.subject}`, href: `/portal-saya/notifikasi-saya/${item.id}` }]} /></td>
											{#if visibleColumns.sender}<td>{item.sender}</td>{/if}
											{#if visibleColumns.subject}<td><strong>{item.subject}</strong></td>{/if}
											{#if visibleColumns.sentAt}<td class="number">{item.sentAt}</td>{/if}
											{#if visibleColumns.priority}<td><StatusBadge label={item.priority} tone={item.priority === "HIGH" ? "attention" : "neutral"} /></td>{/if}
										</tr>
									{:else}
										<tr><td class="empty" colspan={visibleColumnCount}>Tidak ada notifikasi yang ditemukan.</td></tr>
									{/each}
								</tbody>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page bind:pageSize totalItems={visibleNotifications.length} itemLabel="notifikasi" />
					</Stack>
				{/snippet}
			</TabbedSection>
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
	.table-tools { padding: 0 0 14px; display: flex; justify-content: flex-end; }
	tr.unread td { background: #fff9e7; }
	@media (max-width: 700px) { .table-tools { justify-content: flex-start; } }
</style>

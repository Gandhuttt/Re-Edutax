<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		PageLayout,
		PaginationBar,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		TableActions,
		TabbedSection
	} from '$lib/re-ui-components';
	import { deleteMp } from './deleteMp.remote';
	import { listMp } from './listMp.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanMp } from './terbitkanMp.remote';

	const rows = $derived(await listMp());
	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
	const statusLabel = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan' } as const;
	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Belum Terbit');
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const filteredRows = $derived(
		activeTab === 'Telah Terbit'
			? rows.filter((row) => row.diterbitkan)
			: activeTab === 'Tidak Valid'
				? []
				: rows.filter((row) => !row.diterbitkan)
	);
	const pagedRows = $derived(filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	$effect(() => { activeTab; currentPage = 1; });
	function statusTone(row: (typeof rows)[number]) {
		if (row.diterbitkan) return 'success' as const;
		if (row.status === 'SAVEDINVALID') return 'error' as const;
		return row.status === 'SUBMITTED' ? 'attention' as const : 'neutral' as const;
	}
	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>e-Bupot MP</title></svelte:head>

{#snippet workspaceActions()}
	{#if activeTab === 'Belum Terbit'}
		<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot MP</ActionButton></form>
	{/if}
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap' }]} />
		<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
			{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' },
			{ label: 'BPPU', href: '/ebupot/bpu' },
			{ label: 'BP21', href: '/ebupot/bp21' },
			{ label: 'BP26', href: '/ebupot/bp26' },
			{ label: 'BPA1', href: '/ebupot/bpa1' },
			{ label: 'BPA2', href: '/ebupot/bpa2' },
			{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp', active: true }
		]}]}>
			<DataWorkspace title="Bukti Pemotongan Bulanan Pegawai Tetap" primaryActions={workspaceActions}>
				<TabbedSection tabs={tabs} active={activeTab} ariaLabel="Status bukti pemotongan" onchange={(value) => (activeTab = value as (typeof tabs)[number])}>
					{#snippet children()}
						<DataTableViewport label="Daftar bukti pemotongan bulanan pegawai tetap" minWidth="1250px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table>
								<thead><tr><th style="width: 220px">Aksi</th><th>Masa Pajak</th><th>Nomor Identitas WP</th><th>Nama</th><th>Objek Pajak</th><th class="right">Pajak Penghasilan (Rp)</th><th>Status</th></tr></thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={7} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const del = deleteMp.for(row.id)}
										{@const issue = terbitkanMp.for(row.id)}
										<td class="action-cell"><form {...del} id={`delete-mp-${row.id}`} hidden></form><form {...issue} id={`issue-mp-${row.id}`} hidden></form><TableActions visibleCount={3} actions={[{ label: row.diterbitkan ? 'Lihat' : 'Buka', href: `/ebupot/mp/${row.id}` }, ...(!row.diterbitkan && row.status === 'SUBMITTED' ? [{ label: 'Terbitkan', onclick: () => submitForm(`issue-mp-${row.id}`) }] : []), ...(!row.diterbitkan ? [{ label: 'Hapus', danger: true, onclick: () => submitForm(`delete-mp-${row.id}`) }] : [])]} /></td>
										<td>{formatMonth(row.masaPajak)} {row.tahun}</td><td><code>{row.nomorIdentitasWp}</code></td><td><strong>{row.nama}</strong></td><td>{row.namaObjekPajak ?? '—'}</td><td class="right amount">{rupiah.format(row.pajakPenghasilanDipotong)}</td><td><StatusBadge label={row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]} tone={statusTone(row)} /></td>
									{/snippet}
								</DataTableBody>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={filteredRows.length} pageSizeOptions={[10, 25, 50, 100]} itemLabel="bukti pemotongan" />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

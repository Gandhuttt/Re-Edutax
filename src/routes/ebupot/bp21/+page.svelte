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
	import { deleteBp21 } from './deleteBp21.remote';
	import { listBp21 } from './listBp21.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanBp21 } from './terbitkanBp21.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
	const statusLabel = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan' } as const;
	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	const rows = $derived(await listBp21());
	let activeTab = $state<(typeof tabs)[number]>('Belum Terbit');
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const filteredRows = $derived(
		activeTab === 'Telah Terbit' ? rows.filter((r) => r.diterbitkan) : activeTab === 'Tidak Valid' ? [] : rows.filter((r) => !r.diterbitkan)
	);
	const pagedRows = $derived(filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	$effect(() => { activeTab; currentPage = 1; });
	function submitForm(id: string) { const form = document.getElementById(id); if (form instanceof HTMLFormElement) form.requestSubmit(); }
</script>

<svelte:head><title>e-Bupot BP21</title></svelte:head>

{#snippet workspaceActions()}
	<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BP21</ActionButton></form>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/' }, { label: 'e-Bupot' }, { label: 'BP21' }]} />
		<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
			{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21', active: true }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
		]}]}>
			<DataWorkspace title={`BP21 ${activeTab}`} primaryActions={activeTab === 'Belum Terbit' ? workspaceActions : undefined}>
				<TabbedSection tabs={tabs} active={activeTab} onchange={(value) => (activeTab = value as (typeof tabs)[number])} ariaLabel="Status BP21" panelLabel="Daftar BP21">
					{#snippet children()}
						<DataTableViewport label={`Daftar BP21 ${activeTab}`} minWidth="1150px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table><thead><tr><th style="width: 190px">Aksi</th><th>Masa Pajak</th><th>Nomor Identitas WP</th><th>Nama Penerima</th><th>Objek Pajak</th><th class="right">Pajak Penghasilan (Rp)</th><th>Status</th></tr></thead>
							<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={7} emptyText="Tidak ada data yang ditemukan.">
								{#snippet row(row)}
									{@const hapusBp21 = deleteBp21.for(row.id)}
									{@const terbitkanRow = terbitkanBp21.for(row.id)}
									<td class="action-cell"><form {...hapusBp21} id={`delete-bp21-${row.id}`} hidden></form><form {...terbitkanRow} id={`terbit-bp21-${row.id}`} hidden></form><TableActions visibleCount={3} actions={[{ label: 'Buka', href: `/ebupot/bp21/${row.id}` }, ...(!row.diterbitkan && row.status === 'SUBMITTED' ? [{ label: 'Terbitkan', onclick: () => submitForm(`terbit-bp21-${row.id}`) }] : []), ...(!row.diterbitkan ? [{ label: 'Hapus', danger: true, onclick: () => submitForm(`delete-bp21-${row.id}`) }] : [])]} /></td>
									<td>{formatMonth(row.masaPajak)} {row.tahun}</td><td>{row.nomorIdentitasWp}</td><td><strong>{row.namaPenerima}</strong></td><td>{row.namaObjekPajak ?? '—'}</td><td class="right amount">{rupiah.format(row.pajakPenghasilan)}</td><td><StatusBadge label={row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]} tone={row.diterbitkan ? 'success' : row.status === 'SAVEDINVALID' ? 'error' : 'attention'} /></td>
								{/snippet}
							</DataTableBody></table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={filteredRows.length} pageSizeOptions={[10, 25, 50]} itemLabel="BP21" />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

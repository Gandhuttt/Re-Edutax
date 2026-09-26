<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { ActionButton, Breadcrumbs, DataTableBody, DataTableViewport, DataWorkspace, PageLayout, PaginationBar, ServiceWorkspace, Stack, StatusBadge, TableActions, TabbedSection } from '$lib/re-ui-components';
	import { deleteBpa1 } from './deleteBpa1.remote';
	import { listBpa1 } from './listBpa1.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanBpa1 } from './terbitkanBpa1.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
	const statusLabel = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan' } as const;
	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Belum Terbit');
	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	const rows = $derived(await listBpa1());
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const filteredRows = $derived(rows.filter((r) => activeTab === 'Telah Terbit' ? r.diterbitkan : activeTab === 'Tidak Valid' ? false : !r.diterbitkan));
	const pagedRows = $derived(filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	$effect(() => { activeTab; currentPage = 1; });
	function submitHiddenForm(id: string) { const form = document.getElementById(id); if (form instanceof HTMLFormElement) form.requestSubmit(); }
</script>

<svelte:head>
	<title>e-Bupot BPA1</title>
</svelte:head>
<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/' }, { label: 'e-Bupot' }, { label: 'BPA1' }]} />
		<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
			{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1', active: true }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
		]}]}>
			<DataWorkspace title="e-Bupot BPA1" primaryActions={activeTab === 'Belum Terbit' ? workspaceActions : undefined}>
				<TabbedSection tabs={tabs} bind:active={activeTab} ariaLabel="Status BPA1">
					{#snippet children()}
						<DataTableViewport label="Daftar BPA1" minWidth="1250px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table><thead><tr><th>Aksi</th><th>Masa Pajak</th><th>Nomor Identitas WP</th><th>Nama</th><th>Objek Pajak</th><th>PPh 21 Terutang (Rp)</th><th>Status</th></tr></thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={7} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const hapus = deleteBpa1.for(row.id)} {@const terbitkan = terbitkanBpa1.for(row.id)}
										<td><form {...hapus} id={`hapus-bpa1-${row.id}`} hidden></form><form {...terbitkan} id={`terbit-bpa1-${row.id}`} hidden></form><TableActions visibleCount={3} actions={[{label:'Buka',href:`/ebupot/bpa1/${row.id}`},...(row.diterbitkan ? [] : row.status === 'SUBMITTED' ? [{label:'Terbitkan',onclick:() => submitHiddenForm(`terbit-bpa1-${row.id}`)}] : []),...(!row.diterbitkan ? [{label:'Hapus',danger:true,onclick:() => submitHiddenForm(`hapus-bpa1-${row.id}`)}] : [])]} /></td>
										<td>{formatMonth(row.masaPajakAwal)} {row.tahunAwal} - {formatMonth(row.masaPajakAkhir)} {row.tahunAkhir}</td><td>{row.nomorIdentitasWp}</td><td>{row.nama}</td><td>{row.namaObjekPajak ?? ''}</td><td>{rupiah.format(row.pphPasal21TerutangPadaIni)}</td><td><StatusBadge label={row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]} tone={row.diterbitkan ? 'success' : row.status === 'SAVEDINVALID' ? 'error' : 'neutral'} /></td>
									{/snippet}
								</DataTableBody></table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={filteredRows.length} itemLabel="BPA1" />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

{#snippet workspaceActions()}<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BPA1</ActionButton></form>{/snippet}

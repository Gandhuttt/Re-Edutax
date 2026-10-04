<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton, Breadcrumbs, DataTableBody, DataTableViewport, DataWorkspace, PageLayout, PaginationBar, ServiceWorkspace, Stack, StatusBadge, TableActions, TabbedSection } from '$lib/re-ui-components';
	import { formatMonth } from '$lib/helpers/date';
	import { deleteBpa2 } from './deleteBpa2.remote';
	import { listBpa2 } from './listBpa2.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanBpa2 } from './terbitkanBpa2.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });

	const statusLabel = {
		NORMAL: 'Normal',
		SAVEDINVALID: 'Disimpan Tidak Valid',
		SUBMITTED: 'Disimpan'
	} as const;

	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	let activeTab: (typeof tabs)[number] = $state('Belum Terbit');

	function filterRows(
		rows: Awaited<ReturnType<typeof listBpa2>>,
		tab: (typeof tabs)[number]
	) {
		if (tab === 'Telah Terbit') return rows.filter((r) => r.diterbitkan);
		if (tab === 'Tidak Valid') return [];
		return rows.filter((r) => !r.diterbitkan);
	}
	const rows = $derived(await listBpa2());
	let currentPage = $state(1);
	let pageSize = $state(25);
	let pagedRows = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return filterRows(rows, activeTab).slice(start, start + pageSize);
	});
	$effect(() => {
		activeTab;
		currentPage = 1;
	});
	function submitHiddenForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>
{#snippet secondaryActions()}
	{#if activeTab === 'Belum Terbit'}
		<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat BPA2</ActionButton></form>
	{/if}
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'BPA2' }]} />
		<ServiceWorkspace
			identity={{ eyebrow: 'Wajib Pajak', name: String(appPage.data.user?.name ?? 'Wajib Pajak'), identifier: String(appPage.data.user?.username ?? ''), mark: 'EB' }}
			groups={[{ label: 'e-Bupot', links: [
				{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' },
				{ label: 'BPPU', href: '/ebupot/bpu' },
				{ label: 'BP21', href: '/ebupot/bp21' },
				{ label: 'BP26', href: '/ebupot/bp26' },
				{ label: 'BPA1', href: '/ebupot/bpa1' },
				{ label: 'BPA2', href: '/ebupot/bpa2', active: true },
				{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
			]}]}
		>
			<DataWorkspace title="BPA2" secondaryActions={secondaryActions}>
				<TabbedSection tabs={tabs} bind:active={activeTab}>
					{#snippet children(tab)}
						{@const allRows = filterRows(rows, tab as (typeof tabs)[number])}
						<DataTableViewport label={`Daftar BPA2 ${tab}`} minWidth="1100px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table>
								<thead><tr><th>Aksi</th><th>Masa Pajak</th><th>Nomor Identitas WP</th><th>Nama</th><th>Objek Pajak</th><th>PPh 21 Terutang (Rp)</th><th>Status</th></tr></thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={7} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const hapusBpa2 = deleteBpa2.for(row.id)}
										{@const terbitkanRow = terbitkanBpa2.for(row.id)}
										<td class="action-cell">
											<form {...hapusBpa2} id={`hapus-bpa2-${row.id}`} hidden></form>
											<form {...terbitkanRow} id={`terbit-bpa2-${row.id}`} hidden></form>
											<TableActions visibleCount={3} actions={[
												{ label: 'Buka', href: `/ebupot/bpa2/${row.id}` },
												...(row.diterbitkan ? [] : row.status === 'SUBMITTED' ? [{ label: 'Terbitkan', onclick: () => submitHiddenForm(`terbit-bpa2-${row.id}`) }] : []),
												...(!row.diterbitkan ? [{ label: 'Hapus', danger: true, onclick: () => submitHiddenForm(`hapus-bpa2-${row.id}`) }] : [])
											]} />
										</td>
										<td>{formatMonth(row.masaPajakAwal)} {row.tahunAwal} - {formatMonth(row.masaPajakAkhir)} {row.tahunAkhir}</td>
										<td>{row.nomorIdentitasWp}</td><td><strong>{row.nama}</strong></td><td>{row.namaObjekPajak ?? '—'}</td>
										<td class="right amount">{rupiah.format(row.pphPasal21TerutangPadaIni)}</td>
										<td><StatusBadge label={row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]} tone={row.diterbitkan ? 'success' : row.status === 'SAVEDINVALID' ? 'error' : 'neutral'} /></td>
									{/snippet}
								</DataTableBody>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={allRows.length} pageSizeOptions={[10, 25, 50, 100]} itemLabel="BPA2" />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>

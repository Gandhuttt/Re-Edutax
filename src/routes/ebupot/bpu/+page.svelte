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
	import { deleteBpu } from './deleteBpu.remote';
	import { listBpu } from './listBpu.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanBpu } from './terbitkanBpu.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
	const rows = $derived(await listBpu());
	const statusLabel = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan' } as const;
	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Belum Terbit');
	let currentPage = $state(1);
	let pageSize = $state(50);
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const filteredRows = $derived.by(() => {
		if (activeTab === 'Telah Terbit') return rows.filter((row) => row.diterbitkan);
		if (activeTab === 'Tidak Valid') return [];
		return rows.filter((row) => !row.diterbitkan);
	});
	const pagedRows = $derived(filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function selectTab(tab: string) {
		activeTab = tab as (typeof tabs)[number];
		currentPage = 1;
	}
	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>e-Bupot BPPU</title></svelte:head>

{#snippet workspaceActions()}
	{#if activeTab === 'Belum Terbit'}
		<form {...newEmpty}>
			<ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BPPU</ActionButton>
		</form>
	{/if}
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'BPPU' }]} />
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }}
			groups={[{
				label: 'e-Bupot',
				links: [
					{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' },
					{ label: 'BPPU', href: '/ebupot/bpu', active: true },
					{ label: 'BP21', href: '/ebupot/bp21' },
					{ label: 'BP26', href: '/ebupot/bp26' },
					{ label: 'BPA1', href: '/ebupot/bpa1' },
					{ label: 'BPA2', href: '/ebupot/bpa2' },
					{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
				]
			}]}
		>
			<DataWorkspace title={`eBupot BPPU ${activeTab}`} secondaryActions={workspaceActions}>
				<TabbedSection tabs={tabs} active={activeTab} onchange={selectTab} ariaLabel="Status BPPU">
					{#snippet children()}
						<DataTableViewport label="Daftar BPPU" minWidth="1100px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
							<table>
								<thead><tr><th style="width: 220px">Aksi</th><th>Masa Pajak</th><th>Nomor Identitas WP</th><th>Nama Penerima</th><th>Objek Pajak</th><th class="right">Pajak Penghasilan (Rp)</th><th>Status</th></tr></thead>
								<DataTableBody items={pagedRows} getKey={(row) => row.id} emptyColspan={7} emptyText="Tidak ada data yang ditemukan.">
									{#snippet row(row)}
										{@const hapusBpu = deleteBpu.for(row.id)}
										{@const terbitkanRow = terbitkanBpu.for(row.id)}
										<td class="action-cell">
											<form {...hapusBpu} id={`delete-bpu-${row.id}`} hidden></form>
											<form {...terbitkanRow} id={`terbitkan-bpu-${row.id}`} hidden></form>
											<TableActions
												visibleCount={3}
												actions={[
													{ label: 'Buka', href: `/ebupot/bpu/${row.id}` },
													...(!row.diterbitkan && row.status === 'SUBMITTED' ? [{ label: 'Terbitkan', onclick: () => submitForm(`terbitkan-bpu-${row.id}`) }] : []),
													...(!row.diterbitkan ? [{ label: 'Hapus', danger: true, onclick: () => submitForm(`delete-bpu-${row.id}`) }] : [])
												]}
											/>
										</td>
										<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
										<td>{row.nomorIdentitasWp}</td><td>{row.namaPenerima}</td><td>{row.namaObjekPajak ?? ''}</td>
										<td class="right amount">{rupiah.format(row.pajakPenghasilan)}</td>
										<td><StatusBadge label={row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]} tone={row.diterbitkan ? 'success' : row.status === 'SAVEDINVALID' ? 'attention' : 'neutral'} /></td>
									{/snippet}
								</DataTableBody>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page={currentPage} bind:pageSize totalItems={filteredRows.length} pageSizeOptions={[10, 25, 50, 100]} itemLabel="BPPU" />
					{/snippet}
				</TabbedSection>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

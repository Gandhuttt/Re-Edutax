<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		PageLayout,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		TableActions
	} from '$lib/re-ui-components';
	import { deleteReturFaktur } from './deleteReturFaktur.remote';
	import { listReturFakturMasukan } from './listReturFakturMasukan.remote';
	import { uploadReturFaktur } from './uploadReturFaktur.remote';

	const returns = $derived(await listReturFakturMasukan());
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));

	const statusMeta = {
		konsep: { label: 'Konsep', tone: 'attention' as const },
		diunggah: { label: 'Diunggah', tone: 'success' as const },
		dibatalkan: { label: 'Dibatalkan', tone: 'error' as const }
	};

	function submitForm(id: string, confirmation: string) {
		if (!confirm(confirmation)) return;
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>Retur Pajak Masukan</title></svelte:head>
{#snippet workspaceActions()}
	<ActionButton onclick={() => goto('/faktur-pajak/masukan')}>Buat Retur</ActionButton>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/dashboard' },
				{ label: 'e-Faktur' },
				{ label: 'Retur Pajak Masukan' }
			]}
		/>
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{
				eyebrow: 'Wajib Pajak',
				name: accountName,
				identifier: accountNpwp,
				mark: 'EF'
			}}
			groups={[
				{
					label: 'e-Faktur',
					links: [
						{ label: 'Pajak Keluaran', href: '/faktur-pajak/keluaran' },
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan' },
						{ label: 'Retur Pajak Masukan', href: '/faktur-pajak/retur-masukan', active: true },
						{ label: 'Retur Pajak Keluaran', href: '/faktur-pajak/retur-keluaran' }
					]
				}
			]}
		>
			<DataWorkspace title="Retur Pajak Masukan" secondaryActions={workspaceActions}>
				<DataTableViewport
					label="Daftar retur pajak masukan"
					minWidth="1660px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 180px">Aksi</th>
								<th style="width: 150px">Status</th>
								<th style="width: 170px">Nomor Retur</th>
								<th style="width: 150px">Tanggal Retur</th>
								<th style="width: 190px">Nomor Faktur</th>
								<th style="width: 180px">NPWP Penjual</th>
								<th style="width: 210px">Nama Penjual</th>
								<th style="width: 130px">Masa Pajak</th>
								<th style="width: 150px">Dikreditkan (Y/N)</th>
								<th class="right" style="width: 140px">DPP</th>
								<th class="right" style="width: 140px">DPP Nilai Lain</th>
								<th class="right" style="width: 130px">PPN</th>
								<th class="right" style="width: 130px">PPnBM</th>
							</tr>
						</thead>
						<DataTableBody
							items={returns}
							getKey={(record) => record.id}
							emptyColspan={13}
							emptyText="Belum ada retur pajak masukan."
						>
							{#snippet row(record)}
								{@const uploadForm = uploadReturFaktur.for(record.id)}
								{@const deleteForm = deleteReturFaktur.for(record.id)}
								<td class="action-cell">
									<form {...uploadForm} id={`upload-return-${record.id}`} hidden></form>
									<form {...deleteForm} id={`delete-return-${record.id}`} hidden></form>
									<TableActions
										visibleCount={3}
										actions={record.status === 'konsep'
											? [
													{
														label: 'Upload Retur',
														onclick: () => submitForm(`upload-return-${record.id}`, 'Upload retur pajak masukan ini?')
													},
													{
														label: 'Hapus',
														danger: true,
														onclick: () => submitForm(`delete-return-${record.id}`, 'Hapus konsep retur ini?')
													}
												]
											: []}
									/>
								</td>
								<td><StatusBadge {...statusMeta[record.status]} /></td>
								<td><code>{record.nomorRetur || 'Terbentuk setelah upload'}</code></td>
								<td>{record.tanggalRetur}</td>
								<td><code>{record.nomorFaktur || '—'}</code></td>
								<td><code>{record.npwpPenjual}</code></td>
								<td><strong>{record.namaPenjual || '—'}</strong></td>
								<td>{formatMonth(record.masaPajak)} {record.tahun}</td>
								<td>{record.dikreditkan ? 'Y' : 'N'}</td>
								<td class="right amount">{formatRupiahDerived(record.totals.dpp)}</td>
								<td class="right amount">{formatRupiahDerived(record.totals.dppNilaiLain)}</td>
								<td class="right amount">{formatRupiahDerived(record.totals.ppn)}</td>
								<td class="right amount">{formatRupiahDerived(record.totals.ppnbm)}</td>
							{/snippet}
						</DataTableBody>
					</table>
				</DataTableViewport>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

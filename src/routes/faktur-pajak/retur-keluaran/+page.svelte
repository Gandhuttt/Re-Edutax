<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import {
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
	import { listReturFakturKeluaran } from './listReturFakturKeluaran.remote';
	import { batalkanReturFaktur } from './batalkanReturFaktur.remote';

	const returns = $derived(await listReturFakturKeluaran());
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const statusMeta = {
		diunggah: { label: 'Diunggah', tone: 'success' as const },
		dibatalkan: { label: 'Dibatalkan', tone: 'error' as const },
		konsep: { label: 'Konsep', tone: 'neutral' as const }
	};

	function submitForm(id: string, confirmation: string) {
		if (!confirm(confirmation)) return;
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>Retur Pajak Keluaran</title></svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Faktur' }, { label: 'Retur Pajak Keluaran' }]} />
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EF' }}
			groups={[{
				label: 'e-Faktur',
				links: [
					{ label: 'Pajak Keluaran', href: '/faktur-pajak/keluaran' },
					{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan' },
					{ label: 'Retur Pajak Masukan', href: '/faktur-pajak/retur-masukan' },
					{ label: 'Retur Pajak Keluaran', href: '/faktur-pajak/retur-keluaran', active: true }
				]
			}]}
		>
			<DataWorkspace title="Retur Pajak Keluaran">
				<DataTableViewport label="Daftar retur pajak keluaran" minWidth="1640px" framed={false} headerTone="yellow" density="compact" stickyFirstColumn>
					<table>
						<thead><tr>
							<th style="width: 180px">Aksi</th><th style="width: 150px">Status</th><th style="width: 170px">Nomor Retur</th><th style="width: 140px">Tanggal Retur</th><th style="width: 190px">Nomor Faktur</th><th style="width: 180px">NPWP Pembeli</th><th style="width: 210px">Nama Pembeli</th><th style="width: 130px">Masa Pajak</th><th class="right" style="width: 140px">DPP</th><th class="right" style="width: 150px">DPP Nilai Lain</th><th class="right" style="width: 130px">PPN</th><th class="right" style="width: 130px">PPnBM</th>
						</tr></thead>
						<DataTableBody items={returns} getKey={(record) => record.id} emptyColspan={12} emptyText="Belum ada retur pajak keluaran.">
							{#snippet row(record)}
								<td class="action-cell">
									<form {...batalkanReturFaktur} id={`cancel-return-${record.id}`} hidden>
										<input type="hidden" name="id" value={record.id} />
									</form>
									<TableActions
										visibleCount={2}
										actions={record.status === 'diunggah'
											? [{
													label: 'Batalkan Retur',
													danger: true,
													onclick: () => submitForm(
														`cancel-return-${record.id}`,
														'Batalkan retur pajak keluaran ini?'
													)
												}]
											: []}
									/>
								</td>
								<td><StatusBadge {...statusMeta[record.status]} /></td><td><code>{record.nomorRetur || '—'}</code></td><td>{record.tanggalRetur}</td><td><code>{record.nomorFaktur || '—'}</code></td><td><code>{record.npwpPembeli}</code></td><td><strong>{record.namaPembeli || '—'}</strong></td><td>{formatMonth(record.masaPajak)} {record.tahun}</td><td class="right amount">{formatRupiahDerived(record.totals.dpp)}</td><td class="right amount">{formatRupiahDerived(record.totals.dppNilaiLain)}</td><td class="right amount">{formatRupiahDerived(record.totals.ppn)}</td><td class="right amount">{formatRupiahDerived(record.totals.ppnbm)}</td>
							{/snippet}
						</DataTableBody>
					</table>
				</DataTableViewport>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

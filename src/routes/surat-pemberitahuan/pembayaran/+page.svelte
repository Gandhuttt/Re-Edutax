<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		PageLayout,
		PaginationBar,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		TableActions
	} from '$lib/re-ui-components';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPphOrangPribadi } from '../listSptPphOrangPribadi.remote';
	import { listSptPpn } from '../listSptPpn.remote';
	import { paySptPphBadan } from './paySptPphBadan.remote';
	import { paySptPphOrangPribadi } from './paySptPphOrangPribadi.remote';
	import { paySptPpn } from './paySptPpn.remote';

	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi';
	type PaymentRow = {
		id: string;
		kind: JenisSpt;
		jenis: string;
		masaPajak: string;
		tahun: number;
		pembetulanKe: number;
		kurangBayar: number;
		tanggalPosting: Date | null;
	};

	const rupiah = new Intl.NumberFormat('id-ID');
	const [sptPpn, sptPphBadan, sptPphOrangPribadi] = await Promise.all([
		listSptPpn({ status: 'menunggu_pembayaran' }),
		listSptPphBadan({ status: 'menunggu_pembayaran' }),
		listSptPphOrangPribadi({ status: 'menunggu_pembayaran' })
	]);
	const rows = $derived.by((): PaymentRow[] => [
		...sptPpn.map((row) => ({
			id: row.id,
			kind: 'ppn' as const,
			jenis: 'SPT Masa PPN',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			kurangBayar: row.ppnKurangLebihBayar,
			tanggalPosting: row.tanggalPosting
		})),
		...sptPphBadan.map((row) => ({
			id: row.id,
			kind: 'pph-badan' as const,
			jenis: 'SPT Tahunan PPh Badan',
			masaPajak: '—',
			tahun: row.tahunPajak,
			pembetulanKe: row.pembetulanKe,
			kurangBayar: row.pphKurangLebihBayar,
			tanggalPosting: row.tanggalPosting
		})),
		...sptPphOrangPribadi.map((row) => ({
			id: row.id,
			kind: 'pph-orang-pribadi' as const,
			jenis: 'SPT Tahunan PPh Orang Pribadi',
			masaPajak: '—',
			tahun: row.tahunPajak,
			pembetulanKe: row.pembetulanKe,
			kurangBayar: row.pphKurangLebihBayar,
			tanggalPosting: row.tanggalPosting
		}))
	]);

	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const pagedRows = $derived(rows.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function detailHref(row: PaymentRow) {
		if (row.kind === 'ppn') return `/surat-pemberitahuan/ppn?id=${row.id}`;
		if (row.kind === 'pph-badan') return `/surat-pemberitahuan/pph-badan?id=${row.id}`;
		return `/surat-pemberitahuan/pph-orang-pribadi?id=${row.id}`;
	}

	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>SPT Menunggu Pembayaran</title></svelte:head>

<PageLayout contentWidth="1480px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/dashboard' },
				{ label: 'Surat Pemberitahuan' },
				{ label: 'Menunggu Pembayaran' }
			]}
		/>

		<ServiceWorkspace
			bind:sidebarOpen
			identity={{
				eyebrow: 'Wajib Pajak',
				name: accountName,
				identifier: accountNpwp,
				mark: 'SPT'
			}}
			groups={[
				{
					label: 'Surat Pemberitahuan',
					links: [
						{ label: 'Konsep SPT', href: '/surat-pemberitahuan/konsep' },
						{
							label: 'Menunggu Pembayaran',
							href: '/surat-pemberitahuan/pembayaran',
							active: true
						},
						{ label: 'SPT Dilaporkan', href: '/surat-pemberitahuan/laporan' }
					]
				}
			]}
		>
			<DataWorkspace title="SPT Menunggu Pembayaran">
				<DataTableViewport
					label="Daftar SPT menunggu pembayaran"
					minWidth="1120px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 160px">Aksi</th>
								<th style="width: 180px">Status</th>
								<th style="width: 240px">Jenis SPT</th>
								<th style="width: 130px">Masa Pajak</th>
								<th style="width: 90px">Tahun</th>
								<th style="width: 110px">Pembetulan</th>
								<th class="right" style="width: 160px">Kurang Bayar</th>
								<th style="width: 150px">Tanggal Posting</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRows}
							getKey={(row) => `${row.kind}-${row.id}`}
							emptyColspan={8}
							emptyText="Belum ada SPT yang menunggu pembayaran."
						>
							{#snippet row(row)}
								<td class="action-cell">
									{#if row.kind === 'ppn'}
										{@const payForm = paySptPpn.for(row.id)}
										<form {...payForm} id={`pay-spt-ppn-${row.id}`} hidden></form>
									{:else if row.kind === 'pph-badan'}
										{@const payForm = paySptPphBadan.for(row.id)}
										<form {...payForm} id={`pay-spt-pph-badan-${row.id}`} hidden></form>
									{:else}
										{@const payForm = paySptPphOrangPribadi.for(row.id)}
										<form {...payForm} id={`pay-spt-pph-op-${row.id}`} hidden></form>
									{/if}
									<TableActions
										visibleCount={2}
										actions={[
											{ label: 'Lihat', href: detailHref(row) },
											{
												label: 'Bayar',
												onclick: () =>
													submitForm(
														row.kind === 'ppn'
															? `pay-spt-ppn-${row.id}`
															: row.kind === 'pph-badan'
																? `pay-spt-pph-badan-${row.id}`
																: `pay-spt-pph-op-${row.id}`
													)
											}
										]}
									/>
								</td>
								<td><StatusBadge label="Menunggu Pembayaran" tone="attention" /></td>
								<td><strong>{row.jenis}</strong></td>
								<td>{row.masaPajak}</td>
								<td class="number">{row.tahun}</td>
								<td class="number">{row.pembetulanKe}</td>
								<td class="right amount">{rupiah.format(row.kurangBayar)}</td>
								<td class="number">{row.tanggalPosting?.toLocaleDateString('id-ID') ?? '—'}</td>
							{/snippet}
						</DataTableBody>
					</table>
				</DataTableViewport>
				<PaginationBar
					bind:page={currentPage}
					bind:pageSize
					totalItems={rows.length}
					pageSizeOptions={[10, 25, 50]}
					itemLabel="SPT"
				/>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

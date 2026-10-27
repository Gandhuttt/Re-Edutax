<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth, formatTanggalWaktu } from '$lib/helpers/date';
	import { labelUrutanSpt } from '$lib/helpers/sptUrutan';
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
	import { listSptPph2126, paySptPph2126 } from '../spt2126.remote';
	import { listSptPphUnifikasi, paySptPphUnifikasi } from '../sptUnifikasi.remote';

	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi' | 'pph-21-26' | 'pph-unifikasi';
	type PaymentRow = {
		id: string;
		kind: JenisSpt;
		jenis: string;
		masaPajak: string;
		tahun: number;
		pembetulanKe: number;
		dibuat: Date;
		urutan: string;
		kurangBayar: number;
		pasal21?: number;
		pasal26?: number;
		tanggalPosting: Date | null;
	};

	const rupiah = new Intl.NumberFormat('id-ID');
	const sptPph2126 = await listSptPph2126({ status: 'menunggu_pembayaran' });
	const sptPphUnifikasi = await listSptPphUnifikasi({ status: 'menunggu_pembayaran' });
	const [sptPpn, sptPphBadan, sptPphOrangPribadi] = await Promise.all([
		listSptPpn({ status: 'menunggu_pembayaran' }),
		listSptPphBadan({ status: 'menunggu_pembayaran' }),
		listSptPphOrangPribadi({ status: 'menunggu_pembayaran' })
	]);
	const rows = $derived.by((): PaymentRow[] => [
		...sptPphUnifikasi.map((row) => ({
			id: row.id,
			kind: 'pph-unifikasi' as const,
			jenis: 'SPT Masa PPh Unifikasi',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			dibuat: row.createdAt,
			urutan: '',
			kurangBayar: row.harusDibayar,
			tanggalPosting: row.tanggalDiperbarui
		})),
		...sptPph2126.map((row) => ({
			id: row.id,
			kind: 'pph-21-26' as const,
			jenis: 'SPT Masa PPh Pasal 21/26',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			dibuat: row.createdAt,
			urutan: '',
			kurangBayar: row.kurangLebihBayar,
			pasal21: row.kurangLebihBayar21,
			pasal26: row.kurangLebihBayar26,
			tanggalPosting: row.tanggalPosting
		})),
		...sptPpn.map((row) => ({
			id: row.id,
			kind: 'ppn' as const,
			jenis: 'SPT Masa PPN',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			dibuat: row.dibuat,
			urutan: labelUrutanSpt(row),
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
			dibuat: row.dibuat,
			urutan: labelUrutanSpt(row),
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
			dibuat: row.dibuat,
			urutan: labelUrutanSpt(row),
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
		if (row.kind === 'pph-unifikasi') return `/surat-pemberitahuan/pph-unifikasi?id=${row.id}`;
		if (row.kind === 'pph-21-26') return `/surat-pemberitahuan/pph-21-26?id=${row.id}`;
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
								<th style="width: 170px">Dibuat</th>
								<th class="right" style="width: 160px">Kurang Bayar</th>
								<th style="width: 170px">Posting / Pembaruan Data</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRows}
							getKey={(row) => `${row.kind}-${row.id}`}
							emptyColspan={9}
							emptyText="Belum ada SPT yang menunggu pembayaran."
						>
							{#snippet row(row)}
								<td class="action-cell">
									{#if row.kind === 'pph-unifikasi'}
										<form {...paySptPphUnifikasi.for(row.id)} id={`pay-spt-unifikasi-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
										{#each paySptPphUnifikasi.for(row.id).fields.allIssues() ?? [] as issue}
											<p role="alert">{issue.message}</p>
										{/each}
									{:else if row.kind === 'pph-21-26'}
										<form {...paySptPph2126.for(row.id)} id={`pay-spt-2126-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
										{#each paySptPph2126.for(row.id).fields.allIssues() ?? [] as issue}
											<p role="alert">{issue.message}</p>
										{/each}
									{:else if row.kind === 'ppn'}
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
												label: row.kind === 'pph-21-26' || row.kind === 'pph-unifikasi' ? 'Bayar (Simulasi)' : 'Bayar',
												onclick: () =>
													submitForm(
														row.kind === 'pph-unifikasi'
															? `pay-spt-unifikasi-${row.id}`
															: row.kind === 'pph-21-26'
															? `pay-spt-2126-${row.id}`
															: row.kind === 'ppn'
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
								<td><strong>{row.jenis}</strong>{#if row.urutan} <StatusBadge label={row.urutan} />{/if}</td>
								<td>{row.masaPajak}</td>
								<td class="number">{row.tahun}</td>
								<td class="number">{row.pembetulanKe}</td>
								<td class="number">{formatTanggalWaktu(row.dibuat)}</td>
								<td class="right amount">
									{#if row.kind === 'pph-21-26'}
										PPh 21: {rupiah.format(row.pasal21 ?? 0)}<br />
										PPh 26: {rupiah.format(row.pasal26 ?? 0)}
									{:else}{rupiah.format(row.kurangBayar)}{/if}
								</td>
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

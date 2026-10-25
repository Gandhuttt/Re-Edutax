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
	import { newPembetulanSptPphBadan } from '../konsep/newPembetulanSptPphBadan.remote';
	import { newPembetulanSptPphOrangPribadi } from '../konsep/newPembetulanSptPphOrangPribadi.remote';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPphOrangPribadi } from '../listSptPphOrangPribadi.remote';
	import { listSptPpn } from '../listSptPpn.remote';
	import { listSptPph2126, newPembetulanSptPph2126 } from '../spt2126.remote';

	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi' | 'pph-21-26';
	type ReportedRow = {
		id: string;
		kind: JenisSpt;
		jenis: string;
		masaPajak: string;
		tahun: number;
		pembetulanKe: number;
		dibuat: Date;
		urutan: string;
		kurangLebihBayar: number;
		pasal21?: number;
		pasal26?: number;
		tanggalDilaporkan: Date | null;
	};

	const rupiah = new Intl.NumberFormat('id-ID');
	const sptPph2126 = await listSptPph2126({ status: 'dilaporkan' });
	const [sptPpn, sptPphBadan, sptPphOrangPribadi] = await Promise.all([
		listSptPpn({ status: 'dilaporkan' }),
		listSptPphBadan({ status: 'dilaporkan' }),
		listSptPphOrangPribadi({ status: 'dilaporkan' })
	]);
	const rows = $derived.by((): ReportedRow[] => [
		...sptPph2126.map((row) => ({
			id: row.id,
			kind: 'pph-21-26' as const,
			jenis: 'SPT Masa PPh Pasal 21/26',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			dibuat: row.createdAt,
			urutan: '',
			kurangLebihBayar: row.kurangLebihBayar,
			pasal21: row.kurangLebihBayar21,
			pasal26: row.kurangLebihBayar26,
			tanggalDilaporkan: row.tanggalDilaporkan
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
			kurangLebihBayar: row.ppnKurangLebihBayar,
			tanggalDilaporkan: row.tanggalDilaporkan
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
			kurangLebihBayar: row.pphKurangLebihBayar,
			tanggalDilaporkan: row.tanggalDilaporkan
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
			kurangLebihBayar: row.pphKurangLebihBayar,
			tanggalDilaporkan: row.tanggalDilaporkan
		}))
	]);

	let sidebarOpen = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const pagedRows = $derived(rows.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function detailHref(row: ReportedRow) {
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

<svelte:head><title>SPT Dilaporkan</title></svelte:head>

<PageLayout contentWidth="1480px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/dashboard' },
				{ label: 'Surat Pemberitahuan' },
				{ label: 'SPT Dilaporkan' }
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
						{ label: 'Menunggu Pembayaran', href: '/surat-pemberitahuan/pembayaran' },
						{
							label: 'SPT Dilaporkan',
							href: '/surat-pemberitahuan/laporan',
							active: true
						}
					]
				}
			]}
		>
			<DataWorkspace title="SPT Dilaporkan">
				<DataTableViewport
					label="Daftar SPT dilaporkan"
					minWidth="1120px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 190px">Aksi</th>
								<th style="width: 130px">Status</th>
								<th style="width: 240px">Jenis SPT</th>
								<th style="width: 130px">Masa Pajak</th>
								<th style="width: 90px">Tahun</th>
								<th style="width: 110px">Pembetulan</th>
								<th style="width: 170px">Dibuat</th>
								<th class="right" style="width: 180px">Kurang/Lebih Bayar</th>
								<th style="width: 150px">Tanggal Lapor</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRows}
							getKey={(row) => `${row.kind}-${row.id}`}
							emptyColspan={9}
							emptyText="Belum ada SPT yang dilaporkan."
						>
							{#snippet row(row)}
								<td class="action-cell">
									{#if row.kind === 'pph-21-26'}
										<form {...newPembetulanSptPph2126.for(row.id)} id={`correct-spt-2126-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
										{#each newPembetulanSptPph2126.for(row.id).fields.allIssues() ?? [] as issue}
											<p role="alert">{issue.message}</p>
										{/each}
									{:else if row.kind === 'pph-badan'}
										<form {...newPembetulanSptPphBadan.for(row.id)} id={`correct-spt-pph-badan-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{:else if row.kind === 'pph-orang-pribadi'}
										<form
											{...newPembetulanSptPphOrangPribadi.for(row.id)}
											id={`correct-spt-pph-op-${row.id}`}
											hidden
										>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{/if}
									<TableActions
										visibleCount={2}
										actions={[
											{ label: 'Lihat', href: detailHref(row) },
											...(row.kind === 'pph-21-26'
												? [{
														label: 'Buat Pembetulan',
														onclick: () => submitForm(`correct-spt-2126-${row.id}`)
													}]
												: row.kind === 'pph-badan'
												? [
														{
															label: 'Buat Pembetulan',
															onclick: () => submitForm(`correct-spt-pph-badan-${row.id}`)
														}
													]
												: row.kind === 'pph-orang-pribadi'
													? [
															{
																label: 'Buat Pembetulan',
																onclick: () => submitForm(`correct-spt-pph-op-${row.id}`)
															}
														]
													: [])
										]}
									/>
								</td>
								<td><StatusBadge label="Dilaporkan" tone="success" /></td>
								<td><strong>{row.jenis}</strong>{#if row.urutan} <StatusBadge label={row.urutan} />{/if}</td>
								<td>{row.masaPajak}</td>
								<td class="number">{row.tahun}</td>
								<td class="number">{row.pembetulanKe}</td>
								<td class="number">{formatTanggalWaktu(row.dibuat)}</td>
								<td class="right amount">
									{#if row.kind === 'pph-21-26'}
										PPh 21: {rupiah.format(row.pasal21 ?? 0)}<br />
										PPh 26: {rupiah.format(row.pasal26 ?? 0)}
									{:else}{rupiah.format(row.kurangLebihBayar)}{/if}
								</td>
								<td class="number">{row.tanggalDilaporkan?.toLocaleDateString('id-ID') ?? '—'}</td>
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

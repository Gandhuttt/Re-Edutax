<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		InstitutionalModal,
		PageLayout,
		PaginationBar,
		SelectField,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		TableActions
	} from '$lib/re-ui-components';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPphOrangPribadi } from '../listSptPphOrangPribadi.remote';
	import { listSptPpn } from '../listSptPpn.remote';
	import { deleteSptPphBadan } from './deleteSptPphBadan.remote';
	import { deleteSptPphOrangPribadi } from './deleteSptPphOrangPribadi.remote';
	import { newSptPphBadan } from './newSptPphBadan.remote';
	import { newSptPphOrangPribadi } from './newSptPphOrangPribadi.remote';
	import { newSptPpn } from './newSptPpn.remote';

	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi';
	type ConceptRow = {
		id: string;
		kind: JenisSpt;
		jenis: string;
		masaPajak: string;
		tahun: number;
		pembetulanKe: number;
		ppnKeluaran: number | null;
		ppnMasukan: number | null;
		kurangLebihBayar: number;
	};

	const rupiah = new Intl.NumberFormat('id-ID');
	const today = new Date();
	const months = Array.from({ length: 12 }, (_, index) => index + 1);
	const years = Array.from({ length: 6 }, (_, index) => today.getFullYear() - 3 + index);
	// Both PPh implementations currently follow verified tax-year-2025 rules only.
	const pphTahunPajakOptions = [2025];
	const jenisSptOptions: { value: JenisSpt; label: string }[] = [
		{ value: 'ppn', label: 'SPT Masa PPN' },
		{ value: 'pph-badan', label: 'SPT Tahunan PPh Badan' },
		{ value: 'pph-orang-pribadi', label: 'SPT Tahunan PPh Orang Pribadi' }
	];

	const [sptPpn, sptPphBadan, sptPphOrangPribadi] = await Promise.all([
		listSptPpn({ status: 'konsep' }),
		listSptPphBadan({ status: 'konsep' }),
		listSptPphOrangPribadi({ status: 'konsep' })
	]);
	const rows = $derived.by((): ConceptRow[] => [
		...sptPpn.map((row) => ({
			id: row.id,
			kind: 'ppn' as const,
			jenis: 'SPT Masa PPN',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			ppnKeluaran: row.totalPpnKeluaran,
			ppnMasukan: row.totalPpnMasukan,
			kurangLebihBayar: row.ppnKurangLebihBayar
		})),
		...sptPphBadan.map((row) => ({
			id: row.id,
			kind: 'pph-badan' as const,
			jenis: 'SPT Tahunan PPh Badan',
			masaPajak: '—',
			tahun: row.tahunPajak,
			pembetulanKe: row.pembetulanKe,
			ppnKeluaran: null,
			ppnMasukan: null,
			kurangLebihBayar: row.pphKurangLebihBayar
		})),
		...sptPphOrangPribadi.map((row) => ({
			id: row.id,
			kind: 'pph-orang-pribadi' as const,
			jenis: 'SPT Tahunan PPh Orang Pribadi',
			masaPajak: '—',
			tahun: row.tahunPajak,
			pembetulanKe: row.pembetulanKe,
			ppnKeluaran: null,
			ppnMasukan: null,
			kurangLebihBayar: row.pphKurangLebihBayar
		}))
	]);

	let sidebarOpen = $state(false);
	let createDialogOpen = $state(false);
	let jenisSpt = $state<JenisSpt>('ppn');
	let masaPajak = $state(today.getMonth() + 1);
	let tahun = $state(today.getFullYear());
	let tahunPajakBadan = $state(pphTahunPajakOptions[0]);
	let tahunPajakOrangPribadi = $state(pphTahunPajakOptions[0]);
	let currentPage = $state(1);
	let pageSize = $state(10);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const pagedRows = $derived(rows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	const creationPending = $derived(
		jenisSpt === 'ppn'
			? newSptPpn.pending > 0
			: jenisSpt === 'pph-badan'
				? newSptPphBadan.pending > 0
				: newSptPphOrangPribadi.pending > 0
	);

	function detailHref(row: ConceptRow) {
		if (row.kind === 'ppn') return `/surat-pemberitahuan/ppn?id=${row.id}`;
		if (row.kind === 'pph-badan') return `/surat-pemberitahuan/pph-badan?id=${row.id}`;
		return `/surat-pemberitahuan/pph-orang-pribadi?id=${row.id}`;
	}

	function submitForm(id: string, confirmation?: string) {
		if (confirmation && !confirm(confirmation)) return;
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head><title>Konsep SPT</title></svelte:head>

{#snippet workspaceActions()}
	<ActionButton onclick={() => (createDialogOpen = true)}>Buat SPT</ActionButton>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/' },
				{ label: 'Surat Pemberitahuan' },
				{ label: 'Konsep SPT' }
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
						{ label: 'Konsep SPT', href: '/surat-pemberitahuan/konsep', active: true },
						{ label: 'Menunggu Pembayaran', href: '/surat-pemberitahuan/pembayaran' },
						{ label: 'SPT Dilaporkan', href: '/surat-pemberitahuan/laporan' }
					]
				}
			]}
		>
			<DataWorkspace title="Konsep SPT" primaryActions={workspaceActions}>
				<DataTableViewport
					label="Daftar konsep SPT"
					minWidth="1300px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 150px">Aksi</th>
								<th style="width: 130px">Status</th>
								<th style="width: 230px">Jenis SPT</th>
								<th style="width: 130px">Masa Pajak</th>
								<th style="width: 90px">Tahun</th>
								<th style="width: 110px">Pembetulan</th>
								<th class="right" style="width: 150px">PPN Keluaran</th>
								<th class="right" style="width: 150px">PPN Masukan</th>
								<th class="right" style="width: 180px">Kurang/Lebih Bayar</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRows}
							getKey={(row) => `${row.kind}-${row.id}`}
							emptyColspan={9}
							emptyText="Belum ada konsep SPT."
						>
							{#snippet row(row)}
								<td class="action-cell">
									{#if row.kind === 'pph-badan'}
										<form {...deleteSptPphBadan} id={`delete-spt-pph-badan-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{:else if row.kind === 'pph-orang-pribadi'}
										<form {...deleteSptPphOrangPribadi} id={`delete-spt-pph-op-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{/if}
									<TableActions
										visibleCount={2}
										actions={[
											{ label: 'Buka', href: detailHref(row) },
											...(row.kind === 'pph-badan'
												? [
														{
															label: 'Hapus',
															danger: true,
															onclick: () =>
																submitForm(
																	`delete-spt-pph-badan-${row.id}`,
																	'Hapus konsep SPT PPh Badan ini?'
																)
														}
													]
												: row.kind === 'pph-orang-pribadi'
													? [
															{
																label: 'Hapus',
																danger: true,
																onclick: () =>
																	submitForm(
																		`delete-spt-pph-op-${row.id}`,
																		'Hapus konsep SPT PPh Orang Pribadi ini?'
																	)
															}
														]
													: [])
										]}
									/>
								</td>
								<td><StatusBadge label="Konsep" tone="attention" /></td>
								<td><strong>{row.jenis}</strong></td>
								<td>{row.masaPajak}</td>
								<td class="number">{row.tahun}</td>
								<td class="number">{row.pembetulanKe}</td>
								<td class="right amount">{row.ppnKeluaran === null ? '—' : rupiah.format(row.ppnKeluaran)}</td>
								<td class="right amount">{row.ppnMasukan === null ? '—' : rupiah.format(row.ppnMasukan)}</td>
								<td class="right amount">{rupiah.format(row.kurangLebihBayar)}</td>
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

<InstitutionalModal
	bind:open={createDialogOpen}
	eyebrow="SURAT PEMBERITAHUAN"
	title="Buat SPT"
	size="wide"
>
	<Stack gap="17px">
		<SelectField
			label="Jenis SPT"
			value={jenisSpt}
			onchange={(value) => (jenisSpt = value as JenisSpt)}
			options={jenisSptOptions}
			required
		/>

		{#if jenisSpt === 'ppn'}
			<form {...newSptPpn} id="form-buat-spt">
				<Stack gap="17px">
					<SelectField
						label="Masa Pajak"
						name="masaPajak"
						bind:value={masaPajak}
						options={months.map((month) => ({ value: month, label: formatMonth(month) }))}
						required
					/>
					<SelectField
						label="Tahun"
						name="tahun"
						bind:value={tahun}
						options={years.map((yearOption) => ({ value: yearOption, label: String(yearOption) }))}
						required
					/>
				</Stack>
			</form>
		{:else if jenisSpt === 'pph-badan'}
			<form {...newSptPphBadan} id="form-buat-spt">
				<SelectField
					label="Tahun Pajak"
					name="tahunPajak"
					bind:value={tahunPajakBadan}
					options={pphTahunPajakOptions.map((yearOption) => ({
						value: yearOption,
						label: String(yearOption)
					}))}
					required
				/>
			</form>
		{:else}
			<form {...newSptPphOrangPribadi} id="form-buat-spt">
				<SelectField
					label="Tahun Pajak"
					name="tahunPajak"
					bind:value={tahunPajakOrangPribadi}
					options={pphTahunPajakOptions.map((yearOption) => ({
						value: yearOption,
						label: String(yearOption)
					}))}
					required
				/>
			</form>
		{/if}
	</Stack>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (createDialogOpen = false)}>Batal</ActionButton>
		<ActionButton
			type="submit"
			form="form-buat-spt"
			pending={creationPending}
			pendingLabel="Membuka..."
		>
			Buat
		</ActionButton>
	{/snippet}
</InstitutionalModal>

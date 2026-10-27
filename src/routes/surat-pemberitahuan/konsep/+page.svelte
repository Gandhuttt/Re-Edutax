<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth, formatTanggalWaktu } from '$lib/helpers/date';
	import { labelUrutanSpt } from '$lib/helpers/sptUrutan';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		InlineAlert,
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
	import { listPeriodeSpt } from './listPeriodeSpt.remote';
	import { deleteSptPpn } from './deleteSptPpn.remote';
	import { deleteSptPphBadan } from './deleteSptPphBadan.remote';
	import { deleteSptPphOrangPribadi } from './deleteSptPphOrangPribadi.remote';
	import { newSptPphBadan } from './newSptPphBadan.remote';
	import { newSptPphOrangPribadi } from './newSptPphOrangPribadi.remote';
	import { newSptPpn } from './newSptPpn.remote';
	import { TAHUN_SPT, TAHUN_SPT_DEFAULT } from './tahunSpt';
	import { listSptPph2126, newSptPph2126, deleteSptPph2126 } from '../spt2126.remote';
	import { SPT2126_YEARS } from '$lib/helpers/spt-pph-2126';
	import { listSptPphUnifikasi, newSptPphUnifikasi, deleteSptPphUnifikasi } from '../sptUnifikasi.remote';
	import { SPT_UNIFIKASI_YEARS } from '$lib/helpers/spt-unifikasi';

	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi' | 'pph-21-26' | 'pph-unifikasi';
	type ConceptRow = {
		id: string;
		kind: JenisSpt;
		jenis: string;
		masaPajak: string;
		tahun: number;
		pembetulanKe: number;
		dibuat: Date;
		urutan: string;
		ppnKeluaran: number | null;
		ppnMasukan: number | null;
		kurangLebihBayar: number;
		pasal21?: number;
		pasal26?: number;
	};

	const rupiah = new Intl.NumberFormat('id-ID');
	const today = new Date();
	const months = Array.from({ length: 12 }, (_, index) => index + 1);
	const tahunOptions = TAHUN_SPT.map((yearOption) => ({
		value: yearOption,
		label: String(yearOption)
	}));
	const jenisSptOptions: { value: JenisSpt; label: string }[] = [
		{ value: 'ppn', label: 'SPT Masa PPN' },
		{ value: 'pph-21-26', label: 'SPT Masa PPh Pasal 21/26' },
		{ value: 'pph-unifikasi', label: 'SPT Masa PPh Unifikasi (BPPU)' },
		{ value: 'pph-badan', label: 'SPT Tahunan PPh Badan' },
		{ value: 'pph-orang-pribadi', label: 'SPT Tahunan PPh Orang Pribadi' }
	];

	// $derived so a refresh() pushed back by deleteSptPpn/deleteSptPphBadan/
	// deleteSptPphOrangPribadi updates the table; a plain `const x = await ...`
	// is read once and would keep showing the deleted row.
	const sptPpn = $derived(await listSptPpn({ status: 'konsep' }));
	const sptPphBadan = $derived(await listSptPphBadan({ status: 'konsep' }));
	const sptPphOrangPribadi = $derived(await listSptPphOrangPribadi({ status: 'konsep' }));
	const sptPph2126 = $derived(await listSptPph2126({ status: 'konsep' }));
	const sptPphUnifikasi = $derived(await listSptPphUnifikasi({ status: 'konsep' }));
	const periodeSpt = $derived(await listPeriodeSpt());
	const rows = $derived.by((): ConceptRow[] => [
		...sptPphUnifikasi.map((row) => ({
			id: row.id,
			kind: 'pph-unifikasi' as const,
			jenis: 'SPT Masa PPh Unifikasi',
			masaPajak: formatMonth(row.masaPajak),
			tahun: row.tahun,
			pembetulanKe: row.pembetulanKe,
			dibuat: row.createdAt,
			urutan: '',
			ppnKeluaran: null,
			ppnMasukan: null,
			kurangLebihBayar: row.kurangLebihBayar
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
			ppnKeluaran: null,
			ppnMasukan: null,
			kurangLebihBayar: row.kurangLebihBayar,
			pasal21: row.kurangLebihBayar21,
			pasal26: row.kurangLebihBayar26
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
			dibuat: row.dibuat,
			urutan: labelUrutanSpt(row),
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
			dibuat: row.dibuat,
			urutan: labelUrutanSpt(row),
			ppnKeluaran: null,
			ppnMasukan: null,
			kurangLebihBayar: row.pphKurangLebihBayar
		}))
	]);

	let sidebarOpen = $state(false);
	let createDialogOpen = $state(false);
	let jenisSpt = $state<JenisSpt>('ppn');
	let masaPajak = $state(today.getMonth() + 1);
	let tahun = $state<number>(
		(TAHUN_SPT as readonly number[]).includes(today.getFullYear())
			? today.getFullYear()
			: TAHUN_SPT_DEFAULT
	);
	let tahunPajakBadan = $state<number>(TAHUN_SPT_DEFAULT);
	let tahunPajakOrangPribadi = $state<number>(TAHUN_SPT_DEFAULT);
	let currentPage = $state(1);
	let pageSize = $state(10);

	// How many normal SPT the taxpayer already holds for the period picked in the dialog, so
	// that opening another one is a deliberate choice rather than a surprise.
	const periodeDipilih = $derived(
		jenisSpt === 'ppn' || jenisSpt === 'pph-21-26' || jenisSpt === 'pph-unifikasi'
			? { tahun: Number(tahun), masaPajak: Number(masaPajak) }
			: {
					tahun: Number(jenisSpt === 'pph-badan' ? tahunPajakBadan : tahunPajakOrangPribadi),
					masaPajak: null
				}
	);
	const jumlahSudahAda = $derived(
		(jenisSpt === 'ppn' || jenisSpt === 'pph-21-26' || jenisSpt === 'pph-unifikasi'
			? (jenisSpt === 'pph-unifikasi' ? periodeSpt.pphUnifikasi : jenisSpt === 'pph-21-26' ? periodeSpt.pph2126 : periodeSpt.ppn).filter(
					(row) => row.tahun === periodeDipilih.tahun && row.masaPajak === periodeDipilih.masaPajak
				)
			: (jenisSpt === 'pph-badan' ? periodeSpt.badan : periodeSpt.orangPribadi).filter(
					(row) => row.tahun === periodeDipilih.tahun
				)
		).length
	);
	const catatanSudahAda = $derived(
		jenisSpt === 'pph-21-26' || jenisSpt === 'pph-unifikasi'
			? 'SPT Normal untuk masa ini sudah ada. Buka SPT yang tersedia; jika sudah dilaporkan, gunakan Buat Pembetulan pada daftar SPT Dilaporkan.'
			: `Anda sudah memiliki ${jumlahSudahAda} ${jenisSptOptions.find((option) => option.value === jenisSpt)?.label} untuk ${
			periodeDipilih.masaPajak === null
				? `tahun pajak ${periodeDipilih.tahun}`
				: `${formatMonth(periodeDipilih.masaPajak)} ${periodeDipilih.tahun}`
		}. SPT baru akan dibuat sebagai SPT ke-${jumlahSudahAda + 1}, bukan pembetulan.`
	);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const pagedRows = $derived(rows.slice((currentPage - 1) * pageSize, currentPage * pageSize));
	const creationPending = $derived(
		jenisSpt === 'pph-unifikasi' ? newSptPphUnifikasi.pending > 0 : jenisSpt === 'pph-21-26' ? newSptPph2126.pending > 0 : jenisSpt === 'ppn'
			? newSptPpn.pending > 0
			: jenisSpt === 'pph-badan'
				? newSptPphBadan.pending > 0
				: newSptPphOrangPribadi.pending > 0
	);

	function detailHref(row: ConceptRow) {
		if (row.kind === 'pph-unifikasi') return `/surat-pemberitahuan/pph-unifikasi?id=${row.id}`;
		if (row.kind === 'pph-21-26') return `/surat-pemberitahuan/pph-21-26?id=${row.id}`;
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
				{ label: 'Beranda', href: '/dashboard' },
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
								<th style="width: 170px">Dibuat</th>
								<th class="right" style="width: 150px">PPN Keluaran</th>
								<th class="right" style="width: 150px">PPN Masukan</th>
								<th class="right" style="width: 180px">Kurang/Lebih Bayar</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedRows}
							getKey={(row) => `${row.kind}-${row.id}`}
							emptyColspan={10}
							emptyText="Belum ada konsep SPT."
						>
							{#snippet row(row)}
								<td class="action-cell">
									{#if row.kind === 'pph-unifikasi'}
										<form {...deleteSptPphUnifikasi.for(row.id)} id={`delete-spt-unifikasi-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
										{#each deleteSptPphUnifikasi.for(row.id).fields.allIssues() ?? [] as issue}
											<p role="alert">{issue.message}</p>
										{/each}
									{:else if row.kind === 'pph-21-26'}
										<form {...deleteSptPph2126.for(row.id)} id={`delete-spt-2126-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
										{#each deleteSptPph2126.for(row.id).fields.allIssues() ?? [] as issue}
											<p role="alert">{issue.message}</p>
										{/each}
									{:else if row.kind === 'ppn'}
										<form {...deleteSptPpn.for(row.id)} id={`delete-spt-ppn-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{:else if row.kind === 'pph-badan'}
										<form {...deleteSptPphBadan.for(row.id)} id={`delete-spt-pph-badan-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{:else}
										<form {...deleteSptPphOrangPribadi.for(row.id)} id={`delete-spt-pph-op-${row.id}`} hidden>
											<input type="hidden" name="id" value={row.id} />
										</form>
									{/if}
									<TableActions
										visibleCount={2}
										actions={[
											{ label: 'Buka', href: detailHref(row) },
											...(row.kind === 'pph-unifikasi'
												? [{
														label: 'Hapus',
														danger: true,
														onclick: () => submitForm(`delete-spt-unifikasi-${row.id}`, 'Hapus konsep SPT Masa PPh Unifikasi ini?')
													}]
												: row.kind === 'pph-21-26'
												? [{
														label: 'Hapus',
														danger: true,
														onclick: () => submitForm(`delete-spt-2126-${row.id}`, 'Hapus konsep SPT Masa PPh 21/26 ini?')
													}]
												: row.kind === 'ppn'
												? [
														{
															label: 'Hapus',
															danger: true,
															onclick: () =>
																submitForm(
																	`delete-spt-ppn-${row.id}`,
																	'Hapus konsep SPT Masa PPN ini?'
																)
														}
													]
												: row.kind === 'pph-badan'
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
													: [
															{
																label: 'Hapus',
																danger: true,
																onclick: () =>
																	submitForm(
																		`delete-spt-pph-op-${row.id}`,
																		'Hapus konsep SPT PPh Orang Pribadi ini?'
																	)
															}
														])
										]}
									/>
								</td>
								<td><StatusBadge label="Konsep" tone="attention" /></td>
								<td><strong>{row.jenis}</strong>{#if row.urutan} <StatusBadge label={row.urutan} />{/if}</td>
								<td>{row.masaPajak}</td>
								<td class="number">{row.tahun}</td>
								<td class="number">{row.pembetulanKe}</td>
								<td class="number">{formatTanggalWaktu(row.dibuat)}</td>
								<td class="right amount">{row.ppnKeluaran === null ? '—' : rupiah.format(row.ppnKeluaran)}</td>
								<td class="right amount">{row.ppnMasukan === null ? '—' : rupiah.format(row.ppnMasukan)}</td>
								<td class="right amount">
									{#if row.kind === 'pph-21-26'}
										PPh 21: {rupiah.format(row.pasal21 ?? 0)}<br />
										PPh 26: {rupiah.format(row.pasal26 ?? 0)}
									{:else}{rupiah.format(row.kurangLebihBayar)}{/if}
								</td>
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
			onchange={(value) => {
				jenisSpt = value as JenisSpt;
				if (jenisSpt === 'pph-unifikasi' && !(SPT_UNIFIKASI_YEARS as readonly number[]).includes(Number(tahun))) tahun = SPT_UNIFIKASI_YEARS[0];
			}}
			options={jenisSptOptions}
			required
		/>

		{#if jenisSpt === 'pph-unifikasi'}
			<InlineAlert tone="info" compact message="SPT Unifikasi ini hanya menggunakan BPPU terbit untuk akun dan masa yang dipilih. Pelaporan serta pembayaran merupakan simulasi lokal." />
			<form {...newSptPphUnifikasi} id="form-buat-spt">
				<Stack gap="17px">
					<SelectField label="Masa Pajak" name="masaPajak" bind:value={masaPajak}
						options={months.map((month) => ({ value: month, label: formatMonth(month) }))} required />
					<SelectField label="Tahun" name="tahun" bind:value={tahun}
						options={SPT_UNIFIKASI_YEARS.map((year) => ({ value: year, label: String(year) }))} required />
				</Stack>
			</form>
		{:else if jenisSpt === 'pph-21-26'}
			<form {...newSptPph2126} id="form-buat-spt">
				<Stack gap="17px">
					<SelectField label="Masa Pajak" name="masaPajak" bind:value={masaPajak}
						options={months.map((month) => ({ value: month, label: formatMonth(month) }))} required />
					<SelectField label="Tahun" name="tahun" bind:value={tahun}
						options={SPT2126_YEARS.map((year) => ({ value: year, label: String(year) }))} required />
				</Stack>
			</form>
		{:else if jenisSpt === 'ppn'}
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
						options={tahunOptions}
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
					options={tahunOptions}
					required
				/>
			</form>
		{:else}
			<form {...newSptPphOrangPribadi} id="form-buat-spt">
				<SelectField
					label="Tahun Pajak"
					name="tahunPajak"
					bind:value={tahunPajakOrangPribadi}
					options={tahunOptions}
					required
				/>
			</form>
		{/if}
		{#if jenisSpt === 'pph-unifikasi'}
			{#each newSptPphUnifikasi.fields.allIssues() ?? [] as issue}
				<InlineAlert tone="error" compact message={issue.message} />
			{/each}
		{:else if jenisSpt === 'pph-21-26'}
			{#each newSptPph2126.fields.allIssues() ?? [] as issue}
				<InlineAlert tone="error" compact message={issue.message} />
			{/each}
		{/if}

		{#if jumlahSudahAda > 0}
			<InlineAlert tone="info" compact message={catatanSudahAda} />
		{/if}
	</Stack>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (createDialogOpen = false)}>Batal</ActionButton>
		<ActionButton
			type="submit"
			form="form-buat-spt"
			pending={creationPending}
			disabled={(jenisSpt === 'pph-21-26' || jenisSpt === 'pph-unifikasi') && jumlahSudahAda > 0}
			pendingLabel="Membuka..."
		>
			Buat
		</ActionButton>
	{/snippet}
</InstitutionalModal>

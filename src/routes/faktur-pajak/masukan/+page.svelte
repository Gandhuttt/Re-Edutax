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
		SelectField,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		TableActions,
		TableFilterField
	} from '$lib/re-ui-components';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { kreditkanFaktur } from './kreditkanFaktur.remote';
	import { listFaktur } from './listFaktur.remote';

	const transactionCodeOptions = await getKodeTransaksiFaktur();
	const invoices = $derived(await listFaktur());

	let sidebarOpen = $state(false);
	let sellerNpwpFilter = $state('');
	let sellerNameFilter = $state('');
	let transactionFilter = $state<string | number>('');
	let invoiceNumberFilter = $state('');
	let monthFilter = $state<string | number>('');
	let statusFilter = $state<string | number>('');
	let currentPage = $state(1);
	let pageSize = $state(50);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const filtersActive = $derived(
		Boolean(
			sellerNpwpFilter ||
				sellerNameFilter ||
				transactionFilter ||
				invoiceNumberFilter ||
				monthFilter ||
				statusFilter
		)
	);
	const filteredInvoices = $derived.by(() => {
		const sellerNpwp = sellerNpwpFilter.trim().toLocaleLowerCase('id-ID');
		const sellerName = sellerNameFilter.trim().toLocaleLowerCase('id-ID');
		const invoiceNumber = invoiceNumberFilter.trim().toLocaleLowerCase('id-ID');

		return invoices.filter((invoice) => {
			const status = statusLabel(invoice.dikreditkan);
			return (
				(!sellerNpwp || invoice.npwpPenjual.toLocaleLowerCase('id-ID').includes(sellerNpwp)) &&
				(!sellerName || String(invoice.namaPenjual ?? '').toLocaleLowerCase('id-ID').includes(sellerName)) &&
				(!transactionFilter || String(invoice.kodeTransaksi) === String(transactionFilter)) &&
				(!invoiceNumber || String(invoice.nomorFaktur ?? '').toLocaleLowerCase('id-ID').includes(invoiceNumber)) &&
				(!monthFilter || String(invoice.masaPajak) === String(monthFilter)) &&
				(!statusFilter || status === String(statusFilter))
			);
		});
	});
	const pagedInvoices = $derived(
		filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	$effect(() => {
		sellerNpwpFilter;
		sellerNameFilter;
		transactionFilter;
		invoiceNumberFilter;
		monthFilter;
		statusFilter;
		currentPage = 1;
	});

	function statusLabel(credited: boolean) {
		return credited ? 'Dikreditkan' : 'Pending';
	}

	function transactionLabel(code: number) {
		const label = transactionCodeOptions.find((option) => option.key === code)?.value;
		return `${String(code).padStart(2, '0')}${label ? ` — ${label}` : ''}`;
	}

	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}

	function resetFilters() {
		sellerNpwpFilter = '';
		sellerNameFilter = '';
		transactionFilter = '';
		invoiceNumberFilter = '';
		monthFilter = '';
		statusFilter = '';
		currentPage = 1;
	}
</script>

<svelte:head><title>Pajak Masukan</title></svelte:head>

{#snippet workspaceTools()}
	<ActionButton tone="quiet" disabled={!filtersActive} onclick={resetFilters}>
		Bersihkan Filter
	</ActionButton>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/' },
				{ label: 'e-Faktur' },
				{ label: 'Pajak Masukan' }
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
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan', active: true }
					]
				}
			]}
		>
			<DataWorkspace title="Pajak Masukan" tools={workspaceTools}>
				<DataTableViewport
					label="Daftar pajak masukan"
					minWidth="1295px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 174px">Aksi</th>
								<th style="width: 180px">NPWP Penjual</th>
								<th style="width: 210px">Nama Penjual</th>
								<th style="width: 265px">Kode Transaksi</th>
								<th style="width: 190px">Nomor Faktur Pajak</th>
								<th style="width: 140px">Masa Pajak</th>
								<th style="width: 136px">Status</th>
							</tr>
							<tr>
								<th><span class="visually-hidden">Filter tabel</span></th>
								<th>
									<TableFilterField
										label="Filter NPWP penjual"
										placeholder="Cari NPWP"
										bind:value={sellerNpwpFilter}
									/>
								</th>
								<th>
									<TableFilterField
										label="Filter nama penjual"
										placeholder="Cari nama"
										bind:value={sellerNameFilter}
									/>
								</th>
								<th>
									<SelectField
										label="Filter kode transaksi"
										labelHidden
										floatingPanel
										bind:value={transactionFilter}
										options={[
											{ value: '', label: 'Semua kode' },
											...transactionCodeOptions.map((option) => ({
												value: option.key,
												label: String(option.key).padStart(2, '0')
											}))
										]}
									/>
								</th>
								<th>
									<TableFilterField
										label="Filter nomor faktur"
										placeholder="Cari nomor"
										bind:value={invoiceNumberFilter}
									/>
								</th>
								<th>
									<SelectField
										label="Filter masa pajak"
										labelHidden
										floatingPanel
										bind:value={monthFilter}
										options={[
											{ value: '', label: 'Semua masa' },
											...Array.from({ length: 12 }, (_, index) => ({
												value: index + 1,
												label: formatMonth(index + 1)
											}))
										]}
									/>
								</th>
								<th>
									<SelectField
										label="Filter status"
										labelHidden
										floatingPanel
										bind:value={statusFilter}
										options={[
											{ value: '', label: 'Semua status' },
											{ value: 'Pending', label: 'Pending' },
											{ value: 'Dikreditkan', label: 'Dikreditkan' }
										]}
									/>
								</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedInvoices}
							getKey={(invoice) => invoice.id}
							emptyColspan={7}
							emptyText="Tidak ada faktur masukan yang sesuai dengan filter."
						>
							{#snippet row(invoice)}
								{@const creditForm = kreditkanFaktur.for(invoice.id)}
								<td class="action-cell">
									<form {...creditForm} id={`credit-invoice-${invoice.id}`} hidden></form>
									<TableActions
										visibleCount={4}
										actions={[
											{ label: 'Lihat', href: `/faktur-pajak/${invoice.id}` },
											...(!invoice.dikreditkan
												? [
														{
															label: 'Kreditkan',
															disabled: creditForm.pending > 0,
															onclick: () => submitForm(`credit-invoice-${invoice.id}`)
														}
													]
												: [])
										]}
									/>
								</td>
								<td><code>{invoice.npwpPenjual}</code></td>
								<td><strong>{invoice.namaPenjual || '—'}</strong></td>
								<td>{transactionLabel(invoice.kodeTransaksi)}</td>
								<td><code>{invoice.nomorFaktur || '—'}</code></td>
								<td>{formatMonth(invoice.masaPajak)}</td>
								<td>
									<StatusBadge
										label={statusLabel(invoice.dikreditkan)}
										tone={invoice.dikreditkan ? 'success' : 'attention'}
									/>
								</td>
							{/snippet}
						</DataTableBody>
					</table>
				</DataTableViewport>
				<PaginationBar
					bind:page={currentPage}
					bind:pageSize
					totalItems={filteredInvoices.length}
					pageSizeOptions={[10, 25, 50, 100]}
					itemLabel="faktur"
				/>
			</DataWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		ActionButton,
		ActionMenu,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DataWorkspace,
		DateField,
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
	import { deleteFaktur } from './deleteFaktur.remote';
	import { importFaktur } from './importFaktur.remote';
	import { listFaktur } from './listFaktur.remote';
	import { newEmpty } from './newEmpty.remote';
	import { undoUploadFaktur } from './undoUploadFaktur.remote';
	import { uploadFaktur } from './uploadFaktur.remote';

	const transactionCodeOptions = await getKodeTransaksiFaktur();
	const invoices = $derived(await listFaktur());
	const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

	let fileInputEl: HTMLInputElement | undefined = $state();
	let sidebarOpen = $state(false);
	let buyerNpwpFilter = $state('');
	let buyerNameFilter = $state('');
	let transactionFilter = $state<string | number>('');
	let invoiceNumberFilter = $state('');
	let invoiceDateFilter = $state('');
	let monthFilter = $state<string | number>('');
	let yearFilter = $state<string | number>('');
	let statusFilter = $state<string | number>('');
	let referenceFilter = $state('');
	let currentPage = $state(1);
	let pageSize = $state(50);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const yearOptions = $derived(
		[...new Set(invoices.map((invoice) => invoice.tahun))]
			.sort((left, right) => right - left)
			.map((year) => ({ value: year, label: String(year) }))
	);
	const filtersActive = $derived(
		Boolean(
			buyerNpwpFilter ||
				buyerNameFilter ||
				transactionFilter ||
				invoiceNumberFilter ||
				invoiceDateFilter ||
				monthFilter ||
				yearFilter ||
				statusFilter ||
				referenceFilter
		)
	);
	const filteredInvoices = $derived.by(() => {
		const buyerNpwp = buyerNpwpFilter.trim().toLocaleLowerCase('id-ID');
		const buyerName = buyerNameFilter.trim().toLocaleLowerCase('id-ID');
		const invoiceNumber = invoiceNumberFilter.trim().toLocaleLowerCase('id-ID');
		const reference = referenceFilter.trim().toLocaleLowerCase('id-ID');

		return invoices.filter((invoice) => {
			const status = statusLabel(invoice.diupload, invoice.dikreditkan);
			return (
				(!buyerNpwp || String(invoice.npwpPembeli ?? '').toLocaleLowerCase('id-ID').includes(buyerNpwp)) &&
				(!buyerName || invoice.namaPembeli.toLocaleLowerCase('id-ID').includes(buyerName)) &&
				(!transactionFilter || String(invoice.kodeTransaksi) === String(transactionFilter)) &&
				(!invoiceNumber || String(invoice.nomorFaktur ?? '').toLocaleLowerCase('id-ID').includes(invoiceNumber)) &&
				(!invoiceDateFilter || invoice.tanggalFaktur === invoiceDateFilter) &&
				(!monthFilter || String(invoice.masaPajak) === String(monthFilter)) &&
				(!yearFilter || String(invoice.tahun) === String(yearFilter)) &&
				(!statusFilter || status === statusFilter) &&
				(!reference || invoice.referensi.toLocaleLowerCase('id-ID').includes(reference))
			);
		});
	});
	const pagedInvoices = $derived(
		filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	$effect(() => {
		buyerNpwpFilter;
		buyerNameFilter;
		transactionFilter;
		invoiceNumberFilter;
		invoiceDateFilter;
		monthFilter;
		yearFilter;
		statusFilter;
		referenceFilter;
		currentPage = 1;
	});

	function submitImport(event: Event) {
		(event.currentTarget as HTMLInputElement).form?.requestSubmit();
	}

	function statusLabel(diupload: boolean, dikreditkan: boolean) {
		if (!diupload) return 'Pending';
		if (!dikreditkan) return 'Uploaded';
		return 'Accepted';
	}

	function statusTone(diupload: boolean, dikreditkan: boolean) {
		if (!diupload) return 'attention' as const;
		if (!dikreditkan) return 'neutral' as const;
		return 'success' as const;
	}

	function transactionLabel(code: number) {
		const label = transactionCodeOptions.find((option) => option.key === code)?.value;
		return `${String(code).padStart(2, '0')}${label ? ` — ${label}` : ''}`;
	}

	function displayDate(value: string) {
		const [year, month, day] = value.split('-');
		return year && month && day ? `${day}/${month}/${year}` : value;
	}

	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}

	function resetFilters() {
		buyerNpwpFilter = '';
		buyerNameFilter = '';
		transactionFilter = '';
		invoiceNumberFilter = '';
		invoiceDateFilter = '';
		monthFilter = '';
		yearFilter = '';
		statusFilter = '';
		referenceFilter = '';
		currentPage = 1;
	}

	// Verbatim shape of the template Coretax itself serves from e-invoice-portal
	// output-tax -> Impor Data -> Unduh Format Data (confirmed by downloading
	// TaxInvoiceTemplate.xml from the live site).
	function downloadTemplate() {
		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<TaxInvoiceBulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="TaxInvoice.xsd">
	<TIN>xxxxxxxxxxxxxxxx</TIN>
	<ListOfTaxInvoice>
		<TaxInvoice>
			<TaxInvoiceDate>2026-08-27</TaxInvoiceDate>
			<TrxCode>01</TrxCode>
			<AddInfo/>
			<CustomDoc/>
			<RefDesc/>
			<BuyerTin>xxxxxxxxxxxxxxxx</BuyerTin>
			<BuyerAdress>Contoh Alamat Pembeli</BuyerAdress>
			<ListOfGoodService>
				<GoodService>
					<Opt>A</Opt>
					<Code>000000</Code>
					<Name>Barang</Name>
					<Unit>UM.0001</Unit>
					<Price>15000</Price>
					<Qty>200</Qty>
					<TotalDiscount>100000</TotalDiscount>
					<OtherTaxBase>2900000</OtherTaxBase>
					<VATRate>11</VATRate>
					<STLGRate>0</STLGRate>
				</GoodService>
			</ListOfGoodService>
		</TaxInvoice>
	</ListOfTaxInvoice>
</TaxInvoiceBulk>`;

		const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'TaxInvoiceTemplate.xml';
		link.click();
		URL.revokeObjectURL(url);
	}

	function downloadXlsxTemplate() {
		const link = document.createElement('a');
		link.href = '/templates/faktur-keluaran-template.xlsx';
		link.download = 'Impor Data Faktur Keluaran.xlsx';
		link.click();
	}
</script>

<svelte:head><title>Pajak Keluaran</title></svelte:head>

<input
	type="file"
	accept=".xml,.xlsx"
	name="file"
	form="import-faktur-form"
	bind:this={fileInputEl}
	onchange={submitImport}
	hidden
/>
<form {...importFaktur} id="import-faktur-form" enctype="multipart/form-data" hidden></form>

{#snippet workspaceActions()}
	<form {...newEmpty}>
		<ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">
			Buat Faktur
		</ActionButton>
	</form>
	<ActionMenu
		label="Impor Data"
		tone="quiet"
		items={[
			{
				label: 'Pilih File',
				onclick: () => fileInputEl?.click()
			},
			{ label: 'Unduh Format XML', onclick: downloadTemplate },
			{ label: 'Unduh Format Excel', onclick: downloadXlsxTemplate }
		]}
	/>
{/snippet}

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
				{ label: 'Pajak Keluaran' }
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
						{ label: 'Pajak Keluaran', href: '/faktur-pajak/keluaran', active: true },
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan' }
					]
				}
			]}
		>
			<DataWorkspace
				title="Pajak Keluaran"
				secondaryActions={workspaceActions}
				tools={workspaceTools}
			>
				<DataTableViewport
					label="Daftar pajak keluaran"
					minWidth="2360px"
					framed={false}
					headerTone="yellow"
					density="compact"
					stickyFirstColumn
				>
					<table>
						<thead>
							<tr>
								<th style="width: 174px">Aksi</th>
								<th style="width: 170px">NPWP Pembeli</th>
								<th style="width: 190px">Nama Pembeli</th>
								<th style="width: 235px">Kode Transaksi</th>
								<th style="width: 180px">Nomor Faktur Pajak</th>
								<th style="width: 130px">Tanggal Faktur</th>
								<th style="width: 130px">Masa Pajak</th>
								<th style="width: 90px">Tahun</th>
								<th style="width: 120px">Status</th>
								<th class="right" style="width: 140px">DPP</th>
								<th class="right" style="width: 150px">DPP Nilai Lain</th>
								<th class="right" style="width: 130px">PPN</th>
								<th class="right" style="width: 130px">PPnBM</th>
								<th style="width: 180px">Referensi</th>
							</tr>
							<tr>
								<th><span class="visually-hidden">Filter tabel</span></th>
								<th>
									<TableFilterField label="Filter NPWP pembeli" placeholder="Cari NPWP" bind:value={buyerNpwpFilter} />
								</th>
								<th>
									<TableFilterField label="Filter nama pembeli" placeholder="Cari nama" bind:value={buyerNameFilter} />
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
									<TableFilterField label="Filter nomor faktur" placeholder="Cari nomor" bind:value={invoiceNumberFilter} />
								</th>
								<th>
									<DateField
										label="Filter tanggal faktur"
										labelHidden
										floatingPanel
										placeholder="Tanggal"
										bind:value={invoiceDateFilter}
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
										label="Filter tahun pajak"
										labelHidden
										floatingPanel
										bind:value={yearFilter}
										options={[{ value: '', label: 'Semua' }, ...yearOptions]}
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
											{ value: 'Uploaded', label: 'Uploaded' },
											{ value: 'Accepted', label: 'Accepted' }
										]}
									/>
								</th>
								<th></th>
								<th></th>
								<th></th>
								<th></th>
								<th>
									<TableFilterField label="Filter referensi" placeholder="Cari referensi" bind:value={referenceFilter} />
								</th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedInvoices}
							getKey={(invoice) => invoice.id}
							emptyColspan={14}
							emptyText="Tidak ada faktur yang sesuai dengan filter."
						>
							{#snippet row(invoice)}
								{@const delFaktur = deleteFaktur.for(invoice.id)}
								{@const upldFaktur = uploadFaktur.for(invoice.id)}
								{@const undupldFaktur = undoUploadFaktur.for(invoice.id)}
								<td class="action-cell">
										<form {...delFaktur} id={`delete-faktur-${invoice.id}`} hidden></form>
										<form {...upldFaktur} id={`upload-faktur-${invoice.id}`} hidden></form>
										<form {...undupldFaktur} id={`withdraw-faktur-${invoice.id}`} hidden></form>
										<TableActions
											visibleCount={4}
											actions={[
												{
													label: invoice.diupload ? 'Lihat' : 'Edit',
													href: `/faktur-pajak/${invoice.id}`
												},
												...(!invoice.diupload
													? [
															{
																label: 'Upload',
																onclick: () => submitForm(`upload-faktur-${invoice.id}`)
															},
															{
																label: 'Hapus',
																danger: true,
																onclick: () => submitForm(`delete-faktur-${invoice.id}`)
															}
														]
													: invoice.diupload && !invoice.dikreditkan
														? [
																{
																	label: 'Tarik',
																	danger: true,
																	onclick: () => submitForm(`withdraw-faktur-${invoice.id}`)
																}
															]
														: [])
											]}
										/>
								</td>
								<td><code>{invoice.npwpPembeli || '—'}</code></td>
								<td><strong>{invoice.namaPembeli || '—'}</strong></td>
								<td>{transactionLabel(invoice.kodeTransaksi)}</td>
								<td><code>{invoice.nomorFaktur || '—'}</code></td>
								<td class="number">{displayDate(invoice.tanggalFaktur)}</td>
								<td>{formatMonth(invoice.masaPajak)}</td>
								<td class="number">{invoice.tahun}</td>
								<td>
									<StatusBadge
										label={statusLabel(invoice.diupload, invoice.dikreditkan)}
										tone={statusTone(invoice.diupload, invoice.dikreditkan)}
									/>
								</td>
								<td class="right amount">{rupiah.format(invoice.dpp)}</td>
								<td class="right amount">{rupiah.format(invoice.dppNilaiLain)}</td>
								<td class="right amount">{rupiah.format(invoice.ppn)}</td>
								<td class="right amount">{rupiah.format(invoice.ppnbm)}</td>
								<td>{invoice.referensi || '—'}</td>
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

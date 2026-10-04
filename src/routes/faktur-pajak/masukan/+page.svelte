<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { applyRupiahInput, formatRupiah, formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		DateField,
		DataWorkspace,
		PageLayout,
		FormActions,
		FormIssueSummary,
		InstitutionalModal,
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
	import { createReturFaktur } from './createReturFaktur.remote';
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
	let returnDialogOpen = $state(false);
	let returnInvoiceId = $state('');
	let returnDate = $state(new Date().toISOString().slice(0, 10));
	let returnLines = $state<
		Array<
			(typeof invoices)[number]['transactions'][number] & {
				selected: boolean;
				jumlahDiretur: number;
				potonganDiretur: number;
				ppnDiretur: number;
				ppnbmDiretur: number;
			}
		>
	>([]);

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const selectedReturnInvoice = $derived(
		invoices.find((invoice) => invoice.id === returnInvoiceId)
	);
	const returnDetails = $derived(
		JSON.stringify(
			returnLines
				.filter((line) => line.selected)
				.map((line) => ({
					transaksiFakturPajakId: line.id,
					jumlahDiretur: line.jumlahDiretur,
					potonganDiretur: line.potonganDiretur,
					ppnDiretur: line.ppnDiretur,
					ppnbmDiretur: line.ppnbmDiretur
				}))
		)
	);
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
		return credited ? 'Dikreditkan' : 'Tidak dikreditkan';
	}

	function transactionLabel(code: number) {
		const label = transactionCodeOptions.find((option) => option.key === code)?.value;
		return `${String(code).padStart(2, '0')}${label ? ` — ${label}` : ''}`;
	}

	function openReturn(invoice: (typeof invoices)[number]) {
		returnInvoiceId = invoice.id;
		returnDate = new Date().toISOString().slice(0, 10);
		returnLines = invoice.transactions
			.filter((line) => line.availableQuantity > 0)
			.map((line) => ({
				...line,
				selected: false,
				jumlahDiretur: 1,
				potonganDiretur: 0,
				ppnDiretur: Math.round(line.amounts.ppn / Math.max(1, line.kuantitas)),
				ppnbmDiretur: Math.round(line.amounts.ppnbm / Math.max(1, line.kuantitas))
			}));
		returnDialogOpen = true;
	}

	function updateReturnQuantity(
		line: (typeof returnLines)[number],
		event: Event & { currentTarget: HTMLInputElement }
	) {
		line.jumlahDiretur = Math.max(
			1,
			Math.min(line.availableQuantity, Number(event.currentTarget.value) || 1)
		);
		const ratio = line.jumlahDiretur / Math.max(1, line.kuantitas);
		line.ppnDiretur = Math.round(line.amounts.ppn * ratio);
		line.ppnbmDiretur = Math.round(line.amounts.ppnbm * ratio);
	}

	function returnDpp(line: (typeof returnLines)[number]) {
		const originalDpp = Math.max(1, line.kuantitas * line.hargaSatuan - line.hargaPotongan);
		const paymentFactor = line.amounts.dpp / originalDpp;
		return Math.max(
			0,
			Math.round(
				(line.jumlahDiretur * line.hargaSatuan - line.potonganDiretur) * paymentFactor
			)
		);
	}

	function returnDppNilaiLain(line: (typeof returnLines)[number]) {
		return Math.round(
			line.amounts.dppNilaiLain * (line.jumlahDiretur / Math.max(1, line.kuantitas))
		);
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
				{ label: 'Beranda', href: '/dashboard' },
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
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan', active: true },
						{ label: 'Retur Pajak Masukan', href: '/faktur-pajak/retur-masukan' },
						{ label: 'Retur Pajak Keluaran', href: '/faktur-pajak/retur-keluaran' }
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
								<th style="width: 210px">Aksi</th>
								<th style="width: 180px">NPWP Penjual</th>
								<th style="width: 210px">Nama Penjual</th>
								<th style="width: 265px">Kode Transaksi</th>
								<th style="width: 190px">Nomor Faktur Pajak</th>
								<th style="width: 140px">Masa Pajak</th>
								<th style="width: 136px">Status</th>
								<th style="width: 130px">Retur</th>
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
											{ value: 'Tidak dikreditkan', label: 'Tidak dikreditkan' },
											{ value: 'Dikreditkan', label: 'Dikreditkan' }
										]}
									/>
								</th>
								<th><span class="visually-hidden">Filter retur</span></th>
							</tr>
						</thead>
						<DataTableBody
							items={pagedInvoices}
							getKey={(invoice) => invoice.id}
							emptyColspan={8}
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
												: []),
											...(invoice.transactions.some((line) => line.availableQuantity > 0)
												? [{ label: 'Buat Retur', onclick: () => openReturn(invoice) }]
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
								<td>
									{#if invoice.returnCount > 0}
										<StatusBadge
											label={`${invoice.returnCount} retur`}
											tone="neutral"
										/>
									{:else}
										—
									{/if}
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

{#if selectedReturnInvoice}
	{@const returnForm = createReturFaktur.for(selectedReturnInvoice.id)}
	<InstitutionalModal
		bind:open={returnDialogOpen}
		eyebrow="RETUR PAJAK MASUKAN"
		title={`Buat Retur ${selectedReturnInvoice.nomorFaktur || ''}`}
		size="large"
		scrollable
		onafterclose={() => {
			returnInvoiceId = '';
			returnLines = [];
		}}
	>
		<form
			{...returnForm.enhance(async (form) => {
				if (await form.submit()) {
					returnDialogOpen = false;
				}
			})}
			class="return-form"
		>
			<DateField
				label="Tanggal Retur"
				field={returnForm.fields.tanggalRetur}
				value={returnDate}
				min={selectedReturnInvoice.tanggalFaktur}
				onchange={(value) => (returnDate = value)}
				required
			/>
			<input
				type="hidden"
				name={returnForm.fields.details.as('text').name}
				value={returnDetails}
			/>

			<FormIssueSummary source={returnForm.fields} />

			<DataTableViewport
				label="Detail barang atau jasa yang diretur"
				minWidth="1780px"
				framed={false}
				headerTone="navy"
				density="compact"
				stickyFirstColumn
			>
				<table>
					<thead>
						<tr>
							<th style="width: 70px">Pilih</th>
							<th style="width: 90px">Tipe</th>
							<th style="width: 190px">Nama</th>
							<th style="width: 110px">Kode</th>
							<th class="right" style="width: 100px">Jumlah</th>
							<th style="width: 120px">Satuan</th>
							<th class="right" style="width: 130px">Harga Satuan</th>
							<th class="right" style="width: 120px">Tarif PPnBM</th>
							<th class="right" style="width: 130px">Jumlah Diretur</th>
							<th class="right" style="width: 150px">Potongan Diretur</th>
							<th class="right" style="width: 140px">DPP Diretur</th>
							<th class="right" style="width: 160px">DPP Nilai Lain</th>
							<th class="right" style="width: 140px">PPN Diretur</th>
							<th class="right" style="width: 140px">PPnBM Diretur</th>
						</tr>
					</thead>
					<tbody>
						{#each returnLines as line (line.id)}
							<tr>
								<td>
									<input
										type="checkbox"
										aria-label={`Retur ${line.nama}`}
										bind:checked={line.selected}
									/>
								</td>
								<td>{line.tipe === 'jasa' ? 'Jasa' : 'Barang'}</td>
								<td><strong>{line.nama}</strong></td>
								<td><code>{line.kodeItem}</code></td>
								<td class="number">{line.kuantitas}</td>
								<td><code>{line.satuanUkur}</code></td>
								<td class="number amount">{formatRupiahDerived(line.hargaSatuan)}</td>
								<td class="number">{line.tarifPpnBm}%</td>
								<td>
									<input
										class="return-input quantity"
										type="number"
										min="1"
										max={line.availableQuantity}
										value={line.jumlahDiretur}
										disabled={!line.selected}
										oninput={(event) => updateReturnQuantity(line, event)}
									/>
								</td>
								<td>
									<input
										class="return-input"
										type="text"
										inputmode="numeric"
										value={formatRupiah(line.potonganDiretur)}
										disabled={!line.selected}
										oninput={(event) => (line.potonganDiretur = applyRupiahInput(event))}
									/>
								</td>
								<td class="number amount">{formatRupiahDerived(returnDpp(line))}</td>
								<td class="number">{formatRupiahDerived(returnDppNilaiLain(line))}</td>
								<td>
									<input
										class="return-input"
										type="text"
										inputmode="numeric"
										value={formatRupiah(line.ppnDiretur)}
										disabled={!line.selected}
										oninput={(event) => (line.ppnDiretur = applyRupiahInput(event))}
									/>
								</td>
								<td>
									<input
										class="return-input"
										type="text"
										inputmode="numeric"
										value={formatRupiah(line.ppnbmDiretur)}
										disabled={!line.selected}
										oninput={(event) => (line.ppnbmDiretur = applyRupiahInput(event))}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</DataTableViewport>

			<FormActions message="Konsep dapat diperiksa sebelum diunggah sebagai retur.">
				<ActionButton
					type="submit"
					pending={returnForm.pending > 0}
					pendingLabel="Menyimpan..."
				>
					Simpan Konsep Retur
				</ActionButton>
			</FormActions>
		</form>
	</InstitutionalModal>
{/if}

<style>
	.return-form {
		display: grid;
		gap: 16px;
	}

	.return-input {
		width: 118px;
		height: 32px;
		padding: 5px 7px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		font: 700 12px var(--ui-font-mono);
		text-align: right;
	}

	.return-input.quantity {
		width: 76px;
	}

	.return-input:disabled {
		background: #e6e5df;
		color: var(--ui-muted);
	}
</style>

<script lang="ts">
	import * as XLSX from 'xlsx';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getWajibPajak } from '../../getWajibPajak.remote';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { deleteFaktur } from './deleteFaktur.remote';
	import { importFaktur } from './importFaktur.remote';
	import { listFaktur } from './listFaktur.remote';
	import { newEmpty } from './newEmpty.remote';
	import { undoUploadFaktur } from './undoUploadFaktur.remote';
	import { uploadFaktur } from './uploadFaktur.remote';

	const transactionCodeOptions = await getKodeTransaksiFaktur();

	let fileInputEl: HTMLInputElement | undefined = $state();

	function submitImport(event: Event) {
		(event.currentTarget as HTMLInputElement).form?.requestSubmit();
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

	// Shape of the real Coretax e-Faktur "Impor Data" Excel template (four
	// sheets: Faktur/DetailFaktur/REF/Keterangan, confirmed against a real
	// filled-in export -- see parseFakturBulkXlsx). REF/Keterangan here are
	// trimmed to what's actually useful to fill the sheet correctly, rather
	// than reproducing every dropdown list Coretax embeds (satuan ukur and
	// kode barang/jasa run into the thousands of rows).
	function downloadXlsxTemplate() {
		const wb = XLSX.utils.book_new();

		const fakturHeader = [
			'Baris',
			'Tanggal Faktur',
			'Jenis Faktur',
			'Kode Transaksi',
			'Keterangan Tambahan',
			'Dokumen Pendukung',
			'Period Dok Pendukung',
			'Referensi',
			'Cap Fasilitas',
			'ID TKU Penjual',
			'NPWP/NIK Pembeli',
			'Jenis ID Pembeli',
			'Negara Pembeli',
			'Nomor Dokumen Pembeli',
			'Nama Pembeli',
			'Alamat Pembeli',
			'Email Pembeli',
			'ID TKU Pembeli'
		];
		const fakturSheet = XLSX.utils.aoa_to_sheet([
			['NPWP Penjual', null, 'xxxxxxxxxxxxxxxx'],
			[],
			fakturHeader,
			[
				1,
				'27/08/2026',
				'Normal',
				'01',
				null,
				null,
				null,
				'Referensi contoh',
				null,
				'xxxxxxxxxxxxxxxx000000',
				'xxxxxxxxxxxxxxxx',
				'TIN',
				'IDN',
				'-',
				'-',
				'Contoh Alamat Pembeli',
				'-',
				'xxxxxxxxxxxxxxxx000000'
			],
			['END']
		]);
		XLSX.utils.book_append_sheet(wb, fakturSheet, 'Faktur');

		const detailHeader = [
			'Baris',
			'Barang/Jasa',
			'Kode Barang Jasa',
			'Nama Barang/Jasa',
			'Nama Satuan Ukur',
			'Harga Satuan',
			'Jumlah Barang Jasa',
			'Total Diskon',
			'DPP',
			'DPP Nilai Lain',
			'Tarif PPN',
			'PPN',
			'Tarif PPnBM',
			'PPnBM'
		];
		const detailSheet = XLSX.utils.aoa_to_sheet([
			detailHeader,
			[1, 'A', '000000', 'Contoh Barang', 'UM.0001', 15000, 200, 100000, 2900000, 2900000, 12, 348000, 0, 0],
			['END']
		]);
		XLSX.utils.book_append_sheet(wb, detailSheet, 'DetailFaktur');

		const refSheet = XLSX.utils.aoa_to_sheet([
			['Kode', 'Keterangan'],
			['Barang/Jasa', 'A'],
			[null, 'Barang'],
			['', 'B'],
			[null, 'Jasa'],
			['Kode Transaksi', ''],
			...transactionCodeOptions.map((option) => [String(option.key).padStart(2, '0'), option.value])
		]);
		XLSX.utils.book_append_sheet(wb, refSheet, 'REF');

		const keteranganSheet = XLSX.utils.aoa_to_sheet([
			['Sheet', 'Kolom', 'Wajib', 'Keterangan'],
			['Faktur', 'Baris', 'Ya', 'Urut dari angka 1, sama dengan Baris pada sheet DetailFaktur'],
			['Faktur', 'Tanggal Faktur', 'Ya', 'Format DD/MM/YYYY'],
			['Faktur', 'Jenis Faktur', 'Ya', 'Selalu diisi: Normal'],
			['Faktur', 'Kode Transaksi', 'Ya', 'Lihat sheet REF, 2 digit (01-10)'],
			['Faktur', 'Keterangan Tambahan', 'Tidak', 'Wajib diisi untuk Kode Transaksi 07 atau 08, format "<kode> - <nama>"'],
			['Faktur', 'Referensi', 'Tidak', ''],
			['Faktur', 'NPWP/NIK Pembeli', 'Ya', ''],
			['Faktur', 'Alamat Pembeli', 'Tidak', "Isikan '-' jika tidak ada"],
			['DetailFaktur', 'Baris', 'Ya', 'Wajib diisi sesuai kolom Baris dari sheet Faktur'],
			['DetailFaktur', 'Barang/Jasa', 'Ya', 'Lihat sheet REF: A = Barang, B = Jasa'],
			['DetailFaktur', 'Kode Barang Jasa', 'Ya', 'Kode barang/jasa tanpa awalan A/B, contoh: 000000'],
			['DetailFaktur', 'Nama Barang/Jasa', 'Ya', ''],
			['DetailFaktur', 'Nama Satuan Ukur', 'Ya', 'Kode satuan ukur, contoh: UM.0001 (lihat pilihan pada form Buat Faktur)'],
			['DetailFaktur', 'Harga Satuan', 'Ya', 'Maks 2 digit di belakang koma'],
			['DetailFaktur', 'Jumlah Barang Jasa', 'Ya', ''],
			['DetailFaktur', 'Total Diskon', 'Ya', "Isikan 0 jika tidak ada"],
			['DetailFaktur', 'DPP Nilai Lain', 'Ya', ''],
			['DetailFaktur', 'Tarif PPN', 'Ya', 'Ikut tarif yang berlaku'],
			['DetailFaktur', 'Tarif PPnBM', 'Ya', "Isikan 0 jika tidak ada"]
		]);
		XLSX.utils.book_append_sheet(wb, keteranganSheet, 'Keterangan');

		const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		const url = URL.createObjectURL(
			new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
		);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'Impor Data Faktur Keluaran.xlsx';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<input
	type="file"
	accept=".xml,.xlsx"
	name="file"
	form="import-faktur-form"
	bind:this={fileInputEl}
	onchange={submitImport}
	class="tw:hidden"
/>
<form {...importFaktur} id="import-faktur-form" enctype="multipart/form-data" class="tw:hidden"
></form>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Faktur Keluaran</span>
				<div class="tw:flex tw:flex-row tw:gap-1">
					<div class="dropdown">
						<button
							type="button"
							class="btn btn-outline-secondary dropdown-toggle"
							data-bs-toggle="dropdown"
							aria-expanded="false">Impor Data</button
						>
						<ul class="dropdown-menu">
							<li>
								<button type="button" class="dropdown-item" onclick={() => fileInputEl?.click()}
									>Pilih File</button
								>
							</li>
							<li>
								<button type="button" class="dropdown-item" onclick={downloadTemplate}
									>Unduh Format Data (XML)</button
								>
							</li>
							<li>
								<button type="button" class="dropdown-item" onclick={downloadXlsxTemplate}
									>Unduh Format Data (Excel)</button
								>
							</li>
						</ul>
					</div>
					<form {...newEmpty}>
						<Button>Buat Faktur</Button>
					</form>
				</div>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[20rem]">Action</th>
							<th class="tw:w-[15rem]">NPWP Pembeli</th>
							<th class="tw:w-[15rem]">Nama Pembeli</th>
							<th class="tw:w-[20rem]">Kode Transaksi</th>
							<th class="tw:w-[15rem]">Nomor Faktur Pajak</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[10rem]">Status</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listFaktur() as { id, npwpPembeli, kodeTransaksi, nomorFaktur, masaPajak, dikreditkan, diupload }}
							{@const delFaktur = deleteFaktur.for(id)}
							{@const upldFaktur = uploadFaktur.for(id)}
							{@const undupldFaktur = undoUploadFaktur.for(id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/faktur-pajak/{id}" class="tw:text-black!">
											<Button>{!diupload ? 'Edit' : 'Lihat'}</Button>
										</a>
										{#if !diupload}
											<form {...delFaktur}><Button class={"tw:text-white"} color="var(--color-danger)">Hapus</Button></form>
											<form {...upldFaktur}><Button class={"tw:text-white"} color="var(--color-secondary)">Upload</Button></form>
										{:else if diupload && !dikreditkan}
											<form {...undupldFaktur}><Button class={"tw:text-white"} color="var(--color-danger)">Tarik</Button></form>
										{/if}
									</div>
								</td>
								<td>{npwpPembeli}</td>
								<td>{(await getWajibPajak({ npwp: npwpPembeli }))?.nama ?? ''}</td>
								<td>{transactionCodeOptions.find((option) => option.key === kodeTransaksi)?.value ?? ''}</td>
								<td>{nomorFaktur}</td>
								<td>{formatMonth(masaPajak)}</td>
								<td>
									{#if !diupload}
										<span>Pending</span>
									{:else if diupload && !dikreditkan}
										<span>Uploaded</span>
									{:else if diupload && dikreditkan}
										<span>Accepted</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/snippet}
				</Table>
			</div>
		{/snippet}
	</Card>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>

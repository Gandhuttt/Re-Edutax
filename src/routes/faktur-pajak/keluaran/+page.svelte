<script lang="ts">
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
									>Unduh Format Data</button
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

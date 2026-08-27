<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';

	let {
		sptItem,
		readonly = true,
		uploadFormId
	}: {
		readonly?: boolean;
		uploadFormId?: string;
		sptItem: {
			iA1: number;
			iA2HargaJual: number;
			iA2DppNilaiLain: number;
			iA2Ppn: number;
			iA2Ppnbm: number;
			iA3HargaJual: number;
			iA3DppNilaiLain: number;
			iA3Ppn: number;
			iA3Ppnbm: number;
			iA4HargaJual: number;
			iA4Ppn: number;
			iA4Ppnbm: number;
			iA5HargaJual: number;
			iA5DppNilaiLain: number;
			iA5Ppn: number;
			iA5Ppnbm: number;
			iA6HargaJual: number;
			iA6DppNilaiLain: number;
			iA6Ppn: number;
			iA6Ppnbm: number;
			iA7HargaJual: number;
			iA7DppNilaiLain: number;
			iA7Ppn: number;
			iA7Ppnbm: number;
			iA8HargaJual: number;
			iA8DppNilaiLain: number;
			iA8Ppn: number;
			iA8Ppnbm: number;
			iA9HargaJual: number;
			iA9DppNilaiLain: number;
			iA9Ppn: number;
			iA9Ppnbm: number;
			iAJumlahHargaJual: number;
			iAJumlahPpn: number;
			iAJumlahPpnbm: number;
			iB: number;
			iC: number;
		};
	} = $props();

	let fileInputEl: HTMLInputElement | undefined = $state();
	let uploadMode: 'add' | 'replace' = $state('add');

	function submitUpload(event: Event) {
		(event.currentTarget as HTMLInputElement).form?.requestSubmit();
	}

	function openUploadPicker(mode: 'add' | 'replace') {
		uploadMode = mode;
		fileInputEl?.click();
	}

	// Verbatim shape of the templates Coretax itself serves from each row's
	// "Unggah XML" menu (confirmed by downloading Retail_IA5/IA9/IB.xml from
	// the live site) -- one shared RetailInvoiceBulk schema, only the
	// TrxCode/example row differs per template.
	const RETAIL_INVOICE_TEMPLATES = {
		IA5: {
			filename: 'Retail_IA5.xml',
			trxCode: 'Normal',
			example: {
				BuyerIdOpt: 'NPWP',
				GoodServiceOpt: 'A',
				SerialNo: '0101010101',
				TransactionDate: '2023-03-20',
				TaxBaseSellingPrice: 2000000,
				OtherTaxBaseSellingPrice: 2000000,
				VAT: 200000,
				STLG: 0
			}
		},
		IA9: {
			filename: 'Retail_IA9.xml',
			trxCode: '07',
			example: {
				BuyerIdOpt: 'NIK',
				GoodServiceOpt: 'B',
				SerialNo: 'string',
				TransactionDate: '2023-03-05',
				TaxBaseSellingPrice: 50000000,
				OtherTaxBaseSellingPrice: 5000000,
				VAT: 5000000,
				STLG: 2000000
			}
		},
		IB: {
			filename: 'Retail_IB.xml',
			trxCode: 'NoVAT',
			example: {
				BuyerIdOpt: 'NPWP',
				GoodServiceOpt: 'A',
				SerialNo: '123184283228',
				TransactionDate: '2023-03-05',
				TaxBaseSellingPrice: 30000000,
				OtherTaxBaseSellingPrice: 3000000,
				VAT: 0,
				STLG: 0
			}
		}
	} as const;

	function downloadTemplate(kind: keyof typeof RETAIL_INVOICE_TEMPLATES) {
		const { filename, trxCode, example } = RETAIL_INVOICE_TEMPLATES[kind];
		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<RetailInvoiceBulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="schema.xsd">
	<TIN>xxxxxxxxxxxxxxxx</TIN>
	<TaxPeriodMonth>1</TaxPeriodMonth>
	<TaxPeriodYear>2026</TaxPeriodYear>
	<ListOfRetailInvoice>
		<RetailInvoice>
			<TrxCode>${trxCode}</TrxCode>
			<BuyerName>Contoh Pembeli</BuyerName>
			<BuyerIdOpt>${example.BuyerIdOpt}</BuyerIdOpt>
			<BuyerIdNumber>xxxxxxxxxxxxxxxx</BuyerIdNumber>
			<GoodServiceOpt>${example.GoodServiceOpt}</GoodServiceOpt>
			<SerialNo>${example.SerialNo}</SerialNo>
			<TransactionDate>${example.TransactionDate}</TransactionDate>
			<TaxBaseSellingPrice>${example.TaxBaseSellingPrice}</TaxBaseSellingPrice>
			<OtherTaxBaseSellingPrice>${example.OtherTaxBaseSellingPrice}</OtherTaxBaseSellingPrice>
			<VAT>${example.VAT}</VAT>
			<STLG>${example.STLG}</STLG>
			<Info/>
		</RetailInvoice>
	</ListOfRetailInvoice>
</RetailInvoiceBulk>`;

		const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<input type="hidden" name="mode" value={uploadMode} form={uploadFormId} />
<input
	type="file"
	accept=".xml"
	name="file"
	form={uploadFormId}
	bind:this={fileInputEl}
	onchange={submitUpload}
	class="tw:hidden"
/>

{#snippet uploadDropdown(kind: keyof typeof RETAIL_INVOICE_TEMPLATES)}
	<div class="dropdown tw:ml-2 tw:inline-block">
		<button
			type="button"
			class="btn btn-sm btn-outline-secondary dropdown-toggle"
			data-bs-toggle="dropdown"
			aria-expanded="false">Unggah XML</button
		>
		<ul class="dropdown-menu">
			<li>
				<button type="button" class="dropdown-item" onclick={() => openUploadPicker('add')}>Tambah</button>
			</li>
			<li>
				<button type="button" class="dropdown-item" onclick={() => openUploadPicker('replace')}>Ganti</button>
			</li>
			<li>
				<button type="button" class="dropdown-item" onclick={() => downloadTemplate(kind)}
					>Download Template</button
				>
			</li>
		</ul>
	</div>
{/snippet}

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th></th>
			<th class="inputHead">Harga Jual/Penggantian/nilai Ekspor/DPP (Rupiah)</th>
			<th class="inputHead">DPP Nilai Lain/DPP (Rupiah)</th>
			<th class="inputHead">PPN (Rupiah)</th>
			<th class="inputHead">PPnBM (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td>A.</td>
			<td colspan="5">Penyerahan BKP/JKP yang terutang PPN</td>
		</tr>
		<tr>
			<td>1.</td>
			<td>Ekspor BKP/BKP Tidak Berwujud/JKP</td>
			<td><Input type={'text'} value={sptItem.iA1} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>2.</td>
			<td>Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan DPP Nilai Lain atau Besaran Tertentu (dengan Faktur Pajak Kode 04 dan 05)</td>
			<td><Input type={'text'} value={sptItem.iA2HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA2DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA2Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA2Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>3.</td>
			<td>Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri kepada turis sesuai dengan Pasal 16E UU PPN (dengan Faktur Pajak Kode 06)</td>
			<td><Input type={'text'} value={sptItem.iA3HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA3DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA3Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA3Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>4.</td>
			<td>Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri lainnya (dengan Faktur Pajak Kode 01, 09 dan 10)</td>
			<td><Input type={'text'} value={sptItem.iA4HargaJual} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iA4Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA4Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>5.</td>
			<td>
				Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan Faktur Pajak yang dilaporkan secara digunggung
				{#if !readonly}{@render uploadDropdown('IA5')}{/if}
			</td>
			<td><Input type={'text'} value={sptItem.iA5HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA5DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA5Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA5Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>6.</td>
			<td>Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut oleh Pemungut PPN (dengan Faktur Pajak Kode 02 dan 03)</td>
			<td><Input type={'text'} value={sptItem.iA6HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA6DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA6Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA6Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>7.</td>
			<td>Penyerahan yang mendapat fasilitas PPN atau PPnBM Tidak Dipungut (dengan Faktur Pajak Kode 07</td>
			<td><Input type={'text'} value={sptItem.iA7HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA7DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA7Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA7Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>8.</td>
			<td>Penyerahan yang mendapat fasilitas PPN atau PPnBM Dibebaskan (dengan Faktur Pajak Kode 08</td>
			<td><Input type={'text'} value={sptItem.iA8HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA8DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA8Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA8Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td>9.</td>
			<td>
				Penyerahan yang mendapat fasilitas PPN atau PPnBM dengan Faktur Pajak yang dilaporkan secara digunggung
				{#if !readonly}{@render uploadDropdown('IA9')}{/if}
			</td>
			<td><Input type={'text'} value={sptItem.iA9HargaJual} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA9DppNilaiLain} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA9Ppn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iA9Ppnbm} disabled /></td>
		</tr>
		<tr>
			<td></td>
			<td>Jumlah (I.A.1 + I.A.2 + I.A.3 + I.A.4 + I.A.5 + I.A.6 + I.A.7 + I.A.8 + I.A.9)</td>
			<td><Input type={'text'} value={sptItem.iAJumlahHargaJual} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.iAJumlahPpn} disabled /></td>
			<td><Input type={'text'} value={sptItem.iAJumlahPpnbm} disabled /></td>
		</tr>
		<tr>
			<td>B.</td>
			<td>
				Penyerahan barang/jasa yang tidak terutang PPN
				{#if !readonly}{@render uploadDropdown('IB')}{/if}
			</td>
			<td><Input type={'text'} value={sptItem.iB} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>C.</td>
			<td>Jumlah seluruh penyerahan barang dan jasa (I.A + I.B)</td>
			<td><Input type={'text'} value={sptItem.iC} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
	{/snippet}
</Table>

<style>
	th,
	td {
		font-size: 0.9rem;
		padding: 0.5rem;
	}
	.inputHead {
		width: 10rem;
		text-align: center;
		vertical-align: middle;
	}
</style>

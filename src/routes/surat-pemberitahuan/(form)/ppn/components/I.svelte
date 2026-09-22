<script lang="ts">
	import {
		ActionMenu,
		DataTableBody,
		DataTableViewport,
		FormField
	} from '$lib/re-ui-components';

	type UploadKind = keyof typeof RETAIL_INVOICE_TEMPLATES;
	type Row = {
		code: string;
		description: string;
		values?: (number | null)[];
		upload?: UploadKind;
		group?: boolean;
		total?: boolean;
	};

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
	// "Unggah XML" menu. Only the TrxCode/example row differs per template.
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

	function downloadTemplate(kind: UploadKind) {
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

	const rows = $derived<Row[]>([
		{ code: 'A.', description: 'Penyerahan BKP/JKP yang terutang PPN', group: true },
		{ code: '1.', description: 'Ekspor BKP/BKP Tidak Berwujud/JKP', values: [sptItem.iA1, null, null, null] },
		{ code: '2.', description: 'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan DPP Nilai Lain atau Besaran Tertentu (dengan Faktur Pajak Kode 04 dan 05)', values: [sptItem.iA2HargaJual, sptItem.iA2DppNilaiLain, sptItem.iA2Ppn, sptItem.iA2Ppnbm] },
		{ code: '3.', description: 'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri kepada turis sesuai dengan Pasal 16E UU PPN (dengan Faktur Pajak Kode 06)', values: [sptItem.iA3HargaJual, sptItem.iA3DppNilaiLain, sptItem.iA3Ppn, sptItem.iA3Ppnbm] },
		{ code: '4.', description: 'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri lainnya (dengan Faktur Pajak Kode 01, 09 dan 10)', values: [sptItem.iA4HargaJual, null, sptItem.iA4Ppn, sptItem.iA4Ppnbm] },
		{ code: '5.', description: 'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan Faktur Pajak yang dilaporkan secara digunggung', values: [sptItem.iA5HargaJual, sptItem.iA5DppNilaiLain, sptItem.iA5Ppn, sptItem.iA5Ppnbm], upload: 'IA5' },
		{ code: '6.', description: 'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut oleh Pemungut PPN (dengan Faktur Pajak Kode 02 dan 03)', values: [sptItem.iA6HargaJual, sptItem.iA6DppNilaiLain, sptItem.iA6Ppn, sptItem.iA6Ppnbm] },
		{ code: '7.', description: 'Penyerahan yang mendapat fasilitas PPN atau PPnBM Tidak Dipungut (dengan Faktur Pajak Kode 07', values: [sptItem.iA7HargaJual, sptItem.iA7DppNilaiLain, sptItem.iA7Ppn, sptItem.iA7Ppnbm] },
		{ code: '8.', description: 'Penyerahan yang mendapat fasilitas PPN atau PPnBM Dibebaskan (dengan Faktur Pajak Kode 08', values: [sptItem.iA8HargaJual, sptItem.iA8DppNilaiLain, sptItem.iA8Ppn, sptItem.iA8Ppnbm] },
		{ code: '9.', description: 'Penyerahan yang mendapat fasilitas PPN atau PPnBM dengan Faktur Pajak yang dilaporkan secara digunggung', values: [sptItem.iA9HargaJual, sptItem.iA9DppNilaiLain, sptItem.iA9Ppn, sptItem.iA9Ppnbm], upload: 'IA9' },
		{ code: '', description: 'Jumlah (I.A.1 + I.A.2 + I.A.3 + I.A.4 + I.A.5 + I.A.6 + I.A.7 + I.A.8 + I.A.9)', values: [sptItem.iAJumlahHargaJual, null, sptItem.iAJumlahPpn, sptItem.iAJumlahPpnbm], total: true },
		{ code: 'B.', description: 'Penyerahan barang/jasa yang tidak terutang PPN', values: [sptItem.iB, null, null, null], upload: 'IB' },
		{ code: 'C.', description: 'Jumlah seluruh penyerahan barang dan jasa (I.A + I.B)', values: [sptItem.iC, null, null, null], total: true }
	]);
	const valueLabels = ['Harga jual/penggantian/nilai ekspor/DPP', 'DPP nilai lain/DPP', 'PPN', 'PPnBM'];
</script>

<input type="hidden" name="mode" value={uploadMode} form={uploadFormId} />
<input
	type="file"
	accept=".xml"
	name="file"
	form={uploadFormId}
	bind:this={fileInputEl}
	onchange={submitUpload}
	class="upload-input"
/>

<div class="amount-table">
	<DataTableViewport
		label="Penyerahan barang dan jasa"
		minWidth="1260px"
		headerTone="navy"
		density="compact"
	>
	<table>
		<thead>
			<tr>
				<th>Kode</th>
				<th>Uraian</th>
				<th class="number">Harga Jual/Penggantian/Nilai Ekspor/DPP (Rupiah)</th>
				<th class="number">DPP Nilai Lain/DPP (Rupiah)</th>
				<th class="number">PPN (Rupiah)</th>
				<th class="number">PPnBM (Rupiah)</th>
			</tr>
		</thead>
		<DataTableBody items={rows} getKey={(row, index) => `${index}-${row.code}`} emptyColspan={6} motion={false}>
			{#snippet row(item)}
				{#if item.group}
					<td><strong>{item.code}</strong></td>
					<td colspan="5"><strong>{item.description}</strong></td>
				{:else}
					<td><strong>{item.code}</strong></td>
					<td class:total-copy={item.total}>
						<div class="description-cell">
							<span>{item.description}</span>
							{#if !readonly && item.upload}
								<ActionMenu
									label="Unggah XML"
									tone="quiet"
									menuLabel={`Unggah XML untuk ${item.code}`}
									items={[
										{ label: 'Tambah', onclick: () => openUploadPicker('add') },
										{ label: 'Ganti', onclick: () => openUploadPicker('replace') },
										{ label: 'Download Template', onclick: () => downloadTemplate(item.upload!) }
									]}
								/>
							{/if}
						</div>
					</td>
					{#each item.values ?? [] as value, index}
						<td class:dash={value === null}>
							{#if value === null}
								<span aria-label="Tidak berlaku">—</span>
							{:else}
								<FormField label={`${valueLabels[index]} ${item.code || 'jumlah'}`} value={String(value)} disabled />
							{/if}
						</td>
					{/each}
				{/if}
			{/snippet}
		</DataTableBody>
		</table>
	</DataTableViewport>
</div>

<style>
	.upload-input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.description-cell {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.total-copy {
		font-weight: 800;
	}

	.dash {
		text-align: center;
		color: var(--ui-muted);
		font-weight: 800;
	}

	.amount-table :global(.table-viewport td label .label) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.amount-table :global(.table-viewport td input) {
		min-width: 8.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>

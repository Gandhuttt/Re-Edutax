<script lang="ts">
	import type { Spt2126Article, Spt2126Detail, Spt2126Input } from '$lib/helpers/spt-pph-2126';
	import { DataTableViewport, FormField, FormSection, SelectField, Stack } from '$lib/re-ui-components';

	let { pasal, total, detail, values, editable, ontouch }: {
		pasal: 21 | 26;
		total: Spt2126Article;
		detail: Spt2126Detail;
		values: Spt2126Input;
		editable: boolean;
		ontouch: () => void;
	} = $props();

	const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
	const kap = $derived(pasal === 21 ? '411121-100' : '411127-100');
	const selectedSource = $derived(pasal === 21 ? values.kompensasi21SumberId : values.kompensasi26SumberId);
	const availableSources = $derived(detail.kompensasiTersedia.filter((source) => source.pasal === pasal));
	const sourceOptions = $derived([
		{ value: '', label: 'Pilih Masa Pajak' },
		...(selectedSource && !availableSources.some((source) => source.id === selectedSource)
			? [{ value: selectedSource, label: 'Masa Pajak pada SPT tersimpan' }] : []),
		...availableSources.map((source) => ({ value: source.id, label: `${String(source.masaPajak).padStart(2, '0')}-${source.tahun} · ${number.format(source.tersedia)}` }))
	]);
	const rows = $derived([
		{ no: 1, label: `PPh Pasal ${pasal} yang dipotong`, value: total.pajak - total.dtp },
		{ no: 2, label: `Kelebihan penyetoran PPh Pasal ${pasal} dari masa pajak sebelumnya`, value: total.kompensasi },
		{ no: 3, label: `Pembayaran Pajak Penghasilan Pasal ${pasal} dengan SP2D (hanya untuk instansi pemerintah)`, value: total.sp2d },
		{ no: 4, label: `PPh Pasal ${pasal} yang kurang (lebih) disetor (1-2-3) (Apabila ada lebih setor akan dikompensasikan)`, value: total.kurangLebihBayar },
		{ no: 5, label: `PPh Pasal ${pasal} yang kurang (lebih) disetor pada SPT yang dibetulkan`, value: total.pembayaranSebelumnya },
		{ no: 6, label: `PPh Pasal ${pasal} yang kurang (lebih) disetor karena pembetulan (4-5) (Apabila ada lebih setor akan dikompensasikan)`, value: total.harusDibayar }
	]);
</script>

<Stack gap="14px">
	<FormSection title={`I. PAJAK PENGHASILAN PASAL ${pasal} YANG DIPOTONG`} padded={false} bordered>
		<DataTableViewport label={`Pajak Penghasilan Pasal ${pasal} yang dipotong`} minWidth="860px" headerTone="navy" density="compact">
			<table>
				<thead><tr><th>No.</th><th>Uraian</th><th>KAP-KJS</th><th class="number">Jumlah (Rp)</th></tr></thead>
				<tbody>
					{#each rows as row (row.no)}
						<tr>
							<td>{row.no}.</td>
							<td>{row.label}</td>
							<td>{row.no === 1 ? kap : ''}</td>
							<td class="number">
								{#if row.no === 2}
									<Stack gap="8px">
										{#if availableSources.length || selectedSource}
											<SelectField label={`Masa Pajak kompensasi PPh ${pasal}`} labelHidden name={`kompensasi${pasal}SumberId`} value={selectedSource ?? ''} options={sourceOptions} disabled={!editable} onchange={ontouch} />
										{:else}<input type="hidden" name={`kompensasi${pasal}SumberId`} value="" />{/if}
										{#if editable && availableSources.length}
											<FormField label={`Kelebihan penyetoran PPh ${pasal}`} labelHidden name={`kompensasi${pasal}`} type="number" min="0" step="1" value={String(pasal === 21 ? values.kompensasi21 : values.kompensasi26)} />
										{:else}
											<input type="hidden" name={`kompensasi${pasal}`} value={pasal === 21 ? values.kompensasi21 : values.kompensasi26} />
											<FormField label={`Kelebihan penyetoran PPh ${pasal}`} labelHidden value={number.format(row.value)} disabled />
										{/if}
									</Stack>
								{:else if row.no === 3}
									{#if editable && values.jenisWajibPajak === 'instansi_pemerintah'}
										<FormField label={`Pembayaran PPh ${pasal} dengan SP2D`} labelHidden name={`sp2d${pasal}`} type="number" min="0" step="1" value={String(pasal === 21 ? values.sp2d21 : values.sp2d26)} />
									{:else}
										<input type="hidden" name={`sp2d${pasal}`} value={pasal === 21 ? values.sp2d21 : values.sp2d26} />
										<FormField label={`Pembayaran PPh ${pasal} dengan SP2D`} labelHidden value={number.format(row.value)} disabled />
									{/if}
								{:else}
									<FormField label={`PPh ${pasal} baris ${row.no}`} labelHidden value={number.format(row.value)} disabled />
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>
	</FormSection>
	<FormSection title={`II. PAJAK PENGHASILAN PASAL ${pasal} YANG DITANGGUNG OLEH PEMERINTAH`} padded={false} bordered>
		<DataTableViewport label={`Pajak Penghasilan Pasal ${pasal} ditanggung pemerintah`} minWidth="860px" headerTone="navy" density="compact">
			<table>
				<thead><tr><th>No.</th><th>Uraian</th><th>KAP-KJS</th><th class="number">Jumlah (Rp)</th></tr></thead>
				<tbody><tr><td>1.</td><td>Pajak Penghasilan Pasal {pasal} ditanggung pemerintah</td><td>{kap}</td><td class="number"><FormField label={`PPh ${pasal} ditanggung pemerintah`} labelHidden value={number.format(total.dtp)} disabled /></td></tr></tbody>
			</table>
		</DataTableViewport>
	</FormSection>
</Stack>

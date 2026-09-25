<script lang="ts">
	import { DataTable, FormSection, InlineAlert, Stack } from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import { hitungLampiranL3A4BagianA } from '../Induk/hitungPphOrangPribadi';

	interface Props {
		namaUsaha: string;
		jenisUsahaPekerjaanBebas: string;
		peredaranBruto: number;
		normaPersen: number;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}
	let { namaUsaha, jenisUsahaPekerjaanBebas, peredaranBruto, normaPersen = $bindable(), dapatDiubah = true, readonly = false }: Props = $props();
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let computed = $derived(hitungLampiranL3A4BagianA([{ namaUsaha, jenisUsahaPekerjaanBebas, peredaranBruto: Number(peredaranBruto), normaPersen: Number(normaPersen) }]));
	let baris = $derived(computed.rows[0]);
	let normaTidakValid = $derived(Number(normaPersen) < 0 || Number(normaPersen) > 100);
</script>

<FormSection number="A" title="Penghasilan Neto Dalam Negeri dari Usaha dan/atau Pekerjaan Bebas Berdasarkan Pencatatan" bordered padded={false}>
	<Stack gap="12px">
		<DataTable label="Penghasilan neto berdasarkan pencatatan" minWidth="960px" framed={false} headerTone="navy" density="compact">
			<table>
				<thead><tr><th scope="col">No.</th><th scope="col">Nama usaha/pekerjaan bebas</th><th scope="col">Jenis usaha/pekerjaan bebas</th><th scope="col">Peredaran bruto (Rp)</th><th scope="col">Norma (%)</th><th scope="col">Penghasilan neto (Rp)</th></tr></thead>
				<tbody>
					<tr>
						<td class="number">1</td>
						<td class="field-cell"><input aria-label="Nama usaha atau pekerjaan bebas" value={namaUsaha} disabled /></td>
						<td class="field-cell"><input aria-label="Jenis usaha atau pekerjaan bebas" value={jenisUsahaPekerjaanBebas} disabled /></td>
						<td class="field-cell"><input class="number" aria-label="Peredaran bruto" value={formatRupiahDerived(baris.peredaranBruto)} disabled /></td>
						<td class="field-cell"><input class="number" aria-label="Norma persen" type="number" min="0" max="100" bind:value={normaPersen} disabled={!bisaEdit} /></td>
						<td class="field-cell"><input class="number" aria-label="Penghasilan neto" value={formatRupiahDerived(baris.penghasilanNeto)} disabled /></td>
					</tr>
				</tbody>
				<tfoot><tr><th scope="row" colspan="3">Jumlah Peredaran Bruto (Rp)</th><td class="number">{formatRupiahDerived(computed.totalPeredaranBruto)}</td><th scope="row">Total Penghasilan Neto</th><td class="number">{formatRupiahDerived(computed.totalPenghasilanNeto)}</td></tr></tfoot>
			</table>
		</DataTable>
		{#if normaTidakValid}<InlineAlert tone="error" compact message="Norma harus lebih dari 0 dan tidak lebih dari 100." />{/if}
		<p>Nama, jenis usaha dan peredaran bruto diambil dari Lampiran 3B Bagian C. Isi kolom Norma (%) untuk menghitung penghasilan neto.</p>
	</Stack>
</FormSection>

<style>
	:global(.field-cell) { min-width: 170px; }
	.field-cell input { width: 100%; height: 34px; padding: 0 9px; border: 1px solid var(--ui-line-strong); border-radius: 3px; background: #fffefa; color: var(--ui-ink); font: inherit; }
	.field-cell input:disabled { background: #e9e7df; color: #666b70; }
	.field-cell input:focus { outline: 3px solid var(--ui-yellow-soft); border-color: var(--ui-navy); }
	p { margin: 0; color: var(--ui-muted); font-size: 14px; font-style: italic; }
</style>

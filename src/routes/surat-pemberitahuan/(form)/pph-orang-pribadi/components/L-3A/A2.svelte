<script lang="ts">
	import { DataTable, FieldGrid, FormSection, InlineAlert, Stack } from '$lib/re-ui-components';
	import { applyRupiahInput } from '$lib/helpers/rupiahInput';
	import { computeNeracaRows, type NeracaAkunTemplate, type NeracaComputedRow } from '../../../pph-badan/components/L1/neracaRollup';
	import type { BarisNeraca } from './types';

	interface AkunRow {
		id: string;
		kode: string | null;
		namaAkun: string;
		rowType: 'header' | 'data' | 'sum';
		section: 'aset' | 'liabilitas_ekuitas';
		parentKode: string | null;
		sign: number | null;
	}
	interface Props { akun: AkunRow[]; neraca: BarisNeraca[]; readonly?: boolean; }
	let { akun, neraca = $bindable(), readonly = false }: Props = $props();
	const rupiah = new Intl.NumberFormat('id-ID');
	const template: NeracaAkunTemplate[] = $derived(akun.map((row, index) => ({ ...row, nomorUrut: index + 1 })));
	const computed = $derived(computeNeracaRows(template, neraca));
	const asetRows = $derived(computed.filter((row) => row.section === 'aset'));
	const liabilitasEkuitasRows = $derived(computed.filter((row) => row.section === 'liabilitas_ekuitas'));
	const jumlahAset = $derived(computed.find((row) => row.kode === '1700')?.nilai ?? 0);
	const jumlahLiabilitasEkuitas = $derived(computed.find((row) => row.kode === '3300')?.nilai ?? 0);
	const seimbang = $derived(jumlahAset === jumlahLiabilitasEkuitas);

	$effect(() => {
		const sudahAda = new Set(neraca.map((row) => row.akunId));
		const kurang = template.filter((row) => row.rowType === 'data' && !sudahAda.has(row.id));
		if (kurang.length > 0) neraca.push(...kurang.map((row) => ({ akunId: row.id, nilai: 0 })));
	});

	const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));
	function handleInput(e: Event, akunId: string) {
		const nilai = applyRupiahInput(e);
		const index = neraca.findIndex((row) => row.akunId === akunId);
		if (index !== -1) neraca[index] = { ...neraca[index], nilai };
	}
</script>

{#snippet neracaTable(rows: NeracaComputedRow[], label: string)}
	<DataTable {label} minWidth="520px" framed={false} headerTone="navy" density="compact">
		<table>
			<thead><tr><th scope="col">Kode akun</th><th scope="col">Akun</th><th scope="col">Nilai</th></tr></thead>
			<tbody>
				{#each rows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header"><th scope="rowgroup" colspan="3">{row.namaAkun}</th></tr>
					{:else}
						<tr class:sum-row={row.rowType === 'sum'}>
							<td>{row.kode}</td><td>{row.namaAkun}</td>
							<td class="number input-cell">
								<input type="text" inputmode="numeric" aria-label={`Nilai ${row.namaAkun}`} value={formatNilai(row.nilai)} readonly={row.rowType !== 'data'} disabled={readonly || row.rowType !== 'data'} oninput={(e) => handleInput(e, row.akunId ?? '')} />
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</DataTable>
{/snippet}

<FormSection number="A.2" title="Laporan Posisi Keuangan (Neraca)" bordered>
	<Stack gap="16px">
		{#if !seimbang}<InlineAlert tone="warning" compact message={`Jumlah Aset (${rupiah.format(jumlahAset)}) harus sama dengan Jumlah Liabilitas dan Ekuitas (${rupiah.format(jumlahLiabilitasEkuitas)}).`} />{/if}
		<FieldGrid columns={2} gap="16px">
			<Stack gap="8px"><strong class="table-title">Aset</strong>{@render neracaTable(asetRows, 'Neraca aset')}</Stack>
			<Stack gap="8px"><strong class="table-title">Liabilitas dan Ekuitas</strong>{@render neracaTable(liabilitasEkuitasRows, 'Neraca liabilitas dan ekuitas')}</Stack>
		</FieldGrid>
	</Stack>
</FormSection>

<style>
	.table-title { color: var(--ui-navy); font-size: 14px; text-transform: uppercase; }
	.group-header th { padding: 10px; background: var(--ui-paper-deep); color: var(--ui-navy); text-align: left; }
	.sum-row td { font-weight: 800; }
	.input-cell input { width: 100%; min-width: 120px; height: 34px; padding: 0 9px; border: 1px solid var(--ui-line-strong); border-radius: 3px; background: #fffefa; color: var(--ui-ink); font: inherit; font-variant-numeric: tabular-nums; text-align: right; }
	.input-cell input:focus { outline: 3px solid var(--ui-yellow-soft); border-color: var(--ui-navy); }
	.input-cell input:disabled { background: #e9e7df; color: #666b70; }
</style>

<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FieldGrid,
		FormSection,
		InstitutionalModal,
		MultiSelectField,
		RupiahField,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import { formatRupiah } from '$lib/helpers/rupiahInput';
	import { computeLabaRugiRows, type LabaRugiAkunTemplate } from '../../../pph-badan/components/L1/labaRugiRollup';
	import type { BarisLabaRugi, KodeKoreksiFiskal } from './types';

	interface AkunRow {
		id: string;
		kode: string | null;
		namaAkun: string;
		rowType: 'header' | 'data' | 'sum';
		classification: 'income' | 'expense' | null;
		parentKode: string | null;
		sign: number | null;
	}

	interface Props {
		akun: AkunRow[];
		labaRugi: BarisLabaRugi[];
		kodeKoreksiFiskal: KodeKoreksiFiskal[];
		readonly?: boolean;
	}

	let { akun, labaRugi = $bindable(), kodeKoreksiFiskal, readonly = false }: Props = $props();

	const kodeKoreksiFiskalOptions = $derived(
		kodeKoreksiFiskal.map((row) => ({
			value: row.kode,
			label: `${row.kode} — ${row.nama}`,
			group: row.jenis === 'positif' ? 'Penyesuaian Fiskal Positif' : 'Penyesuaian Fiskal Negatif'
		}))
	);
	const template: LabaRugiAkunTemplate[] = $derived(
		akun.map((row, index) => ({ ...row, nomorUrut: index + 1 }))
	);
	const byAkunId = $derived(new Map(labaRugi.map((row) => [row.akunId, row])));
	const leafValues = $derived(labaRugi.map((row) => ({ ...row })));
	const computedRows = $derived(computeLabaRugiRows(template, leafValues));
	const formatNilai = (value: number) => (value === 0 ? '' : formatRupiah(value));

	const kosong = (akunId: string): BarisLabaRugi => ({
		akunId,
		nilaiKomersial: 0,
		nonObjekPajak: 0,
		dikenakanPphFinal: 0,
		penyesuaianFiskalPositif: 0,
		penyesuaianFiskalNegatif: 0,
		kodePenyesuaianFiskal: []
	});

	let modalOpen = $state(false);
	let draft = $state<BarisLabaRugi>(kosong(''));
	let draftLabel = $state('');
	let draftHasFiskalSplit = $state(false);
	let draftClassification = $state<'income' | 'expense' | null>(null);
	let errors = $state<Record<string, string>>({});

	function bukaUbah(row: (typeof computedRows)[number]) {
		if (!row.akunId) return;
		draft = { ...(byAkunId.get(row.akunId) ?? kosong(row.akunId)), kodePenyesuaianFiskal: [...(byAkunId.get(row.akunId)?.kodePenyesuaianFiskal ?? [])] };
		draftLabel = `${row.kode} — ${row.namaAkun}`;
		draftHasFiskalSplit = row.hasFiskalSplit;
		draftClassification = row.classification;
		errors = {};
		modalOpen = true;
	}

	let draftTidakFinal = $derived(
		draftHasFiskalSplit
			? draft.nilaiKomersial - draft.nonObjekPajak - draft.dikenakanPphFinal
			: draft.nilaiKomersial
	);
	let draftFiskalSign = $derived(draftClassification === 'expense' ? -1 : 1);
	let draftNilaiFiskal = $derived(
		draftTidakFinal + draftFiskalSign * (draft.penyesuaianFiskalPositif - draft.penyesuaianFiskalNegatif)
	);

	function simpanModal() {
		const adaPenyesuaian = draft.penyesuaianFiskalPositif !== 0 || draft.penyesuaianFiskalNegatif !== 0;
		const next: Record<string, string> = {};
		if (adaPenyesuaian && draft.kodePenyesuaianFiskal.length === 0) next.kodePenyesuaianFiskal = 'Kolom ini wajib diisi!';
		errors = next;
		if (Object.keys(next).length > 0) return;

		const existing = labaRugi.filter((row) => row.akunId !== draft.akunId);
		labaRugi = [...existing, draft];
		modalOpen = false;
	}
</script>

<FormSection number="A.1" title="Laporan Laba Rugi" bordered padded={false}>
	<DataTable label="Laporan laba rugi" minWidth="1440px" framed={false} headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead>
				<tr>
					{#if !readonly}<th scope="col">Tindakan</th>{/if}
					<th scope="col">Kode akun</th><th scope="col">Nama akun</th>
					<th scope="col">Nilai komersial</th><th scope="col">Tidak termasuk objek pajak</th>
					<th scope="col">Dikenakan PPh bersifat final</th><th scope="col">Objek pajak tidak final</th>
					<th scope="col">Penyesuaian fiskal positif</th><th scope="col">Penyesuaian fiskal negatif</th>
					<th scope="col">Kode penyesuaian fiskal</th><th scope="col">Nilai fiskal</th>
				</tr>
			</thead>
			<tbody>
				{#each computedRows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header"><th scope="rowgroup" colspan={readonly ? 10 : 11}>{row.namaAkun}</th></tr>
					{:else}
						<tr class:sum-row={row.rowType === 'sum'}>
							{#if !readonly}<td class="action-cell">{#if row.rowType === 'data'}<TableActions visibleCount={1} actions={[{ label: 'Ubah', onclick: () => bukaUbah(row) }]} />{/if}</td>{/if}
							<td>{row.kode}</td><td>{row.namaAkun}</td>
							<td class="number">{formatNilai(row.nilaiKomersial)}</td>
							<td class="number">{row.hasFiskalSplit || row.rowType !== 'data' ? formatNilai(row.nonObjekPajak) : ''}</td>
							<td class="number">{row.hasFiskalSplit || row.rowType !== 'data' ? formatNilai(row.dikenakanPphFinal) : ''}</td>
							<td class="number">{formatNilai(row.objekPajakTidakFinal)}</td>
							<td class="number">{formatNilai(row.penyesuaianFiskalPositif)}</td>
							<td class="number">{formatNilai(row.penyesuaianFiskalNegatif)}</td>
							<td>{row.kodePenyesuaianFiskal.join(', ')}</td><td class="number">{formatNilai(row.nilaiFiskal)}</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</DataTable>
</FormSection>

<InstitutionalModal bind:open={modalOpen} eyebrow="LAMPIRAN L-3A" title={draftLabel} size="large" scrollable>
	<Stack gap="18px">
		<FieldGrid gap="14px 16px">
			<RupiahField label="Nilai Komersial" bind:value={draft.nilaiKomersial} required />
			<RupiahField label="Tidak Termasuk Objek Pajak" bind:value={draft.nonObjekPajak} disabled={!draftHasFiskalSplit} />
			<RupiahField label="Dikenakan PPh Bersifat Final" bind:value={draft.dikenakanPphFinal} disabled={!draftHasFiskalSplit} />
			<RupiahField label="Objek Pajak Tidak Final" value={draftTidakFinal} disabled />
			<RupiahField label="Penyesuaian Fiskal Positif" bind:value={draft.penyesuaianFiskalPositif} />
			<RupiahField label="Penyesuaian Fiskal Negatif" bind:value={draft.penyesuaianFiskalNegatif} />
			<MultiSelectField label="Kode Penyesuaian Fiskal" bind:value={draft.kodePenyesuaianFiskal} options={kodeKoreksiFiskalOptions} placeholder="Tidak ada" error={errors.kodePenyesuaianFiskal} />
			<RupiahField label="Nilai Fiskal (Sebelum Fasilitas Perpajakan)" value={draftNilaiFiskal} disabled />
		</FieldGrid>
	</Stack>
	{#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

<style>
	.group-header th { padding: 10px; background: var(--ui-paper-deep); color: var(--ui-navy); text-align: left; }
	.sum-row td { font-weight: 800; }
</style>

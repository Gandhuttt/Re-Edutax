<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FieldGrid,
		FormField,
		FormSection,
		InstitutionalModal,
		RupiahField,
		SelectField,
		TableActions
	} from '$lib/re-ui-components';
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from '../referensi';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import type { BarisLainnya } from './types';

	interface Props { rows: BarisLainnya[]; referensi: DaftarReferensi; kodeReferensi: KodeReferensi; dapatDiubah?: boolean; readonly?: boolean; }
	let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();
	const kosong = (): BarisLainnya => ({ kode: '', jenisPenghasilan: '', penghasilanNeto: 0 });
	let modalOpen = $state(false);
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisLainnya>(kosong());
	let kode = $derived(kodeUntuk(kodeReferensi, 'l3a4_b_jenis_penghasilan', draft.jenisPenghasilan));
	let errors = $state<Record<string, string>>({});
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.penghasilanNeto || 0), 0));
	let jenisOptions = $derived((referensi.l3a4_b_jenis_penghasilan ?? []).map((value) => ({ value, label: value })));

	function bukaTambah() { indeksDiubah = null; draft = kosong(); errors = {}; modalOpen = true; }
	function bukaUbah(index: number) { indeksDiubah = index; draft = { ...rows[index] }; errors = {}; modalOpen = true; }
	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
		if (!draft.penghasilanNeto) next.penghasilanNeto = 'Kolom ini wajib diisi!';
		errors = next;
		if (Object.keys(next).length > 0) return;
		draft.kode = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalOpen = false;
	}
	function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
	function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian B?`)) rows = []; }
</script>

<FormSection number="B" title="Penghasilan Neto Dalam Negeri Lainnya" bordered padded={false}>
	{#snippet actions()}{#if bisaEdit}<ActionButton onclick={bukaTambah}>Tambah</ActionButton><ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>{/if}{/snippet}
	<DataTable label="Penghasilan neto dalam negeri lainnya" minWidth="760px" framed={false} headerTone="navy" density="compact" stickyFirstColumn>
		<table>
			<thead><tr>{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Kode</th><th scope="col">Jenis penghasilan</th><th scope="col">Penghasilan neto</th></tr></thead>
			<tbody>
				{#each rows as row, index}
					<tr>{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: 'Ubah', onclick: () => bukaUbah(index) }, { label: 'Hapus', danger: true, onclick: () => hapus(index) }]} /></td>{/if}<td>{index + 1}</td><td>{row.kode}</td><td>{row.jenisPenghasilan}</td><td class="number amount">{formatRupiahDerived(row.penghasilanNeto)}</td></tr>
				{:else}<tr><td colspan={bisaEdit ? 5 : 4} class="empty">Tidak ada data untuk ditampilkan.</td></tr>{/each}
			</tbody>
			<tfoot><tr><th scope="row" colspan={bisaEdit ? 4 : 3}>Jumlah</th><td class="number amount">{formatRupiahDerived(total)}</td></tr></tfoot>
		</table>
	</DataTable>
</FormSection>

<InstitutionalModal bind:open={modalOpen} eyebrow="LAMPIRAN L-3A-4" title="Penghasilan Neto Dalam Negeri Lainnya" size="wide">
	<FieldGrid columns={2}>
		<FormField label="Kode" value={kode} readonly />
		<SelectField label="Jenis Penghasilan" bind:value={draft.jenisPenghasilan} options={jenisOptions} placeholder="Silakan pilih" required error={errors.jenisPenghasilan} />
		<RupiahField label="Penghasilan Neto" bind:value={draft.penghasilanNeto} required error={errors.penghasilanNeto} />
	</FieldGrid>
	{#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from '../referensi';
	import type { BarisBukanObjek } from './types';

	interface Props {
		rows: BarisBukanObjek[];
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

	const kosong = (): BarisBukanObjek => ({
		kode: '',
		jenisPenghasilan: '',
		npwpSumber: '',
		namaSumber: '',
		penghasilanBruto: 0
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisBukanObjek>(kosong());
	let modalOpen = $state(false);
	let errors = $state<Record<string, string>>({});

	let kode = $derived(kodeUntuk(kodeReferensi, 'l2_b_jenis_penghasilan', draft.jenisPenghasilan));
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.penghasilanBruto || 0), 0));
	let jenisOptions = $derived([
		{ value: '', label: 'Silakan pilih' },
		...(referensi.l2_b_jenis_penghasilan ?? []).map((label) => ({ value: label, label }))
	]);

	function bukaTambah() {
		indeksDiubah = null;
		draft = kosong();
		errors = {};
		modalOpen = true;
	}

	function bukaUbah(index: number) {
		indeksDiubah = index;
		draft = { ...rows[index] };
		errors = {};
		modalOpen = true;
	}

	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
		if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
		errors = next;
		if (Object.keys(next).length > 0) return;

		draft.kode = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalOpen = false;
	}

	function hapus(index: number) {
		rows = rows.filter((_, rowIndex) => rowIndex !== index);
	}

	function hapusSemua() {
		if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian B?`)) rows = [];
	}
</script>

<Stack gap="12px">
	{#if bisaEdit}
		<Stack direction="horizontal" align="end">
			<ActionButton onclick={bukaTambah}>Tambah</ActionButton>
			<ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
		</Stack>
	{/if}

	<DataTable label="Penghasilan yang tidak termasuk objek pajak" minWidth="980px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					{#if bisaEdit}<th scope="col">Tindakan</th>{/if}
					<th scope="col">No.</th>
					<th scope="col">Kode</th>
					<th scope="col">Jenis Penghasilan</th>
					<th scope="col">Sumber Penghasilan</th>
					<th scope="col" class="right">Penghasilan Bruto</th>
					<th scope="col">NIK/NPWP</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row, index}
					<tr>
						{#if bisaEdit}
							<td class="action-cell">
								<TableActions
									actions={[
										{ label: 'Ubah', onclick: () => bukaUbah(index) },
										{ label: 'Hapus', danger: true, onclick: () => hapus(index) }
									]}
								/>
							</td>
						{/if}
						<td>{index + 1}</td>
						<td>{row.kode}</td>
						<td>{row.jenisPenghasilan}</td>
						<td>{row.namaSumber}</td>
						<td class="right amount">{formatRupiahDerived(row.penghasilanBruto)}</td>
						<td>{row.npwpSumber}</td>
					</tr>
				{:else}
					<tr><td colspan={bisaEdit ? 7 : 6} class="empty">Tidak ada data yang ditemukan.</td></tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan={bisaEdit ? 5 : 4}>Jumlah Tabel B</th>
					<td class="right amount">{formatRupiahDerived(total)}</td>
					<td></td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Penghasilan yang Tidak Termasuk Objek Pajak" size="wide">
	<FieldGrid>
		<FormField label="Kode" value={kode} readonly />
		<SelectField label="Jenis Penghasilan" bind:value={draft.jenisPenghasilan} options={jenisOptions} required error={errors.jenisPenghasilan} />
		<FormField label="NPWP Sumber Penghasilan" bind:value={draft.npwpSumber} error={errors.npwpSumber} />
		<FormField label="Nama Sumber Penghasilan" bind:value={draft.namaSumber} error={errors.namaSumber} />
		<RupiahField label="Penghasilan Bruto" bind:value={draft.penghasilanBruto} required error={errors.penghasilanBruto} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

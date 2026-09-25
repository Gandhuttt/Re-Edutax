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
	import type { BarisFinal } from './types';

	interface Props {
		rows: BarisFinal[];
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

	const kosong = (): BarisFinal => ({
		npwpPemotong: '',
		namaPemotong: '',
		kodeObjekPajak: '',
		jenisPenghasilan: '',
		dasarPengenaanPajak: 0,
		pphTerutang: 0
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisFinal>(kosong());
	let modalOpen = $state(false);
	let errors = $state<Record<string, string>>({});

	let kode = $derived(kodeUntuk(kodeReferensi, 'l2_a_jenis_penghasilan', draft.jenisPenghasilan));
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let totalDpp = $derived(rows.reduce((sum, row) => sum + Number(row.dasarPengenaanPajak || 0), 0));
	let jenisOptions = $derived([
		{ value: '', label: 'Silakan pilih' },
		...(referensi.l2_a_jenis_penghasilan ?? []).map((label) => ({ value: label, label }))
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
		if (!draft.npwpPemotong) next.npwpPemotong = 'Kolom ini wajib diisi!';
		if (!draft.namaPemotong) next.namaPemotong = 'Kolom ini wajib diisi!';
		if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
		if (!draft.dasarPengenaanPajak) next.dasarPengenaanPajak = 'Kolom ini wajib diisi!';
		if (!draft.pphTerutang) next.pphTerutang = 'Kolom ini wajib diisi!';
		errors = next;
		if (Object.keys(next).length > 0) return;

		draft.kodeObjekPajak = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalOpen = false;
	}

	function hapus(index: number) {
		rows = rows.filter((_, rowIndex) => rowIndex !== index);
	}
</script>

<Stack gap="12px">
	{#if bisaEdit}
		<Stack direction="horizontal" align="end">
			<ActionButton onclick={bukaTambah}>Tambah</ActionButton>
		</Stack>
	{/if}

	<DataTable label="Penghasilan yang dikenakan PPh bersifat final" minWidth="1120px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					{#if bisaEdit}<th scope="col">Tindakan</th>{/if}
					<th scope="col">No.</th>
					<th scope="col">NPWP Pemotong/Pemungut</th>
					<th scope="col">Nama Pemotong/Pemungut</th>
					<th scope="col">Kode Objek Pajak</th>
					<th scope="col">Jenis Penghasilan</th>
					<th scope="col" class="right">Dasar Pengenaan Pajak (Rupiah)</th>
					<th scope="col" class="right">PPh Terutang</th>
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
						<td>{row.npwpPemotong}</td>
						<td>{row.namaPemotong}</td>
						<td>{row.kodeObjekPajak}</td>
						<td>{row.jenisPenghasilan}</td>
						<td class="right amount">{formatRupiahDerived(row.dasarPengenaanPajak)}</td>
						<td class="right amount">{formatRupiahDerived(row.pphTerutang)}</td>
					</tr>
				{:else}
					<tr><td colspan={bisaEdit ? 8 : 7} class="empty">Tidak ada data yang ditemukan.</td></tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan={bisaEdit ? 6 : 5}>Jumlah Tabel A</th>
					<td class="right amount">{formatRupiahDerived(totalDpp)}</td>
					<td></td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Penghasilan yang Dikenakan Pajak Penghasilan Bersifat Final" size="wide" scrollable>
	<Stack gap="18px">
		<FieldGrid>
			<FormField label="NPWP Pemotong/Pemungut" bind:value={draft.npwpPemotong} required error={errors.npwpPemotong} />
			<FormField label="Nama Pemotong/Pemungut" bind:value={draft.namaPemotong} required error={errors.namaPemotong} />
			<FormField label="Kode Objek Pajak" value={kode} readonly />
			<SelectField label="Jenis Penghasilan" bind:value={draft.jenisPenghasilan} options={jenisOptions} required error={errors.jenisPenghasilan} />
			<RupiahField label="Dasar Pengenaan Pajak" bind:value={draft.dasarPengenaanPajak} required error={errors.dasarPengenaanPajak} />
			<RupiahField label="PPh Terutang" bind:value={draft.pphTerutang} required error={errors.pphTerutang} />
		</FieldGrid>
	</Stack>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

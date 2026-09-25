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
	} from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
	import type { BarisUtang } from "./types";

	interface Props {
		rows: BarisUtang[];
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();
	const kosong = (): BarisUtang => ({
		kode: "", deskripsi: "", nikNpwpKreditur: "", namaKreditur: "",
		negaraKreditur: "", tahunPeminjaman: 0, saldo: 0, keterangan: ""
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisUtang>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let kode = $derived(kodeUntuk(kodeReferensi, "l1_b_deskripsi", draft.deskripsi));
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.saldo || 0), 0));
	let deskripsiOptions = $derived([
		{ value: "", label: "Silakan pilih" },
		...(referensi.l1_b_deskripsi ?? []).map((value) => ({ value, label: value }))
	]);
	let negaraOptions = $derived([
		{ value: "", label: "Silakan pilih" },
		...(referensi.negara ?? []).map((value) => ({ value, label: value }))
	]);
	let keteranganOptions = $derived([
		{ value: "", label: "Silakan pilih" },
		...(referensi.l1_b_keterangan ?? []).map((value) => ({ value, label: value }))
	]);

	function bukaTambah() {
		indeksDiubah = null;
		draft = kosong();
		errors = {};
		modalTerbuka = true;
	}
	function bukaUbah(index: number) {
		indeksDiubah = index;
		draft = { ...rows[index] };
		errors = {};
		modalTerbuka = true;
	}
	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.deskripsi) next.deskripsi = "Kolom ini wajib diisi!";
		if (!draft.nikNpwpKreditur) next.nikNpwpKreditur = "Kolom ini wajib diisi!";
		if (!draft.namaKreditur) next.namaKreditur = "Kolom ini wajib diisi!";
		if (!draft.negaraKreditur) next.negaraKreditur = "Kolom ini wajib diisi!";
		if (!draft.saldo) next.saldo = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		draft.kode = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalTerbuka = false;
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
	<DataTable label="Utang pada akhir tahun pajak" minWidth="1120px" headerTone="navy" density="compact">
		<table>
			<thead><tr>
				{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Kode</th>
				<th scope="col">Deskripsi</th><th scope="col">Kreditur</th><th scope="col">Negara Kreditur</th>
				<th scope="col">Tahun Peminjaman</th><th scope="col" class="right">Saldo</th><th scope="col">Keterangan</th>
				<th scope="col">Nomor Identitas WP</th>
			</tr></thead>
			<tbody>
				{#each rows as row, index}<tr>
					{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
					<td>{index + 1}</td><td>{row.kode}</td><td>{row.deskripsi}</td><td>{row.namaKreditur}</td>
					<td>{row.negaraKreditur}</td><td>{row.tahunPeminjaman}</td><td class="number amount">{formatRupiahDerived(row.saldo)}</td>
					<td>{row.keterangan}</td><td>{row.nikNpwpKreditur}</td>
				</tr>{:else}<tr><td colspan={bisaEdit ? 10 : 9} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}
			</tbody>
			<tfoot><tr><th scope="row" colspan={bisaEdit ? 7 : 6}>Jumlah Bagian B</th><td class="number amount">{formatRupiahDerived(total)}</td><td colspan="2"></td></tr></tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalTerbuka} title="Utang pada Akhir Tahun Pajak" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Kode" value={kode} readonly />
		<SelectField label="Deskripsi" bind:value={draft.deskripsi} options={deskripsiOptions} error={errors.deskripsi} required />
		<FormField label="NIK/NPWP Kreditur" bind:value={draft.nikNpwpKreditur} error={errors.nikNpwpKreditur} required />
		<FormField label="Nama Kreditur" bind:value={draft.namaKreditur} error={errors.namaKreditur} required />
		<SelectField label="Negara Kreditur" bind:value={draft.negaraKreditur} options={negaraOptions} error={errors.negaraKreditur} required />
		<FormField label="Tahun Peminjaman" type="number" value={draft.tahunPeminjaman ? String(draft.tahunPeminjaman) : ""} oninput={(event) => (draft.tahunPeminjaman = event.currentTarget.valueAsNumber || 0)} error={errors.tahunPeminjaman} />
		<RupiahField label="Saldo" bind:value={draft.saldo} error={errors.saldo} required />
		<SelectField label="Keterangan" bind:value={draft.keterangan} options={keteranganOptions} error={errors.keterangan} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

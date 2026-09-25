<script lang="ts">
	import { ActionButton, DataTable, FieldGrid, FormField, FormSection, InstitutionalModal, RupiahField, SelectField, TableActions } from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
	import type { BarisA4 } from "./types";

	interface Props { rows: BarisA4[]; referensi: DaftarReferensi; kodeReferensi: KodeReferensi; readonly?: boolean; }
	let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();
	const kosong = (): BarisA4 => ({
		kode: "", deskripsi: "", merkModel: "", nomorPolisiRegistrasi: "", kepemilikan: "",
		nomorIdentitasPemilik: "", namaPemilik: "", tahunPerolehan: 0,
		hargaPerolehan: 0, nilaiSaatIni: 0, keterangan: ""
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisA4>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let kode = $derived(kodeUntuk(kodeReferensi, "l1_a4_tipe", draft.deskripsi));
	let bisaEdit = $derived(!readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.nilaiSaatIni || 0), 0));
	let tipeOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l1_a4_tipe ?? []).map((value) => ({ value, label: value }))]);
	let kepemilikanOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l1_a4_kepemilikan ?? []).map((value) => ({ value, label: value }))]);
	let keteranganOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.keterangan_pps ?? []).map((value) => ({ value, label: value }))]);

	function bukaTambah() { indeksDiubah = null; draft = kosong(); errors = {}; modalTerbuka = true; }
	function bukaUbah(index: number) { indeksDiubah = index; draft = { ...rows[index] }; errors = {}; modalTerbuka = true; }
	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.deskripsi) next.deskripsi = "Kolom ini wajib diisi!";
		if (!draft.merkModel) next.merkModel = "Kolom ini wajib diisi!";
		if (!draft.nomorPolisiRegistrasi) next.nomorPolisiRegistrasi = "Kolom ini wajib diisi!";
		if (!draft.kepemilikan) next.kepemilikan = "Kolom ini wajib diisi!";
		if (!draft.nomorIdentitasPemilik) next.nomorIdentitasPemilik = "Kolom ini wajib diisi!";
		if (!draft.namaPemilik) next.namaPemilik = "Kolom ini wajib diisi!";
		if (!draft.tahunPerolehan) next.tahunPerolehan = "Kolom ini wajib diisi!";
		if (!draft.hargaPerolehan) next.hargaPerolehan = "Kolom ini wajib diisi!";
		if (!draft.nilaiSaatIni) next.nilaiSaatIni = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		draft.kode = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalTerbuka = false;
	}
	function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
	function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 4?`)) rows = []; }
</script>

<FormSection number="4" title="HARTA BERGERAK" bordered padded={false}>
	{#snippet actions()}{#if bisaEdit}<ActionButton onclick={bukaTambah}>Tambah</ActionButton><ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>{/if}{/snippet}
	<DataTable label="Harta bergerak" minWidth="1420px" framed={false} headerTone="navy" density="compact">
		<table>
			<thead><tr>{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Kode</th><th scope="col">Tipe</th><th scope="col">Merk/Model</th><th scope="col">Nomor Polisi/Registrasi</th><th scope="col">Kepemilikan</th><th scope="col">NIK/NPWP Pemilik</th><th scope="col">Nama Pemilik</th><th scope="col">Tahun Perolehan</th><th scope="col" class="right">Harga Perolehan</th><th scope="col" class="right">Nilai Saat Ini</th><th scope="col">Keterangan</th></tr></thead>
			<tbody>{#each rows as row, index}<tr>
				{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
				<td>{index + 1}</td><td>{row.kode}</td><td>{row.deskripsi}</td><td>{row.merkModel}</td><td>{row.nomorPolisiRegistrasi}</td><td>{row.kepemilikan}</td><td>{row.nomorIdentitasPemilik}</td><td>{row.namaPemilik}</td><td>{row.tahunPerolehan}</td><td class="number amount">{formatRupiahDerived(row.hargaPerolehan)}</td><td class="number amount">{formatRupiahDerived(row.nilaiSaatIni)}</td><td>{row.keterangan}</td>
			</tr>{:else}<tr><td colspan={bisaEdit ? 13 : 12} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}</tbody>
			<tfoot><tr><th scope="row" colspan={bisaEdit ? 11 : 10}>Jumlah Tabel 4</th><td class="number amount">{formatRupiahDerived(total)}</td><td></td></tr></tfoot>
		</table>
	</DataTable>
</FormSection>

<InstitutionalModal bind:open={modalTerbuka} title="Harta Bergerak" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Kode" value={kode} readonly />
		<SelectField label="Tipe" bind:value={draft.deskripsi} options={tipeOptions} error={errors.deskripsi} required />
		<FormField label="Merk/Model" bind:value={draft.merkModel} error={errors.merkModel} required />
		<FormField label="Nomor Polisi/Registrasi" bind:value={draft.nomorPolisiRegistrasi} error={errors.nomorPolisiRegistrasi} required />
		<SelectField label="Kepemilikan" bind:value={draft.kepemilikan} options={kepemilikanOptions} error={errors.kepemilikan} required />
		<FormField label="Nomor Identitas Pemilik (NIK/NPWP)" bind:value={draft.nomorIdentitasPemilik} error={errors.nomorIdentitasPemilik} required />
		<FormField label="Nama Pemilik" bind:value={draft.namaPemilik} error={errors.namaPemilik} required />
		<FormField label="Tahun Perolehan" type="number" value={draft.tahunPerolehan ? String(draft.tahunPerolehan) : ""} oninput={(event) => (draft.tahunPerolehan = event.currentTarget.valueAsNumber || 0)} error={errors.tahunPerolehan} required />
		<RupiahField label="Harga Perolehan" bind:value={draft.hargaPerolehan} error={errors.hargaPerolehan} required />
		<RupiahField label="Nilai Saat Ini" bind:value={draft.nilaiSaatIni} error={errors.nilaiSaatIni} required />
		<SelectField label="Keterangan" bind:value={draft.keterangan} options={keteranganOptions} error={errors.keterangan} />
	</FieldGrid>
	{#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

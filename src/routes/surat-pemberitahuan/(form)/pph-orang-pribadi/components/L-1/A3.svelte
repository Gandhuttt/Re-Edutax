<script lang="ts">
	import { ActionButton, DataTable, FieldGrid, FormField, FormSection, InstitutionalModal, RupiahField, SelectField, TableActions } from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
	import type { BarisA3 } from "./types";

	interface Props { rows: BarisA3[]; referensi: DaftarReferensi; kodeReferensi: KodeReferensi; readonly?: boolean; }
	let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();
	const kosong = (): BarisA3 => ({ kode: "", deskripsi: "", lokasiHarta: "", nomorIdentitasPenerima: "", namaBankInstitusi: "", nomorAkun: "", hargaPerolehan: 0, tahunPerolehan: 0, nilaiSaatIni: 0, keterangan: "" });
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisA3>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let kode = $derived(kodeUntuk(kodeReferensi, "l1_a3_deskripsi", draft.deskripsi));
	let bisaEdit = $derived(!readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.nilaiSaatIni || 0), 0));
	let deskripsiOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l1_a3_deskripsi ?? []).map((value) => ({ value, label: value }))]);
	let negaraOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.negara ?? []).map((value) => ({ value, label: value }))]);
	let keteranganOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.keterangan_pps ?? []).map((value) => ({ value, label: value }))]);

	function bukaTambah() { indeksDiubah = null; draft = kosong(); errors = {}; modalTerbuka = true; }
	function bukaUbah(index: number) { indeksDiubah = index; draft = { ...rows[index] }; errors = {}; modalTerbuka = true; }
	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.deskripsi) next.deskripsi = "Kolom ini wajib diisi!";
		if (!draft.lokasiHarta) next.lokasiHarta = "Kolom ini wajib diisi!";
		if (!draft.nomorIdentitasPenerima) next.nomorIdentitasPenerima = "Kolom ini wajib diisi!";
		if (!draft.namaBankInstitusi) next.namaBankInstitusi = "Kolom ini wajib diisi!";
		if (!draft.nomorAkun) next.nomorAkun = "Kolom ini wajib diisi!";
		if (!draft.hargaPerolehan) next.hargaPerolehan = "Kolom ini wajib diisi!";
		if (!draft.tahunPerolehan) next.tahunPerolehan = "Kolom ini wajib diisi!";
		if (!draft.nilaiSaatIni) next.nilaiSaatIni = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		draft.kode = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalTerbuka = false;
	}
	function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
	function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 3?`)) rows = []; }
</script>

<FormSection number="3" title="INVESTASI/SEKURITAS" bordered padded={false}>
	{#snippet actions()}{#if bisaEdit}<ActionButton onclick={bukaTambah}>Tambah</ActionButton><ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>{/if}{/snippet}
	<DataTable label="Investasi dan sekuritas" minWidth="1420px" framed={false} headerTone="navy" density="compact">
		<table>
			<thead><tr>{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Kode</th><th scope="col">Deskripsi</th><th scope="col">Lokasi Harta</th><th scope="col">NPWP Bank/Institusi/Penerima Investasi</th><th scope="col">Nama Bank/Institusi/Penerima Investasi</th><th scope="col">Nomor Akun</th><th scope="col">Tahun Perolehan</th><th scope="col" class="right">Harga Perolehan</th><th scope="col" class="right">Nilai Saat Ini</th><th scope="col">Keterangan</th></tr></thead>
			<tbody>{#each rows as row, index}<tr>
				{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
				<td>{index + 1}</td><td>{row.kode}</td><td>{row.deskripsi}</td><td>{row.lokasiHarta}</td><td>{row.nomorIdentitasPenerima}</td><td>{row.namaBankInstitusi}</td><td>{row.nomorAkun}</td><td>{row.tahunPerolehan}</td><td class="number amount">{formatRupiahDerived(row.hargaPerolehan)}</td><td class="number amount">{formatRupiahDerived(row.nilaiSaatIni)}</td><td>{row.keterangan}</td>
			</tr>{:else}<tr><td colspan={bisaEdit ? 12 : 11} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}</tbody>
			<tfoot><tr><th scope="row" colspan={bisaEdit ? 10 : 9}>Jumlah Tabel 3</th><td class="number amount">{formatRupiahDerived(total)}</td><td></td></tr></tfoot>
		</table>
	</DataTable>
</FormSection>

<InstitutionalModal bind:open={modalTerbuka} title="Investasi/Sekuritas" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Kode" value={kode} readonly />
		<SelectField label="Deskripsi" bind:value={draft.deskripsi} options={deskripsiOptions} error={errors.deskripsi} required />
		<SelectField label="Lokasi Harta" bind:value={draft.lokasiHarta} options={negaraOptions} error={errors.lokasiHarta} required />
		<FormField label="Nomor Identitas Bank/Institusi/Penerima Investasi (NPWP)" bind:value={draft.nomorIdentitasPenerima} error={errors.nomorIdentitasPenerima} required />
		<FormField label="Nama Bank/Institusi/Penerima Investasi" bind:value={draft.namaBankInstitusi} error={errors.namaBankInstitusi} required />
		<FormField label="Nomor Akun" bind:value={draft.nomorAkun} error={errors.nomorAkun} required />
		<RupiahField label="Harga Perolehan" bind:value={draft.hargaPerolehan} error={errors.hargaPerolehan} required />
		<FormField label="Tahun Perolehan" type="number" value={draft.tahunPerolehan ? String(draft.tahunPerolehan) : ""} oninput={(event) => (draft.tahunPerolehan = event.currentTarget.valueAsNumber || 0)} error={errors.tahunPerolehan} required />
		<RupiahField label="Nilai Saat Ini" bind:value={draft.nilaiSaatIni} error={errors.nilaiSaatIni} required />
		<SelectField label="Keterangan" bind:value={draft.keterangan} options={keteranganOptions} error={errors.keterangan} />
	</FieldGrid>
	{#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

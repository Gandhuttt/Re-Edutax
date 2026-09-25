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
    import type { BarisPiutang } from "./types";

    interface Props { rows: BarisPiutang[]; referensi: DaftarReferensi; kodeReferensi: KodeReferensi; readonly?: boolean; }
    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();
    const kosong = (): BarisPiutang => ({
        nomorIdentitasDebitur: "", namaDebitur: "", alamatDebitur: "", jumlahPlafon: 0,
        jumlahTidakDapatDitagih: 0, metodePembebanan: "", jenisDokumen: "",
        kodeMetodePembebanan: "", kodeJenisDokumen: ""
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPiutang>(kosong());
    let errors = $state<Record<string, string>>({});
    let modalOpen = $state(false);
    let kodeMetodePembebanan = $derived(kodeUntuk(kodeReferensi, "l3d_metode_pembebanan", draft.metodePembebanan));
    let kodeJenisDokumen = $derived(kodeUntuk(kodeReferensi, "l3d_jenis_dokumen", draft.jenisDokumen));
    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((sum, row) => sum + Number(row.jumlahTidakDapatDitagih || 0), 0));
    let metodeOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l3d_metode_pembebanan ?? []).map((value) => ({ value, label: value }))]);
    let dokumenOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l3d_jenis_dokumen ?? []).map((value) => ({ value, label: value }))]);

    function bukaTambah() { indeksDiubah = null; draft = kosong(); errors = {}; modalOpen = true; }
    function bukaUbah(index: number) { indeksDiubah = index; draft = { ...rows[index] }; errors = {}; modalOpen = true; }
    function simpanModal() {
        const next: Record<string, string> = {};
        if (!draft.nomorIdentitasDebitur) next.nomorIdentitasDebitur = "Kolom ini wajib diisi!";
        if (!draft.namaDebitur) next.namaDebitur = "Kolom ini wajib diisi!";
        if (!draft.alamatDebitur) next.alamatDebitur = "Kolom ini wajib diisi!";
        if (draft.jumlahPlafon < 0) next.jumlahPlafon = "Tidak boleh kurang dari 0.";
        if (draft.jumlahTidakDapatDitagih < 0) next.jumlahTidakDapatDitagih = "Tidak boleh kurang dari 0.";
        if (!draft.metodePembebanan) next.metodePembebanan = "Kolom ini wajib diisi!";
        if (!draft.jenisDokumen) next.jenisDokumen = "Kolom ini wajib diisi!";
        errors = next;
        if (Object.keys(next).length > 0) return;
        draft.kodeMetodePembebanan = kodeMetodePembebanan;
        draft.kodeJenisDokumen = kodeJenisDokumen;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
        modalOpen = false;
    }
    function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
    function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris?`)) rows = []; }
</script>

<Stack gap="12px">
    {#if bisaEdit}<Stack direction="horizontal" align="end"><ActionButton onclick={bukaTambah}>Tambah</ActionButton><ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton></Stack>{/if}
    <DataTable label="Piutang yang nyata-nyata tidak dapat ditagih" minWidth="1420px" headerTone="navy" density="compact">
        <table>
            <thead><tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Nomor Identitas Debitur</th>
                <th scope="col">Nama Debitur</th><th scope="col">Alamat Debitur</th><th scope="col" class="right">Jumlah Plafon Piutang</th>
                <th scope="col" class="right">Jumlah Piutang yang Nyata-Nyata Tidak Dapat Ditagih</th><th scope="col">Kode Metode</th>
                <th scope="col">Metode Pembebanan</th><th scope="col">Kode Dokumen</th><th scope="col">Jenis Dokumen Pembuktian Pemenuhan Persyaratan</th>
            </tr></thead>
            <tbody>
                {#each rows as row, index}<tr>
                    {#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
                    <td>{index + 1}</td><td>{row.nomorIdentitasDebitur}</td><td>{row.namaDebitur}</td><td>{row.alamatDebitur}</td>
                    <td class="number amount">{formatRupiahDerived(row.jumlahPlafon)}</td><td class="number amount">{formatRupiahDerived(row.jumlahTidakDapatDitagih)}</td>
                    <td>{row.kodeMetodePembebanan}</td><td>{row.metodePembebanan}</td><td>{row.kodeJenisDokumen}</td><td>{row.jenisDokumen}</td>
                </tr>{:else}<tr><td colspan={bisaEdit ? 11 : 10} class="empty">Tidak ada data untuk ditampilkan.</td></tr>{/each}
            </tbody>
            <tfoot><tr><th scope="row" colspan={bisaEdit ? 6 : 5}>Jumlah</th><td class="number amount">{formatRupiahDerived(total)}</td><td colspan="4"></td></tr></tfoot>
        </table>
    </DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Piutang yang Nyata-Nyata Tidak Dapat Ditagih" eyebrow="LAMPIRAN L-3D · BAGIAN C" size="wide" scrollable>
    <FieldGrid columns={2}>
        <FormField label="Nomor Identitas Debitur" bind:value={draft.nomorIdentitasDebitur} error={errors.nomorIdentitasDebitur} required />
        <FormField label="Nama Debitur" bind:value={draft.namaDebitur} error={errors.namaDebitur} required />
        <FormField label="Alamat Debitur" bind:value={draft.alamatDebitur} error={errors.alamatDebitur} required />
        <RupiahField label="Jumlah Plafon Piutang" bind:value={draft.jumlahPlafon} error={errors.jumlahPlafon} required />
        <RupiahField label="Jumlah Piutang yang Nyata-Nyata Tidak Dapat Ditagih" bind:value={draft.jumlahTidakDapatDitagih} error={errors.jumlahTidakDapatDitagih} required />
        <FormField label="Kode Metode Pembebanan" value={kodeMetodePembebanan} readonly />
        <SelectField label="Metode Pembebanan" bind:value={draft.metodePembebanan} options={metodeOptions} error={errors.metodePembebanan} required />
        <FormField label="Kode Jenis Dokumen" value={kodeJenisDokumen} readonly />
        <SelectField label="Jenis Dokumen Pembuktian Pemenuhan Persyaratan" bind:value={draft.jenisDokumen} options={dokumenOptions} error={errors.jenisDokumen} required />
    </FieldGrid>
    {#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

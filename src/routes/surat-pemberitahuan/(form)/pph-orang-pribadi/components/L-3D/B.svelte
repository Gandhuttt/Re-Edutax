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
    import type { BarisPromosi } from "./types";

    interface Props { rows: BarisPromosi[]; referensi: DaftarReferensi; kodeReferensi: KodeReferensi; readonly?: boolean; }
    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();
    const kosong = (): BarisPromosi => ({
        nomorIdentitasPenerima: "", namaPenerima: "", alamatPenerima: "", tanggal: "",
        bentukJenisBiaya: "", nilai: 0, keterangan: "", jumlahPemotongan: 0,
        nomorBuktiPotong: "", kodeBentukJenisBiaya: ""
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPromosi>(kosong());
    let errors = $state<Record<string, string>>({});
    let modalOpen = $state(false);
    let kodeBentukJenisBiaya = $derived(kodeUntuk(kodeReferensi, "l3d_jenis_biaya_promosi", draft.bentukJenisBiaya));
    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((sum, row) => sum + Number(row.nilai || 0), 0));
    let biayaOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l3d_jenis_biaya_promosi ?? []).map((value) => ({ value, label: value }))]);

    function bukaTambah() { indeksDiubah = null; draft = kosong(); errors = {}; modalOpen = true; }
    function bukaUbah(index: number) { indeksDiubah = index; draft = { ...rows[index] }; errors = {}; modalOpen = true; }
    function simpanModal() {
        const next: Record<string, string> = {};
        if (!draft.nomorIdentitasPenerima) next.nomorIdentitasPenerima = "Kolom ini wajib diisi!";
        if (!draft.namaPenerima) next.namaPenerima = "Kolom ini wajib diisi!";
        if (!draft.alamatPenerima) next.alamatPenerima = "Kolom ini wajib diisi!";
        if (!draft.tanggal) next.tanggal = "Kolom ini wajib diisi!";
        if (!draft.bentukJenisBiaya) next.bentukJenisBiaya = "Kolom ini wajib diisi!";
        if (draft.nilai < 0) next.nilai = "Tidak boleh kurang dari 0.";
        if (!draft.keterangan) next.keterangan = "Kolom ini wajib diisi!";
        if (draft.jumlahPemotongan < 0) next.jumlahPemotongan = "Tidak boleh kurang dari 0.";
        if (!draft.nomorBuktiPotong) next.nomorBuktiPotong = "Kolom ini wajib diisi!";
        errors = next;
        if (Object.keys(next).length > 0) return;
        draft.kodeBentukJenisBiaya = kodeBentukJenisBiaya;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
        modalOpen = false;
    }
    function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
    function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris?`)) rows = []; }
</script>

<Stack gap="12px">
    {#if bisaEdit}<Stack direction="horizontal" align="end"><ActionButton onclick={bukaTambah}>Tambah</ActionButton><ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton></Stack>{/if}
    <DataTable label="Daftar nominatif biaya promosi dan imbalan natura" minWidth="1540px" headerTone="navy" density="compact">
        <table>
            <thead><tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Nomor Identitas Penerima</th>
                <th scope="col">Nama Penerima</th><th scope="col">Alamat Penerima</th><th scope="col">Tanggal</th><th scope="col">Kode</th>
                <th scope="col">Bentuk dan Jenis Biaya</th><th scope="col" class="right">Nilai</th><th scope="col">Keterangan</th>
                <th scope="col" class="right">Jumlah Pemotongan/Pemungutan PPh</th><th scope="col">Nomor Bukti Potong</th>
            </tr></thead>
            <tbody>
                {#each rows as row, index}<tr>
                    {#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
                    <td>{index + 1}</td><td>{row.nomorIdentitasPenerima}</td><td>{row.namaPenerima}</td><td>{row.alamatPenerima}</td><td>{row.tanggal}</td>
                    <td>{row.kodeBentukJenisBiaya}</td><td>{row.bentukJenisBiaya}</td><td class="number amount">{formatRupiahDerived(row.nilai)}</td>
                    <td>{row.keterangan}</td><td class="number amount">{formatRupiahDerived(row.jumlahPemotongan)}</td><td>{row.nomorBuktiPotong}</td>
                </tr>{:else}<tr><td colspan={bisaEdit ? 12 : 11} class="empty">Tidak ada data untuk ditampilkan.</td></tr>{/each}
            </tbody>
            <tfoot><tr><th scope="row" colspan={bisaEdit ? 8 : 7}>Jumlah</th><td class="number amount">{formatRupiahDerived(total)}</td><td colspan="3"></td></tr></tfoot>
        </table>
    </DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Daftar Nominatif Biaya Promosi" eyebrow="LAMPIRAN L-3D · BAGIAN B" size="wide" scrollable>
    <FieldGrid columns={2}>
        <FormField label="Nomor Identitas Penerima" bind:value={draft.nomorIdentitasPenerima} error={errors.nomorIdentitasPenerima} required />
        <FormField label="Nama Penerima" bind:value={draft.namaPenerima} error={errors.namaPenerima} required />
        <FormField label="Alamat Penerima" bind:value={draft.alamatPenerima} error={errors.alamatPenerima} required />
        <FormField label="Tanggal" type="date" bind:value={draft.tanggal} error={errors.tanggal} required />
        <FormField label="Kode Bentuk dan Jenis Biaya" value={kodeBentukJenisBiaya} readonly />
        <SelectField label="Bentuk dan Jenis Biaya" bind:value={draft.bentukJenisBiaya} options={biayaOptions} error={errors.bentukJenisBiaya} required />
        <RupiahField label="Nilai" bind:value={draft.nilai} error={errors.nilai} required />
        <FormField label="Keterangan" bind:value={draft.keterangan} error={errors.keterangan} required />
        <RupiahField label="Jumlah Pemotongan/Pemungutan PPh" bind:value={draft.jumlahPemotongan} error={errors.jumlahPemotongan} required />
        <FormField label="Nomor Bukti Potong" bind:value={draft.nomorBuktiPotong} error={errors.nomorBuktiPotong} required />
    </FieldGrid>
    {#snippet actions()}<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton><ActionButton onclick={simpanModal}>Simpan</ActionButton>{/snippet}
</InstitutionalModal>

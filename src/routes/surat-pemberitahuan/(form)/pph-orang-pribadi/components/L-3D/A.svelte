<script lang="ts">
    import {
        ActionButton,
        DataTable,
        FieldGrid,
        FormField,
        InstitutionalModal,
        RupiahField,
        Stack,
        TableActions
    } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import type { BarisEntertainment } from "./types";

    interface Props {
        rows: BarisEntertainment[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), readonly = false }: Props = $props();
    const kosong = (): BarisEntertainment => ({
        tanggal: "", namaTempat: "", alamat: "", jenis: "", jumlahPemberian: 0,
        namaRelasi: "", posisiJabatan: "", namaPerusahaan: "", jenisUsahaRelasi: "", keterangan: ""
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisEntertainment>(kosong());
    let errors = $state<Record<string, string>>({});
    let modalOpen = $state(false);
    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((sum, row) => sum + Number(row.jumlahPemberian || 0), 0));

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
        if (!draft.tanggal) next.tanggal = "Kolom ini wajib diisi!";
        if (!draft.namaTempat) next.namaTempat = "Kolom ini wajib diisi!";
        if (!draft.alamat) next.alamat = "Kolom ini wajib diisi!";
        if (!draft.jenis) next.jenis = "Kolom ini wajib diisi!";
        if (draft.jumlahPemberian < 0) next.jumlahPemberian = "Tidak boleh kurang dari 0.";
        if (!draft.namaRelasi) next.namaRelasi = "Kolom ini wajib diisi!";
        if (!draft.posisiJabatan) next.posisiJabatan = "Kolom ini wajib diisi!";
        if (!draft.namaPerusahaan) next.namaPerusahaan = "Kolom ini wajib diisi!";
        if (!draft.jenisUsahaRelasi) next.jenisUsahaRelasi = "Kolom ini wajib diisi!";
        if (!draft.keterangan) next.keterangan = "Kolom ini wajib diisi!";
        errors = next;
        if (Object.keys(next).length > 0) return;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
        modalOpen = false;
    }
    function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
    function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris?`)) rows = []; }
</script>

<Stack gap="12px">
    {#if bisaEdit}
        <Stack direction="horizontal" align="end">
            <ActionButton onclick={bukaTambah}>Tambah</ActionButton>
            <ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
        </Stack>
    {/if}
    <DataTable label="Daftar nominatif biaya entertainment" minWidth="1500px" headerTone="navy" density="compact">
        <table>
            <thead><tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Tanggal</th>
                <th scope="col">Nama Tempat</th><th scope="col">Alamat</th><th scope="col">Jenis</th>
                <th scope="col" class="right">Jumlah Pemberian</th><th scope="col">Nama Relasi</th>
                <th scope="col">Posisi/Jabatan</th><th scope="col">Nama Perusahaan</th><th scope="col">Jenis Usaha Relasi</th><th scope="col">Keterangan</th>
            </tr></thead>
            <tbody>
                {#each rows as row, index}<tr>
                    {#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
                    <td>{index + 1}</td><td>{row.tanggal}</td><td>{row.namaTempat}</td><td>{row.alamat}</td><td>{row.jenis}</td>
                    <td class="number amount">{formatRupiahDerived(row.jumlahPemberian)}</td><td>{row.namaRelasi}</td><td>{row.posisiJabatan}</td>
                    <td>{row.namaPerusahaan}</td><td>{row.jenisUsahaRelasi}</td><td>{row.keterangan}</td>
                </tr>{:else}<tr><td colspan={bisaEdit ? 12 : 11} class="empty">Tidak ada data untuk ditampilkan.</td></tr>{/each}
            </tbody>
            <tfoot><tr><th scope="row" colspan={bisaEdit ? 6 : 5}>Jumlah</th><td class="number amount">{formatRupiahDerived(total)}</td><td colspan="5"></td></tr></tfoot>
        </table>
    </DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Daftar Nominatif Biaya Hiburan" eyebrow="LAMPIRAN L-3D · BAGIAN A" size="wide" scrollable>
    <FieldGrid columns={2}>
        <FormField label="Tanggal" type="date" bind:value={draft.tanggal} error={errors.tanggal} required />
        <FormField label="Nama Tempat" bind:value={draft.namaTempat} error={errors.namaTempat} required />
        <FormField label="Alamat" bind:value={draft.alamat} error={errors.alamat} required />
        <FormField label="Jenis" bind:value={draft.jenis} error={errors.jenis} required />
        <RupiahField label="Jumlah Pemberian" bind:value={draft.jumlahPemberian} error={errors.jumlahPemberian} required />
        <FormField label="Nama Relasi" bind:value={draft.namaRelasi} error={errors.namaRelasi} required />
        <FormField label="Posisi/Jabatan" bind:value={draft.posisiJabatan} error={errors.posisiJabatan} required />
        <FormField label="Nama Perusahaan" bind:value={draft.namaPerusahaan} error={errors.namaPerusahaan} required />
        <FormField label="Jenis Usaha Relasi" bind:value={draft.jenisUsahaRelasi} error={errors.jenisUsahaRelasi} required />
        <FormField label="Keterangan" bind:value={draft.keterangan} error={errors.keterangan} required />
    </FieldGrid>
    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

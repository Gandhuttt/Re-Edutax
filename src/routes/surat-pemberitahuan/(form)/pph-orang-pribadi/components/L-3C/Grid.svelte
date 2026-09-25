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
    } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import type { BarisHartaFiskal } from "./types";

    interface Props {
        rows: BarisHartaFiskal[];
        tableIndex: number;
        judul: string;
        daftarHarta: string;
        seksi: "berwujud" | "bangunan" | "takberwujud";
        tahunPajak: number;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), tableIndex, judul, daftarHarta, seksi, tahunPajak, referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisHartaFiskal => ({
        kodeHarta: "", jenisHarta: "", bulanPerolehan: 0, tahunPerolehan: 0,
        hargaPerolehan: 0, nilaiSisaBukuFiskal: 0, metodeKomersial: "",
        metodeFiskal: "", penyusutanFiskalTahunIni: 0, keterangan: ""
    });
    const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisHartaFiskal>(kosong());
    let errors = $state<Record<string, string>>({});
    let modalOpen = $state(false);
    let kode = $derived(kodeUntuk(kodeReferensi, daftarHarta, draft.jenisHarta));
    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((sum, row) => sum + Number(row.penyusutanFiskalTahunIni || 0), 0));
    let tahunMaksimum = $derived(seksi === "bangunan" ? tahunPajak : new Date().getFullYear());
    let perolehanWajib = $derived(seksi === "berwujud");
    let jenisOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi[daftarHarta] ?? []).map((value) => ({ value, label: value }))]);
    let metodeKomersialOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l3c_metode_komersial ?? []).map((value) => ({ value, label: value }))]);
    let metodeFiskalOptions = $derived([{ value: "", label: "Silakan pilih" }, ...(referensi.l3c_metode_fiskal ?? []).map((value) => ({ value, label: value }))]);
    const bulanOptions = [{ value: 0, label: "Bulan" }, ...BULAN.map((label, index) => ({ value: index + 1, label }))];

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
        if (!draft.jenisHarta) next.jenisHarta = "Kolom ini wajib diisi!";
        if (perolehanWajib && (!draft.bulanPerolehan || !draft.tahunPerolehan)) next.perolehan = "Kolom ini wajib diisi!";
        if (draft.tahunPerolehan && draft.tahunPerolehan > tahunMaksimum) next.perolehan = `Tahun perolehan tidak boleh melebihi ${tahunMaksimum}.`;
        if (!draft.hargaPerolehan) next.hargaPerolehan = "Kolom ini wajib diisi!";
        if (draft.nilaiSisaBukuFiskal < 0) next.nilaiSisaBukuFiskal = "Tidak boleh kurang dari 0.";
        if (!draft.metodeKomersial) next.metodeKomersial = "Kolom ini wajib diisi!";
        if (!draft.metodeFiskal) next.metodeFiskal = "Kolom ini wajib diisi!";
        if (draft.penyusutanFiskalTahunIni < 0) next.penyusutanFiskalTahunIni = "Tidak boleh kurang dari 0.";
        errors = next;
        if (Object.keys(next).length > 0) return;
        draft.kodeHarta = kode;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
        modalOpen = false;
    }

    function hapus(index: number) { rows = rows.filter((_, rowIndex) => rowIndex !== index); }
    function hapusSemua() { if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada ${judul}?`)) rows = []; }
    function tampilPerolehan(row: BarisHartaFiskal) {
        if (!row.bulanPerolehan || !row.tahunPerolehan) return "";
        return `${String(row.bulanPerolehan).padStart(2, "0")} ${row.tahunPerolehan}`;
    }
</script>

<FormSection number={String(tableIndex)} title={judul} bordered padded={false}>
    {#snippet actions()}
        {#if bisaEdit}
            <ActionButton onclick={bukaTambah}>Tambah</ActionButton>
            <ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
        {/if}
    {/snippet}
    <DataTable label={`${judul}, tabel ${tableIndex}`} minWidth="1420px" framed={false} headerTone="navy" density="compact">
        <table>
            <thead>
                <tr>
                    {#if bisaEdit}<th scope="col" rowspan="2">Tindakan</th>{/if}
                    <th scope="col" rowspan="2">No.</th><th scope="col" rowspan="2">Kode Harta</th>
                    <th scope="col" rowspan="2">Kelompok/Jenis Harta</th><th scope="col" rowspan="2">Bulan/Tahun Perolehan</th>
                    <th scope="col" rowspan="2" class="right">Harga Perolehan</th><th scope="col" rowspan="2" class="right">Nilai Sisa Buku Fiskal Awal Tahun</th>
                    <th scope="col" colspan="2">Metode Penyusutan/Amortisasi</th>
                    <th scope="col" rowspan="2" class="right">Penyusutan/Amortisasi Fiskal Tahun Ini</th><th scope="col" rowspan="2">Keterangan</th>
                </tr>
                <tr><th scope="col">Komersial</th><th scope="col">Fiskal</th></tr>
            </thead>
            <tbody>
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
                        <td>{index + 1}</td><td>{row.kodeHarta}</td><td>{row.jenisHarta}</td><td>{tampilPerolehan(row)}</td>
                        <td class="number amount">{formatRupiahDerived(row.hargaPerolehan)}</td><td class="number amount">{formatRupiahDerived(row.nilaiSisaBukuFiskal)}</td>
                        <td>{row.metodeKomersial}</td><td>{row.metodeFiskal}</td><td class="number amount">{formatRupiahDerived(row.penyusutanFiskalTahunIni)}</td><td>{row.keterangan}</td>
                    </tr>
                {:else}<tr><td colspan={bisaEdit ? 11 : 10} class="empty">Tidak ada data untuk ditampilkan.</td></tr>{/each}
            </tbody>
            <tfoot><tr><th scope="row" colspan={bisaEdit ? 9 : 8}>Jumlah</th><td class="number amount">{formatRupiahDerived(total)}</td><td></td></tr></tfoot>
        </table>
    </DataTable>
</FormSection>

<InstitutionalModal bind:open={modalOpen} title={judul} eyebrow={`LAMPIRAN L-3C · TABEL ${tableIndex}`} size="wide" scrollable>
    <FieldGrid columns={2}>
        <FormField label="Kode Harta" value={kode} readonly />
        <SelectField label="Jenis Harta" bind:value={draft.jenisHarta} options={jenisOptions} error={errors.jenisHarta} required />
        <SelectField label="Bulan Perolehan" bind:value={draft.bulanPerolehan} options={bulanOptions} error={errors.perolehan} required={perolehanWajib} />
        <FormField label="Tahun Perolehan" type="number" value={draft.tahunPerolehan ? String(draft.tahunPerolehan) : ""} oninput={(event) => (draft.tahunPerolehan = event.currentTarget.valueAsNumber || 0)} max={tahunMaksimum} error={errors.perolehan} required={perolehanWajib} />
        <RupiahField label="Biaya Perolehan" bind:value={draft.hargaPerolehan} error={errors.hargaPerolehan} required />
        <RupiahField label="Nilai Sisa Buku Fiskal Awal Tahun" bind:value={draft.nilaiSisaBukuFiskal} error={errors.nilaiSisaBukuFiskal} required />
        <SelectField label="Metode Penyusutan Komersial" bind:value={draft.metodeKomersial} options={metodeKomersialOptions} error={errors.metodeKomersial} required />
        <SelectField label="Metode Penyusutan Fiskal" bind:value={draft.metodeFiskal} options={metodeFiskalOptions} error={errors.metodeFiskal} required />
        <RupiahField label="Penyusutan Fiskal Tahun Ini" bind:value={draft.penyusutanFiskalTahunIni} error={errors.penyusutanFiskalTahunIni} required />
        <FormField label="Keterangan" bind:value={draft.keterangan} />
    </FieldGrid>
    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA1 } from "./types";

    // A1. KAS DAN SETARA KAS
    //
    // A1 records a single SALDO where its five siblings record a Harga Perolehan
    // and a Nilai Saat Ini separately. On the live form that one value populated
    // both columns of the A7 rollup, so it is stored in nilaiSaatIni and A7 falls
    // back to it for the harga side.
    interface Props {
        rows: BarisA1[];
        referensi: Record<string, string[]>;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, readonly = false }: Props = $props();

    const kosong = (): BarisA1 => ({
        kode: '', deskripsi: '', nomorAkun: '', atasNama: '', namaBankInstitusi: '',
        lokasiHarta: '', tahunPerolehan: 0, nilaiSaatIni: 0, keterangan: ''
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA1>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.nilaiSaatIni || 0), 0));

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
        // Validation fires on Simpan for every field at once, matching the live
        // form. Keterangan carries no asterisk yet still errors when empty; the
        // asterisk is not a reliable requiredness marker.
        const next: Record<string, string> = {};
        if (!draft.kode) next.kode = 'Kolom ini wajib diisi!';
        if (!draft.deskripsi) next.deskripsi = 'Kolom ini wajib diisi!';
        if (!draft.nomorAkun) next.nomorAkun = 'Kolom ini wajib diisi!';
        if (!draft.atasNama) next.atasNama = 'Kolom ini wajib diisi!';
        if (!draft.namaBankInstitusi) next.namaBankInstitusi = 'Kolom ini wajib diisi!';
        if (!draft.lokasiHarta) next.lokasiHarta = 'Kolom ini wajib diisi!';
        if (!draft.tahunPerolehan) next.tahunPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.nilaiSaatIni) next.nilaiSaatIni = 'Kolom ini wajib diisi!';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalTerbuka = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 1?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">1. KAS DAN SETARA KAS</span>
        {#if bisaEdit}
            <div class="tw:flex tw:gap-2">
                <Button type="button" onclick={bukaTambah}>Tambah</Button>
                <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
            </div>
        {/if}
    </div>

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>KODE</th>
                    <th>DESKRIPSI</th>
                    <th>NOMOR AKUN</th>
                    <th>ATAS NAMA</th>
                    <th>NAMA BANK/INSTITUSI</th>
                    <th>LOKASI HARTA</th>
                    <th>TAHUN PEROLEHAN</th>
                    <th class="tw:text-end">SALDO</th>
                    <th>KETERANGAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)}>Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.deskripsi}</td>
                        <td>{row.nomorAkun}</td>
                        <td>{row.atasNama}</td>
                        <td>{row.namaBankInstitusi}</td>
                        <td>{row.lokasiHarta}</td>
                        <td>{row.tahunPerolehan}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 9 : 8}>JUMLAH TABEL 1</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">KAS DAN SETARA KAS</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="a1-kode"><span>Kode *</span></Label>
                    <Input id="a1-kode" type={"text"} bind:value={draft.kode} />
                    {#if errors.kode}<span class="error">{errors.kode}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-deskripsi"><span>Deskripsi *</span></Label>
                    <Select id="a1-deskripsi" bind:value={draft.deskripsi}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_a1_deskripsi ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-nomor-akun"><span>Nomor Akun *</span></Label>
                    <Input id="a1-nomor-akun" type={"text"} bind:value={draft.nomorAkun} />
                    {#if errors.nomorAkun}<span class="error">{errors.nomorAkun}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-atas-nama"><span>Atas Nama *</span></Label>
                    <Input id="a1-atas-nama" type={"text"} bind:value={draft.atasNama} />
                    {#if errors.atasNama}<span class="error">{errors.atasNama}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-nama-bank"><span>Nama Bank/Institusi *</span></Label>
                    <Input id="a1-nama-bank" type={"text"} bind:value={draft.namaBankInstitusi} />
                    {#if errors.namaBankInstitusi}<span class="error">{errors.namaBankInstitusi}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-lokasi"><span>Lokasi Harta *</span></Label>
                    <Select id="a1-lokasi" bind:value={draft.lokasiHarta}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.negara ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-tahun"><span>Tahun Perolehan *</span></Label>
                    <Input id="a1-tahun" type={"number"} bind:value={draft.tahunPerolehan} />
                    {#if errors.tahunPerolehan}<span class="error">{errors.tahunPerolehan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-saldo"><span>Saldo *</span></Label>
                    <Input
                        id="a1-saldo"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nilaiSaatIni)}
                        oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
                    />
                    {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a1-keterangan"><span>Keterangan</span></Label>
                    <Select id="a1-keterangan" bind:value={draft.keterangan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.keterangan_pps ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.keterangan}<span class="error">{errors.keterangan}</span>{/if}
                </div>
            </div>
            <footer>
                <Button type="button" onclick={() => (modalTerbuka = false)}>Tutup</Button>
                <Button type="button" onclick={simpanModal} color="var(--color-secondary)">
                    <span class="tw:text-white">Simpan</span>
                </Button>
            </footer>
        </div>
    </div>
{/if}

<style>
    th { font-size: .7rem; text-align: left; padding: .4rem .5rem; white-space: nowrap; }
    td { font-size: .8rem; padding: .25rem .5rem; }
    tr.total td { font-weight: bold; background-color: #F9F6EE; }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }
    .modal {
        background: white;
        width: min(48rem, 92vw);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 0.25rem;
    }
    header, footer {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
    }
    header { justify-content: space-between; border-bottom: 1px solid #ddd; }
    header button { font-size: 1.5rem; line-height: 1; background: none; border: none; cursor: pointer; }
    footer { justify-content: flex-end; gap: 0.5rem; border-top: 1px solid #ddd; }
    .body { overflow-y: auto; padding: 1rem; display: grid; gap: 0.75rem; }
    .field { display: grid; gap: 0.25rem; }
    .field span { font-size: 0.8rem; }
    .error { background: #fde8e8; color: #b91c1c; font-size: 0.75rem; padding: 0.25rem 0.5rem; }
</style>

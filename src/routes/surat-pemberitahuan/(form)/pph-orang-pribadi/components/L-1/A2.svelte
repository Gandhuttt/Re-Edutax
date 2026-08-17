<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA2 } from "./types";

    // A2. PIUTANG
    //
    // Carries two money columns specific to it (Nilai Piutang and Saldo Piutang
    // Saat Ini) and a Tahun Dimulai rather than a Tahun Perolehan. The saldo is
    // what rolls into A7.
    interface Props {
        rows: BarisA2[];
        referensi: Record<string, string[]>;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, readonly = false }: Props = $props();

    const kosong = (): BarisA2 => ({
        kode: '', deskripsi: '', lokasiHarta: '', nomorIdentitasPenerima: '',
        namaPenerimaPinjaman: '', nilaiPiutang: 0, tahunDimulai: 0, nilaiSaatIni: 0, keterangan: ''
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA2>(kosong());
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
        const next: Record<string, string> = {};
        if (!draft.kode) next.kode = 'Kolom ini wajib diisi!';
        if (!draft.deskripsi) next.deskripsi = 'Kolom ini wajib diisi!';
        if (!draft.lokasiHarta) next.lokasiHarta = 'Kolom ini wajib diisi!';
        if (!draft.nomorIdentitasPenerima) next.nomorIdentitasPenerima = 'Kolom ini wajib diisi!';
        // Derived from the NIK/NPWP on the live form, which also pre-fills it with
        // the filer's own identity. Kept editable: we have no taxpayer directory
        // to look it up in, and defaulting to the filer would be misleading.
        if (!draft.namaPenerimaPinjaman) next.namaPenerimaPinjaman = 'Kolom ini wajib diisi!';
        if (!draft.nilaiPiutang) next.nilaiPiutang = 'Kolom ini wajib diisi!';
        if (!draft.tahunDimulai) next.tahunDimulai = 'Kolom ini wajib diisi!';
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
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 2?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">2. PIUTANG</span>
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
                    <th>LOKASI PENERIMA PINJAMAN</th>
                    <th>NIK/NPWP PENERIMA PINJAMAN</th>
                    <th>NAMA PENERIMA PINJAMAN</th>
                    <th>TAHUN DIMULAI</th>
                    <th class="tw:text-end">NILAI PIUTANG</th>
                    <th class="tw:text-end">SALDO PIUTANG SAAT INI</th>
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
                        <td>{row.lokasiHarta}</td>
                        <td>{row.nomorIdentitasPenerima}</td>
                        <td>{row.namaPenerimaPinjaman}</td>
                        <td>{row.tahunDimulai}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiPiutang)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 9 : 8}>JUMLAH TABEL 2</td>
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
                <span class="tw:text-lg">PIUTANG</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="a2-kode"><span>Kode *</span></Label>
                    <Input id="a2-kode" type={"text"} bind:value={draft.kode} />
                    {#if errors.kode}<span class="error">{errors.kode}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-deskripsi"><span>Deskripsi *</span></Label>
                    <Select id="a2-deskripsi" bind:value={draft.deskripsi}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_a2_deskripsi ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-lokasi"><span>Lokasi Penerima *</span></Label>
                    <Select id="a2-lokasi" bind:value={draft.lokasiHarta}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.negara ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-identitas"><span>Nomor Identitas Penerima (NIK/NPWP) *</span></Label>
                    <Input id="a2-identitas" type={"text"} bind:value={draft.nomorIdentitasPenerima} />
                    {#if errors.nomorIdentitasPenerima}<span class="error">{errors.nomorIdentitasPenerima}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-nama"><span>Nama Penerima Pinjaman *</span></Label>
                    <Input id="a2-nama" type={"text"} bind:value={draft.namaPenerimaPinjaman} />
                    {#if errors.namaPenerimaPinjaman}<span class="error">{errors.namaPenerimaPinjaman}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-nilai"><span>Nilai Piutang *</span></Label>
                    <Input
                        id="a2-nilai"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nilaiPiutang)}
                        oninput={(e: Event) => (draft.nilaiPiutang = applyRupiahInput(e))}
                    />
                    {#if errors.nilaiPiutang}<span class="error">{errors.nilaiPiutang}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-tahun"><span>Tahun Dimulai *</span></Label>
                    <Input id="a2-tahun" type={"number"} bind:value={draft.tahunDimulai} />
                    {#if errors.tahunDimulai}<span class="error">{errors.tahunDimulai}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-saldo"><span>Saldo Piutang Saat Ini *</span></Label>
                    <Input
                        id="a2-saldo"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nilaiSaatIni)}
                        oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
                    />
                    {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a2-keterangan"><span>Keterangan</span></Label>
                    <Select id="a2-keterangan" bind:value={draft.keterangan}>
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
    th {
    	font-size: .7rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .4rem .5rem;
    	white-space: nowrap;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
    td {
    	font-size: .8rem;
    	padding: .25rem .5rem;
    	border: 1px solid white;
    }
    tr:not(.total):not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
    }
    tr.total td {
    	font-weight: bold;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }

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

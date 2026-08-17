<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA5 } from "./types";

    // A5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)
    interface Props {
        rows: BarisA5[];
        referensi: Record<string, string[]>;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, readonly = false }: Props = $props();

    const kosong = (): BarisA5 => ({
        kode: '', deskripsi: '', lokasiHarta: '', ukuranTanah: '', ukuranBangunan: '',
        sumberKepemilikan: '', nomorSertifikat: '', tahunPerolehan: 0,
        hargaPerolehan: 0, nilaiSaatIni: 0, keterangan: ''
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA5>(kosong());
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
        if (!draft.ukuranTanah) next.ukuranTanah = 'Kolom ini wajib diisi!';
        if (!draft.ukuranBangunan) next.ukuranBangunan = 'Kolom ini wajib diisi!';
        if (!draft.sumberKepemilikan) next.sumberKepemilikan = 'Kolom ini wajib diisi!';
        if (!draft.nomorSertifikat) next.nomorSertifikat = 'Kolom ini wajib diisi!';
        if (!draft.tahunPerolehan) next.tahunPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.hargaPerolehan) next.hargaPerolehan = 'Kolom ini wajib diisi!';
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
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 5?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)</span>
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah}>Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>KODE</th>
                    <th>DESKRIPSI</th>
                    <th>LOKASI HARTA</th>
                    <th>UKURAN PROPERTI - TANAH</th>
                    <th>UKURAN PROPERTI - BANGUNAN</th>
                    <th>SUMBER KEPEMILIKAN</th>
                    <th>NOMOR SERTIFIKAT</th>
                    <th>TAHUN PEROLEHAN</th>
                    <th class="tw:text-end">HARGA PEROLEHAN</th>
                    <th class="tw:text-end">NILAI SAAT INI</th>
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
                        <td>{row.ukuranTanah}</td>
                        <td>{row.ukuranBangunan}</td>
                        <td>{row.sumberKepemilikan}</td>
                        <td>{row.nomorSertifikat}</td>
                        <td>{row.tahunPerolehan}</td>
                        <td class="tw:text-end">{formatRupiah(row.hargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 13 : 12} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 11 : 10}>JUMLAH TABEL 5</td>
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
                <span class="tw:text-lg">HARTA TIDAK BERGERAK</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="a5-kode"><span>Kode *</span></Label>
                    <Input id="a5-kode" type={"text"} bind:value={draft.kode} />
                    {#if errors.kode}<span class="error">{errors.kode}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-deskripsi"><span>Deskripsi *</span></Label>
                    <Select id="a5-deskripsi" bind:value={draft.deskripsi}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_a5_deskripsi ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
                </div>
                <div class="field">
                    <!-- Plain text here, where A1 and A3 use the negara dropdown
                         for the same concept: reference-table design is per grid. -->
                    <Label for="a5-lokasi"><span>Lokasi Harta *</span></Label>
                    <Input id="a5-lokasi" type={"text"} bind:value={draft.lokasiHarta} />
                    {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-tanah"><span>Ukuran Properti - Tanah *</span></Label>
                    <Input id="a5-tanah" type={"text"} bind:value={draft.ukuranTanah} />
                    {#if errors.ukuranTanah}<span class="error">{errors.ukuranTanah}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-bangunan"><span>Ukuran Properti - Bangunan *</span></Label>
                    <Input id="a5-bangunan" type={"text"} bind:value={draft.ukuranBangunan} />
                    {#if errors.ukuranBangunan}<span class="error">{errors.ukuranBangunan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-sumber"><span>Sumber Kepemilikan *</span></Label>
                    <Select id="a5-sumber" bind:value={draft.sumberKepemilikan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_a5_sumber_kepemilikan ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.sumberKepemilikan}<span class="error">{errors.sumberKepemilikan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-sertifikat"><span>Nomor Sertifikat *</span></Label>
                    <Input id="a5-sertifikat" type={"text"} bind:value={draft.nomorSertifikat} />
                    {#if errors.nomorSertifikat}<span class="error">{errors.nomorSertifikat}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-tahun"><span>Tahun Perolehan *</span></Label>
                    <Input id="a5-tahun" type={"number"} bind:value={draft.tahunPerolehan} />
                    {#if errors.tahunPerolehan}<span class="error">{errors.tahunPerolehan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-harga"><span>Harga Perolehan *</span></Label>
                    <Input
                        id="a5-harga"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.hargaPerolehan)}
                        oninput={(e: Event) => (draft.hargaPerolehan = applyRupiahInput(e))}
                    />
                    {#if errors.hargaPerolehan}<span class="error">{errors.hargaPerolehan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-nilai"><span>Nilai Saat Ini *</span></Label>
                    <Input
                        id="a5-nilai"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nilaiSaatIni)}
                        oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
                    />
                    {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
                </div>
                <div class="field">
                    <Label for="a5-keterangan"><span>Keterangan</span></Label>
                    <Select id="a5-keterangan" bind:value={draft.keterangan}>
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

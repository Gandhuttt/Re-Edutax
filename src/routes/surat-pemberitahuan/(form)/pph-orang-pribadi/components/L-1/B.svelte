<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisUtang } from "./types";

    // B. UTANG PADA AKHIR TAHUN PAJAK. Feeds Induk 14b.
    //
    // Editable exactly when Induk 14b is Ya. When it is Tidak the grid still
    // renders its rows, it just offers no way to add or remove them.
    interface Props {
        rows: BarisUtang[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisUtang => ({
        kode: '', deskripsi: '', nikNpwpKreditur: '', namaKreditur: '',
        negaraKreditur: '', tahunPeminjaman: 0, saldo: 0, keterangan: ''
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisUtang>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.saldo || 0), 0));

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
        if (!draft.nikNpwpKreditur) next.nikNpwpKreditur = 'Kolom ini wajib diisi!';
        if (!draft.namaKreditur) next.namaKreditur = 'Kolom ini wajib diisi!';
        if (!draft.negaraKreditur) next.negaraKreditur = 'Kolom ini wajib diisi!';
        // Tahun Peminjaman carries no asterisk on the live form and stays optional.
        if (!draft.saldo) next.saldo = 'Kolom ini wajib diisi!';
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
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian B?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
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
                    <th>KREDITUR</th>
                    <th>NEGARA KREDITUR</th>
                    <th>TAHUN PEMINJAMAN</th>
                    <th class="tw:text-end">SALDO</th>
                    <th>KETERANGAN</th>
                    <th>NOMOR IDENTITAS WP</th>
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
                        <td>{row.namaKreditur}</td>
                        <td>{row.negaraKreditur}</td>
                        <td>{row.tahunPeminjaman}</td>
                        <td class="tw:text-end">{formatRupiah(row.saldo)}</td>
                        <td>{row.keterangan}</td>
                        <td>{row.nikNpwpKreditur}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 10 : 9} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 7 : 6}>JUMLAH BAGIAN B</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td colspan="2"></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">UTANG PADA AKHIR TAHUN PAJAK</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="b-kode"><span>Kode *</span></Label>
                    <Input id="b-kode" type={"text"} bind:value={draft.kode} />
                    {#if errors.kode}<span class="error">{errors.kode}</span>{/if}
                </div>
                <div class="field">
                    <Label for="b-deskripsi"><span>Deskripsi *</span></Label>
                    <Select id="b-deskripsi" bind:value={draft.deskripsi}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_b_deskripsi ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
                </div>
                <div class="field">
                    <Label for="b-nik"><span>NIK/NPWP Kreditur *</span></Label>
                    <Input id="b-nik" type={"text"} bind:value={draft.nikNpwpKreditur} />
                    {#if errors.nikNpwpKreditur}<span class="error">{errors.nikNpwpKreditur}</span>{/if}
                </div>
                <div class="field">
                    <Label for="b-nama"><span>Nama Kreditur *</span></Label>
                    <Input id="b-nama" type={"text"} bind:value={draft.namaKreditur} />
                    {#if errors.namaKreditur}<span class="error">{errors.namaKreditur}</span>{/if}
                </div>
                <div class="field">
                    <Label for="b-negara"><span>Negara Kreditur *</span></Label>
                    <Select id="b-negara" bind:value={draft.negaraKreditur}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.negara ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.negaraKreditur}<span class="error">{errors.negaraKreditur}</span>{/if}
                </div>
                <div class="field">
                    <Label for="b-tahun"><span>Tahun Peminjaman</span></Label>
                    <Input id="b-tahun" type={"number"} bind:value={draft.tahunPeminjaman} />
                </div>
                <div class="field">
                    <Label for="b-saldo"><span>Saldo *</span></Label>
                    <Input
                        id="b-saldo"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.saldo)}
                        oninput={(e: Event) => (draft.saldo = applyRupiahInput(e))}
                    />
                    {#if errors.saldo}<span class="error">{errors.saldo}</span>{/if}
                </div>
                <div class="field">
                    <!-- Utang gets its own single-option Keterangan list, separate
                         from the harta grids' two-option one. -->
                    <Label for="b-keterangan"><span>Keterangan *</span></Label>
                    <Select id="b-keterangan" bind:value={draft.keterangan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_b_keterangan ?? [] as opsi}
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

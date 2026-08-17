<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisFinal } from "./types";

    // A. PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL
    //
    // This section's toolbar differs from every L-1 grid: on the live form it
    // carries **only Tambah**, with no Hapus Semua and no Impor data. That is a
    // real property of this grid, confirmed in fullpage-l2-maximal.jpg, not an
    // oversight. Per-row deletion is kept so entered rows are not a dead end.
    //
    // Feeds Induk 14c, which takes the DPP rather than the PPh Terutang: a row
    // with DPP 666.666 and tax 66.666 showed 666.666 on the Induk.
    interface Props {
        rows: BarisFinal[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisFinal => ({
        npwpPemotong: '', namaPemotong: '', kodeObjekPajak: '',
        jenisPenghasilan: '', dasarPengenaanPajak: 0, pphTerutang: 0
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisFinal>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let totalDpp = $derived(rows.reduce((s, r) => s + Number(r.dasarPengenaanPajak || 0), 0));

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
        // Jenis Penghasilan carries no asterisk on the live form yet drives the
        // derived Kode Objek Pajak, so requiredness is recorded here rather than
        // read off the label.
        const next: Record<string, string> = {};
        if (!draft.npwpPemotong) next.npwpPemotong = 'Kolom ini wajib diisi!';
        if (!draft.namaPemotong) next.namaPemotong = 'Kolom ini wajib diisi!';
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.dasarPengenaanPajak) next.dasarPengenaanPajak = 'Kolom ini wajib diisi!';
        if (!draft.pphTerutang) next.pphTerutang = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalTerbuka = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <!-- Tambah only: this grid has no Hapus Semua on the live form. -->
            <Button type="button" onclick={bukaTambah}>Tambah</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NPWP PEMOTONG/PEMUNGUT</th>
                    <th>NAMA PEMOTONG/PEMUNGUT</th>
                    <th>KODE OBJEK PAJAK</th>
                    <th>JENIS PENGHASILAN</th>
                    <th class="tw:text-end">DASAR PENGENAAN PAJAK (Rupiah)</th>
                    <th class="tw:text-end">PPh TERUTANG</th>
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
                        <td>{row.npwpPemotong}</td>
                        <td>{row.namaPemotong}</td>
                        <td>{row.kodeObjekPajak}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td class="tw:text-end">{formatRupiah(row.dasarPengenaanPajak)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pphTerutang)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 8 : 7} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH TABEL A</td>
                    <td class="tw:text-end">{formatRupiah(totalDpp)}</td>
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
                <span class="tw:text-lg">PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l2a-npwp"><span>NPWP Pemotong/Pemungut *</span></Label>
                    <Input id="l2a-npwp" type={"text"} bind:value={draft.npwpPemotong} />
                    {#if errors.npwpPemotong}<span class="error">{errors.npwpPemotong}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2a-nama"><span>Nama Pemotong/Pemungut *</span></Label>
                    <Input id="l2a-nama" type={"text"} bind:value={draft.namaPemotong} />
                    {#if errors.namaPemotong}<span class="error">{errors.namaPemotong}</span>{/if}
                </div>
                <div class="field">
                    <!-- Derived from Jenis Penghasilan on the live form, using the
                         real DJP object-code format (21-100-27). Plain text here. -->
                    <Label for="l2a-kode"><span>Kode Objek Pajak</span></Label>
                    <Input id="l2a-kode" type={"text"} bind:value={draft.kodeObjekPajak} />
                </div>
                <div class="field">
                    <Label for="l2a-jenis"><span>Jenis Penghasilan *</span></Label>
                    <Select id="l2a-jenis" bind:value={draft.jenisPenghasilan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l2_a_jenis_penghasilan ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2a-dpp"><span>Dasar Pengenaan Pajak *</span></Label>
                    <Input
                        id="l2a-dpp"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.dasarPengenaanPajak)}
                        oninput={(e: Event) => (draft.dasarPengenaanPajak = applyRupiahInput(e))}
                    />
                    {#if errors.dasarPengenaanPajak}<span class="error">{errors.dasarPengenaanPajak}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2a-pph"><span>PPh Terutang *</span></Label>
                    <Input
                        id="l2a-pph"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.pphTerutang)}
                        oninput={(e: Event) => (draft.pphTerutang = applyRupiahInput(e))}
                    />
                    {#if errors.pphTerutang}<span class="error">{errors.pphTerutang}</span>{/if}
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

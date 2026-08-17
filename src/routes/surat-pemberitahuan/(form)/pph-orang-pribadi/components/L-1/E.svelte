<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisBuktiPotong } from "./types";

    // E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh. Feeds Induk 10a.
    //
    // The footer is three rows, not one: this grid's own JUMLAH, then a KREDIT
    // PAJAK ATAS PENGHASILAN LUAR NEGERI row imported from L-2 C, then JUMLAH
    // BAGIAN E as their sum. It is that last figure the Induk reads, which is why
    // 10a aggregates two lampiran rather than one.
    interface Props {
        rows: BarisBuktiPotong[];
        referensi: Record<string, string[]>;
        // Imported from L-2 C, not entered here.
        kreditPajakLuarNegeri: number;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let {
        rows = $bindable(),
        referensi,
        kreditPajakLuarNegeri,
        dapatDiubah = true,
        readonly = false
    }: Props = $props();

    const kosong = (): BarisBuktiPotong => ({
        namaPemotong: '', npwpPemotong: '', nomorBukti: '', tanggalBukti: '',
        jenisPajak: '', penghasilanBruto: 0, pphDipotong: 0
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisBuktiPotong>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let jumlah = $derived(rows.reduce((s, r) => s + Number(r.pphDipotong || 0), 0));
    let jumlahBagianE = $derived(jumlah + kreditPajakLuarNegeri);

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
        if (!draft.namaPemotong) next.namaPemotong = 'Kolom ini wajib diisi!';
        if (!draft.npwpPemotong) next.npwpPemotong = 'Kolom ini wajib diisi!';
        if (!draft.nomorBukti) next.nomorBukti = 'Kolom ini wajib diisi!';
        if (!draft.tanggalBukti) next.tanggalBukti = 'Kolom ini wajib diisi!';
        if (!draft.jenisPajak) next.jenisPajak = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
        if (!draft.pphDipotong) next.pphDipotong = 'Kolom ini wajib diisi!';
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
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian E?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh</span>
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
                    <th>NAMA PEMOTONG/PEMUNGUT PPh</th>
                    <th>NPWP PEMOTONG/PEMUNGUT PPh</th>
                    <th>NOMOR BUKTI PEMOTONGAN/PEMUNGUTAN</th>
                    <th>TANGGAL BUKTI PEMOTONGAN/PEMUNGUTAN</th>
                    <th>JENIS PAJAK</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th class="tw:text-end">PPh YANG DIPOTONG/DIPUNGUT</th>
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
                        <td>{row.namaPemotong}</td>
                        <td>{row.npwpPemotong}</td>
                        <td>{row.nomorBukti}</td>
                        <td>{row.tanggalBukti}</td>
                        <td>{row.jenisPajak}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pphDipotong)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 9 : 8} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>JUMLAH</td>
                    <td class="tw:text-end">{formatRupiah(jumlah)}</td>
                </tr>
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI</td>
                    <td class="tw:text-end">{formatRupiah(kreditPajakLuarNegeri)}</td>
                </tr>
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>JUMLAH BAGIAN E</td>
                    <td class="tw:text-end">{formatRupiah(jumlahBagianE)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">Penghasilan Bruto</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="e-nama"><span>Nama Pemotong/Pemungut PPh *</span></Label>
                    <Input id="e-nama" type={"text"} bind:value={draft.namaPemotong} />
                    {#if errors.namaPemotong}<span class="error">{errors.namaPemotong}</span>{/if}
                </div>
                <div class="field">
                    <Label for="e-npwp"><span>NPWP Pemotong/Pemungut PPh *</span></Label>
                    <Input id="e-npwp" type={"text"} bind:value={draft.npwpPemotong} />
                    {#if errors.npwpPemotong}<span class="error">{errors.npwpPemotong}</span>{/if}
                </div>
                <div class="field">
                    <Label for="e-bukti"><span>Nomor Bukti Pemotongan/Pemungutan *</span></Label>
                    <Input id="e-bukti" type={"text"} bind:value={draft.nomorBukti} />
                    {#if errors.nomorBukti}<span class="error">{errors.nomorBukti}</span>{/if}
                </div>
                <div class="field">
                    <!-- The live form's picker cannot be typed into at all and
                         applies no tax-year validation; an ordinary date input is
                         used instead. -->
                    <Label for="e-tanggal"><span>Tanggal Bukti Pemotongan/Pemungutan *</span></Label>
                    <Input id="e-tanggal" type={"date"} bind:value={draft.tanggalBukti} />
                    {#if errors.tanggalBukti}<span class="error">{errors.tanggalBukti}</span>{/if}
                </div>
                <div class="field">
                    <Label for="e-jenis"><span>Jenis Pajak *</span></Label>
                    <Select id="e-jenis" bind:value={draft.jenisPajak}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l1_e_jenis_pajak ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.jenisPajak}<span class="error">{errors.jenisPajak}</span>{/if}
                </div>
                <div class="field">
                    <Label for="e-bruto"><span>Penghasilan Bruto *</span></Label>
                    <Input
                        id="e-bruto"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penghasilanBruto)}
                        oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
                    />
                    {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
                </div>
                <div class="field">
                    <Label for="e-pph"><span>PPh yang Dipotong/Dipungut *</span></Label>
                    <Input
                        id="e-pph"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.pphDipotong)}
                        oninput={(e: Event) => (draft.pphDipotong = applyRupiahInput(e))}
                    />
                    {#if errors.pphDipotong}<span class="error">{errors.pphDipotong}</span>{/if}
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

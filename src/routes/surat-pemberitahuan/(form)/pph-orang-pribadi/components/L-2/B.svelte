<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisBukanObjek } from "./types";

    // B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK. Feeds Induk 14d.
    //
    // Unlike section A this one has the full toolbar. Note the column order in
    // the grid does not follow the modal's field order: the grid shows SUMBER
    // PENGHASILAN (the name) before NIK/NPWP, while the modal asks for the NPWP
    // first.
    interface Props {
        rows: BarisBukanObjek[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisBukanObjek => ({
        kode: '', jenisPenghasilan: '', npwpSumber: '', namaSumber: '', penghasilanBruto: 0
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisBukanObjek>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penghasilanBruto || 0), 0));

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
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
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
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK</span>
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
                    <th>JENIS PENGHASILAN</th>
                    <th>SUMBER PENGHASILAN</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th>NIK/NPWP</th>
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
                        <td>{row.jenisPenghasilan}</td>
                        <td>{row.namaSumber}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanBruto)}</td>
                        <td>{row.npwpSumber}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 7 : 6} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 5 : 4}>JUMLAH TABEL B</td>
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
                <span class="tw:text-lg">PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l2b-kode"><span>Kode</span></Label>
                    <Input id="l2b-kode" type={"text"} bind:value={draft.kode} />
                </div>
                <div class="field">
                    <Label for="l2b-jenis"><span>Jenis Penghasilan *</span></Label>
                    <Select id="l2b-jenis" bind:value={draft.jenisPenghasilan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l2_b_jenis_penghasilan ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2b-npwp"><span>NPWP Sumber Penghasilan</span></Label>
                    <Input id="l2b-npwp" type={"text"} bind:value={draft.npwpSumber} />
                </div>
                <div class="field">
                    <Label for="l2b-nama"><span>Nama Sumber Penghasilan</span></Label>
                    <Input id="l2b-nama" type={"text"} bind:value={draft.namaSumber} />
                </div>
                <div class="field">
                    <Label for="l2b-bruto"><span>Penghasilan Bruto *</span></Label>
                    <Input
                        id="l2b-bruto"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penghasilanBruto)}
                        oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
                    />
                    {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
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

<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPekerjaan } from "./types";

    // D. PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN. Feeds Induk 1.a.
    //
    // The JUMLAH BAGIAN D footer totals the **neto**, not the bruto, and that is
    // the figure the Induk reads. Editable exactly when Induk 1.a is Ya.
    //
    // This is the only modal with no Kode field at all, and Penghasilan Neto is
    // genuine arithmetic (Bruto - Pengurang) rather than a lookup: the live modal
    // recalculates it on blur, so it stays derived and disabled here too.
    interface Props {
        rows: BarisPekerjaan[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisPekerjaan => ({
        nomorIdentitasPemberiKerja: '', namaPemberiKerja: '',
        penghasilanBruto: 0, pengurangPenghasilanBruto: 0, penghasilanNeto: 0
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPekerjaan>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penghasilanNeto || 0), 0));

    let draftNeto = $derived(
        Number(draft.penghasilanBruto || 0) - Number(draft.pengurangPenghasilanBruto || 0)
    );

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
        if (!draft.nomorIdentitasPemberiKerja) next.nomorIdentitasPemberiKerja = 'Kolom ini wajib diisi!';
        if (!draft.namaPemberiKerja) next.namaPemberiKerja = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
        if (!draft.pengurangPenghasilanBruto) next.pengurangPenghasilanBruto = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        const baris = { ...draft, penghasilanNeto: draftNeto };
        if (indeksDiubah === null) rows = [...rows, baris];
        else rows = rows.map((r, i) => (i === indeksDiubah ? baris : r));
        modalTerbuka = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian D?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN</span>
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
                    <th>NAMA PEMBERI KERJA</th>
                    <th>NOMOR IDENTITAS PEMBERI KERJA</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th class="tw:text-end">PENGURANG PENGHASILAN BRUTO/BIAYA</th>
                    <th class="tw:text-end">PENGHASILAN NETO</th>
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
                        <td>{row.namaPemberiKerja}</td>
                        <td>{row.nomorIdentitasPemberiKerja}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pengurangPenghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanNeto)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 7 : 6} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH BAGIAN D</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="d-identitas"><span>Nomor Identitas Pemberi Kerja *</span></Label>
                    <Input id="d-identitas" type={"text"} bind:value={draft.nomorIdentitasPemberiKerja} />
                    {#if errors.nomorIdentitasPemberiKerja}<span class="error">{errors.nomorIdentitasPemberiKerja}</span>{/if}
                </div>
                <div class="field">
                    <Label for="d-nama"><span>Nama Pemberi Kerja *</span></Label>
                    <Input id="d-nama" type={"text"} bind:value={draft.namaPemberiKerja} />
                    {#if errors.namaPemberiKerja}<span class="error">{errors.namaPemberiKerja}</span>{/if}
                </div>
                <div class="field">
                    <Label for="d-bruto"><span>Penghasilan Bruto *</span></Label>
                    <Input
                        id="d-bruto"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penghasilanBruto)}
                        oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
                    />
                    {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
                </div>
                <div class="field">
                    <Label for="d-pengurang"><span>Pengurang Penghasilan Bruto/Biaya *</span></Label>
                    <Input
                        id="d-pengurang"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.pengurangPenghasilanBruto)}
                        oninput={(e: Event) => (draft.pengurangPenghasilanBruto = applyRupiahInput(e))}
                    />
                    {#if errors.pengurangPenghasilanBruto}<span class="error">{errors.pengurangPenghasilanBruto}</span>{/if}
                </div>
                <div class="field">
                    <Label for="d-neto"><span>Penghasilan Neto</span></Label>
                    <Input id="d-neto" class={"tw:text-end"} type={"text"} value={formatRupiah(draftNeto)} disabled />
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

<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import CheckableSelect from "$lib/components/CheckableSelect.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import { computeLabaRugiRows, type LabaRugiAkunTemplate } from "../../../pph-badan/components/L1/labaRugiRollup";
    import type { BarisLabaRugi, KodeKoreksiFiskal } from "./types";

    // A.1, LAPORAN LABA RUGI.
    //
    // Rows are fixed (no Tambah/Hapus): the chart of accounts is pre-seeded per
    // sektor, and only accounts of rowType 'data' get a pencil. Subtotal rows
    // (4300, 5400, 4800) and group captions have none, matching the live form.
    //
    // The rollup itself (computeLabaRugiRows) is reused as-is from the SPT PPh
    // Badan L1 component: it is pure tree-walking logic with no schema
    // coupling, and the sign/income-expense rules it encodes
    // (spt_pph_badan_l1_income_expense, spt_pph_badan_l1_fiskal_sign) were
    // measured to hold identically here in L3A.md. Only the chart-of-accounts
    // *data* is a separate, OP-owned copy.
    //
    // Rows are keyed by `kode` on the frontend, not the database row id: the
    // client only ever has the one sektor's template in view, and kode is
    // unique within a sektor.
    interface AkunRow {
        id: string;
        kode: string | null;
        namaAkun: string;
        rowType: 'header' | 'data' | 'sum';
        classification: 'income' | 'expense' | null;
        parentKode: string | null;
        sign: number | null;
    }

    interface Props {
        akun: AkunRow[];
        labaRugi: BarisLabaRugi[];
        kodeKoreksiFiskal: KodeKoreksiFiskal[];
        readonly?: boolean;
    }

    let { akun, labaRugi = $bindable(), kodeKoreksiFiskal, readonly = false }: Props = $props();

    const kodeKoreksiFiskalOptions = $derived(
        kodeKoreksiFiskal.map((row) => ({
            value: row.kode,
            label: `${row.kode} — ${row.nama}`,
            group: row.jenis === 'positif' ? 'Penyesuaian Fiskal Positif' : 'Penyesuaian Fiskal Negatif'
        }))
    );

    const template: LabaRugiAkunTemplate[] = $derived(
        akun.map((row, index) => ({
            id: row.id,
            nomorUrut: index + 1,
            kode: row.kode,
            namaAkun: row.namaAkun,
            rowType: row.rowType,
            classification: row.classification,
            parentKode: row.parentKode,
            sign: row.sign
        }))
    );

    const byAkunId = $derived(new Map(labaRugi.map((row) => [row.akunId, row])));

    const leafValues = $derived(
        labaRugi.map((row) => ({
            akunId: row.akunId,
            nilaiKomersial: row.nilaiKomersial,
            nonObjekPajak: row.nonObjekPajak,
            dikenakanPphFinal: row.dikenakanPphFinal,
            penyesuaianFiskalPositif: row.penyesuaianFiskalPositif,
            penyesuaianFiskalNegatif: row.penyesuaianFiskalNegatif,
            kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
        }))
    );

    const computedRows = $derived(computeLabaRugiRows(template, leafValues));
    const formatNilai = (value: number) => (value === 0 ? '' : formatRupiah(value));

    const kosong = (akunId: string): BarisLabaRugi => ({
        akunId,
        nilaiKomersial: 0,
        nonObjekPajak: 0,
        dikenakanPphFinal: 0,
        penyesuaianFiskalPositif: 0,
        penyesuaianFiskalNegatif: 0,
        kodePenyesuaianFiskal: []
    });

    let modalTerbuka = $state(false);
    let draft = $state<BarisLabaRugi>(kosong(''));
    let draftLabel = $state('');
    let draftHasFiskalSplit = $state(false);
    let draftClassification = $state<'income' | 'expense' | null>(null);
    let errors = $state<Record<string, string>>({});

    function bukaUbah(row: (typeof computedRows)[number]) {
        if (!row.akunId) return;
        draft = { ...(byAkunId.get(row.akunId) ?? kosong(row.akunId)) };
        draftLabel = `${row.kode} — ${row.namaAkun}`;
        draftHasFiskalSplit = row.hasFiskalSplit;
        draftClassification = row.classification;
        errors = {};
        modalTerbuka = true;
    }

    // Live preview inside the modal, matching the modal's own instant
    // recalculation on the real form.
    let draftTidakFinal = $derived(
        draftHasFiskalSplit
            ? draft.nilaiKomersial - draft.nonObjekPajak - draft.dikenakanPphFinal
            : draft.nilaiKomersial
    );
    let draftFiskalSign = $derived(draftClassification === 'expense' ? -1 : 1);
    let draftNilaiFiskal = $derived(
        draftTidakFinal + draftFiskalSign * (draft.penyesuaianFiskalPositif - draft.penyesuaianFiskalNegatif)
    );

    function simpanModal() {
        // KODE PENYESUAIAN FISKAL becomes mandatory the moment either
        // adjustment amount is nonzero, and is otherwise optional. Measured on
        // the live form: Simpan was rejected only once an adjustment existed.
        const adaPenyesuaian = draft.penyesuaianFiskalPositif !== 0 || draft.penyesuaianFiskalNegatif !== 0;
        const next: Record<string, string> = {};
        if (adaPenyesuaian && draft.kodePenyesuaianFiskal.length === 0) {
            next.kodePenyesuaianFiskal = 'Kolom ini wajib diisi!';
        }
        errors = next;
        if (Object.keys(next).length > 0) return;

        const existing = labaRugi.filter((row) => row.akunId !== draft.akunId);
        labaRugi = [...existing, draft];
        modalTerbuka = false;
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold">A.1. LAPORAN LABA RUGI</span>
    <div class="tw:overflow-x-auto tw:mt-2">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if !readonly}<th class="tw:w-[6rem]">TINDAKAN</th>{/if}
                    <th>KODE AKUN</th>
                    <th>NAMA AKUN</th>
                    <th class="tw:text-end">NILAI KOMERSIAL</th>
                    <th class="tw:text-end">TIDAK TERMASUK OBJEK PAJAK</th>
                    <th class="tw:text-end">DIKENAKAN PPh BERSIFAT FINAL</th>
                    <th class="tw:text-end">OBJEK PAJAK TIDAK FINAL</th>
                    <th class="tw:text-end">PENYESUAIAN FISKAL POSITIF</th>
                    <th class="tw:text-end">PENYESUAIAN FISKAL NEGATIF</th>
                    <th>KODE PENYESUAIAN FISKAL</th>
                    <th class="tw:text-end">NILAI FISKAL</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each computedRows as row (row.nomorUrut)}
                    {#if row.rowType === 'header'}
                        <tr class="group-header">
                            <td colspan="11">{row.namaAkun}</td>
                        </tr>
                    {:else}
                        <tr class={row.rowType === 'sum' ? 'sum-row' : ''}>
                            {#if !readonly}
                                <td class="tw:text-center">
                                    {#if row.rowType === 'data'}
                                        <Button type="button" onclick={() => bukaUbah(row)}>Ubah</Button>
                                    {/if}
                                </td>
                            {/if}
                            <td>{row.kode}</td>
                            <td>{row.namaAkun}</td>
                            <td class="tw:text-end">{formatNilai(row.nilaiKomersial)}</td>
                            <td class="tw:text-end">{row.hasFiskalSplit || row.rowType !== 'data' ? formatNilai(row.nonObjekPajak) : ''}</td>
                            <td class="tw:text-end">{row.hasFiskalSplit || row.rowType !== 'data' ? formatNilai(row.dikenakanPphFinal) : ''}</td>
                            <td class="tw:text-end">{formatNilai(row.objekPajakTidakFinal)}</td>
                            <td class="tw:text-end">{formatNilai(row.penyesuaianFiskalPositif)}</td>
                            <td class="tw:text-end">{formatNilai(row.penyesuaianFiskalNegatif)}</td>
                            <td>{row.kodePenyesuaianFiskal.join(', ')}</td>
                            <td class="tw:text-end">{formatNilai(row.nilaiFiskal)}</td>
                        </tr>
                    {/if}
                {/each}
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">{draftLabel}</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l3a-komersial"><span>Nilai Komersial *</span></Label>
                    <Input
                        id="l3a-komersial"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nilaiKomersial)}
                        oninput={(e: Event) => (draft.nilaiKomersial = applyRupiahInput(e))}
                    />
                </div>
                <div class="field">
                    <!-- Disabled on 5xxx expense rows: only 4xxx income rows split
                         across the three tax-treatment columns. -->
                    <Label for="l3a-nonobjek"><span>Tidak Termasuk Objek Pajak</span></Label>
                    <Input
                        id="l3a-nonobjek"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.nonObjekPajak)}
                        oninput={(e: Event) => (draft.nonObjekPajak = applyRupiahInput(e))}
                        disabled={!draftHasFiskalSplit}
                    />
                </div>
                <div class="field">
                    <Label for="l3a-final"><span>Dikenakan PPh Bersifat Final</span></Label>
                    <Input
                        id="l3a-final"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.dikenakanPphFinal)}
                        oninput={(e: Event) => (draft.dikenakanPphFinal = applyRupiahInput(e))}
                        disabled={!draftHasFiskalSplit}
                    />
                </div>
                <div class="field">
                    <Label for="l3a-tidakfinal"><span>Objek Pajak Tidak Final</span></Label>
                    <Input id="l3a-tidakfinal" class={"tw:text-end"} type={"text"} value={formatRupiah(draftTidakFinal)} disabled />
                </div>
                <div class="field">
                    <Label for="l3a-positif"><span>Penyesuaian Fiskal Positif</span></Label>
                    <Input
                        id="l3a-positif"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penyesuaianFiskalPositif)}
                        oninput={(e: Event) => (draft.penyesuaianFiskalPositif = applyRupiahInput(e))}
                    />
                </div>
                <div class="field">
                    <Label for="l3a-negatif"><span>Penyesuaian Fiskal Negatif</span></Label>
                    <Input
                        id="l3a-negatif"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penyesuaianFiskalNegatif)}
                        oninput={(e: Event) => (draft.penyesuaianFiskalNegatif = applyRupiahInput(e))}
                    />
                </div>
                <div class="field">
                    <Label for="l3a-kode-koreksi"><span>Kode Penyesuaian Fiskal</span></Label>
                    <CheckableSelect
                        id="l3a-kode-koreksi"
                        bind:value={draft.kodePenyesuaianFiskal}
                        options={kodeKoreksiFiskalOptions}
                        placeholder={"Tidak ada"}
                    />
                    {#if errors.kodePenyesuaianFiskal}<span class="error">{errors.kodePenyesuaianFiskal}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l3a-fiskal"><span>Nilai Fiskal (Sebelum Fasilitas Perpajakan)</span></Label>
                    <Input id="l3a-fiskal" class={"tw:text-end"} type={"text"} value={formatRupiah(draftNilaiFiskal)} disabled />
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
    	font-size: .65rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .3rem .4rem;
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
    .group-header td { font-weight: bold; background-color: #f3f3f3; }
    .sum-row { font-weight: bold; background-color: #F9F6EE; }

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

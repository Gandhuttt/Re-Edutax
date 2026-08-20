<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput } from "$lib/helpers/rupiahInput";
    import { computeNeracaRows, type NeracaAkunTemplate, type NeracaComputedRow } from "../../../pph-badan/components/L1/neracaRollup";
    import type { BarisNeraca } from "./types";

    // A.2, LAPORAN POSISI KEUANGAN (NERACA).
    //
    // Two side-by-side tables, aset on the left and liabilitas plus ekuitas on
    // the right. Values are typed inline, there is no row editor: that is the
    // one structural difference from A.1.
    //
    // computeNeracaRows is reused as-is from the SPT PPh Badan L1 Section B
    // component. It is pure tree-walking over parentKode/sign, with no schema
    // coupling, and the OP chart uses the same shape — the only difference is
    // that OP has no 1500/1699 sub-subtotals, so every aset row folds straight
    // into 1700.
    interface AkunRow {
        id: string;
        kode: string | null;
        namaAkun: string;
        rowType: 'header' | 'data' | 'sum';
        section: 'aset' | 'liabilitas_ekuitas';
        parentKode: string | null;
        sign: number | null;
    }

    interface Props {
        akun: AkunRow[];
        neraca: BarisNeraca[];
        readonly?: boolean;
    }

    let { akun, neraca = $bindable(), readonly = false }: Props = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    const template: NeracaAkunTemplate[] = $derived(
        akun.map((row, index) => ({
            id: row.id,
            nomorUrut: index + 1,
            kode: row.kode,
            namaAkun: row.namaAkun,
            rowType: row.rowType,
            section: row.section,
            parentKode: row.parentKode,
            sign: row.sign
        }))
    );

    const computed = $derived(computeNeracaRows(template, neraca));
    const asetRows = $derived(computed.filter((row) => row.section === 'aset'));
    const liabilitasEkuitasRows = $derived(computed.filter((row) => row.section === 'liabilitas_ekuitas'));

    // Aset must equal liabilitas plus ekuitas. Coretax does not block entry on
    // this, but its posting-time validation does reject the return:
    // isFinancialStatementTotalValid() compares AC1700 against AC3300, and the
    // caller raises "Grid A.2 ... Total Assets must equals with Total
    // Liabilities and Equity". Surfaced here as a warning while typing so the
    // peserta is not first told at posting.
    const jumlahAset = $derived(computed.find((row) => row.kode === '1700')?.nilai ?? 0);
    const jumlahLiabilitasEkuitas = $derived(computed.find((row) => row.kode === '3300')?.nilai ?? 0);
    const seimbang = $derived(jumlahAset === jumlahLiabilitasEkuitas);

    // Every data row of the sektor in view needs a local entry to bind to, even
    // before this SPT has ever been saved with that sektor.
    $effect(() => {
        const sudahAda = new Set(neraca.map((row) => row.akunId));
        const kurang = template.filter((row) => row.rowType === 'data' && !sudahAda.has(row.id));
        if (kurang.length === 0) return;

        neraca.push(...kurang.map((row) => ({ akunId: row.id, nilai: 0 })));
    });

    const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));

    function handleInput(e: Event, akunId: string) {
        const nilai = applyRupiahInput(e);
        const index = neraca.findIndex((row) => row.akunId === akunId);
        if (index !== -1) neraca[index] = { ...neraca[index], nilai };
    }
</script>

{#snippet neracaTable(rows: NeracaComputedRow[])}
    <div class="tw:overflow-auto">
        <Table class="tw:w-full">
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><input type="text" /></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[6rem]"><span>KODE AKUN</span></td>
                    <td><span>AKUN</span></td>
                    <td class="tw:w-[12rem]"><span>NILAI</span></td>
                </tr>
                {#each rows as row (row.nomorUrut)}
                    {#if row.rowType === 'header'}
                        <tr class="group-header">
                            <td colspan="3">{row.namaAkun}</td>
                        </tr>
                    {:else}
                        <tr class={row.rowType === 'sum' ? 'sum-row' : 'data-row'}>
                            <td>{row.kode}</td>
                            <td>{row.namaAkun}</td>
                            <td class="tw:text-end">
                                <input
                                    type="text"
                                    inputmode="numeric"
                                    class="tw:w-full tw:text-end"
                                    value={formatNilai(row.nilai)}
                                    readonly={row.rowType !== 'data'}
                                    disabled={readonly || row.rowType !== 'data'}
                                    oninput={(e) => handleInput(e, row.akunId ?? '')}
                                />
                            </td>
                        </tr>
                    {/if}
                {/each}
            {/snippet}
        </Table>
    </div>
{/snippet}

<div class="tw:flex tw:flex-col tw:gap-4">
    <span class="tw:text-sm tw:font-bold">A.2. LAPORAN POSISI KEUANGAN (NERACA)</span>

    {#if !seimbang}
        <span class="tw:text-sm tw:text-red-700">
            Jumlah Aset ({rupiah.format(jumlahAset)}) harus sama dengan Jumlah Liabilitas dan Ekuitas
            ({rupiah.format(jumlahLiabilitasEkuitas)}).
        </span>
    {/if}

    <div class="tw:flex tw:flex-row tw:gap-4 tw:items-start">
        <div class="tw:flex tw:flex-col tw:gap-2 tw:basis-1/2 tw:min-w-0">
            <span class="tw:text-sm tw:font-bold">ASET</span>
            {@render neracaTable(asetRows)}
        </div>
        <div class="tw:flex tw:flex-col tw:gap-2 tw:basis-1/2 tw:min-w-0">
            <span class="tw:text-sm tw:font-bold">LIABILITAS DAN EKUITAS</span>
            {@render neracaTable(liabilitasEkuitasRows)}
        </div>
    </div>
</div>

<style>
    .group-header td {
        font-weight: bold;
        background-color: #f3f3f3;
    }

    .sum-row {
        font-weight: bold;
    }

    .data-row:nth-child(even) {
        background-color: #f9f6ee;
    }

    .header td {
        border: 1px solid white;
    }

    td {
        padding: 0.5rem 0.75rem;
        word-wrap: break-word;
        font-size: 0.8rem;
    }
</style>

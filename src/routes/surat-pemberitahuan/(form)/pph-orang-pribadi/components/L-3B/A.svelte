<script lang="ts">
    import {
        ActionButton,
        DataTable,
        InstitutionalModal,
        TableActions
    } from "$lib/re-ui-components";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import { hitungPeredaranBrutoFinal } from "./hitungPeredaranBrutoFinal";
    import type { BarisFinalBulanan } from "./types";

    // A. REKAPITULASI PEREDARAN BRUTO TERTENTU, FINAL (PP 55/2022).
    //
    // Unlike every other lampiran grid, the row here is not user-added: it is
    // seeded from the single registered TKU (see DAFTAR TKU in _L3B.svelte) and
    // can only be edited, never added or deleted, matching L3B.md's "no Tambah
    // anywhere in this lampiran" finding. What the TKU row's monthly amounts ARE
    // is row a. JUMLAH PEREDARAN BRUTO itself (with a single TKU the two are
    // identical), so no separate "a." row is rendered, same simplification
    // Badan's L5 B.svelte makes for the same reason.
    //
    // f (DISETOR SENDIRI) is fixed at 0, non-editable, mirroring Badan L5's same
    // footer row. g (DIPOTONG/DIPUNGUT PIHAK LAIN) is the one editable footer.
    const bulanNames = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];

    interface Props {
        rows: BarisFinalBulanan[];
        namaTku: string;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), namaTku, dapatDiubah = true, readonly = false }: Props = $props();

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let modalOpen = $state(false);
    let draft = $state<BarisFinalBulanan[]>(rows.map((r) => ({ ...r })));

    let hasil = $derived(
        hitungPeredaranBrutoFinal(
            rows.map((r) => ({
                peredaranBruto: Number(r.peredaranBruto || 0),
                disetorSendiri: 0,
                dipotongPihakLain: Number(r.dipotongPihakLain || 0)
            }))
        )
    );

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        modalOpen = true;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        modalOpen = false;
    }

    function ubahDipotong(index: number, e: Event) {
        rows = rows.map((r, i) => (i === index ? { ...r, dipotongPihakLain: applyRupiahInput(e) } : r));
    }
</script>

<DataTable
    label="Rekapitulasi peredaran bruto tertentu"
    minWidth="1700px"
    framed={false}
    headerTone="navy"
    density="compact"
>
    <table>
        <thead>
            <tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}
                <th scope="col">Nama TKU</th>
                {#each bulanNames as bulan}
                    <th scope="col" class="right">{bulan}</th>
                {/each}
                <th scope="col" class="right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                {#if bisaEdit}
                    <td class="action-cell">
                        <TableActions
                            visibleCount={1}
                            actions={[{ label: "Ubah", onclick: bukaUbah }]}
                        />
                    </td>
                {/if}
                <td>{namaTku}</td>
                {#each hasil.baris as baris}
                    <td class="right number">{formatRupiahDerived(baris.peredaranBruto)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(hasil.totalBruto)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">b. Akumulasi Peredaran Bruto</th>
                {#each hasil.baris as baris}
                    <td class="right number">{formatRupiahDerived(baris.akumulasi)}</td>
                {/each}
                <td></td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">c. Peredaran Bruto Tidak Kena Pajak</th>
                <td class="right number" colspan="12">500.000.000</td>
                <td class="right number amount">500.000.000</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">d. Peredaran Bruto Kena Pajak</th>
                {#each hasil.baris as baris}
                    <td class="right number">{formatRupiahDerived(baris.kenaPajak)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(hasil.totalKenaPajak)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">e. Jumlah PPh Final Terutang</th>
                {#each hasil.baris as baris}
                    <td class="right number">{formatRupiahDerived(baris.pphTerutang)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(hasil.totalPphTerutang)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">f. PPh Final yang Disetor Sendiri</th>
                {#each bulanNames as _}
                    <td class="right number">0</td>
                {/each}
                <td class="right number amount">0</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">g. Jumlah PPh Final Dipotong/Dipungut Pihak Lain</th>
                {#each rows as row, index}
                    <td class="right number">
                        {#if bisaEdit}
                            <input
                                type="text"
                                inputmode="numeric"
                                aria-label={`PPh final dipotong atau dipungut pihak lain ${bulanNames[index]}`}
                                value={formatRupiah(row.dipotongPihakLain)}
                                oninput={(e) => ubahDipotong(index, e)}
                                class="table-rupiah-input"
                            />
                        {:else}
                            {formatRupiahDerived(row.dipotongPihakLain)}
                        {/if}
                    </td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(hasil.totalDipotongPihakLain)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row">h. Selisih (e-f-g)</th>
                {#each hasil.baris as baris}
                    <td class="right number">{formatRupiahDerived(baris.selisih)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(hasil.totalSelisih)}</td>
            </tr>
        </tbody>
    </table>
</DataTable>

<InstitutionalModal
    bind:open={modalOpen}
    title={`Rekapitulasi Peredaran Bruto Tertentu - ${namaTku}`}
    size="wide"
    scrollable
>
    <DataTable
        label={`Peredaran bruto bulanan ${namaTku}`}
        minWidth="520px"
        framed={false}
        headerTone="navy"
        density="compact"
    >
        <table>
            <thead>
                <tr>
                    <th scope="col">Bulan</th>
                    <th scope="col" class="right">Peredaran Bruto (Rp)</th>
                </tr>
            </thead>
            <tbody>
                {#each draft as item, index}
                    <tr>
                        <td>{bulanNames[index]}</td>
                        <td>
                            <input
                                type="text"
                                inputmode="numeric"
                                aria-label={`Peredaran bruto ${bulanNames[index]}`}
                                value={formatRupiah(item.peredaranBruto)}
                                oninput={(e) => (draft[index].peredaranBruto = applyRupiahInput(e))}
                                class="table-rupiah-input"
                            />
                        </td>
                    </tr>
                {/each}
            </tbody>
            <tfoot>
                <tr>
                    <th scope="row">Jumlah</th>
                    <td class="right number amount">
                        {formatRupiahDerived(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
                    </td>
                </tr>
            </tfoot>
        </table>
    </DataTable>
    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

<style>
    .table-rupiah-input {
        width: 100%;
        min-width: 100px;
        padding: 6px 8px;
        border: 1px solid var(--ui-line-strong);
        border-radius: 3px;
        background: #fffefa;
        text-align: right;
    }

    .table-rupiah-input:focus {
        outline: 3px solid var(--ui-yellow-soft);
        border-color: var(--ui-navy);
    }

    .summary-row th,
    .summary-row td {
        font-weight: 700;
        background: var(--ui-paper-deep);
    }
</style>

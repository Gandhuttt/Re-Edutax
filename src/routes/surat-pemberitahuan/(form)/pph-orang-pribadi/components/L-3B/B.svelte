<script lang="ts">
    import {
        ActionButton,
        DataTable,
        InstitutionalModal,
        TableActions
    } from "$lib/re-ui-components";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisPeredaranBulanan } from "./types";

    // B. ORANG PRIBADI PENGUSAHA TERTENTU (OPPT).
    //
    // JUMLAH PPh is always 0 here: OPPT's 0,75% angsuran is computed at Induk
    // 13c, not in L-3B. Metode Pembukuan is inherited from the SPT header, shown
    // read-only, never editable here.
    const bulanNames = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];

    interface Props {
        rows: BarisPeredaranBulanan[];
        namaTku: string;
        metodePembukuanLabel: string;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), namaTku, metodePembukuanLabel, dapatDiubah = true, readonly = false }: Props = $props();

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let jumlahBruto = $derived(rows.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0));
    let modalOpen = $state(false);
    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        modalOpen = true;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        modalOpen = false;
    }
</script>

<p class="tw:mb-2 tw:text-sm">
    Kotak metode pembukuan diisi dengan angka 1 atau 2 sesuai daftar di bawah ini: METODE
    PEMBUKUAN: 1. PENCATATAN, 2. PEMBUKUAN STELSEL KAS ATAU PEMBUKUAN STELSEL AKRUAL
</p>

<DataTable
    label="Peredaran bruto orang pribadi pengusaha tertentu"
    minWidth="1800px"
    framed={false}
    headerTone="navy"
    density="compact"
>
    <table>
        <thead>
            <tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}
                <th scope="col">Nama TKU</th>
                <th scope="col">Metode Pembukuan</th>
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
                <td>{metodePembukuanLabel}</td>
                {#each rows as row}
                    <td class="right number">{formatRupiahDerived(row.peredaranBruto)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(jumlahBruto)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row" colspan="2">Jumlah Peredaran Bruto</th>
                {#each rows as row}
                    <td class="right number">{formatRupiahDerived(row.peredaranBruto)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(jumlahBruto)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row" colspan="2">Jumlah PPh</th>
                {#each bulanNames as _}
                    <td class="right number">0</td>
                {/each}
                <td class="right number amount">0</td>
            </tr>
        </tbody>
    </table>
</DataTable>

<InstitutionalModal
    bind:open={modalOpen}
    title={`Peredaran Bruto Wajib Pajak Orang Pribadi Pengusaha Tertentu (OPPT) - ${namaTku}`}
    size="wide"
    scrollable
>
    <p class="tw:mb-3 tw:text-sm">
        Metode Pembukuan/Pencatatan: {metodePembukuanLabel} (tidak dapat diubah di sini)
    </p>
    <DataTable
        label={`Peredaran bruto bulanan OPPT ${namaTku}`}
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

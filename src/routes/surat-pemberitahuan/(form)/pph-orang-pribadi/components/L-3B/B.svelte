<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPeredaranBulanan } from "./types";

    // B. ORANG PRIBADI PENGUSAHA TERTENTU (OPPT).
    //
    // JUMLAH PPh is always 0 here: OPPT's 0,75% angsuran is computed at Induk
    // 13c, not in L-3B (measured in L3B.md: entering 400.000.000 in Januari gave
    // JUMLAH PPh = 0). Metode Pembukuan is inherited from the SPT header, shown
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

    let modalTerbuka = $state(false);
    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        modalTerbuka = true;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        modalTerbuka = false;
    }
</script>

<div class="tw:mb-6">
    <p class="tw:text-xs tw:mb-2">
        Kotak metode pembukuan diisi dengan angka 1 atau 2 sesuai daftar di bawah ini: METODE
        PEMBUKUAN: 1. PENCATATAN, 2. PEMBUKUAN STELSEL KAS ATAU PEMBUKUAN STELSEL AKRUAL
    </p>

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[6rem]">TINDAKAN</th>{/if}
                    <th>NAMA TKU</th>
                    <th class="tw:text-center">METODE PEMBUKUAN</th>
                    {#each bulanNames as bulan}
                        <th class="tw:text-end">{bulan}</th>
                    {/each}
                    <th class="tw:text-end">JUMLAH</th>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr>
                    {#if bisaEdit}
                        <td>
                            <Button type="button" onclick={bukaUbah}>Ubah</Button>
                        </td>
                    {/if}
                    <td>{namaTku}</td>
                    <td class="tw:text-center">{metodePembukuanLabel}</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiah(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiah(jumlahBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td colspan="2">JUMLAH PEREDARAN BRUTO</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiah(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiah(jumlahBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td colspan="2">JUMLAH PPh</td>
                    {#each bulanNames as _}
                        <td class="tw:text-end">0</td>
                    {/each}
                    <td class="tw:text-end">0</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">PEREDARAN BRUTO WAJIB PAJAK ORANG PRIBADI PENGUSAHA TERTENTU (OPPT) - {namaTku}</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <p class="tw:text-xs tw:mb-2">Metode Pembukuan/Pencatatan: {metodePembukuanLabel} (tidak dapat diubah di sini)</p>
                <table class="tw:w-full tw:text-sm">
                    <thead>
                        <tr>
                            <th class="tw:text-left">Bulan</th>
                            <th class="tw:text-end">Peredaran Bruto</th>
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
                                        value={formatRupiah(item.peredaranBruto)}
                                        oninput={(e) => (draft[index].peredaranBruto = applyRupiahInput(e))}
                                        class="tw:w-full tw:text-end"
                                    />
                                </td>
                            </tr>
                        {/each}
                        <tr class="tw:font-bold">
                            <td>JUMLAH</td>
                            <td class="tw:text-end">
                                {formatRupiah(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
                            </td>
                        </tr>
                    </tbody>
                </table>
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
    	font-size: .75rem;
    	padding: .3rem .4rem;
    	white-space: nowrap;
    	border: 1px solid white;
    }
    tr:not(.total):not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
    }
    tr.footer td {
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
        width: min(32rem, 92vw);
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
    .body { overflow-y: auto; padding: 1rem; }
    .body table th, .body table td { padding: .3rem .4rem; }
</style>

<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisKompensasi } from "./types";

    // A. PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL.
    //
    // A fixed matrix, no Tambah/Hapus and no row count to manage: ten rows,
    // tahun pajak and the nine years before it, always present. Same shape as
    // SPT Badan's L7 (six columns named by their offset from the SPT's own
    // tahun pajak, not by absolute year), but with a wider row range: Badan
    // shows five loss-year rows against the five-year carryforward window,
    // this shows ten.
    //
    // The row set is fixed regardless of the gate; only whether cells are
    // editable changes. A Tidak on Induk row 3 still displays the matrix, just
    // with every pencil disabled.
    //
    // Only the kompensasiTahunIni column feeds Induk (row 3, together with
    // Bagian B). The other five columns are historical record only.
    interface Props {
        rows: BarisKompensasi[];
        tahunPajak: number;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), tahunPajak, dapatDiubah = true, readonly = false }: Props = $props();

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisKompensasi>({
        tahunPajak: 0,
        labaRugiNetoFiskal: 0,
        kompensasiYMin4: 0,
        kompensasiYMin3: 0,
        kompensasiYMin2: 0,
        kompensasiYMin1: 0,
        kompensasiTahunIni: 0,
        kompensasiYPlus1: 0
    });

    let bisaEdit = $derived(dapatDiubah && !readonly);

    // A row outside the six-column window (a loss more than four years before
    // the SPT year) has no column of its own to disable.
    const OFFSET_KEY = {
        '-4': 'kompensasiYMin4',
        '-3': 'kompensasiYMin3',
        '-2': 'kompensasiYMin2',
        '-1': 'kompensasiYMin1',
        '0': 'kompensasiTahunIni',
        '1': 'kompensasiYPlus1'
    } as const;

    function kolomSendiri(row: BarisKompensasi): keyof BarisKompensasi | null {
        const offset = row.tahunPajak - tahunPajak;
        return OFFSET_KEY[String(offset) as keyof typeof OFFSET_KEY] ?? null;
    }

    let draftKolomSendiri = $derived(kolomSendiri(draft));

    let jumlah = $derived(
        rows.reduce(
            (acc, row) => ({
				yMin4: acc.yMin4 + row.kompensasiYMin4,
				yMin3: acc.yMin3 + row.kompensasiYMin3,
				yMin2: acc.yMin2 + row.kompensasiYMin2,
				yMin1: acc.yMin1 + row.kompensasiYMin1,
				tahunIni: acc.tahunIni + row.kompensasiTahunIni,
				yPlus1: acc.yPlus1 + row.kompensasiYPlus1
			}),
            { yMin4: 0, yMin3: 0, yMin2: 0, yMin1: 0, tahunIni: 0, yPlus1: 0 }
        )
    );

    function bukaUbah(index: number) {
        indeksDiubah = index;
        draft = { ...rows[index] };
        modalTerbuka = true;
    }

    function simpanModal() {
        if (indeksDiubah === null) return;
        rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalTerbuka = false;
    }
</script>

<div class="tw:mb-6">
    <div class="tw:overflow-x-auto tw:mt-2">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[6rem]" rowspan="2">TINDAKAN</th>{/if}
                    <th class="tw:w-[3rem]" rowspan="2">NO.</th>
                    <th colspan="2">LABA/RUGI NETO FISKAL</th>
                    <th colspan="6">JUMLAH KOMPENSASI KERUGIAN FISKAL</th>
                </tr>
                <tr>
                    <th>TAHUN PAJAK/BAGIAN TAHUN PAJAK</th>
                    <th class="tw:text-end">NILAI (RUPIAH)</th>
                    <th class="tw:text-end">TAHUN {tahunPajak - 4}</th>
                    <th class="tw:text-end">TAHUN {tahunPajak - 3}</th>
                    <th class="tw:text-end">TAHUN {tahunPajak - 2}</th>
                    <th class="tw:text-end">TAHUN {tahunPajak - 1}</th>
                    <th class="tw:text-end">TAHUN {tahunPajak} (TAHUN PAJAK INI)</th>
                    <th class="tw:text-end">TAHUN {tahunPajak + 1} (TAHUN PAJAK BERJALAN)</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td>
                                <Button type="button" onclick={() => bukaUbah(index)}>Ubah</Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.tahunPajak}</td>
                        <td class="tw:text-end">{formatRupiah(row.labaRugiNetoFiskal)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiYMin4)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiYMin3)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiYMin2)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiYMin1)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiTahunIni)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kompensasiYPlus1)}</td>
                    </tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 4 : 3}>JUMLAH BAGIAN A</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.yMin4)}</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.yMin3)}</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.yMin2)}</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.yMin1)}</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.tahunIni)}</td>
                    <td class="tw:text-end">{formatRupiah(jumlah.yPlus1)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l5a-tahun"><span>Tahun Pajak</span></Label>
                    <Input id="l5a-tahun" type={"text"} value={draft.tahunPajak} disabled />
                </div>
                <div class="field">
                    <!-- The only field on the form confirmed to accept a negative
                         value, typed with a leading minus. Rupiah formatting
                         strips non-digits including the sign, so this stays a
                         plain number input rather than the shared rupiah field. -->
                    <Label for="l5a-laba"><span>Laba/Rugi Neto Fiskal *</span></Label>
                    <Input id="l5a-laba" class={"tw:text-end"} type={"number"} bind:value={draft.labaRugiNetoFiskal} />
                </div>
                <div class="field">
                    <Label for="l5a-ymin4"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak - 4}</span></Label>
                    <Input
                        id="l5a-ymin4"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiYMin4)}
                        oninput={(e: Event) => (draft.kompensasiYMin4 = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiYMin4'}
                    />
                </div>
                <div class="field">
                    <Label for="l5a-ymin3"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak - 3}</span></Label>
                    <Input
                        id="l5a-ymin3"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiYMin3)}
                        oninput={(e: Event) => (draft.kompensasiYMin3 = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiYMin3'}
                    />
                </div>
                <div class="field">
                    <Label for="l5a-ymin2"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak - 2}</span></Label>
                    <Input
                        id="l5a-ymin2"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiYMin2)}
                        oninput={(e: Event) => (draft.kompensasiYMin2 = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiYMin2'}
                    />
                </div>
                <div class="field">
                    <Label for="l5a-ymin1"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak - 1}</span></Label>
                    <Input
                        id="l5a-ymin1"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiYMin1)}
                        oninput={(e: Event) => (draft.kompensasiYMin1 = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiYMin1'}
                    />
                </div>
                <div class="field">
                    <Label for="l5a-tahunini"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak} (Tahun Pajak Ini)</span></Label>
                    <Input
                        id="l5a-tahunini"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiTahunIni)}
                        oninput={(e: Event) => (draft.kompensasiTahunIni = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiTahunIni'}
                    />
                </div>
                <div class="field">
                    <Label for="l5a-yplus1"><span>Kompensasi Kerugian Fiskal Tahun {tahunPajak + 1} (Tahun Pajak Berjalan)</span></Label>
                    <Input
                        id="l5a-yplus1"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kompensasiYPlus1)}
                        oninput={(e: Event) => (draft.kompensasiYPlus1 = applyRupiahInput(e))}
                        disabled={draftKolomSendiri === 'kompensasiYPlus1'}
                    />
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
</style>

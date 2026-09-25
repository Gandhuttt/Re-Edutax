<script lang="ts">
    import {
        ActionButton,
        DataTable,
        FieldGrid,
        FormField,
        InstitutionalModal,
        RupiahField,
        TableActions
    } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
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
    let modalOpen = $state(false);

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
        modalOpen = true;
    }

    function simpanModal() {
        if (indeksDiubah === null) return;
        rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalOpen = false;
    }
</script>

<DataTable
    label="Penghitungan kompensasi kerugian fiskal"
    minWidth="1180px"
    headerTone="navy"
    density="compact"
>
    <table>
        <thead>
            <tr>
                {#if bisaEdit}<th class="action-cell" rowspan="2" scope="col">TINDAKAN</th>{/if}
                <th rowspan="2" scope="col">NO.</th>
                <th colspan="2" scope="colgroup">LABA/RUGI NETO FISKAL</th>
                <th colspan="6" scope="colgroup">JUMLAH KOMPENSASI KERUGIAN FISKAL</th>
            </tr>
            <tr>
                <th scope="col">TAHUN PAJAK/BAGIAN TAHUN PAJAK</th>
                <th class="right" scope="col">NILAI (RUPIAH)</th>
                <th class="right" scope="col">TAHUN {tahunPajak - 4}</th>
                <th class="right" scope="col">TAHUN {tahunPajak - 3}</th>
                <th class="right" scope="col">TAHUN {tahunPajak - 2}</th>
                <th class="right" scope="col">TAHUN {tahunPajak - 1}</th>
                <th class="right" scope="col">TAHUN {tahunPajak} (TAHUN PAJAK INI)</th>
                <th class="right" scope="col">TAHUN {tahunPajak + 1} (TAHUN PAJAK BERJALAN)</th>
            </tr>
        </thead>
        <tbody>
            {#each rows as row, index}
                <tr>
                    {#if bisaEdit}
                        <td class="action-cell">
                            <TableActions
                                visibleCount={1}
                                ariaLabel={`Aksi baris ${index + 1}`}
                                actions={[{ label: 'Ubah', onclick: () => bukaUbah(index) }]}
                            />
                        </td>
                    {/if}
                    <td>{index + 1}</td>
                    <td>{row.tahunPajak}</td>
                    <td class="number">{formatRupiahDerived(row.labaRugiNetoFiskal)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiYMin4)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiYMin3)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiYMin2)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiYMin1)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiTahunIni)}</td>
                    <td class="number">{formatRupiahDerived(row.kompensasiYPlus1)}</td>
                </tr>
            {/each}
        </tbody>
        <tfoot>
            <tr>
                <th scope="row" colspan={bisaEdit ? 4 : 3}>JUMLAH BAGIAN A</th>
                <td class="number amount">{formatRupiahDerived(jumlah.yMin4)}</td>
                <td class="number amount">{formatRupiahDerived(jumlah.yMin3)}</td>
                <td class="number amount">{formatRupiahDerived(jumlah.yMin2)}</td>
                <td class="number amount">{formatRupiahDerived(jumlah.yMin1)}</td>
                <td class="number amount">{formatRupiahDerived(jumlah.tahunIni)}</td>
                <td class="number amount">{formatRupiahDerived(jumlah.yPlus1)}</td>
            </tr>
        </tfoot>
    </table>
</DataTable>

<InstitutionalModal
    bind:open={modalOpen}
    eyebrow="LAMPIRAN L-5"
    title="Penghitungan Kompensasi Kerugian Fiskal"
    size="wide"
    scrollable
>
    <FieldGrid columns={1}>
        <FormField
            id="l5a-tahun"
            label="Tahun Pajak"
            value={String(draft.tahunPajak)}
            disabled
        />
        <!-- This is the only field confirmed to accept a negative value. -->
        <FormField
            id="l5a-laba"
            label="Laba/Rugi Neto Fiskal"
            type="number"
            value={String(draft.labaRugiNetoFiskal)}
            oninput={(event) => (draft.labaRugiNetoFiskal = Number(event.currentTarget.value))}
            required
        />
        <RupiahField
            id="l5a-ymin4"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak - 4}`}
            bind:value={draft.kompensasiYMin4}
            disabled={draftKolomSendiri === 'kompensasiYMin4'}
        />
        <RupiahField
            id="l5a-ymin3"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak - 3}`}
            bind:value={draft.kompensasiYMin3}
            disabled={draftKolomSendiri === 'kompensasiYMin3'}
        />
        <RupiahField
            id="l5a-ymin2"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak - 2}`}
            bind:value={draft.kompensasiYMin2}
            disabled={draftKolomSendiri === 'kompensasiYMin2'}
        />
        <RupiahField
            id="l5a-ymin1"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak - 1}`}
            bind:value={draft.kompensasiYMin1}
            disabled={draftKolomSendiri === 'kompensasiYMin1'}
        />
        <RupiahField
            id="l5a-tahunini"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak} (Tahun Pajak Ini)`}
            bind:value={draft.kompensasiTahunIni}
            disabled={draftKolomSendiri === 'kompensasiTahunIni'}
        />
        <RupiahField
            id="l5a-yplus1"
            label={`Kompensasi Kerugian Fiskal Tahun ${tahunPajak + 1} (Tahun Pajak Berjalan)`}
            bind:value={draft.kompensasiYPlus1}
            disabled={draftKolomSendiri === 'kompensasiYPlus1'}
        />
    </FieldGrid>

    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

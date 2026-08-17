<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
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
    }

    function simpanModal() {
        if (indeksDiubah === null) return;
        rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL5A');
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
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL5A">Ubah</Button>
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

<div class="modal fade" id="modalOpL5A" tabindex="-1" aria-labelledby="modalOpL5ALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL5ALabel" style="font-weight: bold; text-transform: uppercase;">
          Penghitungan Kompensasi Kerugian Fiskal
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l5a-tahun" style="width: 260px;">Tahun Pajak</label>
            <input type="text" id="l5a-tahun" value={draft.tahunPajak} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <!-- The only field on the form confirmed to accept a negative value,
               typed with a leading minus. Rupiah formatting strips non-digits
               including the sign, so this stays a plain number input rather
               than the shared rupiah field. -->
          <div style="display: flex; align-items: center;">
            <label for="l5a-laba" style="width: 260px;">Laba/Rugi Neto Fiskal *</label>
            <input type="number" id="l5a-laba" bind:value={draft.labaRugiNetoFiskal} style="flex: 1; text-align: right;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-ymin4" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak - 4}</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-ymin4"
              value={formatRupiah(draft.kompensasiYMin4)}
              oninput={(e: Event) => (draft.kompensasiYMin4 = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiYMin4'}
              style="flex: 1; text-align: right;"
            />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-ymin3" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak - 3}</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-ymin3"
              value={formatRupiah(draft.kompensasiYMin3)}
              oninput={(e: Event) => (draft.kompensasiYMin3 = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiYMin3'}
              style="flex: 1; text-align: right;"
            />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-ymin2" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak - 2}</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-ymin2"
              value={formatRupiah(draft.kompensasiYMin2)}
              oninput={(e: Event) => (draft.kompensasiYMin2 = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiYMin2'}
              style="flex: 1; text-align: right;"
            />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-ymin1" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak - 1}</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-ymin1"
              value={formatRupiah(draft.kompensasiYMin1)}
              oninput={(e: Event) => (draft.kompensasiYMin1 = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiYMin1'}
              style="flex: 1; text-align: right;"
            />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-tahunini" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak} (Tahun Pajak Ini)</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-tahunini"
              value={formatRupiah(draft.kompensasiTahunIni)}
              oninput={(e: Event) => (draft.kompensasiTahunIni = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiTahunIni'}
              style="flex: 1; text-align: right;"
            />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l5a-yplus1" style="width: 260px;">Kompensasi Kerugian Fiskal Tahun {tahunPajak + 1} (Tahun Pajak Berjalan)</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5a-yplus1"
              value={formatRupiah(draft.kompensasiYPlus1)}
              oninput={(e: Event) => (draft.kompensasiYPlus1 = applyRupiahInput(e))}
              disabled={draftKolomSendiri === 'kompensasiYPlus1'}
              style="flex: 1; text-align: right;"
            />
          </div>
        </div>
      </div>
      <div class="modal-footer" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        <button type="button" class="btn btn-primary" style="background-color: #1c398e; color: white;" onclick={simpanModal}>Simpan</button>
      </div>
    </div>
  </div>
</div>

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
</style>

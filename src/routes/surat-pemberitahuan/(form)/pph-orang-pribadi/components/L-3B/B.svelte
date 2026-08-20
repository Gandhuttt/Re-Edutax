<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
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

    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        closeBsModal('modalOpL3BB');
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
                            <Button type="button" onclick={bukaUbah} data-bs-toggle="modal" data-bs-target="#modalOpL3BB">Ubah</Button>
                        </td>
                    {/if}
                    <td>{namaTku}</td>
                    <td class="tw:text-center">{metodePembukuanLabel}</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiahDerived(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(jumlahBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td colspan="2">JUMLAH PEREDARAN BRUTO</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiahDerived(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(jumlahBruto)}</td>
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

<div class="modal fade" id="modalOpL3BB" tabindex="-1" aria-labelledby="modalOpL3BBLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3BBLabel" style="font-weight: bold; text-transform: uppercase;">
          Peredaran Bruto Wajib Pajak Orang Pribadi Pengusaha Tertentu (OPPT) - {namaTku}
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <p class="tw:text-xs tw:mb-2">Metode Pembukuan/Pencatatan: {metodePembukuanLabel} (tidak dapat diubah di sini)</p>
        <table class="tw:w-full tw:text-sm modal-bulanan-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Peredaran Bruto (Rp)</th>
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
                    class="tw:w-full tw:text-right"
                  />
                </td>
              </tr>
            {/each}
            <tr class="tw:font-bold">
              <td>JUMLAH</td>
              <td class="tw:text-end">
                {formatRupiahDerived(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
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
    .modal-bulanan-table th, .modal-bulanan-table td {
        border: 1px solid #A9A9A9;
        padding: .4rem .6rem;
    }
    .modal-bulanan-table th {
        background-color: var(--color-primary);
        font-weight: bold;
    }
</style>

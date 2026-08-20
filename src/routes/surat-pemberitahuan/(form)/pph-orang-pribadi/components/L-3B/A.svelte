<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
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
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        closeBsModal('modalOpL3BA');
    }

    function ubahDipotong(index: number, e: Event) {
        rows = rows.map((r, i) => (i === index ? { ...r, dipotongPihakLain: applyRupiahInput(e) } : r));
    }
</script>

<div class="tw:mb-6">
    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[6rem]">TINDAKAN</th>{/if}
                    <th>NAMA TKU</th>
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
                            <Button type="button" onclick={bukaUbah} data-bs-toggle="modal" data-bs-target="#modalOpL3BA">Ubah</Button>
                        </td>
                    {/if}
                    <td>{namaTku}</td>
                    {#each hasil.baris as baris}
                        <td class="tw:text-end">{formatRupiahDerived(baris.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(hasil.totalBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>b. AKUMULASI PEREDARAN BRUTO</td>
                    {#each hasil.baris as baris}
                        <td class="tw:text-end">{formatRupiahDerived(baris.akumulasi)}</td>
                    {/each}
                    <td></td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>c. PEREDARAN BRUTO TIDAK KENA PAJAK</td>
                    <td class="tw:text-end" colspan="12">500.000.000</td>
                    <td class="tw:text-end">500.000.000</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>d. PEREDARAN BRUTO KENA PAJAK</td>
                    {#each hasil.baris as baris}
                        <td class="tw:text-end">{formatRupiahDerived(baris.kenaPajak)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(hasil.totalKenaPajak)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>e. JUMLAH PPh FINAL TERUTANG</td>
                    {#each hasil.baris as baris}
                        <td class="tw:text-end">{formatRupiahDerived(baris.pphTerutang)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(hasil.totalPphTerutang)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>f. PPh FINAL YANG DISETOR SENDIRI</td>
                    {#each bulanNames as _}
                        <td class="tw:text-end">0</td>
                    {/each}
                    <td class="tw:text-end">0</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>g. JUMLAH PPh FINAL DIPOTONG/DIPUNGUT PIHAK LAIN</td>
                    {#each rows as row, index}
                        <td class="tw:text-end">
                            {#if bisaEdit}
                                <input
                                    type="text"
                                    inputmode="numeric"
                                    value={formatRupiah(row.dipotongPihakLain)}
                                    oninput={(e) => ubahDipotong(index, e)}
                                    class="tw:w-full tw:text-end tw:bg-transparent"
                                />
                            {:else}
                                {formatRupiahDerived(row.dipotongPihakLain)}
                            {/if}
                        </td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(hasil.totalDipotongPihakLain)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td>h. SELISIH (e-f-g)</td>
                    {#each hasil.baris as baris}
                        <td class="tw:text-end">{formatRupiahDerived(baris.selisih)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiahDerived(hasil.totalSelisih)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL3BA" tabindex="-1" aria-labelledby="modalOpL3BALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3BALabel" style="font-weight: bold; text-transform: uppercase;">
          Rekapitulasi Peredaran Bruto Tertentu - {namaTku}
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
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

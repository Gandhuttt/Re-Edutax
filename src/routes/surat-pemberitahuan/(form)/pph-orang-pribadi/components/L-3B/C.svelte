<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPeredaranBulanan } from "./types";

    // C. PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN).
    //
    // JUMLAH PPh is always 0: the norma percentage/classification reference
    // table isn't available to us, see L3B.md's "Not captured" list, so the
    // neto derivation from JENIS USAHA/PEKERJAAN BEBAS cannot be modeled.
    const bulanNames = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];

    interface Props {
        rows: BarisPeredaranBulanan[];
        namaTku: string;
        jenisUsahaPekerjaanBebas: string;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let {
        rows = $bindable(),
        namaTku,
        jenisUsahaPekerjaanBebas = $bindable(),
        dapatDiubah = true,
        readonly = false
    }: Props = $props();

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let jumlahBruto = $derived(rows.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0));

    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));
    let draftJenisUsaha = $state('');

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        draftJenisUsaha = jenisUsahaPekerjaanBebas;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        jenisUsahaPekerjaanBebas = draftJenisUsaha;
        closeBsModal('modalOpL3BC');
    }
</script>

<div class="tw:mb-6">
    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[6rem]">TINDAKAN</th>{/if}
                    <th>NAMA TKU</th>
                    <th>JENIS USAHA/PEKERJAAN BEBAS</th>
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
                            <Button type="button" onclick={bukaUbah} data-bs-toggle="modal" data-bs-target="#modalOpL3BC">Ubah</Button>
                        </td>
                    {/if}
                    <td>{namaTku}</td>
                    <td>{jenisUsahaPekerjaanBebas}</td>
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

<div class="modal fade" id="modalOpL3BC" tabindex="-1" aria-labelledby="modalOpL3BCLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3BCLabel" style="font-weight: bold; text-transform: uppercase;">
          Pengguna Norma Penghitungan Penghasilan Neto - {namaTku}
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <label for="l3bc-jenis" style="width: 220px;">Jenis Usaha/Pekerjaan Bebas</label>
          <input type="text" id="l3bc-jenis" bind:value={draftJenisUsaha} style="flex: 1;" />
        </div>
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
                {formatRupiah(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
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

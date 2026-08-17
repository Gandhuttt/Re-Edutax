<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisFinalBulanan, BarisPeredaranBulanan, TkuL3B } from "./types";

    // REKAPITULASI PEREDARAN BRUTO. DAFTAR TKU here is pre-filled from DJP
    // records and read-only on the live form; we have no such source, so it is
    // user-editable instead, same divergence as Badan's L-5 TKU rows (manually
    // entered rather than DJP-prefilled). Only one TKU is modeled, matching the
    // only case ever observed live (see L3B.md's "Not captured" list).
    //
    // All three sections render unconditionally; only the section matching the
    // current Induk 1.b.2/1.b.3 gate gets a working TINDAKAN column, mirroring
    // the "a lampiran grid is editable only when its own gate is on" rule and
    // the measured Bagian A freeze-not-delete behavior when the gate moves off.
    interface Props {
        currentTab: string;
        npwp: string;
        metodePembukuan: string;
        tku: TkuL3B;
        a: BarisFinalBulanan[];
        b: BarisPeredaranBulanan[];
        c: BarisPeredaranBulanan[];
        b1b2Oppt: string;
        b1b3Norma: string;
        readonly?: boolean;
    }

    let {
        currentTab,
        npwp,
        metodePembukuan,
        tku = $bindable(),
        a = $bindable(),
        b = $bindable(),
        c = $bindable(),
        b1b2Oppt,
        b1b3Norma,
        readonly = false
    }: Props = $props();

    const metodeLabel: Record<string, string> = {
        pencatatan: '1 (Pencatatan)',
        pembukuan_kas: '2 (Pembukuan Stelsel Kas)',
        pembukuan_akrual: '2 (Pembukuan Stelsel Akrual)'
    };

    let idTku = $derived(`${npwp}000000`);

    let draft = $state<TkuL3B>({ ...tku });

    function bukaUbah() {
        draft = { ...tku };
    }

    function simpanModal() {
        tku = { ...draft };
        closeBsModal('modalOpL3BTku');
    }
</script>

<div class="{currentTab === 'L-3B' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"DAFTAR TEMPAT KEGIATAN USAHA (TKU)"}>
            <div class="tw:p-5">
                {#if !readonly}
                    <div class="tw:mb-2 tw:flex tw:justify-end">
                        <Button type="button" onclick={bukaUbah} data-bs-toggle="modal" data-bs-target="#modalOpL3BTku">Ubah</Button>
                    </div>
                {/if}
                <div class="tw:overflow-x-auto">
                    <Table class="tw:min-w-full">
                        {#snippet head()}
                            <tr>
                                <th>ID TKU</th>
                                <th>NAMA</th>
                                <th>ALAMAT</th>
                                <th>KELURAHAN/DESA</th>
                                <th>KECAMATAN</th>
                                <th>KOTA/KABUPATEN</th>
                                <th>PROVINSI</th>
                            </tr>
                        {/snippet}
                        {#snippet body()}
                            <tr>
                                <td>{idTku}</td>
                                <td>{tku.nama}</td>
                                <td>{tku.alamat}</td>
                                <td>{tku.kelurahan}</td>
                                <td>{tku.kecamatan}</td>
                                <td>{tku.kabupaten}</td>
                                <td>{tku.provinsi}</td>
                            </tr>
                        {/snippet}
                    </Table>
                </div>
            </div>
        </Accordion>
        <Accordion item={"A. PEREDARAN BRUTO TERTENTU YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL"}>
            <div class="tw:p-5">
                <A
                    bind:rows={a}
                    namaTku={tku.nama}
                    dapatDiubah={b1b2Oppt === 'peredaran_bruto_tertentu'}
                    {readonly}
                />
            </div>
        </Accordion>
        <Accordion item={"B. ORANG PRIBADI PENGUSAHA TERTENTU (OPPT)"}>
            <div class="tw:p-5">
                <B
                    bind:rows={b}
                    namaTku={tku.nama}
                    metodePembukuanLabel={metodeLabel[metodePembukuan] ?? metodePembukuan}
                    dapatDiubah={b1b2Oppt === 'pengusaha_tertentu'}
                    {readonly}
                />
            </div>
        </Accordion>
        <Accordion item={"C. PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN)"}>
            <div class="tw:p-5">
                <C
                    bind:rows={c}
                    namaTku={tku.nama}
                    bind:jenisUsahaPekerjaanBebas={tku.jenisUsahaPekerjaanBebas}
                    dapatDiubah={b1b3Norma === 'ya_norma'}
                    {readonly}
                />
            </div>
        </Accordion>
    </div>
</div>

<div class="modal fade" id="modalOpL3BTku" tabindex="-1" aria-labelledby="modalOpL3BTkuLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3BTkuLabel" style="font-weight: bold; text-transform: uppercase;">
          Tempat Kegiatan Usaha
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l3btku-id" style="width: 220px;">ID TKU (tidak dapat diubah)</label>
            <input type="text" id="l3btku-id" value={idTku} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-nama" style="width: 220px;">Nama</label>
            <input type="text" id="l3btku-nama" bind:value={draft.nama} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-alamat" style="width: 220px;">Alamat</label>
            <input type="text" id="l3btku-alamat" bind:value={draft.alamat} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-kelurahan" style="width: 220px;">Kelurahan/Desa</label>
            <input type="text" id="l3btku-kelurahan" bind:value={draft.kelurahan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-kecamatan" style="width: 220px;">Kecamatan</label>
            <input type="text" id="l3btku-kecamatan" bind:value={draft.kecamatan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-kabupaten" style="width: 220px;">Kota/Kabupaten</label>
            <input type="text" id="l3btku-kabupaten" bind:value={draft.kabupaten} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3btku-provinsi" style="width: 220px;">Provinsi</label>
            <input type="text" id="l3btku-provinsi" bind:value={draft.provinsi} style="flex: 1;" />
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
    	font-size: .7rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .4rem .5rem;
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
</style>

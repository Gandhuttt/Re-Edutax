<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisFinal } from "./types";

    // A. PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL
    //
    // This section's toolbar differs from every L-1 grid: on the live form it
    // carries **only Tambah**, with no Hapus Semua and no Impor data. That is a
    // real property of this grid, confirmed in fullpage-l2-maximal.jpg, not an
    // oversight. Per-row deletion is kept so entered rows are not a dead end.
    //
    // Feeds Induk 14c, which takes the DPP rather than the PPh Terutang: a row
    // with DPP 666.666 and tax 66.666 showed 666.666 on the Induk.
    interface Props {
        rows: BarisFinal[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisFinal => ({
        npwpPemotong: '', namaPemotong: '', kodeObjekPajak: '',
        jenisPenghasilan: '', dasarPengenaanPajak: 0, pphTerutang: 0
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisFinal>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let totalDpp = $derived(rows.reduce((s, r) => s + Number(r.dasarPengenaanPajak || 0), 0));

    function bukaTambah() {
        indeksDiubah = null;
        draft = kosong();
        errors = {};
    }

    function bukaUbah(index: number) {
        indeksDiubah = index;
        draft = { ...rows[index] };
        errors = {};
    }

    function simpanModal() {
        // Jenis Penghasilan carries no asterisk on the live form yet drives the
        // derived Kode Objek Pajak, so requiredness is recorded here rather than
        // read off the label.
        const next: Record<string, string> = {};
        if (!draft.npwpPemotong) next.npwpPemotong = 'Kolom ini wajib diisi!';
        if (!draft.namaPemotong) next.namaPemotong = 'Kolom ini wajib diisi!';
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.dasarPengenaanPajak) next.dasarPengenaanPajak = 'Kolom ini wajib diisi!';
        if (!draft.pphTerutang) next.pphTerutang = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL2A');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <!-- Tambah only: this grid has no Hapus Semua on the live form. -->
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL2A">Tambah</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NPWP PEMOTONG/PEMUNGUT</th>
                    <th>NAMA PEMOTONG/PEMUNGUT</th>
                    <th>KODE OBJEK PAJAK</th>
                    <th>JENIS PENGHASILAN</th>
                    <th class="tw:text-end">DASAR PENGENAAN PAJAK (Rupiah)</th>
                    <th class="tw:text-end">PPh TERUTANG</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL2A">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.npwpPemotong}</td>
                        <td>{row.namaPemotong}</td>
                        <td>{row.kodeObjekPajak}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td class="tw:text-end">{formatRupiah(row.dasarPengenaanPajak)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pphTerutang)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 8 : 7} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH TABEL A</td>
                    <td class="tw:text-end">{formatRupiah(totalDpp)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL2A" tabindex="-1" aria-labelledby="modalOpL2ALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL2ALabel" style="font-weight: bold; text-transform: uppercase;">
          PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l2a-npwp" style="width: 220px;">NPWP Pemotong/Pemungut *</label>
            <input type="text" id="l2a-npwp" bind:value={draft.npwpPemotong} style="flex: 1;" />
          </div>
          {#if errors.npwpPemotong}<span class="error">{errors.npwpPemotong}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2a-nama" style="width: 220px;">Nama Pemotong/Pemungut *</label>
            <input type="text" id="l2a-nama" bind:value={draft.namaPemotong} style="flex: 1;" />
          </div>
          {#if errors.namaPemotong}<span class="error">{errors.namaPemotong}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2a-kode" style="width: 220px;">Kode Objek Pajak</label>
            <input type="text" id="l2a-kode" value="" readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l2a-jenis" style="width: 220px;">Jenis Penghasilan *</label>
            <select id="l2a-jenis" bind:value={draft.jenisPenghasilan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l2_a_jenis_penghasilan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2a-dpp" style="width: 220px;">Dasar Pengenaan Pajak *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2a-dpp"
              value={formatRupiah(draft.dasarPengenaanPajak)}
              oninput={(e: Event) => (draft.dasarPengenaanPajak = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.dasarPengenaanPajak}<span class="error">{errors.dasarPengenaanPajak}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2a-pph" style="width: 220px;">PPh Terutang *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2a-pph"
              value={formatRupiah(draft.pphTerutang)}
              oninput={(e: Event) => (draft.pphTerutang = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.pphTerutang}<span class="error">{errors.pphTerutang}</span>{/if}
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
    tr.total td {
    	font-weight: bold;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
    .error { background: #fde8e8; color: #b91c1c; font-size: 0.75rem; padding: 0.25rem 0.5rem; margin-left: 220px; }
</style>

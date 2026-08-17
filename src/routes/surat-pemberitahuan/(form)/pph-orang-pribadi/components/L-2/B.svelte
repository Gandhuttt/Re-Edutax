<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisBukanObjek } from "./types";

    // B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK. Feeds Induk 14d.
    //
    // Unlike section A this one has the full toolbar. Note the column order in
    // the grid does not follow the modal's field order: the grid shows SUMBER
    // PENGHASILAN (the name) before NIK/NPWP, while the modal asks for the NPWP
    // first.
    interface Props {
        rows: BarisBukanObjek[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisBukanObjek => ({
        kode: '', jenisPenghasilan: '', npwpSumber: '', namaSumber: '', penghasilanBruto: 0
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisBukanObjek>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penghasilanBruto || 0), 0));

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
        const next: Record<string, string> = {};
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL2B');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian B?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL2B">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>KODE</th>
                    <th>JENIS PENGHASILAN</th>
                    <th>SUMBER PENGHASILAN</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th>NIK/NPWP</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL2B">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td>{row.namaSumber}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanBruto)}</td>
                        <td>{row.npwpSumber}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 7 : 6} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 5 : 4}>JUMLAH TABEL B</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL2B" tabindex="-1" aria-labelledby="modalOpL2BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL2BLabel" style="font-weight: bold; text-transform: uppercase;">
          PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l2b-kode" style="width: 220px;">Kode</label>
            <input type="text" id="l2b-kode" value="" readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l2b-jenis" style="width: 220px;">Jenis Penghasilan *</label>
            <select id="l2b-jenis" bind:value={draft.jenisPenghasilan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l2_b_jenis_penghasilan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2b-npwp" style="width: 220px;">NPWP Sumber Penghasilan</label>
            <input type="text" id="l2b-npwp" bind:value={draft.npwpSumber} style="flex: 1;" />
          </div>
          {#if errors.npwpSumber}<span class="error">{errors.npwpSumber}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2b-nama" style="width: 220px;">Nama Sumber Penghasilan</label>
            <input type="text" id="l2b-nama" bind:value={draft.namaSumber} style="flex: 1;" />
          </div>
          {#if errors.namaSumber}<span class="error">{errors.namaSumber}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2b-bruto" style="width: 220px;">Penghasilan Bruto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2b-bruto"
              value={formatRupiah(draft.penghasilanBruto)}
              oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
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

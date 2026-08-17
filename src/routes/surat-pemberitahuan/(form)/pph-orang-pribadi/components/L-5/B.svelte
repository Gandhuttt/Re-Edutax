<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPengurang } from "./types";

    // B. PENGURANG PENGHASILAN NETO. Feeds Induk row 3 together with L-5 A's
    // kompensasiTahunIni column: JUMLAH PENGURANG PENGHASILAN NETO is their sum.
    interface Props {
        rows: BarisPengurang[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisPengurang => ({ kode: '', jenisPengurang: '', jumlah: 0 });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPengurang>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.jumlah || 0), 0));

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
        if (!draft.jenisPengurang) next.jenisPengurang = 'Kolom ini wajib diisi!';
        if (!draft.jumlah) next.jumlah = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL5B');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL5B">Tambah</Button>
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
                    <th>JENIS PENGURANG PENGHASILAN NETO</th>
                    <th class="tw:text-end">JUMLAH PENGURANG PENGHASILAN NETO</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL5B">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.jenisPengurang}</td>
                        <td class="tw:text-end">{formatRupiah(row.jumlah)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 5 : 4} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 3 : 2}>JUMLAH</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL5B" tabindex="-1" aria-labelledby="modalOpL5BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL5BLabel" style="font-weight: bold; text-transform: uppercase;">
          PENGURANGAN PENGHASILAN NETO
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l5b-kode" style="width: 220px;">Kode</label>
            <input type="text" id="l5b-kode" bind:value={draft.kode} style="flex: 1;" />
          </div>
          {#if errors.kode}<span class="error">{errors.kode}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l5b-jenis" style="width: 220px;">Jenis Pengurang Penghasilan Neto *</label>
            <select id="l5b-jenis" bind:value={draft.jenisPengurang} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l5_b_jenis ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPengurang}<span class="error">{errors.jenisPengurang}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l5b-jumlah" style="width: 220px;">Jumlah Pengurang Penghasilan Neto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l5b-jumlah"
              value={formatRupiah(draft.jumlah)}
              oninput={(e: Event) => (draft.jumlah = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.jumlah}<span class="error">{errors.jumlah}</span>{/if}
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

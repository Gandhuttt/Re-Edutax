<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisLainnya } from "./types";

    // B. PENGHASILAN NETO DALAM NEGERI LAINNYA. Feeds Induk row 1.c directly.
    //
    // The smallest modal in the form, three fields. Editable exactly when Induk
    // 1.c is Ya.
    interface Props {
        rows: BarisLainnya[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisLainnya => ({ kode: '', jenisPenghasilan: '', penghasilanNeto: 0 });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisLainnya>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l3a4_b_jenis_penghasilan', draft.jenisPenghasilan));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penghasilanNeto || 0), 0));

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
        if (!draft.penghasilanNeto) next.penghasilanNeto = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL3A4B');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL3A4B">Tambah</Button>
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
                    <th class="tw:text-end">PENGHASILAN NETO</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL3A4B">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanNeto)}</td>
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

<div class="modal fade" id="modalOpL3A4B" tabindex="-1" aria-labelledby="modalOpL3A4BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3A4BLabel" style="font-weight: bold; text-transform: uppercase;">
          PENGHASILAN NETO DALAM NEGERI LAINNYA
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l3a4b-kode" style="width: 220px;">Kode</label>
            <input type="text" id="l3a4b-kode" value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l3a4b-jenis" style="width: 220px;">Jenis Penghasilan *</label>
            <select id="l3a4b-jenis" bind:value={draft.jenisPenghasilan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3a4_b_jenis_penghasilan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l3a4b-neto" style="width: 220px;">Penghasilan Neto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l3a4b-neto"
              value={formatRupiah(draft.penghasilanNeto)}
              oninput={(e: Event) => (draft.penghasilanNeto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penghasilanNeto}<span class="error">{errors.penghasilanNeto}</span>{/if}
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

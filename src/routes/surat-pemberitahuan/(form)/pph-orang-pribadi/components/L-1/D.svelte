<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPekerjaan } from "./types";

    // D. PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN. Feeds Induk 1.a.
    //
    // The JUMLAH BAGIAN D footer totals the **neto**, not the bruto, and that is
    // the figure the Induk reads. Editable exactly when Induk 1.a is Ya.
    //
    // This is the only modal with no Kode field at all, and Penghasilan Neto is
    // genuine arithmetic (Bruto - Pengurang) rather than a lookup: the live modal
    // recalculates it on blur, so it stays derived and disabled here too.
    interface Props {
        rows: BarisPekerjaan[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisPekerjaan => ({
        nomorIdentitasPemberiKerja: '', namaPemberiKerja: '',
        penghasilanBruto: 0, pengurangPenghasilanBruto: 0, penghasilanNeto: 0
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPekerjaan>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penghasilanNeto || 0), 0));

    let draftNeto = $derived(
        Number(draft.penghasilanBruto || 0) - Number(draft.pengurangPenghasilanBruto || 0)
    );

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
        if (!draft.nomorIdentitasPemberiKerja) next.nomorIdentitasPemberiKerja = 'Kolom ini wajib diisi!';
        if (!draft.namaPemberiKerja) next.namaPemberiKerja = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
        if (!draft.pengurangPenghasilanBruto) next.pengurangPenghasilanBruto = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        const baris = { ...draft, penghasilanNeto: draftNeto };
        if (indeksDiubah === null) rows = [...rows, baris];
        else rows = rows.map((r, i) => (i === indeksDiubah ? baris : r));
        closeBsModal('modalOpL1D');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian D?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1D">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NAMA PEMBERI KERJA</th>
                    <th>NOMOR IDENTITAS PEMBERI KERJA</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th class="tw:text-end">PENGURANG PENGHASILAN BRUTO/BIAYA</th>
                    <th class="tw:text-end">PENGHASILAN NETO</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1D">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.namaPemberiKerja}</td>
                        <td>{row.nomorIdentitasPemberiKerja}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pengurangPenghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanNeto)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 7 : 6} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH BAGIAN D</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1D" tabindex="-1" aria-labelledby="modalOpL1DLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1DLabel" style="font-weight: bold; text-transform: uppercase;">
          Penghasilan Neto Dalam Negeri dari Pekerjaan
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="d-identitas" style="width: 220px;">Nomor Identitas Pemberi Kerja *</label>
            <input type="text" id="d-identitas" bind:value={draft.nomorIdentitasPemberiKerja} style="flex: 1;" />
          </div>
          {#if errors.nomorIdentitasPemberiKerja}<span class="error">{errors.nomorIdentitasPemberiKerja}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="d-nama" style="width: 220px;">Nama Pemberi Kerja *</label>
            <input type="text" id="d-nama" bind:value={draft.namaPemberiKerja} style="flex: 1;" />
          </div>
          {#if errors.namaPemberiKerja}<span class="error">{errors.namaPemberiKerja}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="d-bruto" style="width: 220px;">Penghasilan Bruto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="d-bruto"
              value={formatRupiah(draft.penghasilanBruto)}
              oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="d-pengurang" style="width: 220px;">Pengurang Penghasilan Bruto/Biaya *</label>
            <input
              type="text"
              inputmode="numeric"
              id="d-pengurang"
              value={formatRupiah(draft.pengurangPenghasilanBruto)}
              oninput={(e: Event) => (draft.pengurangPenghasilanBruto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.pengurangPenghasilanBruto}<span class="error">{errors.pengurangPenghasilanBruto}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="d-neto" style="width: 220px;">Penghasilan Neto</label>
            <input
              type="text"
              id="d-neto"
              value={formatRupiah(draftNeto)}
              readonly
              style="flex: 1; text-align: right; background-color: #e9ecef;"
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

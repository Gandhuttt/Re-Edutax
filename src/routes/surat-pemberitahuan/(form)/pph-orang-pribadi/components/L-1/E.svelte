<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisBuktiPotong } from "./types";

    // E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh. Feeds Induk 10a.
    //
    // The footer is three rows, not one: this grid's own JUMLAH, then a KREDIT
    // PAJAK ATAS PENGHASILAN LUAR NEGERI row imported from L-2 C, then JUMLAH
    // BAGIAN E as their sum. It is that last figure the Induk reads, which is why
    // 10a aggregates two lampiran rather than one.
    //
    // Rows with sumberBuktiPotongId set were pulled in automatically by
    // "Posting SPT" (see ../../postSptPphOrangPribadi.remote.ts, which
    // bulk-imports every eligible eBupot bukti potong for this taxpayer/year
    // -- there is no manual per-row import UI here). They get a "Diimpor"
    // badge and can still be edited/removed by hand like any other row, but
    // a subsequent Posting will recompute and overwrite them back to the
    // live eBupot value.
    interface Props {
        rows: BarisBuktiPotong[];
        referensi: Record<string, string[]>;
        // Imported from L-2 C, not entered here.
        kreditPajakLuarNegeri: number;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let {
        rows = $bindable(),
        referensi,
        kreditPajakLuarNegeri,
        dapatDiubah = true,
        readonly = false
    }: Props = $props();

    const kosong = (): BarisBuktiPotong => ({
        namaPemotong: '', npwpPemotong: '', nomorBukti: '', tanggalBukti: '',
        jenisPajak: '', penghasilanBruto: 0, pphDipotong: 0
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisBuktiPotong>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let jumlah = $derived(rows.reduce((s, r) => s + Number(r.pphDipotong || 0), 0));
    let jumlahBagianE = $derived(jumlah + kreditPajakLuarNegeri);

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
        if (!draft.namaPemotong) next.namaPemotong = 'Kolom ini wajib diisi!';
        if (!draft.npwpPemotong) next.npwpPemotong = 'Kolom ini wajib diisi!';
        if (!draft.nomorBukti) next.nomorBukti = 'Kolom ini wajib diisi!';
        if (!draft.tanggalBukti) next.tanggalBukti = 'Kolom ini wajib diisi!';
        if (!draft.jenisPajak) next.jenisPajak = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanBruto) next.penghasilanBruto = 'Kolom ini wajib diisi!';
        if (!draft.pphDipotong) next.pphDipotong = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL1E');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian E?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1E">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NAMA PEMOTONG/PEMUNGUT PPh</th>
                    <th>NPWP PEMOTONG/PEMUNGUT PPh</th>
                    <th>NOMOR BUKTI PEMOTONGAN/PEMUNGUTAN</th>
                    <th>TANGGAL BUKTI PEMOTONGAN/PEMUNGUTAN</th>
                    <th>JENIS PAJAK</th>
                    <th class="tw:text-end">PENGHASILAN BRUTO</th>
                    <th class="tw:text-end">PPh YANG DIPOTONG/DIPUNGUT</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1E">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>
                            {row.namaPemotong}
                            {#if row.sumberBuktiPotongId}<span class="badge-impor">Diimpor</span>{/if}
                        </td>
                        <td>{row.npwpPemotong}</td>
                        <td>{row.nomorBukti}</td>
                        <td>{row.tanggalBukti}</td>
                        <td>{row.jenisPajak}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.penghasilanBruto)}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.pphDipotong)}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 9 : 8} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>JUMLAH</td>
                    <td class="tw:text-end">{formatRupiahDerived(jumlah)}</td>
                </tr>
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI</td>
                    <td class="tw:text-end">{formatRupiahDerived(kreditPajakLuarNegeri)}</td>
                </tr>
                <tr class="total">
                    <td colspan={bisaEdit ? 8 : 7}>JUMLAH BAGIAN E</td>
                    <td class="tw:text-end">{formatRupiahDerived(jumlahBagianE)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1E" tabindex="-1" aria-labelledby="modalOpL1ELabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1ELabel" style="font-weight: bold; text-transform: uppercase;">
          Penghasilan Bruto
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="e-nama" style="width: 220px;">Nama Pemotong/Pemungut PPh *</label>
            <input type="text" id="e-nama" bind:value={draft.namaPemotong} style="flex: 1;" />
          </div>
          {#if errors.namaPemotong}<span class="error">{errors.namaPemotong}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-npwp" style="width: 220px;">NPWP Pemotong/Pemungut PPh *</label>
            <input type="text" id="e-npwp" bind:value={draft.npwpPemotong} style="flex: 1;" />
          </div>
          {#if errors.npwpPemotong}<span class="error">{errors.npwpPemotong}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-bukti" style="width: 220px;">Nomor Bukti Pemotongan/Pemungutan *</label>
            <input type="text" id="e-bukti" bind:value={draft.nomorBukti} style="flex: 1;" />
          </div>
          {#if errors.nomorBukti}<span class="error">{errors.nomorBukti}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-tanggal" style="width: 220px;">Tanggal Bukti Pemotongan/Pemungutan *</label>
            <input type="date" id="e-tanggal" bind:value={draft.tanggalBukti} style="flex: 1;" />
          </div>
          {#if errors.tanggalBukti}<span class="error">{errors.tanggalBukti}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-jenis" style="width: 220px;">Jenis Pajak *</label>
            <select id="e-jenis" bind:value={draft.jenisPajak} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_e_jenis_pajak ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPajak}<span class="error">{errors.jenisPajak}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-bruto" style="width: 220px;">Penghasilan Bruto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="e-bruto"
              value={formatRupiah(draft.penghasilanBruto)}
              oninput={(e: Event) => (draft.penghasilanBruto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penghasilanBruto}<span class="error">{errors.penghasilanBruto}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="e-pph" style="width: 220px;">PPh yang Dipotong/Dipungut *</label>
            <input
              type="text"
              inputmode="numeric"
              id="e-pph"
              value={formatRupiah(draft.pphDipotong)}
              oninput={(e: Event) => (draft.pphDipotong = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.pphDipotong}<span class="error">{errors.pphDipotong}</span>{/if}
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
    .badge-impor {
    	display: inline-block;
    	margin-left: 0.4rem;
    	padding: 0.05rem 0.4rem;
    	font-size: 0.65rem;
    	font-weight: bold;
    	color: white;
    	background-color: var(--color-secondary);
    	border-radius: 0.25rem;
    }
</style>

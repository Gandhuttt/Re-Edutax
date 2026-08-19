<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA5 } from "./types";

    // A5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)
    interface Props {
        rows: BarisA5[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisA5 => ({
        kode: '', deskripsi: '', lokasiHarta: '', ukuranTanah: '', ukuranBangunan: '',
        sumberKepemilikan: '', nomorSertifikat: '', tahunPerolehan: 0,
        hargaPerolehan: 0, nilaiSaatIni: 0, keterangan: ''
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA5>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l1_a5_deskripsi', draft.deskripsi));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.nilaiSaatIni || 0), 0));

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
        if (!draft.deskripsi) next.deskripsi = 'Kolom ini wajib diisi!';
        if (!draft.lokasiHarta) next.lokasiHarta = 'Kolom ini wajib diisi!';
        if (!draft.ukuranTanah) next.ukuranTanah = 'Kolom ini wajib diisi!';
        if (!draft.ukuranBangunan) next.ukuranBangunan = 'Kolom ini wajib diisi!';
        if (!draft.sumberKepemilikan) next.sumberKepemilikan = 'Kolom ini wajib diisi!';
        if (!draft.nomorSertifikat) next.nomorSertifikat = 'Kolom ini wajib diisi!';
        if (!draft.tahunPerolehan) next.tahunPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.hargaPerolehan) next.hargaPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.nilaiSaatIni) next.nilaiSaatIni = 'Kolom ini wajib diisi!';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL1A5');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 5?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)</span>
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1A5">Tambah</Button>
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
                    <th>DESKRIPSI</th>
                    <th>LOKASI HARTA</th>
                    <th>UKURAN PROPERTI - TANAH</th>
                    <th>UKURAN PROPERTI - BANGUNAN</th>
                    <th>SUMBER KEPEMILIKAN</th>
                    <th>NOMOR SERTIFIKAT</th>
                    <th>TAHUN PEROLEHAN</th>
                    <th class="tw:text-end">HARGA PEROLEHAN</th>
                    <th class="tw:text-end">NILAI SAAT INI</th>
                    <th>KETERANGAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1A5">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.deskripsi}</td>
                        <td>{row.lokasiHarta}</td>
                        <td>{row.ukuranTanah}</td>
                        <td>{row.ukuranBangunan}</td>
                        <td>{row.sumberKepemilikan}</td>
                        <td>{row.nomorSertifikat}</td>
                        <td>{row.tahunPerolehan}</td>
                        <td class="tw:text-end">{formatRupiah(row.hargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 13 : 12} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 11 : 10}>JUMLAH TABEL 5</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1A5" tabindex="-1" aria-labelledby="modalOpL1A5Label" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1A5Label" style="font-weight: bold; text-transform: uppercase;">
          HARTA TIDAK BERGERAK
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="a5-kode" style="width: 220px;">Kode</label>
            <input type="text" id="a5-kode" value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="a5-deskripsi" style="width: 220px;">Deskripsi *</label>
            <select id="a5-deskripsi" bind:value={draft.deskripsi} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_a5_deskripsi ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-lokasi" style="width: 220px;">Lokasi Harta *</label>
            <input type="text" id="a5-lokasi" bind:value={draft.lokasiHarta} style="flex: 1;" />
          </div>
          {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-tanah" style="width: 220px;">Ukuran Properti - Tanah *</label>
            <input type="text" id="a5-tanah" bind:value={draft.ukuranTanah} style="flex: 1;" />
          </div>
          {#if errors.ukuranTanah}<span class="error">{errors.ukuranTanah}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-bangunan" style="width: 220px;">Ukuran Properti - Bangunan *</label>
            <input type="text" id="a5-bangunan" bind:value={draft.ukuranBangunan} style="flex: 1;" />
          </div>
          {#if errors.ukuranBangunan}<span class="error">{errors.ukuranBangunan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-sumber" style="width: 220px;">Sumber Kepemilikan *</label>
            <select id="a5-sumber" bind:value={draft.sumberKepemilikan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_a5_sumber_kepemilikan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.sumberKepemilikan}<span class="error">{errors.sumberKepemilikan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-sertifikat" style="width: 220px;">Nomor Sertifikat *</label>
            <input type="text" id="a5-sertifikat" bind:value={draft.nomorSertifikat} style="flex: 1;" />
          </div>
          {#if errors.nomorSertifikat}<span class="error">{errors.nomorSertifikat}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-tahun" style="width: 220px;">Tahun Perolehan *</label>
            <input type="number" id="a5-tahun" bind:value={draft.tahunPerolehan} style="flex: 1;" />
          </div>
          {#if errors.tahunPerolehan}<span class="error">{errors.tahunPerolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-harga" style="width: 220px;">Harga Perolehan *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a5-harga"
              value={formatRupiah(draft.hargaPerolehan)}
              oninput={(e: Event) => (draft.hargaPerolehan = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.hargaPerolehan}<span class="error">{errors.hargaPerolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-nilai" style="width: 220px;">Nilai Saat Ini *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a5-nilai"
              value={formatRupiah(draft.nilaiSaatIni)}
              oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a5-keterangan" style="width: 220px;">Keterangan</label>
            <select id="a5-keterangan" bind:value={draft.keterangan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.keterangan_pps ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.keterangan}<span class="error">{errors.keterangan}</span>{/if}
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

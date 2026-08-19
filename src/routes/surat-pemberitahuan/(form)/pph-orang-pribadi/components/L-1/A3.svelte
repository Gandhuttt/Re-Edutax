<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA3 } from "./types";

    // A3. INVESTASI/SEKURITAS
    interface Props {
        rows: BarisA3[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisA3 => ({
        kode: '', deskripsi: '', lokasiHarta: '', nomorIdentitasPenerima: '',
        namaBankInstitusi: '', nomorAkun: '', hargaPerolehan: 0, tahunPerolehan: 0,
        nilaiSaatIni: 0, keterangan: ''
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA3>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l1_a3_deskripsi', draft.deskripsi));
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
        if (!draft.nomorIdentitasPenerima) next.nomorIdentitasPenerima = 'Kolom ini wajib diisi!';
        // Editable here, unlike A2's equivalent, which the live form derives.
        if (!draft.namaBankInstitusi) next.namaBankInstitusi = 'Kolom ini wajib diisi!';
        if (!draft.nomorAkun) next.nomorAkun = 'Kolom ini wajib diisi!';
        if (!draft.hargaPerolehan) next.hargaPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.tahunPerolehan) next.tahunPerolehan = 'Kolom ini wajib diisi!';
        if (!draft.nilaiSaatIni) next.nilaiSaatIni = 'Kolom ini wajib diisi!';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL1A3');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 3?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">3. INVESTASI/SEKURITAS</span>
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1A3">Tambah</Button>
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
                    <th>NPWP BANK/INSTITUSI/PENERIMA INVESTASI</th>
                    <th>NAMA BANK/INSTITUSI/PENERIMA INVESTASI</th>
                    <th>NOMOR AKUN</th>
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
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1A3">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.deskripsi}</td>
                        <td>{row.lokasiHarta}</td>
                        <td>{row.nomorIdentitasPenerima}</td>
                        <td>{row.namaBankInstitusi}</td>
                        <td>{row.nomorAkun}</td>
                        <td>{row.tahunPerolehan}</td>
                        <td class="tw:text-end">{formatRupiah(row.hargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 12 : 11} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 10 : 9}>JUMLAH TABEL 3</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1A3" tabindex="-1" aria-labelledby="modalOpL1A3Label" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1A3Label" style="font-weight: bold; text-transform: uppercase;">
          INVESTASI/SEKURITAS
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="a3-kode" style="width: 220px;">Kode</label>
            <input type="text" id="a3-kode" value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="a3-deskripsi" style="width: 220px;">Deskripsi *</label>
            <select id="a3-deskripsi" bind:value={draft.deskripsi} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_a3_deskripsi ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-lokasi" style="width: 220px;">Lokasi Harta *</label>
            <select id="a3-lokasi" bind:value={draft.lokasiHarta} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.negara ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-identitas" style="width: 220px;">Nomor Identitas Bank/Institusi/Penerima Investasi (NPWP) *</label>
            <input type="text" id="a3-identitas" bind:value={draft.nomorIdentitasPenerima} style="flex: 1;" />
          </div>
          {#if errors.nomorIdentitasPenerima}<span class="error">{errors.nomorIdentitasPenerima}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-nama" style="width: 220px;">Nama Bank/Institusi/Penerima Investasi *</label>
            <input type="text" id="a3-nama" bind:value={draft.namaBankInstitusi} style="flex: 1;" />
          </div>
          {#if errors.namaBankInstitusi}<span class="error">{errors.namaBankInstitusi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-akun" style="width: 220px;">Nomor Akun *</label>
            <input type="text" id="a3-akun" bind:value={draft.nomorAkun} style="flex: 1;" />
          </div>
          {#if errors.nomorAkun}<span class="error">{errors.nomorAkun}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-harga" style="width: 220px;">Harga Perolehan *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a3-harga"
              value={formatRupiah(draft.hargaPerolehan)}
              oninput={(e: Event) => (draft.hargaPerolehan = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.hargaPerolehan}<span class="error">{errors.hargaPerolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-tahun" style="width: 220px;">Tahun Perolehan *</label>
            <input type="number" id="a3-tahun" bind:value={draft.tahunPerolehan} style="flex: 1;" />
          </div>
          {#if errors.tahunPerolehan}<span class="error">{errors.tahunPerolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-nilai" style="width: 220px;">Nilai Saat Ini *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a3-nilai"
              value={formatRupiah(draft.nilaiSaatIni)}
              oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a3-keterangan" style="width: 220px;">Keterangan</label>
            <select id="a3-keterangan" bind:value={draft.keterangan} style="flex: 1;">
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

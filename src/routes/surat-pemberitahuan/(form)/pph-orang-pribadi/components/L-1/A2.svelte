<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisA2 } from "./types";

    // A2. PIUTANG
    //
    // Carries two money columns specific to it (Nilai Piutang and Saldo Piutang
    // Saat Ini) and a Tahun Dimulai rather than a Tahun Perolehan. The saldo is
    // what rolls into A7.
    interface Props {
        rows: BarisA2[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisA2 => ({
        kode: '', deskripsi: '', lokasiHarta: '', nomorIdentitasPenerima: '',
        namaPenerimaPinjaman: '', nilaiPiutang: 0, tahunDimulai: 0, nilaiSaatIni: 0, keterangan: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisA2>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l1_a2_deskripsi', draft.deskripsi));
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
        // Derived from the NIK/NPWP on the live form, which also pre-fills it with
        // the filer's own identity. Kept editable: we have no taxpayer directory
        // to look it up in, and defaulting to the filer would be misleading.
        if (!draft.namaPenerimaPinjaman) next.namaPenerimaPinjaman = 'Kolom ini wajib diisi!';
        if (!draft.nilaiPiutang) next.nilaiPiutang = 'Kolom ini wajib diisi!';
        if (!draft.tahunDimulai) next.tahunDimulai = 'Kolom ini wajib diisi!';
        if (!draft.nilaiSaatIni) next.nilaiSaatIni = 'Kolom ini wajib diisi!';
        // Keterangan is optional here, by decision on 2026-08-20: the live form
        // rejects an empty one, but in this training app an empty Keterangan is
        // not worth blocking a row on. Every other column keeps its check.
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL1A2');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada tabel 2?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">2. PIUTANG</span>
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1A2">Tambah</Button>
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
                    <th>LOKASI PENERIMA PINJAMAN</th>
                    <th>NIK/NPWP PENERIMA PINJAMAN</th>
                    <th>NAMA PENERIMA PINJAMAN</th>
                    <th>TAHUN DIMULAI</th>
                    <th class="tw:text-end">NILAI PIUTANG</th>
                    <th class="tw:text-end">SALDO PIUTANG SAAT INI</th>
                    <th>KETERANGAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1A2">Ubah</Button>
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
                        <td>{row.namaPenerimaPinjaman}</td>
                        <td>{row.tahunDimulai}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiPiutang)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 9 : 8}>JUMLAH TABEL 2</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1A2" tabindex="-1" aria-labelledby="modalOpL1A2Label" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1A2Label" style="font-weight: bold; text-transform: uppercase;">
          Piutang
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="a2-kode" style="width: 220px;">Kode</label>
            <input type="text" id="a2-kode" value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="a2-deskripsi" style="width: 220px;">Deskripsi *</label>
            <select id="a2-deskripsi" bind:value={draft.deskripsi} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_a2_deskripsi ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-lokasi" style="width: 220px;">Lokasi Penerima *</label>
            <select id="a2-lokasi" bind:value={draft.lokasiHarta} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.negara ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.lokasiHarta}<span class="error">{errors.lokasiHarta}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-identitas" style="width: 220px;">Nomor Identitas Penerima (NIK/NPWP) *</label>
            <input type="text" id="a2-identitas" bind:value={draft.nomorIdentitasPenerima} style="flex: 1;" />
          </div>
          {#if errors.nomorIdentitasPenerima}<span class="error">{errors.nomorIdentitasPenerima}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-nama" style="width: 220px;">Nama Penerima Pinjaman *</label>
            <input type="text" id="a2-nama" bind:value={draft.namaPenerimaPinjaman} style="flex: 1;" />
          </div>
          {#if errors.namaPenerimaPinjaman}<span class="error">{errors.namaPenerimaPinjaman}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-nilai" style="width: 220px;">Nilai Piutang *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a2-nilai"
              value={formatRupiah(draft.nilaiPiutang)}
              oninput={(e: Event) => (draft.nilaiPiutang = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilaiPiutang}<span class="error">{errors.nilaiPiutang}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-tahun" style="width: 220px;">Tahun Dimulai *</label>
            <input type="number" id="a2-tahun" bind:value={draft.tahunDimulai} style="flex: 1;" />
          </div>
          {#if errors.tahunDimulai}<span class="error">{errors.tahunDimulai}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-saldo" style="width: 220px;">Saldo Piutang Saat Ini *</label>
            <input
              type="text"
              inputmode="numeric"
              id="a2-saldo"
              value={formatRupiah(draft.nilaiSaatIni)}
              oninput={(e: Event) => (draft.nilaiSaatIni = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilaiSaatIni}<span class="error">{errors.nilaiSaatIni}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="a2-keterangan" style="width: 220px;">Keterangan</label>
            <select id="a2-keterangan" bind:value={draft.keterangan} style="flex: 1;">
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

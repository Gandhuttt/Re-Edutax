<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisHartaFiskal } from "./types";

    // One sub-grid of L-3C. Coretax renders twelve of these -- five KELOMPOK for
    // harta berwujud, PERMANEN/TIDAK PERMANEN for bangunan, five for harta tidak
    // berwujud -- as instances of a single component distinguished only by its
    // tableIndex input, so this mirrors that rather than duplicating markup.
    interface Props {
        rows: BarisHartaFiskal[];
        tableIndex: number;
        judul: string;
        // Which reference list backs KELOMPOK/JENIS HARTA; differs per section.
        daftarHarta: string;
        // Grid 2 (bangunan) bounds the acquisition date by the tax year, grids 1
        // and 3 by the current calendar year. See below.
        seksi: 'berwujud' | 'bangunan' | 'takberwujud';
        tahunPajak: number;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let {
        rows = $bindable(),
        tableIndex,
        judul,
        daftarHarta,
        seksi,
        tahunPajak,
        referensi,
        kodeReferensi,
        readonly = false
    }: Props = $props();

    let modalId = $derived(`modalOpL3C${tableIndex}`);

    const kosong = (): BarisHartaFiskal => ({
        kodeHarta: '', jenisHarta: '', bulanPerolehan: 0, tahunPerolehan: 0,
        hargaPerolehan: 0, nilaiSisaBukuFiskal: 0, metodeKomersial: '',
        metodeFiskal: '', penyusutanFiskalTahunIni: 0, keterangan: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisHartaFiskal>(kosong());

    // Coretax's onAssetTypeChange sets the disabled AssetCode from the chosen
    // Jenis Harta, the same derivation used on every other lampiran.
    let kode = $derived(kodeUntuk(kodeReferensi, daftarHarta, draft.jenisHarta));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.penyusutanFiskalTahunIni || 0), 0));

    // Grids 1 and 3 bound the acquisition year by the CURRENT calendar year, not
    // the tax year -- filing a 2025 return during 2026 accepts 2026. That is
    // almost certainly a DJP bug, but it is what the bundle does, so it is
    // mirrored rather than corrected. Grid 2 uses the tax year.
    let tahunMaksimum = $derived(seksi === 'bangunan' ? tahunPajak : new Date().getFullYear());

    // Required in grid 1 only; grids 2 and 3 declare no validator on it.
    let perolehanWajib = $derived(seksi === 'berwujud');

    const BULAN = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

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
        if (!draft.jenisHarta) next.jenisHarta = 'Kolom ini wajib diisi!';
        if (perolehanWajib && (!draft.bulanPerolehan || !draft.tahunPerolehan))
            next.perolehan = 'Kolom ini wajib diisi!';
        if (draft.tahunPerolehan && draft.tahunPerolehan > tahunMaksimum)
            next.perolehan = `Tahun perolehan tidak boleh melebihi ${tahunMaksimum}.`;
        // greaterThan(0) in Coretax, unlike the other amounts which allow 0.
        if (!draft.hargaPerolehan) next.hargaPerolehan = 'Kolom ini wajib diisi!';
        if (draft.nilaiSisaBukuFiskal < 0) next.nilaiSisaBukuFiskal = 'Tidak boleh kurang dari 0.';
        if (!draft.metodeKomersial) next.metodeKomersial = 'Kolom ini wajib diisi!';
        if (!draft.metodeFiskal) next.metodeFiskal = 'Kolom ini wajib diisi!';
        if (draft.penyusutanFiskalTahunIni < 0)
            next.penyusutanFiskalTahunIni = 'Tidak boleh kurang dari 0.';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kodeHarta = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal(modalId);
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada ${judul}?`)) rows = [];
    }

    function tampilPerolehan(row: BarisHartaFiskal) {
        if (!row.bulanPerolehan || !row.tahunPerolehan) return '';
        return `${String(row.bulanPerolehan).padStart(2, '0')} ${row.tahunPerolehan}`;
    }
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">{judul}</span>
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target={`#${modalId}`}>Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th rowspan="2" class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th rowspan="2" class="tw:w-[4rem]">NO.</th>
                    <th rowspan="2">KODE HARTA</th>
                    <th rowspan="2">KELOMPOK/JENIS HARTA</th>
                    <th rowspan="2">BULAN/TAHUN PEROLEHAN</th>
                    <th rowspan="2">HARGA PEROLEHAN</th>
                    <th rowspan="2">NILAI SISA BUKU FISKAL AWAL TAHUN</th>
                    <th colspan="2">METODE PENYUSUTAN/AMORTISASI</th>
                    <th rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</th>
                    <th rowspan="2">KETERANGAN</th>
                </tr>
                <tr>
                    <th>KOMERSIAL</th>
                    <th>FISKAL</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target={`#${modalId}`}>Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kodeHarta}</td>
                        <td>{row.jenisHarta}</td>
                        <td>{tampilPerolehan(row)}</td>
                        <td class="tw:text-end">{formatRupiah(row.hargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilaiSisaBukuFiskal)}</td>
                        <td>{row.metodeKomersial}</td>
                        <td>{row.metodeFiskal}</td>
                        <td class="tw:text-end">{formatRupiah(row.penyusutanFiskalTahunIni)}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 9 : 8}>JUMLAH</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id={modalId} tabindex="-1" aria-labelledby={`${modalId}Label`} aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id={`${modalId}Label`} style="font-weight: bold; text-transform: uppercase;">
          {judul}
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-kode`} style="width: 220px;">Kode Harta</label>
            <input type="text" id={`${modalId}-kode`} value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-jenis`} style="width: 220px;">Jenis Harta *</label>
            <select id={`${modalId}-jenis`} bind:value={draft.jenisHarta} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi[daftarHarta] ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisHarta}<span class="error">{errors.jenisHarta}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-bulan`} style="width: 220px;">Bulan / Tahun Perolehan {perolehanWajib ? '*' : ''}</label>
            <select id={`${modalId}-bulan`} bind:value={draft.bulanPerolehan} style="flex: 1;">
              <option value={0}>Bulan</option>
              {#each BULAN as nama, i}
                <option value={i + 1}>{nama}</option>
              {/each}
            </select>
            <input
              type="number"
              id={`${modalId}-tahun`}
              bind:value={draft.tahunPerolehan}
              max={tahunMaksimum}
              placeholder="yyyy"
              style="flex: 1; margin-left: 10px;"
            />
          </div>
          {#if errors.perolehan}<span class="error">{errors.perolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-harga`} style="width: 220px;">Biaya Perolehan *</label>
            <input
              type="text"
              inputmode="numeric"
              id={`${modalId}-harga`}
              value={formatRupiah(draft.hargaPerolehan)}
              oninput={(e: Event) => (draft.hargaPerolehan = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.hargaPerolehan}<span class="error">{errors.hargaPerolehan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-sisa`} style="width: 220px;">Nilai Sisa Buku Fiskal Awal Tahun *</label>
            <input
              type="text"
              inputmode="numeric"
              id={`${modalId}-sisa`}
              value={formatRupiah(draft.nilaiSisaBukuFiskal)}
              oninput={(e: Event) => (draft.nilaiSisaBukuFiskal = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilaiSisaBukuFiskal}<span class="error">{errors.nilaiSisaBukuFiskal}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-komersial`} style="width: 220px;">Metode Penyusutan Komersial *</label>
            <select id={`${modalId}-komersial`} bind:value={draft.metodeKomersial} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3c_metode_komersial ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.metodeKomersial}<span class="error">{errors.metodeKomersial}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-fiskal`} style="width: 220px;">Metode Penyusutan Fiskal *</label>
            <select id={`${modalId}-fiskal`} bind:value={draft.metodeFiskal} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3c_metode_fiskal ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.metodeFiskal}<span class="error">{errors.metodeFiskal}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-nilai`} style="width: 220px;">Penyusutan Fiskal Tahun Ini *</label>
            <input
              type="text"
              inputmode="numeric"
              id={`${modalId}-nilai`}
              value={formatRupiah(draft.penyusutanFiskalTahunIni)}
              oninput={(e: Event) => (draft.penyusutanFiskalTahunIni = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penyusutanFiskalTahunIni}<span class="error">{errors.penyusutanFiskalTahunIni}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for={`${modalId}-keterangan`} style="width: 220px;">Keterangan</label>
            <input type="text" id={`${modalId}-keterangan`} bind:value={draft.keterangan} style="flex: 1;" />
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

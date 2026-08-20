<script lang="ts">
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisEntertainment } from "./types";

    // A. DAFTAR NOMINATIF BIAYA ENTERTAINMENT.
    //
    // Every visible control is required in Coretax and the amount carries
    // greaterThanEquals(0), so there is no optional column here.
    interface Props {
        rows: BarisEntertainment[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisEntertainment => ({
        tanggal: '', namaTempat: '', alamat: '', jenis: '', jumlahPemberian: 0, namaRelasi: '', posisiJabatan: '', namaPerusahaan: '', jenisUsahaRelasi: '', keterangan: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisEntertainment>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.jumlahPemberian || 0), 0));

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
        if (!draft.tanggal) next.tanggal = 'Kolom ini wajib diisi!';
        if (!draft.namaTempat) next.namaTempat = 'Kolom ini wajib diisi!';
        if (!draft.alamat) next.alamat = 'Kolom ini wajib diisi!';
        if (!draft.jenis) next.jenis = 'Kolom ini wajib diisi!';
        if (draft.jumlahPemberian < 0) next.jumlahPemberian = 'Tidak boleh kurang dari 0.';
        if (!draft.namaRelasi) next.namaRelasi = 'Kolom ini wajib diisi!';
        if (!draft.posisiJabatan) next.posisiJabatan = 'Kolom ini wajib diisi!';
        if (!draft.namaPerusahaan) next.namaPerusahaan = 'Kolom ini wajib diisi!';
        if (!draft.jenisUsahaRelasi) next.jenisUsahaRelasi = 'Kolom ini wajib diisi!';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;


        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL3DA');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL3DA">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>TANGGAL</th>
                    <th>NAMA TEMPAT</th>
                    <th>ALAMAT</th>
                    <th>JENIS</th>
                    <th class="tw:text-end">JUMLAH PEMBERIAN</th>
                    <th>NAMA RELASI</th>
                    <th>POSISI/JABATAN</th>
                    <th>NAMA PERUSAHAAN</th>
                    <th>JENIS USAHA RELASI</th>
                    <th>KETERANGAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL3DA">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.tanggal}</td>
                        <td>{row.namaTempat}</td>
                        <td>{row.alamat}</td>
                        <td>{row.jenis}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.jumlahPemberian)}</td>
                        <td>{row.namaRelasi}</td>
                        <td>{row.posisiJabatan}</td>
                        <td>{row.namaPerusahaan}</td>
                        <td>{row.jenisUsahaRelasi}</td>
                        <td>{row.keterangan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 12 : 11} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
            {/snippet}
        </Table>
    </div>
    <div class="tw:mt-2 tw:text-sm tw:font-bold tw:text-end">JUMLAH: {formatRupiahDerived(total)}</div>
</div>

<div class="modal fade" id="modalOpL3DA" tabindex="-1" aria-labelledby="modalOpL3DALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3DALabel" style="font-weight: bold; text-transform: uppercase;">
          DAFTAR NOMINATIF BIAYA HIBURAN
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-tanggal" style="width: 220px;">Tanggal *</label>
            <input type="date" id="modalOpL3DA-tanggal" bind:value={draft.tanggal} style="flex: 1;" />
          </div>
          {#if errors.tanggal}<span class="error">{errors.tanggal}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-namaTempat" style="width: 220px;">Nama Tempat *</label>
            <input type="text" id="modalOpL3DA-namaTempat" bind:value={draft.namaTempat} style="flex: 1;" />
          </div>
          {#if errors.namaTempat}<span class="error">{errors.namaTempat}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-alamat" style="width: 220px;">Alamat *</label>
            <input type="text" id="modalOpL3DA-alamat" bind:value={draft.alamat} style="flex: 1;" />
          </div>
          {#if errors.alamat}<span class="error">{errors.alamat}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-jenis" style="width: 220px;">Jenis *</label>
            <input type="text" id="modalOpL3DA-jenis" bind:value={draft.jenis} style="flex: 1;" />
          </div>
          {#if errors.jenis}<span class="error">{errors.jenis}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-jumlahPemberian" style="width: 220px;">Jumlah Pemberian *</label>
            <input
              type="text"
              inputmode="numeric"
              id="modalOpL3DA-jumlahPemberian"
              value={formatRupiah(draft.jumlahPemberian)}
              oninput={(e: Event) => (draft.jumlahPemberian = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.jumlahPemberian}<span class="error">{errors.jumlahPemberian}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-namaRelasi" style="width: 220px;">Nama Relasi *</label>
            <input type="text" id="modalOpL3DA-namaRelasi" bind:value={draft.namaRelasi} style="flex: 1;" />
          </div>
          {#if errors.namaRelasi}<span class="error">{errors.namaRelasi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-posisiJabatan" style="width: 220px;">Posisi/Jabatan *</label>
            <input type="text" id="modalOpL3DA-posisiJabatan" bind:value={draft.posisiJabatan} style="flex: 1;" />
          </div>
          {#if errors.posisiJabatan}<span class="error">{errors.posisiJabatan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-namaPerusahaan" style="width: 220px;">Nama Perusahaan *</label>
            <input type="text" id="modalOpL3DA-namaPerusahaan" bind:value={draft.namaPerusahaan} style="flex: 1;" />
          </div>
          {#if errors.namaPerusahaan}<span class="error">{errors.namaPerusahaan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-jenisUsahaRelasi" style="width: 220px;">Jenis Usaha Relasi *</label>
            <input type="text" id="modalOpL3DA-jenisUsahaRelasi" bind:value={draft.jenisUsahaRelasi} style="flex: 1;" />
          </div>
          {#if errors.jenisUsahaRelasi}<span class="error">{errors.jenisUsahaRelasi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DA-keterangan" style="width: 220px;">Keterangan *</label>
            <input type="text" id="modalOpL3DA-keterangan" bind:value={draft.keterangan} style="flex: 1;" />
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
    tr:not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
    }
    .error { background: #fde8e8; color: #b91c1c; font-size: 0.75rem; padding: 0.25rem 0.5rem; margin-left: 220px; }
</style>

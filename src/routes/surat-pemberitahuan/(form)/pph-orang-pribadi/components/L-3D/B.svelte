<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPromosi } from "./types";

    // B. DAFTAR NOMINATIF BIAYA PROMOSI SERTA PENGGANTIAN ATAU IMBALAN DALAM
    // BENTUK NATURA DAN/ATAU KENIKMATAN.
    interface Props {
        rows: BarisPromosi[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisPromosi => ({
        nomorIdentitasPenerima: '', namaPenerima: '', alamatPenerima: '', tanggal: '', bentukJenisBiaya: '', nilai: 0, keterangan: '', jumlahPemotongan: 0, nomorBuktiPotong: '', kodeBentukJenisBiaya: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPromosi>(kosong());

    let kodeBentukJenisBiaya = $derived(kodeUntuk(kodeReferensi, 'l3d_jenis_biaya_promosi', draft.bentukJenisBiaya));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.nilai || 0), 0));

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
        if (!draft.nomorIdentitasPenerima) next.nomorIdentitasPenerima = 'Kolom ini wajib diisi!';
        if (!draft.namaPenerima) next.namaPenerima = 'Kolom ini wajib diisi!';
        if (!draft.alamatPenerima) next.alamatPenerima = 'Kolom ini wajib diisi!';
        if (!draft.tanggal) next.tanggal = 'Kolom ini wajib diisi!';
        if (!draft.bentukJenisBiaya) next.bentukJenisBiaya = 'Kolom ini wajib diisi!';
        if (draft.nilai < 0) next.nilai = 'Tidak boleh kurang dari 0.';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        if (draft.jumlahPemotongan < 0) next.jumlahPemotongan = 'Tidak boleh kurang dari 0.';
        if (!draft.nomorBuktiPotong) next.nomorBuktiPotong = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kodeBentukJenisBiaya = kodeBentukJenisBiaya;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL3DB');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL3DB">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NOMOR IDENTITAS PENERIMA</th>
                    <th>NAMA PENERIMA</th>
                    <th>ALAMAT PENERIMA</th>
                    <th>TANGGAL</th>
                    <th>KODE</th>
                    <th>BENTUK DAN JENIS BIAYA</th>
                    <th class="tw:text-end">NILAI</th>
                    <th>KETERANGAN</th>
                    <th class="tw:text-end">JUMLAH PEMOTONGAN/PEMUNGUTAN PPh</th>
                    <th>NOMOR BUKTI POTONG</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL3DB">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.nomorIdentitasPenerima}</td>
                        <td>{row.namaPenerima}</td>
                        <td>{row.alamatPenerima}</td>
                        <td>{row.tanggal}</td>
                        <td>{row.kodeBentukJenisBiaya}</td>
                        <td>{row.bentukJenisBiaya}</td>
                        <td class="tw:text-end">{formatRupiah(row.nilai)}</td>
                        <td>{row.keterangan}</td>
                        <td class="tw:text-end">{formatRupiah(row.jumlahPemotongan)}</td>
                        <td>{row.nomorBuktiPotong}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 12 : 11} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
            {/snippet}
        </Table>
    </div>
    <div class="tw:mt-2 tw:text-sm tw:font-bold tw:text-end">JUMLAH: {formatRupiah(total)}</div>
</div>

<div class="modal fade" id="modalOpL3DB" tabindex="-1" aria-labelledby="modalOpL3DBLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3DBLabel" style="font-weight: bold; text-transform: uppercase;">
          DAFTAR NOMINATIF BIAYA PROMOSI
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-nomorIdentitasPenerima" style="width: 220px;">Nomor Identitas Penerima *</label>
            <input type="text" id="modalOpL3DB-nomorIdentitasPenerima" bind:value={draft.nomorIdentitasPenerima} style="flex: 1;" />
          </div>
          {#if errors.nomorIdentitasPenerima}<span class="error">{errors.nomorIdentitasPenerima}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-namaPenerima" style="width: 220px;">Nama Penerima *</label>
            <input type="text" id="modalOpL3DB-namaPenerima" bind:value={draft.namaPenerima} style="flex: 1;" />
          </div>
          {#if errors.namaPenerima}<span class="error">{errors.namaPenerima}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-alamatPenerima" style="width: 220px;">Alamat Penerima *</label>
            <input type="text" id="modalOpL3DB-alamatPenerima" bind:value={draft.alamatPenerima} style="flex: 1;" />
          </div>
          {#if errors.alamatPenerima}<span class="error">{errors.alamatPenerima}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-tanggal" style="width: 220px;">Tanggal *</label>
            <input type="date" id="modalOpL3DB-tanggal" bind:value={draft.tanggal} style="flex: 1;" />
          </div>
          {#if errors.tanggal}<span class="error">{errors.tanggal}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-kodeBentukJenisBiaya" style="width: 220px;">Kode Bentuk dan Jenis Biaya</label>
            <input type="text" id="modalOpL3DB-kodeBentukJenisBiaya" value={kodeBentukJenisBiaya} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-bentukJenisBiaya" style="width: 220px;">Bentuk dan Jenis Biaya *</label>
            <select id="modalOpL3DB-bentukJenisBiaya" bind:value={draft.bentukJenisBiaya} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3d_jenis_biaya_promosi ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.bentukJenisBiaya}<span class="error">{errors.bentukJenisBiaya}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-nilai" style="width: 220px;">Nilai *</label>
            <input
              type="text"
              inputmode="numeric"
              id="modalOpL3DB-nilai"
              value={formatRupiah(draft.nilai)}
              oninput={(e: Event) => (draft.nilai = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.nilai}<span class="error">{errors.nilai}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-keterangan" style="width: 220px;">Keterangan *</label>
            <input type="text" id="modalOpL3DB-keterangan" bind:value={draft.keterangan} style="flex: 1;" />
          </div>
          {#if errors.keterangan}<span class="error">{errors.keterangan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-jumlahPemotongan" style="width: 220px;">Jumlah Pemotongan/Pemungutan PPh *</label>
            <input
              type="text"
              inputmode="numeric"
              id="modalOpL3DB-jumlahPemotongan"
              value={formatRupiah(draft.jumlahPemotongan)}
              oninput={(e: Event) => (draft.jumlahPemotongan = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.jumlahPemotongan}<span class="error">{errors.jumlahPemotongan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DB-nomorBuktiPotong" style="width: 220px;">Nomor Bukti Potong *</label>
            <input type="text" id="modalOpL3DB-nomorBuktiPotong" bind:value={draft.nomorBuktiPotong} style="flex: 1;" />
          </div>
          {#if errors.nomorBuktiPotong}<span class="error">{errors.nomorBuktiPotong}</span>{/if}
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

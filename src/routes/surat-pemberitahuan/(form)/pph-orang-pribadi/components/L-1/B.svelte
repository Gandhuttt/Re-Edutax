<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisUtang } from "./types";

    // B. UTANG PADA AKHIR TAHUN PAJAK. Feeds Induk 14b.
    //
    // Editable exactly when Induk 14b is Ya. When it is Tidak the grid still
    // renders its rows, it just offers no way to add or remove them.
    interface Props {
        rows: BarisUtang[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisUtang => ({
        kode: '', deskripsi: '', nikNpwpKreditur: '', namaKreditur: '',
        negaraKreditur: '', tahunPeminjaman: 0, saldo: 0, keterangan: ''
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisUtang>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l1_b_deskripsi', draft.deskripsi));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.saldo || 0), 0));

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
        if (!draft.nikNpwpKreditur) next.nikNpwpKreditur = 'Kolom ini wajib diisi!';
        if (!draft.namaKreditur) next.namaKreditur = 'Kolom ini wajib diisi!';
        if (!draft.negaraKreditur) next.negaraKreditur = 'Kolom ini wajib diisi!';
        // Tahun Peminjaman carries no asterisk on the live form and stays optional.
        if (!draft.saldo) next.saldo = 'Kolom ini wajib diisi!';
        if (!draft.keterangan) next.keterangan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL1B');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1B">Tambah</Button>
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
                    <th>KREDITUR</th>
                    <th>NEGARA KREDITUR</th>
                    <th>TAHUN PEMINJAMAN</th>
                    <th class="tw:text-end">SALDO</th>
                    <th>KETERANGAN</th>
                    <th>NOMOR IDENTITAS WP</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1B">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.kode}</td>
                        <td>{row.deskripsi}</td>
                        <td>{row.namaKreditur}</td>
                        <td>{row.negaraKreditur}</td>
                        <td>{row.tahunPeminjaman}</td>
                        <td class="tw:text-end">{formatRupiah(row.saldo)}</td>
                        <td>{row.keterangan}</td>
                        <td>{row.nikNpwpKreditur}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 10 : 9} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 7 : 6}>JUMLAH BAGIAN B</td>
                    <td class="tw:text-end">{formatRupiah(total)}</td>
                    <td colspan="2"></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1B" tabindex="-1" aria-labelledby="modalOpL1BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1BLabel" style="font-weight: bold; text-transform: uppercase;">
          UTANG PADA AKHIR TAHUN PAJAK
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="b-kode" style="width: 220px;">Kode</label>
            <input type="text" id="b-kode" value={kode} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="b-deskripsi" style="width: 220px;">Deskripsi *</label>
            <select id="b-deskripsi" bind:value={draft.deskripsi} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_b_deskripsi ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.deskripsi}<span class="error">{errors.deskripsi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-nik" style="width: 220px;">NIK/NPWP Kreditur *</label>
            <input type="text" id="b-nik" bind:value={draft.nikNpwpKreditur} style="flex: 1;" />
          </div>
          {#if errors.nikNpwpKreditur}<span class="error">{errors.nikNpwpKreditur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-nama" style="width: 220px;">Nama Kreditur *</label>
            <input type="text" id="b-nama" bind:value={draft.namaKreditur} style="flex: 1;" />
          </div>
          {#if errors.namaKreditur}<span class="error">{errors.namaKreditur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-negara" style="width: 220px;">Negara Kreditur *</label>
            <select id="b-negara" bind:value={draft.negaraKreditur} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.negara ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.negaraKreditur}<span class="error">{errors.negaraKreditur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-tahun" style="width: 220px;">Tahun Peminjaman</label>
            <input type="number" id="b-tahun" bind:value={draft.tahunPeminjaman} style="flex: 1;" />
          </div>
          {#if errors.tahunPeminjaman}<span class="error">{errors.tahunPeminjaman}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-saldo" style="width: 220px;">Saldo *</label>
            <input
              type="text"
              inputmode="numeric"
              id="b-saldo"
              value={formatRupiah(draft.saldo)}
              oninput={(e: Event) => (draft.saldo = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.saldo}<span class="error">{errors.saldo}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="b-keterangan" style="width: 220px;">Keterangan *</label>
            <select id="b-keterangan" bind:value={draft.keterangan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_b_keterangan ?? [] as opsi}
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

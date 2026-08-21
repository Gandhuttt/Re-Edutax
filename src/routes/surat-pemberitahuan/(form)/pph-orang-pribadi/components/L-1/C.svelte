<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import type { BarisKeluarga } from "./types";

    // C. DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN
    //
    // Read-only on the live form in every captured state: there it is filled from
    // DJP records independently of the Posting SPT action (it held three
    // dependants even though Posting reported "belum pernah dilakukan"), and its
    // column set in the bundle is the only L-1 grid with no TINDAKAN column. A
    // training app has no DJP records to pull from, so the rows are entered here
    // instead and the grid carries the same editor as its siblings.
    //
    // Column types are the bundle's own: NAMA and NIK strings, TANGGAL LAHIR a
    // Date, HUBUNGAN DENGAN WAJIB PAJAK a dropdown over FAMILY_STATUS (seeded as
    // l1_c_hubungan), and PEKERJAAN a string whose reference type is null -- free
    // text by DJP's definition, not for want of a list.
    //
    // No totals row: nothing here is a money column.
    interface Props {
        rows: BarisKeluarga[];
        referensi: Record<string, string[]>;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, readonly = false }: Props = $props();

    const kosong = (): BarisKeluarga => ({
        nama: '', nik: '', tanggalLahir: '', hubungan: '', pekerjaan: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisKeluarga>(kosong());
    let errors = $state<Record<string, string>>({});

    // No Induk answer routes to this grid, so it is editable whenever the form is.
    let bisaEdit = $derived(!readonly);

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
        if (!draft.nama) next.nama = 'Kolom ini wajib diisi!';
        if (!draft.nik) next.nik = 'Kolom ini wajib diisi!';
        if (!draft.tanggalLahir) next.tanggalLahir = 'Kolom ini wajib diisi!';
        if (!draft.hubungan) next.hubungan = 'Kolom ini wajib diisi!';
        // Pekerjaan stays optional: the live grid never validates, so there is no
        // requiredness to copy, and a dependant with no occupation is ordinary.
        errors = next;
        if (Object.keys(next).length > 0) return;

        const baris = { ...draft };
        if (indeksDiubah === null) rows = [...rows, baris];
        else rows = rows.map((r, i) => (i === indeksDiubah ? baris : r));
        closeBsModal('modalOpL1C');
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian C?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    {#if bisaEdit}
        <div class="tw:mb-2 tw:flex tw:justify-end tw:gap-2">
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL1C">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto tw:mt-2">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NAMA</th>
                    <th>NIK</th>
                    <th>TANGGAL LAHIR</th>
                    <th>HUBUNGAN DENGAN WAJIB PAJAK</th>
                    <th>PEKERJAAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL1C">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.nama}</td>
                        <td>{row.nik}</td>
                        <td>{row.tanggalLahir}</td>
                        <td>{row.hubungan}</td>
                        <td>{row.pekerjaan}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 7 : 6} class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL1C" tabindex="-1" aria-labelledby="modalOpL1CLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL1CLabel" style="font-weight: bold; text-transform: uppercase;">
          Daftar Anggota Keluarga yang Menjadi Tanggungan
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="c-nama" style="width: 220px;">Nama *</label>
            <input type="text" id="c-nama" bind:value={draft.nama} style="flex: 1;" />
          </div>
          {#if errors.nama}<span class="error">{errors.nama}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="c-nik" style="width: 220px;">NIK *</label>
            <input type="text" id="c-nik" bind:value={draft.nik} style="flex: 1;" />
          </div>
          {#if errors.nik}<span class="error">{errors.nik}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="c-tanggal-lahir" style="width: 220px;">Tanggal Lahir *</label>
            <input type="date" id="c-tanggal-lahir" bind:value={draft.tanggalLahir} style="flex: 1;" />
          </div>
          {#if errors.tanggalLahir}<span class="error">{errors.tanggalLahir}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="c-hubungan" style="width: 220px;">Hubungan dengan Wajib Pajak *</label>
            <select id="c-hubungan" bind:value={draft.hubungan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l1_c_hubungan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.hubungan}<span class="error">{errors.hubungan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="c-pekerjaan" style="width: 220px;">Pekerjaan</label>
            <input type="text" id="c-pekerjaan" bind:value={draft.pekerjaan} style="flex: 1;" />
          </div>
          {#if errors.pekerjaan}<span class="error">{errors.pekerjaan}</span>{/if}
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
    .error { background: #fde8e8; color: #b91c1c; font-size: 0.75rem; padding: 0.25rem 0.5rem; margin-left: 220px; }
</style>

<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisPiutang } from "./types";

    // C. Piutang yang nyata-nyata tidak dapat ditagih.
    interface Props {
        rows: BarisPiutang[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, readonly = false }: Props = $props();

    const kosong = (): BarisPiutang => ({
        nomorIdentitasDebitur: '', namaDebitur: '', alamatDebitur: '', jumlahPlafon: 0, jumlahTidakDapatDitagih: 0, metodePembebanan: '', jenisDokumen: '', kodeMetodePembebanan: '', kodeJenisDokumen: ''
    });

    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPiutang>(kosong());

    let kodeMetodePembebanan = $derived(kodeUntuk(kodeReferensi, 'l3d_metode_pembebanan', draft.metodePembebanan));
    let kodeJenisDokumen = $derived(kodeUntuk(kodeReferensi, 'l3d_jenis_dokumen', draft.jenisDokumen));
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(!readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.jumlahTidakDapatDitagih || 0), 0));

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
        if (!draft.nomorIdentitasDebitur) next.nomorIdentitasDebitur = 'Kolom ini wajib diisi!';
        if (!draft.namaDebitur) next.namaDebitur = 'Kolom ini wajib diisi!';
        if (!draft.alamatDebitur) next.alamatDebitur = 'Kolom ini wajib diisi!';
        if (draft.jumlahPlafon < 0) next.jumlahPlafon = 'Tidak boleh kurang dari 0.';
        if (draft.jumlahTidakDapatDitagih < 0) next.jumlahTidakDapatDitagih = 'Tidak boleh kurang dari 0.';
        if (!draft.metodePembebanan) next.metodePembebanan = 'Kolom ini wajib diisi!';
        if (!draft.jenisDokumen) next.jenisDokumen = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kodeMetodePembebanan = kodeMetodePembebanan;
        draft.kodeJenisDokumen = kodeJenisDokumen;
        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL3DC');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL3DC">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NOMOR IDENTITAS DEBITUR</th>
                    <th>NAMA DEBITUR</th>
                    <th>ALAMAT DEBITUR</th>
                    <th class="tw:text-end">JUMLAH PLAFON PIUTANG</th>
                    <th class="tw:text-end">JUMLAH PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH</th>
                    <th>KODE METODE</th>
                    <th>METODE PEMBEBANAN</th>
                    <th>KODE DOKUMEN</th>
                    <th>JENIS DOKUMEN PEMBUKTIAN PEMENUHAN PERSYARATAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL3DC">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.nomorIdentitasDebitur}</td>
                        <td>{row.namaDebitur}</td>
                        <td>{row.alamatDebitur}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.jumlahPlafon)}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.jumlahTidakDapatDitagih)}</td>
                        <td>{row.kodeMetodePembebanan}</td>
                        <td>{row.metodePembebanan}</td>
                        <td>{row.kodeJenisDokumen}</td>
                        <td>{row.jenisDokumen}</td>
                    </tr>
                {:else}
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
            {/snippet}
        </Table>
    </div>
    <div class="tw:mt-2 tw:text-sm tw:font-bold tw:text-end">JUMLAH: {formatRupiahDerived(total)}</div>
</div>

<div class="modal fade" id="modalOpL3DC" tabindex="-1" aria-labelledby="modalOpL3DCLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL3DCLabel" style="font-weight: bold; text-transform: uppercase;">
          PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-nomorIdentitasDebitur" style="width: 220px;">Nomor Identitas Debitur *</label>
            <input type="text" id="modalOpL3DC-nomorIdentitasDebitur" bind:value={draft.nomorIdentitasDebitur} style="flex: 1;" />
          </div>
          {#if errors.nomorIdentitasDebitur}<span class="error">{errors.nomorIdentitasDebitur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-namaDebitur" style="width: 220px;">Nama Debitur *</label>
            <input type="text" id="modalOpL3DC-namaDebitur" bind:value={draft.namaDebitur} style="flex: 1;" />
          </div>
          {#if errors.namaDebitur}<span class="error">{errors.namaDebitur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-alamatDebitur" style="width: 220px;">Alamat Debitur *</label>
            <input type="text" id="modalOpL3DC-alamatDebitur" bind:value={draft.alamatDebitur} style="flex: 1;" />
          </div>
          {#if errors.alamatDebitur}<span class="error">{errors.alamatDebitur}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-jumlahPlafon" style="width: 220px;">Jumlah Plafon Piutang *</label>
            <input
              type="text"
              inputmode="numeric"
              id="modalOpL3DC-jumlahPlafon"
              value={formatRupiah(draft.jumlahPlafon)}
              oninput={(e: Event) => (draft.jumlahPlafon = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.jumlahPlafon}<span class="error">{errors.jumlahPlafon}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-jumlahTidakDapatDitagih" style="width: 220px;">Jumlah Piutang yang Nyata-Nyata Tidak Dapat Ditagih *</label>
            <input
              type="text"
              inputmode="numeric"
              id="modalOpL3DC-jumlahTidakDapatDitagih"
              value={formatRupiah(draft.jumlahTidakDapatDitagih)}
              oninput={(e: Event) => (draft.jumlahTidakDapatDitagih = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.jumlahTidakDapatDitagih}<span class="error">{errors.jumlahTidakDapatDitagih}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-kodeMetodePembebanan" style="width: 220px;">Kode Metode Pembebanan</label>
            <input type="text" id="modalOpL3DC-kodeMetodePembebanan" value={kodeMetodePembebanan} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-metodePembebanan" style="width: 220px;">Metode Pembebanan *</label>
            <select id="modalOpL3DC-metodePembebanan" bind:value={draft.metodePembebanan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3d_metode_pembebanan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.metodePembebanan}<span class="error">{errors.metodePembebanan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-kodeJenisDokumen" style="width: 220px;">Kode Jenis Dokumen</label>
            <input type="text" id="modalOpL3DC-kodeJenisDokumen" value={kodeJenisDokumen} readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="modalOpL3DC-jenisDokumen" style="width: 220px;">Jenis Dokumen Pembuktian Pemenuhan Persyaratan *</label>
            <select id="modalOpL3DC-jenisDokumen" bind:value={draft.jenisDokumen} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l3d_jenis_dokumen ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisDokumen}<span class="error">{errors.jenisDokumen}</span>{/if}
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

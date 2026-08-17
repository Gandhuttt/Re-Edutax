<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisLuarNegeri } from "./types";

    // C. PENGHASILAN NETO LUAR NEGERI.
    //
    // The most divergent grid in the form:
    //   - it is the only one carrying foreign currency, so it shows both the
    //     asing and rupiah amounts side by side rather than converting
    //   - its empty state reads "Tidak ada data untuk ditampilkan." where every
    //     L-1 grid says "Tidak ada data yang ditemukan."
    //   - it has two consumers, not one
    //
    // Feeds Induk 1.d via JUMLAH PENGHASILAN NETO, and separately feeds L-1
    // Bagian E its KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI row, which rolls on
    // into Induk 10a. That second edge is lampiran-to-lampiran and was only found
    // because every grid was populated at once.
    interface Props {
        rows: BarisLuarNegeri[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisLuarNegeri => ({
        namaSumber: '', negara: '', tanggalTransaksi: '', jenisPenghasilan: '',
        kodePenghasilan: '', penghasilanNeto: 0, pajakLuarNegeriAsing: 0,
        mataUang: '', pajakLuarNegeriRupiah: 0, kreditPajakDiperhitungkan: 0
    });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisLuarNegeri>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let totalNeto = $derived(rows.reduce((s, r) => s + Number(r.penghasilanNeto || 0), 0));
    // The live form totals three columns in this footer, not two: the foreign
    // currency amount is left untotaled (mixed currencies), but its Rupiah
    // conversion is, alongside the neto and the kredit.
    let totalPajakRupiah = $derived(rows.reduce((s, r) => s + Number(r.pajakLuarNegeriRupiah || 0), 0));
    let totalKredit = $derived(rows.reduce((s, r) => s + Number(r.kreditPajakDiperhitungkan || 0), 0));

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
        if (!draft.namaSumber) next.namaSumber = 'Kolom ini wajib diisi!';
        if (!draft.negara) next.negara = 'Kolom ini wajib diisi!';
        if (!draft.tanggalTransaksi) next.tanggalTransaksi = 'Kolom ini wajib diisi!';
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanNeto) next.penghasilanNeto = 'Kolom ini wajib diisi!';
        if (!draft.pajakLuarNegeriAsing) next.pajakLuarNegeriAsing = 'Kolom ini wajib diisi!';
        if (!draft.mataUang) next.mataUang = 'Kolom ini wajib diisi!';
        if (!draft.pajakLuarNegeriRupiah) next.pajakLuarNegeriRupiah = 'Kolom ini wajib diisi!';
        if (!draft.kreditPajakDiperhitungkan) next.kreditPajakDiperhitungkan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        closeBsModal('modalOpL2C');
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
            <Button type="button" onclick={bukaTambah} data-bs-toggle="modal" data-bs-target="#modalOpL2C">Tambah</Button>
            <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
        </div>
    {/if}

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>SUMBER/PEMBERI PENGHASILAN</th>
                    <th>NEGARA</th>
                    <th>TANGGAL TRANSAKSI</th>
                    <th>JENIS PENGHASILAN</th>
                    <th class="tw:text-end">PENGHASILAN NETO (RUPIAH)</th>
                    <th>MATA UANG ASING</th>
                    <th class="tw:text-end">NILAI DALAM MATA UANG ASING</th>
                    <th class="tw:text-end">NILAI DALAM RUPIAH</th>
                    <th class="tw:text-end">KREDIT PAJAK YANG DAPAT DIPERHITUNGKAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)} data-bs-toggle="modal" data-bs-target="#modalOpL2C">Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.namaSumber}</td>
                        <td>{row.negara}</td>
                        <td>{row.tanggalTransaksi}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanNeto)}</td>
                        <td>{row.mataUang}</td>
                        <td class="tw:text-end">{formatRupiah(row.pajakLuarNegeriAsing)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pajakLuarNegeriRupiah)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kreditPajakDiperhitungkan)}</td>
                    </tr>
                {:else}
                    <!-- Different empty-state wording from the L-1 grids. -->
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH PENGHASILAN NETO</td>
                    <td class="tw:text-end">{formatRupiah(totalNeto)}</td>
                    <td colspan="2"></td>
                    <td class="tw:text-end">{formatRupiah(totalPajakRupiah)}</td>
                    <td class="tw:text-end">{formatRupiah(totalKredit)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<div class="modal fade" id="modalOpL2C" tabindex="-1" aria-labelledby="modalOpL2CLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalOpL2CLabel" style="font-weight: bold; text-transform: uppercase;">
          Penghasilan Luar Negeri
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="l2c-nama" style="width: 220px;">Nama Sumber/Pemberi Penghasilan *</label>
            <input type="text" id="l2c-nama" bind:value={draft.namaSumber} style="flex: 1;" />
          </div>
          {#if errors.namaSumber}<span class="error">{errors.namaSumber}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-negara" style="width: 220px;">Negara Sumber/Pemberi Penghasilan *</label>
            <select id="l2c-negara" bind:value={draft.negara} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.negara ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.negara}<span class="error">{errors.negara}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-tanggal" style="width: 220px;">Tanggal Transaksi *</label>
            <input type="date" id="l2c-tanggal" bind:value={draft.tanggalTransaksi} style="flex: 1;" />
          </div>
          {#if errors.tanggalTransaksi}<span class="error">{errors.tanggalTransaksi}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-jenis" style="width: 220px;">Jenis Penghasilan *</label>
            <select id="l2c-jenis" bind:value={draft.jenisPenghasilan} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.l2_c_jenis_penghasilan ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-kode" style="width: 220px;">Kode Penghasilan</label>
            <input type="text" id="l2c-kode" value="" readonly style="flex: 1; background-color: #e9ecef;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="l2c-neto" style="width: 220px;">Penghasilan Neto *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2c-neto"
              value={formatRupiah(draft.penghasilanNeto)}
              oninput={(e: Event) => (draft.penghasilanNeto = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.penghasilanNeto}<span class="error">{errors.penghasilanNeto}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-pajak-asing" style="width: 220px;">Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Mata Uang Asing *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2c-pajak-asing"
              value={formatRupiah(draft.pajakLuarNegeriAsing)}
              oninput={(e: Event) => (draft.pajakLuarNegeriAsing = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.pajakLuarNegeriAsing}<span class="error">{errors.pajakLuarNegeriAsing}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-mata-uang" style="width: 220px;">Mata Uang *</label>
            <select id="l2c-mata-uang" bind:value={draft.mataUang} style="flex: 1;">
              <option value={""}>Silakan pilih</option>
              {#each referensi.mata_uang ?? [] as opsi}
                <option value={opsi}>{opsi}</option>
              {/each}
            </select>
          </div>
          {#if errors.mataUang}<span class="error">{errors.mataUang}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-pajak-rupiah" style="width: 220px;">Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Rupiah *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2c-pajak-rupiah"
              value={formatRupiah(draft.pajakLuarNegeriRupiah)}
              oninput={(e: Event) => (draft.pajakLuarNegeriRupiah = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.pajakLuarNegeriRupiah}<span class="error">{errors.pajakLuarNegeriRupiah}</span>{/if}
          <div style="display: flex; align-items: center;">
            <label for="l2c-kredit" style="width: 220px;">Kredit Pajak yang Dapat Diperhitungkan *</label>
            <input
              type="text"
              inputmode="numeric"
              id="l2c-kredit"
              value={formatRupiah(draft.kreditPajakDiperhitungkan)}
              oninput={(e: Event) => (draft.kreditPajakDiperhitungkan = applyRupiahInput(e))}
              style="flex: 1; text-align: right;"
            />
          </div>
          {#if errors.kreditPajakDiperhitungkan}<span class="error">{errors.kreditPajakDiperhitungkan}</span>{/if}
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

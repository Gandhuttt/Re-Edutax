<script lang="ts">
    import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

    let {
        data = $bindable() as {
            id: string | number;
            namaPemberiPenghasilan: string;
            negara?: string;
            tanggal?: string;
            jenisPenghasilan?: string;
            penghasilanNeto?: number;
            pphLuarNegeri?: number;
            mataUang?: string;
            pphLuarNegeriMataUangAsing?: number;
            kreditPajakYangDapatDikreditkan?: number;
            keterangan?: string;
        },
        saveItem,
        negaraOptions,
        jenisPenghasilanOptions,
        mataUangOptions
    }: {
        data: {
            id: string | number;
            namaPemberiPenghasilan: string;
            negara?: string;
            tanggal?: string;
            jenisPenghasilan?: string;
            penghasilanNeto?: number;
            pphLuarNegeri?: number;
            mataUang?: string;
            pphLuarNegeriMataUangAsing?: number;
            kreditPajakYangDapatDikreditkan?: number;
            keterangan?: string;
        };
        saveItem: () => void;
        negaraOptions: { value: string; label: string }[];
        jenisPenghasilanOptions: { value: string; label: string }[];
        mataUangOptions: { value: string; label: string }[];
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL3A" tabindex="-1" aria-labelledby="modalL3ALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL3ALabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT PENGHASILAN DARI LUAR NEGERI
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="namaPemberiPenghasilan" style="width: 220px;">Nama *</label>
            <input type="text" id="namaPemberiPenghasilan" bind:value={data.namaPemberiPenghasilan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="negara" style="width: 220px;">NEGARA</label>
            <select id="negara" bind:value={data.negara} style="flex: 1;">
              <option value="" disabled>Pilih negara</option>
              {#each negaraOptions as negara}
                <option value={negara.value}>{negara.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="tanggal" style="width: 220px;">Tanggal PPh Terutang/Dibayar/Dipotong *</label>
            <input type="date" id="tanggal" bind:value={data.tanggal} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="jenisPenghasilan" style="width: 220px;">Jenis Penghasilan *</label>
            <select id="jenisPenghasilan" bind:value={data.jenisPenghasilan} style="flex: 1;">
              <option value="" disabled>Pilih jenis penghasilan</option>
              {#each jenisPenghasilanOptions as jenis}
                <option value={jenis.value}>{jenis.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="penghasilanNeto" style="width: 220px;">Penghasilan Neto *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="penghasilanNeto"
                value={formatRupiah(data.penghasilanNeto)}
                oninput={(e) => (data.penghasilanNeto = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="pphLuarNegeri" style="width: 220px;">PPh Terutang/Dibayar/Dipotong di Luar Negeri *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="pphLuarNegeri"
                value={formatRupiah(data.pphLuarNegeri)}
                oninput={(e) => (data.pphLuarNegeri = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="mataUang" style="width: 220px;">Mata Uang *</label>
            <select id="mataUang" bind:value={data.mataUang} style="flex: 1;">
              <option value="" disabled>Pilih mata uang</option>
              {#each mataUangOptions as mataUang}
                <option value={mataUang.value}>{mataUang.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="pphLuarNegeriMataUangAsing" style="width: 220px;">PPh yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Mata Uang Asing *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <input
                type="text"
                inputmode="numeric"
                id="pphLuarNegeriMataUangAsing"
                value={formatRupiah(data.pphLuarNegeriMataUangAsing)}
                oninput={(e) => (data.pphLuarNegeriMataUangAsing = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="kreditPajakYangDapatDikreditkan" style="width: 220px;">Kredit Pajak yang Dapat Diperhitungkan *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="kreditPajakYangDapatDikreditkan"
                value={formatRupiah(data.kreditPajakYangDapatDikreditkan)}
                oninput={(e) => (data.kreditPajakYangDapatDikreditkan = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="keterangan" style="width: 220px;">Keterangan</label>
            <input type="text" id="keterangan" bind:value={data.keterangan} style="flex: 1;" />
          </div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Tutup
        </button>
        <button type="button" class="btn btn-primary" style="background-color: #1c398e; color: white;" onclick={handleSave} data-bs-dismiss="modal">
          Simpan
        </button>
      </div>
    </div>
  </div>
</div>

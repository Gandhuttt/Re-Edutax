<script lang="ts">
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from '$lib/helpers/rupiahInput';

    let {
        data = $bindable() as {
            id: string | number;
            npwpPemotongPemungutPenyetor?: string;
            namaPemotongPemungutPenyetor?: string;
            objekPajak?: string;
            dasarPengenaanPajak?: number;
            tarif?: number;
            pphFinalTerutang?: number;
            nomorBuktiPotong?: string;
            tanggalBuktiPotong?: string;
            keterangan?: string;
        },
        saveItem,
        objekPajakOptions
    }: {
        data: {
            id: string | number;
            npwpPemotongPemungutPenyetor?: string;
            namaPemotongPemungutPenyetor?: string;
            objekPajak?: string;
            dasarPengenaanPajak?: number;
            tarif?: number;
            pphFinalTerutang?: number;
            nomorBuktiPotong?: string;
            tanggalBuktiPotong?: string;
            keterangan?: string;
        };
        saveItem: () => void;
        objekPajakOptions: { value: string; label: string }[];
    } = $props();

    $effect(() => {
        data.pphFinalTerutang = (Number(data.dasarPengenaanPajak || 0) * Number(data.tarif || 0)) / 100;
    });

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL4A" tabindex="-1" aria-labelledby="modalL4ALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL4ALabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT PENGHASILAN YANG DIKENAKAN PPh BERSIFAT FINAL
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="npwpPemotongPemungutPenyetor" style="width: 260px;">NPWP Pemotong/Pemungut/Penyetor</label>
            <input type="text" id="npwpPemotongPemungutPenyetor" bind:value={data.npwpPemotongPemungutPenyetor} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="namaPemotongPemungutPenyetor" style="width: 260px;">Nama Pemotong/Pemungut/Penyetor</label>
            <input type="text" id="namaPemotongPemungutPenyetor" bind:value={data.namaPemotongPemungutPenyetor} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="objekPajak" style="width: 260px;">Objek Pajak *</label>
            <select id="objekPajak" bind:value={data.objekPajak} style="flex: 1; width: 0; min-width: 0; text-overflow: ellipsis;">
              <option value="" disabled>Pilih objek pajak</option>
              {#each objekPajakOptions as objekPajak}
                <option value={objekPajak.value}>{objekPajak.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="dasarPengenaanPajak" style="width: 260px;">Dasar Pengenaan Pajak *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="dasarPengenaanPajak"
                value={formatRupiah(data.dasarPengenaanPajak)}
                oninput={(e) => (data.dasarPengenaanPajak = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="tarif" style="width: 260px;">Tarif (%) *</label>
            <input type="number" id="tarif" bind:value={data.tarif} style="flex: 1; text-align: right;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="pphFinalTerutang" style="width: 260px;">PPh Final Terutang *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                id="pphFinalTerutang"
                value={formatRupiahDerived(data.pphFinalTerutang)}
                readonly
                style="flex: 1; text-align: right; background-color: #e9ecef;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="nomorBuktiPotong" style="width: 260px;">Nomor Bukti Potong/Setor</label>
            <input type="text" id="nomorBuktiPotong" bind:value={data.nomorBuktiPotong} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="tanggalBuktiPotong" style="width: 260px;">Tanggal Bukti Potong/Setor</label>
            <input type="date" id="tanggalBuktiPotong" bind:value={data.tanggalBuktiPotong} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="keterangan" style="width: 260px;">Keterangan</label>
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

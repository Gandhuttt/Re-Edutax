<script lang="ts">
    let {
        data = $bindable() as {
            id: string | number;
            namaPemotongPemungut: string;
            npwp?: string;
            jenisPajak?: string;
            dpp?: number;
            pph?: number;
            nomorBukti?: string;
            tanggalBukti?: string;
        },
        saveItem,
        jenisPajakOptions
    }: {
        data: {
            id: string | number;
            namaPemotongPemungut: string;
            npwp?: string;
            jenisPajak?: string;
            dpp?: number;
            pph?: number;
            nomorBukti?: string;
            tanggalBukti?: string;
        };
        saveItem: () => void;
        jenisPajakOptions: { value: string; label: string }[];
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL3B" tabindex="-1" aria-labelledby="modalL3BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL3BLabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT PPh YANG DIPOTONG/DIPUNGUT PIHAK LAIN
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="namaPemotongPemungut" style="width: 260px;">Nama Pemotong/Pemungut Pajak *</label>
            <input type="text" id="namaPemotongPemungut" bind:value={data.namaPemotongPemungut} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="npwp" style="width: 260px;">NPWP *</label>
            <input type="text" id="npwp" bind:value={data.npwp} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="jenisPajak" style="width: 260px;">Jenis Pajak *</label>
            <select id="jenisPajak" bind:value={data.jenisPajak} style="flex: 1;">
              <option value="" disabled>Pilih jenis pajak</option>
              {#each jenisPajakOptions as jenis}
                <option value={jenis.value}>{jenis.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="dpp" style="width: 260px;">DPP</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input type="number" id="dpp" bind:value={data.dpp} style="flex: 1; text-align: right;" />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="pph" style="width: 260px;">Pajak Penghasilan (Rp)</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input type="number" id="pph" bind:value={data.pph} style="flex: 1; text-align: right;" />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="nomorBukti" style="width: 260px;">Nomor Bukti Pemotongan/SSP/SSPCP *</label>
            <input type="text" id="nomorBukti" bind:value={data.nomorBukti} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="tanggalBukti" style="width: 260px;">Tanggal Bukti Pemotongan/SSP/SSPCP *</label>
            <input type="date" id="tanggalBukti" bind:value={data.tanggalBukti} style="flex: 1;" />
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

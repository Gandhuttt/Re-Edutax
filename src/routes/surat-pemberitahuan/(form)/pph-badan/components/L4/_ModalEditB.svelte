<script lang="ts">
    let {
        data = $bindable() as {
            id: string | number;
            jenisPenghasilan?: string;
            sumberPenghasilan?: string;
            penghasilanBruto?: number;
        },
        saveItem,
        jenisPenghasilanOptions
    }: {
        data: {
            id: string | number;
            jenisPenghasilan?: string;
            sumberPenghasilan?: string;
            penghasilanBruto?: number;
        };
        saveItem: () => void;
        jenisPenghasilanOptions: { value: string; label: string }[];
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL4B" tabindex="-1" aria-labelledby="modalL4BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL4BLabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="jenisPenghasilanKode" style="width: 260px;">Kode *</label>
            <input type="text" id="jenisPenghasilanKode" value={data.jenisPenghasilan ?? ''} readonly style="flex: 1; background-color: #eee;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="jenisPenghasilanNama" style="width: 260px;">Jenis Penghasilan *</label>
            <select id="jenisPenghasilanNama" bind:value={data.jenisPenghasilan} style="flex: 1; width: 0; min-width: 0; text-overflow: ellipsis;">
              <option value="" disabled>Pilih jenis penghasilan</option>
              {#each jenisPenghasilanOptions as jenis}
                <option value={jenis.value}>{jenis.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="sumberPenghasilan" style="width: 260px;">Sumber Penghasilan *</label>
            <input type="text" id="sumberPenghasilan" bind:value={data.sumberPenghasilan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="penghasilanBruto" style="width: 260px;">Penghasilan Bruto *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input type="number" id="penghasilanBruto" bind:value={data.penghasilanBruto} style="flex: 1; text-align: right;" />
            </div>
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

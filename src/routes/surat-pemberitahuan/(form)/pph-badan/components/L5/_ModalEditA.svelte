<script lang="ts">
    let {
        data = $bindable() as {
            id: string | number;
            nitku: string;
            nama: string;
            alamat?: string;
            kelurahan?: string;
            kecamatan?: string;
            kabupaten?: string;
            provinsi?: string;
        },
        saveItem
    }: {
        data: {
            id: string | number;
            nitku: string;
            nama: string;
            alamat?: string;
            kelurahan?: string;
            kecamatan?: string;
            kabupaten?: string;
            provinsi?: string;
        };
        saveItem: () => void;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL5A" tabindex="-1" aria-labelledby="modalL5ALabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL5ALabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT ALAMAT TEMPAT KEGIATAN USAHA
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="nitku" style="width: 220px;">NI TKU *</label>
            <input type="text" id="nitku" bind:value={data.nitku} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="nama" style="width: 220px;">Nama TKU *</label>
            <input type="text" id="nama" bind:value={data.nama} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="alamat" style="width: 220px;">Alamat</label>
            <input type="text" id="alamat" bind:value={data.alamat} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="kelurahan" style="width: 220px;">Desa/Kelurahan</label>
            <input type="text" id="kelurahan" bind:value={data.kelurahan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="kecamatan" style="width: 220px;">Kecamatan</label>
            <input type="text" id="kecamatan" bind:value={data.kecamatan} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="kabupaten" style="width: 220px;">Kota/Kabupaten</label>
            <input type="text" id="kabupaten" bind:value={data.kabupaten} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="provinsi" style="width: 220px;">Provinsi</label>
            <input type="text" id="provinsi" bind:value={data.provinsi} style="flex: 1;" />
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

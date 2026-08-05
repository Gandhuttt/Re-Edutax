<script lang="ts">
    let {
        data = $bindable() as {
            id: number;
            nama: string;
            alamat?: string;
            negara: string;
            npwp: string;
            jabatan?: string;
            nilaiModal?: number;
            persentase?: number;
            dividen?: number;
            modalNilai?: number;
            modalPersen?: number;
            utangNilai?: number;
            utangTahun?: number;
            utangBunga?: number;
            piutangNilai?: number;
            piutangTahun?: number;
            piutangBunga?: number;
        },
        saveItem
    }: {
        data: {
            id: number;
            nama: string;
            alamat?: string;
            negara: string;
            npwp: string;
            jabatan?: string;
            nilaiModal?: number;
            persentase?: number;
            dividen?: number;
            modalNilai?: number;
            modalPersen?: number;
            utangNilai?: number;
            utangTahun?: number;
            utangBunga?: number;
            piutangNilai?: number;
            piutangTahun?: number;
            piutangBunga?: number;
        };
        saveItem: () => void;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL2" tabindex="-1" aria-labelledby="modalL2Label" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL2Label" style="font-weight: bold; text-transform: uppercase;">
          EDIT DAFTAR PEMEGANG SAHAM/PEMILIK MODAL DAN JUMLAH DIVIDEN YANG AKAN DIBAGIKAN SERTA DAFTAR DIREKSI DAN KOMISARIS
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      
      <div class="modal-body">
        <form style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="nama" style="width: 200px;">Nama *</label>
            <input type="text" id="nama" bind:value={data.nama} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="alamat" style="width: 200px;">Alamat *</label>
            <input type="text" id="alamat" bind:value={data.alamat} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="negara" style="width: 200px;">Negara</label>
            <select id="negara" bind:value={data.negara} style="flex: 1;">
              <option value="Indonesia">Indonesia</option>
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="npwp" style="width: 200px;">NPWP/NIK</label>
            <input type="text" id="npwp" bind:value={data.npwp} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="jabatan" style="width: 200px;">Jabatan *</label>
            <select id="jabatan" bind:value={data.jabatan} style="flex: 1;">
              <option value="Direktur">Direktur</option>
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="nilaiModal" style="width: 200px;">Nilai (Rp) Modal Disetor *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input type="number" id="nilaiModal" bind:value={data.nilaiModal} style="flex: 1; text-align: right;" />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="persentaseModal" style="width: 200px;">Persentase Modal Disetor *</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <input type="number" id="persentaseModal" bind:value={data.persentase} style="flex: 1; text-align: right;" />
              <span style="margin-left: 5px;">%</span>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="dividen" style="width: 200px;">Dividen/Pembagian Laba</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input type="number" id="dividen" bind:value={data.dividen} style="flex: 1; text-align: right;" />
            </div>
          </div>
        </form>
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
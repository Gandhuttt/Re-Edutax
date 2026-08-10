<script lang="ts">
    import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

    let {
        data = $bindable() as {
            id: string | number;
            nama: string;
            negara: string;
            npwp: string;
            modalNilai?: number;
            modalPersen?: number;
            utangNilai?: number;
            utangTahun?: number;
            utangBunga?: number;
            piutangNilai?: number;
            piutangTahun?: number;
            piutangBunga?: number;
        },
        saveItem,
        negaraOptions
    }: {
        data: {
            id: string | number;
            nama: string;
            negara: string;
            npwp: string;
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
        negaraOptions: { value: string; label: string }[];
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL2B" tabindex="-1" aria-labelledby="modalL2BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL2BLabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT DAFTAR PENYERTAAN MODAL, UTANG, DAN/ATAU PIUTANG PADA PERUSAHAAN AFILIASI
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center;">
            <label for="npwpB" style="width: 200px;">NPWP/NIK *</label>
            <input type="text" id="npwpB" bind:value={data.npwp} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="namaB" style="width: 200px;">Nama *</label>
            <input type="text" id="namaB" bind:value={data.nama} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="negaraB" style="width: 200px;">Negara</label>
            <select id="negaraB" bind:value={data.negara} style="flex: 1;">
              <option value="" disabled>Pilih negara</option>
              {#each negaraOptions as negara}
                <option value={negara.value}>{negara.label}</option>
              {/each}
            </select>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="modalNilai" style="width: 200px;">Penyertaan Modal</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="modalNilai"
                value={formatRupiah(data.modalNilai)}
                oninput={(e) => (data.modalNilai = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="modalPersen" style="width: 200px;">Penyertaan Modal (%)</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <input type="number" id="modalPersen" bind:value={data.modalPersen} style="flex: 1; text-align: right;" />
              <span style="margin-left: 5px;">%</span>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="utangNilai" style="width: 200px;">Utang</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="utangNilai"
                value={formatRupiah(data.utangNilai)}
                oninput={(e) => (data.utangNilai = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="utangTahun" style="width: 200px;">Tahun Utang</label>
            <input type="number" id="utangTahun" bind:value={data.utangTahun} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="utangBunga" style="width: 200px;">Bunga Utang/Tahun</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <input type="number" id="utangBunga" bind:value={data.utangBunga} style="flex: 1; text-align: right;" />
              <span style="margin-left: 5px;">%</span>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="piutangNilai" style="width: 200px;">Piutang</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <span style="margin-right: 5px;">Rp.</span>
              <input
                type="text"
                inputmode="numeric"
                id="piutangNilai"
                value={formatRupiah(data.piutangNilai)}
                oninput={(e) => (data.piutangNilai = applyRupiahInput(e))}
                style="flex: 1; text-align: right;"
              />
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <label for="piutangTahun" style="width: 200px;">Tahun Piutang</label>
            <input type="number" id="piutangTahun" bind:value={data.piutangTahun} style="flex: 1;" />
          </div>
          <div style="display: flex; align-items: center;">
            <label for="piutangBunga" style="width: 200px;">Bunga Piutang/Tahun</label>
            <div style="flex: 1; display: flex; align-items: center;">
              <input type="number" id="piutangBunga" bind:value={data.piutangBunga} style="flex: 1; text-align: right;" />
              <span style="margin-left: 5px;">%</span>
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

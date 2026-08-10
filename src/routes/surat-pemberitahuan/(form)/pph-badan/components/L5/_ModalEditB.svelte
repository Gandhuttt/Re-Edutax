<script lang="ts">
    import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

    const bulanNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    let {
        data = $bindable() as {
            tkuId: string | number;
            nama: string;
            bulanan: Array<{
                bulan: number;
                jumlahPeredaranBruto: number;
            }>;
        },
        saveItem
    }: {
        data: {
            tkuId: string | number;
            nama: string;
            bulanan: Array<{
                bulan: number;
                jumlahPeredaranBruto: number;
            }>;
        };
        saveItem: () => void;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<!-- Modal -->
<div class="modal fade" id="modalL5B" tabindex="-1" aria-labelledby="modalL5BLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL5BLabel" style="font-weight: bold; text-transform: uppercase;">
          EDIT PEREDARAN BRUTO - {data.nama}
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <table class="tw:w-full tw:text-sm modal-bulanan-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Peredaran Bruto (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {#each data.bulanan as item}
              <tr>
                <td>{bulanNames[item.bulan - 1]}</td>
                <td>
                  <input
                    type="text"
                    inputmode="numeric"
                    value={formatRupiah(item.jumlahPeredaranBruto)}
                    oninput={(e) => (item.jumlahPeredaranBruto = applyRupiahInput(e))}
                    class="tw:w-full tw:text-right"
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
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

<style>
.modal-bulanan-table th, .modal-bulanan-table td {
    border: 1px solid #A9A9A9;
    padding: .4rem .6rem;
}
.modal-bulanan-table th {
    background-color: var(--color-primary);
    font-weight: bold;
}
</style>

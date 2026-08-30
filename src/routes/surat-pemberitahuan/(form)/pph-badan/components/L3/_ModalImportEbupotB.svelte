<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import { closeBsModal } from "$lib/helpers/bsModal";

    let {
        calon,
        mengambil,
        simpanImpor
    }: {
        calon: Array<{
            id: string;
            masaPajak: number;
            tahun: number;
            nomorPemotongan: string | null;
            namaPemotong: string;
            pajakPenghasilan: number;
        }>;
        mengambil: boolean;
        simpanImpor: (dipilih: string[]) => void;
    } = $props();

    let dipilih = $state<Set<string>>(new Set());

    $effect(() => {
        // Reset selection whenever a fresh candidate list arrives (modal
        // reopened).
        calon;
        dipilih = new Set();
    });

    function toggle(id: string) {
        const next = new Set(dipilih);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        dipilih = next;
    }

    function handleSave() {
        simpanImpor([...dipilih]);
        closeBsModal('modalL3BImpor');
    }
</script>

<div class="modal fade" id="modalL3BImpor" tabindex="-1" aria-labelledby="modalL3BImporLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="modalL3BImporLabel" style="font-weight: bold; text-transform: uppercase;">
          Impor dari eBupot
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        {#if mengambil}
          <p>Memuat bukti potong...</p>
        {:else if calon.length === 0}
          <p>Tidak ada bukti potong BPU yang dapat diimpor (semua sudah diimpor, atau belum ada bukti potong yang diterbitkan atas NPWP Anda).</p>
        {:else}
          <div style="overflow-x: auto;">
            <Table class="tw:min-w-full">
              {#snippet head()}
                <tr>
                  <th class="tw:w-[3rem]"></th>
                  <th>MASA PAJAK</th>
                  <th>NAMA PEMOTONG</th>
                  <th>NOMOR BUKTI</th>
                  <th class="tw:text-end">PPh</th>
                </tr>
              {/snippet}
              {#snippet body()}
                {#each calon as row (row.id)}
                  <tr>
                    <td>
                      <input type="checkbox" checked={dipilih.has(row.id)} onchange={() => toggle(row.id)} />
                    </td>
                    <td>{row.masaPajak}/{row.tahun}</td>
                    <td>{row.namaPemotong}</td>
                    <td>{row.nomorPemotongan}</td>
                    <td class="tw:text-end">{Number(row.pajakPenghasilan || 0).toLocaleString('id-ID')}</td>
                  </tr>
                {/each}
              {/snippet}
            </Table>
          </div>
        {/if}
      </div>
      <div class="modal-footer" style="justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        <button
          type="button"
          class="btn btn-primary"
          style="background-color: #1c398e; color: white;"
          disabled={dipilih.size === 0}
          onclick={handleSave}
        >
          Impor ({dipilih.size})
        </button>
      </div>
    </div>
  </div>
</div>

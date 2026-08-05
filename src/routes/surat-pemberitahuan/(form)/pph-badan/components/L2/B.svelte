<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let { data, openModal } = $props();
</script>

<div class="tw:p-5 tw:overflow-scroll">
    <Table class={"tw:w-full"}>
    {#snippet head()}
        <tr class="tw:hidden">
            <td>
                <input type="text" hidden>
            </td>
        </tr>
    {/snippet}
    {#snippet body()}
        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
            <td class="tw:w-20" rowspan="2">TINDAKAN</td>
            <td class="tw:w-10" rowspan="2">NO</td>
            <td class="tw:w-40" rowspan="2">NAMA</td>
            <td class="tw:w-30" rowspan="2">NEGARA</td>
            <td class="tw:w-30" rowspan="2">NPWP/NIK</td>
            <td class="tw:w-80" colspan="2">PENYERTAAN MODAL</td>
            <td class="tw:w-125" colspan="3">UTANG</td>
            <td class="tw:w-125" colspan="3">PIUTANG</td>
        </tr>
        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
            <td class="tw:w-25">NILAI (Rp)</td>
            <td class="tw:w-25">%</td>
            <td class="tw:w-30">NILAI (Rp)</td>
            <td class="tw:w-30">TAHUN</td>
            <td class="tw:w-30">BUNGA UTANG/TAHUN</td>
            <td class="tw:w-30">NILAI (Rp)</td>
            <td class="tw:w-30">TAHUN</td>
            <td class="tw:w-30">BUNGA UTANG/TAHUN</td>
        </tr>
        {#each data as item, i}
        <tr class="data tw:text-left">
            <td class="tw:text-center">
                <Button class={"tw:min-w-15!"} onclick={() => openModal('B', item)} data-bs-toggle="modal" data-bs-target="#modalL2">Edit</Button>
            </td>
            <td>{i + 1}</td>
            <td>{item.nama}</td>
            <td>{item.negara}</td>
            <td>{item.npwp}</td>
            <td>{item.modalNilai}</td>
            <td>{item.modalPersen}</td>
            <td>{item.utangNilai}</td>
            <td>{item.utangTahun}</td>
            <td>{item.utangBunga}</td>
            <td>{item.piutangNilai}</td>
            <td>{item.piutangTahun}</td>
            <td>{item.piutangBunga}</td>
        </tr>
        {/each}
        <tr class="footer tw:bg-[#ffd230] tw:text-right tw:font-bold">
            <td colspan="7">JUMLAH</td>
            <td>0</td>
            <td colspan="2"></td>
            <td>0</td>
            <td colspan="2"></td>
        </tr>
    {/snippet}
    </Table>
</div>

<style>
.header td, .footer td {
    border: 1px solid white;
}
.data {
    &:nth-child(even) {
        background-color: #F9F6EE;
    }
    td {
        padding-inline: .2rem;
    }
}
tr {
    border: none;
}
td {
    padding: .5rem .1rem;
    word-wrap: break-word;
    font-size: .8rem;
}
</style>
<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let {
        data,
        openModal,
        deleteItem,
        objekPajakOptions
    }: {
        data: Array<{
            id: string | number;
            npwpPemotongPemungutPenyetor: string;
            namaPemotongPemungutPenyetor: string;
            objekPajak: string;
            dasarPengenaanPajak: number;
            tarif: number;
            pphFinalTerutang: number;
            nomorBuktiPotong: string;
            tanggalBuktiPotong: string;
            keterangan: string;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
        objekPajakOptions: { value: string; label: string }[];
    } = $props();

    const objekPajakLabel = (kode: string) => objekPajakOptions.find((o) => o.value === kode)?.label ?? kode;

    let totalDasarPengenaanPajak = $derived(data.reduce((sum, item) => sum + Number(item.dasarPengenaanPajak || 0), 0));
    let totalPphFinalTerutang = $derived(data.reduce((sum, item) => sum + Number(item.pphFinalTerutang || 0), 0));
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL4A">Tambah</Button>
    <div class="tw:overflow-scroll">
        <Table class={"tw:w-full"}>
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><input type="text" name="" id=""></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]"><span>TINDAKAN</span></td>
                    <td class="tw:w-[15rem]"><span>NPWP PEMOTONG/PEMUNGUT/PENYETOR</span></td>
                    <td class="tw:w-[15rem]"><span>NAMA PEMOTONG/PEMUNGUT/PENYETOR</span></td>
                    <td class="tw:w-[20rem]"><span>OBJEK PAJAK</span></td>
                    <td class="tw:w-[15rem]"><span>DASAR PENGENAAN PAJAK (Rupiah)</span></td>
                    <td class="tw:w-[8rem]"><span>TARIF (%)</span></td>
                    <td class="tw:w-[15rem]"><span>PPh FINAL TERUTANG (Rupiah)</span></td>
                    <td class="tw:w-[12rem]"><span>NOMOR BUKTI POTONG/SETOR</span></td>
                    <td class="tw:w-[10rem]"><span>TANGGAL BUKTI POTONG/SETOR</span></td>
                    <td class="tw:w-[15rem]"><span>KETERANGAN</span></td>
                </tr>
                {#if data.length === 0}
                <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                {#each data as item, i}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL4A">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{item.npwpPemotongPemungutPenyetor}</td>
                    <td>{item.namaPemotongPemungutPenyetor}</td>
                    <td>{objekPajakLabel(item.objekPajak)}</td>
                    <td>{Number(item.dasarPengenaanPajak || 0).toLocaleString('id-ID')}</td>
                    <td>{item.tarif}</td>
                    <td>{Number(item.pphFinalTerutang || 0).toLocaleString('id-ID')}</td>
                    <td>{item.nomorBuktiPotong}</td>
                    <td>{item.tanggalBuktiPotong}</td>
                    <td>{item.keterangan}</td>
                </tr>
                {/each}
                {/if}
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="4">JUMLAH</td>
                    <td>{totalDasarPengenaanPajak.toLocaleString('id-ID')}</td>
                    <td></td>
                    <td>{totalPphFinalTerutang.toLocaleString('id-ID')}</td>
                    <td colspan="3"></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<style>
.header td, .footer td {
    border: 1px solid white;
}

.data {
    &:nth-child(odd of .data) {
        background-color: #F9F6EE;
    }
    td {
        padding-inline: .5rem;
    }
}

tr {
    border: none;
}

td {
    padding: .5rem 1rem;
    word-wrap: break-word;
    font-size: .8rem;
}
</style>

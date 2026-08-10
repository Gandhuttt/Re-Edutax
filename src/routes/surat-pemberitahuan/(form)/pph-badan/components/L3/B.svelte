<script lang="ts">
	import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let {
        data,
        openModal,
        deleteItem,
        kreditPajakLuarNegeri = 0
    }: {
        data: Array<{
            id: string | number;
            namaPemotongPemungut: string;
            npwp: string;
            jenisPajak: string;
            dpp: number;
            pph: number;
            nomorBukti: string;
            tanggalBukti: string;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
        kreditPajakLuarNegeri?: number;
    } = $props();

    let totalDpp = $derived(data.reduce((sum, item) => sum + Number(item.dpp || 0), 0));
    let totalPph = $derived(data.reduce((sum, item) => sum + Number(item.pph || 0), 0));
    let jumlahKreditPajak = $derived(totalPph + Number(kreditPajakLuarNegeri || 0));
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL3B">Tambah</Button>
    <div class="tw:overflow-scroll">
        <Table class={"tw:w-full"}>
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><input type="text" name="" id=""></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]" rowspan="2"><span>TINDAKAN</span></td>
                    <td class="tw:w-[5rem]" rowspan="2"><span>NO</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>NAMA PEMOTONG/PEMUNGUT</span></td>
                    <td class="tw:w-[12rem]" rowspan="2"><span>NPWP PEMOTONG/PEMUNGUT</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>JENIS PAJAK</span></td>
                    <td class="tw:w-[12rem]" rowspan="2"><span>DASAR PENGENAAN PAJAK (Rupiah)</span></td>
                    <td class="tw:w-[12rem]" rowspan="2"><span>PPh YANG DIPOTONG/DIPUNGUT (Rupiah)</span></td>
                    <td class="tw:w-[20rem]" colspan="2"><span>BUKTI POTONG/SSP/SSPCP</span></td>
                </tr>
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]"><span>NOMOR</span></td>
                    <td class="tw:w-[10rem]"><span>TANGGAL</span></td>
                </tr>
                {#if data.length === 0}
                <tr class="data tw:text-center"><td colspan="9">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                {#each data as item, i}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL3B">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{i + 1}</td>
                    <td>{item.namaPemotongPemungut}</td>
                    <td>{item.npwp}</td>
                    <td>{item.jenisPajak}</td>
                    <td>{Number(item.dpp || 0).toLocaleString('id-ID')}</td>
                    <td>{Number(item.pph || 0).toLocaleString('id-ID')}</td>
                    <td>{item.nomorBukti}</td>
                    <td>{item.tanggalBukti}</td>
                </tr>
                {/each}
                {/if}
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="5">JUMLAH</td>
                    <td>{totalDpp.toLocaleString('id-ID')}</td>
                    <td>{totalPph.toLocaleString('id-ID')}</td>
                    <td colspan="2"></td>
                </tr>
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="6">KREDIT PAJAK LUAR NEGERI</td>
                    <td>{kreditPajakLuarNegeri.toLocaleString('id-ID')}</td>
                    <td colspan="2"></td>
                </tr>
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="6">JUMLAH KREDIT PAJAK</td>
                    <td>{jumlahKreditPajak.toLocaleString('id-ID')}</td>
                    <td colspan="2"></td>
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

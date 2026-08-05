<script lang="ts">
	import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let {
        data,
        openModal,
        deleteItem
    }: {
        data: Array<{
            id: string | number;
            nama: string;
            alamat: string;
            negara: string;
            npwp: string;
            jabatan: string;
            nilaiModal: number;
            persentase: number;
            dividen: number;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
    } = $props();

    let totalNilaiModal = $derived(data.reduce((sum, item) => sum + Number(item.nilaiModal || 0), 0));
    let totalPersentase = $derived(data.reduce((sum, item) => sum + Number(item.persentase || 0), 0));
    let totalDividen = $derived(data.reduce((sum, item) => sum + Number(item.dividen || 0), 0));
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL2">Tambah</Button>
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
                    <td class="tw:w-[15rem]" rowspan="2"><span>NAMA</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>ALAMAT</span></td>
                    <td class="tw:w-[10rem]" rowspan="2"><span>KODE NEGARA</span></td>
                    <td class="tw:w-[10rem]" rowspan="2"><span>NPWP/NIK</span></td>
                    <td class="tw:w-[10rem]" rowspan="2"><span>JABATAN</span></td>
                    <td class="tw:w-[20rem]" colspan="2"><span>MODAL DISETOR</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>DIVIDEN/PEMBAGIAN LABA (Rp)</span></td>
                </tr>
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]"><span>NILAI (Rp)</span></td>
                    <td class="tw:w-[10rem]"><span>%</span></td>
                </tr>
                {#each data as item, i}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL2">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{i + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.alamat}</td>
                    <td>{item.negara}</td>
                    <td>{item.npwp}</td>
                    <td>{item.jabatan}</td>
                    <td>{item.nilaiModal}</td>
                    <td>{item.persentase}</td>
                    <td>{item.dividen}</td>
                </tr>
                {/each}
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="7">JUMLAH</td>
                    <td>{totalNilaiModal.toLocaleString('id-ID')}</td>
                    <td>{totalPersentase.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</td>
                    <td>{totalDividen.toLocaleString('id-ID')}</td>
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
    &:nth-child(even) {
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
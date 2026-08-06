<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-A" ? "DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA" : currentTab.title})
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-A" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA</span>
        {/snippet}
        {#snippet body()}    
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-full"}>
                    {#snippet head()}
                        <tr class="tw:hidden">
                            <td></td>
                        </tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]">TINDAKAN</td>
                            <td class="tw:w-[15rem]">NAMA</td>
                            <td class="tw:w-[10rem]">NPWP/TIN</td>
                            <td class="tw:w-[10rem]">NEGARA</td>
                            <td class="tw:w-[15rem]">BENTUK HUBUNGAN</td>
                            <td class="tw:w-[15rem]">KEGIATAN USAHA</td>
                            <td class="tw:w-[15rem]">JENIS TRANSAKSI</td>
                            <td class="tw:w-[15rem]">NILAI TRANSAKSI (Rupiah)</td>
                            <td class="tw:w-[15rem]">METODE PENENTUAN HARGA TRANSFER YANG DIGUNAKAN</td>
                            <td class="tw:w-[15rem]">ALASAN PENGGUNAAN METODE</td>
                        </tr>
                        <tr class="data">
                            <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                                <Button type="button" class={"tw:min-w-15!"} data-bs-toggle="modal" data-bs-target="#modalL2">Edit</Button>
                                <Button type="button" class={"tw:min-w-15!"}>Hapus</Button>
                            </td>
                            <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                            <td>3300000000000101</td>
                            <td>INDONESIAG</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

<style>
.header td{
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
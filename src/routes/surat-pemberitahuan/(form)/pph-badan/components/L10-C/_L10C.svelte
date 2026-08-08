<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import Radio from "$lib/components/RadioPair.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-C" ? "PERNYATAAN TRANSAKSI DENGAN PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY" : currentTab.title})

    let ditentukanPrinsip = $state();
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-C" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <!-- svelte-ignore block_empty -->
        {/snippet}
        {#snippet body()}    
        <div class="tw:flex tw:flex-col tw:gap-1 tw:mb-5">
            <span class="tw:font-bold tw:mb-5">I. DALAM HAL WAJIB PAJAK DALAM TAHUN PAJAK INI MELAKUKAN TRANSAKSI DENGAN PIHAK-PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY</span>
            <Button class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-full tw:border-b-1 tw:border-b-(--color-disabled)"}>
                    {#snippet head()}
                        <tr class="tw:hidden">
                            <td></td>
                        </tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]">TINDAKAN</td>
                            <td class="tw:w-[5rem]">NO.</td>
                            <td class="tw:w-[15rem]">NAMA MITRA TRANSAKSI</td>
                            <td class="tw:w-[15rem]">JENIS TRANSAKSI</td>
                            <td class="tw:w-[30rem]">NEGARA</td>
                            <td class="tw:w-[10rem]">NILAI TRANSAKSI (Rupiah)</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                            <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                        </tr>
                        {/if}
                    {/snippet}
                </Table>
            </div>
        </div>
        <div class="tw:flex tw:flex-col">
            <span class="tw:font-bold tw:mb-5">II. PENENTUAN HARGA TRANSAKSI DI ATAS, DITENTUKAN DENGAN MENGGUNAKAN PRINSIP KEWAJARAN DAN KELAZIMAN USAHA</span>
            <div class="tw:px-5 tw:pb-5">
                <Radio name={"ditentukanPrinsip"} bind:group={ditentukanPrinsip}/>
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
<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Table from "$lib/components/Table.svelte";
    import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L13-A" ? "DAFTAR FASILITAS PENANAMAN MODAL" : currentTab.title})
</script>

<div class="tw:mt-5 {currentTab.tab === "L13-A" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">FASILITAS PERPAJAKAN DALAM RANGKA PENANAMAN MODAL</span>
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
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[5rem]" rowspan="2">NO.</td>
                            <td class="tw:w-[15rem]" colspan="2">KEPUTUSAN PEMBERIAN FASILITAS</td>
                            <td class="tw:w-[15rem]" colspan="2">KEPUTUSAN PEMANFAATAN FASILITAS</td>
                            <td class="tw:w-[30rem]" colspan="4">JUMLAH PENANAMAN MODAL YANG DISETUJUI</td>
                            <td class="tw:w-[10rem]" rowspan="2">BENTUK PENANAMAN MODAL</td>
                            <td class="tw:w-[10rem]" rowspan="2">DI BIDANG DAN/ATAU DAERAH</td>
                            <td class="tw:w-[10rem]" rowspan="2">FASILITAS YANG DIBERIKAN</td>
                            <td class="tw:w-[10rem]" rowspan="2">FASILITAS YANG DIBERIKAN</td>
                            <td class="tw:w-[10rem]" rowspan="2">AKUMULASI S.D. TAHUN INI</td>
                            <td class="tw:w-[10rem]" rowspan="2">PADA SAAT MULAI BERPRODUKSI KOMERSIAL</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <!-- KEPUTUSAN PEMBERIAN FASILITAS -->
                            <td class="">NO.</td>
                            <td class="">TANGGAL</td>
                            <!-- KEPUTUSAN PEMANFAATAN FAISILITAS -->
                            <td>NO.</td>
                            <td>TANGGAL</td>
                            <!-- JUMLAH PENANAMAN MODAL YANG DISETUJUI -->
                            <td>DALAM MATA UANG ASING</td>
                            <td>EKUIVALEN</td>
                            <td>DALAM RUPIAH</td>
                            <td>JUMLAH (Rp)</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="16">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                            <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
                            <td>tset</td>
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
        {/snippet}
    </Card>
</div>

<style>
.header td{
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
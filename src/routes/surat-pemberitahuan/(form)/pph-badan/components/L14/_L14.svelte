<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L14" ? "PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARAN DAN PRASARANA" : currentTab.title})
</script>

<div class="{currentTab.tab === "L14" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARANA DAN PRASARANA"}>
            <div class="tw:flex tw:flex-col tw:gap-1 tw:p-5">
                <Button class={"tw:w-30 tw:text-white"} color={"var(--color-secondary)"}>Tambah</Button>
                <div class="tw:overflow-scroll">
                    <Table class={"tw:w-fit"}>
                        {#snippet head()}
                            <tr class="tw:hidden"><td></td></tr>
                        {/snippet}
                        {#snippet body()}
                            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                                <td class="tw:w-[10rem]" rowspan="3">TINDAKAN</td>
                                <td rowspan="3">Tahun Pajak/Bagian Tahun Pajak</td>
                                <td>PENYEDIAAN SISA LEBIH UNTUK DITANAMKAN KEMBALI SEALAM 4 TAHUN</td>
                                <td rowspan="3">BENTUK PENANAMAN KEMBALI SISA LEBIH</td>
                                <td colspan="4">PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARANA DAN PRASARANA</td>
                                <td>JUMLAH PENGGUNAAN SISA LEBIH</td>
                                <td>SISA LEBIH YANG BELUM DITANAMKAN KEMBALI</td>
                                <td>SISA LEBIH YANG MELEWATI JANGKA WAKTU PENANAMAN KEMBALI DALAM JANGKA WAKTU 4 TAHUN</td>
                            </tr>
                            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                                <td rowspan="2">RUPIAH</td>
                                <td>Tahun Ke-1</td>
                                <td>Tahun Ke-2</td>
                                <td>Tahun Ke-3</td>
                                <td>Tahun Ke-4</td>
                                <td rowspan="2">RUPIAH</td>
                                <td rowspan="2">RUPIAH</td>
                                <td rowspan="2">RUPIAH</td>
                            </tr>
                            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                                <td>RUPIAH</td>
                                <td>RUPIAH</td>
                                <td>RUPIAH</td>
                                <td>RUPIAH</td>
                            </tr>
                            {#if true}
                            <tr class="data tw:text-center"><td colspan="11">Tidak ada data yang ditampilkan</td></tr>
                            {:else}
                            <tr class="data">
                            </tr>
                            {/if}
                            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                                <td colspan="9">JUMLAH</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                                <td colspan="10">SISA LEBIH YANG DAPAT DIGUNAKAN KEMBALI</td>
                                <td>0</td>
                            </tr>
                        {/snippet}
                    </Table>
                </div>
            </div>
        </Accordion>
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
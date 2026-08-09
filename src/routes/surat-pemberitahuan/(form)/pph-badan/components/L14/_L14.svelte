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

    const currentYear = new Date().getFullYear();
</script>

<div class="{currentTab.tab === "L14" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARANA DAN PRASARANA"}>
            <div class="tw:flex tw:flex-col tw:gap-1 tw:p-5">
                <Button class={"tw:w-30 tw:text-white"} color={"var(--color-secondary)"}>Tambah</Button>
                <div class="tw:overflow-scroll">
                    <Table class={"tw:w-full"}>
                        {#snippet head()}
                            <tr class="tw:hidden"><td></td></tr>
                        {/snippet}
                        {#snippet body()}
                            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                                <td class="tw:w-[10rem]" rowspan="3">TINDAKAN</td>
                                <td class="tw:w-[7.5rem]" rowspan="3">Tahun Pajak/Bagian Tahun Pajak</td>
                                <td class="tw:w-[10rem]">PENYEDIAAN SISA LEBIH UNTUK DITANAMKAN KEMBALI SEALAM 4 TAHUN</td>
                                <td class="tw:w-[20rem]" rowspan="3">BENTUK PENANAMAN KEMBALI SISA LEBIH</td>
                                <td class="tw:w-[40rem]" colspan="4">PENGGUNAAN SISA LEBIH UNTUK PEMBANGUNAN DAN PENGADAAN SARANA DAN PRASARANA</td>
                                <td class="tw:w-[10rem]">JUMLAH PENGGUNAAN SISA LEBIH</td>
                                <td class="tw:w-[10rem]">SISA LEBIH YANG BELUM DITANAMKAN KEMBALI</td>
                                <td class="tw:w-[10rem]">SISA LEBIH YANG MELEWATI JANGKA WAKTU PENANAMAN KEMBALI DALAM JANGKA WAKTU 4 TAHUN</td>
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
                            {#each {length: 4} as _, index}
                            {@const indexYear = currentYear - (3 - index)}
                            <tr class="data tw:text-right">
                                <td class="tw:text-center">
                                    {#if !(indexYear === currentYear)}
                                    <Button>Edit</Button>
                                    {/if}
                                </td>
                                <td class="tw:text-center">{indexYear}</td>
                                <td>0</td>
                                <td></td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            {/each}
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
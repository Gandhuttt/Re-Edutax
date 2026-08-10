<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import ModalEdit from "./_ModalEdit.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L13-C" ? "DAFTAR FASILITAS PENGURANGAN PPh BADAN" : currentTab.title})
</script>

<div class="{currentTab.tab === "L13-C" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"DAFTAR FASILITAS PENGURANGAN PPh BADAN"}>
            <div class="tw:flex tw:flex-col tw:gap-1 tw:p-5">
                <Button class={"tw:w-30 tw:text-white"} color={"var(--color-secondary)"} type={"button"} data-bs-toggle={"modal"} data-bs-target={"#modalL13C"}>Tambah</Button>
                <div class="tw:overflow-scroll">
                    <Table class={"tw:w-full"}>
                        {#snippet head()}
                            <tr class="tw:hidden"><td></td></tr>
                        {/snippet}
                        {#snippet body()}
                            <tr class="header tw:bg-(--color-primary) tw:font-bold tw:text-center">
                                <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                                <td class="tw:w-[5rem]" rowspan="2">NO.</td>
                                <td class="tw:w-[20rem]" colspan="2">KEPUTUSAN PEMBERIAN FASILITAS</td>
                                <td class="tw:w-[20rem]" colspan="2">KEPUTUSAN PEMANFAATAN FASILITAS</td>
                                <td class="tw:w-[10rem]" rowspan="2">JANGKA WAKTU FASILITAS (TAHUN)</td>
                                <td class="tw:w-[10rem]" rowspan="2">PEMANFAATAN TAHUN KE-</td>
                                <td class="tw:w-[10rem]" rowspan="2">PERSENTASE PENGURANGAN PPh</td>
                                <td class="tw:w-[35rem]" colspan="3">PENGHITUNGAN FASILITAS PENGURANGAN PPh BADAN</td>
                            </tr>
                            <tr class="header tw:bg-(--color-primary) tw:font-bold tw:text-center">
                                <!-- KEPUTUSAN PEMBERIAN FASILITAS -->
                                <td class="tw:w-[5rem]">NO.</td>
                                <td class="tw:w-[15rem]">TANGGAL</td>
                                <!-- KEPUTUSAN PEMANFAATAN FASILITAS -->
                                <td class="tw:w-[5rem]">NO.</td>
                                <td class="tw:w-[15rem]">TANGGAL</td>
                                <!-- PENGHITUGAN FASILITAS PENGURANGAN PPh BADAN -->
                                <td>PENGHASILAN KENA PAJAK</td>
                                <td>PPh TERUTANG</td>
                                <td>BESARAN FASILITAS PENGURANGAN PPh TERUTANG</td>
                            </tr>
                            {#if true}
                            <tr class="data tw:text-center"><td colspan="12">Tidak ada data yang ditampilkan</td></tr>
                            {:else}
                            <tr class="data">
                                <td></td>
                            </tr>
                            {/if}
                            <tr class="footer tw:bg-(--color-primary) tw:font-bold tw:text-right">
                                <td colspan="11">JUMLAH FASILITAS PENGURANGAN PPh TERUTANG</td>
                                <td>0,00</td>
                            </tr>
                        {/snippet}
                    </Table>
                </div>
            </div>
        </Accordion>
    </div>
</div>

<ModalEdit/>

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
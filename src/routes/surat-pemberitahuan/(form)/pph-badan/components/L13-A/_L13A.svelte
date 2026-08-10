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
                            <td class="tw:w-[40rem]" colspan="4">JUMLAH PENANAMAN MODAL YANG DISETUJUI</td>
                            <td class="tw:w-[15rem]" rowspan="2">BENTUK PENANAMAN MODAL</td>
                            <td class="tw:w-[15rem]" rowspan="2">DI BIDANG DAN/ATAU DAERAH</td>
                            <td class="tw:w-[15rem]" rowspan="2">FASILITAS YANG DIBERIKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">PERSENTASE PENGURANGAN PENGHASILAN NETO</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENAMBAHAN JANGKA WAKTU KOMPENSASI KERUGIAN</td>
                            <td class="tw:w-[15rem]" colspan="2">REALISASI PENANAMAN MODAL</td>
                            <td class="tw:w-[15rem]" rowspan="2">SAAT MULAI BERPRODUKSI KOMERSIAL</td>
                            <td class="tw:w-[15rem]" colspan="2">FASILITAS PENGURANGAN PENGHASILAN NETO</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <!-- KEPUTUSAN PEMBERIAN FASILITAS -->
                            <td class="tw:w-[5rem]">NO.</td>
                            <td class="tw:w-[10rem]">TANGGAL</td>
                            <!-- KEPUTUSAN PEMANFAATAN FAISILITAS -->
                            <td class="tw:w-[5rem]">NO.</td>
                            <td class="tw:w-[10rem]">TANGGAL</td>
                            <!-- JUMLAH PENANAMAN MODAL YANG DISETUJUI -->
                            <td class="tw:w-[10rem]">DALAM MATA UANG ASING</td>
                            <td class="tw:w-[10rem]">EKUIVALEN</td>
                            <td class="tw:w-[10rem]">DALAM RUPIAH</td>
                            <td class="tw:w-[10rem]">JUMLAH (Rp)</td>
                            <!-- REALISASI PENANAMAN MODAL -->
                            <td>PENYUSUTAN TAHUN INI</td>
                            <td>S.D. TAHUN INI</td>
                            <!-- FASILITAS PENGURANGAN PENGHASILAN NETO -->
                             <td>TAHUN KE-</td>
                             <td>JUMLAH (Rp)</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="20">Tidak ada data yang ditampilkan</td></tr>
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
                        <tr class="footer tw:bg-(--color-primary) tw:font-bold tw:text-right">
                            <td colspan="19">JUMLAH FASILITAS PENGURANGAN PENGHASILAN NETO</td>
                            <td>0</td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

<style>
.header td, .footer td{
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
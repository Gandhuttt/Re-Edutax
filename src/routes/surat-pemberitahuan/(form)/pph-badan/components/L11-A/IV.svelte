<script>
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
</script>

<div class="tw:p-5">
    <div class="accordion">
        <Accordion item={"IV.A DAFTAR SARANA DAN FASILITAS SERTA PENYUSUTANNYA"}>
            <div class="tw:flex tw:flex-col tw:p-5 tw:gap-1">
                <Button class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
                <div class="tw:overflow-scroll">
                    <Table class={"tw:w-full"}>
                        {#snippet head()}
                            <tr class="tw:hidden">
                                <td></td>
                            </tr>
                        {/snippet}
                        {#snippet body()}
                            <tr class="header tw:bg-(--color-primary) tw:font-bold tw:text-center">
                                <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                                <td class="tw:w-[5rem]" rowspan="2">NO.</td>
                                <td class="tw:w-[10rem]" rowspan="2">JENIS HARTA BERWUJUD</td>
                                <td class="tw:w-[10rem]" rowspan="2">TAHUN PEROLEHAN</td>
                                <td class="tw:w-[10rem]" rowspan="2">NILAI PEROLEHAN</td>
                                <td class="tw:w-[40rem]" colspan="3">PENYUSUTAN</td>
                            </tr>
                            <tr class="header tw:bg-(--color-primary) tw:font-bold tw:text-center">
                                <td>S.D. TAHUN LALU</td>
                                <td>PENYUSUTAN TAHUN INI</td>
                                <td>S.D. TAHUN INI</td>
                            </tr>
                            {#if true}
                            <tr class="data tw:text-center"><td colspan="8">Tidak ada data yang ditampilkan</td></tr>
                            {:else}
                            <tr class="data">
                                <td><Button>Edit</Button></td>
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
        </Accordion>
        <Accordion item={"IV.B RINCIAN PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN YANG DIBERIKAN BERKENAAN DENGAN PELAKSANAAN PEKERJAAN DI DAERAH TERTENTU"}>
            <div class="tw:flex tw:flex-col tw:gap-10 tw:p-5">
                <div class="tw:w-full tw:flex tw:flex-col">
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Alamat Lokasi</span>
                        <Input class={"tw:flex-1"} type={"text"}/>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Nomor Surat Keputusan Penetapan Daerah Tertentu</span>
                        <Input class={"tw:flex-1"} type={"text"}/>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Tanggal Surat Keputusan Penetapan Daerah Tertentu</span>
                        <Input class={"tw:flex-1"} type={"date"}/>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Nomor Surat Keputusan  Perpanjangan Penetapan Daerah Tertentu</span>
                        <Input class={"tw:flex-1"} type={"text"}/>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Tanggal Surat Keputusan  Perpanjangan Penetapan Daerah Tertentu</span>
                        <Input class={"tw:flex-1"} type={"date"}/>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pegawai dan keluarganya</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pelayanan kesehatan</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pendidikan bagi pegawai dan keluarganya</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk peribadatan</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk pengangkutan bagi pegawai dan keluarganya</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Biaya yang dikeluarkan untuk tempat tinggal, termasuk perumahan untuk olahraga bagi pegawai dan keluarganya, tidak termasuk golf, power boating, pacuan kuda, dan terbang layang</span>
                        <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                    </div>
                    <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                        <span class="tw:block tw:w-[50rem]">Jumlah Biaya yang dikeluarkan</span>
                        <InputGroup class={"tw:text-right"} type={"number"} readonly>Rp.</InputGroup>
                    </div>
                </div>
            </div>
        </Accordion>
    </div>
</div>

<style>
.header {
    td {
        border: 1px solid white;
    }
}

.data {
    &:nth-of-type(odd) {
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
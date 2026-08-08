<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
</script>

<div class="tw:flex tw:flex-col tw:gap-5 tw:p-5">

    <!-- KELOMPOK 1  -->
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">KELOMPOK 1</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-fit"}>
                    {#snippet head()}
                        <tr class="tw:hidden"><td><input type="text" name="" id=""></td></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">KODE HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">KELOMPOK/JENIS HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">BULAN/TAHUN PEROLEHAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">BIAYA PEROLEHAN (Rp)</td>
                            <td class="tw:w-[15rem]" rowspan="2">NILAI SISA BUKU FISKAL PADA AWAL TAHUN (Rp)</td>
                            <td class="tw:w-[20rem]" colspan="2">METODE PENYUSUTAN/AMORTISASI</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</td>
                            <td class="tw:w-[15rem]" rowspan="2">KETERANGAN</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td>KOMERSIAL</td>
                            <td>FISKAL</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>test</td>
                        </tr>
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>0</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
    
    <!-- KELOMPOK 2 -->
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">KELOMPOK 2</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-fit"}>
                    {#snippet head()}
                        <tr class="tw:hidden"><td><input type="text" name="" id=""></td></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">KODE HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">KELOMPOK/JENIS HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">BULAN/TAHUN PEROLEHAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">BIAYA PEROLEHAN (Rp)</td>
                            <td class="tw:w-[15rem]" rowspan="2">NILAI SISA BUKU FISKAL PADA AWAL TAHUN (Rp)</td>
                            <td class="tw:w-[20rem]" colspan="2">METODE PENYUSUTAN/AMORTISASI</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</td>
                            <td class="tw:w-[15rem]" rowspan="2">KETERANGAN</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td>KOMERSIAL</td>
                            <td>FISKAL</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>test</td>
                        </tr>
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>0</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>

    <!-- KELOMPOK 3 -->
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">KELOMPOK 3</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-fit"}>
                    {#snippet head()}
                        <tr class="tw:hidden"><td><input type="text" name="" id=""></td></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">KODE HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">KELOMPOK/JENIS HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">BULAN/TAHUN PEROLEHAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">BIAYA PEROLEHAN (Rp)</td>
                            <td class="tw:w-[15rem]" rowspan="2">NILAI SISA BUKU FISKAL PADA AWAL TAHUN (Rp)</td>
                            <td class="tw:w-[20rem]" colspan="2">METODE PENYUSUTAN/AMORTISASI</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</td>
                            <td class="tw:w-[15rem]" rowspan="2">KETERANGAN</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td>KOMERSIAL</td>
                            <td>FISKAL</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>test</td>
                        </tr>
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>0</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>

    <!-- KELOMPOK 4 -->
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">KELOMPOK 4</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-fit"}>
                    {#snippet head()}
                        <tr class="tw:hidden"><td><input type="text" name="" id=""></td></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">KODE HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">KELOMPOK/JENIS HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">BULAN/TAHUN PEROLEHAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">BIAYA PEROLEHAN (Rp)</td>
                            <td class="tw:w-[15rem]" rowspan="2">NILAI SISA BUKU FISKAL PADA AWAL TAHUN (Rp)</td>
                            <td class="tw:w-[20rem]" colspan="2">METODE PENYUSUTAN/AMORTISASI</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</td>
                            <td class="tw:w-[15rem]" rowspan="2">KETERANGAN</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td>KOMERSIAL</td>
                            <td>FISKAL</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>test</td>
                        </tr>
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>0</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>

    <!-- KELOMPOK LAINNYA -->
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">KELOMPOK LAINNYA</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"}>Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-fit"}>
                    {#snippet head()}
                        <tr class="tw:hidden"><td><input type="text" name="" id=""></td></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">KODE HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">KELOMPOK/JENIS HARTA</td>
                            <td class="tw:w-[15rem]" rowspan="2">BULAN/TAHUN PEROLEHAN</td>
                            <td class="tw:w-[15rem]" rowspan="2">BIAYA PEROLEHAN (Rp)</td>
                            <td class="tw:w-[15rem]" rowspan="2">NILAI SISA BUKU FISKAL PADA AWAL TAHUN (Rp)</td>
                            <td class="tw:w-[20rem]" colspan="2">METODE PENYUSUTAN/AMORTISASI</td>
                            <td class="tw:w-[15rem]" rowspan="2">PENYUSUTAN/AMORTISASI FISKAL TAHUN INI</td>
                            <td class="tw:w-[15rem]" rowspan="2">KETERANGAN</td>
                        </tr>
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td>KOMERSIAL</td>
                            <td>FISKAL</td>
                        </tr>
                        {#if true}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        <tr class="data">
                            <td>test</td>
                        </tr>
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>0</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
</div>
<div class="tw:flex tw:flex-col tw:border-t-1 tw:border-t-(--color-disabled) tw:p-5 tw:gap-1">
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">JUMLAH AMORTISASI FISKAL</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={"0"} readonly/>
    </div>
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">JUMLAH AMORTISASI KOMERSIAL</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={"0"}/>
    </div>
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">SELISIH AMORTISASI</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={"0"} readonly/>
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
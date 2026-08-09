<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import type { L9Row } from "./types";

    let {
        data,
        openModal,
        deleteItem,
        jenisHartaOptions,
        readonly = false
    }: {
        data: L9Row[];
        openModal: (row: L9Row | null, kelompokPenyusutan: L9Row['kelompokPenyusutan'], options: { value: string; label: string }[]) => void;
        deleteItem: (id: string | number) => void;
        jenisHartaOptions: { value: string; label: string }[];
        readonly?: boolean;
    } = $props();

    const groups: { value: L9Row['kelompokPenyusutan']; label: string }[] = [
        { value: 'kelompok_1', label: 'KELOMPOK 1' },
        { value: 'kelompok_2', label: 'KELOMPOK 2' },
        { value: 'kelompok_3', label: 'KELOMPOK 3' },
        { value: 'kelompok_4', label: 'KELOMPOK 4' },
        { value: 'kelompok_lainnya', label: 'KELOMPOK LAINNYA' }
    ];

    const rupiah = new Intl.NumberFormat('id-ID');

    const jenisHartaLabel = (kode: string) => jenisHartaOptions.find((o) => o.value === kode)?.label ?? kode;

    let rowsByGroup = $derived(
        new Map(groups.map((g) => [g.value, data.filter((row) => row.kelompokPenyusutan === g.value)]))
    );

    const totalFiskal = (rows: L9Row[]) => rows.reduce((sum, row) => sum + Number(row.penyusutanAmortisasiFiskalTahunIni || 0), 0);
    const totalKomersial = (rows: L9Row[]) => rows.reduce((sum, row) => sum + Number(row.penyusutanAmortisasiKomersialTahunIni || 0), 0);

    let jumlahAmortisasiFiskal = $derived(totalFiskal(data));
    let jumlahAmortisasiKomersial = $derived(totalKomersial(data));
    let selisihAmortisasi = $derived(jumlahAmortisasiFiskal - jumlahAmortisasiKomersial);
</script>

<div class="tw:flex tw:flex-col tw:gap-5 tw:p-5">
{#each groups as group}
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">{group.label}</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"} data-bs-toggle={"modal"} data-bs-target={"#modalL9"} disabled={readonly} onclick={() => openModal(null, group.value, jenisHartaOptions)}>Tambah</Button>
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
                        {#if (rowsByGroup.get(group.value)?.length ?? 0) === 0}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        {#each rowsByGroup.get(group.value) ?? [] as row}
                        <tr class="data">
                            <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => openModal(row, group.value, jenisHartaOptions)} data-bs-toggle="modal" data-bs-target="#modalL9">Edit</Button>
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => deleteItem(row.id)}>Hapus</Button>
                            </td>
                            <td>{row.kodeHarta}</td>
                            <td>{jenisHartaLabel(row.jenisHarta)}</td>
                            <td>{row.bulanTahunPerolehan}</td>
                            <td class="tw:text-right">{rupiah.format(row.hargaPerolehan)}</td>
                            <td class="tw:text-right">{rupiah.format(row.nilaiSisaBukuFiskalAwalTahun)}</td>
                            <td>{row.metodePenyusutanKomersial}</td>
                            <td>{row.metodePenyusutanFiskal}</td>
                            <td class="tw:text-right">{rupiah.format(row.penyusutanAmortisasiFiskalTahunIni)}</td>
                            <td>{row.keterangan}</td>
                        </tr>
                        {/each}
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="8">TOTAL</td>
                            <td>{rupiah.format(totalFiskal(rowsByGroup.get(group.value) ?? []))}</td>
                            <td></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
{/each}
</div>
<div class="tw:flex tw:flex-col tw:border-t-1 tw:border-t-(--color-disabled) tw:p-5 tw:gap-1">
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">JUMLAH AMORTISASI FISKAL</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={rupiah.format(jumlahAmortisasiFiskal)} readonly/>
    </div>
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">JUMLAH AMORTISASI KOMERSIAL</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={rupiah.format(jumlahAmortisasiKomersial)} readonly/>
    </div>
    <div class="tw:flex tw:flex-row tw:items-center tw:w-fit">
        <span class="tw:block tw:w-[50rem] tw:font-medium">SELISIH AMORTISASI</span>
        <Input class={"tw:text-right tw:w-[30rem]!"} type={"text"} value={rupiah.format(selisihAmortisasi)} readonly/>
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

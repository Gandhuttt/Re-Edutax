<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import Radio from "$lib/components/RadioPair.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
    import type { L10CRow } from "./types";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l10c: L10CRow[];
        ditentukanPrinsip: boolean;
        readonly?: boolean;
        negaraOptions: { value: string; label: string }[];
        jenisTransaksiOptions: { value: string; label: string }[];
    }

    let {
        currentTab = $bindable(),
        l10c = $bindable(),
        ditentukanPrinsip = $bindable(),
        readonly = false,
        negaraOptions,
        jenisTransaksiOptions
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-C" ? "PERNYATAAN TRANSAKSI DENGAN PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY" : currentTab.title})

    const rupiah = new Intl.NumberFormat('id-ID');

    const negaraLabel = (kode: string) => negaraOptions.find((o) => o.value === kode)?.label ?? kode;
    const jenisTransaksiLabel = (kode: string) => jenisTransaksiOptions.find((o) => o.value === kode)?.label ?? kode;

    let editing = $state<Partial<L10CRow>>({});

    function emptyRow(): Partial<L10CRow> {
        return { namaMitraTransaksi: '', jenisTransaksi: '', negara: '', nilaiTransaksi: 0 };
    }

    function openModal(row: L10CRow | null) {
        editing = row ? { ...row } : emptyRow();
    }

    function saveItem() {
        const index = l10c.findIndex((row) => row.id === editing.id);
        if (index !== -1) {
            l10c[index] = { ...(editing as L10CRow) };
        } else {
            l10c.push({ ...(editing as L10CRow), id: Date.now() });
        }
    }

    function deleteItem(id: string | number) {
        l10c = l10c.filter((row) => row.id !== id);
    }
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-C" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <!-- svelte-ignore block_empty -->
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1 tw:mb-5">
            <span class="tw:font-bold tw:mb-5">I. DALAM HAL WAJIB PAJAK DALAM TAHUN PAJAK INI MELAKUKAN TRANSAKSI DENGAN PIHAK-PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY</span>
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"} disabled={readonly} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL10C">Tambah</Button>
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
                        {#if l10c.length === 0}
                        <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        {#each l10c as row, index}
                        <tr class="data">
                            <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => openModal(row)} data-bs-toggle="modal" data-bs-target="#modalL10C">Edit</Button>
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => deleteItem(row.id)}>Hapus</Button>
                            </td>
                            <td class="tw:text-center">{index + 1}</td>
                            <td>{row.namaMitraTransaksi}</td>
                            <td>{jenisTransaksiLabel(row.jenisTransaksi)}</td>
                            <td>{negaraLabel(row.negara)}</td>
                            <td class="tw:text-right">{rupiah.format(row.nilaiTransaksi)}</td>
                        </tr>
                        {/each}
                        {/if}
                    {/snippet}
                </Table>
            </div>
        </div>
        <div class="tw:flex tw:flex-col">
            <span class="tw:font-bold tw:mb-5">II. PENENTUAN HARGA TRANSAKSI DI ATAS, DITENTUKAN DENGAN MENGGUNAKAN PRINSIP KEWAJARAN DAN KELAZIMAN USAHA</span>
            <div class="tw:px-5 tw:pb-5">
                <Radio name={"ditentukanPrinsip"} bind:group={ditentukanPrinsip} disabled={readonly}/>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

<ModalEdit bind:data={editing} {saveItem} {negaraOptions} {jenisTransaksiOptions} {readonly}/>

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

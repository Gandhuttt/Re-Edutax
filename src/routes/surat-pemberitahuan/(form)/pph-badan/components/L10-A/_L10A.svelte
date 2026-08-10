<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
    import type { L10ARow } from "./types";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l10a: L10ARow[];
        readonly?: boolean;
        negaraOptions: { value: string; label: string }[];
        bentukHubunganOptions: { value: string; label: string }[];
        jenisTransaksiOptions: { value: string; label: string }[];
        metodeHargaTransferOptions: { value: string; label: string }[];
    }

    let {
        currentTab = $bindable(),
        l10a = $bindable(),
        readonly = false,
        negaraOptions,
        bentukHubunganOptions,
        jenisTransaksiOptions,
        metodeHargaTransferOptions
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-A" ? "DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA" : currentTab.title})

    const rupiah = new Intl.NumberFormat('id-ID');

    const negaraLabel = (kode: string) => negaraOptions.find((o) => o.value === kode)?.label ?? kode;
    const bentukHubunganLabel = (kode: string) => bentukHubunganOptions.find((o) => o.value === kode)?.label ?? kode;
    const jenisTransaksiLabel = (kode: string) => jenisTransaksiOptions.find((o) => o.value === kode)?.label ?? kode;
    const metodeHargaTransferLabel = (kode: string) => metodeHargaTransferOptions.find((o) => o.value === kode)?.label ?? kode;

    let editing = $state<Partial<L10ARow>>({});

    function emptyRow(): Partial<L10ARow> {
        return {
            nama: '',
            npwpTin: '',
            negara: '',
            bentukHubungan: '',
            kegiatanUsaha: '',
            jenisTransaksi: '',
            nilaiTransaksi: 0,
            metodePenentuanHargaTransfer: '',
            alasanPenggunaanMetode: ''
        };
    }

    function openModal(row: L10ARow | null) {
        editing = row ? { ...row } : emptyRow();
    }

    function saveItem() {
        const index = l10a.findIndex((row) => row.id === editing.id);
        if (index !== -1) {
            l10a[index] = { ...(editing as L10ARow) };
        } else {
            l10a.push({ ...(editing as L10ARow), id: Date.now() });
        }
    }

    function deleteItem(id: string | number) {
        l10a = l10a.filter((row) => row.id !== id);
    }

    let totalNilaiTransaksi = $derived(l10a.reduce((sum, row) => sum + Number(row.nilaiTransaksi || 0), 0));
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-A" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-1">
            <Button type="button" class={"tw:text-white tw:w-30"} color={"var(--color-secondary)"} disabled={readonly} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL10A">Tambah</Button>
            <div class="tw:overflow-scroll">
                <Table class={"tw:w-full"}>
                    {#snippet head()}
                        <tr class="tw:hidden">
                            <td></td>
                        </tr>
                    {/snippet}
                    {#snippet body()}
                        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                            <td class="tw:w-[10rem]">TINDAKAN</td>
                            <td class="tw:w-[15rem]">NAMA</td>
                            <td class="tw:w-[10rem]">NPWP/TIN</td>
                            <td class="tw:w-[10rem]">NEGARA</td>
                            <td class="tw:w-[15rem]">BENTUK HUBUNGAN</td>
                            <td class="tw:w-[15rem]">KEGIATAN USAHA</td>
                            <td class="tw:w-[15rem]">JENIS TRANSAKSI</td>
                            <td class="tw:w-[15rem]">NILAI TRANSAKSI (Rupiah)</td>
                            <td class="tw:w-[15rem]">METODE PENENTUAN HARGA TRANSFER YANG DIGUNAKAN</td>
                            <td class="tw:w-[15rem]">ALASAN PENGGUNAAN METODE</td>
                        </tr>
                        {#if l10a.length === 0}
                        <tr class="data tw:text-center"><td colspan="10">Tidak ada data yang ditampilkan</td></tr>
                        {:else}
                        {#each l10a as row}
                        <tr class="data">
                            <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => openModal(row)} data-bs-toggle="modal" data-bs-target="#modalL10A">Edit</Button>
                                <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => deleteItem(row.id)}>Hapus</Button>
                            </td>
                            <td>{row.nama}</td>
                            <td>{row.npwpTin}</td>
                            <td>{negaraLabel(row.negara)}</td>
                            <td>{bentukHubunganLabel(row.bentukHubungan)}</td>
                            <td>{row.kegiatanUsaha}</td>
                            <td>{jenisTransaksiLabel(row.jenisTransaksi)}</td>
                            <td class="tw:text-right">{rupiah.format(row.nilaiTransaksi)}</td>
                            <td>{metodeHargaTransferLabel(row.metodePenentuanHargaTransfer)}</td>
                            <td>{row.alasanPenggunaanMetode}</td>
                        </tr>
                        {/each}
                        {/if}
                        <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                            <td colspan="7">JUMLAH</td>
                            <td>{rupiah.format(totalNilaiTransaksi)}</td>
                            <td colspan="2"></td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

<ModalEdit
    bind:data={editing}
    {saveItem}
    {negaraOptions}
    {bentukHubunganOptions}
    {jenisTransaksiOptions}
    {metodeHargaTransferOptions}
    {readonly}
/>

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

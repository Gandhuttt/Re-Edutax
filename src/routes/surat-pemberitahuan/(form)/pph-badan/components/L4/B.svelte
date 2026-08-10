<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let {
        data,
        openModal,
        deleteItem,
        jenisPenghasilanOptions
    }: {
        data: Array<{
            id: string | number;
            jenisPenghasilan: string;
            sumberPenghasilan: string;
            penghasilanBruto: number;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
        jenisPenghasilanOptions: { value: string; label: string }[];
    } = $props();

    const jenisPenghasilanLabel = (kode: string) =>
        jenisPenghasilanOptions.find((o) => o.value === kode)?.label ?? kode;

    let totalPenghasilanBruto = $derived(data.reduce((sum, item) => sum + Number(item.penghasilanBruto || 0), 0));
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL4B">Tambah</Button>
    <div class="tw:overflow-scroll">
        <Table class={"tw:w-full"}>
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><input type="text" name="" id=""></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]"><span>TINDAKAN</span></td>
                    <td class="tw:w-[15rem]"><span>NO</span></td>
                    <td class="tw:w-[15rem]"><span>KODE</span></td>
                    <td class="tw:w-[15rem]"><span>JENIS PENGHASILAN</span></td>
                    <td class="tw:w-[15rem]"><span>SUMBER PENGHASILAN</span></td>
                    <td class="tw:w-[15rem]"><span>PENGHASILAN BRUTO</span></td>
                </tr>
                {#if data.length === 0}
                <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                {#each data as item, i}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL4B">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{i + 1}</td>
                    <td>{item.jenisPenghasilan}</td>
                    <td>{jenisPenghasilanLabel(item.jenisPenghasilan)}</td>
                    <td>{item.sumberPenghasilan}</td>
                    <td>{Number(item.penghasilanBruto || 0).toLocaleString('id-ID')}</td>
                </tr>
                {/each}
                {/if}
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="5">JUMLAH</td>
                    <td>{totalPenghasilanBruto.toLocaleString('id-ID')}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

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

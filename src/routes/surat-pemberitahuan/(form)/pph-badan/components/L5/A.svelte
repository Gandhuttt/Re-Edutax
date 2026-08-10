<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    let {
        data,
        openModal,
        deleteItem
    }: {
        data: Array<{
            id: string | number;
            nitku: string;
            nama: string;
            alamat?: string;
            kelurahan?: string;
            kecamatan?: string;
            kabupaten?: string;
            provinsi?: string;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
    } = $props();
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL5A">Tambah</Button>
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
                    <td class="tw:w-[10rem]"><span>NI TKU</span></td>
                    <td class="tw:w-[15rem]"><span>NAMA TKU</span></td>
                    <td class="tw:w-[15rem]"><span>ALAMAT</span></td>
                    <td class="tw:w-[15rem]"><span>DESA/KELURAHAN</span></td>
                    <td class="tw:w-[10rem]"><span>KECAMATAN</span></td>
                    <td class="tw:w-[20rem]"><span>KOTA/KABUPATEN</span></td>
                    <td class="tw:w-[10rem]"><span>PROVINSI</span></td>
                </tr>
                {#if data.length === 0}
                <tr class="data tw:text-center"><td colspan="8">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                {#each data as item}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL5A">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{item.nitku}</td>
                    <td>{item.nama}</td>
                    <td>{item.alamat}</td>
                    <td>{item.kelurahan}</td>
                    <td>{item.kecamatan}</td>
                    <td>{item.kabupaten}</td>
                    <td>{item.provinsi}</td>
                </tr>
                {/each}
                {/if}
            {/snippet}
        </Table>
    </div>
</div>

<style>
.header td {
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

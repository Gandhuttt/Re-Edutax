<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import ModalEditA from "./_ModalEditA.svelte";
    import type { L13BARow } from "./types";

    let {
        data = $bindable(),
        readonly = false
    }: {
        data: L13BARow[];
        readonly?: boolean;
    } = $props();

    let editing = $state<Partial<L13BARow>>({});

    function emptyRow(): Partial<L13BARow> {
        return { perjanjianNomor: '', perjanjianTanggal: '', mitraKegiatan: '', keterangan: '' };
    }

    function openModal(row: L13BARow | null) {
        editing = row ? { ...row } : emptyRow();
    }

    function saveItem() {
        const index = data.findIndex((row) => row.id === editing.id);
        if (index !== -1) {
            data[index] = { ...(editing as L13BARow) };
        } else {
            data.push({ ...(editing as L13BARow), id: Date.now() });
        }
    }

    function deleteItem(id: string | number) {
        data = data.filter((row) => row.id !== id);
    }
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} disabled={readonly} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL13BA">Tambah</Button>
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
                <td class="tw:w-[20rem]" colspan="2">PERJANJIAN KERJA SAMA</td>
                <td class="tw:w-[20rem]" rowspan="2">MITRA KEGIATAN</td>
                <td class="tw:w-[20rem]" rowspan="2">KETERANGAN</td>
            </tr>
            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                <td>NOMOR</td>
                <td>TANGGAL</td>
            </tr>
            {#if data.length === 0}
            <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
            {:else}
            {#each data as row, index}
            <tr class="data">
                <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                    <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => openModal(row)} data-bs-toggle="modal" data-bs-target="#modalL13BA">Edit</Button>
                    <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => deleteItem(row.id)}>Hapus</Button>
                </td>
                <td class="tw:text-center">{index + 1}</td>
                <td>{row.perjanjianNomor}</td>
                <td>{row.perjanjianTanggal}</td>
                <td>{row.mitraKegiatan}</td>
                <td>{row.keterangan}</td>
            </tr>
            {/each}
            {/if}
            {/snippet}
        </Table>
    </div>
</div>

<ModalEditA bind:data={editing} {saveItem} {readonly}/>

<style>
.header td {
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

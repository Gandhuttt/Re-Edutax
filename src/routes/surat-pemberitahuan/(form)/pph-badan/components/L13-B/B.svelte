<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import type { L13BBRow } from "./types";

    let {
        data = $bindable(),
        readonly = false
    }: {
        data: L13BBRow[];
        readonly?: boolean;
    } = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    let total = $derived(data.reduce((sum, row) => sum + Number(row.nilai || 0), 0));
</script>

<div class="tw:p-5 tw:overflow-scroll">
    <Table class={"tw:w-full"}>
        {#snippet head()}
        <tr class="tw:hidden">
            <td></td>
        </tr>
        {/snippet}
        {#snippet body()}
        <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
            <td class="tw:w-[5rem]">NO.</td>
            <td class="tw:w-[30rem]">DESKRIPSI</td>
            <td class="tw:w-[30rem]">JUMLAH BIAYA</td>
        </tr>
        {#each data as kegiatan, index}
        <tr class="data">
            <td class="tw:text-center">{index + 1}</td>
            <td>{kegiatan.nama}</td>
            <td><Input class={"tw:text-right"} type={"number"} bind:value={kegiatan.nilai} disabled={readonly}/></td>
        </tr>
        {/each}
        <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
            <td colspan="2">TOTAL BIAYA TERKAIT KEGIATAN-KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETENSI TERTENTU</td>
            <td>{rupiah.format(total)}</td>
        </tr>
        {/snippet}
    </Table>
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

<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button class={"tw:text-white tw:w-30"} color={"#1c398e"}>Tambah</Button>
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
            {#if true}
            <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
            {:else}
            <tr class="data">
                <td>testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
                <td>testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
                <td>testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
                <td>testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
                <td>testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
                <td>testttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</td>
            </tr>
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
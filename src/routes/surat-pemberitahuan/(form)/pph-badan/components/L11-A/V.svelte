<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
</script>

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
                    <td class="tw:w-[10rem]">TINDAKAN</td>
                    <td class="tw:w-[5rem]">NO.</td>
                    <td class="tw:w-[15rem]">NOMOR IDENTITAS</td>
                    <td class="tw:w-[15rem]">NAMA DEBITUR</td>
                    <td class="tw:w-[15rem]">ALAMAT</td>
                    <td class="tw:w-[15rem]">NILAI KREDIT KURANG LANCAR AWAL TAHUN BUKU</td>
                    <td class="tw:w-[15rem]">NILAI KREDIT KURANG LANCAR AKHIR TAHUN BUKU</td>
                    <td class="tw:w-[15rem]">JUMLAH BUNGA PADA TAHUN BUKU (AKRUAL)</td>
                    <td class="tw:w-[15rem]">KATEGORI</td>
                </tr>
                {#if true}
                <tr class="data tw:text-center"><td colspan="9">Tidak ada data yang ditampilkan</td></tr>
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

<style>
.header {
    td {
        border: 1px solid white;
    }
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
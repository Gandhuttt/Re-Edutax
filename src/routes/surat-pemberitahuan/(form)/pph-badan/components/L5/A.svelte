<script lang="ts">
    import Table from "$lib/components/Table.svelte";
</script>

<div class="tw:p-5 tw:overflow-scroll">
    <Table class={"tw:w-full"}>
        {#snippet head()}
            <tr class="tw:hidden">
                <td><input type="text" name="" id=""></td>
            </tr>
        {/snippet}
        {#snippet body()}
            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                <td class="tw:w-[10rem]"><span>NI TKU</span></td>
                <td class="tw:w-[15rem]"><span>NAMA TKU</span></td>
                <td class="tw:w-[15rem]"><span>ALAMAT</span></td>
                <td class="tw:w-[15rem]"><span>DESA/KELURAHAN</span></td>
                <td class="tw:w-[10rem]"><span>KECAMATAN</span></td>
                <td class="tw:w-[20rem]"><span>KOTA/KABUPATEN</span></td>
                <td class="tw:w-[10rem]"><span>PROVINSI</span></td>
            </tr>
            <tr class="data">
                <td>1234567890123456789012</td>
                <td>SUPERSTAR</td>
                <td>JL. RAYA TAMBAKSOGRA - SUMBANG</td>
                <td>TAMBAKSOGRA</td>
                <td>SUMBANG</td>
                <td>KAB.BANYUMAS</td>
                <td>JAWA TENGAH</td>
            </tr>
        {/snippet}
    </Table>
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
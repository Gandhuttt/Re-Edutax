<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import RadioPair from "$lib/components/RadioPair.svelte";
    import Button from "$lib/components/Button.svelte";

    let utangSwasta = $state();
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
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]">TINDAKAN</td>
                    <td class="tw:w-[20rem]">PEMBERI PINJAMAN</td>
                    <td class="tw:w-[15rem]">SALDO RATA-RATA UTANG</td>
                    <td class="tw:w-[15rem]">BIAYA PINJAMAN (BUNGA)</td>
                    <td class="tw:w-[15rem]">BIAYA PINJAMAN YANG DAPAT DIPERHITUNGKAN</td>
                    <td class="tw:w-[15rem]">BIAYA PINJAMAN YANG TIDAK DAPAT DIPERHITUNGKAN</td>
                </tr>
                {#if true}
                <tr class="data tw:text-center"><td colspan="6">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                <tr class="data">
                    <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                    <td>tsetaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</td>
                    <td>tset</td>
                    <td>tset</td>
                    <td>tset</td>
                    <td>tset</td>
                </tr>
                {/if}
                <tr class="footer tw:bg-(--color-primary) tw:font-bold tw:text-right">
                    <td colspan="2">JUMLAH</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
            {/snippet}
        </Table>
    </div>
    <div>
        <span>Apakah Anda mempunyai utang swasta luar negeri?</span>
        <RadioPair name={"utangSwasta"} bind:group={utangSwasta}/>
    </div>
</div>

<style>
.header, .footer {
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
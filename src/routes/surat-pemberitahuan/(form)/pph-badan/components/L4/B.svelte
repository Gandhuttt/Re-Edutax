<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
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
                <td class="tw:w-[10rem]"><span>TINDAKAN</span></td>
                <td class="tw:w-[15rem]"><span>NO</span></td>
                <td class="tw:w-[15rem]"><span>KODE</span></td>
                <td class="tw:w-[15rem]"><span>JENIS PENGHASILAN</span></td>
                <td class="tw:w-[15rem]"><span>SUMBER PENGHASILAN</span></td>
                <td class="tw:w-[15rem]"><span>PENGHASILAN BRUTO</span></td>
            </tr>
            <tr class="data">
                <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                    <Button class={"tw:min-w-15!"}>Edit</Button>
                    <Button class={"tw:min-w-15!"}>Hapus</Button>
                </td>
                <td>1</td>
                <td>PEMEGANG SAHAM SATU</td>
                <td>JL. JALAN SATU RT 001 RW 001 KOTA ADM. JAKARTA PUSAT 10350</td>
                <td>INDONESIA</td>
                <td>330000000000010100000000000000</td>
            </tr>
            <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                <td colspan="5">JUMLAH</td>
                <td>0</td>
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
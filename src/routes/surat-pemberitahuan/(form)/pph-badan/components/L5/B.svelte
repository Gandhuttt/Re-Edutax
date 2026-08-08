<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
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
                <td class="tw:w-[10rem]">TINDAKAN</td>
                <td class="tw:w-[15rem]">NAMA TKU</td>
                <td class="tw:w-[7rem]">JANUARI</td>
                <td class="tw:w-[7rem]">FEBRUARI</td>
                <td class="tw:w-[7rem]">MARET</td>
                <td class="tw:w-[7rem]">APRIL</td>
                <td class="tw:w-[7rem]">MEI</td>
                <td class="tw:w-[7rem]">JUNI</td>
                <td class="tw:w-[7rem]">JULI</td>
                <td class="tw:w-[7rem]">AGUSTUS</td>
                <td class="tw:w-[7rem]">SEPTEMBER</td>
                <td class="tw:w-[7rem]">OKTOBER</td>
                <td class="tw:w-[7rem]">NOVEMBER</td>
                <td class="tw:w-[7rem]">DESEMBER</td>
                <td class="tw:w-[7rem]">JUMLAH</td>
            </tr>
            <tr class="data tw:text-right">
                <td class="tw:text-center">
                    <Button type="button" class={"tw:min-w-15!"}>Edit</Button>
                </td>
                <td class="tw:text-left">GANDHI DHUTA NIRVANA</td>
                <td>240.000.000.000</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PEREDARAN BRUTO</td>
                <td>240.000.000.000</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PPh BERSIFAT FINAL TERUTANG</td>
                <td>240.000.000.000</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">PPh BERSIFAT FINAL YANG DISETOR SENDIRI</td>
                <td>240.000.000.000</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PPh BERSIFAT FINAL DIPOTONG/DIPUNGUT PIHAK LAIN</td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td><Input class={"tw:text-right"} type={"text"} value={"0"}/></td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH</td>
                <td>240.000.000.000</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH PADA SPT YANG DIBETULKAN</td>
                <td colspan="13">240.000.000.000</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH KARENA PEMBETULAN</td>
                <td colspan="13">240.000.000.000</td>
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
        padding-inline: .2rem;
    }
}
tr {
    border: none;
}
td {
    padding: .5rem .2rem;
    word-wrap: break-word;
    font-size: .8rem;
}
</style>
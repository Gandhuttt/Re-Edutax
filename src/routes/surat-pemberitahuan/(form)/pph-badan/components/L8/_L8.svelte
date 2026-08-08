<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    
    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L8" ? "PERHITUNGAN FASILITAS PENGURANGAN TARIF PPh  BAGI WAJIB PAJAK BADAN DALAM NEGERI BERDASARKAN PASAL 31E AYAT (1) UDANG-UNDANG PPh" : currentTab.title})

    const currentYear = new Date().getFullYear();
</script>

<div class="tw:mt-5 {currentTab.tab === "L8" ? "" : "tw:hidden"}">
    <Card> 
        {#snippet head()}
        <span class="tw:font-bold">PERHITUNGAN FASILITAS PENGURANGAN TARIF PPh  BAGI WAJIB PAJAK BADAN DALAM NEGERI BERDASARKAN PASAL 31E AYAT (1) UDANG-UNDANG PPh</span>
        {/snippet}
        {#snippet body()}
        <Table class={"tw:w-full"}>
            {#snippet head()}
            <!-- svelte-ignore block_empty -->
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[5rem]">NO.</td>
                    <td class="tw:w-[50rem]">DESKRIPSI</td>
                    <td class="tw:w-[50rem]">AMOUNT (Rupiah)</td>
                </tr>
                <!-- Jumlah Peredaran Bruto -->
                <tr class="data">
                    <td>1.</td>
                    <td colspan="2">Jumlah Peredara Bruto</td>
                </tr>
                <tr class="data">
                    <td></td>
                    <td>Jumlah Peredara Bruto</td>
                    <td>
                        <div class="tw:flex tw:flex-row tw:items-center">
                            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                            <Input class={"tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0}/>
                        </div>
                    </td>
                </tr>
                
                <!-- Penghasilan Kena Pajak -->
                <tr class="data">
                    <td>2.</td>
                    <td colspan="2">Penghasilan Kena Pajak</td>
                </tr>
                <tr class="data">
                    <td></td>
                    <td>Penghasilan Kena Pajak dari bagian peredaran bruto yang memperoleh fasilitas</td>
                    <td>
                        <div class="tw:flex tw:flex-row tw:items-center">
                            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                            <Input class={"tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0} readonly/>
                        </div>
                    </td>
                </tr>
                <tr class="data">
                    <td></td>
                    <td>Penghasilan Kena Pajak dari bagian peredaran bruto yang tidak memperoleh fasilitas</td>
                    <td>
                        <div class="tw:flex tw:flex-row tw:items-center">
                            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                            <Input class={"tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0} readonly/>
                        </div>
                    </td>
                </tr>
                
                <!-- Pajak Terutang -->
                <tr class="data">
                    <td>3.</td>
                    <td colspan="2">Pajak Terutang</td>
                </tr>
                <tr class="data">
                    <td></td>
                    <td>PPh Terutang atas Penghasilan Kena Pajak dari bagian peredaran bruto yang memperoleh fasilitas</td>
                    <td>
                        <div class="tw:flex tw:flex-row tw:items-center">
                            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                            <Input class={"tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0} readonly/>
                        </div>
                    </td>
                </tr>
                <tr class="data">
                    <td></td>
                    <td>PPh Terutang atas Penghasilan Kena Pajak dari bagian peredaran bruto yang tidak memperoleh fasilitas</td>
                    <td>
                        <div class="tw:flex tw:flex-row tw:items-center">
                            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                            <Input class={"tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0} readonly/>
                        </div>
                    </td>
                </tr>

                <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                    <td colspan="2">Jumlah PPh Terutang</td>
                    <td>0</td>
                </tr>
            {/snippet}
        </Table>
        {/snippet}
    </Card>
</div>

<style>
.header td, .footer td {
    border: 1px solid white;
}

.data {
    height: 3rem ;
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
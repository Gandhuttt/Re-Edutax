<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import ModalEdit from "./_ModalEdit.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L7" ? "PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL" : currentTab.title})

    const currentYear = new Date().getFullYear();
</script>

<div class="tw:mt-5 {currentTab.tab === "L7" ? "" : "tw:hidden"}">
    <Card> 
        {#snippet head()}
        <span class="tw:font-bold">PENGHITUNGAN KOMPNESASI KERUGIAN FISKAL</span>
        {/snippet}
        {#snippet body()}
        <Table class={"tw:w-full"}>
            {#snippet head()}
            <!-- svelte-ignore block_empty -->
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]" rowspan="3">TINDAKAN</td>
                    <td class="tw:w-[5rem]" rowspan="3">NO.</td>
                    <td class="tw:w-[30rem]" rowspan="2" colspan="2">LABA (RUGI) NETTO FISKAL.</td>
                    <td class="tw:w-[75rem]" colspan="6">KOMPENSASI KERUGIAN FISKAL</td>
                </tr>
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td>Y-4</td>
                    <td>Y-3</td>
                    <td>Y-2</td>
                    <td>Y-1</td>
                    <td>{currentYear}</td>
                    <td>Y+1</td>
                </tr>
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <!-- LABA (RUGI) NETTO FISKAL -->
                    <td>TAHUN/BAGIAN TAHUN PAJAK</td>
                    <td>NILAI (Rp)</td>

                    <!-- KOMPENSASI KERUGIAN FISKAL -->
                    <td>NILAI (Rp)</td>
                    <td>NILAI (Rp)</td>
                    <td>NILAI (Rp)</td>
                    <td>NILAI (Rp)</td>
                    <td>TAHUN PAJAK INI - NILAI (Rp)</td>
                    <td>TAHUN PAJAK BERJALAN - NILAI (Rp)</td>
                </tr>
                {#each {length: 10} as _, index}
                <tr class="data tw:text-right">
                    <td class="tw:text-center"><Button class={"tw:min-w-15!" } type={"button"} data-bs-target={"#modalL7"} data-bs-toggle={"modal"}>Edit</Button></td>
                    <td class="tw:text-center">{index + 1}</td>
                    <td class="tw:text-center">{currentYear - (9 - index)}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
                {/each}
                <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                    <td colspan="4">JUMLAH</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>
            {/snippet}
        </Table>
        {/snippet}
    </Card>
</div>

<ModalEdit/>

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
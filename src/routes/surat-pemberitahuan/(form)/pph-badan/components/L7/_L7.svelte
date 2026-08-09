<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import ModalEdit from "./_ModalEdit.svelte";

    type Row = {
        tahunPajak: number;
        labaRugiNetoFiskal: number;
        kompensasiYMin4: number;
        kompensasiYMin3: number;
        kompensasiYMin2: number;
        kompensasiYMin1: number;
        kompensasiTahunIni: number;
        kompensasiYPlus1: number;
    };

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l7: Row[];
        readonly?: boolean;
    }

    let { currentTab = $bindable(), l7 = $bindable(), readonly = false }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L7" ? "PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL" : currentTab.title})

    const currentYear = l7.length ? l7[l7.length - 1].tahunPajak : new Date().getFullYear();

    const rupiah = new Intl.NumberFormat('id-ID');

    let editing = $state<Row>({
        tahunPajak: 0,
        labaRugiNetoFiskal: 0,
        kompensasiYMin4: 0,
        kompensasiYMin3: 0,
        kompensasiYMin2: 0,
        kompensasiYMin1: 0,
        kompensasiTahunIni: 0,
        kompensasiYPlus1: 0
    });

    function openModal(row: Row) {
        editing = { ...row };
    }

    function saveItem() {
        const index = l7.findIndex((row) => row.tahunPajak === editing.tahunPajak);
        if (index !== -1) {
            l7[index] = { ...editing };
        }
    }

    let jumlah = $derived(
        l7.reduce(
            (acc, row) => ({
                kompensasiYMin4: acc.kompensasiYMin4 + Number(row.kompensasiYMin4 || 0),
                kompensasiYMin3: acc.kompensasiYMin3 + Number(row.kompensasiYMin3 || 0),
                kompensasiYMin2: acc.kompensasiYMin2 + Number(row.kompensasiYMin2 || 0),
                kompensasiYMin1: acc.kompensasiYMin1 + Number(row.kompensasiYMin1 || 0),
                kompensasiTahunIni: acc.kompensasiTahunIni + Number(row.kompensasiTahunIni || 0),
                kompensasiYPlus1: acc.kompensasiYPlus1 + Number(row.kompensasiYPlus1 || 0)
            }),
            {
                kompensasiYMin4: 0,
                kompensasiYMin3: 0,
                kompensasiYMin2: 0,
                kompensasiYMin1: 0,
                kompensasiTahunIni: 0,
                kompensasiYPlus1: 0
            }
        )
    );
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
                {#each l7 as row, index}
                <tr class="data tw:text-right">
                    <td class="tw:text-center">
                        <Button
                            class={"tw:min-w-15!"}
                            type={"button"}
                            data-bs-target={"#modalL7"}
                            data-bs-toggle={"modal"}
                            disabled={readonly}
                            onclick={() => openModal(row)}
                        >Edit</Button>
                    </td>
                    <td class="tw:text-center">{index + 1}</td>
                    <td class="tw:text-center">{row.tahunPajak}</td>
                    <td>{rupiah.format(row.labaRugiNetoFiskal)}</td>
                    <td>{rupiah.format(row.kompensasiYMin4)}</td>
                    <td>{rupiah.format(row.kompensasiYMin3)}</td>
                    <td>{rupiah.format(row.kompensasiYMin2)}</td>
                    <td>{rupiah.format(row.kompensasiYMin1)}</td>
                    <td>{rupiah.format(row.kompensasiTahunIni)}</td>
                    <td>{rupiah.format(row.kompensasiYPlus1)}</td>
                </tr>
                {/each}
                <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                    <td colspan="4">JUMLAH</td>
                    <td>{rupiah.format(jumlah.kompensasiYMin4)}</td>
                    <td>{rupiah.format(jumlah.kompensasiYMin3)}</td>
                    <td>{rupiah.format(jumlah.kompensasiYMin2)}</td>
                    <td>{rupiah.format(jumlah.kompensasiYMin1)}</td>
                    <td>{rupiah.format(jumlah.kompensasiTahunIni)}</td>
                    <td>{rupiah.format(jumlah.kompensasiYPlus1)}</td>
                </tr>
            {/snippet}
        </Table>
        {/snippet}
    </Card>
</div>

<ModalEdit bind:data={editing} {saveItem} {readonly}/>

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

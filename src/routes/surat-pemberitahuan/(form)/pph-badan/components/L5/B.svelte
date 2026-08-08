<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";

    const bulanNames = [
        'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
        'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];

    let {
        data,
        dipotongBulanan = $bindable(),
        openModal
    }: {
        data: Array<{
            id: string | number;
            nama: string;
            bulanan: Array<{
                bulan: number;
                jumlahPeredaranBruto: number;
            }>;
        }>;
        dipotongBulanan: Array<{ bulan: number; nilai: number }>;
        openModal: (item: unknown) => void;
    } = $props();

    function terutang(bruto: number): number {
        return Math.round(Number(bruto || 0) * 0.005);
    }

    function rowJumlahBruto(bulanan: { jumlahPeredaranBruto: number }[]): number {
        return bulanan.reduce((sum, b) => sum + Number(b.jumlahPeredaranBruto || 0), 0);
    }

    let totalBrutoPerBulan = $derived(
        Array.from({ length: 12 }, (_, i) =>
            data.reduce((sum, tku) => sum + Number(tku.bulanan[i]?.jumlahPeredaranBruto || 0), 0)
        )
    );
    let totalTerutangPerBulan = $derived(totalBrutoPerBulan.map((bruto) => terutang(bruto)));
    let totalSelisihPerBulan = $derived(
        totalTerutangPerBulan.map((terutangBulan, i) => terutangBulan - Number(dipotongBulanan[i]?.nilai || 0))
    );

    let grandBruto = $derived(totalBrutoPerBulan.reduce((a, b) => a + b, 0));
    let grandTerutang = $derived(totalTerutangPerBulan.reduce((a, b) => a + b, 0));
    let grandDipotong = $derived(dipotongBulanan.reduce((sum, b) => sum + Number(b.nilai || 0), 0));
    let grandSelisih = $derived(totalSelisihPerBulan.reduce((a, b) => a + b, 0));
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
                {#each bulanNames as bulan}
                    <td class="tw:w-[7rem]">{bulan}</td>
                {/each}
                <td class="tw:w-[7rem]">JUMLAH</td>
            </tr>
            {#each data as item}
            <tr class="data tw:text-right">
                <td class="tw:text-center">
                    <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL5B">Edit</Button>
                </td>
                <td class="tw:text-left">{item.nama}</td>
                {#each item.bulanan as b}
                    <td>{Number(b.jumlahPeredaranBruto || 0).toLocaleString('id-ID')}</td>
                {/each}
                <td>{rowJumlahBruto(item.bulanan).toLocaleString('id-ID')}</td>
            </tr>
            {/each}
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PEREDARAN BRUTO</td>
                {#each totalBrutoPerBulan as bulan}
                    <td>{bulan.toLocaleString('id-ID')}</td>
                {/each}
                <td>{grandBruto.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PPh BERSIFAT FINAL TERUTANG</td>
                {#each totalTerutangPerBulan as bulan}
                    <td>{bulan.toLocaleString('id-ID')}</td>
                {/each}
                <td>{grandTerutang.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">PPh BERSIFAT FINAL YANG DISETOR SENDIRI</td>
                {#each bulanNames as _}
                    <td>0</td>
                {/each}
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">JUMLAH PPh BERSIFAT FINAL DIPOTONG/DIPUNGUT PIHAK LAIN</td>
                {#each dipotongBulanan as item}
                    <td>
                        <input
                            type="number"
                            bind:value={item.nilai}
                            class="tw:w-full tw:text-right tw:bg-transparent"
                        />
                    </td>
                {/each}
                <td>{grandDipotong.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH</td>
                {#each totalSelisihPerBulan as bulan}
                    <td>{bulan.toLocaleString('id-ID')}</td>
                {/each}
                <td>{grandSelisih.toLocaleString('id-ID')}</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH PADA SPT YANG DIBETULKAN</td>
                <td colspan="13">0</td>
            </tr>
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="2">SELISIH KARENA PEMBETULAN</td>
                <td colspan="13">{grandSelisih.toLocaleString('id-ID')}</td>
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

<script lang="ts">
	import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

    let {
        data,
        openModal,
        deleteItem,
        pengembalianPengurangan = $bindable(0)
    }: {
        data: Array<{
            id: string | number;
            namaPemberiPenghasilan: string;
            negara: string;
            tanggal: string;
            jenisPenghasilan: string;
            penghasilanNeto: number;
            pphLuarNegeri: number;
            mataUang: string;
            pphLuarNegeriMataUangAsing: number;
            kreditPajakYangDapatDikreditkan: number;
            keterangan: string;
        }>;
        openModal: (item: unknown) => void;
        deleteItem: (id: string | number) => void;
        pengembalianPengurangan?: number;
    } = $props();

    let totalPenghasilanNeto = $derived(data.reduce((sum, item) => sum + Number(item.penghasilanNeto || 0), 0));
    let totalPphLuarNegeri = $derived(data.reduce((sum, item) => sum + Number(item.pphLuarNegeri || 0), 0));
    let totalKreditPajak = $derived(data.reduce((sum, item) => sum + Number(item.kreditPajakYangDapatDikreditkan || 0), 0));
    let jumlahDapatDiperhitungkan = $derived(totalKreditPajak - Number(pengembalianPengurangan || 0));
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL3A">Tambah</Button>
    <div class="tw:overflow-scroll">
        <Table class={"tw:w-full"}>
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><input type="text" name="" id=""></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[10rem]" rowspan="2"><span>TINDAKAN</span></td>
                    <td class="tw:w-[5rem]" rowspan="2"><span>NO</span></td>
                    <td class="tw:w-[25rem]" colspan="2"><span>PEMOTONG PAJAK</span></td>
                    <td class="tw:w-[8rem]" rowspan="2"><span>TANGGAL</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>JENIS PENGHASILAN</span></td>
                    <td class="tw:w-[12rem]" rowspan="2"><span>PENGHASILAN NETO (Rp)</span></td>
                    <td class="tw:w-[35rem]" colspan="3"><span>PPh YANG DIBAYAR/DIPOTONG/TERUTANG DI LUAR NEGERI</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>KREDIT PAJAK YANG DAPAT DIKREDITKAN (Rp)</span></td>
                    <td class="tw:w-[15rem]" rowspan="2"><span>KETERANGAN</span></td>
                </tr>
                <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                    <td class="tw:w-[15rem]"><span>NAMA</span></td>
                    <td class="tw:w-[10rem]"><span>NEGARA</span></td>
                    <td class="tw:w-[12rem]"><span>NILAI (Rp)</span></td>
                    <td class="tw:w-[8rem]"><span>MATA UANG</span></td>
                    <td class="tw:w-[15rem]"><span>NILAI DALAM MATA UANG ASING</span></td>
                </tr>
                {#if data.length === 0}
                <tr class="data tw:text-center"><td colspan="12">Tidak ada data yang ditampilkan</td></tr>
                {:else}
                {#each data as item, i}
                <tr class="data">
                    <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => openModal(item)} data-bs-toggle="modal" data-bs-target="#modalL3A">Edit</Button>
                        <Button type="button" class={"tw:min-w-15!"} onclick={() => deleteItem(item.id)}>Hapus</Button>
                    </td>
                    <td>{i + 1}</td>
                    <td>{item.namaPemberiPenghasilan}</td>
                    <td>{item.negara}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.jenisPenghasilan}</td>
                    <td>{Number(item.penghasilanNeto || 0).toLocaleString('id-ID')}</td>
                    <td>{Number(item.pphLuarNegeri || 0).toLocaleString('id-ID')}</td>
                    <td>{item.mataUang}</td>
                    <td>{Number(item.pphLuarNegeriMataUangAsing || 0).toLocaleString('id-ID')}</td>
                    <td>{Number(item.kreditPajakYangDapatDikreditkan || 0).toLocaleString('id-ID')}</td>
                    <td>{item.keterangan}</td>
                </tr>
                {/each}
                {/if}
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="6">JUMLAH</td>
                    <td>{totalPenghasilanNeto.toLocaleString('id-ID')}</td>
                    <td>{totalPphLuarNegeri.toLocaleString('id-ID')}</td>
                    <td colspan="2"></td>
                    <td>{totalKreditPajak.toLocaleString('id-ID')}</td>
                    <td></td>
                </tr>
                <tr class="footer tw:bg-[#FFD230] tw:font-bold">
                    <td colspan="10" class="tw:text-right">PENGEMBALIAN/PENGURANGAN PAJAK PENGHASILAN LUAR NEGERI (PASAL 24) YANG TELAH DIKREDITKAN UNTUK TAHUN SEBELUMNYA</td>
                    <td class="tw:text-right">
                        <input
                            type="text"
                            inputmode="numeric"
                            value={formatRupiah(pengembalianPengurangan)}
                            oninput={(e) => (pengembalianPengurangan = applyRupiahInput(e))}
                            class="tw:w-full tw:text-right tw:bg-transparent"
                        />
                    </td>
                    <td></td>
                </tr>
                <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                    <td colspan="10">JUMLAH PAJAK PENGHASILAN YANG DIBAYAR DI LUAR NEGERI YANG DAPAT DIPERHITUNGKAN DALAM TAHUN BERJALAN</td>
                    <td>{jumlahDapatDiperhitungkan.toLocaleString('id-ID')}</td>
                    <td></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<style>
.header td, .footer td {
    border: 1px solid white;
}
.data {
    &:nth-child(odd of .data) {
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
    padding: .5rem 1rem;
    word-wrap: break-word;
    font-size: .8rem;
}
</style>

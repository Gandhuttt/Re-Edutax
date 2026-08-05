<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";

    let biayaKegiatan = $state([
        {id: 0, label: 'BIAYA PENYEDIA FASILITAS FISIK KHUSUS BERUPA WORKSHOP ATAU TEMPAT PELATIHAN SEJENIS LAINNYA TERKAIT PRAKTIK  KERJA DAN/ATAU PEMAGANGAN', value: 0},
        {id: 1, label: 'BIAYA INFRASTRUKTUR ATAU PENGAJAR SEBAGAI TENAGA PEMBIMBING PELAKSANAAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN', value: 0},
        {id: 2, label: 'BARANG DAN/ATAU BAHAN UNTUK KEPERLUAN PELAKSANAAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN', value: 0},
        {id: 4, label: 'HONORARIUM ATAU PEMBAYARAN SEJENIS YANG DIBERIKAN KEPADA PESERTA PRAKTIK KERJA DAN/ATAU PEMAGANGAN', value: 0},
        {id: 5, label: 'BIAYA SERTIFIKASI SERTA BIAYA LISTRIK, AIR, DAN BAHAN BAKAR UNTUK PELAKSANAAN PRAKTIK KERJA DAN/ATAU PEMAGANGAN', value: 0}
    ]);
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
            <td class="tw:w-[5rem]">NO.</td>
            <td class="tw:w-[30rem]">DESKRIPSI</td>
            <td class="tw:w-[30rem]">JUMLAH BIAYA</td>
        </tr>
        {#each biayaKegiatan as kegiatan}    
        <tr class="data">
            <td class="tw:text-center"><Button>Edit</Button></td>
            <td class="tw:text-center">{kegiatan.id+1}</td>
            <td>{kegiatan.label}</td>
            <td><Input class={"tw:text-right tw:border-none! tw:bg-transparent!"} type={"text"} value={kegiatan.value} disabled/></td>
        </tr>
        {/each}
        <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
            <td colspan="3">TOTAL BIAYA TERKAIT KEGIATAN-KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETENSI TERTENTU</td>
            <td><Input class={"tw:text-right tw:border-none! tw:bg-transparent!"} type={"text"} value={0} disabled/></td>
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
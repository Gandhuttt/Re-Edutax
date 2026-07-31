<script lang="ts">
	import Table from "$lib/components/Table.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
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
                <td class="tw:w-[10rem]" rowspan="2"><span>TINDAKAN</span></td>
                <td class="tw:w-[5rem]" rowspan="2"><span>NO</span></td>
                <td class="tw:w-[15rem]" rowspan="2"><span>NAMA</span></td>
                <td class="tw:w-[15rem]" rowspan="2"><span>ALAMAT</span></td>
                <td class="tw:w-[10rem]" rowspan="2"><span>KODE NEGARA</span></td>
                <td class="tw:w-[10rem]" rowspan="2"><span>NPWP/NIK</span></td>
                <td class="tw:w-[10rem]" rowspan="2"><span>JABATAN</span></td>
                <td class="tw:w-[20rem]" colspan="2"><span>MODAL DISETOR</span></td>
                <td class="tw:w-[15rem]" rowspan="2"><span>DIVIDEN/PEMBAGIAN LABA (Rp)</span></td>
            </tr>
            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                <td class="tw:w-[10rem]"><span>NILAI (Rp)</span></td>
                <td class="tw:w-[10rem]"><span>%</span></td>
            </tr>
            <tr class="data">
                <td>test</td>
                <td>1</td>
                <td>PEMEGANG SAHAM SATU</td>
                <td>JL. JALAN SATU RT 001 RW 001 KOTA ADM. JAKARTA PUSAT 10350</td>
                <td>INDONESIA</td>
                <td>330000000000010100000000000000</td>
                <td>DIREKTUR</td>
                <td>12345678901234567890</td>
                <td>0</td>
                <td>0</td>
            </tr>
            <tr class="footer tw:bg-[#FFD230] tw:text-right tw:font-bold">
                <td colspan="7">JUMLAH</td>
                <td>0</td>
                <td>0,0000</td>
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
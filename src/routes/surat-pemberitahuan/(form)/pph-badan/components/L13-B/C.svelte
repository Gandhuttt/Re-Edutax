<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import ModalEditC from "./_ModalEditC.svelte";
    import type { L13BCRow } from "./types";

    let {
        data = $bindable(),
        readonly = false
    }: {
        data: L13BCRow[];
        readonly?: boolean;
    } = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    const tambahanPengurang = (row: L13BCRow) =>
        Math.round((Number(row.jumlahBiaya || 0) * Number(row.persentaseFasilitasPajak || 0)) / 100);

    let totalTambahanPengurang = $derived(data.reduce((sum, row) => sum + tambahanPengurang(row), 0));

    let editing = $state<Partial<L13BCRow>>({});

    function emptyRow(): Partial<L13BCRow> {
        return {
            nomorProposal: '',
            jangkaWaktuDariTahun: 0,
            jangkaWaktuSampaiTahun: 0,
            jumlahBiaya: 0,
            tahunPerolehanHki: 0,
            persentaseFasilitasPajak: 0
        };
    }

    function openModal(row: L13BCRow | null) {
        editing = row ? { ...row } : emptyRow();
    }

    function saveItem() {
        const index = data.findIndex((row) => row.id === editing.id);
        if (index !== -1) {
            data[index] = { ...(editing as L13BCRow) };
        } else {
            data.push({ ...(editing as L13BCRow), id: Date.now() });
        }
    }

    function deleteItem(id: string | number) {
        data = data.filter((row) => row.id !== id);
    }
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-1">
    <Button type="button" class={"tw:text-white tw:w-30"} color={"#1c398e"} disabled={readonly} onclick={() => openModal(null)} data-bs-toggle="modal" data-bs-target="#modalL13BC">Tambah</Button>
    <div class="tw:overflow-scroll">
        <Table class={"tw:w-full"}>
            {#snippet head()}
            <tr class="tw:hidden">
                <td></td>
            </tr>
            {/snippet}
            {#snippet body()}
            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                <td class="tw:w-[10rem]" rowspan="2">TINDAKAN</td>
                <td class="tw:w-[5rem]" rowspan="2">NO.</td>
                <td class="tw:w-[10rem]" rowspan="2">NOMOR PROPOSAL</td>
                <td class="tw:w-[20rem]" colspan="2">JANGKA WAKTU PENGELUARAN BIAYA</td>
                <td class="tw:w-[15rem]" rowspan="2">JUMLAH BIAYA</td>
                <td class="tw:w-[20rem]" rowspan="2">TAHUN PEROLEHAN HAK KEKAYAAN INTELEKTUAL / KOMERSIALISASI</td>
                <td class="tw:w-[20rem]" rowspan="2">PERSENTASE FASILITAS PAJAK (%)</td>
                <td class="tw:w-[20rem]" rowspan="2">TAMBAHAN PENGURANGAN PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN</td>
            </tr>
            <tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
                <td>DARI TAHUN</td>
                <td>SAMPAI TAHUN</td>
            </tr>
            {#if data.length === 0}
            <tr class="data tw:text-center"><td colspan="9">Tidak ada data yang ditampilkan</td></tr>
            {:else}
            {#each data as row, index}
            <tr class="data tw:text-right">
                <td class="tw:flex tw:flex-row tw:gap-1 tw:justify-center">
                    <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => openModal(row)} data-bs-toggle="modal" data-bs-target="#modalL13BC">Edit</Button>
                    <Button type="button" class={"tw:min-w-15!"} disabled={readonly} onclick={() => deleteItem(row.id)}>Hapus</Button>
                </td>
                <td class="tw:text-center">{index + 1}</td>
                <td>{row.nomorProposal}</td>
                <td>{row.jangkaWaktuDariTahun}</td>
                <td>{row.jangkaWaktuSampaiTahun}</td>
                <td>{rupiah.format(row.jumlahBiaya)}</td>
                <td>{row.tahunPerolehanHki}</td>
                <td>{row.persentaseFasilitasPajak}</td>
                <td>{rupiah.format(tambahanPengurang(row))}</td>
            </tr>
            {/each}
            {/if}
            <tr class="footer tw:bg-[var(--color-primary)] tw:font-bold tw:text-right">
                <td colspan="8">JUMLAH TAMBAHAN PENGURANG PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN</td>
                <td><Input class={"tw:text-right tw:border-none! tw:bg-transparent!"} type={"text"} value={rupiah.format(totalTambahanPengurang)} readonly/></td>
            </tr>
            {/snippet}
        </Table>
    </div>
</div>

<ModalEditC bind:data={editing} {saveItem} {readonly}/>

<style>
.header, .footer {
    td {
        border: 1px solid white;
    }
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

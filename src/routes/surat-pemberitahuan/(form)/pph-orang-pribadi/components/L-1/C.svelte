<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import type { BarisKeluarga } from "./types";

    // C. DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN
    //
    // Read-only with no row editor in any answer state. On the live form it is
    // filled from DJP records independently of the Posting SPT action: it held
    // three dependants even though Posting reported "belum pernah dilakukan". For
    // a training app these rows are seeded rather than fetched.
    //
    // No totals row: nothing here is a money column.
    interface Props {
        rows: BarisKeluarga[];
    }

    let { rows }: Props = $props();
</script>

<div class="tw:mb-6">
    <div class="tw:overflow-x-auto tw:mt-2">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>NAMA</th>
                    <th>NIK</th>
                    <th>TANGGAL LAHIR</th>
                    <th>HUBUNGAN DENGAN WAJIB PAJAK</th>
                    <th>PEKERJAAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        <td>{index + 1}</td>
                        <td>{row.nama}</td>
                        <td>{row.nik}</td>
                        <td>{row.tanggalLahir}</td>
                        <td>{row.hubungan}</td>
                        <td>{row.pekerjaan}</td>
                    </tr>
                {:else}
                    <tr><td colspan="6" class="tw:text-center">Tidak ada data yang ditemukan.</td></tr>
                {/each}
            {/snippet}
        </Table>
    </div>
</div>

<style>
    th {
    	font-size: .7rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .4rem .5rem;
    	white-space: nowrap;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
    td {
    	font-size: .8rem;
    	padding: .25rem .5rem;
    	border: 1px solid white;
    }
    tr:not(.total):not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
    }
</style>

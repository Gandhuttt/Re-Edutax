<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { Harta } from "./types";

    // A7. IKHTISAR HARTA
    //
    // A rollup of tables 1 to 6, read-only in every captured answer state, so it
    // is genuinely not user-editable rather than merely gated. No TINDAKAN or NO.
    // columns and no row editor.
    //
    // It has two columns where A1 has only a single SALDO. On the live form that
    // one A1 value populated both, so the harga side falls back to nilaiSaatIni
    // when a row has no separate harga perolehan.
    //
    // The JUMLAH row feeds Induk 14a, whose own label names this as its source.
    interface Props {
        harta: Harta;
    }

    let { harta }: Props = $props();

    const judul = {
        a1: '1. KAS DAN SETARA KAS',
        a2: '2. PIUTANG',
        a3: '3. INVESTASI/SEKURITAS',
        a4: '4. HARTA BERGERAK',
        a5: '5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)',
        a6: '6. HARTA LAINNYA'
    } as const;

    let baris = $derived(
        (['a1', 'a2', 'a3', 'a4', 'a5', 'a6'] as const).map((key) => ({
            deskripsi: judul[key],
            // A1 has no hargaPerolehan field of its own (see the type note above),
            // so the fallback to nilaiSaatIni is a real branch, not defensive
            // padding.
            hargaPerolehan: harta[key].reduce(
                (sum, row) =>
                    sum + Number(('hargaPerolehan' in row ? row.hargaPerolehan : row.nilaiSaatIni) || 0),
                0
            ),
            nilaiSaatIni: harta[key].reduce((sum, row) => sum + Number(row.nilaiSaatIni || 0), 0)
        }))
    );

    let totalHarga = $derived(baris.reduce((sum, row) => sum + row.hargaPerolehan, 0));
    let totalNilai = $derived(baris.reduce((sum, row) => sum + row.nilaiSaatIni, 0));
</script>

<div class="tw:mb-6">
    <span class="tw:text-sm tw:font-bold tw:block tw:mb-2">7. IKHTISAR HARTA</span>
    <div class="tw:overflow-x-auto tw:mt-2">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    <th>DESKRIPSI</th>
                    <th class="tw:text-end">HARGA PEROLEHAN</th>
                    <th class="tw:text-end">NILAI SAAT INI</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each baris as row}
                    <tr>
                        <td>{row.deskripsi}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.hargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiahDerived(row.nilaiSaatIni)}</td>
                    </tr>
                {/each}
                <tr class="total">
                    <td>JUMLAH HARTA PADA AKHIR TAHUN PAJAK</td>
                    <td class="tw:text-end">{formatRupiahDerived(totalHarga)}</td>
                    <td class="tw:text-end">{formatRupiahDerived(totalNilai)}</td>
                </tr>
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
    tr.total td {
    	font-weight: bold;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
</style>

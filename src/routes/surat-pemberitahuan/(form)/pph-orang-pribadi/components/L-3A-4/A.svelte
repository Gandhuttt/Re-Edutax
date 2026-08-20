<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Table from "$lib/components/Table.svelte";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import { hitungLampiranL3A4BagianA } from "../Induk/hitungPphOrangPribadi";

    // A. PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS
    // BERDASARKAN PENCATATAN — the Norma (NPPN) calculation, feeding Induk 1.b.1.
    //
    // Four of the five columns are derived, exactly as on the live form where they
    // are disabled inputs regenerated from L-3B Bagian C
    // (addDataL3bTableCToL3A4TableA). Only NORMA (%) is typed, validated > 0 and
    // <= 100 by Coretax's own row dialog. See hitungLampiranL3A4BagianA.
    //
    // Coretax renders this as a row grid with an EDIT dialog per row, one row per
    // registered TKU. We model a single TKU, so the row is inline and always
    // present rather than added through a dialog.
    interface Props {
        namaUsaha: string;
        jenisUsahaPekerjaanBebas: string;
        // Sum of L-3B Bagian C's twelve monthly peredaran bruto.
        peredaranBruto: number;
        normaPersen: number;
        // 1.b.3 = Norma. Coretax gates the grid's action column on
        // selectB1B3 == Yes, so without it the row exists but is not editable.
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let {
        namaUsaha,
        jenisUsahaPekerjaanBebas,
        peredaranBruto,
        normaPersen = $bindable(),
        dapatDiubah = true,
        readonly = false
    }: Props = $props();

    let bisaEdit = $derived(dapatDiubah && !readonly);

    let computed = $derived(
        hitungLampiranL3A4BagianA([
            {
                namaUsaha,
                jenisUsahaPekerjaanBebas,
                peredaranBruto: Number(peredaranBruto),
                normaPersen: Number(normaPersen)
            }
        ])
    );

    let baris = $derived(computed.rows[0]);

    // Coretax validates Norm as required, greaterThan(0), lessThanEquals(100).
    let normaTidakValid = $derived(
        Number(normaPersen) < 0 || Number(normaPersen) > 100
    );
</script>

<Table class="tw:min-w-full">
    {#snippet head()}
        <tr>
            <th>NO.</th>
            <th>NAMA USAHA/PEKERJAAN BEBAS</th>
            <th>JENIS USAHA/PEKERJAAN BEBAS</th>
            <th class="tw:text-end">PEREDARAN BRUTO (Rp)</th>
            <th class="tw:text-end">NORMA (%)</th>
            <th class="tw:text-end">PENGHASILAN NETO (Rp)</th>
        </tr>
    {/snippet}
    {#snippet body()}
        <tr>
            <td class="tw:text-center">1</td>
            <td><Input type={"text"} value={namaUsaha} disabled /></td>
            <td><Input type={"text"} value={jenisUsahaPekerjaanBebas} disabled /></td>
            <td>
                <Input
                    class={"tw:text-end"}
                    type={"rupiah"}
                    value={baris.peredaranBruto}
                    disabled
                />
            </td>
            <td>
                <Input
                    class={"tw:text-end"}
                    type={"number"}
                    min="0"
                    max="100"
                    bind:value={normaPersen}
                    disabled={!bisaEdit}
                />
            </td>
            <td>
                <Input
                    class={"tw:text-end"}
                    type={"rupiah"}
                    value={baris.penghasilanNeto}
                    disabled
                />
            </td>
        </tr>
        <tr>
            <td colspan="3" class="tw:text-end">JUMLAH PEREDARAN BRUTO (Rp)</td>
            <td class="tw:text-end">{formatRupiahDerived(computed.totalPeredaranBruto)}</td>
            <td class="tw:text-end">TOTAL PENGHASILAN NETO</td>
            <td class="tw:text-end">{formatRupiahDerived(computed.totalPenghasilanNeto)}</td>
        </tr>
    {/snippet}
</Table>

{#if normaTidakValid}
    <p class="tw:mt-2 tw:text-sm tw:text-red-600">Norma harus lebih dari 0 dan tidak lebih dari 100.</p>
{/if}

<p class="tw:mt-3 tw:text-sm tw:italic">
    Nama, jenis usaha dan peredaran bruto diambil dari Lampiran 3B Bagian C. Isi
    kolom NORMA (%) untuk menghitung penghasilan neto.
</p>

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
    	padding: .4rem .5rem;
    	border: 1px solid white;
    }
    tr:nth-child(odd) {
    	background-color: #F9F6EE;
    }
</style>

<script lang="ts">
    import { DataTable, FormField, SelectField } from "$lib/re-ui-components";
    import RowTanya from "./RowTanya.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { HINTS } from "./hints";
    import { PTKP_OPTIONS, type hitungInduk } from "./hitungPphOrangPribadi";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";

    interface Props {
        computed: ReturnType<typeof hitungInduk>;
        c3AdaPengurangPenghasilanNeto: boolean | undefined;
        c5PtkpStatus: string;
        c8AdaPengurangPphTerutang: boolean | undefined;
        // Row 7 = PH/MT. Coretax's calculateTaxExemption sets
        // disableTaxExemptionDropdown and forces valueC4 (row 5) to 0 in that
        // case, because the PTKP is claimed jointly in L-4 Bagian B instead.
        // Verified live 2026-08-19: the row 5 dropdown renders greyed at "-/-"
        // with 0, and row 6 reads 0, on a Pisah Harta return.
        phMt?: boolean;
        readonly?: boolean;
    }

    let {
        computed,
        c3AdaPengurangPenghasilanNeto = $bindable(),
        c5PtkpStatus = $bindable(),
        c8AdaPengurangPphTerutang = $bindable(),
        phMt = false,
        readonly = false
    }: Props = $props();

    const ptkpOptions = [{ value: '', label: '' }, ...PTKP_OPTIONS];
</script>

<DataTable
    label="Penghitungan pajak terutang"
    minWidth="1080px"
    headerTone="navy"
    density="compact"
    framed={false}
>
    <table>
        <thead>
            <tr>
                <th scope="col">Nomor</th>
                <th scope="col">Uraian</th>
                <th scope="col">Jawaban/Pilihan</th>
                <th scope="col" class="number">Jumlah (Rupiah)</th>
                <th scope="col">Informasi</th>
            </tr>
        </thead>
        <tbody>
            <RowNilai nomor="2." label="Penghasilan neto setahun (1a+1b+1c+1d)" value={computed.n2} />
            <RowTanya
                nomor="3."
                label="Apakah terdapat pengurang penghasilan neto (kompensasi kerugian, zakat/sumbangan keagamaan) selain yang telah diperhitungkan dalam Formulir BPA1 dan/atau BPA2?"
                name="C3"
                bind:answer={c3AdaPengurangPenghasilanNeto}
                hint={HINTS.c3}
                amount="derived"
                amountValue={computed.n3}
                {readonly}
            />
            <RowNilai nomor="4." label="Penghasilan neto setelah pengurang penghasilan neto (2-3)" value={computed.n4} />
            <tr>
                <td><strong>5.</strong></td>
                <td>Penghasilan Tidak Kena Pajak *</td>
                <td>
                    <SelectField
                        label="Status Penghasilan Tidak Kena Pajak"
                        labelHidden
                        floatingPanel
                        bind:value={c5PtkpStatus}
                        options={ptkpOptions}
                        disabled={readonly || phMt}
                    />
                </td>
                <td class="amount-cell">
                    <FormField
                        label="Jumlah 5."
                        value={formatRupiahDerived(computed.n5)}
                        disabled
                    />
                </td>
                <td></td>
            </tr>
            <!-- Row 6 rounds down to the nearest 1.000 and floors at 0, both
                 implemented in hitungInduk and confirmed by measurement. -->
            <RowNilai nomor="6." label="Penghasilan Kena Pajak (4-5)" value={computed.n6} />
            <RowNilai nomor="7." label="PPh Terutang" value={computed.n7} />
            <RowTanya
                nomor="8."
                label="Apakah terdapat pengurang PPh Terutang?"
                name="C8"
                bind:answer={c8AdaPengurangPphTerutang}
                hint={HINTS.c8}
                amount="derived"
                amountValue={computed.n8}
                {readonly}
            />
            <RowNilai nomor="9." label="PPh Terutang setelah pengurang PPh Terutang (7-8)" value={computed.n9} />
        </tbody>
    </table>
</DataTable>

<style>
    .amount-cell {
        min-width: 13rem;
    }
    .amount-cell :global(.field > .label),
    .amount-cell :global(label > .label) {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
    }
</style>

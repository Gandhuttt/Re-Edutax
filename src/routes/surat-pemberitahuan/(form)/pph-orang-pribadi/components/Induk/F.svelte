<script lang="ts">
    import { getContext } from "svelte";
    import { CheckboxField, DataTable, FormField } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import RowNilai from "./RowNilai.svelte";
    import type { hitungInduk } from "./hitungPphOrangPribadi";

    // Only applies when the SPT status is Pembetulan. On the real form this is a
    // section of the Induk rather than a separate flow, unlike the Badan side.
    //
    // The section is present on every return, not only on a pembetulan: Coretax
    // titles it "(DIISI JIKA STATUS SPT ADALAH PEMBETULAN)" and leaves both cells
    // permanently disabled — `valueF1` and `valueF2` are declared
    // `{value: 0, disabled: true}` in the form group and only ever patched, never
    // typed. So both amounts are read-only here in every state, and `aktif` only
    // governs the one control that is not: the Ganti SPT checkbox.
    //
    // Coretax blanks valueF2 on a normal return
    // (getUnderpaymentOrOverpaymentIncomeTaxDueToAmendment patches null); we show
    // the computed figure instead, which on a non-pembetulan is 0 anyway. Not
    // hiding a value the section already knows keeps this read-only rather than
    // conditional.
    interface Props {
        computed: ReturnType<typeof hitungInduk>;
        // Read from the SPT being amended, never typed.
        f12a: number;
        f12aGantiSptSebelumnya: boolean | undefined;
        // Status SPT is Pembetulan. False leaves the section visible but inert.
        aktif: boolean;
        readonly?: boolean;
    }

    let {
        computed,
        f12a,
        f12aGantiSptSebelumnya = $bindable(),
        aktif,
        readonly = false
    }: Props = $props();

    const id = getContext<string>("id");
</script>

<DataTable
    label="Pembetulan"
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
            <tr>
                <td><strong>12.a</strong></td>
                <td>PPh kurang/lebih bayar pada SPT yang dibetulkan</td>
                <td>
                    <CheckboxField
                        {id}
                        label="Ganti SPT sebelumnya"
                        compact
                        bind:checked={f12aGantiSptSebelumnya}
                        disabled={readonly || !aktif}
                    />
                </td>
                <td class="amount-cell">
                    <FormField label="Jumlah 12.a" value={formatRupiahDerived(f12a)} disabled />
                </td>
                <td></td>
            </tr>
            <RowNilai
                nomor="12.b"
                label="PPh kurang/lebih bayar karena pembetulan (11a-12a)"
                value={computed.n12b}
            />
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

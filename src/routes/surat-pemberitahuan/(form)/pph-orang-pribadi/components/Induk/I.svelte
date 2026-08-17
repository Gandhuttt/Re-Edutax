<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Table from "$lib/components/Table.svelte";
    import RowTanya from "./RowTanya.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { HINTS, HINTS_DISABLED } from "./hints";

    interface Props {
        // Fed from the L-1 Bagian A harta rollup. 14a is the only Induk field
        // whose own label names its source.
        n14a: number;
        // Fed from L-1 Bagian B.
        n14b: number;
        // Fed from L-2 Bagian A (the DPP) and Bagian B.
        n14c: number;
        n14d: number;
        i14bMemilikiUtang: boolean | undefined;
        i14cPenghasilanFinal: boolean | undefined;
        i14dBukanObjekPajak: boolean | undefined;
        i14ePenyusutanAmortisasiFiskal: boolean | undefined;
        i14fBiayaEntertainment: boolean | undefined;
        i14gDividenLuarNegeri: boolean | undefined;
        i14hKelebihanPphFinal: number;
        readonly?: boolean;
    }

    let {
        n14a,
        n14b,
        n14c,
        n14d,
        i14bMemilikiUtang = $bindable(),
        i14cPenghasilanFinal = $bindable(),
        i14dBukanObjekPajak = $bindable(),
        i14ePenyusutanAmortisasiFiskal = $bindable(),
        i14fBiayaEntertainment = $bindable(),
        i14gDividenLuarNegeri = $bindable(),
        i14hKelebihanPphFinal = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <RowNilai
                nomor={"14.a"}
                label={"Harta pada akhir Tahun Pajak (Isi Lampiran 1 Bagian A, lalu ke pertanyaan selanjutnya)"}
                value={n14a}
            />
            <RowTanya
                nomor={"14.b"}
                label={"Apakah Anda memiliki utang pada akhir tahun pajak?"}
                name={"I14b"}
                bind:answer={i14bMemilikiUtang}
                hint={HINTS.i14b}
                amount={"derived"}
                amountValue={n14b}
                {readonly}
            />
            <RowTanya
                nomor={"14.c"}
                label={"Apakah Anda menerima penghasilan yang dikenakan pajak penghasilan bersifat final?"}
                name={"I14c"}
                bind:answer={i14cPenghasilanFinal}
                hint={HINTS.i14c}
                amount={"derived"}
                amountValue={n14c}
                {readonly}
            />
            <RowTanya
                nomor={"14.d"}
                label={"Apakah Anda menerima penghasilan yang tidak termasuk objek pajak?"}
                name={"I14d"}
                bind:answer={i14dBukanObjekPajak}
                hint={HINTS.i14d}
                amount={"derived"}
                amountValue={n14d}
                {readonly}
            />
            <!-- 14e and 14f render disabled. What gates them was never isolated:
                 the Metode Pembukuan hypothesis was measured and disproved, and
                 14f later became enabled for reasons that could not be pinned
                 down. Left permanently disabled rather than gated on a guess. -->
            <RowTanya
                nomor={"14.e"}
                label={"Apakah Anda melaporkan biaya penyusutan dan/atau amortisasi fiskal?"}
                name={"I14e"}
                bind:answer={i14ePenyusutanAmortisasiFiskal}
                disabled
                disabledHint={HINTS_DISABLED.i14e}
                {readonly}
            />
            <RowTanya
                nomor={"14.f"}
                label={"Apakah Anda melaporkan biaya entertainment, promosi, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, serta piutang yang nyata-nyata tidak dapat ditagih?"}
                name={"I14f"}
                bind:answer={i14fBiayaEntertainment}
                disabled
                disabledHint={HINTS_DISABLED.i14f}
                {readonly}
            />
            <!-- Routes nowhere: 14g = Ya shows a compliance reminder rather than
                 sending the taxpayer to a lampiran. -->
            <RowTanya
                nomor={"14.g"}
                label={"Apakah Anda menerima dividen dan/atau penghasilan lain dari luar negeri dan melaporkannya sebagai penghasilan tidak termasuk objek pajak?"}
                name={"I14g"}
                bind:answer={i14gDividenLuarNegeri}
                hint={HINTS.i14g}
                {readonly}
            />
            <RowNilai
                nomor={"14.h"}
                label={"Kelebihan PPh Final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diminta pengembalian"}
                bind:value={i14hKelebihanPphFinal}
                editable
                {readonly}
            />
        {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) { background-color: #F9F6EE; }
    }
    td { padding: .25rem .5rem; }
</style>

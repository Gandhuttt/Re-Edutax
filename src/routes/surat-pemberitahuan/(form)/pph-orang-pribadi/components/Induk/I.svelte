<script lang="ts">
    import { DataTable } from "$lib/re-ui-components";
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
        // 14.e and 14.f are the gates for L-3C and L-3D (Coretax chkI5 / chkI6).
        // Both start disabled in Coretax's form group and are enabled by a
        // specific earlier answer, which is why they read as permanently greyed
        // unless that answer is given:
        //
        //   emittedEventB1B3:  t.value === No ? chkI5.enable() : chkI5.disable()
        //   filledDisableSubForm(t) -> updateChkI6(t):
        //     0 == t ? (patchValue({chkI6: 0}), chkI6.disable()) : chkI6.enable()
        //
        // So 14.e is enabled when 1.b.3 = Tidak (menyelenggarakan pembukuan) —
        // fiscal depreciation only applies to a bookkeeper, not a Norma user —
        // and 14.f is enabled when 1.b.1 = Ya. An earlier note here recorded
        // both as permanently disabled for undetermined reasons; see
        // docs/bundle-diff-1770.md B9.
        b1b3Norma: string;
        b1b1PenghasilanUsaha: boolean | undefined;
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
        b1b3Norma,
        b1b1PenghasilanUsaha,
        readonly = false
    }: Props = $props();
</script>

<DataTable
    label="Transaksi dan kewajiban lainnya"
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
            <RowNilai
                nomor="14.a"
                label="Harta pada akhir Tahun Pajak (Isi Lampiran 1 Bagian A, lalu ke pertanyaan selanjutnya)"
                value={n14a}
            />
            <RowTanya
                nomor="14.b"
                label="Apakah Anda memiliki utang pada akhir tahun pajak?"
                name="I14b"
                bind:answer={i14bMemilikiUtang}
                hint={HINTS.i14b}
                amount="derived"
                amountValue={n14b}
                {readonly}
            />
            <RowTanya
                nomor="14.c"
                label="Apakah Anda menerima penghasilan yang dikenakan pajak penghasilan bersifat final?"
                name="I14c"
                bind:answer={i14cPenghasilanFinal}
                hint={HINTS.i14c}
                amount="derived"
                amountValue={n14c}
                {readonly}
            />
            <RowTanya
                nomor="14.d"
                label="Apakah Anda menerima penghasilan yang tidak termasuk objek pajak?"
                name="I14d"
                bind:answer={i14dBukanObjekPajak}
                hint={HINTS.i14d}
                amount="derived"
                amountValue={n14d}
                {readonly}
            />
            <RowTanya
                nomor="14.e"
                label="Apakah Anda melaporkan biaya penyusutan dan/atau amortisasi fiskal?"
                name="I14e"
                bind:answer={i14ePenyusutanAmortisasiFiskal}
                hint={HINTS.i14e}
                disabled={b1b3Norma !== 'tidak_pembukuan'}
                disabledHint={HINTS_DISABLED.i14e}
                {readonly}
            />
            <RowTanya
                nomor="14.f"
                label="Apakah Anda melaporkan biaya entertainment, promosi, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, serta piutang yang nyata-nyata tidak dapat ditagih?"
                name="I14f"
                bind:answer={i14fBiayaEntertainment}
                hint={HINTS.i14f}
                disabled={!b1b1PenghasilanUsaha}
                disabledHint={HINTS_DISABLED.i14f}
                {readonly}
            />
            <!-- Routes nowhere: 14g = Ya shows a compliance reminder rather than
                 sending the taxpayer to a lampiran. -->
            <RowTanya
                nomor="14.g"
                label="Apakah Anda menerima dividen dan/atau penghasilan lain dari luar negeri dan melaporkannya sebagai penghasilan tidak termasuk objek pajak?"
                name="I14g"
                bind:answer={i14gDividenLuarNegeri}
                hint={HINTS.i14g}
                {readonly}
            />
            <RowNilai
                nomor="14.h"
                label="Kelebihan PPh Final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diminta pengembalian"
                bind:value={i14hKelebihanPphFinal}
                editable
                {readonly}
            />
        </tbody>
    </table>
</DataTable>

<script lang="ts">
    import { DataTable } from "$lib/re-ui-components";
    import RowTanya from "./RowTanya.svelte";
    import { HINTS_DISABLED } from "./hints";

    interface Props {
        jaLaporanKeuangan: boolean | undefined;
        jbBuktiZakat: boolean | undefined;
        jcBuktiPotongLuarNegeri: boolean | undefined;
        jdSuratKuasaKhusus: boolean | undefined;
        jeDokumenLainnya: boolean | undefined;
        readonly?: boolean;
    }

    let {
        jaLaporanKeuangan = $bindable(),
        jbBuktiZakat = $bindable(),
        jcBuktiPotongLuarNegeri = $bindable(),
        jdSuratKuasaKhusus = $bindable(),
        jeDokumenLainnya = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<DataTable
    label="Lampiran dan dokumen pendukung"
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
            <!-- Items a to c are system-driven from earlier answers and render
                 disabled; only d and e are freely selectable. Their hints state
                 what the system decided rather than routing anywhere. -->
            <RowTanya
                nomor="a."
                label="Laporan Keuangan/Laporan Keuangan yang telah diaudit"
                name="Ja"
                bind:answer={jaLaporanKeuangan}
                disabled
                disabledHint={HINTS_DISABLED.ja}
                {readonly}
            />
            <RowTanya
                nomor="b."
                label="Bukti pembayaran zakat/sumbangan keagamaan"
                name="Jb"
                bind:answer={jbBuktiZakat}
                disabled
                disabledHint={HINTS_DISABLED.jb}
                {readonly}
            />
            <RowTanya
                nomor="c."
                label="Bukti pemotongan/pemungutan sehubungan dengan kredit pajak luar negeri"
                name="Jc"
                bind:answer={jcBuktiPotongLuarNegeri}
                disabled
                disabledHint={HINTS_DISABLED.jc}
                {readonly}
            />
            <!-- d and e carry no hint chip at all. Answering Ya reveals a file
                 upload control on the real form; file upload is not implemented
                 here yet, so the answer is recorded without an attachment. -->
            <RowTanya
                nomor="d."
                label="Surat kuasa khusus"
                name="Jd"
                bind:answer={jdSuratKuasaKhusus}
                {readonly}
            />
            <RowTanya
                nomor="e."
                label="Dokumen lainnya"
                name="Je"
                bind:answer={jeDokumenLainnya}
                {readonly}
            />
        </tbody>
    </table>
</DataTable>

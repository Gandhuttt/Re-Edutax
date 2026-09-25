<script lang="ts">
    import { DataTable } from "$lib/re-ui-components";
    import RowTanya from "./RowTanya.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { HINTS_DISABLED } from "./hints";
    import type { hitungInduk } from "./hitungPphOrangPribadi";

    interface Props {
        computed: ReturnType<typeof hitungInduk>;
        e11bAdaSkPengangsuranPenundaan: boolean | undefined;
        e11bJumlah: number;
        readonly?: boolean;
    }

    let {
        computed,
        e11bAdaSkPengangsuranPenundaan = $bindable(),
        e11bJumlah = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<DataTable
    label="PPh kurang atau lebih bayar"
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
                nomor="11.a"
                label="PPh kurang/lebih bayar (9-10a-10b-10c+10d)"
                value={computed.n11a}
            />
            <!-- Disabled on the real form: neither Ya nor Tidak can be selected,
                 yet the hint chip still asserts an answer. A disabled question is
                 not the same as an unanswered one. -->
            <RowTanya
                nomor="11.b"
                label="Apakah terdapat Surat Keputusan Persetujuan Pengangsuran atau Penundaan Pembayaran Pajak?"
                name="E11b"
                bind:answer={e11bAdaSkPengangsuranPenundaan}
                disabled
                disabledHint={HINTS_DISABLED.e11b}
                amount="derived"
                amountValue={e11bJumlah}
                {readonly}
            />
            <RowNilai nomor="11.c" label="PPh yang masih harus dibayar (11a-11b)" value={computed.n11c} />
        </tbody>
    </table>
</DataTable>

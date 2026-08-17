<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Table from "$lib/components/Table.svelte";
    import RowTanya from "./RowTanya.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { HINTS } from "./hints";

    interface Props {
        d10aAdaPphDipotongPihakLain: boolean | undefined;
        // Fed from L-1 Bagian E, which itself already includes the kredit pajak
        // luar negeri imported from L-2 C, so this is not a single lampiran's sum.
        n10a: number;
        d10bAngsuranPph25: number;
        d10cStpPph25: number;
        d10dAdaPengembalianKreditLuarNegeri: boolean | undefined;
        d10dJumlah: number;
        readonly?: boolean;
    }

    let {
        d10aAdaPphDipotongPihakLain = $bindable(),
        n10a,
        d10bAngsuranPph25 = $bindable(),
        d10cStpPph25 = $bindable(),
        d10dAdaPengembalianKreditLuarNegeri = $bindable(),
        d10dJumlah = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <!-- 10a = Tidak removes the amount cell from the DOM entirely rather
                 than disabling it, so the cell is bound to the Ya answer. -->
            <RowTanya
                nomor={"10.a"}
                label={"Apakah terdapat PPh yang telah dipotong/dipungut oleh pihak lain?"}
                name={"D10a"}
                bind:answer={d10aAdaPphDipotongPihakLain}
                hint={HINTS.d10a}
                amount={"derived"}
                amountValue={n10a}
                amountWhen={true}
                {readonly}
            />
            <RowNilai
                nomor={"10.b"}
                label={"Angsuran PPh Pasal 25"}
                bind:value={d10bAngsuranPph25}
                editable
                {readonly}
            />
            <RowNilai
                nomor={"10.c"}
                label={"STP PPh Pasal 25 (Hanya pokok pajak)"}
                bind:value={d10cStpPph25}
                editable
                {readonly}
            />
            <!-- 10d = Ya enables its amount input, which is present but disabled
                 on Tidak. That is the third of the three amount-cell states. -->
            <RowTanya
                nomor={"10.d"}
                label={"Apakah Anda menerima pengembalian/pengurangan kredit PPh luar negeri yang telah dikreditkan?"}
                name={"D10d"}
                bind:answer={d10dAdaPengembalianKreditLuarNegeri}
                hint={HINTS.d10d}
                amount={d10dAdaPengembalianKreditLuarNegeri ? 'input' : 'derived'}
                bind:amountValue={d10dJumlah}
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

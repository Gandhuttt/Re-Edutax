<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Table from "$lib/components/Table.svelte";
    import RowTanya from "./RowTanya.svelte";
    import { HINTS } from "./hints";

    interface Props {
        h13aAngsuranTeratur: boolean | undefined;
        h13bPerhitunganTersendiri: boolean | undefined;
        h13cAngsuranOppt: boolean | undefined;
        // L-4 Bagian A's computed Angsuran PPh Pasal 25 Tahun Pajak
        // Berikutnya, mirrored onto 13.b's inline amount cell. On the live
        // form this cell appears the moment 13.b is answered Ya (L4.md).
        l4AngsuranPph25?: number;
        readonly?: boolean;
    }

    let {
        h13aAngsuranTeratur = $bindable(),
        h13bPerhitunganTersendiri = $bindable(),
        h13cAngsuranOppt = $bindable(),
        l4AngsuranPph25 = 0,
        readonly = false
    }: Props = $props();

    // 13a, 13b and 13c are alternative Pasal 25 regimes, so answering one Ya
    // voids the others: on the real form setting 13a = Ya cleared 13b back to
    // unanswered. This is not expressible as three independent booleans, so the
    // exclusivity is enforced here rather than in the schema.
    //
    // Clearing to undefined (unanswered) rather than to false is deliberate: it
    // matches what the form does, and a false would assert an answer the taxpayer
    // never gave.
    function pilih(row: 'a' | 'b' | 'c') {
        if (row !== 'a' && h13aAngsuranTeratur) h13aAngsuranTeratur = undefined;
        if (row !== 'b' && h13bPerhitunganTersendiri) h13bPerhitunganTersendiri = undefined;
        if (row !== 'c' && h13cAngsuranOppt) h13cAngsuranOppt = undefined;
    }

    $effect(() => {
        if (h13aAngsuranTeratur) pilih('a');
    });
    $effect(() => {
        if (h13bPerhitunganTersendiri) pilih('b');
    });
    $effect(() => {
        if (h13cAngsuranOppt) pilih('c');
    });
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <RowTanya
                nomor={"13.a"}
                label={"Apakah Anda hanya menerima penghasilan teratur dan berkewajiban membayar angsuran PPh Pasal 25 tahun berikutnya?"}
                name={"H13a"}
                bind:answer={h13aAngsuranTeratur}
                hint={HINTS.h13a}
                {readonly}
            />
            <RowTanya
                nomor={"13.b"}
                label={"Apakah Anda menyusun perhitungan tersendiri angsuran PPh Pasal 25 tahun berikutnya?"}
                name={"H13b"}
                bind:answer={h13bPerhitunganTersendiri}
                hint={HINTS.h13b}
                amount={"derived"}
                amountWhen={true}
                amountValue={l4AngsuranPph25}
                {readonly}
            />
            <RowTanya
                nomor={"13.c"}
                label={"Apakah Anda membayar angsuran PPh Pasal 25 OPPT tahun berikutnya?"}
                name={"H13c"}
                bind:answer={h13cAngsuranOppt}
                hint={HINTS.h13c}
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

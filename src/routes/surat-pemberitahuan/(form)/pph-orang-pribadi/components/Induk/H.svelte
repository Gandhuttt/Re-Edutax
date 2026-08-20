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
        // 13.a's own derived cell, Coretax's valueH1:
        //   getArticle25IncomeTaxInstallment() patches
        //   Math.round(1 / numberOfMonth * (C6 < D1 ? 0 : C6 - D1)),
        // i.e. rows (9) - (10)(a), clamped at 0, spread over the period. It is
        // declared {value: null, disabled: true} in the form group, so it is
        // read-only like 13.b's, and re-patched whenever 9 or 10a moves.
        angsuranPph25?: number;
        // Period length in months, the divisor above. Shown in the hint text,
        // which Coretax assembles as notif13aLabel + numberOfMonth + formula.
        jumlahBulan?: number;
        readonly?: boolean;
    }

    let {
        h13aAngsuranTeratur = $bindable(),
        h13bPerhitunganTersendiri = $bindable(),
        h13cAngsuranOppt = $bindable(),
        l4AngsuranPph25 = 0,
        angsuranPph25 = 0,
        jumlahBulan = 12,
        readonly = false
    }: Props = $props();

    let hint13a = $derived({
        ...HINTS.h13a,
        ya: `Ya, Angsuran PPh Pasal 25 adalah 1/${jumlahBulan} x ((9) – (10)(a))`
    });

    // Coretax has exactly ONE interlock here, 13a over 13b:
    //
    //   checkedChkH1(t){ 0 == t ? (patchValue({valueH1:0, chkH1:false}), chkH2.enable())
    //                           : (patchValue({chkH1:true}), chkH2.disable(),
    //                              chkH2.setValue("0"), patchValue({valueH2:0, chkH2:false})) }
    //   disableChkH2(){ chkH1 ? (chkH2.disable(), ...) : chkH2.enable() }
    //   checkedChkH3(t){ patchValue(0 == t ? {chkH3:false} : {chkH3:true}) }
    //
    // 13a = Ya disables 13b outright and clears it; 13a = Tidak re-enables it.
    // 13c writes only its own value and clears nothing. An earlier three-way
    // exclusivity here also had 13c voiding 13a and 13b, which the live form does
    // not do — see docs/bundle-diff-1770.md B6.
    //
    // Clearing to undefined (unanswered) rather than to false is deliberate: a
    // false would assert an answer the taxpayer never gave. Coretax does write a
    // false, but it also disables the control, so the value is unreachable either
    // way.
    let b13bTerkunci = $derived(h13aAngsuranTeratur === true);

    $effect(() => {
        if (h13aAngsuranTeratur === true && h13bPerhitunganTersendiri !== undefined) {
            h13bPerhitunganTersendiri = undefined;
        }
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
                hint={hint13a}
                amount={"derived"}
                amountWhen={true}
                amountValue={angsuranPph25}
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
                disabled={b13bTerkunci}
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

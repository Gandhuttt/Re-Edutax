<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";

    // Only applies when the return is in a refund position (lebih bayar).
    //
    // This section was never OBSERVED on the live form, since the captured draft
    // was never in a refund position and the bank-account picker could not be
    // opened. It was modelled on the equivalent SPT Badan section rather than
    // guessed at, a deliberate decision recorded in OPTIONS.md.
    //
    // Partly verified against the bundle 2026-08-19: Coretax's form group holds
    // RefundStatus, BankAccountNo, BankName, BankCode and AccountName (all
    // disabled) plus BankAccount, the enabled picker. Four of those map to the
    // four fields here; BankCode has no equivalent, and the picker needs a DJP
    // bank registry we have no counterpart for. Whether BankCode should surface is
    // an open question, not a settled omission.
    // Present on every return, not only a refund one. Coretax titles it
    // "(DIISI JIKA STATUS SPT ADALAH LEBIH BAYAR)" and drives the fields, not the
    // section, from the outcome: setMandatorySectionG adds required validators and
    // sets isBankAccountDisabled = false when the return is in a refund position,
    // and otherwise disables the picker and drops the validators.
    //
    // `aktif` reproduces the enable/disable half only. Coretax also wipes the
    // four values on the way out (clearSectionGValue); we deliberately do not —
    // an inapplicable section here is read-only, not destructive, so bank details
    // typed while the return was in a refund position survive a swing back into
    // kurang bayar and reappear if it swings again.
    interface Props {
        gMetodePengembalian: string;
        gNomorRekening: string;
        gNamaBank: string;
        gNamaPemilikRekening: string;
        // Return is in a refund position. False leaves the section visible and
        // read-only, values intact.
        aktif: boolean;
        readonly?: boolean;
    }

    let {
        gMetodePengembalian = $bindable(),
        gNomorRekening = $bindable(),
        gNamaBank = $bindable(),
        gNamaPemilikRekening = $bindable(),
        aktif,
        readonly = false
    }: Props = $props();

    const metodeOptions = [
        { value: '', label: '' },
        { value: 'pemeriksaan', label: 'Pengembalian melalui pemeriksaan' },
        { value: 'pengembalian_pendahuluan', label: 'Pengembalian pendahuluan kelebihan pembayaran pajak' }
    ];
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td class="tw:w-[25rem]"><span>PPh lebih bayar pada 11a atau 12b mohon:</span></td>
                <td>
                    <Select bind:value={gMetodePengembalian} disabled={readonly || !aktif}>
                        {#each metodeOptions as metode}
                            <option class="tw:text-black" value={metode.value}>{metode.label}</option>
                        {/each}
                    </Select>
                </td>
            </tr>
            <tr>
                <td><span>Nomor Rekening</span></td>
                <td><Input type={"text"} bind:value={gNomorRekening} disabled={readonly || !aktif} /></td>
            </tr>
            <tr>
                <td><span>Nama Bank</span></td>
                <td><Input type={"text"} bind:value={gNamaBank} disabled={readonly || !aktif} /></td>
            </tr>
            <tr>
                <td><span>Nama Pemilik Rekening</span></td>
                <td><Input type={"text"} bind:value={gNamaPemilikRekening} disabled={readonly || !aktif} /></td>
            </tr>
        {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) { background-color: #F9F6EE; }
    }
    td { padding: .25rem .5rem; }
    span { font-size: .8rem; }
</style>

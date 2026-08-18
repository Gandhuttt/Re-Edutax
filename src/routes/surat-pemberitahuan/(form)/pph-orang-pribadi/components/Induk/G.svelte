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
    interface Props {
        gMetodePengembalian: string;
        gNomorRekening: string;
        gNamaBank: string;
        gNamaPemilikRekening: string;
        readonly?: boolean;
    }

    let {
        gMetodePengembalian = $bindable(),
        gNomorRekening = $bindable(),
        gNamaBank = $bindable(),
        gNamaPemilikRekening = $bindable(),
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
                    <Select bind:value={gMetodePengembalian} disabled={readonly}>
                        {#each metodeOptions as metode}
                            <option class="tw:text-black" value={metode.value}>{metode.label}</option>
                        {/each}
                    </Select>
                </td>
            </tr>
            <tr>
                <td><span>Nomor Rekening</span></td>
                <td><Input type={"text"} bind:value={gNomorRekening} disabled={readonly} /></td>
            </tr>
            <tr>
                <td><span>Nama Bank</span></td>
                <td><Input type={"text"} bind:value={gNamaBank} disabled={readonly} /></td>
            </tr>
            <tr>
                <td><span>Nama Pemilik Rekening</span></td>
                <td><Input type={"text"} bind:value={gNamaPemilikRekening} disabled={readonly} /></td>
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

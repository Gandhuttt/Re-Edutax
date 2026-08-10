<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Alert from "$lib/components/Alert.svelte";
    import { getContext } from "svelte";

    interface L4ARow {
        dasarPengenaanPajak: number;
    }

    interface L4BRow {
        penghasilanBruto: number;
    }

    let {
        menerimaPenghasilanPp23 = $bindable(),
        hanyaPenghasilanPp23 = $bindable(),
        menerimaPenghasilanFinal = $bindable(),
        menerimaPenghasilanBukanObjekPajak = $bindable(),
        l4a,
        l4b,
        readonly = false
    }: {
        menerimaPenghasilanPp23: boolean;
        hanyaPenghasilanPp23: boolean;
        menerimaPenghasilanFinal: boolean;
        menerimaPenghasilanBukanObjekPajak: boolean;
        l4a: L4ARow[];
        l4b: L4BRow[];
        readonly?: boolean;
    } = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    let pphFinalTotal = $derived(l4a.reduce((total, row) => total + Number(row.dasarPengenaanPajak || 0), 0));
    let bukanObjekPajakTotal = $derived(l4b.reduce((total, row) => total + Number(row.penghasilanBruto || 0), 0));
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">

        <!-- Hidden input field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>1.a.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanPp23" id="{getContext("id")}" value={false} bind:group={menerimaPenghasilanPp23} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanPp23" id="{getContext("id")}" value={true} bind:group={menerimaPenghasilanPp23} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td class="tw:w-[35rem]"></td>
                <td class="tw:w-[30rem]">
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {menerimaPenghasilanPp23 ? "Ya, silahkan mengisi lampiran 5" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                </td>
            </tr>
            <tr>
                <td><span>1.b.</span></td>
                <td><span>Apakah penghasilan Wajib Pajak semata-mata hanya penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="hanyaPenghasilanPp23" id="{getContext("id")}" value={false} bind:group={hanyaPenghasilanPp23} disabled={!menerimaPenghasilanPp23 || readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="hanyaPenghasilanPp23" id="{getContext("id")}" value={true} bind:group={hanyaPenghasilanPp23} disabled={!menerimaPenghasilanPp23 || readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
                <td>
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {hanyaPenghasilanPp23 ? "Ya, silahkan lanjut pertanyaan berikutnya" : "Tidak, jawablah pertanyaan di bagian D di bawah"}
                            </span>
                        {/snippet}
                    </Alert>
                </td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang dikenakan PPh yang bersifat final? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanFinal" id="{getContext("id")}" value={false} bind:group={menerimaPenghasilanFinal} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanFinal" id="{getContext("id")}" value={true} bind:group={menerimaPenghasilanFinal} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(pphFinalTotal)} disabled /></td>
                <td>
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {menerimaPenghasilanFinal ? "Ya, silahkan mengisi Lampiran 4 Bagian A" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                </td>
            </tr>
            <tr>
                <td><span>3.</span></td>
                <td><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang tidak termasuk objek pajak? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanBukanObjekPajak" id="{getContext("id")}" value={false} bind:group={menerimaPenghasilanBukanObjekPajak} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanBukanObjekPajak" id="{getContext("id")}" value={true} bind:group={menerimaPenghasilanBukanObjekPajak} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(bukanObjekPajakTotal)} disabled /></td>
                <td>
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {menerimaPenghasilanBukanObjekPajak ? "Ya, silahkan mengisi Lampiran 4 Bagian B" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                </td>
                <td></td>
            </tr>
            {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) {
            background-color: #F9F6EE;
        }
    }
    td {
        padding: .25rem .5rem;
    }
    span {
        font-size: .8rem;
    }
</style>

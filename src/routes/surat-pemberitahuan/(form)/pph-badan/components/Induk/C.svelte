<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Alert from "$lib/components/Alert.svelte";

    const { data }: {
        data: {
            menerimaPenghasilanPp23: boolean | null;
            hanyaPenghasilanPp23: boolean | null;
            menerimaPenghasilanFinal: boolean | null;
            menerimaPenghasilanBukanObjekPajak: boolean | null;
        }
    } = $props();

    let C1a = $state(data.menerimaPenghasilanPp23 ?? undefined);
    let C1b = $state(data.hanyaPenghasilanPp23 ?? undefined);
    let C2 = $state(data.menerimaPenghasilanFinal ?? undefined);
    let C3 = $state(data.menerimaPenghasilanBukanObjekPajak ?? undefined);
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
                            <input type="radio" name="menerimaPenghasilanPp23" value={false} bind:group={C1a}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanPp23" value={true} bind:group={C1a}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td class="tw:w-[35rem]"></td>
                <td>
                {#if C1a != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {C1a ? "Ya, silahkan mengisi lampiran 5" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>1.b.</span></td>
                <td><span>Apakah penghasilan Wajib Pajak semata-mata hanya penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</span></td>
                <td colspan="2">
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="hanyaPenghasilanPp23" value={false} bind:group={C1b} disabled={!C1a}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="hanyaPenghasilanPp23" value={true} bind:group={C1b} disabled={!C1a}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang dikenakan PPh yang bersifat final? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanFinal" value={false} bind:group={C2}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanFinal" value={true} bind:group={C2}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if C2 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {C2 ? "Ya, silahkan mengisi Lampiran 4 Bagian A" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>3.</span></td>
                <td><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang tidak termasuk objek pajak? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanBukanObjekPajak" value={false} bind:group={C3}>
                            <span>Tidak</span>
                        </Label>
                        <Label class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="menerimaPenghasilanBukanObjekPajak" value={true} bind:group={C3}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if C3 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {C3 ? "Ya, silahkan mengisi Lampiran 4 Bagian B" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
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

<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Alert from "$lib/components/Alert.svelte";
    import { getContext } from "svelte";
    import type { computeIndukDEF } from "./computeIndukDEF";

    interface Props {
        computed: ReturnType<typeof computeIndukDEF>;
        e13AdaKreditPajakLuarNegeri: boolean;
        e14AngsuranPph25TahunBerjalan: number;
        e15StpPph25: number;
        e16FasilitasPenguranganPphTerutang: boolean;
        readonly?: boolean;
    }

    let {
        computed,
        e13AdaKreditPajakLuarNegeri = $bindable(),
        e14AngsuranPph25TahunBerjalan = $bindable(),
        e15StpPph25 = $bindable(),
        e16FasilitasPenguranganPphTerutang = $bindable(),
        readonly = false
    }: Props = $props();

    const rupiah = new Intl.NumberFormat('id-ID');
</script>

<div class="tw:p-5">
    <Table class={"tw:min-w-full"}>

        <!-- Hidden field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>13.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah terdapat kredit pajak yang dibayarkan di luar negeri dan/atau dipotong/pungut oleh pihak lain?</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E13" value={false} bind:group={e13AdaKreditPajakLuarNegeri} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E13" value={true} bind:group={e13AdaKreditPajakLuarNegeri} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td class="tw:w-[35rem]"><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.e13Amt)} disabled /></td>
                <td class="tw:w-[30rem]">
                {#if e13AdaKreditPajakLuarNegeri != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {e13AdaKreditPajakLuarNegeri ? "Ya, silahkan mengisi lampiran 3" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>14.</span></td>
                <td><span>Angsuran PPh Pasal 25</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"rupiah"} bind:value={e14AngsuranPph25TahunBerjalan} disabled={readonly}/></td>
                <td></td>
            </tr>
            <tr>
                <td><span>15.</span></td>
                <td><span>Surat Tagihan Pajak PPh Pasal 25 (hanya pokok pajak)</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"rupiah"} bind:value={e15StpPph25} disabled={readonly}/></td>
                <td></td>
            </tr>
            <tr>
                <td><span>16.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan PPh Badan? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E16" value={false} bind:group={e16FasilitasPenguranganPphTerutang} required disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="E16" value={true} bind:group={e16FasilitasPenguranganPphTerutang} required disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled/></td>
                <td>
                {#if e16FasilitasPenguranganPphTerutang != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                       {/snippet}
                       {#snippet body()}
                        <span>
                        {e16FasilitasPenguranganPphTerutang ? "Ya, silahkan mengisi lampiran 13C" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
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

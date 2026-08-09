<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
	import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import Alert from "$lib/components/Alert.svelte";
    import { getContext } from "svelte";
    import type { computeIndukDEF } from "./computeIndukDEF";

    interface Props {
        computed: ReturnType<typeof computeIndukDEF>;
        g20WajibLaporAngsuranPph25: boolean;
        readonly?: boolean;
    }

    let {
        computed,
        g20WajibLaporAngsuranPph25 = $bindable(),
        readonly = false
    }: Props = $props();

    const rupiah = new Intl.NumberFormat('id-ID');
</script>

<div class="tw:p-5">
    <Table class={"tw:min-w-full"}>

        <!-- Hidden input field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>20.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah Wajib Pajak merupakan Wajib Pajak tertentu yang harus menyampaikan Laporan Perhitungan Angsuran PPh Pasal 25? *</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G20" value={false} bind:group={g20WajibLaporAngsuranPph25} required disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G20" value={true} bind:group={g20WajibLaporAngsuranPph25} required disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td class="tw:w-[35rem]"><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.angsuranPph25TahunDepan)} disabled/></td>
                <td class="tw:w-[30rem]">
                {#if g20WajibLaporAngsuranPph25 != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span class="tw:whitespace-pre-line">
                            {g20WajibLaporAngsuranPph25 ? "Ya, silahkan lanjut pertanyaan berikutnya.\nPastikan anda menyampaikan Laporan Penghitungan PPh Pasal 25." : "Tidak, silahkan mengisi lampiran 6"}
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

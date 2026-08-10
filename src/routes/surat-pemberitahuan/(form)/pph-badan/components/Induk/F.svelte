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
        f17bAdaSkPengangsuranPenundaan: boolean;
        f17bJumlahDiangsurDitunda: number;
        f19aMetodePengembalian: boolean;
        f18a: number;
        f18b: number;
        readonly?: boolean;
    }

    let {
        computed,
        f17bAdaSkPengangsuranPenundaan = $bindable(),
        f17bJumlahDiangsurDitunda = $bindable(),
        f19aMetodePengembalian = $bindable(),
        f18a,
        f18b,
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
                <td class="tw:w-10"><span>17.a.</span></td>
                <td class="tw:w-[40rem]"><span>PPh yang Kurang/Lebih Bayar</span></td>
                <td class="tw:w-[10rem]"></td>
                <td class="tw:w-[35rem]"><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.f17a)} disabled/></td>
                <td class="tw:w-[30rem]"></td>
            </tr>
            <tr>
                <td><span>17.b.</span></td>
                <td><span>Apakah terdapat Surat Keputusan Persetujuan Pengangsuran atau Penundaan Pembayaran Pajak?</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="F17B" value={false} bind:group={f17bAdaSkPengangsuranPenundaan} required disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="F17B" value={true} bind:group={f17bAdaSkPengangsuranPenundaan} required disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"number"} bind:value={f17bJumlahDiangsurDitunda} disabled={readonly || !f17bAdaSkPengangsuranPenundaan}/></td>
                <td>
                {#if f17bAdaSkPengangsuranPenundaan != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {f17bAdaSkPengangsuranPenundaan ? "Ya, silahkan mengisi jumlah pajak yang dapat diangsur/ditunda pembayarannya" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>17.c.</span></td>
                <td><span>PPh yang masih harus dibayar atau lebih dibayar</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.f17c)} disabled/></td>
                <td></td>
            </tr>
            <tr>
                <td><span>18.a.</span></td>
                <td><span>PPh yang kurang atau lebih bayar pada SPT yang dibetulkan</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(f18a)} disabled/></td>
                <td></td>
            </tr>
            <tr>
                <td><span>18.b.</span></td>
                <td><span>PPh yang kurang atau lebih bayar karena pembetulan</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(f18b)} disabled/></td>
                <td></td>
            </tr>
            <tr>
                <td><span>19.a.</span></td>
                <td><span>Lebih bayar pada Angka 17.a. atau 18.b. mohon untuk: (pilih salah satu):*</span></td>
                <td colspan="2">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="F19A" value={false} bind:group={f19aMetodePengembalian} required disabled={readonly}>
                            <span>dikembalikan melalui pemeriksaan</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="F19A" value={true} bind:group={f19aMetodePengembalian} required disabled={readonly}>
                            <span>dikembalikan melalui Pengembalian Pendahuluan</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
        {/snippet}
    </Table>
    <div class="tw:p-2">
        <Card>
            {#snippet head()}
                <span>19.b. Informasi Rekening</span>
            {/snippet}
            {#snippet body()}
            <div class="tw:flex tw:flex-col tw:gap-2">
                <div>
                    <span class="tw:inline-block tw:w-[10rem] tw:text-right">Pilih Rekening Bank</span>
                    <Button class={"tw:min-w-[3rem]!"} --color={'#FFD230'} type={"button"}>
                        <Label class={"tw:w-full tw:h-full"} for={getContext("id")}>
                            <Input type={"file"}></Input>
                            <span>File</span>
                        </Label>
                    </Button>
                    <Button class={"tw:min-w-[3rem]!"} --color={'#FFD230'} type={"button"}>Clear</Button>
                </div>
                <Label>
                    <span class="tw:inline-block tw:w-[10rem] tw:text-right">Nomor Rekening</span>
                    <Input class={"tw:w-[25%]!"} type={"text"} disabled/>
                </Label>
                <Label>
                    <span class="tw:inline-block tw:w-[10rem] tw:text-right">Nama Bank</span>
                    <Input class={"tw:w-[25%]!"} type={"text"} disabled/>
                </Label>
                <Label>
                    <span class="tw:inline-block tw:w-[10rem] tw:text-right">Nama Pemilik Rekening</span>
                    <Input class={"tw:w-[25%]!"} type={"text"} disabled/>
                </Label>
            </div>
            {/snippet}
        </Card>
    </div>
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

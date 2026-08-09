<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Alert from "$lib/components/Alert.svelte";
    import { getContext } from "svelte";
    import type { computeIndukDEF } from "./computeIndukDEF";

    interface Props {
        computed: ReturnType<typeof computeIndukDEF>;
        d5FasilitasPenanamanModal: boolean;
        d6FasilitasBrutoVokasi: boolean;
        d8AdaKompensasiKerugian: boolean;
        d10FasilitasBrutoLitbang: boolean;
        tarifPajak: string;
        persentaseTarifLainnya: number;
        readonly?: boolean;
    }

    let {
        computed,
        d5FasilitasPenanamanModal = $bindable(),
        d6FasilitasBrutoVokasi = $bindable(),
        d8AdaKompensasiKerugian = $bindable(),
        d10FasilitasBrutoLitbang = $bindable(),
        tarifPajak = $bindable(),
        persentaseTarifLainnya = $bindable(),
        readonly = false
    }: Props = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    const tarifPajakOptions = [
        { value: 'pasal_17_1_b', label: 'a. Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh' },
        { value: 'pasal_17_2b', label: 'b. Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh' },
        { value: 'pasal_31e', label: 'c. Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh' },
        { value: 'lainnya', label: 'd. Tarif Pajak Lainnya' }
    ];
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
                <td class="tw:w-10"><span>4.</span></td>
                <td class="tw:w-[40rem]"><span>Penghasilan Neto Fiskal sebelum Fasilitas Pajak</span></td>
                <td class="tw:w-[10rem]"></td>
                <td class="tw:w-[35rem]"><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d4)} disabled /></td>
                <td class="tw:w-[30rem]"></td>
            </tr>
            <tr>
                <td><span>5.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Perpajakan Dalam Rangka Penanaman Modal berupa pengurangan penghasilan neto? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D5" value={false} bind:group={d5FasilitasPenanamanModal} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D5" value={true} bind:group={d5FasilitasPenanamanModal} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if d5FasilitasPenanamanModal != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {d5FasilitasPenanamanModal ? "Ya, silahkan mengisi lampiran 13A" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>6.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan Penghasilan Bruto untuk Kegiatan Praktik Kerja, Pemagangan, dan/atau Pembelajaran Dalam Rangka Pembinaan dan Pengembangan Sumber daya Manusia Berbasis Kompetensi Tertentu? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D6" value={false} bind:group={d6FasilitasBrutoVokasi} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D6" value={true} bind:group={d6FasilitasBrutoVokasi} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d6Amt)} disabled /></td>
                <td>
                {#if d6FasilitasBrutoVokasi != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {d6FasilitasBrutoVokasi ? "Ya, silahkan mengisi lampiran 13B tabel A dan B" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>7.</span></td>
                <td><span>Penghasilan Neto Fiskal Setelah Fasilitas Pajak</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d7)} disabled /></td>
                <td></td>
            </tr>
            <tr>
                <td><span>8.</span></td>
                <td><span>Apakah terdapat kerugian fiskal yang dapat dikompensasikan? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D8" value={false} bind:group={d8AdaKompensasiKerugian} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D8" value={true} bind:group={d8AdaKompensasiKerugian} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d8Amt)} disabled /></td>
                <td>
                {#if d8AdaKompensasiKerugian != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {d8AdaKompensasiKerugian ? "Ya, silahkan mengisi lampiran 7" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>9.</span></td>
                <td><span>Penghasilan Kena Pajak</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d9)} disabled /></td>
                <td></td>
            </tr>
            <tr>
                <td><span>10.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Pnegurangan Penghasilan Bruto untuk kegiatan Penelitian dan Pengembangan Tertentu? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D10" value={false} bind:group={d10FasilitasBrutoLitbang} disabled={readonly}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D10" value={true} bind:group={d10FasilitasBrutoLitbang} disabled={readonly}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d10Amt)} disabled /></td>
                <td>
                {#if d10FasilitasBrutoLitbang != undefined}
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {d10FasilitasBrutoLitbang ? "Ya, silahkan mengisi lampiran 13B tabel C dan D" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
                            </span>
                        {/snippet}
                    </Alert>
                {/if}
                </td>
            </tr>
            <tr>
                <td><span>11.</span></td>
                <td><span>Tarif Pajak *</span></td>
                <td></td>
                <td>
                    <Select class={"tw:invalid:text-gray-500"} bind:value={tarifPajak} required disabled={readonly}>
                        {#each tarifPajakOptions as tarif}
                            <option class="tw:text-black" value={tarif.value}>{tarif.label}</option>
                        {/each}
                    </Select>
                    {#if tarifPajak === 'lainnya'}
                        <div class="tw:mt-2 tw:flex tw:items-center tw:gap-2">
                            <span>Persentase:</span>
                            <Input class={"tw:w-[10rem]! tw:text-end"} type={"number"} bind:value={persentaseTarifLainnya} disabled={readonly}/>
                            <span>%</span>
                        </div>
                    {/if}
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>12.</span></td>
                <td><span>PPh Terutang *</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={rupiah.format(computed.d12)} disabled /></td>
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

<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Alert from "$lib/components/Alert.svelte";
    import { getContext } from "svelte";

    let D5 = $state();
    let D6 = $state();
    let D8 = $state();
    let D10 = $state();
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
                <td class="tw:w-[35rem]"><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td></td>
            </tr>
            <tr>
                <td><span>5.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Perpajakan Dalam Rangka Penanaman Modal berupa pengurangan penghasilan neto? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D5" value={false} bind:group={D5} defaultChecked>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D5" value={true} bind:group={D5}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if D5 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {D5 ? "Ya, silahkan mengisi lampiran 13A" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
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
                            <input type="radio" name="D6" value={false} bind:group={D6} defaultChecked>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D6" value={true} bind:group={D6}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if D6 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {D6 ? "Ya, silahkan mengisi lampiran 13B tabel A dan B" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
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
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td></td>
            </tr>
            <tr>
                <td><span>8.</span></td>
                <td><span>Apakah terdapat kerugian fiskal yang dapat dikompensasikan? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D8" value={false} bind:group={D8} defaultChecked>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D8" value={true} bind:group={D8}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if D8 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {D8 ? "Ya, silahkan mengisi lampiran 7" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
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
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td></td>
            </tr>
            <tr>
                <td><span>10.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh Fasilitas Pnegurangan Penghasilan Bruto untuk kegiatan Penelitian dan Pengembangan Tertentu? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D10" value={false} bind:group={D10} defaultChecked>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="D10" value={true} bind:group={D10}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
                <td>
                {#if D10 != undefined}    
                    <Alert bg={"var(--color-primary)"}>
                        {#snippet head()}
                            <span>i</span>
                        {/snippet}
                        {#snippet body()}
                            <span>
                            {D10 ? "Ya, silahkan mengisi lampiran 13A tabel C dan D" : "Tidak, silahkan lanjut pertanyaan berikutnya"}
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
                    <Select class={"tw:invalid:text-gray-500"} required>
                        <option value="" selected disabled hidden>Select a tax rate</option>
                        {#each [
                            "Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh",
                            "Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh",
                            "Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh",
                            "Tarif Pajak Lainnya"
                        ] as tarif, index}
                            <option class="tw:text-black" value={index}>{tarif}</option>
                        {/each}
                    </Select>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>12.</span></td>
                <td><span>PPh Terutang *</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled /></td>
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
<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
	import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import { getContext } from "svelte";

    let G21A = $state(false);
    let G21B = $state(false);
    let G21C = $state(false);
    let G21D = $state(false);
    let G21E = $state(false);
    let G21F = $state(false);
    let G21G = $state(false);
    let G21H = $state(false);
    let G21I = $state(false);
    let G21J = $state(false);
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
                <td class="tw:w-10"><span>21.a.</span></td>
                <td class="tw:w-[40rem]"><span>Apakah terdapat transaksi yang dipengaruhi hubungan istimewa atau transaksi dengan pihak yang merupakan penduduk tax haven country?</span></td>
                <td class="tw:w-[10rem]">
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21A" value={false} bind:group={G21A} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21A" value={true} bind:group={G21A} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.b.</span></td>
                <td><span>Apakah Wajib Pajak berkewajiban menyampaikan Dokumen Penentuan Harga Transfer? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21B" value={false} bind:group={G21B} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21B" value={true} bind:group={G21B} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.c.</span></td>
                <td><span>Apakah terdapat penanaman modal pada perusahaan afiliasi? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21C" value={false} bind:group={G21C} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21C" value={true} bind:group={G21C} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.d.</span></td>
                <td><span>Apakah Wajib Pajak memiliki utang dari pemilik modal atau perusahaan afiliasi, dan/atau piutang ke pemilik modal atau perusahaan afiliasi? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21D" value={false} bind:group={G21D} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21D" value={true} bind:group={G21D} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.e.</span></td>
                <td><span>Apakah Wajib Pajak membebankan biaya penyusutan dan/atau amortisasi fiskal? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21E" value={false} bind:group={G21E} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21E" value={true} bind:group={G21E} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.f.</span></td>
                <td><span>Apakah Wajib Pajak membebankan biaya entertainment, biaya promosi dan penjualan, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, dan piutang yang nyata-nyata tidak dapat ditagih? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21F" value={false} bind:group={G21F} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21F" value={true} bind:group={G21F} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.g.</span></td>
                <td><span>Apakah Wajib Pajak memperoleh fasilitas perpajakan dalam rangka penanaman modal di bidang-bidang usaha tertentu dan/atau daerah-daerah tertentu selain pengurangan penghasilan neto *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21G" value={false} bind:group={G21G} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21G" value={true} bind:group={G21G} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.h.</span></td>
                <td><span>Apakah Wajib Pajak memiliki sisa lebih yang digunakan untuk pembangunan dan pengadaan sarana dan prasarana? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21H" value={false} bind:group={G21H} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21H" value={true} bind:group={G21H} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.i.</span></td>
                <td><span>Apakah Wajib Pajak menerima atau memperoleh penghasilan dividen dari luar negeri dan melaporkannya sebagai penghasilan yang tidak termasuk objek pajak? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21I" value={false} bind:group={G21I} required>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="G21I" value={true} bind:group={G21I} required>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td><span>21.j.</span></td>
                <td><span>Kelebihan PPh yang bersifat final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diajukan pengembalian pajak *</span></td>
                <td></td>
                <td><Input class={"tw:text-end"} type={"text"} value={0} disabled/></td>
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
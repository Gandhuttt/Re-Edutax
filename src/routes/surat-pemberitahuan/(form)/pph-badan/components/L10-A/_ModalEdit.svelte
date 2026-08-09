<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { L10ARow } from "./types";

    let {
        data = $bindable(),
        saveItem,
        negaraOptions,
        bentukHubunganOptions,
        jenisTransaksiOptions,
        metodeHargaTransferOptions,
        readonly = false
    }: {
        data: Partial<L10ARow>;
        saveItem: () => void;
        negaraOptions: { value: string; label: string }[];
        bentukHubunganOptions: { value: string; label: string }[];
        jenisTransaksiOptions: { value: string; label: string }[];
        metodeHargaTransferOptions: { value: string; label: string }[];
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<div class="modal fade" id="modalL10A" tabindex="-1" aria-labelledby="modalL10ALabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalL10ALabel">EDIT TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nama *</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.nama} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">NPWP/TIN</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.npwpTin} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Negara</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.negara} disabled={readonly}>
                        <option value="" selected hidden>Please Select</option>
                        {#each negaraOptions as negara}
                        <option value={negara.value}>{negara.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Bentuk Hubungan *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.bentukHubungan} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each bentukHubunganOptions as bentukHubungan}
                        <option value={bentukHubungan.value}>{bentukHubungan.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Kegiatan Usaha</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.kegiatanUsaha} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Jenis Transaksi *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.jenisTransaksi} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each jenisTransaksiOptions as jenisTransaksi}
                        <option value={jenisTransaksi.value}>{jenisTransaksi.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nilai Transaksi *</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.nilaiTransaksi} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Metode Penentuan Harga Transfer yang Digunakan *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.metodePenentuanHargaTransfer} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each metodeHargaTransferOptions as metode}
                        <option value={metode.value}>{metode.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Alasan Penggunaan Metode</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.alasanPenggunaanMetode} disabled={readonly}/>
                </Label>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" onclick={handleSave} data-bs-dismiss="modal" disabled={readonly}>Simpan</button>
        </div>
        </div>
    </div>
</div>

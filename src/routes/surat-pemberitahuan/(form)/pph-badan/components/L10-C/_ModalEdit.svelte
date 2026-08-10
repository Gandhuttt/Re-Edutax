<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { L10CRow } from "./types";

    let {
        data = $bindable(),
        saveItem,
        negaraOptions,
        jenisTransaksiOptions,
        readonly = false
    }: {
        data: Partial<L10CRow>;
        saveItem: () => void;
        negaraOptions: { value: string; label: string }[];
        jenisTransaksiOptions: { value: string; label: string }[];
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<div class="modal fade" id="modalL10C" tabindex="-1" aria-labelledby="modalL10CLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalL10CLabel">EDIT TRANSAKSI DENGAN PIHAK TAX HAVEN COUNTRY</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nama Mitra Transaksi *</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.namaMitraTransaksi} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Jenis Transaksi *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.jenisTransaksi} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each jenisTransaksiOptions as jenisTransaksi}
                        <option class="tw:text-black!" value={jenisTransaksi.value}>{jenisTransaksi.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Negara *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.negara} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each negaraOptions as negara}
                        <option value={negara.value}>{negara.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nilai Transaksi *</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.nilaiTransaksi} disabled={readonly}>Rp.</InputGroup>
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

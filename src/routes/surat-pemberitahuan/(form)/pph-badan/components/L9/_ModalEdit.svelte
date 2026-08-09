<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import Select from "$lib/components/Select.svelte";
    import type { L9Row } from "./types";

    let {
        data = $bindable(),
        saveItem,
        jenisHartaOptions,
        metodeKomersialOptions,
        metodeFiskalOptions,
        readonly = false
    }: {
        data: Partial<L9Row>;
        saveItem: () => void;
        jenisHartaOptions: { value: string; label: string }[];
        metodeKomersialOptions: { value: string; label: string }[];
        metodeFiskalOptions: { value: string; label: string }[];
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<div class="modal fade" id="modalL9" tabindex="-1" aria-labelledby="modalL9Label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">EDIT PENYUSUTAN DAN AMORTISASI FISKAL</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Kode Harta</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.kodeHarta} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Jenis Harta *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.jenisHarta} required disabled={readonly}>
                        <option value="" selected disabled hidden>Please Select</option>
                        {#each jenisHartaOptions as jenisHarta}
                        <option value={jenisHarta.value}>{jenisHarta.label}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Bulan / Tahun Perolehan *</span>
                    <Input class={"tw:flex-1"} type={"month"} bind:value={data.bulanTahunPerolehan} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Biaya Perolehan *</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.hargaPerolehan} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nilai Sisa Buku Fiskal Pada Awal Tahun</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.nilaiSisaBukuFiskalAwalTahun} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Metode Penyusutan/Amortisasi</span>
                    <div class="tw:flex tw:flex-col tw:w-[20rem] tw:gap-1">
                        <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                            <span class="tw:block tw:w-[10rem]">KOMERSIAL</span>
                            <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.metodePenyusutanKomersial} disabled={readonly}>
                                <option value="" selected disabled hidden>Please Select</option>
                                {#each metodeKomersialOptions as metode}
                                <option value={metode.label}>{metode.label}</option>
                                {/each}
                            </Select>
                        </Label>
                        <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                            <span class="tw:block tw:w-[10rem]">FISKAL</span>
                            <Select class={"tw:flex-1 tw:invalid:text-gray-500"} bind:value={data.metodePenyusutanFiskal} disabled={readonly}>
                                <option value="" selected hidden disabled>Please Select</option>
                                {#each metodeFiskalOptions as metode}
                                <option value={metode.label}>{metode.label}</option>
                                {/each}
                            </Select>
                        </Label>
                    </div>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Penyusutan/Amortisasi Fiskal Tahun Ini</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.penyusutanAmortisasiFiskalTahunIni} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Penyusutan/Amortisasi Komersial Tahun Ini</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.penyusutanAmortisasiKomersialTahunIni} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Akumulasi Penyusutan/Amortisasi Fiskal</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.akumulasiPenyusutanAmortisasiFiskal} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nilai Sisa Buku Fiskal Pada Akhir Tahun</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.nilaiSisaBukuFiskalAkhirTahun} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Keterangan</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.keterangan} disabled={readonly}/>
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

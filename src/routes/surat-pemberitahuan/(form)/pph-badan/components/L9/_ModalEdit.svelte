<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import Select from "$lib/components/Select.svelte";
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
                    <Input class={"tw:flex-1"} type={"text"} value={"2017"} readonly/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Jenis Harta *</span>
                    <Select class={"tw:flex-1 tw:invalid:text-gray-500"} required>
                        <option value="" selected disabled hidden>Please Select</option>
                    </Select>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Bulan / Tahun Perolehan *</span>
                    <Input class={"tw:flex-1"} type={"date"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Biaya Perolehan *</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} value={5000000}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nilai Sisa Buku Fiskal Pada Awal Tahun</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} value={5000000}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Metode Penyusutan/Amortisasi</span>
                    <div class="tw:flex tw:flex-col tw:w-[20rem] tw:gap-1">
                        <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                            <span class="tw:block tw:w-[10rem]">KOMERSIAL</span>
                            <Select class={"tw:flex-1 tw:invalid:text-gray-500"} required>
                                <option value="" selected disabled hidden>Please Select</option>
                            </Select>
                        </Label>
                        <Label class={"tw:flex! tw:flex-row tw:items-center"}>
                            <span class="tw:block tw:w-[10rem]">FISKAL</span>
                            <Select class={"tw:flex-1 tw:invalid:text-gray-500"} required>
                                <option value="" selected hidden disabled>Please Select</option>
                            </Select>
                        </Label>
                    </div>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Penyusutan/Amortisasi Fiskal Tahun Ini</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} value={5000000}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Keterangan</span>
                    <Input class={"tw:flex-1"} type={"text"}/>
                </Label>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary">Simpan</button>
        </div>
        </div>
    </div>
</div>
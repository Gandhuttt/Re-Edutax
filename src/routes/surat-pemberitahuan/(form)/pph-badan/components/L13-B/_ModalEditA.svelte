<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import type { L13BARow } from "./types";

    let {
        data = $bindable(),
        saveItem,
        readonly = false
    }: {
        data: Partial<L13BARow>;
        saveItem: () => void;
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<div class="modal fade" id="modalL13BA" tabindex="-1" aria-labelledby="modalL13BALabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalL13BALabel">EDIT PERJANJIAN KERJA SAMA</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nomor Perjanjian</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.perjanjianNomor} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Tanggal Perjanjian</span>
                    <Input class={"tw:flex-1"} type={"date"} bind:value={data.perjanjianTanggal} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Mitra Kegiatan</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.mitraKegiatan} disabled={readonly}/>
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

<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
</script>

<div class="modal fade" id="modalL13C" tabindex="-1" aria-labelledby="modalL13CLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalL13CLabel">EDIT FASILITAS PAJAK UNTUK PENGURANGAN PAJAK PENGHASILAN BADAN</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nomor Keputusan Pemberian Fasilitas</span>
                    <Input class={"tw:flex-1"} type={"text"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Tanggal Keputusan Pemberian Fasilitas</span>
                    <Input class={"tw:flex-1"} type={"date"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Nomor Keputusan Pemanfaatan Fasilitas</span>
                    <Input class={"tw:flex-1"} type={"text"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Tanggal Keputusan Pemanfaatan Fasilitas</span>
                    <Input class={"tw:flex-1"} type={"date"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Jangka Waktu Fasilitas (Tahun)</span>
                    <Input class={"tw:flex-1"} type={"text"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Pemanfaatan Tahun Ke-</span>
                    <Input class={"tw:flex-1"} type={"text"}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Persentase Pengurangan PPh</span>
                    <InputGroup class={"tw:text-right"} type={"number"}>%</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Penghasilan Kena Pajak</span>
                    <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">PPh Terutang</span>
                    <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[20rem]">Besaran Fasilitas Pengurangan PPh Terutang</span>
                    <InputGroup class={"tw:text-right"} type={"number"} disabled>Rp.</InputGroup>
                </Label>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Simpan</button>
        </div>
        </div>
    </div>
</div>

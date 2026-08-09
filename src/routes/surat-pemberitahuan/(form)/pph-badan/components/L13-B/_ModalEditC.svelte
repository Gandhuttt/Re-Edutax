<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import type { L13BCRow } from "./types";

    let {
        data = $bindable(),
        saveItem,
        readonly = false
    }: {
        data: Partial<L13BCRow>;
        saveItem: () => void;
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }

    const rupiah = new Intl.NumberFormat('id-ID');

    let tambahanPengurang = $derived(
        Math.round((Number(data.jumlahBiaya || 0) * Number(data.persentaseFasilitasPajak || 0)) / 100)
    );
</script>

<div class="modal fade" id="modalL13BC" tabindex="-1" aria-labelledby="modalL13BCLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalL13BCLabel">EDIT FASILITAS PENELITIAN DAN PENGEMBANGAN</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-1">
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Nomor Proposal</span>
                    <Input class={"tw:flex-1"} type={"text"} bind:value={data.nomorProposal} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Jangka Waktu Pengeluaran Biaya - Dari Tahun</span>
                    <Input class={"tw:flex-1"} type={"number"} bind:value={data.jangkaWaktuDariTahun} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Jangka Waktu Pengeluaran Biaya - Sampai Tahun</span>
                    <Input class={"tw:flex-1"} type={"number"} bind:value={data.jangkaWaktuSampaiTahun} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Jumlah Biaya</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.jumlahBiaya} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tahun Perolehan Hak Kekayaan Intelektual / Komersialisasi</span>
                    <Input class={"tw:flex-1"} type={"number"} bind:value={data.tahunPerolehanHki} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Persentase Fasilitas Pajak (%)</span>
                    <Input class={"tw:flex-1 tw:text-right"} type={"number"} bind:value={data.persentaseFasilitasPajak} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
                    <span class="tw:block tw:w-[25rem]">Tambahan Pengurangan Penghasilan Bruto Penelitian dan Pengembangan</span>
                    <InputGroup class={"tw:flex-1 tw:text-right"} type={"text"} value={rupiah.format(tambahanPengurang)} readonly>Rp.</InputGroup>
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

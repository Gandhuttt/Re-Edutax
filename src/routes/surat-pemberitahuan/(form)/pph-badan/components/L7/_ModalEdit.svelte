<script lang="ts">
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";

    type Row = {
        tahunPajak: number;
        labaRugiNetoFiskal: number;
        kompensasiYMin4: number;
        kompensasiYMin3: number;
        kompensasiYMin2: number;
        kompensasiYMin1: number;
        kompensasiTahunIni: number;
        kompensasiYPlus1: number;
    };

    let {
        data = $bindable(),
        saveItem,
        readonly = false
    }: {
        data: Row;
        saveItem: () => void;
        readonly?: boolean;
    } = $props();

    function handleSave(): void {
        saveItem();
    }
</script>

<div class="modal fade" id="modalL7" tabindex="-1" aria-labelledby="modalL7Label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">SPT Pajak Penghasilan Badan</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="tw:flex tw:flex-col tw:gap-5">
                <Label class={"tw:w-full"}>
                    <span>TAHUN/BAGIAN TAHUN PAJAK</span>
                    <Input type={"text"} value={data.tahunPajak} readonly/>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>LABA (RUGI) NETTO FISKAL</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.labaRugiNetoFiskal} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL Y-4</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiYMin4} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL Y-3</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiYMin3} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL Y-2</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiYMin2} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL Y-1</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiYMin1} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL TAHUN PAJAK INI</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiTahunIni} disabled={readonly}>Rp.</InputGroup>
                </Label>
                <Label class={"tw:w-full"}>
                    <span>KOMPENSASI KERUGIAN FISKAL Y+1</span>
                    <InputGroup class={"tw:text-right"} type={"number"} bind:value={data.kompensasiYPlus1} disabled={readonly}>Rp.</InputGroup>
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

<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Input from "$lib/components/Input.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        dasarAngsuran: number;
        kompensasiKerugian: number;
        pphTerutang: number;
        kreditPajakTahunLalu: number;
        readonly?: boolean;
    }

    let {
        currentTab = $bindable(),
        dasarAngsuran = $bindable(),
        kompensasiKerugian = $bindable(),
        pphTerutang = $bindable(),
        kreditPajakTahunLalu = $bindable(),
        readonly = false
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L6" ? "ANGSURAN PAJAK PENGHASILAN TAHUN PAJAK BERJALAN" : currentTab.title})

    const rupiah = new Intl.NumberFormat('id-ID');

    let penghasilanKenaPajak = $derived(Number(dasarAngsuran || 0) - Number(kompensasiKerugian || 0));
    let pphDibayarSendiri = $derived(Number(pphTerutang || 0) - Number(kreditPajakTahunLalu || 0));
    let angsuranPph25 = $derived(Math.floor(pphDibayarSendiri / 12));
</script>

<div class="tw:mt-5 {currentTab.tab === "L6" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <span class="tw:font-bold">ANGSURAN PAJAK PENGHASILAN TAHUN PAJAK BERJALAN</span>
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:gap-10">
            <div class="tw:w-full tw:flex tw:flex-col">
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">1. PENHGASILAN YANG MENJADI DASAR PENGHITUNGAN ANGSURAN</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"number"} bind:value={dasarAngsuran} disabled={readonly}/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">2. KOMPENSASI KERUGIAN FISKAL (Diisi dari Formulir Lampiran-07 Jumlah Kompensasi Kerugian Fiskal Tahun Pajak Berjalan)</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"number"} bind:value={kompensasiKerugian} disabled={readonly}/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">3. PENGHASILAN KENA PAJAK</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={rupiah.format(penghasilanKenaPajak)} readonly/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">4. PPh YANG TERUTANG</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"number"} bind:value={pphTerutang} disabled={readonly}/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">5. KREDIT PAJAK TAHUN PAJAK YANG LALU ATAS PENGHASILAN YANG TERMAUSK DALAM ANGKA 1 YANG DIPOTONG/DIPUNGUT PIHAK LAIN</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"number"} bind:value={kreditPajakTahunLalu} disabled={readonly}/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">6. PPh YANG HARUS DIBAYAR SENDIRI</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={rupiah.format(pphDibayarSendiri)} readonly/>
                    </div>
                </div>
                <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
                    <span class="tw:block tw:w-[75rem]">7. ANGSURAN PPh PASAL 25</span>
                    <div class="tw:flex tw:flex-row tw:items-center">
                        <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
                        <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={rupiah.format(angsuranPph25)} readonly/>
                    </div>
                </div>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

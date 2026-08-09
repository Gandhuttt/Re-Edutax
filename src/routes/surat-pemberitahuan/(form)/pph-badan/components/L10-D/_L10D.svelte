<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        dokumenIndukA: boolean;
        dokumenIndukB: boolean;
        dokumenIndukC: boolean;
        dokumenIndukD: boolean;
        dokumenIndukE: boolean;
        dokumenLokalA: boolean;
        dokumenLokalB: boolean;
        dokumenLokalC: boolean;
        dokumenLokalD: boolean;
        dokumenLokalE: boolean;
        tanggalDokumenIndukTersedia: string;
        tanggalDokumenLokalTersedia: string;
        readonly?: boolean;
    }

    let {
        currentTab = $bindable(),
        dokumenIndukA = $bindable(),
        dokumenIndukB = $bindable(),
        dokumenIndukC = $bindable(),
        dokumenIndukD = $bindable(),
        dokumenIndukE = $bindable(),
        dokumenLokalA = $bindable(),
        dokumenLokalB = $bindable(),
        dokumenLokalC = $bindable(),
        dokumenLokalD = $bindable(),
        dokumenLokalE = $bindable(),
        tanggalDokumenIndukTersedia = $bindable(),
        tanggalDokumenLokalTersedia = $bindable(),
        readonly = false
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-D" ? "IKHTISAR DOKUMEN INDUK DAN DOKUMEN LOKAL" : currentTab.title})
</script>

<div class="tw:mt-5 {currentTab.tab === "L10-D" ? "" : "tw:hidden"}">
    <Card>
        {#snippet head()}
        <!-- svelte-ignore block_empty -->
        {/snippet}
        {#snippet body()}
        <div class="tw:flex tw:flex-col tw:p-5 tw:gap-10">
            <!-- Dokumen Induk -->
            <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col">
                    <span class="tw:font-bold">I. IKHTISAR DOKUMEN INDUK</span>
                    <span>Bahwasanya kami telah menyelenggarakan dokumen induk yang menjadi dasar penerapan Prinsip Kewajaran dan Kelaziman Usaha (arm's length principle), yang memuat informasi mengenai grup usaha sebagai berikut:</span>
                </div>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenIndukA} disabled={readonly}/>
                    <span>Struktur dan bagan kepemilikan grup usaha serta negara atau yurisdiksi masing-masing anggota grup usaha</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenIndukB} disabled={readonly}/>
                    <span>Kegiatan usaha yang dilakukan oleh grup usaha</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenIndukC} disabled={readonly}/>
                    <span>Harta tidak berwujud yang dimiliki grup usaha</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenIndukD} disabled={readonly}/>
                    <span>Aktivitas pembiayaan dan keuangan dalam grup usaha</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenIndukE} disabled={readonly}/>
                    <span>Laporan keuangan konsolidasi entitas induk dan informasi perpajakan terkait transaksi afiliasi</span>
                </Label>
            </div>

            <!-- Dokumen Lokal -->
             <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col">
                    <span class="tw:font-bold">II. IKHTISAR DOKUMEN LOKAL</span>
                    <span>Bahwasanya kami telah menyelenggarakan dokumen lokal yang menjadi dasar penerapan Prinsip Kewajaran dan Kelaziman Usaha (arm's length principle), yang memuat informasi mengenai grup usaha sebagai berikut:</span>
                </div>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenLokalA} disabled={readonly}/>
                    <span>Identitas dan kegiatan usaha yang dilakukan Wajib Pajak</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenLokalB} disabled={readonly}/>
                    <span>Informasi transaksi afiliasi dan transaksi independen yang dilakukan Wajib Pajak</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenLokalC} disabled={readonly}/>
                    <span>Penerapan prinsip kewajaran dan kelaziman usaha</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenLokalD} disabled={readonly}/>
                    <span>Informasi Keuangan Wajib Pajak</span>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2"}>
                    <Input type={"checkbox"} bind:checked={dokumenLokalE} disabled={readonly}/>
                    <span>Peristiwa-peristiwa/kejadian-kejadian/fakta-fakta non keuangan yang mempengaruhi pembentukan harga atau tingkat laba</span>
                </Label>
            </div>

            <!-- Pernyataan -->
             <div class="tw:w-full tw:flex tw:flex-col tw:gap-3">
                <div class="tw:flex tw:flex-col">
                    <span class="tw:font-bold">III. PERNYATAAN PENYELENGGARAN DAN PENYEDIAAN DOKUMEN INDUK DAN DOKUMEN LOKAL</span>
                    <span>Bahwasanya kami telah menyelenggarakan dokumen induk dan dokumen lokal berdasarkan data dan informasi yang tersedia saat dilakukannya Transaksi Afililasi, dan:</span>
                </div>
                <Label class={"tw:flex! tw:items-center tw:gap-2 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)"}>
                    <span class="tw:block tw:w-[50rem]">1. Dokumen Induk telah tersedia pada tanggal:</span>
                    <Input class={"tw:w-50!"} type={"date"} bind:value={tanggalDokumenIndukTersedia} disabled={readonly}/>
                </Label>
                <Label class={"tw:flex! tw:items-center tw:gap-2 tw:p-2 tw:border-b-1 tw:border-(--color-disabled)"}>
                    <span class="tw:block tw:w-[50rem]">2. Dokumen Lokal telah tersedia pada tanggal:</span>
                    <Input class={"tw:w-50!"} type={"date"} bind:value={tanggalDokumenLokalTersedia} disabled={readonly}/>
                </Label>
            </div>
        </div>
        {/snippet}
    </Card>
</div>

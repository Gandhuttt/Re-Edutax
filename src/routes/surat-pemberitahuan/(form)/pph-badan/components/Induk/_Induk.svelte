<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Header from "./_Header.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import D from "./D.svelte";
    import E from "./E.svelte";
    import F from "./F.svelte";
    import G from "./G.svelte";
    import H from "./H.svelte";
    import I from "./I.svelte";
    import J from "./J.svelte";
    import type { getSptPphBadan } from "../../getSptPphBadan.remote";
    import type { computeIndukDEF } from "./computeIndukDEF";

    type pphInterface = Awaited<ReturnType<typeof getSptPphBadan>>;
    type sptType = pphInterface['spt'];
    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        spt: sptType;
        readonly: boolean;
        sektorUsaha: string;
        menerimaPenghasilanPp23: boolean;
        hanyaPenghasilanPp23: boolean;
        menerimaPenghasilanFinal: boolean;
        menerimaPenghasilanBukanObjekPajak: boolean;
        l4a: { dasarPengenaanPajak: number }[];
        l4b: { penghasilanBruto: number }[];
        computed: ReturnType<typeof computeIndukDEF>;
        d5FasilitasPenanamanModal: boolean;
        d6FasilitasBrutoVokasi: boolean;
        d8AdaKompensasiKerugian: boolean;
        d10FasilitasBrutoLitbang: boolean;
        tarifPajak: string;
        persentaseTarifLainnya: number;
        e13AdaKreditPajakLuarNegeri: boolean;
        e14AngsuranPph25TahunBerjalan: number;
        e15StpPph25: number;
        e16FasilitasPenguranganPphTerutang: boolean;
        f17bAdaSkPengangsuranPenundaan: boolean;
        f17bJumlahDiangsurDitunda: number;
        f19aMetodePengembalian: boolean;
        f18a: number;
        f18b: number;
        g20WajibLaporAngsuranPph25: boolean;
        h21aTransaksiHubunganIstimewa: boolean;
        h21bDokumenPenentuanHargaTransfer: boolean;
        h21cPenanamanModalAfiliasi: boolean;
        h21dUtangPiutangAfiliasi: boolean;
        h21ePenyusutanAmortisasiFiskal: boolean;
        h21fBiayaEntertainment: boolean;
        h21gFasilitasPenanamanModalDaerahTertentu: boolean;
        h21hSisaLebihSaranaPrasarana: boolean;
        h21iDividenLuarNegeri: boolean;
    }

    let {
        currentTab = $bindable(),
        spt,
        readonly,
        sektorUsaha = $bindable(),
        menerimaPenghasilanPp23 = $bindable(),
        hanyaPenghasilanPp23 = $bindable(),
        menerimaPenghasilanFinal = $bindable(),
        menerimaPenghasilanBukanObjekPajak = $bindable(),
        l4a,
        l4b,
        computed,
        d5FasilitasPenanamanModal = $bindable(),
        d6FasilitasBrutoVokasi = $bindable(),
        d8AdaKompensasiKerugian = $bindable(),
        d10FasilitasBrutoLitbang = $bindable(),
        tarifPajak = $bindable(),
        persentaseTarifLainnya = $bindable(),
        e13AdaKreditPajakLuarNegeri = $bindable(),
        e14AngsuranPph25TahunBerjalan = $bindable(),
        e15StpPph25 = $bindable(),
        e16FasilitasPenguranganPphTerutang = $bindable(),
        f17bAdaSkPengangsuranPenundaan = $bindable(),
        f17bJumlahDiangsurDitunda = $bindable(),
        f19aMetodePengembalian = $bindable(),
        f18a,
        f18b,
        g20WajibLaporAngsuranPph25 = $bindable(),
        h21aTransaksiHubunganIstimewa = $bindable(),
        h21bDokumenPenentuanHargaTransfer = $bindable(),
        h21cPenanamanModalAfiliasi = $bindable(),
        h21dUtangPiutangAfiliasi = $bindable(),
        h21ePenyusutanAmortisasiFiskal = $bindable(),
        h21fBiayaEntertainment = $bindable(),
        h21gFasilitasPenanamanModalDaerahTertentu = $bindable(),
        h21hSisaLebihSaranaPrasarana = $bindable(),
        h21iDividenLuarNegeri = $bindable()
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === 'Induk' ? 'sigma' : currentTab.title});
</script>

<div class="{currentTab.tab === "Induk" ? "" : "tw:hidden"}">
    <div class="accordion">
        <Accordion item={"HEADER"}><Header data={spt} {readonly} /></Accordion>
        <Accordion item={"A. IDENTITAS WAJIB PAJAK"}><A data={spt} {readonly}/></Accordion>
        <Accordion item={"B. INFORMASI LAPORAN KEUANGAN"} ><B data={spt} {readonly} bind:sektorUsaha/></Accordion>
        <Accordion item={"C. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL DAN TIDAK TERMASUK OBJEK PAJAK"}>
            <C
                bind:menerimaPenghasilanPp23
                bind:hanyaPenghasilanPp23
                bind:menerimaPenghasilanFinal
                bind:menerimaPenghasilanBukanObjekPajak
                {l4a}
                {l4b}
                {readonly}
            />
        </Accordion>
        <Accordion item={"D. PENGHITUNGAN PPh"}>
            <D
                {computed}
                bind:d5FasilitasPenanamanModal
                bind:d6FasilitasBrutoVokasi
                bind:d8AdaKompensasiKerugian
                bind:d10FasilitasBrutoLitbang
                bind:tarifPajak
                bind:persentaseTarifLainnya
                {readonly}
            />
        </Accordion>
        <Accordion item={"E. PENGURANGAN PPh TERUTANG"}>
            <E
                {computed}
                bind:e13AdaKreditPajakLuarNegeri
                bind:e14AngsuranPph25TahunBerjalan
                bind:e15StpPph25
                bind:e16FasilitasPenguranganPphTerutang
                {readonly}
            />
        </Accordion>
        <Accordion item={"F. PPh KURANG/LEBIH BAYAR"}>
            <F
                {computed}
                bind:f17bAdaSkPengangsuranPenundaan
                bind:f17bJumlahDiangsurDitunda
                bind:f19aMetodePengembalian
                {f18a}
                {f18b}
                {readonly}
            />
        </Accordion>
        <Accordion item={"G. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN BERJALAN"}>
            <G {computed} bind:g20WajibLaporAngsuranPph25 {readonly} />
        </Accordion>
        <Accordion item={"H. PERNYATAAN TRANSAKSI"}>
            <H
                bind:h21aTransaksiHubunganIstimewa
                bind:h21bDokumenPenentuanHargaTransfer
                bind:h21cPenanamanModalAfiliasi
                bind:h21dUtangPiutangAfiliasi
                bind:h21ePenyusutanAmortisasiFiskal
                bind:h21fBiayaEntertainment
                bind:h21gFasilitasPenanamanModalDaerahTertentu
                bind:h21hSisaLebihSaranaPrasarana
                bind:h21iDividenLuarNegeri
                {readonly}
            />
        </Accordion>
        <Accordion item={"I. LAMPIRAN LAINNYA"}><I/></Accordion>
        <Accordion item={"J. PERNYATAAN"}><J/></Accordion>
    </div>
</div>

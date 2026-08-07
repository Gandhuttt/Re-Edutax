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
    }

    let {
        currentTab = $bindable(),
        spt,
        readonly,
        sektorUsaha = $bindable()
    }: Props = $props();
    
    $effect(() => {currentTab.title = currentTab.tab === 'Induk' ? 'sigma' : currentTab.title});
</script>

<div class="{currentTab.tab === "Induk" ? "" : "tw:hidden"}">
    <div class="accordion">
        <Accordion item={"HEADER"}><Header data={spt} {readonly} /></Accordion>
        <Accordion item={"A. IDENTITAS WAJIB PAJAK"}><A data={spt} {readonly}/></Accordion>
        <Accordion item={"B. INFORMASI LAPORAN KEUANGAN"} ><B data={spt} {readonly} bind:sektorUsaha/></Accordion>
        <Accordion item={"C. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL DAN TIDAK TERMASUK OBJEK PAJAK"}><C data={spt}/></Accordion>
        <Accordion item={"D. PENGHITUNGAN PPh"}><D/></Accordion>
        <Accordion item={"E. PENGURANGAN PPh TERUTANG"}><E/></Accordion>
        <Accordion item={"F. PPh KURANG/LEBIH BAYAR"}><F/></Accordion>
        <Accordion item={"G. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN BERJALAN"}><G/></Accordion>
        <Accordion item={"H. PERNYATAAN TRANSAKSI"}><H/></Accordion>
        <Accordion item={"I. LAMPIRAN LAINNYA"}><I/></Accordion>
        <Accordion item={"J. PERNYATAAN"}><J/></Accordion>
    </div>
</div>

<script lang="ts">
	import Accordion from "$lib/components/AccordionItem.svelte";
    import Header from "./_Header.svelte";
	import A from "./A.svelte";
    import B from "./B.svelte";

    const { currentTab }: { currentTab: string } = $props();
</script>

<div class="{currentTab === "L2" ? "" : "tw:hidden"}">
    <h1>DAFTAR KEPEMILIKAN</h1>
    <Header/>

    <div class="accordion tw:mt-5">
        <Accordion item={"A. DAFTAR PEMEGANG SAHAM/PEMILIK MODAL DAN JUMLAH DIVIDE/ PEMBAGIAN LABA YANG DIBAGIKAN SERTA DAFTAR SUSUNAN PENGURUS DAN KOMISARIS"}>
            <A></A>
        </Accordion>
        <Accordion item={"B. DAFTAR PENYERTAAN MODAL, UTANG, DAN/ATAU PIUTANG PADA PERUSAHAAN AFILIASI"}>
            <B></B>
        </Accordion>
    </div>
</div>
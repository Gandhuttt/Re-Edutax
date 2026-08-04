<script lang="ts">
	import Accordion from "$lib/components/AccordionItem.svelte";
	import A from "./A.svelte";
    import B from "./B.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    const { currentTab = $bindable() }: Props = $props();
    $effect(() => {currentTab.title = currentTab.tab === "L3" ? "DAFTAR PAJAK PENGHASILAN YANG DIPOTONG/ DIPUNGUT OLEH PIHAK LAIN" : currentTab.title});
</script>

<div class="{currentTab.tab === "L3" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. DAFTAR PEMEGANG SAHAM/PEMILIK MODAL DAN JUMLAH DIVIDE/ PEMBAGIAN LABA YANG DIBAGIKAN SERTA DAFTAR SUSUNAN PENGURUS DAN KOMISARIS"}>
            <A></A>
        </Accordion>
        <Accordion item={"B. DAFTAR PENYERTAAN MODAL, UTANG, DAN/ATAU PIUTANG PADA PERUSAHAAN AFILIASI"}>
            <B></B>
        </Accordion>
    </div>
</div>
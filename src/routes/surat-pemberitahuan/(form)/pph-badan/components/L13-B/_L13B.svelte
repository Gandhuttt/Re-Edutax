<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import D from "./D.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L13-B" ? "DAFTAR TAMBAHAN PENGURANGAN PENGHASILAN BRUTO" : currentTab.title})
</script>

<div class="{currentTab.tab === "L13-B" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETENSI TERTENTU"}>
            <A></A>
        </Accordion>
        <Accordion item={"B. REKAPITULASI BIAYA KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETNESI TERTENTU"}>
            <B></B>
        </Accordion>
        <Accordion item={"C. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK PENELITIAN DAN PENGEMBANGAN"}>
            <C></C>
        </Accordion>
        <Accordion item={"D. PENGHITUNGAN TAMBAHAN PENGURANG PENGHASILAN BRUTO"}>
            <D></D>
        </Accordion>
    </div>
</div>
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

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L5" ? "REKAPITULASI PEREDARAN BRUTO" : currentTab.title})
</script>

<div class="{currentTab.tab === "L5" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. ALAMAT TEMPAT KEGIATAN USAHA:"}>
            <A/>
        </Accordion>
        <Accordion item={"B. REKAPITULASI PEREDARAN BRUTO DAN PPh YANG TELAH DIBAYAR:"}>
            <B/>
        </Accordion>
    </div>
</div>
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

    $effect(() => {currentTab.title = currentTab.tab === "L4" ? "PENGHASILAN YANG DIKENAKAN PAJAK FINAL DAN DAFTAR PENGHASILAN YANG BUKAN OBJEK PAJAK" : currentTab.title})
</script>

<div class="{currentTab.tab === "L4" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL"}>
            <A></A>
        </Accordion>
        <Accordion item={"B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK"}>
            <B></B>
        </Accordion>
    </div>
</div>
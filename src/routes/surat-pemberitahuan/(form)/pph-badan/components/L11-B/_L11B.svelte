<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import I from "./I.svelte";
    import II from "./II.svelte";
    import III from "./III.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L11-B" ? "PENGHITUNGAN BIAYA PINJAMAN YANG DAPAT DIBEBANKAN UNTUK KEPERLUAR PENGHITUNGAN PAJAK PENGHASILAN" : currentTab.title})
</script>

<div class="{currentTab.tab === "L11-B" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"I. PERHITUNGAN EBITDA"}>
            <I/>
        </Accordion>
        <Accordion item={"II. PERBANDINGAN ANTARA UTANG DAN MODAL (DEBT TO EQUITY RATIO)"}>
            <II/>
        </Accordion>
        <Accordion item={"III. PENGHITUNGAN BIAYA PINJAMAN"}>
            <III/>
        </Accordion>
    </div>
</div>

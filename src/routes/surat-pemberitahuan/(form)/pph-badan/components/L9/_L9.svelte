<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Card from "$lib/components/Card.svelte";
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
    
    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L9" ? "DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL" : currentTab.title})
</script>

<div class="{currentTab.tab === "L9" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"HARTA BERWUJUD"}>
            <A></A>
        </Accordion>
        <Accordion item={"BANGUNAN"}>
            <B></B>
        </Accordion>
        <Accordion item={"HARTA TIDAK BERWUJUD"}>
            <C></C>
        </Accordion>
    </div>
</div>

<ModalEdit/>